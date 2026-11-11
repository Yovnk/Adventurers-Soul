// Maps/elariondata.js
// Data de Elarion - Mapa 120 x 120 tiles de 32px
// index.html -> Maps/mapsdata.js -> este archivo -> Maps/elarion.jpg

(function() {

  var TILE_SIZE = 32;
  var MAP_WIDTH = 120;  // tiles
  var MAP_HEIGHT = 120; // tiles

  var img = new Image();
  img.src = "Maps/elarion.jpg";

  // Grilla vacía 120x120, 0 = caminable
  // Después acá van los tiles de colisión / casas / árboles
  var tiles = [];
  for (var y = 0; y < MAP_HEIGHT; y++) {
    var row = [];
    for (var x = 0; x < MAP_WIDTH; x++) {
      row.push(0);
    }
    tiles.push(row);
  }

  window.ElarionMap = {
    name: "Elarion",
    file: "Maps/elarion.jpg",
    width: MAP_WIDTH,       // 120 tiles
    height: MAP_HEIGHT,     // 120 tiles
    tileSize: TILE_SIZE,    // 32px
    pixelWidth: MAP_WIDTH * TILE_SIZE,   // 3840px
    pixelHeight: MAP_HEIGHT * TILE_SIZE, // 3840px
    tiles: tiles,
    image: img,
    loaded: false
  };

  // Promesa para que mapsdata.js sepa cuándo ya puede dibujarlo
  window.ElarionReady = new Promise(function(resolve) {
    img.onload = function() {
      window.ElarionMap.loaded = true;
      console.log("Elarion cargado:", window.ElarionMap.file, window.ElarionMap.pixelWidth + "x" + window.ElarionMap.pixelHeight);
      if (window.onElarionLoaded) window.onElarionLoaded();
      resolve(window.ElarionMap);
    };
    img.onerror = function() {
      console.error("No se pudo cargar:", window.ElarionMap.file);
      resolve(null);
    };
  });

})();
