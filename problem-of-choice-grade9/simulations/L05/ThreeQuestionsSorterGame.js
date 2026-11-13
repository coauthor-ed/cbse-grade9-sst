import { DomSimulation } from 'simulations/base/DomSimulation.js';
import { withChallenge } from 'simulations/base/ChallengeMode.js';
import { SimMascotDom } from 'simulations/base/SimMascotDom.js';

/**
 * ThreeQuestionsSorterGame - mini-game for les-05, hosted by mini-game@1.
 *
 * Tie level L3 (strategy). The lesson's load-bearing claim is that every
 * economy must answer THREE questions, and they are distinct: WHAT to
 * produce, HOW to produce, FOR WHOM to produce. The text (blk-l05-s01)
 * draws the scarcity funnel: scarcity -> three questions. The point
 * that is easy to gloss over is that the three are NOT substitutable -
 * "grow rice instead of wheat" is a WHAT question, "use machines
 * instead of hands" is a HOW question, "give the rice to the family
 * first" is a FOR WHOM question.
 *
 * The game makes the distinction the only way to win. 6 problems
 * facing a village chief. Each must be sorted into WHAT, HOW, or FOR
 * WHOM. The trap: "grow rice for the wedding" sounds like a WHAT
 * question but it is FOR WHOM (the wedding guests); "use bullocks
 * because the landlord has no tractor" sounds like a HOW question but
 * it is FOR WHOM (the landlord gets the harvest).
 *
 * Designed-in wrong attractor: sorting by the verb in the question
 * ("grow", "use", "give"). The lesson names the question by what
 * DECISION is being made, not by the verb in the line. The student
 * who sorts by verb will get at least 3 wrong and the verdict names
 * the trick.
 *
 * Built on DomSimulation rather than CanvasSimulation for the reason
 * the kit gives for new games: Quill is an SVG rig, so SimMascotDom
 * drops him straight into this.root with no canvas port, and every
 * colour is a live var(--sim-*) with no fallback table to go stale.
 */

const W = 900;
const H = 600;

const ITEMS = [
  { id: 'rice-wheat',   text: 'Grow rice this year instead of wheat',         q: 'what' },
  { id: 'machine',      text: 'Use a tractor instead of bullocks',            q: 'how' },
  { id: 'wedding',      text: 'Grow rice for the landlord\'s wedding feast',  q: 'whom' },
  { id: 'factory',      text: 'Build a textile factory instead of a road',     q: 'what' },
  { id: 'paid',         text: 'Hire paid workers instead of family labour',   q: 'how' },
  { id: 'poor',         text: 'Distribute the surplus to the poorest quarter', q: 'whom' },
];

const CSS = `
.tqs { position: absolute; inset: 0; font-family: var(--sim-font); color: var(--sim-label); }
.tqs .pad { position: absolute; inset: 0; padding: 22px 28px; box-sizing: border-box;
           display: flex; flex-direction: column; gap: 10px; }
.tqs .kicker { font-size: 13px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase;
              color: var(--sim-label-muted); margin: 0; }
.tqs h2 { font-family: var(--sim-font-display); font-size: 24px; font-weight: 700; margin: 0; line-height: 1.2; }
.tqs h2 b { color: var(--sim-accent); }
.tqs .pool { display: flex; flex-wrap: wrap; gap: 8px; padding: 12px; min-height: 60px;
            border: 2px dashed var(--sim-border); border-radius: 12px; background: var(--sim-panel); }
.tqs .chip { padding: 8px 14px; background: var(--sim-bg-surface); border: 2px solid var(--sim-border);
            border-radius: 999px; font-size: 14px; font-weight: 700; cursor: grab; user-select: none; }
.tqs .chip:active { cursor: grabbing; }
.tqs .chip[data-placed="1"] { opacity: 0.5; cursor: default; }
.tqs .bins { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; flex: 1; min-height: 0; }
.tqs .bin { border: 3px dashed var(--sim-border); border-radius: 14px; padding: 12px;
           background: var(--sim-bg-surface); display: flex; flex-direction: column; gap: 6px; }
.tqs .bin[data-ok="1"] { border-color: var(--sim-success); }
.tqs .bin[data-bad="1"] { border-color: var(--sim-error); }
.tqs .bin .bname { font-size: 14px; font-weight: 800; margin: 0; }
.tqs .bin[data-q="what"] .bname { color: var(--sim-series-1); }
.tqs .bin[data-q="how"]  .bname { color: var(--sim-series-3); }
.tqs .bin[data-q="whom"] .bname { color: var(--sim-series-4); }
.tqs .bin .slot { min-height: 50px; display: flex; flex-direction: column; gap: 4px; align-content: flex-start; }
.tqs .bin .q-help { font-size: 12px; color: var(--sim-label-muted); margin: 0 0 4px; }
.tqs .verdict { font-size: 14px; padding: 8px 12px; border-radius: 10px; background: var(--sim-bg-surface);
              border: 2px solid var(--sim-border); margin: 0; }
.tqs .verdict[data-ok="1"] { border-color: var(--sim-success); color: var(--sim-success); }
.tqs .verdict[data-bad="1"] { border-color: var(--sim-error); color: var(--sim-error); }
`;

export class ThreeQuestionsSorterGame extends withChallenge(DomSimulation) {
  static simId = 'three-questions-sorter-game';
  static label = { en: 'Three Questions Sorter' };
  static category = 'social-science.economics';
  static WIDTH = W;
  static HEIGHT = H;
  static ARIA_LABEL =
    'Six village problems. Three bins: WHAT, HOW, FOR WHOM. Sort each problem into the bin whose question it answers.';
  static OBJECTIVE = {
    prompt: {
      en: 'Six problems. Three questions: WHAT to produce, HOW to produce, FOR WHOM to produce. Sort by the question being asked, not the verb in the line.',
    },
  };
  static SCORING = { mode: 'accuracy' };
  static CONTROLS = [];

  constructor(container, config) {
    super(container, config);
    this.placed = { what: [], how: [], whom: [] };
  }

  async setup() {
    await super.setup();
    this.root.insertAdjacentHTML('beforeend', `
      <div class="tqs">
        <div class="pad">
          <p class="kicker">Every economy must answer three questions</p>
          <h2>Sort each line into <b>WHAT</b>, <b>HOW</b>, or <b>FOR WHOM</b>.</h2>
          <div class="pool" data-pool>
            ${ITEMS.map((i) => `<div class="chip" draggable="true" data-chip="${i.id}">${i.text}</div>`).join('')}
          </div>
          <div class="bins">
            <div class="bin" data-q="what">
              <p class="bname">WHAT to produce</p>
              <p class="q-help">Which goods and services?</p>
              <div class="slot" data-slot="what"></div>
            </div>
            <div class="bin" data-q="how">
              <p class="bname">HOW to produce</p>
              <p class="q-help">Which technique - hands, tools, machines?</p>
              <div class="slot" data-slot="how"></div>
            </div>
            <div class="bin" data-q="whom">
              <p class="bname">FOR WHOM to produce</p>
              <p class="q-help">Who gets the output?</p>
              <div class="slot" data-slot="whom"></div>
            </div>
          </div>
          <p class="verdict" data-verdict>Drop each chip into the bin whose question the line is answering.</p>
        </div>
      </div>
    `);

    this.quill = SimMascotDom.mount(this.root, { x: 250, y: 590, height: 100, bubbleSide: 'right' });
    this.injectStyle(CSS + SimMascotDom.styles());

    this._pool = this.root.querySelector('[data-pool]');
    this._slots = {
      what: this.root.querySelector('[data-slot="what"]'),
      how:  this.root.querySelector('[data-slot="how"]'),
      whom: this.root.querySelector('[data-slot="whom"]'),
    };

    for (const chip of this.root.querySelectorAll('.chip')) {
      chip.addEventListener('dragstart', (e) => e.dataTransfer.setData('text/plain', chip.dataset.chip));
    }
    const targets = [this._pool, this._slots.what, this._slots.how, this._slots.whom];
    for (const t of targets) {
      t.addEventListener('dragover', (e) => e.preventDefault());
      t.addEventListener('drop', (e) => this._onDrop(e, t));
    }
    for (const slot of Object.values(this._slots)) {
      slot.addEventListener('dblclick', (e) => {
        const chip = e.target.closest('.chip');
        if (chip) this._unplace(chip);
      });
    }
    this.quill.speak('The verb is not the question. Ask which DECISION the village is making.', 5200);
  }

  destroy() {
    this.quill?.destroy();
    this.quill = null;
    super.destroy();
  }

  _onDrop(e, target) {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain');
    if (!id) return;
    const fromBin = this._binContaining(id);
    if (fromBin) this.placed[fromBin] = this.placed[fromBin].filter((x) => x !== id);
    if (target !== this._pool) {
      const toBin = target.dataset.slot;
      this.placed[toBin] = [...this.placed[toBin], id];
    }
    this._render();
  }

  _binContaining(id) {
    for (const k of ['what', 'how', 'whom']) if (this.placed[k].includes(id)) return k;
    return null;
  }

  _unplace(chipEl) {
    const id = chipEl.dataset.chip;
    const fromBin = this._binContaining(id);
    if (fromBin) this.placed[fromBin] = this.placed[fromBin].filter((x) => x !== id);
    this._render();
  }

  _render() {
    this._pool.innerHTML = '';
    for (const i of ITEMS) {
      const placed = ['what', 'how', 'whom'].some((b) => this.placed[b].includes(i.id));
      if (!placed) {
        const chip = document.createElement('div');
        chip.className = 'chip';
        chip.draggable = true;
        chip.dataset.chip = i.id;
        chip.textContent = i.text;
        chip.addEventListener('dragstart', (e) => e.dataTransfer.setData('text/plain', i.id));
        this._pool.appendChild(chip);
      }
    }
    for (const bin of ['what', 'how', 'whom']) {
      this._slots[bin].innerHTML = '';
      for (const id of this.placed[bin]) {
        const i = ITEMS.find((x) => x.id === id);
        const chip = document.createElement('div');
        chip.className = 'chip';
        chip.dataset.chip = id;
        chip.dataset.placed = '1';
        chip.textContent = i.text;
        this._slots[bin].appendChild(chip);
      }
    }
  }

  checkObjective() {
    if (this.placed.what.length + this.placed.how.length + this.placed.whom.length < ITEMS.length) return null;
    let wrong = 0;
    for (const i of ITEMS) {
      const placedIn = ['what', 'how', 'whom'].find((b) => this.placed[b].includes(i.id));
      if (placedIn !== i.q) wrong += 1;
    }
    const verdict = this.root.querySelector('[data-verdict]');
    if (wrong === 0) {
      verdict.dataset.ok = '1';
      verdict.dataset.bad = '0';
      verdict.textContent = 'All six lines landed in the right bin. The verb is not the question; the DECISION is.';
      this.quill?.perform('hop');
      return { ok: true };
    }
    verdict.dataset.ok = '0';
    verdict.dataset.bad = '1';
    if (wrong >= 3) {
      verdict.textContent = `${wrong} of 6 are off. "Grow rice for the wedding" is FOR WHOM (the wedding gets the rice), not WHAT. "Hire paid workers" is HOW, not FOR WHOM.`;
    } else {
      verdict.textContent = `${wrong} of 6 are off. Ask: who is the OUTPUT for? That is FOR WHOM. Who is the TECHNIQUE? That is HOW. What is the GOOD? That is WHAT.`;
    }
    this.quill?.setExpression('surprised');
    return { ok: false, hint: verdict.textContent };
  }
}
