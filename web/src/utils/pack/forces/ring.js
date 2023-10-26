const d3 = require("d3");

function shrink() {
    return 3;
}

function repulsion(d) {
    return Math.min(5 * Math.pow(Math.E, -d), 10);
}

export class RingForce {
    constructor() {
        this.parent = null;
        this.inner = [];
        this.border = [];
        this.r = null;
    }

    initialize(sub_tree) {
        this.parent = sub_tree.parent;
        this.inner = sub_tree.inner;
        this.border = sub_tree.border;
        this.r = sub_tree.parent.br;
    }

    force(alpha) {
        if (!this.r) return;
        let vr = 0;

        // 内部圆的斥力
        let inner_dr = [];
        this.inner.forEach((node) => {
            let x, y, d;
            x = node.x - this.parent.x;
            y = node.y - this.parent.y;
            d = Math.sqrt(x * x + y * y);
            inner_dr.push(this.r - node.r - d);
        });
        if (inner_dr.length) {
            let min_r = d3.min(inner_dr);
            vr += repulsion(min_r);
        }

        // 边界圆弹力
        this.border.forEach((node) => {
            vr += node.vr;
        });

        // 恒定收缩力
        vr -= shrink();

        if (vr < -this.r * 0.9) {
            vr = -this.r * 0.9;
        }

        // console.log(this.parent.name);
        // console.log(vr);

        this.parent.vr += vr * alpha;
    }
}
