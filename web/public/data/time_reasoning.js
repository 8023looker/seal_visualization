// Data Structure
// for single book
[ // example
    { // single event
        "ori_idx": String || Number, // 流传事件的唯一标识
        "sequence": { // 流传次序
            "index": Number, // 推测次序
            "flag": {
                "state": String, // 绝对次序确定 || 相对次序确定 || 次序未知, absolute || relative || unsettled
                "detail": Number || Array || null, // 绝对次序值 || 相对次序[ori_idx1, ori_idx2] || null
                "source": String || String || null // 次序史料文本
            }
        },
        "time_interval": {
            "composite_interval": Array, // [start_year, end_year], list
            "direct": { // direct, [optional]
                "time_range": Array, // [start_year, end_year], list
                "source": String // 史料文本
            },
            "library": { // indirect, [optional]
                "sub_composite_interval": Array, // [start_year, end_year], list
                "material_list": [
                    {
                        "time_range": Array, // [start_year, end_year], list
                        "source": String, // 时间区间史料文本
                        "source_type": String // "start2end" || "transferRecord-clear" || "transferRecord-blur"
                    }, {
                        // ...
                    },
                    // ...
                ]
            },
            "agent": { // indirect, [optional]
                "sub_composite_interval": Array, // [start_year, end_year], list
                "material_list": [
                    {
                        "time_range": Array, // [start_year, end_year], list
                        "source": String, // 时间区间史料文本
                        "source_type": String // "born2death" || "activity-officialPosition" || "activity-transferRecord-clear" || "activity-transferRecord-blur"
                    }, {
                        // ...
                    },
                    // ...
                ]
            }
        },
        "time_interval_adjusted": Array, // [start_year_adjusted, end_year_adjusted], list
        "time_inferred": Number, // the inferred year that event happened
    },
    {
        // ...
    },
    // ...
]

export const reasoning_data =
{
    "初學記": [ // 初學記 
        {
            "ori_idx": 135,
            "sequence": {
                "index": 1, // Waiting for interactions to fill in
                "flag": {
                    "state": "absolute",
                    "detail": 1,
                    "source": "流传起始地"
                }
            },
            "time_interval": {
                "composite_interval": [1147, 1148],
                "direct": {
                    "time_range": [1147, 1148],
                    "source": "紹興丁卯季冬"
                },
            },
            "time_interval_adjusted": Array, // Waiting for interactions to fill in
            "time_inferred": Number, // Waiting for interactions to fill in
        },
        {
            "ori_idx": 136,
            "sequence": {
                "index": 2, // Waiting for interactions to fill in
                "flag": {
                    "state": "unsettled",
                    "detail": null,
                    "source": null
                }
            },
            "time_interval": {
                "composite_interval": [1275, Infinity],
                "library": {
                    "sub_composite_interval": [1275, Infinity],
                    "material_list": [
                        {
                            "time_range": [1275, Infinity],
                            "source": "金澤文庫成立于1275年",
                            "source_type": "start2end"
                        }
                    ]
                },
            },
            "time_interval_adjusted": Array, // Waiting for interactions to fill in
            "time_inferred": Number, // Waiting for interactions to fill in
        },
        {
            "ori_idx": 137,
            "sequence": {
                "index": 3, // Waiting for interactions to fill in
                "flag": {
                    "state": "unsettled",
                    "detail": null,
                    "source": null
                }
            },
            "time_interval": {
                "composite_interval": Array,
                "agent": {
                    "sub_composite_interval": [1754, 1817],
                    "material_list": [
                        {
                            "time_range": [1754, 1817],
                            "source": "真勢中洲出生逝世年份1754-1817",
                            "source_type": "born2death"
                        }
                    ]
                }
            },
            "time_interval_adjusted": Array, // Waiting for interactions to fill in
            "time_inferred": Number, // Waiting for interactions to fill in
        },
        {
            "ori_idx": 138,
            "sequence": {
                "index": 4, // Waiting for interactions to fill in
                "flag": {
                    "state": "relative",
                    "detail": [138, 139],
                    "source": "毛利高標→毛利高翰"
                }
            },
            "time_interval": {
                "composite_interval": [1755, 1801],
                "agent": {
                    "sub_composite_interval": [1755, 1801],
                    "material_list": [
                        {
                            "time_range": [1755, 1801],
                            "source": "毛利高標出生逝世年份1755-1801",
                            "source_type": "born2death"
                        }, {
                            "time_range": [1760, 1801],
                            "source": "毛利高標于1760年成为佐伯藩藩主",
                            "source_type": "activity-officialPosition"
                        }, {
                            "time_range": [1781, 1781],
                            "source": "1781 年成立了佐伯文库，收藏了 80,000 幅绘画和书籍，以及中国、医学、佛教、历史和荷兰书籍",
                            "source_type": "activity-transferRecord-blur"
                        }
                    ]
                }
            },
            "time_interval_adjusted": Array, // Waiting for interactions to fill in
            "time_inferred": Number, // Waiting for interactions to fill in
        },
        {
            "ori_idx": 139,
            "sequence": {
                "index": 5, // Waiting for interactions to fill in
                "flag": {
                    "state": "relative",
                    "detail": [138, 139],
                    "source": "毛利高標→毛利高翰"
                }
            },
            "time_interval": {
                "composite_interval": [1795, 1852],
                "agent": {
                    "sub_composite_interval": [1795, 1852],
                    "material_list": [
                        {
                            "time_range": [1795, 1852],
                            "source": "毛利高翰出生逝世年份1795-1852",
                            "source_type": "born2death"
                        }, {
                            "time_range": [1812, 1832],
                            "source": "毛利高翰于1812年继承家督之位，为佐伯藩第10代藩主，1832年隐居",
                            "source_type": "activity-officialPosition"
                        }, {
                            "time_range": [1828, 1828],
                            "source": "日本文政十一年（清道光八年，公元1828年），将其并众多藏书一起献给江户幕府",
                            "source_type": "activity-transferRecord-blur"
                        }
                    ]
                }
            },
            "time_interval_adjusted": Array, // Waiting for interactions to fill in
            "time_inferred": Number, // Waiting for interactions to fill in
        },
        {
            "ori_idx": 140,
            "sequence": {
                "index": 6, // Waiting for interactions to fill in
                "flag": {
                    "state": "unsettled",
                    "detail": null,
                    "source": null
                }
            },
            "time_interval": {
                "composite_interval": [1855, 1855],
                "direct": {
                    "time_range": [1855, 1855],
                    "source": "1855?"
                },
            },
            "time_interval_adjusted": Array, // Waiting for interactions to fill in
            "time_inferred": Number, // Waiting for interactions to fill in
        },
        {
            "ori_idx": 141,
            "sequence": {
                "index": 7, // Waiting for interactions to fill in
                "flag": {
                    "state": "absolute",
                    "detail": 7,
                    "source": "宮內省圖書寮→宮內廳書陵部/流传终止地"
                }
            },
            "library": {
                "sub_composite_interval": [1884, 1949],
                "material_list": [
                    {
                        "time_range": [1884, 1949],
                        "source": "1884年改称“宫内省图书寮”，1949年更名“宫内厅书陵部”",
                        "source_type": "start2end"
                    }, {
                        "time_range": [1891, 1891],
                        "source": "明治二十四年（1891）归还宫内省图书寮，亦今宫内庁書陵部",
                        "source_type": "transferRecord-blur"
                    }
                ]
            },
            "time_interval_adjusted": Array, // Waiting for interactions to fill in
            "time_inferred": Number, // Waiting for interactions to fill in
        },
        {
            "ori_idx": 142,
            "sequence": {
                "index": 8, // Waiting for interactions to fill in
                "flag": {
                    "state": "absolute",
                    "detail": 8,
                    "source": "宮內省圖書寮→宮內廳書陵部/流传终止地"
                }
            },
            "library": {
                "sub_composite_interval": [1949, Infinity],
                "material_list": [
                    {
                        "time_range": [1949, Infinity],
                        "source": "1949年更名“宫内厅书陵部”",
                        "source_type": "start2end"
                    }
                ]
            },
            "time_interval_adjusted": Array, // Waiting for interactions to fill in
            "time_inferred": Number, // Waiting for interactions to fill in
        },
        {
            "ori_idx": 143,
            "sequence": {
                "index": null, // Waiting for interactions to fill in
                "flag": {
                    "state": "unsettled",
                    "detail": null,
                    "source": null
                }
            },
            "time_interval_adjusted": Array, // Waiting for interactions to fill in
            "time_inferred": Number, // Waiting for interactions to fill in
        },
        {
            "ori_idx": 144,
            "sequence": {
                "index": null, // Waiting for interactions to fill in
                "flag": {
                    "state": "unsettled",
                    "detail": null,
                    "source": null
                }
            },
            "time_interval_adjusted": Array, // Waiting for interactions to fill in
            "time_inferred": Number, // Waiting for interactions to fill in
        },
        {
            "ori_idx": 145,
            "sequence": {
                "index": null, // Waiting for interactions to fill in
                "flag": {
                    "state": "unsettled",
                    "detail": null,
                    "source": null
                }
            },
            "time_interval_adjusted": Array, // Waiting for interactions to fill in
            "time_inferred": Number, // Waiting for interactions to fill in
        }
    ]
}
