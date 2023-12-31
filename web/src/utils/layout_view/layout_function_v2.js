import * as d3 from "d3";
const $ = require("jquery");

import * as LayoutFunc from "@/utils/layout_view/layout_function"

// group seal pictures according to their x position
export function get_seal_x_group(seal_mapped_list) { // seal_mapped_list is the original list
    seal_mapped_list.sort((a, b) => { // sort width in the descending order
        if (a['width'] < b['width']) return 1
        if (a['width'] > b['width']) return -1
        return 0
    })

    let seal_group_list = []
    for (let i in seal_mapped_list) {
        // initialize "del" attribute
        seal_group_list = seal_group_list.map((item) => {
            item['del'] = false
            return item
        })

        const cur_seal_pic = seal_mapped_list[i]
        if (i === 0) { // for the biggest
            seal_group_list.push({
                x_offset2prev: cur_seal_pic['x'],
                seal_pic: [cur_seal_pic],
                x: cur_seal_pic['x'],
                width: cur_seal_pic['width'],
                del: false // 仅针对多个overlay seal group merge时的情况
            })
        } else { // for i >= 1
            let overlay_group_list = [] // 与当前seal_pic产生overlay的seal_group
            for (let j in seal_group_list) {     
                let ifOverlay = !(cur_seal_pic['x'] + cur_seal_pic['width'] < seal_group_list[j]['x']
                                || seal_group_list[j]['x'] + seal_group_list[j]['width'] < cur_seal_pic['x'])
                if (ifOverlay) {
                    overlay_group_list.push(seal_group_list[j])
                    seal_group_list[j]['del'] = true
                }
            }
            if (overlay_group_list.length === 0) { // 当前没有产生overlay的seal_group
                seal_group_list.push({
                    x_offset2prev: cur_seal_pic['x'],
                    seal_pic: [cur_seal_pic],
                    x: cur_seal_pic['x'],
                    width: cur_seal_pic['width'],
                    del: false
                }) 
            } else if (overlay_group_list.length === 1) { // 当前与之产生overlay的仅有一个seal_group
                // modify the attribute of seal_group_list
                const modified_seal_group_index = seal_group_list.indexOf(overlay_group_list[0])
                seal_group_list[modified_seal_group_index]['seal_pic'].push(cur_seal_pic)
                seal_group_list[modified_seal_group_index]['x'] = Math.min(seal_group_list[modified_seal_group_index]['x'], cur_seal_pic['x'])

                let group_right_bound = seal_group_list[modified_seal_group_index]['seal_pic'].reduce((maxValue, currentItem) => {
                                            const itemValue = currentItem.x + currentItem.width
                                            return itemValue > maxValue ? itemValue : maxValue
                                        }, -Infinity)
                seal_group_list[modified_seal_group_index]['width'] = group_right_bound - seal_group_list[modified_seal_group_index]['x']

                seal_group_list = modify_sealGroup_offset2prev(seal_group_list) // 修改seal_group的x_offset2prev属性值
            } else { // 多个seal_group与之产生overlay
                // merge seal_group_list (此时del属性产生作用)
                let merged_seal_group = {}
                let seal_group_x_new = cur_seal_pic['x'], 
                    seal_group_seal_pic_new = [cur_seal_pic]

                for (let j in overlay_group_list) {
                    const cur_overlay_group = overlay_group_list[j]
                    seal_group_x_new = Math.min(cur_overlay_group['x'], seal_group_x_new)
                    seal_group_seal_pic_new = seal_group_seal_pic_new.concat(cur_overlay_group['seal_pic'])
                }

                merged_seal_group = {
                    x_offset2prev: -Infinity, // 后续修改
                    seal_pic: seal_group_seal_pic_new,
                    x: seal_group_x_new,
                    width: cur_seal_pic['width'] // 后续修改
                }

                let group_right_bound = merged_seal_group['seal_pic'].reduce((maxValue, currentItem) => {
                    const itemValue = currentItem.x + currentItem.width
                    return itemValue > maxValue ? itemValue : maxValue
                }, -Infinity)
                merged_seal_group['width'] = group_right_bound - merged_seal_group['x']

                // 删除merge前的seal group
                seal_group_list = seal_group_list.filter((d) => !d['del'])
                // 添加merged_seal_group
                seal_group_list.push(merged_seal_group)

                seal_group_list = modify_sealGroup_offset2prev(seal_group_list) // 修改seal_group的x_offset2prev属性值
            }
        }
    }
    // console.log('seal_group_list', seal_group_list)

    // merge
    let merge_seal_group_list = merge_seal_group(seal_group_list)

    // return seal_group_list
    return merge_seal_group_list
}

// 修改seal_group的x_offset2prev属性值
function modify_sealGroup_offset2prev(seal_group_list) {
    seal_group_list.sort((a, b) => {
        if (a['x'] < b['x']) return -1
        if (a['x'] > b['x']) return 1
        return 0
    })
    for (let i = 0; i < seal_group_list.length; i++) {
        if(i === 0) {
            seal_group_list[i]['x_offset2prev'] = seal_group_list[i]['x']
        } else {
            seal_group_list[i]['x_offset2prev'] = seal_group_list[i]['x'] - (seal_group_list[i - 1]['x'] + seal_group_list[i - 1]['width'])
        }
    }
    return seal_group_list
}

// 对于已经分好的seal group (48组)，间距小于 3 / 4 处的merge 
function merge_seal_group(seal_group_list) {
    // get the 3 quarter value
    let seal_group_dist_list = seal_group_list.map((item) => item['x_offset2prev'])
    seal_group_dist_list.sort((a, b) => a - b)
    const third_quarter = seal_group_dist_list[Math.round(seal_group_dist_list.length * 11 / 12)]
    
    // merge
    let seal_merged_list = []
    let cur_x = seal_group_list[0]['x'], // 当前merge大组的x
        cur_seal_pic_list = seal_group_list[0]['seal_pic'] // 当前大组的seal_pic list
    for (let i = 0; i < seal_group_list.length; i++) {
        const cur_seal_group = seal_group_list[i]
        if (i === 0) {
            // continue
        } else if (Math.ceil((cur_seal_group['x'] - cur_x) / third_quarter) <= 1) {
            cur_seal_pic_list = cur_seal_pic_list.concat(cur_seal_group['seal_pic'])
        } else {
            let group_right_bound = cur_seal_pic_list.reduce((maxValue, currentItem) => {
                const itemValue = currentItem.x + currentItem.width
                return itemValue > maxValue ? itemValue : maxValue
            }, -Infinity)
            const cur_group_width = group_right_bound - cur_x

            seal_merged_list.push({
                x_offset2prev: cur_x, // 后续修改
                seal_pic: cur_seal_pic_list,
                x: cur_x,
                width: cur_group_width
            })

            // clear
            cur_seal_pic_list = cur_seal_group['seal_pic']
            cur_x = cur_seal_group['x']
        }

        if (i === seal_group_list.length - 1) { // 到最后一组了，全部加进来
            let group_right_bound = cur_seal_pic_list.reduce((maxValue, currentItem) => {
                const itemValue = currentItem.x + currentItem.width
                return itemValue > maxValue ? itemValue : maxValue
            }, -Infinity)
            const cur_group_width = group_right_bound - cur_x

            seal_merged_list.push({
                x_offset2prev: cur_x, // 后续修改
                seal_pic: cur_seal_pic_list,
                x: cur_x,
                width: cur_group_width
            })
        }
    }
    seal_merged_list = modify_sealGroup_offset2prev(seal_merged_list) // 修改seal_group的x_offset2prev属性值
    // console.log('seal_merged_list', seal_merged_list)
    return seal_merged_list
}

export function find_subgroup_centerX(sub_seal_group) {
    // console.log('sub_seal_group', sub_seal_group)
    let group_right_bound = sub_seal_group.reduce((maxValue, currentItem) => {
        const itemValue = currentItem['layout_params']['x'] + currentItem['layout_params']['width']
        return itemValue > maxValue ? itemValue : maxValue
    }, -Infinity)
    let group_left_bound = sub_seal_group.reduce((minValue, currentItem) => {
        const itemValue = currentItem['layout_params']['x']
        return itemValue < minValue ? itemValue : minValue
    }, Infinity)
    return (group_left_bound + group_right_bound) / 2
}