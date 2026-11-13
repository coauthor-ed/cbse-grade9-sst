/**
 * MarketCloseScene - L05 s10 "What Prices Tell Us" (2 beats). SvgScene, design units 560 x 490 landscape,
 * 390 x 640 portrait.
 *   b0  the mango market graph (as PointEScene: DmDm' MKT series-5 q = 24 - 0.12 p, SmSm' SUP series-7 q = 0.12 p):
 *       E ringed at Rs 100 / 12 kg; the Rs 150 line with "surplus" and a down arrow towards E, the Rs 50 line with
 *       "shortage" and an up arrow. Then the demand curve slides 3 kg right (the old one dashed), E moves to a new
 *       place: "E keeps moving". Plays on entry, "replay".
 *   b1  a medicine counter with a "high price" tag (no number: the text gives none). One family (parent and
 *       child) pays and holds a box of medicine: "can pay". The other family walks away with empty hands:
 *       "cannot pay". Chip "next: the role of the government". No party names, no leaders.
 * People are SimFigure people via ../shared/MangoPeople.js. Colours are tokens only. ASCII only.
 */
import { SvgScene, fill, stroke, shade } from 'simulations/base/kit/SimSvg.js';
import { iconSvg } from 'simulations/base/kit/SimIcons.js';
import { RS } from '../shared/MangoKit.js';
import { PEOPLE_CSS, personSlot, paintPeople, frontSvg, registerCast } from '../shared/MangoPeople.js';
import { MKT, BTN_CSS, txt, frame, axes, line, dot, arrow, pill, btn } from '../shared/MarketParts.js';
import { SUP, SINK } from '../shared/SupplyParts.js';

const f1 = (v) => (+v).toFixed(1);
const MAP = [[{ idx: 0, dwellMs: null }], [{ idx: 1, dwellMs: null }]];
const ACC = 'var(--sim-accent)';
const ACC_INK = 'var(--sim-ink-on-accent, var(--sim-bg-deep))';
const MOVE = 3;
const BOX = 'var(--sim-bg-surface)';
const BOXC = 'var(--sim-series-1)';
const WOOD = 'color-mix(in oklab, var(--sim-series-8) 50%, var(--sim-bg-surface))';

registerCast('medA', { name: 'parent', role: 'adult', i: 21, look: { outfit: 'kurti', hairStyle: 'long', top: 's2', bottom: 'cream', dupatta: true, pattern: 'plain', glasses: false, moustache: false } });
registerCast('medK', { name: 'child', role: 'child', i: 22, look: { outfit: 'tee', hairStyle: 'short', top: 's4', bottom: 'denim', bottomStyle: 'shorts', pattern: 'plain', glasses: false, dupatta: false } });
registerCast('poorA', { name: 'parent', role: 'adult', i: 23, look: { outfit: 'shirt', hairStyle: 'sidepart', top: 's6', bottom: 'khaki', pattern: 'plain', moustache: true, glasses: false, dupatta: false } });
registerCast('poorK', { name: 'child', role: 'child', i: 24, look: { outfit: 'kurti', hairStyle: 'braid', top: 's3', bottom: 'cream', pattern: 'plain', glasses: false, dupatta: false } });

function curveLabel(x, y, letter, prime, col, size, anchor = 'start') {
  return `<text x="${f1(x)}" y="${f1(y)}" text-anchor="${anchor}" style="fill:${col};font:800 ${size}px var(--sim-font)">${letter}<tspan style="font-size:${Math.round(size * 0.68)}px" dy="${Math.round(size * 0.2)}">m</tspan>${prime ? `<tspan dy="-${Math.round(size * 0.2)}">'</tspan>` : ''}</text>`;
}

/** A box of medicine, (x, y) bottom centre, w wide: a white box, a coloured band and a capsule on it. */
function medBox(x, y, w) {
  const h = w * 0.7, x0 = x - w / 2, y0 = y - h;
  let s = `<rect x="${f1(x0)}" y="${f1(y0)}" width="${f1(w)}" height="${f1(h)}" rx="${f1(w * 0.08)}" ${fill(BOX, `stroke:${shade(BOXC, 60)};stroke-width:2`)}/>`;
  s += `<rect x="${f1(x0)}" y="${f1(y0 + h * 0.3)}" width="${f1(w)}" height="${f1(h * 0.4)}" ${fill(BOXC, `stroke:${shade(BOXC, 60)};stroke-width:1.5`)}/>`;
  const cw = w * 0.46, ch = h * 0.24, cx = x - cw / 2, cy = y0 + h * 0.38;
  s += `<rect x="${f1(cx)}" y="${f1(cy)}" width="${f1(cw)}" height="${f1(ch)}" rx="${f1(ch / 2)}" ${fill(BOX, `stroke:${shade(BOXC, 50)};stroke-width:1.5`)}/>`;
  s += `<path d="M${f1(x)} ${f1(cy)}h${f1(cw / 2 - ch / 2)}a${f1(ch / 2)} ${f1(ch / 2)} 0 0 1 0 ${f1(ch)}h${f1(-(cw / 2 - ch / 2))}Z" ${fill('var(--sim-gold)', `stroke:${shade(BOXC, 50)};stroke-width:1.5`)}/>`;
  return s;
}

/** The medicine counter: a shelf wall of boxes, a sign, a counter; (cx, gy) ground centre, w wide. */
function counter(cx, gy, w) {
  const x0 = cx - w / 2, top = gy - w * 0.95, ch = w * 0.34;
  let s = `<rect x="${f1(x0)}" y="${f1(top)}" width="${f1(w)}" height="${f1(gy - top)}" rx="8" ${fill('color-mix(in oklab, var(--sim-series-1) 12%, var(--sim-bg-surface))', 'stroke:var(--sim-stroke);stroke-width:2.5')}/>`;
  s += `<rect x="${f1(x0 + w * 0.12)}" y="${f1(top - 22)}" width="${f1(w * 0.76)}" height="40" rx="9" ${fill('var(--sim-bg-surface)', 'stroke:var(--sim-stroke);stroke-width:2.5')}/>`;
  s += txt(cx, top + 6, 'medicines', 24, 'var(--sim-label)');
  for (let r = 0; r < 2; r++) {
    const sy = top + 34 + r * (w * 0.2) + w * 0.16;
    for (let i = 0; i < 4; i++) s += medBox(x0 + w * (0.17 + i * 0.22), sy, w * 0.15);
    s += `<path d="M${f1(x0 + 8)} ${f1(sy + 2)}H${f1(x0 + w - 8)}" ${stroke(shade(WOOD, 60), 5)}/>`;
  }
  s += `<rect x="${f1(x0 - 10)}" y="${f1(gy - ch)}" width="${f1(w + 20)}" height="${f1(ch)}" rx="6" ${fill(WOOD, `stroke:${shade(WOOD, 60)};stroke-width:3`)}/>`;
  s += `<rect x="${f1(x0 - 16)}" y="${f1(gy - ch - 10)}" width="${f1(w + 32)}" height="14" rx="5" ${fill(shade(WOOD, 85), `stroke:${shade(WOOD, 60)};stroke-width:2.5`)}/>`;
  return { svg: s, top: gy - ch - 10 };
}

export class MarketCloseScene extends SvgScene {
  static WIDTH = 560;
  static PORTRAIT_WIDTH = 390;
  static HEIGHT = 490;
  static PORTRAIT_HEIGHT = 640;
  static CONTINUOUS = false;
  static BEAT_STEP_MAP = MAP;
  static BEAT_MAPS = { 2: MAP };
  static CONTROLS = [];
  static ARIA_LABEL = 'The mango market graph: the demand curve and the supply curve meet at E, 100 rupees and 12 kg. At 150 rupees, above E, there is a surplus and the price falls; at 50 rupees, below E, there is a shortage and the price rises. Then the demand curve moves to the right and E moves to a new place: E keeps moving. Then a medicine counter with a high price: one family can pay and takes a box of medicine; the other family cannot pay and walks away with empty hands. Next: the role of the government.';

  async setup() {
    this.moved = true;
    this.anim = false;
    this.fresh = false;
    this.slide = false;
    await super.setup();
    this._onClick = (e) => {
      const b = e.target?.closest?.('[data-act]');
      if (b && b.dataset.act === 'replay' && this.stepIndex === 0) this.play0();
    };
    this.root.addEventListener('click', this._onClick);
  }

  destroy() {
    this.root?.removeEventListener('click', this._onClick);
    super.destroy();
  }

  css() { return PEOPLE_CSS + BTN_CSS; }

  repaint() { super.repaint(); paintPeople(this); }

  clear() { for (const t of (this._timers ?? []).splice(0)) clearTimeout(t); this.anim = false; this.fresh = false; this.slide = false; }

  enter(step) {
    this.clear();
    if (step === 0) this.play0();
    else {
      this.anim = true;
      this.fresh = true;
      this.repaint();
      this.fresh = false;
      this.after(1.8, () => { this.anim = false; this.repaint(); });
    }
  }

  // b0: the recap pops in, then the demand curve moves and E with it
  play0() {
    this.clear();
    this.anim = true;
    this.moved = false;
    this.fresh = true;
    this.repaint();
    this.fresh = false;
    this.after(1.6, () => { this.moved = true; this.slide = true; this.repaint(); this.slide = false; });
    this.after(2.7, () => { this.anim = false; this.fresh = true; this.repaint(); this.fresh = false; });
  }

  skip() {
    if (!this.anim) return false;
    this.clear();
    this.moved = true;
    this.repaint();
    return true;
  }

  busy() { return this.anim; }

  stageHeight(st) { return Math.round((st.portrait ? 640 : 490) * st.W / (st.portrait ? 390 : 560)); }

  paint(st) {
    const P = st.portrait, DW = P ? 390 : 560, DH = P ? 640 : 490, k = (st.W / DW).toFixed(4);
    const out = this.stepIndex === 0 ? this.paintGraph(P) : this.paintCounter(P);
    return { svg: `<g transform="scale(${k})">${out.svg}</g>`, over: `<div style="position:absolute;left:0;top:0;width:${DW}px;height:${DH}px;transform:scale(${k});transform-origin:0 0">${out.over}</div>` };
  }

  paintGraph(P) {
    const fresh = this.fresh, g = P ? frame(78, 374, 66, 430, 24, 200) : frame(132, 528, 58, 368, 24, 200);
    const pop = (d) => (fresh ? ` class="mq-pop" style="--d:${d}s"` : '');
    const ls = P ? 26 : 30;
    let svg = '', over = '';
    svg += axes(g, { xs: [6, 18], ys: [50, 150], gridX: [6, 12, 18], gridY: [50, 100, 150], yTitleX: P ? -999 : 40, yTitle: P ? '' : undefined, xTitleY: P ? 492 : 446, tick: P ? 18 : 20, title: P ? 20 : 22 });
    if (P) svg += txt(10, 34, `price (${RS} per kg)`, 20, 'var(--sim-label)', 'start');
    // the surplus and shortage lines with their arrows towards E. They follow the demand curve: once it has
    // moved, each gap runs from the new quantity demanded to the quantity supplied, and the arrows aim at E'.
    const d = this.moved ? MOVE : 0, pE = (24 + d) / 2 / 0.12;
    const gapLate = this.slide ? ' class="mq-fade" style="--d:0.8s"' : '';
    let gaps = '';
    for (const [p, lab, dir] of [[150, 'surplus', 1], [50, 'shortage', -1]]) {
      const y = g.Y(p), qd = 24 - 0.12 * p + d, qs = 0.12 * p, q0 = Math.min(qd, qs), q1 = Math.max(qd, qs);
      svg += `<path d="M${f1(g.L)} ${f1(y)}H${f1(g.R)}" ${stroke('var(--sim-label-muted)', 2, 'stroke-dasharray:6 6')}/>`;
      gaps += `<path d="M${f1(g.X(q0))} ${f1(y)}H${f1(g.X(q1))}" ${stroke(ACC, 6)}/>`;
      gaps += `<g${pop(0.3)}>${pill(g.X((q0 + q1) / 2), y + (dir > 0 ? -30 : 32), lab, { size: P ? 19 : 21 })}</g>`;
      const ax = g.L + (P ? 26 : 30);
      gaps += `<g${pop(0.6)}>${arrow(ax, y + dir * 4, ax, g.Y(pE) - dir * 16, ACC, 6)}</g>`;
    }
    svg += `<g${gapLate}>${gaps}</g>`;
    // the old demand curve as a ghost once it has moved
    if (this.moved) svg += line(g, 22.5, 12.5, 1.5, 187.5, 'var(--sim-label-muted)', { w: 5, dash: '10 9', opacity: 0.6 });
    const dx = this.slide ? f1(g.X(0) - g.X(MOVE)) : 0;
    const fly = this.slide ? ` class="mq-fly" style="--dx:${dx}px;--dy:0px;--dur:0.8s"` : '';
    svg += `<g${fly}>${line(g, 22.5 + d, 12.5, 1.5 + d, 187.5, MKT, { w: 7 })}${curveLabel(g.X(1.5 + d) + 12, g.Y(187.5) + 10, 'D', false, SINK(5), ls)}${curveLabel(g.X(Math.min(23.4, 22.5 + d)) - 6, g.Y(12.5 + d / 0.12 * 0) + (d ? -30 : 6), 'D', true, SINK(5), ls, 'end')}</g>`;
    svg += line(g, 1.5, 12.5, 22.5, 187.5, SUP, { w: 7 });
    svg += curveLabel(g.X(1.5) + 14, g.Y(12.5) + 4, 'S', false, SINK(7), ls) + curveLabel(g.X(22.5) - 8, g.Y(187.5) + 8, 'S', true, SINK(7), ls, 'end');
    // E (Rs 100, 12 kg) and, once moved, the new E
    const ex = g.X(12), ey = g.Y(100);
    svg += `<path d="M${f1(g.L)} ${f1(ey)}H${f1(ex)}V${f1(g.B)}" ${stroke(ACC, 3, 'stroke-dasharray:9 8')}/>`;
    svg += `<circle cx="${f1(ex)}" cy="${f1(ey)}" r="${P ? 22 : 26}" ${fill('color-mix(in oklab, var(--sim-accent) 18%, transparent)', 'stroke:var(--sim-accent);stroke-width:4.5')}/>`;
    svg += dot(ex, ey, '', { col: 'var(--sim-label)', r: 9 });
    svg += txt(ex - (P ? 24 : 30), ey - (P ? 18 : 22), 'E', P ? 30 : 34, ACC, 'end');
    svg += pill(g.L - (P ? 38 : 44), ey, `${RS}100`, { size: P ? 20 : 24, bg: ACC, ink: ACC_INK, edge: ACC, padX: 18 });
    svg += pill(ex, g.B + (P ? 26 : 28), '12 kg', { size: P ? 20 : 24, bg: ACC, ink: ACC_INK, edge: ACC, padX: 18 });
    if (this.moved) {
      const q2 = (24 + MOVE) / 2, p2 = q2 / 0.12, nx = g.X(q2), ny = g.Y(p2);
      const late = this.slide ? ' class="mq-fade" style="--d:0.8s"' : '';
      svg += `<g${late}>${dot(nx, ny, '', { col: 'var(--sim-label)', r: 9 })}${txt(nx + 8, ny - 18, "E'", P ? 26 : 30, ACC, 'start')}</g>`;
      if (!this.anim) {
        svg += `<g${fresh ? ' class="mq-fade"' : ''}>${pill(P ? 282 : 330, P ? 34 : 24, 'E keeps moving', { size: P ? 20 : 22, bg: ACC, ink: ACC_INK, edge: ACC })}</g>`;
        over += btn('replay', 'replay', P ? 195 : 470, P ? 556 : 458, { size: 18 });
      }
    }
    return { svg, over };
  }

  paintCounter(P) {
    const fresh = this.fresh;
    const G = P ? { cx: 195, cgy: 440, cw: 200, gy: 548, fam1: [60, 130], fam2: [262, 330], H: 150, h: 104, chip: [195, 614] }
      : { cx: 280, cgy: 330, cw: 230, gy: 398, fam1: [60, 128], fam2: [420, 488], H: 160, h: 110, chip: [280, 466] };
    let svg = '', over = '', front = '';
    const C = counter(G.cx, P ? G.cgy : G.gy, G.cw);
    svg += C.svg;
    // the price tag on the counter: no number, the text gives none
    const tx = G.cx, ty = C.top - 30;
    svg += `<g${fresh ? ' class="mq-pop" style="--d:0.1s"' : ''}>${pill(tx, ty, `high price ${'\u2191'}`, { size: P ? 21 : 23, bg: 'var(--sim-bad)', ink: 'var(--sim-bg-deep)', edge: 'var(--sim-bad)' })}</g>`;
    // family 1 pays: the parent holds a box of medicine
    const [a1, k1] = G.fam1, gy = G.gy, grip = gy - G.H * 0.5;
    over += personSlot('medA', { x: a1, y: gy, h: G.H, pose: 'stand', facing: 0, mood: 'happy', hands: [{ x: a1 + 14, y: grip }, { x: a1 - 14, y: grip }] });
    over += personSlot('medK', { x: k1, y: gy, h: G.h, pose: 'stand', facing: -1, mood: 'smile' });
    front += `<g${fresh ? ' class="mq-pop" style="--d:0.5s"' : ''}>${medBox(a1, grip + 22, 44)}</g>`;
    // family 2 cannot pay: they walk away, empty hands
    const [a2, k2] = G.fam2, walk = fresh ? ' mq-fly' : '';
    const st = fresh ? '--dx:-70px;--dy:0px;--dur:1.1s;--d:0.2s' : '';
    over += personSlot('poorA', { x: a2, y: gy, h: G.H, pose: 'walk', facing: 1, mood: 'sad', cls: walk.trim(), style: st });
    over += personSlot('poorK', { x: k2, y: gy, h: G.h, pose: 'walk', facing: 1, mood: 'sad', cls: walk.trim(), style: st });
    const ly = gy + 22;
    front += `<g${fresh ? ' class="mq-fade" style="--d:0.8s"' : ''}>${pill((a1 + k1) / 2, ly, 'can pay', { size: P ? 19 : 20, bg: 'var(--sim-good)', ink: 'var(--sim-bg-deep)', edge: 'var(--sim-good)' })}`
      + `${pill((a2 + k2) / 2, ly, 'cannot pay', { size: P ? 19 : 20, bg: 'var(--sim-bad)', ink: 'var(--sim-bg-deep)', edge: 'var(--sim-bad)' })}</g>`;
    if (!P) {
      const [cx, cy] = G.chip;
      front += `<g${fresh ? ' class="mq-fade" style="--d:1.2s"' : ''}>${this.chipNext(cx, cy, 21)}</g>`;
    } else front += `<g${fresh ? ' class="mq-fade" style="--d:1.2s"' : ''}>${this.chipNext(G.chip[0], G.chip[1], 19)}</g>`;
    over += frontSvg(P ? 390 : 560, P ? 640 : 490, front);
    return { svg, over };
  }

  chipNext(x, y, size) {
    const t = 'next: the role of the government', tw = t.length * size * 0.56 + size * 3.2, th = size * 1.9;
    const ic = iconSvg('building', 'var(--sim-series-4)').replace('<svg class="sim-icon" viewBox="0 0 48 48" width="48" height="48"', `<svg class="sim-icon" viewBox="0 0 48 48" x="${f1(x - tw / 2 + size * 0.4)}" y="${f1(y - size * 0.75)}" width="${f1(size * 1.5)}" height="${f1(size * 1.5)}"`);
    return `<rect x="${f1(x - tw / 2)}" y="${f1(y - th / 2)}" width="${f1(tw)}" height="${f1(th)}" rx="${f1(th / 2)}" ${fill('var(--sim-bg-surface)', 'stroke:var(--sim-series-4);stroke-width:3')}/>`
      + ic + txt(x + size * 0.9, y + size * 0.36, t, size, 'var(--sim-label)');
  }

  testState() { return { step: this.stepIndex, E: { kg: 12, price: 100 }, moved: this.stepIndex === 0 ? this.moved : null, anim: this.anim }; }
}
