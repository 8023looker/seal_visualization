import * as Data from "@/data/Data";
import * as d3 from "d3";
import * as Theme from "@/theme";

import * as ODAlgorithms from "./algorithms";
import { Point } from "@/data/geo/geometry";
import {
    calcD,
} from "@/data/geo/composable/simpleDrawer";

import * as Utils from "@/data/geo/utils";

import { ForceEdgeBundling } from "@/data/geo/composable/forceBundle";
import { LabelManager } from "@/data/geo/composable/labelManager";

export function preprocessODMap() {
    const augmentedAllTrajs = Data.Geo.augmentTrajectoryData(
        Data.read_data().trajs
    );
    const circleData = ODAlgorithms.circleAggregate(augmentedAllTrajs, 0.5);
    console.log("geomap", circleData);
    // const circleData = ODAlgorithms.noAggregate(augmentedAllTrajs);
    const nodes = [];
    let edges = [];
    const odCounter = new Map();
    const oriIdx2Node = new Map();
    const oriIdx2Edge = new Map();
    for (let i = 0; i < circleData.length; ++i) {
        circleData[i].index = i;
        odCounter.set(i, new Map());
        for (let j of circleData[i].trajIds) {
            oriIdx2Node.set(j, i);
        }
        circleData[i].projectedX = this.projection(circleData[i])[0];
        circleData[i].projectedY = this.projection(circleData[i])[1];
        nodes.push({
            x: this.projection(circleData[i])[0],
            y: this.projection(circleData[i])[1],
        });
    }
    for (let i of augmentedAllTrajs) {
        if (!i.prev) continue;
        const cur = oriIdx2Node.get(i.ori_idx);
        const prev = oriIdx2Node.get(i.ori_idx - 1);
        if (cur !== prev) {
            edges.push(prev + "-" + cur);
            const oldVal = odCounter.get(prev).get(cur) ?? {
                cnt: 0,
                detail: [],
            };
            oldVal.cnt += 1;
            oldVal.detail.push({ src: i.prev, dst: i });
            odCounter.get(prev).set(cur, oldVal);
            oriIdx2Edge.set(i.ori_idx, oldVal);
        }
    }
    this.aggregatedEdges = Array.from(odCounter.entries())
        .flatMap(([src, submap]) =>
            Array.from(submap.entries()).map(([dst, value]) => [
                src,
                dst,
                value,
            ])
        )
        .sort((a, b) => b[2].cnt - a[2].cnt)
        .reverse();
    edges = Array.from(new Set(edges));
    edges = edges
        .map((d) => d.split("-").map((d) => parseInt(d)))
        .map((d) => ({ source: d[0], target: d[1] }));
    for (let i = 0; i < edges.length; ++i) {
        const source = edges[i].source;
        const target = edges[i].target;
        odCounter.get(source).get(target).index = i;
    }
    for (let i of oriIdx2Edge.keys()) {
        oriIdx2Edge.set(i, oriIdx2Edge.get(i).index);
    }

    // debugger;
    const fbundling = ForceEdgeBundling()
        .step_size(0.6)
        .compatibility_threshold(0.5)
        .nodes(nodes)
        .edges(edges);
    const bundlingResults = fbundling();
    // const bundlingResults = [];
    // for (let i of edges) {
    //     bundlingResults.push(
    //         [nodes[i.source], nodes[i.target]]);
    // }
    for (let i = 0; i < bundlingResults.length; ++i) {
        bundlingResults[i].src = circleData[edges[i].source];
        bundlingResults[i].dst = circleData[edges[i].target];
    }

    this.odNodes = circleData;
    this.odEdges = bundlingResults;
    this.oriIdx2Node = oriIdx2Node;
    this.oriIdx2Edge = oriIdx2Edge;
} 


export function drawODMap(data) {
    const edges = this.odEdges;
    const nodes = this.odNodes;
    const edgeInfos = new Array(edges.length);

    for (let i = 0; i < this.odEdges.length; ++i) {
        edgeInfos[i] = {
            value: 0,
            srcNames: [],
            dstNames: [],
            trajs: [],
        };
    }
    for (let i of nodes) {
        i.highlightWeight = 0;
        i.normaWeight = 0;
        i.filteredWeight = 0;
        i.placenames = [];
    }
    for (let i of edges) {
        i.highlightWeight = 0;
        i.normaWeight = 0;
        i.filteredWeight = 0;
    }
    for (let i of data) {
        const odNode = nodes[this.oriIdx2Node.get(i.ori_idx)];
        const odEdge = edges[this.oriIdx2Edge.get(i.ori_idx)];
        const odEdgeInfo = edgeInfos[this.oriIdx2Edge.get(i.ori_idx)];
        switch (i.state) {
            case "brushed":
                odNode.highlightWeight++;
                odNode.placenames.push(i.location_std);
                if (odEdge) odEdge.highlightWeight++;
                if (odEdgeInfo) {
                    odEdgeInfo.value += 1;
                    odEdgeInfo.trajs.push(i);
                    odEdgeInfo.srcNames.push(
                        i.prev.location_std.split("-").slice(-1)[0] ??
                        ""
                    );
                    odEdgeInfo.dstNames.push(
                        i.location_std.split("-").slice(-1)[0] ?? ""
                    );
                }
            case "dehighlighted":
                odNode.normaWeight++;
                if (odEdge) odEdge.normaWeight++;
            case "unfiltered":
                odNode.filteredWeight++;
                if (odEdge) odEdge.filteredWeight++;
        }
    }
    this.odDetailPanelInfo = edgeInfos;

    const buldingLineDrawer = d3
        .line()
        .x((d) => d.x)
        .y((d) => d.y)
        .curve(d3.curveCatmullRom);

    edges.forEach((d) => {
        this.container
            .append("path")
            .classed("bundling", true)
            .attrHelper({
                d: buldingLineDrawer(d),
                stroke: "url(#odPathGradient)",
                fill: "none",
                "stroke-opacity": 0.05,
                "stroke-width":
                    d.filteredWeight > 0
                        ? Math.log2(d.filteredWeight) / Math.log2(1.4) + 1
                        : 0,
            });
        this.container
            .append("path")
            .classed("bundling", true)
            .attrHelper({
                d: buldingLineDrawer(d),
                // d: calcD(new Point(d[0]), new Point(d[1])),
                stroke: "url(#odPathGradient)",
                fill: "none",
                "stroke-opacity": 0.6,
                "stroke-width":
                    d.highlightWeight > 0
                        ? Math.log2(d.highlightWeight) / Math.log2(1.4) + 1
                        : 0,
            });
    });

    const labelManager = new LabelManager({checksumMethod: "key"});

    const circleG = this.container
        .append("g")
        .selectAll("g")
        .data(nodes)
        .join("g");
    circleG.each((d, i, els) => {
        const g = d3.select(els[i]);
        g.append("circle").attrHelper({
            cx: (d) => this.projection(d)[0],
            cy: (d) => this.projection(d)[1],
            r: (d) =>
                d.highlightWeight > 0
                    ? Math.log2(d.highlightWeight) * 2 + 2
                    : 0,
            // 1.5,
            fill: Theme.color.majorFontColor,
            // fill: 'red',
            stroke: 'white',
            'stroke-width': 0.2,
            "fill-opacity": 0.8,
        });
        g.append("circle").attrHelper({
            cx: (d) => this.projection(d)[0],
            cy: (d) => this.projection(d)[1],
            r: (d) =>
                d.filteredWeight > 0
                    ? Math.log2(d.filteredWeight) * 2 + 2
                    : 0,
            fill: Theme.color.majorFontColor,
            stroke: "none",
            "fill-opacity": 0.4,
        });
        if (d.location_std_set.has("日本") || d.location_std_set.has("中國")) {
            g.append("circle").attrHelper({
                cx: (d) => this.projection(d)[0],
                cy: (d) => this.projection(d)[1],
                r: Math.log2(d.filteredWeight) * 2 + 3,
                filter: "blur(1.5px)",
                "stroke-dasharray": "4, 2",
                fill: "none",
                stroke: Theme.color.majorFontColor,
                "stroke-width": 2,

            }).lower();
        }


        const fontSize = 12;
        let labels;
        labels = Utils.getMostFrequentK(
            // d.location_std_array
            d.placenames
            .map(d => {
                const ds = d.split('-');
                if (ds[0] === '中國') {
                    return ds[2] || ds[1] || ds[0];
                }
                else {
                    return ds[1] || ds[0]
                }
            }),
            4
        );
        if (this.language === 'en') {
            labels = labels.map(d => [Theme.lang.locations[d[0]].en, d[1]]);
            labels = labels.map(d => [d[0] + `(${d[1]} evts)`, d[1]])
        }
        else {
            labels = labels.map(d => [d[0] + `(${d[1]}次)`, d[1]])
        }
        for (let i of labels) {
            
            if (!i[0]) {
                debugger;
            }
        }

        const [squred, [w, h]] = Utils.squareSplit(labels);
        d.nodeObj = labelManager.addStaticObject(
            this.projection(d)[0],
            this.projection(d)[1],
            10,
            10,
            1,
            i
        );
        if (labels.length > 0)  {
            const ang = Math.random() * 2 * Math.PI;
            d.labelObj = labelManager.addLabel(
                // this.projection(d)[0] + (Math.random() - 0.5) * 5,
                // this.projection(d)[1] + (Math.random() - 0.5) * 5,
                Math.cos(ang) * 2000,
                Math.sin(ang) * 2000,
                w * fontSize,
                (h + 1) * fontSize,
                1,
                d.nodeObj,
                i,
            );
        }



        const curG = g.append('g').classed("label-group", true);
        curG.attrHelper({
            transform: `translate(${this.projection(d)[0]}, ${this.projection(d)[1]})`,
        })
        .styleHelper({
            visibility: d.highlightWeight > 0 ? null : 'hidden',
        })

        curG.append('line');
        curG.append('rect').attrHelper({
            x: 0,
            y: 0,
            width: w * fontSize,
            height: (h + 1) * fontSize,
            fill: "white",
            stroke: Theme.color.majorFontColor,
            'stroke-width': 0.5,
            "fill-opacity": 0.5,
            'opacity': 0.7,
        });
        curG.append('text').selectAll("tspan").data(squred).join("tspan")
            .attrHelper({
                "text-anchor": "middle",
                "dominant-baseline": "middle",
                "font-size": "12px",
                "font-weight": "bold",
                fill: Theme.color.majorFontColor,
                stroke: "none",
                "fill-opacity": 0.8,
                dy: fontSize,
                x: w * fontSize / 2,
            })
            .text((d) => d.map(d => d[0]).join('，'));
    });

    function getNearPoint(center, extent, target) {
        const coef = [[1, 1], [1, -1], [-1, 1], [-1, -1]];
        let minVal = Infinity;
        let minP = null;
        for (let i of coef) {
            const l = center.add(new Point(extent.x * i[0], extent.y * i[1]));
            const dis = l.sub(target).len();
            if (dis < minVal) {
                minVal = dis;
                minP = new Point(extent.x * i[0], extent.y * i[1]);
            }
        }
        return minP;
    }
    // circleG.attr("opacity", 0);
    labelManager.onEnd(() => {
        circleG.attr("opacity", 1);
        circleG.each((d, i, els) => {
            const g = d3.select(els[i]);
            const curG = g.select('.label-group');
            if (d.labelObj) {
                curG.attrHelper({
                    transform: `translate(${d.labelObj.x - d.labelObj.extent.x}, ${d.labelObj.y - d.labelObj.extent.y})`,
                });
                const p = getNearPoint(d.labelObj, d.labelObj.extent, d.nodeObj);
                curG.select('line').attrHelper({
                    x1: d.nodeObj.x - (d.labelObj.x - d.labelObj.extent.x),
                    y1: d.nodeObj.y - (d.labelObj.y - d.labelObj.extent.y),
                    x2: d.labelObj.extent.x + p.x,
                    y2: d.labelObj.extent.y + p.y,
                    stroke: 'black',
                    'stroke-width': 0.5,
                    'opacity': 0.7,
                })
            }
        
        })
    })
    labelManager.initializeSimulation();
    // g.append("text")
    //     .attrHelper({
    //         x: (d) => this.projection(d)[0],
    //         y: (d) => this.projection(d)[1],
    //         "text-anchor": "middle",
    //         "dominant-baseline": "middle",
    //         "font-size": "12px",
    //         "font-weight": "bold",
    //         fill: Theme.color.majorFontColor,
    //         stroke: "none",
    //         "fill-opacity": 0.8,
    //         dx: (d) => Math.cos(0.25 * Math.PI * 2) * 30,
    //         dx: (d) => Math.sin(0.25 * Math.PI * 2) * 30,
    //     })
    //     .text((d) => {
    //         const labels = 
    //         console.log(labels);
    //         return labels;
    //     }
    // 
    // );
    // const odData = Data.Geo.getAllOD();
    // const [aggregatedData, _] = Data.Geo.OD.ODSample(odData, 0.2, 30, null);
    // this.container
    //   .append("g")
    //   .selectAll("path")
    //   .data(aggregatedData)
    //   .join("path")
    //   .each((datum, i, group) => {
    //     const path = d3.select(group[i]);
    //     const fr = new Point(...this.projection(datum.src));
    //     const to = new Point(...this.projection(datum.dst));
    //     const [toBeforeRotate, rotateStr] = calcAng(fr, to);
    //     path.attrHelper({
    //       fill: "none",
    //       "stroke-width": Math.log2(datum.value) * 1 + 1,
    //       stroke: "url(#odPathGradient)",
    //       d: calcD(fr, toBeforeRotate),
    //       transform: rotateStr,
    //       "marker-end": "url(#blueArrowPathArrowHead)",
    //     });
    //   });
}