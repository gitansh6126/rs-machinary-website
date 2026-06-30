// RS Machinery – City Product SEO Page Generator
// Single template engine. Generates all 20 pages (4 products x 5 cities).
//
// Usage: node generate.js
// Output: ./output/{product-slug}/{city-slug}/index.html

const fs = require('fs');
const path = require('path');

// ── Load Data ──────────────────────────────────────────────────────────────
const products = JSON.parse(fs.readFileSync('./data/products.json', 'utf8')).products;
const cities   = JSON.parse(fs.readFileSync('./data/cities.json', 'utf8')).cities;
const template = fs.readFileSync('./template.html', 'utf8');

// ── Helpers ────────────────────────────────────────────────────────────────

function capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

function escapeJson(s) {
  return s
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t');
}

function listItems(arr) {
  return arr.map(item => `                        <li>${item}</li>`).join('\n');
}

function priceRows(variants) {
  return variants.map(v =>
    `                    <tr><td>${v.name}</td><td>${v.price}</td></tr>`
  ).join('\n');
}

// ── FAQ Generator ──────────────────────────────────────────────────────────

function generateFAQ(product, city, distance) {
  const p = product.name;
  const c = city.name;
  const d = city.distance_from_sirsa_km;
  const state = city.state;
  const phone = '+918708795253';

  const faqs = [
    {
      q: `What is the price of ${p} in ${c}?`,
      a: `The price of ${p.toLowerCase()} in ${c} ranges from ${product.price_range.text}. The exact price depends on capacity, specifications, and quantity. For the latest pricing available in ${c}, call RS Machinery at ${phone}. We offer direct supplier rates with no middleman markup.`
    },
    {
      q: `Where can I buy ${p} in ${c}?`,
      a: `RS Machinery is your trusted supplier of ${p.toLowerCase()} serving ${c}, ${state}. While our physical shop is in Sirsa (${d} km from ${c}), we deliver ${p.toLowerCase()} directly to ${c}. Call ${phone} to place your order or visit our Sirsa shop to inspect products before purchase.`
    },
    {
      q: `Do you deliver ${p} to ${c}?`,
      a: `Yes, RS Machinery delivers ${p.toLowerCase()} to ${c} and across ${state}. Delivery time is typically ${d > 70 ? '2-3 business days' : '1-2 business days'} for ${c}. Contact us at ${phone} for delivery charges and timelines specific to your location in ${c}.`
    },
    {
      q: `What capacity ${p} is suitable for my business in ${c}?`,
      a: `The right capacity depends on your specific lifting needs. For construction sites in ${c}, a ${product.capacity} ${p.toLowerCase()} is typically recommended. Our team can advise you based on your application. Call ${phone} for a free consultation.`
    },
    {
      q: `Is RS Machinery a verified supplier of ${p} in ${c}?`,
      a: `Yes, RS Machinery is a verified and registered business with 33+ years of experience. We are listed on Google Business Profile (4.2★, 83+ reviews), IndiaMART, and Justdial. We provide GST billing and have a physical shop in Sirsa, Haryana. Customers from ${c} regularly purchase from us.`
    },
    {
      q: `Can I get a quote for ${p} delivered to ${c}?`,
      a: `Absolutely. Call +918708795253 or message us on WhatsApp for a customized quote for ${p.toLowerCase()} delivery to ${c}. We provide pricing for all variants including ${product.price_variants.map(v => v.name).join(', ')}. Bulk order discounts are available.`
    },
    {
      q: `What industries use ${p} in ${c}?`,
      a: `In ${c}, ${p.toLowerCase()} is used by ${city.industries.slice(0, 3).join(', ')}, and other industrial sectors for material handling and lifting operations. RS Machinery supplies ${p.toLowerCase()} to factories, construction sites, workshops, and warehouses across ${c} and ${state}.`
    }
  ];

  const faqHtml = faqs.map((f, i) =>
    `            <div class="city-faq-item" itemscope itemprop="mainEntity" itemtype="https://schema.org/Question">\n` +
    `                <h3 itemprop="name">${f.q}</h3>\n` +
    `                <div itemscope itemprop="acceptedAnswer" itemtype="https://schema.org/Answer">\n` +
    `                    <p itemprop="text">${f.a}</p>\n` +
    `                </div>\n` +
    `            </div>`
  ).join('\n');

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(f => ({
      "@type": "Question",
      "name": f.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": f.a
      }
    }))
  };

  return { faqHtml, faqSchema: JSON.stringify(faqSchema, null, 2) };
}

// ── Schema Generators ──────────────────────────────────────────────────────

function generateLocalBusinessSchema(product, city) {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "RS Machinery",
    "url": `https://rsmachinary.in/${product.slug}/${city.name_lower}/`,
    "telephone": "+918708795253",
    "whatsApp": "+918708795253",
    "description": `${product.name} supplier in ${city.name}, ${city.state}. Direct pricing from RS Machinery Sirsa. Call +91-8708795253.`,
    "image": "https://rsmachinary.in/assets/logo/icon/main_non_bg_logo.png",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Begu Road, Wali Gali, Near Parshuram Chowk, Opposite Sarsainath Mandir",
      "addressLocality": "Sirsa",
      "addressRegion": "Haryana",
      "postalCode": "125055",
      "addressCountry": "IN"
    },
    "areaServed": [
      { "@type": "City", "name": city.name, "sameAs": `https://en.wikipedia.org/wiki/${city.name.replace(/ /g, '_')}` },
      { "@type": "City", "name": "Sirsa" }
    ],
    "priceRange": product.price_range.text,
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.2",
      "reviewCount": "83"
    },
    "openingHours": "Mo-Sa 09:00-19:00",
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": `${product.name} in ${city.name}`,
      "itemListElement": product.price_variants.map(v => ({
        "@type": "Offer",
        "itemOffered": {
          "@type": "Product",
          "name": `${product.name} – ${v.name}`,
          "price": v.price,
          "priceCurrency": "INR"
        }
      }))
    }
  }, null, 2);
}

function generateBreadcrumbSchema(product, city) {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://rsmachinary.in/" },
      { "@type": "ListItem", "position": 2, "name": product.name, "item": `https://rsmachinary.in/${product.slug}/` },
      { "@type": "ListItem", "position": 3, "name": `${product.name} in ${city.name}`, "item": `https://rsmachinary.in/${product.slug}/${city.name_lower}/` }
    ]
  }, null, 2);
}

function generateProductSchema(product, city) {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Product",
    "name": `${product.name} – Supplier in ${city.name}`,
    "description": product.description.substring(0, 200),
    "brand": { "@type": "Brand", "name": "RS Machinery" },
    "offers": {
      "@type": "AggregateOffer",
      "priceCurrency": "INR",
      "lowPrice": product.price_range.min,
      "highPrice": product.price_range.max,
      "availability": "https://schema.org/InStock",
      "seller": { "@type": "Organization", "name": "RS Machinery" }
    }
  }, null, 2);
}

// ── Content Generators ─────────────────────────────────────────────────────

function generateContent(product, city) {
  const p = product.name;
  const p_lower = product.name.toLowerCase();
  const c = city.name;
  const s = city.state;
  const d = city.distance_from_sirsa_km;

  const isHome = city.is_home;
  const locationPhrase = isHome
    ? `in ${c}`
    : `in ${c}, ${s} (${d} km from Sirsa)`;

  const block1 = `RS Machinery is a trusted supplier of ${p_lower} ${locationPhrase}. ` +
    `We serve ${city.industries.join(', ')}, and other industrial sectors with quality ${p_lower} solutions. ` +
    `Our ${p_lower} range includes ${product.price_variants.map(v => v.name).join(', ')}, ` +
    `all built for reliable performance in demanding applications. ` +
    `${isHome ? 'Visit our shop in Sirsa to see our products in person.' : `We deliver to ${c} directly from our Sirsa warehouse.`}`;

  const industriesDetail = city.industries.join(', ');
  const block2 = `${c} has a growing industrial base with strengths in ${industriesDetail}. ` +
    `Businesses in ${c} rely on RS Machinery for quality ${p_lower} that keeps their operations running. ` +
    `Our ${p_lower} is built ${product.features[0].toLowerCase()} for long service life ` +
    `and minimal downtime. Whether you need a ${p_lower} for ${product.applications[0]} ` +
    `or ${product.applications[1]}, we have the right solution at the right price.`;

  const block3 = `RS Machinery provides complete support for ${p_lower} buyers ${locationPhrase}. ` +
    `From product selection guidance to after-sales service, our team ensures you get the right equipment ` +
    `for your needs. We offer competitive pricing for bulk orders, GST billing for business purchases, ` +
    `and prompt delivery to ${c}. With 33+ years of industry experience and a physical shop in Sirsa, ` +
    `RS Machinery is the preferred choice for ${p_lower} buyers across North India.` +
    `${isHome ? '' : ` Contact us today for ${p_lower} price in ${c}.`}`;

  return { block1, block2, block3 };
}

// ── Page Generator ─────────────────────────────────────────────────────────

function generatePage(product, city) {
  const pSlug = product.slug;
  const cSlug = city.name_lower;
  const cName = city.name;
  const state = city.state;

  const content = generateContent(product, city);
  const { faqHtml, faqSchema } = generateFAQ(product, city);
  const localBizSchema = generateLocalBusinessSchema(product, city);
  const breadSchema = generateBreadcrumbSchema(product, city);
  const prodSchema = generateProductSchema(product, city);

  const deliveryTime = city.distance_from_sirsa_km === 0
    ? 'Same day'
    : city.distance_from_sirsa_km > 70
      ? '2-3 business days'
      : '1-2 business days';

  const seoTitle = `${product.name} ${city.local_seo_terms[0]} – Price, Supplier & Dealer | RS Machinery`;
  const metaDesc = `RS Machinery supplies ${product.name.toLowerCase()} ${city.local_seo_terms[0]}, ${state}. ` +
    `${product.capacity} capacity. Price: ${product.price_range.text}. Direct supplier, GST billing, ` +
    `delivery to ${cName}. Call +91-8708795253.`;
  const ogTitle = `${product.name} Supplier ${city.local_seo_terms[0]} | ${city.name}, ${state}`;

  const h1 = `${product.name} Supplier ${city.local_seo_terms[0]} – ${city.name}, ${state}`;
  const h2Services = `${product.name} Services & Support ${city.local_seo_terms[0]}`;

  const intro = `Looking for a reliable ${product.name.toLowerCase()} supplier ${city.local_seo_terms[0]}, ${state}? ` +
    `RS Machinery supplies quality ${product.name.toLowerCase()} at direct prices. ` +
    `Our range includes ${product.price_variants.map(v => v.name).join(', ')} ` +
    `with prices from ${product.price_range.text}. ` +
    `We serve ${city.industries.slice(0, 3).join(', ')} in ${cName} and deliver across ${state}.`;

  const page = template
    .replace(/{SEO_TITLE}/g,       seoTitle)
    .replace(/{META_DESCRIPTION}/g, metaDesc)
    .replace(/{OG_TITLE}/g,        ogTitle)
    .replace(/{H1}/g,              h1)
    .replace(/{H2_SERVICES}/g,     h2Services)
    .replace(/{INTRO_PARAGRAPH}/g, intro)
    .replace(/{PRODUCT_NAME}/g,    product.name)
    .replace(/{PRODUCT_NAME_LOWER}/g, product.name.toLowerCase())
    .replace(/{PRODUCT_SLUG}/g,    pSlug)
    .replace(/{CITY_NAME}/g,       cName)
    .replace(/{CITY_SLUG}/g,       cSlug)
    .replace(/{STATE}/g,           state)
    .replace(/{CAPACITY}/g,        product.capacity)
    .replace(/{PRICE_RANGE}/g,     product.price_range.text)
    .replace(/{DISTANCE_FROM_SIRSA}/g,
      city.distance_from_sirsa_km === 0
        ? 'Home city'
        : `${city.distance_from_sirsa_km} km`)
    .replace(/{DELIVERY_TIME}/g,   deliveryTime)
    .replace(/{INDUSTRIES_SHORT}/g, city.industries.slice(0, 3).join(', '))
    .replace(/{INDUSTRIES_LIST}/g, listItems(city.industries))
    .replace(/{FEATURES_LIST}/g,   listItems(product.features))
    .replace(/{PRICE_TABLE_ROWS}/g, priceRows(product.price_variants))
    .replace(/{CONTENT_BLOCK_1}/g, content.block1)
    .replace(/{CONTENT_BLOCK_2}/g, content.block2)
    .replace(/{CONTENT_BLOCK_3}/g, content.block3)
    .replace(/{FAQ_HTML}/g,        faqHtml)
    .replace(/{LOCALBUSINESS_SCHEMA}/g, localBizSchema)
    .replace(/{BREADCRUMB_SCHEMA}/g,  breadSchema)
    .replace(/{PRODUCT_SCHEMA}/g,     prodSchema)
    .replace(/{FAQ_SCHEMA}/g,         faqSchema);

  return page;
}

// ── Main ───────────────────────────────────────────────────────────────────

function main() {
  let total = 0;

  for (const product of products) {
    for (const city of cities) {
      const outDir = path.join('./output', product.slug, city.name_lower);
      fs.mkdirSync(outDir, { recursive: true });
      const html = generatePage(product, city);
      const outFile = path.join(outDir, 'index.html');
      fs.writeFileSync(outFile, html, 'utf8');
      total++;
      console.log(`  ✓ ${product.slug}/${city.name_lower}/`);
    }
  }

  console.log(`\n✅ ${total} pages generated in ./output/`);
}

main();
