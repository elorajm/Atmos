// game.js
// Storm Dodge – cute weather dodge game with an umbrella and falling raindrops

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const scoreEl = document.getElementById('score');
const bestScoreEl = document.getElementById('bestScore');
const overlay = document.getElementById('overlay');
const overlayTitle = document.getElementById('overlay-title');
const overlayMessage = document.getElementById('overlay-message');
const startBtn = document.getElementById('startBtn');

// MOBILE control buttons
const mobileLeft = document.getElementById("mobile-left");
const mobileRight = document.getElementById("mobile-right");
const mobileStart = document.getElementById("mobile-start");

// Game state
let player;
let raindrops = [];
let lastTime = 0;
let spawnTimer = 0;
let score = 0;
let bestScore = 0;
let gameRunning = false;

// Input
const keys = {
  ArrowLeft: false,
  ArrowRight: false,
};

// Load best score
try {
  const storedBest = localStorage.getItem('atmos:stormdodge:best');
  if (storedBest) {
    bestScore = parseInt(storedBest, 10) || 0;
    bestScoreEl.textContent = bestScore;
  }
} catch (_) {
  // ignore
}

// Create player
function createPlayer() {
  const width = 60;
  const height = 20;
  return {
    x: canvas.width / 2 - width / 2,
    y: canvas.height - 60,
    width,
    height,
    speed: 260,
  };
}

// Raindrop generator
function createRaindrop() {
  const size = 12 + Math.random() * 10;
  return {
    x: Math.random() * (canvas.width - size),
    y: -size,
    radius: size / 2,
    speed: 120 + Math.random() * 120,
  };
}

function resetGame() {
  player = createPlayer();
  raindrops = [];
  score = 0;
  scoreEl.textContent = '0';
  spawnTimer = 0;
  lastTime = 0;
}

// Drawing functions
function drawBackground() {}

function drawPlayer() {
  ctx.save();
  ctx.translate(player.x + player.width / 2, player.y + player.height / 2);

  const umbrellaRadius = player.width / 1.2;
  ctx.beginPath();
  ctx.arc(0, 0, umbrellaRadius, Math.PI, 2 * Math.PI);
  ctx.fillStyle = '#f97316';
  ctx.fill();

  const scallops = 4;
  for (let i = 0; i < scallops; i++) {
    const angle = Math.PI + (i * Math.PI) / scallops;
    ctx.beginPath();
    ctx.arc(
      Math.cos(angle) * umbrellaRadius * 0.6,
      Math.sin(angle) * umbrellaRadius * 0.4 + 3,
      6,
      0,
      2 * Math.PI
    );
    ctx.fillStyle = '#fb923c';
    ctx.fill();
  }

  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, 30);
  ctx.strokeStyle = '#111827';
  ctx.lineWidth = 4;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(6, 30, 6, Math.PI / 2, (3 * Math.PI) / 2, true);
  ctx.stroke();

  ctx.restore();
}

function drawRaindrop(drop) {
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(drop.x + drop.radius, drop.y);
  ctx.quadraticCurveTo(
    drop.x + drop.radius * 1.5,
    drop.y + drop.radius,
    drop.x + drop.radius,
    drop.y + drop.radius * 2
  );
  ctx.quadraticCurveTo(
    drop.x,
    drop.y + drop.radius,
    drop.x + drop.radius,
    drop.y
  );
  ctx.fillStyle = '#38bdf8';
  ctx.fill();
  ctx.restore();
}

function updatePlayer(dt) {
  if (keys.ArrowLeft) player.x -= player.speed * dt;
  if (keys.ArrowRight) player.x += player.speed * dt;

  if (player.x < 0) player.x = 0;
  if (player.x + player.width > canvas.width) {
    player.x = canvas.width - player.width;
  }
}

function updateRaindrops(dt) {
  spawnTimer += dt;
  const spawnInterval = Math.max(0.35, 0.9 - score / 3000);

  if (spawnTimer >= spawnInterval) {
    raindrops.push(createRaindrop());
    spawnTimer = 0;
  }

  raindrops.forEach((drop) => {
    drop.y += drop.speed * dt;
  });

  raindrops = raindrops.filter((drop) => drop.y - drop.radius <= canvas.height + 10);
}

function checkCollisions() {
  for (const drop of raindrops) {
    const dx = (drop.x + drop.radius) - (player.x + player.width / 2);
    const dy = (drop.y + drop.radius) - player.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < drop.radius + 18) {
      endGame();
      break;
    }
  }
}

function updateScore(dt) {
  score += dt * 100;
  const displayScore = Math.floor(score);
  scoreEl.textContent = displayScore;

  if (displayScore > bestScore) {
    bestScore = displayScore;
    bestScoreEl.textContent = bestScore;
    try {
      localStorage.setItem('atmos:stormdodge:best', String(bestScore));
    } catch (_) {}
  }
}

function gameLoop(timestamp) {
  if (!gameRunning) return;

  const dt = (timestamp - lastTime) / 1000 || 0;
  lastTime = timestamp;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBackground();

  updatePlayer(dt);
  updateRaindrops(dt);
  checkCollisions();
  updateScore(dt);

  drawPlayer();
  raindrops.forEach(drawRaindrop);

  requestAnimationFrame(gameLoop);
}

function startGame() {
  resetGame();
  gameRunning = true;
  overlay.style.display = 'none';
  if (mobileStart) mobileStart.disabled = true;
  requestAnimationFrame(gameLoop);
}

function endGame() {
  gameRunning = false;

  overlayTitle.textContent = 'Game Over';
  overlayMessage.textContent = `You scored ${Math.floor(score)} points!`;
  startBtn.textContent = 'Play Again';
  overlay.style.display = 'flex';

  if (mobileStart) mobileStart.disabled = false;

  keys.ArrowLeft = false;
  keys.ArrowRight = false;
}

// Desktop key controls
window.addEventListener('keydown', (e) => {
  if (e.key in keys) keys[e.key] = true;
});

window.addEventListener('keyup', (e) => {
  if (e.key in keys) keys[e.key] = false;
});

// Desktop start button
startBtn.addEventListener('click', () => {
  overlayTitle.textContent = 'Storm Dodge';
  overlayMessage.textContent = 'Use arrows or mobile buttons to dodge raindrops!';
  startGame();
});

// ------------------------------------------------------------
// MOBILE TOUCH CONTROLS
// ------------------------------------------------------------

if (mobileLeft && mobileRight) {
  // Hold left
  mobileLeft.addEventListener("touchstart", () => {
    if (gameRunning) keys.ArrowLeft = true;
  });

  mobileLeft.addEventListener("touchend", () => {
    keys.ArrowLeft = false;
  });

  // Hold right
  mobileRight.addEventListener("touchstart", () => {
    if (gameRunning) keys.ArrowRight = true;
  });

  mobileRight.addEventListener("touchend", () => {
    keys.ArrowRight = false;
  });
}

// Mobile start button
if (mobileStart) {
  mobileStart.addEventListener("click", () => {
    overlay.style.display = "none";
    startGame();
  });
}

// Initialize
resetGame();
