/**
 * Duy Huynh
 * TCSS 491, Winter '16
 * Assignment 1 - Animation
 * gameengine.js
 *
 * This is the game engine for the animation assignment.
 *
 * Resources:   gameengine.js built from Chris Marriott's codebase, which is copied from Seth Ladd's
 *              "Bad Aliens" game for Google IO 2011.
 */

// Defaulting to browser specific calls to animation frame to future proof:
window.requestAnimFrame = (function () {
    return window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function (/* function */ callback, /* DOMElement */ element) {
            window.setTimeout(callback, 1000 / 60);
        };
})(); // What does it mean to have parenthesis at the end again? It is being called right away?


/**
 * Create a timer for the game.
 * @constructor
 */
function Timer() {
    this.gameTime = 0;
    this.maxStep = 0.05;
    this.wallLastTimestamp = 0;
}

/**
 *
 * @returns {number}
 */
Timer.prototype.tick = function () {
    var wallCurrent = Date.now(); // Retrieve current time
    var wallDelta = (wallCurrent - this.wallLastTimestamp) / 1000; // Determine how much time has past, in seconds

    // Once figuring out the delta, now update the last time stamp
    this.wallLastTimestamp = wallCurrent; // Update the previous time to the current

    // I don't understand game delta
    var gameDelta = Math.min(wallDelta, this.maxStep); // lockstep
    this.gameTime += gameDelta; // Update total time passed in game.
    //console.log(this.gameTime);
    return gameDelta;
};

// Game Engine has entities
function GameEngine() {
    this.entities = [];
    this.showOutlines = false; // Show circles around entities for debugging
    this.ctx = null;
    this.click = null;
    this.mouse = null;
    this.wheel = null;
    this.surfaceWidth = null;
    this.surfaceHeight = null;
}

/**
 * On creation of GameEngine, create new game Timer, get width & height from canvas, begin recording inputs
 * @param ctx
 */
GameEngine.prototype.init = function (ctx) {
    this.ctx = ctx;
    this.surfaceWidth = this.ctx.canvas.width;
    this.surfaceHeight = this.ctx.canvas.height;
    this.startInput(); // Allow input controls
    this.timer = new Timer(); // Create game Timer
    console.log('game initialized');
};

/**
 * Begin game.
 */
GameEngine.prototype.start = function () {
    console.log("starting game");
    var that = this;
    (function gameLoop() {
        that.loop();
        requestAnimFrame(gameLoop, that.ctx.canvas);
    })();
};

/**
 * Begin listening for inputs.
 */
GameEngine.prototype.startInput = function () {
    console.log('Starting input');
    var that = this;

    this.ctx.canvas.addEventListener("keydown", function (e) {
        if (String.fromCharCode(e.which) === ' ') that.space = true;
        if(e.which===39) that.right = true;
        if(e.which===37) that.left = true;
        if(e.which===68) that.showOutlines ^= true;
        //console.log(e);
        e.preventDefault(); // Spacebar's devault is to scroll down page
    }, false);

    this.ctx.canvas.addEventListener("keyup", function(e) {
        if(e.which===39) that.right = false;
        if(e.which===37) that.left = false;
    });



    console.log('Input started');
};

/**
 * Push an entity to the GameEngine's array of entities
 * @param entity
 */
GameEngine.prototype.addEntity = function (entity) {
    console.log('added entity');
    this.entities.push(entity);
};

/**
 * Draw entities onto canvas
 */
GameEngine.prototype.draw = function () {

    // 1. Clear the window (Removes previously drawn things from canvas)
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

    // 2. Save (What are we saving exactly here?)
    this.ctx.save();

    // 3. Draw each entity onto canvas
    for (var i = 0; i < this.entities.length; i++) {
        this.entities[i].draw(this.ctx);
    }
    this.ctx.restore();
};

/**
 * Update each entity, removing those flagged for removal.
 */
GameEngine.prototype.update = function () {

    // Cycle through the list of entities in GameEngine.
    var entitiesCount = this.entities.length;
    for (var i = 0; i < entitiesCount; i++) {
        var entity = this.entities[i];

        // Only update those not flagged for removal, for optimization
        if (!entity.removeFromWorld) {
            entity.update();
        }
    }

    // Removal of flagged entities
    for (var i = this.entities.length - 1; i >= 0; --i) {
        if (this.entities[i].removeFromWorld) {
            this.entities.splice(i, 1);
        }
    }
};

/**
 * Basic loop for game.
 * 1. Advance a game 'tick' on the game Timer.
 * 2. Update Game Engine (entities)
 * 3. Draw out to canvas
 * 4. Clear spacebar to prevent repeated firing
 */
GameEngine.prototype.loop = function () {
    this.clockTick = this.timer.tick();
    this.update();
    this.draw();
    this.space = null; // Clear out space at end of loop, otherwise it will keep firing
};


/**
 * Represents an entity of the GameEngine
 * @param game GameEngine to add entity to.
 * @param x Location of entity's x.
 * @param y Location of entity's y.
 * @constructor
 */
function Entity(game, x, y) {
    this.game = game;
    this.x = x;
    this.y = y;
    this.removeFromWorld = false;
}

// Why is there no function?
Entity.prototype.update = function () {
    this.centerX = this.x + this.width / 2;
    this.centerY = this.y + this.height / 2;
};

// Anything defined here is inherited by all entities (the outline for debugging).
Entity.prototype.draw = function (ctx) {
    if (this.game.showOutlines && this.radius) {
        this.game.ctx.beginPath();
        this.game.ctx.strokeStyle = "green";
        this.game.ctx.arc(this.centerX, this.centerY, this.radius, 0, Math.PI * 2, false);
        this.game.ctx.stroke(); // Paint it on
        this.game.ctx.closePath();
    }
};

Entity.prototype.rotateAndCache = function (image, angle) {
    var offscreenCanvas = document.createElement('canvas');
    var size = Math.max(image.width, image.height);
    offscreenCanvas.width = size;
    offscreenCanvas.height = size;
    var offscreenCtx = offscreenCanvas.getContext('2d');
    offscreenCtx.save();
    offscreenCtx.translate(size / 2, size / 2);
    offscreenCtx.rotate(angle);
    offscreenCtx.translate(0, 0);
    offscreenCtx.drawImage(image, -(image.width / 2), -(image.height / 2));
    offscreenCtx.restore();
    //offscreenCtx.strokeStyle = "red";
    //offscreenCtx.strokeRect(0,0,size,size);
    return offscreenCanvas;
};
