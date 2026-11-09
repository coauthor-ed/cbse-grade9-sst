// EarthMap.js - the world map of the earth-surface scenes: Pacific in the middle, as in the book's map of
// earthquakes and volcanoes, land with no country lines, India only from the Survey of India layer.
//   const m = await worldMap(ctx, names, box)   { view, map } ; names are layers beyond land and india
//   paintWorld(o, c, m)                         sea, land, India
//   dots(o, v, rows, r, col, a)                 a batched circle per [lon, lat]
//   mapCredit(ctx, c, y)                        the credit, large enough to read on a phone
import { pill, mix } from 'simulations/base/kit/SimLook.js';
import { loadMap, makeView, drawLand, drawIndia, CREDIT_INDIA } from 'simulations/base/kit/GeoMap.js';
import { earthColour } from './EarthArt.js';

export const MAP_BOX = { x: 4, y: 4, w: 672, h: 344 };

export async function worldMap(ctx, names = [], box = MAP_BOX) {
  const map = await loadMap(['land', 'india', ...names]);
  const view = await makeView(ctx, { kind: 'naturalEarth', rotate: [-150, 0], box });
  return { map, view, box };
}
export function paintWorld(o, c, m) {
  const v = m.view;
  o.save();
  o.beginPath(); v.path.context(o)({ type: 'Sphere' });
  o.fillStyle = mix(c.seaShallow, c.bgSurface, 0.56); o.fill();
  o.restore();
  drawLand(o, v, c, m.map.land, { fill: mix(c.elevMid, c.bgSurface, 0.3), stroke: earthColour(c, 'grassDark'), lineWidth: 1 });
  drawIndia(o, v, c, m.map.india, { fill: c.elevMid, stroke: earthColour(c, 'ink'), lineWidth: 1.4, credit: false });
}
export function dots(o, v, pts, r, col, a = 1) {
  const p = new Path2D();
  for (const q of pts) { const xy = v.at(q); if (!xy) continue; p.moveTo(xy[0] + r, xy[1]); p.arc(xy[0], xy[1], r, 0, 7); }
  o.save(); o.globalAlpha = a; o.fillStyle = col; o.fill(p); o.restore();
}
export function triangles(o, v, pts, s, col, rim) {
  const p = new Path2D();
  for (const q of pts) { const xy = v.at(q); if (!xy) continue; p.moveTo(xy[0], xy[1] - s); p.lineTo(xy[0] + s, xy[1] + s * 0.7); p.lineTo(xy[0] - s, xy[1] + s * 0.7); p.closePath(); }
  o.save(); o.fillStyle = col; o.fill(p); if (rim) { o.strokeStyle = rim; o.lineWidth = 1; o.stroke(p); } o.restore();
}
export function mapCredit(ctx, c, y = 500) {
  pill(ctx, c, CREDIT_INDIA, 340, y, { size: 30, bg: c.bgSurface, ink: c.label });
}
