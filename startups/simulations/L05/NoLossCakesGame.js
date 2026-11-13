// NoLossCakesGame - L05 game (blk-l05-s04): the ABC Bakery no-loss game. Three months, made-up numbers.
// Each month the side card gives the fixed costs, the price of a cake and its variable cost (ingredients and a
// box). The learner sets the cakes sold in the month with - 5 / + 5 (0-150). Two bars on one fixed scale:
// revenue = cakes x price; expenses = fixed + cakes x variable (the fixed part and the variable part in two
// colours). The result card shows revenue, expenses and the profit or loss live. Check: right = the smallest
// number with no loss (profit exactly 0 here). Month 1: 10,000 / 500 / 300 -> 50. Month 2 (festival discount):
// 10,000 / 400 / 300 -> 100. Month 3 (a second oven): 15,000 / 500 / 300 -> 75. Text-L05 report numbers,
// python-checked and asserted at load.
// Wrong: below the answer = "Loss of Rs X. Each cake leaves Rs (P-V) towards Rs F of fixed costs. Sell more.";
// above = "No loss, but you can sell fewer cakes and still make no loss." The controls never show the answer.
// Month 1 starts at 0; months 2-3 start from last month's answer, so the learner sees what the change did.
// Win (checkObjective): all three months exact; finishGame after month 3. The oven is drawn here. ASCII only.
import { GameBoard, mountGame, finishGame, onTap } from 'simulations/base/kit/GameFrame.js';
import { iconSvg } from 'simulations/base/kit/SimIcons.js';
import { RS, group, tag, MONEY_CSS } from '../shared/MoneyKit.js';
import { bakery, bunting, STALL_CSS } from '../shared/StallKit.js';

const TIMES = '\u00d7';
const STEP = 5, MAXN = 150, SCALE = 80000;   // the bars' fixed scale, the same every month
const MONTHS = [
  { title: 'A usual month', tag: 'usual', art: 'usual', fixed: 10000, price: 500, vc: 300, ans: 50, changed: null,
    note: 'A usual month at the bakery.' },
  { title: 'Festival discount', tag: 'discount', art: 'festival', fixed: 10000, price: 400, vc: 300, ans: 100, changed: 'price',
    note: 'Festival month: a cake sells for ' + RS + '400, not ' + RS + '500.' },
  { title: 'A second oven', tag: 'second oven', art: 'oven', fixed: 15000, price: 500, vc: 300, ans: 75, changed: 'fixed',
    note: 'A second oven adds ' + RS + '5,000 to the fixed costs.' },
];
const profitOf = (m, n) => n * m.price - (m.fixed + n * m.vc);
// The text-L05 table, checked here so a typo in MONTHS cannot slip through: the answer is the smallest step of 5
// with no loss, its profit is exactly 0, and one step below loses 1,000 / 500 / 1,000.
const NEAR = [-1000, -500, -1000];
MONTHS.forEach((m, i) => {
  const first = Array.from({ length: MAXN / STEP + 1 }, (_, k) => k * STEP).find((n) => profitOf(m, n) >= 0);
  if (first !== m.ans || profitOf(m, m.ans) !== 0) throw new Error(`NoLossCakesGame: month ${i + 1} answer mismatch`);
  if (profitOf(m, m.ans - STEP) !== NEAR[i]) throw new Error(`NoLossCakesGame: month ${i + 1} near miss mismatch`);
  if (m.fixed / (m.price - m.vc) !== m.ans) throw new Error(`NoLossCakesGame: month ${i + 1} leaves mismatch`);
});
if (MONTHS.map((m) => m.ans).join() !== '50,100,75') throw new Error('NoLossCakesGame: answers are not 50 / 100 / 75');

const money = (n) => RS + group(n);
const f1 = (v) => (+v).toFixed(1);
const pct = (v) => f1(Math.max(0, Math.min(100, (v / SCALE) * 100)));
const ic = (name, tone, x, y, s) => iconSvg(name, tone).replace('width="48" height="48"', `x="${f1(x)}" y="${f1(y)}" width="${f1(s)}" height="${f1(s)}"`);

const C_REV = 'var(--sim-series-1)', C_FIX = 'var(--sim-series-5)', C_VAR = 'var(--sim-series-3)';

// A small baking oven (drawn here, no oven in StallKit): a box with a glass door, a handle and two knobs; no face.
function oven(x, y, w) {
  const h = w * 0.9, x0 = x - w / 2, top = y - h, rim = 'var(--sim-stroke)', body = 'color-mix(in oklab, var(--sim-series-7) 30%, var(--sim-bg-surface))';
  let s = `<rect x="${f1(x0)}" y="${f1(top)}" width="${f1(w)}" height="${f1(h)}" rx="6" style="fill:${body};stroke:${rim};stroke-width:2.5"/>`;
  s += `<rect x="${f1(x0 + w * 0.12)}" y="${f1(top + h * 0.3)}" width="${f1(w * 0.76)}" height="${f1(h * 0.56)}" rx="5" style="fill:color-mix(in oklab, var(--sim-gold) 40%, var(--sim-bg-deep));stroke:${rim};stroke-width:2"/>`;
  s += `<path d="M${f1(x0 + w * 0.22)} ${f1(top + h * 0.38)}H${f1(x0 + w * 0.78)}" style="stroke:var(--sim-label);stroke-width:3;stroke-linecap:round"/>`;
  [0.3, 0.5].forEach((k) => { s += `<circle cx="${f1(x0 + w * (k === 0.3 ? 0.24 : 0.4))}" cy="${f1(top + h * 0.15)}" r="${f1(w * 0.06)}" style="fill:var(--sim-label-muted)"/>`; });
  s += `<rect x="${f1(x0 + w * 0.56)}" y="${f1(top + h * 0.1)}" width="${f1(w * 0.3)}" height="${f1(h * 0.1)}" rx="3" style="fill:var(--sim-bg-deep);stroke:${rim};stroke-width:1.5"/>`;
  return s;
}

// The bakery in the month: sun (usual), bunting and a Rs 400 cake tag (festival discount), a second oven.
function monthFig(m) {
  let s = '<svg viewBox="0 0 200 128" aria-hidden="true" class="nl-figsvg">';
  s += '<rect x="0" y="0" width="200" height="128" rx="14" style="fill:color-mix(in oklab, var(--sim-series-1) 10%, var(--sim-bg-surface))"/>';
  s += '<rect x="0" y="116" width="200" height="12" style="fill:color-mix(in oklab, var(--sim-series-3) 26%, var(--sim-bg-surface))"/>';
  if (m.art === 'usual') s += bakery(84, 120, 104, { signSize: 15 }) + ic('sun', 'var(--sim-gold)', 150, 12, 40);
  if (m.art === 'festival') s += bunting(4, 10, 196, 10, 9, { sag: 10, size: 13 }) + bakery(70, 120, 96, { signSize: 15 }) + tag(156, 84, 'cake', 400, { w: 80, labelSize: 15 });
  if (m.art === 'oven') s += bakery(70, 120, 96, { signSize: 15 }) + oven(160, 118, 58) + `<text x="160" y="40" text-anchor="middle" style="fill:var(--sim-label);font:800 17px var(--sim-font)">+${RS}5,000</text>`;
  return s + '</svg>';
}

const CSS = STALL_CSS + MONEY_CSS + `
.gm.nl { background: var(--sim-bg-deep); border-radius: var(--sim-radius-md); }
.nl .nl-main { flex: 1 1 auto; min-height: 0; display: grid; grid-template-columns: 236px minmax(0, 1fr) 280px; gap: 12px; align-items: stretch; }
.nl .nl-card { background: var(--sim-bg-surface); border: calc(2px * var(--look-rim)) solid var(--sim-stroke); border-radius: var(--sim-radius-lg); padding: 10px 12px; }
.nl .nl-side { display: flex; flex-direction: column; gap: 7px; }
.nl .nl-fig svg { display: block; width: 100%; height: auto; max-height: 100px; }
.nl .nl-sidetext { display: flex; flex-direction: column; gap: 6px; min-width: 0; }
.nl .nl-pips { display: flex; justify-content: center; gap: 7px; }
.nl .nl-pip { width: 15px; height: 15px; border-radius: 50%; border: 2px solid var(--sim-stroke); background: var(--sim-bg-surface); }
.nl .nl-pip[data-s="done"] { background: var(--sim-good); border-color: var(--sim-good); }
.nl .nl-pip[data-s="now"] { background: var(--sim-accent); border-color: var(--sim-accent); }
.nl .nl-note { margin: 0; padding: 6px 9px; border-radius: var(--sim-radius-md); font: 800 16px/1.3 var(--sim-font);
  background: color-mix(in oklab, var(--sim-gold) 22%, var(--sim-bg-surface)); border: 2px solid color-mix(in oklab, var(--sim-gold) 60%, var(--sim-stroke)); }
.nl .nl-given { display: grid; gap: 4px; margin: 0; padding: 0; list-style: none; }
.nl .nl-given li { display: flex; justify-content: space-between; align-items: baseline; gap: 6px; padding: 2px 6px; border-radius: 8px; font: 700 15px/1.2 var(--sim-font); color: var(--sim-label-muted); }
.nl .nl-given li b { font: 800 19px/1.1 var(--sim-font-display, var(--sim-font)); color: var(--sim-label); white-space: nowrap; }
.nl .nl-given li[data-s="new"] { outline: 2.5px solid var(--sim-accent); outline-offset: -1px; background: color-mix(in oklab, var(--sim-accent) 12%, var(--sim-bg-surface)); }
.nl .nl-board { display: flex; flex-direction: column; gap: 8px; }
.nl .nl-count { display: flex; align-items: center; justify-content: center; gap: 12px; margin: 0; }
.nl .nl-count .nl-n { display: flex; flex-direction: column; align-items: center; gap: 5px; min-width: 130px; font: 700 15px/1.1 var(--sim-font); color: var(--sim-label-muted); }
.nl .nl-count .nl-n b { font: 800 40px/1.15 var(--sim-font-display, var(--sim-font)); color: var(--sim-label); }
.nl .nl-pm { width: 74px; min-height: 52px; padding: 0; font: 800 23px/1 var(--sim-font-display, var(--sim-font)); }
.nl .nl-pm[aria-disabled="true"] { opacity: 0.38; cursor: default; }
.nl .nl-bars { display: flex; flex-direction: column; gap: 6px; flex: 1 1 auto; justify-content: center; }
.nl .nl-blab { display: flex; align-items: baseline; gap: 8px; margin: 0; font: 800 17px/1.2 var(--sim-font); }
.nl .nl-blab span { font: 700 15px/1.2 var(--sim-font); color: var(--sim-label-muted); flex: 1 1 auto; }
.nl .nl-blab em { font: 800 20px/1 var(--sim-font-display, var(--sim-font)); font-style: normal; white-space: nowrap; }
.nl .nl-track { position: relative; display: flex; height: 44px; border-radius: 8px; background: var(--sim-bg-deep); border: 1.5px solid var(--sim-stroke); overflow: hidden; }
.nl .nl-seg { display: block; height: 100%; width: var(--w); border-right: 2px solid var(--sim-bg-surface); }
.nl .nl-seg:last-of-type { border-right: 0; }
.nl .nl-mark { position: absolute; top: -2px; bottom: -2px; width: 0; border-left: 3px dashed var(--sim-label); left: var(--w); }
.nl-anim .nl-seg { animation: nl-grow 0.5s cubic-bezier(.3,1.1,.5,1) both; }
@keyframes nl-grow { from { width: var(--w0); } to { width: var(--w); } }
.nl .nl-key { display: flex; flex-wrap: wrap; gap: 4px 14px; white-space: nowrap; margin: 0; font: 700 15px/1.2 var(--sim-font); color: var(--sim-label-muted); }
.nl .nl-key .nl-dash { width: 0; height: 15px; border-radius: 0; border-left: 3px dashed var(--sim-label); }
.nl .nl-key i { display: inline-block; width: 14px; height: 14px; border-radius: 4px; margin-right: 4px; vertical-align: -2px; }
.nl .nl-res { display: flex; flex-direction: column; gap: 5px; }
.nl .nl-line { display: flex; justify-content: space-between; gap: 6px; margin: 0; font: 800 17px/1.25 var(--sim-font); }
.nl .nl-line b { white-space: nowrap; }
.nl .nl-big { font: 800 30px/1.15 var(--sim-font-display, var(--sim-font)); margin: 2px 0 0; border-top: 2px solid var(--sim-stroke); padding-top: 4px; }
.nl .nl-big[data-tone="good"] { color: var(--sim-good); } .nl .nl-big[data-tone="bad"] { color: var(--sim-bad); }
.nl .nl-big span { font-size: 19px; }
.nl .nl-rule { margin: 0; font: 700 15px/1.3 var(--sim-font); color: var(--sim-label-muted); }
.nl .nl-say { margin: 0; font: 700 16px/1.3 var(--sim-font); }
.nl .nl-say[data-tone="good"] { color: var(--sim-good); } .nl .nl-say[data-tone="bad"] { color: var(--sim-bad); }
.nl .nl-go { margin-top: auto; min-height: 48px; font-size: 17px; font-weight: 800; border: 0; background: var(--sim-accent); color: var(--sim-bg-deep);
  box-shadow: 0 var(--sim-lift) 0 color-mix(in oklab, var(--sim-accent) 65%, var(--sim-label)); }
.nl .nl-go:active { box-shadow: none; }
.nl .nl-sum { display: grid; gap: 3px; margin: 0; padding: 0; list-style: none; }
.nl .nl-sum li { display: flex; justify-content: space-between; gap: 6px; font: 800 16px/1.3 var(--sim-font); }
.nl .nl-sum li b { color: var(--sim-good); white-space: nowrap; }
.nl-anim .nl-pop { animation: nl-pop 0.4s cubic-bezier(.3,1.4,.5,1) both; animation-delay: var(--d, 0s); }
@keyframes nl-pop { from { transform: scale(0.4); opacity: 0; } }
@media (prefers-reduced-motion: reduce) { .nl-anim .nl-pop, .nl-anim .nl-seg { animation: none; } }
.sim-dom-root--portrait .nl .nl-main { display: flex; flex-direction: column; gap: 7px; }
.sim-dom-root--portrait .nl .nl-side { display: grid; grid-template-columns: 92px minmax(0, 1fr); align-items: center; gap: 6px 9px; padding: 6px 8px; }
.sim-dom-root--portrait .nl .nl-fig svg { max-height: none; }
.sim-dom-root--portrait .nl .nl-pips { justify-content: flex-start; }
.sim-dom-root--portrait .nl .nl-note { font-size: 15px; padding: 4px 7px; }
.sim-dom-root--portrait .nl .nl-given { grid-column: 1 / -1; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 4px; }
.sim-dom-root--portrait .nl .nl-given li { flex-direction: column; align-items: center; text-align: center; gap: 1px; font-size: 14px; padding: 3px 2px; }
.sim-dom-root--portrait .nl .nl-given li b { font-size: 18px; }
.sim-dom-root--portrait .nl .nl-board { padding: 7px 8px; gap: 6px; }
.sim-dom-root--portrait .nl .nl-count .nl-n { min-width: 96px; }
.sim-dom-root--portrait .nl .nl-count .nl-n b { font-size: 34px; }
.sim-dom-root--portrait .nl .nl-pm { width: 64px; min-height: 48px; }
.sim-dom-root--portrait .nl .nl-blab { font-size: 16px; gap: 6px; }
.sim-dom-root--portrait .nl .nl-blab span { font-size: 14px; }
.sim-dom-root--portrait .nl .nl-blab em { font-size: 18px; }
.sim-dom-root--portrait .nl .nl-track { height: 28px; }
.sim-dom-root--portrait .nl .nl-key { display: none; }
.sim-dom-root--portrait .nl .nl-res { padding: 6px 10px; gap: 4px; }
.sim-dom-root--portrait .nl .nl-res .nl-line { display: none; }
.sim-dom-root--portrait .nl .nl-res .nl-sum li { font-size: 15px; }
.sim-dom-root--portrait .nl .nl-big { font-size: 26px; border-top: 0; padding-top: 0; margin: 0; }
.sim-dom-root--portrait .nl .nl-res > .nl-rule { display: none; }
.sim-dom-root--portrait .nl .nl-say { font-size: 15px; }
.sim-dom-root--portrait .nl[data-ph="won"] .nl-board { display: none; }
`;

export class NoLossCakesGame extends GameBoard {
  static HEIGHT = 430;
  static CONTINUOUS = false;
  static OBJECTIVE = { prompt: { en: 'In each of three months, find the smallest number of cakes that leaves the bakery with no loss.' } };
  static ARIA_LABEL = 'The ABC Bakery no-loss game, with made-up numbers. Three months. Each month gives the fixed costs, the price of a cake, and the cost of the ingredients and box for each cake. Use minus 5 and plus 5 to set how many cakes are sold. Two bars show revenue, cakes times price, and expenses, the fixed costs plus cakes times the ingredients and box. Find the smallest number of cakes with no loss, then tap Check.';

  async setup() {
    this.reset();
    await super.setup();
    mountGame(this, {
      css: CSS, check: false,
      html: `<div class="gm nl"><div class="gm-head"><h2 class="nl-h"></h2>
        <p class="sub">Made-up numbers. Find the smallest number of cakes with no loss.</p></div>
        <div class="nl-main">
          <div class="nl-card nl-side"><div class="nl-fig"></div><div class="nl-sidetext"><div class="nl-pips"></div><p class="nl-note"></p></div>
            <ul class="nl-given"></ul></div>
          <div class="nl-card nl-board"></div>
          <div class="nl-card nl-res" aria-live="polite"></div>
        </div></div>`,
    });
    // One Quill only: mini-game@1 draws him in its verdict strip, so the frame's corner Quill goes (never on the board).
    this.quill?.destroy?.(); this.quill = null; this._scaleWrap?.classList.remove('gm-quill');
    this.draw();
  }

  reset() {
    this.month = 0;
    this.n = 0;
    this.prevN = 0;            // where the bars grow from
    this.checked = false;      // Check tapped since the last change
    this.done = [false, false, false];
    this.misses = 0;
    this.won = false;
    this.fresh = false;
  }

  portrait() { return !!(this.root?.closest?.('.sim-dom-root--portrait') || this.root?.classList?.contains('sim-dom-root--portrait')); }

  draw() {
    const q = (s) => this.root?.querySelector(s);
    if (!q('.nl-board')) return;
    const M = MONTHS[this.month];
    q('.nl-h').textContent = this.won ? 'Three months done' : `Month ${this.month + 1}${this.portrait() ? '' : ' of 3'}: ${M.title}`;
    q('.gm.nl').dataset.ph = this.won ? 'won' : 'play';
    q('.nl-fig').innerHTML = monthFig(M);
    q('.nl-pips').innerHTML = MONTHS.map((m, i) => `<span class="nl-pip" data-s="${this.done[i] ? 'done' : i === this.month && !this.won ? 'now' : ''}" aria-label="month ${i + 1}${this.done[i] ? ': done' : ''}"></span>`).join('');
    q('.nl-note').textContent = M.note;
    const row = (key, label, v) => `<li${M.changed === key && !this.won ? ' data-s="new"' : ''}><span>${label}</span><b>${money(v)}</b></li>`;
    q('.nl-given').innerHTML = row('fixed', 'Fixed costs', M.fixed) + row('price', 'Price of a cake', M.price) + row('vc', 'Ingredients and box', M.vc);
    const board = q('.nl-board');
    board.classList.toggle('nl-anim', this.fresh);
    board.innerHTML = this.boardHtml();
    board.querySelectorAll('.nl-pm').forEach((b) => onTap(b, () => this.nudge(Number(b.dataset.d))));
    const res = q('.nl-res');
    res.classList.toggle('nl-anim', this.fresh);
    res.innerHTML = this.resultHtml();
    const go = q('.nl-go');
    if (go) onTap(go, () => (this.won ? null : this.done[this.month] ? this.next() : this.submit()));
    this.fresh = false;
    this.prevN = this.n;
    this.relayout?.();
  }

  boardHtml() {
    const M = MONTHS[this.month], n = this.n, n0 = this.prevN, locked = this.won || this.done[this.month];
    const rev = n * M.price, varc = n * M.vc, exp = M.fixed + varc;
    const seg = (v, v0, c) => `<i class="nl-seg" style="--w:${pct(v)}%;--w0:${pct(v0)}%;background:${c}"></i>`;
    const minus = locked || n <= 0, plus = locked || n >= MAXN;
    return `<div class="nl-count">
        <button type="button" class="tap btn nl-pm" data-d="-1"${minus ? ' aria-disabled="true"' : ''} aria-label="5 cakes fewer">-${STEP}</button>
        <span class="nl-n"><b>${n}</b><span>cakes sold</span></span>
        <button type="button" class="tap btn nl-pm" data-d="1"${plus ? ' aria-disabled="true"' : ''} aria-label="5 cakes more">+${STEP}</button></div>
      <div class="nl-bars">
        <p class="nl-blab">Revenue <span>${n} ${TIMES} ${money(M.price)}</span><em>${money(rev)}</em></p>
        <div class="nl-track" aria-hidden="true">${seg(rev, n0 * M.price, C_REV)}</div>
        <p class="nl-blab">Expenses <span>${money(M.fixed)} + ${n} ${TIMES} ${money(M.vc)}</span><em>${money(exp)}</em></p>
        <div class="nl-track" aria-hidden="true">${seg(M.fixed, M.fixed, C_FIX)}${seg(varc, n0 * M.vc, C_VAR)}<i class="nl-mark" style="--w:${pct(rev)}%"></i></div>
        <p class="nl-key"><span><i style="background:${C_REV}"></i>money from cakes</span><span><i style="background:${C_FIX}"></i>fixed costs</span><span><i style="background:${C_VAR}"></i>ingredients and boxes</span><span><i class="nl-dash"></i>revenue line</span></p>
      </div>`;
  }

  resultHtml() {
    if (this.won) {
      return `<p class="nl-line">No-loss cakes each month</p><ul class="nl-sum">${MONTHS.map((m, i) => `<li><span>Month ${i + 1}: ${money(m.price - m.vc)} a cake</span><b>${m.ans} cakes</b></li>`).join('')}</ul>
        <p class="nl-say" data-tone="good">What each cake leaves must add up to the fixed costs. Less left per cake, or more fixed costs, means more cakes.</p>`;
    }
    const M = MONTHS[this.month], n = this.n, v = profitOf(M, n), rev = n * M.price, exp = M.fixed + n * M.vc;
    const big = v < 0 ? `${money(-v)} <span>loss</span>` : v > 0 ? `${money(v)} <span>profit</span>` : `${RS}0 <span>no loss</span>`;
    const head = `<p class="nl-line"><span>Revenue</span><b>${money(rev)}</b></p><p class="nl-line"><span>Expenses</span><b>${money(exp)}</b></p>
      <p class="nl-big" data-tone="${v < 0 ? 'bad' : v === 0 ? 'good' : ''}">= ${big}</p>`;
    if (this.done[this.month]) {
      const left = M.price - M.vc;
      return `${head}<p class="nl-say nl-pop" data-tone="good">Right! Each cake leaves ${money(left)}. ${M.ans} ${TIMES} ${money(left)} = ${money(M.fixed)}, the fixed costs.</p>
        <button type="button" class="tap btn nl-go">${this.month < 2 ? 'Next month' : 'See the three months'}</button>`;
    }
    let say = '';
    if (this.checked) {
      say = v < 0
        ? `<p class="nl-say nl-pop" data-tone="bad">Loss of ${money(-v)}. Each cake leaves ${money(M.price - M.vc)} towards ${money(M.fixed)} of fixed costs. Sell more.</p>`
        : `<p class="nl-say nl-pop" data-tone="bad">No loss, but you can sell fewer cakes and still make no loss.</p>`;
    } else {
      say = `<p class="nl-rule">${this.month === 0 ? 'Change the number of cakes. Watch the two bars.' : 'The count starts at last month\'s answer.'}</p>`;
    }
    return `${head}${say}<button type="button" class="tap btn nl-go">Check</button>`;
  }

  nudge(d) {
    if (this.won || this.done[this.month]) return;
    const n = this.n + d * STEP;
    if (n < 0 || n > MAXN) return;
    this.n = n;
    this.checked = false;
    this.fresh = true;
    this.draw();
    this.root?.querySelector(`.nl-pm[data-d="${d}"]`)?.focus?.();
  }

  submit() {
    if (this.won || this.done[this.month]) return;
    this.checked = true;
    if (this.n === MONTHS[this.month].ans) this.done[this.month] = true;
    else this.misses++;
    this.fresh = true;
    this.draw();
  }

  next() {
    if (!this.done[this.month]) return;
    if (this.month < 2) {
      this.month++;
      this.n = MONTHS[this.month - 1].ans;    // start from last month's answer
      this.prevN = this.n;
      this.checked = false;
      this.fresh = true;
      this.draw();
      return;
    }
    this.won = true;
    this.fresh = true;
    this.draw();
    finishGame(this);
  }

  checkObjective() { return this.won && this.done.every(Boolean) ? { ok: true } : null; }

  resetChallenge() {
    super.resetChallenge?.();
    this.reset();
    this.draw();
  }

  testState() { return { month: this.month, n: this.n, profit: profitOf(MONTHS[this.month], this.n), checked: this.checked, solved: this.done.slice(), won: this.won, misses: this.misses }; }
}
