import * as d3 from "d3";
const $ = require("jquery");
import * as BookTraj from "@/data/BookTraj";
import { color, type_color } from "@/theme"
// import { toRaw } from '@vue/reactivity'

// 以下3个func用于解决hover book_type, lib_type, agent_type时的filter问题
export function hover_update(input_data, input_constraints, choice) {
    document.body.scrollTop=document.documentElement.scrollTop=0
    document.getElementById('論語注疏-group').scrollTop = 0 // 好像还没起作用
    let output_data_show, output_data_hidden
    // if (input_constraints.hover.entity !== 'book_type') { // lib_type和agent_type对应的是type
    //     output_data_show = filter_book(input_constraints.hover.entity, input_constraints.hover.type, input_data)[0]
    //     output_data_hidden = filter_book(input_constraints.hover.entity, input_constraints.hover.type, input_data)[1]
    // } 
    // console.log('output_data', Object.keys(output_data_show)) // 返回list
    if (choice === 'hover') { // 如果是hover类别
        output_data_show = filter_book(input_constraints, input_constraints.hover.entity, input_constraints.hover.value, input_data)[0]
        output_data_hidden = filter_book(input_constraints, input_constraints.hover.entity, input_constraints.hover.value, input_data)[1]
    } else if (choice === 'filter') { // 如果是刷选时间
        // 也可以刷选book_type, agent_type和lib_type
        output_data_show = filter_book(input_constraints, input_constraints.filter, input_constraints.hover.value, input_data)[0]
        output_data_hidden = filter_book(input_constraints, input_constraints.filter, input_constraints.hover.value, input_data)[1]
    } else if (choice === 'hover2filter') {
        output_data_show = filter_book(input_constraints, input_constraints.filter, input_constraints.hover.value, input_data)[0]
        output_data_hidden = filter_book(input_constraints, input_constraints.filter, input_constraints.hover.value, input_data)[1]
    }
    return [output_data_show, output_data_hidden]
}

export function filter_book(input_constraints, filter_type, hover_condition, input_data) {
    // hover_condition为具体约束条件
    let output_data_show = {}
    let output_data_hidden = {}
    let filter_state = {}
    // console.log(filter_type, hover_condition)
    if (filter_type === 'book_type' || filter_type === 'agent_type' || filter_type === 'library_type') { //如果是选中“经史子集”的类别
        let hover = filter_type
        if (filter_type === 'library_type') {
            hover = 'lib_type'
        }
        // 更新filter_state
        filter_state[hover] = true
        if (filter_type === 'book_type') {
            for (let book in input_data) {
                // console.log('book', input_data[book])
                if (input_data[book][0][hover] === hover_condition) {
                    output_data_show[book] = input_data[book]
                } else {
                    output_data_hidden[book] = input_data[book]
                }
            }
        } else {
            for (let book in input_data) {
                for (let j = 0; j < input_data[book].length; j++) { // 对于每一个event
                    if (input_data[book][j][hover] === hover_condition) {
                        output_data_show[book] = input_data[book]
                        break
                    }
                }
                if (!(book in output_data_show)) { // 若该book没有event在所选时间内
                    output_data_hidden[book] = input_data[book]
                }
            }
        }
    } else if (filter_type.hasOwnProperty('time_range')) { // 如果是刷选时间(通过 time_range 来区分是否包含filter)
        // 添加可以多级刷选(frozen定格)
        // time_range
        if (filter_type.time_range !== null) {
            output_data_show = {}
            const [start_time, end_time] = filter_type.time_range
            for (let book in input_data) { // 遍历每一本书
                for (let j = 0; j < input_data[book].length; j++) { // 遍历该书的每一个event
                    if (input_data[book][j].time_info.timestamp >= start_time && input_data[book][j].time_info.timestamp <= end_time) {
                        output_data_show[book] = input_data[book]
                        break
                    }
                    // console.log(input_data[book][j].time_info.timestamp)
                }
                // 对book中的event遍历完成后
                if (!(book in output_data_show)) { // 若该book没有event在所选时间内
                    output_data_hidden[book] = input_data[book]
                }
            }
        }        
    }
    return [output_data_show, output_data_hidden] // array[0]为要显示的数据, array[1]为被过滤掉的数据
}

// 针对book_type, agent_type, lib_type, year_range的filter
export function filter_movement(input_constraints, input_data_all) { // constraints, this.data
    let excluded_books = { // 用于存储filter后的book_list，最后取交集 (补集)
        book: [],
        agent: [],
        library: [],
        time_range: []
    }
    // console.log('input_constraints', input_constraints)

    // time_range
    if (input_constraints.filter.time_range === null) { // 如果为空，那就全选
        excluded_books.time_range = [] // 返回包含全部book_name的array,excluded就是[]
    } else {
        const [start_time, end_time] = input_constraints.filter.time_range
        for (let book in input_data_all) { // 遍历所有book,选择符合条件的
            let find_time = false
            for (let j = 0; j < input_data_all[book].length; j++) { // 遍历该书的每一个event
                if (input_data_all[book][j].time_info.timestamp >= start_time && input_data_all[book][j].time_info.timestamp <= end_time) {
                    find_time = true
                    break
                }
            }
            if (!(find_time)) {
                excluded_books.time_range.push(book)
            }
        }
    }
    // book_type
    if (input_constraints.filter.book === null) { // 如果为空，那就全选
        excluded_books.book = [] // 返回包含全部book_name的array
    } else {
        const book_type_name = input_constraints.filter.book
        for (let book in input_data_all) { // 遍历所有book,选择符合条件的
            if (input_data_all[book][0].book_type !== book_type_name) {
                excluded_books.book.push(book)
            }
        }
    }
    // lib_type
    if (input_constraints.filter.library === null) { // 如果为空，那就全选
        excluded_books.library = [] // 返回包含全部book_name的array
    } else {
        const lib_type_name = input_constraints.filter.library
        for (let book in input_data_all) { // 遍历所有book,选择符合条件的
            let find_lib = false
            for (let j = 0; j < input_data_all[book].length; j++) { // 遍历该书的每一个event
                if (input_data_all[book][j].lib_type === lib_type_name) {
                    find_lib = true
                    break
                }
            }
            if (!(find_lib)) {
                excluded_books.library.push(book)
            }
        }
    }
    // agent_type
    if (input_constraints.filter.agent === null) { // 如果为空，那就全选
        excluded_books.agent = [] // 返回包含全部book_name的array
    } else {
        const agent_type_name = input_constraints.filter.agent
        for (let book in input_data_all) { // 遍历所有book,选择符合条件的
            let find_agent = false
            for (let j = 0; j < input_data_all[book].length; j++) { // 遍历该书的每一个event
                if (input_data_all[book][j].agent_type === agent_type_name) {
                    find_agent = true
                    break
                }
            }
            if (!(find_agent)) {
                excluded_books.agent.push(book)
            }
        }
    }
    // 此时检查hover是否为null，若包含值，则覆盖之前的filter
    if (input_constraints.hover.value !== null) { // 如果此时hover了值
        let filter_type = input_constraints.hover.entity // 此时hover的类型
        if (filter_type === 'book_type' && input_constraints.hover.value !== input_constraints.filter.book) {
            // if (filter_type === 'book_type') {
            excluded_books.book = [] // 清空excluded_list
            const book_type_name = input_constraints.hover.value
            for (let book in input_data_all) { // 遍历所有book,选择符合条件的
                if (input_data_all[book][0].book_type !== book_type_name) {
                    excluded_books.book.push(book)
                }
            }
        } else if (filter_type === 'agent_type' && input_constraints.hover.value !== input_constraints.filter.agent) {
        // } else if (filter_type === 'agent_type') {
            let find_agent = false
            excluded_books.agent = [] // 清空excluded_list
            const agent_type_name = input_constraints.hover.value
            for (let book in input_data_all) { // 遍历所有book,选择符合条件的
                for (let j = 0; j < input_data_all[book].length; j++) { // 遍历该书的每一个event
                    if (input_data_all[book][j].agent_type === agent_type_name) {
                        find_agent = true
                        break
                    }
                }
                if (!(find_agent)) {
                    excluded_books.agent.push(book)
                }
            }
        } else if (filter_type === 'library_type' && input_constraints.hover.value !== input_constraints.filter.library) {
        // } else if (filter_type === 'library_type' && input_constraints.hover.value !== input_constraints.filter.library) {
            excluded_books.library = [] // 清空excluded_list
            let find_lib = false
            const lib_type_name = input_constraints.hover.value
            for (let book in input_data_all) { // 遍历所有book,选择符合条件的
                for (let j = 0; j < input_data_all[book].length; j++) { // 遍历该书的每一个event
                    if (input_data_all[book][j].lib_type === lib_type_name) {
                        find_lib = true
                        break
                    }
                }
                if (!(find_lib)) {
                    excluded_books.library.push(book)
                }
            }
        }
    }
    // console.log('excluded_books', excluded_books)
    return excluded_books
}

// 对多个array元素取交集
export function merge_book_list(input_excluded_books, input_data_all) { // 输入上面的excluded_books, this.data
    let all_excluded = [...input_excluded_books.book, ...input_excluded_books.agent, ...input_excluded_books.library, ...input_excluded_books.time_range]
    all_excluded = Array.from(new Set(all_excluded)) // 去重
    const all_books = Object.keys(input_data_all)
    const included_books = sub_array(all_books, all_excluded)
    // console.log('merge_included', included_books,  all_excluded)
    return included_books // 返回array
}

// 求两个数组的差集
export function sub_array(arr1, arr2) { // arr1为全部book
    let set2 = new Set(arr2)
    let subset = []
    for (let i = 0; i < arr1.length; i++) {
        if (!set2.has(arr1[i])) {
            subset.push(arr1[i])
        }
    }
    // arr1.forEach(function(val, index) { // forEach会乱序！！！
    //     if (!set2.has(val)) {
    //         subset.push(val)
    //     }
    // });
    return subset
}

// 对于只存在book名称的list,通过匹配添加attr成为curList
export function add_bookList_attr(book_attr_dict, book_name_list) {
    let ordered_book_list = []
    for (let i = 0; i < book_name_list.length; i++) {
        if (book_attr_dict.hasOwnProperty(book_name_list[i])) {
            ordered_book_list.push(book_attr_dict[book_name_list[i]])
        }
    }
    return JSON.parse(JSON.stringify(ordered_book_list))
}

// 将book_list转化为book_dict
export function trans_list2dict(input_list) {
    let book_attr_dict = {}
    for (let key in input_list) {
        book_attr_dict[input_list[key].book_name] = input_list[key]
    }
    return book_attr_dict
}
// 用于判断filter + hover情况下应该按照什么标准进行排序
export function judge_sort_method(input_constraint) { // 输入constraints
    let filter_condition = {
        book: true, // 优先级3(并列)
        agent: true, // 优先级2
        library: true, // 优先级1
        time_range: true // 优先级3(并列)
    }
    let sort_choice = ['default', null]
    const filter_type = ['book', 'agent', 'library', 'time_range']
    // 对当前的filter condition进行判断
    for (let i = 0; i < filter_type.length; i++) {
        if (filter_type[i] === 'time_range') { // 对于time_range，若跨度为960-1965，也算作没选择
            if (input_constraint.filter[filter_type[i]] === null || (input_constraint.filter[filter_type[i]][1] - input_constraint.filter[filter_type[i]][0] >= 1005)) {
                filter_condition.time_range = false
            }
        } else {
            if (input_constraint.filter[filter_type[i]] === null) {
                filter_condition[filter_type[i]] = false
            }
        }     
    }

    // 对于hover状态(hover状态不排序，此段弃用)
    // if(input_constraint.hover.value !== null) { // 当前在hover
    //     const hover_entity = input_constraint.hover.entity
    //     if (hover_entity === 'book_type') {
    //         filter_condition.book = true
    //     } else if (hover_entity === 'library_type') {
    //         filter_condition.library = true
    //     } else if (hover_entity === 'agent_type') {
    //         filter_condition.agent = true
    //     }
    // }

    if (filter_condition.library) {
        sort_choice = ['lib_sort', input_constraint.filter.library]
        // if(input_constraint.hover.value !== null) { // 若此时仍有hover
        //     sort_choice = ['lib_sort', input_constraint.hover.value]
        // }
    } else if (filter_condition.agent) {
        sort_choice = ['agent_sort', input_constraint.filter.agent]
        // if(input_constraint.hover.value !== null) { // 若此时仍有hover
        //     sort_choice = ['agent_sort', input_constraint.hover.value]
        // }
    } else {
        sort_choice = ['default', null]
    }
    // console.log('sort_choice', sort_choice)
    // console.log('filter_condition', filter_condition)
    return sort_choice
}
// 为数组添加{book_name: , opacity: }
export function add_name_opacity(input_array, choice, sorted_constraints) {
    let output_array = []
    for (let i = 0; i < input_array.length; i++) {
        const JSON_string = JSON.parse(JSON.stringify(input_array[i])) // 用于读取proxy对象
        // const to_raw = toRaw(input_array[i])
        // console.log('JSON_string', JSON_string)
        if (choice === 'excluded') {
            output_array.push({ ...JSON_string, ...{opacity: 0.4}})
        } else {
            output_array.push({ ...JSON_string, ...{opacity: 1}})
        }
    }
    // 顺便把顺序给排了
    const sort_choice = judge_sort_method(sorted_constraints)
    output_array = reorder_list(output_array, sort_choice[0], sort_choice[1])

    return output_array
}
export function filter_book2(constraints, restraint_condition, input_data) {
    const filter_type = constraints.filter
    // console.log('restraint_condition', restraint_condition)
    const hover_condition = restraint_condition['hover'].type
    // hover_condition为具体约束条件
    let output_data_show = {}
    let output_data_hidden = {}
    // console.log(filter_type, hover_condition)
    if (filter_type === 'book_type' || filter_type === 'agent_type' || filter_type === 'library_type') { //如果是选中“经史子集”的类别
        let hover = filter_type
        if (filter_type === 'library_type') {
            hover = 'lib_type'
        }
        if (filter_type === 'book_type') {
            for (let book in input_data) {
                // console.log('book', input_data[book])
                if (input_data[book][0][hover] === hover_condition) {
                    output_data_show[book] = input_data[book]
                } else {
                    output_data_hidden[book] = input_data[book]
                }
            }
        } else {
            for (let book in input_data) {
                for (let j = 0; j < input_data[book].length; j++) { // 对于每一个event
                    if (input_data[book][j][hover] === hover_condition) {
                        output_data_show[book] = input_data[book]
                        break
                    }
                }
                if (!(book in output_data_show)) { // 若该book没有event在所选时间内
                    output_data_hidden[book] = input_data[book]
                }
            }
        }
    } else if (filter_type.hasOwnProperty('time_range')) { // 如果是刷选时间
        // 添加可以多级刷选
        if (filter_type.time_range !== null) {
            const [start_time, end_time] = filter_type.time_range
            for (let book in input_data) { // 遍历每一本书
                for (let j = 0; j < input_data[book].length; j++) { // 遍历该书的每一个event
                    if (input_data[book][j].time_info.timestamp >= start_time && input_data[book][j].time_info.timestamp <= end_time) {
                        output_data_show[book] = input_data[book]
                        break
                    }
                    // console.log(input_data[book][j].time_info.timestamp)
                }
                // 对book中的event遍历完成后
                if (!(book in output_data_show)) { // 若该book没有event在所选时间内
                    output_data_hidden[book] = input_data[book]
                }
            }
            // for (let book in )
        }
        
    }
    return [output_data_show, output_data_hidden] // array[0]为要显示的数据, array[1]为被过滤掉的数据
}

export function reCalHoverPos(input_book_list, included_books, excluded_books) { // excluded_books可以不要
    // input_book_list为待处理的book_list, included_books为当前将要显示的book_name_list
    // output 格式: 新增
    let y_index = 0
    let output_book_dict = {} // 输出: {'book_name': {'transY': }}
    let output_book_list = [] // 输出经过time_range filter后的book_list
    const line_height = 40
    for (let book_item in input_book_list) {
        const cur_book_name = input_book_list[book_item].book_name
        if (cur_book_name in included_books) {
            y_index += 1
            // input_book_list[book_item].ifShow = true
            // input_book_list[book_item].transY = (y_index + 1) * line_height
            output_book_dict[cur_book_name] = {
                opacity_num: 1,
                transY: y_index * line_height
            }
            output_book_list.push(input_book_list[book_item])
        }
    }
    // 再次遍历， excludedBookList
    for (let book_item in input_book_list) {
        const cur_book_name = input_book_list[book_item].book_name
        if (!(cur_book_name in included_books)) {
            y_index += 1
            output_book_dict[cur_book_name] = {
                opacity_num: 0.4,
                transY: y_index * line_height
            }
        }
    }
    return [output_book_dict, output_book_list]
}

export function hover_single_book_old(input_constraints) {
    // console.log(d3.select('#timeLineSVG'))

    // 获取单本书的book_name以及TransY
    const hover_book_name = input_constraints.hover.value // 此时entity对应于edition
    const translate_match = 'translate(0,'
    // console.log('hover_book_name', hover_book_name)
    let translate_attr // 此处不存在 translate_attr === null 的情况
    translate_attr = d3.select(`#${hover_book_name}-group`).node().getAttribute('transform').match(/translate\(\d+,\s*(-?\d+)\)/)[1]
    // translate_attr = Number((translate_attr.replace(translate_match, '')).replace(')', '')) // 当前book_group的y平移值
    translate_attr = Number(translate_attr)
    const curSvg = d3.select('#timeLineSVG')
    function zoomed(event) {
        curSvg.attr('transform', event.transform)
    }
    // 定义缩放行为
    const zoom = d3.zoom()
                 .scaleExtent([1, 1]) // 设置缩放倍数恒为 1
                 .on('zoom', zoomed)
    // 使用d3.zoomTo()方法进行缩放和平移
    curSvg
      .call(zoom)
    //   .extent([[margin.left, 0], [width - margin.right, height]])
    //   .translateExtent([[margin.left, -Infinity], [width - margin.right, Infinity]])
      .transition()
      .duration(750)
      .call(zoom.transform, d3.zoomIdentity.translate(0, -translate_attr).scale(1))
    // .call(zoom.transform, d3.zoomIdentity.translate(`0, -${(translate_attr - pre_move)}`))
    
    curSvg.call(zoom)

    // pre_move = translate_attr - pre_move // 更新pre_mover

    return translate_attr
}

export function hover_single_book(input_constraints, book_state_all, ifScroll) { // ifScroll: Boolean
    // console.log(d3.select('#timeLineSVG'))

    // 获取单本书的book_name以及TransY
    const hover_book_name = input_constraints.hover.value // 此时entity对应于edition
    // 更新每本书的state
    // book_state_all[hover_book_name].hover = hover_book_name // 该本书的hover更新为book_name
    // '文選'没有录入，算作书，不是edition，为了防止报错先去掉
    // if (ifScroll === false && hover_book_name !== null && hover_book_name !== '文選') { // 在左边侧边hover时scroll，在timeline视图中hover时not scroll
    //     // scrollTo当前element所在的位置
    //     const container_pre_pos = document.getElementById('container').scrollTop
    //     document.getElementById(`${hover_book_name}-group`)
    //             .scrollIntoView({behavior: "smooth"})
    // } 
    return book_state_all
}

export function hover_book_detail(input_constraints, input_book_dict, input_book_list, showSize) { // hover单本书时的详细展开, input_book_list传入this.data, svg_show_size
    const detail_book_name = input_constraints.hover.value // 此时entity对应于edition
    const detailInfo = d3.select(`#${detail_book_name}-group`)
                            .append('g')
                            .attr('class', 'detailInfo')
    const cards = detailInfo.selectAll('g')
                            .data(input_book_dict[detail_book_name])
                            .enter()
                            .append('g')
                            .attr('id', (d, i) => `#${detail_book_name}-card-${i.toString()}`)
    // card遍历渲染
    cards.append('text')
            .attr('class', (d, i) => `${d.書名}-cardText-${(i + 1).toString()}`)
            .attr('x', function(d, i, array) {
                const step = (showSize[0] * (1 - 0.02)) / array.length
                return showSize[0] * 0.02 + i * step})
            .attr("y", d => (BookTraj.getTimeLineCircleBBox(d) + 10))
            .call(text => text
                .selectAll('tspan')
                .data(function(d) {
                    const textContent = `时间: ${d.時間}\n Time: ${d.Time}\n 次序: ${d.次序}\n 地点: ${d.Location}\n 经手人: ${d.agent}\n 经手方式: ${d.經手方式}`
                    // const textContent = `ID: ${d.ID}\n书名: ${d.書名}\n 时间: ${d.時間}-${d.Time}\n 次序: ${d.次序}\n 地点: ${d.Location}\n 经手人: ${d.agent}\n 经手方式: ${d.經手方式}`
                    return textContent.split(/\n/)
                })
                .join('tspan')
                .attr('x', function(d, i, array) {
                    return  this.parentNode.getAttribute('x')
                    // return i === 0 ? this.parentNode.getAttribute('x') : this.getAttribute('x')
                })
                .attr('y', (_, i) => `${(i + 5) * 1.1}em`)
                .attr('font-weight', (_, i) => i ? null : 'bold')
                .attr('font-family', 'FZQINGKBYSJF')
                .attr('fill', '#553624')
                .attr('font-size', '10px')
                .text(d => d))
    cards.append('rect')
            //  .attr('class', `${d.書名}`)
            //  .attr('x', (d, i, array) => i * self.svgShowSize[0] / array.length)
            .attr('x', (d, i) => (BookTraj.getTextCardBBox(d, i)[0] - 5))
            .attr('y', (d, i) => (BookTraj.getTextCardBBox(d, i)[2] - 5))
            .attr("rx", 10) // 圆角半径
            .attr("ry", 10)
            .attr('width', (d, i) => (BookTraj.getTextCardBBox(d, i)[1] + 10))
            .attr('height', (d, i) => (BookTraj.getTextCardBBox(d, i)[3] + 10))
            .attr('fill', 'none')
            .attr('stroke', 'brown')
    // 重新计算各行的排列位置
    // const { height: oriHeight } = d3.select(`#${detail_book_name}-group`).node().getBBox()
    // const newPosDict = BookTraj.reCalRowPos(detail_book_name, input_book_list, oriHeight, true)
    const newPosDict = BookTraj.hover_book_reCal_pos(detail_book_name, input_book_dict)
    for (let i = 0; i < input_book_list.length; i++) {
        const select_book = input_book_list[i].book_name
        d3.select(`#${select_book}-group`)
            .transition()
            .duration(600)
            .attr('transform', `translate(0, ${newPosDict[select_book].yPos})`)
    }
    return detail_book_name
}

// 用于绘制detail cards信息框
export function showBookDetailCards(detail_book_name, input_book_dict, showSize) {
    // 计算没有添加'detailInfo'之前的height
    const detailInfo = d3.select(`#${detail_book_name}-group`)
                            .append('g')
                            .attr('class', 'detailInfo')
    const cards = detailInfo.selectAll('g')
                            .data(input_book_dict[detail_book_name])
                            .enter()
                            .append('g')
                            .attr('id', (d, i) => `#${detail_book_name}-card-${i.toString()}`)
                            .style('visibility', 'hidden')
    // card遍历渲染
    cards.append('text')
            .attr('class', (d, i) => `${d.書名}-cardText-${(i + 1).toString()}`)
            .attr('x', function(d, i, array) {
                const step = (showSize[0] * (1 - 0.02)) / array.length
                return showSize[0] * 0.02 + i * step})
            .attr("y", d => (BookTraj.getTimeLineCircleBBox(d) + 10))
            .call(text => text
                .selectAll('tspan')
                .data(function(d) {
                    const textContent = `时间: ${d.時間}\n Time: ${d.Time}\n 次序: ${d.次序}\n 地点: ${d.Location}\n 经手人: ${d.agent}\n 经手方式: ${d.經手方式}`
                    // const textContent = `ID: ${d.ID}\n书名: ${d.書名}\n 时间: ${d.時間}-${d.Time}\n 次序: ${d.次序}\n 地点: ${d.Location}\n 经手人: ${d.agent}\n 经手方式: ${d.經手方式}`
                    return textContent.split(/\n/)
                })
                .join('tspan')
                .attr('x', function(d, i, array) {
                    return  this.parentNode.getAttribute('x')
                    // return i === 0 ? this.parentNode.getAttribute('x') : this.getAttribute('x')
                })
                .attr('y', (_, i) => `${(i + 5) * 1.1}em`)
                .attr('font-weight', (_, i) => i ? null : 'bold')
                .attr('font-family', 'FZQINGKBYSJF')
                .attr('fill', '#553624')
                .attr('font-size', '10px')
                .text(d => d))
    cards.append('rect')
            //  .attr('class', `${d.書名}`)
            //  .attr('x', (d, i, array) => i * self.svgShowSize[0] / array.length)
            .attr('x', (d, i) => (BookTraj.getTextCardBBox(d, i)[0] - 5))
            .attr('y', (d, i) => (BookTraj.getTextCardBBox(d, i)[2] - 5))
            .attr("rx", 10) // 圆角半径
            .attr("ry", 10)
            .attr('width', (d, i) => (BookTraj.getTextCardBBox(d, i)[1] + 10))
            .attr('height', (d, i) => (BookTraj.getTextCardBBox(d, i)[3] + 10))
            .attr('fill', 'none')
            .attr('stroke', 'brown')
    
}

// 重新排序
// 总sort函数接口
export function reorder_list(input_list, order_choice, match_type_name) { // match_type_name: if为time_range, 则传一个[year1, year2]
    if (order_choice === 'default') {
        input_list = default_sort(input_list)
    } else if (order_choice === 'lib_sort') {
        input_list = lib_type_sort(input_list, match_type_name)
    } else if (order_choice === 'agent_sort') {
        input_list = agent_type_sort(input_list, match_type_name)
    } else if (order_choice === 'time_range_sort') { // 在filter的time_range内，按照该time_range内最早的event time从早到晚进行排序
        input_list = time_range_sort(input_list, match_type_name)
    }
    return input_list
}

// 默认按照到日本的时间进行排序(init)
// default, book_type, time_range
export function default_sort(unordered_array) {
    let jp_order_list = []
    for (let i = 0; i < unordered_array.length; i++) { // 对于每一本书
        const single_book_events = unordered_array[i].events // array
        let find_jp = false
        let new_dict = unordered_array[i]
        for (let j = 0; j < single_book_events.length; j++) {    
            if (single_book_events[j].state_flag === 'Japan') {
                jp_order_list.push({ ...new_dict, ...{jp_year: single_book_events[j].time_info.timestamp}})
                find_jp = true
                break
            }
        }
        if (find_jp === false) {
            jp_order_list.push({ ...new_dict, ...{jp_year: 1965}}) // 如果没找到就算作最后一年
        }
    }
    jp_order_list.sort((a,b)=>{
        return a.jp_year - b.jp_year
    })
    for (let k = 0; k < jp_order_list.length; k++) {
        delete jp_order_list[k].jp_year
    }
    // console.log('jp_order_list', jp_order_list)
    return jp_order_list
}

// click book_type, 按照该类书的最早刊刻时间从早到晚进行排序(included_list排一次，excluded_list排一次)
export function book_type_sort(unordered_array) {
    let block_print_list = []
    for (let i = 0; i < unordered_array.length; i++) { // 对于每一本书
        const single_book_events = unordered_array[i].events // array
        let find_block_print = false
        let new_dict = unordered_array[i]
        for (let j = 0; j < single_book_events.length; j++) {    
            if (single_book_events[j].state_flag === 'block_print') {
                block_print_list.push({ ...new_dict, ...{block_print_year: single_book_events[j].time_info.timestamp}})
                find_block_print = true
                break
            }
        }
        if (find_block_print === false) {
            block_print_list.push({ ...new_dict, ...{block_print_year: 1965}}) // 如果没找到就算作最后一年
        }
    }
    block_print_list.sort((a,b)=>{
        return a.block_print_year - b.block_print_year
    })
    for (let k = 0; k < block_print_list.length; k++) {
        delete block_print_list[k].block_print_year
    }
    // console.log('block_print_list', block_print_list)
    return block_print_list
}

// 收藏人排序
export function agent_type_sort(unordered_array, constraint_agent_type) {
    // console.log('constraint_agent_type', constraint_agent_type)
    let agent_order_list = []
    for (let i = 0; i < unordered_array.length; i++) { // 对于每一本书
        const single_book_events = unordered_array[i].events // array
        let find_agent_type = false
        let new_dict = unordered_array[i]
        for (let j = 0; j < single_book_events.length; j++) {    
            if (single_book_events[j].agent_type === constraint_agent_type) { // 找到对应的agent_type
                agent_order_list.push({ ...new_dict, ...{first_agent_year: single_book_events[j].time_info.timestamp}})
                find_agent_type = true
                break
            }
        }
        if (find_agent_type === false) {
            agent_order_list.push({ ...new_dict, ...{first_agent_year: 1965}}) // 如果没找到就算作最后一年
        }
    }
    agent_order_list.sort((a,b)=>{
        return a.first_agent_year - b.first_agent_year
    })
    for (let k = 0; k < agent_order_list.length; k++) { // 把后来添加的key删除掉
        // console.log('agent_order_list[k].first_agent_year', agent_order_list[k].first_agent_year)
        delete agent_order_list[k].first_agent_year
    }
    // console.log('agent_order_list', agent_order_list)
    return agent_order_list
}

// 收藏机构排序
export function lib_type_sort(unordered_array, constraint_lib_type) {
    let lib_order_list = []
    for (let i = 0; i < unordered_array.length; i++) { // 对于每一本书
        const single_book_events = unordered_array[i].events // array
        let find_lib_type = false
        let new_dict = unordered_array[i]
        for (let j = 0; j < single_book_events.length; j++) {    
            if (single_book_events[j].lib_type === constraint_lib_type) { // 找到对应的agent_type
                lib_order_list.push({ ...new_dict, ...{first_lib_year: single_book_events[j].time_info.timestamp}})
                find_lib_type = true
                break
            }
        }
        if (find_lib_type === false) {
            lib_order_list.push({ ...new_dict, ...{first_lib_year: 1965}}) // 如果没找到就算作最后一年
        }
    }
    lib_order_list.sort((a,b)=>{
        return a.first_lib_year - b.first_lib_year
    })
    for (let k = 0; k < lib_order_list.length; k++) { // 把后来添加的key删除掉
        // console.log('lib_order_list[k].first_lib_year', lib_order_list[k].first_lib_year)
        delete lib_order_list[k].first_lib_year
    }
    // console.log('lib_order_list', lib_order_list)
    return lib_order_list
}

// 该排序仅针对time_range内book的进行排序，time_range外的book不进行排序
export function time_range_sort(unordered_array, input_time_range) {
    let time_range_list = []
    for (let i = 0; i < unordered_array.length; i++) { // 对于每一本书
        const single_book_events = unordered_array[i].events // array
        let find_first_event_time = false
        let new_dict = unordered_array[i]
        for (let j = 0; j < single_book_events.length; j++) { // 遍历每一个event
            if (single_book_events[j].time_info.timestamp >= input_time_range[0] && single_book_events[j].time_info.timestamp <= input_time_range[1]) {
                time_range_list.push({ ...new_dict, ...{filter_earliest_year: single_book_events[j].time_info.timestamp}})
                find_first_event_time = true
                break
            }
        }
        if (find_first_event_time === false) {
            time_range_list.push({ ...new_dict, ...{filter_earliest_year: 1965}}) // 如果没找到就算作最后一年
        }
    }
    time_range_list.sort((a,b)=>{ // 排序
        return a.filter_earliest_year - b.filter_earliest_year
    })
    for (let k = 0; k < time_range_list.length; k++) {
        delete time_range_list[k].filter_earliest_year
    }
    return time_range_list
}

// click timeline主视图中的lib和agent标签时进行的排序
export function clickSingleLibAgentSort(unsorted_list, tag, match_string) { // tag = 'agent_type' or 'lib_type'
    let new_ordered_list = []
    let path_candidate_list = [] // path候选者
    let fit_situation = 0
    let match_type
    if (tag === 'lib_text') {
        match_type = 'lib_id'
    } else { // agent
        match_type = 'agent'
    }
    for (let i = 0; i < unsorted_list.length; i++) {
        const single_book_events = unsorted_list[i].events // array, 对于每本书的每一个event
        let find_lib_agent = false // 是否找到该指定agent/lib
        let new_dict = unsorted_list[i]

        for (let j = 0; j < single_book_events.length; j++) {
            if (single_book_events[j][match_type].replace(/\s*/g,"") === match_string.replace(/\s*/g,"")) { // 要去除字符串的空格
                new_ordered_list.push({ ...new_dict, ...{first_find_year: single_book_events[j].time_info.timestamp}})
                path_candidate_list.push(new_dict)
                find_lib_agent = true
                break
            }
        }
        if (find_lib_agent === false) {
            // opacity统一设置为1(if 正在filter_type，可能会冲突)
            new_ordered_list.push({ ...new_dict, ...{first_find_year: 1965}}) // 如果没找到就算作最后一年
        } else {
            fit_situation += 1
        }
    }
    new_ordered_list.sort((a,b)=>{ // 排序
        return a.first_find_year - b.first_find_year
    })
    for (let k = 0; k < new_ordered_list.length; k++) { // 把后来添加的key删除掉
        delete new_ordered_list[k].first_find_year
    }
    // console.log(new_ordered_list, fit_situation)
    return {
        new_list: new_ordered_list,
        path_candidate: path_candidate_list,
        fit_num: fit_situation
    }
    // return [new_ordered_list, fit_situation] // 同时要返回当前符合该类型的book数目
}

// scrollTo的插值函数
export function scrollTween(start, end) {
    return function() {
      let i = d3.interpolateNumber(start, end)
      return function(t) { document.getElementById('container').scrollTo(0, i(t)) }
    }
}

// 对于不在time_range内的circle以及text, 设置opacity
export function time_excluded_circle_text(input_time_range, book_list_all, china2japan_choice) { // input_time_range为设定的时间段, book_list_all为当前处于time_range范围内的bookList
    // 此处book_list_all仅针对 time_range下的included_book_list
    for (let i = 0; i < book_list_all.length; i++) {
        const cur_book_name = book_list_all[i].book_name
        const cur_book_events = book_list_all[i].events
        for (let j = 0; j < cur_book_events.length; j++) {
            if (!(cur_book_events[j].time_info.timestamp >= input_time_range[0] && cur_book_events[j].time_info.timestamp <= input_time_range[1])) { // 该event不符合time_range范围
                d3.select(`#${cur_book_name}-event-${(j + 1).toString()}`) // 该event
                  .style('opacity', 0.4)
            }
        }
    }
    china2japan_movement(china2japan_choice, book_list_all)
}

// 没有time_range后，恢复所有event group的opacity
export function recover_time_range_event_opacity(book_list_all) {
    for (let i = 0; i < book_list_all.length; i++) {
        const cur_book_name = book_list_all[i].book_name
        const cur_book_events = book_list_all[i].events
        for (let j = 0; j < cur_book_events.length; j++) {
            d3.select(`#${cur_book_name}-event-${(j + 1).toString()}`) // 该event
                  .style('opacity', 1)
        }
    }
}

// 在其他视图中选择一个library后，timeline的响应动作
export function select_library_movement(input_lib_id, input_parameter) {
    const classTag = 'lib_text' // 获取当前click的类别（agent_text/lib_text）
    // console.log('input_parameter', JSON.parse(JSON.stringify(input_parameter)))
    // input_parameter包括curBookList，eachBookPos，rowHeight，lastClick
    let curBookList = JSON.parse(JSON.stringify(input_parameter)).curBookList,
        eachBookPos = JSON.parse(JSON.stringify(input_parameter)).eachBookPos
    const rowHeight = JSON.parse(JSON.stringify(input_parameter)).rowHeight,
          lastClick = JSON.parse(JSON.stringify(input_parameter)).lastClick,
          lastClickArray = JSON.parse(JSON.stringify(input_parameter)).lastClickArray

    let fitBookNumber = 0 // 用于统计符合的书本数目，归零
    curBookList = clickSingleLibAgentSort(curBookList, classTag, input_lib_id).new_list
    fitBookNumber = clickSingleLibAgentSort(curBookList, classTag, input_lib_id).fit_num
    eachBookPos = BookTraj.reCalRowPos(curBookList, eachBookPos, rowHeight, lastClick, lastClickArray) // 首先获取更新前的所有book的position
    let cur_max_length = 0 // 用于记录当前最大的长度

    for (let i = 0; i < curBookList.length; i ++) {
        const select_book = curBookList[i].book_name
        // 用于恢复之前的opacity
        d3.select(`#${select_book}-group`).style('opacity', 1)
    }
    console.log('fitbookNum', fitBookNumber)

    for (let i = 0; i < curBookList.length; i ++) {
        const select_book = curBookList[i].book_name
        // 更新cur_max_length
        cur_max_length = Math.max(cur_max_length, eachBookPos[select_book].y + eachBookPos[select_book].height)

        d3.select(`#${select_book}-group`)
            // .style('opacity', i < fitBookNumber? '1' : '0.4' ) // 对于不符合条件的设置opacity
            // .style('opacity', i < fitBookNumber && curBookList[i].opacity === 1?  '1' : '0.4') // 对于不符合条件的设置opacity
            .style('opacity',  () => { // 对于不符合条件的设置opacity
                console.log(`#${select_book}-group`, select_book)
                if (i < fitBookNumber && curBookList[i].opacity === 1) {
                    console.log('1')
                    return 1
                } else if (i < fitBookNumber && curBookList[i].opacity !== 1) {
                    console.log('0.6')
                    return 0.6
                } else { 
                    console.log('0.4')
                    return 0.4 }
            }) // 对于不符合条件的设置opacity
            // .transition()
            // .duration(time_duration)
            .attr('transform', `translate(0, ${eachBookPos[select_book].y.toString()})`)
        
        // 对于符合条件的agent/library(针对event)→highlight
        const cur_book_events = curBookList[i].events
        let highlight_book_name = false
        for (let j = 0; j < cur_book_events.length; j++) {
            if (cur_book_events[j].lib_id === input_lib_id) { // 如果当前circle匹配
                // console.log('match', cur_book_events[j].library, matchName)
                d3.select(`#${select_book}-event-circle-item-${(j + 1).toString()}`)
                    .attr("filter", 'drop-shadow(3px 2px 2px rgb(0 0 0 / 0.6))')
                    .attr("fill", type_color.library.bright[cur_book_events[j].lib_type])
                d3.select(`#${select_book}-event-lineLeft-${(j + 1).toString()}`)
                    .attr("filter", 'drop-shadow(3px 2px 2px rgb(0 0 0 / 0.6))')
                    .attr("stroke", type_color.library.bright[cur_book_events[j].lib_type])
                d3.select(`#${select_book}-event-lineRight-${(j + 1).toString()}`)
                    .attr("filter", 'drop-shadow(3px 2px 2px rgb(0 0 0 / 0.6))')
                    .attr("stroke", type_color.library.bright[cur_book_events[j].lib_type])
                d3.select(`.${select_book}-tag-${(j + 1).toString()}`)
                    .attr("filter", 'drop-shadow(2px 2px 1px rgb(0 0 0 / 0.2))')
                highlight_book_name = true
            } else {
                // console.log('unmatch', cur_book_events[j].library, matchName)
                d3.select(`#${select_book}-event-circle-item-${(j + 1).toString()}`)
                    .attr("filter", 'none')
                    .attr("fill", type_color.library[cur_book_events[j].lib_type])
                d3.select(`#${select_book}-event-lineLeft-${(j + 1).toString()}`)
                    .attr("filter", 'none')
                    .attr("stroke", type_color.library[cur_book_events[j].lib_type])
                d3.select(`#${select_book}-event-lineRight-${(j + 1).toString()}`)
                    .attr("filter", 'none')
                    .attr("stroke", type_color.library[cur_book_events[j].lib_type])
                d3.select(`.${select_book}-tag-${(j + 1).toString()}`)
                    .attr("filter", 'none')
            }
        }
        if (highlight_book_name) {
            d3.select(`#${select_book}-book_name`)
              .attr("filter", 'drop-shadow(2px 2px 1px rgb(0 0 0 / 0.2))')
        } else {
            d3.select(`#${select_book}-book_name`)
              .attr("filter", 'none')
        }
    }

    document.getElementById('container').scrollTo(0, 0) // 返回顶部,在timeline的selection也要体现

    return {
        cur_book_list: curBookList,
        each_book_pos: eachBookPos,
        cur_max_len: cur_max_length
    }
}

// 在其他视图中选择一条path后，timeline的响应动作
export function select_path_movement(input_path_array, cur_book_list, each_book_pos, input_row_height, input_last_click, input_last_click_array, cur_view) { // cur_view用于记录现在所处的视图
    let included_list = []
    let excluded_list = []
    for (let i = 0; i < cur_book_list.length; i++) {
        const cur_book_events = cur_book_list[i].events
        let path_list = input_path_array // 对于每本书都初始化path_list
        for (let j = 0; j < cur_book_events.length; j++) {
            if (path_list.includes(cur_book_events[j].lib_id)) { // 如果该event的lib_id符合path中的其中一个library
                path_list = path_list.filter(item => item !== cur_book_events[j].lib_id) // 则从path中删除一个library元素
            }
        }
        if (path_list.length === 0) { // find_path
            // included_list.push({...cur_book_list[i], ...{opacity: 1}}) // 目前规定只有在filter的时候才能改变bookList的opacity值
            included_list.push(cur_book_list[i])
        } else {
            // excluded_list.push({...cur_book_list[i], ...{opacity: 0.4}})
            excluded_list.push(cur_book_list[i])
        }
    }

    // 对于included_list中的book进行排序
    for (let k = 0; k < included_list.length; k++) {
        const included_events = included_list[k].events
        for (let e = 0; e < included_events.length; e++) {
            if (input_path_array.includes(included_events[e].lib_id)) { // 遍历，寻找first path
                included_list[k].first_path_year = included_events[e].time_info.timestamp
                break
            }
        }
    }
    included_list.sort((a,b)=>{ // sort
        return a.first_path_year - b.first_path_year
    })
    for (let k = 0; k < included_list.length; k++) { // 删除用来排序的key
        delete included_list[k].first_path_year
    }


    const curSeqArray = included_list.concat(excluded_list)
    const included_num = included_list.length
    const output_each_book_pos = BookTraj.reCalRowPos(curSeqArray, each_book_pos, input_row_height, input_last_click, input_last_click_array) // 首先获取更新前的所有book的position
    
    let cur_max_length = 0 // 用于记录当前最大的长度
    for (let i = 0; i < curSeqArray.length; i++) {
        const select_book = curSeqArray[i].book_name
        if (cur_view === 'timeline') { //如果当前视图在timeline，则存在transition
            d3.select(`#${select_book}-group`)
                .transition()
                .duration(4000)
                .attr('transform', `translate(0, ${output_each_book_pos[select_book].y.toString()})`)
                .style('opacity', () => {
                    if (i < included_num && curSeqArray[i].opacity === 1) {
                        return 1
                    } else if (i < included_num && curSeqArray[i].opacity !== 1) {
                        return 0.6
                    } else { return 0.4 }
                })
        } else {
            d3.select(`#${select_book}-group`)
                .attr('transform', `translate(0, ${output_each_book_pos[select_book].y.toString()})`)
                // .style('opacity', curSeqArray[i].opacity) // 待改动(只有filter的情况下可以用opacity直接定义)
                .style('opacity', () => {
                    if (i < included_num && curSeqArray[i].opacity === 1) {
                        return 1
                    } else if (i < included_num && curSeqArray[i].opacity !== 1) {
                        return 0.6
                    } else { return 0.4 }
                })
        }
        // 更新cur_max_length
        cur_max_length = Math.max(cur_max_length, output_each_book_pos[select_book].y + output_each_book_pos[select_book].height)
    }

    // 对于included_list中的book，highlight其符合条件的library
    for (let k = 0; k < included_list.length; k++) {
        const select_book = included_list[k].book_name
        d3.select(`.${select_book}-book_name`)
            .attr("filter", 'drop-shadow(2px 2px 1px rgb(0 0 0 / 0.2))')

        const included_events = included_list[k].events
        for (let m = 0; m < included_events.length; m++) {
            if (input_path_array.includes(included_events[m].lib_id)) {
                d3.select(`#${select_book}-event-circle-item-${(m + 1).toString()}`)
                    .attr("filter", 'drop-shadow(3px 2px 2px rgb(0 0 0 / 0.6))')
                    .attr("fill", type_color.library.bright[included_events[m].lib_type])
                d3.select(`#${select_book}-event-lineLeft-${(m + 1).toString()}`)
                    .attr("filter", 'drop-shadow(3px 2px 2px rgb(0 0 0 / 0.6))')
                    .attr("stroke", type_color.library.bright[included_events[m].lib_type])
                d3.select(`#${select_book}-event-lineRight-${(m + 1).toString()}`)
                    .attr("filter", 'drop-shadow(3px 2px 2px rgb(0 0 0 / 0.6))')
                    .attr("stroke", type_color.library.bright[included_events[m].lib_type])
                // d3.select(`#${select_book}-event-uncertain-circle${(j + 1).toString()}`)
                //     .selectAll('circle')
                //     .attr("filter", 'drop-shadow(3px 2px 2px rgb(0 0 0 / 0.6))')
                //     .attr("fill", type_color.library.bright[cur_book_events[j].lib_type])
                d3.select(`.${select_book}-tag-${(m + 1).toString()}`)
                    .attr("filter", 'drop-shadow(2px 2px 1px rgb(0 0 0 / 0.2))')
            }
        }
    }
    return {
        all_book_list: curSeqArray,
        path_included_list: included_list, // 用于记录当前符合path的bookList
        each_book_pos: output_each_book_pos,
        cur_max_len: cur_max_length
    }
}

// 用于从候选path_candidate中判断是否存在path
export function find_path(input_candidate, path_name_list, new_lib_id) {
    let find_path = false

    let single_lic_id = null // 用于防止多次点击同一个lib_id时转化成path
    if (path_name_list.length === 1) {
        single_lic_id = path_name_list[0]
    }
    if (single_lic_id === new_lib_id) {// 用于防止多次点击同一个lib_id时转化成path
        return find_path
    }

    for (let i = 0; i < input_candidate.length; i++) {
        const candidate_events = input_candidate[i].events
        for (let j = 0; j < candidate_events.length; j++) {
            if (candidate_events[j].lib_id === new_lib_id) { // 如果包含新有的lib_id
                find_path = true
                break
            }
        }
    }
    return find_path
}

// 用于调整hover circle时该row tag的显示
export function adjust_row_tag_show(tag_index, input_book_name, input_cur_book_events, row_tag_list) { // j(int), book_name, cur_book_events, self.tagPosDict[select_book]
    const { x: cardX1, width: cardWidth} = d3.select(`.${input_book_name}-tag-${(tag_index + 1).toString()}`).node().getBBox() // hover的tag, pos
    // console.log(cardX1, cardX2)
    let output_rowTagList = JSON.parse(JSON.stringify(row_tag_list))
    for (let j = 0; j < input_cur_book_events.length; j++) {
        const { x: curX1, width: curWidth} = d3.select(`.${input_book_name}-tag-${(j + 1).toString()}`).node().getBBox() // hover的tag, pos
        if (row_tag_list[j] && j !== tag_index) { // 如果其visibility为visible(即true)
            // 检测其bBox是否冲突
            const cardX2 = cardX1 + cardWidth
            const curX2 = curX1 + curWidth
            // console.log(curX1, cardX2, curX2, cardX2)
            if ((curX1 < cardX2 && curX2 > cardX2) || (curX1 < cardX1 && curX2 > cardX1) || (curX1 > cardX1 && curX2 < cardX2) || (curX1 < cardX1 && curX2 > cardX2)) { // 如果冲突
                output_rowTagList[j] = false
            }      
        } else if (j === tag_index) {
            output_rowTagList[j] = true
        }
    }
    return output_rowTagList
}

// china2japan filter movement
export function china2japan_movement(trueFalse, book_list_all) {
    // console.log(trueFalse, book_list_all)
    if (trueFalse === true) { // if china2japan
        for (let i = 0; i < book_list_all.length; i++) { // for every book
            const cur_book_name = book_list_all[i].book_name
            const cur_book_events = book_list_all[i].events
            let meet_lastChina = false
            for (let j = 0; j < cur_book_events.length; j++) { // for every event
                // 舍弃
                // d3.select(`#${cur_book_name}-event-${(j + 1).toString()}`) // init
                //         .style('opacity', 0.4)
                if (cur_book_events[j].state_flag === 'block_print') {
                    // console.log('find~')
                    // d3.select(`#${cur_book_name}-event-${(j + 1).toString()}`) // block_print
                    //     .style('opacity', 1)
                } else if (cur_book_events[j].state_flag === 'Japan') {
                    // d3.select(`#${cur_book_name}-event-${(j + 1).toString()}`) // Japan
                    //         .style('opacity', 1)
                    if (!meet_lastChina) { // 还没遇到lastChina
                        meet_lastChina = true  
                        // d3.select(`#${cur_book_name}-event-${j.toString()}`) // lastChina
                        //     .style('opacity', 1)   
                    }
                } else if (cur_book_events[j].state_flag === 'transnational' && !meet_lastChina) {
                    meet_lastChina = true
                    // d3.select(`#${cur_book_name}-event-${j.toString()}`) // lastChina
                    //     .style('opacity', 1) 
                } else {
                    // console.log('d3.select(`#${cur_book_name}-event-${(j + 1).toString()}`)', d3.select(`#${cur_book_name}-event-${(j + 1).toString()}`))
                    d3.select(`#${cur_book_name}-event-${(j + 1).toString()}`) // lastChina
                        .style('opacity', 0.4) 
                }
            }
        }
    } 
    // else {
    //     recover_time_range_event_opacity(book_list_all)
    // }
}

// 从别的视图中选择locations时timeline视图的响应
export function location_selection_movement(input_param) {
// export function location_selection_movement(input_constraint, cur_book_list, each_book_pos, input_row_height, input_last_click, input_last_click_array, cur_view) {
    let input_paras = JSON.parse(JSON.stringify(input_param))
    let cur_book_list = input_paras.curBookList,
        each_book_pos = input_paras.eachBookPos,
        included_list = [],
        excluded_list = [],
        included_name_dict = []
    const rowHeight = input_paras.rowHeight,
          lastClick = input_paras.lastClick,
          lastClickArray = input_paras.lastClickArray,
          constraints = input_paras.constraints
    const traj_loc_list = constraints.selection.value.trajs // array
    // console.log('traj_loc_list', traj_loc_list)

    for (let i = 0; i < cur_book_list.length; i++) { // every book
        let find_traj = false
        const cur_book_name = cur_book_list[i].book_name
        const cur_book_events = cur_book_list[i].events
        for (let j = 0; j < cur_book_events.length; j++) { // every event
            if (traj_loc_list.includes(cur_book_events[j].ori_idx)) { // 如果包含该轨迹
                find_traj = true
                // highlight
                d3.select(`#${cur_book_name}-event-circle-item-${(j + 1).toString()}`)
                    .attr("filter", 'drop-shadow(3px 2px 2px rgb(0 0 0 / 0.6))')
                    .attr("fill", type_color.library.bright[cur_book_events[j].lib_type])
                d3.select(`#${cur_book_name}-event-lineLeft-${(j + 1).toString()}`)
                    .attr("filter", 'drop-shadow(3px 2px 2px rgb(0 0 0 / 0.6))')
                    .attr("stroke", type_color.library.bright[cur_book_events[j].lib_type])
                d3.select(`#${cur_book_name}-event-lineRight-${(j + 1).toString()}`)
                    .attr("filter", 'drop-shadow(3px 2px 2px rgb(0 0 0 / 0.6))')
                    .attr("stroke", type_color.library.bright[cur_book_events[j].lib_type])
                d3.select(`.${cur_book_name}-tag-${(j + 1).toString()}`)
                    .attr("filter", 'drop-shadow(2px 2px 1px rgb(0 0 0 / 0.2))')

                if (!included_name_dict.hasOwnProperty(cur_book_name)) { // 该书尚未加入
                    included_name_dict[cur_book_name] = {...cur_book_list[i], ...{earliest_time: cur_book_events[j].time_info.timestamp}}
                } else { // 该书已经加入，则比较二者的earliest_time
                    if (included_name_dict[cur_book_name].earliest_time >= cur_book_events[j].time_info.timestamp) { // 更新earliest_time
                        included_name_dict[cur_book_name].earliest_time = cur_book_events[j].time_info.timestamp
                    }
                }
            } else {
                d3.select(`#${cur_book_name}-event-circle-item-${(j + 1).toString()}`)
                    .attr("filter", 'none')
                    .attr("fill", type_color.library[cur_book_events[j].lib_type])
                d3.select(`#${cur_book_name}-event-lineLeft-${(j + 1).toString()}`)
                    .attr("filter", 'none')
                    .attr("stroke", type_color.library[cur_book_events[j].lib_type])
                d3.select(`#${cur_book_name}-event-lineRight-${(j + 1).toString()}`)
                    .attr("filter", 'none')
                    .attr("stroke", type_color.library[cur_book_events[j].lib_type])
                d3.select(`.${cur_book_name}-tag-${(j + 1).toString()}`)
                    .attr("filter", 'none')
            }
        }

        if (!find_traj) {
            excluded_list.push(cur_book_list[i])
        }
    }

    // 对象转化为array
    included_list = Object.values(included_name_dict)
    included_list.sort((a,b)=>{ // 排序
        return a.earliest_time - b.earliest_time
    })
    for (let k = 0; k < included_list.length; k++) {
        delete included_list[k].earliest_time
    }
    const included_num = included_list.length
    cur_book_list = included_list.concat(excluded_list) // 合并
    console.log('cur_book_list', included_num, cur_book_list)

    const output_each_book_pos = BookTraj.reCalRowPos(cur_book_list, each_book_pos, rowHeight, lastClick, lastClickArray) // 更新eachPos

    let cur_max_length = 0 // 用于记录当前最大的长度  
    for (let i = 0; i < cur_book_list.length; i++) {
        const select_book = cur_book_list[i].book_name
        d3.select(`#${select_book}-group`)
            .attr('transform', `translate(0, ${output_each_book_pos[select_book].y.toString()})`)
            // .style('opacity', curSeqArray[i].opacity) // 待改动(只有filter的情况下可以用opacity直接定义)
            .style('opacity', () => {
                if (i < included_num && cur_book_list[i].opacity === 1) {
                    return 1
                } else if (i < included_num && cur_book_list[i].opacity !== 1) {
                    return 0.6
                } else { return 0.4 }
                // if (i < included_num) {
                //     return 1
                // } else { return 0.4 }
            })
        // 更新cur_max_length
        cur_max_length = Math.max(cur_max_length, output_each_book_pos[select_book].y + output_each_book_pos[select_book].height)
    }

    document.getElementById('container').scrollTo(0, 0) // 返回顶部,在timeline的selection也要体现

    return {
        all_book_list: cur_book_list,
        each_book_pos: output_each_book_pos,
        cur_max_len: cur_max_length
    }

}