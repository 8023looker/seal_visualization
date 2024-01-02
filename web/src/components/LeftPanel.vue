<template>
    <el-dialog v-model="fullImageModel.show" :title="fullImageModel.label" top="5vh" width="80%">
        <div style="height: 75vh; width: 70%;">
            <img :src="fullImageModel.src" style="width: 100%; height: 100%; object-fit: contain;">
        </div>
    </el-dialog>

    <div v-show="cur_view === 'timeline' || (cur_view !== 'timeline' && selection.entity === null)" class="barchart-container">
        <div class="barchart-title" :style="{fontSize: rem * 1.5 + 'px'}">{{ '鉴藏人物' }}</div>
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
    <div class="glyth-container">
        <div class="glyth-title" :style="{fontSize: rem * 1.3 + 'px'}">{{ '层次结构' }}</div>
        <div class="data-level-container">
            <div class="icon-row">
                <svg width="14" height="18" viewBox="0 0 14 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M11.7684 17.2573H2.23161C1.42355 17.2573 0.839502 16.2172 1.03952 15.1531C1.51156 12.6329 2.83166 10.5608 4.5518 9.54469C4.5518 9.54469 4.5598 9.54469 4.5598 9.53669C3.2477 8.72862 2.37563 7.28051 2.37563 5.62437C2.37563 3.07217 4.44779 1 7 1C9.55221 1 11.6244 3.07217 11.6244 5.62437C11.6244 7.28051 10.7523 8.72862 9.4402 9.53669C9.4402 9.54469 9.4482 9.54469 9.4482 9.54469C11.1683 10.5608 12.4884 12.6329 12.9605 15.1531C13.1605 16.2172 12.5765 17.2573 11.7684 17.2573Z" stroke="#724A2B" stroke-width="1.5" stroke-linejoin="round"/>
                </svg>
                <div class="icon-text" :style="{fontSize: rem * 1.1 + 'px'}">{{ '鉴藏人物' }}</div>
            </div>
            <div class="icon-row">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="0.75" y="0.75" width="10.5" height="10.5" stroke="#724A2B" stroke-width="1.5"/>
                </svg>
                <div class="icon-text" :style="{fontSize: rem * 1.1 + 'px'}">{{ '印章名称' }}</div>
            </div>
            <div class="icon-row">
                <svg width="13" height="12" viewBox="0 0 13 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="0.950195" y="0.75" width="10.5" height="10.5" rx="5.25" stroke="#724A2B" stroke-width="1.5"/>
                </svg>
                <div class="icon-text" :style="{fontSize: rem * 1.1 + 'px'}">{{ '印章图片' }}</div>
            </div>
        </div>
        <div class="glyth-title" :style="{fontSize: rem * 1.3 + 'px'}">{{ '印章比例' }}</div>
        <div class="stamp-ratio-icon">
            <svg class="seal-ratio-icon-svg"></svg>
        </div>
    </div>
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
import * as RenderIconFunc from "@/utils/left_panel/render_icon_function";

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

                if (self.cur_view === 'timeline') {
                    BarChartFunc.barchartTransition(self.hover, newVal, self.data["collectors"])
                } else {
                    // 无操作
                }
            },
            deep: true
        },
        hover: {
            handler: function(newVal, oldVal) {
                const self = this
                if (self.cur_view === 'timeline') {
                    BarChartFunc.barchartTransition(newVal, self.selection, self.data["collectors"])
                } else {
                    // 无操作
                }
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
            RenderIconFunc.renderSealRatioIcon(that.rem)
        }, timeout_duration)

        that.initialize()
    },
};
</script>

<style scoped lang="scss">
$upper-panel-height: 80%;
.barchart-container {
    position: absolute;
    width: 100%;
    height: $upper-panel-height;
    left: 0%;
    top: 0%;
    border-bottom: 2px solid #8F7B6C;
    // background-color: rgba(247, 171, 0, 0.05);
    .barchart-title {
        position: absolute;
        left: 2.5%;
        top: 0%;
        height: 5%;
        width: 95%;
        display: flex;
        align-items: center;
        color: #724A2B;
        font-weight: bold;
    }
    #barchart-svg {
        position: absolute;
        left: 2.5%;
        top: 5%;
        width: 95%;
        height: 95%;
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
    border-bottom: 2px solid #8F7B6C;
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
    // background-color: rgba(247, 171, 0, 0.15);
    .glyth-title {
        color: #724A2B;
        margin-top: 5%;
        margin-bottom: 5%;
        font-weight: bold;
    }
    .data-level-container {
        padding-left: 20%;
        padding-right: 20%;
        .icon-row {
            display: flex;
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
            margin-top: 5%;
            margin-bottom: 5%;
            .icon-text {
                color: #724A2B;
            }
        }
    }
    .stamp-ratio-icon {
        flex: 1;
        .seal-ratio-icon-svg {
            height: 100%;
            width: 100%;
        }
    }
}
</style>
