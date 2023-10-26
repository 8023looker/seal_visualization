<template>
    <el-dialog v-model="showDetail.dialogShow" title="Time Reasoning Detail" top="5vh" width="90%" height="90vh">
        <div class="card-div" style="height: 85vh; width: 70%;">
            <el-card class="box-card" id="direct-el-card"       
                :style="{ height: `${ showDetail.detailEvent.divShow.direct ? ((showDetail.detailEvent.divShow.library || showDetail.detailEvent.divShow.agent) ? 87 * 1 / showDetail.detailEvent.divShow.material_num.total - 3 : 60) :  10 }%`,
                          top: '5%',
                          opacity: showDetail.detailEvent.divShow.direct ? 1 : 0.5 }"
            >
                <template #header>
                    <div class="card-header">
                        <span>直接史料</span>
                        <div v-if="showDetail.detailEvent.divShow.direct" class="weight-container">
                            <div>权重</div>
                            <el-input-number v-model="showDetail.detailEvent.time_interval.direct.weight" :min="1" size="mini"/>
                        </div>
                    </div>
                </template>
                <!-- <div class="probability-model">{{ showDetail.detailEvent.divShow.direct ? '概率模型' : '暂无史料' }}</div> -->
                <div class="probability-model">
                    <div v-if="showDetail.detailEvent.divShow.direct"
                        class="direct-material">
                        <div class="material-text">{{ showDetail.detailEvent.time_interval.direct.source }}</div>
                        <svg style="width: 100%"
                            :id="'event-' + showDetail.detailEvent.ori_idx.toString() + '-direct-source'">
                        </svg>
                    </div>
                    <div v-if="!showDetail.detailEvent.divShow.direct">{{ '暂无史料' }}</div>
                </div>
            </el-card>
            <el-card class="box-card" id="indirect-el-card"
                :style="{ height: indirectCard.height + 'px',
                          top: indirectCard.top + 'px',
                          opacity: showDetail.detailEvent.divShow.indirect.library || showDetail.detailEvent.divShow.indirect.agent ? 1 : 0.5 }"
            >
                <template #header>
                    <div class="card-header">
                        <span>间接史料</span>
                    </div>
                </template>
                <el-card class="sub-box-card" id="library-el-card"
                    :style="{ height: indirectCard.library.height + 'px',
                              top: indirectCard.library.top + 'px',
                              opacity: showDetail.detailEvent.divShow.indirect.library ? 1 : 0.5 }"
                >
                    <template #header>
                        <div class="card-header">
                            <span>收藏机构</span>
                            <div v-if="showDetail.detailEvent.divShow.indirect.library" class="weight-container">
                                <div>权重</div>
                                <el-input-number v-model="showDetail.detailEvent.time_interval.library.weight" :min="1" size="mini"/>
                            </div>
                        </div>
                    </template>
                    <!-- <div class="probability-model">{{ showDetail.detailEvent.divShow.indirect.library ? '概率模型' : '暂无史料' }}</div> -->
                    <div class="probability-model" style="width: 100%; height: 100%;">
                        <div v-if="showDetail.detailEvent.divShow.indirect.library"
                            class="library-material" v-for="(item, index) in showDetail.detailEvent.time_interval.library.material_list" :key="index">
                            <div class="material-text">{{ item.source }}</div>
                            <svg style="width: 100%"
                                :id="'event-' + showDetail.detailEvent.ori_idx.toString() + '-library-source-' + index.toString()">
                            </svg>
                        </div>
                        <div v-if="!showDetail.detailEvent.divShow.indirect.library">{{ '暂无史料' }}</div>
                    </div>
                </el-card>
                <el-card class="sub-box-card" id="agent-el-card"
                    :style="{ height: indirectCard.agent.height + 'px', 
                              top: indirectCard.agent.top + 'px',
                              opacity: showDetail.detailEvent.divShow.indirect.agent ? 1 : 0.5 }"
                >
                    <template #header>
                        <div class="card-header">
                            <span>经手人物</span>
                            <div v-if="showDetail.detailEvent.divShow.indirect.agent" class="weight-container">
                                <div>权重</div>
                                <el-input-number v-model="showDetail.detailEvent.time_interval.agent.weight" :min="1" size="mini"/>
                            </div>
                        </div>
                    </template>
                    <div class="probability-model">
                        <div v-if="showDetail.detailEvent.divShow.indirect.agent"
                            class="agent-material" v-for="(item, index) in showDetail.detailEvent.time_interval.agent.material_list" :key="index">
                            <!-- <div class="material-text">{{ index > 0 ? item.source : '复合概率模型' }}</div> -->
                            <div class="material-text">{{ item.source }}</div>
                            <svg style="width: 100%"
                                :id="'event-' + showDetail.detailEvent.ori_idx.toString() + '-agent-source-' + index.toString()">
                            </svg>
                        </div>
                        <div v-if="!showDetail.detailEvent.divShow.indirect.agent">{{ '暂无史料' }}</div>
                    </div>
                </el-card>
            </el-card>
        </div>
    </el-dialog>
   <div class="time-reasoning-container">
        <svg id="event-circle-vertical-link"></svg>
        <div
            v-for="(item, index) in eventsHandle"
            :key="index"
            class="sub-timeline"
            :style="{ height: `${100 / eventsHandle.length}%`, top: `${item.YIndex * 100 / eventsHandle.length}%` }"
        >
            <div class="detail-button"
                @click="clickDetailButton"
                :id="item.ori_idx.toString()"
                :style="{fontSize: (rem / 2.5) + 'px'}"
                >
                {{ 'detail' }}
            </div>
            <div class="sub-timeAxis"
                :style="{ top: index % 2 === 0 ? '0%' : '20%' }"
                :id="'sub-timeline-' + index.toString()"
            ></div>
            <div class="sub-eventLine"
                :style="{ top: index % 2 === 0 ? '80%' : '0%' }"
                :id="'sub-eventLineCircle-' + index.toString()"
            ></div>
        </div>
   </div>
</template>


<script>
import { mapState } from "vuex";
import * as d3 from "d3";
import { ref, computed, watch, onMounted, reactive } from "vue";
import * as InfoCardFunc from "@/data/timeline/info_card_func";
import { get_time_reasoning } from "@/data/BookTraj";
import { color, type_color } from "@/theme"

const $ = require("jquery");
import * as DataProcess from "@/data/timeline/timeline_full/data_process"
import * as RenderAxis from "@/data/timeline/timeline_full/render_axis"
import * as TypeColor from "@/theme/type_color"
import * as TimeLineUpdate from "@/data/timeline/timeline_update";
import * as TimeReasoningFunc from "@/data/timeline/timeline_full/time_reasoning_func"
import * as TimeReasoningFuncV2 from "@/data/timeline/timeline_full/time_reasoning_func_v2"
import { jsonCopy } from "@/utils/copy";

const time_duration = 1000
const margin = {
    top: 0.01,
    left: 0.01,
    right: 0.01,
    bottom: 0.01,
};
export default {
    name: "TimeReasoning",
    data() {
        return {
            eventsHandle: null, // 处理后的events
            timeReaoningWhole: null, // 时间推测的data structure, whole
            timeReasoningData: null, // for single book
            showDetail: {
                dialogShow: false, // 是否显示time reasoning detail
                detailEvent: null // 显示细节的
            },
            indirectCard: { // indirect参数
                top: 5, // style.top
                height: 0, // style.height，计算当前indirectCard的高度（根据directCard动态调整）
                Show: false, // 是否显示indirect el-card
                library: { // library el-card
                    top: 5, // style.top
                    height: 0,
                    Show: false,
                },
                agent: { // agent el-card
                    top: 5, // style.top
                    height: 0,
                    Show: false,
                }
            }
        }
    },
    props: ["metaData", "events"],
    computed: {
        ...mapState(["rem", "language", "switchWholeView", "timelineBook", "curEventData", "curReasonData"])
    },
    watch:{
        metaData: {
            handler: function(newVal, oldVal) {
                const self = this
                // console.log('metaData', self.metaData)
            },
            deep: true
        },
        events: {
            handler: function(newVal, oldVal) {
                const self = this
                if (newVal !== null) {
                    // let events_pop = jsonCopy(newVal)
                    // // events_pop.shift() // 使用function进行处理
                    // events_pop = DataProcess.handlePrintEvents(events_pop, self.timelineBook)
                    // self.eventsHandle = DataProcess.computeSubTimelineYIndex(events_pop)
                    // self.$store.commit("changeEventData", self.eventsHandle)
                    // console.log("eventsHandle", self.eventsHandle)

                    // setTimeout(function() {
                    //     self.renderSVG()
                    // }, time_duration / 100)
                }
            },
            deep: true
        },
        curEventData: {
            handler: function(newVal, oldVal) {
                const self = this
                if (newVal !== null && newVal !== oldVal) {
                    // if (!DataProcess.checkArrayEqual(newVal, oldVal)) {
                    //     console.log(newVal !== oldVal)
                    //     self.eventsHandle = newVal
                    //     console.log('curEventData改变啦')
                    //     setTimeout(function() {
                    //         self.renderSVG()
                    //     }, time_duration / 100)
                    // }     
                    console.log(newVal !== oldVal)
                    self.eventsHandle = newVal
                    console.log('curEventData改变啦')
                    setTimeout(function() {
                        self.renderSVG()
                    }, time_duration / 100)    
                }
            },
            deep: true
        },
        curReasonData: {
            handler: function(newVal, oldVal) {
                const self = this
                if (newVal !== null) {
                    self.timeReasoningData = newVal
                    // setTimeout(function() {
                    //     self.renderSVG()
                    // }, time_duration / 100)
                }
            },
            deep: true
        },
        timelineBook: function(newVal, oldVal) {
            const self = this
            if (newVal !== null && newVal !== oldVal) {

            }
        },
        showDetail: {
            handler: function(newVal, oldVal) {
                const self = this
                if (newVal !== null || newVal !== oldVal) {
                    self.indirectCard.Show = false // 清零，一律处理成暂不显示
                    setTimeout(function(){
                        const directCard = document.getElementById('direct-el-card')
                        self.indirectCard.top = directCard.clientHeight + DataProcess.vhToPx(85 * 0.08) // px
                        self.indirectCard.height = DataProcess.vhToPx(85 * (1 - 0.05)) - directCard.clientHeight
                        self.indirectCard.Show = true

                        setTimeout(function(){
                            // direct(最多只有1条)
                            if (self.showDetail.detailEvent['time_interval'].hasOwnProperty('direct')) {
                                TimeReasoningFunc.renderProbabilityAreaChart(self.showDetail.detailEvent['time_interval']['direct'], 'direct', self.showDetail.detailEvent['ori_idx'], null, self.showDetail.detailEvent['time_interval']['composite_interval']) // 不再分单独史料和混合史料
                            }

                            self.indirectCard = TimeReasoningFunc.computeIndirectDivPara(self.indirectCard, self.showDetail.detailEvent)
                            // library
                            if (self.showDetail.detailEvent['time_interval'].hasOwnProperty('library')) {
                                for (let i = 0; i < self.showDetail.detailEvent['time_interval']['library']['material_list'].length; i++) {
                                    const meterial = self.showDetail.detailEvent['time_interval']['library']['material_list'][i]
                                    // if (i > 0) { // 单独史料  
                                    //     TimeReasoningFunc.renderProbabilityAreaChart(meterial, 'library', self.showDetail.detailEvent['ori_idx'], i, self.showDetail.detailEvent['time_interval']['composite_interval'])
                                    // } else { // 混合史料
                                    //     TimeReasoningFunc.renderProbabilityAreaChart(meterial, 'library', null, i, self.showDetail.detailEvent['time_interval']['composite_interval'])
                                    // }
                                    TimeReasoningFunc.renderProbabilityAreaChart(meterial, 'library', self.showDetail.detailEvent['ori_idx'], i, self.showDetail.detailEvent['time_interval']['composite_interval']) // 不再分单独史料和混合史料
                                }
                            }
                            // agent
                            if (self.showDetail.detailEvent['time_interval'].hasOwnProperty('agent')) {
                                for (let i = 0; i < self.showDetail.detailEvent['time_interval']['agent']['material_list'].length; i++) {
                                    const meterial = self.showDetail.detailEvent['time_interval']['agent']['material_list'][i]
                                    // if (i > 0) { // 单独史料  
                                    //     TimeReasoningFunc.renderProbabilityAreaChart(meterial, 'agent', self.showDetail.detailEvent['ori_idx'], i, self.showDetail.detailEvent['time_interval']['composite_interval'])
                                    // } else { // 混合史料
                                    //     TimeReasoningFunc.renderProbabilityAreaChart(meterial, 'agent', null, i, self.showDetail.detailEvent['time_interval']['composite_interval'])
                                    // }
                                    TimeReasoningFunc.renderProbabilityAreaChart(meterial, 'agent', self.showDetail.detailEvent['ori_idx'], i, self.showDetail.detailEvent['time_interval']['composite_interval']) // 不再分单独史料和混合史料
                                }
                            }            
                        }, time_duration / 100)
                    }, time_duration / 100)
                } else {
                    self.indirectCard.Show = false // 清零，一律处理成暂不显示
                }
                console.log('time_interval', newVal.detailEvent['time_interval']) // 权重改变
            },
            deep: true
        },
    },
    methods: {
        initialize() {
            const self = this
            if (self.curEventData !== null && self.curReasonData !== null) {
                self.eventsHandle = self.curEventData
                self.timeReasoningData = self.curReasonData
                setTimeout(function() {
                    self.renderSVG()
                }, time_duration / 100)
                
            }
        },
        renderSVG() {
            const self = this
            self.timeScale = d3.scaleLinear() // 定义xScale
                                .domain([960, 1965])
                                .range([0.08 * $(".app").width() * 0.85 * 1.176, $(".app").width() * 0.85 * 1.176 * (1 - margin.left - margin.right)])
            d3.selectAll('.sub-timeline-svg').remove() // 删除之前的概率分布svg
            d3.selectAll('.sub-eventline-svg').remove() // 删除之前的event line circle

            const material_num = DataProcess.computeMaxLibAgentNum(self.timeReasoningData)

            for (let e = 0; e < self.eventsHandle.length; e++) {
                // 概率模型
                const cur_div = document.getElementById(`sub-timeline-${e.toString()}`)
                d3.select(`#sub-timeline-${e.toString()}`)
                    .append('svg')
                    .attr('class', 'sub-timeline-svg')
                    .attr('id', `sub-timeline-svg-${e.toString()}`)
                    .attr("height", `${cur_div.offsetHeight}`)
                    .attr("width", `${cur_div.offsetWidth * (1 - margin.left)}`)

                // 绘制坐标轴   
                TimeReasoningFunc.draw_sub_timeline_version2(
                    self.timeScale,
                    self.timeReasoningData, // including all circulation events
                    {...self.eventsHandle[e], index: e}, // single event
                    self.rem,
                    material_num
                )

                // 流传事件的circle line
                // 首先清除原先已有的
                // console.log(d3.select(`#sub-eventLineCircle-${e.toString()}`).selectAll(`#sub-eventline-svg-${e.toString()}`).selectAll('g'))
                d3.select(`#sub-eventLineCircle-${e.toString()}`).selectAll(`#sub-eventline-svg-${e.toString()}`).selectAll('g').remove()
                // 然后再绘制
                const curCircle_div = document.getElementById(`sub-eventLineCircle-${e.toString()}`)
                d3.selectAll(`#sub-eventLineCircle-${e.toString()}`)
                    .append('svg')
                    .attr('class', 'sub-eventline-svg')
                    .attr('id', `sub-eventline-svg-${e.toString()}`)
                    .attr("height", `${curCircle_div.offsetHeight}`)
                    .attr("width", `${curCircle_div.offsetWidth * (1 - margin.left)}`)
                // 绘制event circle
                TimeReasoningFunc.drawEventCircleLine(
                    self.timeScale,
                    self.timeReasoningData, // including all circulation events
                    {...self.eventsHandle[e], index: e}, // single event
                    e + 1 < self.eventsHandle.length ? {...self.eventsHandle[e + 1], index: e + 1} : null, // 需要修改，加上判断
                    e - 1 < 0 ? null : {...self.eventsHandle[e - 1], index: e - 1}, // previous event data
                    e + 2 < self.eventsHandle.length ? {...self.eventsHandle[e + 2], index: e + 2} : null, // next next event data
                    self.rem
                )
            }
            // 再次遍历，绘制vertical link of event circle
            d3.select(`#event-circle-vertical-link`).selectAll('g').remove()
            for (let e = 0; e < self.eventsHandle.length; e++) {
                // 绘制event circle之间的连线
                TimeReasoningFunc.drawEventCircleVerticalLink(
                    self.timeReasoningData, // including all circulation events
                    {...self.eventsHandle[e], index: e}, // single event
                    e + 1 < self.eventsHandle.length ? {...self.eventsHandle[e + 1], index: e + 1} : null, // 需要修改，加上判断
                    self.rem
                )
            }
        },
        clickDetailButton(event) {
            const self = this
            // console.log('event', event.target.id)
            let div_para = TimeReasoningFunc.probabilityDivPara(self.timeReasoningData, event.target.id)
            self.timeReasoningData = div_para['total_data']
            self.showDetail['detailEvent'] = div_para['single_data']

            // 对于每个material_list, 复制一个element
            // // library
            // if (self.showDetail['detailEvent']['time_interval'].hasOwnProperty('library')) {
            //     // 复制一个 material_list 的元素，使得array.length + 1 (作为最下面复合的)
            //     const lastElement = self.showDetail['detailEvent']['time_interval']['library']['material_list'][self.showDetail['detailEvent']['time_interval']['library']['material_list'].length - 1]
            //     // 将复制的元素添加到数组末尾
            //     self.showDetail['detailEvent']['time_interval']['library']['material_list'].unshift(lastElement)
            // }
            // // agent
            // if (self.showDetail['detailEvent']['time_interval'].hasOwnProperty('agent')) {
            //     // 复制一个 material_list 的元素，使得array.length + 1 (作为最下面复合的)
            //     const lastElement = self.showDetail['detailEvent']['time_interval']['agent']['material_list'][self.showDetail['detailEvent']['time_interval']['agent']['material_list'].length - 1]
            //     // 将复制的元素添加到数组末尾
            //     self.showDetail['detailEvent']['time_interval']['agent']['material_list'].unshift(lastElement)
            // }

            console.log('detailEvent', self.showDetail['detailEvent'])
            self.showDetail['dialogShow'] = true
        }
    },
    mounted() {
        const self = this
        self.initialize()
    },
};
</script>

<!-- 需要将vw转换为px -->
<style scoped lang="scss">
$bottom-panel-height: 20vh;
$infocard-panel-height: 60vh;
.time-reasoning-container{
    position: absolute;
    top: 0%;
    left: 0%;
    height: 100%;
    width: 100%;
    .sub-timeline{
        position: absolute;
        left: 0%;
        width: 100%;
        .detail-button {
            position: absolute;
            right: 0.1%;
            top: 0.1%;
            padding: 0.05rem;
            margin: 0.05rem;
            border: 1px solid #6a4c2a;
            border-radius: 0.05rem;
            color: #6a4c2a;
            cursor: pointer;
            z-index: 1; // 否则Hover不到
        }

        .detail-button:hover {
            background-color: #dfdbdb;         
            // font-weight: bold;
        }
        .sub-timeAxis {
            position: absolute;
            left: 0%;
            height: 80%;
            width: 100%;
            // background-color: rgba(176, 196, 222, 0.212);
        }
        .sub-eventLine{
            position: absolute;
            left: 0%;
            height: 20%;
            width: 100%;
            // background-color: rgba(255, 140, 0, 0.1);
        }
    }
    #event-circle-vertical-link {
        position: absolute;
        left: 0%;
        top: 0%;
        height: 100%;
        width: 100%;
    }
}
.card-div{
    .box-card{
        position: absolute;
        left: 5%;
        width: 90%;
        .card-header{
            display: flex;
            flex-direction: row;
            text-align: center;
            align-items: center;
            justify-content: space-between; // new
            .weight-container{
                display: flex;
                flex-direction: row;
                text-align: center;
                align-items: center;
                justify-content: space-between; // new
            }
        }
        .sub-box-card{
            position: absolute;
            left: 1%;
            width: 98%;
        }
    }
}
</style>
