// ═══════════════════════════════════════════════════════════════════════════
// RS Machinery — Shared Header & Mobile Menu Component
// Single source of truth for header across all pages.
// ═══════════════════════════════════════════════════════════════════════════

(function () {
  "use strict";

  // Determine active page for nav highlighting
  var path = window.location.pathname;
  var page = path.split("/").pop() || "index.html";

  function isActive(link) {
    if (link === "/" || link === "index.html") {
      return page === "" || page === "/" || page === "index.html";
    }
    return page === link;
  }

  var navLinks = [
    { href: "/", label: "Home" },
    { href: "products.html", label: "Products" },
    { href: "/#about", label: "About" },
    { href: "/#contact", label: "Contact" }
  ];

  function buildNavLinks(isMobile) {
    return navLinks.map(function (item) {
      var cls = isMobile ? "mobile-nav-link" : "";
      var activeClass = !isMobile && isActive(item.href) ? ' class="active"' : "";
      if (isMobile) {
        return '<a href="' + item.href + '" class="mobile-nav-link">' + item.label + "</a>";
      }
      return "<a href=\"" + item.href + "\"" + activeClass + ">" + item.label + "</a>";
    }).join("\n        ");
  }

  var headerHTML = ''
    + '<!-- ═══ HEADER ═══ -->'
    + '<header class="redesign-header" id="redesignHeader">'
    + '  <div class="redesign-header-inner">'
    + '    <a class="redesign-header-logo" href="/" aria-label="RS Machinery home">'
    + '      <img src="assets/logo/icon/main_non_bg_logo.png" alt="RS Machinery">'
    + '    </a>'
    + '    <nav class="redesign-header-nav" aria-label="Primary">'
    + '      ' + buildNavLinks(false)
    + '    </nav>'
    + '    <div class="redesign-header-actions">'
    + '      <a href="tel:+918708795253" class="redesign-btn redesign-btn-outline redesign-mobile-hide">'
    + '        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>'
    + '        Call Now'
    + '      </a>'
    + '      <a href="https://wa.me/918708795253" target="_blank" rel="noopener" class="redesign-btn redesign-btn-accent redesign-mobile-hide">'
    + '        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>'
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
    + ''
    + '<!-- Mobile Menu Overlay -->'
    + '<div class="mobile-menu" id="mobileMenu" aria-hidden="true">'
    + '  <button class="mobile-menu-close" aria-label="Close menu">&times;</button>'
    + '  <nav class="mobile-nav">'
    + '    ' + buildNavLinks(true)
    + '    <a href="https://wa.me/918708795253" target="_blank" rel="noopener" class="mobile-nav-cta">WhatsApp</a>'
    + '  </nav>'
    + '  <div class="mobile-contact">'
    + '    <a href="tel:+918708795253" class="mobile-phone">+91 870 879 5253</a>'
    + '  </div>'
    + '</div>'
    + '<div class="mobile-menu-overlay" id="mobileMenuOverlay"></div>';

  // Inject into placeholder
  var placeholder = document.getElementById("headerPlaceholder");
  if (placeholder) {
    placeholder.outerHTML = headerHTML;
  }

  // Initialize mobile menu toggle after DOM is ready
  function initMobileMenu() {
    var menuBtn = document.getElementById("mobileMenuBtn");
    var menu = document.getElementById("mobileMenu");
    var overlay = document.getElementById("mobileMenuOverlay");
    var closeBtn = menu ? menu.querySelector(".mobile-menu-close") : null;

    if (!menuBtn || !menu) return;

    function openMenu() {
      menu.classList.add("active");
      if (overlay) overlay.classList.add("active");
      menuBtn.setAttribute("aria-expanded", "true");
      menu.setAttribute("aria-hidden", "false");
    }

    function closeMenu() {
      menu.classList.remove("active");
      if (overlay) overlay.classList.remove("active");
      menuBtn.setAttribute("aria-expanded", "false");
      menu.setAttribute("aria-hidden", "true");
    }

    menuBtn.addEventListener("click", function () {
      var isOpen = menu.classList.contains("active");
      if (isOpen) { closeMenu(); } else { openMenu(); }
    });

    if (closeBtn) closeBtn.addEventListener("click", closeMenu);
    if (overlay) overlay.addEventListener("click", closeMenu);

    // Close on nav link click
    var navLinks = menu.querySelectorAll(".mobile-nav-link, .mobile-nav-cta");
    for (var i = 0; i < navLinks.length; i++) {
      navLinks[i].addEventListener("click", closeMenu);
    }
  }

  // Run after DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initMobileMenu);
  } else {
    initMobileMenu();
  }
})();
