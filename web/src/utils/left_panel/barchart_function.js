import * as d3 from "d3";
const $ = require("jquery");

import { jsonCopy } from "@/utils/copy";
import * as TypeColor from "@/theme/type_color";

const time_duration = 1000

export function renderBarchart(collector_data_ori) {
    const svg = d3.select("#barchart-svg")
    const svg_width = $(`#barchart-svg`).width(),
          svg_height = $(`#barchart-svg`).height()
    let collector_data = jsonCopy(collector_data_ori)
    collector_data.sort((a, b) => b['seals'].length - a['seals'].length)
    let max_seal_num = compute_max_seal_num(collector_data) // let max_seal_num = collector_data[0]['seals'].length
    // console.log("svg_width", svg_width, "svg_height", svg_height, "max_seal_num", max_seal_num) // success

    let collector_group = svg.selectAll(".collector-group")
                                .data(collector_data)
                                .enter()
                                .append("g")
                                .attr("class", "barchart-collector-group")
                                .attr("transform", function(d, i) {
                                    return "translate(0," + (2 * i + 1) * svg_height / (2 * collector_data.length + 1) + ")"
                                })
    let collector_rect = collector_group.append("rect")
                                        .attr("class", "collector-rect")
                                        .attr("x", svg_width * 0.28)
                                        .attr("y", 0)
                                        .attr("width", (d, i) => d["seals"].length / max_seal_num * svg_width * (1 - 0.28))
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

// 改变barchart的transition
export function barchartTransition(hover, selection, collector_data_ori) {
    // console.log('barchartTransition换位置啦') // success
    let resorted_collector_data = jsonCopy(collector_data_ori)
    resorted_collector_data.sort((a, b) => b['seals'].length - a['seals'].length)
    let collector_dict = initializeCollectorDict(resorted_collector_data) // 通过dict实现
    let selected_collector_name = null,
        hover_collector_name = null
    if (selection.entity !== null || hover.entity !== null) { // 当前有处于selection状态的entity(seal_name, 设置的只有一个selected seal name)
        for (let i = 0; i < resorted_collector_data.length; i++) {
            const cur_seal_list = resorted_collector_data[i]["seals"]
            for (let j = 0; j < cur_seal_list.length; j++) {
                if (cur_seal_list[j]["seal_name"] === selection.value) { // selection
                    selected_collector_name = resorted_collector_data[i]["collector_name"]
                }
                if (cur_seal_list[j]["seal_name"] === hover.value) { // hover
                    hover_collector_name = resorted_collector_data[i]["collector_name"]
                }
            }
        }
    } else { // selection, hover均为null
        // collector_dict按照default来
    }

    // 将selected_collector_name对应的collector放在最前面
    if (selected_collector_name !== null) {
        const selected_index = resorted_collector_data.findIndex(obj => obj["collector_name"] === selected_collector_name)
        const selected_item = resorted_collector_data[selected_index]
        resorted_collector_data.splice(selected_index, 1)
        resorted_collector_data.unshift(selected_item)
    }
    // 将hover_collector_name对应的collector放在最前面
    if (hover_collector_name !== null) {
        const hover_index = resorted_collector_data.findIndex(obj => obj["collector_name"] === hover_collector_name)
        const hover_item = resorted_collector_data[hover_index]
        resorted_collector_data.splice(hover_index, 1)
        resorted_collector_data.unshift(hover_item)
    }

    // update collector_dict
    for (let i = 0; i < resorted_collector_data.length; i++) {
        collector_dict[resorted_collector_data[i]["collector_name"]] = i
    }

    // update barchart
    const svg_height = $(`#barchart-svg`).height()
    d3.selectAll('.barchart-collector-group')
        .transition()
        .duration(time_duration) // filter时的过渡
        .attr('transform', d => {
            const i = collector_dict[d["collector_name"]]
            return `translate(0, ${(2 * i + 1) * svg_height / (2 * resorted_collector_data.length + 1)})`
        })
        .attr("filter", (d) => [...new Set([hover_collector_name, selected_collector_name])].includes(d["collector_name"]) ?
            'drop-shadow(0.8px 0.8px 0.8px rgb(0 0 0 / 0.6))' : 'none'
        )
}

// 初始化collector_dict
function initializeCollectorDict(collector_data) {
    let collector_dict = {}
    for (let i = 0; i < collector_data.length; i++) {
        collector_dict[collector_data[i]["collector_name"]] = i
    }
    return collector_dict
}