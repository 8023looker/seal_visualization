import { Point } from "@/data/geo/geometry"
import * as Data from "@/data/Data";


export function noAggregate(trajs) {

  function getPoints(trajData) {
    const pool = [];
    for (let i of trajData) {
      const p = new Point(i.x, i.y);
      p.weight = 1;
      p.trajIds = [i.ori_idx]
      p.placenames = [i.placename]
      pool.push(p);
    }
    return pool;
  }

  function bruteForceAggregate(pool) {
    const threshold = 0.5;

    while (true) {
      let minVal = Infinity;
      let minPair = null;
      for (let i of pool) {
        for (let j of pool) {
          if (i === j) continue;
          const d = i.sub(j).len();
          if (d < minVal) {
            minVal = d;
            minPair = [i, j];
          }
        }
      }

      if (minVal > threshold) break;

      const i = minPair[0];
      const j = minPair[1];
      const p = i.mul(i.weight).add(j.mul(j.weight)).mul(1 / (i.weight + j.weight));
      p.weight = i.weight + j.weight;
      p.trajIds = i.trajIds.concat(j.trajIds);
      p.placenames = i.placenames.concat(j.placenames);

      pool.splice(pool.indexOf(i), 1);
      pool.splice(pool.indexOf(j), 1);
      pool.push(p);
    }
    return pool;
  }

  const points = getPoints(trajs);
  return points;
}