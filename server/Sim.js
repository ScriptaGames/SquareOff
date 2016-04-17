var p2 = require('p2');
var _ = require('lodash');
var config = require('./config');

function Sim(gameState) {

    this.gameState = gameState;

    this.scoreHandler = _.noop;

    // var self = this;
    // setInterval( function() { self.scoreHandler(); }, 500 );

    this.reset();

    // simulation

    // var fixedTimeStep = 1/60;
    // var maxSubSteps = 10;
    // var lastTime;
    // var stepCount = 0;

    // function step(time) {
    //     time = time || process.hrtime()[1] / 1e6;
    //     var deltaTime = lastTime ? (time - lastTime) / 1000 : 0;

    //     stepCount++;

    //     world.step( fixedTimeStep, deltaTime, maxSubSteps );

    //     var prettypos = [
    //         circleBody.interpolatedPosition[0].toFixed(4),
    //         circleBody.interpolatedPosition[1].toFixed(4),
    //     ];
    //     console.log(`${stepCount}: ${prettypos.join(' ')}`);

    //     lastTime = time;
    // }

}

Sim.prototype.update = function SimUpdate(timescale) {
    console.log("SIM UPDATE TIMESCALE NOT HONORED");
    this.world.step(1/60);

    this.gameState.disc.pos.x = this.discBody.position[0];
    this.gameState.disc.pos.y = this.discBody.position[1];
};

Sim.prototype.reset = function SimReset() {
    // set up p2-based physics simulation

    this.world = new p2.World();
    this.world.applyGravity = false;
    this.world.applySpringForces = false;
    this.world.applyDamping = false;

    // create materials with no friction and perfect bounce

    this.discMaterial = new p2.Material();
    this.bounceMaterial = new p2.Material();

    var bounceContactMaterial = new p2.ContactMaterial(this.bounceMaterial, this.discMaterial, {
        friction : 0,
        restitution: 1.0,
    });
    this.world.addContactMaterial(bounceContactMaterial);

    // Add a disc

    var discShape = new p2.Circle({ radius: config.DISC.DIAMETER/2 });
    discShape.material = this.discMaterial;
    this.discBody = new p2.Body({
        mass:1,
        position:[0, 0],
        angularVelocity: 0,
        velocity: [Math.random()*20 - 10, Math.random()*20 - 10],
    });
    this.discBody.addShape(discShape);
    this.world.addBody(this.discBody);

    // add some walls

    var topWall    = this.makeWall( [0, config.GRID.HEIGHT/2 + config.GRID.WALL_DEPTH/2],  [config.GRID.WIDTH*2, config.GRID.WALL_DEPTH] );
    var bottomWall = this.makeWall( [0, -config.GRID.HEIGHT/2 - config.GRID.WALL_DEPTH/2], [config.GRID.WIDTH*2, config.GRID.WALL_DEPTH] );
    var rightWall  = this.makeWall( [config.GRID.WIDTH/2 + config.GRID.WALL_DEPTH/2, 0],   [config.GRID.WALL_DEPTH, config.GRID.HEIGHT*2] );
    var leftWall   = this.makeWall( [-config.GRID.WIDTH/2 - config.GRID.WALL_DEPTH/2, 0],  [config.GRID.WALL_DEPTH, config.GRID.HEIGHT*2] );

    this.world.addBody( topWall    );
    this.world.addBody( bottomWall );
    this.world.addBody( rightWall  );
    this.world.addBody( leftWall   );

    this.world.enableBodyCollision();
};

Sim.prototype.addBlock = function SimAddBlock() {
    console.log("SIM ADDBLOCK NOT IMPLEMENTED");
};

Sim.prototype.onScore = function SimOnScore(callback) {
    this.scoreHandler = callback;
    console.log("SIM ONSCORE NOT IMPLEMENTED");
};

Sim.prototype.makeWall = function SimMakeWall(position, size) {

    var wallShape = new p2.Box({ width: size[0], height: size[1] });
    wallShape.material = this.bounceMaterial;

    var wallBody = new p2.Body({ position: position });
    wallBody.addShape(wallShape);

    return wallBody;
};

module.exports = Sim;
