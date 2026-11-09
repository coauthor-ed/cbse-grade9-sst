// CarbonBudgetGameScene - game "Lower the score" (L08 s09). Riya starts from the book's highest habits (13 points).
// In each group the learner picks the change that lowers her footprint score most; a wrong pick gives a
// true line and a second try. The running total uses the book's points, and ends on 4, the lowest. Four rounds.
// Controls: .cb-opt (data-opt), .cb-next.
import { GameBoard, mountGame, finishGame, onTap } from 'simulations/base/kit/GameFrame.js';

const ROUNDS = [
  { group: 'Transport', now: 'She takes flights more than twice a year.', pts: 4, opts: [['She uses public transport or a carpool.', 2], ['She travels by private car.', 3], ['She walks or uses a cycle.', 1]] },
  { group: 'Electricity', now: 'She leaves lights and fans on frequently.', pts: 3, opts: [['She sometimes forgets to switch them off.', 2], ['She always switches them off when not in use.', 1]] },
  { group: 'Water', now: 'She rarely thinks about saving water.', pts: 3, opts: [['She uses just one bucket of water for bathing.', 1], ['She sometimes leaves the tap running.', 2]] },
  { group: 'Waste', now: 'She often throws away plastic and does not recycle.', pts: 3, opts: [['She sometimes uses disposable bottles and bags.', 2], ['She reuses, recycles and avoids single-use plastics.', 1]] },
];
const CSS = `
.gm.cb { gap: 8px; background: var(--sim-bg-deep); border-radius: 14px; }
.cb-board { display: grid; grid-template-columns: 240px minmax(0, 1fr); gap: 14px; align-items: start; }
.cb-score { display: flex; flex-direction: column; align-items: center; gap: 2px; padding: 10px; border: var(--sim-border); border-radius: var(--sim-radius-lg); background: var(--sim-bg-surface); box-shadow: 0 var(--sim-lift) 0 var(--sim-stroke); }
.cb-num { font: 600 52px/1.25 var(--sim-font-display, var(--sim-font)); }
.cb-lab { font: 700 15px/1.2 var(--sim-font); color: var(--sim-label-muted); text-align: center; }
.cb-track { width: 100%; height: 14px; border-radius: var(--look-pill); background: var(--sim-track); overflow: hidden; margin-top: 4px; }
.cb-fill { display: block; height: 100%; border-radius: var(--look-pill); background: var(--sim-good); transition: width 0.4s var(--look-spring-soft); }
.cb-side { display: flex; flex-direction: column; gap: 8px; }
.cb-now { margin: 0; font: 600 18px/1.25 var(--sim-font-display, var(--sim-font)); }
.cb-opt { min-height: 52px; padding: 6px 10px; border: var(--sim-border); border-radius: var(--sim-radius-md); background: var(--sim-bg-surface); font: 700 15px/1.2 var(--sim-font); text-align: left; }
.cb-opt[data-state="good"] { background: color-mix(in oklab, var(--sim-good) 28%, var(--sim-bg-surface)); border-color: var(--sim-good); }
.cb-opt[data-state="bad"] { background: color-mix(in oklab, var(--sim-error) 16%, var(--sim-bg-surface)); border-color: var(--sim-error); }
.cb-why { margin: 0; min-height: 40px; font: 700 15px/1.3 var(--sim-font); }
.cb-next { min-height: 48px; border: 0; border-radius: var(--sim-radius-md); background: var(--sim-accent); color: var(--sim-bg-surface); font: 800 16px/1 var(--sim-font); box-shadow: 0 var(--sim-lift) 0 color-mix(in oklab, var(--sim-accent) 65%, var(--sim-label)); }
.cb-next[hidden] { display: none; }
.cb-opts { display: flex; flex-direction: column; gap: 8px; }
.sim-dom-root--portrait .cb-board { grid-template-columns: minmax(0, 1fr); }
.sim-dom-root--portrait .cb-score { flex-direction: row; justify-content: center; gap: 12px; flex-wrap: wrap; }
.sim-dom-root--portrait .cb-num { font-size: 40px; }
.cb-score { align-items: center; }
`;

export class CarbonBudgetGameScene extends GameBoard {
  static OBJECTIVE = { prompt: { en: 'Lower the score: in each group, pick the change that lowers your footprint score the most.' } };
  static ARIA_LABEL = 'A game on the carbon footprint self-check: pick the change that lowers the score most in each of four groups.';

  async setup() {
    this._i = 0; this._score = 13; this._done = false; this._right = false;
    await super.setup();
    mountGame(this, { css: CSS, check: false, html: `<div class="gm cb"><div class="gm-head"><h2>Lower the score</h2><p class="sub">Riya wants the lowest score.</p></div>
      <div class="cb-board"><div class="cb-score"><span class="cb-num"></span><span class="cb-lab">points now, lowest 4</span><span class="cb-track"><span class="cb-fill"></span></span></div>
      <div class="cb-side"><p class="cb-now"></p><div class="cb-opts"></div><p class="cb-why" aria-live="polite"></p><button type="button" class="tap cb-next" hidden>Next group</button></div></div></div>` });
    const q = (s) => this.root.querySelector(s);
    this._num = q('.cb-num'); this._fill = q('.cb-fill'); this._now = q('.cb-now'); this._o = q('.cb-opts'); this._w = q('.cb-why'); this._n = q('.cb-next');
    if (this._n) onTap(this._n, () => this._advance());
    this._deal();
  }

  _show() {
    if (this._num) this._num.textContent = String(this._score);
    if (this._fill) this._fill.style.width = `${((13 - this._score) / 9) * 100}%`;
  }

  _deal() {
    const r = ROUNDS[this._i];
    this._right = false;
    this._show();
    if (this._now) this._now.textContent = `${r.group}: ${r.now}`;
    if (this._w) this._w.textContent = '';
    if (this._n) { this._n.hidden = true; this._n.textContent = this._i === ROUNDS.length - 1 ? 'Finish' : 'Next group'; }
    if (this._o) {
      this._o.innerHTML = '';
      r.opts.forEach((o, i) => {
        const b = document.createElement('button');
        b.type = 'button'; b.className = 'tap cb-opt'; b.textContent = o[0]; b.dataset.opt = String(i);
        onTap(b, () => this._pick(b, o));
        this._o.appendChild(b);
      });
    }
    this.relayout?.();
  }

  _pick(b, o) {
    if (this._right) return;
    const r = ROUNDS[this._i], best = Math.min(...r.opts.map((x) => x[1]));
    if (o[1] === best) {
      this._right = true; b.dataset.state = 'good';
      this._score -= r.pts - o[1];
      this._w.textContent = `Low impact: 1 point in place of ${r.pts}.`;
      this._n.hidden = false; this._show();
      this.quill?.perform('hop');
    } else {
      b.dataset.state = 'bad';
      this._w.textContent = `That line scores ${o[1]} ${o[1] === 1 ? 'point' : 'points'}. Another change lowers the score further.`;
      this.quill?.setExpression('surprised');
    }
    this.relayout?.();
  }

  _advance() {
    if (!this._right) return;
    if (this._i < ROUNDS.length - 1) { this._i += 1; this._deal(); return; }
    this._done = true;
    if (this._now) this._now.textContent = 'Four low-impact habits: the lowest score.';
    finishGame(this);
  }

  checkObjective() { return this._done ? { ok: true } : null; }
}
