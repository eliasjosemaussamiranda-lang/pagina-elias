(() => {
    function isCircleBlocked(map, x, y, radius) {
        const tileSize = map.tileSize;
        const firstColumn = Math.floor((x - radius) / tileSize);
        const lastColumn = Math.floor((x + radius) / tileSize);
        const firstRow = Math.floor((y - radius) / tileSize);
        const lastRow = Math.floor((y + radius) / tileSize);

        for (let row = firstRow; row <= lastRow; row++) {
            for (let column = firstColumn; column <= lastColumn; column++) {
                const tile = map.tiles[row]?.[column];
                if (tile !== "#" && tile !== "~") continue;

                const closestX = Math.max(column * tileSize, Math.min(x, (column + 1) * tileSize));
                const closestY = Math.max(row * tileSize, Math.min(y, (row + 1) * tileSize));
                if (Math.hypot(x - closestX, y - closestY) < radius) return true;
            }
        }

        return false;
    }

    window.ShadowMaze = window.ShadowMaze || {};
    window.ShadowMaze.Maps = Object.assign(window.ShadowMaze.Maps || {}, { isCircleBlocked });
})();
