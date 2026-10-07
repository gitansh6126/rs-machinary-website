# Admin Panel — Products & SEO

The admin panel is a **pure static SPA** at [`admin/index.html`](../admin/index.html) —
no server, no database. It reads and writes the same `data/*.json` files the live
site renders from, using the GitHub Contents API. Deploying the admin is just
deploying the site; it works on GitHub Pages, Vercel, Netlify or any static host.

## What it manages

| Tab | Data files | Site effect |
|---|---|---|
| 📦 Products | `data/products.json`, `data/products-hi.json` | Hero slider slides, featured grid, products page, product detail pages, form dropdown, sitemap, JSON-LD |
| 🗺️ SEO City Pages | `data/seo-links.json` | "Service Areas" footer column (internal links for local SEO) |
| 🗂️ Categories | `data/categories.json`, `data/categories-hi.json` | Category filter, footer product links, hero badge names |

## Two connection modes

### Option A — Vercel/Netlify serverless proxy (recommended)
The PAT never reaches the browser.

1. Import this repo into Vercel (build command `npm run build`, output `.` — `vercel.json` already sets this).
2. Project → Settings → Environment Variables → add `GITHUB_MACHINERY_PAT` = a fine-grained PAT (Contents: Read & write, this repo only).
3. Open `https://<your-app>.vercel.app/admin` and set Connection → API endpoint to `https://<your-app>.vercel.app/api`.

`api/publish.js` commits **all changed files in one atomic commit** (Git Data API), so
EN + HI catalogs, categories and SEO links always land together.

### Option B — Direct PAT (GitHub Pages / local / any static host)
1. GitHub → Settings → Developer settings → **Fine-grained tokens** → Generate.
2. Repository access: *only this repo*. Permissions: **Contents → Read & write**.
3. Open `/admin`, paste the PAT into Connection. It is stored in `sessionStorage`
   (cleared when the tab closes) — never in localStorage, never in the repo.

> On pure-static hosts Option B is the only mode; on Vercel use Option A.

## Publishing flow

1. Edit → **Save Product** (local only, browser memory)
2. **↑ Publish to GitHub** → commits `data/*.json` in one commit
3. Deploy pipeline picks the commit up automatically:
   - **GitHub Pages**: workflow runs `node scripts/build-catalog.js`, commits the
     regenerated `js/products-data*.js` + `sitemap.xml` back to main, then publishes.
   - **Vercel/Netlify**: `npm run build` regenerates the same artifacts at deploy time.

The site **never serves stale products**: every page renders from the regenerated
`js/products-data*.js`, and `data/settings.json → site_url` controls canonical URLs.

## Catalog field reference

- `slug` — URL-safe unique id (`product.html?slug=…`). EN and HI share the slug.
- `featured` — show on homepage grid. `hero` — add as hero slider slide.
- `active` — hide from the whole site without deleting.
- `hero_title_line1/2`, `hero_description`, `hero_features[]` — hero slide copy.
- HI fields fall back to EN when left empty.

## Deployment targets

| Target | How |
|---|---|
| **GitHub Pages** | Repo → Settings → Pages → Source: *GitHub Actions* (the `deploy-pages.yml` workflow does the rest) |
| **Vercel** | Import repo, add PAT env var, done (`vercel.json` sets build/rewrites) |
| **Hostinger (rsmachinary.in)** | `npm run build` then upload; `.htaccess` unchanged — the data-driven site runs identically |

## Security notes

- The PAT is scoped **read+write Contents, one repo** — it cannot touch anything else.
- In proxy mode the token lives only in Vercel env vars.
- `/admin` sends `X-Robots-Tag: noindex` on Vercel and is excluded in `robots.txt`.
- Commit messages from the panel are prefixed `admin:` for easy auditing.
