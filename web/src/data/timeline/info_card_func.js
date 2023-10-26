import * as d3 from "d3";
const $ = require("jquery");
import * as BookTraj from "@/data/BookTraj";
import * as Data from "@/data/Data.js";
import { color, type_color } from "@/theme"
import * as Translate from "@/theme/lang";

export function sorted_event_card_seq(id1, id2) {
    const val1 = Number(id1.次序) //需要排序的某个值
    const val2 = Number(id2.次序)
    if (val1 < val2) {
        return -1
    } else if (val1 > val2) {
        return 1
    } else {
        return 0
    }
}

export function book_info_language(lang_choice, raw_book_detail) {
    let output_book_detail = JSON.parse(JSON.stringify(raw_book_detail)) // deep copy
    if (output_book_detail.book_name === '集千家註分類杜工部詩') {
        output_book_detail.責任者 = '唐-杜甫-撰/宋-徐居仁-編次/宋-黃鶴-補注'
    }
    output_book_detail.責任者
    if (lang_choice === 'zh') {
        output_book_detail.book_name = Translate.book_name_lang[output_book_detail.book_name].zh
        output_book_detail.type = Translate.book_types[output_book_detail.type].zh_0 // '经史子集'
        output_book_detail.責任者 = Translate.book_card_trans.responsible_people[output_book_detail.責任者].zh
        output_book_detail.卷數 = Translate.book_card_trans.volume[output_book_detail.卷數].zh
        output_book_detail.版本 = Translate.book_card_trans.version[output_book_detail.版本].zh
        output_book_detail.地點 = Translate.book_card_trans.location_name[output_book_detail.地點].zh
    } else if (lang_choice === 'en') {
        output_book_detail.book_name = Translate.book_name_lang[output_book_detail.book_name].en
        output_book_detail.type = Translate.book_types[output_book_detail.type].en_0 // '经史子集'
        output_book_detail.責任者 = Translate.book_card_trans.responsible_people[output_book_detail.責任者].en
        output_book_detail.卷數 = Translate.book_card_trans.volume[output_book_detail.卷數].en
        output_book_detail.版本 = Translate.book_card_trans.version[output_book_detail.版本].en
        output_book_detail.地點 = Translate.book_card_trans.location_name[output_book_detail.地點].en
    }
    return output_book_detail
}

// 计算timeline视图中info_card的位置
// 仅考虑与原circle之间的最小距离约束
export function cal_info_card_pos(xTimeScale, event_detail_list, input_rem) { // event_detail_list = event_detail_pop
    // console.log('event_detail_list', event_detail_list) // success
    const card_width = 6 * input_rem,
          card_gap = 3 * input_rem
    let info_card_attr = []

    for (let i = 0; i < event_detail_list.length; i ++) { // round 1, initialization
        info_card_attr.push({
            x_ori: xTimeScale(new Date(event_detail_list[i].time_info.timestamp, 1, 1)) - card_width / 2, // central alignment
            x_pos: xTimeScale(new Date(event_detail_list[i].time_info.timestamp, 1, 1)) - card_width / 2,
            width: card_width,
            ori_idx: event_detail_list[i].ori_idx,
            // adjustment: false // in adjustment state, boolean
        })
    }

    for (let i = 0; i < event_detail_list.length; i ++) { // round 2, adjust position
        if (i > 0) { // from the 2nd event
            if (info_card_attr[i].x_pos - info_card_attr[i - 1].x_pos < card_width + card_gap) { // conflict
                let j = i,
                    total_span_start = info_card_attr[j].x_pos

                // 回溯
                let if_rewind = j > 0 ? (info_card_attr[j].x_pos - info_card_attr[j - 1].x_pos < card_width + card_gap) : false

                while (if_rewind) {
                    // console.log(j)
                    total_span_start = info_card_attr[j - 1].x_pos

                    // adjust current position
                    const cur_event_num = i - (j - 1), // 当前所有需要调整位置的event数目
                          cur_total_span = cur_event_num * (card_width + card_gap) - card_gap

                    // optimize
                    let minValue = Infinity,
                        minXValue
                    for (let x = Math.round(total_span_start - cur_total_span / 2); x < Math.round(total_span_start + cur_total_span / 2); x += 10) {
                        let optimize_func_value = 0
                        for (let k = j - 1; k <= i; k ++) {
                            const offset_num = k - (j - 1)
                            optimize_func_value += Math.abs(x + offset_num * (card_width + card_gap) - info_card_attr[k].x_ori) // offset
                        }
                        
                        // console.log('optimize_func_value', optimize_func_value)
                        if (optimize_func_value < minValue) {
                            minValue = optimize_func_value;
                            minXValue = x;
                            // console.log('x', x)
                        } else { // 一次函数，全局最优解
                            break
                        }
                    }

                    // update position
                    // console.log('起始位置', j - 1)
                    for (let k = j - 1; k <= i; k ++) {
                        const offset_num = k - (j - 1)
                        info_card_attr[k].x_pos = minXValue + offset_num * (card_width + card_gap)
                    }

                    j -- // update j
                    if_rewind = j > 0 ? (info_card_attr[j].x_pos - info_card_attr[j - 1].x_pos < card_width + card_gap) : false
                }      
                
            } else {
                // no movement
            }
        }

    }
    // console.log('info_card_attr', info_card_attr)
    return info_card_attr
}

// 同时考虑“同时放在一个界面之内”和“与circle之间的距离最小”2个约束
export function cal_info_card_pos_plus(xTimeScale, event_detail_list, input_rem, container_width) { // event_detail_list = event_detail_pop
    const card_width = 6 * input_rem,
          card_gap = 3 * input_rem,
          ifContain = (1 - 0.15 - 0.08) * container_width >= (card_width + card_gap) * event_detail_list.length + card_gap, // boolean
          offsetX = vwToPx(14.6) //abs

    let info_card_attr = []
    // console.log('ifContain', ifContain)

    for (let i = 0; i < event_detail_list.length; i ++) { // round 1, initialization
        info_card_attr.push({
            x_ori: xTimeScale(new Date(event_detail_list[i].time_info.timestamp, 1, 1)) - card_width / 2, // central alignment
            x_pos: xTimeScale(new Date(event_detail_list[i].time_info.timestamp, 1, 1)) - card_width / 2,
            width: card_width,
            ori_idx: event_detail_list[i].ori_idx,
            conflict_group: [event_detail_list[i].ori_idx] // 用于记录与该info_card相冲突的info_card的ori_idx, []
            // adjustment: false // in adjustment state, boolean
        })
    }

    for (let i = 0; i < event_detail_list.length; i ++) { // round 2, adjust position
        if (i > 0) { // from the 2nd event
            if (info_card_attr[i].x_pos - info_card_attr[i - 1].x_pos < card_width + card_gap) { // conflict
                let j = i,
                    total_span_start = info_card_attr[j].x_pos,
                    rewind_list = []

                // 回溯
                let if_rewind = j > 0 ? (info_card_attr[j].x_pos - info_card_attr[j - 1].x_pos < card_width + card_gap) : false

                while (if_rewind) {
                    // console.log(j)
                    rewind_list.push(info_card_attr[j].ori_idx)
                    total_span_start = info_card_attr[j - 1].x_pos

                    // adjust current position
                    const cur_event_num = i - (j - 1), // 当前所有需要调整位置的event数目
                          cur_total_span = cur_event_num * (card_width + card_gap) - card_gap

                    // optimize
                    let minValue = Infinity,
                        minXValue
                    for (let x = Math.round(total_span_start - cur_total_span / 2); x < Math.round(total_span_start + cur_total_span / 2); x += 10) {
                        let optimize_func_value = 0
                        for (let k = j - 1; k <= i; k ++) {
                            const offset_num = k - (j - 1)
                            optimize_func_value += Math.abs(x + offset_num * (card_width + card_gap) - info_card_attr[k].x_ori) // offset
                        }
                        
                        // console.log('optimize_func_value', optimize_func_value)
                        if (optimize_func_value < minValue) {
                            minValue = optimize_func_value;
                            minXValue = x;
                            // console.log('x', x)
                        } else { // 一次函数，全局最优解
                            break
                        }
                    }

                    // update position
                    // console.log('起始位置', j - 1)
                    for (let k = j - 1; k <= i; k ++) {
                        const offset_num = k - (j - 1)
                        info_card_attr[k].x_pos = minXValue + offset_num * (card_width + card_gap)
                    }

                    j -- // update j
                    if_rewind = j > 0 ? (info_card_attr[j].x_pos - info_card_attr[j - 1].x_pos < card_width + card_gap) : false
                }   
                
                // 更新 conflict_group
                for (let m = i; m >= 0; m --) {
                    if (info_card_attr[m].ori_idx in rewind_list) {
                        info_card_attr[m].conflict_group = rewind_list
                    } else {
                        break
                    }
                }
            } else {
                // no movement
            }
        }

    }

    // round 3, modify some of the info cards' position
    if (ifContain) { // 如果正常情况下可以包含全部的info_card，那么需要round 3 遍历
        let current_conflict_group = []
        for (let i = info_card_attr.length - 1; i >= 0; i --) { // reverse
            if (i === info_card_attr.length - 1) { // for the last info_card
                current_conflict_group = JSON.parse(JSON.stringify(info_card_attr[i].conflict_group)) // initialize
                // console.log('info_card_attr[i].x_pos', info_card_attr[i].x_pos)
                // console.log('offsetX', offsetX)
                // console.log('container_width', container_width)
                // console.log('card_gap / 2', card_gap / 2)
                if (info_card_attr[i].x_pos + card_width > container_width * 0.95 - 0.5 * card_gap) { // 如果超出了右边界
                    // console.log('超出右边界啦')
                    // info_card_attr[i].x_pos = container_width - card_gap - card_width // normal
                    info_card_attr[i].x_pos = container_width * 0.95 - 0.5 * card_gap - card_width
                }
            } else { // for other info_cards
                if (info_card_attr[i].conflict_group !== current_conflict_group) { // if not in the current conflict group
                    current_conflict_group = JSON.parse(JSON.stringify(info_card_attr[i].conflict_group))
                } else {
                    // no movement
                }

                if (info_card_attr[i].x_pos + card_width + card_gap > info_card_attr[i + 1].x_pos) { // if conflict
                    info_card_attr[i].x_pos = info_card_attr[i + 1].x_pos - card_width - card_gap
                }
            }
        }
    }
    // console.log('info_card_attr', info_card_attr)
    return info_card_attr
}

function vwToPx(vw) {
    return vw * window.innerWidth / 100;
  }

// 绘制circle与info_card之间的连线
export function draw_card_link(event_data_list, circle_y_pos, container_maxX, book_name) { // deta_y = 45
    const link = d3.line()
                    .curve(d3.curveBumpY),
        //   offsetX = vwToPx(2.9) //abs, 2.4
        offsetX = vwToPx(14.6) //abs
    setTimeout(() => {
        d3.select(`#${book_name}-card-link`)
                                    .select('#card-link-svg')
                                    .selectAll('g')
                                    .remove();
        // console.log(d3.select(`#${book_name}-card-link`).select('#card-link-svg'))
        const card_link_group = d3.select(`#${book_name}-card-link`)
                                    .select('#card-link-svg')
                                    // d3.select('#timeLineSVG')
                                    .append('g')
                                    .attr('class', 'card-link-group')
        // console.log('offsetX', offsetX)
        for (let i in event_data_list) {
            card_link_group.append('path')
                            .attr('id', `card-link-${(event_data_list[i].ori_idx).toString()}`)
                            .attr('d', link([[event_data_list[i].card_pos.x_ori, 0], [event_data_list[i].card_pos.x_pos, 45]]))
                            // .attr('d', link([[event_data_list[i].card_pos.x_ori - offsetX, 0], [event_data_list[i].card_pos.x_pos - offsetX, 45]]))
                            .attr('stroke', '#a89587')
                            .attr('fill', 'none')
                            // .style('opacity', 0.3)
                            .attr('stroke-width', 0.7)
                            .style('visibility', () => {
                                // console.log('container_maxX', container_maxX)
                                if (event_data_list[i].card_pos.x_pos + offsetX > container_maxX || event_data_list[i].card_pos.x_pos < container_maxX * 0.15) { // 0.3
                                    return 'hidden'
                                } else {
                                    return 'visible'
                                }
                            })
        }
        let myDiv = document.getElementById(`${book_name}-event-container-all`)

        myDiv.addEventListener('scroll', function() { // 实时监听scroll
            let scrollLeft = myDiv.scrollLeft;
            // let scrollWidth = myDiv.scrollWidth;
            // let width = myDiv.clientWidth;
            // let percent = (scrollLeft / (scrollWidth - width));
            // console.log(percent + '%');

            for (let i in event_data_list) {
                d3.select(`#card-link-${(event_data_list[i].ori_idx).toString()}`)
                // .attr('d', link([[event_data_list[i].card_pos.x_ori + offsetX, circle_y_pos], [event_data_list[i].card_pos.x_pos + offsetX - scrollLeft, circle_y_pos + 45]]))
                // .attr('d', link([[event_data_list[i].card_pos.x_ori - offsetX, 0], [event_data_list[i].card_pos.x_pos - offsetX - scrollLeft, 45]]))
                .attr('d', link([[event_data_list[i].card_pos.x_ori, 0], [event_data_list[i].card_pos.x_pos - scrollLeft, 45]]))
                .style('visibility', () => {
                    // console.log('container_maxX', container_maxX)
                    if (event_data_list[i].card_pos.x_pos + offsetX - scrollLeft > container_maxX || event_data_list[i].card_pos.x_pos - scrollLeft < container_maxX * 0.15) { // 0.3
                        return 'hidden'
                    } else {
                        return 'visible'
                    }
                })
            }
        })
    }, 100)
}

  