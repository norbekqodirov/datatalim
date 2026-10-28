export const FB_PIXEL_ID = import.meta.env.VITE_FB_PIXEL_ID || '1177610010373853'; // Replace with real ID if needed later

// Types for Facebook Pixel window object
declare global {
    interface Window {
        fbq: any;
        _fbq: any;
    }
}

const FB_SCRIPT_SRC = 'https://connect.facebook.net/en_US/fbevents.js';
// Skript yuklanishining eng kech vaqti (load'dan keyin), agar foydalanuvchi hech narsa bosmasa.
// Reklama trafigi (fbclid / utm_source) uchun kutilmaydi — skript darhol yuklanadi (initPixel).
const FB_LOAD_FALLBACK_MS = 2000;

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

    // SPA: App.tsx har marshrutda PageView'ni qo'lda yuboradi — fbevents.js pushState'da o'zi ham yubormasin (ikki marta sanalmasin)
    n.disablePushState = true;

    // Reklamadan kelgan tashrifchi tez chiqib ketishi mumkin — PageView yo'qolmasligi uchun skript tez (<=1 s) yuklanadi,
    // lekin hero canvas / shrift bilan bir vaqtda emas (idle yoki load'dan keyin). Boshqa trafik — scheduleLoad.
    if (isAdTraffic()) loadSoon();
    else scheduleLoad();
};

/** Skriptni darhol emas, lekin <=1 s ichida: load'dan keyin requestIdleCallback (timeout 1000 ms), kafolat taymeri bilan. */
const loadSoon = () => {
    const hard = window.setTimeout(loadPixelScript, 1000);
    const run = () => {
        const w = window as any;
        const fire = () => { window.clearTimeout(hard); loadPixelScript(); };
        if (typeof w.requestIdleCallback === 'function') w.requestIdleCallback(fire, { timeout: 1000 });
        else window.setTimeout(fire, 300);
    };
    if (document.readyState === 'complete') run();
    else window.addEventListener('load', run, { once: true });
};

/** URL'da fbclid / utm_source / ref / igshid bo'lsa yoki Instagram/Facebook in-app brauzer bo'lsa — reklama/kampaniya trafigi. */
const isAdTraffic = (): boolean => {
    try {
        const sp = new URLSearchParams(window.location.search);
        if (sp.get('fbclid') || sp.get('utm_source') || sp.get('ref') || sp.get('igshid')) return true;
        return /Instagram|FBAN|FBAV/i.test(navigator.userAgent || '');
    } catch { return false; }
};

const isAdminPath = (): boolean =>
    typeof window !== 'undefined' && window.location.pathname.startsWith('/paneladmindata');

/**
 * Tracks a standard or custom event. Skript hali yuklanmagan bo'lsa ham hodisa navbatda
 * saqlanadi va yuklangach yuboriladi.
 * @param eventName E.g., 'PageView', 'Lead', 'Contact'
 * @param data Optional data payload
 * @param eventId Ixtiyoriy eventID (Meta dedup / kelajakdagi Conversions API uchun)
 */
export const trackEvent = (eventName: string, data?: any, eventId?: string) => {
    if (typeof window === 'undefined') return;
    // Admin panelda Lead/Contact hodisalari Meta'ga yuborilmaydi (axlat ma'lumot bo'lmasin)
    if ((eventName === 'Lead' || eventName === 'Contact') && isAdminPath()) return;
    if (!window.fbq) initPixel();
    // SPA ichki navigatsiyada ham ?utm_ / fbclid ushlanadi (PageView har marshrutda chaqiriladi; birinchi tegish saqlanadi)
    captureAttribution();
    if (eventId) window.fbq('track', eventName, data || {}, { eventID: eventId });
    else window.fbq('track', eventName, data);
};

/** Nostandart (custom) hodisa: fbq('trackCustom', ...). Admin panelda yuborilmaydi. */
export const trackCustom = (name: string, data?: Record<string, unknown>) => {
    if (typeof window === 'undefined' || isAdminPath()) return;
    if (!window.fbq) initPixel();
    captureAttribution();
    if (data) window.fbq('trackCustom', name, data);
    else window.fbq('trackCustom', name);
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

// Telefon bo'yicha Lead dedup: localStorage (tablar/in-app brauzerlar orasida), bo'lmasa sessionStorage; TTL = serverdagi DEDUP oynasi
const LEAD_FLAG_TTL_MS = 10 * 60 * 1000;
const LEAD_FLAG_PREFIX = 'tracked_lead_p_';

/** Telefonni normalizatsiya qiladi (faqat raqamlar, oxirgi 9 ta) va qisqa xesh qaytaradi (xom raqam storage'da turmasin). */
const phoneFlagKey = (phone?: string): string | null => {
    const digits = String(phone || '').replace(/\D/g, '');
    if (digits.length < 7) return null;
    const tail = digits.slice(-9);
    let h = 5381;
    for (let i = 0; i < tail.length; i++) h = ((h << 5) + h + tail.charCodeAt(i)) | 0;
    return LEAD_FLAG_PREFIX + (h >>> 0).toString(36) + tail.length;
};

const readLeadFlag = (key: string): boolean => {
    const now = Date.now();
    for (const store of ['local', 'session'] as const) {
        try {
            const raw = (store === 'local' ? localStorage : sessionStorage).getItem(key);
            const t = raw ? Number(raw) : 0;
            if (t && now - t < LEAD_FLAG_TTL_MS && t <= now + 60_000) return true;
        } catch { /* storage yo'q */ }
    }
    return false;
};

const writeLeadFlag = (key: string) => {
    const v = String(Date.now());
    try { localStorage.setItem(key, v); } catch { /* private rejim */ }
    try { sessionStorage.setItem(key, v); } catch { /* private rejim */ }
};

/**
 * Lead hodisasi: har chaqiruvga eventID. Lead'da value/currency YO'Q (value faqat ViewContent / InitiateCheckout'da).
 * - eventId: submit OLDIN yaratilgan id berilsa o'shani ishlatadi (Meta dedup / kelajakdagi CAPI uchun).
 * - onceKey: bir sessiyada shu kalit bilan faqat bir marta (masalan, karyera testi).
 * - duplicate: server `duplicate:true` qaytargan bo'lsa — shu sessiyada shu manba+kurs uchun Lead hali
 *   yuborilmagan bo'lsagina yuboriladi (javob yo'qolib qayta urinish holati). Yuborilgan bo'lsa qayta sanalmaydi.
 * - phone: berilsa, bir telefon uchun 10 daqiqa ichida faqat bitta Lead (localStorage, TTL; boshqa tab/forma ham).
 */
export const trackLead = (opts: {
    source: string; course?: string; onceKey?: string; eventId?: string; duplicate?: boolean; phone?: string;
    /** @deprecated e'tiborga olinmaydi — Lead value'siz yuboriladi */
    value?: number | null; currency?: string;
}) => {
    const flagKey = `tracked_lead_${opts.onceKey || `${opts.source}|${opts.course || ''}`}`;
    if ((opts.onceKey || opts.duplicate) && safeSession.get(flagKey)) return;
    const pKey = phoneFlagKey(opts.phone);
    if (pKey && readLeadFlag(pKey)) return;
    safeSession.set(flagKey, '1');
    if (pKey) writeLeadFlag(pKey);
    const data: Record<string, unknown> = { source: opts.source };
    if (opts.course) { data.course = opts.course; data.content_name = opts.course; }
    trackEvent('Lead', data, opts.eventId || newEventId());
};

// ---------------------------------------------------------------- Atribusiya (birinchi tegish)

const ATTR_KEY = 'dt_attribution';
const ATTR_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'] as const;
type Attribution = Partial<Record<(typeof UTM_KEYS)[number] | 'fbclid' | 'ref', string>>;

const cleanParam = (v: string) => v.replace(/[\u0000-\u001f<>|]/g, ' ').trim().slice(0, 100);

/** Saqlangan atribusiya: localStorage (7 kun TTL), zaxira sessionStorage. Eski formatdagi (o'ramsiz) yozuv ham o'qiladi. */
const readStoredAttribution = (): Attribution | null => {
    const now = Date.now();
    for (const store of ['local', 'session'] as const) {
        try {
            const raw = (store === 'local' ? localStorage : sessionStorage).getItem(ATTR_KEY);
            if (!raw) continue;
            const obj = JSON.parse(raw);
            if (!obj || typeof obj !== 'object') continue;
            if (obj.v && typeof obj.v === 'object' && typeof obj.t === 'number') {
                if (now - obj.t < ATTR_TTL_MS && obj.t <= now + 60_000) return obj.v as Attribution;
                continue;
            }
            if (store === 'session') return obj as Attribution; // eski format (faqat tab sessiyasida yashagan)
        } catch { /* buzuq yozuv / storage yo'q */ }
    }
    return null;
};

const writeStoredAttribution = (a: Attribution, t = Date.now()) => {
    const raw = JSON.stringify({ v: a, t });
    try { localStorage.setItem(ATTR_KEY, raw); } catch { /* private rejim */ }
    try { sessionStorage.setItem(ATTR_KEY, raw); } catch { /* private rejim */ }
};

/**
 * Landingdagi utm_* va fbclid ni localStorage'ga (7 kun) yozadi, zaxira sessionStorage. Faqat birinchi tegish saqlanadi:
 * TTL tugamagan utm/fbclid yozuvi bo'lsa, keyingi sahifalardagi parametrlar ustiga yozmaydi.
 */
export const captureAttribution = () => {
    if (typeof window === 'undefined') return;
    try {
        const existing = readStoredAttribution();
        if (existing && Object.keys(existing).some((k) => k !== 'ref')) return;
        const sp = new URLSearchParams(window.location.search);
        const found: Attribution = {};
        [...UTM_KEYS, 'fbclid' as const].forEach((k) => {
            const raw = sp.get(k);
            const v = raw ? cleanParam(raw) : '';
            if (v) found[k] = v;
        });
        if (Object.keys(found).length) writeStoredAttribution({ ...(existing || {}), ...found });
    } catch { /* storage yo'q — atribusiyasiz davom etadi */ }
};

const readAttribution = (): Attribution => readStoredAttribution() || {};

/** Serverdagi `leads.utm` chegarasi bilan bir xil. */
export const UTM_MAX_LEN = 160;

/**
 * Qisqa atribusiya satri, masalan "ref:abc123 | fb | utm:instagram/cpc/kampaniya/c=reklama/t=guruh".
 * Tartib `ref | fb | utm`: 160 belgida kesilganda ref yo'qolmaydi (kesiladigan joy — uzun utm_content/term).
 * Alohida `utm` maydonida serverga yuboriladi (`courseId` ga QO'SHILMAYDI) va `leads.utm` ustunida saqlanadi.
 * `skipRef` — sourceRef allaqachon shu ref kod bo'lsa, qayta yozilmaydi.
 */
export const getAttributionTag = (skipRef?: string): string => {
    const a = readAttribution();
    let ref = '';
    try { ref = sessionStorage.getItem('marketing_ref') || ''; } catch { /* ignore */ }
    if (ref) {
        // Sessiyadagi ref kodni 7 kunlik yozuvga ham qo'shamiz (birinchi tegish: oldin yozilgan ref ustiga yozilmaydi)
        if (!a.ref) { a.ref = cleanParam(ref); writeStoredAttribution(a); }
        else ref = a.ref;
    } else if (a.ref) {
        ref = a.ref;
    }
    const parts: string[] = [];
    if (ref && ref !== skipRef) parts.push(`ref:${cleanParam(ref)}`);
    if (a.fbclid) parts.push('fb');
    if (a.utm_source || a.utm_medium || a.utm_campaign) {
        const slots = [a.utm_source, a.utm_medium, a.utm_campaign].map((x) => x || '-');
        if (a.utm_content) slots.push(`c=${a.utm_content}`);
        if (a.utm_term) slots.push(`t=${a.utm_term}`);
        parts.push(`utm:${slots.join('/')}`);
    }
    return parts.join(' | ').slice(0, UTM_MAX_LEN);
};

// ---------------------------------------------------------------- Contact (tel: / Telegram)

let contactListenerInstalled = false;

/** Butun saytda tel: va t.me havolalari bosilganda `Contact` yuboradi (bitta delegated listener). */
const installContactListener = () => {
    if (contactListenerInstalled || typeof document === 'undefined') return;
    contactListenerInstalled = true;
    document.addEventListener('click', (e) => {
        if (isAdminPath()) return;
        const target = e.target as Element | null;
        const a = target?.closest?.('a[href]') as HTMLAnchorElement | null;
        if (!a) return;
        const href = a.getAttribute('href') || '';
        if (/^tel:/i.test(href)) trackEvent('Contact', { method: 'phone', path: window.location.pathname });
        else if (/^https?:\/\/(?:www\.)?(?:t\.me|telegram\.me)\//i.test(href)) trackEvent('Contact', { method: 'telegram', path: window.location.pathname });
    }, { capture: true, passive: true });
};
