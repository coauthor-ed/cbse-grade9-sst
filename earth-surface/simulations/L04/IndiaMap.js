// IndiaMap - India on an SVG stage for lessons 4 and 5. Helper, not a scene. India's outline comes only from
// the Survey of India layer; other land is plain, with no country lines. Every map carries the credit.
import { SimGeo } from 'simulations/base/SimGeo.js';
import { CREDIT_INDIA } from 'simulations/base/kit/GeoMap.js';
import { ec, INK, WHITE } from './EarthBits.js';

export async function loadIndia() {
  const [d3, land, india, rivers] = await Promise.all([SimGeo.d3(), SimGeo.loadWorld('land'), SimGeo.loadLayer('india'), SimGeo.loadLayer('rivers')]);
  return { d3, land, india, rivers, cache: new Map() };
}
export function indiaView(geo, box, extent) {
  const key = `${box.x},${box.y},${box.w},${box.h},${extent}`;
  if (geo.cache.has(key)) return geo.cache.get(key);
  const [[x0, y0], [x1, y1]] = extent, proj = geo.d3.geoMercator();
  proj.fitExtent([[box.x, box.y], [box.x + box.w, box.y + box.h]], { type: 'MultiPoint', coordinates: [[x0, y0], [x1, y1], [x0, y1], [x1, y0]] });
  const path = geo.d3.geoPath(proj), d = (g) => (path(g) || '').replace(/(\.\d)\d+/g, '$1');
  const v = { box, at: (ll) => proj(ll), d, land: d(geo.land), india: d(geo.india) };
  geo.cache.set(key, v);
  return v;
}
export function baseMap(v, W, H) {
  return `<rect width="${W}" height="${H}" style="fill:${ec('sea')}"/><path d="${v.land}" style="fill:${ec('sandLit')};stroke:${ec('sandDark')};stroke-width:1.5"/><path d="${v.india}" style="fill:color-mix(in oklab, ${ec('grass')} 34%, ${ec('sand')});stroke:${INK};stroke-width:2;stroke-linejoin:round"/>`;
}
export function credit(W, H) {
  const size = 14, w = Math.round(CREDIT_INDIA.length * size * .54) + 14, h = 23, x = W - w - 6, y = H - h - 6;
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="7" style="fill:${WHITE};opacity:.92"/><text x="${x + w / 2}" y="${y + 17}" text-anchor="middle" style="font:700 ${size}px var(--sim-font);fill:${INK}">${CREDIT_INDIA}</text>`;
}
