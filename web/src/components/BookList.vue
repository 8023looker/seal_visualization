<template>
    <div class="container book-info-card"></div>
</template>

<script>
const d3 = require("d3");
const $ = require("jquery");

import { get_book_list, update_book_list } from "@/data/BookInfo";
import constant from "@/constant/book_list_config";
import { type_color } from "@/theme";
import { mapState } from "vuex";
import { year_start, year_end } from "@/constant";

const text_dark = type_color.text_color_dark;
const darker = type_color.book_color_dark;
const dark = type_color.book_color_middle;
// const dark = type_color.book_color_dark;
const light = type_color.book_color_lighter;
const lightest = type_color.book_color_lightest;

const book_type_dict = {
    经部: {
        zh: "经",
        en: "Classics",
    },
    史部: {
        zh: "史",
        en: "Histories",
    },
    子部: {
        zh: "子",
        en: "Masters",
    },
    集部: {
        zh: "集",
        en: "Collections",
    },
};

export default {
    name: "BookList",
    data() {
        return {
            data: [],
            render: false,
        };
    },
    computed: {
        ...mapState(["rem", "filter", "selection", "hover", "language"]),
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
            update_book_list(this.data, constraints);
            this.update_style();
            // console.log(this.selection);
        },
        set_filter(entity, name) {
            const message = {};
            if (entity === "book") {
                message.entity = "book";
                if (this.filter.book && this.filter.book === name)
                    message.value = null;
                else message.value = name;
            }
            this.$store.commit("changeFilter", message);
        },
        set_selection(entity, value) {
            // console.log(entity, value);
            const selected_entity = this.selection.entity;
            const old_value = this.selection.value;
            const message = {};
            if (entity === "edition") {
                message.entity = "editions";
                if (selected_entity !== "editions") {
                    message.value = [value];
                } else if (old_value === null) {
                    message.value = [value];
                }
                // if click selected book, cancel selection
                else if (old_value.includes(value)) {
                    message.value = old_value.filter((d) => d !== value);
                    message.value = message.value.length ? message.value : null;
                } else {
                    message.value = [...old_value, value];
                }
            }
            this.$store.commit("changeSelection", message);
        },
        initialize_style_functions() {
            this.edition_styles = this.initialize_edition_styles();
        },
        update_language() {
            d3.selectAll(".book-type-name").text((d) =>
                book_type_dict[d.name][this.language].slice(0, 3)
            );
        },
        update_style() {
            let self = this;
            self.edition.each(function (d) {
                d3.select(this).call(self.edition_styles[d.state]);
            });

            self.book_type.each((d) => {
                if (self.filter.book != null) {
                    if (self.filter.book === d.name) d.state = "filtered";
                    else d.state = "unfiltered";
                } else if (
                    self.hover.value != null &&
                    self.hover.entity === "book_type"
                ) {
                    if (self.hover.value === d.name) d.state = "hovered";
                    else d.state = "dehighlighted";
                } else d.state = "brushed";
            });
            self.book_type
                .attr("font-weight", (d) =>
                    d.state === "filtered" || d.state === "hovered"
                        ? "bold"
                        : "normal"
                )
                .attr("filter", (d) =>
                    d.state === "filtered" || d.state === "hovered"
                        ? "drop-shadow(2px 2px 1px rgb(0 0 0 / 0.2))"
                        : "none"
                );
        },
        draw_book_list(width, height) {
            const row_size = constant.row_size;
            const line_space = constant.line_space;
            const col_space = constant.col_space;
            const para_space = constant.para_space;
            const len_wid_ratio = constant.len_wid_ratio;

            let cnt_rows = 0,
                cnt_types = this.data.length;
            this.data.forEach((d) => {
                d.row_num = Math.ceil(d.children.length / row_size);
                cnt_rows += d.row_num;
            });

            let max_book_height =
                height / (cnt_rows * line_space + cnt_types * para_space);
            let max_book_width =
                (width - this.left_margin) / (row_size * col_space);

            let book_width = Math.min(
                max_book_width,
                max_book_height * len_wid_ratio
            );
            let book_height = book_width / len_wid_ratio;

            const scale = d3
                .scaleLinear()
                .domain([year_start, year_end])
                .range([0, book_width]);

            cnt_rows = 0;
            this.data.forEach((d, i) => {
                d.top =
                    i * para_space * book_height +
                    cnt_rows * line_space * book_height;
                cnt_rows += d.row_num;
            });

            const book_group = this.svg
                .append("g")
                .selectAll("g")
                .data(this.data)
                .join("g");

            this.book_group = book_group;

            const book = book_group
                .append("g")
                .selectAll("g")
                .data((d) => d.books)
                .join("g")
                .style("cursor", "pointer")
                .on("mouseover", (_, d) => {
                    this.$store.commit("changeHover", {
                        entity: "book",
                        value: d.name,
                    });
                })
                .on("mouseout", () => {
                    this.$store.commit("changeHover", {
                        entity: "book",
                        value: null,
                    });
                })
                .on("click", (_, d) => {
                    this.$store.commit("changeSelection", {
                        entity: "book",
                        value: d.name,
                    });
                });

            const book_bg = book
                .selectAll("g")
                .data((d) =>
                    d.children_idxs.map((c) => ({ type: d.type, idx: c }))
                )
                .join("g");

            this.edition = book_group
                .append("g")
                .selectAll("g")
                .data(
                    (d) =>
                        (d.children = d.children.map((c) => ({
                            ...c,
                            parent: d,
                        })))
                )
                .join("g")
                .attr("id", (d, i) => "edition-" + d.parent.name + "-" + i)
                .style("cursor", "pointer")
                .attr("transform", (d, i) => {
                    let row = Math.floor(i / row_size);
                    let col = i % row_size;
                    let x =
                        this.left_margin +
                        col * col_space * book_width +
                        0.5 * (col_space - 1) * book_width;
                    let y =
                        d.parent.top + (row + 0.5) * line_space * book_height;
                    return `translate(${x}, ${y})`;
                })
                .on("mouseover", (_, d) => {
                    this.$store.commit("changeHover", {
                        entity: "edition",
                        value: d.book_name,
                    });
                })
                .on("mouseout", () => {
                    this.$store.commit("changeHover", {
                        entity: "edition",
                        value: null,
                    });
                })
                .on("click", (e, d) => {
                    this.set_selection("edition", d.book_name);
                });

            this.edition
                .append("rect")
                .attr("width", book_width)
                .attr("height", book_height);

            const important_traj = this.edition
                .append("g")
                .selectAll("line")
                .data((d) => d.important_trajs)
                .join("line")
                .attr("x1", (d) => scale(d.time_info.timestamp))
                .attr("y1", 0)
                .attr("x2", (d) => scale(d.time_info.timestamp))
                .attr("y2", book_height)
                // .attr("stroke", "white")
                .attr("stroke", (d) => type_color.library.bright[d.lib_type])
                // .attr("stroke", (d) => type_color.library[d.lib_type])
                // .attr("stroke-width", 1.5)
                .attr("stroke-width", 2.5)
                .filter((d) => d.state_flag === "block_print")
                .attr("stroke-dasharray", "2, 2");

            this.edition.call(this.edition_styles.normal);

            this.book_type = book_group
                .append("text")
                .classed("book-type-name", true)
                .attr("y", (d) => d.top)
                // .attr("dx", "0.5rem")
                .attr("dx", "1.5rem")
                .attr(
                    "dy",
                    ((para_space + line_space - 1) * book_height) / 2 +
                        this.rem * 1.2
                )
                .attr("font-size", "1em")
                .attr("fill", text_dark)
                .attr("text-anchor", "end")
                .text((d) => book_type_dict[d.name][this.language].slice(0, 3))
                .style("cursor", "pointer")
                .on("mouseover", (_, d) => {
                    this.$store.commit("changeHover", {
                        entity: "book_type",
                        value: d.name,
                    });
                })
                .on("mouseout", () => {
                    this.$store.commit("changeHover", {
                        entity: "book_type",
                        value: null,
                    });
                })
                .on("click", (e, d) => {
                    this.set_filter("book", d.name);
                });

            book_bg.each(function (d) {
                let edition_id = "#edition-" + d.type + "-" + d.idx;
                let transform = d3.select(edition_id).attr("transform");
                d3.select(this)
                    .attr("transform", transform)
                    .append("rect")
                    .attr("x", (book_width * (1 - col_space)) / 2)
                    .attr("y", (book_height * (1 - line_space)) / 2)
                    .attr("width", book_width * col_space)
                    .attr("height", book_height * line_space)
                    .attr("fill", lightest);
            });
        },
        initialize_edition_styles() {
            const normal = (g) => {
                g.select("rect").attr("fill-opacity", 1).attr("fill", darker);
            };

            const brushed = (g) => {
                g.select("rect")
                    .attr("fill", darker)
                    .attr("fill-opacity", 1)
                    .attr("stroke", "none")
                    .attr("filter", "none");
                g.selectAll("line").attr("stroke-opacity", 1);
            };

            const hovered = (g) => {
                g.select("rect")
                    .attr("fill-opacity", 1)
                    .attr("fill", dark)
                    .attr("stroke", "none")
                    .attr(
                        "filter",
                        "drop-shadow(3px 2px 2px rgb(0 0 0 / 0.6))"
                    );
                g.selectAll("line").attr("stroke-opacity", 1);
            };

            const selected = (g) => {
                g.select("rect")
                    .classed("selected", true)
                    .attr("fill", dark)
                    .attr("fill-opacity", 1)
                    .attr(
                        "filter",
                        "drop-shadow(3px 2px 2px rgb(0 0 0 / 0.6))"
                    );
                g.selectAll("line").attr("stroke-opacity", 1);
            };

            const dehighlighted = (g) => {
                g.select("rect")
                    .attr("fill", light)
                    .attr("fill-opacity", 0.5)
                    .attr("stroke", "none")
                    .attr("filter", "none");
                g.selectAll("line").attr("stroke-opacity", 0.5);
            };

            const unfiltered = (g) => {
                g.select("rect")
                    .attr("fill", light)
                    .attr("fill-opacity", 0.3)
                    .attr("stroke", "none")
                    .attr("filter", "none");
                g.selectAll("line").attr("stroke-opacity", 0.3);
            };

            return {
                normal: normal,
                brushed: brushed,
                hovered: hovered,
                selected: selected,
                dehighlighted: dehighlighted,
                unfiltered: unfiltered,
            };
        },
        initialize() {
            this.data = get_book_list();
            // console.log("book_list_data", this.data);

            let width = $(this.$el).width();
            let height = $(this.$el).height();

            console.log(width, height);

            this.left_margin = this.rem * 1.5;

            this.svg = d3
                .select(this.$el)
                .append("svg")
                .attr("width", width)
                .attr("height", height);

            const unselect_layer = this.svg.append("g");
            unselect_layer
                .append("rect")
                .attr("x", this.left_margin)
                .attr("width", width - this.left_margin)
                .attr("height", height)
                .attr("fill-opacity", 0)
                .on("click", () => {
                    this.$store.commit("changeSelection", {
                        entity: "edition",
                        value: null,
                    });
                });
            unselect_layer
                .append("rect")
                .attr("width", this.left_margin)
                .attr("height", height)
                .attr("fill-opacity", 0)
                .on("click", () => {
                    this.$store.commit("changeFilter", {
                        entity: "book",
                        value: null,
                    });
                });

            this.initialize_style_functions();
            this.draw_book_list(width, height);
        },
    },
    mounted() {
        this.initialize();
    },
};
</script>

<style scoped>
.container {
    position: relative;
    margin: 0.5rem 2rem 0.5rem 0.5rem;
    width: calc(100% - 2rem - 0.5rem);
    height: calc(100% - 0.5rem * 2);
}
</style>
