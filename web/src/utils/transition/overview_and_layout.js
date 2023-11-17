import * as d3 from "d3";
const $ = require("jquery");

import { jsonCopy } from "@/utils/copy";
import * as overviewFunc from "@/utils/overview/overview_function"

const margin = {
    top: 0.01,
    left: 0.01,
    right: 0.01,
    bottom: 0.01,
};

export let exportCardListInLayout = {} // 读取的是Layout.vue中动态变化的cardList值
export function setExportcardListInLayout(value) {
    exportCardListInLayout = value
}

// duration can be divided into 3 parts:
// copy duration(1000), move duration(2000), overlay duration(1000)
export function overview2layout(time_duration, transition_direction, selection, seal_mapped_list, painting_pic) { // time_duration = 4000
    // define the time duration
    const copy_duration = time_duration / 3,
          move_duration = time_duration / 3,
          overlay_duration = time_duration / 3

    const overview_resize_scale = $('.main-panel').height() * 0.88 / painting_pic['height'],
          container_scrollLeft = document.getElementById('full-image-container').scrollLeft
    // copy duration
    let svg = d3.select('.overview-transition-svg') // select the svg item
    svg.selectAll('.transition_layer').remove()
    let transition_layer = svg.append('g').attr('class', 'transition_layer')
    let image_group = transition_layer.append('g')
                                        .attr('class', 'image-group')
    console.log('seal_mapped_list in transition', seal_mapped_list)
    let seal_image = image_group.selectAll('.seal-image-overview')
                                .data(seal_mapped_list)
                                .enter()
                                .append('image')
                                .attr('class', 'seal-image-overview')
                                .attr('xlink:href', (d) => d['image_href']) // 设置图片的链接
                                .attr('width', (d) => d['width'] * overview_resize_scale) // 设置图片的宽度
                                .attr('height', (d) => d['height'] * overview_resize_scale) // 设置图片的高度
                                .attr('x', (d) => d['x'] * overview_resize_scale - container_scrollLeft) // 设置图片的 x 坐标
                                .attr('y', (d) => d['y'] * overview_resize_scale) // 设置图片的 y 坐标
    // set the opacity of background image && rect group in overview to 0
    d3.select(`#full-image-container`)
        .transition()
        .duration(copy_duration)
        .style("opacity", 0)
    d3.select(`#thumbnail-container`)
        .transition()
        .duration(copy_duration)
        .style("opacity", 0)
    d3.select('.layout-container')
        .transition()
        .duration(copy_duration)
        .style("opacity", 1)

    let cardList = seal_mapped_list.map(d => exportCardListInLayout.find(obj => obj['index'] === d['index'])) // 将2个array之间的index进行对齐

    setTimeout(() => { // start the move_duration
        seal_image.transition()
                    .duration(move_duration)
                    .attr('x', (d, i) => cardList[i]['layout_params']['x'])
                    .attr('y', (d, i) => cardList[i]['layout_params']['y'])
                    .attr('width', (d, i) => cardList[i]['layout_params']['width'])
                    .attr('height', (d, i) => cardList[i]['layout_params']['height'])
    }, copy_duration)
    
    setTimeout(() => {
        // debugger
    }, copy_duration + move_duration)

    setTimeout(() => {
        svg.selectAll('.transition_layer').remove()
    }, time_duration)
}

export function layout2overview(time_duration, transition_direction, selection, seal_mapped_list, painting_pic) {
    // define the time duration
    const copy_duration = time_duration / 3,
          move_duration = time_duration / 3,
          overlay_duration = time_duration / 3

    // copy duration
    let svg = d3.select('.layout-transition-svg') // select the svg item
    svg.selectAll('.transition_layer').remove()
    let transition_layer = svg.append('g').attr('class', 'transition_layer')
    let image_group = transition_layer.append('g')
                                        .attr('class', 'image-group')
    console.log('seal_mapped_list in transition', seal_mapped_list)

    let cardList = seal_mapped_list.map(d => exportCardListInLayout.find(obj => obj['index'] === d['index'])) // 将2个array之间的index进行对齐
    const overview_resize_scale = $('.main-panel').height() * 0.88 / painting_pic['height'],
          container_scrollLeft = overviewFunc.export_full_image_container_x

    let seal_image = image_group.selectAll('.seal-image-overview')
                                .data(seal_mapped_list)
                                .enter()
                                .append('image')
                                .attr('class', 'seal-image-overview')
                                .attr('xlink:href', (d) => d['image_href']) // 设置图片的链接
                                .attr('x', (d, i) => cardList[i]['layout_params']['x'])
                                .attr('y', (d, i) => cardList[i]['layout_params']['y'])
                                .attr('width', (d, i) => cardList[i]['layout_params']['width'])
                                .attr('height', (d, i) => cardList[i]['layout_params']['height'])
    // set the opacity of background image && rect group in layout to 0
    d3.selectAll('.seal-image-container')
        .transition()
        .duration(copy_duration)
        .style("opacity", 0)
    d3.select(`#full-image-container`)
        .transition()
        .duration(copy_duration)
        .style("opacity", 1)
    d3.select(`#thumbnail-container`)
        .transition()
        .duration(copy_duration)
        .style("opacity", 1)

    setTimeout(() => { // start the move_duration
        seal_image.transition()
                    .duration(move_duration)
                    .attr('width', (d) => d['width'] * overview_resize_scale) // 设置图片的宽度
                    .attr('height', (d) => d['height'] * overview_resize_scale) // 设置图片的高度
                    .attr('x', (d) => d['x'] * overview_resize_scale - container_scrollLeft) // 设置图片的 x 坐标
                    .attr('y', (d) => d['y'] * overview_resize_scale) // 设置图片的 y 坐标
    }, copy_duration)
    
    setTimeout(() => {
        // debugger
    }, copy_duration + move_duration)

    setTimeout(() => {
        svg.selectAll('.transition_layer').remove()
    }, time_duration)
}