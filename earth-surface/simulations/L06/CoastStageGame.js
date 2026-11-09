// CoastStageGame ("Order the coast") - five pictures of one headland, shuffled. Tap the one that comes next. A right tap
// says what the waves did; a wrong tap says why not. The finished row reads cliff to stump. Control names: .st[data-s]. No timer.
import { GameBoard, mountGame, onTap, finishGame } from 'simulations/base/kit/GameFrame.js';
import { esc } from 'simulations/base/SimUi.js';
import { svgEarthSky } from '../shared/EarthArt.js';
import { headlandSvg } from './HeadlandArt.js';

const ST = [
  { id: 'cliff', name: 'Sea cliff', P: 0, did: 'Waves undercut the foot of the rock, and a steep cliff formed.' },
  { id: 'cave', name: 'Sea cave', P: 1, did: 'Waves wore away weak rock and opened a cave.' },
  { id: 'arch', name: 'Sea arch', P: 2, did: 'Caves on opposite sides of the headland met.' },
  { id: 'stack', name: 'Sea stack', P: 3, did: 'The roof fell, and the outer leg stood alone.' },
  { id: 'stump', name: 'Stump', P: 4, did: 'Waves cut the foot of the stack until only a stump was left.' },
];
const SHOW = [3, 0, 4, 2, 1];
const pic = (s) => `<svg viewBox="0 0 200 130" aria-hidden="true"><defs>${svgEarthSky(`cs-${s.id}-sky`)}</defs><rect width="200" height="130" style="fill:url(#cs-${s.id}-sky)"/>${headlandSvg(200, 130, s.P, `cs-${s.id}`)}</svg>`;

const CSS = `
.gm.cs { background: var(--sim-bg-deep); border-radius: 14px; padding: 6px 12px; gap: 6px; }
.cs .row { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 8px; }
.cs .st { display: flex; flex-direction: column; padding: 0; overflow: hidden; background: var(--sim-bg-surface); border: var(--sim-border); border-radius: var(--sim-radius-md); box-shadow: 0 var(--sim-lift) 0 var(--sim-stroke); }
.cs .st svg { display: block; width: 100%; height: auto; }
.cs .st b { display: block; padding: 4px 2px 6px; font: 800 15px/1.15 var(--sim-font); text-align: center; }
.cs .st[data-done] { border-color: var(--sim-good); }
.cs .st b[data-n]::before { content: attr(data-n) ". "; }
.cs .st[data-no="1"] { border-color: var(--sim-bad); }
.cs .why { min-height: 44px; margin: 6px 2px 0; font-size: 16px; line-height: 1.3; font-weight: 700; }
.sim-dom-root--portrait .cs .row { grid-template-columns: repeat(2, minmax(0, 1fr)); }
`;

export class CoastStageGame extends GameBoard {
  static ARIA_LABEL = 'A game: put five pictures of a headland in order, from sea cliff to stump, and read what the waves did at each step.';
  static OBJECTIVE = { prompt: { en: 'Put the coast in order, and say what the waves did at each step.' } };
  static HEIGHT = 324;

  constructor(c, o) { super(c, o); this._n = 0; }

  async setup() {
    await super.setup();
    mountGame(this, { check: false, css: CSS, html: `<div class="gm cs"><div class="gm-head"><h2>Order the coast</h2><p class="sub" data-t></p></div><div class="row">${SHOW.map((i) => `<div class="st tap" role="button" tabindex="0" data-s="${ST[i].id}" aria-label="${esc(ST[i].name)}">${pic(ST[i])}<b>${esc(ST[i].name)}</b></div>`).join('')}</div><p class="why" data-why aria-live="polite"></p></div>` });
    this.root.querySelectorAll('.st').forEach((e) => onTap(e, () => this._tap(e)));
    this._say();
  }
  _say() { const t = this.root.querySelector('[data-t]'); if (t) t.textContent = this._n < ST.length ? (this._n ? 'Which picture comes next?' : 'Which picture comes first?') : 'Cliff to stump.'; }
  _tap(e) {
    if (e.dataset.done) return;
    const want = ST[this._n], why = this.root.querySelector('[data-why]');
    if (e.dataset.s !== want.id) {
      const got = ST.findIndex((s) => s.id === e.dataset.s);
      e.dataset.no = '1';
      why.textContent = `The ${ST[got].name.toLowerCase()} comes later than that. Look for what must happen first.`;
      return;
    }
    this._n += 1; e.dataset.done = String(this._n); e.querySelector('b').dataset.n = String(this._n); e.dataset.no = '0'; why.textContent = want.did;
    this._say();
    if (this._n === ST.length) { this.root.querySelectorAll('.st').forEach((c) => { c.style.order = c.dataset.done; }); this._won = true; finishGame(this); }
  }
  checkObjective() { return this._won ? { ok: true } : null; }
  resetChallenge() {
    super.resetChallenge(); this._n = 0; this._won = false;
    this.root.querySelectorAll('.st').forEach((e) => { delete e.dataset.done; e.dataset.no = '0'; e.style.order = ''; delete e.querySelector('b').dataset.n; });
    this._say();
  }
}
