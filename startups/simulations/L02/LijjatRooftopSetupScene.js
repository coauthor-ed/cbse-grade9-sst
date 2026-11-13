/**
 * LijjatRooftopSetupScene - L02 s02 "Seven women on a rooftop" (poe-predict setup, 1 beat). SvgScene, design
 * 560 x 480 landscape, 390 x 620 portrait. The situation only, never the answer (no dough going home).
 *   b0 The top of a Mumbai chawl (a long building of small one-room homes, an open gallery on each floor) with
 *      seven women on its rooftop (the hero, a row across the board). In front of them on a mat: borrowed
 *      rolling boards and pins (chip "borrowed"). Above: "Mumbai, 1959"; a recipe sheet ("papad recipe"); a tag
 *      "money to start" Rs 80; a factory icon crossed out ("no factory").
 * The women pop in (0.1-1.0 s), then the props; a Skip / Replay button sits in the figure. Rest = the final frame.
 * The seven women are the same seven in LijjatGrowthTimelineScene and LijjatMembersScene (lijjat1..7, tops in
 * series 1-7). Drawn here: chawl facade, rolling board and pin, the cross. No logo, no packaging, no brand.
 * Colours are tokens only. ASCII only.
 */
import { SvgScene, fill, stroke } from 'simulations/base/kit/SimSvg.js';
import { iconSvg } from 'simulations/base/kit/SimIcons.js';
import { MONEY_CSS, tag, paper } from '../shared/MoneyKit.js';
import { PEOPLE_CSS, personSlot, paintPeople, frontSvg, registerCast } from '../shared/FinPeople.js';

const f1 = (v) => (+v).toFixed(1);
const MAIN = [[{ idx: 0, dwellMs: null }]];
const DUR = [2.0];

const W7 = [
  { outfit: 'drape', hairStyle: 'bun' }, { outfit: 'kurti', hairStyle: 'braid', dupatta: true }, { outfit: 'drape', hairStyle: 'long' },
  { outfit: 'kurti', hairStyle: 'bun', dupatta: true }, { outfit: 'drape', hairStyle: 'braid' }, { outfit: 'kurti', hairStyle: 'long', dupatta: true },
  { outfit: 'drape', hairStyle: 'bun' },
];
W7.forEach((w, i) => registerCast(`lijjat${i + 1}`, { name: 'Member', series: i + 1, role: 'adult', i: 51 + i,
  look: { top: `s${i + 1}`, bottom: w.outfit === 'drape' ? `s${i + 1}` : 'cream', bottomStyle: 'long-skirt', trim: 'cream', shoeStyle: 'sandal', shoe: 'brown', pattern: 'plain', moustache: false, glasses: false, dupatta: false, girth: 1 + (i % 3) * 0.04, ...w } }));

const CSS = `
.lr-chip { position: absolute; transform: translate(-50%, -50%); white-space: nowrap; padding: 4px 12px; border-radius: 999px;
  font: 800 20px/1.2 var(--sim-font); color: var(--sim-label); background: var(--sim-bg-surface); border: 2.5px solid var(--sim-stroke); }
.lr-chip.big { font-size: 26px; padding: 6px 16px; border-color: var(--sim-accent); }
.lr-btn { position: absolute; cursor: pointer; padding: 6px 14px; border-radius: calc(12px * var(--look-radius, 1));
  font: 800 18px/1.1 var(--sim-font); color: var(--sim-label); background: var(--sim-bg-surface);
  border: 2.5px solid var(--sim-stroke); box-shadow: 0 calc(3px * var(--look-lip, 1)) 0 var(--sim-stroke); }
.lr-btn:active { transform: translateY(3px); box-shadow: none; }
.lr-btn:focus-visible { outline: 3px solid var(--sim-accent); outline-offset: 3px; }
.lr-in { animation: lr-in 0.5s cubic-bezier(.3,1.4,.5,1) both; animation-delay: var(--d, 0s); }
@keyframes lr-in { 0% { opacity: 0; transform: translate(-50%, -50%) scale(0.6); } 100% { opacity: 1; transform: translate(-50%, -50%); } }
svg .lr-pop { transform-box: fill-box; transform-origin: center; animation: lr-pop 0.5s cubic-bezier(.3,1.4,.5,1) both; animation-delay: var(--d, 0s); }
@keyframes lr-pop { 0% { opacity: 0; transform: scale(0.5); } 100% { opacity: 1; transform: none; } }
.lr-still, .lr-still * { animation: none !important; }
@media (prefers-reduced-motion: reduce) { .lr-in, svg .lr-pop { animation: none; } }
`;

const WALL = 'color-mix(in oklab, var(--sim-series-8) 22%, var(--sim-bg-surface))';
const WALL_RIM = 'color-mix(in oklab, var(--sim-series-8) 40%, var(--sim-label) 45%)';
const DOOR = 'color-mix(in oklab, var(--sim-series-8) 50%, var(--sim-label) 25%)';
const WOOD = 'color-mix(in oklab, var(--sim-series-8) 45%, var(--sim-bg-surface))';

function icon(name, x, y, size, tone) {
  return iconSvg(name, tone).replace('width="48" height="48"', `x="${f1(x - size / 2)}" y="${f1(y - size / 2)}" width="${f1(size)}" height="${f1(size)}"`);
}

/** The chawl: a facade from y0 down to y1, an open gallery with a railing on each floor, a door and a window per room. */
function chawl(x0, x1, y0, y1, floors) {
  const fh = (y1 - y0) / floors;
  let s = `<rect x="${x0}" y="${y0}" width="${x1 - x0}" height="${y1 - y0}" ${fill(WALL, `stroke:${WALL_RIM};stroke-width:2.5`)}/>`;
  for (let f = 0; f < floors; f++) {
    const fy = y0 + f * fh;
    for (let x = x0 + 14; x + 46 < x1; x += 62) {
      s += `<rect x="${f1(x)}" y="${f1(fy + fh * 0.2)}" width="22" height="${f1(fh * 0.66)}" rx="3" ${fill(DOOR, `stroke:${WALL_RIM};stroke-width:2`)}/>`
        + `<rect x="${f1(x + 30)}" y="${f1(fy + fh * 0.28)}" width="20" height="${f1(fh * 0.3)}" rx="3" ${fill('var(--sim-sky-day)', `stroke:${WALL_RIM};stroke-width:2`)}/>`;
    }
    const ry = fy + fh * 0.6;
    s += `<path d="M${x0} ${f1(ry)}H${x1}M${x0} ${f1(fy + fh * 0.88)}H${x1}" ${stroke(WALL_RIM, 3)}/>`;
    for (let x = x0 + 8; x < x1; x += 14) s += `<path d="M${x} ${f1(ry)}V${f1(fy + fh * 0.88)}" ${stroke(WALL_RIM, 1.5)} style="opacity:0.7"/>`;
  }
  return s;
}

function board(x, y, s = 1) {
  const rim = 'color-mix(in oklab, var(--sim-series-8) 40%, var(--sim-label) 55%)';
  return `<ellipse cx="${f1(x)}" cy="${f1(y + 3)}" rx="${f1(30 * s)}" ry="${f1(11 * s)}" ${fill(rim)}/>`
    + `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="${f1(30 * s)}" ry="${f1(11 * s)}" ${fill(WOOD, `stroke:${rim};stroke-width:2.5`)}/>`
    + `<rect x="${f1(x - 26 * s)}" y="${f1(y - 22 * s)}" width="${f1(52 * s)}" height="${f1(9 * s)}" rx="${f1(4.5 * s)}" transform="rotate(-12 ${f1(x)} ${f1(y - 18 * s)})" ${fill(WOOD, `stroke:${rim};stroke-width:2.5`)}/>`;
}

const chip = (t, x, y, d, big) => `<div class="lr-chip lr-in${big ? ' big' : ''}" style="left:${f1(x)}px;top:${f1(y)}px;--d:${d}s">${t}</div>`;

export class LijjatRooftopSetupScene extends SvgScene {
  static WIDTH = 560;
  static PORTRAIT_WIDTH = 390;
  static HEIGHT = 480;
  static PORTRAIT_HEIGHT = 620;
  static CONTINUOUS = false;
  static BEAT_STEP_MAP = MAIN;
  static BEAT_MAPS = { 1: MAIN };
  static CONTROLS = [];
  static ARIA_LABEL = 'Mumbai, 1959: seven women stand on the rooftop of a chawl, an old building of small one-room homes. In front of them are borrowed rolling boards and pins. They have a papad recipe and 80 rupees. There is no factory.';

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
    if (this._timers) this.after(DUR[0], () => { if (run === this.run) this.finish(); });
    if (!quiet) this.repaint();
  }

  finish() { this.run++; this.still = true; this.repaint(); }

  repaint() { super.repaint(); paintPeople(this); }

  stageHeight(st) { return Math.round((st.portrait ? 620 : 480) * st.W / (st.portrait ? 390 : 560)); }

  paint(st) {
    const P = st.portrait, DW = P ? 390 : 560, DH = P ? 620 : 480, k = (st.W / DW).toFixed(4);
    const G = P
      ? { year: [104, 36], fac: [318, 58, 66], facChip: [318, 122], rec: [72, 150, 62], recChip: [74, 212], tag: [262, 186, 160],
        roof: 432, rows: [[380, 128, [78, 162, 246, 330]], [436, 140, [118, 204, 290]]], boards: [[104, 470], [196, 474], [288, 470]], borrowed: [196, 516],
        wall: [490, 620, 1], btn: 'right:10px;bottom:10px' }
      : { year: [128, 36], fac: [500, 62, 70], facChip: [500, 128], rec: [256, 62, 60], recChip: [256, 124], tag: [384, 72, 150],
        roof: 316, rows: [[312, 150, [52, 126, 200, 274, 348, 422, 496]]], boards: [[150, 336], [280, 340], [410, 336]], borrowed: [280, 384],
        wall: [356, 480, 2], btn: 'left:10px;bottom:10px' };
    let svg = '';
    // the chawl below the roof: roof slab, low parapet, facade
    const [wy0, wy1, fl] = G.wall;
    svg += `<path d="M0 ${G.roof - 6}H${DW}V${wy0}H0Z" ${fill('color-mix(in oklab, var(--sim-series-8) 14%, var(--sim-bg-surface))', `stroke:${WALL_RIM};stroke-width:2.5`)}/>`;
    svg += chawl(0, DW, wy0, wy1, fl);
    // the mat in front of the women
    let front = `<rect x="${f1(G.boards[0][0] - 54)}" y="${f1(G.boards[0][1] - 18)}" width="${f1(G.boards[2][0] - G.boards[0][0] + 108)}" height="46" rx="10" ${fill('color-mix(in oklab, var(--sim-series-5) 30%, var(--sim-bg-surface))', `stroke:${WALL_RIM};stroke-width:2`)}/>`;
    G.boards.forEach(([x, y], i) => { front += `<g class="lr-pop" style="--d:${(1.1 + i * 0.1).toFixed(2)}s">${board(x, y, P ? 1.05 : 1.15)}</g>`; });
    let over = '';
    let n = 0;
    G.rows.forEach(([y, h, xs]) => xs.forEach((x) => { n++; over += personSlot(`lijjat${n}`, { x, y, h, mood: 'smile', cls: 'mpp-pop', style: `--d:${(0.1 + n * 0.11).toFixed(2)}s;` }); }));
    over += frontSvg(DW, DH, front);
    // above: the year, the recipe, the money, no factory
    svg += `<g class="lr-pop" style="--d:1.3s">${paper(G.rec[0], G.rec[1], G.rec[2])}</g>`;
    svg += `<g class="lr-pop" style="--d:1.5s">${tag(G.tag[0], G.tag[1], 'money to start', 80, { w: G.tag[2], labelSize: 18, valueSize: 32 })}</g>`;
    const [fx, fy, fs] = G.fac;
    svg += `<g class="lr-pop" style="--d:1.7s"><g style="opacity:0.45">${icon('factory', fx, fy, fs, 'var(--sim-label-muted)')}</g>`
      + `<path d="M${fx - fs * 0.45} ${fy - fs * 0.45}L${fx + fs * 0.45} ${fy + fs * 0.45}M${fx + fs * 0.45} ${fy - fs * 0.45}L${fx - fs * 0.45} ${fy + fs * 0.45}" ${stroke('var(--sim-bad)', 6)} style="stroke-linecap:round"/></g>`;
    over += chip('Mumbai, 1959', G.year[0], G.year[1], 0, true);
    over += chip('papad recipe', G.recChip[0], G.recChip[1], 1.4);
    over += chip('no factory', G.facChip[0], G.facChip[1], 1.8);
    over += chip('borrowed', G.borrowed[0], G.borrowed[1], 1.3);
    const still = this.still ? ' lr-still' : '';
    const btn = `<button type="button" class="sv-hit tap btn lr-btn" data-act="${this.still ? 'replay' : 'skip'}" style="${G.btn}">${this.still ? 'Replay' : 'Skip'}</button>`;
    return {
      svg: `<g class="${still}" transform="scale(${k})">${svg}</g>`,
      over: `<div class="${still}" style="position:absolute;left:0;top:0;width:${DW}px;height:${DH}px;overflow:hidden;transform:scale(${k});transform-origin:0 0">${over}${btn}</div>`,
    };
  }

  testState() { return { view: this.stepIndex, still: this.still }; }
}
