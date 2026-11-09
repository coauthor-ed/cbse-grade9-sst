// OceanWorld.js - one hero cross-section of a sea world with five areas that can be lit: the sea floor;
// moving water and the Moon; ships and rigs; warning instruments and a cyclone; zones measured from the
// coast. Own art, a whole sea on one stage. SVG only: use on an SvgScene. Plain text comes from the scene.
//
//   OCEAN_AREAS                      [{ id, target }] ids: floor, water, ships, warn, zones
//   svgOceanWorld(W, H, { lit, t, only })   a string of SVG. lit: null, an id, or a Set of ids; areas not lit
//                                    dim to about a half and lose colour (dim, never bleach, never glow). t moves the waves.
//                                    only: draw just those ids (a Set), the backdrop always.
//   oceanAnchor(W, H, id)            { x, y } on the stage, a good place for a tag on that area
// Works from 340 x 300 up to landscape: things are placed as parts of W and H. Sea and sky are their own
// daylight, so a scene writes on them with svgSeaColour('ink') or 'cloud', never --sim-label.
import {
  svgSeaColumn, svgWaveLine, svgCloud, svgSun, svgMoon, svgCargoShip, svgTrawler, svgOilRig, svgBuoy, svgSatellite,
  svgLighthouse, svgPalm, svgHut, svgFish, svgCoral, svgSeagrass, svgSeaColour as sc, pathLine as line, svgSkyGradient,
} from './SeaArt.js';
import { svgSeaFloor, waterPts, floorPts, mapper, floorDepth } from './SeaFloor.js';

export const OCEAN_AREAS = [
  { id: 'floor', target: 'floor' }, { id: 'water', target: 'water' }, { id: 'ships', target: 'ships' },
  { id: 'warn', target: 'warn' }, { id: 'zones', target: 'zones' },
];
const seaYOf = (H) => H * 0.42;
const boxOf = (W, H) => ({ x: 0, y: 0, w: W, h: H, seaY: seaYOf(H) });
const scaleOf = (W, H) => Math.min(W / 680, H / 460) * 1.1;

export function oceanAnchor(W, H, id) {
  const sy = seaYOf(H), s = scaleOf(W, H);
  switch (id) {
    case 'floor': return { x: W * 0.52, y: H * 0.86 };
    case 'water': return { x: W * 0.46, y: sy + 40 * s };
    case 'ships': return { x: W * 0.47, y: sy - 80 * s };
    case 'warn': return { x: W * 0.8, y: sy - 96 * s };
    case 'zones': return { x: W * 0.2, y: sy + 26 * s };
    default: return { x: W / 2, y: H / 2 };
  }
}
function spiral(cx, cy, r, t) {
  // A cyclone seen slanted from the side: bands of cloud round a clear eye.
  let body = '';
  for (let k = 0; k < 3; k++) {
    const pts = [];
    for (let i = 0; i <= 44; i++) {
      const a = i / 44 * Math.PI * 1.7 + k * Math.PI * 2 / 3 - (t ?? 0) * 0.25, q = r * (0.26 + 0.74 * i / 44);
      pts.push([cx + Math.cos(a) * q, cy + Math.sin(a) * q * 0.42]);
    }
    body += `<path d="${line(pts)}" style="fill:none;stroke:${sc('cloud')};stroke-width:${r * 0.2};stroke-linecap:round;opacity:0.94"/>`;
  }
  body += `<ellipse cx="${cx}" cy="${cy}" rx="${r * 0.13}" ry="${r * 0.06}" style="fill:${sc('seaMid')}"/>`;
  return body;
}
export function svgOceanWorld(W, H, o = {}) {
  const box = boxOf(W, H), sy = box.seaY, s = scaleOf(W, H), t = o.t ?? 0, mp = mapper(box);
  const lit = o.lit == null ? null : (o.lit instanceof Set ? o.lit : new Set([o.lit]));
  const want = (id) => !o.only || o.only.has(id);
  const op = (id) => (lit && !lit.has(id) ? 'opacity:0.5;filter:saturate(0.45)' : 'opacity:1');
  const area = (id, inner) => (want(id) ? `<g data-area="${id}" style="${op(id)};transition:opacity 0.22s ease">${inner}</g>` : '');
  const skyId = `ow-sky-${Math.round(W)}x${Math.round(H)}`;
  const water = waterPts(box);
  const clip = `ow-water-${Math.round(W)}x${Math.round(H)}`;
  const X = mp.X, coastX = X(84);

  let bg = `<defs>${svgSkyGradient(skyId, 0, 12)}<clipPath id="${clip}"><path d="${line(water)}Z"/></clipPath></defs>`;
  bg += `<rect x="0" y="0" width="${W}" height="${sy + 4}" style="fill:url(#${skyId})"/>`;
  bg += svgCloud(W * 0.3, sy - 96 * s, 0.56 * s, { seed: 3 }) + svgCloud(W * 0.66, sy - 60 * s, 0.34 * s, { seed: 7 });
  bg += `<g clip-path="url(#${clip})">${svgSeaColumn(0, sy, 1, { w: W, h: H - sy, bands: 5, t, wave: 2.4 })}</g>`;

  const floor = svgSeaFloor(box, { step: 6 });
  const fish = svgFish(X(150), sy + 40 * s, 0.5 * s) + svgFish(X(190), sy + 56 * s, 0.42 * s, { kind: 1, flip: true }) + svgFish(X(120), sy + 58 * s, 0.34 * s, { kind: 2 });
  const life = svgSeagrass(X(130), mp.Y(floorDepth(130)) + 2, 0.44 * s, { t }) + svgCoral(X(170), mp.Y(floorDepth(170)) + 2, 0.44 * s, { seed: 2 });
  const coast = svgPalm(X(44), mp.Y(floorDepth(44)) + 2, 0.56 * s, { t }) + svgHut(X(20), mp.Y(floorDepth(20)) + 2, 0.5 * s) + svgLighthouse(X(68), mp.Y(floorDepth(68)) + 2, 0.56 * s);

  // Water area: the Moon and a current drawn in the water; its arrow bodies are thick and rounded.
  const curY = sy + (H - sy) * 0.3;
  const arrow = (x0, x1, y, col) => `<path d="M${x0} ${y}C${(x0 * 2 + x1) / 3} ${y - 16 * s} ${(x0 + x1 * 2) / 3} ${y + 16 * s} ${x1} ${y}" style="fill:none;stroke:${col};stroke-width:${6 * s};stroke-linecap:round"/><path d="M${x1 - 3 * s} ${y - 12 * s}L${x1 + 15 * s} ${y + 1 * s}L${x1 - 4 * s} ${y + 12 * s}Z" style="fill:${col}"/>`;
  const moving = svgMoon(W * 0.44, sy - 128 * s, 0.56 * s, { phase: 0.5 })
    + svgWaveLine(0, sy, 1, { w: W, amp: 3.2, len: 28, t })
    + arrow(X(310), X(420), curY, sc('foam')) + arrow(X(650), X(770), curY + 8 * s, sc('foam'));

  const ships = svgCargoShip(X(470), sy + 3, 0.46 * s, { flip: false }) + svgOilRig(X(150), sy + 2, 0.5 * s, { legs: (mp.Y(floorDepth(150)) - sy) / (0.5 * s) + 4 }) + svgTrawler(X(290), sy + 3, 0.32 * s);
  const warn = svgBuoy(X(690), sy + 3, 0.46 * s) + svgSatellite(W * 0.6, sy - 150 * s + 8, 0.4 * s) + spiral(W * 0.84, sy - 104 * s, 96 * s, t);

  // Zones: distance ticks from the coast along the surface. Not to scale.
  const zt = (x, h) => `<path d="M${x} ${sy - 3}L${x} ${sy + h}" style="fill:none;stroke:${sc('cloud')};stroke-width:${3.2 * s};stroke-linecap:round;stroke-dasharray:${8 * s} ${7 * s}"/>`;
  const z1 = coastX + W * 0.05, z2 = coastX + W * 0.11, z3 = coastX + W * 0.3;
  const zones = zt(coastX, 30 * s) + zt(z1, 56 * s) + zt(z2, 56 * s) + zt(z3, 56 * s)
    + `<path d="M${coastX} ${sy + 20 * s}H${z3}" style="fill:none;stroke:${sc('cloud')};stroke-width:${4 * s};stroke-linecap:round"/>`;

  const mapFloor = area('floor', floor + life);
  return bg + area('water', moving) + mapFloor + (want('floor') ? '' : floor) + fish + coast + area('zones', zones) + area('ships', ships) + area('warn', warn);
}
