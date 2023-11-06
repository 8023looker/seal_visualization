<template>
    <div v-for="(item, index) in data['collectors']" :key="index" class="collector-card"
        :id="'collector-card-' + item['collector_name']"
        v-if="collectorContainerShow"
        :style="{left: collectorPosDict[item['collector_name']].x + 'px',
                 top: collectorPosDict[item['collector_name']].y + 'px', height: containerParam.card_height * 1.1 + 'px', width: (containerParam.card_width * 0.9 + containerParam.unit_pixel * 4) + 'px'}">
        <div class="collector-title-row" :style="{top: containerParam.unit_pixel * 5 + 'px', left: '2.5%', width: '95%', height: containerParam.unit_pixel * 25 + 'px' }">
            <div class="collector-name" :style="{fontSize: containerParam.unit_pixel * 20 + 'px'}"> {{ item['collector_name'] }}</div>
            <div class="info-column">           
                <div class="collector-life-span" :style="{fontSize: containerParam.unit_pixel * 11 + 'px'}">{{ item['life_span'][0].toString() + '-' + item['life_span'][1].toString() }}</div>
                <div class="stamp-ratio">
                    <svg class="seal-ratio-svg" :id="item['collector_name'] + '-seal-ratio-svg'"></svg>
                </div>
            </div>
        </div>
        <div class="seal-icon-group" 
            :style="{top: containerParam.unit_pixel * 35 + 'px', height: containerParam.unit_pixel * 30 + 'px'}">
            <svg :id="'seal-icon-group-' + item['collector_name']"></svg>
        </div>
        <div class="collector-intro" :style="{top: containerParam.unit_pixel * 70 + 'px', height: containerParam.unit_pixel * 35 + 'px', fontSize: containerParam.unit_pixel * 11 + 'px'}">{{ item['intro'] }}</div>
    </div>
</template>

<script>
import { mapState } from "vuex";

const d3 = require("d3");
const $ = require("jquery");

import * as SealCardFunc from "@/utils/timeline/seal_card_func";
import * as CollectorCardFunc from "@/utils/timeline/collector_card_func";

const margin = {
    top: 0.01,
    left: 0.01,
    right: 0.01,
    bottom: 0.01,
}
const time_duration = 1000,
      timeout_duration = 100,
      collector_card_num = 6

export default {
    name: "CollectorCard",
    components: {
    },
    data() {
        return {
            timeScale: null,
            collectorContainerShow: false,
            containerParam: { // 当前绘制窗口的宽度(collector container)
                x: 0,
                width: 0,
                card_width: 0, // includes the gap between collector cards
                card_height: 0, // card height (card_width / card_height = 2)
                unit_pixel: 0, // 单位大小
                sealIconSize: 1, // seal icon的大小
            },
            cardList: [],
            collectorPosDict: {}, // 用于记录collector card的位置
        };
    },
    props: ["canvas_width", "canvas_height", "data"],
    computed: {
        ...mapState(["language", "cur_view", "painting_name", "rem", "selection"]),
       
    },
    watch: {
        cur_view: function(newVal, oldVal) {
            const self = this
            if (newVal === 'timeline' && newVal !== oldVal) {
                self.renderCollectorCard()
            }
        },
        selection: {
            handler: function(newVal, oldVal) {
                const self = this
                if (newVal === 'timeline' && newVal !== oldVal) {
                    self.renderCollectorCard()
                }
            },
            deep: true
        },
    },
    methods: {
        initialize() { },
        getTimeScale() { // 与timeAxis的比例尺对齐
            const self = this
            let yearStart = 1450, // 1295
                yearEnd = 1965,
                sWidth = $(".main-panel").width() * 0.99 // $(".time-axis").width()
            let containerRange = [0.08 * sWidth, sWidth * (1 - margin.left - margin.right)]
            self.timeScale = d3.scaleLinear()
                                .domain([yearStart, yearEnd])
                                .range(containerRange)
        },
        renderCollectorCard() {
            const self = this
            setTimeout(() => {
                self.containerParam = SealCardFunc.getSealCardContainerSize() // {x: , width: }

                self.containerParam['card_width'] = self.containerParam['width'] / collector_card_num // 220单位
                self.containerParam['card_height'] = self.containerParam['card_width'] * 0.9 * 100 / 220 // 100单位
                self.containerParam['unit_pixel'] = self.containerParam['card_height'] / 100

                console.log(self.data['collectors'])
                self.cardList = SealCardFunc.SealCardMapping(self.data) // mapped seal pictures into list (In this step all seal pictures are included.)
                // self.cardList = HandleTimelineData.getCardListSubset(self.cardList, self.selection)
                self.collectorPosDict = CollectorCardFunc.computeCollectorCardPosition(self.data['collectors'], {
                    width: self.containerParam['card_width'],
                    height: self.containerParam['card_height']
                })
                
                self.collectorContainerShow = true

                setTimeout(() => { // 渲染seal-icon-group
                    // 绘制seal_ratio
                    self.containerParam['sealIconSize'] = $('.seal-icon-group').height() / 3
                    // console.log('self.containerParam', self.containerParam['sealIconSize'])
                    CollectorCardFunc.renderCollectorSealIconGroup(self.data['collectors'], self.containerParam['sealIconSize'])
                    CollectorCardFunc.renderSealRatio(self.data['collectors'], self.cardList) // collector_list, seal_mapped_list
                }, timeout_duration)
            }, timeout_duration)
        },
    },
    mounted() {
        const that = this
        that.initialize()
        that.getTimeScale()
        that.renderCollectorCard()
    },
};
</script>

<style scoped lang="scss">
.collector-card {
    position: absolute;
    color: #8F7B6C;
    border: 2px solid #8F7B6C;
    // border-radius: 5px;
    display: flex;
    justify-content: center;

    overflow-y: auto;
    .collector-title-row {
        position: absolute;
        display: flex;
        flex-direction: row;
        // align-items: center;
        // justify-content: center;
        .collector-name {
            white-space: nowrap;
            color: #724A2B;
        }
        .info-column {
            flex: 1; // 填充剩余空间
            display: flex;
            flex-direction: column;
            // justify-content: center;
            // align-items: center;
            .stamp-ratio {
                flex: 1; // 填充剩余空间
                .seal-ratio-svg {
                    left: 0%;
                    top: 0%;
                    width: 100%;
                    height: 100%;
                }
            }
        }
    }
    .seal-icon-group {
        position: absolute;
        left: 2.5%;
        width: 95%;
        overflow-y: auto;
        // background-color: rgba(247, 171, 0, 0.15);
    }
    .collector-intro {
        position: absolute;
        left: 2.5%;
        width: 95%;
        text-align: left;
        overflow-y: auto;
        // background-color: rgba(247, 171, 0, 0.15);
    }
}

</style>
