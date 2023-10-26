import { Node } from "../graph";

export class HierNode extends Node {
    static id_map = new Map();

    static get [Symbol.species]() {
        return this;
    }

    constructor(id, name, level) {
        super();
        this.node_idx = id;
        this.name = name;
        this.level = level;
        this.trajs = [];
        this.out_trajs = [];
        this.isObject = true;
    }

    is_leaf() {
        if (this.type === "lib") {
            return true;
        }
        return false;
    }

    set_type(type, name_type, traj) {
        this.type = type;
        this.name_type = name_type;
        if (type === "lib") {
            this.lib_type = traj.lib_type;
            this.lib_type_lang = traj.lib_type_lang;
            this.lib_name_lang = traj.library_lang;
            this.lib_id = traj.lib_id;
        }
    }

    set_parent(parent) {
        this.parent = parent;
    }

    add_traj(id) {
        this.size++;
        this.trajs.push(id);
    }

    add_out_traj(id) {
        this.out_trajs.push(id);
    }
}
