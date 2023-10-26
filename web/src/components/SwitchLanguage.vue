<template>
    <div class="container">
        <div class="langs">
            <div class="lang" v-for="(lang, idx) in langs">{{ lang }}</div>
        </div>
    </div>
</template>

<script>
import { mapState } from "vuex";

export default {
    name: "SwitchLanguage",
    data() {
        return {
            langs: ["zh", "en", "jp"],
        };
    },
    computed: {
        ...mapState(["language"]),
    },
    methods: {
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
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
}
</style>
