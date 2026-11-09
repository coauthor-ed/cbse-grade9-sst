/**
 * WeighTheHeartGame - mini-game for les-11 (blk-l11-game). Four lives. Using what Egyptians believed, the learner predicts for
 * each one: would the heart pass the weighing or fail it? Check marks each life with the reason. Base chain: DomSimulation via
 * GameBoard. The test is what Egyptians believed, not what is true.
 */
import { GameBoard, mountGame, onTap } from 'simulations/base/kit/GameFrame.js';

const LIVES = [
  { id: 'a', text: 'Gave fair measure at the market, even when no one was checking.', pass: true, why: 'Honest when no one was watching: a light heart.' },
  { id: 'b', text: "Stole grain from a neighbour's store in a bad year.", pass: false, why: 'A hard year does not remove the wrong: a heavy heart.' },
  { id: 'c', text: 'Cared for an old parent until the end.', pass: true, why: 'Care for family counts in the heart\'s record.' },
  { id: 'd', text: "Lied to an official to take a poorer family's land.", pass: false, why: 'A lie that hurt others: a heavy heart.' },
];

const CSS = `
.gm.wth { background: var(--sim-bg-deep); border-radius: 14px; }
.wth .wth-rule { margin: 0 0 6px; font-size: 16px; font-weight: 800; color: var(--sim-label); }
.wth .wth-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; align-content: start; flex: 0 0 auto; }
.wth .wth-card { display: grid; grid-template-columns: minmax(0, 1fr) 176px; align-items: center; gap: 8px; padding: 8px 10px; border-radius: var(--sim-radius-md); background: var(--sim-bg-surface); border: calc(2px * var(--look-rim)) solid var(--sim-stroke); }
.wth .wth-card[data-res="ok"] { border-color: var(--sim-good); }
.wth .wth-card[data-res="no"] { border-color: var(--sim-bad); }
.wth .wth-card p { margin: 0; font-size: 15px; font-weight: 700; line-height: 1.2; color: var(--sim-label); }
.wth .wth-card .wth-why { grid-column: 1 / -1; grid-row: 2; font-size: 15px; color: var(--sim-label-muted); }
.wth .wth-why:empty { display: none; }
.wth .wth-opts { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 8px; }
.wth .wth-o { appearance: none; min-height: 46px; cursor: pointer; font: 600 17px/1 var(--sim-font-display, var(--sim-font)); color: var(--sim-label); background: var(--sim-bg-deep); border: calc(2px * var(--look-rim)) solid var(--sim-stroke); border-radius: var(--sim-radius-md); box-shadow: 0 calc(3px * var(--look-lip)) 0 var(--sim-stroke); }
.wth .wth-o[aria-pressed="true"] { background: var(--sim-accent); border-color: var(--sim-accent); color: var(--sim-ink-on-accent, var(--sim-bg-deep)); box-shadow: 0 calc(1px * var(--look-lip)) 0 var(--sim-accent); transform: translateY(2px); }
.wth .wth-foot { margin-top: 8px; }
.sim-dom-root--portrait .wth .wth-grid { grid-template-columns: minmax(0, 1fr); }
.sim-dom-root--portrait .wth .wth-card { grid-template-columns: minmax(0, 1fr); }
`;

export class WeighTheHeartGame extends GameBoard {
  static ARIA_LABEL = 'Four lives. For each, predict whether the heart would pass or fail the weighing, using what Egyptians believed.';
  static OBJECTIVE = { prompt: { en: 'Four lives. Using what Egyptians believed, predict: would each heart pass the weighing, or fail it?' } };

  picks = {};

  async setup() {
    await super.setup();
    const cards = LIVES.map((l) => `<div class="wth-card" data-id="${l.id}"><p>${l.text}</p><p class="wth-why"></p><div class="wth-opts"><button type="button" class="wth-o" data-v="pass" aria-pressed="false">Passes</button><button type="button" class="wth-o" data-v="fail" aria-pressed="false">Fails</button></div></div>`).join('');
    mountGame(this, { css: CSS, check: { label: 'Check my answer', in: '.wth-foot' }, html: `<div class="gm wth">
      <div class="gm-head"><p class="kicker">What Egyptians believed</p><h2>Weigh the <b>heart</b></h2></div>
      <p class="wth-rule">A heart heavy with wrongdoing sinks. A heart in balance passes.</p>
      <div class="wth-grid">${cards}</div><div class="wth-foot"></div></div>` });
    for (const card of this.root.querySelectorAll('.wth-card')) {
      const id = card.dataset.id;
      for (const b of card.querySelectorAll('.wth-o')) onTap(b, () => { this.picks[id] = b.dataset.v; for (const o of card.querySelectorAll('.wth-o')) o.setAttribute('aria-pressed', String(o === b)); });
    }
  }

  checkObjective() {
    if (LIVES.some((l) => !this.picks[l.id])) return { ok: false, hint: 'Choose Passes or Fails for all four lives first.' };
    let wrong = 0;
    for (const l of LIVES) {
      const ok = (this.picks[l.id] === 'pass') === l.pass, card = this.root.querySelector(`.wth-card[data-id="${l.id}"]`);
      if (!ok) wrong += 1;
      if (card) { card.dataset.res = ok ? 'ok' : 'no'; const w = card.querySelector('.wth-why'); if (w) w.textContent = ok ? l.why : ''; }
    }
    return wrong ? { ok: false, hint: `${wrong} of 4 not right. Ask of each life: was it honest and fair to others?` } : { ok: true };
  }
}
