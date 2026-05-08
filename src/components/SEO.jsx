import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useStore } from '../utils/store';
import { content } from '../utils/content';

const SEO = () => {
    const { language } = useStore();
    const t = content[language].seo;
    const siteUrl = 'https://jcllphotography.com'; // Replace with actual domain

    // LocalBusiness Schema (JSON-LD)
    const schemaData = {
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        "name": "JCLL Labs",
        "image": `${siteUrl}/logo.png`, // Update with actual image path
        "description": t.description,
        "address": {
            "@type": "PostalAddress",
            "addressLocality": "Richmond",
            "addressRegion": "VA",
            "addressCountry": "US"
        },
        "url": siteUrl,
        "telephone": "", // Add if available
        "priceRange": "$$",
        "areaServed": ["Richmond", "Midlothian", "Glen Allen", "Chesterfield"]
    };

    return (
        <Helmet>
            {/* Standard Metadata */}
            <html lang={language} />
            <title>{t.title}</title>
            <meta name="description" content={t.description} />
            <meta name="keywords" content={t.keywords} />
            <link rel="canonical" href={siteUrl} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content="website" />
            <meta property="og:url" content={siteUrl} />
            <meta property="og:title" content={t.title} />
            <meta property="og:description" content={t.description} />
            <meta property="og:image" content={`${siteUrl}/og-image.jpg`} /> {/* Need to create this image */}

            {/* Twitter */}
            <meta property="twitter:card" content="summary_large_image" />
            <meta property="twitter:url" content={siteUrl} />
            <meta property="twitter:title" content={t.title} />
            <meta property="twitter:description" content={t.description} />
            <meta property="twitter:image" content={`${siteUrl}/og-image.jpg`} />

            {/* Structured Data */}
            <script type="application/ld+json">
                {JSON.stringify(schemaData)}
            </script>
        </Helmet>
    );
};

export default SEO;
