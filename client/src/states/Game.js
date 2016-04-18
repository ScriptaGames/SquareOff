import ScoreText from 'objects/ScoreText';
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

        this.game.gridGroup   = this.game.add.group(); // holds grid
        this.game.blockGroup  = this.game.add.group(); // holds all blocks
        this.game.discGroup   = this.game.add.group(); // holds disc and disc particles
        this.game.buttonGroup = this.game.add.group(); // holds all the grid buttons
        this.game.uiGroup     = this.game.add.group(); // holds all the grid buttons

        this.lastPlayerScore = 0;
        this.lastEnemyScore = 0;

        // kick off p2 fzx engine
        // this.game.physics.startSystem(Phaser.Physics.P2JS);
        // this.game.physics.p2.restitution = 1.0;
        // this.game.physics.p2.friction = 0;

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
        self.socket.on('victory', function (gameState) {
            console.log('Victory!');

            // apply the final game state
            self.applyGameState(gameState);

            // display message box
            self.displayEndMessage('VICTORY!');

            //TODO: stay in same game if playing a friend

            self.leaveGameTimout();
        });
        this.socket.on('defeat', function (gameState) {
            console.log('Defeat :(');

            // apply the final game state
            self.applyGameState(gameState);

            // display message box
            self.displayEndMessage('DEFEAT!');

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
        this.hover_buttons = [];
        for (var i = 0; i < config.GRID.HEIGHT; i++) {
            this.hover_buttons.push([]);
            for (var j = 0; j < config.GRID.WIDTH; j++) {
                let buttonObject = new ButtonObject(this.game, this.grid, j, i, this.grid.blockWidth, this.socket);
                this.hover_buttons[i].push(buttonObject);
                this.game.buttonGroup.add(buttonObject);
            }
        }

        // add score text

        const textSize = 35;
        let enemyNameText    = new ScoreText(this.game, center.x - this.grid.gridWidth/2 - textSize, 0, this.enemy_nick, this.enemy_color, textSize);
        let playerNameText   = new ScoreText(this.game, center.x - this.grid.gridWidth/2 - textSize, center.y + this.grid.gridHeight/2, this.player_nick, this.player_color, textSize);
        this.enemyScoreText  = new ScoreText(this.game, center.x - this.grid.gridWidth/2 - textSize, 0 + textSize*2, '', this.enemy_color, 3*textSize);
        this.playerScoreText = new ScoreText(this.game, center.x - this.grid.gridWidth/2 - textSize, center.y + this.grid.gridHeight/2 - textSize*2, '', this.player_color, 3*textSize);
        enemyNameText.anchor.set(1.0, 0.0);
        playerNameText.anchor.set(1.0, 1.0);
        this.enemyScoreText.anchor.set(1.0, 0.0);
        this.playerScoreText.anchor.set(1.0, 1.0);
        this.game.uiGroup.add(enemyNameText);
        this.game.uiGroup.add(playerNameText);
        this.game.uiGroup.add(this.enemyScoreText);
        this.game.uiGroup.add(this.playerScoreText);

        // for easier debugging
        window.sq = this;

        // capture mouse input
        this.game.input.mouse.capture = true;

    }

    // update(){
    //     // Do all your game loop stuff here
    // }

    shutdown() {
        this.end_text.destroy();
        this.end_text_bg.destroy();

        // destroy all game display elements
        this.game.gridGroup.destroy(true);
        this.game.blockGroup.destroy(true);
        this.game.discGroup.destroy(true);
        this.game.buttonGroup.destroy(true);
        this.game.uiGroup.destroy(true);

        document.querySelector('#phaser-canvas').style.display = 'none';
    }

    applyGameState(gameState) {
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

        // don't need this with physics disabled
        // this.game.blockGroup.forEach( block => block.body.removeFromWorld() );
        this.game.blockGroup.removeAll(true);

        // update scores

        if (this.lastPlayerScore !== gameState.scores.you) {
            console.log('you scored, exploding', this.lastPlayerScore, gameState.scores.you);
            this.disc.explode(1);
        }
        else if (this.lastEnemyScore !== gameState.scores.enemy) {
            console.log('enemy scored, exploding', this.lastEnemyScore, gameState.scores.you);
            this.disc.explode(-1);
        }

        this.lastPlayerScore = gameState.scores.you;
        this.lastEnemyScore = gameState.scores.enemy;

        this.enemyScoreText.text = gameState.scores.enemy;
        this.playerScoreText.text = gameState.scores.you;

        // add enemy hover
        let hover_block = gameState.hover_block;
        if (hover_block && hover_block.x && hover_block.y) {
            let new_hover_button = this.hover_buttons[hover_block.y][hover_block.x];
            if (!this.current_hover_button && new_hover_button) {
                this.current_hover_button = {x: hover_block.x, y: hover_block.y};
            }
            if (new_hover_button) {
                let button_changed = (hover_block.x != this.current_hover_button.x || hover_block.y != this.current_hover_button.y);

                if (button_changed) {
                    // reset the image for the old hover button
                    this.hover_buttons[this.current_hover_button.y][this.current_hover_button.x].setFrames(1, 0, 0, 0);

                    // set the button to hover frame
                    new_hover_button.setFrames(0, 1, 1, 1);

                    // save current hover position
                    this.current_hover_button = {x: hover_block.x, y: hover_block.y};
                }
            }
        }

        _.each(gameState.grid, _.curry(this.addGridRow.bind(this))(gameState.pos));
    }

    addGridRow(player_pos, row, y) {
        let x = row.length;
        while (x--) {
            if (row[x] > 0) {
                this.addGridBlock(x, y, row, player_pos);
            }
        }
    }

    addGridBlock(x, y, row, player_pos) {
        const color = row[x] === player_pos ? this.player_color : this.enemy_color;
        this.game.blockGroup.add(new BlockObject( this.game, this.grid, x, y, 'block-sprite', this.grid.blockWidth, color ));
    }


    leaveGameTimout() {
        var self = this;
        setTimeout(function () {
            self.socket.emit('leave_instance');
            self.state.start('WaitState', false, false, self.socket, self.player_nick, self.player_color);
        }, config.WIN_SCREEN_TIMEOUT);
    }

    displayEndMessage(msg) {
        this.end_text_bg = this.game.add.graphics();
        this.end_text_bg.beginFill(0x464646, 1);
        this.end_text_bg.drawRect(this.game.world.centerX - 250, this.game.world.centerY - 100, 500, 200);
        let template = '#000000';
        let colorValue = this.player_color.toString(16);
        let colorString = template.substring(0, template.length - colorValue.length) + colorValue;
        console.log('color string', colorString);
        var style = { font: "bold 48px Bowlby One SC", fill: colorString, boundsAlignH: "center", boundsAlignV: "middle" };
        this.end_text = this.game.add.text(this.game.world.centerX, this.game.world.centerY, msg, style);
        this.end_text.anchor.set(0.5, 0.5);
    }
}

export default GameState;
