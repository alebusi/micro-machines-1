var game = new Phaser.Game("100%", "100%", Phaser.AUTO, 'game', { preload: preload, create: create, update:update, render: render});

var speed = 0,
    levelMap,
    slowLayerBodies,
    player,
    background,
    emitter,
    polys = [],
    checkpoints = [],
    finishLine = {},
    jumps = [],
    graphics,
    circle;

var s;

function preload() {
    game.load.image('background', 'assets/pics/map1.png');
    game.load.image('boat1', 'assets/pics/boat2.png');
    game.load.image('trail', 'assets/pics/boatTrail.png');
    game.load.tilemap('levelData', 'assets/levels/levelOne.json', null, Phaser.Tilemap.TILED_JSON);
    game.load.physics('physicsData', 'assets/levels/levelOne.json');
}

function create() {
    game.renderer.renderSession.roundPixels = true
    console.log(game.cache.getPhysicsData('physicsData'))
    var cacheData = game.cache.getPhysicsData('physicsData');

    //Setup physics system
    game.physics.startSystem(Phaser.Physics.P2JS);

    //Load level data for collision areas
    levelMap = game.add.tilemap('levelData');
    slowLayerBodies = game.physics.p2.convertCollisionObjects(levelMap, "collide", true);

    //add background image and set world size
    background = game.add.tileSprite(0, 0, 4040, 2880, 'background');
    game.world.setBounds(0, 0, 4041, 2883);

    //setup player emitter. Needs to be first so its below player
    emitter = game.add.emitter(0, 0, 100);      
    emitter.makeParticles('trail');
    emitter.y = 0;
    emitter.x = -16;
    emitter.lifespan = 200;


    cacheData.layers.filter(function (layer){
        return layer.name === 'startPos';
    }).forEach(function (layer){
        layer.objects.forEach(function (obj) {
            if (obj.properties.hasOwnProperty('player') && obj.properties.player === '1') {
                player = game.add.sprite(obj.x, obj.y, 'boat1'); 
                player.angle = obj.properties.angle;
            }
        });
    });


    //setup player
    game.physics.p2.enable(player);
    game.camera.follow(player);   

    //init input
    cursors = game.input.keyboard.createCursorKeys();

    graphics = game.add.graphics(0, 0);

    graphics.beginFill(0xFF33ff, 0.5);

    cacheData.layers.filter(function (layer){
        return layer.name === 'slow';
    }).forEach(function (layer){
        layer.objects.forEach(function (obj) {
            var poly = new Phaser.Polygon(obj.polyline.map(function (p) {

                return new Phaser.Point(obj.x, obj.y).add(p.x, p.y);
            }));
           // graphics.drawPolygon(poly.points);
            polys.push(poly);
        });
    });

    cacheData.layers.filter(function (layer){
        return layer.name === 'checkpoints';
    }).forEach(function (layer){
        layer.objects.forEach(function (obj) {
            var poly = new Phaser.Polygon(obj.polyline.map(function (p) {

                return new Phaser.Point(obj.x, obj.y).add(p.x, p.y);
            }));
            graphics.drawPolygon(poly.points);
            poly.ID = parseInt(obj.properties.order);
            checkpoints.push(poly);
        });
    });

    cacheData.layers.filter(function (layer){
        return layer.name === 'jump';
    }).forEach(function (layer){
        layer.objects.forEach(function (obj) {
            var poly = new Phaser.Polygon(obj.polyline.map(function (p) {

                return new Phaser.Point(obj.x, obj.y).add(p.x, p.y);
            }));
            jumps.push(poly);
        });
    });


    graphics.endFill();

    cacheData.layers.filter(function (layer){
        return layer.name === 'finishLine';
    }).forEach(function (layer){
        finishLine = new Phaser.Polygon(layer.objects[0].polyline.map(function (p) {

            return new Phaser.Point(layer.objects[0].x, layer.objects[0].y).add(p.x, p.y);
        }));
    });

            s = game.add.tween(player.scale);
            s.to({x: 1.5, y:1.5}, 300, Phaser.Easing.Linear.None);
            s.to({x: 1, y:1}, 300, Phaser.Easing.Linear.None);
}
var maxSpeed = 500;
var isInCheckpoint = false;

var lapCount = 0,
    passedCheck = {};

function checkProgress(){
    var keys = Object.keys(passedCheck);
    return keys.length === checkpoints.length;
}

function moveToCenter () {
    var key = Object.keys(passedCheck).map(function(i){ return parseInt(i); }).sort(function(a, b){
        return b - a;
    })[0],
        checkpoint,
        center;

    if (key !== undefined) {
        checkpoint = checkpoints.filter(function (i) {
            //key is string, ID is int
            return i.ID == key;
        })[0];

      player.kill();
        center = getCenter(checkpoint.points);
      player.reset(center.x, center.y);
    }
}

var getCenter = function(arr)
{
    var x = arr.map(function(a){ return a.x });
    var y = arr.map(function(a){ return a.y });
    var minX = Math.min.apply(null, x);
    var maxX = Math.max.apply(null, x);
    var minY = Math.min.apply(null, y);
    var maxY = Math.max.apply(null, y);
    return {x: ((minX + maxX)/2), y: ((minY + maxY)/2)};
}

function update() {
maxSpeed = 500;
    polys.forEach(function (p){
        if (p.contains(player.x, player.y)) {
            maxSpeed = 200;
        }
    });

    for (var i = 0; i < checkpoints.length; i ++) {
        if (checkpoints[i].contains(player.x, player.y) && !passedCheck.hasOwnProperty(checkpoints[i].ID)) {
            var keys = Object.keys(passedCheck).sort(),
                currentKey = parseInt(keys[keys.length -1]) +1;

            if (checkpoints[i].ID === 0 || currentKey === checkpoints[i].ID) {
              passedCheck[checkpoints[i].ID] = true;
            }
        }
    }

    if (finishLine.contains(player.x, player.y) && checkProgress()) {
        lapCount += 1;
        passedCheck = {};
    }

    //checkpoints.forEach(function (check) {
    //});

    jumps.forEach(function (jump) {
        if(jump.contains(player.x, player.y) && !s.isRunning) {
            s.start();
        }
    });

    player.body.angularVelocity = 0;

    if (cursors.left.isDown && !s.isRunning)
    {
        player.body.angularVelocity = -5;
    }
    else if (cursors.right.isDown && !s.isRunning)
    {
        player.body.angularVelocity = 5;
    }

    if (cursors.up.isDown)
    {
        speed = speed < maxSpeed ? speed + 10 : maxSpeed;
        emitter.emitParticle();
    } else {
        speed = speed > 0 ? speed - 10 : 0;
    }

    if (cursors.down.isDown) {
        moveToCenter();
    }


    emitter.x = player.x ;
    emitter.y = player.y;
   //circle.x = player.x;
    //circle.y = player.y;

    player.body.moveForward(speed)    
}

function render() {

    game.debug.text('Lap: ' + lapCount, 32, 32, 'black');
    game.debug.text(JSON.stringify(passedCheck), 32, 64, 'black');

}