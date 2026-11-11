// main.js - Adventurer RPG - Firebase + Horizontal + Fullscreen
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// --- TU CONFIG ---
const firebaseConfig = {
  apiKey: "AIzaSyBgkpw7KKKGwXeKsxm2D-1SSuxZTEQjIxo",
  authDomain: "adventurer-rpg.firebaseapp.com",
  projectId: "adventurer-rpg",
  storageBucket: "adventurer-rpg.firebasestorage.app",
  messagingSenderId: "799844254202",
  appId: "1:799844254202:web:aea51e4cdac234f2b3e443",
  measurementId: "G-DKD0XHBFWY"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

const appEl = document.getElementById('app');
let currentUser = null;
let slots = [null, null, null]; // 3 slots

// --- 1. BLOQUEO VERTICAL + PANTALLA COMPLETA ---
function checkOrientation() {
  const isPortrait = window.innerHeight > window.innerWidth;
  if (isPortrait) {
    appEl.innerHTML = `
      <div style="height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;background:#0f0f1a;color:white;text-align:center;padding:20px;font-family:sans-serif">
        <div style="font-size:50px">📱</div>
        <h2>Girá el celular</h2>
        <p>Adventurer RPG se juega en horizontal</p>
      </div>`;
    return false;
  }
  return true;
}
window.addEventListener('resize', () => { if (currentUser) renderSlots(); else renderLogin(); });
function goFullscreen() {
  if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
    document.documentElement.requestFullscreen().catch(()=>{});
  }
}
document.addEventListener('click', goFullscreen, { once: true });

function hideWorld() {
  const gw = document.getElementById('game-world');
  if (gw) gw.style.display = 'none';
  appEl.style.display = 'block';
}

// --- 2. LOGIN ---
function renderLogin() {
  hideWorld();
  if (!checkOrientation()) return;
  appEl.innerHTML = `
  <div style="min-height:100vh;background:#0f0f1a;color:white;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:20px;font-family:sans-serif">
    <h1 style="font-size:32px;margin:0">⚔️ ADVENTURER RPG</h1>
    <p style="opacity:.7">Tu aventura te espera</p>
    <input id="email" type="email" placeholder="Email" style="width:100%;max-width:320px;padding:14px;margin:6px 0;border-radius:12px;border:1px solid #333;background:#1a1a2e;color:white" />
    <input id="pass" type="password" placeholder="Contraseña" style="width:100%;max-width:320px;padding:14px;margin:6px 0;border-radius:12px;border:1px solid #333;background:#1a1a2e;color:white" />
    <button id="btnLogin" style="width:100%;max-width:320px;padding:14px;margin:6px 0;border-radius:12px;background:#6c5ce7;color:white;border:none;font-weight:bold">Entrar</button>
    <button id="btnRegister" style="width:100%;max-width:320px;padding:14px;margin:6px 0;border-radius:12px;background:transparent;color:white;border:1px solid #555">Crear cuenta</button>
    <button id="btnGoogle" style="width:100%;max-width:320px;padding:14px;margin:12px 0;border-radius:12px;background:white;color:#111;border:none;font-weight:bold">G Entrar con Google</button>
    <p id="msg" style="color:#ff7675;font-size:13px"></p>
  </div>`;
  document.getElementById('btnLogin').onclick = async () => {
    try { await signInWithEmailAndPassword(auth, email.value, pass.value); } catch(e){ msg.textContent = e.message; }
  };
  document.getElementById('btnRegister').onclick = async () => {
    try { await createUserWithEmailAndPassword(auth, email.value, pass.value); } catch(e){ msg.textContent = e.message; }
  };
  document.getElementById('btnGoogle').onclick = async () => {
    try { await signInWithPopup(auth, googleProvider); } catch(e){ msg.textContent = e.message; }
  };
}

// --- 3. SLOTS EN LA NUBE ---
async function loadSlots(uid) {
  const ref = doc(db, "usuarios", uid);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    slots = snap.data().slots || [null, null, null];
  } else {
    slots = [null, null, null];
    await setDoc(ref, { slots, createdAt: new Date().toISOString() });
  }
}
async function saveSlots() {
  await setDoc(doc(db, "usuarios", currentUser.uid), { slots }, { merge: true });
}

function renderSlots() {
  hideWorld();
  if (!checkOrientation()) return;
  appEl.innerHTML = `
  <div style="min-height:100vh;background:#0f0f1a;color:white;padding:20px;font-family:sans-serif;max-width:420px;margin:0 auto">
    <div style="display:flex;justify-content:space-between;align-items:center"><h2>Elige tu héroe</h2><button id="btnLogout" style="background:#333;color:white;border:none;padding:8px 12px;border-radius:8px">Salir</button></div>
    <p style="opacity:.7;font-size:13px">${currentUser.email}</p>
    <div id="slots"></div>
  </div>`;
  document.getElementById('btnLogout').onclick = () => signOut(auth);
  const container = document.getElementById('slots');
  slots.forEach((s, i) => {
    const div = document.createElement('div');
    div.style = "background:#1a1a2e;border:1px solid #333;border-radius:16px;padding:16px;margin:12px 0";
    if (!s) {
      div.innerHTML = `<b>Slot ${i+1} - Vacío</b><p style="opacity:.6;font-size:13px">Crear nuevo personaje</p><input id="name${i}" placeholder="Nombre del héroe" style="width:100%;padding:10px;border-radius:10px;background:#0f0f1a;color:white;border:1px solid #444" /><label style="display:block;margin-top:10px;font-size:13px;opacity:.8">Clase</label><select id="clase${i}" style="width:100%;padding:10px;margin-top:4px;border-radius:10px;background:#0f0f1a;color:white;border:1px solid #444"><option value="Paladin">Paladin</option></select><button id="create${i}" style="width:100%;margin-top:8px;padding:12px;border-radius:10px;background:#00b894;color:white;border:none;font-weight:bold">Crear</button>`;
    } else {
      div.innerHTML = `<b>${s.name}</b><p style="opacity:.7;font-size:13px">Nv ${s.level} - ${s.clase} - ${s.map || 'Aldea'}</p><button id="enter${i}" style="width:100%;padding:12px;border-radius:10px;background:#6c5ce7;color:white;border:none;font-weight:bold">ENTRAR AL MUNDO ▶</button><button id="del${i}" style="width:100%;margin-top:6px;padding:8px;background:transparent;color:#ff7675;border:none;font-size:12px">Borrar personaje</button>`;
    }
    container.appendChild(div);
    if (!s) {
      document.getElementById(`create${i}`).onclick = async () => {
        const name = document.getElementById(`name${i}`).value.trim();
        if (!name) return alert("Poné un nombre");
        const claseElegida = document.getElementById(`clase${i}`).value;
        slots[i] = { name, clase: claseElegida, level: 1, xp: 0, gold: 0, map: "Aldea", x: 5, y: 5, createdAt: new Date().toISOString() };
        await saveSlots();
        renderSlots();
      };
    } else {
      document.getElementById(`enter${i}`).onclick = () => enterWorld(s);
      document.getElementById(`del${i}`).onclick = async () => {
        if (!confirm(`¿Borrar a ${s.name}?`)) return;
        slots[i] = null;
        await saveSlots();
        renderSlots();
      };
    }
  });
}

// --- 4. ENTRAR AL MUNDO ---
async function enterWorld(personaje) {
  goFullscreen();
  localStorage.setItem('personajeActual', JSON.stringify(personaje));

  if (window.characterReady) {
    try { await window.characterReady; } catch(e) {}
  }

  let char = null;
  if (window.allCharacters && window.allCharacters[personaje.clase]) {
    char = window.allCharacters[personaje.clase];
  } else if (window.paladin) {
    char = window.paladin;
  } else if (window.currentCharacter) {
    char = window.currentCharacter;
  }

  if (char) {
    window.currentCharacter = char;
    char.name = personaje.name;
    char.className = personaje.clase;
  }

  appEl.innerHTML = '';
  appEl.style.display = 'none';

  const gw = document.getElementById('game-world');
  if (gw) {
    gw.style.display = 'block';
    if (window.UI) window.UI.update();
    startGameLoop();
  } else {
    appEl.style.display = 'block';
    appEl.innerHTML = `<div style="background:#0f0f1a;color:white;min-height:100vh;padding:20px">Entraste como ${personaje.name} pero ui.js no creó #game-world.<br>Fijate que index.html esté cargando ui.js.</div>`;
  }
}

// --- 5. DIBUJAR MAPA + SPRITE GENERICO + MOVER CON EL PAD ---
// Ahora NO dice idleImg / runImg. Carga TODO lo que venga en sprites.
// Si manana Arquero tiene idle, run, shoot, jump, lo carga solo sin tocar esto.
let gameLoopStarted = false;
let playerX = 1920;
let playerY = 1920;
let facingRight = true;
let currentAnim = "idle";
let spriteFrame = 0;
let lastFrameTime = 0;
let spriteImages = {};

function startGameLoop() {
  if (gameLoopStarted) return;
  gameLoopStarted = true;

  const canvas = document.getElementById('game-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const char = window.currentCharacter;
  if (!char || !char.data || !char.data.sprites) return;

  spriteImages = {};
  for (const animName in char.data.sprites) {
    const img = new Image();
    img.src = char.data.sprites[animName].src;
    spriteImages[animName] = img;
  }

  function loop(timestamp) {
    if (canvas.width !== window.innerWidth) canvas.width = window.innerWidth;
    if (canvas.height !== window.innerHeight) canvas.height = window.innerHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const input = window.moveInput || { x: 0, y: 0 };
    const isMoving = input.x !== 0 || input.y !== 0;
    const speed = 3;

    if (isMoving) {
      playerX += input.x * speed;
      playerY += input.y * speed;
      if (input.x > 0) facingRight = true;
      if (input.x < 0) facingRight = false;
      if (currentAnim !== "run") { currentAnim = "run"; spriteFrame = 0; lastFrameTime = timestamp; }
    } else {
      if (currentAnim !== "idle") { currentAnim = "idle"; spriteFrame = 0; lastFrameTime = timestamp; }
    }

    const map = window.ElarionMap;
    const mapW = map ? map.pixelWidth : 3840;
    const mapH = map ? map.pixelHeight : 3840;
    if (playerX < 0) playerX = 0;
    if (playerY < 0) playerY = 0;
    if (playerX > mapW) playerX = mapW;
    if (playerY > mapH) playerY = mapH;

    let camX = playerX - canvas.width / 2;
    let camY = playerY - canvas.height / 2;
    if (camX < 0) camX = 0;
    if (camY < 0) camY = 0;
    if (camX > mapW - canvas.width) camX = Math.max(0, mapW - canvas.width);
    if (camY > mapH - canvas.height) camY = Math.max(0, mapH - canvas.height);

    if (map && map.image && map.image.complete && map.image.naturalWidth > 0) {
      ctx.drawImage(map.image, -camX, -camY, map.pixelWidth, map.pixelHeight);
    }

    const animData = char.data.sprites[currentAnim] || char.data.sprites.idle;
    const img = spriteImages[currentAnim] || spriteImages.idle;
    if (img && img.complete && img.naturalWidth > 0 && animData) {
      const totalFrames = animData.frames;
      const useFrames = animData.useFrames;
      const fw = img.naturalWidth / totalFrames;
      const fh = img.naturalHeight;
      if (timestamp - lastFrameTime > animData.frameDuration) {
        spriteFrame = (spriteFrame + 1) % useFrames.length;
        lastFrameTime = timestamp;
      }
      const frameNumber = useFrames[spriteFrame];
      const sx = (frameNumber - 1) * fw;
      const drawH = 128;
      const drawW = fw * (drawH / fh);
      const dx = canvas.width / 2 - drawW / 2;
      const dy = canvas.height / 2 - drawH / 2;
      ctx.imageSmoothingEnabled = false;
      ctx.save();
      if (!facingRight) {
        ctx.translate(canvas.width / 2, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(img, sx, 0, fw, fh, -drawW / 2, dy, drawW, drawH);
      } else {
        ctx.drawImage(img, sx, 0, fw, fh, dx, dy, drawW, drawH);
      }
      ctx.restore();
    }
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
}

// --- OBSERVADOR DE SESIÓN ---
onAuthStateChanged(auth, async (user) => {
  currentUser = user;
  if (user) {
    await loadSlots(user.uid);
    renderSlots();
  } else {
    renderLogin();
  }
});
