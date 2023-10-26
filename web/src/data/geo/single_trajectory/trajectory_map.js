import * as Data from "@/data/Data";
import * as d3 from "d3";
import * as Theme from "@/theme";

import { Point } from "@/data/geo/geometry";
import { distanceBetweenRectAndPoint } from "@/data/geo/geometry";

import {
    TrajectoryAnimator as simpleDrawer,
    calcTrapezoidBetweenCircle,
    calcD,
} from "@/data/geo/composable/simpleDrawer";

const inJapan = (x, y) => {
    return x > 130 && x < 145 && y > 30 && y < 45;
}

const _getRelativePos = function ([x, y]) {
    return new Point(
        (x * this.canvas_width) / 1728,
        (y * this.canvas_height) / 675
    );
};

const _getRelativeSize = function (x) {
    return (x * this.canvas_width) / 1728;
};

class Magnifier {
    constructor(
        id,
        planarPos,
        canvasPos,
        radius,
        scale,
        label,
        centroid
    ) {
        this.id = id;
        this.planarPos = planarPos;
        this.canvasPos = canvasPos;
        this.radius = radius;
        this.scale = scale;
        this.label = label;
        this.centroid = centroid;
        this.svgG = null;
    }
    get coverRadius() {
        return this.radius / this.scale;
    }
}



export function drawTrajectoryMap() {
    const [chinaBorder, china, japanBorder, japan, korea, japnCities] =
        Data.Geo.getTestData();
    const scale = 1;
    const det = new Point(0, 0);
    const getRelativePos = _getRelativePos.bind(this);
    const getRelativeSize = _getRelativeSize.bind(this);
    
    

    class MagnifierManager {
        constructor(container, projection, pathDrawer) {
            this.container = container;
            this.magnifiers = [];
            this.projection = projection;
            this.pathDrawer = pathDrawer;
        }
        putMagnifier(
            centerPlanar,
            canvasPos,
            size = 250,
            scale,
            label,
            centroid
        ) {
            const magnifier = new Magnifier(
                this.magnifiers.length,
                centerPlanar,
                canvasPos,
                size,
                scale,
                label,
                centroid
            );
            this.magnifiers.push(magnifier);
            const clipIndex = Math.round(Math.random() * 1000);
            const magnifierSvgG = this.container
                .append("g")
                .classed(`magnifier-instance`, true);
            magnifierSvgG.append("circle").attrHelper({
                cx: canvasPos.x,
                cy: canvasPos.y,
                r: size,
                fill: "none",
                stroke: Theme.color.mapDarkerBrown,
            });
            magnifierSvgG
                .append("defs")
                .append("clipPath")
                .attr("id", `magnifier-clip-${clipIndex}`)
                .append("circle")
                .attrHelper({
                    cx: canvasPos.x,
                    cy: canvasPos.y,
                    r: size,
                });
            const threshold = size / scale;
            const selecetedCity = [];
            for (let i of [].concat(japan.features, china.features)) {
                const bounds = i.properties.bounds;
                const dist = distanceBetweenRectAndPoint(
                    new Point(bounds[0][0], bounds[0][1]),
                    new Point(bounds[1][0], bounds[1][1]),
                    centerPlanar
                );
                if (dist < threshold) {
                    if (i.properties.N03_001) {
                        for (let j of Object.values(japnCities)) {
                            if (
                                j.properties.N03_001 ===
                                i.properties.N03_001
                            ) {
                                selecetedCity.push(j);
                            }
                        }
                    } else {
                        selecetedCity.push(i);
                    }
                }
            }
            const translate = canvasPos.sub(centerPlanar.mul(scale));
            const handler = magnifierSvgG
                .append("g")
                .classed("magnifier-handler", true);
            handler.append("circle").attrHelper({
                cx: centerPlanar.x,
                cy: centerPlanar.y,
                r: Math.max(3, size / scale),
                fill: "none",
                "stroke-width": 1,
                "stroke-opacity": 0.8,
                stroke: Theme.color.mapDarkerBrown,
            });
            const handlerShape = calcTrapezoidBetweenCircle(
                centerPlanar,
                3,
                canvasPos,
                size
            );
            handler.append("path").attrHelper({
                d: handlerShape.d,
                transform: handlerShape.transform,
                // fill: 'url(#handlerGradient)',
                fill: "none",
                stroke: Theme.color.mapArrowColor,
                "stroke-width": 1,
                "stroke-dasharray": "5,2",
                "stroke-opacity": 0.8,
            });
            // handler.append("path").attrHelper({
            //     stroke: "grey",
            //     d: calcLineBetweenTwoCircles(centerPlanar, size / scale, canvasPos, size),
            //     "stroke-width": 4,
            //     "stroke-dasharray": "5,5",
            //     "stroke-opacity": 0.5
            // })
            magnifierSvgG
                .append("g")
                .classed("magnified-content", true)
                .attrHelper({
                    "clip-path": `url(#magnifier-clip-${clipIndex})`,
                })
                .append("g")
                .classed("geo-content", true)
                .attrHelper({
                    transform: `translate(${translate.x}, ${translate.y}) scale(${scale})`,
                })
                .append("g")
                .classed("features", true)
                .selectAll("path")
                .data(selecetedCity)
                .join("path")
                .attrHelper({
                    d: this.pathDrawer,
                    fill: "none",
                    stroke: Theme.color.mapDarkerBrown,
                    "stroke-width": 0.3 / scale,
                });
            magnifier.svgG = magnifierSvgG.select("g.geo-content");
            return magnifierSvgG;
        }
        checkContain(planarPos) {
            for (let i of this.magnifiers) {
                if (i.planarPos.sub(planarPos).len() < i.coverRadius) {
                    return i;
                }
            }
            return null;
        }
        getOverviewName() { }
        clearMagnifier() {
            this.container.selectAll(".magnifier-instance").remove();
            this.magnifiers = [];
        }
    }

    const calcMagnifiedArea = (trajectoryData) => {
        const cityDict = {};
        const cityCandidate = [];
        const magnifierManager = this.magnifierManager;
        const magnifierPosCandidate = [
            [1200, 300],
            [880, 520],
        ].map(getRelativePos);
        const magnifierSize = getRelativeSize(120);
        for (let j of japan.features) {
            cityDict[j.properties.N03_001] = [];
        }
        for (let j of japan.features) {
            for (let i of trajectoryData) {
                if (d3.geoContains(j, i.spherePos)) {
                    let flag = false;
                    for (let k of cityDict[j.properties.N03_001]) {
                        if (k.equals(i.spherePos)) {
                            flag = true;
                            break;
                        }
                    }
                    if (!flag) {
                        cityDict[j.properties.N03_001].push(
                            i.spherePos
                        );
                    }
                }
            }
            if (cityDict[j.properties.N03_001].length > 1) {
                cityCandidate.push(j);
            }
        }
        for (let i of cityCandidate) {
            const prefectureName = i.properties.N03_001;
            let sum = new Point(0, 0);
            for (let j of cityDict[prefectureName]) {
                sum = sum.add(j);
            }
            // console.log(sum, cityDict[prefectureName]);
            sum = sum.mul(1 / cityDict[prefectureName].length);
            const centerSphere = sum;
            const centerPlanar = new Point(
                ...this.projection(centerSphere)
            );
            let maxDist = 0;
            for (let j of cityDict[prefectureName]) {
                const posPlanar = new Point(...this.projection(j));
                const dist = centerPlanar.sub(posPlanar).len();
                maxDist = Math.max(maxDist, dist);
            }
            // console.log(sum);
            const size = magnifierSize;
            const magnifierPos = new Point(
                ...magnifierPosCandidate[
                magnifierManager.magnifiers.length
                ]
            );
            const magG = magnifierManager.putMagnifier(
                centerPlanar,
                magnifierPos,
                size,
                (size * 0.6) / maxDist,
                prefectureName,
                centerPlanar
            );
        }
    };

    const drawSimpleAnimation = () => {
        if (this.magnifierManager) {
            this.magnifierManager.clearMagnifier();
        }
        this.magnifierManager = new MagnifierManager(
            this.container,
            this.projection,
            this.pathDrawer
        );
        const augmentedData = Data.Geo.augmentTrajectoryData(
            Data.read_data().trajs
        );
        const book = augmentedData.filter(
            (d) => d.bookName === this.targetBook
        );
        const trajectoryData = [];
        let prefectureName = "";
        for (let i of book) {
            let r;
            if (inJapan(i.x, i.y)) {
                r = new Point(...this.projection([i.x, i.y]))
                    .mul(scale)
                    .add(det);
                for (let j of japan.features) {
                    if (d3.geoContains(j, [i.x, i.y])) {
                        prefectureName = j.properties.N03_001;
                    }
                }
            } else {
                r = new Point(...this.projection([i.x, i.y]));
            }
            if (prefectureName in Theme.lang.locations) {
                prefectureName = Theme.lang.locations[prefectureName][this.language];
            }
            else {
                console.log('prefecture name not in dict', prefectureName)
            }
            trajectoryData.push(
                Object.assign(
                    {
                        prefectureName,
                        rawLocation: Theme.lang.locations[i.location_std
                            .split("-")
                            .slice(-1)[0]][this.language],
                        longitude: i.x,
                        latitude: i.y,
                        spherePos: new Point(i.x, i.y),
                        mapedPos: r,
                        posPlanar: r,
                        placename: i.location_std.split("-").slice(-1),
                    },
                    i
                )
            );
        }
        console.log(trajectoryData);
        for (let i of trajectoryData) {
            const nameSet = new Set();
            for (let j of trajectoryData) {
                if (i.spherePos.equals(j.spherePos)) {
                    nameSet.add(j.rawLocation);
                }
            }
            i.location = Array.from(nameSet).join(",");
        }
        calcMagnifiedArea(trajectoryData);
        if (this.drawer) {
            this.drawer.destructor();
        }
        this.container.select("g.trajectory").remove();
        this.svg.select("g.trajectory-buttons").remove();
        this.container.append("g").classed("trajectory", true);
        const buttons = this.svg
            .append("g")
            .classed("trajectory-buttons", true)
            .attrHelper({
                transform: `translate(${25}, ${25})`,
            });
        this.drawer = new simpleDrawer();
        this.drawer.initialize(
            this.projection,
            this.container.select("g.trajectory"),
            trajectoryData,
            this.magnifierManager
        );
        this.drawer.drawRestart(
            buttons
                .append("g")
                .attr("transform", `translate(${40}, ${0})`)
        );
        this.drawer.drawPause(buttons.append("g"));
        console.log(this.drawer.data);
    };
    this.drawSimpleAnimation = drawSimpleAnimation;
    drawSimpleAnimation();
}