/**
 * OberoiTimelineScene - L02 s05 "A desk clerk in Shimla" (3 beats). SvgScene, design 560 x 480 landscape,
 * 390 x 620 portrait. A real person: no portrait likeness (a generic SimFigure man in period clothes, named by a
 * label), no logo, no real hotel building copied (the hotels are plain generic buildings, no signs).
 *   b0 The front desk of a hotel in Shimla (hills in the window). Mohan Singh Oberoi, big, behind the desk; a
 *      pay card "Rs 50 a month"; three things he learned pop in beside the thing each belongs to: guest service
 *      (by the guest and the bell), billing (by the bill book), administration (by the room keys).
 *   b1 1934, the big risk: his savings slide right to a small hotel; his wife's jewellery sits in a dashed
 *      "mortgage" box (kept as security) and a loan of coins flies out of it to the hotel.
 *   b2 One hotel grows into a chain: hotels pop in one after another along a line from 1934; under the line
 *      three marks: a hotel school, other countries, the Padma Bhushan in 2001.
 * No made-up amounts: only the numbers in the text (Rs 50, 1934, 2001). Animation is CSS only; a Skip / Replay
 * button sits in the figure. Rest = the final frame.
 * Drawn here (not in the shared kit): hotel, front desk, key board, bell, bill book, window, jewellery box, medal.
 * Colours are tokens only. ASCII only.
 */
import { SvgScene, fill, stroke } from 'simulations/base/kit/SimSvg.js';
import { iconSvg } from 'simulations/base/kit/SimIcons.js';
import { MONEY_CSS, RS, coin, coinPile } from '../shared/MoneyKit.js';
import { PEOPLE_CSS, personSlot, paintPeople, frontSvg, registerCast } from '../shared/FinPeople.js';

const f1 = (v) => (+v).toFixed(1);
const MAIN = [[{ idx: 0, dwellMs: null }], [{ idx: 1, dwellMs: null }], [{ idx: 2, dwellMs: null }]];
const DUR = [2.4, 2.6, 3.2];

// The same man in s05 and s07 (ThreeStartsScene registers the same entry).
registerCast('oberoi', { name: 'M. S. Oberoi', series: 0, role: 'adult', i: 61,
  look: { outfit: 'coat', top: 'navy', bottom: 'cream', hairStyle: 'sidepart', moustache: true, shoeStyle: 'shoe', shoe: 'brown', pattern: 'plain', glasses: false, dupatta: false, girth: 1, sleeves: 'long' } });
registerCast('hotelguest', { name: 'Guest', series: 0, role: 'elder', i: 62,
  look: { outfit: 'kurta', top: 'sage', bottom: 'cream', hairStyle: 'crop', moustache: true, shoeStyle: 'sandal', shoe: 'brown', pattern: 'plain', glasses: true, dupatta: false, girth: 1.08 } });

const CSS = `
.ob-chip { position: absolute; transform: translate(-50%, -50%); white-space: nowrap; display: flex; align-items: center; gap: 6px;
  padding: 4px 12px; border-radius: 999px; font: 800 20px/1.2 var(--sim-font); color: var(--sim-label);
  background: var(--sim-bg-surface); border: 2.5px solid var(--sim-stroke); }
.ob-chip.acc { border-color: var(--sim-accent); background: color-mix(in oklab, var(--sim-accent) 14%, var(--sim-bg-surface)); }
.ob-chip.big { font-size: 26px; padding: 4px 14px; }
.ob-chip svg { width: 28px; height: 28px; flex: none; }
.ob-btn { position: absolute; cursor: pointer; padding: 6px 14px; border-radius: calc(12px * var(--look-radius, 1));
  font: 800 18px/1.1 var(--sim-font); color: var(--sim-label); background: var(--sim-bg-surface);
  border: 2.5px solid var(--sim-stroke); box-shadow: 0 calc(3px * var(--look-lip, 1)) 0 var(--sim-stroke); }
.ob-btn:active { transform: translateY(3px); box-shadow: none; }
.ob-btn:focus-visible { outline: 3px solid var(--sim-accent); outline-offset: 3px; }
.ob-in { animation: ob-in 0.5s cubic-bezier(.3,1.4,.5,1) both; animation-delay: var(--d, 0s); }
@keyframes ob-in { 0% { opacity: 0; transform: translate(-50%, -50%) scale(0.6); } 100% { opacity: 1; transform: translate(-50%, -50%); } }
svg .ob-pop { transform-box: fill-box; transform-origin: 50% 100%; animation: ob-pop 0.5s cubic-bezier(.3,1.4,.5,1) both; animation-delay: var(--d, 0s); }
@keyframes ob-pop { 0% { opacity: 0; transform: scale(0.4); } 100% { opacity: 1; transform: none; } }
svg .ob-fade { animation: ob-fade 0.4s ease both; animation-delay: var(--d, 0s); }
@keyframes ob-fade { 0% { opacity: 0; } 100% { opacity: 1; } }
svg .ob-move { animation: ob-move 0.8s cubic-bezier(.4,0,.3,1) both; animation-delay: var(--d, 0s); }
@keyframes ob-move { 0% { transform: translate(var(--fx, 0px), var(--fy, 0px)); opacity: 0.3; } 100% { transform: none; opacity: 1; } }
.ob-still, .ob-still * { animation: none !important; }
@media (prefers-reduced-motion: reduce) { .ob-in, svg .ob-pop, svg .ob-fade, svg .ob-move { animation: none; } }
`;

// ---- props drawn in this file ----
const WOOD = 'color-mix(in oklab, var(--sim-series-8) 55%, var(--sim-label) 30%)';
const WOOD_LT = 'color-mix(in oklab, var(--sim-series-8) 40%, var(--sim-bg-surface))';
const RIM = 'color-mix(in oklab, var(--sim-series-8) 40%, var(--sim-label) 55%)';
const GOLD = 'var(--sim-gold)';
const GOLD_RIM = 'color-mix(in oklab, var(--sim-gold) 55%, var(--sim-label))';

function icon(name, x, y, size, tone) {
  return iconSvg(name, tone).replace('width="48" height="48"', `x="${f1(x - size / 2)}" y="${f1(y - size / 2)}" width="${f1(size)}" height="${f1(size)}"`);
}
const iconHtml = (name, tone) => iconSvg(name, tone).replace('width="48" height="48"', 'width="28" height="28"');

// A generic hotel: a pitched hill-station roof, floors of windows, a porch door. (x, y) = ground under the middle.
function hotel(x, y, w, o = {}) {
  const floors = o.floors ?? 2, fh = w * 0.3, h = floors * fh + w * 0.2, x0 = x - w / 2, top = y - h;
  const wall = `color-mix(in oklab, var(--sim-series-${o.tone ?? 4}) 22%, var(--sim-bg-surface))`;
  const roof = `color-mix(in oklab, var(--sim-series-${o.roof ?? 6}) 70%, var(--sim-label) 15%)`;
  let s = `<rect x="${f1(x0)}" y="${f1(top)}" width="${f1(w)}" height="${f1(h)}" rx="3" ${fill(wall, `stroke:${RIM};stroke-width:2.5`)}/>`;
  s += `<path d="M${f1(x0 - w * 0.08)} ${f1(top + 2)}L${f1(x)} ${f1(top - w * 0.26)}L${f1(x0 + w * 1.08)} ${f1(top + 2)}Z" ${fill(roof, `stroke:${RIM};stroke-width:2.5;stroke-linejoin:round`)}/>`;
  const cols = Math.max(2, Math.round(w / 46)), gap = w / cols, ww = gap * 0.46;
  for (let f = 0; f < floors; f++) {
    for (let c = 0; c < cols; c++) {
      const wx = x0 + gap * (c + 0.5) - ww / 2, wy = top + w * 0.08 + f * fh;
      s += `<rect x="${f1(wx)}" y="${f1(wy)}" width="${f1(ww)}" height="${f1(fh * 0.56)}" rx="2" ${fill('color-mix(in oklab, var(--sim-water) 40%, var(--sim-bg-surface))', `stroke:${RIM};stroke-width:2`)}/>`;
    }
  }
  const dw = w * 0.26, dh = w * 0.2;
  s += `<rect x="${f1(x - dw / 2)}" y="${f1(y - dh)}" width="${f1(dw)}" height="${f1(dh)}" rx="${f1(dw * 0.4)}" ${fill(WOOD, `stroke:${RIM};stroke-width:2`)}/>`;
  s += `<rect x="${f1(x0 - 4)}" y="${f1(y - 4)}" width="${f1(w + 8)}" height="6" rx="3" ${fill(RIM)}/>`;
  return s;
}

// The front desk: a top board and a panelled front. x0..x1, top = the desk top, ground = its foot.
function desk(x0, x1, top, ground) {
  let s = `<rect x="${f1(x0 - 8)}" y="${f1(top - 12)}" width="${f1(x1 - x0 + 16)}" height="14" rx="5" ${fill(WOOD, `stroke:${RIM};stroke-width:2.5`)}/>`
    + `<rect x="${f1(x0)}" y="${f1(top)}" width="${f1(x1 - x0)}" height="${f1(ground - top)}" rx="4" ${fill(WOOD_LT, `stroke:${RIM};stroke-width:2.5`)}/>`;
  const n = Math.max(2, Math.round((x1 - x0) / 90)), pw = (x1 - x0) / n;
  for (let i = 0; i < n; i++) s += `<rect x="${f1(x0 + i * pw + 12)}" y="${f1(top + 14)}" width="${f1(pw - 24)}" height="${f1(ground - top - 28)}" rx="6" ${fill('none', `stroke:${RIM};stroke-width:2;opacity:0.5`)}/>`;
  return s;
}

// Room keys on a board: 2 rows of hooks, a key on most. (x, y) = top left.
function keyBoard(x, y, w, h) {
  let s = `<rect x="${f1(x)}" y="${f1(y)}" width="${f1(w)}" height="${f1(h)}" rx="6" ${fill(WOOD, `stroke:${RIM};stroke-width:2.5`)}/>`;
  for (let r = 0; r < 2; r++) {
    for (let c = 0; c < 4; c++) {
      const kx = x + w * (0.14 + c * 0.24), ky = y + h * (0.2 + r * 0.45);
      s += `<circle cx="${f1(kx)}" cy="${f1(ky)}" r="3" ${fill(RIM)}/>`;
      if ((r * 4 + c) % 3 === 2) continue;
      s += `<circle cx="${f1(kx)}" cy="${f1(ky + 9)}" r="6" ${fill('none', `stroke:${GOLD};stroke-width:3`)}/>`
        + `<path d="M${f1(kx)} ${f1(ky + 15)}v14m0 -5h5m-5 5h4" ${stroke(GOLD, 3)}/>`;
    }
  }
  return s;
}

// A desk bell, (x, y) = bottom centre.
function bell(x, y, s = 1) {
  return `<rect x="${f1(x - 20 * s)}" y="${f1(y - 6 * s)}" width="${f1(40 * s)}" height="${f1(6 * s)}" rx="3" ${fill(RIM)}/>`
    + `<path d="M${f1(x - 16 * s)} ${f1(y - 6 * s)}Q${f1(x - 16 * s)} ${f1(y - 26 * s)} ${f1(x)} ${f1(y - 26 * s)}Q${f1(x + 16 * s)} ${f1(y - 26 * s)} ${f1(x + 16 * s)} ${f1(y - 6 * s)}Z" ${fill(GOLD, `stroke:${GOLD_RIM};stroke-width:2`)}/>`
    + `<rect x="${f1(x - 3 * s)}" y="${f1(y - 32 * s)}" width="${f1(6 * s)}" height="${f1(7 * s)}" rx="2" ${fill(GOLD_RIM)}/>`;
}

// An open bill book on the desk, (x, y) = bottom centre.
function billBook(x, y, w = 70) {
  const h = w * 0.3;
  let s = `<path d="M${f1(x - w / 2)} ${f1(y)}L${f1(x - w / 2 + 6)} ${f1(y - h)}H${f1(x - 2)}L${f1(x)} ${f1(y - h + 3)}L${f1(x + 2)} ${f1(y - h)}H${f1(x + w / 2 - 6)}L${f1(x + w / 2)} ${f1(y)}Z" ${fill('var(--sim-bg-surface)', `stroke:${RIM};stroke-width:2;stroke-linejoin:round`)}/>`;
  for (let i = 1; i < 3; i++) s += `<path d="M${f1(x - w / 2 + 10)} ${f1(y - h + i * h / 3)}H${f1(x - 8)}M${f1(x + 8)} ${f1(y - h + i * h / 3)}H${f1(x + w / 2 - 10)}" ${stroke('var(--sim-label-muted)', 1.6)}/>`;
  return s;
}

// A window onto the hills (Shimla).
function hillWindow(x, y, w, h) {
  let s = `<rect x="${f1(x)}" y="${f1(y)}" width="${f1(w)}" height="${f1(h)}" rx="6" ${fill('color-mix(in oklab, var(--sim-water) 30%, var(--sim-bg-surface))', `stroke:${RIM};stroke-width:3`)}/>`;
  s += `<path d="M${f1(x + 2)} ${f1(y + h - 2)}L${f1(x + w * 0.3)} ${f1(y + h * 0.42)}L${f1(x + w * 0.52)} ${f1(y + h * 0.7)}L${f1(x + w * 0.74)} ${f1(y + h * 0.36)}L${f1(x + w - 2)} ${f1(y + h - 2)}Z" ${fill('color-mix(in oklab, var(--sim-good) 45%, var(--sim-bg-surface))')}/>`;
  s += `<path d="M${f1(x + w * 0.74)} ${f1(y + h * 0.36)}l-9 11h18z" ${fill('var(--sim-bg-surface)')}/>`;
  s += `<path d="M${f1(x + w / 2)} ${f1(y)}V${f1(y + h)}" ${stroke(RIM, 3)}/>`;
  return s;
}

// An open jewellery box: a necklace and two bangles, a small lock on the front. (x, y) = bottom centre.
function jewelBox(x, y, w = 110, lock = false) {
  const h = w * 0.42, x0 = x - w / 2, top = y - h;
  const box = 'color-mix(in oklab, var(--sim-series-6) 55%, var(--sim-label) 18%)';
  let s = `<path d="M${f1(x0 + 4)} ${f1(top)}L${f1(x0 + 14)} ${f1(top - h * 0.8)}H${f1(x0 + w - 14)}L${f1(x0 + w - 4)} ${f1(top)}Z" ${fill(shadeBox(box), `stroke:${RIM};stroke-width:2.5;stroke-linejoin:round`)}/>`;
  // necklace: beads on a curve, a pendant
  for (let i = 0; i <= 8; i++) {
    const t = i / 8, bx = x0 + w * (0.24 + t * 0.52), by = top - h * 0.1 + Math.sin(t * Math.PI) * h * 0.28;
    s += `<circle cx="${f1(bx)}" cy="${f1(by)}" r="${f1(w * 0.03)}" ${fill(GOLD, `stroke:${GOLD_RIM};stroke-width:1.2`)}/>`;
  }
  s += `<circle cx="${f1(x)}" cy="${f1(top + h * 0.26)}" r="${f1(w * 0.05)}" ${fill('var(--sim-series-6)', `stroke:${GOLD_RIM};stroke-width:2`)}/>`;
  s += `<rect x="${f1(x0)}" y="${f1(top)}" width="${f1(w)}" height="${f1(h)}" rx="6" ${fill(box, `stroke:${RIM};stroke-width:2.5`)}/>`;
  s += `<ellipse cx="${f1(x0 + w * 0.2)}" cy="${f1(top + 2)}" rx="${f1(w * 0.12)}" ry="${f1(w * 0.05)}" ${fill('none', `stroke:${GOLD};stroke-width:4`)}/>`;
  s += `<ellipse cx="${f1(x0 + w * 0.8)}" cy="${f1(top + 2)}" rx="${f1(w * 0.12)}" ry="${f1(w * 0.05)}" ${fill('none', `stroke:${GOLD};stroke-width:4`)}/>`;
  if (lock) {
    const lx = x, ly = top + h * 0.55;
    s += `<path d="M${f1(lx - 8)} ${f1(ly - 4)}v-6a8 8 0 0 1 16 0v6" ${stroke('var(--sim-label)', 3.5)}/>`
      + `<rect x="${f1(lx - 12)}" y="${f1(ly - 5)}" width="24" height="20" rx="4" ${fill(GOLD, `stroke:${GOLD_RIM};stroke-width:2`)}/>`
      + `<circle cx="${f1(lx)}" cy="${f1(ly + 4)}" r="3" ${fill('var(--sim-label)')}/>`;
  }
  return s;
}
function shadeBox(col) { return `color-mix(in oklab, ${col} 70%, var(--sim-bg-surface))`; }

// A round medal on a ribbon (a generic award, no copied design). (x, y) = medal centre.
function medal(x, y, r = 24) {
  return `<path d="M${f1(x - r * 0.8)} ${f1(y - r * 2.1)}L${f1(x - r * 0.15)} ${f1(y - r * 0.6)}M${f1(x + r * 0.8)} ${f1(y - r * 2.1)}L${f1(x + r * 0.15)} ${f1(y - r * 0.6)}" ${stroke('var(--sim-series-5)', r * 0.5)}/>`
    + `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(r)}" ${fill(GOLD, `stroke:${GOLD_RIM};stroke-width:3`)}/>`
    + `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(r * 0.62)}" ${fill('none', `stroke:${GOLD_RIM};stroke-width:2`)}/>`;
}

const chip = (t, x, y, d, cls = '') => `<div class="ob-chip ob-in${cls ? ` ${cls}` : ''}" style="left:${f1(x)}px;top:${f1(y)}px;--d:${d}s">${t}</div>`;
const arrow = (x0, y0, x1, y1, d, dash = true) => {
  const a = Math.atan2(y1 - y0, x1 - x0), L = 13;
  const p1 = [x1 - L * Math.cos(a - 0.5), y1 - L * Math.sin(a - 0.5)], p2 = [x1 - L * Math.cos(a + 0.5), y1 - L * Math.sin(a + 0.5)];
  return `<g class="ob-fade" style="--d:${d}s"><path d="M${f1(x0)} ${f1(y0)}L${f1(x1)} ${f1(y1)}" ${stroke('var(--sim-accent)', 4)}${dash ? ' style="stroke-dasharray:9 7"' : ''}/>`
    + `<path d="M${f1(p1[0])} ${f1(p1[1])}L${f1(x1)} ${f1(y1)}L${f1(p2[0])} ${f1(p2[1])}" ${stroke('var(--sim-accent)', 4)} style="stroke-linejoin:round"/></g>`;
};

export class OberoiTimelineScene extends SvgScene {
  static WIDTH = 560;
  static PORTRAIT_WIDTH = 390;
  static HEIGHT = 480;
  static PORTRAIT_HEIGHT = 620;
  static CONTINUOUS = false;
  static BEAT_STEP_MAP = MAIN;
  static BEAT_MAPS = { 3: MAIN };
  static CONTROLS = [];
  static ARIA_LABEL = 'Mohan Singh Oberoi. First, a hotel desk clerk in Shimla, paid 50 rupees a month, who learned guest service, billing and administration. Then in 1934: his savings and a loan, with his wife\'s jewellery kept as security (a mortgage), buy a small hotel. Last: one hotel grows into a chain of hotels, a hotel management school, hotels in other countries, and the Padma Bhushan in 2001.';

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

  repaint() { super.repaint(); paintPeople(this); }

  stageHeight(st) { return Math.round((st.portrait ? 620 : 480) * st.W / (st.portrait ? 390 : 560)); }

  paint(st) {
    const P = st.portrait, DW = P ? 390 : 560, DH = P ? 620 : 480, k = (st.W / DW).toFixed(4), v = this.stepIndex;
    const out = v === 1 ? this.paintRisk(P, DW, DH) : v === 2 ? this.paintChain(P, DW, DH) : this.paintDesk(P, DW, DH);
    const still = this.still ? ' ob-still' : '';
    const pos = v === 2 ? 'right:10px;top:10px' : v === 1 && !P ? 'left:10px;top:10px' : 'right:10px;bottom:10px';
    const btn = `<button type="button" class="sv-hit tap btn ob-btn" data-act="${this.still ? 'replay' : 'skip'}" style="${pos}">${this.still ? 'Replay' : 'Skip'}</button>`;
    return {
      svg: `<g class="${still}" transform="scale(${k})">${out.svg}</g>`,
      over: `<div class="${still}" style="position:absolute;left:0;top:0;width:${DW}px;height:${DH}px;overflow:hidden;transform:scale(${k});transform-origin:0 0">${out.over ?? ''}${btn}</div>`,
    };
  }

  // b0: the desk clerk in Shimla.
  paintDesk(P, DW, DH) {
    const G = P
      ? { wall: [12, 12, 366, 452], keys: [24, 168, 112, 76], win: [258, 166, 112, 84], desk: [16, 470, 300, 600], ob: [150, 600, 270],
        guest: [334, 600, 210], book: [72, 466], bell: [252, 466], pay: [14, 14, 200, 128],
        chips: { admin: [96, 270], bill: [84, 418], guest: [292, 330] }, name: [158, 540] }
      : { wall: [12, 12, 536, 340], keys: [26, 54, 120, 80], win: [372, 150, 110, 80], desk: [26, 320, 340, 452], ob: [180, 452, 250],
        guest: [470, 452, 214], book: [80, 340], bell: [298, 340], pay: [376, 14, 172, 120],
        chips: { admin: [96, 172], bill: [90, 290], guest: [392, 258] }, name: [183, 392] };
    const [wx, wy, ww, wh] = G.wall;
    let svg = `<rect x="${wx}" y="${wy}" width="${ww}" height="${wh}" rx="16" ${fill('color-mix(in oklab, var(--sim-series-4) 12%, var(--sim-bg-surface))')}/>`;
    svg += keyBoard(...G.keys);
    svg += hillWindow(...G.win);
    // pay card: Rs 50 a month
    const [px, py, pw, ph] = G.pay;
    svg += `<g class="ob-pop" style="--d:0.2s"><rect x="${px}" y="${py + 3}" width="${pw}" height="${ph}" rx="14" ${fill('var(--sim-stroke)')}/>`
      + `<rect x="${px}" y="${py}" width="${pw}" height="${ph}" rx="14" ${fill('var(--sim-bg-surface)', 'stroke:var(--sim-accent);stroke-width:3.5')}/>`
      + coin(px + 34, py + 50, 18)
      + `<text x="${f1(px + pw / 2 + 18)}" y="${py + 66}" text-anchor="middle" style="fill:var(--sim-label);font:800 44px var(--sim-font)">${RS}50</text>`
      + `<text x="${f1(px + pw / 2)}" y="${py + 104}" text-anchor="middle" style="fill:var(--sim-label-muted);font:800 22px var(--sim-font)">a month</text></g>`;
    let over = personSlot('oberoi', { x: G.ob[0], y: G.ob[1], h: G.ob[2], mood: 'smile' })
      + personSlot('hotelguest', { x: G.guest[0], y: G.guest[1], h: G.guest[2], facing: -1, mood: 'happy' });
    const [dx0, dtop, dx1, dground] = G.desk;
    const front = desk(dx0, dx1, dtop, dground) + billBook(G.book[0], G.book[1] - 12, P ? 76 : 84) + bell(G.bell[0], G.bell[1] - 12, 1.2)
      + `<g transform="translate(${G.name[0]} ${G.name[1]})"><rect x="-86" y="-16" width="172" height="32" rx="16" ${fill('var(--sim-bg-surface)', 'stroke:var(--sim-stroke);stroke-width:2')}/>`
      + `<text x="0" y="7" text-anchor="middle" style="fill:var(--sim-label);font:800 20px var(--sim-font)">M. S. Oberoi</text></g>`;
    over += frontSvg(DW, DH, front);
    over += chip(`${iconHtml('person', 2)}guest service`, ...G.chips.guest, 0.6, 'acc');
    over += chip(`${iconHtml('scroll', 'var(--sim-label-muted)')}billing`, ...G.chips.bill, 1.1, 'acc');
    over += chip(`${iconHtml('book', 5)}administration`, ...G.chips.admin, 1.6, 'acc');
    return { svg, over };
  }

  // b1: 1934, the mortgage and the small hotel.
  paintRisk(P, DW, DH) {
    const G = P
      ? { ob: [52, 604, 190], pile: [150, 604], pileChip: [150, 500], box: [110, 22, 270, 236], hotel: [304, 604, 150], year: [304, 414],
        loanFrom: [304, 262], loanTo: [304, 382], loanChip: [352, 320], save: [200, 576, 222, 576] }
      : { ob: [64, 452, 220], pile: [168, 452], pileChip: [160, 324], box: [196, 22, 200, 268], hotel: [468, 452, 160], year: [508, 254],
        loanFrom: [392, 180], loanTo: [432, 304], loanChip: [470, 180], save: [212, 410, 380, 410] };
    let svg = '';
    // the mortgage box: the jewellery kept as security
    const [bx, by, bw, bh] = G.box, bc = bx + bw / 2;
    svg += `<rect x="${bx}" y="${by + 18}" width="${bw}" height="${bh - 18}" rx="18" ${fill('color-mix(in oklab, var(--sim-accent) 9%, var(--sim-bg-surface))', 'stroke:var(--sim-accent);stroke-width:3;stroke-dasharray:10 7')}/>`;
    svg += `<g class="ob-pop" style="--d:0.3s">${jewelBox(bc, by + bh * 0.58, P ? 104 : 112, true)}</g>`;
    svg += `<g class="ob-fade" style="--d:0.7s"><text x="${f1(bc)}" y="${f1(by + bh - 48)}" text-anchor="middle" style="fill:var(--sim-label);font:800 20px var(--sim-font)">his wife's jewellery,</text>`
      + `<text x="${f1(bc)}" y="${f1(by + bh - 22)}" text-anchor="middle" style="fill:var(--sim-label);font:800 20px var(--sim-font)">kept as security</text></g>`;
    // the hotel bought in 1934
    svg += `<g class="ob-pop" style="--d:1.6s">${hotel(G.hotel[0], G.hotel[1], G.hotel[2], { floors: 2 })}</g>`;
    // savings slide to the hotel; the loan flies out of the mortgage box
    const [sx0, sy0, sx1, sy1] = G.save;
    svg += arrow(sx0, sy0, sx1, sy1, 1.2);
    svg += arrow(G.loanFrom[0], G.loanFrom[1], G.loanTo[0], G.loanTo[1], 1.0);
    let front = coinPile(G.pile[0], G.pile[1], 1000, { r: 13 });
    const lx = (G.loanFrom[0] + G.loanTo[0]) / 2, ly = (G.loanFrom[1] + G.loanTo[1]) / 2;
    [[-14, 6], [0, -8], [14, 6]].forEach(([dx, dy], i) => {
      front += `<g class="ob-move" style="--d:${(0.8 + i * 0.12).toFixed(2)}s;--fx:${f1(G.loanFrom[0] - lx)}px;--fy:${f1(G.loanFrom[1] - ly)}px">${coin(lx + dx, ly + dy, 13)}</g>`;
    });
    let over = personSlot('oberoi', { x: G.ob[0], y: G.ob[1], h: G.ob[2], facing: 1, mood: 'think' });
    over += frontSvg(DW, DH, front);
    over += chip('mortgage', bc, by + 18, 0.2, 'acc');
    over += chip('all his savings', ...G.pileChip, 0.5);
    over += chip('loan', ...G.loanChip, 1.0);
    over += chip('1934', ...G.year, 1.9, 'big acc');
    return { svg, over };
  }

  // b2: one hotel becomes a chain; a school, other countries, the Padma Bhushan.
  paintChain(P, DW, DH) {
    const H = P
      ? [[70, 238, 96, 2, 4], [190, 238, 100, 3, 2], [310, 238, 96, 2, 5], [80, 420, 104, 3, 7], [200, 420, 96, 2, 3], [316, 420, 104, 4, 1]]
      : [[62, 262, 90, 2, 4], [150, 262, 76, 2, 2], [232, 262, 84, 3, 5], [318, 262, 80, 2, 7], [404, 262, 88, 4, 3], [496, 262, 84, 3, 1]];
    const G = P
      ? { line: [24, 452, 366], chain: [195, 34], start: [70, 270], marks: [[70, 492, 'school'], [195, 492, 'globe'], [320, 492, 'medal']], labY: 550 }
      : { line: [20, 300, 540], chain: [280, 30], start: [62, 290], marks: [[110, 356, 'school'], [280, 356, 'globe'], [450, 356, 'medal']], labY: 420 };
    let svg = '';
    H.forEach(([x, y, w, fl, t], i) => {
      svg += `<g class="ob-pop" style="--d:${(0.1 + i * 0.32).toFixed(2)}s"${i === 0 ? '' : ''}>${hotel(x, y, w, { floors: fl, tone: t, roof: i === 0 ? 6 : 8 })}</g>`;
    });
    const [lx0, ly, lx1] = G.line;
    svg += `<path d="M${lx0} ${ly}H${lx1}" ${stroke('var(--sim-label-muted)', 3)} style="stroke-dasharray:3 7;stroke-linecap:round"/>`;
    const labs = P ? [['hotel', 'school'], ['other', 'countries'], ['Padma Bhushan', '2001']] : [['hotel school'], ['other countries'], ['Padma Bhushan', '2001']];
    G.marks.forEach(([x, y, kind], i) => {
      const d = (2.1 + i * 0.35).toFixed(2);
      const art = kind === 'medal' ? medal(x, y + 6, 26) : icon(kind, x, y, 66, kind === 'school' ? 2 : 5);
      svg += `<g class="ob-pop" style="--d:${d}s">${art}</g>`;
      const L = labs[i], yr = /^[0-9]+$/.test(L[L.length - 1] ?? '');
      svg += `<g class="ob-fade" style="--d:${d}s">` + L.map((t, j) => {
        const isYr = yr && j === L.length - 1;
        if (P && kind === 'medal' && j === 0) return ['Padma', 'Bhushan'].map((w, m) => `<text x="${x}" y="${G.labY + m * 26}" text-anchor="middle" style="fill:var(--sim-label);font:800 20px var(--sim-font)">${w}</text>`).join('');
        const yy = G.labY + (isYr ? (P && kind === 'medal' ? 56 : 34) : j * 26);
        return `<text x="${x}" y="${yy}" text-anchor="middle" style="fill:${isYr ? 'var(--sim-accent)' : 'var(--sim-label)'};font:800 ${isYr ? 26 : P ? 20 : 21}px var(--sim-font)">${t}</text>`;
      }).join('') + '</g>';
    });
    let over = chip('a hotel chain', ...G.chain, 2.0, 'acc big');
    over += chip('1934', ...G.start, 0.3);
    return { svg, over };
  }

  testState() { return { view: this.stepIndex, still: this.still }; }
}
