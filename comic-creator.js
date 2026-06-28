/* ===== Comic Creator — landing page logic =====
   - "AI Story Idea Helper" (curated, kid-safe suggestion engine, NOT real AI)
   - My Library list from localStorage (saved comics)
   Shared story bank is exposed on window.CMC_STORY for the builder too. */
(function () {
  "use strict";

  /* ---------- Curated, kid-safe story bank (shared) ---------- */
  var STORY_IDEAS = [
    {
      title: "The Friendly Dragon",
      begin: "Two best friends are playing in the park when they hear a tiny SQUEAK from the bushes.",
      middle: "It's a baby dragon who is lost and a little scared! They share their snacks and become friends.",
      end: "Together they help the dragon find its family — and earn a ride above the clouds!"
    },
    {
      title: "Superhero for a Day",
      begin: "An ordinary kid wakes up and discovers they can run faster than the school bus.",
      middle: "They use their new speed to help neighbors, rescue a kitten, and return a lost backpack.",
      end: "The whole town cheers — and the kid learns the real super-power is being kind."
    },
    {
      title: "Space Candy Planet",
      begin: "A young space crew lands on a mysterious planet that smells like cupcakes.",
      middle: "Everything is made of candy! But the chocolate river is rising and they must build a bridge.",
      end: "They share the candy with friendly aliens and zoom home with a galaxy of new friends."
    },
    {
      title: "The Missing Cookie Mystery",
      begin: "The biggest cookie of the bake sale has vanished without a single crumb!",
      middle: "A kid detective follows the clues: paw prints, a trail of sprinkles, a guilty-looking puppy.",
      end: "It was the puppy all along — so they bake a brand-new batch to share with everyone."
    },
    {
      title: "My Pet's Secret Life",
      begin: "Every day when the kids leave for school, their cat winks goodbye.",
      middle: "Turns out the cat runs a secret club for all the pets on the street — naps, snacks and games!",
      end: "The kids find out and join the fun, and now everyone has the best afternoons ever."
    },
    {
      title: "The Brave Little Knight",
      begin: "A small knight is given a big quest: visit the ogre on Grumpy Hill.",
      middle: "The ogre isn't scary at all — just lonely and out of tea. The knight shares a snack.",
      end: "They become best buddies, and the kingdom throws a giant friendship feast."
    },
    {
      title: "Underwater Treasure",
      begin: "A kid and a clever dolphin spot a glittering chest at the bottom of the bay.",
      middle: "Puzzles and friendly fish guard the treasure — teamwork is the only way through.",
      end: "The 'treasure' is a map to a beautiful coral garden they promise to protect."
    },
    {
      title: "The Robot Who Wanted to Dance",
      begin: "A homemade robot in a science lab dreams of dancing, but its legs are too stiff.",
      middle: "Its inventor friends design springy new feet and teach it some silly moves.",
      end: "The robot wins the school talent show with a dance everyone copies!"
    },
    {
      title: "Lost in the Enchanted Forest",
      begin: "On a hike, two siblings take a wrong turn into a forest where the trees can talk.",
      middle: "The friendly trees give riddles that point the way, and a fox offers to guide them.",
      end: "They make it home by sunset with a pocket full of magic acorns and a great story."
    },
    {
      title: "The Class Pet Escape",
      begin: "Nibbles the hamster pops the latch and goes on an adventure across the school.",
      middle: "He rolls through the gym, the cafeteria and the library, dodging surprised teachers.",
      end: "The kids form a rescue team and catch him — Nibbles gets a brand-new wheel as a reward."
    },
    {
      title: "The Sky Castle",
      begin: "A kid blows the biggest bubble ever and floats up to a castle made of clouds.",
      middle: "Cloud kids show them around, but a windstorm is blowing the castle off course!",
      end: "Working together they steer the castle safely home and plan a return visit."
    },
    {
      title: "Best Friends vs. the Boredom Monster",
      begin: "A rainy Saturday brings out the sneaky Boredom Monster who makes everything dull.",
      middle: "The friends fight back with forts, board games, comics and the silliest jokes ever.",
      end: "Laughter is the monster's weakness — it shrinks away and the sun comes out."
    }
  ];

  /* "What happens next?" kid-safe coaching prompts (used by builder too) */
  var NEXT_PROMPTS = [
    "What if a surprising new friend shows up to help?",
    "Maybe something funny goes wrong — what is it?",
    "Your hero finds a clue. What does it say?",
    "Add a big sound effect! POW, WHOOSH or BOOM?",
    "What does your character say next? Try a speech bubble.",
    "A small problem gets bigger — how do they stay brave?",
    "Show how everyone feels: happy, surprised or curious?",
    "Time for teamwork! Who helps solve the problem?",
    "End on a high-five, a hug, or a happy cheer!",
    "What's the BIGGEST, most exciting moment of your story?",
    "Try a thought bubble — what is your hero secretly thinking?",
    "Add a twist! Something nobody expected just happened."
  ];

  window.CMC_STORY = { ideas: STORY_IDEAS, next: NEXT_PROMPTS };

  function formatIdea(idea) {
    return '<b>' + idea.title + '</b><br>' +
      '<b>Beginning:</b> ' + idea.begin + '<br>' +
      '<b>Middle:</b> ' + idea.middle + '<br>' +
      '<b>End:</b> ' + idea.end;
  }

  /* ---------- Idea helper button ---------- */
  var ideaBtn = document.getElementById("cmcIdeaBtn");
  var ideaOut = document.getElementById("cmcIdeaOut");
  var lastIdx = -1;
  if (ideaBtn && ideaOut) {
    ideaBtn.addEventListener("click", function () {
      var i;
      do { i = Math.floor(Math.random() * STORY_IDEAS.length); }
      while (i === lastIdx && STORY_IDEAS.length > 1);
      lastIdx = i;
      ideaOut.innerHTML = formatIdea(STORY_IDEAS[i]);
      ideaBtn.textContent = "✨ Another idea!";
    });
  }

  /* ---------- My Library ---------- */
  var LIB_KEY = "red5_comics_v1";
  function loadLibrary() {
    try { return JSON.parse(localStorage.getItem(LIB_KEY) || "[]"); }
    catch (e) { return []; }
  }
  function fmtDate(ts) {
    try { return new Date(ts).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }); }
    catch (e) { return ""; }
  }
  var grid = document.getElementById("cmcLibGrid");
  if (grid) {
    var comics = loadLibrary().sort(function (a, b) { return (b.updated || 0) - (a.updated || 0); });
    if (!comics.length) return; // keep the empty-state markup already in the page
    grid.innerHTML = "";
    comics.forEach(function (c) {
      var panels = (c.panels && c.panels.length) || 0;
      var card = document.createElement("div");
      card.className = "cmc-lib-card";
      card.innerHTML =
        '<div class="cmc-lib-prev">' + (c.cover || "📖") + '</div>' +
        '<div class="cmc-lib-body">' +
        '<h3>' + escapeHtml(c.title || "Untitled Comic") + '</h3>' +
        '<div class="meta">' + panels + ' panel' + (panels === 1 ? '' : 's') + ' · ' + fmtDate(c.updated) + '</div>' +
        '<a class="cmc-lib-open" href="comic-builder.html?id=' + encodeURIComponent(c.id) + '">Open</a>' +
        '</div>';
      grid.appendChild(card);
    });
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (m) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m];
    });
  }
})();
