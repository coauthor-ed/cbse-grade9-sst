// DuneShapeGame ("Read the dune") - five rounds: read a card of wind, sand and plants, tap the dune.
// Three rounds: a dune seen from above, tap where the wind comes from. A wrong tap gets a true line and the
// round stays. Eight rounds, no timer, then finishGame. Control names: .dn[data-v], .nxt.
import { GameBoard, mountGame, onTap, finishGame } from 'simulations/base/kit/GameFrame.js';
import { esc } from 'simulations/base/SimUi.js';
import { floor, barchan, ridge, star, parabolic, wind } from './DuneDraw.js';

const NAMES = ['Barchan', 'Transverse', 'Longitudinal', 'Star', 'Parabolic'];
const WHY = {
  Barchan: 'A barchan needs little sand and one wind direction.',
  Transverse: 'Transverse dunes are long ridges across the wind, with plenty of sand.',
  Longitudinal: 'Longitudinal dunes are long ridges parallel to the wind.',
  Star: 'A star dune needs winds from different directions.',
  Parabolic: 'A parabolic dune is U-shaped and held by plants.',
};
const SIDES = [['left', 'From the left'], ['right', 'From the right'], ['top', 'From the top'], ['bottom', 'From the bottom']];
const ROUNDS = [
  { t: 'name', ask: 'One wind direction. Very little sand.', key: 'Barchan' },
  { t: 'name', ask: 'Winds come from many directions.', key: 'Star' },
  { t: 'name', ask: 'One wind and plenty of sand. Ridges lie across the wind.', key: 'Transverse' },
  { t: 'name', ask: 'Plants grow on the sand and hold it. The shape is a U.', key: 'Parabolic' },
  { t: 'name', ask: 'Long ridges lie parallel to the wind.', key: 'Longitudinal' },
  { t: 'wind', ask: 'A barchan: horns point downwind. Where does the wind come from?', dune: 'b', rot: 0, key: 'left', why: 'Barchan horns point the way the wind is going, so the wind comes from behind the curve.' },
  { t: 'wind', ask: 'A parabolic dune: arms point upwind. Where does the wind come from?', dune: 'p', rot: 90, key: 'bottom', why: 'Plants hold the arms back, so the arms point towards where the wind comes from.' },
  { t: 'wind', ask: 'A barchan again. Where does the wind come from?', dune: 'b', rot: 180, key: 'right', why: 'Follow the horns: they point downwind. The wind comes from the far side.' },
];
const VB_W = 300, VB_H = 180;
const plan = (key) => {
  const cx = VB_W / 2, cy = VB_H / 2;
  if (key === 'Barchan') return barchan(cx - 20, cy, 1) + barchan(cx + 90, cy - 40, 0.5) + wind(14, 18, 70, 18);
  if (key === 'Star') return star(cx, cy, 0.92) + wind(10, cy, 48, cy) + wind(VB_W - 10, cy + 30, VB_W - 48, cy + 26) + wind(cx + 90, 10, cx + 74, 40);
  if (key === 'Parabolic') return parabolic(cx - 10, cy, 1, 14) + wind(14, 18, 70, 18);
  let s = wind(14, 16, 70, 16);
  for (let i = 0; i < 4; i++) s += key === 'Longitudinal' ? ridge(20, VB_W - 20, 50 + i * 36, 11, i + 2) : `<g transform="translate(${50 + i * 66} 100) rotate(90)">${ridge(-66, 66, 0, 12, i + 5)}</g>`;
  return s;
};
const CSS = `
.sim-dom-root:not(.sim-dom-root--portrait) .dn-g .gm-head { display: flex; gap: 12px; align-items: baseline; }
.gm.dn-g { background: var(--sim-bg-deep); border-radius: 14px; padding: 8px 16px; gap: 8px; }
.dn-g .play { display: grid; grid-template-columns: 340px minmax(0, 1fr); gap: 16px; align-items: start; }
.dn-g .pic { border-radius: var(--sim-radius-lg); border: var(--sim-border); overflow: hidden; box-shadow: 0 var(--sim-lift) 0 var(--sim-stroke); line-height: 0; background: var(--sim-bg-surface); }
.dn-g .pic svg { width: 100%; height: auto; display: block; }
.dn-g .n { font-size: 15px; font-weight: 800; color: var(--sim-label-muted); }
.dn-g .ask { font: 600 20px/1.25 var(--sim-font-display); margin: 2px 0 8px; }
.dn-g .opts { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; }
.sim-dom-root--portrait .dn-g .opts { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.dn-g .dn { display: flex; align-items: center; justify-content: center; text-align: center; min-height: 48px; font-size: 16px; font-weight: 800; background: var(--sim-bg-surface); border: var(--sim-border); border-radius: var(--sim-radius-md); padding: 6px 8px; }
.dn-g .dn[data-hit="1"] { background: color-mix(in oklab, var(--sim-good) 30%, var(--sim-bg-surface)); border-color: var(--sim-good); }
.dn-g .dn[data-shake="1"] { animation: dn-shake 0.3s ease; }
@keyframes dn-shake { 25% { transform: translateX(-4px); } 75% { transform: translateX(4px); } }
.dn-g .why { min-height: 40px; margin: 6px 2px 0; font-size: 15px; line-height: 1.3; font-weight: 700; }
.dn-g .why[data-k="bad"] { color: var(--sim-bad); }
.dn-g .nxt { display: none; width: 100%; margin-top: 6px; background: var(--sim-accent); color: var(--sim-bg-deep); border: 0; border-radius: var(--sim-radius-md); font-size: 16px; font-weight: 800; }
.dn-g[data-done="1"] .nxt { display: block; }
.sim-dom-root--portrait .dn-g { padding: 4px; }
.sim-dom-root--portrait .dn-g .sub { padding-right: 56px; }
.sim-dom-root--portrait .dn-g .play { grid-template-columns: minmax(0, 1fr); gap: 8px; }
.sim-dom-root--portrait .dn-g .ask { font-size: 18px; min-height: 0; margin-bottom: 6px; }
`;

export class DuneShapeGame extends GameBoard {
  static HEIGHT = 324;
  static OBJECTIVE = { prompt: { en: 'Read the wind and sand, name the dune, then find the wind.' } };
  static ARIA_LABEL = 'Read a card of wind, sand and plants and tap the dune it describes, then look at a dune from above and tap where the wind comes from.';
  async setup() {
    await super.setup();
    this._i = 0; this._won = false;
    mountGame(this, {
      css: CSS, check: false,
      html: `<div class="gm dn-g"><div class="gm-head"><h2>Read the dune</h2><p class="sub">The wind, the sand and the plants decide the shape.</p></div>
        <div class="play"><div class="pic"></div><div><div class="n"></div><p class="ask"></p><div class="opts"></div><p class="why" aria-live="polite"></p><button type="button" class="nxt tap">Next</button></div></div></div>`,
    });
    this._board = this.root.querySelector('.dn-g');
    const nx = this.root.querySelector('.nxt');
    if (nx) onTap(nx, () => this._next());
    this._deal();
  }
  _pic(r, solved) {
    let m = floor(0, 0, VB_W, VB_H, { n: 12 });
    if (r.t === 'name') m += solved ? plan(r.key) : r.key === 'Star' ? wind(10, 90, 62, 90) + wind(VB_W - 10, 110, VB_W - 62, 106) + wind(150, 8, 150, 56) + wind(190, VB_H - 8, 186, VB_H - 56) : wind(60, 90, 240, 90, { w: 12 });
    else {
      const g = r.dune === 'b' ? barchan(0, 0, 1) : parabolic(0, 0, 1, 14);
      m += `<g transform="translate(${VB_W / 2} ${VB_H / 2}) rotate(${r.rot})">${g}</g>`;
      if (solved) m += { left: wind(10, 20, 60, 20), right: wind(VB_W - 10, 20, VB_W - 60, 20), bottom: wind(30, VB_H - 10, 30, VB_H - 60), top: wind(30, 10, 30, 60) }[r.key];
    }
    return `<svg viewBox="0 0 ${VB_W} ${VB_H}" role="img" aria-label="${solved ? 'The answer drawn from above' : 'A patch of desert seen from above'}">${m}</svg>`;
  }
  _deal() {
    const r = ROUNDS[this._i], q = (s) => this.root.querySelector(s);
    if (!this._board) return;
    this._board.dataset.done = '0';
    q('.n').textContent = `Round ${this._i + 1} of ${ROUNDS.length}`;
    q('.ask').textContent = r.ask;
    q('.why').textContent = ''; q('.why').dataset.k = '';
    q('.pic').innerHTML = this._pic(r, false);
    q('.nxt').textContent = this._i === ROUNDS.length - 1 ? 'Finish' : 'Next';
    const opts = r.t === 'name' ? NAMES.map((n) => [n, n]) : SIDES;
    q('.opts').innerHTML = opts.map(([v, l]) => `<div class="dn tap" role="button" tabindex="0" data-v="${v}">${esc(l)}</div>`).join('');
    this.root.querySelectorAll('.dn').forEach((el) => onTap(el, () => this._pick(el)));
  }
  _pick(el) {
    const r = ROUNDS[this._i], q = (s) => this.root.querySelector(s), v = el.dataset.v;
    if (this._board.dataset.done === '1') return;
    if (v !== r.key) {
      el.dataset.shake = '1'; setTimeout(() => { el.dataset.shake = '0'; }, 320);
      q('.why').dataset.k = 'bad';
      q('.why').textContent = r.t === 'name' ? WHY[v] : 'Look at which way the curved points run, then try again.';
      this.quill?.setExpression('surprised');
      return;
    }
    el.dataset.hit = '1';
    q('.why').dataset.k = 'good';
    q('.why').textContent = r.t === 'name' ? WHY[r.key] : r.why;
    q('.pic').innerHTML = this._pic(r, true);
    this._board.dataset.done = '1';
    this.quill?.perform?.('nod');
  }
  _next() {
    if (this._i < ROUNDS.length - 1) { this._i += 1; this._deal(); return; }
    this._won = true;
    finishGame(this);
  }
  checkObjective() { return this._won ? { ok: true } : null; }
  resetChallenge() { super.resetChallenge(); this._i = 0; this._won = false; this._deal(); }
}
