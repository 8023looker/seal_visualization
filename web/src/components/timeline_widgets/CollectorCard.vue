<template>
    <div class="collector-card-container">
      
    </div>
</template>

<script>
import { mapState } from "vuex";

const d3 = require("d3");
const $ = require("jquery");

export default {
    name: "CollectorCard",
    components: {
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


</style>
