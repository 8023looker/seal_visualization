import * as d3 from 'd3';
import gsap from "gsap";
import { Point } from "@/data/geo/geometry";
import * as Theme from "@/theme";


const BUTTONCOLOR = Theme.color.majorFontColor;


const NODESIZE = 3;
const NODEINC = 4;
const EDGEWIDTH = 2;
const LABELFONTSIZE = 15;

let currentScale = 1;


export function calcD(src, dst, percentage = 1, relative = true) {
    const direct = dst.sub(src);
    const normal = direct.rotate(Math.PI / 2).mul(0.2);
    /* Cubic bezier with normal offset in src & dst */
    // return `M ${src.x},${src.y} c ${normal.x},${normal.y} ${direct.x + normal.x},${direct.y + normal.y} ${direct.x},${direct.y}`;
    /* Quadratic  bezier with center normal offset */
    const middle = direct.mul(0.5).add(normal);
    if (percentage === 1) {
        if (relative) {
            return `M ${src.x},${src.y} q ${middle.x},${middle.y} ${direct.x},${direct.y}`;
        }
        else {
            return `M ${src.x},${src.y} Q ${src.x + middle.x},${src.y + middle.y} ${src.x + direct.x},${src.y + direct.y}`;
        }
        
    }
    else {
        const m1 = new Point(0, 0).mul(1 - percentage).add(middle.mul(percentage));
        const m2 = middle.mul(1 - percentage).add(direct.mul(percentage));
        const m3 = m1.mul(1 - percentage).add(m2.mul(percentage));
        if (relative) {
            return `M ${src.x},${src.y} q ${m1.x},${m1.y} ${m3.x},${m3.y}`;
        }
        else {
            return `M ${src.x},${src.y} Q ${src.x +m1.x},${src.y + m1.y} ${src.x + m3.x},${src.y + m3.y}`;
        }
    }
}


export function calcTrapezoidBetweenCircle(rawC1, r1, rawC2, r2) {
    const c1 = rawC1;
    const direction = rawC2.sub(c1);
    const angle = direction.angle();
    const c2 = direction.rotate(-angle).add(c1);

    const rd = r2 - r1;
    const dist = c1.sub(c2).len();
    const alpha = Math.acos(rd / dist);
    const cos = Math.cos(alpha);
    const sin = Math.sin(alpha);
    const p1 = new Point(-r1 * cos, r1 * sin).add(c1);
    const p2 = new Point(-r1 * cos, -r1 * sin).add(c1);
    const p3 = new Point(-r2 * cos, -r2 * sin).add(c2);
    const p4 = new Point(-r2 * cos, r2 * sin).add(c2);
    const d = `M ${p1.x} ${p1.y} A ${r1} ${r1} 0 1 0 ${p2.x} ${p2.y} L ${p3.x} ${p3.y} A ${r2} ${r2} 0 0 0 ${p4.x} ${p4.y} Z`
    const transform = `rotate(${angle / Math.PI * 180}, ${c1.x},${c1.y})`;
    return { d, transform };
}

export function calcLineBetweenTwoCircles(c1, r1, c2, r2) {
    const direction = c2.sub(c1);
    const unitDirection = direction.toOne();
    const p1 = c1;
    const p2 = c2.sub(unitDirection.mul(r2));
    return `M ${p1.x} ${p1.y} L ${p2.x} ${p2.y}`;

}

export function calcAng(fr, to) {
    const det = to.sub(fr);
    const ang = det.angle();
    const rotateDet = det.rotate(-ang);
    const newTo = fr.add(rotateDet);
    return [newTo, `rotate(${ang / Math.PI * 180}, ${fr.x},${fr.y})`];
}


export class TrajectoryAnimator {
    constructor() {

    }

    initialize(projection, svgLayer, data, magnifierManager) {
        this.projection = projection;
        this.svgLayer = svgLayer;
        this.data = data;
        this.magnifierManager = magnifierManager;
        this.animationLabels = [];
        this.generateAnimation();
    }

    reHighlight(keys) {
        const animationFlag = this.animationTimeline.isActive() && this.animationTimeline.progress() < 1;
        for (let i of Object.values(this.citySvgG)) {
            let flag = false;
            for (let d of i.selectAll("circle").data()) {
                if (keys.indexOf(d) !== -1) {
                    flag = true;
                    break;
                }
            }
            flag = flag && !animationFlag;
            i.attrHelper({
                transform: flag ? "scale(1.5)" : null,
            });
        }
        for (let i of Object.values(this.cityLabelG)) {
            let flag = false;
            for (let d of i.selectAll("text").data()) {
                if (keys.indexOf(d) !== -1) {
                    flag = true;
                    break;
                }
            }
            flag = flag && !animationFlag;
            i.selectAll('text').attrHelper({
                "stroke": flag ? "black" : "white",
            })
        }
    }

    drawRestart(svgG) {
        const interactive = svgG.append('g');
        const visual = svgG.append('g');
        visual.append("circle").attrHelper({
            cx: 0,
            cy: 0,
            r: 13,
            stroke: BUTTONCOLOR,
            fill: "none",
            "stroke-width": 1.5,
        });
        const glyph = visual.append("path").attrHelper({
            stroke: "none",
            fill: BUTTONCOLOR,
            d: "M-5,-5 L-5,5 L5,5 L5,-5 Z"
        });
        interactive.append('circle').attrHelper({
            cx: 0,
            cy: 0,
            r: 15,
            fill: "white",
        });
        svgG.styleHelper({
            cursor: "pointer",
            transition: "all ease 0.2s"
        });
        svgG.on("mouseover", function (event, d) {
            visual.styleHelper({
                "filter": `drop-shadow(0 0 1.5px ${BUTTONCOLOR + "a0"})`
            });
        });
        svgG.on("mouseout", function (event, d) {
            visual.styleHelper({
                "filter": `none`
            });
        });
        svgG.on("click", () => {
            this.animationTimeline.pause();
            this.animationTimeline.progress(1);
            // this.vueComponent.updateTrajectoryHighlight([]);
        });
    }
    drawPause(svgG) {
        const interactive = svgG.append('g');
        const visual = svgG.append('g');
        visual.append("circle").attrHelper({
            cx: 0,
            cy: 0,
            r: 13,
            stroke: BUTTONCOLOR,
            fill: "none",
            "stroke-width": 1.5,
        });
        const glyph = visual.append("path").attrHelper({
            stroke: "none",
            fill: BUTTONCOLOR,
            d: "M-4,-6 L-4,6 L8,0 L8,0 Z"
        });
        interactive.append('circle').attrHelper({
            cx: 0,
            cy: 0,
            r: 15,
            fill: "white",
        });
        svgG.styleHelper({
            cursor: "pointer",
            transition: "all ease 0.2s"
        });
        svgG.on("mouseover", function (event, d) {
            visual.styleHelper({
                "filter": `drop-shadow(0 0 1.5px ${BUTTONCOLOR + "a0"})`
            });
        });
        svgG.on("mouseout", function (event, d) {
            visual.styleHelper({
                "filter": `none`
            });
        });
        this.animationTimeline.eventCallback("onComplete", () => {
            this.animationTimeline.pause()
            glyph.transition().attr("d", "M-4,-6 L-4,6 L8,0 L8,0 Z M8,0 h0 v0 h0 Z");
        });
        svgG.on("click", () => {
            if (this.animationTimeline) {
                if (this.animationTimeline.isActive()) {
                    this.animationTimeline.pause()
                    glyph.transition().attr("d", "M-4,-6 L-4,6 L8,0 L8,0 Z M8,0 h0 v0 h0 Z");
                }
                else {
                    if (this.animationTimeline.progress() === 1) {
                        this.animationTimeline.progress(0);
                    }
                    this.animationTimeline.play()
                    glyph.transition().attr("d", "M-6,-6 L-6,6 L-2,6 L-2,-6 Z M2,-6 h4 v12 h-4 Z");
                }
            }
        });
    }

    drawLabel(text, pos, cnt, cityName, content) {
        text.attrHelper({
            x: pos[0] + LABELFONTSIZE * currentScale * 1,
            y: pos[1] + LABELFONTSIZE * currentScale * 0.3,
            stroke: "white",
            "stroke-width": 0.2 * currentScale,
            "font-size": LABELFONTSIZE * currentScale,
            "font-weight": 700,
            "font-family": "sans-serif",
        })
        if (cnt === 0) {
            text.append('tspan').text(cityName);
            text.append('tspan').text(content).attr("dy", LABELFONTSIZE * currentScale * 1.1);
        }
        else {
            text.text(content).attrHelper({
                y: pos[1] + LABELFONTSIZE * currentScale * (cnt * 1.1 + 1.5),
            });
        }
    }

    drawNode(circle, pos, cnt, property) {
        circle.attrHelper({
            cx: pos[0],
            cy: pos[1]
        })
        if (cnt === 0) {
            circle.attrHelper({
                fill: Theme.color.mapDarkerBrown,
                stroke: "none",
                r: NODESIZE * currentScale,
            });
        }
        else {
            circle.attrHelper({
                fill: "none",
                stroke: Theme.color.mapDarkerBrown,
                "stroke-width": 0.8 * currentScale,
                r: (cnt * NODEINC * currentScale) + NODESIZE * currentScale,
            });
        }
    }

    drawArrow(edge, src, dst) {
        const fr = src;
        const [to, rotateStr] = calcAng(fr, dst);
        edge.attrHelper({
            fill: "none",
            "stroke-width": EDGEWIDTH * currentScale,
            stroke: "url(#blueArrowPathGradient)",
            d: calcD(fr, to),
            transform: rotateStr,
            "marker-end": "url(#blueArrowPathArrowHead)",
        });
    }

    // registerCityAction(g, pos) {
    //     g.attr("transform-origin", `${pos[0]} ${pos[1]}`);
    //     g.on("mouseenter", () => {
    //         this.vueComponent.updateTrajectoryHighlight(g.selectAll('circle').data());
    //     });
    //     g.on("mouseleave", () => {
    //         this.vueComponent.updateTrajectoryHighlight([]);
    //     });
    // }
    // registerLabelAction(g) {
    //     g.on("mouseenter", () => {
    //         this.vueComponent.updateTrajectoryHighlight(g.selectAll('text').data());
    //     });
    //     g.on("mouseleave", () => {
    //         this.vueComponent.updateTrajectoryHighlight([]);
    //     });
    // }

    // registerEdgeAction(edge) {
    //     edge.on("mouseenter", () => {
    //         if (!this.animationTimeline.isActive() || this.animationTimeline.progress() === 1) {
    //             edge.attrHelper({
    //                 filter: `drop-shadow(0 0 1.5px ${BUTTONCOLOR + "a0"})`,
    //                 "stroke-width": EDGEWIDTH * currentScale * 2,
    //             });
    //             this.vueComponent.updateTrajectoryHighlight([edge.datum()]);
    //         }
    //     });
    //     edge.on("mouseleave", () => {
    //         if (!this.animationTimeline.isActive() || this.animationTimeline.progress() === 1) {
    //             edge.attrHelper({
    //                 filter: "none",
    //                 "stroke-width": EDGEWIDTH * currentScale,
    //             });
    //             this.vueComponent.updateTrajectoryHighlight([]);
    //         }
    //     })
    // }

    addLabelAnimation(text, pos, cnt, cityName, content, insertBefore) {
        this.drawLabel(text, pos, cnt, cityName, content);
        this.animationTimeline.fromTo(text.node(),
            {
                attr: {
                    opacity: 0,
                }
            },
            {
                attr: {
                    opacity: 1,
                },
                duration: 1,
            },
            this.animationLabels.includes(insertBefore) ? insertBefore : '+=0'
        );
    }

    addNodeAnimation(circle, pos, cnt, property, insertBefore) {
        const that = this;
        this.drawNode(circle, pos, cnt, property);
        if (cnt === 0) {
            this.animationTimeline.fromTo(circle.node(),
                {
                    attr: {
                        r: 0,
                    }
                },
                {
                    attr: {
                        r: NODESIZE * currentScale,
                    },
                    onUpdate: function () {
                        // that.vueComponent.updateTrajectoryHighlight([circle.datum()]);
                    }
                },
                this.animationLabels.includes(insertBefore) ? insertBefore : '+=0'

            );
        }
        else {
            this.animationTimeline.fromTo(circle.node(),
                {
                    attr: {
                        r: 0,
                    }
                },
                {
                    attr: {
                        r: (cnt * NODEINC * currentScale) + NODESIZE * currentScale,
                    },
                    onUpdate: function () {
                        // that.vueComponent.updateTrajectoryHighlight([circle.datum()]);
                    }
                },
                this.animationLabels.includes(insertBefore) ? insertBefore : '+=0'
            );
        }
    }

    addArrowAnimation(edge, src, dst, insertBefore) {
        const that = this;
        this.drawArrow(edge, src, dst);
        const fr = src;
        const [to, _] = calcAng(fr, dst);
        this.animationTimeline.fromTo({ p: 0 },
            {
                p: 0,
            },
            {
                p: 1,
                onUpdate: function () {
                    const pr = this.progress();
                    edge.attr("d", calcD(fr, to, pr));
                    if (pr === 0) {
                        edge.attr("marker-end", "none");
                    }
                    else {
                        edge.attr("marker-end", "url(#blueArrowPathArrowHead)");
                    }
                    // that.vueComponent.updateTrajectoryHighlight([edge.datum()]);
                },
                duration: 1.5,
            },
            this.animationLabels.includes(insertBefore) ? insertBefore : '+=0'
        )

    }

    generateAnimation() {
        this.animationTimeline = gsap.timeline({ paused: true });
        this.citySvgNodes = {};
        this.citySvgG = {};
        this.cityLabelG = {};
        this.svgEdges = [];
        this.cityCenter = {};
        this.cityLabelOffset = {};

        let lastPos = { value: null, magnifier: null };

        let lastMagnifier = null;

        let magnifierPos = new Map();

        let idx = 0;
        for (const i of this.data) {
            const posPlanar = i.posPlanar;
            const magnifier = this.magnifierManager.checkContain(i.posPlanar);

            const cityName = magnifier ? i.prefectureName : i.rawLocation;
            const time = +i.time;
            const property = i.property ?? "property";
            const label = ``;
            const oldCnt = (cityName in this.citySvgNodes) ? this.citySvgNodes[cityName].length : 0;
            const posTarget = (oldCnt === 0) ? posPlanar : this.cityCenter[cityName];



            const addAnimationStep = (svgG, cityName, time, property, label, oldCnt, lastPos, pos, myAniLabel, insertAniLabel, dataItem) => {
                if (oldCnt === 0) {
                    this.citySvgG[cityName] = svgG.append('g').classed(cityName, true).classed("city_node_group", true).datum(cityName);
                    this.cityLabelG[cityName] = svgG.append('g').classed(cityName, true).classed("city_label_group", true).datum(cityName);
                    this.citySvgNodes[cityName] = [];
                    this.cityCenter[cityName] = posPlanar;
                    this.cityLabelOffset[cityName] = (i.labelOffset) ? new Point(...i.labelOffset) : new Point(0, 0);
                }
                const svgNodes = this.citySvgNodes[cityName];

                // draw edge
                if (lastPos.value) {
                    if (!lastPos.value.equals(pos)) {
                        const edge = svgG.append('path').datum(time);
                        this.svgEdges.push(edge);
                        this.animationTimeline.addLabel(myAniLabel + '-edge');
                        this.animationLabels.push(myAniLabel + '-edge');
                        this.addArrowAnimation(edge, lastPos.value, pos, insertAniLabel + '-edge');
                        if (dataItem && !dataItem.edge) {
                            let fr = edge.node().ownerSVGElement.createSVGPoint();
                            fr.x = lastPos.value.x;
                            fr.y = lastPos.value.y;
                            fr = fr.matrixTransform(svgG.node().getCTM().inverse());
                            dataItem.edge = {};
                            dataItem.edge.src = new Point(fr.x, fr.y);
                            let to = edge.node().ownerSVGElement.createSVGPoint();
                            to.x = pos.x;
                            to.y = pos.y;
                            to = to.matrixTransform(svgG.node().getCTM().inverse());
                            dataItem.edge.dst = new Point(to.x, to.y);
                        }
                        // this.registerEdgeAction(edge);
                        lastPos.value = pos;
                    }
                    else if (!lastPos.magnifier && (magnifier && !magnifierPos.get(magnifier).value.equals(posPlanar)) &&
                        (lastMagnifier && !magnifierPos.get(lastMagnifier).value.equals(posPlanar))) {
                        this.animationTimeline.addLabel(myAniLabel + '-edge');
                        this.animationLabels.push(myAniLabel + '-edge');
                        this.animationTimeline.to({ tmp: 1 }, { tmp: 2, duration: 1.5 });
                    }
                }
                else {
                    lastPos.value = pos;
                }
                // draw node
                /**
                    Do not really draw when
                    1. as the start position in a trajectorysegment being magnified
                    2. as the last position in a trajectory segment being magnified
                 */
                if ((!lastPos.magnifier && magnifier && oldCnt > 0) || (lastPos.magnifier && !magnifier)) {
                    this.animationTimeline.addLabel(myAniLabel + '-node');
                    this.animationLabels.push(myAniLabel + '-node');
                    this.animationTimeline.to({ tmp: 1 }, { tmp: 2 });
                }
                else {
                    const cityG = this.citySvgG[cityName];
                    const circle = cityG.append('circle').datum(time);
                    svgNodes.push(circle);
                    this.animationTimeline.addLabel(myAniLabel + '-node');
                    this.animationLabels.push(myAniLabel + '-node');
                    this.addNodeAnimation(circle, pos, oldCnt, property, insertAniLabel + '-node');
                    if (dataItem) {
                        let to = circle.node().ownerSVGElement.createSVGPoint();
                        to.x = pos.x;
                        to.y = pos.y;
                        to = to.matrixTransform(circle.node().getCTM().inverse());
                        dataItem.node = {};
                        dataItem.node.pos = new Point(to.x, to.y);
                    }
                    if (oldCnt === 0) {
                        // this.registerCityAction(cityG, pos);
                    }
                }
                // draw label;
                const cityLabelG = this.cityLabelG[cityName];
                const text = cityLabelG.append('text').datum(time);
                const adjustedPos = pos.add(this.cityLabelOffset[cityName]);
                this.animationTimeline.addLabel(myAniLabel + '-label');
                this.animationLabels.push(myAniLabel + '-label');
                this.addLabelAnimation(text, adjustedPos, oldCnt, cityName.split('-')[0], label, insertAniLabel + '-label');
                if (oldCnt === 0) {
                    // this.registerLabelAction(cityLabelG);
                }
            }

            if (magnifier && !magnifierPos.has(magnifier)) {
                magnifierPos.set(magnifier, { value: lastPos.value, magnifier: magnifier });
            }
            addAnimationStep(this.svgLayer, cityName, time, property, label, oldCnt, lastPos, posTarget, 'n' + idx, 'null', i);
            if (magnifier) {
                const cityName = i.rawLocation + '-' + magnifier.id;
                const time = +i.time + 0.5;
                const property = 'property';
                const label = ``;
                const oldCnt = (cityName in this.citySvgNodes) ? this.citySvgNodes[cityName].length : 0;
                const posTarget = i.posPlanar;
                currentScale = 1 / magnifier.scale;
                addAnimationStep(magnifier.svgG, cityName, time, property, label, oldCnt, magnifierPos.get(magnifier), posTarget, 'n' + (idx + 1), 'n' + idx, i);
                currentScale = 1;
            }
            if (lastMagnifier && lastMagnifier !== magnifier) {
                const cityName = i.rawLocation + '-' + lastMagnifier.id;
                const time = +i.time + 0.5;
                const property = 'property';
                const label = ``;
                const oldCnt = (cityName in this.citySvgNodes) ? this.citySvgNodes[cityName].length : 0;
                const posTarget = i.posPlanar;
                currentScale = 1 / lastMagnifier.scale;
                addAnimationStep(lastMagnifier.svgG, cityName, time, property, label, oldCnt, magnifierPos.get(lastMagnifier), posTarget, 'n' + (idx + 2), 'n' + idx, i);
                currentScale = 1;
                magnifierPos.delete(lastMagnifier);
            }
            idx += 3;
            lastMagnifier = magnifier;
            // end
        }
        this.svgLayer.selectAll("g.city_node_group").raise();
        this.svgLayer.selectAll("g.city_label_group").raise();
        this.animationTimeline.progress(1);
        this.animationTimeline.progress(0);
        // this.animationTimeline.play();
        this.animationTimeline.progress(1);
        // this.vueComponent.updateTrajectoryHighlight([]);
    }

    pause() {
        this.animationTimeline.pause();
    }

    play() {
        this.animationTimeline.play();
    }

    restart() {
        this.animationTimeline.pause();
        this.animationTimeline.progress(0);
        this.animationTimeline.play();
    }

    watch(fn) {
    }



    destructor() {
        this.animationTimeline.kill();
        this.svgLayer.selectAll("*").remove();
    }
}

export default TrajectoryAnimator;