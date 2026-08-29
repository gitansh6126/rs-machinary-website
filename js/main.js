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

  // ── 2. MOBILE MENU & HEADER INTERACTION ──────────────────────────────────
  function initNavigation() {
    var menuBtn = document.getElementById("mobileMenuBtn");
    var mobileMenu = document.getElementById("mobileMenu");
    var overlay = document.getElementById("mobileMenuOverlay");
    var closeBtn = document.querySelector(".mobile-menu-close");

    if (!menuBtn || !mobileMenu) return;

    function openMenu() {
      mobileMenu.classList.add("active");
      if (overlay) overlay.classList.add("active");
      menuBtn.setAttribute("aria-expanded", "true");
      document.body.style.overflow = "hidden";
    }

    function closeMenu() {
      mobileMenu.classList.remove("active");
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

    var mobileNavLinks = document.querySelectorAll(".mobile-nav-link");
    mobileNavLinks.forEach(function (link) {
      link.addEventListener("click", closeMenu);
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
        countLabel.textContent = "Showing " + filtered.length + " product" + (filtered.length !== 1 ? "s" : "");
      }

      if (filtered.length === 0) {
        gridContainer.innerHTML = "";
        if (emptyEl) {
          emptyEl.style.display = "block";
          emptyEl.innerHTML = `
            <div style="padding:2rem; background:#f8fafc; border-radius:12px;">
              <h3 style="margin-bottom:0.5rem;color:#0f172a;">No products match your criteria</h3>
              <p style="color:#64748b;">Try adjusting your search query or category filter.</p>
              <button class="redesign-btn redesign-btn-outline" style="margin-top:1rem;" onclick="location.href='products.html'">Reset Filters</button>
            </div>
          `;
        }
        return;
      }

      if (emptyEl) emptyEl.style.display = "none";

      var html = "";
      filtered.forEach(function (p) {
        var waMsg = "Hi RS Machinery, I want to inquire about " + p.name + " (" + p.capacity + "). Please share pricing.";
        var waUrl = formatWhatsAppUrl(waMsg);

        html += `
          <div class="redesign-card">
            <div class="redesign-card-image-wrap">
              <a href="product.html?slug=${p.slug}">
                <img src="${p.image}" alt="${p.name}" class="redesign-card-image" loading="lazy" onerror="this.onerror=null;this.src='assets/placeholder.svg';">
              </a>
              <span class="redesign-card-badge">${p.capacity || 'Heavy Duty'}</span>
            </div>
            <div class="redesign-card-body">
              <span class="redesign-card-category">${p.category_name}</span>
              <h3 class="redesign-card-title">
                <a href="product.html?slug=${p.slug}">${p.name}</a>
              </h3>
              <p class="redesign-card-desc">${p.short_description}</p>
              <div class="redesign-card-price">${p.price}</div>
              <div class="redesign-card-actions">
                <a href="product.html?slug=${p.slug}" class="redesign-btn redesign-btn-outline redesign-btn-sm" style="flex:1;">View Details</a>
                <a href="${waUrl}" target="_blank" rel="noopener" class="redesign-btn redesign-btn-accent redesign-btn-sm" style="flex:1;">WhatsApp</a>
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

    // Update document head title & canonical meta tags dynamically
    document.title = product.seo_title || (product.name + " — RS Machinery");
    var titleEl = document.getElementById("redesignProductTitle");
    if (titleEl) titleEl.textContent = product.seo_title || product.name;

    var descMeta = document.querySelector('meta[name="description"]');
    if (descMeta && product.seo_description) descMeta.setAttribute("content", product.seo_description);

    var waInquiryMsg = "Hi RS Machinery, I am interested in " + product.name + " (" + product.capacity + "). Please share technical details & quote.";
    var waUrl = formatWhatsAppUrl(waInquiryMsg);

    // Build specifications table HTML
    var specsHtml = "";
    if (product.specifications) {
      specsHtml += `<table class="price-table" style="width:100%;margin-top:1rem;"><thead><tr><th>Specification</th><th>Details</th></tr></thead><tbody>`;
      for (var specKey in product.specifications) {
        specsHtml += `<tr><td><strong>${specKey}</strong></td><td>${product.specifications[specKey]}</td></tr>`;
      }
      specsHtml += `</tbody></table>`;
    }

    // Build variations table HTML
    var variationsHtml = "";
    if (product.variations && product.variations.length > 0) {
      variationsHtml += `<div style="margin-top:1.5rem;"><h4 style="margin-bottom:0.75rem;font-size:1.1rem;color:var(--redesign-brand);">Popular Capacity Models & Price Ranges</h4><table class="price-table" style="width:100%;"><thead><tr><th>Model Variant</th><th>Approx. Price Range</th></tr></thead><tbody>`;
      product.variations.forEach(function (v) {
        variationsHtml += `<tr><td>${v.name}</td><td><strong style="color:var(--redesign-brand);">${v.price}</strong></td></tr>`;
      });
      variationsHtml += `</tbody></table></div>`;
    }

    // Build features list
    var featuresHtml = "";
    if (product.features && product.features.length > 0) {
      featuresHtml += `<ul class="city-prod-card" style="list-style:none;padding:1rem 1.5rem;margin-top:1rem;background:#f8fafc;border-radius:10px;">`;
      product.features.forEach(function (f) {
        featuresHtml += `<li style="padding:6px 0;color:#334155;font-size:0.95rem;">✔ <strong>${f}</strong></li>`;
      });
      featuresHtml += `</ul>`;
    }

    // Build FAQ section
    var faqHtml = "";
    if (product.faq && product.faq.length > 0) {
      faqHtml += `<div class="city-faq" style="margin-top:2.5rem;"><h3 style="font-size:1.4rem;margin-bottom:1rem;color:var(--redesign-brand);">Frequently Asked Questions</h3>`;
      product.faq.forEach(function (item) {
        faqHtml += `<div class="city-faq-item" style="padding:1rem 0;border-bottom:1px solid #e2e8f0;"><h4 style="font-size:1.05rem;color:#0f172a;margin-bottom:0.4rem;">Q: ${item.q}</h4><p style="color:#475569;margin:0;">A: ${item.a}</p></div>`;
      });
      faqHtml += `</div>`;
    }

    detailContainer.innerHTML = `
      <section class="redesign-section">
        <div class="redesign-shell">
          <div style="margin-bottom:1.5rem;font-size:0.9rem;color:#64748b;">
            <a href="/" style="color:var(--redesign-brand);">Home</a> &nbsp;/&nbsp;
            <a href="products.html" style="color:var(--redesign-brand);">Products</a> &nbsp;/&nbsp;
            <span>${product.name}</span>
          </div>

          <div class="redesign-product-detail-grid" style="display:grid;grid-template-columns:1fr 1fr;gap:2.5rem;align-items:start;">
            <div class="redesign-product-detail-media">
              <div style="background:#fff;border:1px solid #e2e8f0;border-radius:16px;padding:1.5rem;text-align:center;">
                <img src="${product.image}" alt="${product.name}" class="product-detail-image" style="max-width:100%;max-height:420px;object-fit:contain;border-radius:8px;" onerror="this.onerror=null;this.src='assets/placeholder.svg';">
              </div>
            </div>

            <div class="redesign-product-detail-info">
              <span class="redesign-section-tag">${product.category_name}</span>
              <h1 style="font-size:2.2rem;font-weight:800;color:#0f172a;margin:0.5rem 0 1rem;">${product.name}</h1>
              <p style="font-size:1.05rem;color:#475569;line-height:1.6;margin-bottom:1.5rem;">${product.description}</p>
              
              <div style="background:#f1f5f9;border-radius:12px;padding:1.25rem;margin-bottom:1.5rem;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:1rem;">
                <div>
                  <span style="display:block;font-size:0.8rem;text-transform:uppercase;color:#64748b;font-weight:700;">Price Range</span>
                  <span style="font-size:1.4rem;font-weight:800;color:var(--redesign-brand);">${product.price}</span>
                </div>
                <div>
                  <span style="display:block;font-size:0.8rem;text-transform:uppercase;color:#64748b;font-weight:700;">Capacity</span>
                  <span style="font-size:1.1rem;font-weight:700;color:#0f172a;">${product.capacity}</span>
                </div>
                <div>
                  <span style="display:block;font-size:0.8rem;text-transform:uppercase;color:#64748b;font-weight:700;">Warranty</span>
                  <span style="font-size:1rem;font-weight:600;color:#059669;">✔ ${product.warranty}</span>
                </div>
              </div>

              <div style="display:flex;gap:1rem;flex-wrap:wrap;margin-bottom:1.5rem;">
                <a href="${waUrl}" target="_blank" rel="noopener" class="redesign-btn redesign-btn-accent redesign-btn-lg" style="flex:1;text-align:center;">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347"/></svg>
                  Get Instant WhatsApp Quote
                </a>
                <a href="tel:${PHONE_NUMBER}" class="redesign-btn redesign-btn-primary redesign-btn-lg" style="flex:1;text-align:center;">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                  Call +91 8708795253
                </a>
              </div>
            </div>
          </div>

          <div style="margin-top:3rem;">
            <h3 style="font-size:1.5rem;color:#0f172a;margin-bottom:1rem;">Technical Specifications</h3>
            ${specsHtml}
            ${variationsHtml}
            <h3 style="font-size:1.5rem;color:#0f172a;margin-top:2.5rem;margin-bottom:0.5rem;">Key Features & Highlights</h3>
            ${featuresHtml}
            ${faqHtml}
          </div>
        </div>
      </section>
    `;
  }

  // ── 5. HERO SLIDER CONTROLLER (Smooth Transitions + Touch Drag) ───────
  function initHeroSlider() {
    var track = document.getElementById("heroSliderTrack");
    var viewport = document.getElementById("heroSliderViewport") || (track ? track.parentElement : null);
    var prevBtn = document.getElementById("heroSliderPrev");
    var nextBtn = document.getElementById("heroSliderNext");
    var currentEl = document.getElementById("heroSliderCurrent");
    var totalEl = document.getElementById("heroSliderTotal");

    if (!track) return;

    var slides = track.querySelectorAll(".redesign-hero-slide");
    if (slides.length === 0) return;

    var currentIndex = 0;
    var autoPlayTimer = null;
    var touchStartX = 0;
    var touchEndX = 0;

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

      if (currentEl) {
        var displayNum = currentIndex + 1;
        currentEl.textContent = displayNum < 10 ? "0" + displayNum : displayNum;
      }
    }

    function goToNext() {
      currentIndex = (currentIndex + 1) % slides.length;
      updateSlider();
    }

    function goToPrev() {
      currentIndex = (currentIndex - 1 + slides.length) % slides.length;
      updateSlider();
    }

    function startAutoPlay() {
      stopAutoPlay();
      autoPlayTimer = setInterval(goToNext, 6000);
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

    updateSlider();
    startAutoPlay();
  }

  // ── 6. INQUIRY FORM HANDLER ──────────────────────────────────────────────
  function initInquiryForm() {
    var form = document.getElementById("redesignInquiryForm");
    if (!form) return;

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = document.getElementById("inqName") ? document.getElementById("inqName").value : "";
      var phone = document.getElementById("inqPhone") ? document.getElementById("inqPhone").value : "";
      var productSelect = document.getElementById("inqProduct") ? document.getElementById("inqProduct").value : "";
      var message = document.getElementById("inqMessage") ? document.getElementById("inqMessage").value : "";

      var fullMsg = "New Machinery Inquiry from Website:\n";
      fullMsg += "• Name: " + (name || "Not provided") + "\n";
      fullMsg += "• Phone: " + (phone || "Not provided") + "\n";
      if (productSelect) fullMsg += "• Product: " + productSelect + "\n";
      if (message) fullMsg += "• Message: " + message + "\n";

      var waUrl = formatWhatsAppUrl(fullMsg);
      window.open(waUrl, "_blank");

      var submitBtn = document.getElementById("inqSubmit");
      if (submitBtn) {
        submitBtn.innerHTML = "✔ Inquiry Opened in WhatsApp!";
        submitBtn.style.backgroundColor = "#25d366";
      }
    });
  }

  // ── 7. INITIALIZE ALL COMPONENTS ON DOM LOAD ──────────────────────────────
  document.addEventListener("DOMContentLoaded", function () {
    initNavigation();
    initHeroSlider();
    initProductsPage();
    initProductDetailPage();
    initInquiryForm();
  });

})();
