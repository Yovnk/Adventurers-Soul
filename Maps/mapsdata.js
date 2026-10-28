// Maps/mapsdata.js - Loader central
// Por ahora solo carga Elarion, después agregas más con un import

import { ElarionData } from './elariondata.js';

export const MapsRegistry = {
  elarion: ElarionData
};

// Log para saber que cargó bien
console.log("MapsRegistry cargado:", Object.keys(MapsRegistry));
