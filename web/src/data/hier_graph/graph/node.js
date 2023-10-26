class Point extends Array {
    constructor(x, y) {
        super();
        // Object.setPrototypeOf(this, Point.prototype);
        this.x = x;
        this.y = y;
    }
    // get x() {
    //     return this.x;
    // }
    // get y() {
    //     return this.y;
    // }
    // set x(val) {
    //     this.x = val;
    // }
    // set y(val) {
    //     this.y = val;
    // }
    toArray() {
        return [this.x, this.y];
    }
    toOne() {
        const len = this.len();
        return new Point(this.x / len, this.y / len);
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
    len() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }
    angle() {
        return Math.atan2(this.y, this.x);
    }
    rotate(ang) {
        return new Point(
            this.x * Math.cos(ang) - this.y * Math.sin(ang),
            this.x * Math.sin(ang) + this.y * Math.cos(ang)
        );
    }
    projection(prj) {
        return new Point(...prj(this));
    }
}

export class Node extends Point {
    constructor() {
        super(null, null);

        this.size = 0;
    }
}
