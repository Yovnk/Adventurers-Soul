// Este archivo solo carga los mapas
// Para agregar un mapa nuevo, agregás una línea acá

function loadScript(url) {
  const s = document.createElement('script');
  s.src = url;
  document.head.appendChild(s);
}

loadScript('Maps/elariondata.js');
