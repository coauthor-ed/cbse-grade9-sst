/**
 * ChettiarRoutesMapScene - L06 s01 "India's traditional business communities" (3 beats). SvgScene, design 560 x 500
 * landscape, 390 x 600 portrait.
 * MAP RULE: India's border comes ONLY from the Survey of India layer (SimGeo.loadLayer('india')), with the credit
 * 'Boundary of India: Survey of India' drawn on the map. Other land is world-atlas 'land' (no borders at all,
 * as vendor/geo/SOURCES.md says for world views); 'countries' is never loaded. Places outside India are labelled
 * dots. Projection: d3 Mercator with a scale and centre computed here, so the dots line up with the layers.
 *   b0 Skills passed down: a shop (SimCivic) behind three generations (grandparent, parent, young person); arcs
 *      grandparent -> parent -> young person under the chip 'skills passed down'; three chips: self-employment,
 *      innovation, trade. No map.
 *   b1 The map: India lit (SoI fill), 'across India' on it; a pin in Tamil Nadu 'Chettiars / Tamil Nadu';
 *      dashed sea routes to dots Sri Lanka, Burma (now Myanmar), Malaysia, other parts of Southeast Asia (drawn
 *      0.6 s each); under the map three role chips: trader, banker, moneylender.
 *   b2 The same map, routes in place, a boat on the Bay of Bengal; four goods badges under the map: salt, rice,
 *      textiles, finance (a coin); the chip 'often without formal banks' on the map.
 * Drawn here: the salt heap and the cloth bolt. Nothing to tap. No host controls. Tokens only. ASCII only.
 */
import { SvgScene, fill, stroke, shade } from 'simulations/base/kit/SimSvg.js';
import { iconSvg } from 'simulations/base/kit/SimIcons.js';
import { civicSvg } from 'simulations/base/kit/SimCivic.js';
import { SimGeo } from 'simulations/base/SimGeo.js';
import { MONEY_CSS, coin } from '../shared/MoneyKit.js';
import { PEOPLE_CSS, personSlot, paintPeople, registerCast } from '../shared/FinPeople.js';

const f1 = (v) => (+v).toFixed(1);
const MAIN = [[{ idx: 0, dwellMs: null }], [{ idx: 1, dwellMs: null }], [{ idx: 2, dwellMs: null }]];
const CREDIT = 'Boundary of India: Survey of India';
const EXT = { lon: [66, 110], lat: [-1, 37.5] };

registerCast('grandparent', { name: 'Grandparent', series: 0, role: 'elder', i: 73,
  look: { outfit: 'kurta', top: 'cream', bottom: 'cream', hairStyle: 'crop', shoeStyle: 'sandal', shoe: 'brown', pattern: 'plain', moustache: true, dupatta: false, glasses: true, girth: 1.02 } });
registerCast('craftparent', { name: 'Parent', series: 0, role: 'adult', i: 74,
  look: { outfit: 'drape', top: 's6', bottom: 's6', bottomStyle: 'long-skirt', hairStyle: 'bun', shoeStyle: 'sandal', shoe: 'brown', pattern: 'plain', moustache: false, dupatta: false, glasses: false, girth: 1 } });
registerCast('youngone', { name: 'Young person', series: 0, role: 'student', i: 75,
  look: { outfit: 'shirt', top: 's2', bottom: 'navy', hairStyle: 'short', shoeStyle: 'sandal', shoe: 'brown', pattern: 'plain', moustache: false, dupatta: false, glasses: false, sleeves: 'short', girth: 1 } });

const CSS = `
svg .cr-halo { paint-order: stroke; stroke: var(--sim-bg-surface); stroke-width: 6px; stroke-linejoin: round; }
`;

const text = (x, y, t, size, col = 'var(--sim-label)', anchor = 'middle', w = 800, cls = '') =>
  `<text${cls ? ` class="${cls}"` : ''} x="${f1(x)}" y="${f1(y)}" text-anchor="${anchor}" style="fill:${col};font:${w} ${size}px var(--sim-font)">${t}</text>`;
const icon = (name, cx, cy, s, t) => iconSvg(name, t).replace('width="48" height="48"', `x="${f1(cx - s / 2)}" y="${f1(cy - s / 2)}" width="${s}" height="${s}"`);
const rad = (d) => (d * Math.PI) / 180;
const mercY = (lat) => Math.log(Math.tan(Math.PI / 4 + rad(lat) / 2));

/** Mercator fitted so EXT fills the rect (aspect kept): { s, tx, ty, xy([lon, lat]) }. */
function fit(r) {
  const sx = rad(EXT.lon[1] - EXT.lon[0]), y0 = mercY(EXT.lat[0]), y1 = mercY(EXT.lat[1]);
  const s = Math.min(r.w / sx, r.h / (y1 - y0));
  const tx = r.x + r.w / 2 - s * rad((EXT.lon[0] + EXT.lon[1]) / 2), ty = r.y + r.h / 2 + s * (y0 + y1) / 2;
  return { s, tx, ty, xy: ([lon, lat]) => [tx + s * rad(lon), ty - s * mercY(lat)] };
}

/** A chip with a series-free look: rounded box, optional icon on the left. */
function pill(x, y, label, o = {}) {
  const fs = o.size ?? 22, iw = o.icon ? fs * 1.7 : 0, w = o.w ?? pillW(label, fs, !!o.icon), h = Math.round(fs * 2), x0 = x - w / 2;
  const edge = o.edge ?? 'var(--sim-stroke)';
  let s = `<rect x="${f1(x0)}" y="${f1(y - h / 2 + 3)}" width="${w}" height="${h}" rx="${h / 2}" ${fill(edge)}/>`
    + `<rect x="${f1(x0)}" y="${f1(y - h / 2)}" width="${w}" height="${h}" rx="${h / 2}" ${fill(o.bg ?? 'var(--sim-bg-surface)', `stroke:${edge};stroke-width:2.5${o.dash ? ';stroke-dasharray:6 5' : ''}`)}/>`;
  if (o.icon) s += o.icon(x0 + fs * 0.6 + iw / 2, y, fs * 1.5);
  s += text(x0 + iw + (w - iw) / 2, y + fs * 0.36, label, fs, o.ink ?? 'var(--sim-label)', 'middle', o.weight ?? 800);
  return s;
}

/** The width pill() gives a label. */
function pillW(label, fs, ic) { return Math.round(label.length * fs * 0.6 + fs * 1.4 + (ic ? fs * 1.7 : 0)); }

/** Pills in one row centred on cx (gap between): [x centres]. */
function rowXs(cx, labels, fs, ic, gap = 12) {
  const ws = labels.map((t) => pillW(t, fs, ic)), tot = ws.reduce((a, b) => a + b, 0) + gap * (ws.length - 1);
  let x = cx - tot / 2;
  return ws.map((w) => { const c = x + w / 2; x += w + gap; return c; });
}

/** A small white heap of salt; (x, y) = centre of the icon box, s its size. */
function saltHeap(x, y, s) {
  const b = y + s * 0.34, w = s * 0.9, rim = 'var(--sim-label-muted)';
  let g = `<path d="M${f1(x - w / 2)} ${f1(b)}Q${f1(x - w * 0.2)} ${f1(y - s * 0.4)} ${f1(x)} ${f1(y - s * 0.36)}Q${f1(x + w * 0.2)} ${f1(y - s * 0.4)} ${f1(x + w / 2)} ${f1(b)}Z" ${fill('var(--sim-bg-surface)', `stroke:${rim};stroke-width:2.5;stroke-linejoin:round`)}/>`;
  for (const [dx, dy] of [[-0.18, 0.1], [0.06, -0.08], [0.2, 0.16], [-0.04, 0.24]]) g += `<circle cx="${f1(x + dx * s)}" cy="${f1(y + dy * s)}" r="${f1(s * 0.035)}" ${fill(rim)}/>`;
  return g;
}

/** A cloth bolt (a roll of striped cloth), centre (x, y), s across. */
function clothBolt(x, y, s) {
  const col = 'var(--sim-series-3)', rim = shade(col, 60), w = s * 0.86, h = s * 0.5, x0 = x - w / 2, y0 = y - h / 2;
  let g = `<rect x="${f1(x0)}" y="${f1(y0)}" width="${f1(w)}" height="${f1(h)}" rx="${f1(h * 0.2)}" ${fill(`color-mix(in oklab, ${col} 55%, var(--sim-bg-surface))`, `stroke:${rim};stroke-width:2.5`)}/>`;
  for (let i = 1; i < 4; i++) g += `<path d="M${f1(x0 + (w * i) / 4)} ${f1(y0 + 2)}V${f1(y0 + h - 2)}" ${stroke(rim, 2.5)}/>`;
  g += `<ellipse cx="${f1(x0 + w)}" cy="${f1(y)}" rx="${f1(h * 0.18)}" ry="${f1(h / 2)}" ${fill(col, `stroke:${rim};stroke-width:2.5`)}/>`;
  return g;
}

const PLACES = [
  { id: 'sl', at: [80.7, 7.9], lab: ['Sri Lanka'] },
  { id: 'burma', at: [96.1, 16.9], lab: ['Burma', '(now Myanmar)'] },
  { id: 'malaysia', at: [101.7, 3.2], lab: ['Malaysia'] },
  { id: 'sea', at: [105.5, 12.8], lab: ['other parts of', 'Southeast Asia'] },
];
const HOME = [78.8, 10.1];

// Label placement per orientation: [dx, dy, anchor] from the projected dot.
const LAB = {
  land: { sl: [10, 26, 'start'], burma: [10, -8, 'start'], malaysia: [12, 8, 'start'], sea: [92, 34, 'end'] },
  port: { sl: [8, 24, 'start'], burma: [32, -42, 'middle'], malaysia: [68, 30, 'end'], sea: [36, 28, 'end'] },
};

export class ChettiarRoutesMapScene extends SvgScene {
  static WIDTH = 560;
  static PORTRAIT_WIDTH = 390;
  static HEIGHT = 500;
  static PORTRAIT_HEIGHT = 530;
  static CONTINUOUS = false;
  static BEAT_STEP_MAP = MAIN;
  static BEAT_MAPS = { 3: MAIN };
  static CONTROLS = [];
  static ARIA_LABEL = 'Three pictures. One: a grandparent, a parent and a young person in front of a family shop; skills are passed down; self-employment, innovation and trade. Two: a map; the Chettiars of Tamil Nadu worked across India and by sea in Sri Lanka, Burma (now Myanmar), Malaysia and other parts of Southeast Asia, as traders, bankers and moneylenders. Three: their trade was salt, rice, textiles and finance, often without formal banks. Boundary of India: Survey of India.';

  async setup() {
    this.geo = null;
    this._paths = {};
    try {
      const [india, land, d3] = await Promise.all([SimGeo.loadLayer('india'), SimGeo.loadWorld('land'), SimGeo.d3()]);
      if (india && land && d3?.geoMercator) this.geo = { india, land, d3 };
    } catch (_) { this.geo = null; /* no map data: the dots and routes still draw */ }
    await super.setup();
  }

  css() { return MONEY_CSS + PEOPLE_CSS + CSS; }

  repaint() { super.repaint(); paintPeople(this); }

  stageHeight(st) { return Math.round((st.portrait ? 530 : 500) * st.W / (st.portrait ? 390 : 560)); }

  paint(st) {
    const P = st.portrait, DW = P ? 390 : 560, DH = P ? 530 : 500, k = (st.W / DW).toFixed(4), v = this.stepIndex;
    const out = v === 0 ? this.paintGenerations(P) : this.paintMap(P, v === 2);
    return { floor: out.floor != null ? Math.round(out.floor * +k) : undefined, svg: `<g transform="scale(${k})">${out.svg}</g>`,
      over: `<div style="position:absolute;left:0;top:0;width:${DW}px;height:${DH}px;transform:scale(${k});transform-origin:0 0">${out.over ?? ''}</div>` };
  }

  // b0: three generations at a family shop, skills passed down.
  paintGenerations(P) {
    const G = P
      ? { gy: 380, shop: [195, 250], ppl: [[72, 186, 'grandparent'], [195, 176, 'craftparent'], [318, 150, 'youngone']], top: 52, chips: null, rows: [[450, ['self-employment']], [504, ['innovation', 'trade']]] }
      : { gy: 360, shop: [280, 290], ppl: [[124, 200, 'grandparent'], [280, 190, 'craftparent'], [430, 160, 'youngone']], top: 46, chips: null, rows: [[444, ['self-employment', 'innovation', 'trade']]] };
    let svg = `<g style="opacity:0.7">${civicSvg('shop', G.shop[0], G.gy - 6, { w: G.shop[1] })}</g>`;
    // the arcs: grandparent -> parent -> young person, above the heads
    const col = 'var(--sim-accent)';
    for (let i = 0; i < 2; i++) {
      const [x0, h0] = G.ppl[i], [x1, h1] = G.ppl[i + 1], y0 = G.gy - h0 - 18, y1 = G.gy - h1 - 18, my = Math.min(y0, y1) - 58;
      svg += `<g class="mk-pop" style="--d:${0.3 + i * 0.6}s"><path d="M${x0 + 10} ${y0}Q${(x0 + x1) / 2} ${my} ${x1 - 12} ${y1 - 4}" ${stroke(col, 5, 'stroke-linecap:round')}/>`
        + `<path d="M${x1 - 30} ${y1 - 14}L${x1 - 12} ${y1 - 4}L${x1 - 26} ${y1 + 12}" ${stroke(col, 5, 'stroke-linecap:round;stroke-linejoin:round')}/></g>`;
    }
    svg += pill(P ? 195 : 280, G.top, 'skills passed down', { size: P ? 26 : 28, edge: col, bg: `color-mix(in oklab, ${col} 14%, var(--sim-bg-surface))` });
    let n = 0;
    for (const [y, labs] of G.rows) {
      const xs = rowXs(P ? 195 : 280, labs, 22, false, 14);
      labs.forEach((t, i) => { svg += `<g class="mk-pop" style="--d:${1.4 + n++ * 0.2}s">${pill(xs[i], y, t, { size: 22 })}</g>`; });
    }
    let over = '';
    for (const [x, h, who] of G.ppl) over += personSlot(who, { x, y: G.gy, h, facing: 0, mood: 'smile' });
    return { svg, over, floor: G.gy };
  }

  mapPaths(key, r) {
    if (!this.geo) return null;
    if (this._paths[key]) return this._paths[key];
    const { d3, india, land } = this.geo, F = fit(r);
    const proj = d3.geoMercator().scale(F.s).translate([F.tx, F.ty]).clipExtent([[r.x, r.y], [r.x + r.w, r.y + r.h]]);
    const path = d3.geoPath(proj), trim = (d) => (d || '').replace(/(\.\d)\d+/g, '$1');
    this._paths[key] = { land: trim(path(land)), india: trim(path(india)) };
    return this._paths[key];
  }

  // b1 / b2: the map, the routes, then roles (b1) or goods (b2) under it.
  paintMap(P, goods) {
    const r = P ? { x: 0, y: 0, w: 390, h: 372 } : { x: 0, y: 0, w: 560, h: 410 }, F = fit(r), L = LAB[P ? 'port' : 'land'];
    const geo = this.mapPaths(P ? 'p' : 'l', r);
    let svg = `<defs><clipPath id="cr-clip"><rect x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}" rx="18"/></clipPath></defs>`;
    svg += `<rect x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}" rx="18" ${fill('var(--sim-map-ocean)')}/>`;
    svg += '<g clip-path="url(#cr-clip)">';
    if (geo) {
      svg += `<path d="${geo.land}" ${fill('var(--sim-map-land)', 'stroke:var(--sim-map-land-stroke);stroke-width:1;opacity:0.75')}/>`;
      svg += `<path d="${geo.india}" ${fill('color-mix(in oklab, var(--sim-series-4) 34%, var(--sim-map-land))', 'stroke:var(--sim-map-border);stroke-width:1.6;stroke-linejoin:round')}/>`;
    }
    const [hx, hy] = F.xy(HOME);
    svg += text(...F.xy([78.5, 22.5]), 'across India', P ? 24 : 26, 'var(--sim-label)', 'middle', 800, 'cr-halo');
    // routes from Tamil Nadu by sea (a curve bowed south, drawn one by one in b1)
    const col = 'var(--sim-accent)';
    PLACES.forEach((p, i) => {
      const [px, py] = F.xy(p.at), mx = (hx + px) / 2, my = Math.max(hy, py) + Math.abs(px - hx) * 0.22 + 10;
      const len = Math.round(Math.hypot(px - hx, py - hy) * 1.25 + 30);
      svg += `<path class="${goods ? '' : 'sv-draw'}" d="M${f1(hx)} ${f1(hy)}Q${f1(mx)} ${f1(my)} ${f1(px)} ${f1(py)}" ${stroke(col, 4, `--len:${len};--d:${0.3 + i * 0.5}s;--dur:0.6s`)}/>`;
    });
    PLACES.forEach((p, i) => {
      const [px, py] = F.xy(p.at), [dx, dy, an] = L[p.id], fs = P ? 20 : 22;
      svg += `<g class="${goods ? '' : 'mk-pop'}" style="--d:${0.8 + i * 0.5}s"><circle cx="${f1(px)}" cy="${f1(py)}" r="8" ${fill('var(--sim-map-pin)', 'stroke:var(--sim-bg-surface);stroke-width:3')}/>`;
      p.lab.forEach((t, j) => { svg += text(px + dx, py + dy + j * (fs + 6), t, j ? fs - 2 : fs, j ? 'var(--sim-label-muted)' : 'var(--sim-label)', an, j ? 700 : 800, 'cr-halo'); });
      svg += '</g>';
    });
    if (goods) svg += icon('boat', ...F.xy([88.5, 13.5]), P ? 46 : 54, 4);
    // home pin: Tamil Nadu, the Chettiars
    svg += `<circle cx="${f1(hx)}" cy="${f1(hy)}" r="12" ${fill(col, 'stroke:var(--sim-bg-surface);stroke-width:3.5')}/>`;
    const tl = P ? [8, hy + 36, 'start'] : [hx - 18, hy - 26, 'end'];
    svg += text(tl[0], tl[1], 'Chettiars', P ? 24 : 28, shade(col, 75), tl[2], 800, 'cr-halo') + text(tl[0], tl[1] + (P ? 26 : 30), 'Tamil Nadu', P ? 19 : 21, 'var(--sim-label)', tl[2], 700, 'cr-halo');
    if (goods) svg += pill(P ? 195 : 368, P ? 28 : 34, 'often without formal banks', { size: P ? 19 : 21, dash: true, ink: 'var(--sim-label)' });
    svg += '</g>';
    svg += text(r.x + 12, r.y + r.h - 12, CREDIT, 15, 'var(--sim-label-muted)', 'start', 700, 'cr-halo');
    // under the map: roles (b1) or goods (b2)
    if (!goods) {
      const roles = [['trader', (x, y, s) => icon('scales', x, y, s, 7)], ['banker', (x, y, s) => icon('building', x, y, s, 2)], ['moneylender', (x, y, s) => coin(x, y, s * 0.4)]];
      const fs = P ? 20 : 22, xs = rowXs(P ? 195 : 280, roles.map((q) => q[0]), fs, !P, 10), y = P ? 418 : 456;
      roles.forEach(([t, ic], i) => { svg += `<g class="mk-pop" style="--d:${2.4 + i * 0.2}s">${pill(xs[i], y, t, { size: fs, icon: P ? null : ic })}</g>`; });
    } else {
      const G = [['salt', saltHeap], ['rice', (x, y, s) => icon('grain', x, y, s, 4)], ['textiles', clothBolt], ['finance', (x, y, s) => coin(x, y, s * 0.4)]];
      const lx = rowXs(280, G.map((q) => q[0]), 21, true, 8), at = P ? [[100, 424], [290, 424], [100, 486], [290, 486]] : lx.map((x) => [x, 456]);
      G.forEach(([t, ic], i) => {
        svg += `<g class="mk-pop" style="--d:${0.3 + i * 0.3}s">${pill(at[i][0], at[i][1], t, { size: P ? 24 : 21, icon: ic, w: P ? 176 : undefined })}</g>`;
      });
    }
    return { svg };
  }

  testState() { return { view: this.stepIndex, map: !!this.geo, credit: this.stepIndex > 0 ? CREDIT : null }; }
}
