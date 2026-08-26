# SEO Audit — jcll.me (JCLL Labs)

**Prepared:** 25 August 2026
**Domain audited:** `http://jcll.me` (redirects to `https://jcll.me`)
**Audit type:** Search Engine Optimization — how well Google, Bing and human searchers can find, read and trust this site.

---

## The one-sentence version

Right now, jcll.me is effectively invisible in search: the page arrives at the crawler as an empty shell with no readable content, the brand has no footprint anywhere on the open web, and the two tags that *do* exist are too long and too unfocused to win a click.

**SEO Score: 28 / 100** — Critical.

| Category | Score | Status |
|---|---|---|
| Crawlability & rendering | 15 / 100 | Critical |
| On-page optimization | 35 / 100 | Poor |
| Content depth & architecture | 20 / 100 | Critical |
| Off-page authority & entity presence | 10 / 100 | Critical |
| Technical hygiene (canonical, social, schema) | 30 / 100 | Poor |
| Measurement & tooling | Unverified | Needs access |

---

## How this audit was performed

Everything marked **VERIFIED** below was observed directly by requesting the live site and by running search queries against public indexes on 25 Aug 2026.

Some checks require either raw HTTP header access or analytics access, neither of which was available from the audit environment. Those are marked **NEEDS VERIFICATION** and come with a copy-paste command so you can confirm them in under five minutes. Nothing in this document is assumed to be broken without evidence.

---

## Finding 1 — The page is empty until JavaScript runs *(CRITICAL — VERIFIED)*

**What we found:** When the homepage is requested the way a search crawler requests it, the response contains a `<head>` with a title, a meta description and a viewport tag — and effectively no body content. No headings, no paragraphs, no service descriptions, no navigation text, no contact information.

This is the signature of a client-side-rendered site (React/Vue/Next in SPA mode, or a builder that ships an empty root `<div>`). A human with a modern browser sees a full website. A crawler that doesn't execute JavaScript sees a blank page.

**Why it matters:**

- Google *can* render JavaScript, but it does so in a second pass that is queued, delayed and sometimes skipped for low-authority domains. A brand-new site with no backlinks sits at the back of that queue.
- Bing, DuckDuckGo, and most social/link-preview crawlers do far less JS rendering than Google.
- Every AI answer engine (covered in the AEO audit) fetches raw HTML. They see nothing.

**The fix — pick one:**

| Option | Best when | Effort |
|---|---|---|
| **Server-side rendering (SSR)** or **static generation (SSG)** — e.g. Next.js `app` router, Astro, Nuxt | You control the codebase. This is the correct long-term answer. | Medium |
| **Pre-rendering / hydration snapshots** — Prerender.io, Cloudflare HTML rewriter, Netlify prerendering | You need results in days, not sprints. | Low |
| **Rebuild on a rendering-first platform** — Astro, Next.js, or even a well-configured Webflow/Framer export | The current stack is fighting you. | High |

**How to verify the fix:**
```bash
curl -sL https://jcll.me | grep -c "<h1"          # must return 1 or more
curl -sL https://jcll.me | wc -c                   # raw HTML should be tens of KB, not a stub
```
Then run the URL through Google Search Console → **URL Inspection → View Crawled Page**. The HTML tab must contain your actual copy.

---

## Finding 2 — Zero index presence and zero brand footprint *(CRITICAL — VERIFIED)*

**What we found:**

- A `site:jcll.me` query returned **no pages from the domain**.
- A branded query for the business name returned **no result pointing at jcll.me**, and no LinkedIn company page, Google Business Profile, directory listing, press mention or portfolio profile for the brand.

**Why it matters:** Search engines rank *entities*, not just pages. Before Google will show you for "AI consultant" it wants to be confident you exist — corroborated by mentions on other domains. Right now there is nothing to corroborate. This is also the single biggest blocker for AI answer engines, which lean heavily on third-party mentions.

**The fix — in this order:**

1. **Claim the identity layer.** Google Business Profile (if you serve clients locally), LinkedIn company page, Crunchbase, Clutch or DesignRush (agency directories), GitHub org, Behance/Instagram for the photography side. Use one exact business name, one address format, one phone number everywhere (NAP consistency).
2. **Link them all back to jcll.me**, and link from jcll.me out to them in the footer.
3. **Publish `Organization` structured data** on the homepage with a `sameAs` array listing every profile above — this is how you tell Google "all of these are the same entity."
4. **Earn 5–10 genuine mentions in 90 days:** guest post on a regional business blog, get listed by any client you've worked with as a vendor/partner, answer questions on relevant communities, publish one genuinely useful free tool or guide.

---

## Finding 3 — Title tag is 90 characters and unfocused *(HIGH — VERIFIED)*

**Current title (90 characters):**
```
JCLL Labs | AI Consulting, Software Development, Photography & Digital Marketing Solutions
```

**Two problems:**

1. **Length.** Google truncates around 55–60 characters. Everything after "Software Devel…" is invisible in the result.
2. **Focus.** Five unrelated service lines in one title tells Google the page is about nothing in particular. A page that is about everything ranks for nothing. This also confuses buyers: an enterprise looking for AI consulting reads "photography" and leaves.

**The fix — split the offer across dedicated pages, each with its own tight title:**

| Page | Suggested title (≤60 chars) |
|---|---|
| Homepage | `JCLL Labs — AI Consulting & Custom Software Development` (55) |
| `/ai-consulting` | `AI Consulting for Growing Businesses \| JCLL Labs` (48) |
| `/software-development` | `Custom Software & App Development \| JCLL Labs` (45) |
| `/photography` | `Commercial Photography & Video Production \| JCLL Labs` (53) |
| `/content-creation` | `AI-Powered Content Creation Services \| JCLL Labs` (48) |

Add a city or region to at least the photography and consulting pages if you serve a defined market — local intent is far easier to win than national.

---

## Finding 4 — Meta description is 294 characters *(MEDIUM — VERIFIED)*

**Current description:** 294 characters. Google shows roughly 155. Nearly two thirds of it never appears, including the part where you say what you do for the customer.

It's also written inward-facing ("JCLL Labs is a technology and creative studio specializing in…") rather than outward-facing. Descriptions don't affect ranking directly; they affect click-through rate, which does.

**Suggested rewrite (152 characters):**
```
AI consulting and custom software built for businesses that need results,
not slide decks. Tell us the problem — get a working solution. Free 30-min call.
```

Each page gets its own. Never duplicate.

---

## Finding 5 — Missing canonical, social and structured-data tags *(HIGH — VERIFIED in served HTML)*

The served HTML contained **only** `title`, `meta description` and `meta viewport`. Not detected:

| Missing tag | Consequence |
|---|---|
| `<link rel="canonical">` | Duplicate-URL variants (`http`/`https`, with/without trailing slash) can split ranking signals. |
| `og:title`, `og:description`, `og:image`, `og:url` | Every share on LinkedIn, WhatsApp, Facebook, Slack renders as a naked grey link. This directly suppresses click-through on paid and organic social — see the CRO audit. |
| `twitter:card` | Same problem on X. |
| `<meta name="robots">` | No explicit indexing directive. |
| `Organization` / `LocalBusiness` / `Service` JSON-LD | Google has no machine-readable statement of who you are, what you sell, where you are, or how to contact you. |

**Copy-paste starter for the `<head>`:**

```html
<link rel="canonical" href="https://jcll.me/">
<meta name="robots" content="index, follow, max-image-preview:large">

<meta property="og:type" content="website">
<meta property="og:site_name" content="JCLL Labs">
<meta property="og:title" content="JCLL Labs — AI Consulting & Custom Software Development">
<meta property="og:description" content="AI consulting and custom software built for businesses that need results, not slide decks.">
<meta property="og:url" content="https://jcll.me/">
<meta property="og:image" content="https://jcll.me/og-cover.jpg"><!-- 1200x630 -->
<meta name="twitter:card" content="summary_large_image">

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "JCLL Labs",
  "url": "https://jcll.me/",
  "logo": "https://jcll.me/logo.png",
  "description": "AI consulting, custom software development, photography and video production.",
  "email": "hello@jcll.me",
  "sameAs": [
    "https://www.linkedin.com/company/REPLACE",
    "https://www.instagram.com/REPLACE",
    "https://github.com/REPLACE"
  ],
  "makesOffer": [
    { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "AI Consulting" } },
    { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Custom Software Development" } },
    { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Commercial Photography & Video" } }
  ]
}
</script>
```

Validate at `search.google.com/test/rich-results` once deployed.

---

## Finding 6 — No content architecture, no keyword targeting *(HIGH — VERIFIED)*

No service pages, case studies, or article URLs surfaced for this domain in any index. A single page — however good — can realistically rank for one topic. You have five.

**Target architecture:**

```
/                        → who you are, proof, primary CTA
/ai-consulting           → problem → approach → outcomes → CTA
/software-development    → same structure
/photography             → portfolio-led
/content-creation        → same
/work/{client-slug}      → 3-5 case studies (your strongest ranking + sales asset)
/blog/{topic}            → 1-2 useful posts per month
/contact                 → dedicated conversion page
```

**Starter keyword map** (verify volumes in Google Keyword Planner or Ahrefs before committing — these are directional):

| Page | Primary intent | Long-tail targets |
|---|---|---|
| `/ai-consulting` | Commercial | "AI consulting for small business", "AI automation consultant", "how to implement AI in my business" |
| `/software-development` | Commercial | "custom software development company", "MVP development for startups" |
| `/photography` | Local + commercial | "commercial photographer [city]", "product photography [city]", "corporate video production [city]" |
| `/blog` | Informational | "how much does custom software cost", "AI agent vs chatbot", "do I need AI or just automation" |

Informational posts are what get cited by AI answer engines. They are not optional in 2026.

---

## Finding 7 — Checks that need your access *(NEEDS VERIFICATION)*

These could not be confirmed from the audit environment. Run these commands from any terminal and record the result:

```bash
# 1. robots.txt exists and is plain text?
curl -sI https://jcll.me/robots.txt | head -3
curl -s  https://jcll.me/robots.txt

# 2. sitemap exists and is valid XML?
curl -sI https://jcll.me/sitemap.xml | head -3

# 3. http → https and non-www → canonical host redirect cleanly (one hop, 301)?
curl -sIL http://jcll.me | grep -E "HTTP/|location"

# 4. Security + caching headers present?
curl -sI https://jcll.me | grep -iE "strict-transport|content-type|cache-control"
```

Also needed, and only you can pull them:

- **Google Search Console** — is the property even verified? What does Coverage say? Any pages indexed at all?
- **Google Analytics 4 / Meta Pixel** — are they installed, and do they fire on a JS-rendered route change?
- **PageSpeed Insights** (`pagespeed.web.dev`) for real Core Web Vitals — LCP, CLS, INP on mobile.

If Search Console isn't set up, that is task zero. You cannot manage what you cannot see.

---

## Prioritized action plan

### Week 1 — Stop the bleeding
- [ ] Make the homepage render real HTML server-side (Finding 1). Nothing else matters until this is done.
- [ ] Rewrite title to ≤60 chars and meta description to ≤155 chars.
- [ ] Add canonical, robots, Open Graph and Twitter tags.
- [ ] Verify the domain in Google Search Console and submit the homepage.
- [ ] Confirm `robots.txt` and `sitemap.xml` exist and return 200.

### Weeks 2–4 — Build the foundation
- [ ] Split the offer into 4–5 dedicated service pages with unique titles, H1s, and 600+ words of genuinely useful copy each.
- [ ] Add `Organization` JSON-LD with a complete `sameAs` array.
- [ ] Create LinkedIn company page, Google Business Profile, and 3 relevant directory listings with consistent NAP.
- [ ] Compress and convert all images to WebP/AVIF; add descriptive alt text everywhere.
- [ ] Install GA4 and confirm events fire on SPA route changes.

### Months 2–3 — Earn authority
- [ ] Publish 3 case studies with real numbers.
- [ ] Publish 4–6 informational articles targeting the long-tail questions above.
- [ ] Secure 5–10 genuine backlinks/mentions (guest posts, client vendor pages, community answers, directories).
- [ ] Review Search Console monthly: impressions first, clicks second, positions third.

---

## What "good" looks like in 90 days

| Metric | Today | 90-day target |
|---|---|---|
| Pages indexed | 0 | 10–15 |
| Branded search visibility | Not found | Position 1 for "JCLL Labs" |
| Non-branded impressions/month | ~0 | 500–2,000 |
| Referring domains | ~0 | 8–15 |
| Organic sessions/month | ~0 | 150–400 |

SEO compounds slowly. The rendering fix and the entity work in Weeks 1–4 are what unlock everything else; nothing that follows will work without them.
