<template>
    <div class="container">
      
    </div>
</template>

<script>
import { mapState } from "vuex";

const d3 = require("d3");
const $ = require("jquery");

export default {
    name: "Timeline",
    components: {
    },
    data() {
        return {
           
        };
    },
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
