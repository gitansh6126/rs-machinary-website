/**
 * RS Machinery - Main Client Logic
 * Catalog-driven UI controller. All product content (hero slides, featured
 * grid, product pages, form dropdowns, footer links, category filters) is
 * rendered from window.RSM_PRODUCTS / RSM_CATEGORIES (generated from
 * data/products*.json by scripts/build-catalog.js) - single source of truth.
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

  var ESC_MAP = { 38: "amp", 60: "lt", 62: "gt", 34: "quot", 39: "#39" };
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return "&" + ESC_MAP[c.charCodeAt(0)] + ";";
    });
  }

  var isHindiPage = (window.location.pathname.split("/").pop() || "").indexOf("-hi.html") !== -1;

  function catalog() {
    var all = (window.RSM_PRODUCTS || []);
    return all.filter(function (p) { return p.active !== false; })
              .sort(function (a, b) { return (a.sort_order || 99) - (b.sort_order || 99); });
  }

  function categories() { return window.RSM_CATEGORIES || []; }

  // ── 2. MOBILE MENU & HEADER INTERACTION ──────────────────────────────────
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
      if (mobileMenu.classList.contains("active")) closeMenu();
      else openMenu();
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

  // ── 2b. HERO SLIDER RENDERER (catalog-driven) ────────────────────────────
  function initHeroRenderer() {
    var track = document.getElementById("heroSliderTrack");
    if (!track) return;

    var t = isHindiPage ? {
      whatsapp: "व्हाट्सऐप", visitUs: "हमसे मिलें",
      trust: "GST बिलिंग · फैक्ट्री-डायरेक्ट कीमत · 33+ वर्षों का भरोसा",
      waMsg: function (n) { return "नमस्ते आरएस मशीनरी, मुझे " + n + " के बारे में पूछताछ करनी है। कृपया कीमत साझा करें।"; }
    } : {
      whatsapp: "WhatsApp", visitUs: "Visit Us",
      trust: "GST billing · Factory-direct pricing · 33+ years of trust in Haryana",
      waMsg: function (n) { return "Hi RS Machinery, I want to inquire about " + n + ". Please share pricing."; }
    };

    var heroProducts = catalog().filter(function (p) { return p.hero !== false; });
    if (heroProducts.length === 0) heroProducts = catalog().slice(0, 4);

    var MAPS_URL = "https://www.google.com/maps/dir/?api=1&destination=R+S+MACHINERY+STORE,+Sirsa,+Haryana";
    var PIN_SVG = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>';

    var html = "";
    heroProducts.forEach(function (p) {
      var featuresHtml = (p.hero_features || []).map(function (f) { return "<span>" + esc(f) + "</span>"; }).join("");
      html += '        <div class="redesign-hero-slide">\n'
        + '          <div class="redesign-hero-slide-content">\n'
        + '            <div class="redesign-hero-slide-badge">' + esc(p.category_name || p.name) + '</div>\n'
        + '            <h2 class="redesign-hero-slide-title">' + esc(p.hero_title_line1 || p.name) + '<br><span>' + esc(p.hero_title_line2 || "") + '</span></h2>\n'
        + '            <p class="redesign-hero-slide-desc">' + esc(p.hero_description || p.short_description) + '</p>\n'
        + '            <div class="redesign-hero-slide-actions">\n'
        + '              <a href="' + MAPS_URL + '" target="_blank" rel="noopener" class="redesign-btn redesign-btn-primary redesign-btn-lg">' + PIN_SVG + t.visitUs + '</a>\n'
        + '              <a href="' + formatWhatsAppUrl(t.waMsg(p.name)) + '" target="_blank" rel="noopener" class="redesign-btn redesign-btn-accent redesign-btn-lg">' + t.whatsapp + '</a>\n'
        + '            </div>\n'
        + '            <p class="redesign-hero-trust">' + t.trust + '</p>\n'
        + (featuresHtml ? '            <div class="redesign-hero-slide-features">' + featuresHtml + '</div>\n' : '')
        + '          </div>\n'
        + '          <div class="redesign-hero-slide-visual">\n'
        + '            <div class="redesign-hero-slide-img-wrap">\n'
        + '              <img src="' + esc(p.image) + '" alt="' + esc(p.name) + '" loading="eager" decoding="async" onerror="this.onerror=null;this.src=\'assets/placeholder.svg\';">\n'
        + '            </div>\n'
        + '          </div>\n'
        + '        </div>\n';
    });

    track.innerHTML = html;

    try {
      var first = heroProducts[0];
      var pre = document.querySelector('link[rel="preload"][as="image"]');
      if (pre && first) pre.setAttribute("href", first.image);
    } catch (e) { /* non-fatal */ }
  }

  // ── 2c. FEATURED PRODUCTS GRID (catalog-driven) ──────────────────────────
  function initFeaturedGrid() {
    var grid = document.getElementById("featuredProductsGrid");
    if (!grid) return;

    var t = isHindiPage
      ? { view: "विवरण देखें", wa: "व्हाट्सऐप", empty: "उत्पाद जल्द आ रहे हैं।", waMsg: function (n) { return "नमस्ते आरएस मशीनरी, मुझे " + n + " के बारे में जानकारी चाहिए। कृपया कोटेशन साझा करें।"; } }
      : { view: "View Details", wa: "WhatsApp", empty: "Products coming soon.", waMsg: function (n) { return "Hi RS Machinery, I want to inquire about " + n + ". Please share pricing."; } };

    var featured = catalog().filter(function (p) { return p.featured; });
    if (featured.length === 0) featured = catalog().slice(0, 4);
    var detailPage = isHindiPage ? "product-hi.html" : "product.html";

    var html = "";
    featured.forEach(function (p) {
      html += '        <div class="redesign-card">\n'
        + '          <div class="redesign-card-image-wrap">\n'
        + '            <a href="' + detailPage + '?slug=' + encodeURIComponent(p.slug) + '">\n'
        + '              <img src="' + esc(p.image) + '" alt="' + esc(p.name) + '" class="redesign-card-image" loading="lazy" onerror="this.onerror=null;this.src=\'assets/placeholder.svg\';">\n'
        + '            </a>\n'
        + '            <span class="redesign-card-badge">' + esc(p.capacity || (isHindiPage ? "भारी ड्यूटी" : "Heavy Duty")) + '</span>\n'
        + '          </div>\n'
        + '          <div class="redesign-card-body">\n'
        + '            <span class="redesign-card-category">' + esc(p.category_name || p.name) + '</span>\n'
        + '            <h3 class="redesign-card-title"><a href="' + detailPage + '?slug=' + encodeURIComponent(p.slug) + '">' + esc(p.name) + '</a></h3>\n'
        + '            <p class="redesign-card-desc">' + esc(p.short_description) + '</p>\n'
        + '            <div class="redesign-card-actions">\n'
        + '              <a href="' + detailPage + '?slug=' + encodeURIComponent(p.slug) + '" class="redesign-btn redesign-btn-outline redesign-btn-sm">' + t.view + '</a>\n'
        + '              <a href="' + formatWhatsAppUrl(t.waMsg(p.name)) + '" target="_blank" rel="noopener" class="redesign-btn redesign-btn-accent redesign-btn-sm">' + t.wa + '</a>\n'
        + '            </div>\n'
        + '          </div>\n'
        + '        </div>\n';
    });

    grid.innerHTML = html || ('<p style="grid-column:1/-1;text-align:center;opacity:.7;">' + t.empty + '</p>');
  }

  // ── 2d. FOOTER PRODUCTS COLUMN + category filter (catalog-driven) ───────
  function initFooterProducts() {
    var grids = document.querySelectorAll('.redesign-footer-grid');
    if (grids.length === 0) return;
    var productsPage = isHindiPage ? "products-hi.html" : "products.html";

    grids.forEach(function (grid) {
      var col = grid.children[1];
      if (!col) return;
      var list = col.querySelector('.redesign-footer-links');
      if (!list || list.dataset.catalog === "1") return;
      var html = "";
      categories().forEach(function (c) {
        html += '<a href="' + productsPage + '?category=' + encodeURIComponent(c.slug) + '">' + esc(c.name) + '</a>';
      });
      if (html) { list.innerHTML = html; list.dataset.catalog = "1"; }
    });
  }

  function initCategoryFilter() {
    var sel = document.getElementById("redesignFilterCategory");
    if (!sel) return;
    var all = isHindiPage ? "सभी श्रेणियाँ" : "All Categories";
    var html = '<option value="">' + all + '</option>';
    categories().forEach(function (c) {
      html += '<option value="' + esc(c.slug) + '">' + esc(c.name) + '</option>';
    });
    sel.innerHTML = html;
  }

  // ── 2e. INQUIRY FORM: product dropdown + image preview (catalog-driven) ─
  function initInquiryProductPicker() {
    var selects = document.querySelectorAll("select[name='product']");
    if (selects.length === 0) return;

    var t = isHindiPage
      ? { pick: "एक उत्पाद चुनें...", other: "अन्य / कई उत्पाद" }
      : { pick: "Select a product...", other: "Other / Multiple" };

    selects.forEach(function (sel) {
      var html = '<option value="">' + t.pick + '</option>';
      catalog().forEach(function (p) {
        html += '<option value="' + esc(p.name) + '" data-image="' + esc(p.image) + '" data-slug="' + esc(p.slug) + '">' + esc(p.name) + '</option>';
      });
      html += '<option value="Other">' + t.other + '</option>';
      sel.innerHTML = html;
    });

    var first = selects[0];
    var group = first.closest(".redesign-form-group");
    if (!group) return;

    var wrap = document.createElement("div");
    wrap.className = "redesign-inq-product-preview";
    wrap.style.cssText = "display:none;align-items:center;gap:12px;margin-top:10px;padding:10px;border:1px solid #e2e8f0;border-radius:12px;background:#fff;";
    var img = document.createElement("img");
    img.alt = "";
    img.style.cssText = "width:56px;height:56px;object-fit:cover;border-radius:10px;flex:0 0 auto;";
    var label = document.createElement("div");
    label.style.cssText = "font-size:0.9rem;font-weight:600;color:#0b1120;";
    var nameEl = document.createElement("div");
    var capEl = document.createElement("div");
    capEl.style.cssText = "font-size:0.78rem;color:#4a5b78;";
    label.appendChild(nameEl);
    label.appendChild(capEl);
    wrap.appendChild(img);
    wrap.appendChild(label);

    function updatePreview() {
      var opt = first.options[first.selectedIndex];
      var image = opt && opt.getAttribute("data-image");
      if (!image) { wrap.style.display = "none"; return; }
      img.src = image;
      img.alt = opt.textContent || "";
      nameEl.textContent = opt.textContent || "";
      var slug = opt.getAttribute("data-slug");
      var p = catalog().find(function (x) { return x.slug === slug; });
      capEl.textContent = p && p.capacity ? p.capacity : "";
      wrap.style.display = "flex";
    }

    first.addEventListener("change", updatePreview);
    group.appendChild(wrap);
    updatePreview();
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

    var products = catalog();

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
            emptyEl.innerHTML = '<div class="redesign-empty"><h3>आपके मानदंडों से मेल खाता कोई उत्पाद नहीं मिला</h3><p>अपना खोज शब्द या श्रेणी फ़िल्टर बदलकर देखें।</p><button class="redesign-btn redesign-btn-outline" onclick="location.href=\'products-hi.html\'">फ़िल्टर रीसेट करें</button></div>';
          } else {
            emptyEl.innerHTML = '<div class="redesign-empty"><h3>No products match your criteria</h3><p>Try adjusting your search query or category filter.</p><button class="redesign-btn redesign-btn-outline" onclick="location.href=\'products.html\'">Reset Filters</button></div>';
          }
        }
        return;
      }

      if (emptyEl) emptyEl.style.display = "none";

      var html = "";
      var detailPage = isHindiPage ? "product-hi.html" : "product.html";
      filtered.forEach(function (p) {
        var waUrl = formatWhatsAppUrl(isHindiPage
          ? "नमस्ते आरएस मशीनरी, मुझे " + p.name + " (" + p.capacity + ") में रुचि है। कृपया कोटेशन साझा करें।"
          : "Hi RS Machinery, I want to inquire about " + p.name + " (" + p.capacity + "). Please share pricing.");

        html += '<div class="redesign-card">'
          + '<div class="redesign-card-image-wrap">'
          + '<a href="' + detailPage + '?slug=' + encodeURIComponent(p.slug) + '">'
          + '<img src="' + esc(p.image) + '" alt="' + esc(p.name) + '" class="redesign-card-image" loading="lazy" onerror="this.onerror=null;this.src=\'assets/placeholder.svg\';">'
          + '</a>'
          + '<span class="redesign-card-badge">' + esc(p.capacity || (isHindiPage ? 'भारी ड्यूटी' : 'Heavy Duty')) + '</span>'
          + '</div>'
          + '<div class="redesign-card-body">'
          + '<span class="redesign-card-category">' + esc(p.category_name) + '</span>'
          + '<h3 class="redesign-card-title"><a href="' + detailPage + '?slug=' + encodeURIComponent(p.slug) + '">' + esc(p.name) + '</a></h3>'
          + '<p class="redesign-card-desc">' + esc(p.short_description) + '</p>'
          + '<div class="redesign-card-actions">'
          + '<a href="' + detailPage + '?slug=' + encodeURIComponent(p.slug) + '" class="redesign-btn redesign-btn-outline redesign-btn-sm">' + (isHindiPage ? 'विवरण देखें' : 'View Details') + '</a>'
          + '<a href="' + waUrl + '" target="_blank" rel="noopener" class="redesign-btn redesign-btn-accent redesign-btn-sm">' + (isHindiPage ? 'व्हाट्सऐप' : 'WhatsApp') + '</a>'
          + '</div>'
          + '</div>'
          + '</div>';
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

    var slug = getQueryParam("slug") || getQueryParam("id") || "monkey-crane";
    var products = catalog();

    var product = products.find(function (p) {
      return p.slug === slug || String(p.id) === String(slug);
    }) || products[0];

    if (!product) return;

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

    document.title = product.seo_title || (product.name + " — RS Machinery");
    var titleEl = document.getElementById("redesignProductTitle");
    if (titleEl) titleEl.textContent = product.seo_title || product.name;

    var descMeta = document.querySelector('meta[name="description"]');
    if (descMeta && product.seo_description) descMeta.setAttribute("content", product.seo_description);

    var canMeta = document.querySelector('link[rel="canonical"]');
    if (canMeta) canMeta.setAttribute("href", "https://rsmachinary.in/" + (isHindiPage ? "product-hi.html" : "product.html") + "?slug=" + encodeURIComponent(product.slug));

    var waUrl = formatWhatsAppUrl(t.waMsg);

    var oldSchema = document.getElementById("rsmProductSchema");
    if (oldSchema) oldSchema.remove();
    var schemaData = {
      "@context": "https://schema.org",
      "@type": "Product",
      name: product.name,
      description: product.seo_description || product.short_description || product.description,
      image: [product.image],
      brand: { "@type": "Brand", name: product.brand || "RS Machinery" },
      sku: "RSM-" + String(product.id).padStart(3, "0"),
      offers: {
        "@type": "Offer",
        priceCurrency: "INR",
        availability: "https://schema.org/InStock",
        seller: { "@type": "Organization", name: "RS Machinery", telephone: "+91-8708795253" }
      }
    };
    var schema = document.createElement("script");
    schema.type = "application/ld+json";
    schema.id = "rsmProductSchema";
    schema.textContent = JSON.stringify(schemaData);
    document.head.appendChild(schema);

    var specsHtml = "";
    if (product.specifications) {
      specsHtml += '<table class="price-table"><thead><tr><th>' + t.spec + '</th><th>' + t.details + '</th></tr></thead><tbody>';
      for (var specKey in product.specifications) {
        specsHtml += '<tr><td><strong>' + esc(specKey) + '</strong></td><td>' + esc(product.specifications[specKey]) + '</td></tr>';
      }
      specsHtml += '</tbody></table>';
    }

    var variationsHtml = "";
    if (product.variations && product.variations.length > 0) {
      variationsHtml += '<div class="redesign-variations"><h4 class="redesign-variations-title">' + t.popular + '</h4><ul class="redesign-variation-list">';
      product.variations.forEach(function (v) {
        variationsHtml += '<li>' + esc(v.name) + '</li>';
      });
      variationsHtml += '</ul></div>';
    }

    var featuresHtml = "";
    if (product.features && product.features.length > 0) {
      featuresHtml += '<ul class="redesign-feature-list">';
      product.features.forEach(function (f) {
        featuresHtml += '<li>✔ <strong>' + esc(f) + '</strong></li>';
      });
      featuresHtml += '</ul>';
    }

    var faqHtml = "";
    if (product.faq && product.faq.length > 0) {
      faqHtml += '<div class="redesign-pd-faq"><h3 class="redesign-pd-faq-title">' + t.faq + '</h3>';
      product.faq.forEach(function (item) {
        faqHtml += '<div class="redesign-pd-faq-item"><h4 class="redesign-pd-faq-q">Q: ' + esc(item.q) + '</h4><p class="redesign-pd-faq-a">A: ' + esc(item.a) + '</p></div>';
      });
      faqHtml += '</div>';
    }

    detailContainer.innerHTML = '<section class="redesign-section">'
      + '<div class="redesign-shell">'
      + '<nav class="redesign-pd-crumb">'
      + '<a href="' + (isHindiPage ? 'index-hi.html' : '/') + '">' + t.home + '</a> &nbsp;/&nbsp;'
      + '<a href="' + (isHindiPage ? 'products-hi.html' : 'products.html') + '">' + t.products + '</a> &nbsp;/&nbsp;'
      + '<span>' + esc(product.name) + '</span>'
      + '</nav>'
      + '<div class="redesign-pd-grid">'
      + '<div class="redesign-product-detail-media">'
      + '<div class="redesign-pd-media">'
      + '<img src="' + esc(product.image) + '" alt="' + esc(product.name) + '" class="redesign-pd-img" decoding="async" onerror="this.onerror=null;this.src=\'assets/placeholder.svg\';">'
      + '</div>'
      + '</div>'
      + '<div class="redesign-product-detail-info">'
      + '<span class="redesign-section-tag">' + esc(product.category_name) + '</span>'
      + '<h1 class="redesign-pd-title">' + esc(product.name) + '</h1>'
      + '<p class="redesign-pd-desc">' + esc(product.description) + '</p>'
      + '<div class="redesign-pd-statsbar">'
      + '<div><span class="redesign-pd-stat-label">' + t.capacity + '</span><span class="redesign-pd-stat-value">' + esc(product.capacity) + '</span></div>'
      + '<div><span class="redesign-pd-stat-label">' + t.warranty + '</span><span class="redesign-pd-stat-warranty">✔ ' + esc(product.warranty) + '</span></div>'
      + '</div>'
      + '<div class="redesign-pd-ctas">'
      + '<a href="' + waUrl + '" target="_blank" rel="noopener" class="redesign-btn redesign-btn-accent redesign-btn-lg">' + t.waQuote + '</a>'
      + '<a href="tel:' + PHONE_NUMBER + '" class="redesign-btn redesign-btn-primary redesign-btn-lg">' + t.call + '</a>'
      + '</div>'
      + '</div>'
      + '</div>'
      + '<div class="redesign-pd-extra">'
      + '<h3 class="redesign-pd-block-title">' + t.techSpecs + '</h3>'
      + specsHtml
      + variationsHtml
      + '<h3 class="redesign-pd-block-title redesign-pd-block-title--top">' + t.keyFeatures + '</h3>'
      + featuresHtml
      + faqHtml
      + '</div>'
      + '</div>'
      + '</section>';

    var prodSelect = document.getElementById("inqProduct");
    if (prodSelect && product.name) {
      for (var o = 0; o < prodSelect.options.length; o++) {
        if (prodSelect.options[o].value === product.name) {
          prodSelect.selectedIndex = o;
          prodSelect.dispatchEvent(new Event("change"));
          break;
        }
      }
    }
  }

  // ── 5. HERO SLIDER CONTROLLER (Smooth Transitions + Touch Drag) ───────
  function initHeroSlider() {
    var track = document.getElementById("heroSliderTrack");
    var viewport = document.getElementById("heroSliderViewport") || (track ? track.parentElement : null);
    var prevBtn = document.getElementById("heroSliderPrev");
    var nextBtn = document.getElementById("heroSliderNext");
    var currentEl = document.getElementById("heroSliderCurrent");
    var totalEl = document.getElementById("heroSliderTotal");
    var dotsEl = document.getElementById("heroSliderDots");

    if (!track) return;

    var slides = track.querySelectorAll(".redesign-hero-slide");
    if (slides.length === 0) return;

    var currentIndex = 0;
    var autoPlayTimer = null;
    var heroVisible = true;
    var touchStartX = 0;
    var touchEndX = 0;

    var dots = [];
    if (dotsEl) {
      dotsEl.innerHTML = "";
      for (var d = 0; d < slides.length; d++) {
        var dot = document.createElement("button");
        dot.type = "button";
        dot.className = "redesign-hero-slider-dot";
        dot.setAttribute("aria-label", "Go to slide " + (d + 1));
        dot.addEventListener("click", (function (idx) {
          return function () {
            goToSlide(idx);
            startAutoPlay();
          };
        })(d));
        dotsEl.appendChild(dot);
        dots.push(dot);
      }
    }

    if (totalEl) {
      totalEl.textContent = slides.length < 10 ? "0" + slides.length : slides.length;
    }

    function updateSlider() {
      track.style.transform = "translateX(-" + (currentIndex * 100) + "%)";

      slides.forEach(function (slide, idx) {
        if (idx === currentIndex) slide.classList.add("active");
        else slide.classList.remove("active");
      });

      dots.forEach(function (dot, idx) {
        dot.classList.toggle("active", idx === currentIndex);
      });

      if (currentEl) {
        var displayNum = currentIndex + 1;
        currentEl.textContent = displayNum < 10 ? "0" + displayNum : displayNum;
      }
    }

    function goToSlide(idx) {
      currentIndex = (idx + slides.length) % slides.length;
      updateSlider();
    }

    function goToNext() { goToSlide(currentIndex + 1); }
    function goToPrev() { goToSlide(currentIndex - 1); }

    function startAutoPlay() {
      stopAutoPlay();
      if (!heroVisible) return;
      autoPlayTimer = setInterval(goToNext, 3000);
    }

    function stopAutoPlay() {
      if (autoPlayTimer) clearInterval(autoPlayTimer);
    }

    if (prevBtn) {
      prevBtn.addEventListener("click", function () {
        goToPrev();
        startAutoPlay();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", function () {
        goToNext();
        startAutoPlay();
      });
    }

    if (viewport) {
      viewport.addEventListener("touchstart", function (e) {
        touchStartX = e.changedTouches[0].screenX;
        stopAutoPlay();
      }, { passive: true });

      viewport.addEventListener("touchend", function (e) {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
        startAutoPlay();
      }, { passive: true });

      viewport.addEventListener("mouseenter", stopAutoPlay);
      viewport.addEventListener("mouseleave", startAutoPlay);
    }

    function handleSwipe() {
      var swipeDistance = touchEndX - touchStartX;
      if (swipeDistance < -40) goToNext();
      else if (swipeDistance > 40) goToPrev();
    }

    var heroSection = document.getElementById("hero");
    if (heroSection && "IntersectionObserver" in window) {
      var heroObserver = new IntersectionObserver(function (entries) {
        var entry = entries[0];
        heroVisible = entry.isIntersecting;
        if (heroVisible) startAutoPlay();
        else stopAutoPlay();
      }, { threshold: 0.2 });
      heroObserver.observe(heroSection);
    }

    updateSlider();
    startAutoPlay();
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

    var paramProduct = (getQueryParam("product") || "").trim();
    if (paramProduct) {
      var selects = form.querySelectorAll("select[name='product']");
      selects.forEach(function (sel) {
        for (var i = 0; i < sel.options.length; i++) {
          if (sel.options[i].value.toLowerCase() === paramProduct.toLowerCase()) {
            sel.selectedIndex = i;
            sel.dispatchEvent(new Event("change"));
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
  document.addEventListener("rs:header-loaded", initNavigation);

  document.addEventListener("DOMContentLoaded", function () {
    initNavigation();
    initHeroRenderer();
    initHeroSlider();
    initFeaturedGrid();
    initFooterProducts();
    initCategoryFilter();
    initInquiryProductPicker();
    initProductsPage();
    initProductDetailPage();
    initInquiryForm();
  });

})();
