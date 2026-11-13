/**
 * PlanSheetScene - L07 s03 "Planned Economy" (2 beats). SvgScene; portrait has its own layout.
 *   b0 plan:   the planning office (SimCivic planOffice, top left) sends ONE plan sheet (the hero, big) down to a
 *              factory and a shop; a bracket under both says "government-owned". The sheet's four lines light
 *              one by one (0.5 s): "umbrellas: 10,000", "price: Rs 120", "who gets them", "permit needed".
 *              Replay button. Rest: all four lines lit.
 *   b1 demand: a buyers meter: two bars on one scale, "on the shelf" 10,000 and "buyers want" (10,000 -> 20,000
 *              when the rainy season comes). Beside it the shop shelf: 10 umbrellas (each stands for 1,000).
 *              "rainy season" runs it: the buyers bar doubles and the queue grows; the shelf empties two
 *              umbrellas every 0.5 s; "sold out" is stamped and the queue stays. Under it the plan card is locked:
 *              calendar, "next plan: next year". One muted line: "few rivals, little push to improve".
 *              It runs once on entry; the button replays it. Rest: shelf empty, sold out, queue waiting.
 * No country names, no flags. Numbers as the question q-l07-s06 (10,000 at Rs 120; buyers want twice as many).
 * Colours are tokens only; the rupee sign is built from its char code. ASCII only.
 */
import { SvgScene, fill, stroke, shade } from 'simulations/base/kit/SimSvg.js';
import { iconSvg } from 'simulations/base/kit/SimIcons.js';
import { civicSvg } from 'simulations/base/kit/SimCivic.js';

const RS = String.fromCharCode(0x20B9);
const f1 = (v) => (+v).toFixed(1);
const UT = 1;      // umbrella tone
const BT = 6;      // buyers tone
const LINES = [
  { id: 'qty', text: 'umbrellas: 10,000', icon: 'umbrella' },
  { id: 'price', text: `price: ${RS}120`, icon: 'tag' },
  { id: 'whom', text: 'who gets them', icon: 'crowd' },
  { id: 'permit', text: 'permit needed', icon: 'scroll' },
];

const CSS = `
.ps-row { position: absolute; left: 0; right: 0; transform: translateY(-50%); display: flex; justify-content: center; gap: 10px; }
.ps-btn { min-height: 46px; padding: 5px 16px; cursor: pointer; white-space: nowrap; display: inline-flex; align-items: center; gap: 8px;
  border-radius: calc(12px * var(--look-radius, 1)); font: 800 20px/1.1 var(--sim-font); background: var(--sim-bg-surface); color: var(--sim-label);
  border: 2.5px solid var(--sim-stroke); box-shadow: 0 calc(3px * var(--look-lip, 1)) 0 var(--sim-stroke); }
.ps-btn:active { transform: translateY(3px); box-shadow: none; }
.ps-btn:focus-visible { outline: 3px solid var(--sim-accent); outline-offset: 3px; }
.ps-btn svg { width: 30px; height: 30px; }
.ps-ab { position: absolute; transform: translate(-50%, -50%); }
svg .ps-pop { transform-box: fill-box; transform-origin: center; animation: ps-pop 0.5s cubic-bezier(.3,1.5,.5,1) both; animation-delay: var(--d, 0s); }
@keyframes ps-pop { 0% { transform: scale(0.3); opacity: 0; } 100% { transform: none; opacity: 1; } }
svg .ps-lite { animation: ps-lite 0.45s ease both; animation-delay: var(--d, 0s); }
@keyframes ps-lite { 0% { opacity: 0.18; } 100% { opacity: 1; } }
svg .ps-hl { animation: ps-hl 0.5s ease both; animation-delay: var(--d, 0s); }
@keyframes ps-hl { 0% { opacity: 0; } 40% { opacity: 1; } 100% { opacity: 0; } }
svg .ps-grow { transform-box: fill-box; transform-origin: bottom; animation: ps-grow 0.6s cubic-bezier(.3,1.2,.5,1) both; animation-delay: var(--d, 0s); }
@keyframes ps-grow { 0% { transform: scaleY(0.5); } 100% { transform: none; } }
svg .ps-out { animation: ps-out 0.45s ease-in both; }
@keyframes ps-out { 0% { transform: none; opacity: 1; } 100% { transform: translate(60px, 70px); opacity: 0; } }
svg .ps-in { animation: ps-in 0.5s ease-out both; animation-delay: var(--d, 0s); }
@keyframes ps-in { 0% { transform: translateX(60px); opacity: 0; } 100% { transform: none; opacity: 1; } }
svg .ps-draw { stroke-dasharray: 400; stroke-dashoffset: 400; animation: ps-draw 0.5s ease forwards; animation-delay: var(--d, 0s); }
@keyframes ps-draw { to { stroke-dashoffset: 0; } }
`;

const text = (x, y, t, size, col = 'var(--sim-label)', extra = '') =>
  `<text x="${f1(x)}" y="${f1(y)}"${/text-anchor/.test(extra) ? '' : ' text-anchor="middle"'}${extra} style="fill:${col};font:800 ${size}px var(--sim-font)">${t}</text>`;

function icon(name, cx, cy, size, tn) {
  const inner = (iconSvg(name, tn).match(/<svg[^>]*>([\s\S]*)<\/svg>/) || [])[1] || '';
  return `<g transform="translate(${f1(cx - size / 2)} ${f1(cy - size / 2)}) scale(${(size / 48).toFixed(3)})" style="--i:var(--sim-series-${tn})">${inner}</g>`;
}

/** An open umbrella, dome on (x, y), radius r (handle below). */
function umbrella(x, y, r, tn = UT) {
  const col = `var(--sim-series-${tn})`, n = 4, dx = (2 * r) / n;
  let edge = '';
  for (let i = n - 1; i >= 0; i--) edge += `Q${f1(x - r + (i + 0.5) * dx)} ${f1(y - r * 0.18)} ${f1(x - r + i * dx)} ${f1(y)}`;
  let ribs = '';
  for (let i = 1; i < n; i++) { const px = x - r + i * dx; ribs += `M${f1(x)} ${f1(y - r)}Q${f1(px + (px - x) * 0.1)} ${f1(y - r * 0.5)} ${f1(px)} ${f1(y)}`; }
  return `<path d="M${f1(x)} ${f1(y)}V${f1(y + r * 0.8)}a${f1(r * 0.14)} ${f1(r * 0.14)} 0 0 1 ${f1(-r * 0.28)} 0" ${stroke('var(--sim-label)', Math.max(2, r * 0.09))}/>`
    + `<path d="M${f1(x - r)} ${f1(y)}A${f1(r)} ${f1(r)} 0 0 1 ${f1(x + r)} ${f1(y)}${edge}Z" ${fill(col, `stroke:${shade(col, 70)};stroke-width:${f1(Math.max(1.5, r * 0.07))};stroke-linejoin:round`)}/>`
    + `<path d="${ribs}" ${stroke(shade(col, 65), Math.max(1.2, r * 0.05))}/>`;
}

function tagIcon(x, y, s) {
  return `<g transform="translate(${f1(x)} ${f1(y)}) scale(${f1(s / 40)})"><path d="M-18 -10H8L20 0L8 10H-18Z" ${fill('var(--sim-gold)', `stroke:${shade('var(--sim-gold)', 60)};stroke-width:2.5;stroke-linejoin:round`)}/><circle cx="8" cy="0" r="3" ${fill('var(--sim-bg-surface)')}/>`
    + `<text x="-6" y="5.5" text-anchor="middle" style="fill:${shade('var(--sim-gold)', 40)};font:800 14px var(--sim-font)">${RS}</text></g>`;
}

const arrow = (x1, y1, x2, y2, d, cls = 'ps-draw') => {
  const a = Math.atan2(y2 - y1, x2 - x1), h = 11;
  const p1 = [x2 - h * Math.cos(a - 0.5), y2 - h * Math.sin(a - 0.5)], p2 = [x2 - h * Math.cos(a + 0.5), y2 - h * Math.sin(a + 0.5)];
  return `<g${cls ? ` class="${cls}" style="--d:${f1(d)}s"` : ''}><path d="M${f1(x1)} ${f1(y1)}L${f1(x2)} ${f1(y2)}M${f1(p1[0])} ${f1(p1[1])}L${f1(x2)} ${f1(y2)}L${f1(p2[0])} ${f1(p2[1])}" ${stroke('var(--sim-stroke)', 3.5)}/></g>`;
};

export class PlanSheetScene extends SvgScene {
  static WIDTH = 560;
  static PORTRAIT_WIDTH = 390;
  static HEIGHT = 504;
  static PORTRAIT_HEIGHT = 624;
  static CONTINUOUS = false;
  static BEAT_STEP_MAP = [[{ idx: 0, dwellMs: null }], [{ idx: 1, dwellMs: null }]];
  static BEAT_MAPS = { 2: [[{ idx: 0, dwellMs: null }], [{ idx: 1, dwellMs: null }]] };
  static CONTROLS = [];
  static ARIA_LABEL = 'A made-up example. The planning office sends one plan sheet to a government-owned factory and shop. The plan says: umbrellas 10,000; price 120 rupees; who gets them; permit needed. Then the rainy season comes: buyers want 20,000 umbrellas, twice the plan, but the shelf holds only 10,000. The shelf empties, sold out, and a queue stays. The plan is locked until the next plan, next year. Few rivals means little push to improve.';

  async setup() {
    await super.setup();
    this._onClick = (e) => {
      const b = e.target?.closest?.('[data-act]');
      if (!b) return;
      if (b.dataset.act === 'replay') this.startPlan();
      if (b.dataset.act === 'rain') this.startRun(0.1);
    };
    this.root.addEventListener('click', this._onClick);
  }

  destroy() {
    this.root?.removeEventListener('click', this._onClick);
    super.destroy();
  }

  css() { return CSS; }

  enter(step) {
    if (step === 0) this.startPlan(true);
    else this.startRun(0.3, true);
  }

  startPlan(quiet) {
    this.fresh = true;
    if (!quiet) { this.repaint(); }
    this.after(3.6, () => { this.fresh = false; });
  }

  /** b1 run: phase 0 before, 1 rain (bar doubles, queue grows), 2..6 shelf loses 2 each, 7 sold out. */
  startRun(lead, quiet) {
    for (const t of (this._timers ?? []).splice(0)) clearTimeout(t);
    this.phase = 0;
    this.prevShelf = 10;
    if (!quiet) this.repaint();
    this.after(lead, () => this.setPhase(1));
    for (let i = 0; i < 5; i++) this.after(lead + 0.8 + i * 0.5, () => this.setPhase(2 + i));
    this.after(lead + 3.2, () => this.setPhase(7));
  }

  setPhase(p) {
    this.prevShelf = this.shelf();
    this.phase = p;
    this.repaint();
  }

  shelf() { return this.phase <= 1 ? 10 : Math.max(0, 10 - 2 * (this.phase - 1)); }

  skip() {
    if (this.stepIndex !== 1 || this.phase >= 7) return false;
    for (const t of (this._timers ?? []).splice(0)) clearTimeout(t);
    this.prevShelf = 0;
    this.phase = 7;
    this.repaint();
    return true;
  }

  busy() { return this.stepIndex === 1 ? this.phase < 7 : !!this.fresh; }

  stageHeight(st) { return Math.round((st.portrait ? 600 : 480) * st.W / (st.portrait ? 390 : 560)); }

  /** The plan sheet: box (x, y, w, h); lines light one by one when fresh; locked: a small plan card instead. */
  sheet(x, y, w, h, P) {
    const fr = this.fresh, fs = P ? 23 : 24, top = y + 62, rowH = (h - 78) / 4;
    let s = `<g class="${fr ? 'ps-pop' : ''}" style="--d:0.35s">`
      + `<rect x="${f1(x)}" y="${f1(y + 6)}" width="${f1(w)}" height="${f1(h)}" rx="10" ${fill(shade('var(--sim-bg-surface)', 82))}/>`
      + `<path d="M${f1(x + 10)} ${f1(y)}H${f1(x + w - 30)}L${f1(x + w)} ${f1(y + 30)}V${f1(y + h - 10)}Q${f1(x + w)} ${f1(y + h)} ${f1(x + w - 10)} ${f1(y + h)}H${f1(x + 10)}Q${f1(x)} ${f1(y + h)} ${f1(x)} ${f1(y + h - 10)}V${f1(y + 10)}Q${f1(x)} ${f1(y)} ${f1(x + 10)} ${f1(y)}Z" ${fill('color-mix(in srgb, var(--sim-gold) 8%, var(--sim-bg-surface))', 'stroke:var(--sim-stroke);stroke-width:3;stroke-linejoin:round')}/>`
      + `<path d="M${f1(x + w - 30)} ${f1(y)}V${f1(y + 30)}H${f1(x + w)}" ${fill('color-mix(in srgb, var(--sim-stroke) 30%, var(--sim-bg-surface))', 'stroke:var(--sim-stroke);stroke-width:3;stroke-linejoin:round')}/>`
      + text(x + 22, y + 40, 'the plan', P ? 26 : 28, 'var(--sim-label)', ' text-anchor="start"')
      + `<path d="M${f1(x + 20)} ${f1(y + 54)}H${f1(x + w - 40)}" ${stroke('var(--sim-stroke)', 2.5)}/></g>`;
    LINES.forEach((L, i) => {
      const cy = top + rowH * (i + 0.5), d = 0.9 + i * 0.5, ix = x + 40;
      let ic = '';
      if (L.icon === 'umbrella') ic = umbrella(ix, cy + 4, 18);
      else if (L.icon === 'tag') ic = tagIcon(ix, cy, 40);
      else ic = icon(L.icon, ix, cy, 40, L.icon === 'crowd' ? BT : 4);
      s += `<g class="${fr ? 'ps-lite' : ''}" style="--d:${f1(d)}s">`
        + (fr ? `<rect class="ps-hl" style="--d:${f1(d)}s;fill:color-mix(in srgb, var(--sim-accent) 22%, transparent)" x="${f1(x + 10)}" y="${f1(cy - rowH / 2 + 3)}" width="${f1(w - 20)}" height="${f1(rowH - 6)}" rx="10"/>` : '')
        + ic + text(x + 72, cy + fs * 0.36, L.text, fs, 'var(--sim-label)', ' text-anchor="start"') + '</g>';
    });
    return s;
  }

  paintPlan(st) {
    const P = st.portrait, W = st.W, fr = this.fresh;
    let svg = '', over = '';
    const pop = (d) => (fr ? ` class="ps-pop" style="--d:${f1(d)}s"` : '');
    if (!P) {
      svg += `<g${pop(0)}>${civicSvg('planOffice', 104, 150, { w: 180 })}</g>`;
      svg += text(104, 182, 'planning office', 20);
      svg += text(12, 466, 'a made-up example', 17, 'var(--sim-label-muted)', ' text-anchor="start"');
      svg += this.sheet(232, 14, 314, 286, false);
      svg += arrow(196, 100, 224, 100, 0.2);
      svg += `<g${pop(2.9)}>${civicSvg('factory', 300, 424, { w: 150 })}</g><g${pop(3.0)}>${civicSvg('shop', 470, 424, { w: 130 })}</g>`;
      svg += arrow(340, 304, 306, 322, 2.7) + arrow(440, 304, 466, 312, 2.7);
      svg += `<g${pop(3.2)}><path d="M222 436V446H548V436" ${stroke('var(--sim-label-muted)', 3)}/>${text(385, 470, 'government-owned', 20, 'var(--sim-label-muted)')}</g>`;
      over += `<div class="ps-ab" style="left:104px;top:236px"><button type="button" class="sv-hit ps-btn" data-act="replay">replay</button></div>`;
      return { svg, over };
    }
    svg += `<g${pop(0)}>${civicSvg('planOffice', 100, 118, { w: 160 })}</g>`;
    svg += text(286, 84, 'planning', 20) + text(286, 108, 'office', 20);
    svg += arrow(100, 124, 100, 142, 0.2);
    svg += this.sheet(16, 146, W - 32, 270, true);
    svg += arrow(110, 420, 110, 440, 2.7) + arrow(280, 420, 280, 440, 2.7);
    svg += `<g${pop(2.9)}>${civicSvg('factory', 110, 534, { w: 140 })}</g><g${pop(3.0)}>${civicSvg('shop', 280, 534, { w: 124 })}</g>`;
    svg += `<g${pop(3.2)}><path d="M28 546V556H362V546" ${stroke('var(--sim-label-muted)', 3)}/>${text(195, 582, 'government-owned', 19, 'var(--sim-label-muted)')}</g>`;
    svg += text(W - 12, 136, 'a made-up example', 15, 'var(--sim-label-muted)', ' text-anchor="end"');
    over += `<div class="ps-ab" style="left:${W - 70}px;top:28px"><button type="button" class="sv-hit ps-btn" data-act="replay" style="min-width:0;padding:5px 12px">replay</button></div>`;
    return { svg, over };
  }

  paintDemand(st) {
    const P = st.portrait, W = st.W, ph = this.phase ?? 7;
    let svg = '', over = '';
    // geometry
    const g = P
      ? { bx: [44, 120], bw: 58, base: 326, k: 0.0105, shelf: { x: 182, y: 86, w: 196, h: 152 }, qy: 324, qx: 196, qgap: 34, card: { x: 16, y: 372, w: W - 32, h: 58 }, riv: 474, btn: [W / 2, 34], ex: [W / 2, 504], names: 350 }
      : { bx: [46, 128], bw: 62, base: 336, k: 0.012, shelf: { x: 246, y: 86, w: 296, h: 160 }, qy: 334, qx: 268, qgap: 40, card: { x: 100, y: 376, w: 360, h: 56 }, riv: 462, btn: [394, 38], ex: [12, 30], names: 360 };
    const want = ph >= 1 ? 20000 : 10000, sh = this.shelf();
    // meter: two bars, one scale
    const bars = [{ v: 10000, name: 'on the shelf', tn: UT }, { v: want, name: 'buyers want', tn: BT }];
    bars.forEach((b, i) => {
      const h = b.v * g.k, x = g.bx[i] - g.bw / 2, y = g.base - h, grow = i === 1 && ph === 1;
      svg += `<g${grow ? ' class="ps-grow"' : ''}><rect x="${f1(x)}" y="${f1(y + 4)}" width="${g.bw}" height="${f1(h)}" rx="8" ${fill(shade(`var(--sim-series-${b.tn})`, 70))}/>`
        + `<rect x="${f1(x)}" y="${f1(y)}" width="${g.bw}" height="${f1(h)}" rx="8" ${fill(`var(--sim-series-${b.tn})`)}/></g>`;
      svg += text(g.bx[i], y - 12, b.v === 20000 ? '20,000' : '10,000', P ? 21 : 23);
    });
    svg += `<path d="M${g.bx[0] - g.bw / 2 - 10} ${g.base}H${g.bx[1] + g.bw / 2 + 10}" ${stroke('var(--sim-stroke)', 3)}/>`;
    svg += text(g.bx[0], g.names, 'shelf', P ? 18 : 19) + text(g.bx[1], g.names, 'buyers', P ? 18 : 19);
    if (ph >= 1) svg += `<g class="${ph === 1 ? 'ps-pop' : ''}" style="--d:0.3s">${text(g.bx[1] + g.bw / 2 + 4, g.base - 10000 * g.k * 2 + 30, 'x2', P ? 18 : 20, 'var(--sim-accent)', ' text-anchor="start"')}</g>`;
    // shelf: awning + two rows of five umbrellas
    const s = g.shelf, aw = 28, n = 8;
    svg += `<rect x="${s.x}" y="${s.y + aw + 4}" width="${s.w}" height="${s.h - aw}" rx="10" ${fill(shade('var(--sim-bg-surface)', 82))}/>`;
    svg += `<rect x="${s.x}" y="${s.y + aw}" width="${s.w}" height="${s.h - aw}" rx="10" ${fill('color-mix(in srgb, var(--sim-series-8) 18%, var(--sim-bg-surface))', 'stroke:var(--sim-stroke);stroke-width:3')}/>`;
    for (let i = 0; i < n; i++) {
      const sw = (s.w + 12) / n;
      svg += `<rect x="${f1(s.x - 6 + i * sw)}" y="${s.y}" width="${f1(sw + 0.5)}" height="${aw}" ${fill(i % 2 ? 'var(--sim-bg-surface)' : 'var(--sim-series-5)')}/>`;
    }
    svg += `<rect x="${s.x - 6}" y="${s.y}" width="${s.w + 12}" height="${aw}" rx="6" ${fill('none', 'stroke:var(--sim-stroke);stroke-width:2.5')}/>`;
    const rows = [s.y + aw + (s.h - aw) * 0.36, s.y + aw + (s.h - aw) * 0.82];
    svg += rows.map((ry) => `<path d="M${s.x + 8} ${f1(ry + 8)}H${s.x + s.w - 8}" ${stroke('color-mix(in srgb, var(--sim-series-8) 55%, var(--sim-label))', 4)}/>`).join('');
    const ur = P ? 17 : 22, ux = (i) => s.x + s.w * (0.12 + 0.19 * (i % 5)), uy = (i) => rows[i < 5 ? 0 : 1] - ur * 0.6;
    for (let i = sh; i < Math.min(10, this.prevShelf ?? 0); i++) svg += `<g class="ps-out">${umbrella(ux(i), uy(i), ur)}</g>`;
    for (let i = 0; i < sh; i++) svg += umbrella(ux(i), uy(i), ur);
    svg += text(s.x + s.w / 2, s.y + s.h + 26, 'each = 1,000', P ? 16 : 17, 'var(--sim-label-muted)');
    if (ph >= 7) {
      svg += `<g class="ps-pop"><g transform="rotate(-10 ${f1(s.x + s.w / 2)} ${f1(s.y + s.h / 2 + 14)})"><rect x="${f1(s.x + s.w / 2 - 92)}" y="${f1(s.y + s.h / 2 - 12)}" width="184" height="52" rx="10" ${fill('var(--sim-bg-surface)', 'stroke:var(--sim-bad);stroke-width:4.5')}/>`
        + text(s.x + s.w / 2, s.y + s.h / 2 + 24, 'sold out', 30, 'var(--sim-bad)') + '</g></g>';
    }
    // queue of buyers in front of the shelf
    const nq = ph >= 1 ? 6 : 3;
    for (let i = 0; i < nq; i++) {
      const fresh = ph === 1 && i >= 3;
      svg += `<g${fresh ? ` class="ps-in" style="--d:${f1(0.15 + (i - 3) * 0.15)}s"` : ''}>${icon('person', g.qx + i * g.qgap, g.qy - 22, P ? 42 : 48, BT)}</g>`;
    }
    // locked plan card
    const c = g.card;
    svg += `<rect x="${c.x}" y="${c.y + 4}" width="${c.w}" height="${c.h}" rx="12" ${fill(shade('var(--sim-bg-surface)', 82))}/>`;
    svg += `<rect x="${c.x}" y="${c.y}" width="${c.w}" height="${c.h}" rx="12" ${fill('color-mix(in srgb, var(--sim-gold) 8%, var(--sim-bg-surface))', 'stroke:var(--sim-stroke);stroke-width:3')}/>`;
    svg += icon('calendar', c.x + 32, c.y + c.h / 2, 38, 4);
    svg += text(c.x + 60, c.y + c.h / 2 + 8, 'next plan: next year', P ? 21 : 22, 'var(--sim-label)', ' text-anchor="start"');
    const lx = c.x + c.w - 30, ly = c.y + c.h / 2;
    svg += `<g class="${ph === 7 ? 'ps-pop' : ''}" style="--d:0.25s"><path d="M${lx - 8} ${ly - 4}V${ly - 10}a8 8 0 0 1 16 0V${ly - 4}" ${stroke('var(--sim-label)', 3.5)}/><rect x="${lx - 13}" y="${ly - 5}" width="26" height="20" rx="4" ${fill('var(--sim-label)')}/></g>`;
    svg += text(P ? W / 2 : W / 2, g.riv, 'few rivals, little push to improve', P ? 18 : 20, 'var(--sim-label-muted)');
    svg += P ? text(g.ex[0], g.ex[1], 'a made-up example', 15, 'var(--sim-label-muted)') : text(g.ex[0], g.ex[1], 'a made-up example', 16, 'var(--sim-label-muted)', ' text-anchor="start"');
    const rain = `<svg viewBox="0 0 48 48" aria-hidden="true" style="--i:var(--sim-series-1)">${(iconSvg('rain', 1).match(/<svg[^>]*>([\s\S]*)<\/svg>/) || [])[1] || ''}</svg>`;
    over += `<div class="ps-ab" style="left:${g.btn[0]}px;top:${g.btn[1]}px"><button type="button" class="sv-hit ps-btn" data-act="rain">${rain}rainy season</button></div>`;
    return { svg, over };
  }

  /** Drawn in design units (560 x 480 landscape, 390 x 600 portrait), scaled to the measured stage width. */
  paint(st) {
    const P = st.portrait, DW = P ? 390 : 560, DH = P ? 600 : 480, k = (st.W / DW).toFixed(4);
    const out = this.paintD({ portrait: P, W: DW, H: DH });
    return { svg: `<g transform="scale(${k})">${out.svg}</g>`, over: `<div style="position:absolute;left:0;top:0;width:${DW}px;height:${DH}px;transform:scale(${k});transform-origin:0 0">${out.over}</div>` };
  }

  paintD(st) {
    const out = this.stepIndex === 0 ? this.paintPlan(st) : this.paintDemand(st);
    return { svg: out.svg, over: `<div class="${st.portrait ? 'ps-p' : 'ps-l'}">${out.over}</div>` };
  }

  testState() { return { step: this.stepIndex, phase: this.phase ?? null, shelf: this.stepIndex === 1 ? this.shelf() : null, want: this.stepIndex === 1 ? (this.phase >= 1 ? 20000 : 10000) : null, plan: { umbrellas: 10000, price: 120 } }; }
}
