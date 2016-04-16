var NODEJS = typeof module !== 'undefined' && module.exports;

var config    = require('./config');
var gameState = require('./GameState.js');
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

        var name = socket.handshake.query.name;
        var color = socket.handshake.query.color;

        console.log("Name, color", name, color);

        self.players[socket.id] = {id: socket.id, name: name, color: color, socket: socket};
        self.waiting_players.push(self.players[socket.id]);

        socket.on('disconnect', function () {
            self.io.emit('client_left', "Client left: " + name);
            console.log('Client connection closed');
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
