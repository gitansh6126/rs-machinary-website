// ═══════════════════════════════════════════════════════════════════════════
// RS Machinery — Shared Header Loader
// Single source of truth: base/header.html (old design header + mobile menu).
// Loaded by every page into #headerPlaceholder. If fetch is unavailable
// (e.g. file:// preview), a built-in copy is injected instead.
// Note: mobile-menu open/close is wired once in js/main.js (initNavigation).
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
    + '      <a href="tel:+918708795253" class="redesign-btn redesign-btn-outline redesign-mobile-hide">'
    + '        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>'
    + '        Call Now'
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
    + '  <nav class="mobile-nav">'
    + '    <a href="/" class="mobile-nav-link">Home</a>'
    + '    <a href="products.html" class="mobile-nav-link">Products</a>'
    + '    <a href="/#about" class="mobile-nav-link">About</a>'
    + '    <a href="/#contact" class="mobile-nav-link">Contact</a>'
    + '    <a href="https://wa.me/918708795253" target="_blank" rel="noopener" class="mobile-nav-cta">WhatsApp</a>'
    + '  </nav>'
    + '  <div class="mobile-contact">'
    + '    <a href="tel:+918708795253" class="mobile-phone">+91 870 879 5253</a>'
    + '  </div>'
    + '</div>'
    + '<div class="mobile-menu-overlay" id="mobileMenuOverlay"></div>';

  // Determine active page for nav highlighting
  var path = window.location.pathname;
  var page = path.split("/").pop() || "index.html";

  function normalize(name) {
    return name === "" || name === "/" ? "index.html" : name;
  }

  function isActive(link) {
    return normalize(page) === normalize(link);
  }

  function markActive() {
    var links = document.querySelectorAll(".redesign-header-nav a");
    for (var i = 0; i < links.length; i++) {
      if (isActive(links[i].getAttribute("href"))) {
        links[i].classList.add("active");
      }
    }
  }

  function inject(html) {
    var placeholder = document.getElementById("headerPlaceholder");
    if (!placeholder) return;
    placeholder.outerHTML = html;
    markActive();
    document.dispatchEvent(new CustomEvent("rs:header-loaded"));
  }

  function loadHeader() {
    // Prefer the real shared file so there is a single source of truth.
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