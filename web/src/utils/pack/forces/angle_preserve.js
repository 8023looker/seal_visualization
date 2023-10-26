export class AnglePreserveForce {
    constructor() {
        this.nodes = [];
        this.strength = 0.2;
    }

    initialize(sub_tree) {
        this.nodes = sub_tree.inner;
    }

    angle_force(d_angle) {
        return d_angle * 0.05;
    }

    force(alpha) {
        for (let i = 0; i < this.nodes.length - 1; i++) {
            for (let j = i + 1; j < this.nodes.length; j++) {
                let node_i = this.nodes[i];
                let node_j = this.nodes[j];

                if (
                    Math.abs(node_i.coord.x - node_j.coord.x) +
                        Math.abs(node_i.coord.y - node_j.coord.y) <
                    1e-6
                ) {
                    continue;
                }

                let dist = Math.sqrt(
                    (node_i.x - node_j.x) ** 2 + (node_i.y - node_j.y) ** 2
                );
                let angle = Math.atan2(
                    node_j.y - node_i.y,
                    -(node_j.x - node_i.x)
                );
                let target_angle = Math.atan2(
                    node_j.coord.y - node_i.coord.y,
                    node_j.coord.x - node_i.coord.x
                );
                let v_angle = this.angle_force(target_angle - angle) * alpha;
                let v_x =
                    v_angle * dist * Math.sin(angle) * alpha * this.strength;
                let v_y =
                    v_angle * dist * Math.cos(angle) * alpha * this.strength;
                node_i.vx += v_x;
                node_i.vy += v_y;
                node_j.vx -= v_x;
                node_j.vy -= v_y;
            }
        }
    }
}
