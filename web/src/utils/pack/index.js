import * as d3 from "d3";
import constant, { constant_zero } from "./constant";
import lcg from "./lcg";
import pack_siblings from "./siblings";
import my_pack_siblings from "./my_siblings";
import pack_enclose from "./enclose";
import draw from "./draw";
import { GraphDrawer } from "./drawer";
import { exportJson } from "@/data/hier_graph/export/download";

// const optimize = false;
const optimize = true;
// const optimize_border = false;
const optimize_border = true;
const china_large = true;

function default_radius(d) {
    return Math.sqrt(d.size);
}

function border_circle_angle(r, R) {
    return 4 * Math.asin(r / (2 * R));
}

function sum_center_angle(circles, R) {
    let angle = 0;
    circles.forEach((d) => {
        angle += border_circle_angle(d.br, R);
    });
    return angle;
}

function verify_border_bound(circles, R) {
    let angle = sum_center_angle(circles, R);
    if (angle < Math.PI * 2) {
        return true;
    }
    return false;
}

function circle_pack() {
    let radius = default_radius,
        dx = 1,
        dy = 1,
        eps = 1e-6,
        padding = constant_zero;
    let nodes, tree, edges;

    /*** geometry helper functions ***/
    function distance(c1, c2) {
        return Math.sqrt((c1.x - c2.x) ** 2 + (c1.y - c2.y) ** 2);
    }

    function interpolate_two_circles(c1, c2) {
        let x1, y1, x2, y2, r1, r2, x, y, dir;
        (x1 = c1.x), (y1 = c1.y), (r1 = c1.br || c1.r);
        (x2 = c2.x), (y2 = c2.y), (r2 = c2.br || c2.r);
        x = (r2 / (r1 + r2)) * x1 + (r1 / (r1 + r2)) * x2;
        y = (r2 / (r1 + r2)) * y1 + (r1 / (r1 + r2)) * y2;
        dir = Math.atan2(y2 - y1, x2 - x1);
        return { x: x, y: y, dir: dir, r: r1 + r2 };
    }

    function circle_point_intersection(c, p) {
        let x1, y1, x2, y2, r;
        (x1 = c.x), (y1 = c.y), (r = c.br || c.r);
        (x2 = p.x), (y2 = p.y);
        let dx = x2 - x1,
            dy = y2 - y1;
        let dir = Math.atan2(-dy, dx);
        return dir;
    }

    function pack_children(root) {
        let children = root.children;

        let inner_circles = [];
        let border_circles = [];

        for (let name in children) {
            let child = children[name];
            let node = nodes[child.node_idx];

            // put the leaf node in border_circles
            if (node.is_leaf()) {
                node.br = radius(node);
                node.r = radius(node) + padding();
                border_circles.push(node);
            }
            // put the node with children in inner_circles
            else {
                inner_circles.push(node);
            }
        }

        function update_root(bounding_circle, border_r = 0) {
            let root_idx = root.node_idx;
            if (root_idx <= 0) return bounding_circle;
            let root_node = nodes[root_idx];
            root_node.br = bounding_circle.r;
            root_node.r = bounding_circle.r + border_r + padding();
            root_node.x = bounding_circle.x;
            root_node.y = bounding_circle.y;
            return root_node;
        }

        // if all nodes are leaves, pack them inside the root
        if (inner_circles.length === 0) {
            border_circles.forEach((node) => {
                node.node_type = "inner";
            });
            pack_siblings(border_circles);
            let bounding_circle = pack_enclose(border_circles);
            return update_root(bounding_circle);
        }

        // else, pack the inner circles first
        else {
            let circles = [];
            inner_circles.forEach((node) => {
                let child = pack_children(children[node.name]);
                circles.push(child);
                node.node_type = "inner";
            });

            circle_sort(circles);
            // circles.sort((a, b) => b.r - a.r);
            // console.log(circles);
            // if (circles[0].node_idx === 2) {
            //     circles = circles.sli
            // }

            if (root.node_idx === -1) pack_siblings(circles);
            else if (optimize) my_pack_siblings(circles);
            else pack_siblings(circles);
            let bounding_circle = pack_enclose(circles);

            // if there are none border circles, return the bounding circle
            if (border_circles.length === 0) {
                return update_root(bounding_circle);
            }

            // place border circle
            border_circles.forEach((node) => {
                node.node_type = "border";
            });
            let max_border_r = d3.max(border_circles, (d) => d.br);
            bounding_circle.r += max_border_r;
            // 验证是否能在圆周上放下
            while (!verify_border_bound(border_circles, bounding_circle.r)) {
                bounding_circle.r += 1;
            }
            // place border circles
            // pack_border_circles(bounding_circle, border_circles);
            if (!optimize_border)
                place_border_circles(bounding_circle, border_circles);
            return update_root(bounding_circle, max_border_r);
        }
    }

    function translate_children(root) {
        // 先计算出各节点相对于根节点的坐标
        translate_to_root(root);

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

        // 向下移一点
        nodes.forEach((d) => {
            d.y += 10;
        });
    }

    // 之前子节点计算的是相对于父节点的坐标，现在需要转换为相对于根节点的坐标
    function translate_to_root(root) {
        let root_node_idx = root.node_idx;
        let root_node = { x: 0, y: 0 };
        if (root_node_idx >= 0) {
            root_node = nodes[root_node_idx];
        }

        if (root.children === undefined) return;

        let children = root.children;
        for (let name in children) {
            let child = children[name];
            let node = nodes[child.node_idx];
            node.x += root_node.x;
            node.y += root_node.y;
            translate_to_root(child);
        }
    }

    function pack_border_circles(bound, circles) {
        for (let circle of circles) {
            place_border_circle(bound, circle);
        }
    }

    function place_border_circle(bound, circle) {
        // find the neighbor nodes
        let neighbors = [];
        neighbors = edges
            .filter(
                (d) =>
                    d.source.node_idx === circle.node_idx ||
                    d.target.node_idx === circle.node_idx
            )
            .filter((d) => d.source.node_idx != d.target.node_idx)
            .map((d) => {
                let idx;
                if (d.source.node_idx === circle.node_idx)
                    idx = d.target.node_idx;
                else idx = d.source.node_idx;
                if (nodes[idx].node_type && nodes[idx].node_type === "border")
                    idx = nodes[idx].parent;
                return nodes[idx];
            });
        let point = neighbors.length
            ? neighbors[0]
            : { x: bound.x, y: bound.y, br: bound.br, r: bound.r };
        for (let neighbor of neighbors) {
            point = interpolate_two_circles(point, neighbor);
        }
        let dir = circle_point_intersection(bound, point);
        // console.log(bound, result, circle);
        circle.pr = bound.br; // parent radius
        circle.angle = dir;
        circle.x = bound.x + bound.br * Math.cos(dir);
        circle.y = bound.y - bound.br * Math.sin(dir);

        // 检测是否重叠
        let siblings = nodes
            .filter((d) => d.parent === circle.parent)
            .filter((d) => d.node_idx !== circle.node_idx)
            .filter((d) => d.node_type === "border")
            .filter((d) => d.x != null);

        function is_overlap(circles) {
            if (circles.length === 0) return false;
            for (let item of circles) {
                if (distance(circle, item) < circle.br + item.br + 2)
                    return true;
            }
            return false;
        }

        // console.log(circle.parent);

        function is_on_china_border() {
            let parent = nodes[circle.parent];
            if (parent.name === "中國") return true;
            return false;
        }

        let cnt, dir1, dir2;
        (cnt = 0), (dir1 = dir), (dir2 = dir);
        while (is_overlap(siblings)) {
            if (cnt % 2) (dir1 += 0.05), (dir = dir1);
            else (dir2 -= 0.05), (dir = dir2);
            circle.x = bound.x + bound.br * Math.cos(dir);
            circle.y = bound.y - bound.br * Math.sin(dir);
        }

        circle.angle = dir;

        if (is_on_china_border()) {
            function visible() {
                const maxAngle = Math.PI / 20;
                const minAngle = -Math.PI / 2;
                if (circle.angle > maxAngle) return false;
                if (circle.angle < minAngle) return false;
                return true;
            }

            while (!visible()) {
                if (circle.angle > 0) circle.angle -= 0.05;
                else circle.angle += 0.05;
            }
            circle.x = bound.x + bound.br * Math.cos(circle.angle);
            circle.y = bound.y - bound.br * Math.sin(circle.angle);
        }
    }

    function tune_border() {
        nodes.forEach((node) => {
            if (node.node_type === "border") {
                place_border_circle(nodes[node.parent], node);
            }
        });
    }

    /*** main function  ***/
    function pack(data) {
        nodes = data.nodes;
        tree = data.tree;
        edges = data.edges;

        pack_children(tree);
        tune(data);

        nodes.forEach((node) => {
            node.dx = node.x;
            node.dy = node.y;
        });

        translate_children(tree);

        if (china_large) {
            enlarge_china(data);
        }

        // tune border
        if (optimize_border) tune_border();
    }

    pack.size = function (x) {
        return arguments.length ? ((dx = +x[0]), (dy = +x[1]), pack) : [dx, dy];
    };

    pack.padding = function (x) {
        return arguments.length
            ? ((padding = typeof x === "function" ? x : constant(+x)), pack)
            : padding;
    };

    pack.download = function (data) {
        exportJson(data);
    };

    return pack;
}

function place_border_circles(bounding_circle, border_circles) {
    let sum_angle = sum_center_angle(border_circles, bounding_circle.r);

    let remaining_angle = Math.PI * 2 - sum_angle;
    let gap_angle = remaining_angle / border_circles.length;

    // set a random start angle
    let start_angle = Math.random() * Math.PI * 2;

    // place the border circles
    border_circles.forEach((circle) => {
        let angle = border_circle_angle(circle.br, bounding_circle.r);
        start_angle += angle / 2;
        circle.pr = bounding_circle.r; // parent radius
        circle.angle = start_angle; // angle
        circle.x =
            bounding_circle.x + bounding_circle.r * Math.cos(start_angle);
        circle.y =
            bounding_circle.y - bounding_circle.r * Math.sin(start_angle);
        let cur_gap = gap_angle * Math.random(0.1, 0.3);
        start_angle += angle / 2 + cur_gap;
    });
}

function draw_circle_pack(svg, data) {
    return draw(svg, data);
}

function enlarge_china(data) {
    let tree = data.tree;
    let nodes = data.nodes;

    let china = tree.children["中國"];
    let china_node = nodes[china.node_idx];
    china_node.x = china_node.x - china_node.br;
    china_node.y = china_node.y - china_node.br;
    china_node.br *= 2.4;

    // china_node.x = china_node.x - china_node.br * 2;
    // // china_node.y = china_node.y - china_node.br * 2;
    // // china_node.y -= 100;
    // china_node.br *= 3;
}

function tune(data) {
    console.log("tuning");
    // console.log(data);

    let tree = data.tree;
    let nodes = data.nodes;

    // // japan: x -> -x
    if (!optimize) {
        let japan = tree.children["日本"];
        for (let name in japan.children) {
            let node_idx = japan.children[name].node_idx;
            let node = nodes[node_idx];
            node.x = -node.x;
            node.y = -node.y;
        }
    }

    // china: move to left
    let japan = tree.children["日本"];
    let japan_node = nodes[japan.node_idx];
    // japan_node.x -= 10;

    // china: move to left
    let china = tree.children["中國"];
    let china_node = nodes[china.node_idx];
    china_node.x -= 50;
    china_node.y -= 20;
    // china_node.x -= 20;

    let koryo = tree.children["高麗"];
    let koryo_node = nodes[koryo.node_idx];
    koryo_node.y -= 90;
    // koryo_node.x -= 25;
    koryo_node.x -= 15;

    // // south korea: move to top
    // let korea = tree.children["韓國"];
    // let korea_node = nodes[korea.node_idx];
    // korea_node.y -= 50;
    // korea_node.x -= 20;

    // // north korea
    // let north_korea = tree.children["朝鮮"];
    // let north_korea_node = nodes[north_korea.node_idx];
    // north_korea_node.y -= 30;
    // north_korea_node.x -= 30;
}

function circle_sort(circles) {
    const order_dict = {
        安徽: 1,

        浙江: 2,
        福建: 2.5,
        江蘇: 3,
        四川: 200,
        江西: 201,
        湖南: 206,
        河北: 199,
        廣東: 205,
        // 上海: 10,
    };
    // const order_dict = {
    //     江蘇: 1,
    //     浙江: 2,
    //     四川: 200,
    // };
    circles.sort((a, b) => {
        let order_a = order_dict[a.name] || 100;
        let order_b = order_dict[b.name] || 100;
        return order_a - order_b;
    });
}

export { circle_pack, draw_circle_pack, GraphDrawer };
