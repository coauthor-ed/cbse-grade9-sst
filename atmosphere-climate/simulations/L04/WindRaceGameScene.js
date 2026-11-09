// WindRaceGameScene - blk-l04-s09, "Which way will it blow?". Two real places side by side with
// their temperatures. Tap the place with high pressure, then the way the wind blows. The sky then
// shows the result: cloud over the low, clear over the high. Win condition is the book's rule:
// cold air sinks and makes high pressure; air moves from high to low. Temperatures are examples.
// File and class name kept.
import { GameBoard, mountGame, finishGame } from 'simulations/base/kit/GameFrame.js';
import { esc } from 'simulations/base/SimUi.js';

import { svgCloud, svgSun, svgLand, svgSea, svgHills } from '../L03/AirDraw.js';
const ROUNDS = [
  { a: { n: 'Thar Desert, May afternoon', t: 44, k: 'sand' }, b: { n: 'Arabian Sea nearby', t: 28, k: 'sea' }, why: 'The sea air is cooler and heavier, so wind blows towards the hot desert.' },
  { a: { n: 'Marina Beach sand, 3 pm', t: 38, k: 'sand' }, b: { n: 'Bay of Bengal', t: 29, k: 'sea' }, why: 'By afternoon the land is warmer. This is a sea breeze.' },
  { a: { n: 'Konkan coast, 3 am', t: 22, k: 'plain' }, b: { n: 'Arabian Sea', t: 27, k: 'sea' }, why: 'At night the land cools faster. This is a land breeze.' },
  { a: { n: 'Ladakh, January', t: -15, k: 'snow' }, b: { n: 'Ganga plain, January', t: 15, k: 'plain' }, why: 'The very cold air over Ladakh is heavy and sinks.' },
  { a: { n: 'Punjab plains, June', t: 42, k: 'field' }, b: { n: 'Snow in the Himalaya, June', t: -5, k: 'snow' }, why: 'Air over the snow is cold and sinks, then moves to the hot plain.' },
  { a: { n: 'Kerala coast, January', t: 27, k: 'plain' }, b: { n: 'Delhi, January', t: 14, k: 'town' }, why: 'Delhi is the colder place here, so the high is there.' },
];
const highOf = (r) => (r.a.t < r.b.t ? 'a' : 'b');

const CSS = `
.wb .board { flex: 1 1 auto; display: grid; grid-template-columns: minmax(0, 1fr) 170px minmax(0, 1fr); gap: 12px; align-items: stretch; min-height: 0; }
.wb .pl { position: relative; height: 232px; padding: 8px 10px; text-align: left; border: var(--sim-border); border-radius: var(--sim-radius-lg); background: color-mix(in oklab, var(--sim-sky-day) 34%, var(--sim-bg-surface)); display: flex; flex-direction: column; overflow: hidden; color: var(--sim-label); }
.wb .pl b { font-size: 17px; font-weight: 800; line-height: 1.2; }
.wb .mark + b { padding-right: 40px; }
.wb .deg { font-family: var(--sim-font-display); font-size: 34px; font-weight: 700; line-height: 1.15; }
.wb .art { flex: none; height: 96px; margin-top: auto; }
.wb .art svg { display: block; width: 100%; height: 100%; }
.wb .mark { position: absolute; top: 8px; right: 8px; width: 42px; height: 42px; border-radius: 50%; display: grid; place-items: center; font-family: var(--sim-font-display); font-size: 26px; font-weight: 700; color: var(--sim-bg-surface); border: 3px solid var(--sim-label); }
.wb .mark[data-k="H"] { background: var(--sim-series-1); }
.wb .mark[data-k="L"] { background: var(--sim-series-4); }
.wb .mid { display: flex; flex-direction: column; gap: 8px; justify-content: center; }
.wb .q { font-size: 16px; font-weight: 800; margin: 0; text-align: center; }
.wb .dir { font-size: 16px; font-weight: 800; background: var(--sim-bg-surface); border: var(--sim-border); border-radius: var(--sim-radius-md); padding: 4px 8px; width: 100%; }
.wb .dir[data-state="bad"] { border-color: var(--sim-bad); }
.wb .btn.next { background: var(--sim-accent); color: var(--sim-bg-deep); border: 0; width: 100%; font-size: 16px; font-weight: 800; }
.wb .why { margin: 0; min-height: 40px; font-size: 15px; line-height: 1.3; }
.wb .why[data-bad="1"] { color: var(--sim-bad); font-weight: 700; }
.wb .round { font-size: 15px; font-weight: 700; color: var(--sim-label-muted); }
.gm.wb { background: var(--sim-bg-deep); border-radius: 14px; }
.sim-dom-root--portrait .wb .board { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); }
.sim-dom-root--portrait .wb .mid { grid-column: 1 / -1; grid-row: 2; }
.sim-dom-root--portrait .wb .pl { height: 214px; }
.sim-dom-root--portrait .wb .art { height: 76px; }
`;

const ground = (k) => (k === 'sea' ? svgSea(0, 72, 1, { w: 300, h: 28, t: 0 })
  : k === 'snow' ? svgHills(0, 100, 1, { w: 300, h: 46, seed: 3, snow: true }) : svgLand(0, 74, 1, { w: 300, h: 26, kind: k, seed: 2 }));
const skyArt = (k, g) => `<svg viewBox="0 0 300 100" preserveAspectRatio="xMidYMax meet" aria-hidden="true">${ground(g)}${k === 'cloud' ? svgCloud(150, 56, 0.72, { seed: 3, kind: 'rain' }) : k === 'clear' ? svgSun(150, 32, 0.42, {}) : ''}</svg>`;

export class WindRaceGameScene extends GameBoard {
  static OBJECTIVE = { prompt: { en: 'Mark the high and the low, then show which way the wind will blow.' } };
  static ARIA_LABEL = 'Which way will it blow: two places with their temperatures. Tap the place with high pressure, then choose the way the wind blows.';

  async setup() {
    await super.setup();
    this._reset();
    mountGame(this, { css: CSS, check: false, html: `<div class="gm wb"><div class="gm-head"><p class="kicker">Which way will it blow?</p><h2>Cold air sinks, warm air rises</h2><p class="sub">Temperatures are examples.</p></div><div class="board" id="wb-b"></div><div id="wb-f"></div></div>` });
    this.root.querySelector('.gm.wb')?.addEventListener('click', (e) => this._onClick(e));
    this._draw();
  }
  _reset() { this._i = 0; this._high = null; this._dir = null; this._msg = ''; this._bad = false; this._done = false; }
  resetChallenge() { super.resetChallenge(); this._reset(); this._draw?.(); }

  _onClick(e) {
    const b = e.target.closest?.('[data-pick]');
    if (!b) return;
    const v = b.dataset.pick, r = ROUNDS[this._i], hi = highOf(r);
    if (v === 'next') {
      this._i += 1; this._high = null; this._dir = null; this._msg = ''; this._bad = false;
      if (this._i >= ROUNDS.length) { this._i = ROUNDS.length - 1; this._done = true; this._draw(); finishGame(this); return; }
    } else if (!this._high) {
      if (v === hi) { this._high = v; this._msg = ''; this._bad = false; }
      else { this._bad = true; this._msg = `Warm air rises and leaves low pressure. Look for the colder place.`; }
    } else if (!this._dir) {
      const want = hi === 'a' ? 'ab' : 'ba';
      if (v === want) { this._dir = v; this._bad = false; this._msg = r.why; this.quill?.setExpression?.('happy'); }
      else { this._bad = true; this._msg = 'Air moves from high pressure to low pressure.'; }
    }
    this._draw();
  }
  _place(id, p) {
    const hi = this._high, isH = hi === id, skyK = this._dir ? (isH ? 'clear' : 'cloud') : '';
    const mark = hi ? `<span class="mark" data-k="${isH ? 'H' : 'L'}" aria-label="${isH ? 'High' : 'Low'} pressure">${isH ? 'H' : 'L'}</span>` : '';
    const inner = `${mark}<b>${esc(p.n)}</b><span class="deg">${String(p.t).replace('-', '\u2212')} \u00b0C</span><span class="art">${skyArt(skyK, p.k)}</span>`;
    return hi ? `<div class="pl">${inner}</div>` : `<button type="button" class="tap pl" data-pick="${id}">${inner}</button>`;
  }
  _draw() {
    const r = ROUNDS[this._i], b = this.root?.querySelector?.('#wb-b');
    if (!b || !this.root.querySelector('#wb-f')) return;
    let mid = '';
    if (this._done) mid = '<p class="q">All six winds found.</p>';
    else if (!this._high) mid = '<p class="q">Tap the place with high pressure</p>';
    else if (!this._dir) mid = '<p class="q">Which way does the wind blow?</p><button type="button" class="tap dir" data-pick="ab">Left to right \u2192</button><button type="button" class="tap dir" data-pick="ba">\u2190 Right to left</button>';
    else mid = `<button type="button" class="tap btn next" data-pick="next">${this._i + 1 === ROUNDS.length ? 'Finish' : 'Next places'}</button>`;
    b.innerHTML = this._place('a', r.a) + `<div class="mid"><span class="round" style="text-align:center">Round ${this._i + 1} of ${ROUNDS.length}</span>${mid}</div>` + this._place('b', r.b);
    this.root.querySelector('#wb-f').innerHTML = `<p class="why" data-bad="${this._bad ? 1 : 0}" aria-live="polite">${esc(this._msg)}</p>`;
  }
  checkObjective() {
    if (!this._done) return null;
    this.quill?.perform?.('hop');
    return { ok: true };
  }
}
