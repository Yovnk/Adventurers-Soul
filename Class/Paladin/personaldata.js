// Class/Paladin/personaldata.js
const personaldata = {
  className: "Paladin",
  name: "Paladin",
  basePath: "Class/Paladin/",
  stats: { str: 12, vit: 15, vol: 10, agi: 9, int: 3 },
  frameWidth: 32,
  frameHeight: 32,
  frameDuration: 100,
  idleFrameDuration: 160,
  directions: { right: 1, left: -1 },
  sprites: {
    idle: { src: "Class/Paladin/idle.png", frames: 5, useFrames: [1, 2, 3, 4, 5], frameDuration: 160, loop: true },
    run: { src: "Class/Paladin/run.png", frames: 8, useFrames: [1, 2, 3, 4, 5, 6, 7, 8], frameDuration: 100, loop: true },
    muerte: { src: "Class/Paladin/muerte.png", frames: 8, useFrames: [1, 2, 3, 4, 5, 6, 7, 8], frameDuration: 100, loop: false },
    atk1: { src: "Class/Paladin/atk1.png", frames: 7, useFrames: [1, 2, 3, 4, 5, 6, 7], frameDuration: 100, loop: false },
    atk2: { src: "Class/Paladin/atk2.png", frames: 9, useFrames: [1, 2, 3, 4], frameDuration: 100, loop: false }
  },
  basicAttack: { name: "basic", sequence: ["atk1", "atk2"], mode: "tap_once_atk1_hold_or_retap_atk2_repeat", canMoveWhileAttacking: false },
  skills: []
};
if (typeof module !== "undefined" && module.exports) { module.exports = personaldata; }
