import { read_data } from "../../Data";
import { update_edition_state } from "@/data/BookInfo";
import { get_book_traj } from "@/data/BookTraj";

export function update_traj_state(constraints) {
    const edition_dict = update_edition_state(constraints);
    let trajs = read_data().trajs;

    const filter = constraints.filter;
    const selection = constraints.selection;
    const hover = constraints.hover;

    trajs.forEach((d) => {
        let book = edition_dict[d["書名"]];
        if (book.state === "unfiltered") d.state = "unfiltered";
        else if (book.state === "dehighlighted") d.state = "dehighlighted";
        else d.state = "brushed";
    });

    // let book_trajs = get_book_traj().book_traj;

    for (let book in edition_dict) {
        let book_trajs = edition_dict[book].trajs;
        book_trajs.forEach((d) => {
            if (d.is_last_in_china) trajs[d.ori_idx].is_last_in_china = true;
            else trajs[d.ori_idx].is_last_in_china = false;
        });
    }

    if (filter.time_range != null) {
        let [start, end] = filter.time_range;
        trajs.forEach((d, i) => {
            let time_info = d.time_info;
            if (time_info.timestamp < start || time_info.timestamp > end) {
                d.state = "unfiltered";
            }
        });
    }

    if (filter.china2japan) {
        trajs.forEach((d) => {
            if (
                // d.state_flag === "block_print" ||
                d.state_flag === "Japan" ||
                d.is_last_in_china
            )
                return;
            d.state = "unfiltered";
        });
    }

    if (hover.value && hover.entity === "china2japan") {
        trajs.forEach((d) => {
            if (
                // d.state_flag === "block_print" ||
                d.state_flag === "Japan" ||
                d.is_last_in_china
            )
                return;
            d.state = "unfiltered";
        });
    }

    // update hover state
    // if (hover.value != null) {
    //     if (hover.entity === "library") {
    //         let traj_list = hover.value;
    //         // traj_list.forEach()
    //     }
    // }

    // // update selection state
    // if (selection.value != null) {
    //     if (selection.entity === 'library')
    // }

    return trajs;
}

export function update_traj_state_old(constraints) {
    let trajs = read_data().trajs;
    const filter = constraints.filter;
    const selection = constraints.selection;
    const hover = constraints.hover;

    trajs.forEach((d) => {
        d.filter_state = "filtered";
    });

    update_filtered();
    update_selected();
    update_hovered();

    function update_selected() {
        if (selection.value === null) return;

        let key,
            value = selection.value;

        if (selection.entity === "edition") key = "書名";

        trajs
            .filter((d) => d[key] === value)
            .forEach((d) => {
                d.state = "brushed";
            });
    }

    function update_hovered() {
        if (hover.value === null) return;

        let key = hover.entity,
            value = hover.value;

        if (hover.entity === "edition") key = "書名";

        trajs
            .filter((d) => d[key] === value)
            .forEach((d) => {
                d.state = "brushed";
            });

        if (hover.entity === "book_type") {
            trajs
                .filter((d) => d.book_type != value)
                .forEach((d) => {
                    d.filter_state = "unfiltered";
                });
        } else if (hover.entity === "library_type") {
            trajs
                .filter((d) => d.lib_type != value)
                .forEach((d) => {
                    d.filter_state = "unfiltered";
                });
        } else if (hover.entity === "agent_type") {
            trajs
                .filter((d) => d.agent_type != value)
                .forEach((d) => {
                    d.filter_state = "unfiltered";
                });
        }
    }

    function update_filtered() {
        if (filter.book != null) {
            trajs
                .filter((d) => d.book_type != filter.book)
                .forEach((d) => {
                    d.filter_state = "unfiltered";
                });
        }
        if (filter.library != null) {
            trajs
                .filter((d) => d.lib_type != filter.library)
                .forEach((d) => {
                    d.filter_state = "unfiltered";
                });
        }
        if (filter.agent != null) {
            trajs
                .filter((d) => d.agent_type != filter.agent)
                .forEach((d) => {
                    d.filter_state = "unfiltered";
                });
        }
    }

    trajs = trajs.map((d, i) => {
        return { ...d, ori_idx: i };
    });

    return trajs;
}
