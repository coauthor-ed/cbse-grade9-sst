import { DomSimulation } from 'simulations/base/DomSimulation.js';
import { SIM_LOOK_DOM_CSS, noteLineHtml, burst, applyToneInks } from 'simulations/base/kit/SimLookDom.js';
import { simTag, simRecord } from 'simulations/base/SimUi.js';
import { iconSvg } from 'simulations/base/kit/SimIcons.js';
import { FairnessQuestionScene as V } from '../L05/FairnessQuestionScene.js';

/**
 * FairnessQuestionScene-referee - the opening hook of L06 (blk-l06-s01).
 *
 * The same queue the chapter left standing: a medicine stall whose four courses
 * sell at one month's wages, and one child at the clinic gate who has neither
 * the wage nor the wait. L05 asked "who answers back?"; this mount asks the
 * second half - and what that answer costs - and answers neither.
 *
 * The panels, chips, bars and the whole `fq-` stylesheet are L05's, imported as
 * that file's class statics (`V.counterHtml`, `V.queueHtml`, `V.askHtml`,
 * `V.COUNTER_CSS`) rather than copied. What this file owns is the market-table
 * banner, the wait chip, the cost line, the record steps and the note lines -
 * see the design note's Reuse section. Nothing here is a second vocabulary: my
 * own rules are `rf-` prefixed and scoped to `.rf-root`, so both mounts can sit
 * on one page without fighting, and L05 is not edited.
 *
 * Labels only: no number the slide does not give, and no instrument, no
 * regulator and no cost the lesson has not taught yet.
 */

// One entry per beat of blk-l06-s01 (verified with scene-info: 3 beats, 3 STEPs).
// Its own constant, not L05's: this mount closes on the cost of the answer, so
// the two mounts never share one BEAT_STEP_MAP (the stub's variant-split rule).
const BEAT_STEP_MAP = [
  [{ idx: 0, dwellMs: null }],
  [{ idx: 1, dwellMs: null }],
  [{ idx: 2, dwellMs: null }],
];

// The slide's own count, reached through the shared fragments: four courses on
// the shelf, one child waiting, and that one stays one to the last beat.
const COURSES = 4;

const NOTE = {
  0: "the market's long hunt ends at one price - it solves itself, eventually",
  1: "the course costs a month's wage - the child has neither the wage nor the wait",
  2: 'the market did clear itself - the unfairness sits outside its rule',
};

const RECORD_STEPS = ['Clears itself', 'A child waits', 'Who answers back'];

// Only what this mount adds to the shared vocabulary.
const RF_CSS = `
.rf-banner { display: flex; flex-direction: row; align-items: center; flex-wrap: wrap; gap: var(--sim-space-2); }
.rf-banner__art { display: grid; place-items: center; width: 26px; height: 26px; flex: none; }
.rf-banner__art .sim-icon { width: 26px; height: 26px; }
.rf-banner__label { font-size: var(--sim-text-md); font-weight: 800; color: var(--sim-label); }
.rf-banner__chip { border-style: dashed; }
.rf-banner__chip--on { border-style: solid; border-color: var(--sim-good); background: var(--sim-good); color: var(--sim-ink-on-good, var(--sim-bg-deep)); }

/* Beat 0 is the stall's beat: the queue is on screen (its "1 waiting" chip and
   the child both survive) but it has nothing to show yet, so its card hugs its
   own content instead of stretching a muted half-empty box down the column.
   Scoped to this mount; the shared sheet's stretch is untouched. */
[data-step="0"] .rf-root .fq-card--queue { align-self: start; }

/* The wait: the other thing the slide says the child has none of. A tag, not a
   control - there is nothing to check about a wait, only to notice. Beat 1 owns
   it; it would pre-empt beat 0 and it folds away with the bodies at beat 2. */
.rf-wait { display: inline-flex; align-items: center; gap: var(--sim-space-1); align-self: start; }
.rf-wait__art { display: grid; place-items: center; width: 20px; height: 20px; flex: none; }
.rf-wait__art .sim-icon { width: 20px; height: 20px; }
.rf-wait .sim-icon { color: var(--sim-label-muted); }
.rf-wait .sim-tag { border-color: var(--sim-warning); color: var(--sim-label); }
[data-step="0"] .rf-wait, [data-step="2"] .rf-wait { display: none; }

/* The second half of the closing question: a label with a "?" badge and nothing
   under it. The lesson has not costed the help yet, so the scene does not. */
.rf-cost { display: flex; align-items: center; gap: var(--sim-space-2); margin: 0;
  padding: var(--sim-space-2) var(--sim-space-4);
  border: 2px dashed var(--sim-border); border-radius: var(--sim-radius-lg);
  background: var(--sim-bg-deep); }
.rf-cost__q { font-size: var(--sim-text-xl); color: var(--sim-label); }
.rf-cost__text { font-size: var(--sim-text-lg); font-weight: 800; color: var(--sim-label); }
`;
// sim-lint-ignore token: --sim-ink-on-* is not a stylesheet token; applyToneInks() sets it on the root at mount.

export class FairnessQuestionSceneReferee extends DomSimulation {
  // ---------------------------------------------------------------- the reuse
  // The banner is this mount's own card: the market table's verdict, `?` until
  // the shelf empties and `balanced` after - the chapter's own idiom for a
  // value that evidence has not earned yet.
  static bannerHtml() {
    return `<div class="sim-card sim-card--muted rf-banner" data-banner aria-label="The market table's own verdict">
      <span class="rf-banner__art" aria-hidden="true">${iconSvg('scales', 3)}</span>
      <span class="rf-banner__label">market table</span>
      <span class="sim-tag rf-banner__chip" data-balanced>?</span>
    </div>`;
  }

  // The one thing this slide adds to the queue: `eventually is a long wait`, and
  // the child has neither the wage nor the wait.
  static waitHtml() {
    return `<span class="rf-wait" data-wait>
      <span class="rf-wait__art" aria-hidden="true">${iconSvg('clock', 3)}</span>
      ${simTag('nor the wait')}
    </span>`;
  }

  // Beat 2's second half. A statement of the question, not an answer to it.
  static costHtml() {
    return `<p class="rf-cost" data-cost>
      <span class="sim-q rf-cost__q" aria-hidden="true">?</span>
      <span class="rf-cost__text">and what does that help cost?</span>
    </p>`;
  }

  // ---------------------------------------------------------------- the scene
  static WIDTH = 680;
  // From sim-layout: landscape interaction states reach 542px (beat 1 with the
  // reach bars open), portrait 796px. Declared at the worst state, not the first:
  // the host budgets the side panel from this number.
  static HEIGHT = 550;
  static PORTRAIT_WIDTH = 380;
  static PORTRAIT_HEIGHT = 820;
  static FIT = true;
  static BEAT_STEP_MAP = BEAT_STEP_MAP;
  static ARIA_LABEL = 'A medicine stall whose shelf empties as its four courses are sold at one month of wages, beside a clinic gate where one child still waits with neither the wage nor the wait. A banner over the two reads the market table as balanced once the shelf is empty, and it stays balanced while the queue does not move. The last beat asks who answers back, and what that answer would cost.';
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
      css: SIM_LOOK_DOM_CSS + V.COUNTER_CSS + RF_CSS,
      rootClass: 'fq-root rf-root sl-backdrop',
      html: `<div class="sim-stack fq-root rf-root">
        <div data-record>${simRecord(RECORD_STEPS, 0, 'The referee steps in')}</div>
        ${FairnessQuestionSceneReferee.bannerHtml()}
        <div class="fq-main">
          <section class="sim-card fq-card fq-card--counter" data-counter aria-label="Medicine stall">
            ${V.counterHtml({ sold: 0 })}
          </section>
          <section class="sim-card fq-card fq-card--queue" data-queue aria-label="Clinic gate">
            ${V.queueHtml()}
            ${FairnessQuestionSceneReferee.waitHtml()}
          </section>
        </div>
        <section class="sim-card fq-ask" data-ask hidden aria-label="The closing question">
          ${V.askHtml()}
          ${FairnessQuestionSceneReferee.costHtml()}
        </section>
        ${noteLineHtml([{ text: NOTE[0] }])}
      </div>`,
    });
    const q = (sel) => this.root?.querySelector?.(sel) ?? null;
    this._els = {
      ask: q('[data-ask]'),
      balanced: q('[data-balanced]'),
      banner: q('[data-banner]'),
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

  // No beat owns anything to reset: the tally is the learner's, and the waiting
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

    // The banner is the market table's own verdict: `?` until the shelf has
    // emptied, `balanced` after - and it never changes again, whatever the queue
    // outside does.
    if (e.balanced) {
      e.balanced.textContent = cleared ? 'balanced' : '?';
      e.balanced.classList.toggle('rf-banner__chip--on', cleared);
    }

    if (e.sold) {
      e.sold.textContent = cleared ? 'stall cleared' : 'not cleared';
      e.sold.classList.toggle('fq-sold--done', cleared);
    }
    if (e.ledgerSold) e.ledgerSold.textContent = `${this._sold} of ${COURSES}`;
    if (e.ledgerWaiting) e.ledgerWaiting.textContent = '1';
    e.goods.forEach((el, i) => {
      const sold = i < this._sold;
      el.classList.toggle('fq-good--sold', sold);
      el.setAttribute('aria-pressed', sold ? 'true' : 'false');
      el.setAttribute('aria-label', sold ? 'course sold' : `course ${i + 1} of ${COURSES}, unsold`);
      el.disabled = sold;
      const art = el.querySelector('.fq-good__art');
      // A course never unsells, so only the sold mark is ever written: the
      // unsold carton comes from the shared fragment that drew it.
      if (art && sold && art.dataset.state !== 'sold') {
        art.innerHTML = iconSvg('check', 8);
        art.dataset.state = 'sold';
      }
    });

    if (e.wage) {
      e.wage.setAttribute('aria-pressed', this._reach ? 'true' : 'false');
      e.wage.classList.toggle('fq-wage--on', this._reach);
    }
    if (e.wageText) e.wageText.textContent = this._reach ? 'the price stands where it stands' : 'a child at the gate has no wage';
    if (e.wageHint) e.wageHint.textContent = this._reach ? 'check again' : 'check reach';
    if (e.reach) e.reach.hidden = !this._reach;

    if (e.askTags) e.askTags.hidden = !this._askOpen;
    if (e.askQ) e.askQ.setAttribute('aria-pressed', this._askOpen ? 'true' : 'false');
    if (e.askStall) e.askStall.textContent = cleared ? 'stall: cleared' : `stall: ${this._sold} of ${COURSES} sold`;
    if (e.askChild) e.askChild.textContent = 'child: still waiting (1)';

    // The tally pops when a course sells, so the count is seen to move.
    const chip = e.balanced;
    if (chip) {
      chip.classList.remove('fq-pop');
      if (cleared) { void chip.offsetWidth; chip.classList.add('fq-pop'); }
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

  // Two moments, both the concept rather than the tap: the shelf has emptied and
  // the table reads balanced (beat 0), and the closing question is open with both
  // facts showing (beat 2). Beat 1 never bursts - nothing got through there.
  _maybeBurst() {
    const e = this._els;
    const beat = Math.min(2, Math.max(0, this.stepIndex ?? 0));
    if (!e) return;
    if (beat < 2 && this._sold >= COURSES && !this._broke.cleared) {
      this._broke.cleared = true;
      if (e.banner) burst(e.banner);
      return;
    }
    if (beat === 2 && this._askOpen && !this._broke[2]) {
      this._broke[2] = true;
      if (e.ask) burst(e.ask);
    }
  }
}