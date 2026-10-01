/* Meta Pixel events. The pixel itself (and its PageView) is loaded in
   public/index.html; the books app at /__/book has it stripped at build time
   (scripts/prerender-meta.js), so window.fbq can be missing - every call is
   guarded and silently does nothing then, or when an ad blocker removes it. */

declare global {
    interface Window {
        fbq?: (...args: unknown[]) => void;
    }
}

/** A booking form was submitted - the visitor is about to message us on
 *  WhatsApp. `formName` tells the forms apart in Events Manager. */
export const trackLead = (name: string) => {
    window.fbq?.('track', 'Lead', {content_name: name});
};
