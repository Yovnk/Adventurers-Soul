// main/main.js
// Este es el que une todo.
// Carga personaldata.js -> Character.js -> crea al Paladin
// El index.html solo llama a este archivo.

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = src;
    s.onload = resolve;
    s.onerror = () => reject(new Error("No se pudo cargar: " + src));
    document.head.appendChild(s);
  });
}

async function init() {
  // 1. Primero los datos del Paladin
  await loadScript("main/Class/Paladin/personaldata.js");

  // 2. Despues la logica del personaje
  await loadScript("main/Class/Character.js");

  // 3. Ahora si, ya existen las 2 variables: personaldata y Character
  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");

  const paladin = new Character(personaldata);

  // Posicion del Paladin en pantalla
  let px = canvas.width / 2;
  let py = canvas.height / 2 + 40;

  // Teclado PC
  const keys = {};
  window.addEventListener("keydown", (e) => {
    keys[e.key.toLowerCase()] = true;
    if (e.key === " " || e.key.toLowerCase() === "j") {
      paladin.startBasicAttack();
    }
  });
  window.addEventListener("keyup", (e) => {
    keys[e.key.toLowerCase()] = false;
  });

  let lastTime = performance.now();

  function loop(now) {
    const dt = now - lastTime;
    lastTime = now;

    // Movimiento
    let moving = false;
    if (keys["a"] || keys["arrowleft"]) {
      px -= 1.5;
      paladin.setDirection(-1);
      moving = true;
    }
    if (keys["d"] || keys["arrowright"]) {
      px += 1.5;
      paladin.setDirection(1);
      moving = true;
    }

    if (!paladin.isAttacking) {
      paladin.setAnimation(moving ? "run" : "idle");
    }

    paladin.update(dt);

    // Dibujar
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#111";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Escala x3 para que se vea grande, 32px es chico
    ctx.save();
    ctx.translate(px, py);
    ctx.scale(3, 3);
    ctx.translate(-px, -py);
    paladin.draw(ctx, px, py);
    ctx.restore();

    // Texto de stats
    ctx.fillStyle = "#fff";
    ctx.font = "14px monospace";
    ctx.fillText(`HP: ${paladin.getHPText()}  MP: ${paladin.getMPText()}`, 10, 20);
    ctx.fillText(`Atk: ${paladin.secondary.atk}  Def: ${paladin.secondary.def}`, 10, 40);

    requestAnimationFrame(loop);
  }

  requestAnimationFrame(loop);
}

init();
