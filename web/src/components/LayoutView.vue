<template>
    <el-dialog v-model="fullImageModel.show" :title="fullImageModel.label" top="5vh" width="80%">
        <div style="height: 75vh; width: 70%;">
            <img :src="fullImageModel.src" style="width: 100%; height: 100%; object-fit: contain;">
        </div>
    </el-dialog>
    <div v-show="cur_view === 'layout'" class="layout-container">
        <div v-if="showSealDiv" v-for="(item, index) in cardList" :key="index" class="seal-image-container"
            :style="{width: item.layout_params.width + 'px', height: item.layout_params.height + 'px', left: item.layout_params.x + 'px', top: item.layout_params.y + 'px'}">
            <!-- <img :src="item.image_href" class="seal-image" :id="'seal-image-layout-' + item.index"
                @click="fullImageModel.show =true, fullImageModel.src=item.image_href, fullImageModel.label = item.seal_name"> -->
            <img :src="item.image_href" class="seal-image" :id="'sealImageLayout-' + item.index"
                @click="showSealInfoCard">
        </div>
        <LayoutCard v-for="(item, index) in detailSealInfo"
            :seal_detail="JSON.parse(JSON.stringify(item))"
            :cardList="cardList"
        ></LayoutCard>
    </div>
    <svg v-show="cur_view === 'layout'" class="layout-transition-svg"></svg> <!--v-show="cur_view === 'layout'"并不完全正确-->
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
import * as LayoutFunc from "@/utils/layout_view/layout_function"
import * as LayoutFuncV2 from "@/utils/layout_view/layout_function_v2"

import * as Overview2Layout from "@/utils/transition/overview_and_layout"

import { setExportcardListInLayout } from "@/utils/transition/overview_and_layout"

export default {
    name: "LayoutView",
    components: {
        LayoutCard
    },
    data() {
        return {
            data: null,
            cardList: [],
            painting_name_en: '', 
            fullImageModel: {
                show: false,
                src: null,
                label: null
            },
            showSealDiv: false,
            sealCardPosDict: {},
        }
    },
    props: ["canvas_width", "canvas_height"],
    computed: {
        ...mapState(["language", "cur_view", "painting_name", "selection", "painting_pic", "transition", "overlay_duration"]),
        detailSealInfo: {
            get() {
                const self = this
                const tar = self.selection.entity !== null && self.selection.value
                if (!tar) return []
                let seal_pic_list = []
                // 或许可以考虑添加一些click position的信息
                seal_pic_list = jsonCopy(self.cardList.filter((d) => tar.includes(d['index'])))

                for (let i in seal_pic_list) {
                    seal_pic_list[i]['card_pos'] = self.sealCardPosDict[seal_pic_list[i]['index']]
                }
                console.log(seal_pic_list, self.selection.value)
                return seal_pic_list
            },
        },
    },
    watch: {
        cur_view: function(newValue, oldValue) {
            const self = this
            if (newValue === 'layout' && newValue !== oldValue) {
                console.log('从其他视图切换到layout视图啦')
                setTimeout(() => { // 需要设置延迟，否则$('.image-scroll-container').width()依然为0
                    self.showSealDiv = true
                }, timeout_duration)
            } else {
                self.showSealDiv = false
            }
        },
        selection: {
            handler: function(newVal, oldVal) {
                const self = this

            },
            deep: true
        },
        painting_pic: {
            handler: function(newVal, oldVal) {
                const self = this
                if (newVal.loaded) {
                    self.showSealDiv = false
                    self.cardList = jsonCopy(LayoutFunc.compute_abstract_layout(self.cardList, {
                        width: newVal.width,
                        height: newVal.height
                    }))
                    console.log(self.cardList)
                    self.showSealDiv = true
                }
            },
            deep: true
        },
        transition: {
            handler: function (newVal, _) {
                const self = this
                if (newVal.to !== 'timeline' && newVal.from !== 'timeline') {
                    self.transition_handler(newVal);
                } else {
                    self.$store.commit("changeCurViewForce", newVal.to)
                }
            },
            deep: true,
        },
        cardList: {
            handler: function (newVal, oldVal) {
                console.log('cardList in abstract view更新啦', newVal)
                setExportcardListInLayout(newVal)
            },
            deep: true
        },
    },
    methods: {
        initialize() { // 在切换到当前视图时需要重新刷新一遍
            const self = this
            
        },
        showSealInfoCard(event) {
            const self = this
            let selected_seal_pic_list = self.selection['value']
            const seal_pic_index = (event.target.id).split('-')[1] // index of current clicked seal_pic
            // console.log(seal_pic_index)

            // 获取点击的div的位置信息
            const clickedDiv = event.target
            const rect = clickedDiv.getBoundingClientRect()
            // console.log(rect)

            self.sealCardPosDict[seal_pic_index] = {
                x: rect.left + rect.width - $('.main-panel').offset().left, // event.clientX - rect.left
                y: rect.top - $('.main-panel').offset().top // event.clientY - rect.top
            }
            
            if (!selected_seal_pic_list.includes(seal_pic_index)) {
                selected_seal_pic_list = [...new Set(selected_seal_pic_list)] // 去重
                selected_seal_pic_list.push(seal_pic_index)
                self.$store.commit("changeSelection", {
                    entity: "seal_pic",
                    value: selected_seal_pic_list
                })
            } else {
                // 没有操作
            }
        },
        initializeSealPosDict() {
            const self = this
            for (let i in self.cardList) {
                self.sealCardPosDict[self.cardList[i]['index']] = {
                    x: 0,
                    y: 0
                }
            }
        },
        transition_handler(trans) {
            console.log(trans);
            const self = this

            const fr = trans.from;
            const to = trans.to;
            const st = trans.state;

            if (fr === "layout" && st === "out") { // 从layout视图往外走
                console.log("transition out");

                Overview2Layout.layout2overview(time_duration * 6, 'to', self.selection, self.cardList, self.painting_pic)

                setTimeout(() => {
                    self.$store.commit("transCompleted", null)
                }, time_duration * 6)
            } else if (to === "layout" && st === "out") {
                console.log("preparing for transition")
                
            } else if (to === 'layout' && st === 'overlay') { // 2个视图更新重叠
            

            } else if (to === "layout" && st === "in") { // 正在从其他视图切换到layout视图
                console.log("transition in");

                setTimeout(() => {
                    self.$store.commit("transCompleted", null);
                }, time_duration);
            }
        },
    },
    mounted() {
        const that = this
        console.log('进入到layout view啦')

        // 初始化painting_name_en
        that.painting_name_en = DataProcess.getPaintingNameEn(that.painting_name)

        let whole_data = Data.read_data() // 首先读入总体的
        for (let i in whole_data) {
            if (whole_data[i]['painting_name'] === that.painting_name) {
                that.data = whole_data[i]
            }
        }

        that.data = DataProcess.getCollectorColor(that.data)
        that.cardList = SealCardFunc.SealCardMapping(that.data) // mapped seal pictures into list
        that.initializeSealPosDict()
        // console.log("seal_data", that.data)

        // LayoutFunc.compute_abstract_layout(that.cardList) // 刚开始图片可能还没有加载出来
        that.initialize()
    },
};
</script>

<style scoped lang="scss">
.layout-container {
    position: absolute;
    width: 100%;
    height: 100%;
    left: 0%;
    top: 0%;
    z-index: 2;
    // background-color: rgba(91, 203, 23, 0.15);
    .seal-image-container {
        position: absolute;
        .seal-image {
            position: absolute;
            left: 0%;
            top: 0%;
            // width: 100%;
            // height: 100%;
            max-width: 100%; /* 设置图像的最大宽度为容器宽度的百分比 */
            max-height: 100%; /* 设置图像的最大高度为容器高度的百分比 */
            width: auto; /* 自动调整宽度 */
            height: auto; /* 自动调整高度 */
            cursor: pointer;
        }
    }
}
.layout-transition-svg {
        position: absolute;
        left: 0%;
        top: 0%;
        width: 100%;
        height: 100%;
    }
</style>
