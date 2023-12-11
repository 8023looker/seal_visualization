import * as d3 from "d3";
const $ = require("jquery");

import { jsonCopy } from "@/utils/copy";
import * as TimescaleParam from "@/utils/timescale_param";
import * as TypeColor from "@/theme/type_color";
import * as SealCardFunc from "@/utils/timeline/seal_card_func";

const margin = {
    top: 0.01,
    left: 0.01,
    right: 0.01,
    bottom: 0.01,
};

let timeScale

export function renderSealRatio(collector_list, seal_mapped_list) {
    for (let i in collector_list) {
        const collector_name = collector_list[i]['collector_name']

        const owned_seal_num = (seal_mapped_list.filter((d) => d['collector_name'] === collector_name)).length

        const svg_height = $(`#${collector_name}-seal-ratio-svg`).height(), // svg高度
              svg_width = $(`#${collector_name}-seal-ratio-svg`).width(), // svg宽度
              radius = svg_height * 0.75 / 2
        // console.log('radius', radius)
        let svg = d3.select(`#${collector_name}-seal-ratio-svg`)
        // console.log(svg_width, svg_height)
        
        svg.selectAll('g').remove() // 首先清除所有的group，避免干扰
        let ratio_group = svg.append('g')
                             .attr('class', 'stamp-ratio')
                             .attr('transform', `translate(${svg_width * 0.05},${svg_height * 0.05})`)
        const arcGeneratorLeft = d3.arc()
                                    .innerRadius(0)
                                    .outerRadius(radius)
                                    .startAngle(Math.PI)
                                    .endAngle(2 * Math.PI)
                                
        const arcGeneratorRight = d3.arc()
                                    .innerRadius(0)
                                    .outerRadius(radius)
                                    .startAngle(0)
                                    .endAngle(Math.PI)

        let total_stamped = ratio_group.append('g')
                            .attr('class', 'total_stamped')
        // 定义路径数据
        const total_path = `M ${radius} ${0} L ${svg_width * 0.85} ${0} A ${radius} ${radius} 0 1 1 ${svg_width * 0.85} ${radius * 2} L ${radius} ${2 * radius}` // A 5,5 0,0,1 150,75
        total_stamped.append('path')
                            .attr('d', total_path)
                            .attr('fill', 'none')
                            .attr('stroke', '#8F7B6C')
        total_stamped.append('text')
                     .attr('x', svg_width * 0.85)
                     .attr('y', svg_height * 0.3)
                     .attr('dy', svg_height * 0.3)
                     .attr("text-anchor", "end")
                     .text((seal_mapped_list.length).toString())
                     .attr('font-size', svg_height * 0.7)
                     .attr('fill', '#8F7B6C')


        let collector_stamped = ratio_group.append('g')
                                            .attr('class', 'collector_stamped')
        collector_stamped.append('rect') // 鉴藏者加盖印章的数目
                            .attr('x', radius)
                            .attr('y', 0)
                            .attr('width', (svg_width * 0.85 - radius) * (owned_seal_num / seal_mapped_list.length))
                            .attr('height', svg_height * 0.75)
                            .attr('fill', '#8F7B6C')
                            .attr('stroke', '#8F7B6C')
        collector_stamped.append('path')
                            .attr('d', arcGeneratorLeft)
                            .attr('fill', '#8F7B6C')
                            .attr('transform', `translate(${radius},${radius})`)
        collector_stamped.append('path')
                            .attr('d', arcGeneratorRight)
                            .attr('fill', '#8F7B6C')
                            .attr('transform', `translate(${radius + (svg_width * 0.85 - radius) * (owned_seal_num / seal_mapped_list.length)},${radius})`)
        collector_stamped.append('text')
                            .attr('x', (svg_width * 0.85) * (owned_seal_num / seal_mapped_list.length) + radius)
                            .attr('y', svg_height * 0.3)
                            .attr('dy', svg_height * 0.3)
                            .attr("text-anchor", "end")
                            .text(owned_seal_num.toString())
                            .attr('font-size', svg_height * 0.7)
                            .attr('fill', 'white')
    }
}

export function renderCollectorSealIconGroup(collector_list, icon_size) {
    const container_width = $('.seal-icon-group').width(), // 虽然有多个group，但是他们的width相同
          gap = (container_width - icon_size * 10) / 9 // 1行放10个seal icon

    for (let i in collector_list) {
        const collector_name = collector_list[i]['collector_name'],
              seal_group = collector_list[i]['seals']
        let svg = d3.select(`#seal-icon-group-${collector_name}`) // '#seal-circle-container'也行
                    .attr('width', container_width)
                    .attr('height', Math.ceil(seal_group.length / 10) * icon_size + icon_size * 0.3 * 1 + (Math.ceil(seal_group.length / 10) - 1) * icon_size * 0.4) // 按理来说应该是0.3 * 2
        // 首先清除此前所有元素
        svg.selectAll('g').remove()

        let unselected_layer =  svg.append('g')
                                    // .attr('class', 'seal-collector-icon-unselected-layer') // 移动至rect中
        unselected_layer.append('rect')
                        .attr('class', 'seal-collector-icon-unselected-layer')
                        .attr('x', 0)
                        .attr('y', 0)
                        .attr('width', container_width)
                        .attr('height', Math.ceil(seal_group.length / 10) * icon_size + icon_size * 0.3 * 1 + (Math.ceil(seal_group.length / 10) - 1) * icon_size * 0.4)
                        .attr('fill', 'white')
                        .style('opacity', 0)

        let seal_icon = svg.selectAll('.seal-icon-group')
                            .data(seal_group)
                            .join('g')
                            // .attr('id', (d) => `seal-icon-rect-${d['seal_name']}`) // 移至rect
                            .attr('transform', (d, i) => `translate(${i % 10 * (icon_size + gap)},${Math.floor(i / 10) * icon_size * (1 + 0.4) + icon_size * 0.3})`)
        seal_icon.append('rect')
                    .attr('x', 0)
                    .attr('y', 0)
                    .attr('width', icon_size)
                    .attr('height', icon_size)
                    .attr('class', 'seal-single-icon')
                    .attr('id', (d) => `seal-icon-rect-${d['seal_name']}`)
                    // .attr('fill', '#A56752')
                    .attr('fill', TypeColor.color_list[collector_name])
                    .attr('fill-opacity', 0.6)
                    // .attr('fill-opacity', (d) => d['seal_pic'][0]['series_list'].includes(card_list[i]['index']) ? 1 : 0.6)
        seal_icon.append('text')
                    .attr('x', icon_size / 2)
                    .attr('y', icon_size / 2)
                    .attr('dy', icon_size * 0.325)
                    .attr("text-anchor", "middle")
                    .text((d) => d['seal_pic'].length)
                    .attr('font-size', icon_size * 1)
                    .attr('fill', 'white')
                    .style('visibility', (d) => d['seal_pic'].length === 1 ? 'hidden' : 'visible')     
    }
}

// 计算collector card的位置
export function computeCollectorCardPosition(collector_list, card_size) {
    const card_width = card_size['width'],
          card_height = card_size['height']
    timeScale = d3.scaleLinear()
                    .domain(TimescaleParam.timeScale_param()['domain'])
                    .range(TimescaleParam.timeScale_param()['range'])
    // 使用自定义的比较函数按 name 键值升序排序
    collector_list.sort((a, b) => {
        if (a['life_span'][0] < b['life_span'][0]) return -1
        if (a['life_span'][0] > b['life_span'][0]) return 1
        return 0
    })

    // initialize the collector_pos dict
    let collector_pos_dict = {}
    for (let i in collector_list) {
        collector_pos_dict[collector_list[i]['collector_name']] = {
            x: timeScale(collector_list[i]['life_span'][0]),
            y: card_height * 0.1
        }
    }
    console.log('collector_pos_dict', collector_pos_dict)

    // 再次遍历，检测位置conflict并修改
    for (let i in collector_list) {
        const cur_collector = collector_list[i],
              cur_pos_param = collector_pos_dict[cur_collector['collector_name']] // x, y
        if (i > 0) {
            const prev_collector = collector_list[i - 1],
                  prev_pos_param = collector_pos_dict[prev_collector['collector_name']] // x, y
            if (cur_pos_param['x'] < prev_pos_param['x'] + card_width) {
                if (prev_pos_param['y'] === card_height * 0.1) {
                    collector_pos_dict[cur_collector['collector_name']]['y'] = card_height * 1.3
                } else if (prev_pos_param['y'] === card_height * 1.3) {
                    collector_pos_dict[cur_collector['collector_name']]['y'] = card_height * 2.5
                } else if (prev_pos_param['y'] === card_height * 2.5) {
                    collector_pos_dict[cur_collector['collector_name']]['y'] = card_height * 3.7
                } else {
                    collector_pos_dict[cur_collector['collector_name']]['y'] = card_height * 0.1
                }
            }
        }
    }
    // 对于“--”进行特殊处理
    collector_pos_dict['--'] = {
        x: timeScale(1820),
        y: card_height * 2.5
    }
    return collector_pos_dict
}