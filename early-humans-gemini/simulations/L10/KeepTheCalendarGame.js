/**
 * KeepTheCalendarGame - mini-game for les-10 (blk-l10-game). The calendar has 365 days and the real year about 365 and a quarter,
 * so the flood date slips a quarter of a day each year. The learner runs the years forward and stops when it is exactly a
 * month, 30 days, off: 120 years. Base chain: DomSimulation via GameBoard.
 */
import { GameBoard, mountGame, onTap } from 'simulations/base/kit/GameFrame.js';

const TARGET = 120, STEPS = [4, 20, 40];

const CSS = `
.gm.ktc { background: var(--sim-bg-deep); border-radius: 14px; }
.ktc .ktc-board { display: grid; grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr); gap: 16px; align-items: center; flex: 1 1 auto; min-height: 0; }
.ktc .ktc-rail { position: relative; height: 96px; border-radius: var(--sim-radius-md); background: var(--sim-bg-surface); border: calc(2px * var(--look-rim)) solid var(--sim-stroke); overflow: hidden; }
.ktc .ktc-month { position: absolute; left: 8%; right: 8%; top: 42px; height: 26px; border-radius: 8px; background: var(--sim-track); }
.ktc .ktc-flood { position: absolute; top: 12px; bottom: 10px; width: 8px; margin-left: -4px; border-radius: 4px; background: var(--sim-sea-shallow); transition: left 0.5s var(--look-spring-soft); }
.ktc .ktc-tag { position: absolute; top: 8px; left: 8%; font: 800 14px/1.1 var(--sim-font); color: var(--sim-label-muted); }
.ktc .ktc-tag2 { left: auto; right: 8%; }
.ktc .ktc-read { margin: 10px 0 0; text-align: center; font: 600 30px/1.1 var(--sim-font-display, var(--sim-font)); color: var(--sim-label); }
.ktc .ktc-sub { margin: 4px 0 0; text-align: center; font-size: 16px; font-weight: 800; color: var(--sim-label-muted); }
.ktc .ktc-side { display: flex; flex-direction: column; gap: 10px; min-width: 0; }
.ktc .ktc-acts { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; }
.ktc .ktc-a { appearance: none; min-height: 56px; padding: 4px; cursor: pointer; font: 600 18px/1.1 var(--sim-font-display, var(--sim-font)); color: var(--sim-label); background: var(--sim-bg-surface); border: calc(2px * var(--look-rim)) solid var(--sim-stroke); border-radius: var(--sim-radius-md); box-shadow: 0 calc(3px * var(--look-lip)) 0 var(--sim-stroke); }
.ktc .ktc-reset { appearance: none; min-height: 46px; cursor: pointer; font: 800 16px/1 var(--sim-font); color: var(--sim-label); background: transparent; border: calc(2px * var(--look-rim)) solid var(--sim-stroke); border-radius: var(--sim-radius-md); }
.sim-dom-root--portrait .ktc .ktc-board { display: flex; flex-direction: column; gap: 10px; align-items: stretch; }
`;

export class KeepTheCalendarGame extends GameBoard {
  static ARIA_LABEL = 'The real flood date slips a quarter of a day each year. Add years with the buttons and stop when the calendar is exactly 30 days off.';
  static OBJECTIVE = { prompt: { en: 'The calendar slips a quarter of a day each year. Stop when it is a whole month, 30 days, off.' } };

  years = 0;

  async setup() {
    await super.setup();
    mountGame(this, { css: CSS, check: { label: 'Check my answer', in: '.ktc-foot' }, html: `<div class="gm ktc">
      <div class="gm-head"><p class="kicker">An Egyptian calendar keeper</p><h2>When is it a <b>month</b> off?</h2></div>
      <div class="ktc-board">
        <div><div class="ktc-rail"><span class="ktc-tag">Calendar flood day</span><span class="ktc-tag ktc-tag2">30 days earlier</span><div class="ktc-month"></div><div class="ktc-flood"></div></div><p class="ktc-read" aria-live="polite"></p><p class="ktc-sub"></p></div>
        <div class="ktc-side"><div class="ktc-acts">${STEPS.map((s) => `<button type="button" class="ktc-a" data-y="${s}">+ ${s} years</button>`).join('')}</div><button type="button" class="ktc-reset">Start at year 0</button><div class="ktc-foot"></div></div>
      </div></div>` });
    for (const el of this.root.querySelectorAll('.ktc-a')) onTap(el, () => { this.years += +el.dataset.y; this._show(); });
    const r = this.root.querySelector('.ktc-reset'); if (r) onTap(r, () => { this.years = 0; this._show(); });
    this._show();
  }

  _show() {
    const q = (s) => this.root.querySelector(s), off = this.years / 4;
    const a = q('.ktc-read'); if (a) a.textContent = `${off} ${off === 1 ? 'day' : 'days'} off`;
    const b = q('.ktc-sub'); if (b) b.textContent = `after ${this.years} years`;
    const f = q('.ktc-flood'); if (f) f.style.left = `${8 + Math.min(off, 36) / 30 * 84}%`;
  }

  checkObjective() {
    if (this.years === TARGET) return { ok: true };
    return { ok: false, hint: this.years < TARGET ? 'Not yet. A quarter of a day each year: how many years make 30 days?' : 'Too far. Four years make one day, so 30 days need 30 times four years.' };
  }
}
