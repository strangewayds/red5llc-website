/* Kindness Cards — library page.
   Functional category filtering + search + localStorage favorites.
   Card data is the single source of truth shared with the creator (window.KC_CARDS). */
(function(){
  "use strict";

  /* ---- Card library ----------------------------------------------------
     Cards 1-6 use real cropped artwork (assets/kc-*.png).
     The rest are generated pastel previews (emoji + line) so every
     category has lovely options. Each card carries default text + colors
     the creator reads via ?card=ID. */
  var CARDS = [
    { id:"amazing",   title:"You Are Amazing!",      cat:"Encouragement", img:"assets/kc-amazing.png",
      msg:"You are amazing just the way you are!", bg:"#fff6ea", fg:"#e8412b", emoji:"⭐" },
    { id:"thankyou",  title:"Thank You",             cat:"Thank You",     img:"assets/kc-thankyou.png",
      msg:"Thank you for being so kind!", bg:"#fdf3ea", fg:"#1f2a44", emoji:"💖" },
    { id:"world",     title:"You Make the World Better", cat:"Encouragement", img:"assets/kc-world.png",
      msg:"You make the world a better place!", bg:"#fff6ea", fg:"#7c4dff", emoji:"🌍" },
    { id:"thinking",  title:"Thinking of You",       cat:"Thinking of You", img:"assets/kc-thinking.png",
      msg:"Just thinking of you and sending a smile!", bg:"#eaf4ff", fg:"#2b5bd6", emoji:"💌" },
    { id:"matter",    title:"You Matter",            cat:"Encouragement", img:"assets/kc-matter.png",
      msg:"You matter so much!", bg:"#fff7ea", fg:"#e8412b", emoji:"🌞" },
    { id:"bff",       title:"Best Friends Forever",  cat:"Friendship",    img:"assets/kc-bff.png",
      msg:"Best friends forever — you're the best!", bg:"#fbeefb", fg:"#7c4dff", emoji:"💞" },

    /* Generated pastel previews */
    { id:"youcandoit", title:"You Can Do It!",   cat:"Encouragement", emoji:"🚀", bg:"linear-gradient(160deg,#dff3ff,#cfe6ff)", fg:"#2b5bd6",
      msg:"You can do it — I believe in you!" },
    { id:"keepsmiling", title:"Keep Smiling",    cat:"Cheer Up",      emoji:"😊", bg:"linear-gradient(160deg,#fff7d6,#ffe9a8)", fg:"#d98a00",
      msg:"Keep smiling — your smile makes everything brighter!" },
    { id:"feelbetter",  title:"Feel Better Soon", cat:"Cheer Up",     emoji:"🌈", bg:"linear-gradient(160deg,#eafcf3,#cdeede)", fg:"#179e7a",
      msg:"Hope you feel better soon! Sending big hugs." },
    { id:"goodfriend",  title:"You're a Good Friend", cat:"Friendship", emoji:"🧡", bg:"linear-gradient(160deg,#ffeede,#ffd9bf)", fg:"#e07b2b",
      msg:"You are such a wonderful friend." },
    { id:"thanksteacher", title:"Thank You, Teacher", cat:"Teachers",  emoji:"🍎", bg:"linear-gradient(160deg,#ffe6ea,#ffd0da)", fg:"#e2386b",
      msg:"Thank you for teaching me so much. You're the best!" },
    { id:"greatjob",    title:"Great Job!",      cat:"Congratulations", emoji:"🏆", bg:"linear-gradient(160deg,#fff3d6,#ffe19e)", fg:"#cf8b00",
      msg:"Great job! I'm so proud of you." },
    { id:"congrats",    title:"Congratulations", cat:"Congratulations", emoji:"🎉", bg:"linear-gradient(160deg,#f0e8ff,#ddccff)", fg:"#7c4dff",
      msg:"Congratulations! You did something wonderful." },
    { id:"birthday",    title:"Happy Birthday",  cat:"Birthday",      emoji:"🎂", bg:"linear-gradient(160deg,#ffe8f3,#ffd0e6)", fg:"#e2386b",
      msg:"Happy Birthday! Hope your day is super special." },
    { id:"holiday",     title:"Happy Holidays",  cat:"Holiday",       emoji:"❄️", bg:"linear-gradient(160deg,#e6f3ff,#cfe6ff)", fg:"#2b5bd6",
      msg:"Happy Holidays! Wishing you joy and warmth." },
    { id:"family",      title:"I Love My Family", cat:"Family",       emoji:"💗", bg:"linear-gradient(160deg,#ffeef0,#ffd6dc)", fg:"#e2386b",
      msg:"I love you and I'm so lucky to have you." },
    { id:"grandparent", title:"Best Grandparent", cat:"Family",       emoji:"🤗", bg:"linear-gradient(160deg,#fff3e6,#ffe0c2)", fg:"#e07b2b",
      msg:"Thank you for all the love and stories. I love you!" },
    { id:"random",      title:"Just Because",    cat:"Random Acts of Kindness", emoji:"🌻", bg:"linear-gradient(160deg,#fffbe0,#fdeeb0)", fg:"#cf8b00",
      msg:"Just a little note to make you smile today!" },
    { id:"neighbor",    title:"Kind Neighbor",   cat:"Random Acts of Kindness", emoji:"🏡", bg:"linear-gradient(160deg,#eafcf3,#cdeede)", fg:"#179e7a",
      msg:"Thanks for being such a kind neighbor!" },
    { id:"spring",      title:"Happy Spring",    cat:"Seasonal",      emoji:"🌷", bg:"linear-gradient(160deg,#fdeaf6,#f6d9ee)", fg:"#cf4f9e",
      msg:"Happy Spring! Wishing you sunny, happy days." },
    { id:"summer",      title:"Sunny Days",      cat:"Seasonal",      emoji:"🌊", bg:"linear-gradient(160deg,#e3f6ff,#c8ecff)", fg:"#1f9fd6",
      msg:"Have the sunniest, happiest summer!" }
  ];
  window.KC_CARDS = CARDS;

  var CATS = ["All Cards","Encouragement","Friendship","Thank You","Thinking of You","Cheer Up",
              "Congratulations","Birthday","Holiday","Teachers","Family","Random Acts of Kindness","Seasonal"];

  var FAV_KEY = "red5_kc_favs";
  function getFavs(){ try{ return JSON.parse(localStorage.getItem(FAV_KEY)) || {}; }catch(e){ return {}; } }
  function setFavs(f){ try{ localStorage.setItem(FAV_KEY, JSON.stringify(f)); }catch(e){} }

  var heartSVG = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 20.3 4.7 13c-2-2-2-5.2 0-7.1 1.9-1.9 4.9-1.8 6.7.2l.6.7.6-.7c1.8-2 4.8-2.1 6.7-.2 2 1.9 2 5.1 0 7.1z"/></svg>';

  var state = { cat:"All Cards", q:"" };
  var grid, empty, countEl;

  function el(id){ return document.getElementById(id); }
  function esc(s){ return String(s).replace(/[&<>"]/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]; }); }

  function buildChips(){
    var wrap = el("kcChips");
    wrap.innerHTML = CATS.map(function(c){
      var on = c === state.cat ? " active" : "";
      return '<button type="button" class="kc-chip'+on+'" data-cat="'+esc(c)+'">'+esc(c)+'</button>';
    }).join("");
    wrap.addEventListener("click", function(e){
      var b = e.target.closest(".kc-chip"); if(!b) return;
      state.cat = b.getAttribute("data-cat");
      Array.prototype.forEach.call(wrap.children, function(ch){ ch.classList.toggle("active", ch===b); });
      render();
    });
  }

  function previewHTML(card){
    if(card.img){
      return '<img src="'+card.img+'" alt="'+esc(card.title)+'" loading="lazy">';
    }
    return '<div class="kc-art" style="background:'+card.bg+';--kc-fg:'+card.fg+'">'+
             '<span class="kc-emoji">'+card.emoji+'</span>'+
             '<span class="kc-line">'+esc(card.title)+'</span>'+
           '</div>';
  }

  function cardHTML(card, favs){
    var on = favs[card.id] ? " on" : "";
    return '<article class="kc-card">'+
      '<div class="kc-preview">'+
        previewHTML(card)+
        '<button type="button" class="kc-fav'+on+'" data-fav="'+card.id+'" aria-label="Favorite" aria-pressed="'+(favs[card.id]?"true":"false")+'">'+heartSVG+'</button>'+
      '</div>'+
      '<div class="kc-body">'+
        '<span class="kc-cat">'+esc(card.cat)+'</span>'+
        '<h3 class="kc-title">'+esc(card.title)+'</h3>'+
        '<a class="kc-personalize" href="card-creator.html?card='+encodeURIComponent(card.id)+'">'+
          '<span data-icon="pencil"></span> Personalize</a>'+
      '</div>'+
    '</article>';
  }

  function matches(card){
    if(state.cat !== "All Cards" && card.cat !== state.cat) return false;
    if(state.q){
      var hay = (card.title + " " + card.cat + " " + (card.msg||"")).toLowerCase();
      if(hay.indexOf(state.q) === -1) return false;
    }
    return true;
  }

  function render(){
    var favs = getFavs();
    var list = CARDS.filter(matches);
    grid.innerHTML = list.map(function(c){ return cardHTML(c, favs); }).join("");
    empty.style.display = list.length ? "none" : "block";
    countEl.textContent = list.length ? (list.length + (list.length===1?" card":" cards")) : "";
    if(window.RED5_ICONS) hydrateIcons(grid);
  }

  /* app.js processes [data-icon] on its own load; re-process freshly injected nodes */
  function hydrateIcons(scope){
    scope.querySelectorAll("[data-icon]").forEach(function(n){
      var name = n.getAttribute("data-icon");
      if(window.RED5_ICONS && window.RED5_ICONS[name]){ n.innerHTML = window.RED5_ICONS[name]; n.removeAttribute("data-icon"); }
    });
  }

  function init(){
    grid = el("kcGrid"); empty = el("kcEmpty"); countEl = el("kcCount");
    // search-icon glyph (app.js has no "search" icon, so inline one)
    var mag = document.querySelector(".kc-mag[data-icon-raw='search']");
    if(mag){ mag.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.2-3.2"/></svg>'; }

    buildChips();

    var search = el("kcSearch");
    search.addEventListener("input", function(){ state.q = search.value.trim().toLowerCase(); render(); });

    grid.addEventListener("click", function(e){
      var fav = e.target.closest(".kc-fav"); if(!fav) return;
      var id = fav.getAttribute("data-fav");
      var favs = getFavs();
      if(favs[id]){ delete favs[id]; fav.classList.remove("on"); fav.setAttribute("aria-pressed","false"); }
      else { favs[id] = 1; fav.classList.add("on"); fav.setAttribute("aria-pressed","true"); }
      setFavs(favs);
    });

    render();
  }

  if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
