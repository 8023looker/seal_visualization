import { transitionIn } from "./transitionIn.js";
import { transitionOut } from "./transitionOut.js";
import {zoomWithCenter} from "./utils.js";


export function transition_handler(trans) {
    const fr = trans.from;
    const to = trans.to;
    const st = trans.state;
    if (fr === "geomap" && st === "out") {
        this.transitionOut(to);
        setTimeout(() => {
            this.$store.commit("transCompleted", null);
        }, 4000);
    } else if (to === "geomap" && st === "overlay") {
        this.transitionIn();
    } else if (to === "geomap" && st === "in") {
        setTimeout(() => {
            this.$store.commit("transCompleted", null);
        }, this.overlay_duration);
    }
}

export default {
    transition_handler,
    zoomWithCenter,
    transitionIn,
    transitionOut,
}