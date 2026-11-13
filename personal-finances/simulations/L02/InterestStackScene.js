/**
 * InterestStackScene - L02 s07 "Interest on Interest" (3 beats). SvgScene, design 560 x 480 landscape,
 * 390 x 620 portrait. Bars from zero, one scale per beat, so heights are honest.
 * Colours: the Rs 500 put in = series 1 (the same in every bar); interest = series 2 (coin colour).
 *   b0 The second year: two big bars. Year 1 = 500 + 40 = 540; year 2 = 540 + 43.20 = 583.20. The part 8% is
 *      worked out on has an accent outline (500 in year 1, the whole 540 in year 2); under each bar
 *      "8% of Rs 500 = Rs 40" / "8% of Rs 540 = Rs 43.20"; "+Rs 43.20" says "Rs 3.20 more". The interest
 *      layers rise in on entry; "replay" plays it again.
 *   b1 What each bar is made of: start 500, year 1 540, year 2 583.20. Each bar = "put in Rs 500" (same height,
 *      same colour) + interest layers (40, then 43.20). Three buttons in the figure (put in / year 1 / year 2),
 *      or a tap on a layer, light one part in every bar and dim the rest; the line at the top says what it is.
 *      Rest / cold start: nothing lit, "Rs 583.20 = Rs 500 + Rs 40 + Rs 43.20".
 *   b2 Compounding: 11 small bars, start and years 1-10 (500 x 1.08^n, last Rs 1,079.46), the put-in part flat,
 *      the interest part growing; "Rs 1,079 after 10 years", "made-up deposit, 8% every year". Bars rise in turn.
 * Controls are inside the figure. Colours are tokens only. ASCII only.
 */
import { SvgScene, stroke, fill, shade } from 'simulations/base/kit/SimSvg.js';
import { MONEY_CSS, RS, group, rs } from '../shared/MoneyKit.js';

const f1 = (v) => (+v).toFixed(1);
const MAIN = [[{ idx: 0, dwellMs: null }], [{ idx: 1, dwellMs: null }], [{ idx: 2, dwellMs: null }]];
const PUT = 500, RATE = 0.08;
// 500 x 1.08^n to the paisa: 500, 540, 583.20, 629.86, 680.24, 734.66, 793.44, 856.91, 925.47, 999.50, 1,079.46
const VALS = [];
for (let n = 0; n <= 10; n++) VALS.push(Math.round(PUT * (1 + RATE) ** n * 100) / 100);
const IN = 'var(--sim-series-1)', INT = 'var(--sim-series-2)';
const IN_INK = shade(IN, 60), INT_INK = shade(INT, 55);
const PARTS = ['put', 'y1', 'y2'];

/** Rupees with paise: 583.2 -> sign + 583.20; 1079.46 -> sign + 1,079.46. */
const rsp = (v) => { const r = Math.round(v * 100); if (r % 100 === 0) return rs(r / 100); return RS + group(Math.floor(r / 100)) + '.' + String(r % 100).padStart(2, '0'); };

const CSS = `
.is-ab { position: absolute; transform: translate(-50%, -50%); }
.is-row { position: absolute; display: flex; gap: 10px; transform: translate(-50%, -50%); }
.is-btn { min-height: 46px; padding: 5px 16px; cursor: pointer; white-space: nowrap;
  border-radius: calc(12px * var(--look-radius, 1)); font: 800 20px/1.1 var(--sim-font); background: var(--sim-bg-surface); color: var(--sim-label);
  border: 2.5px solid var(--sim-stroke); box-shadow: 0 calc(3px * var(--look-lip, 1)) 0 var(--sim-stroke); }
.is-part { display: flex; align-items: center; gap: 8px; padding: 4px 12px; }
.is-part i { width: 18px; height: 18px; border-radius: 5px; background: var(--c); border: 2px solid color-mix(in oklab, var(--c) 60%, black); flex: none; }
.is-btn[aria-pressed="true"] { background: var(--sim-accent); color: var(--sim-bg-deep);
  border-color: color-mix(in oklab, var(--sim-accent) 70%, black); box-shadow: 0 calc(3px * var(--look-lip, 1)) 0 color-mix(in oklab, var(--sim-accent) 60%, black); }
.is-btn:active { transform: translateY(3px); box-shadow: none; }
.is-btn:focus-visible { outline: 3px solid var(--sim-accent); outline-offset: 3px; }
.is-quiet { font-size: 19px; }
.is-hit { position: absolute; background: transparent; border: 0; padding: 0; cursor: pointer; border-radius: 6px; }
.is-hit:focus-visible { outline: 3px solid var(--sim-accent); }
`;

const text = (x, y, t, size, col = 'var(--sim-label)', anchor = 'middle', w = 800) =>
  `<text x="${f1(x)}" y="${f1(y)}" text-anchor="${anchor}" style="fill:${col};font:${w} ${size}px var(--sim-font)">${t}</text>`;
const soft = (col, p) => `color-mix(in oklab, ${col} ${p}%, var(--sim-bg-surface))`;

/** One block of a bar: x, top y, w, h; col; o.op dims it; o.cls animates it. */
function block(x, y, w, h, col, o = {}) {
  const st = o.op != null ? ` style="opacity:${o.op}${o.d != null ? `;--d:${o.d}s` : ''}"` : (o.d != null ? ` style="--d:${o.d}s"` : '');
  return `<g${o.cls ? ` class="${o.cls}"` : ''}${st}><rect x="${f1(x)}" y="${f1(y)}" width="${f1(w)}" height="${f1(Math.max(1, h))}" ${fill(soft(col, o.p ?? 70), `stroke:${shade(col, 60)};stroke-width:${o.sw ?? 2.5}`)}/></g>`;
}

export class InterestStackScene extends SvgScene {
  static WIDTH = 560;
  static PORTRAIT_WIDTH = 390;
  static HEIGHT = 480;
  static PORTRAIT_HEIGHT = 620;
  static CONTINUOUS = false;
  static BEAT_STEP_MAP = MAIN;
  static BEAT_MAPS = { 3: MAIN };
  static CONTROLS = [];
  static ARIA_LABEL = 'Sameer keeps 500 rupees in a bank deposit at 8% a year. Year 1: 8% of 500 is 40, so 540. Year 2: 8% of 540 is 43.20, so 583.20, which is 3.20 more interest than in year 1. Each bar splits into the 500 rupees put in, the same every year, and interest layers of 40 and 43.20. Over 10 years (made-up deposit, 8% every year) the put-in part stays flat and the interest part grows: 1,079.46 rupees after 10 years.';

  async setup() {
    this.lit = null;
    this.fresh = true;
    await super.setup();
    this._onClick = (e) => {
      const b = e.target?.closest?.('[data-act]');
      if (!b) return;
      if (b.dataset.act === 'part') this.light(b.dataset.val);
      else if (b.dataset.act === 'replay') this.replay();
    };
    this.root.addEventListener('click', this._onClick);
  }

  destroy() {
    this.root?.removeEventListener('click', this._onClick);
    super.destroy();
  }

  css() { return MONEY_CSS + CSS; }

  clear() { for (const t of (this._timers ?? []).splice(0)) clearTimeout(t); }

  /** Entry: the rise animations play once (fresh), then later repaints draw the rest state without them. */
  enter() {
    this.clear();
    this.lit = null;
    this.fresh = true;
    this.after(this.stepIndex === 2 ? 2.2 : 1.4, () => { this.fresh = false; });
  }

  replay() {
    this.clear();
    this.fresh = true;
    this.repaint();
    this.after(this.stepIndex === 2 ? 2.2 : 1.4, () => { this.fresh = false; });
  }

  light(v) {
    if (this.stepIndex !== 1 || !PARTS.includes(v)) return;
    this.clear();
    this.fresh = false;
    this.lit = this.lit === v ? null : v;
    this.repaint();
  }

  stageHeight(st) { return Math.round((st.portrait ? 620 : 480) * st.W / (st.portrait ? 390 : 560)); }

  paint(st) {
    const P = st.portrait, DW = P ? 390 : 560, DH = P ? 620 : 480, k = (st.W / DW).toFixed(4), v = this.stepIndex;
    const out = v === 1 ? this.paintParts(P) : v === 2 ? this.paintTen(P) : this.paintTwo(P);
    return { svg: `<g transform="scale(${k})">${out.svg}</g>`, over: `<div style="position:absolute;left:0;top:0;width:${DW}px;height:${DH}px;transform:scale(${k});transform-origin:0 0">${out.over ?? ''}</div>` };
  }

  // b0: two big bars; what 8% is worked out on.
  paintTwo(P) {
    let svg = '', over = '';
    const G = P
      ? { hd: [24, 40], base: 430, top: 150, w: 88, xs: [20, 182], yl: 462, eq: [[24, 520], [24, 556]], replay: [318, 598] }
      : { hd: [24, 40], base: 372, top: 112, w: 120, xs: [92, 330], yl: 404, eq: [[152, 440], [390, 440]], replay: [494, 40] };
    const k = (G.base - G.top) / VALS[2], B = G.base, an = this.fresh;
    svg += text(G.hd[0], G.hd[1], 'Sameer\'s deposit, 8% a year', 22, 'var(--sim-label-muted)', 'start', 700);
    svg += `<rect x="${G.hd[0] + 2}" y="${G.hd[1] + 18}" width="30" height="22" rx="4" ${fill(soft(IN, 70), 'stroke:var(--sim-accent);stroke-width:3.5;stroke-dasharray:7 4')}/>`
      + text(G.hd[0] + 42, G.hd[1] + 37, '8% is worked out on this', 21, 'var(--sim-label)', 'start', 700);
    const bars = [
      { x: G.xs[0], parts: [[PUT, IN], [VALS[1] - PUT, INT]], on: PUT, tot: VALS[1], gain: VALS[1] - PUT, name: 'year 1', of: PUT },
      { x: G.xs[1], parts: [[PUT, IN], [VALS[1] - PUT, INT], [VALS[2] - VALS[1], INT]], on: VALS[1], tot: VALS[2], gain: VALS[2] - VALS[1], name: 'year 2', of: VALS[1] },
    ];
    bars.forEach((b, i) => {
      const x = b.x, w = G.w;
      svg += `<rect x="${x + 5}" y="${f1(B - b.tot * k + 5)}" width="${w}" height="${f1(b.tot * k)}" ${fill('var(--sim-stroke)')}/>`;
      let y = B;
      b.parts.forEach(([amt, col], j) => {
        const h = amt * k;
        y -= h;
        const last = j === b.parts.length - 1;
        svg += block(x, y, w, h, col, last && an ? { cls: 'mk-rise', d: 0.3 + i * 0.5 } : {});
      });
      // the amount 8% is worked out on: accent outline, its value inside
      const hOn = b.on * k;
      svg += `<rect x="${x - 4}" y="${f1(B - hOn - 4)}" width="${w + 8}" height="${f1(hOn + 8)}" rx="6" ${fill('none', 'stroke:var(--sim-accent);stroke-width:4;stroke-dasharray:10 6')}/>`;
      svg += text(x + w / 2, B - hOn / 2 + 4, i === 0 ? rs(PUT) : rsp(b.on), P ? 22 : 26, IN_INK);
      // the new interest, beside its layer
      const gy = B - b.tot * k + (b.gain * k) / 2;
      const gx = x + w + 10;
      svg += `<g${an ? ` class="mk-pop" style="--d:${0.8 + i * 0.5}s"` : ''}>${text(gx, gy + 8, '+' + rsp(b.gain).replace('.00', ''), P ? 22 : 26, INT_INK, 'start')}`
        + (i === 1 ? text(gx, gy + 36, `${RS}3.20 more`, 20, 'var(--sim-label-muted)', 'start', 700) : '') + '</g>';
      // the total on top, the year under
      svg += text(x + w / 2, B - b.tot * k - 14, i === 0 ? rs(b.tot) : rsp(b.tot), P ? 28 : 32, 'var(--sim-label)');
      svg += text(x + w / 2, G.yl, b.name, 22, 'var(--sim-label)', 'middle', 700);
      const eq = `8% of ${i === 0 ? rs(PUT) : rs(VALS[1])} = ${i === 0 ? rs(40) : rsp(b.gain)}`;
      svg += text(G.eq[i][0], G.eq[i][1], P ? `${b.name}: ${eq}` : eq, 22, 'var(--sim-label)', P ? 'start' : 'middle');
    });
    svg += `<path d="M${P ? 20 : 40} ${B}H${P ? 370 : 520}" ${stroke('var(--sim-label)', 3)}/>`;
    over += `<div class="is-ab" style="left:${G.replay[0]}px;top:${G.replay[1]}px"><button type="button" class="sv-hit is-btn is-quiet" data-act="replay">replay</button></div>`;
    return { svg, over };
  }

  // b1: start, year 1, year 2, each split into the Rs 500 put in and interest layers; tap to light a part.
  paintParts(P) {
    let svg = '', over = '';
    const G = P
      ? { base: 452, top: 176, w: 60, xs: [16, 120, 236], yl: 484, hd: [195, 44], row: [195, 545], gl: 20 }
      : { base: 384, top: 128, w: 96, xs: [36, 202, 368], yl: 414, hd: [280, 44], row: [280, 456], gl: 23 };
    const k = (G.base - G.top) / VALS[2], B = G.base, lit = this.lit;
    const op = (part) => (lit && lit !== part ? 0.25 : null);
    const say = lit === 'put' ? `${rs(PUT)} put in: the same in every bar`
      : lit === 'y1' ? `year 1: 8% of ${rs(PUT)} = ${rs(40)}`
        : lit === 'y2' ? `year 2: 8% of ${rs(VALS[1])} = ${rsp(43.2)}`
          : `${rsp(VALS[2])} = ${rs(PUT)} + ${rs(40)} + ${rsp(43.2)}`;
    svg += text(G.hd[0], G.hd[1], say, P ? 23 : 26, lit ? 'var(--sim-label)' : 'var(--sim-label)');
    if (!lit) svg += text(G.hd[0], G.hd[1] + 32, 'tap a part to light it', 20, 'var(--sim-label-muted)', 'middle', 700);
    const names = ['start', 'year 1', 'year 2'];
    [0, 1, 2].forEach((n) => {
      const x = G.xs[n], w = G.w, tot = VALS[n];
      if (!lit) svg += `<rect x="${x + 5}" y="${f1(B - tot * k + 5)}" width="${w}" height="${f1(tot * k)}" ${fill('var(--sim-stroke)')}/>`;
      const hp = PUT * k;
      svg += block(x, B - hp, w, hp, IN, { op: op('put'), sw: lit === 'put' ? 4 : 2.5 });
      svg += `<g style="${op('put') != null ? 'opacity:0.25' : ''}">${text(x + w / 2, B - hp / 2 + 9, rs(PUT), P ? 20 : 25, IN_INK)}</g>`;
      over += `<button type="button" class="is-hit" data-act="part" data-val="put" aria-label="the ${PUT} rupees put in" style="left:${x}px;top:${f1(B - hp + 12)}px;width:${w}px;height:${f1(hp - 12)}px"></button>`;
      const layers = [];
      if (n >= 1) layers.push({ part: 'y1', amt: 40, lab: '+' + rs(40) });
      if (n >= 2) layers.push({ part: 'y2', amt: 43.2, lab: '+' + rsp(43.2) });
      let y = B - hp;
      layers.forEach((L, j) => {
        const h = L.amt * k;
        y -= h;
        svg += block(x, y, w, h, INT, { op: op(L.part), sw: lit === L.part ? 4 : 2.5, p: L.part === 'y2' ? 85 : 62 });
        const ly = layers.length === 2 ? (j === 0 ? y + h / 2 + 18 : y + h / 2 - 4) : y + h / 2 + 8;
        svg += `<g style="${op(L.part) != null ? 'opacity:0.25' : ''}">${text(x + w + 8, ly, L.lab, G.gl, INT_INK, 'start')}</g>`;
        over += `<button type="button" class="is-hit" data-act="part" data-val="${L.part}" aria-label="year ${j + 1} interest" style="left:${x}px;top:${f1(y - (j === layers.length - 1 ? 10 : 0))}px;width:${w + 60}px;height:${f1(h + (j === layers.length - 1 ? 10 : 0))}px"></button>`;
      });
      svg += text(x + w / 2, B - tot * k - 12, n === 0 ? rs(tot) : n === 1 ? rs(tot) : rsp(tot), P ? 22 : 27, 'var(--sim-label)');
      svg += text(x + w / 2, G.yl, names[n], 21, 'var(--sim-label)', 'middle', 700);
    });
    svg += `<path d="M${P ? 12 : 24} ${B}H${P ? 378 : 536}" ${stroke('var(--sim-label)', 3)}/>`;
    const btn = (part, col, a, b) => `<button type="button" class="sv-hit is-btn is-part" data-act="part" data-val="${part}" aria-pressed="${lit === part}" style="--c:${col}"><i></i>${P ? `<span>${a}<br>${b}</span>` : `${a} ${b}`}</button>`;
    over += `<div class="is-row" style="left:${G.row[0]}px;top:${G.row[1]}px">${btn('put', IN, 'put in', rs(PUT))}${btn('y1', INT, 'year 1', '+' + rs(40))}${btn('y2', INT, 'year 2', '+' + rsp(43.2))}</div>`;
    return { svg, over };
  }

  // b2: ten years of small bars; the put-in part flat, the interest growing.
  paintTen(P) {
    let svg = '', over = '';
    const G = P
      ? { base: 540, top: 214, x0: 22, x1: 372, w: 22, note: [24, 40], big: [24, 82], leg: [24, 120], xl: 568, replay: [318, 596] }
      : { base: 412, top: 116, x0: 34, x1: 540, w: 32, note: [24, 40], big: [24, 82], leg: [24, 124], xl: 440, replay: [494, 40] };
    const k = (G.base - G.top) / VALS[10], B = G.base, an = this.fresh;
    const step = (G.x1 - G.x0) / 11;
    svg += text(G.note[0], G.note[1], 'made-up deposit, 8% every year', 20, 'var(--sim-label-muted)', 'start', 700);
    svg += text(G.big[0], G.big[1], `${rs(VALS[10])} after 10 years`, P ? 28 : 32, 'var(--sim-label)', 'start');
    // legend: put in (flat), interest (growing)
    const lg = (x, y, col, t) => `<rect x="${x}" y="${y - 17}" width="20" height="20" rx="5" ${fill(soft(col, 70), `stroke:${shade(col, 60)};stroke-width:2.5`)}/>${text(x + 30, y, t, 22, 'var(--sim-label)', 'start', 700)}`;
    svg += lg(G.leg[0], G.leg[1], IN, `put in ${rs(PUT)}, flat`);
    svg += lg(G.leg[0], G.leg[1] + 34, INT, `interest: ${rs(VALS[10] - PUT)} by year 10`);
    for (let n = 0; n <= 10; n++) {
      const x = G.x0 + step * n + (step - G.w) / 2, tot = VALS[n], hp = PUT * k, hi = (tot - PUT) * k;
      const cls = an ? 'mk-rise' : null, d = 0.2 + n * 0.14;
      svg += `<g${cls ? ` class="${cls}" style="--d:${d.toFixed(2)}s"` : ''}>`
        + `<rect x="${f1(x + 3)}" y="${f1(B - tot * k + 3)}" width="${G.w}" height="${f1(tot * k)}" ${fill('var(--sim-stroke)')}/>`
        + block(x, B - hp, G.w, hp, IN, { sw: 2 }) + (hi > 0 ? block(x, B - hp - hi, G.w, hi, INT, { sw: 2, p: 80 }) : '') + '</g>';
      svg += text(x + G.w / 2, B + 26, String(n), 20, n === 0 || n === 10 ? 'var(--sim-label)' : 'var(--sim-label-muted)', 'middle', 700);
    }
    const lx = G.x0 + step * 10 + step / 2;
    svg += `<g${an ? ' class="mk-pop" style="--d:1.8s"' : ''}>${text(Math.min(lx, P ? 360 : 530), B - VALS[10] * k - 12, rs(VALS[10]), P ? 20 : 22, 'var(--sim-label)', P ? 'end' : 'middle')}</g>`;
    svg += `<path d="M${G.x0 - 6} ${B}H${G.x1 + 4}" ${stroke('var(--sim-label)', 3)}/>`;
    svg += text((G.x0 + G.x1) / 2, B + 54, 'years', 21, 'var(--sim-label)', 'middle', 700);
    over += `<div class="is-ab" style="left:${G.replay[0]}px;top:${G.replay[1]}px"><button type="button" class="sv-hit is-btn is-quiet" data-act="replay">replay</button></div>`;
    return { svg, over };
  }

  testState() {
    return { view: this.stepIndex, lit: this.lit, values: VALS.map((v) => v.toFixed(2)), year2: VALS[2], year10: VALS[10] };
  }
}
