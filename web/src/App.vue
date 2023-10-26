<template>
    <!-- <LabelTestVue></LabelTestVue> -->
    <!-- <TestMoveIntersectionVue></TestMoveIntersectionVue> -->
    <!-- <TestSimpleOffsetLabelManager></TestSimpleOffsetLabelManager> -->
    <div class="app backgrounded">
        <div class="timeline-full-view" v-show="switchWholeView === 'timeline_full'">
            <TimelineFull></TimelineFull>
        </div>
        <div class="default-view" v-show="switchWholeView === 'default'">
            <div class="main-panel">
                <div id="main-view" v-if="render_main">
                    <Timeline
                        v-show="
                            cur_view === 'timeline' ||
                            overlay_view === 'timeline'
                        "
                        :canvas_width="canvas_width"
                        :canvas_height="canvas_height"
                    ></Timeline>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
const $ = require("jquery");

import { PageSize } from "@/data/Data.js";

import Title from "./components/Title.vue";
import Timeline from "./components/Timeline.vue";
import TimelineFull from "./components/TimelineFull.vue";
import BookList from "./components/BookList.vue";
import Legend from "./components/Legend.vue";

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
        };
    },
    components: {
        Timeline,
        BookList,
        Title,
        Legend,
        TimelineFull,
    },
    computed: {
        ...mapState([
            "cur_view",
            "overlay_view",
            "switchWholeView",
            "showReadme",
        ]),
    },
    watch: {

    },
    methods: {
        setRem() {
            let width = window.innerWidth;
            let height = window.innerHeight;
            const scale = Math.max(width, height) / 1280;
            let rem = baseSize * Math.min(scale, 2);
            rem = Math.min(rem, 20);
            this.$store.commit("changeRem", rem);
            document.documentElement.style.fontSize = rem + "px";
        },
        initialize() {
            this.setRem();

            this.canvas_width = $(".main-panel").width();
            this.canvas_height = $(".main-panel").height();

            setTimeout(() => {
                this.render_main = true;
            }, 500);
        },
    },
    mounted() {
        this.initialize();
        window.onresize = () => {
            this.renderComponent = false;
            this.initialize();
            setTimeout(() => {
                this.renderComponent = true;
            }, 500);
        };
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
    src: url("./assets/fonts/FZSSJW.TTF");
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

    $title-height: 6.4vh;
    $left-panel-width: 30vh;
    $bottom-panel-height: 10vh;

    $switch-lang-width: $left-panel-width;

    .main-panel {
        position: absolute;
        height: 100vh - $title-height - $bottom-panel-height;
        width: calc(100vw - $left-panel-width);
        left: $left-panel-width;
        top: $title-height;
        // background-color: rgba(240, 255, 255, 0.282);

        #main-view {
            & > div {
                position: absolute;
            }
            position: relative;
            height: 100%;
            width: 100%;
            // font-family: FZQINGKBYSJF;
        }
    }
}
</style>
