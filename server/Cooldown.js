var _ = require('lodash');
var config = require('./config');

function Cooldown(count, cooldown, interval) {
    this.timers = _.fill(new Array(count), 0, 0, count);
    this.duration = cooldown;
    this.interval = interval;
}

Cooldown.prototype.tick = function CooldownTick() {
    this.timers.forEach(this._dec.bind(this));
};

Cooldown.prototype.anyFree = function CooldownAnyFree() {
    return _.includes(this.timers, 0);
};

Cooldown.prototype.findFree = function CooldownFindFree() {
    return _.indexOf(this.timers, 0);
};

Cooldown.prototype.use = function CooldownUse() {
    var free = this.findFree();
    if (free === -1) {
        return false;
    }
    this.timers[free] = this.duration;
    return this.duration;
};

Cooldown.prototype._dec = function dec(value, index, collection) {
    collection[index] = Math.max(0, value - this.interval);
};

module.exports = Cooldown;

function test() {
    var c = new Cooldown(config.MAX_PLACED_BLOCKS, config.BLOCK_COOLDOWN, config.TICK_FAST_INTERVAL);

    var actions = [
        c.use.bind(c),
        _.noop,
        _.noop,
        _.noop,
    ];

    // start one loop that either tries to claim a block, or just waits
    setInterval(() => {
        _.sample(actions)(c);
        console.log('   ' + c.timers[0] + '\t' + c.timers[1] + '\t' + c.timers[2]);
    }, 80);

    // start another loop that runs the cooldown ticks
    setInterval(() => {
        c.tick();
    }, 50);

}

if (require.main === module) {
    test();
}
