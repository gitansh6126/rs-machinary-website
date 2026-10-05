# AI / AGENT BRIEFING — rs-machinary-website-v2

Everything an agent needs before touching any file in this repo. Read this first;
see `D:\client works\rs new\tommow.md` for the latest working context.

---

## 1. The non-negotiables

1. **Connection-first motive.** This website shows only the MAIN products — it is a
   teaser, not a catalogue. Never build it to "stick" a visitor browsing everything.
   Every section must funnel visitors to CONNECT: WhatsApp, call, or showroom visit.
   The "OUR MOTIVE" block in `index.html` / `index-hi.html` (About section) states this
   explicitly — do not remove or weaken it.
2. **EN + HI parity.** Every public-facing page exists in two files (`index.html` /
   `index-hi.html`, `product.html` / `product-hi.html`, `products.html` /
   `products-hi.html`). Any content change must land in both, same placement.
3. **One WhatsApp number.** `918708795253` (`wa.me/918708795253`). All inquiry CTAs use
   it, with URL-encoded prefill text naming the product.
4. **Do not break the SEO integration.** `js/seo-links.js` + the 1 include line per HTML
   page + `sitemap.xml` are part of the seo-admin system — additive only, no-op until
   pages publish. → `D:\client works\rs new\tommow.md`, `SEO_ADMIN_RESEARCH\`
5. **`styles.css` is the single stylesheet.** No new CSS files, no build step, no
   framework. Reuse `redesign-*` classes; follow the inline-style pattern already used
   in the HTML for one-off layout tweaks.
6. **The live repo is `rs-machinary-website-v2`.** `rs-machinary-website-v2-COPY` and
   `Archive-2026-09-17\rs-machinary-website\` are mirrors/archives — keep mirrors in
   sync when asked, never cite archives as authoritative.
7. **Never delete anything.** Quarantine superseded files out of the repo; the client
   commits deliberately.

---

## 2. Orientation — 60 seconds

| | |
|---|---|
| Live repo | `D:\client works\rs new\rs-machinary-website-v2\` (git, uncommitted changes await client commit) |
| Pages | index / products / product (× EN + HI) + 404 (× EN + HI) |
| Styles | `styles.css` — `redesign-*` class system, ~53k lines incl. print rules |
| Data | `data\` (e.g. `seo-links.json`), `js\` (seo-links.js, main.js) |
| CTAs | Hero + product cards: "Visit Us" (Google Maps directions) + WhatsApp |
| Motive block | About section, after section header, before stats grid — EN L336 / HI L335 (may shift; grep `OUR MOTIVE`) |
| Deploy | Upload repo contents to `public_html\`; `.htaccess` included |

---

## 3. Homepage funnel (the conversion logic)

```
Hero slider   → main product slides, Visit Us + WhatsApp CTAs
Products      → 4 main products only (the "main things")
OUR MOTIVE    → "not everything" + connect CTAs   ← the attract-to-connect hook
About         → 33+ years, stats, verified profiles (Google / IndiaMART / Justdial)
Why Choose Us → Physical Showroom, Pan India Delivery, Direct Pricing, Trust
Contact       → inquiry form + direct call
```

When adding sections, keep the funnel: show the main thing, then push to connect.
