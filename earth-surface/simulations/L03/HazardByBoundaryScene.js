// HazardByBoundaryScene - for each boundary: does the ground shake, do volcanoes form? Yes or no, with a line
// of reason after each answer. All four shake; only two make volcanoes, and that is the find.
import { GameBoard, mountGame, finishGame } from 'simulations/base/kit/GameFrame.js';
import { esc } from 'simulations/base/SimUi.js';

const ROCK = 'var(--sim-strata-2)', OCN = 'var(--sim-strata-5)', SEA = 'var(--sim-sea-shallow)', HOT = 'var(--sim-magma)', INK = 'var(--sim-strata-6)', SKY = 'var(--sim-sky-day)';
const PICS = {
  fold: `<rect width="280" height="130" style="fill:${SKY}"/><rect y="100" width="280" height="30" style="fill:${HOT}"/><path d="M0 104V70L60 62 96 40 120 54 140 20 164 52 190 38 220 62 280 70V104Z" style="fill:${ROCK};stroke:${INK};stroke-width:3"/>`,
  sink: `<rect width="280" height="130" style="fill:${SKY}"/><rect y="104" width="280" height="26" style="fill:${HOT}"/><rect y="44" width="150" height="34" style="fill:${SEA}"/><path d="M0 76H130L204 130H160L120 100H0Z" style="fill:${OCN};stroke:${INK};stroke-width:3"/><path d="M140 76L176 40 196 22 214 40 280 44V104H200Z" style="fill:${ROCK};stroke:${INK};stroke-width:3"/>`,
  apart: `<rect width="280" height="130" style="fill:${SEA}"/><rect y="104" width="280" height="26" style="fill:${HOT}"/><path d="M0 84L110 66 132 58V104H0Z" style="fill:${OCN};stroke:${INK};stroke-width:3"/><path d="M280 84L170 66 148 58V104H280Z" style="fill:${OCN};stroke:${INK};stroke-width:3"/><rect x="132" y="62" width="16" height="44" style="fill:${HOT}"/>`,
  slide: `<rect width="139" height="130" style="fill:var(--sim-elev-low)"/><rect x="141" width="139" height="130" style="fill:var(--sim-elev-mid)"/><path d="M140 0V130" style="stroke:${INK};stroke-width:7"/><path d="M0 74H136" style="stroke:${INK};stroke-width:7"/><path d="M144 44H280" style="stroke:${INK};stroke-width:7"/>`,
};
const ROUNDS = [
  { name: 'Ocean plate sinks under a continent', pic: 'sink', v: 'yes', why: 'The sinking plate shakes the ground, and rock melts above it, so volcanoes form.' },
  { name: 'Two continents collide', pic: 'fold', v: 'no', why: 'The collision shakes the ground, but neither plate sinks far, so volcanoes are rare here.' },
  { name: 'Plates move apart at a ridge', pic: 'apart', v: 'yes', why: 'The moving plates shake the ground, and magma rises into the gap.' },
  { name: 'Plates slide past at a fault', pic: 'slide', v: 'no', why: 'The fault locks and slips, so the ground shakes, but no crust sinks or opens to let magma up.' },
];
const CSS = `
.gm.hz { background: var(--sim-bg-deep); border-radius: 14px; }
.hz .board { display: grid; grid-template-columns: 500px minmax(0, 1fr); gap: 16px; align-items: start; }
.hz .pic { width: 100%; display: block; border-radius: var(--sim-radius-md); border: var(--sim-border); box-sizing: border-box; }
.hz .pname { font-family: var(--sim-font-display); font-size: 19px; font-weight: 700; margin: 0 0 6px; color: var(--sim-label); }
.hz .q { font-size: 17px; font-weight: 800; margin: 0 0 8px; color: var(--sim-label); }
.hz .pool { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
.hz .pool .tap { font-size: 17px; font-weight: 800; }
.hz .pool .tap[data-state="bad"] { border-color: var(--sim-bad); }
.hz .why { margin: 8px 0 0; font-size: 16px; line-height: 1.3; min-height: 42px; color: var(--sim-label); }
.hz .why[data-bad="1"] { color: var(--sim-bad); font-weight: 700; }
.hz .next { background: var(--sim-accent); color: var(--sim-bg-deep); border: 0; width: 100%; font-size: 16px; font-weight: 800; margin-top: 6px; }
.sim-dom-root:not(.sim-dom-root--portrait) .hz .gm-head { display: flex; gap: 12px; align-items: baseline; padding-right: 60px; }
.sim-dom-root:not(.sim-dom-root--portrait) .hz .gm-head .kicker { margin: 0; }
.sim-dom-root:not(.sim-dom-root--portrait) .hz .why { padding-right: 60px; }
.sim-dom-root--portrait .hz .pname { padding-right: 58px; }
.sim-dom-root--portrait .hz .board { display: flex; flex-direction: column; gap: 10px; }
`;

export class HazardByBoundaryScene extends GameBoard {
  static HEIGHT = 332;
  static OBJECTIVE = { prompt: { en: 'For each boundary, say whether the ground shakes and whether volcanoes form.' } };
  static ARIA_LABEL = 'For each of four plate boundaries, answer yes or no: does the ground shake, and do volcanoes form?';

  async setup() {
    await super.setup();
    this._reset();
    mountGame(this, {
      css: CSS, check: false,
      html: '<div class="gm hz"><div class="gm-head"><p class="kicker">Which hazard?</p><h2 id="hz-round"></h2></div><div class="board"><div id="hz-pic"></div><div id="hz-side"></div></div></div>',
    });
    this.root.querySelector('#hz-side')?.addEventListener('click', (e) => this._pick(e));
    this._draw();
  }
  _reset() { this._i = 0; this._step = 0; this._wrong = null; this._msg = ''; this._bad = false; this._done = false; }
  resetChallenge() { super.resetChallenge(); this._reset(); this._draw?.(); }

  _pick(e) {
    const b = e.target.closest?.('[data-pick]');
    if (!b) return;
    const v = b.dataset.pick, r = ROUNDS[this._i];
    if (v === 'next') {
      this._i += 1; this._step = 0; this._msg = ''; this._bad = false; this._wrong = null;
      if (this._i >= ROUNDS.length) { this._i = ROUNDS.length - 1; this._done = true; this._draw(); this.quill?.setExpression?.('happy'); finishGame(this); return; }
    } else if (this._step === 0) {
      if (v === 'yes') { this._step = 1; this._wrong = null; this._bad = false; this._msg = ''; }
      else { this._wrong = v; this._bad = true; this._msg = 'Plates move against each other here. What does that do to the ground?'; }
    } else if (v === r.v) { this._step = 2; this._wrong = null; this._bad = false; this._msg = r.why; }
    else { this._wrong = v; this._bad = true; this._msg = r.v === 'yes' ? 'Look for a way magma can reach the surface here.' : 'Can magma reach the surface here? Look again.'; }
    this._draw();
  }

  _draw() {
    const root = this.root, pic = root?.querySelector?.('#hz-pic');
    if (!pic) return;
    const r = ROUNDS[this._i], side = root.querySelector('#hz-side');
    root.querySelector('#hz-round').textContent = `Boundary ${this._i + 1} of ${ROUNDS.length}`;
    pic.innerHTML = `<p class="pname">${esc(r.name)}</p><svg class="pic" viewBox="0 0 280 130" role="img" aria-label="${esc(r.name)}">${PICS[r.pic]}</svg>`;
    if (this._done) { side.innerHTML = '<p class="q">All four shake. Only two make volcanoes.</p>'; return; }
    if (this._step === 2) { side.innerHTML = `<p class="why">${esc(this._msg)}</p><button type="button" class="tap btn next" data-pick="next">${this._i + 1 === ROUNDS.length ? 'Finish' : 'Next boundary'}</button>`; return; }
    const q = this._step === 0 ? 'Does the ground shake here?' : 'Do volcanoes usually form here?';
    side.innerHTML = `<p class="q">${q}</p><div class="pool">${['yes', 'no'].map((o) => `<button type="button" class="tap btn" data-pick="${o}" data-state="${this._wrong === o ? 'bad' : ''}">${o === 'yes' ? 'Yes' : 'No'}</button>`).join('')}</div><p class="why" data-bad="${this._bad ? 1 : 0}" aria-live="polite">${esc(this._msg)}</p>`;
  }

  checkObjective() {
    if (!this._done) return null;
    this.quill?.perform?.('hop');
    return { ok: true };
  }
}
