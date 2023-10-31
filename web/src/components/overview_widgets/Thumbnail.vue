<template>
  
</template>

<script>
import { mapState } from "vuex";
import * as SealCardFunc from "@/utils/timeline/seal_card_func";

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
            containerParam: { // 当前绘制窗口的宽度
                x: 0,
                width: 0,
                card_width: 0, // includes the gap between seal cards
                card_height: 0, // card height
                unit_pixel: 0, // 单位大小
                sealIconSize: 1// seal icon的大小
            },
            sealContainerShow: false
        };
    },
    props: ["resize_scale"],
    computed: {
        ...mapState(["language", "cur_view", "painting_name", "rem", "selection"]),
        
    },
    watch: {

        resize_scale: function(newVal, oldVal) {

        }
    },
    methods: {
        initialize() {
        },
        renderSealCard() {
            const self = this
            // console.log(self.seal_detail, self.resize_scale)
            setTimeout(() => {
                self.containerParam = SealCardFunc.getSealCardContainerSize() // {x: , width: }

                self.containerParam['card_width'] = self.containerParam['width'] / seal_card_num
                self.containerParam['card_height'] = self.containerParam['card_width'] * 0.9 * 175 / 120
                self.containerParam['unit_pixel'] = self.containerParam['card_height'] / 175

                // console.log('self.containerParam', self.containerParam)

                self.sealContainerShow = true

            }, timeout_duration)
        },
    },
    mounted() {
        const that = this
        that.initialize()

    },
};
</script>

<style scoped lang="scss">


</style>
