import RainbowText from 'objects/RainbowText';
import GameObject from 'objects/GameObject';
import io from 'socket.io-client';
import GridObject from 'objects/GridObject';
import DiscObject from 'objects/DiscObject';
import BlockObject from 'objects/BlockObject';
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

        var socket = io("http://localhost:3100", {query: 'name=' + Date.now() + '&color=red'});

        socket.on('connect', function () {
            console.log("WebSocket connection established and ready.");
        });

        socket.on('game_start', function (gameInstance) {
            console.log("Joined Game instance: ", gameInstance.id);
            console.log("Enemy name: ", gameInstance.enemy.name);
            console.log("Enemy color: ", gameInstance.enemy.color);
        });

        socket.on('instance_tick', function (gameState) {
            console.log("My score: ", gameState.scores.you);
            console.log("Enemy score: ", gameState.scores.enemy);
        });

        // end network code

        let center = { x: this.game.world.centerX, y: this.game.world.centerY };

        this.grid = new GridObject(this.game, center.x, center.y);
        this.game.gridGroup.add(this.grid);

        this.disc = new DiscObject( this.game, center.x, center.y, 'disc-sprite', this.grid.blockWidth );
        this.game.discGroup.add(this.disc);

        this.testBlock = new BlockObject( this.game, this.grid, 0, 1, 'block-sprite', this.grid.blockWidth );
        this.game.blockGroup.add(this.testBlock);
        let i = 10;
        while(i--) {
            this.game.blockGroup.add(new BlockObject( this.game, this.grid, Math.floor(Math.random()*config.GRID.WIDTH), Math.floor(Math.random()*config.GRID.HEIGHT), 'block-sprite', this.grid.blockWidth ));
        }

        // for easier debugging
        window.sq = this;

    }

    update(){
        // Do all your game loop stuff here
    }

    applyGameState(gamestate){
        // handle gamestate json object here
        this.disc.position.x = gamestate.disc.pos.x;
        this.disc.position.y = gamestate.disc.pos.y;

        this.game.blockGroup.removeAll();
    }

}

export default GameState;
