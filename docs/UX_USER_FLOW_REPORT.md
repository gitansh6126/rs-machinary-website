# RS Machinery — UI/UX User Flow Report

**Site**: rsmachinary.in | **Type**: B2B Industrial Machinery Lead Generation  
**Updated**: June 2026

---

## 1. User Personas

| Persona | Goal | Entry Point |
|---------|------|-------------|
| **Construction Contractor** (Haryana/Punjab/Rajasthan) | Find monkey crane or hoist pricing near their city | Google Search → City+Product landing page |
| **Factory/Warehouse Manager** | Compare electric hoist specs & request quote | Google Search → Products page or Product detail |
| **Local Buyer** (Sirsa area) | Visit showroom or call directly | Direct visit, Google Maps, or Homepage |
| **Bulk Reseller** (Pan India) | Get bulk pricing via inquiry form | Products page → Inquiry form |

---

## 2. Primary User Flows

### Flow A: SEO-Driven City + Product Landing → Conversion

```
Google Search
  └─ "monkey crane price in hisar"
      └─ rsmachinary.in/monkey-crane/hisar/  (product-city.html)
          ├─ See price badge, H1, hero stats (distance, capacity, delivery)
          ├─ Read content: industries served, features, price table
          ├─ FAQ accordion (7 questions w/ schema)
          └─ Conversion options:
              ├─ Click-to-Call (+91-8708795253)
              ├─ WhatsApp (pre-filled with product name)
              └─ "Send Inquiry" → scrolls to contact / opens inquiry form
```

**UX Notes**:  
- Hero section immediately shows price range badge + key info grid (distance, capacity, delivery)  
- CTA buttons always visible below hero and in sticky CTA section  
- FAQ accordion reduces scroll depth — answers are inline  
- No navigation clutter — single-purpose page for that product+city combo  
- Schema markup (LocalBusiness + Product + FAQ + Breadcrumb) for rich snippets

### Flow B: Homepage → Product Browse → Inquiry

```
Homepage (index.html)
  ├─ Hero Section: stats (100+ products, 33+ years), CTA buttons
  ├─ Product Slider (pslider): 4 featured products
  │   ├─ Touch swipe / keyboard nav / edge hover
  │   └─ "View Details" → product.html?slug=...
  │   └─ "WhatsApp" → direct WhatsApp chat
  ├─ Product Grid: 4 static product cards
  │   ├─ "View Details" → product.html?slug=...
  │   └─ "WhatsApp" → direct WhatsApp chat
  ├─ About Section: brand story, feature grid  
  ├─ Why Choose Us: stats counters, descriptions
  ├─ Profiles: GBP (4.2★, 83+ reviews), IndiaMART, Justdial
  └─ Contact Section: inquiry form (name + phone + product)
      └─ Submit → API call → success message
```

**UX Notes**:  
- Sticky header with "Call Now" always accessible  
- Floating WhatsApp button (fixed bottom-right) on all pages  
- Language toggle (EN/HI) on homepage via `data-i18n` attributes  
- Scroll animations (IntersectionObserver) on product cards  
- Product slider has swipe momentum + edge zone preview for desktop

### Flow C: Products Listing Page → Filter/Search → Detail

```
Products (products.html)
  ├─ Category filter buttons (All, Monkey Crane, Electric Hoist, etc.)
  ├─ Search input (400ms debounce)
  ├─ Products Grid (dynamic, paginated 20/page)
  │   ├─ Skeleton loading animation while fetching
  │   ├─ "Load More" pagination button
  │   └─ Each card: image, category badge, title, description
  │       ├─ "View Details" → product.html?slug=...
  │       └─ "WhatsApp" → direct WhatsApp chat
  └─ Results counter: "Showing X of Y products"
```

**UX Notes**:  
- Skeleton cards with pulse animation prevent layout shift  
- Debounced search reduces API calls  
- Category filter retains state with `.is-active` class  
- Empty state: "No products found. Try a different search or category."

### Flow D: Product Detail Page → Spec Review → Conversion

```
Product Detail (product.html?id=X or ?slug=Y)
  ├─ Breadcrumb (Home > Products > Product Name)
  ├─ Image with lightbox (click to fullscreen)
  ├─ Gallery thumbnails
  ├─ Product info: name, category, short description, full description
  ├─ Specifications table (label-value pairs)
  ├─ Variants table (name, price, SKU, stock status)
  ├─ FAQ accordion (4 product-specific Q&As w/ schema)
  └─ Conversion buttons:
      ├─ "Enquire on WhatsApp" (pre-filled message)
      └─ "Call Now"
```

**UX Notes**:  
- Lightbox overlay on image click, close via Escape or overlay click  
- Gallery thumbnails swap main image on click  
- Variation table shows stock status (In Stock / Out of Stock)  
- SEO meta tags dynamically updated per product  
- Product schema injected for rich results

### Flow E: Direct Call / WhatsApp Conversion

```
Any Page
  ├─ Sticky Header: "Call Now" button (visible on all pages)
  ├─ Footer: "Call for Price" + "WhatsApp Quote"
  ├─ Floating WhatsApp button (fixed bottom-right)
  ├─ Floating "Visit Now" (Google Maps link, bottom-right)
  └─ Inquiry Form (on homepage contact section)
      └─ Fields: Name, Phone, Product message
      └─ Submit → POST /api/index.php (route=addInquiry)
      └─ Success: "Thank you! We will contact you shortly."
      └─ Error: alert + retry
```

---

## 3. Conversion Touchpoints per Page

| Page | Primary CTA | Secondary CTA | Tertiary CTA |
|------|-------------|---------------|--------------|
| Homepage | Call Now (header) | WhatsApp Float | Inquiry Form |
| Products | View Details | WhatsApp per card | Call Now (header) |
| Product Detail | Enquire on WhatsApp | Call Now | Gallery/Lightbox |
| Product-City | Call Now (hero) | WhatsApp | Send Inquiry |
| Sirsa Page | Call Now | WhatsApp | Product links |

---

## 4. Micro-Interactions & UX Details

| Element | Behavior |
|---------|----------|
| **Mobile Menu** | Hamburger → full overlay with nav + phone; close via X, overlay click, or Escape |
| **Product Slider** | Infinite loop, edge preview (4% peek), touch swipe with momentum, keyboard arrows, progress bar, counter |
| **Skeleton Loading** | 8 pulse-animated placeholder cards while API responds |
| **Lightbox** | Fullscreen image overlay with close button, backdrop click, Escape key |
| **FAQ Accordion** | Click question → toggle `aria-expanded` + show/hide answer; delegated event listener |
| **Language Toggle** | EN ↔ HI; updates `data-i18n` elements, meta tags, and `lang` attribute |
| **Scroll Animation** | Cards fade-in-up via IntersectionObserver (threshold 0.1) |
| **Category Filter** | Active state with `.is-active` class; resets page to 1 on change |
| **Search Debounce** | 400ms delay before API call |
| **Swipe Hint** | Brief "swipe" hint on first load of product slider (4s visibility) |
| **Edge Preview** | Desktop: hover near viewport edges shows prev/next preview + cursor changes |

---

## 5. Navigation Architecture

```
Desktop Nav (sticky header)
├── Home (/)                    [all pages]
├── Products (/products.html)   [all pages]
├── About (/#about)             [scrolls to section]
└── Contact (/#contact)         [scrolls to section]
└── [Call Now] button           [phone link]

Mobile Nav (overlay)
├── Home
├── Products
├── About
├── Contact
├── Ask Price (CTA)
└── +91 870 879 5253 (phone)

Footer
├── Brand + Description
├── Quick Links (Home, Products, Contact)
├── Call for Price + WhatsApp Quote
└── Copyright

Floating Elements (fixed)
├── WhatsApp button (bottom-right)
└── Visit Now / Google Maps (bottom-right, above WhatsApp)
```

---

## 6. Error & Edge Case States

| State | Handling |
|-------|----------|
| **API Failure (Products)** | "Failed to load products." message |
| **API Network Error** | "Network error. Please try again or call us directly." (alert) |
| **No Products Found** | "No products found. Try a different search or category." |
| **Invalid Product/City** | product-city.html: spinner → "Page Not Found" + "Go Home" button |
| **Loading** | Skeleton cards (products page), spinner (city-product page) |
| **Form Success** | Replace form with "Thank you! We will contact you shortly." |
| **Form Validation** | Browser-native required field validation |
| **Image Fallback** | `onerror` handler swaps to placeholder.svg |
| **Broken Image Gallery** | `onerror` → `display:none` for thumbnails |
| **No JavaScript** | HTML baseline works with static content; dynamic features degrade gracefully |

---

## 7. Device Responsiveness

| Breakpoint | Behavior |
|------------|----------|
| **>1400px** | Max-width shell, full layout |
| **1200px** | Grid adjustments |
| **1024px** | Tablet landscape |
| **900px** | Navigation collapse point |
| **768px** | Tablet portrait; product-city grid → single column |
| **600px** | Mobile large |
| **480px** | Mobile medium |
| **375px** | Mobile small |

---

## 8. Recommended UX Improvements

1. **Add sticky CTA bar** on product-city pages that follows on scroll (price + call/WhatsApp buttons always visible)
2. **Show phone number** as clickable text on all mobile navs (not just behind "Call Now" button)
3. **Add inquiry form inline** on product detail and product-city pages (not just homepage)
4. **Add live chat / chat widget** for real-time engagement
5. **Add trust signals** near CTAs: "83+ reviews on Google", "33+ years experience"
6. **Implement form prefill** from URL params (e.g., `?product=monkey-crane` fills product field)
7. **Add click-to-call tracking** to measure phone call conversion rates
8. **Show stock/badge indicators** on product cards (e.g., "In Stock", "Popular")
9. **Add recently viewed products** via localStorage
10. **Improve mobile filter UX** with a slide-out panel instead of horizontal scroll
11. **Add loading progress indicator** for the inquiry form submission (not just disabled button)
12. **Add breadcrumb schema** to all pages (currently only on product detail and product-city pages)
13. **Show delivery ETA** prominently on product cards for nearby cities
14. **Add WhatsApp click tracking** to attribute conversions per channel
15. **Implement page-speed optimizations**: lazy-load below-fold images, preconnect to Google Fonts/API

---

## 9. Conversion Funnel Summary

```
LANDING (any page)
    │
    ├─ Product Discovery (~60% bounce)
    │   ├─ Browse homepage slider/grid
    │   ├─ Search/filter products
    │   └─ SEO landing page (product + city)
    │
    ├─ Product Evaluation
    │   ├─ View product details
    │   ├─ Check specs & variations
    │   ├─ Read FAQ
    │   └─ Compare pricing
    │
    └─ Conversion
        ├─ Click-to-Call (direct phone)
        ├─ WhatsApp chat (pre-filled msg)
        ├─ Inquiry Form (name + phone + product)
        └─ Visit Showroom (Google Maps)
```

**Key Drop-off Risks**: No live chat, no prices on product cards (hidden behind call), no trust badges near CTAs.
