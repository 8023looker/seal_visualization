import * as d3 from "d3";
const $ = require("jquery");

const modify_list = {
    library: ['宮內省圖書寮(後改名宮內廳書陵部)', '最下方的印章看不清', '宮內省圖書寮慶福院', '佐伯藩主毛利家', '佐伯藩', '江戶醫學館(初名“躋壽館”)'],
    agent: ['細川十洲(潤次郎)', '愛新覺羅顒琰、旻宁、奕詝、载淳、载湉、溥仪', '丹波氏(即多紀氏，多紀元孝等)', '寺田弘(一名盛業，字士弘，號望南)', '館機(名機，字樞卿)', '佐伯侯毛利高標'],
    action: [], // 暂时不改
    ancient_time: ['高麗肅宗六年/大宋建中靖國元年/大遼乾統元年', '日本親町天皇永祿九年-後陽城天皇天正十九年'],
    location: [] // 暂时不改
}

export function modify_text_length(events) {
    let output_events = JSON.parse(JSON.stringify(events))
    for (let e in events) {
        const event = events[e]
        if (modify_list.library.includes(event.library)) {
            if (event.library === '宮內省圖書寮(後改名宮內廳書陵部)') {
                output_events[e].library = '宮內省圖書寮'
            } else if (event.library === '最下方的印章看不清') {
                output_events[e].library = '--'
            } else if (event.library === '宮內省圖書寮慶福院') {
                output_events[e].library = '宮內省圖書寮'
            } else if (event.library === '佐伯藩主毛利家') {
                output_events[e].library = '佐伯文庫'
            } else if (event.library === '佐伯藩') {
                output_events[e].library = '佐伯文庫'
            } else if (event.library === '江戶醫學館(初名“躋壽館”)') {
                output_events[e].library = '江戶醫學館'
            }
        }
        if (modify_list.agent.includes(event.agent)) {
            if (event.agent === '細川十洲(潤次郎)') {
                output_events[e].agent = '細川十洲'
            } else if (event.agent === '愛新覺羅顒琰、旻宁、奕詝、载淳、载湉、溥仪') {
                output_events[e].agent = '愛新覺羅顒琰'
            } else if (event.agent === '丹波氏(即多紀氏，多紀元孝等)') {
                output_events[e].agent = '丹波氏'
            } else if (event.agent === '寺田弘(一名盛業，字士弘，號望南)') {
                output_events[e].agent = '寺田弘'
            } else if (event.agent === '館機(名機，字樞卿)') {
                output_events[e].agent = '館機'
            } else if (event.agent === '佐伯侯毛利高標') {
                output_events[e].agent = '毛利高標'
            }
        }
        // if (modify_list.action.includes(event.經手方式)) {
        // }
        if (modify_list.ancient_time.includes(event.時間)) {
            if (event.時間 === '高麗肅宗六年/大宋建中靖國元年/大遼乾統元年') {
                output_events[e].時間 = '高麗肅宗六年'
            } else if (event.時間 === '日本親町天皇永祿九年-後陽城天皇天正十九年') {
                output_events[e].時間 = '日本親町天皇永祿九年'
            }
        }
    }
    return output_events
}

// export function bookImagePosHandle(raw_dict, book_string) { // compute each position of book images
//     let enumerate_image_list = [],
//         enumerate_image_dict = {}
//     for (let img in raw_dict) {
//         const cur_image = raw_dict[img]
//         if (enumerate_image_dict.hasOwnProperty(cur_image['equivalence_book_image'])) { // 已有，跳过
//             continue
//         } else {
//             const size_param = load_book_image(book_string, cur_image['equivalence_book_image']) // 未能实现异步
//             console.log('size_param', size_param)
//             enumerate_image_dict[cur_image['equivalence_book_image']] = {
//                 x_position: 0, // initialize
//                 ori_size: {
//                     width: img_w,
//                     height: img_h
//                 }
//             }
//         }
//     }
//     for (let image in enumerate_image_dict) {
//         enumerate_image_list.push({
//             image_name: image,
//             ...enumerate_image_dict[image]
//         })
//     }
//     console.log(enumerate_image_list)
// }

// function load_book_image(book_string, image_name) { // book_string: folder name of the book
//     const imageURL = 'http://vis.pku.edu.cn/chinese_classics_circulation/assets/images_full/' + book_string + '/pics/' + image_name.split('.')[0] + '_new.jpg'
//     let img = new Image()
//     console.log(imageURL)
//     img.src = imageURL
//     img.onerror = function() {
//         console.log('加载书影图片出错啦')
//         return {
//             width: 0,
//             height: 0
//         }
//     }
//     if(img.complete) {
//         return {
//             width: img.width,
//             height: img.height
//         }
//     } else {
//         img.onload = function() {
//             // console.log(img.width, img.height)
//             return {
//                 width: img.width,
//                 height: img.height
//             }
//         }
//     }
// }

export function bookImagePosHandle(raw_dict, book_string, rem, canvas_width) {
    return new Promise(async (resolve, reject) => {
        let enumerate_image_list = [];
        let enumerate_image_promises = [];
        let enumerate_image_dict = {};

        for (let img in raw_dict) {
            const cur_image = raw_dict[img];

            if (!enumerate_image_dict.hasOwnProperty(cur_image['equivalence_book_image'])) {
                const sizePromise = load_book_image(book_string, cur_image['equivalence_book_image']);
                enumerate_image_promises.push(sizePromise);

                try {
                    const size_param = await sizePromise;
                    enumerate_image_dict[cur_image['equivalence_book_image']] = {
                        x_position: 0, // initialize
                        ori_size: {
                            width: size_param.width,
                            height: size_param.height
                        },
                        img_href: size_param.img_href
                    };
                } catch (error) {
                    console.error('加载书影图片出错啦:', error);
                }
            }
        }

        Promise.all(enumerate_image_promises).then(() => {
            for (let image in enumerate_image_dict) {
                enumerate_image_list.push({
                    image_name: image,
                    ...enumerate_image_dict[image]
                });
            }
            console.log(enumerate_image_list);
            enumerate_image_list = computeBookImagePos(enumerate_image_list, canvas_width, rem);
            console.log('enumerate_image_list', enumerate_image_list);
            
            // 解析Promise并将结果传递给调用者
            resolve(enumerate_image_list);
        });
    });
}

export const bookImgExistList = 
[
    "0733A",
    "0FD055C6",
    "1DA37D0D",
    "3fedb",
    "7ea9c",
    "9FD7D816",
    "10FDA",
    "30AA3929",
    "65AA2522",
    "86BB9",
    "90b76",
    "94bbd",
    "306FE20F",
    "376a2ae0",
    "514A2141",
    "7323E",
    "7759A62A",
    "20253",
    "99829",
    "37170858",
    "62820972",
    "A17F92C2",
    "B3DF214B",
    "B82FF06C",
    "B237710D",
    "CD627F44",
    "ed368493",
    "FB9981F9"
]


function load_book_image(book_string, image_name) {
    return new Promise((resolve, reject) => {
        const imageURL = 'http://vis.pku.edu.cn/chinese_classics_circulation/assets/images_full/' + book_string + '/pics/' + image_name.split('.')[0] + '_new.jpg';
        let img = new Image();
        img.src = imageURL;
        img.onerror = function () {
            console.log('加载书影图片出错啦');
            reject({ width: 0, height: 0, img_href: imageURL });
        };
        img.onload = function () {
            console.log('成功加载书影图片:', img.width, img.height);
            resolve({ width: img.width, height: img.height, img_href: imageURL });
        };
    });
}

// 目前拟订每页最多放置4张书影图片
function computeBookImagePos(img_list, canvas_width, rem) { // 计算各个书影图片的x_pos
    const card_width = rem * 20, // 书影图片container宽度
          card_num = img_list.length
    let compute_card_num = card_num > 4 ? 4 : card_num
    let gap = (canvas_width - compute_card_num * card_width) / (compute_card_num + 1),
        half_num
    if (card_num <= 4) { // 同一个屏幕放得下
        if (card_num % 2 !== 0) { // 奇数
            half_num = [Math.ceil(card_num / 2), Math.ceil(card_num / 2)]
        } else { // 偶数
            half_num = [card_num / 2, card_num / 2 + 1]
        }
        // 计算中间卡片的横坐标
        let mark = 1 // 正负号，初始为+1，第1次为-1，第2次为+1
        for (let i in half_num) {
            mark = -mark
            const card_offset = mark === -1 ? - card_width : 0
            img_list[half_num[i] - 1]['x_position'] = canvas_width / 2 + mark * (half_num[1] - half_num[0]) * gap / 2 + card_offset

            // 对于奇数(之前的规则不适用)
            if (half_num[1] - half_num[0] === 0) {
                img_list[half_num[i] - 1]['x_position'] = canvas_width / 2 - card_width / 2
            }

            if (mark === -1) { // 中间数左侧
                for (let j = half_num[i] - 1; j >= 0; j--) {
                    const seq_diff = Math.abs(j - (half_num[i] - 1))
                    img_list[j]['x_position'] = img_list[half_num[i] - 1]['x_position'] - seq_diff * (gap + card_width)
                }
            } else { // 中间数右侧
                for (let j = half_num[i] - 1; j < card_num; j++) {
                    const seq_diff = Math.abs(j - (half_num[i] - 1))
                    img_list[j]['x_position'] = img_list[half_num[i] - 1]['x_position'] + seq_diff * (gap + card_width)
                }
            }
        }
    } else {
        let mark = 1
        half_num = [2, 3]
        for (let i in half_num) {
            mark = -mark
            const card_offset = mark === -1 ? - card_width : 0
            img_list[half_num[i] - 1]['x_position'] = canvas_width / 2 + mark * gap / 2 + card_offset
            if (mark === -1) { // 中间数左侧
                for (let j = half_num[i] - 1; j >= 0; j--) {
                    const seq_diff = Math.abs(j - (half_num[i] - 1))
                    img_list[j]['x_position'] = img_list[half_num[i] - 1]['x_position'] - seq_diff * (gap + card_width)
                }
            } else { // 中间数右侧
                for (let j = half_num[i] - 1; j < card_num; j++) {
                    const seq_diff = Math.abs(j - (half_num[i] - 1))
                    img_list[j]['x_position'] = img_list[half_num[i] - 1]['x_position'] + seq_diff * (gap + card_width)
                }
            }
        }
        for (let e = 4; e < img_list.length; e++) {
            img_list[e]['x_position'] = img_list[e - 4]['x_position'] + canvas_width // 完全对照
            const seq_diff = Math.abs(e - 7)
            if (seq_diff === 4) {
                img_list[e]['x_position'] = img_list[3]['x_position'] + img_list[0]['x_position'] + card_width
            } else {
                img_list[e]['x_position'] = img_list[4]['x_position'] + (seq_diff - 1) * (card_width + gap)
            }
        }
    }
    return img_list
}

export function vhToPx(vh) {
    // 获取视窗高度
    const windowHeight = window.innerHeight;
    // 计算px单位的高度
    return (vh / 100) * windowHeight;
}

export function computeSubTimelineYIndex(events) {
    for (let e = 0; e < events.length; e++) {
        if (e % 2 === 0) { // 从上往下排布
            events[e]['YIndex'] = e / 2
        } else { // 从下往上排布
            events[e]['YIndex'] = events.length - (e + 1) / 2
        }
        events[e]['time_info']['timestampUpdated'] = events[e]['time_info']['timestamp'] // 添加timestampUpdated属性
    }
    return events
}

// 替换概率密度分布函数的x变量
// gamma分布
export function substituteJsonX(PDFData, x_range) { // x_range: [start_year, end_year]
    const x_step = Math.abs(x_range[1] - x_range[0]) / (1000 - 1)
    for (let i = 0; i < PDFData.length; i++) {
        PDFData[i]['x'] = x_range[0] + x_step * i
    }
    return PDFData
}
// 正态分布
export function substituteNormalX(PDFData, x_range) { // x_range: [start_year, end_year]
    const x_step = 2 / (1000 - 1)
    for (let i = 0; i < PDFData.length; i++) {
        PDFData[i]['x'] = x_range[0] - 1 + x_step * i
    }
    return PDFData
}

// 经手人物 born exponential
// agent_exponential_up.json
export function substituteAgentExponentialUpX(PDFData, x_range) { // x_range: [start_year, end_year]
    // 待添加
}

export function judgeAgentTimeBreak(bornYear, deathYear, jsonPara, source_type) {
        let agent_time_break = {
            born: bornYear, // born, 任官
            adult: bornYear + 20, // born + 20, 任官 + 1
            downturn: deathYear - 1, // death - 1, 辞官 - 1
            death: deathYear, // death, 辞官
            maximum: 0 // 最大值(所乘比例) 
        }
        if (source_type === 'born2death') {
            if (Math.abs(deathYear - bornYear) < 60) {
                agent_time_break['adult'] = agent_time_break['born'] + Math.abs(agent_time_break['death'] - agent_time_break['born']) / 3
            }
            
        } else if (source_type === 'activity-officialPosition') {
            agent_time_break['adult'] = agent_time_break['born'] + 1
            agent_time_break['downturn'] = agent_time_break['death'] - 1
        } else if (source_type === 'activity-transferRecord-blur') { // 按照library的藏书转移记录来写

        }
        // 处理maximum
        let area_up = 0,
            area_down = 0,
            area_flat = (agent_time_break['downturn'] - agent_time_break['adult']) * 1
        for (let i in jsonPara['exponentUp']) {
            area_up += jsonPara['exponentUp'][i]['y'] * (agent_time_break['adult'] - agent_time_break['born']) / 1000 // 共有1000份
        }
        for (let i in jsonPara['exponentDown']) {
            area_down += jsonPara['exponentDown'][i]['y'] * (agent_time_break['death'] - agent_time_break['downturn']) / 1000
        } 
        agent_time_break['maximum'] = 1 / (area_up + area_flat + area_down)
    
        // console.log('agent_time_break', agent_time_break)
        return agent_time_break
}

export function judgeLibraryTimeBreak(startYear, endYear, jsonPara, source_type) {
    // 处理transfer-blur的情况
    if (source_type === 'transferRecord-blur' || source_type === 'activity-transferRecord-blur') {
        let maxinum = 0, // 最大值
            ratio = 1, // 比例系数
            area_value = 0
        for (let i in jsonPara) {
            area_value += jsonPara[i]['y'] * Math.abs(endYear + 2 - startYear + 2) / 1000
            if (jsonPara[i]['y'] > maxinum) {
                maxinum = jsonPara[i]['y']
            }
        }
        ratio = 1 / area_value
        // console.log('maxinum, ratio', maxinum, ratio) // success
        return {
            maxinum: maxinum,
            ratio: ratio
        }
    }
}

export function libAgentMaterialSort(material_list, sub_type, reverse) { // sub_type = 'library' || 'agent'
    if (sub_type === 'library') {
        // 自定义排序规则
        const librarySortOrder = {
            'start2end': 1,
            'transferRecord-blur': 2,
            'transferRecord-clear': 3
        }
        material_list.sort((a, b) => {
            const priorityA = librarySortOrder[a['source_type']] || Number.MAX_SAFE_INTEGER;
            const priorityB = librarySortOrder[b['source_type']] || Number.MAX_SAFE_INTEGER;
        
            return priorityA - priorityB;
        })       
        return reverse ? material_list.reverse() : material_list
    } else if (sub_type === 'agent') {        
          // 自定义排序规则
          const agentSortOrder = {
            'born2death': 1,
            'activity-officialPosition': 2,
            'activity-transferRecord-blur': 3,
            'activity-transferRecord-clear': 4
          }
          material_list.sort((a, b) => {
            const priorityA = agentSortOrder[a['source_type']] || Number.MAX_SAFE_INTEGER;
            const priorityB = agentSortOrder[b['source_type']] || Number.MAX_SAFE_INTEGER;
          
            return priorityA - priorityB;
          })       
          return reverse ? material_list.reverse() : material_list   
    }
}

export function computeMaxLibAgentNum(timeReasoningData) {
    let material_num = {
        direct: 0,
        library: 0,
        agent: 0
    }
    for (let i = 0; i < timeReasoningData.length; i++) {
        if (timeReasoningData[i]['time_interval'].hasOwnProperty('direct')) {
            material_num['direct'] += 1
        }
        if (timeReasoningData[i]['time_interval'].hasOwnProperty('library')) {
            const cur_library_num = timeReasoningData[i]['time_interval']['library']['material_list'].length
            if (material_num['library'] < cur_library_num) {
                material_num['library'] = cur_library_num
            }
        }
        if (timeReasoningData[i]['time_interval'].hasOwnProperty('agent')) {
            const cur_agent_num = timeReasoningData[i]['time_interval']['agent']['material_list'].length
            if (material_num['agent'] < cur_agent_num) {
                material_num['agent'] = cur_agent_num
            }
        }
    }
    return material_num
}

export function getSequenceString(suquence_list) { // relative的史料和absolute一样
    // 遍历数组，查找 "state" 为 "relative" 的对象元素
    const relativeObjects = suquence_list.filter(item => item.state === "relative");

    // 获取符合条件的对象元素的 "source" 属性内容
    const sourceContents = relativeObjects.map(item => item.source);
    // console.log(sourceContents) // success
    if (sourceContents.length > 0) {
        return sourceContents.join("；")
    } else {
        return ''
    }
}

export function resortedEventReasonArray(reason_data, event_data, index, movement) {
    let seqGroupDict = generateSeqGroup(reason_data),
        ifSortable = true,
        exchange_index = [[index], [index]]
    // console.log('seqGroupDict', seqGroupDict)
    if (movement === 'up') { // 向前
        if (index > 0) { // 只有非首位才需要调换顺序
            let prev_index = index - 1
            // let exchange_index = [[index], [prev_index]] // 更改为全局
            const cur_reason_data = reason_data[index],
                  other_reason_data = reason_data[prev_index] // default is (index - 1)
            // judge if it is sortable
            if (cur_reason_data['sequence']['flag'].some(item => item.state === "absolute") || other_reason_data['sequence']['flag'].some(item => item.state === "absolute")) { // sequence is absolute(一般只存在于首尾)
                ifSortable = false
            } else if (seqGroupDict[index.toString()].length > 1) { // 当前本身处于relative
                exchange_index[0] = seqGroupDict[prev_index.toString()].indexOf(index) === 0 ? [index - 1, index] : [index, index + 1] // [index - 1, index]为relative : [index, index + 1]为relative
                prev_index = seqGroupDict[prev_index.toString()].indexOf(index) === 0 ? index - 2 : index - 1

                if (prev_index >= 0) {
                    if (reason_data[prev_index]['sequence']['flag'].some(item => item.state === "absolute")) {
                        ifSortable = false
                    } else { // relative, unsettled
                        exchange_index[1] = seqGroupDict[prev_index.toString()]
                    }
                } else {
                    ifSortable = false
                }
                
            } else if (other_reason_data['sequence']['flag'].some(item => item.state === "relative")) { // cur_reason_data不处于relative(unsettled), other_reason_data处于relative
                exchange_index[1] = seqGroupDict[prev_index.toString()]
            } else { // unsettled
                exchange_index = [[index], [prev_index]]
            }
            console.log('exchange_index', exchange_index, ifSortable)
        }
    } else if (movement === 'down') { // 向后
        if (index < event_data.length - 1) { // 只有非末位才需要调换顺序
            let next_index = index + 1
            // let exchange_index = [[index], [next_index]] // 更改为全局
            const cur_reason_data = reason_data[index],
                  other_reason_data = reason_data[next_index] // default is (index + 1)
            // judge if it is sortable
            if (cur_reason_data['sequence']['flag'].some(item => item.state === "absolute") || other_reason_data['sequence']['flag'].some(item => item.state === "absolute")) { // sequence is absolute(一般只存在于首尾)
                ifSortable = false
            } else if (seqGroupDict[index.toString()].length > 1) { // 当前本身处于relative
                exchange_index[0] = seqGroupDict[index.toString()].indexOf(index) === 0 ? [index, index + 1] : [index - 1, index] // [index - 1, index]为relative : [index, index + 1]为relative
                next_index = seqGroupDict[index.toString()].indexOf(index) === 0 ? index + 2 : index + 1

                if (next_index < event_data.length) {
                    if (reason_data[next_index]['sequence']['flag'].some(item => item.state === "absolute")) {
                        ifSortable = false
                    } else { // relative, unsettled
                        exchange_index[1] = seqGroupDict[next_index.toString()]
                    }
                } else {
                    ifSortable = false
                }
                
            } else if (other_reason_data['sequence']['flag'].some(item => item.state === "relative")) { // cur_reason_data不处于relative(unsettled), other_reason_data处于relative
                exchange_index[1] = seqGroupDict[next_index.toString()]
            } else { // unsettled
                exchange_index = [[index], [next_index]]
            }
            console.log('exchange_index', exchange_index, ifSortable)
        }
    }

    // 更换次序(划分为4种情况)
    let temp = null
    if (ifSortable) {
        if (exchange_index[0].length === 2 && exchange_index[1].length === 2) { // [A, B] [C, D]
            // console.log('换2，被换2')
            temp = [
                {
                    index: exchange_index[0][0],
                    dataR: reason_data[exchange_index[0][0]],
                    dataE: event_data[exchange_index[0][0]]
                },
                {
                    index: exchange_index[0][1],
                    dataR: reason_data[exchange_index[0][1]],
                    dataE: event_data[exchange_index[0][1]]
                }
            ]
            reason_data[exchange_index[0][0]] = reason_data[exchange_index[1][0]]
            reason_data[exchange_index[0][1]] = reason_data[exchange_index[1][1]]
            event_data[exchange_index[0][0]] = event_data[exchange_index[1][0]]
            event_data[exchange_index[0][1]] = event_data[exchange_index[1][1]]

            reason_data[exchange_index[1][0]] = temp[0]['dataR']
            reason_data[exchange_index[1][1]] = temp[1]['dataR']
            event_data[exchange_index[1][0]] = temp[0]['dataE']
            event_data[exchange_index[1][1]] = temp[1]['dataE']
        } else if (exchange_index[0].length === 2 && exchange_index[1].length === 1) { // [A, B] [C]
            // console.log('换2，被换1')
            temp = [
                {
                    index: exchange_index[0][0],
                    dataR: reason_data[exchange_index[0][0]],
                    dataE: event_data[exchange_index[0][0]]
                },
                {
                    index: exchange_index[0][1],
                    dataR: reason_data[exchange_index[0][1]],
                    dataE: event_data[exchange_index[0][1]]
                }
            ]
            if (movement === 'up') {
                reason_data[exchange_index[0][1]] = reason_data[exchange_index[1][0]]
                reason_data[exchange_index[1][0]] = temp[0]['dataR']
                reason_data[exchange_index[0][0]] = temp[1]['dataR']
                event_data[exchange_index[0][1]] = event_data[exchange_index[1][0]]
                event_data[exchange_index[1][0]] = temp[0]['dataE']
                event_data[exchange_index[0][0]] = temp[1]['dataE']
            } else if (movement === 'down') {
                reason_data[exchange_index[0][0]] = reason_data[exchange_index[1][0]]
                reason_data[exchange_index[0][1]] = temp[0]['dataR']
                reason_data[exchange_index[1][0]] = temp[1]['dataR']
                event_data[exchange_index[0][0]] = event_data[exchange_index[1][0]]
                event_data[exchange_index[0][1]] = temp[0]['dataE']
                event_data[exchange_index[1][0]] = temp[1]['dataE']
            }
     
        } else if (exchange_index[0].length === 1 && exchange_index[1].length === 2) { // [A] [B, C]
            // console.log('换1，被换2')
            temp = [
                {
                    index: exchange_index[1][0],
                    dataR: reason_data[exchange_index[1][0]],
                    dataE: event_data[exchange_index[1][0]]
                },
                {
                    index: exchange_index[1][1],
                    dataR: reason_data[exchange_index[1][1]],
                    dataE: event_data[exchange_index[1][1]]
                }
            ]
            if (movement === 'up') {
                reason_data[exchange_index[1][0]] = reason_data[exchange_index[0][0]] // [C']
                reason_data[exchange_index[1][1]] = temp[0]['dataR'] // [A']
                reason_data[exchange_index[0][0]] = temp[1]['dataR'] // [B']
                event_data[exchange_index[1][0]] = event_data[exchange_index[0][0]] // [C']
                event_data[exchange_index[1][1]] = temp[0]['dataE'] // [A']
                event_data[exchange_index[0][0]] = temp[1]['dataE'] // [B']
            } else if (movement === 'down') {
                reason_data[exchange_index[1][1]] = reason_data[exchange_index[0][0]] // [C']
                reason_data[exchange_index[1][0]] = temp[1]['dataR'] // [A']
                reason_data[exchange_index[0][0]] = temp[0]['dataR'] // [B']
                event_data[exchange_index[1][1]] = event_data[exchange_index[0][0]] // [C']
                event_data[exchange_index[1][0]] = temp[1]['dataE'] // [A']
                event_data[exchange_index[0][0]] = temp[0]['dataE'] // [B']
            }

        } else if (exchange_index[0].length === 1 && exchange_index[1].length === 1) { // [A] [B]
            // console.log('单个交换')
            temp = reason_data[exchange_index[1][0]]
            reason_data[exchange_index[1][0]] = reason_data[exchange_index[0][0]]
            reason_data[exchange_index[0][0]] = temp

            temp = event_data[exchange_index[1][0]]
            event_data[exchange_index[1][0]] = event_data[exchange_index[0][0]]
            event_data[exchange_index[0][0]] = temp
        }
    }
    event_data = updateEventIndex(event_data) // update "index"
    event_data = computeSubTimelineYIndex(event_data) // update "YIndex"
    return {
        reason_data: reason_data,
        event_data: event_data
    }
}

function generateSeqGroup(reason_data) {
    let seqGroupDict = {} // key: String, value: [Number, Number]
    for (let i = 0; i < reason_data.length; i++) {
        if (!(reason_data[i]['sequence']['flag'].some(item => item.state === "absolute") || reason_data[i]['sequence']['flag'].some(item => item.state === "relative"))) {
            seqGroupDict[i.toString()] = seqGroupDict.hasOwnProperty(i.toString()) ? seqGroupDict[i.toString()] : [i]
        } else if (reason_data[i]['sequence']['flag'].some(item => item.state === "absolute")) { // absolute
            seqGroupDict[i.toString()] = seqGroupDict.hasOwnProperty(i.toString()) ? seqGroupDict[i.toString()] : [i]
        } else { // relative(无absolute), 寻找与之对应的relative event
            if (i + 1 < reason_data.length) { // 向后延伸
                // console.log('relative choice')
                if (reason_data[i + 1]['sequence']['flag'].some(item => item.state === "relative")) { // relative
                    const relativeObjects = reason_data[i + 1]['sequence']['flag'].filter(item => item.state === "relative")
                    if (relativeObjects[0]['detail'].includes(reason_data[i]['ori_idx']) && relativeObjects[0]['detail'].includes(reason_data[i + 1]['ori_idx'])) { // 属于同一种relative events
                        // console.log([i, i + 1])
                        seqGroupDict[i.toString()] = [i, i + 1]
                        seqGroupDict[(i + 1).toString()] = [i, i + 1]
                    } else { // 需要向前延伸 (copy * 1)
                        if (i - 1 >= 0) {
                            if (reason_data[i - 1]['sequence']['flag'].some(item => item.state === "relative")) { // relative
                                const relativeObjects = reason_data[i - 1]['sequence']['flag'].filter(item => item.state === "relative")
                                if (relativeObjects[0]['detail'].includes(reason_data[i]['ori_idx']) && relativeObjects[0]['detail'].includes(reason_data[i - 1]['ori_idx'])) { // 属于同一种relative events
                                    seqGroupDict[i.toString()] = [i - 1, i]
                                    seqGroupDict[(i - 1).toString()] = [i - 1, i]
                                } else { // 没有与之匹配的
                                    seqGroupDict[i.toString()] = seqGroupDict.hasOwnProperty(i.toString()) ? seqGroupDict[i.toString()] : [i]
                                }
                            } else { // 没有与之匹配的
                                seqGroupDict[i.toString()] = seqGroupDict.hasOwnProperty(i.toString()) ? seqGroupDict[i.toString()] : [i]
                            }
                        } else { // 没有与之匹配的
                            seqGroupDict[i.toString()]
                        }
                    }
                } else { // 需要向前延伸 (copy * 2)
                    if (i - 1 >= 0) {
                        if (reason_data[i - 1]['sequence']['flag'].some(item => item.state === "relative")) { // relative
                            const relativeObjects = reason_data[i - 1]['sequence']['flag'].filter(item => item.state === "relative")
                            // console.log(relativeObjects[0]['detail'], relativeObjects[0])
                            if (relativeObjects[0]['detail'].includes(reason_data[i]['ori_idx']) && relativeObjects[0]['detail'].includes(reason_data[i - 1]['ori_idx'])) { // 属于同一种relative events
                                seqGroupDict[i.toString()] = [i - 1, i]
                                seqGroupDict[(i - 1).toString()] = [i - 1, i]
                            } else { // 没有与之匹配的
                                seqGroupDict[i.toString()] = seqGroupDict.hasOwnProperty(i.toString()) ? seqGroupDict[i.toString()] : [i]
                            }
                        } else { // 没有与之匹配的
                            seqGroupDict[i.toString()] = seqGroupDict.hasOwnProperty(i.toString()) ? seqGroupDict[i.toString()] : [i]
                        }
                    } else { // 没有与之匹配的
                        seqGroupDict[i.toString()] = seqGroupDict.hasOwnProperty(i.toString()) ? seqGroupDict[i.toString()] : [i]
                    }
                }
            } else if (i - 1 >= 0) { // 向前延伸 (copy * 3)
                if (reason_data[i - 1]['sequence']['flag'].some(item => item.state === "relative")) { // relative
                    const relativeObjects = reason_data[i - 1]['sequence']['flag'].filter(item => item.state === "relative")
                    // console.log(relativeObjects[0]['detail'], relativeObjects[0])
                    if (relativeObjects[0]['detail'].includes(reason_data[i]['ori_idx']) && relativeObjects[0]['detail'].includes(reason_data[i - 1]['ori_idx'])) { // 属于同一种relative events
                        seqGroupDict[i.toString()] = [i - 1, i]
                        seqGroupDict[(i - 1).toString()] = [i - 1, i]
                    } else { // 没有与之匹配的
                        seqGroupDict[i.toString()] = seqGroupDict.hasOwnProperty(i.toString()) ? seqGroupDict[i.toString()] : [i]
                    }
                } else { // 没有与之匹配的
                    seqGroupDict[i.toString()] = seqGroupDict.hasOwnProperty(i.toString()) ? seqGroupDict[i.toString()] : [i]
                }
            } else { // 没有与之匹配的
                seqGroupDict[i.toString()] = seqGroupDict.hasOwnProperty(i.toString()) ? seqGroupDict[i.toString()] : [i]
            }
        }
    }
    return seqGroupDict
}

// 将event_data与reason_data的流传事件个数进行对齐(暂时做此处理，后续可以去掉)
export function handlePrintEvents(events, book_name) {
    if (book_name === '王荊文公詩') {
        if (events[0]['agent'] === '王安石（等）') { // 除去王安石著的流传事件
            events.shift()
            return events
        } else {
            return events
        }
    } else if (book_name === '初學記') {
        if (events[0]['agent'] === '徐堅') { // 除去王安石著的流传事件
            events.shift()
            return events
        } else {
            return events
        }
    } else {
        return events
    }
}

// update "index" of each event
export function updateEventIndex(events) {
    for (let e = 0; e < events.length; e++) {
        events[e]['index'] = e
    }
    return events
}

export function checkArrayEqual(newArray, oldArray) {
    if (newArray.length !== oldArray.length) {
        return false;
    }
    for (let i = 0; i < newArray.length; i++) {
        if (newArray[i] !== oldArray[i]) {
            return false;
        }
    }
    return true;
}

// For Time Reasoning Panel (version 2)
// 暂时弃用，不考虑
export function classifyAxisGroup(reason_data) {
    console.log('axisGroupReasonData', reason_data)
    let axisGroup = {
        absolute: [],
        relative: [],
        unsettled: []
    },
    time_interval_composite = [] // 没有元素为null

    for (let e = 0; e < reason_data.length; e++) {
        if (reason_data[e]['sequence']['flag'].some(item => item.state === "absolute")) { // axis_type = absolute
            axisGroup['absolute'].push(reason_data[e]['ori_idx'])
        } else { // judge either "relative" or "unsettled"
            if (reason_data[e]['sequence']['flag'].some(item => item.state === "relative")) { // 本身是relative
                const relative_array = suquence_list.filter(item => item.state === "relative") // array.length = 1
                axisGroup['relative'] = axisGroup['relative'].concat(relative_array[0]['detail']) // 可以重复，后续还要去重
            } else if (!reason_data[e]['time_interval']['composite_interval'].some(item => item === null)) { // composite_interval是有限区间
                for (let i in time_interval_composite) {
                    if (!judgeYearOverlay(reason_data[e]['time_interval']['composite_interval'], time_interval_composite[i])) { // not overlay

                    }
                }
            }
            
        }
    }
}

// judge if 2 time intervals overlap 
function judgeYearOverlay(year_span_new, year_span_ori) { // [x1, y1], [x2, y2], 逐个比较
    const overlay = year_span_new[0] < year_span_ori[0] && year_span_new[1] > year_span_ori[1] // [x1, x2, y2, y1]
                    // || year_span_new[0] > year_span_ori[0] && year_span_new[1] < year_span_ori[1] // [x2, x1, y1, y2]
                    || year_span_new[0] < year_span_ori[0] && year_span_new[1] > year_span_ori[0] // [x1, x2, y1]
                    || year_span_new[0] < year_span_ori[1] && year_span_new[1] > year_span_ori[1] // [x1, y2, y1]
    return overlay
}

// 对于version版本的area chart，重新排列史料顺序
// 保证 经手角色的time span保持在图层的最下面，也就是array的最前面
export function reorderMaterialSeq_v2(event_time_interval) {
    // data structure
    // {"time_range", "source", "source_type"}
    let material_list = []
    if (event_time_interval.hasOwnProperty('direct')) { // 直接史料
        material_list.push({
            time_range: event_time_interval['direct']['time_range'],
            source: event_time_interval['direct']['source'],
            upper_source_type: 'direct',
            source_type: 'direct'
        })
    }
    if (event_time_interval.hasOwnProperty('library')) { // 收藏机构
        event_time_interval['library']['material_list'].forEach(item => {
            material_list.push({
                time_range: item['time_range'],
                source: item['source'],
                upper_source_type: 'library',
                source_type: item['source_type']
            })
          })
    }
    if (event_time_interval.hasOwnProperty('agent')) { // 收藏机构
        event_time_interval['agent']['material_list'].forEach(item => {
            material_list.push({
                time_range: item['time_range'],
                source: item['source'],
                upper_source_type: 'agent',
                source_type: item['source_type']
            })
          })
    }
    // resort重排序(可以绘制的时候再重排序)
    // const materialSortOrder = {
    //     'start2end': 1, // library起讫时间
    //     'born2death': 2, // agent生卒时间
    //     'activity-officialPosition': 3, // agent官职变动
    //     'activity-collectActivity': 4, // agent藏书积极性
    //     'transferRecord-blur': 5, // library藏书转移记录（模糊）
    //     'activity-transferRecord-blur': 6, // agent藏书转移记录（模糊）
    //     'transferRecord-clear': 7, // library藏书转移记录（清晰）
    //     'activity-transferRecord-clear': 8 // agent藏书转移记录（清晰）
    // }
    // material_list.sort((a, b) => {
    //     const priorityA = materialSortOrder[a['source_type']] || Number.MAX_SAFE_INTEGER;
    //     const priorityB = materialSortOrder[b['source_type']] || Number.MAX_SAFE_INTEGER;  
    //     return priorityA - priorityB;
    // })
    // console.log('material_list', material_list.length)
    return material_list
}
