module.exports = {
    PORT: 3100,
    GRID: {
        WIDTH: 10,
        HEIGHT: 16,
        PADDING: {
            VERTICAL: 10,
            HORIZONTAL: 10,
        },
        LINE_WIDTH: 1,
        WALL_DEPTH: 100,
    },
    DISC: {
        DIAMETER: 0.85, // as a percentage of block height/width
        DELAY: 2, // how many seconds the disc sits in the screen center beforemoving
        BOUNCE_SPEEDUP: 0.01, // increase speed by this factor after each bounce
    },
    TICK_FAST_INTERVAL: 50
};
