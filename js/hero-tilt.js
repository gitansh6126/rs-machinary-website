/* ═══════════════════════════════════════════════════════════════════════════
   RS Machinery — product-card 3D tilt + glare (ThreeUI "Holo Card" pattern)
   Pointer-tilt on the CENTRE product photo only. Pure CSS 3D + one rAF loop
   feeding CSS vars. The coverflow controller in main.js is untouched — this
   layer only reads which card is centred ([data-off="0"]).

   - tilt + glare track the pointer with slight lag (premium, not twitchy)
   - centre-card change (carousel advance): tilt resets, sheen sweep fires
   - prefers-reduced-motion: module no-ops (CSS vars stay 0)
   - touch/narrow viewport: no pointer tracking (no interference with swipe)
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  var stage = document.getElementById("hpStage");
  if (!stage) return;

  var reduceMotion = !!(window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  if (reduceMotion) return;                    // tilt OFF entirely for RM users

  var narrow = window.matchMedia("(max-width: 700px)");

  var MAX_TILT = 7;                             // degrees — subtle, premium
  var LAG = 0.14;                               // easing per rAF tick
  var target = { x: 0, y: 0 };                  // -1..1 pointer position
  var cur = { x: 0, y: 0 };
  var raf = 0;
  var lastCard = null;

  function centreCard() {
    return stage.querySelector('.hp-card[data-off="0"]');
  }

  /* Glare layer injected inside the card, above the photo. */
  function ensureGlare(card) {
    if (!card) return null;
    var g = card.querySelector(".hp-glare");
    if (!g) {
      g = document.createElement("div");
      g.className = "hp-glare";
      g.setAttribute("aria-hidden", "true");
      card.insertBefore(g, card.firstChild);
    }
    return g;
  }

  function paint() {
    var card = centreCard();
    if (!card) return;
    ensureGlare(card);
    var degX = (cur.y * MAX_TILT).toFixed(3) + "deg";
    var degY = (cur.x * MAX_TILT).toFixed(3) + "deg";
    var gx = (0.5 + cur.x * 0.42).toFixed(3);    // glare follows the pointer
    var gy = (0.5 + cur.y * 0.42).toFixed(3);
    var ga = Math.min(1, (Math.abs(cur.x) + Math.abs(cur.y)) * 0.55).toFixed(3);
    card.style.setProperty("--hx", degX);
    card.style.setProperty("--hy", degY);
    card.style.setProperty("--gx", gx);
    card.style.setProperty("--gy", gy);
    card.style.setProperty("--ga", ga);
  }

  function tick() {
    var dx = target.x - cur.x;
    var dy = target.y - cur.y;
    if (target.x === 0 && target.y === 0 &&
        Math.abs(dx) < 0.0015 && Math.abs(dy) < 0.0015) {
      // settled back at flat — final paint, stop the loop
      cur.x = 0; cur.y = 0;
      paint();
      raf = 0;
      return;
    }
    cur.x += dx * LAG;
    cur.y += dy * LAG;
    paint();
    raf = requestAnimationFrame(tick);
  }

  function kick() {
    if (!raf) raf = requestAnimationFrame(tick);
  }

  function onMove(e) {
    if (narrow.matches) return;                  // no tilt while narrow/mobile
    var card = centreCard();
    if (!card) return;
    var r = card.getBoundingClientRect();
    if (!r.width) return;
    var nx = ((e.clientX - r.left) / r.width) * 2 - 1;    // -1..1 within card
    var ny = ((e.clientY - r.top) / r.height) * 2 - 1;
    target.x = Math.max(-1, Math.min(1, nx));
    target.y = Math.max(-1, Math.min(1, ny));
    kick();
  }

  function onLeave() {
    target.x = 0; target.y = 0;
    kick();
  }

  /* Centre-card swap (carousel advance / side-card click): reset + sheen. */
  function onCentreChange(card) {
    lastCard = card;
    target.x = 0; target.y = 0; cur.x = 0; cur.y = 0;
    ensureGlare(card);
    card.style.setProperty("--hx", "0deg");
    card.style.setProperty("--hy", "0deg");
    card.style.setProperty("--ga", "0");
    card.style.setProperty("--sweep", "1");      // fire one sheen sweep
    window.setTimeout(function () {
      card.style.setProperty("--sweep", "0");
    }, 950);
  }

  /* Initial wiring */
  lastCard = centreCard();
  if (lastCard) ensureGlare(lastCard);

  if (window.PointerEvent) {
    stage.addEventListener("pointermove", onMove, { passive: true });
    stage.addEventListener("pointerleave", onLeave, { passive: true });
  } else {
    stage.addEventListener("mousemove", onMove, { passive: true });
    stage.addEventListener("mouseleave", onLeave, { passive: true });
  }

  if ("MutationObserver" in window) {
    new MutationObserver(function () {
      var c = centreCard();
      if (c && c !== lastCard) onCentreChange(c);
    }).observe(stage, { subtree: true, attributes: true, attributeFilter: ["data-off"] });
  }

  window.__RS_TILT = { active: true, reduced: false, narrow: narrow.matches };
})();
