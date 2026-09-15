# RS Machinery — Long-Term SEO & Business Strategy Plan (Do NOT execute yet)

> **Purpose**: A saved reference of what to do, which strategies to apply, and what needs
> a real human. This is a **plan / backlog only** — nothing here is implemented yet.
> Revisit and execute iteratively, one prioritized item at a time.
>
> **Date compiled**: 2026-08-29
> **Business**: RS Machinery — B2B lifting equipment supplier, Sirsa, Haryana.
> Live site: https://rsmachinary.in · GBP 4.2★ / 83 reviews · IndiaMART + Justdial listed.
> **Stack reality (this repo)**: Static HTML/CSS/JS + `data/*.json` catalog + `js/products-data.js`.
> Earlier `docs/ANCHORED_SUMMARY.md` describes a Google Apps Script/Sheets backend, city pages and
> price pages that exist in a **different/other working copy** (`D:\rs website`) — NOT in this repo.
> **Verify the real deployed site first** before assuming those pages are live.

---

## 0. Golden Rules (apply to every task below)

- **Pick the most specific truth.** Primary GBP category = what the business *IS* — e.g.
  "Mini Crane Dealer"/closest specific option beats generic "Machinery Dealer". Broad dilutes.
- **One page = one job.** Category pages, service pages, and product pages must not blur.
- **Depth beats length.** 800–1,500 words of genuinely useful page content; never thin (<300 words).
- **Write for humans + AI engines (AEO/GEO).** Award-winning, definition-first answers,
  question-shaped headings, FAQ, citations.
- **E-E-A-T everywhere.** Real names, real results, NAP consistency, certifications, reviews.
- **Consistency of NAP** (Name–Address–Phone) across GBP, site, IndiaMART, Justdial, directories.

---

## 1. Where The Site Is Today (current-state assessment)

### What exists in THIS repo (verified)
- **Pages**: `index.html`, `products.html`, `product.html` (slug-driven), `base/header.html`,
  `img/index.html`. `sirsa.html` exists but is deleted in git (untracked deletion) — verify.
- **Catalog data**: `data/products.json` (4 products), `data/categories.json` (4 categories),
  `js/products-data.js` (rich in-product SEO fields: seo_title, specifications, variations, FAQ).
- **SEO basics present**: `robots.txt`, `sitemap.xml`, `.htaccess` (HTTPS, www→non-www, GZIP,
  caching, security headers), canonical tags, Open Graph, LocalBusiness JSON-LD on home.
- **No blog, no guides, no price pages, no city pages, no schema on product pages**
  in this repo (despite the summary claiming them in another copy).

### SEO strengths
- Clean, semantic, canonicalized pages; strong product content already written.
- Local schema, featured products, WhatsApp/call CTAs, inquiry forms.

### SEO gaps (opportunity list)
1. Only **4 products / 4 categories** — massive catalogue room.
2. Product pages may use a **single H1/duplicate template** — check cannibalization.
3. **No schema** (`Product`, `Service`, `FAQ`) on `product.html` / `products.html`.
4. **No informational/blog layer** → no topical authority, few internal links.
5. **GBP under-optimized**: Q&A empty, no Google Posts, categories unverified.
6. **NAV/structure**: no clean Tier 1→2→3 hierarchy; nothing links to deep pages.
7. **No measurement**: no Search Console / Analytics confirmation, no rank tracking.
8. **Domain cleanliness**: confirm canonical domain & 404 handling of `product.html?slug=...`.

---

## 2. Content Strategy (long-term)

### 2.1 Category (GBP) selection — REVISIT FIRST
- Set **primary category** = most specific match for the top revenue product
  (e.g. "Mini Crane Dealer" / "Hoist Dealer" / closest existing option). Specific > broad.
- Add **2–4 relevant secondary categories** only for services actually delivered.
  Do NOT stuff all 9; do NOT add parent categories alongside child categories.
- Re-check the ~4,000 category list periodically (Google adds/renames/removes).
- **Human need**: Confirm with the business owner which single product/service is the
  highest-revenue, highest-search line. Only they know the truth.

### 2.2 Site architecture (Tiered hierarchy)
```
Tier 1  Homepage  → links to main category/pillar pages only (5–6 max)
Tier 2  Category/pillar pages  → "/monkey-crane-dealer/", "/electric-hoist/" ...
Tier 3  Specific product/service pages  → product.html?slug=...
        + location pages + guides + price pages + FAQ hub
```
Rules:
- Every important page reachable within **3 clicks** of home.
- No two pages target the same primary keyword (avoid cannibalization).
- Products → category page → homepage; blog/guides → relevant category page (internal links).
- **Human need**: Owner decision on catalogue expansion (which models, capacities, variations).

### 2.3 Page types to build (prioritized backlog)
1. **Category pillar pages** — 800–1,500 words defining the category, who it's for, process,
   price range, "how to choose", links to each product. Add category intro (150–200 words min).
2. **Product pages** — expand each with: definition-first paragraph, specs, variations,
   applications, FAQ (4–6 Q&A), social proof, pricing transparency, CTA ×3, schema.
3. **Price pages** (high buying intent): "Monkey Crane Price in Sirsa", "Electric Hoist Price",
   "Chain Pulley Block Price", "Steel Wire Rope Price 2026". Must have unique H1/title.
4. **Location/Service-area pages** (21+ cities: Hisar, Bathinda, Delhi NCR, etc.) — genuine
   local content (400–600 words, real local detail) — avoid thin doorway pages.
5. **Buying guides / blog** (topical authority + internal links + lead magnets):
   - Wire rope selection guide · Electric hoist vs chain block · Crane load capacity
     calculation · Hoist lifting speed · Safe working load. → Also as **calculators** (lead magnets).
6. **FAQ hub** — question-answer content for snippets + AI citation (AEO).

### 2.4 Keyword mapping (strategy)
- **Primary keyword** → title/H1/first 100 words (each page/service).
- **Question keywords** ("how", "what", "which", "is it worth") → FAQ + snippet targeting.
- **Entity keywords** (certifications, materials, specs, cities) → body, schema, credentials.
- Target **commercial intent** on service pages; **informational intent** on blog/guides.
- Never stuff all keyword types into one paragraph.

---

## 3. Technical SEO Strategy

- **Schema markup** (JSON-LD on every product/category/location page):
  `Product`, `Offer`, `AggregateRating`, `Service`, `LocalBusiness`, `FAQPage`, `BreadcrumbList`.
  Validate with Google Rich Results Test. Keep schema consistent with visible text.
- **Clean URLs / routing** — confirm `.htaccess` rewrite maps clean paths to pages;
  avoid duplicate `product.html?slug=` indexing issues; canonical tags on all.
- **Crawlability** — site in XML sitemap; no robots.txt blocks; ≤3 clicks; no orphan pages.
- **Core Web Vitals** — page speed, no layout shift, mobile-first.
- **Indexing hygiene** — submit sitemap to Search Console; verify GBP with site; fix 404s.

---

## 4. Local SEO & Google Business Profile (GBP)

- **Category** (see 2.1) — the #1 local relevance factor.
- **NAP consistency** across GBP, site footer, IndiaMART, Justdial, citations.
- Populate **Q&A** (pricing, delivery, service, warranty) — currently empty.
- **Google Posts** regularly (new stock, offers, tips).
- **Reviews** — respond to all; generate an owner-approved response strategy.
- **Service area** — define and keep clean (Sirsa + served cities).
- **Human need**: business owner runs the store; must supply photos, review responses,
  genuine offers, and confirm service-area facts. Cannot be fully automated.

---

## 5. Business / Revenue Strategy (long-term)

- **Catalogue expansion** — add more products beyond the 4 (winches, slings, EOT/jib cranes,
  chain blocks, hand hoists) based on the product profitability matrix already drafted
  (Electric Chain Hoist, Hand Chain Hoist, Wire Rope Slings, EOT Crane, Jib Crane scored top).
- **Lead magnets / calculators** — crane load capacity, hoist speed, wire rope SWL, chain
  block selector, price estimator → high-value inbound leads.
- **Pricing transparency** — publish ranges (3× conversion) where owner approves.
- **Case studies / proof** — real projects, measurable results, named clients.
- **Human need (critical)**: The owner must provide — true product list & prices, real
  testimonials/case studies, certifications, photos, and confirm VAT/GST + delivery facts.
  Never invent proofs. AI can draft; owner must approve every claim.

---

## 6. Human Intervention / Human Needs — Summary

| Need | Human action required |
|---|---|
| Confirm **highest-revenue product** for primary GBP category | Owner decision |
| **Real product catalogue** & pricing info | Owner supplies; AI drafts pages |
| **Case studies / testimonials / certifications** | Owner supplies real, verifiable proof |
| **Review responses & Google Posts** | Owner language/tone + approval |
| **Photos of products & showroom** | Owner captures/approves |
| **Pricing transparency decisions** | Owner approves published ranges |
| **GBP/IndiaMART/Justdial management** | Owner has account access; verify edits |
| **Service-area & NAP facts** | Owner confirms exact details |
| **Deployment & domain/hosting** | Owner (Hostinger + DNS + Search Console access) |

AI (this agent) can: draft content, build pages, produce schema, generate internal links,
prepare review/post/Q&A copy, and audit — but **final facts, approvals, and account access
must come from the human owner.**

---

## 7. Prioritized Execution Backlog (do later, one at a time)

### P0 — Foundations (verify before building)
- [ ] Verify what is actually live on rsmachinary.in (diff vs this repo & `D:\rs website`).
- [ ] Confirm canonical domain + www/HTTPS + 404 handling + Search Console + Analytics.
- [ ] Owner confirms primary revenue product + real catalogue + prices.

### P1 — Local & Categories
- [ ] Set/verify GBP primary + 2–4 secondary categories (specific).
- [ ] NAP consistency audit (GBP, IndiaMART, Justdial, site, citations).
- [ ] GBP Q&A + Google Posts + review-response strategy (owner-approved copy).

### P2 — Core SEO pages
- [ ] Category pillar pages (4) with intro/process/how-to-choose.
- [ ] Expand product pages: definition-first, FAQ, pricing, schema, CTA.
- [ ] Implement Product/Offer/FAQ/LocalBusiness schema across pages.

### P3 — Expansion & Authority
- [ ] Price pages (unique H1/title) for the 4 lines.
- [ ] Location pages for top cities (genuine local content, not thin).
- [ ] Buying guides + calculators (lead magnets).
- [ ] Internal linking overhaul (blog → category → product; hub-and-spoke).

### P4 — Measurement & Iteration
- [ ] Rank tracking baseline + search console goals.
- [ ] Review performance quarterly: pricing, testimonials, categories.

---

## 8. Notes / Open Questions to Resolve With Owner
- Actual files & pages live vs repo (two working copies mentioned: this repo and `D:\rs website`).
- Which products/capacities to add first (revenue priority).
- Willingness to publish real price ranges.
- Whether to pursue multi-city expansion now (effort vs reward).
- Access to GBP, Search Console, Analytics, Hostinger, DNS.
