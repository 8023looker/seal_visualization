<template>
    <el-dialog v-model="fullImageModel.show" :title="fullImageModel.label" top="5vh" width="80%">
        <div style="height: 75vh; width: 70%;">
            <img :src="fullImageModel.src" style="width: 100%; height: 100%; object-fit: contain;">
        </div>
    </el-dialog>
    <div class="layout-seal-card"
        :style="{left: seal_detail['card_pos']['x'] + 'px', top: seal_detail['card_pos']['y'] + 'px',
                 height: containerParam.card_height * 1.1 + 'px', width: (containerParam.card_width * 0.9 + containerParam.unit_pixel * 4) + 'px'}">
        <div class="seal-index-rect" :style="{paddingLeft: containerParam.unit_pixel * 2 + 'px', paddingRight: containerParam.unit_pixel * 2 + 'px', height: containerParam.unit_pixel * 18 + 'px', fontSize: containerParam.unit_pixel * 16 + 'px'}">{{ seal_detail['index'] }}</div>
        <div class="card-rect"
            :style="{top: containerParam.card_height * 0.05 + 'px', height: containerParam.card_height + 'px', left: containerParam.unit_pixel * 0 + 'px', width: containerParam.card_width * 0.9 + 'px'}">
            <div class="seal-name"
                :style="{fontSize: seal_detail.seal_name.length <= 6 ? containerParam.card_width * 0.9 / 6.5 + 'px' : containerParam.card_width * 0.9 / (seal_detail.seal_name.length + 0.5) + 'px',
                        top: containerParam.unit_pixel * 15 + 'px'}">
                    {{ seal_detail['seal_name'] }}
            </div>
            <div class="info-row" :style="{top: containerParam.unit_pixel * (45 - 2) + 'px', height: containerParam.unit_pixel * (60 + 4) + 'px', left: '2.5%', width: '95%'}">
                <div class="prev-next-arrow" :style="{height: containerParam.unit_pixel * 20 + 'px'}" @click="clickPrevNext('prev')">
                    <svg width="16" height="19" viewBox="0 0 16 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M13.877 2L6.78967 9.76364L13.877 17.1163" stroke="#8F7B6C" stroke-width="3.22" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M8.96387 2L1.87658 9.76364L8.96387 17.1163" stroke="#8F7B6C" stroke-width="3.22" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </div>
                <div class="seal-pic"
                    :style="{height: containerParam.unit_pixel * 60 + 'px', width: containerParam.unit_pixel * 60 + 'px'}">
                    <img :src="seal_detail.image_href" style="{max-width: 100%; max-height: 100%; margin-top: 0.1em; margin-bottom: 0em, cursor: 'pointer'}"
                        @click="fullImageModel.show =true, fullImageModel.src=seal_detail.image_href, fullImageModel.label = seal_detail.seal_name">
                </div>
                <div class="prev-next-arrow" :style="{height: containerParam.unit_pixel * 20 + 'px'}" @click="clickPrevNext('next')">
                    <svg width="16" height="19" viewBox="0 0 16 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M2 2L9.08728 9.76364L2 17.1163" stroke="#8F7B6C" stroke-width="3.22" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M6.91309 2L14.0004 9.76364L6.91309 17.1163" stroke="#8F7B6C" stroke-width="3.22" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </div>
                <!-- <div class="seal-pic"
                    :style="{height: containerParam.unit_pixel * 75 + 'px', width: containerParam.unit_pixel * 75 + 'px'}">
                    <img :src="seal_detail.image_href" style="{max-width: 100%; max-height: 100%; margin-top: 0em; margin-bottom: 0em, cursor: 'pointer'}"
                        @click="fullImageModel.show =true, fullImageModel.src=seal_detail.image_href, fullImageModel.label = seal_detail.seal_name">
                </div> -->
            </div>
            <div class="seal-page"
                :style="{top: containerParam.unit_pixel * (105 + 2) + 'px', height: containerParam.unit_pixel * (120 - 107 - 5) + 'px', left: '2.5%', width: '95%', fontSize: containerParam.unit_pixel * 11 + 'px'}">
                {{ (seal_detail['series_list'].indexOf(seal_detail['index']) + 1) + '/' + seal_detail['series_list'].length }}
            </div>
            <div class="info-row" :style="{top: containerParam.unit_pixel * 120 + 'px', left: '2.5%', width: '95%'}">
                <div class="agent-group" :style="{gap: containerParam.unit_pixel * 2 + 'px'}">           
                    <div class="agent-icon">
                        <svg width="11" height="14" viewBox="0 0 11 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M8.94846 13H1.90909C1.31263 13 0.881532 12.2323 1.02917 11.4469C1.37759 9.58661 2.352 8.05709 3.62169 7.30709C3.62169 7.30709 3.62759 7.30709 3.62759 7.30118C2.65909 6.70472 2.01539 5.63583 2.01539 4.41339C2.01539 2.52953 3.54492 1 5.42878 1C7.31263 1 8.84216 2.52953 8.84216 4.41339C8.84216 5.63583 8.19846 6.70472 7.22996 7.30118C7.22996 7.30709 7.23586 7.30709 7.23586 7.30709C8.50555 8.05709 9.47996 9.58661 9.82838 11.4469C9.97602 12.2323 9.54492 13 8.94846 13Z" stroke="#8F7B6C" stroke-linejoin="round"/>
                        </svg>
                    </div>
                    <div class="agent-name" :style="{fontSize: containerParam.unit_pixel * 12 + 'px'}">{{ seal_detail['collector_name'] }}</div>
                </div>
                <div class="life-span" :style="{fontSize: containerParam.unit_pixel * 11 + 'px'}">{{ seal_detail['life_span'][0].toString() + '-' + seal_detail['life_span'][1].toString() }}</div>
            </div>
            <div class="info-row" :style="{top: containerParam.unit_pixel * 135 + 'px', left: '2.5%', width: '95%'}">
                <div class="agent-time-group" :style="{gap: containerParam.unit_pixel * 2 + 'px'}">           
                    <div class="time-icon">
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M11.1444 9.08594C11.0154 9.30091 10.7383 9.36779 10.5281 9.23881C10.3132 9.10983 10.2463 8.83276 10.3753 8.62257C10.8482 7.82958 11.1014 6.92672 11.1014 5.99997C11.1014 3.18151 8.81804 0.898087 5.99971 0.898087C3.18138 0.898087 0.898047 3.18151 0.898047 5.99997C0.898047 8.81843 3.18138 11.1019 5.99971 11.1019C6.92164 11.1019 7.82923 10.8535 8.62218 10.3805C8.83714 10.2516 9.10943 10.3232 9.2384 10.5334C9.36737 10.7436 9.29572 11.0206 9.08554 11.1496C8.15406 11.7085 7.08883 12.0047 5.99971 11.9999C2.68459 11.9999 0 9.31524 0 5.99997C0 2.6847 2.68459 0 5.99971 0C9.31483 0 11.9994 2.6847 11.9994 5.99997C11.9946 7.10347 11.6985 8.15919 11.1444 9.08594ZM3.425 7.9299L5.54113 5.80889V3.29616C5.54113 3.04775 5.74176 2.84712 5.99015 2.84712C6.23855 2.84712 6.43918 3.04775 6.43918 3.29616V5.99519C6.43918 6.11462 6.39141 6.22927 6.30543 6.31526L4.05553 8.56524C3.88357 8.742 3.59696 8.74678 3.42021 8.57481C3.24347 8.40283 3.23869 8.1162 3.41066 7.93945C3.42021 7.93945 3.425 7.93468 3.425 7.9299Z" fill="#8F7B6C"/>
                        </svg>
                    </div>
                    <div class="time-span" :style="{fontSize: containerParam.unit_pixel * 12 + 'px'}">{{ seal_detail['stamped_year'][0].toString() + '-' + seal_detail['stamped_year'][1].toString() }}</div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { mapState } from "vuex";
import * as SealCardFunc from "@/utils/timeline/seal_card_func";
import * as OverviewFunction from "@/utils/overview/overview_function"

const d3 = require("d3");
const $ = require("jquery");

const margin = {
    top: 0.01,
    left: 0.01,
    right: 0.01,
    bottom: 0.01,
}
const time_duration = 1000,
      timeout_duration = 100,
      seal_card_num = 12


export default {
    name: "LayoutCard",
    components: {
    },
    data() {
        return {
            containerParam: { // 当前绘制窗口的宽度
                x: 0,
                width: 0,
                card_width: 0, // includes the gap between seal cards
                card_height: 0, // card height
                unit_pixel: 0, // 单位大小
                sealIconSize: 1// seal icon的大小
            },
            sealContainerShow: false,
            fullImageModel: {
                show: false,
                src: null,
                label: null
            },
        };
    },
    props: ["seal_detail", "cardList"],
    computed: {
        ...mapState(["language", "cur_view", "painting_name", "rem", "selection"]),
        
    },
    watch: {
        seal_detail: {
            handler: function(newVal, oldVal) {
                const self = this
                // console.log("seal_detail", newVal)
            },
            deep: true
        },
        resize_scale: function(newVal, oldVal) {

        }
    },
    methods: {
        initialize() {
        },
        renderSealCard() {
            const self = this
            // console.log(self.seal_detail, self.resize_scale)
            setTimeout(() => {
                self.containerParam = SealCardFunc.getSealCardContainerSize() // {x: , width: }

                self.containerParam['card_width'] = self.containerParam['width'] / seal_card_num
                self.containerParam['card_height'] = self.containerParam['card_width'] * 0.9 * 175 / 120
                self.containerParam['unit_pixel'] = self.containerParam['card_height'] / 175

                // console.log('self.containerParam', self.containerParam)

                self.sealContainerShow = true

            }, timeout_duration)
        },
        clickPrevNext(button_choice) {
            const self = this
            let selected_seal_pic_list = OverviewFunction.clickPrevNextButton(self.seal_detail, self.cardList, self.resize_scale, self.selection, button_choice)
            self.$store.commit("changeSelection", {
                entity: "seal_pic",
                value: selected_seal_pic_list
            })
        },
    },
    mounted() {
        const that = this
        that.initialize()
        that.renderSealCard()
    },
};
</script>

<style scoped lang="scss">
.layout-seal-card {
    position: absolute;
    // color: #8F7B6C;
    // border: 2px solid #8F7B6C;
    // border-radius: 5px;
    display: flex;
    justify-content: center;

    overflow-y: auto;
    .seal-index-rect {
        position: absolute;
        color: white;
        background-color: #A56752;
        z-index: 1;
    }
    .card-rect {
        position: absolute;
        background-color: #FFF8EB;
        color: #8F7B6C;
        border: 2px solid #8F7B6C;
        // border-radius: 5px;
        // clip-path: polygon(0% 0%, 25% 0%, 25% 6%, 80% 6%, 80% 0%, 100% 0%, 100% 100%, 0% 100%); // 上开口
        // clip-path: polygon(0% 0%, 100% 0%, 100% 100%, 75% 100%, 75% 95%, 25% 95%, 25% 100%, 0% 100%); // 下开口(暂时去掉，因为rect有纯色填充)
        .seal-name{
            display: flex; // new
            // flex-direction: row;
            text-align: center;
            align-items: center;
            justify-content: center; // new

            /*font-size:  $rem + 'px';*/
            font-weight: bold;
            width: 100%;
            position: relative;
            color: #724A2B;
        }
        .seal-page {
            position: absolute;
            // color: #8F7B6C;
        }
        .info-row {
            position: absolute;
            display: flex;
            flex-direction: row;
            justify-content: space-between; // 多个item时使用（加左右箭头时）
            // justify-content: center; 
            align-items: center; // new
            .agent-group {
                display: flex;
                flex-direction: row;
                align-items: center; // new
            }
            .agent-time-group {
                display: flex;
                flex-direction: row;
                align-items: center; // new
            }
        }
        .seal-page {
            position: absolute;
            left: 2.5%;
            width: 95%;
            border-bottom: 1.3px solid #724A2B; /* 下划线样式，可以根据需要更改颜色、宽度和样式 */
            padding-bottom: 5px; /* 可选：为文本添加一些底部填充，以使下划线距离文本更远 */
        }
        .seal-icon-group {
            position: absolute;
            left: 2.5%;
            width: 95%;
            overflow-y: auto;
            // background-color: rgba(247, 171, 0, 0.15);
        }
    }
    .stamped-year {
        position: absolute;
        color: #724A2B;
    }    
}

</style>
