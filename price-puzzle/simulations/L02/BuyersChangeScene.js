/**
 * BuyersChangeScene - L02 s05 "Income, Taste and Population" (3 beats). SvgScene, design units 560 x 480
 * landscape, 390 x 620 portrait. People: shared/MangoPeople.js (Srivalli from CAST; the family and the three
 * groups are registered here with registerCast, roles adult / child / worker / elder).
 *   b0 income: a family (a parent and a child) and two shopping baskets, "before" and "income rises". After:
 *      more mangoes ("more"), one plain pack in place of two ("less") and two better packs ("better"). Plays on
 *      entry; "replay".
 *   b1 taste: Srivalli between a mango stall (Rs 100 / kg) and an orange stall whose board says "lower price".
 *      She stays at the mangoes (a tick over them). Tap the orange board: "even lower"; she still stays.
 *   b2 population: children, working adults and elderly people (3 each), each over its pile of shoes: sports,
 *      formal, comfortable. Tap a group: it grows to 5 and its shoe pile grows to 5; "more people, more demand".
 *      Plays once on entry (the children grow).
 * Shoes are drawn here as SVG (after the econ ShoeBuyersScene shapes). Colours are tokens only. ASCII only.
 */
import { SvgScene, fill, stroke, shade } from 'simulations/base/kit/SimSvg.js';
import { civicSvg } from 'simulations/base/kit/SimCivic.js';
import { MANGO_CSS, RS, heap, basket, priceBoard } from '../shared/MangoKit.js';
import { PEOPLE_CSS, personSlot, paintPeople, nameTag, frontSvg, registerCast } from '../shared/MangoPeople.js';
import { BTN_CSS, txt, pill, btn } from '../shared/MarketParts.js';

const f1 = (v) => (+v).toFixed(1);
const DN = '\u2193';
const MAP = [[{ idx: 0, dwellMs: null }], [{ idx: 1, dwellMs: null }], [{ idx: 2, dwellMs: null }]];
const GOOD = 'var(--sim-good)';
const BAD = 'var(--sim-bad)';

registerCast('famA', { name: 'parent', role: 'adult', i: 4, look: { outfit: 'shirt', hairStyle: 'sidepart', top: 's7', bottom: 'khaki', shoeStyle: 'shoe', pattern: 'plain', moustache: true, glasses: false, dupatta: false } });
registerCast('famK', { name: 'child', role: 'child', i: 8, look: { outfit: 'tee', hairStyle: 'short', top: 's8', bottom: 'denim', bottomStyle: 'shorts', pattern: 'plain', glasses: false, dupatta: false } });
for (let n = 1; n <= 5; n++) {
  registerCast(`kid${n}`, { name: 'child', role: 'child', i: 40 + n * 3 });
  registerCast(`wrk${n}`, { name: 'adult', role: 'worker', i: 50 + n * 3 });
  registerCast(`eld${n}`, { name: 'elder', role: 'elder', i: 60 + n * 3 });
}
const GROUPS = [
  { key: 'kid', h: 0.62, shoe: 'sports', lab: 'sports' },
  { key: 'wrk', h: 1, shoe: 'formal', lab: 'formal' },
  { key: 'eld', h: 0.94, shoe: 'comfy', lab: 'comfortable' },
];

const CSS = `
svg .bc-flip { transform-box: fill-box; transform-origin: center; animation: bc-flip 0.45s ease-out both; }
@keyframes bc-flip { 0% { transform: scaleY(0.05); } 100% { transform: none; } }
@media (prefers-reduced-motion: reduce) { svg .bc-flip { animation: none; } }
`;

const stallArt = (cx, gy, w) => civicSvg('stall', cx, gy, { w }).replace(/<g data-part="goods"[^>]*>[\s\S]*?<\/g>/g, '');

/** One shoe, side view, toe right; (x, y) ground centre, w its length. kind: sports formal comfy. */
function shoe(kind, x, y, w) {
  const x0 = x - w / 2, P = (fx, fy) => `${f1(x0 + fx * w)} ${f1(y + fy * w)}`;
  let s = `<ellipse cx="${f1(x)}" cy="${f1(y + 2)}" rx="${f1(w * 0.5)}" ry="${f1(w * 0.05)}" ${fill('var(--sim-label)', 'opacity:0.14')}/>`;
  if (kind === 'sports') {
    const body = 'var(--sim-series-1)', sole = 'color-mix(in oklab, var(--sim-series-2) 45%, var(--sim-bg-surface))';
    s += `<path d="M${P(0, -0.2)}L${P(1.02, -0.2)}Q${P(1.06, -0.1)} ${P(1, -0.03)}L${P(0, -0.03)}Z" ${fill(sole, `stroke:${shade(sole, 65)};stroke-width:2.5`)}/>`;
    s += `<path d="M${P(0.02, -0.2)}L${P(0.04, -0.58)}Q${P(0.18, -0.64)} ${P(0.3, -0.56)}Q${P(0.55, -0.44)} ${P(0.8, -0.38)}Q${P(1.04, -0.34)} ${P(1.02, -0.2)}Z" ${fill(body, `stroke:${shade(body, 60)};stroke-width:2.5`)}/>`;
    s += `<path d="M${P(0.3, -0.24)}L${P(0.42, -0.46)}M${P(0.43, -0.24)}L${P(0.55, -0.44)}" ${stroke('var(--sim-bg-surface)', Math.max(3, w * 0.05))}/>`;
    s += `<path d="M${P(0.02, -0.11)}H${f1(x0 + w)}" ${stroke(shade(sole, 75), 2)}/>`;
  } else if (kind === 'formal') {
    const body = 'color-mix(in oklab, var(--sim-series-8) 40%, black)', sole = shade(body, 55);
    s += `<rect x="${f1(x0 + w * 0.02)}" y="${f1(y - w * 0.12)}" width="${f1(w * 0.18)}" height="${f1(w * 0.12)}" rx="3" ${fill(sole)}/>`;
    s += `<path d="M${P(0.2, -0.05)}L${P(0.9, -0.04)}Q${P(1.08, -0.04)} ${P(1.08, -0.08)}L${P(0.2, -0.1)}Z" ${fill(sole)}/>`;
    s += `<path d="M${P(0.02, -0.1)}L${P(0.04, -0.36)}Q${P(0.2, -0.4)} ${P(0.34, -0.35)}Q${P(0.62, -0.28)} ${P(0.86, -0.18)}Q${P(1.1, -0.1)} ${P(1.06, -0.08)}L${P(0.2, -0.1)}Z" ${fill(body, `stroke:${shade(body, 60)};stroke-width:2.5`)}/>`;
    s += `<path d="M${P(0.7, -0.2)}Q${P(0.84, -0.18)} ${P(0.94, -0.13)}" ${stroke('color-mix(in oklab, var(--sim-bg-surface) 70%, transparent)', Math.max(3, w * 0.05))}/>`;
    s += `<path d="M${P(0.36, -0.36)}L${P(0.4, -0.31)}M${P(0.42, -0.335)}L${P(0.46, -0.285)}" ${stroke('color-mix(in oklab, var(--sim-bg-surface) 55%, transparent)', 2.5)}/>`;
  } else {
    // comfortable: a soft slip-on with a thick cushioned sole and a wide strap
    const body = 'color-mix(in oklab, var(--sim-series-8) 40%, var(--sim-bg-surface))', sole = 'color-mix(in oklab, var(--sim-bg-surface) 85%, var(--sim-series-8))';
    s += `<path d="M${P(0, -0.04)}Q${P(-0.02, -0.17)} ${P(0.08, -0.17)}L${P(0.92, -0.16)}Q${P(1.04, -0.15)} ${P(1.02, -0.04)}Z" ${fill(sole, `stroke:${shade(sole, 60)};stroke-width:2.5`)}/>`;
    s += `<path d="M${P(0.04, -0.17)}L${P(0.06, -0.36)}Q${P(0.2, -0.42)} ${P(0.4, -0.38)}Q${P(0.7, -0.33)} ${P(0.9, -0.26)}Q${P(1.02, -0.2)} ${P(0.98, -0.16)}Z" ${fill(body, `stroke:${shade(body, 55)};stroke-width:2.5`)}/>`;
    s += `<path d="M${P(0.36, -0.38)}L${P(0.36, -0.17)}M${P(0.52, -0.355)}L${P(0.52, -0.17)}" ${stroke(shade(body, 70), Math.max(3, w * 0.05))}/>`;
  }
  return s;
}

/** A pile of n shoes: rows of up to 3, (x, y) the ground centre, w one shoe. */
function pile(kind, x, y, n, w, popFrom = 99) {
  let s = '';
  for (let i = 0; i < n; i++) {
    const row = Math.floor(i / 3), inRow = Math.min(3, n - row * 3), j = i % 3;
    const sx = x + (j - (inRow - 1) / 2) * w * 0.95 + (row % 2 ? w * 0.18 : 0), sy = y - row * w * 0.42;
    const sh = shoe(kind, sx, sy, w);
    s += i >= popFrom ? `<g class="mq-pop" style="--d:${f1(0.3 + (i - popFrom) * 0.15)}s">${sh}</g>` : sh;
  }
  return s;
}

/** A pack: plain (a dull paper bag) or better (a bright box with a band). (x, y) bottom centre, h height. */
function pack(kind, x, y, h) {
  const w = h * 0.7;
  if (kind === 'plain') {
    const col = 'color-mix(in oklab, var(--sim-label-muted) 30%, var(--sim-bg-surface))';
    return `<path d="M${f1(x - w / 2)} ${f1(y)}L${f1(x - w / 2 + 3)} ${f1(y - h)}L${f1(x - w * 0.3)} ${f1(y - h - h * 0.08)}L${f1(x - w * 0.1)} ${f1(y - h)}L${f1(x + w * 0.1)} ${f1(y - h - h * 0.08)}L${f1(x + w * 0.3)} ${f1(y - h)}L${f1(x + w / 2 - 3)} ${f1(y - h)}L${f1(x + w / 2)} ${f1(y)}Z" ${fill(col, `stroke:${shade(col, 60)};stroke-width:2.5`)}/>`;
  }
  const col = 'var(--sim-series-4)', band = 'var(--sim-series-2)';
  return `<rect x="${f1(x - w / 2)}" y="${f1(y - h)}" width="${f1(w)}" height="${f1(h)}" rx="6" ${fill(col, `stroke:${shade(col, 60)};stroke-width:2.5`)}/>`
    + `<rect x="${f1(x - w / 2)}" y="${f1(y - h * 0.6)}" width="${f1(w)}" height="${f1(h * 0.22)}" ${fill(band)}/>`
    + `<path d="M${f1(x)} ${f1(y - h * 0.9)}l${f1(h * 0.06)} ${f1(h * 0.12)}l${f1(h * 0.13)} ${f1(h * 0.02)}l${f1(-h * 0.1)} ${f1(h * 0.09)}l${f1(h * 0.03)} ${f1(h * 0.13)}l${f1(-h * 0.12)} ${f1(-h * 0.07)}l${f1(-h * 0.12)} ${f1(h * 0.07)}l${f1(h * 0.03)} ${f1(-h * 0.13)}l${f1(-h * 0.1)} ${f1(-h * 0.09)}l${f1(h * 0.13)} ${f1(-h * 0.02)}Z" ${fill('var(--sim-bg-surface)')}/>`;
}

/** A heap of oranges on the counter: (x, y) bottom centre. */
function oranges(x, y, r) {
  const col = 'var(--sim-series-8)';
  let s = '';
  [[4, 0], [3, 1], [2, 2]].forEach(([m, row]) => {
    for (let j = 0; j < m; j++) {
      const cx = x + (j - (m - 1) / 2) * r * 2.1, cy = y - r - row * r * 1.6;
      s += `<circle cx="${f1(cx)}" cy="${f1(cy)}" r="${f1(r)}" ${fill(col, `stroke:${shade(col, 68)};stroke-width:1.6`)}/>`
        + `<circle cx="${f1(cx - r * 0.35)}" cy="${f1(cy - r * 0.35)}" r="${f1(r * 0.25)}" ${fill('color-mix(in oklab, var(--sim-series-8) 50%, white)', 'opacity:0.7')}/>`;
    }
  });
  return s;
}

function tick(x, y, r) {
  return `<circle cx="${f1(x)}" cy="${f1(y)}" r="${r}" ${fill(GOOD, 'stroke:var(--sim-bg-surface);stroke-width:3')}/>`
    + `<path d="M${f1(x - r * 0.45)} ${f1(y + r * 0.02)}L${f1(x - r * 0.1)} ${f1(y + r * 0.38)}L${f1(x + r * 0.5)} ${f1(y - r * 0.35)}" ${stroke('var(--sim-bg-deep)', r * 0.24)}/>`;
}

export class BuyersChangeScene extends SvgScene {
  static WIDTH = 560;
  static PORTRAIT_WIDTH = 390;
  static HEIGHT = 480;
  static PORTRAIT_HEIGHT = 620;
  static CONTINUOUS = false;
  static BEAT_STEP_MAP = MAP;
  static BEAT_MAPS = { 3: MAP };
  static CONTROLS = [];
  static ARIA_LABEL = 'Income: a family\'s basket before and after their income rises: after, more mangoes, fewer plain packs and more of a better pack. Taste: Srivalli stands between a mango stall at 100 rupees a kg and an orange stall with a lower price; she likes mangoes and stays with them, even when the orange price falls further. Population: children, working adults and elderly people each over a pile of shoes (sports, formal, comfortable); when a group grows, its pile of shoes grows: more people, more demand.';

  async setup() {
    this.after0 = true;
    this.orange = 1;
    this.grown = [true, false, false];
    this.anim = false;
    await super.setup();
    this._onClick = (e) => {
      const b = e.target?.closest?.('[data-act]');
      if (b) this.act(b.dataset.act, b.dataset.val);
    };
    this.root.addEventListener('click', this._onClick);
  }

  destroy() {
    this.root?.removeEventListener('click', this._onClick);
    super.destroy();
  }

  css() { return MANGO_CSS + PEOPLE_CSS + BTN_CSS + CSS; }

  repaint() { super.repaint(); paintPeople(this); }

  clear() { for (const t of (this._timers ?? []).splice(0)) clearTimeout(t); this.anim = false; this.fresh = false; this.popAt = -1; }

  enter(step) {
    this.clear();
    this.after0 = true;
    this.orange = 1;
    this.grown = [true, false, false];
    this.last = 0;
    if (step === 0) { this.after0 = false; this.anim = true; this.after(0.8, () => this.rise()); }
    else if (step === 2) { this.grown = [false, false, false]; this.anim = true; this.after(0.8, () => this.grow(0)); }
  }

  rise() {
    this.clear();
    this.after0 = true;
    this.fresh = true;
    this.anim = true;
    this.repaint();
    this.fresh = false;
    this.after(1.6, () => { this.anim = false; this.repaint(); });
  }

  grow(i) {
    this.clear();
    const on = !this.grown[i];
    this.grown = this.grown.map((g, j) => (j === i ? on : g));
    this.last = i;
    this.popAt = on ? i : -1;
    this.anim = on;
    this.repaint();
    this.popAt = -1;
    if (on) this.after(1.2, () => { this.anim = false; this.repaint(); });
  }

  act(a, v) {
    const s = this.stepIndex;
    if (s === 0 && a === 'rise') this.rise();
    else if (s === 0 && a === 'again') { this.clear(); this.after0 = false; this.repaint(); }
    else if (s === 1 && a === 'orange') { this.orange = this.orange === 1 ? 2 : 1; this.fresh = true; this.repaint(); this.fresh = false; }
    else if (s === 2 && a === 'group') this.grow(Number(v));
  }

  skip() {
    if (!this.anim) return false;
    this.clear();
    this.after0 = true;
    if (this.stepIndex === 2 && !this.grown.some(Boolean)) this.grown = [true, false, false];
    this.repaint();
    return true;
  }

  busy() { return this.anim; }

  stageHeight(st) { return Math.round((st.portrait ? 620 : 480) * st.W / (st.portrait ? 390 : 560)); }

  paint(st) {
    const P = st.portrait, DW = P ? 390 : 560, DH = P ? 620 : 480, k = (st.W / DW).toFixed(4), v = this.stepIndex;
    const out = v === 2 ? this.paintPeople2(P) : v === 1 ? this.paintTaste(P, DW, DH) : this.paintIncome(P);
    return { svg: `<g transform="scale(${k})">${out.svg}</g>`, over: `<div style="position:absolute;left:0;top:0;width:${DW}px;height:${DH}px;transform:scale(${k});transform-origin:0 0">${out.over ?? ''}</div>` };
  }

  // b0: the family and its basket before / after income rises.
  paintIncome(P) {
    let svg = '', over = '';
    const G = P
      ? { fam: [[150, 300, 176], [236, 300, 112]], cols: [110, 290], head: 344, bk: 500, bw: 120, pk: 584, ph: 60, go: [64, 60], tags: 610 }
      : { fam: [[64, 420, 210], [150, 420, 132]], cols: [290, 448], head: 44, bk: 260, bw: 130, pk: 388, ph: 70, go: [380, 452], tags: 420 };
    G.fam.forEach(([x, y, h], i) => {
      over += personSlot(i ? 'famK' : 'famA', { x, y, h, pose: 'stand', facing: P ? 0 : 1, mood: this.after0 ? 'happy' : 'smile' });
    });
    const [bx, ax] = G.cols, done = this.after0;
    svg += pill(bx, G.head, 'before', { size: P ? 20 : 22 });
    svg += pill(ax, G.head, 'income rises', { size: P ? 20 : 22, bg: GOOD, ink: 'var(--sim-bg-deep)', edge: GOOD });
    // fruit row
    svg += basket(bx, G.bk, 1, { w: G.bw });
    svg += basket(ax, G.bk, done ? 3 : 0, { w: G.bw, fromKg: this.fresh ? 0 : undefined, per: 0.25, dim: !done });
    // packs row: before 2 plain; after 1 plain and 2 better
    const gap = G.ph * 0.82;
    svg += pack('plain', bx - gap / 2, G.pk, G.ph) + pack('plain', bx + gap / 2, G.pk, G.ph);
    if (done) {
      const pop = (d) => (this.fresh ? ` class="mq-pop" style="--d:${d}s"` : '');
      svg += pack('plain', ax - gap, G.pk, G.ph);
      svg += `<g${pop(0.9)}>${pack('better', ax + gap * 0.15, G.pk, G.ph)}${pack('better', ax + gap * 1.05, G.pk, G.ph)}</g>`;
      if (!this.anim || !this.fresh) {
        const lp = this.anim ? ' class="mq-fade" style="--d:1.2s"' : '';
        svg += `<g${lp}>${pill(ax + G.bw * 0.5 + (P ? -6 : 20), G.bk - G.bw * 0.62, 'more', { size: P ? 19 : 21, bg: GOOD, ink: 'var(--sim-bg-deep)', edge: GOOD })}`
          + pill(ax - gap, G.pk + (P ? 22 : 26), 'less', { size: P ? 17 : 19, bg: BAD, ink: 'var(--sim-bg-deep)', edge: BAD })
          + pill(ax + gap * 0.6, G.pk + (P ? 22 : 26), 'better', { size: P ? 17 : 19, bg: GOOD, ink: 'var(--sim-bg-deep)', edge: GOOD }) + '</g>';
      }
    } else svg += txt(ax, G.pk - G.ph * 0.4, '?', 44, 'var(--sim-label-muted)');
    if (!done) over += btn('rise', 'income rises', G.go[0], G.go[1], { go: true });
    else if (!this.anim) over += btn('again', 'replay', G.go[0], G.go[1]);
    return { svg, over };
  }

  // b1: Srivalli between the mango stall and the orange stall.
  paintTaste(P, DW, DH) {
    let svg = '', over = '', front = '';
    const G = P
      ? { m: [104, 300, 196], o: [290, 300, 196], bm: [104, 46], bo: [290, 46], sv: [196, 556, 188], tk: [170, 132], lab: 604, name: 322 }
      : { m: [128, 330, 222], o: [440, 330, 222], bm: [128, 44], bo: [440, 44], sv: [286, 418, 196], tk: [216, 144], lab: 468, name: 352 };
    const [mx, mgy, mw] = G.m, [ox, ogy, ow] = G.o, sm = mw / 230;
    svg += stallArt(mx, mgy, mw) + heap(mx, mgy - 84 * sm, 3, { r: P ? 9.5 : 11 });
    svg += stallArt(ox, ogy, ow) + oranges(ox, mgy - 84 * sm, P ? 10 : 11.5);
    svg += priceBoard(G.bm[0], G.bm[1], 100, { w: P ? 156 : 170, h: 60 });
    // the orange board: no made-up number, only "lower" / "even lower"
    const ob = `<rect x="${f1(G.bo[0] - (P ? 80 : 88))}" y="${f1(G.bo[1] - 30)}" width="${P ? 160 : 176}" height="60" rx="14" ${fill('color-mix(in oklab, var(--sim-accent) 12%, var(--sim-bg-surface))', 'stroke:var(--sim-accent);stroke-width:3.5')}/>`
      + txt(G.bo[0], G.bo[1] + 9, this.orange === 2 ? `even lower ${DN}` : `lower price ${DN}`, P ? 22 : 24, BAD);
    svg += `<g${this.fresh ? ' class="bc-flip"' : ''}>${ob}</g>`;
    over += `<button type="button" class="sv-hit tap btn mq-hit" data-act="orange" aria-label="the orange price falls" style="left:${G.bo[0] - 92}px;top:${G.bo[1] - 36}px;width:184px;height:76px"></button>`;
    svg += pill(mx, G.name, 'mangoes', { size: P ? 18 : 20 }) + pill(ox, G.name, 'oranges', { size: P ? 18 : 20 });
    svg += tick(G.tk[0], G.tk[1], P ? 20 : 24);
    // Srivalli, facing the mango stall, holding her basket of mangoes
    const [sx, sy, H] = G.sv, bw = P ? 80 : 88, bBot = sy - H * 0.1, grip = bBot - bw * 0.5 - bw * 0.33;
    over += personSlot('srivalli', { x: sx, y: sy, h: H, pose: 'stand', facing: 0, mood: 'happy', hands: [{ x: sx + bw * 0.2, y: grip }, { x: sx - bw * 0.2, y: grip }] });
    front += basket(sx, bBot, 2, { w: bw });
    svg += nameTag(sx, sy + 6, 'srivalli', P ? 16 : 17);
    svg += txt(P ? 195 : 280, G.lab, this.orange === 2 ? 'she still buys mangoes' : 'tap the orange price', P ? 20 : 21, this.orange === 2 ? GOOD : 'var(--sim-label-muted)');
    over += frontSvg(DW, DH, front);
    return { svg, over };
  }

  // b2: three groups over their shoe piles.
  paintPeople2(P) {
    let svg = '', over = '';
    const L = P
      ? GROUPS.map((_, i) => ({ px: 104, gy: 186 + i * 190, sx: 286, sy: 166 + i * 190, lx: 286, ly: 196 + i * 190, sw: 62, sp: 28, H: 136, box: [6, 16 + i * 190, 378, 184] }))
      : GROUPS.map((_, i) => ({ px: 94 + i * 186, gy: 262, sx: 94 + i * 186, sy: 392, lx: 94 + i * 186, ly: 428, sw: 66, sp: 30, H: 168, box: [6 + i * 186, 66, 176, 384] }));
    GROUPS.forEach((g, i) => {
      const l = L[i], n = this.grown[i] ? 5 : 3, pop = this.popAt === i;
      for (let j = n - 1; j >= 0; j--) {
        const x = l.px + (j - (n - 1) / 2) * l.sp;
        over += personSlot(`${g.key}${j + 1}`, { x, y: l.gy - (j % 2) * 8, h: l.H * g.h, pose: 'stand', facing: 0, mood: 'smile', cls: pop && j >= 3 ? 'mpp-pop' : '', style: pop && j >= 3 ? `--d:${f1((j - 3) * 0.15)}s` : '' });
      }
      svg += pile(g.shoe, l.sx, l.sy, n, l.sw, pop ? 3 : 99);
      svg += txt(l.lx, l.ly, g.lab, P ? 21 : 22, this.grown[i] ? GOOD : 'var(--sim-label)');
      over += `<button type="button" class="sv-hit tap btn mq-hit" data-act="group" data-val="${i}" aria-label="${g.lab} shoes: ${['children', 'working adults', 'elderly people'][i]} grow in number" aria-pressed="${this.grown[i] ? 'true' : 'false'}" style="left:${l.box[0]}px;top:${l.box[1]}px;width:${l.box[2]}px;height:${l.box[3]}px"></button>`;
    });
    const any = this.grown.some(Boolean), i = this.last;
    const cx = P ? 195 : Math.max(150, Math.min(410, L[i].px));
    if (any) svg += pill(cx, P ? 600 : 32, 'more people, more demand', { size: P ? 20 : 22, bg: GOOD, ink: 'var(--sim-bg-deep)', edge: GOOD });
    else svg += txt(P ? 195 : 280, P ? 606 : 38, 'tap a group', 20, 'var(--sim-label-muted)');
    return { svg, over };
  }

  testState() { return { step: this.stepIndex, after: this.after0, orange: this.orange, grown: this.grown.slice(), rs: RS }; }
}
