(() => {
    window.ShadowMaze = window.ShadowMaze || {};
    window.ShadowMaze.Maps = window.ShadowMaze.Maps || {};
    window.ShadowMaze.Maps.placeholder = {
        name: "Mapa provisional",
        tileSize: 50,
        textures: {
            floor: null,
            wall: null,
            water: null
        },
        tiles: Array.from({ length: 16 }, () => ".........")
    };
})();
