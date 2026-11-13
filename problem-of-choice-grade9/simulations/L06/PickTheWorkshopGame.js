import { DomSimulation } from 'simulations/base/DomSimulation.js';
import { withChallenge } from 'simulations/base/ChallengeMode.js';
import { SimMascotDom } from 'simulations/base/SimMascotDom.js';

/**
 * PickTheWorkshopGame - mini-game for les-06, hosted by mini-game@1.
 *
 * Tie level L3 (strategy). The lesson's load-bearing claim is that the
 * how-to-produce choice is a function of FIVE dials: wage level, machine
 * cost, technology, product nature, labour laws. The text (blk-l06-s05)
 * names the five dials and lets the workshop respond. The number that
 * is easy to gloss over is that NO SINGLE DIAL decides - the right
 * workshop depends on which dials are in which state.
 *
 * The game makes the dial-reading the only way to win. 4 orders, each
 * with a different combination of dial states (cheap labour, expensive
 * machines, simple product, complex product, etc.). For each order
 * the student must pick the right workshop: hands (for bespoke, high
 * skill) or machines (for uniform, high volume, tight regulation).
 *
 * Designed-in wrong attractor: ALWAYS choosing machines. The lesson
 * says machines save money when machines are cheap and labour is
 * expensive AND the product is uniform AND the law allows it. A
 * bespoke silk sari with a master tailor, even with expensive
 * machines available, should be made by hand. The student who
 * always picks machines gets the right answer on the uniform shirts
 * and the wrong one on the sari.
 *
 * Built on DomSimulation rather than CanvasSimulation for the reason
 * the kit gives for new games: Quill is an SVG rig, so SimMascotDom
 * drops him straight into this.root with no canvas port, and every
 * colour is a live var(--sim-*) with no fallback table to go stale.
 */

const W = 900;
const H = 600;

const ORDERS = [
  {
    id: 'sari',
    desc: 'A bespoke Banarasi silk sari for a wedding',
    dials: 'Hand-stitch only - high skill, low volume, premium price, customer specific.',
    answer: 'hands',
  },
  {
    id: 'shirts',
    desc: '5,000 identical school shirts, deadline Friday',
    dials: 'Uniform product, volume matters, machine cost ₹1200/day (less than 4 workers), child-labour law risk.',
    answer: 'machines',
  },
  {
    id: 'suit',
    desc: 'A made-to-measure business suit for a CEO',
    dials: 'Bespoke fit, premium customer, no economies of scale, skill is the value.',
    answer: 'hands',
  },
  {
    id: 'masks',
    desc: '20,000 surgical masks, regulator audit next week',
    dials: 'Uniform, audit demands traceability, machines cheaper, child-labour law on the line.',
    answer: 'machines',
  },
];

const CSS = `
.ptw { position: absolute; inset: 0; font-family: var(--sim-font); color: var(--sim-label); }
.ptw .pad { position: absolute; inset: 0; padding: 22px 28px; box-sizing: border-box;
           display: flex; flex-direction: column; gap: 10px; }
.ptw .kicker { font-size: 13px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase;
              color: var(--sim-label-muted); margin: 0; }
.ptw h2 { font-family: var(--sim-font-display); font-size: 24px; font-weight: 700; margin: 0; line-height: 1.2; }
.ptw h2 b { color: var(--sim-accent); }
.ptw .orders { display: flex; flex-direction: column; gap: 10px; flex: 1; min-height: 0; overflow: auto; }
.ptw .order { background: var(--sim-bg-surface); border: 2px solid var(--sim-border);
             border-radius: 14px; padding: 12px 16px; display: flex; flex-direction: column; gap: 6px; }
.ptw .order[data-ok="1"] { border-color: var(--sim-success); }
.ptw .order[data-bad="1"] { border-color: var(--sim-error); }
.ptw .order .top { display: flex; justify-content: space-between; align-items: baseline; gap: 12px; }
.ptw .order .desc { font-size: 16px; font-weight: 800; }
.ptw .order .dials { font-size: 13px; color: var(--sim-label-muted); }
.ptw .order .pick { display: flex; gap: 8px; }
.ptw .order .pick button { flex: 1; padding: 9px; font-family: var(--sim-font); font-size: 14px; font-weight: 700;
                          background: var(--sim-bg-deep); color: var(--sim-label);
                          border: 2px solid var(--sim-border); border-radius: 10px; cursor: pointer; }
.ptw .order .pick button[aria-pressed="true"] { background: var(--sim-accent); color: var(--sim-bg-deep);
                                                 border-color: var(--sim-accent); }
.ptw .order .pick button[data-val="hands"][aria-pressed="true"] { background: var(--sim-series-1); color: var(--sim-bg-deep); border-color: var(--sim-series-1); }
.ptw .order .pick button[data-val="machines"][aria-pressed="true"] { background: var(--sim-series-3); color: var(--sim-bg-deep); border-color: var(--sim-series-3); }
.ptw .verdict { font-size: 14px; padding: 8px 12px; border-radius: 10px; background: var(--sim-bg-surface);
              border: 2px solid var(--sim-border); margin: 0; }
.ptw .verdict[data-ok="1"] { border-color: var(--sim-success); color: var(--sim-success); }
.ptw .verdict[data-bad="1"] { border-color: var(--sim-error); color: var(--sim-error); }
`;

export class PickTheWorkshopGame extends withChallenge(DomSimulation) {
  static simId = 'pick-the-workshop-game';
  static label = { en: 'Pick the Workshop' };
  static category = 'social-science.economics';
  static WIDTH = W;
  static HEIGHT = H;
  static ARIA_LABEL =
    'Four orders, each with a different combination of wage, machine cost, product, technology, and law conditions. Pick HANDS or MACHINES for each order.';
  static OBJECTIVE = {
    prompt: {
      en: 'Four orders. Different conditions. Pick HANDS or MACHINES for each one. The choice is a function of all five dials, not a default.',
    },
  };
  static SCORING = { mode: 'accuracy' };
  static CONTROLS = [];

  constructor(container, config) {
    super(container, config);
    this.picks = {};
  }

  async setup() {
    await super.setup();
    this.root.insertAdjacentHTML('beforeend', `
      <div class="ptw">
        <div class="pad">
          <p class="kicker">The five dials, four orders</p>
          <h2>Pick <b>HANDS</b> or <b>MACHINES</b> for each order. <b>No default.</b></h2>
          <div class="orders">
            ${ORDERS.map((o) => `
              <div class="order" data-order="${o.id}">
                <div class="top">
                  <span class="desc">${o.desc}</span>
                </div>
                <p class="dials">${o.dials}</p>
                <div class="pick" data-pick="${o.id}">
                  <button type="button" data-val="hands" aria-pressed="false">HANDS - masterji + helpers</button>
                  <button type="button" data-val="machines" aria-pressed="false">MACHINES - leased line</button>
                </div>
              </div>
            `).join('')}
          </div>
          <p class="verdict" data-verdict>Read the dials. HANDS for bespoke, MACHINES for uniform volume and law-bound runs. Neither wins by default.</p>
        </div>
      </div>
    `);

    this.quill = SimMascotDom.mount(this.root, { x: 250, y: 590, height: 100, bubbleSide: 'right' });
    this.injectStyle(CSS + SimMascotDom.styles());

    for (const pick of this.root.querySelectorAll('.pick')) {
      const orderId = pick.dataset.pick;
      for (const btn of pick.querySelectorAll('button')) {
        btn.addEventListener('click', () => {
          this.picks[orderId] = btn.dataset.val;
          for (const b of pick.querySelectorAll('button')) b.setAttribute('aria-pressed', b === btn ? 'true' : 'false');
        });
      }
    }
    this.quill.speak('Machines are not always the answer. Read the order, not the default.', 5200);
  }

  destroy() {
    this.quill?.destroy();
    this.quill = null;
    super.destroy();
  }

  checkObjective() {
    const picked = Object.values(this.picks).filter((x) => x).length;
    if (picked < ORDERS.length) return null;
    let wrong = 0;
    const wrongOrders = [];
    for (const o of ORDERS) {
      const el = this.root.querySelector(`[data-order="${o.id}"]`);
      if (this.picks[o.id] === o.answer) { el.dataset.ok = '1'; el.dataset.bad = '0'; }
      else { el.dataset.ok = '0'; el.dataset.bad = '1'; wrong += 1; wrongOrders.push(o); }
    }
    const verdict = this.root.querySelector('[data-verdict]');
    if (wrong === 0) {
      verdict.dataset.ok = '1';
      verdict.dataset.bad = '0';
      verdict.textContent = 'All four picked with the dials, not the default. The how-to-produce question is conditional - this is the lesson.';
      this.quill?.perform('hop');
      return { ok: true };
    }
    verdict.dataset.ok = '0';
    verdict.dataset.bad = '1';
    const allMachine = wrongOrders.every((o) => this.picks[o.id] === 'machines');
    if (allMachine) {
      verdict.textContent = `You picked MACHINES for everything. The bespoke sari and the bespoke suit are not volume orders - skill is the value. Hands wins where machines cannot copy.`;
    } else {
      verdict.textContent = `${wrong} of 4 are off. The right workshop is a function of all five dials. Bespoke + premium = hands. Uniform + volume + audit = machines.`;
    }
    this.quill?.setExpression('surprised');
    return { ok: false, hint: verdict.textContent };
  }
}
