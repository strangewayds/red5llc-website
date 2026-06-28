/* ===== Story Creator — landing page logic =====
   - Curated, kid-safe "Story Idea Starter" (NOT real AI)
   - "My Library" bookshelf from localStorage (saved stories)
   Shared helpers are exposed on window.SC for the writing studio too. */
(function () {
  "use strict";

  var LIB_KEY = "red5_stories_v1";

  /* ---------- Curated, kid-safe story-idea bank by genre ---------- */
  var IDEAS = [
    { genre:"adventure", title:"The Map in the Attic",
      who:"A curious kid and their best friend.",
      problem:"They find an old treasure map hidden inside a dusty book.",
      end:"The 'treasure' turns out to be something even better than gold." },
    { genre:"fantasy", title:"The Last Dragon Egg",
      who:"A brave young villager.",
      problem:"They must protect the very last dragon egg from a long winter.",
      end:"When it hatches, the whole kingdom learns dragons can be friends." },
    { genre:"mystery", title:"The Case of the Missing Mascot",
      who:"A clever kid detective and a notebook.",
      problem:"The school mascot costume has vanished right before the big game.",
      end:"The clues lead somewhere nobody expected — and everyone laughs." },
    { genre:"scifi", title:"Message From Planet Echo",
      who:"A young inventor with a homemade radio.",
      problem:"A friendly signal arrives from a faraway planet asking for help.",
      end:"They build a clever machine and make a friend across the stars." },
    { genre:"animals", title:"The Fox Who Couldn't Sleep",
      who:"A kind little fox in the forest.",
      problem:"The fox can't sleep and wakes up all the other animals.",
      end:"Teamwork (and a bedtime song) helps the whole forest rest." },
    { genre:"school", title:"The New Kid's Big Idea",
      who:"A shy new student.",
      problem:"They have a brilliant idea for the science fair but feel too nervous to share it.",
      end:"With one brave step, their idea wins over the whole class." },
    { genre:"friendship", title:"Two Best Friends, One Last Summer",
      who:"Two friends who do everything together.",
      problem:"One friend is moving away at the end of summer.",
      end:"They make a plan to stay best friends, no matter how far apart." },
    { genre:"sports", title:"The Underdog Team",
      who:"The smallest, newest player on the team.",
      problem:"Their team has never won a single game — until now.",
      end:"Practice, heart, and teamwork lead to one unforgettable goal." },
    { genre:"magic", title:"The Wishing Pencil",
      who:"A daydreaming young artist.",
      problem:"Anything they draw with a strange new pencil comes to life!",
      end:"They learn that the best magic is using their gift to help others." },
    { genre:"space", title:"Lost on the Candy Moon",
      who:"A young astronaut and a robot buddy.",
      problem:"Their spaceship lands on a moon made entirely of candy.",
      end:"They fix the ship with teamwork and zoom home with sweet stories." },
    { genre:"dinosaurs", title:"My Pet Dinosaur",
      who:"A kid who finds a tiny dinosaur egg.",
      problem:"The dinosaur keeps growing... and growing... and GROWING.",
      end:"They find the perfect home where their giant friend can be happy." },
    { genre:"dragons", title:"The Dragon Who Was Afraid of Fire",
      who:"A young dragon named Ember.",
      problem:"Ember is the only dragon who can't breathe fire, and feels left out.",
      end:"Ember discovers a special talent nobody else has." },
    { genre:"robots", title:"The Robot Who Wanted a Name",
      who:"A helpful little robot called Unit-7.",
      problem:"Unit-7 wants a real name and a real friend.",
      end:"A kind kid gives the robot both — and a whole new adventure begins." },
    { genre:"ocean", title:"The Secret of the Coral Castle",
      who:"A young diver and a clever dolphin.",
      problem:"They discover a hidden castle deep under the waves.",
      end:"Inside is a map to protect the reef and all its colorful creatures." },
    { genre:"time", title:"The Time-Travel Backpack",
      who:"A curious kid and a strange old backpack.",
      problem:"Every time they zip it up, they jump to a different year!",
      end:"They learn a little history — and how to get safely back home." },
    { genre:"comedy", title:"The Day Everything Went Backwards",
      who:"An ordinary kid having a very strange morning.",
      problem:"Breakfast is at night, shoes go on hands, and the dog talks!",
      end:"By bedtime, things flip back — but what a hilarious day it was." }
  ];

  /* "What happens next?" kid-safe coaching prompts (used by the writer too) */
  var NEXT_PROMPTS = [
    "What if your character finds a hidden map or a secret door?",
    "How does your hero solve the problem? What do they try first?",
    "A surprising new friend shows up — who are they?",
    "Something funny goes wrong. What is it?",
    "Your character feels nervous. How do they find their courage?",
    "Add a twist! Something nobody expected just happened.",
    "What does your character really want more than anything?",
    "Time for teamwork — who helps, and how?",
    "Describe what your hero sees, hears, and smells right now.",
    "What is the biggest, most exciting moment of your story?",
    "Your character makes a mistake. How do they make it right?",
    "End the chapter on a question that makes the reader want more!"
  ];

  /* Encouraging, kid-safe feedback (used by the writer too) */
  var CHEERS = [
    "You're doing great — every author starts with one sentence!",
    "Nice work! Your story is really taking shape.",
    "Wow, look at all those words. Keep going!",
    "Great imagination! Readers are going to love this.",
    "You're on a roll — proud of you, author!",
    "That's a brilliant idea. Trust yourself and keep writing.",
    "Real writers rewrite. You can always make it even better!",
    "Take a breath, picture the scene, then write what you see."
  ];

  /* Genre-specific opening outlines the writer can drop in */
  function ideaByGenre(genre) {
    var pool = IDEAS.filter(function (i) { return i.genre === genre; });
    if (!pool.length) pool = IDEAS;
    return pool[Math.floor(Math.random() * pool.length)];
  }

  function formatIdea(idea) {
    return '<b>' + idea.title + '</b><br>' +
      '<b>Who:</b> ' + idea.who + '<br>' +
      '<b>The problem:</b> ' + idea.problem + '<br>' +
      '<b>How it might end:</b> ' + idea.end;
  }

  /* Cover palettes shared with the writer / library renderer */
  var COVERS = {
    purple:"linear-gradient(155deg,#6c5ce7,#3a2c9c)",
    blue:"linear-gradient(155deg,#2ba8e0,#1565c0)",
    pink:"linear-gradient(155deg,#ff7eb3,#ff5d9e)",
    sunset:"linear-gradient(155deg,#ff8a3d,#ff5d6c)",
    forest:"linear-gradient(155deg,#7bc043,#2f7d4f)",
    ocean:"linear-gradient(155deg,#26c6da,#1565c0)",
    night:"linear-gradient(155deg,#3a4a7a,#120a3a)",
    gold:"linear-gradient(155deg,#ffc53d,#ff8a3d)"
  };

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (m) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m];
    });
  }

  function loadLibrary() {
    try { return JSON.parse(localStorage.getItem(LIB_KEY) || "[]"); }
    catch (e) { return []; }
  }

  /* Expose for the writing studio */
  window.SC = {
    LIB_KEY: LIB_KEY,
    ideas: IDEAS,
    next: NEXT_PROMPTS,
    cheers: CHEERS,
    covers: COVERS,
    ideaByGenre: ideaByGenre,
    formatIdea: formatIdea,
    loadLibrary: loadLibrary,
    escapeHtml: escapeHtml
  };

  /* ---------- Idea Starter button (landing only) ---------- */
  var ideaBtn = document.getElementById("scIdeaBtn");
  var ideaOut = document.getElementById("scIdeaOut");
  var lastIdx = -1;
  if (ideaBtn && ideaOut) {
    ideaBtn.addEventListener("click", function () {
      var i;
      do { i = Math.floor(Math.random() * IDEAS.length); }
      while (i === lastIdx && IDEAS.length > 1);
      lastIdx = i;
      ideaOut.innerHTML = formatIdea(IDEAS[i]);
      ideaBtn.textContent = "✨ Another idea!";
    });
  }

  /* ---------- My Library bookshelf (landing only) ---------- */
  function wordCount(story) {
    var total = 0;
    (story.chapters || []).forEach(function (ch) {
      var t = (ch.text || "").trim();
      if (t) total += t.split(/\s+/).length;
    });
    return total;
  }
  function fmtNum(n) { return n.toLocaleString(); }

  var grid = document.getElementById("scLibGrid");
  if (grid) {
    var stories = loadLibrary().sort(function (a, b) { return (b.updated || 0) - (a.updated || 0); });
    if (stories.length) {
      grid.innerHTML = "";
      stories.forEach(function (s) {
        var words = wordCount(s);
        var goal = s.goal || 1000;
        var pct = Math.min(100, Math.round((words / goal) * 100));
        var bg = (s.cover && COVERS[s.cover.color]) || COVERS.purple;
        var mark = (s.cover && s.cover.mark) || "📖";
        var title = (s.cover && s.cover.title) || s.title || "Untitled Story";
        var author = (s.cover && s.cover.author) || s.author || "";

        var a = document.createElement("a");
        a.className = "sc-book";
        a.href = "story-writer.html?id=" + encodeURIComponent(s.id);
        a.innerHTML =
          '<div class="sc-book-cover" style="background:' + bg + '">' +
            '<div class="ct">' + escapeHtml(title) + '</div>' +
            '<div class="cmark">' + mark + '</div>' +
            (author ? '<div class="ca">by ' + escapeHtml(author) + '</div>' : '<div class="ca"></div>') +
          '</div>' +
          '<div class="sc-book-meta">' +
            '<div class="t">' + escapeHtml(title) + '</div>' +
            '<div class="w">' + fmtNum(words) + ' words · ' + pct + '% of goal</div>' +
            '<div class="sc-prog"><i style="width:' + pct + '%"></i></div>' +
          '</div>';
        grid.appendChild(a);
      });
      var add = document.createElement("a");
      add.className = "sc-book";
      add.href = "story-writer.html";
      add.innerHTML = '<div class="sc-newbook"><span class="plus">+</span><span>New Story</span></div>';
      grid.appendChild(add);
    }
  }
})();
