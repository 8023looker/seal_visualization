<template>
    <div class="book-metadata">
        <div class="info-column book-name">
            <div class="content">
                <div class="book-title info-row" :style="{fontSize: (1.3 * rem) + 'px'}">{{ '《' + metaData.book_name + '》' }}</div>
                <div class="mix-box info-row">
                    <div class="edition" :style="{fontSize: (0.8 * rem) + 'px'}">{{ metaData.版本 }}</div>
                    <div class="book-type">
                        <div class="book-type-rect" :style="{fontSize: (0.8 * rem) + 'px'}">{{ metaData.type[0] }}</div>
                    </div>
                </div> 
            </div>      
        </div>
        <div class="info-column author-volume">
            <div class="content">
                <div class="author info-row" :style="{fontSize: (0.9 * rem) + 'px'}">{{ metaData.責任者 }}</div>
                <div class="volume info-row" :style="{fontSize: (0.8 * rem) + 'px'}">{{ metaData.卷數 }}</div>
            </div>      
        </div>
        <div class="info-column location-time">
            <div class="sub-info-column ancient-time">
                <div class="mix-box-left info-row">
                    <svg :style="{width: (1 * rem) + 'px', height: (0.8 * rem) + 'px'}" viewBox="0 0 30 30" fill="none" class="time-icon" xmlns="http://www.w3.org/2000/svg">
                        <path d="M15.2006 29.9794C23.2418 29.9794 29.7606 23.4606 29.7606 15.4194C29.7606 7.37811 23.2418 0.859375 15.2006 0.859375C7.1593 0.859375 0.640625 7.37811 0.640625 15.4194C0.640625 23.4606 7.1593 29.9794 15.2006 29.9794Z" fill="#806146"/>
                        <path d="M14.6504 7.85938V15.2294L20.5404 18.8594" stroke="#F2ECE7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <div class="old-time-name" :style="{fontSize: (0.75 * rem) + 'px'}">{{ metaData.時代 }}</div>
                </div>
                <div class="mix-box-left info-row">
                    <svg :style="{width: (1 * rem) + 'px', height: (0.8 * rem) + 'px'}" viewBox="0 0 28 34" fill="none" class="location-icon" xmlns="http://www.w3.org/2000/svg">
                        <path d="M14.5107 0.367645V0.347656H14.5007H14.4907H14.4807H14.4707V0.367645V0.38765C14.4707 0.38765 14.4807 0.38765 14.4907 0.38765C14.5007 0.38765 14.5107 0.38765 14.5107 0.38765C14.5107 0.38765 14.5107 0.377645 14.5107 0.367645ZM14.4707 1.23766C7.0307 1.23766 0.970703 7.45765 0.970703 15.1077C0.970703 24.3977 13.2907 33.3077 13.8207 33.6577C14.0107 33.7977 14.2407 33.8676 14.4707 33.8676C14.7007 33.8676 14.9307 33.7977 15.1207 33.6577C15.6407 33.3077 27.9707 24.3877 27.9707 15.1077C27.9707 7.46765 21.9107 1.23766 14.4707 1.23766Z" fill="#806146"/>
                        <path d="M14.5807 10.3375C12.6407 10.2875 10.8707 11.4275 10.1007 13.1975C9.33072 14.9775 9.7108 17.0375 11.0608 18.4275C12.4108 19.8175 14.4708 20.2375 16.2608 19.5075C18.0508 18.7775 19.2307 17.0375 19.2307 15.0975C19.2607 12.4975 17.1807 10.3675 14.5807 10.3375Z" stroke="#F2ECE7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <div class="old-location-name" :style="{fontSize: (0.75 * rem) + 'px'}">{{ metaData.地點 }}</div>
                </div>
                <div class="ancient book-type-rect" :style="{fontSize: (0.8 * rem) + 'px'}">{{ '古' }}</div>
            </div>
            <div class="sub-info-column modern-time">
                <div class="content">
                    <div class="time info-row" :style="{fontSize: (0.9 * rem) + 'px'}">{{ metaData.Time + '年' }}</div>
                    <div class="location info-row" :style="{fontSize: (0.8 * rem) + 'px'}">{{ metaData.Location }}</div>
                </div>
                <div class="modern book-type-rect-reverse" :style="{fontSize: (0.8 * rem) + 'px'}">{{ '今' }}</div>
            </div>
        </div>
        <div class="info-column intro-text">
            <div class="content">
                <div class="text para-row" :style="{fontSize: (0.8 * rem) + 'px'}">{{ '最早在' + metaData.時代 + '(' + metaData.Time + '年)，刊刻于' + metaData.地點 + '(今' + metaData.Location + ')。' }}</div>
                <div class="text para-row" :style="{fontSize: (0.8 * rem) + 'px'}">{{ '先后经历了' + events.length.toString() + '次流传，在第' + japanSequence.toString() + '次流传中跨国传入日本。' }}</div>
                <div class="text para-row" :style="{fontSize: (0.8 * rem) + 'px'}">{{ textString }}</div>
                <div class="source" :style="{fontSize: (0.7 * rem) + 'px'}">{{ '————' + metaData.來源 }}</div>
            </div>
        </div>
    </div>
</template>

<script>
import { mapState } from "vuex";

const d3 = require("d3");
const $ = require("jquery");
import * as Time from "@/data/TimeLineData";

export default {
    name: "BookMetaData",
    props: ["metaData", "events"],
    components: {
    },
    data() {
        return {
           japanSequence: 0, // 首次传入日本的次序
           japanPeriod: [], // 日本各时代的流传统计信息
           textString: '其中，', // 对于书籍流传描述的文字信息
        };
    },
    computed: {
        ...mapState(["switchWholeView", "rem"]),
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
                const self = this
                if (newVal !== null) {
                    console.log('self.events', self.events)
                    self.compute2Japan()
                }
            },
            deep: true
        }
    },
    methods: {
        compute2Japan() { // 计算流传进入日本的次序
            const self = this
            // console.log('self.events', self.events)
            for (let i in self.events) {
                // console.log(self.events[i])
                if (self.events[i].state_flag === 'Japan') {
                    self.japanSequence = Number(i) // 相抵消了
                    break
                }
            }
        },
        computeJapanNumber() { // 计算日本各时代的流传次数
            const self = this
            self.japanPeriod = [] // clear
            // initialize
            for (let i in Time.jp_period_legend) {
                const jp_period = Time.jp_period_legend[i]
                self.japanPeriod.push({
                    jp_period_name: jp_period[0],
                    start: jp_period[1],
                    end: jp_period[2],
                    event_num: 0
                })
            }
            for (let e in self.events) {
                const event_time = self.events[e].time_info.timestamp

                for (let j in self.japanPeriod) {
                    if (event_time > self.japanPeriod[j].start && event_time <= self.japanPeriod[j].end) {
                        self.japanPeriod[j].event_num += 1
                        break
                    }
                }
            }
            // console.log(self.japanPeriod)
            self.japanPeriod = self.japanPeriod.filter(item => item.event_num > 0)
            // console.log(self.japanPeriod)

            for (let jp in self.japanPeriod) {
                const jp_info = self.japanPeriod[jp]
                // console.log(jp_info)
                self.textString = self.textString + jp_info.jp_period_name + '时代流传' + jp_info.event_num + '次，'
            }
            self.textString = self.textString.slice(0, -1) + '。'
        }
    },
    mounted() {
        const self = this
        if (self.events !== null) {
            self.compute2Japan()
            self.computeJapanNumber()
        }
    },
};
</script>

<style scoped lang="scss">
.book-metadata {
    // background-color: rgba(255, 140, 0, 0.1);
    // display: flex; /* 设置容器为flex布局 */
    // flex-direction: row; /* 设置子元素排列方向为纵向 */

    position: absolute;
    left: 16%;
    width: 78%;
    height: 100%;
    .info-column{
        border-left: 2px solid #724A2B; /* 在右侧添加 2px 宽的灰色边框 */
        display: flex;
        flex-direction: column;
        // align-items: center; // 垂直居中
        justify-content: center; // 水平居中
        position: absolute;
        height: 100%;
    }
    .info-row{
        padding: 1%;
    }
    .para-row{
        text-align: left;
    }
    .book-name{
        position: absolute;
        left: 0%;
        height: 100%;
        width: 20%;
        // background-color: rgba(255, 140, 0, 0.1);
        // display: flex;
        // flex-direction: column;
        // align-items: center; // 垂直居中
        // justify-content: center; // 水平居中
        .book-title{
            font-weight: bold;
        }
    }
    .author-volume{
        position: absolute;
        left: 20%;
        height: 100%;
        width: 10%;
        // background-color: rgba(255, 140, 0, 0.05);
        .content{ // 用于设置溢出滚动
            overflow-y: auto;
            max-height: 100%;
        }
    }
    .location-time{
        position: absolute;
        left: 30%;
        height: 100%;
        width: 30%;
        // background-color: rgba(255, 140, 0, 0.1);
        .sub-info-column{
            height: 100%;
            display: flex;
            flex-direction: column;
            justify-content: center; // 水平居中
        }
        .ancient-time{
            border-right: 1px solid #724A2B;
            position: absolute;
            left: 0%;
            width: 50%;
            height: 100%;
            // background-color: rgba(255, 140, 0, 0.1);
            .ancient{
                position: absolute;
                right: 0%;
                top: 0%;
            }
        }
        .modern-time{
            position: absolute;
            left: 50%;
            width: 50%;
            height: 100%;
            .modern{
                position: absolute;
                left: 0%;
                top: 0%;
            }
        }
        .mix-box-left{
            display: flex;
            flex-direction: row;
            justify-content: flex-start;
            align-items: center; // 垂直居中
            width: 87%;
            left: 3%;
        }
    }
    .intro-text{
        position: absolute;
        left: 60%;
        height: 100%;
        width: 40%;
        // background-color: rgba(255, 140, 0, 0.05);
        .content{ // 用于设置溢出滚动
            overflow-y: auto;
            max-height: 100%;
        }
        .source{
            // position: absolute;
            // left: 18%;
            // width: 80%;
            text-align: right; /* 将文字靠右对齐 */
            padding-right: 2%;
        }
    }
    .mix-box{
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        width: 90%;
        left: 5%;
    }
    .book-type-rect{ // rect实行填充
        display: inline-block; /* 设置为行内块元素，边框包裹内容 */
        padding: 2px; /* 适当的内边距，调整以达到你需要的效果 */
        color: white;
        background-color: #846146;
        border: 1px solid #846146;
        opacity: 0.61;
    }
    .book-type-rect-reverse{ // rect空心填充
        display: inline-block; /* 设置为行内块元素，边框包裹内容 */
        padding: 2px; /* 适当的内边距，调整以达到你需要的效果 */
        color: #846146;
        border: 1px solid #846146;
        opacity: 0.61;
    }
}
</style>
