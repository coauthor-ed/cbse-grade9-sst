// SlideTriggerScene - three slopes under one storm, one big slope at a time. blk-l10-s02 setup, blk-l10-s03 3 beats.
// A gentle with trees, B steep with trees, C steep bare road cut with a blocked drain. C slides: its risks add up.
// Stage 2 tap Natural, Human. Stage 3 add Retaining wall, Clear drain, Trees. Risk is shown as words, not a number.
import { SvgScene } from 'simulations/base/kit/SimSvg.js';
import { tapLight } from 'simulations/base/kit/TapLight.js';
import { LAND_CSS, art, world, bar, bindActs, tag, lead, svgCloud, svgRain, tween, stopTween, tweening, ease, n1, INK } from '../L08/LandDraw.js';
import { slopeOf, slopeBody, trees, looseRocks, drain, slideHeap } from './SlopeDraw.js';

const S = (i) => [{ idx: i, dwellMs: null }];
const MAP = [S(1), S(2), S(3)];
const CHIPS = [{ id: 'Natural', label: 'Natural', targets: ['n'], tone: 3 }, { id: 'Human', label: 'Human', targets: ['h'], tone: 2 }];
const KIND = { A: { steep: false, cut: false, wood: true }, B: { steep: true, cut: false, wood: true }, C: { steep: true, cut: true, wood: false } };
const NAME = { A: 'Gentle slope with trees', B: 'Steep slope with trees', C: 'Steep, bare road cut' };

export class SlideTriggerScene extends SvgScene {
  static BEAT_STEP_MAP = MAP;
  static BEAT_MAPS = { 0: [S(0)], [Number.MAX_SAFE_INTEGER]: [S(0)], 1: [S(0)], 3: MAP };
  static ARIA_LABEL = 'Three hillsides under the same heavy rain, one shown at a time. The gentle slope with trees and the steep slope with trees hold. The steep bare road cut with a blocked drain slides, leaving a scar and a heap across the road. A retaining wall, a clear drain and trees make that slope much safer.';
  static CONTROLS = [];
  static HEIGHT = 540;
  tl = tapLight({ label: 'Causes', chips: CHIPS, onChange: () => this.repaint() });
  css() { return LAND_CSS + '.is-setup .ld-btn { min-height: 64px; min-width: 64px; font-size: 22px; }'; }
  stageHeight(st) { return 430; }
  async setup() {
    this._t = 'A'; this._f = 0; this._fix = {};
    await super.setup();
    if (this.hostRole === 'setup') this.root.classList.add('is-setup');
    this.tl.mount(this.root, this);
    this._off = bindActs(this, (a) => {
      if ('ABC'.includes(a)) { this._t = a; this._f = 0; if (a === 'C' && this.stepIndex === 1) this._go(); }
      if (a.startsWith('fix')) {
        this._fix[a] = !this._fix[a];
        this._foundSafe();
      }
    });
    this.enter(this.stepIndex);
  }
  destroy() { stopTween(this); this._off?.(); this.tl.destroy(); super.destroy(); }
  busy() { return this.isPlaying() || tweening(this); }
  _safe() { return this._fix.fixw && this._fix.fixd && this._fix.fixt; }
  _foundSafe() { if (this.stepIndex === 3 && this._safe() && !this._found) { this._found = true; this.celebrate(this.sv.W * 0.6, this.sv.H * 0.6); } }
  _go() { this._f = 0; tween(this, 2.2, (u) => { this._f = ease(u); }); }
  enter(step) {
    stopTween(this);
    this._fix = {}; this._f = 0;
    this._t = step === 0 ? 'A' : 'C';
    if (step === 1) this._go();
    if (!this.tl) return;
    this.tl.set({ lit: step === 2 ? 'Human' : null });
    const r = this.root.querySelector?.('.tl-row');
    if (r) r.hidden = step !== 2;
  }
  paint(st) {
    const W = st.W, step = this.stepIndex, ctl = step === 2 ? 0 : this.hostRole === 'setup' ? 80 : 62, H = st.H - ctl, t = this._t, k = KIND[t], L = slopeOf(W, H, k), f = this._f;
    const fx = this._fix, wood = k.wood || fx.fixt;
    let s = svgCloud(W * 0.68, 42, 1.25, { kind: 'rain', seed: 3 }) + svgRain(W * 0.68, 48, 1, { w: W * 0.56, h: H * 0.34, heavy: true });
    s += slopeBody(L, { soak: 0.8 });
    if (wood) s += trees(L, 4);
    if (t === 'C') {
      s += looseRocks(L, 6);
      s += drain(L, !fx.fixd);
      if (fx.fixw) s += `<rect x="${n1(L.sh[0] - 8)}" y="${n1(L.sh[1] - 6)}" width="${n1(L.toe - L.sh[0] + 16)}" height="${n1(L.cutH + 8)}" rx="3" style="fill:${art('slate')};stroke:${INK};stroke-width:3"/><path d="M${n1(L.sh[0] - 8)} ${n1(L.sh[1] + L.cutH * 0.33)}h${n1(L.toe - L.sh[0] + 16)}M${n1(L.sh[0] - 8)} ${n1(L.sh[1] + L.cutH * 0.66)}h${n1(L.toe - L.sh[0] + 16)}" style="stroke:${INK};stroke-width:2.5"/>`;
      if (f > 0) s += slideHeap(L, f);
    }
    const y1 = H - 24;
    if (step <= 1) s += tag(W * 0.3, 28, `${t}: ${NAME[t]}`, { size: 14 });
    if (step === 1 && t !== 'C') s += tag(W * 0.74, y1, 'This slope holds', { size: 15 });
    if (step === 1 && t === 'C' && f > 0.9) {
      s += tag(W * 0.74, H * 0.42 - 6, 'Support removed', { size: 14 }) + lead(W * 0.74, H * 0.42 + 8, L.sh[0] + 6, L.sh[1] + 10) + tag(W * 0.3, y1, 'No roots, blocked drain', { size: 14 });
    }
    if (step === 2) {
      const on = (id) => this.tl.lit().includes(id);
      if (on('n')) s += tag(W * 0.3, 28, 'Heavy rain', { size: 14 }) + tag(W * 0.7, H * 0.5 + 40, 'Steep slope', { size: 14 }) + tag(W * 0.28, H * 0.86, 'Loose, weathered rock', { size: 14 });
      if (on('h')) s += tag(W * 0.3, 28, 'Trees cut down', { size: 14 }) + tag(W * 0.8, L.sh[1] - 16, 'Road cut', { size: 14 }) + lead(W * 0.8, L.sh[1] - 4, L.toe - 6, L.road - 26) + tag(W * 0.76, H - 16, 'Poor drainage', { size: 14 }) + tag(W * 0.28, H * 0.86, 'Mining, unplanned building', { size: 14 });
    }
    if (step === 3) s += tag(W * 0.3, 28, this._safe() ? 'Much safer' : 'Still at risk', { size: 16, col: this._safe() ? art('grassLit') : art('sandLit') });
    let over = '';
    if (step <= 1) over = bar(H + 8, 'ABC'.split('').map((x) => ({ label: x, act: x, on: t === x })));
    if (step === 3) over = bar(H + 6, [['Retaining wall', 'fixw'], ['Clear drain', 'fixd'], ['Trees', 'fixt']].map(([label, act]) => ({ label, act, on: !!fx[act] })));
    return { svg: world('st', W, H, s), over };
  }
}
