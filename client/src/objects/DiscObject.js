import config from '../config';

class DiscObject extends Phaser.Sprite {
    constructor(game, x, y, key, blockSize) {
        super(game, x, y, key, 0 );

        this.game = game;

        this.initVelocityData();

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

        this.emitter.frequency = 100;
        this.emitter.gravity = 0;
        this.emitter.width = 0;// config.DISC.DIAMETER * blockSize * 2/3;
        this.emitter.height = 0;// config.DISC.DIAMETER * blockSize * 2/3;
        this.emitter.setAlpha(0.5, 0, 1600);
        this.emitter.setRotation(0, 0);
        // this.emitter.setScale(config.DISC.DIAMETER, config.DISC.DIAMETER, config.DISC.DIAMETER, config.DISC.DIAMETER, 1600);
        this.emitter.minParticleScale = config.DISC.DIAMETER * 0.82;
        this.emitter.maxParticleScale = config.DISC.DIAMETER * 0.82;
        this.emitter.minParticleSpeed = new Phaser.Point(0, 0);
        this.emitter.maxParticleSpeed = new Phaser.Point(0, 0);

        this.emitter.start(false, 1600, 140);
    }

    explode(direction) {
        this.exploding = true;
        this.emitter.minParticleSpeed = new Phaser.Point(-400, -400);
        this.emitter.maxParticleSpeed = new Phaser.Point(400, 400);
        this.emitter.explode(1000, 200)
        // this.emitter.setYSpeed( direction * 200, direction * 350 );
        let timer = this.game.time.create(true);
        timer.add( 618, this.stopExplode, this );
        timer.start();
    }

    stopExplode() {
        this.exploding = false;
        this.emitter.minParticleSpeed = new Phaser.Point(0, 0);
        this.emitter.maxParticleSpeed = new Phaser.Point(0, 0);
        this.emitter.frequency = 140;
    }

    update() {
        super.update();
        if (!this.exploding) {
            this.emitter.emitX = this.position.x;
            this.emitter.emitY = this.position.y;
            this.position.add(this.data.velocity.x, this.data.velocity.y);
        }
    }

    destroy(destroyChildren) {
        super.destroy();
        this.emitter.destroy();
        this.initVelocityData();
    }

    initVelocityData() {
        this.data.velocity = new Phaser.Point();
    }
}

export default DiscObject;
