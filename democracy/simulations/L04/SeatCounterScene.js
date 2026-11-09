// SeatCounterScene - L04 s06. The real Lok Sabha chamber, 543 seats. b0 five parties share it.
// b1 the learner moves the seats of Party A and allies. At 272 a government forms, and the
// largest group outside it becomes the opposition.
import { DomSimulation } from 'simulations/base/DomSimulation.js';
import { SIM_LOOK_DOM_CSS, burst, applyToneInks } from 'simulations/base/kit/SimLookDom.js';
import { mountParliament, valueDialHtml } from 'simulations/base/kit/SimPicDom.js';

const m = (idx) => [{ idx, dwellMs: null }];
const N = 543, NEED = 272;
const BEAT0 = [{ tone: 1, n: 190, t: 'Party A' }, { tone: 2, n: 150, t: 'Party B' }, { tone: 3, n: 90, t: 'Party C' }, { tone: 5, n: 70, t: 'Party D' }, { tone: 7, n: 43, t: 'Party E' }];

const CSS = `
.sc { display: flex; flex-direction: column; gap: 10px; height: 100%; box-sizing: border-box; padding: 10px 14px; font-family: var(--sim-font); color: var(--sim-label); }
.sc .sp-parl, .sim-dom-root--portrait .sc .sp-parl { grid-template-columns: minmax(0, 1fr) 256px; gap: 10px; }
.sc .sp-parl__svg { max-height: 330px; }
.sim-dom-root[data-beat="0"] .sc .sp-parl { grid-template-columns: minmax(0, 1fr) 176px; }
.sc .sp-parl__n { font-size: 44px; transform: translateY(14px); }
.sc .sp-parl__nl { display: none; }
.sc .sp-key, .sim-dom-root--portrait .sc .sp-key { flex-flow: column nowrap; gap: 8px; }
.sc .sp-key__row { font-size: 27px; line-height: 1.15; white-space: normal; }
.sc .sp-key__dot { width: 24px; height: 24px; }
.sc input[type="range"] { width: 100%; height: 88px; margin: 0; }
.sc input[type="range"]::-webkit-slider-runnable-track { height: 28px; }
.sc input[type="range"]::-webkit-slider-thumb { width: 88px; height: 88px; margin-top: -30px; }
.sc input[type="range"]::-moz-range-thumb { width: 84px; height: 84px; }
.sc input[type="range"]::-moz-range-track { height: 28px; }
.sc-hall { flex: 1 1 auto; min-height: 0; }
.sc-read { display: flex; align-items: baseline; justify-content: center; gap: var(--sim-space-2); font: 700 34px/1.1 var(--sim-font-display, var(--sim-font)); }
.sc-read small { font: 800 16px var(--sim-font); color: var(--sim-label-muted); }
.sc-line { min-height: 70px; margin: 0; padding: 6px 12px; text-align: center; font: 800 28px/1.2 var(--sim-font); border-radius: var(--sim-radius-md); background: var(--sim-bg-surface); border: calc(2px * var(--look-rim)) solid var(--sim-stroke); box-shadow: 0 calc(3px * var(--look-lip)) 0 var(--sim-stroke); display: flex; align-items: center; justify-content: center; }
.sc-line[data-won="1"] { border-color: var(--sim-good); background: color-mix(in oklab, var(--sim-good) 20%, var(--sim-bg-surface)); }
.sc-dial[hidden] { display: none; }
.sc .sp-seat { transition-delay: 0ms; transition-duration: 0.12s; }
.sc-rule { display: flex; align-items: center; justify-content: center; gap: var(--sim-space-2); font: 800 16px var(--sim-font); color: var(--sim-label-muted); }
`;

export class SeatCounterScene extends DomSimulation {
  static WIDTH = 680;
  static HEIGHT = 453;
  static PORTRAIT_WIDTH = 680;
  static PORTRAIT_HEIGHT = 453;
  static LAYOUT = 'fit';
  static BEAT_STEP_MAP = [m(0), m(1)];
  static ARIA_LABEL = 'The Lok Sabha as a half circle of 543 seats. A slider sets the seats of Party A and its allies. At 272 seats they form the government, and Party B, the largest other group, is the opposition.';

  async setup() {
    await super.setup();
    this.n = 150; this.found = false; this.bt = -1;
    this.render({ css: SIM_LOOK_DOM_CSS + CSS, html: `<div class="sc">
      <div class="sc-hall" data-hall></div>
      <div class="sc-dial" data-dial-row>${valueDialHtml({ key: 'seats', label: 'Seats of Party A and allies', min: 0, max: N, step: 1, value: this.n })}</div>
      <p class="sc-line" data-line aria-live="polite"></p></div>` });
    const host = this.root.querySelector('[data-hall]');
    if (host) this.hall = mountParliament(host, { key: 'side' });
    this.root.querySelector('[data-dial="seats"]')?.addEventListener('input', (e) => { this.n = Number(e.target.value); this.paint(); });
    this.onBeatChange(0, 2);
  }

  onBeatChange(beat) {
    const b = Math.max(0, Math.min(1, Math.trunc(beat) || 0));
    this.root.dataset.beat = String(b);
    if (b === this.bt || !this.hall) return;
    this.bt = b;
    this.root.querySelector('[data-dial-row]').hidden = b === 0;
    this.paint();
    this.relayout?.();
  }

  paint() {
    const line = this.root.querySelector('[data-line]');
    if (this.bt === 0) {
      const seats = BEAT0.flatMap((p) => Array(p.n).fill(p.tone));
      this.hall.set({ seats, key: BEAT0.map((p) => ({ tone: p.tone, text: p.t })), total: N });
      line.textContent = 'Five parties share 543 seats, and each has its own ideas.';
      line.dataset.won = '0';
    } else {
      const a = this.n, rest = N - a, b = Math.round(rest * 0.6), o = rest - b, won = a >= NEED;
      const seats = [...Array(a).fill(1), ...Array(b).fill(2), ...Array(o).fill(3)];
      this.hall.set({ seats, need: NEED, total: N, key: [
        { tone: 1, text: `Party A and allies: ${a}`, win: won },
        { tone: 2, text: `Party B: ${b}` }, { tone: 3, text: `Others: ${o}` },
      ] });
      line.textContent = won ? 'Government formed. Party B, the largest other group, is the opposition.'
        : `No majority yet: ${NEED - a} more ${NEED - a === 1 ? 'seat' : 'seats'} needed.`;
      line.dataset.won = won ? '1' : '0';
      if (won && !this.found) { this.found = true; burst(line); }
    }
    applyToneInks(this.root);
  }
}
