import { infer_book_time, re_infer_book_time } from "./Time";
import { read_data, read_book_image_pos, read_time_reasoning } from "./Data";
import * as Data from "@/data/TimeLineData";
import { color, type_color } from "@/theme"
import * as d3 from "d3";
const $ = require("jquery");
import Timeline from '../components/Timeline.vue'
import { getCurrentInstance } from 'vue'
import { ref } from 'vue'

export function get_book_traj() {
    let data = read_data();
    return construct_book_traj(data.trajs);
}

export function get_book_image_pos() {
    let book_image = read_book_image_pos()
    return book_image
}

export function get_time_reasoning() {
    let time_reasoning = read_time_reasoning()
    return time_reasoning
}

export function get_book_traj_all() {
    let data = read_data()
    let construct_data = construct_book_traj(data.trajs).book_traj
    // console.log('construct_data', construct_data)
    for (let book in construct_data) {
        construct_data[book] = time_info_rehandle(construct_data[book])
    }
    // 添加流传flag
    construct_data = Data.add_event_state_flag_new(construct_data)
    return construct_data
}

/**
 * get the trajectory of each book
 *
 * @param {Object} data the list of movements read from the csv file
 */
function construct_book_traj(data) {
    console.log("start to construct book trajectory");
    let book_traj = {};

    data.forEach((d, i) => {
        insert_traj(d, i);
    });
    for (let book in book_traj) {
        // console.log('book_traj[book]', book_traj[book]) // event array
        // infer_book_time(book_traj[book])
        book_traj[book] = re_infer_book_time(book_traj[book]) // new computing time_info method
    }

    function insert_traj(item, i) {
        if (item["書名"] in book_traj === false) {
            book_traj[item["書名"]] = [];
        }
        book_traj[item["書名"]].push({ ...item, ori_idx: i });
    }

    return {
        book_traj: book_traj,
    };
}

export { construct_book_traj };

export function construct_book_translate(data) {
    console.log('start to construct book_translate_data')
    let book_translate = {}

    let type_name = null
    for (let j = 0; j < data.length; j++) {
        if (data[j].类别 === '') {
            data[j].类别 = type_name
        } else {
            type_name = data[j].类别
        }

        insert_translate(data[j])
    }

    function insert_translate(item) { // 对于每一个item
        if (item['类别'] in book_translate) { // if type exists in dict
            let type_dict = book_translate[item['类别']]

            if (item['中文'] in type_dict) {
                type_dict[item['中文']]['zh'] = item['中文']
                type_dict[item['中文']]['en'] = item['英文']
            } else {
                type_dict[item['中文']] = {
                    'zh': item['中文'],
                    'en': item['英文'],
                    'jp': null
                }
                // type_dict[item['中文']]['ch'] = item['中文']
                // type_dict[item['中文']]['en'] = item['英文']
            }
        } else {
            book_translate[item['类别']] = {} // init type_dict
            book_translate[item['类别']][item['中文']] = {}
            book_translate[item['类别']][item['中文']] = {
                'zh': item['中文'],
                'en': item['英文'],
                'jp': null
            }
        }
    }
    console.log('book_translate', book_translate)
    return book_translate
}

// 生成occupy_list, conflict_list, normal_list
export function generatePosList(inputBookEvent, book_name) {
    let occupy_list = [] // 占位list, 格式[{'index': [ , ], 'xRange': [ , ]}]
    let conflict_list = [] // 存在冲突的event list
    let normal_list = [] // 没有冲突的event_list
    // console.log('inputBookEvent', inputBookEvent)
    // 首先计算出 conflict_list 和 normal_list
    for (let event in inputBookEvent) {
        let find_belong = false
        if (occupy_list.length > 0) { // 如果当前occupy_list不为空
            for (let i = 0; i < occupy_list.length; i++) { // 遍历occupy_list
                if ((find_belong === false) && ((inputBookEvent[event][0] >= occupy_list[i].xRange[0] && inputBookEvent[event][0] <= occupy_list[i].xRange[1]) || (inputBookEvent[event][1] >= occupy_list[i].xRange[0] && inputBookEvent[event][1] <= occupy_list[i].xRange[1]) || (inputBookEvent[event][1] <= occupy_list[i].xRange[1] && inputBookEvent[event][0] >= occupy_list[i].xRange[0]) || (inputBookEvent[event][1] >= occupy_list[i].xRange[1] && inputBookEvent[event][0] <= occupy_list[i].xRange[0]))) { // 如果存在冲突
                    const cur_bound_lsi = [occupy_list[i].xRange[0], occupy_list[i].xRange[1], inputBookEvent[event][0], inputBookEvent[event][1]]
                    occupy_list[i].xRange = [d3.min(cur_bound_lsi), d3.max(cur_bound_lsi)]// 更新occupy_list中的边界
                    occupy_list[i].index.push(event)
                    find_belong = true
                    break
                }
            }
            if (find_belong === false) { // 如果遍历一圈之后发现没有冲突
                occupy_list.push({
                    index: [event],
                    xRange: [inputBookEvent[event][0], inputBookEvent[event][1]]
                })
            }
        } else {
            occupy_list.push({
                index: [event],
                xRange: [inputBookEvent[event][0], inputBookEvent[event][1]]
            })
        }
    }
    // 遍历 occupy_list, 将其分为conflict_list和normal_list
    for (let occ_index in occupy_list) {
        // console.log(occ_index)
        if ((occupy_list[occ_index].index).length > 1) { // 如果该区域不止一个tag，即存在tag相互重叠
            conflict_list.push(occupy_list[occ_index])
        } else {
            normal_list.push(occupy_list[occ_index])
        }
    }
    // console.log(book_name)
    // console.log('occupy_list', occupy_list)
    // console.log('normal_list', normal_list)
    // console.log('conflict_list', conflict_list)
    return [occupy_list, conflict_list, normal_list]  
}

// 首次遍历对pos的处理函数
export function calSingleBookEventPos(inputBookEvent, [initLeft, initRight], book_name) {
    let [occupy_list, conflict_list, normal_list] = generatePosList(inputBookEvent, book_name)

    // 遍历conflict_list，若有冲突则改变position
    for (let con_item in conflict_list) {
        // 下面2行有些复杂化了，暂时不需要
        // const middle_pos = (conflict_list[con_item].xRange[0] + conflict_list[con_item].xRange[1]) / 2 // 设置position的中间值
        // const middle_index =  Math.ceil(Object.keys(conflict_list[con_item].index).length / 2)
        const conflict_count = Object.keys(conflict_list[con_item].index).length
        let [left_bound, right_bound] = [initLeft, initRight]
        if ((conflict_list[con_item].index)[0] != '1') { // 缩小left_bound
            left_bound = (inputBookEvent[(Number((conflict_list[con_item].index)[0]) - 1).toString()][1] + (conflict_list[con_item].xRange)[0]) / 2
        }
        // console.log('con_item_len', con_item_len, (conflict_list[con_item].index)[con_item_len - 1])
        if ((conflict_list[con_item].index)[conflict_count - 1] != (Object.keys(inputBookEvent).length).toString()) { // 缩小right_bound
            right_bound = (inputBookEvent[(Number((conflict_list[con_item].index)[conflict_count - 1]) + 1).toString()][0] + (conflict_list[con_item].xRange)[1]) / 2
        }
        const step = Math.abs((right_bound - left_bound) / (conflict_count + 1))
        for (let event_con_index in conflict_list[con_item].index) { // 对每一个event新分配position
            const ori_width = inputBookEvent[(conflict_list[con_item].index)[event_con_index]][1] - inputBookEvent[(conflict_list[con_item].index)[event_con_index]][0]
            // const ori_width = (conflict_list[con_item].index)[event_con_index][1] - (conflict_list[con_item].index)[event_con_index][0]
            const newX = left_bound + (Number(event_con_index) + 1) * step
            inputBookEvent[(conflict_list[con_item].index)[event_con_index]] = [newX, newX + ori_width]

        }     
    }
    return inputBookEvent
}

// 2次遍历对pos的处理函数
export function reCalSingleBookEventPos(inputBookEvent, book_name) {
    let [occupy_list, conflict_list, normal_list] = generatePosList(inputBookEvent, book_name)
    // 遍历conflict_list，若有冲突则使部分tag不显示
    for (let con_item in conflict_list) {
        for (let i = 0; i < (conflict_list[con_item].index).length; i++) { // 遍历每组冲突中的每一个元素
            if (i === 0) { // 如果是第1个元素，则保留文字
                inputBookEvent[(conflict_list[con_item].index)[i.toString()]] = {
                    position: inputBookEvent[(conflict_list[con_item].index)[i.toString()]],
                    showAble: 'block'
                }
            } else {
                inputBookEvent[(conflict_list[con_item].index)[i.toString()]] = {
                    position: inputBookEvent[(conflict_list[con_item].index)[i.toString()]],
                    showAble: 'hidden'
                }
            }
        }
    }
    for (let nor_item in normal_list) {
        inputBookEvent[(normal_list[nor_item].index)[0]] = {
            position: inputBookEvent[(normal_list[nor_item].index)[0]],
            showAble: 'block'
        }
    }
    return inputBookEvent
}

// new version, 3 ergodic in total
export function generatePosListNew(inputBookEvent, book_name, tag_circle_choice) {
    let occupy_list = [] // 占位list, 格式[{'index': [ , ], 'xRange': [ , ]}]
    let conflict_list = [] // 存在冲突的event list
    let normal_list = [] // 没有冲突的event_list
    // console.log('inputBookEvent', inputBookEvent)
    // 首先计算出 conflict_list 和 normal_list
    for (let event in inputBookEvent) {
        if (inputBookEvent[event].ifShow === 'block') {
            let find_belong = false
            // console.log(inputBookEvent[event][tag_circle_choice])
            if (occupy_list.length > 0) { // 如果当前occupy_list不为空
                for (let i = 0; i < occupy_list.length; i++) { // 遍历occupy_list
                    if ((find_belong === false) && ((inputBookEvent[event][tag_circle_choice][0] >= occupy_list[i].xRange[0] && inputBookEvent[event][tag_circle_choice][0] <= occupy_list[i].xRange[1]) || (inputBookEvent[event][tag_circle_choice][1] >= occupy_list[i].xRange[0] && inputBookEvent[event][tag_circle_choice][1] <= occupy_list[i].xRange[1]) || (inputBookEvent[event][tag_circle_choice][1] <= occupy_list[i].xRange[1] && inputBookEvent[event][tag_circle_choice][0] >= occupy_list[i].xRange[0]) || (inputBookEvent[event][tag_circle_choice][1] >= occupy_list[i].xRange[1] && inputBookEvent[event][tag_circle_choice][0] <= occupy_list[i].xRange[0]))) { // 如果存在冲突
                        const cur_bound_lsi = [occupy_list[i].xRange[0], occupy_list[i].xRange[1], inputBookEvent[event][tag_circle_choice][0], inputBookEvent[event][tag_circle_choice][1]]
                        occupy_list[i].xRange = [d3.min(cur_bound_lsi), d3.max(cur_bound_lsi)]// 更新occupy_list中的边界
                        occupy_list[i].index.push(event)
                        find_belong = true
                        break
                    }
                }
                if (find_belong === false) { // 如果遍历一圈之后发现没有冲突
                    occupy_list.push({
                        index: [event],
                        xRange: [inputBookEvent[event][tag_circle_choice][0], inputBookEvent[event][tag_circle_choice][1]]
                    })
                }
            } else {
                occupy_list.push({
                    index: [event],
                    xRange: [inputBookEvent[event][tag_circle_choice][0], inputBookEvent[event][tag_circle_choice][1]]
                })
            }
        }   
    }
    // 遍历 occupy_list, 将其分为conflict_list和normal_list
    for (let occ_index in occupy_list) {
        // console.log(occ_index)
        if ((occupy_list[occ_index].index).length > 1) { // 如果该区域不止一个tag，即存在tag相互重叠
            conflict_list.push(occupy_list[occ_index])
        } else {
            normal_list.push(occupy_list[occ_index])
        }
    }
    // console.log(book_name)
    // console.log('occupy_list', occupy_list)
    // console.log('normal_list', normal_list)
    // console.log('conflict_list', conflict_list)
    return [occupy_list, conflict_list, normal_list]  
}
// first modify the tag position according to the position of each circle
export function bookEventPosFirst(inputBookEvent, [initLeft, initRight], book_name) {
    let [occupy_list, conflict_list, normal_list] = generatePosListNew(inputBookEvent, book_name, 'circleBox')
    // 遍历，如果有冲突则仅显示最后一个circle所对应的tag
    for (let con_item in conflict_list) {
        const conflict_count = Object.keys(conflict_list[con_item].index).length // 一组之内冲突的个数
        const lastCircle = conflict_list[con_item].index[conflict_count - 1] // 冲突组的最后一个circle
        // console.log('lastCircle', lastCircle)
        
        for (let event_con_index in conflict_list[con_item].index) { // 对每一个event新分配position
            if (event_con_index !== lastCircle) { // 如果不是最后一个circle，就不显示其text
                inputBookEvent[(conflict_list[con_item].index)[event_con_index]].ifShow = 'hidden'
            } else {
                inputBookEvent[(conflict_list[con_item].index)[event_con_index]].ifShow = 'block'
            }
        }  
    }
    return inputBookEvent
}

// 改变输出格式，表示哪些tag可以显示
export function decideTagShow(inputBookEvent, book_name) {
    for (let event in inputBookEvent) {
        inputBookEvent[event] = {
            position: [inputBookEvent[event].tagBox[0], inputBookEvent[event].tagBox[1]],
            showAble: inputBookEvent[event].ifShow
        }
    }
    return inputBookEvent
}

export function getTextCardBBox(d, i) {
    const textCardDiv = d3.select(`.${d.書名}-cardText-${(i + 1).toString()}`)
    let { x: cardX, width: cardWidth, y:cardY, height: cardHeight } = textCardDiv.node().getBBox() // 用于获取text的bbox(SVGRect)参数
    // console.log(cardX, cardWidth, cardY, cardHeight)
    return [cardX, cardWidth, cardY, cardHeight] // 返回[x, width, y, height]
}

export function getTimeLineCircleBBox(d) {
    const circleDiv = d3.select(`#${d.書名}-group`).select('circle')
    let { y:cardY, height: cardHeight } = circleDiv.node().getBBox() // 用于获取text的bbox(SVGRect)参数
    // console.log(cardX, cardWidth, cardY, cardHeight)
    return (cardY + cardHeight) // 返回[y, height]
}

// 用于获取当前click选中detail info的BBox
export function calClickBookPos(input_book_name, ori_height) {
    const bookDiv = d3.select(`#${input_book_name}-group`)
    let { y: gY, height: gHeight } = bookDiv.node().getBBox() // 用于获取text的bbox(SVGRect)参数
    // 匹配translate( , )的字符串
    // const translate_match = 'translate(0,'
    let translate_attr = bookDiv.node().getAttribute('transform')
    translate_attr = transform2num(translate_attr)
    // translate_attr = (translate_attr.replace(translate_match, '')).replace(')', '') // 当前book_group的y平移值
    gY = Number(translate_attr) + gY // 真实的y值(加上偏移值以后)
    return [gY, gHeight, ori_height] // 返回 [y, height, deta_height] 形式
}

//  用于将transform中的字母变为number(y坐标, 为string)
export function transform2num(input_trans_string) {
    // 匹配translate( , )的字符串
    const translate_match = 'translate(0,'
    const translate_attr = (input_trans_string.replace(translate_match, '')).replace(')', '')
    return translate_attr // string
}
// 用于重新计算各row的 Y 排列位置
export function reCalRowPos(input_book_list, input_each_book_pos, row_height, click_book_name, click_book_array) {
    input_each_book_pos = calBookEachPos(input_book_list, input_each_book_pos, row_height, click_book_name, click_book_array)
    let cur_start_y = row_height
    for (let i = 0; i < input_book_list.length; i++) { // 按照顺序
        const cur_book_name = input_book_list[i].book_name
        input_each_book_pos[cur_book_name].y = cur_start_y
        cur_start_y = cur_start_y + input_each_book_pos[cur_book_name].height
    }
    return input_each_book_pos // 返回更新后的位置
}

// let row_height = document.getElementsByClassName('main-panel')[0].clientHeight / 10;
// 重新计算各行应该要排布的位置
export function reCalRowPos_old(input_book_list, input_each_book_pos, row_height, click_book_name) {
    // console.log('input_book_list', input_book_list)
    // console.log(document.getElementById('main-view').clientHeight / 10)
    //const row_height = document.getElementById('main-view').clientHeight / 10
    input_each_book_pos = calBookEachPos(input_book_list, input_each_book_pos, row_height, click_book_name)
    let pre_cal_y = 0 // 用于记录上一个元素的book排布后当前的y值
    let pre_start_y = 0 // 用于记录上一个元素的book排布后当前的y值
    let pre_height = 0
    for (let i = 0; i < input_book_list.length; i++) { // 按照顺序
        const cur_book_name = input_book_list[i].book_name
        if (pre_height < row_height + 5) { // 相当于没有展开
            input_each_book_pos[cur_book_name].y = pre_start_y + row_height
        } else {
            input_each_book_pos[cur_book_name].y = pre_cal_y + 15
        }
        pre_cal_y = input_each_book_pos[cur_book_name].y + input_each_book_pos[cur_book_name].height
        pre_height = input_each_book_pos[cur_book_name].height
        pre_start_y = input_each_book_pos[cur_book_name].y
    }
    return input_each_book_pos // 返回更新后的位置
}

// 用于计算左边hover single book时各行的位置
export function hover_book_reCal_pos(input_book_name, input_book_dict) { // this.data
    let new_pos_dict = {}
    const { height: oriHeight } = d3.select(`#${input_book_name}-group`).node().getBBox()
    let oriY = d3.select(`#${input_book_name}-group`).node().getAttribute('transform')
    oriY = Number(transform2num(oriY))
    for (let book_item in input_book_dict) { // 'book_item'即为各个书名
        const { height: bookHeight } = d3.select(`#${book_item}-group`).node().getBBox()
        let bookY = d3.select(`#${book_item}-group`).node().getAttribute('transform')
        bookY = Number(transform2num(bookY))
        if (bookY <= oriY) { // 如果在当前detail_book的上方
            new_pos_dict[book_item] = {
                yPos: bookY
            }
        } else {
            new_pos_dict[book_item] = {
                yPos: bookY + (oriHeight - bookHeight) + 15
            }
        }
    }
    return new_pos_dict
}
// 用于计算event time不确定性
export function calTimeUncertainty(input_time_info) {
    if (input_time_info.certainty === true) { // 如果是确切年份
        input_time_info['circle'] = {
            left: '0',
            right: '0'
        }
    } else { // 如果不确定
        if (input_time_info.right_bound === null && input_time_info.left_bound !== null) { // 如果没有右边界
            input_time_info['circle'] = {
                left: '1',
                right: '3'
            }
        } else if (input_time_info.right_bound !== null && input_time_info.left_bound === null) { // 如果没有左边界
            input_time_info['circle'] = {
                left: '3',
                right: '1'
            }
        } else if ( (input_time_info.right_bound === null && input_time_info.left_bound === null)) { //如果时间完全未知, nan
            input_time_info['circle'] = {
                left: '3',
                right: '3'
            }
        } else if  (input_time_info.right_bound !== null && input_time_info.left_bound !== null) { // 如果左右都有时间段
            // 分情况，看左右边界差了多少年
            const [leftB, rightB] = [input_time_info.left_bound, input_time_info.right_bound]
            if (Math.abs(rightB - leftB) > 50) {
                input_time_info['circle'] = { // 50 -
                    left: '3',
                    right: '3'
                }
            } else if (Math.abs(rightB - leftB) > 25) { // 25 - 50
                input_time_info['circle'] = {
                    left: '2',
                    right: '2'
                }
            } else { // 0 - 25
                input_time_info['circle'] = {
                    left: '1',
                    right: '1'
                }
            }
        }
    }
    return input_time_info
}

export function divideLR(input_array) {
    const leftNum = ($.grep(input_array,(currentValue) => {
        return currentValue.__data__.label === 'L'
    })).length
    const rightNum = ($.grep(input_array,(currentValue) => {
        return currentValue.__data__.label === 'R'
    })).length
    return [leftNum, rightNum]
}

// 用于每次重新排布前计算每本book的位置
export function calBookEachPos(input_book_list, each_book_pos, input_row_height, input_book_name, input_click_book_array) { // 输入allBookList, eachBookPos, input_click_book_array支持多本书
    console.log(input_click_book_array)
    for (let i = 0; i < input_book_list.length; i++) {
        const cur_book_name = input_book_list[i].book_name
        const translate_match = 'translate(0,'
        let translate_attr = d3.select(`#${cur_book_name}-group`).node().getAttribute('transform')
        translate_attr = Number((translate_attr.replace(translate_match, '')).replace(')', '')) // 当前book_group的y平移值
        //console.log(cur_book_name, d3.select(`#${cur_book_name}-group`).node().getAttribute('transform').match(/translate\(\d+,\s*(-?\d+)\)/)) // match有些没有匹配到
        // const cur_y = d3.select(`#${cur_book_name}-group`).node().getAttribute('transform').match(/translate\(\d+,\s*(-?\d+)\)/)[1] // 获取y坐标

        
        let { height: curHeight } = d3.select(`#${cur_book_name}-group`).node().getBBox() // 其实已经不需要了
        // if (curHeight >= input_row_height + 5) { // 相当于展开了
        // if (input_book_name === cur_book_name) { // 相当于信息卡展开了(edition)
        if (input_click_book_array.includes(cur_book_name)) { // 相当于信息卡展开了(editions)
            // console.log('cur_book_name', cur_book_name, input_click_book_array)
            curHeight = 4 * input_row_height + 2.3 * input_row_height
        } else { // 要考虑之前信息卡展开，现在收起的情况
            curHeight = input_row_height
        }
        // each_book_pos[cur_book_name].y = Number(cur_y) // number
        each_book_pos[cur_book_name].y = translate_attr // number
        each_book_pos[cur_book_name].height = curHeight // number
    }
    return each_book_pos // 返回更新后的eachBookPos
}
// BBox弃用
export function calBookEachPosOld(input_book_list, each_book_pos) { // 输入allBookList, eachBookPos
    for (let i = 0; i < input_book_list.length; i++) {
        const cur_book_name = input_book_list[i].book_name
        const translate_match = 'translate(0,'
        let translate_attr = d3.select(`#${cur_book_name}-group`).node().getAttribute('transform')
        translate_attr = Number((translate_attr.replace(translate_match, '')).replace(')', '')) // 当前book_group的y平移值
        //console.log(cur_book_name, d3.select(`#${cur_book_name}-group`).node().getAttribute('transform').match(/translate\(\d+,\s*(-?\d+)\)/)) // match有些没有匹配到
        // const cur_y = d3.select(`#${cur_book_name}-group`).node().getAttribute('transform').match(/translate\(\d+,\s*(-?\d+)\)/)[1] // 获取y坐标
        const { height: curHeight } = d3.select(`#${cur_book_name}-group`).node().getBBox()
        // each_book_pos[cur_book_name].y = Number(cur_y) // number
        each_book_pos[cur_book_name].y = translate_attr // number
        each_book_pos[cur_book_name].height = curHeight // number
    }
    return each_book_pos // 返回更新后的eachBookPos
}

// 用于计算uncertain time
export function time_info_rehandle(data_book) {
    // 处理 Nan 的 timestamp (修改绘制circle时没有x坐标的bug)
    for (let event in data_book) {
        data_book[event].agent = handle_agent_name(data_book[event].agent)
        if (data_book[event].time_info.timestamp !== data_book[event].time_info.timestamp) { // if nan
            if (event === '0') {
                data_book[event].time_info.timestamp = (960 + data_book[(Number(event) + 1).toString()].time_info.timestamp) / 2
            } else if (event === (data_book.length - 1).toString()) {
                data_book[event].time_info.timestamp = (1953 + data_book[(Number(event) - 1).toString()].time_info.timestamp) / 2
            } else {
                data_book[event].time_info.timestamp = (data_book[(Number(event) - 1).toString()].time_info.timestamp + data_book[(Number(event) + 1).toString()].time_info.timestamp) / 2
                // 如果还是nan (2个nan相连的情况)
                if (data_book[event].time_info.timestamp != data_book[event].time_info.timestamp) {
                    let startTime = 960
                    let endTime = 1953
                    for (let reEvent in data_book) {
                        let meetNAN = false
                        let includeEnd = false
                        if (!(data_book[reEvent].time_info.timestamp != data_book[reEvent].time_info.timestamp)) { // 若不为nan
                            if (!meetNAN) {
                                startTime = data_book[reEvent].time_info.timestamp
                            }
                            else {
                                if (!includeEnd) {
                                    endTime = data_book[reEvent].time_info.timestamp
                                    includeEnd = true
                                }
                            }
                        } else {
                            meetNAN = true
                        }
                    }
                    // console.log('srt_end', startTime, endTime)
                    if (data_book[(Number(event) + 1).toString()].time_info.timestamp != data_book[(Number(event) + 1).toString()].time_info.timestamp) {
                        data_book[event].time_info.timestamp = (3 * startTime + endTime) / 4
                        data_book[(Number(event) + 1).toString()].time_info.timestamp = (startTime + 3 * endTime) / 4 
                    }
                }

            }                 
        }
    // 用于观察time_info中的数据
    data_book[event].time_info = calTimeUncertainty(data_book[event].time_info)

    // 对于'宮内省圖書寮', '宮内廳書陵部', '宮内省書陵部
    // console.log('data_book[event].lib_id', data_book[event].library)
    if (['宮内省圖書寮', '宮内廳書陵部', '宮内省書陵部'].includes(data_book[event].library)) { // nan 或早于1884
        // console.log(data_book[event].time_info.timestamp)
        if ((data_book[event].time_info.timestamp !== data_book[event].time_info.timestamp) || data_book[event].time_info.timestamp < 1884) {
            // console.log('需要修改宫内厅的时间哟')
            data_book[event].time_info.timestamp = 1884
            }
        }
    }
    return data_book
}


// 计算timeline中text标签的位置
// 总支配函数
export function generateTextPos(rem, cur_event_list_single, timeScale, language) {
    console.log('input_language', language)
    let pos_dict_list = initialize_text_pos(0.8 * rem, cur_event_list_single, timeScale, language)
    pos_dict_list = reCalTextPos(rem, pos_dict_list) // 重新计算位置
    return pos_dict_list
}

// init pos_dict
export function initialize_text_pos(text_rem, all_event_list_single, xTimeScale, input_language) {
    let pos_dict_list = []
    for (let i = 0; i < all_event_list_single.length; i++) {
        // const name_length = Math.max(all_event_list_single[i].library.length, all_event_list_single[i].agent.length)
        let name_length = all_event_list_single[i].library.length,
            lib_or_agent = 'library_lang'
        // 要区分这里显示的是library还是agent
        if (all_event_list_single[i].library === '--' && all_event_list_single[i].agent !== '--') {
            name_length = all_event_list_single[i].agent.length // not useful
            lib_or_agent = 'agent_lang'
        }
        if (input_language === 'zh') {
            name_length = all_event_list_single[i][lib_or_agent].zh.length
            // console.log('zh', all_event_list_single[i].library_lang.zh, name_length)
        } else if (input_language === 'en') {
            name_length = all_event_list_single[i][lib_or_agent].en.length / 2
            // console.log('en', all_event_list_single[i].library_lang.en, name_length)
        }

        const tag_width = text_rem * 1.05 * name_length // 计算出的text_width
        
        const time_year = all_event_list_single[i].time_info.timestamp
        const x_central = xTimeScale(new Date(time_year, 1, 1))
        
        const event_pos_dict = {
            idx: i, // number
            central: x_central, // circle中心坐标
            width: tag_width, // 计算出来的text_width
            span: [x_central - tag_width / 2, x_central + tag_width / 2], // text跨度[start, end]
            offset: 0, // 初始化偏移为0, left-, right+
            first_conflict: i, // 捆绑(冲突)元素的首元素序号
            bundle_span: [x_central - tag_width / 2, x_central + tag_width / 2], // 初始化bundle总跨度
            if_show: true, // 默认显示该标签
            time_stamp: time_year,
            lib_name: all_event_list_single[i].library, // 如果根源相同，就不显示了
            ori_idx: all_event_list_single[i].ori_idx
        }
        pos_dict_list.push(event_pos_dict)
    }
    return pos_dict_list
}

export function reCalTextPos(max_bias, input_pos_dict_list) {
    const max_offset = 1.5 * max_bias // 设置最大偏移上限
    // init occupy_list
    let occupy_list = []
    for (let i = 0; i < input_pos_dict_list.length; i++) {
        occupy_list.push(input_pos_dict_list[i].span)
    }
    // console.log('occupy_list', occupy_list)

    let flag_index = 0
    // let deta_x = Math.abs(occupy_list[1][0] - occupy_list[0][1])
    let deta_x = occupy_list[0][0]

    for (let j = 1; j < input_pos_dict_list.length; j++) { // 遍历每一个event item(第0个不遍历)
        let prev_span,
            prev_j = j - 1
        if (input_pos_dict_list[j - 1].if_show) {
            prev_span = input_pos_dict_list[j - 1].bundle_span
        }
        while (prev_j >= 0) {
            if (input_pos_dict_list[prev_j].if_show) {
                // if (j - prev_j >= 2) {
                //     console.log('越级', j - prev_j)
                // }
                
                prev_span = input_pos_dict_list[prev_j].bundle_span
                break
            } else {
                prev_j -= 1
            }
        }
        // const prev_span = input_pos_dict_list[j - 1].bundle_span
        if (input_pos_dict_list[j].lib_name === input_pos_dict_list[j - 1].lib_name && (input_pos_dict_list[j].lib_name !== '--' && input_pos_dict_list[j].lib_name !== '') || input_pos_dict_list[j].ori_idx === 343) { // 如果前后重名，直接不显示
            input_pos_dict_list[j].if_show = false
            occupy_list.splice(flag_index + 1, 1)
        } else {
            if ((input_pos_dict_list[j].span[0] < prev_span[1] && input_pos_dict_list[j].span[1] > prev_span[1]) || (input_pos_dict_list[j].span[0] < prev_span[0] && input_pos_dict_list[j].span[1] > prev_span[0]) || (input_pos_dict_list[j].span[0] >= prev_span[0] && input_pos_dict_list[j].span[1] <= prev_span[1]) || (input_pos_dict_list[j].span[0] <= prev_span[0] && input_pos_dict_list[j].span[1] >= prev_span[1])) { // 如果冲突
                const common_central = (input_pos_dict_list[j].central + input_pos_dict_list[prev_j].central) / 2
                if (deta_x > (common_central - occupy_list[flag_index][1])) { //如果整体左移放得下
                    // 更新central左边的pos
                    const left_move = input_pos_dict_list[prev_j].bundle_span[1] - common_central
                    const cur_bundle_start = input_pos_dict_list[prev_j].first_conflict // bundle组最前面那个item的index(number)
    
                    // 更新central右边的pos
                    const right_move = common_central - input_pos_dict_list[j].span[0]
    
                    // 更新bundle_span
                    const edge_list = [input_pos_dict_list[prev_j].bundle_span[0] - left_move, common_central, common_central + input_pos_dict_list[j].width]
                    const bundle_span_new = [input_pos_dict_list[prev_j].bundle_span[0] - left_move, common_central + input_pos_dict_list[j].width]
    
                    for (let k = cur_bundle_start; k < j; k++) { // 首先遍历一遍之前的bundle组，看是否会超出max_offset的限制
                        const cur_offset = Math.abs(input_pos_dict_list[k].offset - left_move)
                        if (cur_offset > max_offset) { // 超出左移限制则放不下
                            input_pos_dict_list[j].if_show = false
                            occupy_list.splice(flag_index + 1, 1)
                            break
                        }
                    }
    
                    if (input_pos_dict_list[j].if_show) { //如果第j个text可以显示，true
                        // 更新新加入的bundle元素的attr
                        input_pos_dict_list[j].span = [common_central, common_central + input_pos_dict_list[j].width]
                        input_pos_dict_list[j].offset = right_move // right+
                        input_pos_dict_list[j].first_conflict = cur_bundle_start
                        input_pos_dict_list[j].bundle_span = bundle_span_new
    
                        for (let k = cur_bundle_start; k <= prev_j; k++) { // 遍历之前的bundle组
                            input_pos_dict_list[k].offset = input_pos_dict_list[k].offset - left_move
                            input_pos_dict_list[k].bundle_span = bundle_span_new
                            input_pos_dict_list[k].span = [input_pos_dict_list[k].span[0] - left_move, input_pos_dict_list[k].span[1] - left_move]         
                        }
                        // 更新flag_index和occupy_list
                        // flag_index此时不移动
                        occupy_list[flag_index] = bundle_span_new
                        occupy_list.splice(flag_index + 1, 1)
                    }
    
                    
                } else {
                    input_pos_dict_list[j].if_show = false
                    occupy_list.splice(flag_index + 1, 1)
                }
            } else { // 如果不冲突
                flag_index += 1 // 向后移动一位
                if (occupy_list.length > flag_index) {
                    deta_x = occupy_list[flag_index][0] - occupy_list[flag_index - 1][1]
                }       
            }
        }
        
    }
    return input_pos_dict_list
}

// 处理agent_name数据
export function handle_agent_name(input_agent_string) {
    let output_agent_string = input_agent_string
    if (input_agent_string === '孔穎達/王德韶/李子雲/朱長才/蘇德融/隋德素/王士雄/趙弘智/長孫無忌/李勣/于志寧/張行成/高季輔/褚遂良/柳奭/谷那律/劉伯莊/賈公彥/范義頵/齊威/柳士宣/孔志約/趙君贊/薛伯珍/史士弘/鄭祖玄/周玄達/李玄植/王真儒') {
        output_agent_string = '孔穎達（等）'
    } else if (input_agent_string === '細川十洲(潤次郎)') {
        output_agent_string === '細川十洲'
    } else if (input_agent_string === '王安石/李壁/劉辰翁') {
        output_agent_string = '王安石（等）'
    } else if (input_agent_string === '杜甫/徐居仁/黃鶴') {
        output_agent_string = '杜甫（等）'
    } else if (input_agent_string === '蕭統/李善/五臣（呂延濟、劉良、張銑、呂向、李周瀚）') {
        output_agent_string = '蕭統（等）'
    } else if (input_agent_string === '蘇洵/蘇軾/蘇轍/闕名') {
        output_agent_string = '蘇洵（等）'
    } else if (input_agent_string === '愛新覺羅顒琰、旻宁、奕詝、载淳、载湉、溥仪') {
        output_agent_string = '愛新覺羅顒琰（等）'
    } else if (input_agent_string === '丹波氏(即多紀氏，多紀元孝等)') {
        output_agent_string = '丹波氏'
    } else if (input_agent_string === '寺田弘(一名盛業，字士弘，號望南)') {
        output_agent_string = '寺田弘'
    } else if (input_agent_string === '館機(名機，字樞卿)') {
        output_agent_string = '館機'
    } else if (input_agent_string === '楊萬里/楊長儒/羅茂良') {
        output_agent_string = '楊萬里（等）'
    } else if (input_agent_string === '最下方的印章看不清') {
        output_agent_string = ''
    }
    return output_agent_string
}
// 处理lib_name数据
export function handle_library_name(input_lib_string) {
    let output_lib_string = input_lib_string
    if (input_lib_string === '') {
        output_lib_string = '--'
    }
    return output_lib_string
}

export let exportBookList = [] // .vue文件中curBookList改变后会实时更新
export let exportRowHeight = 40 // .vue文件中rowHeight改变后会实时更新
export let exportScrollTop = 0 // .vue文件中scrollTopContainer改变后会实时更新
export let exportBookPosDict = {} // .vue文件中eachBookPos改变后会实时更新
export let exportSVGLength = 0 // .vue文件中curSvgLength改变后会世界更新
// graph到timeline过渡接口
export function cur_timeline_layout_old() { // rem_height = rem * 3, book_event_list = curBookList
    // let trajs = get_book_traj_all()
    let trajs = read_data().trajs // 读进来是一个散列的array

    // console.log('trajs', trajs, read_data().trajs)
    console.log('exportBookList', exportBookList)
    console.log('exportRowHeight', exportRowHeight)
    console.log('exportScrollTop', exportScrollTop)
    console.log('exportBookPosDict', exportBookPosDict)
    console.log('exportSVGLength', exportSVGLength)
    
    // const book_event_list = Timeline.data().curBookList
    const book_event_list = exportBookList
    const xTimeScale =Timeline.data().xTimeScale // 获取Timeline.vue中的值
    // const rem_height = Timeline.data().rowHeight
    const rem_height = exportRowHeight
    // const container_scroll_top = document.getElementById('container').scrollTop // 实时获取当前窗口滑动的大小
    const container_scroll_top = exportScrollTop
    const book_pos_dict = exportBookPosDict
    const svgLen = exportSVGLength
    const viewBoxHeight = document.getElementsByClassName('main-panel')[0].clientHeight // 当前窗口的height

    let event_index = 0
    // 添加node_state和edge_state
    for (let i = 0; i < trajs.length; i++) {
        const cur_book_name = trajs[i].書名
        const book_event_y_index = book_event_list.findIndex(item => item.book_name === cur_book_name)
        let book_event_y = (book_event_y_index + 1) * rem_height - container_scroll_top // 需要减去窗口滑动的scroll_top
        if (book_pos_dict.hasOwnProperty(cur_book_name)) {
            // console.log('更新book_pos_dict')
            book_event_y = book_pos_dict[cur_book_name].y - container_scroll_top // 需要减去窗口滑动的scroll_top
            if (svgLen - book_pos_dict[cur_book_name].y < viewBoxHeight) { // 如果当前已经滑到最底部了
                console.log('update book_pos_dict and svg_length')
                book_event_y =  viewBoxHeight - (svgLen - book_pos_dict[cur_book_name].y)
            } else {
                console.log('update book_pos_dict')
            }
        }       
        const book_event_x = xTimeScale(new Date(trajs[i].time_info.timestamp, 1, 1))
        let book_event_r = 7
        if (trajs[i].state_flag === 'block_print' || trajs[i].state_flag === 'Japan') {
            book_event_r = 9
        }
        trajs[i].node_state = {
            x: book_event_x,
            y: book_event_y,
            ori_y: book_pos_dict[cur_book_name].y, // 原始的y
            fill: type_color.library[trajs[i].lib_type],
            r: book_event_r
        }

        trajs[i].edge_state = {
            source: {
                x: null,
                y: null,
                ori_y: null
            },
            target: {
                x: null,
                y: null,
                ori_y: null
            },
            stroke: null,
            stroke_opacity: 1,
            stroke_width: null
        }
        if (i > 0) {
            const prev_book_name = trajs[i - 1].書名
            if (prev_book_name === cur_book_name) { // 如果是同一本书的流传事件
                event_index += 1
                if (event_index > 0) { // 如果不是当前book的第一个event
                    const book_event_pre_y = book_event_y
                    const book_event_pre_ori_y = book_pos_dict[cur_book_name].y
                    const book_event_pre_x = xTimeScale(new Date(trajs[i - 1].time_info.timestamp, 1, 1))
                    let book_event_r = 7
                    if (trajs[i - 1].state_flag === 'block_print' || trajs[i - 1].state_flag === 'Japan') {
                        book_event_r = 9
                        }

                    trajs[i].edge_state = {
                        source: {
                            x: book_event_pre_x,
                            y: book_event_pre_y,
                            ori_y: book_event_pre_ori_y
                        },
                        target: {
                            x: book_event_x,
                            y: book_event_y,
                            ori_y: book_event_pre_ori_y
                        },
                        stroke: 'gray',
                        stroke_opacity: 0.8,
                        stroke_width: 0.5
                    }                 
                }
            // 计算source node 
            } else {
                event_index = 0
            }
        }
    }
    console.log('timeline_trajs_new', trajs)
    return trajs
}

export function cur_timeline_layout() { // rem_height = rem * 3, book_event_list = curBookList
    // let trajs = get_book_traj_all()
    const marginLeft = 0.2 // timeline左侧间距
    let trajs = read_data().trajs // 读进来是一个散列的array

    // console.log('exportBookList', exportBookList)
    // console.log('exportRowHeight', exportRowHeight)
    // console.log('exportScrollTop', exportScrollTop)
    // console.log('exportBookPosDict', exportBookPosDict)
    // console.log('exportSVGLength', exportSVGLength)
    // console.log('trajs', trajs)
    
    // const book_event_list = Timeline.data().curBookList
    const book_event_list = exportBookList
    const xTimeScale =Timeline.data().xTimeScale // 获取Timeline.vue中的值
    // const rem_height = Timeline.data().rowHeight
    const rem_height = exportRowHeight
    // const container_scroll_top = document.getElementById('container').scrollTop // 实时获取当前窗口滑动的大小
    const container_scroll_top = exportScrollTop
    const book_pos_dict = exportBookPosDict
    const svgLen = exportSVGLength
    const viewBoxHeight = document.getElementsByClassName('main-panel')[0].clientHeight // 当前窗口的height
    // console.log('svgLen', svgLen)
    // console.log('viewBoxHeight', viewBoxHeight)
    // console.log('exportScrollTop', exportScrollTop)

    let event_index = 0
    // 添加node_state和edge_state
    for (let i = 0; i < trajs.length; i++) {
        const cur_book_name = trajs[i].書名
        const book_event_y_index = book_event_list.findIndex(item => item.book_name === cur_book_name)
        let book_event_y = (book_event_y_index + 1) * rem_height - container_scroll_top // 需要减去窗口滑动的scroll_top
        if (book_pos_dict.hasOwnProperty(cur_book_name)) {
            console.log('更新book_pos_dict')
            book_event_y = book_pos_dict[cur_book_name].y - container_scroll_top // 需要减去窗口滑动的scroll_top
            if (container_scroll_top > svgLen - viewBoxHeight) { // 如果当前已经滑到最底部了
            // if (svgLen - book_pos_dict[cur_book_name].y < viewBoxHeight) {
                book_event_y =  viewBoxHeight - (svgLen - book_pos_dict[cur_book_name].y)
            }
        }       
        const book_event_x = xTimeScale(new Date(trajs[i].time_info.timestamp, 1, 1))
        let book_event_r = 7
        if (trajs[i].state_flag === 'block_print' || trajs[i].state_flag === 'Japan') {
            book_event_r = 9
        }
        trajs[i].node_state = {
            x: book_event_x,
            y: book_event_y,
            ori_y: book_pos_dict[cur_book_name].y, // 原始的y
            fill: type_color.library[trajs[i].lib_type],
            r: book_event_r,
            node_opacity: book_event_list[book_event_y_index].opacity
        }

        trajs[i].edge_state = {
            source: {
                x: null,
                y: null,
                ori_y: null
            },
            target: {
                x: null,
                y: null,
                ori_y: null
            },
            stroke: null,
            stroke_opacity: book_event_list[book_event_y_index].opacity,
            stroke_width: null
        }
        if (i > 0) {
            const prev_book_name = trajs[i - 1].書名
            if (prev_book_name === cur_book_name) { // 如果是同一本书的流传事件
                event_index += 1
                if (event_index > 0) { // 如果不是当前book的第一个event
                    const book_event_pre_y = book_event_y
                    const book_event_pre_ori_y = book_pos_dict[cur_book_name].y
                    const book_event_pre_x = xTimeScale(new Date(trajs[i - 1].time_info.timestamp, 1, 1))
                    let book_event_r = 7
                    if (trajs[i - 1].state_flag === 'block_print' || trajs[i - 1].state_flag === 'Japan') {
                        book_event_r = 9
                        }

                    trajs[i].edge_state = {
                        source: {
                            x: book_event_pre_x,
                            y: book_event_pre_y,
                            ori_y: book_event_pre_ori_y
                        },
                        target: {
                            x: book_event_x,
                            y: book_event_y,
                            ori_y: book_event_pre_ori_y
                        },
                        stroke: 'gray',
                        stroke_opacity: 0.8 * book_event_list[book_event_y_index].opacity,
                        stroke_width: 0.5
                    }                 
                }
            // 计算source node 
            } else {
                event_index = 0
            }
        }
    }
    console.log('trajs_new', trajs)
    return trajs
}

// 用于导出exportBookList并赋予set property进行修改
export function setExportBookList(value) {
    exportBookList = value
  }
export function setExportRowHeight(value) {
    exportRowHeight = value
}
export function setExportScrollTopValue(value) {
    exportScrollTop = value
}
export function setExportBookPosDict(value) {
    exportBookPosDict = value
    // cur_timeline_layout() // 用于测试是否可以实时传值
}
export function setExportSVGLength(value) {
    exportSVGLength = value
}