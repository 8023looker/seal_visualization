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
// 序号setTimeout后再执行
// timeScale = d3.scaleLinear()
//                     .domain(TimescaleParam.timeScale_param()['domain'])
//                     .range(TimescaleParam.timeScale_param()['range'])

// export function getSealNameList(seal_data) { // 暂时不需要
//     for (let i in seal_data['collectors']) {
//         for (let j in seal_data['collectors'][i]['seals']) {

//         }
//     }
// }

export function card2circleLink(seal_pic_list, unit_pixel) {
    // console.log("seal_data in card2circleLink", seal_pic_list)
    d3.select('#card2circle-link-svg').selectAll('g').remove()
    let eventDiv = document.getElementById('seal-card-container') // 信息卡片container

    let link_group = d3.select('#card2circle-link-svg').append('g').attr('class', 'card2circle-group')

    // 获取各部分本身的偏移量
    let link_svg_offset = $('#card2circle-link-svg').offset(), // render line link svg本身的偏移量
        circle_svg_offset = $('.seal-circle-svg').offset(), // seal circle svg本身的偏移量
        seal_card_svg_offset = $('.seal-card-container').offset() // seal information card container本身的偏移量

    // 定义路径数据
    let pathData = d3.path()

    // 设置拐角radius
    const inflexion_radius = unit_pixel

    // 遍历每一个seal card
    for (let i in seal_pic_list) {
        const seal = seal_pic_list[i]
        // console.log(seal, `#${seal['seal_name']}-circle`, $(`#${seal['seal_name']}-circle`).offset(), $(`#${seal['seal_name']}-circle`).width(), d3.select(`#${seal['seal_name']}-circle`).node().getBBox().width)
        let card_pos = $(`#seal-card-${seal['seal_name']}-${seal['index']}`).offset(), // jQuery相对于整个页面的offset
            circle_pos = $(`#${seal['seal_name']}-circle`).offset()
        let card_point_pos = {
            top: card_pos.top + $(`#seal-card-${seal['seal_name']}-${seal['index']}`).height() + unit_pixel * 2,
            left: card_pos.left + $(`#seal-card-${seal['seal_name']}-${seal['index']}`).width() / 2
            },
            circle_point_pos = {
                top: circle_pos.top,
                left: circle_pos.left + d3.select(`#${seal['seal_name']}-circle`).node().getBBox().width / 2 // jQuery的$(`#${seal['seal_name']}-circle`).width()不起作用
            }
        let average_point_pos = {
                top: (card_point_pos.top + circle_point_pos.top) / 2 + Math.random() * unit_pixel,
                left: (card_point_pos.left + circle_point_pos.left) / 2
            }
        let link_pos // 计算各个拐点的坐标

        // 设置绘制line的限定（否则渲染过慢）
        let ifRender = !(card_point_pos.left < seal_card_svg_offset.left || card_point_pos.left > seal_card_svg_offset.left + $('.seal-card-container').width() // seal card 只有在container视野范围内移动才进行link的绘制
                        || circle_point_pos.left < seal_card_svg_offset.left || circle_point_pos.left > seal_card_svg_offset.left + $('.seal-card-container').width()) // 印章circle不动，其实没有必要
        if (ifRender) {
            // 计算各个拐点的坐标
            link_pos = [
                { // 起始点
                    x: card_point_pos.left - link_svg_offset.left,
                    y: card_point_pos.top - link_svg_offset.top
                }, { // arc1 start
                    x: card_point_pos.left - link_svg_offset.left,
                    y: average_point_pos.top - link_svg_offset.top - inflexion_radius
                }, { // arc1 end
                    x: (card_point_pos.left - circle_point_pos.left) > 0 ? card_point_pos.left - inflexion_radius - link_svg_offset.left : card_point_pos.left + inflexion_radius - link_svg_offset.left,
                    y: average_point_pos.top - link_svg_offset.top
                }, { // arc2 start
                    x: (card_point_pos.left - circle_point_pos.left) > 0 ? circle_point_pos.left + inflexion_radius - link_svg_offset.left : circle_point_pos.left - inflexion_radius - link_svg_offset.left,
                    y: average_point_pos.top - link_svg_offset.top
                }, { // arc2 end
                    x: circle_point_pos.left - link_svg_offset.left,
                    y: average_point_pos.top - link_svg_offset.top + inflexion_radius
                }, { // end
                    x: circle_point_pos.left - link_svg_offset.left,
                    y: circle_point_pos.top - link_svg_offset.top
                }
            ]

            pathData.moveTo(link_pos[0].x, link_pos[0].y) // 移动到起始点
            pathData.lineTo(link_pos[1].x, link_pos[1].y)
            pathData.arcTo(link_pos[1].x, link_pos[2].y, link_pos[2].x, link_pos[2].y, inflexion_radius) // 绘制圆弧
            pathData.lineTo(link_pos[3].x, link_pos[3].y)
            pathData.arcTo(link_pos[4].x, link_pos[3].y, link_pos[4].x, link_pos[4].y, inflexion_radius) // 绘制圆弧
            pathData.lineTo(link_pos[5].x, link_pos[5].y)

            // 在SVG中添加路径元素
            d3.selectAll(`#${seal['seal_name']}-card2circle-${seal['index']}`).remove()
            link_group.append("path")
                        .attr("d", pathData.toString()) // 设置路径的数据
                        .attr('id', `${seal['seal_name']}-card2circle-${seal['index']}`)
                        .attr("stroke", "#D3BEAF") // 设置线段颜色
                        .attr("stroke-width", 0.5) // 设置线段宽度
                        .attr("fill", "none") // 设置填充为无填充
                        // .style('opacity', 0.5)
                        // .style('visibility', () => {
                        //     if (card_pos.left < myDiv.getBoundingClientRect().left || card_pos.left + 0.6 * rem > myDiv.offsetWidth + myDiv.getBoundingClientRect().left) { // 0.3
                        //         return 'hidden'
                        //     } else {
                        //         return 'visible'
                        //     }
                        // })
        }

        // 实时监听event card的横坐标
        eventDiv.addEventListener('scroll', function() { // 实时监听scroll
            // console.log('seal card container 移动啦', d3.selectAll(`#${seal['seal_name']}-card2circle-${seal['index']}`))
            // d3.selectAll(`#${seal['seal_name']}-card2circle-${seal['index']}`).remove()

            // 更新card_pos的坐标
            card_pos = $(`#seal-card-${seal['seal_name']}-${seal['index']}`).offset() // jQuery相对于整个页面的offset
                circle_pos = $(`#${seal['seal_name']}-circle`).offset()
            card_point_pos = {
                top: card_pos.top + $(`#seal-card-${seal['seal_name']}-${seal['index']}`).height(),
                left: card_pos.left + $(`#seal-card-${seal['seal_name']}-${seal['index']}`).width() / 2
            }
            circle_point_pos = {
                top: circle_pos.top,
                left: circle_pos.left + d3.select(`#${seal['seal_name']}-circle`).node().getBBox().width / 2 // jQuery的$(`#${seal['seal_name']}-circle`).width()不起作用
            }
            average_point_pos = {
                top: (card_point_pos.top + circle_point_pos.top) / 2 + Math.random() * unit_pixel,
                left: (card_point_pos.left + circle_point_pos.left) / 2
            }

            ifRender = !(card_point_pos.left < seal_card_svg_offset.left || card_point_pos.left > seal_card_svg_offset.left + $('.seal-card-container').width() // seal card 只有在container视野范围内移动才进行link的绘制
                       || circle_point_pos.left < seal_card_svg_offset.left || circle_point_pos.left > seal_card_svg_offset.left + $('.seal-card-container').width()) // 印章circle不动，其实没有必要

            if (!ifRender) { // 不在范围内的直接将原本的link remove
                d3.selectAll(`#${seal['seal_name']}-card2circle-${seal['index']}`).remove()
            } else {
                // 计算各个拐点的坐标
                link_pos = [
                    { // 起始点
                        x: card_point_pos.left - link_svg_offset.left,
                        y: card_point_pos.top - link_svg_offset.top
                    }, { // arc1 start
                        x: card_point_pos.left - link_svg_offset.left,
                        y: average_point_pos.top - link_svg_offset.top - inflexion_radius
                    }, { // arc1 end
                        x: (card_point_pos.left - circle_point_pos.left) > 0 ? card_point_pos.left - inflexion_radius - link_svg_offset.left : card_point_pos.left + inflexion_radius - link_svg_offset.left,
                        y: average_point_pos.top - link_svg_offset.top
                    }, { // arc2 start
                        x: (card_point_pos.left - circle_point_pos.left) > 0 ? circle_point_pos.left + inflexion_radius - link_svg_offset.left : circle_point_pos.left - inflexion_radius - link_svg_offset.left,
                        y: average_point_pos.top - link_svg_offset.top
                    }, { // arc2 end
                        x: circle_point_pos.left - link_svg_offset.left,
                        y: average_point_pos.top - link_svg_offset.top + inflexion_radius
                    }, { // end
                        x: circle_point_pos.left - link_svg_offset.left,
                        y: circle_point_pos.top - link_svg_offset.top
                    }
                ]

                pathData = d3.path() // 清空pathData(否则pathData一直append，后果不堪设想...)
                pathData.moveTo(link_pos[0].x, link_pos[0].y) // 移动到起始点
                pathData.lineTo(link_pos[1].x, link_pos[1].y)
                pathData.arcTo(link_pos[1].x, link_pos[2].y, link_pos[2].x, link_pos[2].y, inflexion_radius) // 绘制圆弧
                pathData.lineTo(link_pos[3].x, link_pos[3].y)
                pathData.arcTo(link_pos[4].x, link_pos[3].y, link_pos[4].x, link_pos[4].y, inflexion_radius) // 绘制圆弧
                pathData.lineTo(link_pos[5].x, link_pos[5].y)

                // 在SVG中添加路径元素
                d3.selectAll(`#${seal['seal_name']}-card2circle-${seal['index']}`).remove()
                link_group.append("path")
                            .attr("d", pathData.toString()) // 设置路径的数据
                            .attr('id', `${seal['seal_name']}-card2circle-${seal['index']}`)
                            .attr("stroke", "#8F7B6C") // 设置线段颜色
                            .attr("stroke-width", 0.5) // 设置线段宽度
                            .attr("fill", "none") // 设置填充为无填充
                            .style('opacity', 0.5)
                            // .style('visibility', () => {
                            //     if (card_pos.left < myDiv.getBoundingClientRect().left || card_pos.left + 0.6 * rem > myDiv.offsetWidth + myDiv.getBoundingClientRect().left) { // 0.3
                            //         return 'hidden'
                            //     } else {
                            //         return 'visible'
                            //     }
                            // })
            }
                            
        })
    }
}