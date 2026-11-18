export function createUI(opts){
  const input = opts.input;
  const onBasic = opts.onBasic || (()=>{});
  const onSkill = opts.onSkill || (()=>{});
  let lastSnapshot=null;

  const css = `
  *{margin:0;padding:0;box-sizing:border-box;font-family:Tahoma,Arial,sans-serif;-webkit-tap-highlight-color:transparent}
  body{background:#0a0a0f;overflow:hidden;color:#fff}
  #game-world{width:100vw;height:100vh;position:relative;background:#1a2a1a}
  #game-canvas{width:100%;height:100%;display:block;background:#2a4a2a}
  #hud{position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none}
  #hud-top-left{position:absolute;top:8px;left:8px;width:168px;max-width:26vw;background:rgba(0,0,0,0.65);border:2px solid #555;border-radius:8px;padding:5px 6px;pointer-events:auto}
  #hud-name{font-size:12px;font-weight:bold;color:#ffd700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  #hud-class{font-size:10px;color:#aaa;margin-bottom:3px}
  .bar-label{font-size:9px;display:flex;justify-content:space-between;margin-top:1px}
  .bar-bg{width:100%;height:8px;background:#222;border:1px solid #000;border-radius:4px;overflow:hidden;margin-top:1px}
  #hp-fill{height:100%;width:100%;background:linear-gradient(90deg,#d32f2f,#ff5252)}
  #mp-fill{height:100%;width:100%;background:linear-gradient(90deg,#1976d2,#42a5f5)}
  #hud-coords{position:absolute;top:8px;right:10px;background:rgba(0,0,0,0.55);border:1px solid rgba(255,255,255,0.25);border-radius:8px;padding:4px 8px;font-size:10px;color:#fff;pointer-events:none;z-index:6;white-space:nowrap;text-shadow:0 1px 2px #000}
  #hud-bottom-center{position:absolute;bottom:16px;left:50%;transform:translateX(-50%);display:flex;gap:8px;pointer-events:auto;background:rgba(0,0,0,0.6);border:2px solid #555;border-radius:20px;padding:6px;z-index:6}
  .tab-btn{background:#2a2a35;border:2px solid #666;color:#fff;padding:4px 8px;border-radius:10px;cursor:pointer;font-weight:bold;font-size:11px;white-space:nowrap;display:flex;align-items:center;justify-content:center;min-width:38px;height:34px;line-height:1}
  .tab-btn svg{width:20px;height:20px;display:block}
  .tab-btn.active{background:#ffd700;color:#000;border-color:#ffd700}
  .tab-btn.active svg{stroke:#000}
  #hud-xp-wrap{position:absolute;bottom:5px;left:50%;transform:translateX(-50%);width:320px;max-width:44vw;pointer-events:none;z-index:6;text-align:center}
  #xp-bar-bg{position:relative;width:100%;height:11px;background:rgba(0,0,0,0.7);border:1px solid #555;border-radius:10px;overflow:hidden}
  #xp-fill{position:absolute;left:0;top:0;height:100%;width:0%;background:linear-gradient(90deg,#ffb300,#ffe082);transition:width .3s;z-index:1}
  #xp-text{position:absolute;left:0;top:50%;transform:translateY(-50%);width:100%;font-size:9px;line-height:1;color:#fff;text-shadow:0 1px 2px #000,0 0 2px #000;z-index:2;pointer-events:none}
  #hud-bottom-right{position:absolute;bottom:10px;right:10px;width:260px;height:190px;pointer-events:auto;z-index:5}
  .skill-btn{position:absolute;width:48px;height:48px;border-radius:50%;background:#222;border:2px solid #888;color:#fff;font-size:10px;font-weight:bold;display:flex;align-items:center;justify-content:center;text-align:center;cursor:pointer;z-index:2}
  .skill-btn:active{transform:scale(.92)}
  .skill-btn.empty{opacity:.45}
  #btn-basic{position:absolute;right:0;bottom:0;width:84px;height:84px;border-radius:50%;background:radial-gradient(circle at 30% 30%,#ff7043,#bf360c);border:3px solid #fff;color:#fff;font-size:13px;font-weight:bold;cursor:pointer;box-shadow:0 0 12px rgba(0,0,0,.6);z-index:1}
  #btn-basic:active{transform:scale(.93)}
  #skill-1{left:62px;top:78px} #skill-2{left:126px;top:2px} #skill-3{left:194px;top:2px} #skill-4{left:94px;top:118px} #skill-5{left:106px;top:54px} #skill-6{left:160px;top:36px}
  .window{position:absolute;background:#e8e0d0;color:#222;border:3px solid #7a6a4a;border-radius:8px;box-shadow:0 0 20px rgba(0,0,0,.7);display:none;pointer-events:auto;z-index:10}
  .window.open{display:block}
  .window-header{background:#3a3a5a;color:#fff;padding:8px 12px;font-weight:bold;display:flex;justify-content:space-between;align-items:center;border-radius:5px 5px 0 0;cursor:grab;touch-action:none;user-select:none}
  .window-header:active{cursor:grabbing}
  .window-close{background:#c62828;border:none;color:#fff;width:24px;height:24px;border-radius:4px;cursor:pointer;font-weight:bold}
  .window-body{padding:10px;overflow-y:auto;max-height:72vh;overflow-x:hidden}
  #window-personaje{top:8px;left:8px;width:max-content;max-width:92vw}
  #personaje-layout{display:flex;gap:10px;align-items:flex-start}
  #equip-grid{display:grid;grid-template-columns:1fr 1fr;gap:6px;width:230px;flex-shrink:0}
  .equip-slot{background:#fff;border:2px solid #999;border-radius:6px;padding:6px;min-height:48px;cursor:pointer}
  .equip-slot.selected{border-color:#1976d2;background:#e3f2fd}
  .equip-slot-name{font-size:11px;color:#888} .equip-slot-item{font-size:13px;font-weight:bold} .equip-slot-empty{font-size:12px;color:#bbb}
  #stats-col{width:max-content;flex-shrink:0}
  .stat-section{background:#3a3a5a;color:#fff;padding:5px 8px;margin:0 0 6px 0;font-size:12px;font-weight:bold}
  .stat-row{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:3px 0;border-bottom:1px solid #ccc;font-size:13px;white-space:nowrap}
  .stat-row b{text-align:right;flex-shrink:0}
  #window-inventario{top:8px;left:480px;width:340px;max-width:38vw}
  #window-inventario .window-body{overflow:visible;max-height:none;padding:10px 10px 8px}
  #inv-grid{display:grid;grid-template-columns:repeat(6,1fr);gap:4px}
  .inv-slot{width:100%;aspect-ratio:1;background:#fff;border:2px solid #999;border-radius:4px;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:16px}
  .inv-slot.selected{border-color:#1976d2;background:#e3f2fd}
  #inv-info{margin-top:6px;font-size:12px;min-height:18px;color:#555}
  #inv-money{display:flex;gap:12px;align-items:center;justify-content:center;margin-top:6px;padding:5px 6px;background:rgba(0,0,0,.08);border:1px solid #c9b98a;border-radius:6px}
  .coin-item{display:flex;align-items:center;gap:4px;font-size:13px;font-weight:bold;color:#222}
  .coin{width:16px;height:16px;border-radius:50%;display:inline-block;border:1px solid rgba(0,0,0,.3);flex-shrink:0}
  .coin-gold{background:radial-gradient(circle at 30% 30%,#ffe082,#ffb300 60%,#8d6e00)}
  .coin-silver{background:radial-gradient(circle at 30% 30%,#fff,#b0bec5 60%,#607d8b)}
  .coin-copper{background:radial-gradient(circle at 30% 30%,#ffab91,#bf360c 60%,#4e342e)}
  #window-skills{top:8px;left:50%;transform:translateX(-50%);width:420px;max-width:94vw}
  .skill-row{display:flex;justify-content:space-between;padding:8px;background:#fff;border:1px solid #ccc;border-radius:4px;margin-bottom:6px;font-size:13px}
  #skills-empty{font-size:13px;color:#666;text-align:center;padding:14px 0}
  #joypad{position:absolute;bottom:10px;left:10px;width:150px;height:150px;pointer-events:auto;z-index:5;touch-action:none}
  .joy-btn{position:absolute;width:52px;height:52px;border-radius:50%;background:rgba(0,0,0,.55);border:2px solid rgba(255,255,255,.6);color:#fff;font-size:22px;font-weight:bold;display:flex;align-items:center;justify-content:center;cursor:pointer;user-select:none;touch-action:none;pointer-events:none}
  .joy-btn.active{background:rgba(255,215,0,.7);color:#000}
  #joy-up{left:49px;top:0} #joy-down{left:49px;bottom:0} #joy-left{left:0;top:49px} #joy-right{right:0;top:49px}
  @media (max-height:450px){ #hud-top-left{width:152px} #hud-coords{font-size:9px;padding:3px 6px} #hud-bottom-right{width:230px;height:170px;bottom:10px;transform:scale(.9);transform-origin:bottom right} #window-personaje{width:max-content;max-width:94vw;left:8px} #window-inventario{width:94vw;left:8px;top:auto;bottom:8px} #joypad{transform:scale(.85);transform-origin:bottom left} #hud-bottom-center{bottom:12px} #hud-xp-wrap{bottom:3px;width:280px} }
  `;
  const style=document.createElement("style"); style.textContent=css; document.head.appendChild(style);
  const gameWorld=document.getElementById("game-world");
  const ICON_BACKPACK="<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'><path d='M9 8V6a3 3 0 0 1 6 0v2'/><path d='M5 8h14v11a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V8z'/><path d='M9 12h6v4a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2v-4z'/><path d='M5 12h2M17 12h2'/></svg>";
  const ICON_HUMAN="<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'><circle cx='12' cy='8' r='3.5'/><path d='M4.5 20c0-4 3.4-6.5 7.5-6.5S19.5 16 19.5 20'/></svg>";
  const hud=document.createElement("div"); hud.id="hud";
  hud.innerHTML="<div id='hud-top-left'><div id='hud-name'>Personaje</div><div id='hud-class'>Nv. 1</div><div class='bar-label'><span>HP</span><span id='hp-text'>0 / 0</span></div><div class='bar-bg'><div id='hp-fill'></div></div><div class='bar-label'><span>MP</span><span id='mp-text'>0 / 0</span></div><div class='bar-bg'><div id='mp-fill'></div></div></div>"
  +"<div id='hud-coords'>Elarion | X: 0 Y: 0</div>"
  +"<div id='joypad'><div class='joy-btn' id='joy-up'>↑</div><div class='joy-btn' id='joy-down'>↓</div><div class='joy-btn' id='joy-left'>←</div><div class='joy-btn' id='joy-right'>→</div></div>"
  +"<div id='hud-bottom-center'><button class='tab-btn' id='tab-inventario' aria-label='Inventario'>"+ICON_BACKPACK+"</button><button class='tab-btn' id='tab-personaje' aria-label='Personaje'>"+ICON_HUMAN+"</button><button class='tab-btn' id='tab-skills'>Skills</button></div>"
  +"<div id='hud-xp-wrap'><div id='xp-bar-bg'><div id='xp-fill'></div><div id='xp-text'>0 / 0 XP</div></div></div>"
  +"<div id='hud-bottom-right'><button class='skill-btn empty' id='skill-1'>Skill 1</button><button class='skill-btn empty' id='skill-2'>Skill 2</button><button class='skill-btn empty' id='skill-3'>Skill 3</button><button class='skill-btn empty' id='skill-4'>Skill 4</button><button class='skill-btn empty' id='skill-5'>Skill 5</button><button class='skill-btn empty' id='skill-6'>Skill 6</button><button id='btn-basic'>BASICO</button></div>";
  gameWorld.appendChild(hud);
  const wP=document.createElement("div"); wP.id="window-personaje"; wP.className="window";
  wP.innerHTML="<div class='window-header'><span id='personaje-title'>Personaje</span><button class='window-close' id='close-personaje'>X</button></div><div class='window-body'><div id='personaje-layout'><div><div class='stat-section'>EQUIPAMIENTO</div><div id='equip-grid'></div></div><div id='stats-col'><div class='stat-section'>PRINCIPALES</div><div class='stat-row'><span>STR (Fuerza)</span><b id='st-str'>0</b></div><div class='stat-row'><span>VIT (Vitalidad)</span><b id='st-vit'>0</b></div><div class='stat-row'><span>VOL (Voluntad)</span><b id='st-vol'>0</b></div><div class='stat-row'><span>AGI (Agilidad)</span><b id='st-agi'>0</b></div><div class='stat-row'><span>INT (Inteligencia)</span><b id='st-int'>0</b></div><div class='stat-section'>DERIVADOS</div><div class='stat-row'><span>HP</span><b id='st-hp'>0</b></div><div class='stat-row'><span>MP</span><b id='st-mp'>0</b></div><div class='stat-row'><span>Atk</span><b id='st-atk'>0</b></div><div class='stat-row'><span>MAtk</span><b id='st-matk'>0</b></div><div class='stat-row'><span>DAtk</span><b id='st-datk'>0</b></div><div class='stat-row'><span>Def</span><b id='st-def'>0</b></div><div class='stat-row'><span>MDef</span><b id='st-mdef'>0</b></div><div class='stat-row'><span>Hit</span><b id='st-hit'>0%</b></div><div class='stat-row'><span>Eva</span><b id='st-eva'>0%</b></div><div class='stat-row'><span>SAtk</span><b id='st-satk'>0%</b></div><div class='stat-row'><span>CD</span><b id='st-cd'>0%</b></div><div class='stat-row'><span>Crit</span><b id='st-crit'>0%</b></div><div class='stat-row'><span>MCrit</span><b id='st-mcrit'>0%</b></div><div class='stat-row'><span>DCrit</span><b id='st-dcrit'>0%</b></div><div class='stat-row'><span>DMC</span><b id='st-dmc'>0%</b></div><div class='stat-row'><span>Bloq</span><b id='st-bloq'>0%</b></div></div></div></div>";
  gameWorld.appendChild(wP);
  const wI=document.createElement("div"); wI.id="window-inventario"; wI.className="window";
  wI.innerHTML="<div class='window-header'><span>Inventario</span><button class='window-close' id='close-inventario'>X</button></div><div class='window-body'><div id='inv-grid'></div><div id='inv-info'>Toca un slot para ver el item.</div><div id='inv-money'><span class='coin-item'><span class='coin coin-gold'></span><span id='inv-oro'>0</span></span><span class='coin-item'><span class='coin coin-silver'></span><span id='inv-plata'>0</span></span><span class='coin-item'><span class='coin coin-copper'></span><span id='inv-cobre'>0</span></span></div></div>";
  gameWorld.appendChild(wI);
  const wS=document.createElement("div"); wS.id="window-skills"; wS.className="window";
  wS.innerHTML="<div class='window-header'><span>Skills</span><button class='window-close' id='close-skills'>X</button></div><div class='window-body'><div id='skills-list'></div><div id='skills-empty'>Sin skills por ahora.</div></div>";
  gameWorld.appendChild(wS);

  const EQUIP=[{key:"casco",label:"Casco"},{key:"pechera",label:"Pechera"},{key:"guantes",label:"Guantes"},{key:"pantalones",label:"Pantalones"},{key:"botas",label:"Botas"},{key:"manoDerecha",label:"Mano Derecha"},{key:"manoIzquierda",label:"Mano Izquierda"},{key:"especial",label:"Especial"},{key:"capa",label:"Capa"},{key:"accesorio1",label:"Accesorio 1"},{key:"accesorio2",label:"Accesorio 2"}];
  const equipment={}; EQUIP.forEach(e=>equipment[e.key]=null);
  const inventory=Array(36).fill(null);
  let selectedEquip=null;
  const setText=(id,v)=>{const el=document.getElementById(id); if(el) el.textContent=v;};
  function renderEquip(){
    const g=document.getElementById("equip-grid"); if(!g) return; g.innerHTML="";
    EQUIP.forEach(slot=>{
      const d=document.createElement("div"); d.className="equip-slot"+(selectedEquip===slot.key?" selected":"");
      const it=equipment[slot.key];
      d.innerHTML="<div class='equip-slot-name'>"+slot.label+"</div>"+(it?"<div class='equip-slot-item'>"+it.name+"</div>":"<div class='equip-slot-empty'>Vacio</div>");
      d.onclick=()=>{selectedEquip=slot.key; renderEquip();}; g.appendChild(d);
    });
  }
  function renderInv(){
    const g=document.getElementById("inv-grid"); if(!g) return; g.innerHTML="";
    inventory.forEach((it,i)=>{
      const s=document.createElement("div"); s.className="inv-slot"; s.textContent=it?it.icon:"·";
      s.onclick=()=>{ document.querySelectorAll(".inv-slot").forEach(x=>x.classList.remove("selected")); s.classList.add("selected"); setText("inv-info", it?it.name:"Slot vacio."); };
      g.appendChild(s);
    });
  }
  let lastCoordsText="";
  function updatePos(x, y, mapa){
    const texto=(mapa||lastSnapshot?.mapa||"Elarion")+" | X: "+Math.floor(x)+" Y: "+Math.floor(y);
    if(texto===lastCoordsText) return;
    lastCoordsText=texto;
    setText("hud-coords", texto);
  }
  function update(snapshot, character){
    if(snapshot) lastSnapshot=snapshot;
    if(!character) return;
    const p=character.primary, s=character.secondary;
    const nivel=lastSnapshot?.nivel||1, xp=lastSnapshot?.xp||0, xpNeed=lastSnapshot?.xpNeed||0, bloqueado=!!lastSnapshot?.bloqueado;
    setText("hud-name", lastSnapshot?.name||character.className);
    setText("hud-class","Nv. "+nivel+" - "+character.className+(bloqueado?" 🔒":""));
    setText("personaje-title","Personaje - "+(lastSnapshot?.name||character.className));
    setText("hp-text",Math.floor(character.hp)+" / "+s.maxHP); setText("mp-text",Math.floor(character.mp)+" / "+s.maxMP);
    setText("xp-text",xp+" / "+xpNeed+" XP"); setText("inv-oro",lastSnapshot?.oro||0); setText("inv-plata",lastSnapshot?.plata||0); setText("inv-cobre",lastSnapshot?.cobre||0);
    if(lastSnapshot?.posX!=null) updatePos(lastSnapshot.posX, lastSnapshot.posY, lastSnapshot.mapa);
    const hf=document.getElementById("hp-fill"), mf=document.getElementById("mp-fill"), xf=document.getElementById("xp-fill");
    if(hf) hf.style.width=(character.hp/s.maxHP*100)+"%"; if(mf) mf.style.width=(character.mp/s.maxMP*100)+"%"; if(xf) xf.style.width=(xpNeed>0?Math.min(100,xp/xpNeed*100):0)+"%";
    setText("st-str",p.str); setText("st-vit",p.vit); setText("st-vol",p.vol); setText("st-agi",p.agi); setText("st-int",p.int);
    setText("st-hp",Math.floor(character.hp)+" / "+s.maxHP); setText("st-mp",Math.floor(character.mp)+" / "+s.maxMP);
    setText("st-atk",s.atk); setText("st-matk",s.mAtk); setText("st-datk",s.dAtk); setText("st-def",s.def); setText("st-mdef",s.mDef);
    setText("st-hit",s.hit+"%"); setText("st-eva",s.eva+"%"); setText("st-satk",s.sAtk+"%"); setText("st-cd",s.cd+"%"); setText("st-crit",s.crit+"%"); setText("st-mcrit",s.mCrit+"%"); setText("st-dcrit",s.dCrit+"%"); setText("st-dmc",s.dmc+"%"); setText("st-bloq",s.bloq+"%");
    const skills=character.data.skills||[]; const list=document.getElementById("skills-list"); const empty=document.getElementById("skills-empty");
    if(list){ if(empty) empty.style.display=skills.length?"none":"block"; list.innerHTML=""; skills.forEach(sk=>{const r=document.createElement("div"); r.className="skill-row"; r.innerHTML="<span>"+sk.name+"</span><b>MP "+(sk.mp||0)+"</b>"; list.appendChild(r);}); }
    for(let k=1;k<=6;k++){ const b=document.getElementById("skill-"+k); if(!b) continue; if(skills[k-1]){b.textContent=skills[k-1].name; b.classList.remove("empty");} else {b.textContent="Skill "+k; b.classList.add("empty");} }
    renderEquip();
  }
  function closeAll(){ document.querySelectorAll(".window").forEach(w=>w.classList.remove("open")); document.querySelectorAll(".tab-btn").forEach(t=>t.classList.remove("active")); }
  function closeOne(id,tab){ document.getElementById(id)?.classList.remove("open"); document.getElementById(tab)?.classList.remove("active"); }
  function toggle(id,tab){ const el=document.getElementById(id); if(!el) return; if(el.classList.contains("open")) closeOne(id,tab); else { el.classList.add("open"); document.getElementById(tab)?.classList.add("active"); } }
  document.getElementById("tab-inventario").onclick=()=>toggle("window-inventario","tab-inventario");
  document.getElementById("tab-personaje").onclick=()=>toggle("window-personaje","tab-personaje");
  document.getElementById("tab-skills").onclick=()=>toggle("window-skills","tab-skills");
  document.getElementById("close-personaje").onclick=()=>closeOne("window-personaje","tab-personaje");
  document.getElementById("close-inventario").onclick=()=>closeOne("window-inventario","tab-inventario");
  document.getElementById("close-skills").onclick=()=>closeOne("window-skills","tab-skills");
  document.getElementById("btn-basic").onclick=()=>onBasic();
  for(let k=1;k<=6;k++){ document.getElementById("skill-"+k).onclick=()=>onSkill(k); }
  let topZ=20;
  function makeDraggable(win){
    const header=win.querySelector(".window-header");
    if(!header||win.dataset.draggable) return;
    win.dataset.draggable="1";
    let sx=0,sy=0,sl=0,st=0,dragging=false;
    function start(cx,cy){ dragging=true; win.style.transform="none"; const r=win.getBoundingClientRect(); sx=cx; sy=cy; sl=r.left; st=r.top; topZ++; win.style.zIndex=topZ; win.style.left=sl+"px"; win.style.top=st+"px"; }
    function move(cx,cy){ if(!dragging) return; const nl=Math.max(0,Math.min(sl+(cx-sx),window.innerWidth-60)); const nt=Math.max(0,Math.min(st+(cy-sy),window.innerHeight-40)); win.style.left=nl+"px"; win.style.top=nt+"px"; }
    function end(){ dragging=false; }
    header.addEventListener("mousedown",e=>{ if(e.target.classList.contains("window-close")) return; start(e.clientX,e.clientY); const mm=ev=>move(ev.clientX,ev.clientY); const mu=()=>{ end(); document.removeEventListener("mousemove",mm); document.removeEventListener("mouseup",mu); }; document.addEventListener("mousemove",mm); document.addEventListener("mouseup",mu); });
    header.addEventListener("touchstart",e=>{ if(e.target.classList.contains("window-close")) return; const t=e.changedTouches[0]; start(t.clientX,t.clientY); },{passive:true});
    header.addEventListener("touchmove",e=>{ if(!dragging) return; const t=e.changedTouches[0]; move(t.clientX,t.clientY); if(e.cancelable) e.preventDefault(); },{passive:false});
    header.addEventListener("touchend",end,{passive:true});
  }
  makeDraggable(wP); makeDraggable(wI); makeDraggable(wS);
  const joy=document.getElementById("joypad"); let joyActive=false, joyId=null, joyUsingMouse=false;
  const setJoy=(x,y)=>{ document.getElementById("joy-up")?.classList.toggle("active",y<0); document.getElementById("joy-down")?.classList.toggle("active",y>0); document.getElementById("joy-left")?.classList.toggle("active",x<0); document.getElementById("joy-right")?.classList.toggle("active",x>0); };
  const fromPoint=(cx,cy)=>{
    const r=joy.getBoundingClientRect(); const dx=cx-(r.left+r.width/2), dy=cy-(r.top+r.height/2);
    const len=Math.hypot(dx,dy);
    if(len<12){ input.x=0; input.y=0; setJoy(0,0); return; }
    let x=dx/len, y=dy/len;
    if(len>1){ const m=Math.hypot(x,y); if(m>1){ x/=m; y/=m; } }
    input.x=x; input.y=y; setJoy(x,y);
  };
  const joyEnd=(e)=>{ joyActive=false; joyUsingMouse=false; joyId=null; input.x=0; input.y=0; setJoy(0,0); if(e) e.preventDefault(); };
  if(joy){
    joy.addEventListener("touchstart",e=>{ e.preventDefault(); const t=e.changedTouches[0]; joyActive=true; joyId=t.identifier; fromPoint(t.clientX,t.clientY); },{passive:false});
    joy.addEventListener("touchmove",e=>{ if(!joyActive) return; e.preventDefault(); for(const t of e.changedTouches) if(t.identifier===joyId) fromPoint(t.clientX,t.clientY); },{passive:false});
    joy.addEventListener("touchend",joyEnd,{passive:false}); joy.addEventListener("touchcancel",joyEnd,{passive:false});
    joy.addEventListener("mousedown",e=>{ joyActive=true; joyUsingMouse=true; fromPoint(e.clientX,e.clientY); });
    document.addEventListener("mousemove",e=>{ if(!joyActive||!joyUsingMouse) return; fromPoint(e.clientX,e.clientY); });
    document.addEventListener("mouseup",()=>{ if(!joyActive) return; joyEnd(); });
  }
  const held={};
  function applyKeys(){
    let x=0,y=0; if(held["a"]||held["arrowleft"]) x--; if(held["d"]||held["arrowright"]) x++; if(held["w"]||held["arrowup"]) y--; if(held["s"]||held["arrowdown"]) y++;
    if(joyActive) return;
    if(x!==0||y!==0){ const m=Math.hypot(x,y); if(m>1){ x/=m; y/=m; } }
    input.x=x; input.y=y;
  }
  document.addEventListener("keydown",e=>{ const k=e.key.toLowerCase(); held[k]=true; if(k==="i") toggle("window-inventario","tab-inventario"); if(k==="p") toggle("window-personaje","tab-personaje"); if(k==="k") toggle("window-skills","tab-skills"); if(k==="escape") closeAll(); applyKeys(); });
  document.addEventListener("keyup",e=>{ const k=e.key.toLowerCase(); held[k]=false; applyKeys(); });
  renderInv(); renderEquip();
  return { update, updatePos };
}
