import { DomSimulation } from 'simulations/base/DomSimulation.js';
import { withChallenge } from 'simulations/base/ChallengeMode.js';
import { SimMascotDom } from 'simulations/base/SimMascotDom.js';

/**
 * PricePinchGame - mini-game for les-07, hosted by mini-game@1.
 *
 * Tie level L3 (strategy). The lesson's load-bearing claim is that
 * prices coordinate buyers and sellers. The text (blk-l07-s01) shows
 * rain doubling umbrella demand; the planned-economy beat (blk-l07-s03)
 * shows the shelves empty when prices are fixed. The number that is
 * easy to gloss over is that the EQUILIBRIUM price is the single price
 * at which supply meets demand - not "low" (creates shortage) and not
 * "high" (creates surplus).
 *
 * The game makes the equilibrium-finding the only way to win. 6
 * buyers each with a maximum willingness-to-pay, 6 sellers each with
 * a minimum acceptable price. The student sets a single market price.
 * The win condition: every buyer whose willingness >= price gets a
 * unit; every seller whose minimum <= price sells a unit. At
 * equilibrium, the count of buyers and sellers at that price matches,
 * and the market clears with no shortage and no surplus.
 *
 * Designed-in wrong attractor: setting a "fair" or "low" price
 * (e.g. 100) to be kind to buyers. The lesson names the price as
 * the SIGNAL, not a gift; a price below all sellers' minimums
 * creates a shortage that the market cannot fix, and a price
 * above all buyers' willingness creates unsold stock. The student
 * who picks the lowest number or the highest number misses what
 * the price is FOR.
 *
 * Built on DomSimulation rather than CanvasSimulation for the reason
 * the kit gives for new games: Quill is an SVG rig, so SimMascotDom
 * drops him straight into this.root with no canvas port, and every
 * colour is a live var(--sim-*) with no fallback table to go stale.
 */

const W = 900;
const H = 600;

// Willingness-to-pay (in rupees), one per buyer.
const BUYERS = [80, 120, 150, 200, 240, 300];
// Minimum acceptable price, one per seller.
const SELLERS = [100, 130, 170, 220, 250, 290];

// Equilibrium: the price at which #buyers whose willingness >= price
// equals #sellers whose minimum <= price. Find by stepping.
function eqPrice() {
  // Find the largest price where demand >= supply.
  let candidates = [];
  for (const p of [80, 100, 120, 130, 150, 170, 200, 220, 240, 250, 290, 300]) {
    const demand = BUYERS.filter((w) => w >= p).length;
    const supply = SELLERS.filter((m) => m <= p).length;
    if (demand === supply) candidates.push({ p, demand, supply });
  }
  return candidates[candidates.length - 1] || { p: 200, demand: 3, supply: 3 };
}

const TARGET = eqPrice();  // e.g. { p: 200, demand: 3, supply: 3 }

const CSS = `
.ppr { position: absolute; inset: 0; font-family: var(--sim-font); color: var(--sim-label); }
.ppr .pad { position: absolute; inset: 0; padding: 22px 28px; box-sizing: border-box;
           display: flex; flex-direction: column; gap: 12px; }
.ppr .kicker { font-size: 13px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase;
              color: var(--sim-label-muted); margin: 0; }
.ppr h2 { font-family: var(--sim-font-display); font-size: 24px; font-weight: 700; margin: 0; line-height: 1.2; }
.ppr h2 b { color: var(--sim-accent); }
.ppr .row { display: flex; gap: 14px; }
.ppr .col { flex: 1; background: var(--sim-bg-surface); border: 2px solid var(--sim-border);
          border-radius: 12px; padding: 10px 12px; }
.ppr .col h3 { font-size: 12px; letter-spacing: 0.1em; text-transform: uppercase;
              color: var(--sim-label-muted); margin: 0 0 6px; }
.ppr .col .bar { font-size: 16px; font-weight: 800; margin: 0 0 6px; }
.ppr .demand { color: var(--sim-series-3); }
.ppr .supply { color: var(--sim-series-1); }
.ppr .price-line { display: flex; flex-direction: column; gap: 8px; padding: 14px 16px;
                 background: var(--sim-panel); border: 2px solid var(--sim-border); border-radius: 12px; }
.ppr .price-line label { display: flex; justify-content: space-between; align-items: center;
                         font-size: 15px; font-weight: 700; }
.ppr .price-line input { width: 60%; }
.ppr .out { display: flex; gap: 12px; }
.ppr .out .pill { flex: 1; padding: 10px; border-radius: 10px; text-align: center;
                 background: var(--sim-bg-surface); border: 2px solid var(--sim-border); }
.ppr .out .pill .k { font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase;
                    color: var(--sim-label-muted); }
.ppr .out .pill .v { font-size: 20px; font-weight: 800; }
.ppr .out .pill .v.demand { color: var(--sim-series-3); }
.ppr .out .pill .v.supply { color: var(--sim-series-1); }
.ppr .out .pill .v.match   { color: var(--sim-success); }
.ppr .out .pill .v.miss    { color: var(--sim-error); }
.ppr .verdict { font-size: 14px; padding: 10px 12px; border-radius: 10px; background: var(--sim-bg-surface);
              border: 2px solid var(--sim-border); margin: 0; }
.ppr .verdict[data-ok="1"] { border-color: var(--sim-success); color: var(--sim-success); }
.ppr .verdict[data-bad="1"] { border-color: var(--sim-error); color: var(--sim-error); }
`;

export class PricePinchGame extends withChallenge(DomSimulation) {
  static simId = 'price-pinch-game';
  static label = { en: 'Price Pinch' };
  static category = 'social-science.economics';
  static WIDTH = W;
  static HEIGHT = H;
  static ARIA_LABEL =
    'A market of six buyers and six sellers. Set one price. At that price, count who buys and who sells. The market clears only when both numbers match.';
  static OBJECTIVE = {
    prompt: {
      en: 'Set ONE price. The market clears only when the number of buyers at that price equals the number of sellers at that price.',
    },
  };
  static SCORING = { mode: 'accuracy' };
  static CONTROLS = [];

  constructor(container, config) {
    super(container, config);
    this.price = 100;
    this._moved = false;
  }

  async setup() {
    await super.setup();
    this.root.insertAdjacentHTML('beforeend', `
      <div class="ppr">
        <div class="pad">
          <p class="kicker">The price is a signal, not a gift</p>
          <h2>Set one price. The market <b>clears only when buyers = sellers</b>.</h2>
          <div class="row">
            <div class="col">
              <h3>Buyers - max willing to pay</h3>
              <p class="bar">${BUYERS.join(' / ')}</p>
            </div>
            <div class="col">
              <h3>Sellers - min acceptable</h3>
              <p class="bar">${SELLERS.join(' / ')}</p>
            </div>
          </div>
          <div class="price-line">
            <label>Market price (₹):
              <input type="range" min="50" max="350" value="100" step="10" data-slider>
              <span data-price-out>100</span>
            </label>
          </div>
          <div class="out">
            <div class="pill"><div class="k">Buyers at price</div><div class="v demand" data-demand>0</div></div>
            <div class="pill"><div class="k">Sellers at price</div><div class="v supply" data-supply>0</div></div>
            <div class="pill"><div class="k">Market status</div><div class="v miss" data-status>shortage</div></div>
          </div>
          <p class="verdict" data-verdict>Move the price until the two counts match. The price is the signal, not a gift.</p>
        </div>
      </div>
    `);

    this.quill = SimMascotDom.mount(this.root, { x: 250, y: 590, height: 100, bubbleSide: 'right' });
    this.injectStyle(CSS + SimMascotDom.styles());

    this._slider = this.root.querySelector('[data-slider]');
    this._slider.addEventListener('input', () => {
      this.price = Number(this._slider.value);
      this._moved = true;
      this._render();
    });
    this._render();
    this.quill.speak('Too low: empty shelves. Too high: unsold stock. Find the number that clears the market.', 5200);
  }

  destroy() {
    this.quill?.destroy();
    this.quill = null;
    super.destroy();
  }

  _render() {
    this.root.querySelector('[data-price-out]').textContent = String(this.price);
    const demand = BUYERS.filter((w) => w >= this.price).length;
    const supply = SELLERS.filter((m) => m <= this.price).length;
    this.root.querySelector('[data-demand]').textContent = String(demand);
    this.root.querySelector('[data-supply]').textContent = String(supply);
    const status = this.root.querySelector('[data-status]');
    if (demand > supply) { status.textContent = 'shortage'; status.className = 'v miss'; }
    else if (demand < supply) { status.textContent = 'surplus'; status.className = 'v miss'; }
    else { status.textContent = 'clears'; status.className = 'v match'; }
  }

  checkObjective() {
    if (!this._moved) return null;
    const demand = BUYERS.filter((w) => w >= this.price).length;
    const supply = SELLERS.filter((m) => m <= this.price).length;
    const clears = demand === supply;
    const verdict = this.root.querySelector('[data-verdict]');
    if (clears) {
      verdict.dataset.ok = '1';
      verdict.dataset.bad = '0';
      verdict.textContent = `At ₹${this.price} the market clears: ${demand} buyers, ${supply} sellers. The price is the signal.`;
      this.quill?.perform('hop');
      return { ok: true };
    }
    verdict.dataset.ok = '0';
    verdict.dataset.bad = '1';
    if (demand > supply) {
      verdict.textContent = `₹${this.price} is too low. ${demand} buyers want in, only ${supply} sellers will take that price - shelves empty.`;
    } else {
      verdict.textContent = `₹${this.price} is too high. ${supply} sellers will sell, only ${demand} buyers will pay that - stock sits.`;
    }
    this.quill?.setExpression('surprised');
    return { ok: false, hint: verdict.textContent };
  }
}
