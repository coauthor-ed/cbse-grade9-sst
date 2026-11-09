// TraceTheColumnScene ("Label the column") - the book's question 2: a labelled diagram of the atmosphere.
// Part one: put the 5 layers and 3 pauses on a drawn column. Part two: put 6 things in their layers.
// Tap a tag, then tap a place. A wrong place gets a true line and the tag stays in hand. No timer.
// Control names: .tag[data-t], .slot[data-s]. Ends through finishGame.
import { GameBoard, mountGame, onTap, finishGame } from 'simulations/base/kit/GameFrame.js';
import { esc } from 'simulations/base/SimUi.js';

const SLOTS = [
  { id: 'exo', kind: 'band', name: 'Exosphere', tone: 4, km: 'the top' },
  { id: 'thermo', kind: 'band', name: 'Thermosphere', tone: 8, km: '80 to 700 km' },
  { id: 'mesopause', kind: 'line', name: 'Mesopause', km: '80 km' },
  { id: 'meso', kind: 'band', name: 'Mesosphere', tone: 5, km: '50 to 80 km' },
  { id: 'stratopause', kind: 'line', name: 'Stratopause', km: '50 km' },
  { id: 'strato', kind: 'band', name: 'Stratosphere', tone: 7, km: '12 to 50 km' },
  { id: 'tropopause', kind: 'line', name: 'Tropopause', km: '12 km' },
  { id: 'tropo', kind: 'band', name: 'Troposphere', tone: 1, km: '0 to 12 km' },
];
const THINGS = [
  { id: 'clouds', name: 'Clouds', in: 'tropo', why: 'Clouds and rain stay in the lowest layer.' },
  { id: 'aeroplane', name: 'Aeroplane', in: 'strato', why: 'Aeroplanes fly in the clear air above the weather.' },
  { id: 'ozone', name: 'Ozone layer', in: 'strato', why: 'The ozone layer is in the layer above the weather.' },
  { id: 'meteors', name: 'Meteors', in: 'meso', why: 'Most meteors burn up between 50 and 80 km.' },
  { id: 'aurora', name: 'Aurora', in: 'thermo', why: 'Auroras occur above 80 km.' },
  { id: 'satellite', name: 'Satellite', in: 'thermo', why: 'Many satellites orbit above 80 km, in this layer.' },
];
const WHY = { exo: 'The uppermost layer goes at the very top.', thermo: 'This layer runs from 80 to 700 km.', meso: 'This layer runs from 50 to 80 km.', strato: 'This layer runs from 12 to 50 km.', tropo: 'This is the lowest layer, up to about 12 km.',
  tropopause: 'This thin zone sits on top of the lowest layer.', stratopause: 'This boundary is at about 50 km.', mesopause: 'This boundary is at about 80 km.' };
const MIX = ['stratopause', 'thermo', 'tropo', 'mesopause', 'exo', 'strato', 'tropopause', 'meso'];

const CSS = `
.gm.tc { background: var(--sim-bg-deep); border-radius: 14px; padding: 8px 16px; gap: 6px; }
.tc .play { display: grid; grid-template-columns: 420px minmax(0, 1fr); gap: 16px; min-height: 0; flex: 1; }
.tc .col { display: flex; flex-direction: column; gap: 2px; border-radius: var(--sim-radius-lg); overflow: hidden; border: var(--sim-border); background: linear-gradient(0deg, var(--sim-ice), var(--sim-sky-day) 22%, var(--sim-sea-deep) 66%, color-mix(in oklab, var(--sim-sea-deep) 40%, black)); }
.tc .slot { position: relative; display: flex; align-items: center; justify-content: space-between; gap: 8px; min-height: 36px; padding: 1px 10px; border: 0; background: transparent; font-weight: 800; font-size: 15px; box-shadow: none; }
.tc .slot[data-k="line"] { min-height: 22px; }
.sim-dom-root--portrait .tc .slot, .sim-dom-root--portrait .tc .slot[data-k="line"] { min-height: 44px; }
.tc .gm-head { display: flex; gap: 12px; align-items: baseline; }
.sim-dom-root--portrait .tc .gm-head { display: block; }
.tc .slot .km { white-space: nowrap; }
.sim-dom-root--portrait .tc .slot[data-full="1"] .km { display: none; }
.tc .slot[data-k="line"]::before { content: ''; position: absolute; left: 0; right: 0; top: 50%; border-top: 3px dashed var(--sim-elev-peak); opacity: 0.7; }
.tc .slot .lab, .tc .slot .km { position: relative; border-radius: 9px; padding: 1px 8px; background: var(--sim-bg-surface); }
.tc .slot .lab { color: var(--sim-label); min-height: 22px; }
.tc .slot > .lab:empty { width: 130px; background: color-mix(in oklab, var(--sim-bg-surface) 30%, transparent); border: 2px dashed var(--sim-elev-peak); }
.tc .has:empty { display: none; }
.tc .has .lab { background: var(--sim-bg-surface); }
.tc .slot .km { color: var(--sim-label-muted); font-size: 14px; }
.tc .slot[data-on="1"] .lab { background: var(--sim-bg-surface); outline: 2px solid var(--sim-good); }
.tc .slot .has { display: inline-flex; gap: 4px; flex-wrap: wrap; font-size: 14px; }
.tc[data-armed="1"] .slot { cursor: pointer; }
.tc .side { display: flex; flex-direction: column; gap: 8px; min-width: 0; }
.tc .tray { display: flex; flex-wrap: wrap; gap: 6px; align-content: flex-start; }
.tc .tag { display: inline-flex; align-items: center; min-height: 44px; padding: 4px 12px; border: var(--sim-border); border-radius: var(--look-pill); background: var(--sim-bg-surface); font-size: 15px; font-weight: 800; }
.tc .tag[data-sel="1"] { border-color: var(--sim-accent); background: color-mix(in oklab, var(--sim-accent) 26%, var(--sim-bg-surface)); }
.tc .why { min-height: 40px; margin: 0; font-size: 15px; font-weight: 700; line-height: 1.3; }
.tc .why[data-k="bad"] { color: var(--sim-bad); }
.tc .why[data-k="good"] { color: var(--sim-series-3-ink); }
.sim-dom-root--portrait .tc .play { grid-template-columns: minmax(0, 1fr); gap: 8px; }
.sim-dom-root--portrait .tc .side { order: -1; }
.sim-dom-root--portrait .tc .why { min-height: 38px; }
.sim-dom-root--portrait .tc .tray { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); }
.sim-dom-root--portrait .tc .tag { justify-content: center; }
.sim-dom-root--portrait .tc .tag:nth-of-type(n+5) { display: none; }
`;

export class TraceTheColumnScene extends GameBoard {
  static ARIA_LABEL = 'A game: label a drawn column of the atmosphere. Put the five layers and three pauses in place, then put clouds, an aeroplane, ozone, meteors, an aurora and a satellite in their layers.';
  static OBJECTIVE = { prompt: { en: 'Tap a label, then tap its place on the column.' } };
  static HEIGHT = 335;

  constructor(container, config) {
    super(container, config);
    this._placed = {};  // slot id -> true (part one)
    this._things = {};  // thing id -> slot id (part two)
    this._sel = null;
    this._part = 1;
  }

  async setup() {
    await super.setup();
    mountGame(this, {
      check: false,
      css: CSS,
      html: `<div class="gm tc">
        <div class="gm-head"><h2>Label the column</h2><p class="sub" data-sub></p></div>
        <div class="play">
          <div class="col">${SLOTS.map((s) => `<div class="slot tap" role="button" tabindex="0" data-s="${s.id}" data-k="${s.kind}"><span class="lab"></span><span class="has"></span><span class="km">${esc(s.km)}</span></div>`).join('')}</div>
          <div class="side"><div class="tray" data-tray></div><p class="why" data-why aria-live="polite"></p></div>
        </div>
      </div>`,
    });
    this.root.querySelectorAll('.slot').forEach((el) => onTap(el, () => this._place(el.dataset.s)));
    this._draw();
  }

  _tags() {
    if (this._part === 1) return MIX.filter((id) => !this._placed[id]).map((id) => ({ id, name: SLOTS.find((s) => s.id === id).name }));
    return THINGS.filter((t) => !this._things[t.id]);
  }

  _draw() {
    const r = this.root, tray = r.querySelector('[data-tray]');
    if (!tray) return;
    tray.innerHTML = this._tags().map((t) => `<div class="tag tap" role="button" tabindex="0" data-t="${t.id}" data-sel="${this._sel === t.id ? 1 : 0}">${esc(t.name)}</div>`).join('');
    tray.querySelectorAll('.tag').forEach((el) => onTap(el, () => { this._sel = this._sel === el.dataset.t ? null : el.dataset.t; this._draw(); }));
    r.querySelector('.tc').dataset.armed = this._sel ? '1' : '0';
    r.querySelector('[data-sub]').textContent = this._part === 1 ? 'Part 1: layers and pauses.' : 'Part 2: what is found in each layer.';
    r.querySelectorAll('.slot').forEach((el) => {
      const id = el.dataset.s, s = SLOTS.find((x) => x.id === id);
      el.dataset.on = this._placed[id] ? '1' : '0';
      el.querySelector('.lab').textContent = this._placed[id] ? s.name : '';
      el.dataset.full = THINGS.some((t) => this._things[t.id] === id) ? '1' : '0';
      el.querySelector('.has').innerHTML = THINGS.filter((t) => this._things[t.id] === id).map((t) => `<span class="lab">${esc(t.name)}</span>`).join('');
    });
  }

  _place(id) {
    if (!this._sel || this.solved) return;
    const why = this.root.querySelector('[data-why]');
    if (this._part === 1) {
      if (this._sel !== id) { why.dataset.k = 'bad'; why.textContent = `Not there. ${WHY[this._sel]}`; return; }
      this._placed[id] = true; this._sel = null;
      why.dataset.k = 'good'; why.textContent = 'Yes.';
      if (SLOTS.every((s) => this._placed[s.id])) { this._part = 2; why.textContent = 'All eight are in place. Now put in what is found there.'; }
    } else {
      const t = THINGS.find((x) => x.id === this._sel);
      if (t.in !== id) { why.dataset.k = 'bad'; why.textContent = `Not there. ${t.why}`; return; }
      this._things[t.id] = id; this._sel = null;
      why.dataset.k = 'good'; why.textContent = t.why;
      if (THINGS.every((x) => this._things[x.id])) { this._draw(); this.relayout?.(); finishGame(this); return; }
    }
    this._draw();
    this.relayout?.();
  }

  checkObjective() {
    if (!THINGS.every((x) => this._things[x.id])) return null;
    this.quill?.perform('hop');
    return { ok: true };
  }
}
