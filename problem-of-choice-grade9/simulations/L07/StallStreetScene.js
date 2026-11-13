/**
 * StallStreetScene - L07 s04 "Competition" (2 beats). SvgScene with three SimCivic 'stall' carts drawn big (their
 * produce hidden; each sells umbrellas). Landscape: three stalls side by side; portrait: stacked, buyers to the right.
 *   b0 rivals: each stall has a price tag and a quality mark: stall 1 Rs 220 "strong frame", stall 2 Rs 200
 *              "plain", stall 3 Rs 180 "cheap". 12 buyers (icons) stand 4 / 4 / 4. Three rounds play (0.8 s each):
 *              stall 2 cuts its price to Rs 170 and buyers walk to it (3 / 6 / 3); stall 3 makes a better umbrella
 *              ("strong frame") and buyers walk there (2 / 4 / 6); stall 1 cuts to Rs 190 (4 / 4 / 4). The stall
 *              acting is ringed; a caption names the move. Rest: round 3, buyers spread, every stall better or
 *              cheaper than at the start. "play again" replays.
 *   b1 ideas:  the same street (round 3 prices). Stall 2 brings a folding umbrella (drawn short and folded, in a
 *              school bag); buyers walk to it (2 / 8 / 2); stall 1 copies, then stall 3 (0.6 s each); buyers
 *              spread again (4 / 4 / 4); tag "competition: new ideas". Rest: all three sell folding umbrellas.
 * Prices are made up (said once on screen). Colours are tokens only; the rupee sign is built from its char code.
 * ASCII only.
 */
import { SvgScene, fill, stroke, shade } from 'simulations/base/kit/SimSvg.js';
import { iconSvg } from 'simulations/base/kit/SimIcons.js';
import { civicSvg } from 'simulations/base/kit/SimCivic.js';

const RS = String.fromCharCode(0x20B9);
const f1 = (v) => (+v).toFixed(1);
const BT = 6;
const UT = [1, 7, 3];

// b0 rounds: prices, quality marks, buyer counts, who acts, the caption.
const R0 = [
  { price: [220, 200, 180], mark: ['strong frame', 'plain', 'cheap'], n: [4, 4, 4], act: -1, say: 'three sellers, the same buyers' },
  { price: [220, 170, 180], mark: ['strong frame', 'plain', 'cheap'], n: [3, 6, 3], act: 1, say: 'stall 2 cuts its price' },
  { price: [220, 170, 180], mark: ['strong frame', 'plain', 'strong frame'], n: [2, 4, 6], act: 2, say: 'stall 3 makes a better umbrella' },
  { price: [190, 170, 180], mark: ['strong frame', 'plain', 'strong frame'], n: [4, 4, 4], act: 0, say: 'stall 1 cuts its price' },
];
const LAST = R0[3];
// b1 phases: which stalls sell folding umbrellas, buyer counts, who acts.
const R1 = [
  { fold: [0, 0, 0], n: [4, 4, 4], act: -1 },
  { fold: [0, 1, 0], n: [4, 4, 4], act: 1 },
  { fold: [0, 1, 0], n: [2, 8, 2], act: 1 },
  { fold: [1, 1, 0], n: [4, 6, 2], act: 0 },
  { fold: [1, 1, 1], n: [4, 4, 4], act: 2 },
  { fold: [1, 1, 1], n: [4, 4, 4], act: -1, tag: true },
];

/** Stable buyer -> stall assignment for each round (buyers move only when they must). */
function assignAll(rounds) {
  const out = [];
  let a = [];
  rounds[0].n.forEach((k, s) => { for (let i = 0; i < k; i++) a.push(s); });
  out.push(a.slice());
  for (let r = 1; r < rounds.length; r++) {
    const want = rounds[r].n, have = [0, 0, 0];
    a.forEach((s) => have[s]++);
    const pool = [];
    for (let i = a.length - 1; i >= 0; i--) { const s = a[i]; if (have[s] > want[s]) { have[s]--; pool.push(i); } }
    for (let s = 0; s < 3; s++) while (have[s] < want[s] && pool.length) { a[pool.pop()] = s; have[s]++; }
    out.push(a.slice());
  }
  return out;
}
const A0 = assignAll(R0);
const A1 = assignAll(R1);

const CSS = `
.ss-ab { position: absolute; transform: translate(-50%, -50%); }
.ss-btn { min-height: 46px; padding: 5px 16px; cursor: pointer; white-space: nowrap;
  border-radius: calc(12px * var(--look-radius, 1)); font: 800 20px/1.1 var(--sim-font); background: var(--sim-bg-surface); color: var(--sim-label);
  border: 2.5px solid var(--sim-stroke); box-shadow: 0 calc(3px * var(--look-lip, 1)) 0 var(--sim-stroke); }
.ss-btn:active { transform: translateY(3px); box-shadow: none; }
.ss-btn:focus-visible { outline: 3px solid var(--sim-accent); outline-offset: 3px; }
svg .ss-mv { animation: ss-mv 0.6s cubic-bezier(.4,0,.3,1) both; animation-delay: var(--d, 0s); }
@keyframes ss-mv { 0% { transform: translate(var(--dx), var(--dy)); } 100% { transform: none; } }
svg .ss-pop { transform-box: fill-box; transform-origin: center; animation: ss-pop 0.5s cubic-bezier(.3,1.5,.5,1) both; animation-delay: var(--d, 0s); }
@keyframes ss-pop { 0% { transform: scale(0.4); opacity: 0; } 100% { transform: none; opacity: 1; } }
svg .ss-ring { animation: ss-ring 0.8s ease both; }
@keyframes ss-ring { 0% { opacity: 0; } 25% { opacity: 1; } 100% { opacity: 1; } }
`;

const text = (x, y, t, size, col = 'var(--sim-label)', extra = '') =>
  `<text x="${f1(x)}" y="${f1(y)}"${/text-anchor/.test(extra) ? '' : ' text-anchor="middle"'}${extra} style="fill:${col};font:800 ${size}px var(--sim-font)">${t}</text>`;

function icon(name, cx, cy, size, tn) {
  const inner = (iconSvg(name, tn).match(/<svg[^>]*>([\s\S]*)<\/svg>/) || [])[1] || '';
  return `<g transform="translate(${f1(cx - size / 2)} ${f1(cy - size / 2)}) scale(${(size / 48).toFixed(3)})" style="--i:var(--sim-series-${tn})">${inner}</g>`;
}

/** An open umbrella, dome on (x, y), radius r. */
function umbrella(x, y, r, tn) {
  const col = `var(--sim-series-${tn})`, n = 4, dx = (2 * r) / n;
  let edge = '', ribs = '';
  for (let i = n - 1; i >= 0; i--) edge += `Q${f1(x - r + (i + 0.5) * dx)} ${f1(y - r * 0.18)} ${f1(x - r + i * dx)} ${f1(y)}`;
  for (let i = 1; i < n; i++) { const px = x - r + i * dx; ribs += `M${f1(x)} ${f1(y - r)}Q${f1(px + (px - x) * 0.1)} ${f1(y - r * 0.5)} ${f1(px)} ${f1(y)}`; }
  return `<path d="M${f1(x)} ${f1(y)}V${f1(y + r * 0.8)}a${f1(r * 0.14)} ${f1(r * 0.14)} 0 0 1 ${f1(-r * 0.28)} 0" ${stroke('var(--sim-label)', Math.max(2, r * 0.09))}/>`
    + `<path d="M${f1(x - r)} ${f1(y)}A${f1(r)} ${f1(r)} 0 0 1 ${f1(x + r)} ${f1(y)}${edge}Z" ${fill(col, `stroke:${shade(col, 70)};stroke-width:${f1(Math.max(1.5, r * 0.07))};stroke-linejoin:round`)}/>`
    + `<path d="${ribs}" ${stroke(shade(col, 65), Math.max(1.2, r * 0.05))}/>`;
}

/** A school bag with a short folded umbrella standing out of it; (x, y) = bag bottom centre, s = bag width. */
function foldBag(x, y, s, tn) {
  const col = `var(--sim-series-${tn})`, bag = 'var(--sim-series-4)', h = s * 0.9, top = y - h;
  const ux = x + s * 0.16, hw = s * 0.13, tip = top - s * 0.78;
  return `<path d="M${f1(ux)} ${f1(tip - s * 0.14)}V${f1(tip)}" ${stroke('var(--sim-label)', 3)}/>`
    + `<path d="M${f1(ux)} ${f1(tip)}L${f1(ux + hw)} ${f1(tip + s * 0.2)}V${f1(top + 10)}H${f1(ux - hw)}V${f1(tip + s * 0.2)}Z" ${fill(col, `stroke:${shade(col, 60)};stroke-width:2.5;stroke-linejoin:round`)}/>`
    + `<path d="M${f1(ux)} ${f1(tip + 4)}V${f1(top)}" ${stroke(shade(col, 60), 2)}/>`
    + `<rect x="${f1(ux - hw - 2)}" y="${f1(tip + s * 0.4)}" width="${f1(2 * hw + 4)}" height="${f1(s * 0.09)}" rx="2" ${fill(shade(col, 55))}/>`
    + `<path d="M${f1(x - s * 0.24)} ${f1(top + 2)}Q${f1(x - s * 0.05)} ${f1(top - s * 0.34)} ${f1(x + s * 0.02)} ${f1(top + 2)}" ${stroke(shade(bag, 60), 4)}/>`
    + `<rect x="${f1(x - s / 2)}" y="${f1(top + 3)}" width="${f1(s)}" height="${f1(h)}" rx="${f1(s * 0.2)}" ${fill(shade(bag, 70))}/>`
    + `<rect x="${f1(x - s / 2)}" y="${f1(top)}" width="${f1(s)}" height="${f1(h)}" rx="${f1(s * 0.2)}" ${fill(bag, `stroke:${shade(bag, 60)};stroke-width:2.5`)}/>`
    + `<path d="M${f1(x - s / 2)} ${f1(top + h * 0.42)}Q${f1(x)} ${f1(top + h * 0.56)} ${f1(x + s / 2)} ${f1(top + h * 0.42)}" ${stroke(shade(bag, 60), 2.5)}/>`
    + `<rect x="${f1(x - s * 0.08)}" y="${f1(top + h * 0.44)}" width="${f1(s * 0.16)}" height="${f1(h * 0.14)}" rx="2" ${fill(shade(bag, 55))}/>`;
}

const stallArt = (cx, gy, w) => civicSvg('stall', cx, gy, { w }).replace(/<g data-part="goods"[^>]*>[\s\S]*?<\/g>/g, '');

export class StallStreetScene extends SvgScene {
  static WIDTH = 560;
  static PORTRAIT_WIDTH = 390;
  static HEIGHT = 504;
  static PORTRAIT_HEIGHT = 624;
  static CONTINUOUS = false;
  static BEAT_STEP_MAP = [[{ idx: 0, dwellMs: null }], [{ idx: 1, dwellMs: null }]];
  static BEAT_MAPS = { 2: [[{ idx: 0, dwellMs: null }], [{ idx: 1, dwellMs: null }]] };
  static CONTROLS = [];
  static ARIA_LABEL = 'A made-up example. Three umbrella stalls on one street, each with a price and a quality mark. Twelve buyers stand four at each stall. Stall 2 cuts its price and buyers walk to it. Stall 3 makes a better umbrella and buyers walk there. Stall 1 cuts its price and the buyers spread out again. Then stall 2 brings a folding umbrella that fits in a school bag; buyers walk to it; the other two stalls copy it. Competition brings new ideas.';

  async setup() {
    await super.setup();
    this._onClick = (e) => {
      const b = e.target?.closest?.('[data-act]');
      if (b?.dataset.act === 'again') this.runFrom(0.3);
    };
    this.root.addEventListener('click', this._onClick);
  }

  destroy() {
    this.root?.removeEventListener('click', this._onClick);
    super.destroy();
  }

  css() { return CSS; }

  enter() { this.runFrom(0.5, true); }

  rounds() { return this.stepIndex === 1 ? R1 : R0; }

  runFrom(lead, quiet) {
    for (const t of (this._timers ?? []).splice(0)) clearTimeout(t);
    this.ph = 0;
    this.prevPh = 0;
    if (!quiet) this.repaint();
    const n = this.rounds().length, gap = this.stepIndex === 1 ? 0.6 : 0.8;
    for (let p = 1; p < n; p++) this.after(lead + (p - 1) * gap, () => { this.prevPh = this.ph; this.ph = p; this.repaint(); });
  }

  skip() {
    const last = this.rounds().length - 1;
    if (this.ph >= last) return false;
    for (const t of (this._timers ?? []).splice(0)) clearTimeout(t);
    this.prevPh = last; this.ph = last;
    this.repaint();
    return true;
  }

  busy() { return this.ph < this.rounds().length - 1; }

  stageHeight(st) { return Math.round((st.portrait ? 600 : 480) * st.W / (st.portrait ? 390 : 560)); }

  geom(st) {
    if (!st.portrait) {
      const xs = [96, 280, 464];
      return { P: false, stalls: xs.map((x) => ({ cx: x, gy: 232, w: 172, tag: [x, 50], mark: [x, 254], ring: [x - 90, 26, 180, 362],
        slot: (j) => [x + ((j % 4) - 1.5) * 43, 298 + Math.floor(j / 4) * 46] })), icon: 42, say: [280, 416], btn: [470, 450], ex: [12, 456], newTag: [210, 450] };
    }
    const top = [14, 176, 338];
    return { P: true, stalls: top.map((t) => ({ cx: 80, gy: t + 140, w: 146, tag: [232, t + 28], mark: [232, t + 70], ring: [6, t, 378, 158],
      slot: (j) => [218 + (j % 4) * 44, t + 106 + Math.floor(j / 4) * 37] })), icon: 36, say: [195, 516], btn: [W_P - 80, 562], ex: [12, 562], newTag: [140, 562] };
  }

  /** Drawn in design units (560 x 480 landscape, 390 x 600 portrait), scaled to the measured stage width. */
  paint(st) {
    const P = st.portrait, DW = P ? 390 : 560, DH = P ? 600 : 480, k = (st.W / DW).toFixed(4);
    const out = this.paintD({ portrait: P, W: DW, H: DH });
    return { svg: `<g transform="scale(${k})">${out.svg}</g>`, over: `<div style="position:absolute;left:0;top:0;width:${DW}px;height:${DH}px;transform:scale(${k});transform-origin:0 0">${out.over}</div>` };
  }

  paintD(st) {
    const g = this.geom(st), b1 = this.stepIndex === 1, rounds = this.rounds(), ph = this.ph ?? rounds.length - 1;
    const R = rounds[ph], A = (b1 ? A1 : A0)[ph], Aprev = (b1 ? A1 : A0)[this.prevPh ?? ph];
    const price = b1 ? LAST.price : R.price, mark = b1 ? LAST.mark : R.mark, prevR = rounds[this.prevPh ?? ph];
    let svg = '', over = '';
    g.stalls.forEach((s, k) => {
      const acting = R.act === k;
      if (acting) svg += `<rect class="ss-ring" x="${s.ring[0]}" y="${s.ring[1]}" width="${s.ring[2]}" height="${s.ring[3]}" rx="18" ${fill('color-mix(in srgb, var(--sim-accent) 10%, transparent)', 'stroke:var(--sim-accent);stroke-width:3.5')}/>`;
      svg += stallArt(s.cx, s.gy, s.w);
      const k2 = s.w / 230, cartY = s.gy - (200 - 116) * k2;
      const folding = b1 && R.fold[k];
      const newFold = folding && !(rounds[this.prevPh ?? ph].fold?.[k]) && ph !== this.prevPh;
      if (folding) svg += `<g${newFold ? ' class="ss-pop"' : ''}>${foldBag(s.cx, cartY + 2, s.w * 0.34, UT[k])}</g>`;
      else svg += umbrella(s.cx, cartY - s.w * 0.06, s.w * 0.2, UT[k]);
      // price tag
      const p = price[k], cut = !b1 && ph !== this.prevPh && prevR.price[k] !== p, [tx, ty] = s.tag;
      svg += `<g${cut ? ' class="ss-pop"' : ''}><rect x="${f1(tx - 52)}" y="${f1(ty - 20 + 4)}" width="104" height="42" rx="12" ${fill(shade(acting && !b1 ? 'var(--sim-accent)' : 'var(--sim-stroke)', 80))}/>`
        + `<rect x="${f1(tx - 52)}" y="${f1(ty - 20)}" width="104" height="42" rx="12" ${fill(acting && !b1 ? 'color-mix(in srgb, var(--sim-accent) 18%, var(--sim-bg-surface))' : 'var(--sim-bg-surface)', `stroke:${acting && !b1 ? 'var(--sim-accent)' : 'var(--sim-stroke)'};stroke-width:3`)}/>`
        + text(tx, ty + 10, `${RS}${p}`, 26) + '</g>';
      const p0 = R0[0].price[k];
      if (!b1 && p0 !== p) {
        const ox = g.P ? tx + 92 : tx, oy = g.P ? ty + 7 : ty - 34;
        svg += `<g opacity="0.75">${text(ox, oy, `${RS}${p0}`, g.P ? 17 : 18, 'var(--sim-label-muted)')}<path d="M${f1(ox - 26)} ${f1(oy - 6)}H${f1(ox + 26)}" ${stroke('var(--sim-label-muted)', 2.5)}/></g>`;
      }
      if (!g.P) svg += `<path d="M${tx} ${ty + 22}V${s.gy - s.w * 0.85}" ${stroke('var(--sim-stroke)', 2.5)}/>`;
      // quality mark
      const m = folding ? 'folding' : mark[k], good = m !== 'cheap' && m !== 'plain', [mx, my] = s.mark;
      const newMark = (!b1 && ph !== this.prevPh && prevR.mark[k] !== m) || newFold;
      svg += `<g${newMark ? ' class="ss-pop"' : ''}><rect x="${f1(mx - 74)}" y="${f1(my - 17)}" width="148" height="34" rx="17" ${fill(good ? 'color-mix(in srgb, var(--sim-good) 22%, var(--sim-bg-surface))' : 'var(--sim-bg-surface)', `stroke:${good ? 'var(--sim-good)' : 'var(--sim-stroke)'};stroke-width:2.5`)}/>`
        + text(mx, my + 7, m, 19) + '</g>';
    });
    // buyers: each walks from its old stall slot to its new one
    const slotOf = (asg, i) => { const s = asg[i]; let j = 0; for (let q = 0; q < i; q++) if (asg[q] === s) j++; return g.stalls[s].slot(j); };
    for (let i = 0; i < A.length; i++) {
      const [x, y] = slotOf(A, i), [px, py] = slotOf(Aprev, i), moved = (px !== x || py !== y) && ph !== this.prevPh;
      svg += `<g${moved ? ` class="ss-mv" style="--dx:${f1(px - x)}px;--dy:${f1(py - y)}px;--d:${f1((i % 4) * 0.04)}s"` : ''}>${icon('person', x, y, g.icon, BT)}</g>`;
    }
    if (!b1) svg += text(g.say[0], g.say[1], R.say, g.P ? 19 : 21);
    else if (R.tag) svg += `<g class="ss-pop">${text(g.say[0], g.say[1], 'competition: new ideas', g.P ? 22 : 24, 'var(--sim-accent)')}</g>`;
    svg += text(g.ex[0], g.ex[1], 'a made-up example', g.P ? 15 : 16, 'var(--sim-label-muted)', ' text-anchor="start"');
    over += `<div class="ss-ab" style="left:${g.btn[0]}px;top:${g.btn[1]}px"><button type="button" class="sv-hit ss-btn" data-act="again">play again</button></div>`;
    return { svg, over: `<div class="${g.P ? 'ss-p' : 'ss-l'}">${over}</div>` };
  }

  testState() {
    const R = this.rounds()[this.ph ?? 0];
    return { step: this.stepIndex, phase: this.ph, buyers: R.n, prices: this.stepIndex ? LAST.price : R.price, folding: R.fold ?? null };
  }
}

const W_P = 390;
