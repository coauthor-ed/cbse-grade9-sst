import { DomSimulation } from 'simulations/base/DomSimulation.js';
import { SIM_LOOK_DOM_CSS, noteLineHtml, burst, applyToneInks } from 'simulations/base/kit/SimLookDom.js';
import { esc, simTag, simRecord } from 'simulations/base/SimUi.js';
import { iconSvg } from 'simulations/base/kit/SimIcons.js';

/**
 * FairnessQuestionScene - the closing hook of L05 (blk-l05-s10).
 *
 * There is no process here and there is no dial. The scene is two panels that
 * stay on screen the whole time - a medicine stall that clears itself, and a
 * queue at the clinic gate that does not move - and the beats move the emphasis
 * between them. The learner taps the courses off the shelf (the chapter's own
 * tally habit), checks the reach of one month's wages against the clearing
 * price, and opens the closing question.
 *
 * Labels only: no number here that the slide does not give, and no answer to
 * the question the beat-2 card asks. That answer is L06.
 *
 * The panel, chip and bar vocabulary (all `fq-` prefixed) is exposed as class
 * statics so L06's `FairnessQuestionScene-referee` can reuse it instead of
 * copying it: `COUNTER_CSS`, `counterHtml(state)`, `queueHtml(state)`,
 * `reachHtml()`, `askHtml(state)`.
 */

// One entry per beat of blk-l05-s10 (verified with scene-info: 3 beats, 3 STEPs).
const BEAT_STEP_MAP = [
  [{ idx: 0, dwellMs: null }],
  [{ idx: 1, dwellMs: null }],
  [{ idx: 2, dwellMs: null }],
];

const PRICE_CHIP = '1 month of wages a course';
const CHILD_WAGE = 'a child at the gate has no wage';
// My count, not the slide's: four courses on the shelf, one child waiting, and
// that one stays one from the first beat to the last.
const COURSES = 4;
const WAITING = 1;

const NOTE = {
  0: "the market's own question, and its own answer: the stall cleared",
  1: 'the course costs a month of wages - the child at the gate has none of it',
  2: 'the market did clear itself - the unfairness sits outside its rule',
};

const RECORD_STEPS = ['Cleared', 'Out of reach', 'The last puzzle'];

// ------------------------------------------------------------------ fragments

// A carton of medicine, drawn flat: a box, a lid and one tape stripe. No cross,
// no emblem - a plain package the learner reads as "one course".
function courseSvg() {
  return `<svg class="fq-good__box" viewBox="0 0 48 40" aria-hidden="true" focusable="false">
    <path class="fq-box__lid" d="M6 12 24 5l18 7v6H6z"></path>
    <path class="fq-box__body" d="M6 18h36v18H6z"></path>
    <path class="fq-box__tape" d="M21 18h6v18h-6z"></path>
  </svg>`;
}

// simField's own markup, with a data hook on the value: both tally rows are
// re-read on every paint, so a stale count can never sit on screen.
function ledgerRow(label, value, key) {
  return `<div class="sim-field"><span class="sim-field__label">${esc(label)}</span>`
    + `<span class="sim-field__value" data-ledger="${key}">${esc(value)}</span></div>`;
}

// The head chip is the stall's verdict, the ledger row below it is the stall's
// own number: that is the chapter's habit (data on one side, the rule's word on
// the other), and it means neither number is printed twice.
function stallChip(sold) {
  return sold >= COURSES ? 'stall cleared' : 'not cleared';
}

export class FairnessQuestionScene extends DomSimulation {
  // -------------------------------------------------------------- the vocabulary
  // Pure fragments and the one stylesheet they need, so a sibling scene can
  // import them (`import { FairnessQuestionScene as V } from ...`) and paint the
  // same two panels under different words.

  static counterHtml(state) {
    const sold = state.sold;
    const cartons = Array.from({ length: COURSES }, (_, i) => {
      const isSold = i < sold;
      return `<button type="button" class="fq-good${isSold ? ' fq-good--sold' : ''}" data-good="${i}" aria-pressed="${isSold ? 'true' : 'false'}" aria-label="${isSold ? 'course sold' : `course ${i + 1} of ${COURSES}, unsold`}"${isSold ? ' disabled' : ''}>
        <span class="fq-good__art" aria-hidden="true">${isSold ? iconSvg('check', 8) : courseSvg()}</span>
        <span class="fq-good__no">${i + 1}</span>
      </button>`;
    }).join('');
    return `<div class="fq-head">
      <span class="fq-head__art" aria-hidden="true">${iconSvg('shop', 3)}</span>
      <span class="fq-head__title">medicine stall</span>
      ${simTag(PRICE_CHIP, { accent: true })}
      <span class="sim-tag fq-sold${sold >= COURSES ? ' fq-sold--done' : ''}" data-sold>${esc(stallChip(sold))}</span>
    </div>
    <div class="fq-body fq-counter" data-counter-body>
      <div class="fq-shelf" data-shelf role="group" aria-label="${COURSES} courses of medicine on the shelf">${cartons}</div>
      <div class="fq-ledger">
        ${ledgerRow('sold at the price', `${sold} of ${COURSES}`, 'sold')}
        ${ledgerRow('still waiting', `${WAITING}`, 'waiting')}
      </div>
      <p class="sim-meta">one course of medicine, priced at one month of wages</p>
    </div>`;
  }

  static queueHtml() {
    return `<div class="fq-head">
      <span class="fq-head__art" aria-hidden="true">${iconSvg('hospital', 5)}</span>
      <span class="fq-head__title">clinic gate</span>
      <span class="sim-tag fq-waiting" data-waiting>${WAITING} waiting</span>
    </div>
    <div class="fq-body fq-queue" data-queue-body>
      <div class="fq-people" role="group" aria-label="One child waiting at the gate">
        <span class="fq-person fq-person--child" aria-hidden="true">${iconSvg('person', 2)}</span>
        <span class="fq-person__label">a child at the gate</span>
      </div>
      <button type="button" class="fq-wage" data-wage aria-pressed="false" aria-label="Check one month's wages against the clearing price">
        <span class="fq-wage__art" aria-hidden="true">${iconSvg('coin', 3)}</span>
        <span class="fq-wage__text">${esc(CHILD_WAGE)}</span>
        <span class="fq-wage__hint">check reach</span>
      </button>
      ${FairnessQuestionScene.reachHtml()}
    </div>`;
  }

  static reachHtml() {
    return `<div class="fq-reach" data-reach hidden>
      <div class="fq-reach__row">
        <span class="fq-reach__label">price</span>
        <span class="fq-reach__track"><span class="fq-reach__bar fq-reach__price"></span></span>
        <span class="sim-tag">1 month</span>
      </div>
      <div class="fq-reach__row">
        <span class="fq-reach__label">wage</span>
        <span class="fq-reach__track"><span class="fq-reach__bar fq-reach__wage"></span></span>
        <span class="sim-tag">0 months</span>
      </div>
      <p class="fq-verdict">${simTag('out of reach', { accent: true })}</p>
    </div>`;
  }

  static askHtml() {
    return `<button type="button" class="fq-ask__q" data-ask aria-pressed="false" aria-label="Open the closing question: who answers back">
      <span class="sim-q fq-ask__mark" aria-hidden="true">?</span>
      <span class="fq-ask__text">who answers back?</span>
    </button>
    <div class="fq-ask__tags" data-ask-tags hidden>
      <span class="sim-tag fq-ask__tag--good" data-ask-stall>stall: cleared</span>
      <span class="sim-tag fq-ask__tag--bad" data-ask-child>child: still waiting</span>
    </div>`;
  }

  static COUNTER_CSS = `
.fq-root { width: 100%; }
.fq-root .sim-record { grid-template-columns: repeat(3, minmax(0, 1fr)); }

/* The two panels: the stall and the gate. Neither one ever leaves; the beats
   fold a panel's body and move the accent, so the contrast stays on screen. */
.fq-main { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: var(--sim-space-3); align-items: stretch; }
.sim-dom-root--portrait .fq-main { grid-template-columns: minmax(0, 1fr); }
.fq-card { gap: var(--sim-space-2); }
.sim-dom-root--portrait .fq-card--queue { order: 1; }

/* A head is the panel's folded summary: it survives every fold, so the stall
   keeps saying "sold 4 of 4" and the gate keeps saying "1 waiting". */
.fq-head { display: flex; align-items: center; flex-wrap: wrap; gap: var(--sim-space-2); }
.fq-head__art { display: grid; place-items: center; width: 26px; height: 26px; flex: none; }
.fq-head__art .sim-icon { width: 26px; height: 26px; }
.fq-head__title { font-size: var(--sim-text-md); font-weight: 800; color: var(--sim-label); }
.fq-sold--done { border-color: var(--sim-good); background: var(--sim-good); color: var(--sim-ink-on-good, var(--sim-bg-deep)); }
.fq-waiting { border-color: var(--sim-warning); color: var(--sim-label); }

/* ---- the shelf: four tappable courses. A sold one is a dashed empty outline,
   so the stall empties instead of going blank. */
.fq-shelf { display: grid; grid-template-columns: repeat(${COURSES}, minmax(0, 1fr)); gap: var(--sim-space-2); }
.fq-good { display: grid; place-items: center; gap: 2px; padding: var(--sim-space-2) var(--sim-space-1);
  border: 2px solid var(--sim-border); border-radius: var(--sim-radius-sm); background: var(--sim-bg-deep);
  color: var(--sim-label); font: inherit; cursor: pointer; box-shadow: 0 var(--sim-lift) 0 var(--sim-stroke); }
.fq-good:hover { border-color: var(--sim-accent); }
.fq-good__art { display: grid; place-items: center; width: 34px; height: 30px; }
.fq-good__art .sim-icon, .fq-good__art .fq-good__box { width: 34px; height: 30px; }
.fq-good__no { font-size: var(--sim-text-sm); font-weight: 800; color: var(--sim-label-muted); }
.fq-good--sold { border-style: dashed; box-shadow: none; opacity: .72; cursor: default; }
.fq-good--sold:hover { border-color: var(--sim-border); }
.fq-good--sold .fq-good__no { visibility: hidden; }
.fq-box__lid { fill: var(--sim-series-8); }
.fq-box__body { fill: color-mix(in oklab, var(--sim-series-8) 38%, var(--sim-bg-deep)); }
.fq-box__tape { fill: color-mix(in oklab, var(--sim-bg-deep) 45%, transparent); }
.fq-ledger { display: grid; gap: var(--sim-space-1); }
.fq-pop { animation: fq-pop .24s ease both; }
@keyframes fq-pop { from { transform: scale(.9); } to { transform: none; } }

/* ---- the gate: one child, and the wage chip that measures the gap */
.fq-queue { gap: var(--sim-space-2); }
.fq-people { display: flex; align-items: center; gap: var(--sim-space-2); }
.fq-person { display: grid; place-items: center; width: 40px; height: 40px; flex: none;
  border-radius: var(--sim-radius-pill); background: color-mix(in oklab, var(--sim-series-2) 26%, var(--sim-bg-deep)); }
.fq-person .sim-icon { width: 30px; height: 30px; }
.fq-person__label { font-size: var(--sim-text-md); font-weight: 800; color: var(--sim-label); }
.fq-wage { display: flex; align-items: center; flex-wrap: wrap; gap: var(--sim-space-2); width: 100%;
  padding: var(--sim-space-2) var(--sim-space-3); border: 2px dashed var(--sim-border); border-radius: var(--sim-radius-md);
  background: var(--sim-bg-deep); color: var(--sim-label); font: inherit; text-align: start; cursor: pointer; }
.fq-wage:hover { border-color: var(--sim-accent); }
.fq-wage[aria-pressed="true"] { border-style: solid; border-color: var(--sim-warning); }
.fq-wage__art { display: grid; place-items: center; width: 24px; height: 24px; flex: none; }
.fq-wage__art .sim-icon { width: 24px; height: 24px; }
.fq-wage__text { font-size: var(--sim-text-sm); font-weight: 700; }
.fq-wage__hint { margin-inline-start: auto; font-size: var(--sim-text-sm); font-weight: 800; color: var(--sim-accent); }

/* ---- the reach check: one track, two bars, both named beside them */
.fq-reach { display: grid; gap: var(--sim-space-2); }
.fq-reach__row { display: grid; grid-template-columns: minmax(0, 0.85fr) minmax(0, 1.7fr) auto;
  gap: var(--sim-space-2); align-items: center; }
.fq-reach__label { font-size: var(--sim-text-sm); font-weight: 700; color: var(--sim-label-muted); }
.fq-reach__track { display: block; height: 16px; border-radius: var(--sim-radius-pill);
  background: color-mix(in oklab, var(--sim-stroke) 34%, var(--sim-bg-deep));
  border: 1px solid color-mix(in oklab, var(--sim-stroke) 55%, transparent); overflow: hidden; }
.fq-reach__bar { display: block; height: 100%; border-radius: var(--sim-radius-pill); }
.fq-reach__price { width: 100%; background: var(--sim-accent); }
.fq-reach__wage { width: 0; background: var(--sim-good); }
.fq-verdict { margin: 0; display: flex; justify-content: center; }

/* ---- the closing question (beat 2): dashed, and left unanswered */
.fq-ask { display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: var(--sim-space-3); min-height: 104px; padding: var(--sim-space-4); }
.fq-ask__q { display: flex; align-items: center; gap: var(--sim-space-2); padding: var(--sim-space-3) var(--sim-space-5);
  border: 2px dashed var(--sim-accent); border-radius: var(--sim-radius-lg); background: var(--sim-bg-deep);
  color: var(--sim-label); font: inherit; cursor: pointer; }
.fq-ask__q:hover { background: color-mix(in oklab, var(--sim-accent) 12%, var(--sim-bg-deep)); }
.fq-ask__mark { font-size: var(--sim-text-2xl); }
.fq-ask__text { font-size: var(--sim-text-xl); font-weight: 800; }
.fq-ask__tags { display: flex; flex-wrap: wrap; justify-content: center; gap: var(--sim-space-2); }
.fq-ask__tag--good { border-color: var(--sim-good); }
.fq-ask__tag--bad { border-color: var(--sim-warning); color: var(--sim-label); }

/* ---- the folds. A panel folds to its head chips and its evidence strip; the
   head chips are the point. Beat 2's two panels hug their heads so the closing
   question gets the frame instead of two empty boxes. */
[data-step="1"] .fq-ledger, [data-step="1"] .fq-counter .sim-meta { display: none; }
[data-step="2"] .fq-counter, [data-step="2"] .fq-queue { display: none; }
[data-step="2"] .fq-main { align-items: start; }
[data-step="0"] .fq-wage { display: none; }
[data-step="0"] .fq-card--queue { background: var(--sim-bg-deep); box-shadow: none; }
[data-step="0"] .fq-people { opacity: .7; }
`;
// sim-lint-ignore token: --sim-ink-on-* is not a stylesheet token; applyToneInks() sets it on the root at mount.

  // ---------------------------------------------------------------- the scene
  static WIDTH = 680;
  static HEIGHT = 470;
  static PORTRAIT_WIDTH = 380;
  static PORTRAIT_HEIGHT = 860;
  static FIT = true;
  static BEAT_STEP_MAP = BEAT_STEP_MAP;
  static ARIA_LABEL = 'A medicine stall whose shelf empties as its four courses are sold, beside a clinic gate where one child still waits; at a clearing price of one month of wages the child has no wage to reach it, and the last beat asks who answers back.';
  static CONTROLS = [];

  constructor(container, config) {
    super(container, config);
    // Everything the learner does lives here, never in the DOM: `_paint()`
    // re-derives every class from these three fields, so a theme refresh or a
    // resumed mount cannot lose a tally.
    this._sold = 0;
    this._reach = false;
    this._askOpen = false;
    this._broke = {};
    this._els = null;
  }

  async setup() {
    await super.setup();
    this.render({
      css: SIM_LOOK_DOM_CSS + FairnessQuestionScene.COUNTER_CSS,
      rootClass: 'fq-root sl-backdrop',
      html: `<div class="sim-stack fq-root">
        <div data-record>${simRecord(RECORD_STEPS, 0, 'The price puzzle')}</div>
        <div class="fq-main">
          <section class="sim-card fq-card fq-card--counter" data-counter aria-label="Medicine stall">
            ${FairnessQuestionScene.counterHtml({ sold: 0 })}
          </section>
          <section class="sim-card fq-card fq-card--queue" data-queue aria-label="Clinic gate">
            ${FairnessQuestionScene.queueHtml()}
          </section>
        </div>
        <section class="sim-card fq-ask" data-ask hidden aria-label="The closing question">
          ${FairnessQuestionScene.askHtml()}
        </section>
        ${noteLineHtml([{ text: NOTE[0] }])}
      </div>`,
    });
    const q = (sel) => this.root?.querySelector?.(sel) ?? null;
    this._els = {
      ask: q('[data-ask]'),
      sold: q('[data-sold]'),
      ledgerSold: q('[data-ledger="sold"]'),
      ledgerWaiting: q('[data-ledger="waiting"]'),
      shelf: q('[data-shelf]'),
      wage: q('[data-wage]'),
      reach: q('[data-reach]'),
      wageHint: q('.fq-wage__hint'),
      wageText: q('.fq-wage__text'),
      askQ: q('.fq-ask__q'),
      askTags: q('[data-ask-tags]'),
      askStall: q('[data-ask-stall]'),
      askChild: q('[data-ask-child]'),
      record: q('[data-record]'),
      note: q('.sl-note-line'),
      goods: Array.from(this.root?.querySelectorAll?.('[data-good]') ?? []),
    };
    applyToneInks(this.root);
    this.root?.addEventListener?.('click', (ev) => {
      const good = ev.target?.closest?.('[data-good]');
      if (good) { this._sell(Number(good.dataset.good)); return; }
      if (ev.target?.closest?.('[data-wage]')) { this._checkReach(); return; }
      if (ev.target?.closest?.('.fq-ask__q')) this._openAsk();
    });
    this._paint();
  }

  // ----------------------------------------------------------------- the beat

  // No beat owns anything to reset: the tally is the learner's and the waiting
  // number never changes, which is the whole point of the scene.
  onStep() {
    const beat = Math.min(2, Math.max(0, this.stepIndex ?? 0));
    if (this._els?.note) this._els.note.textContent = NOTE[beat];
    this._paintRecord(beat);
    this._paint();
    this._maybeBurst();
  }

  refreshTheme() {
    applyToneInks(this.root);
    this._paint();
  }

  destroy() {
    this._els = null;
    super.destroy();
  }

  // ---------------------------------------------------------------- learning

  _sell(i) {
    if (!Number.isInteger(i) || i < this._sold || i >= COURSES) return;
    this._sold = i + 1;
    this.animateFor?.(500);
    this._paint();
    this._maybeBurst();
  }

  _checkReach() {
    this._reach = !this._reach;
    this.animateFor?.(500);
    this._paint();
  }

  _openAsk() {
    this._askOpen = !this._askOpen;
    this.animateFor?.(600);
    this._paint();
    this._maybeBurst();
  }

  // ------------------------------------------------------------------- paint

  // Every element is guarded: a mount that has not rendered (or a harness with
  // no DOM) must rest, not throw.
  _paint() {
    const e = this._els;
    if (!e) return;
    const beat = Math.min(2, Math.max(0, this.stepIndex ?? 0));

    if (e.ask) e.ask.hidden = beat !== 2;

    const cleared = this._sold >= COURSES;
    if (e.sold) {
      e.sold.textContent = stallChip(this._sold);
      e.sold.classList.toggle('fq-sold--done', cleared);
    }
    if (e.ledgerSold) e.ledgerSold.textContent = `${this._sold} of ${COURSES}`;
    if (e.ledgerWaiting) e.ledgerWaiting.textContent = `${WAITING}`;
    e.goods.forEach((el, i) => {
      const sold = i < this._sold;
      el.classList.toggle('fq-good--sold', sold);
      el.setAttribute('aria-pressed', sold ? 'true' : 'false');
      el.setAttribute('aria-label', sold ? 'course sold' : `course ${i + 1} of ${COURSES}, unsold`);
      el.disabled = sold;
      const art = el.querySelector('.fq-good__art');
      if (art && ((sold && art.dataset.state !== 'sold') || (!sold && art.dataset.state === 'sold'))) {
        art.innerHTML = sold ? iconSvg('check', 8) : courseSvg();
        art.dataset.state = sold ? 'sold' : 'unsold';
      }
    });

    if (e.wage) {
      e.wage.setAttribute('aria-pressed', this._reach ? 'true' : 'false');
      e.wage.classList.toggle('fq-wage--on', this._reach);
    }
    if (e.wageText) e.wageText.textContent = this._reach ? 'the price stands where it stands' : CHILD_WAGE;
    if (e.wageHint) e.wageHint.textContent = this._reach ? 'check again' : 'check reach';
    if (e.reach) e.reach.hidden = !this._reach;

    if (e.askTags) e.askTags.hidden = !this._askOpen;
    if (e.askQ) e.askQ.setAttribute('aria-pressed', this._askOpen ? 'true' : 'false');
    if (e.askStall) e.askStall.textContent = cleared ? 'stall: cleared' : `stall: ${this._sold} of ${COURSES} sold`;
    if (e.askChild) e.askChild.textContent = `child: still waiting (${WAITING})`;

    // The tally pops when a course sells, so the count is seen to move.
    const chip = e.sold;
    if (chip) {
      chip.classList.remove('fq-pop');
      if (this._sold > 0) { void chip.offsetWidth; chip.classList.add('fq-pop'); }
    }

    // The reach block and the ask tags add real height under the learner's
    // hands, which no beat change will re-measure for us.
    this.refit?.();
  }

  // simRecord emits no data attribute of its own, so the strip moves by
  // position in the list.
  _paintRecord(beat) {
    const steps = this._els?.record?.querySelectorAll?.('.sim-record__step') ?? [];
    Array.from(steps).forEach((step, i) => {
      if (i === beat) step.setAttribute('aria-current', 'step');
      else step.removeAttribute('aria-current');
    });
  }

  // ------------------------------------------------------------ celebration

  // Two moments, both the concept rather than the tap: the stall has emptied and
  // said so (beat 0), and the closing question is open with both facts showing
  // (beat 2). Beat 1 never bursts - nothing got through there.
  _maybeBurst() {
    const e = this._els;
    const beat = Math.min(2, Math.max(0, this.stepIndex ?? 0));
    if (!e) return;
    if (beat < 2 && this._sold >= COURSES && !this._broke.cleared) {
      this._broke.cleared = true;
      if (e.shelf) burst(e.shelf);
      return;
    }
    if (beat === 2 && this._askOpen && !this._broke[2]) {
      this._broke[2] = true;
      if (e.ask) burst(e.ask);
    }
  }
}