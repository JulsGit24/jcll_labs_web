# AEO Audit — jcll.me (JCLL Labs)

**Prepared:** 25 August 2026
**Domain audited:** `https://jcll.me`
**Audit type:** Agent Engine Optimization — how well ChatGPT, Claude, Gemini, Perplexity, Copilot and autonomous AI agents can read, understand, cite and interact with this site.

---

## The one-sentence version

An AI answer engine that fetches jcll.me today receives a title, a meta description, and nothing else — so it has no material to summarize, no facts to cite, and no reason to recommend JCLL Labs to anyone.

**AEO Score: 15 / 100** — Critical.

| Layer | Score | Status |
|---|---|---|
| 1. Machine-readable content | 10 / 100 | Critical |
| 2. Discoverability (robots, sitemap, link headers) | Unverified — assume 0 | Needs check |
| 3. Agent-native files (llms.txt, markdown negotiation) | 0 / 100 | Critical |
| 4. Bot access policy & content signals | 0 / 100 | Critical |
| 5. Agent interaction (MCP, skills, API catalog) | 0 / 100 | Not started |
| 6. Entity corroboration off-site | 5 / 100 | Critical |

---

## Why this matters more than it did last year

A growing share of commercial research now happens inside an assistant, not a search results page. The buyer's journey looks like this:

> "I need someone to build an AI agent for my customer support. Who should I talk to?"

The model answers from three things: **(a)** pages it can fetch and read right now, **(b)** what it learned in training, and **(c)** what other sites say about you. JCLL Labs currently scores near zero on all three. There is no page content to fetch, no training-data footprint (the brand does not appear in public indexes), and no third-party corroboration.

The practical consequence: **JCLL Labs cannot be recommended by an AI assistant today, under any phrasing of any relevant question.** Not because it ranks poorly — because there is nothing for the model to work with.

---

## Finding 1 — Nothing to read *(CRITICAL — VERIFIED)*

**Observed:** A direct fetch of `https://jcll.me` returns HTML whose readable payload is:

- `title`: JCLL Labs | AI Consulting, Software Development, Photography & Digital Marketing Solutions
- `meta-description`: a 294-character company blurb
- `meta-viewport`

That is the entire corpus available to an AI crawler. No headings, no service explanations, no pricing, no process, no proof, no contact details.

Unlike Google, **AI crawlers generally do not execute JavaScript.** GPTBot, ClaudeBot, PerplexityBot and friends fetch, parse, and move on. A client-side-rendered site is, to them, a blank page with a headline.

**Fix:** Server-side render or statically generate the site. This is the same Finding 1 as the SEO audit, and it is the highest-leverage change available — it fixes roughly half of both scorecards at once.

---

## Finding 2 — No `llms.txt` *(HIGH)*

**Observed:** No `llms.txt` was reachable, and there is no content architecture for one to point at.

`llms.txt` is a plain-Markdown file at the site root that acts as a curated reading list for models: here is who we are, here are our most important pages, here is what each one covers. It removes the guesswork of crawling.

**Fix — create `/llms.txt`:**

```markdown
# JCLL Labs

> JCLL Labs is a technology and creative studio offering AI consulting, custom
> software development, commercial photography and video production, and
> AI-powered content creation for businesses and professionals.

## Services
- [AI Consulting](https://jcll.me/ai-consulting.md): AI strategy, agent design, and automation for small and mid-sized businesses.
- [Custom Software Development](https://jcll.me/software-development.md): Web and mobile applications, APIs, and MVPs.
- [Photography & Video](https://jcll.me/photography.md): Commercial photography, product shoots, and video production.
- [AI Content Creation](https://jcll.me/content-creation.md): AI-assisted content production for brands.

## Company
- [About](https://jcll.me/about.md): Team, background, and how we work.
- [Case Studies](https://jcll.me/work.md): Client projects with measurable outcomes.
- [Contact](https://jcll.me/contact.md): How to reach us and typical response time.

## Optional
- [Blog](https://jcll.me/blog.md): Articles on applied AI and software delivery.
```

Serve it as `Content-Type: text/plain; charset=utf-8`, and keep it updated when pages change.

---

## Finding 3 — No Markdown content negotiation *(MEDIUM)*

**What it is:** When a request arrives with `Accept: text/markdown`, the server returns a clean Markdown version of the page instead of HTML. Browsers still get HTML. Agents get exactly the text they want, at a fraction of the tokens.

**Fix:** If you are on Cloudflare, enable *Markdown for Agents* in the dashboard — it is a toggle, not a project. Otherwise, add middleware that detects the `Accept` header and serves a `.md` twin of each route. Confirm the response carries `Content-Type: text/markdown`.

**Verify:**
```bash
curl -sI -H "Accept: text/markdown" https://jcll.me | grep -i content-type
```

---

## Finding 4 — No AI bot policy or Content Signals *(HIGH)*

Without explicit rules, you are making no decision — you are letting defaults decide whether your work trains models, and you have no record of your own preference.

**Fix — `/robots.txt`:**

```
# Search engines
User-agent: *
Allow: /

# AI crawlers — explicit policy
User-agent: GPTBot
Allow: /

User-agent: OAI-SearchBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Google-Extended
Allow: /

# Content usage preferences
Content-Signal: ai-train=no, search=yes, ai-input=yes

Sitemap: https://jcll.me/sitemap.xml
```

**Read this carefully before deploying.** The signal above says: *do not train on my content, but do use it to answer users' questions and to ground live answers.* For a services business that wants to be recommended, that is usually the right trade. If you would rather be in training corpora too — a defensible choice for a small brand trying to become known — set `ai-train=yes`. What you should not do is leave it undeclared.

---

## Finding 5 — The 15-point agent readiness scorecard

Mapped against the standard checklist. Items marked *Unverified* could not be tested from the audit environment; run the site through `isitagentready.com` to confirm each in one pass.

| # | Check | Status | Priority |
|---|---|---|---|
| 1 | `/robots.txt` published with clear crawl rules | Unverified | P0 |
| 2 | `/sitemap.xml` published and referenced from robots.txt | Unverified | P0 |
| 3 | Readable HTML content without JavaScript | **FAIL (verified)** | **P0** |
| 4 | Link response headers for agent discovery (RFC 8288) | Unverified — assume missing | P2 |
| 5 | DNS-AID records for DNS-based discovery | Assume missing | P3 |
| 6 | Markdown returned on `Accept: text/markdown` | Assume missing | P1 |
| 7 | `llms.txt` at site root | **FAIL** | **P0** |
| 8 | Explicit User-agent rules for AI crawlers | Assume missing | P1 |
| 9 | Content Signals declared in robots.txt | Assume missing | P1 |
| 10 | `/.well-known/api-catalog` (RFC 9727) | Not applicable yet | P3 |
| 11 | OAuth/OIDC discovery metadata | Not applicable — no protected API | P3 |
| 12 | OAuth Protected Resource Metadata | Not applicable | P3 |
| 13 | `/auth.md` agent registration metadata | Not applicable | P3 |
| 14 | MCP Server Card at `/.well-known/mcp/server-card.json` | Not started | P2 (strategic) |
| 15 | Agent Skills index + WebMCP + ARD manifest | Not started | P2 (strategic) |

**Realistic reading of this table:** items 1–3 and 6–9 are the ones that decide whether JCLL Labs gets cited by an assistant. Items 10–15 matter when you expose a product or API. For a studio whose website is a brochure, they are differentiation, not necessity — *but* see the strategic note below.

---

## Finding 6 — The strategic opportunity most competitors will miss

JCLL Labs sells AI consulting. There is a credibility argument available here that a plumber's website cannot make:

> The agency that tells clients to prepare for the agentic web should have the most agent-ready site in its market.

Concretely, once items 1–9 are done, the following turn the website itself into a sales asset:

1. **Publish an MCP Server Card** exposing a few genuinely useful tools — `get_services`, `check_availability`, `request_quote`. An assistant can then *act* on behalf of a prospect rather than just describe you.
2. **Publish an Agent Skills index** at `/.well-known/agent-skills/index.json` describing how an agent should engage you.
3. **Publish an ARD manifest** at `/.well-known/ai-catalog.json` with 2–5 representative queries per entry, so discovery registries can embed you semantically.
4. **Then write the case study about doing it.** "We made our own site agent-ready and here is the before/after score" is exactly the content that gets cited by the models you are trying to appear in. It closes the loop: the technical work becomes the marketing asset becomes the ranking signal.

---

## Finding 7 — No entity corroboration *(CRITICAL — VERIFIED)*

Public searches for the brand name return nothing connected to jcll.me — no LinkedIn company page, no directory listing, no portfolio profile, no press, no client mentions.

Answer engines weight third-party corroboration heavily, precisely because a self-description is cheap. A model that finds one unlinked site claiming expertise and zero corroboration will not put that name in front of a user asking for a recommendation.

**Fix:** identical to Finding 2 of the SEO audit — build the identity layer (LinkedIn, GBP, agency directories, GitHub, portfolio platforms), keep NAP consistent, cross-link everything, and declare it all in `sameAs`. This is the slowest-moving item on the list, which is why it should start this week.

---

## Prioritized action plan

### Week 1 — Become readable
- [ ] Server-side render the site (shared with SEO Finding 1).
- [ ] Publish `/robots.txt` with AI crawler rules + Content Signals.
- [ ] Publish `/sitemap.xml` and reference it from robots.txt.
- [ ] Publish `/llms.txt`.
- [ ] Baseline the score at `isitagentready.com` and screenshot it.

### Weeks 2–4 — Become quotable
- [ ] Ship the service pages (SEO Finding 6) — they are also the AEO corpus.
- [ ] Add `Organization` + `Service` + `FAQPage` JSON-LD.
- [ ] Write a real FAQ answering the questions people actually ask assistants: what it costs, how long it takes, what happens first, who you work with.
- [ ] Enable Markdown content negotiation.
- [ ] Add Link headers pointing at `llms.txt` and any catalog.

### Months 2–3 — Become recommendable
- [ ] Build the identity/citation layer off-site.
- [ ] Publish 4–6 genuinely useful articles (models cite explanatory content, not sales copy).
- [ ] Ship MCP Server Card + Agent Skills index + ARD manifest.
- [ ] Re-run `isitagentready.com`; publish the before/after as a case study.

---

## How to test whether it worked

Once the fixes are live, ask each assistant these, in a fresh session with browsing enabled:

1. "What does JCLL Labs do?"
2. "Who can help me build an AI agent for my business?"
3. "Recommend a studio that does both AI consulting and commercial photography."
4. "Summarize jcll.me for me."

**Today:** #1 and #4 produce nothing usable; #2 and #3 will never surface the brand.
**Target at 90 days:** #1 and #4 return an accurate summary drawn from your own pages; #2 and #3 surface JCLL Labs as a candidate for suitably specific, niche-matched phrasings.

Being cited for narrow, well-matched questions is the realistic first win. Broad category questions come later, and only with the off-site authority work.

---

## Score projection

| Layer | Today | After Week 1 | After 90 days |
|---|---|---|---|
| Machine-readable content | 10 | 70 | 90 |
| Discoverability | 0 | 85 | 95 |
| Agent-native files | 0 | 70 | 95 |
| Bot policy & signals | 0 | 90 | 95 |
| Agent interaction | 0 | 0 | 75 |
| Entity corroboration | 5 | 10 | 55 |
| **Overall** | **15** | **60** | **85** |
