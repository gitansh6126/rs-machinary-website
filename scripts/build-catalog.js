#!/usr/bin/env node
/**
 * RS Machinery — catalog build step.
 * Canonical catalog = data/products.json (+ -hi) — regenerate everything else:
 *   js/products-data.js / js/products-data-hi.js (runtime catalog)
 *   sitemap.xml, docs/manifest.json
 * The runtime catalog keeps the exact shape js/main.js already consumes
 * (plus hero_* fields used by the hero showcase renderer).
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

const SITE_URL = 'https://rsmachinary.in';

const isOn = v => String(v).toLowerCase() !== 'false' && v !== false;
const sortOrd = list => [...list].sort((a, b) => (a.sort_order || 99) - (b.sort_order || 99));

const norm = p => {
  const o = { ...p };
  o.featured = isOn(p.featured);
  o.active = isOn(p.active);
  o.hero = isOn(p.hero);
  if (!Array.isArray(o.hero_features)) o.hero_features = [];
  return o;
};

function jsCatalog(products, categories, hi) {
  return `/**
 * ${hi ? 'Hindi' : 'English'} product & category catalog.
 * AUTO-GENERATED from data/products${hi ? '-hi' : ''}.json — DO NOT EDIT BY HAND.
 * Edit the JSON (or the /admin panel) and run: node scripts/build-catalog.js
 */
window.RSM_PRODUCTS = ${JSON.stringify(sortOrd(products).map(norm), null, 2)};

window.RSM_CATEGORIES = ${JSON.stringify(categories.map(c => ({
    id: c.slug, name: c.name, slug: c.slug, description: c.description || '',
  })), null, 2)};
`;
}

write('js/products-data.js', jsCatalog(productsEn, catsEn, false));
write('js/products-data-hi.js', jsCatalog(productsHi, catsHi, true));

// sitemap
let sm = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
sm += `  <url><loc>${SITE_URL}/</loc><changefreq>daily</changefreq><priority>1.0</priority></url>\n`;
sm += `  <url><loc>${SITE_URL}/products.html</loc><changefreq>daily</changefreq><priority>0.9</priority></url>\n`;
sm += `  <url><loc>${SITE_URL}/index-hi.html</loc><changefreq>weekly</changefreq><priority>0.8</priority></url>\n`;
sm += `  <url><loc>${SITE_URL}/products-hi.html</loc><changefreq>weekly</changefreq><priority>0.8</priority></url>\n`;
for (const p of sortOrd(productsEn)) if (isOn(p.active))
  sm += `  <url><loc>${SITE_URL}/product.html?slug=${p.slug}</loc><changefreq>weekly</changefreq><priority>0.8</priority></url>\n`;
for (const p of sortOrd(productsHi)) if (isOn(p.active))
  sm += `  <url><loc>${SITE_URL}/product-hi.html?slug=${p.slug}</loc><changefreq>monthly</changefreq><priority>0.6</priority></url>\n`;
sm += `</urlset>\n`;
write('sitemap.xml', sm);

write('docs/manifest.json', JSON.stringify({
  builtAt: new Date().toISOString(),
  siteUrl: SITE_URL,
  products: sortOrd(productsEn).map(p => ({ id: p.id, name: p.name, slug: p.slug, active: isOn(p.active), featured: isOn(p.featured), hero: isOn(p.hero) })),
  categories: catsEn.map(c => ({ id: c.id, name: c.name, slug: c.slug })),
}, null, 2) + '\n');

console.log(`build-catalog: ${productsEn.length} EN + ${productsHi.length} HI products → js/, sitemap.xml, manifest`);
