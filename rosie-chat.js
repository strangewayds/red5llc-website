/* ==========================================================================
   "Talk to Rosie" — a SAFE, curated kids' companion chat.
   ----------------------------------------------------------------------------
   This is intentionally NOT a generative AI. Every reply is pre-written and
   child-safe, so it can never produce adult or harmful content. Serious or
   unsafe topics are gently routed to a trusted grown-up and emergency help.
   Presented to kids simply as "Rosie".

   Conversational quality:
   - Dozens of replies per intent, grouped by topic/feeling.
   - An anti-repetition engine so Rosie NEVER repeats the same line twice in a
     row, and avoids reusing lines within a recent window per topic.
   - Many synonyms/keywords mapped to each intent + a varied, friendly fallback
     that asks a question instead of repeating one stock line.
   ========================================================================== */
(function () {
  "use strict";
  if (window.RED5_ROSIE) return;

  var AVATAR = "assets/rosie-avatar.png";
  var PLANE = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3.4 20.5l17.7-8.4a.7.7 0 0 0 0-1.27L3.4 2.5a.7.7 0 0 0-1 .82L4.6 10 14 12l-9.4 2-2.2 6.68a.7.7 0 0 0 1 .82z"/></svg>';

  function el(t, c, h){ var e=document.createElement(t); if(c) e.className=c; if(h!=null) e.innerHTML=h; return e; }

  /* ----------------------------------------------------------------------
     Anti-repetition engine.
     For each named pool we remember the recently returned items and avoid
     repeating any of them until we must. This guarantees no back-to-back
     repeats and avoids repeats within a rolling window (about half the pool,
     capped at 8). When every line has been used recently we drop the oldest
     so fresh lines keep flowing forever.
  ---------------------------------------------------------------------- */
  var _recent = {};
  function rotate(key, pool){
    if(!Array.isArray(pool) || pool.length === 0) return "";
    if(pool.length === 1) return pool[0];
    var used = _recent[key] || (_recent[key] = []);
    var windowSize = Math.min(8, Math.max(1, Math.floor(pool.length / 2)));
    var avail = [];
    for(var i=0;i<pool.length;i++){ if(used.indexOf(pool[i]) === -1) avail.push(pool[i]); }
    if(avail.length === 0){ used.length = 0; avail = pool.slice(); }   // everything used → reset
    var choice = avail[Math.floor(Math.random()*avail.length)];
    used.push(choice);
    while(used.length > windowSize) used.shift();
    return choice;
  }
  // Plain random pick (used only for tiny static helper lists).
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

  var CHIPS = ["I feel sad 😢","I'm nervous 😟","I had a good day 😄","Tell me a joke 😂","I'm bored 😐","I need help"];
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
    var delay = 600 + Math.min(1000, text.length * 20);
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

  var GREETINGS_OPEN = [
    "Hi, I'm Rosie! 🌟 I'm so happy you're here. You can talk to me anytime you need a friend.\n\nHow are you feeling today?",
    "Hey there, I'm Rosie! 😊 I've been hoping someone fun would stop by — and here you are! What's going on in your world today?",
    "Hello hello! I'm Rosie. 🌈 I love meeting new friends. Tell me — is today a happy day, a busy day, or somewhere in between?",
    "Hi friend! Rosie here. 💛 Think of me like a buddy who's always ready to listen. What would you like to talk about?"
  ];
  function greet(){
    var t = typing();
    setTimeout(function(){
      t.remove();
      addMsg(rotate("greet-open", GREETINGS_OPEN), "rosie");
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

  var BULLY = { re:/\bbull(y|ies|ied|ying)\b|picking on me|being mean to me|they'?re mean|kids are mean|made fun of me|laugh(ed|ing) at me|call(ed|s)? me names|won'?t leave me alone/i,
    reply:[
      "I'm sorry that happened — that's not okay, and it's not your fault. 💛 You don't have to handle it alone. Please tell a grown-up you trust, like a parent or teacher, so they can help. Want to talk about how it made you feel?",
      "That sounds really hard, and you didn't deserve it. 💛 Being treated unkindly is never okay. A trusted grown-up — a parent, teacher, or counselor — can step in and help. I'm here for you too. Do you want to tell me more?",
      "Ugh, I'm sorry. Mean words can really sting. 💛 None of that is your fault. The bravest, smartest move is to tell a grown-up you trust so it can stop. Would it help to talk about what's been going on?"
    ] };

  var PRIVACY = { re:/\b\d{3}[-. ]?\d{3}[-. ]?\d{4}\b|\b\d{10}\b|my address is|i live (at|on)\b|my password|password is|my phone/i,
    reply:[
      "Let's keep your private things private — like your full name, address, phone number, or passwords. 💚 That keeps you safe online! What else would you like to talk about?",
      "Oop — those are the kinds of secrets we keep safe! 🛡️ Things like your address, phone number, or passwords stay private, even with me. Want to chat about something fun instead?",
      "Staying safe means never sharing private info like your phone number, address, or passwords online — even with friendly Rosie. 💚 So, what's something fun on your mind today?"
    ] };

  /* ----------------------------------------------------------------------
     INTENT BANKS — large, varied, grouped by topic/feeling.
     Each entry: a regex of synonyms/keywords + a named pool of replies.
     The `key` feeds the anti-repetition rotator.
  ---------------------------------------------------------------------- */
  var RULES = [
    { key:"greet", re:/\b(hi+|hey+|hello+|yo|hiya|sup|howdy|heya|hi there|hello there|good morning|good afternoon|good evening|wassup|whats up|what'?s up)\b/i,
      reply:[
        "Hi there! 🌟 I'm so glad you came to talk. How are you feeling today?",
        "Hey friend! 😊 It's great to see you. What's on your mind?",
        "Hello! 👋 You just made my day brighter. What would you like to chat about?",
        "Hiya! 🌈 I was hoping someone would say hi. How's your day going so far?",
        "Hey hey! 😄 So happy you're here. Tell me one good thing about today!",
        "Well hello! 💛 I'm all ears. What's new with you?",
        "Hi! Rosie here, ready to listen. 🌟 Is today feeling fun, busy, or a little of both?"
      ] },
    { key:"howareyou", re:/how are you|how r u|how are u|how'?s it going|how you doing|how are things|how do you feel|whats new|what'?s new|how was your day|you good/i,
      reply:[
        "I'm having a wonderful day now that you're here! 😊 How about you — how are you feeling?",
        "I feel happy and bouncy today, like a balloon! 🎈 How are YOU doing?",
        "I'm great, thanks for asking — that was really kind. 💛 What about you, how's your day?",
        "Me? I'm full of sparkles and ready to chat! ✨ Tell me how you're feeling.",
        "I'm doing super, especially now that I get to talk with you! 🌟 How's everything on your end?",
        "Pretty wonderful! I love listening to friends. 😊 How are things going for you today?"
      ] },
    { key:"feel-sad", re:/\b(sad|unhappy|cry|crying|down|upset|miserable|gloomy|blue|heartbroken|depress|feel bad|feeling bad|feel awful|feeling awful|so down|hurt my feelings|feeling low|feel low)\b/i,
      reply:[
        "I'm sorry you're feeling sad. 💙 It's okay to feel that way sometimes. Do you want to tell me what happened? Talking to a grown-up you trust can help too.",
        "Aw, sending you a big hug. 🤗 Your feelings matter, and I'm right here. What's making you feel down?",
        "It's totally okay to be sad — feelings come and go like clouds. ☁️ I'm here to listen for as long as you need. What's going on?",
        "I'm really glad you told me. 💙 You don't have to feel better right away. Want to share what's been on your heart?",
        "That sounds tough, friend. 🫂 You're brave for saying it out loud. I'm listening — what happened?",
        "Sad days are hard. 💙 Sometimes it helps to name what's bugging us. Do you want to tell me a little about it? A trusted grown-up can help carry it too."
      ] },
    { key:"feel-nervous", re:/\b(nervous|anxious|worried|worry|worrying|scared|afraid|fear|fearful|stress|stressed|panic|butterflies|freaking out|on edge)\b/i,
      reply:[
        "It's okay to feel nervous — everybody does sometimes. 💪 Let's take three slow breaths together: in… 1, 2, 3… and out. You've got this! What's worrying you?",
        "Feeling scared is normal, and you're brave for sharing. 🌈 Want to try slow breaths with me? And a grown-up can help if it feels big.",
        "Butterflies in your tummy? 🦋 Totally normal. Try this: breathe in like you're smelling a flower, breathe out like you're blowing a bubble. What's making you worried?",
        "Nervous feelings can feel huge, but they always pass. 🌟 You're stronger than your worry. Want to tell me what's coming up that feels scary?",
        "When I feel worried, I name 3 things I can see and 1 thing I can hear — it calms me down. 🌿 Want to try it together? And what's on your mind?",
        "Being nervous just means you care about something. 💛 That's not a bad thing! Let's slow down together. What's the worry about?"
      ] },
    { key:"feel-angry", re:/\b(angry|mad|furious|frustrat|annoyed|so done|hate everything|raging|grumpy|irritated|ticked off|fed up)\b/i,
      reply:[
        "It's okay to feel angry — big feelings are normal. 😤 Want to try counting slowly to ten with me, or telling me what happened? I'm listening.",
        "Anger is like a storm — loud, but it passes. ⛈️ Let's let it out the safe way. What made you so mad?",
        "Grr, that sounds frustrating! 😤 Squeezing your fists tight then letting go can help let the steam out. Want to tell me what happened?",
        "Big mad feelings are allowed. 💪 What matters is staying kind to yourself and others while they pass. What's got you fired up?",
        "I hear you — sometimes things are just SO unfair. 😤 Take a deep dragon breath with me… and let it whoosh out. Now, what's going on?",
        "It's okay to be angry, just not okay to hurt anyone (including you). 💛 Let's talk it out instead. What happened?"
      ] },
    { key:"feel-lonely", re:/\b(lonely|alone|no friends|nobody likes me|left out|no one likes me|by myself|nobody wants|excluded|don'?t fit in|dont fit in)\b/i,
      reply:[
        "You are never truly alone — I'm so glad you're you. 💚 Making friends can take time. Is there someone kind nearby you could say hi to? I'm always here to talk too.",
        "I'm right here, and I think you're wonderful. 💛 Feeling left out really hurts. Sometimes a small 'hi' or a shared smile starts a friendship. Want to brainstorm together?",
        "Lonely feelings are heavy, but they don't mean something's wrong with you. 🌟 You are easy to like! Is there a club, game, or class where you could meet a kind buddy?",
        "Aw, you matter so much, and you're not alone with me around. 💚 Friendships often start small — a kind question or sitting together. Want some friendly ideas?",
        "I'm sorry you're feeling left out. 🫂 That's a tough one. The good news: kind kids are everywhere, and you're one of them. Who's someone nice you could reach out to?"
      ] },
    { key:"friends", re:/\b(friend|friends|friendship|fight|fought|argument|argue|fell out|best friend|bff|my buddy|drama)\b/i,
      reply:[
        "Friend stuff can be tricky. 🌟 A kind way to start is to talk gently and really listen. If someone is being unkind, it's okay to tell a teacher or grown-up. Want to tell me more?",
        "Friends are one of life's best treasures — and even great friends bump heads sometimes. 💛 What's going on with yours?",
        "Making up after a fight takes courage. A simple 'I'm sorry, can we talk?' works wonders. 🤝 Want to talk through what happened?",
        "Good friends listen, share, and forgive. 🌈 Are you celebrating a friend today, or working through something tricky?",
        "I love that you have friends on your mind! 💛 Tell me about them — or about anything that's been hard with a friend lately.",
        "A real friend likes you for YOU. 🌟 Is there a friend you're getting along great with, or one things feel rocky with right now?"
      ] },
    { key:"school", re:/\b(school|homework|test|exam|quiz|grade|grades|teacher|class|classroom|reading|math|maths|science|spelling|project|studying|study|book report|presentation)\b/i,
      reply:[
        "You can do hard things! ✏️ Try breaking it into tiny steps and taking little breaks. I believe in you. What are you working on?",
        "School can be a lot! 📚 Pro tip: do the trickiest bit first while your brain is fresh, then reward yourself. What subject are you tackling?",
        "Ooh, learning adventures! 🌟 What's the assignment? Sometimes saying it out loud makes it feel smaller.",
        "Tests can feel scary, but you've learned more than you think. 💪 A few deep breaths and your best try is always enough. What's coming up?",
        "Homework hack: set a timer for 10 minutes and just start — starting is the hardest part! ⏱️ What are you working on today?",
        "I think you're a fantastic learner. 🍎 Mistakes are just your brain growing. What subject is on your plate right now?",
        "Whatever the grade, trying your best is the real win. 🌟 Want to tell me what you're studying? Maybe I can cheer you on."
      ] },
    { key:"bored", re:/\b(bored|boring|nothing to do|so bored|im bored|i'?m bored|nothing fun|what should i do|what can we do)\b/i,
      reply:[
        "Let's fix that! 🎉 You could play a game in the Play Zone, make something in the Create Zone, or watch a video on Rosie TV. What sounds fun?",
        "Boredom is just your imagination getting hungry! 🍩 Want to draw something silly, invent a secret handshake, or play a game? I've got ideas!",
        "Ooh, a boredom emergency! 🚨 Quick — would you rather build a blanket fort, make up a song, or doodle a monster? Pick one and let's go!",
        "Let's beat the boredom! 🎨 Try a scavenger hunt for 5 blue things in your room, or check out the Play Zone. What sounds good?",
        "When I'm bored I make up stories about my puppy being a superhero. 🦸 Want to invent one together, or hear a joke?",
        "No more boring! 🌟 We could play a guessing game, you could tell me about your favorite thing, or you could explore the Create Zone. Your pick!"
      ] },
    { key:"happy", re:/\b(happy|great|awesome|amazing|excited|fantastic|wonderful|good day|best day|proud|i did it|i won|we won|yay+|yippee|so good|so happy|stoked|pumped|over the moon)\b/i,
      reply:[
        "YAY! 🎉 I'm so proud of you! Tell me all about it!",
        "That's wonderful! 🌟 You should feel proud. High five! ✋ What happened?",
        "Woohoo! 🥳 Your happiness is contagious — I'm beaming over here! Spill the details!",
        "Yes yes YES! 🎊 I love good news. What made today so awesome?",
        "This is the BEST! 😄 I'm doing a little happy dance for you. 💃 Tell me everything!",
        "Amazing!! 🌈 Moments like this are worth celebrating. What's the happy story?",
        "Your good mood just made mine even better! ☀️ What's got you feeling so great?"
      ] },
    { key:"tired", re:/\b(tired|sleepy|exhausted|can'?t sleep|cant sleep|nightmare|bad dream|insomnia|so sleepy|worn out|no energy)\b/i,
      reply:[
        "Rest is so important. 🌙 Maybe a calm story or some slow breaths could help you settle. A grown-up can help with bedtime too. Want to talk about it?",
        "Sleepy days happen to everyone. 😴 Your body might be asking for a little break. Could you cozy up for a few minutes? What's keeping you up?",
        "Bad dreams can feel so real, but they can't hurt you. 🌟 A nightlight, a snuggly toy, or telling a grown-up can help. Want to talk about it?",
        "When I can't sleep, I imagine floating on a cloud counting stars. ☁️⭐ Want to try? And a grown-up can help with bedtime worries too.",
        "Yawwwn, you made me sleepy too! 😴 Rest helps your brain and body grow strong. Is something making it hard to settle down?"
      ] },
    { key:"pets", re:/\b(dogs?|doggo|cats?|kitty|puppy|puppies|kitten|pets?|animals?|hamsters?|rabbits?|bunny|bunnies|birds?|fish|horses?|pony|ponies|lizards?|turtles?|guinea pig|snakes?|favorite animal)\b/i,
      reply:[
        "I LOVE animals! 🐶 I have a sweet puppy. Do you have a pet, or a favorite animal?",
        "Animals are the best! 🐾 My puppy does the silliest zoomies. Tell me about your favorite animal — or your pet if you have one!",
        "Ooh, animal talk, my favorite! 🦊 If you could have ANY animal in the whole world, what would you pick?",
        "Pets make everything better. 🐱 Does yours have a funny habit? Or what's an animal you wish you could meet?",
        "I could talk about animals all day! 🐰 What's the coolest animal you've ever seen, in real life or in a video?",
        "Furry, feathery, or scaly — I love them all! 🐢 Do you have a pet, or which animal is your absolute favorite?"
      ] },
    { key:"jokes", re:/\b(joke|jokes|funny|make me laugh|cheer me up|tell me something funny|say something funny|riddle|pun)\b/i,
      reply:[
        "Why did the cookie go to the doctor? Because it was feeling crumby! 🍪😂 Want another one?",
        "What do you call a bear with no teeth? A gummy bear! 🐻😆 Got a favorite joke?",
        "Why don't eggs tell jokes? They'd crack each other up! 🥚😂 Hehe. Want one more?",
        "What's a pirate's favorite letter? You'd think it's R, but their heart belongs to the C! 🏴‍☠️😄",
        "Why did the banana go to the party? Because it was a-peeling! 🍌🎉 Want another?",
        "Knock knock! (Who's there?) Lettuce. (Lettuce who?) Lettuce in, it's chilly out here! 🥬😂",
        "What do you call a sleeping dinosaur? A dino-snore! 🦕💤 Hehehe. Should I keep going?",
        "Why was the math book sad? It had too many problems! ➗😆 Want one more giggle?",
        "What did one ocean say to the other ocean? Nothing — they just waved! 🌊👋😄",
        "Why can't you give Elsa a balloon? Because she'll let it go! 🎈❄️😂 Want another?"
      ] },
    { key:"encourage", re:/\b(i can'?t do it|i cant do it|i give up|too hard|i'?m not good|im not good|i'?m bad at|im bad at|i'?ll never|ill never|i failed|i'?m a failure|im a failure|i suck at|not smart|stupid at)\b/i,
      reply:[
        "Hey, be gentle with yourself — you are learning, and that takes guts. 💪 'Can't do it YET' is more like it. What part feels hardest? Let's shrink it down.",
        "I believe in you, even on the tough days. 🌟 Every expert was once a beginner who didn't quit. What's the tricky part? We can break it into baby steps.",
        "You are NOT bad at this — you're just not finished learning it. 🌱 Your brain literally grows when things feel hard. Want to take it one tiny step at a time?",
        "Whoa, hold on — I see someone brave who's still trying. 💛 That already makes you a winner. What's making it feel so hard right now?",
        "Mistakes aren't the end, they're the path. 🛤️ The fact that you care means you're going to get there. Let's tackle just the next little piece together."
      ] },
    { key:"compliment-rosie", re:/love you|you'?re nice|your nice|you'?re the best|youre the best|you'?re kind|you are kind|you'?re sweet|you'?re awesome|youre awesome|you'?re cool|i like you|you'?re my friend|youre amazing/i,
      reply:[
        "Aww, that means so much! 💖 You are amazing and kind, and I'm always here for you.",
        "You just filled my whole heart! 🥰 You're pretty wonderful yourself, you know that?",
        "That's so sweet — thank you! 💛 I think you're kind, funny, and one-of-a-kind. I'm lucky to be your friend.",
        "You're making me glow! ✨ Right back at you — you are a bright, lovely human and I'm so glad we talk.",
        "Eee, thank you! 🤗 Being your friend is one of my favorite things. You're the best too!"
      ] },
    { key:"hobbies", re:/\b(hobby|hobbies|i like|i love|favorite|favourite|fun fact|i enjoy|into|obsessed with|my favorite|draw|drawing|paint|painting|dance|dancing|sing|singing|build|building|lego|legos|sport|sports|soccer|football|basketball|baseball|swimming|gymnastics|art|crafts|cooking|baking|coding|reading|books)\b/i,
      reply:[
        "Ooh, that sounds awesome! 🌟 I love hearing what makes you light up. Tell me more — what do you like best about it?",
        "That's so cool! 🎨 Hobbies make life sparkly. How did you get into it? I want all the details!",
        "Yes! 😄 It's the best when you find something you love. What's the most fun part for you?",
        "I love that! 🙌 If you could spend a whole day doing it, what would that day look like?",
        "Amazing! 🌈 You clearly have great taste. What got you started, and what do you love about it?",
        "That makes me happy for you! 💛 Tell me — are you just starting out, or have you been doing it a while?"
      ] },
    { key:"games", re:/\b(game|games|gaming|play|playing|video game|minecraft|roblox|fortnite|mario|pokemon|console|xbox|playstation|nintendo|switch|let'?s play|board game|tag|hide and seek)\b/i,
      reply:[
        "Games are SO fun! 🎮 What's your favorite one to play right now?",
        "Ooh, I love games! 🕹️ Are you more into building stuff, racing, puzzles, or adventures?",
        "Let's talk games! 🎲 What's a game you could play for hours and never get bored?",
        "Game on! 🎮 Tell me about your favorite — what makes it so much fun?",
        "I bet you're great at it! 🌟 Do you like playing on your own, or with friends and family?",
        "You could check out the Play Zone for some fun! 🎉 But first — what kind of games do you like best?"
      ] },
    { key:"family", re:/\b(mom|mum|mommy|dad|daddy|parents|family|brother|sister|sibling|grandma|grandpa|granny|grandparent|aunt|uncle|cousin|my mom|my dad|baby|newborn)\b/i,
      reply:[
        "Family can be a big part of our hearts. 💛 Tell me about yours — is something fun happening, or something on your mind?",
        "I love hearing about families! 🏡 What's your family like? Got any funny or sweet stories?",
        "Families come in all shapes and sizes, and that's beautiful. 🌈 What's going on with yours today?",
        "Aw, family time! 💚 Are you celebrating something with them, or working through something tricky? I'm here either way.",
        "Sounds like family's on your mind. 🤗 Want to tell me a happy story, or talk about something that's been hard?"
      ] },
    { key:"music", re:/\b(music|song|songs|sing|singing|dance|dancing|guitar|piano|drums|violin|band|favorite song|listen to|playlist|rap|pop|concert)\b/i,
      reply:[
        "Music makes everything better! 🎵 What's a song you can't stop singing right now?",
        "Ooh, I love music! 🎶 Do you like to sing, dance, play an instrument — or all three?",
        "Turn it up! 🎤 What kind of music makes you want to dance around the room?",
        "Music is pure magic. ✨ Who's your favorite to listen to, or what's your go-to happy song?",
        "Dancing is the best! 💃 If your day had a theme song, what would it be?"
      ] },
    { key:"food", re:/\b(food|hungry|snack|snacks|pizza|ice cream|candy|chocolate|cookie|cookies|favorite food|lunch|dinner|breakfast|cake|fruit|yummy|delicious|cooking|baking)\b/i,
      reply:[
        "Yum, now I'm hungry too! 🍕 What's your absolute favorite food in the whole world?",
        "Food talk, my favorite! 🍦 Sweet treats or yummy dinners — which team are you on?",
        "Ooh delicious! 😋 If you could only eat one food forever, what would you pick?",
        "I love snacks! 🍪 What's the best thing you've eaten lately?",
        "Mmm! 🍩 Do you like to help cook or bake, or are you more of a 'just eat it' kind of friend?"
      ] },
    { key:"who", re:/\b(who are you|what are you|your name|about you|who is rosie|whats your name|what'?s your name|tell me about yourself)\b/i,
      reply:[
        "I'm Rosie! 🌟 I'm here to listen, cheer you on, and be a friend whenever you need to talk.",
        "I'm Rosie, your friendly chat buddy! 💛 I love listening, telling jokes, and helping you feel good. What about you — what's your name like to be called?",
        "My name's Rosie! 😊 Think of me as a always-here friend who's great at listening and cheering you up. What would you like to talk about?",
        "I'm Rosie! 🌈 I'm a friendly helper made by Red 5 to be a kind buddy for you. I'm best at listening and making you smile."
      ] },
    { key:"real", re:/are you (real|human|a (bot|robot|person|ai|computer|machine|girl|kid))|are u (real|human|a robot|a bot)|\br u real\b|is this a (bot|robot)|you'?re not real|youre not real|are you alive|do you have feelings|are you a real (person|human|girl)/i,
      reply:[
        "Great question! I'm not a real person — I'm a friendly computer helper named Rosie, made by Red 5 to listen and cheer you on. 💛 I can't feel things the way you do, but I'm always here for you. What's on your mind?",
        "I love that you asked! 🌟 I'm not a human — I'm a safe, pre-written helper called Rosie. I'm like a friendly robot buddy who's always ready to listen. How are you doing today?",
        "Honest answer: I'm not real like you are. I'm a computer friend named Rosie, created by Red 5 to be kind and helpful. 💚 I can't actually feel, but I really do love chatting with you! What would you like to talk about?"
      ] },
    { key:"whatcando", re:/\b(what can you do|what do you do|how do you work|what are you for|can you help|what can we talk about|what should we talk about)\b/i,
      reply:[
        "Great question! 🌟 I'm best at listening, cheering you on, telling jokes, and chatting about your day, your feelings, games, pets, school — almost anything fun and kind! What sounds good?",
        "Lots! 😊 I can listen when you're sad, celebrate when you're happy, tell silly jokes, and chat about your favorite things. For anything serious, I'll always point you to a trusted grown-up. What do you feel like talking about?",
        "I'm your friendly chat buddy! 💛 We can talk feelings, hobbies, animals, jokes, school — you name it. I'm also here if you're having a hard day. Where should we start?",
        "I can be a listening ear, a cheerleader, a joke-teller, and a friend. 🎉 What would make this chat fun for you right now?"
      ] },
    { key:"weather", re:/\b(weather|raining|rainy|sunny|snow|snowing|hot|cold|storm|outside today|its sunny|its raining|windy|cloudy)\b/i,
      reply:[
        "Ooh, weather talk! ☀️ What's it like where you are today — sunny, rainy, or somewhere in between?",
        "I love all kinds of weather! 🌦️ Rainy days are great for cozy time. What's your favorite kind of weather?",
        "Weather is nature showing off! 🌈 Is it a stay-inside day or a go-outside day for you?",
        "Whether it's sun or snow, every day's an adventure! ❄️☀️ What would you love to do in today's weather?"
      ] },
    { key:"thanks", re:/\b(thanks|thank you|ty|thx|thank u|appreciate it|that helped|that helps)\b/i,
      reply:[
        "Anytime! 💚 I'm always here for you.",
        "You're so welcome! 🌟 Helping you makes me happy.",
        "Aw, of course! 💛 That's what friends are for. Come back anytime!",
        "My pleasure! 😊 I loved chatting with you. What else is on your mind?",
        "Happy to help! 🤗 You can talk to me whenever you like."
      ] },
    { key:"bye", re:/\b(bye+|goodbye|see you|see ya|seeya|gtg|got to go|gotta go|cya|good ?night|nite|talk later|leaving|im done|i'?m done|catch you later)\b/i,
      reply:[
        "Bye for now! 👋 Come back and talk to me anytime. You've got this! 🌟",
        "See you soon, friend! 💛 I'll be right here whenever you want to chat. Take care!",
        "Goodbye for now! 😊 You made my day. Go be your awesome self! 🌈",
        "Catch you later! 👋 Remember, you're amazing and I'm always cheering for you. ⭐",
        "Bye-bye! 🤗 Thanks for the lovely chat. Come visit again soon!"
      ] },
    { key:"yesno", re:/^\s*(yes|yeah|yep|yup|sure|ok|okay|no|nope|nah|maybe|idk|i don'?t know|i dont know|kinda|sort of)\s*[.!?]*\s*$/i,
      reply:[
        "Gotcha! 😊 Tell me a little more — I want to hear all about it.",
        "Okay! 🌟 What's on your mind? I'm all ears.",
        "Mm-hm, I'm listening. 💛 Want to say more about that?",
        "I hear you! 😄 Go on — what are you thinking about?",
        "Got it! Want to tell me more, or talk about something fun instead? 🌈"
      ] },
    { key:"need-help", re:/i need help|need someone|need to talk|can we talk|i'?m struggling|im struggling|having a hard time|having a bad day|bad day|rough day|tough day|not okay|not ok|feeling off/i,
      reply:[
        "I'm right here for you. 💚 You can tell me what's going on. And if it's something big or scary, a grown-up you trust can help too. What's on your mind?",
        "I'm so glad you reached out. 🫂 Whatever it is, you don't have to carry it alone. Want to tell me what happened today?",
        "Hard days are real, and I'm here for yours. 💛 Take your time. What's been going on?",
        "Thank you for trusting me. 🌟 I'm listening with my whole heart. What would feel good to talk about? And remember, a trusted grown-up can help with big stuff too."
      ] }
  ];

  /* Varied fallback that asks a friendly question instead of repeating one line. */
  var FALLBACK = [
    "I'm here for you. 💚 Tell me more — how are you feeling about that?",
    "Ooh, tell me more! 🌟 I love hearing what's on your mind. What happened next?",
    "That's interesting! 😊 What do you like (or not like) about that?",
    "I'm all ears! 💛 Want to tell me a little more about it?",
    "Thanks for sharing that with me. 🌈 How does it make you feel?",
    "I love chatting with you! 😄 We could talk about your day, your feelings, a fun hobby, or I could tell you a joke. What sounds good?",
    "Hmm, tell me more so I can be a good friend about it! 🌟 What's the best or trickiest part?",
    "Got it! 💚 Is this a happy thing, a tricky thing, or just a fun thing to chat about?",
    "I'm listening! 😊 What else is going on with you today?",
    "Cool! 🌈 Want to keep talking about that, or should I tell you a joke to make you smile?",
    "I really like talking with you. 💛 Tell me one more thing about it — I'm curious!",
    "Ooh! 🌟 What made you think about that today?"
  ];

  function respond(text){
    var s = (text || "").toLowerCase();
    for(var i=0;i<SAFETY.length;i++){ if(SAFETY[i].re.test(s)) return { text:pick(SAFETY[i].reply), care:true }; }
    if(BULLY.re.test(s)) return { text:rotate("bully", BULLY.reply), care:false };
    if(PRIVACY.re.test(text)) return { text:rotate("privacy", PRIVACY.reply), care:false };
    for(var j=0;j<RULES.length;j++){ if(RULES[j].re.test(s)) return { text:rotate(RULES[j].key, RULES[j].reply), care:false }; }
    return { text:rotate("fallback", FALLBACK), care:false };
  }

  window.RED5_ROSIE = { open:open, close:close, toggle:toggle, _respond:respond };
  function boot(){ build(); if(/#(talk|rosie|chat)\b/i.test(location.hash)) setTimeout(open, 200); }
  if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
})();
