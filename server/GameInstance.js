var NODEJS = typeof module !== 'undefined' && module.exports;

var uuid      = require('node-uuid');
var GameState = require('./GameState.js');
var config    = require('./config');
var Sim       = require('./Sim');
var _         = require('lodash');

function GameInstance(player_a, player_b) {
    var self = this;
    self.id = uuid.v1(); // Unique ID for this game instance
    self.player_a = player_a;
    self.player_b = player_b;

    self.player_a_connected = true;
    self.player_b_connected = true;

    self.player_a.hover_block = {x: -1, y: -1};
    self.player_b.hover_block = {x: -1, y: -1};

    self.player_a.lastActionTime = Date.now();
    self.player_b.lastActionTime = Date.now();

    self.player_a.score = 0;
    self.player_b.score = 0;

    self.player_a.blocks = [];
    self.player_b.blocks = [];

    self.state = 'active';

    self.gameState = GameState();

    // Setup player A socket
    self.player_a.socket.removeAllListeners('mouse_click');
    self.player_a.socket.removeAllListeners('hover_change');
    self.player_a.socket.removeAllListeners('leave_instance');
    self.player_a.socket.on('mouse_click', function (grid_x, grid_y) {
        self.handleClick(self.player_a, grid_x, grid_y, 'a');
    });
    self.player_a.socket.on("hover_change", function (grid_x, grid_y) {
        var true_y = (config.GRID.HEIGHT - 1) - grid_y;
        self.player_a.hover_block = {x: grid_x, y: true_y};
        self.player_a.lastActionTime = Date.now();
    });
    self.player_a.socket.on("leave_instance", function () {
        console.log("Player A leaving instance");
        self.player_a_connected = false;
        self.state = 'almost_dead';
    });

    // Setup player B socket
    self.player_b.socket.removeAllListeners('mouse_click');
    self.player_b.socket.removeAllListeners('hover_change');
    self.player_b.socket.removeAllListeners('leave_instance');
    self.player_b.socket.on('mouse_click', function (grid_x, grid_y) {
        // reverse y for player b
        var true_y = (config.GRID.HEIGHT - 1) - grid_y;
        self.handleClick(self.player_b, grid_x, true_y, 'b');
    });
    self.player_b.socket.on("hover_change", function (grid_x, grid_y) {
        var true_y = (config.GRID.HEIGHT - 1) - grid_y;
        self.player_b.hover_block = {x: grid_x, y: true_y};
        self.player_b.lastActionTime = Date.now();
    });
    self.player_b.socket.on("leave_instance", function () {
        console.log("Player B leaving instance");
        self.player_b_connected = false;
        self.state = 'almost_dead';
    });

    var enemy = {nick: self.player_b.nick, color: self.player_b.color};
    self.player_a.socket.emit('game_start', {id: self.id, enemy: enemy});

    enemy = {nick: self.player_a.nick, color: self.player_a.color};
    self.player_b.socket.emit('game_start', {id: self.id, enemy: enemy});

    // set up game simulation
    self.sim = new Sim(self.gameState);
    self.sim.onScore( self.addScore.bind(self) );
    self.sim.onDestroyBlock(function (blockObj, player_letter) {
        var owner = self['player_' + player_letter];
        _.remove(owner.blocks, blockObj);
    });
    self.sim.onBounce( function() {
        self.gameState.bounce = true;
    });
    self.sim.onBlockPlaced( function () {
        self.gameState.blockPlaced = true
    });
}

GameInstance.prototype.tick = function gameInstanceTick() {

    this.checkPlayerActivity();

    this.gameState.scores.you = this.player_a.score;
    this.gameState.scores.enemy = this.player_b.score;
    this.gameState.hover_block = this.player_b.hover_block;
    this.gameState.pos = 1;
    this.player_a.socket.emit("instance_tick", this.gameState);

    this.gameState.scores.you = this.player_b.score;
    this.gameState.scores.enemy = this.player_a.score;
    this.gameState.hover_block = this.player_a.hover_block;
    this.gameState.disc.pos.y *= -1;
    this.gameState.disc.vel.y *= -1;
    this.gameState.grid.reverse();
    this.gameState.pos = 2;
    this.player_b.socket.emit("instance_tick", this.gameState);
    this.gameState.grid.reverse();
    this.gameState.disc.pos.y *= -1;
    this.gameState.disc.vel.y *= -1;

    this.gameState.bounce = false;
    this.gameState.blockPlaced = false;
    this.gameState.score = false;

    this.sim.update();
};

GameInstance.prototype.checkPlayerActivity = function () {
    var nowTime = Date.now();
    var player_a_delay = nowTime - this.player_a.lastActionTime;
    var player_b_delay = nowTime - this.player_b.lastActionTime;

    if (player_a_delay >= config.MAX_INACTIVE_TIME) {
        console.log("Disconnecting Player A for inactivity", this.player_a.id, player_a_delay);
        this.player_a.socket.disconnect();
    }
    else if (player_b_delay >= config.MAX_INACTIVE_TIME) {
        console.log("Disconnecting Player B for inactivity", this.player_b.id, player_a_delay);
        this.player_b.socket.disconnect();
    }

};

GameInstance.prototype.addScore = function gameInstanceAddScore(player_letter) {
    var scoringPlayer = this['player_'+player_letter];
    scoringPlayer.score += 1;

    this.sim.reset();
    // cheap way to reinstantiate grid
    this.gameState.grid = GameState().grid;
    this.gameState.score = true;

    this.player_a.blocks = [];
    this.player_b.blocks = [];

    console.log('Player ' + player_letter.toUpperCase() + ' scored! New score: ' + scoringPlayer.score + ' Socket: ' + scoringPlayer.socket.id);

    if (scoringPlayer.score >= config.WINNING_SCORE) {
        this.endMatch(scoringPlayer);
    }
};

GameInstance.prototype.hasPlayer = function gameInstanceHasPlayer(player) {
    return (this.player_a.id === player.id) || (this.player_b.id === player.id);
};

GameInstance.prototype.removePlayer = function gameInstanceRemovePlayer(player) {
    var winning_player;

    if (this.player_a.id === player.id) {
        this.player_a_connected = false;
        winning_player = this.player_b;
    }
    else if (this.player_b.id === player.id) {
        this.player_b_connected = false;
        winning_player = this.player_a;
    }

    if (this.state === 'active') {
        // end the match and the player who didn't disconnect wins by default
        this.endMatch(winning_player);
    }
};

GameInstance.prototype.hasConnectedPlayers = function gameInstanceHasPlayers() {
    return this.player_a_connected || this.player_b_connected;
};

GameInstance.prototype.endMatch = function gameInstanceEndMatch(winning_player) {
    this.state = 'match_end';

    var losing_player;

    if (winning_player.id === this.player_a.id) {
        console.log("Player A Won");
        losing_player = this.player_b;
    }
    else {
        console.log("Player B Won");
        losing_player = this.player_a;
    }

    this.tick();

    winning_player.socket.emit("victory");
    losing_player.socket.emit("defeat");
};

GameInstance.prototype.destroy = function gameInstanceDestroy() {
    // put any tear down stuff here
    this.player_a_connected = false;
    this.player_b_connected = false;
    this.state = 'dead';
};

GameInstance.prototype.isValidBlock = function gameInstanceIsValidBlock(grid_x, grid_y, player_letter) {
    // check that a block doesn't already exist in that location
    if (this.gameState.grid[grid_y][grid_x]) {
        return false;
    }

    // check that the block being placed not in the other players safe zone
    if (player_letter === 'b') {
        if (grid_y > (config.GRID.HEIGHT - 1) - config.GOAL.SAFE_ZONE) {
            return false; // inside player b's safe zone
        }
    }
    else if (player_letter === 'a') {
        if (grid_y < config.GOAL.SAFE_ZONE) {
            return false; // inside player b's safe zone
        }
    }

    return true; //TODO: implement
};

GameInstance.prototype.handleClick = function gameInstanceHandleClick(player, grid_x, grid_y, player_letter) {
    this['player_' + player_letter].lastActionTime = Date.now();

    if (this.isValidBlock(grid_x, grid_y, player_letter)) {

        // add the latest block
        var addedBlock = this.sim.addBlock(grid_x, grid_y, player_letter);

        if (addedBlock) {
            player.blocks.push({x: grid_x, y: grid_y});
            if (player.blocks.length > config.MAX_PLACED_BLOCKS) {
                // remove oldest block
                var removed_block = player.blocks.shift();

                this.sim.removeBlock(removed_block.x, removed_block.y);
            }
        }
    }
};

if (NODEJS) module.exports = GameInstance;
