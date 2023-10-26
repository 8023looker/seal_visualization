import * as d3 from "d3";
import lodash from "lodash";
import { Point, Polygon } from "@/data/geo/geometry";


export class simpleOffsetLabelManager {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.objects = [];
        this.idCnt = 0;

        this.fixed = [];
        this.rawValidInterval = [];
        this.validInterval = [];

        this.maxOrder = 0;
        this.order = [];

        this.RAYNUM = 64;
    }

    addObject(x, y, r, labelFlag, width, height) {
        const extent = new Point(width / 2, height / 2)
        const obj = {
            feature: new Polygon.Circle(new Point(x, y), r),
            label: new Polygon.Rect(new Point(0, 0), extent),
        }
        this.objects.push(obj);
        this.fixed.push(false);
        this.validInterval.push([]);
        this.rawValidInterval.push([]);
        this.order.push(0);
        return obj;
    }

    removeInterval(intrs, tar) {
        const newIntrs = [];
        for (let i = 0; i < intrs.length; ++i) {
            const old = intrs[i];
            if (tar[1] <= old[0] || old[1] <= tar[0]) {
                newIntrs.push(old);
            }
            else {
                if (old[0] < tar[0]) {
                    newIntrs.push([old[0], tar[0]]);
                }
                if (tar[1] < old[1]) {
                    newIntrs.push([tar[1], old[1]]);
                }
            }
        }
        return newIntrs;
    }

    getAccValue(intrs) {
        let r = 0;
        for (let i = 0; i < intrs.length; ++i) {
            r += -Math.exp(-intrs[i][1]) + Math.exp(-intrs[i][0])
        }
        return r;
    }

    initialize() {
        const overlap = [];
        for (let i = 0; i < this.objects.length; ++i) {
            overlap.push([]);
            const fi = this.objects[i].feature;
            for (let j = 0; j < this.objects.length; ++j) {
                const fj = this.objects[j].feature;
                overlap[i].push(fi.center.sub(fj.center).len() < fi.r + fj.r);
            }
        }
        for (let i = 0; i < this.objects.length; ++i) {
            this.validInterval[i] = [];
            this.rawValidInterval[i] = [];
            const label = this.getLabelOriginRect(i);
            for (let j of d3.range(this.RAYNUM)) {
                const ang = j * Math.PI * 2 / this.RAYNUM;
                const angD = new Point(Math.cos(ang), Math.sin(ang));
                let intrs = [[0, Infinity]];
                for (let k = 0; k < this.objects.length; ++k) {
                    const obstacle = this.objects[k].feature;
                    const r = Polygon.getRectCircleIntersectInterval(label, obstacle, angD);
                    if (r !== null) {
                        intrs = this.removeInterval(intrs, r);
                    }
                    if (k !== i && !overlap[i][k]) {
                        const r2 = Polygon.getRayCircleInterval(obstacle, label.center, angD);
                        if (r2 !== null) {
                            intrs = this.removeInterval(intrs, r2);
                        }

                    }
                }
                this.validInterval[i].push(intrs);
                this.rawValidInterval[i].push(lodash.cloneDeep(intrs));
            }
        }
    }

    resetInterval() {
        this.validInterval = lodash.cloneDeep(this.rawValidInterval);
    }

    getLabelRect(i, j) {
        const ang = j * Math.PI * 2 / this.RAYNUM;
        const angD = new Point(Math.cos(ang), Math.sin(ang));
        const dmin = this.validInterval[i][j][0][0];
        const label = lodash.cloneDeep(this.objects[i].label);
        label.center = this.objects[i].feature.center.add(angD.mul(dmin));
        return [label, dmin];
    }

    getLabelOriginRect(i) {
        const label = lodash.cloneDeep(this.objects[i].label);
        label.center = this.objects[i].feature.center;
        return label;
    }

    compareAccs(a, b) {
        for (let i = 0; i < a.length; ++i) {
            if (a[i] < b[i]) {
                return -1;
            }
            else if (a[i] > b[i]) {
                return 1;
            }
        }
        return 0;
    }

    findBestRay(indx) {
        function checkInPhiRange(ang, phiC, phiR) {
            return Math.abs(ang - Math.PI * 2 - phiC) <= phiR || 
            Math.abs(ang - phiC) <= phiR || 
            Math.abs(ang + Math.PI * 2 - phiC) <= phiR;
        }

        let bestAccs = [];
        let bestLabel = -1;
        let bestRay = -1;
        let bestDmin = -1;
        for (let i = 0; i < this.objects.length; ++i) {
            if (this.fixed[i] || this.order[i] !== indx) continue;
            for (let j of d3.range(this.RAYNUM)) {
                if (this.validInterval[i][j].length === 0) continue;
                const [obstacle, dmin] = this.getLabelRect(i, j)

                let accs = [];
                let accMin = Infinity;
                for (let k = 0; k < this.objects.length; ++k) {
                    if (this.fixed[k] || k === i) continue;
                    
                    const label = this.getLabelOriginRect(k);
                    const oc = obstacle.center.sub(label.center);
                    const ol = label.extent.len() + obstacle.extent.len()
                    const phiR = Math.asin(ol / oc) * 2;
                    const phiC = Math.atan2(oc.y, oc.x);
                    const lb = Math.ceil((phiC - phiR) / (Math.PI * 2 / this.RAYNUM));
                    const ub = Math.floor((phiC + phiR) / (Math.PI * 2 / this.RAYNUM));

                    let acc = 0;
                    for (let nl = lb; nl <= ub; ++nl) {
                        const l = (nl + this.RAYNUM) % this.RAYNUM;
                    // for (let l of d3.range(this.RAYNUM)) {
                        if (this.validInterval[k][l].length === 0) continue;
                        let intr = this.validInterval[k][l];
                        const kAng = l * Math.PI * 2 / this.RAYNUM;
                        const kAngD = new Point(Math.cos(kAng), Math.sin(kAng));
                        let intersect = Polygon.getRectRectIntersectInterval(label, obstacle, kAngD);
                        if (intersect !== null) {
                            intr = this.removeInterval(intr, intersect);
                        }
                        const r2 = Polygon.getRayRectInterval(obstacle, label.center, kAngD);
                        if (r2 !== null) {
                            intr = this.removeInterval(intr, r2);
                        }
                        const v = this.getAccValue(intr);
                        acc += v;
                        accMin = Math.min(accMin, v);
                    }
                    accs.push(acc);
                }
                accs.sort((a, b) => a - b);

                let compareFlag = (bestLabel === -1);
                if (!compareFlag) {
                    const cv = this.compareAccs(bestAccs, accs);
                    if (cv < 0) compareFlag = true;
                    else if (cv === 0) {
                        if (dmin < bestDmin) compareFlag = true;
                    }
                }
                if (compareFlag) {
                    bestAccs = accs;
                    bestLabel = i;
                    bestRay = j;
                    bestDmin = dmin;
                }
            }
        }
        return [bestLabel, bestRay];
    }

    rayIntersection(indx) {
        for (let i = 0; i < this.objects.length; ++i) {
            console.log(i);
            const [bestLabel, bestRay] = this.findBestRay(indx);
            if (bestLabel === -1) break;
            const [obstacle, dmin] = this.getLabelRect(bestLabel, bestRay);
            this.objects[bestLabel].label = obstacle;
            this.fixed[bestLabel] = true;

            for (let j = 0; j < this.objects.length; ++j) {
                if (j === bestLabel) continue;
                for (let k of d3.range(this.RAYNUM)) {
                    let intr = this.validInterval[j][k];
                    const kAng = k * Math.PI * 2 / this.RAYNUM;
                    const kAngD = new Point(Math.cos(kAng), Math.sin(kAng));
                    const label = this.getLabelOriginRect(j);
                    let intersect = Polygon.getRectRectIntersectInterval(label, obstacle, kAngD);
                    if (intersect !== null) {
                        intr = this.removeInterval(intr, intersect);
                    }
                    const r2 = Polygon.getRayRectInterval(obstacle, label.center, kAngD);
                    if (r2 !== null) {
                        intr = this.removeInterval(intr, r2);
                    }
                    this.validInterval[j][k] = intr;
                }
            }
        }
    }

    iterativeGreedy() {
        this.initialize();
        while (true) {
            let updateFlag = false;
            for (let i = 0; i < this.objects.length; ++i) {
                this.fixed[i] = false;
            }
            this.resetInterval();
            for (let i = this.maxOrder; i >= 0; --i) {
                this.rayIntersection(i);
                const res = new Set();
                for (let j = 0; j < this.objects.length; ++j) {
                    if (this.order[j] === i && this.fixed[j] !== 0) {
                        res.add(j);
                    }
                }
                for (let j of res) {
                    this.order[j] = i + 1;
                    if (i === this.maxOrder) {
                        this.maxOrder += 1;
                        updateFlag = true;
                    }
                }
            }
            break;
            if (!updateFlag) {
                break;
            }
        }
    }

}