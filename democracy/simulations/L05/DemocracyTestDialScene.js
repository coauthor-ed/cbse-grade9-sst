// DemocracyTestDialScene - L05 s10. Four questions about Country X, an imaginary country. b0 the
// questions, big. b1 the learner answers them, and one of three stamps lands. A tile flips its answer
// at any time, so an answer can always be changed. Never a real country. b0 clears the answers.
import { DomSimulation } from 'simulations/base/DomSimulation.js';
import { SIM_LOOK_DOM_CSS, burst } from 'simulations/base/kit/SimLookDom.js';
import { esc } from 'simulations/base/SimUi.js';

const m = (idx) => [{ idx, dwellMs: null }];
const QS = [
  { id: 'vote', tile: 'Elections', q: 'Does it hold regular elections?', yes: 'Yes', no: 'No' },
  { id: 'head', tile: 'Who chooses', q: 'Who chooses the Head of the Government?', yes: 'The people', no: 'A ruler' },
  { id: 'party', tile: 'Parties', q: 'Is there more than one political party?', yes: 'Yes', no: 'No' },
  { id: 'free', tile: 'Free speech', q: 'Can citizens freely criticise the government?', yes: 'Yes', no: 'No' },
];
const STAMPS = ['Non-democratic', 'Partially democratic', 'Democratic'];
const read = (n) => (n === 4 ? 2 : n >= 2 ? 1 : 0);

const CSS = `
.dt { display: flex; flex-direction: column; gap: 10px; height: 100%; box-sizing: border-box; padding: 10px 14px; font-family: var(--sim-font); color: var(--sim-label); }
.dt-tiles { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 8px; }
.dt-list { display: none; flex: 1; flex-direction: column; justify-content: space-around; margin: 0; padding: 0; list-style: none; }
.dt-list li { display: flex; align-items: center; gap: 14px; padding: 12px 16px; font: 700 31px/1.14 var(--sim-font-display, var(--sim-font)); background: var(--sim-bg-surface); border: calc(3px * var(--look-rim)) solid var(--sim-stroke); border-radius: var(--sim-radius-md); }
.dt-list b { flex: none; width: 46px; height: 46px; display: grid; place-items: center; border-radius: 50%; background: var(--sim-track); font: inherit; }
[data-beat="0"] .dt-list { display: flex; }
[data-beat="0"] .dt-tiles, [data-beat="0"] .dt-q, [data-beat="0"] .dt-as, [data-beat="0"] .dt-stamps { display: none; }
.dt-t { min-height: 92px; padding: 4px; font: 800 26px/1.1 var(--sim-font); color: var(--sim-label); background: var(--sim-bg-surface); border: calc(3px * var(--look-rim)) solid var(--sim-stroke); border-radius: var(--sim-radius-md); box-shadow: 0 calc(3px * var(--look-lip)) 0 var(--sim-stroke); cursor: pointer; touch-action: manipulation; }
.dt-t small { display: block; margin-top: 5px; font: 800 25px/1.1 var(--sim-font); color: var(--sim-label-muted); }
.dt-t[data-on="1"] { border-color: var(--sim-accent); background: color-mix(in oklab, var(--sim-accent) 18%, var(--sim-bg-surface)); }
.dt-t[data-v="1"] small { color: var(--sim-good); }
.dt-t[disabled] { cursor: default; }
.dt-q { margin: 0; min-height: 76px; display: flex; align-items: center; justify-content: center; text-align: center; font: 700 32px/1.14 var(--sim-font-display, var(--sim-font)); }
.dt-as { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
.dt-b { min-height: 92px; font: 800 30px/1.1 var(--sim-font); color: var(--sim-label); background: var(--sim-bg-surface); border: calc(3px * var(--look-rim)) solid var(--sim-accent); border-radius: var(--sim-radius-md); box-shadow: 0 calc(4px * var(--look-lip)) 0 var(--sim-accent); cursor: pointer; touch-action: manipulation; }
.dt-b[data-sel="1"] { background: color-mix(in oklab, var(--sim-accent) 24%, var(--sim-bg-surface)); }
.dt-as[data-off="1"] { visibility: hidden; }
.dt-t:focus-visible, .dt-b:focus-visible { outline: 3px solid var(--sim-accent); outline-offset: 2px; }
.dt-stamps { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1.14fr) minmax(0, 1fr); gap: 8px; }
.dt-s { display: grid; place-items: center; min-height: 84px; padding: 4px; text-align: center; font: 700 27px/1.1 var(--sim-font-display, var(--sim-font)); border: calc(3px * var(--look-rim)) dashed var(--sim-stroke); border-radius: var(--sim-radius-md); color: var(--sim-label-muted); }
.dt-s[data-on="1"] { color: var(--sim-label); border-style: solid; border-color: var(--sim-accent); background: color-mix(in oklab, var(--sim-accent) 24%, var(--sim-bg-surface)); animation: dt-stamp 0.34s var(--look-spring) both; }
@keyframes dt-stamp { from { transform: scale(1.25) rotate(-3deg); } }
@media (prefers-reduced-motion: reduce) { .dt-s[data-on="1"] { animation: none; } }
`;

export class DemocracyTestDialScene extends DomSimulation {
  static WIDTH = 680;
  static HEIGHT = 453;
  static PORTRAIT_WIDTH = 680;
  static PORTRAIT_HEIGHT = 453;
  static LAYOUT = 'fit';
  static BEAT_STEP_MAP = [m(0), m(1)];
  static ARIA_LABEL = 'Four questions about Country X, an imaginary country, one at a time, with two answers each. After the fourth, one of three stamps shows: democratic, partially democratic or non-democratic.';

  async setup() {
    await super.setup();
    this.ans = {}; this.bt = -1; this.cur = 0; this.foundAll = false;
    this.render({ css: SIM_LOOK_DOM_CSS + CSS, html: `<div class="dt">
      <ol class="dt-list">${QS.map((q, i) => `<li><b>${i + 1}</b>${esc(q.q)}</li>`).join('')}</ol>
      <div class="dt-tiles">${QS.map((q, i) => `<button type="button" class="dt-t" data-t="${i}">${esc(q.tile)}<small data-ta="${i}">?</small></button>`).join('')}</div>
      <p class="dt-q" data-q aria-live="polite"></p>
      <div class="dt-as" data-as><button type="button" class="dt-b" data-a="1"></button><button type="button" class="dt-b" data-a="0"></button></div>
      <div class="dt-stamps" aria-live="polite">${STAMPS.map((s, i) => `<div class="dt-s" data-s="${i}">${esc(s)}</div>`).join('')}</div></div>` });
    this.root.addEventListener('click', (e) => {
      if (this.bt !== 1) return;
      const a = e.target.closest?.(".dt-b"), t = e.target.closest?.("[data-t]");
      if (t) {                               // a tile answers yes, then flips: every press shows a change
        const i = Number(t.dataset.t), id = QS[i].id;
        this.ans[id] = this.ans[id] == null ? 1 : 1 - this.ans[id];
        this.cur = i;
      } else if (a) this.ans[QS[this.cur].id] = Number(a.dataset.a);
      else return;
      if (a || QS.every((q) => this.ans[q.id] != null)) this.cur = QS.findIndex((q) => this.ans[q.id] == null);
      this.paint();
    });
    this.onBeatChange(0, 2);
  }

  onBeatChange(beat) {
    const b = Math.max(0, Math.min(1, Math.trunc(beat) || 0));
    this.root.dataset.beat = String(b);
    if (b === this.bt) return;
    if (b === 0) { this.ans = {}; this.cur = 0; this.foundAll = false; }
    this.bt = b; this.paint();
  }

  paint() {
    const q = (s) => this.root.querySelector(s), box = q('[data-q]');
    if (!box) return;
    const live = this.bt === 1, Q = this.cur >= 0 ? QS[this.cur] : null;
    this.root.querySelectorAll('[data-t]').forEach((t, i) => {
      const v = this.ans[QS[i].id];
      t.disabled = !live;
      t.dataset.on = live && i === this.cur ? '1' : '0';
      t.dataset.v = v == null ? '' : String(v);
      q(`[data-ta="${i}"]`).textContent = v == null ? '?' : v ? QS[i].yes : QS[i].no;
    });
    const done = QS.every((x) => this.ans[x.id] != null), n = QS.reduce((s, x) => s + (this.ans[x.id] ?? 0), 0);
    box.textContent = !live ? '' : Q ? Q.q : `Country X: ${n} of 4 point to democracy. Tap a tile to change an answer.`;
    const as = q('[data-as]');
    as.dataset.off = live && Q ? '0' : '1';
    if (Q) {
      q('.dt-b[data-a="1"]').textContent = Q.yes; q('.dt-b[data-a="0"]').textContent = Q.no;
      this.root.querySelectorAll('.dt-b').forEach((b) => { b.dataset.sel = String(this.ans[Q.id]) === b.dataset.a ? '1' : '0'; });
    }
    this.root.querySelectorAll('[data-s]').forEach((s) => { s.dataset.on = done && Number(s.dataset.s) === read(n) ? '1' : '0'; });
    if (done && !this.foundAll) { this.foundAll = true; burst(q('.dt-stamps')); }
    this.relayout?.();
  }
}
