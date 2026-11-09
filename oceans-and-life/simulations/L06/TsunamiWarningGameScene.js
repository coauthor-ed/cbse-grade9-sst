// TsunamiWarningGameScene - run a warning centre through three made-up earthquakes, labelled made-up, no real
// place. Steps follow the book: Detection, Confirmation, Tracking, Warning Dissemination. The centre reads a
// gauge; then the learner sends an alert or says no threat and keeps watching. Feedback in the book's terms.
// No people, no count, no drowning. Controls: data-pick = check, track, alert, watch, next.
import { GameBoard, mountGame, finishGame } from 'simulations/base/kit/GameFrame.js';
import { esc } from 'simulations/base/SimUi.js';
import { warnWorld } from './WarnWorld.js';
import { SEA_MASCOT_CSS } from '../shared/SeaGame.js';

const QUAKES = [
  { name: 'Made-up earthquake, 1 of 3', wave: true },
  { name: 'Made-up earthquake, 2 of 3', wave: false },
  { name: 'Made-up earthquake, 3 of 3', wave: true },
];
const STAGES = ['Detection', 'Confirmation', 'Tracking', 'Warning Dissemination'];
const CSS = SEA_MASCOT_CSS + `
.gm.tw { background: var(--sim-bg-deep); border-radius: 14px; }
.tw .strip { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 6px; margin-bottom: 8px; }
.tw .st { text-align: center; font-size: 15px; font-weight: 800; line-height: 1.1; padding: 6px 2px; border-radius: var(--sim-radius-md); background: var(--sim-bg-surface); color: var(--sim-label-muted); border: var(--sim-border); overflow-wrap: anywhere; }
.tw .st[data-on="1"] { background: var(--sim-accent); color: var(--sim-bg-deep); border-color: var(--sim-accent); }
.tw .st[data-done="1"] { color: var(--sim-label); border-color: var(--sim-good); }
.tw .board { flex: 1 1 auto; min-height: 0; display: grid; grid-template-columns: minmax(0, 1fr) 360px; gap: 14px; align-items: start; }
.tw .trace { background: var(--sim-bg-surface); border: var(--sim-border); border-radius: var(--sim-radius-md); padding: 6px 8px; }
.tw .trace svg { display: block; width: 100%; height: auto; }
.tw .cap { font-size: 15px; font-weight: 700; margin: 0 0 4px; }
.tw .acts { display: flex; flex-direction: column; gap: 8px; }
.tw .act { min-height: 48px; width: 100%; font-size: 16px; font-weight: 800; color: var(--sim-label); background: var(--sim-bg-surface); border: var(--sim-border); border-radius: var(--sim-radius-md); padding: 4px 10px; }
.tw .act[data-main="1"] { background: var(--sim-accent); color: var(--sim-bg-deep); border: 0; }
.tw .why { margin: 8px 0 0; font-size: 15px; line-height: 1.3; min-height: 40px; color: var(--sim-label); }
.tw .why[data-bad="1"] { color: var(--sim-bad); font-weight: 700; }
.tw .world { margin-top: 6px; border-radius: var(--sim-radius-md); overflow: hidden; }
.sim-dom-root:not(.sim-dom-root--portrait) .tw .trace { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 10px; align-items: center; }
.sim-dom-root:not(.sim-dom-root--portrait) .tw .world { margin-top: 0; }
.sim-dom-root:not(.sim-dom-root--portrait) .tw .acts { display: grid; grid-template-columns: 1fr 1fr; }
.sim-dom-root:not(.sim-dom-root--portrait) .tw .act { font-size: 15px; }
.sim-dom-root--portrait .tw .board { display: flex; flex-direction: column; gap: 8px; }
.sim-dom-root--portrait .tw .strip { grid-template-columns: repeat(2, minmax(0, 1fr)); margin-top: 16px; }
`;

export class TsunamiWarningGameScene extends GameBoard {
  static OBJECTIVE = { prompt: { en: 'Run a warning centre through three made-up earthquakes. Check each stage, then decide: send an alert, or keep watching.' } };
  static ARIA_LABEL = 'Run a tsunami warning centre: for each made-up earthquake, check the sea-floor recorders and tide gauges, then send an alert or keep watching.';
  async setup() {
    await super.setup();
    this._reset();
    mountGame(this, { css: CSS, check: false, html: '<div class="gm tw"><div class="gm-head"><p class="kicker" id="tw-k"></p><h2>Warning centre</h2></div><div class="strip" id="tw-s"></div><div class="board"><div class="trace" id="tw-t"></div><div id="tw-a"></div></div></div>' });
    this.root.querySelector('#tw-a')?.addEventListener('click', (e) => this._onClick(e));
    this._draw();
  }
  _reset() { this._i = 0; this._stage = 1; this._msg = ''; this._bad = false; this._closed = false; this._done = false; }
  resetChallenge() { super.resetChallenge(); this._reset(); this._draw?.(); }
  _onClick(e) {
    const b = e.target.closest?.('[data-pick]');
    if (!b) return;
    const v = b.dataset.pick, q = QUAKES[this._i];
    this._bad = false;
    if (v === 'next') {
      this._i += 1; this._stage = 1; this._msg = ''; this._closed = false;
      if (this._i >= QUAKES.length) { this._i = QUAKES.length - 1; this._done = true; this._draw(); finishGame(this); return; }
    } else if (v === 'check') {
      this._stage = 2;
      this._msg = q.wave ? 'The recorders show a tsunami wave passing. The threat is confirmed.' : 'The recorders show no tsunami wave passing.';
    } else if (v === 'track') {
      if (!q.wave) { this._bad = true; this._msg = 'There is no confirmed wave to track yet.'; } else { this._stage = 3; this._msg = 'The tide gauges show the sea level changing. The waves are being tracked.'; }
    } else if (v === 'alert') {
      if (this._stage < 2) { this._bad = true; this._msg = 'Not every undersea earthquake makes a tsunami. Confirm first.'; }
      else if (!q.wave) { this._bad = true; this._msg = 'The threat is not confirmed, so this is not the moment for a tsunami alert.'; }
      else if (this._stage < 3) { this._bad = true; this._msg = 'Track the arrival and movement of the waves first.'; }
      else { this._stage = 4; this._closed = true; this._msg = 'Alerts go out by satellite to government agencies, and by SMS and other channels.'; this.quill?.setExpression?.('happy'); }
    } else if (v === 'watch') {
      if (this._stage < 2) { this._bad = true; this._msg = 'Check the sea-floor recorders first. You do not know yet.'; }
      else if (q.wave) { this._bad = true; this._msg = 'The recorders have confirmed a tsunami. The next stages must go on.'; }
      else { this._closed = true; this._msg = 'No tsunami threat is confirmed. The centre keeps watching.'; this.quill?.setExpression?.('happy'); }
    }
    this._draw();
  }
  _trace() {
    const q = QUAKES[this._i], s = this._stage, show = s >= 2, P = !!this.root?.classList?.contains('sim-dom-root--portrait'), W = 640, H = P ? 104 : 200, y0 = P ? 62 : 110;
    let d = `M0 ${y0}`;
    for (let x = 0; x <= W; x += 8) {
      const u = (x - 400) / 60, b = show && q.wave ? (P ? 46 : 84) * Math.exp(-u * u) - (P ? 22 : 40) * Math.exp(-(((x - 500) / 40) ** 2)) : 0, n = show ? Math.sin(x * 0.11) * 2 + Math.sin(x * 0.037) * 1.6 : 0;
      d += `L${x} ${(y0 - b - n).toFixed(1)}`;
    }
    const lab = s === 1 ? 'Sea-floor recorder: not read yet' : (s === 2 ? 'Sea-floor recorder' : 'Tide gauge at the coast');
    const wH = P ? 180 : 300, ww = warnWorld(W, wH, { show: new Set(['obpr', ...(show && q.wave ? ['hump'] : [])]) }), at = ww.p(s >= 3 ? 6 : 'obpr');
    return `<div class="read"><p class="cap">${lab}</p><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${q.wave && show ? 'A trace with a clear rise' : 'A flat trace'}"><path d="M0 ${y0}H${W}" style="stroke:var(--sim-track);stroke-width:2;stroke-dasharray:6 6"/><path d="${d}" style="fill:none;stroke:${show ? 'var(--sim-accent)' : 'var(--sim-track)'};stroke-width:4;stroke-linejoin:round"/></svg></div>`
      + `<div class="world"><svg viewBox="0 0 ${W} ${wH}" role="img" aria-label="${s >= 3 ? 'A coast with a tide gauge at the shore, ringed' : 'The sea with a pressure recorder on the sea floor, ringed'}">${ww.svg}<circle cx="${at[0]}" cy="${at[1] - (s >= 3 ? 16 : 6)}" r="30" style="fill:none;stroke:var(--sim-error);stroke-width:5"/></svg></div>`;
  }
  _draw() {
    const R = this.root, a = R?.querySelector?.('#tw-a');
    if (!a) return;
    const q = QUAKES[this._i], s = this._stage;
    R.querySelector('#tw-k').textContent = this._done ? 'All three checked' : q.name;
    R.querySelector('#tw-s').innerHTML = STAGES.map((n, i) => `<div class="st" data-on="${i === s ? 1 : 0}" data-done="${i < s ? 1 : 0}">${esc(n)}</div>`).join('');
    R.querySelector('#tw-t').innerHTML = this._trace();
    if (this._done) { a.innerHTML = '<p class="why">The centre has dealt with all three made-up earthquakes.</p>'; return; }
    const why = `<p class="why" data-bad="${this._bad ? 1 : 0}" aria-live="polite">${esc(this._msg)}</p>`;
    if (this._closed) { a.innerHTML = `<div class="acts"><button type="button" class="tap act" data-main="1" data-pick="next">${this._i + 1 === QUAKES.length ? 'Finish' : 'Next earthquake'}</button></div>${why}`; return; }
    const opt = (id, t, main) => `<button type="button" class="tap act" data-pick="${id}" data-main="${main ? 1 : 0}">${t}</button>`;
    a.innerHTML = `<div class="acts">${opt('check', 'Check sea-floor recorders', s === 1)}${opt('track', 'Check tide gauges', false)}${opt('alert', 'Send alert', false)}${opt('watch', 'No threat, keep watching', false)}</div>${why}`;
  }
  checkObjective() {
    if (!this._done) return null;
    this.quill?.perform?.('hop');
    return { ok: true };
  }
}
