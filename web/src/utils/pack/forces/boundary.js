export class BoundaryForce {
    constructor(width, height) {
        this.width = width;
        this.height = height;
    }

    initialize(sub_tree) {
        this.nodes = sub_tree.inner;
    }

    force(alpha) {
        this.nodes.forEach((node) => {
            if (node.x < 0) {
                node.vx += 0.1 * alpha;
                node.x = 0;
            } else if (node.x > this.width) {
                node.vx -= 0.1 * alpha;
                node.x = this.width;
            }

            if (node.y < 0) {
                node.vy += 0.1 * alpha;
                node.y = 0;
            } else if (node.y > this.height) {
                node.vy -= 0.1 * alpha;
                node.y = this.height;
            }
        });
    }
}
