/**
 * LijjatGrowthTimelineScene - L02 s03 (3 beats). SvgScene, design 560 x 480 landscape, 390 x 620 portrait.
 *   b0 Papads made at home: the centre (left) and a one-room home (right) with one member at her rolling board
 *      and a pot on the stove (her household tasks). Morning: a ball of raw dough rides the top arc to the home
 *      (sun). Papads stack up at her board one by one. Evening: the stack rides the bottom arc back to the centre,
 *      where every papad is the same size and a check pops ("same quality").
 *   b1 Equal owners: the seven women in a row under a signboard "Shri Mahila Griha Udyog Lijjat Papad" with a
 *      "1962" corner tag and "lijjat = tasty"; one heap of profit in the middle splits into seven equal stacks, one
 *      in front of each woman ("equal owners, equal shares").
 *   b2 From Rs 80 to Rs 1,600 crore: a rising timeline, four stops lit from the bottom: 1959 Rs 80, seven women /
 *      1962 registered / 1980s-90s over Rs 100 crore (flour, masalas, soaps, sold abroad) / 2023 Rs 1,600 crore a
 *      year, 45,000 women, 83 branches (the hero, top, accent).
 * Real facts (the book's), not made up. Papads are plain round discs; no logo, no packet, no brand mark.
 * Animation is CSS only; a Skip / Replay button sits in the figure. Rest = the final frame.
 * Same seven women as LijjatRooftopSetupScene (lijjat1..7). Colours are tokens only. ASCII only.
 */
import { SvgScene, fill, stroke } from 'simulations/base/kit/SimSvg.js';
import { iconSvg } from 'simulations/base/kit/SimIcons.js';
import { MONEY_CSS, RS, coin } from '../shared/MoneyKit.js';
import { PEOPLE_CSS, personSlot, paintPeople, frontSvg, registerCast } from '../shared/FinPeople.js';

const f1 = (v) => (+v).toFixed(1);
const MAIN = [[{ idx: 0, dwellMs: null }], [{ idx: 1, dwellMs: null }], [{ idx: 2, dwellMs: null }]];
const DUR = [4.4, 2.6, 2.6];

const W7 = [
  { outfit: 'drape', hairStyle: 'bun' }, { outfit: 'kurti', hairStyle: 'braid', dupatta: true }, { outfit: 'drape', hairStyle: 'long' },
  { outfit: 'kurti', hairStyle: 'bun', dupatta: true }, { outfit: 'drape', hairStyle: 'braid' }, { outfit: 'kurti', hairStyle: 'long', dupatta: true },
  { outfit: 'drape', hairStyle: 'bun' },
];
W7.forEach((w, i) => registerCast(`lijjat${i + 1}`, { name: 'Member', series: i + 1, role: 'adult', i: 51 + i,
  look: { top: `s${i + 1}`, bottom: w.outfit === 'drape' ? `s${i + 1}` : 'cream', bottomStyle: 'long-skirt', trim: 'cream', shoeStyle: 'sandal', shoe: 'brown', pattern: 'plain', moustache: false, glasses: false, dupatta: false, girth: 1 + (i % 3) * 0.04, ...w } }));

const CSS = `
.lg-chip { position: absolute; transform: translate(-50%, -50%); white-space: nowrap; padding: 4px 12px; border-radius: 999px;
  font: 800 20px/1.2 var(--sim-font); color: var(--sim-label); background: var(--sim-bg-surface); border: 2.5px solid var(--sim-stroke); }
.lg-chip.acc { border-color: var(--sim-accent); background: color-mix(in oklab, var(--sim-accent) 14%, var(--sim-bg-surface)); }
.lg-chip.ok { border-color: var(--sim-good); background: color-mix(in oklab, var(--sim-good) 16%, var(--sim-bg-surface)); }
.lg-btn { position: absolute; cursor: pointer; padding: 6px 14px; border-radius: calc(12px * var(--look-radius, 1));
  font: 800 18px/1.1 var(--sim-font); color: var(--sim-label); background: var(--sim-bg-surface);
  border: 2.5px solid var(--sim-stroke); box-shadow: 0 calc(3px * var(--look-lip, 1)) 0 var(--sim-stroke); }
.lg-btn:active { transform: translateY(3px); box-shadow: none; }
.lg-btn:focus-visible { outline: 3px solid var(--sim-accent); outline-offset: 3px; }
.lg-in { animation: lg-in 0.5s cubic-bezier(.3,1.4,.5,1) both; animation-delay: var(--d, 0s); }
@keyframes lg-in { 0% { opacity: 0; transform: translate(-50%, -50%) scale(0.6); } 100% { opacity: 1; transform: translate(-50%, -50%); } }
svg .lg-pop { transform-box: fill-box; transform-origin: center; animation: lg-pop 0.5s cubic-bezier(.3,1.4,.5,1) both; animation-delay: var(--d, 0s); }
@keyframes lg-pop { 0% { opacity: 0; transform: scale(0.5); } 100% { opacity: 1; transform: none; } }
svg .lg-fade { animation: lg-fade 0.4s ease both; animation-delay: var(--d, 0s); }
@keyframes lg-fade { 0% { opacity: 0; } 100% { opacity: 1; } }
svg .lg-move { animation: lg-move 0.8s cubic-bezier(.4,0,.3,1) both; animation-delay: var(--d, 0s); }
@keyframes lg-move { 0% { transform: translate(var(--fx, 0px), var(--fy, 0px)); } 100% { transform: none; } }
svg .lg-arc { animation: lg-arc 1s ease-in-out both; animation-delay: var(--d, 0s); }
@keyframes lg-arc { 0% { transform: translate(var(--ax, 0px), var(--ay, 0px)); } 50% { transform: translate(var(--bx, 0px), var(--by, 0px)); } 100% { transform: none; } }
.lg-still, .lg-still * { animation: none !important; }
@media (prefers-reduced-motion: reduce) { .lg-in, svg .lg-pop, svg .lg-fade, svg .lg-move, svg .lg-arc { animation: none; } }
`;

const WALL = 'color-mix(in oklab, var(--sim-series-8) 22%, var(--sim-bg-surface))';
const RIM = 'color-mix(in oklab, var(--sim-series-8) 40%, var(--sim-label) 45%)';
const DOOR = 'color-mix(in oklab, var(--sim-series-8) 50%, var(--sim-label) 25%)';
const WOOD = 'color-mix(in oklab, var(--sim-series-8) 45%, var(--sim-bg-surface))';
const PAPAD = 'color-mix(in oklab, var(--sim-gold) 38%, var(--sim-bg-surface))';
const PAPAD_RIM = 'color-mix(in oklab, var(--sim-gold) 55%, var(--sim-label) 35%)';
const DOUGH = 'color-mix(in oklab, var(--sim-gold) 22%, var(--sim-bg-surface))';

function icon(name, x, y, size, tone) {
  return iconSvg(name, tone).replace('width="48" height="48"', `x="${f1(x - size / 2)}" y="${f1(y - size / 2)}" width="${f1(size)}" height="${f1(size)}"`);
}
/** One papad: a plain flat disc seen a little from above, with a few dots. */
function papad(x, y, r) {
  return `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="${f1(r)}" ry="${f1(r * 0.42)}" ${fill(PAPAD, `stroke:${PAPAD_RIM};stroke-width:2`)}/>`
    + `<circle cx="${f1(x - r * 0.35)}" cy="${f1(y - r * 0.05)}" r="1.8" ${fill(PAPAD_RIM)}/><circle cx="${f1(x + r * 0.2)}" cy="${f1(y + r * 0.12)}" r="1.8" ${fill(PAPAD_RIM)}/><circle cx="${f1(x + r * 0.42)}" cy="${f1(y - r * 0.14)}" r="1.8" ${fill(PAPAD_RIM)}/>`;
}
function papadStack(x, y, r, n) { let s = ''; for (let i = 0; i < n; i++) s += papad(x, y - i * r * 0.2, r); return s; }
function dough(x, y, r) {
  return `<ellipse cx="${f1(x)}" cy="${f1(y - r * 0.55)}" rx="${f1(r)}" ry="${f1(r * 0.62)}" ${fill(DOUGH, `stroke:${PAPAD_RIM};stroke-width:2.5`)}/>`
    + `<path d="M${f1(x - r * 0.45)} ${f1(y - r * 0.8)}q${f1(r * 0.3)} ${f1(-r * 0.2)} ${f1(r * 0.6)} 0" ${stroke(PAPAD_RIM, 2)} style="opacity:0.6"/>`;
}
function board(x, y, s = 1) {
  const rim = 'color-mix(in oklab, var(--sim-series-8) 40%, var(--sim-label) 55%)';
  return `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="${f1(30 * s)}" ry="${f1(11 * s)}" ${fill(WOOD, `stroke:${rim};stroke-width:2.5`)}/>`
    + `<rect x="${f1(x - 26 * s)}" y="${f1(y - 22 * s)}" width="${f1(52 * s)}" height="${f1(9 * s)}" rx="${f1(4.5 * s)}" transform="rotate(-12 ${f1(x)} ${f1(y - 18 * s)})" ${fill(WOOD, `stroke:${rim};stroke-width:2.5`)}/>`;
}
/** The centre: a plain two-door hall (no name board), ground centre (x, y), width w. */
function centre(x, y, w) {
  const h = w * 0.72, x0 = x - w / 2;
  let s = `<rect x="${f1(x0)}" y="${f1(y - h)}" width="${f1(w)}" height="${f1(h)}" rx="4" ${fill(WALL, `stroke:${RIM};stroke-width:2.5`)}/>`
    + `<path d="M${f1(x0 - 10)} ${f1(y - h)}H${f1(x0 + w + 10)}L${f1(x0 + w - 6)} ${f1(y - h - 22)}H${f1(x0 + 6)}Z" ${fill(DOOR, `stroke:${RIM};stroke-width:2.5;stroke-linejoin:round`)}/>`;
  [0.28, 0.72].forEach((t) => { s += `<rect x="${f1(x0 + w * t - 14)}" y="${f1(y - h * 0.62)}" width="28" height="${f1(h * 0.62)}" rx="3" ${fill(DOOR, `stroke:${RIM};stroke-width:2`)}/>`; });
  return s + `<rect x="${f1(x - 12)}" y="${f1(y - h * 0.85)}" width="24" height="18" rx="3" ${fill('var(--sim-sky-day)', `stroke:${RIM};stroke-width:2`)}/>`;
}
/** A one-room home seen from the front, open (the back wall and roof line only), ground centre (x, y). */
function home(x, y, w) {
  const h = w * 0.9, x0 = x - w / 2;
  return `<rect x="${f1(x0)}" y="${f1(y - h)}" width="${f1(w)}" height="${f1(h)}" rx="4" ${fill('color-mix(in oklab, var(--sim-series-5) 14%, var(--sim-bg-surface))', `stroke:${RIM};stroke-width:2.5`)}/>`
    + `<path d="M${f1(x0 - 14)} ${f1(y - h)}L${f1(x)} ${f1(y - h - w * 0.32)}L${f1(x0 + w + 14)} ${f1(y - h)}Z" ${fill(DOOR, `stroke:${RIM};stroke-width:2.5;stroke-linejoin:round`)}/>`
    + `<rect x="${f1(x0 + w * 0.62)}" y="${f1(y - h * 0.8)}" width="${f1(w * 0.22)}" height="${f1(h * 0.24)}" rx="3" ${fill('var(--sim-sky-day)', `stroke:${RIM};stroke-width:2`)}/>`;
}

const chip = (t, x, y, d, cls) => `<div class="lg-chip lg-in${cls ? ` ${cls}` : ''}" style="left:${f1(x)}px;top:${f1(y)}px;--d:${d}s">${t}</div>`;
const text = (x, y, t, size, col = 'var(--sim-label)', anchor = 'start') => `<text x="${f1(x)}" y="${f1(y)}" text-anchor="${anchor}" style="fill:${col};font:800 ${size}px var(--sim-font)">${t}</text>`;

export class LijjatGrowthTimelineScene extends SvgScene {
  static WIDTH = 560;
  static PORTRAIT_WIDTH = 390;
  static HEIGHT = 480;
  static PORTRAIT_HEIGHT = 620;
  static CONTINUOUS = false;
  static BEAT_STEP_MAP = MAIN;
  static BEAT_MAPS = { 3: MAIN };
  static CONTROLS = [];
  static ARIA_LABEL = 'Lijjat. In the morning a ball of raw dough goes from the centre to a member\'s home; she rolls papads between her household tasks; in the evening the papads go back, every one the same size: same quality. The seven women are equal owners: one heap of profit splits into seven equal shares, under the 1962 signboard Shri Mahila Griha Udyog Lijjat Papad (lijjat means tasty). A rising timeline: 1959, 80 rupees and seven women; 1962, registered; 1980s and 90s, flour, masalas, soaps, sales abroad, over 100 crore rupees; 2023, 1,600 crore rupees a year, 45,000 women, 83 branches.';

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
    const out = v === 1 ? this.paintOwners(P, DW, DH) : v === 2 ? this.paintTimeline(P, DW, DH) : this.paintDay(P, DW, DH);
    const still = this.still ? ' lg-still' : '';
    const btn = `<button type="button" class="sv-hit tap btn lg-btn" data-act="${this.still ? 'replay' : 'skip'}" style="${out.btn}">${this.still ? 'Replay' : 'Skip'}</button>`;
    return {
      svg: `<g class="${still}" transform="scale(${k})">${out.svg}</g>`,
      over: `<div class="${still}" style="position:absolute;left:0;top:0;width:${DW}px;height:${DH}px;overflow:hidden;transform:scale(${k});transform-origin:0 0">${out.over ?? ''}${btn}</div>`,
    };
  }

  // b0: dough out in the morning, papads back by evening.
  paintDay(P, DW, DH) {
    const G = P
      ? { gy: 370, cx: 92, cw: 140, hx: 290, hw: 170, wo: [258, 370, 160], tab: [326, 340], pot: [350, 300], top: 120, bot: 480, sun: [110, 64],
        cStack: [92, 462], chips: { am: [250, 64], pm: [262, 478], ok: [92, 506], centre: [92, 218] }, btn: 'right:10px;top:10px' }
      : { gy: 330, cx: 112, cw: 168, hx: 430, hw: 210, wo: [392, 330, 180], tab: [476, 300], pot: [500, 252], top: 86, bot: 400, sun: [196, 46],
        cStack: [112, 410], chips: { am: [336, 46], pm: [300, 398], ok: [112, 456], centre: [112, 138] }, btn: 'right:10px;bottom:10px' };
    let svg = centre(G.cx, G.gy, G.cw) + home(G.hx, G.gy, G.hw);
    // the two arcs: morning over the top, evening along the ground
    const ax0 = G.cx + G.cw * 0.3, ax1 = G.hx - G.hw * 0.2, mx = (ax0 + ax1) / 2;
    const yTop = G.gy - G.cw * 0.95;
    svg += `<path d="M${f1(ax0)} ${f1(yTop)}Q${f1(mx)} ${G.top - 30} ${f1(ax1)} ${f1(yTop)}" ${stroke('var(--sim-series-6)', 4)} style="stroke-dasharray:10 9"/>`
      + `<path d="M${f1(ax1 - 16)} ${f1(yTop - 14)}l16 14l-20 6" ${stroke('var(--sim-series-6)', 4)} style="stroke-linejoin:round"/>`;
    const by0 = G.gy + 26;
    svg += `<path d="M${f1(G.hx - 20)} ${by0}Q${f1(mx)} ${G.bot + 30} ${f1(G.cx + 20)} ${by0}" ${stroke('var(--sim-series-5)', 4)} style="stroke-dasharray:10 9"/>`
      + `<path d="M${f1(G.cx + 40)} ${f1(by0 + 4)}l-20 -4l10 -16" ${stroke('var(--sim-series-5)', 4)} style="stroke-linejoin:round"/>`;
    svg += icon('sun', G.sun[0], G.sun[1], 62, 'var(--sim-gold)');
    // the member at home: board on a low table, pot on the stove
    let over = personSlot('lijjat3', { x: G.wo[0], y: G.wo[1], h: G.wo[2], mood: 'smile' });
    const [tx, ty] = G.tab;
    let front = `<rect x="${tx - 42}" y="${ty}" width="84" height="12" rx="4" ${fill(WOOD, `stroke:${RIM};stroke-width:2.5`)}/>`
      + `<path d="M${tx - 34} ${ty + 12}V${G.gy}M${tx + 34} ${ty + 12}V${G.gy}" ${stroke(RIM, 4)}/>`
      + board(tx - 6, ty - 2, 0.95) + icon('pot', G.pot[0], G.pot[1], 40, 'var(--sim-label-muted)');
    // morning: the dough rides over to her table
    const dx = tx + 26, dyy = ty - 4;
    front += `<g class="lg-arc" style="--d:0.3s;--ax:${f1(ax0 - dx)}px;--ay:${f1(yTop - dyy)}px;--bx:${f1(mx - dx)}px;--by:${f1(G.top - 10 - dyy)}px">${dough(dx, dyy, 20)}</g>`;
    // papads pile up at home, then ride back in the evening to the centre's stack
    const [sx, sy] = G.cStack;
    const hx = G.hx + G.hw * 0.05, hy = G.gy - 6;
    for (let i = 0; i < 5; i++) front += `<g class="lg-pop" style="--d:${(1.4 + i * 0.22).toFixed(2)}s"><g class="lg-arc" style="--d:2.7s;--ax:${f1(hx - sx)}px;--ay:${f1(hy - sy)}px;--bx:${f1(mx - sx)}px;--by:${f1(G.bot + 10 - sy)}px">${papad(sx, sy - i * 7, P ? 32 : 36)}</g></g>`;
    svg += `<g class="lg-pop" style="--d:3.8s">${icon('check', sx + (P ? 56 : 62), sy - 22, 40, 'var(--sim-good)')}</g>`;
    over += frontSvg(DW, DH, front);
    over += chip('centre', G.chips.centre[0], G.chips.centre[1], 0);
    over += chip('morning: dough', G.chips.am[0], G.chips.am[1], 0.2);
    over += chip('evening: papads', G.chips.pm[0], G.chips.pm[1], 2.6);
    over += chip('same quality', G.chips.ok[0], G.chips.ok[1], 3.8, 'ok');
    return { svg, over, btn: G.btn };
  }

  // b1: seven equal owners, seven equal shares.
  paintOwners(P, DW, DH) {
    const G = P
      ? { sign: [16, 16, 358, 112], lines: ['Shri Mahila Griha', 'Udyog Lijjat Papad'], fs: 24, y62: [56, 138], tasty: [262, 170], gy: 430, h: 132, x0: 42, dx: 51, cy: 470, eq: [195, 560], btn: 'right:10px;bottom:10px' }
      : { sign: [30, 14, 500, 74], lines: ['Shri Mahila Griha Udyog Lijjat Papad'], fs: 24, y62: [96, 102], tasty: [396, 112], gy: 370, h: 160, x0: 64, dx: 72, cy: 408, eq: [280, 452], btn: 'left:10px;bottom:10px' };
    const [sx, sy, sw, sh] = G.sign;
    let svg = `<path d="M${sx + 40} ${sy + sh}V${sy + sh + 26}M${sx + sw - 40} ${sy + sh}V${sy + sh + 26}" ${stroke(RIM, 5)}/>`
      + `<rect x="${sx}" y="${sy + 4}" width="${sw}" height="${sh}" rx="10" ${fill(RIM)}/>`
      + `<rect x="${sx}" y="${sy}" width="${sw}" height="${sh}" rx="10" ${fill('var(--sim-bg-surface)', `stroke:${RIM};stroke-width:3`)}/>`;
    const lh = G.fs * 1.25, ty = sy + sh / 2 - (G.lines.length - 1) * lh / 2 + G.fs * 0.36;
    G.lines.forEach((t, i) => { svg += text(sx + sw / 2, ty + i * lh, t, G.fs, 'var(--sim-label)', 'middle'); });
    let over = '';
    const mid = G.x0 + 3 * G.dx;
    let front = '';
    for (let i = 0; i < 7; i++) {
      const x = G.x0 + i * G.dx;
      over += personSlot(`lijjat${i + 1}`, { x, y: G.gy, h: G.h, mood: 'happy' });
      // three coins each, slid out of one heap in the middle
      let st = '';
      for (let j = 0; j < 3; j++) st += coin(x, G.cy - j * 9, 14);
      front += `<g class="lg-move" style="--d:${(0.5 + Math.abs(i - 3) * 0.08).toFixed(2)}s;--fx:${f1(mid - x)}px;--fy:0px">${st}</g>`;
    }
    over += frontSvg(DW, DH, front);
    over += chip('1962', G.y62[0], G.y62[1], 0, 'acc');
    over += chip('lijjat = tasty', G.tasty[0], G.tasty[1], 0.3);
    over += chip('equal owners, equal shares', G.eq[0], G.eq[1], 1.4, 'acc');
    return { svg, over, btn: G.btn };
  }

  // b2: the rising timeline.
  paintTimeline(P, DW, DH) {
    const G = P
      ? { ax: 66, ys: [560, 424, 282, 104], cx: 136, chipW: 1, btn: 'right:10px;bottom:10px' }
      : { ax: 74, ys: [424, 316, 206, 76], cx: 150, chipW: 1, btn: 'right:10px;bottom:10px' };
    const crore = (n) => `${RS}${n} crore`;
    const rows = [
      { year: '1959', lines: [[`${RS}80`, 34], ['seven women', 20]], who: true },
      { year: '1962', lines: [['registered', 24], ['cooperative society', 20]] },
      { year: '1980s-90s', lines: [[`over ${crore(100)}`, 28], [P ? 'flour, masalas, soaps,' : 'flour, masalas, soaps, sold abroad', 20]].concat(P ? [['sold abroad', 20]] : []) },
      { year: '2023', lines: P ? [[crore('1,600'), 34], ['a year', 22], ['45,000 women', 22], ['83 branches', 22]] : [[`${crore('1,600')} a year`, 36], ['45,000 women, 83 branches', 22]], hero: true },
    ];
    let svg = `<path d="M${G.ax} ${G.ys[0] + 30}V${G.ys[3] - 40}" ${stroke('var(--sim-stroke)', 6)} style="stroke-linecap:round"/>`
      + `<path d="M${G.ax - 14} ${G.ys[3] - 30}l14 -16l14 16" ${stroke('var(--sim-stroke)', 6)} style="stroke-linejoin:round;stroke-linecap:round"/>`;
    let over = '';
    rows.forEach((r, i) => {
      const y = G.ys[i], del = (0.2 + i * 0.5).toFixed(2);
      over += chip(r.year, G.ax, y, del, r.hero ? 'acc' : '');
      let g = '';
      const n = r.lines.length;
      let yy = y - (n - 1) * 14 + 8;
      if (r.hero) {
        const top = yy - r.lines[0][1] - 4, hgt = r.lines.reduce((s, [, f]) => s + f * 1.3 + 2, 0) + 20;
        g += `<rect x="${G.cx - 14}" y="${f1(top)}" width="${DW - G.cx + 2}" height="${f1(hgt)}" rx="14" ${fill('color-mix(in oklab, var(--sim-accent) 12%, var(--sim-bg-surface))', 'stroke:var(--sim-accent);stroke-width:3')}/>`;
      }
      r.lines.forEach(([t, fs], j) => {
        if (j) yy += fs * 1.3 + (j === 1 ? 8 : 2);
        g += text(G.cx, yy, t, fs, j ? 'var(--sim-label-muted)' : 'var(--sim-label)');
      });
      if (r.who) for (let p = 0; p < 7; p++) g += icon('person', P ? G.cx + 100 + p * 22 : G.cx + 200 + p * 26, P ? y - 12 : y - 6, 30, p + 1);
      svg += `<g class="lg-pop" style="--d:${del}s">${g}</g>`;
    });
    return { svg, over, btn: G.btn };
  }

  testState() { return { view: this.stepIndex, still: this.still }; }
}
