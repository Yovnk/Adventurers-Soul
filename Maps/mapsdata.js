// Maps/mapsdata.js
// Este archivo solo carga los mapas
// Para agregar un mapa nuevo, agregás una línea acá

function loadScript(url) {
  const s = document.createElement('script');
  s.src = url;
  document.head.appendChild(s);
}

window.onElarionLoaded = function() {
  const canvas = document.getElementById('game-canvas');
  const map = window.ElarionMap;
  if (!canvas || !map || !map.image) return;
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  ctx.drawImage(map.image, 0, 0, map.pixelWidth, map.pixelHeight);
};

loadScript('Maps/elariondata.js');
