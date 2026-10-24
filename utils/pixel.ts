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
 */
export const trackEvent = (eventName: string, data?: any) => {
    if (typeof window === 'undefined') return;
    if (!window.fbq) initPixel();
    window.fbq('track', eventName, data);
};
