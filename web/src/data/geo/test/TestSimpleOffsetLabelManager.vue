<template>
    <div style="position: fixed; top: 0; left: 0; height: 100%; width: 100%">
        <svg style=" height: 100%; width: 100%" viewBox="-500 -500 2000 2000" ref="svgEl">
        </svg>
    </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted, onUnmounted } from 'vue'

import * as d3 from "d3";
import { Point, Polygon } from "@/data/geo/geometry";
import {simpleOffsetLabelManager} from "@/data/geo/composable/simpleOffsetLabelManager";

const svgEl = ref(null);

onMounted(() => {
    const svgG = d3.select(svgEl.value);
    svgG.selectAll("*").remove();

    const N = 40;
    
    const circles = [];
    for (let i = 0; i < N; ++i) {
        const x = 500 + (0.5 - Math.random()) * 800;
        const y = 500 + (0.5 - Math.random()) * 800;
        const r = Math.random() * 50 + 20;
        // const x = 500 + i * 100;
        // const y = 500;
        // const r = 50;
        circles.push(new Polygon.Circle(new Point(x, y), r));
    }
    const labelManager = new simpleOffsetLabelManager(1000, 1000);
    for (let i of circles) {
        const height = Math.random() * 100 + 20;
        const width = Math.random() * 100 + 20;
        // const height = 50;
        // const width = 100;
        labelManager.addObject(i.center.x, i.center.y, i.r, true, width, height);
        i.drawOnSvg(svgG);
    }
    labelManager.iterativeGreedy();
    for (let i of labelManager.objects) {
        i.label.drawOnSvg(svgG);
        svgG.append('line').attrHelper( {
            x1: i.label.center.x,
            y1: i.label.center.y,
            x2: i.feature.center.x,
            y2: i.feature.center.y,
            stroke: 'black',
            'stroke-width': 1
        });
    }
});

</script>   

<style scoped></style>