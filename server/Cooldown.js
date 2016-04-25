var _ = require('lodash');
var config = require('./config');

function Cooldown() {
    this.timers = _.fill(new Array(config.MAX_PLACED_BLOCKS), 0, 0, config.MAX_PLACED_BLOCKS);
    this.duration = config.BLOCK_COOLDOWN;
}

Cooldown.prototype.tick = function CooldownTick() {
    this.timers.forEach(dec);
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

function dec(v, i, a) {
    a[i] = Math.max(0, v - config.TICK_FAST_INTERVAL);
}

module.exports = Cooldown;

if (!module.parent) {
    var c = new Cooldown();
    console.log('cooldown: ' + c.timers);
    console.log('any free? ' + c.anyFree());
    console.log('using blocks...');
    console.log(c.use()); c.tick();
    console.log(c.use()); c.tick();
    console.log(c.use()); c.tick();
    console.log(c.use()); c.tick();
    console.log('ran out!');
    console.log('tick tick tick');
    while (!c.anyFree()) {
        c.tick();
        console.log(c.timers);
    }
    console.log('one freed up!');
    console.log(c.use());
    console.log(c.timers);
    console.log('got it!');
}
