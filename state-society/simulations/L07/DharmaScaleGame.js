// DharmaScaleGame - blk-l07-s05. Six situations; tap the action that fits the epics' ideal of a
// good ruler: one who works for the welfare of all beings, and treats no group as less.
// A wrong choice shows why and stays. Class and file name kept for the recipes.
// Control names: .opt[data-i].
import { GameBoard, mountGame, onTap, finishGame } from 'simulations/base/kit/GameFrame.js';
import { esc } from 'simulations/base/SimUi.js';

const ROUNDS = [
  { title: 'A dry year', body: 'The rains have failed. The tank serves rich and poor farmers alike. What should the ruler do?',
    opts: [['Repair it for those who pay him most.', 'This helps a few, and the ideal is the welfare of all.'], ['See that it serves all the farmers.', ''], ['Leave it, since it is only a small tank.', 'This leaves people without water, so it does not work for their welfare.']], key: 1, why: 'The good ruler works for the welfare of all beings.' },
  { title: 'A case to judge', body: 'A rich merchant and a poor farmer come to the ruler with a dispute. What should he do?',
    opts: [['Decide for the merchant, who is rich.', 'Goodness is non-discriminatory, so wealth should not decide the case.'], ['Refuse to hear the farmer.', 'A ruler has a duty to give justice to the people.'], ['Hear both and judge the case fairly.', '']], key: 2, why: 'Administering justice was a duty of a ruler, for the weak as well as the strong.' },
  { title: 'A village election', body: 'A rich man offers gifts so that his name is put forward. His earnings are in doubt. What fits the rule at Uttaramerur?',
    opts: [['Candidates should have honest earnings.', ''], ['Accept him, because he gave gifts.', 'The inscription asks for honest earnings, and gifts do not meet that condition.'], ['Choose whoever is richest.', 'The inscription speaks of earnings and mind, and not of wealth.']], key: 0, why: 'The inscription asks for "honest earnings" and a "pure" mind.' },
  { title: 'A hungry family', body: 'A family of strangers comes to a town, with no food. What fits the ideal?',
    opts: [['Send them away, as they are not local.', 'The ideal speaks of all beings, and not only of local people.'], ['Help them, as they too are people in need.', ''], ['Help them only if they pay.', 'This leaves the poorest with nothing, so it is not for the welfare of all.']], key: 1, why: 'The welfare of all beings includes those who are strangers.' },
  { title: 'Everyday conduct', body: 'A\u015Bhoka\u2019s edicts speak about everyday life. Which act fits his dhamma?',
    opts: [['Showing respect within the family.', ''], ['Using force to settle a small quarrel.', 'His edicts promote non-violence.'], ['Being unkind to those who serve you.', 'His edicts promote compassion.']], key: 0, why: 'His edicts emphasise moral conduct, respect within the family and compassion.' },
  { title: 'A good ruler', body: 'Advice on kingship is found in works such as the N\u012Btis\u0101ra. Which ruler would such advice praise?',
    opts: [['One who lives for his own comfort.', 'Such works link kingship with moral conduct.'], ['One who ignores what his people need.', 'The ideal ruler works for the welfare of all.'], ['One whose conduct in public life is moral.', '']], key: 2, why: 'These works highlight the importance of moral conduct in public life.' },
];

const CSS = `
.gm.dg { background: var(--sim-bg-deep); border-radius: 14px; }
.dg .case { background: var(--sim-bg-surface); border: var(--sim-border); border-radius: var(--sim-radius-lg); padding: 10px 14px; }
.dg .case h3 { margin: 0 0 2px; font: 700 20px/1.2 var(--sim-font-display); }
.dg .case p { margin: 0; font-size: 15px; font-weight: 600; line-height: 1.35; }
.dg .opts { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; }
.dg .opt { background: var(--sim-bg-surface); border: var(--sim-border); border-radius: var(--sim-radius-lg); padding: 8px 12px; font-size: 15px; font-weight: 700; line-height: 1.25; display: flex; align-items: center; }
.dg .opt[data-state="bad"] { border-color: var(--sim-bad); opacity: 0.7; }
.dg .opt[data-state="good"] { border-color: var(--sim-good); background: color-mix(in oklab, var(--sim-good) 14%, var(--sim-bg-surface)); }
.dg .why { min-height: 42px; font-size: 15px; font-weight: 700; line-height: 1.3; margin: 0; }
.dg .next { display: none; min-height: 48px; padding: 8px 18px; align-self: flex-start; background: var(--sim-accent); color: var(--sim-bg-surface); border: 0; border-radius: var(--look-pill); font: 800 15px var(--sim-font); }
.dg .next[data-on="1"] { display: inline-block; }
.dg .dots { display: flex; gap: 6px; }
.dg .dot { width: 14px; height: 14px; border-radius: 50%; background: var(--sim-track); }
.dg .dot[data-on="1"] { background: var(--sim-good); }
.sim-dom-root--portrait .dg .opts { grid-template-columns: minmax(0, 1fr); gap: 8px; }
`;

export class DharmaScaleGame extends GameBoard {
  static ARIA_LABEL = 'A game of six situations: in each, tap the action that works for the welfare of all.';
  static OBJECTIVE = { prompt: { en: 'In each situation, choose the action that works for the welfare of all.' } };

  constructor(container, config) { super(container, config); this._r = 0; this._got = false; this._done = false; }

  async setup() {
    await super.setup();
    mountGame(this, {
      check: false,
      css: CSS,
      html: `<div class="gm dg">
        <div class="gm-head"><p class="kicker">The welfare of all</p><h2>What would a good ruler do?</h2></div>
        <div class="dots">${ROUNDS.map(() => '<span class="dot"></span>').join('')}</div>
        <div class="case"><h3></h3><p></p></div>
        <div class="opts"></div>
        <p class="why" aria-live="polite"></p>
        <button type="button" class="tap next">Next situation</button>
      </div>`,
    });
    const nx = this.root.querySelector('.next');
    if (nx) { onTap(nx, () => this._nextRound()); this._deal(); }
    this.quill?.speak('Read the situation, then tap one action.', 5000);
  }

  _deal() {
    const r = ROUNDS[this._r], root = this.root;
    this._got = false;
    root.querySelector('.case h3').textContent = r.title;
    root.querySelector('.case p').textContent = r.body;
    root.querySelector('.opts').innerHTML = r.opts.map(([t], i) => `<div class="opt tap" role="button" tabindex="0" data-i="${i}">${esc(t)}</div>`).join('');
    root.querySelectorAll('.opt').forEach((el) => onTap(el, () => this._pick(el)));
    root.querySelector('.why').textContent = '';
    root.querySelector('.next').dataset.on = '0';
    root.querySelectorAll('.dot').forEach((d, i) => { d.dataset.on = i < this._r ? '1' : '0'; });
  }

  _pick(el) {
    if (this._got) return;
    const r = ROUNDS[this._r], i = Number(el.dataset.i), why = this.root.querySelector('.why');
    if (i === r.key) {
      this._got = true;
      el.dataset.state = 'good';
      why.textContent = r.why;
      this.root.querySelectorAll('.dot')[this._r].dataset.on = '1';
      const last = this._r === ROUNDS.length - 1;
      if (last) { this._done = true; finishGame(this); this.quill?.perform('hop'); }
      else this.root.querySelector('.next').dataset.on = '1';
    } else { el.dataset.state = 'bad'; why.textContent = r.opts[i][1]; }
  }

  _nextRound() { if (this._got && this._r < ROUNDS.length - 1) { this._r += 1; this._deal(); } }

  checkObjective() { return this._done ? { ok: true } : null; }
}
