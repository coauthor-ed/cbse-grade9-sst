// CoriolisDeflectScene - the four causes, then water launched on a turning Earth. The dashed line is the
// straight path; the solid line bends right of its travel in the north, left of it in the south.
import { SvgScene } from 'simulations/base/kit/SimSvg.js';
import { AIR_CSS, tx, sky, btn, bindActs, tween, loadSea, windArrow, pathThrough } from './SeaDraw.js';
import { svgSeaColumn, svgCloud, svgEarthDisc } from '../shared/SeaArt.js';

const MAP = [[{ idx: 0, dwellMs: null }], [{ idx: 1, dwellMs: null }], [{ idx: 2, dwellMs: null }]];
const LON0 = -30, MAX_BEND = 24, LATS = 50;

export class CoriolisDeflectScene extends SvgScene {
  static BEAT_STEP_MAP = MAP;
  static ARIA_LABEL = 'Four causes of ocean currents, then a globe where water launched north of the Equator bends to the right of its straight path, and water launched south of it bends to the left.';
  static CONTROLS = [];
  css() { return AIR_CSS + '.sim-dom-root--portrait.svs { padding: var(--sim-space-1) 4px; }'; }
  stageHeight(st) { return st.portrait ? 470 : 440; }
  async setup() {
    this._p = 0; this._hem = 1; this._found = {};
    await super.setup();
    this._off = bindActs(this, (a) => this._act(a));
    this._g = await loadSea();
    this.repaint();
  }
  destroy() { this._halt?.(); this._off?.(); super.destroy(); }
  enter(step) { this._halt?.(); this._halt = null; this._going = false; this._p = 0; this._hem = step === 2 ? -1 : 1; }
  _act(a) {
    if (a === 'north' || a === 'south') { this._halt?.(); this._going = false; this._hem = a === 'north' ? 1 : -1; this._p = 0; return; }
    if (a !== 'launch') return;
    this._halt?.(); this._p = 0; this._going = true;
    const hem = this._hem;
    this._halt = tween(2600, (p) => { this._p = p; this.repaint(); }, () => {
      this._going = false; this.repaint();
      if (!this._found[hem]) { this._found[hem] = true; const q = this._end; if (q) this.celebrate(q[0], q[1]); }
    });
  }
  paint(st) { return this.stepIndex === 0 ? this._causes(st) : this._globe(st); }

  _causes(st) {
    const W = st.W, port = st.portrait, g = 10, cols = 2, w = (W - g * (cols + 1)) / cols, h = (st.H - g * 3) / 2;
    const tile = (i) => [g + (i % 2) * (w + g), g + Math.floor(i / 2) * (h + g)];
    const box = (i, id, inner, name) => {
      const [x, y] = tile(i);
      return `<g><defs><clipPath id="c${id}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="14"/></clipPath></defs><g clip-path="url(#c${id})">${inner(x, y)}</g><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="14" style="fill:none;stroke:var(--sim-stroke);stroke-width:3"/>`
        + `<rect x="${x + 8}" y="${y + 8}" width="${Math.min(w - 16, name.length * 8.6 + 18)}" height="28" rx="14" style="fill:var(--sim-bg-surface);stroke:var(--sim-stroke);stroke-width:2"/>` + tx(x + 8 + Math.min(w - 16, name.length * 8.6 + 18) / 2, y + 27, name, { size: 15 }) + '</g>';
    };
    let s = box(0, 'w', (x, y) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" style="fill:${sky('sky')}"/>` + svgCloud(x + w * 0.74, y + h * 0.3, 0.55, { seed: 4 })
      + svgSeaColumn(x, y + h * 0.62, 1, { w, h: h * 0.4, wave: 7, len: 54 }) + windArrow([[x + 14, y + h * 0.5], [x + w * 0.5, y + h * 0.46], [x + w - 16, y + h * 0.5]], { w: 9, col: sky('cloud'), curve: true, flow: true }), 'Winds');
    s += box(1, 't', (x, y) => `<rect x="${x}" y="${y}" width="${w}" height="${h / 2 + 6}" style="fill:color-mix(in oklab, ${sky('sea')} 84%, ${sky('sun')})"/><rect x="${x}" y="${y + h / 2 + 6}" width="${w}" height="${h / 2}" style="fill:${sky('seaDeep')}"/>`
      + windArrow([[x + w * 0.88, y + h * 0.42], [x + w * 0.88, y + h - 12]], { w: 8, col: sky('seaMid'), rim: sky('cloud') }) + windArrow([[x + w * 0.12, y + h - 16], [x + w * 0.12, y + h * 0.44]], { w: 8, col: sky('red'), rim: sky('cloud') })
      + tx(x + w * 0.5, y + h * 0.42, 'warm', { size: 15, col: sky('ink'), halo: sky('cloud') }) + tx(x + w * 0.5, y + h - 16, 'cold, salty', { size: 15, col: sky('cloud') }), 'Heat, salt');
    s += box(2, 'b', (x, y) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" style="fill:${sky('sea')}"/><path d="M${x + w * 0.56} ${y + 40}q50 30 ${w} 10v${h}h-${w}q-30 -50 -${w * 0.14} -${h * 0.5}Z" style="fill:color-mix(in oklab, ${sky('sand')} 74%, ${sky('grass')});stroke:${sky('sandDark')};stroke-width:3"/>`
      + windArrow([[x + 14, y + h * 0.82], [x + w * 0.34, y + h * 0.78], [x + w * 0.46, y + h * 0.46], [x + w * 0.46, y + 44]], { w: 9, col: sky('seaDeep'), rim: sky('cloud'), curve: true }), 'Land shape');
    s += box(3, 'e', (x, y) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" style="fill:${sky('hullDark')}"/>` + svgEarthDisc(x + w / 2, y + h * 0.52, Math.min(w, h) * 0.0030, {})
      + windArrow([[x + w / 2 - Math.min(w, h) * 0.36, y + h * 0.84], [x + w / 2, y + h * 0.93], [x + w / 2 + Math.min(w, h) * 0.36, y + h * 0.84]], { w: 6, col: sky('sun'), curve: true }), 'Earth turning');
    return { svg: s };
  }

  /** The curved path as lon, lat points up to p. */
  _track(hem, p) {
    const pts = [];
    for (let i = 0; i <= 40; i++) {
      const u = i / 40 * p, lat = hem * (6 + u * LATS), lon = LON0 + MAX_BEND * u * u;
      pts.push([lon, lat]);
    }
    return pts;
  }
  _globe(st) {
    const W = st.W, H = st.H, port = st.portrait, hem = this._hem;
    const R = port ? Math.min(W / 2 - 14, 170) : 196, cx = port ? W / 2 : W / 2 - 70, cy = port ? 186 : H / 2 + 2;
    let s = `<rect width="${W}" height="${H}" rx="18" style="fill:${sky('hullDark')}"/>`;
    s += `<circle cx="${cx}" cy="${cy}" r="${R}" style="fill:${sky('sea')};stroke:${sky('cloud')};stroke-width:3"/>`;
    let P = null;
    if (this._g) {
      const pr = this._g.d3.geoOrthographic().rotate([-LON0 - 4, 0, 0]).translate([cx, cy]).scale(R).clipAngle(90);
      const path = this._g.d3.geoPath(pr);
      s += `<path d="${path(this._g.land)}" style="fill:color-mix(in oklab, ${sky('sand')} 62%, ${sky('grass')});stroke:${sky('sandDark')};stroke-width:1"/>`;
      P = pr;
    }
    const at = (ll) => (P ? P(ll) : [cx + (ll[0] - LON0) * R / 90, cy - ll[1] * R / 90]);
    const eq = []; for (let l = -88; l <= 88; l += 8) eq.push(at([LON0 + 4 + l, 0]));
    s += `<path d="${pathThrough(eq, true)}" style="fill:none;stroke:${sky('cloud')};stroke-width:2.5;stroke-dasharray:3 7"/>`;
    const eqL = at([LON0 + 54, 0]);
    s += tx(eqL[0] - 4, eqL[1] + 19, 'Equator', { size: 15, col: sky('ink'), halo: sky('cloud') });
    const straight = [0, 0.5, 1].map((u) => at([LON0, hem * (6 + u * LATS)]));
    s += `<path d="${pathThrough(straight, true)}" style="fill:none;stroke:${sky('cloud')};stroke-width:4;stroke-dasharray:10 8"/>`;
    const lab = at([LON0 - 3, hem * 40]);
    s += tx(lab[0] - 10, lab[1], 'straight path', { size: 15, anchor: 'end', col: sky('ink'), halo: sky('cloud') });
    const tr = this._track(hem, this._p).map(at);
    if (this._p > 0.02) {
      s += `<path d="${pathThrough(tr, true)}" style="fill:none;stroke:${sky('red')};stroke-width:7;stroke-linecap:round"/>`;
    }
    const e = tr[tr.length - 1];
    this._end = e;
    s += `<circle cx="${e[0].toFixed(1)}" cy="${e[1].toFixed(1)}" r="11" style="fill:${sky('sea')};stroke:${sky('white')};stroke-width:4"/>`;
    const done = this._p >= 1 && !this._going;
    if (done) {
      const w = 'bends to the ' + (hem > 0 ? 'right' : 'left');
      const m = tr[30];
      s += tx(m[0] + 14, m[1] + 5, w, { size: 16, anchor: 'start', col: sky('ink'), halo: sky('cloud'), display: true, weight: 700 });
    }
    const y1 = port ? H - 86 : H / 2 - 56, x0 = port ? W / 4 + 2 : W - 86, x1 = port ? W * 3 / 4 - 2 : W - 86, y2 = port ? y1 : y1 + 62;
    let over = '';
    if (this.stepIndex === 2) {
      over += `<button type="button" class="air-btn" data-act="north" aria-pressed="${hem > 0}" style="left:${x0}px;top:${y1}px;${hem > 0 ? '' : 'background:var(--sim-bg-surface);color:var(--sim-label);'}">North</button>`;
      over += `<button type="button" class="air-btn" data-act="south" aria-pressed="${hem < 0}" style="left:${x1}px;top:${y2}px;${hem < 0 ? '' : 'background:var(--sim-bg-surface);color:var(--sim-label);'}">South</button>`;
    }
    over += btn(port ? W / 2 : W - 86, port ? H - 32 : H / 2 + 76, done ? 'Launch again' : 'Launch the water', 'launch', { disabled: this._going });
    return { svg: s, over };
  }
}
