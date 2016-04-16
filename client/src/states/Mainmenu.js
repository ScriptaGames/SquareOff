class MainmenuState extends Phaser.State {

  preload(){
    console.log('Mainmenu preload');
  }

  create() {
    console.log('Mainmenu create');

    // Call this, when you're ready to move on from the Main Menu
    this.state.start('GameState');
  }

}

export default MainmenuState;
