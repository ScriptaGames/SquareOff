class PreloadState extends Phaser.State {

    preload(){
        console.log('Preload preload');

        // Load your assets (images, sounds, maps) here
        this.game.load.image('plane', 'assets/images/plane.png');
        this.game.load.image('disc-particle', 'assets/images/disc-particle.png');
        this.game.load.image('disc-sprite', 'assets/images/disc-sprite.png');
        this.game.load.image('block-sprite', 'assets/images/block-sprite.png');

        this.game.load.spritesheet('hover-sprite', 'assets/images/hover-sprite.png', 200, 200);

    }

    create() {
        console.log('Preload create');

        // Call this, when you've loaded everything and are ready to move on to the main menu
        this.state.start('MainmenuState');
    }
}

export default PreloadState;
