// BhukampaScene - Varahamihira's account, sorted two ways: what he noted and how he explained it. One card at a
// time, two choices, a wrong tap says why. From the second beat the sort stands finished, so the figure matches
// the sentence on a cold start. No uppercase styling anywhere: capitalised diacritics broke on the old board.
import { GameBoard, mountGame, finishGame } from 'simulations/base/kit/GameFrame.js';
import { esc } from 'simulations/base/SimUi.js';

const CARDS = [
  { t: 'Agni (fire)', k: 'why' }, { t: 'Changes in wind', k: 'noted' }, { t: 'Planetary alignments', k: 'noted' },
  { t: 'Varu\u1e47a (water)', k: 'why' }, { t: 'Animal behaviour', k: 'noted' }, { t: 'V\u0101yu (wind)', k: 'why' },
  { t: 'Changes in rain', k: 'noted' }, { t: 'Indra (heaven or thunder)', k: 'why' }, { t: 'Changes in clouds', k: 'noted' },
];
const BINS = { noted: 'What he noted', why: 'How he explained it' };
const CSS = `
.gm.bk { background: var(--sim-bg-deep); border-radius: 14px; }
.bk .kicker { text-transform: none; letter-spacing: 0; }
.bk .card { font-family: var(--sim-font); font-size: 21px; font-weight: 800; text-align: center; padding: 10px; color: var(--sim-label);
  background: var(--sim-bg-surface); border: var(--sim-border); border-radius: var(--sim-radius-lg); margin: 0 0 8px; }
.bk .pool { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
.bk .pool .tap { font-family: var(--sim-font); font-size: 16px; font-weight: 800; padding: 4px 8px; }
.bk .why { margin: 6px 0; font-size: 15px; line-height: 1.3; min-height: 20px; color: var(--sim-bad); font-weight: 700; }
.bk .piles { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
.bk .pile { background: var(--sim-bg-surface); border: var(--sim-border); border-radius: var(--sim-radius-md); padding: 6px 10px; min-height: 44px; }
.bk .pile b { display: block; font-family: var(--sim-font); font-size: 16px; font-weight: 800; color: var(--sim-label); margin-bottom: 2px; }
.bk .pile span { display: block; font-family: var(--sim-font); font-size: 15px; font-weight: 700; color: var(--sim-label); line-height: 1.3; }
.sim-dom-root:not(.sim-dom-root--portrait) .bk:has(#bk-side:empty) .pile { padding: 12px 18px; }
.sim-dom-root:not(.sim-dom-root--portrait) .bk:has(#bk-side:empty) .pile b { font-size: 24px; margin-bottom: 8px; }
.sim-dom-root:not(.sim-dom-root--portrait) .bk:has(#bk-side:empty) .pile span { font-size: 22px; line-height: 1.45; }
.sim-dom-root--portrait .bk .piles { grid-template-columns: minmax(0, 1fr); }
.sim-dom-root--portrait .bk .card { margin-right: 58px; font-size: 19px; }
`;

export class BhukampaScene extends GameBoard {
  static OBJECTIVE = { prompt: { en: 'Sort each card by what he noted and how he explained it.' } };
  static ARIA_LABEL = 'Sort the cards: changes in wind, rain, clouds, animal behaviour and planetary alignments are what Varahamihira noted. Vayu, Agni, Indra and Varuna are how he explained earthquakes.';
  static BEAT_STEP_MAP = [[{ idx: 0 }], [{ idx: 1 }], [{ idx: 2 }]];

  async setup() {
    await super.setup();
    this._reset();
    mountGame(this, {
      css: CSS, check: false,
      html: '<div class="gm bk"><div class="gm-head"><p class="kicker">In the B\u1e5bihatsa\u1e41hit\u0101</p><h2>Noted, or explained?</h2></div><div id="bk-side"></div><div class="piles" id="bk-piles"></div></div>',
    });
    this.root.querySelector('#bk-side')?.addEventListener('click', (e) => this._pick(e));
    this._draw();
  }
  _reset() { this._i = 0; this._msg = ''; this._beat = this._beat ?? 0; }
  resetChallenge() { super.resetChallenge(); this._beat = 0; this._reset(); this._draw?.(); }

  onStep(step) { this._beat = step; this._draw?.(); }

  _pick(e) {
    const b = e.target.closest?.('[data-pick]');
    if (!b) return;
    const card = CARDS[this._i];
    if (b.dataset.pick !== card.k) { const w = 'The four names are forces he named. The changes are things he noted.'; this._msg = this._msg === w ? 'Now tap the other pile for this card.' : w; this._draw(); return; }
    this._i += 1; this._msg = '';
    this._draw();
    if (this._i >= CARDS.length) { this.quill?.setExpression?.('happy'); finishGame(this); }
  }

  _draw() {
    const side = this.root?.querySelector?.('#bk-side');
    if (!side) return;
    const n = this._beat >= 1 ? CARDS.length : this._i;
    side.innerHTML = n >= CARDS.length ? '' : `<p class="card">${esc(CARDS[n].t)}</p><div class="pool">${Object.entries(BINS).map(([k, l]) => `<button type="button" class="tap btn" data-pick="${k}">${esc(l)}</button>`).join('')}</div><p class="why" aria-live="polite">${esc(this._msg)}</p>`;
    this.root.querySelector('#bk-piles').innerHTML = Object.entries(BINS).map(([k, l]) => `<div class="pile"><b>${esc(l)}</b>${CARDS.slice(0, n).filter((c) => c.k === k).map((c) => `<span>${esc(c.t)}</span>`).join('')}</div>`).join('');
  }

  checkObjective() {
    if (this._i < CARDS.length) return null;
    this.quill?.perform?.('hop');
    return { ok: true };
  }
}
