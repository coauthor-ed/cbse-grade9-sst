/**
 * MaskWaveScene - L05 s05 "Equilibrium Keeps Moving" (3 beats). SvgScene, design units 560 x 480 landscape,
 * 390 x 640 portrait. A market graph with no numbers (shared/ShiftGraph.js: demand MKT series-5, supply SUP
 * series-7). The book gives no mask prices, so no rupee numbers anywhere.
 *   b0  seven causes in the figure (new technology, wages rise, interest rates rise, a war, a pandemic, bad
 *       weather, a disaster). Tap one: ONE curve moves (old curve dashed), E moves (old E hollow), a pill says
 *       which curve moved and one says whether the price rises or falls. Cold start: new technology.
 *   b1  masks in 2020: a mask counter with a small pile and a queue that grows; on the graph the demand curve
 *       moves far right, supply stays, E rises high: "price rose a lot". Plays on entry, "replay".
 *   b2  a 3-step timeline: "2020 rush" (demand far right), "makers catch up" (supply moves right, E comes down,
 *       a big pile of masks), "after the pandemic" (demand moves back left, the price ends at about the old
 *       price, a short queue). Tap a step; cold start plays catch up -> after and rests on "after".
 * Colours are tokens only. ASCII only.
 */
import { SvgScene, fill, stroke, shade } from 'simulations/base/kit/SimSvg.js';
import { iconSvg } from 'simulations/base/kit/SimIcons.js';
import { civicSvg } from 'simulations/base/kit/SimCivic.js';
import { PEOPLE_CSS, personSlot, paintPeople } from '../shared/MangoPeople.js';
import { BTN_CSS, txt, pill, btn } from '../shared/MarketParts.js';
import { gFrame, gAxes, shiftGraph, ePos, DUR } from '../shared/ShiftGraph.js';

const f1 = (v) => (+v).toFixed(1);
const MAP = [[{ idx: 0, dwellMs: null }], [{ idx: 1, dwellMs: null }], [{ idx: 2, dwellMs: null }]];
const UP = '\u2191';
const DN = '\u2193';
const ACC = 'var(--sim-accent)';
const ACC_INK = 'var(--sim-ink-on-accent, var(--sim-bg-deep))';
const CAUSES = [
  { lab: 'new technology', chip: 'technology', icon: 'bulb', tone: 'var(--sim-gold)', d: 0, s: 2.5 },
  { lab: 'wages rise', chip: 'wages', icon: 'coin', tone: 'var(--sim-gold)', d: 0, s: -2 },
  { lab: 'interest rates rise', chip: 'interest rates', icon: 'money-bag', tone: 'var(--sim-series-4)', d: -2.5, s: 0 },
  { lab: 'a war', chip: 'war', icon: 'flame', tone: 'var(--sim-flame)', d: 0, s: -2 },
  { lab: 'a pandemic', chip: 'pandemic', icon: 'hospital', tone: 'var(--sim-series-1)', d: 2.5, s: 0 },
  { lab: 'bad weather', chip: 'weather', icon: 'rain', tone: 'var(--sim-water)', d: 0, s: -2 },
  { lab: 'a disaster', chip: 'disaster', icon: 'river', tone: 'var(--sim-water)', d: 0, s: -2 },
];
// the mask story: [demand shift, supply shift, queue, pile rows]
const TL = [
  { lab: ['2020', 'rush'], d: 5, s: 0, queue: 6, pile: 1 },
  { lab: ['makers', 'catch up'], d: 5, s: 3, queue: 4, pile: 4 },
  { lab: ['after the', 'pandemic'], d: 3, s: 3, queue: 2, pile: 4 },
];
const MASK = 'color-mix(in oklab, var(--sim-sea-shallow) 38%, var(--sim-bg-surface))';

const CSS = `
.mw-cause .mq-btn { display: flex; align-items: center; gap: 8px; width: var(--bw, 200px); justify-content: flex-start; padding-left: 10px; font-size: 19px; }
.mw-cause .sim-icon { width: 30px; height: 30px; flex: none; }
.mw-tl .mq-btn { white-space: normal; text-align: center; line-height: 1.12; width: var(--bw, 150px); }
`;

/** One flat face mask: pleated rectangle and two ear loops; (x, y) centre, w wide. */
function mask(x, y, w) {
  const h = w * 0.56, rim = shade(MASK, 62);
  let s = `<path d="M${f1(x - w / 2)} ${f1(y - h * 0.2)}c${f1(-w * 0.2)} ${f1(-h * 0.1)} ${f1(-w * 0.2)} ${f1(h * 0.5)} 0 ${f1(h * 0.42)}M${f1(x + w / 2)} ${f1(y - h * 0.2)}c${f1(w * 0.2)} ${f1(-h * 0.1)} ${f1(w * 0.2)} ${f1(h * 0.5)} 0 ${f1(h * 0.42)}" ${stroke(rim, 2)}/>`;
  s += `<path d="M${f1(x - w / 2)} ${f1(y - h * 0.38)}Q${f1(x)} ${f1(y - h * 0.6)} ${f1(x + w / 2)} ${f1(y - h * 0.38)}V${f1(y + h * 0.3)}Q${f1(x)} ${f1(y + h * 0.56)} ${f1(x - w / 2)} ${f1(y + h * 0.3)}Z" ${fill(MASK, `stroke:${rim};stroke-width:2`)}/>`;
  for (const t of [-0.12, 0.08, 0.28]) s += `<path d="M${f1(x - w / 2 + 2)} ${f1(y + h * t)}Q${f1(x)} ${f1(y + h * (t - 0.12))} ${f1(x + w / 2 - 2)} ${f1(y + h * t)}" ${stroke(rim, 1.5)}/>`;
  return s;
}

/** A pile of masks on a counter: rows of masks, each row one fewer; (x, y) bottom centre. */
function maskPile(x, y, rows, w) {
  let s = '';
  for (let r = 0; r < rows; r++) {
    const n = Math.max(1, 3 - (r >> 1)), mw = w / 3.3;
    for (let i = 0; i < n; i++) s += mask(x + (i - (n - 1) / 2) * mw * 0.98, y - mw * 0.32 - r * mw * 0.3, mw);
  }
  return s;
}

function icon(name, tone) { return iconSvg(name, tone); }

export class MaskWaveScene extends SvgScene {
  static WIDTH = 560;
  static PORTRAIT_WIDTH = 390;
  static HEIGHT = 480;
  static PORTRAIT_HEIGHT = 640;
  static CONTINUOUS = false;
  static BEAT_STEP_MAP = MAP;
  static BEAT_MAPS = { 3: MAP };
  static CONTROLS = [];
  static ARIA_LABEL = 'A market graph with a demand curve and a supply curve crossing at E. Many things move one of the curves: new technology moves supply right and the price falls; rising wages, a war, bad weather or a disaster move supply left and the price rises; rising interest rates move demand left; a pandemic moves demand right. Face masks in 2020: demand moved far to the right while supply could not change at once, so E rose high and the price rose a lot. Then makers produced more, the supply curve moved right and the price fell; after the pandemic demand fell further and the price came back to about the old price.';

  async setup() {
    this.cause = 0;
    this.tl = 2;
    this.prev = null;
    this.anim = false;
    this.fresh = false;
    await super.setup();
    this._onClick = (e) => {
      const b = e.target?.closest?.('[data-act]');
      if (!b) return;
      const a = b.dataset.act, v = Number(b.dataset.val);
      if (this.stepIndex === 0 && a === 'cause') this.pickCause(v);
      else if (this.stepIndex === 1 && a === 'replay') this.rush();
      else if (this.stepIndex === 2 && a === 'tl') this.goTl(v);
    };
    this.root.addEventListener('click', this._onClick);
  }

  destroy() {
    this.root?.removeEventListener('click', this._onClick);
    super.destroy();
  }

  css() { return PEOPLE_CSS + BTN_CSS + CSS; }

  repaint() { super.repaint(); paintPeople(this); }

  clear() { for (const t of (this._timers ?? []).splice(0)) clearTimeout(t); this.anim = false; this.fresh = false; this.prev = null; }

  enter(step) {
    this.clear();
    this.cause = 0;
    if (step === 0) this.pickCause(0);
    else if (step === 1) this.rush();
    else { this.tl = 0; this.goTl(1, () => this.after(0.6, () => this.goTl(2))); }
  }

  // a move: prev = the state it slides from; rest after DUR + a beat
  run(prev, then) {
    this.anim = true;
    this.prev = prev;
    this.fresh = true;
    this.repaint();
    this.fresh = false;
    this.prev = null;
    this.after(DUR + 0.5, () => { this.anim = false; this.repaint(); if (then) then(); });
  }

  pickCause(i) { this.clear(); this.cause = i; this.run({ d: 0, s: 0 }); }

  rush() { this.clear(); this.run({ d: 0, s: 0 }); }

  goTl(i, then) {
    const from = this.tl;
    for (const t of (this._timers ?? []).splice(0)) clearTimeout(t);
    this.tl = i;
    const f = i === 0 ? { d: 0, s: 0 } : TL[from === i ? i - 1 : from];
    this.run({ d: f.d, s: f.s }, then);
  }

  skip() {
    if (!this.anim) return false;
    for (const t of (this._timers ?? []).splice(0)) clearTimeout(t);
    if (this.stepIndex === 2) this.tl = 2;
    this.anim = false;
    this.prev = null;
    this.repaint();
    return true;
  }

  busy() { return this.anim; }

  stageHeight(st) { return Math.round((st.portrait ? 640 : 480) * st.W / (st.portrait ? 390 : 560)); }

  paint(st) {
    const P = st.portrait, DW = P ? 390 : 560, DH = P ? 640 : 480, k = (st.W / DW).toFixed(4);
    const out = this.stepIndex === 0 ? this.paintCauses(P) : this.paintMasks(P);
    return { svg: `<g transform="scale(${k})">${out.svg}</g>`, over: `<div style="position:absolute;left:0;top:0;width:${DW}px;height:${DH}px;transform:scale(${k});transform-origin:0 0">${out.over}</div>` };
  }

  graph(g, cur, from, P, o = {}) {
    let svg = gAxes(g, { yTitleX: g.L - 20, xTitleY: g.B + 30, title: P ? 20 : 22 });
    const pr = from ?? null;
    svg += shiftGraph(g, { d: cur.d, s: cur.s, gd: o.gd ?? 0, gs: o.gs ?? 0, fromD: pr?.d, fromS: pr?.s, eFrom: pr, ghostE: o.ghostE ?? { d: 0, s: 0 }, pArrow: !this.anim, qArrow: false, guides: false, lab: P ? 19 : 20, clip: 'mwclip' });
    return svg;
  }

  // b0: seven causes; one curve moves
  paintCauses(P) {
    const c = CAUSES[this.cause], g = P ? gFrame(50, 370, 94, 336) : gFrame(46, 316, 96, 370);
    let svg = this.graph(g, c, this.prev, P), over = '';
    const which = c.d !== 0 ? 'demand' : 'supply', dir = (c.d || c.s) > 0 ? 'right' : 'left';
    const e0 = ePos(g, 0, 0), e1 = ePos(g, c.d, c.s), up = e1.p > e0.p;
    const tone = which === 'demand' ? 'var(--sim-series-5)' : 'var(--sim-series-7)', ink = which === 'demand' ? 'var(--sim-ink-on-5, var(--sim-bg-deep))' : 'var(--sim-ink-on-7, var(--sim-bg-deep))';
    const ps = P ? 19 : 20;
    svg += pill(P ? 195 : (g.L + g.R) / 2, 26, `${which} moves ${dir}`, { size: P ? 19 : 20, bg: tone, ink, edge: tone });
    if (!this.anim) svg += `<g class="mq-fade">${pill(P ? 195 : (g.L + g.R) / 2, P ? 404 : 444, `new E: price ${up ? `rises ${UP}` : `falls ${DN}`}`, { size: ps, bg: ACC, ink: ACC_INK, edge: ACC })}</g>`;
    const bw = P ? 178 : 200;
    let list = '';
    CAUSES.forEach((cs, i) => {
      const [x, y] = P ? [i % 2 ? 288 : 102, 446 + Math.floor(i / 2) * 52] : [446, 50 + i * 58];
      const lab = `${icon(cs.icon, cs.tone)}<span>${cs.chip}</span>`;
      list += btn('cause', lab, x, y, { val: i, on: i === this.cause, size: P ? 16 : 18, aria: cs.lab });
    });
    over += `<div class="mw-cause" style="--bw:${bw}px">${list}</div>`;
    return { svg, over };
  }

  // b1 / b2: the masks
  paintMasks(P) {
    const b1 = this.stepIndex === 1, step = b1 ? TL[0] : TL[this.tl];
    const g = P ? gFrame(50, 370, 54, 300) : gFrame(46, 330, 40, 268);
    const ghostE = b1 ? { d: 0, s: 0 } : { d: 0, s: 0 };
    const gd = 0, gs = 0;
    let svg = this.graph(g, step, this.prev, P, { gd, gs, ghostE }), over = '';
    const e0 = ePos(g, 0, 0), e1 = ePos(g, step.d, step.s), ps = P ? 18 : 20;
    if (!this.anim) {
      let t = '';
      if (b1 || this.tl === 0) t = `price rose a lot ${UP}`;
      else if (this.tl === 1) t = `price fell ${DN}`;
      else t = 'about the old price';
      const px = P ? 195 : (b1 ? 442 : 452), py = P ? 370 : (b1 ? 200 : 262);
      svg += `<g class="mq-fade">${pill(px, py, t, { size: P ? ps : 18, bg: ACC, ink: ACC_INK, edge: ACC })}</g>`;
      if (!b1 && this.tl === 2) svg += `<path d="M${f1(g.L)} ${f1(e0.y)}H${f1(g.R)}" ${stroke('var(--sim-label-muted)', 2, 'stroke-dasharray:3 6;opacity:0.7')}/>`;
    }
    // the mask counter and its queue
    const gy = P ? 520 : 436, sw = P ? 140 : 150, sx = P ? 318 : 474;
    const stall = civicSvg('stall', sx, gy, { w: sw }).replace(/<g data-part="goods"[^>]*>[\s\S]*?<\/g>/g, '');
    const counter = gy - 84 * sw / 230;
    let front = stall + `<g${this.fresh ? ' class="mq-fade"' : ''}>${maskPile(sx, counter + 2, step.pile, sw * 0.86)}</g>`;
    svg += front;
    svg += txt(sx, gy + 26, 'masks', P ? 18 : 20, 'var(--sim-label)');
    const n = step.queue, gap = P ? 40 : 52, h = P ? 96 : 104;
    for (let i = 0; i < 6; i++) {
      if (i >= n) continue;
      const x = sx - sw / 2 - 26 - i * gap;
      const newer = this.fresh && b1 && i >= 2;
      const cls = newer ? 'mq-fly' : '';
      const style = newer ? `--dx:-120px;--dy:0px;--dur:0.6s;--d:${(0.25 + (i - 2) * 0.22).toFixed(2)}s` : '';
      over += personSlot(`buyer${i + 3}`, { x, y: gy, h: h - (i % 2) * 8, pose: newer ? 'walk' : 'stand', facing: 1, mood: b1 || this.tl === 0 ? 'think' : 'smile', cls, style });
    }
    if (!P) svg += txt(80, gy + 26, n > 4 ? 'a long queue' : 'a short queue', 18, 'var(--sim-label-muted)', 'start');
    // controls
    if (b1) {
      svg += pill(P ? 100 : 442, P ? 590 : 60, '2020', { size: P ? 20 : 24, bg: 'var(--sim-bg-surface)', ink: 'var(--sim-label)', edge: 'var(--sim-stroke)' });
      if (!this.anim) over += btn('replay', 'replay', P ? 290 : 442, P ? 590 : 130, { size: 18 });
    } else {
      const bw = P ? 118 : 150;
      let row = '';
      TL.forEach((t, i) => {
        const [x, y] = P ? [70 + i * 125, 596] : [458, 48 + i * 74];
        row += btn('tl', `${P ? '' : `${i + 1}. `}${t.lab[0]}<br>${t.lab[1]}`, x, y, { val: i, on: i === this.tl, size: P ? 16 : 18, aria: `${t.lab[0]} ${t.lab[1]}` });
      });
      over += `<div class="mw-tl" style="--bw:${bw}px">${row}</div>`;
      if (!P) svg += `<path d="M${f1(458)} ${f1(80)}V${f1(196)}" ${stroke('var(--sim-stroke)', 3, 'stroke-dasharray:4 5')}/>`;
    }
    return { svg, over };
  }

  testState() {
    const s = this.stepIndex;
    const cur = s === 0 ? CAUSES[this.cause] : s === 1 ? TL[0] : TL[this.tl];
    return { step: s, cause: s === 0 ? CAUSES[this.cause].lab : null, tl: s === 2 ? this.tl : null, d: cur.d, s: cur.s, anim: this.anim };
  }
}
