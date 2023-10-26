import * as d3 from "d3";
import { Point } from "@/data/geo/geometry";

let cachedResult = null;

export function SRC(d) {
  // return [d.src_x_coord, d.src_y_coord];
  return d.src;
}

export function DST(d) {
  // return [d.dst_x_coord, d.dst_y_coord];
  return d.dst;
}

function distance(a, b) {
  return Math.sqrt((a[0] - b[0]) * (a[0] - b[0]) + (a[1] - b[1]) * (a[1] - b[1]));
}


export function ODSample(odData, theta, selectNum, polygon = null, longSkipCondition) {
  // let srcKdTree = new kdTree(odData.map((d, i) => ({id: i, x: SRC(d)[0], y: SRC(d)[1]})), distance_kdTree, ['x', 'y']);
  // let dstKdTree = new kdTree(odData.map((d, i) => ({id: i, x: DST(d)[0], y: DST(d)[1]})), distance_kdTree, ['x', 'y']);
  if (cachedResult) {
    console.log("cached");
    return cachedResult;
  }
  let candidate = [];
  let selected = [];
  // console.log(polygon);
  let skip = d3.range(odData.length);
  let short_skip = d3.range(odData.length);
  const shortThreshold = 0.2;
  for (let i = 0; i < odData.length; ++i) {
    skip[i] = false;
    if (!longSkipCondition) {
      short_skip[i] = (distance(SRC(odData[i]), DST(odData[i])) < shortThreshold);
    }
    else {
      short_skip[i] = distance(SRC(odData[i]), DST(odData[i])) > longSkipCondition || distance(SRC(odData[i]), DST(odData[i])) < shortThreshold / 2;
    }

    if (polygon) {
      if (!d3.polygonContains(polygon, SRC(odData[i])) && !d3.polygonContains(polygon, DST(odData[i]))) {
        skip[i] = true;
      }
    }
  }
  for (let i = 0; i < odData.length; ++i) {
    if (skip[i] || short_skip[i]) {
      continue;
    }
    let cur = {};
    candidate.push(cur);
    let src_x = 0, src_y = 0, dst_x = 0, dst_y = 0;
    let cnt = 0;
    let counter = [{}, {}];
    let personList = [];
    for (let j = 0; j < odData.length; ++j) {
      if (skip[j] || short_skip[j]) {
        continue;
      }
      let sd = distance(SRC(odData[i]), SRC(odData[j]));
      let dd = distance(DST(odData[i]), DST(odData[j]));
      const aggregateThreshold = distance(SRC(odData[i]), DST(odData[i])) * theta;
      if (sd <= aggregateThreshold && dd <= aggregateThreshold) {
        cnt += 1;
        src_x += odData[j].src.x;
        src_y += odData[j].src.y;
        dst_x += odData[j].dst.x
        dst_y += odData[j].dst.y;
        if (!counter[0][odData[j].src_name]) {
          counter[0][odData[j].src_name] = 0;
        }
        counter[0][odData[j].src_name]++;
        if (!counter[1][odData[j].dst_name]) {
          counter[1][odData[j].dst_name] = 0;
        }
        counter[1][odData[j].dst_name]++;
        personList.push(odData[j]);
      }
      if (sd < aggregateThreshold / 3 && dd < aggregateThreshold / 3) {
        skip[j] = true;
      }
    }
    cur.value = cnt;
    cur.src = new Point(src_x / cnt, src_y / cnt);
    cur.dst = new Point(dst_x / cnt, dst_y / cnt);
    cur.ang = SRC(cur).sub(DST(cur)).angle();
    cur.counter = counter.map(c => Object.entries(c).sort((a, b) => b[1] - a[1]).slice(0, 5));
    cur.personList = personList;
  }
  candidate.sort((a, b) => a.value - b.value);
  candidate.reverse();
  // console.log(candidate);
  for (let i = 0; i < selectNum; ++i) {
    for (let j = 0; j < candidate.length; ++j) {
      let flag = true;
      for (let k = 0; k < i; ++k) {
        let sd = distance(SRC(candidate[j]), SRC(selected[k]));
        let dd = distance(DST(candidate[j]), DST(selected[k]));
        const aggregateThreshold = (distance(SRC(candidate[j]), DST(candidate[j])) + selected[k].src.sub(selected[k].dst).len()) * theta / 2;
        if (sd < aggregateThreshold && dd < aggregateThreshold) {
          flag = false;
          break;
        }
      }
      if (flag) {
        candidate[j].id = i;
        selected.push(candidate[j]);
        break;
      }
    }
  }
  // console.log(selected);
  let points = [[], []]
  for (let i = 0; i < odData.length; ++i) {
    if (!short_skip[i]) {
      points[0].push(SRC(odData[i]));
      points[1].push(DST(odData[i]));
    }
  }
  cachedResult = [selected, points];
  return [selected, points];
}
