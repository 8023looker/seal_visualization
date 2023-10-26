import { type_color } from "@/theme";

export default function (svg, data) {
    console.log(data);

    let is_node_leaf = data.is_node_leaf;

    // data.nodes.forEach((d) => {
    //     if (!d.x) {
    //         console.log(d);
    //     }
    // });

    svg.append("defs")
        .append("marker")
        .attr("id", `arrow`)
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", 15)
        .attr("refY", -0.5)
        .attr("markerWidth", 6)
        .attr("markerHeight", 6)
        .attr("orient", "auto")
        .append("path")
        .attr("fill", "#ddd")
        .attr("d", "M0,-5L10,0L0,5");

    const edge = svg
        .append("g")
        .selectAll("g")
        .data(data.edges)
        .join("g")
        .attr("fill", "none")
        .attr("stroke", "#ddd")
        .attr("stroke-width", (d) => d.weight / 2);

    const leaf = svg
        .append("g")
        .selectAll("g")
        .data(
            data.nodes.filter(
                (d) =>
                    !(
                        d.level === 0 &&
                        (d.name_type === "lib-unk" ||
                            d.name_type === "lib" ||
                            d.name_type === "lib-agt")
                    )
            )
        )
        .join("g")
        .attr("transform", (d) => `translate(${d.x}, ${d.y})`);
    leaf.append("circle")
        .attr("r", (d) => d.br)
        // .attr("fill", (d) => (is_node_leaf(d) ? "lightblue" : "none"))
        .attr("fill", (d) =>
            is_node_leaf(d) ? type_color.library[d.lib_type] : "none"
        )
        .attr("stroke", (d) => (is_node_leaf(d) ? "none" : "#aaa"))
        .attr("stroke-width", (d) => (is_node_leaf(d) ? "none" : 0.5));

    leaf.filter((d) => is_node_leaf(d))
        .append("text")
        .attr("text-anchor", "middle")
        .attr("fill", "black")
        .attr("font-size", 7)
        .text((d) => d.name);

    edge.append("path").attr("d", (d) => get_edge_arc(d.source, d.target));
    edge.append("path")
        .attr("d", (d) => get_edge_arc(d.source, d.target))
        .attr("stroke-width", (d) =>
            Math.sqrt(d.weight) < 3 ? Math.sqrt(d.weight) : 3
        )
        .attr("marker-end", (d) => `url(${new URL(`#arrow`, location)})`);
    // .attr("stroke-dasharray", function (d) {
    //     // make a segment for an arrowhead.
    //     const head_offset = d.target.br + 5 * d.weight;
    //     const len = this.getTotalLength() - head_offset;
    //     if (!isFinite(len)) return;
    //     d.seg_beg = this.getPointAtLength(len - 1e-3);
    //     d.seg_end = this.getPointAtLength(len);
    //     return len + " " + head_offset;
    // });

    // // move edge-heads
    // edge.append("path").attr("d", (d) =>
    //     d.seg_beg
    //         ? "M" +
    //           d.seg_beg.x +
    //           "," +
    //           d.seg_beg.y +
    //           " L" +
    //           d.seg_end.x +
    //           "," +
    //           d.seg_end.y
    //         : ""
    // );
}

function get_edge_arc(n0, n1) {
    let edge_curvature = 0.8;

    const dx = n1.x - n0.x;
    const dy = n1.y - n0.y;
    const c = Math.sqrt(dx * dx + dy * dy) * edge_curvature;
    return (
        "M" +
        n0.x +
        "," +
        n0.y +
        "A" +
        c +
        "," +
        c +
        " 0 0,1 " +
        n1.x +
        "," +
        n1.y
    );
}
