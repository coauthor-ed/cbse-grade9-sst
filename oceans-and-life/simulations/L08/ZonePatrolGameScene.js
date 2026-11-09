// ZonePatrolGameScene - game "Coast patrol" on a made-up coast, not to scale. Five boats, one at a time, each with a set
// distance and action. The learner picks Let pass, Inspect or Order out by the rights of the band. A wrong pick gives the
// reason and stays on the same boat, so no dead end. Controls: .zp-act (data-act pass, inspect, order), .zp-next.
import { GameBoard, mountGame, finishGame, onTap } from 'simulations/base/kit/GameFrame.js';
import { svgTrawler, svgCargoShip, arrow, tag, seaTx, SEA_INK } from './SeaDraw.js';
import { zoneGeom, zoneArt, BAND_TONE } from './ZoneSection.js';
import { bandAt } from './MaritimeZones.js';
import { SEA_MASCOT_CSS } from '../shared/SeaGame.js';

const ACTS = [['pass', 'Let pass'], ['inspect', 'Inspect'], ['order', 'Order out']];
const CASES = [
  { nm: 8, ship: 'cargo', say: 'A foreign cargo ship, 8 NM out, sails straight through.', ans: 'pass', good: 'Territorial sea: it may keep going under innocent passage.', no: { inspect: 'It threatens nothing, so innocent passage lets it pass.', order: 'It is sailing straight through, and that is its right here.' } },
  { nm: 6, ship: 'trawler', say: 'A foreign trawler, 6 NM out, is fishing.', ans: 'order', good: 'Territorial sea: fishing is not allowed under innocent passage.', no: { pass: 'Innocent passage does not allow fishing.', inspect: 'There is nothing to find out: fishing here already breaks the right.' } },
  { nm: 18, ship: 'cargo', say: 'A foreign ship, 18 NM out, may be carrying smuggled goods to shore.', ans: 'inspect', good: 'Contiguous zone: limited control, and customs is part of it.', no: { pass: 'Customs is one of the matters this country can act on here.', order: 'This zone gives limited control. A check on customs fits it.' } },
  { nm: 120, ship: 'trawler', say: 'A foreign trawler, 120 NM out, is fishing with no permission.', ans: 'order', good: 'EEZ: the country has special rights over the fish.', no: { pass: 'Passing is free here, but the fish are under this country\'s rights.', inspect: 'It is already seen fishing with no permission, so it must stop.' } },
  { nm: 120, ship: 'cargo', say: 'A foreign cargo ship, 120 NM out, is passing peacefully.', ans: 'pass', good: 'EEZ: other countries\' ships may pass through peacefully.', no: { inspect: 'It is only passing, and the country does not fully control this water.', order: 'The country does not fully own this water, so ships may pass.' } },
];
const W = 340, H = 186;
const CSS = SEA_MASCOT_CSS + `
.gm.zp { gap: 8px; background: var(--sim-bg-deep); border-radius: 14px; }
.zp-board { display: grid; grid-template-columns: 500px minmax(0, 1fr); gap: 14px; align-items: start; }
.zp-pic { border-radius: var(--sim-radius-md); overflow: hidden; border: var(--sim-border); }
.zp-pic svg { display: block; width: 100%; height: auto; }
.zp-side { display: flex; flex-direction: column; gap: 8px; }
.zp-say { margin: 0; font: 600 18px/1.25 var(--sim-font-display, var(--sim-font)); }
.zp-acts { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; }
.zp-act { min-height: 50px; padding: 2px; border: var(--sim-border); border-radius: var(--sim-radius-md); background: var(--sim-bg-surface); color: var(--sim-label); font: 800 16px/1.1 var(--sim-font); }
.zp-act[data-state="good"] { background: color-mix(in oklab, var(--sim-good) 28%, var(--sim-bg-surface)); border-color: var(--sim-good); }
.zp-act[data-state="bad"] { background: color-mix(in oklab, var(--sim-error) 16%, var(--sim-bg-surface)); border-color: var(--sim-error); }
.zp-why { margin: 0; min-height: 40px; font: 700 15px/1.3 var(--sim-font); }
.gm .zp-next { min-height: 48px; border: 0; border-radius: var(--sim-radius-md); background: var(--sim-accent); color: var(--sim-bg-deep); font: 800 16px/1 var(--sim-font); box-shadow: 0 var(--sim-lift) 0 color-mix(in oklab, var(--sim-accent) 65%, var(--sim-label)); }
.gm .zp-next[hidden] { display: none; }
.sim-dom-root--portrait .zp-board { grid-template-columns: minmax(0, 1fr); }
`;

export class ZonePatrolGameScene extends GameBoard {
  static OBJECTIVE = { prompt: { en: 'Check each boat on this made-up coast. Let it pass, inspect it or order it out, by the rights of the band it is in.' } };
  static ARIA_LABEL = 'A patrol game on a made-up coast, not to scale. Five boats at set distances: choose let pass, inspect or order out by the rights of each band.';

  async setup() {
    this._i = 0; this._right = false; this._done = false;
    await super.setup();
    mountGame(this, { css: CSS, check: false, html: `<div class="gm zp"><div class="gm-head"><h2>Coast patrol</h2><p class="sub">A made-up coast. Not to scale.</p></div>
      <div class="zp-board"><div class="zp-pic"></div><div class="zp-side"><p class="zp-say"></p><div class="zp-acts">${ACTS.map(([a, l]) => `<button type="button" class="tap zp-act" data-act="${a}">${l}</button>`).join('')}</div><p class="zp-why" aria-live="polite"></p><button type="button" class="tap zp-next" hidden>Next boat</button></div></div></div>` });
    const q = (s) => this.root.querySelector(s);
    this._p = q('.zp-pic'); this._s = q('.zp-say'); this._w = q('.zp-why'); this._n = q('.zp-next');
    this.root.querySelectorAll('.zp-act').forEach((b) => onTap(b, () => this._pick(b)));
    if (this._n) onTap(this._n, () => this._next());
    this._deal();
  }
  _pic(c, named) {
    const g = zoneGeom(W, H, { seaY: 76 });
    let s = zoneArt(g, W, H, { bands: named ? { [bandAt(c.nm).id]: true } : false });
    const x = g.X(c.nm);
    for (const [v, l] of [[g.x12, '12'], [g.x24, '24'], [g.x200, '200']]) s += `<path d="M${v} 22V76" style="stroke:${SEA_INK};stroke-width:2"/>` + seaTx(v, 18, l, { size: 15 });
    s += `<path d="M${g.baseX} 12V${H}" style="stroke:${SEA_INK};stroke-width:3"/>`;
    s += c.ship === 'trawler' ? svgTrawler(x, 78, 0.34, {}) : svgCargoShip(x, 78, 0.2, {});
    s += arrow(x, 118, x, 84, { w: 3, head: 8 });
    s += tag(Math.max(92, Math.min(W - 60, x)), 132, `${c.nm} NM`, { size: 15, rim: named ? BAND_TONE[bandAt(c.nm).id] : SEA_INK });
    return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="A boat ${c.nm} nautical miles from the baseline">${s}</svg>`;
  }
  _deal() {
    const c = CASES[this._i];
    this._right = false;
    if (this._s) this._s.textContent = `Boat ${this._i + 1} of ${CASES.length}. ${c.say}`;
    if (this._w) this._w.textContent = '';
    if (this._p) this._p.innerHTML = this._pic(c, false);
    if (this._n) { this._n.hidden = true; this._n.textContent = this._i === CASES.length - 1 ? 'Finish' : 'Next boat'; }
    this.root.querySelectorAll('.zp-act').forEach((b) => { delete b.dataset.state; });
    this.relayout?.();
  }
  _pick(b) {
    if (this._right) return;
    const c = CASES[this._i], a = b.dataset.act;
    if (a === c.ans) {
      this._right = true; b.dataset.state = 'good'; this._w.textContent = c.good; this._n.hidden = false;
      if (this._p) this._p.innerHTML = this._pic(c, true);
      this.quill?.perform('hop');
    } else {
      b.dataset.state = 'bad'; this._w.textContent = c.no[a]; this.quill?.setExpression('surprised');
    }
    this.relayout?.();
  }
  _next() {
    if (!this._right) return;
    if (this._i < CASES.length - 1) { this._i += 1; this._deal(); return; }
    this._done = true;
    if (this._s) this._s.textContent = 'All five boats checked, each by the rights of its band.';
    this._n.hidden = true;
    finishGame(this);
  }
  checkObjective() { return this._done ? { ok: true } : null; }
}
