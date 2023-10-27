import * as d3 from "d3";
const $ = require("jquery");

import { jsonCopy } from "@/utils/copy";
import * as TimescaleParam from "@/utils/timescale_param";

const margin = {
    top: 0.01,
    left: 0.01,
    right: 0.01,
    bottom: 0.01,
};

let timeScale

export function draw_seal_circle(seal_data, rem) {
    timeScale = d3.scaleLinear()
                    .domain(TimescaleParam.timeScale_param()['domain'])
                    .range(TimescaleParam.timeScale_param()['range'])
    let parentDiv = document.getElementById("seal-circle-container")
    let svg = d3.select('.seal-circle-container') // '#seal-circle-container'也行
                .append('svg')
                .attr('class', 'seal-circle-svg')
                .attr('width', parentDiv.clientWidth * (1 - margin.left - margin.right))
                .attr('height', parentDiv.clientHeight)
    console.log('seal_data', seal_data)
    let seal_group = svg.selectAll('g')
                        .data(seal_data['collectors'])
                        .join('g')
                        .attr('id', (d) => `${d['collector_name']}-seal-circle-group`)
                        .attr('transform', (d) => `translate(${timeScale((d['life_span'][0] + d['life_span'][1]) / 2)},0)`)
    let single_seal = seal_group.selectAll('g')
                                .data((d) => d.seals)
                                .join('g')
                                .attr('id', (d) => `${d['seal_name']}-circle`)
                                .attr("transform", (d, i) =>
                                    `translate(0,${$('.seal-circle-svg').height() - (rem * 3 / 15) * i})`
                                )
    console.log($('.seal-circle-svg').height())                
    single_seal.append('circle')
                
                .attr("r", rem / 15)
                .attr("fill", 'steelblue')
}

export function SealCardMapping(seal_data) { // 将所有的印章图片加载成为一个list
    let seal_mapped_list = []
    for (let i in seal_data['collectors']) { // 遍历每一个鉴藏者
        const cur_collector = seal_data['collectors'][i]
        const collector_para = {
            'collector_id': cur_collector['collector_id'],
            'collector_id_ori': cur_collector['collector_id_ori'],
            'collector_name': cur_collector['collector_name'],
            'intro': cur_collector['intro'],
            'life_span': cur_collector['life_span']
        }
        for (let j in cur_collector['seals']) {
            const cur_seal = cur_collector['seals'][j],
                  seal_name = cur_seal['seal_name'],
                  series_num = cur_seal['seal_pic'].length

            // 首次遍历，记录 seal_pic_index
            let seal_pic_index_list = []
            for (let k in cur_seal['seal_pic']) {
                seal_pic_index_list.push(cur_seal['seal_pic'][k]['index'])
            }
            // 再次遍历，map list添加属性
            for (let k in cur_seal['seal_pic']) {
                seal_mapped_list.push({...cur_seal['seal_pic'][k], 
                    'seal_name': seal_name,
                    'series_num': series_num,
                    'series_list': seal_pic_index_list,
                    'image_href': 'http://vis.pku.edu.cn/seal_visualization/assets/seal_images/que_hua_qiu_se_tu_juan/seal_' + cur_seal['seal_pic'][k]['index'] + '.jpg',
                    'collector_seal_offset': j, // 当前所属的鉴藏者seal的相对偏移量offset
                    ...collector_para
                })
            }
        }
    }
    console.log('seal_mapped_list', seal_mapped_list) // success
    return seal_mapped_list
}

export function getSealCardContainerSize() { // 根据屏幕大小计算印章信息卡片的尺寸
    let sWidth = $(".time-axis").width()
    let renderRange = [0.08 * sWidth, sWidth * (1 - margin.left - margin.right)]
    let renderWidth = renderRange[1] - renderRange[0]
    return { // 仅需知道width,长度按照比例计算
        x: 0.08 * sWidth,
        width: renderWidth
    }
}

export function renderSealIconGroup(card_list, icon_size) { // here "index" is in number format
    const container_width = $('.seal-icon-group').width(), // 虽然有多个group，但是他们的width相同
          gap = (container_width - icon_size * 6) / 5
    let collector_seal_dict = {}
    // 第1次遍历，将seal_pic按照人物聚类
    for (let i in card_list) {
        if (!collector_seal_dict.hasOwnProperty(card_list[i]['collector_name'])) { // 当前印章的鉴藏者还没有录入
            collector_seal_dict[card_list[i]['collector_name']] = [card_list[i]]
        } else {
            collector_seal_dict[card_list[i]['collector_name']].push(card_list[i])
        }
    }
    // 第2次遍历，render
    for (let i in card_list) {
        let svg = d3.select(`#seal-icon-group-${card_list[i]['index']}`) // '#seal-circle-container'也行
                    .attr('width', container_width)
        let seal_group = collector_seal_dict[card_list[i]['collector_name']]
        let seal_icon = svg.selectAll('g')
                            .data(seal_group)
                            .join('g')
                            .attr('class', (d) => `seal-icon-rect-${d['index']}`)
                            .attr('transform', (d, i) => `translate(${i % 6 * (icon_size + gap)},${Math.floor(i / 6) * icon_size * (1 + 0.4) + icon_size * 0.3})`)
        seal_icon.append('rect')
                 .attr('x', 0)
                 .attr('y', 0)
                 .attr('width', icon_size)
                 .attr('height', icon_size)
                 .attr('fill', '#A56752')
        seal_icon.append('text')
                 .attr('x', icon_size / 2)
                 .attr('y', icon_size / 2)
                 .attr('dy', icon_size * 0.325)
                 .attr("text-anchor", "middle")
                 .text((d) => d['series_num'])
                 .attr('font-size', icon_size * 1)
                 .attr('fill', 'white')
                 .style('visibility', (d) => d['series_num'] === 1 ? 'hidden' : 'visible')
    }
    
}
