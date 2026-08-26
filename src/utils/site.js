// The one canonical production origin for this site.
// Every absolute URL the app emits derives from this. No trailing slash.
// NOTE: the static files under public/ (robots.txt, sitemap.xml, .well-known/*,
// auth.md, home.md, openapi.json) cannot import this — they are hand-authored and
// must be kept in sync by hand. QA asserts the match.
export const SITE_URL = 'https://jcll.me';

// Google Search Console meta-tag verification. Empty is the normal state: DNS TXT
// verification is preferred and needs no code. SEO.jsx emits nothing at all when
// this is empty — an empty content="" reads to Google as a failed verification.
export const GSC_VERIFICATION = '';

// Real, owner-verified profile URLs ONLY. This array feeds three things at once:
// the footer "Follow" column, the contact section's icon row, and JSON-LD sameAs.
// A generic platform homepage (https://instagram.com) is worse than nothing here:
// it corroborates no entity and it tells Google the brand has no profile.
// Empty array => footer column omitted, icon row omitted, sameAs key omitted.
export const SOCIAL_LINKS = [
    // { label: 'Instagram', url: 'https://www.instagram.com/jcll_photography' },  // <- owner must confirm this handle is live
];
