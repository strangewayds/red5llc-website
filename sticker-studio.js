/* ============================================================================
   Sticker Studio — library page data + interactions
   Renders the sticker PACK grid, category chips, search, and heart favorites
   (localStorage). Clicking a pack opens the maker with that pack preloaded.
   Scoped via window.StickerStudio; only used by sticker-studio.html.
   ========================================================================== */
(function () {
  "use strict";

  var FAV_KEY = "red5_sticker_fav_packs";

  /* ---- favorites (localStorage) ---------------------------------------- */
  function readFavs() {
    try { return JSON.parse(localStorage.getItem(FAV_KEY)) || []; }
    catch (e) { return []; }
  }
  function writeFavs(list) {
    try { localStorage.setItem(FAV_KEY, JSON.stringify(list)); } catch (e) {}
  }
  function isFavorite(id) { return readFavs().indexOf(id) !== -1; }
  function toggleFavorite(id) {
    var list = readFavs();
    var i = list.indexOf(id);
    if (i === -1) { list.push(id); } else { list.splice(i, 1); }
    writeFavs(list);
    return i === -1; // true if now on
  }

  /* ---- categories (functionally filter the grid) ----------------------- */
  var CATEGORIES = [
    { value: "all",      label: "All" },
    { value: "animals",  label: "Animals" },
    { value: "dinos",    label: "Dinosaurs" },
    { value: "space",    label: "Space" },
    { value: "fantasy",  label: "Fantasy" },
    { value: "gaming",   label: "Gaming" },
    { value: "food",     label: "Food" },
    { value: "nature",   label: "Nature" },
    { value: "sports",   label: "Sports" },
    { value: "cute",     label: "Cute" },
    { value: "funny",    label: "Funny" },
    { value: "seasonal", label: "Seasonal" },
    { value: "quotes",   label: "Positive Quotes" },
    { value: "emojis",   label: "Emojis" },
    { value: "ocean",    label: "Ocean" }
  ];

  /* ---- sticker packs --------------------------------------------------- */
  /* image = cropped ss- art; tier = "free" | "club"; cats = filter tags    */
  var PACKS = [
    { id: "cute-animals",  name: "Cute Animals",  count: 24, tier: "free", image: "assets/ss-animals.png",
      cats: ["animals", "cute"],            blurb: "Corgis, kittens and fluffy friends." },
    { id: "space-explorers", name: "Space Explorers", count: 20, tier: "free", image: "assets/ss-space.png",
      cats: ["space"],                      blurb: "Astronauts, rockets, planets and stars." },
    { id: "yummy-food",    name: "Yummy Food",    count: 28, tier: "free", image: "assets/ss-food.png",
      cats: ["food", "funny"],              blurb: "Burgers, fries, pizza and tasty treats." },
    { id: "sports-all-day", name: "Sports All Day", count: 24, tier: "club", image: "assets/ss-sports.png",
      cats: ["sports"],                     blurb: "Soccer, hoops, gear and game-day fun." },
    { id: "good-vibes",    name: "Good Vibes",    count: 20, tier: "free", image: "assets/ss-quotes.png",
      cats: ["quotes", "cute"],             blurb: "Bright, happy quotes to share." },
    { id: "good-friends",  name: "Good Friends",  count: 20, tier: "club", image: "assets/ss-dino.png",
      cats: ["dinos", "animals", "cute"],   blurb: "Friendly dinos and buddies to collect." },
    { id: "pastel-dreams", name: "Pastel Dreams", count: 24, tier: "club", image: "assets/ss-fantasy.png",
      cats: ["fantasy", "cute"],            blurb: "Unicorns, rainbows and dreamy magic." },
    { id: "gamer-life",    name: "Gamer Life",    count: 20, tier: "club", image: "assets/ss-gaming.png",
      cats: ["gaming"],                     blurb: "Controllers, pixels and power-ups." },

    /* extra packs reuse the cleanest crops so every category has results   */
    { id: "ocean-pals",    name: "Ocean Pals",    count: 18, tier: "free", image: "assets/ss-animals.png",
      cats: ["ocean", "animals", "nature"], blurb: "Splashy sea friends and bubbles." },
    { id: "dino-world",    name: "Dino World",    count: 22, tier: "free", image: "assets/ss-dino.png",
      cats: ["dinos", "funny"],             blurb: "Roar-some dinosaurs of every kind." },
    { id: "nature-trail",  name: "Nature Trail",  count: 16, tier: "club", image: "assets/ss-quotes.png",
      cats: ["nature", "seasonal"],         blurb: "Leaves, flowers and sunny days." },
    { id: "emoji-mix",     name: "Emoji Mix",     count: 30, tier: "free", image: "assets/ss-food.png",
      cats: ["emojis", "funny", "cute"],    blurb: "All your favorite emoji faces." }
  ];

  window.StickerStudio = {
    CATEGORIES: CATEGORIES,
    PACKS: PACKS,
    isFavorite: isFavorite,
    toggleFavorite: toggleFavorite,
    getPack: function (id) {
      for (var i = 0; i < PACKS.length; i++) { if (PACKS[i].id === id) return PACKS[i]; }
      return null;
    }
  };
})();
