/**
 * BakeryJobsSetupScene - L04 s01 setup for the predict "More than a good recipe" (1 beat). SvgScene, design
 * 560 x 480 landscape, 390 x 600 portrait. Cast: StallKit (bakery, breadLoaf), FinPeople (you, classmate1,
 * classmate2), SimIcons (shop, person, megaphone). Drawn here (no kit prop): a notice board with paper notes and
 * pins, a cake on a stand, a recipe card with a star.
 *   b0 ABC Bakery with a good cake and its recipe card (a star on it); you and your two friends; a notice board
 *      'this week' with the four job notes from the text: bake fresh bread, pay the shop rent, hire a helper,
 *      tell people: mango cake. The notes pin in one by one (0.15 s apart). Nothing links the recipe to any note
 *      (the predict asks which jobs it takes care of): no areas, no answer.
 * No host controls. Colours are tokens only. ASCII only.
 */
import { SvgScene, fill, stroke, shade } from 'simulations/base/kit/SimSvg.js';
import { iconSvg } from 'simulations/base/kit/SimIcons.js';
import { MONEY_CSS } from '../shared/MoneyKit.js';
import { PEOPLE_CSS, personSlot, paintPeople, nameTag, frontSvg } from '../shared/FinPeople.js';
import { STALL_CSS, bakery, breadLoaf } from '../shared/StallKit.js';

const f1 = (v) => (+v).toFixed(1);
const MAIN = [[{ idx: 0, dwellMs: null }]];

const CSS = `
svg .bj-pin { transform-box: fill-box; transform-origin: center top; animation: bj-pin 0.5s cubic-bezier(.3,1.5,.5,1) both; animation-delay: var(--d, 0s); }
@keyframes bj-pin { 0% { transform: translateY(-24px) rotate(-6deg); opacity: 0; } 100% { transform: none; opacity: 1; } }
@media (prefers-reduced-motion: reduce) { svg .bj-pin { animation: none; } }
`;

const text = (x, y, t, size, col = 'var(--sim-label)', anchor = 'middle', w = 800) =>
  `<text x="${f1(x)}" y="${f1(y)}" text-anchor="${anchor}" style="fill:${col};font:${w} ${size}px var(--sim-font)">${t}</text>`;
const rect = (x, y, w, h, rx, col, extra = '') => `<rect x="${f1(x)}" y="${f1(y)}" width="${f1(w)}" height="${f1(h)}" rx="${f1(rx)}" ${fill(col, extra)}/>`;
const icon = (name, tone, x, y, s) => `<g transform="translate(${f1(x - s / 2)} ${f1(y - s / 2)}) scale(${(s / 48).toFixed(3)})">${iconSvg(name, tone)}</g>`;

const PAPER = 'color-mix(in oklab, var(--sim-series-2) 12%, var(--sim-bg-surface))';
const CORK = 'color-mix(in oklab, var(--sim-series-8) 26%, var(--sim-bg-surface))';
const FRAME = 'color-mix(in oklab, var(--sim-series-8) 55%, var(--sim-label) 30%)';

/** A five-point star, centre (x, y), outer radius r. */
function star(x, y, r, col) {
  let d = '';
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.45 : r;
    d += `${i ? 'L' : 'M'}${f1(x + Math.cos(a) * rr)} ${f1(y + Math.sin(a) * rr)}`;
  }
  return `<path d="${d}Z" ${fill(col, `stroke:${shade(col, 62)};stroke-width:2;stroke-linejoin:round`)}/>`;
}

/** A round two-layer cake on a stand; (x, y) bottom centre, w across. */
function cake(x, y, w) {
  const sponge = 'color-mix(in oklab, var(--sim-series-8) 50%, var(--sim-label) 22%)', cream = 'color-mix(in oklab, var(--sim-series-4) 28%, var(--sim-bg-surface))';
  const rim = 'var(--sim-stroke)', stand = 'var(--sim-bg-surface)';
  const sy = y - w * 0.16, h = w * 0.42, x0 = x - w * 0.4, cw = w * 0.8;
  let s = rect(x - w * 0.08, sy, w * 0.16, w * 0.16, 3, stand, `stroke:${rim};stroke-width:2.5`)
    + rect(x - w * 0.22, y - 6, w * 0.44, 8, 4, stand, `stroke:${rim};stroke-width:2.5`)
    + rect(x - w / 2, sy - 8, w, 10, 5, stand, `stroke:${rim};stroke-width:2.5`);
  const top = sy - 8 - h;
  s += rect(x0, top, cw, h, 10, sponge, `stroke:${shade(sponge, 62)};stroke-width:2.5`);
  s += rect(x0, top + h * 0.45, cw, h * 0.14, 0, cream);
  s += `<path d="M${f1(x0)} ${f1(top + h * 0.22)}q${f1(cw / 8)} ${f1(h * 0.24)} ${f1(cw / 4)} 0t${f1(cw / 4)} 0t${f1(cw / 4)} 0t${f1(cw / 4)} 0V${f1(top + 8)}a8 8 0 0 0 -8 -8H${f1(x0 + 8)}a8 8 0 0 0 -8 8Z" ${fill(cream, `stroke:${shade(cream, 66)};stroke-width:2`)}/>`;
  s += `<circle cx="${f1(x)}" cy="${f1(top - w * 0.05)}" r="${f1(w * 0.06)}" ${fill('var(--sim-series-6)', `stroke:${shade('var(--sim-series-6)', 62)};stroke-width:1.5`)}/>`;
  return s;
}

/** A recipe card with a star; (x, y) centre. */
function recipeCard(x, y, w, h) {
  let s = rect(x - w / 2, y - h / 2 + 4, w, h, 10, 'var(--sim-stroke)') + rect(x - w / 2, y - h / 2, w, h, 10, PAPER, 'stroke:var(--sim-stroke);stroke-width:2.5');
  s += text(x, y - h / 2 + 30, 'recipe', 22, 'var(--sim-label)');
  for (let i = 0; i < 3; i++) s += `<path d="M${f1(x - w / 2 + 14)} ${f1(y - h / 2 + 50 + i * 16)}h${f1(w * (i === 2 ? 0.42 : 0.7))}" ${stroke('var(--sim-label-muted)', 3, 'stroke-linecap:round')}/>`;
  s += star(x + w / 2 - 22, y + h / 2 - 22, 18, 'var(--sim-series-2)');
  return s;
}

const JOBS = [
  { lines: ['bake fresh', 'bread'], art: (x, y) => breadLoaf(x, y + 16, 62) },
  { lines: ['pay the', 'shop rent'], art: (x, y) => icon('shop', 6, x, y, 46) },
  { lines: ['hire a', 'helper'], art: (x, y) => icon('person', 3, x, y, 44) },
  { lines: ['tell people:', 'mango cake'], art: (x, y) => icon('megaphone', 5, x, y, 46) },
];

/** One job note on the board; (x, y) top left. */
function note(j, x, y, w, h, fs, d) {
  let s = rect(x + 3, y + 5, w, h, 6, 'color-mix(in oklab, var(--sim-label) 18%, transparent)') + rect(x, y, w, h, 6, PAPER, 'stroke:var(--sim-stroke);stroke-width:2');
  s += j.art(x + w / 2, y + h * 0.33);
  j.lines.forEach((l, i) => { s += text(x + w / 2, y + h - 38 + i * (fs + 4), l, fs, 'var(--sim-label)'); });
  s += `<circle cx="${f1(x + w / 2)}" cy="${f1(y + 8)}" r="7" ${fill('var(--sim-series-6)', `stroke:${shade('var(--sim-series-6)', 60)};stroke-width:2`)}/>`;
  return `<g class="bj-pin" style="--d:${d.toFixed(2)}s">${s}</g>`;
}

export class BakeryJobsSetupScene extends SvgScene {
  static WIDTH = 560;
  static PORTRAIT_WIDTH = 390;
  static HEIGHT = 480;
  static PORTRAIT_HEIGHT = 600;
  static CONTINUOUS = false;
  static BEAT_STEP_MAP = MAIN;
  static BEAT_MAPS = { 1: MAIN, [Number.MAX_SAFE_INTEGER]: MAIN };
  static CONTROLS = [];
  static ARIA_LABEL = 'ABC Bakery is open and its cake is very good: a cake on a stand and a recipe card with a star. You and your two friends stand by a notice board for this week with four job notes: bake fresh bread, pay the shop rent, hire a helper, and tell people about the new mango cake.';

  css() { return MONEY_CSS + PEOPLE_CSS + STALL_CSS + CSS; }

  repaint() { super.repaint(); paintPeople(this); }

  stageHeight(st) { return Math.round((st.portrait ? 600 : 480) * st.W / (st.portrait ? 390 : 560)); }

  paint(st) {
    const P = st.portrait, DW = P ? 390 : 560, DH = P ? 600 : 480, k = (st.W / DW).toFixed(4);
    const G = P
      ? { board: [10, 8, 370, 282], title: 42, notes: [[24, 56], [200, 56], [24, 170], [200, 170]], nw: 166, nh: 106, fs: 20,
        bk: [104, 480, 176], pave: [468, 490], kids: [246, 300, 354], gy: 482, kh: 124, cake: [70, 594, 96], card: [190, 544, 112, 100] }
      : { board: [240, 10, 310, 312], title: 44, notes: [[254, 60], [400, 60], [254, 186], [400, 186]], nw: 136, nh: 116, fs: 19,
        bk: [120, 300, 218], pave: [290, 312], kids: [310, 390, 470], gy: 470, kh: 110, cake: [66, 462, 104], card: [178, 398, 112, 112] };
    const [bx, by, bw, bh] = G.board;
    let svg = rect(0, G.pave[0], DW, G.pave[1] - G.pave[0], 8, 'color-mix(in oklab, var(--sim-stroke) 22%, var(--sim-bg-surface))');
    svg += bakery(G.bk[0], G.bk[1], G.bk[2]);
    // the good cake and its recipe
    svg += cake(G.cake[0], G.cake[1], G.cake[2]) + recipeCard(...G.card);
    // the notice board
    svg += rect(bx, by + 5, bw, bh, 12, shade(FRAME, 70)) + rect(bx, by, bw, bh, 12, FRAME) + rect(bx + 9, by + 9, bw - 18, bh - 18, 6, CORK);
    svg += text(bx + bw / 2, by + G.title, 'this week', 26, 'var(--sim-label)');
    JOBS.forEach((j, i) => { svg += note(j, G.notes[i][0], G.notes[i][1], G.nw, G.nh, G.fs, 0.2 + i * 0.15); });
    let over = '';
    ['you', 'classmate1', 'classmate2'].forEach((w, i) => { over += personSlot(w, { x: G.kids[i], y: G.gy, h: G.kh, facing: 0, mood: i ? 'smile' : 'think' }); });
    over += frontSvg(DW, DH, nameTag(G.kids[0], G.gy - G.kh - 32, 'you', 18));
    return { svg: `<g transform="scale(${k})">${svg}</g>`, over: `<div style="position:absolute;left:0;top:0;width:${DW}px;height:${DH}px;overflow:hidden;transform:scale(${k});transform-origin:0 0">${over}</div>` };
  }

  testState() { return { view: this.stepIndex, jobs: JOBS.length }; }
}
