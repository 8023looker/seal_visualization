const $ = require("jquery");
import * as TypeColor from "@/theme/type_color";

export function getCollectorColor(data) { // copied from timeline.vue
    for (let i in data['collectors']) {
        data['collectors'][i]['collector_color'] = TypeColor.color_list[data['collectors'][i]['collector_name']]
        for (let j in data['collectors'][i]['seals']) {
            data['collectors'][i]['seals'][j]['collector_color'] = TypeColor.color_list[data['collectors'][i]['collector_name']]
        }
    }
    return data
}