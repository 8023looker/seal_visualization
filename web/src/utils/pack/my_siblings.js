import array from "./array.js";
import lcg from "./lcg.js";
import { packEncloseRandom } from "./enclose.js";

const debug = true;
// const debug = false

// const score_mode = "local";
const score_mode = "global";

function place(b, a, c) {
    var dx = b.x - a.x,
        x,
        a2,
        dy = b.y - a.y,
        y,
        b2,
        d2 = dx * dx + dy * dy;
    if (d2) {
        (a2 = a.r + c.r), (a2 *= a2);
        (b2 = b.r + c.r), (b2 *= b2);
        if (a2 > b2) {
            x = (d2 + b2 - a2) / (2 * d2);
            y = Math.sqrt(Math.max(0, b2 / d2 - x * x));
            c.x = b.x - x * dx - y * dy;
            c.y = b.y - x * dy + y * dx;
        } else {
            x = (d2 + a2 - b2) / (2 * d2);
            y = Math.sqrt(Math.max(0, a2 / d2 - x * x));
            c.x = a.x + x * dx - y * dy;
            c.y = a.y + x * dy + y * dx;
        }
    } else {
        c.x = a.x + c.r;
        c.y = a.y;
    }
}

function intersects(a, b) {
    var dr = a.r + b.r - 1e-6,
        dx = b.x - a.x,
        dy = b.y - a.y;
    return dr > 0 && dr * dr > dx * dx + dy * dy;
}

function score(node) {
    var a = node._,
        b = node.next._,
        ab = a.r + b.r,
        dx = (a.x * b.r + b.x * a.r) / ab,
        dy = (a.y * b.r + b.y * a.r) / ab;
    return dx * dx + dy * dy;
}

function score_angle(new_node, node, node_list) {
    if (score_mode === "global") {
        return score_angle_global(new_node, node, node_list);
    } else {
        return score_angle_local(new_node, node);
    }
}

function score_angle_local(new_node, node) {
    let a = { ...node._ };
    let b = { ...node.next._ };
    let c = { ...new_node._ };

    // place(b, a, c);
    place(a, b, c);

    // 现在 c 到 a 的角度
    let cur_ca = Math.atan2(c.y - a.y, a.x - c.x);
    let cur_cb = Math.atan2(c.y - b.y, b.x - c.x);

    let ori_ca = Math.atan2(a.coord.y - c.coord.y, a.coord.x - c.coord.x);
    let ori_cb = Math.atan2(b.coord.y - c.coord.y, b.coord.x - c.coord.x);

    let d_ca = Math.abs(cur_ca - ori_ca);
    let d_cb = Math.abs(cur_cb - ori_cb);

    // console.log(a.name, b.name, c.name, d_ca + d_cb)
    return d_ca + d_cb ? d_ca + d_cb : 10;
}

function score_angle_global(new_node, node, node_list) {
    let a = { ...node._ };
    let b = { ...node.next._ };
    let c = { ...new_node._ };

    let score = 0;

    place(a, b, c);

    node_list.forEach((d) => {
        let cur_angle = Math.atan2(c.y - d._.y, d._.x - c.x);
        let ori_angle = Math.atan2(
            d._.coord.y - c.coord.y,
            d._.coord.x - c.coord.x
        );
        let d_angle = Math.abs(cur_angle - ori_angle);
        // 权重：半径
        // score += d_angle * d._.r

        // let del = (())
        let dvy = c.y - d._.y;
        let dvx = d._.x - c.x;
        let dpy = d._.coord.y - c.coord.y;
        let dpx = d._.coord.x - c.coord.x;
        let del =
            (dvy * dpy + dvx * dpx) /
            (Math.sqrt(dvy * dvy + dvx * dvx) *
                Math.sqrt(dpy * dpy + dpx * dpx));

        del = isNaN(del) ? 0 : Math.abs(del);
        // score += del * d._.r * d._.r
        score -= del * d._.r;
    });

    // console.log(a.name, b.name, c.name, score);

    return score;
}

function Node(circle) {
    this._ = circle;
    this.next = null;
    this.previous = null;
}

export function packSiblingsRandom(circles, random) {
    if (!(n = (circles = array(circles)).length)) return 0;

    var a, b, c, n, aa, ca, i, j, k, sj, sk;

    // Place the first circle.
    (a = circles[0]), (a.x = 0), (a.y = 0);
    if (!(n > 1)) return a.r;

    // Place the second circle.
    if (debug) {
        b = circles[1];
        if (a.coord.x < b.coord.x) {
            (a.x = -b.r), (b.x = a.r), (b.y = 0);
        } else {
            (a.x = b.r), (b.x = -a.r), (b.y = 0);
            let tmp = a;
            (a = b), (b = tmp);
        }
    } else {
        (b = circles[1]), (a.x = -b.r), (b.x = a.r), (b.y = 0);
    }
    if (!(n > 2)) return a.r + b.r;

    // Place the third circle.
    place(b, a, (c = circles[2]));

    // if (debug) {console.log(circles[0], circles[1], circles[2])}

    // Initialize the front-chain using the first three circles a, b and c.
    (a = new Node(a)), (b = new Node(b)), (c = new Node(c));
    a.next = c.previous = b;
    b.next = a.previous = c;
    c.next = b.previous = a;

    let node_list = [a, b, c];

    // Attempt to place each remaining circle…
    pack: for (i = 3; i < n; ++i) {
        place(a._, b._, (c = circles[i])), (c = new Node(c));

        // Find the closest intersecting circle on the front-chain, if any.
        // “Closeness” is determined by linear distance along the front-chain.
        // “Ahead” or “behind” is likewise determined by linear distance.
        (j = b.next), (k = a.previous), (sj = b._.r), (sk = a._.r);
        do {
            if (sj <= sk) {
                if (intersects(j._, c._)) {
                    (b = j), (a.next = b), (b.previous = a), --i;
                    continue pack;
                }
                (sj += j._.r), (j = j.next);
            } else {
                if (intersects(k._, c._)) {
                    (a = k), (a.next = b), (b.previous = a), --i;
                    continue pack;
                }
                (sk += k._.r), (k = k.previous);
            }
        } while (j !== k.next);

        // Success! Insert the new circle c between a and b.
        (c.previous = a), (c.next = b), (a.next = b.previous = b = c);

        node_list.push(c);

        let next_circle = circles[(i + 1) % n];
        next_circle = new Node(next_circle);

        // Compute the new closest circle pair to the centroid.
        // aa = score(a);
        // console.log("--------");
        // console.log("next_circle", next_circle._.name);
        if (debug) {
            aa = score_angle(next_circle, a, node_list);
        } else aa = score(a);
        while ((c = c.next) !== b) {
            if (debug) {
                if ((ca = score_angle(next_circle, c, node_list)) < aa) {
                    (a = c), (aa = ca);
                }
            } else {
                if ((ca = score(c)) < aa) {
                    (a = c), (aa = ca);
                }
            }
        }
        // console.log(a._.name, aa);
        b = a.next;
    }

    // Compute the enclosing circle of the front chain.
    (a = [b._]), (c = b);
    while ((c = c.next) !== b) a.push(c._);
    c = packEncloseRandom(a, random);

    // Translate the circles to put the enclosing circle around the origin.
    for (i = 0; i < n; ++i) (a = circles[i]), (a.x -= c.x), (a.y -= c.y);

    return c.r;
}

export default function (circles) {
    packSiblingsRandom(circles, lcg());
    return circles;
}
