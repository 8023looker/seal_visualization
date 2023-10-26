<template>
    <div class="header">
        <timelineTitle></timelineTitle>
        <!-- <BookMetaData v-if="data.event_info !== null"
            :metaData="data.meta_info"
            :events="data.event_info"
        ></BookMetaData> -->
        <SequenceTable v-if="curEventData !== null"
            :metaData="data.meta_info"
            :events="data.event_info"
        ></SequenceTable>
        <backToMain></backToMain>
    </div>
    <div class="timeAxis">
        <TimeLineAxis
            :events="data.event_info"
        ></TimeLineAxis>
    </div>
    <div class="timeline-legend">
        <TimelineLegend
            :events="data.event_info"
        ></TimelineLegend>
    </div>
    <div class="time-reasoning" v-if="curEventData !== null">
        <TimeReasoning
            :metaData="data.meta_info"
            :events="data.event_info"
        ></TimeReasoning>
    </div>
    <!-- <div class="event-card">
        <TimeLineEventCard
            :metaData="data.meta_info"
            :events="data.event_info"
        ></TimeLineEventCard>
    </div> -->
    <!-- <div class="book-image">
        <TimelineBookImage
            :metaData="data.meta_info"
            :events="data.event_info"
        ></TimelineBookImage>
    </div> -->
</template>

<script>
const $ = require("jquery");

import timelineTitle from "./timeline_detail/TimelineTitle.vue";
import backToMain from "./timeline_detail/backToMain.vue";
import TimeLineAxis from "./timeline_detail/TimelineAxis.vue";
import TimelineLegend from "./timeline_detail/TimelineLegend.vue";
import BookMetaData from "./timeline_detail/BookMetaData.vue";
import TimeLineEventCard from "./timeline_detail/TimelineEventCard.vue"
import TimelineBookImage from "./timeline_detail/TimelineBookImage.vue"
import TimeReasoning from "./timeline_detail/TimeReasoning.vue"
import SequenceTable from "./timeline_detail/SequenceTable.vue";

import { mapState } from "vuex";
import { ref, computed, watch, onMounted, reactive } from "vue";
import { color, type_color } from "@/theme";
import * as Translate from "@/theme/lang";
import * as BookTraj from "@/data/BookTraj";
import { get_time_reasoning } from "@/data/BookTraj";
import * as Data from "@/data/Data.js";
import * as DataProcess from "@/data/timeline/timeline_full/data_process"

export default {
    name: "timelineDetail",
    data() {
        return {
            sequenceColor: '#CFCCC9', // 此前为固定的“未详”color
            book_info_detail: {}, // 用于在div上显示
            dataAll: null, // 全部data
            data: { // book metadata, event of a single book
                meta_info: null,
                event_info: null
            },
            timeReaoningWhole: null, // 时间推测的data structure, whole
            timeReasoningData: null, // for single book
        }
    },
    components: {
        timelineTitle,
        backToMain,
        TimeLineAxis,
        TimelineLegend,
        BookMetaData,
        TimeLineEventCard,
        TimelineBookImage,
        TimeReasoning,
        SequenceTable
    },
    // props: ['book_detail'],
    computed: {
        ...mapState(["filter", "selection", "hover", "transition", "rem", "language", "switchWholeView", "timelineBook", "curEventData", "curReasonData"])
    },
    watch:{
        timelineBook: function(newVal, oldVal) {
            const self = this
            if (newVal !== null && newVal !== oldVal) {
                // console.log(newVal)
                // self.data.event_info = BookTraj.time_info_rehandle(self.dataAll[newVal]) // event data
                // self.data.meta_info = Data.read_books().filter((d) => d.book_name === newVal)[0] // meta data
                // console.log('timeline_detail_book', self.data) // 绘制timeline_detail view所需要的data
                self.initialize()
            }
        },
        switchWholeView: function(newVal, oldVal) {
            const self = this
        }
    },
    methods: {
        initialize() {
            const self = this
            if (self.timelineBook !== null) {
                // event data
                self.data.event_info = BookTraj.time_info_rehandle(self.dataAll[self.timelineBook]) // event data
                // 对event data进行处理
                self.data.event_info = DataProcess.handlePrintEvents(self.data.event_info, self.timelineBook)
                self.eventsHandle = DataProcess.computeSubTimelineYIndex(self.data.event_info)
                self.$store.commit("changeEventData", self.data.event_info)
                console.log('self.data.event_info', self.data.event_info)

                // meta data
                self.data.meta_info = Data.read_books().filter((d) => d.book_name === self.timelineBook)[0] // meta data
                console.log('timeline_detail_book', self.data) // 绘制timeline_detail view所需要的data

                // reason_data  
                if (self.timelineBook !== null) {
                    self.timeReasoningData = self.timeReaoningWhole[self.timelineBook]

                    // For Time Reasoning Panel (Version 2), 暂时弃用
                    // DataProcess.classifyAxisGroup(self.timeReasoningData)

                    self.$store.commit("changeReasonData", self.timeReasoningData)
                    console.log("timeReasoningData", self.timeReasoningData)
                }
            }
        },
    },
    mounted() {
        const that = this
        that.dataAll = BookTraj.get_book_traj().book_traj
        that.timeReaoningWhole = get_time_reasoning()
        that.initialize()
    },
};
</script>

<style>

</style>

<style scoped lang="scss">
// $title-height: 9vh;
$title-height: 18.5vh;
$axis-panel-height: 10vh;
$bottom-panel-height: 20vh;
$infocard-panel-height: 60vh;
$timeReasoning-panel-height: 60vh;
// $timeReasoning-panel-height: 78vh;
.header {
        position: absolute;
        height: $title-height;
        width: 100vw;
        top: 1vh;
        // background-color: rgba(240, 248, 255, 0.085);
        // display: flex;
        // flex-direction: row;
        // justify-content: space-between;
    }
.timeAxis{
    position: absolute;
    height: $axis-panel-height;
    left: 0.5vw;
    width: 99vw;
    top: $title-height + 1.5vh;
    z-index: 1;
}
.timeline-legend{
    position: absolute;
    width: 8vw;
    left: 0.5vw;
    // top: $title-height + $axis-panel-height + 0.1vh;
    top: $title-height + $axis-panel-height + 0.1vh - 11.5vh;
    height: 100vh - ($title-height + $axis-panel-height + 0.1vh) + 11.5vh;
    // background-color: rgba(255, 140, 0, 0.1);
}
.time-reasoning{
    position: absolute;
    left: 0.5vw;
    top: $title-height + $axis-panel-height + 1.5vh;
    height: 100vh - ($title-height + $axis-panel-height + 1.5vh + 1vh);
    // height: $timeReasoning-panel-height;
    width: 99vw;
    // background-color: rgba(255, 140, 0, 0.1);
}
.event-card{
    position: absolute;
    height: $infocard-panel-height + 6vh;
    left: 8.5vw;
    width: 91vw;
    // background-color: rgba(255, 140, 0, 0.1);
    top: $title-height - 3vh + $axis-panel-height;
}
.book-image{
    position: absolute;
    // height: $bottom-panel-height - 1vh + $infocard-panel-height / 5;
    height: $bottom-panel-height * 2 - 2vh;
    left: 8.5vw;
    width: 91vw;
    bottom: 1vh;
    // background-color: rgba(176, 196, 222, 0.212);
}
</style>
