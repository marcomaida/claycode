/*
 * @class Vector
 * @constructor 
 * @param x {Number} position of the point
 * @param y {Number} position of the point
 */
PIXI.Vector = function(x, y)
{
    /**
     * @property x 
     * @type Number
     * @default 0
     */
    this.x = x || 0;

    /**
     * @property y
     * @type Number
     * @default 0
     */
    this.y = y || 0;
};

/**
 * Creates a clone of this point
 *
 * @method clone
 * @return {Vector} a copy of the point
 */
PIXI.Vector.prototype.clone = function()
{
    return new PIXI.Vector(this.x, this.y);
};

PIXI.Vector.prototype.add = function(v) {
    this.x += v.x;
    this.y += v.y;
    return this;
};

PIXI.Vector.prototype.sub = function(v) {
    this.x -= v.x;
    this.y -= v.y;
    return this;
};

PIXI.Vector.prototype.invert = function(v) {
    this.x *= -1;
    this.y *= -1;
    return this;
};

PIXI.Vector.prototype.multiplyScalar = function(s) {
    this.x *= s;
    this.y *= s;
    return this;
};

PIXI.Vector.prototype.divideScalar = function(s) {
    if(s === 0) {
        this.x = 0;
        this.y = 0;
    } else {
        var invScalar = 1 / s;
        this.x *= invScalar;
        this.y *= invScalar;
    }
    return this;
};

PIXI.Vector.prototype.dot = function(v) {
    return this.x * v.x + this.y * v.y;
};

PIXI.Vector.prototype.length = function(v) {
    return Math.sqrt(this.x * this.x + this.y * this.y);
};

PIXI.Vector.prototype.lengthSq = function() {
    return this.x * this.x + this.y * this.y;
};

PIXI.Vector.prototype.normalize = function() {
    return this.divideScalar(this.length());
};

PIXI.Vector.prototype.distanceTo = function(v) {
    return Math.sqrt(this.distanceToSq(v));
};

PIXI.Vector.prototype.distanceToSq = function(v) {
    var dx = this.x - v.x, dy = this.y - v.y;
    return dx * dx + dy * dy;
};

PIXI.Vector.prototype.set = function(x, y) {
    this.x = x;
    this.y = y;
    return this;
};

PIXI.Vector.prototype.setX = function(x) {
    this.x = x;
    return this;
};

PIXI.Vector.prototype.setY = function(y) {
    this.y = y;
    return this;
};

PIXI.Vector.prototype.setLength = function(l) {
    var oldLength = this.length();
    if(oldLength !== 0 && l !== oldLength) {
        this.multiplyScalar(l / oldLength);
    }
    return this;
};

PIXI.Vector.prototype.invert = function(v) {
    this.x *= -1;
    this.y *= -1;
    return this;
};

PIXI.Vector.prototype.lerp = function(v, alpha) {
    this.x += (v.x - this.x) * alpha;
    this.y += (v.y - this.y) * alpha;
    return this;
};

PIXI.Vector.prototype.rad = function() {
    return Math.atan2(this.y, this.x);
};

PIXI.Vector.prototype.deg = function() {
    return this.rad() * 180 / Math.PI;
};

PIXI.Vector.prototype.equals = function(v) {
    return this.x === v.x && this.y === v.y;
};

PIXI.Vector.prototype.rotate = function(theta) {
    var xtemp = this.x;
    this.x = this.x * Math.cos(theta) - this.y * Math.sin(theta);
    this.y = xtemp * Math.sin(theta) + this.y * Math.cos(theta);
    return this;
};

PIXI.Vector.prototype.angle = function(v) {
    var a1 = this.rad()
    var a2 = v.rad()
    var sign = a1 > a2 ? 1 : -1;
    var angle = a1 - a2;
    var K = -sign * Math.PI * 2;
    return (Math.abs(K + angle) < Math.abs(angle))? K + angle : angle;
}

PIXI.Vector.prototype.angleRelativeTo = function(v, center) {
    return this.clone().sub(center).angle(v.clone().sub(center))
}

PIXI.Vector.prototype.perpendicular = function(clockwise) {
    var xtemp = this.x;
    if (clockwise) {
        this.x = this.y 
        this.y = -xtemp 
    }
    else {
        this.x = -this.y 
        this.y = xtemp 
    }
    return this;
};