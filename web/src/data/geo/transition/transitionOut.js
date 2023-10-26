import gsap from "gsap";
import * as d3 from "d3";
import { Point } from "@/data/geo/geometry";

export function transitionOut(to) {
    let sourceData = this.GeoAPI.cur_graph_layout();
    let targetData = (to === 'graph') ? this.GraphAPI.cur_graph_layout() : this.TimelineAPI.cur_timeline_layout();
    let transitionTimeline = gsap.timeline({ paused: false });;
    let drawer;
    this.svg.select("g.trajectory-buttons").remove();
    this.transitionLayer.selectAll("*").remove();
    this.transitionLayer.attr("opacity", 1);
    if (this.overviewMode) {
        drawer = (src, dst) => `M${src.x},${src.y} L${dst.x},${dst.y}`;

    } else {
        drawer = (src, dst) => calcD(src, dst, 1, false);
        if (to === 'timeline') drawer = (src, dst) => `M${src.x},${src.y} L${dst.x},${dst.y}`;
        sourceData = sourceData.filter(
            (d) => d.bookName === this.targetBook
        );
        targetData = targetData.filter(
            (d) => d["書名"] === this.targetBook
        );
    }
    for (let i = 0; i < sourceData.length; ++i) {
        sourceData[i].target_node_state = targetData[i].node_state;
        sourceData[i].target_edge_state = targetData[i].edge_state;
    }

    // this.transitionLayer
    this.zoomWithCenter();
    transitionTimeline.fromTo(
        this.containerPanAndZoom.node(),
        {
            attr: {
                opacity: 1,
            },
        },
        {
            attr: {
                opacity: 0,
            },
            duration: 3,
        }
    );
    transitionTimeline.fromTo(
        this.container.node(),
        {
            attr: {
                opacity: 1,
            },
        },
        {
            attr: {
                opacity: 0,
            },
            duration: 1.5,
        },
        "<"
    );
    transitionTimeline.fromTo(
        d3.select(this.$el).select(".side-panel").node(),
        {
            opacity: 1,
        },
        {
            opacity: 0,
            duration: 1.5,
        },
        "<"
    );


    if (to === 'graph') {


        this.transitionLayer.attr("opacity", 0)
            .transition()
            .duration(1000)
            .attr("opacity", 1)
            .transition()
            .duration(4500)
            .attr("opacity", 1)
            .transition()
            .duration(1000)
            .attrHelper({
                opacity: 0,
            });
        const edges = this.transitionLayer
            .append("g")
            .classed("transition-geomap-edges", true)
            .selectAll("path")
            .data(
                sourceData.filter(
                    (d) =>
                        d.edge_state &&
                        d.target_edge_state &&
                        d.target_edge_state.d
                )
            )
            .join("path")
            .attrHelper({
                d: (d) => drawer(new Point(d.edge_state.source), new Point(d.edge_state.target)),
                stroke: (d) => {
                    console.log(d.edge_state.stroke);
                    return d.edge_state.stroke;
                },
                fill: "none",
                "stroke-width": (d) => d.edge_state.stroke_width,
                opacity: (d) => d.edge_state.stroke_opacity,
            })
            .transition()
            .duration(1000)
            .attrHelper({
            })
            .transition()
            .duration(3000)
            .attrHelper({
                d: (d) => drawer(new Point(d.target_edge_state.source), new Point(d.target_edge_state.target)),
                stroke: (d) => d.target_edge_state.stroke,
                "stroke-width": (d) => d.target_edge_state.stroke_width,
            });

        const circles = this.transitionLayer
            .append("g")
            .classed("transition-geomap-circles", true)
            .selectAll("circle")
            .data(sourceData)
            .join("circle")
            .attrHelper({
                cx: (d) => d.node_state.x,
                cy: (d) => d.node_state.y,
                opacity: (d) => d.node_state.opacity / 2,
                r: (d) => d.node_state.r,
                fill: (d) => d.node_state.fill,
            })
            .transition()
            .duration(1000)
            .attrHelper({
                r: (d) => d.node_state.r,
            })
            .transition()
            .duration(3000)
            .attrHelper({
                cx: (d) => d.target_node_state.x,
                cy: (d) => d.target_node_state.y,
                r: (d) => d.target_node_state.r,
                fill: (d) => d.target_node_state.fill,
            });
    }
    else if (to === 'timeline') {
        const y_extent = d3.extent(sourceData, (d) => d.target_node_state.y);
        const y_scale = d3
            .scaleLinear()
            .domain(y_extent)
            .range([(this.canvas_height * 0.05) / 0.95, this.canvas_height]);



        this.transitionLayer.attr("opacity", 0)
            .transition()
            .duration(1000)
            .attr("opacity", 1)
            .transition()
            .duration(4500)
            .attr("opacity", 1)
            .transition()
            .duration(1000)
            .attrHelper({
                opacity: 0,
            });
        const edges = this.transitionLayer
            .append("g")
            .classed("transition-geomap-edges", true)
            .selectAll("path")
            .data(
                sourceData.filter(
                    (d) =>
                        d.edge_state &&
                        d.target_edge_state
                )
            )
            .join("path")
            .attrHelper({
                d: (d) => drawer(new Point(d.edge_state.source), new Point(d.edge_state.target)),
                stroke: (d) => {
                    console.log(d.edge_state.stroke);
                    return d.edge_state.stroke;
                },
                fill: "none",
                "stroke-width": (d) => d.edge_state.stroke_width,
                opacity: (d) => 1,
            })
            .transition()
            .duration(1000)
            .attrHelper({
            })
            .transition()
            .duration(1000)
            .attrHelper({
                d: (d) => drawer(
                    new Point(
                        d.target_edge_state.source.x,
                        y_scale(d.target_edge_state.source.y)
                    ),
                    new Point(
                        d.target_edge_state.target.x,
                        y_scale(d.target_edge_state.target.y)
                    )),
                stroke: (d) => d.target_edge_state.stroke,
                "stroke-width": (d) => d.target_edge_state.stroke_width,
                opacity: (d) => d.target_edge_state.stroke_opacity,
            })
            .transition()
            .duration(2000)
            .attrHelper({
                d: (d) => drawer(new Point(d.target_edge_state.source), new Point(d.target_edge_state.target)),

            });

        const circles = this.transitionLayer
            .append("g")
            .classed("transition-geomap-circles", true)
            .selectAll("circle")
            .data(sourceData)
            .join("circle")
            .attrHelper({
                cx: (d) => d.node_state.x,
                cy: (d) => d.node_state.y,
                opacity: (d) => 1,
                r: (d) => d.node_state.r,
                fill: (d) => d.node_state.fill,
            })
            .transition()
            .duration(1000)
            .attrHelper({
                r: (d) => d.node_state.r,
            })
            .transition()
            .duration(1000)
            .attrHelper({
                cx: (d) => d.target_node_state.x,
                cy: (d) => y_scale(d.target_node_state.y),
                r: (d) => d.target_node_state.r,
                fill: (d) => d.target_node_state.fill,
                opacity: (d) => d.target_node_state.node_opacity,
            })
            .transition()
            .duration(2000)
            .attrHelper({
                cy: (d) => d.target_node_state.y,
            });

    }
}