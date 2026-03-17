import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { fetchFromAPI } from '../utils/api'; // Or create a trackClickInAPI specifically, we'll use fetch directly

export function useTracking() {
    const location = useLocation();
    const navigate = useNavigate();
    const [isChecking, setIsChecking] = useState(() => {
        const searchParams = new URLSearchParams(location.search);
        return !!searchParams.get('ref');
    });

    useEffect(() => {
        // Check for 'ref' in URL query parameters
        const searchParams = new URLSearchParams(location.search);
        const refCode = searchParams.get('ref');

        if (refCode) {
            // Note: We used to block until the backend answered, but that caused 10s-15s loading times on ads
            // NOW: We fire and forget, allowing the UI to render INSTANTLY.

            // Save it to sessionStorage so if the user browses around, we keep the refCode
            const storedRef = sessionStorage.getItem('marketing_ref');

            // Fire tracking request to backend
            fetch('/api/track/click', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ref: refCode }),
            })
                .then(res => res.json())
                .then(data => {
                    // Determine if we need to redirect
                    const targetUrl = data.target_url;

                    // Set the session storage only if we successfully track it
                    if (storedRef !== refCode) {
                        sessionStorage.setItem('marketing_ref', refCode);
                    }

                    // Redirect to target Url if it exists, is not generic root, and we aren't already there
                    // Make sure we only redirect if we aren't on the Apply form or currently typing
                    if (targetUrl && targetUrl !== '/' && location.pathname !== targetUrl && location.pathname === '/') {
                        // Use React Router for an instant client-side transition without reloading the browser
                        navigate(`${targetUrl}?ref=${refCode}`, { replace: true });
                    }

                    setIsChecking(false);
                })
                .catch(err => {
                    console.error("Failed to track click:", err);
                    setIsChecking(false);
                });
        } else {
            setIsChecking(false);
        }
    }, [location.search, navigate, location.pathname]);

    // We force isChecking to return false after a tiny delay or simply return false immediately
    // so we never block the UI for 15 seconds.
    useEffect(() => {
        if (isChecking) {
            const timer = setTimeout(() => setIsChecking(false), 500); // max 500ms block
            return () => clearTimeout(timer);
        }
    }, [isChecking]);

    return { isChecking };
}
