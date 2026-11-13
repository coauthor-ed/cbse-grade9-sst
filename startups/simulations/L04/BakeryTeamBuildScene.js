/**
 * BakeryTeamBuildScene - L04 s04 "Human resources" (2 beats). SvgScene, design 560 x 480 landscape, 390 x 600
 * portrait. Cast: shared/FinPeople.js (you; four bakery staff registered here: baker, helper, cleaner, cashier),
 * shared/StallKit.js (banner, bakery, breadLoaf), shared/MoneyKit.js (coin). Drawn here (no kit prop): a broom, a
 * water drop, a cap, a skill badge with a tick, a standards board, a jagged quarrel bubble.
 *   b0 Hiring: four people join the ABC Bakery team one after another (0.4 s apart): baker, helper, cleaner,
 *      cashier, each with a role chip under the feet and a skill badge over the head (bread, a crate, a broom, a
 *      coin) that gets a tick: each one has the skills the work needs.
 *   b1 Training and a good workplace: three buttons in the figure, 'training' (at rest and on cold start),
 *      'a quarrel', 'team'. training: the baker points at a 'bakery standards' board, three rows tick in (wash
 *      hands, wear a cap, same recipe), the helper and the cleaner watch. a quarrel: a jagged bubble between the
 *      helper and the cashier, you step in, the bubble goes, 'settled' ticks in. team: you and the four staff in
 *      a row, chips 'benefits' and 'a good place to work', the bakery with an arrow up 'grows'.
 * Animation is CSS only; a Skip / Replay button sits in the figure. Rest = the final frame.
 * Colours are tokens only. ASCII only.
 */
import { SvgScene, stroke, fill, shade } from 'simulations/base/kit/SimSvg.js';
import { iconSvg } from 'simulations/base/kit/SimIcons.js';
import { MONEY_CSS, coin } from '../shared/MoneyKit.js';
import { PEOPLE_CSS, personSlot, paintPeople, registerCast } from '../shared/FinPeople.js';
import { STALL_CSS, banner, bakery, breadLoaf } from '../shared/StallKit.js';

const f1 = (v) => (+v).toFixed(1);
const MAIN = [[{ idx: 0, dwellMs: null }], [{ idx: 1, dwellMs: null }]];

// The bakery staff (same people wherever the ABC Bakery staff appear in L04).
const WORK = { shoeStyle: 'sandal', shoe: 'brown', pattern: 'plain', moustache: false, dupatta: false, glasses: false, girth: 1 };
registerCast('baker', { name: 'Baker', series: 0, role: 'worker', i: 81, look: { ...WORK, outfit: 'shirt', top: 'cream', bottom: 'stone', hairStyle: 'short', moustache: true, sleeves: 'rolled', girth: 1.08 } });
registerCast('helper', { name: 'Helper', series: 0, role: 'adult', i: 82, look: { ...WORK, outfit: 'tee', top: 'mustard', bottom: 'denim', hairStyle: 'crop', shoeStyle: 'sneaker', shoe: 'white' } });
registerCast('cleaner', { name: 'Cleaner', series: 0, role: 'worker', i: 83, look: { ...WORK, outfit: 'kurti', top: 'sage', bottom: 'cream', hairStyle: 'bun', dupatta: true, trim: 'cream' } });
registerCast('cashier', { name: 'Cashier', series: 0, role: 'adult', i: 84, look: { ...WORK, outfit: 'shirt', top: 'maroon', bottom: 'navy', hairStyle: 'long', glasses: true, shoeStyle: 'shoe' } });

const STAFF = [
  { who: 'baker', role: 'baker', skill: 'bread' },
  { who: 'helper', role: 'helper', skill: 'crate' },
  { who: 'cleaner', role: 'cleaner', skill: 'broom' },
  { who: 'cashier', role: 'cashier', skill: 'coin' },
];
const CASES = ['training', 'a quarrel', 'team'];
const DUR = [2.6, [2.2, 2.4, 1.8]];

const CSS = `
.tb-chip { position: absolute; transform: translate(-50%, -50%); white-space: nowrap; display: flex; align-items: center; gap: 6px;
  padding: 3px 12px; border-radius: 999px; font: 800 21px/1.2 var(--sim-font); color: var(--sim-label);
  background: var(--sim-bg-surface); border: 2.5px solid var(--sim-stroke); }
.tb-chip.acc { border-color: var(--sim-accent); background: color-mix(in oklab, var(--sim-accent) 14%, var(--sim-bg-surface)); }
.tb-chip.good { border-color: var(--sim-good); background: color-mix(in oklab, var(--sim-good) 16%, var(--sim-bg-surface)); }
.tb-chip.big { font-size: 25px; padding: 4px 14px; }
.tb-chip svg { width: 28px; height: 28px; flex: none; }
.tb-ab { position: absolute; transform: translate(-50%, -50%); }
.tb-btn { min-height: 46px; padding: 5px 10px; cursor: pointer; white-space: nowrap;
  border-radius: calc(12px * var(--look-radius, 1)); font: 800 21px/1.1 var(--sim-font); background: var(--sim-bg-surface); color: var(--sim-label);
  border: 2.5px solid var(--sim-stroke); box-shadow: 0 calc(3px * var(--look-lip, 1)) 0 var(--sim-stroke); }
.tb-btn.on { border-color: var(--sim-accent); box-shadow: 0 calc(3px * var(--look-lip, 1)) 0 var(--sim-accent); background: color-mix(in oklab, var(--sim-accent) 16%, var(--sim-bg-surface)); }
.tb-btn:active { transform: translate(-50%, calc(-50% + 3px)); box-shadow: none; }
.tb-btn:focus-visible, .tb-skip:focus-visible { outline: 3px solid var(--sim-accent); outline-offset: 3px; }
.tb-skip { position: absolute; cursor: pointer; padding: 6px 14px; border-radius: calc(12px * var(--look-radius, 1));
  font: 800 18px/1.1 var(--sim-font); color: var(--sim-label); background: var(--sim-bg-surface);
  border: 2.5px solid var(--sim-stroke); box-shadow: 0 calc(3px * var(--look-lip, 1)) 0 var(--sim-stroke); }
.tb-skip:active { transform: translateY(3px); box-shadow: none; }
.tb-in { animation: tb-in 0.45s cubic-bezier(.3,1.4,.5,1) both; animation-delay: var(--d, 0s); }
@keyframes tb-in { 0% { opacity: 0; transform: translate(-50%, -50%) scale(0.6); } 100% { opacity: 1; transform: translate(-50%, -50%); } }
.tb-walk { animation: tb-walk 0.6s cubic-bezier(.3,.8,.4,1) both; animation-delay: var(--d, 0s); }
@keyframes tb-walk { 0% { transform: translateX(var(--wx, 70px)); opacity: 0; } 35% { opacity: 1; } 100% { transform: none; opacity: 1; } }
.tb-out { animation: tb-out 0.4s ease both; animation-delay: var(--d, 0s); }
@keyframes tb-out { 0% { opacity: 1; } 100% { opacity: 0; } }
.tb-fadein { animation: tb-fadein 0.4s ease both; animation-delay: var(--d, 0s); }
@keyframes tb-fadein { 0% { opacity: 0; } 100% { opacity: 1; } }
svg .tb-gone { animation: tb-gone 0.4s ease both; animation-delay: var(--d, 0s); }
@keyframes tb-gone { 0% { opacity: 1; transform: none; } 100% { opacity: 0; transform: scale(0.6); } }
svg .tb-gone { transform-box: fill-box; transform-origin: center; }
svg .tb-write { clip-path: inset(0 100% 0 0); animation: tb-write 0.5s ease-out both; animation-delay: var(--d, 0s); }
@keyframes tb-write { 0% { clip-path: inset(0 100% 0 0); } 100% { clip-path: inset(0 0 0 0); } }
.tb-still .tb-out, .tb-still .tb-gone { opacity: 0; }
.tb-still, .tb-still * { animation: none !important; }
.tb-still .tb-write { clip-path: none !important; }
@media (prefers-reduced-motion: reduce) { .tb-in, .tb-walk, .tb-fadein, svg .tb-write { animation: none; clip-path: none; } .tb-out, svg .tb-gone { animation: none; opacity: 0; } }
`;

const text = (x, y, t, size, col = 'var(--sim-label)', anchor = 'middle', w = 800) =>
  `<text x="${f1(x)}" y="${f1(y)}" text-anchor="${anchor}" style="fill:${col};font:${w} ${size}px var(--sim-font)">${t}</text>`;
const rect = (x, y, w, h, rx, col, extra = '') => `<rect x="${f1(x)}" y="${f1(y)}" width="${f1(w)}" height="${f1(h)}" rx="${f1(rx)}" ${fill(col, extra)}/>`;
const lipRect = (x, y, w, h, rx, col, rim) => rect(x, y + 4, w, h, rx, rim) + rect(x, y, w, h, rx, col, `stroke:${rim};stroke-width:2.5`);
const iconAt = (name, x, y, size, tone) => iconSvg(name, tone).replace('width="48" height="48"', `x="${f1(x - size / 2)}" y="${f1(y - size / 2)}" width="${f1(size)}" height="${f1(size)}"`);
const iconHtml = (name, tone) => iconSvg(name, tone).replace('width="48" height="48"', 'width="28" height="28"');
const chip = (t, x, y, d, cls = '') => `<div class="tb-chip tb-in${cls ? ` ${cls}` : ''}" style="left:${f1(x)}px;top:${f1(y)}px;--d:${d}s">${t}</div>`;

const WALL = 'color-mix(in oklab, var(--sim-series-8) 10%, var(--sim-bg-surface))';
const FLOOR = 'color-mix(in oklab, var(--sim-series-8) 26%, var(--sim-bg-surface))';
const WOOD = 'color-mix(in oklab, var(--sim-series-8) 55%, var(--sim-label) 30%)';

/** A broom, standing: (x, y) the bristles' foot, h tall. */
function broom(x, y, h) {
  const bw = h * 0.42, bh = h * 0.3, straw = 'color-mix(in oklab, var(--sim-series-2) 60%, var(--sim-series-8) 40%)';
  return `<path d="M${f1(x)} ${f1(y - h)}V${f1(y - bh)}" ${stroke(WOOD, h * 0.07)}/>`
    + `<path d="M${f1(x - bw * 0.18)} ${f1(y - bh)}H${f1(x + bw * 0.18)}L${f1(x + bw / 2)} ${f1(y)}H${f1(x - bw / 2)}Z" ${fill(straw, `stroke:${shade(straw, 62)};stroke-width:2;stroke-linejoin:round`)}/>`
    + `<path d="M${f1(x - bw * 0.2)} ${f1(y - bh * 0.62)}H${f1(x + bw * 0.2)}" ${stroke(shade(straw, 62), 3)}/>`;
}

/** A water drop, centre (x, y), r. */
function drop(x, y, r) {
  const col = 'var(--sim-water)';
  return `<path d="M${f1(x)} ${f1(y - r * 1.5)}C${f1(x + r * 0.4)} ${f1(y - r * 0.8)} ${f1(x + r)} ${f1(y - r * 0.2)} ${f1(x + r)} ${f1(y + r * 0.25)}A${f1(r)} ${f1(r)} 0 0 1 ${f1(x - r)} ${f1(y + r * 0.25)}C${f1(x - r)} ${f1(y - r * 0.2)} ${f1(x - r * 0.4)} ${f1(y - r * 0.8)} ${f1(x)} ${f1(y - r * 1.5)}Z" ${fill(col, `stroke:${shade(col, 62)};stroke-width:2`)}/>`
    + `<path d="M${f1(x - r * 0.45)} ${f1(y + r * 0.1)}q0 ${f1(r * 0.4)} ${f1(r * 0.35)} ${f1(r * 0.55)}" ${stroke('var(--sim-bg-surface)', r * 0.2)}/>`;
}

/** A baker's cap (a puffy top on a band), centre (x, y), w wide. */
function cap(x, y, w) {
  const col = 'var(--sim-bg-surface)', rim = 'var(--sim-label-muted)';
  return `<path d="M${f1(x - w * 0.36)} ${f1(y + w * 0.12)}C${f1(x - w * 0.62)} ${f1(y - w * 0.1)} ${f1(x - w * 0.36)} ${f1(y - w * 0.46)} ${f1(x - w * 0.12)} ${f1(y - w * 0.3)}C${f1(x - w * 0.04)} ${f1(y - w * 0.56)} ${f1(x + w * 0.3)} ${f1(y - w * 0.52)} ${f1(x + w * 0.24)} ${f1(y - w * 0.28)}C${f1(x + w * 0.56)} ${f1(y - w * 0.36)} ${f1(x + w * 0.6)} ${f1(y + w * 0.04)} ${f1(x + w * 0.36)} ${f1(y + w * 0.12)}Z" ${fill(col, `stroke:${rim};stroke-width:2.5;stroke-linejoin:round`)}/>`
    + rect(x - w * 0.38, y + w * 0.1, w * 0.76, w * 0.2, 4, col, `stroke:${rim};stroke-width:2.5`);
}

function tick(x, y, r) {
  return `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(r)}" ${fill('var(--sim-good)', `stroke:${shade('var(--sim-good)', 62)};stroke-width:2`)}/>`
    + `<path d="M${f1(x - r * 0.45)} ${f1(y)}l${f1(r * 0.3)} ${f1(r * 0.32)}l${f1(r * 0.6)} ${f1(-r * 0.66)}" ${stroke('var(--sim-bg-deep)', r * 0.24)}/>`;
}

/** A round skill badge with the skill's picture and a tick; centre (x, y). */
function badge(x, y, r, skill, d) {
  let s = `<circle cx="${f1(x)}" cy="${f1(y + 3)}" r="${f1(r)}" ${fill('var(--sim-stroke)')}/>`
    + `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(r)}" ${fill('var(--sim-bg-surface)', 'stroke:var(--sim-stroke);stroke-width:2.5')}/>`;
  if (skill === 'bread') s += breadLoaf(x, y + r * 0.3, r * 1.3);
  else if (skill === 'crate') s += iconAt('crate', x, y, r * 1.45, 8);
  else if (skill === 'broom') s += broom(x, y + r * 0.62, r * 1.3);
  else s += coin(x, y, r * 0.62);
  return `<g class="mk-pop" style="--d:${d}s">${s}</g><g class="mk-pop" style="--d:${(d + 0.3).toFixed(2)}s">${tick(x + r * 0.78, y - r * 0.7, r * 0.42)}</g>`;
}

/** A jagged 'quarrel' bubble, centre (x, y). */
function quarrel(x, y, r) {
  let d = '';
  for (let i = 0; i < 16; i++) { const a = i * Math.PI / 8, rr = i % 2 ? r * 0.72 : r; d += `${i ? 'L' : 'M'}${f1(x + Math.cos(a) * rr * 1.25)} ${f1(y + Math.sin(a) * rr)}`; }
  const col = 'var(--sim-bad)';
  return `<path d="${d}Z" ${fill(`color-mix(in oklab, ${col} 18%, var(--sim-bg-surface))`, `stroke:${col};stroke-width:3;stroke-linejoin:round`)}/>`
    + `<path d="M${f1(x - r * 0.42)} ${f1(y - r * 0.3)}l${f1(r * 0.28)} ${f1(r * 0.3)}l${f1(-r * 0.28)} ${f1(r * 0.3)}M${f1(x + r * 0.42)} ${f1(y - r * 0.3)}l${f1(-r * 0.28)} ${f1(r * 0.3)}l${f1(r * 0.28)} ${f1(r * 0.3)}" ${stroke(col, 5)}/>`;
}

export class BakeryTeamBuildScene extends SvgScene {
  static WIDTH = 560;
  static PORTRAIT_WIDTH = 390;
  static HEIGHT = 480;
  static PORTRAIT_HEIGHT = 600;
  static CONTINUOUS = false;
  static BEAT_STEP_MAP = MAIN;
  static BEAT_MAPS = { 2: MAIN };
  static CONTROLS = [];
  static ARIA_LABEL = 'Human resources at ABC Bakery. First, four people join the team: a baker, a helper, a cleaner and a cashier, each with the skill the work needs. Then three cases: training, where the baker shows the bakery standards (wash hands, wear a cap, same recipe); a quarrel between two staff that you settle; and the whole team with benefits and a good place to work, which helps the bakery grow.';

  async setup() {
    this.which = 0;
    this.still = false;
    this.run = 0;
    await super.setup();
    this._onClick = (e) => {
      const b = e.target?.closest?.('[data-which],[data-act]');
      if (!b) return;
      if (b.dataset.act === 'skip') { this.finish(); return; }
      if (b.dataset.act === 'replay') { this.restart(); return; }
      if (this.stepIndex !== 1) return;
      const w = +b.dataset.which;
      if (w === this.which) return;
      this.which = w;
      this.restart();
    };
    this.root.addEventListener('click', this._onClick);
  }

  destroy() {
    this.root?.removeEventListener('click', this._onClick);
    super.destroy();
  }

  css() { return MONEY_CSS + PEOPLE_CSS + STALL_CSS + CSS; }

  enter() { this.which = 0; this.restart(true); }

  restart(quiet) {
    this.still = false;
    const run = ++this.run;
    const dur = this.stepIndex === 1 ? DUR[1][this.which] : DUR[0];
    if (this._timers) this.after(dur, () => { if (run === this.run) this.finish(); });
    if (!quiet) this.repaint();
  }

  finish() { this.run++; this.still = true; this.repaint(); }

  repaint() { super.repaint(); paintPeople(this); }

  stageHeight(st) { return Math.round((st.portrait ? 600 : 480) * st.W / (st.portrait ? 390 : 560)); }

  paint(st) {
    const P = st.portrait, DW = P ? 390 : 560, DH = P ? 600 : 480, k = (st.W / DW).toFixed(4);
    const out = this.stepIndex === 1 ? this.paintWork(P) : this.paintHire(P);
    const still = this.still ? ' tb-still' : '';
    const pos = P ? 'right:8px;top:8px' : this.stepIndex === 1 ? 'right:8px;top:8px' : 'right:8px;bottom:8px';
    const btn = `<button type="button" class="sv-hit tap btn tb-skip" data-act="${this.still ? 'replay' : 'skip'}" style="${pos}">${this.still ? 'Replay' : 'Skip'}</button>`;
    return {
      svg: `<g class="${still}" transform="scale(${k})">${out.svg}</g>`,
      over: `<div class="${still}" style="position:absolute;left:0;top:0;width:${DW}px;height:${DH}px;overflow:hidden;transform:scale(${k});transform-origin:0 0">${out.over ?? ''}${btn}</div>`,
    };
  }

  room(P, floorY) {
    const DW = P ? 390 : 560;
    return rect(8, 8, DW - 16, floorY - 8, 16, WALL) + rect(8, floorY - 2, DW - 16, 18, 8, FLOOR);
  }

  // b0: four people join the team, each with a skill.
  paintHire(P) {
    const spots = P
      ? [[100, 286], [292, 286], [100, 526], [292, 526]]
      : [[76, 372], [212, 372], [348, 372], [484, 372]];
    const h = P ? 166 : 196, r = P ? 24 : 27;
    let svg = this.room(P, P ? 286 : 372);
    if (P) svg += rect(8, 340, 374, 202, 16, WALL) + rect(8, 524, 374, 18, 8, FLOOR);
    svg += banner(P ? 172 : 280, P ? 36 : 42, P ? 290 : 320, 'ABC Bakery team', { size: P ? 22 : 24 });
    let over = '';
    STAFF.forEach((s, i) => {
      const [x, y] = spots[i], d = 0.15 + i * 0.4;
      over += personSlot(s.who, { x, y, h, mood: 'smile', cls: 'tb-walk', style: `--d:${d.toFixed(2)}s;--wx:${P ? 40 : 70}px` });
      const bx = P ? x + 62 : x + 40, by = P ? y - h - 6 + 40 : y - h - 34;
      svg += badge(bx, by, r, s.skill, d + 0.5);
      over += chip(s.role, x, y + (P ? 24 : 30), d + 0.2);
    });
    return { svg, over };
  }

  // b1: training, a quarrel, the team.
  paintWork(P) {
    const floorY = P ? 500 : 386;
    let svg = this.room(P, floorY), over = '';
    const out = [this.paintTraining, this.paintQuarrel, this.paintTeam][this.which].call(this, P, floorY);
    svg += out.svg; over += out.over;
    const by = P ? 566 : 446, bw = P ? 118 : 156, xs = P ? [66, 195, 324] : [118, 280, 442];
    CASES.forEach((c, i) => {
      over += `<button type="button" class="sv-hit tap btn tb-ab tb-btn${this.which === i ? ' on' : ''}" data-which="${i}" aria-pressed="${this.which === i}" style="left:${xs[i]}px;top:${by}px;width:${bw}px">${c}</button>`;
    });
    return { svg, over };
  }

  paintTraining(P, floorY) {
    const B = P ? { x: 20, y: 56, w: 258, h: 236 } : { x: 22, y: 30, w: 290, h: 260 };
    let svg = lipRect(B.x, B.y, B.w, B.h, 14, 'var(--sim-bg-surface)', 'var(--sim-stroke)');
    svg += rect(B.x, B.y, B.w, 52, 14, 'color-mix(in oklab, var(--sim-series-5) 24%, var(--sim-bg-surface))') + rect(B.x, B.y + 40, B.w, 12, 0, 'color-mix(in oklab, var(--sim-series-5) 24%, var(--sim-bg-surface))');
    svg += text(B.x + B.w / 2, B.y + 35, 'bakery standards', P ? 23 : 25);
    const rows = [['drop', 'wash hands'], ['cap', 'wear a cap'], ['bread', 'same recipe']];
    const rh = (B.h - 64) / 3;
    rows.forEach(([ic, t], i) => {
      const cy = B.y + 64 + rh * (i + 0.5), d = 0.4 + i * 0.5;
      let art = ic === 'drop' ? drop(B.x + 32, cy + 4, 13) : ic === 'cap' ? cap(B.x + 32, cy + 2, 40) : breadLoaf(B.x + 32, cy + 12, 46);
      svg += `<g class="mk-pop" style="--d:${d}s">${art}</g>`;
      svg += `<g class="tb-write" style="--d:${d}s">${text(B.x + 62, cy + 8, t, P ? 21 : 23, 'var(--sim-label)', 'start')}</g>`;
      svg += `<g class="mk-pop" style="--d:${(d + 0.35).toFixed(2)}s">${tick(B.x + B.w - 26, cy, 14)}</g>`;
    });
    let over;
    if (P) {
      over = personSlot('baker', { x: 330, y: 300, h: 200, pose: 'point', facing: -1, mood: 'smile' })
        + personSlot('helper', { x: 100, y: floorY, h: 176, facing: 1, mood: 'think' })
        + personSlot('cleaner', { x: 214, y: floorY, h: 170, facing: 1, mood: 'smile' });
      svg += cap(330, 300 - 200 - 6, 44);
      svg += `<g class="mk-pop" style="--d:1.2s">${cap(101, floorY - 176 - 4, 38)}</g><g class="mk-pop" style="--d:1.3s">${cap(215, floorY - 170 - 4, 36)}</g>`;
    } else {
      over = personSlot('baker', { x: 372, y: floorY, h: 220, pose: 'point', facing: -1, mood: 'smile' })
        + personSlot('helper', { x: 462, y: floorY, h: 176, facing: -1, mood: 'think' })
        + personSlot('cleaner', { x: 520, y: floorY, h: 170, facing: -1, mood: 'smile' });
      svg += cap(374, floorY - 220 - 6, 48);
      svg += `<g class="mk-pop" style="--d:1.2s">${cap(464, floorY - 176 - 4, 38)}</g><g class="mk-pop" style="--d:1.3s">${cap(521, floorY - 170 - 4, 36)}</g>`;
    }
    return { svg, over };
  }

  paintQuarrel(P, floorY) {
    const G = P
      ? { a: [76, floorY, 236], b: [314, floorY, 236], you: [195, floorY, 210], bub: [195, 170, 56], ok: [195, 110] }
      : { a: [120, floorY, 230], b: [440, floorY, 230], you: [280, floorY, 200], bub: [280, 120, 60], ok: [280, 76] };
    let over = '';
    // the two staff: cross faces fade out, smiling faces fade in once you step in
    over += personSlot('helper', { x: G.a[0], y: G.a[1], h: G.a[2], facing: 1, mood: 'squint', cls: 'tb-out', style: '--d:1.2s' });
    over += personSlot('cashier', { x: G.b[0], y: G.b[1], h: G.b[2], facing: -1, mood: 'squint', cls: 'tb-out', style: '--d:1.2s' });
    over += personSlot('helper', { x: G.a[0], y: G.a[1], h: G.a[2], facing: 1, mood: 'happy', cls: 'tb-fadein', style: '--d:1.2s' });
    over += personSlot('cashier', { x: G.b[0], y: G.b[1], h: G.b[2], facing: -1, mood: 'happy', cls: 'tb-fadein', style: '--d:1.2s' });
    over += personSlot('you', { x: G.you[0], y: G.you[1], h: G.you[2], mood: 'smile', cls: 'tb-walk', style: '--d:0.6s;--wx:0px' });
    let svg = `<g class="mk-pop" style="--d:0.1s"><g class="tb-gone" style="--d:1.1s">${quarrel(G.bub[0], G.bub[1], G.bub[2])}</g></g>`;
    over += chip(`<svg viewBox="0 0 28 28">${tick(14, 14, 12)}</svg>settled`, G.ok[0], G.ok[1], 1.5, 'good big');
    return { svg, over };
  }

  paintTeam(P, floorY) {
    const xs = P ? [62, 128, 195, 262, 328] : [70, 175, 280, 385, 490];
    const who = ['baker', 'helper', 'you', 'cleaner', 'cashier'];
    const h = P ? 168 : 176;
    let over = '';
    who.forEach((w, i) => { over += personSlot(w, { x: xs[i], y: floorY, h: w === 'you' ? h * 0.92 : h, mood: 'happy', cls: 'mpp-pop', style: `--d:${(0.1 + i * 0.12).toFixed(2)}s` }); });
    let svg = '';
    const bk = P ? [96, 236, 150] : [116, 176, 168];
    svg += `<g class="mk-pop" style="--d:0.8s">${bakery(bk[0], bk[1], bk[2], { signSize: P ? 17 : 19 })}</g>`;
    // the arrow up: a strong team helps the bakery grow
    const ax = bk[0] + bk[2] / 2 + 30, ay0 = bk[1] - 10, ay1 = bk[1] - bk[2] * 0.8;
    svg += `<g class="tb-fadein" style="--d:1.2s"><path d="M${f1(ax)} ${f1(ay0)}V${f1(ay1 + 16)}" ${stroke('var(--sim-good)', 7)}/><path d="M${f1(ax - 15)} ${f1(ay1 + 18)}L${f1(ax)} ${f1(ay1)}L${f1(ax + 15)} ${f1(ay1 + 18)}Z" ${fill('var(--sim-good)')}/>`
      + text(ax + 14, (ay0 + ay1) / 2 + 8, 'grows', 23, 'var(--sim-good)', 'start') + '</g>';
    if (P) {
      over += chip('strong team', 195, 290, 0.6, 'acc big');
      over += chip(`${iconHtml('money-bag', 2)}benefits`, 284, 64, 1.0);
    } else {
      over += chip('strong team', 404, 66, 0.6, 'acc big');
      over += chip(`${iconHtml('money-bag', 2)}benefits`, 404, 122, 1.0);
      over += chip(`${iconHtml('house', 5)}a good place to work`, 404, 174, 1.2);
    }
    return { svg, over };
  }

  testState() { return { view: this.stepIndex, case: this.stepIndex === 1 ? CASES[this.which] : null, still: this.still }; }
}
