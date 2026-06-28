/* Coloring World — a working kid-safe coloring activity for Red 5.
   Tap a color, then tap a part of the picture to fill it. Brush to draw freehand.
   Save downloads a PNG; Print opens the print dialog so kids can color at home. */
(function(){
  "use strict";
  var VB = "0 0 600 460";
  var S = 'stroke="#2b2b2b" stroke-width="4" stroke-linejoin="round"';
  // Each template: white regions (class "rg") with black outlines + non-colorable detail lines.
  var TEMPLATES = [
    { name:"Flower", svg:
      '<rect class="rg" x="0" y="0" width="600" height="340" fill="#fff" '+S+'/>'+
      '<rect class="rg" x="0" y="330" width="600" height="130" fill="#fff" '+S+'/>'+
      '<circle class="rg" cx="510" cy="80" r="48" fill="#fff" '+S+'/>'+
      '<g stroke="#2b2b2b" stroke-width="4" stroke-linecap="round">'+
        '<line x1="510" y1="10" x2="510" y2="-6"/><line x1="576" y1="80" x2="596" y2="80"/><line x1="560" y1="34" x2="576" y2="18"/></g>'+
      '<rect class="rg" x="288" y="220" width="24" height="150" fill="#fff" '+S+'/>'+
      '<path class="rg" d="M300 300 C250 280 215 300 210 340 C260 350 296 332 300 300 Z" fill="#fff" '+S+'/>'+
      '<path class="rg" d="M300 270 C350 250 388 268 392 308 C342 320 304 302 300 270 Z" fill="#fff" '+S+'/>'+
      '<ellipse class="rg" cx="300" cy="120" rx="34" ry="50" fill="#fff" '+S+'/>'+
      '<ellipse class="rg" cx="380" cy="160" rx="34" ry="50" fill="#fff" transform="rotate(70 380 160)" '+S+'/>'+
      '<ellipse class="rg" cx="360" cy="240" rx="34" ry="50" fill="#fff" transform="rotate(130 360 240)" '+S+'/>'+
      '<ellipse class="rg" cx="240" cy="240" rx="34" ry="50" fill="#fff" transform="rotate(50 240 240)" '+S+'/>'+
      '<ellipse class="rg" cx="220" cy="160" rx="34" ry="50" fill="#fff" transform="rotate(110 220 160)" '+S+'/>'+
      '<circle class="rg" cx="300" cy="185" r="40" fill="#fff" '+S+'/>'
    },
    { name:"Cat", svg:
      '<rect class="rg" x="0" y="0" width="600" height="460" fill="#fff" '+S+'/>'+
      '<path class="rg" d="M205 120 L150 40 L250 95 Z" fill="#fff" '+S+'/>'+
      '<path class="rg" d="M395 120 L450 40 L350 95 Z" fill="#fff" '+S+'/>'+
      '<ellipse class="rg" cx="300" cy="250" rx="170" ry="150" fill="#fff" '+S+'/>'+
      '<circle class="rg" cx="240" cy="225" r="28" fill="#fff" '+S+'/>'+
      '<circle class="rg" cx="360" cy="225" r="28" fill="#fff" '+S+'/>'+
      '<circle cx="240" cy="225" r="9" fill="#2b2b2b"/><circle cx="360" cy="225" r="9" fill="#2b2b2b"/>'+
      '<path class="rg" d="M285 270 L315 270 L300 292 Z" fill="#fff" '+S+'/>'+
      '<circle class="rg" cx="220" cy="300" r="26" fill="#fff" '+S+'/>'+
      '<circle class="rg" cx="380" cy="300" r="26" fill="#fff" '+S+'/>'+
      '<g stroke="#2b2b2b" stroke-width="4" fill="none" stroke-linecap="round">'+
        '<path d="M300 292 Q300 312 282 318"/><path d="M300 292 Q300 312 318 318"/>'+
        '<line x1="120" y1="285" x2="190" y2="295"/><line x1="118" y1="312" x2="190" y2="312"/>'+
        '<line x1="480" y1="285" x2="410" y2="295"/><line x1="482" y1="312" x2="410" y2="312"/></g>'
    },
    { name:"Butterfly", svg:
      '<rect class="rg" x="0" y="0" width="600" height="460" fill="#fff" '+S+'/>'+
      '<ellipse class="rg" cx="300" cy="240" rx="20" ry="120" fill="#fff" '+S+'/>'+
      '<path class="rg" d="M286 170 C170 80 120 150 150 210 C180 265 260 250 286 224 Z" fill="#fff" '+S+'/>'+
      '<path class="rg" d="M314 170 C430 80 480 150 450 210 C420 265 340 250 314 224 Z" fill="#fff" '+S+'/>'+
      '<path class="rg" d="M286 250 C200 270 170 330 210 372 C260 400 290 330 290 290 Z" fill="#fff" '+S+'/>'+
      '<path class="rg" d="M314 250 C400 270 430 330 390 372 C340 400 310 330 310 290 Z" fill="#fff" '+S+'/>'+
      '<circle class="rg" cx="210" cy="170" r="20" fill="#fff" '+S+'/>'+
      '<circle class="rg" cx="390" cy="170" r="20" fill="#fff" '+S+'/>'+
      '<circle class="rg" cx="240" cy="330" r="16" fill="#fff" '+S+'/>'+
      '<circle class="rg" cx="360" cy="330" r="16" fill="#fff" '+S+'/>'+
      '<g stroke="#2b2b2b" stroke-width="4" fill="none" stroke-linecap="round">'+
        '<path d="M300 122 C290 96 270 86 256 80"/><path d="M300 122 C310 96 330 86 344 80"/></g>'+
        '<circle cx="254" cy="78" r="7" fill="#2b2b2b"/><circle cx="346" cy="78" r="7" fill="#2b2b2b"/>'
    },
    { name:"Rocket", svg:
      '<rect class="rg" x="0" y="0" width="600" height="460" fill="#fff" '+S+'/>'+
      '<path class="rg" d="M300 60 C350 110 360 200 360 300 L240 300 C240 200 250 110 300 60 Z" fill="#fff" '+S+'/>'+
      '<path class="rg" d="M240 300 C200 320 185 360 190 392 L260 360 Z" fill="#fff" '+S+'/>'+
      '<path class="rg" d="M360 300 C400 320 415 360 410 392 L340 360 Z" fill="#fff" '+S+'/>'+
      '<circle class="rg" cx="300" cy="170" r="38" fill="#fff" '+S+'/>'+
      '<path class="rg" d="M262 330 L338 330 L320 360 L280 360 Z" fill="#fff" '+S+'/>'+
      '<path class="rg" d="M278 360 C282 410 300 440 300 440 C300 440 318 410 322 360 Z" fill="#fff" '+S+'/>'+
      '<g fill="none" stroke="#2b2b2b" stroke-width="4" stroke-linecap="round">'+
        '<path d="M70 90 l0 28 M56 104 l28 0"/><path d="M520 130 l0 24 M508 142 l24 0"/><path d="M110 360 l0 24 M98 372 l24 0"/></g>'+
      '<circle class="rg" cx="500" cy="320" r="30" fill="#fff" '+S+'/>'
    },
    { name:"Fish", svg:
      '<rect class="rg" x="0" y="0" width="600" height="460" fill="#fff" '+S+'/>'+
      '<ellipse class="rg" cx="300" cy="240" rx="160" ry="110" fill="#fff" '+S+'/>'+
      '<path class="rg" d="M450 240 L540 170 L530 240 L540 310 Z" fill="#fff" '+S+'/>'+
      '<path class="rg" d="M280 132 C300 90 340 90 360 130 C330 138 300 138 280 132 Z" fill="#fff" '+S+'/>'+
      '<path class="rg" d="M260 330 C290 372 330 372 350 332 C320 340 286 340 260 330 Z" fill="#fff" '+S+'/>'+
      '<circle class="rg" cx="220" cy="215" r="26" fill="#fff" '+S+'/>'+
      '<circle cx="214" cy="215" r="10" fill="#2b2b2b"/>'+
      '<path class="rg" d="M300 200 C320 220 320 260 300 280" fill="#fff" '+S+'/>'+
      '<path class="rg" d="M360 195 C382 220 382 260 360 285" fill="#fff" '+S+'/>'+
      '<circle class="rg" cx="120" cy="120" r="18" fill="#fff" '+S+'/>'+
      '<circle class="rg" cx="160" cy="80" r="12" fill="#fff" '+S+'/>'+
      '<g stroke="#2b2b2b" stroke-width="4" fill="none" stroke-linecap="round"><path d="M180 250 q12 12 24 0"/></g>'
    },
    { name:"House", svg:
      '<rect class="rg" x="0" y="0" width="600" height="330" fill="#fff" '+S+'/>'+
      '<rect class="rg" x="0" y="320" width="600" height="140" fill="#fff" '+S+'/>'+
      '<circle class="rg" cx="510" cy="80" r="44" fill="#fff" '+S+'/>'+
      '<path class="rg" d="M70 110 a34 34 0 0 1 0 -8 a30 30 0 0 1 58 -10 a26 26 0 0 1 18 26 Z" fill="#fff" '+S+'/>'+
      '<rect class="rg" x="200" y="200" width="220" height="160" fill="#fff" '+S+'/>'+
      '<path class="rg" d="M180 200 L310 110 L440 200 Z" fill="#fff" '+S+'/>'+
      '<rect class="rg" x="285" y="280" width="55" height="80" rx="4" fill="#fff" '+S+'/>'+
      '<rect class="rg" x="225" y="232" width="46" height="46" fill="#fff" '+S+'/>'+
      '<rect class="rg" x="350" y="232" width="46" height="46" fill="#fff" '+S+'/>'+
      '<rect class="rg" x="486" y="250" width="20" height="110" fill="#fff" '+S+'/>'+
      '<circle class="rg" cx="496" cy="230" r="50" fill="#fff" '+S+'/>'
    }
  ];

  var CRAYONS = ["#e8412b","#ff7a18","#ffcf33","#3ec46d","#1f9fd6","#2e5cff","#8b46d6","#ff66b3"];
  var CLASSIC = ["#7a1d12","#c0392b","#e8412b","#ff7a18","#ffb02e","#ffcf33","#a8d83a","#3ec46d",
                 "#179e7a","#1f9fd6","#2e5cff","#3a2f8f","#8b46d6","#d65bb8","#ff66b3","#ffb3c7",
                 "#5a3a22","#9c6b3f","#caa472","#f2d9b0","#2b2b2b","#6b6f76","#b9bec7","#ffffff"];

  var state = { tool:"fill", color:"#e8412b", size:12 };
  var stage, svg, ink, undoStack = [], drawing=false, curPath=null;

  function el(id){ return document.getElementById(id); }
  function toast(msg){ var t=el("cwToast"); t.textContent=msg; t.classList.add("show"); clearTimeout(t._t); t._t=setTimeout(function(){t.classList.remove("show");},1800); }

  function wrapSvg(inner, forExport){
    var bg = forExport ? '<rect x="0" y="0" width="600" height="460" fill="#ffffff"/>' : '';
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="'+VB+'">'+bg+inner+'<g class="ink"></g></svg>';
  }

  function loadTemplate(i){
    state.idx = i;
    stage.innerHTML = wrapSvg(TEMPLATES[i].svg, false);
    svg = stage.querySelector("svg");
    ink = svg.querySelector(".ink");
    undoStack = [];
    attachStage();
    // mark selected thumb
    Array.prototype.forEach.call(document.querySelectorAll(".cw-thumb"), function(b,k){ b.classList.toggle("sel", k===i); });
  }

  function svgPoint(evt){
    var pt = svg.createSVGPoint(); pt.x = evt.clientX; pt.y = evt.clientY;
    var m = svg.getScreenCTM(); if(!m) return {x:0,y:0};
    var p = pt.matrixTransform(m.inverse()); return p;
  }

  function attachStage(){
    svg.addEventListener("pointerdown", onDown);
  }

  function onDown(evt){
    var target = evt.target;
    if(state.tool === "fill"){
      if(target.classList && target.classList.contains("rg")){
        undoStack.push({type:"fill", el:target, prev:target.getAttribute("fill")});
        target.setAttribute("fill", state.color);
      }
      return;
    }
    if(state.tool === "eraser"){
      // erase ink strokes; clicking a region resets it to white
      if(target.parentNode === ink){
        undoStack.push({type:"remove", el:target, parent:ink, next:target.nextSibling}); ink.removeChild(target);
      } else if(target.classList && target.classList.contains("rg")){
        undoStack.push({type:"fill", el:target, prev:target.getAttribute("fill")});
        target.setAttribute("fill", "#ffffff");
      }
      drawing = true; curPath = null;
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
      return;
    }
    // brush
    var p = svgPoint(evt);
    curPath = document.createElementNS("http://www.w3.org/2000/svg","path");
    curPath.setAttribute("d","M "+p.x.toFixed(1)+" "+p.y.toFixed(1));
    curPath.setAttribute("fill","none");
    curPath.setAttribute("stroke", state.color);
    curPath.setAttribute("stroke-width", state.size);
    curPath.setAttribute("stroke-linecap","round");
    curPath.setAttribute("stroke-linejoin","round");
    ink.appendChild(curPath);
    drawing = true;
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }

  function onMove(evt){
    if(!drawing) return;
    if(state.tool === "eraser"){
      var t = document.elementFromPoint(evt.clientX, evt.clientY);
      if(t && t.parentNode === ink){ undoStack.push({type:"remove", el:t, parent:ink, next:t.nextSibling}); ink.removeChild(t); }
      return;
    }
    if(!curPath) return;
    var p = svgPoint(evt);
    curPath.setAttribute("d", curPath.getAttribute("d") + " L "+p.x.toFixed(1)+" "+p.y.toFixed(1));
  }

  function onUp(){
    if(state.tool === "brush" && curPath){ undoStack.push({type:"add", el:curPath, parent:ink}); }
    drawing = false; curPath = null;
    window.removeEventListener("pointermove", onMove);
    window.removeEventListener("pointerup", onUp);
  }

  function undo(){
    var a = undoStack.pop(); if(!a) return;
    if(a.type==="fill"){ a.el.setAttribute("fill", a.prev); }
    else if(a.type==="add"){ if(a.el.parentNode) a.el.parentNode.removeChild(a.el); }
    else if(a.type==="remove"){ a.parent.insertBefore(a.el, a.next); }
  }

  function clearAll(){
    Array.prototype.forEach.call(svg.querySelectorAll(".rg"), function(r){ r.setAttribute("fill","#ffffff"); });
    while(ink.firstChild) ink.removeChild(ink.firstChild);
    undoStack = [];
    toast("Cleared! Fresh page ✨");
  }

  // Build the export SVG markup (with white bg) from the current drawing
  function exportSvgString(){
    var inner = svg.innerHTML; // current regions + ink
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="'+VB+'" width="1200" height="920"><rect x="0" y="0" width="600" height="460" fill="#ffffff"/>'+inner+'</svg>';
  }

  function toPngDataUrl(cb){
    var svgStr = exportSvgString();
    var img = new Image();
    var url = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svgStr);
    img.onload = function(){
      var c = document.createElement("canvas"); c.width = 1200; c.height = 920;
      var ctx = c.getContext("2d"); ctx.fillStyle = "#ffffff"; ctx.fillRect(0,0,1200,920);
      ctx.drawImage(img,0,0,1200,920);
      try { cb(c.toDataURL("image/png")); } catch(e){ cb(null); }
    };
    img.onerror = function(){ cb(null); };
    img.src = url;
  }

  function save(){
    toPngDataUrl(function(data){
      if(!data){ toast("Couldn't save — try Print instead"); return; }
      var a = document.createElement("a");
      a.href = data; a.download = "my-coloring.png"; document.body.appendChild(a); a.click(); document.body.removeChild(a);
      toast("Saved to your downloads! 🎉");
    });
  }

  function printArt(){
    var svgStr = exportSvgString();
    var w = window.open("", "_blank");
    if(!w){ toast("Allow pop-ups to print 🙂"); return; }
    w.document.write('<!doctype html><html><head><title>My Coloring — Red 5</title>'+
      '<style>@page{margin:12mm;} body{margin:0;display:flex;align-items:center;justify-content:center;height:100vh;} svg{width:100%;max-width:1000px;height:auto;}</style>'+
      '</head><body>'+svgStr+'<script>window.onload=function(){setTimeout(function(){window.print();},250);};<\/script></body></html>');
    w.document.close();
  }

  function buildSwatches(){
    var box = el("cwSwatches"); box.innerHTML = "";
    CLASSIC.forEach(function(col){
      var b = document.createElement("button"); b.className="cw-sw"; b.type="button";
      b.style.background = col; b.setAttribute("aria-label", col);
      b.addEventListener("click", function(){ setColor(col); markSel(box,b); });
      box.appendChild(b);
    });
  }
  function markSel(box, b){ Array.prototype.forEach.call(box.children, function(c){ c.classList.remove("sel"); }); b.classList.add("sel"); }

  function setColor(col){ state.color = col; var d=el("cwDot"); d.style.background = col; }

  function buildThumbs(){
    var box = el("cwThumbs"); box.innerHTML = "";
    TEMPLATES.forEach(function(t,i){
      var b = document.createElement("button"); b.className="cw-thumb"; b.type="button"; b.title=t.name;
      b.innerHTML = wrapSvg(t.svg, true);
      b.addEventListener("click", function(){ loadTemplate(i); toast(t.name); });
      box.appendChild(b);
    });
  }

  function setTool(tool){
    state.tool = tool;
    Array.prototype.forEach.call(document.querySelectorAll(".cw-tool[data-tool]"), function(b){ b.classList.toggle("active", b.getAttribute("data-tool")===tool); });
  }

  function init(){
    stage = el("cwStage");
    buildSwatches(); buildThumbs(); setColor(state.color);
    loadTemplate(0);
    Array.prototype.forEach.call(document.querySelectorAll(".cw-tool[data-tool]"), function(b){
      b.addEventListener("click", function(){ setTool(b.getAttribute("data-tool")); });
    });
    el("cwUndo").addEventListener("click", undo);
    el("cwClear").addEventListener("click", clearAll);
    el("cwSave").addEventListener("click", save);
    el("cwPrint").addEventListener("click", printArt);
    var size = el("cwSize");
    size.addEventListener("input", function(){ state.size = +size.value; el("cwSizeVal").textContent = size.value; });
  }

  if(document.readyState === "loading"){ document.addEventListener("DOMContentLoaded", init); } else { init(); }
})();
