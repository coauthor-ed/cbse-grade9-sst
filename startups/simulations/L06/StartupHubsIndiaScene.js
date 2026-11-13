/**
 * StartupHubsIndiaScene - L06 s06 "India's startups today" (3 beats). SvgScene, design 560 x 480 landscape,
 * 390 x 610 portrait.
 * MAP RULE (b2): India's border comes ONLY from the Survey of India layer (SimGeo.loadLayer('india')), credit
 * 'Boundary of India: Survey of India' drawn on the map; other land is world-atlas 'land' (no borders);
 * 'countries' is never loaded. Projection: d3 Mercator with a scale and centre computed here.
 *   b0 Third-largest: a podium, big; the third step lit with 'India' on it, steps 1 and 2 blank and dimmed
 *      (the text names no other country); title 'third-largest startup ecosystem'. Beside it 'about 120' big,
 *      'unicorns in 2025', a grid of 120 dots (one dot = one unicorn) popping in row by row, and 'each valued
 *      at over 1 billion dollars'.
 *   b1 Fields: four tiles: e-commerce (a cart) 'online shopping', fin-tech (a phone and a coin) 'digital
 *      payments', health-tech (a phone and a hospital) 'online healthcare', agri-tech (a field with a signal)
 *      'farming technology'. Pop in 0.3 s apart.
 *   b2 Hubs: India map, pins Bengaluru, Hyderabad, Mumbai, Delhi NCR, each with a small cluster of startup
 *      dots; beside (below in portrait): jobs, sustainability, economic growth (icon + word).
 * Drawn here: the podium, the cart, the dot grid, the signal arcs, the growth bars. Nothing to tap. No host
 * controls. Tokens only. ASCII only.
 */
import { SvgScene, fill, stroke, shade } from 'simulations/base/kit/SimSvg.js';
import { iconSvg } from 'simulations/base/kit/SimIcons.js';
import { SimGeo } from 'simulations/base/SimGeo.js';
import { MONEY_CSS, coin } from '../shared/MoneyKit.js';

const f1 = (v) => (+v).toFixed(1);
const MAIN = [[{ idx: 0, dwellMs: null }], [{ idx: 1, dwellMs: null }], [{ idx: 2, dwellMs: null }]];
const CREDIT = 'Boundary of India: Survey of India';
const EXT = { lon: [66, 98], lat: [6, 37.5] };
const HUBS = [
  { name: 'Delhi NCR', at: [77.1, 28.6], land: [14, 6, 'start'], port: [14, 6, 'start'] },
  { name: 'Mumbai', at: [72.88, 19.08], land: [-68, 36, 'start'], port: [-70, 38, 'start'] },
  { name: 'Hyderabad', at: [78.49, 17.39], land: [16, 6, 'start'], port: [16, 6, 'start'] },
  { name: 'Bengaluru', at: [77.59, 12.97], land: [16, 18, 'start'], port: [16, 20, 'start'] },
];

const CSS = `
svg .sh-halo { paint-order: stroke; stroke: var(--sim-bg-surface); stroke-width: 6px; stroke-linejoin: round; }
`;

const text = (x, y, t, size, col = 'var(--sim-label)', anchor = 'middle', w = 800, cls = '') =>
  `<text${cls ? ` class="${cls}"` : ''} x="${f1(x)}" y="${f1(y)}" text-anchor="${anchor}" style="fill:${col};font:${w} ${size}px var(--sim-font)">${t}</text>`;
const icon = (name, cx, cy, s, t) => iconSvg(name, t).replace('width="48" height="48"', `x="${f1(cx - s / 2)}" y="${f1(cy - s / 2)}" width="${s}" height="${s}"`);
const rad = (d) => (d * Math.PI) / 180;
const mercY = (lat) => Math.log(Math.tan(Math.PI / 4 + rad(lat) / 2));

function fit(r) {
  const sx = rad(EXT.lon[1] - EXT.lon[0]), y0 = mercY(EXT.lat[0]), y1 = mercY(EXT.lat[1]);
  const s = Math.min(r.w / sx, r.h / (y1 - y0));
  const tx = r.x + r.w / 2 - s * rad((EXT.lon[0] + EXT.lon[1]) / 2), ty = r.y + r.h / 2 + s * (y0 + y1) / 2;
  return { s, tx, ty, xy: ([lon, lat]) => [tx + s * rad(lon), ty - s * mercY(lat)] };
}

/** A shopping cart, centre (x, y), s across. */
function cart(x, y, s) {
  const col = 'var(--sim-series-1)', rim = shade(col, 60), u = s / 48;
  const P = (px, py) => `${f1(x + (px - 24) * u)} ${f1(y + (py - 24) * u)}`;
  return `<path d="M${P(10, 16)}L${P(40, 16)}L${P(36, 32)}L${P(15, 32)}Z" ${fill(`color-mix(in oklab, ${col} 60%, var(--sim-bg-surface))`, `stroke:${rim};stroke-width:${f1(2.5)};stroke-linejoin:round`)}/>`
    + `<path d="M${P(3, 9)}L${P(9, 9)}L${P(15, 32)}L${P(15, 37)}L${P(38, 37)}" ${stroke(rim, 3)}/>`
    + `<circle cx="${f1(x + (17 - 24) * u)}" cy="${f1(y + (42 - 24) * u)}" r="${f1(3.5 * u)}" ${fill(rim)}/>`
    + `<circle cx="${f1(x + (35 - 24) * u)}" cy="${f1(y + (42 - 24) * u)}" r="${f1(3.5 * u)}" ${fill(rim)}/>`;
}

/** Three signal arcs rising from (x, y). */
function signal(x, y, s, col) {
  let g = '';
  for (let i = 1; i <= 3; i++) {
    const r = s * 0.16 * i;
    g += `<path d="M${f1(x - r * 0.75)} ${f1(y - r * 0.65)}A${f1(r)} ${f1(r)} 0 0 1 ${f1(x + r * 0.75)} ${f1(y - r * 0.65)}" ${stroke(col, 3.5)}/>`;
  }
  return g + `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(s * 0.05)}" ${fill(col)}/>`;
}

/** Rising bars with an arrow (growth), centre (x, y), s across. */
function growth(x, y, s) {
  const col = 'var(--sim-good)', rim = shade(col, 62), b = y + s * 0.4, bw = s * 0.2;
  let g = '';
  [0.35, 0.55, 0.8].forEach((h, i) => {
    const bx = x - s * 0.36 + i * s * 0.27;
    g += `<rect x="${f1(bx)}" y="${f1(b - h * s)}" width="${f1(bw)}" height="${f1(h * s)}" rx="3" ${fill(`color-mix(in oklab, ${col} 60%, var(--sim-bg-surface))`, `stroke:${rim};stroke-width:2.5`)}/>`;
  });
  return g;
}

export class StartupHubsIndiaScene extends SvgScene {
  static WIDTH = 560;
  static PORTRAIT_WIDTH = 390;
  static HEIGHT = 480;
  static PORTRAIT_HEIGHT = 610;
  static CONTINUOUS = false;
  static BEAT_STEP_MAP = MAIN;
  static BEAT_MAPS = { 3: MAIN };
  static CONTROLS = [];
  static ARIA_LABEL = 'Three pictures. One: India stands on the third step of a podium: the third-largest startup ecosystem; 120 dots for about 120 unicorns in 2025, each valued at over 1 billion dollars. Two: four fields: e-commerce, online shopping; fin-tech, digital payments; health-tech, online healthcare; agri-tech, farming technology. Three: a map of India with startup hubs at Bengaluru, Hyderabad, Mumbai and Delhi NCR; startups create jobs, support sustainability and drive economic growth. Boundary of India: Survey of India.';

  async setup() {
    this.geo = null;
    this._paths = {};
    try {
      const [india, land, d3] = await Promise.all([SimGeo.loadLayer('india'), SimGeo.loadWorld('land'), SimGeo.d3()]);
      if (india && land && d3?.geoMercator) this.geo = { india, land, d3 };
    } catch (_) { this.geo = null; /* no map data: pins and labels still draw */ }
    await super.setup();
  }

  css() { return MONEY_CSS + CSS; }

  stageHeight(st) { return Math.round((st.portrait ? 610 : 480) * st.W / (st.portrait ? 390 : 560)); }

  paint(st) {
    const P = st.portrait, DW = P ? 390 : 560, DH = P ? 610 : 480, k = (st.W / DW).toFixed(4), v = this.stepIndex;
    const out = v === 0 ? this.paintRank(P) : v === 1 ? this.paintFields(P) : this.paintHubs(P);
    return { svg: `<g transform="scale(${k})">${out}</g>`, over: '' };
  }

  // b0: the podium and the 120 unicorns.
  paintRank(P) {
    const G = P
      ? { pod: [40, 270, 103], hs: [82, 112, 62], title: [195, 38], big: [195, 326], cap: [195, 362], grid: [30, 396, 15, 8, 22, 7.5], foot: [195, 584] }
      : { pod: [16, 430, 96], hs: [170, 230, 130], title: [160, 48], big: [430, 84], cap: [430, 126], grid: [328, 164, 12, 10, 19, 6.5], foot: [430, 404] };
    const [x0, by, sw] = G.pod;
    let s = text(G.title[0], G.title[1], 'third-largest', P ? 30 : 32) + text(G.title[0], G.title[1] + (P ? 36 : 40), 'startup ecosystem', P ? 26 : 28, 'var(--sim-label)', 'middle', 700);
    // steps in podium order: 2nd, 1st, 3rd
    const order = [[1, '2nd'], [0, '1st'], [2, '3rd']];
    order.forEach(([rank, lab], i) => {
      const h = G.hs[i], x = x0 + i * sw, lit = rank === 2, col = lit ? 'var(--sim-accent)' : 'var(--sim-stroke)';
      const face = lit ? 'color-mix(in oklab, var(--sim-accent) 30%, var(--sim-bg-surface))' : 'color-mix(in oklab, var(--sim-label) 8%, var(--sim-bg-surface))';
      s += `<g style="${lit ? '' : 'opacity:0.45'}"><rect x="${x + 2}" y="${by - h + 4}" width="${sw - 4}" height="${h}" rx="8" ${fill(col)}/>`
        + `<rect x="${x + 2}" y="${by - h}" width="${sw - 4}" height="${h}" rx="8" ${fill(face, `stroke:${col};stroke-width:3`)}/>`
        + text(x + sw / 2, by - h + (P ? 40 : 46), lab, P ? 28 : 32, lit ? shade('var(--sim-accent)', 70) : 'var(--sim-label-muted)') + '</g>';
      if (lit) {
        const cx = x + sw / 2, cy = by - h - 30;
        s += `<g class="mk-pop" style="--d:0.4s"><rect x="${cx - 52}" y="${cy - 22}" width="104" height="44" rx="22" ${fill('var(--sim-accent)', `stroke:${shade('var(--sim-accent)', 70)};stroke-width:2.5`)}/>`
          + text(cx, cy + 9, 'India', 26, 'var(--sim-ink-on-accent, var(--sim-bg-deep))') + '</g>';
      }
    });
    s += `<path d="M${x0 - 6} ${by + 2}H${x0 + 3 * sw + 6}" ${stroke('var(--sim-stroke)', 3)}/>`;
    // about 120 unicorns: one dot each, in rows
    s += text(G.big[0], G.big[1], 'about 120', P ? 40 : 46) + text(G.cap[0], G.cap[1], 'unicorns in 2025', P ? 22 : 24, 'var(--sim-label-muted)', 'middle', 700);
    const [gx, gy, cols, rows, sp, r] = G.grid;
    for (let j = 0; j < rows; j++) {
      let row = '';
      for (let i = 0; i < cols; i++) row += `<circle cx="${f1(gx + r + i * sp)}" cy="${f1(gy + r + j * sp)}" r="${r}" ${fill('var(--sim-series-5)', `stroke:${shade('var(--sim-series-5)', 62)};stroke-width:1.5`)}/>`;
      s += `<g class="mk-pop" style="--d:${(0.8 + j * 0.08).toFixed(2)}s">${row}</g>`;
    }
    s += text(G.foot[0], G.foot[1], 'each valued at over', P ? 20 : 22, 'var(--sim-label)', 'middle', 700) + text(G.foot[0], G.foot[1] + (P ? 0 : 34), P ? '' : '1 billion dollars', 24);
    if (P) s = s.replace('>each valued at over<', '>each valued at over 1 billion dollars<');
    return s;
  }

  // b1: four fields.
  paintFields(P) {
    const T = [
      { name: 'e-commerce', gloss: ['online', 'shopping'], draw: (x, y, z) => cart(x, y, z) },
      { name: 'fin-tech', gloss: ['digital', 'payments'], draw: (x, y, z) => icon('phone', x - z * 0.12, y, z, 2) + coin(x + z * 0.3, y + z * 0.22, z * 0.2) },
      { name: 'health-tech', gloss: ['online', 'healthcare'], draw: (x, y, z) => icon('phone', x - z * 0.12, y, z, 3) + icon('hospital', x + z * 0.3, y + z * 0.18, z * 0.5, 8) },
      { name: 'agri-tech', gloss: ['farming', 'technology'], draw: (x, y, z) => icon('field', x, y + z * 0.08, z, 4) + signal(x + z * 0.32, y - z * 0.2, z * 0.55, 'var(--sim-series-2)') },
    ];
    const G = P
      ? { at: [[100, 152], [290, 152], [100, 452], [290, 452]], w: 178, h: 276, ic: 96, nm: 26, gl: 22 }
      : { at: [[143, 122], [417, 122], [143, 358], [417, 358]], w: 260, h: 210, ic: 82, nm: 28, gl: 22 };
    let s = '';
    T.forEach((t, i) => {
      const [cx, cy] = G.at[i], x0 = cx - G.w / 2, y0 = cy - G.h / 2;
      let g = `<rect x="${f1(x0)}" y="${f1(y0 + 4)}" width="${G.w}" height="${G.h}" rx="18" ${fill('var(--sim-stroke)')}/>`
        + `<rect x="${f1(x0)}" y="${f1(y0)}" width="${G.w}" height="${G.h}" rx="18" ${fill('var(--sim-bg-surface)', 'stroke:var(--sim-stroke);stroke-width:2.5')}/>`;
      g += t.draw(cx, y0 + G.ic * 0.62 + 6, G.ic);
      const ny = y0 + G.ic * 1.2 + (P ? 34 : 30);
      g += text(cx, ny, t.name, G.nm);
      if (P) t.gloss.forEach((l, j) => { g += text(cx, ny + 34 + j * (G.gl + 10), l, G.gl, 'var(--sim-label-muted)', 'middle', 700); });
      else g += text(cx, ny + 34, t.gloss.join(' '), G.gl, 'var(--sim-label-muted)', 'middle', 700);
      s += `<g class="mk-pop" style="--d:${0.2 + i * 0.3}s">${g}</g>`;
    });
    return s;
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

  // b2: the hubs on the map; what the startups bring.
  paintHubs(P) {
    const r = P ? { x: 0, y: 0, w: 390, h: 430 } : { x: 0, y: 0, w: 360, h: 470 }, F = fit(r), geo = this.mapPaths(P ? 'p' : 'l', r);
    let s = `<defs><clipPath id="sh-clip"><rect x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}" rx="18"/></clipPath></defs>`;
    s += `<rect x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}" rx="18" ${fill('var(--sim-map-ocean)')}/><g clip-path="url(#sh-clip)">`;
    if (geo) {
      s += `<path d="${geo.land}" ${fill('var(--sim-map-land)', 'stroke:var(--sim-map-land-stroke);stroke-width:1;opacity:0.75')}/>`;
      s += `<path d="${geo.india}" ${fill('color-mix(in oklab, var(--sim-series-4) 34%, var(--sim-map-land))', 'stroke:var(--sim-map-border);stroke-width:1.6;stroke-linejoin:round')}/>`;
    }
    HUBS.forEach((h, i) => {
      const [x, y] = F.xy(h.at), [dx, dy, an] = h[P ? 'port' : 'land'], d = 0.3 + i * 0.35;
      let g = '';
      // a cluster of startups round the hub
      for (let j = 0; j < 9; j++) {
        const a = j * 2.4, rr = 14 + (j % 3) * 6;
        g += `<circle cx="${f1(x + Math.cos(a) * rr)}" cy="${f1(y + Math.sin(a) * rr * 0.8)}" r="4" ${fill('var(--sim-series-1)', `stroke:${shade('var(--sim-series-1)', 60)};stroke-width:1`)}/>`;
      }
      g += `<circle cx="${f1(x)}" cy="${f1(y)}" r="9" ${fill('var(--sim-map-pin)', 'stroke:var(--sim-bg-surface);stroke-width:3')}/>`;
      g += text(x + dx, y + dy, h.name, P ? 22 : 22, 'var(--sim-label)', an, 800, 'sh-halo');
      s += `<g class="mk-pop" style="--d:${d}s">${g}</g>`;
    });
    s += '</g>' + text(r.x + 12, r.y + r.h - 12, CREDIT, 15, 'var(--sim-label-muted)', 'start', 700, 'sh-halo');
    // what the startups bring
    const B = [
      { lab: ['jobs'], draw: (x, y, z) => icon('crowd', x, y, z, 2) },
      { lab: ['sustainability'], draw: (x, y, z) => icon('leaf', x, y, z, 4) },
      { lab: ['economic', 'growth'], draw: (x, y, z) => growth(x, y, z) },
    ];
    const at = P ? [[70, 500], [195, 500], [320, 500]] : [[462, 92], [462, 236], [462, 380]], z = P ? 54 : 62, fs = P ? 20 : 22;
    B.forEach((b, i) => {
      const [x, y] = at[i];
      let g = b.draw(x, y - 18, z);
      b.lab.forEach((l, j) => { g += text(x, y + z * 0.5 + 6 + j * (fs + 8), l, fs); });
      s += `<g class="mk-pop" style="--d:${1.8 + i * 0.3}s">${g}</g>`;
    });
    return s;
  }

  testState() { return { view: this.stepIndex, map: !!this.geo, credit: this.stepIndex === 2 ? CREDIT : null, unicorns: 120 }; }
}
