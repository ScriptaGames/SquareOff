var p2 = require('p2');

function Sim(grid) {

    var world = new p2.World({
        gravity: [0, 0]
    });

    // circle

    var circleBody = new p2.Body({
        mass: 5,
        position: [0,10],
    });

    var circleShape = new p2.Circle({ radius: 1 });
    circleBody.addShape(circleShape);

    world.addBody(circleBody);

    // walls

    var groundBody = new p2.Body({
        mass: 0,
    });
    var groundShape = new p2.Plane();
    groundBody.addShape(groundShape);

    world.addBody(groundBody);

    // simulation

    var fixedTimeStep = 1/60;
    var maxSubSteps = 10;
    var lastTime;
    var stepCount = 0;

    function step(time) {
        time = time || process.hrtime()[1] / 1e6;
        var deltaTime = lastTime ? (time - lastTime) / 1000 : 0;

        stepCount++;

        world.step( fixedTimeStep, deltaTime, maxSubSteps );

        var prettypos = [
            circleBody.interpolatedPosition[0].toFixed(4),
            circleBody.interpolatedPosition[1].toFixed(4),
        ];
        console.log(`${stepCount}: ${prettypos.join(' ')}`);

        lastTime = time;
    }

    // while (true) {
    //     step(0);
    // }
}

module.exports = Sim;



// var canvas, ctx, w, h,
// world, discBody, planeBody;

// init();
// animate();

// function init(){

//     // Init canvas
//     canvas = document.getElementById("myCanvas");
//     canvas.height = window.innerHeight;
//     canvas.width = window.innerWidth;
//     w = canvas.width;
//     h = canvas.height;

//     ctx = canvas.getContext("2d");
//     ctx.lineWidth = 0.02;

//     // Init p2.js
//     world = new p2.World({
//         gravity: [0,0],
//     });

//     world.applyGravity = false;
//     world.applySpringForces = false;
//     world.applyDamping = false;

//     // create some materials and material contacts

//     var wallMaterial = new p2.Material();
//     var discMaterial = new p2.Material();

//     var bounceContactMaterial = new p2.ContactMaterial(wallMaterial, discMaterial, {
//         friction : 0,
//         restitution: 1.0,
//     });
//     world.addContactMaterial(bounceContactMaterial);

//     // Add a disc
//     discShape = new p2.Circle({ radius: 0.85/2 });
//     discBody = new p2.Body({
//         mass:1,
//         position:[0, 0],
//         angularVelocity: 0,
//         velocity: [Math.random()*20 - 10, Math.random()*20 - 10],
//     });
//     discBody.addShape(discShape);
//     world.addBody(discBody);

//     // Add a plane
//     planeShape = new p2.Plane();
//     planeBody = new p2.Body();
//     planeBody.addShape(planeShape);
//     // world.addBody(planeBody);

//     leftWallShape = new p2.Box({ height: 20, width: 10 });
//     leftWallBody = new p2.Body({ position: [-10, 0], });
//     leftWallBody.addShape(leftWallShape);
//     world.addBody(leftWallBody);

//     rightWallShape = new p2.Box({ height: 20, width: 10 });
//     rightWallBody = new p2.Body({ position: [10, 0], });
//     rightWallBody.addShape(rightWallShape);
//     world.addBody(rightWallBody);

//     topWallShape = new p2.Box({ height: 10, width: 20 });
//     topWallBody = new p2.Body({ position: [0, 10], });
//     topWallBody.addShape(topWallShape);
//     world.addBody(topWallBody);

//     bottomWallShape = new p2.Box({ height: 10, width: 20 });
//     bottomWallBody = new p2.Body({ position: [0, -10], });
//     bottomWallBody.addShape(bottomWallShape);
//     world.addBody(bottomWallBody);

//     discShape.material = discMaterial;
//     leftWallShape.material = wallMaterial;
//     rightWallShape.material = wallMaterial;
//     topWallShape.material = wallMaterial;
//     bottomWallShape.material = wallMaterial;

//     world.enableBodyCollision();
// }

// function draw(){
//     ctx.beginPath();
//     var x = discBody.position[0],
//         y = discBody.position[1];
//     ctx.save();
//     // ctx.translate(x, y);        // Translate to the center of the box
//     // ctx.rotate(discBody.angle);  // Rotate to the box body frame
//     // ctx.rect(-discShape.radius, -discShape.radius, discShape.radius, discShape.radius);
//     ctx.beginPath();
//     ctx.arc( x, y, discShape.radius, 0, Math.PI*2, true);
//     ctx.closePath();
//     ctx.stroke();
//     ctx.fill();
//     ctx.strokeRect(-5, -5, 10, 10);
//     ctx.restore();
// }


// function render(){
//     // Clear the canvas
//     ctx.clearRect(0,0,w,h);

//     // Transform the canvas
//     // Note that we need to flip the y axis since Canvas pixel coordinates
//     // goes from top to bottom, while physics does the opposite.
//     ctx.save();
//     ctx.translate(w/2, h/2);  // Translate to the center
//     ctx.scale(50, -50);       // Zoom in and flip y axis

//     // Draw all bodies
//     draw();

//     // Restore transform
//     ctx.restore();
// }

// // Animation loop
// function animate(){
//     requestAnimationFrame(animate);

//     // Move physics bodies forward in time
//     world.step(1/60);

//     // Render scene
//     render();
// }
