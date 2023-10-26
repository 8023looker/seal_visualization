import * as d3 from "d3";
const $ = require("jquery");

import * as DataProcess from "@/data/timeline/timeline_full/data_process";
import * as RenderAxis from "@/data/timeline/timeline_full/render_axis";
import * as Interaction from "@/data/timeline/timeline_full/interaction";
import { jsonCopy } from "@/utils/copy";
import { color, type_color } from "@/theme";

const margin = {
    top: 0.01,
    left: 0.01,
    right: 0.01,
    bottom: 0.01,
};

const marginSVG = {
    top: 0.05,
    left: 0.01,
    right: 0.01,
    bottom: 0.15,
}
