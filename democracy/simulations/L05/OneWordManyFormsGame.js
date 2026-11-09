// OneWordManyFormsGame - L05 close. Five features, five countries, from the book's table. Tap every
// country with the feature, then Check. The counts run 4, 3, 2, 1, 5: no two features match.
// Control names: [data-land=india|canada|uk|swiss|usa], [data-go], [data-next].
import { GameBoard, mountGame, finishGame, onTap } from 'simulations/base/kit/GameFrame.js';
import { SIM_LOOK_DOM_CSS, burst } from 'simulations/base/kit/SimLookDom.js';

const LANDS = [{ id: 'india', t: 'India' }, { id: 'canada', t: 'Canada' }, { id: 'uk', t: 'United Kingdom' }, { id: 'swiss', t: 'Switzerland' }, { id: 'usa', t: 'United States of America' }];
const FEATS = [
  { t: 'Representative democracy', has: ['india', 'canada', 'uk', 'usa'], why: 'Four of the five elect representatives. Switzerland is the example of direct democracy.' },
  { t: 'The Prime Minister is Head of Government', has: ['india', 'canada', 'uk'], why: 'These three are parliamentary democracies.' },
  { t: 'The President is Head of the Government', has: ['swiss', 'usa'], why: 'In India the President is Head of State, not Head of Government.' },
  { t: 'An unwritten constitution', has: ['uk'], why: 'Of the five, only the United Kingdom has an unwritten constitution.' },
  { t: 'More than one political party', has: ['india', 'canada', 'uk', 'swiss', 'usa'], why: 'All five have this. They share principles, but no two work in the same way.' },
];

const CSS = `
.wf .kicker { display: none; }
.gm.wf { background: color-mix(in oklab, var(--sim-bg-surface) 90%, var(--sim-gold)); border-radius: var(--sim-radius-lg); }
.wf .wf-card { padding: 10px 14px 12px; min-height: 66px; display: flex; align-items: center; background: var(--sim-bg-surface); border: calc(3px * var(--look-rim)) solid var(--sim-gold); border-radius: var(--sim-radius-lg); box-shadow: 0 calc(4px * var(--look-lip)) 0 color-mix(in oklab, var(--sim-gold) 60%, var(--sim-label)); font: 700 22px/1.2 var(--sim-font-display, var(--sim-font)); }
.wf .wf-dots { display: flex; gap: 6px; }
.wf .wf-dot { width: 14px; height: 14px; border-radius: 50%; background: var(--sim-track); }
.wf .wf-dot[data-done="1"] { background: var(--sim-good); }
.wf .wf-dot[data-now="1"] { box-shadow: 0 0 0 3px var(--sim-accent); }
.wf .wf-lands { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 8px; }
.wf .wf-land { min-height: 62px; padding: 4px 6px; border: calc(3px * var(--look-rim)) solid var(--sim-stroke); border-radius: var(--sim-radius-md); background: var(--sim-bg-surface); font: 800 16px/1.15 var(--sim-font); }
.wf .wf-land[aria-pressed="true"] { background: color-mix(in oklab, var(--sim-accent) 34%, var(--sim-bg-surface)); border-color: var(--sim-accent); }
.wf .wf-land[data-miss="1"] { border-color: var(--sim-bad); }
.wf .wf-foot { display: grid; grid-template-columns: minmax(0, 1fr) 190px; gap: 12px; align-items: center; }
.wf .wf-why { margin: 0; min-height: 40px; font: 700 15px/1.3 var(--sim-font); }
.wf .wf-why[data-ok="0"] { color: var(--sim-bad); }
.wf .wf-go { min-height: 50px; border: 0; border-radius: var(--sim-radius-md); background: var(--sim-accent); color: var(--sim-bg-deep); font-size: 16px; font-weight: 800; box-shadow: 0 var(--sim-lift) 0 color-mix(in oklab, var(--sim-accent) 65%, var(--sim-label)); }
.sim-dom-root--portrait .gm.wf { padding: 6px 6px 8px; }
.sim-dom-root--portrait .wf .sub { padding-right: 52px; }
.sim-dom-root--portrait .wf .wf-lands { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.sim-dom-root--portrait .wf .wf-foot { grid-template-columns: minmax(0, 1fr); }
.sim-dom-root--portrait .wf .wf-card { font-size: 20px; }
`;

export class OneWordManyFormsGame extends GameBoard {
  static OBJECTIVE = { prompt: { en: 'Five features, five countries. Tap every country that has each feature.' } };
  static ARIA_LABEL = 'Five features of government, one at a time. Tap every country that has the feature, then check.';

  async setup() {
    await super.setup();
    this.r = 0; this.sel = new Set(); this.done = false; this.won = false; this.miss = new Set();
    mountGame(this, { check: false, css: SIM_LOOK_DOM_CSS + CSS, html: `<div class="gm wf"><div class="gm-head"><p class="kicker">One word, many governments</p><h2>Which countries have this?</h2><p class="sub">Tap every country that fits.</p></div>
      <div class="wf-dots">${FEATS.map((_, i) => `<i class="wf-dot" data-d="${i}"></i>`).join('')}</div>
      <div class="wf-card" data-card aria-live="polite"></div>
      <div class="wf-lands">${LANDS.map((l) => `<button type="button" class="tap wf-land" data-land="${l.id}" aria-pressed="false">${l.t}</button>`).join('')}</div>
      <div class="wf-foot"><p class="wf-why" data-why aria-live="polite"></p><button type="button" class="tap wf-go" data-go>Check</button></div></div>` });
    if (!this.root.querySelector('[data-go]')) return;
    this.root.querySelectorAll('[data-land]').forEach((b) => onTap(b, () => this.tap(b.dataset.land)));
    onTap(this.root.querySelector('[data-go]'), () => this.go());
    this.paint();
  }

  tap(id) {
    if (this.done) return;
    if (this.sel.has(id)) this.sel.delete(id); else this.sel.add(id);
    this.why = ''; this.ok = null; this.miss = new Set();
    this.paint();
  }

  go() {
    const F = FEATS[this.r];
    if (this.done) {
      if (this.r >= FEATS.length - 1) { this.won = true; finishGame(this); this.paint(); return; }
      this.r += 1; this.sel = new Set(); this.done = false; this.why = ''; this.ok = null;
      this.paint();
      return;
    }
    const wrong = LANDS.filter((l) => this.sel.has(l.id) !== F.has.includes(l.id));
    if (!wrong.length) this.found(F);
    else {
      const extra = wrong.filter((l) => this.sel.has(l.id)).length, less = wrong.length - extra;
      this.ok = false; this.miss = new Set(wrong.filter((l) => this.sel.has(l.id)).map((l) => l.id));
      this.why = extra && less ? 'Not quite: one tapped country does not fit, and another is missing.'
        : extra ? `Not quite: ${extra === 1 ? 'one tapped country does' : 'some tapped countries do'} not fit.` : `Not quite: ${less === 1 ? 'one more country fits' : 'more countries fit'}.`;
    }
    this.paint();
  }

  found(F) {
    this.done = true; this.ok = true; this.why = F.why; this.miss = new Set();
    burst(this.root.querySelector('[data-card]'));
  }

  checkObjective() { return this.won ? { ok: true } : null; }

  paint() {
    const q = (s) => this.root.querySelector(s);
    q('[data-card]').textContent = FEATS[this.r].t;
    this.root.querySelectorAll('[data-land]').forEach((b) => { b.setAttribute('aria-pressed', this.sel.has(b.dataset.land) ? 'true' : 'false'); b.dataset.miss = this.miss.has(b.dataset.land) ? '1' : '0'; });
    this.root.querySelectorAll('[data-d]').forEach((d) => { const i = Number(d.dataset.d); d.dataset.done = i < this.r || (i === this.r && this.done) ? '1' : '0'; d.dataset.now = i === this.r ? '1' : '0'; });
    const w = q('[data-why]'); w.textContent = this.why ?? ''; if (this.ok === false) w.dataset.ok = '0'; else w.removeAttribute('data-ok');
    q('[data-go]').textContent = !this.done ? 'Check' : this.r >= FEATS.length - 1 ? 'Finish' : 'Next feature';
    this.relayout?.();
  }
}
