<template>
    <div class="container">
        <div class="scented-legend-container library">
            <div class="title">{{ entity_type[entities[0]][language] }}</div>
            <div class="legends library"></div>
        </div>
        <div class="scented-legend-container agent">
            <div class="title">{{ entity_type[entities[1]][language] }}</div>
            <div class="legends agent"></div>
        </div>
        <!-- <div class="legend-container">
            <div
                v-for="(panel, p_idx) in legends"
                :key="'legend-panel-' + p_idx"
                :class="'legend-panel ' + panel.position"
            >
                <div
                    v-for="(legend, l_idx) in panel.assets"
                    :key="'legend-' + p_idx + '-' + l_idx"
                    class="legend-cell"
                >
                    <div class="legend-icon">
                        <img
                            :src="
                                legend.icon
                                    ? require('../assets/legend/' +
                                          legend.icon +
                                          '.svg')
                                    : require('../assets/legend/agent.svg')
                            "
                            :width="legend.width ? legend.width * rem : rem"
                        />
                    </div>
                    <div class="legend-text">{{ legend.name[language] }}</div>
                </div>
            </div>
        </div> -->
        <div class="legend-container">
            <img :src="require('../assets/legend/legend_new.svg')" />
        </div>
    </div>
</template>

<script>
const d3 = require("d3");
const $ = require("jquery");

import { classification } from "@/constant";
import { type_color } from "@/theme";
import { get_legend_data, update_legend_data } from "@/data/Data";
import { mapState } from "vuex";
import { legends } from "@/constant";

import * as Lang from "@/theme/lang";

const text_dark = type_color.text_color_dark;

const background_opacity = 0.1;
const midground_opacity = 0.2;

const type_name_dict = {
    皇家: {
        zh: "皇家",
        en: "Royal",
    },
    公家: {
        zh: "公家",
        en: "Public",
    },
    大學: {
        zh: "大學",
        en: "College",
    },
    寺廟: {
        zh: "寺廟",
        en: "Temple",
    },
    私人: {
        zh: "私人",
        en: "Private",
    },
    其他: {
        zh: "其他",
        en: "Others",
    },
    皇室: {
        zh: "皇室",
        en: "Royal",
    },
    官員: {
        zh: "官員",
        en: "Official",
    },
    學者: {
        zh: "學者",
        en: "Scholar",
    },
    僧侶: {
        zh: "僧侶",
        en: "Monk",
    },
    商人: {
        zh: "商人",
        en: "Businessmen",
    },
    不详: {
        zh: "不详",
        en: "Unkonwn",
    },
};

export default {
    name: "Legend",
    data() {
        return {
            data: null,
            entities: ["library", "agent"],
            entity_names: {
                library: { zh: "机构" },
                agent: { zh: "人物" },
            },
            icon_r: 0.4,
            legends: legends,
            entity_type: {
                agent: {
                    zh: "人物类型",
                    en: "Agent Type",
                },
                library: {
                    zh: "机构类型",
                    en: "Library Type",
                },
            },
        };
    },
    computed: {
        ...mapState(["rem", "language", "filter", "selection", "hover"]),
        // entity_name_list() {
        //     return this.entities.map((d) => this.entity_names[d].zh);
        // },
    },
    watch: {
        filter: {
            handler: function () {
                this.interaction_handler();
            },
            deep: true,
        },
        selection: {
            handler: function () {
                this.interaction_handler();
            },
            deep: true,
        },
        hover: {
            handler: function () {
                this.interaction_handler();
            },
            deep: true,
        },
        language: {
            handler: function () {
                this.update_language();
            },
        },
    },
    methods: {
        interaction_handler() {
            const constraints = {
                filter: this.filter,
                selection: this.selection,
                hover: this.hover,
            };
            update_legend_data(this.data, constraints);
            this.update_style();
        },
        initialize_style_functions() {
            this.legend_styles = this.initialize_legend_styles();
        },
        update_style() {
            d3.select(this.$el)
                .selectAll(".legend")
                .call(this.legend_styles.normal);
        },
        type_name_list(idx) {
            return classification[this.entities[idx]];
        },
        color(idx, t_idx) {
            let entity = this.entities[idx];
            let type = this.type_name_list(idx)[t_idx];
            return type_color[entity][type];
        },
        click_legend_handler(idx, t_idx) {
            let entity = this.entities[idx];
            let type = this.type_name_list(idx)[t_idx];
            this.$store.commit("changeFilter", { entity, type });
        },
        hover_legend_handler(idx, t_idx) {
            let entity = this.entities[idx];
            let type = t_idx === null ? null : this.type_name_list(idx)[t_idx];
            this.$store.commit("changeHover", {
                entity: entity + "_type",
                type,
            });
        },
        set_filter(entity, name) {
            const msg = { entity: entity, value: name };
            if (this.filter[entity] && this.filter[entity] === name)
                msg.value = null;
            else msg.value = name;
            this.$store.commit("changeFilter", msg);
        },
        update_language() {
            d3.selectAll(".type-name-text").text((d) =>
                type_name_dict[d.name][this.language].slice(0, 3)
            );
        },
        draw_lib_agt(svg, data, width, height, scale) {
            const line_space = 1.5;
            const line_height = height / data.length;
            const rect_height = line_height / line_space;
            const rect_width = scale.range()[1] - scale(0);

            const left_range = scale.range()[0];
            const right_range = scale.range()[1];

            svg.append("g")
                .append("rect")
                .attr("width", width)
                .attr("height", height)
                .attr("fill-opacity", 0)
                .on("click", () => {
                    this.$store.commit("changeFilter", {
                        entity: data[0].entity,
                        value: null,
                    });
                });

            const type = svg
                .append("g")
                .selectAll("g")
                .data(data)
                .join("g")
                .classed("legend", true)
                .style("cursor", "pointer");

            const type_bar = type
                .append("g")
                .attr(
                    "transform",
                    (d, i) =>
                        `translate(${scale(0)}, ${
                            line_height * i + (line_height - rect_height) / 2
                        })`
                );

            this.clip_path = get_clip_path(rect_width, rect_height);

            type_bar
                .append("rect")
                .classed("background", true)
                .attr("width", (d) => scale(d.num) - scale(0))
                .attr("height", rect_height)
                .style("clip-path", this.clip_path)
                .attr("fill", (d) => type_color[d.entity][d.name])
                .attr("fill-opacity", background_opacity);

            type_bar
                .append("rect")
                .classed("midground", true)
                .attr("width", (d) => scale(d.num) - scale(0))
                .attr("height", rect_height)
                .style("clip-path", get_clip_path(rect_width, rect_height))
                .attr("fill", (d) => type_color[d.entity][d.name])
                .attr("fill-opacity", midground_opacity);

            type_bar
                .append("rect")
                .classed("foreground", true)
                .attr("width", (d) => scale(d.num) - scale(0))
                .attr("height", rect_height)
                .style("clip-path", this.clip_path)
                .attr("fill", (d) => type_color[d.entity][d.name]);

            type.append("text")
                .classed("type-name-text", true)
                .attr("x", scale(0) - this.rem * 0.5)
                .attr("y", (d, i) => line_height * (i + 0.5))
                .attr("text-anchor", "end")
                .attr("dominant-baseline", "middle")
                .attr("font-size", "0.8rem")
                .attr("fill", text_dark)
                .text((d) => type_name_dict[d.name][this.language].slice(0, 3));
            // .text((d) => d.name);

            type.append("text")
                .classed("value", true)
                .attr("x", right_range + this.rem * 0.5)
                .attr("y", (d, i) => line_height * (i + 0.5))
                .attr("text-anchor", "start")
                .attr("dominant-baseline", "middle")
                .attr("font-size", "0.8rem")
                .attr("fill", text_dark)
                .text((d) => d.num);

            type.on("click", (_, d) => {
                this.set_filter(d.entity, d.name);
            })
                .on("mouseenter", (_, d) => {
                    this.$store.commit("changeHover", {
                        entity: d.entity + "_type",
                        value: d.name,
                    });
                })
                .on("mouseleave", (_, d) => {
                    this.$store.commit("changeHover", {
                        entity: d.entity + "_type",
                        value: null,
                    });
                });
        },
        initialize_legend_styles() {
            const normal = (g) => {
                g.each((d) => {
                    d.highlighted =
                        (this.filter[d.entity] === d.name &&
                            !(
                                d.entity + "_type" === this.hover.entity &&
                                this.hover.value != null
                            )) ||
                        (d.entity + "_type" === this.hover.entity &&
                            this.hover.value === d.name);
                });

                g.select(".background")
                    .attr("width", (d) => this.scale(d.num) - this.scale(0))
                    .style("clip-path", (d) =>
                        d.num > this.val_bound ? this.clip_path : "none"
                    );
                g.select(".midground")
                    .attr("width", (d) => this.scale(d.mid_num) - this.scale(0))
                    .style("clip-path", (d) =>
                        d.mid_num > this.val_bound ? this.clip_path : "none"
                    );
                g.select(".foreground")
                    .attr(
                        "width",
                        (d) => this.scale(d.fore_num) - this.scale(0)
                    )
                    .attr("fill", (d) =>
                        d.highlighted
                            ? type_color[d.entity].bright[d.name]
                            : type_color[d.entity][d.name]
                    )
                    .attr("filter", (d) =>
                        d.highlighted
                            ? "drop-shadow(3px 2px 2px rgb(0 0 0 / 0.6))"
                            : "none"
                    )
                    .attr("stroke-width", 2.5)
                    .attr("stroke", (d) => (d.highlighted ? "white" : "none"))
                    .style("clip-path", (d) =>
                        d.fore_num > this.val_bound ? this.clip_path : "none"
                    );
                g.select(".value").text((d) => d.fore_num);

                g.selectAll("text")
                    .attr("font-weight", (d) =>
                        d.highlighted ? "bold" : "normal"
                    )
                    .attr("filter", (d) =>
                        d.highlighted
                            ? "drop-shadow(2px 2px 1px rgb(0 0 0 / 0.2))"
                            : "none"
                    );
            };
            return {
                normal: normal,
            };
        },
        draw_legend(svg, width, height) {
            // console.log(width, height);
        },
        initialize() {
            this.data = get_legend_data();

            let svg_width = $(".legends").width();
            let svg_height = $(".legends").height();

            const legend_container = d3.selectAll(".legends");
            const svg = legend_container
                .append("svg")
                .attr("width", svg_width)
                .attr("height", svg_height);

            const lib_g = d3
                .select(this.$el)
                .select(".legends.library")
                .select("svg");
            const agt_g = d3
                .select(this.$el)
                .select(".legends.agent")
                .select("svg");

            // const legend_svg_width = $(".legend-container").width();
            // const legend_svg_height = $(".legend-container").height();
            // const legend_g = d3
            //     .select(".legend-container")
            //     .append("svg")
            //     .attr("width", legend_svg_width)
            //     .attr("height", legend_svg_height);

            const left_margin = this.rem * 2;
            const right_margin = this.rem * 2;

            let value_list = this.data.library
                .map((d) => d.num)
                .concat(this.data.agent.map((d) => d.num))
                .sort((a, b) => b - a);
            let val_max = value_list[0];
            let val_sec_max = value_list[1];

            let range_max = val_max * 0.2 + val_sec_max * 0.8;
            this.val_bound = range_max;

            const scale = d3
                .scaleLinear()
                .domain([0, range_max])
                .range([left_margin, svg_width - right_margin]);

            this.draw_lib_agt(
                lib_g,
                this.data.library,
                svg_width,
                svg_height,
                scale
            );
            this.draw_lib_agt(
                agt_g,
                this.data.agent,
                svg_width,
                svg_height,
                scale
            );
            // this.draw_legend(legend_g, legend_svg_width, legend_svg_height);

            this.scale = scale;
            this.initialize_style_functions();
        },
    },
    mounted() {
        this.initialize();
    },
};

function get_clip_path(rect_width, rect_height) {
    const w = rect_width,
        h = rect_height;
    const num = 4,
        r = h / num,
        mr = r * 3;
    const d =
        "M 0, 0 L " +
        (w - mr) +
        ", 0 L " +
        (w - mr - r) +
        ", " +
        r +
        " L " +
        (w - mr) +
        ", " +
        r * 2 +
        " L " +
        (w - mr - r) +
        ", " +
        r * 3 +
        " L " +
        (w - mr) +
        ", " +
        h +
        " L " +
        (w - mr + r) +
        ", " +
        h +
        " L " +
        (w - mr) +
        ", " +
        (h - r) +
        " L " +
        (w - mr + r) +
        ", " +
        (h - r * 2) +
        " L " +
        (w - mr) +
        ", " +
        (h - r * 3) +
        " L " +
        (w - mr + r) +
        ", " +
        0 +
        " L " +
        w +
        ", 0 L " +
        w +
        ", " +
        h +
        " L 0, " +
        h +
        " Z";
    return `path("${d}")`;
}
</script>

<style scoped lang="scss">
.container {
    position: relative;
    margin: 1rem 2rem 1rem 1rem;
    width: calc(100% - 1rem - 2rem);
    height: calc(100% - 1rem * 2);

    color: #5a3a20;

    $legend-height: 10vh;

    // $scented-height: 35%;
    // $scented-height: 40%;
    $scented-height: calc((100% - $legend-height) / 2);

    // font-family: cochin, Avenir, Helvetica, Arial, sans-serif;

    .scented-legend-container {
        height: $scented-height;
        display: flex;
        flex-direction: column;

        .title {
            flex-grow: 0;
            margin-bottom: 0.8rem;
            text-align: left;
        }

        .legends {
            flex-grow: 1;
            margin-bottom: 1rem;
        }
    }

    .legend-container {
        height: calc(100% - $scented-height * 2);
        width: 100%;

        display: flex;
        // flex-direction: row;
        // justify-content: space-between;
        flex-direction: column; /* 设置主轴方向为垂直 */
        justify-content: flex-end; /* 将内容在垂直方向上底部对齐 */

        .legend-panel {
            width: 25%;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
        }

        .legend-cell {
            display: flex;
            flex-direction: column;

            .legend-icon {
                display: flex;
                justify-content: center;
                align-items: center;
                height: 1.2rem;
            }

            .legend-text {
                font-size: 0.6rem;
            }
        }

        .legend-panel.middle {
            width: 58%;

            //     .legend-cell {
            //         display: flex;
            //         flex-direction: row;
            //     }
        }

        .legend-panel.right {
            .legend-icon {
                height: 1.8rem;
            }
        }
    }
}
</style>
