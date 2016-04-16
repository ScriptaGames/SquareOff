import config from '../config';

class DiscObject extends Phaser.Sprite {
    constructor(game, x, y, key, blockSize) {
        super(game, x, y, key, 0 );
        this.anchor.x = 0.5;
        this.anchor.y = 0.5;
        this.width = this.height = config.DISC.DIAMETER * blockSize;

        game.physics.p2.enable(this);
    }

    update() {
        super.update();

        this.body.rotateRight(10);
        this.body.thrust(40);
    }
}

// export default class DiscObject extends Phaser.Particles.Arcade.Emitter {
//     constructor(game, x, y, maxParticles) {
//         super(game, x, y, maxParticles);

//         this.makeParticles('plane');

//         this.setRotation(0,0);
//         this.setAlpha(1, 1);
//         this.setScale( 0.5, 1);
//         this.gravity = -200;

//         this.start(false, 5000, 500);

//     }

//     update() {
//     }
// }


export default DiscObject;
