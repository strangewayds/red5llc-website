/* ==========================================================================
   Red 5 — Monthly Challenge hub.
   Fully functional, no backend: challenges check off and persist in
   localStorage; stars, progress bar/map, and badges update live; a
   celebration fires when the Main Quest is complete.
   Scoped entirely to body[data-page="challenges"].
   ========================================================================== */
(function () {
  "use strict";

  /* ---- Theme / month -------------------------------------------------- */
  var MONTH_KEY = "2026-06-ocean"; // bump this string to start a fresh month
  var STORE_KEY = "red5_mc_" + MONTH_KEY;

  /* ---- Challenge data -------------------------------------------------
     Each quest item: id, label, hint, stars it awards, and an optional
     link to the matching real site feature so kids can go do it. */
  var MAIN = [
    { id:"m_kind",     stars:15, icon:"💌", label:"Send 3 Kindness Cards",     hint:"Brighten someone's day with a sweet note.", href:"kindness-cards.html" },
    { id:"m_read",     stars:15, icon:"📚", label:"Read 2 Stories",            hint:"Dive into the Books & Stories library.",   href:"books-stories.html" },
    { id:"m_comic",    stars:15, icon:"💥", label:"Finish 1 Comic",            hint:"Make a comic in the Comic Creator.",       href:"comic-creator.html" },
    { id:"m_craft",    stars:15, icon:"✂️", label:"Complete 2 Crafts",         hint:"Build something cool in the Craft Lab.",   href:"craft-lab.html" },
    { id:"m_help",     stars:10, icon:"🤝", label:"Help someone at home",      hint:"A real-world act of kindness counts!",     href:null },
    { id:"m_print",    stars:10, icon:"🗺️", label:"Finish a Printable Adventure", hint:"Print & complete an adventure pack.",   href:"printable-adventures.html" },
    { id:"m_story",    stars:10, icon:"✍️", label:"Write a Story",             hint:"Use the Story Creator to write your own.", href:"story-creator.html" },
    { id:"m_game",     stars:10, icon:"🎮", label:"Complete a Game Challenge", hint:"Beat a game over in the Play Zone.",       href:"play-zone.html" }
  ];

  var SIDE = [
    { id:"s_draw",   stars:5, icon:"🎨", label:"Draw an ocean creature",   hint:"Daily quest" },
    { id:"s_sticker",stars:5, icon:"⭐", label:"Make a sticker pack",      hint:"Daily quest" },
    { id:"s_buddy",  stars:5, icon:"🐾", label:"Build a buddy",            hint:"Weekly quest" },
    { id:"s_color",  stars:5, icon:"🖍️", label:"Color an underwater scene",hint:"Daily quest" }
  ];

  var REAL = [
    { id:"r_walk",   stars:10, icon:"🌳", label:"Go on a nature walk",        hint:"Look for 3 things you've never noticed." },
    { id:"r_plant",  stars:10, icon:"🌱", label:"Plant a flower or seed",     hint:"Watch it grow all month." },
    { id:"r_room",   stars:10, icon:"🧹", label:"Clean & organize your room", hint:"Future-you says thanks!" },
    { id:"r_letter", stars:10, icon:"💛", label:"Write to a grandparent",     hint:"A letter or a drawing — your choice." },
    { id:"r_water",  stars:10, icon:"🐚", label:"Visit water (lake, beach, pond)", hint:"Or watch an ocean documentary." },
    { id:"r_kind",   stars:10, icon:"🤗", label:"Do a secret act of kindness", hint:"No need to tell anyone!" }
  ];

  var FAMILY = [
    { id:"f_read",  stars:10, icon:"📖", label:"Read a book together",     hint:"Take turns reading pages." },
    { id:"f_cook",  stars:10, icon:"🍳", label:"Help cook dinner",          hint:"Pick the recipe together." },
    { id:"f_game",  stars:10, icon:"🎲", label:"Family board game night",   hint:"Winner picks the next one!" },
    { id:"f_lib",   stars:10, icon:"🏛️", label:"Visit the library",         hint:"Find a book about the ocean." }
  ];

  var ALL = MAIN.concat(SIDE, REAL, FAMILY);
  var TOTAL_STARS = ALL.reduce(function (s, q) { return s + q.stars; }, 0);

  /* ---- Badges: unlock at star milestones or specific completions ------ */
  var BADGES = [
    { id:"b_kind",   icon:"💖", name:"Kindness Hero",     need:"Send all 3 Kindness Cards",  test:function(d){ return d["m_kind"]; } },
    { id:"b_read",   icon:"📚", name:"Reading Champion",  need:"Read 2 stories",             test:function(d){ return d["m_read"]; } },
    { id:"b_create", icon:"🎨", name:"Creative Genius",   need:"Finish a comic & 2 crafts",  test:function(d){ return d["m_comic"] && d["m_craft"]; } },
    { id:"b_explore",icon:"🧭", name:"Explorer",          need:"Do 3 Real-World Missions",   test:function(d){ return countDone(REAL, d) >= 3; } },
    { id:"b_story",  icon:"✍️", name:"Storyteller",       need:"Write your own story",       test:function(d){ return d["m_story"]; } },
    { id:"b_family", icon:"🏡", name:"Family Star",       need:"Do 2 Family Missions",       test:function(d){ return countDone(FAMILY, d) >= 2; } },
    { id:"b_champ",  icon:"🏆", name:"Challenge Champion",need:"Complete the whole Main Quest", test:function(d){ return countDone(MAIN, d) === MAIN.length; } }
  ];

  /* ---- State ---------------------------------------------------------- */
  function load(){
    try { return JSON.parse(localStorage.getItem(STORE_KEY)) || {}; }
    catch(e){ return {}; }
  }
  function save(d){
    try { localStorage.setItem(STORE_KEY, JSON.stringify(d)); } catch(e){}
  }
  var done = load();
  var unlockedBefore = {}; // tracks which badges were already unlocked (to animate new ones)

  function countDone(list, d){
    return list.reduce(function(n,q){ return n + (d[q.id] ? 1 : 0); }, 0);
  }
  function starsEarned(d){
    return ALL.reduce(function(s,q){ return s + (d[q.id] ? q.stars : 0); }, 0);
  }

  /* ---- Rendering helpers ---------------------------------------------- */
  function questItem(q){
    var checked = done[q.id] ? " checked" : "";
    var on = done[q.id] ? " is-done" : "";
    var link = q.href
      ? '<a class="mc-q-go" href="'+q.href+'" title="Go do this">Go &rsaquo;</a>'
      : '';
    return ''+
      '<li class="mc-quest'+on+'">'+
        '<label class="mc-q-check">'+
          '<input type="checkbox" data-quest="'+q.id+'"'+checked+'>'+
          '<span class="mc-q-box" aria-hidden="true"></span>'+
        '</label>'+
        '<span class="mc-q-emoji" aria-hidden="true">'+q.icon+'</span>'+
        '<span class="mc-q-text">'+
          '<b>'+q.label+'</b>'+
          '<small>'+q.hint+'</small>'+
        '</span>'+
        '<span class="mc-q-stars">'+q.stars+' ★</span>'+
        link +
      '</li>';
  }

  function renderList(elId, list){
    var el = document.getElementById(elId);
    if(el){ el.innerHTML = list.map(questItem).join(""); }
  }

  function renderBadges(){
    var wrap = document.getElementById("mcBadges");
    if(!wrap) return;
    wrap.innerHTML = BADGES.map(function(b){
      var unlocked = b.test(done);
      return ''+
        '<div class="mc-badge'+(unlocked?" unlocked":"")+'" data-badge="'+b.id+'">'+
          '<div class="mc-badge-coin">'+
            '<span class="mc-badge-icon">'+b.icon+'</span>'+
            '<span class="mc-badge-lock" aria-hidden="true">🔒</span>'+
          '</div>'+
          '<b>'+b.name+'</b>'+
          '<small>'+(unlocked?"Unlocked!":b.need)+'</small>'+
        '</div>';
    }).join("");
  }

  /* ---- Progress + stars ----------------------------------------------- */
  function updateProgress(){
    var mainDone = countDone(MAIN, done);
    var mainPct = Math.round((mainDone / MAIN.length) * 100);
    var stars = starsEarned(done);
    var totalDone = countDone(ALL, done);

    // Big progress bar (Main Quest)
    var fill = document.getElementById("mcBarFill");
    if(fill){ fill.style.width = mainPct + "%"; }
    var pctEl = document.getElementById("mcBarPct");
    if(pctEl){ pctEl.textContent = mainPct + "%"; }
    var fracEl = document.getElementById("mcMainFrac");
    if(fracEl){ fracEl.textContent = mainDone + " / " + MAIN.length; }

    // Progress map nodes (5 milestones across the main quest)
    document.querySelectorAll("#mcMap .mc-map-node").forEach(function(node){
      var at = parseInt(node.getAttribute("data-at"), 10);
      node.classList.toggle("reached", mainPct >= at);
    });

    // Star counters
    document.querySelectorAll("[data-stars-count]").forEach(function(el){ el.textContent = stars; });
    var starTotal = document.getElementById("mcStarsTotal");
    if(starTotal){ starTotal.textContent = TOTAL_STARS; }
    var starsFill = document.getElementById("mcStarsBar");
    if(starsFill){ starsFill.style.width = Math.round((stars/TOTAL_STARS)*100) + "%"; }

    // Overall completed counter
    var allEl = document.getElementById("mcAllDone");
    if(allEl){ allEl.textContent = totalDone; }
    var allTotalEl = document.getElementById("mcAllTotal");
    if(allTotalEl){ allTotalEl.textContent = ALL.length; }

    // Encouraging status line
    var status = document.getElementById("mcStatus");
    if(status){ status.textContent = encourage(mainDone, mainPct); }

    return { mainDone: mainDone, mainPct: mainPct, stars: stars };
  }

  function encourage(mainDone, pct){
    if(pct >= 100) return "You completed the whole Main Quest! You're a Red 5 Challenge Champion! 🏆";
    if(mainDone === 0) return "Pick any challenge to begin — there's no wrong place to start! 🌊";
    if(pct < 40)  return "Great start! Every challenge you finish earns shiny stars. ⭐";
    if(pct < 75)  return "You're doing amazing — keep that streak going! 💪";
    return "So close! Just a few more to become a Challenge Champion! ✨";
  }

  /* ---- Badge unlock animation ----------------------------------------- */
  function refreshBadges(animate){
    renderBadges();
    if(!animate) return;
    BADGES.forEach(function(b){
      var nowUnlocked = b.test(done);
      if(nowUnlocked && !unlockedBefore[b.id]){
        var el = document.querySelector('.mc-badge[data-badge="'+b.id+'"]');
        if(el){ el.classList.add("just-unlocked"); }
        if(window.RED5_TOAST){ window.RED5_TOAST("Badge unlocked: " + b.name + " " + b.icon); }
      }
      unlockedBefore[b.id] = nowUnlocked;
    });
  }

  /* ---- Confetti celebration ------------------------------------------- */
  var celebrated = false;
  function confetti(){
    var layer = document.getElementById("mcConfetti");
    if(!layer) return;
    var colors = ["#e11d2b","#ffc53d","#2ba8e0","#5da130","#6c5ce7","#ff7a45","#ff5a8a"];
    for(var i=0;i<120;i++){
      var p = document.createElement("i");
      var c = colors[i % colors.length];
      var left = Math.random()*100;
      var delay = Math.random()*0.6;
      var dur = 2.4 + Math.random()*1.8;
      var size = 7 + Math.random()*9;
      p.style.cssText =
        "left:"+left+"%;width:"+size+"px;height:"+(size*0.5)+"px;background:"+c+";"+
        "animation-delay:"+delay+"s;animation-duration:"+dur+"s;"+
        "transform:rotate("+(Math.random()*360)+"deg);";
      layer.appendChild(p);
    }
    layer.classList.add("go");
    setTimeout(function(){ layer.classList.remove("go"); layer.innerHTML=""; }, 4600);
  }

  function maybeCelebrate(state){
    if(state.mainPct >= 100 && !celebrated){
      celebrated = true;
      confetti();
      var banner = document.getElementById("mcWinBanner");
      if(banner){ banner.classList.add("show"); }
    }
    if(state.mainPct < 100){
      celebrated = false;
      var b2 = document.getElementById("mcWinBanner");
      if(b2){ b2.classList.remove("show"); }
    }
  }

  /* ---- Wire up -------------------------------------------------------- */
  function refreshAll(animate){
    var state = updateProgress();
    refreshBadges(animate);
    maybeCelebrate(state);
  }

  function onToggle(e){
    var cb = e.target.closest('input[data-quest]');
    if(!cb) return;
    var id = cb.getAttribute("data-quest");
    if(cb.checked){ done[id] = true; } else { delete done[id]; }
    save(done);
    var li = cb.closest(".mc-quest");
    if(li){ li.classList.toggle("is-done", cb.checked); }
    refreshAll(true);
  }

  function resetMonth(){
    if(!window.confirm("Start this month fresh? This clears your check-offs (no penalty — just a clean slate!).")) return;
    done = {};
    save(done);
    celebrated = false;
    // re-render everything from scratch
    renderAll();
    refreshAll(false);
    if(window.RED5_TOAST){ window.RED5_TOAST("Fresh month! Pick a challenge to begin. 🌊"); }
  }

  function renderAll(){
    renderList("mcMainList", MAIN);
    renderList("mcSideList", SIDE);
    renderList("mcRealList", REAL);
    renderList("mcFamilyList", FAMILY);
  }

  function init(){
    if(document.body.getAttribute("data-page") !== "challenges") return;
    renderAll();
    // seed unlockedBefore so existing badges don't re-toast on load
    BADGES.forEach(function(b){ unlockedBefore[b.id] = b.test(done); });
    refreshAll(false);

    document.addEventListener("change", onToggle);
    var resetBtn = document.getElementById("mcReset");
    if(resetBtn){ resetBtn.addEventListener("click", resetMonth); }

    // smooth-scroll helper for hero buttons handled by native anchors
  }

  if(document.readyState === "loading"){ document.addEventListener("DOMContentLoaded", init); }
  else { init(); }
})();
