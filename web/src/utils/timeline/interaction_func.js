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

// timeline视图中对hover操作做出的一系列响应
export function HoverNull(selection) { // hover.entity === null
    // 对于seal_card的响应操作
    let sealCardGroup = document.querySelector('#seal-card-container') // document.getElementById('seal-card-container')
    let sealCardDivs = sealCardGroup.querySelectorAll('.card-rect') // list(190)
    sealCardDivs.forEach(function(div) {
        d3.select(div)
            .style('border', '2px solid #8F7B6C')
            .style("filter", 'none')
    })
    // 对于 seal-rect-group 的响应操作
    // for seal rect above timeAxis
    let seal_rect_svg = document.querySelector(".seal-circle-svg")
    let sealRectGroup = seal_rect_svg.querySelectorAll('.seal-single-rect')
    sealRectGroup.forEach(function(div) {
        d3.select(div)
            .style('opacity', 1)
            .style("filter", 'none')
    })
    // for seal rect in collectors' card
    let seal_rect_collector_group = document.querySelectorAll(".seal-icon-group")
    seal_rect_collector_group.forEach(function(collector_div) {
        let sealRectGroupCollector = collector_div.querySelectorAll('.seal-single-icon')
        sealRectGroupCollector.forEach(function(div) {
            d3.select(div)
                .style('opacity', 1)
                .style("filter", 'none')
        })
    })

    if (selection.entity === null) { // 当前没有处于selection状态的entity
        // 待添加
    } else { // 当前存在元素处于selected状态
        if (selection.entity === 'collector') {
            // 待添加
        } else if (selection.entity === 'seal_name') {
            // console.log('selection', selection)
            HoverSealName(selection.value, true)
        }
    }
}

export function HoverSealName(seal_name, ifHoverNull) { // ifSelected is Boolean
    // 对于 seal_card 的响应操作
    // 获取包含div组的父元素
    let sealCardGroup = document.querySelector('#seal-card-container') // document.getElementById('seal-card-container')

    // 获取div组中所有的div元素
    let sealCardDivs = sealCardGroup.querySelectorAll('.card-rect') // list(190)

    // 遍历div元素并进行判断(需要修改成for循环)
    let findFirstSealCard = false
    sealCardDivs.forEach(function(div) {
        // 获取div的id并进行一系列数据处理
        let processedId = div.id.split('-')[2]

        // 判断是否符合条件
        if (processedId === seal_name) {
            d3.select(div)
                .style('border', '3px solid #8F7B6C')
                .style("filter", 'drop-shadow(0.2px 0.2px 0.2px rgb(0 0 0 / 0.6))')

            if (!findFirstSealCard && !judgeIfVisible(sealCardGroup, div) && !ifHoverNull) {
                // 滚动到指定位置
                // console.log('还没有偏移到指定位置', div.offsetParent.style.left, document.getElementById('seal-card-container').scrollLeft)
                // const seal_card_container = document.getElementById('seal-card-container')
                // seal_card_container.scrollLeft = parseInt(div.offsetParent.style.left)
                sealCardGroup.scrollTo({
                    left: parseInt(div.offsetParent.style.left),
                    behavior: 'smooth'
                })
                findFirstSealCard = true
            } else {
                // continue
            }
        }
    })

    // 对于 seal-rect-group 的响应操作
    // for seal rect above timeAxis
    let seal_rect_svg = document.querySelector(".seal-circle-svg")
    let sealRectGroup = seal_rect_svg.querySelectorAll('.seal-single-rect')
    sealRectGroup.forEach(function(div) {
        let processedId = div.id.split('-')[0]
        if (processedId === seal_name) {
            d3.select(div)
                .style('opacity', 0.5)
                .style("filter", 'drop-shadow(0.2px 0.2px 0.2px rgb(0 0 0 / 0.6))')
        } else {
            // continue
        }
    })
    // for seal rect in collectors' card
    let seal_rect_collector_group = document.querySelectorAll(".seal-icon-group")
    seal_rect_collector_group.forEach(function(collector_div) {
        let sealRectGroupCollector = collector_div.querySelectorAll('.seal-single-icon')
        // console.log('sealRectGroupCollector', sealRectGroupCollector)
        sealRectGroupCollector.forEach(function(div) {
            let processedId = div.id.split('-')[3]
            if (processedId === seal_name) {
                d3.select(div)
                    .style('opacity', 0.4)
                    .style("filter", 'drop-shadow(1px 1px 1px rgb(0 0 0 / 0.6))')
            } else {
                // continue
            }
        })
    })
}

// 判断一个元素当前是否处于可视范围内
function judgeIfVisible(seal_card_container, cur_div) {
    let ifVisible = seal_card_container.scrollLeft < parseInt(cur_div.offsetParent.style.left)
                    && (seal_card_container.scrollLeft + seal_card_container.offsetWidth) > parseInt(cur_div.offsetParent.style.left)
    return ifVisible
}