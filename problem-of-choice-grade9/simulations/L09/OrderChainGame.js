// OrderChainGame - L09 game "Order the chain". The chapter's seven ideas (the same chain as the "One Chain" slide):
// wants meet limits -> scarcity -> choice -> opportunity cost -> three key questions -> economic systems -> mixed
// economies. Tap an idea in the tray, then tap a numbered place in the chain; tap a filled place to take its idea
// back. The tray is shuffled on each load (Math.random). Check is the frame's own button; a wrong chain names the
// first wrong place and a one-line reason for what belongs there. Replaces ChainOfChoiceGame (kept, unused). ASCII only.
import { GameBoard, mountGame, onTap } from 'simulations/base/kit/GameFrame.js';
import { shuffle } from 'simulations/base/kit/shuffle.js';

const CHAIN = [
  { id: 'wants', label: 'Wants meet limits', why: 'the chain starts when unlimited wants meet limited resources' },
  { id: 'scarcity', label: 'Scarcity', why: 'when wants meet limits, the result is scarcity' },
  { id: 'choice', label: 'Choice', why: 'scarcity forces us to choose' },
  { id: 'cost', label: 'Opportunity cost', why: 'opportunity cost is the cost of a choice, so it comes after choice' },
  { id: 'three', label: 'Three key questions', why: 'for a whole economy, choices become the three key questions' },
  { id: 'systems', label: 'Economic systems', why: 'economic systems are the ways of answering the three questions' },
  { id: 'mixed', label: 'Mixed economies', why: 'most economies mix the systems, so this comes last' },
];

const CSS = `
.gm.oc { background: var(--sim-bg-deep); border-radius: 14px; }
.oc .oc-tray { display: flex; flex-wrap: wrap; gap: 10px; }
.oc .oc-chip { min-height: 48px; padding: 6px 16px; border-radius: var(--look-pill, 999px); background: var(--sim-bg-surface);
  border: var(--sim-border); font-size: 17px; font-weight: 800; }
.oc .oc-chip[aria-pressed="true"] { outline: 3px solid var(--sim-accent); outline-offset: 1px;
  background: color-mix(in oklab, var(--sim-accent) 14%, var(--sim-bg-surface)); }
.oc .oc-chip[data-placed="1"] { opacity: 0.45; border-style: dashed; }
.oc .oc-chain { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 22px; margin-top: 6px; margin-right: 200px; }
.oc .oc-slot { position: relative; min-height: 96px; padding: 6px 6px 8px; border-radius: var(--sim-radius-lg);
  background: var(--sim-bg-surface); border: var(--sim-border-width, 2px) dashed var(--sim-stroke); box-shadow: none;
  display: flex; flex-direction: column; align-items: center; justify-content: flex-start; gap: 4px; text-align: center; }
.oc .oc-slot:active { transform: none; box-shadow: none; }
.oc .oc-slot[data-armed="1"] { border-color: var(--sim-accent); }
.oc .oc-slot[data-full="1"] { border-style: solid; }
.oc .oc-slot[data-good="1"] { border-color: var(--sim-good); }
.oc .oc-slot[data-bad="1"] { border-color: var(--sim-bad); }
.oc .oc-n { font: 800 15px/1 var(--sim-font); color: var(--sim-label-muted); }
.oc .oc-in { font-size: 16px; font-weight: 800; line-height: 1.2; color: var(--sim-label); }
.oc .oc-slot:not(:last-child)::after { content: ''; position: absolute; top: 50%; right: -19px; width: 0; height: 0;
  border-top: 8px solid transparent; border-bottom: 8px solid transparent; border-left: 12px solid var(--sim-label-muted);
  transform: translateY(-50%); }
.sim-dom-root--portrait .oc .gm-head { padding-right: 60px; }
.sim-dom-root--portrait .oc .oc-tray { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
.sim-dom-root--portrait .oc .oc-chip { font-size: 15px; padding: 4px 8px; }
.sim-dom-root--portrait .oc .oc-chain { grid-template-columns: minmax(0, 1fr); gap: 14px; margin-right: 0; }
.sim-dom-root--portrait .oc .oc-slot { min-height: 48px; flex-direction: row; justify-content: flex-start; gap: 10px; padding: 4px 12px; }
.sim-dom-root--portrait .oc .oc-in { font-size: 15px; }
.sim-dom-root--portrait .oc .oc-slot:not(:last-child)::after { top: auto; bottom: -13px; right: auto; left: 50%;
  border-left: 8px solid transparent; border-right: 8px solid transparent; border-top: 10px solid var(--sim-label-muted);
  border-bottom: 0; transform: translateX(-50%); }
`;

export class OrderChainGame extends GameBoard {
  static HEIGHT = 405;
  static PORTRAIT_HEIGHT = 820;
  static CONTINUOUS = false;
  static OBJECTIVE = { prompt: { en: 'Put the seven ideas in order, so that each one leads to the next.' } };
  static ARIA_LABEL = 'A chain of seven numbered places. Tap an idea, then tap a place in the chain. Put the ideas of the chapter in order, from wants meeting limits to mixed economies.';

  constructor(container, config) {
    super(container, config);
    this.slots = new Array(CHAIN.length).fill(null);   // slot index -> idea id
    this._active = null;
    this._moved = false;
    this._tray = shuffle(CHAIN.slice());
  }

  async setup() {
    await super.setup();
    mountGame(this, {
      css: CSS,
      html: `<div class="gm oc">
        <div class="gm-head"><p class="kicker">The whole chapter</p><h2>Order the chain</h2>
          <p class="sub">Tap an idea, then tap its place. Each idea leads to the next.</p></div>
        <div class="oc-tray">${this._tray.map((c) => `<button type="button" class="tap btn oc-chip" data-id="${c.id}" aria-pressed="false">${c.label}</button>`).join('')}</div>
        <div class="oc-chain">${CHAIN.map((_, i) => `<div class="tap oc-slot" role="button" tabindex="0" data-i="${i}"><span class="oc-n">${i + 1}</span><span class="oc-in"></span></div>`).join('')}</div>
      </div>`,
    });
    this.root.querySelectorAll('.oc-chip').forEach((el) => onTap(el, () => this._tapChip(el.dataset.id)));
    this.root.querySelectorAll('.oc-slot').forEach((el) => onTap(el, () => this._tapSlot(Number(el.dataset.i))));
    this._render();
    this.quill?.speak('What has to come first?', 5200);
  }

  _tapChip(id) {
    const at = this.slots.indexOf(id);
    if (at >= 0) this.slots[at] = null;     // a placed idea comes back and is picked up again
    this._active = this._active === id && at < 0 ? null : id;
    this._moved = true;
    this._render();
  }

  _tapSlot(i) {
    if (this._active === null) {
      if (this.slots[i]) { this.slots[i] = null; this._moved = true; this._render(); }
      return;
    }
    const prev = this.slots.indexOf(this._active);
    if (prev >= 0) this.slots[prev] = null;
    this.slots[i] = this._active;
    this._active = null;
    this._render();
  }

  _render() {
    if (!this.root?.querySelector?.('.oc-slot')) return;   // the headless check has no HTML parser
    const full = this.slots.every(Boolean);
    this.root.querySelectorAll('.oc-chip').forEach((el) => {
      el.dataset.placed = this.slots.includes(el.dataset.id) ? '1' : '0';
      el.setAttribute('aria-pressed', el.dataset.id === this._active ? 'true' : 'false');
    });
    this.root.querySelectorAll('.oc-slot').forEach((el) => {
      const i = Number(el.dataset.i), id = this.slots[i], c = CHAIN.find((x) => x.id === id);
      el.querySelector('.oc-in').textContent = c ? c.label : '';
      el.dataset.full = c ? '1' : '0';
      el.dataset.armed = this._active !== null ? '1' : '0';
      el.dataset.good = full && id === CHAIN[i].id ? '1' : '0';
      el.dataset.bad = full && id !== CHAIN[i].id ? '1' : '0';
      el.setAttribute('aria-label', `Place ${i + 1}: ${c ? c.label : 'empty'}`);
    });
  }

  checkObjective() {
    if (!this._moved || !this.slots.every(Boolean)) return null;
    const bad = CHAIN.findIndex((c, i) => this.slots[i] !== c.id);
    if (bad < 0) {
      this.quill?.perform('hop');
      return { ok: true };
    }
    this.quill?.setExpression('surprised');
    return { ok: false, hint: `Place ${bad + 1} is not right yet: ${CHAIN[bad].why}.` };
  }
}
