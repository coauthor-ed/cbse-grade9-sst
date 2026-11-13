// ReinvestGame - L06 game (blk-l06-s04): run a trading firm, like a Chettiar firm, for three years. Made-up
// numbers. Start: Rs 1,00,000 of trade money. Each year the profit is Rs 20 for every Rs 100 of trade money (20%).
// Each year one of three choices for the profit: all back into trade, half and half, or all to temples, education
// and welfare. Two bars: trade money (goal Rs 1,30,000) and money given (goal Rs 35,000), each with a dashed goal
// line. Win at the end of year 3: trade money >= 1,30,000 AND given >= 35,000. Exactly three of the 27 paths win
// (trade-half-give, half-trade-give, trade-give-half: all reinvest early, give later); the text-L06 report table is
// asserted below at load. A path that misses names the short goal and the direction (put more back early / give
// more, later), never the path; then the learner tries again from year 1, with the last try shown for comparison.
// The three buttons are shuffled once per game (Math.random). Win (checkObjective) -> finishGame. ASCII only.
import { GameBoard, mountGame, finishGame, onTap } from 'simulations/base/kit/GameFrame.js';
import { iconSvg } from 'simulations/base/kit/SimIcons.js';
import { RS, group, coin, MONEY_CSS } from '../shared/MoneyKit.js';
import { STALL_CSS } from '../shared/StallKit.js';

const START = 100000, RATE = 20, YEARS = 3;
const GOAL_T = 130000, GOAL_G = 35000;
const MAX_T = 180000, MAX_G = 70000;     // the two bars' fixed scales
const CHOICES = [
  { key: 'T', label: 'All back into trade', short: 'all to trade' },
  { key: 'H', label: 'Half and half', short: 'half and half' },
  { key: 'W', label: 'All to temples, education and welfare', short: 'all given' },
];
const profitOn = (t) => (t * RATE) / 100;
function play(path) {
  let t = START, g = 0;
  const profits = [];
  for (const c of path) {
    const p = profitOn(t);
    profits.push(p);
    if (c === 'T') t += p;
    else if (c === 'H') { t += p / 2; g += p / 2; }
    else g += p;
  }
  return { t, g, profits, win: t >= GOAL_T && g >= GOAL_G };
}
// The text-L06 report, checked here: all 27 paths, exactly three winners, and the near misses named in the report.
{
  const all = [];
  for (const a of 'THW') for (const b of 'THW') for (const c of 'THW') all.push(a + b + c);
  const wins = all.filter((p) => play(p).win).sort().join();
  if (all.length !== 27 || wins !== 'HTW,THW,TWH') throw new Error(`ReinvestGame: winning paths ${wins}`);
  const want = { THW: [132000, 38400, '20000,24000,26400'], HTW: [132000, 36400, '20000,22000,26400'], TWH: [132000, 36000, '20000,24000,24000'],
    HHH: [133100, 33100], TTW: [144000, 28800], WWW: [100000, 60000], TTT: [172800, 0] };
  Object.entries(want).forEach(([p, [t, g, pr]]) => {
    const r = play(p);
    if (r.t !== t || r.g !== g || (pr && r.profits.join() !== pr)) throw new Error(`ReinvestGame: path ${p} mismatch`);
  });
}

const money = (n) => RS + group(n);
const f1 = (v) => (+v).toFixed(1);
const pct = (v, max) => f1(Math.max(0, Math.min(100, (v / max) * 100)));
const ic = (name, tone, x, y, s) => iconSvg(name, tone).replace('width="48" height="48"', `x="${f1(x)}" y="${f1(y)}" width="${f1(s)}" height="${f1(s)}"`);
const C_T = 'var(--sim-series-1)', C_G = 'var(--sim-series-3)';

// The firm: a trading boat on the sea, crates of goods on the shore, a coin. No real firm, no flag.
function firmFig() {
  let s = '<svg viewBox="0 0 200 128" aria-hidden="true" class="rv-figsvg">';
  s += '<rect x="0" y="0" width="200" height="128" rx="14" style="fill:color-mix(in oklab, var(--sim-series-1) 10%, var(--sim-bg-surface))"/>';
  s += '<path d="M0 84H200V114Q200 128 186 128H14Q0 128 0 114Z" style="fill:color-mix(in oklab, var(--sim-series-7) 40%, var(--sim-bg-surface))"/>';
  s += '<path d="M0 84H86L110 128H0Z" style="fill:color-mix(in oklab, var(--sim-series-3) 30%, var(--sim-bg-surface))"/>';
  s += ic('boat', 2, 112, 48, 70);
  s += ic('crate', 8, 6, 50, 40) + ic('crate', 8, 42, 50, 40) + ic('crate', 8, 24, 16, 38);
  s += coin(170, 24, 14);
  return s + '</svg>';
}

const CSS = STALL_CSS + MONEY_CSS + `
.gm.rv { background: var(--sim-bg-deep); border-radius: var(--sim-radius-md); }
.rv .rv-main { flex: 1 1 auto; min-height: 0; display: grid; grid-template-columns: 226px minmax(0, 1fr) 286px; gap: 12px; align-items: stretch; }
.rv .rv-card { background: var(--sim-bg-surface); border: calc(2px * var(--look-rim)) solid var(--sim-stroke); border-radius: var(--sim-radius-lg); padding: 10px 12px; }
.rv .rv-side { display: flex; flex-direction: column; gap: 7px; }
.rv .rv-fig svg { display: block; width: 100%; height: auto; max-height: 100px; }
.rv .rv-sidetext { display: flex; flex-direction: column; gap: 6px; min-width: 0; }
.rv .rv-pips { display: flex; justify-content: center; gap: 7px; }
.rv .rv-pip { width: 15px; height: 15px; border-radius: 50%; border: 2px solid var(--sim-stroke); background: var(--sim-bg-surface); }
.rv .rv-pip[data-s="done"] { background: var(--sim-good); border-color: var(--sim-good); }
.rv .rv-pip[data-s="now"] { background: var(--sim-accent); border-color: var(--sim-accent); }
.rv .rv-note { margin: 0; padding: 6px 9px; border-radius: var(--sim-radius-md); font: 800 16px/1.3 var(--sim-font);
  background: color-mix(in oklab, var(--sim-gold) 22%, var(--sim-bg-surface)); border: 2px solid color-mix(in oklab, var(--sim-gold) 60%, var(--sim-stroke)); }
.rv .rv-board { display: flex; flex-direction: column; gap: 6px; }
.rv .rv-profit { display: grid; grid-template-columns: auto minmax(0, 1fr) auto; align-items: center; gap: 0 10px; margin: 0; padding: 4px 10px; border-radius: var(--sim-radius-md);
  background: color-mix(in oklab, var(--sim-series-2) 16%, var(--sim-bg-surface)); border: 2px solid color-mix(in oklab, var(--sim-series-2) 55%, var(--sim-stroke)); }
.rv .rv-profit svg { width: 34px; height: 34px; grid-row: 1 / 3; }
.rv .rv-profit > b { font: 800 18px/1.2 var(--sim-font); }
.rv .rv-profit span { grid-column: 2 / 4; font: 700 15px/1.2 var(--sim-font); color: var(--sim-label-muted); }
.rv .rv-profit em { grid-row: 1 / 3; grid-column: 3; font: 800 30px/1 var(--sim-font-display, var(--sim-font)); font-style: normal; white-space: nowrap; }
.rv .rv-bars { display: flex; flex-direction: column; gap: 4px; }
.rv .rv-blab { display: flex; align-items: center; gap: 6px; margin: 0; font: 800 17px/1.2 var(--sim-font); }
.rv .rv-blab svg { width: 24px; height: 24px; flex: none; }
.rv .rv-blab em { margin-left: auto; font: 800 22px/1 var(--sim-font-display, var(--sim-font)); font-style: normal; white-space: nowrap; }
.rv .rv-gl { position: relative; height: 18px; margin: 0; }
.rv .rv-gl small { position: absolute; top: 1px; margin-right: -6px; font: 700 15px/1 var(--sim-font); color: var(--sim-label-muted); white-space: nowrap; }
.rv .rv-gl small[data-s="met"] { color: var(--sim-good); }
.rv .rv-track { position: relative; height: 30px; border-radius: 8px; background: var(--sim-bg-deep); border: 1.5px solid var(--sim-stroke); }
.rv .rv-fill { position: absolute; left: 0; top: 0; bottom: 0; width: var(--w); border-radius: 7px; }
.rv-anim .rv-fill { animation: rv-grow 0.6s cubic-bezier(.3,1.1,.5,1) both; }
@keyframes rv-grow { from { width: var(--w0); } to { width: var(--w); } }
.rv .rv-goal { position: absolute; top: -5px; bottom: -5px; width: 0; border-left: 3px dashed var(--sim-label); }
.rv .rv-btns { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; margin-top: auto; }
.rv .rv-b { min-height: 56px; padding: 5px 8px; font: 800 16px/1.2 var(--sim-font); }
.rv .rv-b[aria-disabled="true"] { opacity: 0.45; cursor: default; }
.rv .rv-res { display: flex; flex-direction: column; gap: 5px; }
.rv .rv-eq { font: 800 19px/1.2 var(--sim-font); margin: 0; }
.rv .rv-hist { display: grid; gap: 3px; margin: 0; padding: 0; list-style: none; }
.rv .rv-hist li { display: flex; justify-content: space-between; gap: 6px; font: 700 15px/1.3 var(--sim-font); }
.rv .rv-hist li b { white-space: nowrap; }
.rv .rv-rule { margin: 0; font: 700 15px/1.3 var(--sim-font); color: var(--sim-label-muted); }
.rv .rv-say { margin: 0; font: 700 16px/1.3 var(--sim-font); }
.rv .rv-say[data-tone="good"] { color: var(--sim-good); } .rv .rv-say[data-tone="bad"] { color: var(--sim-bad); }
.rv .rv-go { margin-top: auto; min-height: 48px; font-size: 17px; font-weight: 800; border: 0; background: var(--sim-accent); color: var(--sim-bg-deep);
  box-shadow: 0 var(--sim-lift) 0 color-mix(in oklab, var(--sim-accent) 65%, var(--sim-label)); }
.rv .rv-go:active { box-shadow: none; }
.rv-anim .rv-pop { animation: rv-pop 0.4s cubic-bezier(.3,1.4,.5,1) both; animation-delay: var(--d, 0s); }
@keyframes rv-pop { from { transform: scale(0.4); opacity: 0; } }
@media (prefers-reduced-motion: reduce) { .rv-anim .rv-pop, .rv-anim .rv-fill { animation: none; } }
.sim-dom-root--portrait .rv .rv-main { display: flex; flex-direction: column; gap: 7px; }
.sim-dom-root--portrait .rv .rv-side { flex-direction: row; align-items: center; gap: 9px; padding: 6px 8px; }
.sim-dom-root--portrait .rv .rv-fig { width: 92px; flex: none; }
.sim-dom-root--portrait .rv .rv-fig svg { max-height: none; }
.sim-dom-root--portrait .rv .rv-pips { justify-content: flex-start; }
.sim-dom-root--portrait .rv .rv-note { font-size: 15px; padding: 4px 7px; }
.sim-dom-root--portrait .rv .rv-board { padding: 7px 8px; gap: 6px; }
.sim-dom-root--portrait .rv .rv-profit { grid-template-columns: minmax(0, 1fr) auto; padding: 4px 8px; }
.sim-dom-root--portrait .rv .rv-profit svg { display: none; }
.sim-dom-root--portrait .rv .rv-profit em { font-size: 26px; grid-column: 2; grid-row: 1; }
.sim-dom-root--portrait .rv .rv-profit span { grid-column: 1 / 3; font-size: 14px; }
.sim-dom-root--portrait .rv .rv-blab { font-size: 16px; }
.sim-dom-root--portrait .rv .rv-blab svg { display: none; }
.sim-dom-root--portrait .rv .rv-blab em { font-size: 20px; }
.sim-dom-root--portrait .rv .rv-gl { height: 16px; }
.sim-dom-root--portrait .rv .rv-gl small { font-size: 14px; }
.sim-dom-root--portrait .rv .rv-track { height: 26px; }
.sim-dom-root--portrait .rv .rv-btns { grid-template-columns: minmax(0, 1fr); gap: 6px; }
.sim-dom-root--portrait .rv .rv-b { min-height: 48px; }
.sim-dom-root--portrait .rv .rv-res { padding: 6px 10px; gap: 4px; }
.sim-dom-root--portrait .rv .rv-res .rv-rule { display: none; }
.sim-dom-root--portrait .rv .rv-say { font-size: 15px; }
.sim-dom-root--portrait .rv[data-ph="pick"] .rv-res { display: none; }
.sim-dom-root--portrait .rv[data-ph="end"] .rv-board, .sim-dom-root--portrait .rv[data-ph="won"] .rv-board { display: none; }
`;

export class ReinvestGame extends GameBoard {
  static HEIGHT = 430;
  static CONTINUOUS = false;
  static OBJECTIVE = { prompt: { en: 'In three years, end with at least \u20b91,30,000 of trade money and give at least \u20b935,000 to temples, education and welfare.' } };
  static ARIA_LABEL = 'The reinvest game, with made-up numbers. You run a trading firm, like a Chettiar firm, for three years. The firm starts with 1,00,000 rupees of trade money, and each year it earns 20 rupees of profit for every 100 rupees of trade money. Each year choose what to do with the profit: all back into trade, half and half, or all to temples, education and welfare. Two bars show the trade money, with a goal of 1,30,000 rupees, and the money given, with a goal of 35,000 rupees.';

  async setup() {
    this.order = CHOICES.slice();
    for (let i = this.order.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.order[i], this.order[j]] = [this.order[j], this.order[i]];
    }
    this.last = null;
    this.won = false;
    this.reset();
    await super.setup();
    mountGame(this, {
      css: CSS, check: false,
      html: `<div class="gm rv"><div class="gm-head"><h2 class="rv-h"></h2>
        <p class="sub">Made-up numbers. Each year, choose what to do with the profit.</p></div>
        <div class="rv-main">
          <div class="rv-card rv-side"><div class="rv-fig">${firmFig()}</div><div class="rv-sidetext"><div class="rv-pips"></div>
            <p class="rv-note">Each year, trade money earns ${RS}20 for every ${RS}100.</p></div></div>
          <div class="rv-card rv-board"></div>
          <div class="rv-card rv-res" aria-live="polite"></div>
        </div></div>`,
    });
    // One Quill only: mini-game@1 draws him in its verdict strip, so the frame's corner Quill goes (never on the board).
    this.quill?.destroy?.(); this.quill = null; this._scaleWrap?.classList.remove('gm-quill');
    this.draw();
  }

  // A fresh try from year 1 (the shuffled button order and the last try stay).
  reset() {
    this.year = 0;
    this.trade = START;
    this.given = 0;
    this.picks = [];
    this.profits = [];
    this.prev = { t: START, g: 0 };   // where the bars grow from
    this.phase = 'pick';              // pick | after (years 1-2, before Next year) | end
    this.fresh = false;
  }

  portrait() { return !!(this.root?.closest?.('.sim-dom-root--portrait') || this.root?.classList?.contains('sim-dom-root--portrait')); }

  draw() {
    const q = (s) => this.root?.querySelector(s);
    if (!q('.rv-board')) return;
    const yr = Math.min(this.year, YEARS - 1);
    q('.rv-h').textContent = this.won ? 'Both goals met' : this.phase === 'end' ? 'Three years done' : `Year ${yr + 1} of 3${this.portrait() ? '' : ': what to do with the profit?'}`;
    q('.gm.rv').dataset.ph = this.won ? 'won' : this.phase;
    q('.rv-pips').innerHTML = Array.from({ length: YEARS }, (_, i) => {
      const s = i < this.picks.length ? 'done' : i === this.year && this.phase === 'pick' ? 'now' : '';
      return `<span class="rv-pip" data-s="${s}" aria-label="year ${i + 1}${s === 'done' ? ': done' : ''}"></span>`;
    }).join('');
    const board = q('.rv-board');
    board.classList.toggle('rv-anim', this.fresh);
    board.innerHTML = this.boardHtml();
    board.querySelectorAll('.rv-b').forEach((b) => onTap(b, () => this.choose(b.dataset.k)));
    const res = q('.rv-res');
    res.classList.toggle('rv-anim', this.fresh);
    res.innerHTML = this.resultHtml();
    const go = q('.rv-go');
    if (go) onTap(go, () => (this.phase === 'after' ? this.nextYear() : this.retry()));
    this.fresh = false;
    this.prev = { t: this.trade, g: this.given };
    this.relayout?.();
  }

  boardHtml() {
    const pick = this.phase === 'pick';
    const shown = pick ? this.year : this.picks.length - 1;       // the profit on show: this year's, or the one just used
    const base = pick ? this.trade : this.tradeBefore(shown);
    const p = pick ? profitOn(this.trade) : this.profits[shown];
    const bar = (label, icons, v, v0, max, goal, col) => {
      const met = v >= goal;
      return `<p class="rv-blab">${icons}<span>${label}</span><em>${money(v)}</em></p>
        <div class="rv-track" aria-hidden="true"><i class="rv-fill" style="--w:${pct(v, max)}%;--w0:${pct(v0, max)}%;background:${col}"></i>
        <i class="rv-goal" style="left:${pct(goal, max)}%"></i></div>
        <p class="rv-gl"><small${met ? ' data-s="met"' : ''} style="right:${f1(100 - pct(goal, max))}%">${met ? '\u2713 ' : ''}goal ${money(goal)}</small></p>`;
    };
    const btns = this.order.map((c) => `<button type="button" class="tap btn rv-b" data-k="${c.key}"${pick ? '' : ' aria-disabled="true"'}>${c.label}</button>`).join('');
    return `<p class="rv-profit">${iconSvg('coin', 2)}<b>Year ${shown + 1} profit</b><em>${money(p)}</em><span>${RS}20 for every ${RS}100 of ${money(base)}</span></p>
      <div class="rv-bars">
        ${bar('Trade money', iconSvg('boat', 1), this.trade, this.prev.t, MAX_T, GOAL_T, C_T)}
        ${bar('Given', iconSvg('lamp', 3) + iconSvg('school', 3) + iconSvg('family', 3), this.given, this.prev.g, MAX_G, GOAL_G, C_G)}
      </div>
      ${pick ? `<div class="rv-btns">${btns}</div>` : ''}`;
  }

  tradeBefore(i) { let t = START; for (let k = 0; k < i; k++) { const p = this.profits[k], c = this.picks[k]; if (c === 'T') t += p; else if (c === 'H') t += p / 2; } return t; }

  histHtml() {
    return `<ul class="rv-hist">${this.picks.map((k, i) => {
      const c = CHOICES.find((x) => x.key === k), p = this.profits[i];
      return `<li><span>Year ${i + 1}: ${c.short}</span><b>${money(p)}</b></li>`;
    }).join('')}</ul>`;
  }

  resultHtml() {
    if (this.won) {
      return `<p class="rv-eq">Your three years</p>${this.histHtml()}
        <p class="rv-say rv-pop" data-tone="good">Trade money ${money(this.trade)}, given ${money(this.given)}. Money put back into trade early earned more profit later, so there was more to give.</p>`;
    }
    if (this.phase === 'end') {
      const lines = [];
      if (this.trade < GOAL_T) lines.push(`Trade money is ${money(this.trade)}: short of ${money(GOAL_T)}. Put more back into trade early, so it earns more in the years after.`);
      if (this.given < GOAL_G) lines.push(`You gave ${money(this.given)}: short of ${money(GOAL_G)}. Too little given. Give more, once the profit has grown.`);
      return `<p class="rv-eq">Not yet</p>${this.histHtml()}${lines.map((l, k) => `<p class="rv-say rv-pop" data-tone="bad" style="--d:${(k * 0.12).toFixed(2)}s">${l}</p>`).join('')}
        <button type="button" class="tap btn rv-go">Try again from year 1</button>`;
    }
    if (this.phase === 'after') {
      const i = this.picks.length - 1, c = CHOICES.find((x) => x.key === this.picks[i]);
      return `<p class="rv-eq">Year ${i + 1}: ${c.short}</p>${this.histHtml()}
        <p class="rv-rule">Trade money is now ${money(this.trade)}, so next year's profit is ${money(profitOn(this.trade))}.</p>
        <button type="button" class="tap btn rv-go">Next year</button>`;
    }
    const lastLine = this.last ? `<p class="rv-rule">Last try: trade money ${money(this.last.t)}, given ${money(this.last.g)}.</p>` : '';
    return `<p class="rv-eq">${this.picks.length ? 'So far' : 'Choose for year 1'}</p>${this.picks.length ? this.histHtml() : ''}
      <p class="rv-rule">Money put back into trade earns profit in the years after.</p>${lastLine}`;
  }

  choose(k) {
    if (this.won || this.phase !== 'pick') return;
    const p = profitOn(this.trade);
    this.picks.push(k);
    this.profits.push(p);
    if (k === 'T') this.trade += p;
    else if (k === 'H') { this.trade += p / 2; this.given += p / 2; }
    else this.given += p;
    this.fresh = true;
    if (this.picks.length < YEARS) { this.phase = 'after'; this.draw(); return; }
    this.phase = 'end';
    this.won = this.trade >= GOAL_T && this.given >= GOAL_G;
    this.draw();
    if (this.won) finishGame(this);
  }

  nextYear() {
    if (this.phase !== 'after') return;
    this.year = this.picks.length;
    this.phase = 'pick';
    this.draw();
  }

  retry() {
    if (this.won || this.phase !== 'end') return;
    this.last = { t: this.trade, g: this.given };
    this.reset();
    this.fresh = true;
    this.draw();
  }

  checkObjective() { return this.won ? { ok: true } : null; }

  resetChallenge() {
    super.resetChallenge?.();
    this.won = false;
    this.last = null;
    this.reset();
    this.draw();
  }

  testState() { return { year: this.year, phase: this.phase, picks: this.picks.join(''), trade: this.trade, given: this.given, profits: this.profits.slice(), won: this.won, order: this.order.map((c) => c.key).join('') }; }
}
