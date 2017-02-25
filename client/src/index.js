import PreloadState from 'states/Preload';
import BootState from 'states/Boot';
import GameState from 'states/Game';
import MainmenuState from 'states/Mainmenu';
import WaitState from 'states/Wait';
import config from 'config';

class Game extends Phaser.Game {

    constructor() {
        super(config.CANVAS.WIDTH, config.CANVAS.HEIGHT, Phaser.AUTO, 'phaser-canvas', null, false, false);

        // Create the game states
        this.state.add('BootState', BootState, false);
        this.state.add('PreloadState', PreloadState, false);
        this.state.add('GameState', GameState, false);
        this.state.add('MainmenuState', MainmenuState, false);
        this.state.add('WaitState', WaitState, false);

        // Start with the bootstate
        this.state.start('BootState');
    }
}

new Game();
