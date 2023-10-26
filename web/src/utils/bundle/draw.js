import { defLinearGradient } from "./gradient.js";

export function draw(data) {
    const width = $("#canvas").width();
    const height = $("#canvas").height();

    console.log(width, height);

    const svg = d3
        .select("#canvas")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    const edge_layer = svg.append("g").attr("id", "edge-layer");
    const node_layer = svg.append("g").attr("id", "node-layer");

    add_defs(svg);
    draw_nodes(node_layer, data);
    draw_edges(edge_layer, data);
}

function add_defs(svg) {
    const defs = svg.append("defs");

    const graph_arrow_path_gradient_params = {
        id: "ArrowPathGradient",
        stops: [
            [0, 0.4, "green"],
            [100, 0.4, "red"],
        ],
    };

    defLinearGradient(defs, graph_arrow_path_gradient_params);
}

function draw_nodes(svg, data) {
    const node_data = data.nodes;

    const node = svg
        .selectAll("g")
        .data(node_data)
        .join("g")
        .attr("transform", (d) => `translate(${d.x}, ${d.y})`);
    node.filter((d) => d.lib_type === undefined)
        .append("circle")
        .attr("r", (d) => d.br)
        .attr("fill", "none")
        .attr("stroke", "gray")
        .attr("stroke-dasharray", "5,5");
    node.filter((d) => d.lib_type !== undefined)
        .append("circle")
        // .attr("r", (d) => d.br)
        .attr("r", 4)
        .attr("fill", "silver");
}

function draw_edges(svg, data) {
    const edge_data = data.bundle_edges;
    const edge = svg.selectAll("g").data(edge_data).join("g");

    edge.append("path")
        .attr("d", (d) => d.bundle_path)
        .attr("fill", "none")
        .attr("stroke", "gray")
        // .attr("stroke", "url(#ArrowPathGradient)")
        .attr("stroke-width", 0.5)
        .attr("stroke-opacity", 0.4);
}
