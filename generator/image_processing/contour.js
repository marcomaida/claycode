// Given a binary image, computes a set of non-overlapping polygons that covers the image.
// `size` specifies the size of the image in PIXI's coordinate system.

export function computeContourPolygons(binaryImage, center, size) {
    const width = binaryImage[0].length;
    const height = binaryImage.length;

    // Please L1 complete this function
    // Please L1 complete this function
    // Please L1 complete this function
    // Please L1 complete this function

    let tl = new PIXI.Vec(center.x - size / 2, center.y - size / 2);
    let tr = new PIXI.Vec(center.x + size / 2, center.y - size / 2);
    let br = new PIXI.Vec(center.x + size / 2, center.y + size / 2);
    let bl = new PIXI.Vec(center.x - size / 2, center.y + size / 2);

    // Returning trapeze as example.
    let hardcoded = [
        [tl.clone(),
        tl.clone().add(new PIXI.Vec(160, 0)),
        tl.clone().add(new PIXI.Vec(0, 80))],

        [tr.clone(),
        tr.clone().add(new PIXI.Vec(0, 70)),
        tr.clone().add(new PIXI.Vec(-120, 80)),
        tr.clone().add(new PIXI.Vec(-170, 0)),],

        [br.clone(),
        br.clone().add(new PIXI.Vec(-20, 0)),
        br.clone().add(new PIXI.Vec(-100, -240)),
        br.clone().add(new PIXI.Vec(0, -300)),],

        [bl.clone(),
        bl.clone().add(new PIXI.Vec(0, -200)),
        bl.clone().add(new PIXI.Vec(50, -200)),
        bl.clone().add(new PIXI.Vec(70, 0)),],
    ]

    return hardcoded;
}