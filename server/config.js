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
    GOAL: {
        WIDTH: 8, // number of grid squares
    },
    DISC: {
        DIAMETER: 1.95, // as a percentage of block height/width
        DELAY: 2, // how many seconds the disc sits in the screen center beforemoving
        BOUNCE_SPEEDUP: 0.00, // increase speed by this factor after each bounce
    },
    TICK_FAST_INTERVAL: 50,
    WINNING_SCORE: 3,
    WIN_SCREEN_TIMEOUT: 7000,  // time that the player stays on the win/loss scree before starting new game
    MAX_PLACED_BLOCKS: 3,
};
