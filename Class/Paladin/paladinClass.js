// Class/Paladin/paladinClass.js
// CLASE Paladin - Para todos los jugadores
// Aca NO hay sprites, NO hay dibujos
// Solo que hace ser Paladin: stats y skills

window.paladinClass = {
  className: "Paladin",
  name: "Paladin",
  stats: { str: 12, vit: 15, vol: 10, agi: 9, int: 3 },
  skills: []
};
const paladinClass = window.paladinClass;
if (typeof module !== "undefined" && module.exports) { module.exports = paladinClass; }
