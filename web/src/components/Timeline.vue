<template>
    <div class="container">
        <div class="seal-card">
            <SealCard
                :canvas_width="canvas_width"
                :canvas_height="canvas_height"    
            ></SealCard>
        </div>
        <div class="time-axis">
            <TimeAxis
                :canvas_width="canvas_width"
                :canvas_height="canvas_height"
            ></TimeAxis>
        </div>
        <div class="collector-card">
            <CollectorCard
                :canvas_width="canvas_width"
                :canvas_height="canvas_height"    
            ></CollectorCard>
        </div>
    </div>
</template>

<script>
import { mapState } from "vuex";

const d3 = require("d3");
const $ = require("jquery");
import TimeAxis from "./timeline_widgets/TimeAxis.vue";
import SealCard from "./timeline_widgets/SealCard.vue";
import CollectorCard from "./timeline_widgets/CollectorCard.vue";

export default {
    name: "Timeline",
    components: {
        TimeAxis,
        SealCard,
        CollectorCard
    },
    data() {
        return {
           
        };
    },
    props: ["canvas_width", "canvas_height"],
    computed: {
        ...mapState(["language", "cur_view"]),
       
    },
    methods: {
        initialize() { },
       
    },
    mounted() {
        this.initialize();
    },
};
</script>

<style scoped lang="scss">
.container {
    position: absolute;
    width: 100%;
    height: 100%;
    left: 0%;
    top: 0%;

    $axis-panel-height: 10%;
    $seal-card-height: 50%;
    $collector-card-height: 35%;
    .seal-card {
        position: absolute;
        height: $seal-card-height;
        left: 0.5%;
        width: 99%;
        top: 0%;
        background-color: rgba(91, 203, 23, 0.15);
    }
    .time-axis {
        position: absolute;
        height: $axis-panel-height;
        left: 0.5%;
        width: 99%;
        top: $seal-card-height + 1.5%;
        z-index: 1;
    }
    .collector-card {
        position: absolute;
        height: $collector-card-height;
        left: 0.5%;
        width: 99%;
        top: $axis-panel-height + $seal-card-height + 3%;
        background-color: rgba(247, 171, 0, 0.15);
    }
}


</style>
