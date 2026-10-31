(() => {
    function updateEnemyBehavior(enemy, player, dt) {
        const dx = player.x - enemy.x;
        const dy = player.y - enemy.y;
        const distance = Math.hypot(dx, dy);

        if (distance < enemy.detectionRange) {
            return {
                x: distance > player.radius + enemy.radius + 3 ? dx / (distance || 1) : 0,
                y: distance > player.radius + enemy.radius + 3 ? dy / (distance || 1) : 0,
                distance,
                pursuing: true
            };
        }

        enemy.wanderTimer -= dt;
        if (enemy.wanderTimer <= 0) {
            const angle = Math.random() * Math.PI * 2;
            enemy.wanderX = Math.cos(angle);
            enemy.wanderY = Math.sin(angle);
            enemy.wanderTimer = 1 + Math.random() * 2;
        }

        return {
            x: enemy.wanderX * 0.35,
            y: enemy.wanderY * 0.35,
            distance,
            pursuing: false
        };
    }

    window.ShadowMaze = window.ShadowMaze || {};
    window.ShadowMaze.Enemies = { updateEnemyBehavior };
})();
