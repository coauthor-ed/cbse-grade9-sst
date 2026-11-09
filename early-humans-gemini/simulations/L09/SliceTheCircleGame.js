/**
 * SliceTheCircleGame - mini-game for les-09 (blk-l09-game). Eight splits, one at a time: a ring of 60 or of 10 into n groups.
 * The learner taps "Shared equally" or "Left over". The ring then redraws the split, so the reply is seen as well as read.
 * At the end the score of each ring is shown: 60 shares in more ways than 10. Base chain: DomSimulation via GameBoard.
 */
import { GameBoard, mountGame, onTap, finishGame } from 'simulations/base/kit/GameFrame.js';

const ITEMS = [[60, 4], [10, 3], [60, 7], [10, 5], [60, 12], [10, 4], [60, 9], [60, 6]];
const shuffled = () => { const a = [...ITEMS]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

const CSS = `
.gm.stc { background: var(--sim-bg-deep); border-radius: 14px; }
.stc .stc-board { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1.1fr); gap: 16px; align-items: center; flex: 1 1 auto; min-height: 0; }
.stc .stc-ring { display: block; width: 100%; max-width: 220px; height: auto; margin: 0 auto; aspect-ratio: 1; }
.stc .stc-side { display: flex; flex-direction: column; gap: 10px; min-width: 0; }
.stc .stc-q { margin: 0; font: 600 25px/1.2 var(--sim-font-display, var(--sim-font)); color: var(--sim-label); text-align: center; }
.stc .stc-acts { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 10px; }
.stc .stc-a { appearance: none; min-height: 60px; padding: 6px; cursor: pointer; font: 600 19px/1.15 var(--sim-font-display, var(--sim-font)); color: var(--sim-label); background: var(--sim-bg-surface); border: calc(2px * var(--look-rim)) solid var(--sim-stroke); border-radius: var(--sim-radius-md); box-shadow: 0 calc(3px * var(--look-lip)) 0 var(--sim-stroke); }
.stc .stc-a:disabled { opacity: 0.5; cursor: default; }
.stc .stc-say { margin: 0; min-height: 40px; font-size: 16px; font-weight: 700; line-height: 1.25; color: var(--sim-label); text-align: center; }
.stc .stc-next { appearance: none; min-height: 50px; padding: 6px 18px; cursor: pointer; font: 600 19px/1.1 var(--sim-font-display, var(--sim-font)); color: var(--sim-ink-on-accent, var(--sim-bg-deep)); background: var(--sim-accent); border: none; border-radius: var(--sim-radius-md); box-shadow: 0 calc(3px * var(--look-lip)) 0 color-mix(in oklab, var(--sim-accent) 60%, black); }
.stc .stc-next[hidden] { display: none; }
.stc .stc-count { margin: 0; text-align: center; font-size: 15px; font-weight: 800; color: var(--sim-label-muted); }
.sim-dom-root--portrait .stc .stc-board { display: flex; flex-direction: column; gap: 8px; }
.sim-dom-root--portrait .stc .stc-ring { max-width: 190px; }
`;

export class SliceTheCircleGame extends GameBoard {
  static ARIA_LABEL = 'Eight splits, one at a time. A ring of 60 or of 10 is shared into groups. Choose whether it shares equally or leaves something over.';
  static OBJECTIVE = { prompt: { en: 'Eight splits of a ring. For each one, say whether it shares equally or leaves something over.' } };

  _reset() { this.items = shuffled(); this.i = 0; this.wrong = 0; this.answered = null; this.score = { 60: 0, 10: 0 }; }

  async setup() {
    await super.setup();
    this._reset();
    mountGame(this, { css: CSS, check: false, html: `<div class="gm stc">
      <div class="gm-head"><p class="kicker">A Sumerian scribe</p><h2>Share the <b>ring</b></h2></div>
      <div class="stc-board">
        <svg class="stc-ring" viewBox="0 0 240 240" aria-hidden="true"></svg>
        <div class="stc-side">
          <p class="stc-q" aria-live="polite"></p>
          <div class="stc-acts"><button type="button" class="stc-a" data-a="eq">Shared equally</button><button type="button" class="stc-a" data-a="left">Some left over</button></div>
          <p class="stc-say"></p><button type="button" class="stc-next" hidden>Next split</button><p class="stc-count"></p>
        </div>
      </div></div>` });
    for (const el of this.root.querySelectorAll('.stc-a')) onTap(el, () => { if (!el.disabled) this._answer(el.dataset.a); });
    const nx = this.root.querySelector('.stc-next'); if (nx) onTap(nx, () => this._next());
    this._show();
  }

  _answer(a) {
    const [ring, by] = this.items[this.i], eq = ring % by === 0, ok = (a === 'eq') === eq;
    if (!ok) this.wrong += 1;
    if (eq) this.score[ring] += 1;
    this.answered = { ok, eq, ring, by };
    this._show();
  }

  _next() {
    this.i += 1; this.answered = null;
    if (this.i >= ITEMS.length) {
      if (this.wrong > 2) { this.restart = true; this._reset(); } else { this.done = true; finishGame(this); }
    }
    this._show();
  }

  _ring() {
    const [ring, by] = this.items[Math.min(this.i, ITEMS.length - 1)], split = !!this.answered, q = Math.floor(ring / by), used = q * by, R = 96, r = ring === 60 ? 4.6 : 19, cols = ['var(--sim-series-2)', 'var(--sim-series-5)', 'var(--sim-series-3)', 'var(--sim-series-6)'];
    let s = '';
    for (let i = 0; i < ring; i++) {
      const a = (i / ring) * Math.PI * 2 - Math.PI / 2, x = (120 + R * Math.cos(a)).toFixed(1), y = (120 + R * Math.sin(a)).toFixed(1);
      if (!split) s += `<circle cx="${x}" cy="${y}" r="${r}" style="fill:var(--sim-strata-3)"/>`;
      else if (i < used) s += `<circle cx="${x}" cy="${y}" r="${r}" style="fill:${cols[Math.floor(i / q) % 4]}"/>`;
      else s += `<circle cx="${x}" cy="${y}" r="${r - 1.5}" style="fill:none;stroke:var(--sim-bad);stroke-width:3;stroke-dasharray:3 4"/>`;
    }
    return s + `<text x="120" y="122" text-anchor="middle" dominant-baseline="central" font-size="46" style="font-family:var(--sim-font-display,var(--sim-font));font-weight:600;fill:var(--sim-label)">${ring}</text>`;
  }

  _show() {
    const q = (s) => this.root.querySelector(s), set = (s, t) => { const e = q(s); if (e) e.textContent = t; };
    const end = this.i >= ITEMS.length, a = this.answered;
    const svg = q('.stc-ring'); if (svg) svg.innerHTML = end ? '' : this._ring();
    const [ring, by] = this.items[Math.min(this.i, ITEMS.length - 1)];
    set('.stc-q', this.done ? `60 shared equally ${this.score[60]} times, 10 only ${this.score[10]}` : `Share ${ring} into ${by} groups`);
    for (const b of this.root.querySelectorAll('.stc-a')) { b.disabled = !!a || !!this.done; b.hidden = !!this.done; }
    const nx = q('.stc-next'); if (nx) nx.hidden = !a;
    let say = this.restart ? 'More than two wrong, so here is a new set. Divide before you answer.' : 'Work it out, then choose.';
    if (a) { const qq = Math.floor(a.ring / a.by), left = a.ring % a.by; say = `${a.ok ? 'Right.' : 'Not this time.'} ${a.ring} shared by ${a.by} gives ${qq} each, ${left ? `${left} left over` : 'none left over'}.`; }
    if (this.done) say = 'Sixty can be shared in many more ways than ten.';
    set('.stc-say', say);
    set('.stc-count', this.done ? '' : `Split ${Math.min(this.i + 1, ITEMS.length)} of ${ITEMS.length}`);
  }

  checkObjective() { return this.done ? { ok: true } : null; }
}
