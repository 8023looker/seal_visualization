<template>
    <div class="timeline-title">
        <div class="title-name">
            {{ title[language] }}
        </div>

        <!-- <div class="lang-select">
            <el-dropdown
                trigger="click"
                popper-class="articleDropdownPopper"
                @command="handleSelectChange($event)"
            >
                <span class="el-dropdown-link">
                    {{ lang_dict[language] }}
                    <el-icon class="el-icon--right"><arrow-down /></el-icon>
                </span>
                <template #dropdown>
                    <el-dropdown-menu class="articleDropdownMenu">
                        <el-dropdown-item
                            v-for="item in langs"
                            :key="item"
                            :command="item"
                            class="dropdownItem"
                            >{{ lang_dict[item] }}</el-dropdown-item
                        >
                    </el-dropdown-menu>
                </template>
            </el-dropdown>
        </div> -->
    </div>
</template>

<script>
import { mapState } from "vuex";

const d3 = require("d3");
const $ = require("jquery");

export default {
    name: "timelineTitle",
    data() {
        return {
            // cur_lang: "zh",
            langs: ["zh", "en"],
            title: {
                zh: "汉籍流传时间推测",
                en: "Timeline of LiberRoad",
            },
            lang_dict: {
                zh: "中文",
                en: "English",
            },
        };
    },
    computed: {
        ...mapState(["language"]),
    },
    methods: {
        handleSelectChange(e) {
            console.log(e);
            this.cur_lang = e;
            this.$store.commit("changeLanguage", e);
        },
        initialize() {},
    },
    mounted() {
        this.initialize();
    },
};
</script>

<style scoped lang="scss">
.timeline-title {
    position: absolute;
    left: 0%;
    width: 15%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;

    .title-name {
        font-size: 1.8rem;
        font-weight: bold;
        text-align: center;
        padding: 1rem;
    }
}
</style>
