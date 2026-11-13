/**
 * JatakaTradeChainScene - L02 s01 "A dead mouse and two coins" (3 beats). SvgScene, design 560 x 480 landscape,
 * 390 x 620 portrait. An old story: people in plain kurtas, a king with a crown, a small shop counter, a city.
 *   b0 The merchant tells the king (speech card) that a dead mouse can start a fortune. The poor young man (the
 *      hero, big) hands a dead mouse across a shop counter; the shopkeeper's hungry cat sits on it; two coins
 *      fly back to the young man (0.3-1.8 s). Chips: dead mouse, hungry cat, 2 coins.
 *   b1 One trade after another: a road of eight stops, each lit in turn (0.4 s apart): 2 coins, fruits and
 *      water, flowers, sold in the city, firewood (after a storm), grass for horse dealers, refreshment shop,
 *      foreign merchants (ringed: the end of the road).
 *   b2 What he did with his wealth: one heap of coins splits into two equal halves; one half slides to the
 *      merchant ("half to the merchant"), the other stays; from it a dashed line to four city homes and a well
 *      ("he helped the city").
 * Animation is CSS only; a Skip / Replay button sits in the figure (bottom right). Rest = the final frame.
 * The cat is a SimAnimal on a small canvas in the overlay (FinPeople-style slot, drawn in this file).
 * Drawn here (not in the shared kit): dead mouse, shop counter, fruit, logs, grass sheaf, crown placement.
 * Colours are tokens only. ASCII only.
 */
import { SvgScene, fill, stroke } from 'simulations/base/kit/SimSvg.js';
import { loadColors } from 'simulations/base/kit/SimLook.js';
import { drawAnimal, animalLook } from 'simulations/base/kit/SimAnimal.js';
import { iconSvg } from 'simulations/base/kit/SimIcons.js';
import { MONEY_CSS, coin, coinPile } from '../shared/MoneyKit.js';
import { PEOPLE_CSS, personSlot, paintPeople, frontSvg, registerCast } from '../shared/FinPeople.js';

const f1 = (v) => (+v).toFixed(1);
const MAIN = [[{ idx: 0, dwellMs: null }], [{ idx: 1, dwellMs: null }], [{ idx: 2, dwellMs: null }]];
const DUR = [2.6, 4.2, 2.4];

const OLD = { shoeStyle: 'sandal', shoe: 'brown', pattern: 'plain', glasses: false, dupatta: false };
registerCast('king', { name: 'King', series: 6, role: 'elder', i: 41, look: { ...OLD, outfit: 'kurta', top: 's6', bottom: 'cream', hairStyle: 'crop', moustache: true, girth: 1.12, glasses: false } });
registerCast('merchant', { name: 'Merchant', series: 4, role: 'shopkeeper', i: 42, look: { ...OLD, outfit: 'kurta', top: 's4', bottom: 'cream', hairStyle: 'sidepart', moustache: true, girth: 1.15 } });
registerCast('youngman', { name: 'Young man', series: 0, role: 'adult', i: 43, look: { ...OLD, outfit: 'kurta', top: 'stone', bottom: 'cream', hairStyle: 'short', moustache: false, girth: 0.95, sleeves: 'rolled' } });
registerCast('catkeeper', { name: 'Shopkeeper', series: 7, role: 'shopkeeper', i: 44, look: { ...OLD, outfit: 'kurta', top: 's7', bottom: 'cream', hairStyle: 'short', moustache: true, girth: 1.05 } });

const STOPS = [
  { lab: ['2 coins'], ico: 'coins' },
  { lab: ['fruits and', 'water'], ico: 'fruit' },
  { lab: ['flowers'], ico: 'flower' },
  { lab: ['sold in', 'the city'], ico: 'building' },
  { lab: ['firewood'], ico: 'logs' },
  { lab: ['grass for', 'horse dealers'], ico: 'grass' },
  { lab: ['refreshment', 'shop'], ico: 'shop' },
  { lab: ['foreign', 'merchants'], ico: 'boat' },
];

const CSS = `
.jt-card { position: absolute; box-sizing: border-box; display: flex; align-items: center; justify-content: center; text-align: center;
  padding: 8px 14px; border-radius: 16px; text-wrap: balance; font: 800 22px/1.2 var(--sim-font); color: var(--sim-label);
  background: var(--sim-bg-surface); border: 2.5px solid var(--sim-stroke); }
.jt-chip { position: absolute; transform: translate(-50%, -50%); white-space: nowrap; padding: 4px 12px; border-radius: 999px;
  font: 800 20px/1.2 var(--sim-font); color: var(--sim-label); background: var(--sim-bg-surface); border: 2.5px solid var(--sim-stroke); }
.jt-chip.acc { border-color: var(--sim-accent); background: color-mix(in oklab, var(--sim-accent) 14%, var(--sim-bg-surface)); }
.jt-btn { position: absolute; cursor: pointer; padding: 6px 14px; border-radius: calc(12px * var(--look-radius, 1));
  font: 800 18px/1.1 var(--sim-font); color: var(--sim-label); background: var(--sim-bg-surface);
  border: 2.5px solid var(--sim-stroke); box-shadow: 0 calc(3px * var(--look-lip, 1)) 0 var(--sim-stroke); }
.jt-btn:active { transform: translateY(3px); box-shadow: none; }
.jt-btn:focus-visible { outline: 3px solid var(--sim-accent); outline-offset: 3px; }
.jt-ani { position: absolute; pointer-events: none; }
.jt-ani canvas { display: block; width: 100%; height: 100%; }
.jt-in { animation: jt-in 0.5s cubic-bezier(.3,1.4,.5,1) both; animation-delay: var(--d, 0s); }
@keyframes jt-in { 0% { opacity: 0; transform: translate(-50%, -50%) scale(0.6); } 100% { opacity: 1; transform: translate(-50%, -50%); } }
svg .jt-pop { transform-box: fill-box; transform-origin: center; animation: jt-pop 0.5s cubic-bezier(.3,1.4,.5,1) both; animation-delay: var(--d, 0s); }
@keyframes jt-pop { 0% { opacity: 0; transform: scale(0.5); } 100% { opacity: 1; transform: none; } }
svg .jt-fade { animation: jt-fade 0.4s ease both; animation-delay: var(--d, 0s); }
@keyframes jt-fade { 0% { opacity: 0; } 100% { opacity: 1; } }
svg .jt-move { animation: jt-move 0.8s cubic-bezier(.4,0,.3,1) both; animation-delay: var(--d, 0s); }
@keyframes jt-move { 0% { transform: translate(var(--fx, 0px), var(--fy, 0px)); } 100% { transform: none; } }
.jt-still, .jt-still * { animation: none !important; }
@media (prefers-reduced-motion: reduce) { .jt-in, svg .jt-pop, svg .jt-fade, svg .jt-move { animation: none; } }
`;

// ---- small props drawn in this file ----
const MOUSE = 'color-mix(in oklab, var(--sim-label) 42%, var(--sim-bg-surface))';
const WOOD = 'color-mix(in oklab, var(--sim-series-8) 55%, var(--sim-label) 30%)';
const LEAF = 'color-mix(in oklab, var(--sim-good) 75%, var(--sim-label) 10%)';

function deadMouse(x, y, s = 1) {
  const rim = 'color-mix(in oklab, var(--sim-label) 70%, var(--sim-bg-surface))';
  return `<g>`
    + `<path d="M${f1(x + 20 * s)} ${f1(y - 4 * s)}q${f1(18 * s)} ${f1(-2 * s)} ${f1(22 * s)} ${f1(-14 * s)}q${f1(3 * s)} ${f1(-9 * s)} ${f1(-6 * s)} ${f1(-12 * s)}" ${stroke(rim, 3 * s)}/>`
    + `<path d="M${f1(x - 8 * s)} ${f1(y - 14 * s)}l${f1(-3 * s)} ${f1(-9 * s)}M${f1(x + 6 * s)} ${f1(y - 15 * s)}l${f1(2 * s)} ${f1(-9 * s)}" ${stroke(rim, 3 * s)}/>`
    + `<ellipse cx="${f1(x)}" cy="${f1(y - 9 * s)}" rx="${f1(21 * s)}" ry="${f1(11 * s)}" ${fill(MOUSE, `stroke:${rim};stroke-width:${f1(2.5 * s)}`)}/>`
    + `<path d="M${f1(x - 18 * s)} ${f1(y - 13 * s)}q${f1(-12 * s)} ${f1(2 * s)} ${f1(-14 * s)} ${f1(6 * s)}q${f1(6 * s)} ${f1(5 * s)} ${f1(14 * s)} ${f1(2 * s)}z" ${fill(MOUSE, `stroke:${rim};stroke-width:${f1(2.5 * s)};stroke-linejoin:round`)}/>`
    + `<circle cx="${f1(x - 15 * s)}" cy="${f1(y - 21 * s)}" r="${f1(5.5 * s)}" ${fill(MOUSE, `stroke:${rim};stroke-width:${f1(2 * s)}`)}/>`
    + `</g>`;
}

function counter(x0, x1, top, ground) {
  const rim = 'color-mix(in oklab, var(--sim-series-8) 40%, var(--sim-label) 55%)';
  let s = `<rect x="${f1(x0 - 8)}" y="${f1(top - 12)}" width="${f1(x1 - x0 + 16)}" height="14" rx="5" ${fill(WOOD, `stroke:${rim};stroke-width:2.5`)}/>`
    + `<rect x="${f1(x0)}" y="${f1(top)}" width="${f1(x1 - x0)}" height="${f1(ground - top)}" rx="4" ${fill('color-mix(in oklab, var(--sim-series-8) 40%, var(--sim-bg-surface))', `stroke:${rim};stroke-width:2.5`)}/>`;
  for (let xx = x0 + 34; xx < x1 - 10; xx += 34) s += `<path d="M${f1(xx)} ${f1(top + 6)}V${f1(ground - 4)}" ${stroke(rim, 2)} style="opacity:0.5"/>`;
  return s;
}

function icon(name, x, y, size, tone) {
  return iconSvg(name, tone).replace('width="48" height="48"', `x="${f1(x - size / 2)}" y="${f1(y - size / 2)}" width="${f1(size)}" height="${f1(size)}"`);
}

function stopArt(kind, x, y, s) {
  const r = s / 2;
  if (kind === 'coins') return coin(x - r * 0.4, y, 14.5) + coin(x + r * 0.4, y - r * 0.1, 14.5);
  if (kind === 'fruit') {
    return icon('pot', x - r * 0.28, y + r * 0.05, s * 0.78, 'var(--sim-water)')
      + `<circle cx="${f1(x + r * 0.42)}" cy="${f1(y + r * 0.38)}" r="${f1(r * 0.24)}" ${fill('var(--sim-series-6)', 'stroke:var(--sim-stroke);stroke-width:2')}/>`
      + `<circle cx="${f1(x + r * 0.7)}" cy="${f1(y + r * 0.12)}" r="${f1(r * 0.22)}" ${fill('var(--sim-series-3)', 'stroke:var(--sim-stroke);stroke-width:2')}/>`;
  }
  if (kind === 'logs') {
    const rim = 'color-mix(in oklab, var(--sim-series-8) 40%, var(--sim-label) 55%)';
    let g = icon('cloud', x + r * 0.35, y - r * 0.5, s * 0.5, 'var(--sim-label-muted)');
    [[0, 0.45], [0.5, 0.45], [0.25, 0.05]].forEach(([dx, dy]) => {
      const cx = x - r * 0.25 + dx * r * 0.9, cy = y + dy * r;
      g += `<rect x="${f1(cx - r * 0.42)}" y="${f1(cy - r * 0.17)}" width="${f1(r * 0.84)}" height="${f1(r * 0.34)}" rx="${f1(r * 0.17)}" ${fill(WOOD, `stroke:${rim};stroke-width:2`)}/>`
        + `<circle cx="${f1(cx + r * 0.42)}" cy="${f1(cy)}" r="${f1(r * 0.15)}" ${fill('color-mix(in oklab, var(--sim-series-8) 50%, var(--sim-bg-surface))', `stroke:${rim};stroke-width:2`)}/>`;
    });
    return g;
  }
  if (kind === 'grass') {
    let g = '';
    for (let i = -4; i <= 4; i++) g += `<path d="M${f1(x + i * r * 0.05)} ${f1(y + r * 0.7)}Q${f1(x + i * r * 0.1)} ${f1(y)} ${f1(x + i * r * 0.17)} ${f1(y - r * 0.75 + Math.abs(i) * r * 0.06)}" ${stroke(LEAF, 4)}/>`;
    return g + `<rect x="${f1(x - r * 0.3)}" y="${f1(y + r * 0.12)}" width="${f1(r * 0.6)}" height="${f1(r * 0.16)}" rx="4" ${fill(WOOD)}/>`;
  }
  const tones = { flower: 6, building: 'var(--sim-label-muted)', shop: 3, boat: 5 };
  return icon(kind, x, y, s * 0.9, tones[kind] ?? 1);
}

function aniSlot(kind, o) {
  const len = o.len, w = len * 1.7, h = len * 1.25, x0 = o.x - w / 2, y0 = o.y - h + len * 0.12;
  const spec = encodeURIComponent(JSON.stringify({ kind, fx: +(o.x - x0).toFixed(1), fy: +(o.y - y0).toFixed(1), len, facing: o.facing ?? 1, pose: o.pose ?? 'stand', mood: o.mood ?? 'smile' }));
  return `<div class="jt-ani${o.cls ? ` ${o.cls}` : ''}" style="left:${f1(x0)}px;top:${f1(y0)}px;width:${f1(w)}px;height:${f1(h)}px;${o.style ?? ''}"><canvas data-ani="${spec}" data-w="${f1(w)}" data-h="${f1(h)}"></canvas></div>`;
}

function paintAnimals(scene) {
  const wrap = scene?.sv?.wrap;
  if (!wrap) return;
  let c;
  try { c = loadColors(scene.root); } catch (_) { return; }
  const dpr = Math.min(3, ((typeof window !== 'undefined' && window.devicePixelRatio) || 1) * 1.5);
  for (const el of wrap.querySelectorAll('canvas[data-ani]')) {
    let s;
    try { s = JSON.parse(decodeURIComponent(el.dataset.ani)); } catch (_) { continue; }
    const w = parseFloat(el.dataset.w), h = parseFloat(el.dataset.h);
    el.width = Math.round(w * dpr); el.height = Math.round(h * dpr);
    const ctx = el.getContext('2d');
    if (!ctx) continue;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    try { drawAnimal(ctx, c, { kind: s.kind, x: s.fx, y: s.fy, length: s.len, facing: s.facing, pose: s.pose }, animalLook(c, s.kind, { mood: s.mood })); } catch (_) { /* draw nothing */ }
  }
}

const chip = (t, x, y, d, acc) => `<div class="jt-chip jt-in${acc ? ' acc' : ''}" style="left:${f1(x)}px;top:${f1(y)}px;--d:${d}s">${t}</div>`;

export class JatakaTradeChainScene extends SvgScene {
  static WIDTH = 560;
  static PORTRAIT_WIDTH = 390;
  static HEIGHT = 480;
  static PORTRAIT_HEIGHT = 620;
  static CONTINUOUS = false;
  static BEAT_STEP_MAP = MAIN;
  static BEAT_MAPS = { 3: MAIN };
  static CONTROLS = [];
  static ARIA_LABEL = 'A Jataka tale. A merchant tells the king that even a dead mouse can start a fortune. A poor young man gives a dead mouse to a shopkeeper whose cat is hungry and gets two coins. Then a road of trades: two coins, fruits and water, flowers, flowers sold in the city, firewood after a storm, grass for horse dealers, a refreshment shop, foreign merchants. At the end his heap of coins splits into two equal halves: one half goes to the merchant, and his wealth also helps homes in the city.';

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

  css() { return MONEY_CSS + PEOPLE_CSS + CSS; }

  enter() { this.restart(true); }

  restart(quiet) {
    this.still = false;
    const run = ++this.run;
    if (this._timers) this.after(DUR[this.stepIndex] ?? 2, () => { if (run === this.run) this.finish(); });
    if (!quiet) this.repaint();
  }

  finish() { this.run++; this.still = true; this.repaint(); }

  repaint() { super.repaint(); paintPeople(this); paintAnimals(this); }

  stageHeight(st) { return Math.round((st.portrait ? 620 : 480) * st.W / (st.portrait ? 390 : 560)); }

  paint(st) {
    const P = st.portrait, DW = P ? 390 : 560, DH = P ? 620 : 480, k = (st.W / DW).toFixed(4), v = this.stepIndex;
    const out = v === 1 ? this.paintRoad(P, DW, DH) : v === 2 ? this.paintWealth(P, DW, DH) : this.paintMouse(P, DW, DH);
    const still = this.still ? ' jt-still' : '';
    const pos = v === 0 ? 'left:10px;bottom:10px' : v === 2 ? 'left:10px;top:10px' : P ? 'right:10px;top:10px' : 'right:10px;bottom:10px';
    const btn = `<button type="button" class="sv-hit tap btn jt-btn" data-act="${this.still ? 'replay' : 'skip'}" style="${pos}">${this.still ? 'Replay' : 'Skip'}</button>`;
    return {
      svg: `<g class="${still}" transform="scale(${k})">${out.svg}</g>`,
      over: `<div class="${still}" style="position:absolute;left:0;top:0;width:${DW}px;height:${DH}px;overflow:hidden;transform:scale(${k});transform-origin:0 0">${out.over ?? ''}${btn}</div>`,
    };
  }

  // b0: the merchant's words, the mouse for two coins.
  paintMouse(P, DW, DH) {
    const G = P
      ? { card: [14, 14, 236, 92], king: [52, 268, 150], mer: [140, 268, 150], crown: true, line: 286,
        yo: [84, 590, 210], cx: [196, 384, 492, 590], sk: [344, 590, 180], cat: [318, 492, 78], mouse: [222, 492], coins: [[128, 424], [150, 416]], from: [190, 70], hand: [132, 436],
        chips: { mouse: [236, 524], cat: [316, 566], coins: [206, 362] } }
      : { card: [14, 14, 240, 92], king: [56, 262, 150], mer: [150, 262, 150], crown: true, line: 0,
        yo: [282, 452, 214], cx: [384, 552, 372, 452], sk: [522, 452, 190], cat: [472, 372, 82], mouse: [404, 372], coins: [[330, 262], [352, 254]], from: [190, 110], hand: [334, 274],
        chips: { mouse: [404, 318], cat: [468, 418], coins: [380, 206] } };
    let svg = '';
    // the court, top left: king and merchant, the merchant's words
    if (G.line) svg += `<path d="M14 ${G.line}H${DW - 14}" ${stroke('var(--sim-stroke)', 2)} style="stroke-dasharray:6 8;opacity:0.6"/>`;
    let over = personSlot('king', { x: G.king[0], y: G.king[1], h: G.king[2], mood: 'think' })
      + personSlot('merchant', { x: G.mer[0], y: G.mer[1], h: G.mer[2], mood: 'smile' });
    const crownSvg = icon('crown', G.king[0], G.king[1] - G.king[2] * 1.02, G.king[2] * 0.26, 'var(--sim-gold)');
    const [cx0, cy0, cw, ch] = G.card;
    over += `<div class="jt-card" style="left:${cx0}px;top:${cy0}px;width:${cw}px;height:${ch}px">"Even a dead mouse can start a fortune."</div>`;
    svg += `<path d="M${f1(G.mer[0] - 10)} ${cy0 + ch}l14 22l14 -22z" ${fill('var(--sim-bg-surface)', 'stroke:var(--sim-stroke);stroke-width:2.5;stroke-linejoin:round')}/>`;
    // the shop: shopkeeper behind the counter, the cat on it
    over += personSlot('catkeeper', { x: G.sk[0], y: G.sk[1], h: G.sk[2], facing: -1, mood: 'smile' });
    over += personSlot('youngman', { x: G.yo[0], y: G.yo[1], h: G.yo[2], facing: 1, mood: 'think', hands: [{ x: G.hand[0], y: G.hand[1] }, null] });
    const [x0, x1, top, ground] = G.cx;
    let front = crownSvg + counter(x0, x1, top, ground);
    const fx = G.hand[0] - G.mouse[0], fy = G.hand[1] - G.mouse[1] + 10;
    front += `<g class="jt-move" style="--d:0.3s;--fx:${fx}px;--fy:${fy}px">${deadMouse(G.mouse[0], G.mouse[1], P ? 1.3 : 1.45)}</g>`;
    G.coins.forEach(([x, y], i) => {
      front += `<g class="jt-move" style="--d:${1.1 + i * 0.12}s;--fx:${G.from[0]}px;--fy:${G.from[1]}px">${coin(x, y, 14.5)}</g>`;
    });
    over += frontSvg(DW, DH, front);
    over += aniSlot('cat', { x: G.cat[0], y: G.cat[1], len: G.cat[2], facing: -1, mood: 'sad', pose: 'stand' });
    over += chip('dead mouse', G.chips.mouse[0], G.chips.mouse[1], 1.0);
    over += chip('hungry cat', G.chips.cat[0], G.chips.cat[1], 0.6);
    over += chip('2 coins', G.chips.coins[0], G.chips.coins[1], 2.0, true);
    return { svg, over };
  }

  // b1: the road of trades.
  paintRoad(P, DW, DH) {
    const pts = P
      ? [[100, 78], [290, 78], [290, 222], [100, 222], [100, 366], [290, 366], [290, 510], [100, 510]]
      : [[72, 104], [204, 104], [336, 104], [468, 104], [468, 314], [336, 314], [204, 314], [72, 314]];
    const R = P ? 46 : 46, ART = P ? 64 : 64, LS = 20;
    // the road through the stops (a snake), drawn on in 3 s
    let d = `M${pts[0][0]} ${pts[0][1]}`;
    for (let i = 1; i < pts.length; i++) {
      const [a, b] = pts[i - 1], [x, y] = pts[i];
      if (b === y) d += `L${x} ${y}`;
      else { const side = P ? (a > 200 ? 1 : -1) : 1, bulge = P ? 70 : 76; d += `C${a + side * bulge} ${b} ${x + side * bulge} ${y} ${x} ${y}`; }
    }
    const ROAD = 'color-mix(in oklab, var(--sim-series-8) 26%, var(--sim-bg-surface))';
    let svg = `<path d="${d}" ${stroke(ROAD, 30)} style="stroke-linecap:round;stroke-linejoin:round"/>`
      + `<path class="sv-draw" d="${d}" ${stroke('var(--sim-accent)', 4)} style="--len:2200;--dur:3.2s;--d:0.2s;stroke-dasharray:2200;stroke-linecap:round"/>`;
    let over = '';
    pts.forEach(([x, y], i) => {
      const s = STOPS[i], last = i === pts.length - 1, del = (0.2 + i * 0.4).toFixed(2);
      svg += `<g class="jt-pop" style="--d:${del}s">`
        + `<circle cx="${x}" cy="${y + 3}" r="${R}" ${fill('var(--sim-stroke)')}/>`
        + `<circle cx="${x}" cy="${y}" r="${R}" ${fill('var(--sim-bg-surface)', `stroke:${last ? 'var(--sim-accent)' : 'var(--sim-stroke)'};stroke-width:${last ? 5 : 2.5}`)}/>`
        + stopArt(s.ico, x, y, ART)
        + `</g>`;
      const ly = y + R + 22;
      svg += `<g class="jt-fade" style="--d:${del}s">` + s.lab.map((t, j) => `<text x="${x}" y="${ly + j * 25}" text-anchor="middle" style="fill:var(--sim-label);font:800 ${LS}px var(--sim-font)">${t}</text>`).join('') + `</g>`;
    });
    // the first stop's small number badge and the road's direction
    svg += `<g class="jt-fade" style="--d:0.2s"><text x="${pts[0][0]}" y="${pts[0][1] - R - 10}" text-anchor="middle" style="fill:var(--sim-label-muted);font:800 18px var(--sim-font)">start</text></g>`;
    return { svg, over };
  }

  // b2: half to the merchant, help for the city.
  paintWealth(P, DW, DH) {
    const G = P
      ? { mer: [58, 600, 180], yo: [334, 600, 180], pl: [158, 596], pr: [244, 596], homes: [70, 120], hw: 250, well: [330, 120], r: 11,
        chips: { half: [150, 370], city: [250, 40] }, line: [244, 470, 244, 168] }
      : { mer: [80, 452, 200], yo: [480, 452, 200], pl: [212, 412], pr: [346, 412], homes: [276, 86], hw: 210, well: [516, 86], r: 14,
        chips: { half: [212, 266], city: [380, 30] }, line: [346, 268, 346, 136] };
    let svg = '';
    // the city: four homes and a well, top right
    for (let i = 0; i < 4; i++) {
      const hx = G.homes[0] + i * (G.hw / 4) + G.hw / 8;
      svg += `<g class="jt-pop" style="--d:${(1.4 + i * 0.12).toFixed(2)}s">${icon('house', hx, G.homes[1], 58, [2, 3, 5, 6][i])}</g>`;
    }
    svg += `<g class="jt-pop" style="--d:1.9s">${icon('well', G.well[0], G.well[1], 54, 'var(--sim-water)')}</g>`;
    const [lx0, ly0, lx1, ly1] = G.line;
    svg += `<path class="jt-fade" d="M${lx0} ${ly0}V${ly1}" ${stroke('var(--sim-accent)', 4)} style="--d:1.3s;stroke-dasharray:8 8"/>`
      + `<path class="jt-fade" d="M${lx1 - 10} ${ly1 + 14}l10 -14l10 14" ${stroke('var(--sim-accent)', 4)} style="--d:1.3s;stroke-linejoin:round"/>`;
    // two equal halves, slid out from one heap in the middle
    const mid = (G.pl[0] + G.pr[0]) / 2;
    let front = `<g class="jt-move" style="--d:0.4s;--fx:${f1(mid - G.pl[0])}px;--fy:0px">${coinPile(G.pl[0], G.pl[1], 1000, { r: G.r })}</g>`
      + `<g class="jt-move" style="--d:0.4s;--fx:${f1(mid - G.pr[0])}px;--fy:0px">${coinPile(G.pr[0], G.pr[1], 1000, { r: G.r })}</g>`;
    // a dashed cut between the halves
    front += `<path class="jt-fade" d="M${f1(mid)} ${G.pl[1] - 110}V${G.pl[1] + 6}" ${stroke('var(--sim-label-muted)', 3)} style="--d:1.1s;stroke-dasharray:6 7"/>`;
    // half goes to the merchant: an arrow from the left half to him
    const ax0 = P ? G.pl[0] + 22 : G.pl[0] - 52, ax1 = G.mer[0] + 44, ay = P ? G.pl[1] - 84 : G.pl[1] - 40;
    front += `<path class="jt-fade" d="M${ax0} ${ay}H${ax1}" ${stroke('var(--sim-accent)', 4)} style="--d:1.1s"/>`
      + `<path class="jt-fade" d="M${ax1 + 14} ${ay - 12}l-14 12l14 12" ${stroke('var(--sim-accent)', 4)} style="--d:1.1s;stroke-linejoin:round"/>`;
    let over = personSlot('merchant', { x: G.mer[0], y: G.mer[1], h: G.mer[2], mood: 'happy' })
      + personSlot('youngman', { x: G.yo[0], y: G.yo[1], h: G.yo[2], mood: 'happy' });
    over += frontSvg(DW, DH, front);
    over += chip('half to the merchant', G.chips.half[0], G.chips.half[1], 1.2, true);
    over += chip('he helped the city', G.chips.city[0], G.chips.city[1], 1.6);
    return { svg, over };
  }

  testState() { return { view: this.stepIndex, still: this.still }; }
}
