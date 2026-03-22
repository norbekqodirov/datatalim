/**
 * Instagram AI Analytics Engine — Matematik algoritmlar
 * D:\Project\data-stat\instagram-platform\lib\analyticsEngine.ts dan portlangan
 */

export const avg = (arr) => arr.length ? arr.reduce((s, v) => s + v, 0) / arr.length : 0;
export const median = (arr) => {
    if (!arr.length) return 0;
    const s = [...arr].sort((a, b) => a - b);
    return s.length % 2 ? s[Math.floor(s.length / 2)] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2;
};
export const stdDev = (arr) => {
    if (arr.length < 2) return 0;
    const m = avg(arr);
    return Math.sqrt(avg(arr.map(v => (v - m) ** 2)));
};
export const pctChange = (a, b) => b !== 0 ? +(((a - b) / b) * 100).toFixed(1) : 0;

export const linReg = (values) => {
    const n = values.length;
    if (n === 0) return { slope: 0, intercept: 0, r2: 0 };
    if (n === 1) return { slope: 0, intercept: values[0], r2: 0 };
    const sx = (n * (n - 1)) / 2;
    const sy = values.reduce((s, v) => s + v, 0);
    const sxy = values.reduce((s, v, i) => s + i * v, 0);
    const sx2 = (n * (n - 1) * (2 * n - 1)) / 6;
    const denom = n * sx2 - sx ** 2;
    if (denom === 0) return { slope: 0, intercept: sy / n, r2: 0 };
    const slope = (n * sxy - sx * sy) / denom;
    const intercept = (sy - slope * sx) / n;
    const predicted = values.map((_, i) => intercept + slope * i);
    const ssRes = values.reduce((s, v, i) => s + (v - predicted[i]) ** 2, 0);
    const ssTot = values.reduce((s, v) => s + (v - avg(values)) ** 2, 0);
    const r2 = ssTot ? +(1 - ssRes / ssTot).toFixed(4) : 0;
    return { slope, intercept, r2 };
};

export function scorePost(post, allPosts) {
    const avgReach = avg(allPosts.map(p => p.reach || 0));
    const avgER = avg(allPosts.map(p => parseFloat(p.engagementRate || p.er || 0)));
    const avgSaves = avg(allPosts.map(p => p.saved || p.estimatedSaves || 0));
    const avgComments = avg(allPosts.map(p => p.comments_count || 0));

    const reachScore = Math.min(40, ((post.reach || 0) / (avgReach || 1)) * 20);
    const erScore = Math.min(30, (parseFloat(post.engagementRate || post.er || 0) / (avgER || 1)) * 15);
    const savesScore = Math.min(20, ((post.saved || post.estimatedSaves || 0) / (avgSaves || 1)) * 10);
    const commentsScore = Math.min(10, ((post.comments_count || 0) / (avgComments || 1)) * 5);

    const score = Math.round(reachScore + erScore + savesScore + commentsScore);
    const grade = score >= 85 ? 'A+' : score >= 75 ? 'A' : score >= 65 ? 'B' : score >= 55 ? 'C' : score >= 40 ? 'D' : 'F';

    const strengths = [];
    const weaknesses = [];
    if ((post.reach || 0) > avgReach * 1.5) strengths.push('Juda yuqori reach');
    else if ((post.reach || 0) < avgReach * 0.5) weaknesses.push('Reach past');
    if (parseFloat(post.engagementRate || post.er || 0) > avgER * 1.5) strengths.push('Yuqori engagement');
    else if (parseFloat(post.engagementRate || post.er || 0) < avgER * 0.5) weaknesses.push('Engagement past');
    if ((post.saved || post.estimatedSaves || 0) > avgSaves * 1.5) strengths.push("Ko'p saqlangan");
    if ((post.comments_count || 0) > avgComments * 2) strengths.push('Faol muhokama');

    return { score, grade, strengths, weaknesses };
}

export function compareContentTypes(posts) {
    const types = ['IMAGE', 'VIDEO', 'CAROUSEL_ALBUM'];
    const results = types.map(type => {
        const filtered = posts.filter(p => p.media_type === type);
        if (!filtered.length) return null;
        return {
            type,
            label: type === 'IMAGE' ? 'Rasm' : type === 'VIDEO' ? 'Video/Reel' : 'Carousel',
            count: filtered.length,
            avgReach: Math.round(avg(filtered.map(p => p.reach || 0))),
            avgER: +avg(filtered.map(p => parseFloat(p.engagementRate || p.er || 0))).toFixed(2),
            avgSaves: Math.round(avg(filtered.map(p => p.saved || p.estimatedSaves || 0))),
            avgComments: Math.round(avg(filtered.map(p => p.comments_count || 0))),
            avgLikes: Math.round(avg(filtered.map(p => p.like_count || 0))),
        };
    }).filter(Boolean);

    const bestByReach = [...results].sort((a, b) => b.avgReach - a.avgReach)[0];
    const baseReach = results.find(r => r.type === 'IMAGE')?.avgReach || 1;

    return {
        types: results.map(r => ({ ...r, reachMultiplier: +(r.avgReach / (baseReach || 1)).toFixed(1) })),
        bestType: bestByReach?.type,
        recommendation: bestByReach
            ? `${bestByReach.label} postlar sizda boshqalardan ${(bestByReach.avgReach / (baseReach || 1)).toFixed(1)}x ko'proq reach bermoqda`
            : "Yetarli ma'lumot yo'q",
    };
}

const TIMEZONE_OFFSET = 5;
function getLocalHour(timestamp) {
    const date = new Date(timestamp);
    return ((date.getUTCHours() + TIMEZONE_OFFSET) % 24 + 24) % 24;
}
function getLocalDay(timestamp) {
    const date = new Date(timestamp);
    const localHour = date.getUTCHours() + TIMEZONE_OFFSET;
    let day = date.getUTCDay();
    if (localHour >= 24) day = (day + 1) % 7;
    else if (localHour < 0) day = (day + 6) % 7;
    return day;
}

export function getBestPostingTime(posts) {
    const matrix = Array(7).fill(null).map(() => Array(24).fill(0));
    const counts = Array(7).fill(null).map(() => Array(24).fill(0));

    posts.forEach(post => {
        if (!post.timestamp) return;
        const day = getLocalDay(post.timestamp);
        const hour = getLocalHour(post.timestamp);
        const er = parseFloat(post.engagementRate || post.er || 0);
        matrix[day][hour] += er;
        counts[day][hour]++;
    });

    const heatmap = matrix.map((row, d) => row.map((sum, h) => counts[d][h] ? +(sum / counts[d][h]).toFixed(2) : 0));
    const slots = [];
    heatmap.forEach((row, d) => {
        row.forEach((er, h) => {
            if (counts[d][h] >= 2) slots.push({ day: d, hour: h, avgER: er, count: counts[d][h] });
        });
    });
    slots.sort((a, b) => b.avgER - a.avgER);

    const days = ['Yakshanba', 'Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba'];
    return {
        heatmap,
        topSlots: slots.slice(0, 5).map(s => ({
            ...s, dayName: days[s.day],
            timeLabel: `${String(s.hour).padStart(2, '0')}:00–${String(s.hour + 1).padStart(2, '0')}:00`,
        })),
        recommendation: slots[0]
            ? `Eng yaxshi vaqt: ${days[slots[0].day]} ${String(slots[0].hour).padStart(2, '0')}:00 — o'rtacha ER ${slots[0].avgER}%`
            : "Yetarli ma'lumot yo'q",
    };
}

export function diagnoseReachDrop(posts, stories = []) {
    if (!posts || posts.length < 5) return { detected: false, msg: "Yetarli ma'lumot yo'q (kamida 5 ta post kerak)" };

    const now = Date.now();
    const day30 = 30 * 24 * 3600 * 1000;
    const recent = posts.filter(p => now - new Date(p.timestamp).getTime() <= day30);
    const older = posts.filter(p => { const age = now - new Date(p.timestamp).getTime(); return age > day30 && age <= day30 * 2; });

    if (!older.length || !recent.length) return { detected: false, msg: "Solishtirish uchun yetarli ma'lumot yo'q" };

    const recentAvgReach = avg(recent.map(p => p.reach || 0));
    const olderAvgReach = avg(older.map(p => p.reach || 0));
    const dropPct = pctChange(recentAvgReach, olderAvgReach);

    if (dropPct >= 0) return { detected: false, dropPercent: dropPct, msg: "Qamrov tushmagan, aksincha yaxshi!" };

    const causes = [];
    const postFreqChange = pctChange(recent.length, older.length);
    if (postFreqChange < -20) causes.push({ reason: 'Post soni kamaygan', impact: 'yuqori', detail: `Oldingi 30 kunda ${older.length} ta, oxirgi ${recent.length} ta`, weight: Math.abs(postFreqChange) * 0.4, solution: 'Haftasiga kamida 4-5 ta post rejalashtiring' });

    const recentER = avg(recent.map(p => parseFloat(p.engagementRate || p.er || 0)));
    const olderER = avg(older.map(p => parseFloat(p.engagementRate || p.er || 0)));
    const erDrop = pctChange(recentER, olderER);
    if (erDrop < -15) causes.push({ reason: 'Kontent sifati pasaygan', impact: erDrop < -30 ? 'yuqori' : "o'rta", detail: `ER: ${olderER.toFixed(1)}% → ${recentER.toFixed(1)}%`, weight: Math.abs(erDrop) * 0.35, solution: "Eng yuqori baho olgan (A/A+) postlaringiz formatiga qayting" });

    const recentVideoRatio = recent.filter(p => p.media_type === 'VIDEO').length / recent.length;
    const olderVideoRatio = older.filter(p => p.media_type === 'VIDEO').length / older.length;
    if (olderVideoRatio - recentVideoRatio > 0.15) causes.push({ reason: 'Video/Reel ulushi kamaygan', impact: "o'rta", detail: `Video ulushi: ${(olderVideoRatio * 100).toFixed(0)}% → ${(recentVideoRatio * 100).toFixed(0)}%`, weight: (olderVideoRatio - recentVideoRatio) * 30, solution: "Haftalik contentning 50-60% ini Reel formatida qiling" });

    if (stories.length < 3) causes.push({ reason: "Stories juda kam", impact: 'past', detail: 'Oxirgi 24 soatda 3 tadan kam stories', weight: 10, solution: "Kuniga 3-5 ta stories: so'rovnoma, savol, kundalik" });

    causes.sort((a, b) => b.weight - a.weight);
    const mainCause = causes[0];

    return {
        detected: true,
        dropPercent: Math.abs(dropPct),
        period: { recent: recent.length, older: older.length },
        recentAvgReach: Math.round(recentAvgReach),
        olderAvgReach: Math.round(olderAvgReach),
        causes,
        mainCause: mainCause?.reason || 'Aniqlanmadi',
        solution: mainCause?.solution || "Kontent strategiyangizni qayta ko'rib chiqing",
    };
}

export function analyzeTrend(posts) {
    if (!posts.length) return { metrics: [], overall: 'stable', summary: "Ma'lumot yo'q" };
    const now = Date.now();
    const day30 = 30 * 24 * 3600 * 1000;
    const recent = posts.filter(p => { const age = now - new Date(p.timestamp).getTime(); return age >= 0 && age <= day30; });
    const previous = posts.filter(p => { const age = now - new Date(p.timestamp).getTime(); return age > day30 && age <= day30 * 2; });

    const currReach = recent.reduce((sum, p) => sum + (p.reach || 0), 0);
    const prevReach = previous.reduce((sum, p) => sum + (p.reach || 0), 0);
    const currER = avg(recent.map(p => parseFloat(p.engagementRate || p.er || 0)));
    const prevER = avg(previous.map(p => parseFloat(p.engagementRate || p.er || 0)));
    const currSaves = recent.reduce((sum, p) => sum + (p.saved || p.estimatedSaves || 0), 0);
    const prevSaves = previous.reduce((sum, p) => sum + (p.saved || p.estimatedSaves || 0), 0);
    const currComments = recent.reduce((sum, p) => sum + (p.comments_count || 0), 0);
    const prevComments = previous.reduce((sum, p) => sum + (p.comments_count || 0), 0);

    const reachChange = pctChange(currReach, prevReach);
    const erChange = pctChange(currER, prevER);
    const savesChange = pctChange(currSaves, prevSaves);
    const commentsChange = pctChange(currComments, prevComments);
    const overall = (reachChange > 0 && erChange > -5) ? 'growing' : (reachChange < -10 ? 'declining' : 'stable');

    return {
        metrics: [
            { name: 'Umumiy Qamrov', current: currReach, previous: prevReach, change: reachChange, trend: reachChange > 0 ? 'up' : 'down' },
            { name: "O'rtacha ER", current: +currER.toFixed(2), previous: +prevER.toFixed(2), change: erChange, trend: erChange > 0 ? 'up' : 'down' },
            { name: 'Jami Saves', current: currSaves, previous: prevSaves, change: savesChange, trend: savesChange > 0 ? 'up' : 'down' },
            { name: 'Jami Izohlar', current: currComments, previous: prevComments, change: commentsChange, trend: commentsChange > 0 ? 'up' : 'down' },
        ],
        overall,
        postCounts: { recent: recent.length, previous: previous.length },
        summary: overall === 'growing' ? "O'sish sur'ati yaxshi ketmoqda 📈" : overall === 'declining' ? "Pasayish kuzatilmoqda 📉" : "Holat barqaror ➡️"
    };
}

export function predictFollowerGrowth(posts, currentFollowers) {
    const reachValues = posts.slice(0, 30).map(p => p.reach || 0);
    // Polynomial regression (degree 2) — linReg'dan aniqroq
    const poly = polyReg(reachValues, 2);
    const lin = linReg(reachValues);
    const r2 = poly.r2;

    const avgReachPerPost = avg(reachValues);
    const postFreq = posts.length / 30 || 1;
    const dailyGrowth = (avgReachPerPost * 0.005) * postFreq;

    // Residual std dev for confidence interval (±1.96 × residual_std)
    const residualStd = reachValues.length > 2
        ? stdDev(reachValues.map((v, i) => v - (poly.predict ? poly.predict(i) : (lin.intercept + lin.slope * i))))
        : avgReachPerPost * 0.2;
    const ciHalfWidth = 1.96 * (residualStd * 0.005 * postFreq);

    const chartData = [];
    for (let i = -30; i <= 90; i++) {
        const d = new Date();
        d.setDate(d.getDate() + i);
        const predicted = Math.round(currentFollowers + i * dailyGrowth);
        chartData.push({
            day: d.toISOString().split('T')[0],
            actual: i <= 0 ? Math.round(currentFollowers + i * dailyGrowth) : null,
            predicted,
            predictedLower: i > 0 ? Math.round(predicted - ciHalfWidth * Math.sqrt(i)) : null,
            predictedUpper: i > 0 ? Math.round(predicted + ciHalfWidth * Math.sqrt(i)) : null,
        });
    }

    return {
        currentCount: currentFollowers,
        predicted30: Math.round(currentFollowers + 30 * dailyGrowth),
        predicted60: Math.round(currentFollowers + 60 * dailyGrowth),
        predicted90: Math.round(currentFollowers + 90 * dailyGrowth),
        dailyGrowthRate: +dailyGrowth.toFixed(1),
        chartData,
        r2,
        degree: 2,
        confidence: r2 > 0.6 ? 'yuqori' : r2 > 0.3 ? "o'rta" : 'past',
    };
}

// ============================================================
// KENGAYTIRILGAN ALGORITMLAR — Professional Analytics Engine
// ============================================================

/**
 * Exponential Moving Average — trend silliqlashtirish
 * @param {number[]} values - ketma-ket qiymatlar
 * @param {number} alpha - silliqlashtirish koeffitsiyenti (0<α≤1)
 */
export function calcEMA(values, alpha = 0.3) {
    if (!values.length) return [];
    const ema = [values[0]];
    for (let i = 1; i < values.length; i++) {
        ema.push(alpha * values[i] + (1 - alpha) * ema[i - 1]);
    }
    return ema.map(v => +v.toFixed(2));
}

/**
 * Z-score asosida anomaliyalarni aniqlash (viral yoki shadow-ban)
 * @param {number[]} values
 * @param {number} threshold - z-score chegarasi (odatda 2.0)
 */
export function detectAnomalies(values, threshold = 2.0) {
    if (values.length < 3) return [];
    const m = avg(values);
    const s = stdDev(values);
    if (s === 0) return [];
    return values.reduce((acc, v, i) => {
        const z = (v - m) / s;
        if (Math.abs(z) > threshold) {
            acc.push({ index: i, value: v, z: +z.toFixed(2), type: z > 0 ? 'high' : 'low' });
        }
        return acc;
    }, []);
}

/**
 * Polynomial regression (degree 2 yoki 3) — Gaussian elimination orqali
 * linReg'dan aniqroq prognoz beradi
 * @param {number[]} values - y qiymatlari (x = indeks)
 * @param {number} degree - polinom darajasi (2 yoki 3)
 */
export function polyReg(values, degree = 2) {
    const n = values.length;
    if (n === 0) return { coeffs: [0], predict: () => 0, r2: 0 };
    if (n <= degree) return { ...linReg(values), predict: (x) => { const { slope, intercept } = linReg(values); return intercept + slope * x; }, coeffs: [] };

    const d = degree + 1;
    // Vandermonde matrix building
    const A = Array.from({ length: d }, (_, r) =>
        Array.from({ length: d + 1 }, (_, c) => {
            if (c === d) return values.reduce((s, v, i) => s + v * Math.pow(i, r), 0);
            return Array.from({ length: n }, (__, i) => Math.pow(i, r + c)).reduce((s, v) => s + v, 0);
        })
    );

    // Gaussian elimination
    for (let col = 0; col < d; col++) {
        let maxRow = col;
        for (let row = col + 1; row < d; row++) {
            if (Math.abs(A[row][col]) > Math.abs(A[maxRow][col])) maxRow = row;
        }
        [A[col], A[maxRow]] = [A[maxRow], A[col]];
        if (Math.abs(A[col][col]) < 1e-10) continue;
        for (let row = 0; row < d; row++) {
            if (row === col) continue;
            const factor = A[row][col] / A[col][col];
            for (let c = col; c <= d; c++) A[row][c] -= factor * A[col][c];
        }
    }
    const coeffs = A.map((row, i) => Math.abs(A[i][i]) > 1e-10 ? row[d] / A[i][i] : 0);

    const predict = (x) => coeffs.reduce((s, c, i) => s + c * Math.pow(x, i), 0);
    const predicted = values.map((_, i) => predict(i));
    const ssRes = values.reduce((s, v, i) => s + (v - predicted[i]) ** 2, 0);
    const ssTot = values.reduce((s, v) => s + (v - avg(values)) ** 2, 0);
    const r2 = ssTot ? +(1 - ssRes / ssTot).toFixed(4) : 0;

    return { coeffs, predict, r2 };
}

/**
 * Pearson korrelyatsiya koeffitsienti
 * @param {number[]} xs
 * @param {number[]} ys
 */
export function pearsonCorr(xs, ys) {
    const n = Math.min(xs.length, ys.length);
    if (n < 3) return { r: 0, r2: 0, interpretation: "Yetarli ma'lumot yo'q" };
    const mx = avg(xs.slice(0, n));
    const my = avg(ys.slice(0, n));
    const num = xs.slice(0, n).reduce((s, x, i) => s + (x - mx) * (ys[i] - my), 0);
    const den = Math.sqrt(
        xs.slice(0, n).reduce((s, x) => s + (x - mx) ** 2, 0) *
        ys.slice(0, n).reduce((s, y) => s + (y - my) ** 2, 0)
    );
    const r = den ? +(num / den).toFixed(3) : 0;
    const absR = Math.abs(r);
    const interpretation = absR > 0.7
        ? (r > 0 ? "Kuchli musbat bog'liqlik" : "Kuchli manfiy bog'liqlik")
        : absR > 0.4
            ? (r > 0 ? "O'rta darajali bog'liqlik" : "O'rta darajali teskari bog'liqlik")
            : "Zaif yoki bog'liqlik yo'q";
    return { r, r2: +(r * r).toFixed(3), interpretation };
}

/**
 * Kunlik mavsumiy indeks (multiplicative decomposition)
 * 7 kunlik harakatlanuvchi o'rtacha asosida
 * @param {object[]} posts - timestamp va reach mavjud postlar
 */
export function calcSeasonalIndex(posts) {
    if (posts.length < 7) return { dayIndex: new Array(7).fill(1), bestDay: 1, labels: [] };
    const days = ['Yakshanba', 'Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba'];
    const sorted = [...posts].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    const reaches = sorted.map(p => p.reach || 0);

    // 7-kunlik harakatlanuvchi o'rtacha
    const ma7 = reaches.map((_, i) => {
        const start = Math.max(0, i - 3);
        const end = Math.min(reaches.length - 1, i + 3);
        const window = reaches.slice(start, end + 1);
        return avg(window);
    });

    // Har kunlik nisbat
    const dayRatios = Array(7).fill(null).map(() => []);
    sorted.forEach((p, i) => {
        const dayNum = new Date(p.timestamp).getDay();
        const ratio = ma7[i] ? (reaches[i] / ma7[i]) : 1;
        dayRatios[dayNum].push(ratio);
    });

    const dayIndex = dayRatios.map(ratios => ratios.length ? +avg(ratios).toFixed(3) : 1);
    const bestDay = dayIndex.indexOf(Math.max(...dayIndex));

    return {
        dayIndex,
        bestDay,
        labels: days.map((d, i) => ({ day: d, index: dayIndex[i], above: dayIndex[i] >= 1 })),
    };
}

/**
 * Kontent velocity — post qanchalik tez o'sganini o'lchaydi
 * @param {object[]} posts - like_count va timestamp mavjud
 */
export function calcVelocityScores(posts) {
    const now = Date.now();
    const scored = posts.map(p => {
        const hoursOld = (now - new Date(p.timestamp).getTime()) / 3600000;
        const velocity = (p.like_count || 0) / Math.max(hoursOld, 2);
        return { id: p.id, velocity: +velocity.toFixed(2), timestamp: p.timestamp };
    });
    const sorted = [...scored].sort((a, b) => b.velocity - a.velocity);
    return sorted.map((s, i) => ({ ...s, rank: i + 1 }));
}

/**
 * Audience retention koeffitsienti — saves/reach nisbati
 */
export function retentionCoeff(post) {
    const reach = post.reach || 1;
    return +((post.saved || post.estimatedSaves || 0) / reach).toFixed(4);
}

/**
 * Viral koeffitsiyent — qamrov followers sonidan qanchalik oshib ketgan
 */
export function viralCoeff(post, followers) {
    if (!post.reach || !followers) return 0;
    return +((post.reach - followers) / post.reach).toFixed(3);
}

/**
 * 3 ta muhim korrelyatsiyani bir vaqtda hisoblash
 * @param {object[]} posts
 */
export function analyzeCorrelations(posts) {
    if (posts.length < 5) return {
        captionLengthVsReach: { r: 0, r2: 0, interpretation: "Yetarli ma'lumot yo'q" },
        hourVsER: { r: 0, r2: 0, interpretation: "Yetarli ma'lumot yo'q" },
        hashtagCountVsReach: { r: 0, r2: 0, interpretation: "Yetarli ma'lumot yo'q" },
        captionBuckets: [],
    };

    const captionLengths = posts.map(p => (p.caption || '').length);
    const reaches = posts.map(p => p.reach || 0);
    const hours = posts.map(p => p.timestamp ? getLocalHour(p.timestamp) : 12);
    const ers = posts.map(p => parseFloat(p.engagementRate || p.er || 0));
    const hashtagCounts = posts.map(p => ((p.caption || '').match(/#\w+/g) || []).length);

    // Caption uzunligi bo'yicha 4 bucket
    const buckets = [
        { label: '0-50', min: 0, max: 50 },
        { label: '51-150', min: 51, max: 150 },
        { label: '151-300', min: 151, max: 300 },
        { label: '300+', min: 300, max: Infinity },
    ].map(b => {
        const filtered = posts.filter(p => {
            const len = (p.caption || '').length;
            return len >= b.min && len <= b.max;
        });
        return {
            label: b.label,
            count: filtered.length,
            avgReach: filtered.length ? Math.round(avg(filtered.map(p => p.reach || 0))) : 0,
        };
    });

    return {
        captionLengthVsReach: pearsonCorr(captionLengths, reaches),
        hourVsER: pearsonCorr(hours, ers),
        hashtagCountVsReach: pearsonCorr(hashtagCounts, reaches),
        captionBuckets: buckets,
    };
}

// Ta'lim sohasi benchmark ko'rsatkichlari
export const EDUCATION_BENCHMARKS = {
    er: 4.5,
    avgReach: 1200,
    savesRate: 0.03,
    label: "Ta'lim sohasi o'rtachasi",
};

export function getGradeDistribution(posts) {
    const graded = posts.map(p => scorePost(p, posts));
    const dist = { 'A+': 0, 'A': 0, 'B': 0, 'C': 0, 'D': 0, 'F': 0 };
    graded.forEach(g => { dist[g.grade] = (dist[g.grade] || 0) + 1; });
    return { distribution: dist, total: posts.length, avgScore: Math.round(avg(graded.map(g => g.score))) };
}

export function generateInsights(posts, stories = []) {
    if (!posts.length) return [];
    const recommendations = [];

    const trend = analyzeTrend(posts);
    if (trend.overall === 'declining') {
        const drop = diagnoseReachDrop(posts, stories);
        recommendations.push({ id: 1, priority: 'critical', category: 'content', title: 'Qamrov Keskin Tushgan', detail: drop.mainCause || 'Qamrov pasaygan', action: drop.solution || 'Kontentni yaxshilang' });
    }

    const content = compareContentTypes(posts);
    if (content.bestType) {
        recommendations.push({ id: 2, priority: 'high', category: 'engagement', title: `${content.types.find(t => t.type === content.bestType)?.label || content.bestType} formatida ko'proq chiqaring`, detail: content.recommendation, action: `Keyingi strategiyada ${content.bestType === 'VIDEO' ? 'Reel' : content.bestType} qatnashsin` });
    }

    const timing = getBestPostingTime(posts);
    if (timing.topSlots.length > 0) {
        recommendations.push({ id: 3, priority: 'medium', category: 'timing', title: "Eng zo'r posting vaqti", detail: timing.recommendation, action: "Jadval qilib postlarni shu vaqtga rejalashtiring" });
    }

    const avgER = avg(posts.map(p => parseFloat(p.engagementRate || p.er || 0)));
    if (avgER < 3) {
        recommendations.push({ id: 4, priority: 'high', category: 'engagement', title: 'Engagement Rate yetarli emas', detail: `O'rtacha ER: ${avgER.toFixed(1)}% — bu past ko'rsatkich`, action: "Call-to-action (savol, so'rovnoma) qo'shing, kommentlarga javob bering" });
    }

    const videoRatio = posts.filter(p => p.media_type === 'VIDEO').length / posts.length;
    if (videoRatio < 0.4) {
        recommendations.push({ id: 5, priority: 'medium', category: 'content', title: "E'tiborni VIDEO ga qarating", detail: `Kontentning kamida 50% ni Reels formatida qilishni tavsiya etamiz. Hozir: ${(videoRatio * 100).toFixed(0)}%`, action: "Haftalik kontent rejasida 3-4 ta Reel bo'lsin" });
    }

    return recommendations;
}
