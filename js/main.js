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
              <span class="redesign-card-badge">${p.capacity || (isHindiPage ? 'भारी ड्यूटी' : 'Heavy Duty')}</span>
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

    var slug = getQueryParam("slug") || getQueryParam("id") || "monkey-crane";
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

    // Build dots pagination
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
        if (idx === currentIndex) {
          slide.classList.add("active");
        } else {
          slide.classList.remove("active");
        }
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

    function goToNext() {
      goToSlide(currentIndex + 1);
    }

    function goToPrev() {
      goToSlide(currentIndex - 1);
    }

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

    // Touch Swipe Gesture support
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
      if (swipeDistance < -40) {
        goToNext();
      } else if (swipeDistance > 40) {
        goToPrev();
      }
    }

    // Autoplay advances every 3s, and only while the hero is actually on screen.
    var heroSection = document.getElementById("hero");
    if (heroSection && "IntersectionObserver" in window) {
      var heroObserver = new IntersectionObserver(function (entries) {
        var entry = entries[0];
        heroVisible = entry.isIntersecting;
        if (heroVisible) {
          startAutoPlay();
        } else {
          stopAutoPlay();
        }
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
    initHeroSlider();
    initProductsPage();
    initProductDetailPage();
    initInquiryForm();
  });

})();
