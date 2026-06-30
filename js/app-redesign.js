(function () {
  'use strict';

  /* ─── Shared State ─── */
  const REDESIGN_PRODUCTS_PER_PAGE = 12;
  let redesignAllProducts = [];
  let redesignFilteredProducts = [];
  let redesignCurrentPage = 1;
  let redesignCompareList = JSON.parse(localStorage.getItem('redesignCompare') || '[]');
  let redesignFavorites = JSON.parse(localStorage.getItem('redesignFavorites') || '[]');

  /* ─── Utilities ─── */
  function qs(s, ctx) { return (ctx || document).querySelector(s); }
  function qsa(s, ctx) { return (ctx || document).querySelectorAll(s); }

  function getProductImageSrc(product) {
    try {
      var url = RSM_API.getProductImageUrl(product);
      if (url) return url;
    } catch (e) {}
    try {
      var url2 = RSM_API.getDisplayImage(product);
      if (url2) return url2;
    } catch (e2) {}
    return RSM_API && RSM_API.PLACEHOLDER_IMAGE ? RSM_API.PLACEHOLDER_IMAGE : 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300" fill="%23e2e8f0"%3E%3Crect width="400" height="300"/%3E%3Ctext x="200" y="150" text-anchor="middle" fill="%2394a3b8" font-family="sans-serif" font-size="14"%3ENo Image%3C/text%3E%3C/svg%3E';
  }

  function slugify(text) {
    return text ? text.toString().toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w-]+/g, '') : '';
  }

  function getUrlParam(name) {
    var params = new URLSearchParams(window.location.search);
    return params.get(name) || '';
  }

  /* ─── Mobile Menu ─── */
  function initMobileMenu() {
    var btn = document.getElementById('mobileMenuBtn');
    var menu = document.getElementById('mobileMenu');
    var overlay = document.getElementById('mobileMenuOverlay');
    var closeBtn = menu && menu.querySelector('.mobile-menu-close');
    if (!btn || !menu) return;

    function open() {
      menu.setAttribute('aria-hidden', 'false');
      menu.classList.add('active');
      btn.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    }
    function close() {
      menu.setAttribute('aria-hidden', 'true');
      menu.classList.remove('active');
      btn.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
    btn.addEventListener('click', open);
    if (closeBtn) closeBtn.addEventListener('click', close);
    if (overlay) overlay.addEventListener('click', close);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.getAttribute('aria-hidden') === 'false') close();
    });
    menu.querySelectorAll('.mobile-nav-link').forEach(function (link) {
      link.addEventListener('click', close);
    });
  }

  /* ─── Sticky Header ─── */
  function initStickyHeader() {
    var header = document.getElementById('redesignHeader');
    if (!header) return;
    var ticking = false;
    window.addEventListener('scroll', function () {
      if (!ticking) {
        requestAnimationFrame(function () {
          header.classList.toggle('redesign-header-scrolled', window.scrollY > 60);
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  /* ─── Reusable Animation System ─── */

  function initAnimations() {
    var configs = getAnimationConfigs();
    configs.forEach(function (cfg) {
      if (cfg.pageLoad) {
        animateNow(cfg);
      } else {
        observeContainer(cfg);
      }
    });
  }

  function getAnimationConfigs() {
    return [
      /* ═══ HERO ═══ */
      {
        container: '.redesign-hero',
        pageLoad: true,
        children: [
          { selector: '.redesign-hero-badge', animation: 'redesign-fade-up' },
          { selector: 'h1', animation: 'redesign-fade-up', delay: 100 },
          { selector: '.redesign-hero-text', animation: 'redesign-fade-up', delay: 200 },
          { selector: '.redesign-hero-actions', animation: 'redesign-stagger', delay: 300 },
          { selector: '.redesign-hero-stats', animation: 'redesign-stagger', delay: 450 },
          { selector: '.redesign-hero-visual', animation: 'redesign-slide-right', delay: 150 }
        ]
      },
      /* ═══ PRODUCTS SECTION HEADER ═══ */
      {
        container: '#products .redesign-section-header',
        threshold: 0.2,
        children: [
          { selector: '.redesign-section-tag', animation: 'redesign-fade-up' },
          { selector: '.redesign-section-title', animation: 'redesign-fade-up', delay: 100 },
          { selector: '.redesign-section-subtitle', animation: 'redesign-fade-up', delay: 200 }
        ]
      },
      /* ═══ FEATURED PRODUCTS HEADER (NOT GRID — grids are dynamic) ═══ */
      /* ═══ ABOUT SECTION (owner) ═══ */
      {
        container: '#about .redesign-owner',
        threshold: 0.2,
        children: [
          { selector: '.redesign-owner-image', animation: 'redesign-slide-left' },
          { selector: '.redesign-owner-content', animation: 'redesign-slide-right', delay: 100 }
        ]
      },
      {
        container: '#about .redesign-owner-content',
        threshold: 0.2,
        children: [
          { selector: 'h3', animation: 'redesign-fade-up' },
          { selector: '.redesign-owner-role', animation: 'redesign-fade-up', delay: 80 },
          { selector: '.redesign-owner-text', animation: 'redesign-fade-up', delay: 160 }
        ]
      },
      /* ═══ ABOUT STATS ═══ */
      {
        container: '#about .redesign-stats-grid',
        threshold: 0.2,
        staggerContainer: true,
        childSelector: '.redesign-stat-card',
        animation: 'redesign-stagger'
      },
      /* ═══ GALLERY ═══ */
      {
        container: '.redesign-gallery-grid',
        threshold: 0.15,
        staggerContainer: true,
        childSelector: '.redesign-gallery-item',
        animation: 'redesign-stagger'
      },
      /* ═══ INQUIRY FORM ═══ */
      {
        container: '.redesign-form-card',
        threshold: 0.2,
        children: [
          { selector: 'h3', animation: 'redesign-fade-up' },
          { selector: '.redesign-form-group', animation: 'redesign-stagger', delay: 100 }
        ]
      }
    ];
  }

  function animateNow(cfg) {
    requestAnimationFrame(function () {
      var root = typeof cfg.container === 'string' ? document.querySelector(cfg.container) : cfg.container;
      if (!root) return;
      if (cfg.staggerContainer && cfg.childSelector) {
        var children = root.querySelectorAll(cfg.childSelector);
        children.forEach(function (el, i) {
          el.style.animationDelay = (i * (cfg.staggerDelay || 80)) + 'ms';
          el.classList.add(cfg.animation || 'redesign-fade-up');
        });
      } else if (cfg.children) {
        cfg.children.forEach(function (child) {
          var els = root.querySelectorAll(child.selector);
          els.forEach(function (el) {
            if (child.delay) el.style.animationDelay = child.delay + 'ms';
            el.classList.add(child.animation || 'redesign-fade-up');
          });
        });
      }
    });
  }

  function observeContainer(cfg) {
    var root = typeof cfg.container === 'string' ? document.querySelector(cfg.container) : cfg.container;
    if (!root) return;
    if (!('IntersectionObserver' in window)) {
      animateNow(cfg);
      return;
    }
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateNow(cfg);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: cfg.threshold || 0.15 });
    observer.observe(root);
  }

  /* ─── Animate grid children with stagger after dynamic load ─── */
  function animateGridStagger(gridSelector) {
    var grid = document.querySelector(gridSelector);
    if (!grid) return;
    var cards = grid.querySelectorAll('.redesign-product-card');
    cards.forEach(function (card, i) {
      card.style.animationDelay = (i * 80) + 'ms';
      card.classList.add('redesign-fade-up');
    });
  }

  /* ─── Legacy Scroll Reveal (for backwards compat) ─── */
  function initScrollReveal() {
    var els = qsa('.redesign-reveal');
    if (!els.length) return;
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('redesign-reveal-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    els.forEach(function (el) { observer.observe(el); });
  }

  /* ─── Counter Animation ─── */
  function initCounters() {
    var counters = qsa('.redesign-counter');
    if (!counters.length) return;
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var el = entry.target;
          var target = parseInt(el.getAttribute('data-target'), 10) || 0;
          if (target === 0) { el.textContent = '0+'; observer.unobserve(el); return; }
          var suffix = el.getAttribute('data-suffix') || '+';
          var duration = Math.min(2000, Math.max(500, target * 8));
          var startTime = performance.now();
          function update(currentTime) {
            var progress = Math.min(1, (currentTime - startTime) / duration);
            var eased = 1 - Math.pow(1 - progress, 3);
            var current = Math.floor(eased * target);
            el.textContent = current.toLocaleString('en-IN') + suffix;
            if (progress < 1) requestAnimationFrame(update);
            else el.textContent = target.toLocaleString('en-IN') + suffix;
          }
          requestAnimationFrame(update);
          observer.unobserve(el);
        }
      });
    }, { threshold: 0.5 });
    counters.forEach(function (c) { observer.observe(c); });
  }

  /* ─── Lightbox ─── */
  function initLightbox() {
    var triggers = qsa('.redesign-gallery-lightbox');
    if (!triggers.length) return;
    triggers.forEach(function (img) {
      img.addEventListener('click', function () {
        var src = this.getAttribute('data-full') || this.src || this.getAttribute('data-src');
        if (!src) return;
        var overlay = document.createElement('div');
        overlay.className = 'redesign-lightbox-overlay';
        overlay.innerHTML = '<div class="redesign-lightbox-content"><img src="' + src.replace(/&/g,'&amp;').replace(/"/g,'&quot;') + '" alt="Gallery image"><button class="redesign-lightbox-close" aria-label="Close">&times;</button></div>';
        document.body.appendChild(overlay);
        requestAnimationFrame(function () { overlay.classList.add('active'); });
        overlay.addEventListener('click', function (e) {
          if (e.target === overlay || e.target.classList.contains('redesign-lightbox-close')) {
            overlay.classList.remove('active');
            setTimeout(function () { overlay.remove(); }, 300);
          }
        });
        document.addEventListener('keydown', function handler(ke) {
          if (ke.key === 'Escape') {
            overlay.classList.remove('active');
            setTimeout(function () { overlay.remove(); }, 300);
            document.removeEventListener('keydown', handler);
          }
        });
      });
    });
  }

  /* ─── FAQ Accordion ─── */
  function initFAQ() {
    var questions = qsa('.redesign-faq-question');
    questions.forEach(function (q) {
      q.addEventListener('click', function () {
        var item = this.parentElement;
        var isOpen = item.classList.contains('active');
        qsa('.redesign-faq-item.active').forEach(function (i) { i.classList.remove('active'); });
        if (!isOpen) item.classList.add('active');
      });
    });
  }

  /* ─── Compare Bar ─── */
  function saveCompare() {
    localStorage.setItem('redesignCompare', JSON.stringify(redesignCompareList));
    renderCompareBar();
  }

  function toggleCompare(slug, name) {
    var idx = redesignCompareList.indexOf(slug);
    if (idx > -1) redesignCompareList.splice(idx, 1);
    else if (redesignCompareList.length < 4) redesignCompareList.push(slug);
    else { alert('You can compare up to 4 products at a time.'); return; }
    saveCompare();
    updateCompareButtons();
  }

  function renderCompareBar() {
    var bar = document.getElementById('redesignCompareBar');
    var list = document.getElementById('redesignCompareList');
    var count = document.getElementById('redesignCompareCount');
    var btn = document.getElementById('redesignCompareBtn');
    if (!bar) return;
    if (redesignCompareList.length === 0) {
      bar.classList.remove('active');
      if (btn) btn.style.display = 'none';
      return;
    }
    bar.classList.add('active');
    if (btn) btn.style.display = 'inline-flex';
    if (count) count.textContent = redesignCompareList.length + ' product' + (redesignCompareList.length > 1 ? 's' : '') + ' selected';
    if (!list) return;
    list.innerHTML = redesignCompareList.map(function (slug) {
      return '<span class="redesign-compare-item">' + escapeHtml(slug) + '<button class="redesign-compare-remove" data-slug="' + escapeHtml(slug) + '" aria-label="Remove">&times;</button></span>';
    }).join('');
    list.querySelectorAll('.redesign-compare-remove').forEach(function (b) {
      b.addEventListener('click', function () {
        var s = this.getAttribute('data-slug');
        var idx = redesignCompareList.indexOf(s);
        if (idx > -1) redesignCompareList.splice(idx, 1);
        saveCompare();
        updateCompareButtons();
      });
    });
  }

  function updateCompareButtons() {
    qsa('.redesign-compare-btn').forEach(function (btn) {
      var slug = btn.getAttribute('data-slug');
      if (redesignCompareList.indexOf(slug) > -1) btn.classList.add('active');
      else btn.classList.remove('active');
    });
  }

  /* ─── Favorites ─── */
  function saveFavorites() {
    localStorage.setItem('redesignFavorites', JSON.stringify(redesignFavorites));
    updateFavoriteButtons();
  }

  function toggleFavorite(slug) {
    var idx = redesignFavorites.indexOf(slug);
    if (idx > -1) redesignFavorites.splice(idx, 1);
    else redesignFavorites.push(slug);
    saveFavorites();
  }

  function updateFavoriteButtons() {
    qsa('.redesign-fav-btn').forEach(function (btn) {
      var slug = btn.getAttribute('data-slug');
      if (redesignFavorites.indexOf(slug) > -1) btn.classList.add('active');
      else btn.classList.remove('active');
    });
  }

  /* ─── Escape HTML ─── */
  function escapeHtml(text) {
    if (!text) return '';
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(text));
    return div.innerHTML;
  }

  /* ─── Product Card ─── */
  function createRedesignProductCard(product) {
    var slug = product.slug || slugify(product.name || product.title) || 'product-' + Math.random().toString(36).slice(2, 8);
    var name = product.name || product.title || 'Product';
    var image = getProductImageSrc(product);
    var category = product.category || product.product_type || '';
    var capacity = product.capacity || '';
    var price = product.price || '';
    var description = product.short_description || product.description || '';
    var isVerified = true;
    var hasGST = true;
    var deliveryInfo = 'Pan-India Delivery';
    var isCompareActive = redesignCompareList.indexOf(slug) > -1;
    var isFavActive = redesignFavorites.indexOf(slug) > -1;

    var item = document.createElement('div');
    item.className = 'redesign-product-card redesign-reveal';

    var favHtml = '<button class="redesign-fav-btn' + (isFavActive ? ' active' : '') + '" data-slug="' + escapeHtml(slug) + '" aria-label="Add to favorites"><svg viewBox="0 0 24 24" width="16" height="16" fill="' + (isFavActive ? 'currentColor' : 'none') + '" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg></button>';

    var compareHtml = '<button class="redesign-compare-btn' + (isCompareActive ? ' active' : '') + '" data-slug="' + escapeHtml(slug) + '" aria-label="Compare"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg></button>';

    var trustHtml = '<div class="redesign-product-card-trust">' +
      (isVerified ? '<span class="redesign-trust-badge" title="Verified Seller"><svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg> Verified</span>' : '') +
      (hasGST ? '<span class="redesign-trust-badge" title="GST Registered">GST</span>' : '') +
      (deliveryInfo ? '<span class="redesign-trust-badge redesign-trust-badge-delivery" title="' + escapeHtml(deliveryInfo) + '"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg> ' + escapeHtml(deliveryInfo) + '</span>' : '') +
      '</div>';

    item.innerHTML =
      '<div class="redesign-product-card-image">' +
        '<a href="product.html?slug=' + encodeURIComponent(slug) + '" tabindex="-1">' +
          '<img src="' + image + '" alt="' + escapeHtml(name) + '" loading="lazy">' +
        '</a>' +
        '<div class="redesign-product-card-actions">' +
          favHtml +
          compareHtml +
        '</div>' +
        '<div class="redesign-product-card-category">' + escapeHtml(category) + '</div>' +
      '</div>' +
      '<div class="redesign-product-card-body">' +
        trustHtml +
        '<h3 class="redesign-product-card-title"><a href="product.html?slug=' + encodeURIComponent(slug) + '">' + escapeHtml(name) + '</a></h3>' +
        (capacity ? '<div class="redesign-product-card-spec">Capacity: <strong>' + escapeHtml(capacity) + '</strong></div>' : '') +
        (price ? '<div class="redesign-product-card-price">' + escapeHtml(price) + '</div>' : '') +
        (description ? '<p class="redesign-product-card-desc">' + escapeHtml(description) + '</p>' : '') +
        '<div class="redesign-product-card-footer">' +
          '<a href="product.html?slug=' + encodeURIComponent(slug) + '" class="redesign-product-card-link">View Details →</a>' +
          '<a href="https://wa.me/918708795253?text=' + encodeURIComponent('Hi, I am interested in ' + name) + '" target="_blank" rel="noopener" class="redesign-product-card-wa">Enquire on WhatsApp</a>' +
        '</div>' +
      '</div>';

    item.querySelector('.redesign-fav-btn').addEventListener('click', function (e) {
      e.preventDefault();
      toggleFavorite(this.getAttribute('data-slug'));
    });
    item.querySelector('.redesign-compare-btn').addEventListener('click', function (e) {
      e.preventDefault();
      var s = this.getAttribute('data-slug');
      var n = name;
      toggleCompare(s, n);
    });

    return item;
  }

  /* ─── Products Listing Page ─── */
  function initProductsListingPage() {
    var grid = document.getElementById('redesignProductsGrid');
    if (!grid) return;
    var loadingEl = document.getElementById('redesignListingLoading');
    var emptyEl = document.getElementById('redesignListingEmpty');
    var loadMoreBtn = document.getElementById('redesignLoadMore');
    var countEl = document.getElementById('redesignListingCount');
    var searchInput = document.getElementById('redesignListingSearch');
    var categoryFilter = document.getElementById('redesignFilterCategory');
    var sortSelect = document.getElementById('redesignSortBy');

    function applyFilters() {
      var search = (searchInput ? searchInput.value : '').toLowerCase().trim();
      var category = categoryFilter ? categoryFilter.value : '';
      redesignFilteredProducts = redesignAllProducts.filter(function (p) {
        var name = (p.name || p.title || '').toLowerCase();
        var desc = (p.description || p.short_description || '').toLowerCase();
        var cat = (p.category || p.product_type || '').toLowerCase();
        if (search && name.indexOf(search) === -1 && desc.indexOf(search) === -1) return false;
        if (category && cat !== category.toLowerCase() && cat.indexOf(category.toLowerCase()) === -1) return false;
        return true;
      });
      var sortVal = sortSelect ? sortSelect.value : '';
      if (sortVal === 'name') {
        redesignFilteredProducts.sort(function (a, b) {
          return ((a.name || a.title) || '').localeCompare((b.name || b.title) || '');
        });
      }
      if (countEl) {
        countEl.textContent = redesignFilteredProducts.length + ' product' + (redesignFilteredProducts.length !== 1 ? 's' : '') + ' found';
      }
      redesignCurrentPage = 1;
      renderProducts(true);
    }

    function renderProducts(reset) {
      var start = 0;
      var count = redesignFilteredProducts.length;
      if (!reset) start = (redesignCurrentPage - 1) * REDESIGN_PRODUCTS_PER_PAGE;
      var end = reset ? Math.min(REDESIGN_PRODUCTS_PER_PAGE, count) : Math.min(start + REDESIGN_PRODUCTS_PER_PAGE, count);
      if (reset) grid.innerHTML = '';
      for (var i = start; i < end; i++) {
        grid.appendChild(createRedesignProductCard(redesignFilteredProducts[i]));
      }
      if (end >= count) {
        if (loadMoreBtn) loadMoreBtn.style.display = 'none';
      } else {
        if (loadMoreBtn) { loadMoreBtn.style.display = 'inline-flex'; }
      }
      if (count === 0 && emptyEl) {
        grid.style.display = 'none';
        emptyEl.style.display = 'block';
        emptyEl.innerHTML = '<h3 style="margin-bottom:0.5rem;">No Products Found</h3><p style="color:#6b7d98;">Try adjusting your filters or <a href="products.html" style="color:#d97706;">view all products</a>.</p>';
      } else {
        grid.style.display = '';
        if (emptyEl) emptyEl.style.display = 'none';
      }
      animateGridStagger('#redesignProductsGrid');
      requestAnimationFrame(function () { initScrollReveal(); initLightbox(); });
      updateCompareButtons();
      updateFavoriteButtons();
    }

    if (loadingEl) loadingEl.style.display = 'block';

    RSM_API.getProducts()
      .then(function (products) {
        redesignAllProducts = Array.isArray(products) ? products : (products && products.data ? products.data : []);
        if (loadingEl) loadingEl.style.display = 'none';
        var urlCategory = getUrlParam('category');
        if (urlCategory && categoryFilter) categoryFilter.value = urlCategory;
        applyFilters();
      })
      .catch(function (err) {
        if (loadingEl) loadingEl.style.display = 'none';
        grid.innerHTML = '<div style="text-align:center;padding:3rem;color:#6b7d98;"><h3>Unable to load products</h3><p>Please check your connection or <a href="tel:+918708795253">call us</a>.</p></div>';
      });

    if (searchInput) searchInput.addEventListener('input', function () { applyFilters(); });
    if (categoryFilter) categoryFilter.addEventListener('change', function () { applyFilters(); });
    if (sortSelect) sortSelect.addEventListener('change', function () { applyFilters(); });
    if (loadMoreBtn) {
      loadMoreBtn.addEventListener('click', function () {
        redesignCurrentPage++;
        renderProducts(false);
      });
    }
  }

  /* ─── Product Detail Page ─── */
  function renderRedesignProductDetail() {
    var container = document.getElementById('redesignProductDetail');
    if (!container) return;
    var slug = getUrlParam('slug');
    var productId = getUrlParam('id');

    container.innerHTML = '<div style="text-align:center;padding:4rem 1rem;color:#6b7d98;"><div style="width:32px;height:32px;border:3px solid #e2e8f0;border-top-color:#d97706;border-radius:50%;animation:spin 0.8s linear infinite;margin:0 auto 1rem;"></div>Loading product details...</div>';

    function render(product) {
      if (!product) {
        container.innerHTML = '<div style="text-align:center;padding:4rem 1rem;"><h2>Product Not Found</h2><p>The requested product could not be loaded. <a href="products.html">Browse all products →</a></p></div>';
        return;
      }
      var name = product.name || product.title || 'Product';
      var image = getProductImageSrc(product);
      var images = product.images || (product.image ? [product.image] : [image]);
      if (images.length === 0) images = [image];

      var documentTitle = name + ' — RS Machinery';
      document.title = documentTitle;
      var titleTag = document.getElementById('redesignProductTitle');
      if (titleTag) titleTag.textContent = documentTitle;
      var metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) metaDesc.setAttribute('content', name + ' - Industrial lifting equipment from RS Machinery Sirsa, Haryana. ' + (product.capacity ? 'Capacity: ' + product.capacity + '. ' : '') + 'Call +91-8708795253 for quote.');

      var category = product.category || product.product_type || '';
      var capacity = product.capacity || '';
      var price = product.price || '';
      var brand = product.brand || 'RS Machinery';
      var condition = product.condition || 'New';
      var warranty = product.warranty || '1 Year Warranty';
      var delivery = product.delivery || 'Pan-India';
      var description = product.description || '';
      var features = product.features || (product.specifications ? Object.keys(product.specifications).map(function (k) { return k + ': ' + product.specifications[k]; }) : []);
      var applications = product.applications || ['Construction Sites', 'Industrial Warehouses', 'Manufacturing Units', 'Mines & Quarries'];
      var faq = product.faq || [
        { q: 'What is the delivery time?', a: 'Delivery typically takes 5–10 business days depending on your location. Pan-India shipping available.' },
        { q: 'Do you provide installation support?', a: 'Yes, we offer installation support and on-site training for all our lifting equipment.' },
        { q: 'What payment options are available?', a: 'We accept bank transfers, UPI, and cash payments. Bulk order discounts available.' },
        { q: 'Is GST invoice provided?', a: 'Yes, we provide GST-compliant invoices for all business orders.' }
      ];
      var slugVal = slug || product.slug || slugify(name);

      var html = '<section class="redesign-section redesign-product-detail" style="padding:0;">';

      /* ─── Gallery ─── */
      html += '<div class="redesign-product-gallery">' +
        '<div class="redesign-gallery-main">' +
          '<button class="redesign-gallery-nav redesign-gallery-nav-prev" id="redesignGalleryPrev" aria-label="Previous image">‹</button>' +
          '<img id="redesignGalleryMain" src="' + escapeHtml(images[0]) + '" alt="' + escapeHtml(name) + '">' +
          '<button class="redesign-gallery-nav redesign-gallery-nav-next" id="redesignGalleryNext" aria-label="Next image">›</button>' +
        '</div>' +
        '<div class="redesign-gallery-thumbs" id="redesignGalleryThumbs">' +
          images.map(function (img, i) {
            return '<img src="' + escapeHtml(img) + '" alt="' + escapeHtml(name) + ' view ' + (i + 1) + '" class="redesign-gallery-thumb' + (i === 0 ? ' active' : '') + '" data-index="' + i + '">';
          }).join('') +
        '</div>' +
      '</div>';

      /* ─── Product Info + Sticky Panel ─── */
      html += '<div class="redesign-product-info-shell">' +
        '<div class="redesign-product-info-main">' +
          '<div class="redesign-product-breadcrumb"><a href="/">Home</a> / <a href="products.html">Products</a> / <span>' + escapeHtml(name) + '</span></div>' +
          '<h1 class="redesign-product-name">' + escapeHtml(name) + '</h1>' +
          (category ? '<div class="redesign-product-category-tag">' + escapeHtml(category) + '</div>' : '') +
          '<div class="redesign-product-specs-grid">' +
            (capacity ? '<div class="redesign-product-spec-item"><span class="redesign-product-spec-label">Capacity</span><span class="redesign-product-spec-value">' + escapeHtml(capacity) + '</span></div>' : '') +
            '<div class="redesign-product-spec-item"><span class="redesign-product-spec-label">Brand</span><span class="redesign-product-spec-value">' + escapeHtml(brand) + '</span></div>' +
            (price ? '<div class="redesign-product-spec-item"><span class="redesign-product-spec-label">Price</span><span class="redesign-product-spec-value redesign-product-price">' + escapeHtml(price) + '</span></div>' : '') +
            '<div class="redesign-product-spec-item"><span class="redesign-product-spec-label">Condition</span><span class="redesign-product-spec-value">' + escapeHtml(condition) + '</span></div>' +
            '<div class="redesign-product-spec-item"><span class="redesign-product-spec-label">Warranty</span><span class="redesign-product-spec-value">' + escapeHtml(warranty) + '</span></div>' +
            '<div class="redesign-product-spec-item"><span class="redesign-product-spec-label">Delivery</span><span class="redesign-product-spec-value">' + escapeHtml(delivery) + '</span></div>' +
          '</div>' +
          (description ? '<div class="redesign-product-description"><h2>Description</h2><p>' + escapeHtml(description) + '</p></div>' : '') +
          (features.length > 0 ? '<div class="redesign-product-section"><h2>Key Features</h2><div class="redesign-product-features-grid">' + features.map(function (f) { return '<div class="redesign-product-feature-item"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d97706" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg><span>' + escapeHtml(f) + '</span></div>'; }).join('') + '</div></div>' : '') +
          (applications.length > 0 ? '<div class="redesign-product-section"><h2>Applications</h2><div class="redesign-product-apps-grid">' + applications.map(function (a) { return '<div class="redesign-product-app-item"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg><span>' + escapeHtml(a) + '</span></div>'; }).join('') + '</div></div>' : '') +
          '<div class="redesign-product-section"><h2>Delivery & Warranty</h2><div class="redesign-product-info-cards">' +
            '<div class="redesign-product-info-card"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#d97706" stroke-width="2"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg><h4>Pan-India Delivery</h4><p>Fast shipping to all states. Bulk orders shipped via truckload.</p></div>' +
            '<div class="redesign-product-info-card"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="2"/><line x1="12" y1="6" x2="12" y2="18"/><line x1="6" y1="12" x2="18" y2="12"/></svg><h4>1 Year Warranty</h4><p>Manufacturing defect coverage. Extended warranty available on request.</p></div>' +
            '<div class="redesign-product-info-card"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" stroke-width="2"><path d="M12 22s-8-4-8-10V5l8-3 8 3v7c0 6-8 10-8 10z"/></svg><h4>Secure Payment</h4><p>Multiple payment options. GST invoice provided for all orders.</p></div>' +
          '</div></div>' +
          '<div class="redesign-product-section"><h2>Frequently Asked Questions</h2><div class="redesign-faq">' +
            faq.map(function (item, i) {
              return '<div class="redesign-faq-item' + (i === 0 ? ' active' : '') + '"><button class="redesign-faq-question" aria-expanded="' + (i === 0 ? 'true' : 'false') + '"><span>' + escapeHtml(item.q) + '</span><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg></button><div class="redesign-faq-answer"><p>' + escapeHtml(item.a) + '</p></div></div>';
            }).join('') +
          '</div></div>' +
        '</div>' +
        /* ─── Sticky Inquiry Panel ─── */
        '<div class="redesign-product-sticky-panel" id="redesignStickyPanel">' +
          '<div class="redesign-product-sticky-inner">' +
            (price ? '<div class="redesign-product-sticky-price">' + escapeHtml(price) + '</div>' : '') +
            '<div class="redesign-product-sticky-ctas">' +
              '<a href="https://wa.me/918708795253?text=' + encodeURIComponent('Hi, I am interested in ' + name) + '" target="_blank" rel="noopener" class="redesign-btn redesign-btn-accent redesign-btn-block">' +
                '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347"/></svg>' +
                ' Enquire on WhatsApp' +
              '</a>' +
              '<a href="tel:+918708795253" class="redesign-btn redesign-btn-outline redesign-btn-block">' +
                '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>' +
                ' Call Now' +
              '</a>' +
              '<a href="#redesignInquirySection" class="redesign-btn redesign-btn-primary redesign-btn-block" onclick="document.getElementById(\'redesignInquirySection\').scrollIntoView({behavior:\'smooth\'});return false;">' +
                '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>' +
                ' Get Quote' +
              '</a>' +
            '</div>' +
            '<div class="redesign-product-sticky-trust">' +
              '<div class="redesign-product-sticky-trust-item"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2"><path d="M12 22s-8-4-8-10V5l8-3 8 3v7c0 6-8 10-8 10z"/></svg> Secure Checkout</div>' +
              '<div class="redesign-product-sticky-trust-item"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2"><path d="M9 12l2 2 4-4"/><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/></svg> GST Invoice</div>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div></section>';

      container.innerHTML = html;

      /* ─── Animate product detail ─── */
      requestAnimationFrame(function () {
        var gallery = container.querySelector('.redesign-product-gallery');
        var infoShell = container.querySelector('.redesign-product-info-shell');
        if (gallery) {
          gallery.classList.add('redesign-slide-left');
        }
        if (infoShell) {
          infoShell.classList.add('redesign-slide-right');
          var infoChildren = infoShell.querySelectorAll('.redesign-product-breadcrumb, .redesign-product-name, .redesign-product-category-tag, .redesign-product-specs-grid, .redesign-product-description, .redesign-product-section, .redesign-product-sticky-panel');
          infoChildren.forEach(function (el, i) {
            el.style.animationDelay = (i * 80) + 'ms';
            el.classList.add('redesign-fade-up');
          });
        }
      });

      /* ─── Gallery Controls ─── */
      var currentIndex = 0;
      var mainImg = document.getElementById('redesignGalleryMain');
      var thumbs = document.querySelectorAll('.redesign-gallery-thumb');
      var prevBtn = document.getElementById('redesignGalleryPrev');
      var nextBtn = document.getElementById('redesignGalleryNext');

      function setGalleryImage(index) {
        if (index < 0) index = images.length - 1;
        if (index >= images.length) index = 0;
        currentIndex = index;
        mainImg.setAttribute('src', images[currentIndex]);
        thumbs.forEach(function (t, i) {
          t.classList.toggle('active', i === currentIndex);
        });
      }

      if (prevBtn && nextBtn) {
        prevBtn.addEventListener('click', function () { setGalleryImage(currentIndex - 1); });
        nextBtn.addEventListener('click', function () { setGalleryImage(currentIndex + 1); });
        document.addEventListener('keydown', function (e) {
          if (e.key === 'ArrowLeft') setGalleryImage(currentIndex - 1);
          if (e.key === 'ArrowRight') setGalleryImage(currentIndex + 1);
        });
      }
      thumbs.forEach(function (thumb) {
        thumb.addEventListener('click', function () {
          setGalleryImage(parseInt(this.getAttribute('data-index'), 10));
        });
      });

      /* ─── Lightbox on main image ─── */
      if (mainImg) {
        mainImg.style.cursor = 'zoom-in';
        mainImg.addEventListener('click', function () {
          var src = this.getAttribute('src');
          if (!src) return;
          var overlay = document.createElement('div');
          overlay.className = 'redesign-lightbox-overlay';
          overlay.innerHTML = '<div class="redesign-lightbox-content"><img src="' + src.replace(/&/g,'&amp;').replace(/"/g,'&quot;') + '" alt="' + escapeHtml(name) + '"><button class="redesign-lightbox-close" aria-label="Close">&times;</button></div>';
          document.body.appendChild(overlay);
          requestAnimationFrame(function () { overlay.classList.add('active'); });
          overlay.addEventListener('click', function (e) {
            if (e.target === overlay || e.target.classList.contains('redesign-lightbox-close')) {
              overlay.classList.remove('active');
              setTimeout(function () { overlay.remove(); }, 300);
            }
          });
        });
      }

      /* ─── Sticky Panel Scroll ─── */
      var stickyPanel = document.getElementById('redesignStickyPanel');
      if (stickyPanel) {
        var panelTop = stickyPanel.offsetTop;
        window.addEventListener('scroll', function () {
          var scrollY = window.scrollY;
          var viewportH = window.innerHeight;
          var panelH = stickyPanel.offsetHeight;
          if (panelH > viewportH - 80) return;
          if (scrollY > panelTop - 20) stickyPanel.classList.add('stuck');
          else stickyPanel.classList.remove('stuck');
        }, { passive: true });
      }

      /* ─── FAQ ─── */
      initFAQ();

      /* ─── Set inquiry form product select ─── */
      var productSelect = document.getElementById('inqProduct');
      if (productSelect && category) {
        var matched = false;
        for (var i = 0; i < productSelect.options.length; i++) {
          if (productSelect.options[i].value.toLowerCase() === category.toLowerCase()) {
            productSelect.value = productSelect.options[i].value;
            matched = true;
            break;
          }
          if (productSelect.options[i].text.toLowerCase().indexOf(category.toLowerCase()) > -1) {
            productSelect.value = productSelect.options[i].value;
            matched = true;
            break;
          }
        }
        if (!matched) {
          productSelect.value = name;
        }
      } else if (productSelect) {
        productSelect.value = name;
      }
    }

    /* ─── Load product ─── */
    function loadProduct() {
      if (slug) {
        RSM_API.getProduct(slug)
          .then(function (product) {
            if (product) { render(product); return; }
            if (redesignAllProducts.length > 0) {
              var found = redesignAllProducts.find(function (p) {
                return (p.slug || slugify(p.name || p.title)) === slug;
              });
              if (found) { render(found); return; }
            }
            RSM_API.getProducts().then(function (products) {
              var all = Array.isArray(products) ? products : (products && products.data ? products.data : []);
              redesignAllProducts = all;
              var found = all.find(function (p) {
                var pSlug = p.slug || slugify(p.name || p.title);
                return pSlug === slug;
              });
              if (found) render(found);
              else render(null);
            }).catch(function () { render(null); });
          })
          .catch(function () {
            render(null);
          });
      } else if (productId) {
        RSM_API.getProduct(productId)
          .then(function (product) {
            if (product) render(product);
            else render(null);
          })
          .catch(function () { render(null); });
      } else {
        container.innerHTML = '<div style="text-align:center;padding:4rem 1rem;"><h2>Select a Product</h2><p>Please choose a product from <a href="products.html">our catalog</a>.</p></div>';
      }
    }

    loadProduct();
  }

  /* ─── Inquiry Form Handler ─── */
  function initInquiryForm() {
    var forms = qsa('#redesignInquiryForm');
    forms.forEach(function (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.innerHTML = 'Sending...';
        }

        var data = {
          name: (form.querySelector('[name="name"]') ? form.querySelector('[name="name"]').value : '').trim(),
          phone: (form.querySelector('[name="phone"]') ? form.querySelector('[name="phone"]').value : '').trim(),
          product: (form.querySelector('[name="product"]') ? form.querySelector('[name="product"]').value : '').trim(),
          city: (form.querySelector('[name="city"]') ? form.querySelector('[name="city"]').value : '').trim(),
          message: (form.querySelector('[name="message"]') ? form.querySelector('[name="message"]').value : '').trim()
        };

        if (!data.name || !data.phone || !data.product) {
          alert('Please fill in all required fields (Name, Phone, Product).');
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/></svg> Send Inquiry';
          }
          return;
        }

        if (!/^[6-9]\d{9}$/.test(data.phone.replace(/\s/g, ''))) {
          alert('Please enter a valid 10-digit Indian mobile number.');
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/></svg> Send Inquiry';
          }
          return;
        }

        RSM_API.addInquiry(data)
          .then(function () {
            var card = form.closest('.redesign-form-card');
            if (card) {
              card.innerHTML = '<div class="redesign-form-success"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg><h3>Inquiry Sent!</h3><p>Thank you, ' + escapeHtml(data.name) + '. We will contact you on <strong>' + escapeHtml(data.phone) + '</strong> within 2 hours.</p><p style="font-size:0.85rem;color:#6b7d98;">Or call us directly: <a href="tel:+918708795253" style="color:#d97706;font-weight:600;">+91 870 879 5253</a></p></div>';
            }
          })
          .catch(function (err) {
            if (submitBtn) {
              submitBtn.disabled = false;
              submitBtn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/></svg> Send Inquiry';
            }
            var card = form.closest('.redesign-form-card');
            if (card) {
              card.innerHTML = '<div class="redesign-form-success"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg><h3>Something went wrong</h3><p>Please try again or <a href="tel:+918708795253" style="color:#d97706;font-weight:600;">call us directly</a>.</p></div>';
            }
          });
      });
    });
  }

  /* ─── Hero Slider (Side Preview Carousel) ─── */
  function initHeroSlider() {
    var viewport = document.getElementById('heroSliderViewport');
    var track = document.getElementById('heroSliderTrack');
    if (!viewport || !track) return;

    var originalSlides = Array.from(track.querySelectorAll('.redesign-hero-slide'));
    if (originalSlides.length < 2) return;

    var total = originalSlides.length;
    var prevBtn = document.getElementById('heroSliderPrev');
    var nextBtn = document.getElementById('heroSliderNext');
    var counter = document.getElementById('heroSliderCurrent');
    

    var firstClone = originalSlides[0].cloneNode(true);
    var lastClone = originalSlides[total - 1].cloneNode(true);
    var slides = [lastClone].concat(Array.from(originalSlides)).concat([firstClone]);

    track.innerHTML = '';
    slides.forEach(function (s) { track.appendChild(s); });

    var displayIndex = 1;
    var realIndex = 0;
    var isAnimating = false;

    function getSlideUnit() {
      var pct = 86;
      if (viewport) {
        var val = getComputedStyle(viewport).getPropertyValue('--slide-width').trim();
        if (val) pct = parseFloat(val);
      }
      return pct;
    }

    function getPct(di) {
      var sw = getSlideUnit();
      if (sw === 100) {
        return -(di * sw);
      }
      return -(sw + (di - 1) * sw - 4);
    }

    function setTrack(di, animate) {
      track.classList.toggle('no-transition', animate === false);
      track.style.transform = 'translate3d(' + getPct(di) + '%, 0, 0)';
      if (animate === false) void track.offsetHeight;
    }

    function updateUI(ri) {
      if (counter) {
        var num = (ri + 1).toString().padStart(2, '0');
        counter.textContent = num;
      }
      
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
      slideTo(displayIndex + 1, getReal(displayIndex + 1));
    }

    function prev() {
      if (isAnimating) return;
      slideTo(displayIndex - 1, getReal(displayIndex - 1));
    }

    track.addEventListener('transitionend', onTransitionEnd);

    if (prevBtn) prevBtn.addEventListener('click', function (e) { e.preventDefault(); prev(); });
    if (nextBtn) nextBtn.addEventListener('click', function (e) { e.preventDefault(); next(); });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') { e.preventDefault(); prev(); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); next(); }
    });

    var touchState = { startX: 0, startY: 0, currentX: 0, isDragging: false, moved: false, velocityX: 0, lastTime: 0, lastX: 0 };

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
      var now = Date.now();
      var dt = now - touchState.lastTime;
      if (dt > 0) touchState.velocityX = (t.screenX - touchState.lastX) / dt;
      touchState.lastTime = now;
      touchState.lastX = t.screenX;
      var diffY = Math.abs(t.screenY - touchState.startY);
      var diffX = Math.abs(t.screenX - touchState.startX);
      if (diffX > diffY && diffX > 10) e.preventDefault();
    }, { passive: false });

    viewport.addEventListener('touchend', function (e) {
      if (!touchState.isDragging) return;
      touchState.isDragging = false;
      if (!touchState.moved) return;
      var diff = touchState.startX - touchState.currentX;
      var absDiff = Math.abs(diff);
      var hasMomentum = Math.abs(touchState.velocityX) > 0.3;
      if (absDiff > 50 || hasMomentum) {
        if (diff > 0 || (hasMomentum && touchState.velocityX < -0.3)) next();
        else prev();
      }
    }, { passive: true });

    setTrack(displayIndex, false);
    updateUI(0);
  }

  /* ─── Init ─── */
  function init() {
    initMobileMenu();
    initStickyHeader();
    initCounters();
    initAnimations();
    initScrollReveal();
    initLightbox();
    initFAQ();
    initHeroSlider();
    initInquiryForm();
    renderCompareBar();
    updateFavoriteButtons();
    initProductsListingPage();
    renderRedesignProductDetail();

    /* Animate Why Choose Us section (3rd .redesign-section, after #about) */
    var sections = qsa('.redesign-section');
    var aboutSection = document.getElementById('about');
    for (var i = 0; i < sections.length; i++) {
      if (aboutSection && sections[i] === aboutSection) {
        var wcuSection = sections[i + 1];
        if (wcuSection) {
          observeContainer({
            container: wcuSection,
            threshold: 0.15,
            children: [
              { selector: '.redesign-section-header', animation: 'redesign-fade-up' },
              { selector: '.redesign-products-grid', animation: 'redesign-stagger' }
            ]
          });
          observeContainer({
            container: wcuSection.querySelector('.redesign-products-grid'),
            threshold: 0.1,
            staggerContainer: true,
            childSelector: '.redesign-stat-card',
            animation: 'redesign-stagger'
          });
        }
        break;
      }
    }

    /* Re-init on dynamic content */
    document.addEventListener('redesignContentLoaded', function () {
      initAnimations();
      initScrollReveal();
      initLightbox();
      initFAQ();
      updateCompareButtons();
      updateFavoriteButtons();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
