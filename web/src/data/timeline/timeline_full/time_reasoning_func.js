import * as d3 from "d3";
const $ = require("jquery");

import * as DataProcess from "@/data/timeline/timeline_full/data_process";
import * as RenderAxis from "@/data/timeline/timeline_full/render_axis";
import * as Interaction from "@/data/timeline/timeline_full/interaction";
import { jsonCopy } from "@/utils/copy";
import { color, type_color } from "@/theme";

const margin = {
    top: 0.01,
    left: 0.01,
    right: 0.01,
    bottom: 0.01,
};

const marginSVG = {
    top: 0.05,
    left: 0.01,
    right: 0.01,
    bottom: 0.15,
}

// 绘制子时间轴(相互重叠，library与agent分开, version 1)
export async function draw_sub_timeline_old(oriTimeScale, reason_data, event_data, rem) {
    // 起始年份与结束年份(whole)
    let yearStart = 960,
        yearEnd = 1965,
        oriYearStep = 25
    // console.log("reason_data", reason_data)
    // console.log("events_data", event_data)

    let cur_reason_data = null
    for (let i = 0; i < reason_data.length; i++) {
        if (reason_data[i].ori_idx === event_data.ori_idx) {        
            cur_reason_data = reason_data[i]
            break
        }
    }
    // console.log("cur_reason_data", cur_reason_data)

    const cur_yearStart = cur_reason_data['time_interval']['composite_interval'][0] === null ? 960 : cur_reason_data['time_interval']['composite_interval'][0] // Infinity
    // console.log('cur_yearStart', cur_yearStart)
    let timeScale = d3.scaleLinear() // 定义xScale
                        .domain([cur_yearStart, yearEnd])
                        .range([oriTimeScale(cur_yearStart), $(".app").width() * 0.85 * 1.176 * (1 - margin.left - margin.right)])
    
    // 更新yearStep
    let yearStep = oriYearStep * (yearEnd - yearStart) / (yearEnd - cur_yearStart)
    let timeAxis_container = d3.select(`#sub-timeline-svg-${event_data['index'].toString()}`)
                                .append('g')
                                .attr('class', 'timeAxis-group')
    // console.log('timeAxis_container', d3.select(timeAxis_container)) // success
    let bottomAxis = d3.axisBottom(timeScale)
                        .ticks((yearEnd - yearStart) / yearStep)
                        .tickFormat((d) => d);
    let topAxis = d3.axisTop(timeScale)
                    .ticks((yearEnd - yearStart) / yearStep)
                    .tickFormat((d) => d);

    // let transY = document.getElementById(`sub-timeline-${event_data['index'].toString()}`).offsetHeight * (1 - 1 / 3.5) // 偶数
    let transY = event_data['index'] % 2 === 0 ?
                 document.getElementById(`sub-timeline-${event_data['index'].toString()}`).offsetHeight * (1 - 1 / 3.5)
                 : document.getElementById(`sub-timeline-${event_data['index'].toString()}`).offsetHeight * 1 / 3.5
    timeAxis_container.append("g")
                        .attr("transform", `translate(${0}, ${transY})`)
                        .call(event_data['index'] % 2 === 0 ? bottomAxis : topAxis)
                        .call((g) => {
                        g.select(".domain")
                            .attr("stroke", "#6a4c2a")
                            .attr("stroke-width", 2)
                            // .attr("transform", `translate(0, ${1.5})`);
                        g.selectAll(".tick")
                            .append("line")
                            .attr("stroke", "#ad9278")
                            .attr("y2", function (d) {
                                if (event_data['index'] % 2 === 0) { // axisBottom
                                    if (d % 100 === 0) return 5;
                                        else { return 3 }
                                } else { // axisTop
                                    if (d % 100 === 0) return -5;
                                        else { return -3 }
                                }
                            })
                            .attr("stroke-width", 1)
                            .style('visibility', (d) => d === 1960? 'hidden' : 'block')
                        g.selectAll("text")
                            .text(function (d) {
                                if (d == 0) return 1;
                                else return d;
                            })
                            .attr("font-size", function (d) {
                                if (d % 100 === 0) return rem / 2.5;
                                else return rem / 3;
                            })
                            .attr("dy", function (d) {
                                if (event_data['index'] % 2 === 0) { // axisBottom
                                    if (d % 100 === 0) return rem / 400;
                                    else return rem / 40;
                                } else { // axisTop
                                    if (d % 100 === 0) return - rem / 4;
                                    else return - rem / 4;
                                }
                            })
                            .attr('font-weight', (d) => d % 100 === 0 ? 'bold' : null)
                            .attr("fill", "#5a3a20")
                            .attr("alignment-baseline", "hanging")
                            // .style('visibility', (d) => d === 1960? 'hidden' : 'block')
                        });
    const { y: axis_top, height: axis_height } = timeAxis_container.node().getBBox()
    // console.log(timeAxis_container.node().getBBox()) // success
    const prob_container_offset = axis_top + axis_height
    let probability_container = d3.select(`#sub-timeline-svg-${event_data['index'].toString()}`) // library, agent
                                    .append('g')
                                    .attr('class', 'probability-group')
    let library_prob = probability_container.append('g')
                                            .attr('class', 'library-probablity-group')
                                            .attr('transform', `translate(${0}, ${event_data['index'] % 2 === 0 ? 0 : prob_container_offset + document.getElementById(`sub-timeline-${event_data['index'].toString()}`).offsetHeight * 0.35})`),
        agent_prob = probability_container.append('g')
                                            .attr('class', 'agent-probablity-group')
                                            .attr('transform', 
                                            `translate(${0}, ${event_data['index'] % 2 === 0 ? document.getElementById(`sub-timeline-${event_data['index'].toString()}`).offsetHeight * 0.35
                                                               : prob_container_offset})`),
        direct_prob = probability_container.append('g')
                                            .attr('class', 'direct-probablity-group')
                                            .attr('transform', `translate(${0}, ${event_data['index'] % 2 === 0 ? document.getElementById(`sub-timeline-${event_data['index'].toString()}`).offsetHeight * 0.35
                                                                                  : prob_container_offset})`)
    // 绘制概率分布的svg(机构、人物)
    const lib_agent_height = document.getElementById(`sub-timeline-${event_data['index'].toString()}`).offsetHeight * 0.35
    // 定义 x 和 y 的比例尺(x比例尺直接使用上面定义的)
    let probablity_ySacle = d3.scaleLinear()
                                .domain([0, 1])
                                // .range([lib_agent_height, 0]);
                                .range(event_data['index'] % 2 === 0 ? [lib_agent_height, 0] : [0, lib_agent_height])

    // 直接史料
    if (cur_reason_data['time_interval'].hasOwnProperty('direct')) {
        let direct_interval = cur_reason_data['time_interval']['direct']['time_range'] // 大多数情况start_year = end_year
        if (direct_interval[0] === direct_interval[1]) {
            direct_interval[0] -= 0.5
            direct_interval[1] += 0.5
        }
        direct_prob.append('rect') // 收藏机构起讫年份
                    .attr('class', 'direct-probability')
                    .attr('x', timeScale(direct_interval[0]))
                    .attr('y', 0)
                    .attr('width', Math.abs(timeScale(direct_interval[1])) - timeScale(direct_interval[0]))
                    .attr('height', probablity_ySacle(0))
                    .attr('fill', '#F6AD8F')
    }
    // 收藏机构
    if (cur_reason_data['time_interval'].hasOwnProperty('library')) {
        const lib_interval = cur_reason_data['time_interval']['library']
        // 用于标志经手人物的史料文本类型是否找到
        let library_source_type = {
            'start2end': false,
            'transferRecord-clear': false, // 缺少这部分接口
            'transferRecord-blur': false
        }
        for (let l = 0; l < lib_interval['material_list'].length; l++) {
            if (lib_interval['material_list'][l]['source_type'] === 'start2end' && !library_source_type['start2end']) { // 起讫年份
                let lib_start2end = lib_interval['material_list'][l]['time_range']
                // 将无穷修改为数值
                if (lib_start2end[0] === null) {
                    lib_start2end[0] = yearStart
                }
                if (lib_start2end[1] === null) {
                    lib_start2end[1]= yearEnd
                }
                // console.log('lib_start2end', lib_start2end)
                library_prob.append('rect') // 收藏机构起讫年份
                            .attr('class', 'library-start2end')
                            .attr('x', timeScale(lib_start2end[0]))
                            .attr('y', 0)
                            .attr('width', Math.abs(timeScale(lib_start2end[1]) - timeScale(lib_start2end[0])))
                            .attr('height', lib_agent_height)
                            .attr('fill', '#D4E9FF')
                            .style('opacity', 0.5)
                library_source_type['start2end'] = true
                // break
            } else if (lib_interval['material_list'][l]['source_type'] === 'transferRecord-blur' && !library_source_type['transferRecord-blur']) { // 藏书转移记录（模糊）
                const transferNormalBlur = await d3.json("data/time_reasoning/transfer_normal.json")
                let lib_transferBlur = lib_interval['material_list'][l]['time_range'] // [year, year]
                // 将无穷修改为数值
                if (lib_transferBlur[0] === null) {
                    lib_transferBlur[0] = (cur_yearStart + yearEnd) / 2
                }
                if (lib_transferBlur[1] === null) {
                    lib_transferBlur[1]= (cur_yearStart + yearEnd) / 2
                }

                const normal_maxY = DataProcess.judgeLibraryTimeBreak(lib_transferBlur[0] - 2, lib_transferBlur[1] + 2, transferNormalBlur, 'transferRecord-blur') // 前后offset_year = 4
                probablity_ySacle.domain([0, normal_maxY['maxinum']]) // 修改定义域
                const areaNormal = d3.area()
                                        .x(d => timeScale(lib_transferBlur[0] - 2 + (d.x + 5) * 4 / 10))
                                        .y0(d => probablity_ySacle(0))
                                        .y1(d => probablity_ySacle(d.y * normal_maxY['ratio']))
                                        .curve(d3.curveNatural)

                // 绘制 area chart
                library_prob.append("path")
                            .datum(transferNormalBlur)
                            .attr('class', 'library-transfer-blur')
                            .attr('fill', '#F6AD8F')
                            .attr("d", areaNormal)         
                            .style('opacity', 0.7)
                // library_source_type['transferRecord-blur'] = true // 可能有多个
            }
        }
    }
    // 经手人物
    if (cur_reason_data['time_interval'].hasOwnProperty('agent')) {
        const agent_interval = cur_reason_data['time_interval']['agent']
        // 用于标志经手人物的史料文本类型是否找到
        let agent_source_type = {
            'born2death': false,
            'activity-officialPosition': false,
            'activity-transferRecord-clear': false, // 缺少这部分接口
            'activity-transferRecord-blur': false
        }
        for (let a = 0; a < agent_interval['material_list'].length; a++) {
            if (agent_interval['material_list'][a]['source_type'] === 'born2death' && !agent_source_type['born2death']) { // 出生逝世
                const exponentUp = await d3.json("data/time_reasoning/agent_exponential_up.json"),
                      exponentDown = await d3.json("data/time_reasoning/agent_exponential_down.json")
                let agent_start2end = agent_interval['material_list'][a]['time_range']
                // 将无穷修改为数值
                if (agent_start2end[0] === null) {
                    agent_start2end[0] = yearStart
                }
                if (agent_start2end[1] === null) {
                    agent_start2end[1]= yearEnd
                }
                // console.log('agent_start2end', agent_start2end)
                const agent_time_break = DataProcess.judgeAgentTimeBreak(agent_start2end[0], agent_start2end[1], {exponentUp: exponentUp, exponentDown: exponentDown}, 'born2death')

                probablity_ySacle.domain([0, agent_time_break['maximum'] * exponentDown[0]['y']]) // 修改定义域

                const areaUp = d3.area()
                                    .x(d => timeScale(agent_time_break['born'] + d.x * ((agent_time_break['adult'] - agent_time_break['born']) / 10)))
                                    .y0(d => probablity_ySacle(0))
                                    .y1(d => probablity_ySacle(d.y * agent_time_break['maximum']))
                                    .curve(d3.curveNatural),
                      areaDown = d3.area()
                                    .x(d => timeScale(agent_time_break['downturn'] + d.x * ((agent_time_break['death'] - agent_time_break['downturn']) / 10)))
                                    .y0(d => probablity_ySacle(0))
                                    .y1(d => probablity_ySacle(d.y * agent_time_break['maximum']))
                                    .curve(d3.curveNatural)

                // 绘制 area chart
                agent_prob.append("path")
                            .datum(exponentUp)
                            .attr('class', 'agent-exponentUp')
                            .attr('fill', '#D9FFB4')
                            .attr("d", areaUp)         
                            .style('opacity', 0.5)
                agent_prob.append('rect') // 收藏机构起讫年份
                            .attr('class', 'agent-exponentFlat')
                            .attr('x', timeScale(agent_time_break['adult']))
                            .attr('y', 0)
                            .attr('width', Math.abs(timeScale(agent_time_break['downturn'])) - timeScale(agent_time_break['adult']))
                            .attr('height', event_data['index'] % 2 === 0 ? probablity_ySacle(0) : probablity_ySacle(agent_time_break['maximum'] * exponentDown[0]['y']))
                            .attr('fill', '#D9FFB4')
                            .style('opacity', 0.5)
                agent_prob.append("path")
                            .datum(exponentDown)
                            .attr('class', 'agent-exponentDown')
                            .attr('fill', '#D9FFB4')
                            .attr("d", areaDown)         
                            .style('opacity', 0.5)
                agent_source_type['born2death'] = true
                // break
            } else if (agent_interval['material_list'][a]['source_type'] === 'activity-officialPosition' && !agent_source_type['activity-officialPosition']) { // 官职变动
                const officialUp = await d3.json("data/time_reasoning/agent_logarithmic_up.json"),
                      officialDown = await d3.json("data/time_reasoning/agent_exponential_down.json")
                let agentOfficial = agent_interval['material_list'][a]['time_range']
                // 将无穷修改为数值
                if (agentOfficial[0] === null) {
                    agentOfficial[0] = yearStart
                }
                if (agentOfficial[1] === null) {
                    agentOfficial[1]= yearEnd
                }
                // console.log('agentOfficial', agentOfficial)
                const agent_time_break = DataProcess.judgeAgentTimeBreak(agentOfficial[0], agentOfficial[1], {exponentUp: officialUp, exponentDown: officialDown}, 'activity-officialPosition')

                probablity_ySacle.domain([0, agent_time_break['maximum'] * officialDown[0]['y']]) // 修改定义域

                const areaUp = d3.area()
                                    .x(d => timeScale(agent_time_break['born'] + d.x * ((agent_time_break['adult'] - agent_time_break['born']) / 10)))
                                    .y0(d => probablity_ySacle(0))
                                    .y1(d => probablity_ySacle(d.y * agent_time_break['maximum']))
                                    .curve(d3.curveNatural),
                      areaDown = d3.area()
                                    .x(d => timeScale(agent_time_break['downturn'] + d.x * ((agent_time_break['death'] - agent_time_break['downturn']) / 10)))
                                    .y0(d => probablity_ySacle(0))
                                    .y1(d => probablity_ySacle(d.y * agent_time_break['maximum']))
                                    .curve(d3.curveNatural)

                // 绘制 area chart
                agent_prob.append("path")
                            .datum(officialUp)
                            .attr('class', 'agent-officialUp')
                            .attr('fill', '#ACFF59')
                            .attr("d", areaUp)
                            .style('opacity', 0.7)
                agent_prob.append('rect') // 收藏机构起讫年份
                            .attr('class', 'agent-officialFlat')
                            .attr('x', timeScale(agent_time_break['adult']))
                            .attr('y', 0)
                            .attr('width', Math.abs(timeScale(agent_time_break['downturn'])) - timeScale(agent_time_break['adult']))
                            .attr('height', event_data['index'] % 2 === 0 ? probablity_ySacle(0) : probablity_ySacle(agent_time_break['maximum'] * officialDown[0]['y']))
                            .attr('fill', '#ACFF59')
                            .style('opacity', 0.7)
                agent_prob.append("path")
                            .datum(officialDown)
                            .attr('class', 'agent-officialDown')
                            .attr('fill', '#ACFF59')
                            .attr("d", areaDown)
                            .style('opacity', 0.7)  
                // agent_source_type['activity-officialPosition'] = true // 可能都多个
            } else if (agent_interval['material_list'][a]['source_type'] === 'activity-transferRecord-blur' && !agent_source_type['activity-transferRecord-blur']) { // 藏书转移记录（模糊）
                const transferNormalBlur = await d3.json("data/time_reasoning/transfer_normal.json")
                let agent_transferBlur = agent_interval['material_list'][a]['time_range'] // [year, year]
                // 将无穷修改为数值
                if (agent_transferBlur[0] === null) {
                    agent_transferBlur[0] = (cur_yearStart + yearEnd) / 2
                }
                if (agent_transferBlur[1] === null) {
                    agent_transferBlur[1] = (cur_yearStart + yearEnd) / 2
                }

                // 直接使用judgeLibraryTimeBreak中的'transferRecord-blur'（'activity-transferRecord-blur'）的正态分布
                const normal_maxY = DataProcess.judgeLibraryTimeBreak(agent_transferBlur[0] - 2, agent_transferBlur[1] + 2, transferNormalBlur, 'activity-transferRecord-blur') // 前后offset_year = 4
                probablity_ySacle.domain([0, normal_maxY['maxinum']]) // 修改定义域
                const areaNormal = d3.area()
                                        .x(d => timeScale(agent_transferBlur[0] - 2 + (d.x + 5) * 4 / 10))
                                        .y0(d => probablity_ySacle(0))
                                        .y1(d => probablity_ySacle(d.y * normal_maxY['ratio']))
                                        .curve(d3.curveNatural)

                // 绘制 area chart
                agent_prob.append("path")
                            .datum(transferNormalBlur)
                            .attr('class', 'library-transfer-blur')
                            .attr('fill', '#F6AD8F')
                            .attr("d", areaNormal)         
                            .style('opacity', 0.7)
                // agent_source_type['activity-transferRecord-blur'] = true // 可能有多个
            }
        }
    }
}

// 绘制子时间轴(version 1)
export async function draw_sub_timeline_version1(oriTimeScale, reason_data, event_data, rem, material_num) {
    // 起始年份与结束年份(whole)
    let yearStart = 960,
        yearEnd = 1965,
        oriYearStep = 25
    console.log("reason_data", reason_data)
    // console.log("events_data", event_data)

    let cur_reason_data = null
    for (let i = 0; i < reason_data.length; i++) {
        if (reason_data[i].ori_idx === event_data.ori_idx) {        
            cur_reason_data = reason_data[i]
            break
        }
    }
    // console.log("cur_reason_data", cur_reason_data)

    const cur_yearStart = cur_reason_data['time_interval']['composite_interval'][0] === null ? 960 : cur_reason_data['time_interval']['composite_interval'][0] // Infinity
    // console.log('cur_yearStart', cur_yearStart)
    let timeScale = d3.scaleLinear() // 定义xScale
                        .domain([cur_yearStart, yearEnd])
                        .range([oriTimeScale(cur_yearStart), $(".app").width() * 0.85 * 1.176 * (1 - margin.left - margin.right)])
    
    // 更新yearStep
    let yearStep = oriYearStep * (yearEnd - yearStart) / (yearEnd - cur_yearStart)
    // 首先清除之前的group
    d3.select(`#sub-timeline-svg-${event_data['index'].toString()}`).selectAll('g').remove()
    // 然后再绘制
    let timeAxis_container = d3.select(`#sub-timeline-svg-${event_data['index'].toString()}`)
                                .append('g')
                                .attr('class', 'timeAxis-group')
    // console.log('timeAxis_container', d3.select(timeAxis_container)) // success
    let bottomAxis = d3.axisBottom(timeScale)
                        .ticks((yearEnd - yearStart) / yearStep)
                        .tickFormat((d) => d);
    let topAxis = d3.axisTop(timeScale)
                    .ticks((yearEnd - yearStart) / yearStep)
                    .tickFormat((d) => d);

    // let transY = document.getElementById(`sub-timeline-${event_data['index'].toString()}`).offsetHeight * (1 - 1 / 3.5) // 偶数
    let transY = event_data['index'] % 2 === 0 ?
                 document.getElementById(`sub-timeline-${event_data['index'].toString()}`).offsetHeight * (1 - 1 / 3.5)
                 : document.getElementById(`sub-timeline-${event_data['index'].toString()}`).offsetHeight * 1 / 3.5
    timeAxis_container.append("g")
                        .attr("transform", `translate(${0}, ${transY})`)
                        .call(event_data['index'] % 2 === 0 ? bottomAxis : topAxis)
                        .call((g) => {
                        g.select(".domain")
                            .attr("stroke", "#6a4c2a")
                            .attr("stroke-width", 2)
                            // .attr("transform", `translate(0, ${1.5})`);
                        g.selectAll(".tick")
                            .append("line")
                            .attr("stroke", "#ad9278")
                            .attr("y2", function (d) {
                                if (event_data['index'] % 2 === 0) { // axisBottom
                                    if (d % 100 === 0) return 5;
                                        else { return 3 }
                                } else { // axisTop
                                    if (d % 100 === 0) return -5;
                                        else { return -3 }
                                }
                            })
                            .attr("stroke-width", 1)
                            .style('visibility', (d) => d === 1960? 'hidden' : 'block')
                        g.selectAll("text")
                            .text(function (d) {
                                if (d == 0) return 1;
                                else return d;
                            })
                            .attr("font-size", function (d) {
                                if (d % 100 === 0) return rem / 2.5;
                                else return rem / 3;
                            })
                            .attr("dy", function (d) {
                                if (event_data['index'] % 2 === 0) { // axisBottom
                                    if (d % 100 === 0) return rem / 400;
                                    else return rem / 40;
                                } else { // axisTop
                                    if (d % 100 === 0) return - rem / 4;
                                    else return - rem / 4;
                                }
                            })
                            .attr('font-weight', (d) => d % 100 === 0 ? 'bold' : null)
                            .attr("fill", "#5a3a20")
                            .attr("alignment-baseline", "hanging")
                            // .style('visibility', (d) => d === 1960? 'hidden' : 'block')
                        });
    const { y: axis_top, height: axis_height } = timeAxis_container.node().getBBox()
    // console.log(timeAxis_container.node().getBBox()) // success
    const prob_container_offset = axis_top + axis_height
    let probability_container = d3.select(`#sub-timeline-svg-${event_data['index'].toString()}`) // library, agent, transferRecord
                                    .append('g')
                                    .attr('class', 'probability-group')
    let library_prob = probability_container.append('g')
                                            .attr('class', 'library-probablity-group')
                                            .attr('transform', `translate(${0}, ${event_data['index'] % 2 === 0 ? 0 : prob_container_offset + document.getElementById(`sub-timeline-${event_data['index'].toString()}`).offsetHeight * 0})`),
        agent_prob = probability_container.append('g')
                                            .attr('class', 'agent-probablity-group')
                                            .attr('transform', `translate(${0}, ${event_data['index'] % 2 === 0 ? 0 : prob_container_offset + document.getElementById(`sub-timeline-${event_data['index'].toString()}`).offsetHeight * 0})`),
        direct_prob = probability_container.append('g')
                                            .attr('class', 'direct-probablity-group')
                                            .attr('transform', `translate(${0}, ${event_data['index'] % 2 === 0 ? 0
                                                                                  : prob_container_offset})`)
    // 绘制概率分布的svg(机构、人物)
    const lib_agent_height = document.getElementById(`sub-timeline-${event_data['index'].toString()}`).offsetHeight * 0.7
    // 定义 x 和 y 的比例尺(x比例尺直接使用上面定义的)
    let probablity_ySacle = d3.scaleLinear()
                                .domain([0, 1])
                                // .range([lib_agent_height, 0]);
                                .range(event_data['index'] % 2 === 0 ? [lib_agent_height, 0] : [0, lib_agent_height])

    // 直接史料(优先级 1)
    if (cur_reason_data['time_interval'].hasOwnProperty('direct')) {
        let direct_interval = cur_reason_data['time_interval']['direct']['time_range'] // 大多数情况start_year = end_year
        if (direct_interval[0] === direct_interval[1]) {
            direct_interval[0] -= 0.5
            direct_interval[1] += 0.5
        }
        direct_prob.append('rect') // 收藏机构起讫年份
                    .attr('class', 'direct-probability')
                    .attr('x', timeScale(direct_interval[0]))
                    .attr('y', 0)
                    .attr('width', Math.abs(timeScale(direct_interval[1])) - timeScale(direct_interval[0]))
                    .attr('height', lib_agent_height)
                    .attr('fill', '#F6AD8F')

        // 用于wiki绘图标识
        direct_prob.append('text')
                    .attr('x', $(".app").width() * 0.85 * 1.176 * (1 - margin.left - margin.right) - 2 * rem)
                    .attr('y', rem)
                    .attr('text-anchor', 'end') // 设置文本锚点为右对齐
                    .text('直接史料')
                    .attr('font-size', rem * 0.8)
                    .attr('fill', 'brown')

    }
    // 经手人物(优先级 2)
    if (cur_reason_data['time_interval'].hasOwnProperty('agent') && !cur_reason_data['time_interval'].hasOwnProperty('direct')) { // 不存在direct的情况下
        const agent_interval = cur_reason_data['time_interval']['agent']
        // 用于标志经手人物的史料文本类型是否找到
        let agent_source_type = {
            'born2death': false,
            'activity-officialPosition': false,
            'activity-transferRecord-clear': false, // 缺少这部分接口
            'activity-transferRecord-blur': false
        }

        // const sub_agent_height = lib_agent_height / agent_interval['material_list'].length
        const sub_agent_height = lib_agent_height / material_num['agent']
        
        agent_interval['material_list'] = DataProcess.libAgentMaterialSort(agent_interval['material_list'], 'agent', event_data['index'] % 2 === 0 ? true: false) // 按照绘制顺序重排序

        for (let a = 0; a < agent_interval['material_list'].length; a++) {
            const number_offset = material_num['agent'] - agent_interval['material_list'].length // 对于偶数（上层）的sub-timeline

            if (agent_interval['material_list'][a]['source_type'] === 'born2death' && !agent_source_type['born2death']) { // 出生逝世
                const exponentUp = await d3.json("data/time_reasoning/agent_exponential_up.json"),
                      exponentDown = await d3.json("data/time_reasoning/agent_exponential_down.json")
                let agent_start2end = agent_interval['material_list'][a]['time_range']
                // 将无穷修改为数值
                if (agent_start2end[0] === null) {
                    agent_start2end[0] = yearStart
                }
                if (agent_start2end[1] === null) {
                    agent_start2end[1]= yearEnd
                }
                // console.log('agent_start2end', agent_start2end)
                const agent_time_break = DataProcess.judgeAgentTimeBreak(agent_start2end[0], agent_start2end[1], {exponentUp: exponentUp, exponentDown: exponentDown}, 'born2death')

                probablity_ySacle.domain([0, agent_time_break['maximum'] * exponentDown[0]['y']]) // 修改定义域
                                 .range(event_data['index'] % 2 === 0 ? [sub_agent_height * (a + 1 + number_offset), sub_agent_height * (a + number_offset)] : [sub_agent_height * a, sub_agent_height * (a + 1)]) // 修改值域

                const areaUp = d3.area()
                                    .x(d => timeScale(agent_time_break['born'] + d.x * ((agent_time_break['adult'] - agent_time_break['born']) / 10)))
                                    .y0(d => probablity_ySacle(0))
                                    .y1(d => probablity_ySacle(d.y * agent_time_break['maximum']))
                                    .curve(d3.curveNatural),
                      areaDown = d3.area()
                                    .x(d => timeScale(agent_time_break['downturn'] + d.x * ((agent_time_break['death'] - agent_time_break['downturn']) / 10)))
                                    .y0(d => probablity_ySacle(0))
                                    .y1(d => probablity_ySacle(d.y * agent_time_break['maximum']))
                                    .curve(d3.curveNatural)

                // 绘制 area chart
                agent_prob.append("path")
                            .datum(exponentUp)
                            .attr('class', 'agent-exponentUp')
                            .attr('fill', '#D9FFB4')
                            .attr("d", areaUp)         
                            .style('opacity', 0.5)
                agent_prob.append('rect') // 收藏机构起讫年份
                            .attr('class', 'agent-exponentFlat')
                            .attr('x', timeScale(agent_time_break['adult']))
                            .attr('y', event_data['index'] % 2 === 0 ? sub_agent_height * (a + number_offset) : sub_agent_height * a)
                            .attr('width', Math.abs(timeScale(agent_time_break['downturn'])) - timeScale(agent_time_break['adult']))
                            .attr('height', Math.abs(probablity_ySacle(agent_time_break['maximum'] * exponentDown[0]['y']) - probablity_ySacle(0)))
                            .attr('fill', '#D9FFB4')
                            .style('opacity', 0.5)
                agent_prob.append("path")
                            .datum(exponentDown)
                            .attr('class', 'agent-exponentDown')
                            .attr('fill', '#D9FFB4')
                            .attr("d", areaDown)         
                            .style('opacity', 0.5)
                agent_prob.append('line')
                            .attr('x1', timeScale(cur_yearStart))
                            .attr('x2', timeScale(yearEnd))
                            .attr('transform', `translate(0,${sub_agent_height * (a + 1)})`)
                            .attr('stroke', '#5a3a20')
                            .attr('stroke-width', 0.5)
                            .style('visibility', a !== agent_interval['material_list'].length - 1 ? 'visible': 'hidden')
                            .style('opacity', 0.5)

                // 用于绘图更新wiki
                agent_prob.append('text')
                            .attr('x', $(".app").width() * 0.85 * 1.176 * (1 - margin.left - margin.right) - 2 * rem)
                            .attr('y', event_data['index'] % 2 === 0 ? sub_agent_height * (a + number_offset) : sub_agent_height * a)
                            .attr('text-anchor', 'end') // 设置文本锚点为右对齐
                            .attr('dy', 0.8 * rem)
                            .text('经手人物出生逝世')
                            .attr('font-size', rem * 0.8)
                            .attr('fill', 'brown')

                agent_source_type['born2death'] = true
                // break
            } else if (agent_interval['material_list'][a]['source_type'] === 'activity-officialPosition' && !agent_source_type['activity-officialPosition']) { // 官职变动
                const officialUp = await d3.json("data/time_reasoning/agent_logarithmic_up.json"),
                      officialDown = await d3.json("data/time_reasoning/agent_exponential_down.json")
                let agentOfficial = agent_interval['material_list'][a]['time_range']
                // 将无穷修改为数值
                if (agentOfficial[0] === null) {
                    agentOfficial[0] = yearStart
                }
                if (agentOfficial[1] === null) {
                    agentOfficial[1]= yearEnd
                }
                // console.log('agentOfficial', agentOfficial)
                const agent_time_break = DataProcess.judgeAgentTimeBreak(agentOfficial[0], agentOfficial[1], {exponentUp: officialUp, exponentDown: officialDown}, 'activity-officialPosition')

                probablity_ySacle.domain([0, agent_time_break['maximum'] * officialDown[0]['y']]) // 修改定义域
                                 .range(event_data['index'] % 2 === 0 ? [sub_agent_height * (a + 1 + number_offset), sub_agent_height * (a + number_offset)] : [sub_agent_height * a, sub_agent_height * (a + 1)]) // 修改值域

                const areaUp = d3.area()
                                    .x(d => timeScale(agent_time_break['born'] + d.x * ((agent_time_break['adult'] - agent_time_break['born']) / 10)))
                                    .y0(d => probablity_ySacle(0))
                                    .y1(d => probablity_ySacle(d.y * agent_time_break['maximum']))
                                    .curve(d3.curveNatural),
                      areaDown = d3.area()
                                    .x(d => timeScale(agent_time_break['downturn'] + d.x * ((agent_time_break['death'] - agent_time_break['downturn']) / 10)))
                                    .y0(d => probablity_ySacle(0))
                                    .y1(d => probablity_ySacle(d.y * agent_time_break['maximum']))
                                    .curve(d3.curveNatural)

                // 绘制 area chart
                agent_prob.append("path")
                            .datum(officialUp)
                            .attr('class', 'agent-officialUp')
                            .attr('fill', '#ACFF59')
                            .attr("d", areaUp)
                            .style('opacity', 0.7)
                agent_prob.append('rect') // 收藏机构起讫年份
                            .attr('class', 'agent-officialFlat')
                            .attr('x', timeScale(agent_time_break['adult']))
                            .attr('y', sub_agent_height * a)
                            .attr('width', Math.abs(timeScale(agent_time_break['downturn'])) - timeScale(agent_time_break['adult']))
                            .attr('height', Math.abs(probablity_ySacle(agent_time_break['maximum'] * officialDown[0]['y']) - probablity_ySacle(0)))
                            .attr('fill', '#ACFF59')
                            .style('opacity', 0.7)
                agent_prob.append("path")
                            .datum(officialDown)
                            .attr('class', 'agent-officialDown')
                            .attr('fill', '#ACFF59')
                            .attr("d", areaDown)
                            .style('opacity', 0.7)
                agent_prob.append('line')
                            .attr('x1', timeScale(cur_yearStart))
                            .attr('x2', timeScale(yearEnd))
                            .attr('transform', `translate(0,${sub_agent_height * (a + 1)})`)
                            .attr('stroke', '#5a3a20')
                            .attr('stroke-width', 0.5)
                            .style('visibility', a !== agent_interval['material_list'].length - 1 ? 'visible': 'hidden')
                            .style('opacity', 0.5)

                // 用于绘图更新wiki
                agent_prob.append('text')
                            .attr('x', $(".app").width() * 0.85 * 1.176 * (1 - margin.left - margin.right) - 2 * rem)
                            .attr('y', event_data['index'] % 2 === 0 ? sub_agent_height * (a + number_offset) : sub_agent_height * a)
                            .attr('text-anchor', 'end') // 设置文本锚点为右对齐
                            .attr('dy', 0.8 * rem)
                            .text('藏书者活动')
                            .attr('font-size', rem * 0.8)
                            .attr('fill', 'brown')

                // agent_source_type['activity-officialPosition'] = true // 可能都多个
            } else if (agent_interval['material_list'][a]['source_type'] === 'activity-transferRecord-blur' && !agent_source_type['activity-transferRecord-blur']) { // 藏书转移记录（模糊）
                const transferNormalBlur = await d3.json("data/time_reasoning/transfer_normal.json")
                let agent_transferBlur = agent_interval['material_list'][a]['time_range'] // [year, year]
                // 将无穷修改为数值
                if (agent_transferBlur[0] === null) {
                    agent_transferBlur[0] = (cur_yearStart + yearEnd) / 2
                }
                if (agent_transferBlur[1] === null) {
                    agent_transferBlur[1] = (cur_yearStart + yearEnd) / 2
                }

                // 直接使用judgeLibraryTimeBreak中的'transferRecord-blur'（'activity-transferRecord-blur'）的正态分布
                const normal_maxY = DataProcess.judgeLibraryTimeBreak(agent_transferBlur[0] - 2, agent_transferBlur[1] + 2, transferNormalBlur, 'activity-transferRecord-blur') // 前后offset_year = 4
                probablity_ySacle.domain([0, normal_maxY['maxinum']]) // 修改定义域
                                 .range(event_data['index'] % 2 === 0 ? [sub_agent_height * (a + 1 + number_offset), sub_agent_height * (a + number_offset)] : [sub_agent_height * a, sub_agent_height * (a + 1)]) // 修改值域
                const areaNormal = d3.area()
                                        .x(d => timeScale(agent_transferBlur[0] - 2 + (d.x + 5) * 4 / 10))
                                        .y0(d => probablity_ySacle(0))
                                        .y1(d => probablity_ySacle(d.y * normal_maxY['ratio']))
                                        .curve(d3.curveNatural)

                // 绘制 area chart
                agent_prob.append("path")
                            .datum(transferNormalBlur)
                            .attr('class', 'library-transfer-blur')
                            .attr('fill', '#F6AD8F')
                            .attr("d", areaNormal)         
                            .style('opacity', 0.7)
                agent_prob.append('line')
                            .attr('x1', timeScale(cur_yearStart))
                            .attr('x2', timeScale(yearEnd))
                            .attr('transform', `translate(0,${sub_agent_height * (a + 1)})`)
                            .attr('stroke', '#5a3a20')
                            .attr('stroke-width', 0.5)
                            .style('visibility', a !== agent_interval['material_list'].length - 1 ? 'visible': 'hidden')
                            .style('opacity', 0.5)

                // 用于绘图更新wiki
                agent_prob.append('text')
                            .attr('x', $(".app").width() * 0.85 * 1.176 * (1 - margin.left - margin.right) - 2 * rem)
                            .attr('y', event_data['index'] % 2 === 0 ? sub_agent_height * (a + number_offset) : sub_agent_height * a)
                            .attr('text-anchor', 'end') // 设置文本锚点为右对齐
                            .attr('dy', 0.8 * rem)
                            .text('藏书转移记录')
                            .attr('font-size', rem * 0.8)
                            .attr('fill', 'brown')

                // agent_source_type['activity-transferRecord-blur'] = true // 可能有多个
            }
        }
    }
    // 收藏机构(优先级 3)
    if (cur_reason_data['time_interval'].hasOwnProperty('library') && !cur_reason_data['time_interval'].hasOwnProperty('direct')) {
        const lib_interval = cur_reason_data['time_interval']['library']
        // 用于标志经手人物的史料文本类型是否找到
        let library_source_type = {
            'start2end': false,
            'transferRecord-clear': false, // 缺少这部分接口
            'transferRecord-blur': false
        }

        // const sub_library_height = lib_agent_height / lib_interval['material_list'].length
        const sub_library_height = lib_agent_height / material_num['library']
        
        lib_interval['material_list'] = DataProcess.libAgentMaterialSort(lib_interval['material_list'], 'library', event_data['index'] % 2 === 0 ? true: false) // 按照绘制顺序重排序

        for (let l = 0; l < lib_interval['material_list'].length; l++) {
            const number_offset = material_num['library'] - lib_interval['material_list'].length // 对于偶数（上层）的sub-timeline
            if (lib_interval['material_list'][l]['source_type'] === 'start2end' && !library_source_type['start2end']) { // 起讫年份
                let lib_start2end = lib_interval['material_list'][l]['time_range']
                // 将无穷修改为数值
                if (lib_start2end[0] === null) {
                    lib_start2end[0] = yearStart
                }
                if (lib_start2end[1] === null) {
                    lib_start2end[1]= yearEnd
                }
                // console.log('lib_start2end', lib_start2end)
                library_prob.append('rect') // 收藏机构起讫年份
                            .attr('class', 'library-start2end')
                            .attr('x', timeScale(lib_start2end[0]))
                            .attr('y', event_data['index'] % 2 === 0 ? sub_library_height * (l + number_offset) : sub_library_height * l)
                            .attr('width', Math.abs(timeScale(lib_start2end[1]) - timeScale(lib_start2end[0])))
                            .attr('height', sub_library_height)
                            .attr('fill', '#D4E9FF')
                            .style('opacity', 0.5)
                library_prob.append('line')
                            .attr('x1', timeScale(cur_yearStart))
                            .attr('x2', timeScale(yearEnd))
                            .attr('transform', `translate(0,${sub_library_height * (l + 1)})`)
                            .attr('stroke', '#5a3a20')
                            .attr('stroke-width', 0.5)
                            .style('visibility', l !== lib_interval['material_list'].length - 1 ? 'visible': 'hidden')
                            .style('opacity', 0.5)

                // 用于绘图更新wiki
                library_prob.append('text')
                            .attr('x', $(".app").width() * 0.85 * 1.176 * (1 - margin.left - margin.right) - 2 * rem)
                            .attr('y', event_data['index'] % 2 === 0 ? sub_library_height * (l + number_offset) : sub_library_height * l)
                            .attr('text-anchor', 'end') // 设置文本锚点为右对齐
                            .attr('dy', 0.8 * rem)
                            .text('收藏机构起讫年份')
                            .attr('font-size', rem * 0.8)
                            .attr('fill', 'brown')

                library_source_type['start2end'] = true
                // break
            } else if (lib_interval['material_list'][l]['source_type'] === 'transferRecord-blur' && !library_source_type['transferRecord-blur']) { // 藏书转移记录（模糊）
                const transferNormalBlur = await d3.json("data/time_reasoning/transfer_normal.json")
                let lib_transferBlur = lib_interval['material_list'][l]['time_range'] // [year, year]
                // 将无穷修改为数值
                if (lib_transferBlur[0] === null) {
                    lib_transferBlur[0] = (cur_yearStart + yearEnd) / 2
                }
                if (lib_transferBlur[1] === null) {
                    lib_transferBlur[1]= (cur_yearStart + yearEnd) / 2
                }

                const normal_maxY = DataProcess.judgeLibraryTimeBreak(lib_transferBlur[0] - 2, lib_transferBlur[1] + 2, transferNormalBlur, 'transferRecord-blur') // 前后offset_year = 4
                probablity_ySacle.domain([0, normal_maxY['maxinum']]) // 修改定义域
                                    .range(event_data['index'] % 2 === 0 ? [sub_library_height * (l + 1 + number_offset), sub_library_height * (l + number_offset)] : [sub_library_height * l, sub_library_height * (l + 1)]) // 修改值域
                const areaNormal = d3.area()
                                        .x(d => timeScale(lib_transferBlur[0] - 2 + (d.x + 5) * 4 / 10))
                                        .y0(d => probablity_ySacle(0))
                                        .y1(d => probablity_ySacle(d.y * normal_maxY['ratio']))
                                        .curve(d3.curveNatural)

                // 绘制 area chart
                library_prob.append("path")
                            .datum(transferNormalBlur)
                            .attr('class', 'library-transfer-blur')
                            .attr('fill', '#F6AD8F')
                            .attr("d", areaNormal)         
                            .style('opacity', 0.7)
                library_prob.append('line')
                            .attr('x1', timeScale(cur_yearStart))
                            .attr('x2', timeScale(yearEnd))
                            .attr('transform', `translate(0,${sub_library_height * (l + 1)})`)
                            .attr('stroke', '#5a3a20')
                            .attr('stroke-width', 0.5)
                            .style('visibility', l !== lib_interval['material_list'].length - 1 ? 'visible': 'hidden')
                            .style('opacity', 0.5)

                // 用于绘图更新wiki
                library_prob.append('text')
                            .attr('x', $(".app").width() * 0.85 * 1.176 * (1 - margin.left - margin.right) - 2 * rem)
                            .attr('y', event_data['index'] % 2 === 0 ? sub_library_height * (l + number_offset) : sub_library_height * l)
                            .attr('text-anchor', 'end') // 设置文本锚点为右对齐
                            .attr('dy', 0.8 * rem)
                            .text('藏书转移记录')
                            .attr('font-size', rem * 0.8)
                            .attr('fill', 'brown')

                // library_source_type['transferRecord-blur'] = true // 可能有多个
            }
        }
    }
    
}

// 绘制子时间轴(version 1)
export async function draw_sub_timeline_version2(oriTimeScale, reason_data, event_data, rem, material_num) {
    // 起始年份与结束年份(whole)
    let yearStart = 960,
        yearEnd = 1965,
        oriYearStep = 25
    console.log("reason_data", reason_data)
    // console.log("events_data", event_data)

    let cur_reason_data = null
    for (let i = 0; i < reason_data.length; i++) {
        if (reason_data[i].ori_idx === event_data.ori_idx) {        
            cur_reason_data = reason_data[i]
            break
        }
    }
    // console.log("cur_reason_data", cur_reason_data)

    const cur_yearStart = cur_reason_data['time_interval']['composite_interval'][0] === null ? 960 : cur_reason_data['time_interval']['composite_interval'][0] // Infinity
    // console.log('cur_yearStart', cur_yearStart)
    let timeScale = d3.scaleLinear() // 定义xScale
                        .domain([cur_yearStart, yearEnd])
                        .range([oriTimeScale(cur_yearStart), $(".app").width() * 0.85 * 1.176 * (1 - margin.left - margin.right)])
    
    // 更新yearStep
    let yearStep = oriYearStep * (yearEnd - yearStart) / (yearEnd - cur_yearStart)
    // 首先清除之前的group
    d3.select(`#sub-timeline-svg-${event_data['index'].toString()}`).selectAll('g').remove()
    // 然后再绘制
    let timeAxis_container = d3.select(`#sub-timeline-svg-${event_data['index'].toString()}`)
                                .append('g')
                                .attr('class', 'timeAxis-group')
    // console.log('timeAxis_container', d3.select(timeAxis_container)) // success
    let bottomAxis = d3.axisBottom(timeScale)
                        .ticks((yearEnd - yearStart) / yearStep)
                        .tickFormat((d) => d);
    let topAxis = d3.axisTop(timeScale)
                    .ticks((yearEnd - yearStart) / yearStep)
                    .tickFormat((d) => d);

    // let transY = document.getElementById(`sub-timeline-${event_data['index'].toString()}`).offsetHeight * (1 - 1 / 3.5) // 偶数
    let transY = event_data['index'] % 2 === 0 ?
                 document.getElementById(`sub-timeline-${event_data['index'].toString()}`).offsetHeight * (1 - 1 / 3.5)
                 : document.getElementById(`sub-timeline-${event_data['index'].toString()}`).offsetHeight * 1 / 3.5
    timeAxis_container.append("g")
                        .attr("transform", `translate(${0}, ${transY})`)
                        .call(event_data['index'] % 2 === 0 ? bottomAxis : topAxis)
                        .call((g) => {
                        g.select(".domain")
                            .attr("stroke", "#6a4c2a")
                            .attr("stroke-width", 2)
                            // .attr("transform", `translate(0, ${1.5})`);
                        g.selectAll(".tick")
                            .append("line")
                            .attr("stroke", "#ad9278")
                            .attr("y2", function (d) {
                                if (event_data['index'] % 2 === 0) { // axisBottom
                                    if (d % 100 === 0) return 5;
                                        else { return 3 }
                                } else { // axisTop
                                    if (d % 100 === 0) return -5;
                                        else { return -3 }
                                }
                            })
                            .attr("stroke-width", 1)
                            .style('visibility', (d) => d === 1960? 'hidden' : 'block')
                        g.selectAll("text")
                            .text(function (d) {
                                if (d == 0) return 1;
                                else return d;
                            })
                            .attr("font-size", function (d) {
                                if (d % 100 === 0) return rem / 2.5;
                                else return rem / 3;
                            })
                            .attr("dy", function (d) {
                                if (event_data['index'] % 2 === 0) { // axisBottom
                                    if (d % 100 === 0) return rem / 400;
                                    else return rem / 40;
                                } else { // axisTop
                                    if (d % 100 === 0) return - rem / 4;
                                    else return - rem / 4;
                                }
                            })
                            .attr('font-weight', (d) => d % 100 === 0 ? 'bold' : null)
                            .attr("fill", "#5a3a20")
                            .attr("alignment-baseline", "hanging")
                            // .style('visibility', (d) => d === 1960? 'hidden' : 'block')
                        });
    const { y: axis_top, height: axis_height } = timeAxis_container.node().getBBox()
    // console.log(timeAxis_container.node().getBBox()) // success
    const prob_container_offset = axis_top + axis_height
    let probability_container = d3.select(`#sub-timeline-svg-${event_data['index'].toString()}`) // library, agent, transferRecord
                                    .append('g')
                                    .attr('class', 'probability-group')
                                    .attr('transform', `translate(${0}, ${event_data['index'] % 2 === 0 ? 0
                                                                                  : prob_container_offset})`)    
    // let library_prob = probability_container.append('g')
    //                                         .attr('class', 'library-probablity-group')
    //                                         .attr('transform', `translate(${0}, ${event_data['index'] % 2 === 0 ? 0 
    //                                                 : prob_container_offset + document.getElementById(`sub-timeline-${event_data['index'].toString()}`).offsetHeight * 0})`),
    //     agent_prob = probability_container.append('g')
    //                                         .attr('class', 'agent-probablity-group')
    //                                         .attr('transform', `translate(${0}, ${event_data['index'] % 2 === 0 ? 0 
    //                                                 : prob_container_offset + document.getElementById(`sub-timeline-${event_data['index'].toString()}`).offsetHeight * 0})`),
    //     direct_prob = probability_container.append('g')
    //                                         .attr('class', 'direct-probablity-group')
    //                                         .attr('transform', `translate(${0}, ${event_data['index'] % 2 === 0 ? 0
    //                                                                               : prob_container_offset})`)

    // 绘制概率分布的svg(机构、人物)
    const lib_agent_height = document.getElementById(`sub-timeline-${event_data['index'].toString()}`).offsetHeight * 0.7
    // 定义 x 和 y 的比例尺(x比例尺直接使用上面定义的)
    let probablity_ySacle = d3.scaleLinear()
                                .domain([0, 1])
                                // .range([lib_agent_height, 0]);
                                .range(event_data['index'] % 2 === 0 ? [lib_agent_height, 0] : [0, lib_agent_height])

    // 按照层级顺序进行绘制
    let material_list = DataProcess.reorderMaterialSeq_v2(cur_reason_data['time_interval'])

    let time_span_group = probability_container.selectAll('.time-span-group')
                                                .data(material_list.filter(item => ['start2end', 'born2death'].includes(item.source_type)))
                                                .join("g")
                                                // .style('opacity', 0.7)
                                                .style('opacity', 0.15)
                                                .attr('class', 'time-span-group'),
        collect_activity_group = probability_container.selectAll('.collect-activity-group')
                                                        .data(material_list.filter(item => ['activity-officialPosition', 'activity-collectActivity'].includes(item.source_type)))
                                                        .join("g")
                                                        .attr('class', 'collect-activity-group'),
        transfer_record_group = probability_container.selectAll('.transfer-record-group')
                                                        .data(material_list.filter(item =>
                                                             ['transferRecord-blur', 'activity-transferRecord-blur', 'transferRecord-clear', 'activity-transferRecord-clear'].includes(item.source_type)))
                                                        .join("g")
                                                        .attr('class', 'transfer-record-group'),
        direct_material_group = probability_container.selectAll('.direct_material_group')
                                                        .data(material_list.filter(item => ['direct'].includes(item.source_type)))
                                                        .join("g")
                                                        .attr('class', 'direct_material_group')
                                    
    // 间接史料（旁证史料）-经手角色自身活动-存在的时间跨度
    direct_material_group.append('rect')
                            .attr('class', 'direct-material-rect')
                            .attr('x', d => timeScale(d['time_range'][0] === null ? 960 : d['time_range'][0]))
                            .attr('y', lib_agent_height / 4)
                            .attr('width', d => d['time_range'][0] === d['time_range'][1] ? Math.abs(timeScale(1001) - timeScale(1000)) // width为1年的跨度
                                : (Math.abs(timeScale(d['time_range'][1] === null ? 1964 : d['time_range'][1]) - timeScale(d['time_range'][0] === null ? 960 : d['time_range'][0]))))
                            .attr('height', lib_agent_height / 2)
                            .attr('fill', '#B54E24')
                            .append("title")
                                .text(d => `${d.source}%`)
    // 用于绘图更新wiki
    direct_material_group.append('text')
                            .attr('x', $(".app").width() * 0.85 * 1.176 * (1 - margin.left - margin.right) - 2 * rem)
                            .attr('y', lib_agent_height / 4)
                            .attr('text-anchor', 'end') // 设置文本锚点为右对齐
                            .attr('dy', 0.8 * rem)
                            .text('直接史料(题识、批点、夹笺等)')
                            .attr('font-size', rem * 0.8)
                            .attr('fill', 'brown')
    // version 1: 使用line
    // time_span_group.append('rect')
    //                 .attr('class', 'start-rect')
    //                 .attr('x', d => timeScale(d['time_range'][0] === null ? 960 : d['time_range'][0] - 0.5))
    //                 .attr('y', lib_agent_height / 4)
    //                 .attr('width', Math.abs(timeScale(1001) - timeScale(1000))) // width为1年的跨度
    //                 .attr('height', lib_agent_height / 2)
    //                 .attr('fill', d => d['upper_source_type'] === 'library' ? '#5EACFF' : '#80FF00')
    // time_span_group.append('rect')
    //                 .attr('class', 'end-rect')
    //                 .attr('x', d => timeScale(d['time_range'][1] === null ? 1964 : d['time_range'][1] - 0.5))
    //                 .attr('y', lib_agent_height / 4)
    //                 .attr('width', Math.abs(timeScale(1001) - timeScale(1000))) // width为1年的跨度
    //                 .attr('height', lib_agent_height / 2)
    //                 .attr('fill', d => d['upper_source_type'] === 'library' ? '#5EACFF' : '#80FF00')
    // time_span_group.append('line')
    //                 .attr('class', 'time-span-line')
    //                 .attr('x1', d => timeScale(d['time_range'][0] === null ? 960 : d['time_range'][0]))
    //                 .attr('x2', d => timeScale(d['time_range'][1] === null ? 1965 : d['time_range'][1]))
    //                 .attr("stroke", d => d['upper_source_type'] === 'library' ? '#5EACFF' : '#80FF00')
    //                 .attr('stroke-width', 1)
    //                 .attr('transform', d => d['upper_source_type'] === 'library' ? `translate(0,${lib_agent_height / 2 - 1.5})` : `translate(0,${lib_agent_height / 2 + 1.5})`)
    // version 2: 使用rect
    time_span_group.append('rect')
                    .attr('class', 'time-span-rect')
                    .attr('x', d => timeScale(d['time_range'][0] === null ? 960 : d['time_range'][0]))
                    .attr('y', lib_agent_height / 4)
                    .attr('width', d => d['time_range'][0] === d['time_range'][1] ? Math.abs(timeScale(1001) - timeScale(1000)) // width为1年的跨度
                        : (Math.abs(timeScale(d['time_range'][1] === null ? 1964 : d['time_range'][1]) - timeScale(d['time_range'][0] === null ? 960 : d['time_range'][0]))))
                    .attr('height', lib_agent_height / 2)
                    .attr('fill', d => d['upper_source_type'] === 'library' ? '#5EACFF' : '#79F300')
                    .append("title")
                        .text(d => `${d.source}`)
    // version 1: 其他时间跨度统一使用rect表示
    // collect_activity_group.append('rect')
    //                         .attr('class', 'collect-activity-rect')
    //                         .attr('x', d => timeScale(d['time_range'][0] === null ? 960 : d['time_range'][0]))
    //                         .attr('y', lib_agent_height / 4)
    //                         .attr('width', d => d['time_range'][0] === d['time_range'][1] ? Math.abs(timeScale(1001) - timeScale(1000)) // width为1年的跨度
    //                         : (Math.abs(timeScale(d['time_range'][1] === null ? 1964 : d['time_range'][1]) - timeScale(d['time_range'][0] === null ? 960 : d['time_range'][0]))))
    //                         .attr('height', lib_agent_height / 2)
    //                         .attr('fill', d => d['upper_source_type'] === 'library' ? '#5EACFF' : '#80FF00')
    // transfer_record_group.append('rect')
    //                         .attr('class', 'transfer_record_group')
    //                         .attr('x', d => timeScale(d['time_range'][0] === null ? 960 : d['time_range'][0]))
    //                         .attr('y', lib_agent_height / 4)
    //                         .attr('width', d => d['time_range'][0] === d['time_range'][1] ? Math.abs(timeScale(1001) - timeScale(1000)) // width为1年的跨度
    //                         : (Math.abs(timeScale(d['time_range'][1] === null ? 1964 : d['time_range'][1]) - timeScale(d['time_range'][0] === null ? 960 : d['time_range'][0]))))
    //                         .attr('height', lib_agent_height / 2)
    //                         .attr('fill', d => d['upper_source_type'] === 'library' ? '#5EACFF' : '#80FF00')
    // version 2: 其他时间跨度使用line表示
    collect_activity_group.append('rect')
                    .attr('class', 'start-rect')
                    .attr('x', d => timeScale(d['time_range'][0] === null ? 960 : d['time_range'][0] - 0.5))
                    .attr('y', lib_agent_height / 4) // 完全
                    // .attr('y', lib_agent_height / 2) // 完全
                    .attr('width', Math.abs(timeScale(1001) - timeScale(1000))) // width为1年的跨度
                    // .attr('height', lib_agent_height / 2) // 完全
                    .attr('height', lib_agent_height / 2) // 完全
                    .attr('height', lib_agent_height / 4)
                    .attr('fill', d => d['upper_source_type'] === 'library' ? '#5EACFF' : '#79F300')
                    .append("title")
                        .text(d => `${d.source}`)
    collect_activity_group.append('rect')
                    .attr('class', 'end-rect')
                    .attr('x', d => timeScale(d['time_range'][1] === null ? 1964 : d['time_range'][1] - 0.5))
                    .attr('y', lib_agent_height / 4) // 完全
                    // .attr('y', lib_agent_height / 2) // 完全
                    .attr('width', Math.abs(timeScale(1001) - timeScale(1000))) // width为1年的跨度
                    // .attr('height', lib_agent_height / 2) // 完全
                    .attr('height', lib_agent_height / 2) // 完全
                    .attr('height', lib_agent_height / 4)
                    .attr('fill', d => d['upper_source_type'] === 'library' ? '#5EACFF' : '#79F300')
                    .append("title")
                        .text(d => `${d.source}`)
    collect_activity_group.append('line')
                    .attr('class', 'time-span-line')
                    .attr('x1', d => timeScale(d['time_range'][0] === null ? 960 : d['time_range'][0]))
                    .attr('x2', d => timeScale(d['time_range'][1] === null ? 1965 : d['time_range'][1]))
                    .attr("stroke", d => d['upper_source_type'] === 'library' ? '#5EACFF' : '#79F300')
                    // .attr('stroke-width', rem / 1) // 完全
                    .attr('stroke-width', rem / 3)
                    // .attr('transform', `translate(0,${lib_agent_height / 2})`) //完全
                    .attr('transform', `translate(0,${lib_agent_height * 3 / 8})`)
                    .append("title")
                        .text(d => `${d.source}`)
    // 用于绘图更新wiki
    collect_activity_group.append('text')
                            .attr('x', $(".app").width() * 0.85 * 1.176 * (1 - margin.left - margin.right) - 2 * rem)
                            .attr('y', lib_agent_height / 4)
                            .attr('text-anchor', 'end') // 设置文本锚点为右对齐
                            .attr('dy', 0.8 * rem)
                            .text('藏书积极性描述')
                            .attr('font-size', rem * 0.8)
                            .attr('fill', 'brown')

    transfer_record_group.append('rect')
                    .attr('class', 'start-rect')
                    .attr('x', d => timeScale(d['time_range'][0] === null ? 960 : d['time_range'][0] - 0.5))
                    // .attr('y', lib_agent_height / 4) // 完全
                    .attr('y', lib_agent_height / 2) // 完全
                    .attr('width', Math.abs(timeScale(1001) - timeScale(1000))) // width为1年的跨度
                    // .attr('height', lib_agent_height / 2) // 完全
                    .attr('height', lib_agent_height / 2) // 完全
                    .attr('height', lib_agent_height / 4)
                    // .attr('fill', d => d['upper_source_type'] === 'library' ? '#5EACFF' : '#79F300')
                    .attr('fill', '#FB8F62')
                    .append("title")
                        .text(d => `${d.source}`)
    transfer_record_group.append('rect')
                    .attr('class', 'end-rect')
                    .attr('x', d => timeScale(d['time_range'][1] === null ? 1964 : d['time_range'][1] - 0.5))
                    // .attr('y', lib_agent_height / 4) // 完全
                    .attr('y', lib_agent_height / 2) // 完全
                    .attr('width', Math.abs(timeScale(1001) - timeScale(1000))) // width为1年的跨度
                    // .attr('height', lib_agent_height / 2) // 完全
                    .attr('height', lib_agent_height / 2) // 完全
                    .attr('height', lib_agent_height / 4)
                    // .attr('fill', d => d['upper_source_type'] === 'library' ? '#5EACFF' : '#79F300')
                    .attr('fill', '#FB8F62')
                    .append("title")
                        .text(d => `${d.source}`)
    transfer_record_group.append('line')
                    .attr('class', 'time-span-line')
                    .attr('x1', d => timeScale(d['time_range'][0] === null ? 960 : d['time_range'][0]))
                    .attr('x2', d => timeScale(d['time_range'][1] === null ? 1965 : d['time_range'][1]))
                    // .attr("stroke", d => d['upper_source_type'] === 'library' ? '#5EACFF' : '#79F300')
                    .attr('fill', '#FB8F62')
                    // .attr('stroke-width', rem / 1) // 完全
                    .attr('stroke-width', rem / 3)
                    // .attr('transform', `translate(0,${lib_agent_height / 2})`) //完全
                    .attr('transform', `translate(0,${lib_agent_height * 5 / 8})`)
                    .append("title")
                        .text(d => `${d.source}`)
    // 用于绘图更新wiki
    transfer_record_group.append('text')
                            .attr('x', $(".app").width() * 0.85 * 1.176 * (1 - margin.left - margin.right) - 2 * rem)
                            .attr('y', lib_agent_height / 2)
                            .attr('text-anchor', 'end') // 设置文本锚点为右对齐
                            .attr('dy', 0.8 * rem)
                            .text('机构兴衰/人物官职变化')
                            .attr('font-size', rem * 0.8)
                            .attr('fill', 'brown')
}

export function probabilityDivPara(reasoning_data, ori_idx_str) { // reasoning_data is from a single event
    let single_data = null
    for (let e = 0; e < reasoning_data.length; e++) {
        if (reasoning_data[e]['ori_idx'].toString() === ori_idx_str) { // string
            const time_interval = reasoning_data[e]['time_interval']
            reasoning_data[e]['divShow'] = {
                direct: false,
                indirect: {
                    library: false,
                    agent: false
                },
                material_num: { // 史料数目(决定div rowHeight的大小)
                    // direct: 0,
                    library: 0,
                    agent: 0,
                    total: 0,
                    total_spurious: 0
                }
            }
            if (time_interval.hasOwnProperty('direct')) { // 存在direct史料
                reasoning_data[e]['divShow']['direct'] = true
                // reasoning_data[e]['divShow']['material_num']['direct'] += 1
                reasoning_data[e]['divShow']['material_num']['total'] += 1
            }
            if (time_interval.hasOwnProperty('library')) { // 存在library史料
                reasoning_data[e]['divShow']['indirect']['library'] = true
                reasoning_data[e]['divShow']['material_num']['library'] += (time_interval['library']['material_list'].length + 1)
                reasoning_data[e]['divShow']['material_num']['total'] += (time_interval['library']['material_list'].length + 1) // 存在一个综合
            }
            if (time_interval.hasOwnProperty('agent')) { // 存在agent史料
                reasoning_data[e]['divShow']['indirect']['agent'] = true
                reasoning_data[e]['divShow']['material_num']['agent'] += (time_interval['agent']['material_list'].length + 1)
                reasoning_data[e]['divShow']['material_num']['total'] += (time_interval['agent']['material_list'].length + 1) // 存在一个综合
            }
            // 用于计算rowHeight时
            reasoning_data[e]['divShow']['material_num']['total_spurious'] = reasoning_data[e]['divShow']['material_num']['total']
            if (!reasoning_data[e]['divShow']['direct']) { // direct = 0
                reasoning_data[e]['divShow']['material_num']['total_spurious'] += 1
            }
            if (!reasoning_data[e]['divShow']['indirect']['library']) { // library = 0
                reasoning_data[e]['divShow']['material_num']['total_spurious'] += 1
            }
            if (!reasoning_data[e]['divShow']['indirect']['agent']) { // agent = 0
                reasoning_data[e]['divShow']['material_num']['total_spurious'] += 1
            }
            single_data = jsonCopy(reasoning_data[e])
            break
        }
    }
    // console.log('reasoning_data', reasoning_data)
    return {
        total_data: reasoning_data,
        single_data: single_data
    }
}

// 计算indirect中library和agent div param
export function computeIndirectDivPara(indirectCard, singleDataDetail) {
    // let indirect_el_card = document.getElementById('indirect-el-card')
    // 正常情况下，library和agent都有相关史料
    let material_div_height = indirectCard.height * 0.9 / (singleDataDetail['divShow']['material_num']['library'] + singleDataDetail['divShow']['material_num']['agent'])
    // 有至少一类史料不存在
    if (!(singleDataDetail['divShow']['indirect']['library'] && singleDataDetail['divShow']['indirect']['agent'])) {
        // 不存在library
        if (!singleDataDetail['divShow']['indirect']['library'] && singleDataDetail['divShow']['indirect']['agent']) { // 没有library, 但是有agent
            indirectCard['library']['height'] = DataProcess.vhToPx(85 * 0.1)
            indirectCard['agent']['height'] = indirectCard.height * 0.9 - indirectCard['library']['height'] - DataProcess.vhToPx(85 * 0.05)
        } else if (!singleDataDetail['divShow']['indirect']['agent'] && singleDataDetail['divShow']['indirect']['library']) { // 没有agent, 但是有library
            indirectCard['agent']['height'] = DataProcess.vhToPx(85 * 0.1)
            indirectCard['library']['height'] = indirectCard.height * 0.9 - indirectCard['agent']['height'] - DataProcess.vhToPx(85 * 0.05)
        } else { // 2个都不存在
            indirectCard['library']['height'] = DataProcess.vhToPx(85 * 0.1)
            indirectCard['agent']['height'] = DataProcess.vhToPx(85 * 0.1)
        }
    } else { // 2种史料都存在
        // sub-el-card height
        indirectCard['library']['height'] = material_div_height * singleDataDetail['divShow']['material_num']['library']
        indirectCard['agent']['height'] = material_div_height * singleDataDetail['divShow']['material_num']['agent']
    }
    // sub-el-card style.top
    indirectCard['library']['top'] = DataProcess.vhToPx(5)
    indirectCard['agent']['top'] = DataProcess.vhToPx(6) + indirectCard['library']['height']
    // console.log('indirectCard', indirectCard)
    return indirectCard
}

// 绘制概率分布area chart
// material：{time_range, source, source_type, sub_weight}
// sub_type: library, agent
export function renderProbabilityAreaChart(material, sub_type, ori_idx, index, composite_interval) { // ori_idx / index is Number type
    if (sub_type === 'library') {
        if (ori_idx !== null) { // 单独史料
            if (material['source_type'] === 'start2end') { // 收藏机构起讫, gamma分布
                // gammaAreaChart(material, ori_idx, index, composite_interval) // 弃用
                libraryRect(material, ori_idx, index, composite_interval) // 使用rect
            } else if (material['source_type'] === 'transferRecord-blur') { // 藏书转移记录（模糊）
                normalAreaChart(material, ori_idx, index, composite_interval, 'library')
            } else if (material['source_type'] === 'transferRecord-clear') { // 藏书转移记录（清晰）
                transferRecordClearRect(material, ori_idx, index, composite_interval, 'library')
            }
        } else { // 复合加权概率
            // 待添加
        }     
    } else if (sub_type === 'agent') {
        if (ori_idx !== null) { // 单独史料
            if (material['source_type'] === 'born2death') { // 经手人物出生逝世
                agentBorn2Death(material, ori_idx, index, composite_interval)
            } else if (material['source_type'] === 'activity-officialPosition') { // 官职变动
                agentOfficialPosition(material, ori_idx, index, composite_interval)
            } else if (material['source_type'] === 'activity-transferRecord-clear') { // 藏书转移记录（清晰）
                transferRecordClearRect(material, ori_idx, index, composite_interval, 'agent')
            } else if (material['source_type'] === 'activity-transferRecord-blur') { // 藏书转移记录（模糊）
                normalAreaChart(material, ori_idx, index, composite_interval, 'agent')
            }
        } else { // 复合加权概率
            // 待添加
        }
    } else if (sub_type === 'direct') { // material的格式有所改动, index = null
        if (ori_idx !== null) {
            directRect(material, ori_idx, composite_interval)
        }
    }
}

// direct, 藏书转移记录(clear)
function directRect(material, ori_idx, composite_interval) {
    let start_year = 960,
        end_year = 1965,
        year_step = 25
    const svgQuery = $(`#event-${ori_idx.toString()}-direct-source`)
    const width_range = [svgQuery.width() * marginSVG.left, svgQuery.width() * (1 - marginSVG.right)],
          height_range = [svgQuery.height() * marginSVG.top, svgQuery.height() * (1 - marginSVG.bottom)]

    // 创建 SVG group 元素
    // 首先清除其他的group
    d3.select(`#event-${ori_idx.toString()}-direct-source`).selectAll('g').remove()
    let svg = d3.select(`#event-${ori_idx.toString()}-direct-source`)
                .append('g')
    // 按照整体跨度来算
    // start_year = composite_interval[0] === null ? start_year : composite_interval[0]
    // end_year = composite_interval[1] === null ? end_year : composite_interval[1]
    year_step = Math.abs(end_year - start_year) * year_step / (1965 - 960)
    
    // 用于修改x坐标的start_year和end_year, 仅对于当前史料
    let cur_start_year = material['time_range'][0] === null ? start_year : material['time_range'][0],
        cur_end_year = material['time_range'][1] === null ? end_year : material['time_range'][1]
    // console.log(cur_start_year, cur_end_year)
    // 判断start_year和end_year是否为同一年
    if (cur_start_year === cur_end_year) {
        cur_start_year -= 0.5
        cur_end_year += 0.5
    }
    // 定义 x 和 y 的比例尺
    const xScale = d3.scaleLinear()
                        .domain([start_year, end_year])
                        .range([width_range[0], width_range[1]])
    svg.append('rect')
        .attr('x', xScale(cur_start_year))
        .attr('y', 0)
        .attr('width', Math.abs(xScale(cur_end_year) - xScale(cur_start_year)))
        .attr('height', height_range[1])
        .attr('fill', '#F6AD8F')
        // .style('opacity', 0.7)
    // 添加 x 轴
    svg.append("g")
        .attr("transform", `translate(0, ${height_range[1]})`)
        // .call(d3.axisBottom(xScale))
        .call(d3
            .axisBottom(xScale)
            .ticks((end_year - start_year) / year_step)
            .tickFormat((d) => d))
}

// 机构起讫年份: gamma分布(使用rect代替gamma分布, 取消async)
async function gammaAreaChart(material, ori_idx, index, composite_interval) { // ori_idx / index is Number type
    let start_year = 960,
        end_year = 1965,
        year_step = 25
    const svgQuery = $(`#event-${ori_idx.toString()}-library-source-${index.toString()}`)
    const width_range = [svgQuery.width() * marginSVG.left, svgQuery.width() * (1 - marginSVG.right)],
          height_range = [svgQuery.height() * marginSVG.top, svgQuery.height() * (1 - marginSVG.bottom)]
    // 创建 SVG group 元素
    // 首先清除其他的group
    d3.select(`#event-${ori_idx.toString()}-library-source-${index.toString()}`).selectAll('g').remove()
    let svg = d3.select(`#event-${ori_idx.toString()}-library-source-${index.toString()}`)
                .append('g')
    // console.log($(`#event-${ori_idx.toString()}-library-source-${index.toString()}`).width()) // success
    // 定义 gamma 分布的参数
    const shape = 2; // 形状参数
    const scale = 1; // 尺度参数

    // 生成 gamma 分布的数据
    // 按照当前史料的时间跨度来算(舍弃)
    // start_year = material['time_range'][0] === null ? start_year : material['time_range'][0]
    // end_year = material['time_range'][1] === null ? end_year : material['time_range'][1]
    // 按照整体跨度来算
    start_year = composite_interval[0] === null ? start_year : composite_interval[0]
    end_year = composite_interval[1] === null ? end_year : composite_interval[1]
    year_step = Math.abs(end_year - start_year) * year_step / (1965 - 960)

    let gammaData = await d3.json("data/time_reasoning/library_gamma.json");

    // 用于修改x坐标的start_year和end_year，仅对于当前史料
    let cur_start_year = material['time_range'][0] === null ? start_year : material['time_range'][0],
        cur_end_year = material['time_range'][1] === null ? end_year : material['time_range'][1]
    gammaData = DataProcess.substituteJsonX(gammaData, [cur_start_year, cur_end_year])
    console.log('gammaData', gammaData)

    // 定义 x 和 y 的比例尺
    const xScale = d3.scaleLinear()
                        .domain([start_year, end_year])
                        .range([width_range[0], width_range[1]]);

    const yScale = d3.scaleLinear()
                        .domain([0, d3.max(gammaData, d => d.y)])
                        .range([height_range[1], height_range[0]]);

    // 创建 area 生成器
    const area = d3.area()
                    .x(d => xScale(d.x))
                    .y0(height_range[1])
                    .y1(d => yScale(d.y))
                    .curve(d3.curveNatural); // 可以选择不同的曲线插值方式

    // 绘制 area chart
    svg.append("path")
        .datum(gammaData)
        .attr("fill", "steelblue")
        .attr("d", area);

    // 添加 x 轴
    svg.append("g")
        .attr("transform", `translate(0, ${height_range[1]})`)
        // .call(d3.axisBottom(xScale))
        .call(d3
            .axisBottom(xScale)
            .ticks((end_year - start_year) / year_step)
            .tickFormat((d) => d))

    // 添加 y 轴
    // svg.append("g")
    //     .call(d3.axisLeft(yScale));
}

// 机构rect
function libraryRect(material, ori_idx, index, composite_interval) { // ori_idx / index is Number type
    let start_year = 960,
        end_year = 1965,
        year_step = 25
    const svgQuery = $(`#event-${ori_idx.toString()}-library-source-${index.toString()}`)
    const width_range = [svgQuery.width() * marginSVG.left, svgQuery.width() * (1 - marginSVG.right)],
          height_range = [svgQuery.height() * marginSVG.top, svgQuery.height() * (1 - marginSVG.bottom)]
    // 创建 SVG group 元素
    // 首先清除其他的group
    d3.select(`#event-${ori_idx.toString()}-library-source-${index.toString()}`).selectAll('g').remove()
    let svg = d3.select(`#event-${ori_idx.toString()}-library-source-${index.toString()}`)
                .append('g')

    // 按照整体跨度来算
    start_year = composite_interval[0] === null ? start_year : composite_interval[0]
    end_year = composite_interval[1] === null ? end_year : composite_interval[1]
    year_step = Math.abs(end_year - start_year) * year_step / (1965 - 960)

    // 用于修改x坐标的start_year和end_year，仅对于当前史料
    let cur_start_year = material['time_range'][0] === null ? start_year : material['time_range'][0],
        cur_end_year = material['time_range'][1] === null ? end_year : material['time_range'][1]

    // 定义 x 和 y 的比例尺
    const xScale = d3.scaleLinear()
                        .domain([start_year, end_year])
                        .range([width_range[0], width_range[1]]);
    svg.append('rect')
        .attr('x', width_range[0])
        .attr('y', 0)
        .attr('width', Math.abs((width_range[1] - width_range[0]) * (cur_end_year - cur_start_year) / (end_year - start_year)))
        .attr('height', Math.abs(height_range[1] - height_range[0]))
        .attr('fill', '#D4E9FF')
        .style('opacity', 0.7)
    // 添加 x 轴
    svg.append("g")
        .attr("transform", `translate(0, ${height_range[1]})`)
        // .call(d3.axisBottom(xScale))
        .call(d3
            .axisBottom(xScale)
            .ticks((end_year - start_year) / year_step)
            .tickFormat((d) => d))
}

// transferRecordClear(机构/人物)
function transferRecordClearRect(material, ori_idx, index, composite_interval, source_type) { // source_type can be 'library' or 'agent'
    let start_year = 960,
        end_year = 1965,
        year_step = 25

    // 按照整体跨度来算
    start_year = composite_interval[0] === null ? start_year : composite_interval[0]
    end_year = composite_interval[1] === null ? end_year : composite_interval[1]
    year_step = Math.abs(end_year - start_year) * year_step / (1965 - 960)
    // 用于修改x坐标的start_year和end_year，仅对于当前史料
    let cur_start_year = material['time_range'][0] === null ? start_year : material['time_range'][0],
        cur_end_year = material['time_range'][1] === null ? end_year : material['time_range'][1]

    if (source_type === 'library') {
        const svgQuery = $(`#event-${ori_idx.toString()}-library-source-${index.toString()}`)
        const width_range = [svgQuery.width() * marginSVG.left, svgQuery.width() * (1 - marginSVG.right)],
              height_range = [svgQuery.height() * marginSVG.top, svgQuery.height() * (1 - marginSVG.bottom)]
        // 创建 SVG group 元素
        // 首先清除其他的group
        d3.select(`#event-${ori_idx.toString()}-library-source-${index.toString()}`).selectAll('g').remove()
        let svg = d3.select(`#event-${ori_idx.toString()}-library-source-${index.toString()}`)
                    .append('g')
    
        // 定义 x 和 y 的比例尺
        const xScale = d3.scaleLinear()
                            .domain([start_year, end_year])
                            .range([width_range[0], width_range[1]]);
        svg.append('rect')
            .attr('x', xScale(cur_start_year - 0.5))
            .attr('y', 0)
            .attr('width', Math.abs(xScale(cur_end_year + 0.5) - xScale(cur_start_year - 0.5)))
            .attr('height', Math.abs(height_range[1] - height_range[0]))
            .attr('fill', '#F6AD8F')
            .style('opacity', 0.7)
        // 添加 x 轴
        svg.append("g")
            .attr("transform", `translate(0, ${height_range[1]})`)
            // .call(d3.axisBottom(xScale))
            .call(d3
                .axisBottom(xScale)
                .ticks((end_year - start_year) / year_step)
                .tickFormat((d) => d))
    } else if (source_type === 'agent') {
        const svgQuery = $(`#event-${ori_idx.toString()}-agent-source-${index.toString()}`)
        const width_range = [svgQuery.width() * marginSVG.left, svgQuery.width() * (1 - marginSVG.right)],
            height_range = [svgQuery.height() * marginSVG.top, svgQuery.height() * (1 - marginSVG.bottom)]
        // 创建 SVG group 元素
        // 首先清除其他的group
        d3.select(`#event-${ori_idx.toString()}-agent-source-${index.toString()}`).selectAll('g').remove()
        let svg = d3.select(`#event-${ori_idx.toString()}-agent-source-${index.toString()}`)
                    .append('g')

        // 定义 x 和 y 的比例尺
        const xScale = d3.scaleLinear()
                            .domain([start_year, end_year])
                            .range([width_range[0], width_range[1]]);
        svg.append('rect')
            .attr('x', xScale(cur_start_year - 0.5))
            .attr('y', 0)
            .attr('width', Math.abs(xScale(cur_end_year + 0.5) - xScale(cur_start_year - 0.5)))
            .attr('height', Math.abs(height_range[1] - height_range[0]))
            .attr('fill', '#F6AD8F')
            .style('opacity', 0.7)
        // 添加 x 轴
        svg.append("g")
            .attr("transform", `translate(0, ${height_range[1]})`)
            // .call(d3.axisBottom(xScale))
            .call(d3
                .axisBottom(xScale)
                .ticks((end_year - start_year) / year_step)
                .tickFormat((d) => d))
    }  
}

async function normalAreaChart(material, ori_idx, index, composite_interval, source_type) {
    let start_year = 960,
        end_year = 1965,
        year_step = 25

    // 生成 normal 分布的数据
    // start_year = material['time_range'][0] === null ? start_year : material['time_range'][0]
    // end_year = material['time_range'][1] === null ? end_year : material['time_range'][1]
    start_year = composite_interval[0] === null ? start_year : composite_interval[0]
    end_year = composite_interval[1] === null ? end_year : composite_interval[1]
    year_step = Math.abs(end_year - start_year) * year_step / (1965 - 960)

    let normalData = await d3.json("data/time_reasoning/transfer_normal.json");

    // 用于修改x坐标的start_year和end_year，仅对于当前史料
    let cur_start_year = material['time_range'][0] === null ? start_year : material['time_range'][0],
        cur_end_year = material['time_range'][1] === null ? end_year : material['time_range'][1]
    normalData = DataProcess.substituteNormalX(normalData, [cur_start_year, cur_end_year])
    // console.log('normalData', normalData)
    if (source_type === 'library') {
        const svgQuery = $(`#event-${ori_idx.toString()}-library-source-${index.toString()}`)
        // console.log("svgQuery", svgQuery)
        const width_range = [svgQuery.width() * marginSVG.left, svgQuery.width() * (1 - marginSVG.right)],
              height_range = [svgQuery.height() * marginSVG.top, svgQuery.height() * (1 - marginSVG.bottom)]
        // 创建 SVG group 元素
        // 首先清除其他的group
        d3.select(`#event-${ori_idx.toString()}-library-source-${index.toString()}`).selectAll('g').remove()
        let svg = d3.select(`#event-${ori_idx.toString()}-library-source-${index.toString()}`)
                    .append('g')
        // console.log($(`#event-${ori_idx.toString()}-library-source-${index.toString()}`).width()) // success
        // 定义 x 和 y 的比例尺
        const xScale = d3.scaleLinear()
                            .domain([start_year, end_year])
                            .range([width_range[0], width_range[1]]);
    
        const yScale = d3.scaleLinear()
                            .domain([0, d3.max(normalData, d => d.y)])
                            .range([height_range[1], height_range[0]]);
    
        // 创建 area 生成器
        const area = d3.area()
                        .x(d => xScale(d.x))
                        .y0(height_range[1])
                        .y1(d => yScale(d.y))
                        .curve(d3.curveNatural); // 可以选择不同的曲线插值方式
        
        // 绘制 area chart
        svg.append("path")
            .datum(normalData)
            .attr("fill", "#F6AD8F")
            .attr("d", area);
    
        // 添加 x 轴
        svg.append("g")
            .attr("transform", `translate(0, ${height_range[1]})`)
            // .call(d3.axisBottom(xScale))
            .call(d3
                .axisBottom(xScale)
                .ticks((end_year - start_year) / year_step)
                .tickFormat((d) => d))
    
        // 添加 y 轴
        // svg.append("g")
        //     .call(d3.axisLeft(yScale));
    } else if (source_type === 'agent') {
        const svgQuery = $(`#event-${ori_idx.toString()}-agent-source-${index.toString()}`)
        // console.log("svgQuery", svgQuery)
        const width_range = [svgQuery.width() * marginSVG.left, svgQuery.width() * (1 - marginSVG.right)],
              height_range = [svgQuery.height() * marginSVG.top, svgQuery.height() * (1 - marginSVG.bottom)]
        // 创建 SVG group 元素
        // 首先清除其他的group
        d3.select(`#event-${ori_idx.toString()}-agent-source-${index.toString()}`).selectAll('g').remove()
        let svg = d3.select(`#event-${ori_idx.toString()}-agent-source-${index.toString()}`)
                    .append('g')
        // 定义 x 和 y 的比例尺
        const xScale = d3.scaleLinear()
                            .domain([start_year, end_year])
                            .range([width_range[0], width_range[1]]);
    
        const yScale = d3.scaleLinear()
                            .domain([0, d3.max(normalData, d => d.y)])
                            .range([height_range[1], height_range[0]]);
    
        // 创建 area 生成器
        const area = d3.area()
                        .x(d => xScale(d.x))
                        .y0(height_range[1])
                        .y1(d => yScale(d.y))
                        .curve(d3.curveNatural); // 可以选择不同的曲线插值方式
        
        // 绘制 area chart
        svg.append("path")
            .datum(normalData)
            .attr("fill", "#F6AD8F")
            .attr("d", area);
    
        // 添加 x 轴
        svg.append("g")
            .attr("transform", `translate(0, ${height_range[1]})`)
            // .call(d3.axisBottom(xScale))
            .call(d3
                .axisBottom(xScale)
                .ticks((end_year - start_year) / year_step)
                .tickFormat((d) => d))
    
        // 添加 y 轴
        // svg.append("g")
        //     .call(d3.axisLeft(yScale));
    }
}

// 人物born2death的概率分布
async function agentBorn2Death(material, ori_idx, index, composite_interval) {
    let start_year = 960,
        end_year = 1965,
        year_step = 25

    start_year = composite_interval[0] === null ? start_year : composite_interval[0]
    end_year = composite_interval[1] === null ? end_year : composite_interval[1]
    year_step = Math.abs(end_year - start_year) * year_step / (1965 - 960)

    const svgQuery = $(`#event-${ori_idx.toString()}-agent-source-${index.toString()}`)
    // console.log("svgQuery", svgQuery)
    const width_range = [svgQuery.width() * marginSVG.left, svgQuery.width() * (1 - marginSVG.right)],
          height_range = [svgQuery.height() * marginSVG.top, svgQuery.height() * (1 - marginSVG.bottom)]
    // 首先清除其他的group
    d3.select(`#event-${ori_idx.toString()}-agent-source-${index.toString()}`).selectAll('g').remove()
    // 创建 SVG group 元素
    const exponentUp = await d3.json("data/time_reasoning/agent_exponential_up.json"),
          exponentDown = await d3.json("data/time_reasoning/agent_exponential_down.json")

    // 用于修改x坐标的start_year和end_year，仅对于当前史料
    let cur_start_year = material['time_range'][0] === null ? start_year : material['time_range'][0],
        cur_end_year = material['time_range'][1] === null ? end_year : material['time_range'][1]
    let svg = d3.select(`#event-${ori_idx.toString()}-agent-source-${index.toString()}`)
                .append('g')
    // 定义 x 和 y 的比例尺
    const xScale = d3.scaleLinear()
                    .domain([start_year, end_year])
                    .range([width_range[0], width_range[1]]);
    const yScale = d3.scaleLinear()
                    .domain([0, d3.max(exponentDown, d => d.y)])
                    .range([height_range[1], height_range[0]]);

    const agent_time_break = DataProcess.judgeAgentTimeBreak(cur_start_year, cur_end_year, {exponentUp: exponentUp, exponentDown: exponentDown}, 'born2death')
    const areaUp = d3.area()
                        .x(d => xScale(agent_time_break['born'] + d.x * ((agent_time_break['adult'] - agent_time_break['born']) / 10)))
                        .y0(d => yScale(0))
                        .y1(d => yScale(d.y))
                        .curve(d3.curveNatural),
          areaDown = d3.area()
                        .x(d => xScale(agent_time_break['downturn'] + d.x * ((agent_time_break['death'] - agent_time_break['downturn']) / 10)))
                        .y0(d => yScale(0))
                        .y1(d => yScale(d.y))
                        .curve(d3.curveNatural)

    // 绘制 area chart
    svg.append("path")
        .datum(exponentUp)
        .attr('class', 'agent-exponentUp')
        .attr('fill', '#D9FFB4')
        .attr("d", areaUp)         
        .style('opacity', 0.5)
    svg.append('rect') // 收藏机构起讫年份
        .attr('class', 'agent-exponentFlat')
        .attr('x', xScale(agent_time_break['adult']))
        .attr('y', yScale(d3.max(exponentDown, d => d.y)))
        .attr('width', Math.abs(xScale(agent_time_break['downturn'])) - xScale(agent_time_break['adult']))
        .attr('height', yScale(0) - yScale(d3.max(exponentDown, d => d.y)))
        .attr('fill', '#D9FFB4')
        .style('opacity', 0.5)
    svg.append("path")
        .datum(exponentDown)
        .attr('class', 'agent-exponentDown')
        .attr('fill', '#D9FFB4')
        .attr("d", areaDown)         
        .style('opacity', 0.5)
    svg.append("g")
        .attr("transform", `translate(0, ${height_range[1]})`)
        // .call(d3.axisBottom(xScale))
        .call(d3
            .axisBottom(xScale)
            .ticks((end_year - start_year) / year_step)
            .tickFormat((d) => d))
}

// 人物officialPosition的概率分布
async function agentOfficialPosition(material, ori_idx, index, composite_interval) {
    let start_year = 960,
        end_year = 1965,
        year_step = 25

    start_year = composite_interval[0] === null ? start_year : composite_interval[0]
    end_year = composite_interval[1] === null ? end_year : composite_interval[1]
    year_step = Math.abs(end_year - start_year) * year_step / (1965 - 960)

    const svgQuery = $(`#event-${ori_idx.toString()}-agent-source-${index.toString()}`)
    // console.log("svgQuery", svgQuery)
    const width_range = [svgQuery.width() * marginSVG.left, svgQuery.width() * (1 - marginSVG.right)],
          height_range = [svgQuery.height() * marginSVG.top, svgQuery.height() * (1 - marginSVG.bottom)]
    // 首先清除其他的group
    d3.select(`#event-${ori_idx.toString()}-agent-source-${index.toString()}`).selectAll('g').remove()
    // 创建 SVG group 元素
    const officialUp = await d3.json("data/time_reasoning/agent_logarithmic_up.json"),
          officialDown = await d3.json("data/time_reasoning/agent_exponential_down.json")

    // 用于修改x坐标的start_year和end_year，仅对于当前史料
    let cur_start_year = material['time_range'][0] === null ? start_year : material['time_range'][0],
        cur_end_year = material['time_range'][1] === null ? end_year : material['time_range'][1]
    let svg = d3.select(`#event-${ori_idx.toString()}-agent-source-${index.toString()}`)
                .append('g')
    // 定义 x 和 y 的比例尺
    const xScale = d3.scaleLinear()
                    .domain([start_year, end_year])
                    .range([width_range[0], width_range[1]]);
    const yScale = d3.scaleLinear()
                    .domain([0, d3.max(officialDown, d => d.y)])
                    .range([height_range[1], height_range[0]]);

    const agent_time_break = DataProcess.judgeAgentTimeBreak(cur_start_year, cur_end_year, {exponentUp: officialUp, exponentDown: officialDown}, 'activity-officialPosition')
    const areaUp = d3.area()
                        .x(d => xScale(agent_time_break['born'] + d.x * ((agent_time_break['adult'] - agent_time_break['born']) / 10)))
                        .y0(d => yScale(0))
                        .y1(d => yScale(d.y)) // height * 2 / 3
                        .curve(d3.curveNatural),
          areaDown = d3.area()
                        .x(d => xScale(agent_time_break['downturn'] + d.x * ((agent_time_break['death'] - agent_time_break['downturn']) / 10)))
                        .y0(d => yScale(0))
                        .y1(d => yScale(d.y)) // height * 2 / 3
                        .curve(d3.curveNatural)

    // 绘制 area chart
    svg.append("path")
        .datum(officialUp)
        .attr('class', 'agent-exponentUp')
        .attr('fill', '#ACFF59')
        .attr("d", areaUp)         
        .style('opacity', 0.7)
    svg.append('rect') // 收藏机构起讫年份
        .attr('class', 'agent-exponentFlat')
        .attr('x', xScale(agent_time_break['adult']))
        .attr('y', yScale(d3.max(officialDown, d => d.y)))
        .attr('width', Math.abs(xScale(agent_time_break['downturn'])) - xScale(agent_time_break['adult']))
        .attr('height', yScale(0) - yScale(d3.max(officialDown, d => d.y)))
        .attr('fill', '#ACFF59')
        .style('opacity', 0.7)
    svg.append("path")
        .datum(officialDown)
        .attr('class', 'agent-exponentDown')
        .attr('fill', '#ACFF59')
        .attr("d", areaDown)         
        .style('opacity', 0.7)
    svg.append("g")
        .attr("transform", `translate(0, ${height_range[1]})`)
        // .call(d3.axisBottom(xScale))
        .call(d3
            .axisBottom(xScale)
            .ticks((end_year - start_year) / year_step)
            .tickFormat((d) => d))
}


// 绘制概率分布的svg(机构、人物)
export function draw_posibility_distribution(oriTimeScale, reason_data, event_data, rem) {
    // 待添加暂时不需要
}

export function drawEventCircleLine(oriTimeScale, reason_data, event_data, next_event_data, prev_event_data, next_next_event_data, rem) {
    let cur_reason_data = null,
        next_reason_data = null,
        prev_reason_data = null,
        next_next_reason_data = null,
        relativeSeq = false

    for (let i = 0; i < reason_data.length; i++) {
        if (reason_data[i].ori_idx === event_data.ori_idx) {        
            cur_reason_data = reason_data[i]
            // break
        } else if (next_event_data !== null || prev_event_data !== null || next_next_event_data !== null) {
            if (next_event_data !== null && reason_data[i].ori_idx === next_event_data.ori_idx) {
                next_reason_data = reason_data[i]
            }
            if (prev_event_data !== null && reason_data[i].ori_idx === prev_event_data.ori_idx) {
                prev_reason_data = reason_data[i]
            }
            if (next_next_event_data !== null && reason_data[i].ori_idx === next_next_event_data.ori_idx) {
                next_next_reason_data = reason_data[i]
            }
        } 
    }

    if (next_event_data !== null) {
        relativeSeq = cur_reason_data['sequence']['flag'].some(item => item.state === "relative") && next_reason_data['sequence']['flag'].some(item => item.state === "relative") // flag为array
        if (relativeSeq) {
            for (let i in cur_reason_data['sequence']['flag']) {
                if (cur_reason_data['sequence']['flag'][i] === 'relative') {
                    relativeSeq = cur_reason_data['sequence']['flag'][i]['detail'].includes(next_reason_data.ori_idx)
                }
            }
        }
        // relativeSeq = cur_reason_data['sequence']['flag']['state'] === 'relative' && next_reason_data['sequence']['flag']['state'] === 'relative' && cur_reason_data['sequence']['flag']['detail'].includes(next_reason_data.ori_idx) // flag为object时，目前flag更换为array
    }

    let eventline_container = d3.select(`#sub-eventline-svg-${event_data['index'].toString()}`)
                                .append('g')
                                .attr('class', 'eventLine-group')
    eventline_container.append('g')
                        .attr('class', 'horizontal-link')
    // 注意render顺序
    // 绘制next event circle
    if (next_event_data !== null) {
        // 绘制2个circle之间的line
        updateHorizontalLine(oriTimeScale, event_data, next_event_data, null, { // default静态绘制
            cur_reason_data: cur_reason_data,
            next_reason_data: next_reason_data,
            prev_reason_data: prev_reason_data
        }, relativeSeq, null, rem, 'next_circle_initialize')

        let nextCircle = eventline_container.append('circle')
                                            .attr('class', 'next-event-circle')
                                            .attr('id', `sub-eventline-next-${next_event_data['ori_idx'].toString()}-${next_event_data['index'].toString()}`)
                                            .attr('cx', oriTimeScale(next_event_data.time_info.timestampUpdated))
                                            .attr('cy', $(`#sub-eventline-svg-${event_data['index'].toString()}`).height() / 2)
                                            .attr('r', rem / 3)
                                            .attr('fill', type_color.library[next_event_data.lib_type])
                                            .attr('fill-opacity', next_reason_data['sequence']['flag'].some(item => item.state === "absolute") ? 1 : 0)
                                            .attr('stroke', type_color.library[next_event_data.lib_type])
                                            // .style('z-index', 2)

        nextCircle.call(Interaction.dragCirclehorizontal(nextCircle, event_data, next_event_data, prev_event_data, next_next_event_data, {
            cur_reason_data: cur_reason_data,
            next_reason_data: next_reason_data,
            prev_reason_data: prev_reason_data,
            next_next_reason_data: next_next_reason_data,
            all_reason_data: reason_data
        }, 'next_circle', { // added parameters, used for updating horizontal links between event circles
            oriTimeScale: oriTimeScale,
            relativeSeq: relativeSeq,
            rem: rem
        }))
    }
    // 绘制event circle
    let curCircle = eventline_container.append('circle')
                                        .attr('class', 'cur-event-circle')
                                        .attr('id', `sub-eventline-pre-${event_data['ori_idx'].toString()}-${event_data['index'].toString()}`)
                                        .attr('cx', oriTimeScale(event_data.time_info.timestampUpdated))
                                        .attr('cy', $(`#sub-eventline-svg-${event_data['index'].toString()}`).height() / 2)
                                        .attr('r', rem / 3)
                                        .attr('fill', type_color.library[event_data.lib_type])
                                        .attr('fill-opacity', cur_reason_data['sequence']['flag'].some(item => item.state === "absolute") ? 1 : 0)
                                        .attr('stroke', type_color.library[event_data.lib_type])
                                        // .style('z-index', 2)
                           
    curCircle.call(Interaction.dragCirclehorizontal(curCircle, event_data, next_event_data, prev_event_data, next_next_event_data, {
        cur_reason_data: cur_reason_data,
        next_reason_data: next_reason_data,
        prev_reason_data: prev_reason_data,
        next_next_reason_data: next_next_reason_data,
        all_reason_data: reason_data
    }, 'pre_circle', { // added parameters, used for updating horizontal links between event circles
        oriTimeScale: oriTimeScale,
        relativeSeq: relativeSeq,
        rem: rem
    }))
}

export function drawEventCircleVerticalLink(reason_data, event_data, next_event_data, rem) {
    let cur_reason_data = null,
        next_reason_data = null,
        relativeSeq = false

    for (let i = 0; i < reason_data.length; i++) {
        if (reason_data[i].ori_idx === event_data.ori_idx) {        
            cur_reason_data = reason_data[i]
            // break
        } else if (next_event_data !== null) {
            if (reason_data[i].ori_idx === next_event_data.ori_idx) {
                next_reason_data = reason_data[i]
            }
        }      
    }

    if (next_event_data !== null) {
        relativeSeq = cur_reason_data['sequence']['flag'].some(item => item.state === "relative") && next_reason_data['sequence']['flag'].some(item => item.state === "relative") // flag为array
        if (relativeSeq) {
            for (let i in cur_reason_data['sequence']['flag']) {
                if (cur_reason_data['sequence']['flag'][i] === 'relative') {
                    relativeSeq = cur_reason_data['sequence']['flag'][i]['detail'].includes(next_reason_data.ori_idx)
                }
            }
        }
        // relativeSeq = ['relative', 'absolute&&relative'].includes(cur_reason_data['sequence']['flag']['state']) && ['relative', 'absolute&&relative'].includes(next_reason_data['sequence']['flag']['state']) && cur_reason_data['sequence']['flag']['detail'].includes(next_reason_data.ori_idx) // flag为object
    }

    if (event_data['index'] > 0) {
        let link_pos = {
            circle0:  // id: next
            $(`#sub-eventline-pre-${event_data['ori_idx'].toString()}-${event_data['index'].toString()}`).offset() || { top: 0, left: 0 },
            circle1:  // id: pre
            $(`#sub-eventline-next-${event_data['ori_idx'].toString()}-${event_data['index'].toString()}`).offset() || { top: 0, left: 0 },
            svg:  // $('#event-circle-vertical-link').offset()
            $('#event-circle-vertical-link').offset() || { top: 0, left: 0 }       
        }

        // success
        // console.log($(`#${event_data['ori_idx'].toString()}-sub-eventline-pre-${event_data['index'].toString()}`).offset())
        // console.log($(`#${event_data['ori_idx'].toString()}-sub-eventline-next-${event_data['index'].toString()}`).offset())
        // console.log($('#event-circle-vertical-link').offset())

        const offsetLeft = link_pos['circle0']['left'] - link_pos['svg']['left'] + rem / 3,
              startY = link_pos['circle0']['top'] - link_pos['svg']['top'] + (event_data['index'] % 2 === 0 ? rem * 2 / 3 : 0),
              endY = link_pos['circle1']['top'] - link_pos['svg']['top'] + (event_data['index'] % 2 === 0 ? 0 : rem * 2 / 3)
        let vertical_link_group = d3.select(`#event-circle-vertical-link`)
                                    .append('g')
                                    .attr('class', 'event-circle-vertical-link-group')
        let verticalLine = vertical_link_group.append('line')
                                                .attr('id', `vertial-line-${event_data['ori_idx'].toString()}-${event_data['index'].toString()}`)
                                                .attr('x1', offsetLeft)
                                                .attr('y1', startY)
                                                .attr('x2', offsetLeft)
                                                .attr('y2', endY)
                                                // .attr('transform', `translate(0,${$(`#sub-eventline-svg-${event_data['index'].toString()}`).height() / 2})`)
                                                .attr('stroke', type_color.library[event_data.lib_type])
                                                .attr('stroke-width', 1)
        // verticalLine.call(Interaction.dragCirclehorizontal(verticalLine, event_data, 'vertical_line'))
    }
}

export function updateHorizontalLine(oriTimeScale, event_data, next_event_data, prev_event_data, reason_data, relativeSeq, link_params, rem, drag_choice) { // 更新horizontal line between event circles
    if (drag_choice === 'next_circle_initialize') { // 默认静态绘制时
        // 绘制2个circle之间的line
        const eventline_container = d3.select(`#sub-eventline-svg-${event_data['index'].toString()}`).select('.eventLine-group').select('.horizontal-link')
        // console.log($(`#${event_data['ori_idx'].toString()}-sub-eventline-${event_data['index'].toString()}`).offset())
        // 定义三角形的坐标点
        const trianglePoints = `${oriTimeScale(next_event_data.time_info.timestampUpdated) - rem / 3},${$(`#sub-eventline-svg-${event_data['index'].toString()}`).height() / 2} 
                                ${oriTimeScale(next_event_data.time_info.timestampUpdated) - rem / 3 - rem / 2},${$(`#sub-eventline-svg-${event_data['index'].toString()}`).height() / 2 + rem / (2 * 1.7)}
                                ${oriTimeScale(next_event_data.time_info.timestampUpdated) - rem / 3 - rem / 2},${$(`#sub-eventline-svg-${event_data['index'].toString()}`).height() / 2 - rem / (2 * 1.7)}`

        eventline_container.append('line')
                            .attr('x1', oriTimeScale(event_data.time_info.timestampUpdated) + rem / 3)
                            .attr('x2', oriTimeScale(next_event_data.time_info.timestampUpdated) - rem / 3)
                            .attr('transform', `translate(0,${$(`#sub-eventline-svg-${event_data['index'].toString()}`).height() / 2})`)
                            .attr('stroke', type_color.library[event_data.lib_type])
                            .attr('stroke-width', relativeSeq ? 3 : 1)
        // 绘制三角形
        if (relativeSeq) {
            eventline_container.append("polygon")
                                .attr("points", trianglePoints)
                                .attr('class', 'relativeSeq-triangle')
                                .attr("fill", type_color.library[event_data.lib_type])
        }
    } else { // next_circle, prev_circle传参不同(动态交互时)
        if (next_event_data !== null) {
            const eventline_container = d3.select(`#sub-eventline-svg-${event_data['index'].toString()}`).select('.eventLine-group').select('.horizontal-link')

            eventline_container.append('line')
                                .attr('x1', oriTimeScale(event_data.time_info.timestampUpdated) + rem / 3)
                                .attr('x2', oriTimeScale(next_event_data.time_info.timestampUpdated) - rem / 3)
                                .attr('transform', `translate(0,${$(`#sub-eventline-svg-${event_data['index'].toString()}`).height() / 2})`)
                                .attr('stroke', type_color.library[event_data.lib_type])
                                .attr('stroke-width', link_params['stroke_width']['event'])

        }
        if (prev_event_data !== null) {
            const eventline_container = d3.select(`#sub-eventline-svg-${prev_event_data['index'].toString()}`).select('.eventLine-group').select('.horizontal-link')

            eventline_container.append('line')
                                .attr('x1', oriTimeScale(prev_event_data.time_info.timestampUpdated) + rem / 3)
                                .attr('x2', oriTimeScale(event_data.time_info.timestampUpdated) - rem / 3)
                                .attr('transform', `translate(0,${$(`#sub-eventline-svg-${prev_event_data['index'].toString()}`).height() / 2})`)
                                .attr('stroke', type_color.library[prev_event_data.lib_type])
                                .attr('stroke-width', link_params['stroke_width']['prev_event'])   
        }
        // 绘制三角形
        // console.log(reason_data)
        if (reason_data['next_reason_data'] !== null) {
            if (link_params['relativeSeq']['event']) {
                const trianglePoints = `${oriTimeScale(next_event_data.time_info.timestampUpdated) - rem / 3},${$(`#sub-eventline-svg-${event_data['index'].toString()}`).height() / 2} 
                                        ${oriTimeScale(next_event_data.time_info.timestampUpdated) - rem / 3 - rem / 2},${$(`#sub-eventline-svg-${event_data['index'].toString()}`).height() / 2 + rem / (2 * 1.7)}
                                        ${oriTimeScale(next_event_data.time_info.timestampUpdated) - rem / 3 - rem / 2},${$(`#sub-eventline-svg-${event_data['index'].toString()}`).height() / 2 - rem / (2 * 1.7)}`
                d3.select(`#sub-eventline-svg-${event_data['index'].toString()}`).select('.eventLine-group').select('.horizontal-link')
                    .append("polygon")
                    .attr("points", trianglePoints)
                    .attr("fill", type_color.library[event_data.lib_type])
                }
        }
        if (reason_data['prev_reason_data'] !== null) {
            if (link_params['relativeSeq']['prev_event']) {
                // 定义三角形的坐标点
                const trianglePoints = `${oriTimeScale(event_data.time_info.timestampUpdated) - rem / 3},${$(`#sub-eventline-svg-${prev_event_data['index'].toString()}`).height() / 2} 
                                        ${oriTimeScale(event_data.time_info.timestampUpdated) - rem / 3 - rem / 2},${$(`#sub-eventline-svg-${prev_event_data['index'].toString()}`).height() / 2 + rem / (2 * 1.7)}
                                        ${oriTimeScale(event_data.time_info.timestampUpdated) - rem / 3 - rem / 2},${$(`#sub-eventline-svg-${prev_event_data['index'].toString()}`).height() / 2 - rem / (2 * 1.7)}`
                d3.select(`#sub-eventline-svg-${prev_event_data['index'].toString()}`).select('.eventLine-group').select('.horizontal-link')
                    .append("polygon")
                    .attr("points", trianglePoints)
                    .attr("fill", type_color.library[prev_event_data.lib_type])
                }
        }
    }
}

