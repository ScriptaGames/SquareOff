var _ = require('lodash');

var config = require('../common/config');

/**
 * @example
 * var GameState = require('./GameState');
 *
 * GameState() // returns a default gamestate object
 */
module.exports = function GameState() {
    var grid = _.chain( new Array(config.GRID.HEIGHT) )
        .map( function () { return new Array(config.GRID.WIDTH) } )
        .map( function (row) { return _.fill(row, 0) } )
        .value();

    return {
        grid: grid,
        disc: {
            pos: { x: 0, y: 0 },
            vel: { x: 0, y: 0 },
            angle: 0,
        },
        hover_block: { x: -1, y: -1 },
        scores: {
            you: 0,
            enemy: 0,
        },
        pos: 1,
        bounce: false, // did the disc bounce?
        blockPlaced: false, // was a block placed?
        score: false, // did anyone score?
    };
};
