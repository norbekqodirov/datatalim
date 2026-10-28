export const FB_PIXEL_ID = import.meta.env.VITE_FB_PIXEL_ID || '1177610010373853'; // Replace with real ID if needed later

// Types for Facebook Pixel window object
declare global {
    interface Window {
        fbq: any;
        _fbq: any;
    }
}

const FB_SCRIPT_SRC = 'https://connect.facebook.net/en_US/fbevents.js';
// Skript yuklanishining eng kech vaqti (load'dan keyin), agar foydalanuvchi hech narsa bosmasa
const FB_LOAD_FALLBACK_MS = 3500;

let scriptRequested = false;

/** fbevents.js (~425 kB) ni yuklaydi. Navbatdagi (queue) hodisalarni skript o'zi yuboradi. */
const loadPixelScript = () => {
    if (scriptRequested) return;
    scriptRequested = true;
    const fbScript = document.createElement('script');
    fbScript.async = true;
    fbScript.src = FB_SCRIPT_SRC;
    const firstScript = document.getElementsByTagName('script')[0];
    if (firstScript && firstScript.parentNode) {
        firstScript.parentNode.insertBefore(fbScript, firstScript);
    } else {
        document.head.appendChild(fbScript);
    }
};

/**
 * Skript yuklashni kechiktiradi: birinchi o'zaro ta'sir (scroll/click/key/touch) YOKI
 * sahifa 'load' + bo'sh vaqt (idle) — qaysi biri oldin bo'lsa. Shu paytgacha fbq() chaqiruvlari
 * (init, PageView, Lead ...) stub'ning navbatida (queue) saqlanadi, hech narsa yo'qolmaydi.
 */
const scheduleLoad = () => {
    const events = ['pointerdown', 'keydown', 'scroll', 'touchstart'] as const;
    let fallbackTimer: number | undefined;

    const go = () => {
        events.forEach((e) => window.removeEventListener(e, go));
        if (fallbackTimer) window.clearTimeout(fallbackTimer);
        loadPixelScript();
    };
    events.forEach((e) => window.addEventListener(e, go, { once: true, passive: true }));

    const afterLoad = () => {
        // Asosiy kontent chizilgandan keyin, bo'sh vaqtda; kafolat sifatida taymer
        fallbackTimer = window.setTimeout(go, FB_LOAD_FALLBACK_MS);
    };
    if (document.readyState === 'complete') afterLoad();
    else window.addEventListener('load', afterLoad, { once: true });
};

/**
 * Inits the Facebook Pixel: fbq stub + 'init' darhol, fbevents.js esa kechiktirib yuklanadi.
 */
export const initPixel = () => {
    if (typeof window === 'undefined') return;
    captureAttribution();
    installContactListener();
    // Prevent double initialization
    if (window.fbq) return;

    const f = window as any;
    const n: any = f.fbq = function () {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
    };
    if (!f._fbq) f._fbq = n;
    n.push = n;
    n.loaded = !0;
    n.version = '2.0';
    n.queue = [];

    // Init the pixel with the ID (navbatga tushadi, skript yuklangach bajariladi)
    window.fbq('init', FB_PIXEL_ID);

    scheduleLoad();
};

/**
 * Tracks a standard or custom event. Skript hali yuklanmagan bo'lsa ham hodisa navbatda
 * saqlanadi va yuklangach yuboriladi.
 * @param eventName E.g., 'PageView', 'Lead', 'Contact'
 * @param data Optional data payload
 * @param eventId Ixtiyoriy eventID (Meta dedup / kelajakdagi Conversions API uchun)
 */
export const trackEvent = (eventName: string, data?: any, eventId?: string) => {
    if (typeof window === 'undefined') return;
    if (!window.fbq) initPixel();
    if (eventId) window.fbq('track', eventName, data || {}, { eventID: eventId });
    else window.fbq('track', eventName, data);
};

/** Hodisa identifikatori: crypto.randomUUID, bo'lmasa zaxira variant. */
export const newEventId = (): string => {
    try {
        if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID();
    } catch { /* eski brauzer */ }
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}${Math.random().toString(36).slice(2, 10)}`;
};

/** "1 200 000 so'm" -> 1200000. Raqam bo'lmasa (masalan, "Kelishiladi") null. */
export const parsePriceUZS = (raw?: string | null): number | null => {
    if (!raw) return null;
    const m = String(raw).match(/^[^\d]*([\d][\d\s.,]*)/);
    if (!m) return null;
    const n = Number(m[1].replace(/\D/g, ''));
    return Number.isFinite(n) && n > 0 ? n : null;
};

const safeSession = {
    get(k: string): string | null { try { return sessionStorage.getItem(k); } catch { return null; } },
    set(k: string, v: string) { try { sessionStorage.setItem(k, v); } catch { /* private rejim */ } },
};

/**
 * Lead hodisasi: har chaqiruvga eventID, narx ma'lum bo'lsa value/currency.
 * onceKey berilsa, bir sessiyada shu kalit bilan faqat bir marta yuboriladi (masalan, karyera testi).
 */
export const trackLead = (opts: { source: string; course?: string; value?: number | null; currency?: string; onceKey?: string }) => {
    if (opts.onceKey) {
        const key = `tracked_lead_${opts.onceKey}`;
        if (safeSession.get(key)) return;
        safeSession.set(key, '1');
    }
    const data: Record<string, unknown> = { source: opts.source };
    if (opts.course) { data.course = opts.course; data.content_name = opts.course; }
    if (opts.value && opts.value > 0) { data.value = opts.value; data.currency = opts.currency || 'UZS'; }
    trackEvent('Lead', data, newEventId());
};

// ---------------------------------------------------------------- Atribusiya (birinchi tegish)

const ATTR_KEY = 'dt_attribution';
const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'] as const;
type Attribution = Partial<Record<(typeof UTM_KEYS)[number] | 'fbclid', string>>;

const cleanParam = (v: string) => v.replace(/[\u0000-\u001f<>|]/g, ' ').trim().slice(0, 40);

/**
 * Landingdagi utm_* va fbclid ni sessionStorage'ga yozadi. Faqat birinchi tegish saqlanadi:
 * allaqachon yozilgan bo'lsa, keyingi sahifalardagi parametrlar ustiga yozmaydi.
 */
export const captureAttribution = () => {
    if (typeof window === 'undefined') return;
    try {
        if (sessionStorage.getItem(ATTR_KEY)) return;
        const sp = new URLSearchParams(window.location.search);
        const found: Attribution = {};
        [...UTM_KEYS, 'fbclid' as const].forEach((k) => {
            const raw = sp.get(k);
            const v = raw ? cleanParam(raw) : '';
            if (v) found[k] = v;
        });
        if (Object.keys(found).length) sessionStorage.setItem(ATTR_KEY, JSON.stringify(found));
    } catch { /* storage yo'q — atribusiyasiz davom etadi */ }
};

const readAttribution = (): Attribution => {
    try {
        const raw = sessionStorage.getItem(ATTR_KEY);
        return raw ? (JSON.parse(raw) as Attribution) : {};
    } catch { return {}; }
};

/**
 * Qisqa atribusiya satri, masalan "utm:instagram/cpc/kampaniya | fb" yoki "ref:abc123".
 * Server `sourceRef` ni faqat [A-Za-z0-9_-] (<=40) qabul qiladi va u Sheets tabini belgilaydi,
 * shuning uchun bu satr `courseId` oxiriga qo'shiladi (server uni 300 belgigacha saqlaydi).
 * `skipRef` — sourceRef allaqachon shu ref kod bo'lsa, qayta yozilmaydi.
 */
export const getAttributionTag = (skipRef?: string): string => {
    const a = readAttribution();
    const parts: string[] = [];
    if (a.utm_source || a.utm_medium || a.utm_campaign) {
        const slots = [a.utm_source, a.utm_medium, a.utm_campaign].map((x) => x || '-');
        if (a.utm_content) slots.push(`c=${a.utm_content}`);
        if (a.utm_term) slots.push(`t=${a.utm_term}`);
        parts.push(`utm:${slots.join('/')}`);
    }
    if (a.fbclid) parts.push('fb');
    try {
        const ref = sessionStorage.getItem('marketing_ref');
        if (ref && ref !== skipRef) parts.push(`ref:${cleanParam(ref)}`);
    } catch { /* ignore */ }
    return parts.join(' | ').slice(0, 110);
};

// ---------------------------------------------------------------- Contact (tel: / Telegram)

let contactListenerInstalled = false;

/** Butun saytda tel: va t.me havolalari bosilganda `Contact` yuboradi (bitta delegated listener). */
const installContactListener = () => {
    if (contactListenerInstalled || typeof document === 'undefined') return;
    contactListenerInstalled = true;
    document.addEventListener('click', (e) => {
        const target = e.target as Element | null;
        const a = target?.closest?.('a[href]') as HTMLAnchorElement | null;
        if (!a) return;
        const href = a.getAttribute('href') || '';
        if (/^tel:/i.test(href)) trackEvent('Contact', { method: 'phone', path: window.location.pathname });
        else if (/^https?:\/\/(?:www\.)?(?:t\.me|telegram\.me)\//i.test(href)) trackEvent('Contact', { method: 'telegram', path: window.location.pathname });
    }, { capture: true, passive: true });
};
