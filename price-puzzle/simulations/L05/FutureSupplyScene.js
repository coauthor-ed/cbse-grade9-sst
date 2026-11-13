/**
 * FutureSupplyScene - L05 s07 "Thinking About Tomorrow" (2 beats). SvgScene, design units 560 x 470 landscape,
 * 390 x 640 portrait. No numbers (the text gives none).
 *   b0  two lakes, "this year" and "next year". Toggle "catch a little" / "catch too much": the caught fish fly
 *       into a crate; the fish left in the lake breed, so next year's lake has many fish (a little caught) or
 *       few (too much caught). A small row: "also: fast fashion, groundwater". Cold start: catch too much.
 *   b1  the market for fish (shared/ShiftGraph.js, demand MKT series-5, supply SUP series-7): next year's
 *       supply curve moves left, this year's stays as a dashed ghost; E moves up and left, arrows on both axes,
 *       pills "higher price" and "smaller quantity". Chip "sustainability: resources that last". Plays on
 *       entry, "replay".
 * Colours are tokens only. ASCII only.
 */
import { SvgScene, fill, stroke, shade } from 'simulations/base/kit/SimSvg.js';
import { iconSvg } from 'simulations/base/kit/SimIcons.js';
import { civicSvg } from 'simulations/base/kit/SimCivic.js';
import { BTN_CSS, txt, pill, btn, crate } from '../shared/MarketParts.js';
import { gFrame, gAxes, shiftGraph, DUR } from '../shared/ShiftGraph.js';

const f1 = (v) => (+v).toFixed(1);
const MAP = [[{ idx: 0, dwellMs: null }], [{ idx: 1, dwellMs: null }]];
const UP = '\u2191';
const LEFT = '\u2190';
const ACC = 'var(--sim-accent)';
const ACC_INK = 'var(--sim-ink-on-accent, var(--sim-bg-deep))';
const FISH = 'var(--sim-series-6)';
const LAKE = 'var(--sim-sea-shallow)';
const SHORE = 'color-mix(in oklab, var(--sim-good) 45%, var(--sim-bg-surface))';
// fish spots in a lake, as fractions of its box (the first ones are the ones left when many are caught)
const SPOTS = [[0.3, 0.42], [0.66, 0.62], [0.5, 0.28], [0.2, 0.72], [0.8, 0.34], [0.42, 0.62], [0.62, 0.84], [0.84, 0.76],
  [0.16, 0.36], [0.34, 0.86], [0.7, 0.2], [0.54, 0.46], [0.24, 0.54], [0.82, 0.54]];
const CASES = [
  { lab: 'catch a little', now: 12, caught: 4, next: 14, note: 'many fish' },
  { lab: 'catch too much', now: 12, caught: 10, next: 3, note: 'few fish' },
];
const SHIFT_S = -2;

const CSS = `
.fs-two .mq-btn { width: var(--bw, 200px); }
`;

/** One fish (no eye: no faces), centre (x, y), length w, facing right (dir 1) or left (-1). */
function fish(x, y, w, dir = 1, o = {}) {
  const h = w * 0.42, rim = shade(FISH, 62);
  const body = `<ellipse cx="0" cy="0" rx="${f1(w * 0.36)}" ry="${f1(h / 2)}" ${fill(FISH, `stroke:${rim};stroke-width:1.8`)}/>`;
  const tail = `<path d="M${f1(-w * 0.32)} 0L${f1(-w * 0.52)} ${f1(-h * 0.5)}L${f1(-w * 0.52)} ${f1(h * 0.5)}Z" ${fill(shade(FISH, 85), `stroke:${rim};stroke-width:1.8;stroke-linejoin:round`)}/>`;
  const fin = `<path d="M${f1(-w * 0.04)} ${f1(-h * 0.46)}Q${f1(w * 0.06)} ${f1(-h * 0.85)} ${f1(w * 0.14)} ${f1(-h * 0.42)}" ${fill(shade(FISH, 85), `stroke:${rim};stroke-width:1.5`)}/>`;
  return `<g${o.cls ? ` class="${o.cls}"` : ''} style="${o.style ?? ''}"><g transform="translate(${f1(x)} ${f1(y)}) scale(${dir} 1)">${tail}${fin}${body}</g></g>`;
}

/** A lake in the box (x, y, w, h): a shore, the water, two ripples. */
function lake(x, y, w, h) {
  let s = `<rect x="${f1(x - 8)}" y="${f1(y - 8)}" width="${f1(w + 16)}" height="${f1(h + 16)}" rx="${f1(h * 0.3)}" ${fill(SHORE, `stroke:${shade(SHORE, 70)};stroke-width:2`)}/>`;
  s += `<rect x="${f1(x)}" y="${f1(y)}" width="${f1(w)}" height="${f1(h)}" rx="${f1(h * 0.26)}" ${fill(LAKE, `stroke:${shade(LAKE, 70)};stroke-width:2.5`)}/>`;
  for (const [fx, fy] of [[0.18, 0.18], [0.66, 0.92]]) s += `<path d="M${f1(x + w * fx)} ${f1(y + h * fy)}q8 -5 16 0t16 0" ${stroke('color-mix(in oklab, var(--sim-sea-shallow) 40%, var(--sim-bg-surface))', 2.2)}/>`;
  return s;
}

function icon(name, tone, x, y, s) {
  return iconSvg(name, tone).replace('<svg class="sim-icon" viewBox="0 0 48 48" width="48" height="48"', `<svg class="sim-icon" viewBox="0 0 48 48" x="${f1(x - s / 2)}" y="${f1(y - s / 2)}" width="${f1(s)}" height="${f1(s)}"`);
}

export class FutureSupplyScene extends SvgScene {
  static WIDTH = 560;
  static PORTRAIT_WIDTH = 390;
  static HEIGHT = 470;
  static PORTRAIT_HEIGHT = 640;
  static CONTINUOUS = false;
  static BEAT_STEP_MAP = MAP;
  static BEAT_MAPS = { 2: MAP };
  static CONTROLS = [];
  static ARIA_LABEL = 'Two lakes, this year and next year. If people catch a little this year, many fish are left to breed and next year the lake is full of fish. If they catch too much, few fish are left to breed and next year there are few fish. Fast fashion and pumping out groundwater work the same way. Then the market for fish: less supply next year moves the supply curve to the left, so it meets the demand curve at a higher price and a smaller quantity. Using resources so that they last is called sustainability.';

  async setup() {
    this.c = 1;
    this.anim = false;
    this.fresh = false;
    this.slide = false;
    await super.setup();
    this._onClick = (e) => {
      const b = e.target?.closest?.('[data-act]');
      if (!b) return;
      if (this.stepIndex === 0 && b.dataset.act === 'catch') this.pick(Number(b.dataset.val));
      else if (this.stepIndex === 1 && b.dataset.act === 'replay') this.move();
    };
    this.root.addEventListener('click', this._onClick);
  }

  destroy() {
    this.root?.removeEventListener('click', this._onClick);
    super.destroy();
  }

  css() { return BTN_CSS + CSS; }

  clear() { for (const t of (this._timers ?? []).splice(0)) clearTimeout(t); this.anim = false; this.fresh = false; this.slide = false; }

  enter(step) {
    this.clear();
    this.c = 1;
    if (step === 0) this.pick(1);
    else this.move();
  }

  pick(i) {
    this.clear();
    this.c = i;
    this.anim = true;
    this.fresh = true;
    this.repaint();
    this.fresh = false;
    this.after(2.0, () => { this.anim = false; this.repaint(); });
  }

  move() {
    this.clear();
    this.anim = true;
    this.slide = true;
    this.repaint();
    this.slide = false;
    this.after(DUR + 0.7, () => { this.anim = false; this.fresh = true; this.repaint(); this.fresh = false; });
  }

  skip() {
    if (!this.anim) return false;
    this.clear();
    this.repaint();
    return true;
  }

  busy() { return this.anim; }

  stageHeight(st) { return Math.round((st.portrait ? 640 : 470) * st.W / (st.portrait ? 390 : 560)); }

  paint(st) {
    const P = st.portrait, DW = P ? 390 : 560, DH = P ? 640 : 470, k = (st.W / DW).toFixed(4);
    const out = this.stepIndex === 0 ? this.paintLakes(P) : this.paintMarket(P);
    return { svg: `<g transform="scale(${k})">${out.svg}</g>`, over: `<div style="position:absolute;left:0;top:0;width:${DW}px;height:${DH}px;transform:scale(${k});transform-origin:0 0">${out.over}</div>` };
  }

  // b0: this year, next year
  paintLakes(P) {
    const c = CASES[this.c], fresh = this.fresh;
    const A = P ? [16, 70, 152, 140] : [22, 64, 236, 160], B = P ? [222, 70, 152, 140] : [302, 64, 236, 160];
    const fw = P ? 34 : 42;
    let svg = '', over = '';
    svg += txt(A[0] + A[2] / 2, A[1] - 22, 'this year', P ? 21 : 24, 'var(--sim-label)');
    svg += txt(B[0] + B[2] / 2, B[1] - 22, 'next year', P ? 21 : 24, 'var(--sim-label)');
    svg += lake(...A) + lake(...B);
    // the crate of caught fish under this year's lake
    const cx = A[0] + A[2] / 2, cy = P ? 330 : 346, cw = P ? 150 : 160;
    svg += crate(cx, cy, 0, { w: cw });
    svg += txt(cx, cy + 24, 'caught', P ? 19 : 20, 'var(--sim-label-muted)');
    const left = c.now - c.caught;
    for (let i = 0; i < c.now; i++) {
      const [fx, fy] = SPOTS[i], lx = A[0] + A[2] * fx, ly = A[1] + A[3] * fy, dir = i % 2 ? -1 : 1;
      if (i < left) { svg += fish(lx, ly, fw, dir); continue; }
      const j = i - left, n = c.caught, per = Math.min(5, n), row = Math.floor(j / per), col = j % per;
      const tx = cx - cw * 0.36 + (per > 1 ? col * (cw * 0.72) / (per - 1) : cw * 0.36), ty = cy - cw * 0.36 - row * 14;
      const fly = fresh ? `--dx:${f1(lx - tx)}px;--dy:${f1(ly - ty)}px;--dur:0.6s;--d:${(0.2 + j * 0.08).toFixed(2)}s` : '';
      svg += fish(tx, ty, fw * 0.8, dir, { cls: fresh ? 'mq-fly' : '', style: fly });
    }
    // the fish left breed: next year
    const late = fresh ? ` class="mq-fade" style="--d:1.3s"` : '';
    let nx = '';
    for (let i = 0; i < c.next; i++) { const [fx, fy] = SPOTS[i]; nx += fish(B[0] + B[2] * fx, B[1] + B[3] * fy, fw, i % 2 ? -1 : 1); }
    svg += `<g${late}>${nx}</g>`;
    const ay = A[1] + A[3] / 2, ax0 = A[0] + A[2] + 2, ax1 = B[0] - 2;
    svg += `<path d="M${f1(ax0)} ${f1(ay)}H${f1(ax1 - 10)}" ${stroke(ACC, 5)}/><path d="M${f1(ax1)} ${f1(ay)}l-14 -10v20z" ${fill(ACC)}/>`;
    const noteY = B[1] + B[3] + (P ? 30 : 34), few = this.c === 1;
    svg += `<g${late}>${pill(B[0] + B[2] / 2, noteY, c.note, { size: P ? 19 : 22, bg: few ? 'var(--sim-bad)' : 'var(--sim-good)', ink: 'var(--sim-bg-deep)', edge: few ? 'var(--sim-bad)' : 'var(--sim-good)' })}</g>`;
    if (!P) svg += txt(B[0] + B[2] / 2, noteY + 40, few ? 'few were left to breed' : 'many were left to breed', 18, 'var(--sim-label-muted)');
    let two = '';
    CASES.forEach((cs, i) => {
      const [x, y] = P ? [195, 394 + i * 56] : [445, 372 + i * 54];
      two += btn('catch', cs.lab, x, y, { val: i, on: i === this.c, size: 19 });
    });
    over += `<div class="fs-two" style="--bw:${P ? 280 : 190}px">${two}</div>`;
    // the same with: fast fashion, groundwater
    const ry = P ? 552 : 410, fs = 17;
    if (P) {
      svg += txt(195, ry - 34, 'the same with:', fs, 'var(--sim-label-muted)');
      svg += civicSvg('uniform', 110, ry + 22, { w: 44 }) + txt(110, ry + 46, 'fast fashion', fs, 'var(--sim-label)');
      svg += icon('well', 'var(--sim-water)', 280, ry + 2, 44) + txt(280, ry + 46, 'groundwater', fs, 'var(--sim-label)');
    } else {
      svg += txt(22, ry - 6, 'the same with:', fs, 'var(--sim-label-muted)', 'start');
      svg += civicSvg('uniform', 40, ry + 46, { w: 36 }) + txt(62, ry + 38, 'fast fashion', fs, 'var(--sim-label)', 'start');
      svg += icon('well', 'var(--sim-water)', 196, ry + 30, 36) + txt(218, ry + 38, 'groundwater', fs, 'var(--sim-label)', 'start');
    }
    return { svg, over };
  }

  // b1: the market for fish next year
  paintMarket(P) {
    const g = P ? gFrame(52, 370, 78, 344, 8) : gFrame(50, 318, 70, 360, 8);
    const end = !this.anim || false;
    let svg = gAxes(g, { yTitle: 'price of fish', xTitle: 'quantity of fish', yTitleX: g.L - 20, xTitleY: g.B + 30, title: P ? 19 : 21 });
    svg += shiftGraph(g, { d: 0, s: SHIFT_S, gs: 0, fromS: this.slide ? 0 : null, eFrom: this.slide ? { d: 0, s: 0 } : null, ghostE: { d: 0, s: 0 }, pArrow: end, qArrow: end, guides: false, lab: P ? 19 : 20, clip: 'fsclip' });
    const pop = (d) => (this.fresh ? ` class="mq-pop" style="--d:${d}s"` : '');
    svg += pill(P ? 195 : 280, 26, 'sustainability: resources that last', { size: P ? 17 : 20, bg: ACC, ink: ACC_INK, edge: ACC });
    let over = '';
    const R = P ? null : 446;
    if (!this.anim) {
      const [x1, y1, x2, y2] = P ? [110, 424, 280, 424] : [R, 262, R, 314];
      svg += `<g${pop(0)}>${pill(x1, y1, `higher price ${UP}`, { size: P ? 17 : 20 })}</g>`;
      svg += `<g${pop(0.2)}>${pill(x2, y2, `${LEFT} smaller quantity`, { size: P ? 17 : 20 })}</g>`;
      over += btn('replay', 'replay', P ? 195 : R, P ? 606 : 400, { size: 18 });
    }
    // next year's lake: few fish, the reason the curve moved
    const L = P ? [120, 456, 150, 78] : [R - 85, 80, 170, 100];
    svg += lake(...L);
    for (let i = 0; i < 3; i++) { const [fx, fy] = SPOTS[i]; svg += fish(L[0] + L[2] * fx, L[1] + L[3] * fy, P ? 28 : 32, i % 2 ? -1 : 1); }
    svg += txt(L[0] + L[2] / 2, L[1] + L[3] + (P ? 28 : 34), 'supply next year', P ? 17 : 19, 'var(--sim-series-7-ink, var(--sim-series-7))');
    return { svg, over };
  }

  testState() { return { step: this.stepIndex, catch: this.stepIndex === 0 ? CASES[this.c].lab : null, supplyShift: this.stepIndex === 1 ? SHIFT_S : null, anim: this.anim }; }
}
