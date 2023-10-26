<template>
    <!-- <div class="timeline-container detail-info-container"> -->
        <!-- book info-->
    <el-dialog v-model="fullImageModel.show" :title="fullImageModel.label" top="5vh" width="80%">
        <div style="height: 75vh; width: 100%;">
            <img :src="fullImageModel.src" style="width: 100%; height: 100%; object-fit: contain;">
        </div>
    </el-dialog>

    <div class="circle-card-link" :id="bookName+'-card-link'" :style="{top:event_detail.y + 'px', width: canvas_width * 0.78 + 'px'}">
        <svg id="card-link-svg" :style="{width: card_container_width + 'px'}"></svg>
    </div>

    <div class="event-container-all" :id="bookName+'-event-container-all'" :style="{top:event_detail.y + 45 + 'px', height: (11.7 * rem + 45) + 'px', width: canvas_width * 0.78 + 'px'}">
        <!-- <div class="timeline-event-seq" :style="{width: (event_detail_pop.length - 1) * 9 * rem + 8.3 * rem + 'px'}"> -->
        <!-- <div class="circle-card-link" :id="bookName+'-card-link'">
            <svg id="card-link-svg" :style="{width: card_container_width + 'px'}"></svg>
        </div> -->
        <div class="timeline-event-seq" :style="{width: card_container_width + 'px'}">
            <div class="timeline-event-seq event-sequence" v-for="(item, index) in JSON.parse(JSON.stringify(event_detail_pop))" :key="index" :style="{left: item.card_pos.x_pos + 'px', marginLeft: '-17.5vw', top: 0 + 'px', backgroundColor: pos_color_list[index].color, width: (1.2 * rem) + 'px', height: (1.2 * rem) + 'px'}">{{item.次序}}</div>
            <div class="timeline-event-seq time-range" v-for="(item, index) in JSON.parse(JSON.stringify(event_detail_pop))" :key="index" :style="{left: (item.card_pos.x_pos + 1.3 * rem) + 'px', marginLeft: '-17.5vw', top: (-0.1 * rem) + 'px', width: (6 * rem) + 'px', height: (2 * rem) + 'px'}">{{item.time_info.info_card_Time}}</div>
            <!-- <div class="timeline-event-seq event-sequence" v-for="(item, index) in JSON.parse(JSON.stringify(event_detail_pop))" :key="index" :style="{left: (index * 9 * rem) + 'px', top: 0 + 'px', backgroundColor: pos_color_list[index].color, width: (1.2 * rem) + 'px', height: (1.2 * rem) + 'px'}">{{item.次序}}</div>
            <div class="timeline-event-seq time-range" v-for="(item, index) in JSON.parse(JSON.stringify(event_detail_pop))" :key="index" :style="{left: (index * 9 * rem + 1.3 * rem) + 'px', top: (-0.1 * rem) + 'px', width: (6 * rem) + 'px', height: (2 * rem) + 'px'}">{{item.time_info.info_card_Time}}</div> -->
        </div>
        <!-- <div class="timeline-event-container" :style="{top:5 + 'px', height: (10.5 * rem) + 'px', width: (event_detail_pop.length - 1) * 9 * rem + 8.3 * rem + 'px'}"> -->
        <div class="timeline-event-container" :style="{top:5 + 'px', height: (10.5 * rem) + 'px', width: card_container_width + 'px'}">
            <!-- <div class="timeline-event-container event-info-card" v-for="(item, index) in JSON.parse(JSON.stringify(event_detail_pop))" :key="index" :style="{left: pos_color_list[index].position + 'vw', top: 0, width:step_width + 'vw'}">     -->
            <!-- <div class="timeline-event-container event-info-card" v-for="(item, index) in JSON.parse(JSON.stringify(event_detail_pop))" :key="index" :style="{top: 0, left: (index * 9 * rem) + 'px', width: (6 * rem) + 'px', height: (10 * rem) + 'px'}">   -->
            <div class="timeline-event-container event-info-card" v-for="(item, index) in JSON.parse(JSON.stringify(event_detail_pop))" :key="index" :style="{top: 0, left: item.card_pos.x_pos + 'px', marginLeft: '-17.5vw', width: (6 * rem) + 'px', height: (10 * rem) + 'px'}">  
                <!-- <img class="hidden-image" :id="'pic-' + (index)" :src="item.image_href" style="max-width: 100%; margin-top: 0.1em; margin-bottom: 0em"> -->
                <div class="info-row library-name" :style="{fontSize: rem + 'px'}">{{item.library}}</div>
                <div class="info-row event-loc" :style="{fontSize: (0.75 * rem) + 'px'}">
                    <svg style="width: 1em; height: 1em; transform: translateY(0.1em);"
                        t="1677920887221" class="info-row event-loc icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2810" >
                        <path fill="#8F7B6C" d="M512 88.174592c-178.7904-3.196928-326.373376 139.101184-329.663488 317.889536 0 264.907776 274.70336 529.814528 329.663488 529.814528s329.662464-264.906752 329.662464-529.814528C838.3488 227.275776 690.811904 84.978688 512 88.174592zM512 606.217216c-104.031232 0-188.379136-84.348928-188.379136-188.379136S407.968768 229.458944 512 229.458944s188.379136 84.347904 188.379136 188.378112S616.031232 606.217216 512 606.217216z" p-id="2811">
                        </path>
                    </svg>
                    <div>{{ item.location_std_new.replace(/\?|？/i, "") }}</div>      
                </div>
                <div class="info-row agent-action" id="img-above-div">
                    <div class="info-row agent">
                        <svg :style="{width: (0.75 * rem) + 'px', height: (0.75 * rem) + 'px'}" class="info-row agent-icon" id="_图层_2" data-name="图层 2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 21.32">
                            <path :fill=pos_color_list[index].agent_color class="cls-1" d="m13.96,20.82H2.04c-1.01,0-1.74-1.3-1.49-2.63.59-3.15,2.24-5.74,4.39-7.01,0,0,.01,0,.01-.01-1.64-1.01-2.73-2.82-2.73-4.89C2.22,3.09,4.81.5,8,.5s5.78,2.59,5.78,5.78c0,2.07-1.09,3.88-2.73,4.89,0,.01.01.01.01.01,2.15,1.27,3.8,3.86,4.39,7.01.25,1.33-.48,2.63-1.49,2.63Z"/>
                        </svg>
                        <div class="agent-name" :style="{fontSize: (0.75 * rem) + 'px'}">{{ item.agent }}</div>
                    </div>
                    <div class="info-row agent-action action" :style="{fontSize: (0.75 * rem) + 'px'}">{{ item.經手方式 }}</div>
                </div>
                <div class="info-row source-image" id="img-div" v-if="imgDiv.visible" @click="fullImageModel.show = true, fullImageModel.src=item.full_image_href, fullImageModel.label= item.image_label">
                    <img :src="item.image_href" 
                    
                    v-if="!(hiddenImgIndexList.includes(index))"
                    :style="{height: item.imgSizeH + 'px', width: item.imgSizeW + 'px', cursor: 'pointer'}">
                    <div id="img-error-icon" v-if="hiddenImgIndexList.includes(index)" :style="{height: 5 * rem + 'px', opacity: 0.6}">
                        <!-- <svg fill="none" stroke="currentColor" stroke-width="1.5" style="width: 1.2em; height: 1.2em;" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg> -->
                        <div :style="{fontSize: (0.75 * rem) + 'px'}">无印章图片</div>
                    </div>
                    <!-- <img :src="item.image_href" style="{max-width: 100%; max-height: 100%; margin-top: 0.1em; margin-bottom: 0em, cursor: 'pointer'}"> -->
                    <!-- <img :src="item.image_href" style="max-width: 100%; margin-top: 0.1em; margin-bottom: 0em"> -->
                    <!-- <img class="event-image" :src="item.image_href" :style="{width: image_container_list[index].resize_width, height: image_container_list[index].resize_height }"> -->
                    <!-- <div style="text-align: center; color: grey; font-size: 0.3em">{{ item.image_label }}</div> -->
                </div>
            </div>
        </div>
    </div>


</template>


<script>
import { mapState } from "vuex";
import * as d3 from "d3";
import { ref, computed, watch, onMounted, reactive } from "vue";
import * as InfoCardFunc from "@/data/timeline/info_card_func";
import { color, type_color } from "@/theme"
import { ElDialog } from "element-plus";
const $ = require("jquery");

export default {
    name: "TimeLineEventCard",
    data() {
        return {
            bookName: null,
            event_detail_pop: [],
            event_num: 1,
            pos_color_list: [], // {position: , color: }
            step_width: 0,
            y_pos: 0,
            image_container_list: [], // 用于记录image_container的位置与大小
            fullImageModel: {
                show: false,
                src: "",
                label: "",
            },
            // picLoadSuccess: false, // 用于标志图片是否加载完成
            imgDiv: {
                visible: false, // 用于控制图片的父div是否加载
                height: '50%'
            },
            hiddenImgIndexList: [],
            card_container_width: Infinity
        }
    },
    props: ['event_detail', "canvas_width", "canvas_height", "xTimeScale"],
    computed: {
        ...mapState(["filter", "selection", "hover", "transition", "rem", "language"])
    },
    watch:{
        selection: function (newVal, oldVal) {
            const that = this
            setTimeout(function() { // 数据传入异步性，需要setTimeout
                that.initialize()
                that.add_event_card_pos()
                that.compute_dist()
                // const scroll_container_width = self.canvas_width * (0.15 + 0.78)
                const scroll_container_width = that.canvas_width
                InfoCardFunc.draw_card_link(that.event_detail_pop, that.y_pos, scroll_container_width, that.bookName) // draw card link
        // this.computeImageSize() // 弃用
            }, 600)
        },
        language: function(newVal, oldVal) { // 切换语言的接口
            console.log('eventCard切换语言', newVal)
            const that = this
            that.initialize()
            that.add_event_card_pos()
            that.compute_dist()
            // const scroll_container_width = self.canvas_width * (0.15 + 0.78)
            const scroll_container_width = that.canvas_width
            InfoCardFunc.draw_card_link(that.event_detail_pop, that.y_pos, scroll_container_width, that.bookName) // draw card link
        },
        event_detail: function(newVal, oldVal) {
            this.hiddenImgIndexList = []
        },

    },
    methods: {
        initialize() {
            console.log('canvas_width', this.canvas_width)
            this.bookName = this.event_detail.book_name
            this.y_pos = this.event_detail.y // 首先确认摆放的位置(更新时会有延迟，div中直接使用event_detail.y来定位)
            let event_list = this.event_detail.events
            // event_list.sort((a,b) => { return Number(a.次序) - Number(b.次序) }) // 按照“次序”进行排序
            this.event_detail_pop =  this.event_detail.book_name === '尚書正義' ? event_list.slice(0, event_list.length - 1): event_list.slice(1)

            const self = this
            // 利用clip-path制作mask
            const maskWidth = document.getElementsByClassName('main-panel')[0].clientWidth
            const svg = d3.select('#timeLineSVG').append('g')
            // console.log('maskWidth', maskWidth)
            // 创建一个clipPath
            const clipPath = svg.append("clipPath")
                .attr("id", "clipPath")

            // 创建一个动态的mask(还没有出效果)
            clipPath.append("rect")
                    .attr("x", 0)
                    .attr("y", self.y_pos)
                    .attr("width", maskWidth)
                    .attr("height", 0)
                    .transition()
                    .duration(4000)
                    .attr("y", self.y_pos + 11.7 * self.rem)
                    .attr("height", 0)
            svg.attr("clip-path", "url(#clipPath)")

            // setTimeout(() => {
            //     console.log('vue里面的', d3.select(`#${self.bookName}-card-link`).select('#card-link-svg'))
            // }, 2000)
        },
        compute_dist() {
            const self = this
            self.event_num = self.event_detail_pop.length // 该本书event的个数
            // 假设目前总分配长度为70vw
            const step = 70 / self.event_num // step = bound + gap
            const gap = step / 13
            self.step_width = step * 12 / 13 // step:bound:gap = 13: 12: 1

            for (let index in self.event_detail_pop) { // 遍历每一个事件
                 // 用于修改语言
                 if (self.language === 'ch') {
                    self.event_detail_pop[index].library = self.event_detail_pop[index].library
                    self.event_detail_pop[index].location_std_new = self.event_detail_pop[index].location_std_new
                    self.event_detail_pop[index].agent = self.event_detail_pop[index].agent
                    self.event_detail_pop[index].經手方式 = self.event_detail_pop[index].經手方式
                } else if (self.language === 'en') {
                    self.event_detail_pop[index].library = self.event_detail_pop[index].library_lang.en
                    self.event_detail_pop[index].location_std_new = self.event_detail_pop[index].location_std_lang.en
                    self.event_detail_pop[index].agent = self.event_detail_pop[index].agent_lang.en
                    self.event_detail_pop[index].經手方式 = self.event_detail_pop[index].經手方式_lang.en
                }

                // 确定Time是否显示
                let showTime = true
                if (self.event_detail_pop[index].time_info.info_card_Time === '') {
                    self.event_detail_pop[index].time_info.info_card_Time = '--'
                    showTime = false
                }
                // 确定agent的显示内容(若为''，则修改为'--')
                if (self.event_detail_pop[index].agent === '') {
                    self.event_detail_pop[index].agent = '--'
                }
                // 确定library的显示内容(若为''，则修改为'--')
                if (self.event_detail_pop[index].library === '') {
                    self.event_detail_pop[index].library = '--'
                }
                // 确定经手方式的显示内容
                if (self.event_detail_pop[index].經手方式 === '') {
                    self.event_detail_pop[index].經手方式 = '--'
                }

                // 对于顺序不确定的的，直接替换为"?"
                if (self.event_detail_pop[index].次序 === '') {
                    self.event_detail_pop[index].次序 = '?'
                }

                // 图片来源
                const getLabel = (text) => {
                    const chapter = text.match(/\(.+\)/)[0];
                    const name = text.match(/[^\<\/]+(\.\w+)?/)[0];
                    return chapter + '-' + name.split('.')[0];
                }

                for (let i of self.event_detail_pop[index].來源.matchAll(/\([^\(\)]+\)\<[^\(\)]+\>/g)) {
                    if (i[0]) {
                        self.event_detail_pop[index]['image_label'] = getLabel(i[0])
                        self.event_detail_pop[index]['image_href'] = 'http://vis.pku.edu.cn/chinese_classics_circulation/assets/images/' + i[0].split('<')[1].split('.')[0] + '.webp'
                        self.event_detail_pop[index]['full_image_href'] = 'http://vis.pku.edu.cn/chinese_classics_circulation/assets/images_full/' + i[0].split('<')[1].split('.')[0] + 'F.jpg'
                    } else {
                        self.event_detail_pop[index]['image_label'] = '--'
                        self.event_detail_pop[index]['image_href'] = 'http://vis.pku.edu.cn/chinese_classics_circulation/assets/images/' + 'none' + '.webp'
                        self.event_detail_pop[index]['full_image_href'] = 'http://vis.pku.edu.cn/chinese_classics_circulation/assets/images_full/' + 'none' + 'F.jpg'
                    }
                }

                // 判别pic div的高度
                const library_row_height = (Math.ceil(self.event_detail_pop[index].library.length / 6) - 1) * self.rem
                const location_row_height = (Math.ceil(self.event_detail_pop[index].location_std.length / 8) - 1) * 0.75 * self.rem
                const location_agent_height = (Math.ceil((self.event_detail_pop[index].agent.length + self.event_detail_pop[index].經手方式.length) / 7) - 1) * 0.75 * self.rem
                const img_div_height = 6.5 * self.rem - (library_row_height + location_row_height + location_agent_height)
                self.event_detail_pop[index]['divHeight'] = img_div_height

                // compute image size
                let img = new Image()
                img.src = self.event_detail_pop[index]['image_href']
                img.onerror = function(){
                    console.log('图片预加载出错啦，没有该图片哦')
                    self.hiddenImgIndexList.push(Number(index))
                    // console.log(self.hiddenImgIndexList)
                    if (self.hiddenImgIndexList.length >= self.event_detail_pop.length) {
                        console.log('所有图片都不存在')
                        setTimeout(() => {
                            self.imgDiv.visible = true;
                        }, 1000); // 1秒后显示图片的父div
                    }
                }
                if(img.complete) {
                    const pic_width = img.width,
                          pic_height = img.height
                    // console.log('dd', img.width)
                    // console.log('pre_div_list[index]', [].slice.call(pre_div_list))

                    // if ((pic_width / pic_height) >= 7/6 || (pic_height / pic_width) > 2.5) {
                    //     self.event_detail_pop[index]['imgSize'] = '100%'
                    // } else {
                    //     // const resize_scale = (Math.round(7 * self.rem * 100/ pic_height)).toString() + '%'
                    //     console.log('img_div_height', img_div_height * self.rem)
                    //     console.log('pic_height', pic_height)
                    //     const resize_scale = (Math.round(img_div_height * self.rem * 100 / pic_height)).toString() + '%'
                    //     self.event_detail_pop[index]['imgSize'] = resize_scale
                    // }
                    
                    // if ((pic_height / pic_width) > 2.5) {
                    //     // const resize_scale = (Math.round(120 * 100 / pic_width)).toString() + '%'
                    //     const resize_scale_w = 6 * self.rem, // 'px'
                    //             resize_scale_h = resize_scale_w * pic_height / pic_width
                    //     // self.event_detail_pop[index]['imgSize'] = [resize_scale_w, resize_scale_h]
                    //     self.event_detail_pop[index]['imgSizeW'] = resize_scale_w
                    //     self.event_detail_pop[index]['imgSizeH'] = resize_scale_h
                    //     // self.event_detail_pop[index]['imgSize'] = '100%'
                    // } else {
                    //     const w_h = 6 * self.rem / img_div_height
                    //     if (pic_width / pic_height > w_h) { // width is larger
                    //         // const resize_scale = (Math.round(120 * 100 / pic_width)).toString() + '%'
                    //         const resize_scale_w = 6 * self.rem, // 'px'
                    //                 resize_scale_h = resize_scale_w * pic_height / pic_width
                    //         // self.event_detail_pop[index]['imgSize'] = [resize_scale_w, resize_scale_h]
                    //         self.event_detail_pop[index]['imgSizeW'] = resize_scale_w
                    //         self.event_detail_pop[index]['imgSizeH'] = resize_scale_h
                    //     } else { // if height is larger
                    //         // const resize_scale = (Math.round(img_div_height * self.rem * 100 / pic_height)).toString() + '%'
                    //         // const resize_scale = (Math.round(img_div_height * self.rem / pic_height)).toString() + 'px'
                    //         const resize_scale_h = img_div_height,
                    //                 resize_scale_w = resize_scale_h * pic_width / pic_height
                    //         // self.event_detail_pop[index]['imgSize'] = [resize_scale_w, resize_scale_h]
                    //         self.event_detail_pop[index]['imgSizeW'] = resize_scale_w
                    //         self.event_detail_pop[index]['imgSizeH'] = resize_scale_h
                    //     }
                    //     // console.log('img_div_height', img_div_height)
                    //     // console.log('pic_height', pic_height)
                    //     // console.log('pic_width', pic_width)
                    // }


                    const w_h = 6 * self.rem / img_div_height
                    if (pic_width / pic_height > w_h) { // width is larger
                        // const resize_scale = (Math.round(120 * 100 / pic_width)).toString() + '%'
                        const resize_scale_w = 6 * self.rem, // 'px'
                                resize_scale_h = resize_scale_w * pic_height / pic_width
                        // self.event_detail_pop[index]['imgSize'] = [resize_scale_w, resize_scale_h]
                        self.event_detail_pop[index]['imgSizeW'] = resize_scale_w
                        self.event_detail_pop[index]['imgSizeH'] = resize_scale_h
                    } else { // if height is larger
                        // const resize_scale = (Math.round(img_div_height * self.rem * 100 / pic_height)).toString() + '%'
                        // const resize_scale = (Math.round(img_div_height * self.rem / pic_height)).toString() + 'px'
                        const resize_scale_h = img_div_height,
                                resize_scale_w = resize_scale_h * pic_width / pic_height
                        // self.event_detail_pop[index]['imgSize'] = [resize_scale_w, resize_scale_h]
                        self.event_detail_pop[index]['imgSizeW'] = resize_scale_w
                        self.event_detail_pop[index]['imgSizeH'] = resize_scale_h
                    }
                    self.imgDiv.visible = true // 加载完成了再显示图片
                } else { // 图片尚未加载完成
                    img.onload = function() {
                        // 图像加载完成后执行的代码
                        const pic_width = img.width,
                        pic_height = img.height

                        const w_h = 6 * self.rem / img_div_height
                        if (pic_width / pic_height > w_h) { // width is larger
                            // const resize_scale = (Math.round(120 * 100 / pic_width)).toString() + '%'
                            const resize_scale_w = 6 * self.rem, // 'px'
                                    resize_scale_h = resize_scale_w * pic_height / pic_width
                            // self.event_detail_pop[index]['imgSize'] = [resize_scale_w, resize_scale_h]
                            self.event_detail_pop[index]['imgSizeW'] = resize_scale_w
                            self.event_detail_pop[index]['imgSizeH'] = resize_scale_h
                        } else { // if height is larger
                            // const resize_scale = (Math.round(img_div_height * self.rem * 100 / pic_height)).toString() + '%'
                            // const resize_scale = (Math.round(img_div_height * self.rem / pic_height)).toString() + 'px'
                            const resize_scale_h = img_div_height,
                                    resize_scale_w = resize_scale_h * pic_width / pic_height
                            // self.event_detail_pop[index]['imgSize'] = [resize_scale_w, resize_scale_h]
                            self.event_detail_pop[index]['imgSizeW'] = resize_scale_w
                            self.event_detail_pop[index]['imgSizeH'] = resize_scale_h
                        }
                        self.imgDiv.visible = true // 加载完成了再显示图片
                    }
                }

                self.event_detail_pop[index]['show_time'] = showTime
                self.pos_color_list.push({
                    position: gap / 2 + index * step,
                    color: type_color.library[self.event_detail_pop[index].lib_type], // lib_color
                    agent_color: type_color.agent[self.event_detail_pop[index].agent_type], // agent_color
                    divHeight: img_div_height
                })
            }
            console.log('self.event_detail_pop', self.event_detail_pop)
        },
        handleImgError(pic_index) {
            console.log('图片请求失败啦', pic_index)
            this.hiddenImgIndexList.push(pic_index)
        },
        computeImageSize() { // 弃用
            const self = this
            if (self.event_detail_pop.length > 0) {
                // const pre_div_list = document.getElementsByClassName("info-row agent-action")
                for (let index in self.event_detail_pop) {
                    let img = new Image()
                    img.src = self.event_detail_pop[index].image_href
                    if(img.complete) {
                        const pic_width = img.width
                        const pic_height = img.height
                        // console.log('dd', img.width)
                        // console.log('pre_div_list[index]', [].slice.call(pre_div_list))

                        if ((pic_width / pic_height) >= 7/6 || (pic_width / pic_height) > 2.5) {
                            // console.log('image_container_list', self.image_container_list)
                            self.image_container_list.push({
                                resize_width: '100%',
                                resize_height: '100%'
                            })
                        } else {
                            const resize_scale = (Math.round(7 * self.rem * 100/ pic_height)).toString() + '%'
                            self.image_container_list.push({        
                                resize_width: resize_scale,
                                resize_height: resize_scale
                            })
                        }
                        // self.imgDiv.visible = true // 加载完成了再显示图片
                        } else {
                            setTimeout(() => {
                                self.imgDiv.visible = true;
                            }, 1000); // 1秒后显示图片的父div
                        }
                        // img.onload = function() {  
                        //     console.log('ff', img.width) 
                        // } 
                }
            // console.log('self.image_container_list', self.image_container_list)   
            }
        },
        add_event_card_pos() {
            const self = this
            // let card_pos_list = InfoCardFunc.cal_info_card_pos(self.xTimeScale, self.event_detail_pop, self.rem)
            let card_pos_list = InfoCardFunc.cal_info_card_pos_plus(self.xTimeScale, self.event_detail_pop, self.rem, self.canvas_width) // self.canvas_width * 1.1
            self.card_container_width = card_pos_list[card_pos_list.length - 1].x_pos + 8.3 * self.rem - self.canvas_width * 0.15
            for (let i in card_pos_list) {
                self.event_detail_pop[i] = card_pos_list[i].ori_idx === self.event_detail_pop[i].ori_idx ? {...{card_pos: card_pos_list[i]}, ...self.event_detail_pop[i]} : self.event_detail_pop[i]
            }
        }
    },
    mounted() {
        const self = this
        self.initialize()
        self.add_event_card_pos()
        self.compute_dist()
        // const scroll_container_width = self.canvas_width * (0.15 + 0.78)
        const scroll_container_width = self.canvas_width * 1.1
        InfoCardFunc.draw_card_link(self.event_detail_pop, self.y_pos, scroll_container_width, self.bookName) // draw card link
        // this.computeImageSize() // 弃用
        // setTimeout(() => {
        //     // console.log('info-row agent-action', $('.info-row agent-action').height())
        //     this.imgDiv.visible = true;
        // }, 1000); // 1秒后显示图片的父div
    },
};
</script>

<!-- 需要将vw转换为px -->
<style scoped lang="scss">
.circle-card-link {
    position: absolute;
    left: 17vw;
    z-index: -1;
}
.event-container-all {
    position: absolute;
    /*width: 100%;*/
    overflow-x: auto;
    &::-webkit-scrollbar {
        display: none;  // 隐藏滚动条
      }
    left: 16vw;
    .timeline-event-seq {
        position: absolute;
        left: 0.5vw;
        /*top: 7.3vh;
        width: 70vw;*/
        height: 8vh;
        z-index: 1;
        /* width: 100%; */
        .event-sequence {
            /*width: 2vh;
            height: 2vh;*/
            border-radius:50%;
            color: white;
        }
        .time-range {
            /*background-color: white;
            height: 2vh;*/
            color: #724A2B;
        }
    }
    .timeline-event-container {
        font-family: FZQINGKBYSJF;
        position: absolute;
        left: 1vw;
        /*top: 8.3vh;
        width: 70vw;
        height: 16vh;*/
        padding: 0.5rem;
        /* width: 100%; */

        .event-info-card {
            color: #8F7B6C;
            border: 2px solid #8F7B6C;
            border-radius: 5px;
    
            /*height: 15vh;*/
            overflow-y: auto;
    
            clip-path: polygon(0% 0%, 25% 0%, 25% 6%, 80% 6%, 80% 0%, 100% 0%, 100% 100%, 0% 100%);
    
            .info-row {
                margin-bottom: 0.2rem;

                #img-div > img {
                    max-width: 100%;
                    max-height: 100%;
                }

                /*.event-image {
                    /*display: block; /*使图片元素以块级元素进行显示*/
                    /*width: auto; /*设置宽度自适应*/
                   /* height: auto; /*设置高度自适应*/

                /*}*/
            }
    
            .library-name {
                /*display: flex;
                flex-direction: row;*/
                text-align: center;
                align-items: center;
    
                /*font-size:  $rem + 'px';*/
                font-weight: bold;
                width: 100%;
                position: relative;
                color: #724A2B;
            }
            .event-loc{
                display: flex;
                flex-direction: row;
                opacity: 0.7;
                text-align: center;
                align-items: center;
                /*font-size: 0.75 * $rem + 'px';*/
            }
    
            .agent-action {
                display: flex;
                flex-direction: row;
                justify-content: space-between;
    
                .agent {
                    display: flex;
                    flex-direction: row;
                    .agent-name{
                        /*font-size: 0.875 * $rem + 'px';*/
                        color: #724A2B;
                    }
                .action {
                    /*font-size: 0.875 * $rem + 'px';*/
                    color: #724A2B;
                }
                }
            }
            #img-error-icon {
                border: 0.5px solid #a89587;
                display: flex;
                flex-direction: column;
                justify-content:center;
                align-items:center;
            }
        }
    
    }
}

</style>
