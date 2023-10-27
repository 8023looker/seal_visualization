import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import * as Data from "@/data/Data.js";
import installElementPlus from "./plugins/element";
import * as Icons from "@element-plus/icons";

// import "./assets/css/main.scss"

async function run() {
    await Data.load_data();
    const app = createApp(App);
    installElementPlus(app);
    Object.keys(Icons).forEach((key) => {
        app.component(key, Icons[key]);
    });
    app.use(store).use(router).mount("#app");
}

run();
