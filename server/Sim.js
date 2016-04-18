var p2 = require('p2');
var _ = require('lodash');
var config = require('./config');

function Sim(gameState) {

    this.gameState = gameState;

    this.scoreHandler = _.noop;
    this.destroyBlockHandler = _.noop;
    this.bounceHandler = _.noop;
    this.blockPlacedHandler = _.noop;

    this.reset();

    // simulation

    this.fixedTimeStep = 1/60;
    this.maxSubSteps = 10;
    this.lastTime = process.hrtime();

}

Sim.prototype.update = function SimUpdate() {

    var deltaTime = process.hrtime(this.lastTime);

    this.lastTime = process.hrtime();

    this.world.step( this.fixedTimeStep, deltaTime[1]/1e9, this.maxSubSteps );

    this.pendingRemoval.forEach(this.world.removeBody.bind(this.world));
    this.pendingRemoval = [];

    this.gameState.disc.pos.x = this.discBody.interpolatedPosition[0];
    this.gameState.disc.pos.y = this.discBody.interpolatedPosition[1];
    this.gameState.disc.angle = this.discBody.interpolatedAngle;;
    this.gameState.disc.vel.x = this.discBody.velocity[0];
    this.gameState.disc.vel.y = this.discBody.velocity[1];
};

Sim.prototype.reset = function SimReset() {
    // set up p2-based physics simulation

    this.pendingRemoval = [];

    this.world = new p2.World({
        islandSplit: false,
    });
    this.world.applyGravity = false;
    this.world.applySpringForces = false;
    this.world.applyDamping = false;
    this.world.on('beginContact', this.handleCollision.bind(this));
    this.world.on('endContact', this.handleEndCollision.bind(this));

    // create materials with no friction and perfect bounce

    this.discMaterial = new p2.Material();
    this.bounceMaterial = new p2.Material();

    var bounceContactMaterial = new p2.ContactMaterial(this.bounceMaterial, this.discMaterial, {
        friction : 0.0,
        restitution: 1.0,
    });
    bounceContactMaterial.stiffness = 1e12;
    // bounceContactMaterial.relaxation = 1;
    this.world.addContactMaterial(bounceContactMaterial);

    // Add a disc

    var discShape = new p2.Circle({ radius: config.DISC.DIAMETER/2 });
    discShape.material = this.discMaterial;
    this.discBody = new p2.Body({
        mass:1,
        position:[0, 0],
        angularVelocity: 0,
        angularDamping: 0,
        damping: 0,
        fixedRotation: true,
        velocity: [0, 0],
        allowSleep: false,
    });
    // start moving in random direction
    setTimeout( function() {
        p2.vec2.set( this.discBody.velocity, config.DISC.INITIAL_SPEED, 0 );
        p2.vec2.rotate( this.discBody.velocity, this.discBody.velocity, Math.random() * Math.PI * 2 );
    }.bind(this), config.DISC.MOVE_DELAY);
    this.discBody.customType = 'disc';
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

    // add goals

    var topGoalShape = new p2.Line({ length: config.GOAL.WIDTH });
    var bottomGoalShape = new p2.Line({ length: config.GOAL.WIDTH });
    topGoalShape.sensor = true;
    bottomGoalShape.sensor = true;
    topGoalBody = new p2.Body({ position: [0, -config.GRID.HEIGHT/2] });
    botGoalBody = new p2.Body({ position: [0, config.GRID.HEIGHT/2] });
    topGoalBody.addShape(topGoalShape);
    botGoalBody.addShape(bottomGoalShape);
    topGoalBody.damping = 0;
    botGoalBody.damping = 0;
    topGoalBody.customGoal = 'a';
    botGoalBody.customGoal = 'b';

    this.world.addBody(topGoalBody);
    this.world.addBody(botGoalBody);

    this.world.enableBodyCollision();
};

Sim.prototype.addBlock = function SimAddBlock(x, y, player) {

    // add block to sim

    if (this.gameState.grid[y][x] > 0) {
        return false;
    }

    var blockShape = new p2.Box({ width: 1.00, height: 1.00 });
    blockShape.material = this.bounceMaterial;

    var px = -1 * config.GRID.WIDTH/2 + 1/2 + x;
    var py = -1 * config.GRID.HEIGHT/2 + 1/2 + y;

    var blockBody = new p2.Body({ position: [px, py] });
    blockBody.addShape(blockShape);
    blockBody.customPlayer = player;
    blockBody.customType = 'block';
    blockBody.customGridPosition = [x,y];

    this.world.addBody(blockBody);

    // update gameState grid as well

    this.gameState.grid[y][x] = player === 'a' ? 1 : 2;

    this.blockPlacedHandler();

    return blockBody;
};

Sim.prototype.removeBlock = function SimRemoveBlock(x, y) {

    // find the block at x,y
    var block = _.find(this.world.bodies, { customGridPosition: [x,y] });
    var xy;

    // remove it from the world if it exists
    if (block) {
        this.pendingRemoval.push(block);
        xy = block.customGridPosition;

        // report back the destruction
        this.destroyBlockHandler({ x: xy[0], y: xy[1] }, block.customPlayer);
    }

    // update gameState grid as well
    this.gameState.grid[y][x] = 0;

    return block;
};

Sim.prototype.onBlockPlaced = function SimOnBlockPlaced(callback) {
    this.blockPlacedHandler = callback;
};
Sim.prototype.onScore = function SimOnScore(callback) {
    this.scoreHandler = callback;
};

Sim.prototype.onDestroyBlock = function simOnDestroyBlock(callback) {
    this.destroyBlockHandler = callback;
};

Sim.prototype.handleEndCollision = function SimHandleEndCollision(evt) {
    var obj1 = evt.bodyA;
    var obj2 = evt.bodyB;
    var disc;
    var vel;
    var speed;
    if (obj1.customType === 'disc') { disc = obj1; }
    if (obj2.customType === 'disc') { disc = obj2; }
    if (disc) {
        vel = p2.vec2.clone( disc.velocity );
        p2.vec2.normalize( vel, vel );
        p2.vec2.scale( vel, vel, config.DISC.BOUNCE_SPEEDUP );
        p2.vec2.add( disc.velocity, disc.velocity, vel );
        speed = p2.vec2.length(disc.velocity);
        if (speed > config.DISC.MAX_SPEED) {
            p2.vec2.normalize( disc.velocity, disc.velocity );
            p2.vec2.scale( disc.velocity, disc.velocity, config.DISC.MAX_SPEED );
        }
    }
    this.bounceHandler();
};

Sim.prototype.onBounce = function SimOnBounce(callback) {
    this.bounceHandler = callback;
}

Sim.prototype.handleCollision = function SimHandleCollision(evt) {
    var obj1 = evt.bodyA;
    var obj2 = evt.bodyB;
    if (obj1.customType === 'disc' && obj2.customType === 'block') {
        this.destroyBlockHandler({ x: obj2.customGridPosition[0], y: obj2.customGridPosition[1] }, obj2.customPlayer);
        this.pendingRemoval.push(obj2);
        this.gameState.grid[obj2.customGridPosition[1]][obj2.customGridPosition[0]] = 0;
    }
    else if (obj2.customType === 'disc' && obj1.customType === 'block') {
        this.destroyBlockHandler({ x: obj1.customGridPosition[0], y: obj1.customGridPosition[1] }, obj1.customPlayer);
        this.pendingRemoval.push(obj1);
        this.gameState.grid[obj1.customGridPosition[1]][obj1.customGridPosition[0]] = 0;
    }
    else if ([obj1.customGoal, obj2.customGoal].indexOf('a') >= 0) {
        this.scoreHandler('a');
    }
    else if ([obj1.customGoal, obj2.customGoal].indexOf('b') >= 0) {
        this.scoreHandler('b');
    }
};

Sim.prototype.makeWall = function SimMakeWall(position, size) {

    var wallShape = new p2.Box({ width: size[0], height: size[1] });
    wallShape.material = this.bounceMaterial;

    var wallBody = new p2.Body({ position: position });
    wallBody.addShape(wallShape);

    return wallBody;
};

module.exports = Sim;
