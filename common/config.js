let host;
let connect_port;
let listen_port;
const so_env = process.env.SO_ENV || SO_ENV;
console.log('SO_ENV:', so_env);

if (so_env === 'dev') {
    host = 'localhost';
    listen_port = connect_port = 8080;
}
else if (so_env === 'prod' ) {
    host = 'square-off-prod-prod-arcade-rh-com.apps.ospo-osci.z3b1.p1.openshiftapps.com';
    listen_port = 8080;
    connect_port = 80;
}

const config = {
    HOST: host,
    CONNECT_PORT: connect_port,
    LISTEN_PORT: listen_port,
    CANVAS: {
        WIDTH: 1440,
        HEIGHT: 2000,
    },
    GRID: {
        WIDTH: 12,
        HEIGHT: 20,
        PADDING: {
            VERTICAL: 10,
            HORIZONTAL: 10,
        },
        LINE_WIDTH: 8,
        WALL_DEPTH: 100,
    },
    GOAL: {
        WIDTH: 8, // number of grid squares
        SAFE_ZONE: 6,
    },
    DISC: {
        DIAMETER: 1.95, // as a percentage of block height/width
        BOUNCE_SPEEDUP: 0.55, // add this amount to disc speed after each bounce
        INITIAL_SPEED: 2.00,
        MAX_SPEED: 26.00,
        MOVE_DELAY: 750, // delay before moving; in ms
    },
    TICK_FAST_INTERVAL: 50,
    WINNING_SCORE: 7,
    WIN_SCREEN_TIMEOUT: 7000,  // time that the player stays on the win/loss scree before starting new game
    MAX_PLACED_BLOCKS: 3,
    MAX_INACTIVE_TIME: 45000,
};

module.exports = config;
