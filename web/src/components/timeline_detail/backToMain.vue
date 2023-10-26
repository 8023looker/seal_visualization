<template>
    <div class="container">
        <div class="button"
            @click="$store.commit('changeWholeView', 'default')">
            {{ '返回' }}
        </div>
    </div>
</template>

<script>
import { mapState } from "vuex";

const d3 = require("d3");
const $ = require("jquery");

export default {
    name: "backToMain",
    components: {
    },
    data() {
        return {
           
        };
    },
    computed: {
        ...mapState(["switchWholeView"]),
    },
    methods: {
       
    },
    mounted() {
    
    },
};
</script>

<style scoped lang="scss">
.container {
    position: absolute;
    left: 95%;
    width: 5%;
    height: 100%;
    display: flex;
    align-items: center; // 垂直居中
    justify-content: center; // 水平居中
    .button {
        padding: 0.5rem;
        margin: 0.5rem;
        border: 1px solid black;
        border-radius: 0.5rem;
        cursor: pointer;
        
    }

    .button:hover {
        background-color: #dfdbdb;
        // font-weight: bold;
    }
}
</style>
