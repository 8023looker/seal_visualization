import { read_data, read_trajs } from "./Data";

let edition_dict = {};

export function read_edition_dict() {
    return edition_dict;
}

export function get_book_list() {
    let editions = read_data().books;
    let trajs = read_trajs();
    // console.log(editions);
    let type_list = ["经部", "史部", "子部", "集部"];
    let book_list = [];
    book_list = type_list.map((type, t_idx) => {
        let children = editions
            .filter((book) => book.type === type)
            .sort((a, b) => a.book_name.localeCompare(b.book_name));
        let book_dict = {};
        children.forEach((d, i) => {
            edition_dict[d.book_name] = {
                book_list_index: [t_idx, i],
                type: type,
                filter_state: "filtered",
                trajs: [],
                ...d,
            };

            let name = d.book_name.split("（")[0];
            if (!(name in book_dict)) {
                book_dict[name] = [];
            }
            book_dict[name].push(i);
        });
        let books = [];
        for (let name in book_dict) {
            if (book_dict[name].length > 1) {
                books.push({
                    name: name,
                    type: type,
                    children_idxs: book_dict[name],
                });
            }
        }
        return {
            name: type,
            children: children,
            books: books,
        };
    });

    trajs.forEach((d) => {
        edition_dict[d["書名"]].trajs.push(d);
    });

    // 刊刻信息，首次到日本的信息
    book_list.forEach((group) => {
        let editions = group.children;
        editions.forEach((edition) => {
            // console.log(edition);
            let edition_info = edition_dict[edition.book_name];
            // console.log(edition_info);

            let last_in_china = -1;
            for (let i = 0; i < edition_info.trajs.length; ++i) {
                let state_flag = edition_info.trajs[i].state_flag;
                if (
                    state_flag === "block_print" ||
                    state_flag === "normal_internal"
                ) {
                    last_in_china = i;
                } else if (state_flag === "Japan") {
                    break;
                }
            }
            // console.log(last_in_china);
            if (last_in_china >= 0) {
                edition_info.trajs[last_in_china].is_last_in_china = true;
                // console.log(edition_info.trajs[last_in_china]);
            } else edition_info.trajs[last_in_china].is_last_in_china = false;

            edition.important_trajs = edition_info.trajs.filter(
                (traj) =>
                    // traj.state_flag === "block_print" ||
                    traj.state_flag === "Japan" || traj.is_last_in_china
            );
        });
    });

    return book_list;
}

export function update_edition_state(constraints) {
    const filter = constraints.filter;
    const selection = constraints.selection;
    const hover = constraints.hover;
    const trajs = read_trajs();

    // console.log("trajs", trajs);

    let hover_book_dict = {},
        selection_book_dict = {};

    function traj_in_time_range(traj) {
        if (filter.time_range) {
            let [start, end] = filter.time_range;
            let timestamp = traj.time_info.timestamp;
            if (timestamp < start || timestamp > end) return false;
        }
        if (filter.china2japan) {
            // if (traj.is_last_in_china) console.log(traj);
            if (
                traj.state_flag !== "Japan" // && // &&
                // traj.state_flag !== "block_print"
                // traj.is_last_in_china === false
            )
                return false;
        }
        return true;
    }

    if (hover.value != null) {
        if (hover.entity === "library") {
            let traj_idxs = hover.value;
            traj_idxs.forEach((idx) => {
                let book_name = trajs[idx]["書名"];
                hover_book_dict[book_name] = true;
            });
        } else if (hover.entity === "library_id") {
            trajs
                .filter(
                    (d) =>
                        d.lib_id === hover.value || d.fr_lib_id === hover.value
                )
                .filter((d) => traj_in_time_range(d))
                .forEach((d) => {
                    hover_book_dict[d.書名] = true;
                });
        } else if (hover.entity === "locations") {
            let traj_idxs = hover.value.trajs.map((d) => trajs[d].lib_id);
            // traj_idxs.forEach((idx) => {
            //     let book_name = trajs[idx]["書名"];
            //     hover_book_dict[book_name] = true;
            // });
            trajs
                .filter(
                    (d) =>
                        traj_idxs.includes(d.lib_id) ||
                        traj_idxs.includes(d.fr_lib_id)
                    // d.lib_id === selection.value ||
                    // d.fr_lib_id === selection.value
                )
                .filter((d) => traj_in_time_range(d))
                .forEach((d) => {
                    hover_book_dict[d.書名] = true;
                });
        }
    }

    if (selection.value != null) {
        if (selection.entity === "library") {
            let traj_idxs = selection.value;
            traj_idxs.forEach((idx) => {
                let book_name = trajs[idx]["書名"];
                selection_book_dict[book_name] = true;
            });
        } else if (selection.entity === "library_id") {
            trajs
                .filter(
                    (d) =>
                        d.lib_id === selection.value ||
                        d.fr_lib_id === selection.value
                )
                .filter((d) => traj_in_time_range(d))
                .forEach((d) => {
                    selection_book_dict[d.書名] = true;
                });
        } else if (selection.entity === "path") {
            for (let name in edition_dict) {
                // let edition_trajs = edition_dict[name].trajs
                //     .filter((d) => traj_in_time_range(d))
                //     .map((d) => d.lib_id);
                // let flag = true;
                // selection.value.forEach((d) => {
                //     if (edition_trajs.indexOf(d) === -1) flag = false;
                // });
                // if (flag) selection_book_dict[name] = true;
                // 改成只要都经过且时间段内与这个路径有关呢？
                // 是否都经过过这个路径
                let edition_trajs = edition_dict[name].trajs.map(
                    (d) => d.lib_id
                );
                let flag = true;
                selection.value.forEach((d) => {
                    if (edition_trajs.indexOf(d) === -1) flag = false;
                });
                if (!flag) continue;
                // 都经过过，看时间段内是否与这个路径有交集
                let edition_trajs_in_time_range = edition_dict[name].trajs
                    .filter((d, i) => traj_in_time_range(d))
                    .map((d) => d.lib_id);
                flag = false;
                edition_dict[name].trajs
                    .filter(
                        (d) =>
                            selection.value.includes(d.lib_id) ||
                            selection.value.includes(d.fr_lib_id)
                    )
                    .filter((d, i) => traj_in_time_range(d))
                    .forEach((d) => {
                        flag = true;
                    });
                // selection.value.forEach((d) => {
                //     if (edition_trajs_in_time_range.indexOf(d) !== -1)
                //         flag = true;
                // });
                if (flag) selection_book_dict[name] = true;
            }
        } else if (selection.entity === "locations") {
            let traj_idxs = selection.value.trajs.map((d) => trajs[d].lib_id);
            // traj_idxs
            //     .filter((idx) => traj_in_time_range(trajs[idx]))
            //     .forEach((idx) => {
            //         let book_name = trajs[idx]["書名"];
            //         selection_book_dict[book_name] = true;
            //     });
            trajs
                .filter(
                    (d) =>
                        traj_idxs.includes(d.lib_id) ||
                        traj_idxs.includes(d.fr_lib_id)
                    // d.lib_id === selection.value ||
                    // d.fr_lib_id === selection.value
                )
                .filter((d) => traj_in_time_range(d))
                .forEach((d) => {
                    selection_book_dict[d.書名] = true;
                });
        }
    }

    // set default state: brushed
    for (let name in edition_dict) {
        let edition = edition_dict[name],
            flag;
        edition.state = "brushed";
        edition.preserve_state = false;

        // 有无被 filter 掉
        if (filter.book != null && edition.type != filter.book) {
            edition.state = "unfiltered";
        }
        if (filter.library != null) {
            flag = false;
            edition.trajs
                .filter((d, i) =>
                    i
                        ? traj_in_time_range(d) ||
                          traj_in_time_range(edition.trajs[i - 1])
                        : traj_in_time_range(d)
                )
                .forEach((d) => {
                    if (d.lib_type === filter.library) flag = true;
                });
            edition.state = flag ? edition.state : "unfiltered";
        }
        if (filter.agent != null) {
            flag = false;
            edition.trajs
                .filter((d, i) =>
                    i
                        ? traj_in_time_range(d) ||
                          traj_in_time_range(edition.trajs[i - 1])
                        : traj_in_time_range(d)
                )
                .forEach((d) => {
                    if (d.agent_type === filter.agent) flag = true;
                });
            edition.state = flag ? edition.state : "unfiltered";
        }
        // time range
        // 如果一本书在这个时间区间内没有移动，就 filter 掉
        if (filter.time_range != null) {
            let [start, end] = filter.time_range;
            flag = false;
            edition.trajs.forEach((d) => {
                if (traj_in_time_range(d)) flag = true;
                // let timestamp = d.time_info.timestamp;
                // if (timestamp >= start && timestamp <= end) {
                //     flag = true;
                // }
            });
            edition.state = flag ? edition.state : "unfiltered";
        }

        if (edition.state === "unfiltered") continue;

        // update hover state
        if (hover.value != null) {
            if (hover.entity === "edition") {
                edition.state =
                    // name === hover.value ? "hovered" : "dehighlighted";
                    name === hover.value ? "hovered" : edition.state;
                edition.preserve_state = name === hover.value ? true : false;
            } else if (
                hover.entity === "book_type" &&
                edition.type != hover.value
            ) {
                edition.state = "dehighlighted";
            } else if (hover.entity === "library_type") {
                flag = false;
                edition.trajs
                    .filter((d, i) =>
                        i
                            ? traj_in_time_range(d) ||
                              traj_in_time_range(edition.trajs[i - 1])
                            : traj_in_time_range(d)
                    )
                    .forEach((d) => {
                        if (d.lib_type === hover.value) flag = true;
                    });
                edition.state = flag ? edition.state : "dehighlighted";
            } else if (hover.entity === "agent_type") {
                flag = false;
                edition.trajs
                    .filter((d, i) =>
                        i
                            ? traj_in_time_range(d) ||
                              traj_in_time_range(edition.trajs[i - 1])
                            : traj_in_time_range(d)
                    )
                    .forEach((d) => {
                        if (d.agent_type === hover.value) flag = true;
                    });
                edition.state = flag ? edition.state : "dehighlighted";
            } else if (hover.entity === "library") {
                edition.state =
                    name in hover_book_dict ? edition.state : "dehighlighted";
                edition.preserve_state = name in hover_book_dict ? true : false;
            } else if (hover.entity === "library_id") {
                edition.state =
                    name in hover_book_dict ? edition.state : "dehighlighted";
                edition.preserve_state = name in hover_book_dict ? true : false;
            } else if (hover.entity === "locations") {
                edition.state =
                    name in hover_book_dict ? edition.state : "dehighlighted";
                edition.preserve_state = name in hover_book_dict ? true : false;
            }
        }

        // update selection state
        if (selection.value != null) {
            if (selection.entity === "edition") {
                if (name === selection.value) edition.state = "selected";
                else
                    edition.state = edition.preserve_state
                        ? edition.state
                        : "dehighlighted";
            } else if (selection.entity === "editions") {
                if (selection.value.includes(name)) edition.state = "selected";
                else
                    edition.state = edition.preserve_state
                        ? edition.state
                        : "dehighlighted";
            } else if (
                selection.entity === "library" ||
                selection.entity === "library_id" ||
                selection.entity === "path" ||
                selection.entity === "locations"
            ) {
                edition.state =
                    name in selection_book_dict
                        ? edition.state
                        : "dehighlighted";
            }
        }
    }

    // // update hover states
    // if (hover.entity === "library") {
    //     let traj_idxs = hover.value;
    //     traj_idxs.forEach((idx) => {
    //         let traj = trajs[idx];
    //         let book_name = traj["書名"];
    //     });
    // }

    return edition_dict;
}

export function update_book_list(data, constraints) {
    // console.log("update book list");
    // console.log(data);
    // console.log(constraints);

    update_edition_state(constraints);

    const filter = constraints.filter;
    const selection = constraints.selection;
    const hover = constraints.hover;

    data.forEach((items) => {
        items.children.forEach((item) => {
            // item.state = "brushed";
            item.state = edition_dict[item.book_name].state;
        });
    });

    return;

    update_hovered();
    update_selected();
    update_filtered();

    function update_selected() {
        if (selection.value === null) return;

        let entity = selection.entity;
        let value = selection.value;

        if (entity === "edition") {
            let [t_idx, idx] = edition_dict[value].book_list_index;
            data[t_idx].children[idx].state = "selected";
        }
    }

    function update_hovered() {
        if (hover.value === null) return;

        let entity = hover.entity;
        let value = hover.value;

        // if hover an edition, highlight the edition
        if (entity === "edition") {
            let [t_idx, idx] = edition_dict[value].book_list_index;
            data[t_idx].children[idx].state = "hovered";
        }
        // if hover a type, dehighlight other types
        else if (entity === "book_type") {
            data.filter((d) => d.name != value).forEach((d) => {
                d.children.forEach((item) => {
                    item.state = "dehighlighted";
                });
            });
            data.filter((d) => d.name === value).forEach((d) => {
                d.children.forEach((item) => {
                    item.state = "brushed";
                });
            });
        }
    }

    function update_filtered() {
        if (filter.book != null) {
            data.filter((d) => d.name != filter.book).forEach((d) => {
                d.children.forEach((item) => {
                    item.state = "unfiltered";
                });
            });
        }
    }
}
