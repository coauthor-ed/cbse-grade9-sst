// FisheryBalanceGameScene - game "Ten seasons". One made-up stock, one chart. Each season the learner picks a catch; the
// stock line grows. Win: a total of 300 thousand or more, with the stock never under the breeding line. 30 every season
// gives exactly 300 with a flat stock, so a win always exists. A stock under the line, or ten seasons short of the total,
// offers Try again. Controls: .fb-amt (data-amt), .fb-go, .fb-again.
import { GameBoard, mountGame, finishGame, onTap } from 'simulations/base/kit/GameFrame.js';
import { START, BREED_LINE, stepYear, svgStockChart } from './StockModel.js';
import { SEA_MASCOT_CSS } from '../shared/SeaGame.js';

const SEASONS = 10, TARGET = 300, AMTS = [10, 20, 30, 40, 50];
const CSS = SEA_MASCOT_CSS + `
.gm.fb { gap: 8px; background: var(--sim-bg-deep); border-radius: 14px; }
.fb-board { display: grid; grid-template-columns: 430px minmax(0, 1fr); gap: 14px; align-items: start; }
.fb-chart svg { display: block; width: 100%; height: auto; }
.fb-side { display: flex; flex-direction: column; gap: 8px; }
.fb-reads { display: grid; grid-template-columns: 1fr 0.8fr 1.3fr; gap: 6px; }
.fb-read { display: flex; flex-direction: column; align-items: center; padding: 4px 2px; border: var(--sim-border); border-radius: var(--sim-radius-md); background: var(--sim-bg-surface); }
.fb-read b { white-space: nowrap; font: 600 22px/1.2 var(--sim-font-display, var(--sim-font)); }
.fb-read span { font: 700 15px/1.15 var(--sim-font); color: var(--sim-label-muted); text-align: center; }
.fb-amts { display: grid; grid-template-columns: repeat(5, 1fr); gap: 6px; }
.fb-amt { min-height: 48px; padding: 0; border: var(--sim-border); border-radius: var(--sim-radius-md); background: var(--sim-bg-surface); font: 800 17px/1 var(--sim-font); color: var(--sim-label); }
.fb-amt[aria-pressed="true"] { background: color-mix(in oklab, var(--sim-accent) 34%, var(--sim-bg-surface)); box-shadow: inset 0 0 0 2px var(--sim-accent); }
.gm .fb-go, .gm .fb-again { min-height: 50px; border: 0; border-radius: var(--sim-radius-md); background: var(--sim-accent); color: var(--sim-bg-deep); font: 800 17px/1 var(--sim-font); box-shadow: 0 var(--sim-lift) 0 color-mix(in oklab, var(--sim-accent) 65%, var(--sim-label)); }
.gm .fb-go[hidden], .gm .fb-again[hidden] { display: none; }
.fb-why { margin: 0; min-height: 40px; font: 700 15px/1.3 var(--sim-font); }
.sim-dom-root--portrait .fb-board { grid-template-columns: minmax(0, 1fr); }
`;

export class FisheryBalanceGameScene extends GameBoard {
  static OBJECTIVE = { prompt: { en: 'Fish for ten seasons. Reach a total of 300,000 fish and keep the stock at 20,000 or more.' } };
  static ARIA_LABEL = 'A game with a made-up fish stock. Choose a catch for each of ten seasons, reach a total of 300 thousand fish, and keep the stock at 20 thousand or more.';

  async setup() {
    this._reset(true);
    await super.setup();
    mountGame(this, { css: CSS, check: false, html: `<div class="gm fb"><div class="gm-head"><h2>Ten seasons</h2><p class="sub">Made-up numbers, in thousands.</p></div>
      <div class="fb-board"><div class="fb-chart"></div><div class="fb-side"><div class="fb-reads"><div class="fb-read"><b class="fb-season"></b><span>season</span></div><div class="fb-read"><b class="fb-stock"></b><span>stock</span></div><div class="fb-read"><b class="fb-total"></b><span>total catch</span></div></div>
      <div class="fb-amts">${AMTS.map((a) => `<button type="button" class="tap fb-amt" data-amt="${a}" aria-pressed="false">${a}</button>`).join('')}</div>
      <button type="button" class="tap fb-go">Fish this season</button><button type="button" class="tap fb-again" hidden>Try again</button><p class="fb-why" aria-live="polite"></p></div></div></div>` });
    const q = (s) => this.root.querySelector(s);
    this._c = q('.fb-chart'); this._sea = q('.fb-season'); this._st = q('.fb-stock'); this._t = q('.fb-total'); this._go = q('.fb-go'); this._ag = q('.fb-again'); this._w = q('.fb-why');
    this.root.querySelectorAll('.fb-amt').forEach((b) => onTap(b, () => { this._amt = +b.dataset.amt; this._show(); }));
    if (this._go) onTap(this._go, () => this._fish());
    if (this._ag) onTap(this._ag, () => { this._reset(false); this._show(); });
    this._show();
  }
  _reset() { this._stocks = [START]; this._took = []; this._amt = 30; this._over = false; this._done = false; this._msg = ''; }
  _show() {
    const n = this._took.length, stock = this._stocks[n], total = this._took.reduce((a, b) => a + b, 0);
    if (this._sea) this._sea.textContent = `${Math.min(n + 1, SEASONS)} / ${SEASONS}`;
    if (this._st) this._st.textContent = String(Math.round(stock));
    if (this._t) this._t.textContent = `${Math.round(total)} / ${TARGET}`;
    this.root.querySelectorAll('.fb-amt').forEach((b) => b.setAttribute('aria-pressed', String(+b.dataset.amt === this._amt)));
    if (this._go) this._go.hidden = this._over || this._done;
    if (this._ag) this._ag.hidden = !this._over;
    if (this._w) this._w.textContent = this._msg;
    if (this._c) this._c.innerHTML = `<svg viewBox="0 0 340 222" role="img" aria-label="Stock and catch by season">${svgStockChart({ x: 36, y: 8, w: 296, h: 186 }, { lines: [{ vals: this._stocks, col: 'var(--sim-series-1)', w: 4 }], bars: this._took, years: SEASONS, yMax: 180, ticks: [50, 100, 150], xStep: 2 })}</svg>`;
    this.relayout?.();
  }
  _fish() {
    if (this._over || this._done) return;
    const n = this._took.length, r = stepYear(this._stocks[n], this._amt);
    this._stocks.push(r.stock); this._took.push(r.took);
    const total = this._took.reduce((a, b) => a + b, 0), last = this._took.length === SEASONS;
    if (r.stock < BREED_LINE) { this._over = true; this._msg = 'The stock fell under 20, so too few fish are left to breed back. Try a smaller catch.'; this.quill?.setExpression('surprised'); }
    else if (last && total >= TARGET) { this._done = true; this._msg = 'You reached the total and the stock can still breed back.'; this.quill?.perform('hop'); this._show(); finishGame(this); return; }
    else if (last) { this._over = true; this._msg = `The stock is safe, but the total is only ${Math.round(total)}. The sea could have given more.`; }
    else this._msg = `The stock grew to ${r.grown}, and you took ${r.took}.`;
    this._show();
  }
  checkObjective() { return this._done ? { ok: true } : null; }
}
