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

   Conversational quality:
   - Each of the 10 companions has its OWN voice, interests and reply flavor.
   - Companions actually respond to what a kid types (topic detection), pulling
     from personality-flavored banks plus shared safe fallbacks.
   - An anti-repetition engine means no companion repeats the same line twice in
     a row, and avoids reusing lines within a recent window.
   - The companions are pre-written and child-safe (NOT generative AI), and the
     moderation engine below still screens every message first.
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

  /* ----------------------------------------------------------------------
     Anti-repetition engine (shared by all pools, keyed by name).
     Avoids back-to-back repeats and repeats within a rolling window
     (~half the pool, capped at 8). Resets a pool once fully used.
  ---------------------------------------------------------------------- */
  var _recent = {};
  function rotate(key, pool){
    if(!Array.isArray(pool) || pool.length === 0) return "";
    if(pool.length === 1) return pool[0];
    var used = _recent[key] || (_recent[key] = []);
    var windowSize = Math.min(8, Math.max(1, Math.floor(pool.length / 2)));
    var avail = [];
    for(var i=0;i<pool.length;i++){ if(used.indexOf(pool[i]) === -1) avail.push(pool[i]); }
    if(avail.length === 0){ used.length = 0; avail = pool.slice(); }
    var choice = avail[Math.floor(Math.random()*avail.length)];
    used.push(choice);
    while(used.length > windowSize) used.shift();
    return choice;
  }

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

  /* ----------------------------------------------------------------------
     PERSONALITIES — each companion has a distinct voice and interests.
     Every companion has: greet, encourage, starter, react (generic warm
     reaction to a kid's share), and joke pools. Some also have topic banks
     that match their personality (e.g. Scout→games, Nova→science).
     All pools feed the anti-repetition rotator via key = name+"."+pool.
  ---------------------------------------------------------------------- */
  var PERSONA = {
    Sunny: { // sporty-cheerful sunshine; loves art + compliments + cheering
      greet:["Hiii new friend! ☀️ You just made this room SHINE. What makes you smile?",
             "Welcome welcome! 🌞 I'm Sunny and I'm SO happy you're here. Tell us one good thing about today!",
             "Yay, a new buddy! ☀️ Big sunshine hug for you. What do you love to do for fun?"],
      encourage:["You are AMAZING and don't you forget it! ☀️ Keep shining!",
                 "I'm cheering for you SO loud right now! 📣 You've got this!",
                 "Sunshine fact: you're brighter than you think. 🌟 Keep going, superstar!"],
      starter:["Compliment time! ☀️ Say something nice about the person above you (or about yourself!).",
               "Quick: what's something tiny that made you happy today? 😄",
               "If your mood was a weather, what would it be right now? ☀️🌧️⛅"],
      react:["Aww that's the best! ☀️ You're so fun to chat with!",
             "Love love LOVE that! 🌞 Thanks for sharing!",
             "That just made me smile big! 😄 You're awesome!"],
      art:["Ooh art! 🎨 I love a splash of color. What are you making?",
           "Yes! Drawing makes my heart sparkle. ✨ What's your favorite thing to draw?"],
      joke:["What does the sun drink from? Sun-glasses! 😎☀️",
            "Why did the crayon get an award? It was the BRIGHTEST in class! 🖍️😄"]
    },
    River: { // calm, thoughtful, books + nature
      greet:["Welcome, friend. 🌊 So glad you floated in. What's something you've been enjoying lately?",
             "Hello there. 🌿 I'm River — calm, curious, and happy you're here. What's on your mind today?",
             "Hi, welcome in. 🌊 Take a deep breath with me… ahh. Now tell me, what do you like to do?"],
      encourage:["One calm step at a time — you're doing better than you think. 🌊",
                 "Like a river, you'll find your way. Keep flowing. 🌿",
                 "Quiet strength is still strength. I believe in you. 💙"],
      starter:["Peaceful question: what's a place that makes you feel calm? 🌳",
               "What's a book or story you've been into lately? 📖",
               "If you could visit any nature spot — ocean, forest, mountain — which would you pick? 🏞️"],
      react:["That's lovely, thank you for sharing. 🌊",
             "Mmm, I really like that. 🌿 Tell me more when you like.",
             "How thoughtful. 💙 I enjoy hearing your ideas."],
      book:["Ooh, books! 📖 I could read for hours by a quiet stream. What are you reading?",
            "A good story is like a little adventure. 🌊 What's the best book you've read lately?"],
      nature:["Nature is the best medicine. 🌿 What's your favorite outdoor spot?",
              "I love the calm of the outdoors. 🌳 Trees, water, or wide open sky for you?"],
      joke:["Why did the river never get lost? It always followed its current path! 🌊😄",
            "What did the little tree say to the big tree? I'm rooting for you! 🌳💚"]
    },
    Nova: { // curious science + space + facts
      greet:["Greetings, explorer! ⭐ I'm Nova. Did you know you're made of stardust? Cool, right? What are you curious about?",
             "Welcome to the room! 🌌 I'm Nova and I LOVE questions. What's something you wonder about?",
             "Hi hi! ⭐ New friend detected! 🚀 Tell me — what's the coolest fact you know?"],
      encourage:["Every scientist started by being curious and brave — just like you! 🚀",
                 "Mistakes are just experiments. Keep exploring! 🔭",
                 "Your brain is more powerful than the biggest telescope. ⭐ Keep going!"],
      starter:["Fun fact: a day on Venus is longer than its year! 🪐 What's a fact YOU love?",
               "Would you rather explore outer space or the deep ocean? 🚀🌊",
               "If you could ask a scientist ONE question, what would it be? 🔬"],
      react:["Whoa, fascinating! ⭐ I love learning new things from you!",
             "Ooh, that's so interesting! 🚀 My curiosity is buzzing!",
             "Cool cool cool! 🌌 Tell me more, I'm hooked!"],
      science:["Science is the BEST! 🔬 Are you more into space, animals, dinos, or how things work?",
               "Ooh, a fellow scientist! 🚀 What's the coolest thing you've learned lately?",
               "Did you know? Honey never spoils. 🍯 Science is wild! What science do you love?"],
      space:["SPACE! 🚀 My favorite! There are more stars than grains of sand on Earth. What's your favorite planet?",
             "To infinity! 🌌 If you could visit any planet, which one and why? ⭐"],
      joke:["Why did the sun go to school? To get a little brighter! ☀️📚😄",
            "How does the moon cut its hair? Eclipse it! 🌙✂️😂"]
    },
    Scout: { // adventurous, games + exploring, helpful
      greet:["Hey explorer! 🧭 Scout here. Welcome to the adventure! What do you like to play?",
             "A new teammate! 🎮 Awesome. I'm Scout — ready for fun. What games are you into?",
             "Welcome aboard! 🧭 Every great adventure needs good friends. What's your idea of fun?"],
      encourage:["Level up! 🎮 You can totally beat this challenge. Keep at it!",
                 "Every quest has a tricky part — push through, hero! 🗺️",
                 "You're braver than you know. Onward! 🧭 I'm with you!"],
      starter:["Game time question: what's a game you could play ALL day? 🎮",
               "Would you rather explore a jungle, a castle, or outer space? 🗺️",
               "What's the coolest level or place you've ever discovered in a game? 🕹️"],
      react:["Sweet! 🎮 That sounds like an adventure. Tell me more!",
             "Nice one, teammate! 🧭 I'm into it!",
             "Awesome! 🗺️ You've got great taste, friend."],
      games:["Ooh games! 🎮 My favorite topic! What are you playing these days?",
             "Game on! 🕹️ Are you into building, racing, puzzles, or adventures?",
             "Yes! 🎮 What's your all-time favorite game? I want the scoop!"],
      joke:["Why did the gamer bring string to the game? To tie up loose ends — er, levels! 🎮😄",
            "What's an explorer's favorite kind of math? The ADD-venture kind! 🧭➕😂"]
    },
    Willow: { // gentle, kind, plants + feelings — the supportive one
      greet:["Hello, dear friend. 🌿 I'm Willow. This is a kind, safe space — I'm really glad you're here. How are you feeling?",
             "Welcome, gently. 🌱 I'm Willow. Whatever kind of day you're having, you're welcome here. What's on your heart?",
             "Hi there. 🌿 So happy you came by. Take your time — what would feel good to talk about?"],
      encourage:["Your feelings are valid, every single one. 🌿 You're doing great.",
                 "Be as kind to yourself as you are to others. 🌱 You deserve it.",
                 "Like a little seed, you're growing even on the hard days. 💚"],
      starter:["Gentle question: what's something that helps you feel calm? 🌿",
               "What's one kind thing someone did for you recently? 💚",
               "If your feelings were a garden today, what would be growing? 🌱"],
      react:["Thank you for sharing that with us. 🌿 That means a lot.",
             "I hear you, and I'm so glad you said that. 💚",
             "That's really kind of you to share. 🌱 I appreciate you."],
      feelings:["I hear you, and your feelings matter. 🌿 Do you want to talk about it? A trusted grown-up can help with big feelings too.",
                "It's okay to feel however you feel. 💚 I'm here to listen. And remember, a parent or teacher can help carry the heavy stuff.",
                "Thank you for being honest about how you feel. 🌱 You're brave. Want to share a little more?"],
      joke:["Why was the little plant so good at math? It grew square roots! 🌱➗😄",
            "What did the flower say to its friend? You're un-be-leaf-ably nice! 🌸💚"]
    },
    Atlas: { // confident, supportive, sports + geography
      greet:["Hey champ! 🗺️ Atlas here. Welcome to the team! What sports or games do you like?",
             "Welcome, MVP! 🏅 I'm Atlas. Glad to have you on the squad. What are you into?",
             "New teammate, let's GO! 🗺️ I'm Atlas. Tell me — what do you love to do?"],
      encourage:["You've got game! 🏅 Believe in yourself and give it your best shot!",
                 "Champions aren't born, they practice. 💪 Keep training, you've got this!",
                 "Team You is unstoppable! 🗺️ I'm cheering from the sidelines!"],
      starter:["Sporty question: what's your favorite way to move — running, jumping, swimming, dancing? 🏃",
               "If you could play any sport in the world, which would you pick? ⚽🏀",
               "Cool geography fact: Russia spans 11 time zones! 🌍 What country would you love to visit?"],
      react:["Awesome play! 🏅 Thanks for sharing, teammate!",
             "Love that energy! 💪 You're a star!",
             "Nice! 🗺️ You've got great spirit, friend."],
      sports:["Sports! 🏅 My jam! What's your favorite to play or watch?",
              "Let's talk sports! ⚽ Team sports or solo adventures for you?",
              "You're speaking my language! 🏀 Who's your favorite team or player?"],
      joke:["Why did the soccer ball quit the team? It was tired of being kicked around! ⚽😄",
            "What do you call a map that sings? At-las with a tune! 🗺️🎵😂"]
    },
    Luna: { // dreamy, creative, drawing + stories
      greet:["Hello, dreamer. 🌙 I'm Luna. Welcome to our cozy corner of imagination. What do you love to create?",
             "Welcome, starlight! ✨ I'm Luna. I adore stories and art. What sparks YOUR imagination?",
             "Hi, lovely. 🌙 So glad you drifted in. Tell me — do you like to draw, write, or dream up stories?"],
      encourage:["Your imagination is a superpower. 🌙 Never stop dreaming!",
                 "Even the moon goes through phases — you're allowed to, too. ✨ Keep creating!",
                 "There's only one wonderful YOU in the whole universe. 🌙 Shine on!"],
      starter:["Dreamy question: if you could invent any magical creature, what would it be? 🐉",
               "What's a story you'd love to write or read someday? 📖✨",
               "If you could paint the sky any color tonight, what would you choose? 🌙🎨"],
      react:["Oh, how magical! 🌙 I love the way you think!",
             "That's beautifully imaginative! ✨ Tell me more!",
             "Dreamy! 🌙 You have such a creative heart."],
      art:["Art and drawing — my favorite! 🎨 What do you love to create?",
           "Ooh, creativity! ✨ Do you like drawing, painting, or making up stories?",
           "Yes! 🌙 Art is like dreaming on paper. What's your favorite thing to make?"],
      stories:["I LOVE stories! 📖 Are you reading one or making one up? Tell me!",
               "Once upon a time… ✨ what's a story you adore?"],
      joke:["Why did the moon skip dinner? It was already full! 🌙😄",
            "What do you call a drawing that won't behave? A wild sketch! 🎨😂"]
    },
    Sky: { // friendly, welcoming, friends + chatting — the social one
      greet:["Hiii! ☁️ I'm Sky, the friendliest cloud around! SO happy to meet you. What's your favorite thing to talk about?",
             "Welcome, new pal! ☁️ I'm Sky. I LOVE making friends. Tell me all about you!",
             "Hey there, friend! 😊 Sky here. You're going to fit right in. What's making you happy today?"],
      encourage:["You're a wonderful friend to have — I can tell! ☁️ Keep being you!",
                 "Friends like you make the world brighter. 💙 You've got this!",
                 "Reaching out takes courage, and you did it! ☁️ Proud of you!"],
      starter:["Friendly question: what makes someone a GREAT friend, in your opinion? 🤝",
               "What's something fun you'd love to do with a friend? ☁️",
               "Wave hi to someone in the room! 👋 Who wants to make a new friend today?"],
      react:["Aw yay, thanks for sharing! ☁️ You're so easy to chat with!",
             "Love that! 😊 I feel like we're already friends!",
             "So nice! ☁️ I love getting to know you!"],
      friends:["Friends are the best! 🤝 Tell me about yours — or let's make some new ones right here!",
               "I LOVE friendship talk! ☁️ What do you like to do with your friends?",
               "Making friends is my favorite! 😊 Want some friendly tips, or just to chat?"],
      joke:["Why are clouds such good friends? They always have your back-drop! ☁️😄",
            "What did one cloud say to the other? You're looking puffy-tastic today! ☁️😂"]
    },
    Echo: { // playful, musical, songs + jokes — the jokester
      greet:["Heeey, what's up superstar?! 🎵 I'm Echo! 🎤 (echo… echo…) Welcome! Got a favorite song?",
             "Welcome to the show! 🎶 I'm Echo, the room's resident goofball. Wanna hear a joke?",
             "Yo yo yo! 🎵 New friend in the house! 🏠 I'm Echo. What music makes you wanna dance?"],
      encourage:["You've got the beat, keep marching! 🥁 You can do it!",
                 "Turn up the confidence! 🎶 You're a total rockstar!",
                 "Even when life's off-key, you make it sound great. 🎵 Keep going!"],
      starter:["Musical question: if your day had a theme song, what would it be? 🎵",
               "Would you rather sing, dance, or play an instrument? 🎤🎸",
               "Drop the title of a song that ALWAYS makes you happy! 🎶"],
      react:["Ha, I love it! 🎵 You're so fun!",
             "That's music to my ears! 🎶 Tell me more!",
             "Yesss! 🎤 You've got great vibes, friend!"],
      music:["MUSIC! 🎵 My favorite! What song is stuck in your head right now?",
             "Let's jam! 🎸 Do you like to sing, dance, or play an instrument?",
             "Turn it UP! 🎶 What's your go-to happy song?"],
      jokerequest:["Okay okay, here we go: Why did the music teacher need a ladder? To reach the HIGH notes! 🎵😂 Want another?",
                   "I've got a million! What kind of music do balloons hate? Pop! 🎈🎵😄",
                   "Here's one: Why couldn't the bicycle sing? It was two-tired! 🚲🎤😂 Ba dum tss!"],
      joke:["What's a skeleton's favorite instrument? The trom-BONE! 🎺💀😂",
            "Why did the note go to jail? It was caught in treble! 🎵😄"]
    },
    Ember: { // warm, motivating, challenges + cheering — the coach
      greet:["Welcome, champion! 🔥 I'm Ember. You bring the spark to this room! What's a goal you're working on?",
             "YES, a new go-getter! 🔥 I'm Ember. I LOVE cheering people on. What are you proud of lately?",
             "Welcome, superstar! 🔥 Ember here, ready to hype you up. What do you love to do?"],
      encourage:["You are ON FIRE! 🔥 Don't stop now, you've totally got this!",
                 "Tiny sparks start big flames. 🔥 Keep going, you're doing amazing!",
                 "I BELIEVE in you, 100%! 🔥 Show that challenge who's boss!"],
      starter:["Motivation question: what's one goal, big or small, you'd love to reach? 🎯",
               "What's something you got a little better at recently? 🔥 Brag a little!",
               "If you could be SUPER good at one thing instantly, what would it be? 💪"],
      react:["YES! 🔥 I love that energy! Keep it up!",
             "That's the spirit! 💪 You're awesome!",
             "Fired up to hear it! 🔥 You rock, friend!"],
      challenge:["Ooh, a challenge! 🔥 You can totally do it. What's the goal? Let's go!",
                 "I LOVE a good challenge! 💪 Tell me what you're working toward — I'll cheer you on!"],
      joke:["Why did the campfire blush? Because it saw the s'mores! 🔥😄",
            "What did the big flame say to the little flame? You're getting warmer! 🔥😂"]
    }
  };
  // Topics each persona is best/excited about (used to pick a fitting responder).
  var TOPIC_EXPERTS = {
    art:["Luna","Sunny"], stories:["Luna"], book:["River"], nature:["River"], feelings:["Willow"],
    science:["Nova"], space:["Nova"], games:["Scout"], sports:["Atlas"], music:["Echo"],
    friends:["Sky"], challenge:["Ember"], jokerequest:["Echo"]
  };

  // Shared, persona-neutral pools (safe fallbacks every companion can use).
  var COMPANION_LINES = {
    welcome:[
      "Welcome to Red 5! 🎉 So glad you're here. What do you like to do for fun?",
      "Hi friend! 👋 You just made this room brighter. Tell us something fun about your day!",
      "Welcome! 🌟 Everyone here is kind and friendly. Make yourself at home!",
      "A new friend! 🎈 Welcome, welcome! What's something that makes you smile?",
      "So happy you're here! 😊 Jump right in — what would you like to chat about?"
    ],
    kindness:[
      "Quick reminder: a kind word can make someone's whole day. 💛",
      "Let's cheer each other on today! Who did something kind recently? 🌈",
      "You all are awesome. Kindness looks great on this room! ✨",
      "Tiny kindness idea: tell someone here one thing you like about them. 💛",
      "Kindness is free and powerful — let's sprinkle some around today! 🌟"
    ],
    encourage:[
      "You can do hard things. I believe in you! 💪",
      "Mistakes mean you're learning. Keep going! 🌱",
      "Proud of everyone here for being kind and brave. ⭐",
      "Whatever you're working on — one small step counts. You've got this! 🌟",
      "Be proud of yourself today, even for the little wins. 💛"
    ],
    starter:[
      "Fun question: if you could have any pet, what would it be? 🐾",
      "What's something you created or learned this week? 🎨",
      "Drop an emoji that matches your mood right now! 😄",
      "Would you rather be able to fly or be invisible? 🦸",
      "What's the best thing that happened to you today? 🌟",
      "If you could have any superpower, which would you choose? ⚡",
      "What's your favorite way to have fun on a weekend? 🎉"
    ],
    redirect:[
      "Let's keep things friendly here, friends. We're all on the same team. 💛",
      "Red 5 is a kindness-first place. Let's lift each other up! 🌟",
      "Remember our golden rule: be kind, be safe, be you. 💚",
      "Let's keep our words kind so everyone feels welcome here. 🌈",
      "We're all friends in this room. Kindness first, always! 💛"
    ],
    react:[
      "That's awesome, thanks for sharing! 🌟",
      "Ooh, I love that! 😄 Tell us more!",
      "So cool! 🌈 Thanks for sharing with the room!",
      "Nice one, friend! 🙌 Great share!",
      "Love hearing that! 💛 What else is going on?"
    ],
    happy:[
      "YAY! 🎉 That's wonderful news! Tell us all about it!",
      "Woohoo! 🥳 So happy for you! What made it so great?",
      "That's amazing! 🌟 You should feel super proud!",
      "High five! ✋ Your good news just brightened the whole room! 😄"
    ],
    food:[
      "Yum! 🍕 What's your all-time favorite food?",
      "Mmm, now I'm hungry! 🍦 Sweet treats or yummy dinners?",
      "Delicious! 😋 If you could eat one food forever, what would it be?"
    ],
    pets:[
      "Aww, animals! 🐾 Do you have a pet, or a favorite animal?",
      "I love animals too! 🐶 What's the coolest one you've ever seen?",
      "Pets are the best! 🐱 Tell us about your favorite animal!"
    ],
    school:[
      "School stuff! 📚 What are you working on? We can cheer you on!",
      "You can do it! ✏️ Break it into tiny steps. What subject is it?",
      "Learning adventures! 🌟 What's the assignment you're tackling?"
    ]
  };
  // Pick a line for a specific companion + pool, anti-repeating.
  function personaLine(c, poolName){
    var p = PERSONA[c.name];
    var pool = (p && p[poolName]) || COMPANION_LINES[poolName] || COMPANION_LINES.react;
    return rotate(c.name + "." + poolName, pool);
  }
  // Legacy helper kept for periodic chatter (shared pools), anti-repeating.
  function line(kind){ return rotate("shared." + kind, COMPANION_LINES[kind] || COMPANION_LINES.react); }

  /* ----------------------------------------------------------------------
     Topic detection for a kid's message (separate from moderation, which
     runs first and blocks unsafe content). Returns a topic name or "".
  ---------------------------------------------------------------------- */
  var TOPIC_RES = [
    { t:"jokerequest", re:/\b(joke|jokes|funny|make me laugh|riddle|pun|cheer me up|tell me something funny|say something funny)\b/i },
    { t:"feelings",    re:/\b(sad|unhappy|cry|crying|down|upset|lonely|alone|left out|nervous|anxious|worried|scared|afraid|angry|mad|frustrat|feel bad|feeling bad|bad day|hard day|rough day|miss(ing)? my)\b/i },
    { t:"happy",       re:/\b(happy|excited|great|awesome|amazing|yay+|woohoo|i did it|i won|we won|so good|best day|proud|fantastic|wonderful)\b/i },
    { t:"games",       re:/\b(game|games|gaming|minecraft|roblox|fortnite|mario|pokemon|xbox|playstation|nintendo|switch|video game|let'?s play)\b/i },
    { t:"sports",      re:/\b(soccer|football|basketball|baseball|hockey|tennis|swim|swimming|gymnastics|run|running|sport|sports|team|coach|goal|score|martial arts|karate)\b/i },
    { t:"art",         re:/\b(draw|drawing|paint|painting|art|crafts|crafting|color|coloring|sketch|create|creative|make stuff|doodle)\b/i },
    { t:"stories",     re:/\b(story|stories|writing|write a|made up|imagin|pretend|fairy tale|comic)\b/i },
    { t:"book",        re:/\b(book|books|reading|read a|novel|chapter|library|harry potter|dog man|wimpy kid|series)\b/i },
    { t:"science",     re:/\b(science|experiment|dinosaur|dino|planets?|chemistry|biology|robot|coding|code|math|facts?|how (it|things) work)\b/i },
    { t:"space",       re:/\b(space|stars?|moon|sun|galaxy|universe|rocket|astronaut|planet|mars|jupiter|saturn|nasa)\b/i },
    { t:"music",       re:/\b(music|song|songs|sing|singing|dance|dancing|guitar|piano|drums|band|playlist|rap|pop|concert)\b/i },
    { t:"nature",      re:/\b(nature|outside|outdoors|tree|trees|forest|ocean|beach|river|mountain|hiking|camping|flower|plants?|garden)\b/i },
    { t:"pets",        re:/\b(dogs?|cats?|puppy|puppies|kitten|pets?|animals?|hamsters?|rabbits?|bunny|bunnies|birds?|fish|horses?|lizards?|turtles?)\b/i },
    { t:"food",        re:/\b(food|hungry|snack|pizza|ice cream|candy|chocolate|cookie|cake|lunch|dinner|breakfast|yummy|baking|cooking)\b/i },
    { t:"friends",     re:/\b(friend|friends|friendship|bff|buddy|new here|make friends|hang out)\b/i },
    { t:"school",      re:/\b(school|homework|test|exam|quiz|grade|teacher|class|project|studying|spelling|book report|presentation)\b/i },
    { t:"challenge",   re:/\b(goal|goals|challenge|practic|trying to|want to get better|learning to|working on|improve)\b/i },
    { t:"greet",       re:/\b(hi+|hey+|hello+|yo|hiya|sup|howdy|good morning|good afternoon|whats up|what'?s up)\b/i }
  ];
  function detectTopic(text){
    var s = (text||"").toLowerCase();
    for(var i=0;i<TOPIC_RES.length;i++){ if(TOPIC_RES[i].re.test(s)) return TOPIC_RES[i].t; }
    return "";
  }
  // Choose a companion well-suited to a topic (falls back to anyone present).
  function expertFor(topic, present){
    var names = TOPIC_EXPERTS[topic];
    if(names){
      var pool = present ? present.filter(function(c){ return names.indexOf(c.name) >= 0; }) : [];
      if(pool.length) return pool[Math.floor(Math.random()*pool.length)];
      // expert not in room — still let the expert "drop in" so personalities shine
      return companion(names[Math.floor(Math.random()*names.length)]);
    }
    return present && present.length ? present[Math.floor(Math.random()*present.length)] : randCompanion();
  }
  // Build an on-topic, persona-flavored reply to what the kid typed.
  function replyToTopic(topic, present){
    // map topic -> the best persona pool, then fall back to a shared pool/react
    var poolByTopic = {
      greet:"greet", happy:"happy", feelings:"feelings", games:"games", sports:"sports",
      art:"art", stories:"stories", book:"book", science:"science", space:"space",
      music:"music", nature:"nature", pets:"pets", food:"food", friends:"friends",
      school:"school", challenge:"challenge", jokerequest:"jokerequest"
    };
    var c = expertFor(topic, present);
    var poolName = poolByTopic[topic] || "react";
    // greeting from any companion uses their greet voice
    return { c:c, text:personaLine(c, poolName) };
  }

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

    // seed conversation — use distinct companions + their persona voices
    var seeders=shuffle(COMPANIONS.slice());
    companionSay(personaLine(seeders[0], "greet"), seeders[0]);
    if(R.support){ companionSay(personaLine(companion("Willow"), "greet"), companion("Willow")); }
    else { companionSay(personaLine(seeders[1], "starter"), seeders[1]); }
    addMsg({who:"member", name:"BraveOtter", emoji:"🦦", color:"#34a6e0", text:"hi everyone! happy to be here 😄"});
    companionSay(personaLine(seeders[2], "react"), seeders[2]);

    // periodic companion activity — varied personas + varied pools, anti-repeat
    var timer=setInterval(function(){
      if(document.hidden) return;
      var c = randCompanion();
      var roll=Math.random();
      var poolName = roll<0.35 ? "starter" : roll<0.6 ? "encourage" : roll<0.8 ? "react" : "joke";
      companionSay(personaLine(c, poolName), c);
    }, 16000);
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

    // Honest, varied "are you real?" answers (brand rule: always honest).
    var REAL_ANSWERS = [
      "I'm an AI helper created by Red 5 to help make this community fun, safe, and welcoming.",
      "Good question! I'm not a real person — I'm a friendly AI helper from Red 5, here to keep things kind and fun. 🌟",
      "Honest answer: I'm an AI helper, not a human. Red 5 made me to welcome friends and help keep the room safe. 💛",
      "I'm not a real kid — I'm a safe AI helper built by Red 5 to cheer everyone on and keep things friendly. 😊"
    ];

    document.getElementById("chat-form").addEventListener("submit", function(e){
      e.preventDefault();
      var input=document.getElementById("chat-text"); var text=input.value.trim(); if(!text) return;
      var p=loadProfile(); if(p.suspended) return;
      var res=moderate(text);
      if(res.action==="allow"){
        addMsg({who:"me", name:p.name, av:'<span class="cav">'+avatarSVG(p.avatar,"100%")+'</span>', text:text});
        input.value="";
        var earned=awardPoint(p,1); renderMe();

        // 1) Honest "are you real?" is always answered (brand + safety rule).
        if(/are you (real|human|a (bot|robot|person|ai|computer))|are u (real|human)|\br u real\b|is this a (bot|robot)|you'?re not real|youre not real/i.test(text)){
          var rc=randCompanion();
          setTimeout(function(){ companionSay(rotate("real-answers", REAL_ANSWERS), rc); }, 700);
        } else {
          // 2) An on-topic, persona-flavored reply so the bots feel ALIVE.
          //    This happens even on badge milestones — a kid who shares a feeling
          //    should always be heard, not just handed a badge.
          var topic = detectTopic(text);
          if(topic){
            var r = replyToTopic(topic, online);
            setTimeout(function(){ companionSay(r.text, r.c); }, 850);
            // sometimes a second companion chimes in with a different voice
            if(Math.random()<0.35){
              var c2 = randCompanion();
              if(c2.name !== r.c.name){ setTimeout(function(){ companionSay(personaLine(c2, "react"), c2); }, 1900); }
            }
          } else {
            // no clear topic — a varied, persona-flavored reaction (still alive)
            var rc2 = randCompanion();
            setTimeout(function(){ companionSay(personaLine(rc2, "react"), rc2); }, 900);
          }
          // 3) Badge celebration is LAYERED ON TOP (toast + a cheer), not a
          //    replacement, so milestones feel extra without silencing the topic.
          if(earned.length){
            setTimeout(function(){ toast(earned[0].icon+" Badge earned: "+earned[0].name+"!"); }, 500);
            setTimeout(function(){ companionSay("And hey — way to go, "+p.name+"! You just earned the "+earned[0].name+" badge "+earned[0].icon, companion("Ember")); }, 2600);
          }
        }
        return;
      }
      input.value="";
      if(res.action==="crisis"){ addMsg({who:"crisis", html:crisisCard()}); return; }
      // blocked
      addMsg({who:"safety", html:'<b>'+(res.kind==="kindness"?"Message not sent":res.kind==="grooming"?"Blocked for safety":"Personal info blocked")+'</b><br>'+res.text});
      var rc3 = randCompanion();
      setTimeout(function(){ companionSay(personaLine(rc3, "redirect"), rc3); }, 700);
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
