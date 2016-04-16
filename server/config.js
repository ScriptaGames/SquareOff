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
    },
    DISC: {
        DIAMETER: 0.85, // as a percentage of block height/width
        DELAY: 2, // how many seconds the disc sits in the screen center beforemoving
    },
    TICK_FAST_INTERVAL: 500
};
