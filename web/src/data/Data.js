import * as d3 from "d3";
import { jsonCopy } from "@/utils/copy";
export * as Geo from "./geo/";
export { get_legend_data, update_legend_data } from "./legend";
import * as BookTraj from "@/data/BookTraj";
import * as Data from "@/data/TimeLineData";
import * as Translate from "@/theme/lang";
import * as TimeReasoning from "@/data/timeline/time_reasoning_data"

let data_;
let edition_type = {};
let translate_dict_all = {};

export async function load_seal_data() { // 待补充

}

export async function load_data() {
    let trajs = await d3.csv("data/book_traj.csv"); // 原始 data, 不修改
    const books = await d3.csv("data/book_info.csv"); // 原始 data, 不修改
    const loc_geo = await d3.json("data/loc_tree_generate.json");
    const book_image_pos = await d3.json("data/book_image_position.json") // 单本书timeline中各书影图片的position
    const time_reasoning = TimeReasoning.reasoning_data

    let translate_dict = await d3.csv("data/Han_Track_Translation.csv"); // 对应的translate数据
    translate_dict = BookTraj.construct_book_translate(translate_dict);
    
    translate_dict_all = translate_dict
    console.log("translate_dict_all", translate_dict_all);

    books.forEach((d) => {
        edition_type[d.book_name] = d.type;
    });

    data_ = {
        trajs: trajs,
        books: books,
        loc_geo: {
            name: "root",
            coord: { x: "120", y: "37" },
            children: loc_geo,
        },
        book_image: book_image_pos,
        time_reasoning: time_reasoning
    };


    let cnt_unk = 0;


    // 对trajs进行处理
    let new_traj = [];
    let construct_data = BookTraj.construct_book_traj(
        jsonCopy(data_).trajs
    ).book_traj;
    for (let book in construct_data) {
        construct_data[book] = BookTraj.time_info_rehandle(
            construct_data[book]
        );

        // console.log(construct_data[book]);
        construct_data[book].forEach((d, i) => {
            let lib_id;
            if (d.library) lib_id = "lib_" + d.library;
            else if (d.agent) lib_id = "agt_" + d.agent;
            else lib_id = "unk_" + cnt_unk++;
            d.lib_id = lib_id;
            if (i > 0) {
                d.fr_lib_id = construct_data[book][i - 1].lib_id;
            }
        });

        // add translation attribute
        for (let event in construct_data[book]) {
            // Location
            if (
                construct_data[book][event].Location in translate_dict.Location
            ) {
                construct_data[book][event]["Location_lang"] =
                    translate_dict.Location[
                        construct_data[book][event].Location
                    ];
            } else if (
                construct_data[book][event].Location in translate_dict.地點
            ) {
                construct_data[book][event]["Location_lang"] =
                    translate_dict.地點[construct_data[book][event].Location];
            } else if (construct_data[book][event].Location === "四川") {
                construct_data[book][event]["Location_lang"] = {
                    zh: "四川",
                    en: "Sichuan",
                    jp: null,
                };
            } else if (construct_data[book][event].Location === "") {
                construct_data[book][event]["Location_lang"] = {
                    zh: "",
                    en: "",
                    jp: "",
                };
            } else {
                construct_data[book][event]["Location_lang"] = {
                    zh: null,
                    en: null,
                    jp: null,
                };
            }

            // agent
            if (
                construct_data[book][event].agent in Translate.agent_trans_name
            ) {
                construct_data[book][event]["agent_lang"] =
                    Translate.agent_trans_name[
                        construct_data[book][event].agent
                    ];
                // if (construct_data[book][event].agent in translate_dict.agent) {
                //     construct_data[book][event]['agent_lang'] = translate_dict.agent[construct_data[book][event].agent]
            } else if (
                construct_data[book][event].agent in
                Translate.library_trans_name
            ) {
                construct_data[book][event]["agent_lang"] =
                    Translate.library_trans_name[
                        construct_data[book][event].agent
                    ];
            } else if (construct_data[book][event].agent === "") {
                construct_data[book][event]["agent_lang"] = {
                    zh: "",
                    en: "",
                    jp: "",
                };
            } else {
                construct_data[book][event]["agent_lang"] = {
                    zh: null,
                    en: null,
                    jp: null,
                };
            }

            // agent_type
            if (
                construct_data[book][event].agent_type in
                translate_dict.人物类型
            ) {
                construct_data[book][event]["agent_type_lang"] =
                    translate_dict.人物类型[
                        construct_data[book][event].agent_type
                    ];
            } else {
                construct_data[book][event]["agent_type_lang"] = {
                    zh: null,
                    en: null,
                    jp: null,
                };
            }

            // book_type
            if (
                construct_data[book][event].book_type[0] in
                translate_dict.书目类型
            ) {
                construct_data[book][event]["book_type_lang"] =
                    translate_dict.书目类型[
                        construct_data[book][event].book_type[0]
                    ];
                // console.log(construct_data[book][event]['book_type_lang'])
            } else {
                construct_data[book][event]["book_type_lang"] = {
                    zh: null,
                    en: null,
                    jp: null,
                };
            }

            // lib_type
            if (
                construct_data[book][event].lib_type in translate_dict.机构类型
            ) {
                construct_data[book][event]["lib_type_lang"] =
                    translate_dict.机构类型[
                        construct_data[book][event].lib_type
                    ];
            } else if (construct_data[book][event].lib_type === "大學") {
                construct_data[book][event]["lib_type_lang"] = {
                    zh: "大學",
                    en: "college",
                    jp: null,
                };
            } else {
                construct_data[book][event]["lib_type_lang"] = {
                    zh: null,
                    en: null,
                    jp: null,
                };
            }

            // library
            if (
                construct_data[book][event].library in
                Translate.library_trans_name
            ) {
                construct_data[book][event]["library_lang"] =
                    Translate.library_trans_name[
                        construct_data[book][event].library
                    ];
                // if (construct_data[book][event].library in translate_dict.library) {
                //     construct_data[book][event]['library_lang'] = translate_dict.library[construct_data[book][event].library]
            } else if (construct_data[book][event].library === "") {
                construct_data[book][event]["library_lang"] = {
                    zh: "",
                    en: "",
                    jp: "",
                };
            } else {
                construct_data[book][event]["library_lang"] = {
                    zh: null,
                    en: null,
                    jp: null,
                };
            }

            // library_ori
            if (
                construct_data[book][event].library_ori in
                translate_dict.library
            ) {
                construct_data[book][event]["library_ori_lang"] =
                    translate_dict.library[
                        construct_data[book][event].library_ori
                    ];
            } else if (construct_data[book][event].library_ori === "") {
                construct_data[book][event]["library_ori_lang"] = {
                    zh: "",
                    en: "",
                    jp: "",
                };
            } else {
                construct_data[book][event]["library_ori_lang"] = {
                    zh: null,
                    en: null,
                    jp: null,
                };
            }

            // location_std
            if (
                construct_data[book][event].location_std in
                translate_dict.location_std
            ) {
                construct_data[book][event]["location_std_lang"] =
                    translate_dict.location_std[
                        construct_data[book][event].location_std
                    ];
            } else if (
                construct_data[book][event].location_std in Translate.locations
            ) {
                construct_data[book][event]["location_std_lang"] =
                    Translate.locations[
                        construct_data[book][event].location_std
                    ];
            } else if (construct_data[book][event].location_std === "") {
                construct_data[book][event]["location_std_lang"] = {
                    zh: "",
                    en: "",
                    jp: "",
                };
            } else if (
                construct_data[book][event].location_std === "日本-京都-东山区"
            ) {
                construct_data[book][event]["location_std_lang"] = {
                    zh: "日本-京都-东山区",
                    en: "Japan-Kyoto-Higashiyama",
                    jp: "",
                };
            } else if (
                construct_data[book][event].location_std ===
                "日本-東京-千代田-神田佐九間町"
            ) {
                construct_data[book][event]["location_std_lang"] = {
                    zh: "日本-東京-千代田-神田佐九間町",
                    en: "Japan-Tokyo-Chiyoda-Kanda-Sakumacho",
                    jp: "",
                };
            } else {
                construct_data[book][event]["location_std_lang"] = {
                    zh: null,
                    en: null,
                    jp: null,
                };
            }

            // 地點
            if (construct_data[book][event].地點 in translate_dict.地點) {
                construct_data[book][event]["地點_lang"] =
                    translate_dict.地點[construct_data[book][event].地點];
            } else if (
                construct_data[book][event].地點 in translate_dict.Location
            ) {
                construct_data[book][event]["地點_lang"] =
                    translate_dict.Location[construct_data[book][event].地點];
            } else if (construct_data[book][event].地點 === "") {
                construct_data[book][event]["地點_lang"] = {
                    zh: "",
                    en: "",
                    jp: "",
                };
            } else {
                construct_data[book][event]["地點_lang"] = {
                    zh: null,
                    en: null,
                    jp: null,
                };
            }

            // 時間
            if (construct_data[book][event].時間 in translate_dict.時間) {
                construct_data[book][event]["時間_lang"] =
                    translate_dict.時間[construct_data[book][event].時間];
            } else if (construct_data[book][event].時間 === "") {
                construct_data[book][event]["時間_lang"] = {
                    zh: "",
                    en: "",
                    jp: "",
                };
            } else {
                construct_data[book][event]["時間_lang"] = {
                    zh: construct_data[book][event]["時間_lang"],
                    en: construct_data[book][event]["時間_lang"],
                    jp: null,
                };
            }

            // 書名
            if (construct_data[book][event].書名 in translate_dict.書名) {
                construct_data[book][event]["書名_lang"] =
                    translate_dict.書名[construct_data[book][event].書名];
            } else {
                construct_data[book][event]["書名_lang"] = {
                    zh: null,
                    en: null,
                    jp: null,
                };
            }

            // 經手方式
            if (
                construct_data[book][event].經手方式 in translate_dict.經手方式
            ) {
                construct_data[book][event]["經手方式_lang"] =
                    translate_dict.經手方式[
                        construct_data[book][event].經手方式
                    ];
            } else if (construct_data[book][event].經手方式 === "") {
                construct_data[book][event]["經手方式_lang"] = {
                    zh: "",
                    en: "",
                    jp: "",
                };
            } else {
                construct_data[book][event]["經手方式_lang"] = {
                    zh: null,
                    en: null,
                    jp: null,
                };
            }
        }
    }

    // 添加流传flag
    construct_data = Data.add_event_state_flag_new(construct_data);
    for (let book in construct_data) {
        for (let j = 0; j < construct_data[book].length; j++) {
            new_traj.push(construct_data[book][j]);
        }
    }

    data_.trajs = new_traj;
    // console.log("data_.trajs", data_.trajs);
}

// 请从此函数获取原始数据
export function read_data() {
    return jsonCopy(data_);
}

export function read_loc_geo() {
    return jsonCopy(data_.loc_geo);
}

export function read_trajs() {
    return jsonCopy(data_.trajs);
}

export function read_books() {
    return jsonCopy(data_.books);
}
export function read_book_image_pos() {
    return jsonCopy(data_.book_image);
}

export function read_time_reasoning() {
    return jsonCopy(data_.time_reasoning)
}
