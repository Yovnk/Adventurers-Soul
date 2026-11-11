// Class/characterdata.js
// index.html carga SOLO este archivo
// Este archivo contiene toda la logica de atributos
// Y al final carga todas las clases
// Por ahora solo tenemos Paladin
// Cuando agregues una clase nueva, SOLO agregas su ruta abajo en CLASS_FILES

class Character {
  constructor(personaldata, options = {}) {
    this.data = personaldata;
    this.className = personaldata.className || personaldata.name || "SinClase";
    this.baseStats = { ...personaldata.stats };
    this.equipmentStats = options.equipmentStats || {};
    this.bonusStats = options.bonusStats || {};
    this.bonusSecondary = options.bonusSecondary || {};
    this.recalculate();
    this.hp = this.secondary.maxHP;
    this.mp = this.secondary.maxMP;
  }

  // ATRIBUTOS PRINCIPALES:
  // (Se calcula con: Atributos Principales + Equipamiento + todo lo que sume)
  // STR: (Fuerza)
  // VIT: (Vitalidad)
  // AGI: (Agilidad)
  // INT: (Inteligencia)
  // VOL: (Voluntad)

  getTotalPrimary() {
    const total = {};
    const keys = ["str", "vit", "vol", "agi", "int"];
    for (const k of keys) {
      total[k] = (this.baseStats[k] || 0) + (this.equipmentStats[k] || 0) + (this.bonusStats[k] || 0);
    }
    return total;
  }

  // ATRIBUTOS SECUNDARIOS:
  // (Se Calcula con: Atributos Principales + Equipamiento + Habilidad: Absorbsion)
  // HP: (Vida Actual)/(Vida Maxima)
  // MP: (Maná Actual)/(Maná Maximo)
  // Atk: (Ataque Fisico)
  // MAtk: (Ataque Magico)
  // DAtk: (Ataque a Distancia)
  // Def: (Defensa Fisica)(efectiva contra Atk y DAtk)
  // MDef: (Defensa Magica)(Efectiva contra MAtk)
  // Hit: (Probabilidad de Golpear al enemigo)
  // Eva: (Probabilidad de evadir un ataque enemigo)
  // SAtk: (Velocidad de ataque)
  // CD: (Velocidad de Casteo de Hablidades)
  // Crit: (Probabilidad de Hacer un ataque Critico Fisico)
  // MCrit: (Probabilidad de hacer un ataque Critico Magico)
  // DCrit: (Daño Critico Atk/DAtk)
  // DMC: (Daño Critico MAtk)
  // Bloq: (Probabilidad de Bloquear un ataque enemigo)
  //
  // 1 de STR = +4 Atk +3 def
  // 1 x VIT = +10 HP +4 Def
  // 1 x AGI = +4 DAtk
  // 1 x INT = +4 MAtk +3 MDef
  // 1 x de VOL = +5 MP +4 MDef
  // Cada 50 STR = +1% Bloq +1% DCrit
  // Cada 50 AGI = +1% Hit +1% Eva +1% Crit +1% SAtk
  // Cada 50 INT: +1% DMC +1% MCrit
  // Cada 50 VOL: +1% CD
  // Ejemplo: 1STR = 4Atk / 50 STR = 200Atk, 150def, 1% Bloq, 1% DCrit daño critico.

  recalculate() {
    const p = this.getTotalPrimary();
    const b = this.bonusSecondary;
    const per50 = function(val) { return Math.floor(val / 50); };
    const s = {};
    s.atk = p.str * 4;
    s.def = p.str * 3 + p.vit * 4;
    s.maxHP = p.vit * 10;
    s.dAtk = p.agi * 4;
    s.mAtk = p.int * 4;
    s.mDef = p.int * 3 + p.vol * 4;
    s.maxMP = p.vol * 5;
    s.bloq = per50(p.str) * 1;
    s.dCrit = per50(p.str) * 1;
    s.hit = per50(p.agi) * 1;
    s.eva = per50(p.agi) * 1;
    s.crit = per50(p.agi) * 1;
    s.sAtk = per50(p.agi) * 1;
    s.dmc = per50(p.int) * 1;
    s.mCrit = per50(p.int) * 1;
    s.cd = per50(p.vol) * 1;
    for (const k in b) {
      s[k] = (s[k] || 0) + b[k];
    }
    this.primary = p;
    this.secondary = s;
    if (this.hp !== undefined) this.hp = Math.min(this.hp, s.maxHP);
    if (this.mp !== undefined) this.mp = Math.min(this.mp, s.maxMP);
    return s;
  }

  setEquipment(equipmentStats, bonusSecondary) {
    this.equipmentStats = equipmentStats || {};
    this.bonusSecondary = bonusSecondary || {};
    this.recalculate();
  }

  // Verificacion con Paladin inicial:
  // STR 12, VIT 15, VOL 10, AGI 9, INT 3
  // Atk = 12*4 = 48
  // Def = 12*3 + 15*4 = 36 + 60 = 96
  // DAtk = 9*4 = 36
  // MAtk = 3*4 = 12
  // MDef = 3*3 + 10*4 = 9 + 40 = 49
  // HP = 15*10 = 150
  // MP = 10*5 = 50

  getHPText() {
    return Math.floor(this.hp) + " / " + this.secondary.maxHP;
  }
  getMPText() {
    return Math.floor(this.mp) + " / " + this.secondary.maxMP;
  }
}

// AL FINAL: CARGA TODAS LAS CLASES
// index.html carga SOLO characterdata.js
// Para agregar una clase nueva, SOLO agregas su ruta aca abajo:
// Ejemplo: "Class/Arquero/personaldata.js", "Class/Mago/personaldata.js"

const CLASS_FILES = ["Class/Paladin/personaldata.js"];

window.allCharacters = {};
window.characterReady = (async function() {
  for (let i = 0; i < CLASS_FILES.length; i++) {
    const filePath = CLASS_FILES[i];
    const data = await new Promise(function(resolve, reject) {
      const s = document.createElement("script");
      s.src = filePath;
      s.onload = function() { resolve(personaldata); };
      s.onerror = function() { reject(new Error("No se pudo cargar " + filePath)); };
      document.head.appendChild(s);
    });
    const className = data.className;
    window.allCharacters[className] = new Character(data);
    window.personaldata = undefined;
  }
  window.paladin = window.allCharacters["Paladin"];
  return window.allCharacters;
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = Character;
}

