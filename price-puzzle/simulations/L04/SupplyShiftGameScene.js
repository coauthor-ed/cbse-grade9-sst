/**
 * SupplyShiftGameScene - blk-l04-s08, the lesson's mini-game (beat-less mount, `mini-game@1`).
 *
 * The concept IS the win condition: the deck is the chapter's four determinants of supply (blk-l04-s03
 * alternatives' profitability, s04 the number of sellers, s05 technology, s06 expectations), one event
 * card each, and the only way to clear the deck is to call the direction each determinant's rule gives.
 *   - cheaper kilos (cold vans, drip line)      -> more offered at every price   -> rises
 *   - more sellers OF THIS GOOD                  -> their offers stack on the column -> rises
 *   - a rival crop earning more, asked about this one -> the field pivots away     -> falls
 *   - a boom expected                            -> the stock is held back today   -> falls
 *   - more sellers of ANOTHER good on another lane -> nothing added to this column -> stands
 *
 * What this file will not do, all from the stub:
 *   - it never prints a stored answer. `callFor(ev)` applies the determinant's rule to the card's own
 *     two facts (which good is asked, and which way that determinant leans), so the verdict is the rule.
 *   - it has no timer, no hearts and no penalty. A wrong call stays red on the card and can be changed.
 *   - it names nothing the lesson has not taught: no demand shift, no equilibrium, no government, and
 *     not the own-price law of supply (that is a move along the curve, not a shift).
 */
import { DomSimulation } from 'simulations/base/DomSimulation.js';
import { withChallenge } from 'simulations/base/ChallengeMode.js';
import { esc } from 'simulations/base/SimUi.js';
import { SIM_LOOK_DOM_CSS, noteLineHtml, burst, applyToneInks } from 'simulations/base/kit/SimLookDom.js';
import { iconSvg } from 'simulations/base/kit/SimIcons.js';

// One row per event card. `det` names the chapter's determinant, `rule` states it in short words (shown
// on the card only once the learner has called it, and never with the direction it gives), `ask` the good
// the call is about and `sign` which way that determinant leans (see callFor). Card texts are kept to two
// lines in landscape (about 55 characters at 680px), so the whole deck stays inside the side-panel budget.
const DECK = [
  {
    id: 'tech',
    det: 'technology',
    rule: 'cheaper kilos: more offered at every price',
    icon: 'truck',
    tone: 1,
    sign: 1,
    ask: 'mangoes',
    text: 'Cold vans and a drip line now reach this lane.',
  },
  {
    id: 'stalls',
    det: 'number of sellers',
    rule: 'more sellers of this good add up',
    icon: 'shop',
    tone: 2,
    sign: 1,
    onThisLane: true,
    ask: 'mangoes',
    text: 'Three new stalls open here. Each sells mangoes.',
  },
  {
    id: 'pivot',
    det: 'related goods',
    rule: 'this good follows its rival\u2019s profit',
    icon: 'scales',
    tone: 3,
    sign: -1,
    ask: 'wheat',
    text: 'Wheat\u2019s price has crashed. Chickpeas fetch a high price.',
  },
  {
    id: 'boom',
    det: 'expectations',
    rule: 'boom expected: the stock waits',
    icon: 'clock',
    tone: 4,
    sign: 1,
    ask: 'his stock today',
    text: 'A wholesaler hears a boom is coming next season.',
  },
  {
    id: 'otherlane',
    det: 'number of sellers',
    rule: 'more sellers of this good add up',
    icon: 'shop',
    tone: 5,
    sign: 1,
    onThisLane: false,
    ask: 'mangoes',
    text: 'Three new stalls open next street. None sells mangoes.',
  },
];

// The three calls, in the order a card shows them: the directions the determinant rules can give.
const CALLS = [
  { id: 'up', mark: '\u2191', label: 'rises' },
  { id: 'down', mark: '\u2193', label: 'falls' },
  { id: 'flat', mark: '\u2192', label: 'stands' },
];

// What one determinant's rule gives, applied to the card's own facts. This is the win condition.
function callFor(ev) {
  switch (ev.det) {
    // Cost per kilo fell: every column of the offer rises, dearer prices included.
    case 'technology':
      return 'up';
    // Market supply sums THIS good's sellers: `ask` is the good the card is about, and it is this lane's
    // good on cards 2 and 5, the other lane's on none. More sellers of the asked good add to its column.
    case 'number of sellers':
      return ev.onThisLane ? (ev.sign > 0 ? 'up' : 'down') : 'flat';
    // One good's supply follows how profitable its alternative is; the asked good is on the losing side.
    case 'related goods':
      return ev.sign > 0 ? 'up' : 'down';
    // Expecting a rise: hold back today, so today's supply falls. Expecting a crash would do the reverse.
    case 'expectations':
      return 'down';
    default:
      return 'flat';
  }
}

const CSS = SIM_LOOK_DOM_CSS + `
.ssg-root { display: flex; flex-direction: column; gap: var(--sim-space-2); width: 100%; box-sizing: border-box; }
.ssg-head { display: flex; align-items: center; justify-content: space-between; gap: var(--sim-space-2); flex-wrap: wrap; }

.ssg-deck { display: flex; flex-direction: column; gap: var(--sim-space-2); }

/* One event per row: icon, the event and the good it is about, then the three calls on the right. */
.ssg-card { display: grid; grid-template-columns: 34px minmax(0, 1fr) 264px; gap: 4px var(--sim-space-2);
  align-items: center; padding: var(--sim-space-2) var(--sim-space-3); box-sizing: border-box;
  border: 2px solid var(--sim-stroke);
  transition: border-color 0.25s ease, background-color 0.25s ease; }
.ssg-card.is-right { border-color: var(--sim-good); background: color-mix(in oklab, var(--sim-good) 12%, var(--sim-bg-surface)); }
.ssg-card.is-wrong { border-color: var(--sim-bad); background: color-mix(in oklab, var(--sim-bad) 12%, var(--sim-bg-surface)); }

.ssg-icon { grid-column: 1; grid-row: 1; width: 34px; height: 34px; }
.ssg-body { grid-column: 2; grid-row: 1; min-width: 0; }
.ssg-text { margin: 0; font: 500 var(--sim-text-md)/1.25 var(--sim-font); color: var(--sim-label); }
.ssg-calls { grid-column: 3; grid-row: 1; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 6px; }

/* The rule line spans the whole row - the good being asked about, then the determinant's rule - so its
   words stay on one line in landscape; it keeps its height whatever the state, so no call resizes. */
.ssg-rule { grid-column: 1 / -1; grid-row: 2; margin: 2px 0 0; min-height: 1.4em; display: flex;
  align-items: baseline; flex-wrap: wrap; gap: 0 8px;
  font: 800 var(--sim-text-sm)/1.3 var(--sim-font); color: var(--sim-label-muted); }
.ssg-ask { color: var(--sim-accent); }
.ssg-sep { color: var(--sim-label-muted); }
.ssg-rule b { color: var(--sim-label); }
.ssg-rule__wait { color: var(--sim-label-muted); }
.ssg-card.is-right .ssg-rule span:not(.ssg-ask):not(.ssg-sep) { color: var(--sim-good); }
.ssg-card.is-wrong .ssg-rule span:not(.ssg-ask):not(.ssg-sep) { color: var(--sim-bad); }

.ssg-call { display: flex; align-items: center; justify-content: center; gap: 4px; min-height: 40px;
  box-sizing: border-box; padding: 2px 3px; cursor: pointer; overflow: hidden; white-space: nowrap;
  font: 800 var(--sim-text-sm)/1.1 var(--sim-font); color: var(--sim-label);
  background: var(--sim-bg-surface); border: 2px solid var(--sim-stroke); border-radius: var(--sim-radius-sm); }
.ssg-call:hover { border-color: var(--sim-accent); }
.ssg-call:focus-visible { outline: 3px solid var(--sim-accent); outline-offset: 1px; }
.ssg-mark { font-size: var(--sim-text-lg); line-height: 1; }
.ssg-call.is-picked { border-color: var(--sim-accent); background: color-mix(in oklab, var(--sim-accent) 20%, var(--sim-bg-surface)); }
.ssg-card.is-right .ssg-call.is-picked { border-color: var(--sim-good); background: color-mix(in oklab, var(--sim-good) 24%, var(--sim-bg-surface)); }
.ssg-card.is-wrong .ssg-call.is-picked { border-color: var(--sim-bad); background: color-mix(in oklab, var(--sim-bad) 24%, var(--sim-bg-surface)); animation: ssg-shake 0.35s ease both; }
@keyframes ssg-shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-4px); } 75% { transform: translateX(4px); } }
.ssg-card.is-right .ssg-call.is-picked .ssg-mark { animation: ssg-pop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both; }
@keyframes ssg-pop { from { transform: scale(0.7); } to { transform: scale(1); } }

.ssg-status { margin: 0; min-height: 1.3em; font: 800 var(--sim-text-md)/1.3 var(--sim-font);
  color: var(--sim-label-muted); }
.ssg-status.is-right { color: var(--sim-good); }
.ssg-status.is-wrong { color: var(--sim-bad); }

/* portrait: the calls drop under the event, one card per row */
.sim-dom-root--portrait .ssg-card { grid-template-columns: 34px minmax(0, 1fr); row-gap: var(--sim-space-1); }
.sim-dom-root--portrait .ssg-calls { grid-column: 1 / -1; grid-row: 3; }
.sim-dom-root--portrait .ssg-rule { grid-row: 4; min-height: 2.6em; }
.sim-dom-root--portrait .ssg-call { min-height: 44px; font-size: var(--sim-text-md); }
`;

export class SupplyShiftGameScene extends withChallenge(DomSimulation) {
  static WIDTH = 680;
  static HEIGHT = 600;                    // sim-layout: 596px of content with the worst call state
  static PORTRAIT_WIDTH = 380;
  static PORTRAIT_HEIGHT = 1090;          // sim-layout: 1077px with the worst call state
  static ARIA_LABEL =
    'A deck of five market-event cards, each with three call buttons: supply rises, supply falls, supply '
    + 'stands. Cold-storage vans on this lane, three new mango stalls, a field pivoting from crashed wheat to '
    + 'dear chickpeas, a wholesaler hearing a boom, and three new stalls on another lane. The learner calls the '
    + 'direction for the good named on each card, and the card restates that determinant\'s rule once it is '
    + 'called. The deck is solved when all five directions match the determinant rules.';
  static OBJECTIVE = {
    prompt: {
      en: 'For each market event, call whether supply rises, falls or stands. Win when every call matches the '
        + 'determinant rule.',
    },
  };
  // Each card is judged exactly (one call against one rule), so there is nothing for a tolerance to
  // soften: tolerance 0 means only the whole deck right wins.
  static SCORING = { mode: 'accuracy', tolerance: 0, maxAttempts: Infinity };
  static CONTROLS = [];

  constructor(container, config) {
    super(container, config);
    this._call = DECK.map(() => null);     // null = not called yet, otherwise the call's id
    this._verdict = DECK.map(() => null);  // null = not judged, true = right, false = wrong
    this._msg = null;                      // { text, tone } for the status line
    this._burstT = null;                   // the confetti handle, dropped on destroy
    this._celebrated = false;
  }

  /* ------------------------------------------------------------------ mount */

  async setup() {
    await super.setup();

    this.render({
      css: CSS,
      rootClass: 'sl-backdrop',
      html: `
        <div class="ssg-root">
          <div class="ssg-head">
            <span class="sim-tag sim-tag--accent">call the push</span>
            <span class="sim-tag" data-progress role="status" aria-live="polite">0 of 5 cards right</span>
          </div>
          <div class="ssg-deck" data-deck role="group" aria-label="the five event cards, each with three calls"></div>
          <p class="ssg-status" data-status></p>
          ${noteLineHtml([
            { text: 'every card is one of the chapter\u2019s four determinants of supply.' },
          ])}
        </div>`,
    });

    applyToneInks(this.root);

    this._deck = this.root?.querySelector?.('[data-deck]');
    this._status = this.root?.querySelector?.('[data-status]');
    this._progress = this.root?.querySelector?.('[data-progress]');

    this._deck?.addEventListener?.('click', (e) => {
      const btn = e.target?.closest?.('.ssg-call');
      const card = btn?.closest?.('[data-card]');
      if (!btn || card == null) return;
      this._say(Number(card.dataset.card), btn.dataset.call);
    });

    this._paintDeck();
    this._paintStatus();
  }

  destroy() {
    clearTimeout(this._burstT);
    super.destroy();
  }

  /* ------------------------------------------------------------------ the rule, applied */

  /** One call, judged by the card's own determinant rule. Retries are free and nothing is locked. */
  _say(i, callId) {
    if (i == null || !DECK[i]) return;
    const ev = DECK[i];
    const right = callId === callFor(ev);
    const was = this._verdict[i];
    this._call[i] = callId;
    this._verdict[i] = right;
    this._msg = right ? null : this._wrongMsg(ev, callId);
    if (this._verdict[i] !== was) {
      const btn = this._deck?.querySelector?.(`[data-card="${i}"] .ssg-call[data-call="${callId}"]`);
      this._restart(btn);
    }
    this._paintDeck();
    this._paintStatus();
    this._score();
  }

  /** The stub's reading: the count of cards whose call is right, target the deck size. */
  checkObjective() {
    if (this._call.every((c) => c == null)) return null;
    return { value: this._verdict.filter((v) => v === true).length, target: DECK.length };
  }

  /** The cards are judged from the rules, so a changed call changes the verdict with it. */
  _cardsRight() {
    return this._call.filter((c, i) => c != null && c === callFor(DECK[i])).length;
  }

  /* ------------------------------------------------------------------ the paint */

  _paintDeck() {
    if (!this._deck) return;
    const right = this._cardsRight();
    this._deck.innerHTML = DECK.map((ev, i) => this._cardHtml(ev, i)).join('');
    if (this._progress) this._progress.textContent = `${right} of ${DECK.length} cards right`;
    this._deck.dataset.right = String(right);
  }

  _cardHtml(ev, i) {
    const picked = this._call[i];
    const verdict = this._verdict[i];
    const cls = ['sim-card', 'ssg-card'];
    if (verdict === true) cls.push('is-right');
    if (verdict === false) cls.push('is-wrong');
    const calls = CALLS.map((c) => {
      const bcls = ['ssg-call'];
      if (picked === c.id) bcls.push('is-picked');
      return `<button type="button" class="${bcls.join(' ')}" data-call="${c.id}"`
        + ` aria-label="${esc(ev.ask)}: call supply ${c.label}">`
        + `<span class="ssg-mark" aria-hidden="true">${c.mark}</span><span>${c.label}</span></button>`;
    }).join('');
    return `<div class="${cls.join(' ')}" data-card="${i}">`
      + `${iconSvg(ev.icon, ev.tone)}`
      + `<div class="ssg-body"><p class="ssg-text">${esc(ev.text)}</p></div>`
      + `<div class="ssg-calls">${calls}</div>`
      + `<p class="ssg-rule"><span class="ssg-ask">supply of: ${esc(ev.ask)}</span>`
      + `<span class="ssg-sep" aria-hidden="true">\u00b7</span>`
      + `${this._ruleHtml(ev, verdict)}</p>`
      + `</div>`;
  }

  /** Uncalled: a nudge to act. Judged: the determinant's name and its rule, never the direction. */
  _ruleHtml(ev, verdict) {
    if (verdict === null) return '<span class="ssg-rule__wait">call it</span>';
    return `<span><b>${esc(ev.det)}</b>: ${esc(ev.rule)}</span>`;
  }

  /** A wrong call: the rule that settles it is on the card, in red; the status line only points there. */
  _wrongMsg(ev, callId) {
    const made = CALLS.find((c) => c.id === callId)?.label;
    return { text: `${made} \u2014 not this one; the ${ev.det} rule is on the card`, tone: 'wrong' };
  }

  _paintStatus() {
    if (!this._status) return;
    const right = this._cardsRight();
    const called = this._call.filter((c) => c != null).length;
    let m;
    if (right === DECK.length) m = { text: 'every card matches its determinant rule', tone: 'right' };
    else if (this._msg) m = this._msg;
    else if (called === 0) m = { text: 'one call per card \u2014 no timer', tone: '' };
    else m = { text: `${right} of ${DECK.length} cards right`, tone: right ? 'right' : '' };
    this._status.textContent = m.text;
    this._status.classList.toggle('is-right', m.tone === 'right');
    this._status.classList.toggle('is-wrong', m.tone === 'wrong');
  }

  /** Restart a one-shot animation on the element whose state has just changed. */
  _restart(el) {
    if (!el) return;
    el.style.animation = 'none';
    void el.offsetWidth;
    el.style.animation = '';
  }

  /* ------------------------------------------------------------------ the verdict */

  /** Hand the deck to the challenge wrapper, and let it decide when it is solved. */
  _score() {
    if (!this.checkObjective()) return;
    const res = this.evaluate();
    if (res.solved && !this._celebrated) {
      this._celebrated = true;
      // The confetti lands over the deck a beat after the last card turns green.
      this._burstT = setTimeout(() => burst(this._deck), 240);
    } else if (!res.solved) {
      this._celebrated = false;
    }
  }
}