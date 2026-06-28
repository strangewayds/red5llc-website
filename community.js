/* ==========================================================================
   Red 5 Community — front-end PROTOTYPE.
   ----------------------------------------------------------------------------
   Demonstrates: moderated public rooms (no DMs), a live rules-based moderation
   + anti-grooming + personal-info engine, crisis routing, 10 AI companions,
   a safe cartoon avatar creator, and a kindness/badges reputation system.

   IMPORTANT (for the Red 5 team): this is a client-side demo. Real deployment
   needs a backend, real AI moderation WITH human moderators, authenticated
   accounts, enforced suspensions, COPPA-compliant data + parental consent, and
   a professional Trust & Safety review. Accounts/suspensions/parent data here
   are simulated; avatars are emoji stand-ins for real AI image generation.
   ========================================================================== */
(function () {
  "use strict";

  /* ----------------------------------------------------------- Rooms data */
  var ROOMS = [
    { key:"everyone-chat",      name:"Everyone Chat",      emoji:"🌈", accent:"#e11d2b", soft:"#fde7e9", desc:"Say hi and chat with the whole Red 5 club." },
    { key:"girls-lounge",       name:"Girls Lounge",       emoji:"💜", accent:"#a44bd0", soft:"#f4e8fb", desc:"A friendly space just for the girls." },
    { key:"boys-lounge",        name:"Boys Lounge",        emoji:"💙", accent:"#2ba8e0", soft:"#e3f4fc", desc:"A friendly space just for the boys." },
    { key:"friendship-zone",    name:"Friendship Zone",    emoji:"🤝", accent:"#ff7a45", soft:"#ffece3", desc:"Make new friends and be a great buddy." },
    { key:"homework-help",      name:"Homework Help",      emoji:"📚", accent:"#f2a828", soft:"#fff3da", desc:"Stuck on something? Ask and help others." },
    { key:"creativity-corner",  name:"Creativity Corner",  emoji:"🎨", accent:"#12b5a5", soft:"#dff6f3", desc:"Share art, crafts, stories and ideas." },
    { key:"gaming-discussion",  name:"Gaming Discussion",  emoji:"🎮", accent:"#6c5ce7", soft:"#ecebff", desc:"Talk games, tips and friendly challenges." },
    { key:"book-club",          name:"Book Club",          emoji:"📖", accent:"#5da130", soft:"#eaf5e0", desc:"Books you love and what to read next." },
    { key:"kindness-corner",    name:"Kindness Corner",    emoji:"💛", accent:"#eab308", soft:"#fef6cf", desc:"Spread kindness and cheer each other on." },
    { key:"encouragement-room", name:"Encouragement Room", emoji:"⭐", accent:"#e11d2b", soft:"#fde7e9", desc:"Lift others up and celebrate wins." },
    { key:"peer-support",       name:"Peer Support Room",  emoji:"🫶", accent:"#2ba8e0", soft:"#e3f4fc", desc:"A caring, moderated space to share feelings.", support:true }
  ];
  function room(key){ for(var i=0;i<ROOMS.length;i++){ if(ROOMS[i].key===key) return ROOMS[i]; } return ROOMS[0]; }

  /* ------------------------------------------------------ AI companions */
  var COMPANIONS = [
    { name:"Sunny", emoji:"☀️", color:"#ffce3a", bio:"Cheerful & encouraging", likes:"art, sunshine & compliments" },
    { name:"River", emoji:"🌊", color:"#34a6e0", bio:"Calm & thoughtful", likes:"books & nature" },
    { name:"Nova",  emoji:"⭐", color:"#8a5cff", bio:"Curious about everything", likes:"space & cool facts" },
    { name:"Scout", emoji:"🧭", color:"#5da130", bio:"Adventurous & helpful", likes:"games & exploring" },
    { name:"Willow",emoji:"🌿", color:"#12b5a5", bio:"Gentle & kind", likes:"plants & feelings" },
    { name:"Atlas", emoji:"🗺️", color:"#ff7a45", bio:"Confident & supportive", likes:"sports & geography" },
    { name:"Luna",  emoji:"🌙", color:"#6c5ce7", bio:"Dreamy & creative", likes:"drawing & stories" },
    { name:"Sky",   emoji:"☁️", color:"#56b8ec", bio:"Friendly & welcoming", likes:"friends & chatting" },
    { name:"Echo",  emoji:"🎵", color:"#ff6fae", bio:"Playful & musical", likes:"songs & jokes" },
    { name:"Ember", emoji:"🔥", color:"#e1344a", bio:"Warm & motivating", likes:"challenges & cheering you on" }
  ];
  function companion(name){ for(var i=0;i<COMPANIONS.length;i++){ if(COMPANIONS[i].name===name) return COMPANIONS[i]; } return COMPANIONS[0]; }
  function randCompanion(){ return COMPANIONS[Math.floor(Math.random()*COMPANIONS.length)]; }

  var COMPANION_LINES = {
    welcome:[
      "Welcome to Red 5! 🎉 So glad you're here. What do you like to do for fun?",
      "Hi friend! 👋 You just made this room brighter. Tell us something fun about your day!",
      "Welcome! 🌟 Everyone here is kind and friendly. Make yourself at home!"
    ],
    kindness:[
      "Quick reminder: a kind word can make someone's whole day. 💛",
      "Let's cheer each other on today! Who did something kind recently? 🌈",
      "You all are awesome. Kindness looks great on this room! ✨"
    ],
    encourage:[
      "You can do hard things. I believe in you! 💪",
      "Mistakes mean you're learning. Keep going! 🌱",
      "Proud of everyone here for being kind and brave. ⭐"
    ],
    starter:[
      "Fun question: if you could have any pet, what would it be? 🐾",
      "What's something you created or learned this week? 🎨",
      "Drop an emoji that matches your mood right now! 😄"
    ],
    redirect:[
      "Let's keep things friendly here, friends. We're all on the same team. 💛",
      "Red 5 is a kindness-first place. Let's lift each other up! 🌟",
      "Remember our golden rule: be kind, be safe, be you. 💚"
    ]
  };
  function line(kind){ var a=COMPANION_LINES[kind]; return a[Math.floor(Math.random()*a.length)]; }

  /* --------------------------------------------------- Profile / reputation */
  var DEFAULT = { name:"You", avatar:{ emoji:"🙂", color:"#6c5ce7", acc:"" }, points:0, badges:[], violations:0, suspended:false };
  function loadProfile(){
    try{ var p=JSON.parse(localStorage.getItem("red5_profile")); if(p && p.avatar) return Object.assign({}, DEFAULT, p); }catch(e){}
    return Object.assign({}, DEFAULT);
  }
  function saveProfile(p){ try{ localStorage.setItem("red5_profile", JSON.stringify(p)); }catch(e){} }
  var BADGES = {
    first:   { id:"first",   icon:"🤝", name:"First Friend",  need:1,  note:"Sent your first kind message" },
    kind:    { id:"kind",    icon:"💛", name:"Kind Heart",    need:5,  note:"Earned 5 kindness points" },
    helper:  { id:"helper",  icon:"🌟", name:"Helpful Hero",  need:10, note:"Earned 10 kindness points" },
    creative:{ id:"creative",icon:"🎨", name:"Creative Spark",need:15, note:"Earned 15 kindness points" },
    community:{id:"community",icon:"🌈", name:"Community Star",need:25, note:"Earned 25 kindness points" }
  };
  function awardPoint(p, n){
    p.points += (n||1);
    var earned=[];
    ["first","kind","helper","creative","community"].forEach(function(k){
      var b=BADGES[k];
      if(p.points>=b.need && p.badges.indexOf(b.id)<0){ p.badges.push(b.id); earned.push(b); }
    });
    saveProfile(p);
    return earned;
  }

  /* ============================ MODERATION ENGINE ========================== */
  /* Order matters: crisis -> grooming -> personal info -> harmful content. */
  var KINDNESS_MSG = "Let's keep Red 5 kind, safe, and respectful for everyone.";

  var RE_CRISIS = /(kill|hurt|harm|cut|hurting)\s*(myself|my ?self)|want(ing)?\s*to\s*die|wanna die|suicid|end (my|it) (life|all)|don'?t want to (live|be alive|be here)|self.?harm|\bkms\b|nobody would miss me|better off dead|someone (is )?(hurting|abusing|touching) me|being abused|hits? me at home|hitting me/i;

  var RE_GROOMING = [
    /how old are you|what'?s your age|what age are you|how old r u|ur age|are you a (boy|girl|kid|adult)/i,
    /where do you live|where (are|r) (you|u)( from| located)?|what'?s your address|whats your address|what (city|state|town|country)|your location|where do u live/i,
    /what school|which school|go to school|your school name|what'?s your school|what grade are you in.*school/i,
    /send (me )?(a |your )?(photo|pic|picture|selfie|pics)|show me (a |your )?(photo|pic|face|selfie)|what do you look like|send pics?|face ?reveal/i,
    /add me on|find me on|let'?s (talk|chat) on|message me on|\bdm me\b|what'?s your (number|phone|snap|snapchat|insta|instagram|discord|tiktok|whatsapp|email|roblox|xbox|psn)|my (number|snap|discord|insta) is|follow me on|off here|somewhere (else|private)|another (app|site)|private chat|talk privately|meet ?up|meet in person|where can i (find|add) you/i,
    /are your parents (home|around|there)|is anyone (else )?(home|watching)|don'?t tell (your|ur) (parents|mom|dad|anyone)|keep (this|it) (a )?secret|our (little )?secret|just between us/i
  ];

  var RE_PERSONAL = [
    /\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b|\b\d{10}\b/,                                  // phone
    /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i,                                        // email
    /(https?:\/\/|www\.)\S+/i,                                                       // url
    /@[a-z0-9_.]{3,}\b|snap ?chat|snapcode|discord\.gg|discord:|insta(gram)?:|\btiktok\b|\bsnap:?\b/i, // handles
    /\b\d{1,5}\s+\w+(\s\w+)?\s+(street|st|avenue|ave|road|rd|lane|ln|drive|dr|blvd|boulevard|court|ct|way)\b/i, // address
    /my (phone|cell|number) is|my address is|i live (at|on|in)\b|my (snap|discord|insta|email) is|my real name is/i
  ];

  var RE_HARMFUL = [
    // bullying / harassment
    /\b(loser|idiot|stupid|dumb+|ugly|fat(so)?|hate you|nobody likes you|no one likes you|shut up|you suck|worthless|freak|weirdo|cry ?baby|moron|pathetic|go away|get lost|nerd|trash)\b/i,
    // threats / violence
    /\b(i'?ll (kill|hurt|beat|find|get) you|i will (kill|hurt|beat) you|gonna (kill|hurt|beat) you|watch your back|you'?re dead|beat you up|punch you|kick your|fight you)\b/i,
    // self-harm encouragement toward others
    /\b(kys|kill yourself|go (die|kys)|hurt yourself|harm yourself)\b/i,
    // sexual
    /\b(sex|sexy|nudes?|naked|porn|boobs?|breasts?|penis|vagina|horny|hook ?up|hot pics?|kiss me|make out|strip)\b/i,
    // dating / romantic
    /\b(date me|go out with me|be my (boyfriend|girlfriend)|do you have a (boyfriend|girlfriend)|i love you.*(date|kiss)|will you date|wanna date|are you single)\b/i,
    // drugs / alcohol
    /\b(weed|marijuana|vape|vaping|beer|alcohol|drunk|drugs?|smoke (a )?cig|cigarettes?|cocaine|\bmolly\b|getting high)\b/i,
    // weapons / illegal
    /\b(gun|pistol|rifle|knife|stab|bomb|explosive|weapon|how to (hack|steal)|shoplift)\b/i,
    // slurs / hate (clear examples)
    /\b(retard(ed)?|n[i1]gg|f[a4]gg?|spic|kike|chink|tranny)\b/i
  ];

  function any(list, s){ for(var i=0;i<list.length;i++){ if(list[i].test(s)) return true; } return false; }

  function moderate(text){
    var s = (text||"").toLowerCase();
    if(RE_CRISIS.test(s)) return { action:"crisis" };
    if(any(RE_GROOMING, s)) return { action:"block", kind:"grooming", flag:true,
      text:"That isn't something we share or ask on Red 5 — never your age, location, school, photos, or how to reach someone off Red 5. A moderator has been notified to keep everyone safe. 🛡️" };
    if(any(RE_PERSONAL, text)) return { action:"block", kind:"personal", flag:true,
      text:"To keep you safe, Red 5 blocks personal info like phone numbers, addresses, emails and social media. Let's keep chatting right here! 💚" };
    if(any(RE_HARMFUL, s)) return { action:"block", kind:"kindness", text:KINDNESS_MSG };
    return { action:"allow" };
  }

  /* ------------------------------------------------------- Avatar creator */
  var COLORS = { blue:"#4aa3e0", red:"#e1344a", green:"#5da130", purple:"#8a5cff", pink:"#ff6fae",
    yellow:"#ffd23f", orange:"#ff7a45", teal:"#14b8a6", black:"#3a3f4a", white:"#cfd6e0",
    gold:"#e8b53a", silver:"#b9c2cf", brown:"#a06a3a", rainbow:"#ff7a9c", magic:"#9b6cff", magical:"#9b6cff" };
  var CREATURES = { dragon:"🐉", fox:"🦊", panda:"🐼", tiger:"🐯", cat:"🐱", dog:"🐶", puppy:"🐶",
    unicorn:"🦄", robot:"🤖", dino:"🦖", dinosaur:"🦖", owl:"🦉", rabbit:"🐰", bunny:"🐰", bear:"🐻",
    lion:"🦁", wolf:"🐺", shark:"🦈", penguin:"🐧", monkey:"🐵", frog:"🐸", dolphin:"🐬", koala:"🐨",
    butterfly:"🦋", star:"⭐", ghost:"👻", alien:"👽", wizard:"🧙", ninja:"🥷", mermaid:"🧜‍♀️",
    knight:"🛡️", astronaut:"🧑‍🚀", cow:"🐮", horse:"🐴", elephant:"🐘", turtle:"🐢", whale:"🐳",
    octopus:"🐙", bird:"🐦", chick:"🐤", hamster:"🐹", deer:"🦌", dragonfly:"🪰" };
  var THEMES = { gamer:"🎮", gaming:"🎮", soccer:"⚽", football:"⚽", basketball:"🏀", art:"🎨",
    artist:"🎨", music:"🎵", musical:"🎵", book:"📚", reader:"📚", space:"🚀", magic:"✨",
    magical:"✨", sport:"🏅", dance:"💃", science:"🔬", chef:"🍳", superhero:"🦸" };

  function describeToSpec(text){
    var s=(text||"").toLowerCase();
    var color="#6c5ce7", emoji="🙂", acc="";
    for(var c in COLORS){ if(new RegExp("\\b"+c+"\\b").test(s)){ color=COLORS[c]; break; } }
    for(var k in CREATURES){ if(new RegExp("\\b"+k+"\\b").test(s)){ emoji=CREATURES[k]; break; } }
    for(var t in THEMES){ if(new RegExp("\\b"+t+"\\b").test(s)){ acc=THEMES[t]; break; } }
    return { color:color, emoji:emoji, acc:acc };
  }
  function shade(hex, amt){
    var n=parseInt(hex.slice(1),16), r=(n>>16)+amt, g=((n>>8)&255)+amt, b=(n&255)+amt;
    r=Math.max(0,Math.min(255,r)); g=Math.max(0,Math.min(255,g)); b=Math.max(0,Math.min(255,b));
    return "#"+(0x1000000+(r<<16)+(g<<8)+b).toString(16).slice(1);
  }
  function avatarSVG(spec, size){
    size = size||"100%";
    var c=spec.color||"#6c5ce7";
    var acc = spec.acc ? '<circle cx="150" cy="152" r="34" fill="#ffffff"/><text x="150" y="166" font-size="34" text-anchor="middle">'+spec.acc+'</text>' : '';
    return '<svg viewBox="0 0 200 200" width="'+size+'" height="'+size+'" preserveAspectRatio="xMidYMid meet">'+
      '<defs><radialGradient id="ag" cx="40%" cy="35%" r="75%"><stop offset="0" stop-color="'+shade(c,40)+'"/><stop offset="1" stop-color="'+c+'"/></radialGradient></defs>'+
      '<rect width="200" height="200" rx="44" fill="url(#ag)"/>'+
      '<circle cx="56" cy="52" r="16" fill="#ffffff" opacity=".18"/>'+
      '<text x="100" y="118" font-size="92" text-anchor="middle">'+(spec.emoji||"🙂")+'</text>'+ acc +'</svg>';
  }

  /* ------------------------------------------------------------- helpers */
  function shuffle(a){ for(var i=a.length-1;i>0;i--){ var j=Math.floor(Math.random()*(i+1)); var t=a[i];a[i]=a[j];a[j]=t; } return a; }
  function el(t,c,h){ var e=document.createElement(t); if(c) e.className=c; if(h!=null) e.innerHTML=h; return e; }
  function esc(s){ return (s||"").replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];}); }
  function toast(msg){ if(window.RED5_TOAST) return window.RED5_TOAST(msg);
    var t=el("div",null,msg); t.style.cssText="position:fixed;left:50%;bottom:26px;transform:translateX(-50%);background:#16243f;color:#fff;padding:.7rem 1.1rem;border-radius:12px;z-index:200;box-shadow:0 14px 30px rgba(0,0,0,.3)"; document.body.appendChild(t); setTimeout(function(){t.remove();},2400); }

  /* =============================== HUB PAGE =============================== */
  function initHub(){
    var grid=document.getElementById("rooms-grid");
    if(grid){
      grid.innerHTML="";
      ROOMS.forEach(function(r){
        var a=el("a","room-card"); a.href="room.html?room="+r.key;
        a.style.cssText="--accent:"+r.accent+";--accent-soft:"+r.soft;
        a.innerHTML='<span class="room-emoji">'+r.emoji+'</span>'+
          '<div class="room-meta"><h3>'+r.name+(r.support?' <span class="room-flag">Supportive</span>':'')+'</h3><p>'+r.desc+'</p></div>'+
          '<span class="room-go">'+(window.RED5_ICONS?window.RED5_ICONS.arrow:'→')+'</span>';
        grid.appendChild(a);
      });
    }
    var comp=document.getElementById("companions");
    if(comp){
      comp.innerHTML="";
      COMPANIONS.forEach(function(c){
        var d=el("div","companion-card");
        d.innerHTML='<span class="companion-av" style="background:'+shade(c.color,46)+'">'+c.emoji+'</span>'+
          '<b>'+c.name+'</b><span class="muted">'+c.bio+'</span><span class="companion-likes">Likes '+c.likes+'</span>';
        comp.appendChild(d);
      });
    }
    var badges=document.getElementById("badge-showcase");
    if(badges){
      badges.innerHTML="";
      Object.keys(BADGES).forEach(function(k){ var b=BADGES[k];
        badges.appendChild(el("div","badge-chip",'<span class="badge-ic">'+b.icon+'</span><b>'+b.name+'</b><span class="muted">'+b.note+'</span>'));
      });
    }
    if(document.getElementById("avatar-studio")) initAvatarStudio();
  }

  function initAvatarStudio(){
    var wrap=document.getElementById("avatar-studio");
    var prof=loadProfile();
    wrap.innerHTML=
      '<div class="studio-preview"><div class="studio-av" id="studio-av"></div><div class="studio-name" id="studio-name"></div></div>'+
      '<div class="studio-form">'+
        '<label for="av-name">Display name (no real names, please)</label>'+
        '<input id="av-name" type="text" maxlength="18" placeholder="e.g. StarFox, BravePanda" value="'+esc(prof.name==="You"?"":prof.name)+'">'+
        '<label for="av-desc">Describe your avatar</label>'+
        '<input id="av-desc" type="text" maxlength="40" placeholder="e.g. blue dragon, gamer panda, magical fox">'+
        '<div class="studio-chips">'+["blue dragon","gamer panda","magical fox","smiling astronaut","soccer tiger","rainbow unicorn"].map(function(x){return '<button type="button" class="rchip" data-desc="'+x+'">'+x+'</button>';}).join("")+'</div>'+
        '<div class="studio-actions"><button class="btn btn-accent" id="av-gen" type="button">✨ Generate avatar</button><button class="btn btn-outline" id="av-save" type="button">Save &amp; use</button></div>'+
        '<p class="form-note">Safe cartoon avatars only — never a real photo or identifying info. (Demo: avatars are emoji-based stand-ins for AI image generation.)</p>'+
      '</div>';
    var spec=prof.avatar;
    function render(){ document.getElementById("studio-av").innerHTML=avatarSVG(spec); document.getElementById("studio-name").textContent=(document.getElementById("av-name").value||"Your avatar"); }
    render();
    function gen(desc){ if(desc) document.getElementById("av-desc").value=desc; spec=describeToSpec(document.getElementById("av-desc").value); render(); }
    wrap.querySelector("#av-gen").addEventListener("click",function(){ gen(); });
    wrap.querySelectorAll(".rchip").forEach(function(b){ b.addEventListener("click",function(){ gen(b.getAttribute("data-desc")); }); });
    wrap.querySelector("#av-name").addEventListener("input",render);
    wrap.querySelector("#av-save").addEventListener("click",function(){
      var p=loadProfile(); p.avatar=spec; var nm=document.getElementById("av-name").value.trim(); p.name=nm||"Explorer"; saveProfile(p);
      toast("Avatar saved! You're all set. 🎉");
    });
  }

  /* =============================== ROOM PAGE ============================== */
  function initRoom(){
    var app=document.getElementById("room-app"); if(!app) return;
    var key=(location.search.match(/room=([a-z-]+)/)||[])[1] || "everyone-chat";
    var R=room(key); var prof=loadProfile();
    document.title=R.name+" — Red 5 Community";
    document.body.classList.add("accent-dynamic");
    app.style.setProperty("--accent",R.accent); app.style.setProperty("--accent-soft",R.soft);

    var online = shuffle(COMPANIONS.slice()).slice(0,4);

    app.innerHTML =
      '<div class="breadcrumb"><a href="community.html">Community</a> / '+R.name+'</div>'+
      '<div class="room-grid">'+
        '<section class="chat-panel">'+
          '<header class="chat-head"><span class="chat-emoji">'+R.emoji+'</span><div><h1>'+R.name+'</h1>'+
            '<span class="chat-sub"><span class="dot-live"></span> Public &amp; moderated · no DMs · '+(online.length+13)+' online</span></div>'+
            '<span class="mod-badge">🛡️ AI moderated</span></header>'+
        (R.support?
          '<div class="support-banner">🫶 <b>This is a caring, moderated space — not therapy.</b> Red 5 is a supportive community, not a replacement for professional counseling, therapy, medical care, or emergency services. If you are in danger or thinking about hurting yourself, tell a trusted adult now and contact your local emergency number (U.S. 911) or call/text 988.</div>':'')+
          '<div class="chat-msgs" id="chat-msgs"></div>'+
          '<form class="chat-input" id="chat-form"><input id="chat-text" type="text" maxlength="240" placeholder="Write a kind message…" autocomplete="off"><button class="chat-send" type="submit" aria-label="Send">'+(window.RED5_ICONS?window.RED5_ICONS.arrow:'Send')+'</button></form>'+
          '<p class="chat-foot">Every message is checked before it appears. Be kind, stay safe, never share personal info.</p>'+
        '</section>'+
        '<aside class="chat-side">'+
          '<div class="side-card" id="me-card"></div>'+
          '<div class="side-card"><h4>Online now</h4><div class="online-list" id="online-list"></div><p class="muted" style="font-size:.8rem;margin:.5rem 0 0">AI helpers are labeled. They keep rooms friendly &amp; safe.</p></div>'+
          '<div class="side-card"><h4>Room rules</h4><ul class="mini-rules"><li>💛 Be kind &amp; include everyone</li><li>🛡️ Never share personal info</li><li>🚫 No DMs or private chats</li><li>🙋 Tell a moderator if something\'s wrong</li></ul></div>'+
        '</aside>'+
      '</div>';

    // my card
    function renderMe(){ var p=loadProfile();
      document.getElementById("me-card").innerHTML='<div class="me-top"><span class="me-av">'+avatarSVG(p.avatar,"100%")+'</span><div><b>'+esc(p.name)+'</b><span class="muted">Member</span></div></div>'+
        '<div class="me-stats"><span class="kpts">💛 '+p.points+' kindness</span></div>'+
        '<div class="me-badges">'+(p.badges.length?p.badges.map(function(id){var b=BADGES[id];return '<span class="bdg" title="'+b.name+'">'+b.icon+'</span>';}).join(""):'<span class="muted" style="font-size:.82rem">Earn badges by being kind &amp; helpful!</span>')+'</div>'+
        '<a class="btn btn-outline btn-sm btn-block" href="community.html#studio">Edit avatar</a>';
    }
    renderMe();
    var ol=document.getElementById("online-list");
    online.forEach(function(c){ ol.appendChild(el("div","online-row",'<span class="online-av" style="background:'+shade(c.color,46)+'">'+c.emoji+'</span><b>'+c.name+'</b><span class="ai-tag">AI helper</span>')); });

    var msgs=document.getElementById("chat-msgs");
    function addMsg(opts){
      var who=opts.who; // 'companion' | 'me' | 'member' | 'system' | 'safety' | 'crisis'
      var m=el("div","cmsg "+who);
      if(who==="system"||who==="safety"||who==="crisis"){ m.innerHTML='<div class="cbubble">'+opts.html+'</div>'; }
      else {
        var av = opts.av || '<span class="cav" style="background:'+shade(opts.color||"#6c5ce7",46)+'">'+(opts.emoji||"🙂")+'</span>';
        m.innerHTML=av+'<div class="cbody"><span class="cname">'+esc(opts.name)+(opts.ai?' <span class="ai-tag">AI helper</span>':'')+'</span><div class="cbubble">'+esc(opts.text)+'</div></div>';
      }
      msgs.appendChild(m); msgs.scrollTop=msgs.scrollHeight; return m;
    }
    function companionSay(text, c){ c=c||randCompanion(); addMsg({who:"companion", name:c.name, emoji:c.emoji, color:c.color, ai:true, text:text}); }

    // seed conversation
    var seeders=shuffle(COMPANIONS.slice());
    companionSay(line("welcome"), seeders[0]);
    if(R.support){ companionSay("This is a safe place to share how you're feeling. We're here for you. 🫶", companion("Willow")); }
    else { companionSay(line("starter"), seeders[1]); }
    addMsg({who:"member", name:"BraveOtter", emoji:"🦦", color:"#34a6e0", text:"hi everyone! happy to be here 😄"});
    companionSay("Welcome BraveOtter! 🎉", seeders[2]);

    // periodic companion activity
    var timer=setInterval(function(){
      if(document.hidden) return;
      var roll=Math.random();
      companionSay(line(roll<0.4?"kindness":roll<0.75?"encourage":"starter"));
    }, 15000);
    window.addEventListener("beforeunload", function(){ clearInterval(timer); });

    // suspended state
    function checkSuspended(){ var p=loadProfile(); if(p.suspended){
      document.getElementById("chat-form").innerHTML='<div class="suspend-note">⛔ This account is paused after repeated safety violations. A parent can review this in the Parent Dashboard. <a href="parent-dashboard.html">Open dashboard</a></div>';
    }}
    checkSuspended();

    function crisisCard(){
      return '<b>💙 We are really glad you shared. You matter.</b><br>'+
        'Please talk to a trusted adult right now — a parent, teacher, or caregiver. '+
        'If you are in danger or thinking about hurting yourself, contact your local emergency number (U.S. <b>911</b>) or call/text <b>988</b> (free, 24/7). '+
        'Red 5 is a supportive community, not a replacement for professional counseling, therapy, medical care, or emergency services.<br>'+
        '<span class="mod-alerted">🛡️ A moderator has been alerted to help keep you safe.</span>';
    }

    document.getElementById("chat-form").addEventListener("submit", function(e){
      e.preventDefault();
      var input=document.getElementById("chat-text"); var text=input.value.trim(); if(!text) return;
      var p=loadProfile(); if(p.suspended) return;
      var res=moderate(text);
      if(res.action==="allow"){
        addMsg({who:"me", name:p.name, av:'<span class="cav">'+avatarSVG(p.avatar,"100%")+'</span>', text:text});
        input.value="";
        var earned=awardPoint(p,1); renderMe();
        if(/are you (real|human|a (bot|robot|person|ai|computer))|are u (real|human)|\br u real\b|is this a (bot|robot)/i.test(text)){
          setTimeout(function(){ companionSay("I'm an AI helper created by Red 5 to help make this community fun, safe, and welcoming.", randCompanion()); }, 700);
        }
        if(earned.length){ setTimeout(function(){ toast(earned[0].icon+" Badge earned: "+earned[0].name+"!"); companionSay("Way to go, "+p.name+"! You earned the "+earned[0].name+" badge "+earned[0].icon, companion("Sunny")); }, 500); }
        else if(Math.random()<0.4){ setTimeout(function(){ companionSay(["Love that! 🌟","So kind of you 💛","Great share! 🙌"][Math.floor(Math.random()*3)], randCompanion()); }, 900); }
        return;
      }
      input.value="";
      if(res.action==="crisis"){ addMsg({who:"crisis", html:crisisCard()}); return; }
      // blocked
      addMsg({who:"safety", html:'<b>'+(res.kind==="kindness"?"Message not sent":res.kind==="grooming"?"Blocked for safety":"Personal info blocked")+'</b><br>'+res.text});
      setTimeout(function(){ companionSay(line("redirect")); }, 700);
      if(res.flag){
        p.violations=(p.violations||0)+1; saveProfile(p);
        if(p.violations>=3){ p.suspended=true; saveProfile(p);
          setTimeout(function(){ addMsg({who:"system", html:'⛔ <b>Account paused.</b> After repeated safety violations, this account is paused and a parent has been notified. This protects everyone in the community.'}); checkSuspended(); }, 800);
        } else {
          addMsg({who:"system", html:'⚠️ Safety reminder ('+p.violations+'/3). Repeated attempts to share personal info or break safety rules will pause the account.'});
        }
      }
    });
  }

  /* ========================= PARENT DASHBOARD ============================ */
  function initDashboard(){
    var host=document.getElementById("parent-dash"); if(!host) return;
    var p=loadProfile();
    var days=["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]; var mins=[18,25,12,30,22,40,15];
    var maxm=Math.max.apply(null,mins);
    host.innerHTML=
      '<div class="dash-banner">👀 <b>Sample preview.</b> In the live product this shows your own child\'s real activity. Data here is illustrative.</div>'+
      '<div class="dash-grid">'+
        '<div class="dash-card"><span class="dash-ic">🧒</span><div><b>'+esc(p.name)+'</b><span class="muted">Avatar member · age range 9–12</span></div><span class="me-av sm">'+avatarSVG(p.avatar,"100%")+'</span></div>'+
        '<div class="stat"><span class="stat-n">'+ (p.points||32) +'</span><span class="stat-l">💛 Kindness points</span></div>'+
        '<div class="stat"><span class="stat-n">'+ (p.badges.length||4) +'</span><span class="stat-l">🏅 Badges earned</span></div>'+
        '<div class="stat"><span class="stat-n">7</span><span class="stat-l">💬 Rooms visited</span></div>'+
        '<div class="stat good"><span class="stat-n">0</span><span class="stat-l">🛡️ Safety incidents</span></div>'+
      '</div>'+
      '<div class="dash-row">'+
        '<div class="dash-card grow"><h3>⏱️ Time spent this week</h3><div class="bars">'+days.map(function(d,i){return '<div class="bar-col"><div class="bar" style="height:'+Math.round(mins[i]/maxm*100)+'%"><span>'+mins[i]+'m</span></div><span class="bar-l">'+d+'</span></div>';}).join("")+'</div><p class="muted">Daily limit (sample): 45 min · Total this week: '+mins.reduce(function(a,b){return a+b;},0)+' min</p></div>'+
        '<div class="dash-card grow"><h3>🛡️ Safety report</h3><ul class="safe-list"><li><b>0</b> bullying or harmful messages reached your child</li><li><b>0</b> grooming attempts (auto-blocked: 0)</li><li><b>0</b> personal-info shares (auto-blocked)</li><li><b>100%</b> of messages screened before posting</li><li><b>No</b> direct messages exist on Red 5</li></ul></div>'+
      '</div>'+
      '<div class="dash-row">'+
        '<div class="dash-card grow"><h3>🔍 How moderation works</h3><ul class="safe-list"><li>Every message is checked by AI <em>before</em> it can appear.</li><li>Harmful content is blocked and never posted publicly.</li><li>Personal info &amp; grooming attempts are blocked and flagged.</li><li>Crisis language triggers resources + a moderator alert.</li><li>Repeated violations pause the account and notify you.</li></ul></div>'+
        '<div class="dash-card grow"><h3>⚙️ Controls (sample)</h3><div class="toggles">'+
          tog("Daily time limit (45 min)",true)+tog("Allow Peer Support Room",true)+tog("Email me weekly safety report",true)+tog("Pause account",false)+
        '</div></div>'+
      '</div>'+
      '<div class="callout red" style="margin-top:1.2rem"><span class="ico">🫶</span><div><h3>A note for families</h3><p>Red 5 is a supportive community and educational resource. It is not a replacement for professional therapy, medical care, or emergency support. If a child is in immediate danger, contact emergency services.</p></div></div>';
    host.querySelectorAll(".toggle input").forEach(function(t){ t.addEventListener("change",function(){ toast("Setting saved (demo)."); }); });
  }
  function tog(label,on){ return '<label class="toggle"><span>'+label+'</span><input type="checkbox" '+(on?"checked":"")+'><span class="track"></span></label>'; }

  /* --------------------------------------------------------------- boot */
  window.RED5_MOD = { moderate:moderate, describeToSpec:describeToSpec, avatarSVG:avatarSVG };
  function boot(){
    if(document.getElementById("rooms-grid")||document.getElementById("avatar-studio")) initHub();
    if(document.getElementById("room-app")) initRoom();
    if(document.getElementById("parent-dash")) initDashboard();
  }
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",boot); else boot();
})();
