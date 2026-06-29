/* ===== Comic Builder — the working comic maker =====
   Pure vanilla JS, no build, works on file:// and http://localhost:5500.
   State model:
     comic = { id, title, updated, pages:[ page ] }
     page  = { layout:'1'|'2'|'3'|'4'|'6'|'splash', panels:[ panel ] }
     panel = { bg:sceneKey|null, els:[ el ] }
     el    = { type:'char'|'sfx'|'speech'|'thought', val, x,y (0..1 within panel), scale, text? }
*/
(function () {
  "use strict";

  /* ---------------- Data ---------------- */
  var SCENES = {
    School:      { grad: "linear-gradient(180deg,#cfe8ff 0%,#cfe8ff 55%,#e9d9b8 55%,#d7c39a 100%)", icon: "🏫" },
    Space:       { grad: "radial-gradient(circle at 30% 30%,#3a2a7a,#0b0628 80%)", icon: "🚀", stars: true },
    Forest:      { grad: "linear-gradient(180deg,#bfe7ff 0%,#bfe7ff 45%,#7cc66a 45%,#3f8a3a 100%)", icon: "🌲" },
    Castle:      { grad: "linear-gradient(180deg,#ffe2b3 0%,#ffcf8a 40%,#9c8bd6 40%,#6b5bb0 100%)", icon: "🏰" },
    Beach:       { grad: "linear-gradient(180deg,#aee7ff 0%,#aee7ff 52%,#79c7e8 52%,#79c7e8 66%,#f4e3b0 66%,#e9d294 100%)", icon: "🏖️" },
    Bedroom:     { grad: "linear-gradient(180deg,#ffd9ec 0%,#ffd9ec 60%,#caa6c9 60%,#a98aa8 100%)", icon: "🛏️" },
    City:        { grad: "linear-gradient(180deg,#ffd194 0%,#ff8a5c 45%,#5b6b86 45%,#3a4660 100%)", icon: "🏙️" },
    Underwater:  { grad: "linear-gradient(180deg,#5fd0e6 0%,#2aa5cf 50%,#1d6fa6 100%)", icon: "🐠", bubbles: true },
    "Science Lab": { grad: "linear-gradient(180deg,#dff6f3 0%,#bfe9e3 55%,#9fd6cf 55%,#7fc0b8 100%)", icon: "🔬" },
    Fantasy:     { grad: "radial-gradient(circle at 70% 25%,#ffd1f0,#b98bff 55%,#6b4fd6 100%)", icon: "✨", stars: true }
  };
  var SCENE_ORDER = ["School","Space","Forest","Castle","Beach","Bedroom","City","Underwater","Science Lab","Fantasy"];

  var CHARS = ["🦸","🦸‍♀️","🦹","🧙","🧑‍🚀","👧","👦","🧒","🐉","👽","🤖","🦖","🐱","🐶","🦄","🐼","🦉","🐲","🧚","🦊"];
  var PROPS = ["⭐","💎","🔥","⚡","🌈","🌟","🎈","🎁","🗝️","🛡️","⚔️","🚗","🚀","🍪","🏆","💰","📦","🌳","☁️","❤️"];
  var SFX = [
    { t: "POW!", c: "sx1" }, { t: "BOOM!", c: "sx2" }, { t: "WHOOSH!", c: "sx3" },
    { t: "ZAP!", c: "sx4" }, { t: "WOW!", c: "sx5" }, { t: "YAY!", c: "sx6" },
    { t: "BAM!", c: "sx1" }, { t: "ZOOM!", c: "sx2" }, { t: "CRASH!", c: "sx3" }, { t: "HA HA!", c: "sx5" }
  ];

  var LAYOUTS = {
    "1":   { css: { cols: "1fr", rows: "1fr" }, areas: null, count: 1 },
    "2":   { css: { cols: "1fr 1fr", rows: "1fr" }, count: 2 },
    "3":   { css: { cols: "1fr 1fr", rows: "1fr 1fr" }, count: 3, span0: true },
    "4":   { css: { cols: "1fr 1fr", rows: "1fr 1fr" }, count: 4 },
    "6":   { css: { cols: "1fr 1fr 1fr", rows: "1fr 1fr" }, count: 6 },
    "splash": { css: { cols: "1fr", rows: "1fr" }, count: 1, splash: true }
  };

  var LIB_KEY = "red5_comics_v1";

  /* ---------------- State ---------------- */
  var comic = null;
  var curPage = 0;
  var selPanel = 0;
  var selEl = null;       // {pageIdx,panelIdx,elIdx} resolved live via DOM dataset
  var saveTimer = null;

  /* ---------------- DOM ---------------- */
  var $ = function (id) { return document.getElementById(id); };
  var stage = $("cbStage");
  var titleField = $("cbTitle");

  /* ---------------- Helpers ---------------- */
  function uid() { return "c" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (m) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m];
    });
  }
  function toast(msg) {
    var t = $("cbToast"); t.textContent = msg; t.classList.add("show");
    clearTimeout(t._tm); t._tm = setTimeout(function () { t.classList.remove("show"); }, 1800);
  }

  function newPage(layout) { return { layout: layout || "4", panels: makePanels(layout || "4") }; }
  function makePanels(layout) {
    var n = LAYOUTS[layout].count, arr = [];
    for (var i = 0; i < n; i++) arr.push({ bg: null, els: [] });
    return arr;
  }
  function newComic(layout) {
    return { id: uid(), title: "", updated: Date.now(), pages: [newPage(layout)] };
  }

  /* ---------------- Persistence ---------------- */
  function loadLib() {
    try { return JSON.parse(localStorage.getItem(LIB_KEY) || "[]"); } catch (e) { return []; }
  }
  function writeLib(list) {
    try { localStorage.setItem(LIB_KEY, JSON.stringify(list)); } catch (e) {}
  }
  function coverEmoji() {
    // first character or scene icon found, for the library thumbnail
    for (var p = 0; p < comic.pages.length; p++)
      for (var c = 0; c < comic.pages[p].panels.length; c++) {
        var panel = comic.pages[p].panels[c];
        for (var e = 0; e < panel.els.length; e++)
          if (panel.els[e].type === "char") return panel.els[e].val;
        if (panel.bg && SCENES[panel.bg]) return SCENES[panel.bg].icon;
      }
    return "📖";
  }
  function persist() {
    comic.title = titleField.value.trim();
    comic.updated = Date.now();
    comic.cover = coverEmoji();
    var list = loadLib();
    var i = list.findIndex(function (x) { return x.id === comic.id; });
    var snapshot = JSON.parse(JSON.stringify(comic));
    if (i >= 0) list[i] = snapshot; else list.push(snapshot);
    writeLib(list);
  }
  function autosave() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(persist, 500);
  }

  /* ---------------- Rendering ---------------- */
  function sceneBgHtml(key) {
    var s = SCENES[key];
    var deco = "";
    if (s.stars) deco = '<div style="position:absolute;inset:0;background-image:radial-gradient(rgba(255,255,255,.95) 1px,transparent 1.4px);background-size:22px 22px;opacity:.7"></div>';
    if (s.bubbles) deco = '<div style="position:absolute;inset:0;background-image:radial-gradient(rgba(255,255,255,.6) 2px,transparent 3px);background-size:34px 40px;opacity:.5"></div>';
    return '<div class="cb-bg" style="background:' + s.grad + '">' + deco + '</div>';
  }

  function render() {
    var page = comic.pages[curPage];
    var L = LAYOUTS[page.layout];
    stage.style.gridTemplateColumns = L.css.cols;
    stage.style.gridTemplateRows = L.css.rows;
    stage.innerHTML = "";

    // comic title banner
    var titleText = (comic.title || titleField.value || "").trim();
    if (titleText) {
      var tb = document.createElement("div");
      tb.className = "cb-comic-title";
      tb.textContent = titleText;
      stage.appendChild(tb);
    }

    page.panels.forEach(function (panel, pi) {
      var cell = document.createElement("div");
      cell.className = "cb-panelcell" + (pi === selPanel ? " sel" : "");
      cell.dataset.panel = pi;
      if (L.span0 && pi === 0) cell.style.gridColumn = "1 / 3";

      if (panel.bg) cell.innerHTML = sceneBgHtml(panel.bg);
      else cell.innerHTML = '<div class="cb-placeholder">' + (L.splash ? "Splash panel — tap to select" : "Panel " + (pi + 1) + " — tap to select") + "</div>";

      panel.els.forEach(function (el, ei) {
        cell.appendChild(buildEl(el, pi, ei));
      });

      cell.addEventListener("pointerdown", function (e) {
        if (e.target === cell || e.target.classList.contains("cb-bg") || e.target.classList.contains("cb-placeholder")) {
          selectPanel(pi);
          selectEl(null);
        }
      });
      stage.appendChild(cell);
    });

    renderPageDots();
    updateSelNote();
  }

  function buildEl(el, pi, ei) {
    var node = document.createElement("div");
    node.className = "cb-el " + el.type + (isSel(pi, ei) ? " sel" : "");
    node.dataset.panel = pi; node.dataset.el = ei;
    node.style.left = (el.x * 100) + "%";
    node.style.top = (el.y * 100) + "%";
    node.style.zIndex = 10 + ei;

    if (el.type === "char") {
      node.textContent = el.val;
      node.style.fontSize = (54 * (el.scale || 1)) + "px";
    } else if (el.type === "sfx") {
      node.textContent = el.val;
      node.style.fontSize = (34 * (el.scale || 1)) + "px";
      if (el.rot) node.style.transform = "translate(-50%,-50%) rotate(" + el.rot + "deg)";
    } else { // speech / thought
      var b = document.createElement("div");
      b.className = "cb-bubble " + el.type;
      b.contentEditable = "true";
      b.spellcheck = false;
      b.textContent = el.text || "";
      b.style.fontSize = (15 * (el.scale || 1)) + "px";
      b.addEventListener("input", function () { el.text = b.textContent; autosave(); });
      b.addEventListener("pointerdown", function (e) { e.stopPropagation(); selectPanel(pi); selectEl(node); });
      node.appendChild(b);
    }

    // delete + resize handles
    var del = document.createElement("div");
    del.className = "cb-del"; del.textContent = "✕";
    del.addEventListener("pointerdown", function (e) { e.stopPropagation(); e.preventDefault(); deleteEl(pi, ei); });
    node.appendChild(del);

    var handle = document.createElement("div");
    handle.className = "cb-handle";
    node.appendChild(handle);

    enableDrag(node, el, pi, handle);
    return node;
  }

  /* ---------------- Selection ---------------- */
  function isSel(pi, ei) {
    return selEl && selEl.pi === pi && selEl.ei === ei && selEl.page === curPage;
  }
  function selectPanel(pi) {
    selPanel = pi;
    [].forEach.call(stage.querySelectorAll(".cb-panelcell"), function (c) {
      c.classList.toggle("sel", +c.dataset.panel === pi);
    });
    updateSelNote();
  }
  function selectEl(node) {
    [].forEach.call(stage.querySelectorAll(".cb-el.sel"), function (n) { n.classList.remove("sel"); });
    if (node) {
      node.classList.add("sel");
      selEl = { page: curPage, pi: +node.dataset.panel, ei: +node.dataset.el };
    } else {
      selEl = null;
    }
  }
  function updateSelNote() {
    var note = $("cbSelNote");
    var L = LAYOUTS[comic.pages[curPage].layout];
    note.textContent = L.splash
      ? "Splash page selected — add a big background, hero and a giant POW!"
      : "Panel " + (selPanel + 1) + " of " + L.count + " selected. Add scenes, characters and bubbles here.";
  }

  /* ---------------- Add / delete elements ---------------- */
  function curPanelObj() { return comic.pages[curPage].panels[selPanel]; }
  function addEl(el) {
    el.x = el.x == null ? (0.35 + Math.random() * 0.3) : el.x;
    el.y = el.y == null ? (0.35 + Math.random() * 0.3) : el.y;
    el.scale = el.scale || 1;
    curPanelObj().els.push(el);
    render();
    // auto-select the newly added element
    var cell = stage.querySelector('.cb-panelcell[data-panel="' + selPanel + '"]');
    if (cell) {
      var nodes = cell.querySelectorAll(".cb-el");
      if (nodes.length) selectEl(nodes[nodes.length - 1]);
    }
    autosave();
  }
  function deleteEl(pi, ei) {
    comic.pages[curPage].panels[pi].els.splice(ei, 1);
    selEl = null;
    render();
    autosave();
  }

  /* ---------------- Drag & resize ---------------- */
  function enableDrag(node, el, pi, handle) {
    var cell, dragging = false, resizing = false, startX, startY, startScale, baseW;

    node.addEventListener("pointerdown", function (e) {
      if (e.target.classList.contains("cb-del")) return;
      if (e.target.classList.contains("cb-handle")) return; // handled below
      // contenteditable bubble click handled in buildEl; allow dragging from node padding
      if (e.target.isContentEditable && el.type !== "char" && el.type !== "sfx") {
        // selecting/editing text — don't drag unless grabbing edge
        selectPanel(pi); selectEl(node); return;
      }
      cell = node.parentElement;
      dragging = true; node.style.cursor = "grabbing";
      selectPanel(pi); selectEl(node);
      node.setPointerCapture(e.pointerId);
      e.preventDefault();
    });

    handle.addEventListener("pointerdown", function (e) {
      e.stopPropagation(); e.preventDefault();
      cell = node.parentElement;
      resizing = true; startX = e.clientX; startY = e.clientY;
      startScale = el.scale || 1;
      baseW = node.getBoundingClientRect().width / startScale;
      handle.setPointerCapture(e.pointerId);
    });

    function move(e) {
      if (!cell) return;
      var r = cell.getBoundingClientRect();
      if (dragging) {
        el.x = clamp((e.clientX - r.left) / r.width, 0.03, 0.97);
        el.y = clamp((e.clientY - r.top) / r.height, 0.03, 0.97);
        node.style.left = (el.x * 100) + "%";
        node.style.top = (el.y * 100) + "%";
        if (el.type === "sfx" && el.rot) node.style.transform = "translate(-50%,-50%) rotate(" + el.rot + "deg)";
      } else if (resizing) {
        var dx = e.clientX - startX;
        var newW = Math.max(18, baseW * startScale + dx);
        el.scale = clamp(newW / baseW, 0.4, 3.5);
        applyScale(node, el);
      }
    }
    node.addEventListener("pointermove", move);
    handle.addEventListener("pointermove", move);

    function end(e) {
      if (dragging || resizing) autosave();
      dragging = false; resizing = false; node.style.cursor = "grab";
      try { node.releasePointerCapture(e.pointerId); } catch (x) {}
      try { handle.releasePointerCapture(e.pointerId); } catch (x) {}
    }
    node.addEventListener("pointerup", end);
    node.addEventListener("pointercancel", end);
    handle.addEventListener("pointerup", end);
  }
  function applyScale(node, el) {
    if (el.type === "char") node.style.fontSize = (54 * el.scale) + "px";
    else if (el.type === "sfx") node.style.fontSize = (34 * el.scale) + "px";
    else { var b = node.querySelector(".cb-bubble"); if (b) b.style.fontSize = (15 * el.scale) + "px"; }
  }

  /* ---------------- Pages ---------------- */
  function renderPageDots() {
    var wrap = $("cbPageDots"); wrap.innerHTML = "";
    comic.pages.forEach(function (p, i) {
      var b = document.createElement("button");
      b.className = "cb-pagedot" + (i === curPage ? " sel" : "");
      b.textContent = i + 1;
      b.addEventListener("click", function () { curPage = i; selPanel = 0; selEl = null; render(); });
      wrap.appendChild(b);
    });
  }

  /* ---------------- AI assistant ---------------- */
  var bank = (window.CMC_STORY) || { ideas: [], next: [] };
  var lastIdea = -1, lastNext = -1;
  function aiIdea() {
    if (!bank.ideas.length) return;
    var i; do { i = Math.floor(Math.random() * bank.ideas.length); } while (i === lastIdea && bank.ideas.length > 1);
    lastIdea = i; var idea = bank.ideas[i];
    $("cbAiOut").innerHTML = "<b>" + escapeHtml(idea.title) + "</b><br>" +
      "<b>Start:</b> " + escapeHtml(idea.begin) + "<br>" +
      "<b>Middle:</b> " + escapeHtml(idea.middle) + "<br>" +
      "<b>End:</b> " + escapeHtml(idea.end);
  }
  function aiNext() {
    if (!bank.next.length) return;
    var i; do { i = Math.floor(Math.random() * bank.next.length); } while (i === lastNext && bank.next.length > 1);
    lastNext = i;
    $("cbAiOut").innerHTML = "<b>What happens next?</b><br>" + escapeHtml(bank.next[i]);
  }

  /* ---------------- Trays ---------------- */
  function buildTrays() {
    var scenes = $("cbScenes");
    SCENE_ORDER.forEach(function (key) {
      var b = document.createElement("button");
      b.innerHTML = SCENES[key].icon + "<small>" + escapeHtml(key) + "</small>";
      b.title = key;
      b.addEventListener("click", function () { curPanelObj().bg = key; render(); autosave(); toast(key + " scene added"); });
      scenes.appendChild(b);
    });

    var chars = $("cbChars");
    CHARS.forEach(function (ch) {
      var b = document.createElement("button"); b.textContent = ch;
      b.addEventListener("click", function () { addEl({ type: "char", val: ch }); });
      chars.appendChild(b);
    });

    var props = $("cbProps");
    PROPS.forEach(function (pr) {
      var b = document.createElement("button"); b.textContent = pr;
      b.addEventListener("click", function () { addEl({ type: "char", val: pr, scale: 0.7 }); });
      props.appendChild(b);
    });

    var sfx = $("cbSfx");
    SFX.forEach(function (s) {
      var b = document.createElement("button"); b.className = s.c; b.textContent = s.t;
      b.addEventListener("click", function () { addEl({ type: "sfx", val: s.t, rot: -8 - Math.floor(Math.random() * 10) }); });
      sfx.appendChild(b);
    });
  }

  /* ---------------- PNG export (native canvas render) ----------------
     NOTE: We deliberately do NOT use the SVG <foreignObject> trick here.
     Chrome taints any canvas that an <img> built from an <svg><foreignObject>
     is drawn onto, so toDataURL()/toBlob() throw a SecurityError and the
     download silently fails. Instead we paint the current page to a canvas
     with the 2D API (backgrounds, characters, SFX and bubbles), which yields
     a real, downloadable PNG. */
  function roundRectPath(ctx, x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }
  function paintSceneGradient(ctx, key, x, y, w, h) {
    var s = SCENES[key];
    if (!s) { ctx.fillStyle = "#eef3f8"; ctx.fillRect(x, y, w, h); return; }
    var css = s.grad, g;
    // radial-gradient(circle at 30% 30%, c1, c2[, c3])
    var rad = /radial-gradient\([^,]*?(?:at\s+([\d.]+)%\s+([\d.]+)%)?\s*,(.+)\)$/i.exec(css);
    var lin = /linear-gradient\(\s*([\-\d.]+)deg\s*,(.+)\)$/i.exec(css);
    function parseStops(str) {
      // split top-level commas
      var parts = [], depth = 0, cur = "";
      for (var i = 0; i < str.length; i++) {
        var ch = str[i];
        if (ch === "(") depth++;
        if (ch === ")") depth--;
        if (ch === "," && depth === 0) { parts.push(cur); cur = ""; } else cur += ch;
      }
      if (cur.trim()) parts.push(cur);
      return parts.map(function (p) {
        var m = /(#[0-9a-f]{3,8}|rgba?\([^)]+\))\s*([\d.]+%)?/i.exec(p.trim());
        return { color: m ? m[1] : p.trim(), pos: m && m[2] ? parseFloat(m[2]) / 100 : null };
      });
    }
    function applyStops(grad, stops) {
      stops.forEach(function (st, i) {
        var pos = st.pos != null ? st.pos : (i / Math.max(1, stops.length - 1));
        try { grad.addColorStop(Math.max(0, Math.min(1, pos)), st.color); } catch (e) {}
      });
    }
    if (rad) {
      var cxp = rad[1] != null ? parseFloat(rad[1]) / 100 : 0.5;
      var cyp = rad[2] != null ? parseFloat(rad[2]) / 100 : 0.5;
      var cx = x + w * cxp, cy = y + h * cyp;
      var r = Math.max(w, h);
      g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      applyStops(g, parseStops(rad[3]));
    } else if (lin) {
      var ang = (parseFloat(lin[1]) % 360) * Math.PI / 180;
      // CSS 0deg = upward; convert to canvas vector
      var dx = Math.sin(ang), dy = -Math.cos(ang);
      var halfDiag = (Math.abs(dx) * w + Math.abs(dy) * h) / 2;
      var ccx = x + w / 2, ccy = y + h / 2;
      g = ctx.createLinearGradient(ccx - dx * halfDiag, ccy - dy * halfDiag, ccx + dx * halfDiag, ccy + dy * halfDiag);
      applyStops(g, parseStops(lin[2]));
    } else {
      ctx.fillStyle = "#eef3f8"; ctx.fillRect(x, y, w, h); return;
    }
    ctx.fillStyle = g; ctx.fillRect(x, y, w, h);
  }

  function exportPng() {
    persist();
    selectEl(null);
    var rect = stage.getBoundingClientRect();
    var w = Math.round(rect.width), h = Math.round(rect.height);
    var scale = 2;
    var cv = document.createElement("canvas");
    cv.width = w * scale; cv.height = h * scale;
    var ctx = cv.getContext("2d");
    ctx.scale(scale, scale);
    ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, w, h);

    var INK = "#241a40";
    var page = comic.pages[curPage];

    [].forEach.call(stage.querySelectorAll(".cb-panelcell"), function (cell) {
      var pi = +cell.dataset.panel;
      var cr = cell.getBoundingClientRect();
      var px = cr.left - rect.left, py = cr.top - rect.top, pw = cr.width, ph = cr.height;
      var panel = page.panels[pi];

      ctx.save();
      roundRectPath(ctx, px, py, pw, ph, 4);
      ctx.clip();
      if (panel && panel.bg) paintSceneGradient(ctx, panel.bg, px, py, pw, ph);
      else { ctx.fillStyle = "#eef3f8"; ctx.fillRect(px, py, pw, ph); }
      ctx.restore();

      // panel border
      ctx.lineWidth = 3; ctx.strokeStyle = INK;
      roundRectPath(ctx, px + 1.5, py + 1.5, pw - 3, ph - 3, 4);
      ctx.stroke();

      // elements
      if (panel) panel.els.forEach(function (el) {
        var ex = px + el.x * pw, ey = py + el.y * ph;
        var sc = el.scale || 1;
        if (el.type === "char") {
          ctx.font = (54 * sc) + "px 'Apple Color Emoji','Segoe UI Emoji','Noto Color Emoji',sans-serif";
          ctx.textAlign = "center"; ctx.textBaseline = "middle";
          ctx.fillText(el.val, ex, ey);
        } else if (el.type === "sfx") {
          ctx.save();
          ctx.translate(ex, ey);
          if (el.rot) ctx.rotate(el.rot * Math.PI / 180);
          ctx.font = "700 " + (34 * sc) + "px 'Bangers','Fredoka',sans-serif";
          ctx.textAlign = "center"; ctx.textBaseline = "middle";
          ctx.lineWidth = Math.max(3, 34 * sc * 0.12); ctx.strokeStyle = INK; ctx.lineJoin = "round";
          ctx.strokeText(el.val, 0, 0);
          ctx.fillStyle = "#ffd23f"; ctx.fillText(el.val, 0, 0);
          ctx.restore();
        } else { // speech / thought bubble — draw from the live node geometry
          var node = cell.querySelector('.cb-el[data-el="' + panel.els.indexOf(el) + '"] .cb-bubble');
          var br = node ? node.getBoundingClientRect() : null;
          var bw = br ? br.width : 90, bh = br ? br.height : 36;
          var bx = ex - bw / 2, by = ey - bh / 2;
          ctx.fillStyle = "#ffffff"; ctx.lineWidth = 3; ctx.strokeStyle = INK;
          var rr = el.type === "thought" ? Math.min(bw, bh) / 2 : 16;
          roundRectPath(ctx, bx, by, bw, bh, rr);
          ctx.fill(); ctx.stroke();
          // tail
          if (el.type === "speech") {
            ctx.beginPath();
            ctx.moveTo(bx + 22, by + bh - 1);
            ctx.lineTo(bx + 18, by + bh + 13);
            ctx.lineTo(bx + 36, by + bh - 1);
            ctx.closePath();
            ctx.fillStyle = "#ffffff"; ctx.fill();
            ctx.beginPath();
            ctx.moveTo(bx + 22, by + bh - 1); ctx.lineTo(bx + 18, by + bh + 13);
            ctx.moveTo(bx + 18, by + bh + 13); ctx.lineTo(bx + 36, by + bh - 1);
            ctx.strokeStyle = INK; ctx.stroke();
          }
          // text
          ctx.fillStyle = INK; ctx.textAlign = "center"; ctx.textBaseline = "middle";
          ctx.font = "600 " + (15 * sc) + "px 'Nunito',sans-serif";
          var txt = (el.text || "");
          var maxW = bw - 14;
          var words = txt.split(/\s+/), lines = [], line = "";
          words.forEach(function (wd) {
            var test = line ? line + " " + wd : wd;
            if (ctx.measureText(test).width > maxW && line) { lines.push(line); line = wd; }
            else line = test;
          });
          if (line) lines.push(line);
          var lh = 17 * sc;
          var sy = ey - (lines.length - 1) * lh / 2;
          lines.forEach(function (ln, i) { ctx.fillText(ln, ex, sy + i * lh); });
        }
      });
    });

    // comic title banner
    var titleText = (comic.title || titleField.value || "").trim();
    if (titleText) {
      ctx.font = "700 26px 'Bangers','Fredoka',sans-serif";
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      var tw = Math.min(ctx.measureText(titleText).width + 40, w * 0.9);
      var thh = 38, tx = w / 2 - tw / 2, ty = 2;
      ctx.fillStyle = "#ffd23f"; ctx.strokeStyle = INK; ctx.lineWidth = 3;
      roundRectPath(ctx, tx, ty, tw, thh, 10); ctx.fill(); ctx.stroke();
      ctx.fillStyle = INK; ctx.fillText(titleText, w / 2, ty + thh / 2 + 2);
    }

    function finish(href, revoke) {
      var a = document.createElement("a");
      a.download = (comic.title || "my-comic").replace(/[^a-z0-9]+/gi, "-").toLowerCase().replace(/^-+|-+$/g, "") + ".png" || "my-comic.png";
      a.href = href; a.click();
      if (revoke) setTimeout(function () { URL.revokeObjectURL(href); }, 1000);
      toast("Comic downloaded! 🎉");
    }
    try {
      if (cv.toBlob) {
        cv.toBlob(function (b) {
          if (b) finish(URL.createObjectURL(b), true);
          else finish(cv.toDataURL("image/png"), false);
        }, "image/png");
      } else {
        finish(cv.toDataURL("image/png"), false);
      }
    } catch (e) {
      toast("Couldn't make a PNG — use Print → Save as PDF instead.");
    }
  }

  /* ---------------- Library modal ---------------- */
  function openLib() {
    var list = loadLib().sort(function (a, b) { return (b.updated || 0) - (a.updated || 0); });
    var box = $("cbLibList"); box.innerHTML = "";
    $("cbLibEmpty").style.display = list.length ? "none" : "block";
    list.forEach(function (c) {
      var panels = 0; (c.pages || []).forEach(function (p) { panels += (p.panels || []).length; });
      var item = document.createElement("div");
      item.className = "cb-libitem";
      item.innerHTML =
        '<div class="prev">' + (c.cover || "📖") + '</div>' +
        '<div class="body"><h4>' + escapeHtml(c.title || "Untitled Comic") + '</h4>' +
        '<div class="meta">' + (c.pages ? c.pages.length : 1) + ' page · ' + panels + ' panels</div>' +
        '<div class="acts"><button class="open">Open</button><button class="del">Delete</button></div></div>';
      item.querySelector(".open").addEventListener("click", function () { loadComic(c.id); closeLib(); });
      item.querySelector(".del").addEventListener("click", function () { delComic(c.id); openLib(); });
      box.appendChild(item);
    });
    $("cbLibModal").classList.add("show");
  }
  function closeLib() { $("cbLibModal").classList.remove("show"); }
  function delComic(id) {
    var list = loadLib().filter(function (x) { return x.id !== id; });
    writeLib(list);
    toast("Comic deleted");
  }
  function loadComic(id) {
    var found = loadLib().filter(function (x) { return x.id === id; })[0];
    if (!found) return;
    comic = JSON.parse(JSON.stringify(found));
    curPage = 0; selPanel = 0; selEl = null;
    titleField.value = comic.title || "";
    syncLayoutChooser();
    render();
    toast("Loaded: " + (comic.title || "your comic"));
  }

  /* ---------------- Layout chooser ---------------- */
  function syncLayoutChooser() {
    var cur = comic.pages[curPage].layout;
    [].forEach.call(document.querySelectorAll("#cbLayouts .cb-lyt"), function (b) {
      b.classList.toggle("sel", b.dataset.layout === cur);
    });
  }
  function changeLayout(layout) {
    var page = comic.pages[curPage];
    if (page.layout === layout) return;
    var old = page.panels;
    page.layout = layout;
    page.panels = makePanels(layout);
    // keep as much old content as fits
    for (var i = 0; i < page.panels.length && i < old.length; i++) page.panels[i] = old[i];
    // if shrinking, move overflow elements into last panel so nothing is lost
    if (old.length > page.panels.length) {
      var last = page.panels[page.panels.length - 1];
      for (var j = page.panels.length; j < old.length; j++) {
        old[j].els.forEach(function (e) { last.els.push(e); });
      }
    }
    selPanel = 0; selEl = null;
    syncLayoutChooser();
    render();
    autosave();
  }

  /* ---------------- Wire up ---------------- */
  function init() {
    // Initialize comic from URL (?id= / ?layout= / ?spark=)
    var params = new URLSearchParams(location.search);
    var id = params.get("id");
    var layout = params.get("layout");
    var spark = params.get("spark");
    if (layout && !LAYOUTS[layout]) layout = null;

    if (id) {
      var found = loadLib().filter(function (x) { return x.id === id; })[0];
      comic = found ? JSON.parse(JSON.stringify(found)) : newComic(layout || "4");
    } else {
      comic = newComic(layout || "4");
    }
    titleField.value = comic.title || "";

    buildTrays();
    syncLayoutChooser();
    render();

    // spark → show a matching idea
    if (spark) { aiIdea(); }

    // layout buttons
    [].forEach.call(document.querySelectorAll("#cbLayouts .cb-lyt"), function (b) {
      b.addEventListener("click", function () { changeLayout(b.dataset.layout); });
    });

    titleField.addEventListener("input", function () {
      // live-update the title banner without full re-render churn
      var existing = stage.querySelector(".cb-comic-title");
      var txt = titleField.value.trim();
      if (txt) {
        if (!existing) { render(); } else { existing.textContent = txt; }
      } else if (existing) { existing.remove(); }
      autosave();
    });

    $("cbAddSpeech").addEventListener("click", function () { addEl({ type: "speech", text: "Hi!" }); });
    $("cbAddThought").addEventListener("click", function () { addEl({ type: "thought", text: "Hmm..." }); });

    $("cbIdeaBtn").addEventListener("click", aiIdea);
    $("cbNextBtn").addEventListener("click", aiNext);

    $("cbAddPage").addEventListener("click", function () {
      comic.pages.push(newPage(comic.pages[curPage].layout));
      curPage = comic.pages.length - 1; selPanel = 0; selEl = null;
      syncLayoutChooser(); render(); autosave(); toast("Page added");
    });
    $("cbDelPage").addEventListener("click", function () {
      if (comic.pages.length <= 1) { toast("Keep at least one page"); return; }
      comic.pages.splice(curPage, 1);
      curPage = Math.max(0, curPage - 1); selPanel = 0; selEl = null;
      syncLayoutChooser(); render(); autosave(); toast("Page deleted");
    });

    $("cbSave").addEventListener("click", function () { persist(); toast("Saved to your library! 💾"); });
    $("cbPrint").addEventListener("click", function () { persist(); selectEl(null); window.print(); });
    $("cbPng").addEventListener("click", exportPng);

    $("cbLibBtn").addEventListener("click", openLib);
    $("cbLibClose").addEventListener("click", closeLib);
    $("cbLibModal").addEventListener("click", function (e) { if (e.target === $("cbLibModal")) closeLib(); });

    // click empty stage / outside to deselect element
    stage.addEventListener("pointerdown", function (e) {
      if (e.target === stage) selectEl(null);
    });
    // keyboard delete
    document.addEventListener("keydown", function (e) {
      if ((e.key === "Delete" || e.key === "Backspace") && selEl && !isEditingText()) {
        e.preventDefault();
        deleteEl(selEl.pi, selEl.ei);
      }
    });
    function isEditingText() {
      var a = document.activeElement;
      return a && (a.isContentEditable || a.tagName === "INPUT" || a.tagName === "TEXTAREA");
    }

    // re-render on resize so % positions stay crisp (positions are %, so cheap)
    window.addEventListener("resize", function () { /* % based, no action needed */ });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
