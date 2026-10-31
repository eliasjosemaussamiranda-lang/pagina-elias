(() => {

function damageEnemy(game, enemy, damage) {
    if (enemy.hp <= 0) return;

    enemy.hp = Math.max(0, enemy.hp - damage);
    window.ShadowMaze.Effects.createParticles(game, enemy.x, enemy.y, "#ff6666", 6);

    if (enemy.hp === 0 && !enemy.countedAsDead) {
        enemy.countedAsDead = true;
        game.waveKills++;
        game.score += 10;
        window.ShadowMaze.Effects.createParticles(game, enemy.x, enemy.y, "#ffffff", 15);
    }
}

function dash(game) {
    if (!game.running || game.gameOver || (game.player.dashCooldown > 0 && !game.player.grabbed)) return;

    const movement = window.ShadowMaze.Player.getMovementVector(game);
    const length = Math.hypot(movement.x, movement.y);
    const grabbingEnemy = game.player.grabbedBy;
    game.player.grabbed = false;
    game.player.grabbedBy = null;
    if (grabbingEnemy) {
        grabbingEnemy.attackState = "normal";
        grabbingEnemy.attackCooldown = 1.5;
    }
    game.player.dashX = length > 0.1 ? movement.x / length : game.player.faceX;
    game.player.dashY = length > 0.1 ? movement.y / length : game.player.faceY;
    game.player.dashing = true;
    game.player.dashTime = 0.5;
    game.player.dashCooldown = 2.5;
    game.player.invincible = 0.5;
    window.ShadowMaze.Effects.createParticles(game, game.player.x, game.player.y, "#66ddff", 12);
}

function slash(game, target) {
    if (!game.running || game.gameOver || game.player.grabbed || game.player.slashCooldown > 0) return;

    const directionX = target.x - game.player.x;
    const directionY = target.y - game.player.y;
    const directionLength = Math.hypot(directionX, directionY) || 1;
    game.player.faceX = directionX / directionLength;
    game.player.faceY = directionY / directionLength;

    game.player.slashCooldown = 0.85;
    game.attacks.push({
        x: game.player.x,
        y: game.player.y,
        type: "slash",
        time: 0.18,
        followPlayer: true,
        directionX: game.player.faceX,
        directionY: game.player.faceY
    });

    const minimumDot = Math.cos(0.8);
    for (const enemy of game.enemies) {
        const dx = enemy.x - game.player.x;
        const dy = enemy.y - game.player.y;
        const distance = Math.hypot(dx, dy);
        const dot = (dx / (distance || 1)) * game.player.faceX +
            (dy / (distance || 1)) * game.player.faceY;

        if (distance <= 75 + enemy.radius && dot >= minimumDot) {
            damageEnemy(game, enemy, 25);
        }
    }
}

function autoSlash(game) {
    if (!game.running || game.gameOver || game.player.grabbed || game.player.slashCooldown > 0) return;

    let target = null;
    let nearestDistance = Infinity;
    for (const enemy of game.enemies) {
        if (enemy.hp <= 0) continue;

        const distance = Math.hypot(enemy.x - game.player.x, enemy.y - game.player.y);
        if (distance <= 75 + enemy.radius && distance < nearestDistance) {
            target = enemy;
            nearestDistance = distance;
        }
    }

    if (target) slash(game, target);
}

function slowEnemies(game) {
    if (!game.running || game.gameOver || game.player.grabbed || game.player.slowCooldown > 0) return;

    game.player.slowDuration = 10;
    game.player.slowCooldown = 15;
    window.ShadowMaze.Effects.createParticles(game, game.player.x, game.player.y, "#80eaff", 24);
}

function areaAttack(game) {
    if (!game.running || game.gameOver || game.player.grabbed || game.player.areaCooldown > 0) return;

    game.player.areaCooldown = 3;
    game.attacks.push({
        x: game.player.x,
        y: game.player.y,
        type: "area",
        time: 0.35
    });

    for (const enemy of game.enemies) {
        if (Math.hypot(enemy.x - game.player.x, enemy.y - game.player.y) <= 110 + enemy.radius) {
            damageEnemy(game, enemy, 25);
        }
    }

    window.ShadowMaze.Effects.createParticles(game, game.player.x, game.player.y, "#bb77ff", 24);
}

function lunge(game) {
    if (!game.running || game.gameOver || game.player.grabbed || game.player.lungeCooldown > 0) return;

    game.player.lungeCooldown = 1.5;
    const startX = game.player.x;
    const startY = game.player.y;
    game.player.x += game.player.faceX * 85;
    game.player.y += game.player.faceY * 85;
    game.player.x = Math.max(game.player.radius, Math.min(game.width - game.player.radius, game.player.x));
    game.player.y = Math.max(game.player.radius, Math.min(game.height - game.player.radius, game.player.y));
    const endX = game.player.x;
    const endY = game.player.y;
    game.attacks.push({
        type: "lunge",
        x: startX,
        y: startY,
        endX,
        endY,
        time: 0.16
    });

    for (const enemy of game.enemies) {
        const segmentX = endX - startX;
        const segmentY = endY - startY;
        const segmentLengthSquared = segmentX * segmentX + segmentY * segmentY;
        const projection = segmentLengthSquared === 0
            ? 0
            : Math.max(0, Math.min(1, ((enemy.x - startX) * segmentX + (enemy.y - startY) * segmentY) / segmentLengthSquared));
        const closestX = startX + projection * segmentX;
        const closestY = startY + projection * segmentY;

        if (Math.hypot(enemy.x - closestX, enemy.y - closestY) <= 20 + enemy.radius) {
            damageEnemy(game, enemy, 40);
        }
    }

    window.ShadowMaze.Effects.createParticles(game, game.player.x, game.player.y, "#ffdd66", 10);
}

window.ShadowMaze = window.ShadowMaze || {};
window.ShadowMaze.Attacks = { damageEnemy, dash, autoSlash, areaAttack, lunge, slowEnemies };
})();
