import {useEffect} from 'react';

// Opens on the #id from the URL (see CLAUDE.md "Section links"). Instant, not smooth:
// someone following a link should land on the form, not watch the page scroll.
export const useLandingScroll = () => {
    useEffect(() => {
        const id = decodeURIComponent(window.location.hash.slice(1));
        if (!id) {
            window.scrollTo(0, 0);
            return;
        }
        // Wait a frame for the lazy page to lay out before measuring.
        const timer = window.setTimeout(() => {
            document.getElementById(id)?.scrollIntoView({behavior: 'auto', block: 'start'});
        }, 60);
        return () => window.clearTimeout(timer);
    }, []);
};
