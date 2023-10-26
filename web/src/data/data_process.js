import * as d3 from "d3";
const $ = require("jquery");

export function vhToPx(vh) {
    // 获取视窗高度
    const windowHeight = window.innerHeight;
    // 计算px单位的高度
    return (vh / 100) * windowHeight;
}