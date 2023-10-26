<template>
    <div class="card2bookImage-link" id="card2bookImage-link">
        <svg id="card2bookImage-svg"></svg>
    </div>
    <div class="book-image-container" id="bookImage-scroll-container">
        <div class="single-image-container" v-for="(item, index) in bookImgList" :key="index"
            :style="{left: item.x_position + 'px', width: rem * 20 + 'px'}"
        >
            <img :src="item.img_href" :ref="'bookImage-' + item.image_name"
                :id="'bookImage-' + item.image_name.slice(0, -5)"        
                style="{max-width: 100%; max-height: 100%; margin: 0.1em; cursor: 'pointer'}">
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
import * as DataProcess from "@/data/timeline/timeline_full/data_process"
import * as RenderAxis from "@/data/timeline/timeline_full/render_axis"
import * as TypeColor from "@/theme/type_color"
import * as TimeLineUpdate from "@/data/timeline/timeline_update";
import { jsonCopy } from "@/utils/copy";

import { get_book_image_pos } from "@/data/BookTraj";

const time_duration = 1000
export default {
    name: "TimelineBookImage",
    data() {
        return {
            bookImagePosDict: {},
            bookImgList: []
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
            handler: async function(newVal, oldVal) {
                const self = this;
                if (newVal !== null) {
                    console.log('newVal[0].來源', newVal[1].來源)
                    const book_string = newVal[1].來源.split('<')[1].split('/')[0];

                    if (DataProcess.bookImgExistList.includes(book_string)) { // 如果存在书影图片再操作
                        document.getElementById('bookImage-scroll-container').style.display = 'block'
                        const img_container_width = document.getElementsByClassName('app')[0].clientWidth * 0.98 * 0.85;            
                        try {
                            // 使用 await 等待异步操作完成
                            const result = await DataProcess.bookImagePosHandle(self.bookImagePosDict[book_string], book_string, self.rem, img_container_width);
                            self.bookImgList = result;
                            console.log('bookImgList', self.bookImgList);

                            // 在图片加载完成后获取图片的渲染尺寸
                            self.$nextTick(() => {
                                for (let i = 0; i < self.bookImgList.length; i++) {
                                    const imgElement = self.$refs['bookImage-' + self.bookImgList[i].image_name];
                                    const renderedWidth = imgElement.clientWidth; // 图片的渲染宽度
                                    const renderedHeight = imgElement.clientHeight; // 图片的渲染高度
                                    console.log(`渲染宽度：${renderedWidth}px，渲染高度：${renderedHeight}px`);
                                    self.bookImgList[i]['renderWidth'] = renderedWidth
                                    self.bookImgList[i]['renderHeight'] = renderedHeight
                                }

                                // 绘制event card至book image的link
                                setTimeout(() => {
                                    RenderAxis.eventCard2bookImageLink(self.timelineBook, self.events, self.bookImagePosDict, self.bookImgList, self.rem)
                                }, time_duration / 50)
                            });
                        } catch (error) {
                            console.error('发生错误：', error);
                        }
                    } else {
                        console.log('该本书没有书影图片哟')
                        RenderAxis.delImageDivLayer()
                    }
                    
                }
            },
            deep: true
        }


    },
    methods: {
        async initializeBookImage() { // 冗余
            const self = this
            if (self.events !== null) {
                const book_string = self.events[1].來源.split('<')[1].split('/')[0];

                if (DataProcess.bookImgExistList.includes(book_string)) { // 如果存在书影图片再操作
                    document.getElementById('bookImage-scroll-container').style.display = 'block'
                    const img_container_width = document.getElementsByClassName('app')[0].clientWidth * 0.98 * 0.85;            
                    try {
                        // 使用 await 等待异步操作完成
                        const result = await DataProcess.bookImagePosHandle(self.bookImagePosDict[book_string], book_string, self.rem, img_container_width);
                        self.bookImgList = result;
                        console.log('bookImgList', self.bookImgList);

                        // 在图片加载完成后获取图片的渲染尺寸
                        self.$nextTick(() => {
                            for (let i = 0; i < self.bookImgList.length; i++) {
                                const imgElement = self.$refs['bookImage-' + self.bookImgList[i].image_name];
                                const renderedWidth = imgElement.clientWidth; // 图片的渲染宽度
                                const renderedHeight = imgElement.clientHeight; // 图片的渲染高度
                                console.log(`渲染宽度：${renderedWidth}px，渲染高度：${renderedHeight}px`);
                                self.bookImgList[i]['renderWidth'] = renderedWidth
                                self.bookImgList[i]['renderHeight'] = renderedHeight
                            }

                            // 绘制event card至book image的link
                            setTimeout(() => {
                                RenderAxis.eventCard2bookImageLink(self.timelineBook, self.events, self.bookImagePosDict, self.bookImgList, self.rem)
                            }, time_duration / 50)
                        });
                    } catch (error) {
                        console.error('发生错误：', error);
                    }
                } else {
                    console.log('该本书没有书影图片哟')
                    RenderAxis.delImageDivLayer()
                }
            }   
        }

    },
    mounted() {
        const self = this
        self.bookImagePosDict = get_book_image_pos()
        console.log('bookImagePosition', self.bookImagePosDict)
        self.initializeBookImage()
    },
};
</script>

<!-- 需要将vw转换为px -->
<style scoped lang="scss">
$bottom-panel-height: 20vh;
$infocard-panel-height: 60vh;
.card2bookImage-link{
    z-index: 1;
    position: absolute;
    left: 0%;
    width: 100%;
    bottom: 0%;
    height: $bottom-panel-height * 2 - 2vh;
    // background-color: rgba(176, 196, 222, 0.212);
    #card2bookImage-svg {
        width: 100%;
        height: 100%;
    }
}
.book-image-container {
    position: absolute;
    left: 1%;
    top: 50%;
    width: 98%;
    height: 49%;
    // background-color: rgba(176, 196, 222, 0.212);

    overflow-x: auto;
    transition: scroll-left 0.5s ease; /* 添加滚动过渡效果 */
    &::-webkit-scrollbar {
        display: none;  // 隐藏滚动条
    }
    .single-image-container {
        position: absolute;
        top: 0%;
        height: 99%;
        background-color: rgba(176, 196, 222, 0.212);
    }
}
</style>
