import { Point } from "./point.js";

export function distanceBetweenRectAndPoint(close, far, point) {
    if (close.x <= point.x && point.x <= far.x && close.y <= point.y && point.y <= far.y) {
        return 0;
    }
    const x = Math.max(close.x, Math.min(point.x, far.x));
    const y = Math.max(close.y, Math.min(point.y, far.y));
    return new Point(x, y).sub(point).len();
}

export function distanceFromCircleToLine(center, r, p, direction) {
    const normal = new Point(direction.y, -direction.x).toOne();
    const d = normal.dot(p.sub(center));
    return normal.mul(d);
}

export function checkCollisionCircleAndRect(center, r, p, extent) {
    const det = center.sub(p);
    const xp = center;
    const yp = p;
    const ye = extent;
    const xr = r;
    let l0, l1;
    if (det.len() < xr + ye.len()) {
        return false;
    }
    if (
        yp.add(ye).sub(xp).len() < xr
        || yp.add(new Point(ye.x, -ye.y)).sub(xp).len() < xr
        || yp.add(new Point(-ye.x, ye.y)).sub(xp).len() < xr
        || yp.sub(ye).sub(xp).len() < xr
        || (l0 = distanceFromCircleToLine(xp, xr, yp.sub(ye), new Point(ye.x, 0))).len() < r
        || (l1 = distanceFromCircleToLine(xp, xr, yp.sub(ye), new Point(0, ye.y))).len() < r
        || (l0.add(new Point(ye.x * 2, 0))).len() < r
        || (l1.add(new Point(0, ye.y * 2))).len() < r
    ) {
        return true;
    }
    else {
        return false;
    }
}

export function rayIntersectCircle(circle, o, dir) {
    const [center, r] = [circle.center, circle.r];
    const len = center.sub(o).dot(dir);
    const det = o.add(dir.mul(len));
    const dis = det.sub(center).len();
    if (dis >= r) {
        return null;
    }
    const l = Math.sqrt(r * r - dis * dis);
    if (len - l > 0) return len - l;
    if (len + l > 0) return len + l;
    return null;
}

export function rayIntersectSegment(o, dir, a, b) {
    const t = o.add(dir);
    const oa = a.sub(o);
    const ob = b.sub(o);
    const ta = a.sub(t);
    const tb = b.sub(t);
    const so = ob.cross(oa);
    const st = ta.cross(tb);
    const ratio = so / (so + st);
    if (ratio < 0) {
        return null;
    }
    const intr = o.add(dir.mul(so / (so + st)));
    if (intr.sub(a).dot(intr.sub(b)) > 0) {
        return null;
    }
    return ratio;
}

export function rayIntersectRect(rect, o, dir) {
    const rectE = [rect.center.x - rect.extent.x, rect.center.x + rect.extent.x, rect.center.y - rect.extent.y, rect.center.y + rect.extent.y];
    const r = [];
    r.push(rayIntersectSegment(o, dir, new Point(rectE[0], rectE[2]), new Point(rectE[0], rectE[3])));
    r.push(rayIntersectSegment(o, dir, new Point(rectE[1], rectE[2]), new Point(rectE[1], rectE[3])));
    r.push(rayIntersectSegment(o, dir, new Point(rectE[0], rectE[2]), new Point(rectE[1], rectE[2])));
    r.push(rayIntersectSegment(o, dir, new Point(rectE[0], rectE[3]), new Point(rectE[1], rectE[3])));
    for (let i = 0; i < 4; ++i) {
        if (r[i] === null) {
            r[i] = Infinity;
        }
    }
    r.sort((a, b) => a - b);
    if (r[0] !== Infinity) {
        return r[0];
    }
    return null;
}

export function getRayCircleInterval(circle, o, dir) {
    const r = rayIntersectCircle(circle, o, dir);
    if (r === null) {
        return null;
    }
    return [r, Infinity];
}

export function getRayRectInterval(rect, o, dir) {
    const r = rayIntersectRect(rect, o, dir);
    if (r === null) {
        return null;
    }
    return [r, Infinity];
}

export function horizonCircleMoveIntersect(center, r, y, xrange, dir) {
    if (dir.y === 0) {
        return [[0, 0], [false, false]];
    }
    let intr = [(center.y + r - y) / dir.y, (center.y - r - y) / dir.y];
    const xr0 = [xrange[0] + dir.x * intr[0], xrange[1] + dir.x * intr[0]];
    const xr1 = [xrange[0] + dir.x * intr[1], xrange[1] + dir.x * intr[1]];
    const xc = center.x;
    let flag = [xr0[0] < xc && xr0[1] > xc, xr1[0] < xc && xr1[1] > xc];
    if (intr[0] > intr[1]) {
        intr = [intr[1], intr[0]];
        flag = [flag[1], flag[0]];
    }
    return [intr, flag];
}

export function verticalCircleMoveIntersect(center, r, x, yrange, dir) {
    if (dir.x === 0) {
        return [[0, 0], [false, false]];
    }
    let intr = [(center.x + r - x) / dir.x, (center.x - r - x) / dir.x];
    const yr0 = [yrange[0] + dir.y * intr[0], yrange[1] + dir.y * intr[0]];
    const yr1 = [yrange[0] + dir.y * intr[1], yrange[1] + dir.y * intr[1]];
    const yc = center.y;
    let flag = [yr0[0] < yc && yr0[1] > yc, yr1[0] < yc && yr1[1] > yc];
    if (intr[0] > intr[1]) {
        intr = [intr[1], intr[0]];
        flag = [flag[1], flag[0]];
    }
    return [intr, flag];
}

export function cornerCircleMoveIntersect(center, r, p, dir) {
    const prj = center.sub(p).dot(dir);
    const vp = p.add(dir.mul(prj));
    const lc = center.sub(vp).len();
    if (lc >= r) {
        return null;
    }
    const l = Math.sqrt(r * r - lc * lc);
    const intr = [-l + prj, l + prj];
    return intr;   
}

export function getRectCircleIntersectInterval(rect, circle, dir) {
    const start = [];
    const end = [];
    // check 4 edges and 4 corners
    const rectE = [rect.center.x - rect.extent.x, rect.center.x + rect.extent.x, rect.center.y - rect.extent.y, rect.center.y + rect.extent.y];

    const edgeR = [];
    edgeR.push(horizonCircleMoveIntersect(circle.center, circle.r, rectE[2], [rectE[0], rectE[1]], dir));
    edgeR.push(horizonCircleMoveIntersect(circle.center, circle.r, rectE[3], [rectE[0], rectE[1]], dir));
    edgeR.push(verticalCircleMoveIntersect(circle.center, circle.r, rectE[0], [rectE[2], rectE[3]], dir));
    edgeR.push(verticalCircleMoveIntersect(circle.center, circle.r, rectE[1], [rectE[2], rectE[3]], dir));
    for (let i = 0; i < 4; ++i) {
        const r = edgeR[i];
        if (r[1][0]) start.push(r[0][0]);
        if (r[1][1]) end.push(r[0][1]);
    }

    for (let i = 0; i < 2; ++i) {
        for (let j = 2; j < 4; ++j) {
            const r = cornerCircleMoveIntersect(circle.center, circle.r, new Point(rectE[i], rectE[j]), dir);
            if (r !== null) {
                start.push(r[0]);
                end.push(r[1]);
            }
        }
    }
    start.sort((a, b) => a - b);
    end.sort((a, b) => a - b).reverse();
    if (start.length === 0 || end.length === 0 || start[0] == end[0]) {
        return null;
    }
    return [start[0], end[0]];
}

export function getRectRectIntersectInterval(label, obs, dir) {
    const labelE = [label.center.x - label.extent.x, label.center.x + label.extent.x, label.center.y - label.extent.y, label.center.y + label.extent.y];
    const obsE = [obs.center.x - obs.extent.x, obs.center.x + obs.extent.x, obs.center.y - obs.extent.y, obs.center.y + obs.extent.y];
    const r = [-Infinity, Infinity];
    if (dir.x !== 0) {
        const e = [];
        for (let i = 0; i < 2; ++i) {
            for (let j = 0; j < 2; ++j) {
                e.push((obsE[i] - labelE[j]) / dir.x);
            }
        }
        e.sort((a, b) => a - b);
        r[0] = Math.max(r[0], e[0]);
        r[1] = Math.min(r[1], e[3]);
    }
    else {
        if (obsE[1] < labelE[0] || labelE[1] < obsE[0]) {
            r[0] = Infinity;
            r[1] = -Infinity;
        }
    }
    if (dir.y !== 0) {  
        const e = [];
        for (let i = 2; i < 4; ++i) {
            for (let j = 2; j < 4; ++j) {
                e.push((obsE[i] - labelE[j]) / dir.y);
            }
        }
        e.sort((a, b) => a - b);
        r[0] = Math.max(r[0], e[0]);
        r[1] = Math.min(r[1], e[3]);
    }
    else {
        if (obsE[3] < labelE[2] || labelE[3] < obsE[2]) {
            r[0] = Infinity;
            r[1] = -Infinity;
        }
    }
    if (r[0] >= r[1]) {
        return null;
    }
    return r;
}

export class Rect {
    constructor(center, extent) {
        this.center = center;
        this.extent = extent;
    }
    get minCorner() {
        return this.center.sub(this.extent);
    }
    get fullExtent() {
        return this.extent.mul(2);
    }
    checkCollisionRect(rect) {
    }

    drawOnSvg(svgG) {
        if (!this.gEl) this.gEl = svgG.append('rect')
        this.gEl
        .datum(this)
        .attrHelper({
            x: this.minCorner.x,
            y: this.minCorner.y,
            width: this.fullExtent.x,
            height: this.fullExtent.y,
            fill: 'white',
            stroke: 'black',
        });
    }

}

export class Circle {
    constructor(center, r) {
        this.center = center;
        this.r = r;
    }
    checkCollisionRect(rect) {
        return checkCollisionCircleAndRect(this.center, this.r, rect.center, rect.extent);
    }

    drawOnSvg(svgG) {
        if (!this.gEl) this.gEl = svgG.append('circle');
        this.gEl
        .datum(this)
        .attrHelper({
            cx: this.center.x,
            cy: this.center.y,
            r: this.r,
            fill: 'white',
            stroke: 'black',
        });
    }
}