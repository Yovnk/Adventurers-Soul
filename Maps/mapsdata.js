// Maps/mapsdata.js
// Este archivo solo carga los mapas
// Para agregar un mapa nuevo, agregás 1 línea en MAP_FILES
// mapName = interno, sin espacios, nunca se muestra
// displayName = el que se ve en pantalla, con espacios

const MAP_FILES = [
  { mapName: "Elarion", displayName: "Elarion", file: "Maps/elariondata.js", mapGlobal: "elarionMapData" },
  { mapName: "CamposDelAmanecer", displayName: "Campos Del Amanecer", file: "Maps/camposdelamanecerdata.js", mapGlobal: "camposdelamanecerMapData" }
];
window.MAP_FILES = MAP_FILES;

window.allMaps = {};

function loadScriptPromise(url) {
  return new Promise(function(resolve, reject) {
    const s = document.createElement('script');
    s.src = url;
    s.onload = function() { resolve(true); };
    s.onerror = function() { reject(new Error("No se pudo cargar " + url)); };
    document.head.appendChild(s);
  });
}

window.mapsReady = (async function() {
  for (let i = 0; i < MAP_FILES.length; i++) {
    const entry = MAP_FILES[i];
    await loadScriptPromise(entry.file);
    const mapData = window[entry.mapGlobal];
    if (!mapData) {
      console.error("El mapa no dejó su global:", entry.mapName, entry.mapGlobal);
      continue;
    }
    // Guardamos los dos nombres: el interno y el que se muestra
    mapData.mapName = entry.mapName;
    mapData.displayName = entry.displayName || entry.mapName;
    mapData.name = entry.displayName || entry.mapName;
    window.allMaps[entry.mapName] = mapData;
    // Compat: si algún código viejo busca window.ElarionMap, que siga andando
    window[entry.mapName + "Map"] = mapData;
  }
  // Esperar a que todas las imágenes terminen de cargar
  await Promise.all(Object.values(window.allMaps).map(function(m) {
    if (m.ready) return m.ready;
    return Promise.resolve(m);
  }));
  return window.allMaps;
})();
