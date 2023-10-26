import { read_data } from "../Data";
import { Hierarchy } from "./hierarchy";
import { type_color } from "@/theme";
export { update_graph_data } from "./update/graph";

let graph_data;

export function get_graph_data() {
    let data = read_data();
    graph_data = new Hierarchy(data.trajs);
    return graph_data;
}

export function read_graph_data() {
    return graph_data;
}

export function cur_graph_layout() {
    let trajs = read_data().trajs;

    let data = graph_data;
    let nodes = data.nodes;
    let edges = data.edges;

    nodes.forEach((d) => {
        d.trajs.forEach((idx) => {
            trajs[idx].node_state = {
                x: d.x,
                y: d.y,
                fill: type_color.library[d.lib_type],
                r:
                    d.fore_size != null
                        ? Math.sqrt(d.fore_size / d.size) * d.br
                        : d.br,
            };
        });
    });

    edges.forEach((d) => {
        d.trajs.forEach((idx) => {
            trajs[idx].edge_state = {
                d: d.path,
                source: {
                    x: d.source.x,
                    y: d.source.y,
                },
                target: {
                    x: d.target.x,
                    y: d.target.y,
                },
                stroke: type_color.edge_color,
                stroke_opacity: 0.6,
                stroke_width:
                    d.fore_weight != null
                        ? (d.fore_weight / d.weight) * d.stroke_width
                        : d.stroke_width,
            };
        });
    });

    return trajs;
}

export class Traj {
    constructor(data) {
        this.traj = data;
    }

    get_pos_list() {
        let item = this.traj;
        // TODO 数据要修改
        let pos_list =
            item.location_std != "" ? item.location_std.split("-") : ["日本"];
        let leaf_type = "lib";
        // if the libary is known, add it to the position list
        if (item.library !== "") {
            pos_list.push(item.library.replace("?", ""));
        }
        // else, if the agent is known, add it to the position list
        else if (item.agent !== "") {
            pos_list.push(item.agent.replace("?", ""));
            leaf_type = "agt";
        } else {
            pos_list.push("");
            leaf_type = "unk";
        }
        return [pos_list, leaf_type];
    }
}
