<template>
    <div class="container">
        <div class="buttons">
            <div
                v-for="(view_name, idx) in views"
                :key="'view-buttion-' + idx"
                :class="view_name === cur_view ? 'button selected' : 'button'"
                @click="view_name === 'timeline' || cur_view === 'timeline' ? $store.commit('changeCurViewForce', view_name) : $store.commit('changeCurView', view_name)"
            > <!--changeCurViewForce-->
                {{ view_names[view_name][language] }}
            </div>
        </div>
    </div>
</template>

<script>
import { mapState } from "vuex";

const d3 = require("d3");
const $ = require("jquery");

export default {
    name: "SwitchView",
    components: {
    },
    data() {
        return {
            views: ["overview", "layout", "timeline"],
            view_names: {
                overview: {
                    zh: "总览",
                    en: "Overview",
                },
                layout: {
                    zh: "抽象布局",
                    en: "Abstract Layout",
                },
                timeline: {
                    zh: "时间线",
                    en: "Timeline",
                },
            },
            checkbox_name: {
                zh: "展示流出事件",
                en: "Show Outflow Events",
            },
            showoutflow: true,
        };
    },
    computed: {
        ...mapState(["language", "cur_view"]),
        view_name_list() {
            return this.views.map((d) => this.view_names[d][this.language]);
        },
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
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: center;
    .buttons {
        display: flex;
        flex-direction: row;
        height: 3.5rem;
        align-items: center;

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

        // .button.selected {
        //     background-color: #fefefe;
        //     // font-weight: bold;
        // }
    }
}
</style>
