import React from 'react';
import {Helmet} from 'react-helmet-async';

import routes from './routes.json';

export type SeoRoute = keyof typeof routes.routes;

interface SeoTagsProps {
    /** Route key as it appears in routes.json (e.g. '/carwash'). */
    route: SeoRoute;
}

/**
 * Runtime half only: crawlers see the copy scripts/prerender-meta.js bakes from the
 * same routes.json. Page-specific JSON-LD stays in the page's own Helmet.
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
