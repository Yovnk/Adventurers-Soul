// ui.js - SOLO HUD - BLINDADO
// No lee localStorage. No toca oro/XP. Solo muestra la copia que le pasa main.js con UI.update(snapshot).
// Si alguien toca esa copia, solo se miente el dibujo, no se guarda nada en Firebase.
(function() {
  function getCharacter() {
    if (window.currentCharacter) return window.currentCharacter;
    if (window.paladin) return window.paladin;
    return null;
  }
  window.moveInput = { x: 0, y: 0 }; // Solo input de movimiento, no economia
  var lastSnapshot = null; // Copia de solo lectura que manda main.js

  var css = "";
  css += "* { margin:0; padding:0; box-sizing:border-box; font-family: Tahoma, Arial, sans-serif; -webkit-tap-highlight-color: transparent; }";
  css += "body { background:#0a0a0f; overflow:hidden; color:#fff; }";
  css += "#game-world { width:100vw; height:100vh; position:relative; background:#1a2a1a; }";
  css += "#game-canvas { width:100%; height:100%; display:block; background:#2a4a2a; }";
  css += "#hud { position:absolute; top:0; left:0; width:100%; height:100%; pointer-events:none; }";
  css += "#hud-top-left { position:absolute; top:10px; left:10px; width:210px; max-width:32vw; background:rgba(0,0,0,0.65); border:2px solid #555; border-radius:8px; padding:6px 8px; pointer-events:auto; }";
  css += "#hud-name { font-size:14px; font-weight:bold; color:#ffd700; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }";
  css += "#hud-class { font-size:11px; color:#aaa; margin-bottom:4px; }";
  css += ".bar-label { font-size:10px; display:flex; justify-content:space-between; margin-top:2px; }";
  css += ".bar-bg { width:100%; height:10px; background:#222; border:1px solid #000; border-radius:4px; overflow:hidden; margin-top:1px; }";
  css += "#hp-fill { height:100%; width:100%; background:linear-gradient(90deg,#d32f2f,#ff5252); }";
  css += "#mp-fill { height:100%; width:100%; background:linear-gradient(90deg,#1976d2,#42a5f5); }";
  css += "#xp-fill { height:100%; width:0%; background:linear-gradient(90deg,#ffb300,#ffe082); }";
  css += "#hud-money { font-size:11px; color:#ffd700; margin-top:4px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }";
  css += "#hud-bottom-center { position:absolute; bottom:10px; left:50%; transform:translateX(-50%); display:flex; gap:8px; pointer-events:auto; background:rgba(0,0,0,0.6); border:2px solid #555; border-radius:20px; padding:6px; z-index:6; }";
  css += ".tab-btn { background:#2a2a35; border:2px solid #666; color:#fff; padding:10px 14px; border-radius:14px; cursor:pointer; font-weight:bold; font-size:13px; white-space:nowrap; }";
  css += ".tab-btn.active { background:#ffd700; color:#000; border-color:#ffd700; }";
  css += "#hud-bottom-right { position:absolute; bottom:10px; right:10px; width:260px; height:190px; pointer-events:auto; z-index:5; }";
  css += ".skill-btn { position:absolute; width:48px; height:48px; border-radius:50%; background:#222; border:2px solid #888; color:#fff; font-size:10px; font-weight:bold; display:flex; align-items:center; justify-content:center; text-align:center; cursor:pointer; z-index:2; }";
  css += ".skill-btn:active { transform:scale(0.92); }";
  css += ".skill-btn.empty { opacity:0.45; }";
  css += "#btn-basic { position:absolute; right:0; bottom:0; width:84px; height:84px; border-radius:50%; background:radial-gradient(circle at 30% 30%, #ff7043, #bf360c); border:3px solid #fff; color:#fff; font-size:13px; font-weight:bold; cursor:pointer; box-shadow:0 0 12px rgba(0,0,0,0.6); z-index:1; }";
  css += "#btn-basic:active { transform:scale(0.93); }";
  css += "#skill-1 { left:78px; top:0; }";
  css += "#skill-2 { left:136px; top:0; }";
  css += "#skill-3 { left:194px; top:10px; }";
  css += "#skill-4 { left:68px; top:62px; }";
  css += "#skill-5 { left:126px; top:58px; }";
  css += "#skill-6 { left:180px; top:66px; }";
  css += ".window { position:absolute; background:#e8e0d0; color:#222; border:3px solid #7a6a4a; border-radius:8px; box-shadow:0 0 20px rgba(0,0,0,0.7); display:none; pointer-events:auto; z-index:10; }";
  css += ".window.open { display:block; }";
  css += ".window-header { background:#3a3a5a; color:#fff; padding:8px 12px; font-weight:bold; display:flex; justify-content:space-between; align-items:center; border-radius:5px 5px 0 0; cursor:grab; touch-action:none; user-select:none; }";
  css += ".window-header:active { cursor:grabbing; }";
  css += ".window-close { background:#c62828; border:none; color:#fff; width:24px; height:24px; border-radius:4px; cursor:pointer; font-weight:bold; }";
  css += ".window-body { padding:10px; overflow-y:auto; max-height:72vh; overflow-x:hidden; }";
  css += "#window-personaje { top:8px; left:8px; width:max-content; max-width:92vw; }";
  css += "#personaje-layout { display:flex; gap:10px; align-items:flex-start; }";
  css += "#equip-grid { display:grid; grid-template-columns:1fr 1fr; gap:6px; width:230px; flex-shrink:0; }";
  css += ".equip-slot { background:#fff; border:2px solid #999; border-radius:6px; padding:6px; min-height:48px; cursor:pointer; }";
  css += ".equip-slot.selected { border-color:#1976d2; background:#e3f2fd; }";
  css += ".equip-slot-name { font-size:11px; color:#888; }";
  css += ".equip-slot-item { font-size:13px; font-weight:bold; }";
  css += ".equip-slot-empty { font-size:12px; color:#bbb; }";
  css += "#stats-col { width:max-content; flex-shrink:0; }";
  css += ".stat-section { background:#3a3a5a; color:#fff; padding:5px 8px; margin:0 0 6px 0; font-size:12px; font-weight:bold; }";
  css += ".stat-row { display:flex; justify-content:space-between; align-items:center; gap:12px; padding:3px 0; border-bottom:1px solid #ccc; font-size:13px; white-space:nowrap; }";
  css += ".stat-row b { text-align:right; flex-shrink:0; }";
  css += "#window-inventario { top:8px; left:480px; width:340px; max-width:38vw; }";
  css += "#inv-grid { display:grid; grid-template-columns:repeat(6,1fr); gap:4px; }";
  css += ".inv-slot { width:100%; aspect-ratio:1; background:#fff; border:2px solid #999; border-radius:4px; display:flex; align-items:center; justify-content:center; cursor:pointer; font-size:16px; }";
  css += ".inv-slot.selected { border-color:#1976d2; background:#e3f2fd; }";
  css += "#inv-info { margin-top:8px; font-size:12px; min-height:18px; color:#555; }";
  css += "#window-skills { top:8px; left:50%; transform:translateX(-50%); width:420px; max-width:94vw; }";
  css += ".skill-row { display:flex; justify-content:space-between; padding:8px; background:#fff; border:1px solid #ccc; border-radius:4px; margin-bottom:6px; font-size:13px; }";
  css += "#skills-empty { font-size:13px; color:#666; text-align:center; padding:14px 0; }";
  css += "#joypad { position:absolute; bottom:10px; left:10px; width:150px; height:150px; pointer-events:auto; z-index:5; touch-action:none; }";
  css += ".joy-btn { position:absolute; width:52px; height:52px; border-radius:50%; background:rgba(0,0,0,0.55); border:2px solid rgba(255,255,255,0.6); color:#fff; font-size:22px; font-weight:bold; display:flex; align-items:center; justify-content:center; cursor:pointer; user-select:none; touch-action:none; pointer-events:none; }";
  css += ".joy-btn.active { background:rgba(255,215,0,0.7); color:#000; }";
  css += "#joy-up { left:49px; top:0; }";
  css += "#joy-down { left:49px; bottom:0; }";
  css += "#joy-left { left:0; top:49px; }";
  css += "#joy-right { right:0; top:49px; }";
  css += "@media (max-height:450px) { #hud-top-left { width:190px; } #hud-bottom-right { width:230px; height:170px; bottom:10px; transform:scale(0.9); transform-origin:bottom right; } #window-personaje { width:max-content; max-width:94vw; left:8px; } #window-inventario { width:94vw; left:8px; top:auto; bottom:8px; } #joypad { transform:scale(0.85); transform-origin:bottom left; } }";

  var style = document.createElement("style");
  style.textContent = css;
  document.head.appendChild(style);

  var gameWorld = document.getElementById("game-world");
  if (!gameWorld) {
    gameWorld = document.createElement("div");
    gameWorld.id = "game-world";
    document.body.appendChild(gameWorld);
    var cv = document.createElement("canvas");
    cv.id = "game-canvas";
    gameWorld.appendChild(cv);
  }

  var hud = document.createElement("div");
  hud.id = "hud";
  hud.innerHTML = ""
    + "<div id='hud-top-left'>"
    + "<div id='hud-name'>Personaje</div>"
    + "<div id='hud-class'>Nv. 1</div>"
    + "<div class='bar-label'><span>HP</span><span id='hp-text'>0 / 0</span></div>"
    + "<div class='bar-bg'><div id='hp-fill'></div></div>"
    + "<div class='bar-label'><span>MP</span><span id='mp-text'>0 / 0</span></div>"
    + "<div class='bar-bg'><div id='mp-fill'></div></div>"
    + "<div class='bar-label'><span>XP</span><span id='xp-text'>0 / 0</span></div>"
    + "<div class='bar-bg'><div id='xp-fill'></div></div>"
    + "<div id='hud-money'>0 cobre</div>"
    + "</div>"
    + "<div id='joypad'>"
    + "<div class='joy-btn' id='joy-up'>↑</div>"
    + "<div class='joy-btn' id='joy-down'>↓</div>"
    + "<div class='joy-btn' id='joy-left'>←</div>"
    + "<div class='joy-btn' id='joy-right'>→</div>"
    + "</div>"
    + "<div id='hud-bottom-center'>"
    + "<button class='tab-btn' id='tab-inventario'>Inventario</button>"
    + "<button class='tab-btn' id='tab-personaje'>Personaje</button>"
    + "<button class='tab-btn' id='tab-skills'>Skills</button>"
    + "</div>"
    + "<div id='hud-bottom-right'>"
    + "<button class='skill-btn empty' id='skill-1'>Skill 1</button>"
    + "<button class='skill-btn empty' id='skill-2'>Skill 2</button>"
    + "<button class='skill-btn empty' id='skill-3'>Skill 3</button>"
    + "<button class='skill-btn empty' id='skill-4'>Skill 4</button>"
    + "<button class='skill-btn empty' id='skill-5'>Skill 5</button>"
    + "<button class='skill-btn empty' id='skill-6'>Skill 6</button>"
    + "<button id='btn-basic'>BASICO</button>"
    + "</div>";
  gameWorld.appendChild(hud);

  var wPersonaje = document.createElement("div");
  wPersonaje.id = "window-personaje";
  wPersonaje.className = "window";
  wPersonaje.innerHTML = ""
    + "<div class='window-header'><span id='personaje-title'>Personaje</span><button class='window-close' id='close-personaje'>X</button></div>"
    + "<div class='window-body'><div id='personaje-layout'>"
    + "<div><div class='stat-section'>EQUIPAMIENTO</div><div id='equip-grid'></div></div>"
    + "<div id='stats-col'>"
    + "<div class='stat-section'>PRINCIPALES</div>"
    + "<div class='stat-row'><span>STR (Fuerza)</span><b id='st-str'>0</b></div>"
    + "<div class='stat-row'><span>VIT (Vitalidad)</span><b id='st-vit'>0</b></div>"
    + "<div class='stat-row'><span>VOL (Voluntad)</span><b id='st-vol'>0</b></div>"
    + "<div class='stat-row'><span>AGI (Agilidad)</span><b id='st-agi'>0</b></div>"
    + "<div class='stat-row'><span>INT (Inteligencia)</span><b id='st-int'>0</b></div>"
    + "<div class='stat-section'>DERIVADOS</div>"
    + "<div class='stat-row'><span>HP</span><b id='st-hp'>0</b></div>"
    + "<div class='stat-row'><span>MP</span><b id='st-mp'>0</b></div>"
    + "<div class='stat-row'><span>Atk</span><b id='st-atk'>0</b></div>"
    + "<div class='stat-row'><span>MAtk</span><b id='st-matk'>0</b></div>"
    + "<div class='stat-row'><span>DAtk</span><b id='st-datk'>0</b></div>"
    + "<div class='stat-row'><span>Def</span><b id='st-def'>0</b></div>"
    + "<div class='stat-row'><span>MDef</span><b id='st-mdef'>0</b></div>"
    + "<div class='stat-row'><span>Hit</span><b id='st-hit'>0%</b></div>"
    + "<div class='stat-row'><span>Eva</span><b id='st-eva'>0%</b></div>"
    + "<div class='stat-row'><span>SAtk</span><b id='st-satk'>0%</b></div>"
    + "<div class='stat-row'><span>CD</span><b id='st-cd'>0%</b></div>"
    + "<div class='stat-row'><span>Crit</span><b id='st-crit'>0%</b></div>"
    + "<div class='stat-row'><span>MCrit</span><b id='st-mcrit'>0%</b></div>"
    + "<div class='stat-row'><span>DCrit</span><b id='st-dcrit'>0%</b></div>"
    + "<div class='stat-row'><span>DMC</span><b id='st-dmc'>0%</b></div>"
    + "<div class='stat-row'><span>Bloq</span><b id='st-bloq'>0%</b></div>"
    + "</div></div></div>";
  gameWorld.appendChild(wPersonaje);

  var wInv = document.createElement("div");
  wInv.id = "window-inventario";
  wInv.className = "window";
  wInv.innerHTML = ""
    + "<div class='window-header'><span>Inventario</span><button class='window-close' id='close-inventario'>X</button></div>"
    + "<div class='window-body'><div id='inv-grid'></div><div id='inv-info'>Toca un slot para ver el item.</div></div>";
  gameWorld.appendChild(wInv);

  var wSkills = document.createElement("div");
  wSkills.id = "window-skills";
  wSkills.className = "window";
  wSkills.innerHTML = ""
    + "<div class='window-header'><span>Skills</span><button class='window-close' id='close-skills'>X</button></div>"
    + "<div class='window-body'><div id='skills-list'></div><div id='skills-empty'>Sin skills por ahora.</div></div>";
  gameWorld.appendChild(wSkills);

  var EQUIP_SLOTS = [
    { key: "casco", label: "Casco" },
    { key: "pechera", label: "Pechera" },
    { key: "guantes", label: "Guantes" },
    { key: "pantalones", label: "Pantalones" },
    { key: "botas", label: "Botas" },
    { key: "manoDerecha", label: "Mano Derecha" },
    { key: "manoIzquierda", label: "Mano Izquierda" },
    { key: "especial", label: "Especial" },
    { key: "capa", label: "Capa" },
    { key: "accesorio1", label: "Accesorio 1" },
    { key: "accesorio2", label: "Accesorio 2" }
  ];
  var equipment = {};
  for (var e = 0; e < EQUIP_SLOTS.length; e++) { equipment[EQUIP_SLOTS[e].key] = null; }
  var inventory = [];
  for (var i = 0; i < 42; i++) { inventory.push(null); }
  var selectedEquipKey = null;

  function setText(id, val) { var el = document.getElementById(id); if (el) el.textContent = val; }
  function getHeroName(c) {
    if (lastSnapshot && lastSnapshot.name) return lastSnapshot.name;
    if (c && c.name && c.name !== c.className) return c.name;
    return c ? c.className : "Personaje";
  }
  function renderEquipment() {
    var grid = document.getElementById("equip-grid");
    if (!grid) return;
    grid.innerHTML = "";
    for (var i = 0; i < EQUIP_SLOTS.length; i++) {
      (function(slot) {
        var div = document.createElement("div");
        div.className = "equip-slot" + (selectedEquipKey === slot.key ? " selected" : "");
        var item = equipment[slot.key];
        div.innerHTML = "<div class='equip-slot-name'>" + slot.label + "</div>"
          + (item ? "<div class='equip-slot-item'>" + item.name + "</div>" : "<div class='equip-slot-empty'>Vacio</div>");
        div.onclick = function() { selectedEquipKey = slot.key; renderEquipment(); };
        grid.appendChild(div);
      })(EQUIP_SLOTS[i]);
    }
  }
  function renderInventory() {
    var grid = document.getElementById("inv-grid");
    if (!grid) return;
    grid.innerHTML = "";
    for (var i = 0; i < inventory.length; i++) {
      (function(index) {
        var slot = document.createElement("div");
        slot.className = "inv-slot";
        slot.textContent = inventory[index] ? inventory[index].icon : "·";
        slot.onclick = function() {
          var all = document.querySelectorAll(".inv-slot");
          for (var j = 0; j < all.length; j++) { all[j].classList.remove("selected"); }
          slot.classList.add("selected");
          setText("inv-info", inventory[index] ? inventory[index].name : "Slot vacio.");
        };
        grid.appendChild(slot);
      })(i);
    }
  }
  function renderSkills() {
    var c = getCharacter();
    if (!c || !c.data) return;
    var skills = c.data.skills || [];
    var list = document.getElementById("skills-list");
    var empty = document.getElementById("skills-empty");
    if (!list) return;
    if (empty) empty.style.display = skills.length ? "none" : "block";
    list.innerHTML = "";
    for (var i = 0; i < skills.length; i++) {
      var row = document.createElement("div");
      row.className = "skill-row";
      row.innerHTML = "<span>" + skills[i].name + "</span><b>MP " + (skills[i].mp || 0) + "</b>";
      list.appendChild(row);
    }
    for (var k = 1; k <= 6; k++) {
      var btn = document.getElementById("skill-" + k);
      if (!btn) continue;
      if (skills[k - 1]) { btn.textContent = skills[k - 1].name; btn.classList.remove("empty"); }
      else { btn.textContent = "Skill " + k; btn.classList.add("empty"); }
    }
  }
  function updateUI(snapshot) {
    if (snapshot) lastSnapshot = snapshot; // Solo lectura para mostrar
    var c = getCharacter();
    if (!c) return;
    var p = c.primary;
    var s = c.secondary;
    var heroName = getHeroName(c);
    var nivel = (lastSnapshot && lastSnapshot.nivel) || 1;
    var xp = (lastSnapshot && lastSnapshot.xp) || 0;
    var xpNeed = (lastSnapshot && lastSnapshot.xpNeed) || 0;
    var bloqueado = !!(lastSnapshot && lastSnapshot.bloqueado);
    var dinero = (lastSnapshot && lastSnapshot.dineroTexto) || "0 cobre";
    setText("hud-name", heroName);
    setText("hud-class", "Nv. " + nivel + " - " + c.className + (bloqueado ? " 🔒" : ""));
    setText("personaje-title", "Personaje - " + heroName);
    setText("hp-text", Math.floor(c.hp) + " / " + s.maxHP);
    setText("mp-text", Math.floor(c.mp) + " / " + s.maxMP);
    setText("xp-text", xp + " / " + xpNeed);
    setText("hud-money", dinero);
    var hpFill = document.getElementById("hp-fill");
    var mpFill = document.getElementById("mp-fill");
    var xpFill = document.getElementById("xp-fill");
    if (hpFill) hpFill.style.width = (c.hp / s.maxHP * 100) + "%";
    if (mpFill) mpFill.style.width = (c.mp / s.maxMP * 100) + "%";
    if (xpFill) xpFill.style.width = (xpNeed > 0 ? Math.min(100, xp / xpNeed * 100) : 0) + "%";
    setText("st-str", p.str);
    setText("st-vit", p.vit);
    setText("st-vol", p.vol);
    setText("st-agi", p.agi);
    setText("st-int", p.int);
    setText("st-hp", Math.floor(c.hp) + " / " + s.maxHP);
    setText("st-mp", Math.floor(c.mp) + " / " + s.maxMP);
    setText("st-atk", s.atk);
    setText("st-matk", s.mAtk);
    setText("st-datk", s.dAtk);
    setText("st-def", s.def);
    setText("st-mdef", s.mDef);
    setText("st-hit", s.hit + "%");
    setText("st-eva", s.eva + "%");
    setText("st-satk", s.sAtk + "%");
    setText("st-cd", s.cd + "%");
    setText("st-crit", s.crit + "%");
    setText("st-mcrit", s.mCrit + "%");
    setText("st-dcrit", s.dCrit + "%");
    setText("st-dmc", s.dmc + "%");
    setText("st-bloq", s.bloq + "%");
    renderSkills();
    renderEquipment();
  }

  function closeAll() {
    var wins = document.querySelectorAll(".window");
    for (var i = 0; i < wins.length; i++) { wins[i].classList.remove("open"); }
    var tabs = document.querySelectorAll(".tab-btn");
    for (var j = 0; j < tabs.length; j++) { tabs[j].classList.remove("active"); }
  }
  function closeOne(id, tabId) {
    var el = document.getElementById(id);
    if (el) el.classList.remove("open");
    var tab = document.getElementById(tabId);
    if (tab) tab.classList.remove("active");
  }
  function toggleWindow(id, tabId) {
    var el = document.getElementById(id);
    if (!el) return;
    var wasOpen = el.classList.contains("open");
    if (wasOpen) closeOne(id, tabId);
    else { el.classList.add("open"); var tab = document.getElementById(tabId); if (tab) tab.classList.add("active"); }
  }
  document.getElementById("tab-inventario").onclick = function() { toggleWindow("window-inventario", "tab-inventario"); };
  document.getElementById("tab-personaje").onclick = function() { toggleWindow("window-personaje", "tab-personaje"); };
  document.getElementById("tab-skills").onclick = function() { toggleWindow("window-skills", "tab-skills"); };
  document.getElementById("close-personaje").onclick = function() { closeOne("window-personaje", "tab-personaje"); };
  document.getElementById("close-inventario").onclick = function() { closeOne("window-inventario", "tab-inventario"); };
  document.getElementById("close-skills").onclick = function() { closeOne("window-skills", "tab-skills"); };
  document.getElementById("btn-basic").onclick = function() { if (window.onBasicAttack) window.onBasicAttack(); };
  for (var k = 1; k <= 6; k++) {
    (function(n) { document.getElementById("skill-" + n).onclick = function() { if (window.onSkill) window.onSkill(n); }; })(k);
  }

  var topZ = 20;
  function makeDraggable(win) {
    var header = win.querySelector(".window-header");
    if (!header || win.dataset.draggable) return;
    win.dataset.draggable = "1";
    var startX = 0, startY = 0, startLeft = 0, startTop = 0, dragging = false;
    function onStart(clientX, clientY) {
      dragging = true; win.style.transform = "none";
      var rect = win.getBoundingClientRect();
      startX = clientX; startY = clientY; startLeft = rect.left; startTop = rect.top;
      topZ++; win.style.zIndex = topZ; win.style.left = startLeft + "px"; win.style.top = startTop + "px";
    }
    function onMove(clientX, clientY) {
      if (!dragging) return;
      var newLeft = startLeft + (clientX - startX);
      var newTop = startTop + (clientY - startY);
      newLeft = Math.max(0, Math.min(newLeft, window.innerWidth - 60));
      newTop = Math.max(0, Math.min(newTop, window.innerHeight - 40));
      win.style.left = newLeft + "px"; win.style.top = newTop + "px";
    }
    function onEnd() { dragging = false; }
    header.addEventListener("mousedown", function(e) {
      if (e.target.classList.contains("window-close")) return;
      onStart(e.clientX, e.clientY);
      function mm(ev) { onMove(ev.clientX, ev.clientY); }
      function mu() { onEnd(); document.removeEventListener("mousemove", mm); document.removeEventListener("mouseup", mu); }
      document.addEventListener("mousemove", mm);
      document.addEventListener("mouseup", mu);
    });
    header.addEventListener("touchstart", function(e) {
      if (e.target.classList.contains("window-close")) return;
      var t = e.changedTouches[0]; onStart(t.clientX, t.clientY);
    }, { passive: true });
    header.addEventListener("touchmove", function(e) {
      if (!dragging) return;
      var t = e.changedTouches[0]; onMove(t.clientX, t.clientY);
      if (e.cancelable) e.preventDefault();
    }, { passive: false });
    header.addEventListener("touchend", onEnd, { passive: true });
  }
  makeDraggable(wPersonaje);
  makeDraggable(wInv);
  makeDraggable(wSkills);

  var joypadEl = document.getElementById("joypad");
  var joyActive = false;
  var joyTouchId = null;
  function setJoyVisual(x, y) {
    var up = document.getElementById("joy-up");
    var down = document.getElementById("joy-down");
    var left = document.getElementById("joy-left");
    var right = document.getElementById("joy-right");
    if (up) up.classList.toggle("active", y < 0);
    if (down) down.classList.toggle("active", y > 0);
    if (left) left.classList.toggle("active", x < 0);
    if (right) right.classList.toggle("active", x > 0);
  }
  function updateJoyFromPoint(clientX, clientY) {
    if (!joypadEl) return;
    var rect = joypadEl.getBoundingClientRect();
    var cx = rect.left + rect.width / 2;
    var cy = rect.top + rect.height / 2;
    var dx = clientX - cx; var dy = clientY - cy;
    var dead = 12; var x = 0, y = 0;
    if (dx > dead) x = 1; if (dx < -dead) x = -1;
    if (dy > dead) y = 1; if (dy < -dead) y = -1;
    window.moveInput.x = x; window.moveInput.y = y; setJoyVisual(x, y);
  }
  function joyEnd(e) {
    joyActive = false; joyTouchId = null;
    window.moveInput.x = 0; window.moveInput.y = 0; setJoyVisual(0, 0);
    if (e) e.preventDefault();
  }
  if (joypadEl) {
    joypadEl.addEventListener("touchstart", function(e) {
      if (e) e.preventDefault();
      var t = e.changedTouches[0]; joyActive = true; joyTouchId = t.identifier; updateJoyFromPoint(t.clientX, t.clientY);
    }, { passive: false });
    joypadEl.addEventListener("touchmove", function(e) {
      if (!joyActive) return; if (e) e.preventDefault();
      for (var i = 0; i < e.changedTouches.length; i++) {
        if (e.changedTouches[i].identifier === joyTouchId) updateJoyFromPoint(e.changedTouches[i].clientX, e.changedTouches[i].clientY);
      }
    }, { passive: false });
    joypadEl.addEventListener("touchend", joyEnd, { passive: false });
    joypadEl.addEventListener("touchcancel", joyEnd, { passive: false });
    joypadEl.addEventListener("mousedown", function(e) { joyActive = true; updateJoyFromPoint(e.clientX, e.clientY); });
    document.addEventListener("mousemove", function(e) { if (!joyActive) return; updateJoyFromPoint(e.clientX, e.clientY); });
    document.addEventListener("mouseup", function() { if (!joyActive) return; joyEnd(); });
  }

  var keysHeld = {};
  document.addEventListener("keydown", function(e) {
    var key = e.key.toLowerCase(); keysHeld[key] = true;
    if (key === "i") toggleWindow("window-inventario", "tab-inventario");
    if (key === "p") toggleWindow("window-personaje", "tab-personaje");
    if (key === "k") toggleWindow("window-skills", "tab-skills");
    if (key === "escape") closeAll();
    var x = 0, y = 0;
    if (keysHeld["a"] || keysHeld["arrowleft"]) x -= 1;
    if (keysHeld["d"] || keysHeld["arrowright"]) x += 1;
    if (keysHeld["w"] || keysHeld["arrowup"]) y -= 1;
    if (keysHeld["s"] || keysHeld["arrowdown"]) y += 1;
    if (x !== 0 || y !== 0) { window.moveInput.x = x; window.moveInput.y = y; }
  });
  document.addEventListener("keyup", function(e) {
    var key = e.key.toLowerCase(); keysHeld[key] = false;
    var x = 0, y = 0;
    if (keysHeld["a"] || keysHeld["arrowleft"]) x -= 1;
    if (keysHeld["d"] || keysHeld["arrowright"]) x += 1;
    if (keysHeld["w"] || keysHeld["arrowup"]) y -= 1;
    if (keysHeld["s"] || keysHeld["arrowdown"]) y += 1;
    if (joyActive) return;
    window.moveInput.x = x; window.moveInput.y = y;
  });

  renderInventory();
  renderEquipment();
  if (window.characterReady) { window.characterReady.then(function() { updateUI(); }); } else { setTimeout(updateUI, 500); }
  setInterval(function() { updateUI(); }, 500);
  // Solo se expone update() para dibujar. No se expone inventario/equipo para mutar.
  window.UI = { update: updateUI };
})();
