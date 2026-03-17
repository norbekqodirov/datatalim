export const FB_PIXEL_ID = import.meta.env.VITE_FB_PIXEL_ID || '1177610010373853'; // Replace with real ID if needed later

// Types for Facebook Pixel window object
declare global {
    interface Window {
        fbq: any;
        _fbq: any;
    }
}

/**
 * Inits the Facebook Pixel script manually (if not hardcoded in index.html)
 */
export const initPixel = () => {
    if (typeof window === 'undefined') return;
    // Prevent double initialization
    if (window.fbq) return;

    const f = window as any;
    if (f.fbq) return;
    const n: any = f.fbq = function () {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
    };
    if (!f._fbq) f._fbq = n;
    n.push = n;
    n.loaded = !0;
    n.version = '2.0';
    n.queue = [];

    const fbScript = document.createElement('script');
    fbScript.async = true;
    fbScript.src = 'https://connect.facebook.net/en_US/fbevents.js';
    const firstScript = document.getElementsByTagName('script')[0];
    if (firstScript && firstScript.parentNode) {
        firstScript.parentNode.insertBefore(fbScript, firstScript);
    }

    // Init the pixel with the ID
    window.fbq('init', FB_PIXEL_ID);
};

/**
 * Tracks a standard or custom event
 * @param eventName E.g., 'PageView', 'Lead', 'Contact'
 * @param data Optional data payload
 */
export const trackEvent = (eventName: string, data?: any) => {
    if (typeof window !== 'undefined' && window.fbq) {
        window.fbq('track', eventName, data);
    } else {
        console.warn(`Facebook Pixel not loaded yet. Missed event: ${eventName}`);
    }
};
