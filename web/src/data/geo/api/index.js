import * as d3 from "d3";
import { read_data } from "@/data/Data";
import * as Theme from "@/theme";
import * as Data from "@/data/Data";

let vueComponent = null;

export function registerVueComponent(component, width, height) {
    if (vueComponent) {
        return;
    }
    vueComponent = component;
}

export function cur_graph_layout() {
    if (vueComponent.overviewMode) {
        const augmentedData = Data.Geo.augmentTrajectoryData(read_data().trajs);
        const odNodes = vueComponent.odNodes;
        const odEdges = vueComponent.odEdges;
        const oriIdxNode = vueComponent.oriIdx2Node;
        const oriIdxEdge = vueComponent.oriIdx2Edge;
        for (let i of augmentedData) {
            const node = odNodes[oriIdxNode.get(i.ori_idx)];
            i.node_state = {
                x: node.projectedX,
                y: node.projectedY,
                fill: Theme.color.majorFontColor,
                opacity: 0.8,
                r: node.filteredWeight > 0 ? Math.log2(node.filteredWeight) * 2 + 2 : 0,
            };
            if (i.prev) {
                const edgeIdx = oriIdxEdge.get(i.prev.ori_idx);
                if (edgeIdx !== undefined) {
                    const edge = odEdges[edgeIdx];
                    const edgeLastPoint = edge[edge.length - 1];
                    i.edge_state = {
                        d: `M${edge[0].x},${edge[0].y} l${edgeLastPoint.x - edge[0].x},${edgeLastPoint.y - edge[0].y}`,
                        stroke: Theme.color.mapArrowColor,
                        stroke_width: 1,
                        stroke_opacity: 0.7,
                        source: {
                            x: edge[0].x,
                            y: edge[0].y,
                        },
                        target: {
                            x: edgeLastPoint.x,
                            y: edgeLastPoint.y,
                        }
                    }
                }
                else {
                    i.edge_state = {
                        d: `M${node.projectedX},${node.projectedY} l${0},${0}`,
                        stroke: Theme.color.mapArrowColor,
                        stroke_width: 1,
                        stroke_opacity: 0.7,
                        source: {
                            x: node.projectedX,
                            y: node.projectedY,
                        },
                        target: {
                            x: node.projectedX,
                            y: node.projectedY,
                        }
                    }
                }
                
            }
        }
        return augmentedData;
    }
    else {
        const augmentedData = Data.Geo.augmentTrajectoryData(read_data().trajs);
        const singleBookData = vueComponent.drawer.data;
        for (let i = 0; i < singleBookData.length; ++i) {
            const cur = singleBookData[i];
            cur.node_state = {
                x: cur.node.pos.x,
                y: cur.node.pos.y,
                fill: Theme.color.majorFontColor,
                opacity: 1,
                r: 3,
            };
            if (i !== 0) {
                const source = {
                    x: cur.edge?.src?.x || cur.node.pos.x,
                    y: cur.edge?.src?.y || cur.node.pos.y,
                };
                const target = {
                    x: cur.edge?.dst?.x || cur.node.pos.x,
                    y: cur.edge?.dst?.y || cur.node.pos.y,
                };  
                cur.edge_state = {
                    stroke: Theme.color.mapArrowColor,
                    stroke_width: 2.5,
                    stroke_opacity: 1,
                    source,
                    target,
                    d: `M${source.x},${source.y} l${target.x - source.x},${target.y - source.y}`
                }
            }
            const index = augmentedData.findIndex(d => d.ori_idx === cur.ori_idx);
            augmentedData[index] = cur;
        }
        console.log(singleBookData);
        return augmentedData;
    }
}
