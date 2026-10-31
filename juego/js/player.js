(() => {
function createPlayer(width, height) {
    return {
        x: width / 2,
        y: height / 2,
        radius: 15,
        speed: 175,
        isMoving: false,
        hp: 100,
        maxHp: 100,
        grabbed: false,
        grabbedBy: null,
        faceX: 0,
        faceY: -1,
        dashing: false,
        dashTime: 0,
        dashX: 0,
        dashY: -1,
        dashCooldown: 0,
        slashCooldown: 0,
        areaCooldown: 0,
        lungeCooldown: 0,
        slowDuration: 0,
        slowCooldown: 0,
        invincible: 0
    };
}

function getMovementVector(game) {
    let moveX = game.joystickX;
    let moveY = game.joystickY;

    if (game.keys.left) moveX -= 1;
    if (game.keys.right) moveX += 1;
    if (game.keys.up) moveY -= 1;
    if (game.keys.down) moveY += 1;

    const length = Math.hypot(moveX, moveY);
    if (length > 1) {
        moveX /= length;
        moveY /= length;
    }

    return { x: moveX, y: moveY, length };
}

function updatePlayer(game, dt) {
    const { player } = game;
    const startX = player.x;
    const startY = player.y;
    const movement = player.grabbed
        ? { x: 0, y: 0, length: 0 }
        : getMovementVector(game);

    if (movement.length > 0) {
        player.faceX = movement.x;
        player.faceY = movement.y;
    }

    let moveX = movement.x;
    let moveY = movement.y;
    let speed = player.speed;

    if (player.dashing) {
        moveX = player.dashX;
        moveY = player.dashY;
        speed *= 2.5;
        player.dashTime -= dt;

        if (player.dashTime <= 0) {
            player.dashing = false;
        }
    }

    const deltaX = moveX * speed * dt;
    const deltaY = moveY * speed * dt;
    const steps = Math.max(1, Math.ceil(Math.hypot(deltaX, deltaY) / (player.radius / 2)));
    const stepX = deltaX / steps;
    const stepY = deltaY / steps;

    for (let step = 0; step < steps; step++) {
        const nextX = player.x + stepX;
        if (!window.ShadowMaze.Maps.isCircleBlocked(game.map, nextX, player.y, player.radius)) {
            player.x = nextX;
        }

        const nextY = player.y + stepY;
        if (!window.ShadowMaze.Maps.isCircleBlocked(game.map, player.x, nextY, player.radius)) {
            player.y = nextY;
        }
    }

    player.x = Math.max(player.radius, Math.min(game.width - player.radius, player.x));
    player.y = Math.max(player.radius, Math.min(game.height - player.radius, player.y));
    player.isMoving = Math.hypot(player.x - startX, player.y - startY) > 0.01;

    player.dashCooldown = Math.max(0, player.dashCooldown - dt);
    player.slashCooldown = Math.max(0, player.slashCooldown - dt);
    player.areaCooldown = Math.max(0, player.areaCooldown - dt);
    player.lungeCooldown = Math.max(0, player.lungeCooldown - dt);
    player.slowDuration = Math.max(0, player.slowDuration - dt);
    player.slowCooldown = Math.max(0, player.slowCooldown - dt);
    player.invincible = Math.max(0, player.invincible - dt);
}

window.ShadowMaze = window.ShadowMaze || {};
window.ShadowMaze.Player = { createPlayer, getMovementVector, updatePlayer };
})();
