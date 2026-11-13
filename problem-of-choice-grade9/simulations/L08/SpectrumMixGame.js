import { DomSimulation } from 'simulations/base/DomSimulation.js';
import { withChallenge } from 'simulations/base/ChallengeMode.js';
import { SimMascotDom } from 'simulations/base/SimMascotDom.js';

/**
 * SpectrumMixGame - mini-game for les-08, hosted by mini-game@1.
 *
 * Tie level L3 (strategy). The lesson's load-bearing claim is that
 * REAL economies are mixed - private sector and government coexist,
 * and the ratio is a choice, not a verdict. The text (blk-l08-s03)
 * shows the balance board; (blk-l08-s04) lays out India's road from
 * state-led to mixed. The number that is easy to gloss over is that
 * "mixed" is not "50-50": some sectors lean state (defence, railways),
 * some lean private (mobile phones, restaurants), and the SAME country
 * can run them at very different points on the spectrum.
 *
 * The game makes the per-sector mix the only way to win. 5 sectors
 * (defence, mobile phones, primary schools, restaurants, power grid)
 * each has its own slider from PLANNED (state owns and runs) to FREE
 * (private sector, no rules). The student places each sector at a
 * sensible point on the spectrum. The win condition: every sector is
 * in its "sensible" range - not all at the PLANNED pole, not all at
 * the FREE pole.
 *
 * Designed-in wrong attractor: putting everything at one pole. The
 * lesson names "all planned" as a pole and "all free" as the
 * opposite pole; a student who reads the lesson as "more free = better"
 * will push everything to FREE and miss that defence and primary
 * schools belong closer to PLANNED. The hint names the trap.
 *
 * Built on DomSimulation rather than CanvasSimulation for the reason
 * the kit gives for new games: Quill is an SVG rig, so SimMascotDom
 * drops him straight into this.root with no canvas port, and every
 * colour is a live var(--sim-*) with no fallback table to go stale.
 */

const W = 900;
const H = 600;

const SECTORS = [
  { id: 'defence', label: 'Defence / armed forces',      planned: 90, free: 10, sensibleMin: 60, sensibleMax: 100 },
  { id: 'phones',  label: 'Mobile phones',               planned: 10, free: 90, sensibleMin: 0,  sensibleMax: 40 },
  { id: 'schools', label: 'Primary schools',             planned: 80, free: 20, sensibleMin: 40, sensibleMax: 100 },
  { id: 'food',    label: 'Restaurants',                 planned: 5,  free: 95, sensibleMin: 0,  sensibleMax: 30 },
  { id: 'power',   label: 'Power grid (electricity)',    planned: 60, free: 40, sensibleMin: 20, sensibleMax: 80 },
];

const CSS = `
.spm { position: absolute; inset: 0; font-family: var(--sim-font); color: var(--sim-label); }
.spm .pad { position: absolute; inset: 0; padding: 22px 28px; box-sizing: border-box;
           display: flex; flex-direction: column; gap: 10px; }
.spm .kicker { font-size: 13px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase;
              color: var(--sim-label-muted); margin: 0; }
.spm h2 { font-family: var(--sim-font-display); font-size: 23px; font-weight: 700; margin: 0; line-height: 1.2; }
.spm h2 b { color: var(--sim-accent); }
.spm .legend { display: flex; justify-content: space-between; font-size: 12px; letter-spacing: 0.1em;
              text-transform: uppercase; color: var(--sim-label-muted); padding: 0 4px; }
.spm .rows { display: flex; flex-direction: column; gap: 8px; flex: 1; }
.spm .srow { display: grid; grid-template-columns: 220px 1fr 60px; align-items: center;
            gap: 12px; padding: 8px 10px; background: var(--sim-bg-surface);
            border: 2px solid var(--sim-border); border-radius: 10px; }
.spm .srow[data-ok="1"] { border-color: var(--sim-success); }
.spm .srow[data-bad="1"] { border-color: var(--sim-error); }
.spm .srow .lbl { font-size: 14px; font-weight: 700; }
.spm .srow input { width: 100%; }
.spm .srow .val { font-size: 16px; font-weight: 800; text-align: right; }
.spm .verdict { font-size: 14px; padding: 8px 12px; border-radius: 10px; background: var(--sim-bg-surface);
              border: 2px solid var(--sim-border); margin: 0; }
.spm .verdict[data-ok="1"] { border-color: var(--sim-success); color: var(--sim-success); }
.spm .verdict[data-bad="1"] { border-color: var(--sim-error); color: var(--sim-error); }
`;

export class SpectrumMixGame extends withChallenge(DomSimulation) {
  static simId = 'spectrum-mix-game';
  static label = { en: 'Spectrum Mix' };
  static category = 'social-science.economics';
  static WIDTH = W;
  static HEIGHT = H;
  static ARIA_LABEL =
    'Five sectors on a spectrum from PLANNED (state-owned, state-run) to FREE (private, no rules). Slide each sector to its right place. Mixed is not 50-50 - each sector has its own sensible range.';
  static OBJECTIVE = {
    prompt: {
      en: 'Five sectors. Slide each one to a sensible spot on the PLANNED-FREE spectrum. Mixed is not 50-50 - defence is not the same as restaurants.',
    },
  };
  static SCORING = { mode: 'accuracy' };
  static CONTROLS = [];

  constructor(container, config) {
    super(container, config);
    this.vals = {};
    for (const s of SECTORS) this.vals[s.id] = 50;
    this._moved = false;
  }

  async setup() {
    await super.setup();
    this.root.insertAdjacentHTML('beforeend', `
      <div class="spm">
        <div class="pad">
          <p class="kicker">A real economy is mixed - by sector, not in the average</p>
          <h2>Slide each sector to its <b>right place</b>. Mixed is not 50-50.</h2>
          <div class="legend"><span>PLANNED (state)</span><span>FREE (private)</span></div>
          <div class="rows">
            ${SECTORS.map((s) => `
              <div class="srow" data-sector="${s.id}">
                <span class="lbl">${s.label}</span>
                <input type="range" min="0" max="100" value="50" data-slider="${s.id}">
                <span class="val" data-val="${s.id}">50</span>
              </div>
            `).join('')}
          </div>
          <p class="verdict" data-verdict>Slide each sector. Defence and primary schools are not the same as restaurants.</p>
        </div>
      </div>
    `);

    this.quill = SimMascotDom.mount(this.root, { x: 250, y: 590, height: 100, bubbleSide: 'right' });
    this.injectStyle(CSS + SimMascotDom.styles());

    for (const s of SECTORS) {
      const slider = this.root.querySelector(`[data-slider="${s.id}"]`);
      slider.addEventListener('input', () => {
        this.vals[s.id] = Number(slider.value);
        this._moved = true;
        this.root.querySelector(`[data-val="${s.id}"]`).textContent = String(this.vals[s.id]);
      });
    }
    this.quill.speak('One slider for every sector. Defence is not restaurants.', 5200);
  }

  destroy() {
    this.quill?.destroy();
    this.quill = null;
    super.destroy();
  }

  checkObjective() {
    if (!this._moved) return null;
    let wrong = 0;
    const wrongSectors = [];
    for (const s of SECTORS) {
      const v = this.vals[s.id];
      const el = this.root.querySelector(`[data-sector="${s.id}"]`);
      if (v >= s.sensibleMin && v <= s.sensibleMax) { el.dataset.ok = '1'; el.dataset.bad = '0'; }
      else { el.dataset.ok = '0'; el.dataset.bad = '1'; wrong += 1; wrongSectors.push(s); }
    }
    const verdict = this.root.querySelector('[data-verdict]');
    if (wrong === 0) {
      verdict.dataset.ok = '1';
      verdict.dataset.bad = '0';
      verdict.textContent = 'All five sectors in their sensible range. Mixed is per-sector, not in the average - the lesson lands.';
      this.quill?.perform('hop');
      return { ok: true };
    }
    verdict.dataset.ok = '0';
    verdict.dataset.bad = '1';
    const allPlanned = wrongSectors.length >= 3 && wrongSectors.every((s) => this.vals[s.id] < 30);
    const allFree = wrongSectors.length >= 3 && wrongSectors.every((s) => this.vals[s.id] > 70);
    if (allFree) {
      verdict.textContent = 'You pushed everything toward FREE. Defence, primary schools, and the power grid are not pure-private sectors - the state stays in them for a reason.';
    } else if (allPlanned) {
      verdict.textContent = 'You pushed everything toward PLANNED. Mobile phones and restaurants are not state-run in any mixed economy - the lesson is per-sector mix, not a single dial.';
    } else {
      verdict.textContent = `${wrong} of 5 are off. Mixed is not 50-50: some sectors lean state (defence, primary schools), some lean private (mobile phones, restaurants).`;
    }
    this.quill?.setExpression('surprised');
    return { ok: false, hint: verdict.textContent };
  }
}
