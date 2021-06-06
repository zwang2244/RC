/**
 *
 */

// All classes
var Engine = Matter.Engine,
    Render = Matter.Render,
    Runner = Matter.Runner,
    Composites = Matter.Composites,
    Composite = Matter.Composite,
    MouseConstraint = Matter.MouseConstraint,
    Mouse = Matter.Mouse,
    World = Matter.World,
    Bodies = Matter.Bodies,
    Body = Matter.Body,
    Common = Matter.Common,
    Vertices = Matter.Vertices,
    Svg = Matter.Svg,
    Constraint = Matter.Constraint;


// create engine
var engine = Engine.create(),
    world = engine.world;

// create renderer
var render = Render.create({
    element: document.body,
    engine: engine,
    bodyVelocity:true,
    options: {
        width: 1500,
        height: 750,
        wireframes: false,
        showStats: true, // @Zhilin: this option is customized below: Render.stats
        showVelocity: true,
    },
});

// run the renderer
Render.run(render);

// create and run the runner
var runner = Runner.create();
Runner.run(runner, engine);

// add bodies
World.add(world, [
    // walls
    Bodies.rectangle(400, 0, 800, 50, { isStatic: true }),
    Bodies.rectangle(400, 600, 800, 50, { isStatic: true }),
    Bodies.rectangle(800, 300, 50, 600, { isStatic: true }),
    Bodies.rectangle(0, 300, 50, 600, { isStatic: true })
]);

var scale = 0.5;
// var car1 = Bodies.circle(150,100,20 * scale);
// var car1 = Bodies.rectangle(150, 100, 30, 30, {
//     render: {
//         strokeStyle: '#ffffff',
//         sprite: {
//             texture: './images/cart.png',
//             xScale: 0.2,
//             yScale: 0.2
//         }
//     }
// });
// var car1 = Example.car.car(150, 100, 60 * scale, 30 * scale, 20 * scale);

/////car1/////
var xx = 150,
    yy = 100,
    width = 60*scale,
    height = 30*scale,
    wheelSize = 20*scale;
var group = Body.nextGroup(true),
    wheelBase = 20,
    wheelAOffset = -width * 0.5 + wheelBase,
    wheelBOffset = width * 0.5 - wheelBase,
    wheelYOffset = 0;

var car = Composite.create({ label: 'Car' }),
    body = Bodies.rectangle(xx, yy, width, height, {
        collisionFilter: {
            group: group
        },
        chamfer: {
            radius: height * 0.5
        },
        density: 0.0002,
        render: {
            strokeStyle: '#ffffff',
            sprite: {
                texture: './images/cart.png',
                xScale: 0.2,
                yScale: 0.2
            }
        }
    });

var wheelA = Bodies.circle(xx + wheelAOffset, yy + wheelYOffset, wheelSize, {
    collisionFilter: {
        group: group
    },
    friction: 0.8,
});

var wheelB = Bodies.circle(xx + wheelBOffset, yy + wheelYOffset, wheelSize, {
    collisionFilter: {
        group: group
    },
    friction: 0.8
});

var axelA = Constraint.create({
    bodyB: body,
    pointB: { x: wheelAOffset, y: wheelYOffset },
    bodyA: wheelA,
    stiffness: 1,
    length: 0
});

var axelB = Constraint.create({
    bodyB: body,
    pointB: { x: wheelBOffset, y: wheelYOffset },
    bodyA: wheelB,
    stiffness: 1,
    length: 0
});

Composite.addBody(car, body);
Composite.addBody(car, wheelA);
Composite.addBody(car, wheelB);
Composite.addConstraint(car, axelA);
Composite.addConstraint(car, axelB);

/////end/////
World.add(world, car);

// var car2 = Bodies.circle(150,100,20 * scale);
// World.add(world, car2);
// World.add(world, [Bodies.rectangle(200, 200, 100, 50, {friction: 0})]);

// 3 straight tracks
// World.add(world, [
//     Bodies.rectangle(200, 150, 400, 20, { isStatic: true, angle: Math.PI * 0.09 }),
//     Bodies.rectangle(500, 350, 650, 20, { isStatic: true, angle: -Math.PI * 0.06 }),
//     Bodies.rectangle(300, 560, 600, 20, { isStatic: true, angle: Math.PI * 0.04 })
// ]);

// console.log(car1.x);

// add tracks by loading svg pics
if (typeof fetch !== 'undefined') {
    var select = function(root, selector) {
        return Array.prototype.slice.call(root.querySelectorAll(selector));
    };

    var loadSvg = function(url) {
        return fetch(url)
            .then(function(response) { return response.text(); })
            .then(function(raw) { return (new window.DOMParser()).parseFromString(raw, 'image/svg+xml'); });
    };

    //load c1 curve
    loadSvg('./svg/c1.svg').then(function(root) {
        var color = Common.choose(['#f19648', '#f5d259', '#f55a3c', '#063e7b', '#ececd1']);

        var vertexSets = select(root, 'path')
            .map(function(path) { return Vertices.scale(Svg.pathToVertices(path, 30), 0.1, 0.1); });

        World.add(world, Bodies.fromVertices(200, 400, vertexSets, {
            render: {
                fillStyle: color,
                strokeStyle: color,
                lineWidth: 1
            },
            isStatic: true
        }, true));
    });

    //load c4 curve
    loadSvg('./svg/c4.svg').then(function(root) {
        var color = Common.choose(['#f19648', '#f5d259', '#f55a3c', '#063e7b', '#ececd1']);

        var vertexSets = select(root, 'path')
            .map(function(path) { return Vertices.scale(Svg.pathToVertices(path, 30), 0.05, 0.05); });

        World.add(world, Bodies.fromVertices(500, 500, vertexSets, {
            render: {
                fillStyle: color,
                strokeStyle: color,
                lineWidth: 1
            },
            isStatic: true
        }, true));
    });
} else {
    Common.warn('Fetch is not available. Could not load SVG.');
}

// add mouse control
var mouse = Mouse.create(render.canvas),
    mouseConstraint = MouseConstraint.create(engine, {
        mouse: mouse,
        constraint: {
            stiffness: 0.2,
            render: {
                visible: false
            }
        }
    });

World.add(world, mouseConstraint);

// keep the mouse in sync with rendering
render.mouse = mouse;

// fit the render viewport to the scene
Render.lookAt(render, {
    min: { x: 0, y: 0 },
    max: { x: 800, y: 600 }
});

/**
 * Creates a composite with simple car setup of bodies and constraints.
 * @Zhilin: Customize here!
 * @method car
 * @param {number} xx
 * @param {number} yy
 * @param {number} width
 * @param {number} height
 * @param {number} wheelSize
 * @return {composite} A new composite car body
 */
/**
 * Creates a composite with simple car setup of bodies and constraints.
 * @method car
 * @param {number} xx
 * @param {number} yy
 * @param {number} width
 * @param {number} height
 * @param {number} wheelSize
 * @return {composite} A new composite car body
 */
Example.car.car = function(xx, yy, width, height, wheelSize) {
    var group = Body.nextGroup(true),
        wheelBase = 20,
        wheelAOffset = -width * 0.5 + wheelBase,
        wheelBOffset = width * 0.5 - wheelBase,
        wheelYOffset = 0;

    var car = Composite.create({ label: 'Car' }),
        body = Bodies.rectangle(xx, yy, width, height, {
            collisionFilter: {
                group: group
            },
            chamfer: {
                radius: height * 0.5
            },
            density: 0.0002,
            render: {
                strokeStyle: '#ffffff',
                sprite: {
                    texture: './images/cart.png',
                    xScale: 1,
                    yScale: 1
                }
            }
        });

    var wheelA = Bodies.circle(xx + wheelAOffset, yy + wheelYOffset, wheelSize, {
        collisionFilter: {
            group: group
        },
        friction: 0.8,
    });

    var wheelB = Bodies.circle(xx + wheelBOffset, yy + wheelYOffset, wheelSize, {
        collisionFilter: {
            group: group
        },
        friction: 0.8
    });

    var axelA = Constraint.create({
        bodyB: body,
        pointB: { x: wheelAOffset, y: wheelYOffset },
        bodyA: wheelA,
        stiffness: 1,
        length: 0
    });

    var axelB = Constraint.create({
        bodyB: body,
        pointB: { x: wheelBOffset, y: wheelYOffset },
        bodyA: wheelB,
        stiffness: 1,
        length: 0
    });

    Composite.addBody(car, body);
    Composite.addBody(car, wheelA);
    Composite.addBody(car, wheelB);
    Composite.addConstraint(car, axelA);
    Composite.addConstraint(car, axelB);

    return car;
};



Render.stats = function(render, context, time) {
    var engine = render.engine,
        world = engine.world,
        bodies = Composite.allBodies(world),
        parts = 0,
        width = 80,
        height = 44,
        x = 0,
        y = 0;

    // count parts
    for (var i = 0; i < bodies.length; i += 1) {
        parts += bodies[i].parts.length;
    }

    //console.log(bodies[4].speed);
    // sections
    var sections = {
        'Car': 'Car 1',
        'Position x': bodies[7].position.x.toFixed(2),
        'Position y': bodies[7].position.y.toFixed(2),
        'Velocity x': bodies[7].velocity.x.toFixed(2),
        'Velocity y': bodies[7].velocity.y.toFixed(2),
        'Speed': bodies[7].speed.toFixed(2),
        'Friction': bodies[7].friction.toFixed(2),
        'Force x': bodies[7].force.x.toFixed(2),
        'Force y': bodies[7].force.y.toFixed(2),
        'Torque': bodies[7].torque.toFixed(2),
    };

    // background
    context.fillStyle = '#0e0f19';
    context.fillRect(x, y, width * 5.5, height);

    context.font = '15px Arial';
    context.textBaseline = 'top';
    context.textAlign = 'right';

    // sections
    for (var key in sections) {
        var section = sections[key];
        // label
        context.fillStyle = '#aaa';
        context.fillText(key, x + width, y + 8);

        // value
        context.fillStyle = '#eee';
        context.fillText(section, x + width, y + 26);

        x += width;
    }
};

// create demo interface
// not required to use Matter.js

// MatterTools.Demo.create({
//     toolbar: {
//         title: 'ROLLER COASTER V1',
//         // url: 'https://github.com/liabru/matter-js',
//         reset: true,
//         source: true,
//         fullscreen: true,
//         exampleSelect: true
//     },
//     preventZoom: true,
//     // resetOnOrientation: true,
//     examples: [
//         {
//             name: 'Roller_Coaster',
//             id: 'rc',
//             init: Example.rc
//         }
//     ]
// });


