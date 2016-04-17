module.exports = {
    PORT: 3100,
    GRID: {
        WIDTH: 12,
        HEIGHT: 20,
        PADDING: {
            VERTICAL: 10,
            HORIZONTAL: 10,
        },
        LINE_WIDTH: 1,
        WALL_DEPTH: 100,
    },
    DISC: {
        DIAMETER: 1.95, // as a percentage of block height/width
        DELAY: 2, // how many seconds the disc sits in the screen center beforemoving
        BOUNCE_SPEEDUP: 0.00, // increase speed by this factor after each bounce
    },
    TICK_FAST_INTERVAL: 40,
};
