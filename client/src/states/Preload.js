class PreloadState extends Phaser.State {

    preload(){
        console.log('Preload preload');

        // Load your assets (images, sounds, maps) here
        this.game.load.image('disc-particle' , 'assets/images/disc-particle.png');
        this.game.load.image('disc-sprite'   , 'assets/images/disc-sprite.png');
        this.game.load.image('block-sprite'  , 'assets/images/block-sprite.png');

        this.game.load.spritesheet('hover-sprite', 'assets/images/hover-sprite.png', 200, 200);

        // load sounds

        this.game.load.audio('blockPlace' , 'assets/sounds/blockPlace.mp3');
        this.game.load.audio('bounce'     , 'assets/sounds/bounce.mp3');
        this.game.load.audio('colorPick'  , 'assets/sounds/colorPick.mp3');
        this.game.load.audio('goal'       , 'assets/sounds/goal.mp3');
        this.game.load.audio('nameType'   , 'assets/sounds/nameType.mp3');
        this.game.load.audio('play'       , 'assets/sounds/play.mp3');

    }

    create() {
        console.log('Preload create');

        // GOTTA FINISH LD35!!!
        window.Sounds = {
            blockPlace : this.game.add.audio('blockPlace'),
            bounce     : this.game.add.audio('bounce'),
            colorPick  : this.game.add.audio('colorPick'),
            goal       : this.game.add.audio('goal'),
            nameType   : this.game.add.audio('nameType'),
            play       : this.game.add.audio('play'),
        };

        // Call this, when you've loaded everything and are ready to move on to the main menu
        this.state.start('MainmenuState');
    }
}

export default PreloadState;
