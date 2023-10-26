export function defLinearGradient(defs, params) {
    const { id, stops } = params;
    const linearGradient = defs.append("linearGradient").attr("id", id);
    for (let stop of stops) {
        linearGradient
            .append("stop")
            .attr("offset", `${stop[0]}%`)
            .attr("stop-color", stop[2])
            .attr("stop-opacity", stop[1]);
    }
    return linearGradient;
}
