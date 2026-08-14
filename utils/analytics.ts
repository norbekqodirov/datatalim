export type SiteEventType = 'site_visit' | 'ariza_view' | 'career_test_complete';

/** Fire-and-forget site analytics event. Never throws, never blocks the UI. */
export const trackSiteEvent = (type: SiteEventType) => {
    try {
        fetch('/api/analytics/track', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type }),
            keepalive: true,
        }).catch(() => {});
    } catch {
        // ignore
    }
};

/** Tracks a site event at most once per browser session, using sessionStorage as the guard. */
export const trackSiteEventOncePerSession = (type: SiteEventType) => {
    const key = `tracked_${type}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, '1');
    trackSiteEvent(type);
};
