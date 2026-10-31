(() => {
function drawBackground(game) {
    const { ctx, width, height } = game;
    const { map } = game;
    const tileSize = map.tileSize;
    ctx.fillStyle = "#10121b";
    ctx.fillRect(0, 0, width, height);

    for (let row = 0; row < map.tiles.length; row++) {
        for (let column = 0; column < map.tiles[row].length; column++) {
            const tile = map.tiles[row][column];
            const x = column * tileSize;
            const y = row * tileSize;
            const textureName = tile === "#" ? map.textures.wall
                : tile === "~" ? map.textures.water
                    : map.textures.floor;
            const texture = window.ShadowMaze.Assets.getTexture(textureName);

            if (texture) {
                ctx.drawImage(texture, x, y, tileSize, tileSize);
            } else if (tile === "#") {
                ctx.fillStyle = "#46506a";
                ctx.fillRect(x, y, tileSize, tileSize);
            } else if (tile === "~") {
                ctx.fillStyle = "#173b56";
                ctx.fillRect(x, y, tileSize, tileSize);
            }
        }
    }

    ctx.strokeStyle = "#202433";
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += tileSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
    }
    for (let y = 0; y < height; y += tileSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
    }

    ctx.strokeStyle = "#444c63";
    ctx.lineWidth = 4;
    ctx.strokeRect(2, 2, width - 4, height - 4);
}

function drawAttackPreview(game) {
    if (!game.running || game.gameOver) return;

    const { ctx, player } = game;
    ctx.save();

    ctx.strokeStyle = "rgba(255, 255, 255, 0.22)";
    ctx.lineWidth = 2;
    const angle = Math.atan2(player.faceY, player.faceX);
    ctx.beginPath();
    ctx.arc(player.x, player.y, 75, angle - 0.8, angle + 0.8);
    ctx.stroke();

    ctx.strokeStyle = "rgba(187, 119, 255, 0.18)";
    ctx.beginPath();
    ctx.arc(player.x, player.y, 110, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = "rgba(255, 221, 102, 0.35)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(player.x, player.y);
    ctx.lineTo(player.x + player.faceX * 85, player.y + player.faceY * 85);
    ctx.stroke();
    ctx.restore();
}

function drawAttacks(game) {
    for (const attack of game.attacks) {
        game.ctx.save();

        if (attack.type === "slash") {
            const angle = Math.atan2(attack.directionY, attack.directionX);
            const x = attack.followPlayer ? game.player.x : attack.x;
            const y = attack.followPlayer ? game.player.y : attack.y;
            game.ctx.globalAlpha = Math.min(1, attack.time / 0.18);
            game.ctx.strokeStyle = "#ffffff";
            game.ctx.lineWidth = 8;
            game.ctx.beginPath();
            game.ctx.arc(x, y, 45, angle - 0.8, angle + 0.8);
            game.ctx.stroke();
        } else if (attack.type === "area") {
            game.ctx.globalAlpha = Math.min(1, attack.time / 0.35);
            game.ctx.fillStyle = "rgba(187, 119, 255, 0.16)";
            game.ctx.beginPath();
            game.ctx.arc(attack.x, attack.y, 110, 0, Math.PI * 2);
            game.ctx.fill();
            game.ctx.strokeStyle = "#bb77ff";
            game.ctx.lineWidth = 4;
            game.ctx.beginPath();
            game.ctx.arc(attack.x, attack.y, 110, 0, Math.PI * 2);
            game.ctx.stroke();
        } else if (attack.type === "lunge") {
            game.ctx.globalAlpha = Math.min(1, attack.time / 0.16);
            game.ctx.strokeStyle = "#ffdd66";
            game.ctx.lineWidth = 12;
            game.ctx.lineCap = "round";
            game.ctx.beginPath();
            game.ctx.moveTo(attack.x, attack.y);
            game.ctx.lineTo(attack.endX, attack.endY);
            game.ctx.stroke();
        }

        game.ctx.restore();
    }
}

function drawEnemies(game) {
    for (const enemy of game.enemies) {
        if (enemy.hp <= 0) continue;

        const enemyColors = enemy.type === "fast"
            ? { normal: "#b47cff", preparing: "#ffe066", attacking: "#ff5a9d" }
            : { normal: "#ff4f68", preparing: "#ffc857", attacking: "#ff3333" };
        game.ctx.fillStyle = enemyColors[enemy.attackState] || enemyColors.normal;
        game.ctx.beginPath();
        game.ctx.arc(enemy.x, enemy.y, enemy.radius, 0, Math.PI * 2);
        game.ctx.fill();

        const barWidth = 30;
        const healthRatio = enemy.hp / enemy.maxHp;
        game.ctx.fillStyle = "#333333";
        game.ctx.fillRect(enemy.x - barWidth / 2, enemy.y - 23, barWidth, 5);
        game.ctx.fillStyle = "#ff5555";
        game.ctx.fillRect(enemy.x - barWidth / 2, enemy.y - 23, barWidth * healthRatio, 5);
    }
}

function drawPlayer(game) {
    const { ctx, player } = game;
    ctx.save();
    ctx.translate(player.x, player.y);

    ctx.fillStyle = player.invincible > 0 ? "#ffffff" : "#64d9ff";
    ctx.beginPath();
    ctx.arc(0, 0, player.radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(player.faceX * 24, player.faceY * 24);
    ctx.stroke();
    ctx.restore();
}

function drawParticles(game) {
    for (const particle of game.particles) {
        game.ctx.globalAlpha = Math.max(0, particle.life / particle.maxLife);
        game.ctx.fillStyle = particle.color;
        game.ctx.beginPath();
        game.ctx.arc(particle.x, particle.y, 3, 0, Math.PI * 2);
        game.ctx.fill();
    }
    game.ctx.globalAlpha = 1;
}

function drawGame(game) {
    drawBackground(game);
    drawAttackPreview(game);
    drawAttacks(game);
    drawEnemies(game);
    drawPlayer(game);
    drawParticles(game);

    game.ctx.fillStyle = "#ffffff";
    game.ctx.font = "bold 18px Arial";
    game.ctx.textAlign = "right";
    game.ctx.fillText(`Puntos: ${game.score}`, game.width - 15, 28);
    game.ctx.fillText(`Oleada: ${game.currentWave}`, game.width - 15, 52);
}

window.ShadowMaze = window.ShadowMaze || {};
window.ShadowMaze.Renderer = { drawGame };
})();
