import { createStore } from "vuex";
import * as d3 from "d3";

const debug = false;

// const overlay_duration = 500;

export default createStore({
    state: {
        rem: null,
        imageSource: "offline",
        exhibition: true,
        language: "zh",
        cur_view: "timeline",
        showReadme: false,
        // cur_view: "geomap",
        overlay_view: null,
        overlay_duration: 2000,
        show_source_libs: true,
        filter: {
            book: null,
            agent: null,
            academic_school: null,
            library: null,
            time_range: null,
            china2japan: null,
        },
        selection: {
            entity: null,
            value: null,
        },
        hover: {
            entity: null,
            value: null,
        },
        transition: {
            from: null,
            to: null,
            state: null,
        },
        // 用于切换时间线完整视图
        switchWholeView: "timeline_full", // 默认显示
        timelineBook: '王荊文公詩', // book_name, deafult is null, case: 王荊文公詩, 初學記
        curEventData: [], // 当前书籍的event(更换event sequence与timestampUpdated)
        curReasonData: [], // 当前书籍的reason_data(更换event sequence, time_inferred, time_interval_adjusted)
    },
    mutations: {
        change_show_source_libs(state, payload) {
            state.show_source_libs = payload;
        },
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
        changeFilter(state, payload) {
            if (debug) console.log("changeFilter", payload);
            let entity = payload.entity;
            let value = payload.value;
            state.filter[entity] = value;
        },
        changeSelection(state, payload) {
            if (debug) console.log("changeSelection", payload);
            state.selection = payload;
        },
        changeHover(state, payload) {
            if (debug) console.log("changeHover", payload);
            state.hover = payload;
        },
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
        // 用于控制切换整体view
        changeWholeView(state, payload) {
            state.switchWholeView = payload;
        },
        changeTimelineBook(state, payload) {
            state.timelineBook = payload;
        },
        changeShowReadme(state, payload) {
            state.showReadme = payload;
        },
        // 修改更新event data和reason data
        changeEventData(state, payload) {
            state.curEventData = payload;
        },
        changeReasonData(state, payload) {
            state.curReasonData = payload;
        },
    },
    actions: {},
    modules: {},
});
