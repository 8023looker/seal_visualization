import * as d3 from "d3";

let period_legend = [
    // ['秦', -221, -202],
    // ['西汉', -202, 8],
    // ['', 8, 25],
    // ['东汉', 25, 220],
    // ['三国', 220, 265],
    // ['两晋', 265, 420],
    // ['南北朝', 420, 581],
    // ['隋', 581, 618],
    // ['唐', 618, 907],
    // ['五代十国', 907, 960],
    ['宋', 960, 1271],
    ['元', 1271, 1368],
    ['明', 1368, 1644],
    ['清', 1644, 1912],
    ['民国', 1912, 1950] // 民国
];
let jp_period_legend_old = [
    // ['院政', 1068, 1185],
    ['镰仓', 1185, 1333],
    ['南北朝', 1333, 1392],
    ['室町', 1392, 1573],
    ['织丰', 1573, 1603],
    ['江户', 1603, 1868],
    ['帝国', 1868, 1965]
]

let jp_period_legend = [ // 待添加
    ['平安', 960, 1192],
    // ['镰仓', 1068, 1334],
    ['镰仓', 1192, 1334],
    ['南北朝', 1334, 1392],
    ['室町', 1392, 1603],
    ['江户', 1603, 1869],
    ['明治', 1869, 1912],
    ['大正', 1912, 1927],
    ['昭和', 1927, 1965]
]
// 尝试加入清代的年号数据
let qing_nainhao = [
    ['天命', 1616],
    ['天聪', 1627],
    ['崇德', 1636],
    ['顺治', 1644],
    ['康熙', 1662],
    ['雍正', 1723],
    ['乾隆', 1736],
    ['嘉庆', 1796],
    ['道光', 1821],
    ['咸丰', 1851],
    ['同治', 1862],
    ['光绪', 1875],
    ['宣统', 1909]
]

// 安史之乱（755-763）、靖康之乱（1127）、蒙古兵南侵（1273）、明初大移民（1370-1417）……)
let big_event = [
        ['秦末农民起义', -209],
        // ['王莽篡汉', 6],
        // ['光武中兴', 41],
        ['文景之治', -104],
        ['夷陵之战', 221],
        ['永嘉之乱', 311],
        ['贞观之治', 627],
        ['安史之乱', 755],
        ['陈桥兵变', 960],
        ['靖康之乱', 1127],
        ['襄阳之战', 1267],
        ['明初大移民', 1370],
        ['满清入关', 1644]
    ]

let od_data = {};

export function getDataByTimeRange(l, r) {
    return od_data.filter(d => (+d.index_year >= l && +d.index_year < r));
}

export function getBins(l, r, step) {
    let bins = d3.range(Math.ceil((r - l) / step)).map(d => [l + d * step, l + d * step + step]);
    return bins
}

export function getPeriodLegend() {
    return period_legend;
}

export function getQingNianhao() {
    return qing_nainhao;
}

export function getBigEvent() {
    return big_event;
}

export function getJpPeriodData() {
    return jp_period_legend;
}

