import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { fetchFromAPI } from '../utils/api'; // Or create a trackClickInAPI specifically, we'll use fetch directly

export function useTracking() {
    const location = useLocation();
    const navigate = useNavigate();
    const [isChecking, setIsChecking] = useState(false);

    useEffect(() => {
        // Check for 'ref' in URL query parameters
        const searchParams = new URLSearchParams(location.search);
        const refCode = searchParams.get('ref');

        if (refCode) {
            setIsChecking(true);

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
                    if (targetUrl && targetUrl !== '/' && location.pathname !== targetUrl) {
                        // Force a hard redirect so we immediately exit the React tree
                        window.location.replace(`${targetUrl}?ref=${refCode}`);
                    } else {
                        setIsChecking(false);
                    }
                })
                .catch(err => {
                    console.error("Failed to track click:", err);
                    setIsChecking(false);
                });
        }
    }, [location, navigate]);

    return { isChecking };
}
