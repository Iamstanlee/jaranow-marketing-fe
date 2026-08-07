import {useEffect} from 'react';

// The desk is a tablet held one-handed at the forecourt, where the hamburger sits in the far
// top-left corner — the one place a thumb cannot reach without regripping. So the drawer also
// answers a swipe in from the left edge, and a swipe back anywhere closes it.
const EDGE_ZONE = 28;   // px from the left edge that starts an opening swipe
const SWIPE_MIN = 55;   // px of travel before it counts as a swipe rather than a tap that moved

export function useDrawerSwipe(open: boolean, setOpen: (v: boolean) => void) {
    useEffect(() => {
        let startX = 0, startY = 0, tracking = false;
        const start = (e: TouchEvent) => {
            const touch = e.touches[0];
            tracking = e.touches.length === 1
                // Above md the sidebar is permanent, not a drawer — there is nothing to open.
                && window.matchMedia('(max-width: 767px)').matches
                // A modal owns the screen while it is up; a swipe across it is not aimed here.
                && !(e.target instanceof Element && e.target.closest('[data-modal]'))
                // Open from the edge only, so a swipe across a table is still a swipe across a
                // table. Closing works from anywhere, since the open drawer covers the screen.
                && (open || touch.clientX <= EDGE_ZONE);
            startX = touch.clientX;
            startY = touch.clientY;
        };
        const move = (e: TouchEvent) => {
            if (!tracking) return;
            const touch = e.touches[0], dx = touch.clientX - startX, dy = touch.clientY - startY;
            // A mostly-vertical drag is the page being scrolled. Concede it rather than
            // stealing the gesture half way down a long list of sales.
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
        // Passive throughout: the drawer slides via a CSS transform, so nothing here needs to
        // preventDefault, and a non-passive touchmove would cost scroll performance everywhere.
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
