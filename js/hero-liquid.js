/* ═══════════════════════════════════════════════════════════════════════════
   RS Machinery — hero liquid-metal backdrop
   ThreeUI "Liquid Form" pattern: one raw-WebGL ray-marched liquid metal form.
   Zero dependencies, zero assets, no framework, no build step.

   - Brand-tinted steel (deep navy → #1640b3) + orange kicker light
   - Slow, calm morph; pointer camera drift; sits right-of-centre behind the
     product showcase
   - Deepest hero layer: canvas is pointer-inert, beneath photo/grid/vignette
   - Mobile: fewer march steps + lower render scale; reduced-motion: one static
     frame; pauses when hero is off-screen or the tab is hidden
   - Graceful fallback: no WebGL → element hidden, hero keeps its CSS gradient

   Included by index.html + index-hi.html only (EN+HI parity).
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  var host = document.querySelector(".hp-hero__liquid");
  if (!host || host.getAttribute("data-liquid") === "off") return;
  var canvas = host.querySelector("canvas");
  var hero = document.getElementById("hero");
  if (!canvas || !hero) { if (host) host.style.display = "none"; return; }

  var reduced = !!(window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches);

  var gl = canvas.getContext("webgl", { alpha: true, antialias: false, depth: false, stencil: false });
  if (!gl) gl = canvas.getContext("experimental-webgl");
  if (!gl) { host.style.display = "none"; return; }

  /* ── quality tier ─────────────────────────────────────────────────────── */
  var narrow = hero.clientWidth > 0 && hero.clientWidth < 700;
  var STEPS = narrow ? 44 : 72;
  var OCTAVES = narrow ? 3 : 4;
  var DPR_CAP = narrow ? 1.0 : 1.5;
  var SCALE = narrow ? 0.7 : 1.0;

  var VERT = [
    "attribute vec2 aPos;",
    "void main(){ gl_Position = vec4(aPos, 0.0, 1.0); }"
  ].join("\n");

  var FRAG_HEAD = [
    "#ifdef GL_FRAGMENT_PRECISION_HIGH",
    "precision highp float;",
    "#else",
    "precision mediump float;",
    "#endif",
    "uniform vec2  uRes;",
    "uniform float uTime;",
    "uniform vec2  uPtr;",
    "uniform float uAsp;",
    "#define STEPS " + STEPS,
    "#define OCTAVES " + OCTAVES,
    "#define MAX_T 7.0"
  ].join("\n");

  var FRAG_BODY = [
    "float hash(vec3 p){",
    "  p = fract(p * 0.3183099 + 0.1);",
    "  p *= 17.0;",
    "  return fract(p.x * p.y * p.z * (p.x + p.y + p.z));",
    "}",
    "float noise(vec3 x){",
    "  vec3 i = floor(x), f = fract(x);",
    "  f = f * f * (3.0 - 2.0 * f);",
    "  return mix(",
    "    mix(mix(hash(i + vec3(0.0,0.0,0.0)), hash(i + vec3(1.0,0.0,0.0)), f.x),",
    "        mix(hash(i + vec3(0.0,1.0,0.0)), hash(i + vec3(1.0,1.0,0.0)), f.x), f.y),",
    "    mix(mix(hash(i + vec3(0.0,0.0,1.0)), hash(i + vec3(1.0,0.0,1.0)), f.x),",
    "        mix(hash(i + vec3(0.0,1.0,1.0)), hash(i + vec3(1.0,1.0,1.0)), f.x), f.y),",
    "    f.z);",
    "}",
    "float fbm(vec3 p){",
    "  float s = 0.0, a = 0.5;",
    "  for (int i = 0; i < OCTAVES; i++){",
    "    s += a * noise(p);",
    "    p = p * 2.03 + vec3(1.7, 9.2, 3.1);",
    "    a *= 0.5;",
    "  }",
    "  return s;",
    "}",
    "vec2 rot(vec2 p, float a){",
    "  float c = cos(a), s = sin(a);",
    "  return vec2(c * p.x - s * p.y, s * p.x + c * p.y);",
    "}",
    "float map(vec3 p){",
    "  float t = uTime * 0.11;",
    "  vec3 q = p;",
    "  q.xz = rot(q.xz, t * 0.6);",
    "  q.xy = rot(q.xy, t * 0.23);",
    "  float d = length(q) - 1.18;",
    "  float n = fbm(q * 1.55 + vec3(0.0, 0.0, -t));",
    "  d += (n - 0.5) * 0.72;",
    "  return d * 0.62;",
    "}",
    "vec3 normalAt(vec3 p){",
    "  vec2 e = vec2(0.0025, 0.0);",
    "  float d = map(p);",
    "  return normalize(vec3(",
    "    map(p + e.xyy) - d,",
    "    map(p + e.yxy) - d,",
    "    map(p + e.yyx) - d));",
    "}",
    "vec3 env(vec3 rd){",
    "  float y = rd.y;",
    "  vec3 c = mix(vec3(0.016, 0.033, 0.09), vec3(0.42, 0.55, 0.83), smoothstep(-0.35, 0.8, y));",
    "  c += vec3(0.10, 0.15, 0.28) * exp(-abs(y) * 5.0) * 0.55;",
    "  float key = pow(max(dot(rd, normalize(vec3(-0.55, 0.8, 0.28))), 0.0), 22.0);",
    "  c += vec3(0.95, 0.98, 1.05) * key * 1.15;",
    "  float kick = pow(max(dot(rd, normalize(vec3(0.6, -0.62, 0.3))), 0.0), 7.0);",
    "  c += vec3(1.0, 0.42, 0.12) * kick * 0.62;",
    "  float fill = pow(max(dot(rd, normalize(vec3(0.35, 0.15, 0.9))), 0.0), 3.0);",
    "  c += vec3(0.16, 0.28, 0.62) * fill * 0.35;",
    "  return c;",
    "}",
    "void main(){",
    "  vec2 uv = (gl_FragCoord.xy * 2.0 - uRes) / uRes.y;",
    "  float aimX = 0.55 * clamp(uAsp, 0.55, 1.0);",
    "  vec2 aim = vec2(aimX, -0.04) + uPtr * 0.14;",
    "  vec3 ro = vec3(0.0, 0.0, -3.4);",
    "  vec3 rd = normalize(vec3(uv - aim, 1.9));",
    "  float t = 0.6, glow = 1e4;",
    "  bool hit = false;",
    "  for (int i = 0; i < STEPS; i++){",
    "    vec3 p = ro + rd * t;",
    "    float d = map(p);",
    "    glow = min(glow, d / max(t, 0.4));",
    "    if (d < 0.0016 * t) { hit = true; break; }",
    "    t += d;",
    "    if (t > MAX_T) break;",
    "  }",
    "  vec3 col = vec3(0.0);",
    "  float alpha = 0.0;",
    "  if (hit){",
    "    vec3 p = ro + rd * t;",
    "    vec3 n = normalAt(p);",
    "    vec3 r = reflect(rd, n);",
    "    vec3 F0 = mix(vec3(0.92, 0.94, 0.97), vec3(0.13, 0.25, 0.70), 0.34);",
    "    float fre = pow(clamp(1.0 + dot(rd, n), 0.0, 1.0), 5.0);",
    "    vec3 F = F0 + (1.0 - F0) * fre;",
    "    vec3 body = mix(vec3(0.05, 0.10, 0.24), vec3(0.35, 0.50, 0.85), clamp(n.y * 0.5 + 0.5, 0.0, 1.0)) * 0.5;",
    "    col = env(r) * F + body * (0.25 + 0.75 * fre);",
    "    col = col / (1.0 + col);",
    "    col = pow(col, vec3(0.4545));",
    "    alpha = 1.0;",
    "  } else {",
    "    col = vec3(0.05, 0.12, 0.30);",
    "    alpha = min(exp(-glow * 2.4), 1.0) * 0.38;",
    "  }",
    "  gl_FragColor = vec4(col * alpha, alpha);",
    "}"
  ].join("\n");

  /* ── GL setup ─────────────────────────────────────────────────────────── */
  function compile(type, src) {
    var sh = gl.createShader(type);
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
      return { ok: false, log: gl.getShaderInfoLog(sh) };
    }
    return { ok: true, sh: sh };
  }

  var vs = compile(gl.VERTEX_SHADER, VERT);
  var fs = compile(gl.FRAGMENT_SHADER, FRAG_HEAD + "\n" + FRAG_BODY);
  if (!vs.ok || !fs.ok) { host.style.display = "none"; return; }

  var prog = gl.createProgram();
  gl.attachShader(prog, vs.sh);
  gl.attachShader(prog, fs.sh);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { host.style.display = "none"; return; }
  gl.useProgram(prog);

  var buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  var loc = gl.getAttribLocation(prog, "aPos");
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  var uRes = gl.getUniformLocation(prog, "uRes");
  var uTime = gl.getUniformLocation(prog, "uTime");
  var uPtr = gl.getUniformLocation(prog, "uPtr");
  var uAsp = gl.getUniformLocation(prog, "uAsp");

  /* ── sizing ────────────────────────────────────────────────────────────── */
  function resize() {
    var w = hero.clientWidth, h = hero.clientHeight;
    if (!w || !h) return;
    var dpr = Math.min(window.devicePixelRatio || 1, DPR_CAP) * SCALE;
    var cw = Math.max(2, Math.round(w * dpr));
    var ch = Math.max(2, Math.round(h * dpr));
    if (canvas.width !== cw || canvas.height !== ch) {
      canvas.width = cw;
      canvas.height = ch;
      gl.viewport(0, 0, cw, ch);
    }
  }

  /* ── pointer drift (desktop only) ─────────────────────────────────────── */
  var ptr = { x: 0, y: 0 }, target = { x: 0, y: 0 };
  if (!reduced) {
    hero.addEventListener("mousemove", function (e) {
      var r = hero.getBoundingClientRect();
      target.x = ((e.clientX - r.left) / r.width) * 2 - 1;
      target.y = -(((e.clientY - r.top) / r.height) * 2 - 1);
    }, { passive: true });
    hero.addEventListener("mouseleave", function () {
      target.x = 0; target.y = 0;
    }, { passive: true });
  }

  /* ── render loop ──────────────────────────────────────────────────────── */
  var raf = 0, visible = true, frames = 0;
  var debug = { mode: "init", frames: 0, webgl: true };
  window.__RS_LIQUID = debug;

  function draw(now) {
    resize();
    ptr.x += (target.x - ptr.x) * 0.04;
    ptr.y += (target.y - ptr.y) * 0.04;
    gl.uniform2f(uRes, canvas.width, canvas.height);
    gl.uniform1f(uTime, now);
    gl.uniform2f(uPtr, ptr.x, ptr.y);
    gl.uniform1f(uAsp, canvas.width / Math.max(canvas.height, 1));
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    frames++;
    debug.frames = frames;
  }

  function loop(nowMs) {
    if (!visible || document.hidden) { raf = 0; return; }
    draw(nowMs * 0.001);
    raf = requestAnimationFrame(loop);
  }

  function start() {
    if (raf || reduced) return;
    raf = requestAnimationFrame(loop);
  }

  /* ── reduced motion: one calm static frame, no loop, no listeners ─────── */
  if (reduced) {
    debug.mode = "static";
    draw(0);
  } else {
    debug.mode = "anim";
    start();
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        visible = entries[0].isIntersecting;
        if (visible && !document.hidden) start();
      }).observe(hero);
    }
    document.addEventListener("visibilitychange", function () {
      if (!document.hidden && visible) start();
    });
    window.addEventListener("resize", function () {
      if (reduced) { draw(0); return; }
      resize();
    }, { passive: true });
  }

  /* ── context loss → graceful fallback to the CSS gradient hero ────────── */
  canvas.addEventListener("webglcontextlost", function (e) {
    e.preventDefault();
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
    host.style.display = "none";
    debug.mode = "fallback";
  });
})();
