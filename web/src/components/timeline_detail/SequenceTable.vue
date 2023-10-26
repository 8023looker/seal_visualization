<template>
    <div class="sequence-table" > <!--style="overflow-y: auto;"-->
        <el-table ref="myTable" :data="tableData" :header-fixed="true" style="width: 100%;" height= "100%"
        v-if="tableData.length > 0"
        :row-class-name="setRowClassName">
            <el-table-column label="流传次序" type="index" :width="rem * 5"/> <!--:width="rem * 4"-->
            <el-table-column label="收藏机构" prop="library" />
            <el-table-column label="经手人物" prop="agent" />
            <el-table-column label="时间区间" prop="composite_interval" />
            <el-table-column label="调整后时间区间" prop="time_interval_adjusted" />
            <el-table-column label="推测时间" prop="time_inferred" />
            <el-table-column label="次序史料" prop="sequence_material" />
            <el-table-column label="" :width="rem * 3" v-slot="scope"> <!--fixed会叠加颜色-->
                <span class="caret-wrapper">
                    <i class="sort-caret ascending" @click="changeSequence(scope.$index, 'up')"></i>
                    <i class="sort-caret descending" @click="changeSequence(scope.$index, 'down')"></i>
                </span>
            </el-table-column>
        </el-table>
    </div>
</template>

<script>
import { mapState } from "vuex";

const d3 = require("d3");
const $ = require("jquery");
import * as Time from "@/data/TimeLineData";
import * as DataProcess from "@/data/timeline/timeline_full/data_process"
// import { get_time_reasoning } from "@/data/BookTraj";
import { jsonCopy } from "@/utils/copy";
import * as Interaction from "@/data/timeline/timeline_full/interaction";

export default {
    name: "SequenceTable",
    props: ["metaData", "events"],
    components: {

    },
    data() {
        return {
            tableData: [],
            timeReaoningWhole: null, // 时间推测的data structure, whole
            timeReasoningData: null, // for single book
            eventsHandle: null, // 处理后的events
        }
    },
    computed: {
        ...mapState(["rem", "language", "switchWholeView", "timelineBook", "curEventData", "curReasonData"])
    },
    watch: {
        metaData: {
            handler: function(newVal, oldVal) {
                const self = this
                // console.log('metaData', self.metaData)
            },
            deep: true
        },
        events: {
            handler: function(newVal, oldVal) {

            },
            deep: true
        },
        timelineBook: function(newVal, oldVal) {
            const self = this
            if (newVal !== null && newVal !== oldVal) {
               
            }
        },
        curEventData: {
            handler: function(newVal, oldVal) {
                const self = this
                if (newVal !== null && newVal !== oldVal) {
                    self.eventsHandle = newVal
                }
            },
            deep: true
        },
        curReasonData: {
            handler: function(newVal, oldVal) {
                const self = this
                if (newVal !== null && newVal !== oldVal) {
                    self.timeReasoningData = newVal
                }
            },
            deep: true
        },
        timeReasoningData:{
            handler: function(newVal, oldVal) {
                const self = this
                if (newVal !== null && self.eventsHandle !== null) { // update tableData
                    self.tableData = []
                    for (let i = 0; i < newVal.length; i++) {
                        const cur_reason_data = newVal[i]
                        const source_string = DataProcess.getSequenceString(cur_reason_data['sequence']['flag'])
                        self.tableData.push({
                            sequence: i, // 流传次序
                            library: self.eventsHandle[i]['library'] === '' ? '--' : self.eventsHandle[i]['library'], // 收藏机构
                            agent: self.eventsHandle[i]['agent'] === '' ? '--' : self.eventsHandle[i]['agent'], // 经手人物
                            composite_interval:  // 时间区间
                                `${cur_reason_data['time_interval']['composite_interval'][0] === null ? 960 : cur_reason_data['time_interval']['composite_interval'][0]}-
                                 ${cur_reason_data['time_interval']['composite_interval'][1] === null ? 1965 : cur_reason_data['time_interval']['composite_interval'][1]}
                            `,
                            time_interval_adjusted:  // 调整后时间区间
                                `${cur_reason_data['time_interval_adjusted'][0] === null ? 960 : cur_reason_data['time_interval_adjusted'][0]}-
                                 ${cur_reason_data['time_interval_adjusted'][1] === null ? 1965 : cur_reason_data['time_interval_adjusted'][1]}
                            `,
                            time_inferred: parseInt(self.eventsHandle[i]['time_info']['timestampUpdated']), // 推测时间
                            sequence_material: source_string, // 次序史料
                            sequence_type: cur_reason_data['sequence']['flag'].some(item => item.state === "absolute") ? 'absolute' :
                                           (cur_reason_data['sequence']['flag'].some(item => item.state === "relative") ? 'relative' : 'unsettled')
                        })
                    }
                    // self.setRowClassName(self.tableData)
                }
            },
            deep: true
        },
    },
    methods: {
        initialize() {
            const self = this
            if (self.curEventData !== null) {
                self.eventsHandle = self.curEventData
                console.log("eventsHandle", self.eventsHandle)
            }
            if (self.curReasonData !== null) {
                self.timeReasoningData = self.curReasonData
                console.log("timeReasoningData", self.timeReasoningData)      
            }
        },
        setRowClassName(row) {
            // console.log('调用了row.id的方法', row.row.sequence_type)
            // 根据行的数据来动态设置类名
            if (row.row.sequence_type === 'absolute') {
                return 'absolute-row'; // 偶数行的类名
            } else if (row.row.sequence_type === 'relative'){
                return 'relative-row'; // 奇数行的类名
            } else {
                return 'unsettled-row'
            }
        },
        changeSequence(rowIndex, movement) {
            const self = this
            console.log(rowIndex, movement)
            const resortedArray = DataProcess.resortedEventReasonArray(self.timeReasoningData, [...self.eventsHandle], rowIndex, movement)
            console.log(resortedArray['event_data'])
            // 更新全局
            self.$store.commit("changeEventData", resortedArray['event_data'])
            self.$store.commit("changeReasonData", resortedArray['reason_data'])
        }
    },
    mounted() {
        const self = this
        self.initialize()
        // 监听自定义事件 myValueUpdated，当事件触发时更新 myValue 的值
        document.addEventListener('updateReasonData', () => {
            self.timeReasoningData = Interaction.export_reason_data; // 使用 JavaScript 文件中的 myValue
        })    
    },
};
</script>

<style>
.el-table .absolute-row {
  --el-table-tr-bg-color: #AD9278; /* 不管用 */
  background-color: rgba(173, 146, 120, 0.1);
  color: #6A4C2A;
  /* opacity: 0.8; */
}
.el-table .relative-row {
  /* --el-table-tr-bg-color: var(--el-color-success-light-9); */
  color: #6A4C2A;
  /* opacity: 0.8; */
}
.el-table .unsettled-row {
  /* --el-table-tr-bg-color: var(--el-color-success-light-9); */
  color: #724A2B;
  opacity: 0.6;
}
.el-table th {
    color: #6A4C2A;
}
/* .el-table th,
.el-table td {
  color: #FF0000;
  opacity: 0.8;
} */

</style>

<style scoped lang="scss">
.sequence-table {
    // background-color: rgba(173, 146, 120, 0.1);
    position: absolute;
    left: 16%;
    top: 0%;
    width: 78%;
    height: 98.5%;
    border: 1.5px solid #AD9278; /* 边框宽度、样式和颜色 */
}
</style>
