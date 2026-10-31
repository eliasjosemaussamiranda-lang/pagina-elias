(() => {
    const paths = {
        floor: "assets/textures/floor.png",
        wall: "assets/textures/wall.png",
        water: "assets/textures/water.png",
        player: "assets/textures/player.png",
        enemy: "assets/textures/enemy.png"
    };
    const cache = new Map();
    const images = new Map();

    function loadTexture(name) {
        if (!paths[name]) {
            return Promise.reject(new Error(`Textura no registrada: ${name}`));
        }
        if (cache.has(name)) return cache.get(name);

        const request = new Promise((resolve, reject) => {
            const image = new Image();
            image.onload = () => {
                images.set(name, image);
                resolve(image);
            };
            image.onerror = () => reject(new Error(`No se pudo cargar ${paths[name]}`));
            image.src = paths[name];
        });

        cache.set(name, request);
        return request;
    }

    function getTexture(name) {
        if (!name || !paths[name]) return null;
        if (!cache.has(name)) {
            loadTexture(name).catch(error => console.error(error));
        }
        return images.get(name) || null;
    }

    window.ShadowMaze = window.ShadowMaze || {};
    window.ShadowMaze.Assets = { paths, loadTexture, getTexture };
})();
