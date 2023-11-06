<template>
    <div class="overview-container">
       <div class="full-image-container" id="full-image-container">
            <div v-show="imageParam.visible" class="image-scroll-container">
                <img :src="imageSrc.small" alt="Long Image" class="long-image" id="preview-image"
                    :style="{ height: '100%' }"> <!--transform: `scale(${imageParam.zoom}) translateX(${0}px)`-->
                <svg v-show="imageParam.visible" class="seal-checkbox-svg"></svg>

                <OverviewCard v-for="(item, index) in detailSealInfo"
                    :seal_detail="JSON.parse(JSON.stringify(item))"
                    :resize_scale="resize_scale"
                    :cardList="cardList"
                ></OverviewCard>
            </div>
       </div>
       <div class="thumbnail-container">
            <Thumbnail
                :original_painting="original_painting"
            ></Thumbnail> <!--需要computed-->
       </div>
    </div>
</template>

<script>
import { mapState } from "vuex";

const d3 = require("d3");
const $ = require("jquery");

const time_duration = 1000,
      timeout_duration = 100

import OverviewCard from "./overview_widgets/OverviewCard.vue"
import Thumbnail from "./overview_widgets/Thumbnail.vue"

import * as Data from "@/data/Data.js";
import * as TypeColor from "@/theme/type_color";
import { jsonCopy } from "@/utils/copy";
import * as DataProcess from "@/utils/data_process"
import * as OverviewFunction from "@/utils/overview/overview_function"
import * as SealCardFunc from "@/utils/timeline/seal_card_func";

export default {
    name: "Overview",
    components: {
        OverviewCard,
        Thumbnail
    },
    data() {
        return {
            data: null,
            cardList: [],
            painting_name_en: '', 
            imageSrc: {
                origin: null,
                small: null
            },
            imageParam: {
                visible: false,
                offsetX: 0,
                dragging: false,
                zoom: 1,
            },
            resize_scale: 1, // 原始图片的缩放倍数
            original_painting: { // 原始图片的加载参数，用于向子组件Thumbnail传参
                complete: false
            },
            fullImageContainerX: 0, // 当前full-image-container的x坐标值, 用于更新thumbnail_rect
        };
    },
    props: ["canvas_width", "canvas_height"],
    computed: {
        ...mapState(["language", "cur_view", "painting_name", "selection"]),
        detailSealInfo: {
            get() {
                const self = this
                const tar = self.selection.entity !== null && self.selection.value
                if (!tar) return []
                let seal_pic_list = []
                // 或许可以考虑添加一些click position的信息
                seal_pic_list = jsonCopy(self.cardList.filter((d) => tar.includes(d['index'])))
                console.log(seal_pic_list, self.selection.value)
                return seal_pic_list
            },
        },
    },
    watch: {
        cur_view: function(newValue, oldValue) {
            const self = this
            if (newValue === 'overview' && newValue !== oldValue) {
                console.log('从其他视图切换到overview视图啦')

                setTimeout(() => { // 需要设置延迟，否则$('.image-scroll-container').width()依然为0
                    self.renderUnselectedLayer() // 在切换到当前视图时需要重新刷新一遍(因为jQuery: $('.image-scroll-container'))
                    self.renderSealRect(self.cardList, self.resize_scale) // 框选印章
                }, timeout_duration)
            }
        },
        imageParam: {
            handler: function(newVal, oldVal) {
                const self = this
                // console.log('ImageParam Updated', newVal)
                console.log(newVal.visible)
                if (newVal.visible) {
                    // OverviewFunction.detectFullImageScroll() // 当图片加载成功时，detect scroll offset
                }
            },
            deep: true
        },
        selection: {
            handler: function(newVal, oldVal) {
                const self = this

            },
            deep: true
        },
        original_painting: { // 实时监听original_painting的变化
            handler: function(newVal, oldVal) {
               
            },
            deep: true
        },
        fullImageContainerX: function(newVal, oldVal) {
            if (newVal !== oldVal)  {
                OverviewFunction.setFullImageContainerX(newVal)
                OverviewFunction.fullImageDragThumbnail()
            }
        },
    },
    methods: {
        initialize() { // 在切换到当前视图时需要重新刷新一遍
            const self = this
            
        },
        getSubSet() { // 使用部分样本进行demo展示
            const self = this
            self.data = {
                "painting_name": self.data['painting_name'],
                "meta_data": self.data['meta_data'],
                "collectors": self.data['collectors'].slice(0, 1)
            }
        },
        detectFullImageScroll() { // 对于上面的高清大图'full-image-container
            const self = this
            // console.log("detectImageScroll")
            let eventDiv = document.getElementById('full-image-container') // 信息卡片container
            eventDiv.addEventListener('scroll', function() { // 实时监听scroll
            //    console.log('image-container移动啦, thumbnail也要跟着移动啦', eventDiv.scrollLeft)
               self.fullImageContainerX = eventDiv.scrollLeft
            })
        },
        getPaintingParams() {
            const self = this
            self.imageSrc['origin'] = 'data/' + self.painting_name_en + '.jpg' // image href(local)
            // self.imageSrc['origin'] = 'https://vis.pku.edu.cn/seal_visualization/assets/painting_images/que_hua_qiu_se_tu_juan/' + self.painting_name_en + '.jpg'

            let img_preview = new Image() // 小图片
            img_preview.src = self.imageSrc['small']
            let img = new Image() // 高清大图
            img.src = self.imageSrc['origin']

            if (img_preview.complete) {
                const pic_width = img_preview.width,
                      pic_height = img_preview.height
                // 目前仅针对long picture
                self.resize_scale = $('.main-panel').height() * 0.88 / pic_height // height of "full-image-container" equals to "main-panel" * 0.88
                console.log('resize_scale', self.resize_scale)

                self.imageParam['offsetX'] = -(self.resize_scale * pic_width / 2 - $('.main-panel').width() / 2)     
                self.imageParam['visible'] = true // v-if="imageParam.visible"

                // setTimeout(() => {
                //     self.renderUnselectedLayer()
                //     self.renderSealRect(self.cardList, self.resize_scale) // 框选印章
                // }, timeout_duration)
            } else {
                img_preview.onload = function() {
                    const pic_width = img_preview.width,
                          pic_height = img_preview.height
                    // 目前仅针对long picture
                    self.resize_scale = $('.main-panel').height() * 0.88 / pic_height // height of "full-image-container" equals to "main-panel" * 0.88
                    console.log('resize_scale', self.resize_scale)

                    self.imageParam['offsetX'] = -(self.resize_scale * pic_width / 2 - $('.main-panel').width() / 2)    
                    self.imageParam['visible'] = true // image-scroll-container

                    // setTimeout(() => {
                    //     self.renderUnselectedLayer()
                    //     self.renderSealRect(self.cardList, self.resize_scale) // 框选印章
                    // }, timeout_duration)
                }
            }

            if (img.complete) {
                const pic_width = img.width,
                      pic_height = img.height
                
                // 向store index.js中传值
                self.$store.commit("changePaintingPic", {
                                    loaded: true,
                                    width: pic_width,
                                    height: pic_height
                                })

                // 目前仅针对long picture
                self.resize_scale = $('.main-panel').height() * 0.88 / pic_height // height of "full-image-container" equals to "main-panel" * 0.88
                console.log('resize_scale', self.resize_scale)

                self.imageParam['offsetX'] = -(self.resize_scale * pic_width / 2 - $('.main-panel').width() / 2)
                
                // 对于大图片加载慢的处理方法
                // 1. 当高分辨率图片加载完成后，替换预览图像的src属性
                const previewImage = document.getElementById('preview-image')
                previewImage.src = self.imageSrc['origin']

                // 2. 当加载完成后再显示(这里在加载完成小图片的时候就已经visible = true了)
                // self.imageParam['visible'] = true // v-if="imageParam.visible"

                self.original_painting = img // 用于向子组件Thumbnail.vue的original_painting传参

                setTimeout(() => {
                    self.renderUnselectedLayer()
                    self.renderSealRect(self.cardList, self.resize_scale) // 框选印章
                    
                }, timeout_duration)
            } else {
                img.onload = function() {
                    const pic_width = img.width,
                          pic_height = img.height

                    // 向store index.js中传值
                    self.$store.commit("changePaintingPic", {
                                        loaded: true,
                                        width: pic_width,
                                        height: pic_height
                                    })

                    // 目前仅针对long picture
                    self.resize_scale = $('.main-panel').height() * 0.88 / pic_height // height of "full-image-container" equals to "main-panel" * 0.88
                    console.log('resize_scale', self.resize_scale)

                    self.imageParam['offsetX'] = -(self.resize_scale * pic_width / 2 - $('.main-panel').width() / 2)

                    // 对于大图片加载慢的处理方法
                    // 1. 当高分辨率图片加载完成后，替换预览图像的src属性
                    const previewImage = document.getElementById('preview-image')
                    previewImage.src = self.imageSrc['origin']
                    // 2. 当加载完成后再显示(这里在加载完成小图片的时候就已经visible = true了)
                    // self.imageParam['visible'] = true // image-scroll-container

                    self.original_painting = img // 用于向子组件Thumbnail.vue的original_painting传参

                    setTimeout(() => {
                        self.renderUnselectedLayer()
                        self.renderSealRect(self.cardList, self.resize_scale) // 框选印章
                    }, timeout_duration)
                }
            }
        },
        // 只能写在vue组件中，因为需要向store的index.js中传值
        renderSealRect(seal_mapped_list, resize_scale) { // 框选印章
            const self = this
            let svg = d3.select('.seal-checkbox-svg') // select the svg item
            svg.selectAll('.seal_rect_group').remove()
            let group = svg.append('g').attr('class', 'seal_rect_group')
            let seal_rect_group = group.selectAll('g')
                                        .data(seal_mapped_list)
                                        .join('g')
                                        .attr('id', (d) => `${d['seal_name']}-${d['index']}-rect`)
            
            seal_rect_group.append('rect')
                            .attr('x', (d) => d['x'] * resize_scale - d['width'] * resize_scale / 25)
                            .attr('y', (d) => d['y'] * resize_scale - d['height'] * resize_scale / 25)
                            .attr('height', (d) => d['height'] * resize_scale)
                            .attr('width', (d) => d['width'] * resize_scale)
                            .attr('fill', 'white')
                            .attr('fill-opacity', 0)
                            .attr('stroke', 'red')
                            .on('click', (event) => {
                                // console.log('当前click印章图片', event.srcElement.__data__.seal_name, event.srcElement.__data__.index)
                                let selected_seal_pic_list = self.selection['value']
                                if (!selected_seal_pic_list.includes(event.srcElement.__data__.index)) {
                                    selected_seal_pic_list = [...new Set(selected_seal_pic_list)] // 去重
                                    selected_seal_pic_list.push(event.srcElement.__data__.index)
                                    self.$store.commit("changeSelection", {
                                        entity: "seal_pic",
                                        value: selected_seal_pic_list
                                    })
                                } else {
                                    // 没有操作
                                }
                            })

        },
        renderUnselectedLayer() {
            const self = this
            let svg = d3.select('.seal-checkbox-svg') // select the svg item
            svg.selectAll('.unselected_layer').remove()
            let unselected_layer = svg.append('g').attr('class', 'unselected_layer')
            unselected_layer.append('rect')
                            .attr('x', 0)
                            .attr('width', $('.image-scroll-container').width())
                            .attr('height', $('.image-scroll-container').height())
                            .attr("fill-opacity", 0)
                            .on('click', (event) => {
                                console.log('Click unselected layer!')
                                self.$store.commit("changeSelection", {
                                    entity: null,
                                    value: []
                                })
                            })
        },
    },
    mounted() {
        const that = this
        console.log('进入到overview啦')

        // 初始化painting_name_en
        that.painting_name_en = DataProcess.getPaintingNameEn(that.painting_name)

        // that.imageSrc['small'] = 'data/' + that.painting_name_en + '_small.jpg' // local
        that.imageSrc['small'] = 'https://vis.pku.edu.cn/seal_visualization/assets/painting_images/que_hua_qiu_se_tu_juan/' + that.painting_name_en + '_small.jpg' // online
        
        that.getPaintingParams()
        let whole_data = Data.read_data() // 首先读入总体的
        for (let i in whole_data) {
            if (whole_data[i]['painting_name'] === that.painting_name) {
                that.data = whole_data[i]
            }
        }
        // that.getSubSet() // 用于测试的demo
        that.data = DataProcess.getCollectorColor(that.data)
        that.cardList = SealCardFunc.SealCardMapping(that.data) // mapped seal pictures into list
        // console.log("seal_data", that.data)

        that.detectFullImageScroll()
        that.initialize();
    },
};
</script>

<style scoped lang="scss">
.overview-container {
    position: absolute;
    width: 100%;
    height: 100%;
    left: 0%;
    top: 0%;

    $full-image-panel-height: 88%;
    $thumbnail-panel-height: 10%;
    .full-image-container {
        position: absolute;
        left: 0.5%;
        width: 99%;
        top: 0%;
        height: $full-image-panel-height;

        background-color: rgba(91, 203, 23, 0.15);
        overflow-x: auto;
        .image-scroll-container {
            position: absolute;
            top: 0%;
            height: 100%;
            // .long-image {
            //     position: absolute;
            //     top: 0%;
            // }
            .seal-checkbox-svg {
                position: absolute;
                top: 0%;
                left: 0%;
                width: 100%;
                height: 100%;
            }
        }
        
    }
    .thumbnail-container {
        position: absolute;
        left: 0.5%;
        width: 99%;
        top: $full-image-panel-height + 1%;
        height: $thumbnail-panel-height;
        background-color: rgba(247, 171, 0, 0.15);

        display: flex;
        align-items: center;
        justify-content: center;

        overflow-x: auto;
    }
}


</style>
