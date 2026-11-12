// Maps/camposdelamanecerdata.js
// Data de CamposDelAmanecer - Mapa 120 x 120 tiles de 40px
// index.html -> Maps/mapsdata.js -> este archivo -> Maps/camposdelamanecer.jpg
// PLANTILLA: igual que elariondata.js

(function() {

  var TILE_SIZE = 40;
  var MAP_WIDTH = 240;  // tiles
  var MAP_HEIGHT = 240; // tiles

  var img = new Image();
  img.src = "Maps/camposdelamanecer.jpg";

  var tiles = [];
  for (var y = 0; y < MAP_HEIGHT; y++) {
    var row = [];
    for (var x = 0; x < MAP_WIDTH; x++) {
      row.push(0);
    }
    tiles.push(row);
  }

  // Este global es el que mapsdata.js va a buscar con mapGlobal
  window.camposdelamanecerMapData = {
    name: "CamposDelAmanecer",
    file: "Maps/camposdelamanecer.jpg",
    width: MAP_WIDTH,
    height: MAP_HEIGHT,
    tileSize: TILE_SIZE,
    pixelWidth: MAP_WIDTH * TILE_SIZE,
    pixelHeight: MAP_HEIGHT * TILE_SIZE,
    tiles: tiles,
    image: img,
    loaded: false,
    ready: null,
    // Elarion = ciudad segura, sin mobs
    // CamposDelAmanecer = campo afuera, ACA SI hay mobs
    esZonaSegura: false,
    nivelRecomendado: 1
  };

  window.camposdelamanecerMapData.ready = new Promise(function(resolve) {
    img.onload = function() {
      window.camposdelamanecerMapData.loaded = true;
      console.log("CamposDelAmanecer cargado:", window.camposdelamanecerMapData.file, window.camposdelamanecerMapData.pixelWidth + "x" + window.camposdelamanecerMapData.pixelHeight);
      resolve(window.camposdelamanecerMapData);
    };
    img.onerror = function() {
      console.error("No se pudo cargar:", window.camposdelamanecerMapData.file);
      resolve(null);
    };
  });

  // Compat con código viejo
  window.CamposDelAmanecerMap = window.camposdelamanecerMapData;

})();
