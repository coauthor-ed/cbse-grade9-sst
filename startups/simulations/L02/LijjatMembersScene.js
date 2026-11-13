/**
 * LijjatMembersScene - L02 s04 (2 beats). SvgScene, design 560 x 480 landscape, 390 x 620 portrait.
 *   b0 Buses and scholarships: early morning (a low sun, a dawn wash). A plain bus (no name, no logo) drives in
 *      along the road from the members' homes (a chawl, left) to the centre (right); two members walk to its
 *      door; a two-way arrow under the road, "picks up, drops back". Below: a member with her school-going child
 *      (uniform, school bag) and a scholarship paper with an arrow to the school ("scholarship").
 *   b1 Women with their own income: "financially independent" on top; four members, each with her own purse;
 *      coins drop into each purse ("earns her own money"); a thought bubble over each shows a different use
 *      (books for school, savings, the home, grain for food): "decides how to use it". A faint crowd behind them
 *      stands for the thousands of members.
 * Animation is CSS only; a Skip / Replay button sits in the figure. Rest = the final frame.
 * Same seven women as LijjatRooftopSetupScene (lijjat1..7). Drawn here: bus, chawl block, centre, purse, school
 * bag, thought bubble. Colours are tokens only. ASCII only.
 */
import { SvgScene, fill, stroke } from 'simulations/base/kit/SimSvg.js';
import { iconSvg } from 'simulations/base/kit/SimIcons.js';
import { MONEY_CSS, coin, paper, gullak } from '../shared/MoneyKit.js';
import { PEOPLE_CSS, personSlot, paintPeople, frontSvg, registerCast } from '../shared/FinPeople.js';

const f1 = (v) => (+v).toFixed(1);
const MAIN = [[{ idx: 0, dwellMs: null }], [{ idx: 1, dwellMs: null }]];
const DUR = [2.6, 2.6];

const W7 = [
  { outfit: 'drape', hairStyle: 'bun' }, { outfit: 'kurti', hairStyle: 'braid', dupatta: true }, { outfit: 'drape', hairStyle: 'long' },
  { outfit: 'kurti', hairStyle: 'bun', dupatta: true }, { outfit: 'drape', hairStyle: 'braid' }, { outfit: 'kurti', hairStyle: 'long', dupatta: true },
  { outfit: 'drape', hairStyle: 'bun' },
];
W7.forEach((w, i) => registerCast(`lijjat${i + 1}`, { name: 'Member', series: i + 1, role: 'adult', i: 51 + i,
  look: { top: `s${i + 1}`, bottom: w.outfit === 'drape' ? `s${i + 1}` : 'cream', bottomStyle: 'long-skirt', trim: 'cream', shoeStyle: 'sandal', shoe: 'brown', pattern: 'plain', moustache: false, glasses: false, dupatta: false, girth: 1 + (i % 3) * 0.04, ...w } }));
registerCast('lijjatchild', { name: 'Child', series: 0, role: 'child', i: 58,
  look: { outfit: 'shirt', top: 'white', bottom: 'navy', bottomStyle: 'shorts', hairStyle: 'short', shoeStyle: 'shoe', shoe: 'brown', pattern: 'plain', moustache: false, glasses: false, dupatta: false, girth: 1, sleeves: 'short' } });

const CSS = `
.lm-chip { position: absolute; transform: translate(-50%, -50%); white-space: nowrap; padding: 4px 12px; border-radius: 999px;
  font: 800 20px/1.2 var(--sim-font); color: var(--sim-label); background: var(--sim-bg-surface); border: 2.5px solid var(--sim-stroke); }
.lm-chip.acc { border-color: var(--sim-accent); background: color-mix(in oklab, var(--sim-accent) 14%, var(--sim-bg-surface)); }
.lm-chip.big { font-size: 26px; padding: 6px 18px; }
.lm-btn { position: absolute; cursor: pointer; padding: 6px 14px; border-radius: calc(12px * var(--look-radius, 1));
  font: 800 18px/1.1 var(--sim-font); color: var(--sim-label); background: var(--sim-bg-surface);
  border: 2.5px solid var(--sim-stroke); box-shadow: 0 calc(3px * var(--look-lip, 1)) 0 var(--sim-stroke); }
.lm-btn:active { transform: translateY(3px); box-shadow: none; }
.lm-btn:focus-visible { outline: 3px solid var(--sim-accent); outline-offset: 3px; }
.lm-in { animation: lm-in 0.5s cubic-bezier(.3,1.4,.5,1) both; animation-delay: var(--d, 0s); }
@keyframes lm-in { 0% { opacity: 0; transform: translate(-50%, -50%) scale(0.6); } 100% { opacity: 1; transform: translate(-50%, -50%); } }
svg .lm-pop { transform-box: fill-box; transform-origin: center; animation: lm-pop 0.5s cubic-bezier(.3,1.4,.5,1) both; animation-delay: var(--d, 0s); }
@keyframes lm-pop { 0% { opacity: 0; transform: scale(0.5); } 100% { opacity: 1; transform: none; } }
svg .lm-move { animation: lm-move 1.1s cubic-bezier(.3,0,.25,1) both; animation-delay: var(--d, 0s); }
@keyframes lm-move { 0% { transform: translate(var(--fx, 0px), var(--fy, 0px)); } 100% { transform: none; } }
svg .lm-drop { animation: lm-drop 0.6s cubic-bezier(.5,0,.8,.4) both; animation-delay: var(--d, 0s); }
@keyframes lm-drop { 0% { opacity: 0; transform: translateY(-70px); } 20% { opacity: 1; } 100% { opacity: 1; transform: none; } }
.lm-still, .lm-still * { animation: none !important; }
@media (prefers-reduced-motion: reduce) { .lm-in, svg .lm-pop, svg .lm-move, svg .lm-drop { animation: none; } }
`;

const WALL = 'color-mix(in oklab, var(--sim-series-8) 22%, var(--sim-bg-surface))';
const RIM = 'color-mix(in oklab, var(--sim-series-8) 40%, var(--sim-label) 45%)';
const DOOR = 'color-mix(in oklab, var(--sim-series-8) 50%, var(--sim-label) 25%)';
const LEATHER = 'color-mix(in oklab, var(--sim-series-8) 60%, var(--sim-label) 15%)';

function icon(name, x, y, size, tone) {
  return iconSvg(name, tone).replace('width="48" height="48"', `x="${f1(x - size / 2)}" y="${f1(y - size / 2)}" width="${f1(size)}" height="${f1(size)}"`);
}
function chawlBlock(x0, x1, y0, y1) {
  let s = `<rect x="${x0}" y="${y0}" width="${x1 - x0}" height="${y1 - y0}" ${fill(WALL, `stroke:${RIM};stroke-width:2.5`)}/>`;
  const fh = (y1 - y0) / 3;
  for (let f = 0; f < 3; f++) {
    const fy = y0 + f * fh;
    for (let x = x0 + 10; x + 30 < x1; x += 40) s += `<rect x="${x}" y="${f1(fy + fh * 0.22)}" width="16" height="${f1(fh * 0.62)}" rx="2" ${fill(DOOR, `stroke:${RIM};stroke-width:1.5`)}/><rect x="${x + 21}" y="${f1(fy + fh * 0.3)}" width="12" height="${f1(fh * 0.26)}" rx="2" ${fill('var(--sim-sky-day)', `stroke:${RIM};stroke-width:1.5`)}/>`;
    s += `<path d="M${x0} ${f1(fy + fh * 0.88)}H${x1}" ${stroke(RIM, 2.5)}/>`;
  }
  return s;
}
function centre(x, y, w) {
  const h = w * 0.72, x0 = x - w / 2;
  let s = `<rect x="${f1(x0)}" y="${f1(y - h)}" width="${f1(w)}" height="${f1(h)}" rx="4" ${fill(WALL, `stroke:${RIM};stroke-width:2.5`)}/>`
    + `<path d="M${f1(x0 - 10)} ${f1(y - h)}H${f1(x0 + w + 10)}L${f1(x0 + w - 6)} ${f1(y - h - 20)}H${f1(x0 + 6)}Z" ${fill(DOOR, `stroke:${RIM};stroke-width:2.5;stroke-linejoin:round`)}/>`;
  [0.28, 0.72].forEach((t) => { s += `<rect x="${f1(x0 + w * t - 12)}" y="${f1(y - h * 0.62)}" width="24" height="${f1(h * 0.62)}" rx="3" ${fill(DOOR, `stroke:${RIM};stroke-width:2`)}/>`; });
  return s;
}
/** A plain bus, side view facing right; (x, y) = ground under the middle; w long. Members sit at the windows. */
function bus(x, y, w) {
  const h = w * 0.42, x0 = x - w / 2, y0 = y - h - w * 0.06, body = 'var(--sim-series-4)', rim = 'color-mix(in oklab, var(--sim-series-4) 60%, var(--sim-label))';
  let s = `<rect x="${f1(x0)}" y="${f1(y0)}" width="${f1(w)}" height="${f1(h)}" rx="${f1(h * 0.18)}" ${fill(body, `stroke:${rim};stroke-width:3`)}/>`
    + `<rect x="${f1(x0)}" y="${f1(y0 + h * 0.72)}" width="${f1(w)}" height="${f1(h * 0.1)}" ${fill('var(--sim-bg-surface)')} style="opacity:0.7"/>`;
  const nw = 4, ww = w * 0.13;
  for (let i = 0; i < nw; i++) {
    const wx = x0 + w * 0.06 + i * (ww + w * 0.035);
    s += `<rect x="${f1(wx)}" y="${f1(y0 + h * 0.14)}" width="${f1(ww)}" height="${f1(h * 0.36)}" rx="5" ${fill('var(--sim-sky-day)', `stroke:${rim};stroke-width:2`)}/>`
      + `<circle cx="${f1(wx + ww / 2)}" cy="${f1(y0 + h * 0.36)}" r="${f1(h * 0.09)}" ${fill(`var(--sim-series-${[1, 3, 5, 6][i]})`)}/>`;
  }
  const dx = x0 + w * 0.74;
  s += `<rect x="${f1(dx)}" y="${f1(y0 + h * 0.14)}" width="${f1(w * 0.1)}" height="${f1(h * 0.8)}" rx="4" ${fill('color-mix(in oklab, var(--sim-sky-day) 70%, var(--sim-label) 10%)', `stroke:${rim};stroke-width:2`)}/>`
    + `<rect x="${f1(x0 + w * 0.88)}" y="${f1(y0 + h * 0.14)}" width="${f1(w * 0.1)}" height="${f1(h * 0.36)}" rx="5" ${fill('var(--sim-sky-day)', `stroke:${rim};stroke-width:2`)}/>`;
  [0.2, 0.8].forEach((t) => {
    const cx = x0 + w * t;
    s += `<circle cx="${f1(cx)}" cy="${f1(y - h * 0.18)}" r="${f1(h * 0.2)}" ${fill('var(--sim-label)')}/><circle cx="${f1(cx)}" cy="${f1(y - h * 0.18)}" r="${f1(h * 0.08)}" ${fill('var(--sim-bg-surface)')}/>`;
  });
  return s;
}
function purse(x, y, s = 1) {
  return `<path d="M${f1(x - 18 * s)} ${f1(y - 14 * s)}Q${f1(x - 30 * s)} ${f1(y + 22 * s)} ${f1(x)} ${f1(y + 22 * s)}Q${f1(x + 30 * s)} ${f1(y + 22 * s)} ${f1(x + 18 * s)} ${f1(y - 14 * s)}Z" ${fill(LEATHER, `stroke:${RIM};stroke-width:2.5;stroke-linejoin:round`)}/>`
    + `<path d="M${f1(x - 20 * s)} ${f1(y - 14 * s)}q${f1(10 * s)} ${f1(-8 * s)} ${f1(20 * s)} 0q${f1(10 * s)} ${f1(8 * s)} ${f1(20 * s)} 0" ${stroke(RIM, 3)}/>`
    + `<path d="M${f1(x - 6 * s)} ${f1(y - 16 * s)}l${f1(-8 * s)} ${f1(-14 * s)}M${f1(x + 6 * s)} ${f1(y - 16 * s)}l${f1(8 * s)} ${f1(-14 * s)}" ${stroke(RIM, 2.5)}/>`;
}
function schoolBag(x, y) {
  const col = 'var(--sim-series-2)', rim = 'color-mix(in oklab, var(--sim-series-2) 60%, var(--sim-label))';
  return `<rect x="${f1(x - 15)}" y="${f1(y - 22)}" width="30" height="40" rx="8" ${fill(col, `stroke:${rim};stroke-width:2.5`)}/>`
    + `<rect x="${f1(x - 11)}" y="${f1(y - 4)}" width="22" height="13" rx="4" ${fill('color-mix(in oklab, var(--sim-series-2) 70%, var(--sim-bg-surface))', `stroke:${rim};stroke-width:2`)}/>`;
}
function bubble(x, y, r, inner) {
  return `<circle cx="${f1(x - r * 0.5)}" cy="${f1(y + r * 1.35)}" r="${f1(r * 0.14)}" ${fill('var(--sim-bg-surface)', 'stroke:var(--sim-stroke);stroke-width:2')}/>`
    + `<circle cx="${f1(x - r * 0.3)}" cy="${f1(y + r * 1.12)}" r="${f1(r * 0.2)}" ${fill('var(--sim-bg-surface)', 'stroke:var(--sim-stroke);stroke-width:2')}/>`
    + `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(r)}" ${fill('var(--sim-bg-surface)', 'stroke:var(--sim-stroke);stroke-width:2.5')}/>` + inner;
}

const chip = (t, x, y, d, cls) => `<div class="lm-chip lm-in${cls ? ` ${cls}` : ''}" style="left:${f1(x)}px;top:${f1(y)}px;--d:${d}s">${t}</div>`;

export class LijjatMembersScene extends SvgScene {
  static WIDTH = 560;
  static PORTRAIT_WIDTH = 390;
  static HEIGHT = 480;
  static PORTRAIT_HEIGHT = 620;
  static CONTINUOUS = false;
  static BEAT_STEP_MAP = MAIN;
  static BEAT_MAPS = { 2: MAIN };
  static CONTROLS = [];
  static ARIA_LABEL = 'Early in the morning a bus picks members up from their homes and takes them to the Lijjat centre, and drops them back later. A member\'s school-going child holds a scholarship paper, with an arrow to the school. Then: financially independent. Four members each have their own purse; coins drop in, so each earns her own money, and a bubble over each shows how she decides to use it: books for school, savings, the home, food.';

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
    const out = v === 1 ? this.paintIncome(P, DW, DH) : this.paintBus(P, DW, DH);
    const still = this.still ? ' lm-still' : '';
    const btn = `<button type="button" class="sv-hit tap btn lm-btn" data-act="${this.still ? 'replay' : 'skip'}" style="${out.btn}">${this.still ? 'Replay' : 'Skip'}</button>`;
    return {
      svg: `<g class="${still}" transform="scale(${k})">${out.svg}</g>`,
      over: `<div class="${still}" style="position:absolute;left:0;top:0;width:${DW}px;height:${DH}px;overflow:hidden;transform:scale(${k});transform-origin:0 0">${out.over ?? ''}${btn}</div>`,
    };
  }

  // b0: the early bus, the scholarship.
  paintBus(P, DW, DH) {
    const G = P
      ? { road: 252, chawl: [0, 96, 92], cen: [334, 104], bus: [238, 176], walkers: [[106, 118], [130, 118]], sun: [44, 70], am: [140, 34], two: [195, 300],
        div: 334, mom: [82, 590, 170], kid: [168, 590, 112], pap: [246, 486, 58], sch: [334, 520, 84], schChip: [262, 380], btn: 'right:10px;top:10px' }
      : { road: 262, chawl: [0, 130, 110], cen: [492, 120], bus: [326, 230], walkers: [[146, 128], [174, 128]], sun: [520, 60], am: [110, 34], two: [300, 308],
        div: 336, mom: [96, 470, 150], kid: [176, 470, 104], pap: [262, 408, 54], sch: [452, 410, 80], schChip: [356, 362], btn: 'right:10px;bottom:10px' };
    const rd = G.road;
    let svg = `<rect x="0" y="0" width="${DW}" height="${rd}" ${fill('color-mix(in oklab, var(--sim-sky-dusk) 28%, transparent)')}/>`;
    svg += `<circle cx="${G.sun[0]}" cy="${G.sun[1]}" r="30" ${fill('color-mix(in oklab, var(--sim-gold) 80%, var(--sim-sky-dusk))')}/>`;
    svg += chawlBlock(G.chawl[0], G.chawl[1], rd - G.chawl[2] * 1.6, rd);
    svg += centre(G.cen[0], rd, G.cen[1]);
    svg += `<rect x="0" y="${rd}" width="${DW}" height="34" ${fill('color-mix(in oklab, var(--sim-label) 22%, var(--sim-bg-surface))')}/>`
      + `<path d="M0 ${rd + 17}H${DW}" ${stroke('var(--sim-bg-surface)', 3)} style="stroke-dasharray:16 14"/>`;
    // the two-way arrow: picks up, drops back
    const ty = rd + 52, ax0 = 30, ax1 = DW - 30;
    svg += `<path d="M${ax0} ${ty}H${ax1}M${ax0 + 14} ${ty - 12}l-14 12l14 12M${ax1 - 14} ${ty - 12}l14 12l-14 12" ${stroke('var(--sim-accent)', 4)} style="stroke-linejoin:round"/>`;
    svg += `<path d="M14 ${G.div}H${DW - 14}" ${stroke('var(--sim-stroke)', 2)} style="stroke-dasharray:6 8;opacity:0.6"/>`;
    let over = '';
    G.walkers.forEach(([x, h], i) => { over += personSlot(`lijjat${i * 3 + 1}`, { x, y: rd + 4, h, facing: 1, pose: 'walk', mood: 'smile' }); });
    let front = `<g class="lm-move" style="--d:0.2s;--fx:${-DW}px;--fy:0px">${bus(G.bus[0], rd + 10, G.bus[1])}</g>`;
    // below: a member, her school-going child with a bag, the scholarship and the school
    over += personSlot('lijjat2', { x: G.mom[0], y: G.mom[1], h: G.mom[2], mood: 'happy' });
    over += personSlot('lijjatchild', { x: G.kid[0], y: G.kid[1], h: G.kid[2], mood: 'happy' });
    front += schoolBag(G.kid[0] - G.kid[2] * 0.26, G.kid[1] - G.kid[2] * 0.42);
    front += `<g class="lm-pop" style="--d:1.2s">${paper(G.pap[0], G.pap[1], G.pap[2])}</g>`;
    front += `<g class="lm-pop" style="--d:1.6s">${icon('school', G.sch[0], G.sch[1], G.sch[2], 3)}`
      + `<path d="M${G.pap[0] + G.pap[2] * 0.7} ${G.pap[1]}H${G.sch[0] - G.sch[2] * 0.56}" ${stroke('var(--sim-accent)', 4)}/>`
      + `<path d="M${G.sch[0] - G.sch[2] * 0.56 - 12} ${G.pap[1] - 11}l12 11l-12 11" ${stroke('var(--sim-accent)', 4)} style="stroke-linejoin:round"/></g>`;
    over += frontSvg(DW, DH, front);
    over += chip('early morning', G.am[0], G.am[1], 0);
    over += chip('picks up, drops back', G.two[0], G.two[1], 1.2, 'acc');
    over += chip('scholarship', G.schChip[0], G.schChip[1], 1.4);
    return { svg, over, btn: G.btn };
  }

  // b1: each with her own income, each deciding how to use it.
  paintIncome(P, DW, DH) {
    const G = P
      ? { title: [195, 34], decide: [195, 102], xs: [54, 148, 242, 336], gy: 500, h: 166, by: 196, br: 38, earn: [195, 548], crowd: [252, 300], btn: 'right:10px;bottom:10px' }
      : { title: [280, 32], decide: [280, 84], xs: [80, 213, 346, 479], gy: 418, h: 180, by: 158, br: 44, earn: [280, 452], crowd: [190, 230], btn: 'left:10px;bottom:10px' };
    let svg = '';
    // a faint crowd behind: thousands of members
    for (let r = 0; r < 2; r++) for (let i = 0; i < (P ? 9 : 13); i++) {
      svg += `<g style="opacity:0.28">${icon('person', 22 + i * (P ? 43 : 42) + r * 20, G.crowd[r] + 0, 38, (i + r) % 7 + 1)}</g>`;
    }
    const who = ['lijjat1', 'lijjat3', 'lijjat5', 'lijjat6'];
    const uses = [
      (x, y, r) => icon('book', x, y, r * 1.3, 2),
      (x, y, r) => gullak(x, y + r * 0.6, { w: r * 1.2 }),
      (x, y, r) => icon('house', x, y, r * 1.3, 5),
      (x, y, r) => icon('grain', x, y, r * 1.3, 'var(--sim-series-8)'),
    ];
    let over = '';
    let front = '';
    G.xs.forEach((x, i) => {
      over += personSlot(who[i], { x, y: G.gy, h: G.h, mood: 'happy' });
      const px = x + G.h * 0.2, py = G.gy - G.h * 0.36;
      front += purse(px, py, P ? 1.05 : 1.2);
      front += `<g class="lm-drop" style="--d:${(0.3 + i * 0.15).toFixed(2)}s">${coin(px, py - 6, 11)}</g>`;
      svg += `<g class="lm-pop" style="--d:${(1.2 + i * 0.15).toFixed(2)}s">${bubble(x, G.by, G.br, uses[i](x, G.by, G.br))}</g>`;
    });
    over += frontSvg(DW, DH, front);
    over += chip('financially independent', G.title[0], G.title[1], 0, 'acc big');
    over += chip('decides how to use it', G.decide[0], G.decide[1], 1.4);
    over += chip('earns her own money', G.earn[0], G.earn[1], 0.8);
    return { svg, over, btn: G.btn };
  }

  testState() { return { view: this.stepIndex, still: this.still }; }
}
