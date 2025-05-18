/* MIT License with Commons Clause
Copyright (c) 2025 Claycode
See LICENSE file in the root of this project for license details.
Commercial use is prohibited without a separate license. */

let graphics = null;
const DEFAULT_COLOR = 0x22aa22;

export function initDrawing(app) {
  graphics = new PIXI.Graphics();
  app.stage.addChild(graphics);
}

export function drawCircle(center, radius, color = DEFAULT_COLOR) {
  graphics.beginFill(color);
  graphics.drawCircle(center.x, center.y, radius);
  graphics.endFill();
}

export function drawPolygon(points, color = DEFAULT_COLOR) {
  graphics.beginFill(color);
  const pts = points.map((p) => new PIXI.Point(p.x, p.y));
  graphics.drawPolygon(pts);
  graphics.endFill();
}

export function drawPolygonVertices(points, radius = 5, color = DEFAULT_COLOR) {
  points.forEach((point) => {
    drawCircle(point, radius, color);
  });
}

export function drawRoundedRect(
  x,
  y,
  width,
  height,
  radius = 3,
  color = DEFAULT_COLOR
) {
  graphics.beginFill(color);
  graphics.drawRoundedRect(x, y, width, height, radius);
  graphics.endFill();
}

export function drawRegularPolygon(
  center,
  radius,
  sides,
  color = DEFAULT_COLOR
) {
  var points = [];
  for (var i = 0; i < sides; i++) {
    const angle = (i / sides) * 2 * Math.PI;
    var p = new PIXI.Vec(Math.cos(angle), Math.sin(angle));
    p.multiplyScalar(radius);
    p.add(center);
    points.push(p);
  }

  drawPolygon(points, color);
}

/**     D
 *      /\         Draws an arrow from start to end using
 *    /    \       the specified thickness
 * C /__  __\ E
 *    B| |F
 *     |_|
 *    A   G
 */
export function drawArrow(start, end, thickness = 3, color = DEFAULT_COLOR) {
  const dir = end.clone().sub(start).normalize();
  const head_start = start.clone().lerp(end, 0.9);

  dir.perpendicular(true).multiplyScalar(thickness);
  const a = start.clone().add(dir);
  const b = head_start.clone().add(dir);
  const c = b.clone().add(dir);
  const d = end.clone();

  dir.multiplyScalar(-1);
  const e = head_start.clone().add(dir).add(dir);
  const f = head_start.clone().add(dir);
  const g = start.clone().add(dir);

  const points = [a, b, c, d, e, f, g];

  drawPolygon(points, color);
}

export function clearDrawing() {
  graphics.clear();
}
