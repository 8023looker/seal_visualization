export class Point extends Array {
    constructor(x, y) {
        super();
        Object.setPrototypeOf(this, Point.prototype);
        if (arguments.length === 1) {
            if (x instanceof Array) {
                this[0] = +x[0];
                this[1] = +x[1];    
            }
            else {
                this[0] = +x.x;
                this[1] = +x.y;
            }
        }
        else {
            this[0] = +x;
            this[1] = +y;
        }
    }
    get x() {
        return this[0];
    }
    get y() {
        return this[1];
    }
    set x(val) {
        this[0] = val;
    }
    set y(val) {
        this[1] = val;
    }
    toArray() {
        return [this.x, this.y];
    }
    toOne() {
        const len = this.len();
        return new Point(this.x / len, this.y / len);
    }
    abs() {
        return new Point(Math.abs(this.x), Math.abs(this.y));
    }
    dot(o) {
        return this.x * o.x + this.y * o.y;
    }
    toLen(l) {
        return this.toOne().mul(l);
    }
    add(o) {
        return new Point(this.x + o.x, this.y + o.y);
    }
    sub(o) {
        return new Point(this.x - o.x, this.y - o.y);
    }
    mul(o) {
        return new Point(this.x * o, this.y * o);
    }
    cross(o) {
        return this.x * o.y - this.y * o.x;
    }
    len() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }
    len2() {
        return this.x * this.x + this.y * this.y;
    }
    angle() {
        return Math.atan2(this.y, this.x);
    }
    rotate(ang) {
        return new Point(this.x * Math.cos(ang) - this.y * Math.sin(ang), this.x * Math.sin(ang) + this.y * Math.cos(ang));
    }
    projection(prj) {
        return new Point(...prj(this));
    }
    equals(o, eps = 1e-8) {
        return Math.abs(this.x - o.x) < eps && Math.abs(this.y - o.y) < eps;
    }
}