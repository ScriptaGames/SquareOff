var NODEJS = typeof module !== 'undefined' && module.exports;

var uuid      = require('node-uuid');
var GameState = require('./GameState.js');
var config    = require('./config');
var Sim       = require('./Sim');

var GameInstance = function (player_a, player_b) {
    var self = this;
    self.id = uuid.v1(); // Unique ID for this game instance
    self.player_a = player_a;
    self.player_b = player_b;

    self.player_a.score = 0;
    self.player_b.score = 0;

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


    var enemy = {name: self.player_b.name, color: self.player_b.color};
    self.player_a.socket.emit('game_start', {id: self.id, enemy: enemy});

    enemy = {name: self.player_a.name, color: self.player_a.color};
    self.player_b.socket.emit('game_start', {id: self.id, enemy: enemy});

    // test state delete this later
    self.player_a.score = 1;
    self.gameState.grid[0][0] = 1;
    self.gameState.grid[0][7] = 1;
    self.gameState.grid[2][2] = 1;
    self.gameState.grid[3][1] = 1;
    self.gameState.grid[13][3] = 1;
    self.gameState.grid[14][5] = 1;
    self.gameState.grid[15][9] = 1;

    // set up game simulation
    self.sim = new Sim(self.gameState);
    self.sim.onScore( self.addScore );

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
    console.log("ADDSCORE NOT IMPLEMENTED");
    // this['player_'+player_letter].score += amount;
};

if (NODEJS) module.exports = GameInstance;
