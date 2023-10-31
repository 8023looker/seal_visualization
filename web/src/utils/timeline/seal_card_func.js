import * as d3 from "d3";
const $ = require("jquery");

import { jsonCopy } from "@/utils/copy";
import * as TimescaleParam from "@/utils/timescale_param";
import * as TypeColor from "@/theme/type_color";

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
    const seal_circle_radius = rem / 3 // circle半径
    // 首先清除原本的svg
    d3.select('.seal-circle-container').selectAll('svg').remove()
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
                        .attr('transform', (d) => `translate(${timeScale((d['life_span'][0] + d['life_span'][1]) / 2)},0)`) // basic version, 首先移动到life_span中心点处

    let single_seal = seal_group.selectAll('g')
                                .data((d) => d.seals)
                                .join('g')
                                // .attr("transform", (d, i) =>
                                //     `translate(0,${$('.seal-circle-svg').height() - (rem * 3 / 15) * i})`
                                // ) // basic version
                                .attr('transform', (d, i, array) => {
                                    const seal_per_column = 6, // 每列放seal_name icon的个数
                                          column_num = Math.ceil(array.length / seal_per_column),
                                          group_container_width = column_num * seal_circle_radius * 2 + (column_num - 1) * seal_circle_radius * 0.1 // 最后计算出来的坐标整体左移 group_container_width / 2 个单位
                                    return `translate(${Math.floor(i / 6) * seal_circle_radius * (2 + 0.1) - group_container_width / 2 - seal_circle_radius},${$('.seal-circle-svg').height() * 0.9 - ((i % 6) * seal_circle_radius * (2 + 0.5)) - seal_circle_radius * 1.1})`
                                })
    console.log($('.seal-circle-svg').height())                
    single_seal.append('circle')
                .attr('id', (d) => `${d['seal_name']}-circle`)      
                .attr("r", seal_circle_radius) // basic version (too small)
                // .attr("fill", '#A56752')
                // .attr('fill', (d) => {
                //     const group1Data = single_seal.select(function() {
                //         return this.parentElement;
                //     }).datum();
                //     console.log('datum', group1Data)
                //     return '#A56752'
                // })
                .attr('fill', (d) => d['collector_color'])
                // .attr('stroke', 'white')
                .append("title") // hover时的小小tooltip
                    .text((d) => `${d.seal_name}`);
}

export function SealCardMapping(seal_data) { // 将所有的印章图片加载成为一个list
    let seal_mapped_list = []

    // 首先对collectors按照出生时间排序
    seal_data['collectors'].sort((a, b) => {
        if ((a['life_span'][0] + a['life_span'][1]) / 2 < (b['life_span'][0] + b['life_span'][1]) / 2) return -1
        if ((a['life_span'][0] + a['life_span'][1]) / 2 > (b['life_span'][0] + b['life_span'][1]) / 2) return 1
        return 0
    })

    for (let i in seal_data['collectors']) { // 遍历每一个鉴藏者
        const cur_collector = seal_data['collectors'][i]
        const collector_para = {
            'collector_id': cur_collector['collector_id'],
            'collector_id_ori': cur_collector['collector_id_ori'],
            'collector_name': cur_collector['collector_name'],
            'intro': cur_collector['intro'],
            'life_span': cur_collector['life_span'],
            'collector_color': TypeColor.color_list[cur_collector['collector_name']]
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
                    'stamped_year': cur_collector['life_span'], // 盖章时间，暂时等于鉴藏者的life span，留出接口
                    ...collector_para
                })
            }
        }
    }
    console.log('seal_mapped_list', seal_mapped_list) // success
    return seal_mapped_list
}

export function getSealCardContainerSize() { // 根据屏幕大小计算印章信息卡片的尺寸
    let sWidth = $(".main-panel").width() * 0.99 // $(".time-axis").width()
    let renderRange = [0.08 * sWidth, sWidth * (1 - margin.left - margin.right)]
    let renderWidth = renderRange[1] - renderRange[0]
    return { // 仅需知道width,长度按照比例计算
        x: 0.08 * sWidth,
        width: renderWidth
    }
}

export function reconstructSealData(card_list) { // reconstruct collector_seal_dict
    let collector_seal_dict = {} // 层级结构，鉴藏者(dict)-印章名称(以list的形式存在)-印章图片(seal_pic, 以list的形式存在)
    // 第1次遍历card_list，将seal_pic按照人物聚类
    for (let i in card_list) {
        if (!collector_seal_dict.hasOwnProperty(card_list[i]['collector_name'])) { // 当前印章的鉴藏者还没有录入
            collector_seal_dict[card_list[i]['collector_name']] = [{
                'seal_name': card_list[i]['seal_name'],
                'seal_pic': [card_list[i]]
            }]
        } else { // 当前鉴藏者已经录入
            let found_seal_name = false
            for (let j in collector_seal_dict[card_list[i]['collector_name']]) { // 遍历seal_name
                if (collector_seal_dict[card_list[i]['collector_name']][j]['seal_name'] === card_list[i]['seal_name']) {
                    found_seal_name = true
                    collector_seal_dict[card_list[i]['collector_name']][j]['seal_pic'].push(card_list[i])
                    break
                } else {
                    continue
                }
            }
            if (!found_seal_name) { // 没有录入当前的印章名称
                collector_seal_dict[card_list[i]['collector_name']].push({
                    'seal_name': card_list[i]['seal_name'],
                    'seal_pic': [card_list[i]]
                })
            }
        }
    }
    return collector_seal_dict
}

export function renderSealIconGroup(card_list, icon_size) { // here "index" is in number format
    const container_width = $('.seal-icon-group').width(), // 虽然有多个group，但是他们的width相同
          gap = (container_width - icon_size * 6) / 5
    let collector_seal_dict = reconstructSealData(card_list) // 层级结构，鉴藏者-印章名称-印章图片

    // 遍历card_list，render
    for (let i in card_list) {
        let seal_group = collector_seal_dict[card_list[i]['collector_name']]
        let svg = d3.select(`#seal-icon-group-${card_list[i]['index']}`) // '#seal-circle-container'也行
                    .attr('width', container_width)
                    .attr('height', Math.ceil(seal_group.length / 6) * icon_size + icon_size * 0.3 * 1 + (Math.ceil(seal_group.length / 6) - 1) * icon_size * 0.4) // 按理来说应该是0.3 * 2
        
        // 首先清除此前所有元素
        svg.selectAll('g').remove()
        let seal_icon = svg.selectAll('g')
                            .data(seal_group)
                            .join('g')
                            .attr('class', (d) => `seal-icon-rect-${d['seal_name']}`)
                            .attr('transform', (d, i) => `translate(${i % 6 * (icon_size + gap)},${Math.floor(i / 6) * icon_size * (1 + 0.4) + icon_size * 0.3})`)                  
    
        seal_icon.append('rect')
                 .attr('x', 0)
                 .attr('y', 0)
                 .attr('width', icon_size)
                 .attr('height', icon_size)
                //  .attr('fill', '#A56752')
                 .attr('fill', (d) => d['seal_pic'][0]['collector_color'])
                 .attr('fill-opacity', (d) => d['seal_pic'][0]['series_list'].includes(card_list[i]['index']) ? 1 : 0.6)

        seal_icon.append('text')
                 .attr('x', icon_size / 2)
                 .attr('y', icon_size / 2)
                 .attr('dy', icon_size * 0.325)
                 .attr("text-anchor", "middle")
                 .text((d) => d['seal_pic'].length)
                 .attr('font-size', icon_size * 1)
                 .attr('fill', 'white')
                 .style('visibility', (d) => d['seal_pic'].length === 1 ? 'hidden' : 'visible')
        seal_icon.append("title")
                  .text((d) => `${d.seal_name}`);
    }
}

