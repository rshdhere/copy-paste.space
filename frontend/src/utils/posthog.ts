import posthog from 'posthog-js';

// Generate or retrieve anonymous UUID from localStorage
const getAnonymousId = (): string => {
    const storageKey = 'posthog_anonymous_id';
    let anonymousId = localStorage.getItem(storageKey);
    
    if (!anonymousId) {
        anonymousId = crypto.randomUUID();
        localStorage.setItem(storageKey, anonymousId);
    }
    
    return anonymousId;
};

// Secure PostHog host with random string
const getSecurePostHogHost = (): string => {
    // Use environment variable for the secure path, fallback to a default
    const securePath = import.meta.env.VITE_POSTHOG_SECURE_PATH || '_x7k9m2n4';
    return `${window.location.origin}/${securePath}`;
};

// Initialize PostHog with anonymous tracking
export const initializePostHog = (): void => {
    // Check if environment variables are set
    const apiKey = import.meta.env.VITE_POSTHOG_API_KEY;
    // Use the reverse proxy host with secure random path
    const host = getSecurePostHogHost();
    
    if (!apiKey || apiKey === 'your_posthog_api_key_here') {
        console.warn('PostHog API key not configured. Please set VITE_POSTHOG_API_KEY in your .env file');
        return;
    }
    
    // Delay initialization to prevent blocking the initial render
    setTimeout(() => {
        try {
            const anonymousId = getAnonymousId();
        

            posthog.init(apiKey, {
                api_host: host,
                loaded: (posthogInstance) => {
                    console.log('PostHog loaded successfully');
                    // Set the distinct_id to our anonymous UUID
                    posthogInstance.identify(anonymousId);
                },
                autocapture: true,
                capture_pageview: true,
                capture_pageleave: true,
                session_recording: {
                    maskAllInputs: true,
                },
                // Prevent re-identification on reload
                persistence: 'localStorage',
                disable_session_recording: false,
                // Additional security options
                disable_persistence: false,
                enable_recording_console_log: false,
            });
        } catch (error) {
            console.error('Failed to initialize PostHog:', error);
        }
    }, 0);
};

// Typed function to capture custom events
export const captureEvent = (name: string, props?: Record<string, unknown>): void => {
    if (typeof window !== 'undefined' && posthog) {
        try {
            posthog.capture(name, props);
            console.log('PostHog event captured:', name, props);
        } catch (error) {
            console.error('Failed to capture PostHog event:', error);
        }
    }
};

// Export posthog instance for direct access if needed
export { posthog }; 