// RouteTheWaterScene ("Route the water") - a limestone cutaway with sites. Tap the route the water takes from the
// soil to the cave mouth. Water runs downhill along open cracks only. A pocket with no way out offers Try again.
// Four boards, no timer. Control names: .st[data-n], .again, .nxt.
import { GameBoard, mountGame, onTap, finishGame } from 'simulations/base/kit/GameFrame.js';
import { esc } from 'simulations/base/SimUi.js';
import { art, n1, svgRock } from '../L08/LandDraw.js';

const VW = 320, VH = 300;
// x, y in board px. e: where water can run next. kind: start, end, pocket.
const BOARDS = [
  { nodes: { a: [70, 40, 'Soil'], b: [70, 130, 'Crack'], c: [170, 170, 'Cave'], d: [250, 250, 'Cave mouth'], e: [250, 70, 'Crack'] }, e: { a: ['b'], b: ['c'], c: ['d'], e: ['c'] } },
  { nodes: { a: [160, 40, 'Soil'], b: [70, 120, 'Crack'], c: [250, 120, 'Crack'], d: [70, 215, 'Pocket'], e: [250, 215, 'Passage'], f: [160, 268, 'Cave mouth'] }, e: { a: ['b', 'c'], b: ['d'], c: ['e'], e: ['f'] } },
  { nodes: { a: [60, 36, 'Soil'], b: [170, 92, 'Crack'], c: [60, 150, 'Pocket'], d: [262, 158, 'Cave'], e: [170, 214, 'Passage'], f: [262, 268, 'Cave mouth'] }, e: { a: ['b'], b: ['c', 'd'], d: ['e', 'f'], e: ['f'] } },
  { nodes: { a: [262, 36, 'Soil'], b: [262, 120, 'Crack'], c: [150, 96, 'Crack'], d: [150, 190, 'Cave'], e: [50, 150, 'Pocket'], f: [60, 262, 'Underground river'], g: [230, 262, 'Cave mouth'] }, e: { a: ['b', 'c'], b: ['d'], c: ['e'], d: ['f'], f: ['g'] } },
];
const CSS = `
.gm.rw { background: var(--sim-bg-deep); border-radius: 14px; padding: 8px 16px; gap: 8px; }
.rw .play { display: grid; grid-template-columns: 430px minmax(0, 1fr); gap: 16px; align-items: start; }
.rw .brd { position: relative; aspect-ratio: ${VW} / ${VH}; max-height: 300px; border-radius: var(--sim-radius-lg); overflow: hidden; border: var(--sim-border); box-shadow: 0 var(--sim-lift) 0 var(--sim-stroke); }
.rw .brd svg { position: absolute; inset: 0; width: 100%; height: 100%; }
.rw .st { position: absolute; transform: translate(-50%, -50%); min-height: 44px; min-width: 44px; max-width: 110px; display: flex; align-items: center; justify-content: center; padding: 3px 9px; text-align: center; line-height: 1.1;
  font-size: 14px; font-weight: 800; background: var(--sim-bg-surface); border: var(--sim-border); border-radius: var(--sim-radius-md); }
.rw .st[data-on="1"] { background: var(--sim-accent); color: var(--sim-bg-deep); border-color: var(--sim-accent); }
.rw .st[data-pocket="1"] { box-shadow: none; }
.rw .n { font-size: 15px; font-weight: 800; color: var(--sim-label-muted); }
.rw .why { min-height: 64px; margin: 4px 0 8px; font-size: 16px; line-height: 1.3; font-weight: 700; }
.rw .why[data-k="bad"] { color: var(--sim-bad); }
.rw .btn2 { display: none; width: 100%; margin-top: 6px; border: 0; border-radius: var(--sim-radius-md); font-size: 16px; font-weight: 800; background: var(--sim-accent); color: var(--sim-bg-deep); }
.rw[data-stuck="1"] .again, .rw[data-done="1"] .nxt { display: block; }
.sim-dom-root:not(.sim-dom-root--portrait) .rw .gm-head { display: flex; gap: 12px; align-items: baseline; }
.sim-dom-root:not(.sim-dom-root--portrait) .rw .brd { aspect-ratio: auto; height: 266px; max-height: none; }
.sim-dom-root--portrait .rw { padding: 4px; }
.sim-dom-root--portrait .rw .play { grid-template-columns: minmax(0, 1fr); gap: 8px; }
.sim-dom-root--portrait .rw .sub { padding-right: 56px; }
`;

export class RouteTheWaterScene extends GameBoard {
  static HEIGHT = 332;
  static OBJECTIVE = { prompt: { en: 'Tap the route the water takes, from the soil to the cave mouth.' } };
  static ARIA_LABEL = 'A cutaway of limestone with sites joined by cracks. Tap the sites in the order water reaches them, from the soil to the cave mouth. Water runs downhill along open cracks only.';
  async setup() {
    await super.setup();
    this._b = 0; this._path = ['a']; this._won = false;
    mountGame(this, {
      css: CSS, check: false,
      html: `<div class="gm rw"><div class="gm-head"><h2>Route the water</h2><p class="sub">Water runs downhill, along open cracks only.</p></div>
        <div class="play"><div class="brd"></div><div><div class="n"></div><p class="why" aria-live="polite"></p>
        <button type="button" class="btn2 again tap">Try again</button><button type="button" class="btn2 nxt tap">Next</button></div></div></div>`,
    });
    this._g = this.root.querySelector('.rw');
    const a = this.root.querySelector('.again'), n = this.root.querySelector('.nxt');
    if (a) onTap(a, () => this._restart());
    if (n) onTap(n, () => this._next());
    this._deal();
  }
  _restart() { this._path = ['a']; this._g.dataset.stuck = '0'; this._say('Start again from the soil.', ''); this._draw(); }
  _say(t, k) { const w = this.root.querySelector('.why'); w.textContent = t; w.dataset.k = k; }
  _deal() {
    if (!this._g) return;
    this._path = ['a'];
    this._g.dataset.stuck = '0'; this._g.dataset.done = '0';
    this.root.querySelector('.n').textContent = `Board ${this._b + 1} of ${BOARDS.length}`;
    this.root.querySelector('.nxt').textContent = this._b === BOARDS.length - 1 ? 'Finish' : 'Next';
    this._say('The rain has soaked into the soil. Tap where it goes next.', '');
    this._draw();
  }
  _draw() {
    const B = BOARDS[this._b], pos = (k) => B.nodes[k];
    let s = svgRock([[0, 0], [VW, 0], [VW, VH], [0, VH]], { seed: 4 + this._b, bands: ['sandLit', 'rockLit', 'sandLit'], bandH: 38, warp: 3 });
    for (const [a, list] of Object.entries(B.e)) for (const b of list) {
      const on = this._path.some((p, i) => p === a && this._path[i + 1] === b);
      s += `<path d="M${pos(a)[0]} ${pos(a)[1]}L${pos(b)[0]} ${pos(b)[1]}" style="fill:none;stroke:${art('rockDeep')};stroke-width:12;stroke-linecap:round"/>`;
      if (on) s += `<path d="M${pos(a)[0]} ${pos(a)[1]}L${pos(b)[0]} ${pos(b)[1]}" style="fill:none;stroke:${art('sea')};stroke-width:6;stroke-linecap:round"/>`;
    }
    const nodes = Object.entries(B.nodes).map(([k, [x, y, l]]) => `<div class="st tap" role="button" tabindex="0" data-n="${k}" data-on="${this._path.includes(k) ? 1 : 0}" style="left:${n1(x / VW * 100)}%;top:${n1(y / VH * 100)}%">${esc(l)}</div>`).join('');
    const b = this.root.querySelector('.brd');
    b.innerHTML = `<svg viewBox="0 0 ${VW} ${VH}" aria-hidden="true" preserveAspectRatio="none">${s}</svg>${nodes}`;
    b.querySelectorAll('.st').forEach((el) => onTap(el, () => this._tap(el.dataset.n)));
  }
  _tap(k) {
    if (this._g.dataset.done === '1' || this._g.dataset.stuck === '1') return;
    const B = BOARDS[this._b], at = this._path[this._path.length - 1], next = B.e[at] ?? [];
    if (k === at) return;
    if (!next.includes(k)) {
      const up = B.nodes[k][1] < B.nodes[at][1];
      this._say(up ? 'Water cannot run uphill.' : 'No open crack joins these two. Solid rock stops the water.', 'bad');
      this.quill?.setExpression('surprised');
      return;
    }
    this._path.push(k);
    this._draw();
    const out = B.e[k] ?? [];
    if (/mouth/i.test(B.nodes[k][2])) {
      this._g.dataset.done = '1';
      this._say('The water has crossed the rock and come out at the cave mouth.', 'good');
      this.quill?.perform?.('nod');
    } else if (!out.length) {
      this._g.dataset.stuck = '1';
      this._say('This pocket has no way out, so the water stops here.', 'bad');
    } else this._say(`The water reaches the ${B.nodes[k][2].toLowerCase()}. Where next?`, '');
  }
  _next() {
    if (this._b < BOARDS.length - 1) { this._b += 1; this._deal(); return; }
    this._won = true;
    finishGame(this);
  }
  checkObjective() { return this._won ? { ok: true } : null; }
  resetChallenge() { super.resetChallenge(); this._b = 0; this._won = false; this._deal(); }
}
