let graphics = null
const DEBUG_COLOR = 0x22AA22

export function initDebug(app) {
    graphics = new PIXI.Graphics();
    app.stage.addChild(graphics);
}

export function drawDebugCircle(center, radius, color = DEBUG_COLOR) {
    graphics.beginFill(color);
    graphics.drawCircle(center.x, center.y, radius);
    graphics.endFill();
}

export function drawDebugPolygon(points, color = DEBUG_COLOR) {
    graphics.beginFill(color);
    const pts = points.map(p => new PIXI.Point(p.x, p.y))
    graphics.drawPolygon(pts)
    graphics.endFill();
}

export function drawDebugRegularPolygon(center, radius, sides, color = DEBUG_COLOR) {
    var points = []
    for (var i = 0; i < sides; i++) {
        const angle = i / sides * 2 * Math.PI
        var p = new PIXI.Vector(Math.cos(angle), Math.sin(angle))
        p.multiplyScalar(radius)
        p.add(center)
        points.push(p)
    }
    
    drawDebugPolygon(points, color)
}

/**     D
 *      /\         Draws an arrow from start to end using 
 *    /    \       the specified thickness
 * C /__  __\ E  
 *    B| |F 
 *     |_|
 *    A   G
 */
export function drawDebugArrow(start, end, thickness = 3, color = DEBUG_COLOR) {
    const dir = end.clone().sub(start).normalize()
    const head_start = start.clone().lerp(end, .9)

    dir.perpendicular(true).multiplyScalar(thickness)
    const a = start.clone().add(dir)
    const b = head_start.clone().add(dir)
    const c = b.clone().add(dir)
    const d = end.clone()
    
    dir.multiplyScalar(-1)
    const e = head_start.clone().add(dir).add(dir)
    const f = head_start.clone().add(dir)
    const g = start.clone().add(dir)

    const points = [a,b,c,d,e,f,g]
    
    drawDebugPolygon(points, color)
}

export function clearDebug() {
    graphics.clear()
}