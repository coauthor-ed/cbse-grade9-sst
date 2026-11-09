// StormSurgeGameScene - a made-up coast, no real place. The forecast rises in three steps as a storm nears.
// Rule on screen: everyone on ground up to 1 m above the forecast moves, lowest first. A bus goes to a
// lettered village; a higher village before a lower one gets a plain reason. "Next forecast" with a village
// left says it is still waiting. Nobody is drawn in water. Rounds are the scene's own.
// Controls: .ss-v buttons (data-pick = A..E), Next forecast (data-pick = next).
import { GameBoard, mountGame, finishGame } from 'simulations/base/kit/GameFrame.js';
import { esc } from 'simulations/base/SimUi.js';
import { sky, tx } from '../L04/SeaDraw.js';
import { VILLAGES, layout, coastSvg, villageSvg } from './CoastSection.js';
import { SEA_MASCOT_CSS } from '../shared/SeaGame.js';

const FORECASTS = [1.0, 2.0, 3.0];
const needs = (f) => VILLAGES.filter((v) => v.h <= f + 1);
const CSS = SEA_MASCOT_CSS + `
.gm.ss { background: var(--sim-bg-deep); border-radius: 14px; }
.ss .board { flex: 1 1 auto; min-height: 0; display: grid; grid-template-columns: minmax(0, 1fr) 330px; gap: 14px; align-items: start; }
.ss .fig svg { display: block; width: 100%; height: auto; }
.ss .rule { font-size: 16px; font-weight: 800; line-height: 1.25; margin: 0 0 8px; }
.ss .fc { font-family: var(--sim-font-display); font-size: 26px; font-weight: 700; color: var(--sim-accent); }
.ss .row { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 6px; }
.ss .ss-v { min-height: 58px; padding: 2px; font-weight: 800; background: var(--sim-bg-surface); color: var(--sim-label); border: var(--sim-border); border-radius: var(--sim-radius-md); font-size: 18px; line-height: 1.1; }
.ss .ss-v small { display: block; font-size: 14px; color: var(--sim-label-muted); font-weight: 700; }
.ss .ss-v[data-state="sent"] { border-color: var(--sim-good); background: color-mix(in oklab, var(--sim-good) 22%, var(--sim-bg-surface)); }
.ss .next { background: var(--sim-accent); color: var(--sim-bg-deep); border: 0; width: 100%; min-height: 48px; font-size: 16px; font-weight: 800; border-radius: var(--look-pill); margin-top: 8px; }
.ss .why { margin: 8px 0 0; font-size: 15px; line-height: 1.3; min-height: 40px; color: var(--sim-label); }
.ss .why[data-bad="1"] { color: var(--sim-bad); font-weight: 700; }
.sim-dom-root--portrait .ss .board { display: flex; flex-direction: column; gap: 8px; }
`;

export class StormSurgeGameScene extends GameBoard {
  static OBJECTIVE = { prompt: { en: 'A storm is coming to a made-up coast. Send buses to every village the forecast says must move, lowest first.' } };
  static ARIA_LABEL = 'A made-up coast with five villages at rising heights. As the forecast rises, send buses to every village on ground up to 1 metre above the forecast, lowest first.';

  async setup() {
    await super.setup();
    this._reset();
    mountGame(this, { css: CSS, check: false, html: '<div class="gm ss"><div class="gm-head"><p class="kicker">A made-up coast</p><h2>Move people before the water</h2></div><div class="board"><div class="fig" id="ss-fig"></div><div id="ss-side"></div></div></div>' });
    this.root.querySelector('#ss-side')?.addEventListener('click', (e) => this._onClick(e));
    this._draw();
  }
  _reset() { this._i = 0; this._sent = new Set(); this._msg = ''; this._bad = false; this._done = false; }
  resetChallenge() { super.resetChallenge(); this._reset(); this._draw?.(); }
  _onClick(e) {
    const b = e.target.closest?.('[data-pick]');
    if (!b) return;
    const v = b.dataset.pick, f = FORECASTS[this._i], need = needs(f), wait = need.filter((x) => !this._sent.has(x.id));
    if (v === 'next') {
      if (wait.length) { this._bad = true; this._msg = `Village ${wait[0].id} is still waiting for a bus. Try again.`; this._draw(); return; }
      this._i += 1; this._bad = false;
      if (this._i >= FORECASTS.length) { this._i = FORECASTS.length - 1; this._done = true; this._msg = ''; this._draw(); finishGame(this); return; }
      this._msg = 'The storm is closer and the forecast has risen.'; this.quill?.setExpression?.('happy'); this._draw(); return;
    }
    const x = VILLAGES.find((q) => q.id === v);
    if (this._sent.has(v)) return;
    if (x.h > f + 1) { this._bad = true; this._msg = `Village ${x.id} stands at ${x.h.toFixed(1)} m, above the ${(f + 1).toFixed(1)} m line, so it can wait for now.`; this._draw(); return; }
    if (wait[0].id !== v) { this._bad = true; this._msg = `Lowest first: village ${wait[0].id} stands at ${wait[0].h.toFixed(1)} m, lower than ${x.id}.`; this._draw(); return; }
    this._sent.add(v); this._bad = false; this._msg = `A bus has reached village ${v}.`; this._draw();
  }
  _fig() {
    const port = this.root.classList?.contains('sim-dom-root--portrait'), W = port ? 320 : 720, H = port ? 200 : 256;
    const L = layout(W, H, { seaW: W * 0.14, y0: H * 0.8, base: H - 12, top: 40 }), f = FORECASTS[this._i], line = L.y(f), rule = L.y(f + 1);
    let s = coastSvg(L, 0);
    for (const v of VILLAGES) s += villageSvg(L, v, { k: port ? 0.36 : 0.5, lit: this._sent.has(v.id) });
    s += `<path d="M0 ${line}H${W}" style="stroke:${sky('red')};stroke-width:3;stroke-dasharray:10 7"/><path d="M0 ${rule}H${W}" style="stroke:${sky('ink')};stroke-width:3"/>`;
    s += tx(W - 8, line + 18, `forecast ${f.toFixed(1)} m`, { size: 15, anchor: 'end', col: sky('redDark'), halo: sky('cloud') });
    s += tx(W - 8, rule - 7, `move up to ${(f + 1).toFixed(1)} m`, { size: 15, anchor: 'end', col: sky('ink'), halo: sky('cloud') });
    return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="A coast in section with the forecast level and the move line">${s}</svg>`;
  }
  _draw() {
    const side = this.root?.querySelector?.('#ss-side');
    if (!side) return;
    this.root.querySelector('#ss-fig').innerHTML = this._fig();
    if (this._done) { side.innerHTML = '<p class="rule">Every village on low ground has moved in time.</p>'; return; }
    const f = FORECASTS[this._i];
    side.innerHTML = `<p class="rule">Forecast ${this._i + 1} of ${FORECASTS.length}: <span class="fc">${f.toFixed(1)} m</span><br>Move everyone on ground up to ${(f + 1).toFixed(1)} m, lowest first.</p>`
      + `<div class="row">${VILLAGES.map((v) => `<button type="button" class="tap ss-v" data-pick="${v.id}" data-state="${this._sent.has(v.id) ? 'sent' : ''}" aria-label="Village ${v.id}, ${v.h.toFixed(1)} metres">${v.id}<small>${v.h.toFixed(1)} m</small></button>`).join('')}</div>`
      + `<button type="button" class="next" data-pick="next">${this._i + 1 === FORECASTS.length ? 'All moved' : 'Next forecast'}</button>`
      + `<p class="why" data-bad="${this._bad ? 1 : 0}" aria-live="polite">${esc(this._msg)}</p>`;
  }
  checkObjective() {
    if (!this._done) return null;
    this.quill?.perform?.('hop');
    return { ok: true };
  }
}
