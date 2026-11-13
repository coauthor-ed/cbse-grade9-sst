import { DomSimulation } from 'simulations/base/DomSimulation.js';
import { withChallenge } from 'simulations/base/ChallengeMode.js';
import { SimMascotDom } from 'simulations/base/SimMascotDom.js';

/**
 * ChainOfChoiceGame - mini-game for les-09, hosted by mini-game@1.
 *
 * Tie level L3 (strategy). The lesson's load-bearing claim is that
 * the nine lessons form a CHAIN: each concept follows the last, and
 * a working understanding of economics is the chain in order, not a
 * bag of words. The text (blk-l09-s01) draws the chain:
 *
 *   wants x limits -> scarcity -> choice -> cost -> 3 questions ->
 *   systems -> mixes
 *
 * The number that is easy to gloss over is the ORDER. Opportunity
 * cost is the cost OF A CHOICE, so it must come AFTER scarcity and
 * AFTER choice. "Mixed economy" is a system, so it must come AFTER
 * the three questions, not before. A student who sorts the chain by
 * what sounds related misses what depends on what.
 *
 * The game makes the order the only way to win. 7 chips, each
 * representing one concept in the chain, must be placed in the
 * 7 slots in the right order. The win condition: every chip in its
 * numbered slot.
 *
 * Designed-in wrong attractor: sorting by concept type ("scarcity is
 * a problem, three questions is also a problem, so they go together"
 * - true but not the lesson's chain). The lesson's chain is
 * DEPENDENCY, not category. The student who sorts by category will
 * place opportunity cost before choice, which is the trap the hint
 * names.
 *
 * Built on DomSimulation rather than CanvasSimulation for the reason
 * the kit gives for new games: Quill is an SVG rig, so SimMascotDom
 * drops him straight into this.root with no canvas port, and every
 * colour is a live var(--sim-*) with no fallback table to go stale.
 */

const W = 900;
const H = 600;

// Correct chain order (slot 1..7).
const CHAIN = [
  { slot: 1, label: 'Wants meet limits',     key: 'wants' },
  { slot: 2, label: 'Scarcity',               key: 'scarcity' },
  { slot: 3, label: 'Choice',                 key: 'choice' },
  { slot: 4, label: 'Opportunity cost',       key: 'cost' },
  { slot: 5, label: 'Three economic questions', key: 'threeq' },
  { slot: 6, label: 'Economic systems',       key: 'systems' },
  { slot: 7, label: 'Mixed economies',        key: 'mix' },
];

const CSS = `
.coc { position: absolute; inset: 0; font-family: var(--sim-font); color: var(--sim-label); }
.coc .pad { position: absolute; inset: 0; padding: 22px 28px; box-sizing: border-box;
           display: flex; flex-direction: column; gap: 10px; }
.coc .kicker { font-size: 13px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase;
              color: var(--sim-label-muted); margin: 0; }
.coc h2 { font-family: var(--sim-font-display); font-size: 23px; font-weight: 700; margin: 0; line-height: 1.2; }
.coc h2 b { color: var(--sim-accent); }
.coc .slots { display: flex; flex-direction: column; gap: 6px; }
.coc .slot { display: grid; grid-template-columns: 32px 1fr 200px; align-items: center; gap: 10px; }
.coc .slot .n { font: 800 16px var(--sim-font); color: var(--sim-label-muted); text-align: right; }
.coc .slot .arrow { font: 800 14px var(--sim-font); color: var(--sim-label-muted); text-align: center; }
.coc .slot .drop { background: var(--sim-bg-surface); border: 2px dashed var(--sim-border);
                 border-radius: 10px; padding: 8px 12px; min-height: 38px; }
.coc .slot .drop[data-ok="1"] { border-color: var(--sim-success); border-style: solid; }
.coc .slot .drop[data-bad="1"] { border-color: var(--sim-error); border-style: solid; }
.coc .pool { display: flex; flex-wrap: wrap; gap: 8px; padding: 12px; min-height: 60px;
            border: 2px dashed var(--sim-border); border-radius: 12px; background: var(--sim-panel); }
.coc .chip { padding: 8px 14px; background: var(--sim-bg-surface); border: 2px solid var(--sim-border);
            border-radius: 999px; font-size: 14px; font-weight: 700; cursor: grab; user-select: none; }
.coc .chip:active { cursor: grabbing; }
.coc .verdict { font-size: 14px; padding: 8px 12px; border-radius: 10px; background: var(--sim-bg-surface);
              border: 2px solid var(--sim-border); margin: 0; }
.coc .verdict[data-ok="1"] { border-color: var(--sim-success); color: var(--sim-success); }
.coc .verdict[data-bad="1"] { border-color: var(--sim-error); color: var(--sim-error); }
`;

export class ChainOfChoiceGame extends withChallenge(DomSimulation) {
  static simId = 'chain-of-choice-game';
  static label = { en: 'Chain of Choice' };
  static category = 'social-science.economics';
  static WIDTH = W;
  static HEIGHT = H;
  static ARIA_LABEL =
    'Seven chips, seven slots. Each chip names a concept from the chapter. Place them in dependency order: wants meet limits, scarcity, choice, opportunity cost, three questions, systems, mixed economies.';
  static OBJECTIVE = {
    prompt: {
      en: 'Seven chips, seven slots. Sort the chapter into a CHAIN - what depends on what. The order is dependency, not category.',
    },
  };
  static SCORING = { mode: 'accuracy' };
  static CONTROLS = [];

  constructor(container, config) {
    super(container, config);
    this.slots = {};        // slot number -> chip key
    this._chips = CHAIN.slice();
  }

  async setup() {
    await super.setup();
    this.root.insertAdjacentHTML('beforeend', `
      <div class="coc">
        <div class="pad">
          <p class="kicker">The chain of choice - the chapter as a dependency tree</p>
          <h2>Place each chip in the slot where it <b>comes from</b>.</h2>
          <div class="slots">
            ${CHAIN.map((c, i) => `
              <div class="slot">
                <span class="n">${c.slot}.</span>
                <div class="drop" data-slot="${c.slot}"></div>
                <span class="arrow">${i < CHAIN.length - 1 ? 'leads to' : 'end of chain'}</span>
              </div>
            `).join('')}
          </div>
          <p class="pool" data-pool></p>
          <p class="verdict" data-verdict>Drop each chip into the slot where the concept first appears. The chain is dependency, not category.</p>
        </div>
      </div>
    `);

    this.quill = SimMascotDom.mount(this.root, { x: 250, y: 590, height: 100, bubbleSide: 'right' });
    this.injectStyle(CSS + SimMascotDom.styles());

    this._pool = this.root.querySelector('[data-pool]');
    this._drops = {};
    for (const c of CHAIN) this._drops[c.slot] = this.root.querySelector(`[data-slot="${c.slot}"]`);

    for (const d of Object.values(this._drops)) {
      d.addEventListener('dragover', (e) => e.preventDefault());
      d.addEventListener('drop', (e) => this._onDrop(e, d));
    }
    this._pool.addEventListener('dragover', (e) => e.preventDefault());
    this._pool.addEventListener('drop', (e) => this._onDrop(e, this._pool));

    for (const d of Object.values(this._drops)) {
      d.addEventListener('dblclick', (e) => {
        const chip = e.target.closest('.chip');
        if (chip) this._unplace(chip);
      });
    }

    this._render();
    this.quill.speak('What depends on what. Not what sounds like what.', 5200);
  }

  destroy() {
    this.quill?.destroy();
    this.quill = null;
    super.destroy();
  }

  _onDrop(e, target) {
    e.preventDefault();
    const key = e.dataTransfer.getData('text/plain');
    if (!key) return;
    // Remove from current slot if placed.
    for (const s of Object.keys(this.slots)) {
      if (this.slots[s] === key) delete this.slots[s];
    }
    if (target !== this._pool) {
      const slot = Number(target.dataset.slot);
      this.slots[slot] = key;
    }
    this._render();
  }

  _unplace(chipEl) {
    const key = chipEl.dataset.chip;
    for (const s of Object.keys(this.slots)) {
      if (this.slots[s] === key) delete this.slots[s];
    }
    this._render();
  }

  _render() {
    this._pool.innerHTML = '';
    for (const c of CHAIN) {
      const placed = Object.values(this.slots).includes(c.key);
      if (!placed) {
        const chip = document.createElement('div');
        chip.className = 'chip';
        chip.draggable = true;
        chip.dataset.chip = c.key;
        chip.textContent = c.label;
        chip.addEventListener('dragstart', (e) => e.dataTransfer.setData('text/plain', c.key));
        this._pool.appendChild(chip);
      }
    }
    for (const s of Object.keys(this._drops)) {
      const d = this._drops[s];
      d.innerHTML = '';
      const key = this.slots[s];
      if (key) {
        const c = CHAIN.find((x) => x.key === key);
        const chip = document.createElement('div');
        chip.className = 'chip';
        chip.dataset.chip = key;
        chip.textContent = c.label;
        d.appendChild(chip);
      }
    }
  }

  checkObjective() {
    if (Object.keys(this.slots).length < CHAIN.length) return null;
    let wrong = 0;
    for (const c of CHAIN) {
      const placed = this.slots[c.slot];
      const el = this._drops[c.slot];
      if (placed === c.key) { el.dataset.ok = '1'; el.dataset.bad = '0'; }
      else { el.dataset.ok = '0'; el.dataset.bad = '1'; wrong += 1; }
    }
    const verdict = this.root.querySelector('[data-verdict]');
    if (wrong === 0) {
      verdict.dataset.ok = '1';
      verdict.dataset.bad = '0';
      verdict.textContent = 'The chain is in dependency order. Opportunity cost is the cost OF a choice; three questions come AFTER the choice; mixed economies are a system. The whole chapter now reads as one story.';
      this.quill?.perform('hop');
      return { ok: true };
    }
    verdict.dataset.ok = '0';
    verdict.dataset.bad = '1';
    if (wrong >= 3) {
      verdict.textContent = `${wrong} of 7 are off. The chain is dependency, not category. Opportunity cost is the cost OF a choice - it must come AFTER choice. Three questions are a question ABOUT systems - they come BEFORE.`;
    } else {
      verdict.textContent = `${wrong} of 7 are off. Ask: what does this concept DEPEND on? It comes AFTER. The chain reads each step from the last.`;
    }
    this.quill?.setExpression('surprised');
    return { ok: false, hint: verdict.textContent };
  }
}
