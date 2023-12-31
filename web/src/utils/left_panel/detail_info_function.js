import * as d3 from "d3";
const $ = require("jquery");

import { jsonCopy } from "@/utils/copy";
import * as TypeColor from "@/theme/type_color";

export function getSealPicDetail(seal_list, selection_value) { // selection_value: list(寻找的是最后一个seal_pic index)
    const seal_pic_index = selection_value[selection_value.length - 1]
    let detail_panel_info = seal_list.find(function(obj) { // current clicked seal_pic
                            return obj["index"] === seal_pic_index
                        })
    let series_list_sorted = jsonCopy(detail_panel_info["series_list"])
    series_list_sorted = resortSealPicList(series_list_sorted, selection_value)
    detail_panel_info["image_href_list"] = series_list_sorted.map(function(obj) {
        return "http://vis.pku.edu.cn/seal_visualization/assets/seal_images/que_hua_qiu_se_tu_juan/seal_" + obj + ".jpg"
    })
    console.log('detail_panel_info', detail_panel_info)
    return detail_panel_info
}

function resortSealPicList(seal_pic_list, selection_value_ori) {
    // seal_pic_list: list
    let selection_value = jsonCopy(selection_value_ori)
    let lastElement = selection_value[selection_value.length - 1]
    selection_value.pop() // 删除最后一个元素

    // 过滤出包含 selection_value 的元素
    let included_list = seal_pic_list.filter(item => selection_value.includes(item))

    // 过滤出不包含 selection_value 的元素
    let excluded_list = seal_pic_list.filter(item => !selection_value.includes(item) && item !== lastElement)

    // 合并两个子数组（list1在list2前面）
    let result_list = included_list.concat(excluded_list)
    // 将被删除的元素添加到数组的开头
    result_list.unshift(lastElement) // 当前点击的seal pic放在最前面

    if (result_list.length === seal_pic_list.length) {
        return result_list
    } else {    
        console.log('error: result_list.length !== seal_pic_list.length')
        return seal_pic_list
    }
}
