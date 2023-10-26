import constant from "./constant.js";
import jiggle from "./jiggle.js";
import lcg from "./lcg.js";

function index(d) {
    return d.index;
}

function find(nodeById, nodeId) {
    var node = nodeById.get(nodeId);
    if (!node) throw new Error("node not found: " + nodeId);
    return node;
}

function default_distance(link) {
    return link.source.r + link.target.r + 30;
}

export class LinkForce {
    constructor(nodes, links) {
        this.nodes = nodes;
        this.links = links;
        this.cur_nodes = [];

        this.id = index;
        this.strength = this.default_strength;
        this.strengths = null;
        this.distance = default_distance;
        this.distances = null;
        this.count = null;
        this.bias = null;
        this.random = lcg();
        this.iterations = 1;

        this.construct();
    }

    construct() {
        var i,
            n = this.nodes.length,
            m = this.links.length,
            link;

        for (i = 0, this.count = new Array(n); i < m; ++i) {
            link = this.links[i];
            this.count[link.source.node_idx] =
                (this.count[link.source.node_idx] || 0) + 1;
            this.count[link.target.node_idx] =
                (this.count[link.target.node_idx] || 0) + 1;
        }

        for (i = 0, this.bias = new Array(m); i < m; ++i) {
            link = this.links[i];
            this.bias[i] =
                this.count[link.source.node_idx] /
                (this.count[link.source.node_idx] +
                    this.count[link.target.node_idx]);
        }

        this.strengths = new Array(m);
        this.initialize_strength();
        this.distances = new Array(m);
        this.initialize_distance();
    }

    initialize(sub_tree) {
        this.cur_nodes = sub_tree.inner.concat(sub_tree.border);
    }

    default_strength(link) {
        return (
            0.1 /
            Math.min(
                this.count[link.source.node_idx],
                this.count[link.target.node_idx]
            )
        );
    }

    force(alpha) {
        this.cur_nodes.forEach((node) => {
            this.links
                .filter(
                    (link) =>
                        link.source.node_idx === node.node_idx ||
                        link.target.node_idx === node.node_idx
                )
                .forEach((link) => {
                    let target;
                    if (node.node_idx === link.source.node_idx)
                        target = link.target;
                    else target = link.source;
                    let x =
                        target.x + target.vx - node.x - node.vx ||
                        jiggle(this.random);
                    let y =
                        target.y + target.vy - node.y - node.vy ||
                        jiggle(this.random);
                    let l = Math.sqrt(x * x + y * y);
                    l =
                        ((l - this.distances[link.edge_idx]) / l) *
                        alpha *
                        this.strengths[link.edge_idx];
                    x *= l;
                    y *= l;
                    let b = this.bias[link.edge_idx];

                    node.vx += x * (1 - b);
                    node.vy += y * (1 - b);
                });
        });
    }

    initialize_strength() {
        for (var i = 0, n = this.links.length; i < n; ++i) {
            this.strengths[i] = +this.strength(this.links[i], i, this.links);
        }
    }

    initialize_distance() {
        for (var i = 0, n = this.links.length; i < n; ++i) {
            this.distances[i] = +this.distance(this.links[i], i, this.links);
        }
    }
}

export default function (links) {
    var id = index,
        strength = defaultStrength,
        strengths,
        distance = constant(30),
        distances,
        nodes,
        count,
        bias,
        random,
        iterations = 1;

    if (links == null) links = [];

    function defaultStrength(link) {
        return 1 / Math.min(count[link.source.index], count[link.target.index]);
    }

    function force(alpha) {
        for (var k = 0, n = links.length; k < iterations; ++k) {
            for (var i = 0, link, source, target, x, y, l, b; i < n; ++i) {
                (link = links[i]),
                    (source = link.source),
                    (target = link.target);
                x =
                    target.x + target.vx - source.x - source.vx ||
                    jiggle(random);
                y =
                    target.y + target.vy - source.y - source.vy ||
                    jiggle(random);
                l = Math.sqrt(x * x + y * y);
                l = ((l - distances[i]) / l) * alpha * strengths[i];
                (x *= l), (y *= l);
                target.vx -= x * (b = bias[i]);
                target.vy -= y * b;
                source.vx += x * (b = 1 - b);
                source.vy += y * b;
            }
        }
    }

    function initialize() {
        if (!nodes) return;

        var i,
            n = nodes.length,
            m = links.length,
            nodeById = new Map(nodes.map((d, i) => [id(d, i, nodes), d])),
            link;

        for (i = 0, count = new Array(n); i < m; ++i) {
            (link = links[i]), (link.index = i);
            if (typeof link.source !== "object")
                link.source = find(nodeById, link.source);
            if (typeof link.target !== "object")
                link.target = find(nodeById, link.target);
            count[link.source.index] = (count[link.source.index] || 0) + 1;
            count[link.target.index] = (count[link.target.index] || 0) + 1;
        }

        for (i = 0, bias = new Array(m); i < m; ++i) {
            (link = links[i]),
                (bias[i] =
                    count[link.source.index] /
                    (count[link.source.index] + count[link.target.index]));
        }

        (strengths = new Array(m)), initializeStrength();
        (distances = new Array(m)), initializeDistance();
    }

    function initializeStrength() {
        if (!nodes) return;

        for (var i = 0, n = links.length; i < n; ++i) {
            strengths[i] = +strength(links[i], i, links);
        }
    }

    function initializeDistance() {
        if (!nodes) return;

        for (var i = 0, n = links.length; i < n; ++i) {
            distances[i] = +distance(links[i], i, links);
        }
    }

    force.initialize = function (_nodes, _random) {
        nodes = _nodes;
        random = _random;
        initialize();
    };

    force.links = function (_) {
        return arguments.length ? ((links = _), initialize(), force) : links;
    };

    force.id = function (_) {
        return arguments.length ? ((id = _), force) : id;
    };

    force.iterations = function (_) {
        return arguments.length ? ((iterations = +_), force) : iterations;
    };

    force.strength = function (_) {
        return arguments.length
            ? ((strength = typeof _ === "function" ? _ : constant(+_)),
              initializeStrength(),
              force)
            : strength;
    };

    force.distance = function (_) {
        return arguments.length
            ? ((distance = typeof _ === "function" ? _ : constant(+_)),
              initializeDistance(),
              force)
            : distance;
    };

    return force;
}
