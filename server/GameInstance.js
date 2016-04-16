var NODEJS = typeof module !== 'undefined' && module.exports;

var uuid = require('node-uuid');
var GameState = require('./GameState.js');

var GameInstance = function (player_a, player_b) {
    var self = this;
    self.id = uuid.v1(); // Unique ID for this game instance
    self.player_a = player_a;
    self.player_b = player_b;

    self.player_a.score = 0;
    self.player_b.score = 0;

    self.gameState = GameState();

    var enemy = {name: self.player_b.name, color: self.player_b.color};
    self.player_a.socket.emit('game_start', {id: self.id, enemy: enemy});

    enemy = {name: self.player_a.name, color: self.player_a.color};
    self.player_b.socket.emit('game_start', {id: self.id, enemy: enemy});

    // test state delete this later
    self.player_a.score = 1;

    self.tick = function gameInstanceTick() {

        self.gameState.scores.you = self.player_a.score;
        self.gameState.scores.enemy = self.player_b.score;
        self.player_a.socket.emit("instance_tick", self.gameState);

        self.gameState.scores.you = self.player_b.score;
        self.gameState.scores.enemy = self.player_a.score;
        //TODO: reverse grid here
        self.player_b.socket.emit("instance_tick", self.gameState);
    }
};

if (NODEJS) module.exports = GameInstance;
