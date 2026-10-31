(() => {

function createEnemy(game, type = "normal") {
    const radius = 13;
    let position = null;
    for (let attempt = 0; attempt < 250; attempt++) {
        const x = 35 + Math.random() * (game.width - 70);
        const y = 50 + Math.random() * (game.height - 100);
        const overlapsEnemy = game.enemies.some(enemy =>
            enemy.hp > 0 &&
            Math.hypot(x - enemy.x, y - enemy.y) < radius + enemy.radius + 1
        );

        if (
            Math.hypot(x - game.player.x, y - game.player.y) >= 150 &&
            !window.ShadowMaze.Maps.isCircleBlocked(game.map, x, y, radius) &&
            !overlapsEnemy
        ) {
            position = { x, y };
            break;
        }
    }

    if (!position) return null;

    const baseSpeed = 55 + Math.random() * 15;

    return {
        type,
        x: position.x,
        y: position.y,
        radius,
        speed: baseSpeed * (type === "fast" ? 1.25 : 1),
        hp: 60,
        maxHp: 60,
        damage: 5,
        detectionRange: 320,
        attackCooldown: 0,
        attackState: "normal",
        attackTimer: 0,
        wanderTimer: 0,
        wanderX: 0,
        wanderY: 0,
        countedAsDead: false
    };
}

function canMoveTo(game, movingEnemy, x, y) {
    if (window.ShadowMaze.Maps.isCircleBlocked(game.map, x, y, movingEnemy.radius)) {
        return false;
    }

    return !game.enemies.some(enemy =>
        enemy !== movingEnemy &&
        enemy.hp > 0 &&
        Math.hypot(x - enemy.x, y - enemy.y) < movingEnemy.radius + enemy.radius + 1
    );
}

function updateEnemies(game, dt, damagePlayer, createParticles) {
    for (const enemy of game.enemies) {
        if (enemy.hp <= 0 || game.deathPending) continue;

        const behavior = window.ShadowMaze.Enemies.updateEnemyBehavior(enemy, game.player, dt);
        const speedMultiplier = game.player.slowDuration > 0
            ? 0.25
            : game.player.isMoving ? 1 : 0.5;
        const speed = enemy.speed * speedMultiplier;
        const nextX = enemy.x + behavior.x * speed * dt;
        if (canMoveTo(game, enemy, nextX, enemy.y)) {
            enemy.x = nextX;
        } else {
            enemy.wanderX *= -1;
        }

        const nextY = enemy.y + behavior.y * speed * dt;
        if (canMoveTo(game, enemy, enemy.x, nextY)) {
            enemy.y = nextY;
        } else {
            enemy.wanderY *= -1;
        }
        const distanceToPlayer = Math.hypot(game.player.x - enemy.x, game.player.y - enemy.y);
        const attackRange = game.player.radius + enemy.radius + 8;

        if (enemy.attackState === "normal") {
            enemy.attackCooldown = Math.max(0, enemy.attackCooldown - dt);
            if (distanceToPlayer <= attackRange && enemy.attackCooldown <= 0) {
                enemy.attackState = "preparing";
                enemy.attackTimer = 0.45;
            }
        } else if (enemy.attackState === "preparing") {
            enemy.attackTimer -= dt;
            if (enemy.attackTimer <= 0) {
                if (game.player.invincible <= 0) {
                    damagePlayer(enemy.damage);
                    createParticles(game.player.x, game.player.y, "#ff3333", 10);
                }

                enemy.attackState = "attacking";
                enemy.attackTimer = 0.18;
                enemy.attackCooldown = 6;
            }
        } else {
            enemy.attackTimer -= dt;
            if (enemy.attackTimer <= 0) enemy.attackState = "normal";
        }

        enemy.x = Math.max(enemy.radius, Math.min(game.width - enemy.radius, enemy.x));
        enemy.y = Math.max(enemy.radius, Math.min(game.height - enemy.radius, enemy.y));
    }
}

Object.assign(window.ShadowMaze.Enemies, { createEnemy, updateEnemies });
})();
