<template>
    <img :src="imageSrc.small" alt="Thumbnail Image" class="thumbnail-image" id="thumbnail-image"
        :style="{ maxHeight: '100%', maxWidth: '100%' }">
    <svg v-show="original_painting.complete" class="thumbnail-rect-svg" id="thumbnail-rect-svg"></svg>
</template>

<script>
import { mapState } from "vuex";
import * as SealCardFunc from "@/utils/timeline/seal_card_func";

import * as DataProcess from "@/utils/data_process"
import * as OverviewFunction from "@/utils/overview/overview_function"

const d3 = require("d3");
const $ = require("jquery");

const margin = {
    top: 0.01,
    left: 0.01,
    right: 0.01,
    bottom: 0.01,
}
const time_duration = 1000,
      timeout_duration = 100,
      seal_card_num = 12


export default {
    name: "Thumbnail",
    components: {
    },
    data() {
        return {
            imageSrc: {
                origin: null,
                small: null
            },
            painting_name_en: '',
            thumbnail_resize_scale: 1,
            thumbnail_rect_x: 0, // 当前thumbnail_rect的x坐标值, 用于更新full-image-container
        }
    },
    props: ["original_painting"],
    computed: {
        ...mapState(["language", "cur_view", "painting_name", "rem", "selection"]),
        
    },
    watch: {
        cur_view: function(newVal, oldVal) {
            const self = this
            if (newVal === 'overview' && newVal !== oldVal) {
                 // 在切换到当前视图时需要重新刷新一遍(因为jQuery: $('.image-scroll-container'))
            }
        },
        resize_scale: function(newVal, oldVal) {

        },
        original_painting: function(newVal, oldVal) {
            const self = this
            if (newVal.complete) {
                self.getThumbnailParams(newVal)
                self.renderThumbnailRect(0, 0, 1)
            }
        },
        thumbnail_rect_x: function(newVal, oldVal) {
            if (newVal !== oldVal)  {
                OverviewFunction.setThumbnailRectX(newVal)
                OverviewFunction.thumbnailDragFullImage()
            }
        },
    },
    methods: {
        initialize() {
        },
        getThumbnailParams(original_img) { // 在original_img.complete的情况下执行该操作
            const self = this
            self.imageSrc['origin'] = 'data/' + self.painting_name_en + '.jpg' // image href(local)
            self.thumbnail_resize_scale = $('.main-panel').height() * 0.1 / original_img.height // $('.thumbnail-container') = $('main-panel') * 0.1
            
            self.imageSrc['origin'] = original_img.src
            // 1. 当高分辨率图片加载完成后，替换预览图像的src属性
            const previewImage = document.getElementById('thumbnail-image')
                  previewImage.src = self.imageSrc['origin']
        },
        renderThumbnailRect(default_x_offset, default_y_offset, default_zoom = 1) { // 对于下面的缩略图'thumbnail-container'
            const self = this
            let width = $('.thumbnail-rect-svg').width(),
                height = $('.thumbnail-rect-svg').height(),
                rect_aspect_ratio = $('.full-image-container').width() / $('.full-image-container').height()
            d3.select('.thumbnail-rect-svg').selectAll('g').remove()
            let thumbnail_rect_group = d3.select('.thumbnail-rect-svg')
                                            .append('g')
            const rect = thumbnail_rect_group.append('rect')
                                                .attr('x', default_x_offset)
                                                .attr('y', default_y_offset)
                                                .attr('width', height * rect_aspect_ratio / default_zoom)
                                                .attr('height', height / default_zoom)
                                                .attr('fill', 'white')
                                                .attr('fill-opacity', 0)
                                                .attr('stroke', 'red')
                                                .attr('id', 'thumbnail_rect')
            
            // 创建一个拖动处理器
            let cur_event2rect_offset // 当前鼠标相对于rect的偏移距离
            const drag = d3.drag()
                            .on("start", (event) => {
                                // 拖动开始时的处理
                                rect.style("cursor", "grabbing")
                                cur_event2rect_offset = event.x - Number(rect.attr('x')) // 当前鼠标相对于rect本身的偏移值
                            })
                            .on("drag", (event) => {
                                // 拖动过程中的处理
                                const newX = event.x
                            
                                // console.log(event.x, rect.attr('x'), newX - cur_event2rect_offset)
                                if (newX - cur_event2rect_offset < 0) { // 小于左边界
                                    // console.log('小于左边界')
                                    rect.attr("x", 0)
                                } else if (newX - cur_event2rect_offset + height * rect_aspect_ratio / default_zoom > width) { // 大于右边界
                                    // console.log("大于右边界")
                                    rect.attr("x", width - height * rect_aspect_ratio / default_zoom)
                                } else { // 正常情况
                                    // console.log("normal")
                                    rect.attr("x", newX - cur_event2rect_offset)
                                }
                                self.thumbnail_rect_x = Number(rect.attr('x'))
                            })
                            .on("end", () => {
                                // 拖动结束时的处理
                                rect.style("cursor", "grab")
                            })
            // 将拖动处理器应用到矩形元素
            drag(rect)
        }
    },
    mounted() {
        const that = this
        console.log('进入到overview啦')

        // 初始化painting_name_en
        that.painting_name_en = DataProcess.getPaintingNameEn(that.painting_name)
        that.imageSrc['small'] = 'data/' + that.painting_name_en + '_small.jpg' // local
        // that.imageSrc['small'] = 'https://vis.pku.edu.cn/seal_visualization/assets/painting_images/que_hua_qiu_se_tu_juan/' + that.painting_name_en + '_small.jpg') // online

        that.initialize()

    },
};
</script>

<style scoped lang="scss">
.thumbnail-rect-svg {
    position: absolute;
    top: 0%;
    left: 0%;
    width: 100%;
    height: 100%;
}

</style>
