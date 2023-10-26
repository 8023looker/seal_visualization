<template>
    <div id="container" :width="canvas_width" :height="canvas_height">
        <div id="timeLineSVGcontainer" :width="canvas_width" :height="canvas_height">
            <svg id="timeLineSVG" :width="canvas_width"></svg>
        </div>
        <template v-for="(item, index) in detailBookInfo">
            <TimeLineBookCard
                class="detail-info-card"
                v-if="item.ifShow"
                :book_detail="item"
            ></TimeLineBookCard>
        </template>
        <template v-for="(item, index) in detailEventInfo">
        <TimeLineEventCard
            class="detail-info-card"      
            v-if="item.ifShow"
            :event_detail="item"
            :canvas_width="canvas_width"
            :canvas_height="canvas_height"
            :xTimeScale="xTimeScale"
        ></TimeLineEventCard>
        </template>
    </div>
</template>

<script>
import * as d3 from "d3";
const $ = require("jquery");
import * as Data from "@/data/Data.js";
import { color, type_color } from "@/theme";
import * as Translate from "@/theme/lang"
import { get_book_traj } from "@/data/BookTraj";
import * as BookTraj from "@/data/BookTraj";
import * as TimeLineUpdate from "@/data/timeline/timeline_update";
import * as TimelineTransition from "@/data/timeline/transition_func"
import { trans_graph } from "@/data/hier_graph/transform";
import * as GraphAPI from "@/data/hier_graph"; // 请求graph视图的数据
import * as GeoAPI from "@/data/geo/api"; // 请求geo视图的数据
import { mapState } from "vuex";

import { setExportRowHeight } from "@/data/BookTraj"
import { setExportBookList } from "@/data/BookTraj"
import { setExportScrollTopValue } from "@/data/BookTraj"
import { setExportBookPosDict } from "@/data/BookTraj"
import { setExportSVGLength } from "@/data/BookTraj"

import TimeLineBookCard from "./timeline_widgets/bookCard.vue";
import TimeLineEventCard from "./timeline_widgets/eventCard.vue";
import * as InfoCardFunc from "@/data/timeline/info_card_func";

const margin = {
    left: 0.12,
    right: 0.05,
};
const line_height = 40
const time_duration = 3000 // 设置过渡时间

export default {
    name: "Timeline",
    // exportBookList,
    // exportRowHeight,
    data() {
        return {
            svgShowSize: [document.getElementsByClassName('main-panel')[0].clientWidth, document.getElementsByClassName('main-panel')[0].clientHeight],
            visible: false,
            rowHeight: 40,
            // bookDetailDictOld: {},
            // bookDetailDict: {},
            data: null,
            curBookList: [], // 当先filter的book

            pathCandidateList: [], // 用于标志可能组成path的bookList候选
            lastLibrary: null, // 用于标志上一次click的library
            pathNameList: [], // 用于传入path的array
            alreadyLibPathSort: false, // 用于标志已经在library_id和path的selection进行排序了

            tagPosDict: {}, // 用于记录每个标签是否显示的list(default,经过计算重新布局的)
            tagRowPosList: {}, // 用于记录hover library以后改变的该行tagPosDict（仅针对hover时的那一行list）

            allBookDict: [], // 全部的bookList
            curBookListHover: [], // 当前hover所筛选的bookList，作用于filter和hover不同时
            fitBookNumber: 0, // 用于在click/hover机构/人物的时候确定符合要求的book_number
            filterExcluded: { book: [],
                              agent: [],
                              library: [],
                              time_range: []
                            }, // 用于存储filter下所有filter_option过滤掉的book
            // allBookList: [], // 当先所有的book
            curSVGMove: 0,
            singleBookDetailName: '', // 用于记录hover单本书时该书的名字
            stayState: false, // 用于记录是否停留在当前的状态(区别hover和selection)
            filterState: {book: false, agent: false, library: false},
            eachBookState: {}, // 用于记录每一本书的状态，格式为{ 'stay_state': Boolean, 'hover': book_name/null, 'selection': book_name/null}
            eachBookPos: {}, // 用于记录每一本书当前的位置{ 'book_name': { 'y': , 'height': }}
            lastHover: null, // 用于标记上一次hover的book
            lastAgentLib: null, // 用于标记上一次hover的agent/lib

            lastClick: null, // 用于标记上一次click(select)的book
            lastClickArray: [], // 用于标记上一次click的多本书(editions)
            ifInnerHover: false, // 用于记录是在timeline视图中hover还是在左边hover，确定是否要使用scrollTo
            ifInnerClick: false, // 用于记录selection在timeline视图中click是在左边click
            ifInnerClickLib: false, // 用于记录selection在timeline视图中click library是在全局还是timeline视图内
            transitionOn: {}, // 用于记录动画是否仍在进行,若仍在进行则禁止交互

            transitionBookOn: { 'all': false }, // 用于记录展开单本书细节是否正在进行，若仍在进行则禁止交互
            lastClickEditions: [], // 用于记录之前select的editions，用于做差值
            additionBook: [], // 用于记录两个editions之间的差值，形式为array

            xTimeScale: d3
                .scaleTime()
                .domain([new Date(960, 1, 1), new Date(1965, 1, 1)]) // 为了绘图美观，前后延伸了15年
                .range([0.12 * document.getElementsByClassName('main-panel')[0].clientWidth, (1 - margin.right) * document.getElementsByClassName('main-panel')[0].clientWidth]),
            scrollTopContainer: 0, // 用于transition时向外export当前container窗口的scrollTop值
            curSvgLength: 0 // 用于更新单本书展开后的svg画布长度
        }
    },
    props: ["canvas_width", "canvas_height"],
    components: {
        TimeLineBookCard,
        TimeLineEventCard
    },
    computed: {
        ...mapState(["filter", "selection", "hover", "transition", "rem", "overlay_duration", "cur_view", "language", "switchWholeView"]),
        detailBookInfo() {
            // const tar =
            //     // (this.hover.entity === "edition" && this.hover.value) ||
            //     (this.selection.entity === "edition" && this.selection.value) ||
            //     null
            const tar = (this.selection.entity === "editions" && this.selection.value) || null
            if (!tar) return []

            let book_info_list = []
            for (let i in tar) {
                // 判断显示
                let editions_transition = this.additionBook.length > 0 ? (this.transitionBookOn.hasOwnProperty(this.additionBook[0]) ? this.transitionBookOn[this.additionBook[0]] && tar[i] === this.additionBook[0] : false) : false
                let card_ifShow = this.selection.value !== null ?
                    // (this.hover.entity === "edition" && this.hover.value) ||
                    (((this.selection.entity === "edition" && this.selection.value && !editions_transition) || (this.selection.entity === "editions" && this.selection.value !== null && !editions_transition)) && (this.transition.from !== 'timeline' && this.transition.state !== 'out')) || // transitionOn用于动画过程中禁止交互
                    null
                    : (((this.selection.entity === "edition" && this.selection.value && !this.transitionBookOn['all']) || (this.selection.entity === "editions" && this.selection.value !== null && !this.transitionBookOn['all'])) && (this.transition.from !== 'timeline' && this.transition.state !== 'out')) || // transitionOn用于动画过程中禁止交互
                    null            
                let pass_book_detail = Data.read_books().filter((d) => d.book_name === tar[i])[0] // 后续需要经过语言选择处理

                pass_book_detail = InfoCardFunc.book_info_language(this.language, pass_book_detail)
                book_info_list.push({...pass_book_detail, ...this.eachBookPos[tar[i]], ...{lib_type: this.data[tar[i]][0].lib_type}, ...{ifShow: card_ifShow} }) // 筛选出book整体信息   
            }
            // return {...Data.read_books().filter((d) => d.book_name === tar)[0], ...this.eachBookPos[tar]} // 筛选出book整体信息   
            return book_info_list
        },
        detailEventInfo() {
            const tar =
                // (this.hover.entity === "edition" && this.hover.value) ||
                // (this.selection.entity === "edition" && this.selection.value) ||
                (this.selection.entity === "editions" && this.selection.value) ||
                null
            if (!tar) return []

            let book_event_list = [] // 多本书的detail event list [[], []]
            for (let i in tar) {
                // 判断显示
                let editions_transition = this.additionBook.length > 0 ? (this.transitionBookOn.hasOwnProperty(this.additionBook[0]) ? this.transitionBookOn[this.additionBook[0]] && tar[i] === this.additionBook[0] : false) : false
                // console.log(this.transitionBookOn[this.additionBook[0]], tar[i] === this.additionBook[0])
                const event_bundle_dict = {
                    events: JSON.parse(JSON.stringify(this.data[tar[i]])), // 筛选出book的event信息
                    ...this.eachBookPos[tar[i]],
                    book_name: tar[i],
                    ifShow: this.selection.value !== null ?
                    // (this.hover.entity === "edition" && this.hover.value) ||
                    (((this.selection.entity === "edition" && this.selection.value && !editions_transition) || (this.selection.entity === "editions" && this.selection.value !== null && !editions_transition)) && (this.transition.from !== 'timeline' && this.transition.state !== 'out')) || // transitionOn用于动画过程中禁止交互
                    null
                    : (((this.selection.entity === "edition" && this.selection.value && !this.transitionBookOn['all']) || (this.selection.entity === "editions" && this.selection.value !== null && !this.transitionBookOn['all'])) && (this.transition.from !== 'timeline' && this.transition.state !== 'out')) || // transitionOn用于动画过程中禁止交互
                    null
                }
                // console.log('event_bundle_dict',  event_bundle_dict, this.data)
                book_event_list.push(event_bundle_dict)
            }
            // const event_bundle_dict = { // 单本书的情况
            //     ...{ events: JSON.parse(JSON.stringify(this.data[tar])) }, // 筛选出book的event信息
            //     ...this.eachBookPos[tar]
            // }
            return book_event_list
            // return JSON.parse(JSON.stringify(this.data[tar])) // 筛选出book的event信息
        },
        show_book_detail() {
            let edition_transition = this.transitionBookOn.hasOwnProperty(this.selection.value) ? this.transitionBookOn[this.selection.value] : false,
                editions_transition = this.additionBook.length > 0 ? (this.transitionBookOn.hasOwnProperty(this.additionBook[0]) ? this.transitionBookOn[this.additionBook] : false) : false

            const tar = this.selection.value !== null ?
                // (this.hover.entity === "edition" && this.hover.value) ||
                (((this.selection.entity === "edition" && this.selection.value && !edition_transition) || (this.selection.entity === "editions" && this.selection.value !== null && !editions_transition)) && (this.transition.from !== 'timeline' && this.transition.state !== 'out')) || // transitionOn用于动画过程中禁止交互
                null
                : (((this.selection.entity === "edition" && this.selection.value && !this.transitionBookOn['all']) || (this.selection.entity === "editions" && this.selection.value !== null && !this.transitionBookOn['all'])) && (this.transition.from !== 'timeline' && this.transition.state !== 'out')) || // transitionOn用于动画过程中禁止交互
                null
            console.log('tar', tar)
            return tar
        }
    },
    watch: {
        // fitBookNumber: function(newVal, oldVal) {
        //     console.log('fitBookNumber', newVal)
        // },
        alreadyLibPathSort: function(newVal, oldVal) {
            console.log('alreadyLibPathSort', newVal)
        },
        lastClick: function(newVal, oldVal) {
            console.log('lastClick', newVal)
            setExportBookPosDict(this.eachBookPos)
            // BookTraj.cur_timeline_layout() // 用于测试是否可以实时传值
        },
        lastHover: function(newVal, oldVal) {
            console.log('lastHover', newVal)
        },
        curBookList: function(newVal,oldVal) { // 用于向外部exportBookList变量传值
           // this.curBookList = newVal
           // BookTraj.exportBookList = newVal
           if (newVal.length !== 0) {
              setExportBookList(newVal)
              console.log('curBookList改变啦', newVal)
              setExportBookPosDict(this.eachBookPos)
              // BookTraj.cur_timeline_layout() // 用于测试是否可以实时传值
           }
        },
        eachBookPos: {
            handler: function (newVal, oldVal) {
                console.log('eachBookPos更新啦', newVal)
                setExportBookPosDict(newVal)
            },
            deep: true
        },
        rowHeight: function(newVal, oldVal) { // 用于向外部exportRowHeight变量传值
            setExportRowHeight(newVal)
            setExportBookPosDict(this.eachBookPos)
            // BookTraj.cur_timeline_layout() // 用于测试是否可以实时传值
        },

        scrollTopContainer: function(newVal, oldVal) { // 用于向外部exportScrollTop变量传值
            setExportScrollTopValue(newVal)
            setExportBookPosDict(this.eachBookPos)
        },
        curSvgLength: function(newVal, oldVal) { // 用于向外部exportSVGLength变量传值
            d3.select('#timeLineSVG').attr('height', newVal) // 修改当前svg画布的长度
            setExportSVGLength(newVal)
        },
        transitionOn: function(newVal, oldVal) {
            console.log('transitionOn', newVal)
        },
        filter: {
            handler: function (newVal, oldVal) {
                // if (newVal.value === null && newVal.entity !== 'time_range') { // 如果filter取消了
                //     const cancelType = newVal.entity
                //     this.filterState[cancelType] = false
                // } else {
                //     this.filter_handler()
                // }

                // 动画时禁用交互
                // if (this.transitionOn) {
                //     return
                // }
                const constraints = {
                    filter: this.filter,
                    selection: this.selection,
                    hover: this.hover,
                }
                const that = this
                
                if (constraints.hover.entity !== 'book_type' && constraints.hover.entity !== 'agent_type' && constraints.hover.entity !== 'library_type' && constraints.hover.entity !== 'book' && constraints.hover.entity !== 'china2japan') {
                    this.lastHover = constraints.hover.value // 更新最新hover的book_name
                }
                // console.log('this.lastHover', this.lastHover)
                // console.log('newFilter', newVal)
                // if (newVal.time_range !== null) { // 对于time_range进行filter
                // }

                // if (newVal.china2japan) {
                //     // filter的china2japan
                //     TimeLineUpdate.china2japan_movement(newVal.china2japan, that.curBookList)
                // } else {
                    // general
                this.filterExcluded = TimeLineUpdate.filter_movement(constraints, this.data) // 更新所有filter条件下过滤掉的bookList
                let includedBookList = TimeLineUpdate.merge_book_list(this.filterExcluded, this.data) // 更新综合filter下来的bookList
                let excludeBookList = TimeLineUpdate.sub_array(Object.keys(this.data), includedBookList)

                includedBookList = TimeLineUpdate.add_bookList_attr(this.allBookDict, includedBookList)
                // 对于included_list, 在time_range情况下按照符合该time_range内最早event的时间进行升序排序，其余正常按照最早传入日本的时间进行排序即可
                if (constraints.filter.time_range !== null) {
                    if (constraints.filter.time_range[1] - constraints.filter.time_range[0] < 1005) { // 排除选择了全部年份跨度的情况
                        // 加入circle以及文字的opacity淡化显示
                        TimeLineUpdate.recover_time_range_event_opacity(this.curBookList) // 首先恢复所有的opacity
                        TimeLineUpdate.time_excluded_circle_text(constraints.filter.time_range, includedBookList, newVal.china2japan) // 对于处于time_range范围内的book,但是不属于该时间段的event,设置opacity
                        includedBookList = TimeLineUpdate.time_range_sort(includedBookList, constraints.filter.time_range) // 对includedBookList进行重排序
                    } else { // 没有time_range的filter
                        TimeLineUpdate.recover_time_range_event_opacity(this.curBookList)
                        TimeLineUpdate.china2japan_movement(constraints.filter.china2japan, this.curBookList)
                    }
                } else { // 没有time_range的filter
                    TimeLineUpdate.recover_time_range_event_opacity(this.curBookList)
                    TimeLineUpdate.china2japan_movement(constraints.filter.china2japan, this.curBookList)
                }
                excludeBookList = TimeLineUpdate.add_bookList_attr(this.allBookDict, excludeBookList)

                // const curSeqArray = [...TimeLineUpdate.add_name_opacity(this.curBookList, 'included', constraints), ...TimeLineUpdate.add_name_opacity(excludeBookList, 'excluded', constraints)]// 当前按照顺序排的bookList
                const curSeqArray = TimeLineUpdate.add_name_opacity(includedBookList, 'included', constraints).concat(TimeLineUpdate.add_name_opacity(excludeBookList, 'excluded', constraints))
                this.curBookList = curSeqArray
                // 重新计算各行的排列位置
                // console.log('3—time_range~')
                // this.eachBookPos = BookTraj.reCalRowPos(curSeqArray, this.eachBookPos) // 首先获取更新前的所有book的position
                this.eachBookPos = BookTraj.reCalRowPos(curSeqArray, this.eachBookPos, this.rowHeight, this.lastClick, this.lastClickArray, this.lastClickArray) // 首先获取更新前的所有book的position
                let cur_max_length = 0 // 用于记录当前最大的长度
                for (let i = 0; i < curSeqArray.length; i ++) {
                    const select_book = curSeqArray[i].book_name
                    d3.select(`#${select_book}-group`)
                        .transition()
                        .duration(time_duration) // filter时的过渡
                        .attr('transform', `translate(0, ${this.eachBookPos[select_book].y.toString()})`)
                        .style('opacity', curSeqArray[i].opacity)
                        .on('start', function() {
                            that.transitionOn = true
                        })
                        .on('end', function() {
                            that.transitionOn = false
                        })
                    // 更新cur_max_length
                    cur_max_length = Math.max(cur_max_length, this.eachBookPos[select_book].y + this.eachBookPos[select_book].height)
                }
                this.curSvgLength = cur_max_length
                // 等待
                // setTimeout(function() {
                // }, 5000)
                // 平移到最上方
                // document.getElementById('container')
                //         .scrollTo({top: 0, behavior: "smooth"})
                this.backToTop()
                this.filter_handler()
                // }          
            },
            deep: true,
        },
        selection: function (newVal, oldVal) { // click
            console.log('selection', newVal)
            const constraints = {
                    filter: this.filter,
                    selection: this.selection,
                    hover: this.hover
                }
                
            const self = this

            // 动画时禁用交互
            // if (self.transitionOn) {
            //         return
            //     }
            if (newVal.value === null) { // 如果没有选中，则重新渲染
                setExportScrollTopValue(0) //传值恢复为0
                self.lastClickEditions = []
                if (newVal.entity === 'library_id') {
                    self.ifInnerClickLib = false
                    // 恢复到原来的color和shadow
                    for (let i = 0; i < self.curBookList.length; i ++) {
                            const select_book = self.curBookList[i].book_name            
                            const cur_book_events = self.curBookList[i].events
                            d3.select(`#${select_book}-book_name`) // book_name恢复不加阴影的状态
                                .attr("filter", 'none')
                            for (let j = 0; j < cur_book_events.length; j++) {
                                d3.select(`#${select_book}-event-circle-item-${(j + 1).toString()}`)
                                    .attr("filter", 'none')
                                    .attr("fill", type_color.library[cur_book_events[j].lib_type])
                                d3.select(`#${select_book}-event-lineLeft-${(j + 1).toString()}`)
                                    .attr("filter", 'none')
                                    .attr("stroke", type_color.library[cur_book_events[j].lib_type])
                                d3.select(`#${select_book}-event-lineRight-${(j + 1).toString()}`)
                                    .attr("filter", 'none')
                                    .attr("stroke", type_color.library[cur_book_events[j].lib_type])
                                // d3.select(`#${select_book}-event-uncertain-circle${(j + 1).toString()}`)
                                //     .selectAll('circle')
                                //     .attr("filter", 'none')
                                //     .attr("fill", type_color.library[cur_book_events[j].lib_type])
                                // console.log(d3.select(`.${select_book}-tag-${(j + 1).toString()}`))
                                d3.select(`.${select_book}-tag-${(j + 1).toString()}`)
                                    .attr("filter", 'none')      
                            }
                        }
                }

                if (newVal.entity === 'locations' || newVal.entity === 'edition' || newVal.entity === 'book' || newVal.entity === 'path' || newVal.entity === 'editions') { // 对于单本书 !hover, 恢复原先的位置
                    // console.log('收起info_card-edition')
                    
                    if (self.hover.value !== null) { // 选择了书A，hover书B
                    // return // 在hover func中已经操作了

                } else { // 全部取消选择
                    for (let book_item in self.eachBookState) {
                        self.eachBookPos[book_item].stay_state = false
                        d3.select(`#${book_item}-group`).selectAll('.detailInfo').remove()
                        // 恢复每本书原来的color
                        const cur_book_event = self.data[book_item]
                        d3.select(`#${book_item}-book_name`) // book_name恢复不加阴影的状态
                          .attr("filter", 'none')
                        for (let k = 0; k < cur_book_event.length; k++) {
                            d3.select(`#${book_item}-event-circle-item-${(k + 1).toString()}`)
                                .attr("filter", 'none')
                                .attr("fill", type_color.library[cur_book_event[k].lib_type])
                            d3.select(`#${book_item}-event-lineLeft-${(k + 1).toString()}`)
                                .attr("filter", 'none')
                                .attr("stroke", type_color.library[cur_book_event[k].lib_type])
                            d3.select(`#${book_item}-event-lineRight-${(k + 1).toString()}`)
                                .attr("filter", 'none')
                                .attr("stroke", type_color.library[cur_book_event[k].lib_type])
                        }

                        // 恢复到原来的文字显示长度
                        d3.select(`#${book_item}-book_name`)
                            // .text(book_item.length <= 6 ? book_item : book_item.slice(0, 6) + '...')
                            // .text(book_item)
                            .text(() => {
                                if (self.language === 'zh') {
                                    return Translate.book_name_lang[book_item].zh
                                } else if (self.language === 'en') {
                                    return Translate.book_name_lang[book_item].en
                                }
                            })
                    }

                    // 重新计算各行的排列位置
                    // console.log('1~')
                    // console.log('收起info_card')
                    self.eachBookPos = BookTraj.reCalRowPos(self.curBookList, self.eachBookPos, self.rowHeight, null, [])
                    let cur_max_length = 0 // 用于记录当前最大的长度
                    for (let i = 0; i < self.curBookList.length; i ++) {
                        const select_book = self.curBookList[i].book_name
                        d3.select(`#${select_book}-group`)
                            .transition()
                            .duration(time_duration / 4)
                            .attr('transform', `translate(0, ${self.eachBookPos[select_book].y.toString()})`)
                            .on('start', function() {
                                self.transitionOn = true
                                self.transitionBookOn['all'] = true
                                // console.log('hover_transition', this.transitionOn)
                            })
                            .on('end', function() {
                                self.transitionOn = false
                                self.transitionBookOn['all'] = false
                                // console.log('hover_transition', this.transitionOn)
                            })
                        // 更新cur_max_length
                        cur_max_length = Math.max(cur_max_length, self.eachBookPos[select_book].y + self.eachBookPos[select_book].height)
                    }
                    self.curSvgLength = cur_max_length
                    // self.backToTop()
                    }
                }
                self.lastClick = null // 更新lastClick
                self.lastClickArray = [] // 更新lastClickArray
            // } else if (newVal.value !== oldVal.value) { // 此时click了一本book（弃用）

                // 用于判断取消选择后是否还有filter的情况
                if (self.filter.agent === null && self.filter.book === null && self.filter.library === null && (self.filter.time_range === null || self.filter.time_range[1] - self.filter.time_range[0] >= 1005)) {
                    // 恢复到默认排序
                    self.curBookList = TimeLineUpdate.reorder_list(self.curBookList, 'default', null)
                    self.eachBookPos = BookTraj.reCalRowPos(self.curBookList, self.eachBookPos, self.rowHeight, self.lastClick, self.lastClickArray) // 更新所有book的position
                    let cur_max_length = 0 // 用于记录当前最大的长度
                    const dur_time = (oldVal.entity === 'edition' || oldVal.entity === 'editions')? time_duration / 4: time_duration
                    for (let book_name in self.eachBookPos) {
                        d3.select(`#${book_name}-group`)
                            .style('opacity', 1)
                            .transition()
                            .duration(dur_time)
                            .attr('transform', `translate(0,${self.eachBookPos[book_name].y})`)
                            .on('start', function() {
                                self.transitionOn = true
                                self.transitionBookOn['all'] = true
                            })
                            .on('end', function() {
                                self.transitionOn = false
                                self.transitionBookOn['all'] = false
                            })
                        // 更新cur_max_length
                        cur_max_length = Math.max(cur_max_length, self.eachBookPos[book_name].y + self.eachBookPos[book_name].height)
                        }
                    self.curSvgLength = cur_max_length

                    // back to top
                    if (oldVal.entity !== 'edition' && oldVal.entity !== 'editions') {
                        self.backToTop()
                    }

                } else {
                    self.filterExcluded = TimeLineUpdate.filter_movement(constraints, self.data) // 更新所有filter条件下过滤掉的bookList
                    let includedBookList = TimeLineUpdate.merge_book_list(self.filterExcluded, self.data) // 更新综合filter下来的bookList
                    let excludeBookList = TimeLineUpdate.sub_array(Object.keys(self.data), includedBookList)

                    includedBookList = TimeLineUpdate.add_bookList_attr(self.allBookDict, includedBookList)
                    excludeBookList = TimeLineUpdate.add_bookList_attr(self.allBookDict, excludeBookList)

                    // const curSeqArray = [...TimeLineUpdate.add_name_opacity(this.curBookList, 'included', constraints), ...TimeLineUpdate.add_name_opacity(excludeBookList, 'excluded', constraints)]// 当前按照顺序排的bookList
                    const curSeqArray = TimeLineUpdate.add_name_opacity(includedBookList, 'included', constraints).concat(TimeLineUpdate.add_name_opacity(excludeBookList, 'excluded', constraints))
                    self.curBookList = curSeqArray
                    // 重新计算各行的排列位置
                    // console.log('3—time_range~')
                    // this.eachBookPos = BookTraj.reCalRowPos(curSeqArray, this.eachBookPos, this.rowHeight) // 首先获取更新前的所有book的position
                    self.eachBookPos = BookTraj.reCalRowPos(curSeqArray, self.eachBookPos, self.rowHeight, self.lastClick, self.lastClickArray) // 首先获取更新前的所有book的position
                    let cur_max_length = 0 // 用于记录当前最大的长度
                    const dur_time = (oldVal.entity === 'edition' || oldVal.entity === 'editions')? time_duration / 4: time_duration
                    for (let i = 0; i < curSeqArray.length; i ++) {
                        const select_book = curSeqArray[i].book_name
                        d3.select(`#${select_book}-group`)
                            .transition()
                            .duration(dur_time)
                            .attr('transform', `translate(0, ${self.eachBookPos[select_book].y.toString()})`)
                            .style('opacity', curSeqArray[i].opacity)
                            .on('start', function() {
                                self.transitionOn = true
                                self.transitionBookOn['all'] = true
                            })
                            .on('end', function() {
                                self.transitionOn = false
                                self.transitionBookOn['all'] = false
                            })
                        // 更新cur_max_length
                        cur_max_length = Math.max(cur_max_length, self.eachBookPos[select_book].y + self.eachBookPos[select_book].height)
                    }
                    self.curSvgLength = cur_max_length
                    // 等待
                    // setTimeout(function() {
                    // }, 5000)
                    // 如果只是简单的hover edition
                    if (self.hover.entity === 'edition') {
                                return
                            }
                    // 平移到最上方
                    if (self.cur_view !== 'timeline') {
                        self.backToTop()
                    }      
                }

                // 清空有关path的变量
                self.pathCandidateList = []
                self.lastLibrary = null
                self.pathNameList = []

            } else { // 此时click了一本book（可以多次click）
                // 需要支持多本书选择，因此本段弃用
                // if (self.lastClick !== null ) { // click A, click B
                //     if (self.lastClick !== '文選') {
                //         self.eachBookState[self.lastClick].stay_state = false
                //         d3.select(`#${self.lastClick}-group`).selectAll('.detailInfo').remove()
                //     }
                //     // 重新计算各行的排列位置(删除info card后需要重新排布)
                //     // console.log('2~')
                //     self.eachBookPos = BookTraj.reCalRowPos(self.curBookList, self.eachBookPos, self.rowHeight) // 首先获取更新前的所有book的position
                //     for (let book_name in self.eachBookPos) {
                //         d3.select(`#${book_name}-group`)
                //             .transition()
                //             .duration(time_duration)
                //             .attr('transform', `translate(0,${self.eachBookPos[book_name].y})`)
                //             .on('start', function() {
                //                 self.transitionOn = true
                //             })
                //             .on('end', function() {
                //                 self.transitionOn = false
                //             })
                //         }
                // } else { // 从全部未选中到select
                // }

                // editions (选择多本书的情况)
                if (newVal.entity === 'editions') {
                    // console.log('多本书', newVal.value)
                    // 差集
                    // console.log('self.lastClickEditions', self.lastClickEditions)
                    // console.log('newVal.value', newVal.value)
                    self.additionBook = newVal.value.filter(item => !self.lastClickEditions.includes(item)) // array 
                    // 更新
                    self.lastClickEditions = JSON.parse(JSON.stringify(newVal.value))

                    for (let i in newVal.value) { // edition array
                        if (self.eachBookState.hasOwnProperty(newVal.value[i])) {
                            self.eachBookState[newVal.value[i]].stay_state = true
                        }
                    }
                    self.lastClickArray = newVal.value // 更新click edition array
                    self.lastClick = newVal.value[newVal.value.length - 1] // 对应最新click的edition, book_array最后一个元素
                    // console.log('self.lastClick', self.lastClick, newVal.value[newVal.value.length - 1])

                    self.eachBookPos = BookTraj.reCalRowPos(self.curBookList, self.eachBookPos, self.rowHeight, self.lastClick, self.lastClickArray) // 首先获取更新前的所有book的position, lastClickArray支持多个edition
                    let cur_max_length = 0 // 用于记录当前最大的长度

                    self.scrollTopContainer = self.eachBookPos[self.lastClick].y - 15

                    for (let i = 0; i < self.curBookList.length; i ++) {
                        const select_book = self.curBookList[i].book_name
                        d3.select(`#${select_book}-group`)
                            .transition()
                            .duration(time_duration / 4)
                            .attr('transform', `translate(0, ${self.eachBookPos[select_book].y.toString()})`)
                            .on('start', function() {
                                self.transitionOn = true
                                if (self.additionBook.includes(select_book)) {
                                    self.transitionBookOn[select_book] = true
                                } else {
                                    self.transitionBookOn[select_book] = false
                                }
                                // console.log('self.transitionBookOn[select_book]', self.transitionBookOn[select_book])
                            })
                            .on('end', function() {
                                self.transitionOn = false
                                self.transitionBookOn[select_book] = false
                                // console.log('hover_transition', this.transitionOn)
                            })
                    // 更新cur_max_length
                    cur_max_length = Math.max(cur_max_length, self.eachBookPos[select_book].y + self.eachBookPos[select_book].height)
                    }
                    self.curSvgLength = cur_max_length
                }
               
                // edition
                if (newVal.entity === 'edition') { // 代表click的是edition
                // if (self.eachBookState.hasOwnProperty(newVal.value)) { // 代表click的是edition
                    self.eachBookState[newVal.value].stay_state = true
                    // self.bookDetailDict[newVal.value] = !(self.bookDetailDict[newVal.value]) // 取反
                    self.lastClick = newVal.value // 代表该edition，更新lastClick
                    // console.log('lastClick.newVal', self.lastClick, newVal.value)
                    // 展开信息卡
                    TimeLineUpdate.showBookDetailCards(self.hover.value, self.data, self.svgShowSize)
                    // 重新计算各行的排列位置

                    // 目前仅考虑click单本书的情况
                    if (self.eachBookState.hasOwnProperty(oldVal.value)) { // 之前click的另一本书
                        self.eachBookState[oldVal.value].stay_state = false // 将之前click的edition的stay_state设置为false
                    }

                    // console.log('5~')
                    self.eachBookPos = BookTraj.reCalRowPos(self.curBookList, self.eachBookPos, self.rowHeight, self.lastClick, self.lastClickArray) // 首先获取更新前的所有book的position
                    let cur_max_length = 0 // 用于记录当前最大的长度

                    self.scrollTopContainer = self.eachBookPos[self.lastClick].y - 15

                    for (let i = 0; i < self.curBookList.length; i ++) {
                        const select_book = self.curBookList[i].book_name
                        d3.select(`#${select_book}-group`)
                            .transition()
                            .duration(time_duration / 4)
                            .attr('transform', `translate(0, ${self.eachBookPos[select_book].y.toString()})`)
                            .on('start', function() {
                                self.transitionOn = true
                                console.log('select_book', select_book)
                                console.log('newVal.value', newVal.value)
                                if (newVal.value === select_book) {
                                    
                                    self.transitionBookOn[select_book] = true
                                } else {
                                    self.transitionBookOn[select_book] = false
                                }
                                // console.log('hover_transition', this.transitionOn)
                            })
                            .on('end', function() {
                                self.transitionOn = false
                                self.transitionBookOn[select_book] = false
                                // console.log('hover_transition', this.transitionOn)
                            })
                    // 更新cur_max_length
                    cur_max_length = Math.max(cur_max_length, self.eachBookPos[select_book].y + self.eachBookPos[select_book].height)
                    }
                    self.curSvgLength = cur_max_length
                    // if (self.ifInnerClick === false) { // 在左边侧边click时scroll，在timeline视图中click时not scroll
                    //     const container_pre_pos = document.getElementById('container').scrollTop
                    //     console.log('container-scroll_move_old', container_pre_pos)
                    //     const translateY = self.eachBookPos[newVal.value].y
                    //     d3.transition()
                    //         .duration(time_duration)
                    //         .tween("scroll", TimeLineUpdate.scrollTween(container_pre_pos, translateY - 15))
                    //     console.log('container-scroll_move_new', document.getElementById('container').scrollTop)
                    // }
                    self.lastClick = newVal.value 
                }

                // 如果此时click的是location
                if (newVal.entity === 'locations') {
                    const func_para = {
                        curBookList: self.curBookList,
                        eachBookPos: self.eachBookPos,
                        rowHeight: self.rowHeight,
                        lastClick: self.lastClick,
                        lastClickArray: self.lastClickArray,
                        constraints: constraints
                    }
                    const output_para = TimeLineUpdate.location_selection_movement(func_para)
                    self.curBookList = output_para.all_book_list
                    self.eachBookPos = output_para.each_book_pos
                    self.curSvgLength = output_para.cur_max_len
                }

                // 如果此时click的是library_id
                if (newVal.entity === 'library_id') {
                    if (!self.ifInnerClickLib) { // 如果是其他视图click则动作，timeline内click不动作
                        const cur_book_list_plus_pos = TimeLineUpdate.select_library_movement(newVal.value, {
                        curBookList: self.curBookList,
                        eachBookPos: self.eachBookPos,
                        rowHeight: self.rowHeight,
                        lastClick: self.lastClick,
                        lastClickArray: self.lastClickArray
                        })
                        // 更新curBookList以及eachBookPos
                        self.curBookList = cur_book_list_plus_pos.cur_book_list
                        self.eachBookPos = cur_book_list_plus_pos.each_book_pos
                        self.curSvgLength = cur_book_list_plus_pos.cur_max_len
                        self.scrollTopContainer = 0
                        // setExportScrollTopValue(0)
                        } else {
                            self.alreadyLibPathSort = true // 更新alreadyLibPathSort，说明目前已经排序了(timeline视图内)
                        }
                } else if (newVal.entity === 'path') { // 如果此时click的是path
                    const path_return_para = TimeLineUpdate.select_path_movement(newVal.value, self.curBookList, self.eachBookPos, self.rowHeight, self.lastClick, self.lastClickArray, self.cur_view)
                    self.curBookList = path_return_para.all_book_list
                    self.eachBookPos = path_return_para.each_book_pos
                    self.curSvgLength = path_return_para.cur_max_len
                    self.pathCandidateList = path_return_para.path_included_list
                    self.scrollTopContainer = 0

                    self.alreadyLibPathSort = true // 更新alreadyLibPathSort，说明目前已经排序了
                    // console.log('到这里了哦')

                    for (let i  = 0; i < self.curBookList.length; i++) {
                        const cur_book_name = self.curBookList[i].book_name
                        const cur_book_event = self.curBookList[i].events
                        d3.select(`#${cur_book_name}-book_name`) // book_name恢复不加阴影的状态
                          .attr("filter", 'none')
                        for (let k = 0; k < cur_book_event.length; k++) {
                            if (newVal.value.includes(cur_book_event[k].lib_id)) {
                                d3.select(`#${cur_book_name}-event-circle-item-${(k + 1).toString()}`)
                                    .attr("filter", 'drop-shadow(3px 2px 2px rgb(0 0 0 / 0.6))')
                                    .attr("fill", type_color.library.bright[cur_book_event[k].lib_type])
                                d3.select(`#${cur_book_name}-event-lineLeft-${(k + 1).toString()}`)
                                    .attr("filter", 'drop-shadow(3px 2px 2px rgb(0 0 0 / 0.6))')
                                    .attr("stroke", type_color.library.bright[cur_book_event[k].lib_type])
                                d3.select(`#${cur_book_name}-event-lineRight-${(k + 1).toString()}`)
                                    .attr("filter", 'drop-shadow(3px 2px 2px rgb(0 0 0 / 0.6))')
                                    .attr("stroke", type_color.library.bright[cur_book_event[k].lib_type])
                            } else {
                                d3.select(`#${cur_book_name}-event-circle-item-${(k + 1).toString()}`)
                                    .attr("filter", 'none')
                                    .attr("fill", type_color.library[cur_book_event[k].lib_type])
                                d3.select(`#${cur_book_name}-event-lineLeft-${(k + 1).toString()}`)
                                    .attr("filter", 'none')
                                    .attr("stroke", type_color.library[cur_book_event[k].lib_type])
                                d3.select(`#${cur_book_name}-event-lineRight-${(k + 1).toString()}`)
                                    .attr("filter", 'none')
                                    .attr("stroke", type_color.library[cur_book_event[k].lib_type])
                            }       
                        }
                    }
                } else { // 如果是其他类型的selection
                    // 清空原本的selection path
                    self.pathCandidateList = [] // 用于标志可能组成path的bookList候选
                    self.lastLibrary = null // 用于标志上一次click的library
                    self.pathNameList = [] // 用于传入path的array
                }
            }
        },

        hover: function (newVal, oldVal) { // hover左边
            const constraints = {
                filter: this.filter,
                selection: this.selection,
                hover: this.hover,
            }
            console.log('hover', newVal, constraints)
            const that = this
            if (newVal.value === null) { // opacity全部恢复为1
                // if (this.filter.agent === null && this.filter.book === null && this.filter.library === null) {
                // // if (newVal.entity !== 'book_type' && newVal.entity !== 'library_type' && newVal.entity !== 'agent_type') {
                //     for (let book_name in this.eachBookState) {
                //         d3.select(`#${book_name}-group`)
                //           .style('opacity', 1)
                //         }
                // } else { // 如果是刷选类型的
                if (newVal.entity === 'book_type' || newVal.entity === 'lib_type' || newVal.entity === 'agent_type' || newVal.entity === 'locations') {
                    // 动画时禁止交互
                    // if (that.transitionOn) {
                    //     return
                    // }
                }

                // 存在bug，如果是library_id 或 path,直接返回不操作
                // if (newVal.entity === 'library' || newVal.entity === 'library_id' || newVal.entity === 'path') {
                //     // console.log('当前selection是library哟')
                //     return
                // }
                // 如果当前selection为path或library_id, 直接全部恢复成原本的颜色，不重排序，直接return
                if ((constraints.selection.entity === 'path' || constraints.selection.entity === 'library_id' || constraints.selection.entity === 'library') && constraints.selection.value !== null) {
                    // 如果此时是对于edition的un hover
                    // console.log('不用重排序啦')
                    let match_lib_id_list
                    if (constraints.selection.entity === 'path') {
                        match_lib_id_list = constraints.selection.value
                    } else {
                        match_lib_id_list = [constraints.selection.value]
                    }
                    // console.log('match_lib_id_list', match_lib_id_list)
                    for (let i  = 0; i < that.curBookList.length; i++) {
                        const cur_book_name = that.curBookList[i].book_name
                        const cur_book_event = that.curBookList[i].events
                        d3.select(`#${cur_book_name}-book_name`) // book_name恢复不加阴影的状态
                          .attr("filter", 'none')
                        for (let k = 0; k < cur_book_event.length; k++) {
                            if (match_lib_id_list.includes(cur_book_event[k].lib_id)) {
                                d3.select(`#${cur_book_name}-event-circle-item-${(k + 1).toString()}`)
                                    .attr("filter", 'drop-shadow(3px 2px 2px rgb(0 0 0 / 0.6))')
                                    .attr("fill", type_color.library.bright[cur_book_event[k].lib_type])
                                d3.select(`#${cur_book_name}-event-lineLeft-${(k + 1).toString()}`)
                                    .attr("filter", 'drop-shadow(3px 2px 2px rgb(0 0 0 / 0.6))')
                                    .attr("stroke", type_color.library.bright[cur_book_event[k].lib_type])
                                d3.select(`#${cur_book_name}-event-lineRight-${(k + 1).toString()}`)
                                    .attr("filter", 'drop-shadow(3px 2px 2px rgb(0 0 0 / 0.6))')
                                    .attr("stroke", type_color.library.bright[cur_book_event[k].lib_type])
                            } else {
                                d3.select(`#${cur_book_name}-event-circle-item-${(k + 1).toString()}`)
                                    .attr("filter", 'none')
                                    .attr("fill", type_color.library[cur_book_event[k].lib_type])
                                d3.select(`#${cur_book_name}-event-lineLeft-${(k + 1).toString()}`)
                                    .attr("filter", 'none')
                                    .attr("stroke", type_color.library[cur_book_event[k].lib_type])
                                d3.select(`#${cur_book_name}-event-lineRight-${(k + 1).toString()}`)
                                    .attr("filter", 'none')
                                    .attr("stroke", type_color.library[cur_book_event[k].lib_type])
                            }       
                        }
                    }
                    return // 直接返回，不再排序
                }

                // 如果当前的selection为locations，直接恢复成原本的颜色，不重排序，直接return
                if (constraints.selection.entity === 'locations' && constraints.selection.value !== null) {
                    const traj_list = constraints.selection.value.trajs // array
                    for (let i  = 0; i < that.curBookList.length; i++) {
                        const cur_book_name = that.curBookList[i].book_name
                        const cur_book_event = that.curBookList[i].events
                        d3.select(`#${cur_book_name}-book_name`) // book_name恢复不加阴影的状态
                          .attr("filter", 'none')
                        for (let k = 0; k < cur_book_event.length; k++) {
                            if (traj_list.includes(cur_book_event[k].ori_idx)) {
                                d3.select(`#${cur_book_name}-event-circle-item-${(k + 1).toString()}`)
                                    .attr("filter", 'drop-shadow(3px 2px 2px rgb(0 0 0 / 0.6))')
                                    .attr("fill", type_color.library.bright[cur_book_event[k].lib_type])
                                d3.select(`#${cur_book_name}-event-lineLeft-${(k + 1).toString()}`)
                                    .attr("filter", 'drop-shadow(3px 2px 2px rgb(0 0 0 / 0.6))')
                                    .attr("stroke", type_color.library.bright[cur_book_event[k].lib_type])
                                d3.select(`#${cur_book_name}-event-lineRight-${(k + 1).toString()}`)
                                    .attr("filter", 'drop-shadow(3px 2px 2px rgb(0 0 0 / 0.6))')
                                    .attr("stroke", type_color.library.bright[cur_book_event[k].lib_type])
                            } else {
                                d3.select(`#${cur_book_name}-event-circle-item-${(k + 1).toString()}`)
                                    .attr("filter", 'none')
                                    .attr("fill", type_color.library[cur_book_event[k].lib_type])
                                d3.select(`#${cur_book_name}-event-lineLeft-${(k + 1).toString()}`)
                                    .attr("filter", 'none')
                                    .attr("stroke", type_color.library[cur_book_event[k].lib_type])
                                d3.select(`#${cur_book_name}-event-lineRight-${(k + 1).toString()}`)
                                    .attr("filter", 'none')
                                    .attr("stroke", type_color.library[cur_book_event[k].lib_type])
                            }       
                        }
                    }
                    return // 直接返回，不再排序
                }

                // if (newVal.entity === 'china2japan' && !constraints.filter.china2japan) { // newValue = null
                //     TimeLineUpdate.recover_time_range_event_opacity(that.curBookList)
                // }

                // 返回后剩下的就是filter中的edition, book, agent, library了
                this.filterExcluded = TimeLineUpdate.filter_movement(constraints, this.data) // 更新所有filter条件下过滤掉的bookList
                let includedBookList = TimeLineUpdate.merge_book_list(this.filterExcluded, this.data) // 更新综合filter下来的bookList
                let excludeBookList = TimeLineUpdate.sub_array(Object.keys(this.data), includedBookList)

                includedBookList = TimeLineUpdate.add_bookList_attr(this.allBookDict, includedBookList)

                // 恢复time_range下的opacity
                if (constraints.filter.time_range !== null) {
                    if (constraints.filter.time_range[1] - constraints.filter.time_range[0] < 1005) { // 排除选择了全部年份跨度的情况
                        // 加入circle以及文字的opacity淡化显示
                        TimeLineUpdate.recover_time_range_event_opacity(this.curBookList) // 首先恢复所有的opacity
                        TimeLineUpdate.time_excluded_circle_text(constraints.filter.time_range, includedBookList, constraints.filter.china2japan) // 对于处于time_range范围内的book,但是不属于该时间段的event,设置opacity
                        includedBookList = TimeLineUpdate.time_range_sort(includedBookList, constraints.filter.time_range) // 对includedBookList进行重排序
                    } else { // 没有time_range的filter
                        TimeLineUpdate.recover_time_range_event_opacity(this.curBookList)
                        TimeLineUpdate.china2japan_movement(constraints.filter.china2japan, this.curBookList)
                    }
                } else { // 没有time_range的filter
                    TimeLineUpdate.recover_time_range_event_opacity(this.curBookList)
                    TimeLineUpdate.china2japan_movement(constraints.filter.china2japan, this.curBookList)
                }

                excludeBookList = TimeLineUpdate.add_bookList_attr(this.allBookDict, excludeBookList)

                // const curSeqArray = [...TimeLineUpdate.add_name_opacity(this.curBookList, 'included', constraints), ...TimeLineUpdate.add_name_opacity(excludeBookList, 'excluded', constraints)]// 当前按照顺序排的bookList
                const curSeqArray = TimeLineUpdate.add_name_opacity(includedBookList, 'included', constraints).concat(TimeLineUpdate.add_name_opacity(excludeBookList, 'excluded', constraints))
                // this.curBookList = curSeqArray
                // console.log('this.curBookList', this.curBookList)
                // 重新计算各行的排列位置
                
                // console.log('3~')
                if (!this.alreadyLibPathSort) {
                    this.curBookList = curSeqArray // alreadyLibPathSort为false时再让curBookList重排序
                    this.eachBookPos = BookTraj.reCalRowPos(curSeqArray, this.eachBookPos, this.rowHeight, this.lastClick, this.lastClickArray) // 首先获取更新前的所有book的position
                    let cur_max_length = 0 // 用于记录当前最大的长度
                    for (let i = 0; i < curSeqArray.length; i ++) {
                        const select_book = curSeqArray[i].book_name
                        d3.select(`#${select_book}-group`)
                            .transition()
                            .duration(time_duration / 4)
                            .attr('transform', `translate(0, ${this.eachBookPos[select_book].y.toString()})`)
                            .style('opacity', curSeqArray[i].opacity)
                            .on('start', function() {
                                // console.log('这里出问题了')
                                that.transitionOn = true
                                // if (that.additionBook.includes(select_book)) { // 否则会闪
                                //     that.transitionBookOn[select_book] = true
                                // } else {
                                //     that.transitionBookOn[select_book] = false
                                // }
                            })
                            .on('end', function() {
                                that.transitionOn = false
                                that.transitionBookOn[select_book] = false
                            })
                        // 更新cur_max_length
                        cur_max_length = Math.max(cur_max_length, this.eachBookPos[select_book].y + this.eachBookPos[select_book].height)
                    }
                    this.curSvgLength = cur_max_length
                    // 待补充判断是否在当前timeline视图的语句
                    // if (that.lastClick !== null) { // 如果hover移出后仍有select,且此时并非timeline视图，则需要scrollTo 当前选中的book的视野之中
                    //     const container_pre_pos = document.getElementById('container').scrollTop
                    //     console.log('container-scroll_move_new', document.getElementById('container').scrollTop)
                    //     const translateY = that.eachBookPos[that.lastClick].y
                    //     d3.transition()
                    //     .duration(1)
                    //     .tween("scroll", TimeLineUpdate.scrollTween(container_pre_pos, translateY - 15))
                    //     console.log('container-scroll_move_new', document.getElementById('container').scrollTop)
                    // }
                    
                    // 等待
                    // setTimeout(function() {
                    // }, 5000)
                    // 用于视图切换时使用，暂时不要
                    // if (that.selection.entity === 'edition' && that.selection.value !== null) { // 如果此时仍选择了另一本book
                    //     const container_pre_pos = document.getElementById('container').scrollTop
                    //     const translateY = that.eachBookPos[that.selection.value].y
                    //     d3.transition() // 同时scrollTo当前元素
                    //       .duration(100)
                    //       .tween("scroll", TimeLineUpdate.scrollTween(container_pre_pos, translateY - 15))
                    // }  
                }        
            }       

            if ((newVal.value === null || newVal.type === null) && oldVal.value !== null) { // 如果没有选中，则重新渲染
                // 动画时禁用交互
                // if (that.transitionOn) {
                //     return
                // }
                // 考虑filter以后hover的问题
                if (this.lastHover !== null && this.lastHover !== '文選') {
                    if (that.lastClick !== that.lastHover) {
                        // 取消hover该book时，恢复原本的颜色
                        const cur_hover_book = this.lastHover
                        const cur_book_event = that.data[cur_hover_book]
                        d3.select(`#${cur_hover_book}-book_name`) // book_name恢复不加阴影的状态
                          .attr("filter", 'none')
                        for (let k = 0; k < cur_book_event.length; k++) {
                            d3.select(`#${cur_hover_book}-event-circle-item-${(k + 1).toString()}`)
                                .attr("filter", 'none')
                                .attr("fill", type_color.library[cur_book_event[k].lib_type])
                            d3.select(`#${cur_hover_book}-event-lineLeft-${(k + 1).toString()}`)
                                .attr("filter", 'none')
                                .attr("stroke", type_color.library[cur_book_event[k].lib_type])
                            d3.select(`#${cur_hover_book}-event-lineRight-${(k + 1).toString()}`)
                                .attr("filter", 'none')
                                .attr("stroke", type_color.library[cur_book_event[k].lib_type])
                        }
                    }

                    if (this.eachBookState[this.lastHover].stay_state === false) {
                        d3.select(`#${this.lastHover}-group`).selectAll('.detailInfo').remove()
                        // 重新计算各行的排列位置
                        // 排除filter情况下的重新排序情况
                        if (this.filter.agent === null && this.filter.book === null && this.filter.library === null) {
                            // console.log('无filter~')
                            // this.backToTop()
                            if (this.filter.time_range === null) { // 最开始时商未刷选
                                // console.log('4~', constraints)
                                this.eachBookPos = BookTraj.reCalRowPos(this.curBookList, this.eachBookPos, this.rowHeight, this.lastClick, this.lastClickArray) // 首先获取更新前的所有book的position
                                let cur_max_length = 0 // 用于记录当前最大的长度
                                for (let book_name in this.eachBookPos) {
                                    d3.select(`#${book_name}-group`)
                                        .transition()
                                        .duration(time_duration / 2)
                                        .attr('transform', `translate(0,${this.eachBookPos[book_name].y})`)
                                        .style('opacity', 1) // 无filter,恢复opacity
                                        .on('start', function() {
                                            that.transitionOn = true
                                        })
                                        .on('end', function() {
                                            that.transitionOn = false
                                        })
                                    // 更新cur_max_length
                                    cur_max_length = Math.max(cur_max_length, this.eachBookPos[book_name].y + this.eachBookPos[book_name].height)
                                }
                                this.curSvgLength = cur_max_length

                            } else if (this.filter.time_range[1] - this.filter.time_range[0] >= 1005) { // 后续对时间进行全选
                                // console.log('4~', constraints)
                                this.eachBookPos = BookTraj.reCalRowPos(this.curBookList, this.eachBookPos, this.rowHeight, this.lastClick, this.lastClickArray) // 首先获取更新前的所有book的position
                                let cur_max_length = 0 // 用于记录当前最大的长度
                                for (let book_name in this.eachBookPos) {
                                    d3.select(`#${book_name}-group`)
                                        .transition()
                                        .duration(time_duration / 2)
                                        .attr('transform', `translate(0,${this.eachBookPos[book_name].y})`)
                                        .style('opacity', 1) // 无filter,恢复opacity
                                        .on('start', function() {
                                            that.transitionOn = true
                                        })
                                        .on('end', function() {
                                            that.transitionOn = false
                                        })
                                    // 更新cur_max_length
                                    cur_max_length = Math.max(cur_max_length, this.eachBookPos[book_name].y + this.eachBookPos[book_name].height)
                                }
                                this.curSvgLength = cur_max_length
                            }
                            // 如果只是简单的hover edition
                            if (this.hover.entity === 'edition') {
                                        return
                                    }
                        } else { // 如果鼠标移开后仍有filter存在
                            // console.log('3*~')
                            this.filterExcluded = TimeLineUpdate.filter_movement(constraints, this.data) // 更新所有filter条件下过滤掉的bookList
                            let includedBookList = TimeLineUpdate.merge_book_list(this.filterExcluded, this.data) // 更新综合filter下来的bookList
                            let excludeBookList = TimeLineUpdate.sub_array(Object.keys(this.data), includedBookList)

                            includedBookList = TimeLineUpdate.add_bookList_attr(this.allBookDict, includedBookList)
                            excludeBookList = TimeLineUpdate.add_bookList_attr(this.allBookDict, excludeBookList)

                            // const curSeqArray = [...TimeLineUpdate.add_name_opacity(this.curBookList, 'included', constraints), ...TimeLineUpdate.add_name_opacity(excludeBookList, 'excluded', constraints)]// 当前按照顺序排的bookList
                            const curSeqArray = TimeLineUpdate.add_name_opacity(includedBookList, 'included', constraints).concat(TimeLineUpdate.add_name_opacity(excludeBookList, 'excluded', constraints))
                            this.curBookList = curSeqArray
                            // 重新计算各行的排列位置
                            // console.log('3—time_range~')
                            // this.eachBookPos = BookTraj.reCalRowPos(curSeqArray, this.eachBookPos, this.rowHeight) // 首先获取更新前的所有book的position
                            this.eachBookPos = BookTraj.reCalRowPos(curSeqArray, this.eachBookPos, this.rowHeight, this.lastClick, this.lastClickArray) // 首先获取更新前的所有book的position
                            let cur_max_length = 0 // 用于记录当前最大的长度
                            for (let i = 0; i < curSeqArray.length; i ++) {
                                const select_book = curSeqArray[i].book_name
                                d3.select(`#${select_book}-group`)
                                    .transition()
                                    .duration(time_duration)
                                    .attr('transform', `translate(0, ${this.eachBookPos[select_book].y.toString()})`)
                                    .style('opacity', curSeqArray[i].opacity)
                                    .on('start', function() {
                                        that.transitionOn = true
                                    })
                                    .on('end', function() {
                                        that.transitionOn = false
                                    })
                                // 更新cur_max_length
                                cur_max_length = Math.max(cur_max_length, this.eachBookPos[select_book].y + this.eachBookPos[select_book].height)
                            }
                            this.curSvgLength = cur_max_length
                            // 等待
                            // setTimeout(function() {
                            // }, 5000)
                            // 如果只是简单的hover edition
                            if (this.hover.entity === 'edition') {
                                        return
                                    }
                            // 平移到最上方
                            this.backToTop()
                                }            
                    } else { return }
                }
            that.lastHover = null  
            } else {
                this.hover_click_handler()
            } 
        },
        transition: {
            handler: function (newVal, _) {
                this.transition_handler(newVal);
            },
            deep: true,
        },
        language: function(newVal, oldVal) { // 切换语言的接口
            const self = this
            console.log('timeLine切换语言', newVal)
            // this.data = get_book_traj().book_traj
            // this.rowHeight = this.rem * 2.5
            self.initializeTimeline()
            window.addEventListener('scroll', self.scrollEvent)
            if (newVal !== oldVal) {
                // 为了便于处理信息卡展开时的情况
                self.$store.commit("changeHover", {
                    entity: "edition",
                    value: null
                    })
            }          
        }
    },
    methods: {
        handleScroll (event){
            this.visible = window.scrollY != 0 ? true : false
            },
        backToTop() {
            // console.log(document.getElementById('論語注疏-group').scrollY)
            d3.transition()
                  .duration(time_duration)
                  .tween("scroll", TimeLineUpdate.scrollTween(document.getElementById('container').scrollTop, 0))
            this.scrollTopContainer = 0 // 更新当前窗口的scrollTop值
        },
        restoreYPos() { // 重新恢复timeline中y的位置
            const that = this
            for (let i = 0; i < this.curBookList.length; i ++) { // 用的是time_range范围内的curBookList
                d3.select(`#${this.curBookList[i].book_name}-group`)
                   .transition()
                   .duration(time_duration)
                   .attr('transform', `translate(0,${this.rowHeight * (i + 1)})`)
                   .style('opacity', 1) // 统一恢复设置为1
                   .on('start', function() {
                        that.transitionOn = true
                    })
                    .on('end', function() {
                        that.transitionOn = false
                    })
            }
        },
        hover_click_handler() { // hover操作(click之前一定会hover)
            const constraints = {
                filter: this.filter,
                selection: this.selection,
                hover: this.hover,
            }
            const that = this // de.select后this会重定向
            // console.log('constraints', constraints)

            if (constraints.hover.entity === 'edition' || constraints.hover.entity === 'book') { // 如果是hover单本书(目前没有考虑版本问题)
                this.lastHover = constraints.hover.value // 更新最新hover的book_name
                
                // 动画时禁止交互
                // if (that.transitionOn) {
                //     return
                // }

                // 下面一行暂时用不到
                // this.eachBookState = TimeLineUpdate.hover_single_book(constraints, this.eachBookState, this.ifInnerHover)       
                // this.singleBookDetailName = TimeLineUpdate.hover_book_detail(constraints, this.data, this.allBookList, this.svgShowSize)
                // for (let i = 0; i < that.curBookList.length; i ++) {
                //     if (that.curBookList[i].book_name !== constraints.selection.value) {
                //         that.eachBookPos[that.curBookList[i].book_name].stay_state = false
                //         d3.select(`#${that.curBookList[i].book_name}-group`).selectAll('.detailInfo').remove()
                //     }
                // }

                if (that.ifInnerHover === false && constraints.hover.value !== null && constraints.hover.value !== '文選') { // 在左边侧边hover时scroll，在timeline视图中hover时not scroll
                    const container_pre_pos = document.getElementById('container').scrollTop
                    const translateY = that.eachBookPos[constraints.hover.value].y
                    that.scrollTopContainer = translateY - 15
                    d3.transition()
                        .duration(time_duration / 3) // scrollTo当前edition所在的view
                        .tween("scroll", TimeLineUpdate.scrollTween(container_pre_pos, translateY - 15))
                }
                // 在click的时候再展示info_card
                // hover单本书，highlight
                if (constraints.hover.entity === 'edition' && constraints.hover.value !== null) {
                    const cur_hover_book = constraints.hover.value
                    const cur_book_event = that.data[cur_hover_book]
                    for (let k = 0; k < cur_book_event.length; k++) {
                        d3.select(`#${cur_hover_book}-event-circle-item-${(k + 1).toString()}`)
                            .attr("filter", 'drop-shadow(3px 2px 2px rgb(0 0 0 / 0.6))')
                            .attr("fill", type_color.library.bright[cur_book_event[k].lib_type])
                        d3.select(`#${cur_hover_book}-event-lineLeft-${(k + 1).toString()}`)
                            .attr("filter", 'drop-shadow(3px 2px 2px rgb(0 0 0 / 0.6))')
                            .attr("stroke", type_color.library.bright[cur_book_event[k].lib_type])
                        d3.select(`#${cur_hover_book}-event-lineRight-${(k + 1).toString()}`)
                            .attr("filter", 'drop-shadow(3px 2px 2px rgb(0 0 0 / 0.6))')
                            .attr("stroke", type_color.library.bright[cur_book_event[k].lib_type])
                        d3.select(`#${cur_hover_book}-book_name`)
                          .attr("filter", 'drop-shadow(2px 2px 1px rgb(0 0 0 / 0.2))')
                    }
                }
                
             
            } else { // 如果是book_type, lib_type, agent_type的hover
                // 此处逻辑修改为：hover类型时，只是opacity改变，而位置不改变
                // 动画时禁用交互
                // if (that.transitionOn) {
                //     return
                // }

                // 存在bug，选择library_id/path和filter不能共存
                if (constraints.hover.entity === 'library_id' || constraints.hover.entity === 'locations') {
                    if (constraints.selection.entity === 'path' || constraints.selection.entity === 'library_id' || constraints.selection.entity === 'locations') {
                        // console.log('当前selection是path/library_id哟')
                        return
                    }          
                }

                // constraints_para深拷贝constraints，修改前者的值不会影响后者
                let constraints_para = JSON.parse(JSON.stringify(constraints)) // 可修改，将hover的值传给filter
                if (constraints.hover.entity === 'book_type') {
                    constraints_para.filter.book = constraints.hover.value
                } else if (constraints.hover.entity === 'agent_type') {
                    constraints_para.filter.agent = constraints.hover.value
                } else if (constraints.hover.entity === 'library_type') {
                    constraints_para.filter.library = constraints.hover.value
                }

                console.log(constraints, constraints_para)

                // china2japan (新添加的，icon联动)
                if (constraints.hover.entity === 'china2japan') { // newValue = true
                    TimeLineUpdate.china2japan_movement(constraints.hover.value, that.curBookList)
                }


                this.filterExcluded = TimeLineUpdate.filter_movement(constraints_para, this.data) // 更新所有filter条件下过滤掉的bookList
                let includedBookList = TimeLineUpdate.merge_book_list(this.filterExcluded, this.data) // 更新综合filter下来的bookList
                let excludeBookList = TimeLineUpdate.sub_array(Object.keys(this.data), includedBookList)

                includedBookList = TimeLineUpdate.add_bookList_attr(this.allBookDict, includedBookList)
                excludeBookList = TimeLineUpdate.add_bookList_attr(this.allBookDict, excludeBookList)

                const curSeqArray = TimeLineUpdate.add_name_opacity(includedBookList, 'included', constraints).concat(TimeLineUpdate.add_name_opacity(excludeBookList, 'excluded', constraints))
                // this.curBookList = curSeqArray (暂时先不传递顺序)

                // console.log('this.curBookList', this.curBookList) // 用来看数据

                // 重新计算各行的排列位置
                // console.log('6~')
                this.eachBookPos = BookTraj.reCalRowPos(curSeqArray, this.eachBookPos, this.rowHeight, this.lastClick, this.lastClickArray) // 首先获取更新前的所有book的position
                let cur_max_length = 0 // 用于记录当前最大的长度
                for (let i = 0; i < curSeqArray.length; i ++) {
                    const select_book = curSeqArray[i].book_name
                    d3.select(`#${select_book}-group`)
                        .transition()
                        .duration(time_duration / 4)
                        // hover类型时，只是opacity改变，而位置不改变, translate注释掉
                        // .attr('transform', `translate(0, ${this.eachBookPos[select_book].y.toString()})`)
                        .style('opacity', curSeqArray[i].opacity)
                        .on('start', function() {
                            that.transitionOn = true
                        })
                        .on('end', function() {
                            that.transitionOn = false
                        })
                    // 更新cur_max_length
                    cur_max_length = Math.max(cur_max_length, this.eachBookPos[select_book].y + this.eachBookPos[select_book].height)
                }
                this.curSvgLength = cur_max_length

                // 等待
                // setTimeout(function() {
                // }, 5000)
                // 平移到最上方
                // this.backToTop()
                // const [includedBooksList, excludeBookList] =  TimeLineUpdate.hover_update(this.data, constraints, 'hover')
                // const curBookDict = TimeLineUpdate.reCalHoverPos(this.curBookList, includedBooksList, excludeBookList)[0]
                // // this.data = TimeLineUpdate.hover_update(this.data, constraints)
                // // this.initializeTimeline(this.data) 
                // for (let book_name in curBookDict) {
                //     d3.select(`#${book_name}-group`)
                //     .transition()
                //     .duration(600)
                //     .attr('transform', `translate(0,${curBookDict[book_name].transY})`)
                //     .style('opacity', curBookDict[book_name].opacity_num)
                // }
            }
            
        },
        filter_handler() { // filter操作(刷选年份)
            // 现在可以刷选“经、史、子、集”以及agent_type和lib_type
            const constraints = {
                filter: this.filter,
                selection: this.selection,
                hover: this.hover,
            }

            // 更新filter_state
            // const attrList = ['book', 'agent', 'library']
            // for (let index in attrList) {
            //     if (this.filter[attrList[index]] !== null) {
            //         this.filterState[attrList[index]] = true
            //     }
            // }

            // const [includedBooksList, excludeBookList] =  TimeLineUpdate.hover_update(this.data, constraints, 'filter')
            // let curBookDict
            // [curBookDict, this.curBookList] = TimeLineUpdate.reCalHoverPos(this.allBookList, includedBooksList, excludeBookList)
            // // this.data = TimeLineUpdate.hover_update(this.data, constraints)
            // // this.initializeTimeline(this.data) 
            // for (let book_name in curBookDict) {
            //     d3.select(`#${book_name}-group`)
            //        .transition()
            //        .duration(600)
            //        .attr('transform', `translate(0,${curBookDict[book_name].transY})`)
            //        .style('opacity', curBookDict[book_name].opacity_num)
            // }

            // this.filterExcluded = TimeLineUpdate.filter_movement(constraints, this.data) // 更新所有filter条件下过滤掉的bookList
            // this.curBookList = TimeLineUpdate.merge_book_list(this.filterExcluded, this.data) // 更新综合filter下来的bookList
            // const excludeBookList = TimeLineUpdate.sub_array(Object.keys(this.data), this.curBookList)

            // const curSeqArray = [...TimeLineUpdate.add_name_opacity(this.curBookList, 'included', constraints), ...TimeLineUpdate.add_name_opacity(excludeBookList, 'excluded', constraints)]// 当前按照顺序排的bookList
            // console.log('curSeqArray', curSeqArray)
            // // 重新计算各行的排列位置
            // console.log('7~')
            // this.eachBookPos = BookTraj.reCalRowPos(curSeqArray, this.eachBookPos, this.rowHeight) // 首先获取更新前的所有book的position
            // for (let i = 0; i < curSeqArray.length; i ++) {
            //     const select_book = curSeqArray[i].book_name
            //     d3.select(`#${select_book}-group`)
            //         .transition()
            //         .duration(600)
            //         .attr('transform', `translate(0, ${this.eachBookPos[select_book].y.toString()})`)
            //         .style('opacity', curSeqArray[i].opacity)
            // }
        },
        selection_handler() {

        },

        transition_handler(trans) {
            console.log(trans);
            const that = this

            const fr = trans.from;
            const to = trans.to;
            const st = trans.state;

            if (fr === "timeline" && st === "out") { // 从timeline视图往外走
                console.log("transition out");

                TimelineTransition.timeline_trans_out(4000, to, that.selection, that.filter)
                
                // let trans_data = trans_graph(this.data, constraints, to);
                // this.drawer.trans_start(constraints, to, trans_data);

                // by Yuchu Luo
                // to 'geomap', commit earlier to show the background map in advance.

                setTimeout(() => {
                    this.$store.commit("transCompleted", null)
                }, 4000 - 1000 * +(to === 'geomap'));
            } else if (to === "timeline" && st === "out") {
                console.log("preparing for transition")
                if (that.lastClick !== null) {
                    // 展开信息卡
                    TimeLineUpdate.showBookDetailCards(that.lastClick, that.data, that.svgShowSize)
                    // 重新计算各行的排列位置
                    // console.log('5~')
                    that.eachBookPos = BookTraj.reCalRowPos(that.curBookList, that.eachBookPos, that.rowHeight, that.lastClick, that.lastClickArray) // 首先获取更新前的所有book的position
                    let cur_max_length = 0 // 用于记录当前最大的长度
                    // 计算此时应该到达的scrollTop
                    const translateY = that.eachBookPos[that.lastClick].y
                    that.scrollTopContainer = translateY - 15
                    setExportBookPosDict(that.eachBookPos) // 更新一下export 的间距

                    for (let i = 0; i < that.curBookList.length; i ++) {
                        const select_book = that.curBookList[i].book_name
                        d3.select(`#${select_book}-group`)
                            .attr('transform', `translate(0, ${that.eachBookPos[select_book].y.toString()})`)
                        
                        // 更新cur_max_length
                        cur_max_length = Math.max(cur_max_length, that.eachBookPos[select_book].y + that.eachBookPos[select_book].height)
                    }
                    that.curSvgLength = cur_max_length
                } else { // 如果没有选择
                    that.backToTop()
                    setExportScrollTopValue(0)
                }
            } else if (to === 'timeline' && st === 'overlay') { // 2个视图更新重叠
                d3.select('#container').style('opacity', 0)
                // 在此状态进行修改
                // 待补充判断是否在当前timeline视图的语句
                if (that.lastClick !== null) { // 如果hover移出后仍有select,且此时并非timeline视图，则需要scrollTo 当前选中的book的视野之中
                    const container_pre_pos = document.getElementById('container').scrollTop
                    const translateY = that.eachBookPos[that.lastClick].y
                    that.scrollTopContainer = translateY - 15 // 待改动（out阶段已经添加，稍有冗余）
                    // document.getElementById('container').scrollTo(0, translateY - 15)
                    setExportBookPosDict(that.eachBookPos) // 更新一下export 的间距
                    d3.transition()
                        .duration(0)
                        .tween("scroll", TimeLineUpdate.scrollTween(container_pre_pos, translateY - 15))
                } else { // 如果此时没有选中单个edition
                    that.backToTop()
                }

                setTimeout(() => {
                    d3.select('.timeLineSvg')
                        .style('opacity', 0)
                        .transition()
                        .duration(that.overlay_duration)
                        .style('opacity', 1)
                    d3.select('#container')
                      .style('opacity', 0)
                      .transition()
                      .duration(that.overlay_duration)
                      .style('opacity', 1)
                }, 0)

            } else if (to === "timeline" && st === "in") { // 正在从其他视图切换到timeline视图
                console.log("transition in");
                setTimeout(() => {
                    this.$store.commit("transCompleted", null);
                }, 1000);
                // this.initializeTimeline()
            }
        },
        async initializeTimeline() {
            // 强制切换视图为timeline
            // this.$store.commit("changeCurViewForce", "timeline")
            
            const that = this
            this.svg = d3
                .select(this.$el)
                .attr("width", this.canvas_width)
                .attr("height", this.canvas_height)

            // let width = this.canvas_width
            let width = document.getElementsByClassName('main-panel')[0].clientWidth
            // let height = $(this.$el).height();
            let height = this.rowHeight * (Object.keys(this.data).length + 2)
            // console.log('timeLineSize', [width, height])

            d3.select("#container").attr("width", width).attr("height", this.canvas_height)
            d3.select("#main-view").attr("width", width).attr("height", this.canvas_height)

            // create svg
            // this.svg = d3.select(this.$el);
            d3.select('#timeLineSVG').selectAll('g').remove()
            const svg = d3.select('#timeLineSVG')

            svg.attr('height', height)
            that.curSvgLength = height // 初始化curSvgLength的长度

            // 首先添加一层透明的svg，用于点击“空白处”时取消选择
            const unselected_layer = svg.append('g')
            unselected_layer
                .append("rect")
                .attr("x", 0)
                .attr("width", width * (1 - margin.left))
                .attr("height", height)
                .attr("fill-opacity", 0)
                // .on("click", () => {
                //     this.alreadyLibPathSort = false
                //     that.$store.commit("changeSelection", {
                //         entity: "edition",
                //         value: null
                //     })
                // })
                .on("click", () => {
                    that.alreadyLibPathSort = false
                    that.$store.commit("changeSelection", {
                        entity: "library_id",
                        value: null
                    })
                    that.$store.commit("changeSelection", {
                        entity: "path",
                        value: null
                    })
                    that.$store.commit("changeSelection", {
                        entity: "edition",
                        value: null
                    })
                    that.$store.commit("changeSelection", {
                        entity: "editions",
                        value: null
                    })
                    that.$store.commit("changeSelection", {
                        entity: "locations",
                        value: null
                    })
                })
            unselected_layer
                .append("rect")
                .attr("x", margin.left * width)
                .attr("width", (1 - margin.right - margin.left) * width)
                .attr("height", height)
                .attr("fill-opacity", 0)
                // 暂时注释掉
                // .on("click", () => { // 待改进，尚未添加agent
                //     if (that.selection.entity === 'library_id' || that.selection.entity === 'agent') {
                //         that.alreadyLibPathSort = false
                //         that.$store.commit("changeSelection", {
                //         entity: "library_id",
                //         value: null
                //     }) } else if (that.selection.entity === 'path') {
                //         this.alreadyLibPathSort = false
                //         that.$store.commit("changeSelection", {
                //         entity: "path",
                //         value: null
                //     })

                //     }    
                // })
                .on("click", () => {
                    that.alreadyLibPathSort = false
                    that.$store.commit("changeSelection", {
                        entity: "library_id",
                        value: null
                    })
                    that.$store.commit("changeSelection", {
                        entity: "path",
                        value: null
                    })
                    that.$store.commit("changeSelection", {
                        entity: "edition",
                        value: null
                    })
                    that.$store.commit("changeSelection", {
                        entity: "editions",
                        value: null
                    })
                    that.$store.commit("changeSelection", {
                        entity: "locations",
                        value: null
                    })
                })

            this.timeline = svg.append("g").attr('class', 'timeLineSvg');

            // timescale
            let events = [];
            for (let book in this.data) {
                events.push(...this.data[book]) // 将obj转化为array
                that.tagPosDict[book] = [] // 用于标记每个tag是否显示，初始化为空列表
            } 

            let min_year = d3.min(events, (d) => d.time_info.timestamp);
            let max_year = d3.max(events, (d) => d.time_info.timestamp);
            // console.log('min, max', [new Date(min_year, 1, 1), new Date(max_year, 1, 1)]) // timeRange
            this.timescale = d3
                .scaleTime()
                // .domain([new Date(min_year, 1, 1), new Date(max_year, 1, 1)])
                .domain([new Date(960, 1, 1), new Date(1965, 1, 1)]) // 为了绘图美观，前后延伸了15年
                .range([margin.left * width, (1 - margin.right) * width]);

            this.drawTimeline(this.data);
        },
        drawTimeline(data) {
            const self = this
            let width = document.getElementsByClassName('main-panel')[0].clientWidth
            let book_list = [];
            console.log('Translate', Translate)

            // 用于计算各个属性的文字长度
            let text_length = {
                library: 0,
                agent: 0,
                action: 0,
                ancient_time: 0,
                location: 0
            }

            for (let book in data) {
                data[book] = BookTraj.time_info_rehandle(data[book])
                for (let event in data[book]) {
                    data[book][event].library = BookTraj.handle_library_name(data[book][event].library)

                    // computing
                    text_length.library = text_length.library < data[book][event].library.length ? data[book][event].library.length : text_length.library
                    text_length.agent = text_length.agent < data[book][event].agent.length ? data[book][event].agent.length : text_length.agent
                    text_length.action = text_length.action < data[book][event].經手方式.length ? data[book][event].經手方式.length : text_length.action
                    text_length.ancient_time = text_length.ancient_time < data[book][event].時間.length ? data[book][event].時間.length : text_length.ancient_time
                    text_length.location = text_length.location < data[book][event].location_std_new.length ? data[book][event].location_std_new.length : text_length.location
                }
                
                book_list.push({
                    book_name: book,
                    book_name_lang: Translate.book_name_lang[book],
                    events: data[book],
                    ifShow: true,
                    transY: null,
                    opacity: 1
                })

                // init bookDetailDict, eachBookDict, eachBookPos
                // self.bookDetailDict[book] = false // 用于标示每本书是否显示了detail_info
                self.eachBookState[book] = {
                    stay_state: false, // boolean
                    hover: null,
                    selection: null
                }
                self.eachBookPos[book] = {
                    y: 0,
                    height: 40
                }
                // 用于标志每本书展开单本书细节的transition
                self.transitionBookOn[book] = false
            }
            console.log('timeline text length', text_length)

            // init curBookList, allBookList
            // BookTraj.cur_timeline_layout() // 用于测试是否可以实时传值
            // 默认按照到日本的时间进行排序
            self.curBookList = TimeLineUpdate.reorder_list(book_list, 'default', null) 
            console.log('book_list', self.curBookList)
            // self.curBookList = book_list
            self.allBookDict = TimeLineUpdate.trans_list2dict(self.curBookList)

            let book = self.timeline
                .selectAll("g")
                .data(self.curBookList)
                .join("g")
                .attr(
                    "transform",
                    function(d, i) {
                        self.eachBookPos[d.book_name].y = self.rowHeight * (i + 1) // 更新每本书的y坐标
                        return `translate(0,${self.rowHeight * (i + 1)})`
                    }
                )
                .attr('id', (d) => `${d.book_name}-group`)
            
            let event = book
                .selectAll("g")
                .data((d) => d.events)
                .join("g")
                .attr('id', (d, i) => `${d.書名}-event-${(i + 1).toString()}`) // 为每一本book的每一个event group设置id

            // set color, 后续改进
            // const library = ['#d0494b', '#a34e49', '#cc9999', '#e2c027', '#dfbe96', '#cfccc9']
            // const agent = ['#9c3738', '#7d3c38', '#8f6b6b', '#a88f1d', '#9e8869', '#949290']
            // const colorCircle = d3.scaleOrdinal(library)

            // book event tooltip(弃用)
            const bookEventTooltip = self.timeline.append('g').style('pointer-events', 'none').attr('class', 'tooltipCircle')
            
            // circle mousemove func
            const bookCircleTooltipOn = function(event) {
                //  bookEventTooltip.style('display', null)
                // console.log('circle_book_name', event.srcElement.__data__.書名)

                //  const yTrans = BookTraj.transform2num(this.parentNode.parentNode.getAttribute('transform')) // string
                //  bookEventTooltip.attr('transform', `translate(${self.timescale(new Date(event.srcElement.__data__.time_info.timestamp, 1, 1))},${yTrans})`)

                //  const pathTooltip = bookEventTooltip.selectAll('path')
                //     .data([100, 100])
                //     .join('path')
                //     .attr('fill', 'white')
                //     .attr('stroke', '#553624')
                // const circleNameContent = `${event.srcElement.__data__.library}\n${event.srcElement.__data__.agent}`
                // const circleTooltipText = bookEventTooltip.selectAll('text')
                //                                     .data(['', ''])
                //                                     .join('text')
                //                                     .call(text => text
                //                                         .selectAll('tspan')
                //                                         .data(circleNameContent.split(/\n/))
                //                                         .join('tspan')
                //                                         .attr('x', 0)
                //                                         .attr('y', (_, i) => `${i * 1.1}em`)
                //                                         .attr('font-weight', (_, i) => i ? null : 'bold')
                //                                         // .attr('font-family', 'FZQINGKBYSJF')
                //                                         .attr('fill', '#553624')
                //                                         .text(d => d))
                // const { y, width: w, height: h } = circleTooltipText.node().getBBox()
                // circleTooltipText.attr('transform', `translate(${-w / 2},${15 - y})`)
                // pathTooltip.attr('d', `M${-w / 2 - 10},5H-5l5,-5l5,5H${w / 2 + 10}v${h + 20}h-${w + 20}z`) // tooltip的形状

                // if (self.transitionOn) { //动画过程中禁止交互
                //     return
                // }

                // const hover_lib_name = event.srcElement.__data__.library
                const hover_lib_name = event.srcElement.__data__.lib_id
                const hover_book_idx = event.srcElement.__data__.ori_idx
                self.lastAgentLib = hover_lib_name // 更新lastAgentLib
                // self.$store.commit("changeHover", {
                //     entity: "edition",
                //     value: self.lastHover
                // })
                
                // 高亮属于同一个机构的circle以及text
                for (let i = 0; i < self.curBookList.length; i ++) {
                    const select_book = self.curBookList[i].book_name
                    const cur_book_events = self.curBookList[i].events
                    for (let j = 0; j < cur_book_events.length; j++) {
                        if (cur_book_events[j].lib_id === hover_lib_name) {
                            // 显示标签(原本被隐藏掉的)
                            if(cur_book_events[j].ori_idx === hover_book_idx && self.tagPosDict[select_book][j] === false) { // 如果是当前hover的那本书 && 当前标签不显示
                                // console.log(cur_book_events[j].ori_idx, hover_book_idx, self.tagPosDict[select_book][j], d3.select(`.${select_book}-tag-${(j + 1).toString()}`))
                                d3.select(`.${select_book}-tag-${(j + 1).toString()}`)
                                    .style('visibility', 'visible')
                                // d3.select(`.${select_book}-tag-${j.toString()}`)
                                //     .style('visibility', 'hidden')

                                // 重新调整该row的显示标签
                                const newTagRowPosList = TimeLineUpdate.adjust_row_tag_show(j, select_book, cur_book_events, self.tagPosDict[select_book])
                                for (let k = 0; k < cur_book_events.length; k++) {
                                    d3.select(`.${select_book}-tag-${(k + 1).toString()}`)
                                        .style('visibility', newTagRowPosList[k] === true? 'visible': 'hidden')
                                }
                            }
                            
                            d3.select(`#${select_book}-event-circle-item-${(j + 1).toString()}`)
                                .attr("filter", 'drop-shadow(3px 2px 2px rgb(0 0 0 / 0.6))')
                                .attr("fill", type_color.library.bright[cur_book_events[j].lib_type])
                            d3.select(`#${select_book}-event-lineLeft-${(j + 1).toString()}`)
                                .attr("filter", 'drop-shadow(3px 2px 2px rgb(0 0 0 / 0.6))')
                                .attr("stroke", type_color.library.bright[cur_book_events[j].lib_type])
                            d3.select(`#${select_book}-event-lineRight-${(j + 1).toString()}`)
                                .attr("filter", 'drop-shadow(3px 2px 2px rgb(0 0 0 / 0.6))')
                                .attr("stroke", type_color.library.bright[cur_book_events[j].lib_type])
                            // d3.select(`#${select_book}-event-uncertain-circle${(j + 1).toString()}`)
                            //     .selectAll('circle')
                            //     .attr("filter", 'drop-shadow(3px 2px 2px rgb(0 0 0 / 0.6))')
                            //     .attr("fill", type_color.library.bright[cur_book_events[j].lib_type])
                            d3.select(`.${select_book}-tag-${(j + 1).toString()}`)
                                .attr("filter", 'drop-shadow(2px 2px 1px rgb(0 0 0 / 0.2))')
                                // .style('visibility', 'visible')
                            d3.select(`.${select_book}-book_name`)
                                .attr("filter", 'drop-shadow(2px 2px 1px rgb(0 0 0 / 0.2))')
                        } else {
                        }
                    }
                }
            }
            // circle, 与text_tag共用
            const bookCircleTooltipOff = function(event) {
                // bookEventTooltip.style('display', 'none')
                // bookEventTooltip.node().value = null

                // if (self.transitionOn) { // 动画过程中禁止交互
                //     return
                // }
                let lib_id_list = []
                if (self.selection.value !== null && self.selection.entity === 'library_id') {
                    lib_id_list = [self.selection.value]
                } else if (self.selection.value !== null && self.selection.entity === 'path') {
                    lib_id_list = self.selection.value
                }

                // 恢复到原来的color和shadow
                // 判断当前是否处在selection为locations的case
                let cur_traj_list = []
                if (self.selection.entity === 'locations' && self.selection.value !== null) {
                    cur_traj_list = self.selection.value.trajs // array
                }
                for (let i = 0; i < self.curBookList.length; i ++) {
                    const select_book = self.curBookList[i].book_name            
                    const cur_book_events = self.curBookList[i].events
                    for (let j = 0; j < cur_book_events.length; j++) {
                        // 恢复tag default显示
                        d3.select(`.${select_book}-tag-${(j + 1).toString()}`)
                            .style('visibility', self.tagPosDict[select_book][j] ? 'visible': 'hidden')
                        // if (cur_book_events[j].lib_id === self.lastAgentLib && cur_book_events[j].lib_id !== self.selection.value) {
                        if (!lib_id_list.includes(cur_book_events[j].lib_id) && !(cur_traj_list.length > 0 && cur_traj_list.includes(cur_book_events[j].ori_idx))) {
                            d3.select(`#${select_book}-event-circle-item-${(j + 1).toString()}`)
                                .attr("filter", 'none')
                                .attr("fill", type_color.library[cur_book_events[j].lib_type])
                            d3.select(`#${select_book}-event-lineLeft-${(j + 1).toString()}`)
                                .attr("filter", 'none')
                                .attr("stroke", type_color.library[cur_book_events[j].lib_type])
                            d3.select(`#${select_book}-event-lineRight-${(j + 1).toString()}`)
                                .attr("filter", 'none')
                                .attr("stroke", type_color.library[cur_book_events[j].lib_type])
                            // d3.select(`#${select_book}-event-uncertain-circle${(j + 1).toString()}`)
                            //     .selectAll('circle')
                            //     .attr("filter", 'none')
                            //     .attr("fill", type_color.library[cur_book_events[j].lib_type])
                            // console.log(d3.select(`.${select_book}-tag-${(j + 1).toString()}`))
                            d3.select(`.${select_book}-tag-${(j + 1).toString()}`)
                                .attr("filter", 'none')
                                // 恢复default tag显示
                                .style('visibility', self.tagPosDict[select_book][j] ? 'visible': 'hidden')
                        }       
                    }
                }

                if (self.selection.entity === 'editions' && self.selection.value !== null) {
                    const book_list = self.selection.value // array
                    for (let i  = 0; i < self.curBookList.length; i++) {
                        const cur_book_name = self.curBookList[i].book_name
                        const cur_book_event = self.curBookList[i].events
                        // d3.select(`#${cur_book_name}-book_name`) // book_name恢复不加阴影的状态
                        //   .attr("filter", 'none')
                        for (let k = 0; k < cur_book_event.length; k++) {
                            if (book_list.includes(cur_book_name)) {
                                // console.log('核对上啦', cur_book_name)
                                d3.select(`#${cur_book_name}-event-circle-item-${(k + 1).toString()}`)
                                    .attr("filter", 'drop-shadow(3px 2px 2px rgb(0 0 0 / 0.6))')
                                    .attr("fill", type_color.library.bright[cur_book_event[k].lib_type])
                                d3.select(`#${cur_book_name}-event-lineLeft-${(k + 1).toString()}`)
                                    .attr("filter", 'drop-shadow(3px 2px 2px rgb(0 0 0 / 0.6))')
                                    .attr("stroke", type_color.library.bright[cur_book_event[k].lib_type])
                                d3.select(`#${cur_book_name}-event-lineRight-${(k + 1).toString()}`)
                                    .attr("filter", 'drop-shadow(3px 2px 2px rgb(0 0 0 / 0.6))')
                                    .attr("stroke", type_color.library.bright[cur_book_event[k].lib_type])
                            } else {
                                d3.select(`#${cur_book_name}-event-circle-item-${(k + 1).toString()}`)
                                    .attr("filter", 'none')
                                    .attr("fill", type_color.library[cur_book_event[k].lib_type])
                                d3.select(`#${cur_book_name}-event-lineLeft-${(k + 1).toString()}`)
                                    .attr("filter", 'none')
                                    .attr("stroke", type_color.library[cur_book_event[k].lib_type])
                                d3.select(`#${cur_book_name}-event-lineRight-${(k + 1).toString()}`)
                                    .attr("filter", 'none')
                                    .attr("stroke", type_color.library[cur_book_event[k].lib_type])
                            }       
                        }
                    }
                }
                self.lastAgentLib = null // 更新lastAgentLib

                // self.lastAgentLib = null // 更新lastAgentLib
                // self.$store.commit("changeHover", {
                //         entity: "edition",
                //         value: null,
                //     })
            }

            // text tag pointerenter(这里仅按照library进行highlight)
            const text_tag_pointer_enter = function(event) {
                const classTag = event.srcElement.getAttribute('class') // 获取当前click的类别（agent_text/lib_text）
                // const matchName = event.srcElement.__data__ // 所要匹配的机构/人物姓名
                // const book_name_click = event.srcElement.parentElement.__data__.書名

                // if (self.transitionOn) { //动画过程中禁止交互
                //     return
                // }

                const hover_lib_name = event.srcElement.parentElement.__data__.lib_id
                // if (classTag === 'agent_text') {
                //     hover_lib_name = event.srcElement.parentElement.__data__.agent
                // } else {
                //     hover_lib_name = event.srcElement.parentElement.__data__.library
                // }
                if (classTag === 'agent_text') {
                    return
                }
                self.lastAgentLib = hover_lib_name // 更新lastAgentLib

                for (let i = 0; i < self.curBookList.length; i ++) {
                    const select_book = self.curBookList[i].book_name
                    const cur_book_events = self.curBookList[i].events
                    for (let j = 0; j < cur_book_events.length; j++) {
                        if (cur_book_events[j].lib_id === hover_lib_name) {
                            d3.select(`#${select_book}-event-circle-item-${(j + 1).toString()}`)
                                .attr("filter", 'drop-shadow(3px 2px 2px rgb(0 0 0 / 0.6))')
                                .attr("fill", type_color.library.bright[cur_book_events[j].lib_type])
                            d3.select(`#${select_book}-event-lineLeft-${(j + 1).toString()}`)
                                .attr("filter", 'drop-shadow(3px 2px 2px rgb(0 0 0 / 0.6))')
                                .attr("stroke", type_color.library.bright[cur_book_events[j].lib_type])
                            d3.select(`#${select_book}-event-lineRight-${(j + 1).toString()}`)
                                .attr("filter", 'drop-shadow(3px 2px 2px rgb(0 0 0 / 0.6))')
                                .attr("stroke", type_color.library.bright[cur_book_events[j].lib_type])
                            // d3.select(`#${select_book}-event-uncertain-circle${(j + 1).toString()}`)
                            //     .selectAll('circle')
                            //     .attr("filter", 'drop-shadow(3px 2px 2px rgb(0 0 0 / 0.6))')
                            //     .attr("fill", type_color.library.bright[cur_book_events[j].lib_type])
                            d3.select(`.${select_book}-tag-${(j + 1).toString()}`)
                                .attr("filter", 'drop-shadow(2px 2px 1px rgb(0 0 0 / 0.2))')
                            d3.select(`.${select_book}-book_name`)
                                .attr("filter", 'drop-shadow(2px 2px 1px rgb(0 0 0 / 0.2))')
                        } else {
                        }
                    }
                }
            }

            // library, agent click_interaction
            const clickLibAgent = function(event) {
                // console.log('clickLibAgent', event)
                
                // 动画时禁用交互
                // if (self.transitionOn) {
                //     return
                // }

                // console.log('clickLibAgent', event.srcElement.parentElement.__data__.書名) // 获取当前click的类别（agent_text/lib_text）
                const classTag = event.srcElement.getAttribute('class') // 获取当前click的类别（agent_text/lib_text）
                // const matchName = event.srcElement.__data__ // 所要匹配的机构/人物姓名
                const matchName = event.srcElement.parentElement.__data__.lib_id
                const book_name_click = event.srcElement.parentElement.__data__.書名
                self.ifInnerClickLib = true
                // self.$store.commit("changeHover", { // 更新全局的selection
                //     entity: "edition",
                //     value: book_name_click
                // })
                if (classTag === 'agent_text') {
                    self.$store.commit("changeSelection", { // 更新全局的selection
                    entity: "agent",
                    value: matchName
                    })
                } else {
                    self.$store.commit("changeSelection", {
                    entity: "library_id",
                    value: event.srcElement.parentElement.__data__.lib_id,
                })
                }

                // setTimeout(function() {
                // }, 5000)

                // 在classTag为lib_text的情况下寻找path
                if (classTag === 'lib_text') {
                    // 判断此时是path还是library_id
                    let commit_path = false
                    if (self.pathCandidateList.length > 0) {
                        commit_path = TimeLineUpdate.find_path(self.pathCandidateList, self.pathNameList, matchName)
                    }

                    if (commit_path) {
                        self.pathNameList.push(event.srcElement.__data__.lib_id)
                        self.pathNameList = Array.from(new Set(self.pathNameList))
                        self.$store.commit("changeSelection", {
                        entity: "path",
                        value: self.pathNameList
                        })
                        return // 接下来就交给selection中的path情况响应
                    } else {
                        self.lastLibrary = matchName // 更新上一次click的library
                        self.pathNameList = [self.lastLibrary] // 重新初始化pathNameList
                    }
                }
                const translateY1 = self.eachBookPos[book_name_click].y // 未改变之前的y
                self.fitBookNumber = 0 // 归零

                // console.log('matchName', matchName)
                const sortLibAgent = TimeLineUpdate.clickSingleLibAgentSort(self.curBookList, 'lib_text', matchName)
                self.curBookList = sortLibAgent.new_list
                self.fitBookNumber = sortLibAgent.fit_num
                self.pathCandidateList = sortLibAgent.path_candidate // 更新candidate_path的bookList

                self.eachBookPos = BookTraj.reCalRowPos(self.curBookList, self.eachBookPos, self.rowHeight, self.lastClick, self.lastClickArray) // 首先获取更新前的所有book的position
                const translateY2 = self.eachBookPos[book_name_click].y // 改变之后的y

                let cur_max_length = 0 // 用于记录当前最大的长度
                for (let i = 0; i < self.curBookList.length; i ++) {
                    const select_book = self.curBookList[i].book_name
                    // 用于恢复之前opacity的
                    // d3.select(`#${select_book}-group`).style('opacity', 1)

                    d3.select(`#${select_book}-group`)
                        // .style('opacity', i < self.fitBookNumber? '1' : '0.4' ) // 对于不符合条件的设置opacity
                        .style('opacity', () => { // 对于不符合条件的设置opacity
                            if (i < self.fitBookNumber && self.curBookList[i].opacity === 1) {
                                return 1
                            } else if (i < self.fitBookNumber && self.curBookList[i].opacity !== 1) {
                                return 0.6
                            } else { return 0.4 }
                        })
                        .transition()
                        .duration(time_duration)
                        .attr('transform', `translate(0, ${self.eachBookPos[select_book].y.toString()})`)
                        .on('start', function() {
                            self.transitionOn = true
                        })
                        .on('end', function() {
                            self.transitionOn = false
                        })
                    // 更新cur_max_length
                    cur_max_length = Math.max(cur_max_length, self.eachBookPos[select_book].y + self.eachBookPos[select_book].height)

                    self.alreadyLibPathSort = true // 更新alreadyLibPathSort，说明目前已经排序了

                    // 对于符合条件的agent/library(针对event)→highlight
                    const cur_book_events = self.curBookList[i].events
                    let highlight_book_name = false // 用于标记是否需要高亮当前书名
                    for (let j = 0; j < cur_book_events.length; j++) {
                        let key_type = 'library'
                        if (classTag === 'agent_text') {
                            key_type = 'agent'
                        } else {
                            key_type = 'library'
                        }
                        if (cur_book_events[j][key_type] === matchName) { // 如果当前circle匹配
                            d3.select(`#${select_book}-event-circle-item-${(j + 1).toString()}`)
                                .attr("filter", 'drop-shadow(3px 2px 2px rgb(0 0 0 / 0.6))')
                                .attr("fill", type_color.library.bright[cur_book_events[j].lib_type])
                            d3.select(`#${select_book}-event-lineLeft-${(j + 1).toString()}`)
                                .attr("filter", 'drop-shadow(3px 2px 2px rgb(0 0 0 / 0.6))')
                                .attr("stroke", type_color.library.bright[cur_book_events[j].lib_type])
                            d3.select(`#${select_book}-event-lineRight-${(j + 1).toString()}`)
                                .attr("filter", 'drop-shadow(3px 2px 2px rgb(0 0 0 / 0.6))')
                                .attr("stroke", type_color.library.bright[cur_book_events[j].lib_type])
                            // d3.select(`#${select_book}-event-uncertain-circle${(j + 1).toString()}`)
                            //     .selectAll('circle')
                            //     .attr("filter", 'drop-shadow(3px 2px 2px rgb(0 0 0 / 0.6))')
                            //     .attr("fill", type_color.library.bright[cur_book_events[j].lib_type])
                            // console.log(d3.select(`.${select_book}-tag-${(j + 1).toString()}`))
                            d3.select(`.${select_book}-tag-${(j + 1).toString()}`)
                                .attr("filter", 'drop-shadow(2px 2px 1px rgb(0 0 0 / 0.2))')
                            highlight_book_name = true
                        } else { // 用于恢复之前highlight的
                            d3.select(`#${select_book}-event-circle-item-${(j + 1).toString()}`)
                                .attr("filter", 'none')
                                .attr("fill", type_color.library[cur_book_events[j].lib_type])
                            d3.select(`#${select_book}-event-lineLeft-${(j + 1).toString()}`)
                                .attr("filter", 'none')
                                .attr("stroke", type_color.library[cur_book_events[j].lib_type])
                            d3.select(`#${select_book}-event-lineRight-${(j + 1).toString()}`)
                                .attr("filter", 'none')
                                .attr("stroke", type_color.library[cur_book_events[j].lib_type])
                            // d3.select(`#${select_book}-event-uncertain-circle${(j + 1).toString()}`)
                            //     .selectAll('circle')
                            //     .attr("filter", 'none')
                            //     .attr("fill", type_color.library[cur_book_events[j].lib_type])
                            // console.log(d3.select(`.${select_book}-tag-${(j + 1).toString()}`))
                            d3.select(`.${select_book}-tag-${(j + 1).toString()}`)
                                .attr("filter", 'none')
                        }
                    }
                    if (highlight_book_name) { // 用于判断是否要高亮当前书名
                        d3.select(`#${select_book}-book_name`)
                          .attr("filter", 'drop-shadow(2px 2px 1px rgb(0 0 0 / 0.2))')
                    } else {
                        d3.select(`#${select_book}-book_name`)
                          .attr("filter", 'none')
                    }
                }
                self.curSvgLength = cur_max_length
                          
                // const translate_match = 'translate(0,'            
                // let translateY = d3.select(`#${book_name_click}-group`).node().getAttribute('transform').replace(translate_match, '').replace(')', '')
                // translateY = Number(translateY)
               
                // console.log('container', document.getElementById('container').scrollTop)
                const prev_pos_container = document.getElementById('container').scrollTop
                self.scrollTopContainer = translateY2 - translateY1 + prev_pos_container
                
                d3.transition()
                  .duration(time_duration)
                  .tween("scroll", TimeLineUpdate.scrollTween(prev_pos_container, translateY2 - translateY1 + prev_pos_container))
                // document.getElementById('container')
                //         .scrollTo({top: translateY2 - translateY1 + prev_pos_container, behavior: "smooth"}) 
            }
            // click event circle
            const clickLibCircle = function(event) {
                // 动画时禁用交互
                // if (self.transitionOn) {
                //     return
                // }
                // console.log(event)

                const classTag = 'lib_text' // 获取当前click的类别（agent_text/lib_text）
                const matchName = event.srcElement.__data__.lib_id // 所要匹配的机构/人物姓名
                const book_name_click = event.srcElement.__data__.書名
                // self.$store.commit("changeHover", { // 更新全局的selection
                //     entity: "edition",
                //     value: book_name_click
                // })

                // self.$store.commit("changeSelection", { // 更新全局的selection
                //     entity: "library",
                //     value: matchName
                // })
                self.ifInnerClickLib = true

                // 判断此时是path还是library_id
                let commit_path = false
                if (self.pathCandidateList.length > 0) {
                    commit_path = TimeLineUpdate.find_path(self.pathCandidateList, self.pathNameList, matchName)
                }

                if (commit_path) {
                    self.pathNameList.push(event.srcElement.__data__.lib_id)
                    self.pathNameList = Array.from(new Set(self.pathNameList))
                    self.$store.commit("changeSelection", {
                    entity: "path",
                    value: self.pathNameList
                    })
                    return // 接下来就交给selection中的path情况响应
                } else {
                    self.$store.commit("changeSelection", {
                    entity: "library_id",
                    value: event.srcElement.__data__.lib_id,
                    })
                    self.lastLibrary = event.srcElement.__data__.lib_id // 更新上一次click的library
                    self.pathNameList = [self.lastLibrary] // 重新初始化pathNameList
                    
                    const translateY1 = self.eachBookPos[book_name_click].y // 未改变之前的y
                    self.fitBookNumber = 0 // 归零

                    const sortLibAgent = TimeLineUpdate.clickSingleLibAgentSort(self.curBookList, classTag, matchName)
                    self.curBookList = sortLibAgent.new_list
                    self.fitBookNumber = sortLibAgent.fit_num
                    self.pathCandidateList = sortLibAgent.path_candidate // 更新candidate_path的bookList

                    self.eachBookPos = BookTraj.reCalRowPos(self.curBookList, self.eachBookPos, self.rowHeight, self.lastClick, self.lastClickArray) // 首先获取更新前的所有book的position
                    const translateY2 = self.eachBookPos[book_name_click].y // 改变之后的y
                    // console.log('fit_num', self.fitBookNumber)
                    // console.log('self.ClickLibCurBookList', self.curBookList)

                    let cur_max_length = 0 // 用于记录当前最大的长度
                    for (let i = 0; i < self.curBookList.length; i ++) {
                        const select_book = self.curBookList[i].book_name
                        // 用于恢复之前的opacity
                        d3.select(`#${select_book}-group`).style('opacity', 1)
                    }

                    // setTimeout(function() {
                    // }, 5000)

                    for (let i = 0; i < self.curBookList.length; i ++) {
                        const select_book = self.curBookList[i].book_name
                        // 用于恢复之前的opacity
                        // d3.select(`#${select_book}-group`).style('opacity', 1)

                        d3.select(`#${select_book}-group`)
                            // .style('opacity', i < self.fitBookNumber && self.curBookList[i].opacity === 1? '1' : '0.4' ) // 对于不符合条件的设置opacity
                            .style('opacity', () => {
                                if (i < self.fitBookNumber && self.curBookList[i].opacity === 1) {
                                    return 1
                                } else if (i < self.fitBookNumber && self.curBookList[i].opacity !== 1) {
                                    return 0.6
                                } else { return 0.4 }
                            }) // 对于不符合条件的设置opacity
                            .transition()
                            .duration(time_duration)
                            .attr('transform', `translate(0, ${self.eachBookPos[select_book].y.toString()})`)
                            .on('start', function() {
                                self.transitionOn = true
                            })
                            .on('end', function() {
                                self.transitionOn = false
                            })
                        // 更新cur_max_length
                        cur_max_length = Math.max(cur_max_length, self.eachBookPos[select_book].y + self.eachBookPos[select_book].height)

                        self.alreadyLibPathSort = true // 更新alreadyLibPathSort，说明目前已经排序了

                        // 对于符合条件的agent/library(针对event)→highlight
                        const cur_book_events = self.curBookList[i].events
                        let highlight_book_name = false
                        for (let j = 0; j < cur_book_events.length; j++) {
                            if (cur_book_events[j].lib_id === matchName) { // 如果当前circle匹配
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
                                // d3.select(`#${select_book}-event-uncertain-circle${(j + 1).toString()}`)
                                //     .selectAll('circle')
                                //     .attr("filter", 'drop-shadow(3px 2px 2px rgb(0 0 0 / 0.6))')
                                //     .attr("fill", type_color.library.bright[cur_book_events[j].lib_type])
                                // console.log(d3.select(`.${select_book}-tag-${(j + 1).toString()}`))
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
                                // d3.select(`#${select_book}-event-uncertain-circle${(j + 1).toString()}`)
                                //     .selectAll('circle')
                                //     .attr("filter", 'none')
                                //     .attr("fill", type_color.library[cur_book_events[j].lib_type])
                                // console.log(d3.select(`.${select_book}-tag-${(j + 1).toString()}`))
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
                    self.curSvgLength = cur_max_length
                            
                    // const translate_match = 'translate(0,'            
                    // let translateY = d3.select(`#${book_name_click}-group`).node().getAttribute('transform').replace(translate_match, '').replace(')', '')
                    // translateY = Number(translateY)
                
                    // console.log('container', document.getElementById('container').scrollTop)
                    const prev_pos_container = document.getElementById('container').scrollTop
                    self.scrollTopContainer = translateY2 - translateY1 + prev_pos_container // 更新当前窗口的scrollTop计算值
                    
                    d3.transition()
                        .duration(time_duration)
                        .tween("scroll", TimeLineUpdate.scrollTween(prev_pos_container, translateY2 - translateY1 + prev_pos_container))
                        // document.getElementById('container')
                        //         .scrollTo({top: translateY2 - translateY1 + prev_pos_container, behavior: "smooth"}) 
                    }   
            }

            event
                .append('line')
                .attr('x1', (d) => self.timescale(new Date(d.time_info.timestamp, 1, 1)) + 7)
                .attr('x2', function(d, i, array) {
                    // console.log(d3.select(array[i])._groups[0][0].__data__.time_info.timestamp)
                    if (i === array.length - 1) {
                        return (self.timescale(new Date(d.time_info.timestamp, 1, 1)) + 7)
                    } else { 
                        const next_year = d3.select(array[i + 1])._groups[0][0].__data__.time_info.timestamp
                        return (self.timescale(new Date(next_year, 1, 1)) - 7)
                    }
                })
                .attr("stroke", "gray")
                .attr('stroke-dasharray', function(d, i) {
                    if (d.state_flag === 'block_print' || d.state_flag === 'normal_internal') {
                        return '3,3'
                    } else { return '3,0' }
                })
                .style('display', (d, i, array) => i === array.length - 1? 'none': 'block') // 最后面的不显示
                .attr('stroke-width', 0.5)
                .style('opacity', 0.8)

            //  以下为新的time uncertainty编码方式
            event
                .append("line")
                .attr('id', (d, i) => `${d.書名}-event-lineLeft-${(i + 1).toString()}`)
                .attr('x1', function(d) {
                    if (d.time_info.left_bound === null) {
                        return self.timescale(new Date(d.time_info.timestamp, - 40, 1, 1))
                    } else if (Math.abs(d.time_info.timestamp - d.time_info.left_bound) > 40) {
                        return self.timescale(new Date(d.time_info.timestamp - 40, 1, 1))
                    } else {
                        return self.timescale(new Date(d.time_info.left_bound, 1, 1))
                    }
                })
                .attr('x2', (d) => self.timescale(new Date(d.time_info.timestamp, 1, 1)))
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
                .attr('id', (d, i) => `${d.書名}-event-lineRight-${(i + 1).toString()}`)
                .attr('x1', (d) => self.timescale(new Date(d.time_info.timestamp, 1, 1)))
                .attr('x2', function(d) {
                    if (d.time_info.right_bound === null) {
                        return self.timescale(new Date(d.time_info.timestamp + 40, 1, 1))
                    } else if (Math.abs(d.time_info.timestamp - d.time_info.right_bound) > 40) {
                        return self.timescale(new Date(d.time_info.timestamp + 40, 1, 1))
                    } else {
                        return self.timescale(new Date(d.time_info.right_bound, 1, 1))
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

            // 对于不确定的时间取
            const eventRectCircle = event.append('g')
                                         .attr('id', (d, i) => `${d.書名}-event-circle-${(i + 1).toString()}`)
                                         .on('pointerenter pointermove', bookCircleTooltipOn)
                                         .on('pointerleave', bookCircleTooltipOff)
                                         .on('click', clickLibCircle)
                                         .style('cursor', 'pointer') // hover上去以后鼠标变为手的形状
            eventRectCircle.append("circle")
                            .attr('id', (d, i) => `${d.書名}-event-circle-item-${(i + 1).toString()}`)
                            .attr("cx", (d) =>
                                self.timescale(new Date(d.time_info.timestamp, 1, 1))
                            )
                            .attr("r", function(d) {
                                if (d.state_flag === 'block_print' || d.state_flag === 'Japan') {
                                    return 9
                                } else { return 7 } // 默认是7
                            })
                            .attr("fill", function (d, i) {
                                return type_color.library[d.lib_type]
                            })
                            .attr("stroke", "white")
                            // .style('display', (d) => d.time_info.certainty? 'block': 'none')

            // 以下为使用长尾过渡，目前弃用
            // 对rect进行透明度插值
            // const opacityInterpolateLeft = d3.interpolate(0.4, 0.9)
            // const opacityInterpolateRight = d3.interpolate(0.9, 0.4)
            // const linearOpacity = d3.scaleLinear().domain([0, 100]).range([0, 1])
            // for (let i = 0; i < self.curBookList.length; i ++) { // 遍历每一本书
            //     const item_book_name = self.curBookList[i].book_name
            //     const cur_book_events = self.curBookList[i].events
            //     for (let j = 0; j < cur_book_events.length; j++) {
            //         let leftBound = cur_book_events[j].time_info.left_bound
            //         if (leftBound === null) {
            //             leftBound = cur_book_events[j].time_info.timestamp - 50
            //         }
            //         let rightBound = cur_book_events[j].time_info.right_bound
            //         if (rightBound === null) {
            //             rightBound = cur_book_events[j].time_info.timestamp + 50
            //         }
            //         const centralDot = cur_book_events[j].time_info.timestamp
            //         const item_state_flag = cur_book_events[j].time_info.timestamp
            //         const item_lib_type = cur_book_events[j].lib_type

            //         // 用于线性插值
            //         const stops = [
            //             [0, 0.4, type_color.library[item_lib_type]],
            //             [Math.round((centralDot - leftBound) * 100 / (rightBound - leftBound)), 1, type_color.library[item_lib_type]],
            //             [100, 0.4, type_color.library[item_lib_type]]
            //         ]
            //         const linearGradient = d3.select('#timeLineSVG').append('linearGradient')
            //                                     .attr('id', `${item_book_name}-myRectGradient-${(j + 1).toString()}`)

            //         for(let index in stops) {
            //             // console.log(`${stops[index][0]}%`, stops[index][1], stops[index][2])
            //             linearGradient
            //                         .append("stop")
            //                         .attr("offset", `${stops[index][0]}%`)
            //                         .attr("stop-color", stops[index][2])
            //                         .attr("stop-opacity", stops[index][1]);
            //         }

            //         // BookTraj.interpolate_color(item_lib_type, leftBound, centralDot, rightBound, self.timeline) // 创建插值函数

            //         let circle_radius = self.rem / 2
            //         if (item_state_flag === 'block_print' || item_state_flag === 'Japan') {
            //             circle_radius = 1.1 * self.rem / 2
            //         }

            //         // 绘制item形状
            //         const arcLeft = `M${self.timescale(new Date(leftBound, 1, 1))},${-circle_radius}A${circle_radius},${circle_radius},0,0,0,${self.timescale(new Date(leftBound, 1, 1))},${circle_radius}`
            //         const arcRight = `M${self.timescale(new Date(rightBound, 1, 1))},${-circle_radius}A${circle_radius},${circle_radius},0,0,1,${self.timescale(new Date(rightBound, 1, 1))},${circle_radius}`
            //         const arcRightReverse = `A${circle_radius},${circle_radius},0,0,0,${self.timescale(new Date(rightBound, 1, 1))},${-circle_radius}`
            //         const eventItem =  arcLeft + `L ${self.timescale(new Date(rightBound, 1, 1))} ${circle_radius}` + arcRightReverse + `L ${self.timescale(new Date(leftBound, 1, 1))} ${-circle_radius}`
            //         d3.select(`#${item_book_name}-event-circle-${(j + 1).toString()}`)
            //         //   .append('rect')
            //           .append('path')
            //           .attr("d", eventItem)
            //           .attr('class', 'interpolateTimeRect')
            //         //   .attr('x', self.timescale(new Date(leftBound, 1, 1)))
            //         //   .attr('y', - circle_radius)
            //         //   .attr('width', self.timescale(new Date(rightBound, 1, 1)) - self.timescale(new Date(leftBound, 1, 1)))
            //         //   .attr('height', 2 * circle_radius)
            //           .attr("fill", "url(#" + `${item_book_name}-myRectGradient-${(j + 1).toString()}` + ")")
            //           .style('display', cur_book_events[j].time_info.certainty? 'none': 'block')
            //         // d3.select(`#${item_book_name}-event-circle-${(j + 1).toString()}`)
            //         //     .append('g')
            //         //     .selectAll('rect')
            //         //     .attr('class', 'interpolateTimeRect')
            //         //     .data(d3.range(100)).enter()
            //         //     .append('rect')
            //         //     .attr('x', (d, i) => self.timescale(new Date(leftBound, 1, 1)) + i * (self.timescale(new Date(centralDot, 1, 1)) - self.timescale(new Date(leftBound, 1, 1))) / 100)
            //         //     .attr('y', - circle_radius)
            //         //     .attr('width', (self.timescale(new Date(centralDot, 1, 1)) - self.timescale(new Date(leftBound, 1, 1))) / 100)
            //         //     .attr('height', 2 * circle_radius)
            //         //     .attr('stroke', 'none')
            //         //     .attr('fill', type_color.library[item_lib_type])
            //         //     .attr('fill-opacity', (d) => opacityInterpolateLeft(linearOpacity(d)))
            //         //     .style('display', cur_book_events[j].time_info.certainty? 'none': 'block')
            //         // d3.select(`#${item_book_name}-event-circle-${(j + 1).toString()}`)
            //         //     .append('g')
            //         //     .selectAll('rect')
            //         //     .attr('class', 'interpolateTimeRect')
            //         //     .data(d3.range(100)).enter()
            //         //     .append('rect')
            //         //     .attr('x', (d, i) => self.timescale(new Date(centralDot, 1, 1)) + i * (self.timescale(new Date(rightBound, 1, 1)) - self.timescale(new Date(centralDot, 1, 1))) / 100)
            //         //     .attr('y', - circle_radius)
            //         //     .attr('width', (self.timescale(new Date(rightBound, 1, 1)) - self.timescale(new Date(centralDot, 1, 1))) / 100)
            //         //     .attr('height', 2 * circle_radius)
            //         //     .attr('stroke', 'none')
            //         //     .attr('fill', type_color.library[item_lib_type])
            //         //     .attr('fill-opacity', (d) => opacityInterpolateRight(linearOpacity(d)))
            //         //     .style('display', cur_book_events[j].time_info.certainty? 'none': 'block')
                    
            //         // 绘制左右的半圆
            //         // 创建弧生成器
            //         // const path = d3.path()
            //         // path.arc(self.timescale(new Date(leftBound, 1, 1)), 0, circle_radius, -Math.PI / 2, Math.PI / 2) // 顺时针
            //         // path.arc(self.timescale(new Date(rightBound, 1, 1)), 0, circle_radius, Math.PI, 2 * Math.PI)
                    
            //         const arcGeneratorLeft = d3.arc()
            //                                 .innerRadius(0)
            //                                 .outerRadius(circle_radius)
            //                                 .startAngle(Math.PI)
            //                                 .endAngle(2 * Math.PI)
                                            
                    
                    
            //         const arcGeneratorRight = d3.arc()
            //                                 .innerRadius(0)
            //                                 .outerRadius(circle_radius)
            //                                 .startAngle(0)
            //                                 .endAngle(Math.PI)
                   
            //         // d3.select(`#${item_book_name}-event-circle-${(j + 1).toString()}`)
            //         //     .append('path')
            //         //     .attr("d", arcLeft)
            //         //     .attr("fill", type_color.library[item_lib_type])
            //         //     .attr('stroke', 'none')
            //         //     .attr('fill-opacity', function() {
            //         //         if (Math.abs(leftBound - centralDot) <= 2) {
            //         //             return 0.9
            //         //         } else { return 0.4 }
            //         //     })
            //         //     // .attr('transform', `translate(${self.timescale(new Date(leftBound, 1, 1))}, ${self.eachBookPos[item_book_name].y})`)
            //         //     .style('display', cur_book_events[j].time_info.certainty? 'none': 'block')
            //         // // path.arc(self.timescale(new Date(rightBound, 1, 1)), 0, circle_radius, -Math.PI / 2, Math.PI / 2)
            //         // d3.select(`#${item_book_name}-event-circle-${(j + 1).toString()}`)
            //         //     .append('path')
            //         //     .attr("d", arcRight)
            //         //     .attr("fill", type_color.library[item_lib_type])
            //         //     .attr('stroke', 'none')
            //         //     .attr('fill-opacity', function() {
            //         //         if (Math.abs(rightBound - centralDot) <= 2) {
            //         //             return 0.9
            //         //         } else { return 0.4 }
            //         //     })
            //         //     // .attr('transform', `translate(${self.timescale(new Date(rightBound, 1, 1))}, ${self.eachBookPos[item_book_name].y})`)
            //         //     .style('display', cur_book_events[j].time_info.certainty? 'none': 'block')
            //     }
            // }
            

            // event
            //     .append("circle")
            //     .attr('id', (d, i) => `${d.書名}-event-circle-${(i + 1).toString()}`)
            //     .attr("cx", (d) =>
            //         self.timescale(new Date(d.time_info.timestamp, 1, 1))
            //     )
            //     .attr("r", function(d) {
            //         if (d.state_flag === 'block_print' || d.state_flag === 'Japan') {
            //             return 9
            //         } else { return 7 } // 默认是7
            //     })
            //     .attr("fill", function (d, i) {
            //         return type_color.library[d.lib_type]
            //     })
            //     .attr("stroke", "white")
            //     .on('pointerenter pointermove', bookCircleTooltipOn)
            //     .on('pointerleave', bookCircleTooltipOff)
            //     .on('click', clickLibCircle)
            //     .style('cursor', 'pointer') // hover上去以后鼠标变为手的形状
            
            // 绘制uncertainty所代表的circle
            // const uncertainCircle = event
            //     .append('g')
            //     .attr('class', 'uncertain-circle')
            //     .attr('id', (d, i) => `${d.書名}-event-uncertain-circle-${(i + 1).toString()}`)

            // uncertainCircle
            //     .selectAll('circle')
            //     .data(function(d) { // 左边用'L'标注，右边用'R'标注
            //         const leftCircle = [...Array(Number(d.time_info.circle.left))].map(function() {
            //             return {
            //                 time: d.time_info.timestamp,
            //                 label: 'L',
            //                 lib_type: d.lib_type
            //             }
            //         })
            //         const rightCircle = [...Array(Number(d.time_info.circle.right))].map(function() {
            //             return {
            //                 time: d.time_info.timestamp,
            //                 label: 'R',
            //                 lib_type: d.lib_type
            //             }
            //         })
            //         // console.log('leftCircle.concat(rightCircle)', leftCircle.concat(rightCircle))
            //         return leftCircle.concat(rightCircle)
            //     })
            //     .join('circle')
            //     .attr('cx', function(d, i, array) {
            //         const [leftNum, rightNum] = BookTraj.divideLR(array)
            //         let xPos = self.timescale(new Date(d.time, 1, 1))
            //         if (i < leftNum) { // 代表left_uncertainty的circle
            //             xPos = xPos + (i - leftNum) * 5 - 7
            //         } else {
            //             xPos = xPos + (i + 1 - leftNum) * 5 + 7
            //         }
            //         return xPos
            //     })
            //     .attr('r', 2)
            //     .attr('fill', function (d, i) {
            //         // return colorCircle(d.lib_type)
            //         return type_color.library[d.lib_type]
            //     })
            //     .style('opacity', 0.5)

            //  以下为新的time uncertainty编码方式
            // for (let i = 0; i < self.curBookList.length; i ++) { // 遍历每一本书
            //     const item_book_name = self.curBookList[i].book_name
            //     const cur_book_events = self.curBookList[i].events
            //     const centralDot = cur_book_events[j].time_info.timestamp
            //     for (let j = 0; j < cur_book_events.length; j++) {
            //         let leftBound = cur_book_events[j].time_info.left_bound
            //         if (leftBound === null) {
            //             leftBound = cur_book_events[j].time_info.timestamp - 50
            //         } else if (Math.abs(centralDot - leftBound) > 50) { // 设置最低下限
            //             leftBound = cur_book_events[j].time_info.timestamp - 50
            //         }
            //         let rightBound = cur_book_events[j].time_info.right_bound
            //         if (rightBound === null) {
            //             rightBound = cur_book_events[j].time_info.timestamp + 50
            //         } else if (Math.abs(centralDot - rightBound) > 50) { // 设置最高上限
            //             rightBound = cur_book_events[j].time_info.timestamp + 50
            //         }
                    
            //         const item_state_flag = cur_book_events[j].time_info.timestamp
            //         const item_lib_type = cur_book_events[j].lib_type

            //         if (!item_state_flag) { // 如果当前时间不确定
            //             eventRectCircle.append('line')
            //                            .attr('x1', )
            //         }
            //     }
            // }

            event
                .append("text")
                .attr("x", (d) =>
                    self.timescale(new Date(d.time_info.timestamp, 1, 1))
                )
                .text((d) => d["收藏地"])
           
            // for each event, add "inst_name", "person_name"
            event
            // eventRectCircle
                .append("text")
                .attr('class', (d, i) => `${d.書名}-tag-${(i + 1).toString()}`)
                .style('cursor', 'pointer') // hover上去以后鼠标变为手的形状
                .attr("x", (d) =>
                    self.timescale(new Date(d.time_info.timestamp, 1, 1))
                )
                .attr("y", 30)
                .attr('text-anchor', 'middle')
                // .style('visible', 'hidden') // 首先hidden不显示，等计算好了布局再显示
                .call(text => text
                        .selectAll('tspan')
                        .data(function(d) {
                            const textContent = d.agent !== ''? `${d.library}_${d.agent}`: `${d.library}_--`
                            // const textContent = `${d.library}\n ${d.agent}`
                            return textContent.split(/\n/)
                        })
                        .join('tspan')
                        .attr('class', (d, i) => i === 0 ? 'lib_text': 'agent_text')
                        .attr('x', function(d, i, array) {
                            // const index = array[3].split(': ')[1]
                            // return index * self.svgShowSize[0] / array.length
                            return  (this.parentNode.getAttribute('x'))
                            // return i === 0 ? this.parentNode.getAttribute('x') : this.getAttribute('x')
                        })
                        .attr('y', (_, i) => `${1.5 + i * 1.1}em`)
                        // .attr('font-weight', (_, i) => i ? null : 'bold')
                        // .attr('font-family', 'FZQINGKBYSJF')
                        .attr('font-size', self.rem * 0.8)
                        .attr('fill', '#553624')
                        // .style('visible', 'hidden')
                        // .text(d => d)
                        .text(d => {
                            // console.log(d)
                            // const lib_name = d.split('_')[0], // library_name
                            //       agent_name = d.split('_')[1] // agent_name
                            let show_tag_name = d.split('_')[0],
                                trans_dict_key = 'library_trans_name'
                            if (d.split('_')[0] === '--' && d.split('_')[1] !== '--') {
                                show_tag_name = d.split('_')[1]
                                trans_dict_key = 'agent_trans_name'
                            }

                            if (self.language === 'zh') {
                                return Translate[trans_dict_key][show_tag_name].zh
                            } else if (self.language === 'en') {
                                return Translate[trans_dict_key][show_tag_name].en
                            }   
                        })
                        .on('click', clickLibAgent)
                        .on('pointerenter pointermove', text_tag_pointer_enter)
                        .on('pointerleave', bookCircleTooltipOff))
                // .text((d) => d.library)
                // .attr('font-weight', 'bold')
                // .attr('font-size', self.rem * 0.8)
                // .attr('fill', '#553624')

            // 重新遍历，通过BBox确定摆放位置(为了保证后续hover的时候间隔标准相同)
            // this.eachBookPos = BookTraj.reCalRowPos(this.allBookList, this.eachBookPos, this.rowHeight) // 首先获取更新前的所有book的position
            //         for (let book_name in this.eachBookPos) {
            //             d3.select(`#${book_name}-group`)
            //             .transition()
            //             .duration(600)
            //             .attr('transform', `translate(0,${this.eachBookPos[book_name].y})`)
            //         }


            // modify the text position
            // new_version
            // first iterate over circle
            // for (let i = 0; i < book_list.length; i++) {
            //     const bookName = book_list[i].book_name
            //     self.tagPosDict[bookName] = {} // init event tag position dict for each book
            //     // step1: 存入每个tag以及circle的原始pos
            //     for (let j = 0; j < book_list[i].events.length; j++) {
            //         const eventDiv = d3.select(`.${bookName}-tag-${(j + 1).toString()}`) // text tag
            //         const eventCircleDiv = d3.select(`#${bookName}-event-circle-${(j + 1).toString()}`) // circle
            //         let { x: tagX, width: tagWidth } = eventDiv.node().getBBox() // 用于获取text的bbox(SVGRect)参数
            //         const { x: circleX, width: circleWidth } = eventCircleDiv.node().getBBox() // 用于获取circle的bbox(SVGRect)参数
            //         self.tagPosDict[bookName][(j + 1).toString()] = {
            //             tagBox : [tagX, tagX + tagWidth],
            //             circleBox: [circleX, circleX + circleWidth],
            //             ifShow: 'block' // 默认都显示
            //         }
            //         console.log('self.tagPosDict[bookName]', self.tagPosDict[bookName])
            // }

            // // step2: 从左到右遍历该book的所有circle event position,重新分配其tag position
            //         self.tagPosDict[bookName] = BookTraj.bookEventPosFirst(self.tagPosDict[bookName], [margin.left * width, (1 - margin.right) * width], bookName)
            //         self.tagPosDict[bookName] = BookTraj.decideTagShow(self.tagPosDict[bookName], bookName)

            //         // 用于为circle和text之间添加标签
            //         const link = d3.line()
            //                     .curve(d3.curveBumpY)
            //         // 再次遍历，重新分配位置
            //         for (let j = 0; j < book_list[i].events.length; j++) {
            //             console.log('self.tagPosDict[bookName]', self.tagPosDict[bookName])
            //             console.log('self.tagPosDict[bookName][(j + 1).toString()]', self.tagPosDict[bookName][(j + 1).toString()])
            //             const x_new = (self.tagPosDict[bookName][(j + 1).toString()].position)[0]
            //             const ifShow = self.tagPosDict[bookName][(j + 1).toString()].showAble
            //             d3.select(`.${bookName}-tag-${(j + 1).toString()}`).selectAll('tspan')
            //             .attr('x', function() {
            //                 if (x_new !== x_new) {
            //                 return this.parentNode.getAttribute('x')
            //             } else { return x_new }
            //             })
            //             .style('visibility', function() { // ifShow,需要判断一下算出来是否越界了，越界则为'none'
            //                 if (x_new < margin.left * width || x_new > (1 - margin.right) * width) {
            //                     return 'hidden'
            //                 } else { return ifShow }
            //             })
            //         }

            // new_version (重新布局标签的位置)
            for (let i = 0; i < self.curBookList.length; i++) {
                const bookName = self.curBookList[i].book_name
                // console.log('book_name', bookName)
                // self.tagPosDict[bookName] = {} // init event tag position dict for each book
                const tagPosList = BookTraj.generateTextPos(self.rem, self.curBookList[i].events, self.timescale, self.language)

                // 再次遍历，重新分配位置
                for (let j = 0; j < tagPosList.length; j++) {
                    const x_new = (tagPosList[j].span[0] + tagPosList[j].span[1]) / 2
                    const ifShow = tagPosList[j].if_show
                    self.tagPosDict[bookName].push(ifShow) // 更新tagPosDict中每个标签的显示状态
                    d3.select(`.${bookName}-tag-${(j + 1).toString()}`)
                      .style('visibility', ifShow === true? 'visible': 'hidden')
                      .selectAll('tspan')
                      .attr('x', function() {
                        if (x_new !== x_new) {
                        return this.parentNode.getAttribute('x')
                      } else { return x_new }
                      })
                }    
            }
            console.log('self.tagPosDict', self.tagPosDict)

            // old_version
            // for (let i = 0; i < book_list.length; i++) {
            //     const bookName = book_list[i].book_name
            //     self.tagPosDict[bookName] = {} // init event tag position dict for each book
            //     // step1: 存入每个tag的原始pos
            //     for (let j = 0; j < book_list[i].events.length; j++) {
            //         const eventDiv = d3.select(`.${bookName}-tag-${(j + 1).toString()}`)
            //         const eventCircleDiv = d3.select(`#${bookName}-event-circle-${(j + 1).toString()}`) // circle
            //         let { x: tagX, width: tagWidth } = eventDiv.node().getBBox() // 用于获取text的bbox(SVGRect)参数
            //         let { x: circleX, width: circleWidth } = eventCircleDiv.node().getBBox() // 用于获取circle的bbox(SVGRect)参数
            //         self.tagPosDict[bookName][(j + 1).toString()] = [tagX, tagX + tagWidth]
            //         // console.log('eventDiv', bookName, tagWidth, tagX, tagX + tagWidth, circleX, circleX + circleWidth)
            //     }
            //     // step2: 从左到右遍历该book的所有event,重新分配其tag position
            //     self.tagPosDict[bookName] = BookTraj.calSingleBookEventPos(self.tagPosDict[bookName], [margin.left * width, (1 - margin.right) * width], bookName)
            //     self.tagPosDict[bookName] = BookTraj.reCalSingleBookEventPos(self.tagPosDict[bookName], bookName)
                
            //     // 用于为circle和text之间添加标签
            //     const link = d3.line()
            //                 .curve(d3.curveBumpY)
            //     // 再次遍历，重新分配位置
            //     for (let j = 0; j < book_list[i].events.length; j++) {
            //         const x_new = (self.tagPosDict[bookName][(j + 1).toString()].position)[0]
            //         const ifShow = self.tagPosDict[bookName][(j + 1).toString()].showAble
            //         // console.log(ifShow)
            //         d3.select(`.${bookName}-tag-${(j + 1).toString()}`)
            //           .style('visibility', ifShow)
            //           .selectAll('tspan')
            //           .attr('x', function() {
            //             if (x_new !== x_new) {
            //             return this.parentNode.getAttribute('x')
            //           } else { return x_new }
            //           })
            //         //   .style('visibility', function() { // ifShow,需要判断一下算出来是否越界了，越界则为'none'
            //         //     if (x_new < margin.left * width || x_new > (1 - margin.right) * width) {
            //         //         return 'hidden'
            //         //     } else { return ifShow }
            //         //   })
            //         .style('visibility', ifShow)
            //         // //   添加curve
            //         //   .attr('class', 'link-path')
            //         //   .append('path')
            //         //   .attr('class', 'link-path')
            //         //   .attr('d', function() {
            //         //     // console.log(this.parentNode.style.visibility)
            //         //     const circleNode = this.parentNode.parentNode.parentNode.children
            //         //     console.log(circleNode[0].cx)
            //         //     const circlePos = [circleNode[0].cx.baseVal.value, circleNode[0].cy.baseVal.value]
            //         //     const textPos = [this.parentNode.getAttribute('x'), this.parentNode.parentNode.getAttribute('y')]
            //         //     console.log(circlePos)
            //         //     console.log(this.parentNode.getAttribute('x'), this.parentNode.parentNode.getAttribute('y'))
            //         //     return link([circlePos, textPos])
            //         //   })
            //         //   .attr('stroke', 'gray')
            //         //   .attr('fill', 'none')
            //         //   .attr('stroke-dasharray', '3,3')
            //     }        
            // }
            // </old version>




            // console.log('self.tagPosDict', self.tagPosDict)

            // 用于定义detail card
            // const detailInfo = self.timeline
            //                         .append('g')
            //                         .attr('class', 'detailInfo')
            // 定义click单本书的交互
            const singleBookClick = function(event) {
                // 动画时禁用交互
                // if (self.transitionOn) {
                //     return
                // }
                // console.log('click_event', event)
                // self.ifInnerHover = true
                const bookNameClick = event.srcElement.__data__.book_name

                if (self.eachBookState[bookNameClick].stay_state === false) {
                    self.eachBookState[bookNameClick].stay_state = !(self.eachBookState[bookNameClick].stay_state)
                } 
                self.ifInnerClick = true // 标志是否是在timeline视图中进行的click,从而判断是否需要scroll
                
                // console.log('self.lastClick', self.lastClick, self.lastClickArray)
                if (self.lastClick !== bookNameClick) {
                    self.lastClickArray.push(bookNameClick)
                }     
                // self.$store.commit("changeSelection", {
                //     entity: "edition",
                //     value: bookNameClick
                //     })     
                self.$store.commit("changeSelection", {
                entity: "editions",
                value: self.lastClickArray
                })
                // else {
                //     self.eachBookState[bookNameClick].stay_state = !(self.eachBookState[bookNameClick].stay_state)
                //     // self.bookDetailDict[bookNameClick] = !(self.bookDetailDict[bookNameClick]) // 取true
                //     d3.select(`#${bookNameClick}-group`).selectAll('.detailInfo').remove()
                //     // 重新计算各行的排列位置
                //     // console.log('9~')
                //     self.eachBookPos = BookTraj.reCalRowPos(self.curBookList, self.eachBookPos, self.rowHeight, null) // 首先获取更新前的所有book的position
                //     book
                //         .transition()
                //         .duration(time_duration / 4)
                //         .attr('transform', (d) => `translate(0, ${self.eachBookPos[d.book_name].y.toString()})`)
                //         .on('start', function() {
                //             self.transitionOn = true
                //         })
                //         .on('end', function() {
                //             self.transitionOn = false
                //         })
                //     self.ifInnerClick = true // 标志是否是在timeline视图中进行的click,从而判断是否需要scroll
                //     self.$store.commit("changeSelection", {
                //         entity: "edition",
                //         value: null
                //     })
                // }
            }

            const bookPointerMove = function(event) {
                // 动画时禁用交互
                // if (self.transitionOn) {
                //     return
                // }
                const bookNameHover = event.srcElement.__data__.book_name
                // hover文字显示全部text，目前text最多为15个字(<= 8? 同一行：分2行)
                // d3.select(`#${bookNameHover}-book_name`).text(bookNameHover)
                // if (bookNameHover.length <= 8) {
                //     d3.select(`#${bookNameHover}-book_name`).text(bookNameHover)
                // } else { // 超过8个字进行分行展示
                //     d3.select(`#${bookNameHover}-book_name`)
                //         // .text(bookNameHover.slice(0, 8))
                //         .text(bookNameHover)
                //         .call(text => text
                //             .selectAll('tspan')
                //             // .data([bookNameHover.slice(8)])
                //             .data([bookNameHover])
                //             .join('tspan')
                //             .attr('x', function(d, i, array) {
                //                 return  (this.parentNode.getAttribute('x'))
                //             })
                //             .attr('y', (_, i) => `${1.5 + i * 1.1}em`)
                //             // .attr('font-family', 'FZQINGKBYSJF')
                //             .attr('text-anchor', 'start')
                //             .text(d => d))
                // }
                d3.select(`#${bookNameHover}-book_name`)
                  .text(() => {
                    if (self.language === 'zh') {
                        return event.srcElement.__data__.book_name_lang.zh
                    } else if (self.language === 'en') {
                        return event.srcElement.__data__.book_name_lang.en
                    }
                  })
                //   .text(bookNameHover)
                self.ifInnerHover = true
                self.$store.commit("changeHover", {
                    entity: "edition",
                    value: bookNameHover
                })
            }

            const bookPointerLeft = function(event) {
                // 动画时禁用交互
                // if (self.transitionOn) {
                //     return
                // }
                const bookNameHover = event.srcElement.__data__.book_name
                if (self.selection.value !== bookNameHover) { // 如果此时该book edition不是selected的状态(若仍在select状态则保持显示全部书名)
                    // d3.select(`#${bookNameHover}-book_name`).text(bookNameHover.length <= 6 ? bookNameHover : bookNameHover.slice(0, 6) + '...')
                    d3.select(`#${bookNameHover}-book_name`)
                    .text(() => {
                        if (self.language === 'zh') {
                            return event.srcElement.__data__.book_name_lang.zh
                        } else if (self.language === 'en') {
                            return event.srcElement.__data__.book_name_lang.en
                        }
                    })
                    //   .text(bookNameHover)
                }             
                self.ifInnerHover = false
                self.$store.commit("changeHover", {
                        entity: "edition",
                        value: null,
                    })
            }

            // 左侧书目
            book.append("text")
                .attr("x", document.getElementsByClassName('main-panel')[0].clientWidth * 0.002)
                .text((d) => {
                    if (self.language === 'zh') {
                        return d.book_name_lang.zh
                    } else if (self.language === 'en') {
                        return d.book_name_lang.en
                    }
                })
                // .text((d) => d.book_name)
                // .text((d) => d.book_name.length <= 6 ? d.book_name : d.book_name.slice(0, 6) + '...')
                .attr('id', (d) => `${d.book_name}-book_name`)
                .style('cursor', 'pointer') // hover上去以后鼠标变为手的形状
                .on('click', singleBookClick)
                .on('mouseover', bookPointerMove)
                .on('mouseout', bookPointerLeft)
        },
    },
    mounted() {
        this.data = get_book_traj().book_traj
        // console.log(document.getElementById('main-view').clientHeight / 10)
        // this.rowHeight = document.getElementById('main-view').clientHeight / 15
        // this.rowHeight = this.rem * 3 (加上agent name时的设置)
        this.rowHeight = this.rem * 2.5

        console.log('rem', this.rem)
        console.log(this.data)
        this.initializeTimeline()
        // this.mouse = BookTraj.get_book_traj_all() // 用来试验的
        // console.log('this.mouse', this.mouse)
        // BookTraj.cur_timeline_layout()
        window.addEventListener('scroll', this.scrollEvent)
    },
    destroyed() {
        // window.removeEventListener('scroll', this.handleScroll)
    }
}
</script>

<style scoped>
#container {
    position: absolute;
    width: 100%;
    height: 100%;
    overflow-y: auto;
    z-index: 2;
}
.detail-info-card {
    z-index: 1;
}
</style>