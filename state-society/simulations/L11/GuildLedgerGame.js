// GuildLedgerGame - split 3000 kahapanas between two weavers' guilds so the year's interest matches the cave's need.
// Three rounds: the inscription's own split, then two practice targets. Controls: + and - on each guild (500 a tap), Next.
// Control ids for the drive recipe: [data-step="a+"], [data-step="a-"], [data-next]; finishGame after the last round.
import { GameBoard, mountGame, finishGame, onTap } from 'simulations/base/kit/GameFrame.js';
import { burst } from 'simulations/base/kit/SimLookDom.js';

const TOTAL = 3000, STEP = 500, RATE_A = 12, RATE_B = 9;
const ROUNDS = [
  { need: 330, note: 'the inscription\u2019s own year' },
  { need: 300, note: 'a practice target' },
  { need: 345, note: 'a practice target' },
];
const CSS = `
.gm.led { background: var(--sim-bg-deep); border-radius: 14px; }
.led .board { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)) 300px; gap: 12px; align-items: stretch; }
.led .gd { background: var(--sim-bg-surface); border: var(--sim-border); border-radius: var(--sim-radius-lg); padding: 10px 12px; display: flex; flex-direction: column; gap: 6px; text-align: center; }
.led .gd h3 { font: 700 18px/1.2 var(--sim-font-display); margin: 0; }
.led .rate { font-size: 15px; color: var(--sim-label-muted); margin: 0; }
.led .amt { font: 700 34px/1 var(--sim-font-display); margin: 2px 0; font-variant-numeric: tabular-nums; }
.led .earn { font-size: 16px; font-weight: 800; margin: 0; }
.led .row { display: flex; gap: 8px; justify-content: center; }
.led .btn { min-width: 64px; min-height: 48px; font-size: 22px; }
.led .sum { background: var(--sim-bg-surface); border: var(--sim-border); border-radius: var(--sim-radius-lg); padding: 10px 12px; display: flex; flex-direction: column; gap: 6px; justify-content: center; text-align: center; }
.led .big { font: 700 36px/1.1 var(--sim-font-display); margin: 0; font-variant-numeric: tabular-nums; }
.led .big[data-ok="1"] { color: var(--sim-good); }
.led .msg { font-size: 15px; font-weight: 700; margin: 0; min-height: 40px; color: var(--sim-label-muted); }
.led [data-next][hidden] { display: none; }
.led .next { background: var(--sim-accent); color: var(--sim-bg-deep); border: 0; font-size: 16px; }
.sim-dom-root--portrait .led .board { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.sim-dom-root--portrait .led .sum { grid-column: 1 / -1; }
.sim-dom-root--portrait .led .btn { min-width: 56px; }
.sim-dom-root--portrait .led .gm-head { padding-right: 56px; }
`;

const guild = (id, name, rate) => `<div class="gd"><h3>${name}</h3><p class="rate">${rate} for each 100 a year</p><p class="amt" data-amt="${id}">0</p>
<div class="row"><button type="button" class="tap btn" data-step="${id}-" aria-label="Take 500 from ${name}">\u2212</button><button type="button" class="tap btn" data-step="${id}+" aria-label="Add 500 to ${name}">+</button></div>
<p class="earn" data-earn="${id}">0 a year</p></div>`;

export class GuildLedgerGame extends GameBoard {
  static ARIA_LABEL = 'Split 3000 kahapanas between two weavers guilds, one paying 12 and one paying 9 for each hundred a year, until the year\u2019s interest matches the target.';
  static OBJECTIVE = { prompt: { en: 'Split 3000 k\u0101h\u0101pa\u1E47as between two weavers\u2019 guilds so that the year\u2019s interest matches what the cave needs.' } };

  constructor(container, config) {
    super(container, config);
    this.a = 1500;
    this.b = 1500;
    this.round = 0;
    this.done = false;
  }

  async setup() {
    await super.setup();
    mountGame(this, {
      css: CSS, check: false,
      html: `<div class="gm led"><div class="gm-head"><h2>Fill the cave\u2019s year</h2><p class="sub" data-round></p></div>
<div class="board">${guild('a', 'First guild', RATE_A)}${guild('b', 'Second guild', RATE_B)}
<div class="sum"><p class="rate">Interest a year</p><p class="big" data-sum>0</p><p class="rate" data-need></p><p class="msg" data-msg aria-live="polite"></p><button type="button" class="tap btn next" data-next hidden>Next round</button></div></div></div>`,
    });
    this.root.querySelectorAll?.('[data-step]').forEach((el) => onTap(el, () => this._step(el.dataset.step)));
    const nx = this.root.querySelector?.('[data-next]');
    if (nx) onTap(nx, () => this._next());
    this._paint();
    this.quill?.speak('Use + and - to split the money.', 5200);
  }

  get interest() { return (this.a * RATE_A + this.b * RATE_B) / 100; }
  get solvedRound() { return this.interest === ROUNDS[this.round].need; }

  _step(s) {
    if (this.solvedRound && this.round < ROUNDS.length && this._locked) return;
    const d = s[1] === '+' ? STEP : -STEP, key = s[0], other = key === 'a' ? 'b' : 'a';
    if (this[key] + d < 0 || this[other] - d < 0) return;
    this[key] += d;
    this[other] -= d;
    this._paint();
  }

  _next() {
    if (this.round >= ROUNDS.length - 1) return;
    this.round += 1;
    this._locked = false;
    this.a = 1500; this.b = 1500;
    this._paint();
  }

  _paint() {
    const q = (s) => this.root?.querySelector?.(s);
    if (!q('[data-sum]')) return;       // the headless check has no HTML parser
    const r = ROUNDS[this.round], won = this.solvedRound;
    q('[data-round]').textContent = `Round ${this.round + 1} of ${ROUNDS.length}`;
    q('[data-amt="a"]').textContent = String(this.a);
    q('[data-amt="b"]').textContent = String(this.b);
    q('[data-earn="a"]').textContent = `${this.a * RATE_A / 100} a year`;
    q('[data-earn="b"]').textContent = `${this.b * RATE_B / 100} a year`;
    q('[data-sum]').textContent = String(this.interest);
    q('[data-sum]').dataset.ok = won ? '1' : '0';
    q('[data-need]').textContent = `The cave needs ${r.need} (${r.note})`;
    const gap = r.need - this.interest;
    q('[data-msg]').textContent = won ? 'That matches the year\u2019s need.' : gap > 0 ? 'Too little: move money to the guild that pays more.' : 'Too much: move money to the guild that pays less.';
    q('[data-next]').hidden = !(won && this.round < ROUNDS.length - 1);
    if (won && !this._locked) {
      this._locked = true;
      burst(q('[data-sum]'));
      this.quill?.perform?.('hop');
      if (this.round === ROUNDS.length - 1 && !this.done) { this.done = true; finishGame(this); }
    }
  }

  checkObjective() { return this.done ? { ok: true } : null; }
}
