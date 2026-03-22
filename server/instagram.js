/**
 * Instagram Graph API Service — Cache-first strategy
 * D:\Project\data-stat\instagram-platform\lib\instagram.ts dan portlangan
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_VERSION = 'v19.0';
const BASE_URL = `https://graph.facebook.com/${API_VERSION}`;
const CACHE_DIR = path.join(__dirname, '../.ig_cache');
const CACHE_MAX_AGE_MS = 60 * 60 * 1000; // 1 soat

// Cache papkasini yaratish
if (!fs.existsSync(CACHE_DIR)) {
    try { fs.mkdirSync(CACHE_DIR, { recursive: true }); } catch (e) { }
}

function readLocalCache(key) {
    try {
        const file = path.join(CACHE_DIR, `${key}.json`);
        if (fs.existsSync(file)) return JSON.parse(fs.readFileSync(file, 'utf8'));
    } catch (e) { }
    return null;
}

function writeLocalCache(key, data) {
    try {
        const file = path.join(CACHE_DIR, `${key}.json`);
        fs.writeFileSync(file, JSON.stringify(data), 'utf8');
    } catch (e) { }
}

function isCacheFresh(key) {
    try {
        const file = path.join(CACHE_DIR, `${key}.json`);
        if (!fs.existsSync(file)) return false;
        const stat = fs.statSync(file);
        return (Date.now() - stat.mtimeMs) < CACHE_MAX_AGE_MS;
    } catch { return false; }
}

async function fetchInstagram(endpoint, token, cacheKey, forceRefresh = false) {
    if (cacheKey && !forceRefresh) {
        const cached = readLocalCache(cacheKey);
        if (cached) {
            if (isCacheFresh(cacheKey)) return cached;
            // Stale — orqa fonda yangilash
            const url = new URL(`${BASE_URL}${endpoint}`);
            url.searchParams.append('access_token', token);
            fetch(url.toString()).then(async (res) => {
                if (res.ok) { const data = await res.json(); writeLocalCache(cacheKey, data); }
            }).catch(() => { });
            return cached;
        }
    }

    const url = new URL(`${BASE_URL}${endpoint}`);
    url.searchParams.append('access_token', token);

    try {
        const res = await fetch(url.toString());
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error?.message || 'Instagram API Error');
        }
        const data = await res.json();
        if (cacheKey) writeLocalCache(cacheKey, data);
        return data;
    } catch (error) {
        if (cacheKey) {
            const fallback = readLocalCache(cacheKey);
            if (fallback) { console.warn(`[IG_CACHE] Fallback: ${cacheKey}`); return fallback; }
        }
        return { error: { code: 4, message: error.message } };
    }
}

async function batchFetch(items, batchSize = 3, delay = 500) {
    const results = [];
    for (let i = 0; i < items.length; i += batchSize) {
        const batch = items.slice(i, i + batchSize);
        const batchResults = await Promise.all(batch.map(fn => fn()));
        results.push(...batchResults);
        if (i + batchSize < items.length) await new Promise(r => setTimeout(r, delay));
    }
    return results;
}

export async function getAccountInfo(token, igId) {
    const endpoint = `/${igId}?fields=id,username,name,profile_picture_url,biography,followers_count,follows_count,media_count`;
    return fetchInstagram(endpoint, token, `account_info_${igId}`);
}

export async function getAccountInsights(token, igId, metric = 'reach', period = 'day', since, until) {
    let endpoint = `/${igId}/insights?metric=${metric}&period=${period}`;
    if (since) endpoint += `&since=${since}`;
    if (until) endpoint += `&until=${until}`;
    const res = await fetchInstagram(endpoint, token, `account_insights_${igId}_${metric}_${period}`);
    return res.data || [];
}

export async function getMedia(token, igId, limit = 20, after) {
    let endpoint = `/${igId}/media?fields=id,caption,media_type,media_url,permalink,timestamp,thumbnail_url,like_count,comments_count,play_count&limit=${limit}`;
    if (after) endpoint += `&after=${after}`;
    return fetchInstagram(endpoint, token, `media_page_${igId}_${after || 'first'}`);
}

export async function getStories(token, igId) {
    const endpoint = `/${igId}/stories?fields=id,media_type,media_url,timestamp`;
    try {
        const res = await fetchInstagram(endpoint, token);
        return res.data || [];
    } catch { return []; }
}

export async function getAudienceInsights(token, igId) {
    const baseEndpoint = `/${igId}/insights?metric=follower_demographics&period=lifetime&metric_type=total_value`;
    try {
        const [country, city, genderAge] = await Promise.all([
            fetchInstagram(`${baseEndpoint}&breakdown=country`, token).catch(() => ({ data: [] })),
            fetchInstagram(`${baseEndpoint}&breakdown=city`, token).catch(() => ({ data: [] })),
            fetchInstagram(`${baseEndpoint}&breakdown=age`, token).catch(() => ({ data: [] }))
        ]);
        return { country: country.data || [], city: city.data || [], genderAge: genderAge.data || [] };
    } catch { return { country: [], city: [], genderAge: [] }; }
}

export async function getAllMediaWithViews(token, igId, forceRefresh = false) {
    const accInfo = await getAccountInfo(token, igId);
    if (!accInfo?.username) return [];

    let allMedia = [];
    let nextCursor = undefined;
    const limit = 100;

    do {
        let mediaParams = `limit(${limit})`;
        if (nextCursor) mediaParams += `.after(${nextCursor})`;

        try {
            const apiEndpoint = `/${igId}?fields=business_discovery.username(${accInfo.username}){followers_count,media_count,media.${mediaParams}{id,caption,media_type,media_url,permalink,timestamp,thumbnail_url,comments_count,like_count,view_count,play_count}}`;
            const responseData = await fetchInstagram(apiEndpoint, token, `business_discovery_media_${igId}_${accInfo.username}_${nextCursor || 'first'}`, forceRefresh);
            const fetchedMedia = responseData.business_discovery?.media;
            if (fetchedMedia?.data) {
                allMedia = allMedia.concat(fetchedMedia.data);
                nextCursor = fetchedMedia.paging?.cursors?.after;
            } else {
                nextCursor = undefined;
            }
        } catch (e) {
            console.error('Business Discovery error:', e);
            break;
        }
        if (nextCursor) await new Promise(r => setTimeout(r, 200));
    } while (nextCursor);

    return allMedia;
}

export async function getMediaWithInsights(token, igId, limit = 50) {
    const rawMedia = await getAllMediaWithViews(token, igId);
    const mediaSlice = rawMedia.slice(0, limit);
    if (!mediaSlice.length) return [];

    const tasks = mediaSlice.map((post) => async () => {
        try {
            const insRes = await fetch(`${BASE_URL}/${post.id}/insights?metric=reach,saved&access_token=${token}`);
            const ins = await insRes.json();
            if (ins.error) return null;
            const reach = ins.data?.find(m => m.name === 'reach')?.values?.[0]?.value ?? 0;
            const saved = ins.data?.find(m => m.name === 'saved')?.values?.[0]?.value ?? 0;
            return { id: post.id, reach, saved };
        } catch { return null; }
    });

    const insightsResults = await batchFetch(tasks, 5, 400);
    const insightsMap = new Map();
    insightsResults.forEach(res => { if (res?.id) insightsMap.set(res.id, res); });

    return mediaSlice.map((post) => {
        const ins = insightsMap.get(post.id);
        const likes = post.like_count || 0;
        const comments = post.comments_count || 0;
        let reach = ins?.reach || 0;
        let saved = ins?.saved || 0;

        if (reach === 0 || reach < (likes + comments)) {
            const multiplier = post.media_type === 'VIDEO' ? 14 : post.media_type === 'CAROUSEL_ALBUM' ? 9 : 6;
            reach = Math.max((likes + comments) * multiplier, 10);
        }
        if (saved === 0) saved = Math.floor((likes + comments) * 0.04);

        const views = post.view_count || post.play_count || reach;
        const engagement = likes + comments + saved;
        const er = reach > 0 ? +((engagement / reach) * 100).toFixed(2) : 0;

        return {
            ...post, reach, saved, views, engagementRate: er, er,
            estimatedSaves: saved,
            estimatedShares: Math.floor((likes + comments) * (post.media_type === 'VIDEO' ? 0.05 : 0.01)),
            totalEngagements: likes + comments,
        };
    });
}

export function getMediaFromCache(igId) {
    try {
        const allMedia = [];
        const insightsMap = new Map();
        const files = fs.readdirSync(CACHE_DIR);

        for (const file of files) {
            if (file.startsWith('media_insights_') && file.endsWith('.json')) {
                try {
                    const raw = JSON.parse(fs.readFileSync(path.join(CACHE_DIR, file), 'utf8'));
                    const mediaId = file.replace('media_insights_', '').replace('.json', '');
                    if (raw?.data) {
                        const reach = raw.data.find(m => m.name === 'reach')?.values?.[0]?.value ?? 0;
                        const saved = raw.data.find(m => m.name === 'saved')?.values?.[0]?.value ?? 0;
                        insightsMap.set(mediaId, { reach, saved });
                    }
                } catch (_) { }
            }
        }

        for (const file of files) {
            if (file.startsWith('business_discovery_media_') && file.endsWith('.json')) {
                try {
                    const raw = JSON.parse(fs.readFileSync(path.join(CACHE_DIR, file), 'utf8'));
                    if (raw?.business_discovery?.media?.data) allMedia.push(...raw.business_discovery.media.data);
                } catch (_) { }
            }
        }

        const seen = new Set();
        const uniqueMedia = allMedia.filter(m => { if (!m.id || seen.has(m.id)) return false; seen.add(m.id); return true; });
        uniqueMedia.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

        return uniqueMedia.map((post) => {
            const ins = insightsMap.get(post.id);
            const likes = post.like_count || 0;
            const comments = post.comments_count || 0;
            const totalEngagements = likes + comments;
            let reach = ins?.reach || 0;
            let saved = ins?.saved || 0;
            const views = post.view_count || post.play_count || 0;

            if (reach === 0 || reach < totalEngagements) {
                if (views > 0) { reach = Math.round(views * 0.75); }
                else { reach = Math.max(totalEngagements * (post.media_type === 'CAROUSEL_ALBUM' ? 9 : 6), 10); }
            }
            if (views > 0 && reach > views) reach = views;
            if (saved === 0) saved = Math.floor(totalEngagements * 0.04);

            const engagement = totalEngagements + saved;
            const er = reach > 0 ? +((engagement / reach) * 100).toFixed(2) : 0;

            return {
                ...post, reach, saved,
                views: views > 0 ? views : reach,
                engagementRate: er, er,
                estimatedSaves: saved,
                estimatedShares: Math.floor(totalEngagements * (post.media_type === 'VIDEO' ? 0.05 : 0.01)),
                totalEngagements,
            };
        });
    } catch (e) {
        console.error('[getMediaFromCache]', e);
        return [];
    }
}

export function dateRange(days) {
    const until = Math.floor(Date.now() / 1000);
    const since = until - days * 24 * 3600;
    return { since, until };
}
