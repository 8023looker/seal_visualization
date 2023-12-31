<template>
    <el-dialog v-model="fullImageModel.show" :title="fullImageModel.label" top="5vh" width="80%">
        <div style="height: 75vh; width: 70%;">
            <img :src="fullImageModel.src" style="width: 100%; height: 100%; object-fit: contain;">
        </div>
    </el-dialog>

    <div v-show="cur_view === 'timeline' || (cur_view !== 'timeline' && selection.entity === null)" class="barchart-container">
        <svg id="barchart-svg"></svg>
    </div>
    <div v-if="cur_view !== 'timeline' && selection.entity !== null" class="detail-info-container">
        <div class="info-row" :style="{marginTop: '5%'}">
            <div class="seal-name"
                :style="{fontSize: rem * 1.5 + 'px', fontWeight: 'bold'}"
            >{{ sealDetailInfo['seal_name'] }}</div>
            <div class="seal-number"
                :style="{fontSize: rem * 1.5 + 'px'}"
            >{{ sealDetailInfo['series_list'].length }}</div>
        </div>
        <div class="info-row">
            <div class="agent-time-group">           
                <div class="agent-icon">
                    <svg width="11" height="14" viewBox="0 0 11 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M8.94846 13H1.90909C1.31263 13 0.881532 12.2323 1.02917 11.4469C1.37759 9.58661 2.352 8.05709 3.62169 7.30709C3.62169 7.30709 3.62759 7.30709 3.62759 7.30118C2.65909 6.70472 2.01539 5.63583 2.01539 4.41339C2.01539 2.52953 3.54492 1 5.42878 1C7.31263 1 8.84216 2.52953 8.84216 4.41339C8.84216 5.63583 8.19846 6.70472 7.22996 7.30118C7.22996 7.30709 7.23586 7.30709 7.23586 7.30709C8.50555 8.05709 9.47996 9.58661 9.82838 11.4469C9.97602 12.2323 9.54492 13 8.94846 13Z" stroke="#8F7B6C" stroke-linejoin="round"/>
                    </svg>
                </div>
                <div class="agent-name" :style="{fontSize: rem * 1.2 + 'px'}">{{ sealDetailInfo['collector_name'] }}</div>
            </div>
            <div class="life-span" :style="{fontSize: rem * 1.2 + 'px'}">{{ sealDetailInfo['life_span'][0].toString() + '-' + sealDetailInfo['life_span'][1].toString() }}</div>
        </div>
        <div class="collector-intro" :style="{fontSize: rem * 1.1 + 'px'}">{{ sealDetailInfo['intro'] }}</div>
        <div class="seal-series-pic">
            <div v-for="(item, index) in sealDetailInfo['image_href_list']" :key="index" class="single-seal-pic">
                <img :src="item" style="{max-width: 100%; max-height: 11.7vh; cursor: 'pointer';
                                         box-shadow: (selection.entity === 'seal_pic' && selection.value.includes(getSealPicHrefIndex(item))) ? '5px 5px 10px rgba(0, 0, 0, 0.5)' : 'none'}"
                    @click="fullImageModel.show =true, fullImageModel.src=item, fullImageModel.label = sealDetailInfo['seal_name'] + '-' + getSealPicHrefIndex(item)">
                <div :style="{fontSize: rem + 'px', color: '#724A2B'}">{{ sealDetailInfo['seal_name'] + '-' + getSealPicHrefIndex(item) }}</div>
            </div>
        </div>
    </div>
    <div class="glyth-container"></div>
</template>

<script>
import { mapState } from "vuex";

const d3 = require("d3");
const $ = require("jquery");

const time_duration = 1000,
      timeout_duration = 100

import LayoutCard from "./layout_widgets/LayoutCard.vue"

import * as Data from "@/data/Data.js";
import * as TypeColor from "@/theme/type_color";
import { jsonCopy } from "@/utils/copy";
import * as DataProcess from "@/utils/data_process";
import * as SealCardFunc from "@/utils/timeline/seal_card_func";
import * as BarChartFunc from "@/utils/left_panel/barchart_function";
import * as DetailInfoFunc from "@/utils/left_panel/detail_info_function";

export default {
    name: "LeftPanel",
    components: {
    
    },
    data() {
        return {
            data: null,
            cardList: [],
            sealDetailInfo: null,
            fullImageModel: {
                show: false,
                src: null,
                label: null
            },
        }
    },
    props: ["canvas_width", "canvas_height"],
    computed: {
        ...mapState(["language", "cur_view", "painting_name", "selection", "hover", "transition", "overlay_duration", "rem"]),
    },
    watch: {
        cur_view: function(newValue, oldValue) {
            const self = this
        },
        selection: {
            handler: function(newVal, oldVal) {
                const self = this
                if (newVal.entity === 'seal_pic' && newVal.value.length > 0) { // 仅针对印章图片时显示detail_info
                    console.log('selection in left panel', newVal)
                    self.sealDetailInfo = DetailInfoFunc.getSealPicDetail(self.cardList, newVal.value)
                }
                BarChartFunc.barchartTransition(self.hover, newVal, self.data["collectors"])
            },
            deep: true
        },
        hover: {
            handler: function(newVal, oldVal) {
                const self = this
                BarChartFunc.barchartTransition(newVal, self.selection, self.data["collectors"])
            },
            deep: true
        },
        transition: {
            handler: function (newVal, _) {
                const self = this
            },
            deep: true,
        },
        cardList: {
            handler: function (newVal, oldVal) {
                const self = this
            },
            deep: true
        },
        sealDetailInfo: { // 左侧的seal信息框
            handler: function (newVal, oldVal) {
                const self = this
            },
            deep: true
        },
    },
    methods: {
        initialize() { // 在切换到当前视图时需要重新刷新一遍
            const self = this
            
        },
        renderBarChart() {
            const self = this
            // self.data["collectors"] = self.data["collectors"].map(function(item, index) {
            //     item['collector_index'] = index
            //     return item
            // })
            BarChartFunc.renderBarchart(self.data["collectors"])
        },
        getSealPicHrefIndex(href_link) { // 从href中提取seal pic index
            return (href_link.split('/')[href_link.split('/').length - 1].split('.')[0]).replace('seal_', '') // type: string
        }
    },
    mounted() {
        const that = this

        let whole_data = Data.read_data() // 首先读入总体的
        for (let i in whole_data) {
            if (whole_data[i]['painting_name'] === that.painting_name) {
                that.data = whole_data[i]
            }
        }
        that.cardList = SealCardFunc.SealCardMapping(that.data) // mapped seal pictures into list (In this step all seal pictures are included.)

        setTimeout(() => {
            that.renderBarChart()
        }, timeout_duration)

        that.initialize()
    },
};
</script>

<style scoped lang="scss">
$upper-panel-height: 75%;
.barchart-container {
    position: absolute;
    width: 100%;
    height: $upper-panel-height;
    left: 0%;
    top: 0%;
    // background-color: rgba(247, 171, 0, 0.05);
    #barchart-svg {
        position: absolute;
        left: 0%;
        top: 0%;
        width: 100%;
        height: 100%;
    }
}
.detail-info-container {
    position: absolute;
    width: 100%;
    height: $upper-panel-height;
    left: 0%;
    top: 0%;

    display: flex;
    flex-direction: column;
    // overflow-y: auto;
    // background-color: rgba(247, 171, 0, 0.05);
    .info-row {
        color: #724A2B;
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        padding-left: 2.5%;
        padding-right: 2.5%;
        margin-bottom: 5%;
        flex-shrink: 0;
        .seal-number {
            color: white;
            padding-left: 2px;
            padding-right: 2px;
            background-color: #A56752;
        }
        .agent-time-group {
            display: flex;
            flex-direction: row;
            align-items: center;
            .agent-icon {
                display: flex;
                align-items: center;
                svg {
                    transform: scale(1.1);
                }
            }
        }
    }
    .collector-intro {
        // position: absolute;
        // left: 2.5%;
        // width: 95%;
        padding-left: 2.5%;
        padding-right: 2.5%;
        text-align: left;
        color: #724A2B;
        line-height: 1.5;
        flex-shrink: 0;
        border-bottom: 2px solid #8F7B6C;
        // background-color: rgba(247, 171, 0, 0.15);
    }
    .seal-series-pic {
        height: auto;
        flex: 1;
        margin-top: 5%;
        padding-left: 10%;
        padding-right: 10%;
        overflow-y: auto;
        // background-color: rgba(247, 171, 0, 0.15);
        .single-seal-pic img {
            cursor: pointer;
        }
    }
}
.glyth-container {
    position: absolute;
    left: 0%;
    top: $upper-panel-height;
    width: 100%;
    height: calc(100% - #{$upper-panel-height});
    background-color: rgba(247, 171, 0, 0.15);
}
</style>
