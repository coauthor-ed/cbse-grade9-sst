// FourFeaturesGame - blk-l06-game. The book's four features of a democratic system, eight cases, two
// to a feature. One card at a time: tap the feature it shows best. A wrong tap says why it does not
// fit and the card stays. The cards are in a fixed mixed order.
// Control names: .bin[data-bin]. No Check button: the game ends on the last card.
import { GameBoard, mountGame, onTap, finishGame } from 'simulations/base/kit/GameFrame.js';
import { esc } from 'simulations/base/SimUi.js';

const BINS = [
  { id: 'part', label: 'Promotes participation' }, { id: 'fair', label: 'Ensures fairness' },
  { id: 'limit', label: 'Limits the concentration of power' }, { id: 'peace', label: 'Resolves disagreements peacefully' },
];
const CARDS = [
  { text: 'One-third of Panchayat seats are reserved for women.', key: 'fair', right: 'A rule that gives women seats is about fairness.', wrong: { part: 'It helps women take part, but the rule itself is about a fair share of seats.' } },
  { text: 'Union, State and Local governments share power.', key: 'limit', right: 'Sharing keeps power from collecting in one place.' },
  { text: 'Jethipura holds Special Gram Sabhas and Mahila Sabhas.', key: 'part', right: 'More meetings give more people a part in decisions.' },
  { text: 'Villagers who disagree about a new well talk and then vote.', key: 'peace', right: 'They settle a disagreement by talk and vote.' },
  { text: 'A voter who cannot read can still vote on her own, by symbol.', key: 'fair', right: 'Every citizen can vote in the same way, which is fair.' },
  { text: 'Over 2,800 parties compete for votes.', key: 'peace', right: 'Many viewpoints compete peacefully.' },
  { text: 'South Manubankul promotes women in decision-making.', key: 'part', right: 'Women take part in decisions here.' },
  { text: 'A district council makes rules for its own area.', key: 'limit', right: 'Power does not stay at one centre.' },
];
const MISS = { part: 'This case is not mainly about who takes part.', fair: 'This case is not mainly about equal treatment.', limit: 'This case is not mainly about sharing power.', peace: 'There is no disagreement to settle in this case.' };

const CSS = `
.gm.ff { background: var(--sim-bg-deep); border-radius: 14px; padding: 8px 16px 10px; gap: 8px; }
.ff .kicker { display: none; }
.ff .gm-head h2 { font-size: 22px; }
.ff .board { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1.25fr); gap: 14px; flex: 1; min-height: 0; }
.ff .now { display: flex; flex-direction: column; gap: 8px; min-width: 0; }
.ff .case { display: flex; align-items: center; min-height: 110px; padding: 12px 16px; background: var(--sim-bg-surface); border: var(--sim-border); border-radius: var(--sim-radius-lg);
  box-shadow: 0 var(--sim-lift) 0 var(--sim-stroke); font: 700 20px/1.25 var(--sim-font-display); }
.ff .bins { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; align-content: start; }
.ff .bin { display: flex; flex-direction: column; justify-content: space-between; gap: 6px; min-height: 92px; padding: 8px 12px; text-align: left; font-size: 15px; font-weight: 800; line-height: 1.2;
  background: var(--sim-bg-surface); border: var(--sim-border); border-radius: var(--sim-radius-lg); }
.ff .pips { display: flex; gap: 6px; }
.ff .pip { width: 16px; height: 16px; border-radius: 50%; background: var(--sim-track); }
.ff .pip[data-on="1"] { background: var(--sim-good); }
.ff .why { margin: 0; min-height: 40px; font-size: 15px; font-weight: 700; line-height: 1.3; }
.ff .left { margin: 0; font-size: 15px; font-weight: 700; color: var(--sim-label-muted); }
.sim-dom-root--portrait .gm.ff { padding: 4px 4px 8px; }
.sim-dom-root--portrait .ff .board { grid-template-columns: minmax(0, 1fr); gap: 8px; }
.sim-dom-root--portrait .ff .case { min-height: 96px; }
.sim-dom-root--portrait .ff .bin { min-height: 86px; padding: 6px 10px; }
`;

export class FourFeaturesGame extends GameBoard {
  static ARIA_LABEL = 'A game of eight cases: tap the feature of a democratic system that each case shows best.';
  static OBJECTIVE = { prompt: { en: 'Put each case with the feature of democracy it shows best.' } };

  constructor(container, config) { super(container, config); this._i = 0; this._held = { part: 0, fair: 0, limit: 0, peace: 0 }; this._done = false; }

  async setup() {
    await super.setup();
    mountGame(this, {
      check: false,
      css: CSS,
      html: `<div class="gm ff">
        <div class="gm-head"><p class="kicker">Four features</p><h2>What does this case show best?</h2></div>
        <div class="board">
          <div class="now"><p class="left"></p><div class="case"></div><p class="why" aria-live="polite"></p></div>
          <div class="bins">${BINS.map((b) => `<button type="button" class="tap bin" data-bin="${b.id}"><span>${esc(b.label)}</span><span class="pips"><i class="pip"></i><i class="pip"></i></span></button>`).join('')}</div>
        </div>
      </div>`,
    });
    this.root.querySelectorAll('.bin').forEach((el) => onTap(el, () => this._tap(el.dataset.bin)));
    this._deal();
  }

  _deal() {
    const box = this.root.querySelector('.case');
    if (!box) return;
    box.textContent = this._done ? 'All eight cases are placed.' : CARDS[this._i].text;
    this.root.querySelector('.left').textContent = this._done ? '' : `Case ${this._i + 1} of ${CARDS.length}`;
    this.root.querySelectorAll('.bin').forEach((el) => el.querySelectorAll('.pip').forEach((p, k) => { p.dataset.on = k < this._held[el.dataset.bin] ? '1' : '0'; }));
  }

  _say(t) { const w = this.root.querySelector('.why'); if (w) w.textContent = t; }

  _tap(bin) {
    if (this._done) return;
    const card = CARDS[this._i];
    if (bin !== card.key) { this._say(card.wrong?.[bin] ?? MISS[bin]); this.quill?.setExpression('surprised'); return; }
    this._held[bin] += 1;
    this._say(card.right);
    this._i += 1;
    if (this._i >= CARDS.length) { this._done = true; this._deal(); this.quill?.perform('hop'); finishGame(this); return; }
    this._deal();
  }

  checkObjective() { return this._done ? { ok: true } : null; }

  resetChallenge() { super.resetChallenge(); this._i = 0; this._held = { part: 0, fair: 0, limit: 0, peace: 0 }; this._done = false; this._say(''); this._deal(); }
}
