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

        socket.on('player_ready', function (nick) {
            current_player.nick = nick;
            //current_player.color = color; //TODO: add custom color?

            self.players[socket.id] = current_player;
            self.waiting_players.push(current_player);
        });

        socket.on('disconnect', function () {
            // if this player is in the waiting queue remove them
            for (var i = 0, l = self.waiting_players.length; i < l; i++) {
                var waiting_player = self.waiting_players[i];
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
            self.game_instances.push(new GameInstance(player_a, player_b));
        }

        // Iterate over each game instance and call tick()
        for (var i = 0, l = self.game_instances.length; i < l; i++) {
            self.game_instances[i].tick();
        }

    };

    gameLoop.setGameLoop(self.serverTickFast, config.TICK_FAST_INTERVAL);
};

if (NODEJS) module.exports = AppServer;
