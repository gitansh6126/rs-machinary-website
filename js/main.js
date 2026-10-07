/**
 * RS Machinery - Main Client Logic
 * Standalone static UI controller with zero backend requirements.
 */

(function () {
  'use strict';

  // ── 1. HELPER UTILITIES ──────────────────────────────────────────────────
  var PHONE_NUMBER = "+918708795253";
  var WHATSAPP_NUMBER = "918708795253";

  function getQueryParam(name) {
    var urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
  }

  function formatWhatsAppUrl(message) {
    return "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent(message);
  }

  var isHindiPage = (window.location.pathname.split("/").pop() || "").indexOf("-hi.html") !== -1;

  // ── 2. MOBILE MENU & HEADER INTERACTION ──────────────────────────────────
  // Bound by main.js (single owner). Re-binds safely if the shared header
  // loads after DOM ready (see "rs:header-loaded" below).
  var menuBound = false;

  function initNavigation() {
    var menuBtn = document.getElementById("mobileMenuBtn");
    var mobileMenu = document.getElementById("mobileMenu");
    var overlay = document.getElementById("mobileMenuOverlay");
    var closeBtn = document.querySelector(".mobile-menu-close");

    if (!menuBtn || !mobileMenu || menuBound) return;
    menuBound = true;

    function openMenu() {
      mobileMenu.classList.add("active");
      mobileMenu.setAttribute("aria-hidden", "false");
      if (overlay) overlay.classList.add("active");
      menuBtn.setAttribute("aria-expanded", "true");
      document.body.style.overflow = "hidden";
    }

    function closeMenu() {
      mobileMenu.classList.remove("active");
      mobileMenu.setAttribute("aria-hidden", "true");
      if (overlay) overlay.classList.remove("active");
      menuBtn.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
    }

    menuBtn.addEventListener("click", function () {
      if (mobileMenu.classList.contains("active")) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    if (closeBtn) closeBtn.addEventListener("click", closeMenu);
    if (overlay) overlay.addEventListener("click", closeMenu);

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && mobileMenu.classList.contains("active")) closeMenu();
    });

    mobileMenu.addEventListener("click", function (e) {
      var target = e.target;
      while (target && target !== mobileMenu) {
        if (target.tagName === "A") { closeMenu(); return; }
        target = target.parentNode;
      }
    });
  }

  // ── 3. PRODUCT LISTING PAGE (products.html) ──────────────────────────────
  function initProductsPage() {
    var gridContainer = document.getElementById("redesignProductsGrid");
    if (!gridContainer) return;

    var categoryFilter = document.getElementById("redesignFilterCategory");
    var searchInput = document.getElementById("redesignListingSearch");
    var sortSelect = document.getElementById("redesignSortBy");
    var countLabel = document.getElementById("redesignListingCount");
    var loadingEl = document.getElementById("redesignListingLoading");
    var emptyEl = document.getElementById("redesignListingEmpty");

    var products = window.RSM_PRODUCTS || [];

    // Sync filter with URL query param if present
    var paramCategory = getQueryParam("category") || getQueryParam("cat");
    if (paramCategory && categoryFilter) {
      categoryFilter.value = paramCategory;
    }

    function renderProducts() {
      if (loadingEl) loadingEl.style.display = "none";

      var selectedCategory = categoryFilter ? categoryFilter.value.toLowerCase() : "";
      var searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : "";
      var sortBy = sortSelect ? sortSelect.value : "";

      var filtered = products.filter(function (p) {
        var matchCat = !selectedCategory || (p.category_id && p.category_id.toLowerCase() === selectedCategory) || (p.slug && p.slug.toLowerCase() === selectedCategory);
        var matchSearch = !searchTerm || p.name.toLowerCase().indexOf(searchTerm) !== -1 || p.description.toLowerCase().indexOf(searchTerm) !== -1 || (p.short_description && p.short_description.toLowerCase().indexOf(searchTerm) !== -1);
        return matchCat && matchSearch;
      });

      if (sortBy === "name") {
        filtered.sort(function (a, b) { return a.name.localeCompare(b.name); });
      }

      if (countLabel) {
        if (isHindiPage) {
          countLabel.textContent = filtered.length + " उत्पाद " + (filtered.length === 1 ? "दिखा रहा है" : "दिखा रहे हैं");
        } else {
          countLabel.textContent = "Showing " + filtered.length + " product" + (filtered.length !== 1 ? "s" : "");
        }
      }

      if (filtered.length === 0) {
        gridContainer.innerHTML = "";
        if (emptyEl) {
          emptyEl.style.display = "block";
          if (isHindiPage) {
            emptyEl.innerHTML = `
              <div class="redesign-empty">
                <h3>आपके मानदंडों से मेल खाता कोई उत्पाद नहीं मिला</h3>
                <p>अपना खोज शब्द या श्रेणी फ़िल्टर बदलकर देखें।</p>
                <button class="redesign-btn redesign-btn-outline" onclick="location.href='products-hi.html'">फ़िल्टर रीसेट करें</button>
              </div>
            `;
          } else {
            emptyEl.innerHTML = `
              <div class="redesign-empty">
                <h3>No products match your criteria</h3>
                <p>Try adjusting your search query or category filter.</p>
                <button class="redesign-btn redesign-btn-outline" onclick="location.href='products.html'">Reset Filters</button>
              </div>
            `;
          }
        }
        return;
      }

      if (emptyEl) emptyEl.style.display = "none";

      var html = "";
      var detailPage = isHindiPage ? "product-hi.html" : "product.html";
      filtered.forEach(function (p) {
        var waMsg = "Hi RS Machinery, I want to inquire about " + p.name + " (" + p.capacity + "). Please share pricing.";
        var waUrl = formatWhatsAppUrl(waMsg);

        html += `
          <div class="redesign-card">
            <div class="redesign-card-image-wrap">
              <a href="${detailPage}?slug=${p.slug}">
                <img src="${p.image}" alt="${p.name}" class="redesign-card-image" loading="lazy" onerror="this.onerror=null;this.src='assets/placeholder.svg';">
              </a>
            </div>
            <div class="redesign-card-body">
              <span class="redesign-card-category">${p.category_name}</span>
              <h3 class="redesign-card-title">
                <a href="${detailPage}?slug=${p.slug}">${p.name}</a>
              </h3>
              <p class="redesign-card-desc">${p.short_description}</p>
              <div class="redesign-card-actions">
                <a href="${detailPage}?slug=${p.slug}" class="redesign-btn redesign-btn-outline redesign-btn-sm">${isHindiPage ? 'विवरण देखें' : 'View Details'}</a>
                <a href="${waUrl}" target="_blank" rel="noopener" class="redesign-btn redesign-btn-accent redesign-btn-sm">${isHindiPage ? 'व्हाट्सऐप' : 'WhatsApp'}</a>
              </div>
            </div>
          </div>
        `;
      });

      gridContainer.innerHTML = html;
    }

    if (categoryFilter) categoryFilter.addEventListener("change", renderProducts);
    if (searchInput) searchInput.addEventListener("input", renderProducts);
    if (sortSelect) sortSelect.addEventListener("change", renderProducts);

    renderProducts();
  }

  // ── 4. PRODUCT DETAIL PAGE (product.html) ────────────────────────────────
  function initProductDetailPage() {
    var detailContainer = document.getElementById("redesignProductDetail");
    if (!detailContainer) return;

    var slug = getQueryParam("slug") || getQueryParam("id") || "monkey-lift";
    var products = window.RSM_PRODUCTS || [];

    var product = products.find(function (p) {
      return p.slug === slug || String(p.id) === String(slug);
    }) || products[0];

    if (!product) return;

    // UI copy translations for the detail page
    var t = isHindiPage ? {
      spec: "विनिर्देश", details: "विवरण",
      popular: "लोकप्रिय क्षमता मॉडल",
      faq: "अक्सर पूछे जाने वाले प्रश्न", home: "मुखपृष्ठ", products: "उत्पाद",
      capacity: "क्षमता", warranty: "वारंटी",
      waQuote: "इंस्टेंट व्हाट्सऐप कोटेशन पाएं", call: "कॉल करें +91 8708795253",
      techSpecs: "तकनीकी विनिर्देश", keyFeatures: "मुख्य विशेषताएं और हाइलाइट्स",
      waMsg: "नमस्ते आरएस मशीनरी, मुझे " + product.name + " (" + product.capacity + ") में रुचि है। कृपया तकनीकी विवरण और कोटेशन साझा करें।"
    } : {
      spec: "Specification", details: "Details",
      popular: "Popular Capacity Models",
      faq: "Frequently Asked Questions", home: "Home", products: "Products",
      capacity: "Capacity", warranty: "Warranty",
      waQuote: "Get Instant WhatsApp Quote", call: "Call +91 8708795253",
      techSpecs: "Technical Specifications", keyFeatures: "Key Features & Highlights",
      waMsg: "Hi RS Machinery, I am interested in " + product.name + " (" + product.capacity + "). Please share technical details & quote."
    };

    // Update document head title & canonical meta tags dynamically
    document.title = product.seo_title || (product.name + " — RS Machinery");
    var titleEl = document.getElementById("redesignProductTitle");
    if (titleEl) titleEl.textContent = product.seo_title || product.name;

    var descMeta = document.querySelector('meta[name="description"]');
    if (descMeta && product.seo_description) descMeta.setAttribute("content", product.seo_description);

    var waInquiryMsg = t.waMsg;
    var waUrl = formatWhatsAppUrl(waInquiryMsg);

    // Build specifications table HTML
    var specsHtml = "";
    if (product.specifications) {
      specsHtml += `<table class="price-table"><thead><tr><th>${t.spec}</th><th>${t.details}</th></tr></thead><tbody>`;
      for (var specKey in product.specifications) {
        specsHtml += `<tr><td><strong>${specKey}</strong></td><td>${product.specifications[specKey]}</td></tr>`;
      }
      specsHtml += `</tbody></table>`;
    }

    // Build variations list HTML
    var variationsHtml = "";
    if (product.variations && product.variations.length > 0) {
      variationsHtml += `<div class="redesign-variations"><h4 class="redesign-variations-title">${t.popular}</h4><ul class="redesign-variation-list">`;
      product.variations.forEach(function (v) {
        variationsHtml += `<li>${v.name}</li>`;
      });
      variationsHtml += `</ul></div>`;
    }

    // Build features list
    var featuresHtml = "";
    if (product.features && product.features.length > 0) {
      featuresHtml += `<ul class="redesign-feature-list">`;
      product.features.forEach(function (f) {
        featuresHtml += `<li>✔ <strong>${f}</strong></li>`;
      });
      featuresHtml += `</ul>`;
    }

    // Build FAQ section
    var faqHtml = "";
    if (product.faq && product.faq.length > 0) {
      faqHtml += `<div class="redesign-pd-faq"><h3 class="redesign-pd-faq-title">${t.faq}</h3>`;
      product.faq.forEach(function (item) {
        faqHtml += `<div class="redesign-pd-faq-item"><h4 class="redesign-pd-faq-q">Q: ${item.q}</h4><p class="redesign-pd-faq-a">A: ${item.a}</p></div>`;
      });
      faqHtml += `</div>`;
    }

    detailContainer.innerHTML = `
      <section class="redesign-section">
        <div class="redesign-shell">
          <nav class="redesign-pd-crumb">
            <a href="${isHindiPage ? 'index-hi.html' : '/'}">${t.home}</a> &nbsp;/&nbsp;
            <a href="${isHindiPage ? 'products-hi.html' : 'products.html'}">${t.products}</a> &nbsp;/&nbsp;
            <span>${product.name}</span>
          </nav>

          <div class="redesign-pd-grid">
            <div class="redesign-product-detail-media">
              <div class="redesign-pd-media">
                <img src="${product.image}" alt="${product.name}" class="redesign-pd-img" decoding="async" onerror="this.onerror=null;this.src='assets/placeholder.svg';">
              </div>
            </div>

            <div class="redesign-product-detail-info">
              <span class="redesign-section-tag">${product.category_name}</span>
              <h1 class="redesign-pd-title">${product.name}</h1>
              <p class="redesign-pd-desc">${product.description}</p>

              <div class="redesign-pd-statsbar">
                <div>
                  <span class="redesign-pd-stat-label">${t.capacity}</span>
                  <span class="redesign-pd-stat-value">${product.capacity}</span>
                </div>
                <div>
                  <span class="redesign-pd-stat-label">${t.warranty}</span>
                  <span class="redesign-pd-stat-warranty">✔ ${product.warranty}</span>
                </div>
              </div>

              <div class="redesign-pd-ctas">
                <a href="${waUrl}" target="_blank" rel="noopener" class="redesign-btn redesign-btn-accent redesign-btn-lg">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347"/></svg>
                  ${t.waQuote}
                </a>
                <a href="tel:${PHONE_NUMBER}" class="redesign-btn redesign-btn-primary redesign-btn-lg">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                  ${t.call}
                </a>
              </div>
            </div>
          </div>

          <div class="redesign-pd-extra">
            <h3 class="redesign-pd-block-title">${t.techSpecs}</h3>
            ${specsHtml}
            ${variationsHtml}
            <h3 class="redesign-pd-block-title redesign-pd-block-title--top">${t.keyFeatures}</h3>
            ${featuresHtml}
            ${faqHtml}
          </div>
        </div>
      </section>
    `;

    // Prefill the inquiry form's product dropdown with the viewed product.
    var prodSelect = document.getElementById("inqProduct");
    if (prodSelect && product.category_name) {
      for (var o = 0; o < prodSelect.options.length; o++) {
        if (prodSelect.options[o].value.toLowerCase() === product.category_name.toLowerCase()) {
          prodSelect.selectedIndex = o;
          break;
        }
      }
    }
  }

  // ── 4b. MARKETPLACE-STYLE PRODUCT PAGE (productx.html) ───────────────────
  // Experimental Amazon / Meesho / Blinkit-inspired product page. Reads the
  // same window.RSM_PRODUCTS catalogue and the same ?slug= contract as
  // product.html, but the media column becomes a thumbnail gallery with a
  // tap-to-expand lightbox and swipe support, and a sticky conversion bar
  // slides in once the gallery scrolls out of view. No changes are made to
  // the existing detail page - each renderer is guarded by its own container.
  function initMarketplaceProductPage() {
    var root = document.getElementById("rsmxApp");
    if (!root) return;

    var products = window.RSM_PRODUCTS || [];
    if (!products.length) return;

    var slug = getQueryParam("slug") || getQueryParam("id") || "";
    var product = null;
    if (slug) {
      product = products.find(function (p) {
        return p.slug === slug || String(p.id) === String(slug);
      }) || null;
    }
    if (!product) product = products[0];

    var PLACEHOLDER = "assets/placeholder.svg";

    var ICON_ZOOM = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/><path d="M11 8v6M8 11h6"/></svg>';
    var ICON_CALL = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 4.11 2h3a2 19.79 19.79 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 19.79 19.79 0 0 1 22 16.92z"/></svg>';
    var ICON_WA = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347"/></svg>';
    var ICON_CLOSE = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>';

    // UI copy translations for the marketplace page
    var t = isHindiPage ? {
      home: "मुखपृष्ठ", products: "उत्पाद",
      gallery: "उत्पाद इमेज", viewImage: "इमेज देखें", expand: "इमेज बड़ी करें",
      capacity: "क्षमता", warranty: "वारंटी", condition: "स्थिति", brand: "ब्रांड",
      popular: "लोकप्रिय क्षमता मॉडल",
      waQuote: "इंस्टेंट व्हाट्सऐप कोटेशन पाएं", call: "कॉल करें +91 8708795253",
      waShort: "व्हाट्सऐप", callShort: "कॉल करें",
      techSpecs: "तकनीकी विनिर्देश", keyFeatures: "मुख्य विशेषताएं और हाइलाइट्स",
      whereUsed: "उपयोग", faq: "अक्सर पूछे जाने वाले प्रश्न",
      spec: "विनिर्देश", details: "विवरण",
      waMsg: "नमस्ते आरएस मशीनरी, मुझे " + product.name + " (" + product.capacity + ") में रुचि है। कृपया तकनीकी विवरण और कोटेशन साझा करें।"
    } : {
      home: "Home", products: "Products",
      gallery: "Product images", viewImage: "View image", expand: "Expand image",
      capacity: "Capacity", warranty: "Warranty", condition: "Condition", brand: "Brand",
      popular: "Popular Capacity Models",
      waQuote: "Get Instant WhatsApp Quote", call: "Call +91 8708795253",
      waShort: "WhatsApp", callShort: "Call",
      techSpecs: "Technical Specifications", keyFeatures: "Key Features & Highlights",
      whereUsed: "Applications", faq: "Frequently Asked Questions",
      spec: "Specification", details: "Details",
      waMsg: "Hi RS Machinery, I am interested in " + product.name + " (" + product.capacity + "). Please share technical details & quote."
    };

    // Per-product SEO head tags (same contract as the existing detail page)
    document.title = product.seo_title || (product.name + " — RS Machinery");
    var titleEl = document.getElementById("redesignProductTitle");
    if (titleEl) titleEl.textContent = product.seo_title || product.name;

    var descMeta = document.querySelector('meta[name="description"]');
    if (descMeta && product.seo_description) descMeta.setAttribute("content", product.seo_description);

    var ogImage = document.querySelector('meta[property="og:image"]');
    if (ogImage && product.image) ogImage.setAttribute("content", product.image);

    var waUrl = formatWhatsAppUrl(t.waMsg);

    // ── Gallery source: gallery_images, else image, else placeholder ───────
    // Duplicates are removed so a product that lists the same file twice
    // still renders a single clean tile.
    var gallery = [];
    if (product.gallery_images && product.gallery_images.length) {
      product.gallery_images.forEach(function (src) {
        if (src) gallery.push(src);
      });
    }
    if (!gallery.length && product.image) gallery.push(product.image);
    if (!gallery.length) gallery.push(PLACEHOLDER);

    gallery = gallery.filter(function (src, index) {
      return gallery.indexOf(src) === index;
    });

    var hasRail = gallery.length > 1;

    var thumbsHtml = gallery.map(function (src, i) {
      return '<button type="button" class="rsmx-thumb' + (i === 0 ? " is-active" : "") +
        '" data-rsmx-index="' + i + '" aria-label="' + t.viewImage + " " + (i + 1) + '" aria-selected="' + (i === 0) + '">' +
        '<img src="' + src + '" alt="" loading="lazy" decoding="async" ' +
        'onerror="this.onerror=null;this.src=\'' + PLACEHOLDER + '\';"></button>';
    }).join("");

    var dotsHtml = gallery.map(function (_, i) {
      return '<span class="rsmx-dot' + (i === 0 ? " is-active" : "") + '"></span>';
    }).join("");

    // ── Specifications table ──────────────────────────────────────────────
    var specsHtml = "";
    if (product.specifications) {
      specsHtml += '<table class="price-table"><thead><tr><th>' + t.spec + '</th><th>' + t.details + '</th></tr></thead><tbody>';
      for (var specKey in product.specifications) {
        specsHtml += '<tr><td><strong>' + specKey + '</strong></td><td>' + product.specifications[specKey] + '</td></tr>';
      }
      specsHtml += '</tbody></table>';
    }

    // ── Variations ────────────────────────────────────────────────────────
    var variationsHtml = "";
    if (product.variations && product.variations.length) {
      variationsHtml += '<div class="redesign-variations"><h4 class="redesign-variations-title">' + t.popular + '</h4><ul class="redesign-variation-list">';
      product.variations.forEach(function (v) {
        variationsHtml += '<li>' + v.name + '</li>';
      });
      variationsHtml += '</ul></div>';
    }

    // ── Features ──────────────────────────────────────────────────────────
    var featuresHtml = "";
    if (product.features && product.features.length) {
      featuresHtml += '<ul class="redesign-feature-list">';
      product.features.forEach(function (f) {
        featuresHtml += '<li>✔ <strong>' + f + '</strong></li>';
      });
      featuresHtml += '</ul>';
    }

    // ── Applications ──────────────────────────────────────────────────────
    var appsHtml = "";
    if (product.applications && product.applications.length) {
      appsHtml = '<h3 class="redesign-pd-block-title">' + t.whereUsed + '</h3><ul class="redesign-feature-list">';
      product.applications.forEach(function (a) {
        appsHtml += '<li>• ' + a + '</li>';
      });
      appsHtml += '</ul>';
    }

    // ── FAQ ───────────────────────────────────────────────────────────────
    var faqHtml = "";
    if (product.faq && product.faq.length) {
      faqHtml = '<div class="redesign-pd-faq"><h3 class="redesign-pd-faq-title">' + t.faq + '</h3>';
      product.faq.forEach(function (item) {
        faqHtml += '<div class="redesign-pd-faq-item"><h4 class="redesign-pd-faq-q">Q: ' + item.q + '</h4><p class="redesign-pd-faq-a">A: ' + item.a + '</p></div>';
      });
      faqHtml += '</div>';
    }

    var homeHref = isHindiPage ? "index-hi.html" : "/";
    var listHref = isHindiPage ? "products-hi.html" : "products.html";

    root.innerHTML = [
      '<section class="rsmx-section">',
      '  <div class="redesign-shell">',
      '    <nav class="rsmx-crumb" aria-label="Breadcrumb">',
      '      <a href="' + homeHref + '">' + t.home + '</a>',
      '      <span class="rsmx-crumb-sep">/</span>',
      '      <a href="' + listHref + '">' + t.products + '</a>',
      '      <span class="rsmx-crumb-sep">/</span>',
      '      <span>' + product.name + '</span>',
      '    </nav>',

      '    <div class="rsmx-layout">',
      '      <div class="rsmx-gallery-col">',
      '        <div class="rsmx-gallery' + (hasRail ? '' : ' rsmx-gallery--solo') + '">',
      hasRail ? '          <div class="rsmx-thumbs" role="tablist" aria-label="' + t.gallery + '">' + thumbsHtml + '</div>' : '',
      '          <div class="rsmx-stage" id="rsmxStage">',
      '            <img id="rsmxMainImg" class="rsmx-main-img" src="' + gallery[0] + '" alt="' + product.name + '" decoding="async" ' +
        'onerror="this.onerror=null;this.src=\'' + PLACEHOLDER + '\';">',
      '            <button type="button" class="rsmx-zoom" id="rsmxZoom" aria-label="' + t.expand + '">' + ICON_ZOOM + '</button>',
      hasRail ? '            <div class="rsmx-dots" id="rsmxDots">' + dotsHtml + '</div>' : '',
      '          </div>',
      '        </div>',
      '      </div>',

      '      <div class="rsmx-buybox">',
      '        <span class="redesign-section-tag">' + product.category_name + '</span>',
      '        <h1 class="rsmx-title">' + product.name + '</h1>',
      '        <p class="rsmx-short">' + product.short_description + '</p>',
      '        <div class="rsmx-statsbar">',
      '          <div class="rsmx-stat"><span class="rsmx-stat-label">' + t.capacity + '</span><span class="rsmx-stat-value">' + product.capacity + '</span></div>',
      '          <div class="rsmx-stat"><span class="rsmx-stat-label">' + t.warranty + '</span><span class="rsmx-stat-value rsmx-stat-value--ok">✔ ' + product.warranty + '</span></div>',
      '          <div class="rsmx-stat"><span class="rsmx-stat-label">' + t.condition + '</span><span class="rsmx-stat-value">' + product.condition + '</span></div>',
      '          <div class="rsmx-stat"><span class="rsmx-stat-label">' + t.brand + '</span><span class="rsmx-stat-value">' + product.brand + '</span></div>',
      '        </div>',
      '        <div class="rsmx-ctas">',
      '          <a href="' + waUrl + '" target="_blank" rel="noopener" class="redesign-btn redesign-btn-accent redesign-btn-lg">' + ICON_WA + ' ' + t.waQuote + '</a>',
      '          <a href="tel:' + PHONE_NUMBER + '" class="redesign-btn redesign-btn-primary redesign-btn-lg">' + ICON_CALL + ' ' + t.call + '</a>',
      '        </div>',
      '        <p class="redesign-form-trust" style="margin:0;">' + product.delivery + '</p>',
      '      </div>',
      '    </div>',

      // Sentinel: the sticky bar appears once this has scrolled past the fold.
      '    <div id="rsmxStickyTrigger" aria-hidden="true" style="height:1px;"></div>',

      '    <div class="redesign-pd-extra">',
      '      <h3 class="redesign-pd-block-title">' + t.techSpecs + '</h3>',
      specsHtml,
      variationsHtml,
      '      <h3 class="redesign-pd-block-title redesign-pd-block-title--top">' + t.keyFeatures + '</h3>',
      featuresHtml,
      appsHtml,
      faqHtml,
      '    </div>',
      '  </div>',
      '</section>',

      '  <div class="rsmx-sticky" id="rsmxSticky" aria-hidden="true">',
      '    <div class="rsmx-sticky-inner">',
      '      <div class="rsmx-sticky-meta">',
      '        <span class="rsmx-sticky-name">' + product.name + '</span>',
      '        <span class="rsmx-sticky-cap">' + product.capacity + ' · ' + product.warranty + '</span>',
      '      </div>',
      '      <div class="rsmx-sticky-actions">',
      '        <a href="tel:' + PHONE_NUMBER + '" class="rsmx-sticky-btn rsmx-sticky-btn--call">' + ICON_CALL + '<span>' + t.callShort + '</span></a>',
      '        <a href="' + waUrl + '" target="_blank" rel="noopener" class="rsmx-sticky-btn rsmx-sticky-btn--wa">' + ICON_WA + '<span>' + t.waShort + '</span></a>',
      '      </div>',
      '    </div>',
      '  </div>'
    ].join('\n');

    // ── Gallery behaviour ─────────────────────────────────────────────────
    var stage = document.getElementById("rsmxStage");
    var mainImg = document.getElementById("rsmxMainImg");
    var thumbs = root.querySelectorAll(".rsmx-thumb");
    var dots = root.querySelectorAll(".rsmx-dot");
    var current = 0;

    function goTo(index) {
      if (index < 0) index = gallery.length - 1;
      if (index >= gallery.length) index = 0;
      if (index === current && mainImg.getAttribute("src") === gallery[index]) return;
      current = index;

      mainImg.classList.add("is-swapping");
      mainImg.src = gallery[index];
      mainImg.alt = product.name + " — " + (index + 1);

      Array.prototype.forEach.call(thumbs, function (el, i) {
        var on = i === index;
        el.classList.toggle("is-active", on);
        el.setAttribute("aria-selected", on ? "true" : "false");
      });
      Array.prototype.forEach.call(dots, function (el, i) {
        el.classList.toggle("is-active", i === index);
      });
    }

    mainImg.addEventListener("load", function () {
      mainImg.classList.remove("is-swapping");
    });

    Array.prototype.forEach.call(thumbs, function (el) {
      el.addEventListener("click", function () {
        goTo(parseInt(el.getAttribute("data-rsmx-index"), 10) || 0);
      });
    });

    // Swipe the stage on touch devices.
    var touchStartX = null;
    stage.addEventListener("touchstart", function (e) {
      touchStartX = e.changedTouches[0].clientX;
    }, { passive: true });

    stage.addEventListener("touchend", function (e) {
      if (touchStartX === null) return;
      var delta = e.changedTouches[0].clientX - touchStartX;
      touchStartX = null;
      if (!hasRail || Math.abs(delta) < 45) return;
      goTo(current + (delta < 0 ? 1 : -1));
    }, { passive: true });

    // ── Lightbox ──────────────────────────────────────────────────────────
    var lightbox = document.createElement("div");
    lightbox.className = "rsmx-lightbox";
    lightbox.id = "rsmxLightbox";
    lightbox.setAttribute("role", "dialog");
    lightbox.setAttribute("aria-modal", "true");
    lightbox.setAttribute("aria-label", product.name);
    lightbox.hidden = true;
    lightbox.innerHTML =
      '<button type="button" class="rsmx-lightbox-close" id="rsmxLightboxClose" aria-label="Close">' + ICON_CLOSE + '</button>' +
      '<img class="rsmx-lightbox-img" id="rsmxLightboxImg" src="' + gallery[0] + '" alt="' + product.name + '">';
    document.body.appendChild(lightbox);

    var lightboxImg = document.getElementById("rsmxLightboxImg");

    function openLightbox() {
      lightboxImg.src = gallery[current];
      lightboxImg.alt = product.name;
      lightbox.hidden = false;
      document.body.classList.add("rsmx-lightbox-open");
    }

    function closeLightbox() {
      lightbox.hidden = true;
      document.body.classList.remove("rsmx-lightbox-open");
    }

    document.getElementById("rsmxZoom").addEventListener("click", openLightbox);
    stage.addEventListener("click", function (e) {
      if (e.target.closest(".rsmx-zoom")) return;
      openLightbox();
    });
    lightbox.addEventListener("click", function (e) {
      if (e.target.closest(".rsmx-lightbox-close")) { closeLightbox(); return; }
      closeLightbox();
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !lightbox.hidden) closeLightbox();
    });

    // ── Sticky conversion bar ─────────────────────────────────────────────
    var sticky = document.getElementById("rsmxSticky");
    var trigger = document.getElementById("rsmxStickyTrigger");

    function syncSticky() {
      var show = trigger.getBoundingClientRect().bottom < 0;
      sticky.classList.toggle("is-visible", show);
      sticky.setAttribute("aria-hidden", show ? "false" : "true");
    }

    window.addEventListener("scroll", syncSticky, { passive: true });
    window.addEventListener("resize", syncSticky);
    syncSticky();

    // Prefill the inquiry form's product dropdown with the viewed product.
    var prodSelect = document.getElementById("inqProduct");
    if (prodSelect && product.category_name) {
      for (var o = 0; o < prodSelect.options.length; o++) {
        if (prodSelect.options[o].value.toLowerCase() === product.category_name.toLowerCase()) {
          prodSelect.selectedIndex = o;
          break;
        }
      }
    }
  }

  // ── 5. HERO SHOWCASE CONTROLLER (coverflow carousel + synced copy) ──────
  // Replaces the retired track slider. The hero background and the left
  // column's layout never move: only the four .hp-card elements, the dots,
  // the counter, the progress bar and the words inside the left column are
  // ever written. That is what keeps the headline and CTAs rock-steady while
  // the product catalogue scrolls underneath them.
  function initHeroShowcase() {
    var showcase = document.getElementById("hpShowcase");
    var stage = document.getElementById("hpStage");
    if (!showcase || !stage) return;

    var cards = Array.prototype.slice.call(showcase.querySelectorAll(".hp-card"));
    var total = cards.length;
    if (!total) return;

    var dotsBox = document.getElementById("hpDots");
    var countEl = document.getElementById("hpCount");
    var totalEl = document.getElementById("hpTotal");
    var nameEl = document.getElementById("hpName");
    var progEl = document.getElementById("hpProgress");
    var liveEl = document.getElementById("hpLive");
    var prevBtn = document.getElementById("hpPrev");
    var nextBtn = document.getElementById("hpNext");

    var contentEl = document.getElementById("hpContent");
    var eyebrowEl = document.getElementById("hpEyebrow");
    var titleEl = document.getElementById("hpTitle");
    var accentEl = document.getElementById("hpTitleAccent");
    var descEl = document.getElementById("hpDesc");
    var featsEl = document.getElementById("hpFeats");

    var FAR = 2;              // furthest offset worth painting; rest park hidden
    var DELAY = 3000;
    var t = isHindiPage
      ? {
          showProduct: "उत्पाद ",
          of: "में से",
          ofTotal: "दिखाएं:",
          ariaStage: "उत्पाद शोकेस",
          dotLabel: "उत्पाद "
        }
      : {
          showProduct: "Show product ",
          of: " of ",
          ofTotal: ":",
          ariaStage: "Product showcase",
          dotLabel: "Show product "
        };

    var reduceMotion = window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    var index = 0;
    var timer = null;
    var engaged = false;      // set once the visitor takes control
    var onScreen = true;
    var swapTimer = null;
    var copyTimer = null;

    function pad(n) { return (n < 10 ? "0" : "") + n; }

    // Shortest signed distance from the centre, so the row wraps cleanly.
    function offsetFor(i) {
      var off = i - index;
      if (off > total / 2) off -= total;
      if (off < -total / 2) off += total;
      return off;
    }

    function paintName(text) {
      if (!nameEl || nameEl.textContent === text) return;
      window.clearTimeout(swapTimer);
      nameEl.classList.add("is-swapping");
      swapTimer = window.setTimeout(function () {
        nameEl.textContent = text;
        nameEl.classList.remove("is-swapping");
      }, 170);
    }

    // Runs after the fade-out, so the words are never seen mid-swap.
    function paintCopy(card) {
      if (eyebrowEl) eyebrowEl.textContent = card.getAttribute("data-eyebrow") || "";
      if (titleEl) titleEl.textContent = card.getAttribute("data-title") || "";
      if (accentEl) accentEl.textContent = card.getAttribute("data-accent") || "";
      if (descEl) descEl.textContent = card.getAttribute("data-desc") || "";
      if (featsEl) {
        var list = (card.getAttribute("data-feats") || "").split("|");
        featsEl.textContent = "";
        for (var f = 0; f < list.length; f++) {
          if (!list[f]) continue;
          var li = document.createElement("li");
          li.textContent = list[f];
          featsEl.appendChild(li);
        }
      }
    }

    function render() {
      var i;
      for (i = 0; i < total; i++) {
        var off = offsetFor(i);
        var active = off === 0;
        var card = cards[i];
        // "3" parks anything outside the visible window.
        card.setAttribute("data-off", Math.abs(off) > FAR ? "3" : off);
        card.setAttribute("aria-hidden", active ? "false" : "true");
        card.tabIndex = active ? 0 : -1;
      }

      for (i = 0; i < dots.length; i++) {
        if (i === index) dots[i].setAttribute("aria-current", "true");
        else dots[i].removeAttribute("aria-current");
      }

      if (countEl) countEl.textContent = pad(index + 1);
      if (progEl) progEl.style.width = ((index + 1) / total * 100) + "%";
      paintName(cards[index].getAttribute("data-name") || "");

      var current = cards[index];
      if (contentEl) {
        window.clearTimeout(copyTimer);
        contentEl.classList.add("is-swapping");
        copyTimer = window.setTimeout(function () {
          paintCopy(current);
          contentEl.classList.remove("is-swapping");
        }, 200);
      } else {
        paintCopy(current);
      }
    }

    function goTo(next, byUser) {
      index = ((next % total) + total) % total;
      render();
      if (byUser && liveEl) {
        liveEl.textContent = t.showProduct + (index + 1) + t.of + total +
          t.ofTotal + " " + (cards[index].getAttribute("data-name") || "");
      }
    }

    function stop() {
      if (timer) { window.clearInterval(timer); timer = null; }
    }

    function play() {
      stop();
      if (engaged || !onScreen || reduceMotion || document.hidden) return;
      timer = window.setInterval(function () { goTo(index + 1, false); }, DELAY);
    }

    function takeControl(fn) {
      return function (event) {
        engaged = true;
        stop();
        fn(event);
      };
    }

    var dots = [];
    if (dotsBox) {
      for (var d = 0; d < total; d++) {
        var dot = document.createElement("button");
        dot.type = "button";
        dot.className = "hp-dot";
        dot.setAttribute("aria-label", t.dotLabel + (d + 1) + t.ofTotal + " " +
          (cards[d].getAttribute("data-name") || ""));
        dot.addEventListener("click", takeControl((function (target) {
          return function () { goTo(target, true); };
        })(d)));
        dotsBox.appendChild(dot);
      }
    }

    if (totalEl) totalEl.textContent = pad(total);

    if (prevBtn) prevBtn.addEventListener("click", takeControl(function () { goTo(index - 1, true); }));
    if (nextBtn) nextBtn.addEventListener("click", takeControl(function () { goTo(index + 1, true); }));

    // Clicking a side product brings it to the centre instead of navigating.
    for (var c = 0; c < total; c++) {
      cards[c].addEventListener("click", (function (i) {
        return function (event) {
          if (i === index) return;
          event.preventDefault();
          engaged = true;
          stop();
          goTo(i, true);
        };
      })(c));
    }

    showcase.addEventListener("keydown", function (event) {
      var key = event.key;
      if (key !== "ArrowLeft" && key !== "ArrowRight" && key !== "Home" && key !== "End") return;
      engaged = true;
      stop();
      if (key === "ArrowLeft") goTo(index - 1, true);
      else if (key === "ArrowRight") goTo(index + 1, true);
      else if (key === "Home") goTo(0, true);
      else goTo(total - 1, true);
      event.preventDefault();
    });

    var startX = 0;
    var dragging = false;

    function onDown(x) {
      dragging = true;
      startX = x;
      stage.classList.add("is-dragging");
    }

    function onUp(x) {
      if (!dragging) return;
      dragging = false;
      stage.classList.remove("is-dragging");
      var dx = x - startX;
      if (Math.abs(dx) < 45) return;
      engaged = true;
      stop();
      goTo(index + (dx < 0 ? 1 : -1), true);
    }

    if (window.PointerEvent) {
      stage.addEventListener("pointerdown", function (e) {
        if (e.target.closest && e.target.closest(".hp-arrow")) return;
        onDown(e.clientX);
      });
      window.addEventListener("pointerup", function (e) { onUp(e.clientX); });
      window.addEventListener("pointercancel", function () {
        dragging = false;
        stage.classList.remove("is-dragging");
      });
    } else {
      var touchStartX = 0;
      stage.addEventListener("touchstart", function (e) {
        touchStartX = e.changedTouches[0].clientX;
        onDown(touchStartX);
      }, { passive: true });
      stage.addEventListener("touchend", function (e) {
        onUp(e.changedTouches[0].clientX);
      }, { passive: true });
      stage.addEventListener("touchcancel", function () {
        dragging = false;
        stage.classList.remove("is-dragging");
      }, { passive: true });
    }

    // Pause whenever attention moves elsewhere.
    showcase.addEventListener("mouseenter", stop);
    showcase.addEventListener("mouseleave", play);
    showcase.addEventListener("focusin", stop);
    showcase.addEventListener("focusout", function (e) {
      if (!showcase.contains(e.relatedTarget)) play();
    });

    document.addEventListener("visibilitychange", function () {
      if (document.hidden) stop(); else play();
    });

    var hero = document.getElementById("hero");
    if (hero && "IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        onScreen = entries[0].isIntersecting;
        if (onScreen) play(); else stop();
      }, { threshold: 0.2 }).observe(hero);
    }

    if (stage) stage.setAttribute("aria-label", t.ariaStage + ", " + total);

    render();
    play();
  }

  // ── 6. INQUIRY FORM HANDLER ──────────────────────────────────────────────
  function showFieldError(input, msg) {
    if (!input) return;
    input.classList.add("redesign-form-error");
    var parent = input.closest(".redesign-form-group") || input.parentNode;
    var existing = parent.querySelector(".redesign-field-error");
    if (existing) existing.remove();
    var err = document.createElement("div");
    err.className = "redesign-field-error";
    err.setAttribute("aria-live", "polite");
    err.textContent = msg;
    parent.appendChild(err);
  }

  function clearFieldErrors(form) {
    form.querySelectorAll(".redesign-form-error").forEach(function (el) {
      el.classList.remove("redesign-form-error");
    });
    form.querySelectorAll(".redesign-field-error").forEach(function (el) {
      el.remove();
    });
  }

  function initInquiryForm() {
    var form = document.getElementById("redesignInquiryForm");
    if (!form) return;

    // Prefill product dropdown from URL (?product=) if a matching option exists.
    var paramProduct = (getQueryParam("product") || "").trim();
    if (paramProduct) {
      var selects = form.querySelectorAll("select[name='product']");
      selects.forEach(function (sel) {
        for (var i = 0; i < sel.options.length; i++) {
          if (sel.options[i].value.toLowerCase() === paramProduct.toLowerCase()) {
            sel.selectedIndex = i;
            break;
          }
        }
      });
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      clearFieldErrors(form);

      function fieldVal(name) {
        var el = form.querySelector("[name='" + name + "']");
        return el ? el.value.trim() : "";
      }

      var name = fieldVal("name");
      var phone = fieldVal("phone").replace(/[^0-9+]/g, "");
      var product = fieldVal("product");
      var city = fieldVal("city");
      var qty = fieldVal("quantity");
      var message = fieldVal("message");

      var valid = true;
      var nameInput = form.querySelector("[name='name']");
      var phoneInput = form.querySelector("[name='phone']");
      var productInput = form.querySelector("[name='product']");

      var fT = isHindiPage ? {
        nameErr: "कृपया अपना नाम दर्ज करें।",
        phoneErr: "कृपया मान्य 10-अंकीय मोबाइल नंबर दर्ज करें।",
        productErr: "कृपया एक उत्पाद चुनें।",
        title: "वेबसाइट से नई मशीनरी पूछताछ:",
        name: "नाम", phone: "फोन", product: "उत्पाद", city: "शहर",
        qty: "अनुमानित मात्रा", req: "आवश्यकता",
        success: "✔ पूछताछ व्हाट्सऐप में खोली गई!"
      } : {
        nameErr: "Please enter your name.",
        phoneErr: "Please enter a valid 10-digit mobile number.",
        productErr: "Please select a product.",
        title: "New Machinery Inquiry from Website:",
        name: "Name", phone: "Phone", product: "Product", city: "City",
        qty: "Approx. Quantity", req: "Requirements",
        success: "✔ Inquiry Opened in WhatsApp!"
      };

      if (!name || name.length < 2) {
        showFieldError(nameInput, fT.nameErr);
        valid = false;
      }
      if (!/^\+?\d{10,12}$/.test(phone)) {
        showFieldError(phoneInput, fT.phoneErr);
        valid = false;
      }
      if (productInput && !product) {
        showFieldError(productInput, fT.productErr);
        valid = false;
      }
      if (!valid) return;

      var fullMsg = fT.title + "\n";
      fullMsg += "• " + fT.name + ": " + name + "\n";
      fullMsg += "• " + fT.phone + ": " + phone + "\n";
      if (product) fullMsg += "• " + fT.product + ": " + product + "\n";
      if (city) fullMsg += "• " + fT.city + ": " + city + "\n";
      if (qty) fullMsg += "• " + fT.qty + ": " + qty + "\n";
      if (message) fullMsg += "• " + fT.req + ": " + message + "\n";

      var waUrl = formatWhatsAppUrl(fullMsg);
      window.open(waUrl, "_blank");

      var submitBtn = form.querySelector("button[type='submit']");
      if (submitBtn) {
        var original = submitBtn.innerHTML;
        submitBtn.innerHTML = fT.success;
        submitBtn.style.backgroundColor = "#25d366";
        setTimeout(function () {
          submitBtn.innerHTML = original;
          submitBtn.style.backgroundColor = "";
        }, 6000);
      }
    });
  }

  // ── 7. INITIALIZE ALL COMPONENTS ON DOM LOAD ──────────────────────────────
  // Shared header may inject after DOM ready (async fetch of base/header.html).
  document.addEventListener("rs:header-loaded", initNavigation);

  document.addEventListener("DOMContentLoaded", function () {
    initNavigation();
    initHeroShowcase();
    initProductsPage();
    initProductDetailPage();
    initMarketplaceProductPage();
    initInquiryForm();
  });

})();
