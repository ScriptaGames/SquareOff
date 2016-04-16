import RainbowText from 'objects/RainbowText';
import GameObject from 'objects/GameObject';
import io from 'socket.io-client';
import GridObject from 'objects/GridObject';
import DiscObject from 'objects/DiscObject';
import _ from 'lodash';
import config from '../config';

class GameState extends Phaser.State {

    preload() {
        console.log('Game preload');

        // The order you create these groups matters, unless you set the Z-index by hand.
        // I add these to the game object, so they're easily accessed inside different objects.
        // Create a group for the foreground items, like players, enemies and things like that.

        this.game.gridGroup  = this.game.add.group(); // holds grid
        // this.game.blockGroup = this.game.add.group(); // holds all blocks
        this.game.discGroup  = this.game.add.group(); // holds disc and disc particles

        // kick off p2 fzx engine
        this.game.physics.startSystem(Phaser.Physics.P2JS);

        // Create a group for UI stuff like buttons, texts and menus. It's drawn on top of the foreground.
        // this.game.ui = this.game.add.group();
    }

    create() {
        console.log('Game create');

        // start network code

        var socket = io("http://localhost:3100", {query: 'name=' + Date.now()});

        socket.on('connect', function () {
            console.log("WebSocket connection established and ready.");
        });

        socket.on('instance_tick', function (msg) {
            console.log(msg);
        });

        // end network code

        this.grid = new GridObject(this.game, config.GRID.PADDING.HORIZONTAL, config.GRID.PADDING.VERTICAL);

        this.game.gridGroup.add(this.grid);

        this.disc = new DiscObject( this.game, this.game.world.centerX, this.game.world.centerY, 'disc-sprite', this.grid.blockWidth );

        this.game.discGroup.add(this.disc);

        // for easier debugging
        window.game = this;

    }

    update(){
        // Do all your game loop stuff here
    }

    applyGameState(gamestate){
        // handle gamestate json object here
    }

}

export default GameState;
