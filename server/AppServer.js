var NODEJS = typeof module !== 'undefined' && module.exports;

var config    = require('./config');
var gameState = require('./GameState.js');
var gameLoop  = require('node-gameloop');

/**
 * This module contains all of the app logic and state,
 * @param io
 * @constructor
 */
var AppServer = function (io) {
    //  Scope.
    var self = this;

    self.io = io;

    // Example state
    var updateCount = 0;

    setInterval(function() {
        // send to all clients
        self.io.emit('server_message', ++updateCount);
    }, 500);

    self.io.on('connection', function (socket) {

        console.log('Client connected headers:', JSON.stringify(socket.handshake));

        var name = socket.handshake.query.name;

        console.log("Name:", name);

        self.io.emit('client_joined', "Client joined: " + name);

        socket.on('binary_message', function (msg) {
            var ab = toArrayBuffer(msg);
            var arr = new Int32Array(ab);
            console.log(arr[0]);
        });

        socket.on('string_message', function (msg) {
            console.log(msg);
        });

        socket.on('disconnect', function () {
            self.io.emit('client_left', "Client left: " + name);
            console.log('Client connection closed');
        });

        function toArrayBuffer(buffer) {
            var ab = new ArrayBuffer(buffer.length);
            var view = new Uint8Array(ab);
            for (var i = 0; i < buffer.length; ++i) {
                view[i] = buffer[i];
            }
            return ab;
        }
    });

    self.serverTickFast = function appServerTickFast() {

    };

    gameLoop.setGameLoop(self.serverTickFast, config.TICK_FAST_INTERVAL);
};

if (NODEJS) module.exports = AppServer;
