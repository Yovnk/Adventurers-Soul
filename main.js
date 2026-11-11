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
// El juego es HORIZONTAL. Si lo tenés en vertical, muestra el cartel.
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

// Oculta el mundo mientras estamos en login / slots (ui.js ya lo creó desde index.html)
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
      div.innerHTML = `<b>Slot ${i+1} - Vacío</b><p style="opacity:.6;font-size:13px">Crear nuevo personaje</p><input id="name${i}" placeholder="Nombre del héroe" style="width:100%;padding:10px;border-radius:10px;background:#0f0f1a;color:white;border:1px solid #444" /><button id="create${i}" style="width:100%;margin-top:8px;padding:12px;border-radius:10px;background:#00b894;color:white;border:none;font-weight:bold">Crear</button>`;
    } else {
      div.innerHTML = `<b>${s.name}</b><p style="opacity:.7;font-size:13px">Nv ${s.level} - ${s.clase} - ${s.map || 'Aldea'}</p><button id="enter${i}" style="width:100%;padding:12px;border-radius:10px;background:#6c5ce7;color:white;border:none;font-weight:bold">ENTRAR AL MUNDO ▶</button><button id="del${i}" style="width:100%;margin-top:6px;padding:8px;background:transparent;color:#ff7675;border:none;font-size:12px">Borrar personaje</button>`;
    }
    container.appendChild(div);
    if (!s) {
      document.getElementById(`create${i}`).onclick = async () => {
        const name = document.getElementById(`name${i}`).value.trim();
        if (!name) return alert("Poné un nombre");
        slots[i] = { name, clase: "Guerrero", level: 1, xp: 0, gold: 0, map: "Aldea", x: 5, y: 5, createdAt: new Date().toISOString() };
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
// index.html ya cargó todo: ui.js, Maps/mapsdata.js, Class/characterdata.js
// Acá solo mostramos el mundo que ya creó ui.js. No hacemos import ni loadScript.
async function enterWorld(personaje) {
  goFullscreen();
  localStorage.setItem('personajeActual', JSON.stringify(personaje));

  // Actualizamos el personaje que ya creó characterdata.js
  if (window.currentCharacter) {
    window.currentCharacter.name = personaje.name;
    if (personaje.clase) window.currentCharacter.className = personaje.clase;
  }
  // Si characterdata.js todavía no lo dejó listo, lo dejamos como respaldo
  if (!window.currentCharacter && window.paladin) {
    window.currentCharacter = window.paladin;
  }

  appEl.innerHTML = '';
  appEl.style.display = 'none';

  const gw = document.getElementById('game-world');
  if (gw) {
    gw.style.display = 'block';
    if (window.UI) window.UI.update();
  } else {
    appEl.style.display = 'block';
    appEl.innerHTML = `<div style="background:#0f0f1a;color:white;min-height:100vh;padding:20px">Entraste como ${personaje.name} pero ui.js no creó #game-world.<br>Fijate que index.html esté cargando ui.js.</div>`;
  }
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
