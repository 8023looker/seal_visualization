<template>
    <div v-show="cur_view === 'timeline' || (cur_view !== 'timeline' && selection.entity === null)" class="barchart-container"></div>
    <div v-show="cur_view !== 'timeline' && selection.entity !== null" class="detail-info-container"></div>
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

export default {
    name: "LeftPanel",
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
            sealCardPosDict: {},
        }
    },
    props: ["canvas_width", "canvas_height"],
    computed: {
        ...mapState(["language", "cur_view", "painting_name", "selection", "transition", "overlay_duration"]),
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
        that.initialize()
    },
};
</script>

<style scoped lang="scss">
$upper-panel-height: 90%;
.barchart-container {
    position: absolute;
    width: 100%;
    height: $upper-panel-height;
    left: 0%;
    top: 0%;
    background-color: rgba(247, 171, 0, 0.15);
    
}
.detail-info-container {
    position: absolute;
    width: 100%;
    height: $upper-panel-height;
    left: 0%;
    top: 0%;
    // background-color: rgba(91, 203, 23, 0.15);
}
.glyth-container {
    position: absolute;
    left: 0%;
    top: $upper-panel-height;
    width: 100%;
    height: calc(100% - #{$upper-panel-height});
}
</style>
