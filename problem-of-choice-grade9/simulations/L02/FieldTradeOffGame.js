import { DomSimulation } from 'simulations/base/DomSimulation.js';
import { withChallenge } from 'simulations/base/ChallengeMode.js';
import { SimMascotDom } from 'simulations/base/SimMascotDom.js';

/**
 * FieldTradeOffGame - mini-game for les-02, hosted by mini-game@1.
 *
 * Tie level L2 (embodiment). The lesson's load-bearing claim (blk-l02-s05) is
 * a strict, stated 1:1 relationship: "Every hectare he moves from wheat to
 * barley is a hectare wheat will never see this year." That ratio is the
 * lesson's own framing and must not be replaced with an invented yield curve
 * - inventing a non-1:1 tradeoff here would teach something the lesson never
 * said.
 *
 * The original version of this scene let the student drag a slider to the
 * barley target while a live readout mirrored the wheat lost back at them in
 * real time - so "compute the opportunity cost" was never actually required
 * to win; `checkObjective()` only tested slider position. Redesigned as a
 * PREDICT-THEN-CONFIRM task instead: the readout and the slider are both
 * locked until the student commits a prediction of how much wheat 7 ha of
 * barley will cost. Only once a prediction is submitted does the field
 * unlock, so a student cannot win by eyeballing a bar chart mid-drag - they
 * have to reason "10 total, 7 to barley, so wheat gives up 3" BEFORE the
 * scene will show them anything.
 *
 * Designed-in wrong attractor: predicting 0 ha - the exact misconception the
 * lesson exists to correct ("More barley is not free"). Also fails: 7 ha
 * (confusing the barley GAINED with the wheat LOST) and 10 ha (assuming the
 * whole plot, not just the switched share, is the cost).
 *
 * Built on DomSimulation rather than CanvasSimulation for the reason the
 * kit gives for new games: Quill is an SVG rig, so SimMascotDom drops
 * him straight into this.root with no canvas port, and every colour is
 * a live var(--sim-*) with no fallback table to go stale.
 */

const W = 900;
const H = 600;

const TOTAL_HA = 10;
const TARGET_BARLEY_HA = 7;          // 7 of 10 to barley...
const REAL_WHEAT_COST_HA = TOTAL_HA - TARGET_BARLEY_HA; // ...costs exactly 3 ha of wheat.

const PREDICTIONS = [0, 3, 7, 10];

const CSS = `
.ftg { position: absolute; inset: 0; font-family: var(--sim-font); color: var(--sim-label); }
.ftg .pad { position: absolute; inset: 0; padding: 22px 28px; box-sizing: border-box;
           display: flex; flex-direction: column; gap: 12px; }
.ftg .kicker { font-size: 13px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase;
              color: var(--sim-label-muted); margin: 0; }
.ftg h2 { font-family: var(--sim-font-display); font-size: 24px; font-weight: 700; margin: 0; line-height: 1.2; }
.ftg h2 b { color: var(--sim-accent); }

.ftg .predict { display: flex; flex-direction: column; gap: 8px; padding: 14px 16px;
               background: var(--sim-panel); border: 2px solid var(--sim-border); border-radius: 14px; }
.ftg .predict .q { font-size: 14px; font-weight: 700; }
.ftg .predict .opts { display: flex; gap: 8px; flex-wrap: wrap; }
.ftg .predict button { font: inherit; font-weight: 800; padding: 8px 16px; border-radius: 10px;
                       border: 2px solid var(--sim-border); background: var(--sim-bg-surface);
                       color: var(--sim-label); cursor: pointer; }
.ftg .predict button[aria-pressed="true"] { border-color: var(--sim-accent); color: var(--sim-accent); }

.ftg svg.field { width: 100%; height: 220px; background: var(--sim-bg-deep);
                border: 2px solid var(--sim-border); border-radius: 14px; }
.ftg .wheat { fill: var(--sim-series-1); }
.ftg .barley { fill: var(--sim-series-3); }
.ftg .field[data-locked="1"] { opacity: 0.35; }
.ftg .lockNote { font-size: 12px; color: var(--sim-label-muted); margin: -6px 0 0; }

.ftg .sliders { display: flex; flex-direction: column; gap: 8px; padding: 14px 16px;
               background: var(--sim-panel); border: 2px solid var(--sim-border); border-radius: 14px; }
.ftg .sliders label { display: flex; justify-content: space-between; align-items: center;
                     font-size: 14px; font-weight: 700; }
.ftg .sliders input { width: 60%; }
.ftg .sliders input:disabled { opacity: 0.4; }

.ftg .readout { display: flex; justify-content: space-around; padding: 10px 0; }
.ftg .readout .cell { text-align: center; }
.ftg .readout .cell .k { font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase;
                        color: var(--sim-label-muted); }
.ftg .readout .cell .v { font-size: 22px; font-weight: 800; }
.ftg .readout .cell .v.gain { color: var(--sim-series-3); }
.ftg .readout .cell .v.loss { color: var(--sim-series-1); }

.ftg .verdict { font-size: 14px; padding: 10px 14px; border-radius: 10px; background: var(--sim-bg-surface);
               border: 2px solid var(--sim-border); }
.ftg .verdict[data-ok="1"] { border-color: var(--sim-success); color: var(--sim-success); }
.ftg .verdict[data-bad="1"] { border-color: var(--sim-error); color: var(--sim-error); }
`;

const HEIGHT_FIELD = 220;

export class FieldTradeOffGame extends withChallenge(DomSimulation) {
  static simId = 'field-trade-off-game';
  static label = { en: 'Field Trade-Off' };
  static category = 'social-science.economics';
  static WIDTH = W;
  static HEIGHT = H;
  static ARIA_LABEL =
    'A ten-hectare field. First predict how many hectares of wheat seven hectares of barley will cost, then move the barley slider to seven and check whether your prediction was right.';
  static OBJECTIVE = {
    prompt: {
      en: 'Before you touch anything: 7 of the 10 hectares go to barley. Predict how much wheat that costs. Then move the slider to 7 and see if you were right.',
    },
  };
  static SCORING = { mode: 'accuracy' };
  static CONTROLS = [];

  constructor(container, config) {
    super(container, config);
    this.barleyHa = 0;
    this._predicted = null;
  }

  async setup() {
    await super.setup();
    this.root.insertAdjacentHTML('beforeend', `
      <div class="ftg">
        <div class="pad">
          <p class="kicker">Predict first - then confirm</p>
          <h2>7 of 10 hectares go to <b>barley</b>. How much wheat does that cost?</h2>

          <div class="predict">
            <p class="q">Your prediction: wheat given up (hectares)</p>
            <div class="opts" data-predict-opts>
              ${PREDICTIONS.map((p) => `<button type="button" data-predict="${p}" aria-pressed="false">${p} ha</button>`).join('')}
            </div>
          </div>

          <svg class="field" viewBox="0 0 ${W - 56} ${HEIGHT_FIELD}" aria-hidden="true" data-field data-locked="1">
            <rect class="wheat" x="0" y="0" width="${W - 56}" height="${HEIGHT_FIELD}" data-wheat></rect>
            <rect class="barley" x="0" y="0" width="0" height="${HEIGHT_FIELD}" data-barley></rect>
          </svg>
          <p class="lockNote" data-lock-note>Pick a prediction above to unlock the field and the slider.</p>

          <div class="sliders">
            <label>Barley hectares:
              <input type="range" min="0" max="${TOTAL_HA}" value="0" step="1" data-slider disabled>
              <span data-barley-out>0</span>
            </label>
          </div>
          <div class="readout">
            <div class="cell"><div class="k">Barley gained</div><div class="v gain" data-barley-val>-</div></div>
            <div class="cell"><div class="k">Wheat given up</div><div class="v loss" data-wheat-val>-</div></div>
          </div>
          <p class="verdict" data-verdict>Predict the cost, then move the slider to 7 and check.</p>
        </div>
      </div>
    `);

    this.quill = SimMascotDom.mount(this.root, { x: 250, y: 590, height: 100, bubbleSide: 'right' });
    this.injectStyle(CSS + SimMascotDom.styles());

    this._slider = this.root.querySelector('[data-slider]');
    this._slider.addEventListener('input', () => {
      this.barleyHa = Number(this._slider.value);
      this._render();
    });

    this.root.querySelector('[data-predict-opts]').addEventListener('click', (e) => {
      const btn = e.target.closest('[data-predict]');
      if (!btn) return;
      this._predicted = Number(btn.dataset.predict);
      this.root.querySelectorAll('[data-predict]').forEach((b) => {
        b.setAttribute('aria-pressed', String(b === btn));
      });
      this._slider.disabled = false;
      this.root.querySelector('[data-field]').dataset.locked = '0';
      this.root.querySelector('[data-lock-note]').textContent =
        'Field unlocked. Move the slider to 7 hectares of barley.';
      this._render();
    });

    this._render();
    this.quill.speak('Guess before you look - that is the only way this counts.', 5000);
  }

  destroy() {
    this.quill?.destroy();
    this.quill = null;
    super.destroy();
  }

  _render() {
    const fieldW = W - 56;
    const perHa = fieldW / TOTAL_HA;
    const wheatW = fieldW - this.barleyHa * perHa;
    this.root.querySelector('[data-wheat]').setAttribute('width', wheatW);
    this.root.querySelector('[data-wheat]').setAttribute('x', this.barleyHa * perHa);
    this.root.querySelector('[data-barley]').setAttribute('width', this.barleyHa * perHa);
    this.root.querySelector('[data-barley]').setAttribute('x', 0);
    this.root.querySelector('[data-barley-out]').textContent = String(this.barleyHa);
    if (this._predicted !== null) {
      this.root.querySelector('[data-barley-val]').textContent = `${this.barleyHa} ha`;
      this.root.querySelector('[data-wheat-val]').textContent = `${this.barleyHa} ha`;
    }
  }

  checkObjective() {
    if (this._predicted === null) return null;
    const verdict = this.root.querySelector('[data-verdict]');
    const positionOk = this.barleyHa === TARGET_BARLEY_HA;
    const predictionOk = this._predicted === REAL_WHEAT_COST_HA;

    if (positionOk && predictionOk) {
      verdict.dataset.ok = '1';
      verdict.dataset.bad = '0';
      verdict.textContent = `Right. Barley at 7 costs exactly ${REAL_WHEAT_COST_HA} ha of wheat - the same finite field, so what one crop gains the other must give up.`;
      this.quill?.perform('hop');
      return { ok: true };
    }

    verdict.dataset.ok = '0';
    verdict.dataset.bad = '1';
    if (!positionOk) {
      verdict.textContent = `Move the slider to exactly 7 hectares of barley first - it is at ${this.barleyHa}.`;
    } else if (this._predicted === 0) {
      verdict.textContent = 'You predicted 0 - but more barley is not free. It is paid for in wheat, hectare for hectare.';
    } else if (this._predicted === TARGET_BARLEY_HA) {
      verdict.textContent = `You predicted ${this._predicted} - that is the barley GAINED, not the wheat LOST. With 7 to barley, only ${REAL_WHEAT_COST_HA} of the original 10 wheat hectares remain unswitched... so ${REAL_WHEAT_COST_HA} is what was given up.`;
    } else if (this._predicted === TOTAL_HA) {
      verdict.textContent = `You predicted the whole plot - but only the hectares actually switched to barley cost wheat. ${REAL_WHEAT_COST_HA} switched, so ${REAL_WHEAT_COST_HA} is the cost.`;
    } else {
      verdict.textContent = `Your prediction was ${this._predicted} ha; the real cost is ${REAL_WHEAT_COST_HA} ha. Pick a new prediction and try again.`;
    }
    this.quill?.setExpression('surprised');
    return { ok: false, hint: verdict.textContent };
  }
}
