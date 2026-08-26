import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { useStore } from '../utils/store';
import { content } from '../utils/content';
import { SITE_URL, GSC_VERIFICATION, SOCIAL_LINKS } from '../utils/site';

// The canonical form of every indexable path. The photography page is served from
// dist/photography/index.html, so Apache's mod_dir redirects /photography to the
// trailing-slash form — the canonical has to be the URL that actually answers 200.
const canonicalFor = (pathname) => {
    if (pathname === '/photography' || pathname === '/photography/') return '/photography/';
    return '/';
};

const SEO = () => {
    const { language } = useStore();
    const { pathname } = useLocation();
    const siteUrl = SITE_URL;

    // location.search is deliberately dropped: the prerender step visits /?prerender=1
    // and that query string must never reach a canonical or an og:url.
    const canonicalPath = canonicalFor(pathname);
    const canonical = `${siteUrl}${canonicalPath}`;

    const t = content[language].seo;
    const page = content[language].seoPages[canonicalPath] ?? {};
    const title = page.title ?? t.title;
    const description = page.description ?? t.description;
    const ogImage = `${siteUrl}${page.ogImage ?? '/og-image.jpg'}`;
    const ogImageAlt = page.ogImageAlt ?? title;

    // One @graph, one node per entity, the same @id restated on every route — that
    // is how Google joins the pages into a single business. sameAs is omitted
    // entirely when SOCIAL_LINKS is empty: "sameAs": [] asserts the entity has no
    // profiles, which is a worse claim than saying nothing.
    const organization = {
        "@type": "LocalBusiness",
        "@id": `${siteUrl}/#organization`,
        "name": "JCLL Labs",
        "url": `${siteUrl}/`,
        "logo": { "@type": "ImageObject", "@id": `${siteUrl}/#logo`, "url": `${siteUrl}/logo.png` },
        "image": { "@id": `${siteUrl}/#logo` },
        "description": t.description,
        "email": content.en.contact.email,
        "telephone": "", // no number exists anywhere in the repo — do not invent one
        "priceRange": "$$",
        "knowsLanguage": ["en", "es"],
        "address": {
            "@type": "PostalAddress",
            "addressLocality": "Richmond",
            "addressRegion": "VA",
            "addressCountry": "US"
        },
        "areaServed": ["Richmond", "Midlothian", "Glen Allen", "Chesterfield"],
        "makesOffer": content.en.services.items.map((service) => ({
            "@type": "Offer",
            "itemOffered": { "@type": "Service", "name": service.name, "description": service.description }
        }))
    };
    if (SOCIAL_LINKS.length > 0) organization.sameAs = SOCIAL_LINKS.map((s) => s.url);

    const graph = [
        organization,
        {
            "@type": "WebSite",
            "@id": `${siteUrl}/#website`,
            "url": `${siteUrl}/`,
            "name": "JCLL Labs",
            "inLanguage": "en",
            "publisher": { "@id": `${siteUrl}/#organization` }
        },
        {
            "@type": "WebPage",
            "@id": `${canonical}#webpage`,
            "url": canonical,
            "name": title,
            "description": description,
            "isPartOf": { "@id": `${siteUrl}/#website` },
            "about": { "@id": `${siteUrl}/#organization` },
            "inLanguage": "en"
        }
    ];

    if (canonicalPath === '/photography/') {
        graph.push({
            "@type": "Service",
            "@id": `${siteUrl}/photography/#service`,
            "serviceType": "Photography",
            "name": "Photography and video production",
            "provider": { "@id": `${siteUrl}/#organization` },
            "areaServed": [
                { "@type": "City", "name": "Richmond", "containedInPlace": { "@type": "State", "name": "Virginia" } },
                { "@type": "City", "name": "Midlothian" },
                { "@type": "City", "name": "Glen Allen" },
                { "@type": "City", "name": "Chesterfield" }
            ],
            "availableLanguage": ["en", "es"]
        });
    }

    const schemaData = { "@context": "https://schema.org", "@graph": graph };

    return (
        <Helmet>
            {/* Standard Metadata */}
            <html lang={language} />
            <title>{title}</title>
            <meta name="description" content={description} />
            <meta name="robots" content="index, follow, max-image-preview:large" />
            <link rel="canonical" href={canonical} />
            {/* An empty content="" reads to Google as a failed verification attempt,
                so the tag has to be absent rather than blank until the owner supplies
                the string (DNS TXT verification is preferred and needs no tag at all). */}
            {GSC_VERIFICATION ? <meta name="google-site-verification" content={GSC_VERIFICATION} /> : null}

            {/* Open Graph / Facebook */}
            <meta property="og:type" content="website" />
            <meta property="og:site_name" content="JCLL Labs" />
            <meta property="og:url" content={canonical} />
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={ogImage} />
            <meta property="og:image:width" content="1200" />
            <meta property="og:image:height" content="630" />
            <meta property="og:image:type" content="image/jpeg" />
            <meta property="og:image:alt" content={ogImageAlt} />

            {/* Twitter */}
            <meta property="twitter:card" content="summary_large_image" />
            <meta property="twitter:url" content={canonical} />
            <meta property="twitter:title" content={title} />
            <meta property="twitter:description" content={description} />
            <meta property="twitter:image" content={ogImage} />
            <meta name="twitter:image:alt" content={ogImageAlt} />

            {/* Structured Data */}
            <script type="application/ld+json">
                {JSON.stringify(schemaData)}
            </script>
        </Helmet>
    );
};

export default SEO;
