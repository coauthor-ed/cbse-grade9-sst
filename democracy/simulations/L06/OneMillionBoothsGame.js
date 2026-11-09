import { DomSimulation } from 'simulations/base/DomSimulation.js';
import { withChallenge } from 'simulations/base/ChallengeMode.js';
import { SimMascotDom } from 'simulations/base/SimMascotDom.js';

/**
 * OneMillionBoothsGame - mini-game for les-06, hosted by mini-game@1.
 *
 * Tie level L3 (strategy). The lesson's scale-shock (blk-l06-s01) names
 * 96.8 crore registered voters and 10 lakh+ polling stations. The grid
 * scene (blk-l06-s02) lands 1 MP ~ 25 lakh people. The puzzle the chapter
 * leaves implicit is operational: a polling booth can handle a fixed
 * number of voters per day. If you have too few booths, lines stretch
 * past midnight and people leave; if you set up too many, you waste
 * officers and paper.
 *
 * The game gives a region with 4 booth types (capacity 100, 200, 500,
 * 1000 voters/day) and 5 districts with different voter counts
 * (scaled from the chapter: 1000, 2000, 2500, 5000, 5300). The student
 * assigns ONE booth type to each district. The win condition is that
 * no district is short (every voter can vote in one day) and no
 * district is more than 30% over capacity (waste of an officer day).
 *
 * The wrong attractor is "bigger booths are better" - assign 1000-voter
 * booths everywhere. The 1000-voter district wastes 0% (good), the
 * 5300-voter district needs 6 booths, fine, but the 1000-voter district
 * also gets one 1000-voter booth and wastes nothing - that looks right
 * but the puzzle is that the 2000-voter district then only fits 1000
 * and half the voters miss the day. The student must mix booth types
 * to match each district. The 5300-voter district is the only one
 * that strictly needs 1000-capacity booths (6 of them); the smaller
 * districts accept smaller booths.
 *
 * Built on DomSimulation rather than CanvasSimulation for the reason the kit
 * gives for new games: Quill is an SVG rig, so SimMascotDom drops him straight
 * into this.root with no canvas port, and every colour is a live var(--sim-*)
 * with no fallback table to go stale.
 */

const W = 900;
const H = 600;

const BOOTHS = [
  { id: 'b100',  name: '100-voter booth',  capacity: 100,  cost: 1 },
  { id: 'b500',  name: '500-voter booth',  capacity: 500,  cost: 4 },
  { id: 'b1200', name: '1200-voter booth', capacity: 1200, cost: 7 },
  { id: 'b1500', name: '1500-voter booth', capacity: 1500, cost: 9 },
];

const DISTRICTS = [
  { id: 'd1', name: 'Hill district',      voters: 100,  idealBooth: 'b100'  },
  { id: 'd2', name: 'Forest district',    voters: 450,  idealBooth: 'b500'  },
  { id: 'd3', name: 'Riverbank district', voters: 1100, idealBooth: 'b1200' },
  { id: 'd4', name: 'Plains district',    voters: 1350, idealBooth: 'b1500' },
  { id: 'd5', name: 'Metro district',     voters: 1450, idealBooth: 'b1500' },
];

const MAX_OVER = 1.30;  // 30% waste tolerated

const CSS = `
.omb { position: absolute; inset: 0; font-family: var(--sim-font); color: var(--sim-label);
        display: flex; flex-direction: column; gap: 10px; padding: 22px 28px; box-sizing: border-box; }
.omb .kicker { font-size: 13px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase;
              color: var(--sim-label-muted); margin: 0; }
.omb h2 { font-family: var(--sim-font-display); font-size: 23px; font-weight: 700; margin: 0; line-height: 1.2; }
.omb h2 b { color: var(--sim-accent); }

.omb .districts { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.omb .drow {
  border: 2px solid var(--sim-border); border-radius: 12px; padding: 10px 12px;
  background: var(--sim-bg-surface); display: flex; flex-direction: column; gap: 6px;
}
.omb .drow .dname { font-size: 14px; font-weight: 800; margin: 0; }
.omb .drow .dinfo { font-size: 12px; color: var(--sim-label-muted); margin: 0 0 4px; }
.omb .drow .picker { display: flex; gap: 5px; }
.omb .drow .picker button {
  flex: 1; font-family: var(--sim-font); font-size: 11px; font-weight: 700;
  padding: 6px 2px; border-radius: 7px; cursor: pointer;
  background: var(--sim-bg-deep); color: var(--sim-label);
  border: 2px solid var(--sim-border); line-height: 1.15;
}
.omb .drow .picker button[aria-pressed="true"] { background: var(--sim-accent); color: var(--sim-bg-deep); border-color: var(--sim-accent); }
.omb .drow .verdict { font-size: 12px; font-weight: 800; }
.omb .drow .verdict.ok { color: var(--sim-success); }
.omb .drow .verdict.short { color: var(--sim-error); }
.omb .drow .verdict.waste { color: var(--sim-warning); }
.omb .drow .verdict.pending { color: var(--sim-label-muted); }

.omb .legend { display: flex; gap: 14px; font-size: 12px; color: var(--sim-label-muted); margin: 0; }
.omb .legend b { color: var(--sim-label); }
.omb .foot { font-size: 14px; color: var(--sim-label-muted); margin: 0; }
`;

export class OneMillionBoothsGame extends withChallenge(DomSimulation) {
  static simId = 'one-million-booths-game';
  static label = { en: 'One Million Booths' };
  static category = 'social-studies.democracy';
  static WIDTH = W;
  static HEIGHT = H;
  static ARIA_LABEL =
    'Five districts, four booth sizes. Pick a booth type for each district. Each booth has a fixed daily capacity; the district must be fully served without much waste.';
  static OBJECTIVE = {
    prompt: {
      en: 'Each district gets one booth type. Every voter must be able to vote in a single day - and no district should waste more than 30% of the booth\'s day.',
    },
  };
  static SCORING = { mode: 'accuracy' };
  static CONTROLS = [];

  constructor(container, config) {
    super(container, config);
    this.picks = {};
    for (const d of DISTRICTS) this.picks[d.id] = null;
  }

  async setup() {
    await super.setup();
    this.root.insertAdjacentHTML('beforeend', `
      <div class="omb">
        <p class="kicker">Booth allocation across 5 districts</p>
        <h2>Match each district to a <b>booth that fits</b> - no shortage, no waste.</h2>
        <div class="districts">
          ${DISTRICTS.map((d) => `
            <div class="drow" data-district="${d.id}">
              <p class="dname">${d.name}</p>
              <p class="dinfo">${d.voters.toLocaleString('en-IN')} voters to serve in one day</p>
              <div class="picker" data-picker="${d.id}">
                ${BOOTHS.map((b) => `
                  <button type="button" data-booth="${b.id}" aria-pressed="false">${b.capacity}/day</button>
                `).join('')}
              </div>
              <p class="verdict pending" data-verdict="${d.id}">no booth chosen</p>
            </div>`).join('')}
        </div>
        <p class="legend"><span><b>Shortage</b> = voters turned away</span><span><b>Waste</b> = officers idle</span></p>
        <p class="foot">A bigger booth is not always better. 1000/day on a 100-voter district is an officer sitting alone.</p>
      </div>
    `);

    this.quill = SimMascotDom.mount(this.root, { x: 250, y: 580, height: 110, bubbleSide: 'right' });
    this.injectStyle(CSS + SimMascotDom.styles());

    for (const d of DISTRICTS) {
      const picker = this.root.querySelector(`[data-picker="${d.id}"]`);
      picker.querySelectorAll('button').forEach((btn) => {
        btn.addEventListener('click', () => {
          this.picks[d.id] = this.picks[d.id] === btn.dataset.booth ? null : btn.dataset.booth;
          this._render();
        });
      });
    }
    this._render();
    this.quill.speak('10 lakh booths for 96.8 crore voters is not a coincidence.', 5200);
  }

  destroy() {
    this.quill?.destroy();
    this.quill = null;
    super.destroy();
  }

  _render() {
    for (const d of DISTRICTS) {
      const btn = this.picks[d.id];
      const picker = this.root.querySelector(`[data-picker="${d.id}"]`);
      picker.querySelectorAll('button').forEach((b) => {
        b.setAttribute('aria-pressed', b.dataset.booth === btn ? 'true' : 'false');
      });
      const verdict = this.root.querySelector(`[data-verdict="${d.id}"]`);
      if (!btn) {
        verdict.textContent = 'no booth chosen';
        verdict.className = 'verdict pending';
      } else {
        const cap = BOOTHS.find((b) => b.id === btn).capacity;
        const ratio = d.voters / cap;
        if (ratio > 1) {
          const short = Math.round(d.voters - cap);
          verdict.textContent = `short by ${short} voters`;
          verdict.className = 'verdict short';
        } else if (ratio > MAX_OVER ? false : (1 - ratio) > (MAX_OVER - 1)) {
          // unused
        }
        if (ratio <= 1 && (1 - ratio) > (MAX_OVER - 1)) {
          const idle = Math.round((1 - ratio) * 100);
          verdict.textContent = `${idle}% of the day wasted`;
          verdict.className = 'verdict waste';
        } else if (ratio <= 1) {
          verdict.textContent = `fits with ${Math.round((1 - ratio) * 100)}% to spare`;
          verdict.className = 'verdict ok';
        } else {
          // short already set
        }
      }
    }
  }

  checkObjective() {
    if (Object.values(this.picks).some((v) => v === null)) return null;
    let ok = true;
    for (const d of DISTRICTS) {
      const cap = BOOTHS.find((b) => b.id === this.picks[d.id]).capacity;
      const ratio = d.voters / cap;
      if (ratio > 1) ok = false;
      if (ratio <= 1 && (1 - ratio) > (MAX_OVER - 1)) ok = false;
    }
    if (ok) {
      this.quill?.perform('hop');
      return { ok: true };
    }
    this.quill?.setExpression('surprised');
    return {
      ok: false,
      hint: 'A district with voters > booth capacity = some voters turned away. A district with voters < 70% of capacity = most of the day wasted. Match the booth to the district.',
    };
  }
}
