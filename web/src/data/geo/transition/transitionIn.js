import gsap from "gsap";
import * as d3 from "d3";

export function transitionIn() {
    const transitionTimeline = gsap.timeline({ paused: false });
    this.containerPanAndZoom.attr("opacity", 1);
    transitionTimeline.fromTo(
        this.containerBaseMap.node(),
        {
            attr: {
                opacity: 0,
            },
        },
        {
            attr: {
                opacity: 1,
            },
            duration: this.overlay_duration / 1000 / 3,
        }
    );
    transitionTimeline.fromTo(
        this.container.node(),
        {
            attr: {
                opacity: 0,
            },
        },
        {
            attr: {
                opacity: 1,
            },
            duration: this.overlay_duration / 1000,
        }
    );
    transitionTimeline.fromTo(
        d3.select(this.$el).select(".side-panel").node(),
        {
            opacity: 0,
        },
        {
            opacity: 1,
            duration: this.overlay_duration / 1000 - 0.5,
        },
        "<+0.5"
    );
}