/* ============================================================
   Craft Lab — shared craft data + library page logic.
   Used by craft-lab.html (library) and craft-detail.html (detail).
   Plain vanilla JS, no build, works on file:// and http://localhost.
   ============================================================ */
(function (global) {
  "use strict";

  // Each craft: id, title, image, difficulty (Easy/Medium), time (minutes),
  // age, supervision, mess, blurb (short), description (longer),
  // categories[] (for chip filtering), materials[], steps[].
  var CRAFTS = [
    {
      id: "jellyfish",
      title: "Jellyfish Windsock",
      image: "assets/craft-jellyfish.png",
      difficulty: "Easy",
      time: 20,
      age: "5+",
      supervision: "A grown-up to help with the string",
      mess: "Low",
      blurb: "Make a wiggly jellyfish that dances in the wind!",
      description: "Turn a paper plate and some streamers into a happy jellyfish windsock. Hang it by an open window and watch its tentacles wiggle and dance whenever the breeze blows by.",
      categories: ["easy", "family", "paper", "animals", "decor", "recycled"],
      materials: [
        "1 paper plate",
        "Crepe paper or ribbon streamers",
        "Glue stick",
        "Child-safe scissors",
        "Googly eyes (or paper + markers)",
        "String for hanging"
      ],
      steps: [
        "Color or paint the bottom of your paper plate to be your jellyfish's body.",
        "Cut 6 to 8 long streamers from crepe paper or ribbon.",
        "Glue the streamers along the bottom edge of the plate so they hang down like tentacles.",
        "Glue on two googly eyes and draw a big happy smile.",
        "Poke two small holes at the top and tie a string through to make a hanger.",
        "Hang your jellyfish near an open window and watch it wiggle in the wind!"
      ]
    },
    {
      id: "butterfly",
      title: "Toilet Roll Butterfly",
      image: "assets/craft-butterfly.png",
      difficulty: "Easy",
      time: 15,
      age: "5+",
      supervision: "Light — just for cutting",
      mess: "Low",
      blurb: "Turn a simple tube into a beautiful butterfly!",
      description: "Give an empty toilet paper roll a brand new life as a bright, colorful butterfly. Decorate the wings any way you like — no two butterflies have to look the same!",
      categories: ["easy", "family", "paper", "animals", "recycled", "decor"],
      materials: [
        "1 empty toilet paper tube",
        "Construction paper",
        "Child-safe scissors",
        "Glue stick",
        "Markers or paint",
        "Pipe cleaner (for antennae)"
      ],
      steps: [
        "Paint or color the cardboard tube — this is the butterfly's body.",
        "Fold a sheet of construction paper in half and cut out a big wing shape.",
        "Decorate the wings with dots, stripes and bright colors.",
        "Glue the wings to the back of the tube.",
        "Bend a pipe cleaner into a V and tape it inside the top for antennae.",
        "Draw a friendly face near the top and let your butterfly dry."
      ]
    },
    {
      id: "rock",
      title: "Rock Monsters",
      image: "assets/craft-rock.png",
      difficulty: "Medium",
      time: 30,
      age: "6+",
      supervision: "Light — for paint cleanup",
      mess: "Medium",
      blurb: "Paint your own silly monster friends on rocks!",
      description: "Go on a little rock hunt, then turn your smooth stones into a family of silly monsters. Give them as many eyes, horns and goofy grins as you want!",
      categories: ["family", "nature", "animals", "decor"],
      materials: [
        "Smooth clean rocks",
        "Acrylic or washable paint",
        "Paintbrush",
        "Googly eyes",
        "Glue",
        "Black marker"
      ],
      steps: [
        "Wash your rocks and let them dry completely.",
        "Paint each rock one bright base color and let it dry.",
        "Glue on googly eyes — one, two, or even three!",
        "Use markers or paint to add a big monster mouth and teeth.",
        "Add horns, spots or zig-zags to give each monster its own personality.",
        "Let everything dry, then line up your monster crew on a shelf."
      ]
    },
    {
      id: "bird",
      title: "Bird Feeder",
      image: "assets/craft-bird.png",
      difficulty: "Easy",
      time: 25,
      age: "6+",
      supervision: "A grown-up to help poke holes and hang it",
      mess: "Low",
      blurb: "Help our feathered friends with this easy feeder!",
      description: "Recycle a plastic bottle into a feeder and invite the neighborhood birds over for a snack. Hang it outside a window and keep a little birdwatching journal!",
      categories: ["easy", "nature", "animals", "recycled"],
      materials: [
        "Clean empty plastic bottle",
        "Two wooden spoons or sticks",
        "Bird seed",
        "String",
        "Child-safe scissors (grown-up to help)"
      ],
      steps: [
        "Make sure the bottle is clean and dry, with the cap on.",
        "Ask a grown-up to poke two small holes near the bottom for a perch stick.",
        "Push a stick through so a little sticks out each side for birds to stand on.",
        "Cut a small opening just above the stick for the seeds to come out.",
        "Fill the bottle with bird seed.",
        "Tie string around the neck and hang it from a branch outside."
      ]
    },
    {
      id: "rainbow",
      title: "Paper Plate Rainbow",
      image: "assets/craft-rainbow.png",
      difficulty: "Easy",
      time: 15,
      age: "4+",
      supervision: "None needed",
      mess: "Low",
      blurb: "Brighten your room with a happy rainbow!",
      description: "A cheerful paper plate rainbow with fluffy cotton clouds. It is one of the easiest crafts to make and looks amazing taped to a wall or window.",
      categories: ["easy", "family", "paper", "decor"],
      materials: [
        "1 paper plate",
        "Construction paper or markers (rainbow colors)",
        "Cotton balls",
        "Glue",
        "Child-safe scissors"
      ],
      steps: [
        "Cut the paper plate in half to make a rainbow arch.",
        "Cut strips of paper in red, orange, yellow, green, blue and purple.",
        "Glue the colored strips across the arch in rainbow order.",
        "Glue fluffy cotton balls on each end to make clouds.",
        "Let it dry, then hang your rainbow somewhere it will make you smile."
      ]
    },
    {
      id: "lava",
      title: "DIY Lava Lamp",
      image: "assets/craft-lava.png",
      difficulty: "Medium",
      time: 20,
      age: "7+",
      supervision: "A grown-up to help with the fizzy tablet",
      mess: "Medium",
      blurb: "Make a cool lava lamp with things from home!",
      description: "A super safe science craft! Watch colorful blobs float up and sink down using just water, oil, food coloring and a fizzy tablet. No fire and no harsh chemicals — totally safe.",
      categories: ["science", "family", "recycled", "decor"],
      materials: [
        "Clear plastic bottle or jar",
        "Vegetable oil",
        "Water",
        "Food coloring",
        "A fizzy (effervescent) tablet",
        "Flashlight (optional, for glow)"
      ],
      steps: [
        "Fill the bottle about one quarter full with water.",
        "Carefully pour in vegetable oil until the bottle is almost full.",
        "Wait for the oil and water to separate into two layers.",
        "Add a few drops of food coloring and watch them sink through the oil.",
        "Ask a grown-up to drop in a piece of a fizzy tablet.",
        "Watch the colorful lava blobs rise and fall! Shine a flashlight behind it for a glow."
      ]
    },
    {
      id: "frame",
      title: "Popsicle Stick Frame",
      image: "assets/craft-frame.png",
      difficulty: "Easy",
      time: 25,
      age: "5+",
      supervision: "Light — for gluing",
      mess: "Low",
      blurb: "Build and decorate a frame for your favorite photo!",
      description: "Make a one-of-a-kind picture frame out of popsicle sticks and decorate it with gems, buttons and paint. A perfect handmade gift for someone you love.",
      categories: ["easy", "family", "gifts", "friendship", "decor", "recycled"],
      materials: [
        "Popsicle (craft) sticks",
        "Glue",
        "Paint or markers",
        "Gems, buttons or stickers",
        "A photo to frame"
      ],
      steps: [
        "Lay four popsicle sticks in a square to make the frame shape.",
        "Glue the corners where the sticks overlap and let them dry.",
        "Paint the frame your favorite color.",
        "Decorate with gems, buttons and stickers around the edges.",
        "Tape your photo to the back so it shows through the middle.",
        "Add a loop of string on the back if you want to hang it up."
      ]
    },
    {
      id: "unicorn",
      title: "Unicorn Cup",
      image: "assets/craft-unicorn.png",
      difficulty: "Easy",
      time: 15,
      age: "5+",
      supervision: "None needed",
      mess: "Low",
      blurb: "Turn a paper cup into a magical unicorn!",
      description: "Transform a plain paper cup into a magical unicorn with a golden horn, flower mane and sleepy eyes. Use it to hold pens, treats or little treasures.",
      categories: ["easy", "family", "paper", "animals", "decor", "gifts"],
      materials: [
        "1 paper cup",
        "Construction paper",
        "Glue",
        "Child-safe scissors",
        "Markers",
        "Cotton balls or paper flowers (for the mane)"
      ],
      steps: [
        "Turn the paper cup upside down so the bottom is the unicorn's head.",
        "Roll a triangle of yellow paper into a cone to make the horn and glue it on top.",
        "Cut two ears from paper and glue them beside the horn.",
        "Draw two closed sleepy eyes and rosy cheeks on the front.",
        "Glue paper flowers or cotton along the top for a colorful mane.",
        "Let it dry, then use your unicorn to hold pencils or little treasures."
      ]
    }
  ];

  // Category chips shown on the library page. value matches entries in categories[].
  var CATEGORIES = [
    { value: "all",        label: "All Crafts" },
    { value: "easy",       label: "Easy" },
    { value: "family",     label: "Family Fun" },
    { value: "paper",      label: "Paper Crafts" },
    { value: "nature",     label: "Nature Crafts" },
    { value: "science",    label: "Science Crafts" },
    { value: "holiday",    label: "Holiday Crafts" },
    { value: "animals",    label: "Animals" },
    { value: "decor",      label: "Room Decor" },
    { value: "friendship", label: "Friendship Gifts" },
    { value: "recycled",   label: "Recycled Crafts" },
    { value: "gifts",      label: "Cards & Gifts" }
  ];

  function getCraft(id) {
    for (var i = 0; i < CRAFTS.length; i++) {
      if (CRAFTS[i].id === id) return CRAFTS[i];
    }
    return null;
  }

  // ---- favorites (shared localStorage helpers) ----
  var FAV_KEY = "red5.craft.favorites";
  function getFavorites() {
    try { return JSON.parse(localStorage.getItem(FAV_KEY)) || {}; }
    catch (e) { return {}; }
  }
  function isFavorite(id) { return !!getFavorites()[id]; }
  function toggleFavorite(id) {
    var f = getFavorites();
    if (f[id]) { delete f[id]; } else { f[id] = true; }
    try { localStorage.setItem(FAV_KEY, JSON.stringify(f)); } catch (e) {}
    return !!f[id];
  }

  global.CraftLab = {
    CRAFTS: CRAFTS,
    CATEGORIES: CATEGORIES,
    getCraft: getCraft,
    isFavorite: isFavorite,
    toggleFavorite: toggleFavorite,
    getFavorites: getFavorites
  };
})(window);
