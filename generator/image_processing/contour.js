// Given a binary image, computes a set of non-overlapping polygons that covers the image.
// `size` specifies the size of the image in PIXI's coordinate system.

export function computeContourPolygons(binaryImage, center, size) {
    const width = binaryImage[0].length;
    const height = binaryImage.length;

    // Please L1 complete this function
    // Please L1 complete this function
    // Please L1 complete this function
    // Please L1 complete this function

    // Returning trapeze as example.
    let res = [
        new PIXI.Vec(center.x - size / 2, center.y - size / 2),
        new PIXI.Vec(center.x + size / 2, center.y - size / 2),
        new PIXI.Vec(center.x + size / 2, center.y + size / 2),
        new PIXI.Vec(center.x, center.y + size / 2)]

    // Returning another square.
    let hardcoded = [
        new PIXI.Vec(100, 100),
        new PIXI.Vec(200, 100),
        new PIXI.Vec(200, 200),
        new PIXI.Vec(100, 200)]

    return [res, hardcoded];
}