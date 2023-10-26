<template>
    <div class="container">
        <div class="title-name">
            {{ title[language] }}
        </div>

        <div class="subtitle" v-if="exhibition"><p>中日汉籍流传可视化</p></div>

        <div class="lang-select" v-if="!exhibition">
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
        </div>
    </div>
</template>

<script>
import { mapState } from "vuex";

const d3 = require("d3");
const $ = require("jquery");

export default {
    name: "Title",
    data() {
        return {
            // cur_lang: "zh",
            langs: ["zh", "en"],
            title: {
                zh: "典藏之路",
                en: "LiberRoad",
            },
            lang_dict: {
                zh: "中文",
                en: "English",
            },
        };
    },
    computed: {
        ...mapState(["language", "exhibition"]),
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
.container {
    position: relative;
    display: flex;
    flex-direction: row;
    align-items: center;
    color: #5a3a20;

    .title-name {
        font-size: 2rem;
        font-weight: bold;
        text-align: center;
        padding: 1rem;
    }

    .subtitle {
        color: #6e4d2b;
        font-size: 1.4rem;
        height: 2rem;
        display: flex;
        align-items: flex-end;
        padding-left: 0.8rem;
        border-left: 2px solid #6e4d2b;
    }

    .lang-select {
        display: flex;
        flex-direction: column;
        justify-content: center;
    }

    .el-dropdown-link {
        cursor: pointer;
        margin-left: 5px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.2rem;
        // font-family: "Linux Libertine", "Georgia", "Times", serif;

        .folderIcon {
            font-size: 0.8rem;
            margin-right: 8px;
        }
    }
}
</style>
