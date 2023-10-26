import * as d3 from "d3";
const $ = require("jquery");
import * as BookTraj from "@/data/BookTraj";
import * as TimeLineUpdate from "@/data/timeline/timeline_update";

import * as GraphAPI from "@/data/hier_graph"; // 请求graph视图的数据
import * as GeoAPI from "@/data/geo/api"; // 请求geo视图的数据

import { color, type_color } from "@/theme"
import * as Drawer from "@/utils/pack/drawer"

// 用于transition情况下过滤筛选成为node和edge的array
function trans_filter_condition(input_array, filter_constraints) {
    let filter_array = []

    // filter book_type (book_type)
    if (filter_constraints.book !== null) {
        filter_array = input_array.filter((d) => d.book_type === filter_constraints.book)
    } else {
        filter_array = input_array
    }

    // filter agent (agent_type)
    if (filter_constraints.agent !== null) {
        filter_array = filter_array.filter((d) => d.agent_type === filter_constraints.agent)
    }

    // filter library (lib_type)
    if (filter_constraints.library !== null) {
        filter_array = filter_array.filter((d) => d.lib_type === filter_constraints.library)
    }

    // filter year_range
    if (!(filter_constraints.time_range === null || filter_constraints.time_range[1] - filter_constraints.time_range[0] >= 1005)) {
        filter_array = filter_array.filter((d) => d.time_info.timestamp >= filter_constraints.time_range[0] && d.time_info.timestamp <= filter_constraints.time_range[1])
    }

    return filter_array
}


export function timeline_trans_out(duration, choice, input_selection, input_filter) { // 离开timeline视图, duration = 4000, choice为graph或geomap
    // const timelineData = BookTraj.cur_timeline_layout() // timeline视图的data
    // const timeLineData_filter = trans_filter_condition(timelineData, input_filter)
    const timeLineData_filter = BookTraj.cur_timeline_layout() // timeline视图的data

    // console.log('timelineData', timelineData)
    // console.log(BookTraj.exportSVGLength, document.getElementsByClassName('main-panel')[0].clientHeight)
    // console.log('timelineData', timelineData)
    // console.log('input_selection', input_selection)
    // console.log('ScrollTop', document.getElementById('container').scrollTop) // 实时获取

    // const fade_duration = 2000
    const copy_duration = 500
    //const scroll_duration = 1000
    const shrink_duration = 1500 // shrink_duration包含scroll_duration
    // const spread_duration = 1000
    const move_duration = duration - shrink_duration - copy_duration

    d3.select('.timeLineSvg') // 自己原本的图层
          .style('opacity', 1)
          .transition()
          .duration(copy_duration)
          .style('opacity', 0)

    setTimeout(() => {
        d3.select('#container') // 包含了.timeline-trans-node-layer的图层
            .style('opacity', 1)
            .transition()
            .duration(duration)
            .style('opacity', 0)
    }, duration)

    const copy_edge_layer = d3.select('#timeLineSVG').append('g').attr('class', 'timeline-trans-edge-layer')
    const copy_node_layer = d3.select('#timeLineSVG').append('g').attr('class', 'timeline-trans-node-layer')

    d3.select('.timeline-trans-node-layer') // copy_node图层
          .style('opacity', 0)
          .transition()
          .duration(copy_duration)
          .style('opacity', 1)
    d3.select('.timeline-trans-edge-layer') // copy_edge图层
          .style('opacity', 0)
          .transition()
          .duration(copy_duration)
          .style('opacity', 1)

    let edge = copy_edge_layer // 先画edge，再画node，这样edge在node下面
                            .append("g")
                            .selectAll("g")
                            .data(timeLineData_filter.filter((d) => d.edge_state.stroke !== null))
                            .join("g")

    // 对于转换到geomap时
    if (choice === 'geomap' && input_selection.entity === 'editions' && input_selection.value !== null) {
        // 对于切换到geomap的单本书轨迹
        copy_edge_layer.selectAll('g').remove()
        edge = copy_edge_layer // 先画edge，再画node，这样edge在node下面
            .append("g")
            .selectAll("g")
            .data(timeLineData_filter.filter((d) => (input_selection.value.includes(d.書名) && d.edge_state.source.x !== null)))
            .join("g")
        // console.log('运行到这一步了')
    }
    // console.log('edge', edge)

    edge.append('path')
          .classed("curve", true)
          .attr("fill", "none")
          .attr("stroke-width", 0.5)
          // .attr("stroke", "url(#ArrowPathGradient)")
          .attr('stroke', 'gray')
          .attr("d", (d) => d3.line()([[d.edge_state.source.x, d.edge_state.source.ori_y], [d.edge_state.target.x, d.edge_state.target.ori_y]]))
          .style("opacity", (d) => d.edge_state.stroke_opacity);

    let node = copy_node_layer // node
                    .append("g")
                    .selectAll("g")
                    .data(timeLineData_filter.filter((d) => d.node_state.x !== null))
                    .join("g")
                    .attr("transform", (d) => `translate(${d.node_state.x}, ${d.node_state.ori_y})`) // 去除edge_state为null的
    
    // 对于转换到geomap时
    if (choice === 'geomap' && input_selection.entity === 'editions' && input_selection.value !== null) {
        // 对于切换到geomap的单本书轨迹
        copy_node_layer.selectAll('g').remove()
        node = copy_node_layer // 先画edge，再画node，这样edge在node下面
                    .append("g")
                    .selectAll("g")
                    .data(timeLineData_filter.filter((d) => (input_selection.value.includes(d.書名) && d.node_state.x !== null)))
                    .join("g")
                    .attr("transform", (d) => `translate(${d.node_state.x}, ${d.node_state.ori_y})`) // 去除edge_state为null的
    }
    // console.log('node', node)

    node.append("circle")
            .attr("r", (d) => d.node_state.r)
            .attr("fill", (d) => type_color.library[d.lib_type])
            .style('opacity', (d) => d.node_state.node_opacity)

    // rescale
    const y_scale = d3
                    .scaleLinear()
                    .domain([0, BookTraj.exportSVGLength])
                    .range([0, document.getElementsByClassName('main-panel')[0].clientHeight]) // 当前窗口的height

    // setTimeout(() => {
    //     d3.transition()
    //         .duration(scroll_duration)
    //         .tween("scroll", TimeLineUpdate.scrollTween(document.getElementById('container').scrollTop, 0))
    // }, copy_duration)
    if (!(choice === 'geomap' && input_selection.entity === 'editions' && input_selection.value !== null)) { // to graph
        // debugger
        // console.log(choice, input_selection.entity, input_selection.value)
        setTimeout(() => {
            // console.log('BookTraj.exportScrollTop', BookTraj.exportScrollTop)
    
                edge.select(".curve")
                    .transition()
                    .duration(shrink_duration)
                    .attr('d', (d, i) => d3.line()([[d.edge_state.source.x, y_scale(d.edge_state.source.ori_y)], [d.edge_state.target.x, y_scale(d.edge_state.target.ori_y)]]))
    
                node.transition()
                    .duration(shrink_duration)
                    .attr(
                        "transform",
                        (d, i) => `translate(${d.node_state.x}, ${y_scale(d.node_state.ori_y)})`)

                d3.transition()
                    .duration(shrink_duration)
                    .tween("scroll", TimeLineUpdate.scrollTween(0, document.getElementById('container').scrollTop)) 
                node.select("circle")
                    .transition()
                    .duration(shrink_duration)
                    .attr("fill", (d, i) => d.node_state.fill)
                    .attr("r", (d, i) => d.node_state.r)
        }, copy_duration)
    } else { // for geomap
        // debugger
        const dst_trajs = GeoAPI.cur_graph_layout() // 请求geo map布局数据
        let geo_edge_list = dst_trajs.filter((d) => d.hasOwnProperty('edge_state'))
        let geo_node_list = dst_trajs.filter((d) => d.hasOwnProperty('node_state'))
        if (input_selection.entity === 'editions' && input_selection.value !== null) {
            geo_edge_list = dst_trajs.filter((d) => (input_selection.value.includes(d.bookName) && d.hasOwnProperty('edge_state')))
            geo_node_list = dst_trajs.filter((d) => (input_selection.value.includes(d.bookName) && d.hasOwnProperty('node_state')))
        }
        // console.log(geo_edge_list, geo_node_list)
        setTimeout(() => {
            // debugger
            edge.select(".curve")
                .transition()
                .duration(shrink_duration / 2)
                .style('opacity', (d, i) => {
                    if (geo_node_list[i] !== undefined) {
                        return d.edge_state.stroke_opacity
                    } else {
                        return 0
                    }
                })

            node.transition()
                .duration(shrink_duration / 2)
                .style('opacity', (d, i) => {
                    if (geo_node_list[i] !== undefined) {
                        return 1
                    } else {
                        return 0
                    }
                })
            node.select("circle")
                .transition()
                .duration(shrink_duration / 2)
                .attr("fill", (d, i) => d.node_state.fill)
                .attr("r", (d, i) => d.node_state.r)
                .style('opcaity', (d, i) => {
                    if (geo_node_list[i] !== undefined) {
                        return 1
                    } else {
                        return 0
                    }
                })
            // d3.transition()
            //     .duration(shrink_duration)
            //     .tween("scroll", TimeLineUpdate.scrollTween(0, document.getElementById('container').scrollTop))
    
        }, copy_duration)

        // debugger

        setTimeout(() => {
            // debugger
            // edge.select(".curve")
            //     .transition()
            //     .duration(shrink_duration / 2)
            //     .attr('d', (d, i) => {
            //         if (geo_edge_list[i] !== undefined) {
            //             return d3.line()([[d.edge_state.source.x, y_scale(d.edge_state.source.ori_y)], [d.edge_state.target.x, y_scale(d.edge_state.target.ori_y)]])
            //         } else {
            //             return null
            //         }
            //     })

            // node.transition()
            //     .duration(shrink_duration / 2)
            //     .attr(
            //         "transform",
            //         (d, i) => {
            //             if (geo_node_list[i] !== undefined) {
            //                 return `translate(${d.node_state.x}, ${y_scale(d.node_state.ori_y)})`
            //             } else {
            //                 return 'translate(0,0)'
            //             }
            //         }         
            //     )
            // d3.transition()
            //     .duration(shrink_duration / 2)
            //     .tween("scroll", TimeLineUpdate.scrollTween(0, document.getElementById('container').scrollTop))

            // node.select("circle")
            //     .transition()
            //     .duration(shrink_duration / 2)
            //     .attr("fill", (d, i) => d.node_state.fill)
            //     .attr("r", (d, i) => d.node_state.r)
                // .style('visibility', (d, i) => {
                //     if (geo_node_list[i] !== undefined) {
                //         return 'visible'
                //     } else {
                //         return 'hidden'
                //     }
                // })

            // document.getElementById('container')
            //     .scrollTo({top: 0, behavior: "smooth"})

        // }
            
            
            // d3.transition()
            //     .duration(move_duration / 2)
            //     .tween("scroll", TimeLineUpdate.scrollTween(document.getElementById('container').scrollTop, 0))
    
        }, copy_duration + shrink_duration / 2)
    }
    // setTimeout(() => {
    //     // for geomap
    //     const dst_trajs = GeoAPI.cur_graph_layout() // 请求geo map布局数据
    //     let geo_edge_list = dst_trajs.filter((d) => d.hasOwnProperty('edge_state'))
    //     let geo_node_list = dst_trajs.filter((d) => d.hasOwnProperty('node_state'))
    //     if (input_selection.entity === 'edition' && input_selection.value !== null) {
    //         geo_edge_list = dst_trajs.filter((d) => (d.bookName === input_selection.value && d.hasOwnProperty('edge_state')))
    //         geo_node_list = dst_trajs.filter((d) => (d.bookName === input_selection.value && d.hasOwnProperty('node_state')))
    //     }

    //     if (!(choice === 'geomap' && input_selection.entity === 'edition' && input_selection.value !== null)) {
    //         console.log('BookTraj.exportScrollTop', BookTraj.exportScrollTop)

    //         edge.select(".curve")
    //             .transition()
    //             .duration(shrink_duration)
    //             .attr('d', (d, i) => d3.line()([[d.edge_state.source.x, y_scale(d.edge_state.source.ori_y)], [d.edge_state.target.x, y_scale(d.edge_state.target.ori_y)]]))
    //             // .style('visibility', (d, i) => {
    //             //     if (geo_node_list[i] !== undefined) {
    //             //         return 'visible'
    //             //     } else {
    //             //         return 'hidden'
    //             //     }
    //             // })

    //         node.transition()
    //             .duration(shrink_duration)
    //             .attr(
    //                 "transform",
    //                 (d, i) => `translate(${d.node_state.x}, ${y_scale(d.node_state.ori_y)})`)
    //             // .style('visibility', (d, i) => {
    //             //     if (geo_node_list[i] !== undefined) {
    //             //         return 'visible'
    //             //     } else {
    //             //         return 'hidden'
    //             //     }
    //             // })
    //         d3.transition()
    //             .duration(shrink_duration)
    //             .tween("scroll", TimeLineUpdate.scrollTween(BookTraj.exportScrollTop, 0)) 
    //     } else { // 对于geomap布局
    //         edge.select(".curve")
    //             .transition()
    //             .duration(shrink_duration)
    //             .attr('d', (d, i) => {
    //                 if (geo_edge_list[i] !== undefined) {
    //                     return d3.line()([[d.edge_state.source.x, y_scale(d.edge_state.source.ori_y)], [d.edge_state.target.x, y_scale(d.edge_state.target.ori_y)]])
    //                 } else {
    //                     return null
    //                 }
    //             })
    //             .style('opacity', (d, i) => {
    //                 if (geo_node_list[i] !== undefined) {
    //                     return d.edge_state.stroke_opacity
    //                 } else {
    //                     return 0
    //                 }
    //             })

    //         node.transition()
    //             .duration(shrink_duration)
    //             .attr(
    //                 "transform",
    //                 (d, i) => {
    //                     if (geo_edge_list[i] !== undefined) {
    //                         return `translate(${d.node_state.x}, ${y_scale(d.node_state.ori_y)})`
    //                     } else {
    //                         return 'translate(0,0)'
    //                     }
    //                 }         
    //             )
    //             .style('opacity', (d, i) => {
    //                 if (geo_node_list[i] !== undefined) {
    //                     return 1
    //                 } else {
    //                     return 0
    //                 }
    //             })
    //         d3.transition()
    //             .duration(shrink_duration)
    //             .tween("scroll", TimeLineUpdate.scrollTween(BookTraj.exportScrollTop, 0))
    //     }
    //         node.select("circle")
    //             .transition()
    //             .duration(shrink_duration)
    //             .attr("fill", (d, i) => d.node_state.fill)
    //             .attr("r", (d, i) => d.node_state.r)
    //             // .style('visibility', (d, i) => {
    //             //     if (geo_node_list[i] !== undefined) {
    //             //         return 'visible'
    //             //     } else {
    //             //         return 'hidden'
    //             //     }
    //             // })

    //         // document.getElementById('container')
    //         //     .scrollTo({top: 0, behavior: "smooth"})

    //     // }
        
        
    //     // d3.transition()
    //     //     .duration(move_duration / 2)
    //     //     .tween("scroll", TimeLineUpdate.scrollTween(document.getElementById('container').scrollTop, 0))

    // }, copy_duration)

    // 切换到graph视图
    if (choice === 'graph') {
        // let dst_trajs = GraphAPI.cur_graph_layout() // 请求graph布局数据
        // dst_trajs = trans_filter_condition(dst_trajs, input_filter)
        const dst_trajs = GraphAPI.cur_graph_layout() // 请求graph布局数据
        const graph_edge_list = dst_trajs.filter((d) => d.hasOwnProperty('edge_state'))
        // console.log('Graph Data', dst_trajs)
        setTimeout(() => {
            node.transition()
                .duration(move_duration / 2)
                .attr(
                    "transform",
                    (d, i) =>
                        `translate(${dst_trajs[i].node_state.x}, ${dst_trajs[i].node_state.y})`
                )
            node.select("circle")
                .transition()
                .duration(move_duration / 2)
                .attr("fill", (d, i) => dst_trajs[i].node_state.fill)
                .attr("r", (d, i) => dst_trajs[i].node_state.r)
                .style("opacity", 1) // 待修改
            
            edge.select(".curve")
                .transition()
                .duration(move_duration / 2)
                .attr("stroke-width", (d) => d.edge_state.stroke_width)
                // .attr("stroke", "url(#ArrowPathGradient)")
                .attr("stroke", (d) => d.edge_state.stroke)
                .attr('d', (d, i) => d3.line()([[graph_edge_list[i].edge_state.source.x, graph_edge_list[i].edge_state.source.y], [graph_edge_list[i].edge_state.target.x, graph_edge_list[i].edge_state.target.y]]))
    
        }, copy_duration + shrink_duration)
        setTimeout(() => {
            edge.select(".curve")
                .style("opacity", (d) => d.edge_state.stroke_opacity)
                .transition()
                .duration(move_duration / 2)
                .style('opacity', 0)
        }, copy_duration + shrink_duration + move_duration / 2)

    // 切换到geomap视图
    // 对于单本书轨迹，只有该本书存在node_state以及edge_state
    }  else if (choice === 'geomap') {
        // const dst_trajs = GeoAPI.cur_graph_layout() // 请求geo map布局数据
        // if (input_selection.entity === 'edition' && input_selection.value !== null) {
        //     let geo_edge_list = dst_trajs.filter((d) => (d.bookName === input_selection.value && d.hasOwnProperty('edge_state')))
        // }
        // const dst_trajs = trans_filter_condition(GeoAPI.cur_graph_layout(), input_filter)
        const dst_trajs = GeoAPI.cur_graph_layout() // 请求geo map布局数据
        let geo_edge_list = dst_trajs.filter((d) => d.hasOwnProperty('edge_state'))
        let geo_node_list = dst_trajs.filter((d) => d.hasOwnProperty('node_state'))

        if (input_selection.entity === 'editions' && input_selection.value !== null) {
            geo_edge_list = dst_trajs.filter((d) => (input_selection.value.includes(d.bookName) && d.hasOwnProperty('edge_state')))
            geo_node_list = dst_trajs.filter((d) => (input_selection.value.includes(d.bookName) && d.hasOwnProperty('node_state')))
        }
        // console.log('Geo Data', geo_edge_list, geo_node_list)

        setTimeout(() => {
            // debugger
            node.transition()
                .duration(move_duration / 2 + shrink_duration / 2)
                .attr(
                    "transform",
                    (d, i) => {
                        // console.log(geo_node_list[i])
                        if (geo_node_list[i] !== undefined) {
                            return `translate(${geo_node_list[i].node_state.x}, ${geo_node_list[i].node_state.y})`
                        } else {
                            return 'translate(0,0)'
                        }
                    }    
                )
                .style('visibility', (d, i) => {
                    if (geo_node_list[i] !== undefined) {
                        return 'visible'
                    } else {
                        return 'hidden'
                    }
                })
            node.select("circle")
                .transition()
                .duration(move_duration / 2 + shrink_duration / 2)
                .attr("fill", (d, i) => {
                    if (geo_node_list[i] !== undefined) {
                        return geo_node_list[i].node_state.fill
                    } else {
                        return 'none'
                    }
                })
                .attr("r", (d, i) => {
                    if (geo_node_list[i] !== undefined) {
                        return geo_node_list[i].node_state.r
                    } else {
                        return 0
                    }
                })
            
            edge.select(".curve")
                .transition()
                .duration(move_duration / 2 + shrink_duration / 2)
                .attr("stroke-width", (d, i) => {
                    if (geo_edge_list[i] !== undefined) {
                        return geo_edge_list[i].edge_state.stroke_width
                    } else {
                        return 0
                    }
                })
                // .attr("stroke", "url(#ArrowPathGradient)")
                .attr("stroke", (d, i) => {
                    if (geo_edge_list[i] !== undefined) {
                        return geo_edge_list[i].edge_state.stroke
                    } else {
                        return 'none'
                    }
                })
                .attr('d', (d, i) => {
                    if (geo_edge_list[i] !== undefined) {
                        return d3.line()([[geo_edge_list[i].edge_state.source.x, geo_edge_list[i].edge_state.source.y], [geo_edge_list[i].edge_state.target.x, geo_edge_list[i].edge_state.target.y]])
                    } else {
                        return null
                    }
                })
            if (input_selection.entity === 'editions' && input_selection.value !== null) {
                // debugger
                d3.transition()
                    .duration(move_duration / 2 + shrink_duration / 2)
                    .tween("scroll", TimeLineUpdate.scrollTween(document.getElementById('container').scrollTop, 0))
                // debugger
            }
    
        }, copy_duration + shrink_duration / 2)
        
        setTimeout(() => {
            edge.select(".curve")
                .style("opacity", (d) => {
                    if (d !== undefined) {
                        return d.edge_state.stroke_opacity
                    } else {
                        return 0
                    }
                })
                .transition()
                .duration(move_duration / 2)
                .style('opacity', 0)
        }, copy_duration + shrink_duration + move_duration / 2)
    }

    // timeline_trans_to_graph()

    setTimeout(() => {
        d3.select('#timeLineSVG').selectAll('.timeline-trans-node-layer').remove()
        d3.select('#timeLineSVG').selectAll('.timeline-trans-edge-layer').remove()
    }, duration * 2)
    
    
}

// 进入graph视图
export function timeline_trans_to_graph() {
    const dst_trajs = GraphAPI.cur_graph_layout() // 请求graph布局数据
    console.log('Graph Data', dst_trajs)
}

// function calcDirect(src, dst, percentage = 1) {
//     const direct = dst.sub(src);
//     const normal = direct.rotate(Math.PI / 2).mul(0.2);
//     /* Cubic bezier with normal offset in src & dst */
//     // return `M ${src.x},${src.y} c ${normal.x},${normal.y} ${direct.x + normal.x},${direct.y + normal.y} ${direct.x},${direct.y}`;
//     /* Quadratic  bezier with center normal offset */
//     const middle = direct.mul(0.5).add(normal);

//     if (percentage === 1) {
//         return `M ${src.x},${src.y} q ${middle.x},${middle.y} ${direct.x},${direct.y}`;
//     } else {
//         const m1 = new Point(0, 0)
//             .mul(1 - percentage)
//             .add(middle.mul(percentage));
//         const m2 = middle.mul(1 - percentage).add(direct.mul(percentage));
//         const m3 = m1.mul(1 - percentage).add(m2.mul(percentage));
//         return `M ${src.x},${src.y} q ${m1.x},${m1.y} ${m3.x},${m3.y}`;
//     }
// }