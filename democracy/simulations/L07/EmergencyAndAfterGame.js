// EmergencyAndAfterGame - blk-l07-game. Seven events from the early 1970s to 1977, in the book's
// order. Tap a card to add it to the list; tap a placed card to send it back. Check marks the first
// card out of order and says why. Neutral: no adjectives beyond the book, no party, no person.
// The tray starts in a fixed mixed order, which is never the answer.
// Control names: .ev[data-id] (tray), .pl[data-id] (placed), button .gm-check.
import { GameBoard, mountGame, onTap } from 'simulations/base/kit/GameFrame.js';
import { esc } from 'simulations/base/SimUi.js';

const EVENTS = [
  { id: 'causes', text: 'Unemployment and inflation rise', why: 'These came first: they led to the protests.' },
  { id: 'protests', text: 'Widespread protests', why: 'Protests grew in the early 1970s, before the Emergency.' },
  { id: 'imposed', text: 'National Emergency imposed', why: 'The Emergency was imposed in June 1975, after the protests.' },
  { id: 'rights', text: 'Rights suspended, press censored', why: 'This happened during the Emergency, so after it was imposed.' },
  { id: 'lifted', text: 'Emergency lifted', why: 'It was lifted in 1977, before the elections.' },
  { id: 'elections', text: 'General elections held', why: 'Elections were held after the Emergency was lifted.' },
  { id: 'defeat', text: 'Ruling government defeated', why: 'This was the result of the elections, so it comes last.' },
];
const MIXED = ['lifted', 'protests', 'defeat', 'imposed', 'causes', 'elections', 'rights'];

const CSS = `
.gm.eg { background: var(--sim-bg-deep); border-radius: 14px; padding: 8px 16px 10px; gap: 6px; }
.eg .kicker { display: none; }
.eg .gm-head { display: flex; align-items: baseline; gap: 14px; max-width: none; padding-right: 70px; }
.eg .gm-head h2 { font-size: 22px; margin: 0; white-space: nowrap; }
.eg .gm-head .sub { margin: 0; }
.eg .board { display: flex; flex-direction: column; gap: 8px; min-height: 0; padding-right: 58px; }   /* Quill's corner */
.eg .col { display: flex; flex-direction: column; gap: 5px; min-width: 0; }
.eg .tray, .eg .list { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 6px; }
.eg .tray { min-height: 94px; align-content: start; }
.eg .col h3 { display: none; margin: 0; font-size: 15px; font-weight: 800; color: var(--sim-label-muted); }
.eg .ev, .eg .pl { display: flex; align-items: center; gap: 8px; width: 100%; min-height: 44px; padding: 3px 10px; text-align: left; font-size: 15px; font-weight: 700; line-height: 1.15;
  background: var(--sim-bg-surface); border: var(--sim-border); border-radius: var(--sim-radius-md); }
.eg .pl .n { flex: none; width: 26px; height: 26px; border-radius: 50%; display: grid; place-items: center; font: 700 15px var(--sim-font-display); background: var(--sim-track); }
.eg .pl[data-state="good"] { border-color: var(--sim-good); }
.eg .pl[data-state="bad"] { border-color: var(--sim-warning); }
.eg .slot { min-height: 44px; display: flex; align-items: center; gap: 8px; padding: 3px 10px; border: 2px dashed var(--sim-stroke); border-radius: var(--sim-radius-md); color: var(--sim-label-muted); font-weight: 700; font-size: 15px; }
.eg .slot .n { flex: none; width: 26px; text-align: center; }
.eg .tap { min-height: 44px; }
.eg .foot { display: flex; align-items: center; gap: 12px; min-height: 50px; }
.eg .foot .gm-check { flex: none; margin: 0; }
.eg .why { flex: 1; margin: 0; font-size: 15px; font-weight: 700; line-height: 1.25; }
.sim-dom-root--portrait .gm.eg { padding: 4px 4px 8px; }
.sim-dom-root--portrait .eg .gm-head { display: block; padding-right: 58px; }
.sim-dom-root--portrait .eg .sub { display: none; }
.sim-dom-root--portrait .eg .col h3 { display: block; }
.sim-dom-root--portrait .eg .board { gap: 8px; padding-right: 0; }
.sim-dom-root--portrait .eg .tray, .sim-dom-root--portrait .eg .list { grid-template-columns: minmax(0, 1fr); gap: 5px; min-height: 0; }
.sim-dom-root--portrait .eg .slot { display: none; }
.sim-dom-root--portrait .eg .slot--next { display: flex; }
.sim-dom-root--portrait .eg .col--tray { order: 2; }
.sim-dom-root--portrait .eg .foot { flex-direction: column; align-items: stretch; }
`;

export class EmergencyAndAfterGame extends GameBoard {
  static ARIA_LABEL = 'A game: seven events from the early 1970s to 1977. Tap each card in the order in which it happened, then check the list.';
  static OBJECTIVE = { prompt: { en: 'Put the seven events in the order in which they happened.' } };

  constructor(container, config) { super(container, config); this._list = []; this._marked = null; this._moved = false; }

  async setup() {
    await super.setup();
    mountGame(this, {
      check: { label: 'Check my order', in: '.foot' },
      css: CSS,
      html: `<div class="gm eg">
        <div class="gm-head"><p class="kicker">In order</p><h2>The Emergency and after</h2><p class="sub">Tap the events in the order in which they happened.</p></div>
        <div class="board">
          <div class="col col--tray"><h3>Events</h3><div class="tray"></div></div>
          <div class="col"><h3>Your order</h3><div class="list"></div></div>
        </div>
        <div class="foot"><p class="why" aria-live="polite"></p></div>
      </div>`,
    });
    this._paint();
  }

  _paint() {
    const tray = this.root.querySelector('.tray'), list = this.root.querySelector('.list');
    if (!tray || !list) return;
    const free = MIXED.filter((id) => !this._list.includes(id));
    tray.innerHTML = free.map((id) => `<button type="button" class="ev tap" data-id="${id}">${esc(EVENTS.find((e) => e.id === id).text)}</button>`).join('');
    const placed = this._list.map((id, i) => {
      const state = this._marked == null ? '' : i < this._marked ? 'good' : i === this._marked ? 'bad' : '';
      return `<button type="button" class="pl tap" data-id="${id}" data-state="${state}"><span class="n">${i + 1}</span>${esc(EVENTS.find((e) => e.id === id).text)}</button>`;
    });
    const slots = [];
    for (let i = this._list.length; i < EVENTS.length; i++) slots.push(`<div class="slot${i === this._list.length ? ' slot--next' : ''}"><span class="n">${i + 1}</span></div>`);
    list.innerHTML = placed.join('') + slots.join('');
    tray.querySelectorAll('.ev').forEach((el) => onTap(el, () => this._add(el.dataset.id)));
    list.querySelectorAll('.pl').forEach((el) => onTap(el, () => this._back(el.dataset.id)));
  }

  _add(id) { this._list.push(id); this._moved = true; this._marked = null; this._say(''); this._paint(); }
  _back(id) { this._list = this._list.filter((x) => x !== id); this._marked = null; this._say(''); this._paint(); }
  _say(t) { const w = this.root.querySelector('.why'); if (w) w.textContent = t; }

  checkObjective() {
    if (this._list.length < EVENTS.length) return null;
    const bad = EVENTS.findIndex((e, i) => this._list[i] !== e.id);
    if (bad < 0) { this._marked = EVENTS.length; this._paint(); this._say('That is the order in which they happened.'); this.quill?.perform('hop'); return { ok: true }; }
    this._marked = bad; this._paint();
    const card = EVENTS.find((e) => e.id === this._list[bad]);
    this._say(card.why);
    this.quill?.setExpression('surprised');
    return { ok: false, hint: `Look at card ${bad + 1}. ${card.why}` };
  }

  resetChallenge() { super.resetChallenge(); this._list = []; this._marked = null; this._moved = false; this._say(''); this._paint(); }
}
