// fbq is absent on /__/book (stripped at build) and under ad blockers, so every call is guarded.

declare global {
    interface Window {
        fbq?: (...args: unknown[]) => void;
    }
}

/** Fire after validation, just before WhatsApp opens. `name` is the content_name in Events Manager. */
export const trackLead = (name: string) => {
    window.fbq?.('track', 'Lead', {content_name: name});
};
