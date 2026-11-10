// main/Class/Paladin/personaldata.js
// Paladin - Datos personales de la clase
// Todas las .png miran a la derecha.
// La izquierda se obtiene con espejo: scaleX = -1
// Tamaño de frame: 32px

const personaldata = {

  // ---- IDENTIDAD ----
  className: "Paladin",
  name: "Paladin",
  basePath: "main/Class/Paladin/",

  // ---- STATS BASE ----
  // Como pediste vos, sin HP/MP calculados todavia
  stats: {
    str: 12, // Fuerza
    vit: 15, // Vitalidad
    vol: 10, // Voluntad
    agi: 9,  // Agilidad
    int: 3   // Inteligencia
  },

  // ---- TAMAÑO ----
  frameWidth: 32,
  frameHeight: 32,

  // ---- VELOCIDAD DE ANIMACION ----
  // Tiempo POR FRAME en ms.
  // La duracion total = frames * frameDuration
  // Asi las secuencias mas largas duran mas solas.
  frameDuration: 100,
  idleFrameDuration: 160,

  // ---- SPRITES ----
  // frames: cuantos frames tiene el png
  // useFrames: que frames usamos, en orden
  // loop: si se repite o se queda en el ultimo frame
  sprites: {

    idle: {
      src: "main/Class/Paladin/idle.png",
      frames: 5,
      useFrames: [1, 2, 3, 4, 5],
      frameDuration: 160,
      loop: true
    },

    run: {
      src: "main/Class/Paladin/run.png",
      frames: 8,
      useFrames: [1, 2, 3, 4, 5, 6, 7, 8],
      frameDuration: 100,
      loop: true
    },

    muerte: {
      src: "main/Class/Paladin/muerte.png",
      frames: 8,
      useFrames: [1, 2, 3, 4, 5, 6, 7, 8],
      frameDuration: 100,
      loop: false
    },

    atk1: {
      src: "main/Class/Paladin/atk1.png",
      frames: 7,
      useFrames: [1, 2, 3, 4, 5, 6, 7],
      frameDuration: 100,
      loop: false
    },

    atk2: {
      src: "main/Class/Paladin/atk2.png",
      frames: 9,
      // El png tiene 9, pero solo usamos 1-2-3-4
      useFrames: [1, 2, 3, 4],
      frameDuration: 100,
      loop: false
    }

  },

  // ---- ATAQUE BASICO ----
  // Secuencia: primero atk2 y despues atk1
  // Todavia sin skills
  basicAttack: {
    name: "basic",
    sequence: ["atk2", "atk1"],
    // atk2: 4 frames x 100ms = 400ms
    // atk1: 7 frames x 100ms = 700ms
    // Total basico: 1100ms
    canMoveWhileAttacking: false
  },

  // ---- DIRECCIONES ----
  // 2 direcciones solamente
  // Derecha: scaleX = 1 (png original)
  // Izquierda: scaleX = -1 (espejo)
  directions: {
    right: 1,
    left: -1
  },

  // ---- SKILLS ----
  // Vacio por ahora, lo agregamos despues
  skills: []

};

// Para que Character.js lo pueda cargar
// Si usas ES Modules: export default personaldata
// Si usas script clasico: queda como variable global
if (typeof module !== "undefined" && module.exports) {
  module.exports = personaldata;
}
