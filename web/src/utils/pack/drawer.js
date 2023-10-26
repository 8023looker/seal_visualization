const d3 = require("d3");

import { Point } from "@/data/geo/geometry";
import { color, type_color } from "@/theme";
import { trans_graph } from "@/data/hier_graph/transform";
import { Simulation } from "./simulation";
// import { ForceEdgeBundling } from "@/data/geo/composable/forceBundle";
import { ForceEdgeBundling } from "../bundle/forceBundle";
import { edge_bundle } from "../bundle";
import * as Lang from "@/theme/lang";

const background_opacity = 0.04;
const midground_opacity = 0.02;

const edge_background_opacity = 0.01;

// const simulation_debug = true;
const simulation_debug = false;
// const bundle_debug = true;
const bundle_debug = false;
const force_bundle_debug = false;

export class GraphDrawer {
    constructor(svg, data, component) {
        this.svg = svg;
        this.data = data;
        this.component = component;
        this.nodes = data.nodes.slice(1);

        this.edges = data.edges.filter(
            (d) => d.source.node_idx != d.target.node_idx
        );

        this.width = this.svg.attr("width");
        this.height = this.svg.attr("height") * 0.95;

        this.lang = this.component.language;
        this.rem = this.component.rem;

        this.add_defs();
        this.build_layers();
        this.initialize_style_functions();
    }

    build_layers() {
        this.unselect_layer = this.svg.append("g");

        const container = this.svg.append("g").classed("graph-layer", true);
        this.edge_layer = container
            .append("g")
            .classed("graph-edge-layer", true);
        this.node_layer = container
            .append("g")
            .classed("graph-node-layer", true);

        const trans_container = this.svg.append("g");
        this.trans_edge_layer = trans_container.append("g");
        this.trans_node_layer = trans_container.append("g");

        this.info_card_layer = d3.select("#graph-book-info-card");
    }

    initialize_style_functions() {
        this.lib_node_styles = this.initialize_lib_node_styles();
        this.loc_node_styles = this.initialize_loc_node_styles();
        this.edge_styles = this.initialize_edge_styles();
    }

    draw() {
        this.unselect_layer
            .append("rect")
            .attr("width", this.width)
            .attr("height", this.height)
            .attr("fill-opacity", 0)
            .on("click", () => {
                this.component.$store.commit("changeSelection", {
                    entity: "library_id",
                    value: null,
                });
            });

        this.draw_nodes();

        if (simulation_debug) this.init_simulation();
        else if (bundle_debug) this.draw_bundle_edges();
        else if (force_bundle_debug) this.draw_force_bundle_edges();
        else this.draw_edges();
    }

    update() {
        this.cnt_nodes = this.nodes.filter((d) => d.fore_size > 0).length;
        this.update_nodes();
        this.update_edges();
    }

    trans_init() {
        // this.node_layer.selectAll(".graph-node").attr("opacity", 1);
        // this.edge_layer.selectAll(".graph-edge").attr("opacity", 1);
    }

    trans_fade_in(duration) {
        this.node_layer
            .attr("opacity", 0)
            .transition()
            .duration(duration)
            .attr("opacity", 1);
        this.edge_layer
            .attr("opacity", 0)
            .transition()
            .duration(duration)
            .attr("opacity", 1);
        this.info_card_layer
            .style("opacity", 0)
            .transition()
            .duration(duration)
            .style("opacity", 1);
    }

    trans_start(constraints, dst_view, trans_data, duration = 4000) {
        if (dst_view === "geomap") {
            this.trans_to_geo(constraints, trans_data, duration);
        } else if (dst_view === "timeline") {
            this.trans_to_timeline(constraints, trans_data, duration);
        }
    }

    trans_end(duration) {
        this.trans_edge_layer
            .attr("opacity", 1)
            .transition()
            .duration(duration)
            .attr("opacity", 0);

        this.trans_node_layer
            .attr("opacity", 1)
            .transition()
            .duration(duration)
            .attr("opacity", 0);

        setTimeout(() => {
            this.trans_node_layer.selectAll("g").remove();
            this.trans_edge_layer.selectAll("g").remove();
        }, duration);
        console.log("transition ended");
    }

    trans_to_timeline(constraints, trans_data, duration) {
        const trans_nodes = trans_data.nodes;
        const trans_edges = trans_data.edges;

        // console.log("trans nodes");
        // console.log(trans_nodes);

        const fade_duration = 1000;
        const spread_duration = 2000;
        const move_duration = duration - fade_duration - spread_duration;

        // this.trans_edge_layer.selectAll("g").remove();
        // this.trans_edge_layer.selectAll("g").remove();

        this.trans_node_layer.attr("opacity", 0);
        this.trans_edge_layer.attr("opacity", 0);

        const node = this.trans_node_layer
            .append("g")
            .selectAll("g")
            .data(trans_nodes)
            .join("g")
            .attr(
                "transform",
                (d) =>
                    `translate(${d.x + d.start_node_state.x}, ${
                        d.y + d.start_node_state.y
                    })`
            );

        const edge = this.trans_edge_layer
            .append("g")
            .selectAll("g")
            .data(trans_edges)
            .join("g");

        node.append("circle")
            .attr("r", (d) => d.node_state.r)
            .attr("fill", (d) => type_color.library[d.lib_type])
            .attr("fill-opacity", (d) => {
                if (d.state === "unfiltered") return background_opacity;
                else if (d.state === "dehighlighted")
                    return background_opacity + midground_opacity;
                return 1;
            });

        edge.append("path")
            .classed("curve", true)
            .attr("fill", "none")
            .attr("stroke-width", (d) => d.edge_state.stroke_width)
            .attr("stroke", "url(#ArrowPathGradient)")
            .attr("d", (d) => calcD(d.source, d.target))
            .attr("opacity", 1);

        // original layer fade out
        this.node_layer
            .attr("opacity", 1)
            .transition()
            .duration(fade_duration)
            .attr("opacity", 0);
        this.edge_layer
            .attr("opacity", 1)
            .transition()
            .duration(fade_duration)
            .attr("opacity", 0);
        this.info_card_layer
            .style("opacity", 1)
            .transition()
            .duration(fade_duration)
            .style("opacity", 0);
        // transition layer fade in
        this.trans_node_layer
            .attr("opacity", 0)
            .transition()
            .duration(fade_duration)
            .attr("opacity", 1);
        this.trans_edge_layer
            .attr("opacity", 0)
            .transition()
            .duration(fade_duration)
            .attr("opacity", 1);

        // rescale
        const y_min = trans_data.y_min;
        const y_max = trans_data.y_max;
        const y_scale = d3
            .scaleLinear()
            .domain([y_min, y_max])
            .range([(this.height * 0.05) / 0.95, this.height]);

        // full screen
        setTimeout(() => {
            node.transition()
                .duration(move_duration)
                .attr(
                    "transform",
                    (d) =>
                        `translate(${d.node_state.x}, ${y_scale(
                            d.node_state.y
                        )})`
                );
            node.select("circle")
                .transition()
                .duration(move_duration)
                .attr("fill", (d) => d.node_state.fill)
                .attr("r", (d) => d.node_state.r);

            edge.select(".curve")
                .transition()
                .duration(move_duration)
                .attr("stroke-width", (d) => d.edge_state.stroke_width)
                .attr("d", (d) => {
                    const fr = d.edge_state.source;
                    const to = d.edge_state.target;
                    return `M${fr.x},${y_scale(fr.y)} q 0,0 ${to.x - fr.x}, ${
                        y_scale(to.y) - y_scale(fr.y)
                    }`;
                });
        }, fade_duration);

        // spread
        setTimeout(() => {
            node.transition()
                .duration(spread_duration)
                .attr(
                    "transform",
                    (d) => `translate(${d.node_state.x}, ${d.node_state.y})`
                );
            edge.select(".curve")
                .transition()
                .duration(spread_duration)
                .attr("d", (d) => {
                    const fr = d.edge_state.source;
                    const to = d.edge_state.target;
                    return `M${fr.x},${fr.y} q 0,0 ${to.x - fr.x}, ${
                        to.y - fr.y
                    }`;
                });
        }, fade_duration + move_duration);
    }

    trans_to_geo(constraints, trans_data, duration) {
        const trans_nodes = trans_data.nodes;
        const trans_edges = trans_data.edges;

        const fade_duration = 1000;
        const move_duration = duration - fade_duration;

        // console.log("transition nodes");
        // console.log(trans_nodes);
        // console.log("transition edges");
        // console.log(trans_edges);

        // this.trans_node_layer.selectAll("g").remove();
        // this.trans_edge_layer.selectAll("g").remove();

        this.trans_node_layer.attr("opacity", 0);
        this.trans_edge_layer.attr("opacity", 0);

        const node = this.trans_node_layer
            .append("g")
            .selectAll("g")
            .data(trans_nodes)
            .join("g")
            .attr("transform", (d) => `translate(${d.x}, ${d.y})`);

        const edge = this.trans_edge_layer
            .append("g")
            .selectAll("g")
            .data(trans_edges)
            .join("g");

        node.append("circle")
            .attr("r", (d) =>
                d.fore_size != null
                    ? Math.sqrt(d.fore_size / d.size) * d.br
                    : d.br
            )
            .attr("fill", (d) => type_color.library[d.lib_type])
            .attr("fill-opacity", 1);
        // node.append("text").text((d) => d.name);
        // node.call(this.lib_node_styles.normal);

        // trans_nodes.forEach((d) => {
        //     d3.select(`#node-${d.node_idx}`).attr("opacity", 0);
        // });
        // trans_edges.forEach((d) => {
        //     d3.select(`#edge-${d.edge_idx}`).attr("opacity", 0);
        // });

        edge.append("path")
            .classed("curve", true)
            .attr("fill", "none")
            .attr("stroke-width", (d) =>
                d.fore_weight != null
                    ? (d.fore_weight / d.weight) * d.stroke_width
                    : d.stroke_width
            )
            .attr("stroke", "url(#ArrowPathGradient)")
            .attr("d", (d) => calcD(d.source, d.target))
            // .attr("transform", (d) => d.transform)
            .attr("opacity", 1);
        // edge.call(this.edge_styles.normal);
        // edge.append("path").classed('arrow', true)
        //     .attr("d", (d) => get_seg_line(d.seg_beg, d.seg_end))
        //     .attr("stroke-width", (d) =>
        //         d.stroke_width < 10 ? d.stroke_width : Math.sqrt(d.stroke_width)
        //     )
        //     .attr("marker-end", "url(#ArrowPathArrowHead)");

        this.node_layer
            .attr("opacity", 1)
            .transition()
            .duration(fade_duration)
            .attr("opacity", 0);
        this.edge_layer
            .attr("opacity", 1)
            .transition()
            .duration(fade_duration)
            .attr("opacity", 0);
        this.trans_node_layer
            .transition()
            .duration(fade_duration)
            .attr("opacity", 1);
        this.trans_edge_layer
            .transition()
            .duration(fade_duration)
            .attr("opacity", 1);

        setTimeout(() => {
            node.transition()
                .duration(move_duration)
                .attr(
                    "transform",
                    (d) => `translate(${d.node_state.x}, ${d.node_state.y})`
                );
            node.select("circle")
                .transition()
                .duration(move_duration)
                // .attr('fill-opacity', 0)
                .attr("fill", (d) => d.node_state.fill)
                .attr("fill-opacity", 0.05)
                .attr("r", (d) => d.node_state.r);

            edge.select(".curve")
                .transition()
                .duration(move_duration)
                // .attr("transform", "rotate(0)")
                .attr("stroke-width", 1)
                .attr("d", (d) => {
                    const fr = d.edge_state.source;
                    const to = d.edge_state.target;
                    return `M${fr.x},${fr.y} q 0,0 ${to.x - fr.x}, ${
                        to.y - fr.y
                    }`;
                });
        }, fade_duration);

        // edge.select(".curve").attr("d", (d) => d.edge_state.d);
    }

    update_nodes() {
        // let self = this;
        // self.lib_node.each(function (d) {
        //     d3.select(this).call(self.lib_node_styles[d.state]);
        // });
        this.lib_node.call(this.lib_node_styles.brushed);
        this.loc_node.call(this.loc_node_styles.brushed);
    }

    update_edges() {
        // let self = this;
        // self.edge.each(function (d) {
        //     d3.select(this).call(self.edge_styles[d.state]);
        // });

        this.edge.call(this.edge_styles.brushed);
    }

    update_language_styles(lang) {
        // if (lang === "en") {
        //     this.lib_node
        //         .attr("y", (d, i) => (i - d.span_line_num / 2) * (this.rem / 2))
        //         .attr("dy", (d, i) => this.rem / 2);
        // }
    }

    update_language(lang) {
        // console.log(lang);

        // const max_width = 20;

        this.lib_node.select("text").selectAll("tspan").remove();
        this.loc_node.select("text").selectAll("tspan").remove();

        if (lang === "zh") {
            this.lib_node
                .select("text")
                .attr("font-size", "0.5rem")
                .append("tspan")
                .text((d) => {
                    if (d.name_type === "lib") return d.lib_name_lang[lang];
                    else if (d.name_type === "agt")
                        return d.lib_name_lang[lang];
                    else return "不详";
                });
            this.loc_node
                .select("text")
                .attr("font-size", (d) => (d.level === 0 ? "0.8rem" : "0.6rem"))
                .append("tspan")
                .text((d) => Lang.locations[d.name][lang]);
        } else if (lang === "en") {
            this.lib_node
                .select("text")
                .attr("font-size", "0.5rem")
                .selectAll("tspan")
                .data((d) => {
                    // console.log(d.br);

                    let max_chars = Math.floor(
                        ((d.br || d.r) * 2) / (0.5 * this.rem)
                    );

                    let max_width = Math.max(
                        Math.floor(((d.br || d.r) * 2 * 2) / (0.5 * this.rem)),
                        12
                    );

                    let text = d.lib_name_lang[lang];
                    if (d.name_type === "unk") text = "unknown";
                    text = text.split(" ");

                    const total_len = text
                        .map((t) => t.length)
                        .reduce((a, b) => a + b, 0);

                    // console.log((d.br || d.r) * 2, this.rem, max_width);

                    let spans = [];
                    let cur_span = "";
                    text.forEach((t) => {
                        if (cur_span.length + t.length > max_width) {
                            spans.push(cur_span);
                            cur_span = t;
                        } else {
                            cur_span += " " + t;
                        }
                    });
                    spans.push(cur_span);
                    spans = spans.map((s) => {
                        return { text: s, span_line_num: spans.length };
                    });

                    d.name_spans = {
                        simp: [
                            {
                                text: text.map((t) => t[0]).join(""),
                                span_line_num: 1,
                            },
                        ],
                        full: spans,
                    };
                    d.show_full_name = true;

                    if (
                        (d.br || d.r) * 2 < this.rem ||
                        total_len > max_chars * 6
                    ) {
                        d.show_full_name = false;
                        return d.name_spans.simp;
                    }

                    return spans;
                })
                .join("tspan")
                .attr("x", 0)
                .attr("y", (d, i) => (i - d.span_line_num / 2) * (this.rem / 2))
                .attr("dy", (d, i) => this.rem / 2)
                .text((d) => d.text);
            this.loc_node
                .select("text")
                // .attr("font-size", (d) => (d.level === 0 ? "0.9rem" : "0.7rem"))
                .attr("font-size", (d) => (d.level === 0 ? "0.8rem" : "0.6rem"))
                .append("tspan")
                .text((d) => Lang.locations[d.name][lang]);
        }
    }

    draw_nodes() {
        const node = this.node_layer
            .selectAll("g")
            .data(this.nodes)
            .join("g")
            .attr("class", "graph-node")
            .attr("id", (d) => `node-${d.node_idx}`)
            .attr("transform", (d) => `translate(${d.x}, ${d.y})`);

        // background part
        node.append("circle")
            .classed("background", true)
            .attr("r", (d) => d.br);

        node.append("circle")
            .classed("midground", true)
            .attr("r", (d) => d.br);

        // foreground part
        node.append("circle")
            .classed("foreground", true)
            .attr("r", (d) => d.br);

        this.loc_node = node.filter((d) => !d.is_leaf());
        this.lib_node = node.filter((d) => d.is_leaf());

        this.lib_node
            // .filter((d) => d.name_type === "lib")
            .append("text");
        // .text((d) => {
        //     console.log(d.lib_name_lang);
        //     console.log(this.lang);
        // })
        // .text((d) => d.lib_name_lang[this.lang]);
        // .text((d) => {
        //     if (d.name_type === "lib") return d.lib_name_lang[this.lang];
        //     else if (d.name_type === "agt")
        //         return d.lib_name_lang[this.lang];
        //     else return "不详";
        // });

        // this.lib_node
        //     .filter((d) => d.name_type === "agt")
        //     .append("text")
        //     .text((d) => d.name);

        this.loc_node
            // .filter((d) => d.level <= 1)
            .append("text")
            .attr("text-anchor", "middle")
            .attr("dy", (d) =>
                d.level === 0
                    ? d.br + this.component.rem * 1
                    : d.br + this.component.rem * 0.5
            )
            // .each((d) => {
            //     console.log(d);
            // })
            .attr("dx", (d) => (d.x < this.rem ? this.rem : 0))
            // .attr("font-size", (d) => (d.level === 0 ? "0.8rem" : "0.6rem"))
            .attr("font-weight", "bold")
            .attr("fill-opacity", (d) => (d.level <= 1 ? 1 : 0));
        // .each(d => {
        //     console.log(d)
        // })
        // .text((d) => Lang.locations[d.name][this.lang]);
        // .text((d) => d.name);

        this.update_language(this.lang);

        this.loc_node.call(this.loc_node_styles.normal);
        this.lib_node.call(this.lib_node_styles.normal);

        this.loc_node
            .style("cursor", "pointer")
            .on("mouseover", (_, d) => {
                // console.log(d);
                this.component.set_interaction("hover", "locations", d);
            })
            .on("mouseleave", () => {
                this.component.set_interaction("hover", "locations", null);
            })
            .on("click", (_, d) => {
                this.component.set_interaction("click", "locations", d);
            });

        this.lib_node
            .style("cursor", "pointer")
            .on("mouseover", (_, d) => {
                this.component.set_interaction("hover", "library_id", d.lib_id);
            })
            .on("mouseleave", () => {
                this.component.set_interaction("hover", "library_id", null);
            })
            .on("click", (_, d) => {
                this.component.set_interaction("click", "library_id", d.lib_id);
            });
    }

    draw_bundle_edges() {
        const bundle_edges = edge_bundle(this.data);
        this.edge = this.edge_layer
            .selectAll("g")
            .data(bundle_edges)
            // .data(new_edges)
            .join("g")
            .classed("graph-edge", true)
            .attr("id", (d) => `edge-${d.edge_idx}`);

        bundle_edges.forEach((d, i) => {
            d.stroke_width = edge_width(d);
        });

        this.edge
            .append("path")
            .classed("background", true)
            .classed("curve", true);
        this.edge
            .append("path")
            .classed("midground", true)
            .classed("curve", true);
        this.edge
            .append("path")
            .classed("foreground", true)
            .classed("curve", true);
        this.edge.append("path").classed("arrow", true);

        this.edge
            .selectAll("path")
            .filter(".curve")
            .attr("fill", "none")
            // .attr("stroke-width", (d) => d.stroke_width)
            .attr("stroke", "url(#ArrowPathGradient)")
            .attr("d", (d) => d.bundle_path)
            // .attr("transform", (d) => d.transform)
            .attr("opacity", 1);
        this.edge.select(".background").attr("opacity", 0.1);
        this.edge.select(".midground").attr("opacity", 0.1);
        // this.edge.select(".arrow").attr("d", 0);
    }

    draw_force_bundle_edges() {
        const nodes = this.nodes;
        // const edges = [];

        // console.log(nodes);

        // let new_edges = [];

        // this.edges.forEach((d, i) => {
        //     d.trajs.forEach(() => {
        //         new_edges.push(d);
        //         edges.push({
        //             source: d.source.node_idx,
        //             target: d.target.node_idx,
        //         });
        //     });
        // });
        const edges = this.edges
            .map((d, i) => {
                return {
                    edge_idx: i,
                    source: d.source.node_idx - 1,
                    target: d.target.node_idx - 1,
                };
            })
            .filter((d) => d.source !== d.target);
        // console.log(edges);
        // this.edges.forEach((d, i) => {
        //     d.bundle_segs =
        // })
        const fbundling = ForceEdgeBundling()
            .step_size(0.6)
            .compatibility_threshold(0.5)
            .nodes(nodes)
            .edges(edges);
        const bundlingResults = fbundling();
        const buldingLineDrawer = d3
            .line()
            .x((d) => d.x)
            .y((d) => d.y)
            .curve(d3.curveCatmullRom);
        // const bundle_edges = edge_bundle(this.data);

        edges.forEach((d, i) => {
            d.force_bundle_path = buldingLineDrawer(bundlingResults[i]);
            d.stroke_width = edge_width(d);
        });

        this.edge = this.edge_layer
            .selectAll("g")
            .data(edges)
            // .data(new_edges)
            .join("g")
            .classed("graph-edge", true)
            .attr("id", (d) => `edge-${d.edge_idx}`);

        this.edge
            .append("path")
            .classed("background", true)
            .classed("curve", true);
        this.edge
            .append("path")
            .classed("midground", true)
            .classed("curve", true);
        this.edge
            .append("path")
            .classed("foreground", true)
            .classed("curve", true);
        this.edge.append("path").classed("arrow", true);

        this.edge
            .selectAll("path")
            .filter(".curve")
            .attr("fill", "none")
            // .attr("stroke-width", (d) => d.stroke_width)
            .attr("stroke", "url(#ArrowPathGradient)")
            .attr("d", (d, i) => d.force_bundle_path)
            // .attr("transform", (d) => d.transform)
            .attr("opacity", 1);
        this.edge.select(".background").attr("opacity", 0.1);
        this.edge.select(".midground").attr("opacity", 0.1);
        // this.edge.select(".arrow").attr("d", 0);
    }

    draw_edges() {
        // const nodes = this.nodes;
        // const edges = [];

        // let new_edges = [];

        // this.edges.forEach((d, i) => {
        //     d.trajs.forEach(() => {
        //         new_edges.push(d);
        //         edges.push({
        //             source: d.source.node_idx,
        //             target: d.target.node_idx,
        //         });
        //     });
        // });
        // const edges = this.edges.map((d, i) => {
        //     return {
        //         edge_idx: i,
        //         source: d.source.node_idx,
        //         target: d.target.node_idx,
        //     };
        // });
        // .filter((d) => d.source !== d.target);
        // console.log(edges);
        // this.edges.forEach((d, i) => {
        //     d.bundle_segs =
        // })
        // const fbundling = ForceEdgeBundling()
        //     .step_size(0.6)
        //     .compatibility_threshold(0.5)
        //     .nodes(nodes)
        //     .edges(edges);
        // const bundlingResults = fbundling();
        // const buldingLineDrawer = d3
        //     .line()
        //     .x((d) => d.x)
        //     .y((d) => d.y)
        //     .curve(d3.curveCatmullRom);
        // const buldingLineDrawer = d3
        //     .radialLine()
        //     .curve(d3.curveBundle.beta(0.85))
        //     .radius(function (d) {
        //         return d.y;
        //     })
        //     .angle(function (d) {
        //         return (d.x / 180) * Math.PI;
        //     });
        // console.log(bundlingResults);

        this.edges.forEach((d, i) => {
            d.stroke_width = edge_width(d);
            // d.path = get_edge_arc(d.source, d.target);
            const fr = d.source;
            const [to, rotateStr] = calcAng(fr, d.target);
            d.path = calcD(fr, to);

            // const rotateStr = "";
            // d.path = calcD(fr, d.target);

            // d.path = buldingLineDrawer(bundlingResults[i]);
            d.transform = rotateStr;
        });

        this.edge = this.edge_layer
            .selectAll("g")
            .data(this.edges)
            // .data(new_edges)
            .join("g")
            .classed("graph-edge", true)
            .attr("id", (d) => `edge-${d.edge_idx}`);

        this.edge
            .append("path")
            .classed("background", true)
            .classed("curve", true);
        this.edge
            .append("path")
            .classed("midground", true)
            .classed("curve", true);
        this.edge
            .append("path")
            .classed("foreground", true)
            .classed("curve", true);
        this.edge.append("path").classed("arrow", true);

        this.edge.call(this.edge_styles.normal);

        this.edge.select(".curve").each(function (d) {
            const head_offset = d.target.br * 0.95;
            const len = this.getTotalLength() - head_offset;
            if (!isFinite(len)) return;
            d.seg_beg = this.getPointAtLength(len - 1e-3);
            d.seg_end = this.getPointAtLength(len);
        });
        this.edge
            .select(".arrow")
            .attr("d", (d) => get_seg_line(d.seg_beg, d.seg_end))
            .attr("stroke-width", (d) =>
                d.stroke_width < 10 ? d.stroke_width : Math.sqrt(d.stroke_width)
            )
            .attr("transform", (d) => d.transform)
            .attr("marker-end", "url(#ArrowPathArrowHead)");
    }

    init_simulation() {
        console.log("initialize simulation");
        this.simulation = new Simulation(this.data);
        this.simulation.set_canvas(this.width, this.height);
        this.simulation.on("tick", this.tick.bind(this));

        setTimeout(() => {
            this.simulation.stop();
            this.draw_edges();
        }, 30000);
    }

    tick() {
        let render = () => {
            this.loc_node.attr("transform", (d) => `translate(${d.x}, ${d.y})`);
            this.lib_node.attr("transform", (d) => `translate(${d.x}, ${d.y})`);
            this.lib_node.selectAll("circle").attr("r", (d) => d.br);
            this.loc_node.selectAll("circle").attr("r", (d) => d.br);
            console.log("render");
            if (this.simulation.is_running) requestAnimationFrame(render);
        };
        requestAnimationFrame(render);
    }

    add_defs() {
        const defs = this.svg.append("defs");
        const arrow_color = color.mapDarkerBrown;
        const edge_color = "#A58567"; // ae8e71, A58567
        const edge_color_bright = "#FFCE9F";

        const defLinearGradient = (params) => {
            const { id, stops } = params;
            const linearGradient = defs.append("linearGradient").attr("id", id);
            for (let stop of stops) {
                linearGradient
                    .append("stop")
                    .attr("offset", `${stop[0]}%`)
                    .attr("stop-color", stop[2])
                    .attr("stop-opacity", stop[1]);
            }
            return linearGradient;
        };

        const graph_arrow_path_gradient_params = {
            id: "ArrowPathGradient",
            stops: [
                // [0, 0.2, edge_color],
                // [60, 0.5, edge_color],
                // [100, 1, edge_color],
                [0, 1, edge_color],
                [100, 1, edge_color],
            ],
        };

        const graph_arrow_path_gradient_bright_params = {
            id: "ArrowPathGradientBright",
            stops: [
                [0, 0.2, edge_color_bright],
                [60, 0.5, edge_color_bright],
                [100, 1, edge_color_bright],
            ],
        };

        const linear_gradient = defLinearGradient(
            graph_arrow_path_gradient_params
        );

        defLinearGradient(graph_arrow_path_gradient_bright_params);

        defs.append("marker")
            .attr("id", "ArrowPathArrowHead")
            .attr("viewBox", "0 0 20 10")
            .attr("refX", "20")
            .attr("refY", "5")
            .attr("markerWidth", "6")
            .attr("markerHeight", "3")
            .attr("orient", "auto")
            .append("path")
            .attr("d", "M 0 0 L 20 5 L 0 10 z")
            .attr("fill", edge_color)
            .attr("fill-opacity", "0.6");

        defs.append("marker")
            .attr("id", "ArrowPathArrowHeadBright")
            .attr("viewBox", "0 0 20 10")
            .attr("refX", "20")
            .attr("refY", "5")
            .attr("markerWidth", "6")
            .attr("markerHeight", "3")
            .attr("orient", "auto")
            .append("path")
            .attr("d", "M 0 0 L 20 5 L 0 10 z")
            .attr("fill", edge_color_bright)
            .attr("fill-opacity", "0.6");
    }

    initialize_lib_node_styles() {
        const normal = (g) => {
            g.selectAll("circle")
                .attr("r", (d) => d.br)
                .attr("fill", (d) => type_color.library[d.lib_type]);
            g.select(".background").attr("fill-opacity", background_opacity);
            g.select(".midground").attr("fill-opacity", midground_opacity);
            g.selectAll("text")
                .attr("text-anchor", "middle")
                // .attr("dominant-baseline", "middle")
                .attr("fill", "black");
            // .attr("fill", "white")
            // .attr("font-size", "0.5rem");
            g.selectAll("text")
                .filter((d) => d.name_type !== "lib")
                .attr("fill-opacity", 0)
                .attr("text-anchor", "start")
                .attr("dy", "0.2rem")
                .attr("dx", "0.3rem");
        };

        const brushed = (g) => {
            const cnt_nodes = this.cnt_nodes;
            g.filter((d) => d.node_idx === this.component.hovered_node).raise();
            g.select(".midground").attr(
                "r",
                (d) => Math.sqrt(d.mid_size / d.size) * d.br
            );
            g.select(".foreground")
                .attr("r", (d) => Math.sqrt(d.fore_size / d.size) * d.br)
                .attr("fill", (d) =>
                    this.is_node_selected(d) ||
                    d.node_highlighted ||
                    d.node_idx === this.component.hovered_node
                        ? type_color.library.bright[d.lib_type]
                        : type_color.library[d.lib_type]
                )
                .attr("filter", (d) =>
                    this.is_node_selected(d) ||
                    d.node_highlighted ||
                    d.node_idx === this.component.hovered_node
                        ? // ? "drop-shadow(3px 2px 2px rgb(0 0 0 / 0.6))"
                          "drop-shadow(4px 4px 2px rgb(0 0 0 / 0.6))"
                        : "none"
                )
                .attr("stroke-width", 2.5)
                .attr("stroke", (d) =>
                    this.is_node_selected(d) ||
                    d.node_highlighted ||
                    d.node_idx === this.component.hovered_node
                        ? "white"
                        : "none"
                );
            // .attr("stroke", "white");
            g.selectAll("text").attr("fill-opacity", (d) =>
                d.fore_size > 0 ? 1 : edge_background_opacity
            );
            if (this.language === "en") {
                g.selectAll("text").each(function (d) {
                    console.log(d);
                    if (cnt_nodes <= 60 || d.show_full_name) {
                        d3.select(this)
                            .selectAll("tspan")
                            .data(d.name_spans.full)
                            .join("tspan")
                            .text((d) => d.text);
                    } else {
                        d3.select(this)
                            .selectAll("tspan")
                            .data(d.name_spans.simp)
                            .join("tspan")
                            .text((d) => d.text);
                    }
                });

                g.selectAll("tspan")
                    .attr("x", 0)
                    .attr(
                        "y",
                        (d, i) => (i - d.span_line_num / 2) * (this.rem / 2)
                    )
                    .attr("dy", (d, i) => this.rem / 2);
            }
            g.selectAll("text")
                .filter((d) => d.name_type !== "lib")
                .attr("fill-opacity", (d) => {
                    if (this.cnt_nodes <= 60 && d.fore_size > 0) return 1;
                    return 0;
                });
        };

        const dehighlighted = (g) => {
            g.select(".foreground").attr("fill-opacity", 0);
            g.select("text").attr("fill-opacity", 0.2);
        };

        return {
            normal: normal,
            brushed: brushed,
            dehighlighted: dehighlighted,
        };
    }

    initialize_loc_node_styles() {
        const dasharray = ["12, 3, 2, 3", "7, 5", "6, 4"];
        const stroke_color = ["#6a4c2a", "#6a4c2a", "#ad9278"];
        const stroke_width = [1.5, 1, 1];

        const normal = (g) => {
            g.selectAll("circle")
                .attr("r", (d) => d.br)
                // .attr("fill", "none")
                .attr("fill", "#6a4c2a")
                .attr("fill-opacity", 0)
                // .attr("stroke", (d) => (d.level === 0 ? "#6a4c2a" : "#ad9278"))
                .attr("stroke", (d) =>
                    d.level < stroke_color.length
                        ? stroke_color[d.level]
                        : stroke_color[stroke_color.length - 1]
                )
                // .attr("stroke-dasharray", (d) =>
                //     d.level === 0 ? "12,3,2,3" : "6,4"
                // )
                .attr("stroke-dasharray", (d) =>
                    d.level < dasharray.length
                        ? dasharray[d.level]
                        : dasharray[dasharray.length - 1]
                )
                // .attr("stroke-width", (d) => (d.level === 0 ? 1.5 : 1));
                .attr("stroke-width", (d) => {
                    let w =
                        d.level < stroke_width.length
                            ? stroke_width[d.level]
                            : stroke_width[stroke_width.length - 1];
                    return this.component.hovered_node === d.node_idx ||
                        this.is_node_selected(d)
                        ? w + 1
                        : w;
                })
                .attr("stroke-opacity", 0.2);
        };

        const brushed = (g) => {
            g.selectAll("circle")
                .attr("r", (d) => d.br)
                // .attr("fill", "none")
                .attr("fill-opacity", (d) =>
                    this.component.hovered_node === d.node_idx ||
                    this.is_node_selected(d)
                        ? 0.02
                        : 0
                )
                // .attr("stroke", (d) => (d.level === 0 ? "#6a4c2a" : "#ad9278"))
                .attr("stroke", (d) =>
                    d.level < stroke_color.length
                        ? stroke_color[d.level]
                        : stroke_color[stroke_color.length - 1]
                )
                // .attr("stroke-dasharray", (d) =>
                //     d.level === 0 ? "12,3,2,3" : "6,4"
                // )
                .attr("filter", (d) =>
                    this.component.hovered_node === d.node_idx ||
                    this.is_node_selected(d)
                        ? "drop-shadow(0.5px 0.5px 1px rgb(0 0 0 / 0.2))"
                        : "none"
                )
                .attr("stroke-dasharray", (d) =>
                    d.level < dasharray.length
                        ? dasharray[d.level]
                        : dasharray[dasharray.length - 1]
                )
                // .attr("stroke-width", (d) => (d.level === 0 ? 1.5 : 1));
                .attr("stroke-width", (d) => {
                    let w =
                        d.level < stroke_width.length
                            ? stroke_width[d.level]
                            : stroke_width[stroke_width.length - 1];
                    return this.component.hovered_node === d.node_idx ||
                        this.is_node_selected(d)
                        ? w + 1
                        : w;
                })
                // .attr("stroke-opacity", (d) => (d.fore_size ? 1 : 0.1));
                .attr("stroke-opacity", (d) => {
                    if (
                        this.component.hovered_node === d.node_idx ||
                        this.is_node_selected(d)
                    )
                        return 1;
                    else if (d.fore_size === 0) return background_opacity;
                    return 0.2;
                });
            g.selectAll("text").attr(
                "fill-opacity",
                (d) => {
                    if (d.fore_size === 0) return 0;
                    if (d.fore_size && d.level <= 1) {
                        return 1;
                    } else if (
                        this.component.hovered_node === d.node_idx ||
                        this.is_node_selected(d)
                    ) {
                        return 1;
                    } else if (this.cnt_nodes <= 60 && d.level === 2) {
                        return 1;
                    } else if (d.level >= 2) return 0;
                    else return 0.1;
                }
                // d.fore_size && d.level <= 1 ? 1 : 0.1
            );
        };

        return {
            normal: normal,
            brushed: brushed,
        };
    }

    initialize_edge_styles() {
        const normal = (g) => {
            g.selectAll("path")
                .filter(".curve")
                .attr("fill", "none")
                .attr("stroke-width", (d) => d.stroke_width)
                .attr("stroke", "url(#ArrowPathGradient)")
                .attr("d", (d) => d.path)
                .attr("transform", (d) => d.transform)
                // .attr("opacity", 1);
                .attr("opacity", (d) => {
                    if (d.stroke_width > 5) return 0.8;
                    else if (d.stroke_width > 2) return 0.5;
                    else if (d.stroke_width > 1) return 0.3;
                    return 0.2;
                });
            // 0.2);
            // .attr("stroke-dasharray", (d) =>
            //     d.state_flag === "block_print" ||
            //     d.state_flag === "normal_internal"
            //         ? "6,4"
            //         : "none"
            // );
            g.select(".background").attr("opacity", edge_background_opacity);
            g.select(".midground").attr("opacity", midground_opacity);
        };

        const brushed = (g) => {
            g.select(".midground").attr(
                "stroke-width",
                (d) => (d.mid_weight / d.weight) * d.stroke_width
            );
            g.select(".foreground")
                .attr("filter", (d) =>
                    d.edge_highlighted
                        ? // ? "drop-shadow(3px 2px 2px rgb(0 0 0 / 0.6))"
                          "drop-shadow(2px 1px 3px rgb(117 75 42 / 0.4)) brightness(1.5)"
                        : "none"
                )
                .each((d) => {
                    let w = (d.fore_weight / d.weight) * d.stroke_width;
                    if (!d.edge_highlighted) d.fore_weight = w;
                    else if (w < 3) d.fore_weight = 3;
                    else if (w < 6) d.fore_weight = w + 1;
                    else d.fore_weight = w;
                })
                .attr("stroke-width", (d) => {
                    let w = (d.fore_weight / d.weight) * d.stroke_width;
                    if (!d.edge_highlighted) return w;
                    if (w < 4) return 4;
                    else if (w < 10) return w + 2;
                    return w;
                })
                .attr(
                    "stroke",
                    (d) =>
                        // d.edge_highlighted
                        //     ? "url(#ArrowPathGradientBright)"
                        // :
                        "url(#ArrowPathGradient)"
                );

            g.selectAll(".curve")
                .filter((d) => d.show_dasharray)
                .attr("stroke-dasharray", (d) =>
                    d.state_flag === "block_print" ||
                    d.state_flag === "normal_internal"
                        ? "6,4"
                        : "none"
                );
            g.selectAll(".curve")
                .filter((d) => !d.show_dasharray)
                .attr("stroke-dasharray", "none");
            if (bundle_debug) return;
            g.select(".curve").each(function (d) {
                const head_offset =
                    Math.sqrt(d.target.fore_size / d.target.size) *
                    d.target.br *
                    0.95;
                const len = this.getTotalLength() - head_offset;
                if (!isFinite(len)) return;
                d.seg_beg = this.getPointAtLength(len - 1e-3);
                d.seg_end = this.getPointAtLength(len);
            });
            g.select(".arrow")
                .attr("d", (d) => get_seg_line(d.seg_beg, d.seg_end))
                .attr("stroke-width", (d) => {
                    let stroke_width =
                        (d.fore_weight / d.weight) * d.stroke_width;
                    return stroke_width < 10
                        ? stroke_width
                        : Math.sqrt(stroke_width);
                })
                .attr("transform", (d) => d.transform)
                .attr("filter", (d) =>
                    d.edge_highlighted
                        ? // ? "drop-shadow(3px 2px 2px rgb(0 0 0 / 0.6))"
                          "drop-shadow(2px 2px 5px rgb(117 75 42 / 0.7)) brightness(1.5)"
                        : "none"
                )
                .attr(
                    "marker-end",
                    (d) =>
                        // d.edge_highlighted
                        // ? "url(#ArrowPathArrowHeadBright"
                        // :
                        "url(#ArrowPathArrowHead)"
                )
                .attr("visibility", (d) =>
                    d.fore_weight > 0 ? "visible" : "hidden"
                );
        };

        const dehighlighted = (g) => {
            g.select(".foreground").selectAll("path").attr("opacity", 0);
        };

        return {
            normal: normal,
            brushed: brushed,
            dehighlighted: dehighlighted,
        };
    }

    is_node_selected(node) {
        return this.component.selected_node.indexOf(node.node_idx) !== -1;
    }
}

function calcD(src, dst, percentage = 1) {
    const direct = dst.sub(src);
    const normal = direct.rotate(Math.PI / 2).mul(0.2);
    /* Cubic bezier with normal offset in src & dst */
    // return `M ${src.x},${src.y} c ${normal.x},${normal.y} ${direct.x + normal.x},${direct.y + normal.y} ${direct.x},${direct.y}`;
    /* Quadratic  bezier with center normal offset */
    const middle = direct.mul(0.5).add(normal);

    if (percentage === 1) {
        return `M ${src.x},${src.y} q ${middle.x},${middle.y} ${direct.x},${direct.y}`;
    } else {
        const m1 = new Point(0, 0)
            .mul(1 - percentage)
            .add(middle.mul(percentage));
        const m2 = middle.mul(1 - percentage).add(direct.mul(percentage));
        const m3 = m1.mul(1 - percentage).add(m2.mul(percentage));
        return `M ${src.x},${src.y} q ${m1.x},${m1.y} ${m3.x},${m3.y}`;
    }
}
function calcAng(fr, to) {
    const det = to.sub(fr);
    const ang = det.angle();
    const rotateDet = det.rotate(-ang);
    const newTo = fr.add(rotateDet);
    return [newTo, `rotate(${(ang / Math.PI) * 180}, ${fr.x},${fr.y})`];
}

function get_edge_arc(n0, n1) {
    let edge_curvature = 0.8;

    const dx = n1.x - n0.x;
    const dy = n1.y - n0.y;
    const c = Math.sqrt(dx * dx + dy * dy) * edge_curvature;
    return (
        "M" +
        n0.x +
        "," +
        n0.y +
        "A" +
        c +
        "," +
        c +
        " 0 0,1 " +
        n1.x +
        "," +
        n1.y
    );
}

function get_seg_line(beg, end) {
    return beg ? "M" + beg.x + "," + beg.y + " L" + end.x + "," + end.y : "";
}

function drawArrow(edge, src, dst) {
    const fr = src;
    const [to, rotateStr] = calcAng(fr, dst);
    edge.attrHelper({
        fill: "none",
        "stroke-width": EDGEWIDTH,
        stroke: "url(#ArrowPathGradient)",
        d: calcD(fr, to),
        transform: rotateStr,
        "marker-end": "url(#ArrowPathArrowHead)",
    });
}

function edge_width(d) {
    return d.weight;
    return Math.sqrt(d.weight);
}
