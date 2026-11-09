// MarpolSlickScene - a tanker, a current, a fishing coast. Two choices for the oily waste. Over the side: a slick grows and
// the current carries it to the coast and the nets. Kept on board: the tanker is at a port facility and the water stays
// clean. Beat 0: choose. Beat 1: the slick at rest, or the choice made. Beat 2: both results side by side, from the beat.
// Controls: data-act="side", data-act="port".
import { SvgScene } from 'simulations/base/kit/SimSvg.js';
import { frame, SEA_COLOR_MAP, SEA_CSS, tx, tag, arrow, sea, svgTanker, svgCountryBoat, svgPalm, svgFish, svgSeaColumn, svgWaveLine, skyRect, controlRow, rowBtn, bindActs, num, SEA_INK } from '../L08/SeaDraw.js';

const one = (i) => [{ idx: i, dwellMs: null }];
const DUR = 3;
const smooth = (u) => u * u * (3 - 2 * u);

export class MarpolSlickScene extends SvgScene {
  static BEAT_STEP_MAP = [one(0), one(1), one(2)];
  static WIDTH = 680;
  static HEIGHT = 470;
  static PORTRAIT_WIDTH = 360;
  static PORTRAIT_HEIGHT = 590;
  static COLOR_MAP = SEA_COLOR_MAP;
  static ARIA_LABEL = 'A tanker with oily waste, a current and a fishing coast. Waste put over the side spreads and drifts to the coast. Waste kept on board goes to a port facility and the water stays clean.';
  static CONTROLS = [];
  css() { return SEA_CSS; }
  stageHeight(st) { return st.portrait ? (this.stepIndex === 2 ? 470 : 380) : 370; }
  async setup() {
    this.choice = null; this.run = false;
    await super.setup();
    this.row = controlRow(this);
    this._off = bindActs(this, (a) => { this.choice = a; this.run = a === 'side'; this._row(); if (this.run) this.play(DUR); });
    this.enter(this.stepIndex);
    this.repaint();
  }
  destroy() { this._off?.(); super.destroy(); }
  _row() { if (this.row) this.row.innerHTML = this.stepIndex === 2 ? '' : rowBtn('Over the side', 'side', { pressed: this.choice === 'side' }) + rowBtn('Keep for the port', 'port', { pressed: this.choice === 'port' }); }
  enter(step) { this.run = false; this.choice = step === 1 ? 'side' : null; this._row(); this.relayout?.(); }
  _world(W, H, x0, id, choice, P) {
    const sy = H * 0.42, coast = W * (P ? 0.84 : 0.86);
    let s = skyRect(`${id}s`, 0, 0, W, sy + 4, 0, 4) + svgSeaColumn(0, sy, 1, { w: W, h: H - sy, bands: 3, wave: 2 });
    s += `<path d="M${num(coast)} ${num(sy - 26)}Q${num(coast + 30)} ${num(sy - 34)} ${W + 6} ${num(sy - 36)}V${H + 6}H${num(coast + 40)}Q${num(coast + 6)} ${num(sy + 30)} ${num(coast - 14)} ${num(sy + 4)}Z" style="fill:${sea('sand')};stroke:${sea('sandDark')};stroke-width:3"/>`;
    s += svgPalm(coast + (W - coast) * 0.7, sy - 32, P ? 0.5 : 0.6, {}) ;
    s += svgCountryBoat(coast - (P ? 46 : 70), sy + 2, P ? 0.46 : 0.62, { nets: true });
    s += svgWaveLine(0, sy, 1, { w: coast - 8, amp: 2 });
    const ay = H < 300 ? sy + 44 : sy + 70;
    s += arrow(W * 0.3, ay, W * 0.62, ay, { w: 7, col: sea('cloud'), haloCol: sea('seaDeep'), head: 18 }) + tx(W * 0.46, ay + 28, 'current', { size: 16, col: sea('cloud'), halo: SEA_INK, haloW: 3 });
    if (choice === 'port') {
      // port at the left: pier, tank, tanker alongside
      s += `<rect x="-4" y="${num(sy - 12)}" width="${num(W * 0.14)}" height="${num(H - sy + 16)}" style="fill:${sea('rockMid')};stroke:${SEA_INK};stroke-width:3"/>`;
      s += `<rect x="${num(W * 0.03)}" y="${num(sy - 62)}" width="${num(W * 0.09)}" height="50" rx="6" style="fill:${sea('cloudShade')};stroke:${SEA_INK};stroke-width:3"/>`;
      s += svgTanker(W * 0.4, sy + 3, P ? 0.56 : 0.72, {});
      s += `<path d="M${num(W * 0.2)} ${num(sy - 24)}H${num(W * 0.12)}" style="stroke:${SEA_INK};stroke-width:7"/>`;
      s += tag(6, 22, 'port facility takes the waste', { size: 15, anchor: 'start' });
      if (H >= 300) s += svgFish(W * 0.64, sy + 34, 0.6, { kind: 0 }) + svgFish(W * 0.74, sy + 124, 0.5, { kind: 1, flip: true });
      s += tag(W * 0.5, H - 22, 'The water stays clean', { size: 16 });
    } else {
      s += svgTanker(W * 0.26, sy + 3, P ? 0.56 : 0.72, {});
    }
    return s;
  }
  _slick(W, H, u, P) {
    const sy = H * 0.42, x0 = W * 0.34, x1 = x0 + (W * (P ? 0.82 : 0.84) - x0) * u, th = 6 + 8 * u;
    const pts = [`M${num(x0)} ${num(sy + 3)}`];
    const n = 8;
    for (let i = 1; i <= n; i++) { const x = x0 + (x1 - x0) * i / n; pts.push(`L${num(x)} ${num(sy + 3 + Math.sin(i * 1.7) * 2)}`); }
    for (let i = n; i >= 0; i--) { const x = x0 + (x1 - x0) * i / n; pts.push(`L${num(x)} ${num(sy + th + Math.sin(i * 2.3) * 3)}`); }
    return `${pts.join('')}Z`;
  }
  paint(st) {
    const W = st.W, H = st.H, P = st.portrait, step = this.stepIndex;
    if (step === 2) {
      if (P) {
        const h = (H - 8) / 2, a = this._world(W, h, 0, 'mpA', 'side', P), b = this._world(W, h, 0, 'mpB', 'port', P);
        const sl = `<path d="${this._slick(W, h, 1, P)}" style="fill:${SEA_INK};opacity:0.86"/>`;
        return { svg: frame(st, `<defs><clipPath id="mpC"><rect x="0" y="0" width="${W}" height="${num(h)}" rx="12"/></clipPath></defs><g clip-path="url(#mpC)">${a}${sl}${tag(W / 2, h - 22, 'The slick reaches the nets', { size: 16 })}</g><g transform="translate(0 ${num(h + 8)})" clip-path="url(#mpC)">${b}</g>`) };
      }
      const w = (W - 8) / 2, a = this._world(w, H, 0, 'mpA', 'side', true), b = this._world(w, H, 0, 'mpB', 'port', true);
      const sl = `<path d="${this._slick(w, H, 1, true)}" style="fill:${SEA_INK};opacity:0.86"/>`;
      return { svg: frame(st, `<defs><clipPath id="mpC"><rect x="0" y="0" width="${num(w)}" height="${H}" rx="12"/></clipPath></defs><g clip-path="url(#mpC)">${a}${sl}${tag(w / 2, H - 22, 'The slick reaches the nets', { size: 16 })}</g><g transform="translate(${num(w + 8)} 0)" clip-path="url(#mpC)">${b}</g>`) };
    }
    let s = this._world(W, H, 0, 'mp', this.choice === 'port' ? 'port' : 'sea', P);
    if (!this.choice) s += tag(W / 2, H - 24, 'Oily waste on board: choose', { size: 16 });
    if (this.choice === 'side' && !this.run) s += `<path d="${this._slick(W, H, 1, P)}" style="fill:${SEA_INK};opacity:0.86"/>` + tag(W / 2, H - 24, 'The slick reaches the nets', { size: 16 });
    return { svg: frame(st, s) };
  }
  animate(st, t) {
    if (!this.run || this.choice !== 'side' || this.stepIndex === 2) return;
    const u = smooth(Math.min(1, t / DUR)), L = this.live;
    const p = L.shape('slick', 'path', {});
    L.attrs(p, { d: this._slick(st.W, st.H, Math.max(0.02, u), st.portrait) });
    p.style.fill = SEA_INK; p.style.opacity = '0.86';
    if (u >= 1) { this.run = false; this.repaint(); }
  }
}
