// for each book, infer the time of each circulation event
function infer_book_time(book_info) {
    book_info.forEach((d) => {
        d.time_info = parse_time(d["Time"]);
    });

    let unknown_groups = [],
        last_unknown_idx = -1;

    book_info.forEach((d, i) => {
        let timestamp;
        let prev_time = i > 0 ? book_info[i - 1].time_info.timestamp : null;
        let next_time =
            i < book_info.length - 1
                ? book_info[i + 1].time_info.left_bound
                : null;
        // if the time is certain, use it
        if (d.time_info.certainty) {
            timestamp = d.time_info.timestamp;
        }
        // if left bound and right bound is known, use the average
        else if (d.time_info.left_bound && d.time_info.right_bound) {
            timestamp = parseInt(
                (d.time_info.left_bound + d.time_info.right_bound) / 2
            );
        }
        // if the left bound is known
        else if (d.time_info.left_bound) {
            timestamp = d.time_info.left_bound + 1;
        }
        // if the right bound is known
        else if (d.time_info.right_bound) {
            timestamp = d.time_info.right_bound - 1;
        }
        // unknown
        else {
            if (unknown_groups.length === 0 || i - last_unknown_idx > 1) {
                unknown_groups.push([i]);
                last_unknown_idx = i;
            } else if (i - last_unknown_idx === 1) {
                unknown_groups[unknown_groups.length - 1].push(i);
                last_unknown_idx = i;
            }
            return;
        }
        // check if the time is later than the previous
        if (prev_time && timestamp < prev_time) {
            timestamp = d.time_info.right_bound
                ? Math.min(d.time_info.right_bound - 1, prev_time + 1)
                : prev_time + 1;
        }
        // check if the time is earlier than the next
        if (next_time && timestamp > next_time) {
            timestamp = d.time_info.left_bound
                ? Math.max(d.time_info.left_bound + 1, next_time - 1)
                : next_time - 1;
        }
        d.time_info.timestamp = timestamp;
    });
    // unknown
    unknown_groups.forEach((group) => {
        let len = group.length;
        let start_idx = group[0],
            end_idx = group[len - 1];
        let prev_time =
            start_idx > 0 ? book_info[start_idx - 1].time_info.timestamp : null;
        let next_time =
            end_idx < book_info.length - 1
                ? book_info[end_idx + 1].time_info.timestamp
                : null;
        if (prev_time && next_time) {
            group.forEach((idx, i) => {
                book_info[idx].time_info.timestamp =
                    prev_time +
                    parseInt(((next_time - prev_time) / (len + 1)) * (i + 1));
            });
        } else if (prev_time) {
            group.forEach((idx, i) => {
                book_info[idx].time_info.timestamp = prev_time + i + 1;
            });
        } else if (next_time) {
            group.forEach((idx, i) => {
                book_info[idx].time_info.timestamp = next_time - i - 1;
            });
        } else {
            group.forEach((idx, i) => {
                book_info[idx].time_info.timestamp = 1200 + i;
            });
        }
    });
}

function parse_time(time) {
    let parsed_time = {
        certainty: false,
        timestamp: null,
        left_bound: null,
        right_bound: null,
    };
    // unknown
    // e.g. - or ? or ""
    if (time === "-" || time === "?" || time === "") {
        return parsed_time;
    }
    // known left bound
    // e.g. >1000
    if (time[0] === ">") {
        parsed_time.left_bound = parseInt(time.slice(1));
    }
    // known right bound
    // e.g. <1000
    else if (time[0] === "<") {
        parsed_time.right_bound = parseInt(time.slice(1));
    }
    // known left and right bound
    // e.g. 1000-2000
    else if (time.includes("-")) {
        let [left, right] = time.split("-");
        parsed_time.left_bound = parseInt(left);
        parsed_time.right_bound = parseInt(right);
    }
    // certain
    // e.g. 1000
    else {
        parsed_time.certainty = true;
        parsed_time.timestamp = parseInt(time);
    }
    return parsed_time;
}

function parse_time_new(time) {
    let parsed_time = {
        certainty: false,
        timestamp: null,
        left_bound: null,
        right_bound: null,
        left_bound_adjust: null,
        right_bound_adjust: null,
        info_card_Time: time
    };
    // unknown
    // e.g. - or ? or ""
    if (time === "-" || time === "?" || time === "") {
        return parsed_time;
    }
    // known left bound
    // e.g. >1000
    if (time[0] === ">" || time[0] === '＞') {
        parsed_time.left_bound = parseInt(time.slice(1))
        parsed_time.left_bound_adjust = parseInt(time.slice(1))
        parsed_time.info_card_Time = '>' + parseInt(time.slice(1))
    }
    // known right bound
    // e.g. <1000
    else if (time[0] === "<" || time[0] === '＜') {
        parsed_time.right_bound = parseInt(time.slice(1))
        parsed_time.right_bound_adjust = parseInt(time.slice(1))
        parsed_time.info_card_Time = '<' + parseInt(time.slice(1))
    }
    // known left and right bound
    // e.g. 1000-2000
    else if (time.includes("-")) {
        let [left, right] = time.split("-")
        parsed_time.left_bound = parseInt(left)
        parsed_time.right_bound = parseInt(right)
        parsed_time.left_bound_adjust = parseInt(left)
        parsed_time.right_bound_adjust = parseInt(right)
        parsed_time.info_card_Time = parseInt(left) + '-' + parseInt(right)
    }
    // certain
    // e.g. 1000
    else {
        if (time[0] === '~') { // drop '~'
            parsed_time.timestamp = parseInt(time.slice(1))
        } else {
            parsed_time.timestamp = parseInt(time)
        }
        parsed_time.info_card_Time = parsed_time.timestamp
        parsed_time.certainty = true
    }
    return parsed_time;
}
// for each book, infer the time of each circulation event again (new algorithm)
function re_infer_book_time(book_info) { // book_info为一本书的events array (共需遍历4次)
    book_info.forEach((d) => {
        d.time_info = parse_time_new(d["Time"])
    })
    // round 1
    for (let i in book_info) {
        if (book_info[i].time_info.certainty) { // type 1
            book_info[i].time_info.left_bound_adjust = book_info[i].time_info.timestamp
            book_info[i].time_info.right_bound_adjust = book_info[i].time_info.timestamp
            // console.log(book_info[i].time_info.left_bound_adjust, book_info[i].Time)
        }
    }
    // round 2
    for (let i in book_info) {
        const xor1 = (book_info[i].time_info.left_bound_adjust !== null) && (book_info[i].time_info.right_bound_adjust === null),
              xor2 = (book_info[i].time_info.left_bound_adjust === null) && (book_info[i].time_info.right_bound_adjust !== null)
        const xor = xor1 || xor2
        if (!(book_info[i].time_info.certainty) && xor) { // type 2
            if (xor1) { // left_bound is known
                book_info[i].time_info.timestamp = book_info[i].time_info.left_bound_adjust + 1
                book_info[i].time_info.right_bound_adjust = book_info[i].time_info.left_bound_adjust + 2
            } else if (xor2) { // right_bound is known
                book_info[i].time_info.timestamp = book_info[i].time_info.right_bound_adjust - 1
                book_info[i].time_info.left_bound_adjust = book_info[i].time_info.right_bound_adjust - 2
            }
        }
    }
    // round 3
    for (let i in book_info) {
        if (!(book_info[i].time_info.certainty) && (book_info[i].time_info.left_bound_adjust !== null) && (book_info[i].time_info.right_bound_adjust !== null)) { // type 3
            // 调整 left_bound 以及 right_bound(后一个根据前一个进行调整)
            let prev_index = i
            const adjust_left_bound = book_info[i].time_info.left_bound_adjust,
                  adjust_right_bound = book_info[i].time_info.right_bound_adjust
            while (prev_index >= 0) {
                if ((book_info[prev_index].time_info.left_bound_adjust !== null) && (book_info[prev_index].time_info.right_bound_adjust !== null)) { // find
                    if (adjust_left_bound < book_info[prev_index].time_info.left_bound_adjust) { // if L_i < L_(i-1)
                        book_info[i].time_info.left_bound_adjust = book_info[prev_index].time_info.left_bound_adjust
                    }
                    if (adjust_right_bound < book_info[prev_index].time_info.right_bound_adjust) { // if H_i < H_(i-1)
                        book_info[i].time_info.right_bound_adjust = book_info[prev_index].time_info.right_bound_adjust
                    }
                    break
                }
                prev_index -= 1 // not found, minus 1
            }
            // compute timestamp (average)
            book_info[i].time_info.timestamp = parseInt((book_info[i].time_info.left_bound_adjust + book_info[i].time_info.right_bound_adjust) / 2)
        }
    }
    // round 4
    for (let i in book_info) {
        // console.log('i', i)
        if (!(book_info[i].time_info.certainty) && (book_info[i].time_info.left_bound_adjust === null) && (book_info[i].time_info.right_bound_adjust === null)) { // type 4
            // 前后延拓，找到临近第一个非 type 4 的event
            let pre_timestamp = 960,
                next_timestamp = 1965,
                prev_i = Number(i),
                next_i = Number(i)
            while (prev_i >= 0) {
                if ((book_info[prev_i].time_info.left_bound_adjust !== null) && (book_info[prev_i].time_info.right_bound_adjust !== null)) {
                    pre_timestamp = book_info[prev_i].time_info.timestamp
                    break
                } else { prev_i -= 1 }     
            }
            while (next_i < book_info.length) {
                // console.log('next_i', next_i)
                if ((book_info[next_i].time_info.left_bound_adjust !== null) && (book_info[next_i].time_info.right_bound_adjust !== null)) {
                    next_timestamp = book_info[next_i].time_info.timestamp
                    break
                } else { next_i += 1 }       
            }
            book_info[i].time_info.timestamp = parseInt(pre_timestamp + (next_timestamp - pre_timestamp) * (i - prev_i) / (next_i - prev_i))
        }
    }
    return book_info
}

export { infer_book_time, re_infer_book_time }