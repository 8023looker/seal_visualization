<template>
    <div class="circle2card-link" id="circle2card-link">
        <svg id="circle2card-svg"></svg>
    </div>
    <div class="timeline-eventcard-container" id="event-scroll-container">
        <div class="agent-iterate" v-if="agentIterate.exist"
            :style="{top: agentIterate.lib_rect.top + 'px', left: agentIterate.lib_rect.left + 'px', width: (20 - 0.3) * rem + 'px'}">
            <div class="shared-library-name"
                :style="{fontSize: (1.2 * rem) + 'px'}"
                >{{agentIterate.library === '' ? '--' : agentIterate.library}}</div>
        </div>
        <div class="dashed-line" v-if="agentIterate.exist"
            :style="{top: agentIterate.dashed_line.top + 'px', left: agentIterate.dashed_line.left + 'px', width: 0.1 * rem + 'px', height: 15 * rem + 'px', borderLeft: 'dashed 0.2vh #724A2B'}"></div>
        <div class="library-iterate" v-for="(item, index) in libraryIterate.iterate_pos" :key="index"
            :style="{top: item.top + 'px', left: item.left + 'px'}">
            <svg :style="{width: (2 * rem) + 'px', height: (2 * rem) + 'px'}" viewBox="0 0 49 23" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M48.09 10.2891L38.1599 0.999146C37.6799 0.459145 36.76 0.119141 35.76 0.119141H32.07C30.02 0.119141 28.6999 1.45915 29.6799 2.56915L38.9299 11.2191L29.6799 19.8691C28.7099 20.9791 30.02 22.3192 32.07 22.3192H35.76C36.77 22.3192 37.6799 21.9791 38.1599 21.4391L48.09 12.1492C48.3601 11.8492 48.4399 11.5191 48.3899 11.2191C48.4399 10.9091 48.3601 10.5891 48.09 10.2891Z" fill="#806146"/>
                <path opacity="0.8" d="M33.5588 10.2891L23.6286 0.999146C23.1486 0.459145 22.2287 0.119141 21.2287 0.119141H17.5388C15.4888 0.119141 14.1686 1.45915 15.1486 2.56915L24.3986 11.2191L15.1486 19.8691C14.1786 20.9791 15.4888 22.3192 17.5388 22.3192H21.2287C22.2387 22.3192 23.1486 21.9791 23.6286 21.4391L33.5588 12.1492C33.8288 11.8492 33.9088 11.5191 33.8588 11.2191C33.9088 10.9091 33.8288 10.5891 33.5588 10.2891Z" fill="#806146"/>
                <path opacity="0.6" d="M19.0293 10.2891L9.09936 0.999146C8.61936 0.459145 7.69921 0.119141 6.69921 0.119141H3.00927C0.959272 0.119141 -0.360621 1.45915 0.619379 2.56915L9.86938 11.2191L0.619379 19.8691C-0.350621 20.9791 0.959272 22.3192 3.00927 22.3192H6.69921C7.70921 22.3192 8.61936 21.9791 9.09936 21.4391L19.0293 12.1492C19.2993 11.8492 19.3793 11.5191 19.3293 11.2191C19.3793 10.9091 19.2993 10.5891 19.0293 10.2891Z" fill="#806146"/>
            </svg>
        </div>
        <div class="single-event-card" v-for="(item, index) in eventsHandle" :key="index"
            :style="{height: (20 * rem) + 'px', width: (10 * rem) + 'px', left: (item.card_XPos) + 'px', top: (rem * 1) + 'px'}"
        >
            <div class="event-sequence"
                :id="timelineBook + '-event-card-seq-' + (index + 1).toString()"
                :style="{top: (0.4 * rem) + 'px', left: (4.4 * rem) + 'px', backgroundColor: item.lib_color, width: (1.2 * rem) + 'px', height: (1.2 * rem) + 'px'}"
            >               
                {{ item.次序 === '' ? '?' : item.次序 }}
            </div>
            <div class="card-rect"
                :style="{height: (18.5 * rem) + 'px', top: (rem * 1) + 'px',
                borderRight: item.iterate.agent_pair && item.iterate.pair_offset === 1 ? 'none' : 'solid 0.2vh #724A2B',
                borderLeft: item.iterate.agent_pair && item.iterate.pair_offset === 2 ? 'none' : 'solid 0.2vh #724A2B',
                clipPath: item.iterate.library_pair ? (item.iterate.lib_iterate_pos === 1 ? 
                'polygon(0% 100%, 25% 100%, 25% 95%, 80% 95%, 80% 100%, 100% 100%, 100% 13%, 98% 13%, 98% 6%, 100% 6%, 100% 0%, 0% 0%)' :
                'polygon(0% 100%, 25% 100%, 25% 95%, 80% 95%, 80% 100%, 100% 100%, 100% 0%, 0% 0%, 0% 6%, 2% 6%, 2% 13%, 0% 13%)') : 
                'polygon(0% 100%, 25% 100%, 25% 95%, 80% 95%, 80% 100%, 100% 100%, 100% 0%, 0% 0%)'}"
                :id="timelineBook + '-event-card-' + (index + 1).toString()">
                <div class="info-row library-name" 
                    v-show="!item.iterate.agent_pair"
                    :style="{fontSize: (1.2 * rem) + 'px', top: (0.8 * rem) + 'px'}">{{item.library === '' ? '--' : item.library}}</div>
                <div class="info-row agent-action" :style="{top: (rem * 2.5) + 'px', height: ((1.5 + item.action_YPos) * rem) + 'px'}">
                    <div class="agent">
                        <svg :style="{width: (1 * rem) + 'px', height: (1 * rem) + 'px'}" class="agent-icon" id="_图层_2" data-name="图层 2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 21.32">
                            <path :fill=item.agent_color class="cls-1" d="m13.96,20.82H2.04c-1.01,0-1.74-1.3-1.49-2.63.59-3.15,2.24-5.74,4.39-7.01,0,0,.01,0,.01-.01-1.64-1.01-2.73-2.82-2.73-4.89C2.22,3.09,4.81.5,8,.5s5.78,2.59,5.78,5.78c0,2.07-1.09,3.88-2.73,4.89,0,.01.01.01.01.01,2.15,1.27,3.8,3.86,4.39,7.01.25,1.33-.48,2.63-1.49,2.63Z"/>
                        </svg>
                        <div class="agent-name" :style="{fontSize: (1 * rem) + 'px', left: (1.5 * rem) + 'px', top: 0 + 'px'}"
                        >{{ item.agent === '' ? '--' : item.agent }}</div>
                    </div>
                    <div class="info-row action" :style="{fontSize: (1 * rem) + 'px', top: (item.action_YPos * rem) + 'px'}">{{ item.經手方式 }}</div>
                </div>
                <div class="info-row event-loc-time" :style="{fontSize: (1 * rem) + 'px', top: (rem * rowPos.ancient_time) + 'px', height: (2.5 * rem) + 'px'}">
                    <svg :style="{position: 'absolute', width: (1 * rem) + 'px', height: (1 * rem) + 'px', top: 0 + 'px', left: 0 + 'px'}" viewBox="0 0 27 27" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M13.4602 26.2914C20.5294 26.2914 26.2603 20.5606 26.2603 13.4914C26.2603 6.42215 20.5294 0.691406 13.4602 0.691406C6.39096 0.691406 0.660156 6.42215 0.660156 13.4914C0.660156 20.5606 6.39096 26.2914 13.4602 26.2914Z" fill="#8F7B6C"/>
                        <path d="M12.9805 6.85156V13.3216L18.1604 16.5216" stroke="#F2ECE7" stroke-width="1.76" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <div class="time-loc-text" :style="{fontSize: (1 * rem) + 'px', left: (1.5 * rem) + 'px', top: 0 + 'px', width: (7 * rem) + 'px'}">{{ item.時間 === '' ? '--' : item.時間 }}</div>      
                </div>
                <div class="info-row event-loc-time" :style="{fontSize: (1 * rem) + 'px', top: (rem * rowPos.location) + 'px', height: (2.5 * rem) + 'px'}">
                    <svg :style="{position: 'absolute', width: (1.2 * rem) + 'px', height: (1.2 * rem) + 'px', top: 0 + 'px', left: (-0.1 * rem) + 'px'}"
                        t="1677920887221" class="location-icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2810" >
                        <path fill="#8F7B6C" d="M512 88.174592c-178.7904-3.196928-326.373376 139.101184-329.663488 317.889536 0 264.907776 274.70336 529.814528 329.663488 529.814528s329.662464-264.906752 329.662464-529.814528C838.3488 227.275776 690.811904 84.978688 512 88.174592zM512 606.217216c-104.031232 0-188.379136-84.348928-188.379136-188.379136S407.968768 229.458944 512 229.458944s188.379136 84.347904 188.379136 188.378112S616.031232 606.217216 512 606.217216z" p-id="2811">
                        </path>
                    </svg>
                    <div class="time-loc-text" :style="{fontSize: (1 * rem) + 'px', left: (1.5 * rem) + 'px', top: 0 + 'px', width: (7 * rem) + 'px'}">{{ item.location_std_new.replace(/\?|？/i, "") }}</div>      
                </div>
                <div class="info-row source-image" id="img-div"
                :style="{top: (rem * (rowPos.location + 2.5)) + 'px', height: (17.5 - (rowPos.location + 2.5)) * rem + 'px'}"
                    v-if="imgDiv.visible">
                    <img :src="item.image_href"                 
                        v-if="!(imgDiv.hiddenImgIndexList.includes(index))"
                        style="{max-width: 100%; max-height: 100%; margin: 0.1em; cursor: 'pointer'}">
                    <div class="img-error-icon" v-if="imgDiv.hiddenImgIndexList.includes(index)" :style="{width: '98%', opacity: 0.6}"> <!--5 * rem-->
                        <div :style="{fontSize: (1 * rem) + 'px'}">无印章图片</div>
                    </div>
                </div>
            </div>
            <div class="calendar-year center-row" :style="{top: (19 * rem) + 'px'}">
                <div class="year-text"
                    :id="timelineBook + '-year-div-' + (index + 1).toString()"
                >{{ item.Time === '' ? '--' : item.Time }}</div>
            </div>
        </div>
    </div>
    <div class="flip-container">
        <svg class="flip-icon" :style="{width: (2 * rem) + 'px', height: (2 * rem) + 'px'}" viewBox="0 0 55 68" fill="none" xmlns="http://www.w3.org/2000/svg"
            v-if="flipIcon === 'right'"
            @click="eventContainerScroll">
            <path d="M2.24023 1.98047L32.4202 35.0405L2.24023 66.3505" stroke="#724A2B" stroke-width="3.22" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M23.1602 1.98047L53.3403 35.0405L23.1602 66.3505" stroke="#724A2B" stroke-width="3.22" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <svg class="flip-icon" :style="{width: (2 * rem) + 'px', height: (2 * rem) + 'px'}" viewBox="0 0 55 68" fill="none" xmlns="http://www.w3.org/2000/svg"
            v-if="flipIcon === 'left'"
            @click="eventContainerScroll">
            <path d="M53.3398 1.98047L23.1599 35.0405L53.3398 66.3505" stroke="#724A2B" stroke-width="3.22" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M32.4199 1.98047L2.23975 35.0405L32.4199 66.3505" stroke="#724A2B" stroke-width="3.22" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
    </div>
    <!-- <div class="card2bookImage-link" id="card2bookImage-link">
        <svg id="card2bookImage-svg"></svg>
    </div> -->
</template>


<script>
import { mapState } from "vuex";
import * as d3 from "d3";
import { ref, computed, watch, onMounted, reactive } from "vue";
import * as InfoCardFunc from "@/data/timeline/info_card_func";
import { color, type_color } from "@/theme"
import { ElDialog } from "element-plus";
const $ = require("jquery");
import * as DataProcess from "@/data/timeline/timeline_full/data_process"
import * as RenderAxis from "@/data/timeline/timeline_full/render_axis"
import * as TypeColor from "@/theme/type_color"
import * as TimeLineUpdate from "@/data/timeline/timeline_update";
import { get_book_image_pos } from "@/data/BookTraj";

const time_duration = 1000
export default {
    name: "TimeLineEventCard",
    data() {
        return {
            eventsHandle: null, // 处理后的events
            rowPos: {}, // 每一行的Y_pos
            imgDiv: {}, // 印章图片参数
            flipIcon: 'right', // 默认为right，点击后left
            agentIterate: {},
            libraryIterate: {},
            bookImagePosDict: {} // 用于记录书影图片位置大小等数据
        }
    },
    props: ["metaData", "events"],
    computed: {
        ...mapState(["rem", "language", "switchWholeView", "timelineBook"])
    },
    watch:{
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
                    console.log('event card界面', newVal)
                    console.log('timeline-eventcard-container', document.getElementsByClassName('main-panel')[0].clientWidth / self.rem) // timeline-eventcard-container
                    self.initializePara() // 清零
                    self.flipIcon = 'right' // 箭头初始化
                    self.addTypeColor(self.events)

                    const card_container_width = document.getElementsByClassName('app')[0].clientWidth * 1.017 * 0.85 // 需要乘以比例系数
                    self.eventsHandle = RenderAxis.computeCardPosition(self.eventsHandle, card_container_width, self.rem)
                    self.agentIterate = RenderAxis.agentIterateDivParam(self.eventsHandle, self.rem)
                    self.libraryIterate = RenderAxis.libraryIterateDivParam(self.eventsHandle, self.rem)

                    self.computeRowHeight()
                    self.handleSealImage()
                    console.log('events', self.eventsHandle)
                    console.log('rowPos', self.rowPos)

                    // 绘制circle到event card的连线
                    setTimeout(() => {
                        RenderAxis.cirle2eventCardLink(self.timelineBook, self.eventsHandle, self.rem)
                        // RenderAxis.eventCard2bookImageLink(self.timelineBook, self.eventsHandle, self.bookImagePosDict, imgList, self.rem) // imgList参数在这个组件中不方便传
                    }, time_duration / 100)
                    
                }
            },
            deep: true
        }

    },
    methods: {
        addTypeColor(events) {
            const self = this
            self.eventsHandle =  JSON.parse(JSON.stringify(events))
            for (let e in events) {
                self.eventsHandle[e]['lib_color'] = TypeColor.library[events[e].lib_type]
                self.eventsHandle[e]['agent_color'] = TypeColor.agent[events[e].agent_type]
            }
            self.eventsHandle = DataProcess.modify_text_length(self.eventsHandle)
            // console.log('events', self.eventsHandle)
            // return self.eventsHandle
        },
        computeRowHeight() { // 用于计算各属性字符串的长度
            const self = this
            // 用于计算各个属性的文字长度
            let text_length = {
                            library: 0,
                            agent: 0,
                            action: 0,
                            ancient_time: 0,
                            location: 0
                        }
            for (let e in self.eventsHandle) {
                text_length.library = text_length.library < self.eventsHandle[e].library.length ? self.eventsHandle[e].library.length : text_length.library
                text_length.agent = text_length.agent < self.eventsHandle[e].agent.length ? self.eventsHandle[e].agent.length : text_length.agent
                text_length.action = text_length.action < self.eventsHandle[e].經手方式.length ? self.eventsHandle[e].經手方式.length : text_length.action
                text_length.ancient_time = text_length.ancient_time < self.eventsHandle[e].時間.length ? self.eventsHandle[e].時間.length : text_length.ancient_time
                text_length.location = text_length.location < self.eventsHandle[e].location_std_new.length ? self.eventsHandle[e].location_std_new.length : text_length.location
                // 更新action position经手方式的y_position
                if (self.eventsHandle[e].agent.length + self.eventsHandle[e].經手方式.length >= 7) {
                    self.eventsHandle[e]['action_YPos'] = 1
                } else {
                    self.eventsHandle[e]['action_YPos'] = 0
                }
            }
            // compute max row height          
            if (text_length.agent + text_length.action >= 7) { // 经手人物和经手方式
                self.rowPos['action'] += 1 // 3.5
                self.rowPos['ancient_time'] += 1 // 5
                self.rowPos['location'] += 1 // 6.5
            }
            if (text_length.ancient_time > 7) { // 时间文字描述
                self.rowPos['location'] += 1 // 7.5
            }
        },
        handleSealImage() {
            const self = this
            for (let e in self.eventsHandle) {
                for (let i of self.eventsHandle[e].來源.matchAll(/\([^\(\)]+\)\<[^\(\)]+\>/g)) { // 同一个流传事件中可能有多个印章图片
                    if (i[0]) {
                        // self.eventsHandle[e]['image_label'] = getLabel(i[0])
                        self.eventsHandle[e]['image_label'] = i[0].split('<')[1].split('.')[0].split('/')[2]
                        self.eventsHandle[e]['image_href'] = 'http://vis.pku.edu.cn/chinese_classics_circulation/assets/images/' + i[0].split('<')[1].split('.')[0] + '.webp'
                        self.eventsHandle[e]['full_image_href'] = 'http://vis.pku.edu.cn/chinese_classics_circulation/assets/images_full/' + i[0].split('<')[1].split('.')[0] + 'F.jpg'
                    } else {
                        // self.eventsHandle[e]['image_label'] = '--'
                        self.eventsHandle[e]['image_label'] = 'none'
                        self.eventsHandle[e]['image_href'] = 'http://vis.pku.edu.cn/chinese_classics_circulation/assets/images/' + 'none' + '.webp'
                        self.eventsHandle[e]['full_image_href'] = 'http://vis.pku.edu.cn/chinese_classics_circulation/assets/images_full/' + 'none' + 'F.jpg'
                    }
                }
            }
            // 检验各图片是否存在
            for (let e in self.eventsHandle) {
                let img = new Image()
                img.src = self.eventsHandle[e]['image_href']
                img.onerror = function(){
                    console.log('图片预加载出错啦，没有该图片哦')
                    self.imgDiv.hiddenImgIndexList.push(Number(e)) // 当前流传事件没有印章图片或印章图片加载失败
                    if (self.imgDiv.hiddenImgIndexList.length >= self.eventsHandle.length) {
                        console.log('所有图片都不存在')
                        setTimeout(() => {
                            self.imgDiv.visible = true;
                        }, 1000); // 1秒后显示图片的父div
                    }
                }
                if(img.complete) {
                    self.imgDiv.visible = true // 加载完成了再显示图片
                } else { // 图片尚未加载完成
                    img.onload = function() {
                        self.imgDiv.visible = true // 加载完成了再显示图片
                    }
                }
            }
        },
        handleImgError(pic_index) { // 暂时用不上？
            console.log('图片请求失败啦', pic_index)
            this.imgDiv.hiddenImgIndexList.push(pic_index)
        },
        initializePara() {
            const self = this
            self.rowPos = { // initialize，默认1行间隔1.5 * rem，2行间隔2.5 * rem
                action: 0,
                ancient_time: 4,
                location: 5.5
            }
            self.imgDiv = {
                visible: false,
                hiddenImgIndexList: []
            }
        },
        eventContainerScroll() {
            const self = this
            const scrollableDiv = document.getElementById('event-scroll-container'),
                  scrollLeftMax = scrollableDiv.scrollWidth - scrollableDiv.clientWidth // 可以向右移动的最大值
            // console.log('scrollableDiv.scrollLeft Old', scrollableDiv.scrollLeft)
            // console.log('scrollLeftMax', scrollLeftMax)
            // 设置滚动偏移量，将 div 横向滚动到指定位置（这里设置为 100px）    
            // 添加一个短暂的延迟以触发过渡效果
            setTimeout(() => {
                // 创建一个过渡动画
                if (self.flipIcon === 'right') {
                    const interpolate = d3.interpolateNumber(scrollableDiv.scrollLeft, scrollLeftMax) // (start, end)
                    d3.transition()
                        .duration(time_duration) // 过渡的持续时间，单位是毫秒
                        .tween('scroll', function () {
                            return function (t) {
                                scrollableDiv.scrollLeft = interpolate(t)
                            }
                        })
                    setTimeout(() => {
                        self.flipIcon = 'left'
                    }, time_duration)
                } else {
                    const interpolate = d3.interpolateNumber(scrollLeftMax, 0) // (start, end)
                    d3.transition()
                        .duration(time_duration) // 过渡的持续时间，单位是毫秒
                        .tween('scroll', function () {
                            return function (t) {
                                scrollableDiv.scrollLeft = interpolate(t)
                            }
                        })
                    
                    setTimeout(() => {
                        self.flipIcon = 'right'
                    }, time_duration)
                }
            }, 100);
            // console.log('scrollableDiv.scrollLeft New', scrollableDiv.scrollLeft)        
        }
    },
    mounted() {
        const self = this
        self.bookImagePosDict = get_book_image_pos()
        self.initializePara()
        
    },
};
</script>

<!-- 需要将vw转换为px -->
<style scoped lang="scss">
$bottom-panel-height: 20vh;
$infocard-panel-height: 60vh;
.circle2card-link{
    position: absolute;
    left: 0%;
    top: 0%;
    height: 30%;
    width: 100%;
    // background-color: rgba(176, 196, 222, 0.212);
    #circle2card-svg {
        width: 100%;
        height: 100%;
    }
}
// .card2bookImage-link{
//     position: absolute;
//     left: 1%;
//     width: 98%;
//     bottom: 0;
//     height: $bottom-panel-height + $infocard-panel-height / 5;
//     background-color: rgba(176, 196, 222, 0.212);
// }
.timeline-eventcard-container{
    position: absolute;
    left: 0%;
    top: 25%;
    height: 60%;
    width: 95%;
    // background-color: rgba(131, 203, 172, 0.212);

    overflow-x: auto;
    transition: scroll-left 0.5s ease; /* 添加滚动过渡效果 */
    &::-webkit-scrollbar {
        display: none;  // 隐藏滚动条
    }
    .agent-iterate{
        z-index: 2;
        position: absolute;
        display: flex;
        // flex-direction: row;
        justify-content:center;
        align-items:center;
        color: #724A2B;
        font-weight: bold;
    }
    .dashed-line{
        position: absolute;
        opacity: 0.5;
    }
    .library-iterate{
        position: absolute;
    }
    
    .single-event-card{
        // background-color: rgba(255, 140, 0, 0.1);
        position: absolute;
        .event-sequence{
            z-index: 1; 
            position: absolute;
            border-radius:50%;
            color: white;
        }
        .card-rect{
            position: absolute;
            width: 97%;
            left: 1%;
            // border: solid 0.2vh #724A2B;
            border-top: solid 0.2vh #724A2B;
            border-right: solid 0.2vh #724A2B;
            border-bottom: solid 0.2vh #724A2B;
            border-left: solid 0.2vh #724A2B;
            // background-color: rgba(176, 196, 222, 0.212);
            overflow-y: auto;
    
            clip-path: polygon(0% 100%, 25% 100%, 25% 95%, 80% 95%, 80% 100%, 100% 100%, 100% 0%, 0% 0%); // normal
            // clip-path: polygon(0% 100%, 25% 100%, 25% 95%, 80% 95%, 80% 100%, 100% 100%, 100% 26.5%, 98% 26.5%, 98% 14.5%, 100% 14.5%, 100% 0%, 0% 0%); // offset = 1
            // clip-path: polygon(0% 100%, 25% 100%, 25% 95%, 80% 95%, 80% 100%, 100% 100%, 100% 0%, 0% 0%, 0% 14.5%, 2% 14.5%, 2% 26.5%, 0% 26.5%); // offset = 2
            .info-row {
                #img-div > img {
                    max-width: 100%;
                    max-height: 100%;
                }
            }
            .library-name {
                display: flex; // new
                // flex-direction: row;
                text-align: center;
                align-items: center;
                justify-content: center; // new
    
                /*font-size:  $rem + 'px';*/
                font-weight: bold;
                width: 100%;
                position: absolute;
                color: #724A2B;
            }
            .agent-action {
                // display: flex;
                // flex-direction: row;
                // justify-content: space-between;
                // flex-shrink: 1;
                // align-items: center; // new
                position: absolute;
                left: 5%;
                width: 90%;
    
                .agent {
                    display: flex;
                    flex-direction: row;
                    .agent-name{
                        /*font-size: 0.875 * $rem + 'px';*/
                        color: #724A2B;
                        position: absolute;
                    }
                }
                .action {
                    /*font-size: 0.875 * $rem + 'px';*/
                    background-color: #724A2B;
                    color: white;
                    opacity: 0.7;
                    position: absolute;
                    right: 5%;
                    // float: right;
                }
            }
            .event-loc-time{
                // display: flex;
                // flex-direction: row;
                opacity: 0.7;
                // text-align: center;
                // align-items: center;
                // justify-content: center; // new
                /*font-size: 0.75 * $rem + 'px';*/
                position: absolute;
                left: 5%;
                width: 90%;
                .time-loc-text{
                    position: absolute;
                    text-align: start;
                }
            }
            .source-image {
                position: absolute;
                left: 5%;
                width: 90%;
                background-color: rgba(164, 168, 189, 0.25);
                border: solid 0.1vh rgba(57, 71, 135, 0.25);

                display: flex;
                justify-content:center;
                align-items:center;

                .img-error-icon {
                    // border: 0.5px solid #394787;
                    display: flex;
                    // background-color: #A4A8BD;
                    // flex-direction: column;
                    justify-content:center;
                    align-items:center;
                }
            }  
        }
        .center-row{
            display: flex;
            align-items: center;
            justify-content: center;
            .year-text{
                text-align: center;
            }
        }
        .calendar-year{
            position: absolute;
            left: 0%;
            width: 100%;
        }
    }
}
.flip-container{
    position: absolute;
    left: 95%;
    top: 20%;
    width: 5%;
    height: 60%;
    display: flex;
    justify-content:center;
    align-items:center;
}
</style>
