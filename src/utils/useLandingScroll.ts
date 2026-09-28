import {useEffect} from 'react';

/* Direct links to a form. Every booking form has a stable id, so a URL with
   that id as its #hash opens the page on the form - ready to share with a
   client or put on an ad:

     /carwash#booking     car wash booking
     /laundry#pricing     laundry plans
     /rugs#pickup         rug pickup
     /business#quote      fleet & corporate quote

   On landing: jump straight to the #id (instantly - someone following a link
   should arrive on the form, not watch the page scroll), otherwise start at the
   top. Replaces the per-page scrollTo(0, 0). */
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
