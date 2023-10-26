const debug = true;

export class Iterator {
    constructor(root) {
        this.values = [];
        this.size = 0;
        this.ptr = -1;
        this.initialize_values(root);
    }

    initialize_values(root) {
        let forward = bfs(root).map((d) => {
            return [d, "fw"];
        });
        let backward = dfs(root).map((d) => {
            return [d, "bw"];
        });
        this.values = forward.concat(backward);
        this.size = this.values.length;
    }

    next() {
        this.ptr = (this.ptr + 1) % this.size;
        return this.values[this.ptr];
    }
}

function bfs(root) {
    let queue = [root];
    let res = [];
    while (queue.length > 0) {
        let cur = queue.shift();
        if ("children" in cur) res.push(cur.node_idx);
        for (let child in cur.children) {
            queue.push(cur.children[child]);
        }
    }
    return res;
}

function dfs(root) {
    let res = [];
    let stack = [root];
    let flags = [true];
    while (stack.length > 0) {
        let cur = stack.slice(-1)[0];
        let flag = flags.slice(-1)[0];
        if (flag) {
            flags[flags.length - 1] = false;
            for (let name in cur.children) {
                let child = cur.children[name];
                stack.push(child);
                flags.push("children" in child);
            }
        } else {
            if ("children" in cur) res.push(cur.node_idx);
            stack.pop();
            flags.pop();
        }
    }
    return res;
}
