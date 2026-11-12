// Maps/elariondata.js
// Data de Elarion - Mapa 120 x 120 tiles de 32px
// index.html -> Maps/mapsdata.js -> este archivo -> Maps/elarion.jpg
// PLANTILLA: para un mapa nuevo copiá este archivo y cambiá nombre, global y jpg

(function() {

  var TILE_SIZE = 32;
  var MAP_WIDTH = 120;  // tiles
  var MAP_HEIGHT = 120; // tiles

  var img = new Image();
  img.src = "Maps/elarion.jpg";

  var tiles = [];
  for (var y = 0; y < MAP_HEIGHT; y++) {
    var row = [];
    for (var x = 0; x < MAP_WIDTH; x++) {
      row.push(0);
    }
    tiles.push(row);
  }

  // Este global es el que mapsdata.js va a buscar con mapGlobal
  window.elarionMapData = {
    name: "Elarion",
    file: "Maps/elarion.jpg",
    width: MAP_WIDTH,
    height: MAP_HEIGHT,
    tileSize: TILE_SIZE,
    pixelWidth: MAP_WIDTH * TILE_SIZE,
    pixelHeight: MAP_HEIGHT * TILE_SIZE,
    tiles: tiles,
    image: img,
    loaded: false,
    ready: null
  };

  window.elarionMapData.ready = new Promise(function(resolve) {
    img.onload = function() {
      window.elarionMapData.loaded = true;
      console.log("Elarion cargado:", window.elarionMapData.file, window.elarionMapData.pixelWidth + "x" + window.elarionMapData.pixelHeight);
      resolve(window.elarionMapData);
    };
    img.onerror = function() {
      console.error("No se pudo cargar:", window.elarionMapData.file);
      resolve(null);
    };
  });

  // Compat con código viejo
  window.ElarionMap = window.elarionMapData;

})();
