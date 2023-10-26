export class FastPair {
  constructor() {
    this.objects = [];
    this.nearestNeighbor = new Map();
    this.distanceFunc = (a, b) => 0;
  }

  setDistanceFunc(func) {
    this.distanceFunc = func;
  }

  build() {
    for (let i = 0, n = this.objects.length; i < n - 1; i++) {
      let minVal = Infinity;
      let minIdx = i + 1;
      for (let j = i + 1; j < n; ++j) {
        const dist = this.distanceFunc(this.objects[i], this.objects[j]);
        if (dist < minVal) {
          minVal = dist;
          minIdx = j;
        }
      }
      this.nearestNeighbor.set(this.objects[i], this.objects[minIdx]);
      [this.objects[i + 1], this.objects[minIdx]] = [this.objects[minIdx], this.objects[i + 1]];
    }
  }

  searchNearest(obj, arr) {
    let minVal = Infinity;
    let minObj = null;
    for (let i of arr) {
      if (i === obj) continue;
      const dist = this.distanceFunc(obj, i);
      if (dist < minVal) {
        minVal = dist;
        minObj = i;
      }
    }
    return minObj;
  }

  add(obj) {
    this.objects.push(obj);
    this.nearestNeighbor.set(obj, this.searchNearest(obj, this.objects));
  }

  remove(obj) {
    const idx = this.objects.findIndex((o) => o === obj);
    this.objects.splice(idx, 1);
    for (let i of this.objects) {
      if (this.nearestNeighbor.get(i) === obj) {
        this.nearestNeighbor.set(i, this.searchNearest(i, this.objects));
      }
    }
  }

  getClosestPair() {
    let minVal = Infinity;
    let minObjs = [null, null];
    for (let i of this.objects) {
      const j = this.nearestNeighbor.get(i);
      if (j) {
        const dist = this.distanceFunc(i, j);
        if (dist < minVal) {
          minVal = dist;
          minObjs = [i, this.nearestNeighbor.get(i)];
        }
      }
    }
    return minObjs;
  }
}