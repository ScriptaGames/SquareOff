import GridObject from 'objects/GridObject';
import DiscObject from 'objects/DiscObject';
import BlockObject from 'objects/BlockObject';
import ButtonObject from 'objects/ButtonObject';
import _ from 'lodash';
import config from '../config';

class GameState extends Phaser.State {

    init(socket, nick, color, enemy_nick, enemy_color) {
        console.log("Init GameState socket.id: ", socket.id);

        this.socket = socket;
        this.player_nick = nick;
        this.player_color = color;
        this.enemy_nick = enemy_nick;
        this.enemy_color = enemy_color;
    }

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

        var self = this;

        document.querySelector('#phaser-canvas').style.display = 'block';

        // start network code

        self.socket.removeAllListeners('instance_tick');
        self.socket.removeAllListeners('victory');
        self.socket.removeAllListeners('defeat');

        self.socket.on('instance_tick', this.applyGameState.bind(this));
        self.socket.on('victory', function () {
            console.log('Victory!');

            var style = { font: "bold 32px Arial", fill: "#fff", boundsAlignH: "center", boundsAlignV: "middle" };
            self.end_text = self.game.add.text(self.game.world.centerX, self.game.world.centerY, "YOU WON!", style);

            //TODO: stay in same game if playing a friend

            self.leaveGameTimout();
        });
        this.socket.on('defeat', function () {
            console.log('Defeat :(');

            var style = { font: "bold 32px Arial", fill: "#fff", boundsAlignH: "center", boundsAlignV: "middle" };
            self.end_text = self.game.add.text(self.game.world.centerX, self.game.world.centerY, "YOU LOST!", style);

            //TODO: stay in same game if playing a friend

            self.leaveGameTimout();
        });

        // end network code

        let center = { x: this.game.world.centerX, y: this.game.world.centerY };

        this.grid = new GridObject(this.game, center.x, center.y, this.player_color, this.enemy_color);
        this.game.gridGroup.add(this.grid);

        this.disc = new DiscObject( this.game, center.x, center.y, 'disc-sprite', this.grid.blockWidth );
        this.game.discGroup.add(this.disc);

        // add grid buttons for capturing mouse events
        for (var i = 0; i < config.GRID.HEIGHT; i++) {
            for (var j = 0; j < config.GRID.WIDTH; j++) {
                let buttonObject = new ButtonObject(this.game, this.grid, j, i, this.grid.blockWidth, this.socket);
                this.game.buttonGroup.add(buttonObject);
            }
        }

        // for easier debugging
        window.sq = this;

        // capture mouse input
        this.game.input.mouse.capture = true;

    }

    update(){
        // Do all your game loop stuff here
    }

    shutdown() {
        this.end_text.destroy();

        // destroy all game display elements
        this.game.gridGroup.destroy(true);
        this.game.blockGroup.destroy(true);
        this.game.discGroup.destroy(true);
        this.game.buttonGroup.destroy(true);

        document.querySelector('#phaser-canvas').style.display = 'none';
    }

    applyGameState(gameState){
        // handle gamestate json object here

        // disc x and y are based on p2 coordinate system which has 0,0 at the
        // center.  translate to phaser coordinate system
        var px = gameState.disc.pos.x * this.grid.gridWidth / config.GRID.WIDTH + this.game.width / 2;
        var py = gameState.disc.pos.y * this.grid.gridHeight / config.GRID.HEIGHT + this.game.height / 2;
        this.disc.position.set( px, py );
        // this.disc.body.velocity.x = gameState.disc.vel.x * this.grid.gridWidth / config.GRID.WIDTH;
        // this.disc.body.velocity.y = gameState.disc.vel.y * this.grid.gridHeight / config.GRID.HEIGHT;

        // this.disc.body.data.position[0] = px; // doesn't work
        // this.disc.body.data.position[1] = py; // doesn't work

        // var xdiff = px - this.disc.position.x;
        // var ydiff = py - this.disc.position.y;

        // this.disc.body.dirty = true;

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


    leaveGameTimout() {
        var self = this;
        setTimeout(function () {
            self.socket.emit('leave_instance');
            self.state.start('WaitState', false, false, self.socket, self.player_nick, self.player_color);
        }, config.WIN_SCREEN_TIMEOUT);
    }
}

export default GameState;
