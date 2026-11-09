/**
 * WeighItOutGame - mini-game for les-07 (blk-l07-game). A load of 91 units on the left pan, and one cube each of
 * 1, 2, 4, 8, 16, 32 and 64. Tap a cube to put it on the pan or take it off. Only one set adds up to 91 because the
 * weights double, so the doubling idea is the way to win: take the biggest cube that still fits, then the next.
 * Base chain: DomSimulation via GameBoard.
 */
import { GameBoard, mountGame, onTap } from 'simulations/base/kit/GameFrame.js';

const WEIGHTS = [64, 32, 16, 8, 4, 2, 1];
const TARGET = 91; // 64 + 16 + 8 + 2 + 1

const CSS = `
.gm.wio { background: var(--sim-bg-deep); border-radius: 14px; }
.wio .wio-board { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 16px; align-items: center; flex: 1 1 auto; min-height: 0; }
.wio .wio-scale { display: flex; flex-direction: column; align-items: center; gap: 8px; }
.wio .wio-beam { width: 100%; max-width: 420px; height: 12px; border-radius: 6px; background: var(--sim-strata-2); box-shadow: 0 calc(3px * var(--look-lip)) 0 color-mix(in oklab, var(--sim-strata-2) 60%, black); transition: transform 0.35s var(--look-spring); }
.wio .wio-pans { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 12px; width: 100%; max-width: 420px; }
.wio .wio-pan { min-height: 70px; padding: 8px; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; gap: 2px; border-radius: var(--sim-radius-md); background: var(--sim-bg-surface); border: calc(2px * var(--look-rim)) solid var(--sim-stroke); }
.wio .wio-pan b { font: 700 30px/1.05 var(--sim-font-display, var(--sim-font)); color: var(--sim-label); }
.wio .wio-pan span { font-size: 15px; font-weight: 700; color: var(--sim-label-muted); }
.wio .wio-say { margin: 0; min-height: 22px; text-align: center; font-size: 16px; font-weight: 800; color: var(--sim-label); }
.wio .wio-cubes { display: flex; flex-wrap: wrap; justify-content: center; gap: 10px; }
.wio .wio-w { appearance: none; min-width: 64px; min-height: 64px; padding: 4px; cursor: pointer; font: 700 24px/1 var(--sim-font-display, var(--sim-font)); color: var(--sim-label); background: var(--sim-strata-1); border: calc(2px * var(--look-rim)) solid var(--sim-strata-2); border-radius: var(--sim-radius-md); box-shadow: 0 calc(4px * var(--look-lip)) 0 var(--sim-strata-2); color: var(--sim-strata-6); }
.wio .wio-w[aria-pressed="true"] { background: var(--sim-accent); border-color: var(--sim-accent); color: var(--sim-ink-on-accent, var(--sim-bg-deep)); box-shadow: 0 calc(1px * var(--look-lip)) 0 var(--sim-accent); transform: translateY(3px); }
.sim-dom-root--portrait .wio .wio-board { display: flex; flex-direction: column; gap: 10px; }
.sim-dom-root--portrait .wio .wio-w { min-width: 62px; min-height: 58px; }
`;

export class WeighItOutGame extends GameBoard {
  static ARIA_LABEL = 'A balance with a load of 91 units. Tap the doubling cubes 1, 2, 4, 8, 16, 32 and 64 to choose the ones that add up to exactly 91.';
  static OBJECTIVE = { prompt: { en: `Put cubes on the pan until they balance a load of ${TARGET} units exactly.` } };

  _on = new Set();

  async setup() {
    await super.setup();
    const cubes = WEIGHTS.map((w) => `<button type="button" class="wio-w" data-w="${w}" aria-pressed="false" aria-label="Weight ${w}">${w}</button>`).join('');
    mountGame(this, { css: CSS, check: { label: 'Check my answer', in: '.wio-foot' }, html: `<div class="gm wio">
      <div class="gm-head"><p class="kicker">A trader at Harappa</p><h2>Balance a load of <b>${TARGET}</b></h2></div>
      <div class="wio-board">
        <div class="wio-scale"><div class="wio-beam"></div><div class="wio-pans"><div class="wio-pan"><b>${TARGET}</b><span>load</span></div><div class="wio-pan"><b class="wio-sum">0</b><span>cubes</span></div></div><p class="wio-say" aria-live="polite"></p></div>
        <div><div class="wio-cubes">${cubes}</div></div>
      </div><div class="wio-foot"></div></div>` });
    for (const el of this.root.querySelectorAll('.wio-w')) onTap(el, () => this._toggle(+el.dataset.w, el));
    this._show();
  }

  _sum() { let t = 0; for (const w of this._on) t += w; return t; }

  _toggle(w, el) {
    if (this._on.has(w)) this._on.delete(w); else this._on.add(w);
    el.setAttribute('aria-pressed', String(this._on.has(w)));
    this._show();
  }

  _show() {
    const sum = this._sum(), gap = TARGET - sum;
    const s = this.root.querySelector('.wio-sum'); if (s) s.textContent = String(sum);
    const say = this.root.querySelector('.wio-say');
    if (say) say.textContent = sum === 0 ? 'Start with the biggest cube that fits.' : gap > 0 ? `${gap} more to go` : gap < 0 ? `Too heavy by ${-gap}` : 'The pans are level.';
    const beam = this.root.querySelector('.wio-beam');
    if (beam) beam.style.transform = `rotate(${(Math.max(-1, Math.min(1, -gap / 40)) * 2.5).toFixed(1)}deg)`;
  }

  checkObjective() {
    const sum = this._sum();
    if (sum === TARGET) return { ok: true };
    return { ok: false, hint: sum > TARGET ? 'Too heavy. Take the biggest cube off and try the next one down.' : 'Still light. Add the biggest cube that does not go past what is left.' };
  }
}
