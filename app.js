/* ==========================================================================
   Red 5 LLC — shared site shell (header, mobile drawer, footer) + interactions.
   One source of truth so every page's navigation stays identical.
   Works from file:// (double-click index.html) or a local server.
   ========================================================================== */
(function () {
  "use strict";

  /* ---- Inline SVG icon set (kid-friendly, currentColor) ------------------ */
  var ICONS = {
    home:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3.2 2.6 11a1 1 0 0 0 .67 1.75H4.5V20a1 1 0 0 0 1 1H10v-5h4v5h4.5a1 1 0 0 0 1-1v-7.25h1.23A1 1 0 0 0 21.4 11z"/></svg>',
    face:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12.4" r="8"/><path d="M9 11v.8M15 11v.8M9.3 15c1.6 1.4 3.8 1.4 5.4 0"/><path d="M4.3 11.5C5 6.8 8.1 4 12 4s7 2.8 7.7 7.5"/></svg>',
    puzzle:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"><path d="M10 4.6a1.6 1.6 0 0 1 3.1 0c0 .9.7 1 1 1H17a1 1 0 0 1 1 1v2.8c0 .3.1 1 1 1a1.6 1.6 0 0 1 0 3.1c-.9 0-1 .7-1 1V19a1 1 0 0 1-1 1h-3c-.3 0-1 .1-1 1a1.6 1.6 0 0 1-3.1 0c0-.9-.7-1-1-1H6a1 1 0 0 1-1-1v-3c0-.3-.1-1-1-1a1.6 1.6 0 0 1 0-3.1c.9 0 1-.7 1-1V6.6a1 1 0 0 1 1-1h2.9c.3 0 1-.1 1-1z"/></svg>',
    palette:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M12 3.5C7 3.5 3.5 7 3.5 12s3.8 8.5 8.5 8.5c1.4 0 2-1 2-1.8 0-.5-.3-.8-.3-1.3 0-.7.5-1.2 1.2-1.2H16c2.5 0 4.5-2 4.5-4.7C20.5 6.6 16.7 3.5 12 3.5Z"/><circle cx="8" cy="11" r="1.1" fill="currentColor" stroke="none"/><circle cx="12" cy="8" r="1.1" fill="currentColor" stroke="none"/><circle cx="16" cy="10.5" r="1.1" fill="currentColor" stroke="none"/></svg>',
    bulb:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M9.3 18h5.4M10.2 21h3.6"/><path d="M12 3a6 6 0 0 0-3.5 10.9c.5.4.8 1 .8 1.6V16h5.4v-.5c0-.6.3-1.2.8-1.6A6 6 0 0 0 12 3Z"/></svg>',
    chat:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"><path d="M4 5.8A1.8 1.8 0 0 1 5.8 4h12.4A1.8 1.8 0 0 1 20 5.8v8.4a1.8 1.8 0 0 1-1.8 1.8H9.5L5 20v-3.9A1.8 1.8 0 0 1 4 14.2z"/><path d="M12 12.4 9.8 10.2c-.8-.8-.2-2.1.9-2.1.6 0 .9.3 1.3.7.4-.4.7-.7 1.3-.7 1.1 0 1.7 1.3.9 2.1z" fill="currentColor" stroke="none"/></svg>',
    tv:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"><rect x="3" y="7.5" width="18" height="12" rx="2"/><path d="m8 4 4 3.5L16 4"/><path d="m11 11 3.2 1.9-3.2 1.9z" fill="currentColor" stroke="none"/></svg>',
    book:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"><path d="M12 6.4C10.5 5.1 8.5 4.6 5 5v12c3.5-.4 5.5.1 7 1.5 1.5-1.4 3.5-1.9 7-1.5V5c-3.5-.4-5.5.1-7 1.4z"/><path d="M12 6.4V18.5"/></svg>',
    bag:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"><path d="M6 8h12l-1 11.5a1 1 0 0 1-1 .9H8a1 1 0 0 1-1-.9z"/><path d="M9 8.5V6.5a3 3 0 0 1 6 0v2"/></svg>',
    parents:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="3"/><circle cx="16.6" cy="9" r="2.4"/><path d="M3.4 19c0-3 2.6-5 5.6-5s5.6 2 5.6 5"/><path d="M14.6 14.2c2.6.2 4.5 2.1 4.5 4.8"/></svg>',
    community:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8.5"/><path d="M3.6 12h16.8"/><path d="M12 3.5c2.5 2.5 2.5 14.5 0 17M12 3.5c-2.5 2.5-2.5 14.5 0 17"/></svg>',
    star:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="m12 3 2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9 6.8 19.1l1-5.8L3.5 9.2l5.9-.9z"/></svg>',
    play:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.5v13a1 1 0 0 0 1.5.87l11-6.5a1 1 0 0 0 0-1.74l-11-6.5A1 1 0 0 0 8 5.5z"/></svg>',
    arrow:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h13M13 6l6 6-6 6"/></svg>',
    check:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5 10 17.5 19.5 7"/></svg>',
    shield:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M12 3 5 5.5V11c0 4.5 3 7.8 7 9.5 4-1.7 7-5 7-9.5V5.5z"/><path d="m9 11.5 2 2 4-4" stroke-linecap="round"/></svg>',
    gradcap:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="m12 5 9 4-9 4-9-4z"/><path d="M6 11v4c0 1.4 2.7 2.5 6 2.5s6-1.1 6-2.5v-4"/><path d="M21 9v4.5"/></svg>',
    heart:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 20.3 4.7 13c-2-2-2-5.2 0-7.1 1.9-1.9 4.9-1.8 6.7.2l.6.7.6-.7c1.8-2 4.8-2.1 6.7-.2 2 1.9 2 5.1 0 7.1z"/></svg>',
    lock:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><rect x="5" y="10.5" width="14" height="9.5" rx="2"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/><circle cx="12" cy="15" r="1.3" fill="currentColor" stroke="none"/></svg>',
    sparkle:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3c.4 3.6 1.4 4.6 5 5-3.6.4-4.6 1.4-5 5-.4-3.6-1.4-4.6-5-5 3.6-.4 4.6-1.4 5-5z"/></svg>',
    trophy:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 4h10v2h3v2a4 4 0 0 1-4 4h-.3A5 5 0 0 1 13 14.8V17h2a1 1 0 0 1 1 1v1.5H8V18a1 1 0 0 1 1-1h2v-2.2A5 5 0 0 1 8.3 12H8a4 4 0 0 1-4-4V6h3zM6 6v2a2 2 0 0 0 1.5 1.9V6zm10.5 0v3.9A2 2 0 0 0 18 8V6z"/></svg>',
    menu:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
    close:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>',
    pencil:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M14.5 5.5 18.5 9.5 8 20H4v-4z"/><path d="M13 7 17 11"/></svg>',
    video:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><rect x="3" y="6.5" width="13" height="11" rx="2"/><path d="m16 10 5-2.5v9L16 14z"/></svg>',
    gift:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"><rect x="4" y="9" width="16" height="11" rx="1.5"/><path d="M4 13h16M12 9v11"/><path d="M12 9C12 6 10 4.5 8.5 5.5S8 9 12 9zM12 9c0-3 2-4.5 3.5-3.5S16 9 12 9z"/></svg>',
    crown:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="m3 7.5 3.5 3L12 4l5.5 6.5L21 7.5 19.5 19h-15z"/></svg>',
    smile:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="8.5"/><path d="M9 14c1.6 1.6 4.4 1.6 6 0"/><path d="M9 9.5h.01M15 9.5h.01"/></svg>',
    music:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="7" cy="17" r="2.5"/><circle cx="17" cy="15" r="2.5"/><path d="M9.5 17V6l10-2v11" stroke-linejoin="round"/></svg>',
    gamepad:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"><path d="M7.5 8h9a4.5 4.5 0 0 1 4.4 5.4l-.6 3A2.5 2.5 0 0 1 16 17.8L14.5 16h-5L8 17.8a2.5 2.5 0 0 1-4.3-1.4l-.6-3A4.5 4.5 0 0 1 7.5 8Z"/><path d="M7 11.4v2.2M5.9 12.5h2.2" stroke-linecap="round"/><circle cx="15.4" cy="11.8" r=".95" fill="currentColor" stroke="none"/><circle cx="17.2" cy="13.6" r=".95" fill="currentColor" stroke="none"/></svg>',
    compass:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="12" cy="12" r="8.5"/><path d="m15.5 8.5-2 5-5 2 2-5z" stroke-linejoin="round"/></svg>',
    leaf:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"><path d="M5 19c0-7 4.5-12 14-12 0 9-5 13-11 13-1.5 0-3-.5-3-1z"/><path d="M9 15c2-2.5 4.5-4 7-5" stroke-linecap="round"/></svg>',
    fb:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M13.5 21v-7h2.3l.4-2.8h-2.7V9.4c0-.8.3-1.4 1.5-1.4h1.3V5.5c-.6-.1-1.4-.2-2.3-.2-2.3 0-3.8 1.4-3.8 3.9v2H8v2.8h2.4V21z"/></svg>',
    ig:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="4" y="4" width="16" height="16" rx="4.5"/><circle cx="12" cy="12" r="3.6"/><circle cx="16.6" cy="7.4" r="1" fill="currentColor" stroke="none"/></svg>',
    yt:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M22 12c0-2-.2-3.2-.4-3.9a2.5 2.5 0 0 0-1.7-1.7C18.6 6 12 6 12 6s-6.6 0-7.9.4A2.5 2.5 0 0 0 2.4 8.1C2.2 8.8 2 10 2 12s.2 3.2.4 3.9a2.5 2.5 0 0 0 1.7 1.7C5.4 18 12 18 12 18s6.6 0 7.9-.4a2.5 2.5 0 0 0 1.7-1.7c.2-.7.4-1.9.4-3.9zM10 15V9l5.2 3z"/></svg>',
    tiktok:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M16 3c.3 2.1 1.5 3.6 3.5 3.9v2.6c-1.3 0-2.5-.4-3.5-1.1v5.2A5.6 5.6 0 1 1 10.4 8v2.7a2.9 2.9 0 1 0 2 2.8V3z"/></svg>'
  };
  window.RED5_ICONS = ICONS;
  function icon(name){ return ICONS[name] || ""; }

  /* ---- Primary navigation (single source of truth) ---------------------- */
  var NAV = [
    { key:"home",    label:"Home",           href:"index.html",         icon:"home" },
    { key:"meet",    label:"Meet Rosie",     href:"meet-rosie.html",    icon:"face" },
    { key:"play",    label:"Play Zone",      href:"play-zone.html",     icon:"puzzle" },
    { key:"create",  label:"Create Zone",    href:"create-zone.html",   icon:"palette" },
    { key:"learn",   label:"Learn & Grow",   href:"learn-grow.html",    icon:"bulb" },
    { key:"talk",    label:"Let's Talk",     href:"lets-talk.html",     icon:"chat" },
    { key:"community",label:"Community",     href:"community.html",     icon:"community" },
    { key:"tv",      label:"Rosie TV",       href:"rosie-tv.html",      icon:"tv" },
    { key:"books",   label:"Books & Stories",href:"books-stories.html", icon:"book" },
    { key:"shop",    label:"Shop",           href:"shop.html",          icon:"bag" },
    { key:"parents", label:"Parents",        href:"parents.html",       icon:"parents" }
  ];

  var FOOTER_LINKS = [
    { h:"Explore", items:[["Home","index.html"],["Meet Rosie","meet-rosie.html"],["Community","community.html"],["Play Zone","play-zone.html"],["Rosie TV","rosie-tv.html"]] },
    { h:"For Families", items:[["Parents","parents.html"],["Safety Guidelines","parents.html#safety"],["Community Rules","parents.html#rules"],["Help","parents.html#help"]] },
    { h:"Club", items:[["Join Red 5 Club","membership.html"],["Login","membership.html#login"],["Privacy Policy","parents.html#privacy"],["Terms of Use","parents.html#terms"],["About","meet-rosie.html"]] }
  ];

  var active = (document.body.getAttribute("data-page") || "home");

  /* ---- Build header ----------------------------------------------------- */
  function buildHeader(){
    var nav = NAV.map(function(n){
      var on = n.key === active ? " active" : "";
      return '<a class="nav-item'+on+'" href="'+n.href+'">'+icon(n.icon)+'<span class="nav-label">'+n.label+'</span></a>';
    }).join("");

    var header = document.createElement("header");
    header.className = "site-header";
    header.innerHTML =
      '<div class="container header-inner">'+
        '<a class="brand" href="index.html"><img src="assets/logo.png" alt="Red 5 — A Safe Place To Grow"></a>'+
        '<nav class="main-nav" aria-label="Main">'+nav+'</nav>'+
        '<div class="header-cta">'+
          '<a class="btn btn-outline btn-sm" href="membership.html#login">Login</a>'+
          '<a class="btn btn-red btn-sm" href="membership.html">Join Red 5 Club</a>'+
        '</div>'+
        '<button class="menu-toggle" aria-label="Open menu" aria-expanded="false">'+icon("menu")+'</button>'+
      '</div>';
    document.body.insertBefore(header, document.body.firstChild);

    // Mobile drawer + backdrop
    var drawerNav = NAV.map(function(n){
      var on = n.key === active ? " active" : "";
      return '<a class="'+(on?"active":"")+'" href="'+n.href+'">'+icon(n.icon)+'<span>'+n.label+'</span></a>';
    }).join("");
    var backdrop = document.createElement("div");
    backdrop.className = "drawer-backdrop";
    var drawer = document.createElement("aside");
    drawer.className = "mobile-drawer";
    drawer.setAttribute("aria-hidden","true");
    drawer.innerHTML =
      '<div class="drawer-head">'+
        '<a class="brand" href="index.html"><img src="assets/logo.png" alt="Red 5" style="height:48px"></a>'+
        '<button class="drawer-close" aria-label="Close menu">'+icon("close")+'</button>'+
      '</div>'+
      '<nav class="drawer-nav" aria-label="Mobile">'+drawerNav+'</nav>'+
      '<div class="drawer-cta">'+
        '<a class="btn btn-outline btn-block" href="membership.html#login">Login</a>'+
        '<a class="btn btn-red btn-block" href="membership.html">Join Red 5 Club</a>'+
      '</div>';
    document.body.appendChild(backdrop);
    document.body.appendChild(drawer);

    function open(){ drawer.classList.add("open"); backdrop.classList.add("open"); drawer.setAttribute("aria-hidden","false"); }
    function close(){ drawer.classList.remove("open"); backdrop.classList.remove("open"); drawer.setAttribute("aria-hidden","true"); }
    header.querySelector(".menu-toggle").addEventListener("click", open);
    drawer.querySelector(".drawer-close").addEventListener("click", close);
    backdrop.addEventListener("click", close);
    drawer.querySelectorAll("a").forEach(function(a){ a.addEventListener("click", close); });
    document.addEventListener("keydown", function(e){ if(e.key === "Escape") close(); });
  }

  /* ---- Build footer ----------------------------------------------------- */
  function buildFooter(){
    var cols = FOOTER_LINKS.map(function(c){
      var li = c.items.map(function(it){ return '<li><a href="'+it[1]+'">'+it[0]+'</a></li>'; }).join("");
      return '<div><h4>'+c.h+'</h4><ul>'+li+'</ul></div>';
    }).join("");

    var footer = document.createElement("footer");
    footer.className = "site-footer";
    footer.innerHTML =
      '<div class="container">'+
        '<div class="footer-grid">'+
          '<div class="footer-brand">'+
            '<div class="flogo">Red<span class="h">'+icon("heart")+'</span>5</div>'+
            '<div class="ftag">A Safe Place To Grow</div>'+
            '<p>A safe, positive online clubhouse where kids learn, create, play and grow with Rosie — every day.</p>'+
            '<div class="socials">'+
              '<a href="#" aria-label="Facebook">'+icon("fb")+'</a>'+
              '<a href="#" aria-label="Instagram">'+icon("ig")+'</a>'+
              '<a href="#" aria-label="YouTube">'+icon("yt")+'</a>'+
              '<a href="#" aria-label="TikTok">'+icon("tiktok")+'</a>'+
            '</div>'+
          '</div>'+
          cols +
        '</div>'+
        '<p class="footer-compliance">Red 5 is a supportive community and educational resource. It is not a replacement for professional therapy, medical care, or emergency support. If a child is in immediate danger, contact emergency services.</p>'+
        '<div class="footer-bottom">'+
          '<span>&copy; '+new Date().getFullYear()+' Red 5 LLC. All rights reserved.</span>'+
          '<span>Made with care for kids & parents.</span>'+
        '</div>'+
      '</div>';
    document.body.appendChild(footer);
  }

  /* ---- Tiny toast for placeholder actions ------------------------------- */
  function toast(msg){
    var t = document.createElement("div");
    t.textContent = msg;
    t.style.cssText = "position:fixed;left:50%;bottom:28px;transform:translateX(-50%) translateY(20px);"+
      "background:#16243f;color:#fff;padding:.8rem 1.2rem;border-radius:14px;font-family:var(--font-body);"+
      "box-shadow:0 14px 34px rgba(20,30,60,.3);z-index:200;opacity:0;transition:.25s;font-size:.95rem;max-width:90vw;text-align:center";
    document.body.appendChild(t);
    requestAnimationFrame(function(){ t.style.opacity="1"; t.style.transform="translateX(-50%) translateY(0)"; });
    setTimeout(function(){ t.style.opacity="0"; t.style.transform="translateX(-50%) translateY(20px)"; setTimeout(function(){ t.remove(); }, 300); }, 2600);
  }
  window.RED5_TOAST = toast;

  /* ---- Wire interactions ------------------------------------------------ */
  function wire(){
    // Placeholder demo actions (game/video/shop cards, etc.)
    document.addEventListener("click", function(e){
      var el = e.target.closest("[data-demo]");
      if(el){ e.preventDefault(); toast(el.getAttribute("data-demo") || "Coming soon — this is a preview!"); }
    });
    // Demo forms (login / join) — friendly confirmation, no real backend
    document.querySelectorAll("form.js-demo-form").forEach(function(f){
      f.addEventListener("submit", function(e){
        e.preventDefault();
        var msg = f.querySelector(".form-msg");
        if(msg){ msg.classList.add("show"); }
        f.reset();
      });
    });
  }

  // Replace any <... data-icon="name"> in page content with its SVG.
  function hydrateIcons(){
    document.querySelectorAll("[data-icon]").forEach(function(el){
      var n = el.getAttribute("data-icon");
      if(ICONS[n]){ el.innerHTML = ICONS[n]; }
    });
  }

  // Load the "Talk to Rosie" companion chat on every page.
  function loadRosieChat(){
    if(document.querySelector('script[data-rosie]')) return;
    var s = document.createElement("script");
    s.src = "rosie-chat.js"; s.setAttribute("data-rosie","1");
    document.body.appendChild(s);
  }

  function init(){ buildHeader(); buildFooter(); hydrateIcons(); wire(); loadRosieChat(); }
  if(document.readyState === "loading"){ document.addEventListener("DOMContentLoaded", init); }
  else { init(); }
})();
