# CRO Audit — jcll.me (JCLL Labs)

**Prepared:** 25 August 2026
**Domain audited:** `https://jcll.me`
**Audit type:** Conversion Rate Optimization — why visitors who do arrive aren't turning into leads, and what to change.

---

## The one-sentence version

Two things are throttling conversion before the page even loads: almost nobody arrives (the traffic problem, covered in the SEO and AEO audits), and the few who do arrive from a shared or paid link see a naked grey preview and an offer that tries to be five businesses at once.

**CRO Score: 35 / 100** — Poor. *(Partly provisional — see the access note below.)*

| Category | Score | Status |
|---|---|---|
| Positioning & message clarity | 25 / 100 | Poor |
| Link preview & ad-to-page continuity | 10 / 100 | Critical |
| Call-to-action architecture | Needs access | — |
| Lead capture friction | Needs access | — |
| Trust signals & social proof | 15 / 100 | Critical |
| Tracking & attribution | Needs access | — |

---

## An honest note on access

Because the site renders entirely in the browser (see SEO Finding 1), the audit environment could not retrieve the body content — the same limitation that blocks AI crawlers. So the checks that depend on inspecting live buttons, forms and page copy are marked **NEEDS ACCESS** and come with a short self-assessment you can complete in ten minutes with your own site open.

Everything else below is based on what *is* verifiable: the served HTML, the meta tags, the public search footprint, and the positioning implied by your own title and description. That turns out to be enough to identify the biggest conversion leaks.

---

## Finding 1 — The offer is five businesses in one sentence *(HIGH — VERIFIED)*

Your own title and description position JCLL Labs as: AI consulting **+** custom software development **+** photography **+** video production **+** AI-powered content creation.

**The conversion cost:** A CTO evaluating an AI partner reads "photography" and downgrades you to "generalist freelancer." A marketing manager looking for a product photographer reads "custom software development" and assumes you're too expensive. Every visitor has to do the work of figuring out whether you're for them — and most won't.

This isn't an argument for dropping service lines. It's an argument for **sequencing the message**:

- **Homepage:** lead with one primary practice — the one with the highest deal value and the clearest buyer. On the evidence of how you describe yourselves, that's AI consulting + software.
- **Everything else lives behind its own door.** `/photography` has its own hero, its own proof, its own CTA, and speaks only to photography buyers.
- **Reframe the range as an advantage, once**, low on the homepage: "We build the system *and* the content that goes in it" is a real differentiator — but as a footnote, not a headline.

**Homepage hero formula that works for studios:**

> **H1:** [Specific outcome] for [specific buyer]
> **Sub:** [How you do it, in one sentence] — [proof point or risk-reversal]
> **CTA:** [Low-commitment next step]

Example:
> **AI systems that actually ship — for businesses without an AI team**
> We scope, build and hand over working automation in weeks, not quarters. Fixed scope, fixed price, no retainer required.
> **[ Book a free 30-minute scoping call ]**

---

## Finding 2 — Every shared link renders as a grey box *(CRITICAL — VERIFIED)*

The served HTML contains no `og:image`, `og:title`, `og:description` or `twitter:card`.

**What that means in practice:** when you or anyone else shares jcll.me on LinkedIn, WhatsApp, Instagram DMs, Facebook, Slack or X, the platform shows a bare link with no image and no headline. Posts with rich previews reliably outperform bare links by a wide margin — this is one of the cheapest conversion fixes available anywhere, and it's currently at zero.

If you are running or planning paid social, this is worse than a missed opportunity: the ad's promise and the destination share no visual continuity at all, which is the classic profile of a high-bounce paid campaign.

**Fix:** the Open Graph block in the SEO audit, plus a purpose-built 1200×630 cover image with your positioning line burned into it. Test with LinkedIn's Post Inspector and Facebook's Sharing Debugger. Half a day of work.

---

## Finding 3 — No trust signals discoverable anywhere *(HIGH — VERIFIED off-site)*

Public searches surface no reviews, no client references, no case studies, no LinkedIn company presence, no directory profiles, no portfolio listings for the brand.

For a services business, trust *is* the conversion mechanism. A prospect deciding whether to hand you a project is asking one question — "has this worked for someone like me?" — and there is currently no answer available on or off the site.

**Fix, in ascending order of effort:**

1. **Client logos** — even three, even small engagements. Ask permission today.
2. **Two or three named testimonials** with photo, full name, role and company. Anonymous testimonials read as invented.
3. **Three case studies** with a real number in the headline: *"Cut quote turnaround from 3 days to 20 minutes for a regional installer."* These are simultaneously your best sales asset, your best SEO asset, and your best AI-citation asset.
4. **Credibility markers:** years active, projects delivered, certifications, tech partner badges, GitHub activity for the software side.
5. **Reviews on a third-party platform** — Google Business Profile or Clutch. Third-party reviews carry weight self-hosted testimonials never will.

---

## Finding 4 — Conversion architecture *(NEEDS ACCESS — self-assessment)*

Open jcll.me on your phone and score each item honestly.

| # | Check | Pass criteria | Your score |
|---|---|---|---|
| 1 | **CTA above the fold** | A single, high-contrast, action-worded button visible without scrolling — "Book a free call", not "Learn more" | ☐ |
| 2 | **CTA repetition** | The same primary CTA repeats after each major content block, and at the page foot | ☐ |
| 3 | **One primary action** | Not three competing buttons of equal weight | ☐ |
| 4 | **Form field count** | 3–4 fields maximum: name, email or phone, and what you need | ☐ |
| 5 | **Click-to-contact** | Working `tel:`, `mailto:` and/or WhatsApp link, tappable on mobile | ☐ |
| 6 | **Response expectation** | The form states when they'll hear back ("within one business day") | ☐ |
| 7 | **Confirmation state** | Submitting produces a clear success message and a follow-up email | ☐ |
| 8 | **Mobile tap targets** | Buttons ≥44px tall, no zooming required to read body copy | ☐ |
| 9 | **Load feel** | Meaningful content visible within ~2.5 seconds on 4G | ☐ |
| 10 | **Exit-free contact** | Contact is reachable from every page, not only from a menu | ☐ |

Anything under 8/10 is leaking leads. Items 1, 4 and 5 are the ones that move the number most.

**Highest-leverage default for a studio:** a single above-the-fold button reading **"Book a free 30-minute call"** wired to a scheduling link, with a three-field fallback form and a WhatsApp/click-to-call option beside it. Calendar bookings convert dramatically better than "contact us" forms because they remove the wait, and the wait is where interest dies.

---

## Finding 5 — Speed and Core Web Vitals *(NEEDS ACCESS)*

A client-side-rendered site typically shows a blank screen until the JavaScript bundle downloads, parses and executes — which is exactly the period during which mobile visitors from social ads decide to leave.

**Measure it:** run `https://jcll.me` through `pagespeed.web.dev` on the **Mobile** tab and record LCP, CLS and INP.

| Metric | Good | Needs work | Poor |
|---|---|---|---|
| LCP (loading) | < 2.5s | 2.5–4.0s | > 4.0s |
| CLS (stability) | < 0.1 | 0.1–0.25 | > 0.25 |
| INP (responsiveness) | < 200ms | 200–500ms | > 500ms |

If LCP is above 4 seconds on mobile, treat it as a P0 alongside the rendering fix — the two share the same solution. Then: compress and convert images to WebP/AVIF, lazy-load anything below the fold, serve from a CDN, and defer non-essential third-party scripts.

---

## Finding 6 — Tracking and attribution *(NEEDS ACCESS)*

You cannot optimize conversion without knowing which visits convert.

**Checklist:**

- [ ] GA4 installed and receiving data.
- [ ] Meta Pixel installed if you run or plan Meta ads.
- [ ] **Route-change tracking configured** — this is the one single-page apps almost always get wrong. Without it, GA4 records one pageview per session no matter how many "pages" the visitor sees, and every funnel report is fiction.
- [ ] Conversion events defined: `generate_lead` on form submit, `click` on `tel:`/`mailto:`/WhatsApp, `schedule_call` on booking completion.
- [ ] UTM parameters survive internal navigation — click your own ad, navigate two pages deep, and check the URL still carries the source.
- [ ] Google Search Console verified and linked to GA4.
- [ ] A lightweight session-recording tool (Microsoft Clarity is free) to watch where people actually stall.

Clarity in particular is worth installing on day one: 20 minutes of watching real sessions usually teaches you more than any audit, this one included.

---

## Finding 7 — The funnel arithmetic *(the reason to act)*

Conversion rate is a multiplier on traffic. Right now the multiplier is being applied to approximately zero.

| Stage | Today | After fixes (90 days, conservative) |
|---|---|---|
| Monthly organic sessions | ~0 | 150–400 |
| AI-assistant referrals | 0 | 10–40 |
| Social/link-preview CTR | Suppressed (no rich preview) | Normalized |
| Visitor → lead rate | Unknown, likely 0–1% | 3–5% |
| **Monthly qualified leads** | **~0** | **8–20** |

The ranges are deliberately conservative and depend on the rendering fix landing first. The point of the table isn't the precision — it's the sequence. Fixing CTAs on a page nobody can find changes nothing; fixing findability on a page with no CTA changes nothing either. Both tracks run in parallel, and they multiply.

---

## Prioritized action plan

### Week 1 — Fix what's free
- [ ] Add Open Graph + Twitter Card tags and a 1200×630 cover image (Finding 2).
- [ ] Rewrite the homepage hero to one buyer, one outcome, one CTA (Finding 1).
- [ ] Put a single high-contrast CTA above the fold, wired to a scheduling link.
- [ ] Add click-to-call and WhatsApp/email links, tested on a real phone.
- [ ] Install GA4 + Microsoft Clarity; configure SPA route-change tracking.
- [ ] Complete the Finding 4 self-assessment and record the score.

### Weeks 2–4 — Build the persuasion layer
- [ ] Reduce the lead form to 3–4 fields; add a stated response time and a proper confirmation state.
- [ ] Add client logos and 2–3 named testimonials to the homepage.
- [ ] Split services into dedicated landing pages, each with its own hero, proof and CTA.
- [ ] Fix mobile speed: WebP/AVIF, lazy loading, CDN.
- [ ] Define GA4 conversion events and confirm they fire.

### Months 2–3 — Compound it
- [ ] Publish 3 case studies with quantified outcomes.
- [ ] Collect reviews on Google Business Profile or Clutch.
- [ ] Build one dedicated landing page per paid campaign, with the headline mirroring the ad copy word-for-word.
- [ ] Review Clarity recordings monthly; A/B test the hero headline and the CTA label once you have enough traffic to read a result.

---

## The three things that matter most

1. **Make the site readable without JavaScript.** It is the shared root cause across all three audits.
2. **Say one thing on the homepage.** Five services in a headline is five reasons to leave.
3. **Give visitors evidence and an easy first step.** Logos, testimonials, case studies — and one button that books a call.
