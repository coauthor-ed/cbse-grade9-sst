/**
 * SelfRelianceGoalsScene - L06 s06c "Startup India and Atmanirbhar Bharat", "Viksit Bharat 2047" (2 beats).
 * SvgScene, design 560 x 480 landscape, 390 x 620 portrait. Cast: you, classmate1, classmate2 (StallKit).
 *   b0 The hero card 'Atmanirbhar Bharat' ('self-reliant India', 'from 2020', the year the slide gives); under
 *      it a card 'Startup India' (a bulb: new ideas; NO date) with an arrow 'supports' up to the hero. Two
 *      meters show the two aims: 'made in India' (a factory; its bar rises from a dashed 'before' outline) and
 *      'imports' (a ship; its bar falls below its dashed outline).
 *   b1 A timeline 1947 -> 2047 (a cut in the line between 1947 and today), bracket '100 years of independence';
 *      the stretch from 'today' to 2047 is lit (an arrow grows along it) with three chips on the way: jobs,
 *      innovation, communities; at 2047 a plain goal pennant (not a national flag) under the title card
 *      'Viksit Bharat 2047: a fully developed nation'; at 'today' three classmates stand on the line.
 * No logo, no emblem, no national flag, no map. Meter heights are a picture (no numbers). Animation is CSS only;
 * Skip / Replay. No host controls. Colours are tokens only. ASCII only.
 */
import { SvgScene, stroke, fill, shade } from 'simulations/base/kit/SimSvg.js';
import { iconSvg } from 'simulations/base/kit/SimIcons.js';
import { PEOPLE_CSS, personSlot, paintPeople } from '../shared/FinPeople.js';
import { STALL_CAST } from '../shared/StallKit.js';

const f1 = (v) => (+v).toFixed(1);
const MAIN = [[{ idx: 0, dwellMs: null }], [{ idx: 1, dwellMs: null }]];
const DUR = [2.7, 2.3];
const KIDS = STALL_CAST.slice(0, 3);

const CSS = `
.sr-btn { position: absolute; cursor: pointer; padding: 6px 14px; border-radius: calc(12px * var(--look-radius, 1));
  font: 800 18px/1.1 var(--sim-font); color: var(--sim-label); background: var(--sim-bg-surface);
  border: 2.5px solid var(--sim-stroke); box-shadow: 0 calc(3px * var(--look-lip, 1)) 0 var(--sim-stroke); }
.sr-btn:active { transform: translateY(3px); box-shadow: none; }
.sr-btn:focus-visible { outline: 3px solid var(--sim-accent); outline-offset: 3px; }
svg .sr-pop { transform-box: fill-box; transform-origin: 50% 100%; animation: sr-pop 0.5s cubic-bezier(.3,1.4,.5,1) both; animation-delay: var(--d, 0s); }
@keyframes sr-pop { 0% { opacity: 0; transform: scale(0.4); } 100% { opacity: 1; transform: none; } }
svg .sr-fade { animation: sr-fade 0.45s ease both; animation-delay: var(--d, 0s); }
@keyframes sr-fade { 0% { opacity: 0; } 100% { opacity: 1; } }
svg .sr-bar { transform-box: fill-box; transform-origin: 50% 100%; animation: sr-bar 0.8s cubic-bezier(.4,0,.3,1) both; animation-delay: var(--d, 0s); }
@keyframes sr-bar { 0% { transform: scaleY(var(--s0, 0)); } 100% { transform: none; } }
svg .sr-grow { transform-box: fill-box; transform-origin: var(--o, left center); animation: sr-grow 0.9s ease-out both; animation-delay: var(--d, 0s); }
@keyframes sr-grow { 0% { transform: scale(var(--gx, 0), var(--gy, 1)); } 100% { transform: none; } }
.sr-still, .sr-still * { animation: none !important; }
@media (prefers-reduced-motion: reduce) { svg .sr-pop, svg .sr-fade, svg .sr-bar, svg .sr-grow { animation: none; } }
`;

const txt = (x, y, t, size, col = 'var(--sim-label)', anchor = 'middle', w = 800) =>
  `<text x="${f1(x)}" y="${f1(y)}" text-anchor="${anchor}" style="fill:${col};font:${w} ${f1(size)}px var(--sim-font)">${t}</text>`;
const icon = (name, x, y, s, tone) => `<g transform="translate(${f1(x - s / 2)} ${f1(y - s / 2)}) scale(${f1(s / 48)})">${iconSvg(name, tone)}</g>`;
const RIM = 'var(--sim-stroke)';
const ACC = 'var(--sim-accent)';
const MUTED = 'var(--sim-label-muted)';
const WOOD = 'color-mix(in oklab, var(--sim-series-8) 55%, var(--sim-label) 30%)';

function card(r, col = RIM, tint = 'var(--sim-bg-surface)') {
  const [x, y, w, h] = r;
  return `<rect x="${f1(x)}" y="${f1(y + 4)}" width="${f1(w)}" height="${f1(h)}" rx="14" ${fill(shade(col, 70))}/>`
    + `<rect x="${f1(x)}" y="${f1(y)}" width="${f1(w)}" height="${f1(h)}" rx="14" ${fill(tint, `stroke:${col};stroke-width:3`)}/>`;
}
const tint = (n, k = 12) => `color-mix(in oklab, var(--sim-series-${n}) ${k}%, var(--sim-bg-surface))`;

function chip(x, y, t, size = 22, o = {}) {
  const w = t.length * size * 0.56 + 28, h = size * 1.6, col = o.col ?? RIM;
  return `<g${o.cls ? ` class="${o.cls}"` : ''}${o.style ? ` style="${o.style}"` : ''}>`
    + `<rect x="${f1(x - w / 2)}" y="${f1(y - h / 2)}" width="${f1(w)}" height="${f1(h)}" rx="${f1(h / 2)}" ${fill(o.tint ?? 'var(--sim-bg-surface)', `stroke:${col};stroke-width:2.5`)}/>`
    + txt(x, y + size * 0.36, t, size) + '</g>';
}

function arrow(x0, y0, x1, y1, col = ACC, w = 6) {
  const a = Math.atan2(y1 - y0, x1 - x0), L = 16;
  const p1 = [x1 - L * Math.cos(a - 0.5), y1 - L * Math.sin(a - 0.5)], p2 = [x1 - L * Math.cos(a + 0.5), y1 - L * Math.sin(a + 0.5)];
  return `<path d="M${f1(x0)} ${f1(y0)}L${f1(x1)} ${f1(y1)}" ${stroke(col, w)}/><path d="M${f1(p1[0])} ${f1(p1[1])}L${f1(x1)} ${f1(y1)}L${f1(p2[0])} ${f1(p2[1])}" ${stroke(col, w)}/>`;
}

/** A meter: icon left of a bar; the bar's dashed 'before' outline h0, the solid bar h1. (x, y) = bar foot left. */
function meter(x, y, h0, h1, n, ic, label, d) {
  const col = `var(--sim-series-${n})`, bw = 64;
  let s = `<path d="M${f1(x - 24)} ${f1(y)}H${f1(x + bw + 52)}" ${stroke(RIM, 3)}/>`;
  s += icon(ic, x + bw / 2, y - Math.max(h0, h1) - 46, 76, n);
  s += `<rect x="${f1(x)}" y="${f1(y - h1)}" width="${bw}" height="${f1(h1)}" rx="6" class="sr-bar" ${fill(col, `stroke:${shade(col, 62)};stroke-width:2.5;--s0:${f1(h0 / h1)};--d:${d}s`)}/>`;
  s += `<rect x="${f1(x - 4)}" y="${f1(y - h0)}" width="${bw + 8}" height="${f1(h0)}" rx="8" ${fill('none', `stroke:${MUTED};stroke-width:3;stroke-dasharray:8 6`)}/>`;
  const up = h1 > h0, ax = x + bw + 30;
  s += `<g class="sr-fade" style="--d:${d + 0.7}s">${up ? arrow(ax, y - h0 + 10, ax, y - h1 - 4, col, 7) : arrow(ax, y - h0 - 4, ax, y - h1 + 10, col, 7)}</g>`;
  s += txt(x + bw / 2 + 12, y + 30, label, 22);
  return s;
}

/** A plain goal pennant (one colour, no emblem); (x, y) = foot of the pole. */
function goalFlag(x, y, h) {
  return `<path d="M${f1(x)} ${f1(y)}V${f1(y - h)}" ${stroke(WOOD, 5)}/>`
    + `<path d="M${f1(x + 2)} ${f1(y - h)}L${f1(x + h * 0.62)} ${f1(y - h * 0.82)}L${f1(x + 2)} ${f1(y - h * 0.62)}Z" ${fill(ACC, `stroke:${shade(ACC, 62)};stroke-width:2.5;stroke-linejoin:round`)}/>`
    + `<circle cx="${f1(x)}" cy="${f1(y - h - 4)}" r="5" ${fill(WOOD)}/>`;
}

export class SelfRelianceGoalsScene extends SvgScene {
  static WIDTH = 560;
  static PORTRAIT_WIDTH = 390;
  static HEIGHT = 480;
  static PORTRAIT_HEIGHT = 620;
  static CONTINUOUS = false;
  static BEAT_STEP_MAP = MAIN;
  static BEAT_MAPS = { 2: MAIN };
  static CONTROLS = [];
  static ARIA_LABEL = 'Startup India supports Atmanirbhar Bharat, self-reliant India, from 2020. Two bars show its aims: things made in India go up (a factory), imports go down (a ship). Then a timeline from 1947 to 2047, 100 years of independence: from today to 2047 the way is lit, with jobs, innovation and communities on it, and a goal flag at 2047 for Viksit Bharat 2047, a fully developed nation. Three classmates stand on the line at today.';

  async setup() {
    this.still = false;
    this.run = 0;
    await super.setup();
    this._onClick = (e) => {
      const b = e.target?.closest?.('[data-act]');
      if (!b) return;
      if (b.dataset.act === 'skip') this.finish();
      else this.restart();
    };
    this.root.addEventListener('click', this._onClick);
  }

  destroy() {
    this.root?.removeEventListener('click', this._onClick);
    super.destroy();
  }

  css() { return PEOPLE_CSS + CSS; }

  enter() { this.restart(true); }

  restart(quiet) {
    this.still = false;
    const run = ++this.run;
    if (this._timers) this.after(DUR[this.stepIndex] ?? 2, () => { if (run === this.run) this.finish(); });
    if (!quiet) this.repaint();
  }

  finish() { this.run++; this.still = true; this.repaint(); }

  repaint() { super.repaint(); paintPeople(this); }

  stageHeight(st) { return Math.round((st.portrait ? 620 : 480) * st.W / (st.portrait ? 390 : 560)); }

  paint(st) {
    const P = st.portrait, DW = P ? 390 : 560, DH = P ? 620 : 480, k = (st.W / DW).toFixed(4), v = this.stepIndex;
    const out = v === 1 ? this.paintRoad(P) : this.paintAims(P);
    const still = this.still ? ' sr-still' : '';
    const pos = v === 1 ? 'right:10px;bottom:10px' : P ? 'right:8px;top:268px' : 'left:10px;bottom:10px';
    const btn = `<button type="button" class="sv-hit tap btn sr-btn" data-act="${this.still ? 'replay' : 'skip'}" style="${pos}">${this.still ? 'Replay' : 'Skip'}</button>`;
    return {
      svg: `<g class="${still}" transform="scale(${k})">${out.svg}</g>`,
      over: `<div class="${still}" style="position:absolute;left:0;top:0;width:${DW}px;height:${DH}px;overflow:hidden;transform:scale(${k});transform-origin:0 0">${out.over ?? ''}${btn}</div>`,
    };
  }

  // b0: Startup India supports Atmanirbhar Bharat; its two aims as bars.
  paintAims(P) {
    const G = P
      ? { hero: [14, 14, 362, 128], si: [40, 232, 198, 100], arr: [139, 230, 139, 150], sup: [151, 196], m1: [60, 556], m2: [250, 556] }
      : { hero: [16, 16, 528, 120], si: [16, 236, 210, 104], arr: [121, 234, 121, 146], sup: [133, 196], m1: [270, 420], m2: [430, 420] };
    const [hx, hy, hw, hh] = G.hero;
    let svg = `<g class="sr-pop">${card(G.hero, 'var(--sim-series-3)', tint(3, 12))}`
      + txt(hx + hw / 2, hy + 46, 'Atmanirbhar Bharat', 30)
      + txt(hx + hw / 2, hy + 84, 'self-reliant India', 24)
      + txt(hx + hw / 2, hy + 112, 'from 2020', 20, MUTED, 'middle', 700) + '</g>';
    const [sx, sy, sw, sh] = G.si;
    svg += `<g class="sr-pop" style="--d:0.4s">${card(G.si, 'var(--sim-series-2)', tint(2, 12))}`
      + `<circle cx="${f1(sx + 44)}" cy="${f1(sy + sh / 2)}" r="30" ${fill('color-mix(in oklab, var(--sim-series-2) 24%, transparent)')}/>` + icon('bulb', sx + 44, sy + sh / 2, 56, 2)
      + txt(sx + 44 + (sw - 44) / 2 + 14, sy + 46, 'Startup', 26) + txt(sx + 44 + (sw - 44) / 2 + 14, sy + 78, 'India', 26) + '</g>';
    const [ax0, ay0, ax1, ay1] = G.arr;
    svg += `<g class="sr-fade" style="--d:0.8s">${arrow(ax0, ay0, ax1, ay1)}${txt(G.sup[0], G.sup[1], 'supports', 22, 'var(--sim-label)', 'start')}</g>`;
    const hi = P ? 140 : 170, lo = P ? 64 : 70;
    svg += meter(G.m1[0], G.m1[1], lo, hi, 3, 'factory', 'made in India', 1.2) + meter(G.m2[0], G.m2[1], hi - 10, lo, 6, 'boat', 'imports', 1.5);
    return { svg, over: '' };
  }

  // b1: 1947 -> today -> 2047.
  paintRoad(P) {
    let svg = '', over = '';
    const line = 'color-mix(in oklab, var(--sim-label) 45%, var(--sim-bg-surface))';
    if (!P) {
      const y = 330, x47 = 50, xcut = 112, xt = 176, x47b = 486;
      svg += `<g class="sr-pop">${card([16, 14, 528, 84], 'var(--sim-series-5)', tint(5, 12))}${txt(280, 50, 'Viksit Bharat 2047', 30)}${txt(280, 84, 'a fully developed nation', 22, 'var(--sim-label)', 'middle', 700)}</g>`;
      svg += `<path d="M${x47} ${y}H${xcut - 8}M${xcut + 8} ${y}H${x47b}" ${stroke(line, 8)}/>`;
      svg += `<path d="M${xcut - 14} ${y + 14}L${xcut - 2} ${y - 14}M${xcut + 2} ${y + 14}L${xcut + 14} ${y - 14}" ${stroke(line, 4)}/>`;
      svg += `<g class="sr-grow" style="--d:0.4s">${arrow(xt, y, x47b - 4, y, ACC, 10)}</g>`;
      [[x47, '1947'], [x47b, '2047']].forEach(([x, t]) => { svg += `<circle cx="${x}" cy="${y}" r="9" ${fill('var(--sim-bg-surface)', `stroke:${line};stroke-width:4`)}/>` + txt(x, y + 40, t, 28); });
      svg += `<circle cx="${xt}" cy="${y}" r="9" ${fill(ACC)}/>` + txt(xt, y + 40, 'today', 24);
      svg += `<g class="sr-pop" style="--d:1.6s">${goalFlag(x47b - 6, y - 10, 92)}</g>`;
      // the bracket under the line
      svg += `<path d="M${x47} ${y + 58}V${y + 70}H${x47b}V${y + 58}" ${stroke(MUTED, 3)}/>` + txt((x47 + x47b) / 2, y + 100, '100 years of independence', 22, 'var(--sim-label)', 'middle', 700);
      ['jobs', 'innovation', 'communities'].forEach((t, i) => { svg += chip(332, 152 + i * 50, t, 22, { col: ACC, tint: `color-mix(in oklab, ${ACC} 12%, var(--sim-bg-surface))`, cls: 'sr-pop', style: `--d:${0.9 + i * 0.3}s` }); });
      KIDS.forEach((who, i) => { over += personSlot(who, { x: xt - 52 + i * 52, y: y - 12, h: 118, facing: 0, mood: 'happy', cls: 'mpp-pop', style: `--d:${0.2 + i * 0.12}s;` }); });
    } else {
      const x = 70, y47 = 566, ycut = 530, yt = 488, y2047 = 182;
      svg += `<g class="sr-pop">${card([14, 14, 362, 84], 'var(--sim-series-5)', tint(5, 12))}${txt(195, 50, 'Viksit Bharat 2047', 28)}${txt(195, 84, 'a fully developed nation', 22, 'var(--sim-label)', 'middle', 700)}</g>`;
      svg += `<path d="M${x} ${y47}V${ycut + 8}M${x} ${ycut - 8}V${y2047}" ${stroke(line, 8)}/>`;
      svg += `<path d="M${x - 14} ${ycut + 14}L${x + 14} ${ycut + 2}M${x - 14} ${ycut - 2}L${x + 14} ${ycut - 14}" ${stroke(line, 4)}/>`;
      svg += `<g class="sr-grow" style="--d:0.4s;--o:center bottom;--gx:1;--gy:0">${arrow(x, yt, x, y2047 + 4, ACC, 10)}</g>`;
      [[y47, '1947'], [y2047, '2047']].forEach(([y, t]) => { svg += `<circle cx="${x}" cy="${y}" r="9" ${fill('var(--sim-bg-surface)', `stroke:${line};stroke-width:4`)}/>` + txt(x + 22, y + 10, t, 26, 'var(--sim-label)', 'start'); });
      svg += `<circle cx="${x}" cy="${yt}" r="9" ${fill(ACC)}/>` + txt(x + 22, yt + 30, 'today', 22, 'var(--sim-label)', 'start');
      svg += `<g class="sr-pop" style="--d:1.6s">${goalFlag(x + 96, y2047 + 26, 72)}</g>`;
      svg += `<path d="M${x - 30} ${y47}H${x - 42}V${y2047}H${x - 30}" ${stroke(MUTED, 3)}/>`;
      svg += `<g transform="translate(${x - 52} ${(y47 + y2047) / 2}) rotate(-90)">${txt(0, 0, '100 years of independence', 20, 'var(--sim-label)', 'middle', 700)}</g>`;
      ['jobs', 'innovation', 'communities'].forEach((t, i) => { svg += chip(250, 250 + i * 54, t, 22, { col: ACC, tint: `color-mix(in oklab, ${ACC} 12%, var(--sim-bg-surface))`, cls: 'sr-pop', style: `--d:${0.9 + i * 0.3}s` }); });
      KIDS.forEach((who, i) => { over += personSlot(who, { x: 168 + i * 62, y: yt + 10, h: 118, facing: 0, mood: 'happy', cls: 'mpp-pop', style: `--d:${0.2 + i * 0.12}s;` }); });
    }
    return { svg, over };
  }

  testState() { return { view: this.stepIndex, still: this.still }; }
}
