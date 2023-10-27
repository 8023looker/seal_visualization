import * as d3 from "d3";
import { jsonCopy } from "@/utils/copy";

let data_

export async function load_data() {
    data_ = await d3.json("data/seal_constructed_data.json")
}

// 从此函数来获得原始数据
export function read_data() {
    return jsonCopy(data_)
}