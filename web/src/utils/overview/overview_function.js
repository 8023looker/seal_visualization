import * as d3 from "d3";
const $ = require("jquery");

import { jsonCopy } from "@/utils/copy";
import * as TypeColor from "@/theme/type_color";

export function detectImageScroll() {
    console.log("detectImageScroll")
    let eventDiv = document.getElementById('full-image-container') // 信息卡片container
    eventDiv.addEventListener('scroll', function() { // 实时监听scroll
    //    console.log('image-container移动啦', eventDiv.scrollLeft)

    })
}
