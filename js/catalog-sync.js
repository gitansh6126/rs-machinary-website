/**
 * RS Machinery — catalog sync layer (js/catalog-sync.js)
 * Loaded AFTER js/products-data*.js and BEFORE js/main.js.
 * Renders the data-driven parts of every page from window.RSM_PRODUCTS:
 *   hero showcase cards, featured grid, form dropdown + image preview,
 *   footer product links, category filter. main.js then initialises its
 * controllers over the DOM this script produced.
 */
(function () {
  'use strict';

  var WHATSAPP_NUMBER = "918708795253";
  var isHindi = (window.location.pathname.split("/").pop() || "").indexOf("-hi.html") !== -1;

  function esc(s) {
    var M = { 38: "amp", 60: "lt", 62: "gt", 34: "quot", 39: "#39" };
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return "&" + M[c.charCodeAt(0)] + ";";
    });
  }
  function wa(msg) { return "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent(msg); }

  function catalog() {
    return (window.RSM_PRODUCTS || [])
      .filter(function (p) { return p.active !== false; })
      .sort(function (a, b) { return (a.sort_order || 99) - (b.sort_order || 99); });
  }
  function categories() { return window.RSM_CATEGORIES || []; }

  // ── 1. HERO SHOWCASE CARDS ────────────────────────────────────────────
  // Their design: #hpShowcase > #hpStage holds .hp-card <a> elements whose
  // data-* attributes drive initHeroShowcase. We regenerate them from the
  // catalog (hero:true products) before main.js boots.
  function renderHeroShowcase() {
    var stage = document.getElementById("hpStage");
    var showcase = document.getElementById("hpShowcase");
    if (!stage || !showcase) return;

    var heroProducts = catalog().filter(function (p) { return p.hero !== false; });
    if (!heroProducts.length) heroProducts = catalog().slice(0, 4);

    // keep the decorative layers + arrows, replace only the cards
    var keep = [];
    Array.prototype.forEach.call(stage.childNodes, function (n) {
      if (!(n.nodeType === 1 && n.classList.contains("hp-card"))) keep.push(n);
    });
    stage.innerHTML = "";
    keep.forEach(function (n) { stage.appendChild(n); });
    var dotsBox = document.getElementById("hpDots");
    if (dotsBox) dotsBox.innerHTML = "";   // main.js rebuilds them; avoid doubles

    var detailPage = isHindi ? "product-hi.html" : "product.html";
    heroProducts.forEach(function (p, i) {
      var a = document.createElement("a");
      a.className = "hp-card";
      a.setAttribute("data-off", String(i));
      a.setAttribute("data-name", p.hero_title_line1 || p.name);
      a.setAttribute("data-eyebrow", p.category_name || p.name);
      a.setAttribute("data-title", p.hero_title_line1 || p.name);
      a.setAttribute("data-accent", p.hero_title_line2 || "");
      a.setAttribute("data-desc", p.hero_description || p.short_description || "");
      a.setAttribute("data-feats", (p.hero_features || []).join("|"));
      a.setAttribute("href", detailPage + "?slug=" + encodeURIComponent(p.slug));
      a.setAttribute("aria-label", (p.hero_title_line1 || p.name) + " — view product");
      if (i > 0) { a.setAttribute("aria-hidden", "true"); a.setAttribute("tabindex", "-1"); }

      var img = document.createElement("img");
      var gallery = Array.isArray(p.gallery_images) ? p.gallery_images.filter(Boolean) : [];
      var heroImg = gallery.length > 1 ? gallery[1] : (gallery[0] || p.image);
      // prefer a hero-styled image if one exists in the gallery
      for (var g = 0; g < gallery.length; g++) {
        if (/hero-images|slide/i.test(gallery[g])) { heroImg = gallery[g]; break; }
      }
      img.setAttribute("src", heroImg);
      img.setAttribute("alt", p.name);
      img.setAttribute("width", "500");
      img.setAttribute("height", "500");
      img.setAttribute("loading", i === 0 ? "eager" : "lazy");
      img.setAttribute("decoding", "async");
      img.onerror = function () { this.onerror = null; this.src = "assets/placeholder.svg"; };
      a.appendChild(img);
      stage.appendChild(a);
    });

    // left column copy for the FIRST product (showcase controller re-paints on change)
    var first = heroProducts[0];
    if (first) {
      var set = function (id, v) { var el = document.getElementById(id); if (el && v != null) el.textContent = v; };
      set("hpEyebrow", first.category_name || first.name);
      set("hpTitle", first.hero_title_line1 || first.name);
      set("hpTitleAccent", first.hero_title_line2 || "");
      set("hpDesc", first.hero_description || first.short_description || "");
      var feats = document.getElementById("hpFeats");
      if (feats) {
        feats.textContent = "";
        (first.hero_features || []).forEach(function (f) {
          var li = document.createElement("li");
          li.textContent = f;
          feats.appendChild(li);
        });
      }
      set("hpName", first.hero_title_line1 || first.name);
      var total = document.getElementById("hpTotal");
      if (total) total.textContent = (heroProducts.length < 10 ? "0" : "") + heroProducts.length;
      var stageAria = document.getElementById("hpStage");
      if (stageAria) stageAria.setAttribute("aria-label", "Product showcase, " + heroProducts.length + " products");
    }
  }

  // ── 2. FEATURED GRID (homepage) ───────────────────────────────────────
  function renderFeaturedGrid() {
    var grid = document.getElementById("featuredProductsGrid");
    if (!grid) return;
    var t = isHindi ? { view: "विवरण देखें", wa: "व्हाट्सऐप", empty: "उत्पाद जल्द आ रहे हैं।" }
                    : { view: "View Details", wa: "WhatsApp", empty: "Products coming soon." };
    var featured = catalog().filter(function (p) { return p.featured; });
    if (!featured.length) featured = catalog().slice(0, 4);
    var detailPage = isHindi ? "product-hi.html" : "product.html";

    var html = featured.map(function (p) {
      return '<div class="redesign-card">'
        + '<div class="redesign-card-image-wrap">'
        + '<a href="' + detailPage + '?slug=' + encodeURIComponent(p.slug) + '">'
        + '<img src="' + esc(p.image) + '" alt="' + esc(p.name) + '" class="redesign-card-image" loading="lazy" onerror="this.onerror=null;this.src=\'assets/placeholder.svg\';">'
        + '</a>'
        + '<span class="redesign-card-badge">' + esc(p.capacity || (isHindi ? "भारी ड्यूटी" : "Heavy Duty")) + '</span>'
        + '</div>'
        + '<div class="redesign-card-body">'
        + '<span class="redesign-card-category">' + esc(p.category_name || p.name) + '</span>'
        + '<h3 class="redesign-card-title"><a href="' + detailPage + '?slug=' + encodeURIComponent(p.slug) + '">' + esc(p.name) + '</a></h3>'
        + '<p class="redesign-card-desc">' + esc(p.short_description) + '</p>'
        + '<div class="redesign-card-actions">'
        + '<a href="' + detailPage + '?slug=' + encodeURIComponent(p.slug) + '" class="redesign-btn redesign-btn-outline redesign-btn-sm">' + t.view + '</a>'
        + '<a href="' + wa(isHindi ? "नमस्ते आरएस मशीनरी, मुझे " + p.name + " के बारे में जानकारी चाहिए।" : "Hi RS Machinery, I want to inquire about " + p.name + ". Please share pricing.") + '" target="_blank" rel="noopener" class="redesign-btn redesign-btn-accent redesign-btn-sm">' + t.wa + '</a>'
        + '</div></div></div>';
    }).join("\n");
    grid.innerHTML = html || '<p style="grid-column:1/-1;text-align:center;opacity:.7;">' + t.empty + '</p>';
  }

  // ── 3. FOOTER PRODUCTS + CATEGORY FILTER ─────────────────────────────
  function renderFooterProducts() {
    var productsPage = isHindi ? "products-hi.html" : "products.html";
    document.querySelectorAll('.redesign-footer-grid').forEach(function (grid) {
      var col = grid.children[1];
      if (!col) return;
      var list = col.querySelector('.redesign-footer-links');
      if (!list || list.dataset.catalog === "1") return;
      var html = categories().map(function (c) {
        return '<a href="' + productsPage + '?category=' + encodeURIComponent(c.slug) + '">' + esc(c.name) + '</a>';
      }).join("");
      if (html) { list.innerHTML = html; list.dataset.catalog = "1"; }
    });
  }

  function renderCategoryFilter() {
    var sel = document.getElementById("redesignFilterCategory");
    if (!sel) return;
    var html = '<option value="">' + (isHindi ? "सभी श्रेणियाँ" : "All Categories") + '</option>';
    categories().forEach(function (c) {
      html += '<option value="' + esc(c.slug) + '">' + esc(c.name) + '</option>';
    });
    sel.innerHTML = html;
  }

  // ── 4. INQUIRY FORM: dropdown + image preview ─────────────────────────
  function renderProductPicker() {
    var selects = document.querySelectorAll("select[name='product']");
    if (!selects.length) return;
    var t = isHindi ? { pick: "एक उत्पाद चुनें...", other: "अन्य / कई उत्पाद" }
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
    label.appendChild(nameEl); label.appendChild(capEl);
    wrap.appendChild(img); wrap.appendChild(label);

    function update() {
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
    first.addEventListener("change", update);
    group.appendChild(wrap);
    update();
    // main.js prefills the select on product pages AFTER this boot; re-check soon.
    window.rsmSyncProductPreview = update;
    setTimeout(update, 0);
    setTimeout(update, 50);
  }

  // ── boot (before main.js DOMContentLoaded handlers) ───────────────────
  var booted = false;
  function boot() {
    if (booted) return;
    booted = true;
    renderHeroShowcase();
    renderFeaturedGrid();
    renderFooterProducts();
    renderCategoryFilter();
    renderProductPicker();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
