const d3 = require("d3");
import { Iterator } from "./iterator";
import lcg from "./lcg.js";
import { AnglePreserveForce } from "./forces/angle_preserve";
import { CollideForce } from "./forces/hier_collide";
import { CenterForce } from "./forces/center";
import { LinkForce } from "./forces/link";
import { RingForce } from "./forces/ring";
import { BoundaryForce } from "./forces/boundary";

// const debug = true;
const debug = false;

export class Simulation {
    constructor(data) {
        this.data = data;
        this.tree = data.tree;
        this.nodes = data.nodes;
        this.edges = data.edges;
        this.alpha = 1;
        this.alpha_min = 0.001;
        this.alpha_decay = alpha_decay(this.alpha_min);
        this.alpha_target = 0;
        this.velocity_decay = 0.6;
        this.forces = new Map();
        this.event = d3.dispatch("tick", "end");
        this.random = lcg();

        this.initialize_nodes();
        this.initialize_forces();

        this.iterator = new Iterator(this.tree);
        this.stepper = d3.timer(this.step.bind(this));

        this.iterations = 0;
        this.country_nodes = this.nodes.filter((d) => d.level === 0);
        this.province_nodes = this.nodes.filter((d) => d.level === 1);

        this.is_running = true;
    }

    step() {
        // this.tick();
        this.tick(5);
        this.event.call("tick", this);

        if (debug) this.stepper.stop(); // temp

        // setTimeout(() => {
        //     this.stepper.stop();
        // }, 5000);

        if (this.alpha < this.alpha_min) {
            this.stepper.stop();
            this.event.call("end", this);
        }
    }

    stop() {
        this.is_running = false;
        this.stepper.stop();
        this.event.call("end", this);
    }

    set_canvas(width, height) {
        this.width = width;
        this.height = height;
    }

    tick(iterations) {
        // console.log(iterations);

        if (iterations === undefined) iterations = 1;

        this.alpha += (this.alpha_target - this.alpha) * this.alpha_decay;

        for (var k = 0; k < iterations; ++k) {
            this.iterations++;

            let [node_idx, dir] = this.iterator.next();
            let sub_tree = this.get_sub_tree(node_idx);

            // if (this.nodes[node_idx] && this.nodes[node_idx].level > 0)
            //     continue;
            // if (this.nodes[node_idx]) continue;
            // console.log(this.nodes[node_idx]);

            console.log(dir);

            if (dir === "fw") this.tick_forward(sub_tree);
            else this.tick_backward(sub_tree);

            // this.tick_backward(sub_tree);

            //     this.forces.forEach(function (force) {
            //         force(this.alpha);
            //     });

            //     for (i = 0; i < n; ++i) {
            //         node = nodes[i];
            //         if (node.fx == null) node.x += node.vx *= this.velocity_decay;
            //         else (node.x = node.fx), (node.vx = 0);
            //         if (node.fy == null) node.y += node.vy *= this.velocity_decay;
            //         else (node.y = node.fy), (node.vy = 0);
            //     }
        }

        let sub_tree;

        // if (this.iterations % 50 === 0) {
        //     sub_tree = this.get_sub_tree(-1);
        //     this.tick_forward(sub_tree);
        // }

        // country nodes
        this.country_nodes.forEach((node) => {
            sub_tree = this.get_sub_tree(node.node_idx);
            this.tick_backward(sub_tree);
        });

        // province nodes
        let prov_idx = this.iterations % this.province_nodes.length;
        let prov = this.province_nodes[prov_idx];
        sub_tree = this.get_sub_tree(prov.node_idx);
        this.tick_backward(sub_tree);

        sub_tree = this.get_sub_tree(12);
        this.tick_backward(sub_tree);

        this.fit_canvas();

        return this;
    }

    tick_forward(sub_tree) {
        const forward_forces = [
            "angle_preserve",
            "collide",
            "center",
            // "boundary",
        ];
        // const forward_forces = [];
        forward_forces.forEach((force_name) => {
            let force = this.forces.get(force_name);
            force.initialize(sub_tree);
            force.force(this.alpha);
        });

        // 同时更新 inner 节点及其子节点的位置
        sub_tree.inner.forEach((node) => {
            let dx, dy;
            if (node.fx === null) {
                dx = node.vx;
                node.vx *= this.velocity_decay;
            } else {
                dx = node.fx - node.x;
                node.vx = 0;
            }
            if (node.fy === null) {
                dy = node.vy;
                node.vy *= this.velocity_decay;
            } else {
                dy = node.fy - node.y;
                node.vy = 0;
            }
            node.x += dx;
            node.y += dy;
            let pt = this.data.locate_node_on_tree(node.node_idx);

            this.translate_children(pt, (item) => {
                item.x += dx;
                item.y += dy;
            });
        });
    }

    tick_backward(sub_tree) {
        let parent = sub_tree.parent;

        const backward_forces = [
            // "collide",
            // "link",
            "center",
            // "boundary"
        ];
        backward_forces.forEach((force_name) => {
            let force = this.forces.get(force_name);
            force.initialize(sub_tree, true);
            force.force(this.alpha);
        });

        // 转换 border 节点所受的力
        this.translate_border_force(sub_tree);

        // update parent node position
        let p_dx, p_dy;
        p_dx = sub_tree.parent.vx *= this.velocity_decay;
        p_dy = sub_tree.parent.vy *= this.velocity_decay;
        sub_tree.parent.x += p_dx;
        sub_tree.parent.y += p_dy;

        let ring_force = this.forces.get("ring");
        ring_force.initialize(sub_tree, true);
        ring_force.force(this.alpha);

        let dr = (sub_tree.parent.vr *= this.velocity_decay);
        // let dr = sub_tree.parent.vr;
        sub_tree.parent.br += dr;
        sub_tree.parent.r += dr;

        // 同时更新 inner 节点及其子节点的位置
        sub_tree.inner.forEach((node) => {
            let dx, dy;
            if (node.fx === null) {
                dx = node.vx *= this.velocity_decay;
            } else {
                dx = node.fx - node.x;
                node.vx = 0;
            }
            if (node.fy === null) {
                dy = node.vy *= this.velocity_decay;
            } else {
                dy = node.fy - node.y;
                node.vy = 0;
            }
            node.x += dx;
            node.y += dy;
            let pt = this.data.locate_node_on_tree(node.node_idx);

            this.translate_children(pt, (item) => {
                item.x += dx;
                item.y += dy;
            });
        });

        sub_tree.border.forEach((node) => {
            node.alpha += node.va *= this.velocity_decay;
            node.vr *= this.velocity_decay;
            node.x = parent.x + parent.br * Math.cos(node.alpha);
            node.y = parent.y - parent.br * Math.sin(node.alpha);
        });
    }

    translate_border_force(sub_tree) {
        const cx = sub_tree.parent.x,
            cy = sub_tree.parent.y,
            cr = sub_tree.parent.br;
        let parent = sub_tree.parent;
        let x, y, r, alpha;
        let border_nodes = sub_tree.border;
        border_nodes.forEach((node) => {
            x = node.x + node.vx - cx;
            y = node.y + node.vy - cy;
            r = Math.sqrt(x * x + y * y);
            alpha = Math.atan2(-y, x);
            node.vr += (r - cr) * this.alpha;
            node.va += alpha - node.alpha;
            // 作用于父节点
            parent.vx += node.vx;
            parent.vy += node.vy;
        });
    }

    translate_children(root, trans) {
        // 递归更新子节点位置
        let root_node_idx = root.node_idx;
        let root_node = { x: this.width / 2, y: this.height / 2 };
        if (root_node_idx >= 0) {
            root_node = this.nodes[root_node_idx];
        }

        if (root.children === undefined) return;

        let children = root.children;
        for (let name in children) {
            let child = children[name];
            let node = this.nodes[child.node_idx];
            trans(node);
            this.translate_children(child, trans);
        }
    }

    fit_canvas() {
        let nodes = this.nodes;
        let dx = this.width,
            dy = this.height;

        // find the bounding box
        let min_x = d3.min(nodes, (d) => d.x - d.br);
        let min_y = d3.min(nodes, (d) => d.y - d.br);
        let max_x = d3.max(nodes, (d) => d.x + d.br);
        let max_y = d3.max(nodes, (d) => d.y + d.br);

        // translate to the centor of the view
        let center_x = (min_x + max_x) / 2;
        let center_y = (min_y + max_y) / 2;
        nodes.forEach((d) => {
            d.x -= center_x;
            d.y -= center_y;
        });

        // scale the nodes to fit the size
        let scale_x = dx / (max_x - min_x);
        let scale_y = dy / (max_y - min_y);
        let scale = Math.min(scale_x, scale_y);
        nodes.forEach((d) => {
            d.x *= scale;
            d.y *= scale;
            d.br *= scale;
            d.r *= scale;
        });

        // 移动到视图中间
        nodes.forEach((d) => {
            d.x += dx / 2;
            d.y += dy / 2;
        });
    }

    initialize_nodes() {
        this.nodes.forEach((node) => {
            node.vx = 0;
            node.vy = 0;
            node.fx = null;
            node.fy = null;
            node.vr = 0;
            node.va = 0;
        });
    }

    initialize_forces() {
        this.forces.set("angle_preserve", new AnglePreserveForce());
        this.forces.set("collide", new CollideForce());
        this.forces.set("center", new CenterForce());
        this.forces.set("link", new LinkForce(this.nodes, this.edges));
        this.forces.set("ring", new RingForce());
        this.forces.set("boundary", new BoundaryForce(this.width, this.height));
    }

    get_sub_tree(node_idx) {
        let ancestors = this.data.get_ancestors(node_idx);
        let pt = this.tree;
        ancestors.forEach((d) => {
            pt = pt.children[this.nodes[d].name];
        });
        let children = [];
        for (let name in pt.children) {
            let child = pt.children[name];
            children.push(this.nodes[child.node_idx]);
        }
        let inner = children.filter((d) => d.node_type === "inner");
        let border = children.filter((d) => d.node_type === "border");
        let parent = this.nodes[node_idx] || {
            x: this.width / 2,
            y: this.height / 2,
            node_idx: -1,
        };

        border.forEach((d) => {
            d.parent_node = parent;
            d.alpha = Math.atan2(-d.y + parent.y, d.x - parent.x);
        });

        return {
            parent: this.nodes[node_idx] || {
                x: this.width / 2,
                y: this.height / 2,
                node_idx: -1,
            },
            inner: inner,
            border: border,
        };
    }

    force(name, _) {
        if (arguments.length === 1) return this.forces.get(name);
        if (_ === null) this.forces.delete(name);
        else this.forces.set(name, _);
        return this;
    }

    on(name, _) {
        if (arguments.length === 1) return this.event.on(name);
        this.event.on(name, _);
        return this;
    }
}

function alpha_decay(alpha_min) {
    return 1 - Math.pow(alpha_min, 1 / 500);
}
