import config from '../config';

class DiscObject extends Phaser.Sprite {
    constructor(game, x, y, key, blockSize) {
        super(game, x, y, key, 0 );

        this.game = game;

        this.anchor.x = 0.5;
        this.anchor.y = 0.5;
        this.exploding = false;
        this.width = this.height = config.DISC.DIAMETER * blockSize;

        // game.physics.p2.enable(this);

        // this.body.setCircle(this.width/2);

        // this.body.fixedRotation = true;
        // this.body.velocity.x = 0;
        // this.body.velocity.y = 0;

        // this.body.damping = 0;


        this.emitter = game.add.emitter(x, y, 1000);

        this.emitter.makeParticles( ['disc-particle'] );

        this.emitter.gravity = 0;
        this.emitter.setAlpha(0.2, 0, 5000);
        this.emitter.setScale(0.4, 0, 0.5, 0, 5000);
        this.emitter.minParticleSpeed = new Phaser.Point(-38, -38);
        this.emitter.maxParticleSpeed = new Phaser.Point(38, 38);

        this.emitter.start(false, 5000, 15);

    }

    explode(direction) {
        this.exploding = true;
        this.emitter.explode(2000, 200)
        this.emitter.minParticleSpeed = new Phaser.Point(-75, -150);
        this.emitter.maxParticleSpeed = new Phaser.Point(75, 150);
        this.emitter.setYSpeed( direction * 200, direction * 350 );
        let timer = this.game.time.create(true);
        timer.add( 618, this.stopExplode, this );
        timer.start();
    }

    stopExplode() {
        this.exploding = false;
        this.emitter.minParticleSpeed = new Phaser.Point(-38, -38);
        this.emitter.maxParticleSpeed = new Phaser.Point(38, 38);
        this.emitter.frequency = 15;
    }

    update() {
        super.update();
        if (!this.exploding) {
            this.emitter.emitX = this.position.x;
            this.emitter.emitY = this.position.y;
        }
    }

    destroy(destroyChildren) {
        super.destroy();
        this.emitter.destroy();
    }
}

export default DiscObject;
