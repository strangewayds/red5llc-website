/* ============================================================================
   Build a Buddy — shared data + SVG renderer + storage.
   Used by build-a-buddy.html (landing collection) and buddy-creator.html.
   Plain ES5-ish, no build step. Exposes window.Buddy.
   ============================================================================ */
(function () {
  "use strict";

  var STORE_KEY = "red5_buddies_v1";

  /* ---- Species -------------------------------------------------------------
     Each species draws into a 200x200 viewBox. The buddy is built from simple
     filled shapes so the BODY color (var via fill) updates live. Ears/horns/etc
     are part of each species' silhouette. Face features are layered on top by
     expression so they're shared across species. */
  var SPECIES = [
    { id:"dragon",   name:"Dragon",   emoji:"🐉", color:"#7c5cff" },
    { id:"fox",      name:"Fox",      emoji:"🦊", color:"#ff8a3d" },
    { id:"puppy",    name:"Puppy",    emoji:"🐶", color:"#c9914f" },
    { id:"kitten",   name:"Kitten",   emoji:"🐱", color:"#b9b2c9" },
    { id:"bear",     name:"Bear",     emoji:"🐻", color:"#a9743f" },
    { id:"dino",     name:"Dinosaur", emoji:"🦕", color:"#4fc77d" },
    { id:"robot",    name:"Robot",    emoji:"🤖", color:"#8fb6d6" },
    { id:"alien",    name:"Alien",    emoji:"👽", color:"#7ee0a8" },
    { id:"bunny",    name:"Bunny",    emoji:"🐰", color:"#f4c6d8" },
    { id:"penguin",  name:"Penguin",  emoji:"🐧", color:"#3b4a66" },
    { id:"monster",  name:"Monster",  emoji:"👾", color:"#ff5a8a" },
    { id:"unicorn",  name:"Unicorn",  emoji:"🦄", color:"#f2a3e8" },
    { id:"bird",     name:"Bird",     emoji:"🐦", color:"#3fb6e0" },
    { id:"axolotl",  name:"Axolotl",  emoji:"🦎", color:"#ff9ec7" }
  ];

  /* ---- Customization palettes --------------------------------------------- */
  var COLORS = [
    "#7c5cff","#5b6bff","#3fb6e0","#27c2a0","#4fc77d","#9bd34a",
    "#ffd23f","#ff9f1c","#ff6b3d","#ff5a8a","#ff7ad9","#c77dff",
    "#c9914f","#a9743f","#8fb6d6","#b9b2c9","#5a6478","#2b3142"
  ];

  var EXPRESSIONS = [
    { id:"happy",   name:"Happy",   emoji:"😊" },
    { id:"excited", name:"Excited", emoji:"🤩" },
    { id:"cool",    name:"Cool",    emoji:"😎" },
    { id:"sleepy",  name:"Sleepy",  emoji:"😴" },
    { id:"silly",   name:"Silly",   emoji:"😜" },
    { id:"love",    name:"Loving",  emoji:"🥰" }
  ];

  var ACCESSORIES = [
    { id:"hat",     name:"Party Hat", emoji:"🎉" },
    { id:"glasses", name:"Glasses",   emoji:"👓" },
    { id:"bow",     name:"Bow",       emoji:"🎀" },
    { id:"scarf",   name:"Scarf",     emoji:"🧣" },
    { id:"cape",    name:"Cape",      emoji:"🦸" },
    { id:"crown",   name:"Crown",     emoji:"👑" }
  ];

  var PERSONALITIES = [
    { id:"kind",        name:"Kind",        emoji:"💛" },
    { id:"funny",       name:"Funny",       emoji:"😄" },
    { id:"brave",       name:"Brave",       emoji:"🛡️" },
    { id:"curious",     name:"Curious",     emoji:"🔍" },
    { id:"creative",    name:"Creative",    emoji:"🎨" },
    { id:"adventurous", name:"Adventurous", emoji:"🧭" }
  ];

  /* ---- "Buddy says" — curated, positive, no real AI ----------------------- */
  var SAYINGS = [
    "Great job — I can't wait for our next adventure!",
    "You make me look awesome! High five! ✋",
    "We're going to be the best team ever.",
    "Wow, I love my new look. Thank you!",
    "Every day is more fun with a friend like you.",
    "Let's go explore something amazing together!",
    "You have the best ideas. Keep creating!",
    "I feel super brave standing next to you.",
    "Ready when you are, buddy!",
    "You + me = unstoppable. 🌟"
  ];

  /* ---- Defaults ----------------------------------------------------------- */
  function defaultBuddy(speciesId) {
    var sp = getSpecies(speciesId) || SPECIES[0];
    return {
      id: null,
      name: "",
      species: sp.id,
      color: sp.color,
      expression: "happy",
      accessories: [],          // array of accessory ids
      personality: "kind",
      favColor: "",
      favFood: "",
      birthday: "",
      created: null
    };
  }

  function getSpecies(id) {
    for (var i = 0; i < SPECIES.length; i++) if (SPECIES[i].id === id) return SPECIES[i];
    return null;
  }

  /* ---- Color helpers (shade a hex for outlines / bellies) ----------------- */
  function clamp(n){ return n < 0 ? 0 : n > 255 ? 255 : n; }
  function shade(hex, amt) {
    hex = (hex || "#888888").replace("#", "");
    if (hex.length === 3) hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
    var r = clamp(parseInt(hex.slice(0,2),16) + amt);
    var g = clamp(parseInt(hex.slice(2,4),16) + amt);
    var b = clamp(parseInt(hex.slice(4,6),16) + amt);
    return "#" + [r,g,b].map(function(v){ var s = v.toString(16); return s.length === 1 ? "0"+s : s; }).join("");
  }
  function lum(hex){
    hex = (hex||"#888").replace("#","");
    if (hex.length===3) hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
    var r=parseInt(hex.slice(0,2),16), g=parseInt(hex.slice(2,4),16), b=parseInt(hex.slice(4,6),16);
    return (0.299*r + 0.587*g + 0.114*b)/255;
  }

  /* ---- Species silhouettes (behind the shared face) ----------------------- */
  /* Each returns SVG for the body + species-specific top features (ears/horns).
     Uses `fill` = body color, `dk` = darker shade, `lt` = lighter belly. */
  function silhouette(id, fill, dk, lt) {
    var ear =
      '<ellipse cx="62" cy="58" rx="16" ry="22" fill="'+fill+'" transform="rotate(-18 62 58)"/>'+
      '<ellipse cx="138" cy="58" rx="16" ry="22" fill="'+fill+'" transform="rotate(18 138 58)"/>';
    var headBody =
      '<ellipse cx="100" cy="150" rx="46" ry="34" fill="'+fill+'"/>'+          // body
      '<ellipse cx="100" cy="148" rx="30" ry="22" fill="'+lt+'"/>'+            // belly
      '<circle cx="100" cy="92" r="58" fill="'+fill+'"/>';                     // head
    switch (id) {
      case "dragon":
        return '<path d="M100 18 L116 46 L84 46 Z" fill="'+dk+'"/>'+ // top spike
          '<path d="M44 70 q-26 -6 -34 14 q24 2 30 16 Z" fill="'+dk+'"/>'+ // wing L
          '<path d="M156 70 q26 -6 34 14 q-24 2 -30 16 Z" fill="'+dk+'"/>'+ // wing R
          ear + headBody +
          '<path d="M86 36 l8 14 8 -14" fill="none" stroke="'+dk+'" stroke-width="0"/>';
      case "fox":
        return '<path d="M50 50 L74 76 L60 84 Z" fill="'+dk+'"/>'+
          '<path d="M150 50 L126 76 L140 84 Z" fill="'+dk+'"/>'+
          headBody +
          '<path d="M54 52 L72 74 L62 80 Z" fill="'+fill+'"/>'+
          '<path d="M146 52 L128 74 L138 80 Z" fill="'+fill+'"/>';
      case "puppy":
        return '<ellipse cx="50" cy="92" rx="15" ry="30" fill="'+dk+'"/>'+
          '<ellipse cx="150" cy="92" rx="15" ry="30" fill="'+dk+'"/>'+ headBody;
      case "kitten":
        return '<path d="M58 44 L80 66 L52 74 Z" fill="'+fill+'"/>'+
          '<path d="M142 44 L120 66 L148 74 Z" fill="'+fill+'"/>'+
          '<path d="M61 50 L76 64 L60 68 Z" fill="'+dk+'"/>'+
          '<path d="M139 50 L124 64 L140 68 Z" fill="'+dk+'"/>'+ headBody;
      case "bear":
        return '<circle cx="58" cy="50" r="17" fill="'+fill+'"/>'+
          '<circle cx="142" cy="50" r="17" fill="'+fill+'"/>'+
          '<circle cx="58" cy="50" r="9" fill="'+dk+'"/>'+
          '<circle cx="142" cy="50" r="9" fill="'+dk+'"/>'+ headBody;
      case "dino":
        return '<path d="M60 36 l8 12 8 -12 8 12 8 -12 8 12 8 -12" fill="none" stroke="'+dk+'" stroke-width="7" stroke-linejoin="round"/>'+
          headBody;
      case "robot":
        return '<rect x="96" y="22" width="8" height="16" fill="'+dk+'"/><circle cx="100" cy="20" r="6" fill="'+dk+'"/>'+
          '<rect x="40" y="80" width="14" height="30" rx="5" fill="'+dk+'"/>'+
          '<rect x="146" y="80" width="14" height="30" rx="5" fill="'+dk+'"/>'+
          '<rect x="54" y="118" width="92" height="58" rx="16" fill="'+fill+'"/>'+
          '<rect x="70" y="132" width="60" height="30" rx="8" fill="'+lt+'"/>'+
          '<rect x="50" y="46" width="100" height="84" rx="22" fill="'+fill+'"/>';
      case "alien":
        return '<circle cx="68" cy="30" r="5" fill="'+dk+'"/><circle cx="132" cy="30" r="5" fill="'+dk+'"/>'+
          '<path d="M68 30 q4 18 14 28" stroke="'+dk+'" stroke-width="4" fill="none"/>'+
          '<path d="M132 30 q-4 18 -14 28" stroke="'+dk+'" stroke-width="4" fill="none"/>'+
          '<ellipse cx="100" cy="150" rx="42" ry="32" fill="'+fill+'"/>'+
          '<ellipse cx="100" cy="92" rx="50" ry="60" fill="'+fill+'"/>';
      case "bunny":
        return '<ellipse cx="80" cy="34" rx="13" ry="34" fill="'+fill+'"/>'+
          '<ellipse cx="120" cy="34" rx="13" ry="34" fill="'+fill+'"/>'+
          '<ellipse cx="80" cy="36" rx="6" ry="24" fill="'+lt+'"/>'+
          '<ellipse cx="120" cy="36" rx="6" ry="24" fill="'+lt+'"/>'+ headBody;
      case "penguin":
        return '<ellipse cx="100" cy="120" rx="56" ry="66" fill="'+fill+'"/>'+
          '<ellipse cx="100" cy="128" rx="36" ry="50" fill="'+lt+'"/>'+
          '<circle cx="100" cy="78" r="44" fill="'+fill+'"/>'+
          '<path d="M62 150 q-18 6 -22 22 q20 2 28 -6 Z" fill="'+dk+'"/>'+
          '<path d="M138 150 q18 6 22 22 q-20 2 -28 -6 Z" fill="'+dk+'"/>';
      case "monster":
        return '<path d="M52 60 l4 -22 8 18 8 -22 8 22 8 -22 8 22 8 -18 4 22 Z" fill="'+fill+'"/>'+
          headBody +
          '<circle cx="46" cy="120" r="10" fill="'+fill+'"/><circle cx="154" cy="120" r="10" fill="'+fill+'"/>';
      case "unicorn":
        return '<path d="M100 14 L108 48 L92 48 Z" fill="#ffd23f"/>'+ // horn
          '<path d="M100 16 L104 48 L96 48 Z" fill="#ffe98a"/>'+
          '<path d="M70 52 q-6 -22 14 -28 q-4 16 -2 28 Z" fill="#ff9ad9"/>'+ // mane
          '<path d="M130 52 q6 -22 -14 -28 q4 16 2 28 Z" fill="#9bd1ff"/>'+
          ear + headBody;
      case "bird":
        return '<path d="M100 30 q-8 -10 -2 -18 q10 6 8 18 Z" fill="'+dk+'"/>'+ // tuft
          '<path d="M44 96 q-26 6 -28 26 q24 -4 32 -14 Z" fill="'+dk+'"/>'+
          '<path d="M156 96 q26 6 28 26 q-24 -4 -32 -14 Z" fill="'+dk+'"/>'+
          headBody;
      case "axolotl":
        return '<path d="M56 60 q-18 -14 -28 -6 q12 4 14 16 Z" fill="#ff5aa8"/>'+
          '<path d="M52 76 q-20 -8 -30 2 q14 2 18 14 Z" fill="#ff5aa8"/>'+
          '<path d="M144 60 q18 -14 28 -6 q-12 4 -14 16 Z" fill="#ff5aa8"/>'+
          '<path d="M148 76 q20 -8 30 2 q-14 2 -18 14 Z" fill="#ff5aa8"/>'+
          headBody;
      default:
        return ear + headBody;
    }
  }

  /* ---- Shared face by expression ------------------------------------------ */
  function face(expr, dk) {
    var eyeFill = "#2b2150";
    var blush = '<circle cx="68" cy="104" r="9" fill="#ff8aa8" opacity=".5"/><circle cx="132" cy="104" r="9" fill="#ff8aa8" opacity=".5"/>';
    var nose = '<ellipse cx="100" cy="98" rx="5" ry="4" fill="'+dk+'"/>';
    var eyes, mouth;
    switch (expr) {
      case "excited":
        eyes = '<circle cx="80" cy="88" r="11" fill="#fff"/><circle cx="120" cy="88" r="11" fill="#fff"/>'+
               '<circle cx="82" cy="89" r="6" fill="'+eyeFill+'"/><circle cx="122" cy="89" r="6" fill="'+eyeFill+'"/>';
        mouth = '<path d="M84 110 q16 18 32 0 q-16 6 -32 0Z" fill="#7a1f3d"/>';
        break;
      case "cool":
        eyes = '<rect x="66" y="80" width="30" height="16" rx="6" fill="#2b2150"/>'+
               '<rect x="104" y="80" width="30" height="16" rx="6" fill="#2b2150"/>'+
               '<rect x="96" y="85" width="8" height="4" fill="#2b2150"/>';
        mouth = '<path d="M86 112 q14 8 28 0" stroke="'+eyeFill+'" stroke-width="4" fill="none" stroke-linecap="round"/>';
        return eyes + mouth; // sunglasses replace eyes; no blush
      case "sleepy":
        eyes = '<path d="M72 90 q8 6 16 0" stroke="'+eyeFill+'" stroke-width="4" fill="none" stroke-linecap="round"/>'+
               '<path d="M112 90 q8 6 16 0" stroke="'+eyeFill+'" stroke-width="4" fill="none" stroke-linecap="round"/>';
        mouth = '<ellipse cx="100" cy="114" rx="7" ry="9" fill="#7a1f3d"/>';
        break;
      case "silly":
        eyes = '<circle cx="80" cy="88" r="9" fill="#fff"/><circle cx="120" cy="88" r="9" fill="#fff"/>'+
               '<circle cx="78" cy="86" r="5" fill="'+eyeFill+'"/><circle cx="124" cy="90" r="5" fill="'+eyeFill+'"/>';
        mouth = '<path d="M84 110 q16 14 32 0" stroke="'+eyeFill+'" stroke-width="4" fill="none" stroke-linecap="round"/>'+
                '<path d="M104 112 q6 14 -4 18 q-6 -6 -2 -16Z" fill="#ff6b85"/>';
        break;
      case "love":
        eyes = '<path d="M80 84c4-6 12-2 8 4l-8 7-8-7c-4-6 4-10 8-4Z" fill="#ff3d7f"/>'+
               '<path d="M120 84c4-6 12-2 8 4l-8 7-8-7c-4-6 4-10 8-4Z" fill="#ff3d7f"/>';
        mouth = '<path d="M86 110 q14 12 28 0" stroke="'+eyeFill+'" stroke-width="4" fill="none" stroke-linecap="round"/>';
        break;
      default: // happy
        eyes = '<circle cx="80" cy="88" r="9" fill="#fff"/><circle cx="120" cy="88" r="9" fill="#fff"/>'+
               '<circle cx="81" cy="89" r="5" fill="'+eyeFill+'"/><circle cx="121" cy="89" r="5" fill="'+eyeFill+'"/>';
        mouth = '<path d="M86 110 q14 12 28 0" stroke="'+eyeFill+'" stroke-width="4" fill="none" stroke-linecap="round"/>';
    }
    return blush + nose + eyes + mouth;
  }

  /* ---- Accessories (layered on top) --------------------------------------- */
  function accessory(id) {
    switch (id) {
      case "hat":
        return '<path d="M100 12 L122 56 L78 56 Z" fill="#ff5a8a"/>'+
               '<path d="M100 12 L112 36 L88 36 Z" fill="#ffd23f"/>'+
               '<circle cx="100" cy="11" r="6" fill="#3fb6e0"/>'+
               '<circle cx="88" cy="50" r="3" fill="#fff"/><circle cx="112" cy="50" r="3" fill="#fff"/>';
      case "glasses":
        return '<g fill="none" stroke="#2b2150" stroke-width="4">'+
               '<circle cx="80" cy="88" r="15"/><circle cx="120" cy="88" r="15"/>'+
               '<path d="M95 88 h10"/></g>'+
               '<circle cx="80" cy="88" r="13" fill="#bfe9ff" opacity=".5"/>'+
               '<circle cx="120" cy="88" r="13" fill="#bfe9ff" opacity=".5"/>';
      case "bow":
        return '<g transform="translate(100 44)"><path d="M0 0 L-22 -12 L-22 12 Z" fill="#ff5a8a"/>'+
               '<path d="M0 0 L22 -12 L22 12 Z" fill="#ff5a8a"/>'+
               '<circle cx="0" cy="0" r="7" fill="#e21f86"/></g>';
      case "scarf":
        return '<path d="M58 134 q42 26 84 0 l0 14 q-42 24 -84 0 Z" fill="#3fb6e0"/>'+
               '<path d="M128 146 l8 34 -16 0 -4 -28 Z" fill="#2ba0d6"/>'+
               '<rect x="58" y="134" width="84" height="5" fill="#fff" opacity=".4"/>';
      case "cape":
        return '<path d="M48 116 q52 30 104 0 l-8 70 q-44 18 -88 0 Z" fill="#e21f86" opacity=".92"/>'+
               '<path d="M48 116 q52 30 104 0 l-2 16 q-50 26 -100 0 Z" fill="#ffd23f"/>';
      case "crown":
        return '<path d="M64 40 L74 18 L88 36 L100 14 L112 36 L126 18 L136 40 Z" fill="#ffd23f" stroke="#e0a800" stroke-width="2"/>'+
               '<circle cx="100" cy="26" r="4" fill="#ff5a8a"/>'+
               '<circle cx="74" cy="34" r="3" fill="#3fb6e0"/><circle cx="126" cy="34" r="3" fill="#3fb6e0"/>';
      default: return "";
    }
  }

  /* ---- Build full SVG markup for a buddy ----------------------------------
     opts.size (px) optional; returns a string. */
  function svg(buddy, opts) {
    opts = opts || {};
    var b = buddy || defaultBuddy();
    var fill = b.color || "#7c5cff";
    var dk = shade(fill, -42);
    var lt = lum(fill) > 0.72 ? shade(fill, -22) : shade(fill, 40);
    var acc = b.accessories || [];
    // cape goes behind the body; others on top
    var behind = acc.indexOf("cape") !== -1 ? accessory("cape") : "";
    var topAcc = acc.filter(function(a){ return a !== "cape"; }).map(accessory).join("");
    var sizeAttr = opts.size ? ' width="'+opts.size+'" height="'+opts.size+'"' : "";
    return '<svg viewBox="0 0 200 200"'+sizeAttr+' xmlns="http://www.w3.org/2000/svg" class="buddy-svg" role="img" aria-label="'+
      ((b.name || "Your buddy") + " the " + (getSpecies(b.species)||{name:"buddy"}).name)+'">'+
      behind +
      silhouette(b.species, fill, dk, lt) +
      face(b.expression, dk) +
      topAcc +
      '</svg>';
  }

  /* ---- Black & white coloring-page outline -------------------------------- */
  function outlineSvg(buddy, opts) {
    opts = opts || {};
    var b = buddy || defaultBuddy();
    var white = "#ffffff", line = "#222";
    var acc = b.accessories || [];
    var behind = acc.indexOf("cape") !== -1 ? accessory("cape") : "";
    var topAcc = acc.filter(function(a){ return a !== "cape"; }).map(accessory).join("");
    var sizeAttr = opts.size ? ' width="'+opts.size+'" height="'+opts.size+'"' : "";
    var inner =
      behind +
      silhouette(b.species, white, white, white) +
      face(b.expression, "#888") +
      topAcc;
    // Render everything as white fills with a dark stroke = clean outline to color in.
    return '<svg viewBox="0 0 200 200"'+sizeAttr+' xmlns="http://www.w3.org/2000/svg" class="buddy-outline">'+
      '<style>.buddy-outline *{fill:#fff!important;stroke:'+line+'!important;stroke-width:2.4!important;}'+
      '.buddy-outline circle,.buddy-outline ellipse,.buddy-outline rect,.buddy-outline path{paint-order:stroke fill;}</style>'+
      inner + '</svg>';
  }

  /* ---- localStorage collection -------------------------------------------- */
  function load() {
    try { return JSON.parse(localStorage.getItem(STORE_KEY)) || []; }
    catch (e) { return []; }
  }
  function saveAll(list) {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(list)); return true; }
    catch (e) { return false; }
  }
  function save(buddy) {
    var list = load();
    if (!buddy.id) {
      buddy.id = "b" + Date.now() + Math.floor(Math.random() * 1000);
      buddy.created = buddy.created || new Date().toISOString();
      list.push(buddy);
    } else {
      var found = false;
      for (var i = 0; i < list.length; i++) {
        if (list[i].id === buddy.id) { list[i] = buddy; found = true; break; }
      }
      if (!found) list.push(buddy);
    }
    saveAll(list);
    return buddy;
  }
  function remove(id) {
    saveAll(load().filter(function (b) { return b.id !== id; }));
  }
  function get(id) {
    var list = load();
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
    return null;
  }

  function param(name) {
    var m = new RegExp("[?&]" + name + "=([^&]+)").exec(location.search);
    return m ? decodeURIComponent(m[1].replace(/\+/g, " ")) : null;
  }

  function formatDate(iso) {
    if (!iso) return "";
    var d = new Date(iso);
    if (isNaN(d)) return "";
    return d.toLocaleDateString(undefined, { year:"numeric", month:"long", day:"numeric" });
  }

  function saying() { return SAYINGS[Math.floor(Math.random() * SAYINGS.length)]; }

  window.Buddy = {
    SPECIES: SPECIES, COLORS: COLORS, EXPRESSIONS: EXPRESSIONS,
    ACCESSORIES: ACCESSORIES, PERSONALITIES: PERSONALITIES, SAYINGS: SAYINGS,
    defaultBuddy: defaultBuddy, getSpecies: getSpecies,
    svg: svg, outlineSvg: outlineSvg, shade: shade,
    load: load, save: save, remove: remove, get: get,
    param: param, formatDate: formatDate, saying: saying
  };
})();
