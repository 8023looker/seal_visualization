const d3 = require("d3");

import { update_traj_state } from "../update/traj";
import { cur_graph_layout } from "@/data/geo/api/";
import { cur_timeline_layout } from "@/data/BookTraj";
import { Point } from "@/data/geo/geometry";
import pack_siblings from "@/utils/pack/siblings";

export function trans_graph(data, constraints, dst_view) {
    if (dst_view === "geomap") {
        return graph_to_geo(data, constraints);
    } else if (dst_view === "timeline") {
        return graph_to_timeline(data, constraints);
    }
}

function graph_to_timeline(data, constraints) {
    const dst_trajs = cur_timeline_layout();
    // console.log("get transition data: graph to timeline");
    // console.log(dst_trajs);

    const nodes = data.nodes,
        edges = data.edges;

    let ori_trajs = update_traj_state(constraints);
    let trans_nodes = [];
    let trans_edges = [];

    // console.log("ori trajs");
    // console.log(ori_trajs);

    ori_trajs.forEach((d, i) => {
        let node_idx = data.node_idx_by_traj(i);
        trans_nodes.push({
            ...nodes[node_idx],
            node_state: dst_trajs[i].node_state,
            state: d.state,
        });
        // edge
        let edge_idx = data.edge_idx_by_traj(i);
        if (edge_idx) {
            trans_edges.push({
                ...edges[edge_idx],
                edge_state: {
                    ...dst_trajs[i].edge_state,
                },
            });
        }
    });

    let y_list = dst_trajs.map((d) => d.node_state.y);
    const y_min = d3.min(y_list);
    const y_max = d3.max(y_list);

    const sort_dict = {
        hovered: 0,
        brushed: 1,
        dehighlighted: 2,
        unfiltered: 3,
    };

    // pack nodes
    let node_groups = {};
    trans_nodes.forEach((d, i) => {
        if (!node_groups[d.node_idx]) {
            node_groups[d.node_idx] = [];
        }
        node_groups[d.node_idx].push({
            index: i,
            x: 0,
            y: 0,
            r: d.node_state.r,
            state: d.state,
        });
    });
    for (let node_idx in node_groups) {
        let circles = node_groups[node_idx];
        circles = circles.sort(
            (a, b) => sort_dict[a.state] - sort_dict[b.state]
        );
        let pack_circles = pack_siblings(circles);
        pack_circles.forEach((item) => {
            trans_nodes[item.index].start_node_state = {
                ...item,
            };
        });
    }

    return {
        nodes: trans_nodes,
        edges: trans_edges,
        y_min: y_min,
        y_max: y_max,
    };
}

function graph_to_geo(data, constraints) {
    const dst_trajs = cur_graph_layout();

    // console.log(dst_trajs);

    const nodes = data.nodes,
        edges = data.edges;

    const filter = constraints.filter;
    const selection = constraints.selection;
    const hover = constraints.hover;

    let ori_trajs = update_traj_state(constraints);

    let trans_nodes = [];
    let trans_edges = [];

    if (selection.value && selection.entity === "editions" && selection.value.length === 1) {
        let trans_ori_trajs = ori_trajs.filter((d) => d.state === "brushed");
        let pre_node_idx = null;
        trans_ori_trajs.forEach((d, i) => {
            let dst_traj = dst_trajs[d.ori_idx];
            // node
            let node_idx = data.node_idx_by_traj(d.ori_idx);
            trans_nodes.push({
                ...nodes[node_idx],
                node_state: dst_traj.node_state,
            });
            // edge
            if (pre_node_idx !== null) {
                const edge_idx = data.edge_idx_by_traj(d.ori_idx);
                trans_edges.push({
                    ...edges[edge_idx],
                    edge_state: {
                        ...parse_path(dst_traj.edge_state.d),
                        ...dst_traj.edge_state,
                    },
                });

                console.log(dst_traj.edge_state);
            }
            pre_node_idx = node_idx;
        });
        // console.log(trans_nodes, trans_edges);
    } else {
        ori_trajs.forEach((d, i) => {
            let node_idx = data.node_idx_by_traj(i);
            trans_nodes.push({
                ...nodes[node_idx],
                node_state: dst_trajs[i].node_state,
            });
            // edge
            let edge_idx = data.edge_idx_by_traj(i);
            if (edge_idx) {
                trans_edges.push({
                    ...edges[edge_idx],
                    edge_state: {
                        ...dst_trajs[i].edge_state,
                        ...parse_path(dst_trajs[i].edge_state.d),
                    },
                });
            }
        });
    }

    return {
        nodes: trans_nodes,
        edges: trans_edges,
    };
}

function parse_path(path) {
    const [start, end] = path.split("M")[1].split("l");
    const [sx, sy] = start.split(",").map((d) => parseFloat(d));
    const [dx, dy] = end.split(",").map((d) => parseFloat(d));
    const ex = sx + dx,
        ey = sy + dy;
    return {
        source: { x: sx, y: sy },
        target: { x: ex, y: ey },
    };
}
