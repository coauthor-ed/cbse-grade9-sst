// HoldTheSlopeScene ("Hold the slope") - read a slope problem, tap the measure that fits. A wrong tap gets a
// true line about that measure and the problem stays. Six rounds. Control names: .ms[data-m]. No timer.
import { GameBoard, mountGame, onTap, finishGame } from 'simulations/base/kit/GameFrame.js';
import { esc } from 'simulations/base/SimUi.js';
import { slopeSvg } from './SlopeArt.js';

const M = [
  { id: 'trench', name: 'Contour trench', art: 'trench', line: 'A contour trench is a ditch along the hill that holds water so it soaks in.' },
  { id: 'bund', name: 'Bund', art: 'bund', line: 'A bund is an earthen bank along a contour line that slows run-off.' },
  { id: 'terrace', name: 'Terraces', art: 'terrace', line: 'Terraces are level steps cut into a hillside.' },
  { id: 'dam', name: 'Check dam', art: 'dam', line: 'A check dam stands across a small stream and slows its water.' },
  { id: 'plants', name: 'Plant cover', art: 'plants', line: 'Plant cover breaks the fall of rain, and roots hold the soil.' },
];
const R = [
  ['Rain runs off a hill too fast. You want a ditch along the hill to hold it, so it soaks in and refills groundwater.', 'trench', 'bare'],
  ['Farmers on a steep hillside need level ground to plant on.', 'terrace', 'bare'],
  ['A small stream races down a gully, and carries soil away with it.', 'dam', 'bare'],
  ['Rain beats straight down on bare soil, and nothing holds the ground together.', 'plants', 'bare'],
  ['You want a low earthen bank along the hill, to slow the run-off and keep the soil moist.', 'bund', 'bare'],
  ['In Nagaland, the Zabo system saves soil and water on hillslopes with this.', 'bund', 'bare'],
];
const pic = (k) => `<svg viewBox="0 0 300 150" preserveAspectRatio="xMidYMax slice" aria-hidden="true"><defs><linearGradient id="hs-${k}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--sim-sky-day)"/><stop offset="1" stop-color="var(--sim-bg-surface)"/></linearGradient></defs><rect width="300" height="150" style="fill:url(#hs-${k})"/>${slopeSvg(300, 150, k, {})}</svg>`;

const CSS = `
.gm.hs { background: var(--sim-bg-deep); border-radius: 14px; padding: 6px 12px; gap: 6px; }
.hs .play { display: grid; grid-template-columns: 360px minmax(0, 1fr); gap: 14px; align-items: start; }
.hs .card { background: var(--sim-bg-surface); border: var(--sim-border); border-radius: var(--sim-radius-lg); box-shadow: 0 var(--sim-lift) 0 var(--sim-stroke); overflow: hidden; }
.hs .card svg { display: block; width: 100%; height: 120px; }
.hs .txt { padding: 8px 12px 10px; }
.hs .n { font-size: 15px; font-weight: 800; color: var(--sim-label-muted); }
.hs .txt b { display: block; font: 600 19px/1.25 var(--sim-font-display); margin-top: 2px; }
.hs .list { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
.hs .ms { display: flex; align-items: center; justify-content: center; text-align: center; min-height: 52px; padding: 6px 8px; font-weight: 800; font-size: 16px; background: var(--sim-bg-surface); border: var(--sim-border); border-radius: var(--sim-radius-md); box-shadow: 0 var(--sim-lift) 0 var(--sim-stroke); }
.hs .why { min-height: 42px; margin: 6px 2px 0; font-size: 15px; line-height: 1.3; font-weight: 700; color: var(--sim-label); grid-column: 1 / -1; }
.hs .ms[data-hit="1"] { border-color: var(--sim-good); background: color-mix(in oklab, var(--sim-good) 24%, var(--sim-bg-surface)); }
.hs .ms[data-no="1"] { border-color: var(--sim-bad); }
.hs .list .next { grid-column: 1 / -1; display: none; min-height: 50px; }
.hs[data-right="1"] .list .next { display: block; }
.sim-dom-root:not(.sim-dom-root--portrait) .hs .list { padding-right: 60px; }
.sim-dom-root--portrait .hs .play { grid-template-columns: minmax(0, 1fr); }
`;

export class HoldTheSlopeScene extends GameBoard {
  static ARIA_LABEL = 'A game: read a problem on a hillside, then tap the soil measure that fits it. Six rounds.';
  static OBJECTIVE = { prompt: { en: 'Read each slope problem and choose the measure that fits it.' } };
  static HEIGHT = 332;

  constructor(container, config) { super(container, config); this._i = 0; }

  async setup() {
    await super.setup();
    mountGame(this, {
      check: false, css: CSS,
      html: `<div class="gm hs"><div class="gm-head"><h2>Hold the slope</h2></div><div class="play"><div class="card"><div data-pic></div><div class="txt"><span class="n" data-n></span><b data-q></b></div></div><div><div class="list">${M.map((m) => `<div class="ms tap" role="button" tabindex="0" data-m="${m.id}">${esc(m.name)}</div>`).join('')}<button type="button" class="btn next tap">Next problem</button></div><p class="why" data-why aria-live="polite"></p></div></div></div>`,
    });
    this.root.querySelectorAll('.ms').forEach((e) => onTap(e, () => this._tap(e)));
    const n = this.root.querySelector('.next');
    if (n) onTap(n, () => this._next());
    this._show();
  }

  _show() {
    const r = this.root, q = R[this._i], s = (x) => r.querySelector(x);
    if (!s('[data-q]')) return;
    s('[data-n]').textContent = `Problem ${this._i + 1} of ${R.length}`;
    s('[data-q]').textContent = q[0];
    s('[data-pic]').innerHTML = pic(q[2]);
    s('[data-why]').textContent = '';
    s('.hs').dataset.right = '0';
    r.querySelectorAll('.ms').forEach((e) => { e.dataset.hit = '0'; e.dataset.no = '0'; });
  }

  _tap(e) {
    const r = this.root, id = e.dataset.m, q = R[this._i], g = r.querySelector('.hs');
    if (g.dataset.right === '1') return;
    const m = M.find((x) => x.id === id), why = r.querySelector('[data-why]');
    if (id !== q[1]) { e.dataset.no = '1'; why.textContent = `${m.line} Try another.`; return; }
    e.dataset.hit = '1'; why.textContent = m.line;
    r.querySelector('[data-pic]').innerHTML = pic(m.art);
    if (this._i === R.length - 1) { why.textContent = 'All six done. Each measure slows water or holds soil.'; this._won = true; finishGame(this); return; }
    g.dataset.right = '1';
  }

  _next() { this._i += 1; this._show(); }

  checkObjective() { return this._won ? { ok: true } : null; }
  resetChallenge() { super.resetChallenge(); this._i = 0; this._won = false; this._show(); }
}
