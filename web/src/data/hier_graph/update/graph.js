import { update_traj_state } from "./traj";
import { read_edition_dict } from "@/data/BookInfo";

export function update_graph_data(data, constraints) {
    let trajs = update_traj_state(constraints);
    let edition_dict = read_edition_dict();

    const filter = constraints.filter;
    const hover = constraints.hover;
    const selection = constraints.selection;
    const show_src = constraints.show_source_libs;

    data.nodes
        // .filter((d) => d.is_leaf())
        .forEach((d) => {
            d.mid_size = Math.max(
                d.trajs.filter((idx) => trajs[idx].state != "unfiltered")
                    .length,
                !show_src
                    ? 0
                    : d.out_trajs.filter(
                          (idx) => trajs[idx].state != "unfiltered"
                      ).length
            );
            d.fore_size = Math.max(
                d.trajs.filter(
                    (idx) =>
                        trajs[idx].state != "unfiltered" &&
                        trajs[idx].state != "dehighlighted"
                ).length,
                !show_src
                    ? 0
                    : d.out_trajs.filter(
                          (idx) =>
                              trajs[idx].state != "unfiltered" &&
                              trajs[idx].state != "dehighlighted"
                      ).length
            );
            d.node_highlighted = false;
        });

    data.edges
        .filter((d) => d.source.is_leaf() && d.target.is_leaf())
        .forEach((d) => {
            d.mid_weight = d.trajs.filter(
                (idx) => trajs[idx].state != "unfiltered"
            ).length;
            d.fore_weight = d.trajs.filter(
                (idx) =>
                    trajs[idx].state != "unfiltered" &&
                    trajs[idx].state != "dehighlighted"
            ).length;
            d.show_dasharray = false;
            d.edge_highlighted = false;
        });

    // if a single book is hovered or selected, highlight the path
    if (hover.value != null && hover.entity === "edition") {
        // console.log(edition_dict[hover.value]);
        const edition_trajs = edition_dict[hover.value].trajs.map(
            (d) => d.ori_idx
        );
        // console.log(edition_trajs);

        edition_trajs.forEach((d, i) => {
            let node_idx = data.node_idx_by_traj(d);

            // data.nodes[node_idx].fore_size *= 2;
            data.nodes[node_idx].node_highlighted = true;
            if (i) {
                let edge_idx = data.edge_idx_by_traj(d);
                if (data.edges[edge_idx])
                    data.edges[edge_idx].edge_highlighted = true;
            }
        });

        // function ()

        // data.nodes.filter(d => d.trajs.includes())
    }
    // if select editions, show dash path
    if (
        // (hover.value != null && hover.entity === "edition") ||
        (selection.value != null &&
            selection.entity === "edition" &&
            (hover.value === null ||
                (hover.value != null && hover.entity === "edition"))) ||
        (selection.value != null &&
            selection.entity === "editions" &&
            (hover.value === null ||
                (hover.value != null && hover.entity === "edition")))
    ) {
        // data.nodes
        //     .filter((d) => d.is_leaf())
        //     .forEach((d) => {
        //         d.fore_size *= 2;
        //     });
        data.edges.forEach((d) => {
            // d.fore_weight *= 3;
            d.show_dasharray = true;
        });

        // const edition_trajs = trajs.filter(
        //     (d) => d.state != "unfiltered" && d.state != "dehighlighted"
        // );
        // edition_trajs.forEach((d) => {
        //     // TODO: node_idx_by_traj 的写法有 bug, 保存的是机构节点，在 LOD 的时候会出问题。
        //     let node_idx = data.node_idx_by_traj(d.ori_idx);
        //     if (
        //         d.state_flag === "block_print" ||
        //         d.state_flag === "Japan" ||
        //         d.state_flag === "transnational"
        //     ) {
        //         data.nodes[node_idx].fore_size *= 3;
        //     }
        // });
    }
    // } else if (hover.value != null || selection.value != null) {
    // 判断当前轨迹数量
    const cnt_edge = data.edges.filter((d) => d.fore_weight > 0).length;
    if (cnt_edge < 10) {
        data.edges
            .filter((d) => d.fore_weight > 0)
            .forEach((d) => {
                // if (d.fore_weight < 4) d.fore_weight *= 2;
                // // if (d.fore_weight === 1) d.fore_weight = 4;
                // else d.fore_weight += 2.5;
                d.fore_weight += 3;
            });
    } else if (cnt_edge < 30) {
        data.edges
            .filter((d) => d.fore_weight > 0)
            .forEach((d) => {
                // if (d.fore_weight < 4) d.fore_weight *= 2;
                // // if (d.fore_weight === 1) d.fore_weight = 4;
                // else d.fore_weight += 2.5;
                d.fore_weight += 2;
            });
    } else if (cnt_edge < 60) {
        data.edges
            .filter((d) => d.fore_weight > 0)
            .forEach((d) => {
                // if (d.fore_weight === 1) d.fore_weight = 3;
                // else d.fore_weight += 1;
                if (d.fore_weight < 4) d.fore_weight *= 1.5;
                // if (d.fore_weight === 1) d.fore_weight = 4;
                else d.fore_weight += 1;
            });
    } else if (cnt_edge < 150) {
        data.edges
            .filter((d) => d.fore_weight === 1)
            .forEach((d) => {
                d.fore_weight += 1;
            });
    }
    // }
}

export function update_graph_data_old(data, constraints) {
    // console.log("update graph data status");
    // console.log(data);
    // console.log(constraints);

    let nodes = data.nodes;
    let edges = data.edges;

    const filter = constraints.filter;
    const selection = constraints.selection;
    const hover = constraints.hover;

    let trajs = update_traj_state(constraints);

    nodes.forEach((d) => {
        d.state = "brushed";
    });

    edges.forEach((d) => {
        d.state = "brushed";
    });

    update_filtered();
    update_hovered();
    update_selected();

    function update_selected() {
        if (selection.value === null) return;

        let entity = selection.entity;

        // if hover an edition, highlight the path of the edition
        if (entity === "edition") {
            edition_focused_handler(nodes);
            edition_focused_handler(edges);
        }
    }

    function update_hovered() {
        if (hover.value === null) return;

        let entity = hover.entity;

        // if hover an edition, highlight the path of the edition
        if (entity === "edition") {
            edition_focused_handler(nodes);
            edition_focused_handler(edges);
        }
    }

    function update_filtered() {
        // filter 影响的是前后景的大小
        nodes.forEach((d) => {
            d.fore_size = d.trajs.filter(
                (idx) => trajs[idx].filter_state === "filtered"
            ).length;
            d.mid_size = d.trajs.filter(
                (idx) => trajs[idx].filter_state === "filtered"
            ).length;
        });
        edges.forEach((d) => {
            d.fore_weight = d.trajs.filter(
                (idx) => trajs[idx].filter_state === "filtered"
            ).length;
            d.mid_weight = d.trajs.filter(
                (idx) => trajs[idx].filter_state === "filtered"
            ).length;
        });
    }

    function edition_focused_handler(group) {
        group.forEach((d) => {
            for (let idx of d.trajs) {
                if (trajs[idx].state === "brushed") {
                    d.state = "brushed";
                    return;
                }
            }
            d.state = "dehighlighted";
        });
    }
}
