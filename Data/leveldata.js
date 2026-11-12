// Data/leveldata.js
// Curva GF rellenada - Final, no tocar
// 1-51 reales de GF, 52-100 extrapolados x1.055
// Niveles de cambio de clase 6,16,31,66,86 ya rellenados, no son gratis

window.LEVEL_DATA = {
  CAP_JUGABLE: 50,
  CAP_TOTAL: 100,
  // XP necesaria para pasar DE ese nivel AL siguiente
  XP_NEEDED: {
    1:15, 2:34, 3:57, 4:92, 5:135, 6:180, 7:560, 8:850, 9:1250, 10:1750,
    11:2400, 12:2144, 13:2800, 14:3700, 15:4700, 16:5773, 17:7000, 18:8500, 19:10500, 20:13000,
    21:16000, 22:20000, 23:25000, 24:31000, 25:38000, 26:47000, 27:58000, 28:70000, 29:83720, 30:114840,
    31:130176, 32:147312, 33:166398, 34:186648, 35:209058, 36:233000, 37:259920, 38:288600, 39:320018, 40:353058,
    41:389088, 42:428000, 43:470000, 44:515000, 45:562140, 46:615000, 47:675000, 48:740000, 49:800000, 50:851658,
    51:898329, 52:947737, 53:999863, 54:1054855, 55:1112872, 56:1174080, 57:1238654, 58:1306780, 59:1378653, 60:1454479,
    61:1534476, 62:1618872, 63:1707910, 64:1801845, 65:1900946, 66:2005498, 67:2115801, 68:2232170, 69:2354939, 70:2484461,
    71:2621106, 72:2765267, 73:2917357, 74:3077811, 75:3247091, 76:3425681, 77:3614093, 78:3812869, 79:4022576, 80:4243818,
    81:4477228, 82:4723476, 83:4983267, 84:5257346, 85:5546500, 86:5851558, 87:6173394, 88:6512930, 89:6871141, 90:7249054,
    91:7647752, 92:8068379, 93:8512139, 94:8980307, 95:9474224, 96:9995306, 97:10545048, 98:11125026, 99:11736902, 100:12382432
  },
  getXPNeeded: function(level) {
    return this.XP_NEEDED[level] || 0;
  }
};

// Oro - Regla final, no tocar
// 100 cobre = 1 plata
// 100 plata = 1 oro
window.MONEY = {
  COBRE_POR_PLATA: 100,
  PLATA_POR_ORO: 100,

  // 1. SUMAR cobre y que se convierta solo a plata y oro
  // Ejemplo: tenes 90 cobre y sumas 20 -> queda 1 plata 10 cobre solo
  sumarCobre: function(billetera, cobreASumar) {
    var totalCobre = billetera.oro * 100 * 100 + billetera.plata * 100 + billetera.cobre + cobreASumar;
    return this.normalizar(totalCobre);
  },

  // 2. RESTAR y que nunca quede en negativo
  // Si no alcanza, no resta nada y devuelve false
  // Si alcanza, resta y devuelve la billetera nueva
  restarCobre: function(billetera, cobreARestar) {
    var totalCobre = billetera.oro * 100 * 100 + billetera.plata * 100 + billetera.cobre;
    if (cobreARestar > totalCobre) {
      return false;
    }
    return this.normalizar(totalCobre - cobreARestar);
  },

  // Convierte un total en cobre a oro / plata / cobre ordenado
  normalizar: function(totalCobre) {
    var oro = Math.floor(totalCobre / (100 * 100));
    var resto = totalCobre - oro * 100 * 100;
    var plata = Math.floor(resto / 100);
    var cobre = resto - plata * 100;
    return { oro: oro, plata: plata, cobre: cobre };
  },

  // 3. MOSTRAR siempre bien ordenado: oro, plata, cobre
  // Ejemplo: "2 oro 5 plata 10 cobre"
  // Si es 0 en todo, muestra "0 cobre"
  mostrar: function(billetera) {
    var partes = [];
    if (billetera.oro > 0) partes.push(billetera.oro + " oro");
    if (billetera.plata > 0) partes.push(billetera.plata + " plata");
    if (billetera.cobre > 0) partes.push(billetera.cobre + " cobre");
    if (partes.length === 0) return "0 cobre";
    return partes.join(" ");
  }
};
