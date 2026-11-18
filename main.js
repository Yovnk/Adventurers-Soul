// main.js - corregido FPS + fullscreen + scroll slots + coords + guardar posicion + portal desde elariondata.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import { createAllCharacters } from "./Class/characterdata.js";
import { loadAllMaps } from "./Maps/mapsdata.js";
import { createUI } from "./ui.js";

const LEVEL_DATA = window.LEVEL_DATA;
const MONEY = window.MONEY;

const firebaseConfig = { apiKey: "AIzaSyBgkpw7KKKGwXeKsxm2D-1SSuxZTEQjIxo", authDomain: "adventurer-rpg.firebaseapp.com", projectId: "adventurer-rpg", storageBucket: "adventurer-rpg.firebasestorage.app", messagingSenderId: "799844254202", appId: "1:799844254202:web:aea51e4cdac234f2b3e443", measurementId: "G-DKD0XHBFWY" };
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

const appEl = document.getElementById('app');
const gameWorldEl = document.getElementById('game-world');
const canvas = document.getElementById('game-canvas');

let portalCooldown = 0;

let currentUser=null, slots=[null,null,null], currentMapName=null, jugadorActual=null, ultimoGuardado=null;
let allCharacters={}, allMaps={};
let input={x:0,y:0};
let ui=null, currentCharacter=null;

let gameLoopStarted=false, playerX=1920, playerY=1920, facingRight=true, currentAnim="idle", spriteFrame=0, lastFrameTime=0, spriteImages={};
let lastPosGuardadaX=-1, lastPosGuardadaY=-1, lastPosGuardadaMapa="";

function migrarSlot(s){
  if(!s) return null;
  if(s.nivel==null) s.nivel=s.level||1;
  if(s.xp==null) s.xp=0;
  if(s.oro==null) s.oro=s.gold||0;
  if(s.plata==null) s.plata=0;
  if(s.cobre==null) s.cobre=0;
  if(!s.gates) s.gates={30:false,50:false,70:false,80:false};
  if(s.posX==null) s.posX = (typeof s.x==="number" && s.x>100) ? s.x : 1920;
  if(s.posY==null) s.posY = (typeof s.y==="number" && s.y>100) ? s.y : 1920;
  s.level=s.nivel; s.gold=s.oro;
  return validarSlot(s);
}
function validarSlot(s){
  if(!s) return null;
  s.nivel=Math.max(1,Math.min(100,Math.floor(Number(s.nivel)||1))); s.xp=Math.max(0,Math.floor(Number(s.xp)||0));
  if(LEVEL_DATA){ const need=LEVEL_DATA.getXPNeeded(s.nivel); if(need>0 && s.xp>need) s.xp=need; if(s.nivel>=100){s.nivel=100; s.xp=0;} }
  if(MONEY){ const n=MONEY.normalizar(Math.max(0,(Math.floor(s.oro||0)*10000)+(Math.floor(s.plata||0)*100)+Math.floor(s.cobre||0))); s.oro=n.oro; s.plata=n.plata; s.cobre=n.cobre; }
  if(!s.gates) s.gates={30:false,50:false,70:false,80:false};
  for(const g of [30,50,70,80]){ if(s.nivel<g) s.gates[g]=false; else s.gates[g]=!!s.gates[g]; }
  s.posX=Math.max(0,Math.min(9600,Math.floor(Number(s.posX)||1920)));
  s.posY=Math.max(0,Math.min(9600,Math.floor(Number(s.posY)||1920)));
  s.x=s.posX; s.y=s.posY;
  s.level=s.nivel; s.gold=s.oro; return s;
}
function syncSlot(s){ if(!s) return s; return validarSlot(s); }
function aplicarGatesGuardados(p){ if(!LEVEL_DATA||!p) return; if(!p.gates) p.gates={30:false,50:false,70:false,80:false}; for(const lvl of [30,50,70,80]) if(LEVEL_DATA.GATES[lvl]) LEVEL_DATA.GATES[lvl].desbloqueado=!!p.gates[lvl]; }
function snapshotParaUI(){
  if(!jugadorActual) return null;
  return { name:jugadorActual.name, clase:jugadorActual.clase, nivel:jugadorActual.nivel, xp:jugadorActual.xp, xpNeed:LEVEL_DATA?LEVEL_DATA.getXPNeeded(jugadorActual.nivel):0, bloqueado:LEVEL_DATA?LEVEL_DATA.estaBloqueado(jugadorActual.nivel):false, oro:jugadorActual.oro, plata:jugadorActual.plata, cobre:jugadorActual.cobre, dineroTexto:MONEY?MONEY.mostrar({oro:jugadorActual.oro,plata:jugadorActual.plata,cobre:jugadorActual.cobre}):"0 cobre", posX:Math.floor(playerX), posY:Math.floor(playerY), mapa:currentMapName||jugadorActual.map||"Elarion" };
}
function refrescarUI(){ if(ui && currentCharacter) ui.update(snapshotParaUI(), currentCharacter); }
function guardarPosicionSiCambio(forzar){
  if(!jugadorActual || !currentUser) return;
  const px=Math.floor(playerX), py=Math.floor(playerY);
  if(!forzar && px===lastPosGuardadaX && py===lastPosGuardadaY && currentMapName===lastPosGuardadaMapa) return;
  jugadorActual.posX=px; jugadorActual.posY=py;
  jugadorActual.x=px; jugadorActual.y=py;
  if(currentMapName) jugadorActual.map=currentMapName;
  lastPosGuardadaX=px; lastPosGuardadaY=py; lastPosGuardadaMapa=currentMapName;
  saveSlots();
}
async function ganarXPInterno(xp){ if(!jugadorActual||!LEVEL_DATA) return null; xp=Math.max(0,Math.min(100000,Math.floor(xp||0))); const res=LEVEL_DATA.ganarXP(jugadorActual,xp); syncSlot(jugadorActual); await saveSlots(); refrescarUI(); return res; }
async function ganarOroInterno(cobre){ if(!jugadorActual||!MONEY) return null; cobre=Math.max(0,Math.min(100000,Math.floor(cobre||0))); const n=MONEY.sumarCobre({oro:jugadorActual.oro,plata:jugadorActual.plata,cobre:jugadorActual.cobre},cobre); jugadorActual.oro=n.oro; jugadorActual.plata=n.plata; jugadorActual.cobre=n.cobre; syncSlot(jugadorActual); await saveSlots(); refrescarUI(); return n; }
async function gastarOroInterno(cobre){
  if(!jugadorActual||!MONEY) return false;
  cobre=Math.max(0,Math.floor(cobre||0));
  const n=MONEY.restarCobre({oro:jugadorActual.oro,plata:jugadorActual.plata,cobre:jugadorActual.cobre},cobre);
  if(n===false) return false;
  jugadorActual.oro=n.oro; jugadorActual.plata=n.plata; jugadorActual.cobre=n.cobre;
  syncSlot(jugadorActual); await saveSlots(); refrescarUI(); return true;
}
async function desbloquearGateInterno(nivel){
  if(!jugadorActual||!LEVEL_DATA) return false;
  if(![30,50,70,80].includes(nivel)) return false;
  if(jugadorActual.nivel<nivel) return false;
  const ok=LEVEL_DATA.desbloquearGate(nivel);
  if(ok){
    if(!jugadorActual.gates) jugadorActual.gates={30:false,50:false,70:false,80:false};
    jugadorActual.gates[nivel]=true;
    syncSlot(jugadorActual); await saveSlots(); refrescarUI();
  }
  return ok;
}

function getClassNames(){ return Object.keys(allCharacters); }
function getMapNames(){ return Object.keys(allMaps).length?Object.keys(allMaps):["Elarion"]; }
function getCurrentMap(){ if(currentMapName && allMaps[currentMapName]) return allMaps[currentMapName]; const k=Object.keys(allMaps); return k.length?allMaps[k[0]]:null; }

// Revisa si el jugador esta dentro de un portal del mapa actual (definido en elariondata.js / camposdelamanecerdata.js)
function checkPortals(){
  if(portalCooldown > 0) return;
  const map = getCurrentMap();
  if(!map || !map.portals) return;
  for(const p of map.portals){
    if(playerX >= p.x1 && playerX <= p.x2 && playerY >= p.y1 && playerY <= p.y2){
      currentMapName = p.to;
      playerX = p.destX;
      playerY = p.destY;
      portalCooldown = 60;
      if(jugadorActual) jugadorActual.map = currentMapName;
      guardarPosicionSiCambio(true);
      refrescarUI();
      break;
    }
  }
}

function checkOrientation(){
  if(jugadorActual) return true;
  const isPortrait=window.innerHeight>window.innerWidth;
  if(isPortrait){ appEl.innerHTML=`<div style="height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;background:#0f0f1a;color:white;text-align:center;padding:20px;font-family:sans-serif"><div style="font-size:50px">📱</div><h2>Girá el celular</h2><p>Adventurer RPG se juega en horizontal</p></div>`; return false; }
  return true;
}
window.addEventListener('resize',()=>{
  if(jugadorActual) return;
  if(currentUser) renderSlots(); else renderLogin();
});
function goFullscreen(){ if(!document.fullscreenElement && document.documentElement.requestFullscreen) document.documentElement.requestFullscreen().catch(()=>{}); }
document.addEventListener('click',goFullscreen,{once:true});
function hideWorld(){ gameWorldEl.style.display='none'; appEl.style.display='block'; }

function renderLogin(){
  hideWorld(); if(!checkOrientation()) return;
  appEl.style.overflowY='auto'; appEl.style.height='100vh'; appEl.style.touchAction='pan-y';
  appEl.innerHTML=`<div style="min-height:100vh;background:#0f0f1a;color:white;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:20px;font-family:sans-serif"><h1 style="font-size:32px;margin:0">⚔️ ADVENTURER RPG</h1><p style="opacity:.7">Tu aventura te espera</p><input id="email" type="email" placeholder="Email" style="width:100%;max-width:320px;padding:14px;margin:6px 0;border-radius:12px;border:1px solid #333;background:#1a1a2e;color:white" /><input id="pass" type="password" placeholder="Contraseña" style="width:100%;max-width:320px;padding:14px;margin:6px 0;border-radius:12px;border:1px solid #333;background:#1a1a2e;color:white" /><button id="btnLogin" style="width:100%;max-width:320px;padding:14px;margin:6px 0;border-radius:12px;background:#6c5ce7;color:white;border:none;font-weight:bold">Entrar</button><button id="btnRegister" style="width:100%;max-width:320px;padding:14px;margin:6px 0;border-radius:12px;background:transparent;color:white;border:1px solid #555">Crear cuenta</button><button id="btnGoogle" style="width:100%;max-width:320px;padding:14px;margin:12px 0;border-radius:12px;background:white;color:#111;border:none;font-weight:bold">G Entrar con Google</button><p id="msg" style="color:#ff7675;font-size:13px"></p></div>`;
  document.getElementById('btnLogin').onclick=async()=>{ try{ await signInWithEmailAndPassword(auth,email.value,pass.value); }catch(e){ msg.textContent=e.message; } };
  document.getElementById('btnRegister').onclick=async()=>{ try{ await createUserWithEmailAndPassword(auth,email.value,pass.value); }catch(e){ msg.textContent=e.message; } };
  document.getElementById('btnGoogle').onclick=async()=>{ try{ await signInWithPopup(auth,googleProvider); }catch(e){ msg.textContent=e.message; } };
}
async function loadSlots(uid){
  const ref=doc(db,"usuarios",uid); const snap=await getDoc(ref);
  if(snap.exists()) slots=(snap.data().slots||[null,null,null]).map(migrarSlot);
  else { slots=[null,null,null]; await setDoc(ref,{slots,createdAt:new Date().toISOString()}); }
  ultimoGuardado=JSON.stringify(slots);
}
async function saveSlots(){
  if(!currentUser) return;
  if(jugadorActual){ jugadorActual.posX=Math.floor(playerX); jugadorActual.posY=Math.floor(playerY); jugadorActual.x=jugadorActual.posX; jugadorActual.y=jugadorActual.posY; if(currentMapName) jugadorActual.map=currentMapName; }
  slots.forEach(syncSlot);
  if(ultimoGuardado){ try{ const anterior=JSON.parse(ultimoGuardado); slots.forEach((s,i)=>{ if(!s||!anterior[i]) return; if(s.nivel>anterior[i].nivel+5) s.nivel=anterior[i].nivel+5; const oroAntes=(anterior[i].oro||0)*10000+(anterior[i].plata||0)*100+(anterior[i].cobre||0); const oroAhora=(s.oro||0)*10000+(s.plata||0)*100+(s.cobre||0); if(oroAhora>oroAntes+500000){ const cap=MONEY?MONEY.normalizar(oroAntes+500000):{oro:s.oro,plata:s.plata,cobre:s.cobre}; s.oro=cap.oro; s.plata=cap.plata; s.cobre=cap.cobre; } validarSlot(s); }); }catch(e){} }
  await setDoc(doc(db,"usuarios",currentUser.uid),{slots},{merge:true}); ultimoGuardado=JSON.stringify(slots);
}
async function isNameTaken(name){ const snap=await getDoc(doc(db,"nombres",name.toLowerCase().trim())); return snap.exists(); }
async function claimName(name,uid){ await setDoc(doc(db,"nombres",name.toLowerCase().trim()),{name:name.trim(),uid,createdAt:new Date().toISOString()}); }
async function releaseName(name){ if(!name) return; await deleteDoc(doc(db,"nombres",name.toLowerCase().trim())); }

async function renderSlots(){
  hideWorld(); if(!checkOrientation()) return;
  appEl.style.overflowY='auto'; appEl.style.height='100vh'; appEl.style.touchAction='pan-y';
  appEl.innerHTML=`<div style="height:100vh;overflow-y:auto;-webkit-overflow-scrolling:touch;touch-action:pan-y;background:#0f0f1a;color:white;padding:20px;font-family:sans-serif;max-width:420px;margin:0 auto;box-sizing:border-box"><div style="display:flex;justify-content:space-between;align-items:center"><h2>Elige tu héroe</h2><button id="btnLogout" style="background:#333;color:white;border:none;padding:8px 12px;border-radius:8px">Salir</button></div><p style="opacity:.7;font-size:13px">${currentUser.email}</p><div id="slots"></div><div style="height:40px"></div></div>`;
  document.getElementById('btnLogout').onclick=()=>signOut(auth);
  const container=document.getElementById('slots'); const classOptions=getClassNames().map(c=>`<option value="${c}">${c}</option>`).join(''); const defaultMap=getMapNames()[0]||"Elarion";
  slots.forEach((s,i)=>{
    const div=document.createElement('div'); div.style="background:#1a1a2e;border:1px solid #333;border-radius:16px;padding:16px;margin:12px 0";
    if(!s){ div.innerHTML=`<b>Slot ${i+1} - Vacío</b><p style="opacity:.6;font-size:13px">Crear nuevo personaje</p><input id="name${i}" placeholder="Nombre del héroe" style="width:100%;padding:10px;border-radius:10px;background:#0f0f1a;color:white;border:1px solid #444" /><label style="display:block;margin-top:10px;font-size:13px;opacity:.8">Clase</label><select id="clase${i}" style="width:100%;padding:10px;margin-top:4px;border-radius:10px;background:#0f0f1a;color:white;border:1px solid #444">${classOptions}</select><button id="create${i}" style="width:100%;margin-top:8px;padding:12px;border-radius:10px;background:#00b894;color:white;border:none;font-weight:bold">Crear</button>`; }
    else { const nivelMostrar=s.nivel||1; const oroMostrar=(MONEY && s.oro!=null)?MONEY.mostrar({oro:s.oro||0,plata:s.plata||0,cobre:s.cobre||0}):(s.gold||0)+" oro"; div.innerHTML=`<b>${s.name}</b><p style="opacity:.7;font-size:13px">Nv ${nivelMostrar} - ${s.clase} - ${s.map||defaultMap}</p><p style="opacity:.6;font-size:12px">XP ${s.xp||0} - ${oroMostrar}</p><button id="enter${i}" style="width:100%;padding:12px;border-radius:10px;background:#6c5ce7;color:white;border:none;font-weight:bold">ENTRAR AL MUNDO ▶</button><button id="del${i}" style="width:100%;margin-top:6px;padding:8px;background:transparent;color:#ff7675;border:none;font-size:12px">Borrar personaje</button>`; }
    container.appendChild(div);
    if(!s){ document.getElementById(`create${i}`).onclick=async()=>{ const name=document.getElementById(`name${i}`).value.trim(); if(!name) return alert("Poné un nombre"); if(await isNameTaken(name)) return alert("Ese nombre ya está usado, elegí otro"); await claimName(name,currentUser.uid); const claseElegida=document.getElementById(`clase${i}`).value; slots[i]={name,clase:claseElegida,nivel:1,level:1,xp:0,oro:0,plata:0,cobre:0,gold:0,gates:{30:false,50:false,70:false,80:false},map:defaultMap,posX:1920,posY:1920,x:1920,y:1920,createdAt:new Date().toISOString()}; await saveSlots(); renderSlots(); }; }
    else { document.getElementById(`enter${i}`).onclick=()=>enterWorld(s); document.getElementById(`del${i}`).onclick=async()=>{ if(!confirm(`¿Borrar a ${s.name}?`)) return; await releaseName(s.name); slots[i]=null; await saveSlots(); renderSlots(); }; }
  });
}

async function enterWorld(personaje){
  goFullscreen(); migrarSlot(personaje); jugadorActual=personaje; aplicarGatesGuardados(personaje);
  currentMapName=personaje.map||getMapNames()[0];
  playerX = (typeof personaje.posX==="number") ? personaje.posX : 1920;
  playerY = (typeof personaje.posY==="number") ? personaje.posY : 1920;
  lastPosGuardadaX=Math.floor(playerX); lastPosGuardadaY=Math.floor(playerY); lastPosGuardadaMapa=currentMapName;
  const char=allCharacters[personaje.clase];
  if(!char){ appEl.style.display='block'; appEl.innerHTML=`<div style="background:#0f0f1a;color:white;min-height:100vh;padding:20px">No se encontró la clase ${personaje.clase}.</div>`; return; }
  currentCharacter=char; char.name=personaje.name; char.className=personaje.clase;
  appEl.innerHTML=''; appEl.style.display='none'; appEl.style.overflowY='hidden'; appEl.style.touchAction='none'; gameWorldEl.style.display='block';
  if(!ui) ui=createUI({ input, onBasic:()=>{}, onSkill:()=>{} });
  refrescarUI(); startGameLoop();
}

function startGameLoop(){
  if(gameLoopStarted) return; gameLoopStarted=true;
  const ctx=canvas.getContext('2d'); const char=currentCharacter;
  if(!char||!char.data||!char.data.sprites) return;
  spriteImages={}; for(const animName in char.data.sprites){ const img=new Image(); img.src=char.data.sprites[animName].src; spriteImages[animName]=img; }
  let lastTs=0; let framesDesdeGuardado=0;
  function loop(timestamp){
    if(!lastTs) lastTs=timestamp;
    let dt=(timestamp-lastTs)/1000; lastTs=timestamp;
    if(dt>0.05) dt=0.05;
    if(dt<=0) dt=0.016;
    if(canvas.width!==window.innerWidth) canvas.width=window.innerWidth;
    if(canvas.height!==window.innerHeight) canvas.height=window.innerHeight;
    ctx.clearRect(0,0,canvas.width,canvas.height);
    const isMoving=input.x!==0||input.y!==0; const speed=180;
    if(isMoving){
      let mx=input.x, my=input.y;
      if(mx!==0 && my!==0){ mx*=0.7071; my*=0.7071; }
      playerX+=mx*speed*dt; playerY+=my*speed*dt;
      if(input.x>0) facingRight=true; if(input.x<0) facingRight=false;
      if(currentAnim!=="run"){currentAnim="run"; spriteFrame=0; lastFrameTime=timestamp;}
    }
    else { if(currentAnim!=="idle"){currentAnim="idle"; spriteFrame=0; lastFrameTime=timestamp;} }
    const map=getCurrentMap(); const mapW=map?map.pixelWidth:3840; const mapH=map?map.pixelHeight:3840;
    playerX=Math.max(0,Math.min(playerX,mapW)); playerY=Math.max(0,Math.min(playerY,mapH));
    if(portalCooldown > 0) portalCooldown--;
    checkPortals();
    const map2=getCurrentMap(); const mapW2=map2?map2.pixelWidth:mapW; const mapH2=map2?map2.pixelHeight:mapH;
    playerX=Math.max(0,Math.min(playerX,mapW2)); playerY=Math.max(0,Math.min(playerY,mapH2));
    let camX=playerX-canvas.width/2, camY=playerY-canvas.height/2;
    camX=Math.max(0,Math.min(camX,Math.max(0,mapW2-canvas.width))); camY=Math.max(0,Math.min(camY,Math.max(0,mapH2-canvas.height)));
    if(map2 && map2.image && map2.image.complete && map2.image.naturalWidth>0) ctx.drawImage(map2.image,-camX,-camY,map2.pixelWidth,map2.pixelHeight);
    // Dibujar portales del mapa actual
    if(map2 && map2.portals){
      for(const p of map2.portals){
        const px = p.x1 - camX, py = p.y1 - camY, pw = p.x2 - p.x1, ph = p.y2 - p.y1;
        ctx.save();
        ctx.fillStyle = "rgba(0,200,255,0.35)";
        ctx.fillRect(px, py, pw, ph);
        ctx.strokeStyle = "#00e5ff";
        ctx.lineWidth = 3;
        ctx.strokeRect(px, py, pw, ph);
        ctx.fillStyle = "#fff";
        ctx.font = "bold 14px Tahoma";
        ctx.textAlign = "center";
        ctx.fillText("PORTAL", px + pw/2, py + ph/2 + 5);
        ctx.restore();
      }
    }
    const animData=char.data.sprites[currentAnim]||char.data.sprites.idle; const img=spriteImages[currentAnim]||spriteImages.idle;
    if(img && img.complete && img.naturalWidth>0 && animData){
      const totalFrames=animData.frames, useFrames=animData.useFrames, fw=img.naturalWidth/totalFrames, fh=img.naturalHeight;
      if(timestamp-lastFrameTime>animData.frameDuration){ spriteFrame=(spriteFrame+1)%useFrames.length; lastFrameTime=timestamp; }
      const frameNumber=useFrames[spriteFrame], sx=(frameNumber-1)*fw, drawH=128, drawW=fw*(drawH/fh), dx=canvas.width/2-drawW/2, dy=canvas.height/2-drawH/2;
      ctx.imageSmoothingEnabled=false; ctx.save();
      if(!facingRight){ ctx.translate(canvas.width/2,0); ctx.scale(-1,1); ctx.drawImage(img,sx,0,fw,fh,-drawW/2,dy,drawW,drawH); }
      else ctx.drawImage(img,sx,0,fw,fh,dx,dy,drawW,drawH);
      ctx.restore();
    }
    if(ui && ui.updatePos) ui.updatePos(Math.floor(playerX), Math.floor(playerY), map2 ? (map2.displayName||map2.mapName||currentMapName) : currentMapName);
    framesDesdeGuardado++;
    if(framesDesdeGuardado>=60){ framesDesdeGuardado=0; guardarPosicionSiCambio(false); }
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
}

document.addEventListener("visibilitychange", ()=>{ if(document.hidden) guardarPosicionSiCambio(true); });
window.addEventListener("beforeunload", ()=>{ guardarPosicionSiCambio(true); });

allCharacters=createAllCharacters();
allMaps=await loadAllMaps();
onAuthStateChanged(auth, async (user)=>{
  currentUser=user;
  if(user){ await loadSlots(user.uid); renderSlots(); } else renderLogin();
});
