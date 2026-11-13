import { DomSimulation } from 'simulations/base/DomSimulation.js';
import { withChallenge } from 'simulations/base/ChallengeMode.js';
import { SimMascotDom } from 'simulations/base/SimMascotDom.js';

/**
 * ScaleTheBudgetGame - mini-game for les-04, hosted by mini-game@1.
 *
 * Tie level L2 (embodiment). The lesson's load-bearing claim is that
 * the household and the nation run on the SAME logic - earn, spend,
 * save, invest, decide. The text (blk-l04-s03) shows the twin budget
 * scene: family on one side, nation on the other. The number that is
 * easy to gloss over is the SCALE, not the shape: every family line
 * has a national counterpart, but the unit is rupees-crore, and the
 * counterpart on the nation side is sometimes a different actor.
 *
 * The game makes the matching the only way to win. Six family budget
 * rows (rent, food, school fees, electricity, savings, festival
 * spend). Six nation budget rows (defence, food subsidy, MGNREGA,
 * power ministry, fiscal deficit, cultural ministry). The student
 * must draw a line from each family row to its national counterpart.
 *
 * Designed-in wrong attractor: matching by NAME similarity works for
 * 3 of the 6 rows (food -> food subsidy, electricity -> power ministry,
 * festival spend -> cultural ministry all sound right AND are correct),
 * which is exactly what makes it a trap rather than a giveaway - a
 * student who stops there is 3 short. Rent has no "housing" row to
 * pair with by name, school fees has no "education" row, and savings
 * has no "bank" row; those three only resolve by asking what DECISION
 * each row represents (rent/defence = secured shelter, school
 * fees/MGNREGA = cash in the hands of the people, savings/fiscal
 * deficit = deferred spending). A name-only strategy caps at 3 of 6 and
 * cannot win.
 *
 * Built on DomSimulation rather than CanvasSimulation for the reason
 * the kit gives for new games: Quill is an SVG rig, so SimMascotDom
 * drops him straight into this.root with no canvas port, and every
 * colour is a live var(--sim-*) with no fallback table to go stale.
 */

const W = 900;
const H = 600;

const FAMILY = [
  { id: 'rent',   label: 'House rent' },
  { id: 'food',   label: 'Groceries for the month' },
  { id: 'school', label: 'Children\'s school fees' },
  { id: 'power',  label: 'Electricity bill' },
  { id: 'save',   label: 'Put money in the bank' },
  { id: 'fest',   label: 'Diwali shopping' },
];
const NATION = [
  { id: 'defence',     label: 'Defence budget' },
  { id: 'subsidy',     label: 'Food subsidy / PDS' },
  { id: 'mgnrega',     label: 'MGNREGA wages' },
  { id: 'ministry',    label: 'Power ministry' },
  { id: 'fiscal',      label: 'Fiscal deficit' },
  { id: 'cultural',    label: 'Cultural ministry' },
];
// Correct mapping (the lesson's twin-budget).
const CORRECT = {
  rent:    'defence',    // rent = secured shelter; defence = secured border
  food:    'subsidy',    // groceries ~ food subsidy
  school:  'mgnrega',    // both put cash in the hands of the people
  power:   'ministry',   // both buy power
  save:    'fiscal',     // both are deferred spending
  fest:    'cultural',   // both are private / voluntary spending
};

const CSS = `
.stb { position: absolute; inset: 0; font-family: var(--sim-font); color: var(--sim-label); }
.stb .pad { position: absolute; inset: 0; padding: 22px 28px; box-sizing: border-box;
           display: flex; flex-direction: column; gap: 12px; }
.stb .kicker { font-size: 13px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase;
              color: var(--sim-label-muted); margin: 0; }
.stb h2 { font-family: var(--sim-font-display); font-size: 24px; font-weight: 700; margin: 0; line-height: 1.2; }
.stb h2 b { color: var(--sim-accent); }
.stb .board { display: grid; grid-template-columns: 1fr 60px 1fr; gap: 12px; align-items: stretch; }
.stb .col { display: flex; flex-direction: column; gap: 8px; }
.stb .col h3 { font-size: 12px; letter-spacing: 0.1em; text-transform: uppercase;
              color: var(--sim-label-muted); margin: 0 0 4px; }
.stb .row { display: flex; align-items: center; gap: 8px; padding: 10px 12px;
           background: var(--sim-bg-surface); border: 2px solid var(--sim-border); border-radius: 10px; }
.stb .row .lbl { flex: 1; font-size: 14px; font-weight: 700; }
.stb .row select { font-family: var(--sim-font); font-size: 13px; padding: 4px 6px;
                  background: var(--sim-bg-deep); color: var(--sim-label);
                  border: 2px solid var(--sim-border); border-radius: 6px; }
.stb .row[data-ok="1"] { border-color: var(--sim-success); }
.stb .row[data-bad="1"] { border-color: var(--sim-error); }
.stb .hint { font-size: 14px; color: var(--sim-label-muted); margin: 0; }
.stb .verdict { font-size: 14px; padding: 8px 12px; border-radius: 10px; background: var(--sim-bg-surface);
              border: 2px solid var(--sim-border); margin: 0; }
.stb .verdict[data-ok="1"] { border-color: var(--sim-success); color: var(--sim-success); }
.stb .verdict[data-bad="1"] { border-color: var(--sim-error); color: var(--sim-error); }
`;

export class ScaleTheBudgetGame extends withChallenge(DomSimulation) {
  static simId = 'scale-the-budget-game';
  static label = { en: 'Scale the Budget' };
  static category = 'social-science.economics';
  static WIDTH = W;
  static HEIGHT = H;
  static ARIA_LABEL =
    'Six family budget rows and six national budget rows. Pick the national counterpart for each family row.';
  static OBJECTIVE = {
    prompt: {
      en: 'Six family rows. Six national rows. The same logic, a different scale. Pair every family row with its national counterpart.',
    },
  };
  static SCORING = { mode: 'accuracy' };
  static CONTROLS = [];

  constructor(container, config) {
    super(container, config);
    this.picks = {};
  }

  async setup() {
    await super.setup();
    this.root.insertAdjacentHTML('beforeend', `
      <div class="stb">
        <div class="pad">
          <p class="kicker">Twin budget - the same logic, a different scale</p>
          <h2>Match every <b>family row</b> with its <b>national row</b>.</h2>
          <div class="board">
            <div class="col" data-col="family">
              <h3>Family budget (rupees)</h3>
              ${FAMILY.map((f) => `
                <div class="row" data-row="${f.id}">
                  <span class="lbl">${f.label}</span>
                  <select data-pick="${f.id}">
                    <option value="">-- pick --</option>
                    ${NATION.map((n) => `<option value="${n.id}">${n.label}</option>`).join('')}
                  </select>
                </div>
              `).join('')}
            </div>
            <div></div>
            <div class="col">
              <h3>National budget (crore of rupees)</h3>
              ${NATION.map((n) => `<div class="row" data-row="${n.id}"><span class="lbl">${n.label}</span></div>`).join('')}
            </div>
          </div>
          <p class="hint">Every family row is the same decision as one national row - the question is which one.</p>
          <p class="verdict" data-verdict>Pick a national row for every family row. A wrong pair costs the family its match.</p>
        </div>
      </div>
    `);

    this.quill = SimMascotDom.mount(this.root, { x: 250, y: 590, height: 100, bubbleSide: 'right' });
    this.injectStyle(CSS + SimMascotDom.styles());

    for (const sel of this.root.querySelectorAll('select[data-pick]')) {
      sel.addEventListener('change', () => {
        const id = sel.dataset.pick;
        this.picks[id] = sel.value || null;
      });
    }
    this.quill.speak('Rent is shelter, defence is shelter. Match the LOGIC, not the words.', 5200);
  }

  destroy() {
    this.quill?.destroy();
    this.quill = null;
    super.destroy();
  }

  checkObjective() {
    const picked = Object.values(this.picks).filter((x) => x).length;
    if (picked < FAMILY.length) return null;
    let wrong = 0;
    for (const f of FAMILY) {
      const got = this.picks[f.id];
      const el = this.root.querySelector(`[data-row="${f.id}"]`);
      if (got === CORRECT[f.id]) { el.dataset.ok = '1'; el.dataset.bad = '0'; }
      else { el.dataset.ok = '0'; el.dataset.bad = '1'; wrong += 1; }
    }
    const verdict = this.root.querySelector('[data-verdict]');
    if (wrong === 0) {
      verdict.dataset.ok = '1';
      verdict.dataset.bad = '0';
      verdict.textContent = 'All six pairs match. The same logic, a different scale - the lesson lands.';
      this.quill?.perform('hop');
      return { ok: true };
    }
    verdict.dataset.ok = '0';
    verdict.dataset.bad = '1';
    if (wrong >= 4) {
      verdict.textContent = `${wrong} of 6 are off. Match the LOGIC, not the name. Rent is shelter; defence is shelter. Savings is deferred spend; deficit is deferred spend.`;
    } else {
      verdict.textContent = `${wrong} of 6 are off. The question to ask: what DECISION is the family making? The national row is the same decision at scale.`;
    }
    this.quill?.setExpression('surprised');
    return { ok: false, hint: verdict.textContent };
  }
}
