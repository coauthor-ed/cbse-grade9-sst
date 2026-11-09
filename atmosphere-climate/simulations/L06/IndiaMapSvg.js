// IndiaMapSvg - India on an SVG stage for the monsoon scenes of L06 and L07. Helper, not a scene.
// India's outline comes only from the Survey of India layer (SimGeo.loadLayer('india')); neighbours are
// plain land from the world layer. Every map carries CREDIT on screen.
//   const geo = await loadIndia();
//   const v = indiaView(geo, box, extent);     box { x, y, w, h } in stage px, extent [[lon0, lat0], [lon1, lat1]]
//   v.at([lon, lat]) -> [x, y]                 v.d(geojson) -> path d   v.line(points) -> smooth path d
//   mapSvg(v, { fade })                        the sea, plain land and India, clipped to the box
//   creditSvg(v)                               the credit line, inside the box at the foot
import { SimGeo } from 'simulations/base/SimGeo.js';
import { CREDIT_INDIA } from 'simulations/base/kit/GeoMap.js';
import * as SkyArt from '../shared/SkyArt.js';
import { creditPlate } from '../L03/AirDraw.js';
const { svgSkyColour: sky } = SkyArt;

export async function loadIndia() {
  const [d3, land, india] = await Promise.all([SimGeo.d3(), SimGeo.loadWorld('land'), SimGeo.loadLayer('india')]);
  return { d3, land, india, cache: new Map() };
}

export function indiaView(geo, box, extent) {
  const key = `${box.x},${box.y},${box.w},${box.h},${extent}`;
  const hit = geo.cache.get(key);
  if (hit) return hit;
  const [[x0, y0], [x1, y1]] = extent;
  const proj = geo.d3.geoMercator();
  proj.fitExtent([[box.x, box.y], [box.x + box.w, box.y + box.h]], { type: 'MultiPoint', coordinates: [[x0, y0], [x1, y1], [x0, y1], [x1, y0]] });
  const path = geo.d3.geoPath(proj);
  const d = (g) => (path(g) || '').replace(/(\.\d)\d+/g, '$1');
  const at = (ll) => proj(ll);
  const v = {
    box, at, d, id: `m${Math.round(box.w)}x${Math.round(box.h)}`,
    land: d(geo.land), india: d(geo.india),
    line(pts) {
      const p = pts.map(at);
      let s = `M${p[0][0].toFixed(1)} ${p[0][1].toFixed(1)}`;
      for (let i = 1; i < p.length - 1; i++) {
        const mx = (p[i][0] + p[i + 1][0]) / 2, my = (p[i][1] + p[i + 1][1]) / 2;
        s += `Q${p[i][0].toFixed(1)} ${p[i][1].toFixed(1)} ${mx.toFixed(1)} ${my.toFixed(1)}`;
      }
      const e = p[p.length - 1];
      return `${s}L${e[0].toFixed(1)} ${e[1].toFixed(1)}`;
    },
  };
  geo.cache.set(key, v);
  return v;
}

/** The sea, plain land and India, in a rimmed panel. Open with this; close the clip with mapEnd. */
export function mapSvg(v, o = {}) {
  const b = v.box;
  return `<defs><clipPath id="${v.id}"><rect x="${b.x}" y="${b.y}" width="${b.w}" height="${b.h}" rx="16"/></clipPath></defs>`
    + `<g clip-path="url(#${v.id})"><rect x="${b.x}" y="${b.y}" width="${b.w}" height="${b.h}" style="fill:${sky('sea')}"/>`
    + `<path d="${v.land}" style="fill:color-mix(in oklab, ${sky('sand')} 70%, var(--sim-bg-surface));stroke:${sky('sandDark')};stroke-width:1.5"/>`
    + `<path d="${v.india}" style="fill:color-mix(in oklab, ${sky('grass')} ${o.dry ? 14 : 34}%, ${sky('sand')});stroke:${sky('ink')};stroke-width:2;stroke-linejoin:round"/>`;
}
export const mapEnd = (v) => `</g><rect x="${v.box.x}" y="${v.box.y}" width="${v.box.w}" height="${v.box.h}" rx="16" style="fill:none;stroke:var(--sim-stroke);stroke-width:3"/>`;

export const CREDIT = CREDIT_INDIA;
/** Credit on a small plate at the foot of the map: at least 12 px on screen at 390. */
export function creditSvg(v, o = {}) {
  return creditPlate(v.box.x + v.box.w, v.box.y + v.box.h, o);
}

/** Map text with a halo, for use on the map. */
export function mapText(x, y, s, o = {}) {
  const ink = o.ink ?? sky('ink'), halo = o.halo ?? sky('cloud');
  return `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" text-anchor="${o.anchor ?? 'middle'}" style="font:${o.weight ?? 600} ${o.size ?? 14}px var(--sim-font-display, var(--sim-font));fill:${ink};paint-order:stroke;stroke:${halo};stroke-width:3.5;stroke-linejoin:round${o.opacity != null ? `;opacity:${o.opacity}` : ''}">${s}</text>`;
}

/** A pin: a filled round head with a rim. */
export function pinSvg(x, y, o = {}) {
  const c = o.c ?? 'var(--sim-accent)', r = o.r ?? 5;
  return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r}" style="fill:${c};stroke:${sky('cloud')};stroke-width:2.5"/>`;
}

/** A date from MonsoonLines as a short range: "25-30 June", "26 May to 1 June", or one date. */
export function dateSpan(d) {
  if (!d) return '';
  if (d.on) return d.on;
  if (d.before) return `before ${d.before}`;
  const [a, ma] = d.after.split(' '), [b, mb] = d.by.split(' ');
  return ma === mb ? `${a}-${b} ${mb}` : `${d.after} to ${d.by}`;
}

export const READ_CSS = `
.sim-dom-root--portrait.svs { padding: var(--sim-space-1) 0; }
.mf-read { display: flex; flex-direction: column; align-items: center; gap: 2px; padding: var(--sim-space-2) var(--sim-space-3); text-align: center; min-height: 78px; justify-content: center;
  border: calc(2.5px * var(--look-rim)) solid var(--sim-stroke); border-radius: var(--sim-radius-lg); background: var(--sim-bg-surface); box-shadow: 0 calc(3px * var(--look-lip)) 0 var(--sim-stroke); }
.mf-big { font: 600 var(--sim-text-2xl)/1.1 var(--sim-font-display, var(--sim-font)); color: var(--sim-label); }
.mf-small { font: 700 var(--sim-text-md)/1.25 var(--sim-font); color: var(--sim-label-muted); }
`;
export const readCard = (big, small) => `<div class="mf-read"><span class="mf-big">${big}</span><span class="mf-small">${small}</span></div>`;
