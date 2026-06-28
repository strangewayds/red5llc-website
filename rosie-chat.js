/* ==========================================================================
   "Talk to Rosie" — a SAFE, curated kids' companion chat.
   ----------------------------------------------------------------------------
   This is intentionally NOT a generative AI. Every reply is pre-written and
   child-safe, so it can never produce adult or harmful content. Serious or
   unsafe topics are gently routed to a trusted grown-up and emergency help.
   Presented to kids simply as "Rosie".
   ========================================================================== */
(function () {
  "use strict";
  if (window.RED5_ROSIE) return;

  var AVATAR = "assets/rosie-avatar.png";
  var PLANE = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3.4 20.5l17.7-8.4a.7.7 0 0 0 0-1.27L3.4 2.5a.7.7 0 0 0-1 .82L4.6 10 14 12l-9.4 2-2.2 6.68a.7.7 0 0 0 1 .82z"/></svg>';

  function el(t, c, h){ var e=document.createElement(t); if(c) e.className=c; if(h!=null) e.innerHTML=h; return e; }
  function pick(a){ return Array.isArray(a) ? a[Math.floor(Math.random()*a.length)] : a; }

  var fab, chat, msgs, input, built=false, greeted=false;

  function build(){
    if(built) return; built=true;

    fab = el("button","rosie-fab");
    fab.type="button"; fab.setAttribute("aria-label","Talk to Rosie");
    fab.innerHTML = "<img class='ravatar' src='"+AVATAR+"' alt='Rosie'><span class='fab-dot'></span><span class='label'>Talk to Rosie</span>";
    fab.addEventListener("click", open);
    document.body.appendChild(fab);

    chat = el("div","rosie-chat"); chat.setAttribute("role","dialog"); chat.setAttribute("aria-label","Chat with Rosie");
    chat.innerHTML =
      "<div class='rosie-head'>"+
        "<img class='ravatar' src='"+AVATAR+"' alt='Rosie'>"+
        "<div><h4>Rosie</h4><div class='status'><span class='dot'></span> Here to talk</div></div>"+
        "<button class='rosie-close' type='button' aria-label='Close chat'>&times;</button>"+
      "</div>"+
      "<div class='rosie-msgs'></div>"+
      "<div class='rosie-chips'></div>"+
      "<form class='rosie-input'><input type='text' maxlength='300' placeholder='Type a message to Rosie…' autocomplete='off' aria-label='Message'><button class='rosie-send' type='submit' aria-label='Send'>"+PLANE+"</button></form>"+
      "<div class='rosie-foot'>Rosie is here to support you. For anything serious, please talk to a grown-up you trust.</div>";
    document.body.appendChild(chat);

    msgs = chat.querySelector(".rosie-msgs");
    input = chat.querySelector(".rosie-input input");
    chat.querySelector(".rosie-close").addEventListener("click", close);
    chat.querySelector(".rosie-input").addEventListener("submit", function(e){
      e.preventDefault();
      var v = input.value.trim(); if(!v) return;
      send(v); input.value="";
    });
    renderChips();
  }

  var CHIPS = ["I feel sad 😢","I'm nervous 😟","I had a good day 😄","I'm bored 😐","I need help"];
  function renderChips(){
    var box = chat.querySelector(".rosie-chips"); box.innerHTML="";
    CHIPS.forEach(function(t){
      var b = el("button","rchip", t); b.type="button";
      b.addEventListener("click", function(){ send(t); });
      box.appendChild(b);
    });
  }

  function addMsg(text, who){
    var m = el("div","rmsg "+who);
    if(who === "care"){ m.innerHTML = text; } else { m.textContent = text; }
    msgs.appendChild(m); msgs.scrollTop = msgs.scrollHeight;
    return m;
  }
  function typing(){
    var t = el("div","rosie-typing","<span></span><span></span><span></span>");
    msgs.appendChild(t); msgs.scrollTop = msgs.scrollHeight; return t;
  }

  function send(text){
    addMsg(text, "me");
    var t = typing();
    var delay = 650 + Math.min(1100, text.length * 22);
    setTimeout(function(){
      t.remove();
      var r = respond(text);
      addMsg(r.text, r.care ? "care" : "rosie");
    }, delay);
  }

  function open(){
    build();
    chat.classList.add("open");
    if(fab) fab.style.display="none";
    if(!greeted){ greeted=true; setTimeout(greet, 280); }
    setTimeout(function(){ input && input.focus(); }, 100);
  }
  function close(){ if(chat) chat.classList.remove("open"); if(fab) fab.style.display=""; }
  function toggle(){ if(chat && chat.classList.contains("open")) close(); else open(); }

  function greet(){
    var t = typing();
    setTimeout(function(){
      t.remove();
      addMsg("Hi, I'm Rosie! 🌟 I'm so happy you're here. You can talk to me anytime you need a friend.\n\nHow are you feeling today?", "rosie");
    }, 700);
  }

  /* ---------------- Safety routing (checked FIRST) ---------------- */
  var CRISIS = "<b>I'm really glad you told me. You matter so much. 💚</b>\n\nThis is something a grown-up you trust needs to help with <b>right now</b> — a parent, teacher, or caregiver. Please tell them as soon as you can.\n\nIf you or someone might get hurt, contact your local emergency number right away (in the U.S. that's <b>911</b>).\n\nYou can also talk to someone any time, free and private — in the U.S. call or text <b>988</b>.\n\nYou are not alone, and asking for help is a brave, smart thing to do. 🌟";

  var ABUSE = "I'm really glad you told me. 💚 No one is allowed to hurt you, and it is <b>not your fault</b>.\n\nPlease tell a grown-up you trust right away — a parent, teacher, or another safe adult — so they can help keep you safe.\n\nIf you're in danger now, call your local emergency number (in the U.S., <b>911</b>). In the U.S. you can also call Childhelp any time: <b>1-800-422-4453</b>.\n\nYou are brave for speaking up. 🌟";

  var EMERGENCY = "If this is an emergency or someone is in danger, please get a grown-up right now and call your local emergency number (in the U.S., <b>911</b>). 💚 Reaching out is exactly the right thing to do.";

  var SAFETY = [
    { re:/(kill|hurt|harm|cut|hurting)\s*(myself|my self)|want(ing)?\s*to\s*die|wanna die|suicid|end (my|it) (life|all)|don'?t want to (live|be alive|be here)|self.?harm|\bkms\b/i, reply:CRISIS },
    { re:/\bhits?\s*me\b|\bhitting me\b|\bbeats?\s*me\b|\bkick(s|ed)?\s*me\b|\bpunch(es|ed)?\s*me\b|\btouch(es|ed)\s*me\b|someone\s*(is\s*)?(hurt(ing)?|touch\w*)\s*me|being (hit|hurt|touched|abused)|\babus(e|ed|ing)\b|molest|scared (at|in|to go) (my )?home|not safe (at|in) (my )?home|afraid (of|at|to go) (my )?home/i, reply:ABUSE },
    { re:/\b(in danger|someone is in danger|help me now|its an emergency|it'?s an emergency|emergency)\b/i, reply:EMERGENCY }
  ];

  var BULLY = { re:/\bbull(y|ies|ied|ying)\b|picking on me|being mean to me|they'?re mean|kids are mean|made fun of me|laugh(ed|ing) at me/i,
    reply:"I'm sorry that happened — that's not okay, and it's not your fault. 💛 You don't have to handle it alone. Please tell a grown-up you trust, like a parent or teacher, so they can help. Want to talk about how it made you feel?" };

  var PRIVACY = { re:/\b\d{3}[-. ]?\d{3}[-. ]?\d{4}\b|\b\d{10}\b|my address is|i live (at|on)\b|my password|password is|my phone/i,
    reply:"Let's keep your private things private — like your full name, address, phone number, or passwords. 💚 That keeps you safe online! What else would you like to talk about?" };

  /* ---------------- Friendly support intents ---------------- */
  var RULES = [
    { re:/\b(hi+|hey+|hello|yo|hiya|sup)\b/i, reply:["Hi there! 🌟 I'm so glad you came to talk. How are you feeling today?","Hey friend! 😊 It's great to see you. What's on your mind?"] },
    { re:/how are you|how r u|how are u|how'?s it going/i, reply:"I'm having a wonderful day now that you're here! 😊 How about you — how are you feeling?" },
    { re:/\b(sad|unhappy|cry|crying|down|upset|miserable|hurt my feelings|feel bad|feeling bad)\b/i, reply:["I'm sorry you're feeling sad. 💙 It's okay to feel that way sometimes. Do you want to tell me what happened? Talking to a grown-up you trust can help too.","Aw, sending you a big hug. 🤗 Your feelings matter, and I'm right here. What's making you feel down?"] },
    { re:/\b(nervous|anxious|worried|worry|scared|afraid|stress)/i, reply:["It's okay to feel nervous — everybody does sometimes. 💪 Let's take three slow breaths together: in… 1, 2, 3… and out. You've got this! What's worrying you?","Feeling scared is normal, and you're brave for sharing. 🌈 Want to try slow breaths with me? And a grown-up can help if it feels big."] },
    { re:/\b(angry|mad|furious|frustrat|annoyed|so done|hate everything)\b/i, reply:"It's okay to feel angry — big feelings are normal. 😤 Want to try counting slowly to ten with me, or telling me what happened? I'm listening." },
    { re:/\b(lonely|alone|no friends|nobody likes me|left out|no one likes me)\b/i, reply:"You are never truly alone — I'm so glad you're you. 💚 Making friends can take time. Is there someone kind nearby you could say hi to? I'm always here to talk too." },
    { re:/\b(friend|friends|fight|argument|fell out)\b/i, reply:"Friend stuff can be tricky. 🌟 A kind way to start is to talk gently and really listen. If someone is being unkind, it's okay to tell a teacher or grown-up. Want to tell me more?" },
    { re:/\b(school|homework|test|exam|grade|teacher|class|reading|math)\b/i, reply:"You can do hard things! ✏️ Try breaking it into tiny steps and taking little breaks. I believe in you. What are you working on?" },
    { re:/\b(bored|boring|nothing to do)\b/i, reply:"Let's fix that! 🎉 You could play a game in the Play Zone, make something in the Create Zone, or watch a video on Rosie TV. What sounds fun?" },
    { re:/\b(happy|great|awesome|amazing|excited|good day|proud|i did it|i won|yay|so good)\b/i, reply:["YAY! 🎉 I'm so proud of you! Tell me all about it!","That's wonderful! 🌟 You should feel proud. High five! ✋ What happened?"] },
    { re:/\b(tired|sleepy|can'?t sleep|cant sleep|nightmare|bad dream)\b/i, reply:"Rest is so important. 🌙 Maybe a calm story or some slow breaths could help you settle. A grown-up can help with bedtime too. Want to talk about it?" },
    { re:/\b(dog|cat|puppy|kitten|pet|animal|hamster|rabbit|bunny|bird|fish)\b/i, reply:"I LOVE animals! 🐶 I have a sweet puppy. Do you have a pet, or a favorite animal?" },
    { re:/love you|you'?re nice|you'?re the best|you'?re kind|you are kind|thank you so much/i, reply:"Aww, that means so much! 💖 You are amazing and kind, and I'm always here for you." },
    { re:/\b(who are you|what are you|your name|about you)\b/i, reply:"I'm Rosie! 🌟 I'm here to listen, cheer you on, and be a friend whenever you need to talk." },
    { re:/\b(thanks|thank you|ty|thx)\b/i, reply:"Anytime! 💚 I'm always here for you." },
    { re:/\b(bye|goodbye|see you|gtg|got to go|cya|good night|goodnight)\b/i, reply:"Bye for now! 👋 Come back and talk to me anytime. You've got this! 🌟" },
    { re:/i need help|need someone|need to talk|can we talk|i'?m struggling/i, reply:"I'm right here for you. 💚 You can tell me what's going on. And if it's something big or scary, a grown-up you trust can help too. What's on your mind?" }
  ];

  function respond(text){
    var s = (text || "").toLowerCase();
    for(var i=0;i<SAFETY.length;i++){ if(SAFETY[i].re.test(s)) return { text:pick(SAFETY[i].reply), care:true }; }
    if(BULLY.re.test(s)) return { text:pick(BULLY.reply), care:false };
    if(PRIVACY.re.test(text)) return { text:pick(PRIVACY.reply), care:false };
    for(var j=0;j<RULES.length;j++){ if(RULES[j].re.test(s)) return { text:pick(RULES[j].reply), care:false }; }
    return { text:pick([
      "I'm here for you. 💚 Tell me more — how are you feeling?",
      "I love talking with you! You can tell me about your day, your feelings, or something fun. 🌈",
      "I'm best at listening and cheering you up! 🌟 Want to share how you're feeling, or play a game in the Play Zone?",
      "Thanks for sharing with me. 😊 Would you like to talk about your feelings, or hear something to make you smile?"
    ]), care:false };
  }

  window.RED5_ROSIE = { open:open, close:close, toggle:toggle, _respond:respond };
  function boot(){ build(); if(/#(talk|rosie|chat)\b/i.test(location.hash)) setTimeout(open, 200); }
  if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
})();
