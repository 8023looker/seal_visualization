<template>
    <div style="position: fixed; top: 0; left: 0; height: 100%; width: 100%">
        <svg style=" height: 100%; width: 100%" viewBox="0 0 1000 1000" ref="svgEl">
        </svg>
    </div>
</template>


<script setup>
import { ref, reactive, computed, watch, onMounted, onUnmounted } from 'vue'

import * as d3 from "d3";
import { Point, Polygon } from "@/data/geo/geometry";

const svgEl = ref(null);

onMounted(() => {

    const svgG = d3.select(svgEl.value);
    svgG.selectAll("*").remove();
    const dynamicsG = svgG.append('g').classed("dynamicsG", true);

    const draggable = d3.drag()
        .on("start", function (event, d) {
            this.dragRelX = d.center.x - event.x;
            this.dragRelY = d.center.y - event.y;
        })
        .on("drag", function (event, d, el) {
            d.center.x = event.x + this.dragRelX;
            d.center.y = event.y + this.dragRelY;
        })
        .on("drag.render", (event, d) => {
            d.drawOnSvg(svgG);
        })



    let cnt = 0;

    // const c = new Polygon.Circle(new Point(500, 500), 100);
    const c = new Polygon.Rect(new Point(500, 500), new Point(100, 100));
    const r0 = new Polygon.Rect(new Point(180, 500), new Point(80, 80));
    c.drawOnSvg(svgG);
    r0.drawOnSvg(svgG);
    c.gEl.call(draggable);
    r0.gEl.call(draggable);
    function animation() {
        cnt += 1;
        render();
        requestAnimationFrame(animation);
    }
    function render(tar) {
        // const dir = new Point(Math.cos(ang), Math.sin(ang));
        let dir;
        if (tar === undefined || (tar.x === c.center.x && tar.y === c.center.y)) {
            const ang = Math.PI / 100 * cnt;
            dir = new Point(Math.cos(ang), Math.sin(ang))
        }
        else {
            dir = tar.sub(r0.center).toOne();
        }
        // const intr = Polygon.getRectCircleIntersectInterval(r0, c, dir);
        const intr = Polygon.getRectRectIntersectInterval(r0, c, dir);
        dynamicsG.selectAll("*").remove();
        dynamicsG.append('line')
            .attrHelper({
                x1: r0.center.add(dir.mul(1000)).x,
                y1: r0.center.add(dir.mul(1000)).y,
                x2: r0.center.add(dir.mul(-1000)).x,
                y2: r0.center.add(dir.mul(-1000)).y,
                stroke: 'red',
                'stroke-width': 1,
            })
        if (intr === null) {
            // console.log(intr);
        }
        else {
            const r1 = new Polygon.Rect(r0.center.add(dir.mul(intr[0])), r0.extent);
            const r2 = new Polygon.Rect(r0.center.add(dir.mul(intr[1])), r0.extent);
            r1.drawOnSvg(dynamicsG);
            r2.drawOnSvg(dynamicsG);
            // console.log(intr);    
        }
    }
    d3.select(svgEl.value).on("mousemove", (event) => {
        const p = new Point(...d3.pointer(event));
        render(p);

    });
    // animation();

})
</script>


<style scoped></style>