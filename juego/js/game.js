(() => {
const { isCircleBlocked } = window.ShadowMaze.Maps;
const { createPlayer, updatePlayer } = window.ShadowMaze.Player;
const { createEnemy, updateEnemies } = window.ShadowMaze.Enemies;
const { createParticles, updateEffects } = window.ShadowMaze.Effects;
const { areaAttack, autoSlash, dash, lunge, slowEnemies } = window.ShadowMaze.Attacks;
const { drawGame } = window.ShadowMaze.Renderer;
const { setupControls } = window.ShadowMaze.Input;

const canvas = document.getElementById("gameCanvas");
const context = canvas?.getContext("2d");
if (!canvas || !context) {
    throw new Error("No se encontró el canvas del juego o no se pudo inicializar.");
}

const game = {
    width: 450,
    height: 800,
    map: window.ShadowMaze.Maps.placeholder,
    canvas,
    ctx: context,
    running: false,
    gameOver: false,
    deathPending: false,
    deathTimer: null,
    lastTime: 0,
    elapsed: 0,
    score: 0,
    currentWave: 1,
    waveKills: 0,
    plannedWaveEnemies: 0,
    spawnedWaveEnemies: 0,
    waveSpawnRemaining: 0,
    spawnTimer: 0,
    bonusHealGiven: false,
    keys: { up: false, down: false, left: false, right: false },
    joystickX: 0,
    joystickY: 0,
    player: null,
    enemies: [],
    particles: [],
    attacks: []
};

canvas.width = game.width;
canvas.height = game.height;

const gameArea = document.getElementById("gameArea");
function resizeCanvas() {
    if (!gameArea) return;

    const bounds = gameArea.getBoundingClientRect();
    const scale = Math.min(bounds.width / game.width, bounds.height / game.height);
    if (!Number.isFinite(scale) || scale <= 0) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.style.width = `${game.width * scale}px`;
    canvas.style.height = `${game.height * scale}px`;
    canvas.width = Math.round(game.width * scale * dpr);
    canvas.height = Math.round(game.height * scale * dpr);
    context.setTransform(scale * dpr, 0, 0, scale * dpr, 0, 0);
    drawGame(game);
}

if (typeof ResizeObserver !== "undefined" && gameArea) {
    new ResizeObserver(resizeCanvas).observe(gameArea);
} else {
    window.addEventListener("resize", resizeCanvas);
}

const hpText = document.getElementById("hpText");
const enemyText = document.getElementById("enemyText");
const startOverlay = document.getElementById("startOverlay");
const gameOverOverlay = document.getElementById("gameOverOverlay");
const startButton = document.getElementById("startButton");
const finalScore = document.getElementById("finalScore");
const finalWave = document.getElementById("finalWave");
const actionButtons = [
    { button: document.getElementById("dashButton"), cooldown: () => game.player.dashCooldown },
    { button: document.getElementById("areaButton"), cooldown: () => game.player.areaCooldown },
    { button: document.getElementById("lungeButton"), cooldown: () => game.player.lungeCooldown },
    {
        button: document.getElementById("slowButton"),
        cooldown: () => game.player.slowCooldown,
        label: () => game.player.slowDuration > 0
            ? `LENTO ${Math.ceil(game.player.slowDuration)}s`
            : game.player.slowCooldown > 0
                ? `RECARGA ${Math.ceil(game.player.slowCooldown)}s`
                : "RALENTIZAR"
    }
];

function updateHUD() {
    if (hpText) hpText.textContent = Math.ceil(game.player.hp);
    if (enemyText) {
        enemyText.textContent = game.enemies.filter(enemy => enemy.hp > 0).length;
    }
}

function updateCooldowns() {
    for (const item of actionButtons) {
        if (!item.button) continue;

        item.button.style.opacity = item.cooldown() > 0 ? "0.55" : "1";
        if (item.label) {
            const label = item.button.querySelector("small");
            if (label) label.textContent = item.label();
        }
    }
}

function startWave() {
    game.enemies = [];
    game.waveKills = 0;
    game.spawnedWaveEnemies = 0;
    game.bonusHealGiven = false;

    const enemyGroups = game.currentWave + Math.floor(game.score / 100);
    const normalCount = enemyGroups * 5;
    const fastCount = 1;
    game.plannedWaveEnemies = normalCount + fastCount;
    game.pendingEnemyTypes = [];

    const enemyTypes = [
        ...Array(normalCount).fill("normal"),
        ...Array(fastCount).fill("fast")
    ];
    for (const type of enemyTypes) {
        const enemy = createEnemy(game, type);
        if (enemy) {
            game.enemies.push(enemy);
            game.spawnedWaveEnemies++;
        } else {
            game.pendingEnemyTypes.push(type);
        }
    }

    game.waveSpawnRemaining = game.pendingEnemyTypes.length;
    game.spawnTimer = 0;
    updateHUD();
}

function updateWave(dt) {
    if (game.deathPending) return;

    if (game.waveSpawnRemaining > 0) {
        game.spawnTimer -= dt;
        if (game.spawnTimer <= 0) {
            const type = game.pendingEnemyTypes[0];
            const enemy = createEnemy(game, type);
            if (enemy) {
                game.enemies.push(enemy);
                game.pendingEnemyTypes.shift();
                game.spawnedWaveEnemies++;
                game.waveSpawnRemaining--;
                game.spawnTimer = 0.5;
            } else {
                game.spawnTimer = 1;
            }
        }
    }

    const requiredKills = Math.ceil(game.plannedWaveEnemies * 0.75);
    if (!game.bonusHealGiven && game.waveKills >= requiredKills) {
        game.player.hp = Math.min(game.player.maxHp, game.player.hp + game.player.maxHp * 0.5);
        game.bonusHealGiven = true;
        createParticles(game, game.player.x, game.player.y, "#55ff88", 25);
    }

    const allDead = game.enemies.every(enemy => enemy.hp <= 0);
    if (game.waveSpawnRemaining === 0 && allDead) {
        game.player.hp = game.player.maxHp;
        game.currentWave++;
        createParticles(game, game.player.x, game.player.y, "#55ff88", 35);
        startWave();
    }
}

function resetGame() {
    if (game.deathTimer !== null) {
        clearTimeout(game.deathTimer);
        game.deathTimer = null;
    }

    game.player = createPlayer(game.width, game.height);
    game.enemies = [];
    game.particles = [];
    game.attacks = [];
    game.elapsed = 0;
    game.score = 0;
    game.currentWave = 1;
    game.waveKills = 0;
    game.plannedWaveEnemies = 0;
    game.spawnedWaveEnemies = 0;
    game.waveSpawnRemaining = 0;
    game.pendingEnemyTypes = [];
    game.spawnTimer = 0;
    game.bonusHealGiven = false;
    game.deathPending = false;
    game.gameOver = false;

    Object.keys(game.keys).forEach(key => {
        game.keys[key] = false;
    });
    game.joystickX = 0;
    game.joystickY = 0;

    gameOverOverlay?.classList.add("hidden");
    startWave();
    updateHUD();
}

function endGame() {
    if (game.gameOver || game.deathPending) return;

    game.running = false;
    game.deathPending = true;
    game.deathTimer = setTimeout(() => {
        game.gameOver = true;
        game.deathPending = false;
        if (finalScore) finalScore.textContent = String(game.score);
        if (finalWave) finalWave.textContent = String(game.currentWave);
        gameOverOverlay?.classList.remove("hidden");
        game.deathTimer = null;
    }, 1750);
}

function damagePlayer(damage) {
    if (game.player.invincible > 0 || game.deathPending) return;

    game.player.hp = Math.max(0, game.player.hp - damage);
    updateHUD();

    if (game.player.hp <= 0) endGame();
}

function startGame() {
    resetGame();
    game.running = true;
    if (startOverlay) startOverlay.style.display = "none";
    gameOverOverlay?.classList.add("hidden");
    game.lastTime = performance.now();
    drawGame(game);
}

const actions = {
    dash: () => dash(game),
    areaAttack: () => areaAttack(game),
    lunge: () => lunge(game),
    slowEnemies: () => slowEnemies(game)
};

setupControls(game, actions);
startButton?.addEventListener("click", startGame);
document.getElementById("restartButton")?.addEventListener("click", startGame);

function loop(timestamp) {
    requestAnimationFrame(loop);
    if (!game.running || game.gameOver || game.deathPending) return;

    const dt = Math.min((timestamp - game.lastTime) / 1000, 0.033);
    game.lastTime = timestamp;
    game.elapsed += dt;

    updatePlayer(game, dt);
    autoSlash(game);
    updateEnemies(game, dt, damagePlayer, (x, y, color, amount) => {
        createParticles(game, x, y, color, amount);
    });
    updateWave(dt);
    updateEffects(game, dt);
    updateHUD();
    updateCooldowns();
    drawGame(game);
}

resetGame();
resizeCanvas();
drawGame(game);
requestAnimationFrame(loop);
})();
