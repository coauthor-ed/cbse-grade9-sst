import { DomSimulation } from 'simulations/base/DomSimulation.js';
import { withChallenge } from 'simulations/base/ChallengeMode.js';
import { SimMascotDom } from 'simulations/base/SimMascotDom.js';

/**
 * MajorityGatesGame - mini-game for les-03, hosted by mini-game@1.
 *
 * Tie level L3 (strategy). The lesson's BossDial hook (blk-l03-s01) and the
 * Universal Adult Franchise beat (blk-l03-s03) land the principle that the
 * government's authority comes from the people and is filtered through
 * elections. The next lesson (L04 s06) introduces the formal >50% rule.
 * Here, the principle lands on the number: 272 of 543 is the working
 * majority that any party or coalition must cross to form the Lok Sabha
 * government.
 *
 * The trap: the largest single party does NOT form the government if it is
 * below 50%. The game has 5 parties whose seats sum to 543, with one party
 * holding 270 - the largest single block, but exactly two short of the
 * majority. The student must form a coalition. The natural wrong answer is
 * "270 is biggest, they govern alone" - the lesson s04's separation of
 * powers and L04 s06's >50% rule both fail if that goes unchallenged.
 *
 *   Party A  270   <- largest, alone LOSES (270 < 272)
 *   Party B   90
 *   Party C   80
 *   Party D   60
 *   Party E    43   = 543 total
 *
 * Only coalitions summing to 272+ form the government; Party A + any one of
 * Party B / Party C / Party D / Party E is enough. The strategy insight: the smallest
 * partner you can find is the cheapest deal - a real political lesson.
 *
 * Built on DomSimulation rather than CanvasSimulation for the reason the kit
 * gives for new games: Quill is an SVG rig, so SimMascotDom drops him straight
 * into this.root with no canvas port, and every colour is a live var(--sim-*)
 * with no fallback table to go stale.
 */

const W = 900;
const H = 600;

const PARTIES = [
  { id: 'a', name: 'Party A', seats: 270, color: 'var(--sim-series-1)' },
  { id: 'b', name: 'Party B', seats: 90,  color: 'var(--sim-series-2)' },
  { id: 'c', name: 'Party C', seats: 80,  color: 'var(--sim-series-3)' },
  { id: 'd', name: 'Party D', seats: 60,  color: 'var(--sim-series-4)' },
  { id: 'e',  name: 'Party E',  seats: 43,  color: 'var(--sim-series-5)' },
];
const TOTAL = PARTIES.reduce((s, p) => s + p.seats, 0);   // 543
const MAJORITY = Math.floor(TOTAL / 2) + 1;                // 272

const CSS = `
.mg { position: absolute; inset: 0; font-family: var(--sim-font); color: var(--sim-label);
      display: flex; flex-direction: column; gap: 12px; padding: 22px 28px; box-sizing: border-box; }
.mg .kicker { font-size: 13px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase;
             color: var(--sim-label-muted); margin: 0; }
.mg h2 { font-family: var(--sim-font-display); font-size: 24px; font-weight: 700; margin: 0; line-height: 1.2; }
.mg h2 b { color: var(--sim-accent); }

.mg .parties { display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; }
.mg .party {
  border: 2px solid var(--sim-border); border-radius: 12px; padding: 10px 8px;
  background: var(--sim-bg-surface); text-align: center; cursor: pointer;
  transition: transform 100ms, border-color 140ms;
}
.mg .party:hover { transform: translateY(-2px); border-color: var(--sim-accent); }
.mg .party[aria-pressed="true"] { border-color: var(--sim-accent); background: var(--sim-panel); }
.mg .party .pname { font-size: 16px; font-weight: 800; }
.mg .party .pseats { font-size: 13px; color: var(--sim-label-muted); margin-top: 2px; }
.mg .party .pseats b { color: var(--sim-gold); }

.mg .bar { width: 100%; height: 36px; border-radius: 8px; background: var(--sim-bg-deep);
           border: 2px solid var(--sim-border); overflow: hidden; position: relative; }
.mg .bar .barfill { position: absolute; left: 0; top: 0; height: 100%;
                    background: var(--sim-accent); transition: width 200ms; }
.mg .bar .barmark { position: absolute; left: 50.09%; top: -2px; bottom: -2px;
                    width: 2px; background: var(--sim-warning); }
.mg .bar .barlabel { position: absolute; top: 0; bottom: 0; display: flex; align-items: center;
                     font-size: 12px; font-weight: 700; padding: 0 10px; }

.mg .row { display: flex; justify-content: space-between; align-items: baseline; padding: 5px 0; }
.mg .row span:first-child { color: var(--sim-label-muted); font-size: 14px; }
.mg .row span:last-child { font-size: 18px; font-weight: 700; }
.mg .row .verdict { font-size: 16px; padding: 4px 10px; border-radius: 8px; }
.mg .row .verdict.ok { background: var(--sim-success); color: var(--sim-bg-deep); }
.mg .row .verdict.no { background: var(--sim-error); color: var(--sim-bg-deep); }
.mg .foot { font-size: 14px; color: var(--sim-label-muted); margin: 0; }
`;

export class MajorityGatesGame extends withChallenge(DomSimulation) {
  static simId = 'majority-gates-game';
  static label = { en: 'The Majority Gates' };
  static category = 'social-studies.democracy';
  static WIDTH = W;
  static HEIGHT = H;
  static ARIA_LABEL =
    'Five parties in the Lok Sabha. The total is 543 seats. Tap parties to add them to your coalition. Form a coalition with 272 or more seats to form the government.';
  static OBJECTIVE = {
    prompt: {
      en: 'The Lok Sabha has 543 seats. The biggest single party is 270 - two short. Form a government by choosing parties whose seats add to 272 or more.',
    },
  };
  static SCORING = { mode: 'accuracy' };
  static CONTROLS = [];

  constructor(container, config) {
    super(container, config);
    this.coalition = new Set();
  }

  async setup() {
    await super.setup();
    this.root.insertAdjacentHTML('beforeend', `
      <div class="mg">
        <p class="kicker">The Lok Sabha coalition problem</p>
        <h2>No single party is at <b>272</b>. <b>Build one.</b></h2>
        <div class="parties">
          ${PARTIES.map((p) => `
            <button type="button" class="party" data-party="${p.id}" aria-pressed="false">
              <div class="pname">${p.name}</div>
              <div class="pseats"><b>${p.seats}</b> seats</div>
            </button>`).join('')}
        </div>
        <div class="bar">
          <div class="barfill" data-barfill style="width:0%"></div>
          <div class="barmark"></div>
          <div class="barlabel" style="left:50.09%; color: var(--sim-warning);">272</div>
          <div class="barlabel" data-barlabel style="left:6px; color: var(--sim-label-muted);">0</div>
        </div>
        <div class="row"><span>Coalition total</span><span data-total>0 / 543</span></div>
        <div class="row"><span>Verdict</span><span class="verdict no" data-verdict>no government yet</span></div>
        <p class="foot">A government must have a working majority - strictly more than half the house. The largest single block is not enough.</p>
      </div>
    `);

    this.quill = SimMascotDom.mount(this.root, { x: 820, y: 250, height: 110, flip: true, bubbleSide: 'left' });
    this.injectStyle(CSS + SimMascotDom.styles());

    for (const p of PARTIES) {
      this.root.querySelector(`[data-party="${p.id}"]`).addEventListener('click', () => {
        if (this.coalition.has(p.id)) this.coalition.delete(p.id);
        else this.coalition.add(p.id);
        this._render();
      });
    }
    this._render();
    this.quill.speak('Plurality is not power - 270 of 543 is still a minority.', 5200);
  }

  destroy() {
    this.quill?.destroy();
    this.quill = null;
    super.destroy();
  }

  _render() {
    let total = 0;
    for (const p of PARTIES) {
      const el = this.root.querySelector(`[data-party="${p.id}"]`);
      el.setAttribute('aria-pressed', this.coalition.has(p.id) ? 'true' : 'false');
      if (this.coalition.has(p.id)) total += p.seats;
    }
    const fill = this.root.querySelector('[data-barfill]');
    fill.style.width = `${(total / TOTAL) * 100}%`;
    this.root.querySelector('[data-total]').textContent = `${total} / ${TOTAL}`;
    this.root.querySelector('[data-barlabel]').textContent = `${total}`;

    const verdict = this.root.querySelector('[data-verdict]');
    if (this.coalition.size === 0) {
      verdict.textContent = 'no government yet';
      verdict.className = 'verdict no';
    } else if (total >= MAJORITY) {
      verdict.textContent = 'GOVERNMENT FORMS';
      verdict.className = 'verdict ok';
    } else {
      const need = MAJORITY - total;
      verdict.textContent = `still ${need} short`;
      verdict.className = 'verdict no';
    }
  }

  checkObjective() {
    if (this.coalition.size === 0) return null;
    let total = 0;
    for (const p of PARTIES) if (this.coalition.has(p.id)) total += p.seats;
    if (total >= MAJORITY) {
      this.quill?.perform('hop');
      return { ok: true };
    }
    this.quill?.setExpression('surprised');
    return {
      ok: false,
      hint: `${total} is not a working majority. A government needs 272 - more than half the 543-seat house. The biggest single party alone always loses.`,
    };
  }
}
