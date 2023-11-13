import * as d3 from "d3";
const $ = require("jquery");

import { jsonCopy } from "@/utils/copy";
import * as TypeColor from "@/theme/type_color";
import * as LayoutFuncV2 from "@/utils/layout_view/layout_function_v2"

const margin = {
    top: 0.01,
    left: 0.01,
    right: 0.01,
    bottom: 0.01,
}

export function compute_abstract_layout(seal_mapped_list, painting_params) {
    const container_width = $('.main-panel').width(),
          container_height = $('.main-panel').height()
    const painting_center = {
        x: painting_params['width'] / 2,
        y: painting_params['height'] / 2
    }
    const resize_scale = { // 主要用于计算seal_pic之间的距离
        x_axis: container_width / painting_params['width'],
        y_axis: container_height / painting_params['height']
    }

    // 第一次遍历，对seal_pic进行缩放
    seal_mapped_list = resize_seal_size(seal_mapped_list, container_width * container_height, resize_scale)

    // 按照原画中seal pic之间的距离对seal pic进行分组
    let seal_group_list = LayoutFuncV2.get_seal_x_group(seal_mapped_list)

    // version 1(直接全部印章图片整体布局)
    // // 生成相对方位与约束距离的list (后续每一次调整印章位置的时候都要遵守约束)
    // const constraint_list = generate_constraint_list(seal_mapped_list) // dict

    // // 生成用于检测印章的优先级list
    // let seal_detect_list = generate_seal_detect_list(seal_mapped_list, painting_center)

    // // modify seal position
    // let modified_seal_list = rescale_seal_dist(seal_detect_list, constraint_list)

    // modified_seal_list = panning_overall(modified_seal_list, {
    //                         width: container_width,
    //                         height: container_height
    //                     })

    // return modified_seal_list // modified_seal_list
    // return seal_mapped_list

    let whole_modified_seal_list = []
    for (let i in seal_group_list) {
        let sub_seal_mapped_list = seal_group_list[i]['seal_pic']
        let cur_centerX = LayoutFuncV2.find_subgroup_centerX(sub_seal_mapped_list)
        // 生成相对方位与约束距离的list (后续每一次调整印章位置的时候都要遵守约束)
        const constraint_list = generate_constraint_list(sub_seal_mapped_list) // dict

        // 生成用于检测印章的优先级list
        let seal_detect_list = generate_seal_detect_list(sub_seal_mapped_list, {
            x: cur_centerX,
            y: painting_center['y']
        })

        // modify seal position
        let modified_seal_list = rescale_seal_dist(seal_detect_list, constraint_list)

        // modified_seal_list = panning_overall(modified_seal_list, {
        //                         width: container_width,
        //                         height: container_height
        //                     })

        whole_modified_seal_list = whole_modified_seal_list.concat(modified_seal_list)
    }
    console.log('whole_modified_seal_list', whole_modified_seal_list)
    return whole_modified_seal_list
}

// 对seal pic进行缩放，使用对数比例尺，使得sum(area of seal_pics)为整个画布面积的1/2
function resize_seal_size(seal_mapped_list, canvas_area, resize_scale) {
    // 使用 reduce 函数来找到最值 (no need)
    let max_area = seal_mapped_list.reduce((maxValue, currentItem) => {
                                    const itemValue = currentItem.width * currentItem.height
                                    return itemValue > maxValue ? itemValue : maxValue
                                }, -Infinity)
    let min_area = seal_mapped_list.reduce((minValue, currentItem) => {
                                    const itemValue = currentItem.width * currentItem.height
                                    return itemValue < minValue ? itemValue : minValue
                                }, Infinity)
    
    // 使用 reduce 方法来求和
    let sum_log_area = seal_mapped_list.reduce((total, currentItem) => total + currentItem.width * currentItem.height, 0)
    let ave_area = sum_log_area / seal_mapped_list.length
    let area_resize_scale =  (canvas_area / 3.65) / sum_log_area
    // console.log('max_area', 'min_area', max_area, min_area, area_resize_scale)
    // 定义对数比例尺
    const logScale1 = d3.scaleLog()
                        .domain([min_area, ave_area]) // 定义数据范围
                        .range([ave_area * 0.5 * area_resize_scale, ave_area * area_resize_scale * 0.7]), // 定义输出范围
          logScale2 = d3.scaleLog()
                        .domain([ave_area, max_area]) // 定义数据范围
                        .range([ave_area * area_resize_scale * 0.7, ave_area * 2.5 * area_resize_scale]) // 定义输出范围
    for (let i in seal_mapped_list) {
        const cur_seal_pic = seal_mapped_list[i]
        seal_mapped_list[i]['layout_params'] = {
            x: cur_seal_pic['x'] * resize_scale['x_axis'],
            y: cur_seal_pic['y'] * resize_scale['y_axis'],
            width: cur_seal_pic['width'] * cur_seal_pic['height'] < ave_area ? 
                   Math.sqrt(logScale1(cur_seal_pic['width'] * cur_seal_pic['height']) / (cur_seal_pic['height'] / cur_seal_pic['width'])) 
                   : Math.sqrt(logScale2(cur_seal_pic['width'] * cur_seal_pic['height']) / (cur_seal_pic['height'] / cur_seal_pic['width'])),
            height: cur_seal_pic['width'] * cur_seal_pic['height']  < ave_area ? 
                    Math.sqrt(logScale1(cur_seal_pic['width'] * cur_seal_pic['height']) / (cur_seal_pic['width'] / cur_seal_pic['height'])) 
                    : Math.sqrt(logScale2(cur_seal_pic['width'] * cur_seal_pic['height']) / (cur_seal_pic['width'] / cur_seal_pic['height'])),
            // width: Math.sqrt(area_resize_scale) * cur_seal_pic['width'], // * Math.sqrt(area_resize_scale)
            // height: Math.sqrt(area_resize_scale) * cur_seal_pic['height'], // * Math.sqrt(area_resize_scale)
            offset2prev: 0
        }
    }
    // judge_log_scale(seal_mapped_list) // false
    return seal_mapped_list
}

// 用于检测pic大小是否还保持原来的排序(验证logScale比例尺是否合理)
function judge_log_scale(seal_mapped_list) {
    let seal_width_list = jsonCopy(seal_mapped_list),
        seal_height_list = jsonCopy(seal_mapped_list),
        seal_area_list = jsonCopy(seal_mapped_list),
        seal_resize_width_list = jsonCopy(seal_mapped_list),
        seal_resize_height_list = jsonCopy(seal_mapped_list),
        seal_resize_area_list = jsonCopy(seal_mapped_list)
    seal_width_list.sort((a, b) => {
            if (a['width'] < b['width']) return -1
            if (a['width'] > b['width']) return 1
            return 0
        })
    seal_resize_width_list.sort((a, b) => {
            if (a['layout_params']['width'] < b['layout_params']['width']) return -1
            if (a['layout_params']['width'] > b['layout_params']['width']) return 1
            return 0
        })

    seal_height_list.sort((a, b) => {
            if (a['height'] < b['height']) return -1
            if (a['height'] > b['height']) return 1
            return 0
        })
    seal_resize_height_list.sort((a, b) => {
            if (a['layout_params']['height'] < b['layout_params']['height']) return -1
            if (a['layout_params']['height'] > b['layout_params']['height']) return 1
            return 0
        })

    seal_area_list.sort((a, b) => {
            if (a['width'] * a['height'] < b['width'] * b['height']) return -1
            if (a['width'] * a['height'] > b['width'] * b['height']) return 1
            return 0
        })
    seal_resize_area_list.sort((a, b) => {
            if (a['layout_params']['width'] * a['layout_params']['height'] < b['layout_params']['width'] * b['layout_params']['height']) return -1
            if (a['layout_params']['width'] * a['layout_params']['height'] > b['layout_params']['width'] * b['layout_params']['height']) return 1
            return 0
        })
    
    let consistency = true

    for (let i = 0; i< seal_mapped_list.length; i++) {
        // if (seal_width_list[i]['index'] !== seal_resize_width_list[i]['index'] ||
        //     seal_height_list[i]['index'] !== seal_resize_height_list[i]['index'] ||
        //     seal_area_list[i]['index'] !== seal_resize_area_list[i]['index']) {
        if (seal_area_list[i]['index'] !== seal_resize_area_list[i]['index']) { // 针对seal area的排序保持不变
                consistency = false
                console.log(i)
                console.log('width', seal_width_list[i]['index'], seal_resize_width_list[i]['index'])
                console.log('height', seal_height_list[i]['index'], seal_resize_height_list[i]['index'])
                console.log('area', seal_area_list[i]['index'], seal_resize_area_list[i]['index'])
                break
            }
    }
    console.log('seal size consistency', consistency)
}

// 重新调整印章之间的dist(x, y坐标值), greedy
function rescale_seal_dist(seal_detect_list, constraint_list) {
    console.log('seal_detect_list', seal_detect_list)
    // Priority of Move Direction
    // 1. x-axis > y-axis
    // 2. short distance > long distance
    // Priority of Constraints: not overlay > relative position > distance order
    let redefine_seal_list = []
    for (let i in seal_detect_list) {
        let seal_detect_list_copy = jsonCopy(seal_detect_list)
        const cur_redefined_seal = seal_detect_list[i]
        if (i === 0) { // 首个印章一定没有冲突
            redefine_seal_list.push(cur_redefined_seal)
        } else { // i > 0
            let conflict_param = {
                ifConflict: false, // 检测是否有seal存在冲突
                conflict_list: [] // 与当前detected seal存在冲突的seal_list
            }
            conflict_param = detectOverlay(cur_redefined_seal, redefine_seal_list)

            // new version 1
            // let ifRecursive = conflict_param['ifConflict']
            // let moving_value_list = [],
            //     prev_steps = [] // 此前已经走过的path step array(但是当前仍会产生overlay, concat后续steps后需要删除)
            // if (ifRecursive) {
            //     minimum_direction_moving_value(cur_redefined_seal, conflict_param['conflict_list'], redefine_seal_list, moving_value_list, prev_steps)
            // }

            // new version 2 // 陷入死循环，abondun
            // let modified_redefined_seal = cur_redefined_seal
            // while(conflict_param['ifConflict']) {
            //     // 计算4个方向上，防止冲突产生的移动最小值
            //     const moving_value = minimum_direction_moving_value(cur_redefined_seal, conflict_param['conflict_list'], redefine_seal_list)
            //     modified_redefined_seal = optimized_moving_direction(cur_redefined_seal, moving_value, constraint_list, seal_detect_list, redefine_seal_list)
            //     // redefine_seal_list.push(modified_redefined_seal)
            //     conflict_param = detectOverlay(modified_redefined_seal, redefine_seal_list)
            // }
            // redefine_seal_list.push(modified_redefined_seal)

            // new version 3
            if (conflict_param['ifConflict']) { // 如果存在conflict
                // 计算4个方向上，防止冲突产生的移动最小值
                const moving_value = minimum_direction_moving_value(cur_redefined_seal, conflict_param['conflict_list'], redefine_seal_list)

                let redefined_params = optimized_moving_direction(cur_redefined_seal, moving_value, constraint_list, seal_detect_list, redefine_seal_list, null)
                let modified_redefined_seal = redefined_params['modified_redefined_seal'],
                    prev_direction = redefined_params['direction']
                
                conflict_param = detectOverlay(modified_redefined_seal, redefine_seal_list)

                if (conflict_param['ifConflict']) {
                    // 改变seal_detect_list
                    const cur_substitute_seal_index = seal_detect_list.indexOf(seal_detect_list.find(obj => obj['index'] === cur_redefined_seal['index']))
                    
                    seal_detect_list_copy[cur_substitute_seal_index] = modified_redefined_seal

                    let re_moving_value = minimum_direction_moving_value(modified_redefined_seal, conflict_param['conflict_list'], redefine_seal_list)
                    let redefined_params_again = optimized_moving_direction(modified_redefined_seal, re_moving_value, constraint_list, seal_detect_list_copy, redefine_seal_list, prev_direction)

                    // console.log('prev_direction', cur_substitute_seal_index, prev_direction, redefined_params_again['direction'])
                    prev_direction = redefined_params_again['direction']
                    modified_redefined_seal = redefined_params_again['modified_redefined_seal']

                    // console.log('conflict_param', conflict_param)
                    conflict_param = detectOverlay(modified_redefined_seal, redefine_seal_list)

                    // console.log('still conflict_param', conflict_param['ifConflict'], conflict_param, prev_direction)
                }

                redefine_seal_list.push(modified_redefined_seal)
            } else { // 不存在冲突
                redefine_seal_list.push(cur_redefined_seal)
            }

            // console.log('conflict_param', conflict_param)
            // 对于conflict情况进行的操作
            // old version
            // if (conflict_param['ifConflict']) { // 如果存在conflict
            //     // 计算4个方向上，防止冲突产生的移动最小值
            //     const moving_value = minimum_direction_moving_value(cur_redefined_seal, conflict_param['conflict_list'], redefine_seal_list)
            //     let modified_redefined_seal = optimized_moving_direction(cur_redefined_seal, moving_value, constraint_list, seal_detect_list, redefine_seal_list)
            //     redefine_seal_list.push(modified_redefined_seal)
            // } else { // 不存在冲突
            //     redefine_seal_list.push(cur_redefined_seal)
            // }
        }
    }
    return redefine_seal_list
}

// 用于对印章的方位顺序进行约束
function generate_constraint_list(seal_mapped_list) {
    // relative position
    let seal_x_order_list = jsonCopy(seal_mapped_list),
        seal_y_order_list = jsonCopy(seal_mapped_list)
        
    seal_x_order_list.sort((a, b) => {
        if (a['x'] < b['x']) return -1
        if (a['x'] > b['x']) return 1
        return 0
    })
    seal_y_order_list.sort((a, b) => {
        if (a['y'] < b['y']) return -1
        if (a['y'] > b['y']) return 1
        return 0
    })
    // 计算 x_dist 和 y_dist
    for (let i in seal_mapped_list) {
        if (i > 0) {
            seal_x_order_list[i]['offset2prev'] = (seal_x_order_list[i]['x'] + seal_x_order_list[i]['layout_params']['width'] / 2) - (seal_x_order_list[i - 1]['x'] + seal_x_order_list[i - 1]['layout_params']['width'] / 2)
            seal_y_order_list[i]['offset2prev'] = (seal_y_order_list[i]['y'] + seal_y_order_list[i]['layout_params']['height'] / 2) - (seal_y_order_list[i - 1]['y'] + seal_y_order_list[i - 1]['layout_params']['height'] / 2)
        } else { // i = 0
            seal_x_order_list[i]['offset2prev'] = seal_x_order_list[i]['x'] + seal_x_order_list[i]['layout_params']['width'] / 2
            seal_y_order_list[i]['offset2prev'] = seal_y_order_list[i]['y'] + seal_y_order_list[i]['layout_params']['height'] / 2
        }
    }

    // distance order
    let seal_x_dist_list = jsonCopy(seal_x_order_list),
        seal_y_dist_list = jsonCopy(seal_y_order_list)

    seal_x_dist_list.sort((a, b) => {
            if (a['offset2prev'] < b['offset2prev']) return -1
            if (a['offset2prev'] > b['offset2prev']) return 1
            return 0
    })
    seal_y_dist_list.sort((a, b) => {
        if (a['offset2prev'] < b['offset2prev']) return -1
        if (a['offset2prev'] > b['offset2prev']) return 1
        return 0
    })
    
    return {
        x_order: seal_x_order_list,
        y_order: seal_y_order_list,
        x_dist: seal_x_dist_list,
        y_dist: seal_y_dist_list
    }
}

// 按照印章中心与container center之间的距离进行排序（半径画圆）
function generate_seal_detect_list(seal_mapped_list, painting_center) {
    const center_x = painting_center.x,
          center_y = painting_center.y
    let seal_detect_list = jsonCopy(seal_mapped_list)
    seal_detect_list.sort((a, b) => {
        if (Math.pow(a['layout_params']['x'] + a['layout_params']['width'] / 2 - center_x, 2) + Math.pow(a['layout_params']['y'] + a['layout_params']['height'] / 2 - center_y, 2) < Math.pow(b['layout_params']['x'] + b['layout_params']['width'] / 2 - center_x, 2) + Math.pow(b['layout_params']['y'] + b['layout_params']['height'] / 2 - center_y, 2)) return -1
        if (Math.pow(a['layout_params']['x'] + a['layout_params']['width'] / 2 - center_x, 2) + Math.pow(a['layout_params']['y'] + a['layout_params']['height'] / 2 - center_y, 2) > Math.pow(b['layout_params']['x'] + b['layout_params']['width'] / 2 - center_x, 2) + Math.pow(b['layout_params']['y'] + b['layout_params']['height'] / 2 - center_y, 2)) return 1
        return 0
    })
    return seal_detect_list
}

// 对于存在conflict的seal, 计算在其在每个方向上移动的最小值
// 需要改进，二次遍历检测移动后是否有其他印章图片遮挡
// 最终给出一个路径方案，[{'x': 10}, {'y': 10}, ...]的格式
// 输出的path choice全部保证seal pic之间不存在overlay
// 递归实现
// 待补充
function minimum_direction_moving_value_v2(cur_seal, conflict_list, redefine_seal_list, path_choice_list, prev_steps) {
    // 需要返回一个是否继续递归的信号
    let moving_value_list = [] // { left: 0, right: 0, up: 0, down: 0 } 
    for (let i in conflict_list) {
        const cur_conflict_seal = conflict_list[i]
        let cur2conflict = { // 当前seal position - conflict seal position
            deta_x: (cur_seal['layout_params']['x'] + cur_seal['layout_params']['width'] / 2) - (cur_conflict_seal['layout_params']['x'] + cur_conflict_seal['layout_params']['width'] / 2),
            deta_y: (cur_seal['layout_params']['y'] + cur_seal['layout_params']['height'] / 2) - (cur_conflict_seal['layout_params']['y'] + cur_conflict_seal['layout_params']['height'] / 2)
        }
        moving_value_list.push({
            left: (cur_seal['layout_params']['width'] + cur_conflict_seal['layout_params']['width']) / 2 + cur2conflict['deta_x'],
            right: (cur_seal['layout_params']['width'] + cur_conflict_seal['layout_params']['width']) / 2 - cur2conflict['deta_x'],
            up: (cur_seal['layout_params']['height'] + cur_conflict_seal['layout_params']['height']) / 2 + cur2conflict['deta_y'],
            down: (cur_seal['layout_params']['height'] + cur_conflict_seal['layout_params']['height']) / 2 - cur2conflict['deta_y']
        })
    }

    let cur_optimized_step = { // 当前各个方向最优的one step
        left: moving_value_list.reduce((maxValue, currentItem) => {
                    const itemValue = currentItem.left
                    return itemValue > maxValue ? itemValue : maxValue
                }, -Infinity),
        right: moving_value_list.reduce((maxValue, currentItem) => {
                    const itemValue = currentItem.right
                    return itemValue > maxValue ? itemValue : maxValue
                }, -Infinity),
        up: moving_value_list.reduce((maxValue, currentItem) => {
                    const itemValue = currentItem.up
                    return itemValue > maxValue ? itemValue : maxValue
                }, -Infinity),
        down: moving_value_list.reduce((maxValue, currentItem) => {
                    const itemValue = currentItem.down
                    return itemValue > maxValue ? itemValue : maxValue
                }, -Infinity)
    }

    // add path choice
    // initially为4种选择，分别为left, right, up, down (分别保证每一种路径不可以有重叠)
    for (let i = 0; i < prev_steps.length - 1; i++) { // prev_steps是一个二维数组
        // 首先去除掉之前走的那一步的相反方向
        const cur_prev_stap_list = prev_steps[i]
        const last_step = cur_prev_stap_list[cur_prev_stap_list.length - 1]
        let prohibit_direction = null // 下一步不能走的direction
        if (last_step.hasOwnProperty('x')) {
            if (last_step['x'] < 0) { // 前一步为向左移动，则下一步不可以向右移动
                prohibit_direction = 'right'
            } else { // 前一步为向右移动，则下一步不可以向左移动
                prohibit_direction = 'left'
            }
        } else if (last_step.hasOwnProperty('y')) {
            if (last_step['y'] < 0) { // 前一步为向上移动，则下一步不能向下移动
                prohibit_direction = 'down'
            } else { // 前一步为向下移动，则下一步不能向上移动
                prohibit_direction = 'up'
            }
        }
    }
    

    path_choice_list = path_choice_list.concat([[{'x': -moving_value_list.reduce((maxValue, currentItem) => {
                                    const itemValue = currentItem.left
                                    return itemValue > maxValue ? itemValue : maxValue
                                }, -Infinity),
                                'del': false}],
                            [{'x': moving_value_list.reduce((maxValue, currentItem) => {
                                const itemValue = currentItem.right
                                return itemValue > maxValue ? itemValue : maxValue
                            }, -Infinity),
                            'del': false}],
                            [{'y': -moving_value_list.reduce((maxValue, currentItem) => {
                                const itemValue = currentItem.up
                                return itemValue > maxValue ? itemValue : maxValue
                            }, -Infinity),
                            'del': false}],
                            [{'y': moving_value_list.reduce((maxValue, currentItem) => {
                                const itemValue = currentItem.down
                                return itemValue > maxValue ? itemValue : maxValue
                            }, -Infinity),
                            'del': false}]])

    path_choice_list = path_choice_list.concat([
        {
            'steps': [{'x': -moving_value_list.reduce((maxValue, currentItem) => {
                const itemValue = currentItem.left
                return itemValue > maxValue ? itemValue : maxValue
            }, -Infinity),
            'del': false}]
        }
    ])

    // 再次检测是否冲突
    for (let i in path_choice_list) {
        let cur_path = path_choice_list[i]
        
        let cur_seal_copy = jsonCopy(cur_seal)

        // if 

        for (let j in cur_path) { // 遍历当前path的每一个step
            let cur_step = cur_path[j],
                prev_step = [] // ['direction', value]
            if (cur_step.hasOwnProperty('x')) { // Object.keys(cur_step)[0] === 'x'
                cur_seal_copy['layout_params']['x'] += cur_step['x']
                // define prev_step
                prev_step = [cur_step > 0 ? 'right' : 'left', Math.abs(cur_step['x'])]
            } else if (cur_step.hasOwnProperty('y')) { // Object.keys(cur_step)[0] === 'y'
                cur_seal_copy['layout_params']['y'] += cur_step['y']
                prev_step = [cur_step > 0 ? 'down' : 'up', Math.abs(cur_step['y'])]
            }
            
            let conflict_param = {
                ifConflict: false, // 检测是否有seal存在冲突
                conflict_list: [] // 与当前detected seal存在冲突的seal_list
            }
            conflict_param = detectOverlay(cur_seal, redefine_seal_list)

            if (conflict_param['ifConflict']) {
                find_path_recursively(redefine_seal_list, conflict_param['conflict_list'], prev_step)
            }

        }
    }

    return {
        left: moving_value_list.reduce((maxValue, currentItem) => {
                    const itemValue = currentItem.left
                    return itemValue > maxValue ? itemValue : maxValue
                }, -Infinity),
        right: moving_value_list.reduce((maxValue, currentItem) => {
                    const itemValue = currentItem.right
                    return itemValue > maxValue ? itemValue : maxValue
                }, -Infinity),
        up: moving_value_list.reduce((maxValue, currentItem) => {
                    const itemValue = currentItem.up
                    return itemValue > maxValue ? itemValue : maxValue
                }, -Infinity),
        down: moving_value_list.reduce((maxValue, currentItem) => {
                    const itemValue = currentItem.down
                    return itemValue > maxValue ? itemValue : maxValue
                }, -Infinity)
    }
}

function find_path_recursively(redefine_seal_list, conflict_list, prev_step) {
    // 返回是否仍然存在冲突，以及新生成的path choice

}

function minimum_direction_moving_value(cur_seal, conflict_list) {
    let moving_value_list = [] // { left: 0, right: 0, up: 0, down: 0 }
    
    for (let i in conflict_list) {
        const cur_conflict_seal = conflict_list[i]
        let cur2conflict = { // 当前seal position - conflict seal position
            deta_x: (cur_seal['layout_params']['x'] + cur_seal['layout_params']['width'] / 2) - (cur_conflict_seal['layout_params']['x'] + cur_conflict_seal['layout_params']['width'] / 2),
            deta_y: (cur_seal['layout_params']['y'] + cur_seal['layout_params']['height'] / 2) - (cur_conflict_seal['layout_params']['y'] + cur_conflict_seal['layout_params']['height'] / 2)
        }
        moving_value_list.push({
            left: (cur_seal['layout_params']['width'] + cur_conflict_seal['layout_params']['width']) / 2 + cur2conflict['deta_x'],
            right: (cur_seal['layout_params']['width'] + cur_conflict_seal['layout_params']['width']) / 2 - cur2conflict['deta_x'],
            up: (cur_seal['layout_params']['height'] + cur_conflict_seal['layout_params']['height']) / 2 + cur2conflict['deta_y'],
            down: (cur_seal['layout_params']['height'] + cur_conflict_seal['layout_params']['height']) / 2 - cur2conflict['deta_y']
        })
    }

    return {
        left: moving_value_list.reduce((maxValue, currentItem) => {
                    const itemValue = currentItem.left
                    return itemValue > maxValue ? itemValue : maxValue
                }, -Infinity),
        right: moving_value_list.reduce((maxValue, currentItem) => {
                    const itemValue = currentItem.right
                    return itemValue > maxValue ? itemValue : maxValue
                }, -Infinity),
        up: moving_value_list.reduce((maxValue, currentItem) => {
                    const itemValue = currentItem.up
                    return itemValue > maxValue ? itemValue : maxValue
                }, -Infinity),
        down: moving_value_list.reduce((maxValue, currentItem) => {
                    const itemValue = currentItem.down
                    return itemValue > maxValue ? itemValue : maxValue
                }, -Infinity)
    }
}

// 遍历已经确定position的list
function detectOverlay(cur_redefined_seal, redefine_seal_list) {
    let conflict_param = {
        ifConflict: false, // 检测是否有seal存在冲突
        conflict_list: [] // 与当前detected seal存在冲突的seal_list
    }
    for (let i in redefine_seal_list) {
        const cur_detected_seal = redefine_seal_list[i]
        let ifConflict2Current = !(cur_detected_seal['layout_params']['x'] + cur_detected_seal['layout_params']['width'] < cur_redefined_seal['layout_params']['x'] 
                                || cur_detected_seal['layout_params']['x'] > cur_redefined_seal['layout_params']['x'] + cur_redefined_seal['layout_params']['width'])
                                && !(cur_detected_seal['layout_params']['y'] + cur_detected_seal['layout_params']['height'] < cur_redefined_seal['layout_params']['y'] 
                                || cur_detected_seal['layout_params']['y'] > cur_redefined_seal['layout_params']['y'] + cur_redefined_seal['layout_params']['height'])
        if (ifConflict2Current) { // 如果与当前既定的seal存在冲突
            conflict_param['ifConflict'] = true
            conflict_param['conflict_list'].push(cur_detected_seal)
        } else {
            continue
        }    
    }
    return conflict_param
}

// 计算当前最优的移动方向
function optimized_moving_direction(cur_redefined_seal, moving_value, constraint_list, seal_mapped_list, redefine_seal_list, prev_direction) {
    const moving_index = cur_redefined_seal['index'],
          moving_direction = ['left', 'right', 'up', 'down']
    let seal_mapped_list_copy = jsonCopy(seal_mapped_list)

    let direction_value = null // 当前方向值

    // 使用数组的 find 方法查找匹配的对象
    const foundObject = seal_mapped_list_copy.find(obj => obj['index'] === moving_index)
    // console.log('foundObject', foundObject)
    // 如果找到了匹配的对象
    if (foundObject) { // 修改该对象的其他属性
        const found_index_number = seal_mapped_list_copy.indexOf(foundObject)
        const foundObject_original_position = {
            x: seal_mapped_list_copy[found_index_number]['layout_params']['x'],
            y: seal_mapped_list_copy[found_index_number]['layout_params']['y']
        }
        let findDirection = false,
            new_seal_order = {} // new position order after changing the position of current seal
        
        for (let i in moving_direction) { // 首先是最严格的限制: not overlay && relative position && distance order
            if (moving_direction[i] === 'left') {
                seal_mapped_list_copy[found_index_number]['layout_params']['x'] -= moving_value['left']
                seal_mapped_list_copy[found_index_number]['layout_params']['y'] = foundObject_original_position['y']

                new_seal_order = generate_constraint_list(seal_mapped_list_copy)

                let ifConsistent = judge_order_consistency(new_seal_order, constraint_list, 'high')
                let ifOverlay = detectOverlay(cur_redefined_seal, redefine_seal_list)

                if (ifConsistent && prev_direction !== 'right') {
                // if (ifConsistent && !ifOverlay['ifConflict']) {
                    findDirection = true
                    direction_value = 'left'
                    break
                }
            } else if (moving_direction[i] === 'right') {
                seal_mapped_list_copy[found_index_number]['layout_params']['x'] += moving_value['right']
                seal_mapped_list_copy[found_index_number]['layout_params']['y'] = foundObject_original_position['y']

                new_seal_order = generate_constraint_list(seal_mapped_list_copy)

                let ifConsistent = judge_order_consistency(new_seal_order, constraint_list, 'high')
                let ifOverlay = detectOverlay(cur_redefined_seal, redefine_seal_list)

                if (ifConsistent && prev_direction !== 'left') {
                // if (ifConsistent && !ifOverlay['ifConflict']) {
                    findDirection = true
                    direction_value = 'right'
                    break
                }
            } else if (moving_direction[i] === 'up') {
                seal_mapped_list_copy[found_index_number]['layout_params']['x'] = foundObject_original_position['x']
                seal_mapped_list_copy[found_index_number]['layout_params']['y'] -= moving_value['up']

                new_seal_order = generate_constraint_list(seal_mapped_list_copy)

                let ifConsistent = judge_order_consistency(new_seal_order, constraint_list, 'high')
                let ifOverlay = detectOverlay(cur_redefined_seal, redefine_seal_list)

                if (ifConsistent && prev_direction !== 'down') {
                // if (ifConsistent && !ifOverlay['ifConflict']) {
                    findDirection = true
                    direction_value = 'up'
                    break
                }
            } else if (moving_direction[i] === 'down') {
                seal_mapped_list_copy[found_index_number]['layout_params']['x'] = foundObject_original_position['x']
                seal_mapped_list_copy[found_index_number]['layout_params']['y'] += moving_value['up']

                new_seal_order = generate_constraint_list(seal_mapped_list_copy)

                let ifConsistent = judge_order_consistency(new_seal_order, constraint_list, 'high')
                let ifOverlay = detectOverlay(cur_redefined_seal, redefine_seal_list)

                if (ifConsistent && prev_direction !== 'up') {
                // if (ifConsistent && !ifOverlay['ifConflict']) {
                    findDirection = true
                    direction_value = 'down'
                    break
                }
            }
        }
        // 检验是否寻找到移动方向
        if (!findDirection) { // not found, reduce contraint level to "middle"
            // initialize
            seal_mapped_list_copy[found_index_number]['layout_params']['x'] = foundObject_original_position['x']
            seal_mapped_list_copy[found_index_number]['layout_params']['y'] = foundObject_original_position['y']

            for (let i in moving_direction) { // 首先是最严格的限制: not overlay && relative position && distance order
                if (moving_direction[i] === 'left') {
                    seal_mapped_list_copy[found_index_number]['layout_params']['x'] -= moving_value['left']
                    seal_mapped_list_copy[found_index_number]['layout_params']['y'] = foundObject_original_position['y']
    
                    new_seal_order = generate_constraint_list(seal_mapped_list_copy)
    
                    let ifConsistent = judge_order_consistency(new_seal_order, constraint_list, 'middle')
                    let ifOverlay = detectOverlay(cur_redefined_seal, redefine_seal_list)

                    if (ifConsistent && prev_direction !== 'right') {
                    // if (ifConsistent && !ifOverlay['ifConflict']) {
                        findDirection = true
                        direction_value = 'left'
                        break
                    }
                } else if (moving_direction[i] === 'right') {
                    seal_mapped_list_copy[found_index_number]['layout_params']['x'] += moving_value['right']
                    seal_mapped_list_copy[found_index_number]['layout_params']['y'] = foundObject_original_position['y']
    
                    new_seal_order = generate_constraint_list(seal_mapped_list_copy)
    
                    let ifConsistent = judge_order_consistency(new_seal_order, constraint_list, 'middle')
                    let ifOverlay = detectOverlay(cur_redefined_seal, redefine_seal_list)

                    if (ifConsistent && prev_direction !== 'left') {
                    // if (ifConsistent && !ifOverlay['ifConflict']) {
                        findDirection = true
                        direction_value = 'right'
                        break
                    }
                } else if (moving_direction[i] === 'up') {
                    seal_mapped_list_copy[found_index_number]['layout_params']['x'] = foundObject_original_position['x']
                    seal_mapped_list_copy[found_index_number]['layout_params']['y'] -= moving_value['up']
    
                    new_seal_order = generate_constraint_list(seal_mapped_list_copy)
    
                    let ifConsistent = judge_order_consistency(new_seal_order, constraint_list, 'middle')
                    let ifOverlay = detectOverlay(cur_redefined_seal, redefine_seal_list)

                    if (ifConsistent && prev_direction !== 'down') {
                    // if (ifConsistent && !ifOverlay['ifConflict']) {
                        findDirection = true
                        direction_value = 'up'
                        break
                    }
                } else if (moving_direction[i] === 'down') {
                    seal_mapped_list_copy[found_index_number]['layout_params']['x'] = foundObject_original_position['x']
                    seal_mapped_list_copy[found_index_number]['layout_params']['y'] += moving_value['up']
    
                    new_seal_order = generate_constraint_list(seal_mapped_list_copy)
    
                    let ifConsistent = judge_order_consistency(new_seal_order, constraint_list, 'middle')
                    let ifOverlay = detectOverlay(cur_redefined_seal, redefine_seal_list)

                    if (ifConsistent && prev_direction !== 'up') {
                    // if (ifConsistent && !ifOverlay['ifConflict']) {
                        findDirection = true
                        direction_value = 'down'
                        break
                    }
                }
            }
            if (!findDirection) { // not found, reduce contraint level to "low" —— not overlay
                // initialize
                seal_mapped_list_copy[found_index_number]['layout_params']['x'] = foundObject_original_position['x']
                seal_mapped_list_copy[found_index_number]['layout_params']['y'] = foundObject_original_position['y']
                
                // 获取对象的所有键
                let keys = Object.keys(moving_value)
                // 去除掉prev_direction的对边
                if (prev_direction === 'left') {
                    keys.splice(keys.indexOf('right'), 1)
                } else if (prev_direction === 'right') {
                    keys.splice(keys.indexOf('left'), 1)
                } else if (prev_direction === 'up') {
                    keys.splice(keys.indexOf('down'), 1)
                } else if (prev_direction === 'down') {
                    keys.splice(keys.indexOf('up'), 1)
                }
                console.log('keys', keys)
                // 使用 Math.min() 和 apply() 方法找到最小键值
                const minKey = keys.reduce((a, b) => moving_value[a] < moving_value[b] ? a : b)
                if (minKey === 'left') {
                    direction_value = 'left'
                    seal_mapped_list_copy[found_index_number]['layout_params']['x'] -= moving_value['left']
                } else if (minKey === 'right') {
                    direction_value = 'right'
                    seal_mapped_list_copy[found_index_number]['layout_params']['x'] += moving_value['right']
                } else if (minKey === 'up') {
                    direction_value = 'up'
                    seal_mapped_list_copy[found_index_number]['layout_params']['y'] -= moving_value['up']
                } else if (minKey === 'down') {
                    direction_value = 'down'
                    seal_mapped_list_copy[found_index_number]['layout_params']['y'] += moving_value['down']
                }
                console.log(`low level-${moving_index}`)
            } else { // found under the "middle level" constraints
                console.log(`middle level-${moving_index}`)
                // continue
            }
        } else { // found under the "high level" constraints
            // console.log(`high level-${moving_index}`) // 全是high-level
            // continue
        }
        cur_redefined_seal['layout_params']['x'] = seal_mapped_list_copy[found_index_number]['layout_params']['x']
        cur_redefined_seal['layout_params']['y'] = seal_mapped_list_copy[found_index_number]['layout_params']['y']
    } else { // 没找到匹配对象
        // continue
    }
    return {
        modified_redefined_seal: cur_redefined_seal,
        direction: direction_value
    }
}

function judge_order_consistency(new_order, constraint_list, choice) { // choice = 'high' or 'middle' or 'low'
    let ifConsistent = true

    let seal_pic_num = constraint_list['x_order'].length
    
    if (choice === 'high') { // relative_position && distance_order
        for (let i = 0; i < seal_pic_num; i++) {
            if (!(new_order['x_order'][i]['index'] === constraint_list['x_order'][i]['index']
                || new_order['y_order'][i]['index'] === constraint_list['y_order'][i]['index']
                || new_order['x_dist'][i]['index'] === constraint_list['x_dist'][i]['index']
                || new_order['y_dist'][i]['index'] === constraint_list['y_dist'][i]['index'])) {
                    ifConsistent = false
                    break
            } else {
                continue
            }
        }
    } else if (choice === 'middle') { // relative_position
        for (let i = 0; i < seal_pic_num; i++) {
            if (!(new_order['x_order'][i]['index'] === constraint_list['x_order'][i]['index']
                || new_order['y_order'][i]['index'] === constraint_list['y_order'][i]['index'])) {
                    ifConsistent = false
                    break
            } else {
                continue
            }
        }
    } else if (choice === 'low') { 
        // 没有操作，ifConsistent始终为true
    }

    return ifConsistent
}

// 对于计算结果进行整体平移
function panning_overall(seal_mapped_list, container_param) {
    const container_width = container_param['width'],
          container_height = container_param['height']
    let canvas_bound = {
        left: seal_mapped_list.reduce((minValue, currentItem) => {
                const itemValue = currentItem['layout_params']['x']
                return itemValue < minValue ? itemValue : minValue
            }, Infinity),
        right: seal_mapped_list.reduce((maxValue, currentItem) => {
                const itemValue = currentItem['layout_params']['x'] + currentItem['layout_params']['width']
                return itemValue > maxValue ? itemValue : maxValue
            }, -Infinity),
        top: seal_mapped_list.reduce((minValue, currentItem) => {
                const itemValue = currentItem['layout_params']['y']
                return itemValue < minValue ? itemValue : minValue
            }, Infinity),
        buttom: seal_mapped_list.reduce((maxValue, currentItem) => {
                const itemValue = currentItem['layout_params']['y'] + currentItem['layout_params']['height']
                return itemValue > maxValue ? itemValue : maxValue
            }, -Infinity)
    }
    // 没超出画布范围~success
    if (canvas_bound['right'] - canvas_bound['left'] > container_width) {
        console.log('x-axis布局超了...')
        console.log('x-axis', canvas_bound['right'] - canvas_bound['left'], container_width)
    } else {
        console.log('x-axis', canvas_bound['right'] - canvas_bound['left'], container_width)
    }
    if (canvas_bound['buttom'] - canvas_bound['top'] > container_height) {
        console.log('y-axis布局超了...')
        console.log('y-axis', canvas_bound['buttom'] - canvas_bound['top'], container_height)
    } else {
        console.log('y-axis', canvas_bound['buttom'] - canvas_bound['top'], container_height)
    }

    for (let i in seal_mapped_list) {
        const x_offset = (container_width - (canvas_bound['right'] - canvas_bound['left'])) / 2,
              y_offset = (container_height - (canvas_bound['buttom'] - canvas_bound['top'])) / 2
        seal_mapped_list[i]['layout_params']['x'] += (x_offset - canvas_bound['left'])
        seal_mapped_list[i]['layout_params']['y'] += (y_offset - canvas_bound['top'])
    }
    return seal_mapped_list
}