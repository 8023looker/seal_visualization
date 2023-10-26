import * as d3 from "d3";
const $ = require("jquery");

import * as DataProcess from "@/data/timeline/timeline_full/data_process";
import * as RenderAxis from "@/data/timeline/timeline_full/render_axis";
import * as TimeReasoningFunc from "@/data/timeline/timeline_full/time_reasoning_func"
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

// JavaScript 文件中的变量
export let export_reason_data = null;

// 定义一个函数，用于修改 myValue 变量的值
export function updateReasonData(newValue) {
    export_reason_data = newValue;
    // 发出一个自定义事件，通知 Vue 组件数据已更新
    document.dispatchEvent(new Event('updateReasonData'));
}


// circle_pre使用的是event_data, circle_next使用的是nect_event_data
export function dragCirclehorizontal(circle, event_data, next_event_data, prev_event_data, next_next_event_data, reason_data, drag_element, horizontal_link_params) { // interaction of dragging event circle horizontally
    // console.log("reason_data", reason_data)
    const drag = d3.drag()
                    .on('start', (event) => {
                        circle.attr('stroke-width', 2)
                    })
                    .on('drag', (event) => {
                        // 限制拖拽方向为水平方向
                        let cur_drag_year = horizontal_link_params['oriTimeScale'].invert(event.x), // 当前drag所代表年份
                            cur_reason_index = 0

                        if (['pre_circle', 'next_circle'].includes(drag_element)) { // dragging element is circle
                            // 修改vertical line的横坐标
                            if (circle.attr('cx') !== event.x) { // circle的横坐标改变
                                let updated_circleX = event.x + $('#event-circle-vertical-link').offset().left
                                
                                // 修改另一侧的circle坐标
                                if (drag_element === 'pre_circle') { // 当前拖动为pre_circle, 则next_circle的x坐标需要改变
                                    cur_drag_year = judgeIntervalConstraints({
                                                        cur_event_data: event_data,
                                                        next_event_data: next_event_data,
                                                        prev_event_data: prev_event_data
                                                    }, {
                                                        cur_reason_data: reason_data['cur_reason_data'],
                                                        next_reason_data: reason_data['next_reason_data'],
                                                        prev_reason_data: reason_data['prev_reason_data']
                                                    }, cur_drag_year)
                                    updated_circleX = horizontal_link_params['oriTimeScale'](cur_drag_year) + $('#event-circle-vertical-link').offset().left
                                    
                                    d3.select(`#vertial-line-${event_data['ori_idx'].toString()}-${event_data['index'].toString()}`)
                                        .attr('x1', updated_circleX)
                                        .attr('x2', updated_circleX)

                                    d3.select(`#sub-eventline-next-${event_data['ori_idx'].toString()}-${event_data['index'].toString()}`)
                                        // .attr('cx', event.x) // modify
                                        .attr('cx', horizontal_link_params['oriTimeScale'](cur_drag_year))
                           
                                    // update horizontal links between event circles
                                    event_data['time_info']['timestampUpdated'] = cur_drag_year
                                    cur_reason_index = checkReasonDataIndex(reason_data['all_reason_data'], reason_data['cur_reason_data'])
                                    reason_data['all_reason_data'][cur_reason_index]['time_inferred'] = cur_drag_year
                                    updateReasonData(reason_data['all_reason_data']); // 在此处更新 export_reason_data 的值

                                    // 获取remove前line的属性
                                    let link_params = {
                                        stroke_width: {
                                            event: 1,
                                            prev_event: 1
                                        },
                                        relativeSeq: {
                                            event: false,
                                            prev_event: false
                                        }
                                    }

                                    let event_line_selection = d3.select(`#sub-eventline-svg-${event_data['index'].toString()}`).selectAll('.eventLine-group').selectAll('.horizontal-link').selectAll('line')
                                    link_params['stroke_width']['event'] = !event_line_selection.empty() ? event_line_selection.attr('stroke-width') : 1
                                    link_params['relativeSeq']['event'] = !d3.select(`#sub-eventline-svg-${event_data['index'].toString()}`).selectAll('.eventLine-group').selectAll('.horizontal-link').selectAll('polygon').empty()
                                    // link_params['relativeSeq']['event'] = reason_data['cur_reason_data']['sequence']['flag'].some(item => item.state === "relative") && reason_data['next_reason_data']['sequence']['flag'].some(item => item.state === "relative")

                                    // remove event line group
                                    d3.select(`#sub-eventline-svg-${event_data['index'].toString()}`).selectAll('.eventLine-group').selectAll('.horizontal-link').remove()
                                    d3.select(`#sub-eventline-svg-${event_data['index'].toString()}`).select('.eventLine-group').append('g').attr('class', 'horizontal-link')
                                    if (prev_event_data !== null) {
                                        let prev_event_line_selection = d3.select(`#sub-eventline-svg-${prev_event_data['index'].toString()}`).selectAll('.eventLine-group').selectAll('.horizontal-link').selectAll('line')
                                        link_params['stroke_width']['prev_event'] = !prev_event_line_selection.empty() ? prev_event_line_selection.attr('stroke-width') : 1
                                        link_params['relativeSeq']['prev_event'] = !d3.select(`#sub-eventline-svg-${prev_event_data['index'].toString()}`).selectAll('.eventLine-group').selectAll('.horizontal-link').selectAll('polygon').empty()
                                        // link_params['relativeSeq']['prev_event'] = reason_data['cur_reason_data']['sequence']['flag'].some(item => item.state === "relative") && reason_data['prev_reason_data']['sequence']['flag'].some(item => item.state === "relative")

                                        // remove
                                        d3.select(`#sub-eventline-svg-${prev_event_data['index'].toString()}`).selectAll('.eventLine-group').selectAll('.horizontal-link').remove()
                                        d3.select(`#sub-eventline-svg-${prev_event_data['index'].toString()}`).select('.eventLine-group').append('g').attr('class', 'horizontal-link')
                                    }    
                                    // console.log('horizontal_link_params', horizontal_link_params, next_event_data)
                                    TimeReasoningFunc.updateHorizontalLine(horizontal_link_params.oriTimeScale, event_data, next_event_data, prev_event_data, reason_data, horizontal_link_params.relativeSeq, link_params, horizontal_link_params.rem, 'pre_circle')
                                } else if (drag_element === 'next_circle') { // 当前拖动为next_circle, 则pre_circle的x坐标需要改变
                                    // console.log('next_circle')
                                    cur_drag_year = judgeIntervalConstraints({
                                            cur_event_data: next_event_data,
                                            next_event_data: next_next_event_data,
                                            prev_event_data: event_data
                                        }, {
                                        cur_reason_data: reason_data['next_reason_data'],
                                        next_reason_data: reason_data['next_next_reason_data'],
                                        prev_reason_data: reason_data['cur_reason_data']
                                    }, cur_drag_year)
                                    updated_circleX = horizontal_link_params['oriTimeScale'](cur_drag_year) + $('#event-circle-vertical-link').offset().left

                                    d3.select(`#vertial-line-${next_event_data['ori_idx'].toString()}-${next_event_data['index'].toString()}`)
                                        .attr('x1', updated_circleX)
                                        .attr('x2', updated_circleX)

                                    d3.select(`#sub-eventline-pre-${next_event_data['ori_idx'].toString()}-${next_event_data['index'].toString()}`)
                                        // .attr('cx', event.x) // modify
                                        .attr('cx', horizontal_link_params['oriTimeScale'](cur_drag_year))

                                    // update horizontal links between event circles
                                    next_event_data['time_info']['timestampUpdated'] = cur_drag_year
                                    cur_reason_index = checkReasonDataIndex(reason_data['all_reason_data'], reason_data['cur_reason_data'])
                                    reason_data['all_reason_data'][cur_reason_index]['time_inferred'] = cur_drag_year
                                    updateReasonData(reason_data['all_reason_data']); // 在此处更新 myValue 的值

                                    // 获取remove前line的属性
                                    let link_params = {
                                        stroke_width: {
                                            event: 1,
                                            prev_event: 1
                                        },
                                        relativeSeq: {
                                            event: false,
                                            prev_event: false
                                        }
                                    }

                                    let event_line_selection = d3.select(`#sub-eventline-svg-${event_data['index'].toString()}`).selectAll('.eventLine-group').selectAll('.horizontal-link').selectAll('line')
                                    link_params['stroke_width']['prev_event'] = event_line_selection.attr('stroke-width')
                                    link_params['relativeSeq']['prev_event'] = !d3.select(`#sub-eventline-svg-${event_data['index'].toString()}`).selectAll('.eventLine-group').selectAll('.horizontal-link').selectAll('polygon').empty()
                                    // link_params['relativeSeq']['prev_event'] = reason_data['cur_reason_data']['sequence']['flag'].some(item => item.state === "relative") && reason_data['next_reason_data']['sequence']['flag'].some(item => item.state === "relative")

                                    d3.select(`#sub-eventline-svg-${event_data['index'].toString()}`).selectAll('.eventLine-group').selectAll('.horizontal-link').remove()
                                    d3.select(`#sub-eventline-svg-${event_data['index'].toString()}`).select('.eventLine-group').append('g').attr('class', 'horizontal-link')
                                    if (next_event_data !== null) {
                                        let next_event_line_selection = d3.select(`#sub-eventline-svg-${next_event_data['index'].toString()}`).selectAll('.eventLine-group').selectAll('.horizontal-link').selectAll('line')
                                        link_params['stroke_width']['event'] = next_event_line_selection.attr('stroke-width')
                                        link_params['relativeSeq']['event'] = !d3.select(`#sub-eventline-svg-${next_event_data['index'].toString()}`).selectAll('.eventLine-group').selectAll('.horizontal-link').selectAll('polygon').empty()
                                        // link_params['relativeSeq']['event'] = reason_data['cur_reason_data']['sequence']['flag'].some(item => item.state === "relative") && reason_data['next_reason_data']['sequence']['flag'].some(item => item.state === "relative")

                                        d3.select(`#sub-eventline-svg-${next_event_data['index'].toString()}`).selectAll('.eventLine-group').selectAll('.horizontal-link').remove()
                                        d3.select(`#sub-eventline-svg-${next_event_data['index'].toString()}`).select('.eventLine-group').append('g').attr('class', 'horizontal-link')
                                    } 
                                    // console.log('horizontal_link_params', horizontal_link_params, event_data)
                                    // 操作的是上一个event_data
                                    TimeReasoningFunc.updateHorizontalLine(horizontal_link_params.oriTimeScale, next_event_data, next_next_event_data, event_data, reason_data, horizontal_link_params.relativeSeq, link_params, horizontal_link_params.rem, 'next_circle')
                                }
                            }
                            // circle.attr('cx', event.x) // modify
                            circle.attr('cx', horizontal_link_params['oriTimeScale'](cur_drag_year))
                            // 限制拖拽方向为垂直方向
                            // circle.attr('cy', +circle.attr('cy') + deltaY);                    
                        } else if (drag_element === 'vertical_line') { // 则此时circle为line, 暂时弃用
                            circle.attr('x1', event.x)
                                  .attr('x2', event.x)
                            d3.select(`#sub-eventline-next-${event_data['ori_idx'].toString()}-${event_data['index'].toString()}`)
                                .attr('cx', event.x)
                            d3.select(`#sub-eventline-pre-${event_data['ori_idx'].toString()}-${event_data['index'].toString()}`)
                                .attr('cx', event.x)
                        }      
                    })
                    .on('end', (event) => {
                        circle.attr('stroke-width', 1)
                        // console.log('drag end', event)
                    })
    return drag
}

// time interval costraints
// constraints: composite time interval of each event
function judgeIntervalConstraintsOld(reasonData, cur_timestamp) {
    const cur_event_data = reasonData['cur_reason_data'],
          prev_event_data = reasonData['prev_reason_data'],
          next_event_data = reasonData['next_reason_data']

    let cur_event_interval = [ // round 1: cur_event 的 composite_interval
        cur_event_data['time_interval']['composite_interval'][0] === null ? 960 : cur_event_data['time_interval']['composite_interval'][0],
        cur_event_data['time_interval']['composite_interval'][1] === null ? 1965 : cur_event_data['time_interval']['composite_interval'][1]
    ]
    // console.log('cur_event_interval Round 1', cur_event_interval)

    // round 2: next_event 的 earliest year
    if (next_event_data !== null) {
        cur_event_interval[1] = Math.min(cur_event_interval[1], next_event_data['time_interval']['composite_interval'][1] === null ? cur_event_interval[1] : next_event_data['time_interval']['composite_interval'][1])
    }
    // console.log('cur_event_interval Round 2', cur_event_interval)

    // round 3: prev_event 的 latest year
    if (prev_event_data !== null) {
        cur_event_interval[0] = Math.max(cur_event_interval[0], prev_event_data['time_interval']['composite_interval'][0] === null ? cur_event_interval[0] : prev_event_data['time_interval']['composite_interval'][0])
    }
    
    // console.log('cur_event_interval Round 3', cur_event_interval)
    if (cur_timestamp <= cur_event_interval[0]) {
        return cur_event_interval[0]
    } else if (cur_timestamp >= cur_event_interval[1]) {
        return cur_event_interval[1]
    } else {
        return cur_timestamp
    }
}

// constraints: composite time interval && current timestampUpdated of adjacent events
// timestampUpdated在实时更新
function judgeIntervalConstraints(eventData, reasonData, cur_timestamp) {
    let cur_reason_data = reasonData['cur_reason_data'],
        prev_reason_data = reasonData['prev_reason_data'],
        next_reason_data = reasonData['next_reason_data']
    let cur_event_data = eventData['cur_event_data'],
        prev_event_data = eventData['prev_event_data'],
        next_event_data = eventData['next_event_data']

    let cur_event_interval = [ // round 1: cur_event 的 composite_interval
        cur_reason_data['time_interval']['composite_interval'][0] === null ? 960 : cur_reason_data['time_interval']['composite_interval'][0],
        cur_reason_data['time_interval']['composite_interval'][1] === null ? 1965 : cur_reason_data['time_interval']['composite_interval'][1]
    ]

    // round 2: next_event 的 timestampUpdated
    if (next_event_data !== null) {
        cur_event_interval[1] = Math.min(cur_event_interval[1], next_event_data !== null ? next_event_data['time_info']['timestampUpdated'] : cur_event_interval[1]) // timestampUpdated
        cur_event_interval[1] = Math.min(cur_event_interval[1], next_reason_data['time_interval']['composite_interval'][1] === null ? cur_event_interval[1] : next_reason_data['time_interval']['composite_interval'][1]) // time interval
    }

    // round 3: prev_event 的 timestampUpdated
    if (prev_event_data !== null) {
        cur_event_interval[0] = Math.max(cur_event_interval[0], prev_event_data !== null ? prev_event_data['time_info']['timestampUpdated'] : cur_event_interval[0]) // timestampUpdated
        cur_event_interval[0] = Math.max(cur_event_interval[0], prev_reason_data['time_interval']['composite_interval'][0] === null ? cur_event_interval[0] : prev_reason_data['time_interval']['composite_interval'][0]) // time interval
    }
    if (cur_timestamp <= cur_event_interval[0]) {
        return cur_event_interval[0]
    } else if (cur_timestamp >= cur_event_interval[1]) {
        return cur_event_interval[1]
    } else {
        return cur_timestamp
    }
}

// 检测当前reason_data所在all_reason_data的index
function checkReasonDataIndex(all_reason_data, cur_reason_data) {
    // console.log('all_reason_data, cur_reason_data', all_reason_data, cur_reason_data) // success
    let index = 0
    for (let e = 0; e < all_reason_data.length; e++) {
        if (all_reason_data[e]['ori_idx'] === cur_reason_data['ori_idx']) {
            index = e
        }
    }
    return index
}