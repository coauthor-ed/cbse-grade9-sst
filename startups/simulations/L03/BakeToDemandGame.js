// BakeToDemandGame - L03 game (blk-l03-s07): the ABC Bakery baking game. Five days, Monday to Friday. A cake costs
// Rs 150 to bake and sells for Rs 250; a cake not sold by evening is thrown away. A normal day has about 20 buyers.
// Each day a note says what is happening (normal, sports day = twice, heavy rain = half, festival = one and a half).
// The learner taps Bake 10 / 20 / 30 / 40. The board then fills: the shelf (cakes baked) on top, the queue (buyers)
// under it, cake k right above buyer k, so a cake with a buyer under it is sold, a cake with none is thrown away,
// and a buyer with no cake above goes home with nothing. The result card says sold x Rs 100 and thrown away x
// Rs 150 (the block's own "Working it out" sentence), the profit, and a profit bar on one fixed scale for the week.
// Wrong: one short reason (bake fewer / bake more), try again; the tried batch stays as a tick on the bar.
// The buttons show the batch only, never the profit, and the buyers stay hidden until a batch is baked.
// Win (checkObjective): the best batch on all five days (best week total Rs 12,000); finishGame after Friday.
// Batches stay in rising order on purpose (the best moves 20, 40, 10, 20, 30). Made-up numbers (said once, in the sub).
// The cake is drawn here (no cake in StallKit; cakeJar is the mini jar). ASCII only.
import { GameBoard, mountGame, finishGame, onTap } from 'simulations/base/kit/GameFrame.js';
import { iconSvg } from 'simulations/base/kit/SimIcons.js';
import { RS, group } from '../shared/MoneyKit.js';
import { bakery, bunting, STALL_CSS } from '../shared/StallKit.js';

const COST = 150, PRICE = 250, LEFT = PRICE - COST;
const BATCHES = [10, 20, 30, 40];
const TIMES = '\u00d7';
const DAYS = [
  { name: 'Monday', short: 'Mon', sky: 'sun', note: 'A normal day.', buyers: 20, best: 20,
    good: 'A normal day: about 20 buyers, and every cake sold.' },
  { name: 'Tuesday', short: 'Tue', sky: 'sports', note: 'Sports day at the school next door. About twice the usual buyers.', buyers: 40, best: 40,
    good: 'Twice the usual: 40 buyers, and every cake sold.' },
  { name: 'Wednesday', short: 'Wed', sky: 'rain', note: 'Heavy rain all day. About half the usual buyers.', buyers: 10, best: 10,
    good: 'The rain kept people at home: 10 buyers, and no cake thrown away.' },
  { name: 'Thursday', short: 'Thu', sky: 'sun', note: 'A normal day again.', buyers: 20, best: 20,
    good: 'Back to normal: 20 buyers, 20 cakes.' },
  { name: 'Friday', short: 'Fri', sky: 'festival', note: 'A festival in the market. About one and a half times the usual buyers.', buyers: 30, best: 30,
    good: 'One and a half times the usual: 30 buyers, and every cake sold.' },
];
const sold = (b, n) => Math.min(b, n);
const profitOf = (b, n) => PRICE * sold(b, n) - COST * b;
// The storyboard's table (text-L03-report), checked here so a typo in DAYS cannot slip through.
const TABLE = [[1000, 2000, 500, -1000], [1000, 2000, 3000, 4000], [1000, -500, -2000, -3500], [1000, 2000, 500, -1000], [1000, 2000, 3000, 1500]];
DAYS.forEach((d, i) => {
  BATCHES.forEach((b, j) => {
    if (profitOf(b, d.buyers) !== TABLE[i][j]) throw new Error(`BakeToDemandGame: ${d.name} ${b} profit mismatch`);
    if (LEFT * sold(b, d.buyers) - COST * (b - sold(b, d.buyers)) !== TABLE[i][j]) throw new Error('BakeToDemandGame: sold/thrown form mismatch');
  });
  const best = BATCHES.reduce((x, b) => (profitOf(b, d.buyers) > profitOf(x, d.buyers) ? b : x), BATCHES[0]);
  if (best !== d.best) throw new Error(`BakeToDemandGame: ${d.name} best batch mismatch`);
});
const WEEK = DAYS.reduce((t, d) => t + profitOf(d.best, d.buyers), 0);
if (WEEK !== 12000) throw new Error('BakeToDemandGame: week total mismatch');

const rs = (n) => (n < 0 ? '-' : '') + RS + group(Math.abs(n));
const LO = -3800, HI = 4400;                    // the profit bar's fixed scale, the same every day
const f1 = (v) => (+v).toFixed(1);

// Cake colours (tokens only), the same family as StallKit's cakeJar.
const SPONGE = 'color-mix(in oklab, var(--sim-series-8) 50%, var(--sim-label) 25%)';
const CREAM = 'color-mix(in oklab, var(--sim-series-4) 30%, var(--sim-bg-surface))';
const RIM = 'color-mix(in oklab, var(--sim-series-8) 60%, var(--sim-label))';

// One small round cake, side view, in a 40 x 40 box: a plate, two sponge layers with cream between, a cream top
// with drips and a cherry. No face.
function cakeSvg(cls = '') {
  return `<svg class="bk-cake${cls}" viewBox="0 0 40 40" aria-hidden="true">`
    + '<rect x="2" y="34" width="36" height="4" rx="2" style="fill:var(--sim-stroke)"/>'
    + `<rect x="6" y="15" width="28" height="20" rx="4" style="fill:${SPONGE};stroke:${RIM};stroke-width:1.5"/>`
    + `<rect x="6" y="23" width="28" height="4" style="fill:${CREAM}"/>`
    + `<path d="M5 17Q5 12 10 12H30Q35 12 35 17V19Q32 22 29 19Q26 23 23 19Q20 22 17 19Q14 23 11 19Q8 22 5 19Z" style="fill:${CREAM};stroke:${RIM};stroke-width:1.5;stroke-linejoin:round"/>`
    + '<circle cx="20" cy="9" r="3.6" style="fill:var(--sim-series-6)"/>'
    + '</svg>';
}

// An icon inside an svg, at (x, y), s across.
const ic = (name, tone, x, y, s) => iconSvg(name, tone).replace('width="48" height="48"', `x="${f1(x)}" y="${f1(y)}" width="${f1(s)}" height="${f1(s)}"`);

// The bakery on the day: sun (normal), flags and the school (sports day), rain, bunting and lamps (festival).
function dayFig(day) {
  const rain = day.sky === 'rain';
  let s = '<svg viewBox="0 0 200 128" aria-hidden="true" class="bk-figsvg">';
  s += `<rect x="0" y="0" width="200" height="128" rx="14" style="fill:color-mix(in oklab, var(--sim-series-${rain ? 7 : 1}) ${rain ? 22 : 12}%, var(--sim-bg-surface))"/>`;
  s += '<rect x="0" y="116" width="200" height="12" style="fill:color-mix(in oklab, var(--sim-series-3) 30%, var(--sim-bg-surface))"/>';
  if (day.sky === 'sports') s += ic('school', 2, 150, 58, 50) + ic('flag', 6, 156, 18, 30);
  if (day.sky === 'festival') s += bunting(4, 10, 196, 10, 9, { sag: 10, size: 13 });
  s += bakery(rain || day.sky === 'sun' ? 84 : 76, 120, 104, { signSize: 15 });
  if (day.sky === 'sun') s += ic('sun', 'var(--sim-gold)', 152, 14, 40);
  if (rain) {
    s += ic('rain', 7, 140, 2, 52);
    for (let i = 0; i < 9; i++) {
      const x = 10 + i * 21, y = 18 + (i % 3) * 22;
      s += `<path d="M${x} ${y}l-5 12" style="stroke:color-mix(in oklab, var(--sim-series-7) 70%, var(--sim-label));stroke-width:3;stroke-linecap:round"/>`;
    }
  }
  if (day.sky === 'festival') s += ic('lamp', 'var(--sim-gold)', 150, 70, 40);
  return s + '</svg>';
}

// The profit bar: a track from LO to HI with a zero line; the current batch as a bar; earlier tries as ticks.
function profitBar(cur, tried, W) {
  const H = 84, L = 8, R = W - 8, X = (v) => L + ((v - LO) / (HI - LO)) * (R - L), y0 = 24, bh = 32, z = X(0);
  const word = (t, x, anchor, y = y0 + bh / 2 + 6) => `<text x="${f1(x)}" y="${y}" text-anchor="${anchor}" style="fill:var(--sim-label-muted);font:800 15px var(--sim-font)">${t}</text>`;
  let s = `<svg viewBox="0 0 ${W} ${H}" aria-hidden="true">`;
  s += `<rect x="${L}" y="${y0}" width="${R - L}" height="${bh}" rx="8" style="fill:var(--sim-bg-deep);stroke:var(--sim-stroke);stroke-width:1.5;opacity:0.9"/>`;
  // tried ticks, labelled above the track; a label that would touch the one before moves to the side away from it
  let lastX = -99;
  tried.slice().sort((a, b) => a.v - b.v).forEach((t) => {
    const x = X(t.v), near = x - lastX < 26;
    s += `<path d="M${f1(x)} ${y0 - 4}V${y0 + bh + 2}" style="stroke:var(--sim-label-muted);stroke-width:3;stroke-dasharray:4 3"/>`;
    s += word(`${t.b}`, near ? x + 3 : x, near ? 'start' : 'middle', y0 - 8);
    lastX = near ? x + 24 : x;
  });
  if ((!cur || cur.v >= 0) && !tried.some((t) => t.v < 0 && X(t.v) > z - 60)) s += word('loss', z - 7, 'end');
  if ((!cur || cur.v <= 0) && !tried.some((t) => t.v > 0 && X(t.v) < z + 70)) s += word('profit', z + 9, 'start');
  if (cur) {
    const x0 = Math.min(z, X(cur.v)), w = Math.abs(X(cur.v) - z), loss = cur.v < 0;
    const col = loss ? 'var(--sim-bad)' : 'var(--sim-good)';
    s += `<rect class="bk-grow" x="${f1(x0)}" y="${y0 + 4}" width="${f1(Math.max(w, 3))}" height="${bh - 8}" rx="6" style="fill:${col};transform-origin:${f1(z)}px 0"/>`;
    const cx = Math.max(L + 40, Math.min(R - 40, X(cur.v)));
    s += `<text x="${f1(cx)}" y="${y0 + bh + 22}" text-anchor="middle" style="fill:var(--sim-label);font:800 17px var(--sim-font)">Bake ${cur.b}</text>`;
  }
  s += `<path d="M${f1(z)} ${y0 - 6}V${y0 + bh + 6}" style="stroke:var(--sim-label);stroke-width:3;stroke-linecap:round"/>`;
  return s + '</svg>';
}

const CSS = STALL_CSS + `
.gm.bk { background: var(--sim-bg-deep); border-radius: var(--sim-radius-md); }
.bk .bk-main { flex: 1 1 auto; min-height: 0; display: grid; grid-template-columns: 226px minmax(0, 1fr) 300px; gap: 12px; align-items: stretch; }
.bk .bk-card { background: var(--sim-bg-surface); border: calc(2px * var(--look-rim)) solid var(--sim-stroke); border-radius: var(--sim-radius-lg); padding: 10px 12px; }
.bk .bk-side { display: flex; flex-direction: column; gap: 7px; }
.bk .bk-fig svg { display: block; width: 100%; height: auto; max-height: 104px; }
.sim-dom-root--portrait .bk .bk-fig svg { max-height: none; }
.bk .bk-sidetext { display: flex; flex-direction: column; gap: 7px; }
.bk .bk-pips { display: flex; justify-content: center; gap: 7px; }
.bk .bk-pip { width: 15px; height: 15px; border-radius: 50%; border: 2px solid var(--sim-stroke); background: var(--sim-bg-surface); }
.bk .bk-pip[data-s="done"] { background: var(--sim-good); border-color: var(--sim-good); }
.bk .bk-pip[data-s="now"] { background: var(--sim-accent); border-color: var(--sim-accent); }
.bk .bk-note { margin: 0; padding: 7px 9px; border-radius: var(--sim-radius-md); font: 800 17px/1.3 var(--sim-font);
  background: color-mix(in oklab, var(--sim-gold) 22%, var(--sim-bg-surface)); border: 2px solid color-mix(in oklab, var(--sim-gold) 60%, var(--sim-stroke)); }
.bk .bk-note b { display: block; font-size: 15px; color: var(--sim-label-muted); }
.bk .bk-fact { margin: 0; font: 700 15px/1.3 var(--sim-font); color: var(--sim-label-muted); }
.bk .bk-board { display: flex; flex-direction: column; gap: 6px; }
.bk .bk-lab { display: flex; align-items: center; gap: 6px; margin: 0; font: 800 17px/1.2 var(--sim-font); color: var(--sim-label-muted); }
.bk .bk-lab svg { width: 24px; height: 24px; flex: none; }
.bk .bk-lab b { color: var(--sim-label); font-size: 20px; }
.bk .bk-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); column-gap: 10px; row-gap: 3px; }
.bk .bk-row { display: grid; grid-template-columns: repeat(10, minmax(0, 1fr)); column-gap: 1px; }
.bk .bk-shelf .bk-row { border-bottom: 5px solid color-mix(in oklab, var(--sim-series-8) 55%, var(--sim-label) 30%); border-radius: 0 0 3px 3px; }
.bk .bk-slot { position: relative; aspect-ratio: 1 / 1.1; display: flex; align-items: flex-end; justify-content: center; }
.bk .bk-slot svg { width: 100%; height: auto; display: block; }
.bk .bk-slot[data-s="waste"] .bk-cake { opacity: 0.5; }
.bk .bk-x { position: absolute; inset: 8% 8% 14%; }
.bk .bk-x::before, .bk .bk-x::after { content: ""; position: absolute; left: 50%; top: 50%; width: 110%; height: 2.5px; border-radius: 2px; background: var(--sim-bad); }
.bk .bk-x::before { transform: translate(-50%, -50%) rotate(45deg); } .bk .bk-x::after { transform: translate(-50%, -50%) rotate(-45deg); }
.bk .bk-slot[data-s="none"] svg { opacity: 0.4; }
.bk .bk-slot[data-s="none"] { outline: 2px dashed var(--sim-bad); outline-offset: -2px; border-radius: 6px; }
.bk .bk-wait { display: flex; align-items: center; justify-content: center; gap: 10px; min-height: 52px; border: 2px dashed var(--sim-stroke);
  border-radius: var(--sim-radius-md); font: 800 17px/1.25 var(--sim-font); color: var(--sim-label-muted); padding: 6px 10px; text-align: center; }
.bk .bk-wait span { font: 800 30px/1 var(--sim-font-display, var(--sim-font)); color: var(--sim-accent); }
.bk .bk-empty { min-height: 52px; display: flex; align-items: center; justify-content: center; font: 800 17px/1.2 var(--sim-font); color: var(--sim-label-muted);
  border-bottom: 5px solid color-mix(in oklab, var(--sim-series-8) 55%, var(--sim-label) 30%); }
.bk .bk-btns { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 8px; margin-top: auto; }
.bk .bk-b { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 3px; font: 800 20px/1 var(--sim-font-display, var(--sim-font)); padding: 5px 4px; }
.bk .bk-b small { display: block; font: 700 14px/1.1 var(--sim-font); color: var(--sim-label-muted); }
.bk .bk-b[data-s="good"] { border-color: var(--sim-good); border-width: 3px; background: color-mix(in oklab, var(--sim-good) 14%, var(--sim-bg-surface)); }
.bk .bk-b[data-s="bad"] { border-color: var(--sim-bad); border-style: dashed; color: var(--sim-bad); }
.bk .bk-b[aria-disabled="true"] { cursor: default; }
.bk .bk-res { display: flex; flex-direction: column; gap: 5px; }
.bk .bk-eq { font: 800 20px/1.2 var(--sim-font); margin: 0; }
.bk .bk-line { display: flex; justify-content: space-between; gap: 6px; margin: 0; font: 800 17px/1.25 var(--sim-font); }
.bk .bk-line[data-tone="good"] b { color: var(--sim-good); } .bk .bk-line[data-tone="bad"] b { color: var(--sim-bad); }
.bk .bk-line[data-tone="muted"] { color: var(--sim-label-muted); }
.bk .bk-rule { margin: 0; font: 700 16px/1.3 var(--sim-font); color: var(--sim-label-muted); }
.bk .bk-big { font: 800 32px/1.15 var(--sim-font-display, var(--sim-font)); margin: 4px 0 0; }
.bk .bk-big[data-tone="good"] { color: var(--sim-good); } .bk .bk-big[data-tone="bad"] { color: var(--sim-bad); }
.bk .bk-big span { font-size: 21px; }
.bk .bk-bar svg { display: block; width: 100%; height: auto; }
.bk .bk-say { margin: 0; font: 700 16px/1.35 var(--sim-font); }
.bk .bk-say[data-tone="good"] { color: var(--sim-good); } .bk .bk-say[data-tone="bad"] { color: var(--sim-bad); }
.bk .bk-next { min-height: 48px; font-size: 17px; font-weight: 800; border: 0; background: var(--sim-accent); color: var(--sim-bg-deep);
  box-shadow: 0 var(--sim-lift) 0 color-mix(in oklab, var(--sim-accent) 65%, var(--sim-label)); }
.bk .bk-next:active { box-shadow: none; }
.bk .bk-sum { display: grid; gap: 2px; margin: 0; padding: 0; list-style: none; }
.bk .bk-sum li { display: flex; justify-content: space-between; font: 800 17px/1.3 var(--sim-font); }
.bk .bk-sum li b { color: var(--sim-good); }
.bk .bk-sum li.bk-tot { border-top: 2px solid var(--sim-stroke); padding-top: 3px; font-size: 20px; }
.bk-anim .bk-pop { animation: bk-pop 0.35s cubic-bezier(.3,1.4,.5,1) both; animation-delay: var(--d, 0s); }
.bk-anim .bk-late { animation: bk-fade 0.4s ease both; animation-delay: var(--d, 1.1s); }
@keyframes bk-pop { from { transform: scale(0.3) translateY(8px); opacity: 0; } }
@keyframes bk-fade { from { opacity: 0; } }
.bk .bk-grow { animation: bk-grow 0.6s cubic-bezier(.3,1.3,.5,1) both; }
.bk-anim .bk-grow { animation-delay: 1.1s; }
@keyframes bk-grow { from { transform: scaleX(0); } to { transform: none; } }
@media (prefers-reduced-motion: reduce) { .bk-anim .bk-pop, .bk-anim .bk-late, .bk .bk-grow { animation: none; } }
.sim-dom-root--portrait .bk .bk-main { display: flex; flex-direction: column; gap: 9px; }
.sim-dom-root--portrait .bk .bk-side { flex-direction: row; align-items: center; gap: 9px; padding: 6px 8px; }
.sim-dom-root--portrait .bk .bk-fig { width: 104px; flex: none; }
.sim-dom-root--portrait .bk .bk-pips { justify-content: flex-start; }
.sim-dom-root--portrait .bk .bk-note { font-size: 16px; padding: 5px 7px; }
.sim-dom-root--portrait .bk .bk-note b { font-size: 14px; }
.sim-dom-root--portrait .bk .bk-fact { font-size: 14px; }
.sim-dom-root--portrait .bk .bk-grid { grid-template-columns: minmax(0, 1fr); }
.sim-dom-root--portrait .bk .bk-board { padding: 8px; }
.sim-dom-root--portrait .bk .bk-b { font-size: 19px; }
.sim-dom-root--portrait .bk .bk-eq { font-size: 18px; }
.sim-dom-root--portrait .bk .bk-big { font-size: 27px; }
.sim-dom-root--portrait .bk .bk-say { font-size: 15px; }
.sim-dom-root--portrait .bk .bk-res > .bk-rule { display: none; }
`;

export class BakeToDemandGame extends GameBoard {
  static HEIGHT = 430;
  static CONTINUOUS = false;
  static OBJECTIVE = { prompt: { en: 'On all five days, bake the number of cakes that leaves the most profit.' } };
  static ARIA_LABEL = 'The ABC Bakery baking game, with made-up numbers. Five days, Monday to Friday. A cake costs 150 rupees to bake and sells for 250 rupees; a cake not sold by evening is thrown away. On a normal day about 20 people buy a cake. Each day a note says what is happening. Tap 10, 20, 30 or 40 cakes to bake; then the shelf of cakes and the queue of buyers show how many sold, how many were thrown away, and the profit.';

  async setup() {
    this.reset();
    await super.setup();
    mountGame(this, {
      css: CSS, check: false,
      html: `<div class="gm bk"><div class="gm-head"><h2 class="bk-h"></h2>
        <p class="sub">Made-up numbers. Read the note, then tap how many cakes to bake.</p></div>
        <div class="bk-main">
          <div class="bk-card bk-side"><div class="bk-fig"></div><div class="bk-sidetext"><div class="bk-pips"></div><p class="bk-note"></p>
            <p class="bk-fact">Normal day: about 20 buyers</p></div></div>
          <div class="bk-card bk-board"></div>
          <div class="bk-card bk-res" aria-live="polite"></div>
        </div></div>`,
    });
    // One Quill only: mini-game@1 draws him in its verdict strip, so the frame's corner Quill goes (never on the board).
    this.quill?.destroy?.(); this.quill = null; this._scaleWrap?.classList.remove('gm-quill');
    this.draw();
  }

  reset() {
    this.day = 0;
    this.pick = null;          // the batch tapped last today
    this.tried = [];           // wrong batches tried today
    this.done = [false, false, false, false, false];
    this.misses = 0;
    this.won = false;
    this.fresh = false;
  }

  portrait() { return !!(this.root?.closest?.('.sim-dom-root--portrait') || this.root?.classList?.contains('sim-dom-root--portrait')); }

  draw() {
    const q = (s) => this.root?.querySelector(s);
    if (!q('.bk-board')) return;
    const D = DAYS[this.day];
    q('.bk-h').textContent = this.won ? 'The week is done' : `Day ${this.day + 1} of 5: ${D.name}`;
    q('.bk-fig').innerHTML = dayFig(D);
    q('.bk-pips').innerHTML = DAYS.map((d, i) => `<span class="bk-pip" data-s="${this.done[i] ? 'done' : i === this.day ? 'now' : ''}" aria-label="${d.name}${this.done[i] ? ': done' : ''}"></span>`).join('');
    q('.bk-note').innerHTML = `<b>${D.name}</b>${D.note}`;
    const board = q('.bk-board');
    board.classList.toggle('bk-anim', this.fresh);
    board.innerHTML = this.boardHtml();
    board.querySelectorAll('.bk-b').forEach((b) => onTap(b, () => this.tap(Number(b.dataset.b))));
    const res = q('.bk-res');
    res.classList.toggle('bk-anim', this.fresh);
    res.innerHTML = this.resultHtml();
    const nx = q('.bk-next');
    if (nx) onTap(nx, () => this.next());
    this.fresh = false;
    this.relayout?.();
  }

  boardHtml() {
    const D = DAYS[this.day], b = this.pick, n = D.buyers, done = this.done[this.day];
    const cols = 10;   // a row of ten; CSS puts two rows side by side in landscape
    const slots = (count, fill) => {
      const rows = Math.max(1, Math.ceil(count / cols)) * cols;
      let s = '';
      for (let k = 0; k < rows; k++) {
        if (k % cols === 0) s += '<div class="bk-row">';
        s += k < count ? fill(k) : '<span class="bk-slot"></span>';
        if (k % cols === cols - 1) s += '</div>';
      }
      return s;
    };
    let shelf, queue;
    if (b === null) {
      shelf = '<div class="bk-empty">The shelf is empty</div>';
      queue = '<div class="bk-wait"><span>?</span>Buyers come after you bake</div>';
    } else {
      shelf = `<div class="bk-grid">${slots(b, (k) => {
        const waste = k >= n;
        return `<span class="bk-slot bk-pop" data-s="${waste ? 'waste' : 'sold'}" style="--d:${f1(k * 0.011)}s">${cakeSvg()}${waste ? `<span class="bk-x bk-late" style="--d:${f1(1.1)}s"></span>` : ''}</span>`;
      })}</div>`;
      queue = `<div class="bk-grid">${slots(n, (k) => {
        const none = k >= b;
        return `<span class="bk-slot bk-pop" data-s="${none ? 'none' : 'got'}" style="--d:${f1(0.5 + k * 0.011)}s">${iconSvg('person', none ? 'var(--sim-label-muted)' : 2)}</span>`;
      })}</div>`;
    }
    const btns = BATCHES.map((x) => {
      const s = done && x === D.best ? 'good' : this.tried.includes(x) ? 'bad' : '';
      return `<button type="button" class="tap btn bk-b" data-b="${x}"${s ? ` data-s="${s}"` : ''}${done || this.won ? ' aria-disabled="true"' : ''} aria-label="Bake ${x} cakes"><small>Bake</small>${x}</button>`;
    }).join('');
    return `<div class="bk-shelf"><p class="bk-lab">${cakeSvg()}<span>Shelf: cakes baked</span>${b === null ? '' : ` <b>${b}</b>`}</p>${shelf}</div>
      <div class="bk-queue"><p class="bk-lab">${iconSvg('person', 2)}<span>Queue: buyers</span>${b === null ? '' : ` <b>${n}</b>`}</p>${queue}</div>
      <div class="bk-btns">${btns}</div>`;
  }

  resultHtml() {
    const W = this.portrait() ? 300 : 292;
    if (this.won) {
      return `<p class="bk-eq">Best batch each day</p><ul class="bk-sum">${DAYS.map((d) => `<li><span>${d.short}: bake ${d.best}</span><b>${rs(profitOf(d.best, d.buyers))}</b></li>`).join('')}
        <li class="bk-tot"><span>Week</span><b>${rs(WEEK)}</b></li></ul>
        <p class="bk-say" data-tone="good">The best batch follows the buyers, so it changes every day.</p>`;
    }
    const D = DAYS[this.day], n = D.buyers;
    const tried = this.tried.filter((b) => b !== this.pick).map((b) => ({ b, v: profitOf(b, n) }));
    if (this.pick === null) {
      return `<p class="bk-eq">Tap how many to bake.</p><p class="bk-rule">Each cake sold leaves ${RS}100. Each cake thrown away loses its ${RS}150.</p>
        <div class="bk-bar">${profitBar(null, tried, W)}</div><p class="bk-rule">The bar shows the day's profit.</p>`;
    }
    const b = this.pick, s = sold(b, n), waste = b - s, miss = n - s, v = profitOf(b, n), right = b === D.best;
    const big = v < 0 ? `${rs(v)} <span>loss</span>` : `${rs(v)} <span>profit</span>`;
    let say, tone;
    if (right) { say = D.good; tone = 'good'; }
    else if (waste > 0) { say = `${waste} cakes were thrown away. Bake fewer. Try again.`; tone = 'bad'; }
    else { say = `${miss} buyers went home with no cake. Bake more. Try again.`; tone = 'bad'; }
    const next = right ? `<button type="button" class="tap btn bk-next">${this.day < 4 ? 'Next day' : 'See the week'}</button>` : '';
    return `<div class="bk-late" style="--d:1.0s"><p class="bk-line" data-tone="good"><span>Sold ${s} ${TIMES} ${RS}${LEFT}</span><b>${rs(LEFT * s)}</b></p>
      <p class="bk-line" data-tone="${waste ? 'bad' : 'muted'}"><span>Thrown away ${waste} ${TIMES} ${RS}${COST}</span><b>${waste ? rs(-COST * waste) : RS + '0'}</b></p>
      ${miss ? `<p class="bk-line" data-tone="muted"><span>No cake for ${miss} buyers</span></p>` : ''}
      <p class="bk-big" data-tone="${v < 0 ? 'bad' : right ? 'good' : ''}">= ${big}</p></div>
      <div class="bk-bar">${profitBar({ b, v }, tried, W)}</div>
      <p class="bk-say bk-late" style="--d:1.2s" data-tone="${tone}">${say}</p>${next}`;
  }

  tap(b) {
    if (this.won || this.done[this.day]) return;
    const D = DAYS[this.day];
    this.pick = b;
    if (b === D.best) this.done[this.day] = true;
    else { if (!this.tried.includes(b)) this.tried.push(b); this.misses++; }
    this.fresh = true;
    this.draw();
  }

  next() {
    if (!this.done[this.day]) return;
    if (this.day < 4) {
      this.day++;
      this.pick = null;
      this.tried = [];
      this.draw();
      return;
    }
    this.won = true;
    this.draw();
    finishGame(this);
  }

  checkObjective() { return this.won && this.done.every(Boolean) ? { ok: true } : null; }

  resetChallenge() {
    super.resetChallenge?.();
    this.reset();
    this.draw();
  }

  testState() { return { day: this.day, pick: this.pick, tried: this.tried.slice(), solved: this.done.slice(), won: this.won }; }
}
