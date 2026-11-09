// BoundaryBuilderScene - read a small drawn section, then answer three questions about it. Each question
// offers real wrong options, so every step is a decision: kind of boundary, what the crust does, what you find.
// The last round has no name on it. Built on GameFrame; a wrong tap says why and costs nothing.
import { GameBoard, mountGame, finishGame } from 'simulations/base/kit/GameFrame.js';
import { esc } from 'simulations/base/SimUi.js';

const KIND = ['Convergent', 'Divergent', 'Transform'];
const CRUST = ['New crust is made', 'One plate sinks', 'Rock folds upward', 'No crust made or lost'];
const FIND = ['Fold mountains', 'Volcanoes on the land edge', 'A mid-ocean ridge', 'A long fault, and earthquakes'];
const ROUNDS = [
  { name: 'Mid-Atlantic Ridge', pic: 'apart', kind: 'Divergent', crust: 'New crust is made', find: 'A mid-ocean ridge' },
  { name: 'Himalaya', pic: 'fold', kind: 'Convergent', crust: 'Rock folds upward', find: 'Fold mountains' },
  { name: 'San Andreas Fault', pic: 'slide', kind: 'Transform', crust: 'No crust made or lost', find: 'A long fault, and earthquakes' },
  { name: 'Andes', pic: 'sink', kind: 'Convergent', crust: 'One plate sinks', find: 'Volcanoes on the land edge' },
  { name: 'A boundary with no name', pic: 'apart2', kind: 'Divergent', crust: 'New crust is made', find: 'A mid-ocean ridge' },
];
const WHY = { kind: 'Look at the two arrows: are the plates meeting, parting or sliding?', crust: 'Follow the rock at the boundary. What does it do?', find: 'What would this boundary leave behind?' };
const ROCK = 'var(--sim-strata-2)', OCN = 'var(--sim-strata-5)', SEA = 'var(--sim-sea-shallow)', HOT = 'var(--sim-magma)', INK = 'var(--sim-strata-6)', SKY = 'var(--sim-sky-day)';
const arrow = (x0, y, x1) => `<path d="M${x0} ${y}H${x1}" style="stroke:${INK};stroke-width:6;stroke-linecap:round"/><path d="M${x1 + (x1 > x0 ? 10 : -10)} ${y}l${x1 > x0 ? -14 : 14} -9v18Z" style="fill:${INK}"/>`;
const PICS = {
  fold: `<rect width="280" height="130" style="fill:${SKY}"/><rect y="100" width="280" height="30" style="fill:${HOT}"/><path d="M0 104V70L60 62 96 40 120 54 140 20 164 52 190 38 220 62 280 70V104Z" style="fill:${ROCK};stroke:${INK};stroke-width:3"/>${arrow(10, 14, 60)}${arrow(270, 14, 220)}`,
  sink: `<rect width="280" height="130" style="fill:${SKY}"/><rect y="104" width="280" height="26" style="fill:${HOT}"/><rect y="44" width="150" height="34" style="fill:${SEA}"/><path d="M0 76H130L204 130H160L120 100H0Z" style="fill:${OCN};stroke:${INK};stroke-width:3"/><path d="M140 76L176 40 196 22 214 40 280 44V104H200Z" style="fill:${ROCK};stroke:${INK};stroke-width:3"/>${arrow(20, 22, 90)}`,
  apart: `<rect width="280" height="130" style="fill:${SEA}"/><rect y="104" width="280" height="26" style="fill:${HOT}"/><path d="M0 84L110 66 132 58V104H0Z" style="fill:${OCN};stroke:${INK};stroke-width:3"/><path d="M280 84L170 66 148 58V104H280Z" style="fill:${OCN};stroke:${INK};stroke-width:3"/><rect x="132" y="62" width="16" height="44" style="fill:${HOT}"/>${arrow(112, 22, 40)}${arrow(168, 22, 240)}`,
  apart2: `<rect width="280" height="130" style="fill:${SEA}"/><rect y="104" width="280" height="26" style="fill:${HOT}"/><path d="M0 92L100 74 128 62V104H0Z" style="fill:${OCN};stroke:${INK};stroke-width:3"/><path d="M280 92L180 74 152 62V104H280Z" style="fill:${OCN};stroke:${INK};stroke-width:3"/><rect x="128" y="66" width="24" height="40" style="fill:${HOT}"/>${arrow(108, 22, 40)}${arrow(172, 22, 240)}`,
  slide: `<rect width="139" height="130" style="fill:var(--sim-elev-low)"/><rect x="141" width="139" height="130" style="fill:var(--sim-elev-mid)"/><path d="M140 0V130" style="stroke:${INK};stroke-width:7"/><path d="M0 74H136" style="stroke:${INK};stroke-width:7"/><path d="M144 44H280" style="stroke:${INK};stroke-width:7"/><path d="M60 110V30" style="stroke:${INK};stroke-width:6;stroke-linecap:round"/><path d="M60 20l-9 14h18Z" style="fill:${INK}"/><path d="M220 20V100" style="stroke:${INK};stroke-width:6;stroke-linecap:round"/><path d="M220 110l-9 -14h18Z" style="fill:${INK}"/>`,
};

const CSS = `
.gm.bb { background: var(--sim-bg-deep); border-radius: 14px; }
.bb .board { display: grid; grid-template-columns: 440px minmax(0, 1fr); gap: 16px; align-items: start; }
.bb .pic { width: 100%; display: block; border-radius: var(--sim-radius-md); border: var(--sim-border); box-sizing: border-box; }
.bb .pname { font-family: var(--sim-font-display); font-size: 20px; font-weight: 700; margin: 0 0 6px; color: var(--sim-label); }
.bb .done { margin: 0 0 8px; padding: 0; list-style: none; font-size: 15px; font-weight: 700; color: var(--sim-label); }
.bb .q { font-size: 17px; font-weight: 800; margin: 0 0 8px; color: var(--sim-label); }
.bb .pool { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
.bb .pool .tap { font-size: 16px; font-weight: 800; padding: 4px 8px; }
.bb .pool .tap[data-state="bad"] { border-color: var(--sim-bad); }
.bb .why { margin: 8px 0 0; font-size: 16px; line-height: 1.3; min-height: 42px; color: var(--sim-label); }
.bb .why[data-bad="1"] { color: var(--sim-bad); font-weight: 700; }
.bb .next { background: var(--sim-accent); color: var(--sim-bg-deep); border: 0; width: 100%; font-size: 16px; font-weight: 800; }
.sim-dom-root:not(.sim-dom-root--portrait) .bb .gm-head { display: flex; gap: 12px; align-items: baseline; padding-right: 60px; }
.sim-dom-root:not(.sim-dom-root--portrait) .bb .gm-head .kicker { margin: 0; }
.sim-dom-root--portrait .bb .board { display: flex; flex-direction: column; gap: 10px; }
`;

export class BoundaryBuilderScene extends GameBoard {
  static HEIGHT = 326;
  static OBJECTIVE = { prompt: { en: 'Read each boundary picture, then give it the right name, crust and landform.' } };
  static ARIA_LABEL = 'Read a boundary picture, then answer: which kind of boundary, what the crust does, and what you find there. Five rounds.';

  async setup() {
    await super.setup();
    this._reset();
    mountGame(this, {
      css: CSS, check: false,
      html: '<div class="gm bb"><div class="gm-head"><p class="kicker">Read the boundary</p><h2 id="bb-round"></h2></div><div class="board"><div id="bb-pic"></div><div id="bb-side"></div></div></div>',
    });
    this.root.querySelector('#bb-side')?.addEventListener('click', (e) => this._pick(e));
    this._draw();
  }
  _reset() { this._i = 0; this._step = 0; this._wrong = null; this._msg = ''; this._bad = false; this._done = false; }
  resetChallenge() { super.resetChallenge(); this._reset(); this._draw?.(); }

  _pick(e) {
    const b = e.target.closest?.('[data-pick]');
    if (!b) return;
    const v = b.dataset.pick, r = ROUNDS[this._i], key = ['kind', 'crust', 'find'][this._step];
    if (v === '__next') {
      this._i += 1; this._step = 0; this._msg = ''; this._bad = false; this._wrong = null;
      if (this._i >= ROUNDS.length) { this._i = ROUNDS.length - 1; this._done = true; this._step = 3; this._draw(); this.quill?.setExpression?.('happy'); finishGame(this); return; }
      this._draw(); return;
    }
    if (v === r[key]) { this._step += 1; this._wrong = null; this._bad = false; this._msg = this._step === 3 ? `${r.pic === 'apart2' ? 'Plates parting' : r.name}: ${r.kind.toLowerCase()} boundary.` : ''; }
    else { this._wrong = v; this._bad = true; this._msg = WHY[key]; }
    this._draw();
  }

  _draw() {
    const root = this.root, pic = root?.querySelector?.('#bb-pic');
    if (!pic) return;
    const r = ROUNDS[this._i];
    root.querySelector('#bb-round').textContent = `Round ${this._i + 1} of ${ROUNDS.length}`;
    const done = [r.kind, r.crust, r.find].slice(0, this._step);
    pic.innerHTML = `<p class="pname">${esc(r.name)}</p><svg class="pic" viewBox="0 0 280 130" role="img" aria-label="A drawn section of the boundary, with arrows showing how the plates move">${PICS[r.pic]}</svg>`;
    const list = done.length ? `<ul class="done">${done.map((d) => `<li>${esc(d)}</li>`).join('')}</ul>` : '';
    const side = root.querySelector('#bb-side');
    if (this._done) { side.innerHTML = `${list}<p class="q">All five boundaries read.</p>`; return; }
    if (this._step === 3) {
      side.innerHTML = `${list}<p class="why">${esc(this._msg)}</p><button type="button" class="tap btn next" data-pick="__next">${this._i + 1 === ROUNDS.length ? 'Finish' : 'Next boundary'}</button>`;
      return;
    }
    const q = ['Which kind of boundary is it?', 'What does the crust do here?', 'What do you find here?'][this._step];
    const opts = [KIND, CRUST, FIND][this._step];
    side.innerHTML = `${list}<p class="q">${esc(q)}</p><div class="pool">${opts.map((o) => `<button type="button" class="tap btn" data-pick="${esc(o)}" data-state="${this._wrong === o ? 'bad' : ''}">${esc(o)}</button>`).join('')}</div><p class="why" data-bad="${this._bad ? 1 : 0}" aria-live="polite">${esc(this._msg)}</p>`;
  }

  checkObjective() {
    if (!this._done) return null;
    this.quill?.perform?.('hop');
    return { ok: true };
  }
}
