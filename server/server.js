#!/bin/env node
const http      = require('http');
const path      = require('path');
const express   = require('express');
const config    = require('../common/config');
const AppServer = require('./AppServer.js');

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
        self.port = process.env.LISTEN_PORT || config.LISTEN_PORT;
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
        // Configure express
        const app = express();
        app.use(express.static(path.join(__dirname, '../build')));

        const httpServer = http.createServer(app);
        const options = {
            cors: {
                origin: "http://" + config.HOST,
                methods: ["GET", "POST"]
            }
        };

        self.io = require('socket.io')(httpServer, options);

        // The app httpServer contains all the logic and state of the WebSocket app
        self.appServer = new AppServer(self.io);

        httpServer.listen(self.port);

        console.log("SquareOff listening for connections on port: ", self.port);
    };
};


/**
 *  main():  Main code.
 */
var mainServer = new MainServer();
mainServer.initialize();
mainServer.start();

