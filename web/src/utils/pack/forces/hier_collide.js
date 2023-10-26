import { quadtree } from "d3-quadtree";
import constant from "./constant.js";
import jiggle from "./jiggle.js";
import lcg from "./lcg.js";

function x(d) {
    return d.x + d.vx;
}

function y(d) {
    return d.y + d.vy;
}

function radius(d) {
    return d.level > 0 ? d.r : d.r + 20;
}

export class CollideForce {
    constructor() {
        this.nodes = null;
        this.radii = null;
        this.random = lcg();
        this.strength = 1;
        this.iterations = 1;
    }

    initialize(sub_tree, bw = false) {
        this.nodes = sub_tree.inner;
        if (bw) this.nodes = this.nodes.concat(sub_tree.border);
        this.nodes.forEach((d, i) => {
            d.index = i;
        });
        var i,
            n = this.nodes.length,
            node;
        this.radii = new Array(n);
        for (i = 0; i < n; ++i) {
            node = this.nodes[i];
            this.radii[node.index] = +radius(node);
        }
    }

    force(alpha) {
        var i,
            n = this.nodes.length,
            tree,
            node,
            xi,
            yi,
            ri,
            ri2;

        for (var k = 0; k < this.iterations; ++k) {
            tree = quadtree(this.nodes, x, y).visitAfter(
                this.prepare.bind(this)
            );
            for (i = 0; i < n; ++i) {
                node = this.nodes[i];
                ri = this.radii[node.index];
                ri2 = ri * ri;
                xi = node.x + node.vx;
                yi = node.y + node.vy;
                tree.visit(apply.bind(this));
            }
        }

        function apply(quad, x0, y0, x1, y1) {
            var data = quad.data,
                rj = quad.r,
                r = ri + rj;
            if (data) {
                if (data.index > node.index) {
                    var x = xi - data.x - data.vx,
                        y = yi - data.y - data.vy,
                        l = x * x + y * y;
                    if (l < r * r) {
                        if (x === 0) (x = jiggle(this.random)), (l += x * x);
                        if (y === 0) (y = jiggle(this.random)), (l += y * y);
                        l = ((r - (l = Math.sqrt(l))) / l) * this.strength;
                        node.vx += (x *= l) * (r = (rj *= rj) / (ri2 + rj));
                        node.vy += (y *= l) * r;
                        data.vx -= x * (r = 1 - r);
                        data.vy -= y * r;
                    }
                }
                return;
            }
            return x0 > xi + r || x1 < xi - r || y0 > yi + r || y1 < yi - r;
        }
    }

    prepare(quad) {
        if (quad.data) return (quad.r = this.radii[quad.data.index]);
        for (var i = (quad.r = 0); i < 4; ++i) {
            if (quad[i] && quad[i].r > quad.r) {
                quad.r = quad[i].r;
            }
        }
    }
}
