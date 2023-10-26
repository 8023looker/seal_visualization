import gsap from "gsap";
import * as d3 from "d3";

export function zoomWithCenter(
    scale = 0,
    center = null,
    transition = true,
    overlay = true
) {
    const cTransform = d3.zoomTransform(this.containerWrapper.node());
    const cScale = cTransform.k;
    const cCenter = [
        (this.width / 2 - cTransform.x) / cTransform.k,
        (this.height / 2 - cTransform.y) / cTransform.k,
    ];
    if (center === null) {
        center = cCenter;
    }
    if (transition === true) {
        transition = 400;
    }
    if (scale === 0) {
        if (transition) {
            this.containerWrapper
                .transition()
                .duration(transition)
                .call(this.zoomController.transform, d3.zoomIdentity);
        } else {
            this.containerWrapper.call(
                this.zoomController.transform,
                d3.zoomIdentity
            );
        }
    } else {
        let nScale = overlay
            ? Math.max(0.5, Math.min(cScale * scale, 8))
            : scale;
        let nTranslate = new Point(...this.zoomController.extent()()[1])
            .mul(0.5)
            .sub(new Point(...center).mul(nScale));
        if (transition) {
            this.containerWrapper
                .transition()
                .duration(transition)
                .call(
                    this.zoomController.transform,
                    d3.zoomIdentity
                        .translate(...nTranslate)
                        .scale(nScale)
                );
        } else {
            this.containerWrapper.call(
                this.zoomController.transform,
                d3.zoomIdentity.translate(...nTranslate).scale(nScale)
            );
        }
    }
}