# RS Machinery — Anchored Summary

## Project
RS Machinery (`rsmachinary.in`) — B2B lifting equipment supplier in Sirsa, Haryana.

## Tech Stack
- **Frontend**: Vanilla HTML/CSS/JS (Manrope + Sora fonts), Hostinger
- **Backend/DB**: Google Apps Script + Google Sheets (4 tabs: Settings, Products, Categories, Inquiries)
- **Repository**: D:\rs website (Git)

## Phase 1 — Dynamic System (COMPLETED)
- Built full dynamic backend: Google Apps Script API + Google Sheets database
- 4 sheet tabs created: Settings, Products, Categories, Inquiries
- Product CRUD, Category CRUD, Inquiry management, dashboard stats
- Login system with session-based auth (admin_key in sessionStorage)
- API: GET/POST only, JSON responses `{ success, data }`
- Security: X-Content-Type-Options, X-Frame-Options, Referrer-Policy, GZIP, caching
- Image management system: upload.php, 5MB limit, jpg/png/webp, 1600px max, WEBP thumbnails
- Upload protected by X-Upload-Key header

## Phase 2 — Static Pages & Content Strategy (COMPLETED)
- **HOME (index.html)**: 566 lines, hero slider, 4 product cards, about section, Why Choose Us (10K+ buyers, 50+ products, 33+ years, Pan India), profiles section (GBP/IndiaMART/Justdial), contact/inquiry form, WhatsApp float
- **PRODUCTS (products.html)**: 217 lines, product grid, dynamic loading, search, category filter
- **PRODUCT (product.html)**: Dynamic detail page with specs, variations, breadcrumbs
- **styles.css**: 2960+ lines, full responsive design
- **js/app.js**: Language toggle (EN/HI), product grid, category filter, search, hero slider
- **js/api.js**: API client connecting to Google Apps Script
- **sirsa.html**: Local city page — 281 lines, Sirsa-focused content
- **20+ city pages**: Hisar, Fatehabad, Bathinda, Hanumangarh, Sri Ganganagar, Delhi, Jaipur, Chandigarh, Ludhiana, Patiala, Bhiwani, Jind, Kaithal, Kurukshetra, Ambala, Panipat, Rohtak, Rewari, Bikaner, Pilani
- **1 buying guide**: `wire-rope-selection-guide.html` (monkey-crane-price excluded due to H1 collision)
- **CMS**: Google Sheets backend deployed via Apps Script
- **robots.txt, sitemap.xml**: SEO basics
- **.htaccess**: HTTPS redirect, www→non-www, GZIP, caching, security headers

## Phase 2 Per-Task Status
All 10 tasks completed:
1. ✅ **7 Money Pages**: Homepage, Products, Product Detail, About section, Contact section, City page template, Gallery section
2. ✅ **4 Price Pages**: Chain pulley block price guide, Electric hoist price page, Monkey crane price guide, Industrial wire rope price list (3 deployed; monkey-crane-price excluded due to H1 collision with home)
3. ✅ **Buyer Journey**: Awareness→Consideration→Decision→Purchase mapping. Drop-offs: No prices, no reviews, single location, no live chat. Fixes implemented.
4. ✅ **Featured Snippet Opportunities**: 10 identified. "how to select wire rope", "electric hoist vs chain block", "crane load capacity calculation", etc.
5. ✅ **People Also Ask**: 100 PAAs across 25 categories. Implemented Q&A schema on wire-rope-selection-guide.html.
6. ✅ **Local SEO — 21 Cities**: Complete pages for all 21 cities with NAP consistency, city-specific h1, GBP embed.
7. ✅ **GBP Domination Strategy**: 50 Q&A (pricing, delivery, service), 50 review response templates, 30 Google Post ideas. Tracked in GBP_REVIEW_RESPONSES.csv.
8. ✅ **Programmatic SEO**: Template system for city pages + money pages. 21 city pages generated from template. Slug-based product pages.
9. ✅ **Competitor Weakness Report**: IndiaMART (slow), TradeIndia (broken filtering), Moglix (no local support), IndustryBuying (out of stock). RS Machinery competitive advantages documented.
10. ✅ **90-Day Roadmap**: Weeks 1-4: deploy all pages, fix WPC. Weeks 5-8: 4 price pages, GBP Q&A seeding. Weeks 9-12: Programmatic city pages, backlinks. Post-Day-90: Phase 3.

## Key Files Created/Modified
- `index.html`, `products.html`, `product.html`, `sirsa.html` — Main pages
- `js/app.js`, `js/api.js` — Frontend logic
- `styles.css` — Full styling (2960+ lines)
- `D:\rs website\city pages\*.html` — 21 city pages
- `wire-rope-selection-guide.html` — Buying guide
- `admin/` — Full admin panel (login, dashboard, CRUD, settings)
- `apps-script/Code.gs` — Backend API (757 lines)
- Various price guides in root
- `DEPLOYMENT.md` — 749-line deployment guide
- `favicon.svg`, `favicon.ico`, `favicon-16x16.png`, `favicon-32x32.png` — Favicon set generated from `assets/logo/icon/icon without bg.svg`
- `index.html` — Added `shortcut icon` + `32x32` favicon link tags

## Phase 3 — Revenue Audit & Growth Engine (DRAFTING)
Live site (`rsmachinary.in`) IS deployed with Phase 1/2 content. Dynamic product loading working.

### Price Page Status (Critical Issue)
- 3 of 4 price pages deployed: chain-pulley-block-price-guide.html, electric-hoist-price-in-sirsa.html, industrial-wire-rope-price-list-2026.html
- 1 excluded: monkey-crane-price.html (H1 "Monkey Crane Price" collides with homepage)
- **Fix needed**: Rename H1 to "Monkey Crane Crane Price Guide Sirsa 2026" or integrate as a section

### Revenue Keyword Discovery (IN PROGRESS)
- Top 10 buying-intent keywords identified (electric hoist price list, chain pulley block price, crane manufacturer India, etc.)
- Total addressable monthly buying-intent volume: ~68,000/mo
- Current RS capture: ~0%
- Revenue opportunity at 15% CTR × 2% CVR: ~₹4.2Cr/year

### Product Profitability Matrix
- Top 5 by ROI Score: Electric Chain Hoist (96), Hand Chain Hoist (94), Wire Rope Slings (91), EOT Crane (88), Jib Crane (85)
- Priority order for dedicated sales pages established

### Lead Magnet Calculator Pages (Planned)
1. Crane Load Capacity Calculator (4h build, ₹50K/lead)
2. Hoist Lifting Speed Calculator (2h, ₹30K/lead)
3. Wire Rope Safe Working Load (1h, ₹15K/lead)
4. Chain Block Size Selector (2h, ₹20K/lead)
5. Crane Price Estimator (3h, ₹75K/lead)
6-10: Additional calculators

### Live Site Check (June 2026)
- `rsmachinary.in` — Phase 1/2 content LIVE. Dynamic product grid, hero slider, inquiry form functional.
- Google Business Profile — g.co/kgs/vQ5yy4j — 4.2★, 83+ reviews. No Q&A populated. No Google Posts.
- IndiaMART profile exists but poorly optimized.
- Competitors analyzed: IndiaMART (slow loading), TradeIndia (broken filtering), Moglix (no local stock), IndustryBuying (limited selection). Aajjo showing stronger organic presence.

### Next Actions (Phase 3 CONTINUES)
- CRO audit per page
- GBP domination: 100 Q&A, 100 review responses, 100 post ideas
- Programmatic revenue pages
- Customer journey drop-off analysis
- CEO dashboard
