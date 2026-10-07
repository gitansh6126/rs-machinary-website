#!/usr/bin/env node
/**
 * RS Machinery — catalog build step.
 * Reads the canonical catalog (data/products.json + data/products-hi.json + categories)
 * and regenerates every derived artifact so all site sections stay in sync:
 *   1. js/products-data.js / js/products-data-hi.js  (runtime catalog)
 *   2. sitemap.xml                                   (all active products)
 *   3. docs/manifest.json (site manifest for admin UI)
 * Run:  node scripts/build-catalog.js          (after any data/*.json edit)
 * CI:   npm run build (GitHub Pages workflow / Vercel build step)
 */
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');

const read = f => JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'));
const write = (f, s) => fs.writeFileSync(path.join(ROOT, f), s);

const productsEn = read('data/products.json');
const productsHi = read('data/products-hi.json');
const catsEn = read('data/categories.json');
const catsHi = read('data/categories-hi.json');
const settings = read('data/settings.json');

const SITE_URL = (settings.site_url || 'https://rsmachinary.in').replace(/\/$/, '');

const active = list => list.filter(p => String(p.active).toLowerCase() === 'true');
const sortOrd = list => [...active(list)].sort((a, b) => (a.sort_order || 99) - (b.sort_order || 99));

const norm = p => ({
  id: p.id,
  name: p.name,
  slug: p.slug,
  category_id: p.category_id || p.slug,
  category_name: p.category_name || p.name,
  seo_title: p.seo_title || p.name,
  seo_description: p.seo_description || '',
  short_description: p.short_description || '',
  description: p.description || '',
  image: p.image,
  gallery_images: Array.isArray(p.gallery_images) ? p.gallery_images : [],
  capacity: p.capacity || '',
  brand: p.brand || 'RS Machinery',
  condition: p.condition || 'New',
  warranty: p.warranty || '',
  delivery: p.delivery || '',
  featured: String(p.featured).toLowerCase() === 'true',
  active: String(p.active).toLowerCase() === 'true',
  sort_order: Number(p.sort_order) || 99,
  hero: String(p.hero || '').toLowerCase() !== 'false' && p.hero !== false,
  hero_title_line1: p.hero_title_line1 || p.name,
  hero_title_line2: p.hero_title_line2 || '',
  hero_description: p.hero_description || p.short_description || '',
  hero_features: Array.isArray(p.hero_features) ? p.hero_features : [],
  specifications: p.specifications || {},
  variations: Array.isArray(p.variations) ? p.variations : [],
  features: Array.isArray(p.features) ? p.features : [],
  applications: Array.isArray(p.applications) ? p.applications : [],
  faq: Array.isArray(p.faq) ? p.faq : [],
});

// ── 1. runtime catalogs ─────────────────────────────────────────────────
function jsCatalog(products, categories, comment) {
  return `/**
 * ${comment}
 * AUTO-GENERATED from data/products${categories === catsHi ? '-hi' : ''}.json — DO NOT EDIT BY HAND.
 * Edit data/products*.json (or the /admin panel) and run: node scripts/build-catalog.js
 */
window.RSM_PRODUCTS = ${JSON.stringify(products.map(norm), null, 2)};

window.RSM_CATEGORIES = ${JSON.stringify(categories.map(c => ({
    id: c.slug, name: c.name, slug: c.slug, description: c.description,
  })), null, 2)};
`;
}

const enSorted = sortOrd(productsEn);
const hiSorted = sortOrd(productsHi);
write('js/products-data.js', jsCatalog(enSorted, catsEn, 'RS Machinery — Product & Category Catalog (EN)'));
write('js/products-data-hi.js', jsCatalog(hiSorted, catsHi, 'RS Machinery — Product & Category Catalog (HI)'));

// ── 2. sitemap.xml ─────────────────────────────────────────────────────
let sm = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
sm += `  <url><loc>${SITE_URL}/</loc><changefreq>daily</changefreq><priority>1.0</priority></url>\n`;
sm += `  <url><loc>${SITE_URL}/products.html</loc><changefreq>daily</changefreq><priority>0.9</priority></url>\n`;
sm += `  <url><loc>${SITE_URL}/index-hi.html</loc><changefreq>weekly</changefreq><priority>0.8</priority></url>\n`;
sm += `  <url><loc>${SITE_URL}/products-hi.html</loc><changefreq>weekly</changefreq><priority>0.8</priority></url>\n`;
for (const p of enSorted) {
  sm += `  <url><loc>${SITE_URL}/product.html?slug=${p.slug}</loc><changefreq>weekly</changefreq><priority>0.8</priority></url>\n`;
}
for (const p of hiSorted) {
  sm += `  <url><loc>${SITE_URL}/product-hi.html?slug=${p.slug}</loc><changefreq>monthly</changefreq><priority>0.6</priority></url>\n`;
}
sm += `</urlset>\n`;
write('sitemap.xml', sm);

// ── 3. docs/manifest.json (admin quick-reference) ───────────────────────
write('docs/manifest.json', JSON.stringify({
  builtAt: new Date().toISOString(),
  siteUrl: SITE_URL,
  products: enSorted.map(p => ({ id: p.id, name: p.name, slug: p.slug, active: p.active, featured: p.featured, hero: p.hero })),
  categories: catsEn.map(c => ({ id: c.id, name: c.name, slug: c.slug })),
}, null, 2) + '\n');

console.log(`build-catalog: ${enSorted.length} EN + ${hiSorted.length} HI products → js/, sitemap.xml, docs/manifest.json`);
