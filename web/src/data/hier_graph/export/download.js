export function exportJson(data) {
    const data_ = copy_obj(data);
    // test(data);
    const jsonData = JSON.stringify(data_);
    const blob = new Blob([jsonData], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "data.json";
    link.click();

    URL.revokeObjectURL(url);
}

function isArray(obj) {
    return Object.prototype.toString.call(obj) === "[object Array]";
}

// function process_graph_data(data) {
function copy_obj(obj) {
    if (typeof obj !== "object") return obj;
    if (obj && !obj.isObject && Array.isArray(obj)) {
        return obj.map((d) => copy_obj(d));
    } else {
        let res = {};
        for (let name in obj) {
            res[name] = copy_obj(obj[name]);
        }
        return res;
    }
}
// return copy_obj(data);
// }

function test(data) {
    const nodes = data.nodes;
    for (let node of nodes) {
        console.log(Array.isArray(node));
        console.log(typeof node);
        console.log(isArray(node));
    }
}
