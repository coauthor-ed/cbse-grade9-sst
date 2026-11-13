import { DomSimulation } from 'simulations/base/DomSimulation.js';
import { withChallenge } from 'simulations/base/ChallengeMode.js';
import { SimMascotDom } from 'simulations/base/SimMascotDom.js';

/**
 * SortTheShelvesGame - mini-game for les-01, hosted by mini-game@1.
 *
 * Tie level L2 (embodiment). The lesson's load-bearing claim is that needs and
 * wants look alike when they are sitting in the same pile - both can be shiny,
 * both can be expensive, both feel necessary in the moment. A student who
 * reads the words without thinking about the situation will sort a phone
 * charger (need: power, so I can call for help) as a want and a perfume
 * bottle (want: it smells nice) as a need.
 *
 * The game makes the situation the only test that matters. 6 chips, each
 * tagged with a short situation line, must be dropped into either the NEEDS
 * shelf or the WANTS shelf. The chips and the situations are pinned: "Air
 * during the asthma attack" is a need; "a second car" is a want. The
 * attractor is sorting by how modern or premium the object looks - putting
 * the asthma inhaler on the wants shelf because it is bought at a chemist,
 * or putting the second car on the needs shelf because "every house has
 * one". The traps that matter: the line "Every home has a car" sitting on
 * a "want" chip, the line "A second car" sitting on a need; the inhaler is
 * the "need" chip while the perfume is the "want" chip despite both
 * looking like personal items.
 *
 * Built on DomSimulation rather than CanvasSimulation for the reason the kit
 * gives for new games: Quill is an SVG rig, so SimMascotDom drops him
 * straight into this.root with no canvas port, and every colour is a live
 * var(--sim-*) with no fallback table to go stale.
 */

const W = 900;
const H = 600;

const CHIPS = [
  { id: 'asthma',  label: 'Inhaler for asthma attack',  correctShelf: 'need' },
  { id: 'perfume', label: 'Bottle of perfume',          correctShelf: 'want' },
  { id: 'secondcar', label: 'A second family car',      correctShelf: 'want' },
  { id: 'rice',    label: 'Rice for the week\'s meals', correctShelf: 'need' },
  { id: 'gym',     label: 'Yearly gym membership',      correctShelf: 'want' },
  { id: 'doctor',  label: 'Visit to the doctor',        correctShelf: 'need' },
];

const CSS = `
.sts { position: absolute; inset: 0; font-family: var(--sim-font); color: var(--sim-label);
       display: flex; flex-direction: column; gap: 12px; padding: 22px 28px; box-sizing: border-box; }
.sts .kicker { font-size: 13px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase;
              color: var(--sim-label-muted); margin: 0; }
.sts h2 { font-family: var(--sim-font-display); font-size: 24px; font-weight: 700; margin: 0; line-height: 1.2; }
.sts h2 b { color: var(--sim-accent); }
.sts .pool { display: flex; flex-wrap: wrap; gap: 8px; padding: 12px; min-height: 60px;
            border: 2px dashed var(--sim-border); border-radius: 12px; background: var(--sim-panel); }
.sts .chip { padding: 8px 14px; background: var(--sim-bg-surface); border: 2px solid var(--sim-border);
            border-radius: 999px; font-size: 14px; font-weight: 700; cursor: grab; user-select: none; }
.sts .chip:active { cursor: grabbing; }
.sts .chip[data-placed="1"] { opacity: 0.5; cursor: default; }
.sts .shelves { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; flex: 1; min-height: 0; }
.sts .shelf { border: 3px dashed var(--sim-border); border-radius: 14px; padding: 14px;
             background: var(--sim-bg-surface); display: flex; flex-direction: column; gap: 8px; }
.sts .shelf[data-ok="1"] { border-color: var(--sim-success); }
.sts .shelf[data-bad="1"] { border-color: var(--sim-error); }
.sts .shelf .shname { font-size: 16px; font-weight: 800; margin: 0; }
.sts .shelf[data-shelf="need"] .shname { color: var(--sim-series-1); }
.sts .shelf[data-shelf="want"] .shname { color: var(--sim-series-2); }
.sts .shelf .slot { min-height: 56px; display: flex; flex-wrap: wrap; gap: 6px; align-content: flex-start; }
.sts .foot { font-size: 13px; color: var(--sim-label-muted); margin: 0; }
`;

export class SortTheShelvesGame extends withChallenge(DomSimulation) {
  static simId = 'sort-the-shelves-game';
  static label = { en: 'Sort the Shelves' };
  static category = 'social-science.economics';
  static WIDTH = W;
  static HEIGHT = H;
  static ARIA_LABEL =
    'Six life situations, each on a chip. Drag every chip into the NEEDS shelf or the WANTS shelf. The same object can be either; what matters is the situation in the line.';
  static OBJECTIVE = {
    prompt: {
      en: 'Six situations. Two shelves. The same object can be a need in one life and a want in another - sort by the situation, not the object.',
    },
  };
  static SCORING = { mode: 'accuracy' };
  static CONTROLS = [];

  constructor(container, config) {
    super(container, config);
    this.placed = { need: [], want: [] };
  }

  async setup() {
    await super.setup();
    this.root.insertAdjacentHTML('beforeend', `
      <div class="sts">
        <p class="kicker">Needs vs wants - sort by situation</p>
        <h2>Same object, <b>different lives.</b></h2>
        <div class="pool" data-pool>
          ${CHIPS.map((c) => `<div class="chip" draggable="true" data-chip="${c.id}">${c.label}</div>`).join('')}
        </div>
        <div class="shelves">
          <div class="shelf" data-shelf="need">
            <p class="shname">NEEDS</p>
            <div class="slot" data-slot="need"></div>
          </div>
          <div class="shelf" data-shelf="want">
            <p class="shname">WANTS</p>
            <div class="slot" data-slot="want"></div>
          </div>
        </div>
        <p class="foot">Drop each chip where it belongs. Double-click a placed chip to put it back in the pool.</p>
      </div>
    `);

    this.quill = SimMascotDom.mount(this.root, { x: 250, y: 590, height: 100, bubbleSide: 'right' });
    this.injectStyle(CSS + SimMascotDom.styles());

    this._pool = this.root.querySelector('[data-pool]');
    this._slots = {
      need: this.root.querySelector('[data-slot="need"]'),
      want: this.root.querySelector('[data-slot="want"]'),
    };

    for (const chip of this.root.querySelectorAll('.chip')) {
      chip.addEventListener('dragstart', (e) => e.dataTransfer.setData('text/plain', chip.dataset.chip));
    }
    for (const shelf of [this._pool, this._slots.need, this._slots.want]) {
      shelf.addEventListener('dragover', (e) => e.preventDefault());
      shelf.addEventListener('drop', (e) => this._onDrop(e, shelf));
    }
    for (const slot of Object.values(this._slots)) {
      slot.addEventListener('dblclick', (e) => {
        const chip = e.target.closest('.chip');
        if (chip) this._unplace(chip);
      });
    }

    this.quill.speak('A second car. A doctor visit. Same price, different shelf.', 5200);
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
    // Move: remove from current location first.
    const fromShelf = this._shelvesContaining(id);
    if (fromShelf) {
      this.placed[fromShelf] = this.placed[fromShelf].filter((x) => x !== id);
    }
    if (target === this._pool) {
      // return to pool
    } else {
      const toShelf = target.dataset.slot;
      this.placed[toShelf] = [...this.placed[toShelf], id];
    }
    this._render();
  }

  _shelvesContaining(id) {
    if (this.placed.need.includes(id)) return 'need';
    if (this.placed.want.includes(id)) return 'want';
    return null;
  }

  _unplace(chipEl) {
    const id = chipEl.dataset.chip;
    const fromShelf = this._shelvesContaining(id);
    if (fromShelf) this.placed[fromShelf] = this.placed[fromShelf].filter((x) => x !== id);
    this._render();
  }

  _render() {
    this._pool.innerHTML = '';
    for (const c of CHIPS) {
      const inNeed = this.placed.need.includes(c.id);
      const inWant = this.placed.want.includes(c.id);
      if (!inNeed && !inWant) {
        const chip = document.createElement('div');
        chip.className = 'chip';
        chip.draggable = true;
        chip.dataset.chip = c.id;
        chip.textContent = c.label;
        chip.addEventListener('dragstart', (e) => e.dataTransfer.setData('text/plain', c.id));
        this._pool.appendChild(chip);
      }
    }
    for (const shelf of ['need', 'want']) {
      const slot = this._slots[shelf];
      slot.innerHTML = '';
      for (const id of this.placed[shelf]) {
        const c = CHIPS.find((x) => x.id === id);
        const chip = document.createElement('div');
        chip.className = 'chip';
        chip.dataset.chip = id;
        chip.dataset.placed = '1';
        chip.textContent = c.label;
        slot.appendChild(chip);
      }
    }
  }

  checkObjective() {
    if (this.placed.need.length + this.placed.want.length < CHIPS.length) return null;
    let wrong = 0;
    for (const c of CHIPS) {
      const inNeed = this.placed.need.includes(c.id);
      const inWant = this.placed.want.includes(c.id);
      const correct = (c.correctShelf === 'need' && inNeed) || (c.correctShelf === 'want' && inWant);
      if (!correct) wrong += 1;
    }
    if (wrong === 0) {
      this.quill?.perform('hop');
      for (const s of ['need', 'want']) this.root.querySelector(`[data-shelf="${s}"]`).dataset.ok = '1';
      return { ok: true };
    }
    this.quill?.setExpression('surprised');
    for (const s of ['need', 'want']) this.root.querySelector(`[data-shelf="${s}"]`).dataset.bad = '1';
    return {
      ok: false,
      hint: wrong >= 4
        ? 'Sort by the situation, not the object. The same inhaler is a need in an asthma attack; the same second car is a want, not a need, even though every neighbour has one.'
        : `${wrong} of 6 are on the wrong shelf. Read the line on the chip - that is the situation, and the situation is what makes it a need or a want.`,
    };
  }
}
