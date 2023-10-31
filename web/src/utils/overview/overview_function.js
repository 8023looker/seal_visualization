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

export function thumbnailDragFullImage() {
    const image_thumbnail_ratio = $('.long-image').width() / $('.thumbnail-image').width()
    // 获取要滚动的 div 元素
    const fullImageContainer = document.getElementById('full-image-container') // 用您实际的元素 ID 替换 "yourDivId"
    // 滚动到指定位置
    fullImageContainer.scrollLeft = export_thumbnail_rect_x * image_thumbnail_ratio
}

export function fullImageDragThumbnail() {
    const thumbnail_image_ratio = $('.thumbnail-image').width() / $('.long-image').width()
    d3.select('#thumbnail_rect').attr('x', export_full_image_container_x *  thumbnail_image_ratio)
}
