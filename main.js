/**
 * Duy Huynh
 * TCSS 491, Winter '16
 * Assignment 1 - Animation
 * main.js
 *
 * Main for Assignment 1. Animating Spaz from the Jazz Jackrabbit video game series by Epic MegaGames.
 *
 * Resources:
 *              Code: Based off of Chris Marriott's main.js
 *              Background Image: http://imgur.com/gallery/VZ9H2
 *              Spaz sprites: http://www.spriters-resource.com/pc_computer/jazzjackrabbit2thesecretfiles/sheet/22144/
 *
 */

/**
 * Animate a sprite sheet:
 * @param spriteSheet
 * @param startX
 * @param startY
 * @param frameWidth
 * @param frameHeight
 * @param frameDuration
 * @param frames
 * @param loop
 * @param reverse
 * @constructor
 */
function Animation(spriteSheet, startX, startY, frameWidth, frameHeight, frameDuration, frames, loop, reverse) {
    this.spriteSheet = spriteSheet;
    this.startX = startX;
    this.startY = startY;
    this.frameWidth = frameWidth;
    this.frameDuration = frameDuration;
    this.frameHeight = frameHeight;
    this.frames = frames;
    this.totalTime = frameDuration * frames;
    this.elapsedTime = 0;
    this.loop = loop;
    this.reverse = reverse;
}

Animation.prototype.drawFrame = function (tick, ctx, x, y, scaleBy) {
    var scaleBy = scaleBy || 1;
    this.elapsedTime += tick;
    if (this.loop) {
        if (this.isDone()) {
            this.elapsedTime = 0;
        }
    } else if (this.isDone()) {
        return;
    }
    var index = this.reverse ? this.frames - this.currentFrame() - 1 : this.currentFrame();
    var vindex = 0;
    if ((index + 1) * this.frameWidth + this.startX > this.spriteSheet.width) {
        index -= Math.floor((this.spriteSheet.width - this.startX) / this.frameWidth);
        vindex++;
    }
    while ((index + 1) * this.frameWidth > this.spriteSheet.width) {
        index -= Math.floor(this.spriteSheet.width / this.frameWidth);
        vindex++;
    }

    var locX = x;
    var locY = y;
    var offset = vindex === 0 ? this.startX : 0;
    ctx.drawImage(this.spriteSheet,
        index * this.frameWidth + offset, vindex * this.frameHeight + this.startY,  // source from sheet
        this.frameWidth, this.frameHeight,
        locX, locY,
        this.frameWidth * scaleBy,
        this.frameHeight * scaleBy);
}

/**
 * Returns which frame the animation is on.
 * @returns {number}
 */
Animation.prototype.currentFrame = function () {
    return Math.floor(this.elapsedTime / this.frameDuration);
}

/**
 * Returns whether or not the animation is finished.
 * @returns {boolean}
 */
Animation.prototype.isDone = function () {
    return (this.elapsedTime >= this.totalTime);
}

function Background(game) {
    Entity.call(this, game, 0, 400); // What does "call" do? Constructor?
    //this.radius = 200;
}

Background.prototype = new Entity();
Background.prototype.constructor = Background;

Background.prototype.update = function () {
}

Background.prototype.draw = function (ctx) {
    ctx.fillStyle = "Blue";
    //ctx.fillRect(0, 500, 800, 300);
    ctx.drawImage(ASSET_MANAGER.getAsset("./img/8bitbg.png"), 0, 0);
    Entity.prototype.draw.call(this);
}

function Spaz(game) {

    // Animations:
    this.standAnimation = new Animation(ASSET_MANAGER.getAsset("./img/spaz_frames.png"), 0, 0, 56, 52, 0.1, 6, true, false);
    this.idleAnimation = new Animation(ASSET_MANAGER.getAsset("./img/spaz_frames.png"), 336, 0, 56, 52, 0.1, 20, true, false);
    this.runRightAnimation = new Animation(ASSET_MANAGER.getAsset("./img/spaz_frames.png"), 1456, 0, 56, 52, 0.1, 8, true, false);
    this.runLeftAnimation = new Animation(ASSET_MANAGER.getAsset("./img/spaz_frames.png"), 1904, 0, 56, 52, 0.1, 8, true, false);
    this.skidRightAnimation = new Animation(ASSET_MANAGER.getAsset("./img/spaz_frames.png"), 2352, 0, 56, 52, 0.1, 14, false, false);
    this.skidLeftAnimation = new Animation(ASSET_MANAGER.getAsset("./img/spaz_frames.png"), 3136, 0, 56, 52, 0.1, 14, false, false);
    this.jumpAnimation = new Animation(ASSET_MANAGER.getAsset("./img/spaz_frames.png"), 3920, 0, 56, 52, 0.05, 17, false, false);

    // States:
    this.standing = true;
    this.idle = 0;
    this.jumping = false;
    this.running = false;
    this.skidLeft = false;
    this.skidRight = false;

    // Entity properties:
    this.radius = 50;
    this.ground = 300;
    this.speed = 5;
    this.width = 50;
    this.height = 50;
    Entity.call(this, game, 0, this.ground);
}

Spaz.prototype = new Entity();
Spaz.prototype.constructor = Spaz;

Spaz.prototype.update = function () {

    // Jumping:
    if (this.game.space) this.jumping = true;

    // If Spaz is set to jump:
    if (this.jumping) {

        // If Spaz is finished jumping:
        if (this.jumpAnimation.isDone()) {
            // Reset jump animation timer
            this.jumpAnimation.elapsedTime = 0;
            // Reset 'jump' state.
            this.jumping = false;

        }
        var jumpDistance = this.jumpAnimation.elapsedTime / this.jumpAnimation.totalTime;
        var totalHeight = 100;

        if (jumpDistance > 0.5)
            jumpDistance = 1 - jumpDistance;

        //var height = jumpDistance * 2 * totalHeight;
        var height = totalHeight * (-2 * (jumpDistance * jumpDistance - jumpDistance));
        this.y = this.ground - height;
    }

    // Running right and left:
    this.game.right || this.game.left ? this.running = true : this.running = false;


    // Running and boundary collisions:
    if (this.running) {
        if (this.game.right && this.x < this.game.surfaceWidth - this.width) this.x += this.speed;
        if (this.game.left && this.x > 0) this.x -= this.speed;
    }
    Entity.prototype.update.call(this);
}

Spaz.prototype.draw = function (ctx) {

    if (this.jumping) {
        this.jumpAnimation.drawFrame(this.game.clockTick, ctx, this.x, this.y);
    }
    else if (this.running) {
        if (this.game.right) this.runRightAnimation.drawFrame(this.game.clockTick, ctx, this.x, this.y);
        if (this.game.left) this.runLeftAnimation.drawFrame(this.game.clockTick, ctx, this.x, this.y);
    }
    else {
        this.standAnimation.drawFrame(this.game.clockTick, ctx, this.x, this.y);
    }
    Entity.prototype.draw.call(this);
}

// the "main" code begins here

var ASSET_MANAGER = new AssetManager();

ASSET_MANAGER.queueDownload("./img/8bitbg.png");
ASSET_MANAGER.queueDownload("./img/spaz_frames.png");


ASSET_MANAGER.downloadAll(function () {
    console.log("Starting asset downloads");
    var canvas = document.getElementById('gameWorld');
    var ctx = canvas.getContext('2d');

    var gameEngine = new GameEngine();
    var bg = new Background(gameEngine);
    var spaz = new Spaz(gameEngine);

    gameEngine.addEntity(bg);
    gameEngine.addEntity(spaz);

    gameEngine.init(ctx);
    gameEngine.start();
});
