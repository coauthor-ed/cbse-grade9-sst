// InnocentPassageScene - the territorial sea and the one right foreign ships keep there. Beat 0: what the government
// controls, on the band itself. Beat 1: a ship passing, judged by what it does. Beat 2: five actions; each button
// draws that ship doing it and gives the answer with its reason.
import { SvgScene } from 'simulations/base/kit/SimSvg.js';
import { frame, SEA_COLOR_MAP, SEA_CSS, tx, tag, panel, arrow, sea, wrap, svgCargoShip, svgTrawler, svgPatrolShip, svgLighthouse, svgSeaColumn, svgWaveLine, svgSandBed, svgCloud, skyRect, controlRow, rowBtn, bindActs, num, SEA_INK } from './SeaDraw.js';
import { TERRITORIAL_NM, TERRITORIAL_LAWS } from './MaritimeZones.js';

const one = (i) => [{ idx: i, dwellMs: null }];
const GOOD = 'var(--sim-good)', BAD = 'var(--sim-error)';
const ACTS = [
  { id: 'sail', label: 'Sail straight through', ship: 'cargo', ok: true, why: 'It keeps moving and threatens nobody.' },
  { id: 'fish', label: 'Fish', ship: 'trawler', ok: false, why: 'Fishing is not allowed under this right.' },
  { id: 'mil', label: 'Military operations', ship: 'patrol', ok: false, why: 'Non-peaceful actions break this right.' },
  { id: 'stop', label: 'Stop, no reason', ship: 'cargo', ok: false, stopped: true, why: 'A ship must move on without stopping.' },
  { id: 'brk', label: 'Stop, breakdown', ship: 'cargo', ok: true, stopped: true, broke: true, why: 'A breakdown or an emergency allows a stop.' },
];

export class InnocentPassageScene extends SvgScene {
  static BEAT_STEP_MAP = [one(0), one(1), one(2)];
  static WIDTH = 680;
  static HEIGHT = 500;
  static PORTRAIT_WIDTH = 360;
  static PORTRAIT_HEIGHT = 600;
  static COLOR_MAP = SEA_COLOR_MAP;
  static ARIA_LABEL = 'The territorial sea off a coast. A foreign ship may pass through if it does not threaten peace, good order or security. Five actions are tried, each with its answer.';
  static CONTROLS = [];
  css() { return SEA_CSS; }
  stageHeight(st) { return st.portrait ? 400 : 345; }  // landscape: the five chips take two rows, and both must fit under the figure
  async setup() {
    this.act = 'sail';
    await super.setup();
    this.row = controlRow(this);
    this._off = bindActs(this, (a) => { this.act = a; this._row(); });
    this.enter(this.stepIndex);
    this.repaint();
  }
  destroy() { this._off?.(); super.destroy(); }
  _row() { if (this.row) this.row.innerHTML = this.stepIndex === 2 ? ACTS.map((a) => rowBtn(a.label, a.id, { pressed: this.act === a.id })).join('') : ''; }
  enter() { this.act = 'sail'; this._row(); this.relayout?.(); }
  _ship(a, x, y, k) {
    if (a.ship === 'trawler') return svgTrawler(x, y, k * 1.45, {});
    if (a.ship === 'patrol') return svgPatrolShip(x, y, k * 1.25, {});
    return svgCargoShip(x, y, k, {});
  }
  paint(st) {
    const W = st.W, H = st.H, P = st.portrait, step = this.stepIndex, sy = H * 0.5, lx = P ? 46 : 92, bandEnd = W - (P ? 10 : 30);
    let s = skyRect('ipS', 0, 0, W, sy + 4, 0, 5) + svgCloud(W * 0.72, 44, P ? 0.46 : 0.62, { seed: 4 });
    s += svgSeaColumn(0, sy, 1, { w: W, h: H - sy, bands: 3, wave: 3 });
    s += `<rect x="${lx}" y="${num(sy + 3)}" width="${bandEnd - lx}" height="${num(H - sy)}" style="fill:color-mix(in oklab, var(--sim-series-2) 62%, ${sea('cloud')});opacity:0.2"/>`;
    const hill = `M-6 ${sy - 44}Q${num(lx * 0.8)} ${sy - 50} ${num(lx * 1.02)} ${sy - 4}Q${num(lx * 1.2)} ${sy + 60} ${num(lx * 1.5)} ${H + 6}L-6 ${H + 6}Z`;
    s += `<defs><clipPath id="ipH"><path d="${hill}"/></clipPath></defs><g clip-path="url(#ipH)">${svgSandBed(-6, sy - 54, 1, { w: lx * 1.6, h: H - sy + 60, seed: 4 })}</g><path d="${hill}" style="fill:none;stroke:${sea('sandDark')};stroke-width:3"/>`;
    s += svgWaveLine(lx, sy, 1, { w: W - lx, amp: 3 });
    s += svgLighthouse(lx * 0.5, sy - 42, P ? 0.5 : 0.8, { lit: false });
    const shipY = sy + 4, ship = W * (P ? 0.6 : 0.58), k = P ? 0.8 : 1.15;
    if (step === 0) {
      s += svgPatrolShip(ship, shipY, P ? 0.62 : 0.8, {});
      s += arrow(lx, sy + 30, bandEnd, sy + 30, { both: true, w: 3 }) + tag((lx + bandEnd) / 2, sy + 30, `Territorial sea: ${TERRITORIAL_NM} NM`, { size: 16 });
      const cw = Math.min(W - 24, 390), cx = (W - cw) / 2 + (P ? 0 : 20), cy = H - 112;
      s += panel(cx, cy, cw, 96);
      s += tx(cx + cw / 2, cy + 28, 'Laws, as on land, on', { size: 16, col: 'var(--sim-label-muted)', weight: 700 });
      s += tx(cx + cw / 2, cy + 58, TERRITORIAL_LAWS.join(', ').toLowerCase(), { size: P ? 18 : 21, display: true, weight: 700 });
      s += tx(cx + cw / 2, cy + 83, 'near-complete control', { size: 16, weight: 700 });
    } else if (step === 1) {
      s += svgCargoShip(ship, shipY, k, {});
      s += arrow(ship + 60 * k, sy + 28, Math.min(bandEnd - 6, ship + 140 * k), sy + 28, { w: 7, head: 16 });
      s += tag(ship, 40, 'foreign ship, passing through', { size: 16 });
      const cw = Math.min(W - 24, 420), cx = (W - cw) / 2 + (P ? 0 : 20), cy = H - 104;
      s += panel(cx, cy, cw, 88, { rim: GOOD });
      s += tx(cx + cw / 2, cy + 28, 'Must not threaten', { size: 16, col: 'var(--sim-label-muted)', weight: 700 });
      s += tx(cx + cw / 2, cy + 56, 'peace, good order or security', { size: P ? 18 : 21, display: true, weight: 700 });
      s += tx(cx + cw / 2, cy + 78, 'judged by what it does', { size: 15, weight: 700 });
    } else {
      const a = ACTS.find((x) => x.id === this.act) ?? ACTS[0];
      s += `<g class="sd-in">${this._ship(a, ship, shipY, k)}</g>`;
      if (a.id === 'sail') s += arrow(ship + 60 * k, sy + 28, Math.min(bandEnd - 6, ship + 140 * k), sy + 28, { w: 7, head: 16 });
      if (a.id === 'fish') s += `<path d="M${ship - 40} ${sy + 4}L${ship - 104} ${sy + 62}H${ship - 26}Z" style="fill:${sea('cloud')};opacity:0.5;stroke:${SEA_INK};stroke-width:2.5;stroke-dasharray:5 4"/>`;
      if (a.stopped) s += `<path d="M${ship} ${sy + 6}V${sy + 60}" style="stroke:${SEA_INK};stroke-width:3.5"/><path d="M${ship - 12} ${sy + 52}Q${ship} ${sy + 72} ${ship + 12} ${sy + 52}" style="fill:none;stroke:${SEA_INK};stroke-width:4;stroke-linecap:round"/>`;
      if (a.broke) s += tag(ship, 40, 'engine has failed', { size: 16 });
      const cw = Math.min(W - 24, 430), cx = (W - cw) / 2 + (P ? 0 : 20), lines = wrap(a.why, cw - 24, 16), ch = 40 + lines.length * 22, cy = H - ch - 12;
      s += panel(cx, cy, cw, ch, { rim: a.ok ? GOOD : BAD });
      s += tx(cx + cw / 2, cy + 27, a.ok ? 'Still innocent passage' : 'Not innocent passage', { size: 19, display: true, weight: 700, col: a.ok ? GOOD : BAD });
      lines.forEach((l, i) => { s += tx(cx + cw / 2, cy + 50 + i * 22, l, { size: 16, weight: 700 }); });
    }
    return { svg: frame(st, s) };
  }
}
