var game = new Phaser.Game('100%', '100%', Phaser.AUTO, 'game', { preload: preload, create: create, update:update, render:render });

var boat,
    emitter,
    cursors,
    space,
    circle,
    map;

function preload() {

    //  You can fill the preloader with as many assets as your game requires

    //  Here we are loading an image. The first parameter is the unique
    //  string by which we'll identify the image later in our code.

    //  The second parameter is the URL of the image (relative)
    game.load.image('map', 'assets/pics/map1_slow.png');
    game.load.image('boat1', 'assets/pics/boat2.png');
    game.load.image('trail', 'assets/pics/boatTrail.png');

}

function create() {

    //  This creates a simple sprite that is using our loaded image and
    //  displays it on-screen


    game.physics.startSystem(Phaser.Physics.P2JS);
    map = game.add.sprite(0, 0, 4041, 2883, 'map');

    game.physics.p2.enable([map], true);

    game.world.setBounds(0, 0, 4041, 2883);

    game.physics.startSystem(Phaser.Physics.ARCADE);

  emitter = game.add.emitter(0, 0, 100);

    var graphics = game.add.graphics(0, 0);

    // graphics.lineStyle(2, 0xffd900, 1);

    graphics.beginFill('black', 1);

   circle =  graphics.drawCircle(0, 0, 30);

    sprite = game.add.sprite(200, 200, 'boat1');
    sprite.anchor.setTo(0.5, 0.5);

    game.physics.enable(sprite, Phaser.Physics.ARCADE);

    cursors = game.input.keyboard.createCursorKeys();

    game.camera.follow(circle);

    //game.camera.deadzone = new Phaser.Rectangle(100, 100, 50, 50);
  emitter.makeParticles('trail');
  
  // Attach the emitter to the sprite
  //sprite.addChild(emitter);
  
  //position the emitter relative to the sprite's anchor location
  emitter.y = 0;
  emitter.x = -16;
  
  // setup options for the emitter
  emitter.lifespan = 200;

    sprite.body.collideWorldBounds = true;
    sprite.body.maxVelocity.x = 500;
    sprite.body.maxVelocity.y = 500;
    sprite.body.drag.set(200);

    space = game.input.keyboard.addKey(Phaser.Keyboard.ONE);
    space.onDown.add(bounce, this);



}
var speed = 0;
var bouncing = false;

function update() {

    //sprite.body.velocity.x = 0;
    //sprite.body.velocity.y = 0;
    sprite.body.angularVelocity = 0;

    if (game.input.keyboard.isDown(Phaser.Keyboard.LEFT) && speed > 10)
    {
        sprite.body.angularVelocity = -200;
    }
    else if (game.input.keyboard.isDown(Phaser.Keyboard.RIGHT) && speed > 10)
    {
        sprite.body.angularVelocity = 200;
    }

    if (game.input.keyboard.isDown(Phaser.Keyboard.UP))
    {
        speed = speed < 500 ? speed + 10 : 500;
        //game.physics.arcade.velocityFromAngle(sprite.angle, 500, sprite.body.velocity);
       // game.physics.arcade.accelerationFromRotation(sprite.rotation, 500, sprite.body.velocity);
        emitter.emitParticle();
    } else {
        speed = speed > 0 ? speed - 10 : 0;
    }

    game.physics.arcade.accelerationFromRotation(sprite.rotation, speed, sprite.body.velocity);

    emitter.x = sprite.x ;
    emitter.y = sprite.y;

    if(bouncing === true){

    circle.x = sprite.x;
    } else {

    circle.x = sprite.x;
    circle.y = sprite.y;
    }

    emitter.rotation = -this.rotation;

}

function bounce() {

    //ball.y = 0;
    bouncing = true;
    var bounce=game.add.tween(sprite);

    bounce.to({ y: sprite.y - 50 }, 200).to({ y: sprite.y}, 200);
    
    bounce.onComplete.add(function(){
        bouncing = false;
    }, this);
    bounce.start();

}
function render() {


}