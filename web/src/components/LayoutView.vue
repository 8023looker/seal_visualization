<template>
    <el-dialog v-model="fullImageModel.show" :title="fullImageModel.label" top="5vh" width="80%">
        <div style="height: 75vh; width: 70%;">
            <img :src="fullImageModel.src" style="width: 100%; height: 100%; object-fit: contain;">
        </div>
    </el-dialog>
    <div class="layout-container">
        <div v-if="showSealDiv" v-for="(item, index) in cardList" :key="index" class="seal-image-container"
            :style="{width: item.layout_params.width + 'px', height: item.layout_params.height + 'px', left: item.layout_params.x + 'px', top: item.layout_params.y + 'px'}">
            <img :src="item.image_href" class="seal-image"
                @click="fullImageModel.show =true, fullImageModel.src=item.image_href, fullImageModel.label = item.seal_name">
        </div>
    </div>
</template>

<script>
import { mapState } from "vuex";

const d3 = require("d3");
const $ = require("jquery");

const time_duration = 1000,
      timeout_duration = 100

import * as Data from "@/data/Data.js";
import * as TypeColor from "@/theme/type_color";
import { jsonCopy } from "@/utils/copy";
import * as DataProcess from "@/utils/data_process";
import * as SealCardFunc from "@/utils/timeline/seal_card_func";
import * as LayoutFunc from "@/utils/layout_view/layout_function"

export default {
    name: "LayoutView",
    components: {

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
        }
    },
    props: ["canvas_width", "canvas_height"],
    computed: {
        ...mapState(["language", "cur_view", "painting_name", "selection", "painting_pic"]),
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
    },
    methods: {
        initialize() { // 在切换到当前视图时需要重新刷新一遍
            const self = this
            
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
    // background-color: rgba(91, 203, 23, 0.15);
    .seal-image-container {
        position: absolute;
        .seal-image {
            position: absolute;
            left: 0%;
            top: 0%;
            // width: 100%;
            // height: 100;
            max-width: 100%; /* 设置图像的最大宽度为容器宽度的百分比 */
            max-height: 100%; /* 设置图像的最大高度为容器高度的百分比 */
            width: auto; /* 自动调整宽度 */
            height: auto; /* 自动调整高度 */
            cursor: pointer;
        }
    }
}
</style>
