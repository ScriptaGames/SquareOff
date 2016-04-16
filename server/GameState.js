var _ = require('lodash');

var config = require('./config');

/**
 * @example
 * var GameState = require('./GameState');
 *
 * GameState() // returns a default gamestate object
 */
module.exports = function GameState() {
    var grid = _.chain( new Array(config.BOARD.HEIGHT) )
        .map( col => new Array(config.BOARD.WIDTH) )
        .map( row => _.fill(row, 0) )
        .value();

    return {
        grid: grid,
        disc: {
            pos: { x: 0, y: 0 },
            vel: { x: 0, y: 0 },
        },
        hoverBlock: { x: -1, y: -1 },
        scores: {
            you: 0,
            enemy: 0,
        }
    };
};
