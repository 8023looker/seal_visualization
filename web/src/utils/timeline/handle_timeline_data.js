import * as d3 from "d3";
const $ = require("jquery");

import { jsonCopy } from "@/utils/copy";
import * as TimescaleParam from "@/utils/timescale_param";
import * as TypeColor from "@/theme/type_color";

export function getCardListSubset(card_list, selection) {
    let card_list_subset = []
    if (selection.value.length === 0) {
        return card_list
    } else {
        for (let i in card_list) {
            if (selection.value.includes(card_list[i]['index'])) {
                card_list_subset.push(card_list[i])
            }
        }
        return card_list_subset
    }
}