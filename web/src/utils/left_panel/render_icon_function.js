import * as d3 from "d3";
const $ = require("jquery");

import { jsonCopy } from "@/utils/copy";
import * as TypeColor from "@/theme/type_color";

export function renderSealRatioIcon(rem) {
    const svg_height = rem * 1.5, // svg高度 $(`.seal-ratio-icon-svg`).height()，现在替换为rem为计量高度
          svg_width = $(`.seal-ratio-icon-svg`).width(), // svg宽度
          radius = svg_height * 0.75 / 2

    let svg = d3.select(`.seal-ratio-icon-svg`)
    let ratio_group = svg.append('g')
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
                        .attr('class', 'total_stamped-icon')
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
                    .text('全部')
                    .attr('font-size', svg_height * 0.7)
                    .attr('fill', '#8F7B6C')


    let collector_stamped = ratio_group.append('g')
                                        .attr('class', 'collector_stamped-icon')
    collector_stamped.append('rect') // 鉴藏者加盖印章的数目
                        .attr('x', radius)
                        .attr('y', 0)
                        .attr('width', (svg_width * 0.85 - radius) * 0.5)
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
                        .attr('transform', `translate(${radius + (svg_width * 0.85 - radius) * 0.5},${radius})`)
    collector_stamped.append('text')
                        .attr('x', (svg_width * 0.85) * 0.5 + radius)
                        .attr('y', svg_height * 0.3)
                        .attr('dy', svg_height * 0.3)
                        .attr("text-anchor", "end")
                        .text('已盖')
                        .attr('font-size', svg_height * 0.7)
                        .attr('fill', 'white')
}