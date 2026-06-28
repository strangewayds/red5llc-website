/* ==========================================================================
   Red 5 — Play Zone games. Real, self-contained, kid-friendly games that run
   in the browser. Free games launch in an overlay; Club games link to join.
   Loaded on play-zone.html (after app.js).
   ========================================================================== */
(function () {
  "use strict";

  function el(t, c, h){ var e=document.createElement(t); if(c) e.className=c; if(h!=null) e.innerHTML=h; return e; }
  function shuffle(a){ for(var i=a.length-1;i>0;i--){ var j=Math.floor(Math.random()*(i+1)); var t=a[i];a[i]=a[j];a[j]=t; } return a; }
  function ri(min,max){ return Math.floor(Math.random()*(max-min+1))+min; }

  var overlay, panel, head, titleEl, stage, cleanup=null, currentId=null;

  /* Inject styles for the new games (keeps styles.css untouched). */
  (function injectStyles(){
    var css = [
      /* Tic-Tac-Toe */
      ".ttt-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:.5rem;max-width:300px;margin:.8rem auto 0;}",
      ".ttt-cell{aspect-ratio:1;border:none;border-radius:14px;background:var(--accent-soft);font-size:2.6rem;line-height:1;cursor:pointer;font-family:var(--font-display);color:var(--navy);box-shadow:0 4px 10px rgba(0,0,0,.08);transition:transform .1s;}",
      ".ttt-cell:hover:not(:disabled){transform:translateY(-2px);}",
      ".ttt-cell:disabled{cursor:default;}",
      ".ttt-cell.win{background:#fff3cf;}",
      /* Whack-a-Star */
      ".whack-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:.6rem;max-width:360px;margin:.8rem auto 0;}",
      ".whack-hole{aspect-ratio:1;border-radius:50%;background:radial-gradient(circle at 50% 35%,#6b4a2a,#3d2a17);box-shadow:inset 0 -6px 12px rgba(0,0,0,.35);display:flex;align-items:center;justify-content:center;overflow:hidden;}",
      ".whack-mole{font-size:2.4rem;line-height:1;background:none;border:none;cursor:pointer;padding:0;transform:translateY(120%);transition:transform .12s ease;}",
      ".whack-mole.up{transform:translateY(0);}",
      ".whack-mole:active{transform:translateY(0) scale(1.15);}",
      /* Simon Says (color sequence) */
      ".simon-board{display:grid;grid-template-columns:repeat(2,1fr);gap:.7rem;max-width:300px;margin:.9rem auto;}",
      ".simon-pad{aspect-ratio:1;border:none;border-radius:18px;cursor:pointer;opacity:.55;transition:opacity .12s,transform .1s;box-shadow:0 6px 14px rgba(0,0,0,.15);}",
      ".simon-pad.lit{opacity:1;transform:scale(1.04);}",
      ".simon-g{background:#3ddc84;} .simon-r{background:#ff6b6b;} .simon-y{background:#ffd23f;} .simon-b{background:#56a8e6;}",
      /* Bubble Pop Math */
      ".math-q{text-align:center;font-family:var(--font-display);font-size:2rem;color:var(--navy);margin:.4rem 0 .2rem;}",
      ".bubble-arena{position:relative;height:300px;border-radius:18px;overflow:hidden;margin:.6rem 0;background:linear-gradient(180deg,#e0f7ff,#f0fbff);box-shadow:inset 0 0 0 2px #d6eef7;}",
      ".bubble{position:absolute;transform:translate(-50%,-50%);width:62px;height:62px;border-radius:50%;border:none;cursor:pointer;font-family:var(--font-display);font-size:1.4rem;font-weight:700;color:#fff;box-shadow:0 6px 14px rgba(0,0,0,.18);display:flex;align-items:center;justify-content:center;}",
      ".bubble.b0{background:#ff6b6b;} .bubble.b1{background:#56a8e6;} .bubble.b2{background:#3ddc84;} .bubble.b3{background:#b894ff;} .bubble.b4{background:#ffab3d;}",
      ".bubble:active{transform:translate(-50%,-50%) scale(1.12);}",
      /* Sliding Puzzle */
      ".slide-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:.45rem;max-width:300px;margin:.8rem auto 0;}",
      ".slide-tile{aspect-ratio:1;border:none;border-radius:14px;background:var(--accent);color:#fff;font-family:var(--font-display);font-size:1.8rem;cursor:pointer;box-shadow:0 4px 10px rgba(0,0,0,.12);transition:transform .08s;}",
      ".slide-tile:active{transform:scale(.95);}",
      ".slide-tile.blank{background:transparent;box-shadow:none;cursor:default;}"
    ].join("\n");
    var s = document.createElement("style");
    s.setAttribute("data-red5-games","");
    s.textContent = css;
    document.head.appendChild(s);
  })();

  function build(){
    overlay = el("div","game-overlay");
    panel = el("div","game-panel");
    head = el("div","game-head","<h3></h3><button class='game-close' type='button' aria-label='Close game'>&times;</button>");
    titleEl = head.querySelector("h3");
    stage = el("div","game-stage");
    panel.appendChild(head); panel.appendChild(stage); overlay.appendChild(panel);
    document.body.appendChild(overlay);
    head.querySelector(".game-close").addEventListener("click", close);
    overlay.addEventListener("click", function(e){ if(e.target===overlay) close(); });
    document.addEventListener("keydown", function(e){ if(e.key==="Escape" && overlay.classList.contains("open")) close(); });
  }

  function launch(id){
    if(!GAMES[id]) return;
    if(!overlay) build();
    if(cleanup){ try{ cleanup(); }catch(e){} cleanup=null; }
    currentId = id;
    titleEl.textContent = GAMES[id].title;
    stage.innerHTML = "";
    cleanup = GAMES[id].render(stage) || null;
    overlay.classList.add("open");
    document.body.style.overflow = "hidden";
    stage.scrollTop = 0;
  }
  function replay(){ launch(currentId); }
  function close(){
    if(cleanup){ try{ cleanup(); }catch(e){} cleanup=null; }
    if(overlay) overlay.classList.remove("open");
    document.body.style.overflow = "";
  }

  // Shared "Play again / Back" buttons for end screens.
  function actions(){
    var wrap = el("div","g-actions");
    var again = el("button","btn btn-red","🔄 Play Again"); again.type="button";
    again.addEventListener("click", replay);
    var back = el("button","btn btn-outline","Back to Games"); back.type="button";
    back.addEventListener("click", close);
    wrap.appendChild(again); wrap.appendChild(back);
    return wrap;
  }

  var GAMES = {};

  /* ---------------------------- Memory Match ---------------------------- */
  GAMES.memory = { title:"Memory Match", render:function(stage){
    var pool = ["🐶","🐱","🦊","🐼","🐰","🐸","🦋","⭐","🌈","🍎","🌸","🚀"];
    var pics = shuffle(pool.slice()).slice(0,6);
    var deck = shuffle(pics.concat(pics));
    var moves=0, pairs=0, first=null, busy=false;

    var info = el("div","g-info","<span>Moves: <b class='mv'>0</b></span><span>Pairs: <b class='pr'>0</b>/6</span>");
    var help = el("p","g-help","Flip two cards to find a matching pair. Match all 6!");
    var grid = el("div","memgrid");

    deck.forEach(function(sym){
      var c = el("button","memcard"); c.type="button"; c.textContent = sym;
      c.addEventListener("click", function(){
        if(busy || c.classList.contains("flipped") || c.classList.contains("done")) return;
        c.classList.add("flipped");
        if(!first){ first = c; return; }
        moves++; info.querySelector(".mv").textContent = moves;
        if(first.textContent === c.textContent){
          first.classList.add("done"); c.classList.add("done");
          pairs++; info.querySelector(".pr").textContent = pairs; first = null;
          if(pairs === 6){ setTimeout(finish, 450); }
        } else {
          busy = true; var a=first, b=c; first=null;
          setTimeout(function(){ a.classList.remove("flipped"); b.classList.remove("flipped"); busy=false; }, 820);
        }
      });
      grid.appendChild(c);
    });

    function finish(){
      stage.innerHTML = "";
      stage.appendChild(el("div","g-msg","<span class='big'>🎉</span>You did it!"));
      stage.appendChild(el("p","g-help","You matched all 6 pairs in "+moves+" moves. Amazing memory!"));
      stage.appendChild(actions());
    }

    stage.appendChild(info); stage.appendChild(help); stage.appendChild(grid);
    return null;
  }};

  /* ---------------------------- Star Catcher ---------------------------- */
  GAMES.stars = { title:"Star Catcher", render:function(stage){
    var score=0, time=30, spawn, tick, over=false;
    var info = el("div","g-info","<span>⭐ Score: <b class='sc'>0</b></span><span>⏰ Time: <b class='tm'>30</b>s</span>");
    var help = el("p","g-help","Tap the stars before they disappear. Catch as many as you can in 30 seconds!");
    var arena = el("div","g-arena");

    function addStar(){
      if(over) return;
      var faces = ["⭐","🌟","✨"];
      var s = el("button","g-star", faces[ri(0,2)]); s.type="button";
      s.style.left = ri(8,92)+"%"; s.style.top = ri(12,88)+"%";
      var life = setTimeout(function(){ s.remove(); }, ri(900,1500));
      s.addEventListener("click", function(){
        if(over) return;
        clearTimeout(life);
        score++; info.querySelector(".sc").textContent = score;
        s.remove();
      });
      arena.appendChild(s);
    }

    spawn = setInterval(addStar, 650); addStar(); addStar();
    tick = setInterval(function(){
      time--; info.querySelector(".tm").textContent = time;
      if(time <= 0) finish();
    }, 1000);

    function finish(){
      over = true; clearInterval(spawn); clearInterval(tick);
      var note = score>=20 ? "Superstar! 🌟" : score>=10 ? "Great catching! 👏" : "Nice try — give it another go!";
      stage.innerHTML = "";
      stage.appendChild(el("div","g-msg","<span class='big'>⭐</span>"+score+" stars caught!"));
      stage.appendChild(el("p","g-help", note));
      stage.appendChild(actions());
    }

    stage.appendChild(info); stage.appendChild(help); stage.appendChild(arena);
    return function(){ over=true; clearInterval(spawn); clearInterval(tick); };
  }};

  /* ---------------------------- Tic-Tac-Toe ---------------------------- */
  GAMES.tictactoe = { title:"Tic-Tac-Toe", render:function(stage){
    var YOU="❌", CPU="⭕", board=["","","","","","","","",""], done=false;
    var wins=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
    var info = el("div","g-info","<span>You: ❌</span><span>Rosie's helper: ⭕</span>");
    var help = el("p","g-help","Get three ❌ in a row across, down, or diagonally!");
    var grid = el("div","ttt-grid");
    var cells = [];
    for(var i=0;i<9;i++){
      (function(idx){
        var c = el("button","ttt-cell"); c.type="button";
        c.addEventListener("click", function(){ play(idx); });
        cells.push(c); grid.appendChild(c);
      })(i);
    }
    function winner(b){
      for(var w=0;w<wins.length;w++){ var L=wins[w];
        if(b[L[0]] && b[L[0]]===b[L[1]] && b[L[1]]===b[L[2]]) return {who:b[L[0]],line:L}; }
      return null;
    }
    function play(idx){
      if(done || board[idx]) return;
      board[idx]=YOU; cells[idx].textContent=YOU; cells[idx].disabled=true;
      var w=winner(board);
      if(w){ return finish(w); }
      if(board.indexOf("")===-1){ return finish(null); }
      setTimeout(cpuMove, 350);
    }
    function cpuMove(){
      if(done) return;
      var move = pick(CPU) || pick(YOU); // win, else block
      if(move==null){ // center, else corner, else any
        if(!board[4]) move=4; else {
          var pref=[0,2,6,8,1,3,5,7], j;
          for(j=0;j<pref.length;j++){ if(!board[pref[j]]){ move=pref[j]; break; } }
        }
      }
      if(move==null) return;
      board[move]=CPU; cells[move].textContent=CPU; cells[move].disabled=true;
      var w=winner(board);
      if(w) return finish(w);
      if(board.indexOf("")===-1) return finish(null);
    }
    function pick(sym){
      for(var w=0;w<wins.length;w++){ var L=wins[w];
        var vals=[board[L[0]],board[L[1]],board[L[2]]];
        var cnt=0, empty=-1;
        for(var k=0;k<3;k++){ if(vals[k]===sym) cnt++; else if(vals[k]==="") empty=L[k]; }
        if(cnt===2 && empty>=0) return empty;
      }
      return null;
    }
    function finish(w){
      done=true;
      for(var i=0;i<9;i++) cells[i].disabled=true;
      var msg, emoji;
      if(w && w.who===YOU){ msg="You win! 🎉"; emoji="🏆"; w.line.forEach(function(i){ cells[i].classList.add("win"); }); }
      else if(w){ msg="The helper got three in a row!"; emoji="⭕"; w.line.forEach(function(i){ cells[i].classList.add("win"); }); }
      else { msg="It's a tie — well played!"; emoji="🤝"; }
      setTimeout(function(){
        stage.innerHTML="";
        stage.appendChild(el("div","g-msg","<span class='big'>"+emoji+"</span>"+msg));
        stage.appendChild(actions());
      }, w ? 600 : 300);
    }
    stage.appendChild(info); stage.appendChild(help); stage.appendChild(grid);
    return null;
  }};

  /* ---------------------------- Whack-a-Star --------------------------- */
  GAMES.whack = { title:"Whack-a-Star", render:function(stage){
    var score=0, time=25, over=false, spawn, tick, hideTimers=[];
    var info = el("div","g-info","<span>⭐ Score: <b class='sc'>0</b></span><span>⏰ Time: <b class='tm'>25</b>s</span>");
    var help = el("p","g-help","Tap the stars as they pop out of the holes — but be quick!");
    var grid = el("div","whack-grid");
    var moles=[];
    for(var i=0;i<9;i++){
      var hole = el("div","whack-hole");
      var m = el("button","whack-mole","⭐"); m.type="button"; m.dataBad=false;
      (function(mole){
        mole.addEventListener("click", function(){
          if(over || !mole.classList.contains("up")) return;
          mole.classList.remove("up");
          if(mole.dataBad){ // bomb: lose a couple of seconds
            time = Math.max(1, time-3); info.querySelector(".tm").textContent=time;
          } else {
            score++; info.querySelector(".sc").textContent=score;
          }
        });
      })(m);
      hole.appendChild(m); grid.appendChild(hole); moles.push(m);
    }
    function popOne(){
      if(over) return;
      var idle=[]; for(var i=0;i<moles.length;i++){ if(!moles[i].classList.contains("up")) idle.push(moles[i]); }
      if(!idle.length) return;
      var m = idle[ri(0,idle.length-1)];
      var bad = Math.random()<0.18;
      m.dataBad = bad;
      m.textContent = bad ? "💣" : ["⭐","🌟","✨"][ri(0,2)];
      m.classList.add("up");
      var life = setTimeout(function(){ m.classList.remove("up"); }, ri(700,1200));
      hideTimers.push(life);
    }
    spawn = setInterval(popOne, 600); popOne();
    tick = setInterval(function(){
      if(over) return;
      time--; info.querySelector(".tm").textContent=time;
      if(time<=0) finish();
    }, 1000);
    function finish(){
      over=true; clearInterval(spawn); clearInterval(tick);
      hideTimers.forEach(clearTimeout);
      var note = score>=20?"Star master! 🌟":score>=10?"Great whacking! 👏":"Nice try — go again!";
      stage.innerHTML="";
      stage.appendChild(el("div","g-msg","<span class='big'>⭐</span>"+score+" stars!"));
      stage.appendChild(el("p","g-help",note));
      stage.appendChild(actions());
    }
    stage.appendChild(info); stage.appendChild(help); stage.appendChild(grid);
    return function(){ over=true; clearInterval(spawn); clearInterval(tick); hideTimers.forEach(clearTimeout); };
  }};

  /* ------------------------- Simon (Color Echo) ------------------------ */
  GAMES.simon = { title:"Color Echo", render:function(stage){
    var COLORS=[{c:"simon-g"},{c:"simon-r"},{c:"simon-y"},{c:"simon-b"}];
    var seq=[], step=0, level=0, playing=false, over=false, timers=[];
    var info = el("div","g-info","<span>Round: <b class='lv'>0</b></span><span>Best: <b class='bs'>0</b></span>");
    var help = el("p","g-help","Watch the colors light up, then tap them back in the same order!");
    var board = el("div","simon-board");
    var pads=[];
    COLORS.forEach(function(col,i){
      var p = el("button","simon-pad "+col.c); p.type="button";
      (function(idx){ p.addEventListener("click", function(){ tap(idx); }); })(i);
      board.appendChild(p); pads.push(p);
    });
    function light(i,ms){
      pads[i].classList.add("lit");
      var t=setTimeout(function(){ pads[i].classList.remove("lit"); }, ms);
      timers.push(t);
    }
    function next(){
      seq.push(ri(0,3)); level=seq.length; info.querySelector(".lv").textContent=level;
      step=0; playing=true;
      var delay=500;
      seq.forEach(function(idx,n){
        var t=setTimeout(function(){ light(idx,350); }, delay*(n+1));
        timers.push(t);
      });
      var endT=setTimeout(function(){ playing=false; }, delay*(seq.length+1));
      timers.push(endT);
    }
    function tap(i){
      if(playing||over) return;
      light(i,200);
      if(i===seq[step]){
        step++;
        if(step===seq.length){
          var best=parseInt(info.querySelector(".bs").textContent,10);
          if(level>best) info.querySelector(".bs").textContent=level;
          setTimeout(next, 700);
        }
      } else { finish(); }
    }
    function finish(){
      over=true; timers.forEach(clearTimeout);
      stage.innerHTML="";
      stage.appendChild(el("div","g-msg","<span class='big'>🎵</span>You reached round "+(level)+"!"));
      stage.appendChild(el("p","g-help", level>=6?"Incredible memory! 🌟":level>=3?"Nicely done! 👏":"Keep practicing — you've got this!"));
      stage.appendChild(actions());
    }
    stage.appendChild(info); stage.appendChild(help); stage.appendChild(board);
    setTimeout(next, 700);
    return function(){ over=true; timers.forEach(clearTimeout); };
  }};

  /* ------------------------- Bubble Pop Math --------------------------- */
  GAMES.bubblemath = { title:"Bubble Pop Math", render:function(stage){
    var score=0, lives=3, over=false, spawn, qa, qb, answer, bubbles=[];
    var info = el("div","g-info","<span>⭐ Score: <b class='sc'>0</b></span><span>❤️ Lives: <b class='lv'>3</b></span>");
    var q = el("div","math-q","");
    var help = el("p","g-help","Pop the bubble with the correct answer!");
    var arena = el("div","bubble-arena");

    function newQuestion(){
      clearBubbles();
      qa=ri(1,9); qb=ri(1,9);
      var op = Math.random()<0.5 ? "+" : "×";
      if(op==="+"){ answer=qa+qb; q.textContent=qa+" + "+qb+" = ?"; }
      else { answer=qa*qb; q.textContent=qa+" × "+qb+" = ?"; }
      // build 4 unique options including the answer
      var opts=[answer];
      var guard=0;
      while(opts.length<4 && guard<50){
        var d = answer + ri(-6,6);
        if(d>0 && opts.indexOf(d)===-1) opts.push(d);
        guard++;
      }
      while(opts.length<4) opts.push(answer+opts.length); // fallback
      shuffle(opts);
      opts.forEach(function(val,i){
        var b = el("button","bubble b"+i, ""+val); b.type="button";
        b.style.left = (15 + i*22 + ri(-4,4)) + "%";
        b.style.top = ri(20,80) + "%";
        (function(value){
          b.addEventListener("click", function(){ if(!over) answerPicked(value); });
        })(val);
        arena.appendChild(b); bubbles.push(b);
      });
    }
    function clearBubbles(){ bubbles.forEach(function(b){ b.remove(); }); bubbles=[]; }
    function answerPicked(val){
      if(val===answer){
        score++; info.querySelector(".sc").textContent=score;
        if(score>=10){ return finish(true); }
        newQuestion();
      } else {
        lives--; info.querySelector(".lv").textContent=lives;
        if(lives<=0){ return finish(false); }
      }
    }
    function finish(won){
      over=true; clearBubbles();
      stage.innerHTML="";
      stage.appendChild(el("div","g-msg","<span class='big'>"+(won?"🏆":"🫧")+"</span>"+(won?"You scored 10! Math whiz!":"You got "+score+" right!")));
      stage.appendChild(el("p","g-help", won?"Amazing work! 🌟":"Great effort — try again!"));
      stage.appendChild(actions());
    }
    stage.appendChild(info); stage.appendChild(q); stage.appendChild(help); stage.appendChild(arena);
    newQuestion();
    return function(){ over=true; };
  }};

  /* --------------------------- Sliding Puzzle ------------------------- */
  GAMES.slide = { title:"Sliding Puzzle", render:function(stage){
    var N=3, size=N*N, tiles, moves=0, blank=size-1;
    var info = el("div","g-info","<span>Moves: <b class='mv'>0</b></span><span>1 → 8 in order</span>");
    var help = el("p","g-help","Tap a tile next to the empty space to slide it. Put 1-8 in order!");
    var grid = el("div","slide-grid");
    function solvable(arr){
      var inv=0;
      for(var i=0;i<arr.length;i++){ if(arr[i]===0) continue;
        for(var j=i+1;j<arr.length;j++){ if(arr[j]!==0 && arr[i]>arr[j]) inv++; } }
      return inv%2===0; // for 3x3 (odd grid width), solvable iff even inversions
    }
    function makeBoard(){
      do { tiles = shuffle([1,2,3,4,5,6,7,8,0]); }
      while(!solvable(tiles) || isSolved());
      blank = tiles.indexOf(0);
    }
    function isSolved(){
      for(var i=0;i<8;i++){ if(tiles[i]!==i+1) return false; }
      return tiles[8]===0;
    }
    function render(){
      grid.innerHTML="";
      tiles.forEach(function(v,i){
        var t = el("button","slide-tile"+(v===0?" blank":""), v===0?"":(""+v)); t.type="button";
        if(v!==0){
          (function(idx){ t.addEventListener("click", function(){ tryMove(idx); }); })(i);
        }
        grid.appendChild(t);
      });
    }
    function tryMove(i){
      var r=Math.floor(i/N), c=i%N, br=Math.floor(blank/N), bc=blank%N;
      if((r===br && Math.abs(c-bc)===1) || (c===bc && Math.abs(r-br)===1)){
        tiles[blank]=tiles[i]; tiles[i]=0; blank=i;
        moves++; info.querySelector(".mv").textContent=moves;
        render();
        if(isSolved()) finish();
      }
    }
    function finish(){
      setTimeout(function(){
        stage.innerHTML="";
        stage.appendChild(el("div","g-msg","<span class='big'>🧩</span>Solved it!"));
        stage.appendChild(el("p","g-help","You ordered every tile in "+moves+" moves. Brilliant!"));
        stage.appendChild(actions());
      }, 250);
    }
    makeBoard(); render();
    stage.appendChild(info); stage.appendChild(help); stage.appendChild(grid);
    return null;
  }};

  /* ------------------------------- wiring ------------------------------- */
  document.addEventListener("click", function(e){
    var b = e.target.closest("[data-game]");
    if(b){ e.preventDefault(); launch(b.getAttribute("data-game")); }
  });
  window.RED5_GAMES = { launch:launch, close:close };

  // Deep link, e.g. play-zone.html#play=memory
  function fromHash(){ var m=/[#&]play=([a-z]+)/.exec(location.hash || ""); if(m && GAMES[m[1]]) launch(m[1]); }
  if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", fromHash); else fromHash();
})();
