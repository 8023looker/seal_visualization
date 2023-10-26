import { Point } from "@/data/geo/geometry"
import * as Data from "@/data/Data";
import { FastPair } from "../../composable/fastpair";

let cachedResult = null;


export function circleAggregate(trajs, threshold = 0.5) {
  // return Data.Geo.getCachedCircleAggregation().map((d) => {
  //   const r = new Point(d[0], d[1]);
  //   Object.assign(r, d);
  //   return r;
  // } );
  // if (cachedResult) {
  //   return cachedResult;
  // }
  
  function getPoints(trajData) {
    const pool = [];
    for (let i of trajData) {
      const p = new Point(i.x, i.y);
      p.weight = 1;
      p.trajIds = [i.ori_idx]
      p.placenames = [i.placename]
      p.location_std_set = new Set([i.location_std]);
      p.location_std_array = [i.location_std];
      pool.push(p);
    }
    return pool;
  }

  function bruteForceAggregate(pool) {

    const fastPair = new FastPair();
    fastPair.setDistanceFunc((a, b) => a.sub(b).len());
    fastPair.objects = pool;
    fastPair.build();
    while (true) {
      const minPair = fastPair.getClosestPair();
      const minVal = minPair[0].sub(minPair[1]).len();
      // let minVal = Infinity;
      // let minPair = null;
      // if (pool.length === 1) {
      //   break;
      // }
      // for (let i of pool) {
      //   for (let j of pool) {
      //     if (i === j) continue;
      //     const d = i.sub(j).len();
      //     if (d < minVal) {
      //       minVal = d;
      //       minPair = [i, j];
      //     }
      //   }
      // }

      

      // minVal = 0;
      // minPair = [pool[0], pool[1]];

      if (minVal > threshold) break;

      const i = minPair[0];
      const j = minPair[1];
      const p = i.mul(i.weight).add(j.mul(j.weight)).mul(1 / (i.weight + j.weight));
      p.weight = i.weight + j.weight;
      p.trajIds = i.trajIds.concat(j.trajIds);
      p.placenames = i.placenames.concat(j.placenames);
      p.location_std_set = new Set([...i.location_std_set, ...j.location_std_set]);
      p.location_std_array = [...i.location_std_array, ...j.location_std_array];

      // pool.splice(pool.indexOf(i), 1);
      // pool.splice(pool.indexOf(j), 1);
      // pool.push(p);
      fastPair.remove(minPair[0]);
      fastPair.remove(minPair[1]);
      fastPair.add(p);

    }
    return pool;
  }

  const points = getPoints(trajs);
  const aggregated = bruteForceAggregate(points);

  // cachedResult = aggregated;
  // console.log(aggregated);
  return aggregated;

}