// ZoneRulerScene - a cut through the sea from the coast outwards: baseline, 12, 24 and 200 nautical miles, the shelf
// under them, the high seas beyond. Three mounts, told apart by beat count: 1 = the predict setup (no zone word, no
// limit line), 4 = the answer and the naming of the bands, 3 = the rights of each band. Beat 1 of the naming mount
// turns to a plan view, because a baseline across a bay cannot be drawn in a side cut. Not to scale, and it says so.
import { SvgScene } from 'simulations/base/kit/SimSvg.js';
import { tapLight } from 'simulations/base/kit/TapLight.js';
import { frame, SEA_COLOR_MAP, SEA_CSS, seaTx, tx, tag, panel, arrow, sea, svgTrawler, svgFish, svgSeaColumn, num, SEA_INK } from './SeaDraw.js';
import { zoneGeom, zoneArt, notScale, BAND_TONE } from './ZoneSection.js';
import { TERRITORIAL_NM, CONTIGUOUS_NM, EEZ_NM, TERRITORIAL_LAWS, CONTIGUOUS_RIGHTS } from './MaritimeZones.js';

const one = (i) => [{ idx: i, dwellMs: null }];
const CHIPS = [
  { id: 'territorial', label: 'Territorial sea', targets: ['territorial'], tone: 2 },
  { id: 'contiguous', label: 'Contiguous zone', targets: ['contiguous'], tone: 5 },
  { id: 'eez', label: 'EEZ', targets: ['eez'], tone: 3 },
];
const RIGHTS = {
  territorial: { head: 'Near-complete control', rows: [`Laws on ${TERRITORIAL_LAWS.join(', ').toLowerCase()}`, 'Foreign ships: innocent passage'] },
  contiguous: { head: 'Limited control', rows: [CONTIGUOUS_RIGHTS.join(', ')] },
  eez: { head: 'Special rights over resources', rows: ['Fish, oil and gas', 'Other ships pass; water not fully owned'] },
};
const PRESET = { 5: 'territorial', 6: 'contiguous', 7: 'eez' };

export class ZoneRulerScene extends SvgScene {
  static BEAT_MAPS = { [Number.MAX_SAFE_INTEGER]: [one(0)], 1: [one(0)], 4: [one(1), one(2), one(3), one(4)], 3: [one(5), one(6), one(7)] };
  static BEAT_STEP_MAP = [one(0), one(1), one(2), one(3), one(4), one(5), one(6), one(7)];
  static WIDTH = 680;
  static HEIGHT = 500;
  static PORTRAIT_WIDTH = 360;
  static PORTRAIT_HEIGHT = 590;
  static COLOR_MAP = SEA_COLOR_MAP;
  static ARIA_LABEL = 'A cut through the sea from the coast outwards, with the baseline and the limits at 12, 24 and 200 nautical miles. Indicative only, not to scale.';
  static CONTROLS = [];
  tl = tapLight({ label: 'Light a band', chips: CHIPS, onChange: () => this.repaint() });
  css() { return SEA_CSS; }
  stageHeight(st) { return st.portrait ? 470 : 385; }
  async setup() { await super.setup(); this.tl.mount(this.root, this); this.enter(this.stepIndex); }
  destroy() { this.tl.destroy(); super.destroy(); }
  enter(step) {
    if (!this.tl?.mount) return;
    this.tl.set({ lit: PRESET[step] ?? null });
    const r = this.root.querySelector?.('.tl-row');
    if (r) { const hide = step < 3; r.hidden = hide; r.style.display = hide ? 'none' : ''; }
    this.relayout?.();
  }
  _trawler(g, nm) { const k = g.port ? 0.46 : 0.6; return svgTrawler(g.X(nm), g.seaY + 2, k, {}); }
  _dim(g, x1, y, label, o = {}) {
    return arrow(o.x0 ?? g.baseX, y, x1, y, { both: true, w: 3, col: SEA_INK, head: 9 })
      + `<rect x="${num(x1 - 1)}" y="${num(y)}" width="2.5" height="${num(g.seaY - y)}" style="fill:${SEA_INK};opacity:0.7"/>`
      + seaTx(o.tx ?? (((o.x0 ?? g.baseX) + x1) / 2), y - 6, label, { size: 15 });
  }
  _plan(st) {
    const W = st.W, H = st.H, port = st.portrait;
    const hA = [W * (port ? 0.36 : 0.32), H * 0.22], hB = [W * (port ? 0.42 : 0.36), H * 0.74];
    const coast = (dx) => `M${num(W * 0.22 + dx)} -6C${num(W * 0.3 + dx)} ${num(H * 0.08)} ${num(hA[0] + 8 + dx)} ${num(H * 0.14)} ${num(hA[0] + dx)} ${num(hA[1])}`
      + `C${num(W * 0.22 + dx)} ${num(H * 0.3)} ${num(W * 0.13 + dx)} ${num(H * 0.42)} ${num(W * 0.15 + dx)} ${num(H * 0.52)}C${num(W * 0.18 + dx)} ${num(H * 0.64)} ${num(W * 0.3 + dx)} ${num(H * 0.62)} ${num(hB[0] + dx)} ${num(hB[1])}`
      + `C${num(hB[0] + 8 + dx)} ${num(H * 0.84)} ${num(W * 0.3 + dx)} ${num(H * 0.92)} ${num(W * 0.28 + dx)} ${H + 6}`;
    const close = `L-6 ${H + 6}L-6 -6Z`;
    const low = 13;
    const baseD = `M${num(hA[0] + low)} ${num(hA[1])}L${num(hB[0] + low)} ${num(hB[1])}`;
    let s = svgSeaColumn(0, 0, 1, { w: W, h: H, bands: 3, wave: 0 });
    s += `<path d="${coast(low)}${close}" style="fill:${sea('sand')}"/>`;
    // internal waters: on the land side of the straight line, inside the bay
    const inner = `M${num(hA[0] + low)} ${num(hA[1])}C${num(W * 0.22 + low)} ${num(H * 0.3)} ${num(W * 0.13 + low)} ${num(H * 0.42)} ${num(W * 0.15 + low)} ${num(H * 0.52)}C${num(W * 0.18 + low)} ${num(H * 0.64)} ${num(W * 0.3 + low)} ${num(H * 0.62)} ${num(hB[0] + low)} ${num(hB[1])}Z`;
    s += `<path d="${inner}" style="fill:var(--sim-series-3);opacity:0.55"/>`;
    s += `<path d="${coast(0)}${close}" style="fill:${sea('grass')};stroke:${sea('grassDark')};stroke-width:3"/>`;
    s += `<path d="${coast(low)}" style="fill:none;stroke:${SEA_INK};stroke-width:4;stroke-linecap:round"/>`;
    s += `<path d="${baseD}" style="fill:none;stroke:${SEA_INK};stroke-width:5;stroke-linecap:round"/>`;
    const midX = (hA[0] + hB[0]) / 2 + low, midY = (hA[1] + hB[1]) / 2, c = port ? 15 : 16;
    s += tag(W - 8, H * 0.09, 'Seen from above: a made-up coast', { anchor: 'end', size: port ? 15 : 16 });
    s += tag(W - 10, midY - 26, 'Baseline: straight across the bay', { anchor: 'end', size: port ? 15 : 16 });
    s += arrow(W - 90, midY - 12, midX + 6, midY - 2, { w: 3 });
    s += tag(W - 10, midY + 62, 'Internal waters', { anchor: 'end', size: c });
    s += arrow(W - 150, midY + 62, W * 0.27, midY + 16, { w: 3 });
    s += tag(W - 10, H * 0.92, 'Baseline follows the low-water line', { anchor: 'end', size: port ? 15 : 16 });
    s += arrow(W - 120, H * 0.88, W * 0.31 + low, H * 0.86, { w: 3 });
    s += tx(W * 0.08, H * 0.12, 'land', { size: 17, col: SEA_INK, anchor: 'start' });
    return s;
  }
  paint(st) {
    const W = st.W, H = st.H, step = this.stepIndex;
    if (step === 2) return { svg: frame(st, this._plan(st)) };
    const g = zoneGeom(W, H, { seaY: 158 }), lit = this.tl.lit?.() ?? [], one1 = lit[0];
    let bands = false;
    if (step === 1) bands = { eez: true };
    if (step === 3) bands = { territorial: true, contiguous: true };
    if (step >= 4) bands = one1 ? { [one1]: true } : true;
    if (step === 3 && one1) bands = { [one1]: true };
    let s = zoneArt(g, W, H, { bands });
    const row = (k) => g.seaY - 118 + k * 34;
    if (step === 0) {
      s += this._dim(g, g.X(100), row(1), '100 nautical miles');
      s += this._trawler(g, 100);
      s += tag(g.X(100), g.seaY + 58, 'foreign trawler', { size: 16 });
    }
    if (step === 1) {
      s += this._dim(g, g.X(100), row(1), '100 nautical miles');
      s += this._trawler(g, 100);
      s += tag(g.X(100), g.seaY + 44, "EEZ: India's rights", { size: 16, rim: BAND_TONE.eez });
      s += tag(g.X(100), g.seaY + 80, 'over the fish', { size: 16, rim: BAND_TONE.eez });
      for (let i = 0; i < 3; i++) s += svgFish(g.X(100) - 52 + i * 52, g.seaY + 122 + (i % 2) * 10, 0.62, { kind: i, flip: i === 1 });
    }
    if (step >= 3) {
      s += this._dim(g, g.x12, row(2), `${TERRITORIAL_NM} NM`);
      s += this._dim(g, g.x24, row(1), `${CONTIGUOUS_NM} NM`, { tx: g.port ? g.x24 - 28 : undefined });
      if (step >= 4) s += this._dim(g, g.x200, row(0), `${EEZ_NM} NM`);
      s += `<rect x="${num(g.baseX - 2)}" y="${num(row(step >= 4 ? 0 : 1))}" width="4" height="${num(H - 48 - row(0))}" style="fill:${SEA_INK}"/>`;
      s += seaTx(g.baseX + (g.port ? 0 : -6), g.seaY + 36, 'Baseline', { size: 15, anchor: g.port ? 'start' : 'end' });
      const y0 = g.seaY + (g.port ? 58 : 40);
      s += tag(g.baseX + 8, y0, 'Territorial sea', { anchor: 'start', size: 15, rim: BAND_TONE.territorial, op: lit.length && one1 !== 'territorial' ? 0.3 : 1 });
      s += tag(g.port ? g.baseX + 8 : g.x12 + 44, y0 + (g.port ? 32 : 0), 'Contiguous zone', { anchor: 'start', size: 15, rim: BAND_TONE.contiguous, op: lit.length && one1 !== 'contiguous' ? 0.3 : 1 });
      if (step >= 4) {
        s += tag((g.x24 + g.x200) / 2 + (g.port ? 8 : 0), y0 + (g.port ? 66 : 38), 'Exclusive economic zone', { size: 15, rim: BAND_TONE.eez, op: lit.length && one1 !== 'eez' ? 0.3 : 1 });
        s += tag(W - 8, row(0) - 26, 'The high seas', { anchor: 'end', size: 15 });
        if (!one1) s += tag((g.baseX + g.marginX) / 2 + 20, g.floorY + 46, 'Continental shelf', { size: 15, col: sea('sand') });
      }
    }
    if (one1 && step >= 3) {
      const R = RIGHTS[one1], cw = Math.min(W - 16, 470), ch = 34 + R.rows.length * 26 + (one1 === 'contiguous' && st.portrait ? 24 : 0), cx = (W - cw) / 2, cy = H - ch - 30;
      s += panel(cx, cy, cw, ch, { rim: BAND_TONE[one1] });
      s += tx(W / 2, cy + 26, R.head, { size: 19, display: true, weight: 700 });
      R.rows.forEach((t, i) => { s += tx(W / 2, cy + 52 + i * 26, t, { size: st.portrait ? 15 : 16, weight: 700 }); });
    }
    s += notScale(W, H);
    return { svg: frame(st, s) };
  }
}
