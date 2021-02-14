#!/bin/env node
//  Sample Node.js WebSocket Client-Server application
var config    = require('./config');
var AppServer = require('./AppServer.js');

// Patch console.x methods in order to add timestamp information
require("console-stamp")(console, {pattern: "mm/dd/yyyy HH:MM:ss.l"});

/**
 *  Define the sample server.
 */
var MainServer = function () {

    //  Scope.
    var self = this;


    /*  ================================================================  */
    /*  Helper functions.                                                 */
    /*  ================================================================  */

    /**
     *  Set up server env variables/defaults.
     */
    self.setupVariables = function () {
        //  Set the environment variables we need.
        self.port = process.env.PORT || config.PORT;
    };


    /**
     *  terminator === the termination handler
     *  Terminate server on receipt of the specified signal.
     */
    self.terminator = function (sig) {
        if (typeof sig === "string") {
            console.log('Received %s - terminating sample server ...', sig);
            process.exit(1);
        }
        console.log('Node server stopped.');
    };


    /**
     *  Setup termination handlers (for exit and a list of signals).
     */
    self.setupTerminationHandlers = function () {
        //  Process on exit and signals.
        process.on('exit', function() { self.terminator(0); });

        ['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT',
         'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGTERM'
        ].forEach(function(element) {
            process.on(element, function() { self.terminator(element); });
        });
    };


    /*  ================================================================  */
    /*  App server functions (main app logic here).                       */
    /*  ================================================================  */


    /**
     *  Initialize the server (express) and create the routes and register
     *  the handlers.
     */
    self.initializeServer = function () {
        // nothing to go here for now
    };


    /**
     *  Initializes the server
     */
    self.initialize = function () {
        self.setupVariables();
        self.setupTerminationHandlers();

        // Create the express server and routes.
        self.initializeServer();
    };


    /**
     *  Start the server
     */
    self.start = function () {
        console.log("SquareOff listening for WebSocket connetions on port: ", self.port);
        self.io = require('socket.io')(self.port, {
            cors: {
                origin: "http://localhost:3000", //TODO: Make this configurable based on Environment variable and config
                methods: ["GET", "POST"]
            }
        });

        // The app server contains all the logic and state of the WebSocket app
        self.appServer = new AppServer(self.io);
    };
};


/**
 *  main():  Main code.
 */
var mainServer = new MainServer();
mainServer.initialize();
mainServer.start();

