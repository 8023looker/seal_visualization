// Node 类，用于表示树中的一个节点
class Node {
    constructor(value) {
        this.value = value;
        this.parent = null;
        this.children = [];
    }

    // 添加一个子节点
    addChild(child) {
        child.parent = this;
        this.children.push(child);
    }
}

// function

export function construct_tree(tree) {
    function add_child(root) {
        if (root.children === undefined) return;
        for (let child_name in root.children) {
            let child = root.children[child_name];
            child.parent = root;
            add_child(child);
        }
    }
    add_child(tree);
}

// 找到两个节点的最小公共祖先
export function findLCA(root, node1, node2) {
    // 找到节点 1 和节点 2 的深度
    let depth1 = getDepth(root, node1);
    let depth2 = getDepth(root, node2);

    // 如果节点 1 的深度大于节点 2 的深度，则将节点 1 向上移动到相同深度
    while (depth1 > depth2) {
        node1 = node1.parent;
        depth1--;
    }

    // 如果节点 2 的深度大于节点 1 的深度，则将节点 2 向上移动到相同深度
    while (depth2 > depth1) {
        node2 = node2.parent;
        depth2--;
    }

    // 从节点 1 和节点 2 开始同时向上遍历，直到它们相遇
    while (node1 !== node2) {
        node1 = node1.parent;
        node2 = node2.parent;
    }

    // 返回最小公共祖先
    return node1;
}

// 辅助函数：获取节点在树中的深度
function getDepth(root, node) {
    let depth = 0;
    while (node !== root) {
        node = node.parent;
        depth++;
    }
    return depth;
}
