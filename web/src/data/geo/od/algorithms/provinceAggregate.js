// arrange the arrow pattern and generate labels
export function arrowAggregation(arrowsInput, projection) {
  let geoData = getChinaGeojson();
  let bin = {};
  let labelCandidate = [];
  let idx = 0;

  let arrows = JSON.parse(JSON.stringify(arrowsInput));

  for (let i of geoData.features) {
    bin[idx] = [];
    labelCandidate[idx] = {};
    let cl = labelCandidate[idx];
    let centroid = i.properties.cp;
    for (let j of arrows) {
      if (d3.polygonContains(getPolygon(i), [j.src_x_coord, j.src_y_coord])) {
        j.src_x_coord = centroid[0];
        j.src_y_coord = centroid[1];
        for (let k of j.counter[0]) {
          cl[k[0]] = (cl[k[0]] || 0) + k[1];
        }
      }
      if (d3.polygonContains(getPolygon(i), [j.dst_x_coord, j.dst_y_coord])) {
        j.dst_x_coord = centroid[0];
        j.dst_y_coord = centroid[1];
        bin[idx].push([SRC(j).sub(DST(j)).len(), j])
        for (let k of j.counter[1]) {
          cl[k[0]] = (cl[k[0]] || 0) + k[1];
        }
      }
    }
    idx += 1;
  }
  //delete inner-province migration
  let tmpNewArrows = [];
  for (let i of arrows) {
    if (SRC(i).sub(DST(i)).len() > 1e-2) {
      tmpNewArrows.push(i)
    }
  }
  arrows = tmpNewArrows;
  for (let i of arrows) {
    [i.src_x_coord, i.src_y_coord] = projection(SRC(i));
    [i.dst_x_coord, i.dst_y_coord] = projection(DST(i));
    i.ang = SRC(i).sub(DST(i)).angle();
  }
  idx = 0;
  for (let i of geoData.features) {
    let posCandidate = {};
    //selected representative location names
    let cl = Object.entries(labelCandidate[idx]).sort((a, b) => b[1] - a[1]);
    let selectedLabel = [];
    let selectedCnt = 0;
    for (let j of cl) {
      let selectFlag = true;
      for (let k of selectedLabel) {
        if (j[0].includes(k[0]) || k[0].includes(j[0])) {
          selectFlag = false;
        }
      }
      if (selectFlag) {
        selectedLabel.push(j);
        if (++selectedCnt >= 4) {
          break;
        }
      }
    }
    selectedLabel.sort((a, b) => a[0].length - b[0].length);
    labelCandidate[idx] = {
      labels: selectedLabel,
      pos: projection(i.properties.cp),
      name: i.properties.name,
    };
    bin[idx].sort((a, b) => (a - b));
    console.assert(bin[idx].length <= 12);

    for (let j of bin[idx]) {
      j[1].ang = SRC(j[1]).sub(DST(j[1])).angle();
      let base = j[1].ang;
      if (base < 0) {
        base += Math.PI * 2;
      }
      base = Math.round(base / (Math.PI / 6));
      base = base % 12;
      // console.log(base);
      for (let k = 0; k <= 6; ++k) {
        if (!(((base + k + 12) % 12) in posCandidate)) {
          posCandidate[(base + k + 12) % 12] = j;
          j[1].dAng = Math.PI / 6 * ((base + k + 12) % 12) - j[1].ang;
          break;
        }
        if (!(((base - k + 12) % 12) in posCandidate)) {
          posCandidate[(base - k + 12) % 12] = j;
          j[1].dAng = Math.PI / 6 * ((base - k + 12) % 12) - j[1].ang;
          break;
        }
      }
    }

    let foremostEmpty = 0;
    let maxContinueEmpty = 0,
      bestAngle = 0;
    for (let j = 0; j < 24; ++j) {
      if (!((j % 12) in posCandidate)) {
        let det = (j - foremostEmpty + 24) % 12;
        let ang = (foremostEmpty * 2 + det) * Math.PI / 12;
        if (j - foremostEmpty > maxContinueEmpty) {
          maxContinueEmpty = j - foremostEmpty;
          bestAngle = ang;
        }
      } else {
        foremostEmpty = j + 1;
      }
    }
    if (maxContinueEmpty >= 12) {
      labelCandidate[idx].labels = [];
    } else {
      labelCandidate[idx].ang = bestAngle;
    }
    idx += 1;
  }
  return { arrows, labels: labelCandidate };
}