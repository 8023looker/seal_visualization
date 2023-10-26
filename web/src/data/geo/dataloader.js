import * as d3 from "d3";
import lodash from "lodash";
import * as topojson from "topojson-client";
import { Point } from "@/data/geo/geometry"

let japanCities;
let japanPrefectures;
let japanBorder;
let chinaProvinces;
let chinaBorder;
let korea;
let books;

let locationDict = new Map();
let cached_circle_aggregation;


async function loadBookData() {
  const trajData = await d3.csv("data/book_traj.csv");
  const locTree = await d3.json("data/loc_tree_generate.json");
  cached_circle_aggregation = await d3.json("data/geo/cached_circle_aggregation.json");
  function findLoc(locTree, path) {
    if (!(path instanceof Array) || path.length < 1) {
      return null
    }
    for (let i in locTree) {
      if (i == path[0]) {
        if (path.length === 1) {
          return (locTree[i].coord?.x === null || locTree[i].coord?.x === '-') ? null : locTree[i].coord;
        }
        else {
          const r = findLoc(locTree[i].children, path.slice(1));
          return r || ((locTree[i].coord?.x === null || locTree[i].coord?.x === '-') ? null : locTree[i].coord);
        }
      }
    }
    return null;
  }
  for (let i of new Set(trajData.map(d => d.location_std))) {
    const r = findLoc(locTree, i.split('-'));
    if (!r) {
      console.log('location not found!!!!!', i['location_std']);
    }
    locationDict.set(i, r);
  }
}

export async function loadGeojson() {
  // chinaProvinces = await d3.json("data/geo/china.json");
  const chinaTopo = await d3.json("data/geo/china.topo.json");
  chinaProvinces = topojson.feature(chinaTopo, 'china');
  chinaBorder = topojson.merge(chinaTopo, chinaTopo.objects.china.geometries);
  // calcProvinceCenter();
  // chinaInlineSouthSeaGeojson = await d3.json("geo/inlinesouthsea.json");
  // chinaSouthSeaGeojson = await d3.json("geo/southsea.json");
  // neighborAreaGeojson = await d3.json("geo/neighborarea.json");
  // for (let i of chinaGeojson.features) {
  //     provinceGeojson[i.properties.name] = await d3.json(`geo/chinaGeometryProvince/${i.properties.id}.json`);
  // }
  const japanTopo = await d3.json("data/geo/japan_cities.json");
  japanTopo.objects.japan_cities.geometries = japanTopo.objects.japan_cities.geometries.filter(d => d.properties.N03_007 != null);
  const bucketedCities = lodash.groupBy(japanTopo.objects.japan_cities.geometries, d => d.properties.N03_001 + '-' + d.properties.N03_003);
  let null03 = [];
  for (let i of Object.keys(bucketedCities).filter(d => (d.split('-')[1] === 'null') || (d.split('-')[1] === '京都市'))) {
    null03 = null03.concat(bucketedCities[i]);
    delete bucketedCities[i];
  }
  Object.assign(bucketedCities, lodash.groupBy(null03, d => d.properties.N03_001 + '-' + d.properties.N03_004));
  console.log(bucketedCities);
  const mergedCities = {};
  for (let i in bucketedCities) {
    mergedCities[i] = topojson.merge(japanTopo, bucketedCities[i]);
    mergedCities[i].properties = bucketedCities[i][0].properties;
  }
  console.log(mergedCities);
  // tokyo = topojson.mesh(japanTopo, japanTopo.objects.japan_cities, (a, b) => a.properties.N03_001 === '東京都' && b.properties.N03_001 === '東京都');
  japanCities = mergedCities;
  
  // tokyo = Object.keys(mergedCities).filter(d => d.split('-')[0] === '東京都').map(d => mergedCities[d]);
  // tokyo = topojson.merge(japanTopo, japanTopo.objects.japan_cities.geometries.filter(d => d.properties.N03_001 === '東京都'));
  // japanCities = topojson.feature(, "japan_cities");
  // japanCities.features = japanCities.features.filter(d => d.properties.N03_007 != null);
  // console.log(tokyo, japanTopo.objects.japan_cities.geometries.filter(d => d.properties.N03_001 === '東京都'));
  // console.log(tokyo);
  korea = await d3.json("data/geo/korea.json");
  const japanPrefecturesTopo = await d3.json("data/geo/japan_prefectures.json")
  japanPrefectures = topojson.feature(japanPrefecturesTopo, "japan_prefectures");
  japanBorder = topojson.merge(japanPrefecturesTopo, japanPrefecturesTopo.objects.japan_prefectures.geometries);
  // console.log(japanPrefectures);
  await loadBookData();

}

export function getGeoFeaturesWithStatistics() {
  const provinces = [].concat(chinaProvinces.features, japanPrefectures.features, korea.features);
  for (let i of provinces) {
    i.properties.in = 0;
    i.properties.out = 0;
    for (let book of Object.values(books)) {
      for (let j = 0; j < book.length; ++j) {
        const containFlag = d3.geoContains(i, [book[j].x, book[j].y]);
        if (containFlag && j !== 0) {
          i.properties.in += 1;
        }
        if (containFlag && j !== book.length - 1) {
          i.properties.out += 1;
        }
      }
    }
    i.properties.balance = i.properties.in - i.properties.out;
  }
  return provinces;
  // function aggregateArrows(vueComponent, provinceSelected, data, provinceSelectedPolygon, projection) {
  //   dispatcher
  //     .dispatch(
  //       Copy.jsonCopy(data),
  //       provinceSelected ? 2 : 4,
  //       provinceSelected ? 10 : 20,
  //       Copy.jsonCopy(provinceSelectedPolygon),
  //     )
  //     .then((d) => {
  //       let { arrows: arrowsAggregated, labels: geoLabels } = Data.arrowAggregation(d[0], projection);
  //       vueComponent.$store.commit("setArrows", arrowsAggregated);
  //       // Layers.Arrows.draw(this, arrowsAggregated);
  //       // Layers.GeoLabels.draw(this, geoLabels);
  //       vueComponent.arrowsLabel = geoLabels;
  //       // this.drawArrows(d[0]);
  //     })
  //     .catch((err) => console.log(err));
  // }
  return

}

export function getAllOD() {
  const odData = [];
  for (let book of Object.values(books)) {
    let last = null;
    for (let j = 0; j < book.length; ++j) {
      const dst = new Point(book[j].x, book[j].y);
      if (last) {
        odData.push({src: last, dst})
      }
      last = dst;
    }
  }
  return odData;

}

export function getTestData() {
  return [chinaBorder, chinaProvinces, japanBorder, japanPrefectures, korea, japanCities];
  // return [].concat(japanPrefectures.features, chinaProvinces.features, korea.features);
}

export function preCalcGeoInfo(drawer) {
  for (let i of chinaProvinces.features) {
    i.properties.bounds = drawer.bounds(i);
  }
  for (let i of japanPrefectures.features) {
    i.properties.bounds = drawer.bounds(i);
  }
}


export function getTestBookData() {
  return books;
}

export function getCachedCircleAggregation() {
  return cached_circle_aggregation;
}

export function augmentTrajectoryData(data) {
  const bookCounter = new Map();
  let last = null;
  for (let i of data) {
    const bookName = i.書名;
    const inBookIndex = bookCounter.get(bookName) || 0;
    const pos = locationDict.get(i.location_std);
    i.x = pos.x;
    i.y = pos.y;
    i.inBookIndex = inBookIndex;
    i.bookName = bookName;
    i.prev = null;
    if (last?.bookName === bookName) {
      last.next = i;
      i.prev = last;
    }
    i.next = null;
    bookCounter.set(bookName, inBookIndex + 1);
    last = i;
  }
  return data;
}