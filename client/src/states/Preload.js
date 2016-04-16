class PreloadState extends Phaser.State {

  preload(){
    console.log('Preload preload');

    // Load your assets (images, sounds, maps) here
    this.game.load.image('plane', 'assets/images/plane.png');
  }

  create() {
    console.log('Preload create');

    // Call this, when you've loaded everything and are ready to move on to the main menu
    this.state.start('MainmenuState');
  }
}

export default PreloadState;
