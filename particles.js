(() => {
function createParticles(game, x, y, color, amount) {
    for (let i = 0; i < amount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 30 + Math.random() * 140;
        const life = 0.3 + Math.random() * 0.4;

        game.particles.push({
            x,
            y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life,
            maxLife: life,
            color
        });
    }
}

function updateEffects(game, dt) {
    for (const particle of game.particles) {
        particle.x += particle.vx * dt;
        particle.y += particle.vy * dt;
        particle.life -= dt;
    }
    game.particles = game.particles.filter(particle => particle.life > 0);

    for (const attack of game.attacks) {
        attack.time -= dt;
    }
    game.attacks = game.attacks.filter(attack => attack.time > 0);
}

window.ShadowMaze = window.ShadowMaze || {};
window.ShadowMaze.Effects = { createParticles, updateEffects };
})();
