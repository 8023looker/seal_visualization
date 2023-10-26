import { createStore } from "vuex";
import * as d3 from "d3";

const debug = false;

// const overlay_duration = 500;

export default createStore({
    state: {
        rem: null,
        language: "zh",
        cur_view: "timeline",
        overlay_view: null,
        overlay_duration: 2000,

    },
    mutations: {
        changeRem(state, payload) {
            state.rem = payload;
        },
        changeLanguage(state, payload) {
            state.language = payload;
        },
        changeCurView(state, payload) {
            if (debug) console.log("changeCurView", payload);
            if (state.cur_view === payload) {
                console.log("error: no change in view");
                return;
            } else if (state.transition.state !== null) {
                console.log("error: transition in progress");
                return;
            }
            state.transition = {
                from: state.cur_view,
                to: payload,
                state: "out",
            };
        },
        changeCurViewForce(state, payload) {
            if (debug) console.log("changeCurView", payload);
            state.cur_view = payload;
        },
        // changeFilter(state, payload) {
        //     if (debug) console.log("changeFilter", payload);
        //     let entity = payload.entity;
        //     let value = payload.value;
        //     state.filter[entity] = value;
        // },
        // changeSelection(state, payload) {
        //     if (debug) console.log("changeSelection", payload);
        //     state.selection = payload;
        // },
        // changeHover(state, payload) {
        //     if (debug) console.log("changeHover", payload);
        //     state.hover = payload;
        // },
        transCompleted(state, payload) {
            if (debug) {
                console.log("transCompleted");
                console.log(state.transition);
            }
            let trans = state.transition;
            if (trans.state === null) {
                console.log("error: no transition in progress");
            } else if (trans.state === "out") {
                state.cur_view = trans.to;
                state.overlay_view = trans.from;
                // setTimeout(() => {
                trans.state = "overlay";
                setTimeout(() => {
                    trans.state = "in";
                    state.overlay_view = null;
                    console.log("overlay finished, transition in");
                }, state.overlay_duration);
                if (debug) console.log("transition out finished, overlaying");
                // }, 5000);
                // trans.state = "in";
            } else if (trans.state === "overlay") {
                console.log("error: overlaying");
            } else if (trans.state === "in") {
                trans.state = null;
                if (debug) console.log("transition finished");
            }
        },
    },
    actions: {},
    modules: {},
});
