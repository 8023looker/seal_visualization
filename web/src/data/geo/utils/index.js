import * as d3 from "d3";

export function getMostFrequentK(array, k) {
    const map = new Map();
    array.forEach((d) => {
        if (map.has(d)) {
            map.set(d, map.get(d) + 1);
        } else {
            map.set(d, 1);
        }
    });
    let sorted = Array.from(map).filter(d => d[0] !== '').sort((a, b) => b[1] - a[1]);
    return sorted.slice(0, k);
}

export function getAtMostCharK(array, k) {
  const map = new Map();
  array.forEach((d) => {
    if (map.has(d)) {
      map.set(d, map.get(d) + 1);
    } else {
      map.set(d, 1);
    }
  });
  let sorted = Array.from(map).filter(d => d[0] !== '').sort((a, b) => b[1] - a[1]);
  if (sorted.length === 0) return [];
  let acc = sorted[0][0].length;
  for (let i = 1; i < sorted.length; ++i) {
    if (acc + sorted[i][0].length > k) {
      return sorted.slice(0, i);
    }
    acc += sorted[i][0].length;
  }
  return sorted;
}

export function truncateMostCharK(str, k) {
  if (str.length <= k) return str;
  return str.slice(0, k - 2) + '...';
}

//split the labels to multiple line trying to squarify the final bounding box
export function squareSplit(labels) {
  let s = d3.sum(labels.map(d => d[0].length));
  let sq = Math.ceil(Math.sqrt(s));
  let r = [];
  let acc = 0;
  for (let i of labels) {
    if (r.length === 0 || acc + 1 + i[0].length > sq) {
      r.push([i]);
      acc = i[0].length;
    } else {
      r[r.length - 1].push(i);
      acc += i[0].length;
    }
  }
  return [r, [d3.max(r, ri => d3.sum(ri, rii => rii[0].length)), r.length]];
}


function getCssStyle(element, prop) {
  return window.getComputedStyle(element, null).getPropertyValue(prop);
}

export function getCanvasFont(el = document.body) {
  const fontWeight = getCssStyle(el, 'font-weight') || 'normal';
  const fontSize = getCssStyle(el, 'font-size') || '16px';
  const fontFamily = getCssStyle(el, 'font-family') || 'Times New Roman';

  return `${fontWeight} ${fontSize} ${fontFamily}`;
}


export function getTextWidth(text, font) {
  // if given, use cached canvas for better performance
  // else, create new canvas
  var canvas = getTextWidth.canvas || (getTextWidth.canvas = document.createElement("canvas"));
  var context = canvas.getContext("2d");
  context.font = font;
  var metrics = context.measureText(text);
  return metrics.width;
};