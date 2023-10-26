import { HierNode } from "./node";
import { get_book_traj } from "@/data/BookTraj";
import { read_loc_geo } from "@/data/Data";
import { read_edition_dict } from "@/data/BookInfo";

export class Hierarchy {
    static traj2node = new Map();
    static node2edge = new Map();
    static traj2edge = new Map();

    constructor(data) {
        this.data = data;
        this.nodes = [];
        this.edges = [];
        this.tree = { name: "", children: {} };
        this.od_dict = {};

        this.init_unk();
        this.construct_tree();

        // 补丁，存储出边，之前只存储了节点的入边
        this.add_node_out_trajs();

        this.statistics();
    }

    node_idx_by_traj(id) {
        return Hierarchy.traj2node.get(id);
    }

    edge_idx_by_node(src, tgt) {
        return Hierarchy.node2edge.get(`${src}-${tgt}`);
    }

    edge_idx_by_traj(id) {
        return Hierarchy.traj2edge.get(id);
    }

    get_ancestors(node_idx) {
        let ancestors = [];
        while (node_idx > 0) {
            ancestors.unshift(node_idx);
            node_idx = this.nodes[node_idx].parent;
        }
        return ancestors;
    }

    get_node_location_std(node_idx) {
        const ancestors = this.get_ancestors(node_idx);
        const locs = ancestors.map((d) => this.nodes[d].name);
        return locs.join("-");
    }

    node_idx_by_location_std(loc) {
        const locs = loc.split("-");
        let pt = this.tree;
        locs.forEach((d) => {
            pt = pt.children[d];
        });
        return pt.node_idx;
    }

    locate_node_on_tree(node_idx) {
        let ancestors = this.get_ancestors(node_idx);
        let pt = this.tree;
        for (let anc of ancestors) {
            pt = pt.children[this.nodes[anc].name];
        }
        return pt;
    }

    get_children(node_idx) {
        let ancestors = this.get_ancestors(node_idx);
        let pt = this.tree;
        let res = [];
        for (let anc of ancestors) {
            pt = pt.children[this.nodes[anc].name];
        }
        if (this.nodes[pt.node_idx].is_leaf()) return res;
        for (let name in pt.children) {
            res.push(pt.children[name].node_idx);
        }
        return res;
    }

    construct_tree() {
        this.construct_nodes();
        this.construct_edges();
        this.assign_geo();
        this.tree = this.tree.children.root;
    }

    construct_nodes() {
        console.log("constructing nodes");
        this.data.forEach((d, i) => {
            this.insert_traj(d, i);
        });
    }

    construct_edges() {
        let book_traj = get_book_traj().book_traj;
        for (let book in book_traj) {
            let traj = book_traj[book];
            traj.forEach((_, i) => {
                if (i === 0) return;
                let state_flag = traj[i - 1].state_flag;
                this.insert_od_event(
                    traj[i - 1].ori_idx,
                    traj[i].ori_idx,
                    state_flag
                );
            });
        }

        this.edges = this.get_edge_list(this.od_dict, this.nodes);
    }

    init_unk() {
        this.cnt_unk = 0;
        this.unk_name_dict = {};
    }

    new_node_idx() {
        return this.nodes.length;
    }

    new_unk_name(traj_idx) {
        let name = "unk_" + this.cnt_unk;
        this.unk_name_dict[traj_idx] = name;
        this.cnt_unk++;
        return name;
    }

    add_node_out_trajs() {
        const edition_dict = read_edition_dict();
        for (let book in edition_dict) {
            const trajs = edition_dict[book].trajs;
            for (let i = 1; i < trajs.length; ++i) {
                const traj = trajs[i];
                const t_idx = traj.ori_idx;
                let [prev_loc, _] = get_pos_list(trajs[i - 1]);
                let cur_pt = this.tree;
                prev_loc.slice(1).forEach((d) => {
                    if (d === "") d = trajs[i - 1].lib_id;
                    this.nodes[cur_pt.node_idx].add_out_traj(t_idx);
                    cur_pt = cur_pt.children[d];
                });
                this.nodes[cur_pt.node_idx].add_out_traj(t_idx);
            }
        }
    }

    insert_traj(traj, traj_idx) {
        let [pos_list, leaf_type] = get_pos_list(traj);
        let cur_pt = this.tree;

        let create_node = ({
            name = "",
            level = null,
            type = "lib",
            name_type = "unk",
            traj = null,
            traj_idx = null,
            pt = null,
        }) => {
            let node_idx = this.new_node_idx();
            if (name === "") {
                name = this.new_unk_name(traj_idx);
            }
            let node = new HierNode(node_idx, name, level);
            node.set_type(type, name_type, traj);
            node.add_traj(traj_idx);
            node.set_parent(pt.node_idx);
            this.nodes.push(node);
            pt.children[name] = { node_idx: node_idx };
            if (type === "lct") {
                pt.children[name].children = {};
            }
            Hierarchy.traj2node.set(traj_idx, node_idx);
        };

        pos_list.forEach((pos, i) => {
            if (pos === "") {
                create_node({
                    level: i - 1,
                    traj: traj,
                    traj_idx: traj_idx,
                    pt: cur_pt,
                });
            } else if (cur_pt.children[pos] === undefined) {
                let node_idx = cur_pt.node_idx;
                if (node_idx) {
                    let node = this.nodes[node_idx];
                    node.add_traj(traj_idx);
                    Hierarchy.traj2node.set(traj_idx, node_idx);
                }
                if (i === pos_list.length - 1) {
                    create_node({
                        name: pos,
                        level: i - 1,
                        name_type: leaf_type,
                        traj: traj,
                        traj_idx: traj_idx,
                        pt: cur_pt,
                    });
                } else {
                    create_node({
                        name: pos,
                        level: i - 1,
                        type: "lct",
                        name_type: null,
                        traj: traj,
                        traj_idx: traj_idx,
                        pt: cur_pt,
                    });
                    cur_pt = cur_pt.children[pos];
                }
            } else {
                let node_idx = cur_pt.node_idx;
                if (node_idx >= 0) {
                    let node = this.nodes[node_idx];
                    node.add_traj(traj_idx);
                    Hierarchy.traj2node.set(traj_idx, node_idx);
                }
                cur_pt = cur_pt.children[pos];
                if (i === pos_list.length - 1) {
                    let child_node_idx = cur_pt.node_idx;
                    let child_node = this.nodes[child_node_idx];
                    child_node.add_traj(traj_idx);
                    Hierarchy.traj2node.set(traj_idx, child_node_idx);
                }
            }
        });
    }

    insert_od_event(pre_idx, cur_idx, state_flag) {
        let get_node_index_list = (ori_idx) => {
            let [pos_list, _] = get_pos_list(this.data[ori_idx]);
            let idx_list = [];
            let pt = this.tree;
            pos_list.forEach((pos) => {
                if (pt.children[pos] === undefined) {
                    pos = this.unk_name_dict[ori_idx];
                }
                pt = pt.children[pos];
                idx_list.push(pt.node_idx);
            });
            return idx_list;
        };

        // get position list, and transform to node index list
        let pre_node_idxs = get_node_index_list(pre_idx);
        let cur_node_idxs = get_node_index_list(cur_idx);

        // for each pair of pre node and cur node, insert an od event
        pre_node_idxs.forEach((pre_node_idx) => {
            cur_node_idxs.forEach((cur_node_idx) => {
                if (this.od_dict[pre_node_idx] === undefined) {
                    this.od_dict[pre_node_idx] = {};
                }
                if (this.od_dict[pre_node_idx][cur_node_idx] === undefined) {
                    this.od_dict[pre_node_idx][cur_node_idx] = {
                        trajs: [],
                        state_flag: state_flag,
                    };
                }
                this.od_dict[pre_node_idx][cur_node_idx].trajs.push(cur_idx);
            });
        });
    }

    get_edge_list(od_dict, nodes) {
        let edges = [];

        // 取出所有叶子节点之间的边
        for (let src in od_dict) {
            if (!nodes[src].is_leaf()) continue;
            let children = od_dict[src];
            for (let tgt in children) {
                if (!nodes[tgt].is_leaf()) continue;
                let weight = children[tgt].trajs.length;
                Hierarchy.node2edge.set(src + "-" + tgt, edges.length);

                children[tgt].trajs.forEach((traj_idx) => {
                    Hierarchy.traj2edge.set(traj_idx, edges.length);
                });

                edges.push({
                    edge_idx: edges.length,
                    source: nodes[src],
                    target: nodes[tgt],
                    weight: weight,
                    trajs: children[tgt].trajs,
                    state_flag: children[tgt].state_flag,
                });
            }
        }
        return edges;
    }

    assign_geo() {
        let loc_geo = read_loc_geo();
        console.log(loc_geo);

        let assign_geo_to_node = (node) => {
            let ancestors = this.get_ancestors(node.node_idx);
            let pt = loc_geo;
            let coord = pt.coord;
            for (let node_idx of ancestors) {
                if (pt === undefined || pt.children === undefined) break;
                let name = this.nodes[node_idx].name;
                pt = pt.children[name];
                coord = pt === undefined ? coord : pt.coord;
            }
            node.coord = coord;
        };

        this.nodes.forEach((node) => {
            assign_geo_to_node(node);
        });
    }

    statistics() {
        console.log("number of nodes: ", this.nodes.length)
        let leaf_nodes = this.nodes.filter(n => n.is_leaf());
        console.log("number of leaf nodes: ", leaf_nodes.length)
        console.log("number of edges", this.edges.length)
        let leaf_edges = this.edges.filter(e => e.source.is_leaf() && e.target.is_leaf());
        console.log("number of leaf edges", leaf_edges.length);
    }
}

export function get_pos_list(item) {
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

    if (pos_list[0] === "韓國" || pos_list[0] === "朝鮮") {
        pos_list = ["高麗"].concat(pos_list);
    }

    return [["root"].concat(pos_list), leaf_type];
}

// function get_edge_list(od_dict, nodes) {
//     let edges = [];

//     // 取出所有叶子节点之间的边
//     for (let src in od_dict) {
//         if (!nodes[src].is_leaf()) continue;
//         let children = od_dict[src];
//         for (let tgt in children) {
//             if (!nodes[tgt].is_leaf()) continue;
//             let weight = children[tgt].length;
//             edges.push({
//                 source: nodes[src],
//                 target: nodes[tgt],
//                 weight: weight,
//                 trajs: children[tgt],
//             });
//         }
//     }
//     return edges;
// }
