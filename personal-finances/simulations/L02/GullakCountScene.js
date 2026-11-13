/**
 * GullakCountScene - L02 s01 "The Family Gullak" (2 beats). SvgScene, design 560 x 480 landscape, 390 x 600 portrait.
 * Cast: shared/MoneyKit.js (gullak, coin piles, tags, jars), shared/FinPeople.js (meera, mother, brother).
 *   b0 A year of coins: the family gullak, big, on the kitchen shelf; Meera, her mother and her brother each with a
 *      tag (Rs 1,200 - Rs 100 a month -, Rs 2,000, Rs 400). Rest / cold start: the pot broken in two halves, a coin
 *      heap (one coin per Rs 100) under each tag, total "Rs 3,600". "replay" puts the pot back whole with a coin
 *      stream from each tag; "break the gullak" cracks it (0.5 s) and the coins land in the three heaps (0.5 s).
 *   b1 Saving: the Rs 3,600 heap ("kept aside for later") and three small jars for why people save: emergencies,
 *      comfortable living, invest later. No amounts in the jars.
 * Controls are inside the figure. Colours are tokens only. ASCII only.
 */
import { SvgScene, stroke, fill, shade } from 'simulations/base/kit/SimSvg.js';
import { iconSvg } from 'simulations/base/kit/SimIcons.js';
import { MONEY_CSS, coinPile, coin, tag, jar, gullak, rs } from '../shared/MoneyKit.js';
import { PEOPLE_CSS, personSlot, paintPeople } from '../shared/FinPeople.js';

const f1 = (v) => (+v).toFixed(1);
const MAIN = [[{ idx: 0, dwellMs: null }], [{ idx: 1, dwellMs: null }]];
const WHO = [
  { key: 'meera', name: 'Meera', amt: 1200, h: 150, s: 1 },
  { key: 'mother', name: 'Mother', amt: 2000, h: 168, s: 6 },
  { key: 'brother', name: 'Brother', amt: 400, h: 120, s: 2 },
];
const TOTAL = 3600;

const CSS = `
.gc-ab { position: absolute; transform: translate(-50%, -50%); }
.gc-btn { min-height: 46px; padding: 5px 18px; cursor: pointer; white-space: nowrap;
  border-radius: calc(12px * var(--look-radius, 1)); font: 800 20px/1.1 var(--sim-font); background: var(--sim-accent); color: var(--sim-bg-deep);
  border: 2.5px solid color-mix(in oklab, var(--sim-accent) 70%, black); box-shadow: 0 calc(3px * var(--look-lip, 1)) 0 color-mix(in oklab, var(--sim-accent) 60%, black); }
.gc-btn--quiet { background: var(--sim-bg-surface); color: var(--sim-label); border-color: var(--sim-stroke); box-shadow: 0 calc(3px * var(--look-lip, 1)) 0 var(--sim-stroke); }
.gc-btn:active { transform: translateY(3px); box-shadow: none; }
.gc-btn:focus-visible { outline: 3px solid var(--sim-accent); outline-offset: 3px; }
svg .gc-split { transform-box: fill-box; transform-origin: 50% 100%; animation: gc-split 0.5s cubic-bezier(.3,1.3,.5,1) both; }
@keyframes gc-split { from { transform: none; } }
svg .gc-flow { animation: gc-flow 1.1s linear 3; }
@keyframes gc-flow { from { stroke-dashoffset: 34; } to { stroke-dashoffset: 0; } }
@media (prefers-reduced-motion: reduce) { svg .gc-split, svg .gc-flow { animation: none; } }
`;

const text = (x, y, t, size, col = 'var(--sim-label)', anchor = 'middle', w = 800) =>
  `<text x="${f1(x)}" y="${f1(y)}" text-anchor="${anchor}" style="fill:${col};font:${w} ${size}px var(--sim-font)">${t}</text>`;

/** An icon from SimIcons placed at centre (x, y), s across. */
const icon = (name, x, y, s, tone) => iconSvg(name, tone).replace('<svg ', `<svg x="${f1(x - s / 2)}" y="${f1(y - s / 2)}" width="${s}" height="${s}" `).replace(' width="48" height="48"', '');

export class GullakCountScene extends SvgScene {
  static WIDTH = 560;
  static PORTRAIT_WIDTH = 390;
  static HEIGHT = 480;
  static PORTRAIT_HEIGHT = 600;
  static CONTINUOUS = false;
  static BEAT_STEP_MAP = MAIN;
  static BEAT_MAPS = { 2: MAIN };
  static CONTROLS = [];
  static ARIA_LABEL = 'The family gullak on the kitchen shelf. In a year Meera puts in 1,200 rupees (100 a month), her mother 2,000 and her brother 400. Broken open, the coins make three heaps that add up to 3,600 rupees. Saving is keeping part of your income aside for later: for emergencies, to live more comfortably, and to invest later.';

  async setup() {
    this.broken = true;
    this.anim = false;
    this.fresh = false;
    await super.setup();
    this._onClick = (e) => {
      const b = e.target?.closest?.('[data-act]');
      if (!b) return;
      if (b.dataset.act === 'replay') this.reset();
      else if (b.dataset.act === 'break') this.smash();
    };
    this.root.addEventListener('click', this._onClick);
  }

  destroy() {
    this.root?.removeEventListener('click', this._onClick);
    super.destroy();
  }

  css() { return MONEY_CSS + PEOPLE_CSS + CSS; }

  repaint() { super.repaint(); paintPeople(this); }

  clear() { for (const t of (this._timers ?? []).splice(0)) clearTimeout(t); this.anim = false; this.fresh = false; }

  enter() { this.clear(); this.broken = true; }

  /** The pot whole again, with the three coin streams. */
  reset() {
    if (this.stepIndex !== 0) return;
    this.clear();
    this.broken = false;
    this.repaint();
  }

  /** Crack the pot; the coins land in three heaps; the total pops. */
  smash() {
    if (this.stepIndex !== 0 || this.broken) return;
    this.clear();
    this.broken = true;
    this.anim = true;
    this.fresh = true;
    this.repaint();
    this.after(1.5, () => { this.anim = false; this.fresh = false; this.repaint(); });
  }

  skip() {
    if (!this.anim) return false;
    this.clear();
    this.broken = true;
    this.repaint();
    return true;
  }

  busy() { return this.anim; }

  stageHeight(st) { return Math.round((st.portrait ? 600 : 480) * st.W / (st.portrait ? 390 : 560)); }

  paint(st) {
    const P = st.portrait, DW = P ? 390 : 560, DH = P ? 600 : 480, k = (st.W / DW).toFixed(4);
    const out = this.stepIndex === 1 ? this.paintSaving(P) : this.paintCount(P);
    return { svg: `<g transform="scale(${k})">${out.svg}</g>`, over: `<div style="position:absolute;left:0;top:0;width:${DW}px;height:${DH}px;transform:scale(${k});transform-origin:0 0">${out.over ?? ''}</div>` };
  }

  // b0: the shelf, the pot, three people with their tags (and heaps once it is broken).
  paintCount(P) {
    let svg = '', over = '';
    const G = P
      ? { shelf: [24, 244, 226], pot: [128, 150], tot: [318, 96, 148, 36], btn: [318, 196],
        cols: [65, 195, 325].map((x) => ({ px: x, tx: x, ty: 292, hx: x, hb: 408 })), feet: 586, tw: 118, note: [12, 24, 'start'] }
      : { shelf: [146, 414, 214], pot: [280, 172], tot: [468, 92, 140, 40], btn: [468, 196],
        cols: [86, 272, 458].map((x) => ({ px: x - 50, tx: x + 46, ty: 352, hx: x + 46, hb: 462 })), feet: 462, tw: 106, note: [12, 26, 'start'] };
    const [sx0, sx1, sy] = G.shelf, [gx, gw] = G.pot, slit = { x: gx, y: sy - gw * 0.78 };
    // the wall shelf: a plank on two brackets
    const wood = 'color-mix(in oklab, var(--sim-series-8) 45%, var(--sim-stroke))';
    svg += `<path d="M${sx0 + 26} ${sy + 12}l18 34M${sx1 - 26} ${sy + 12}l-18 34" ${stroke(shade(wood, 70), 7)}/>`;
    // coin streams (whole pot only), behind the shelf and the pot
    if (!this.broken) {
      G.cols.forEach((c, i) => {
        const a = { x: c.tx, y: c.ty - 34 }, cx = (a.x + slit.x) / 2 + (a.x < slit.x ? -30 : a.x > slit.x ? 30 : 0), cy = Math.min(a.y, slit.y) - 70;
        const col = `var(--sim-series-${WHO[i].s})`;
        svg += `<path class="gc-flow" d="M${f1(a.x)} ${f1(a.y)}Q${f1(cx)} ${f1(cy)} ${f1(slit.x)} ${f1(slit.y - 6)}" ${stroke(col, 5, 'stroke-dasharray:4 13;opacity:0.9')}/>`;
        for (const u of [0.35, 0.68]) {
          const bx = (1 - u) * (1 - u) * a.x + 2 * u * (1 - u) * cx + u * u * slit.x, by = (1 - u) * (1 - u) * a.y + 2 * u * (1 - u) * cy + u * u * (slit.y - 6);
          svg += coin(bx, by, 9);
        }
      });
    }
    svg += `<rect x="${sx0}" y="${sy + 3}" width="${sx1 - sx0}" height="13" rx="4" ${fill(shade(wood, 70))}/>`
      + `<rect x="${sx0}" y="${sy}" width="${sx1 - sx0}" height="13" rx="4" ${fill(wood, `stroke:${shade(wood, 64)};stroke-width:2`)}/>`;
    // the pot: whole, or two halves split along a zigzag crack
    if (!this.broken) {
      svg += gullak(gx, sy, { w: gw });
    } else {
      const top = sy - gw * 1.02, half = (side) => {
        const zig = [0, 0.18, 0.36, 0.54, 0.72, 0.9, 1].map((u, i) => `L${f1(gx + (i % 2 ? 9 : -7))} ${f1(top + u * (sy - top + 4))}`).join('');
        const edge = side < 0 ? gx - gw : gx + gw;
        return `M${f1(edge)} ${f1(top - 4)}L${f1(gx - 7)} ${f1(top - 4)}${zig}L${f1(edge)} ${f1(sy + 4)}Z`;
      };
      svg += `<defs><clipPath id="gc-hl"><path d="${half(-1)}"/></clipPath><clipPath id="gc-hr"><path d="${half(1)}"/></clipPath></defs>`;
      const anim = this.fresh ? ' class="gc-split"' : '';
      svg += `<g${anim} style="transform:translate(-${f1(gw * 0.14)}px, 0px) rotate(-10deg);transform-box:fill-box;transform-origin:30% 100%"><g clip-path="url(#gc-hl)">${gullak(gx, sy, { w: gw })}</g></g>`;
      svg += `<g${anim} style="transform:translate(${f1(gw * 0.14)}px, 0px) rotate(10deg);transform-box:fill-box;transform-origin:70% 100%"><g clip-path="url(#gc-hr)">${gullak(gx, sy, { w: gw })}</g></g>`;
    }
    // people, tags, heaps
    WHO.forEach((w, i) => {
      const c = G.cols[i];
      over += personSlot(w.key, { x: c.px, y: G.feet, h: w.h, facing: 0, mood: 'happy' });
      const pop = this.fresh ? ` class="mk-pop" style="--d:${(0.9 + i * 0.1).toFixed(2)}s"` : '';
      svg += `<g${pop}>${tag(c.tx, c.ty, w.name, w.amt, { w: G.tw, labelSize: 19, valueSize: 26 })}</g>`;
      if (w.key === 'meera') svg += text(P ? c.tx + 4 : c.tx - 12, P ? c.ty + 50 : c.ty - 40, `${rs(100)} a month`, 18, 'var(--sim-label-muted)', 'middle', 700);
      if (this.broken) {
        const fly = this.fresh ? ` class="mk-fly" style="transform-box:fill-box;transform-origin:50% 100%;--d:${(0.45 + i * 0.12).toFixed(2)}s;--dx:${f1(gx - c.hx)}px;--dy:${f1(sy - gw * 0.35 - c.hb)}px"` : '';
        svg += `<g${fly}>${coinPile(c.hx, c.hb, w.amt, { r: 8 })}</g>`;
      }
    });
    // the total (or the button that breaks the pot)
    const [tx, ty, , ts] = G.tot;
    if (this.broken) {
      const pop = this.fresh ? ' class="mk-pop" style="--d:1.15s"' : '';
      svg += `<g${pop}>${text(tx, ty, 'together', 21, 'var(--sim-label-muted)', 'middle', 700)}${text(tx, ty + ts + 6, rs(TOTAL), ts, 'var(--sim-label)')}</g>`;
      if (!this.anim) over += `<div class="gc-ab" style="left:${G.btn[0]}px;top:${G.btn[1]}px"><button type="button" class="sv-hit gc-btn gc-btn--quiet" data-act="replay">replay</button></div>`;
    } else {
      svg += text(tx, ty, 'a year of coins', 21, 'var(--sim-label-muted)', 'middle', 700);
      over += `<div class="gc-ab" style="left:${G.tot[0]}px;top:${G.tot[1] + 46}px"><button type="button" class="sv-hit gc-btn" data-act="break">break the gullak</button></div>`;
    }
    svg += text(G.note[0], G.note[1], 'made-up numbers', 17, 'var(--sim-label-muted)', G.note[2], 700);
    return { svg, over };
  }

  // b1: the Rs 3,600 heap, and three jars for why people save.
  paintSaving(P) {
    let svg = '';
    const WHY = [
      { lab: ['emergencies'], icon: 'hospital', s: 5 },
      { lab: ['comfortable', 'living'], icon: 'house', s: 4 },
      { lab: ['invest later'], icon: 'seed', s: 3 },
    ];
    if (P) {
      svg += text(24, 44, 'saving', 32, 'var(--sim-label)', 'start');
      svg += text(24, 76, 'kept aside for later', 20, 'var(--sim-label-muted)', 'start', 700);
      svg += coinPile(112, 300, TOTAL, { r: 10.5 });
      svg += tag(290, 214, 'saved', TOTAL, { w: 170, labelSize: 21, valueSize: 34, tone: 'save' });
      svg += text(195, 356, 'why people save', 24, 'var(--sim-label)');
      const xs = [65, 195, 325];
      svg += `<path d="M195 366V384M${xs[0]} 384H${xs[2]}M${xs[0]} 384v12M${xs[1]} 384v12M${xs[2]} 384v12" ${stroke('var(--sim-accent)', 4)}/>`;
      WHY.forEach((w, i) => {
        const x = xs[i];
        svg += `<g class="mk-pop" style="--d:${(0.2 + i * 0.25).toFixed(2)}s">${jar(x, 488, 0, null, { w: 76, h: 80 })}${icon(w.icon, x, 448, 44, w.s)}`
          + w.lab.map((l, j) => text(x, 518 + j * 26, l, 19)).join('') + '</g>';
      });
    } else {
      svg += text(24, 48, 'saving', 34, 'var(--sim-label)', 'start');
      svg += text(24, 80, 'kept aside for later', 21, 'var(--sim-label-muted)', 'start', 700);
      svg += tag(124, 188, 'saved', TOTAL, { w: 180, labelSize: 22, valueSize: 36, tone: 'save' });
      svg += coinPile(124, 420, TOTAL, { r: 11 });
      svg += text(392, 48, 'why people save', 24, 'var(--sim-label)');
      const ys = [170, 290, 410];
      svg += `<path d="M236 290H262M262 ${ys[0] - 40}V${ys[2] - 40}M262 ${ys[0] - 40}h14M262 ${ys[1] - 40}h14M262 ${ys[2] - 40}h14" ${stroke('var(--sim-accent)', 4)}/>`;
      WHY.forEach((w, i) => {
        const y = ys[i], x = 318;
        svg += `<g class="mk-pop" style="--d:${(0.2 + i * 0.25).toFixed(2)}s">${jar(x, y, 0, null, { w: 72, h: 78 })}${icon(w.icon, x, y - 38, 42, w.s)}`
          + (w.lab.length === 1 ? text(366, y - 30, w.lab[0], 23, 'var(--sim-label)', 'start') : w.lab.map((l, j) => text(366, y - 46 + j * 31, l, 23, 'var(--sim-label)', 'start')).join('')) + '</g>';
      });
    }
    return { svg };
  }

  testState() {
    return { view: this.stepIndex, broken: this.broken, total: WHO.reduce((s, w) => s + w.amt, 0), anim: this.anim };
  }
}
