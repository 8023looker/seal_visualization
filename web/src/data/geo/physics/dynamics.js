import { Point, checkCollisionCircleAndRect } from "@/data/geo/geometry";

function jiggle(random) {
  return (random() - 0.5) * 1e-6;
}


export function rectNonOverlap(xp, xv, xe, yp, yv, ye, strength) {
  const xn = xp.add(xv);
  const yn = yp.add(yv);  
  const det = yn.sub(xn);
  const deta = det.abs();
  const se = xe.add(ye);
  if (deta.x < se.x && deta.y < se.y) {
    const leaved = se.sub(deta);
    let rep = null;
    let coef = 0;
    if (deta.x === 0) deta.x = 1e-6;
    if (deta.y === 0) deta.y = 1e-6;
    if (leaved.x < leaved.y) {
      leaved.y = 0;
      rep = new Point(leaved.x / deta.x * strength, 0);
      coef = ye.x * ye.x  / (ye.x * ye.x + xe.x * xe.x);
    }
    else {
      leaved.x = 0;
      rep = new Point(0, leaved.y / deta.y * strength);
      coef = ye.y * ye.y / (ye.y * ye.y + xe.y * xe.y);
    }
    if (det.x < 0) leaved.x = -leaved.x, rep.x = -rep.x;
    if (det.y < 0) leaved.y = -leaved.y, rep.y = -rep.y;
    const leaven = leaved.toOne();
    const yvr = yv.sub(xv);
    const yvl = leaven.mul(yvr.dot(leaven));
    const xvr = xv.sub(yv);
    const xvl = leaven.mul(xvr.dot(leaven)).mul(-1);
    // return [xvl.sub(rep.mul(1 - coef)), yvl.add(rep.mul(coef))];
    return [rep.mul(1 - coef).mul(-1), rep.mul(coef)];
  }
  const zero = new Point(0, 0);
  return [zero, zero];
}

export function rectCircleNonOverlap(xp, xv, xr, yp, yv, ye, strength) {
  const xn = xp.add(xv);
  const yn = yp.add(yv);  
  const det = yn.sub(xn);
  const zero = new Point(0, 0);
  if (checkCollisionCircleAndRect(xn, xr, yn, ye)) {
    return rectNonOverlap(xp, xv, new Point(xr, xr), yp, yv, ye, strength);
  }
  else {
    return [zero, zero];
  }
  
}