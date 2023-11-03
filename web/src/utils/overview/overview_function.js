import * as d3 from "d3";
const $ = require("jquery");

import { jsonCopy } from "@/utils/copy";
import * as TypeColor from "@/theme/type_color";

// detect ThumbnailRect dragging
export let export_thumbnail_rect_x = 0 // .vue文件中export_thumbnail_rect_x改变后会实时更新
export let export_full_image_container_x = 0 // .vue文件中export_full_image_container_x改变后会实时更新
// 用于导出export_thumbnail_rect_x并赋予set property进行修改
export function setThumbnailRectX(value) {
    export_thumbnail_rect_x = value
}
export function setFullImageContainerX(value) {
    export_full_image_container_x = value
}


export function detectFullImageScroll() { // 对于上面的高清大图'full-image-container
    console.log("detectImageScroll")
    let eventDiv = document.getElementById('full-image-container') // 信息卡片container
    eventDiv.addEventListener('scroll', function() { // 实时监听scroll
    //    console.log('image-container移动啦', eventDiv.scrollLeft)

    })
}

export function thumbnailDragFullImage() { // 下方缩略图的rect带动上方高清大图
    const image_thumbnail_ratio = $('.long-image').width() / $('.thumbnail-image').width()
    // 获取要滚动的 div 元素
    const fullImageContainer = document.getElementById('full-image-container')
    // 滚动到指定位置
    fullImageContainer.scrollLeft = export_thumbnail_rect_x * image_thumbnail_ratio
}

export function fullImageDragThumbnail() { // 上方高清大图带动下方缩略图的rect
    const thumbnail_image_ratio = $('.thumbnail-image').width() / $('.long-image').width()
    d3.select('#thumbnail_rect').attr('x', export_full_image_container_x *  thumbnail_image_ratio)
}

// click seal card的"prev", "next" button后，scrollTo下一个/上一个seal card所在view
export function clickPrevNextButton(cur_seal, seal_mapped_list, resize_scale, selection, button_choice) { // button_choice: "prev", "next"
    // cur_seal: 当前选中的seal pic detail
    // seal_mapped_list: 全部seal_pic_list
    // 获取要滚动的 div 元素
    const fullImageContainer = document.getElementById('full-image-container')
    console.log('cur_scrollLeft', fullImageContainer.scrollLeft)
    // 可以显示的区域 0.2 - 0.8
    const container_width = $('.full-image-container').width(),
          container_x = fullImageContainer.scrollLeft
    const cur_pic_offset = cur_seal['series_list'].indexOf(cur_seal['index']) // 当前seal pic所在相同seal name list中的偏移
    
    let another_pic_index = null, // prev_pic_index 或 next_pic_index
        another_pic_param = null // prev_pic_param 或 next_pic_param
    if (button_choice === 'prev' && cur_pic_offset > 0) {
        // console.log('上一个seal pic!')
        another_pic_index = cur_seal['series_list'][cur_pic_offset - 1]
    } else if (button_choice === 'next' && cur_pic_offset < cur_seal['series_list'].length - 1) {
        // console.log('下一个seal pic!')
        another_pic_index = cur_seal['series_list'][cur_pic_offset + 1]      
    }

    another_pic_param = seal_mapped_list.filter((d) => d['index'] === another_pic_index)[0]
    if (!(another_pic_param['x'] * resize_scale > container_x + container_width * 0.2 && another_pic_param['x'] * resize_scale < container_x + container_width * 0.8)) {
        let scroll_left = another_pic_param['x'] * resize_scale - container_width / 2
        fullImageContainer.scrollLeft = scroll_left < 0 ? 0 : (scroll_left + container_width > $('.image-scroll-container').width() ? $('.image-scroll-container').width() - container_width : scroll_left)
    } else {
        // 不用进行任何操作
    }

    let selection_value = selection.value // list
    if (selection.entity === 'seal_pic' && !selection_value.includes(another_pic_index)) {
        selection_value = [...new Set(selection_value)]
        selection_value.push(another_pic_index)
    } else {
        // 没有操作
    }
    return selection_value
    // 返回需要更改的selection.value list
}
