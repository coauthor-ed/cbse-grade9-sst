/**
 * BakeryPromotionScene - L03 s05 "Telling people about the bakery" (3 beats). SvgScene, design 560 x 480
 * landscape, 390 x 600 portrait. Cast: shared/StallKit.js (bakery, breadLoaf, cakeJar), shared/FinPeople.js
 * (you behind the counter, parent and child as customers). Drawn here (no kit prop): a phone with a post, a
 * poster, a special-offer coupon, a cake slice, a cake box with a window, a counter.
 *   b0 Promotion: ABC Bakery in the middle; a phone with a post ('social media'), a poster on a stand and a
 *      special-offer coupon pop in (0.4 s apart); a parent and a child walk up to the bakery (0.8 s).
 *   b1 Packaging: a cake slice on loose paper beside the same slice in a closed ABC Bakery box with a window.
 *      Two buttons in the figure, 'today' / 'next day' (next day at rest and on cold start): next day the loose
 *      slice is dry and dull ('dry' in the bad colour), the boxed one still fresh ('still fresh', good colour).
 *      Under both, the shelf-life bars: short for loose paper, long for the box (no numbers).
 *   b2 Customers who come back: you behind the counter say 'Welcome back!' to a returning customer (walks in
 *      0.8 s); three slices on the counter look the same ('same every time'); a strip of three visits (Mon, Wed,
 *      Sat) ticks in, 0.4 s apart ('comes back').
 * No host controls. Colours are tokens only. ASCII only.
 */
import { SvgScene, stroke, fill, shade } from 'simulations/base/kit/SimSvg.js';
import { MONEY_CSS } from '../shared/MoneyKit.js';
import { PEOPLE_CSS, personSlot, paintPeople, frontSvg } from '../shared/FinPeople.js';
import { STALL_CSS, bakery, breadLoaf, cakeJar } from '../shared/StallKit.js';

const f1 = (v) => (+v).toFixed(1);
const MAIN = [[{ idx: 0, dwellMs: null }], [{ idx: 1, dwellMs: null }], [{ idx: 2, dwellMs: null }]];

const CSS = `
.bp-ab { position: absolute; transform: translate(-50%, -50%); }
.bp-btn { min-height: 46px; padding: 5px 12px; cursor: pointer; white-space: nowrap;
  border-radius: calc(12px * var(--look-radius, 1)); font: 800 21px/1.1 var(--sim-font); background: var(--sim-bg-surface); color: var(--sim-label);
  border: 2.5px solid var(--sim-stroke); box-shadow: 0 calc(3px * var(--look-lip, 1)) 0 var(--sim-stroke); }
.bp-btn.on { border-color: var(--sim-accent); box-shadow: 0 calc(3px * var(--look-lip, 1)) 0 var(--sim-accent); background: color-mix(in oklab, var(--sim-accent) 16%, var(--sim-bg-surface)); }
.bp-btn:active { transform: translate(-50%, calc(-50% + 3px)); box-shadow: none; }
.bp-btn:focus-visible { outline: 3px solid var(--sim-accent); outline-offset: 3px; }
.bp-walk { animation: bp-walk 0.8s cubic-bezier(.3,.8,.4,1) both; animation-delay: var(--d, 0s); }
@keyframes bp-walk { 0% { transform: translateX(var(--dx, 60px)); opacity: 0; } 30% { opacity: 1; } 100% { transform: none; opacity: 1; } }
svg .bp-fade { animation: bp-fade 0.6s ease-out both; animation-delay: var(--d, 0s); }
@keyframes bp-fade { 0% { opacity: 0; } 100% { opacity: 1; } }
@media (prefers-reduced-motion: reduce) { .bp-walk, svg .bp-fade { animation: none; } }
`;

const text = (x, y, t, size, col = 'var(--sim-label)', anchor = 'middle', w = 800) =>
  `<text x="${f1(x)}" y="${f1(y)}" text-anchor="${anchor}" style="fill:${col};font:${w} ${size}px var(--sim-font)">${t}</text>`;
const rect = (x, y, w, h, rx, col, extra = '') => `<rect x="${f1(x)}" y="${f1(y)}" width="${f1(w)}" height="${f1(h)}" rx="${f1(rx)}" ${fill(col, extra)}/>`;
const lipRect = (x, y, w, h, rx, col, rim) => rect(x, y + 4, w, h, rx, rim) + rect(x, y, w, h, rx, col, `stroke:${rim};stroke-width:2.5`);

const SPONGE = 'color-mix(in oklab, var(--sim-series-8) 55%, var(--sim-label) 22%)';
const ICING = 'color-mix(in oklab, var(--sim-series-4) 55%, var(--sim-bg-surface))';
const DRY = 'color-mix(in oklab, var(--sim-series-8) 30%, var(--sim-label-muted))';
const DRY_ICING = 'color-mix(in oklab, var(--sim-series-4) 18%, var(--sim-label-muted))';
const BOX = 'color-mix(in oklab, var(--sim-series-4) 26%, var(--sim-bg-surface))';
const WOODC = 'color-mix(in oklab, var(--sim-series-8) 40%, var(--sim-label) 40%)';

/** A cake slice, side view (a wedge seen from the cut face): (x, y) bottom centre, w wide. dry: dull and cracked. */
function slice(x, y, w, dry = false) {
  const h = w * 0.62, x0 = x - w / 2, sp = dry ? DRY : SPONGE, ic = dry ? DRY_ICING : ICING, rim = shade(sp, 62), lay = h * 0.36;
  let s = `<path d="M${f1(x0)} ${f1(y)}V${f1(y - h + 6)}L${f1(x0 + w)} ${f1(y - h * 0.55)}V${f1(y)}Z" ${fill(sp, `stroke:${rim};stroke-width:2.5;stroke-linejoin:round`)}/>`;
  s += `<path d="M${f1(x0)} ${f1(y - lay)}L${f1(x0 + w)} ${f1(y - lay * 0.92)}" ${stroke(ic, h * 0.1)}/>`;
  s += `<path d="M${f1(x0 - 2)} ${f1(y - h + 2)}L${f1(x0 + w + 2)} ${f1(y - h * 0.58)}" ${stroke(ic, h * 0.14)}/>`;
  if (dry) {
    s += `<path d="M${f1(x0 + w * 0.3)} ${f1(y - h * 0.2)}l${f1(w * 0.08)} ${f1(-h * 0.12)}l${f1(-w * 0.05)} ${f1(-h * 0.1)}M${f1(x0 + w * 0.65)} ${f1(y - h * 0.18)}l${f1(-w * 0.06)} ${f1(-h * 0.1)}" ${stroke(rim, 2.5)}/>`;
    for (const [dx, dy] of [[-0.62, 0.0], [0.6, 0.0], [0.7, -0.05]]) s += `<circle cx="${f1(x + dx * w)}" cy="${f1(y - 4 + dy * h)}" r="${f1(w * 0.03)}" ${fill(sp)}/>`;
  } else {
    s += `<circle cx="${f1(x0 + w * 0.22)}" cy="${f1(y - h - 2)}" r="${f1(w * 0.07)}" ${fill('var(--sim-series-6)', `stroke:${shade('var(--sim-series-6)', 62)};stroke-width:2`)}/>`;
  }
  return s;
}

/** A sheet of loose paper under a slice; (x, y) bottom centre. */
function loosePaper(x, y, w) {
  return `<path d="M${f1(x - w / 2)} ${f1(y)}L${f1(x - w * 0.42)} ${f1(y - w * 0.1)}L${f1(x + w * 0.46)} ${f1(y - w * 0.08)}L${f1(x + w / 2)} ${f1(y + 2)}Z" ${fill('var(--sim-bg-surface)', 'stroke:var(--sim-label-muted);stroke-width:2;stroke-linejoin:round')}/>`;
}

/** A closed cake box with a window, a band 'ABC Bakery' and a ribbon; (x, y) bottom centre; holds a slice. */
function cakeBox(x, y, w, inner) {
  const h = w * 0.86, x0 = x - w / 2, top = y - h, rim = shade(BOX, 62);
  let s = rect(x0, top + 4, w, h, 8, rim) + rect(x0, top, w, h, 8, BOX, `stroke:${rim};stroke-width:2.5`);
  // the lid edge
  s += rect(x0 - 5, top - 4, w + 10, h * 0.14, 6, BOX, `stroke:${rim};stroke-width:2.5`);
  // the window with the slice inside
  const wx = x0 + w * 0.14, wy = top + h * 0.3, ww = w * 0.72, wh = h * 0.52;
  s += rect(wx, wy, ww, wh, 6, 'color-mix(in oklab, var(--sim-ice) 45%, var(--sim-bg-surface))', `stroke:${rim};stroke-width:2`);
  s += inner(x, wy + wh - 6, ww * 0.62);
  s += `<path d="M${f1(wx + ww * 0.1)} ${f1(wy + wh * 0.2)}l${f1(ww * 0.12)} ${f1(-wh * 0.12)}" ${stroke('color-mix(in oklab, var(--sim-bg-surface) 80%, transparent)', 4)}/>`;
  // the ribbon and the name band
  s += rect(x - w * 0.04, top - 4, w * 0.08, h * 0.3, 0, 'var(--sim-series-6)');
  s += `<path d="M${f1(x)} ${f1(top - 4)}q${f1(-w * 0.2)} ${f1(-w * 0.16)} ${f1(-w * 0.2)} 0q${f1(w * 0.04)} ${f1(w * 0.08)} ${f1(w * 0.2)} 0q${f1(w * 0.2)} ${f1(-w * 0.16)} ${f1(w * 0.2)} 0q${f1(-w * 0.04)} ${f1(w * 0.08)} ${f1(-w * 0.2)} 0Z" ${fill('var(--sim-series-6)', `stroke:${shade('var(--sim-series-6)', 62)};stroke-width:2`)}/>`;
  s += rect(x0, top + h * 0.13, w, h * 0.15, 0, 'var(--sim-series-8)');
  s += text(x, top + h * 0.13 + h * 0.15 * 0.72, 'ABC Bakery', Math.max(14, w * 0.11), 'var(--sim-bg-deep)');
  return s;
}

/** A phone showing a post: (x, y) centre, w wide (height 1.8 w). */
function phone(x, y, w) {
  const h = w * 1.8, x0 = x - w / 2, y0 = y - h / 2, body = 'color-mix(in oklab, var(--sim-series-5) 60%, var(--sim-label) 30%)';
  let s = rect(x0, y0 + 4, w, h, w * 0.14, shade(body, 70)) + rect(x0, y0, w, h, w * 0.14, body);
  const sx = x0 + w * 0.08, sy = y0 + h * 0.07, sw = w * 0.84, sh = h * 0.86;
  s += rect(sx, sy, sw, sh, w * 0.06, 'var(--sim-bg-surface)');
  s += `<circle cx="${f1(sx + sw * 0.16)}" cy="${f1(sy + sh * 0.09)}" r="${f1(sw * 0.09)}" ${fill('var(--sim-series-8)')}/>`;
  s += rect(sx + sw * 0.32, sy + sh * 0.06, sw * 0.56, sh * 0.05, 3, 'var(--sim-label-muted)');
  s += rect(sx + sw * 0.06, sy + sh * 0.2, sw * 0.88, sh * 0.5, 6, 'color-mix(in oklab, var(--sim-series-4) 18%, var(--sim-bg-surface))');
  s += cakeJar(x - sw * 0.18, sy + sh * 0.66, sh * 0.3) + breadLoaf(x + sw * 0.2, sy + sh * 0.64, sw * 0.4);
  // a heart and two text lines
  const hx = sx + sw * 0.16, hy = sy + sh * 0.8, r = sw * 0.07;
  s += `<path d="M${f1(hx)} ${f1(hy + r * 1.2)}l${f1(-r * 1.2)} ${f1(-r * 1.2)}a${f1(r * 0.62)} ${f1(r * 0.62)} 0 0 1 ${f1(r * 1.2)} ${f1(-r * 0.9)}a${f1(r * 0.62)} ${f1(r * 0.62)} 0 0 1 ${f1(r * 1.2)} ${f1(r * 0.9)}Z" ${fill('var(--sim-series-6)')}/>`;
  s += rect(sx + sw * 0.32, hy - 4, sw * 0.56, sh * 0.04, 3, 'var(--sim-label-muted)') + rect(sx + sw * 0.06, sy + sh * 0.89, sw * 0.7, sh * 0.04, 3, 'var(--sim-label-muted)');
  return s;
}

/** A poster on a stand: (x, y) ground under the stand, w wide. */
function poster(x, y, w) {
  const h = w * 1.2, x0 = x - w / 2, top = y - h - w * 0.4, rim = 'var(--sim-stroke)';
  let s = `<path d="M${f1(x - w * 0.3)} ${f1(top + h)}L${f1(x - w * 0.38)} ${f1(y)}M${f1(x + w * 0.3)} ${f1(top + h)}L${f1(x + w * 0.38)} ${f1(y)}" ${stroke(WOODC, 5)}/>`;
  s += lipRect(x0, top, w, h, 6, 'var(--sim-bg-surface)', rim);
  s += rect(x0, top, w, h * 0.24, 6, 'var(--sim-series-8)');
  s += text(x, top + h * 0.165, 'ABC Bakery', w * 0.15, 'var(--sim-bg-deep)');
  s += breadLoaf(x - w * 0.18, top + h * 0.66, w * 0.4) + cakeJar(x + w * 0.24, top + h * 0.66, h * 0.32);
  s += text(x, top + h * 0.88, 'fresh daily', w * 0.13, 'var(--sim-label)');
  return s;
}

/** A coupon with a dashed edge: (x, y) centre. */
function coupon(x, y, w) {
  const h = w * 0.62, x0 = x - w / 2, y0 = y - h / 2, col = 'var(--sim-series-3)', rim = shade(col, 62);
  let s = rect(x0, y0 + 4, w, h, 10, rim) + rect(x0, y0, w, h, 10, `color-mix(in oklab, ${col} 26%, var(--sim-bg-surface))`, `stroke:${rim};stroke-width:2.5`);
  s += rect(x0 + 7, y0 + 7, w - 14, h - 14, 6, 'none', `stroke:${rim};stroke-width:2;stroke-dasharray:7 5`);
  // a star
  const r = h * 0.2, cx = x, cy = y0 + h * 0.32;
  let d = '';
  for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.45 : r; d += `${i ? 'L' : 'M'}${f1(cx + Math.cos(a) * rr)} ${f1(cy + Math.sin(a) * rr)}`; }
  s += `<path d="${d}Z" ${fill('var(--sim-series-2)', `stroke:${shade('var(--sim-series-2)', 62)};stroke-width:2;stroke-linejoin:round`)}/>`;
  s += text(x, y0 + h * 0.66, 'special', w * 0.15, 'var(--sim-label)') + text(x, y0 + h * 0.86, 'offer', w * 0.15, 'var(--sim-label)');
  return s;
}

function tick(x, y, r) {
  return `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(r)}" ${fill('var(--sim-good)', `stroke:${shade('var(--sim-good)', 62)};stroke-width:2`)}/>`
    + `<path d="M${f1(x - r * 0.45)} ${f1(y)}l${f1(r * 0.3)} ${f1(r * 0.32)}l${f1(r * 0.6)} ${f1(-r * 0.66)}" ${stroke('var(--sim-bg-deep)', r * 0.24)}/>`;
}

export class BakeryPromotionScene extends SvgScene {
  static WIDTH = 560;
  static PORTRAIT_WIDTH = 390;
  static HEIGHT = 480;
  static PORTRAIT_HEIGHT = 600;
  static CONTINUOUS = false;
  static BEAT_STEP_MAP = MAIN;
  static BEAT_MAPS = { 3: MAIN };
  static CONTROLS = [];
  static ARIA_LABEL = 'Promotion for ABC Bakery: a social media post on a phone, a poster and a special offer bring a parent and a child to the shop. Packaging: a cake slice on loose paper and the same slice in a closed ABC Bakery box with a window; the next day the loose slice is dry while the boxed one is still fresh, so the box gives a longer shelf-life. Customers who come back: you say Welcome back to a returning customer at the counter, the cakes look the same every time, and the customer visits on Monday, Wednesday and Saturday.';

  async setup() {
    this.day = 1;
    await super.setup();
    this._onClick = (e) => {
      const b = e.target?.closest?.('[data-day]');
      if (!b || this.stepIndex !== 1) return;
      const d = +b.dataset.day;
      if (d === this.day) return;
      this.day = d;
      this.repaint();
    };
    this.root.addEventListener('click', this._onClick);
  }

  destroy() {
    this.root?.removeEventListener('click', this._onClick);
    super.destroy();
  }

  css() { return MONEY_CSS + PEOPLE_CSS + STALL_CSS + CSS; }

  enter() { this.day = 1; }

  repaint() { super.repaint(); paintPeople(this); }

  stageHeight(st) { return Math.round((st.portrait ? 600 : 480) * st.W / (st.portrait ? 390 : 560)); }

  paint(st) {
    const P = st.portrait, DW = P ? 390 : 560, DH = P ? 600 : 480, k = (st.W / DW).toFixed(4), v = this.stepIndex;
    const out = v === 1 ? this.paintBox(P) : v === 2 ? this.paintBack(P, DW, DH) : this.paintPromo(P);
    return { svg: `<g transform="scale(${k})">${out.svg}</g>`, over: `<div style="position:absolute;left:0;top:0;width:${DW}px;height:${DH}px;overflow:hidden;transform:scale(${k});transform-origin:0 0">${out.over ?? ''}</div>` };
  }

  // b0: three ways to spread the word round the bakery; customers walk up.
  paintPromo(P) {
    const G = P
      ? { bk: [195, 586, 240], ph: [68, 160, 86], phl: [68, 274], po: [195, 236, 106], pol: [195, 274], cu: [322, 160, 124], cul: null,
        par: [40, 590, 150], kid: [356, 590, 116] }
      : { bk: [280, 452, 236], ph: [82, 132, 82], phl: [82, 248], po: [478, 236, 112], pol: [478, 264], cu: [280, 80, 150], cul: null,
        par: [70, 470, 176], kid: [482, 470, 136] };
    let svg = bakery(G.bk[0], G.bk[1], G.bk[2]);
    svg += `<g class="mk-pop" style="--d:0.2s">${phone(G.ph[0], G.ph[1], G.ph[2])}${text(G.phl[0], G.phl[1], 'social media', 22, 'var(--sim-label)')}</g>`;
    svg += `<g class="mk-pop" style="--d:0.6s">${poster(G.po[0], G.po[1], G.po[2])}${text(G.pol[0], G.pol[1], 'poster', 22, 'var(--sim-label)')}</g>`;
    svg += `<g class="mk-pop" style="--d:1s">${coupon(G.cu[0], G.cu[1], G.cu[2])}</g>`;
    let over = personSlot('parent', { x: G.par[0], y: G.par[1], h: G.par[2], facing: 1, mood: 'smile', cls: 'bp-walk', style: '--dx:-60px;--d:1.3s;' });
    over += personSlot('child', { x: G.kid[0], y: G.kid[1], h: G.kid[2], facing: -1, mood: 'happy', cls: 'bp-walk', style: '--dx:60px;--d:1.5s;' });
    return { svg, over };
  }

  // b1: loose paper against the box, today or the next day, and the shelf-life bars.
  paintBox(P) {
    const G = P
      ? { cols: [104, 290], base: 300, sw: 96, bw: 166, head: 58, st: 352, sl: [400, 430], bx: 24, bl: [90, 340], btn: [[120, 540], [270, 540]], bwid: 132 }
      : { cols: [150, 410], base: 268, sw: 104, bw: 190, head: 44, st: 312, sl: [348, 374], bx: 40, bl: [120, 480], btn: [[200, 448], [360, 448]], bwid: 140 };
    const next = this.day === 1;
    let svg = text(G.cols[0], G.head, 'loose paper', 24, 'var(--sim-label)') + text(G.cols[1], G.head, 'box', 24, 'var(--sim-label)');
    // loose paper
    const lx = G.cols[0];
    svg += loosePaper(lx, G.base, G.sw * 1.3);
    svg += `<g${next ? ' class="bp-fade"' : ''}>${slice(lx, G.base - 6, G.sw, next)}</g>`;
    svg += cakeBox(G.cols[1], G.base, G.bw, (x, y, w) => slice(x, y, w, false));
    const s0 = next ? ['dry', 'var(--sim-bad)'] : ['fresh', shade('var(--sim-good)', 72)];
    const s1 = next ? ['still fresh', shade('var(--sim-good)', 72)] : ['fresh', shade('var(--sim-good)', 72)];
    svg += `<g class="mk-pop" style="--d:0.4s">${text(lx, G.st, s0[0], 28, s0[1])}${text(G.cols[1], G.st, s1[0], 28, s1[1])}</g>`;
    // shelf-life: short for paper, long for the box
    svg += text(G.bx, G.sl[0], 'shelf-life', 22, 'var(--sim-label-muted)', 'start', 700);
    const by = G.sl[1] - 14, bh = 26;
    svg += `<g class="mk-grow" style="--d:0.2s">${lipRect(G.bx, by, G.bl[0], bh, 8, 'color-mix(in oklab, var(--sim-bad) 30%, var(--sim-bg-surface))', shade('var(--sim-bad)', 62))}</g>`;
    svg += `<g class="mk-grow" style="--d:0.4s">${lipRect(G.bx + G.bl[0] + 14, by, G.bl[1] - G.bl[0] - 14, bh, 8, 'color-mix(in oklab, var(--sim-good) 30%, var(--sim-bg-surface))', shade('var(--sim-good)', 62))}</g>`;
    svg += text(G.bx + G.bl[0] / 2, by + bh + 26, 'paper', 20, 'var(--sim-label-muted)', 'middle', 700)
      + text((G.bx + G.bl[0] + 14 + G.bl[1]) / 2, by + bh + 26, 'box', 20, 'var(--sim-label-muted)', 'middle', 700);
    let over = '';
    ['today', 'next day'].forEach((l, i) => {
      const [bx, by2] = G.btn[i];
      over += `<button type="button" class="sv-hit tap btn bp-ab bp-btn${this.day === i ? ' on' : ''}" data-day="${i}" aria-pressed="${this.day === i}" style="left:${bx}px;top:${by2}px;width:${G.bwid}px">${l}</button>`;
    });
    return { svg, over };
  }

  // b2: a returning customer at the counter.
  paintBack(P, DW, DH) {
    const G = P
      ? { ct: [16, 430, 250, 96], you: [140, 210], bub: [140, 236, 220], cus: [330, 592, 196], strip: [20, 44, 98], cl: [195, 34], cakes: [62, 141, 220], same: [141, 500] }
      : { ct: [40, 330, 320, 110], you: [200, 210], bub: [200, 92, 230], cus: [470, 466, 214], strip: [330, 66, 0], cl: [443, 50], cakes: [100, 200, 300], same: [200, 404] };
    const [cx, cy, cw, ch] = G.ct;
    let over = personSlot('you', { x: G.you[0], y: cy + 40, h: G.you[1], facing: 0, mood: 'happy' });
    let front = rect(cx, cy + 4, cw, ch, 8, WOODC) + rect(cx, cy, cw, ch, 8, 'color-mix(in oklab, var(--sim-series-8) 50%, var(--sim-bg-surface))', `stroke:${WOODC};stroke-width:2.5`)
      + rect(cx - 8, cy - 6, cw + 16, 12, 6, WOODC);
    G.cakes.forEach((x, i) => { front += `<g class="mk-pop" style="--d:${0.2 + i * 0.15}s">${slice(x, cy - 6, 64)}</g>`; });
    front += text(G.same[0], G.same[1], 'same every time', 24, 'var(--sim-label)');
    over += frontSvg(DW, DH, front);
    over += personSlot('parent', { x: G.cus[0], y: G.cus[1], h: G.cus[2], facing: -1, mood: 'happy', cls: 'bp-walk', style: '--dx:70px;--d:0.1s;' });
    // the speech bubble
    const [bx, by, bw] = G.bub, bh = 56;
    let svg = `<g class="mk-pop" style="--d:0.9s">${lipRect(bx - bw / 2, by - bh, bw, bh, 18, 'var(--sim-bg-surface)', 'var(--sim-stroke)')}`
      + `<path d="M${f1(bx - 12)} ${f1(by - 1)}l12 18l10 -18Z" ${fill('var(--sim-bg-surface)', 'stroke:var(--sim-stroke);stroke-width:2.5;stroke-linejoin:round')}/>`
      + `<path d="M${f1(bx - 11)} ${f1(by - 2)}h20" ${stroke('var(--sim-bg-surface)', 4)}/>`
      + text(bx, by - bh / 2 + 9, 'Welcome back!', 25, 'var(--sim-label)') + '</g>';
    // three visits
    svg += text(G.cl[0], G.cl[1], 'comes back', 24, 'var(--sim-label)');
    const days = ['Mon', 'Wed', 'Sat'], [sx, sy, sp] = G.strip;
    days.forEach((d, i) => {
      const x = P ? sx + i * (sp + 18) + 30 : sx + i * 76, y = P ? sy + 12 : sy;
      svg += `<g class="mk-pop" style="--d:${1.2 + i * 0.4}s">${lipRect(x, y, P ? 82 : 68, 74, 12, 'var(--sim-bg-surface)', 'var(--sim-stroke)')}`
        + text(x + (P ? 41 : 34), y + 30, d, P ? 24 : 22, 'var(--sim-label)')
        + tick(x + (P ? 41 : 34), y + 54, 15) + '</g>';
    });
    return { svg, over };
  }

  testState() { return { view: this.stepIndex, day: this.stepIndex === 1 ? (this.day ? 'next day' : 'today') : null }; }
}
