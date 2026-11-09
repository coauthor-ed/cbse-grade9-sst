// ColregsCrossingGameScene - game "Four meetings": top view, own ship heading up. For each meeting the right move is
// worked out from the other ship's bearing, not typed in: ahead or within 10 degrees, turn right; on your right, turn right
// and pass behind it, or slow down: both keep clear; on your left, hold course; from behind, hold course. A wrong pick gives the reason and the same
// meeting stays. Controls: .cc-act (data-act hold, right, slow), .cc-next.
import { GameBoard, mountGame, finishGame, onTap } from 'simulations/base/kit/GameFrame.js';
import { arrow, SEA_INK, WHITE, num, tx } from '../L08/SeaDraw.js';
import { svgShipTop, seaNight } from './ShipTop.js';
import { SEA_MASCOT_CSS } from '../shared/SeaGame.js';

// bearing: degrees clockwise from your bow. hdg: the other ship's heading on the stage.
const ROUNDS = [
  { bearing: 0, hdg: 180, say: 'A ship is coming straight at you.' },
  { bearing: 60, hdg: -90, say: 'A ship is crossing, on your right.' },
  { bearing: 300, hdg: 90, say: 'A ship is crossing, on your left.' },
  { bearing: 180, hdg: 0, say: 'A faster ship is coming up behind you.' },
];
function kindOf(b) { const n = ((b % 360) + 360) % 360; if (n <= 10 || n >= 350) return 'head'; if (n <= 112) return 'right'; if (n < 248) return 'behind'; return 'left'; }
const ACCEPT = { head: ['right'], right: ['right', 'slow'], left: ['hold'], behind: ['hold'] };
const GOOD = { head: 'Head-on: both ships turn to their own right.', right: 'Other ship on your right: you give way, so turn right and pass behind it.', rightSlow: 'Other ship on your right: you give way. Slowing down keeps clear too, as it lets the other ship pass ahead.', left: 'Other ship on your left: you stand on, so hold course and speed.', behind: 'It is overtaking, so it must keep clear. You hold course.' };
const NO = {
  head: { hold: 'If both hold course they will collide. Both must act.', slow: 'Slowing does not clear the way. Each ship turns right.' },
  right: { hold: 'With the other ship on your right, you are the give-way vessel and must act.' },
  left: { right: 'With the other ship on your left, you are the stand-on vessel. Turning may confuse it.', slow: 'The stand-on vessel keeps its course and its speed.' },
  behind: { right: 'The overtaking ship keeps clear. You should not change course in front of it.', slow: 'Keep your speed steady, so the overtaking ship can judge how to pass you.' },
};
const ACTS = [['hold', 'Hold course'], ['right', 'Turn right'], ['slow', 'Slow down']];
const W = 340, H = 270;
const CSS = SEA_MASCOT_CSS + `
.gm.cc { gap: 8px; background: var(--sim-bg-deep); border-radius: 14px; }
.cc-board { display: grid; grid-template-columns: 370px minmax(0, 1fr); gap: 14px; align-items: start; }
.cc-pic svg { display: block; width: 100%; height: auto; border-radius: 14px; }
.cc-side { display: flex; flex-direction: column; gap: 8px; }
.cc-say { margin: 0; font: 600 18px/1.25 var(--sim-font-display, var(--sim-font)); }
.cc-acts { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; }
.cc-act { min-height: 50px; padding: 2px; border: var(--sim-border); border-radius: var(--sim-radius-md); background: var(--sim-bg-surface); color: var(--sim-label); font: 800 16px/1.1 var(--sim-font); }
.cc-act[data-state="good"] { background: color-mix(in oklab, var(--sim-good) 28%, var(--sim-bg-surface)); border-color: var(--sim-good); }
.cc-act[data-state="bad"] { background: color-mix(in oklab, var(--sim-error) 16%, var(--sim-bg-surface)); border-color: var(--sim-error); }
.cc-why { margin: 0; min-height: 40px; font: 700 15px/1.3 var(--sim-font); }
.gm .cc-next { min-height: 48px; border: 0; border-radius: var(--sim-radius-md); background: var(--sim-accent); color: var(--sim-bg-deep); font: 800 16px/1 var(--sim-font); box-shadow: 0 var(--sim-lift) 0 color-mix(in oklab, var(--sim-accent) 65%, var(--sim-label)); }
.gm .cc-next[hidden] { display: none; }
.sim-dom-root--portrait .cc-board { grid-template-columns: minmax(0, 1fr); }
`;

export class ColregsCrossingGameScene extends GameBoard {
  static OBJECTIVE = { prompt: { en: 'Meet four ships in turn. Each time, choose what the rules of the road ask you to do.' } };
  static ARIA_LABEL = 'Four meetings at sea seen from above. For each, choose hold course, turn right or slow down.';

  async setup() {
    this._i = 0; this._right = false; this._done = false;
    await super.setup();
    mountGame(this, { css: CSS, check: false, html: `<div class="gm cc"><div class="gm-head"><h2>Four meetings</h2><p class="sub">You are the blue ship, heading up. Both are ships with engines.</p></div>
      <div class="cc-board"><div class="cc-pic"></div><div class="cc-side"><p class="cc-say"></p><div class="cc-acts">${ACTS.map(([a, l]) => `<button type="button" class="tap cc-act" data-act="${a}">${l}</button>`).join('')}</div><p class="cc-why" aria-live="polite"></p><button type="button" class="tap cc-next" hidden>Next ship</button></div></div></div>` });
    const q = (s) => this.root.querySelector(s);
    this._p = q('.cc-pic'); this._s = q('.cc-say'); this._w = q('.cc-why'); this._n = q('.cc-next');
    this.root.querySelectorAll('.cc-act').forEach((b) => onTap(b, () => this._pick(b)));
    if (this._n) onTap(this._n, () => this._next());
    this._deal();
  }
  _pic(r, solved, act) {
    const cx = W / 2, cy = r.bearing === 180 ? H * 0.34 : H * 0.62, a = r.bearing * Math.PI / 180, d = 112, ox = cx + Math.sin(a) * d * 1.1, oy = cy - Math.cos(a) * d * (r.bearing === 180 ? 0.92 : 1);
    let s = seaNight(W, H, 'cc') + svgShipTop(ox, oy, r.hdg, 0.74, { hull: WHITE }) + svgShipTop(cx, cy, 0, 0.74, { hull: 'var(--sim-series-1)' });
    if (solved) {
      if (act === 'hold') s += arrow(cx, cy - 50, cx, cy - 92, { w: 5, col: WHITE, haloCol: SEA_INK });
      else if (act === 'slow') s += arrow(cx, cy - 50, cx, cy - 68, { w: 5, col: WHITE, haloCol: SEA_INK });
      else s += `<path d="M${cx} ${cy - 46}Q${cx + 4} ${cy - 74} ${cx + 46} ${cy - 80}" style="fill:none;stroke:${WHITE};stroke-width:5;stroke-linecap:round"/>` + arrow(cx + 36, cy - 78, cx + 58, cy - 82, { w: 5, col: WHITE, head: 13, halo: false });
    }
    s += tx(num(cx + (r.bearing === 180 ? 44 : 0)), num(r.bearing === 180 ? cy + 6 : cy + 56), 'you', { size: 15, col: WHITE });
    return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${r.say}">${s}</svg>`;
  }
  _deal() {
    const r = ROUNDS[this._i];
    this._right = false;
    if (this._s) this._s.textContent = `Ship ${this._i + 1} of ${ROUNDS.length}. ${r.say}`;
    if (this._w) this._w.textContent = '';
    if (this._p) this._p.innerHTML = this._pic(r, false);
    if (this._n) { this._n.hidden = true; this._n.textContent = this._i === ROUNDS.length - 1 ? 'Finish' : 'Next ship'; }
    this.root.querySelectorAll('.cc-act').forEach((b) => { delete b.dataset.state; });
    this.relayout?.();
  }
  _pick(b) {
    if (this._right) return;
    const r = ROUNDS[this._i], kind = kindOf(r.bearing), a = b.dataset.act;
    if (ACCEPT[kind].includes(a)) {
      this._right = true; b.dataset.state = 'good'; this._w.textContent = kind === 'right' && a === 'slow' ? GOOD.rightSlow : GOOD[kind]; this._n.hidden = false;
      if (this._p) this._p.innerHTML = this._pic(r, true, a);
      this.quill?.perform('hop');
    } else { b.dataset.state = 'bad'; this._w.textContent = NO[kind][a]; this.quill?.setExpression('surprised'); }
    this.relayout?.();
  }
  _next() {
    if (!this._right) return;
    if (this._i < ROUNDS.length - 1) { this._i += 1; this._deal(); return; }
    this._done = true;
    if (this._s) this._s.textContent = 'Four meetings, four clear choices. Each ship follows the same convention, whatever its flag.';
    this._n.hidden = true;
    finishGame(this);
  }
  checkObjective() { return this._done ? { ok: true } : null; }
}
