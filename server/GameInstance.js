var NODEJS = typeof module !== 'undefined' && module.exports;

var uuid = require('node-uuid');

var GameInstance = function (player_a, player_b) {
    var self = this;
    self.id = uuid.v1(); // Unique ID for this game instance
    self.player_a = player_a;
    self.player_b = player_b;

    self.tick = function gameInstanceTick() {
        self.player_a.socket.emit("instance_tick", "You are player A in game instance: " + self.id);
        self.player_b.socket.emit("instance_tick", "You are player B in game instance: " + self.id);
    }
};

if (NODEJS) module.exports = GameInstance;
