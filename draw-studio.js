/* Draw Studio — a working kid-safe drawing app for Red 5.
   Tools: pencil, marker, brush, eraser, fill bucket, spray, rainbow, plus emoji stickers.
   Undo, New Canvas, Save (PNG) and Print. */
(function(){
  "use strict";
  var W = 1000, H = 680;
  var canvas, ctx, dpr = 1;
  var state = { tool:"brush", color:"#2e5cff", size:10, sticker:null };
  var drawing=false, last=null, hue=0;
  var undoStack = [], UNDO_MAX = 10;

  var TOOLS = [
    {id:"pencil", icon:"✏️"}, {id:"marker", icon:"🖊"}, {id:"brush", icon:"🖌"}, {id:"eraser", icon:"🧽"},
    {id:"fill", icon:"🪣"}, {id:"spray", icon:"💨"}, {id:"magic", icon:"🌈"}, {id:"undo", icon:"↶"}
  ];
  var COLORS = ["#000000","#6b6f76","#b9bec7","#ffffff","#7a1d12","#c0392b","#e8412b","#ff7a18",
                "#ffb02e","#ffcf33","#a8d83a","#3ec46d","#179e7a","#1f9fd6","#2e5cff","#3a2f8f",
                "#8b46d6","#d65bb8","#ff66b3","#ffb3c7","#5a3a22","#9c6b3f","#caa472","#f2d9b0"];
  var STICKERS = {
    All:["⭐","🦄","🐉","🚀","🌈","🐶","🍕","🐱","🎮","😀","🦋","🌸"],
    Animals:["🐶","🐱","🦁","🐼","🦊","🐰","🐸","🐵","🐢","🦋"],
    Fantasy:["🦄","🐉","🧚","🏰","👑","✨","🔮","🌈"],
    Space:["🚀","🪐","⭐","🌟","🌙","☄️","👽","🛸"],
    Nature:["🌳","🌸","🌻","🍄","🌈","☀️","🦋","🍀"],
    Things:["⚽","🎈","🎁","🍕","🍦","🎮","📚","🎨"],
    Emoji:["😀","😎","😍","🤩","😺","👍","❤️","🎉"]
  };

  function el(id){ return document.getElementById(id); }
  function toast(m){ var t=el("dsToast"); t.textContent=m; t.classList.add("show"); clearTimeout(t._t); t._t=setTimeout(function(){t.classList.remove("show");},1700); }

  function pushUndo(){ try{ undoStack.push(ctx.getImageData(0,0,W,H)); if(undoStack.length>UNDO_MAX) undoStack.shift(); }catch(e){} }
  function undo(){ var s=undoStack.pop(); if(s){ ctx.putImageData(s,0,0); } }

  function newCanvas(){ pushUndo(); ctx.fillStyle="#ffffff"; ctx.fillRect(0,0,W,H); toast("Fresh canvas! ✨"); }

  function pos(evt){
    var r = canvas.getBoundingClientRect();
    return { x:(evt.clientX-r.left)*(W/r.width), y:(evt.clientY-r.top)*(H/r.height) };
  }

  function applyStroke(){
    ctx.lineJoin="round"; ctx.lineCap="round"; ctx.globalAlpha=1;
    if(state.tool==="pencil"){ ctx.strokeStyle=state.color; ctx.lineWidth=Math.max(1,state.size*0.55); }
    else if(state.tool==="marker"){ ctx.strokeStyle=state.color; ctx.lineWidth=state.size*1.5; ctx.globalAlpha=0.45; }
    else if(state.tool==="brush"){ ctx.strokeStyle=state.color; ctx.lineWidth=state.size*1.7; }
    else if(state.tool==="eraser"){ ctx.strokeStyle="#ffffff"; ctx.lineWidth=state.size*2.2; }
    else if(state.tool==="magic"){ ctx.lineWidth=state.size*1.7; }
  }

  function down(evt){
    var p = pos(evt);
    if(state.tool==="fill"){ pushUndo(); floodFill(Math.round(p.x), Math.round(p.y), state.color); return; }
    if(state.tool==="sticker" && state.sticker){ pushUndo(); stamp(p.x, p.y, state.sticker); return; }
    if(state.tool==="undo"){ undo(); return; }
    pushUndo();
    drawing = true; last = p; hue = (hue+40)%360;
    applyStroke();
    if(state.tool==="spray"){ spray(p.x,p.y); }
    else { ctx.beginPath(); ctx.moveTo(p.x,p.y); ctx.lineTo(p.x+0.1,p.y+0.1); if(state.tool==="magic"){ctx.strokeStyle="hsl("+hue+",85%,55%)";} ctx.stroke(); }
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  }
  function move(evt){
    if(!drawing) return; var p = pos(evt);
    if(state.tool==="spray"){ spray(p.x,p.y); last=p; return; }
    if(state.tool==="magic"){ hue=(hue+6)%360; ctx.strokeStyle="hsl("+hue+",85%,55%)"; }
    ctx.beginPath(); ctx.moveTo(last.x,last.y); ctx.lineTo(p.x,p.y); ctx.stroke();
    last = p;
  }
  function up(){ drawing=false; ctx.globalAlpha=1; window.removeEventListener("pointermove",move); window.removeEventListener("pointerup",up); }

  function spray(x,y){
    var n = Math.round(state.size*1.2), rad = state.size*1.3;
    ctx.fillStyle = state.tool==="magic" ? "hsl("+((hue+=4)%360)+",85%,55%)" : state.color;
    for(var i=0;i<n;i++){ var a=Math.random()*Math.PI*2, d=Math.random()*rad; ctx.beginPath(); ctx.arc(x+Math.cos(a)*d, y+Math.sin(a)*d, 1.1, 0, Math.PI*2); ctx.fill(); }
  }

  function stamp(x,y,emoji){
    var fs = Math.max(40, state.size*5);
    ctx.font = fs+"px 'Segoe UI Emoji','Noto Color Emoji',sans-serif";
    ctx.textAlign="center"; ctx.textBaseline="middle"; ctx.globalAlpha=1;
    ctx.fillText(emoji, x, y);
  }

  function hexToRgb(h){ h=h.replace('#',''); if(h.length===3){h=h[0]+h[0]+h[1]+h[1]+h[2]+h[2];} return [parseInt(h.substr(0,2),16),parseInt(h.substr(2,2),16),parseInt(h.substr(4,2),16),255]; }

  function floodFill(sx,sy,hex){
    if(sx<0||sy<0||sx>=W||sy>=H) return;
    var img = ctx.getImageData(0,0,W,H), d = img.data;
    var idx = (sy*W+sx)*4;
    var tr=d[idx],tg=d[idx+1],tb=d[idx+2],ta=d[idx+3];
    var fc = hexToRgb(hex);
    if(tr===fc[0]&&tg===fc[1]&&tb===fc[2]) return;
    function match(i){ var dr=d[i]-tr, dg=d[i+1]-tg, db=d[i+2]-tb, da=d[i+3]-ta; return (dr*dr+dg*dg+db*db+da*da) < 1600; }
    var stack=[[sx,sy]];
    while(stack.length){
      var pt=stack.pop(), x=pt[0], y=pt[1];
      var i=(y*W+x)*4;
      while(y>=0 && match(((y*W+x)*4))) y--;
      y++;
      var reachL=false, reachR=false;
      while(y<H && match(((y*W+x)*4))){
        i=(y*W+x)*4; d[i]=fc[0]; d[i+1]=fc[1]; d[i+2]=fc[2]; d[i+3]=255;
        if(x>0){ if(match((((y*W)+(x-1))*4))){ if(!reachL){ stack.push([x-1,y]); reachL=true; } } else reachL=false; }
        if(x<W-1){ if(match((((y*W)+(x+1))*4))){ if(!reachR){ stack.push([x+1,y]); reachR=true; } } else reachR=false; }
        y++;
      }
    }
    ctx.putImageData(img,0,0);
  }

  function save(){
    try{ var a=document.createElement("a"); a.href=canvas.toDataURL("image/png"); a.download="my-drawing.png"; document.body.appendChild(a); a.click(); document.body.removeChild(a); toast("Saved to your downloads! 🎉"); }
    catch(e){ toast("Couldn't save — try Print"); }
  }
  function printArt(){
    var data; try{ data=canvas.toDataURL("image/png"); }catch(e){ toast("Couldn't print"); return; }
    var w=window.open("","_blank"); if(!w){ toast("Allow pop-ups to print 🙂"); return; }
    w.document.write('<!doctype html><html><head><title>My Drawing — Red 5</title><style>@page{margin:12mm;}body{margin:0;display:flex;align-items:center;justify-content:center;height:100vh;}img{max-width:100%;max-height:100%;}</style></head><body><img src="'+data+'" onload="setTimeout(function(){window.print();},250)"></body></html>');
    w.document.close();
  }

  function setTool(t){ state.tool=t; if(t!=="sticker") state.sticker=null;
    Array.prototype.forEach.call(document.querySelectorAll(".ds-tool[data-tool]"), function(b){ b.classList.toggle("active", b.getAttribute("data-tool")===t); });
    Array.prototype.forEach.call(document.querySelectorAll(".ds-stamp"), function(b){ b.classList.remove("sel"); });
  }
  function setColor(c){ state.color=c; el("dsDot").style.background=c; }

  function buildTools(){
    var box=el("dsTools"); box.innerHTML="";
    TOOLS.forEach(function(t){
      var b=document.createElement("button"); b.className="ds-tool"+(t.id===state.tool?" active":""); b.type="button"; b.textContent=t.icon; b.title=t.id;
      if(t.id==="undo"){ b.addEventListener("click", undo); }
      else { b.setAttribute("data-tool", t.id); b.addEventListener("click", function(){ setTool(t.id); }); }
      box.appendChild(b);
    });
  }
  function buildSwatches(){
    var box=el("dsSwatches"); box.innerHTML="";
    COLORS.forEach(function(c){ var b=document.createElement("button"); b.className="ds-sw"; b.type="button"; b.style.background=c; b.addEventListener("click", function(){ setColor(c); Array.prototype.forEach.call(box.children,function(x){x.classList.remove("sel");}); b.classList.add("sel"); }); box.appendChild(b); });
  }
  function buildStickers(){
    var cats=el("dsCats"), strip=el("dsStamps");
    Object.keys(STICKERS).forEach(function(cat,i){
      var c=document.createElement("button"); c.className="ds-cat"+(i===0?" active":""); c.type="button"; c.textContent=cat;
      c.addEventListener("click", function(){ Array.prototype.forEach.call(cats.children,function(x){x.classList.remove("active");}); c.classList.add("active"); renderStamps(cat); });
      cats.appendChild(c);
    });
    renderStamps("All");
    function renderStamps(cat){
      strip.innerHTML="";
      STICKERS[cat].forEach(function(em){
        var b=document.createElement("button"); b.className="ds-stamp"; b.type="button"; b.textContent=em;
        b.addEventListener("click", function(){ state.sticker=em; setTool("sticker"); Array.prototype.forEach.call(strip.children,function(x){x.classList.remove("sel");}); b.classList.add("sel"); toast("Tap the canvas to stamp "+em); });
        strip.appendChild(b);
      });
    }
  }

  function init(){
    canvas=el("dsCanvas"); ctx=canvas.getContext("2d");
    ctx.fillStyle="#ffffff"; ctx.fillRect(0,0,W,H);
    buildTools(); buildSwatches(); buildStickers(); setColor(state.color);
    canvas.addEventListener("pointerdown", down);
    el("dsNew").addEventListener("click", newCanvas);
    el("dsSave").addEventListener("click", save);
    el("dsPrint").addEventListener("click", printArt);
    var size=el("dsSize"); size.addEventListener("input", function(){ state.size=+size.value; el("dsSizeVal").textContent=size.value; });
  }
  if(document.readyState==="loading"){ document.addEventListener("DOMContentLoaded", init); } else { init(); }
})();
