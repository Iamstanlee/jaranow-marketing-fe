import {useEffect} from 'react';

// Swipe in from the left edge opens the drawer; a swipe back anywhere closes it.
const EDGE_ZONE = 28;   // px from the left edge that starts an opening swipe
const SWIPE_MIN = 55;   // px of travel before it counts as a swipe rather than a tap that moved

export function useDrawerSwipe(open: boolean, setOpen: (v: boolean) => void) {
    useEffect(() => {
        let startX = 0, startY = 0, tracking = false;
        const start = (e: TouchEvent) => {
            const touch = e.touches[0];
            tracking = e.touches.length === 1
                // Below md only, outside modals, and from the edge unless closing.
                && window.matchMedia('(max-width: 767px)').matches
                && !(e.target instanceof Element && e.target.closest('[data-modal]'))
                && (open || touch.clientX <= EDGE_ZONE);
            startX = touch.clientX;
            startY = touch.clientY;
        };
        const move = (e: TouchEvent) => {
            if (!tracking) return;
            const touch = e.touches[0], dx = touch.clientX - startX, dy = touch.clientY - startY;
            // Mostly vertical: a scroll, not a swipe.
            if (Math.abs(dy) > Math.abs(dx)) {
                tracking = false;
                return;
            }
            if (Math.abs(dx) < SWIPE_MIN) return;
            tracking = false;
            setOpen(dx > 0);
        };
        const end = () => {
            tracking = false;
        };
        // Passive: nothing calls preventDefault, and non-passive touchmove would slow scrolling.
        const opts = {passive: true} as const;
        document.addEventListener('touchstart', start, opts);
        document.addEventListener('touchmove', move, opts);
        document.addEventListener('touchend', end, opts);
        document.addEventListener('touchcancel', end, opts);
        return () => {
            document.removeEventListener('touchstart', start);
            document.removeEventListener('touchmove', move);
            document.removeEventListener('touchend', end);
            document.removeEventListener('touchcancel', end);
        };
    }, [open, setOpen]);
}
