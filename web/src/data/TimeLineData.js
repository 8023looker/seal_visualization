// 包含一些关于timeAxis的处理函数
import * as d3 from "d3";
import * as TimeLineUpdate from "@/data/timeline/timeline_update";
import { color, type_color } from "@/theme"

let period_legend = [
    // ['秦', -221, -202],
    // ['西汉', -202, 8],
    // ['', 8, 25],
    // ['东汉', 25, 220],
    // ['三国', 220, 265],
    // ['两晋', 265, 420],
    // ['南北朝', 420, 581],
    // ['隋', 581, 618],
    // ['唐', 618, 907],
    // ['五代十国', 907, 960],
    ['宋', 960, 1271],
    ['元', 1271, 1368],
    ['明', 1368, 1644],
    ['清', 1644, 1912],
    ['民国', 1912, 1950] // 民国
];
let jp_period_legend_old = [
    // ['院政', 1068, 1185],
    ['镰仓', 1185, 1333],
    ['南北朝', 1333, 1392],
    ['室町', 1392, 1573],
    ['织丰', 1573, 1603],
    ['江户', 1603, 1868],
    ['帝国', 1868, 1965]
]

export let jp_period_legend = [ // 待添加
    ['平安', 960, 1068],
    // ['镰仓', 1068, 1334],
    ['镰仓', 1068, 1334],
    ['南北朝', 1334, 1392],
    ['室町', 1392, 1603],
    ['江户', 1603, 1869],
    ['明治', 1869, 1912],
    ['大正', 1912, 1927],
    ['昭和', 1927, 1965]
]
// 尝试加入清代的年号数据
let qing_nainhao = [
    ['天命', 1616],
    ['天聪', 1627],
    ['崇德', 1636],
    ['顺治', 1644],
    ['康熙', 1662],
    ['雍正', 1723],
    ['乾隆', 1736],
    ['嘉庆', 1796],
    ['道光', 1821],
    ['咸丰', 1851],
    ['同治', 1862],
    ['光绪', 1875],
    ['宣统', 1909]
]

// 安史之乱（755-763）、靖康之乱（1127）、蒙古兵南侵（1273）、明初大移民（1370-1417）……)
let big_event = [
        ['秦末农民起义', -209],
        // ['王莽篡汉', 6],
        // ['光武中兴', 41],
        ['文景之治', -104],
        ['夷陵之战', 221],
        ['永嘉之乱', 311],
        ['贞观之治', 627],
        ['安史之乱', 755],
        ['陈桥兵变', 960],
        ['靖康之乱', 1127],
        ['襄阳之战', 1267],
        ['明初大移民', 1370],
        ['满清入关', 1644]
    ]


let od_data = {};
let elite_data;
let src_in_province = {};
let dst_in_province = {};


export function getDataByTimeRange(l, r) {
    return od_data.filter(d => (+d.index_year >= l && +d.index_year < r));
}

export function getBins(l, r, step) {
    let bins = d3.range(Math.ceil((r - l) / step)).map(d => [l + d * step, l + d * step + step]);
    // for (let i = 0; i < bins.length; ++i) {
    //     bins[i].push(od_data.filter(d => (d.index_year >= bins[i][0] && d.index_year < bins[i][1])).length);
    // }
    return bins
}

export function getPeriodLegend() {
    return period_legend;
}

export function getQingNianhao() {
    return qing_nainhao;
}

export function getBigEvent() {
    return big_event;
}

export function getJpPeriodData() {
    return jp_period_legend;
}

export function add_event_state_flag(input_data) { // this.data (dict)
    // state_flag包括：
    //'block_print'(刊刻), 'transnational'(跨国), 'Japan'(第一次传入日本), 'normal'(正常)
    for (let book in input_data) { // 对于每一本book
        for (let i = 0; i < input_data[book].length; i++) { // 对于每一本书的流传事件
            if (i === 0) { // 第一本书就是首次刊刻
                input_data[book][i]['state_flag'] = 'block_print'
            } else {
                const country = input_data[book][i].location_std_new.split('-')[0]
                if (country === '日本') {
                    input_data[book][i]['state_flag'] = 'Japan'
                } else { // 目前不考虑跨国，其余均为normal
                    input_data[book][i]['state_flag'] = 'normal'
                }
            }
        }
    }
    // console.log(input_data)
    return input_data
}

export function add_event_state_flag_new(input_data) { // this.data (dict)
    // state_flag包括：
    //'block_print'(刊刻), 'transnational'(跨国), 'Japan'(第一次传入日本), 'normal_internal'(中国国内流传), 'normal_foreign'(外国国内流传)
    for (let book in input_data) { // 对于每一本book
        let pre_country = '中國'
        for (let i = 0; i < input_data[book].length; i++) { // 对于每一本书的流传事件
            if (i === 0) { // 第一本书就是首次刊刻
                input_data[book][i]['state_flag'] = 'block_print'
            } else { // 从第二本书开始
                if (input_data[book][i].location_std_new === '') { // 如果为“未详”
                    if (pre_country === '中國') { // 中国国内流传
                        input_data[book][i]['state_flag'] = 'normal_internal' // 国内流传
                        // pre_country不变
                    } else {
                        input_data[book][i]['state_flag'] = 'normal_foreign' // 国内流传
                        // pre_country不变
                    }    
                } else {
                    const country = input_data[book][i].location_std_new.split('-')[0]
                    if (country === '中國') {
                        input_data[book][i]['state_flag'] = 'normal_internal' // 国内流传
                        pre_country = '中國'
                    } else { // 至少是国外流传
                        if (country === '日本' && pre_country !== '日本') { // 首次到达日本
                            input_data[book][i]['state_flag'] = 'Japan'
                            pre_country = '日本'
                        } else if (country === pre_country) { // 外国国内流传
                            input_data[book][i]['state_flag'] = 'normal_foreign'
                            // pre_country不变
                            pre_country = country
                        } else { // 外国跨过流传
                            input_data[book][i]['state_flag'] = 'transnational'
                            pre_country = country
                        }
                    }
                }
            }
        }
    }
    // console.log(input_data)
    return input_data
}

// 用于timeAxis处理hover selection filter的func
export function timeAxisInteraction(input_specialData, input_special_events, input_constraints) { // specialData(只包含special events的data), specialEvents(timeAxis特有数据结构),constraints
    // console.log('input_special_events', input_special_events)
    const special_events_list = ['block_print', 'last_China', 'Japan']
    let output_special_events = JSON.parse(JSON.stringify(input_special_events)) // 深拷贝

    // 首先恢复透明度, circle, link
    for (let book in output_special_events) {
        d3.selectAll(`.${book}-specialEvents`).style('opacity', 1) // 淡出
        d3.selectAll(`.${book}-link`)
                .style('opacity', 0.3)
                .attr('stroke-width', 0.5)
                .attr("filter", 'none')
        // 恢复circle的color
        for (let j in special_events_list) {
            const special_event = special_events_list[j]
            d3.selectAll(`.${book}-${special_event}-circle`)
                .attr('fill', type_color.library[output_special_events[book][special_event].lib_type])
                .attr('r', 5)
                .attr("filter", 'none')
        }
    }

    // filter和selection会改变opacity
    output_special_events = timeAxisFilter(input_specialData, output_special_events, input_constraints) // filter
    output_special_events = timeAxisHover(input_specialData, output_special_events, input_constraints) // hover(针对临时hover filter类型的，需要返回output_special_events)
    output_special_events = timeAxisSelection(input_specialData, output_special_events, input_constraints.selection) // selection

    // 设置透明度
    for (let book in output_special_events) {
        d3.selectAll(`.${book}-specialEvents`).style('opacity', output_special_events[book].opacity) // 淡出
    }

    // console.log('output_special_events', output_special_events)
    return output_special_events // 返回更新后的specialEvents
}

function timeAxisFilter(input_all_data, input_special_events, input_constraints) { // input_all_data为input_specialData
    let output_data_all = JSON.parse(JSON.stringify(input_special_events))
    const filterExcluded = TimeLineUpdate.filter_movement(input_constraints, input_all_data) // 所有filter条件下过滤掉的bookList
    // console.log('filerExcluded', filterExcluded.length, filterExcluded)
    const includedBookList = TimeLineUpdate.merge_book_list(filterExcluded, input_all_data) // 更新综合filter下来的bookList（仅有book_name）
    const excludeBookList = TimeLineUpdate.sub_array(Object.keys(input_all_data), includedBookList) // 仅有book_name

    // 遍历excludeBookList，将所有filter掉的book opacity设置为0.4
    for (let book in output_data_all) {
        if (excludeBookList.includes(book)) { // 如果出现在excludeBookList中
            output_data_all[book].opacity = 0.4
        } else {
            output_data_all[book].opacity = 1
        }
    }

    // 在timeAxis中取消全部的rect
    if (input_constraints.filter.time_range === null || input_constraints.filter.time_range[1] - input_constraints.filter.time_range[0] === 1005) {
        const jp_legend = ['平安', '镰仓', '南北朝', '室町', '江户', '明治', '大正', '昭和']
        const ch_legend = ['宋', '元', '明', '清', '民国']
        for (let jp = 0; jp < jp_legend.length; jp++) {
            d3.select(`#${jp_legend[jp]}-rect-click`).remove()
            d3.select(`#${jp_legend[jp]}-rect-hover`).remove()
            d3.select(`#${jp_legend[jp]}-text`).attr("filter", 'none')
        }
        for (let ch = 0; ch < ch_legend.length; ch++) {
            d3.select(`#${ch_legend[ch]}-rect-click`).remove()
            d3.select(`#${ch_legend[ch]}-rect-hover`).remove()
            d3.select(`#${ch_legend[ch]}-text`).attr("filter", 'none')
        }
    }
    return output_data_all // 返回修改过opacity的input_special_events(其opacity专门用来区分filter状态下的)
}

function timeAxisHover(hover_specialData, hover_specialEvents, input_constraints) { // 无需hover_specialEvents
    const hover_constraints = input_constraints.hover
    let output_hover_specialEvents = JSON.parse(JSON.stringify(hover_specialEvents))
    const special_events_list = ['block_print', 'last_China', 'Japan']
    if (hover_constraints.value === null) { // 如果是null，就先全部恢复原来的, 后续click会再判断
        return output_hover_specialEvents
        // for (let book in hover_specialData) { // 遍历每一本book
        //     // d3.selectAll(`.${book}-specialEvents`).style('opacity', 1) // 恢复opacity为1
        //     d3.selectAll(`.${book}-link`)
        //             .style('opacity', 0.3)
        //             .attr('stroke-width', 0.5)
        //             .attr("filter", 'none')
        //     // 恢复circle的color
        //     for (let i = 0; i < hover_specialData.length; i++) {
        //         d3.selectAll(`.${book}-${hover_specialData[i].state_flag}-circle`)
        //             .attr('fill', type_color.library[hover_specialData[i].lib_type])
        //             .attr('r', 5)
        //             .attr("filter", 'none')
        //     }
        // }
    } else { // 如果此时不为null
        // 此处仅考虑library和edition
        if (hover_constraints.entity === 'edition') {
            const select_book_name = hover_constraints.value
            d3.selectAll(`.${select_book_name}-link`)
                .style('opacity', 0.7)
                .attr('stroke-width', 1)
                .attr("filter", 'drop-shadow(2px 2px 1px rgb(0 0 0 / 0.2))')

            // 待修改
            for (let j in special_events_list) {
                const special_event = special_events_list[j]
                d3.selectAll(`.${select_book_name}-${special_event}-circle`)
                    .attr('fill', type_color.library.bright[hover_specialEvents[select_book_name][special_event].lib_type])
                    .attr('r', 7)
                    .attr("filter", 'drop-shadow(3px 2px 2px rgb(0 0 0 / 0.6))')
            }
        } else if (hover_constraints.entity === 'library_id') { // highlight所有经过该机构的circle
            const lib_id = hover_constraints.value
            for (let book in hover_specialData) {
                for (let i = 0; i < hover_specialData[book].length; i++) {
                    const cur_lib_id = hover_specialData[book][i].lib_id
                    if (cur_lib_id === lib_id) { // 如果与当前机构相同
                        // for (let j in special_events_list) {
                        //     const special_event = special_events_list[j]
                        //     d3.selectAll(`.${book}-${special_event}-circle`)
                        //         .attr('fill', type_color.library.bright[hover_specialEvents[book][special_event].lib_type])
                        //         .attr('r', 7)
                        //         .attr("filter", 'drop-shadow(3px 2px 2px rgb(0 0 0 / 0.6))')
                        // }

                        d3.selectAll(`#${book}-${hover_specialData[book][i].lib_type}-circle`)
                            .attr('fill', type_color.library.bright[hover_specialData[book][i].lib_type])
                            .attr('r', 7)
                            .attr("filter", 'drop-shadow(3px 2px 2px rgb(0 0 0 / 0.6))')
                    } else { // 不相同则恢复原状
                        // for (let j in special_events_list) {
                        //     const special_event = special_events_list[j]
                        //     d3.selectAll(`.${book}-${special_event}-circle`)
                        //         .attr('fill', type_color.library[hover_specialEvents[book][special_event].lib_type])
                        //         .attr('r', 5)
                        //         .attr("filter", 'none')
                        // }
                        d3.selectAll(`#${book}-${hover_specialData[book][i].lib_type}-circle`)
                            .attr('fill', type_color.library[hover_specialData[book][i].lib_type])
                            .attr('r', 5)
                            .attr("filter", 'none')
                    }
                }
            }
        } else { // filter的那些
            output_hover_specialEvents = timeAxisFilter(hover_specialData, output_hover_specialEvents, input_constraints)
        }
        return output_hover_specialEvents
    }
}

function timeAxisSelection(select_specialData, select_specialEvents, select_constraints) {
    const special_events_list = ['block_print', 'last_China', 'Japan']
    let output_select_specialEvents = JSON.parse(JSON.stringify(select_specialEvents))
    if (select_constraints.value === null) { // hover判断的时候已经恢复了，这里不操作
        return output_select_specialEvents
    } else { // 如果selection不为null
        if (select_constraints.entity === 'edition') { // edition
            const select_book_name = select_constraints.value
            d3.selectAll(`.${select_book_name}-link`)
                .style('opacity', 0.7)
                .attr('stroke-width', 1)
                .attr("filter", 'drop-shadow(2px 2px 1px rgb(0 0 0 / 0.2))')
            for (let i = 0; i < select_specialData[select_book_name].length; i++) {
                d3.selectAll(`#${select_book_name}-${select_specialData[select_book_name][i].lib_type}-circle`)
                    .attr('fill', type_color.library.bright[select_specialData[select_book_name][i].lib_type])
                    .attr('r', 7)
                    .attr("filter", 'drop-shadow(3px 2px 2px rgb(0 0 0 / 0.6))')
            }
        } else if (select_constraints.entity === 'library_id') { // library_id
            const lib_id = select_constraints.value
            for (let book in select_specialData) {
                let find_library = false
                for (let i = 0; i < select_specialData[book].length; i++) {
                    const cur_lib_id = select_specialData[book][i].lib_id
                    if (cur_lib_id === lib_id) { // 如果与当前机构相同
                        find_library = true
                        // for (let j in special_events_list) {
                        //     const special_event = special_events_list[j]
                        //     d3.selectAll(`.${book}-${special_event}-circle`)
                        //         .attr('fill', type_color.library.bright[select_specialEvents[book][special_event].lib_type])
                        //         .attr('r', 7)
                        //         .attr("filter", 'drop-shadow(3px 2px 2px rgb(0 0 0 / 0.6))')
                        // }
                        d3.selectAll(`#${book}-${select_specialData[book][i].lib_type}-circle`)
                            .attr('fill', type_color.library.bright[select_specialData[book][i].lib_type])
                            .attr('r', 7)
                            .attr("filter", 'drop-shadow(3px 2px 2px rgb(0 0 0 / 0.6))')
                    } else { // 不相同则恢复原状
                        // for (let j in special_events_list) {
                        //     const special_event = special_events_list[j]
                        //     d3.selectAll(`.${book}-${special_event}-circle`)
                        //         .attr('fill', type_color.library[select_specialEvents[book][special_event].lib_type])
                        //         .attr('r', 5)
                        //         .attr("filter", 'none')
                        // }
                        d3.selectAll(`#${book}-${select_specialData[book][i].lib_type}-circle`)
                            .attr('fill', type_color.library[select_specialData[book][i].lib_type])
                            .attr('r', 5)
                            .attr("filter", 'none')
                    }
                }

                if (!find_library) { // 如果没找到符合的library
                    output_select_specialEvents[book].opacity = 0.4 // 修改specialEvents的opacity，淡出
                    // d3.selectAll(`.${book}-specialEvents`).style('opacity', 0.4) // 淡出
                }
            }
        }
        // console.log('output_select_specialEvents', output_select_specialEvents)
        return output_select_specialEvents
    }
}


