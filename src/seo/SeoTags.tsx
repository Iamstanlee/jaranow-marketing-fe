import React from 'react';
import {Helmet} from 'react-helmet-async';

import routes from './routes.json';

export type SeoRoute = keyof typeof routes.routes;

interface SeoTagsProps {
    /** Route key as it appears in routes.json (e.g. '/carwash'). */
    route: SeoRoute;
}

/**
 * Emits the title, description, canonical and social tags for a route.
 *
 * These same values are baked into static HTML at build time by
 * scripts/prerender-meta.js, because social crawlers do not run JavaScript and
 * would otherwise only ever see the tags in public/index.html. Both readers
 * share routes.json so the two can never drift.
 *
 * Page-specific extras (JSON-LD, per-service favicons, manifests) stay in the
 * page's own Helmet.
 */
const SeoTags: React.FC<SeoTagsProps> = ({route}) => {
    const meta = routes.routes[route];
    const url = `${routes.siteUrl}${route === '/' ? '' : route}`;
    const image = `${routes.siteUrl}${meta.ogImage}`;

    return (
        <Helmet prioritizeSeoTags>
            <title>{meta.title}</title>
            <meta name="description" content={meta.description}/>
            <link rel="canonical" href={url}/>

            <meta property="og:type" content="website"/>
            <meta property="og:site_name" content={meta.siteName}/>
            <meta property="og:locale" content="en_NG"/>
            <meta property="og:url" content={url}/>
            <meta property="og:title" content={meta.ogTitle}/>
            <meta property="og:description" content={meta.ogDescription}/>
            <meta property="og:image" content={image}/>
            <meta property="og:image:width" content="1200"/>
            <meta property="og:image:height" content="630"/>
            <meta property="og:image:alt" content={meta.ogImageAlt}/>

            <meta name="twitter:card" content="summary_large_image"/>
            <meta name="twitter:site" content={routes.twitterSite}/>
            <meta name="twitter:url" content={url}/>
            <meta name="twitter:title" content={meta.ogTitle}/>
            <meta name="twitter:description" content={meta.ogDescription}/>
            <meta name="twitter:image" content={image}/>
            <meta name="twitter:image:alt" content={meta.ogImageAlt}/>
        </Helmet>
    );
};

export default SeoTags;
