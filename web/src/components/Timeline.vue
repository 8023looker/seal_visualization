<template>
    <div class="timeline-container">
        <div class="seal-card">
            <SealCard
                :canvas_width="canvas_width"
                :canvas_height="canvas_height"
                :data="data"
            ></SealCard>
        </div>
        <div class="time-axis">
            <TimeAxis
                :canvas_width="canvas_width"
                :canvas_height="canvas_height"
                :data="data"
            ></TimeAxis>
        </div>
        <div class="collector-card">
            <CollectorCard
                :canvas_width="canvas_width"
                :canvas_height="canvas_height"
                :data="data"
            ></CollectorCard>
        </div>
        <div class="link-container"></div>
    </div>
</template>

<script>
import { mapState } from "vuex";

const d3 = require("d3");
const $ = require("jquery");
const time_duration = 1000,
      timeout_duration = 100

import TimeAxis from "./timeline_widgets/TimeAxis.vue";
import SealCard from "./timeline_widgets/SealCard.vue";
import CollectorCard from "./timeline_widgets/CollectorCard.vue";

import * as Data from "@/data/Data.js";
import * as TypeColor from "@/theme/type_color";
import * as DataProcess from "@/utils/data_process"

export default {
    name: "Timeline",
    components: {
        TimeAxis,
        SealCard,
        CollectorCard
    },
    data() {
        return {
           data: null,
        };
    },
    props: ["canvas_width", "canvas_height"],
    computed: {
        ...mapState(["language", "cur_view", "painting_name", "rem", "selection", "hover", "transition"]),
    
    },
    watch: {
        cur_view: function(newValue, oldValue) {
            const self = this
            if (newValue !== oldValue) {
                if (newValue === 'timeline') {
                    console.log('从其他视图切换到timeline视图啦')
                } else { // 从timeline切换到其他视图
                    console.log('从timeline视图切换到其他视图啦')
                }
            }
        },
        selection: { // 注意：当前select || hover 均为单选，而非List
            handler: function(newVal, oldVal) {
                const self = this
                if (newVal === 'timeline' && newVal !== oldVal) {
                    self.renderCollectorCard()
                }
            },
            deep: true
        },
        hover: {
            handler: function(newVal, oldVal) {
                const self = this
                if (newVal === 'timeline' && newVal !== oldVal) {

                }
            },
            deep: true
        },
        transition: {
            handler: function (newVal, _) {
                const self = this
                if (newVal.to === 'timeline' || newVal.from === 'timeline') {
                    self.$store.commit("changeCurViewForce", newVal.to)        
                }
            },
            deep: true,
        },
    },
    methods: {
        initialize() { },
        getSubSet() { // 使用部分样本进行demo展示
            const self = this
            self.data = {
                "painting_name": self.data['painting_name'],
                "meta_data": self.data['meta_data'],
                "collectors": self.data['collectors'].slice(0, 1)
            }
        },
    },
    mounted() {
        const that = this
        let whole_data = Data.read_data() // 首先读入总体的
        for (let i in whole_data) {
            if (whole_data[i]['painting_name'] === that.painting_name) {
                that.data = whole_data[i]
            }
        }
        // that.getSubSet() // 用于测试的demo
        that.data = DataProcess.getCollectorColor(that.data)
        // console.log("seal_data", that.data)
        that.initialize();
    },
};
</script>

<style scoped lang="scss">
.timeline-container {
    position: absolute;
    width: 100%;
    height: 100%;
    left: 0%;
    top: 0%;

    $axis-panel-height: 10%;
    $seal-card-height: 35%; // 90%
    $collector-card-height: 53%; // 55%
    .seal-card {
        position: absolute;
        height: $seal-card-height;
        left: 0.5%;
        width: 99%;
        top: 0%;
        z-index: 1;
        // background-color: rgba(91, 203, 23, 0.15);
    }
    .time-axis {
        position: absolute;
        height: $axis-panel-height;
        left: 0.5%;
        width: 99%;
        top: $seal-card-height + 0.5%;
        // z-index: 1;
    }
    .collector-card {
        position: absolute;
        height: $collector-card-height;
        left: 0.5%;
        width: 99%;
        top: $axis-panel-height + $seal-card-height;
        overflow-x: auto;
        // background-color: rgba(247, 171, 0, 0.15);
    }
    .collector-card::-webkit-scrollbar {
        display: none;
    }
    .link-container {
        position: absolute;
        left: 0.5%;
        width: 99%;
        top: 0;
        height: $seal-card-height;
        // background-color: rgba(247, 171, 0, 0.15);
    }
}


</style>
