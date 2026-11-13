import { DomSimulation } from 'simulations/base/DomSimulation.js';
import { withChallenge } from 'simulations/base/ChallengeMode.js';
import { SimMascotDom } from 'simulations/base/SimMascotDom.js';

/**
 * ReadThePPCGame - mini-game for les-03, hosted by mini-game@1.
 *
 * Tie level L2 (embodiment). The lesson's load-bearing claim is that the
 * frontier is a single curve, every point on it is a different plan, and
 * moving along the curve is a real trade - the rice you can grow in
 * exchange for the pulses you give up. The text (blk-l03-s05) shows a
 * series of land-quality steps where the sacrifice per step grows
 * (10 -> 20 -> 30 -> 40). The number that is easy to gloss over is
 * the INCREASING sacrifice: linear movement is wrong; convexity is
 * the point.
 *
 * The game makes convexity the only way to win. The student is given a
 * PPC with the points A(0,100), B(25,90), C(50,70), D(75,40), E(100,0)
 * - exactly the points from the lesson. They must pick one of the
 * pre-defined plans (B, C, D) and read off the cost of moving one
 * step along the curve. The win condition: the student answers that
 * C -> D costs 30 (pulses given up for rice gained), and that D -> E
 * costs 40 - in other words, they read convexity off the curve.
 *
 * Designed-in wrong attractor: assuming the costs are linear (10, 10,
 * 10, 10). The lesson's text explicitly listed the costs as
 * 10, 20, 30, 40 and the wrong answer is to multiply, average, or
 * pick 25. The student who treats the frontier as a straight line
 * misses what convexity is FOR.
 *
 * Built on DomSimulation rather than CanvasSimulation for the reason the
 * kit gives for new games: Quill is an SVG rig, so SimMascotDom drops
 * him straight into this.root with no canvas port, and every colour is
 * a live var(--sim-*) with no fallback table to go stale.
 */

const W = 900;
const H = 600;

const POINTS = [
  { id: 'A', x: 0,   y: 100, label: 'A' },
  { id: 'B', x: 25,  y: 90,  label: 'B' },
  { id: 'C', x: 50,  y: 70,  label: 'C' },
  { id: 'D', x: 75,  y: 40,  label: 'D' },
  { id: 'E', x: 100, y: 0,   label: 'E' },
];
// Sacrifice is the y-drop per x-step. A->B = 10, B->C = 20, C->D = 30, D->E = 40.
const STEPS = [
  { from: 'A', to: 'B', cost: 10 },
  { from: 'B', to: 'C', cost: 20 },
  { from: 'C', to: 'D', cost: 30 },
  { from: 'D', to: 'E', cost: 40 },
];
// 4 numeric choices: 3 wrong, 1 right.
const TARGET_STEP = { from: 'C', to: 'D', cost: 30 };

const PAD_LEFT = 100;
const PAD_RIGHT = 40;
const PAD_TOP = 30;
const PAD_BOTTOM = 80;
const PLOT_W = W - PAD_LEFT - PAD_RIGHT;
const PLOT_H = H - PAD_TOP - PAD_BOTTOM - 100;

const CSS = `
.rpg { position: absolute; inset: 0; font-family: var(--sim-font); color: var(--sim-label); }
.rpg .pad { position: absolute; inset: 0; padding: 22px 28px; box-sizing: border-box;
           display: flex; flex-direction: column; gap: 10px; }
.rpg .kicker { font-size: 13px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase;
              color: var(--sim-label-muted); margin: 0; }
.rpg h2 { font-family: var(--sim-font-display); font-size: 24px; font-weight: 700; margin: 0; line-height: 1.2; }
.rpg h2 b { color: var(--sim-accent); }
.rpg svg { width: 100%; height: 320px; background: var(--sim-bg-deep);
          border: 2px solid var(--sim-border); border-radius: 14px; }
.rpg .axis { stroke: var(--sim-label-muted); stroke-width: 1.5; }
.rpg .grid { stroke: var(--sim-border); stroke-width: 0.5; opacity: 0.4; }
.rpg .curve { fill: none; stroke: var(--sim-accent); stroke-width: 3; }
.rpg .pt { fill: var(--sim-gold); stroke: var(--sim-bg-deep); stroke-width: 2; cursor: pointer; }
.rpg .pt[aria-pressed="true"] { fill: var(--sim-accent); }
.rpg .ptlbl { font: 700 14px var(--sim-font); fill: var(--sim-label); }
.rpg .axislbl { font: 700 12px var(--sim-font); fill: var(--sim-label-muted); }
.rpg .choices { display: flex; gap: 10px; flex-wrap: wrap; padding: 10px 14px;
               background: var(--sim-panel); border: 2px solid var(--sim-border); border-radius: 14px; }
.rpg .choices button { flex: 1; min-width: 110px; padding: 12px;
                     font-family: var(--sim-font); font-size: 15px; font-weight: 800;
                     background: var(--sim-bg-surface); color: var(--sim-label);
                     border: 2px solid var(--sim-border); border-radius: 12px; cursor: pointer; }
.rpg .choices button[aria-pressed="true"] { background: var(--sim-accent); color: var(--sim-bg-deep);
                                            border-color: var(--sim-accent); }
.rpg .verdict { font-size: 14px; padding: 8px 12px; border-radius: 10px; background: var(--sim-bg-surface);
              border: 2px solid var(--sim-border); margin: 0; }
.rpg .verdict[data-ok="1"] { border-color: var(--sim-success); color: var(--sim-success); }
.rpg .verdict[data-bad="1"] { border-color: var(--sim-error); color: var(--sim-error); }
`;

export class ReadThePPCGame extends withChallenge(DomSimulation) {
  static simId = 'read-the-ppc-game';
  static label = { en: 'Read the PPC' };
  static category = 'social-science.economics';
  static WIDTH = W;
  static HEIGHT = H;
  static ARIA_LABEL =
    'A production possibility curve through A(0,100), B(25,90), C(50,70), D(75,40), E(100,0). Pick the step on the curve and choose the rice-for-pulses cost.';
  static OBJECTIVE = {
    prompt: {
      en: 'Move from C to D. How much PULSE does the farm give up for the rice it gains? Pick the number that matches the curve.',
    },
  };
  static SCORING = { mode: 'accuracy' };
  static CONTROLS = [];

  constructor(container, config) {
    super(container, config);
    this.chosenStep = null;
    this.chosenCost = null;
  }

  async setup() {
    await super.setup();
    this.root.insertAdjacentHTML('beforeend', `
      <div class="rpg">
        <div class="pad">
          <p class="kicker">Read the frontier, not the line</p>
          <h2>Five plans. Pick <b>C to D</b>, then the cost.</h2>
          <svg viewBox="0 0 ${W} 320" aria-hidden="true">
            <g class="grid"></g>
            <line class="axis" x1="${PAD_LEFT}" y1="${PAD_TOP + PLOT_H}" x2="${PAD_LEFT + PLOT_W}" y2="${PAD_TOP + PLOT_H}"></line>
            <line class="axis" x1="${PAD_LEFT}" y1="${PAD_TOP}" x2="${PAD_LEFT}" y2="${PAD_TOP + PLOT_H}"></line>
            <text class="axislbl" x="${PAD_LEFT + PLOT_W}" y="${PAD_TOP + PLOT_H + 18}" text-anchor="end">rice (x)</text>
            <text class="axislbl" x="${PAD_LEFT - 8}" y="${PAD_TOP - 8}" text-anchor="end">pulses (y)</text>
            <path class="curve" d="${this._curvePath()}"></path>
            ${POINTS.map((p) => this._pointMarkup(p)).join('')}
          </svg>
          <div class="choices" data-step-chooser>
            ${STEPS.map((s) => `<button type="button" data-step="${s.from}-${s.to}" aria-pressed="false">${s.from} -> ${s.to}</button>`).join('')}
          </div>
          <div class="choices" data-cost-chooser>
            <button type="button" data-cost="10" aria-pressed="false">10 pulses</button>
            <button type="button" data-cost="20" aria-pressed="false">20 pulses</button>
            <button type="button" data-cost="25" aria-pressed="false">25 pulses</button>
            <button type="button" data-cost="30" aria-pressed="false">30 pulses</button>
            <button type="button" data-cost="40" aria-pressed="false">40 pulses</button>
          </div>
          <p class="verdict" data-verdict>Pick a step and a cost. The right one matches the curve, not a straight line.</p>
        </div>
      </div>
    `);

    this.quill = SimMascotDom.mount(this.root, { x: 250, y: 590, height: 100, bubbleSide: 'right' });
    this.injectStyle(CSS + SimMascotDom.styles());

    for (const b of this.root.querySelectorAll('[data-step-chooser] button')) {
      b.addEventListener('click', () => {
        this.chosenStep = b.dataset.step;
        for (const x of this.root.querySelectorAll('[data-step-chooser] button')) x.setAttribute('aria-pressed', x === b ? 'true' : 'false');
      });
    }
    for (const b of this.root.querySelectorAll('[data-cost-chooser] button')) {
      b.addEventListener('click', () => {
        this.chosenCost = Number(b.dataset.cost);
        for (const x of this.root.querySelectorAll('[data-cost-chooser] button')) x.setAttribute('aria-pressed', x === b ? 'true' : 'false');
      });
    }
    this.quill.speak('Linear is wrong. The curve is the answer.', 5200);
  }

  destroy() {
    this.quill?.destroy();
    this.quill = null;
    super.destroy();
  }

  _toPlot(p) {
    return {
      x: PAD_LEFT + (p.x / 100) * PLOT_W,
      y: PAD_TOP + (1 - p.y / 100) * PLOT_H,
    };
  }

  _curvePath() {
    return POINTS.map((p, i) => {
      const xy = this._toPlot(p);
      return `${i === 0 ? 'M' : 'L'} ${xy.x.toFixed(1)} ${xy.y.toFixed(1)}`;
    }).join(' ');
  }

  _pointMarkup(p) {
    const xy = this._toPlot(p);
    return `<circle class="pt" cx="${xy.x.toFixed(1)}" cy="${xy.y.toFixed(1)}" r="8" data-pt="${p.id}"></circle>
            <text class="ptlbl" x="${(xy.x + 12).toFixed(1)}" y="${(xy.y + 5).toFixed(1)}">${p.label}</text>`;
  }

  checkObjective() {
    if (this.chosenStep === null || this.chosenCost === null) return null;
    const stepOk = this.chosenStep === `${TARGET_STEP.from}-${TARGET_STEP.to}`;
    const costOk = this.chosenCost === TARGET_STEP.cost;
    const verdict = this.root.querySelector('[data-verdict]');
    if (stepOk && costOk) {
      verdict.dataset.ok = '1';
      verdict.dataset.bad = '0';
      verdict.textContent = 'C -> D costs 30 pulses. The curve steepens - land better suited to one crop gives up that crop reluctantly.';
      this.quill?.perform('hop');
      return { ok: true };
    }
    verdict.dataset.ok = '0';
    verdict.dataset.bad = '1';
    if (!stepOk && !costOk) {
      verdict.textContent = 'Step and cost are both off. Read the curve: A->B is 10, B->C is 20, C->D is 30, D->E is 40. The costs grow because land is not equally suited.';
    } else if (!stepOk) {
      verdict.textContent = `The step is wrong. Pick C->D, then look up the cost in the curve.`;
    } else {
      verdict.textContent = `Step C->D is right, but the cost is off. The curve is not a straight line - sacrifice grows as the farm specialises. The right cost is 30.`;
    }
    this.quill?.setExpression('surprised');
    return { ok: false, hint: verdict.textContent };
  }
}
