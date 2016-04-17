import RainbowText from 'objects/RainbowText';
import GameObject from 'objects/GameObject';
import io from 'socket.io-client';
import GridObject from 'objects/GridObject';
import DiscObject from 'objects/DiscObject';
import BlockObject from 'objects/BlockObject';
import ButtonObject from 'objects/ButtonObject';
import _ from 'lodash';
import config from '../config';

class GameState extends Phaser.State {

    preload() {
        console.log('Game preload');

        // The order you create these groups matters, unless you set the Z-index by hand.
        // I add these to the game object, so they're easily accessed inside different objects.
        // Create a group for the foreground items, like players, enemies and things like that.

        this.game.gridGroup  = this.game.add.group(); // holds grid
        this.game.blockGroup = this.game.add.group(); // holds all blocks
        this.game.discGroup  = this.game.add.group(); // holds disc and disc particles
        this.game.buttonGroup = this.game.add.group(); // holds all the grid buttons

        // kick off p2 fzx engine
        this.game.physics.startSystem(Phaser.Physics.P2JS);
        this.game.physics.p2.restitution = 1.0;
        this.game.physics.p2.friction = 0;

        // Create a group for UI stuff like buttons, texts and menus. It's drawn on top of the foreground.
        // this.game.ui = this.game.add.group();
    }

    create() {
        console.log('Game create');

        // start network code

        let socket = io("http://localhost:3100", {query: 'name=' + Date.now() + '&color=red'});

        socket.on('connect', function () {
            console.log("WebSocket connection established and ready.");
        });

        socket.on('game_start', function (gameInstance) {
            console.log("Joined Game instance: ", gameInstance.id);
            console.log("Enemy name: ", gameInstance.enemy.name);
            console.log("Enemy color: ", gameInstance.enemy.color);
        });

        socket.on('instance_tick', this.applyGameState.bind(this));

        // end network code

        let center = { x: this.game.world.centerX, y: this.game.world.centerY };

        this.grid = new GridObject(this.game, center.x, center.y);
        this.game.gridGroup.add(this.grid);

        this.disc = new DiscObject( this.game, center.x, center.y, 'disc-sprite', this.grid.blockWidth );
        this.game.discGroup.add(this.disc);

        // add grid buttons for capturing mouse events
        for (var i = 0; i < config.GRID.HEIGHT; i++) {
            for (var j = 0; j < config.GRID.WIDTH; j++) {
                let buttonObject = new ButtonObject(this.game, this.grid, j, i, this.grid.blockWidth, socket);
                this.game.buttonGroup.add(buttonObject);
            }
        }


        //let i = 18;
        //while(i--) {
        //    this.addGridBlock(Math.floor(Math.random()*config.GRID.WIDTH), Math.floor(Math.random()*config.GRID.HEIGHT));
        //}

        // for easier debugging
        window.sq = this;

        // capture mouse input
        this.game.input.mouse.capture = true;

    }

    update(){
        // Do all your game loop stuff here
    }

    applyGameState(gameState){
        // handle gamestate json object here

        // disc x and y are based on p2 coordinate system which has 0,0 at the
        // center.  translate to phaser coordinate system
        var px = gameState.disc.pos.x * this.grid.gridWidth / config.GRID.WIDTH + this.game.width / 2;
        var py = gameState.disc.pos.y * this.grid.gridHeight / config.GRID.HEIGHT + this.game.height / 2;
        this.disc.position.set( px, py );

        // this.disc.body.velocity.x = gameState.disc.vel.x;
        // this.disc.body.velocity.y = gameState.disc.vel.y;

        this.game.blockGroup.forEach( block => block.body.removeFromWorld() );
        this.game.blockGroup.removeAll();

        _.each(gameState.grid, this.addGridRow.bind(this));
    }

    addGridRow(row, y) {
        let x = row.length;
        while (x--) {
            if (row[x] > 0) {
                this.addGridBlock(x, y);
            }
        }
    }

    addGridBlock(x, y) {
        this.game.blockGroup.add(new BlockObject( this.game, this.grid, x, y, 'block-sprite', this.grid.blockWidth ));
    }

}

export default GameState;
