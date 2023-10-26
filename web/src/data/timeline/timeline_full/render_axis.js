import * as d3 from "d3";
const $ = require("jquery");
import { color, type_color } from "@/theme";
import * as DataProcess from "@/data/timeline/timeline_full/data_process";

export let timeScale = d3.scaleLinear()
                            .domain([960, 1965])
                            .range([0.08 * $(".app").width() * 0.85 * 1.176, $(".app").width() * 0.85 * 1.176 * (1 - 0.02)])
                            // .range([0.08 * $(".main-panel").width() * 1.176, $(".main-panel").width() * 1.176 * (1 - 0.02)])

export function draw_axis_circle(timeScale, events, y_offset, rem) { // timeScle is linear
    d3.select('#timeline-full-axis').selectAll('.event-group').remove()
    let event_group = d3.select('#timeline-full-axis')
                        .append('g')
                        .attr('class', 'event-group')
                        .attr('transform', `translate(0,${y_offset})`)
    let event = event_group.selectAll('g')
                            .data(events)
                            .join('g')
                            .attr('class', 'event-circle')

    // 表示不确定性的dashed-line
    event
        .append("line")
        .attr('id', (d, i) => `${d.書名}-eventFull-lineLeft-${(i + 1).toString()}`)
        .attr('x1', function(d) {
            if (d.time_info.left_bound === null) {
                return timeScale(d.time_info.timestamp - 40)
            } else if (Math.abs(d.time_info.timestamp - d.time_info.left_bound) > 40) {
                return timeScale(d.time_info.timestamp - 40)
            } else {
                return timeScale(d.time_info.timestamp - 40)
            }
        })
        .attr('x2', (d) => timeScale(d.time_info.timestamp))
        .attr("stroke", (d) => type_color.library[d.lib_type])
        .attr('stroke-dasharray', function(d, i) {
            if (d.time_info.left_bound === null || Math.abs(d.time_info.timestamp - d.time_info.left_bound) > 40) {
                return '6,4'
            } else { return '6,0' }
        })
        .style('display', (d) => d.time_info.certainty? 'none': 'block')
        .attr('stroke-width', 3)

    event
        .append("line")
        .attr('id', (d, i) => `${d.書名}-eventFull-lineRight-${(i + 1).toString()}`)
        .attr('x1', (d) => timeScale(d.time_info.timestamp))
        .attr('x2', function(d) {
            if (d.time_info.right_bound === null) {
                return timeScale(d.time_info.timestamp + 40)
            } else if (Math.abs(d.time_info.timestamp - d.time_info.right_bound) > 40) {
                return timeScale(d.time_info.timestamp + 40)
            } else {
                return timeScale(d.time_info.timestamp + 40)
            }
        })
        .attr("stroke", (d) => type_color.library[d.lib_type])
        .attr('stroke-dasharray', function(d, i) {
            if (d.time_info.right_bound === null || Math.abs(d.time_info.timestamp - d.time_info.right_bound) > 40) {
                return '6,4'
            } else { return '6,0' }
        })
        .style('display', (d) => d.time_info.certainty? 'none': 'block')
        .attr('stroke-width', 3)
    // evnet circle
    const eventRectCircle = event.append('g')
                                    .attr('id', (d, i) => `${d.書名}-eventFull-circle-${(i + 1).toString()}`)
                                    .style('cursor', 'pointer') // hover上去以后鼠标变为手的形状
    eventRectCircle.append("circle")
                    .attr('id', (d, i) => `${d.書名}-eventFull-circle-item-${(i + 1).toString()}`)
                    .attr("cx", (d) =>
                        timeScale(d.time_info.timestamp)
                    )
                    .attr("r", function(d) {
                        if (d.state_flag === 'block_print' || d.state_flag === 'Japan') {
                        return 0.7 * rem
                        } else { return rem * 0.5 } // 默认是7
                    })
                    .attr("fill", function (d, i) {
                        return type_color.library[d.lib_type]
                    })
                    .attr("stroke", "white")
}

// 计算信息卡片X轴的分布位置(一般情况)
export function computeCardPosition(events, canvas_width, rem) {
    events = specialCardPosition(events)
    const card_num = events.length,
          card_width = 10 * rem
    let compute_card_num = card_num > 8 ? 8 : card_num
    let gap = Math.min((canvas_width - compute_card_num * card_width) / (compute_card_num + 1), 1.5 * rem),
        half_num // 中位数, list, list.length = 2
    if (card_num < 8) { // 同一个屏幕放得下
        if (card_num % 2 !== 0) { // 奇数
            half_num = [Math.ceil(card_num / 2), Math.ceil(card_num / 2)]
        } else { // 偶数
            half_num = [card_num / 2, card_num / 2 + 1]
        }
        console.log('half_num', half_num)
        // 计算中间卡片的横坐标
        let mark = 1 // 正负号，初始为+1，第1次为-1，第2次为+1
        for (let i in half_num) {
            mark = -mark
            const card_offset = mark === -1 ? - card_width : 0
            events[half_num[i] - 1]['card_XPos'] = canvas_width / 2 + mark * (half_num[1] - half_num[0]) * gap / 2 + card_offset

            // 对于奇数(之前的规则不适用)
            if (half_num[1] - half_num[0] === 0) {
                events[half_num[i] - 1]['card_XPos'] = canvas_width / 2 - card_width / 2
            }

            if (mark === -1) { // 中间数左侧
                for (let j = half_num[i] - 1; j >= 0; j--) {
                    const seq_diff = Math.abs(j - (half_num[i] - 1))
                    events[j]['card_XPos'] = events[half_num[i] - 1]['card_XPos'] - seq_diff * (gap + card_width)
                }
            } else { // 中间数右侧
                for (let j = half_num[i] - 1; j < card_num; j++) {
                    const seq_diff = Math.abs(j - (half_num[i] - 1))
                    events[j]['card_XPos'] = events[half_num[i] - 1]['card_XPos'] + seq_diff * (gap + card_width)
                }
            }
        }
    } else {
        let mark = 1
        half_num = [4, 5]
        for (let i in half_num) {
            mark = -mark
            const card_offset = mark === -1 ? - card_width : 0
            events[half_num[i] - 1]['card_XPos'] = canvas_width / 2 + mark * gap / 2 + card_offset
            if (mark === -1) { // 中间数左侧
                for (let j = half_num[i] - 1; j >= 0; j--) {
                    const seq_diff = Math.abs(j - (half_num[i] - 1))
                    events[j]['card_XPos'] = events[half_num[i] - 1]['card_XPos'] - seq_diff * (gap + card_width)
                }
            } else { // 中间数右侧
                for (let j = half_num[i] - 1; j < card_num; j++) {
                    const seq_diff = Math.abs(j - (half_num[i] - 1))
                    events[j]['card_XPos'] = events[half_num[i] - 1]['card_XPos'] + seq_diff * (gap + card_width)
                }
            }
        }
        for (let e = 8; e < events.length; e++) {
            events[e]['card_XPos'] = events[e - 8]['card_XPos'] + canvas_width // 完全对照
            const seq_diff = Math.abs(e - 7)
            if (seq_diff === 8) {
                events[e]['card_XPos'] = events[7]['card_XPos'] + events[0]['card_XPos'] + card_width
            } else {
                events[e]['card_XPos'] = events[8]['card_XPos'] + (seq_diff - 1) * (card_width + gap)
            }
        }
    }
    // 再次遍历，寻找特殊情况的card
    for (let e = 0; e < events.length; e++) {
        if (events[e]['iterate']['agent_pair']) { // 相同收藏机构的不同收藏人物（event card合在一起）
            if (events[e]['iterate']['pair_offset'] === 1) { // 左侧
                events[e]['card_XPos'] += (gap / 2 + card_width * 0.015)
            } else if (events[e]['iterate']['pair_offset'] === 2) { // 右侧
                events[e]['card_XPos'] -= (gap / 2 + card_width * 0.015)
            }          
        }
        if (events[e]['iterate']['library_pair']) { // 收藏机构更迭（event card间距减小）
            if (events[e]['iterate']['lib_iterate_pos'] === 1) { // 左侧
                events[e]['card_XPos'] += gap / 4
            } else if (events[e]['iterate']['lib_iterate_pos'] === 2) { // 右侧
                events[e]['card_XPos'] -= gap / 4
            }
            // 对于正好在翻页处的event
            if (e === 7 && events.length > 8) {
                const cur_gap = events[e + 1]['card_XPos'] - events[e]['card_XPos'] - card_width
                console.log('cur_gap', cur_gap)
                events[e]['card_XPos'] = events[e]['card_XPos'] + cur_gap / 2 - gap / 4
                events[e + 1]['card_XPos'] = events[e + 1]['card_XPos'] - cur_gap / 2 + gap / 4
            }
        }
    }
    console.log('events_render', events)
    return events
}

// 收藏机构更迭的library group name
const libraryIterationGroup = {
    group1: ['太政官文庫', '内閣文庫', '內閣文庫', '國立公文書館'],
    group2: ['宮內省書陵部', '宮內省圖書寮', '宮內省圖書寮(後改名宮內廳書陵部)', '宮內省圖書寮慶福院', '宮內廳書陵部', '宮内省圖書寮', '宮内厛書陵部', '宮内廳書陵部', '宮内省書陵部'],
    group3: ['躋壽館', '江戶醫學館'],
    group4: ['林氏家塾', '昌平坂學問所']
}

// 在此计算特殊信息卡片（eg. 机构更迭、经手人流传）的position
function specialCardPosition(events) {
    let pre_library = 'start', // for agent && library iteration
        lib_group = null // 所属于的library iteration group, 不代表完全确定存在机构更迭
    for (let e = 0; e < events.length; e++) {
        events[e]['iterate'] = {
            library_pair: false,
            agent_pair: false,
            pair_offset: 0, // agent, start from number 1
            lib_iterate_pos: 0, // library, 机构迭代的首张卡片index, start from 1
        }
        // agent iteration
        if (events[e].library === pre_library && !(['', '-', '不詳', '--'].includes(events[e].library)) && e > 0) { // 经手前后两个相同收藏机构的不同收藏人物
            // 最多只有2个events相同机构, 且仅有1组
            events[e - 1]['iterate']['agent_pair'] = true
            events[e]['iterate']['agent_pair'] = true

            events[e - 1]['iterate']['pair_offset'] = 1
            events[e]['iterate']['pair_offset'] = 2
        } else { // 冗余
            events[e]['iterate']['agent_pair'] = false
            events[e]['iterate']['pair_offset'] = 0
        }

        // library iteration
        let group_found = false
        for (let group in libraryIterationGroup) {    
            if (libraryIterationGroup[group].includes(events[e].library) && events[e].library !== pre_library) { // have probability
                group_found = true
                // console.log(lib_group, group)
                if (lib_group === group && e > 0) {
                    // 每组最多只有2个events相同机构，但是可能有多组
                    events[e - 1]['iterate']['library_pair'] = true
                    events[e]['iterate']['library_pair'] = true
                    events[e - 1]['iterate']['lib_iterate_pos'] = 1
                    events[e]['iterate']['lib_iterate_pos'] = 2
                } else { // 冗余
                    events[e]['iterate']['library_pair'] = false
                    events[e]['iterate']['lib_iterate_pos'] = 0
                    lib_group = group
                    // console.log(lib_group, group)
                }

                lib_group = group // 更新所属lib_group
                break
            } else { // 冗余

            }    
            // console.log((libraryIterationGroup[group]))
        }
        if (!group_found) { // 冗余
            events[e]['iterate']['library_pair'] = false
            events[e]['iterate']['lib_iterate_pos'] = 0
            lib_group = null // clear
        }
        pre_library = events[e].library
    }
    return events
}

export function agentIterateDivParam(events, rem) {
    let agent_iterate = { // 经手人物更迭的参数
        library: null,
        exist: false,
        lib_rect: {
            left: 0,
            top: 0
        },
        dashed_line: {
            left: 0,
            top: 0
        }
    }
    for (let e = 0; e < events.length; e++) {
        if (events[e]['iterate']['agent_pair'] && events[e]['iterate']['pair_offset'] === 1) {
            agent_iterate = {
                library: events[e]['library'],
                exist: true,
                lib_rect: {
                    left: events[e]['card_XPos'] + 0.15 * rem,
                    top: 2.8 * rem
                },
                dashed_line: {
                    left: events[e + 1]['card_XPos'],
                    top: 4.5 * rem
                }
            }
            break
        }
    }
    return agent_iterate
}

export function libraryIterateDivParam(events, rem) {
    let library_iterate = {
        exist: false,
        iterate_pos: [] // {left: , top: }
    }
    for (let e = 0; e < events.length; e++) {
        if (events[e]['iterate']['library_pair'] && events[e]['iterate']['lib_iterate_pos'] === 1) {
            library_iterate['exist'] = true
            library_iterate['iterate_pos'].push({
                left: events[e]['card_XPos'] + 10 * rem - 0.5 * rem,
                top:  2.8 * rem
            }) 
        }
    }
    console.log('library_iterate', library_iterate)
    return library_iterate
}

export function cirle2eventCardLink(bookName, events, rem) { // 绘制event circle到event card的连线
    // console.log(d3.select('#circle2card-svg')) // success
    d3.select('#circle2card-svg').selectAll('g').remove()
    let link_group = d3.select('#circle2card-svg').append('g').attr('class', 'circle2card-group')
    let origin_pos = $('#circle2card-link').offset() // svg本身的偏移量

    // 定义路径数据
    let pathData = d3.path()
    let myDiv = document.getElementById('event-scroll-container'),
        scrollLeft = myDiv.scrollLeft
    
    for (let e = 0; e < events.length; e++) {
        // 获取circle的坐标、event card坐标
        let circle_pos = $(`#${bookName}-eventFull-circle-item-${(e + 1).toString()}`).offset() // circle
        let card_pos = $(`#${bookName}-event-card-seq-${(e + 1).toString()}`).offset() // events card，横坐标可变
        // console.log('circle_pos', circle_pos, document.getElementById(`${bookName}-eventFull-circle-item-${(e + 1).toString()}`).getBoundingClientRect()) // circle
        // console.log('card_pos', card_pos) // event card

        // 计算中间值
        const ave_y = ((circle_pos.top + rem * 0.5) + (card_pos.top + rem * 0.6)) / 2,
              ave_num = Math.ceil(events.length / 2)

        // 设置拐角radius，连线错位offset
        const inflexion_radius = 0.1 * rem,
              link_y_offset = 0.2 * rem
        // 计算各个拐点的坐标
        let link_pos = [
            { // 起始点
                x: circle_pos.left + rem * 0.5 - origin_pos.left,
                y: circle_pos.top + rem * 0.5 - origin_pos.top
            }, { // arc1 start
                x: circle_pos.left + rem * 0.5 - origin_pos.left,
                y: ave_y + (e - ave_num) * link_y_offset - origin_pos.top
            }, { // arc1 end
                x: (circle_pos.left - card_pos.left) > 0 ? circle_pos.left + rem * 0.5 - inflexion_radius - origin_pos.left : circle_pos.left + rem * 0.5 + inflexion_radius - origin_pos.left,
                y: ave_y + (e - ave_num) * link_y_offset + inflexion_radius - origin_pos.top
            }, { // arc2 start
                x: (circle_pos.left - card_pos.left) > 0 ? card_pos.left + rem * 0.6 + inflexion_radius - origin_pos.left : card_pos.left + rem * 0.6 - inflexion_radius - origin_pos.left,
                y: ave_y + (e - ave_num) * link_y_offset + inflexion_radius - origin_pos.top
            }, { // arc2 end
                x: card_pos.left + rem * 0.6 - origin_pos.left,
                y: ave_y + (e - ave_num) * link_y_offset + inflexion_radius * 2 - origin_pos.top // 0.05 * 2
            }, { // end
                x: card_pos.left + rem * 0.6 - origin_pos.left,
                y: card_pos.top + rem * 0.6 - origin_pos.top
            }

        ]
        // console.log('link_pos', link_pos)
        pathData.moveTo(link_pos[0].x, link_pos[0].y) // 移动到起始点
        pathData.lineTo(link_pos[1].x, link_pos[1].y)
        pathData.arcTo(link_pos[1].x, link_pos[2].y, link_pos[2].x, link_pos[2].y, inflexion_radius) // 绘制圆弧
        pathData.lineTo(link_pos[3].x, link_pos[3].y)
        pathData.arcTo(link_pos[4].x, link_pos[3].y, link_pos[4].x, link_pos[4].y, inflexion_radius) // 绘制圆弧
        pathData.lineTo(link_pos[5].x, link_pos[5].y)

        // 在SVG中添加路径元素
        d3.selectAll(`#${bookName}-circle2card-link-${(e + 1).toString()}`).remove()
        link_group.append("path")
                    .attr("d", pathData.toString()) // 设置路径的数据
                    .attr('id', `${bookName}-circle2card-link-${(e + 1).toString()}`)
                    .attr("stroke", "#8F7B6C") // 设置线段颜色
                    .attr("stroke-width", 1) // 设置线段宽度
                    .attr("fill", "none") // 设置填充为无填充
                    .style('opacity', 0.5)
                    .style('visibility', () => {
                        if (card_pos.left < myDiv.getBoundingClientRect().left || card_pos.left + 0.6 * rem > myDiv.offsetWidth + myDiv.getBoundingClientRect().left) { // 0.3
                            return 'hidden'
                        } else {
                            return 'visible'
                        }
                    })

        // 实时监听event card的横坐标
        myDiv.addEventListener('scroll', function() { // 实时监听scroll
            d3.selectAll(`#${bookName}-circle2card-link-${(e + 1).toString()}`).remove()
            let pathData = d3.path()
            card_pos = $(`#${bookName}-event-card-seq-${(e + 1).toString()}`).offset() // events card，横坐标可变
            // let circle_pos = $(`#${bookName}-eventFull-circle-item-${(e + 1).toString()}`).offset() // circle(防止报错)
            // let origin_pos = $('#circle2card-link').offset() // svg本身的偏移量(防止报错)
            // console.log((e + 1).toString(), card_pos, circle_pos, origin_pos)
            if (card_pos !== undefined) { // 防止报错
                // console.log((e + 1).toString())
                // 计算中间值
                const ave_y = ((circle_pos.top + rem * 0.5) + (card_pos.top + rem * 0.6)) / 2,
                ave_num = Math.ceil(events.length / 2)

                // 设置拐角radius，连线错位offset
                const inflexion_radius = 0.1 * rem,
                        link_y_offset = 0.2 * rem
                // 计算各个拐点的坐标
                let link_pos = [
                    { // 起始点
                        x: circle_pos.left + rem * 0.5 - origin_pos.left,
                        y: circle_pos.top + rem * 0.5 - origin_pos.top
                    }, { // arc1 start
                        x: circle_pos.left + rem * 0.5 - origin_pos.left,
                        y: ave_y + (e - ave_num) * link_y_offset - origin_pos.top
                    }, { // arc1 end
                        x: (circle_pos.left - card_pos.left) > 0 ? circle_pos.left + rem * 0.5 - inflexion_radius - origin_pos.left : circle_pos.left + rem * 0.5 + inflexion_radius - origin_pos.left,
                        y: ave_y + (e - ave_num) * link_y_offset + inflexion_radius - origin_pos.top
                    }, { // arc2 start
                        x: (circle_pos.left - card_pos.left) > 0 ? card_pos.left + rem * 0.6 + inflexion_radius - origin_pos.left : card_pos.left + rem * 0.6 - inflexion_radius - origin_pos.left,
                        y: ave_y + (e - ave_num) * link_y_offset + inflexion_radius - origin_pos.top
                    }, { // arc2 end
                        x: card_pos.left + rem * 0.6 - origin_pos.left,
                        y: ave_y + (e - ave_num) * link_y_offset + inflexion_radius * 2 - origin_pos.top // 0.05 * 2
                    }, { // end
                        x: card_pos.left + rem * 0.6 - origin_pos.left,
                        y: card_pos.top + rem * 0.6 - origin_pos.top
                    }
                ]
                pathData.moveTo(link_pos[0].x, link_pos[0].y) // 移动到起始点
                pathData.lineTo(link_pos[1].x, link_pos[1].y)
                pathData.arcTo(link_pos[1].x, link_pos[2].y, link_pos[2].x, link_pos[2].y, inflexion_radius) // 绘制圆弧
                pathData.lineTo(link_pos[3].x, link_pos[3].y)
                pathData.arcTo(link_pos[4].x, link_pos[3].y, link_pos[4].x, link_pos[4].y, inflexion_radius) // 绘制圆弧
                pathData.lineTo(link_pos[5].x, link_pos[5].y)

                // 在SVG中添加路径元素
                // d3.select(`#${bookName}-circle2card-link-${(e + 1).toString()}`)
                //     .attr("d", pathData.toString()) // 设置路径的数据
                link_group.append("path")
                            .attr("d", pathData.toString()) // 设置路径的数据
                            .attr('id', `${bookName}-circle2card-link-${(e + 1).toString()}`)
                            .attr("stroke", "#8F7B6C") // 设置线段颜色
                            .attr("stroke-width", 1) // 设置线段宽度
                            .attr("fill", "none") // 设置填充为无填充
                            .style('opacity', 0.5)
                            .style('visibility', () => {
                                if (card_pos.left < myDiv.getBoundingClientRect().left || card_pos.left + 0.6 * rem > myDiv.offsetWidth + myDiv.getBoundingClientRect().left) { // 0.3
                                    return 'hidden'
                                } else {
                                    return 'visible'
                                }
                            })               
                    }            
        })
    }
}

export function delImageDivLayer() { // 当该书籍不存在书影图片时，删除上次选择的书籍书影div
    // delete div (会报错)
    // 获取父元素
    // const parentDiv = document.getElementById('bookImage-scroll-container');
    // // 获取父元素下的所有子元素
    // const childDivs = parentDiv.querySelectorAll('div');
    // // 遍历子元素并隐藏它们
    // childDivs.forEach(child => {
    //     child.style.display = 'none';
    // });
    // hide div
    document.getElementById('bookImage-scroll-container').style.display = 'none'
    // delete link svg
    d3.select('#card2bookImage-svg').selectAll('g').remove() // 并非每本书都有书影图片
}

export function eventCard2bookImageLink(bookName, events, imgPosJson, imgList, rem) {
    d3.select('#card2bookImage-svg').selectAll('g').remove() // 有些冗余
    let link_group = d3.select('#card2bookImage-svg').append('g').attr('class', 'card2bookImage-group')
    let origin_pos = $('#card2bookImage-svg').offset() // svg本身的偏移量
    // console.log('origin_pos', origin_pos) // success
    // console.log('imgList', imgList) // success

    // 定义路径数据
    let pathData = d3.path()
    let eventDiv = document.getElementById('event-scroll-container'), // 信息卡片container
        eventScrollLeft = eventDiv.scrollLeft
    let imageDiv = document.getElementById('bookImage-scroll-container'), // 书影图片container
        imageScrollLeft = imageDiv.scrollLeft

    // 首先判断是否存在书影图片，需不需要循环
    const book_string = events[1].來源.split('<')[1].split('/')[0]
    if (DataProcess.bookImgExistList.includes(book_string)) { // 如果存在书影图片
        for (let e = 0; e < events.length; e++) {
            const cur_event = events[e] // image_name.split('.')[0] + '_new.jpg'
            let bookImgName = '-' // initialize
            if (!['-', ''].includes(cur_event.來源) && cur_event['來源'].split('<').length > 1) {
                // console.log(cur_event['來源'].split('<'))
                bookImgName = cur_event.來源.split('<')[1].split('/')[2].split(".")[0]; // 去掉.jpg的印章名称
            }

            // 判断是否拥有event card至book image的连线
            for (let single_img in imgPosJson[book_string]) {
                if (single_img.slice(0, -5) === bookImgName) { // 该事件的印章拥有对应的书影图片
                    const equal_book_image = imgPosJson[book_string][single_img]['equivalence_book_image'].slice(0, -5)
                    let card_pos = $(`#${bookName}-year-div-${(e + 1).toString()}`).offset(), // events card，横坐标可变
                        bookImg_pos_ori = $(`#bookImage-${equal_book_image}`).offset()

                    // 计算seal image在book image的position
                    let sealImg_pos = computeSealPosOfImage(imgPosJson[book_string][single_img], imgList)
                    // console.log('sealImg_pos', sealImg_pos) // success

                    let card_point_pos = { // 从event card出发的link position
                        top: card_pos.top + $(`#${bookName}-year-div-${(e + 1).toString()}`).height(),
                        left: card_pos.left + $(`#${bookName}-year-div-${(e + 1).toString()}`).width() / 2
                    },
                    bookImg_pos = {
                        top: bookImg_pos_ori.top + sealImg_pos.top,
                        left: bookImg_pos_ori.left + sealImg_pos.left
                    }
                    // console.log('image position', bookImg_pos, `#bookImage-${equal_book_image}`) // success
                    // console.log('card_point_pos', card_point_pos, $(`#${bookName}-year-div-${(e + 1).toString()}`).height())

                    // 计算中间值
                    const ave_y = ((card_point_pos.top + rem * 0.01) + bookImg_pos.top) / 2,
                          ave_num = Math.ceil(events.length / 2)

                    // 设置拐角radius，连线错位offset
                    const inflexion_radius = 0.1 * rem,
                          link_y_offset = 0.2 * rem

                    // 计算各个拐点的坐标
                    let link_pos = [
                        { // 起始点
                            x: card_point_pos.left - origin_pos.left,
                            y: card_point_pos.top + rem * 0.01 - origin_pos.top
                        }, { // arc1 start
                            x: card_point_pos.left - origin_pos.left,
                            y: ave_y + (e - ave_num) * link_y_offset - origin_pos.top
                        }, { // arc1 end
                            x: (card_point_pos.left - bookImg_pos.left) > 0 ? card_point_pos.left - inflexion_radius - origin_pos.left : card_point_pos.left + inflexion_radius - origin_pos.left,
                            y: ave_y + (e - ave_num) * link_y_offset + inflexion_radius - origin_pos.top
                        }, { // arc2 start
                            x: (card_point_pos.left - bookImg_pos.left) > 0 ? bookImg_pos.left + inflexion_radius - origin_pos.left : bookImg_pos.left - inflexion_radius - origin_pos.left,
                            y: ave_y + (e - ave_num) * link_y_offset + inflexion_radius - origin_pos.top
                        }, { // arc2 end
                            x: bookImg_pos.left - origin_pos.left,
                            y: ave_y + (e - ave_num) * link_y_offset + inflexion_radius * 2 - origin_pos.top // 0.05 * 2
                        }, { // end
                            x: bookImg_pos.left - origin_pos.left,
                            y: bookImg_pos.top - origin_pos.top
                        }
                    ]
                    // console.log('link_pos', link_pos)
                    pathData.moveTo(link_pos[0].x, link_pos[0].y) // 移动到起始点
                    pathData.lineTo(link_pos[1].x, link_pos[1].y)
                    pathData.arcTo(link_pos[1].x, link_pos[2].y, link_pos[2].x, link_pos[2].y, inflexion_radius) // 绘制圆弧
                    pathData.lineTo(link_pos[3].x, link_pos[3].y)
                    pathData.arcTo(link_pos[4].x, link_pos[3].y, link_pos[4].x, link_pos[4].y, inflexion_radius) // 绘制圆弧
                    pathData.lineTo(link_pos[5].x, link_pos[5].y)

                    // 在SVG中添加路径元素
                    d3.selectAll(`#${bookName}-card2image-link-${(e + 1).toString()}`).remove()
                    link_group.append("path")
                                .attr("d", pathData.toString()) // 设置路径的数据
                                .attr('id', `${bookName}-card2image-link-${(e + 1).toString()}`)
                                .attr("stroke", "#8F7B6C") // 设置线段颜色
                                .attr("stroke-width", 1) // 设置线段宽度
                                .attr("fill", "none") // 设置填充为无填充
                                .style('opacity', 0.5)
                                .style('visibility', () => { // 待修改
                                    if (card_point_pos.left < eventDiv.getBoundingClientRect().left || card_point_pos.left > eventDiv.offsetWidth + eventDiv.getBoundingClientRect().left || bookImg_pos.left < imageDiv.getBoundingClientRect().left || bookImg_pos.left > imageDiv.offsetWidth + imageDiv.getBoundingClientRect().left) {
                                        return 'hidden'
                                    } else {
                                        return 'visible'
                                    }
                                })

                    // 实时监听event card的横坐标
                    eventDiv.addEventListener('scroll', function() { // 实时监听scroll
                        // console.log('eventDiv is scrolling~') // success
                        d3.selectAll(`#${bookName}-card2image-link-${(e + 1).toString()}`).remove()
                        let pathData = d3.path()
                        // 更新坐标位置
                        card_pos = $(`#${bookName}-year-div-${(e + 1).toString()}`).offset() // events card，横坐标可变                      
                        bookImg_pos_ori = $(`#bookImage-${equal_book_image}`).offset()

                        if (card_point_pos !== undefined && bookImg_pos_ori !== undefined) { // 防止报错
                            // update
                            card_point_pos = { // 从event card出发的link position
                                top: card_pos.top + $(`#${bookName}-year-div-${(e + 1).toString()}`).height(),
                                left: card_pos.left + $(`#${bookName}-year-div-${(e + 1).toString()}`).width() / 2
                            }
                            bookImg_pos = {
                                top: bookImg_pos_ori.top + sealImg_pos.top,
                                left: bookImg_pos_ori.left + sealImg_pos.left
                            }
                            // console.log((e + 1).toString())
                            // 计算中间值
                            const ave_y = ((card_point_pos.top + rem * 0.01) + bookImg_pos.top) / 2,
                            ave_num = Math.ceil(events.length / 2)

                            // 设置拐角radius，连线错位offset
                            const inflexion_radius = 0.1 * rem,
                                  link_y_offset = 0.2 * rem
                            // 计算各个拐点的坐标
                            let link_pos = [
                                { // 起始点
                                    x: card_point_pos.left - origin_pos.left,
                                    y: card_point_pos.top + rem * 0.01 - origin_pos.top
                                }, { // arc1 start
                                    x: card_point_pos.left - origin_pos.left,
                                    y: ave_y + (e - ave_num) * link_y_offset - origin_pos.top
                                }, { // arc1 end
                                    x: (card_point_pos.left - bookImg_pos.left) > 0 ? card_point_pos.left - inflexion_radius - origin_pos.left : card_point_pos.left + inflexion_radius - origin_pos.left,
                                    y: ave_y + (e - ave_num) * link_y_offset + inflexion_radius - origin_pos.top
                                }, { // arc2 start
                                    x: (card_point_pos.left - bookImg_pos.left) > 0 ? bookImg_pos.left + inflexion_radius - origin_pos.left : bookImg_pos.left - inflexion_radius - origin_pos.left,
                                    y: ave_y + (e - ave_num) * link_y_offset + inflexion_radius - origin_pos.top
                                }, { // arc2 end
                                    x: bookImg_pos.left - origin_pos.left,
                                    y: ave_y + (e - ave_num) * link_y_offset + inflexion_radius * 2 - origin_pos.top // 0.05 * 2
                                }, { // end
                                    x: bookImg_pos.left - origin_pos.left,
                                    y: bookImg_pos.top - origin_pos.top
                                }
                            ]
                            pathData.moveTo(link_pos[0].x, link_pos[0].y) // 移动到起始点
                            pathData.lineTo(link_pos[1].x, link_pos[1].y)
                            pathData.arcTo(link_pos[1].x, link_pos[2].y, link_pos[2].x, link_pos[2].y, inflexion_radius) // 绘制圆弧
                            pathData.lineTo(link_pos[3].x, link_pos[3].y)
                            pathData.arcTo(link_pos[4].x, link_pos[3].y, link_pos[4].x, link_pos[4].y, inflexion_radius) // 绘制圆弧
                            pathData.lineTo(link_pos[5].x, link_pos[5].y)

                            link_group.append("path")
                                        .attr("d", pathData.toString()) // 设置路径的数据
                                        .attr('id', `${bookName}-card2image-link-${(e + 1).toString()}`)
                                        .attr("stroke", "#8F7B6C") // 设置线段颜色
                                        .attr("stroke-width", 1) // 设置线段宽度
                                        .attr("fill", "none") // 设置填充为无填充
                                        .style('opacity', 0.5)
                                        .style('visibility', () => { // 待修改
                                            if (card_point_pos.left < eventDiv.getBoundingClientRect().left || card_point_pos.left > eventDiv.offsetWidth + eventDiv.getBoundingClientRect().left || bookImg_pos.left < imageDiv.getBoundingClientRect().left || bookImg_pos.left > imageDiv.offsetWidth + imageDiv.getBoundingClientRect().left) {
                                                return 'hidden'
                                            } else {
                                                return 'visible'
                                            }
                                        })            
                                }            
                    })
                    // 实时监听image card的横坐标
                    imageDiv.addEventListener('scroll', function() { // 实时监听scroll
                        d3.selectAll(`#${bookName}-card2image-link-${(e + 1).toString()}`).remove()
                        let pathData = d3.path()
                        // 更新坐标位置
                        card_pos = $(`#${bookName}-year-div-${(e + 1).toString()}`).offset() // events card，横坐标可变
                        card_point_pos = { // 从event card出发的link position
                            top: card_pos.top + $(`#${bookName}-year-div-${(e + 1).toString()}`).height(),
                            left: card_pos.left + $(`#${bookName}-year-div-${(e + 1).toString()}`).width() / 2
                        }
                        bookImg_pos_ori = $(`#bookImage-${equal_book_image}`).offset()
                        bookImg_pos = {
                            top: bookImg_pos_ori.top + sealImg_pos.top,
                            left: bookImg_pos_ori.left + sealImg_pos.left
                        }

                        if (card_point_pos !== undefined) { // 防止报错
                            // console.log((e + 1).toString())
                            // 计算中间值
                            const ave_y = ((card_point_pos.top + rem * 0.01) + bookImg_pos.top) / 2,
                            ave_num = Math.ceil(events.length / 2)

                            // 设置拐角radius，连线错位offset
                            const inflexion_radius = 0.1 * rem,
                                  link_y_offset = 0.2 * rem
                            // 计算各个拐点的坐标
                            let link_pos = [
                                { // 起始点
                                    x: card_point_pos.left - origin_pos.left,
                                    y: card_point_pos.top + rem * 0.01 - origin_pos.top
                                }, { // arc1 start
                                    x: card_point_pos.left - origin_pos.left,
                                    y: ave_y + (e - ave_num) * link_y_offset - origin_pos.top
                                }, { // arc1 end
                                    x: (card_point_pos.left - bookImg_pos.left) > 0 ? card_point_pos.left - inflexion_radius - origin_pos.left : card_point_pos.left + inflexion_radius - origin_pos.left,
                                    y: ave_y + (e - ave_num) * link_y_offset + inflexion_radius - origin_pos.top
                                }, { // arc2 start
                                    x: (card_point_pos.left - bookImg_pos.left) > 0 ? bookImg_pos.left + inflexion_radius - origin_pos.left : bookImg_pos.left - inflexion_radius - origin_pos.left,
                                    y: ave_y + (e - ave_num) * link_y_offset + inflexion_radius - origin_pos.top
                                }, { // arc2 end
                                    x: bookImg_pos.left - origin_pos.left,
                                    y: ave_y + (e - ave_num) * link_y_offset + inflexion_radius * 2 - origin_pos.top // 0.05 * 2
                                }, { // end
                                    x: bookImg_pos.left - origin_pos.left,
                                    y: bookImg_pos.top - origin_pos.top
                                }
                            ]
                            pathData.moveTo(link_pos[0].x, link_pos[0].y) // 移动到起始点
                            pathData.lineTo(link_pos[1].x, link_pos[1].y)
                            pathData.arcTo(link_pos[1].x, link_pos[2].y, link_pos[2].x, link_pos[2].y, inflexion_radius) // 绘制圆弧
                            pathData.lineTo(link_pos[3].x, link_pos[3].y)
                            pathData.arcTo(link_pos[4].x, link_pos[3].y, link_pos[4].x, link_pos[4].y, inflexion_radius) // 绘制圆弧
                            pathData.lineTo(link_pos[5].x, link_pos[5].y)

                            link_group.append("path")
                                        .attr("d", pathData.toString()) // 设置路径的数据
                                        .attr('id', `${bookName}-card2image-link-${(e + 1).toString()}`)
                                        .attr("stroke", "#8F7B6C") // 设置线段颜色
                                        .attr("stroke-width", 1) // 设置线段宽度
                                        .attr("fill", "none") // 设置填充为无填充
                                        .style('opacity', 0.5)
                                        .style('visibility', () => { // 待修改
                                            if (card_point_pos.left < eventDiv.getBoundingClientRect().left || card_point_pos.left > eventDiv.offsetWidth + eventDiv.getBoundingClientRect().left || bookImg_pos.left < imageDiv.getBoundingClientRect().left || bookImg_pos.left > imageDiv.offsetWidth + imageDiv.getBoundingClientRect().left) {
                                                return 'hidden'
                                            } else {
                                                return 'visible'
                                            }
                                        })            
                                }            
                    })         

                } else { // 该事件的印章没有对应的书影原图

                }
            }          
        }
    } else {

    }
    
}

function computeSealPosOfImage(singleImgJson, imgList) { // 计算seal image 相对于 book image的位置
    // console.log('singImgJson', singleImgJson) // success
    // console.log('imgList', imgList) // success

    const equivalence_book_image = singleImgJson['equivalence_book_image'] // 所等价的book image
    let exact_pos = {
        left: 0,
        top: 0
    }
    for (let i = 0; i < imgList.length; i++) {
        const enum_img_attr = imgList[i]
        // console.log('equivalence_book_image', equivalence_book_image)
        // console.log('enum_img_attr', enum_img_attr['image_name'])
        if (equivalence_book_image === enum_img_attr['image_name']) {
            const ratio_pos = {
                left: singleImgJson.left / enum_img_attr['ori_size']['width'],
                top: singleImgJson.top / enum_img_attr['ori_size']['height']
            }
            exact_pos.left = ratio_pos.left * enum_img_attr['renderWidth']
            exact_pos.top = ratio_pos.top * enum_img_attr['renderHeight']
            break
        }
    }
    return exact_pos
}