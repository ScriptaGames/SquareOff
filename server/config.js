module.exports = {
    PORT: 3100,
    BOARD: {
        WIDTH: 10,
        HEIGHT: 16,
    },
    DISC: {
        DIAMETER: 1, // as a percentage of block height/width
        DELAY: 2, // how many seconds the disc sits in the screen center beforemoving
    },
    TICK_FAST_INTERVAL: 50
};
