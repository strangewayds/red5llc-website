/* =========================================================================
   Printable Adventures — shared data + library/detail behavior
   Self-contained. Does NOT modify app.js or styles.css.
   Uses window.RED5_TOAST when available (set by app.js).
   ========================================================================= */
(function () {
  "use strict";

  /* ---- Adventure library data ------------------------------------------ */
  // Each pack: id, title, cover, ages, time, pages[], difficulty, cats[],
  // club (premium), description, supplies[], and a few sample activity bits
  // used to build the printable sheet on the detail page.
  var PACKS = [
    {
      id: "treasure",
      title: "Backyard Treasure Hunt",
      cover: "assets/pa-treasure.png",
      ages: "8–12",
      time: "30–40 min",
      pageCount: 8,
      difficulty: "Easy",
      cats: ["Scavenger Hunts", "Activity Packs", "Nature", "Travel"],
      club: false,
      blurb: "Grab a map and a compass — there's hidden treasure somewhere in your own backyard! Follow the clues, solve the riddles and mark the spot with an X.",
      pages: ["Treasure map to follow", "Clue cards (cut out)", "Riddle challenge", "Compass craft", "Found-it sticker chart", "Explorer certificate"],
      supplies: ["Pencil", "Scissors", "Clipboard", "A small prize to hide"],
      words: ["MAP", "COMPASS", "CLUE", "CHEST", "GOLD", "RIDDLE", "EXPLORE", "DIG"],
      checklist: ["Find the old oak tree", "Look under something round", "Count 10 steps north", "Search where water sits", "X marks the spot!"]
    },
    {
      id: "dino",
      title: "Dinosaur Adventure Pack",
      cover: "assets/pa-dino.png",
      ages: "7–12",
      time: "45–60 min",
      pageCount: 12,
      difficulty: "Medium",
      cats: ["Activity Packs", "Coloring Books", "STEM", "Animals", "Word Searches"],
      club: false,
      blurb: "Travel back millions of years! Meet the mighty T-Rex, dig for fossils and become a real paleontologist with puzzles, facts and coloring pages.",
      pages: ["Dino coloring pages", "Fossil dig maze", "Dinosaur word search", "Roar-some facts", "Match the dino", "Paleontologist badge"],
      supplies: ["Markers", "Pencils", "Crayons"],
      words: ["TREX", "FOSSIL", "ROAR", "STEGO", "RAPTOR", "BONES", "JURASSIC", "EGG"],
      checklist: ["Color the T-Rex", "Find all 8 hidden words", "Solve the fossil maze", "Read 3 dino facts out loud", "Earn your badge"]
    },
    {
      id: "petdetective",
      title: "Pet Detective",
      cover: "assets/pa-petdetective.png",
      ages: "8–11",
      time: "30–45 min",
      pageCount: 10,
      difficulty: "Medium",
      cats: ["Escape Rooms", "Puzzle Books", "Trivia", "Animals", "Reading"],
      club: true,
      blurb: "A puppy has gone missing! Follow the paw prints, crack the codes and interview the suspects to solve the case of the missing pet.",
      pages: ["Case file & suspects", "Paw-print code breaker", "Secret message decoder", "Spot the clue puzzle", "Logic grid mystery", "Detective certificate"],
      supplies: ["Pencil", "Magnifying glass (optional)", "Eraser"],
      words: ["CLUE", "SUSPECT", "PAW", "CODE", "MYSTERY", "SOLVE", "CASE", "SNIFF"],
      checklist: ["Read the case file", "Follow the paw prints", "Decode the secret note", "Question all 3 suspects", "Name the culprit!"]
    },
    {
      id: "world",
      title: "Around the World",
      cover: "assets/pa-world.png",
      ages: "9–13",
      time: "45–60 min",
      pageCount: 14,
      difficulty: "Medium",
      cats: ["Trivia", "Activity Packs", "Travel", "STEM", "Word Searches"],
      club: false,
      blurb: "Pack your bags for a trip around the globe! Discover famous landmarks, flags, foods and fun facts from countries on every continent.",
      pages: ["World map activity", "Flags of the world", "Landmark trivia", "Continents word search", "Passport craft", "Globe-trotter award"],
      supplies: ["Colored pencils", "Scissors", "Glue", "Pencil"],
      words: ["GLOBE", "FLAG", "PARIS", "EGYPT", "JAPAN", "BRAZIL", "TRAVEL", "MAP"],
      checklist: ["Color your passport", "Match 5 flags", "Find the 7 continents", "Answer the trivia round", "Stamp your passport"]
    },
    {
      id: "nature",
      title: "Nature Explorer",
      cover: "assets/pa-nature.png",
      ages: "8–12",
      time: "30–45 min",
      pageCount: 10,
      difficulty: "Easy",
      cats: ["Scavenger Hunts", "Nature", "Activity Packs", "Mazes", "Animals"],
      club: false,
      blurb: "Head outside and explore the natural world! Spot birds and bugs, press a leaf and tick off everything you find on your nature walk.",
      pages: ["Nature scavenger checklist", "Leaf & bug spotting guide", "Bird-watching tally", "Forest maze", "Nature journal page", "Junior Ranger badge"],
      supplies: ["Clipboard", "Pencil", "A bag for treasures"],
      words: ["LEAF", "BIRD", "TREE", "BUG", "TRAIL", "FLOWER", "ROCK", "EXPLORE"],
      checklist: ["Find a smooth rock", "Spot a bird", "Collect a cool leaf", "Hear 3 nature sounds", "Draw what you saw"]
    },
    {
      id: "space",
      title: "Space Mission",
      cover: "assets/pa-space.png",
      ages: "8–13",
      time: "45–60 min",
      pageCount: 12,
      difficulty: "Hard",
      cats: ["STEM", "Puzzle Books", "Coloring Books", "Trivia", "Mazes"],
      club: true,
      blurb: "Blast off, astronaut! Pilot your rocket through the asteroid maze, name the planets and complete your training for the ultimate space mission.",
      pages: ["Solar system poster", "Astronaut coloring page", "Asteroid-field maze", "Planet trivia quiz", "Rocket-building plan", "Astronaut certificate"],
      supplies: ["Markers", "Pencils", "Crayons", "Scissors"],
      words: ["ROCKET", "PLANET", "STARS", "MOON", "ORBIT", "MARS", "GALAXY", "ALIEN"],
      checklist: ["Name all 8 planets", "Color the astronaut", "Fly through the maze", "Pass the space quiz", "Launch your rocket!"]
    }
  ];

  // Full category list for chips (order matters for the UI).
  var CATEGORIES = [
    "All", "Scavenger Hunts", "Puzzle Books", "Coloring Books", "Escape Rooms",
    "Activity Packs", "Mazes", "Word Searches", "Trivia", "STEM", "Nature",
    "Reading", "Seasonal", "Holiday", "Travel", "Animals"
  ];

  /* ---- Favorites (localStorage) ---------------------------------------- */
  var FAV_KEY = "red5_pa_favs";
  function getFavs() {
    try { return JSON.parse(localStorage.getItem(FAV_KEY)) || []; }
    catch (e) { return []; }
  }
  function isFav(id) { return getFavs().indexOf(id) !== -1; }
  function toggleFav(id) {
    var favs = getFavs();
    var i = favs.indexOf(id);
    if (i === -1) { favs.push(id); } else { favs.splice(i, 1); }
    try { localStorage.setItem(FAV_KEY, JSON.stringify(favs)); } catch (e) {}
    return favs.indexOf(id) !== -1;
  }

  function toast(msg) {
    if (window.RED5_TOAST) { window.RED5_TOAST(msg); }
    else { try { console.log(msg); } catch (e) {} }
  }

  function getPack(id) {
    for (var i = 0; i < PACKS.length; i++) { if (PACKS[i].id === id) return PACKS[i]; }
    return null;
  }

  /* Expose for the detail page */
  window.RED5_PA = {
    PACKS: PACKS, CATEGORIES: CATEGORIES,
    getFavs: getFavs, isFav: isFav, toggleFav: toggleFav,
    getPack: getPack, toast: toast
  };

  /* =====================================================================
     LIBRARY PAGE
     ===================================================================== */
  function initLibrary() {
    var grid = document.getElementById("paGrid");
    if (!grid) return; // not on the library page

    var chipsWrap = document.getElementById("paChips");
    var search = document.getElementById("paSearch");
    var emptyMsg = document.getElementById("paEmpty");
    var favOnlyBtn = document.getElementById("paFavToggle");

    var activeCat = "All";
    var favOnly = false;

    // Build category chips
    CATEGORIES.forEach(function (cat) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "pa-chip" + (cat === "All" ? " active" : "");
      b.textContent = cat;
      b.setAttribute("data-cat", cat);
      chipsWrap.appendChild(b);
    });

    function diffClass(d) {
      return "pa-diff " + (d === "Easy" ? "easy" : d === "Hard" ? "hard" : "med");
    }

    // Build one card
    function cardHTML(p) {
      var faved = isFav(p.id);
      return '' +
        '<article class="pa-card" data-id="' + p.id + '">' +
          '<a class="pa-cover" href="printable-detail.html?pack=' + p.id + '" aria-label="Open ' + p.title + '">' +
            '<img src="' + p.cover + '" alt="' + p.title + ' cover" loading="lazy">' +
            (p.club ? '<span class="pa-badge-club">★ Club</span>' : '') +
            '<span class="pa-badge-diff ' + (p.difficulty === "Easy" ? "easy" : p.difficulty === "Hard" ? "hard" : "med") + '">' + p.difficulty + '</span>' +
          '</a>' +
          '<button class="pa-heart' + (faved ? ' on' : '') + '" type="button" data-fav="' + p.id + '" aria-label="Save to favorites" title="Save to favorites">' +
            '<svg viewBox="0 0 24 24" width="20" height="20"><path d="M12 21s-7.5-4.6-10-9.1C.2 8.6 1.7 5 5.2 5c2 0 3.3 1.1 4 2.2C9.9 6.1 11.2 5 13.2 5c3.5 0 5 3.6 3.2 6.9C17.5 16.4 12 21 12 21z"/></svg>' +
          '</button>' +
          '<div class="pa-body">' +
            '<h3>' + p.title + '</h3>' +
            '<div class="pa-meta">' +
              '<span title="Recommended ages"><svg viewBox="0 0 24 24" width="14" height="14"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 4-6 8-6s8 2 8 6"/></svg>Ages ' + p.ages + '</span>' +
              '<span title="Time to complete"><svg viewBox="0 0 24 24" width="14" height="14"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>' + p.time + '</span>' +
            '</div>' +
            '<div class="pa-meta">' +
              '<span title="Pages included"><svg viewBox="0 0 24 24" width="14" height="14"><path d="M6 3h9l3 3v15H6z"/><path d="M9 8h6M9 12h6M9 16h4"/></svg>' + p.pageCount + ' pages</span>' +
              '<span class="' + diffClass(p.difficulty) + '">' + p.difficulty + '</span>' +
            '</div>' +
            '<div class="pa-tags">' + p.cats.slice(0, 3).map(function (c) { return '<span class="pa-tag">' + c + '</span>'; }).join('') + '</div>' +
            '<a class="pa-open" href="printable-detail.html?pack=' + p.id + '">' +
              '<svg viewBox="0 0 24 24" width="16" height="16"><path d="M12 3v12M7 10l5 5 5-5"/><path d="M5 21h14"/></svg> Open &amp; Print' +
            '</a>' +
          '</div>' +
        '</article>';
    }

    function render() {
      var q = (search.value || "").trim().toLowerCase();
      var list = PACKS.filter(function (p) {
        if (favOnly && !isFav(p.id)) return false;
        if (activeCat !== "All" && p.cats.indexOf(activeCat) === -1) return false;
        if (q) {
          var hay = (p.title + " " + p.blurb + " " + p.cats.join(" ")).toLowerCase();
          if (hay.indexOf(q) === -1) return false;
        }
        return true;
      });
      grid.innerHTML = list.map(cardHTML).join("");
      emptyMsg.style.display = list.length ? "none" : "block";
    }

    // Chip clicks
    chipsWrap.addEventListener("click", function (e) {
      var b = e.target.closest(".pa-chip");
      if (!b) return;
      activeCat = b.getAttribute("data-cat");
      chipsWrap.querySelectorAll(".pa-chip").forEach(function (c) { c.classList.remove("active"); });
      b.classList.add("active");
      render();
    });

    // Search
    search.addEventListener("input", render);

    // Favorites-only toggle
    if (favOnlyBtn) {
      favOnlyBtn.addEventListener("click", function () {
        favOnly = !favOnly;
        favOnlyBtn.classList.toggle("on", favOnly);
        favOnlyBtn.setAttribute("aria-pressed", favOnly ? "true" : "false");
        render();
      });
    }

    // Heart clicks (delegated)
    grid.addEventListener("click", function (e) {
      var h = e.target.closest("[data-fav]");
      if (!h) return;
      e.preventDefault();
      var id = h.getAttribute("data-fav");
      var now = toggleFav(id);
      h.classList.toggle("on", now);
      toast(now ? "Saved to My Favorites ♥" : "Removed from favorites");
      if (favOnly) render();
    });

    render();
  }

  /* =====================================================================
     DETAIL PAGE
     ===================================================================== */
  function qs(name) {
    var m = new RegExp("[?&]" + name + "=([^&]*)").exec(window.location.search);
    return m ? decodeURIComponent(m[1]) : null;
  }

  function initDetail() {
    var root = document.getElementById("paDetail");
    if (!root) return; // not on the detail page

    var id = qs("pack") || PACKS[0].id;
    var p = getPack(id) || PACKS[0];

    document.title = p.title + " — Printable Adventures — Red 5";

    // Fill in template
    function el(sel) { return root.querySelector(sel); }
    var crumb = document.querySelector(".pa-d-crumb-title"); // lives in the hero, outside #paDetail
    if (crumb) crumb.textContent = p.title;
    el(".pa-d-cover img").src = p.cover;
    el(".pa-d-cover img").alt = p.title + " cover";
    el(".pa-d-title").textContent = p.title;
    el(".pa-d-blurb").textContent = p.blurb;
    el(".pa-d-ages").textContent = "Ages " + p.ages;
    el(".pa-d-time").textContent = p.time;
    el(".pa-d-pages").textContent = p.pageCount + " pages";
    el(".pa-d-diff").textContent = p.difficulty;
    if (p.club) {
      var cb = el(".pa-d-club"); if (cb) cb.style.display = "inline-flex";
    }

    // Pages-included list
    el(".pa-d-included").innerHTML = p.pages.map(function (x) {
      return '<li><svg viewBox="0 0 24 24" width="16" height="16"><path d="M20 6L9 17l-5-5"/></svg>' + x + '</li>';
    }).join("");

    // Tags
    el(".pa-d-tags").innerHTML = p.cats.map(function (c) { return '<span class="pa-tag">' + c + '</span>'; }).join("");

    // Supplies checklist
    el(".pa-d-supplies").innerHTML = p.supplies.map(function (s, i) {
      return '<li><label><input type="checkbox" data-supply="' + i + '"> <span>' + s + '</span></label></li>';
    }).join("");

    // Favorite button state
    var favBtn = el(".pa-d-fav");
    function syncFav() {
      var on = isFav(p.id);
      favBtn.classList.toggle("on", on);
      favBtn.querySelector("span").textContent = on ? "Saved" : "Save";
    }
    syncFav();
    favBtn.addEventListener("click", function () {
      var now = toggleFav(p.id);
      syncFav();
      toast(now ? "Saved to My Favorites ♥" : "Removed from favorites");
    });

    // Buttons
    el(".pa-d-print").addEventListener("click", function () { printSheet(p); });
    el(".pa-d-pdf").addEventListener("click", function () {
      toast("Tip: choose “Save as PDF” in the print window to download.");
      setTimeout(function () { printSheet(p); }, 700);
    });
    el(".pa-d-share").addEventListener("click", function () {
      toast("Sent to a grown-up! They'll help you print it. 👍");
    });
    var certBtn = el(".pa-d-cert");
    if (certBtn) certBtn.addEventListener("click", function () { printCertificate(p); });

    // "More adventures" rail
    var more = el(".pa-d-more-grid");
    if (more) {
      more.innerHTML = PACKS.filter(function (x) { return x.id !== p.id; }).slice(0, 5).map(function (x) {
        return '<a class="pa-d-more-card" href="printable-detail.html?pack=' + x.id + '">' +
          '<img src="' + x.cover + '" alt="' + x.title + '" loading="lazy">' +
          '<span>' + x.title + '</span></a>';
      }).join("");
    }
  }

  /* ---- Printable activity sheet ---------------------------------------- */
  function openPrintWindow(title, bodyHTML) {
    var w = window.open("", "_blank", "width=820,height=1060");
    if (!w) { toast("Please allow pop-ups to print this adventure."); return; }
    var doc = w.document;
    doc.open();
    doc.write('<!doctype html><html><head><meta charset="utf-8"><title>' + title + '</title>' +
      '<style>' +
      'body{font-family:"Nunito",Arial,sans-serif;color:#1c2440;margin:0;padding:36px 44px;}' +
      'h1{font-family:"Fredoka",Arial,sans-serif;color:#e11d2b;font-size:30px;margin:0 0 2px;}' +
      'h2{font-family:"Fredoka",Arial,sans-serif;color:#2b2f6e;font-size:19px;margin:24px 0 8px;border-bottom:3px solid #ffd23f;padding-bottom:4px;}' +
      '.sub{color:#555;margin:0 0 8px;font-size:14px;}' +
      '.brand{display:flex;justify-content:space-between;align-items:center;border-bottom:4px solid #e11d2b;padding-bottom:10px;}' +
      '.brand .r5{font-family:"Fredoka",Arial,sans-serif;font-weight:700;color:#e11d2b;font-size:16px;letter-spacing:1px;}' +
      '.meta{font-size:13px;color:#444;margin:6px 0 0;}' +
      'ul.check{list-style:none;padding:0;margin:8px 0;column-count:2;}' +
      'ul.check li{margin:0 0 12px;font-size:16px;}' +
      'ul.check li .box{display:inline-block;width:18px;height:18px;border:2px solid #2b2f6e;border-radius:4px;vertical-align:-3px;margin-right:8px;}' +
      '.words{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin:8px 0;}' +
      '.words span{border:2px dashed #b9c0e0;border-radius:8px;padding:8px;text-align:center;font-weight:700;letter-spacing:1px;}' +
      '.maze{border:3px solid #2b2f6e;border-radius:10px;height:240px;position:relative;background:repeating-linear-gradient(0deg,#f4f6ff,#f4f6ff 28px,#e7ebfb 28px,#e7ebfb 30px),repeating-linear-gradient(90deg,transparent,transparent 28px,#e7ebfb 28px,#e7ebfb 30px);}' +
      '.maze .start,.maze .end{position:absolute;font-weight:700;font-family:"Fredoka",Arial;color:#e11d2b;}' +
      '.maze .start{top:6px;left:8px;}.maze .end{bottom:6px;right:10px;color:#12b5a5;}' +
      '.lines{margin:8px 0;}.lines div{border-bottom:2px solid #c9d0ea;height:30px;}' +
      '.foot{margin-top:28px;text-align:center;color:#888;font-size:12px;border-top:2px dashed #ccc;padding-top:10px;}' +
      '@media print{.noprint{display:none;}body{padding:24px 30px;}}' +
      '.noprint{margin:18px 0;text-align:center;}' +
      '.noprint button{font-family:"Fredoka",Arial;font-size:15px;background:#e11d2b;color:#fff;border:none;padding:10px 22px;border-radius:999px;cursor:pointer;}' +
      '</style></head><body>' +
      '<div class="brand"><div><h1>' + title + '</h1></div><div class="r5">RED 5 · Printable Adventures</div></div>' +
      bodyHTML +
      '<div class="foot">Made with Red 5 — a safe place to grow. Have fun, explorer!</div>' +
      '<div class="noprint"><button onclick="window.print()">🖨 Print this page</button></div>' +
      '</body></html>');
    doc.close();
    w.focus();
    setTimeout(function () { try { w.print(); } catch (e) {} }, 500);
  }

  function printSheet(p) {
    var body = '' +
      '<p class="sub">' + p.blurb + '</p>' +
      '<p class="meta"><b>Ages:</b> ' + p.ages + ' &nbsp; · &nbsp; <b>Time:</b> ' + p.time +
        ' &nbsp; · &nbsp; <b>Difficulty:</b> ' + p.difficulty + ' &nbsp; · &nbsp; <b>Pages:</b> ' + p.pageCount + '</p>' +
      '<h2>Your Mission Checklist</h2>' +
      '<ul class="check">' + p.checklist.map(function (c) { return '<li><span class="box"></span>' + c + '</li>'; }).join("") + '</ul>' +
      '<h2>Word Hunt</h2>' +
      '<p class="sub">Find and circle these words — or use them in a sentence!</p>' +
      '<div class="words">' + p.words.map(function (w) { return '<span>' + w + '</span>'; }).join("") + '</div>' +
      '<h2>Find Your Way (Maze)</h2>' +
      '<div class="maze"><span class="start">START ▸</span><span class="end">▸ FINISH</span></div>' +
      '<h2>Adventure Journal</h2>' +
      '<p class="sub">Write or draw what happened on your adventure:</p>' +
      '<div class="lines"><div></div><div></div><div></div><div></div></div>' +
      '<h2>Supplies to Gather</h2>' +
      '<ul class="check">' + p.supplies.map(function (s) { return '<li><span class="box"></span>' + s + '</li>'; }).join("") + '</ul>';
    openPrintWindow(p.title, body);
  }

  function printCertificate(p) {
    var w = window.open("", "_blank", "width=900,height=680");
    if (!w) { toast("Please allow pop-ups to print the certificate."); return; }
    var d = w.document; d.open();
    d.write('<!doctype html><html><head><meta charset="utf-8"><title>Certificate — ' + p.title + '</title>' +
      '<style>body{margin:0;font-family:"Nunito",Arial,sans-serif;}' +
      '.cert{margin:30px auto;max-width:820px;border:14px solid #ffd23f;outline:3px solid #e11d2b;outline-offset:-22px;border-radius:14px;padding:54px 50px;text-align:center;background:#fffdf6;}' +
      '.cert .r5{font-family:"Fredoka",Arial;color:#e11d2b;font-weight:700;letter-spacing:2px;}' +
      '.cert h1{font-family:"Fredoka",Arial;font-size:44px;color:#2b2f6e;margin:10px 0 0;}' +
      '.cert .for{color:#666;margin:18px 0 4px;font-size:18px;}' +
      '.cert .name{border-bottom:3px solid #2b2f6e;display:inline-block;min-width:340px;height:46px;margin:6px 0 18px;}' +
      '.cert p{font-size:18px;color:#333;}' +
      '.cert .star{font-size:54px;}' +
      '.cert .sig{margin-top:36px;display:flex;justify-content:space-around;color:#555;font-size:14px;}' +
      '.cert .sig div{border-top:2px solid #999;padding-top:6px;width:200px;}' +
      '.noprint{text-align:center;margin:10px;}.noprint button{font-family:"Fredoka",Arial;background:#e11d2b;color:#fff;border:none;padding:10px 22px;border-radius:999px;font-size:15px;cursor:pointer;}' +
      '@media print{.noprint{display:none;}}' +
      '</style></head><body>' +
      '<div class="cert"><div class="r5">RED 5 · PRINTABLE ADVENTURES</div>' +
      '<div class="star">🏆</div>' +
      '<h1>Certificate of Adventure</h1>' +
      '<div class="for">This certificate is proudly awarded to</div>' +
      '<div class="name"></div>' +
      '<p>for completing the <b>' + p.title + '</b> adventure with courage, curiosity and creativity!</p>' +
      '<div class="sig"><div>Date</div><div>Adventure Guide</div></div></div>' +
      '<div class="noprint"><button onclick="window.print()">🖨 Print Certificate</button></div>' +
      '</body></html>');
    d.close(); w.focus();
    setTimeout(function () { try { w.print(); } catch (e) {} }, 500);
  }

  /* ---- Boot ------------------------------------------------------------ */
  function boot() { initLibrary(); initDetail(); }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else { boot(); }
})();
