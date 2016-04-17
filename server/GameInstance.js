var NODEJS = typeof module !== 'undefined' && module.exports;

var uuid      = require('node-uuid');
var GameState = require('./GameState.js');
var config    = require('./config');
var Sim       = require('./Sim');
var _         = require('lodash');

var GameInstance = function (player_a, player_b) {
    var self = this;
    self.id = uuid.v1(); // Unique ID for this game instance
    self.player_a = player_a;
    self.player_b = player_b;

    self.player_a.connected = true;
    self.player_b.connected = true;

    self.player_a.score = 0;
    self.player_b.score = 0;

    self.state = 'active';

    self.gameState = GameState();

    // Setup player A socket
    self.player_a.socket.on('mouse_click', function (grid_x, grid_y) {
        // TODO: validate block is in allowed player region
        console.log("Player A clicked block: ", grid_x, grid_y);
        self.sim.addBlock( grid_x, grid_y );
    });
    self.player_a.socket.on("hover_change", function (grid_x, grid_y) {
        self.player_a.hover_block = {x: grid_x, y: grid_y};
        console.log("Player A hover block: ", grid_x, grid_y);
    });
    self.player_a.socket.on("leave_instance", function () {
        self.player_a.connected = false;
        self.state = 'finished';
        self.onPlayerLeave(self.player_a);
    });

    // Setup player B socket
    self.player_b.socket.on('mouse_click', function (grid_x, grid_y) {
        // reverse y for player b
        var true_y = (config.GRID.HEIGHT - 1) - grid_y;
        // TODO: validate block is in allowed player region
        console.log("Player B clicked block: ", grid_x, true_y);
        self.sim.addBlock( grid_x, true_y );
    });
    self.player_b.socket.on("hover_change", function (grid_x, grid_y) {
        var true_y = (config.GRID.HEIGHT - 1) - grid_y;
        self.player_b.hover_block = {x: grid_x, y: true_y};
        console.log("Player B hover block: ", grid_x, true_y);
    });
    self.player_b.socket.on("leave_instance", function () {
        self.player_b.connected = false;
        self.state = 'finished';
        self.onPlayerLeave(self.player_b);
    });


    var enemy = {nick: self.player_b.nick, color: self.player_b.color};
    self.player_a.socket.emit('game_start', {id: self.id, enemy: enemy});

    enemy = {nick: self.player_a.nick, color: self.player_a.color};
    self.player_b.socket.emit('game_start', {id: self.id, enemy: enemy});

    // set up game simulation
    self.sim = new Sim(self.gameState);
    self.sim.onScore( self.addScore );

    //TODO: remove this when done testing
    //setInterval(_.partial(self.addScore.bind(this), 'a', 1), 1000);
};

GameInstance.prototype.tick = function gameInstanceTick() {

    this.gameState.scores.you = this.player_a.score;
    this.gameState.scores.enemy = this.player_b.score;
    this.gameState.hover_block = this.player_b.hover_block;
    this.player_a.socket.emit("instance_tick", this.gameState);

    this.gameState.scores.you = this.player_b.score;
    this.gameState.scores.enemy = this.player_a.score;
    this.gameState.hover_block = this.player_a.hover_block;
    this.gameState.disc.pos.y *= -1;
    this.gameState.disc.vel.y *= -1;
    this.gameState.grid.reverse();
    this.player_b.socket.emit("instance_tick", this.gameState);
    this.gameState.grid.reverse();
    this.gameState.disc.pos.y *= -1;
    this.gameState.disc.vel.y *= -1;

    this.sim.update();

};

GameInstance.prototype.addScore = function gameInstanceTick(player_letter, amount) {
    this['player_'+player_letter].score += amount;

    if (this['player_'+player_letter].score >= config.WINNING_SCORE) {
        console.log("player_" + player_letter + " WON!");

        this.state = 'finished';
    }
};

GameInstance.prototype.hasPlayer = function gameInstanceHasPlayer(player) {
    return (this.player_a.id === player.id) || (this.player_b.id === player.id);
};

GameInstance.prototype.removePlayer = function gameInstanceRemovePlayer(player) {
    if (this.player_a.id === player.id) {
        this.player_a.connected = false;
        this.state = 'finished';
    }
    else if (this.player_b.id === player.id) {
        this.player_b.connected = false;
        this.state = 'finished';
    }
};

GameInstance.prototype.hasConnectedPlayers = function gameInstanceHasPlayers() {
    return this.player_a.connected || this.player_b.connected;
};

if (NODEJS) module.exports = GameInstance;
