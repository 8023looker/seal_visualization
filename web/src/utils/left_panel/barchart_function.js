import * as d3 from "d3";
const $ = require("jquery");

import { jsonCopy } from "@/utils/copy";
import * as TypeColor from "@/theme/type_color";

export function renderBarchart(collector_data) {
    const svg = d3.select("#barchart-svg")
    const svg_width = $(`#barchart-svg`).width(),
          svg_height = $(`#barchart-svg`).height()
    collector_data.sort((a, b) => b['seals'].length - a['seals'].length)
    let max_seal_num = compute_max_seal_num(collector_data) // let max_seal_num = collector_data[0]['seals'].length
    // console.log("svg_width", svg_width, "svg_height", svg_height, "max_seal_num", max_seal_num) // success

    let collector_group = svg.selectAll(".collector-group")
                                .data(collector_data)
                                .enter()
                                .append("g")
                                .attr("class", "collector-group")
                                .attr("transform", function(d, i) {
                                    return "translate(0," + (2 * i + 1) * svg_height / (2 * collector_data.length + 1) + ")"
                                })
    let collector_rect = collector_group.append("rect")
                                        .attr("class", "collector-rect")
                                        .attr("x", svg_width / 4)
                                        .attr("y", 0)
                                        .attr("width", (d, i) => d["seals"].length / max_seal_num * svg_width * (3 - 0.1) / 4)
                                        .attr("height", svg_height / (2 * collector_data.length + 1))
                                        // .attr("fill", function(d, i) {
                                        //     return TypeColor.color_list[d["collector_name"]]
                                        // })
                                        .attr("fill", "#8F7B6C")
    let collector_name = collector_group.append("text")
                                        .attr("class", "collector-name-text")
                                        .attr("x", svg_width / 100)
                                        .attr("y", 0)
                                        .attr("dy", svg_height / (2 * 1.5 * collector_data.length + 1))
                                        .attr("fill", "#724A2B")
                                        // .attr("font-weight", "bold")
                                        .text(d => d["collector_name"].includes("爱新觉罗·") ? d["collector_name"].replace("爱新觉罗·", "") : d["collector_name"])
    let seal_num = collector_group.append("text")
                                    .attr("class", "seal-num-text")
                                    .attr("x", svg_width * (1 - 0.75 * 0.1))
                                    .attr("y", 0)
                                    .attr("dy", svg_height / (2 * 1.5 * collector_data.length + 1))
                                    .attr("fill", (d, i) => d["seals"].length / max_seal_num * svg_width * (3 - 0.1) / 4 + svg_width / 4 > svg_width * (1 - 0.75 * 0.1) ? "#FFFFFF" : "#724A2B")
                                    .attr("text-anchor", "end")
                                    .text(d => d["seals"].length.toString())
}

function compute_max_seal_num(collector_data) {
    let max_seal_num = 0
    for (let i = 0; i < collector_data.length; i++) {
        if (collector_data[i]["seals"].length > max_seal_num) {
            max_seal_num = collector_data[i]["seals"].length
        }
    }
    return max_seal_num
}