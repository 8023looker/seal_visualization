<template>
    <div id="container" :width="canvas_width" :height="canvas_height">
        <div id="timelineContainer" :width="canvas_width">
            <template v-for="(item, index) in curBookList">
                <div class="timeline-basic" :id="item.book_name+'-timeline'" :style="{top: item.transY + 'px'}">
                    <svg :id="item.book_name+'-svg'" :width="canvas_width"></svg>
                </div>
                <TimeLineBookCard
                    id="detail-info-card"
                    :book_detail="item.book_detail"
                ></TimeLineBookCard>
                <TimeLineEventCard
                    id="detail-info-card"      
                    :event_detail="item"
                    :canvas_width="canvas_width"
                    :canvas_height="canvas_height"
                    :xTimeScale="xTimeScale"
                ></TimeLineEventCard>
            </template>
        </div>
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
    name: "Timeline", // TimelineComponent
    // exportBookList,
    // exportRowHeight,
    data() {
        return {
            data: null, // 获取的总数据
            curBookList: [], // 当先filter的book
            tagPosDict: [], // 用于记录tag标签的位置
            curSvgLength: 0, // 当前svg的长度，动态变化
            xTimeScale: d3
                .scaleTime()
                .domain([new Date(960, 1, 1), new Date(1965, 1, 1)]) // 为了绘图美观，前后延伸了15年
                .range([0.12 * document.getElementsByClassName('main-panel')[0].clientWidth, (1 - margin.right) * document.getElementsByClassName('main-panel')[0].clientWidth]),
        }
    },
    props: ["canvas_width", "canvas_height"],
    components: {
        TimeLineBookCard,
        TimeLineEventCard
    },
    computed: {
        ...mapState(["filter", "selection", "hover", "transition", "rem", "overlay_duration", "cur_view", "language"]),
    },
    watch: {
      curBookList: function(newVal, oldVal) {
        if (newVal.length !== 0) {
            console.log('curBookList改变啦', newVal)
        }
      },
      selection: function(newVal, oldVal) {
        const self = this
        self.curBookList = BookTraj.calTimelineBookPos(self.curBookList, newVal.value, line_height, rem)
      }
    },
    methods: {
        // generate curBookList
        handleBookData() {
            const self = this
            for (let book in self.data) {
                self.data[book] = BookTraj.time_info_rehandle(self.data[book])
                for (let event in self.data[book]) {
                    self.data[book][event].library = BookTraj.handle_library_name(self.data[book][event].library)
                }
                // 书本信息
                let pass_book_detail = Data.read_books().filter((d) => d.book_name === book)[0] // 后续需要经过语言选择处理
                pass_book_detail = InfoCardFunc.book_info_language(self.language, pass_book_detail)
                self.curBookList.push({
                    book_name: book,
                    book_name_lang: Translate.book_name_lang[book],
                    events: self.data[book],
                    ifShow: true,
                    transY: null,
                    opacity: 1,
                    book_detail: { // 筛选出book整体信息
                        ...pass_book_detail,
                        y: 0,
                        ...{lib_type: self.data[book][0].lib_type},
                        ...{ifShow: true}
                    },
                    y: 0, // for book card
                    height: 0 // for book card
                })
                self.tagPosDict[book] = [] // 用于标记每个tag是否显示，初始化为空列表
            }
            // 默认按照到日本的时间进行排序
            self.curBookList = TimeLineUpdate.reorder_list(self.curBookList, 'default', null)
            // 计算y_pos
            self.curBookList = BookTraj.calTimelineBookPos(self.curBookList, self.selection.value, line_height, self.rem)
            
            setTimeout(function() {
                for (let i in self.curBookList) {
                    // console.log('self.curBookList[i]', self.curBookList[i])
                    self.drawSingleTimeline(self.curBookList[i])
                }
            }, 200)
        },
        async initializeTimeline() {
            // 强制切换视图为timeline
            this.$store.commit("changeCurViewForce", "timeline")
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

            this.timescale = d3.scaleTime()
                                // .domain([new Date(min_year, 1, 1), new Date(max_year, 1, 1)])
                                .domain([new Date(960, 1, 1), new Date(1965, 1, 1)]) // 为了绘图美观，前后延伸了15年
                                .range([margin.left * width, (1 - margin.right) * width]);

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
        },
        drawSingleTimeline(single_book_info) { // 对于每一本书，单独绘制
            const self = this
            const book_name = single_book_info.book_name
            let cur_svg = d3.select(`#${book_name}-svg`)
            // cur_svg.selectAll('g').remove()
            let event = cur_svg.selectAll('g')
                               .data(single_book_info.events)
                               .join('g')
                               .attr('id', (d, i) => `${book_name}-event-${(i + 1).toString()}`) // 为每一本book的每一个event group设置id
                               .attr('transform', `translate(0, ${self.rem})`)
            event.append('line')
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
                                        //  .on('pointerenter pointermove', bookCircleTooltipOn)
                                        //  .on('pointerleave', bookCircleTooltipOff)
                                        //  .on('click', clickLibCircle)
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
                )

            // new_version (重新布局标签的位置)
            const tagPosList = BookTraj.generateTextPos(self.rem, single_book_info.events, self.timescale, self.language)
            // 再次遍历，重新分配位置
            for (let j = 0; j < tagPosList.length; j++) {
                const x_new = (tagPosList[j].span[0] + tagPosList[j].span[1]) / 2
                const ifShow = tagPosList[j].if_show
                self.tagPosDict[book_name].push(ifShow) // 更新tagPosDict中每个标签的显示状态
                d3.select(`.${book_name}-tag-${(j + 1).toString()}`)
                    .style('visibility', ifShow === true? 'visible': 'hidden')
                    .selectAll('tspan')
                    .attr('x', function() {
                    if (x_new !== x_new) {
                    return this.parentNode.getAttribute('x')
                    } else { return x_new }
                    })
            }

            // 左侧书目
            cur_svg.append("text")
                    .attr("x", document.getElementsByClassName('main-panel')[0].clientWidth * 0.002)
                    .text(() => {
                        if (self.language === 'zh') {
                            return single_book_info.book_name_lang.zh
                        } else if (self.language === 'en') {
                            return single_book_info.book_name_lang.en
                        }
                    })
                    // .text((d) => d.book_name)
                    // .text((d) => d.book_name.length <= 6 ? d.book_name : d.book_name.slice(0, 6) + '...')
                    .attr('id', () => `${book_name}-book_name`)
                    .attr('transform', `translate(0, ${self.rem})`)
                    .style('cursor', 'pointer') // hover上去以后鼠标变为手的形状
        }
    },
    mounted() {
        this.data = get_book_traj().book_traj
        this.rowHeight = this.rem * 2.5

        console.log('rem', this.rem)
        console.log(this.data)
        this.handleBookData()
        this.initializeTimeline()
        window.addEventListener('scroll', this.scrollEvent)
    },
    destroyed() {
    }
}
</script>

<style scoped lang="scss">
#container {
    position: absolute;
    width: 100%;
    height: 100%;
    overflow-y: auto;
    z-index: 2;
    .timeline-basic {
        position: absolute;
    }
}
#detail-info-card {
    z-index: 1;
}
</style>