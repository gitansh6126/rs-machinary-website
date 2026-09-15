// ═══════════════════════════════════════════════════════════════════════════
// RS Machinery — Shared Header Loader + Language Toggle
// Single source of truth: base/header.html (fallback: HEADER_FRAGMENT).
// Loaded by every page into #headerPlaceholder.
// Detects EN/HI and translates nav + generates language toggle.
// ═══════════════════════════════════════════════════════════════════════════

(function () {
  "use strict";

  var HEADER_FRAGMENT = ''
    + '<header class="redesign-header" id="redesignHeader">'
    + '  <div class="redesign-header-inner">'
    + '    <a class="redesign-header-logo" href="/" aria-label="RS Machinery home">'
    + '      <img src="assets/logo/icon/main_non_bg_logo.png" alt="RS Machinery">'
    + '    </a>'
    + '    <nav class="redesign-header-nav" aria-label="Primary">'
    + '      <a href="/">Home</a>'
    + '      <a href="products.html">Products</a>'
    + '      <a href="/#about">About</a>'
    + '      <a href="/#contact">Contact</a>'
    + '    </nav>'
    + '    <div class="redesign-header-actions">'
    + '      <div class="redesign-lang-toggle" data-lang-toggle>'
    + '        <a href="index.html" class="redesign-lang-btn" data-lang-en>English</a>'
    + '        <a href="index-hi.html" class="redesign-lang-btn" data-lang-hi>\u0939\u093F\u0902\u0926\u0940</a>'
    + '      </div>'
    + '      <a href="tel:+918708795253" class="redesign-btn redesign-btn-outline redesign-mobile-hide">'
    + '        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>'
    + '        <span data-i18n="call">Call Now</span>'
    + '      </a>'
    + '      <a href="https://wa.me/918708795253" target="_blank" rel="noopener" class="redesign-btn redesign-btn-accent redesign-mobile-hide">'
    + '        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347"/></svg>'
    + '        WhatsApp'
    + '      </a>'
    + '      <button class="mobile-menu-btn" id="mobileMenuBtn" aria-label="Toggle menu" aria-expanded="false">'
    + '        <span class="hamburger-line"></span>'
    + '        <span class="hamburger-line"></span>'
    + '        <span class="hamburger-line"></span>'
    + '      </button>'
    + '    </div>'
    + '  </div>'
    + '</header>'
    + '<!-- Mobile Menu Overlay -->'
    + '<div class="mobile-menu" id="mobileMenu" aria-hidden="true">'
    + '  <button class="mobile-menu-close" aria-label="Close menu">&times;</button>'
    + '  <div class="mobile-lang-toggle" data-lang-toggle>'
    + '    <a href="index.html" class="redesign-lang-btn" data-lang-en>English</a>'
    + '    <a href="index-hi.html" class="redesign-lang-btn" data-lang-hi>\u0939\u093F\u0902\u0926\u0940</a>'
    + '  </div>'
    + '  <nav class="mobile-nav">'
    + '    <a href="/" class="mobile-nav-link" data-i18n-nav="home">Home</a>'
    + '    <a href="products.html" class="mobile-nav-link" data-i18n-nav="products">Products</a>'
    + '    <a href="/#about" class="mobile-nav-link" data-i18n-nav="about">About</a>'
    + '    <a href="/#contact" class="mobile-nav-link" data-i18n-nav="contact">Contact</a>'
    + '    <a href="https://wa.me/918708795253" target="_blank" rel="noopener" class="mobile-nav-cta">WhatsApp</a>'
    + '  </nav>'
    + '  <div class="mobile-contact">'
    + '    <a href="tel:+918708795253" class="mobile-phone">+91 870 879 5253</a>'
    + '  </div>'
    + '</div>'
    + '<div class="mobile-menu-overlay" id="mobileMenuOverlay"></div>';

  // ── TRANSLATION DATA ──────────────────────────────────────────────────
  var HI = {
    home: "\u092e\u0941\u0916\u092a\u0943\u0937\u094D\u0920",
    products: "\u0909\u0924\u094D\u092a\u093E\u0926",
    about: "\u0939\u092e\u093E\u0930\u0947 \u092c\u093E\u0930\u0947 \u092e\u0947\u0902",
    contact: "\u0938\u0902\u092a\u0930\u094D\u0915",
    callNow: "\u0915\u0949\u0932 \u0915\u0930\u0947\u0902",
    orderNow: "\u0905\u092c \u0911\u0930\u094D\u0921 \u0915\u0930\u0947\u0902"
  };

  var EN = {
    home: "Home",
    products: "Products",
    about: "About",
    contact: "Contact",
    callNow: "Call Now",
    orderNow: "Order Now"
  };

  // ── LANGUAGE DETECTION ────────────────────────────────────────────────
  var currentPage = window.location.pathname.split("/").pop() || "index.html";
  var isHindi = currentPage.indexOf("-hi.html") !== -1;
  var baseName = currentPage.replace("-hi.html", ".html").replace(".html", "");
  if (baseName === "") baseName = "index";
  var dict = isHindi ? HI : EN;

  function otherLangUrl() {
    return baseName + (isHindi ? ".html" : "-hi.html");
  }

  // ── TRANSLATE + SET LINKS ────────────────────────────────────────────
  function applyLanguage() {
    // Nav links (desktop header)
    var navLinks = document.querySelectorAll(".redesign-header-nav a");
    var navTexts = [dict.home, dict.products, dict.about, dict.contact];
    var navHrefs = [isHindi ? "index-hi.html" : "/", "products" + (isHindi ? "-hi" : "") + ".html", (isHindi ? "index-hi" : "") + ".html#about", (isHindi ? "index-hi" : "") + ".html#contact"];
    for (var i = 0; i < navLinks.length && i < navTexts.length; i++) {
      navLinks[i].textContent = navTexts[i];
      navLinks[i].setAttribute("href", navHrefs[i]);
    }

    // Mobile nav links
    var mobileLinks = document.querySelectorAll(".mobile-nav-link");
    for (var j = 0; j < mobileLinks.length; j++) {
      var key = mobileLinks[j].getAttribute("data-i18n-nav");
      if (key && dict[key]) mobileLinks[j].textContent = dict[key];
      if (key === "home") mobileLinks[j].setAttribute("href", isHindi ? "index-hi.html" : "/");
      if (key === "products") mobileLinks[j].setAttribute("href", (isHindi ? "products-hi" : "products") + ".html");
      if (key === "about") mobileLinks[j].setAttribute("href", (isHindi ? "index-hi" : "") + ".html#about");
      if (key === "contact") mobileLinks[j].setAttribute("href", (isHindi ? "index-hi" : "") + ".html#contact");
    }

    // Header action text
    var i18nEls = document.querySelectorAll("[data-i18n]");
    for (var k = 0; k < i18nEls.length; k++) {
      var iKey = i18nEls[k].getAttribute("data-i18n");
      if (iKey === "call") i18nEls[k].textContent = dict.callNow;
      if (iKey === "order") i18nEls[k].textContent = dict.orderNow;
    }

    // Mobile bar "Order Now" text
    var mobileBarBtns = document.querySelectorAll(".redesign-mobile-bar-btn-primary span");
    for (var m = 0; m < mobileBarBtns.length; m++) {
      if (mobileBarBtns[m].textContent === "Order Now" || mobileBarBtns[m].textContent === "\u0905\u092c \u0911\u0930\u094D\u0921 \u0915\u0930\u0947\u0902") {
        mobileBarBtns[m].textContent = dict.orderNow;
      }
    }

    // Language toggle links
    var toggles = document.querySelectorAll("[data-lang-toggle]");
    var otherUrl = otherLangUrl();
    for (var t = 0; t < toggles.length; t++) {
      var enBtn = toggles[t].querySelector("[data-lang-en]");
      var hiBtn = toggles[t].querySelector("[data-lang-hi]");
      if (enBtn) {
        enBtn.setAttribute("href", baseName + ".html");
        enBtn.classList.toggle("redesign-lang-active", !isHindi);
      }
      if (hiBtn) {
        hiBtn.setAttribute("href", baseName + "-hi.html");
        hiBtn.classList.toggle("redesign-lang-active", isHindi);
      }
    }

    // Logo alt text
    var logoImg = document.querySelector(".redesign-header-logo img");
    if (logoImg) logoImg.setAttribute("alt", isHindi ? "\u0906\u0930\u090f\u0938 \u092e\u0936\u0940\u0928\u0930\u0940" : "RS Machinery");
  }

  // ── ACTIVE PAGE HIGHLIGHT ─────────────────────────────────────────────
  function normalize(name) {
    return name === "" || name === "/" ? "index.html" : name;
  }

  function isActive(link) {
    var cleanLink = normalize(link.replace("-hi.html", ".html"));
    var cleanPage = normalize(currentPage);
    return cleanLink === cleanPage;
  }

  function markActive() {
    var links = document.querySelectorAll(".redesign-header-nav a");
    for (var i = 0; i < links.length; i++) {
      if (isActive(links[i].getAttribute("href"))) {
        links[i].classList.add("active");
        links[i].setAttribute("aria-current", "page");
      }
    }
  }

  function inject(html) {
    var placeholder = document.getElementById("headerPlaceholder");
    if (!placeholder) return;
    placeholder.outerHTML = html;
    applyLanguage();
    markActive();
    document.dispatchEvent(new CustomEvent("rs:header-loaded"));
  }

  function loadHeader() {
    if (window.fetch && window.location.protocol.indexOf("http") === 0) {
      fetch("base/header.html")
        .then(function (res) {
          if (!res.ok) throw new Error("header fetch failed");
          return res.text();
        })
        .then(function (html) { inject(html); })
        .catch(function () { inject(HEADER_FRAGMENT); });
    } else {
      inject(HEADER_FRAGMENT);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", loadHeader);
  } else {
    loadHeader();
  }
})();
