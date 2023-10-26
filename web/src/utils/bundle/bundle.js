import { jsonCopy } from "./copy.js";
import { construct_tree, findLCA } from "./tree.js";
const d3 = require("d3");

function get_all_edges(data) {
    // console.log(data.edges);
    const aggregated_edges = data.edges;
    let edges = [];
    aggregated_edges.forEach((d) => {
        d.trajs.forEach((_) => {
            edges.push(d);
        });
    });
    // console.log(edges);
    return edges;
}

export function edge_bundle(data) {
    // let tree = jsonCopy(data.tree);
    // construct_tree(tree);
    // console.log(tree);
    const tree = data.tree;
    const nodes = data.nodes;
    const root_node = get_root_node();

    const line = d3
        .line()
        .x((d) => d.x)
        .y((d) => d.y)
        .curve(d3.curveBundle.beta(0.85));

    const edges = get_all_edges(data);
    edges.forEach((d) => {
        let control_points = find_LCA(d.source, d.target);
        d.bundle_path = line(control_points);
        // console.log(d.bundle_path);
    });

    function find_LCA(node1, node2) {
        // console.log(node1.name, node2.name);

        let control_points = [];

        let depth1 = get_depth(node1.node_idx);
        let depth2 = get_depth(node2.node_idx);

        let index1 = node1.node_idx;
        let index2 = node2.node_idx;
        let root;

        // console.log(depth1, depth2);
        while (depth1 > depth2) {
            index1 = nodes[index1].parent;
            depth1--;
        }

        while (depth2 > depth1) {
            index2 = nodes[index2].parent;
            depth2--;
        }

        while (index1 !== index2) {
            index1 = nodes[index1].parent;
            index2 = nodes[index2].parent;
        }

        (root = index1), (index1 = node1.node_idx), (index2 = node2.node_idx);

        let cpts1 = [],
            cpts2 = [];

        while (index1 !== root) {
            cpts1.push(nodes[index1]);
            index1 = nodes[index1].parent;
        }

        while (index2 !== root) {
            cpts2.push(nodes[index2]);
            index2 = nodes[index2].parent;
        }

        root = root === -1 ? root_node : nodes[root];

        let len1 = cpts1.length;
        let len2 = cpts2.length;

        if (len1 + len2 >= 3) control_points = cpts1.concat(cpts2.reverse());
        else control_points = cpts1.concat([root]).concat(cpts2.reverse());
        // control_points = cpts1.concat([root]).concat(cpts2.reverse());

        // console.log(control_points);

        return control_points;
    }

    function get_root_node() {
        let node1 = tree.children.中國.node_idx,
            node2 = tree.children.日本.node_idx;
        (node1 = nodes[node1]), (node2 = nodes[node2]);
        let r1 = node1.r,
            r2 = node2.r;
        let x1 = node1.x,
            y1 = node1.y,
            x2 = node2.x,
            y2 = node2.y;
        let cx = (r2 * x1) / (r1 + r2) + (r1 * x2) / (r1 + r2);
        let cy = (r2 * y1) / (r1 + r2) + (r1 * y2) / (r1 + r2);
        return { x: cx, y: cy };
    }

    function get_depth(node_idx) {
        let depth = 0;
        while (node_idx != -1) {
            node_idx = nodes[node_idx].parent;
            depth++;
        }
        return depth;
    }

    return edges;
}
