import * as d3 from "d3";
import { Point } from "@/data/geo/geometry";
import { rectNonOverlap, rectCircleNonOverlap } from "@/data/geo/physics/dynamics"

const cache = {};
let keyCache = {};
const BASE = 307;
const MOD = 998244353

export class LabelManager {
  constructor(args) {
    this.objects = [];
    this.idCnt = 0;
    this.links = [];

    this.checksumMethod = (args && ['hash', 'key'].includes(args.checksumMethod)) ? args.checksumMethod : 'hash';
    this.checksum = 0;


    this.onEndFunc = () => { };
    this.iterN = 300;

    this.labelForceSimulation = d3.forceSimulation()
      .alphaDecay(0.128)
      .alpha(0.3)
      .alphaMin(0.0000001)
    this.labelForceSimulation.stop();
    this.linksForce = d3.forceLink().distance(0);
    this.labelForceSimulation.force("links", this.linksForce);
    // this.labelForceSimulation.force("charge", d3.forceManyBody().strength(-200));
    // this.labelForceSimulation.force("collision", RectAndCircleCollision());
    // this.labelForceSimulation.force("collision", rectCollide());
    this.labelForceSimulation.force("collision", forceCollide());
    this.quadTree = null;
  }



  setTimeBudget(tb, n) {
    this.iterN = Math.floor(tb / (n || this.objects.length)) * 100;
    this.labelForceSimulation.alphaDecay(1 - Math.pow(0.001, 1 / this.iterN));
  }

  /**
   * width and height should be the same if type == 1
   * 0 for rect, 1 for circle
   */

  addObject(x, y, width, height, type, staticFlag, key) {
    const extent = new Point(width / 2, height / 2);
    const start = new Point(x, y);
    const r = extent.len();
    const obj =
      Object.assign(new Point(x + width / 2, y + height / 2),
        {
          index: this.idCnt++,
          r,
          start,
          extent,
          type, 
          staticFlag,
          key
        });
    this.objects.push(obj);
    return obj;
  }

  getChecksum() {
    let s = 0;
    for (let i of arguments) {
      const istr = i.toString()
      for (let j = 0; j < istr.length; ++j) {
        s = (s * BASE + istr.charCodeAt(j)) % MOD;
      }
    }
    this.checksum ^= s;
  }

  addStaticObject(x, y, width, height, type, key = "") {
    if (this.checksumMethod === 'hash') {
      this.getChecksum(...arguments);
    }
    else {
      this.getChecksum(key);
    }
    const obj = this.addObject(x, y, width, height, type, true, key + "---object");
    obj.fx = x;
    obj.fy = y;
    return obj;
  }

  addLabel(x, y, width, height, type, staticObj, key = "") {
     if (this.checksumMethod === 'hash') {
      this.getChecksum(...(Array.from(arguments).slice(2)));
    }
    else {
      this.getChecksum(key);
    }
    const obj = this.addObject(x, y, width, height, type, false, key + "---label");
    if (staticObj) {
      this.links.push({
        source: obj,
        target: staticObj,
      })
    }
    return obj;
  }

  initializeSimulation() {
    if (this.checksumMethod === 'hash' && this.checksum in cache) {
      const target = cache[this.checksum];
      for (let i = 0; i < this.objects.length; ++i) {
        this.objects[i].x = target[i].x;
        this.objects[i].y = target[i].y;
      }
      this.onEndFunc();
      return;
    }
    else if (this.checksumMethod === 'key') {
      let missingFlag = false;
      for (let i = 0; i < this.objects.length; ++i) {
        if (!(this.objects[i].key in keyCache)) {
          missingFlag = true;
        }
      }
      if (!missingFlag) {
        for (let i = 0; i < this.objects.length; ++i) {
          this.objects[i].x = keyCache[this.objects[i].key].x;
          this.objects[i].y = keyCache[this.objects[i].key].y;
        }
        this.onEndFunc(); 
        return;
      }
    }
    this.labelForceSimulation.nodes(this.objects);
    this.linksForce.links(this.links);
    this.labelForceSimulation.alpha(1);
    // this.labelForceSimulation.tick(this.iterN);
    // this.onEndFunc();
    this.labelForceSimulation.restart();
  }

  onTick(func) {
    this.labelForceSimulation.on("tick", func);
  }

  onEnd(func) {
    this.onEndFunc = func;
    this.labelForceSimulation.on("end", () => {
      if (this.checksumMethod === 'hash') {
        cache[this.checksum] = this.objects.map(d => ({ x: d.x, y: d.y }));
      }
      else if (this.checksumMethod === 'key') {
        keyCache = {};
        for (let i of this.objects) {
          keyCache[i.key] = {x : i.x, y : i.y};
        }
      }
      func();
    }
    );
  }
}

function jiggle(random) {
  return (random() - 0.5) * 1e-6;
}


function constant(x) {
  return function () {
    return x;
  };
}




function RectAndCircleCollision() {
  let nodes,
    random,
    strength = 1,
    iterations = 1;

  
  function x(d) {
    return d.x + d.vx;
  }

  function y(d) {
    return d.y + d.vy;
  }

  function force(alpha) {
    let i,
      n = nodes.length,
      tree,
      node,
      px,
      py,
      vx,
      vy,
      xi,
      yi,
      ri,
      ri2,
      alphaCoef = Math.pow(1000, alpha) * 20;
      // alphaCoef = 1;

    for (let k = 0; k < iterations; ++k) {
      tree = d3.quadtree(nodes, x, y).visitAfter(prepare);
      for (i = 0; i < n; ++i) {
        node = nodes[i];
        ri = node.r, ri2 = ri * ri;
        px = node.x; py = node.y;
        vx = node.vx; vy = node.vy;
        xi = node.x + node.vx;
        yi = node.y + node.vy;
        tree.visit(apply);
      }
    }

    function apply(quad, x0, y0, x1, y1) {
      let data = quad.data, rj = quad.r, r = ri + rj;
      if (data) {
        if (data.index > node.index) {
          if (data.type === 1 && node.type === 1) {
            let x = xi - data.x - data.vx,
              y = yi - data.y - data.vy,
              l = x * x + y * y;
              if (l < r * r) {
                if (x === 0) x = jiggle(random), l += x * x;
                if (y === 0) y = jiggle(random), l += y * y;
                l = (r - (l = Math.sqrt(l))) / l * strength;
                const nodedvx = (x *= l) * (r = (rj *= rj) / (ri2 + rj));
                const nodedvy = (y *= l) * r;
                const datadvx = x * (r = 1 - r);
                const datadvy = y * r;
                // console.log(nodedvx, nodedvy, datadvx, datadvy);
                node.vx += nodedvx;
                node.vy += nodedvy;
                data.vx -= datadvx;
                data.vy -= datadvy;
            }
          }
          else if (data.type === 0 && node.type === 0) {
            const [nodedv, datadv] =
              rectNonOverlap(new Point(px, py),
              new Point(vx, vy),
              node.extent,
              new Point(data.x, data.y),
              new Point(data.vx, data.vy),
                data.extent,
                strength * alphaCoef);
            // console.log(nodedv.x, nodedv.y, datadv.x, datadv.y)
            node.vx += nodedv.x;
            node.vy += nodedv.y;
            data.vx += datadv.x;
            data.vy += datadv.y;
          }
          else {
            const [nodedv, datadv] = rectCircleNonOverlap(
              new Point(px, py),
              new Point(vx, vy),
              node.r,
              new Point(data.x, data.y),
              new Point(data.vx, data.vy),
              data.extent,
              strength);
            node.vx += nodedv.x;
            node.vy += nodedv.y;
            data.vx += datadv.x;
            data.vy += datadv.y;
          }
        }
        return;
      }
      return x0 > xi + r || x1 < xi - r || y0 > yi + r || y1 < yi - r;
    }
  }

  function prepare(quad) {
    if (quad.data) return quad.r = quad.data.r;
    for (let i = quad.r = 0; i < 4; ++i) {
      if (quad[i] && quad[i].r > quad.r) {
        quad.r = quad[i].r;
      }
    }
  }

  function initialize() {
    if (!nodes) return;
  }

  force.initialize = function (_nodes, _random) {
    nodes = _nodes;
    random = _random;
    initialize();
  };

  force.iterations = function (_) {
    return arguments.length ? (iterations = +_, force) : iterations;
  };

  force.strength = function (_) {
    return arguments.length ? (strength = +_, force) : strength;
  };


  return force;
}



function forceCollide() {
  let nodes;
  let padding = 20;

  function force(alpha) {
    const quad = d3.quadtree(nodes, d => d.x, d => d.y);
    for (const d of nodes) {
      quad.visit((q, x1, y1, x2, y2) => {
        let updated = false;
        if (q.data && q.data !== d) {
          let x = d.x - q.data.x,
            y = d.y - q.data.y,
            xSpacing = padding + (q.data.extent.x + d.extent.x),
            ySpacing = padding + (q.data.extent.y + d.extent.y),
            absX = Math.abs(x),
            absY = Math.abs(y),
            l,
            lx,
            ly;

          if (absX < xSpacing && absY < ySpacing) {
            l = Math.sqrt(x * x + y * y);

            lx = (absX - xSpacing) / l;
            ly = (absY - ySpacing) / l;

            // the one that's barely within the bounds probably triggered the collision
            if (Math.abs(lx) > Math.abs(ly)) {
              lx = 0;
            } else {
              ly = 0;
            }
            x *= lx * Math.exp(alpha);
            y *= ly * Math.exp(alpha);
            d.x -= x;
            d.y -= y;
            q.data.x += x;
            q.data.y += y;

            updated = true;
          }
        }
        return updated;
      });
    }
  }

  force.initialize = _ => nodes = _;

  return force;
}



function rectCollide() {
  var nodes, sizes, masses
  var size = constant([0, 0])
  var strength = 10;
  var iterations = 1

  function force() {
    var node, size, xi, yi
    var i = -1
    while (++i < iterations) { iterate() }

    function iterate() {
      var j = -1
      var tree = d3.quadtree(nodes, xAcc, yAcc).visitAfter(prepare)

      while (++j < nodes.length) {
        node = nodes[j]
        size = nodes[j].extent;
        xi = xAcc(node)
        yi = yAcc(node)

        tree.visit(apply)
      }
    }

    function apply(quad, x0, y0, x1, y1) {
      var data = quad.data
      var xSize = (size.x + quad.extent.x);
      var ySize = (size.y + quad.extent.y);
      if (data) {
        if (data.index <= node.index) { return }

        var x = xi - xAcc(data)
        var y = yi - yAcc(data)
        var xd = Math.abs(x) - xSize
        var yd = Math.abs(y) - ySize

        if (xd < 5 && yd < 5) {
          var l = Math.sqrt(x * x + y * y)
          var m = 0.5;

          if (Math.abs(xd) < Math.abs(yd)) {
            node.vx -= (x *= xd / l * strength) * m
            data.vx += x * (1 - m)
          } else {
            node.vy -= (y *= yd / l * strength) * m
            data.vy += y * (1 - m)
          }
        }
      }

      return x0 > xi + xSize || y0 > yi + ySize ||
        x1 < xi - xSize || y1 < yi - ySize
    }

    function prepare(quad) {
      if (quad.data) {
        quad.extent = quad.data.extent
      } else {
        quad.extent = [0, 0]
        var i = -1
        while (++i < 4) {
          if (quad[i] && quad[i].extent) {
            quad.extent.x = Math.max(quad.extent.x, quad[i].extent.x);
            quad.extent.y = Math.max(quad.extent.y, quad[i].extent.y);
          }
        }
      }
    }
  }

  function xAcc(d) { return d.x + d.vx }
  function yAcc(d) { return d.y + d.vy }

  force.initialize = function (_) {
    nodes = _;
    if (nodes.length > 0 && !('index' in nodes[0])) {
      for (let i = 0; i < nodes.length; ++i) {
        nodes[i].index = i;
      }
    }
  }


  force.strength = function (_) {
    return (arguments.length ? (strength = +_, force) : strength)
  }

  force.iterations = function (_) {
    return (arguments.length ? (iterations = +_, force) : iterations)
  }

  return force
}