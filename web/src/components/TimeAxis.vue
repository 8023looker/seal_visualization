<!-- <template>
    <div class="container"></div>
</template>

<script>
import { mapState } from "vuex";
const d3 = require("d3");
import * as Data from "@/data/TimeLineData";
import { get_book_traj } from "@/data/BookTraj";
import * as BookTraj from "@/data/BookTraj";
import { type_color } from "@/theme";
import * as Translate from "@/theme/lang";

const margin = {
top: 0.08,
left: 0.02,
right: 0.02,
// left: 0.2,
// right: 0.05,
bottom: 0.1,
};
export default {
name: "TimeLine",
props: [
    "canvasWidth",
    "canvasHeight",
    "timeStart",
    "timeEnd",
    "isEvent",
    "isDynasty",
    // "timeGran",
],
data() {
    return {
        // isEvent: true,
        // isDynasty: true,
        data: null, // 读入的总数据
        specialData: {}, // 只将special events保留的data
        specialEvents: {}, // 用于绘制special event circle的data + 包含每本书special events的数据
        timeGran: "year",
        time_range_click: null // 用于标志时间段刷选的是哪一个
        };
    },
    computed: {
        ...mapState(["yearRange", "filter", "selection", "hover", "transition", "rem", "overlay_duration", "cur_view", "language"]),
    },
    watch: {
        selection: function (newVal, oldVal) {
            const constraints = {
                    filter: this.filter,
                    selection: this.selection,
                    hover: this.hover,
                }
            const that = this
            that.specialEvents = Data.timeAxisInteraction(that.specialData, that.specialEvents, constraints)
            // if (newVal.value === null) {
            //     for (let book in that.data) {
            //         d3.selectAll(`.${book}-link`)
            //             .style('opacity', 0.3)
            //             .attr('stroke-width', 0.5)
            //             .attr("filter", 'none')
            //         for (let i = 0; i < that.data[book].length; i++) {
            //             d3.selectAll(`#${book}-${that.data[book][i].lib_type}-circle`)
            //                 .attr('fill', type_color.library[that.data[book][i].lib_type])
            //                 .attr('r', 5)
            //                 .attr("filter", 'none')
            //         }
            //     }
            // } else {
            //     if (newVal.entity === 'edition') {
            //         const select_book_name = newVal.value
            //         d3.selectAll(`.${select_book_name}-link`)
            //             .style('opacity', 0.7)
            //             .attr('stroke-width', 1)
            //             .attr("filter", 'drop-shadow(2px 2px 1px rgb(0 0 0 / 0.2))')
            //         for (let i = 0; i < that.data[select_book_name].length; i++) {
            //             d3.selectAll(`#${select_book_name}-${that.data[select_book_name][i].lib_type}-circle`)
            //                 .attr('fill', type_color.library.bright[that.data[select_book_name][i].lib_type])
            //                 .attr('r', 7)
            //                 .attr("filter", 'drop-shadow(3px 2px 2px rgb(0 0 0 / 0.6))')
            //         }
            //     }
            // }
        },

        hover: function (newVal, oldVal) {
            const constraints = {
                    filter: this.filter,
                    selection: this.selection,
                    hover: this.hover,
                }
            const that = this
            that.specialEvents = Data.timeAxisInteraction(that.specialData, that.specialEvents, constraints)
        },

        filter: {
            handler: function (newVal, oldVal) {
            // console.log('filter有变化啦')
                const constraints = {
                    filter: this.filter,
                    selection: this.selection,
                    hover: this.hover,
                }
                const that = this
                that.specialEvents = Data.timeAxisInteraction(that.specialData, that.specialEvents, constraints)
            },
            deep: true
        },
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
        }
    },
    methods: {
        initializeTimeline(
        sWidth = document.getElementsByClassName('time-axis')[0].clientWidth,
        sHeight= document.getElementsByClassName('time-axis')[0].clientHeight, 
        // 下列参数值改为可变形式
        // yearStart = 1000, // 1101(ori)， 1090
        yearStart = 960, // 1101(ori)， 1090
        yearEnd = 1965, // 1953(ori)， 1965
        dynasty,
        event,
        yearStep = 25
        ) {
        const width = 2560;
        console.log('timeAxisSize', [sWidth, sHeight])
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
        this.timeScale = d3
            .scaleLinear()
            .domain([yearStart, yearEnd])
            .range([0.12 * sWidth, iw])
            // .range([margin.left * sWidth, (1 - margin.right) * sWidth])
            // .range([cw, iw])
        // this.yScale = d3
        //     .scaleLinear()
        //     .domain([0, d3.max(this.bins, (d) => d[2])])
        //     .range([ih, 0]);
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
            .attr("width", `${sWidth}`)
            .attr("viewBox", `0 0 ${width} ${height}`)
        let bottomAxis = d3
            .axisBottom(this.timeScale)
            .ticks((yearEnd - yearStart) / yearStep)
            .tickFormat((d) => d);
        // 分割线与文字分隔竖线之间的距离
        let gap = ih / 15;
        // 分割线起始位置
        let divloc = ih / 5;
        // 文字分割线高度
        // let th = (ih * 3) / 15;
        let th = ih / 10;
        // 时间范围轴的宽度
        let rw = 10;

        // 首先添加一层透明的svg，用于点击“空白处”时取消选择(unselect circle)
        const unselected_layer = this.svg.append('g')
        unselected_layer
            .append("rect")
            .attr("x", 0.12 * sWidth)
            .attr('y', divloc + 2 * divloc / 5 + gap + th)
            .attr("width", iw - 0.12 * sWidth)
            .attr("height", divloc * 7 / 5 + gap)
            .attr("fill-opacity", 0)
            .on("click", () => {
                this.$store.commit("changeSelection", {
                    entity: "edition",
                    value: null
                })
                this.$store.commit("changeFilter", {
                    entity: "china2japan",
                    value: null
                })
                this.$store.commit("changeSelection", {
                entity: "editions",
                value: null
                })
                // 恢复icon的原样式
                d3.selectAll('.icon-line')
                    .attr('stroke-width', 1)
                    .attr("filter", 'none')
                d3.selectAll('.icon-circle')
                    .attr('r', 5)
                    .attr("filter", 'none')
                d3.selectAll('.icon-text')
                    .attr('font-weight', null)
                    .attr("filter", 'none')
            })
        // 取消刷选Chinese Period
        unselected_layer
            .append("rect")
            .attr("x", 0.12 * sWidth)
            .attr('y', divloc + divloc / 5)
            .attr("width", iw - 0.12 * sWidth)
            .attr("height", divloc/ 5 + gap + th)
            .attr("fill-opacity", 0)
            .on("click", () => {
                this.$store.commit("changeFilter", {entity: "time_range", value: [960, 1965]})
                this.time_range_click = null
            })
        // 取消刷选Japanese Period
        unselected_layer
            .append("rect")
            .attr("x", 0.12 * sWidth)
            .attr('y', 3 * divloc - divloc / 5 + 2 * gap + th)
            .attr("width", iw - 0.12 * sWidth)
            .attr("height", divloc/ 5 + gap + th)
            .attr("fill-opacity", 0)
            .on("click", () => {
                this.$store.commit("changeFilter", {entity: "time_range", value: [960, 1965]})
                this.time_range_click = null
            })

        // main container
        this.container = this.svg
            .append("g")
            // .attr(
            // "transform",
            // `translate(${width * margin.left}, ${height * margin.top})`
            // );
        // 控制栏
        // 分割线
        this.container.append("g").call((g) => {
            g.append("line")
            .attr("transform", `translate(0, ${1.5})`)
            .attr("stroke", "#6a4c2a")
            .attr("x1", 0)
            .attr("x2", 0.12 * sWidth - 2 * gap)
            .attr("stroke-width", 1.5);
        });
        this.container.append("g").call((g) => {
            g.append("line")
            .attr("transform", `translate(${0}, ${ih})`)
            .attr("stroke", "#6a4c2a")
            .attr("x1", 0)
            .attr("x2", 0.12 * sWidth - 2 * gap)
            .attr("stroke-width", 1.5);
        });
        // 文字提示方框+文字
        this.container.append("g").call((g) => {
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
            .attr("y", 4 * divloc / 5)
            .style("fill", "#6a4c2a")
            .attr("font-size", 18)
            .attr("font-family", "FZQINGKBYSJF")
            // .text("时间（公元）")
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
            .attr("y", divloc * 2 / 3 + divloc)
            .attr("width", divloc / 4)
            .attr("height", divloc / 4)
            .attr("stroke", "#6a4c2a")
            .attr("fill", "#6a4c2a");
        g.append("text")
            .attr("x", divloc / 2)
            .attr("y", 2 * divloc)
            .style("fill", "#6a4c2a")
            .attr("font-size", 18)
            .attr("font-family", "FZQINGKBYSJF")
            // .text("中国朝代")
            .text(() => {
                if (this.language === 'zh') {
                    return Translate.axis_labels['中国朝代'].zh
                } else if (this.language === 'en') {
                    return Translate.axis_labels['中国朝代'].en
                }    
            })
        })
        // 删掉不写
        // this.container.append("g").call((g) => {
        // g.append("rect")
        //     .attr("x", 0)
        //     .attr("y", 2 * divloc / 5 + 2 * divloc)
        //     .attr("width", divloc / 4)
        //     .attr("height", divloc / 4)
        //     .attr("stroke", "#6a4c2a")
        //     .attr("fill", "#6a4c2a");
        // g.append("text")
        //     .attr("x", divloc / 2)
        //     .attr("y", 2 * divloc + 3 * divloc / 4)
        //     .style("fill", "#6a4c2a")
        //     .attr("font-size", 18)
        //     .attr("font-family", "FZQINGKBYSJF")
        //     .text("中日时间差");
        // });
        const eventCircle = this.container
            .append('g') 
            .attr('class', 'event-icon')
            .style('cursor', 'pointer') // hover上去以后鼠标变为手的形状
            .on('pointerenter pointermove', () => {
                this.$store.commit("changeHover", {
                        entity: "china2japan",
                        value: true
                    })
                // highlight icon-group
                d3.selectAll('.icon-line')
                    .attr('stroke-width', 1.5)
                    .attr("filter", 'drop-shadow(2px 2px 1px rgb(0 0 0 / 0.2))')
                d3.selectAll('.icon-circle')
                    .attr('r', 5.5)
                    .attr("filter", 'drop-shadow(3px 2px 2px rgb(0 0 0 / 0.6))')
                d3.selectAll('.icon-text')
                    .attr('font-weight', 'bold')
                    .attr("filter", 'drop-shadow(2px 2px 1px rgb(0 0 0 / 0.2))')
            })
            .on('pointerleave', () => {
                this.$store.commit("changeHover", {
                        entity: "china2japan",
                        value: null
                })
                if (this.filter.china2japan !== true) {
                    d3.selectAll('.icon-line')
                        .attr('stroke-width', 1)
                        .attr("filter", 'none')
                    d3.selectAll('.icon-circle')
                        .attr('r', 5)
                        .attr("filter", 'none')
                    d3.selectAll('.icon-text')
                        .attr('font-weight', null)
                        .attr("filter", 'none')
                }
            })
            .on('click', () => {
                if (this.filter.china2japan !== null) {
                    this.$store.commit("changeFilter", {
                        entity: "china2japan",
                        value: null
                    })
                    if (this.filter.china2japan !== true) {
                        d3.selectAll('.icon-line')
                            .attr('stroke-width', 1)
                            .attr("filter", 'none')
                        d3.selectAll('.icon-circle')
                            .attr('r', 5)
                            .attr("filter", 'none')
                        d3.selectAll('.icon-text')
                            .attr('font-weight', null)
                            .attr("filter", 'none')
                    }
                } else {
                    this.$store.commit("changeFilter", {
                        entity: "china2japan",
                        value: true
                    })
                    d3.selectAll('.icon-line')
                        .attr('stroke-width', 1.5)
                        .attr("filter", 'drop-shadow(2px 2px 1px rgb(0 0 0 / 0.2))')
                    d3.selectAll('.icon-circle')
                        .attr('r', 5.5)
                        .attr("filter", 'drop-shadow(3px 2px 2px rgb(0 0 0 / 0.6))')
                    d3.selectAll('.icon-text')
                        .attr('font-weight', 'bold')
                        .attr("filter", 'drop-shadow(2px 2px 1px rgb(0 0 0 / 0.2))')
                }        
            })

        eventCircle
            .selectAll('circle')
            .data(['block_print', 'last_China', 'first_Japan'])
            .join('circle')
            .attr('class', 'icon-circle')
            .attr('cx', (d, i) => i * 0.02 * sWidth + 0.015 * sWidth)
            .attr('cy', (d, i) => {
                if (i < 2) {
                    return 3 * divloc / 5 + 2 * divloc
                } else {
                    return 3 * divloc + gap + th
                }
            })
            .attr("fill", "#6e4d2b")
            .attr('stroke', '#6e4d2b')
            .attr('r', 5)

        eventCircle.append('text')
                    .attr('class', 'icon-text')
                    // .text('刊刻')
                    .text(() => {
                        if (this.language === 'zh') {
                            return Translate.axis_labels['刊刻'].zh
                        } else if (this.language === 'en') {
                            return Translate.axis_labels['刊刻'].en
                        }    
                    })
                    .attr('x', 0.015 * sWidth)
                    .attr("y", 3 * divloc / 5 + 2 * divloc + 8)
                    .attr("font-family", "FZQINGKBYSJF")
                    .attr("font-size", 15)
                    .attr("fill", "#6e4d2b")
                    .attr("alignment-baseline", "hanging")
                    .attr("text-anchor", "middle")
        eventCircle.append('text')
                    .attr('class', 'icon-text')
                    // .text('最后一次在中国')
                    .text(() => {
                        if (this.language === 'zh') {
                            return Translate.axis_labels['最后一次在中国'].zh
                        } else if (this.language === 'en') {
                            return Translate.axis_labels['最后一次在中国'].en
                        }    
                    })
                    .attr('x', 0.04 * sWidth)
                    .attr("y", 2 * divloc / 5 + 2 * divloc)
                    .attr("font-family", "FZQINGKBYSJF")
                    .attr("font-size", 15)
                    .attr("fill", "#6e4d2b")
                    .attr("alignment-baseline", "hanging")
                    .attr("text-anchor", "start")
        eventCircle.append('text')
                    .attr('class', 'icon-text')
                    // .text('首次传入日本')
                    .text(() => {
                        if (this.language === 'zh') {
                            return Translate.axis_labels['首次传入日本'].zh
                        } else if (this.language === 'en') {
                            return Translate.axis_labels['首次传入日本'].en
                        }    
                    })
                    .attr('x', 0.06 * sWidth)
                    .attr("y", 3 * divloc + gap + th + 5)
                    .attr("font-family", "FZQINGKBYSJF")
                    .attr("font-size", 15)
                    .attr("fill", "#6e4d2b")
                    // .attr("alignment-baseline", "hanging")
                    .attr("text-anchor", "start")
        // eventCircle.append('path')
        //             // .attr('d', `M${0.015 * sWidth},${3 * divloc / 5 + 2 * divloc} Q ${0.025 * sWidth},${3 * divloc / 5 + 2 * divloc - th} ${0.035 * sWidth},${3 * divloc / 5 + 2 * divloc}`)
        //             .attr('d', `M${0.015 * sWidth},${3 * divloc / 5 + 2 * divloc} Q ${0.025 * sWidth},${3 * divloc / 5 + 2 * divloc - th} ${0.035 * sWidth},${3 * divloc / 5 + 2 * divloc}`)
        //             .attr('stroke', '#6e4d2b')
        //             .attr('fill', 'none')
                    // .style('opacity', 0.8)
                    // .attr('stroke-width', 0.7)
        const link = d3.line()
                        .curve(d3.curveBasis)
        const basis_data = [
            [0.015 * sWidth, 3 * divloc / 5 + 2 * divloc],
            [0.025 * sWidth, 3 * divloc / 5 + 2 * divloc - th],
            [0.035 * sWidth, 3 * divloc / 5 + 2 * divloc],
            [0.04 * sWidth, 3 * divloc / 5 + 2 * divloc + gap + th],
            [0.055 * sWidth, 3 * divloc + gap + th]
        ]
        eventCircle.append('path')
                    .attr('class', 'icon-line')
                    // .attr('d', link([[0.035 * sWidth, 3 * divloc / 5 + 2 * divloc], [0.055 * sWidth, 3 * divloc + gap + th]]))
                    .attr('d', link(basis_data))
                    // .attr('d', `M${0.015 * sWidth},${3 * divloc / 5 + 2 * divloc} Q ${0.025 * sWidth},${3 * divloc / 5 + 2 * divloc - th} ${0.035 * sWidth},${3 * divloc / 5 + 2 * divloc}`)
                    .attr('stroke', '#6e4d2b')
                    .attr('stroke-width', 1)
                    .attr('fill', 'none')
                    // .style('opacity', 0.8)
                    // .attr('stroke-width', 0.7)
        // g.append("rect")
        //     .attr("x", 0)
        //     .attr("y", 3 * divloc / 10 + 4 * divloc)
        //     .attr("width", divloc / 4)
        //     .attr("height", divloc / 4)
        //     .attr("stroke", "#6e4d2b")
        //     .attr("fill", "#6e4d2b");
        // g.append("text")
        //     .attr("x", divloc / 2)
        //     .attr("y", 4 * divloc + 6.5 * divloc / 10)
        //     .style("fill", "#6e4d2b")
        //     .attr("font-size", 18)
        //     .attr("font-family", "FZQINGKBYSJF")
        //     .text("日本朝代");

        this.container.append("g").call((g) => {
        g.append("rect")
            .attr("x", 0)
            .attr("y", 3 * divloc / 10 + 4 * divloc)
            .attr("width", divloc / 4)
            .attr("height", divloc / 4)
            .attr("stroke", "#6e4d2b")
            .attr("fill", "#6e4d2b");
        g.append("text")
            .attr("x", divloc / 2)
            .attr("y", 4 * divloc + 6.5 * divloc / 10)
            .style("fill", "#6e4d2b")
            .attr("font-size", 18)
            .attr("font-family", "FZQINGKBYSJF")
            // .text("日本朝代")
            .text(() => {
                if (this.language === 'zh') {
                    return Translate.axis_labels['日本朝代'].zh
                } else if (this.language === 'en') {
                    return Translate.axis_labels['日本朝代'].en
                }    
            })
        })
        this.container
            .append("g")
            // .attr("transform", `translate(${0}, ${ih})`)
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
                .style('visibility', (d) => d === 1960? 'hidden' : 'block')
            g.selectAll("text")
                .text(function (d) {
                if (d == 0) return 1;
                else return d;
                })
                .attr("font-size", function (d) {
                if (d % 100 === 0) return 13;
                else return 11;
                })
                .attr("dy", function (d) {
                if (d % 100 === 0) return 5;
                else return 2;
                })
                .attr('font-weight', (d) => d % 100 === 0 ? 'bold' : null)
                .attr("fill", "#5a3a20")
                .attr("alignment-baseline", "hanging")
                .style('visibility', (d) => d === 1960? 'hidden' : 'block')
            });
        // 分隔线
        // if (dynasty == true) {
        this.container
            .append("g")
            .attr("transform", `translate(${0}, ${divloc + divloc / 5})`)
            .call((g) => {
                g.append("line")
                .attr("stroke", "#ad9278")
                .attr("x1", 0.12 * sWidth)
                .attr("x2", iw)
                .attr("stroke-width", 0.8);
            });

            // hover China Dynasty
            const ChinaDynastyPointerMove = function(event) {
                d3.select(event.srcElement).attr("filter", 'drop-shadow(2px 2px 1px rgb(0 0 0 / 0.2))')
                const year_range = event.srcElement.__data__ // 格式：['室町', 1392, 1603]
                if (year_range[0] !== year_self.time_range_click) {
                    year_self.container
                        .append('rect')
                        .attr('id', `${year_range[0]}-rect-hover`)
                        .attr('x', year_self.timeScale(year_range[1]))
                        .attr('y', divloc + divloc / 5 + 0.5 * gap)
                        .attr('height', divloc + divloc / 5 - 1.5 * gap)
                        .attr('width', year_self.timeScale(year_range[2]) - year_self.timeScale(year_range[1]))
                        .attr('fill', '#6e4d2b')
                        .style('opacity', 0.05)
                        .style("pointer-events", "none") // 使<rect>元素不会在鼠标悬停时阻止对文本的访问
                }         
            }

            // unhover China Dynasty
            const ChinaDynastyPointerLeft = function(event) {
                d3.select(event.srcElement).attr("filter", 'none')
                const year_range = event.srcElement.__data__ // 格式：['室町', 1392, 1603]
                if (year_self.time_range_click !== year_range[0]) {
                    d3.select(`#${year_range[0]}-rect-hover`).remove()
                }
            }
            // click China Dynasty
            const ChinaDynastyClick = function(event) {
                d3.select(event.srcElement).attr("filter", 'drop-shadow(2px 2px 1px rgb(0 0 0 / 0.2))')
                const year_range = event.srcElement.__data__ // 格式：['室町', 1392, 1603]
                year_self.$store.commit("changeFilter", {entity: "time_range", value: [year_range[1], year_range[2]]})
                // 用于更新当前当前click的时间段
                if (year_self.time_range_click !== year_range[0]) { // if当前没有选择该时间段，rect去掉
                    d3.select(`#${year_self.time_range_click}-rect-click`).remove()
                    d3.select(`#${year_self.time_range_click}-rect-hover`).remove()
                    year_self.time_range_click = year_range[0] // 更新为当前时代的名字
                    year_self.container
                        .append('rect')
                        .attr('id', `${year_range[0]}-rect-click`)
                        .attr('x', year_self.timeScale(year_range[1]))
                        .attr('y', divloc + divloc / 5 + 0.5 * gap)
                        .attr('height', divloc + divloc / 5 - 1.5 * gap)
                        .attr('width', year_self.timeScale(year_range[2]) - year_self.timeScale(year_range[1]))
                        .attr('fill', '#6e4d2b')
                        .style('opacity', 0.05)
                        .style("pointer-events", "none")
                }       
            }
            // period legend
            this.container
            .append("g")
            .selectAll("g")
            .data(this.periodLegendData)
            .join("g")
            .attr("x", (d) => this.timeScale(d[0]))
            .attr("transform", (d) => `translate(${this.timeScale(d[1])}, 0)`)
            .call((g) => {
                g.append("line")
                .attr("transform", `translate(${0}, ${divloc + divloc / 5 + 0.5 * gap})`)
                .attr("stroke", "#ad9278")
                .attr("y2", th + divloc / 5)
                .attr("stroke-width", 0.8)
                .style('display', (d) => d[0] === '宋'? 'none': 'block')
                g.append("text")
                .attr("transform", `translate(${3}, ${divloc + divloc / 5 + 0.5 * gap + th / 2})`)
                // .selectAll("tspan")
                // .data((d) => d[0])
                // .join("tspan")
                // .text((d) => d[0])
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
                .attr("font-size", 15)
                .attr("fill", "#6e4d2b")
                .attr("alignment-baseline", "hanging")
                .attr("text-anchor", "middle")
                .style('cursor', 'pointer') // hover上去以后鼠标变为手的形状
                .on('click', ChinaDynastyClick)
                .on('pointerenter', ChinaDynastyPointerMove)
                .on('pointerleave', ChinaDynastyPointerLeft)
                //special adjustment on font-size for "五代十国" due to the limited space
                // g.selectAll("text").each((d, i, e) => {
                // if (d[0] == '五代十国') {
                //     d3.select(e[0]).attr("font-size", 12);
                // }
                // })
            });
        // }
        // 分割线(中国朝代-中日时间差)
        // this.container
        //     .append("g")
        //     .attr("transform", `translate(${0}, ${2 * divloc + 1.5 * gap + th})`)
        //     .call((g) => {
        //     g.append("line")
        //         .attr("stroke", "#ad9278")
        //         .attr("x1", 0.12 * sWidth)
        //         .attr("x2", iw)
        //         .attr("stroke-width", 0.5)
        //         .style('opacity', 0.5)
        //     });
        this.container
            .append("g")
            .attr("transform", `translate(${0}, ${divloc + 2 * divloc / 5 + gap + th})`)
            .call((g) => {
            g.append("line")
                .attr("stroke", "#ad9278")
                .attr("x1", 0.12 * sWidth)
                .attr("x2", iw)
                .attr("stroke-width", 0.8);
            });
        // 分割线(中日时间差-日本朝代)
        this.container
            .append("g")
            .attr("transform", `translate(${0}, ${ 3 * divloc - divloc / 5 + 2 * gap + th })`)
            .call((g) => {
            g.append("line")
                .attr("stroke", "#ad9278")
                .attr("x1", 0.12 * sWidth)
                .attr("x2", iw)
                .attr("stroke-width", 0.8);
            })
        const year_self = this
        // hover Japan Dynasty
        const JapanDynastyPointerMove = function(event) {
            d3.select(event.srcElement).attr("filter", 'drop-shadow(2px 2px 1px rgb(0 0 0 / 0.2))')
            const year_range = event.srcElement.__data__ // 格式：['室町', 1392, 1603]
            if (year_range[0] !== year_self.time_range_click) {
                year_self.container
                    .append('rect')
                    .attr('id', `${year_range[0]}-rect-hover`)
                    .attr('x', year_self.timeScale(year_range[1]))
                    .attr('y', 3 * divloc - divloc / 5 + 2.5 * gap + th)
                    .attr('height', divloc + divloc / 5 - 1.5 * gap)
                    .attr('width', year_self.timeScale(year_range[2]) - year_self.timeScale(year_range[1]))
                    .attr('fill', '#6e4d2b')
                    .style('opacity', 0.05)
                    .style("pointer-events", "none")
            }      
        }

        // unhover Japan Dynasty
        const JapanDynastyPointerLeft = function(event) {
            d3.select(event.srcElement).attr("filter", 'none')
            // console.log('Japan Period', d3.select(event.srcElement))
            const year_range = event.srcElement.__data__ // 格式：['室町', 1392, 1603]
            if (year_self.time_range_click !== year_range[0]) {
                d3.select(`#${year_range[0]}-rect-hover`).remove()
            }
        }

        // click Japan Dynasty
        const JapanDynastyClick = function(event) {
            // console.log('JapanDynastyClick', event)
            d3.select(event.srcElement).attr("filter", 'drop-shadow(2px 2px 1px rgb(0 0 0 / 0.2))')
            const year_range = event.srcElement.__data__ // 格式：['室町', 1392, 1603]
            year_self.$store.commit("changeFilter", {entity: "time_range", value: [year_range[1], year_range[2]]})
            // 用于更新当前当前click的时间段
            if (year_self.time_range_click !== year_range[0]) { // if当前没有选择该时间段，rect去掉
                d3.select(`#${year_self.time_range_click}-rect-click`).remove()
                d3.select(`#${year_self.time_range_click}-rect-hover`).remove()
                year_self.time_range_click = year_range[0] // 更新为当前时代的名字
                year_self.container
                    .append('rect')
                    .attr('id', `${year_range[0]}-rect-click`)
                    .attr('x', year_self.timeScale(year_range[1]))
                    .attr('y', 3 * divloc - divloc / 5 + 2.5 * gap + th)
                    .attr('height', divloc + divloc / 5 - 1.5 * gap)
                    .attr('width', year_self.timeScale(year_range[2]) - year_self.timeScale(year_range[1]))
                    .attr('fill', '#6e4d2b')
                    .style('opacity', 0.05)
                    .style("pointer-events", "none")
            }            
        }
        // Japan period legend
        this.container
            .append("g")
            .selectAll("g")
            .data(this.jpPeriodData)
            .join("g")
            .attr("x", (d) => this.timeScale(d[0]))
            .attr("transform", (d) => `translate(${this.timeScale(d[1])}, 0)`)
            .call((g) => {
                g.append("line")
                    .attr("transform", `translate(${0}, ${4 * divloc - divloc / 5 + gap})`)
                    .attr("stroke", "#ad9278")
                    .attr("y2", th + divloc / 5)
                    .attr("stroke-width", 0.8)
                    .style('display', (d) => d[0] === '平安'? 'none': 'block')
                g.append("text")
                    .attr('class', 'period-text')
                    .attr('id', (d) => `${d[0]}-text`)
                    .attr("transform", `translate(${3}, ${4 * divloc - divloc / 10 + gap + th / 2})`)
                // .selectAll("tspan")
                // .data((d) => d[0])
                // .join("tspan")
                // .text((d) => d[0])
                .text(d => {
                    if (this.language === 'zh') {
                        return Translate.dynasties.Japan[d[0]].zh
                    } else if (this.language === 'en') {
                        return Translate.dynasties.Japan[d[0]].en
                    }    
                })
                .attr(
                    "x",
                    (d) => 0.5 * (this.timeScale(d[2]) - this.timeScale(d[1])) - 3
                )
                .attr("y", -5);
                g.selectAll("text")
                    .attr("font-family", "FZQINGKBYSJF")
                    .attr("font-size", 15)
                    .attr("fill", "#6e4d2b")
                    .attr("alignment-baseline", "hanging")
                    .attr("text-anchor", "middle")
                    .style('cursor', 'pointer') // hover上去以后鼠标变为手的形状
                    .on('click', JapanDynastyClick)
                    .on('pointerenter', JapanDynastyPointerMove)
                    .on('pointerleave', JapanDynastyPointerLeft)
                //special adjustment on font-size for "五代十国" due to the limited space
                // g.selectAll("text").each((d, i, e) => {
                // if (d[0] == '五代十国') {
                //     d3.select(e[0]).attr("font-size", 12);
                // }
                // })
            })
        // events
        if (event == true) {
            this.container
            .append("g")
            .selectAll("g")
            .data(this.bigEventData)
            .join("g")
            .attr("x", (d) => this.timeScale(d[0]))
            .attr("transform", (d) => `translate(${this.timeScale(d[1])}, 0)`)
            .call((g) => {
                g.append("line")
                .attr("transform", `translate(${0}, ${divloc + gap * 2 + th})`)
                .attr("stroke", "#ac9176")
                .attr("y2", th / 4)
                .attr("stroke-width", 1.5);
                g.append("text")
                .attr(
                    "transform",
                    `translate(${0}, ${divloc + gap * 4 + th + th / 4})`
                )
                .text((d) => d[0])
                .attr("y", -10);
                // .selectAll("tspan")
                // .data((d) => d[0])
                // .join("tspan")
                // .text((d) => d)
                // .attr("y", 0);
                g.selectAll("text")
                .attr("font-size", 18)
                .attr("fill", "#6e4d2b")
                .attr("alignment-baseline", "hanging")
                .attr("font-family", "FZQINGKBYSJF")
                .attr("text-anchor", "middle");
            });
        }
        // 拖动轴(最下面的line)
        this.container
            .append("line")
            .attr("transform", `translate(${0}, ${ih})`)
            .attr("x1", 0.12 * sWidth)
            .attr("x2", iw)
            .attr("stroke", "#6a4c2a")
            .attr("stroke-width", 2);
        
        // special events circle(第三行)
        this.specialEvent = this.container
                                .append('g')
                                .attr('class', 'special_events')
        // this.data = BookTraj.time_info_rehandle(this.data)
        // this.data = Data.add_event_state_flag_new(this.data) // 处理时间，并加入state_flag
        for (let book in this.data) {
            this.data[book] = BookTraj.time_info_rehandle(this.data[book])
        }
        console.log('this.data', this.data)
        for (let book in this.data) { // 对于每一本book
            this.specialEvents[book] = { // init
                    block_print: { // 首次刊刻
                        time: 1000,
                        lib_type: '未详',
                        lib_id: '未详',
                        agent: '未详',
                        agent_type: '未详'
                    },
                    Japan: { // 首次传入日本
                        time: 1000,
                        lib_type: '未详',
                        lib_id: '未详',
                        agent: '未详',
                        agent_type: '未详'
                    },
                    last_China: { // 最后一次在中国
                        time: 1000,
                        lib_type: '未详',
                        lib_id: '未详',
                        agent: '未详',
                        agent_type: '未详'
                    }
                }

            let meet_first_foreign = {
                index: 0,
                if_meet: false,
                time: 1000,
                lib_type: '未详',
                lib_id: '未详',
                agent: '未详',
                agent_type: '未详'
            }

            let last_China_events = {} // 用于specialData[book]导入last China event的dict
            year_self.specialData[book] = []
            for (let j = 0; j < this.data[book].length; j++) { // 对于book中的每一个event
                if (this.data[book][j].state_flag === 'block_print') {
                    year_self.specialData[book].push(this.data[book][j]) // block print
                    this.specialEvents[book].block_print = {
                        book_name: this.data[book][j].書名,
                        time: this.data[book][j].time_info.timestamp,
                        lib_type: this.data[book][j].lib_type,
                        lib_id: this.data[book][j].lib_id,
                        agent: this.data[book][j].agent,
                        agent_type: this.data[book][j].agent_type
                    }
                    meet_first_foreign.time = this.data[book][j].time_info.timestamp // 首先把last_China的时间更新为首次刊刻时间
                    meet_first_foreign.lib_type = this.data[book][j].lib_type
                    meet_first_foreign.lib_id = this.data[book][j].lib_id
                    meet_first_foreign.agent = this.data[book][j].agent
                    meet_first_foreign.agent_type = this.data[book][j].agent_type
                } else if (this.data[book][j].state_flag === 'Japan') {
                    year_self.specialData[book].push(this.data[book][j]) // first Japan

                    if (!(meet_first_foreign.if_meet)) { // meet_first_foreign.if_meet === false
                        last_China_events = this.data[book][j - 1]
                        meet_first_foreign = {
                            index: j - 1,
                            if_meet: true,
                            time: this.data[book][j - 1].time_info.timestamp,
                            lib_type: this.data[book][j - 1].lib_type,
                            lib_id: this.data[book][j - 1].lib_id,
                            agent: this.data[book][j - 1].agent,
                            agent_type: this.data[book][j - 1].agent_type
                        }
                    }
                    this.specialEvents[book].Japan = {
                        book_name: this.data[book][j].書名,
                        time: this.data[book][j].time_info.timestamp,
                        lib_type: this.data[book][j].lib_type,
                        lib_id: this.data[book][j].lib_id,
                        agent: this.data[book][j].agent,
                        agent_type: this.data[book][j].agent_type
                    }
                } else if (this.data[book][j].state_flag === 'transnational') {
                    if (!(meet_first_foreign.if_meet)) { // meet_first_foreign.if_meet === false
                        last_China_events = this.data[book][j - 1]

                        meet_first_foreign = {
                            index: j - 1,
                            if_meet: true,
                            time: this.data[book][j - 1].time_info.timestamp,
                            lib_type: this.data[book][j - 1].lib_type,
                            lib_id: this.data[book][j - 1].lib_id,
                            agent: this.data[book][j - 1].agent,
                            agent_type: this.data[book][j - 1].agent_type
                        }
                    }
                }
            }

            year_self.specialData[book].push(last_China_events) // last China

            this.specialEvents[book].last_China = {
                        book_name: book,
                        time: meet_first_foreign.time,
                        lib_type: meet_first_foreign.lib_type,
                        lib_id: meet_first_foreign.lib_id,
                        agent: meet_first_foreign.agent,
                        agent_type: meet_first_foreign.agent_type
                    }
            // 更新全局specialEvents[book]
            this.specialEvents[book]['book_name'] = book
            this.specialEvents[book]['book_type'] = year_self.data[book][0].book_type
            this.specialEvents[book]['opacity'] = 1

            const circleDataList = [
                {
                    block_print: this.specialEvents[book].block_print
                },{
                    Japan: this.specialEvents[book].Japan
                }, {
                    last_China: this.specialEvents[book].last_China
                }]
            // console.log('circleDataList',  circleDataList)
            const xTimeScale = d3
                                .scaleLinear()
                                .domain([960, 1965])
                                // .range([margin.left * sWidth, (1 - margin.right) * sWidth])
                                .range([0.12 * sWidth, iw])
            const singleSpecialEvent = this.specialEvent.append('g')
                                                        .attr('class', `${book}-specialEvents`)
                                // .style('opacity', 0.5)
            const link1 = d3.line() // 用于画last_China → first Japan的link
                            .curve(d3.curveBumpY)
            const link2 = d3.line() // 用于画block_print → last_China的link
                            .curve(d3.curveCardinal.tension(1))
            
            // last_China → first Japan
            let [startX, endX] = [xTimeScale(Object.entries(circleDataList[2])[0][1].time), xTimeScale(Object.entries(circleDataList[1])[0][1].time)]
            // 用于排除undefined
            if (startX === undefined) {
                startX = xTimeScale(961)
            }
            if (endX === undefined) {
                endX = xTimeScale(961)
            }

            // block_print → last_China
            let [startXR, endXR] = [xTimeScale(Object.entries(circleDataList[0])[0][1].time), xTimeScale(Object.entries(circleDataList[2])[0][1].time)]
            // 用于排除undefined
            if (startXR === undefined) {
                startXR = xTimeScale(961)
            }
            if (endXR === undefined) {
                endXR = xTimeScale(961)
            }
            const middleXR = (startXR + endXR) / 2

            // special event的hover交互
            const specialEventCircleMove = function(event) {
            //  console.log('specialEventMove', event)
                let book_name
                const event_data = event.srcElement.__data__
                if (event_data.hasOwnProperty('Japan')) { // 如果key是Japan
                    book_name = event_data.Japan.book_name
                } else if ((event_data.hasOwnProperty('block_print'))) { // 如果key是block_print
                    book_name = event_data.block_print.book_name
                } 
                else if ((event_data.hasOwnProperty('last_China'))) { // 如果key是last_China
                    book_name = event_data.last_China.book_name
                }

                // highlight
                for (let i in circleDataList) {
                    const cur_lib_type = Object.values(circleDataList[i])[0].lib_type
                    // console.log('circleDataList[i].lib_type', cur_lib_type)
                    d3.selectAll(`#${book_name}-${cur_lib_type}-circle`)
                        .attr('fill', type_color.library.bright[cur_lib_type])
                        .attr('r', 7)
                        .attr("filter", 'drop-shadow(3px 2px 2px rgb(0 0 0 / 0.6))')
                }
                d3.selectAll(`.${year_self.data[book][0].書名}-link`)
                    .style('opacity', 0.7)
                    .attr('stroke-width', 1)
                    .attr("filter", 'drop-shadow(2px 2px 1px rgb(0 0 0 / 0.2))')

                year_self.$store.commit("changeHover", {
                        entity: "edition",
                        value: book_name
                    })
            }
            const specialEventCircleLeft = function(event) {
                // console.log('specialEventLeft', event)
                let book_name
                const event_data = event.srcElement.__data__
                if (event_data.hasOwnProperty('Japan')) { // 如果key是Japan
                    book_name = event_data.Japan.book_name
                } else if ((event_data.hasOwnProperty('block_print'))) { // 如果key是block_print
                    book_name = event_data.block_print.book_name
                } 
                else if ((event_data.hasOwnProperty('last_China'))) { // 如果key是last_China
                    book_name = event_data.last_China.book_name
                }

                if (book_name !== year_self.selection.value) {
                    // 恢复
                    for (let i in circleDataList) {
                        const cur_lib_type = Object.values(circleDataList[i])[0].lib_type
                        d3.selectAll(`#${book_name}-${cur_lib_type}-circle`)
                            .attr('fill', type_color.library[cur_lib_type])
                            .attr('r', 5)
                            .attr("filter", 'none')
                    }
                    d3.selectAll(`.${year_self.data[book][0].書名}-link`)
                        .style('opacity', 0.3)
                        .attr('stroke-width', 0.5)
                        .attr("filter", 'none')
                }
                
                year_self.$store.commit("changeHover", {
                        entity: "edition",
                        value: null
                    })
            }
            // special event的click交互
            const specialEventCircleClick = function(event) {
                let book_name
                const event_data = event.srcElement.__data__
                if (event_data.hasOwnProperty('Japan')) { // 如果key是Japan
                    book_name = event_data.Japan.book_name
                } else if ((event_data.hasOwnProperty('block_print'))) { // 如果key是block_print
                    book_name = event_data.block_print.book_name
                } 
                else if ((event_data.hasOwnProperty('last_China'))) { // 如果key是last_China
                    book_name = event_data.last_China.book_name
                }
                
                year_self.$store.commit("changeSelection", {
                        entity: "edition",
                        value: book_name
                    })
                year_self.$store.commit("changeSelection", {
                        entity: "editions",
                        value: [book_name]
                    })
            }

            // special event中link的交互，防止误操作，弃用
            const specialEventLinkMove = function(event) { // hover link
                const hover_book_name = year_self.data[book][0].書名
                year_self.$store.commit("changeHover", {
                        entity: "edition",
                        value: hover_book_name
                    })
            }
            const specialEventLinkLeft = function(event) { // hover link leave
                year_self.$store.commit("changeHover", {
                        entity: "edition",
                        value: null
                    })
            }
            singleSpecialEvent.append('path')
                        // .data(circleDataList) // para:2 * divloc + 1.5 * gap + th
                        // .attr('d', link1([[startX, divloc + gap + th], [endX, 3 * divloc + 2 * gap + th]]))
                        .attr('d', link1([[startX, divloc + 2 * divloc / 5 + gap + th], [endX, 3 * divloc - divloc / 5 + 2 * gap + th]]))
                        .attr('id', `${year_self.data[book][0].書名}-linkY`)
                        .attr('class', `${year_self.data[book][0].書名}-link`)
                        .attr('stroke', '#6e4d2b')
                        .attr('fill', 'none')
                        // .attr('stroke-dasharray', '3,3')
                        .style('opacity', 0.3)
                        .attr('stroke-width', 0.5)
                        // 先禁掉link hover的交互，防止误操作
                        // .on('mouseover', specialEventLinkMove)
                        // .on('mouseout', specialEventLinkLeft)
                        .style('cursor', 'pointer')
            singleSpecialEvent.append('path')
                        // .data(circleDataList)
                        // .attr('d', link2([[startXR, divloc + gap + th], [endXR, divloc + gap + th]]))
                        .attr('d', () => {
                            if (startXR === endXR) {
                                return `M${startXR},${divloc + 2 * divloc / 5 + gap + th} L${endXR},${divloc + 2 * divloc / 5 + gap + th}`
                            } else {
                                return `M${startXR},${divloc + 2 * divloc / 5 + gap + th} Q ${middleXR},${divloc + 2 * divloc / 5 + gap} ${endXR},${divloc + 2 * divloc / 5 + gap + th}`
                            } 
                        })
                        .attr('id', `${book}-linkX`)
                        .attr('class', `${book}-link`)
                        .attr('stroke', '#6e4d2b')
                        .attr('fill', 'none')
                        // .attr('stroke-dasharray', '3,3')
                        .style('opacity', 0.3)
                        .attr('stroke-width', 0.5)
                        // 先禁掉link hover的交互，防止误操作
                        // .on('mouseover', specialEventLinkMove)
                        // .on('mouseout', specialEventLinkLeft)
                        .style('cursor', 'pointer')
            singleSpecialEvent.selectAll('circle')
                                .data(circleDataList)
                                .join('circle')
                                .attr('id', (d) => `${book}-${Object.values(d)[0].lib_type}-circle`) // book书名
                                .attr('class', (d) => `${book}-${Object.keys(d)[0]}-circle`) // class用来全局hover, selection, filter时交互
                                .attr('cx', function(d) {
                                    if (Object.entries(d)[0][1].time !== Object.entries(d)[0][1].time) {
                                        return xTimeScale(961)
                                    } else {
                                        return xTimeScale(Object.entries(d)[0][1].time)
                                    }                      
                                } )
                                .attr('cy', function(d, i) {
                                if (Object.entries(d)[0][0] === 'block_print' || Object.entries(d)[0][0] === 'last_China') {
                                    // return divloc + gap + th
                                    return divloc + 2 * divloc / 5 + gap + th
                                } else if (Object.entries(d)[0][0] === 'Japan') {
                                    return 3 * divloc - divloc / 5 + 2 * gap + th
                                }
                                // if (Object.entries(d)[0][0] === 'block_print') {
                                //     return divloc + gap + th
                                // } else if (Object.entries(d)[0][0] === 'Japan') {
                                //     return 3 * divloc + 2 * gap + th
                                // } else if (Object.entries(d)[0][0] === 'last_China') {
                                //     return 2 * divloc + 2 * gap + th
                                // }
                                })
                                .attr('r', 5)
                                .attr('fill', function (d, i) {
                                    return type_color.library[Object.entries(d)[0][1].lib_type]
                                })
                                .style('cursor', 'pointer')
                                .on('mouseover', specialEventCircleMove)
                                .on('mouseout', specialEventCircleLeft)
                                .on('click', specialEventCircleClick)
        }
        console.log('this.specialEvents', this.specialEvents)
        console.log('this.specialData', this.specialData)
            
        // brush刷子   
        let brushX = d3.brushX().extent([
            [0.12 * sWidth, ih - rw / 2],
            [iw, ih + rw / 2],
        ])
        this.brushG = this.container.append("g").call(brushX)
        //enlarge the height of overlay for friendly touch interaction
        this.brushG
            .select('.overlay')
            .attr("y", this.brushG.select(".overlay").attr("y") - 3)
            .attr('height', 6)
        this.brushG
            .select(".selection")
            .attr("fill", "#a78d73")
            .attr("fill-opacity", 1)
            .attr("stroke", "#6a4c2a")
            .attr("stroke-width", 1)
        this.brushG
            .transition()
            .duration(100)
            // .call(brushX.move, [
            // this.timeScale(yearStart),
            // this.timeScale(yearEnd),
            // ])
        let that = this;
        let lastStartPos;
        brushX.on("start", (e) => {
            if (e.mode === 'handle' && e.selection) {
            lastStartPos =  e.selection[0];
            }
        });
        brushX.on("end", function (event) {
            // console.log("end", event);
            // 确定所选中的brush区间
            const selection = event.selection;
            let x0 = 0,
            x1 = 0;
            if (!!event.sourceEvent && !!selection) {
            [x0, x1] = selection;
            if (x0 > x1) [x0, x1] = [x1, x0];
            } else if (!selection) {
                that.$store.commit("changeFilter", {entity: "time_range", value: [960, 1965]})
                // remove所有时代的rect
                year_self.time_range_click = null
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
                return
            } else {
                return
            }
            let x0Year =
            ((that.timeScale.invert(x0) - yearStart) / yearStep) * yearStep +
            yearStart;
            x0 = that.timeScale(x0Year);
            let x1Year =
            ((that.timeScale.invert(x1) - yearStart) / yearStep) * yearStep +
            yearStart;
            x1 = that.timeScale(x1Year);
            that.brushG.transition().duration(100).call(brushX.move, [x0, x1]);
            that.$store.commit("changeFilter", {entity: "time_range", value: [Math.floor(x0Year), Math.ceil(x1Year)]})
        });
        },
    },
    mounted() {
        this.data = get_book_traj().book_traj // 获取总数据
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
.container {
    user-select: none;
}
</style> -->