import config from '../config';

class BlockObject extends Phaser.Sprite {
    constructor(game, grid, grid_x, grid_y, key, blockSize) {
        const x = game.world.centerX - grid.gridWidth / 2 + grid.blockWidth/2 + grid_x*grid.blockWidth;
        const y = game.world.centerY - grid.gridHeight / 2 + grid.blockHeight/2 + grid_y*grid.blockHeight;
        super(game, x, y, key, 0 );
        this.width = this.height = config.DISC.DIAMETER * blockSize;

        game.physics.p2.enable(this);

        this.body.fixedRotation = true;
        this.body.static = true;

    }

    update() {
        super.update();
        this.body.setZeroVelocity();
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


export default BlockObject;
