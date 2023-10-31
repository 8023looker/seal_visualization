<template>
    <div class="timeAxis-container"></div>
</template>

<script>
import { mapState } from "vuex";
const d3 = require("d3");
import * as Data from "@/data/TimeLineData";
// import { get_book_traj } from "@/data/BookTraj";
// import * as BookTraj from "@/data/BookTraj";
// import { type_color } from "@/theme";
import * as Translate from "@/theme/lang";
// import * as RenderAxis from "@/data/timeline/timeline_full/render_axis"
import * as DataProcess from "@/utils/data_process"

const $ = require("jquery");
const margin = {
    top: 0.01,
    left: 0.01,
    right: 0.01,
    bottom: 0.01,
};
export default {
name: "TimeAxis",
props: [
    "canvasWidth",
    "canvasHeight",
    "timeStart",
    "timeEnd",
    "isEvent",
    "isDynasty",
    // "timeGran",
    "events"
],
data() {
    return {
        // isEvent: true,
        // isDynasty: true,
        data: null, // 读入的总数据
        specialData: {}, // 只将special events保留的data
        specialEvents: {}, // 用于绘制special event circle的data + 包含每本书special events的数据
        timeGran: "year",
        time_range_click: null, // 用于标志时间段刷选的是哪一个
        event_offset: 0, // y_offset of event_circle
        };
    },
    props: ["canvas_width", "canvas_height", "data"],
    computed: {
        ...mapState(["yearRange", "transition", "rem", "overlay_duration", "cur_view", "language", "painting_name"]),
    },
    watch: {  
        language: function(newVal, oldVal) { // 切换语言的接口
            console.log('timeAxis切换语言', newVal)
            this.initializeTimeline(
            this.canvasWidth,
            this.canvasHeight,
            this.timeStart,
            this.timeEnd,
            this.isDynasty,
            this.isEvent
            )
        },
        // cur_view: function(newVal, oldVal) {
        //     this.initializeTimeline(
        //         this.canvasWidth,
        //         this.canvasHeight,
        //         this.timeStart,
        //         this.timeEnd,
        //         this.isDynasty,
        //         this.isEvent
        //     )
        // },
    },
    methods: {
        initializeTimeline(
        // sWidth = $(".app").width() * 0.85 * 1.176, // main-panel换参数了，修改为原$('.app') * 0.85, 1.176 * 0.85 ≈ 1
        sWidth = $(".main-panel").width() * 0.99, // $(".time-axis").width()
        sHeight= $(".main-panel").height() * 0.1,
        // sHeight = DataProcess.vhToPx(10),
        // 下列参数值改为可变形式
        // yearStart = 1000, // 1101(ori)， 1090
        yearStart = 1450, // 1101(ori)， 1090
        yearEnd = 1965, // 1953(ori)， 1965
        dynasty,
        event,
        yearStep = 25
        ) {
        const self = this
        const width = sWidth;
        console.log('timeAxisSize', [sWidth, sHeight])
        console.log('rem', this.rem) // 大屏：20
        console.log('timeAxis-sWidth-sHeight', sWidth, sHeight)
        const height = (sHeight / sWidth) * width;
        let ih = height * (1 - margin.top - margin.bottom);
        let iw = width * (1 - margin.left - margin.right);
        // 控制栏总宽度
        let cw = iw / 10;
        this.bins = Data.getBins(yearStart, yearEnd, yearStep);
        this.periodLegendData = Data.getPeriodLegend();
        this.bigEventData = Data.getBigEvent();
        this.jpPeriodData = Data.getJpPeriodData();
        console.log('yearStart, yarEnd', [yearStart, yearEnd])
        // console.log('cw', cw, margin.left * sWidth)
        this.timeScale = d3.scaleLinear()
                            .domain([yearStart, yearEnd])
                            .range([0.08 * sWidth, iw])

        let stepWidth =
            this.timeScale(yearStart + yearStep) - this.timeScale(yearStart);
        let bandWidth = stepWidth / 3;
        let gapWidth = (stepWidth - bandWidth) / 2;
        d3.select(this.$el).select('svg').remove()
        // container
        this.svg = d3
            .select(this.$el)
            .append("svg")
            .attr("height", `${sHeight}`)
            .attr("width", `${iw}`)
            // .attr("viewBox", `0 0 ${width} ${height}`)
        let bottomAxis = d3
            .axisBottom(this.timeScale)
            .ticks((yearEnd - yearStart) / yearStep)
            .tickFormat((d) => d);
        // 分割线与文字分隔竖线之间的距离
        let gap = ih / 15;
        // 分割线起始位置
        let divloc = ih / 5;
        // 文字分割线高度
        let th = ih / 10;
        // 时间范围轴的宽度
        let rw = 10;

        // main container
        this.container = this.svg
                                .append("g")
                                .attr('id', 'timeline-full-axis')

        // 控制栏
        // 分割线
        this.container.append("g").call((g) => {
            g.append("line")
                .attr("transform", `translate(0, ${1.5})`)
                .attr("stroke", "#6a4c2a")
                .attr("x1", 0)
                .attr("x2", 0.08 * sWidth - 2 * gap)
                .attr("stroke-width", 1.5);
        });
        this.container.append("g").call((g) => {
            g.append("line")
                .attr("transform", `translate(${0}, ${3 * divloc - divloc / 3 + gap + th})`) // max = ih
                .attr("stroke", "#6a4c2a")
                .attr("x1", 0)
                .attr("x2", 0.08 * sWidth - 2 * gap)
                .attr("stroke-width", 1.5);
        });
        // 文字提示方框+文字
        this.container.append("g")
            .attr("transform", `translate(${0}, ${gap})`) // max = ih
            .call((g) => {
            g.append("rect")
            .attr("x", 0)
            .attr("y", divloc / 2)
            .attr("width", divloc / 4)
            .attr("height", divloc / 4)
            .attr("stroke", "#6a4c2a")
            // .attr("stroke-width", 1.5)
            .attr("fill", "#6a4c2a");
            g.append("text")
            .attr("x", divloc / 2 )
            .attr("y", divloc * 5 / 6)
            .style("fill", "#6a4c2a")
            .attr("font-size", self.rem * 0.9)
            .attr("font-family", "FZQINGKBYSJF")
            .text(() => {
                if (this.language === 'zh') {
                    return Translate.axis_labels['时间（公元）'].zh
                } else if (this.language === 'en') {
                    return Translate.axis_labels['时间（公元）'].en
                }    
            })
        });

        this.container.append("g").call((g) => {
            g.append("rect")
                .attr("x", 0)
                .attr("y", 3 * divloc - 5 * divloc / 12) // 3 * divloc / 10 + 4 * divloc
                .attr("width", divloc / 4)
                .attr("height", divloc / 4)
                .attr("stroke", "#6e4d2b")
                .attr("fill", "#6e4d2b");
            g.append("text")
                .attr("x", divloc / 2)
                .attr("y", 3 * divloc - divloc / 12) // 4 * divloc + 6.5 * divloc / 10
                .style("fill", "#6e4d2b")
                .attr("font-size", self.rem * 0.9)
                .attr("font-family", "FZQINGKBYSJF")
                .text(() => {
                    if (this.language === 'zh') {
                        return '朝代' // Translate.axis_labels['朝代'].zh
                    } else if (this.language === 'en') {
                        return  'Dynasty' // Translate.axis_labels['朝代'].en, 可能没有存储“朝代”的英文翻译
                    }    
                })
        })
        this.event_offset = 3 * divloc - divloc / 5 + 2 * gap + th
        this.container
            .append("g")
            .attr("transform", `translate(${0}, ${0})`) // 3 * divloc - divloc / 3 + gap + th
            .call(bottomAxis)
            .call((g) => {
            g.select(".domain")
                .attr("stroke", "#6a4c2a")
                .attr("stroke-width", 2)
                .attr("transform", `translate(0, ${1.5})`);
            g.selectAll(".tick")
                .append("line")
                .attr("stroke", "#ad9278")
                .attr("y2", function (d) {
                    if (d % 100 === 0) return 10;
                    else { return 6 } 
                })
                .attr("stroke-width", 1)
                // .style('visibility', (d) => d === 1960? 'hidden' : 'block')
            g.selectAll("text")
                .text(function (d) {
                    if (d == 0) return 1;
                    else return d;
                })
                .attr("font-size", function (d) {
                    if (d % 100 === 0) return self.rem * 0.6;
                    else return self.rem * 0.5;
                })
                .attr("dy", function (d) {
                    if (d % 100 === 0) return 5;
                    else return 2;
                })
                .attr('font-weight', (d) => d % 100 === 0 ? 'bold' : null)
                .attr("fill", "#5a3a20")
                .attr("alignment-baseline", "hanging")
                // .style('visibility', (d) => d === 1960? 'hidden' : 'block')
            });
        // 分隔线
        // if (dynasty == true) {
        this.container
            .append("g")
            .attr("transform", `translate(${0}, ${1.7 * divloc + divloc / 5})`)
            .call((g) => {
                g.append("line")
                .attr("stroke", "#ad9278")
                .attr("x1", 0.08 * sWidth)
                .attr("x2", iw)
                .attr("stroke-width", 0.8);
            });

        // period legend
        this.container
            .append("g")
            .selectAll("g")
            .data(this.periodLegendData)
            .join("g")
            .attr("x", (d) => this.timeScale(d[0]))
            .attr("transform", (d) => `translate(${this.timeScale(d[1])}, 0)`) // 3 * divloc - divloc / 3 + gap + th
            .call((g) => {
                g.append("line")
                    .attr("transform", `translate(${0}, ${5 * divloc / 2 - 0.5 * gap})`) // divloc + divloc / 5 + 0.5 * gap
                    .attr("stroke", "#ad9278")
                    .attr("y2", th + divloc / 5)
                    .attr("stroke-width", 0.8)
                    .style('display', (d) => d[0] === '宋'? 'none': 'block')
                g.append("text")
                    .attr("transform", `translate(${3}, ${5 * divloc / 2 - 0.5 * gap + th * 3 / 4})`)
                    .text(d => {
                        if (this.language === 'zh') {
                            return Translate.dynasties.China[d[0]].zh
                        } else if (this.language === 'en') {
                            return Translate.dynasties.China[d[0]].en
                        }    
                    })
                    .attr(
                        "x",
                        (d) => 0.5 * (this.timeScale(d[2]) - this.timeScale(d[1])) - 3
                    )
                    .attr("y", -5);
                g.selectAll("text")
                    .attr("font-family", "FZQINGKBYSJF")
                    .attr("font-size", self.rem * 0.8)
                    .attr("fill", "#6e4d2b")
                    .attr("alignment-baseline", "hanging")
                    .attr("text-anchor", "middle")
                    .style('cursor', 'pointer') // hover上去以后鼠标变为手的形状
            });
   
        // 拖动轴(最下面的line)
        this.container // 目前是最上面的轴
            .append("line")
            .attr("transform", `translate(${0}, ${3 * divloc - divloc / 3 + gap + th})`) // 移动到最上面
            .attr("x1", 0.08 * sWidth)
            .attr("x2", iw)
            .attr("stroke", "#6a4c2a")
            .attr("stroke-width", 2);
        },
    },
    mounted() {
        // this.data = get_book_traj().book_traj // 获取总数据
        this.initializeTimeline(
        this.canvasWidth,
        this.canvasHeight,
        this.timeStart,
        this.timeEnd,
        this.isDynasty,
        this.isEvent
        );
    },
};
</script>

<style scoped lang="scss">
.timeAxis-container {
    user-select: none;
}
</style>