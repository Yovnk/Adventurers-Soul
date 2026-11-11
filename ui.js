// ui.js
// UI generica. No diferencia clases.
// Muestra el personaje que cargo characterdata.js.
// 11 slots iguales, todos vacios. Inventario vacio.
// El item que dropee / craftee llena los slots.

(function() {

  // El personaje activo es el que venga de characterdata.js
  // No se cambia de clase desde la UI.
  function getCharacter() {
    if (window.currentCharacter) return window.currentCharacter;
    if (window.paladin) return window.paladin;
    return null;
  }

  // Movimiento: lo lee main.js para mover al personaje
  // x: -1 izquierda, 1 derecha. y: -1 arriba, 1 abajo
  window.moveInput = { x: 0, y: 0 };

  // ===== ESTILOS =====
  var css = "";
  css += "* { margin:0; padding:0; box-sizing:border-box; font-family: Tahoma, Arial, sans-serif; -webkit-tap-highlight-color: transparent; }";
  css += "body { background:#0a0a0f; overflow:hidden; color:#fff; }";
  css += "#game-world { width:100vw; height:100vh; position:relative; background:#1a2a1a; }";
  css += "#game-canvas { width:100%; height:100%; display:block; background:#2a4a2a; }";
  css += "#hud { position:absolute; top:0; left:0; width:100%; height:100%; pointer-events:none; }";
  css += "#hud-top-left { position:absolute; top:10px; left:10px; width:300px; max-width:42vw; background:rgba(0,0,0,0.65); border:2px solid #555; border-radius:8px; padding:8px 10px; pointer-events:auto; }";
  css += "#hud-name { font-size:15px; font-weight:bold; color:#ffd700; }";
  css += "#hud-class { font-size:11px; color:#aaa; margin-bottom:6px; }";
  css += ".bar-label { font-size:11px; display:flex; justify-content:space-between; margin-top:3px; }";
  css += ".bar-bg { width:100%; height:16px; background:#222; border:1px solid #000; border-radius:4px; overflow:hidden; margin-top:2px; }";
  css += "#hp-fill { height:100%; width:100%; background:linear-gradient(90deg,#d32f2f,#ff5252); }";
  css += "#mp-fill { height:100%; width:100%; background:linear-gradient(90deg,#1976d2,#42a5f5); }";
  css += "#hud-bottom-center { position:absolute; bottom:10px; left:50%; transform:translateX(-50%); display:flex; gap:8px; pointer-events:auto; background:rgba(0,0,0,0.6); border:2px solid #555; border-radius:20px; padding:6px; }";
  css += ".tab-btn { background:#2a2a35; border:2px solid #666; color:#fff; padding:10px 14px; border-radius:14px; cursor:pointer; font-weight:bold; font-size:13px; white-space:nowrap; }";
  css += ".tab-btn.active { background:#ffd700; color:#000; border-color:#ffd700; }";
  css += "#hud-bottom-right { position:absolute; bottom:10px; right:10px; width:210px; height:210px; pointer-events:auto; }";
  css += ".skill-btn { position:absolute; width:52px; height:52px; border-radius:50%; background:#222; border:2px solid #888; color:#fff; font-size:11px; font-weight:bold; display:flex; align-items:center; justify-content:center; text-align:center; cursor:pointer; }";
  css += ".skill-btn:active { transform:scale(0.92); }";
  css += ".skill-btn.empty { opacity:0.45; }";
  css += "#btn-basic { position:absolute; right:0; bottom:0; width:86px; height:86px; border-radius:50%; background:radial-gradient(circle at 30% 30%, #ff7043, #bf360c); border:3px solid #fff; color:#fff; font-size:14px; font-weight:bold; cursor:pointer; box-shadow:0 0 12px rgba(0,0,0,0.6); }";
  css += "#btn-basic:active { transform:scale(0.93); }";
  css += "#skill-1 { left:0; top:20px; }";
  css += "#skill-2 { left:58px; top:0; }";
  css += "#skill-3 { left:118px; top:8px; }";
  css += "#skill-4 { left:10px; top:92px; }";
  css += "#skill-5 { left:68px; top:72px; }";
  css += "#skill-6 { left:118px; top:78px; }";
  css += ".window { position:absolute; background:#e8e0d0; color:#222; border:3px solid #7a6a4a; border-radius:8px; box-shadow:0 0 20px rgba(0,0,0,0.7); display:none; pointer-events:auto; z-index:10; }";
  css += ".window.open { display:block; }";
  css += ".window-header { background:#3a3a5a; color:#fff; padding:8px 12px; font-weight:bold; display:flex; justify-content:space-between; align-items:center; border-radius:5px 5px 0 0; }";
  css += ".window-close { background:#c62828; border:none; color:#fff; width:24px; height:24px; border-radius:4px; cursor:pointer; font-weight:bold; }";
  css += ".window-body { padding:12px; overflow-y:auto; max-height:72vh; }";
  css += "#window-personaje { top:50%; left:50%; transform:translate(-50%,-50%); width:680px; max-width:94vw; }";
  css += "#personaje-layout { display:flex; gap:14px; }";
  css += "#equip-grid { display:grid; grid-template-columns:1fr 1fr; gap:8px; width:260px; flex-shrink:0; }";
  css += ".equip-slot { background:#fff; border:2px solid #999; border-radius:6px; padding:8px; min-height:52px; cursor:pointer; }";
  css += ".equip-slot.selected { border-color:#1976d2; background:#e3f2fd; }";
  css += ".equip-slot-name { font-size:11px; color:#888; }";
  css += ".equip-slot-item { font-size:13px; font-weight:bold; }";
  css += ".equip-slot-empty { font-size:12px; color:#bbb; }";
  css += "#stats-col { flex:1; }";
  css += ".stat-section { background:#3a3a5a; color:#fff; padding:5px 8px; margin:0 0 6px 0; font-size:12px; font-weight:bold; }";
  css += ".stat-row { display:flex; justify-content:space-between; padding:3px 0; border-bottom:1px solid #ccc; font-size:13px; }";
  css += "#window-inventario { top:50%; left:50%; transform:translate(-50%,-50%); width:480px; max-width:94vw; }";
  css += "#inv-grid { display:grid; grid-template-columns:repeat(6,1fr); gap:6px; }";
  css += ".inv-slot { width:100%; aspect-ratio:1; background:#fff; border:2px solid #999; border-radius:4px; display:flex; align-items:center; justify-content:center; cursor:pointer; font-size:20px; }";
  css += ".inv-slot.selected { border-color:#1976d2; background:#e3f2fd; }";
  css += "#inv-info { margin-top:10px; font-size:12px; min-height:18px; color:#555; }";
  css += "#window-skills { top:50%; left:50%; transform:translate(-50%,-50%); width:420px; max-width:94vw; }";
  css += ".skill-row { display:flex; justify-content:space-between; padding:8px; background:#fff; border:1px solid #ccc; border-radius:4px; margin-bottom:6px; font-size:13px; }";
  css += "#skills-empty { font-size:13px; color:#666; text-align:center; padding:14px 0; }";
  css += "#joypad { position:absolute; bottom:10px; left:10px; width:150px; height:150px; pointer-events:auto; z-index:5; }";
  css += ".joy-btn { position:absolute; width:52px; height:52px; border-radius:50%; background:rgba(0,0,0,0.55); border:2px solid rgba(255,255,255,0.6); color:#fff; font-size:22px; font-weight:bold; display:flex; align-items:center; justify-content:center; cursor:pointer; user-select:none; touch-action:none; }";
  css += ".joy-btn:active { background:rgba(255,215,0,0.7); color:#000; }";
  css += "#joy-up { left:49px; top:0; }";
  css += "#joy-down { left:49px; bottom:0; }";
  css += "#joy-left { left:0; top:49px; }";
  css += "#joy-right { right:0; top:49px; }";
  css += "@media (max-height:450px) { #hud-top-left { width:230px; } #hud-bottom-right { width:170px; height:170px; transform:scale(0.85); transform-origin:bottom right; } #window-personaje { width:94vw; } #joypad { transform:scale(0.85); transform-origin:bottom left; } }";

  var style = document.createElement("style");
  style.textContent = css;
  document.head.appendChild(style);

  // ===== HTML =====
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

  // ===== 11 SLOTS - IGUALES PARA TODOS =====
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
  for (var i = 0; i < 24; i++) { inventory.push(null); }

  var selectedEquipKey = null;

  function setText(id, val) {
    var el = document.getElementById(id);
    if (el) el.textContent = val;
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
      if (skills[k - 1]) {
        btn.textContent = skills[k - 1].name;
        btn.classList.remove("empty");
      } else {
        btn.textContent = "Skill " + k;
        btn.classList.add("empty");
      }
    }
  }

  function updateUI() {
    var c = getCharacter();
    if (!c) return;
    var p = c.primary;
    var s = c.secondary;
    setText("hud-name", c.className);
    setText("hud-class", "Nv. 1 - " + c.className);
    setText("personaje-title", "Personaje - " + c.className);
    setText("hp-text", Math.floor(c.hp) + " / " + s.maxHP);
    setText("mp-text", Math.floor(c.mp) + " / " + s.maxMP);
    var hpFill = document.getElementById("hp-fill");
    var mpFill = document.getElementById("mp-fill");
    if (hpFill) hpFill.style.width = (c.hp / s.maxHP * 100) + "%";
    if (mpFill) mpFill.style.width = (c.mp / s.maxMP * 100) + "%";
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
  function toggleWindow(id, tabId) {
    var el = document.getElementById(id);
    var wasOpen = el.classList.contains("open");
    closeAll();
    if (!wasOpen) {
      el.classList.add("open");
      var tab = document.getElementById(tabId);
      if (tab) tab.classList.add("active");
    }
  }

  document.getElementById("tab-inventario").onclick = function() { toggleWindow("window-inventario", "tab-inventario"); };
  document.getElementById("tab-personaje").onclick = function() { toggleWindow("window-personaje", "tab-personaje"); };
  document.getElementById("tab-skills").onclick = function() { toggleWindow("window-skills", "tab-skills"); };
  document.getElementById("close-personaje").onclick = function() { closeAll(); };
  document.getElementById("close-inventario").onclick = function() { closeAll(); };
  document.getElementById("close-skills").onclick = function() { closeAll(); };

  document.getElementById("btn-basic").onclick = function() {
    if (window.onBasicAttack) window.onBasicAttack();
  };
  for (var k = 1; k <= 6; k++) {
    (function(n) {
      document.getElementById("skill-" + n).onclick = function() {
        if (window.onSkill) window.onSkill(n);
      };
    })(k);
  }

  // ===== PAD DE MOVIMIENTO =====
  var joyHeld = { up: false, down: false, left: false, right: false };
  function updateMoveInput() {
    var x = 0, y = 0;
    if (joyHeld.left) x -= 1;
    if (joyHeld.right) x += 1;
    if (joyHeld.up) y -= 1;
    if (joyHeld.down) y += 1;
    window.moveInput.x = x;
    window.moveInput.y = y;
  }
  function bindJoy(id, keyName) {
    var btn = document.getElementById(id);
    if (!btn) return;
    function start(e) { if (e) e.preventDefault(); joyHeld[keyName] = true; updateMoveInput(); }
    function end(e) { if (e) e.preventDefault(); joyHeld[keyName] = false; updateMoveInput(); }
    btn.addEventListener("touchstart", start, { passive: false });
    btn.addEventListener("touchend", end, { passive: false });
    btn.addEventListener("touchcancel", end, { passive: false });
    btn.addEventListener("mousedown", start);
    btn.addEventListener("mouseup", end);
    btn.addEventListener("mouseleave", end);
  }
  bindJoy("joy-up", "up");
  bindJoy("joy-down", "down");
  bindJoy("joy-left", "left");
  bindJoy("joy-right", "right");

  // Teclado para probar en PC: WASD y flechas
  var keysHeld = {};
  document.addEventListener("keydown", function(e) {
    var key = e.key.toLowerCase();
    keysHeld[key] = true;
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
    var key = e.key.toLowerCase();
    keysHeld[key] = false;
    var x = 0, y = 0;
    if (keysHeld["a"] || keysHeld["arrowleft"]) x -= 1;
    if (keysHeld["d"] || keysHeld["arrowright"]) x += 1;
    if (keysHeld["w"] || keysHeld["arrowup"]) y -= 1;
    if (keysHeld["s"] || keysHeld["arrowdown"]) y += 1;
    if (joyHeld.up || joyHeld.down || joyHeld.left || joyHeld.right) { updateMoveInput(); return; }
    window.moveInput.x = x;
    window.moveInput.y = y;
  });

  renderInventory();
  renderEquipment();

  if (window.characterReady) {
    window.characterReady.then(function() { updateUI(); });
  } else {
    setTimeout(updateUI, 500);
  }
  setInterval(updateUI, 500);

  window.UI = {
    update: updateUI,
    equipment: equipment,
    inventory: inventory,
    closeAll: closeAll
  };

})();
