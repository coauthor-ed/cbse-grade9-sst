// SupplyMoveGameScene - L04 game (blk-l04-s08): which way does supply move?
//   Six cards, shuffled with Math.random (no crypto). Each card says one change in a market and names WHICH
//   good's supply it asks about. Three answers (always in the same place, so position means direction):
//   "curve moves left" | "move along the curve" | "curve moves right"; each carries a small line picture.
//   Right: the graph beside the card shows the move (the whole SmSm' slides right or left from a dashed ghost
//   with arrows, or a dot climbs along the same curve when the good's own price rises) and one short reason
//   shows; a "Next card" button. Wrong: that answer is struck out and one short reason shows; try again.
//   Win (checkObjective, real): all six cards right. The board then sorts the six cards under right / left /
//   along. finishGame -> the host's verdict.
// Cards (STORYBOARD L04 s08): drip irrigation spreads (right); three new stalls open (right); chickpea price
// rises, for wheat supply (left); potato wholesalers expect a higher price later, today's supply (left); a
// flood ruins the crop (left); the price of mangoes itself rises (along). The graph has no numbers (it stands
// for whichever good the card names). Market supply colour series-7; right = good, left = bad (as L04 s01).
// Colours are tokens only. ASCII only.
import { GameBoard, mountGame, finishGame, onTap } from 'simulations/base/kit/GameFrame.js';
import { iconSvg } from 'simulations/base/kit/SimIcons.js';
import { BTN_CSS, txt, frame, axes, arrow, pill, line } from '../shared/MarketParts.js';
import { SHIFT, qAt, smGraph, moverIcon, DIR_COL } from '../shared/SupplyMoves.js';
import { SUP } from '../shared/SupplyParts.js';

const f1 = (v) => (+v).toFixed(1);

const CARDS = [
  { id: 'drip', pic: 'tech', ans: 1, good: 'mangoes', short: 'drip irrigation',
    say: 'Drip irrigation spreads to many mango farms.',
    why: 'Drip irrigation cuts the cost of each kg, so farmers offer more at every price.' },
  { id: 'stalls', pic: 'sellers', ans: 1, good: 'mangoes', short: 'three new stalls',
    say: 'Three new mango stalls open in the lane.',
    why: 'More sellers offer mangoes, so there are more kg at every price.' },
  { id: 'chickpea', pic: 'crop', ans: -1, good: 'wheat', short: 'chickpeas earn more',
    say: 'The price of chickpeas rises. The farmer can grow wheat or chickpeas.',
    why: 'Chickpeas now earn more, so the farmer grows less wheat at every price.',
    along: 'The price of chickpeas changed, not the price of wheat, so the whole wheat curve moves.' },
  { id: 'potato', pic: 'expect', ans: -1, good: 'potatoes today', short: 'a higher price later',
    say: 'Potato wholesalers expect a higher price later in the season.',
    why: 'Wholesalers keep sacks back to sell later, so fewer potatoes are offered today.' },
  { id: 'flood', pic: 'flood', ans: -1, good: 'mangoes', short: 'a flood',
    say: 'A flood ruins the mango crop.',
    why: 'After the flood there are fewer mangoes to sell at every price.' },
  { id: 'price', pic: 'price', ans: 0, good: 'mangoes', short: 'mango price rises',
    say: 'The price of mangoes rises.',
    why: 'Only the mango price changed, so sellers move along the same curve: more kg at a higher price.' },
];
const ANS = [
  { v: -1, lab: 'curve moves left' },
  { v: 0, lab: 'move along the curve' },
  { v: 1, lab: 'curve moves right' },
];
const NAME = { 1: 'curve moves right', '-1': 'curve moves left', 0: 'move along the curve' };

function shuffled(a) {
  const r = a.slice();
  for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; }
  return r;
}

/** Why a wrong answer v is wrong for card c (never names the right answer outright). */
function whyWrong(c, v) {
  if (c.ans === 0) return 'Only the price of mangoes changed. A price change does not move the whole curve.';
  if (v === 0) return c.along ?? `The price of ${c.good.replace(' today', '')} did not change, so this is not a move along the curve.`;
  return c.why;
}

/** A small line picture for an answer button (36 high): ghost + moved line, or one line with a climbing dot. */
function ansIcon(v) {
  const ink = 'var(--sim-label)', ghost = 'var(--sim-label-muted)';
  let s = '<svg class="sm-ic" viewBox="0 0 64 40" aria-hidden="true">';
  if (v === 0) {
    s += `<path d="M10 36L50 4" style="stroke:${ink};stroke-width:4;stroke-linecap:round;fill:none"/>`;
    s += `<circle cx="20" cy="28" r="4.5" style="fill:var(--sim-bg-surface);stroke:${ink};stroke-width:2.5"/>`;
    s += `<circle cx="40" cy="12" r="6" style="fill:${ink}"/>`;
  } else {
    const dx = v * 14;
    s += `<path d="M${18} 36L${46} 4" style="stroke:${ghost};stroke-width:3;stroke-dasharray:4 4;stroke-linecap:round;fill:none;opacity:0.8"/>`;
    s += `<path d="M${18 + dx} 36L${46 + dx} 4" style="stroke:${ink};stroke-width:4;stroke-linecap:round;fill:none"/>`;
    const y = 20, x0 = 32 - v * 2, x1 = x0 + v * 13;
    s += `<path d="M${x0} ${y}L${x1} ${y}" style="stroke:${ink};stroke-width:3;fill:none"/><path d="M${x1 + v * 6} ${y}L${x1} ${y - 5}L${x1} ${y + 5}Z" style="fill:${ink}"/>`;
  }
  return s + '</svg>';
}

/** The card's picture in its own 140 x 110 box. */
function picture(kind) {
  let s = '<svg class="sm-pic" viewBox="0 0 140 110" aria-hidden="true">';
  if (kind === 'flood') {
    const ic = (name, x, y, w, tone) => iconSvg(name, tone).replace('<svg class="sim-icon" viewBox="0 0 48 48" width="48" height="48"', `<svg class="sim-icon" viewBox="0 0 48 48" x="${x}" y="${y}" width="${w}" height="${w}"`);
    s += ic('rain', 22, 0, 64, 'var(--sim-water)') + ic('river', 40, 44, 74, 'var(--sim-water)');
    s += ic('tree', 6, 50, 40, 'var(--sim-series-3)');
  } else {
    s += moverIcon(kind, 70, kind === 'sellers' ? 46 : 55, kind === 'price' ? 130 : 118);
  }
  return s + '</svg>';
}

const CSS = `
.sm { background: var(--sim-bg-deep); border-radius: var(--sim-radius-md, 12px); }
.sm .gm-head h2 { margin: 0; }
.sm .sm-body { flex: 1 1 auto; min-height: 0; display: grid; grid-template-columns: minmax(0, 1fr) 430px; gap: 22px; align-items: center; }
.sm .sm-left { display: flex; flex-direction: column; gap: 10px; min-width: 0; }
.sm .sm-card { display: flex; gap: 14px; align-items: center; background: var(--sim-bg-surface); border: 2.5px solid var(--sim-stroke);
  border-radius: var(--sim-radius-lg, 16px); padding: 8px 14px 8px 8px; }
.sm .sm-pic { flex: 0 0 auto; width: 132px; height: 104px; display: block; }
.sm .sm-txt { min-width: 0; display: flex; flex-direction: column; gap: 4px; }
.sm .sm-dots { display: flex; gap: 6px; align-items: center; font: 800 14px/1 var(--sim-font); color: var(--sim-label-muted); }
.sm .sm-dot { width: 12px; height: 12px; border-radius: 50%; border: 2.5px solid var(--sim-stroke); background: var(--sim-bg-surface); }
.sm .sm-dot[data-s="done"] { background: ${SUP}; border-color: ${SUP}; }
.sm .sm-dot[data-s="now"] { border-color: var(--sim-accent); }
.sm .sm-say { margin: 0; font: 800 20px/1.25 var(--sim-font); color: var(--sim-label); }
.sm .sm-ask { margin: 0; font: 700 17px/1.3 var(--sim-font); color: var(--sim-label-muted); }
.sm .sm-ask b { white-space: nowrap; color: var(--sim-label); background: color-mix(in oklab, ${SUP} 22%, var(--sim-bg-surface)); border-radius: 8px; padding: 0 6px; }
.sm .sm-ans { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; }
.sm .sm-a { display: flex; align-items: center; justify-content: center; gap: 8px; min-height: 52px; padding: 4px 8px;
  font: 800 16px/1.15 var(--sim-font); text-align: left; }
.sm .sm-ic { flex: 0 0 auto; width: 46px; height: 30px; display: block; }
.sm .sm-a[data-s="bad"] { opacity: 0.5; border-color: var(--sim-bad); text-decoration: line-through; text-decoration-thickness: 2px; box-shadow: none; }
.sm .sm-a[data-s="good"] { border-color: var(--sim-good); background: color-mix(in oklab, var(--sim-good) 16%, var(--sim-bg-surface)); }
.sm .sm-a[aria-disabled="true"] { cursor: default; }
.sm .sm-row { display: flex; align-items: center; gap: 12px; min-height: 50px; }
.sm .sm-why { flex: 1 1 auto; margin: 0; font: 700 17px/1.3 var(--sim-font); color: var(--sim-label); }
.sm .sm-why[data-tone="good"] { color: var(--sim-good); }
.sm .sm-why[data-tone="bad"] { color: var(--sim-bad); }
.sm .sm-next { flex: 0 0 auto; min-width: 140px; background: var(--sim-accent); color: var(--sim-bg-deep); border-color: transparent; font-size: 17px; font-weight: 800; }
.sm .sm-fig svg { display: block; width: 100%; height: auto; max-height: 250px; }
.sm .sm-sort { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; }
.sm .sm-bin { background: var(--sim-bg-surface); border: 2.5px solid var(--sim-stroke); border-radius: var(--sim-radius-lg, 16px); padding: 8px 10px; }
.sm .sm-bin h3 { margin: 0 0 6px; font: 800 16px/1.2 var(--sim-font); }
.sm .sm-bin p { margin: 0 0 4px; font: 700 15px/1.25 var(--sim-font); color: var(--sim-label); }
.sm .sm-pop { animation: sm-pop 0.4s cubic-bezier(.3,1.5,.5,1) both; }
@keyframes sm-pop { 0% { transform: scale(0.85); opacity: 0; } 100% { transform: none; opacity: 1; } }
@media (prefers-reduced-motion: reduce) { .sm .sm-pop { animation: none; } }
.sim-dom-root--portrait .sm .sm-body { display: flex; flex-direction: column; gap: 8px; align-items: stretch; }
.sim-dom-root--portrait .sm .sm-left { display: contents; }
.sim-dom-root--portrait .sm .sm-card { order: 1; padding: 6px 10px 6px 4px; gap: 8px; }
.sim-dom-root--portrait .sm .sm-fig { order: 2; }
.sim-dom-root--portrait .sm .sm-ans { order: 3; gap: 6px; }
.sim-dom-root--portrait .sm .sm-row { order: 4; flex-direction: column; align-items: stretch; gap: 6px; min-height: 0; }
.sim-dom-root--portrait .sm .sm-sort { order: 3; grid-template-columns: minmax(0, 1fr); gap: 6px; }
.sim-dom-root--portrait .sm .sm-pic { width: 88px; height: 70px; }
.sim-dom-root--portrait .sm .sm-say { font-size: 16px; }
.sim-dom-root--portrait .sm .sm-ask { font-size: 14px; }
.sim-dom-root--portrait .sm .sm-a { flex-direction: column; gap: 2px; min-height: 76px; padding: 4px 3px; font-size: 14px; text-align: center; }
.sim-dom-root--portrait .sm .sm-why { font-size: 15px; text-align: center; }
.sim-dom-root--portrait .sm .sm-next { width: 100%; }
.sim-dom-root--portrait .sm .sm-bin h3 { font-size: 15px; margin-bottom: 2px; }
.sim-dom-root--portrait .sm .sm-bin p { font-size: 14px; display: inline; }
.sim-dom-root--portrait .sm .sm-bin p + p::before { content: ', '; }
.sim-dom-root--portrait .sm .sm-fig svg { max-height: none; }
`;

export class SupplyMoveGameScene extends GameBoard {
  static HEIGHT = 330;
  static CONTINUOUS = false;
  static OBJECTIVE = { prompt: { en: 'For each change, choose: supply curve moves right, supply curve moves left, or a move along the curve. Win when every card is right.' } };
  static ARIA_LABEL = 'Six cards, one at a time. Each says one change in a market and names the good whose supply it asks about. Choose: the supply curve moves left, sellers move along the curve, or the supply curve moves right. After a right answer the graph shows the move: the whole curve slides right or left, or, when only the good\'s own price changes, a point climbs along the same curve. Win when all six are right.';

  async setup() {
    this.reset();
    this.figP = null;
    await super.setup();
    mountGame(this, {
      css: BTN_CSS + CSS, check: false,
      onResize: () => { if (this.isPortrait() !== this.figP) this.draw(); },
      html: '<div class="gm sm"><div class="gm-head"><h2>Which way does supply move?</h2></div><div class="sm-body"><div class="sm-left"></div><div class="sm-fig"></div></div></div>',
    });
    // One Quill only: mini-game@1 draws him in its verdict strip, so the frame's corner Quill goes (never on the board).
    this.quill?.destroy?.(); this.quill = null; this._scaleWrap?.classList.remove('gm-quill');
    this.draw();
  }

  reset() {
    this.stopLater?.();
    this.deck = shuffled(CARDS);
    this.i = 0;
    this.bad = new Set();
    this.got = false;
    this.won = false;
    this.fresh = false;
    this.slips = 0;
  }

  isPortrait() { return !!(this.root?.closest?.('.sim-dom-root--portrait') || this.root?.classList?.contains('sim-dom-root--portrait')); }

  get card() { return this.deck[this.i]; }

  draw() {
    const left = this.root?.querySelector('.sm-left'), fig = this.root?.querySelector('.sm-fig');
    if (!left || !fig) return;
    this.figP = this.isPortrait();
    const P = this.figP;
    if (this.won) {
      left.innerHTML = this.sortHtml();
      fig.innerHTML = this.figure(P, 'won');
      this.relayout?.();
      return;
    }
    const c = this.card;
    const dots = this.deck.map((_, n) => `<span class="sm-dot" data-s="${n < this.i || (n === this.i && this.got) ? 'done' : n === this.i ? 'now' : ''}"></span>`).join('');
    let h = `<div class="sm-card${this.fresh ? ' sm-pop' : ''}">${picture(c.pic)}<div class="sm-txt">`
      + `<div class="sm-dots" aria-label="card ${this.i + 1} of 6">${dots}<span>&nbsp;card ${this.i + 1} of 6</span></div>`
      + `<p class="sm-say">${c.say}</p><p class="sm-ask">What happens to the <b>supply of ${c.good}</b>?</p></div></div>`;
    h += '<div class="sm-ans">' + ANS.map((a) => {
      const s = this.bad.has(a.v) ? 'bad' : (this.got && a.v === c.ans ? 'good' : '');
      const off = !!s || this.got;
      return `<button type="button" class="tap btn sm-a" data-v="${a.v}"${s ? ` data-s="${s}"` : ''}${off ? ' aria-disabled="true"' : ''} aria-label="${a.lab}${s === 'bad' ? ': not right' : ''}">${ansIcon(a.v)}<span>${a.lab}</span></button>`;
    }).join('') + '</div>';
    h += `<div class="sm-row"><p class="sm-why" aria-live="polite"${this.tone ? ` data-tone="${this.tone}"` : ''}>${this.msg ?? ''}</p>`
      + (this.got ? `<button type="button" class="tap btn sm-next">${this.i === this.deck.length - 1 ? 'Finish' : 'Next card'}</button>` : '') + '</div>';
    left.innerHTML = h;
    left.querySelectorAll('.sm-a').forEach((b) => onTap(b, () => this.pick(Number(b.dataset.v))));
    const nx = left.querySelector('.sm-next');
    if (nx) onTap(nx, () => this.next());
    fig.innerHTML = this.figure(P, this.got ? c.ans : 'ask');
    this.fresh = false;
    this.relayout?.();
  }

  sortHtml() {
    const col = (v) => (v === 0 ? 'var(--sim-accent)' : DIR_COL(v));
    return '<div class="sm-sort">' + [1, -1, 0].map((v) => `<div class="sm-bin sm-pop" style="border-color:${col(v)}"><h3 style="color:${col(v)}">${NAME[v]}</h3>`
      + CARDS.filter((c) => c.ans === v).map((c) => `<p>${c.short}</p>`).join('') + '</div>').join('') + '</div>'
      + '<div class="sm-row"><p class="sm-why" data-tone="good">All six right. Only a change in the good\'s own price is a move along the curve.</p></div>';
  }

  /** The graph (no numbers): SmSm' and what the answer does to it. mode: 'ask' | 1 | -1 | 0 | 'won'. */
  figure(P, mode) {
    const W = P ? 320 : 430, H = P ? 196 : 262;
    const g = P ? frame(34, 306, 40, 166, 26, 200) : frame(44, 412, 52, 222, 26, 200);
    let s = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="supply graph: ${mode === 'ask' ? 'the supply curve before the change' : mode === 'won' ? 'the three ways' : NAME[mode]}">`;
    s += axes(g, { xs: [], ys: [], gridX: [6, 12, 18, 24], gridY: [50, 100, 150], yTitle: 'price', xTitle: 'kg', yTitleX: g.L - (P ? 14 : 18), xTitleY: g.B + (P ? 24 : 30), title: P ? 17 : 20 });
    const head = mode === 'won' ? 'supply' : `supply of ${this.card.good}`;
    s += pill(W / 2, P ? 17 : 22, head, { size: P ? 16 : 19, bg: `color-mix(in oklab, ${SUP} 22%, var(--sim-bg-surface))`, edge: SUP });
    const lab = P ? 22 : 26;
    if (mode === 'ask') {
      s += smGraph(g, { d: 0, w: 6, lab });
      s += txt(g.X(21.5), g.Y(60), '?', P ? 44 : 56, 'var(--sim-label-muted)');
    } else if (mode === 1 || mode === -1) {
      const d = mode * SHIFT;
      s += smGraph(g, { d, from: this.anim ? 0 : null, w: 6, lab, arrows: false });
      let ar = '';
      for (const p of [mode < 0 ? 125 : 150, 100, 50]) {
        const x0 = g.X(qAt(p, 0)), x1 = g.X(qAt(p, d));
        if (Math.abs(x1 - x0) > 24) ar += arrow(x0 + mode * 10, g.Y(p), x1 - mode * 12, g.Y(p), DIR_COL(d), P ? 3.5 : 4.5);
      }
      s += this.anim ? `<g class="mq-fade" style="--d:0.8s">${ar}</g>` : ar;
    } else if (mode === 0) {
      s += smGraph(g, { d: 0, w: 6, lab });
      const xa = g.X(qAt(80)), ya = g.Y(80), xb = g.X(qAt(150)), yb = g.Y(150);
      s += `<circle cx="${f1(xa)}" cy="${f1(ya)}" r="${P ? 7 : 9}" style="fill:var(--sim-bg-surface);stroke:var(--sim-accent);stroke-width:3"/>`;
      s += `<path d="M${f1(g.L)} ${f1(yb)}H${f1(xb)}" style="fill:none;stroke:var(--sim-accent);stroke-width:2.5;stroke-dasharray:6 6"/>`;
      s += txt(g.L + 8, yb - 8, 'higher price', P ? 15 : 18, 'var(--sim-accent)', 'start');
      s += `<g${this.anim ? ` class="mq-fly" style="--dx:${f1(xa - xb)}px;--dy:${f1(ya - yb)}px;--dur:0.8s"` : ''}><circle cx="${f1(xb)}" cy="${f1(yb)}" r="${P ? 10 : 12}" style="fill:var(--sim-accent);stroke:var(--sim-bg-surface);stroke-width:3"/></g>`;
    } else {
      // won: the three ways on one graph
      s += smGraph(g, { d: 0, w: 6, lab });
      s += line(g, qAt(20, SHIFT), 20, qAt(145, SHIFT), 145, DIR_COL(1), { w: 4, dash: '10 8', opacity: 0.8 });
      s += line(g, qAt(55, -SHIFT), 55, qAt(165, -SHIFT), 165, DIR_COL(-1), { w: 4, dash: '10 8', opacity: 0.8 });
      s += arrow(g.X(qAt(125, 0)) + 10, g.Y(125), g.X(qAt(125, SHIFT)) - 10, g.Y(125), DIR_COL(1), P ? 3.5 : 4.5);
      s += arrow(g.X(qAt(60, 0)) - 10, g.Y(60), g.X(qAt(60, -SHIFT)) + 10, g.Y(60), DIR_COL(-1), P ? 3.5 : 4.5);
      s += `<circle cx="${f1(g.X(qAt(100)))}" cy="${f1(g.Y(100))}" r="${P ? 9 : 11}" style="fill:var(--sim-accent);stroke:var(--sim-bg-surface);stroke-width:3"/>`;
    }
    if (mode === 1 || mode === -1 || mode === 0) {
      const col = mode === 0 ? 'var(--sim-accent)' : DIR_COL(mode);
      const x = mode === 1 ? g.X(20) : mode === -1 ? g.X(17) : g.X(17.5);
      s += `<g${this.anim ? ' class="mq-fade" style="--d:0.6s"' : ''}>${pill(P ? Math.min(x, W - 92) : x, g.B - (P ? 20 : 24), NAME[mode], { size: P ? 15 : 18, bg: col, ink: 'var(--sim-bg-deep)', edge: col })}</g>`;
    }
    return s + '</svg>';
  }

  say(msg, tone) { this.msg = msg; this.tone = tone; }

  pick(v) {
    if (this.won || this.got || this.bad.has(v)) return;
    const c = this.card;
    if (v === c.ans) {
      this.got = true;
      this.anim = true;
      this.say(`Right: ${c.why}`, 'good');
      this.later(() => { this.anim = false; const fig = this.root?.querySelector('.sm-fig'); if (fig && !this.won) fig.innerHTML = this.figure(this.figP, this.card.ans); }, 1300);
    } else {
      this.bad.add(v);
      this.slips++;
      this.say(whyWrong(c, v), 'bad');
    }
    this.draw();
  }

  /** One pending timer (the rest-state repaint after an animation); cleared on every move. */
  later(fn, ms) { this.stopLater(); this._restT = setTimeout(() => { this._restT = null; fn(); }, ms); }

  stopLater() { if (this._restT) clearTimeout(this._restT); this._restT = null; this.anim = false; }

  busy() { return !!this._restT; }

  destroy() { this.stopLater(); super.destroy(); }

  next() {
    if (!this.got || this.won) return;
    this.stopLater();
    if (this.i === this.deck.length - 1) {
      this.won = true;
      this.draw();
      finishGame(this);
      return;
    }
    this.i++;
    this.bad = new Set();
    this.got = false;
    this.fresh = true;
    this.say('', null);
    this.draw();
  }

  checkObjective() { return this.won ? { ok: true } : null; }

  resetChallenge() {
    super.resetChallenge?.();
    this.reset();
    this.say('', null);
    this.draw();
  }

  testState() { return { won: this.won, i: this.i, card: this.card?.id, got: this.got, bad: [...this.bad], order: this.deck.map((c) => c.id) }; }
}
