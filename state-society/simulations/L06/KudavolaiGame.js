// KudavolaiGame - blk-l06-s06. Two parts. Order the steps of the draw; then draw from the pot and
// put each name on a committee. The learner cannot pick a name. No family rule: not in the source.
// Control names: .step[data-i], .pot, .seat[data-c], Check my answer.
import { GameBoard, mountGame, onTap } from 'simulations/base/kit/GameFrame.js';
import { esc } from 'simulations/base/SimUi.js';

const STEPS = [
  'Write the names of eligible candidates on palm leaves',
  'Put the leaves in a large pot',
  'Gather the community, often at a temple',
  'A young child draws the leaves, one by one',
  'Divide those chosen into committees',
];
const SHOW = [2, 0, 4, 1, 3];    // the order the cards start in
const NAMES = ['Kumaran', 'Nila', 'Ravi', 'Devi', 'Siva', 'Malar'];
const COMM = [{ id: 'tank', label: 'Tank committee' }, { id: 'justice', label: 'Justice committee' }, { id: 'tax', label: 'Tax committee' }];
const SEATS = 2;

const CSS = `
.gm.kv { background: var(--sim-bg-deep); border-radius: 14px; }
.kv .steps { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 8px; }
.kv .step { background: var(--sim-bg-surface); border: var(--sim-border); border-radius: var(--sim-radius-lg); padding: 6px 8px; font-size: 15px; font-weight: 700; line-height: 1.2;
            display: flex; gap: 6px; align-items: center; text-align: left; }
.kv .num { flex: 0 0 26px; height: 26px; border-radius: 50%; display: grid; place-items: center; font-weight: 800; background: var(--sim-bg-deep); color: var(--sim-label-muted); }
.kv .step[data-done="1"] { border-color: var(--sim-good); }
.kv .step[data-done="1"] .num { background: var(--sim-good); color: var(--sim-bg-surface); }
.kv .step[data-shake="1"] { border-color: var(--sim-bad); }
.kv .draw[hidden] { display: none; }
.kv .potcol { display: flex; flex-direction: column; gap: 8px; }
.kv .potcol .gm-check { width: 100%; }
.kv .draw { display: grid; grid-template-columns: 170px minmax(0, 1fr); gap: 14px; align-items: stretch; }
.kv .pot { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; min-height: 84px; background: color-mix(in oklab, var(--sim-series-8) 26%, var(--sim-bg-surface));
           border: var(--sim-border); border-radius: var(--sim-radius-lg); font-weight: 800; font-size: 15px; padding: 6px; }
.kv .pot b { font: 700 20px/1.2 var(--sim-font-display); }
.kv .pot[aria-disabled="true"] { opacity: 0.6; }
.kv .comms { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; }
.kv .comm { background: var(--sim-bg-surface); border: var(--sim-border); border-radius: var(--sim-radius-lg); padding: 6px; display: flex; flex-direction: column; gap: 4px; min-height: 48px; }
.kv .comm[data-armed="1"] { border-color: var(--sim-accent); }
.kv .comm .lbl { font-weight: 800; font-size: 15px; text-align: center; }
.kv .slot { min-height: 30px; border-radius: var(--sim-radius-sm); border: calc(1.5px * var(--look-rim)) dashed var(--sim-stroke); display: grid; place-items: center; font-size: 15px; font-weight: 700; }
.kv .slot[data-on="1"] { border-style: solid; background: var(--sim-bg-deep); }
.sim-dom-root--portrait .kv .steps { grid-template-columns: minmax(0, 1fr); gap: 6px; }
.sim-dom-root--portrait .kv .draw { grid-template-columns: minmax(0, 1fr); gap: 8px; }
.sim-dom-root--portrait .kv .comms { grid-template-columns: minmax(0, 1fr); gap: 6px; }
.sim-dom-root--portrait .kv .comm { flex-direction: row; align-items: center; flex-wrap: wrap; }
.sim-dom-root--portrait .kv .comm .lbl { flex: 1 1 100%; text-align: left; }
.sim-dom-root--portrait .kv .slot { flex: 1 1 40%; }
`;

export class KudavolaiGame extends GameBoard {
  static ARIA_LABEL = 'A game: put the five steps of the kudavolai in order, then draw six names from the pot and place them on three committees.';
  static OBJECTIVE = { prompt: { en: 'Put the steps of the draw in order, then fill all three committees from the pot.' } };

  constructor(container, config) {
    super(container, config);
    this._next = 0;          // the next step to tap
    this._drawn = 0;         // leaves out of the pot
    this._held = null;       // the name in hand
    this._seats = { tank: [], justice: [], tax: [] };
    this._moved = false;
  }

  async setup() {
    await super.setup();
    mountGame(this, {
      check: { label: 'Check my answer', in: '.potcol' },
      css: CSS,
      html: `<div class="gm kv">
        <div class="gm-head"><p class="kicker">Run a village draw</p><h2>The ballot pot</h2><p class="sub" data-sub></p></div>
        <div class="steps">${SHOW.map((i) => `<div class="step tap" role="button" tabindex="0" data-i="${i}"><span class="num">?</span><span>${esc(STEPS[i])}</span></div>`).join('')}</div>
        <div class="draw" hidden>
          <div class="potcol"><div class="pot tap" role="button" tabindex="0"><b data-held>Tap the pot</b><span data-left></span></div></div>
          <div class="comms">${COMM.map((k) => `<div class="comm tap" role="button" tabindex="0" data-c="${k.id}"><span class="lbl">${k.label}</span>${'<span class="slot"></span>'.repeat(SEATS)}</div>`).join('')}</div>
        </div>
      </div>`,
    });
    this.root.querySelectorAll('.step').forEach((el) => onTap(el, () => this._step(el)));
    const pot = this.root.querySelector('.pot');
    if (pot) onTap(pot, () => this._draw());
    this.root.querySelectorAll('.comm').forEach((el) => onTap(el, () => this._place(el.dataset.c)));
    this._paint();
    this.quill?.speak('Tap the first step of the draw.', 5200);
  }

  _step(el) {
    this._moved = true;
    const i = Number(el.dataset.i);
    if (i === this._next) {
      el.dataset.done = '1'; el.dataset.shake = '0';
      el.querySelector('.num').textContent = String(i + 1);
      this._next += 1;
      if (this._next === STEPS.length) {
        this.root.querySelector('.steps').hidden = true;
        this.root.querySelector('.steps').style.display = 'none';
        this.root.querySelector('.draw').hidden = false;
        this.quill.speak('Now tap the pot.', 4000);
      }
    } else el.dataset.shake = '1';
    this._paint();
  }

  _draw() {
    if (this._next < STEPS.length || this._held || this._drawn >= NAMES.length) return;
    this._held = NAMES[this._drawn]; this._drawn += 1;
    this._paint();
  }

  _place(id) {
    if (!this._held || this._seats[id].length >= SEATS) return;
    this._seats[id].push(this._held);
    this._held = null;
    this._paint();
  }

  _paint() {
    const r = this.root;
    if (!r.querySelector('.pot')) return;
    const done = this._next === STEPS.length;
    r.querySelector('[data-sub]').textContent = !done ? `Tap the steps from first to last. Step ${this._next + 1} of ${STEPS.length}.`
      : this._held ? `Put ${this._held} on a committee.` : this._drawn < NAMES.length ? 'Tap the pot to draw the next leaf.' : 'All seats filled. Press Check.';
    r.querySelector('[data-held]').textContent = this._held ?? (this._drawn < NAMES.length ? 'Tap the pot' : 'Pot empty');
    r.querySelector('[data-left]').textContent = `${NAMES.length - this._drawn} of ${NAMES.length} leaves left`;
    r.querySelector('.pot').setAttribute('aria-disabled', this._drawn >= NAMES.length || this._held ? 'true' : 'false');
    r.querySelectorAll('.comm').forEach((el) => {
      const list = this._seats[el.dataset.c];
      el.dataset.armed = this._held && list.length < SEATS ? '1' : '0';
      el.querySelectorAll('.slot').forEach((s, i) => { s.textContent = list[i] ?? ''; s.dataset.on = list[i] ? '1' : '0'; });
    });
  }

  checkObjective() {
    if (!this._moved) return null;
    if (this._next < STEPS.length) return { ok: false, hint: 'Finish the steps of the draw first.' };
    const n = Object.values(this._seats).reduce((a, l) => a + l.length, 0);
    if (n < NAMES.length) return { ok: false, hint: 'Fill every committee seat from the pot.' };
    this.quill?.perform('hop');
    return { ok: true };
  }
}
