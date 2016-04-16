
// You should create all game object specific behavior in this file and then extend it with new classes.
// For Example: EnemySoldier, PlayerShip or something to that effect.
class GameObject extends Phaser.Sprite {

    constructor(game, x, y, key, frame){
        super(game, x, y, key, frame);
        this.game = game;
    }

    update(){
        // Call the superclass update first
        super.update();

        // Then do whatever you want to do...
    }

}

export default GameObject;
