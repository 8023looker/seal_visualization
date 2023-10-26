import { read_trajs } from "./Data";
import { classification } from "@/constant";
import { update_traj_state } from "./hier_graph/update/traj";

export function get_legend_data() {
    let trajs = read_trajs();

    let lib_types = classification.library;
    let agt_types = classification.agent;

    return {
        library: lib_types.map((type) => {
            return {
                name: type,
                entity: "library",
                num: trajs.filter((traj) => traj.lib_type === type).length,
            };
        }),
        agent: agt_types.map((type) => {
            return {
                name: type,
                entity: "agent",
                num: trajs.filter((traj) => traj.agent_type === type).length,
            };
        }),
    };
}

export function update_legend_data(data, constraints) {
    // console.log("update legend data");
    // console.log(data);
    // console.log(constraints);

    // const filter = constraints.filter;
    // const selection = constraints.selection;
    // const hover = constraints.hover;

    const trajs = update_traj_state(constraints);

    data.library.forEach((item) => {
        item.mid_num = trajs.filter(
            (traj) => traj.lib_type === item.name && traj.state != "unfiltered"
        ).length;
        item.fore_num = trajs.filter(
            (traj) =>
                traj.lib_type === item.name &&
                traj.state != "unfiltered" &&
                traj.state != "dehighlighted"
        ).length;
    });

    data.agent.forEach((item) => {
        item.mid_num = trajs.filter(
            (traj) =>
                traj.agent_type === item.name &&
                traj.filter_state != "unfiltered"
        ).length;
        item.fore_num = trajs.filter(
            (traj) =>
                traj.agent_type === item.name &&
                traj.state != "unfiltered" &&
                traj.state != "dehighlighted"
        ).length;
    });
}
