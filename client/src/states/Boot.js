import config from '../config';

class BootState extends Phaser.State {

    preload(){
        console.log('Boot preload');
    }

    create(){
        console.log('Boot create');

        // Uncomment the Phaser Debug Plugin line, if you want to see statistics about your game and what eats up the CPU cycles.
        // Just remember to remove it/comment it out when you release, since this plugin eats CPU too. Also see index.html
        // this.game.add.plugin(Phaser.Plugin.Debug); // <-- Phaser Debug Plugin

        //  Phaser will automatically pause if the browser tab the game is in
        //  loses focus. You can disable that here:
        this.stage.disableVisibilityChange = true;

        // Uncomment this if you want to use the phaser tiled plugin. Also see index.html
        // this.game.add.plugin(Phaser.Plugin.Tiled); // <-- Phaser Tiled Plugin


        // Call this, when you're ready to move on from BootState
        this.state.start('PreloadState');

        // hide the canvas, for now
        this.game.canvas.style.display = 'none';
    }
}

export default BootState;
