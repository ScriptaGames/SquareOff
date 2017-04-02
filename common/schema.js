var sp = require('schemapack');

var schema = {};

schema.vec2 = {
    x: 'float32',
    y: 'float32',
};

schema.tickSchema = sp.build({
    grid: [[ 'uint8' ]],
    disc: {
        pos: schema.vec2,
        vel: schema.vec2,
        angle: 'float32',
    },
    hover_block: {
        x: 'int16',
        y: 'int16',
    },
    scores: {
        you: 'uint8',
        enemy: 'uint8',
    },
    pos: 'uint8',
    bounce: 'bool',
    blockPlaced: 'bool',
    score: 'bool',
});

module.exports = schema;
