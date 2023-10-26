const d3 = require("d3");

export class CenterForce {
    constructor() {
        this.x = null;
        this.y = null;
        this.strength = 0.2;
        this.bw = false;

        this.nodes = [];
        this.parent = null;

        this.weights = [];
    }

    initialize(sub_tree, bw = false) {
        this.x = sub_tree.parent.x;
        this.y = sub_tree.parent.y;
        this.nodes = sub_tree.inner;
        this.parent = sub_tree.parent;
        this.bw = bw;

        let weights = this.nodes.map((d) => d.br * d.br);
        let sum_weight = d3.sum(weights);
        this.weights = weights.map((d) => d / sum_weight);
    }

    force(alpha) {
        if (this.parent.node_idx < 0) return;

        var i,
            n = this.nodes.length,
            node,
            sx = 0,
            sy = 0;

        for (i = 0; i < n; ++i) {
            node = this.nodes[i];
            // (sx += node.x), (sy += node.y);
            sx += this.weights[i] * node.x;
            sy += this.weights[i] * node.y;
        }

        // console.log("center force", this.parent.name);
        // console.log(sx / n - this.x, sy / n - this.y);

        for (
            // sx = (sx / n - this.x) * this.strength,
            //     sy = (sy / n - this.y) * this.strength,
            sx = (sx - this.x) * this.strength,
                sy = (sy - this.y) * this.strength,
                i = 0;
            i < n;
            ++i
        ) {
            node = this.nodes[i];
            // , (node.vx -= sx), (node.vy -= sy);
            node.vx += -sx;
            node.vy += -sy;
        }

        // this.nodes.forEach((node) => {
        //     let x, y, d;
        //     x = this.x - node.x;
        //     y = this.y - node.y;
        //     d = Math.sqrt(x * x + y * y);
        //     node.vx += (x / d) * this.strength * alpha || d;
        //     node.vy += (y / d) * this.strength * alpha || d;
        // });

        if (this.bw) {
            // 父节点受力更新
            this.nodes.forEach((d) => {
                this.parent.vx += sx;
                this.parent.vy += sy;
            });

            // console.log(this.parent.name);
            // console.log(sx, sy);
        }
    }
}
