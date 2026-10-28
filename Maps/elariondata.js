<canvas id="game" width="800" height="600"></canvas>
<script>
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const TILE = 32;
const MAP_W = 120;
const MAP_H = 120;
const MAP_PX = 3840; // 120*32

const mapImg = new Image();
mapImg.src = 'Maps/elarion.jpg'; // tu jpg 120x120

let player = { x: 60 * TILE, y: 105 * TILE }; // spawn abajo cerca de la puerta
let camera = { x: 0, y: 0 };

function updateCamera() {
  camera.x = player.x - canvas.width / 2;
  camera.y = player.y - canvas.height / 2;
  // Limites para no salir del mapa
  camera.x = Math.max(0, Math.min(camera.x, MAP_PX - canvas.width));
  camera.y = Math.max(0, Math.min(camera.y, MAP_PX - canvas.height));
}

function loop() {
  updateCamera();
  ctx.clearRect(0,0,canvas.width, canvas.height);
  
  // Dibuja solo lo que ve la camara
  ctx.drawImage(
    mapImg,
    camera.x, camera.y, canvas.width, canvas.height,
    0, 0, canvas.width, canvas.height
  );

  // Jugador (cuadrito rojo por ahora)
  ctx.fillStyle = 'red';
  ctx.fillRect(
    player.x - camera.x - 8,
    player.y - camera.y - 8,
    16, 16
  );

  requestAnimationFrame(loop);
}

mapImg.onload = () => {
  loop();
};

// Movimiento simple WASD
window.addEventListener('keydown', e => {
  if(e.key === 'w') player.y -= TILE/4;
  if(e.key === 's') player.y += TILE/4;
  if(e.key === 'a') player.x -= TILE/4;
  if(e.key === 'd') player.x += TILE/4;
});
</script>
