<template>
    <router-view />
    <div class="app backgrounded">
        <div class="app-canvas" v-if="render_main"
            :style="{ left: (window_width - render_width) / 2 + 'px', top: (window_height - render_height) / 2 + 'px', width: render_width + 'px', height: render_height + 'px' }">
            <div class="header">
                <Title></Title>
                <SwitchView></SwitchView>
            </div>
            <div class="left-panel">
                <LeftPanel></LeftPanel>
            </div>
            <div class="main-panel">
                <div id="main-view" v-if="render_main">
                    <Overview
                        v-show="
                            cur_view === 'overview' || overlay_view === 'overview'
                        "
                        :canvas_width="canvas_width"
                        :canvas_height="canvas_height"
                    ></Overview>
                    <Timeline
                        v-show="
                            cur_view === 'timeline'
                        "
                        :canvas_width="canvas_width"
                        :canvas_height="canvas_height"
                    ></Timeline>
                    <LayoutView
                        v-show="
                            cur_view === 'layout' || overlay_view === 'layout'
                        "
                        :canvas_width="canvas_width"
                        :canvas_height="canvas_height"
                    ></LayoutView>
                </div>
            </div>
        </div> 
    </div>
</template>

<script>
const $ = require("jquery");

// import { PageSize } from "@/data/Data.js";

import Title from "./components/Title.vue";
import SwitchView from "./components/SwitchView.vue";
import SwitchLanguage from "./components/SwitchLanguage.vue";
import Timeline from "./components/Timeline.vue";
import Overview from "./components/Overview.vue";
import LayoutView from "./components/LayoutView.vue";
import LeftPanel from "./components/LeftPanel.vue";
// import TimeAxis from "./components/TimeAxis.vue";


import { mapState } from "vuex";

const baseSize = 16;

const margin = {
    left: 0.05,
    right: 0.05,
    top: 0.05,
    bottom: 0.05,
};

export default {
    name: "App",
    data() {
        return {
            render_main: false,
            renderComponent: true,
            canvas_width: null,
            canvas_height: null,

            window_width: null, // 当前窗口实际大小
            window_height: null,

            render_width: null, // 需要渲染的窗口大小
            render_height: null,
        };
    },
    components: {
        SwitchView,
        Title,
        SwitchLanguage,
        Timeline,
        Overview,
        LayoutView,
        LeftPanel,
        // TimeAxis,
    },
    computed: {
        ...mapState(["cur_view", "overlay_view"]),

    },
    watch: {

    },
    methods: {
        setRem() {
            // let width = window.innerWidth;
            // let height = window.innerHeight;
            let width = this.render_width
            let height = this.render_height
            const scale = Math.max(width, height) / 1280;
            let rem = baseSize * Math.min(scale, 2);
            rem = Math.min(rem, 16);
            this.$store.commit("changeRem", rem);
            document.documentElement.style.fontSize = rem + "px";
        },
        setCanvas() { // 确定画布的大小
            let width = window.innerWidth;
            let height = window.innerHeight;

            this.window_width = window.innerWidth;
            this.window_height = window.innerHeight;
            // 将画布默认为16:9
            if (width / height > 16 / 9) { // 以height为基准
                width = height * 16 / 9
            } else { // 以width为基准
                height = width * 9 / 16
            }
            // 整个画布的渲染大小
            this.render_width = width;
            this.render_height = height;
            // main_panel的窗口大小
            this.canvas_width = width * (1 - 10 / 100)
            this.canvas_height = height * (1 - 6.4 / 100)
        },
        initialize() {
            const self = this       
            self.setCanvas();
            self.setRem();
            // 弃用
            // that.canvas_width = $(".main-panel").width();
            // that.canvas_height = $(".main-panel").height();

            setTimeout(() => {
                self.render_main = true;
            }, 500);
        },
    },
    mounted() {
        const that = this
        // console.log('windows width', $(window).width(), $(document).width(), window.innerWidth)
        // console.log('windows height', $(window).height(), $(document).height(), window.innerHeight)
        this.initialize();
        window.addEventListener("resize", function() {
            // 在窗口大小调整时执行的操作
            that.renderComponent = false;
            that.render_main = false;
            that.initialize();
            setTimeout(() => {
                that.renderComponent = true;
            }, 500);
            // console.log("窗口大小已调整", that.render_width, that.window_width);
        });
        // window.onresize = () => {
        //     this.renderComponent = false;
        //     this.initialize();
        //     setTimeout(() => {
        //         this.renderComponent = true;
        //     }, 500);
        // };
    },
};
</script>

<style>
::-webkit-scrollbar {
    /* width : 3px; */
    width: 0;
    height: 1px;
}

*::-webkit-scrollbar {
    fill: #b19c9b;
    color: #b19c9b;
    /* width: 0.25em; */
}

*::-webkit-scrollbar-track {
    -webkit-box-shadow: inset 0 0 0.6vh rgba(0, 0, 0, 0.3);
    border-radius: 2px;
}

*::-webkit-scrollbar-thumb {
    background-color: #b19c9b;
    /* outline: 0.1vh solid #B19C9B; */
    border-radius: 2px;
}

html,
body {
    height: 100%;
    width: 100%;
}

* {
    margin: 0;
    overflow: hidden;
    user-select: none;
}

#app {
    font-family: Baskerville, FZQINGKBYSJF, Avenir, Helvetica, Arial, sans-serif;
    /* font-family: Georgia, FZQINGKBYSJF, Avenir, Helvetica, Arial, sans-serif; */
    /* font-family: STZhongsong, Arial; */
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
    height: 100%;
    width: 100%;
}
@font-face {
    font-family: "FZQINGKBYSJF";
    src: url("./assets/fonts/FZQINGKBYSJF.TTF") format("truetype");
}

@font-face {
    font-family: "SONGTI";
    src: url("./assets/fonts/FZQINGKBYSJF.TTF");
}

.backgrounded {
    background-image: url("./assets/background.png");
    background-attachment: fixed;
}
</style>

<style scoped lang="scss">
.app {
    height: 100vh;
    width: 100vw;
    .app-canvas {
        position: absolute;

        $title-height: 6.4%;
        $left-panel-width: 12%; // 10%
        // $bottom-panel-height: 10%;

        $switch-lang-width: $left-panel-width;

        .header {
            position: absolute;
            height: $title-height;
            width: 100%;
            // background-color: rgba(240, 248, 255, 0.085);
            display: flex;
            flex-direction: row;
            justify-content: space-between;
        }

        .left-panel {
            position: absolute;
            width: $left-panel-width;
            // height: 100vh - $title-height - $bottom-panel-height;
            height: 100% - $title-height - 2%;
            top: $title-height;
            // font-family: FZQINGKBYSJF;
            // background-color: rgba(13, 79, 137, 0.05);
        }

        .main-panel {
            position: absolute;
            // height: 100% - $title-height - $bottom-panel-height;
            height: 100% - $title-height;
            width: calc(100% - $left-panel-width); // calc(100% - $left-panel-width)
            left: $left-panel-width; // $left-panel-width
            top: $title-height;
            // background-color: rgba(240, 255, 255, 0.282);

            #main-view {
                & > div {
                    position: absolute;
                }
                position: relative;
                height: 100%;
                width: 100%;
                // background-color: rgba(240, 255, 255, 1);
                // font-family: FZQINGKBYSJF;
            }
        }
    }
}
</style>
