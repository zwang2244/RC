/**
 *
 **/
var Example = Example || {};

Example.rc = function() {
    var Engine = Matter.Engine,
        Render = Matter.Render,
        Runner = Matter.Runner,
        Composites = Matter.Composites,
        MouseConstraint = Matter.MouseConstraint,
        Mouse = Matter.Mouse,
        World = Matter.World,
        Bodies = Matter.Bodies;

    var Common = Matter.Common,
        Vertices = Matter.Vertices,
        Svg = Matter.Svg;

    // create engine
    var engine = Engine.create(),
        world = engine.world;



    // create renderer
    var render = Render.create({
        element: document.body,
        engine: engine,
        options: {
            width: 1000,
            height: 800,
            wireframes: false
        }
    });

    Render.run(render);

    // create runner
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

    var scale = 0.9;
    World.add(world, Example.car.car(150, 100, 100 * scale, 40 * scale, 30 * scale));

    scale = 0.8;
    World.add(world, Example.car.car(350, 300, 100 * scale, 40 * scale, 30 * scale));
    World.add(world, [Bodies.rectangle(200, 200, 100, 50, {friction: 0})]);
    // var CUSTOM_PATH = '425.6 327 273.8';
    World.add(world, [
        Bodies.rectangle(200, 150, 400, 20, { isStatic: true, angle: Math.PI * 0.09 }),
        // Bodies.rectangle(500, 350, 650, 20, { isStatic: true, angle: -Math.PI * 0.06 }),
        // Bodies.rectangle(300, 560, 600, 20, { isStatic: true, angle: Math.PI * 0.04 })

        // Bodies.fromVertices(300, 300,  Matter.Vertices.fromPath(CUSTOM_PATH))
    ]);

    //ADD TRACK
    // add bodies
    if (typeof fetch !== 'undefined') {
        var select = function(root, selector) {
            return Array.prototype.slice.call(root.querySelectorAll(selector));
        };

        var loadSvg = function(url) {
            return fetch(url)
                .then(function(response) { return response.text(); })
                .then(function(raw) { return (new window.DOMParser()).parseFromString(raw, 'image/svg+xml'); });
        };

        ([
            './svg/c1.svg',
            // './svg/iconmonstr-paperclip-2-icon.svg',
            // './svg/iconmonstr-puzzle-icon.svg',
            // './svg/iconmonstr-user-icon.svg'
        ]).forEach(function(path, i) {
            loadSvg(path).then(function(root) {
                var color = Common.choose(['#f19648', '#f5d259', '#f55a3c', '#063e7b', '#ececd1']);

                var vertexSets = select(root, 'path')
                    .map(function(path) { return Vertices.scale(Svg.pathToVertices(path, 30), 0.1, 0.1); });

                World.add(world, Bodies.fromVertices(200 + i * 150, 500 + i * 50, vertexSets, {
                    render: {
                        fillStyle: color,
                        strokeStyle: color,
                        lineWidth: 1
                    },
                    isStatic: true
                }, true));
            });
        });

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

    // context for MatterTools.Demo
    return {
        engine: engine,
        runner: runner,
        render: render,
        canvas: render.canvas,
        stop: function() {
            Matter.Render.stop(render);
            Matter.Runner.stop(runner);
        }
    };
};


/**
 * Creates a composite with simple car setup of bodies and constraints.
 * @Zhilin: Customize here!!
 * @method car
 * @param {number} xx
 * @param {number} yy
 * @param {number} width
 * @param {number} height
 * @param {number} wheelSize
 * @return {composite} A new composite car body
 */
Example.car.car = function(xx, yy, width, height, wheelSize) {
    var Body = Matter.Body,
        Bodies = Matter.Bodies,
        Composite = Matter.Composite,
        Constraint = Matter.Constraint;



    var group = Body.nextGroup(true),
        wheelBase = 25,
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
            density: 0.0002
        });

    var wheelA = Bodies.circle(xx + wheelAOffset, yy + wheelYOffset, wheelSize, {
        collisionFilter: {
            group: group
        },
        friction: 0
    });

    var wheelB = Bodies.circle(xx + wheelBOffset, yy + wheelYOffset, wheelSize, {
        collisionFilter: {
            group: group
        },
        friction: 0
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


// create demo interface
// not required to use Matter.js

MatterTools.Demo.create({
    toolbar: {
        title: 'ROLLER COASTER V1',
        // url: 'https://github.com/liabru/matter-js',
        reset: true,
        source: true,
        fullscreen: true,
        exampleSelect: true
    },
    preventZoom: true,
    // resetOnOrientation: true,
    examples: [
        {
            name: 'Roller_Coaster',
            id: 'rc',
            init: Example.rc
        }
    ]
});


