const $ = require("jquery");
const margin = {
    top: 0.01,
    left: 0.01,
    right: 0.01,
    bottom: 0.01,
};

export function timeScale_param() {
    let yearStart = 1450,
        yearEnd = 1965,
        sWidth = $(".main-panel").width() * 0.99 // $(".time-axis").width()
    let containerRange = [0.08 * sWidth, sWidth * (1 - margin.left - margin.right)]
    return {
        domain: [yearStart, yearEnd],
        range: containerRange
    }
}