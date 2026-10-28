// Data de Elarion
const ElarionMap = {
  file: "Maps/elarion.jpg"
};

// Carga el jpg
const img = new Image();
img.src = ElarionMap.file;
img.onload = () => console.log("Elarion cargado:", ElarionMap.file);
