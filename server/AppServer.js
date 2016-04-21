var NODEJS = typeof module !== 'undefined' && module.exports;

var config    = require('./config');
var gameLoop  = require('node-gameloop');
var GameInstance = require('./GameInstance.js');

/**
 * This module contains all of the app logic and state,
 * @param io
 * @constructor
 */
var AppServer = function (io) {
    //  Scope.
    var self = this;

    self.io = io;
    self.players = {};
    self.waiting_players = [];
    self.game_instances = [];

    self.io.on('connection', function (socket) {

        console.log('Client connected headers:', JSON.stringify(socket.handshake));

        // Send server status how many people and games to display on main menu
        var status = {player_count: Object.keys(self.players).length, game_count: self.game_instances.length};
        socket.emit('game_status', status);

        var current_player = {id: socket.id, socket: socket};

        socket.on('player_ready', function (nick, color) {
            current_player.nick = nick;
            current_player.color = color;

            console.log("Player ready: ", current_player.id, current_player.nick, current_player.color);

            self.players[socket.id] = current_player;
            self.waiting_players.push(current_player);

            console.log("Num players: ", Object.keys(self.players).length);
            console.log("Wait queue length: ", self.waiting_players.length);
        });

        socket.on('disconnect', function () {
            // Remove this player from any running game instance that they are in
            for (var i = 0, l = self.game_instances.length; i < l; i++) {
                var gameInstance = self.game_instances[i];
                if (gameInstance.hasPlayer(current_player)) {
                    gameInstance.removePlayer(current_player);
                }
            }

            // if this player is in the waiting queue remove them
            for (var i = 0, l = self.waiting_players.length; i < l; i++) {
                var waiting_player = self.waiting_players[i];

                if (!waiting_player) {
                    self.waiting_players.splice(i, 1);
                    continue;
                }

                if (waiting_player.id === current_player.id) {
                    self.waiting_players.splice(i, 1); // remove waiting player
                }
            }

            // remove player from players collection
            delete self.players[current_player.id];

            console.log('Client connection closed for player: ', current_player.id);
        });
    });

    self.serverTickFast = function appServerTickFast() {
        // check for waiting players
        while (self.waiting_players.length % 2 === 0 && self.waiting_players.length > 0) {
            // Add the first to players in line to a game instance
            var player_a = self.waiting_players.shift();
            var player_b = self.waiting_players.shift();

            console.log("Creating new game instance");
            console.log("Player A: ", player_a.id);
            console.log("Player B: ", player_b.id);
            var gameInstance = new GameInstance(player_a, player_b);
            self.game_instances.push(gameInstance);
        }

        // Iterate over each game instance
        for (var i = 0, l = self.game_instances.length; i < l; ++i) {
            var gi = self.game_instances[i];
            if (!gi) {
                console.log("Removing undefined game instance");
                self.game_instances.splice(i, 1);
                continue;
            }

            if (gi.state === 'active') {
                gi.tick();
            }
            else if (!gi.hasConnectedPlayers()) {
                // this is an empty dead game instance lets clean it up
                console.log("Destroying game instance: ", gi.id);
                gi.destroy();
                gi = undefined;
                self.game_instances.splice(i, 1);
            }
        }
    };

    /**
     * Checks first two people in the queue and make sure it's not jared or mwcz
     * @param queue
     */
    self.isScriptaMatchup = function appIsScriptaMatchup(queue) {
        var nick_a = queue[0].nick;
        var nick_b = queue[1].nick;

        return ((nick_a != nick_b) && (nick_a === 'mwcz' || nick_a === 'Jared') && (nick_b === 'mwcz' || nick_b === 'Jared'))
    };

    gameLoop.setGameLoop(self.serverTickFast, config.TICK_FAST_INTERVAL);
};

if (NODEJS) module.exports = AppServer;
