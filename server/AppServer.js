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

            // Try to find a match for the player, if we can't, put them in the wait queue
            var matchedPlayer = self.findMatch(current_player);
            if (matchedPlayer) {
                console.log("Creating new game instance");
                console.log("Player A: ", matchedPlayer.id);
                console.log("Player B: ", current_player.id);
                var gameInstance = new GameInstance(matchedPlayer, current_player);
                self.game_instances.push(gameInstance);
            }
            else {
                self.waiting_players.push(current_player);
            }

            console.log("Num players: ", Object.keys(self.players).length);
            console.log("Wait queue length: ", self.waiting_players.length);
            console.log("Game instances: ", self.game_instances.length);
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
        // Iterate over each game instance
        for (var i = 0; i < self.game_instances.length; ++i) {
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
     * Search for a match for the given player from the waiting queue
     * @param player
     */
    self.findMatch = function appFindMatch(player) {
        var match = false;

        console.log("Searching for match for player: ", player.id, player.nick);

        for (var i = 0; i < self.waiting_players.length; ++i) {
            var waitingPlayer = self.waiting_players[i];

            // Put any matching logic here

            // Don't match up mwcz or jared
            if (waitingPlayer && !self.isScriptaMatchup(player, waitingPlayer)) {
                match = waitingPlayer;
                self.waiting_players.splice(i, 1);
                console.log("Found match: ", match.id, match.nick);
                break;  // found a match
            }
        }

        return match;
    };

    /**
     * Checks first two people in the queue and make sure it's not jared or mwcz
     * @param player_a
     * @param player_b
     *
     */
    self.isScriptaMatchup = function appIsScriptaMatchup(player_a, player_b) {
        var nick_a = player_a.nick.toUpperCase();
        var nick_b = player_b.nick.toUpperCase();

        return ((nick_a != nick_b) && (nick_a === 'MWCZ' || nick_a === 'JARED') && (nick_b === 'MWCZ' || nick_b === 'JARED'))
    };

    gameLoop.setGameLoop(self.serverTickFast, config.TICK_FAST_INTERVAL);
};

if (NODEJS) module.exports = AppServer;
