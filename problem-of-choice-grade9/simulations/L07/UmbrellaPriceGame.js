// UmbrellaPriceGame - L07 game "Price an umbrella" (an extra, beyond the book; said on the board). A seller has 20
// umbrellas for one rainy day. The learner sets a price (Rs 100 to 400, steps of 50) and opens the stall. Buyers who
// want an umbrella at that price arrive: the higher the price, the fewer buyers (a made-up table, never shown as a
// table). Too high: umbrellas stay unsold. Too low: the umbrellas sell out and buyers are left waiting. The win is
// the price where all 20 sell and nobody waits (Rs 250). The answer is never shown by a control; each miss says
// what happened and which way to move. No celebration beyond the kit's own end. ASCII only.
import { GameBoard, mountGame, finishGame, onTap } from 'simulations/base/kit/GameFrame.js';
import { iconSvg } from 'simulations/base/kit/SimIcons.js';

const STOCK = 20;
const LO = 100, HI = 400, STEP = 50, START = 150;
const BUYERS = { 100: 44, 150: 36, 200: 28, 250: 20, 300: 14, 350: 9, 400: 5 };   // made up, falls as the price rises
const RS = '\u20b9';

// One umbrella, 40 x 40: a scalloped canopy and a hooked handle. sold = closed and faint.
const umb = (tone, sold) => sold
  ? `<svg viewBox="0 0 40 40" aria-hidden="true"><path d="M20 6L26 26H14Z" style="fill:color-mix(in oklab, var(--sim-series-${tone}) 30%, var(--sim-bg-surface));stroke:var(--sim-stroke);stroke-width:1.5;stroke-linejoin:round;opacity:.55"/><path d="M20 26V33a3 3 0 0 1-6 0" style="fill:none;stroke:var(--sim-stroke);stroke-width:2.2;stroke-linecap:round;opacity:.55"/></svg>`
  : `<svg viewBox="0 0 40 40" aria-hidden="true"><path d="M3 21a17 15 0 0 1 34 0a5.7 4 0 0 0-11.3 0a5.7 4 0 0 0-11.4 0a5.7 4 0 0 0-11.3 0Z" style="fill:var(--sim-series-${tone});stroke:color-mix(in oklab, var(--sim-series-${tone}) 60%, black);stroke-width:1.6;stroke-linejoin:round"/><path d="M8 13a14 11 0 0 1 9-6" style="fill:none;stroke:color-mix(in oklab, var(--sim-series-${tone}) 40%, white);stroke-width:2.4;stroke-linecap:round"/><path d="M20 21V33a3 3 0 0 1-6 0" style="fill:none;stroke:var(--sim-stroke);stroke-width:2.4;stroke-linecap:round"/></svg>`;
const TONES = [1, 2, 3, 5, 6];
const buyer = (wait) => `<span class="up-b${wait ? ' w' : ''}" aria-hidden="true">${iconSvg('person', wait ? 4 : 1)}</span>`;

const CSS = `
.gm.up { background: var(--sim-bg-deep); border-radius: var(--sim-radius-md); }
.up .up-main { flex: 1 1 auto; min-height: 0; display: grid; grid-template-columns: 430px minmax(0, 1fr); gap: 16px; align-items: start; }
.up .up-card { background: var(--sim-bg-surface); border: calc(2px * var(--look-rim)) solid var(--sim-stroke); border-radius: var(--sim-radius-lg); padding: 10px 12px; }
.up .up-h { font-size: 15px; font-weight: 800; color: var(--sim-label-muted); margin: 0 0 6px; }
.up .up-stock { display: grid; grid-template-columns: repeat(10, minmax(0, 1fr)); gap: 2px; }
.up .up-stock svg { width: 100%; height: auto; display: block; }
.up .up-price { display: flex; align-items: center; justify-content: center; gap: 12px; margin-top: 10px; }
.up .up-step { width: 52px; font-size: 26px; font-weight: 800; padding: 0; }
.up .up-tag { min-width: 120px; text-align: center; font-family: var(--sim-font-display); font-size: 34px; font-weight: 700; color: var(--sim-label);
  background: color-mix(in oklab, var(--sim-gold) 26%, var(--sim-bg-surface)); border: calc(2px * var(--look-rim)) solid var(--sim-stroke); border-radius: var(--sim-radius-md); padding: 2px 10px; }
.up .up-open { display: block; width: 100%; margin-top: 10px; min-height: 50px; font-size: 17px; font-weight: 800;
  background: var(--sim-accent); color: var(--sim-bg-deep); border: 0; border-radius: var(--sim-radius-md);
  box-shadow: 0 var(--sim-lift) 0 color-mix(in oklab, var(--sim-accent) 65%, var(--sim-label)); }
.up .up-open:active { box-shadow: none; }
.up .up-q { display: flex; flex-wrap: wrap; gap: 3px; min-height: 64px; align-content: flex-start; }
.up .up-b { width: 28px; height: 28px; display: block; animation: up-in 0.35s ease-out both; animation-delay: var(--d, 0s); }
.up .up-b svg { width: 100%; height: 100%; display: block; }
.up .up-b.w { outline: 2px dashed var(--sim-bad); outline-offset: 1px; border-radius: 6px; }
@keyframes up-in { from { transform: translateY(-12px); opacity: 0; } to { transform: none; opacity: 1; } }
.up .up-res { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; margin-top: 8px; }
.up .up-res div { text-align: center; border-radius: var(--sim-radius-md); background: var(--sim-bg-deep); padding: 4px 2px; }
.up .up-res b { display: block; font-family: var(--sim-font-display); font-size: 28px; line-height: 1.1; }
.up .up-res span { font-size: 14px; font-weight: 700; color: var(--sim-label-muted); }
.up .up-res .bad b { color: var(--sim-bad); } .up .up-res .good b { color: var(--sim-good); }
.up .up-say { min-height: 44px; font-size: 16px; font-weight: 700; line-height: 1.3; margin: 8px 0 0; }
.up .up-note { font-size: 14px; color: var(--sim-label-muted); margin: 6px 0 0; }
.sim-dom-root--portrait .up .gm-head { padding-right: 62px; }
.sim-dom-root--portrait .up .up-main { display: flex; flex-direction: column; gap: 10px; }
.sim-dom-root--portrait .up .up-card { width: 100%; padding: 8px; }
.sim-dom-root--portrait .up .up-b { width: 24px; height: 24px; }
.sim-dom-root--portrait .up .up-res b { font-size: 24px; }
.sim-dom-root--portrait .up .up-say { font-size: 15px; }
`;

export class UmbrellaPriceGame extends GameBoard {
  static CONTINUOUS = false;
  static OBJECTIVE = { prompt: { en: 'Find the price where all 20 umbrellas sell and no buyer is left waiting.' } };
  static ARIA_LABEL = 'An extra game, beyond the book. A seller has 20 umbrellas on a rainy day. Set a price and open the stall. If the price is too high, umbrellas stay unsold. If it is too low, they sell out and buyers are left waiting. Find the price where all 20 sell and nobody waits.';

  async setup() {
    await super.setup();
    this.price = START; this._won = false; this._opened = null;
    mountGame(this, {
      css: CSS, check: false, html: `<div class="gm up"><div class="gm-head"><p class="kicker">An extra, beyond the book</p><h2>Price an umbrella</h2>
        <p class="sub">A made-up rainy day. Set a price, then open the stall.</p></div>
        <div class="up-main">
          <div class="up-card"><p class="up-h">Your stall: ${STOCK} umbrellas</p><div class="up-stock"></div>
            <div class="up-price"><button type="button" class="tap btn up-step" data-d="-1" aria-label="Lower the price by ${STEP} rupees">-</button>
              <span class="up-tag" aria-live="polite"></span>
              <button type="button" class="tap btn up-step" data-d="1" aria-label="Raise the price by ${STEP} rupees">+</button></div>
            <button type="button" class="tap up-open">Open the stall</button></div>
          <div class="up-card"><p class="up-h up-qh">Buyers who want an umbrella at this price</p><div class="up-q"></div>
            <div class="up-res"><div class="r-sold"><b>-</b><span>sold</span></div><div class="r-left"><b>-</b><span>unsold</span></div><div class="r-wait"><b>-</b><span>still waiting</span></div></div>
            <p class="up-say" aria-live="polite">Open the stall to see what happens at your price.</p>
            <p class="up-note">Higher price, fewer buyers. A made-up example.</p></div>
        </div></div>`,
    });
    this.root.querySelectorAll('.up-step').forEach((b) => onTap(b, () => this._step(+b.dataset.d)));
    const o = this.root.querySelector('.up-open'); if (o) onTap(o, () => this._open());
    this._draw();
    this.quill?.speak('Too high or too low? Watch the stall and the queue.', 5200);
  }

  _step(d) {
    const p = Math.min(HI, Math.max(LO, this.price + d * STEP));
    if (p === this.price) return;
    this.price = p; this._opened = null; this._draw();
  }

  _open() {
    if (this._won) return;
    this._opened = this.price; this._draw();
    if (this.price in BUYERS && BUYERS[this.price] === STOCK) { this._won = true; finishGame(this); }
  }

  _draw() {
    const q = (s) => this.root.querySelector(s);
    if (!q('.up-stock')) return;
    const open = this._opened !== null, n = BUYERS[this.price], sold = open ? Math.min(n, STOCK) : 0;
    q('.up-tag').textContent = `${RS}${this.price}`;
    q('.up-stock').innerHTML = Array.from({ length: STOCK }, (_, i) => umb(TONES[i % TONES.length], i < sold)).join('');
    const wait = open ? Math.max(0, n - STOCK) : 0;
    q('.up-q').innerHTML = open ? Array.from({ length: n }, (_, i) => buyer(i >= STOCK).replace('class="up-b', `style="--d:${(Math.min(i, 30) * 0.03).toFixed(2)}s" class="up-b`)).join('') : '';
    q('.up-qh').textContent = open ? `${n} buyers want one at ${RS}${this.price}` : 'Buyers who want an umbrella at this price';
    const set = (cls, v, tone) => { const el = q(cls); el.className = `${cls.slice(1)} ${tone}`; el.querySelector('b').textContent = v; };
    set('.r-sold', open ? String(sold) : '-', open && sold === STOCK ? 'good' : '');
    set('.r-left', open ? String(STOCK - sold) : '-', open && sold < STOCK ? 'bad' : '');
    set('.r-wait', open ? String(wait) : '-', open && wait > 0 ? 'bad' : '');
    let say = 'Open the stall to see what happens at your price.';
    if (open && sold < STOCK) say = `Too high: ${STOCK - sold} umbrellas stay unsold. A lower price brings more buyers.`;
    else if (open && wait > 0) say = `Too low: the umbrellas sold out and ${wait} buyers still wait. A higher price would still sell them all.`;
    else if (open) say = `All ${STOCK} sold and nobody is left waiting. At ${RS}${this.price}, buyers and umbrellas match.`;
    q('.up-say').textContent = say;
    this.relayout?.();
  }

  checkObjective() { return this._won ? { ok: true } : null; }
  resetChallenge() { super.resetChallenge(); this.price = START; this._won = false; this._opened = null; this._draw(); }
  testState() { return { price: this.price, opened: this._opened, won: this._won }; }
}
