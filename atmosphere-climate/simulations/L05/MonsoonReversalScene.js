// MonsoonReversalScene - blk-l05-s01 (2 beats), s02 setup, s03 (3 beats). True map with the Survey of
// India layer. Temperatures for land are the book's (Delhi, Table 3.3); the sea at about 27 C all
// year is beyond the book, true to a degree or two for the Arabian Sea, and marked "about".
//   step 0 setup: January. Land cold, sea mild. No pressure marks, no arrows.
//   step 1 land and sea, month chips
//   step 2 Delhi month by month against a flat sea line
//   step 3 January: H over land, L over seas, dry wind from land to sea
//   step 4 June: L over land, H over ocean, moist wind from sea, two arms
//   step 5 June, with Mumbai's share of the year's rain: 175.4 of 183.4 cm from Table 3.3
import { SvgScene } from 'simulations/base/kit/SimSvg.js';
import { tapLight } from 'simulations/base/kit/TapLight.js';
import { AIR_CSS, tx, panel, reading, sky, SKY_INK, windArrow, loadGeo, indiaMap, creditPlate, num, pathThrough, svgCloud } from '../L03/AirDraw.js';

const SETUP = [[{ idx: 0, dwellMs: null }]];
const S01 = [[{ idx: 1, dwellMs: null }], [{ idx: 2, dwellMs: null }]];
const S03 = [3, 4, 5].map((i) => [{ idx: i, dwellMs: null }]);
const DELHI = [14.4, 16.7, 23.3, 30.0, 33.3, 33.3, 30.0, 29.4, 28.9, 25.6, 19.4, 15.6];
const SEA = 27, MO = 'JFMAMJJASOND';
const CHIPS = [{ id: 'jun', label: 'June', targets: ['jun'], tone: 2 }, { id: 'jan', label: 'January', targets: ['jan'], tone: 1 }];
const EXTENT = [[52, -8], [102, 36]];

export class MonsoonReversalScene extends SvgScene {
  static BEAT_STEP_MAP = S03;
  static BEAT_MAPS = { 0: SETUP, [Number.MAX_SAFE_INTEGER]: SETUP, 1: SETUP, 2: S01, 3: S03 };
  static ARIA_LABEL = 'A map of India and the seas. In January the land is cold, high pressure sits over it and dry wind blows from land to sea. In June the land is hot, low pressure sits over it and moist wind blows from sea to land.';
  static CONTROLS = [];
  tl = tapLight({ label: 'Month', chips: CHIPS, onChange: () => this.repaint() });
  css() { return AIR_CSS; }
  stageHeight(st) { return st.portrait ? 450 : 430; }
  async setup() { await super.setup(); this.tl.mount(this.root, this); this.enter(this.stepIndex); this._g = await loadGeo(); this.repaint(); }
  destroy() { this.tl.destroy(); super.destroy(); }
  enter(step) {
    if (!this.tl?.mount) return;
    this.tl.set({ lit: step === 1 ? 'jun' : null, disabled: step !== 1 });
    const r = this.root.querySelector?.('.tl-row');
    if (r) r.hidden = step !== 1;
  }
  paint(st) { return this.stepIndex === 2 ? this._chart(st) : this._map(st); }

  _base(st, landCol) {
    const W = st.W, H = st.H, m = indiaMap(this._g, { x: 0, y: 0, w: W, h: H }, EXTENT);
    let s = `<defs><clipPath id="mrC"><rect width="${W}" height="${H}" rx="18"/></clipPath></defs><rect width="${W}" height="${H}" rx="18" style="fill:${sky('sea')}"/>`;
    if (m) s += `<g clip-path="url(#mrC)"><path d="${m.landD}" style="fill:color-mix(in oklab, ${sky('sand')} 70%, var(--sim-bg-surface));stroke:${sky('sandDark')};stroke-width:1.5"/><path d="${m.indiaD}" style="fill:${landCol};stroke:${SKY_INK};stroke-width:2"/></g>`;
    return { s, at: m ? m.at : (ll) => [(ll[0] - 52) / 50 * W, H - (ll[1] + 8) / 44 * H], m };
  }
  _seaNames(at, port) {
    const lab = (ll, t) => { const [x, y] = at(ll); return tx(x, y, t, { size: port ? 14 : 15, col: sky('cloud'), halo: sky('seaDeep') }); };
    return lab([61, 17.5], 'Arabian Sea') + lab([92, 11], 'Bay of Bengal') + lab([86, -4], 'Indian Ocean');
  }
  _mark(at, ll, t, col) {
    const [x, y] = at(ll);
    return `<circle class="air-in" cx="${num(x)}" cy="${num(y)}" r="24" style="fill:${col};stroke:${SKY_INK};stroke-width:3.5"/>` + tx(x, y + 12, t, { size: 34, display: true, weight: 700, col: sky('cloud') });
  }
  _route(at, pts, col, w = 12) { return windArrow(pts.map(at), { w, col, curve: true, flow: true }); }

  _map(st) {
    const W = st.W, H = st.H, port = st.portrait, step = this.stepIndex;
    const june = step >= 4 || (step === 1 && this.tl.chip()?.id !== 'jan');
    const hot = 'color-mix(in oklab, var(--sim-series-2) 70%, ' + sky('sand') + ')';
    const cold = 'color-mix(in oklab, var(--sim-series-1) 34%, ' + sky('cloud') + ')';
    const b = this._base(st, june ? hot : cold), at = b.at;
    let s = b.s + this._seaNames(at, port);
    const [ix, iy] = at([78.5, 23.5]);
    if (step <= 1) {
      s += reading(10, 10, june ? 'Land in June' : 'Land in January', june ? '33 \u00b0C' : '14 \u00b0C', { w: 132, h: 72, size: 26 });
      s += reading(W - 142, H - 104, 'Sea', 'about 27 \u00b0C', { w: 132, h: 72, size: 22 });
      s += tx(ix, iy, june ? 'hot' : 'cold', { size: 20, display: true, weight: 700, col: SKY_INK, halo: sky('cloud') });
    } else if (june) {
      s += this._mark(at, [78, 24.5], 'L', 'var(--sim-series-4)') + this._mark(at, [62, -3], 'H', 'var(--sim-series-1)');
      s += this._route(at, [[57, 3], [64, 9], [71, 15], [74.5, 18.5]], sky('cloud'));
      s += this._route(at, [[76, 0], [82, 6], [85, 14], [88.5, 21]], sky('cloud'));
      const [a, c] = at([75.5, 16.5]), [d, e] = at([91.5, 25]);
      s += `<g class="air-in">${svgCloud(a, c, port ? 0.42 : 0.55, { seed: 3, kind: 'rain' })}${svgCloud(d, e, port ? 0.42 : 0.55, { seed: 5, kind: 'rain' })}</g>`;
      if (step === 4) s += reading(10, 10, 'June', 'moist wind', { w: 132, h: 66, size: 21 });
    } else {
      s += this._mark(at, [78, 25], 'H', 'var(--sim-series-1)') + this._mark(at, [66, -3], 'L', 'var(--sim-series-4)');
      s += this._route(at, [[75, 21], [71, 14], [66.5, 8]], sky('cloud'));
      s += this._route(at, [[84, 22.5], [82, 16], [81.5, 9.5], [84, 3]], sky('cloud'));
      s += reading(10, 10, 'January', 'cold, dry wind', { w: 142, h: 66, size: 19 });
    }
    if (step === 5) {
      const w = port ? W - 20 : 300, x = port ? 10 : 12, y = 10;
      s += panel(x, y, w, 72) + tx(x + w / 2, y + 24, 'Mumbai, June to September', { size: 15 }) + tx(x + w / 2, y + 56, '175 of 183 cm of rain', { size: 22, display: true, weight: 700 });
    }
    s += b.m ? creditPlate(W, H) : '';
    return { svg: s };
  }
  _chart(st) {
    const W = st.W, H = st.H, L = 44, R = W - 14, T = 58, B = H - 48;
    const x = (i) => L + (i + 0.5) * (R - L) / 12, y = (t) => B - (t - 10) / 26 * (B - T);
    let s = panel(2, 2, W - 4, H - 8) + tx(W / 2, 32, 'Land heats and cools, sea stays', { size: 17 });
    for (const t of [10, 20, 30]) s += `<path d="M${L} ${num(y(t))}H${R}" style="stroke:var(--sim-track);stroke-width:2"/>` + tx(L - 6, y(t) + 5, String(t), { size: 14, anchor: 'end', weight: 700 });
    s += tx(16, T - 12, '\u00b0C', { size: 14, anchor: 'start' });
    // land above sea: shade the months between the crossings
    const pts = DELHI.map((t, i) => [x(i), y(t)]);
    const a = x(2) + (SEA - 23.3) / (30 - 23.3) * (x(3) - x(2)), b = x(8) + (28.9 - SEA) / (28.9 - 25.6) * (x(9) - x(8));
    s += `<rect x="${num(a)}" y="${T}" width="${num(b - a)}" height="${B - T}" style="fill:var(--sim-series-2);opacity:0.16"/>`;
    s += `<path d="M${L} ${num(y(SEA))}H${R}" style="stroke:var(--sim-series-1);stroke-width:5;stroke-dasharray:12 8;stroke-linecap:round"/>`;
    s += `<path class="sv-draw" d="${pathThrough(pts, true)}" style="fill:none;stroke:var(--sim-series-2);stroke-width:6;stroke-linecap:round;--len:900;--dur:1.2s"/>`;
    pts.forEach((p) => { s += `<circle cx="${num(p[0])}" cy="${num(p[1])}" r="4.5" style="fill:var(--sim-series-2);stroke:var(--sim-stroke);stroke-width:1.5"/>`; });
    [...MO].forEach((m, i) => { s += tx(x(i), B + 22, m, { size: 14, weight: 700 }); });
    s += tx(x(0) + 2, y(14.4) - 16, 'Delhi', { size: 16, anchor: 'start', col: 'var(--sim-series-2)' });
    s += tx(x(11), y(SEA) - 10, 'sea, about 27', { size: 15, anchor: 'end', col: 'var(--sim-series-1)' });
    s += tx((a + b) / 2, B - 12, 'land warmer', { size: 15 });
    return { svg: s };
  }
}
