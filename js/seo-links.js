/**
 * RS Machinery — SEO Admin integration (additive, data-driven)
 * Reads the export payload produced by the SEO Admin (seo-admin/export/site/data/seo-links.json).
 * When approved+published programmatic pages exist, injects a "Service Areas" footer
 * column with internal links to them. When the payload is missing or empty, this
 * script does nothing — the site renders exactly as before.
 */
(function () {
  'use strict';

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    fetch('data/seo-links.json', { cache: 'no-cache' })
      .then(function (res) { return res.ok ? res.json() : null; })
      .then(function (data) { if (data && data.locations && data.locations.length > 0) injectFooterColumn(data.locations); })
      .catch(function () { });
  }

  function injectFooterColumn(locations) {
    var grids = document.querySelectorAll('.redesign-footer-grid');
    if (grids.length === 0) return;

    var isHindi = (window.location.pathname.split("/").pop() || "").indexOf("-hi.html") !== -1;
    var title = isHindi ? 'सेवा क्षेत्र' : 'Service Areas';
    var existing = document.querySelector('.redesign-footer-grid .redesign-footer-seo-col');
    if (existing) return;

    var col = document.createElement('div');
    col.className = 'redesign-footer-seo-col';

    var h = document.createElement('h4');
    h.textContent = title;
    col.appendChild(h);

    var nav = document.createElement('nav');
    nav.className = 'redesign-footer-links';
    locations.forEach(function (loc) {
      if (!loc.city || !loc.url) return;
      var a = document.createElement('a');
      a.href = loc.url.replace(/^https?:\/\/[^/]+/, '');
      a.textContent = loc.city;
      nav.appendChild(a);
    });
    col.appendChild(nav);

    for (var i = 0; i < grids.length; i++) {
      grids[i].appendChild(col.cloneNode(true));
    }
  }
})();
