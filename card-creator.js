/* Card Creator — the working Kindness Card editor.
   Customize text/font/color/background + stickers, autosave, print, save PNG, PDF.
   Reads card library from window.KC_CARDS (kindness-cards.js). */
(function(){
  "use strict";

  /* ---------- Data ---------- */
  var CARDS = window.KC_CARDS || [];

  // Pastel gradient backgrounds (also offered as design choices)
  var GRADS = [
    { id:"g-peach",   css:"linear-gradient(160deg,#ffe8d6,#ffd0bf)" },
    { id:"g-rose",    css:"linear-gradient(160deg,#ffe3ee,#ffc8de)" },
    { id:"g-lilac",   css:"linear-gradient(160deg,#efe6ff,#d9c7ff)" },
    { id:"g-sky",     css:"linear-gradient(160deg,#e2f3ff,#c6e6ff)" },
    { id:"g-mint",    css:"linear-gradient(160deg,#e3fbef,#c6ecd8)" },
    { id:"g-lemon",   css:"linear-gradient(160deg,#fff6cf,#ffe79e)" },
    { id:"g-sunset",  css:"linear-gradient(160deg,#ffe7d1,#ffc6d9)" },
    { id:"g-ocean",   css:"linear-gradient(160deg,#d8f0ff,#bfe0ff)" }
  ];
  var SOLIDS = ["#ffffff","#fff3ea","#ffe3ee","#efe6ff","#e2f3ff","#e3fbef","#fff6cf","#ffe1e1"];
  var TEXT_COLORS = ["#2a2052","#e8412b","#e2386b","#7c4dff","#2b5bd6","#179e7a","#d98a00","#ffffff"];

  var FONTS = [
    { id:"fredoka", label:"Aa", css:"'Fredoka', sans-serif" },
    { id:"baloo",   label:"Aa", css:"'Baloo 2', cursive" },
    { id:"caveat",  label:"Aa", css:"'Caveat', cursive" },
    { id:"patrick", label:"Aa", css:"'Patrick Hand', cursive" },
    { id:"nunito",  label:"Aa", css:"'Nunito', sans-serif" }
  ];

  var STICKERS = ["⭐","🌈","❤️","💖","🌸","🌻","🐶","🐱","🦄","🦖","🎈","🎉","🦋","☀️","🌙","🍀"];

  // Safe, kind, age-appropriate message suggestions per recipient.
  var SUGGESTIONS = {
    Friend:["You are a wonderful friend.","Thank you for always making me smile.","I'm so lucky to know you!","You make every day more fun.","You're kind, funny and awesome.","Thanks for being such a great friend."],
    Teacher:["Thank you for teaching me so much.","You make learning fun every day.","Thank you for believing in me.","You're the best teacher ever!","I appreciate everything you do.","Thank you for helping me grow."],
    Parent:["Thank you for everything you do.","I love you to the moon and back.","You make me feel safe and happy.","Thanks for always being there for me.","You're the best — I love you!","I appreciate all your love and care."],
    Grandparent:["Thank you for all the love and stories.","I love spending time with you.","You make me feel so special.","Thank you for always being so kind.","I love you very much!","You give the best hugs."],
    Sibling:["Thanks for being an awesome sibling.","I'm glad we're a team.","You make me laugh every day.","Thanks for sticking up for me.","You're the best — I love you!","I'm lucky to have you."],
    Coach:["Thank you for helping me get better.","You make practice fun.","Thanks for never giving up on me.","You're a great coach!","Thank you for cheering me on.","I learned so much from you."],
    Anyone:["You are amazing just the way you are!","I hope you have a wonderful day.","You make the world a better place.","Sending you a big smile today!","You matter so much.","Thanks for being you!"]
  };

  /* ---------- State ---------- */
  var state = {
    cardId: null,     // selected design id (from CARDS) — may be null for plain gradient
    img: null,        // background image (for kc-* art cards)
    bg: GRADS[2].css, // background css when no image
    to: "", msg: "", from: "",
    font: "fredoka",
    textColor: "#2a2052",
    stickers: []      // {emoji,x,y} in percentages
  };
  var armedSticker = null;
  var SAVE_KEY = "red5_cc_draft";

  function el(id){ return document.getElementById(id); }
  function esc(s){ return String(s).replace(/[&<>"]/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]; }); }
  function toast(m){ var t=el("ccToast"); t.textContent=m; t.classList.add("show"); clearTimeout(t._t); t._t=setTimeout(function(){ t.classList.remove("show"); },1800); }

  function fontCss(id){ var f=FONTS.filter(function(x){return x.id===id;})[0]; return f?f.css:FONTS[0].css; }

  /* ---------- Build controls ---------- */
  function buildDesigns(){
    var wrap = el("ccDesigns");
    var html = "";
    // image cards first
    CARDS.filter(function(c){ return c.img; }).forEach(function(c){
      html += '<button type="button" class="cc-design" data-card="'+c.id+'" title="'+esc(c.title)+'"><img src="'+c.img+'" alt="'+esc(c.title)+'"></button>';
    });
    // gradient designs
    GRADS.forEach(function(g){
      html += '<button type="button" class="cc-design" data-grad="'+g.css+'" style="background:'+g.css+'"><span class="lbl">✨</span></button>';
    });
    wrap.innerHTML = html;
    wrap.addEventListener("click", function(e){
      var b = e.target.closest(".cc-design"); if(!b) return;
      if(b.hasAttribute("data-card")){ selectCard(b.getAttribute("data-card")); }
      else { selectGradient(b.getAttribute("data-grad")); }
      markSel(wrap, b);
    });
  }

  function markSel(wrap, btn){ Array.prototype.forEach.call(wrap.children, function(c){ c.classList.toggle("sel", c===btn); }); }

  function buildFonts(){
    var wrap = el("ccFonts");
    wrap.innerHTML = FONTS.map(function(f){
      return '<button type="button" class="cc-fontbtn'+(f.id===state.font?" sel":"")+'" data-font="'+f.id+'" style="font-family:'+f.css+'">'+f.label+'</button>';
    }).join("");
    wrap.addEventListener("click", function(e){
      var b=e.target.closest(".cc-fontbtn"); if(!b) return;
      state.font = b.getAttribute("data-font"); markSelClass(wrap,b,"sel");
      applyFace(); save();
    });
  }

  function buildSwatches(){
    var tc = el("ccTextColors");
    tc.innerHTML = TEXT_COLORS.map(function(c){
      return '<button type="button" class="cc-sw'+(c===state.textColor?" sel":"")+'" data-color="'+c+'" style="background:'+c+'"></button>';
    }).join("");
    tc.addEventListener("click", function(e){ var b=e.target.closest(".cc-sw"); if(!b) return; state.textColor=b.getAttribute("data-color"); markSelClass(tc,b,"sel"); applyFace(); save(); });

    var gr = el("ccGrads");
    gr.innerHTML = GRADS.map(function(g){
      return '<button type="button" class="cc-grad" data-grad="'+g.css+'" style="background:'+g.css+'"></button>';
    }).join("");
    gr.addEventListener("click", function(e){ var b=e.target.closest(".cc-grad"); if(!b) return; selectGradient(b.getAttribute("data-grad")); markSelClass(gr,b,"sel"); clearSel(el("ccBgColors")); });

    var bc = el("ccBgColors");
    bc.innerHTML = SOLIDS.map(function(c){
      return '<button type="button" class="cc-sw" data-bg="'+c+'" style="background:'+c+'"></button>';
    }).join("");
    bc.addEventListener("click", function(e){ var b=e.target.closest(".cc-sw"); if(!b) return; selectGradient(b.getAttribute("data-bg")); markSelClass(bc,b,"sel"); clearSel(el("ccGrads")); });
  }

  function markSelClass(wrap, btn, cls){ Array.prototype.forEach.call(wrap.children, function(c){ c.classList.toggle(cls, c===btn); }); }
  function clearSel(wrap){ if(wrap) Array.prototype.forEach.call(wrap.children, function(c){ c.classList.remove("sel"); }); }

  function buildTray(){
    var wrap = el("ccTray");
    wrap.innerHTML = STICKERS.map(function(s){ return '<button type="button" data-sticker="'+s+'">'+s+'</button>'; }).join("");
    wrap.addEventListener("click", function(e){
      var b=e.target.closest("button"); if(!b) return;
      var s=b.getAttribute("data-sticker");
      if(armedSticker===s){ disarm(); }
      else {
        armedSticker=s;
        Array.prototype.forEach.call(wrap.children, function(c){ c.classList.toggle("armed", c===b); });
        el("ccStage").classList.add("aiming");
        toast("Now tap your card to place "+s);
      }
    });
    el("ccClearStick").addEventListener("click", function(){ state.stickers=[]; renderStickers(); save(); });
  }
  function disarm(){ armedSticker=null; el("ccStage").classList.remove("aiming"); Array.prototype.forEach.call(el("ccTray").children,function(c){c.classList.remove("armed");}); }

  /* ---------- Selection ---------- */
  function selectCard(id){
    var c = CARDS.filter(function(x){ return x.id===id; })[0]; if(!c) return;
    state.cardId = id;
    if(c.img){ state.img = c.img; }
    else { state.img = null; state.bg = c.bg; }
    // Gradient cards: seed a default message (only if the kid hasn't typed yet).
    // Image-art cards already carry their own greeting, so leave the overlay empty.
    if(!c.img && !state.msg){ state.msg = c.msg || ""; el("ccMsg").value = state.msg; }
    if(!c.img && c.fg){ state.textColor = c.fg; refreshTextColorSel(); }
    applyAll(); save();
  }
  function selectGradient(css){ state.cardId=null; state.img=null; state.bg=css; applyAll(); save(); }

  function refreshTextColorSel(){
    var tc = el("ccTextColors");
    Array.prototype.forEach.call(tc.children, function(c){ c.classList.toggle("sel", c.getAttribute("data-color")===state.textColor); });
  }

  /* ---------- Render ---------- */
  function applyAll(){ applyBg(); applyFace(); renderStickers(); }

  function applyBg(){
    var art = el("ccArt"), stage = el("ccStage");
    if(state.img){ art.src = state.img; art.style.display="block"; stage.style.background="#fff"; stage.classList.add("img-mode"); }
    else { art.style.display="none"; art.removeAttribute("src"); stage.style.background = state.bg; stage.classList.remove("img-mode"); }
  }

  function applyFace(){
    var face = el("ccFace");
    face.style.setProperty("--cc-font", fontCss(state.font));
    // On image-art cards the artwork supplies its own colorful greeting; keep
    // the kid's personal note dark for legibility over the soft text panel.
    face.style.color = state.img ? "#2a2052" : state.textColor;
    var hasText = !!(state.to || (state.msg && state.img) || state.from);
    face.classList.toggle("has-note", state.img && hasText);
    el("ccFaceTo").textContent   = state.to ? ("Dear "+state.to+",") : "";
    // On image cards, only show the placeholder for the gradient flow — image art
    // already greets the reader, so a blank overlay keeps it clean.
    if(state.img){
      el("ccFaceMsg").textContent  = state.msg || "";
      el("ccFaceMsg").style.opacity = "1";
    } else {
      el("ccFaceMsg").textContent  = state.msg || "Write something kind…";
      el("ccFaceMsg").style.opacity = state.msg ? "1" : ".5";
    }
    el("ccFaceFrom").textContent = state.from ? ("Love, "+state.from) : "";
  }

  function renderStickers(){
    var layer = el("ccStickers");
    layer.innerHTML = state.stickers.map(function(s,i){
      return '<span class="cc-sticker" data-i="'+i+'" style="left:'+s.x+'%;top:'+s.y+'%">'+s.emoji+'</span>';
    }).join("");
  }

  /* ---------- Stage interactions: place + drag stickers ---------- */
  function stagePoint(stage, clientX, clientY){
    var r = stage.getBoundingClientRect();
    return { x: Math.max(2, Math.min(98, ((clientX-r.left)/r.width)*100)),
             y: Math.max(2, Math.min(98, ((clientY-r.top)/r.height)*100)) };
  }

  function setupStage(){
    var stage = el("ccStage");
    var dragIdx = null;

    function onDown(e){
      var t = e.target.closest(".cc-sticker");
      if(t && armedSticker===null){
        dragIdx = parseInt(t.getAttribute("data-i"),10);
        e.preventDefault();
        return;
      }
      if(armedSticker!==null){
        var ev = e.touches ? e.touches[0] : e;
        var p = stagePoint(stage, ev.clientX, ev.clientY);
        state.stickers.push({ emoji:armedSticker, x:Math.round(p.x), y:Math.round(p.y) });
        renderStickers(); disarm(); save();
      }
    }
    function onMove(e){
      if(dragIdx===null) return;
      e.preventDefault();
      var ev = e.touches ? e.touches[0] : e;
      var p = stagePoint(stage, ev.clientX, ev.clientY);
      if(state.stickers[dragIdx]){ state.stickers[dragIdx].x=Math.round(p.x); state.stickers[dragIdx].y=Math.round(p.y); renderStickers(); }
    }
    function onUp(){ if(dragIdx!==null){ dragIdx=null; save(); } }

    stage.addEventListener("mousedown", onDown);
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
    stage.addEventListener("touchstart", onDown, {passive:false});
    document.addEventListener("touchmove", onMove, {passive:false});
    document.addEventListener("touchend", onUp);

    // double-click a sticker removes it
    stage.addEventListener("dblclick", function(e){
      var t=e.target.closest(".cc-sticker"); if(!t) return;
      var i=parseInt(t.getAttribute("data-i"),10); state.stickers.splice(i,1); renderStickers(); save();
    });
  }

  /* ---------- Text inputs ---------- */
  function setupInputs(){
    el("ccTo").addEventListener("input", function(){ state.to=this.value; applyFace(); save(); });
    el("ccFrom").addEventListener("input", function(){ state.from=this.value; applyFace(); save(); });
    el("ccMsg").addEventListener("input", function(){ state.msg=this.value; applyFace(); save(); });
  }

  /* ---------- AI writing assistant (curated, not real AI) ---------- */
  function setupSuggest(){
    el("ccSuggest").addEventListener("click", function(){
      var who = el("ccWho").value;
      var list = SUGGESTIONS[who] || SUGGESTIONS.Anyone;
      // avoid repeating the exact same message twice in a row
      var pick, tries=0;
      do { pick = list[Math.floor(Math.random()*list.length)]; tries++; } while(pick===state.msg && tries<6 && list.length>1);
      state.msg = pick; el("ccMsg").value = pick; applyFace(); save();
      toast("Here's a kind idea! 💛");
    });
  }

  /* ---------- Autosave ---------- */
  function save(){ try{ localStorage.setItem(SAVE_KEY, JSON.stringify(state)); }catch(e){} }
  function load(){
    try{ var s=JSON.parse(localStorage.getItem(SAVE_KEY)); if(s && typeof s==="object"){ return s; } }catch(e){}
    return null;
  }

  /* ---------- Render to canvas (Save PNG) ---------- */
  function renderToCanvas(cb){
    var W=1000, H=1200; // 5:6
    var cv=document.createElement("canvas"); cv.width=W; cv.height=H;
    var ctx=cv.getContext("2d");

    function drawText(){
      // overlay text + stickers
      ctx.textAlign="center"; ctx.fillStyle=state.textColor;
      var cx=W/2;
      ctx.font="700 44px "+fontCss(state.font);
      if(state.to){ ctx.fillText("Dear "+state.to+",", cx, H*0.18); }
      // message — wrap
      var msg=state.msg||"";
      ctx.font="700 66px "+fontCss(state.font);
      var lines=wrap(ctx, msg, W*0.82);
      var startY=H*0.5 - (lines.length-1)*42;
      lines.forEach(function(ln,i){ ctx.fillText(ln, cx, startY + i*82); });
      if(state.from){ ctx.font="600 40px "+fontCss(state.font); ctx.fillText("Love, "+state.from, cx, H*0.86); }
      // stickers
      ctx.textAlign="center"; ctx.textBaseline="middle"; ctx.font="80px serif";
      state.stickers.forEach(function(s){ ctx.fillText(s.emoji, W*s.x/100, H*s.y/100); });
      ctx.textBaseline="alphabetic";
      cb(cv);
    }

    if(state.img){
      var im=new Image(); im.crossOrigin="anonymous";
      im.onload=function(){ ctx.drawImage(im,0,0,W,H); drawText(); };
      im.onerror=function(){ ctx.fillStyle="#fff5f9"; ctx.fillRect(0,0,W,H); drawText(); };
      im.src=state.img;
    } else {
      paintGradient(ctx,W,H,state.bg); drawText();
    }
  }

  function paintGradient(ctx,W,H,css){
    // parse "linear-gradient(160deg,#a,#b)" or solid hex
    var m = /linear-gradient\([^,]+,\s*([^,]+),\s*([^)]+)\)/.exec(css);
    if(m){
      var g=ctx.createLinearGradient(0,0,W,H);
      g.addColorStop(0, m[1].trim()); g.addColorStop(1, m[2].trim());
      ctx.fillStyle=g;
    } else { ctx.fillStyle=css; }
    ctx.fillRect(0,0,W,H);
  }

  function wrap(ctx, text, maxW){
    var out=[]; (text||"").split("\n").forEach(function(para){
      var words=para.split(/\s+/), line="";
      words.forEach(function(w){
        var test=line?line+" "+w:w;
        if(ctx.measureText(test).width>maxW && line){ out.push(line); line=w; }
        else line=test;
      });
      out.push(line);
    });
    return out.filter(function(l){return l!=="";}).length?out:[""];
  }

  function setupButtons(){
    el("ccSave").addEventListener("click", function(){
      renderToCanvas(function(cv){
        try{
          var a=document.createElement("a");
          a.download="my-kindness-card.png";
          a.href=cv.toDataURL("image/png");
          a.click();
          toast("Saved your card! 🎉");
          showFinish();
        }catch(e){ toast("Couldn't save — try Print instead."); }
      });
    });
    el("ccPrint").addEventListener("click", function(){ window.print(); setTimeout(showFinish, 600); });
    el("ccPdf").addEventListener("click", function(){
      toast("Choose \"Save as PDF\" in the print window 📄");
      setTimeout(function(){ window.print(); }, 700);
    });
    el("ccModalClose").addEventListener("click", function(){ el("ccModal").classList.remove("show"); });
    el("ccModal").addEventListener("click", function(e){ if(e.target===el("ccModal")) el("ccModal").classList.remove("show"); });
  }
  function showFinish(){ el("ccModal").classList.add("show"); }

  /* ---------- Init ---------- */
  function init(){
    buildDesigns(); buildFonts(); buildSwatches(); buildTray();
    setupStage(); setupInputs(); setupSuggest(); setupButtons();

    // 1) load draft  2) override with ?card= if present
    var draft = load();
    if(draft){ state = Object.assign(state, draft); if(!Array.isArray(state.stickers)) state.stickers=[]; }

    var params = new URLSearchParams(location.search);
    var cardParam = params.get("card");

    // reflect loaded text
    el("ccTo").value=state.to||""; el("ccFrom").value=state.from||""; el("ccMsg").value=state.msg||"";

    if(cardParam && CARDS.some(function(c){return c.id===cardParam;})){
      selectCard(cardParam);
    } else if(!state.cardId && !draft){
      selectCard(CARDS[0] ? CARDS[0].id : null);
    }

    // reflect selections in UI
    refreshTextColorSel();
    markSelClass(el("ccFonts"), [].slice.call(el("ccFonts").children).filter(function(c){return c.getAttribute("data-font")===state.font;})[0], "sel");
    // mark selected design
    var sel = [].slice.call(el("ccDesigns").children).filter(function(c){
      return (state.cardId && c.getAttribute("data-card")===state.cardId) || (!state.img && c.getAttribute("data-grad")===state.bg);
    })[0];
    if(sel) markSel(el("ccDesigns"), sel);

    applyAll();
  }

  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
