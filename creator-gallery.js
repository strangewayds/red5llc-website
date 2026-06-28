/* =======================================================================
   Creator Gallery (Create & Share) — Red 5
   A fully MODERATED, parent-approved showcase. NOT social media:
   no followers, friends, messaging, profiles or public comments.
   Only safe reactions + a simulated submit/parent-approval flow.
   All state (reactions + the kid's own creations) lives in localStorage.
   Vanilla JS, zero dependencies. Works via file:// and localhost:5500.
   ======================================================================= */
(function () {
  "use strict";

  var LS_REACTS = "red5_gallery_reactions";   // { creationId: { reactKey: count } }
  var LS_MINE   = "red5_gallery_mine";         // [ { id,title,type,cat,nick,ava,img,status,ts } ]

  /* ---- safe reaction set (NO comments anywhere) ---- */
  var REACTIONS = [
    { key: "amazing",  em: "⭐", label: "Amazing" },
    { key: "love",     em: "❤️", label: "Love It" },
    { key: "creative", em: "🎨", label: "Creative" },
    { key: "inspiring",em: "🌟", label: "Inspiring" },
    { key: "greatjob", em: "👏", label: "Great Job" },
    { key: "smile",    em: "😊", label: "Made Me Smile" }
  ];

  /* ---- categories (chips) ---- */
  var CATEGORIES = [
    "All", "Artwork", "Stories", "Comics", "Crafts", "Buddy Designs",
    "Sticker Packs", "Printables", "Kindness Cards", "Monthly Challenge Winners", "Rosie Picks"
  ];

  /* ---- creation types for the submit modal ---- */
  var TYPES = [
    { key: "Artwork",        em: "🎨", samples: ["assets/cg-unicorn.png","assets/cg-starry.png","assets/cg-cat.png"] },
    { key: "Story",          em: "📖", samples: ["assets/sc-hero-book.png"] },
    { key: "Comic",          em: "💬", samples: ["assets/cg-superhero.png"] },
    { key: "Craft",          em: "✂️", samples: ["assets/craft-butterfly.png","assets/craft-rainbow.png","assets/cg-dragon.png"] },
    { key: "Buddy Design",   em: "🧸", samples: ["assets/cz-buddy.png"] },
    { key: "Sticker Pack",   em: "⭐", samples: ["assets/ss-space.png","assets/ss-animals.png"] },
    { key: "Printable",      em: "🖨️", samples: ["assets/pa-space.png","assets/pa-dino.png"] },
    { key: "Kindness Card",  em: "💌", samples: ["assets/kc-amazing.png","assets/kc-thankyou.png"] }
  ];

  /* ---- safe display avatars (emoji buddies — never real photos) ---- */
  function ava() { return ["🦊","🐉","🦄","🐱","🐢","🦋","🐧","🐰","🦉","⭐","🌈","🚀"]; }

  /* =========================================================
     Sample creations (~16). The "creator" is shown ONLY as a
     first-name/nickname + emoji buddy — no last names, no photos.
     "appreciated" seeds a starting count of total reactions.
     ========================================================= */
  var SAMPLES = [
    { id:"s01", title:"Starry Night Adventure", cat:"Artwork", img:"assets/cg-starry.png", nick:"Luna", ava:"🦊", rosie:true,  featured:true,  appreciated:128, ts:60 },
    { id:"s02", title:"Super Hero in Training",  cat:"Comics", img:"assets/cg-superhero.png", nick:"Max", ava:"🦸", rosie:false, featured:true,  appreciated:96,  ts:59 },
    { id:"s03", title:"Rainbow Dreams",          cat:"Artwork", img:"assets/cg-unicorn.png", nick:"Chloe", ava:"🦄", rosie:true,  featured:false, appreciated:142, ts:58 },
    { id:"s04", title:"Sir Sparkle the Dragon",  cat:"Crafts",  img:"assets/cg-dragon.png", nick:"Eli", ava:"🐉", rosie:false, featured:false, appreciated:74,  ts:57 },
    { id:"s05", title:"Happy Rainbow Cat",       cat:"Artwork", img:"assets/cg-cat.png", nick:"Mia", ava:"🐱", rosie:true,  featured:false, appreciated:88,  ts:56 },
    { id:"s06", title:"Butterfly Garden Craft",  cat:"Crafts",  img:"assets/craft-butterfly.png", nick:"Sam", ava:"🦋", rosie:false, featured:false, appreciated:53,  ts:55 },
    { id:"s07", title:"Glow Lava Lamp",          cat:"Crafts",  img:"assets/craft-lava.png", nick:"Theo", ava:"🧪", rosie:false, featured:false, appreciated:41,  ts:54 },
    { id:"s08", title:"Space Explorers Pack",    cat:"Sticker Packs", img:"assets/ss-space.png", nick:"Ava", ava:"🚀", rosie:false, featured:true,  appreciated:67,  ts:53 },
    { id:"s09", title:"Animal Friends Stickers", cat:"Sticker Packs", img:"assets/ss-animals.png", nick:"Noah", ava:"🐧", rosie:false, featured:false, appreciated:34,  ts:52 },
    { id:"s10", title:"My Space Story",          cat:"Stories", img:"assets/sc-hero-book.png", nick:"Zoe", ava:"📚", rosie:false, featured:false, appreciated:59,  ts:51 },
    { id:"s11", title:"Treasure Map Maze",       cat:"Printables", img:"assets/pa-treasure.png", nick:"Leo", ava:"🗺️", rosie:false, featured:false, appreciated:28,  ts:50 },
    { id:"s12", title:"Dino World Activity",     cat:"Printables", img:"assets/pa-dino.png", nick:"Ivy", ava:"🦕", rosie:false, featured:false, appreciated:45,  ts:49 },
    { id:"s13", title:"You Are Amazing!",        cat:"Kindness Cards", img:"assets/kc-amazing.png", nick:"Ruby", ava:"💛", rosie:true,  featured:false, appreciated:112, ts:48 },
    { id:"s14", title:"Thank You, Teacher",      cat:"Kindness Cards", img:"assets/kc-thankyou.png", nick:"Finn", ava:"🌟", rosie:false, featured:false, appreciated:38,  ts:47 },
    { id:"s15", title:"Best Friends Forever",    cat:"Buddy Designs", img:"assets/cz-buddy.png", nick:"Nina", ava:"🐰", rosie:false, featured:false, appreciated:62,  ts:46 },
    { id:"s16", title:"March Challenge Winner",  cat:"Monthly Challenge Winners", img:"assets/mc-mascots.png", nick:"Owen", ava:"🏆", rosie:true,  featured:true,  appreciated:151, ts:45 },
    { id:"s17", title:"Unicorn Castle Quest",    cat:"Comics", img:"assets/cz-comic.png", nick:"Lily", ava:"🏰", rosie:false, featured:false, appreciated:49,  ts:44 },
    { id:"s18", title:"Pet Detective Pages",     cat:"Printables", img:"assets/pa-petdetective.png", nick:"Jack", ava:"🔍", rosie:false, featured:false, appreciated:31,  ts:43 }
  ];

  /* ----------------- storage helpers ----------------- */
  function load(key, fallback) {
    try { var v = JSON.parse(localStorage.getItem(key)); return v == null ? fallback : v; }
    catch (e) { return fallback; }
  }
  function save(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) {}
  }
  function toast(msg) { if (window.RED5_TOAST) window.RED5_TOAST(msg); }

  var reactState = load(LS_REACTS, {});
  var mine = load(LS_MINE, []);

  /* total reaction count for a creation (seed + user clicks) */
  function totalReacts(c) {
    var t = c.appreciated || 0;
    var r = reactState[c.id];
    if (r) for (var k in r) if (r.hasOwnProperty(k)) t += r[k];
    return t;
  }

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"]/g, function (m) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[m];
    });
  }

  /* ----------------- render a gallery card ----------------- */
  function reactsHtml(c) {
    var r = reactState[c.id] || {};
    var out = '<p class="react-title">Send a kind reaction</p><div class="reacts">';
    REACTIONS.forEach(function (re) {
      var n = r[re.key] || 0;
      out += '<button class="react' + (n ? " on" : "") + '" data-react="' + re.key +
        '" data-cid="' + c.id + '" title="' + re.label + '" aria-label="' + re.label + '">' +
        '<span class="em">' + re.em + '</span>' + (n ? '<span class="n">' + n + "</span>" : "") +
        "</button>";
    });
    out += "</div>";
    return out;
  }

  function cardHtml(c) {
    var ribbon = "";
    if (c.rosie) ribbon = '<span class="ribbon rosie">🌟 Rosie\'s Pick</span>';
    else if (c.featured) ribbon = '<span class="ribbon">⭐ Featured</span>';
    return '<article class="gal-card" data-cardid="' + c.id + '">' +
      ribbon +
      '<div class="gal-thumb"><img src="' + esc(c.img) + '" alt="' + esc(c.title) + '" loading="lazy"></div>' +
      '<div class="gal-body">' +
        '<span class="gal-cat">' + esc(c.cat) + "</span>" +
        "<h3>" + esc(c.title) + "</h3>" +
        '<div class="gal-creator"><span class="ava">' + (c.ava || "🙂") + "</span>" +
          '<span class="cname">by ' + esc(c.nick) + "</span></div>" +
        reactsHtml(c) +
      "</div></article>";
  }

  /* ----------------- BROWSE: chips, sort, search ----------------- */
  var activeCat = "All";
  var activeSort = "newest";
  var searchTerm = "";

  function buildChips() {
    var wrap = document.getElementById("galChips");
    if (!wrap) return;
    wrap.innerHTML = CATEGORIES.map(function (cat) {
      return '<button class="chip' + (cat === activeCat ? " active" : "") +
        '" data-cat="' + esc(cat) + '">' + esc(cat) + "</button>";
    }).join("");
  }

  function filteredSamples() {
    var list = SAMPLES.slice();
    if (activeCat === "Rosie Picks") list = list.filter(function (c) { return c.rosie; });
    else if (activeCat !== "All") list = list.filter(function (c) { return c.cat === activeCat; });

    if (searchTerm) {
      var q = searchTerm.toLowerCase();
      list = list.filter(function (c) {
        return c.title.toLowerCase().indexOf(q) > -1 ||
               c.cat.toLowerCase().indexOf(q) > -1 ||
               c.nick.toLowerCase().indexOf(q) > -1;
      });
    }

    if (activeSort === "newest") list.sort(function (a, b) { return b.ts - a.ts; });
    else if (activeSort === "featured") list.sort(function (a, b) {
      return (b.rosie ? 2 : b.featured ? 1 : 0) - (a.rosie ? 2 : a.featured ? 1 : 0) || b.ts - a.ts;
    });
    else if (activeSort === "appreciated") list.sort(function (a, b) { return totalReacts(b) - totalReacts(a); });
    return list;
  }

  function renderGrid() {
    var grid = document.getElementById("galGrid");
    var count = document.getElementById("galCount");
    if (!grid) return;
    var list = filteredSamples();
    if (count) count.textContent = list.length + (list.length === 1 ? " creation" : " creations") +
      (activeCat === "All" ? "" : " in " + activeCat);
    if (!list.length) {
      grid.innerHTML = '<div class="gal-empty"><span class="big">🔍</span>No creations match that yet. Try another category or search.</div>';
      return;
    }
    grid.innerHTML = list.map(cardHtml).join("");
  }

  function renderRosieStrip() {
    var row = document.getElementById("rosieRow");
    if (!row) return;
    row.innerHTML = SAMPLES.filter(function (c) { return c.rosie; }).map(cardHtml).join("");
  }

  /* ----------------- reactions (delegated) ----------------- */
  function onReactClick(cid, key, btn) {
    if (!reactState[cid]) reactState[cid] = {};
    var r = reactState[cid];
    if (r[key]) {            // toggle off
      delete r[key];
      btn.classList.remove("on");
      var n0 = btn.querySelector(".n"); if (n0) n0.remove();
    } else {                 // add one reaction
      r[key] = 1;
      btn.classList.add("on");
      var n1 = btn.querySelector(".n");
      if (!n1) { n1 = document.createElement("span"); n1.className = "n"; btn.appendChild(n1); }
      n1.textContent = "1";
      toast("Thanks for spreading kindness! 💛");
    }
    save(LS_REACTS, reactState);
  }

  /* ----------------- MY GALLERY ----------------- */
  var mineFilter = "all";

  function statusLabel(s) { return s === "published" ? "Published" : s === "pending" ? "Pending Approval" : "Draft"; }

  function renderMyStats() {
    var wrap = document.getElementById("myStats");
    if (!wrap) return;
    var pub = mine.filter(function (m) { return m.status === "published"; }).length;
    var pen = mine.filter(function (m) { return m.status === "pending"; }).length;
    var dra = mine.filter(function (m) { return m.status === "draft"; }).length;
    wrap.innerHTML =
      '<div class="mstat"><div class="num">' + mine.length + '</div><div class="lab">Total creations</div></div>' +
      '<div class="mstat"><div class="num">' + pub + '</div><div class="lab">Published</div></div>' +
      '<div class="mstat"><div class="num">' + pen + '</div><div class="lab">Waiting for approval</div></div>' +
      '<div class="mstat"><div class="num">' + dra + '</div><div class="lab">Drafts</div></div>';
  }

  function myCardHtml(m) {
    return '<article class="gal-card" data-mineid="' + m.id + '">' +
      '<span class="badge-status ' + m.status + '">' + statusLabel(m.status) + "</span>" +
      '<div class="gal-thumb"><img src="' + esc(m.img) + '" alt="' + esc(m.title) + '" loading="lazy"></div>' +
      '<div class="gal-body">' +
        '<span class="gal-cat">' + esc(m.type) + "</span>" +
        "<h3>" + esc(m.title) + "</h3>" +
        '<div class="gal-creator"><span class="ava">' + (m.ava || "🙂") + "</span>" +
          '<span class="cname">by ' + esc(m.nick || "You") + "</span></div>" +
        '<div class="mygal-actions">' +
          '<button class="mini-btn" data-print="' + m.id + '">🖨️ Print</button>' +
          (m.status === "draft"   ? '<button class="mini-btn" data-submitdraft="' + m.id + '">Submit</button>' : "") +
          (m.status === "pending" ? '<button class="mini-btn" data-approve="' + m.id + '">Approve</button>' : "") +
          '<button class="mini-btn danger" data-del="' + m.id + '">Delete</button>' +
        "</div>" +
      "</div></article>";
  }

  function renderMine() {
    renderMyStats();
    var grid = document.getElementById("myGrid");
    if (!grid) return;
    var list = mineFilter === "all" ? mine : mine.filter(function (m) { return m.status === mineFilter; });
    if (!list.length) {
      grid.innerHTML = '<div class="gal-empty"><span class="big">🎨</span>' +
        (mine.length ? "Nothing here yet in this tab." :
          "You haven't added a creation yet. Tap <b>Submit Creation</b> to share something you made!") +
        "</div>";
      return;
    }
    grid.innerHTML = list.map(myCardHtml).join("");
  }

  function printItem(m) {
    var w = window.open("", "_blank", "width=720,height=820");
    if (!w) { toast("Please allow pop-ups to print."); return; }
    w.document.write(
      '<!doctype html><html><head><title>' + esc(m.title) + '</title>' +
      '<style>body{font-family:Nunito,Segoe UI,sans-serif;text-align:center;padding:32px;color:#1f2a44}' +
      'h1{font-family:Fredoka,sans-serif}img{max-width:90%;max-height:60vh;border-radius:16px;box-shadow:0 8px 24px rgba(0,0,0,.18);margin:16px 0}' +
      '.cat{color:#6c5ce7;font-weight:700;text-transform:uppercase;letter-spacing:.05em;font-size:.8rem}' +
      '.by{color:#5b6678}</style></head><body>' +
      '<p class="cat">' + esc(m.type) + '</p><h1>' + esc(m.title) + "</h1>" +
      '<img src="' + esc(m.img) + '" alt="' + esc(m.title) + '">' +
      '<p class="by">Created by ' + esc(m.nick || "You") + ' on Red 5</p>' +
      "</body></html>");
    w.document.close();
    setTimeout(function () { w.focus(); w.print(); }, 350);
  }

  /* ----------------- view switching ----------------- */
  function showView(name) {
    document.querySelectorAll('[data-view]').forEach(function (v) {
      v.classList.toggle("active", v.getAttribute("data-view") === name);
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
    if (name === "mine") renderMine();
  }

  /* ----------------- SUBMIT MODAL ----------------- */
  var draft = { type: null, title: "", nick: "", img: "" };

  function buildTypeGrid() {
    var grid = document.getElementById("typeGrid");
    if (!grid) return;
    grid.innerHTML = TYPES.map(function (t) {
      return '<div class="type-opt" data-type="' + esc(t.key) + '">' +
        '<span class="te">' + t.em + "</span>" + esc(t.key) + "</div>";
    }).join("");
  }

  function buildSamplePick(typeKey) {
    var wrap = document.getElementById("samplePick");
    if (!wrap) return;
    var t = TYPES.filter(function (x) { return x.key === typeKey; })[0];
    var samples = (t && t.samples) || ["assets/cg-unicorn.png", "assets/cg-starry.png", "assets/cg-cat.png"];
    wrap.innerHTML = samples.map(function (s) {
      return '<img src="' + esc(s) + '" alt="sample" data-sample="' + esc(s) + '">';
    }).join("");
  }

  function openModal() {
    draft = { type: null, title: "", nick: "", img: "" };
    document.getElementById("smStep1").style.display = "";
    document.getElementById("smStep2").style.display = "none";
    document.getElementById("smStep3").style.display = "none";
    document.getElementById("smTitleInput").value = "";
    document.getElementById("smNick").value = "";
    document.querySelectorAll(".type-opt").forEach(function (o) { o.classList.remove("sel"); });
    document.getElementById("samplePick").innerHTML = "";
    document.getElementById("submitModal").classList.add("open");
    document.getElementById("submitModal").setAttribute("aria-hidden", "false");
  }
  function closeModal() {
    document.getElementById("submitModal").classList.remove("open");
    document.getElementById("submitModal").setAttribute("aria-hidden", "true");
  }

  function runModeration() {
    document.getElementById("smStep1").style.display = "none";
    document.getElementById("smStep2").style.display = "";
    var lines = ["mod1", "mod2", "mod3"];
    var buttons = document.getElementById("modButtons");
    buttons.style.display = "none";
    lines.forEach(function (id) { document.getElementById(id).classList.remove("done"); });
    var i = 0;
    (function step() {
      if (i >= lines.length) { buttons.style.display = "flex"; return; }
      var el = document.getElementById(lines[i]);
      el.classList.add("done");
      el.querySelector(".dot").textContent = "✓";
      i++;
      setTimeout(step, 750);
    })();
  }

  function finishSubmit(status) {
    var item = {
      id: "m" + Date.now(),
      title: draft.title || "My Creation",
      type: draft.type || "Artwork",
      cat: draft.type || "Artwork",
      nick: draft.nick || "You",
      ava: ava()[Math.floor(Math.random() * ava().length)],
      img: draft.img || "assets/cg-unicorn.png",
      status: status,
      ts: Date.now()
    };
    mine.unshift(item);
    save(LS_MINE, mine);

    document.getElementById("smStep2").style.display = "none";
    document.getElementById("smStep3").style.display = "";
    var title = document.getElementById("smResultTitle");
    var msg = document.getElementById("smResultMsg");
    if (status === "published") {
      title.textContent = "Published to your gallery! 🎉";
      msg.textContent = "Your parent approved it. You'll find it in My Gallery marked Published.";
    } else {
      title.textContent = "Saved as a Draft 📝";
      msg.textContent = "It's saved in My Gallery. You can submit it for parent approval anytime.";
    }
  }

  /* ----------------- wiring ----------------- */
  function wire() {
    buildChips();
    renderRosieStrip();
    renderGrid();
    buildTypeGrid();

    // hero / cta buttons that switch views
    document.querySelectorAll("[data-go]").forEach(function (b) {
      b.addEventListener("click", function () { showView(b.getAttribute("data-go")); });
    });

    // open submit modal
    ["openSubmit", "openSubmit2"].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.addEventListener("click", openModal);
    });

    // chips
    var chips = document.getElementById("galChips");
    if (chips) chips.addEventListener("click", function (e) {
      var b = e.target.closest("[data-cat]"); if (!b) return;
      activeCat = b.getAttribute("data-cat");
      buildChips(); renderGrid();
    });

    // sort + search
    var sort = document.getElementById("galSort");
    if (sort) sort.addEventListener("change", function () { activeSort = sort.value; renderGrid(); });
    var search = document.getElementById("galSearch");
    if (search) search.addEventListener("input", function () { searchTerm = search.value.trim(); renderGrid(); });

    // reactions (delegated across browse grid + rosie strip)
    document.addEventListener("click", function (e) {
      var rb = e.target.closest("[data-react]");
      if (rb) { onReactClick(rb.getAttribute("data-cid"), rb.getAttribute("data-react"), rb); return; }
    });

    // My Gallery filter tabs
    var mtabs = document.getElementById("myFilterTabs");
    if (mtabs) mtabs.addEventListener("click", function (e) {
      var b = e.target.closest("[data-mine]"); if (!b) return;
      mineFilter = b.getAttribute("data-mine");
      mtabs.querySelectorAll(".gal-tab").forEach(function (t) { t.classList.remove("active"); });
      b.classList.add("active");
      renderMine();
    });

    // My Gallery item actions (delegated)
    var myGrid = document.getElementById("myGrid");
    if (myGrid) myGrid.addEventListener("click", function (e) {
      var btn = e.target.closest("button"); if (!btn) return;
      var id, item;
      if ((id = btn.getAttribute("data-print"))) {
        item = mine.filter(function (m) { return m.id === id; })[0];
        if (item) printItem(item);
      } else if ((id = btn.getAttribute("data-del"))) {
        mine = mine.filter(function (m) { return m.id !== id; });
        save(LS_MINE, mine); renderMine(); toast("Creation removed.");
      } else if ((id = btn.getAttribute("data-submitdraft"))) {
        item = mine.filter(function (m) { return m.id === id; })[0];
        if (item) { item.status = "pending"; save(LS_MINE, mine); renderMine(); toast("Sent to your parent for approval. ✓"); }
      } else if ((id = btn.getAttribute("data-approve"))) {
        item = mine.filter(function (m) { return m.id === id; })[0];
        if (item) { item.status = "published"; save(LS_MINE, mine); renderMine(); toast("Approved & published! 🎉"); }
      }
    });

    // ===== modal interactions =====
    var typeGrid = document.getElementById("typeGrid");
    if (typeGrid) typeGrid.addEventListener("click", function (e) {
      var o = e.target.closest("[data-type]"); if (!o) return;
      draft.type = o.getAttribute("data-type");
      typeGrid.querySelectorAll(".type-opt").forEach(function (x) { x.classList.remove("sel"); });
      o.classList.add("sel");
      buildSamplePick(draft.type);
    });

    var samplePick = document.getElementById("samplePick");
    if (samplePick) samplePick.addEventListener("click", function (e) {
      var img = e.target.closest("[data-sample]"); if (!img) return;
      draft.img = img.getAttribute("data-sample");
      samplePick.querySelectorAll("img").forEach(function (x) { x.classList.remove("sel"); });
      img.classList.add("sel");
    });

    var uploadZone = document.getElementById("uploadZone");
    if (uploadZone) uploadZone.addEventListener("click", function () {
      toast("This is a demo — pick one of the sample pictures below. 🙂");
    });

    document.getElementById("smClose").addEventListener("click", closeModal);
    document.getElementById("smCancel").addEventListener("click", closeModal);
    document.getElementById("submitModal").addEventListener("click", function (e) {
      if (e.target.id === "submitModal") closeModal();
    });

    document.getElementById("smNext").addEventListener("click", function () {
      draft.title = document.getElementById("smTitleInput").value.trim();
      draft.nick = document.getElementById("smNick").value.trim();
      if (!draft.type) { toast("Pick what you made first. 🎨"); return; }
      if (!draft.title) { toast("Give your creation a title."); return; }
      if (!draft.nick) { toast("Add a gallery name (first name or nickname)."); return; }
      if (!draft.img) { toast("Pick a sample picture to share."); return; }
      runModeration();
    });

    document.getElementById("smApprove").addEventListener("click", function () { finishSubmit("published"); });
    document.getElementById("smSaveDraft").addEventListener("click", function () { finishSubmit("draft"); });
    document.getElementById("smViewMine").addEventListener("click", function () { closeModal(); showView("mine"); });
    document.getElementById("smDone").addEventListener("click", function () {
      closeModal();
      if (document.querySelector('[data-view="mine"].active')) renderMine();
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", wire);
  else wire();
})();
