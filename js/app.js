/**
 * RS Machinery - Frontend Application
 *
 * Extracted from inline scripts in index.html plus new product functionality.
 * Handles: language toggle, lightbox, slider, mobile menu, scroll animation,
 * product loading, category filters, search, inquiry form.
 */

(function () {
  'use strict';

  // ─── DOM READY ──────────────────────────────────────────────────────────

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    initLanguageToggle();
    initLightbox();
    initMobileMenu();
    initProductSlider();
    initScrollAnimation();

    // Page-specific initializers
    if (document.getElementById('productsContainer')) {
      initProductGrid();
    }
    if (document.getElementById('productDetailContainer')) {
      initProductDetail();
    }
    if (document.getElementById('productsListingContainer')) {
      initProductsListing();
    }
    if (document.getElementById('inquiryForm')) {
      initInquiryForm();
    }
    initFaqToggles();
  }

  // ─── LANGUAGE TOGGLE ────────────────────────────────────────────────────

  function initLanguageToggle() {
    var toggleButton = document.getElementById('langToggle');
    if (!toggleButton) return;

    var dictionary = getDictionary();
    var activeLanguage = 'en';

    function applyLanguage(lang) {
      try {
        var values = dictionary[lang];
        if (!values) return;

        document.documentElement.lang = lang === 'hi' ? 'hi' : 'en';
        document.title = values.title || document.title;

        var description = document.querySelector('meta[name="description"]');
        if (description && values.description) {
          description.setAttribute('content', values.description);
        }

        document.querySelectorAll('[data-i18n]').forEach(function (node) {
          var key = node.getAttribute('data-i18n');
          var attr = node.getAttribute('data-i18n-attr');
          var useHtml = node.hasAttribute('data-i18n-html');
          if (!key || !values[key]) return;

          if (useHtml) {
            node.innerHTML = values[key];
          } else if (attr) {
            node.setAttribute(attr, values[key]);
          } else {
            node.textContent = values[key];
          }
        });

        toggleButton.setAttribute('aria-pressed', lang === 'hi' ? 'true' : 'false');
        toggleButton.classList.toggle('is-hindi', lang === 'hi');
      } catch (e) {
        console.error('Language error:', e);
      }
    }

    toggleButton.addEventListener('click', function () {
      activeLanguage = activeLanguage === 'en' ? 'hi' : 'en';
      applyLanguage(activeLanguage);
    });

    applyLanguage(activeLanguage);
  }

  // ─── LIGHTBOX ───────────────────────────────────────────────────────────

  function initLightbox() {
    var overlay = document.createElement('div');
    overlay.className = 'lightbox-overlay';
    overlay.innerHTML = '<button class="lightbox-close" aria-label="Close image">\u2715</button><img class="lightbox-image" src="" alt="">';
    document.body.appendChild(overlay);

    var lightboxImg = overlay.querySelector('.lightbox-image');
    var closeBtn = overlay.querySelector('.lightbox-close');

    document.querySelectorAll('.product-img, .product-scroll-card-image img, .product-detail-image').forEach(function (img) {
      img.addEventListener('click', function (e) {
        e.stopPropagation();
        lightboxImg.src = img.src;
        lightboxImg.alt = img.alt;
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
      });
    });

    function closeLightbox() {
      overlay.classList.remove('active');
      document.body.style.overflow = '';
    }

    closeBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      closeLightbox();
    });

    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) closeLightbox();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeLightbox();
    });
  }

  // ─── MOBILE MENU ────────────────────────────────────────────────────────

  function initMobileMenu() {
    var btn = document.getElementById('mobileMenuBtn');
    var menu = document.getElementById('mobileMenu');
    var overlay = document.getElementById('mobileMenuOverlay');
    if (!btn || !menu || !overlay) return;

    function toggleMenu(isOpen) {
      btn.classList.toggle('active', isOpen);
      menu.classList.toggle('active', isOpen);
      overlay.classList.toggle('active', isOpen);
      document.body.classList.toggle('menu-open', isOpen);
      btn.setAttribute('aria-expanded', isOpen);
      menu.setAttribute('aria-hidden', !isOpen);
    }

    btn.addEventListener('click', function () {
      toggleMenu(!menu.classList.contains('active'));
    });

    overlay.addEventListener('click', function () { toggleMenu(false); });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.classList.contains('active')) toggleMenu(false);
    });

    menu.querySelectorAll('.mobile-nav-link, .mobile-nav-cta').forEach(function (link) {
      link.addEventListener('click', function () { toggleMenu(false); });
    });

    var closeBtn = menu.querySelector('.mobile-menu-close');
    if (closeBtn) closeBtn.addEventListener('click', function () { toggleMenu(false); });
  }

  // ─── PRODUCT CAROUSEL ─────────────────────────────────────────────────
  // Manual-browse carousel with side previews, edge interaction, touch swipe

  function initProductSlider() {
    var slider = document.querySelector('.pslider');
    if (!slider) return;

    var viewport = slider.querySelector('.pslider-viewport');
    var track = slider.querySelector('.pslider-track');
    if (!track) return;

    var originalSlides = Array.from(track.querySelectorAll('.pslide'));
    if (originalSlides.length < 2) return;

    var total = originalSlides.length;
    var prevBtns = slider.querySelectorAll('[data-pslide-prev]');
    var nextBtns = slider.querySelectorAll('[data-pslide-next]');
    var edgeLeft = slider.querySelector('.pslider-edge-left');
    var edgeRight = slider.querySelector('.pslider-edge-right');
    var counter = slider.querySelector('.pslider-counter-current');
    var progressBar = slider.querySelector('.pslider-progress-bar');
    var swipeHint = slider.querySelector('.pslider-swipe-hint');

    // Clone first and last for infinite scroll
    var firstClone = originalSlides[0].cloneNode(true);
    var lastClone = originalSlides[total - 1].cloneNode(true);

    // Augmented: [lastClone, 0, 1, ..., last, firstClone]
    var slides = [lastClone].concat(Array.from(originalSlides)).concat([firstClone]);

    track.innerHTML = '';
    slides.forEach(function (s) { track.appendChild(s); });

    // displayIndex: position in augmented array
    // realIndex: which original slide (0-based) is active
    var displayIndex = 1;
    var realIndex = 0;
    var isAnimating = false;

    // -- Carousel sizing --
    // Read --slide-width CSS variable dynamically
    function getSlideUnit() {
      var pct = 86; // default fallback
      if (viewport) {
        var val = getComputedStyle(viewport).getPropertyValue('--slide-width').trim();
        if (val) {
          pct = parseFloat(val);
        }
      }
      return pct;
    }

    // translateX = -((firstRealPos) + (displayIndex-1) * slideUnit - previewLeft)
    // firstRealPos = slideUnit (lastClone takes 1 full slide width before first real slide)
    // previewLeft = how much of prev slide visible from viewport left (4%)
    function getPct(di) {
      var sw = getSlideUnit();
      var firstRealPos = sw;
      return -(firstRealPos + (di - 1) * sw - 4);
    }

    function setTrack(di, animate) {
      if (animate === false) {
        track.classList.add('no-transition');
      } else {
        track.classList.remove('no-transition');
      }
      track.style.transform = 'translate3d(' + getPct(di) + '%, 0, 0)';
      if (animate === false) {
        void track.offsetHeight;
      }
    }

    function updateCounter(ri) {
      if (!counter) return;
      var num = (ri + 1).toString().padStart(2, '0');
      counter.textContent = num;
    }

    function updateProgress(ri) {
      if (!progressBar) return;
      var pct = ((ri + 1) / total) * 100;
      progressBar.style.width = pct + '%';
    }

    function updateUI(ri) {
      updateCounter(ri);
      updateProgress(ri);
    }

    function slideTo(targetDisplay, targetReal) {
      if (isAnimating) return;
      isAnimating = true;
      displayIndex = targetDisplay;
      realIndex = targetReal;
      setTrack(targetDisplay, true);
      updateUI(targetReal);
    }

    function onTransitionEnd() {
      isAnimating = false;
      // Infinite loop: bounce back from clones
      if (displayIndex === 0) {
        displayIndex = total;
        setTrack(displayIndex, false);
        updateUI(total - 1);
      } else if (displayIndex === total + 1) {
        displayIndex = 1;
        setTrack(displayIndex, false);
        updateUI(0);
      }
    }

    function getReal(di) {
      if (di === 0) return total - 1;
      if (di === total + 1) return 0;
      return di - 1;
    }

    function next() {
      if (isAnimating) return;
      var td = displayIndex + 1;
      slideTo(td, getReal(td));
    }

    function prev() {
      if (isAnimating) return;
      var td = displayIndex - 1;
      slideTo(td, getReal(td));
    }

    // ── Edge preview hover ──

    function onEdgeMove(edge, isEnter) {
      if (!edge) return;
      if (isEnter) {
        edge.classList.add('active-preview');
      } else {
        edge.classList.remove('active-preview');
      }
    }

    var edgeTimeout = null;

    function handleViewportMove(e) {
      var rect = viewport.getBoundingClientRect();
      var x = e.clientX - rect.left;
      var w = rect.width;
      var edgeZone = Math.min(80, w * 0.1);

      if (x < edgeZone) {
        onEdgeMove(edgeLeft, true);
        onEdgeMove(edgeRight, false);
        viewport.style.cursor = 'w-resize';
      } else if (x > w - edgeZone) {
        onEdgeMove(edgeRight, true);
        onEdgeMove(edgeLeft, false);
        viewport.style.cursor = 'e-resize';
      } else {
        onEdgeMove(edgeLeft, false);
        onEdgeMove(edgeRight, false);
        viewport.style.cursor = 'grab';
      }
    }

    function handleViewportLeave() {
      onEdgeMove(edgeLeft, false);
      onEdgeMove(edgeRight, false);
      viewport.style.cursor = 'grab';
    }

    // ── Edge click ──

    if (edgeLeft) {
      edgeLeft.addEventListener('click', function (e) {
        e.stopPropagation();
        prev();
      });
    }

    if (edgeRight) {
      edgeRight.addEventListener('click', function (e) {
        e.stopPropagation();
        next();
      });
    }

    // ── Attach events ──

    track.addEventListener('transitionend', onTransitionEnd);

    prevBtns.forEach(function (b) {
      b.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        prev();
      });
    });

    nextBtns.forEach(function (b) {
      b.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        next();
      });
    });

    // Edge mouse hover
    viewport.addEventListener('mousemove', handleViewportMove);
    viewport.addEventListener('mouseleave', handleViewportLeave);

    // Keyboard
    document.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prev();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        next();
      }
    });

    // ── Touch swipe with momentum ──

    var touchState = {
      startX: 0,
      startY: 0,
      currentX: 0,
      isDragging: false,
      moved: false,
      velocityX: 0,
      lastTime: 0,
      lastX: 0
    };

    var SWIPE_THRESHOLD = 50;
    var SWIPE_VELOCITY_THRESHOLD = 0.3;

    viewport.addEventListener('touchstart', function (e) {
      var t = e.changedTouches[0];
      touchState.startX = t.screenX;
      touchState.startY = t.screenY;
      touchState.currentX = t.screenX;
      touchState.isDragging = true;
      touchState.moved = false;
      touchState.velocityX = 0;
      touchState.lastTime = Date.now();
      touchState.lastX = t.screenX;
    }, { passive: true });

    viewport.addEventListener('touchmove', function (e) {
      if (!touchState.isDragging) return;
      var t = e.changedTouches[0];
      touchState.currentX = t.screenX;
      touchState.moved = true;

      // Calculate velocity
      var now = Date.now();
      var dt = now - touchState.lastTime;
      if (dt > 0) {
        touchState.velocityX = (t.screenX - touchState.lastX) / dt;
      }
      touchState.lastTime = now;
      touchState.lastX = t.screenX;

      // Prevent vertical scroll interference
      var diffY = Math.abs(t.screenY - touchState.startY);
      var diffX = Math.abs(t.screenX - touchState.startX);
      if (diffX > diffY && diffX > 10) {
        e.preventDefault();
      }
    }, { passive: false });

    viewport.addEventListener('touchend', function (e) {
      if (!touchState.isDragging) return;
      touchState.isDragging = false;

      if (!touchState.moved) return;

      var diff = touchState.startX - touchState.currentX;
      var absDiff = Math.abs(diff);

      // Momentum check — fast flick even if short
      var hasMomentum = Math.abs(touchState.velocityX) > SWIPE_VELOCITY_THRESHOLD;

      if (absDiff > SWIPE_THRESHOLD || hasMomentum) {
        if (diff > 0 || (hasMomentum && touchState.velocityX < -0.3)) {
          next();
        } else {
          prev();
        }
      }
    }, { passive: true });

    // ── Show swipe hint briefly ──

    if (swipeHint) {
      swipeHint.classList.add('is-visible');
      setTimeout(function () {
        swipeHint.classList.remove('is-visible');
      }, 4000);
    }

    // ── Init ──

    setTrack(displayIndex, false);
    updateUI(0);
  }

  // ─── SCROLL ANIMATION ───────────────────────────────────────────────────

  function initScrollAnimation() {
    var cards = document.querySelectorAll('.product-scroll-card');
    if (!cards.length) return;

    if (!('IntersectionObserver' in window)) {
      cards.forEach(function (c) { c.classList.add('visible'); });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    cards.forEach(function (card) { observer.observe(card); });
  }

  // ─── PRODUCT GRID (index.html) ──────────────────────────────────────────

  function initProductGrid() {
    var container = document.getElementById('productsContainer');
    var filtersContainer = document.getElementById('categoryFilters');
    var searchInput = document.getElementById('searchInput');
    if (!container) return;

    var currentCategory = '';
    var currentSearch = '';

    // Load categories for filter
    RSM_API.getCategories().then(function (res) {
      if (!res.success || !res.data) return;
      var categories = res.data.categories || [];
      if (!filtersContainer) return;

      // "All" button
      var allBtn = document.createElement('button');
      allBtn.className = 'category-filter is-active';
      allBtn.textContent = 'All';
      allBtn.addEventListener('click', function () {
        filtersContainer.querySelectorAll('.category-filter').forEach(function (b) { b.classList.remove('is-active'); });
        allBtn.classList.add('is-active');
        currentCategory = '';
        loadProducts();
      });
      filtersContainer.appendChild(allBtn);

      // Category buttons
      categories.forEach(function (cat) {
        var btn = document.createElement('button');
        btn.className = 'category-filter';
        btn.textContent = cat.name;
        btn.setAttribute('data-category-id', cat.id);
        btn.addEventListener('click', function () {
          filtersContainer.querySelectorAll('.category-filter').forEach(function (b) { b.classList.remove('is-active'); });
          btn.classList.add('is-active');
          currentCategory = cat.id;
          loadProducts();
        });
        filtersContainer.appendChild(btn);
      });
    });

    // Search handler with debounce
    if (searchInput) {
      searchInput.addEventListener('input', debounce(function () {
        currentSearch = searchInput.value.trim();
        loadProducts();
      }, 400));
    }

    function loadProducts() {
      container.innerHTML = '<div class="loading-spinner">Loading products...</div>';
      RSM_API.getProducts({
        category_id: currentCategory,
        search: currentSearch,
        limit: 50
      }).then(function (res) {
        if (!res.success || !res.data) {
          container.innerHTML = '<p class="no-results">Failed to load products.</p>';
          return;
        }
        var products = res.data.products || [];
        if (products.length === 0) {
          container.innerHTML = '<p class="no-results">No products found.</p>';
          return;
        }
        container.innerHTML = '';
        products.forEach(function (product) {
          container.appendChild(createProductCard(product));
        });
        // Re-init scroll animation for dynamically added cards
        initScrollAnimation();
      });
    }

    // Load products initially
    loadProducts();
  }

  // ─── PRODUCT IMAGE URL HELPER ──────────────────────────────────────────

  function getProductImageUrl(filename) {
    if (!filename) return 'assets/placeholder.svg';
    if (filename.indexOf('http') === 0 || filename.charAt(0) === '/') return filename;
    return '/uploads/products/' + filename;
  }

  // ─── PRODUCT CARD FACTORY ───────────────────────────────────────────────

  function createProductCard(product, categoryName) {
    var article = document.createElement('article');
    article.className = 'product-scroll-card';

    var imgSrc = getProductImageUrl(product.image);
    var detailUrl = 'product.html?' + (product.slug ? 'slug=' + encodeURIComponent(product.slug) : 'id=' + product.id);
    var whatsappUrl = 'https://wa.me/918708795253?text=' + encodeURIComponent('Hi, I am interested in ' + (product.name || '') + '. Please share price and details.');

    var categoryHtml = categoryName ? '<p class="product-scroll-card-category">' + escapeHtml(categoryName) + '</p>' : '';

    article.innerHTML =
      '<div class="product-scroll-card-image">' +
        '<a href="' + detailUrl + '">' +
          '<img src="' + imgSrc + '" alt="' + escapeHtml(product.name || '') + '" loading="lazy">' +
        '</a>' +
      '</div>' +
      '<div class="product-scroll-card-content">' +
        categoryHtml +
        '<h3 class="product-scroll-card-title">' +
          '<a href="' + detailUrl + '">' + escapeHtml(product.name || '') + '</a>' +
        '</h3>' +
        '<p class="product-scroll-card-benefit">' + escapeHtml(product.short_description || '') + '</p>' +
        '<div class="product-scroll-card-actions">' +
          '<a class="btn btn-primary" href="' + detailUrl + '">View Details</a>' +
          '<a class="btn btn-whatsapp" href="' + whatsappUrl + '" target="_blank" rel="noopener noreferrer">WhatsApp</a>' +
        '</div>' +
      '</div>';

    return article;
  }

  // ─── PRODUCT DETAIL (product.html) ──────────────────────────────────────

  function initProductDetail() {
    var container = document.getElementById('productDetailContainer');
    if (!container) return;

    var params = new URLSearchParams(window.location.search);
    var id = params.get('id');
    var slug = params.get('slug');
    if (!id && !slug) {
      container.innerHTML = '<p class="no-results">Product not found.</p>';
      return;
    }

    var identifier = slug || id;

    RSM_API.getProduct(identifier).then(function (res) {
      if (!res.success || !res.data || !res.data.product) {
        container.innerHTML = '<p class="no-results">Product not found.</p>';
        return;
      }
      var product = res.data.product;
      renderProductDetail(product);
    });
  }

  function renderProductDetail(product) {
    var container = document.getElementById('productDetailContainer');
    var gallery = product.gallery_images;
    if (typeof gallery === 'string') {
      try { gallery = JSON.parse(gallery); } catch(e) { gallery = gallery ? [gallery] : []; }
    }
    if (!Array.isArray(gallery)) gallery = [];

    var mainImage = getProductImageUrl(product.image);
    if (mainImage === 'assets/placeholder.svg' && gallery.length > 0) {
      mainImage = getProductImageUrl(gallery[0]);
    }

    var specs = product.specifications;
    if (typeof specs === 'string') {
      try { specs = JSON.parse(specs); } catch(e) { specs = []; }
    }
    if (!Array.isArray(specs)) specs = [];

    var variations = product.variations;
    if (typeof variations === 'string') {
      try { variations = JSON.parse(variations); } catch(e) { variations = []; }
    }
    if (!Array.isArray(variations)) variations = [];

    var productName = product.name || '';
    var productDesc = (product.short_description || product.description || '').replace(/<[^>]*>/g, '').substring(0, 200);
    var canonicalSlug = product.slug || product.id || '';

    var whatsappUrl = 'https://wa.me/918708795253?text=' + encodeURIComponent('Hi, I am interested in ' + productName + '. Please share price and details.');

    var html = '';

    // Breadcrumb
    html += '<nav class="breadcrumb"><a href="index.html">Home</a> &rsaquo; <a href="products.html">Products</a> &rsaquo; <span>' + escapeHtml(product.name || '') + '</span></nav>';

    // Main grid: image + info
    html += '<div class="product-detail-grid">';

    // Image
    html += '<div class="product-detail-image-wrapper">';
    if (mainImage) {
      html += '<img class="product-detail-image" src="' + mainImage + '" alt="' + escapeHtml(product.name || '') + '" loading="lazy">';
    }

    // Gallery thumbnails
    if (gallery.length > 1) {
      html += '<div class="product-detail-gallery">';
      gallery.forEach(function (filename) {
        html += '<img class="gallery-thumb" src="' + getProductImageUrl(filename) + '" alt="" loading="lazy" onclick="document.querySelector(\'.product-detail-image\').src=this.src">';
      });
      html += '</div>';
    }
    html += '</div>';

    // Info
    html += '<div class="product-detail-info">';
    html += '<h1 class="product-detail-title">' + escapeHtml(product.name || '') + '</h1>';

    if (product.category_id) {
      html += '<p class="product-detail-category">Category: <span id="detailCategory"></span></p>';
    }

    if (product.short_description) {
      html += '<p class="product-detail-short-desc">' + escapeHtml(product.short_description) + '</p>';
    }

    if (product.description) {
      html += '<div class="product-detail-description">' + product.description + '</div>';
    }

    // Specifications
    if (specs.length > 0) {
      html += '<h3>Specifications</h3>';
      html += '<table class="specs-table">';
      specs.forEach(function (spec) {
        html += '<tr><td>' + escapeHtml(spec.label || '') + '</td><td>' + escapeHtml(spec.value || '') + '</td></tr>';
      });
      html += '</table>';
    }

    // Variations
    if (variations.length > 0) {
      html += '<h3>Available Variants</h3>';
      html += '<table class="variations-table">';
      html += '<tr><th>Variant</th><th>Price</th><th>SKU</th><th>Stock</th></tr>';
      variations.forEach(function (v) {
        html += '<tr>' +
          '<td>' + escapeHtml(v.name || '') + '</td>' +
          '<td>' + escapeHtml(v.price || '') + '</td>' +
          '<td>' + escapeHtml(v.sku || '') + '</td>' +
          '<td>' + (v.in_stock ? 'In Stock' : 'Out of Stock') + '</td>' +
        '</tr>';
      });
      html += '</table>';
    }

    // FAQ section for SEO
    var faqs = [
      { q: 'What is the price of ' + productName + ' in Sirsa?', a: 'Contact RS Machinery at +91-8708795253 for the latest pricing of ' + productName + '. Price depends on specifications, capacity, and quantity ordered.' },
      { q: 'Is ' + productName + ' available in Hisar, Fatehabad or Bathinda?', a: 'Yes, RS Machinery delivers ' + productName + ' across Sirsa, Hisar, Fatehabad, Bathinda, Hanumangarh and all nearby cities in Haryana, Punjab and Rajasthan. Call for delivery details.' },
      { q: 'What is the warranty on ' + productName + ' from RS Machinery?', a: productName + ' from RS Machinery in Sirsa comes with manufacturer warranty. Contact us at +91-8708795253 for specific warranty terms and conditions.' },
      { q: 'How to order ' + productName + ' from RS Machinery Sirsa?', a: 'Call +91-8708795253 or WhatsApp to order ' + productName + '. We offer direct supplier pricing and pan-India delivery from Sirsa, Haryana.' }
    ];
    html += '<div class="product-detail-faq"><h3>Frequently Asked Questions - ' + escapeHtml(productName) + '</h3><div class="faq-list">';
    faqs.forEach(function (faq, i) {
      html += '<div class="faq-item"><button class="faq-question" aria-expanded="false" data-faq="' + i + '">' + escapeHtml(faq.q) + '</button><div class="faq-answer" hidden>' + escapeHtml(faq.a) + '</div></div>';
    });
    html += '</div></div>';

    // WhatsApp button
    html += '<div class="product-detail-actions">';
    html += '<a class="button button-solid" href="' + whatsappUrl + '" target="_blank" rel="noopener noreferrer">Enquire on WhatsApp</a>';
    html += '<a class="button button-outline" href="tel:+918708795253">Call Now</a>';
    html += '</div>';

    html += '</div>'; // info
    html += '</div>'; // grid

    container.innerHTML = html;

    // ─── Dynamic SEO updates ──────────────────────────────────────────────
    // Title
    document.title = escapeHtml(productName) + ' - RS Machinery Sirsa | Lifting Equipment Supplier Haryana';

    // Meta description
    var metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      var cleanDesc = escapeHtml(productName) + ' - ' + productDesc.substring(0, 120);
      if (cleanDesc.length < 50) cleanDesc += ' Available from RS Machinery in Sirsa, Haryana. Call +91-8708795253.';
      metaDesc.setAttribute('content', cleanDesc);
    }

    // Canonical URL with slug
    var canonical = document.querySelector('link[rel="canonical"]');
    if (canonical && canonicalSlug) {
      canonical.href = 'https://rsmachinary.in/product.html?slug=' + encodeURIComponent(canonicalSlug);
    }

    // Product schema
    var schemaScript = document.getElementById('productSchema');
    if (schemaScript) {
      var schema = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        'name': productName,
        'description': productDesc.substring(0, 500),
        'image': mainImage || '',
        'brand': { '@type': 'Brand', 'name': 'RS Machinery' },
        'offers': {
          '@type': 'AggregateOffer',
          'priceCurrency': 'INR',
          'availability': 'https://schema.org/InStock',
          'seller': { '@type': 'Organization', 'name': 'RS Machinery', 'url': 'https://rsmachinary.in/' }
        }
      };
      schemaScript.textContent = JSON.stringify(schema);
    }

    // Load category name
    if (product.category_id) {
      RSM_API.getCategories().then(function (res) {
        if (!res.success || !res.data) return;
        var cats = res.data.categories || [];
        var cat = cats.find(function (c) { return String(c.id) === String(product.category_id); });
        var el = document.getElementById('detailCategory');
        if (el && cat) el.textContent = cat.name;
      });
    }
  }

  // ─── PRODUCTS LISTING (products.html) ───────────────────────────────────

  function initProductsListing() {
    var container = document.getElementById('productsListingContainer');
    var filtersContainer = document.getElementById('listingCategoryFilters');
    var searchInput = document.getElementById('listingSearchInput');
    var loadMoreBtn = document.getElementById('loadMoreBtn');
    var resultsInfo = document.getElementById('resultsInfo');
    if (!container) return;

    var currentCategory = '';
    var currentSearch = '';
    var currentPage = 1;
    var totalProducts = 0;
    var hasMore = false;
    var isLoading = false;
    var categoryMap = {};

    // Load categories for filter and build lookup map
    RSM_API.getCategories().then(function (res) {
      if (!res.success || !res.data || !filtersContainer) return;
      var categories = res.data.categories || [];

      categories.forEach(function (cat) {
        categoryMap[cat.id] = cat.name;
      });

      var allBtn = document.createElement('button');
      allBtn.className = 'category-filter is-active';
      allBtn.textContent = 'All Products';
      allBtn.addEventListener('click', function () {
        filtersContainer.querySelectorAll('.category-filter').forEach(function (b) { b.classList.remove('is-active'); });
        allBtn.classList.add('is-active');
        currentCategory = '';
        currentPage = 1;
        loadProducts(true);
      });
      filtersContainer.appendChild(allBtn);

      categories.forEach(function (cat) {
        var btn = document.createElement('button');
        btn.className = 'category-filter';
        btn.textContent = cat.name;
        btn.setAttribute('data-category-id', cat.id);
        btn.addEventListener('click', function () {
          filtersContainer.querySelectorAll('.category-filter').forEach(function (b) { b.classList.remove('is-active'); });
          btn.classList.add('is-active');
          currentCategory = cat.id;
          currentPage = 1;
          loadProducts(true);
        });
        filtersContainer.appendChild(btn);
      });
    });

    // Search
    if (searchInput) {
      searchInput.addEventListener('input', debounce(function () {
        currentSearch = searchInput.value.trim();
        currentPage = 1;
        loadProducts(true);
      }, 400));
    }

    // Load More
    if (loadMoreBtn) {
      loadMoreBtn.addEventListener('click', function () {
        if (isLoading || !hasMore) return;
        currentPage++;
        loadProducts(false);
      });
    }

    function loadProducts(reset) {
      if (isLoading) return;
      isLoading = true;
      if (reset) container.innerHTML = '';
      if (loadMoreBtn) loadMoreBtn.style.display = 'none';

      RSM_API.getProducts({
        category_id: currentCategory,
        search: currentSearch,
        page: currentPage,
        limit: 20
      }).then(function (res) {
        isLoading = false;
        if (!res.success || !res.data) {
          if (reset) container.innerHTML = '<p class="no-results">Failed to load products.</p>';
          return;
        }

        totalProducts = res.data.total || 0;
        hasMore = res.data.hasMore || false;

        if (reset && totalProducts === 0) {
          container.innerHTML = '<p class="no-results">No products found. Try a different search or category.</p>';
          if (resultsInfo) resultsInfo.textContent = '0 products found';
          return;
        }

        var products = res.data.products || [];
        products.forEach(function (product) {
          var catName = categoryMap[product.category_id] || '';
          container.appendChild(createProductCard(product, catName));
        });

        if (resultsInfo) {
          var showing = container.querySelectorAll('.product-scroll-card').length;
          resultsInfo.textContent = 'Showing ' + showing + ' of ' + totalProducts + ' products';
        }

        if (loadMoreBtn) {
          loadMoreBtn.style.display = hasMore ? 'inline-flex' : 'none';
        }
      });
    }

    loadProducts(true);
  }

  // ─── INQUIRY FORM ───────────────────────────────────────────────────────

  function initInquiryForm() {
    var form = document.getElementById('inquiryForm');
    if (!form) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var submitBtn = form.querySelector('button[type="submit"], input[type="submit"]');
      if (submitBtn) submitBtn.disabled = true;

      var data = {
        name: form.querySelector('[name="name"]') ? form.querySelector('[name="name"]').value : '',
        phone: form.querySelector('[name="phone"]') ? form.querySelector('[name="phone"]').value : '',
        product: form.querySelector('[name="product"]') ? form.querySelector('[name="product"]').value : ''
      };

      RSM_API.addInquiry(data).then(function (res) {
        if (submitBtn) submitBtn.disabled = false;
        if (res.success) {
          form.innerHTML = '<div class="form-success">Thank you! We will contact you shortly.</div>';
        } else {
          alert('Failed to send inquiry. Please try again or call us directly.');
        }
      }).catch(function () {
        if (submitBtn) submitBtn.disabled = false;
        alert('Network error. Please try again or call us directly.');
      });
    });
  }

  // ─── UTILITY FUNCTIONS ──────────────────────────────────────────────────

  function escapeHtml(str) {
    if (!str) return '';
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  function debounce(fn, delay) {
    var timer;
    return function () {
      var context = this;
      var args = arguments;
      clearTimeout(timer);
      timer = setTimeout(function () { fn.apply(context, args); }, delay);
    };
  }

  // ─── FAQ TOGGLE ──────────────────────────────────────────────────────────

  function initFaqToggles() {
    document.addEventListener('click', function (e) {
      var btn = e.target.closest('.faq-question');
      if (!btn) return;
      var expanded = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', !expanded);
      var answer = btn.nextElementSibling;
      if (answer) answer.hidden = expanded;
    });
  }

  // ─── DICTIONARY ─────────────────────────────────────────────────────────

  function getDictionary() {
    return {
      en: {
        title: "RS Machinery Sirsa | Heavy Machinery & Lifting Equipment Supplier Haryana",
        description: "RS Machinery in Sirsa, Haryana - trusted supplier of monkey cranes, electric hoists, chain pulley blocks & steel wire ropes. Call +91-8708795253.",
        navAria: "Primary navigation",
        footerNavAria: "Footer navigation",
        brandName: "RS Machinery",
        navProducts: "Products",
        navServices: "Services",
        navAbout: "About",
        navProfiles: "Profile",
        navContact: "Contact",
        headerCall: "Call Now",
        langButton: "\u0939\u093F\u0928\u094D\u0926\u0940",
        productsTag: "Our Products",
        productsTitle: "Explore Our Machinery",
        productsSubtitle: "Heavy Machines Ready in Sirsa",
        sliderProduct1Title: "Mini Electric Wire Rope Hoist Winch",
        sliderProduct1Benefit: "Powerful lifting with smooth operation",
        sliderProduct2Title: "Construction Monkey Lift",
        sliderProduct2Benefit: "Vertical lifting for construction sites",
        sliderProduct4Title: "Stainless Steel Wire Rope",
        sliderProduct4Benefit: "Corrosion-resistant premium quality",
        getQuote: "Ask Price",
        whatsappNow: "WhatsApp Now",
        googleProfileTitle: "Google Business Profile",
        googleRating: "4.2 (83+ Reviews)",
        googleBadge: "Verified on Google with customer reviews and location details",
        googleCta: "See Reviews & Location",
        indiaMartTitle: "IndiaMART",
        indiaMartBadge: "India's Largest B2B Marketplace",
        indiaMartDesc: "Browse our complete product catalog and connect with suppliers",
        indiaMartCta: "Browse Products",
        justdialTitle: "Justdial",
        justdialBadge: "Find Business Info, Rating & Reviews",
        justdialDesc: "Discover our business profile, ratings, and customer feedback",
        justdialCta: "View Profile",
        trust1Title: "Trusted Across India",
        trust1Desc: "100+ verified buyers",
        trust2Title: "Active & Responsive",
        trust2Desc: "Quick replies on all platforms",
        trust3Title: "Verified & Authentic",
        trust3Desc: "Legitimate business profiles",
        trust4Title: "Always Here to Help",
        trust4Desc: "Dedicated customer support",
        profilesCtaMessage: "Trusted by hundreds of buyers across India. Connect with us where you prefer.",
        profilesTag: "OUR PROFILES",
        profilesTitle: "Find RS Machinery Online",
        profilesSubtitle: "Explore our verified business profiles, product listings, reviews, and updates across leading platforms.",
        profilesViewAll: "View All Profiles",
        profilesContact: "Contact RS Machinery",
        contactTag: "Contact Us",
        contactTitle: "Talk to our team and Ask Price today - All Heavy Machinery Available Now",
        contactAddress: "Begu Road, wali gali, Near Parshuram Chowk, Opposite Sarsainath Mandir, Sirsa, Haryana 125055",
        contactCall: "Call Now",
        contactWhatsapp: "WhatsApp",
        inquiryFormTitle: "Send us an Inquiry",
        floatingWhatsapp: "WhatsApp",
        aboutTag: "ABOUT US",
        aboutHeading: "Professional Lifting Equipment Solutions",
        aboutDescription: "At RS Machinery in Sirsa, Haryana, we specialize in supplying heavy-duty lifting and material handling equipment across North India. Our product range includes monkey cranes for construction sites, electric hoists for industrial facilities, chain pulley blocks for warehouses, and steel wire ropes for rigging applications. With years of experience serving customers in Sirsa, Hisar, Fatehabad, Bathinda, and Hanumangarh, we have become a trusted name in the heavy machinery sector, offering reliable lifting solutions that enhance productivity, safety, and operational efficiency.",
        aboutFeature1: "Quality-Assured Equipment",
        aboutFeature2: "Reliable After-Sales Support",
        aboutFeature3: "Experienced Technical Team",
        aboutFeature4: "Customized Lifting Solutions",
        aboutMore: "MORE ABOUT",
        aboutCallLabel: "Call Us",
        wcuTag: "WHY CHOOSE US",
        wcuHeading: "Why Industries Trust<br>RS Machinery",
        wcuDescription: "RS Machinery provides reliable lifting and material handling equipment for construction, industrial, warehouse, and manufacturing applications.",
        wcuStat1Label: "Happy buyers",
        wcuStat2Label: "Industrial Products",
        wcuStat3Label: "Years Experience",
        wcuStat4Label: "Delivery Support",
        wcuCta: "Ask Price",
        psCat1: "Monkey Crane",
        psHeading1: "Heavy Duty Monkey Crane<br>For Construction Sites",
        psDesc1: "Up to 500 KG lifting capacity for construction sites.",
        psPoint1_1: "Capacity up to 500 KG",
        psPoint1_2: "Rugged Steel Construction",
        psPoint1_3: "Easy Installation",
        psPoint1_4: "Low Maintenance",
        psCat2: "Electric Hoist",
        psHeading2: "Powerful Electric Hoists<br>For Industrial Lifting",
        psDesc2: "Industrial-grade motorized lifting for factories.",
        psPoint2_1: "Smooth Motor Operation",
        psPoint2_2: "Heavy Load Handling",
        psPoint2_3: "Industrial Grade Components",
        psPoint2_4: "Long Service Life",
        psCat3: "Chain Pulley Block",
        psHeading3: "Reliable Chain Pulley Blocks<br>For Safe Material Handling",
        psDesc3: "Durable manual lifting for warehouses & workshops.",
        psPoint3_1: "Strong Alloy Components",
        psPoint3_2: "Corrosion Resistant Finish",
        psPoint3_3: "Safe Lifting Mechanism",
        psPoint3_4: "Industrial Duty Performance",
        psCat4: "Steel Wire Rope",
        psHeading4: "Industrial Steel Wire Ropes<br>For Heavy Lifting & Rigging",
        psDesc4: "High-tensile steel ropes for cranes & rigging.",
        psPoint4_1: "High Tensile Strength",
        psPoint4_2: "Flexible & Fatigue Resistant",
        psPoint4_3: "Galvanized & Durable",
        psPoint4_4: "Wide Size Range Available",
        psBtn: "Ask Price",
        footerBrandText: "Trusted lifting equipment supplier in Sirsa, Haryana. Authorized dealer of monkey cranes, electric hoists, chain pulley blocks, and steel wire ropes for construction and industry. Call +91-8708795253 for pricing.",
        footerLinksTitle: "Quick Links",
        footerContactTitle: "Call for Price",
        footerWhatsapp: "WhatsApp Quote",
        footerBottom: "\u00A9 2026 RS Machinery - Heavy Machinery & Lifting Equipment Dealer in Sirsa, Haryana. All rights reserved."
      },
      hi: {
        title: "RS Machinery \u0938\u093F\u0930\u0938\u093E | \u0939\u0947\u0935\u0940 \u092E\u0936\u0940\u0928\u0930\u0940 \u0914\u0930 \u0932\u093F\u092B\u094D\u091F\u093F\u0902\u0917 \u0909\u092A\u0915\u0930\u0923 \u0906\u092A\u0942\u0930\u094D\u0924\u093F\u0915\u0930\u094D\u0924\u093E \u0939\u0930\u093F\u092F\u093E\u0923\u093E",
        description: "RS Machinery \u0938\u093F\u0930\u0938\u093E, \u0939\u0930\u093F\u092F\u093E\u0923\u093E \u092E\u0947\u0902 \u092E\u0902\u0915\u0940 \u0915\u094D\u0930\u0947\u0928, \u0907\u0932\u0947\u0915\u094D\u091F\u094D\u0930\u093F\u0915 \u0939\u094B\u0907\u0938\u094D\u091F, \u091A\u0947\u0928 \u092A\u0932\u0940 \u092C\u094D\u0932\u0949\u0915 \u0914\u0930 \u0938\u094D\u091F\u0940\u0932 \u0935\u093E\u092F\u0930 \u0930\u094B\u092A \u0915\u093E \u0935\u093F\u0936\u094D\u0935\u0938\u0928\u0940\u092F \u0906\u092A\u0942\u0930\u094D\u0924\u093F\u0915\u0930\u094D\u0924\u093E\u0964 \u0915\u0949\u0932 \u0915\u0930\u0947\u0902 +91-8708795253\u0964",
        navProducts: "\u092A\u094D\u0930\u094B\u0921\u0915\u094D\u091F\u094D\u0938",
        navServices: "\u0915\u093F\u0930\u093E\u092F\u093E \u0909\u092A\u0932\u092C\u094D\u0927",
        navAbout: "\u0939\u092E\u093E\u0930\u0947 \u092C\u093E\u0930\u0947 \u092E\u0947\u0902",
        navProfiles: "\u092A\u094D\u0930\u094B\u092B\u093E\u0907\u0932",
        navContact: "\u0938\u0902\u092A\u0930\u094D\u0915",
        headerCall: "\u0905\u092D\u0940 \u0915\u0949\u0932 \u0915\u0930\u0947\u0902",
        langButton: "English",
        productsTag: "\u0939\u092E\u093E\u0930\u0947 \u092A\u094D\u0930\u094B\u0921\u0915\u094D\u091F\u094D\u0938",
        productsTitle: "\u092E\u0936\u0940\u0928\u0930\u0940 \u0926\u0947\u0916\u0947\u0902",
        productsSubtitle: "\u0938\u093F\u0930\u0938\u093E \u092E\u0947\u0902 \u092D\u093E\u0930\u0940 \u092E\u0936\u0940\u0928\u0947\u0902 \u0924\u0948\u092F\u093E\u0930",
        getQuote: "\u0915\u094B\u091F \u092A\u094D\u0930\u093E\u092A\u094D\u0924 \u0915\u0930\u0947\u0902",
        contactTag: "\u0938\u0902\u092A\u0930\u094D\u0915 \u0915\u0930\u0947\u0902",
        contactTitle: "\u0906\u091C \u0939\u0940 \u091F\u0940\u092E \u0938\u0947 \u092C\u093E\u0924 \u0915\u0930\u0947\u0902 \u0914\u0930 \u0915\u094B\u091F \u0932\u0947\u0902",
        contactAddress: "\u092C\u0947\u0917\u0942 \u0930\u094B\u0921, \u0935\u093E\u0932\u0940 \u0917\u0932\u0940, \u092A\u0930\u0936\u0941\u0930\u093E\u092E \u091A\u094C\u0915 \u0915\u0947 \u092A\u093E\u0938, \u0938\u093F\u0930\u0938\u093E, \u0939\u0930\u093F\u092F\u093E\u0923\u093E 125055",
        contactCall: "\u0905\u092D\u0940 \u0915\u0949\u0932 \u0915\u0930\u0947\u0902",
        contactWhatsapp: "\u0935\u094D\u0939\u093E\u091F\u094D\u0938\u090F\u092A",
        inquiryFormTitle: "\u0939\u092E\u0947\u0902 \u092A\u0942\u091B\u0924\u093E\u091B \u092D\u0947\u091C\u0947\u0902",
        floatingWhatsapp: "\u0935\u094D\u0939\u093E\u091F\u094D\u0938\u090F\u092A",
        aboutTag: "\u0939\u092E\u093E\u0930\u0947 \u092C\u093E\u0930\u0947 \u092E\u0947\u0902",
        aboutHeading: "\u092A\u094D\u0930\u094B\u092B\u0947\u0936\u0928\u0932 \u0932\u093F\u092B\u094D\u091F\u093F\u0902\u0917 \u0907\u0915\u094D\u0935\u093F\u092A\u092E\u0947\u0902\u091F \u0938\u0949\u0932\u094D\u092F\u0942\u0936\u0928\u094D\u0938",
        psBtn: "\u0915\u094B\u091F \u092A\u094D\u0930\u093E\u092A\u094D\u0924 \u0915\u0930\u0947\u0902",
        footerBottom: "\u00A9 2026 RS Machinery - \u0938\u093F\u0930\u0938\u093E, \u0939\u0930\u093F\u092F\u093E\u0923\u093E \u092E\u0947\u0902 \u0939\u0947\u0935\u0940 \u092E\u0936\u0940\u0928\u0930\u0940 \u0914\u0930 \u0932\u093F\u092B\u094D\u091F\u093F\u0902\u0917 \u0909\u092A\u0915\u0930\u0923 \u0921\u0940\u0932\u0930\u0964 \u0938\u0930\u094D\u0935\u093E\u0927\u093F\u0915\u093E\u0930 \u0938\u0941\u0930\u0915\u094D\u0937\u093F\u0924\u0964"
      }
    };
  }

})();
