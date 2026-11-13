// MarketSumGameScene - L02 game (blk-l02-s08): fill the market demand column of a made-up guava market.
//   The board: a 3-row schedule (price per kg | Friend 1 | Friend 2 | Friend 3 | market) with "?" in every
//   market cell, and a small graph (price up, kg along) beside it. Tap a "?" (the first open row is picked at
//   the start), then pick the total from four choices, shuffled with Math.random (no crypto): the right sum,
//   the largest single amount, the sum off by one, and the average or the sum one under. Right: the cell fills
//   and that point drops onto the graph. Wrong: the choice is struck out and one short reason shows (it never
//   gives the total). Win (checkObjective, real): all three totals right; the market demand curve draws through
//   (4, Rs 80), (8, Rs 50), (15, Rs 20). finishGame -> the host's verdict.
// Numbers (STORYBOARD L02 s08, made-up, said on screen): Rs 80: 1, 1, 2 -> 4 kg; Rs 50: 2, 3, 3 -> 8 kg;
// Rs 20: 4, 5, 6 -> 15 kg. Market colour series-5 (as every L02 scene). Colours are tokens only. ASCII only.
import { GameBoard, mountGame, finishGame, onTap } from 'simulations/base/kit/GameFrame.js';

const RS = '\u20B9';
const PRICES = [80, 50, 20];
const ROWS = [[1, 1, 2], [2, 3, 3], [4, 5, 6]];
const SUM = ROWS.map((r) => r[0] + r[1] + r[2]);
const MKT = 'var(--sim-series-5)';
const f1 = (v) => (+v).toFixed(1);

function shuffled(a) {
  const r = a.slice();
  for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; }
  return r;
}

/** The four choices of a row: [value, kind]; kind right | one | close | share. */
function choicesOf(i) {
  const r = ROWS[i], s = SUM[i], big = Math.max(...r), avg = s / 3;
  const out = [[s, 'right'], [big, 'one'], [s + 1, 'close']];
  out.push(Number.isInteger(avg) && !out.some(([v]) => v === avg) ? [avg, 'share'] : [s - 1, 'close']);
  return shuffled(out);
}

const WHY = {
  one: 'That is only one friend\'s kg. The market adds all three friends.',
  close: 'Close, but not quite. Add the three friends\' kg again.',
  share: 'That is about one friend\'s share. The market adds all three friends.',
};

const CSS = `
.ms { background: var(--sim-bg-deep); border-radius: var(--sim-radius-md, 12px); }
.ms .ms-body { flex: 1 1 auto; min-height: 0; display: grid; grid-template-columns: 470px 290px minmax(0, 1fr); gap: 22px; align-items: center; }
.ms .ms-tab { display: grid; grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1.25fr); gap: 6px; align-items: stretch; }
.ms .ms-h { font: 800 16px/1.15 var(--sim-font); color: var(--sim-label-muted); text-align: center; align-self: end; padding-bottom: 2px; }
.ms .ms-h--m { color: var(--sim-ink-on-5, var(--sim-bg-deep)); background: ${MKT}; border-radius: 10px; padding: 6px 2px; }
.ms .ms-c { display: flex; align-items: center; justify-content: center; min-height: 58px; border-radius: 12px;
  font: 800 23px/1 var(--sim-font); color: var(--sim-label); background: var(--sim-bg-surface); border: 2px solid var(--sim-stroke); }
.ms .ms-c--p { background: transparent; border-color: transparent; }
.ms .ms-c--dim { opacity: 0.45; }
.ms .ms-slot { min-height: 58px; font: 800 23px/1 var(--sim-font); color: var(--sim-label-muted);
  border: 3px dashed color-mix(in oklab, ${MKT} 70%, var(--sim-stroke)); background: color-mix(in oklab, ${MKT} 10%, var(--sim-bg-surface)); }
.ms .ms-slot[data-s="sel"] { border-style: solid; border-color: var(--sim-accent); color: var(--sim-accent);
  background: color-mix(in oklab, var(--sim-accent) 16%, var(--sim-bg-surface)); }
.ms .ms-slot[data-s="good"] { border-style: solid; border-color: ${MKT}; background: ${MKT}; color: var(--sim-ink-on-5, var(--sim-bg-deep)); }
.ms .ms-fig svg { display: block; width: 100%; height: auto; }
.ms .ms-side { display: flex; flex-direction: column; gap: 12px; align-items: stretch; }
.ms .ms-ask { margin: 0; font: 800 19px/1.3 var(--sim-font); color: var(--sim-label); }
.ms .ms-ask b { color: var(--sim-accent); }
.ms .ms-opts { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
.ms .ms-opt { min-height: 54px; font: 800 23px/1 var(--sim-font-display, var(--sim-font)); color: ${MKT}; }
.ms .ms-opt[data-s="bad"] { border-color: var(--sim-bad); color: var(--sim-bad); text-decoration: line-through; opacity: 0.7; }
.ms .ms-say { margin: 0; min-height: 50px; font: 700 17px/1.4 var(--sim-font); }
.ms .ms-say[data-tone="good"] { color: var(--sim-good); }
.ms .ms-say[data-tone="bad"] { color: var(--sim-bad); }
.ms .ms-pop { animation: ms-pop 0.4s cubic-bezier(.3,1.5,.5,1) both; }
@keyframes ms-pop { 0% { transform: scale(0.6); opacity: 0; } 100% { transform: none; opacity: 1; } }
@media (prefers-reduced-motion: reduce) { .ms .ms-pop { animation: none; } }
.sim-dom-root--portrait .ms .ms-body { display: flex; flex-direction: column; gap: 10px; align-items: stretch; }
.sim-dom-root--portrait .ms .ms-tab { gap: 4px; }
.sim-dom-root--portrait .ms .ms-h { font-size: 14px; }
.sim-dom-root--portrait .ms .ms-slot { font-size: 17px; white-space: nowrap; padding: 0 2px; }
.sim-dom-root--portrait .ms .ms-c, .sim-dom-root--portrait .ms .ms-slot { min-height: 48px; font-size: 18px; border-radius: 10px; }
.sim-dom-root--portrait .ms .ms-ask { font-size: 17px; text-align: center; }
.sim-dom-root--portrait .ms .ms-opt { min-height: 50px; font-size: 21px; }
.sim-dom-root--portrait .ms .ms-say { font-size: 15px; min-height: 0; text-align: center; }
.sim-dom-root--portrait .ms .ms-side { gap: 8px; }
`;

export class MarketSumGameScene extends GameBoard {
  static HEIGHT = 330;
  static CONTINUOUS = false;
  static OBJECTIVE = { prompt: { en: 'Fill in the market demand at each of the three prices. Win when all three totals are right and the market demand curve is drawn.' } };
  static ARIA_LABEL = 'A made-up guava market. Three friends buy guavas at three prices: at 80 rupees a kg they buy 1, 1 and 2 kg; at 50 rupees 2, 3 and 3 kg; at 20 rupees 4, 5 and 6 kg. Fill the market column with each row\'s total; when all three are right, the market demand curve is drawn.';

  async setup() {
    this.reset();
    this.figP = null;
    await super.setup();
    mountGame(this, {
      css: CSS, check: false,
      onResize: () => { if (this.isPortrait() !== this.figP) this.draw(); },
      html: `<div class="gm ms"><div class="gm-head"><h2>Fill the market column</h2><p class="sub">Guavas, a made-up example. Add each row: what the three friends buy at that price.</p></div>
        <div class="ms-body"><div class="ms-tab" role="table" aria-label="guava demand schedule"></div><div class="ms-fig"></div>
          <div class="ms-side"><p class="ms-ask"></p><div class="ms-opts"></div><p class="ms-say" aria-live="polite"></p></div></div></div>`,
    });
    // One Quill only: mini-game@1 draws him in its verdict strip, so the frame's corner Quill goes (never on the board).
    this.quill?.destroy?.(); this.quill = null; this._scaleWrap?.classList.remove('gm-quill');
    this.draw();
  }

  reset() {
    this.done = [false, false, false];
    this.opts = [0, 1, 2].map(choicesOf);
    this.bad = [new Set(), new Set(), new Set()];
    this.row = 0;
    this.won = false;
    this.fresh = -1;
  }

  isPortrait() { return !!(this.root?.closest?.('.sim-dom-root--portrait') || this.root?.classList?.contains('sim-dom-root--portrait')); }

  draw() {
    const q = (s) => this.root?.querySelector(s);
    if (!q('.ms-tab')) return;
    this.figP = this.isPortrait();
    const P = this.figP;
    // the schedule
    let t = `<div class="ms-h" role="columnheader">${P ? 'price' : 'price per kg'}</div>`
      + [1, 2, 3].map((n) => `<div class="ms-h" role="columnheader">Friend ${n}</div>`).join('')
      + '<div class="ms-h ms-h--m" role="columnheader">market</div>';
    ROWS.forEach((r, i) => {
      const dim = !this.won && !this.done[i] && i !== this.row;
      t += `<div class="ms-c ms-c--p${dim ? ' ms-c--dim' : ''}" role="cell">${RS}${PRICES[i]}</div>`;
      t += r.map((kg) => `<div class="ms-c${dim ? ' ms-c--dim' : ''}" role="cell">${kg} kg</div>`).join('');
      const s = this.done[i] ? 'good' : (!this.won && i === this.row ? 'sel' : '');
      const lab = this.done[i] ? `${SUM[i]} kg` : '? kg';
      t += `<button type="button" class="tap btn ms-c ms-slot${this.fresh === i ? ' ms-pop' : ''}" data-row="${i}"${s ? ` data-s="${s}"` : ''}${this.done[i] ? ' aria-disabled="true"' : ''} aria-label="market at ${PRICES[i]} rupees: ${this.done[i] ? `${SUM[i]} kg` : 'not filled'}">${lab}</button>`;
    });
    const tab = q('.ms-tab');
    tab.innerHTML = t;
    tab.querySelectorAll('.ms-slot').forEach((b) => onTap(b, () => this.tapRow(Number(b.dataset.row))));
    q('.ms-fig').innerHTML = this.figure(P);
    // the choices for the picked row
    const ask = q('.ms-ask'), opts = q('.ms-opts');
    if (this.won) { ask.innerHTML = 'All three totals are right.'; opts.innerHTML = ''; }
    else {
      ask.innerHTML = `At <b>${RS}${PRICES[this.row]}</b>, how many kg does the market buy?`;
      opts.innerHTML = this.opts[this.row].map(([v]) => {
        const b = this.bad[this.row].has(v);
        return `<button type="button" class="tap btn ms-opt" data-v="${v}"${b ? ' data-s="bad" aria-disabled="true"' : ''}>${v} kg</button>`;
      }).join('');
      opts.querySelectorAll('.ms-opt').forEach((b) => onTap(b, () => this.pick(Number(b.dataset.v))));
    }
    this.fresh = -1;
    this.relayout?.();
  }

  /** The market graph: price up (Rs 20, 50, 80), kg along (4, 8, 15); a point per right row; the curve on a win. */
  figure(P) {
    const W = P ? 312 : 290, H = P ? 184 : 236, L = P ? 62 : 64, R = W - 14, T = 12, B = H - 46;
    const X = (kg) => L + (kg / 17) * (R - L), Y = (p) => B - (p / 100) * (B - T);
    const fs = P ? 14 : 16;
    let s = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="market demand graph">`;
    s += `<rect x="${L}" y="${T}" width="${R - L}" height="${B - T}" style="fill:var(--sim-bg-surface)"/>`;
    PRICES.forEach((p, i) => {
      s += `<line x1="${L}" y1="${f1(Y(p))}" x2="${R}" y2="${f1(Y(p))}" style="stroke:var(--sim-stroke);stroke-width:1.4;opacity:0.5"/>`;
      s += `<text x="${L - 6}" y="${f1(Y(p) + 5)}" text-anchor="end" style="fill:var(--sim-label-muted);font:800 ${fs}px var(--sim-font)">${RS}${p}</text>`;
      if (this.done[i]) s += `<text x="${f1(X(SUM[i]))}" y="${B + fs + 3}" text-anchor="middle" style="fill:var(--sim-label-muted);font:800 ${fs}px var(--sim-font)">${SUM[i]}</text>`;
    });
    s += `<text x="${f1((L + R) / 2)}" y="${H - 5}" text-anchor="middle" style="fill:var(--sim-label);font:800 ${fs}px var(--sim-font)">quantity (kg)</text>`;
    s += `<text transform="translate(${P ? 13 : 14} ${f1((T + B) / 2)}) rotate(-90)" text-anchor="middle" style="fill:var(--sim-label);font:800 ${fs}px var(--sim-font)">price (${RS} per kg)</text>`;
    s += `<path d="M${L} ${T - 4}V${B}H${R + 4}" style="fill:none;stroke:var(--sim-label);stroke-width:3;stroke-linecap:round;stroke-linejoin:round"/>`;
    if (this.won) {
      const pts = [0, 1, 2].map((i) => [X(SUM[i]), Y(PRICES[i])]);
      let len = 0;
      for (let i = 1; i < 3; i++) len += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
      s += `<path d="M${pts.map((p) => `${f1(p[0])} ${f1(p[1])}`).join('L')}" style="fill:none;stroke:${MKT};stroke-width:5;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:${f1(len)};stroke-dashoffset:${f1(len)};animation:ms-draw 0.8s ease forwards"/>`;
      s += `<style>@keyframes ms-draw { to { stroke-dashoffset: 0; } } @media (prefers-reduced-motion: reduce) { .ms path { animation: none !important; stroke-dashoffset: 0 !important; } }</style>`;
      s += `<text x="${f1(R - 6)}" y="${f1(T + fs + 6)}" text-anchor="end" style="fill:${MKT};font:800 ${fs + 2}px var(--sim-font)">market demand</text>`;
    }
    PRICES.forEach((p, i) => {
      if (!this.done[i]) return;
      const x = X(SUM[i]), y = Y(p);
      s += `<path d="M${f1(x)} ${f1(y)}V${B}" style="fill:none;stroke:var(--sim-label-muted);stroke-width:2;stroke-dasharray:5 5"/>`;
      const pop = this.fresh === i ? 'transform-box:fill-box;transform-origin:center;animation:ms-dot 0.4s cubic-bezier(.3,1.5,.5,1) both;' : '';
      s += `<circle cx="${f1(x)}" cy="${f1(y)}" r="${P ? 8 : 9}" style="${pop}fill:${MKT};stroke:var(--sim-bg-surface);stroke-width:3"/>`;
    });
    s += '<style>@keyframes ms-dot { 0% { transform: scale(0.4); opacity: 0; } 100% { transform: none; opacity: 1; } }</style></svg>';
    return s;
  }

  say(text, tone) {
    const el = this.root?.querySelector('.ms-say');
    if (!el) return;
    el.textContent = text;
    if (tone) el.dataset.tone = tone; else delete el.dataset.tone;
  }

  tapRow(i) {
    if (this.won || this.done[i]) return;
    this.row = i;
    this.draw();
    this.say('');
  }

  pick(v) {
    if (this.won) return;
    const i = this.row, kind = this.opts[i].find(([x]) => x === v)?.[1];
    if (!kind || this.bad[i].has(v)) return;
    if (kind === 'right') {
      this.done[i] = true;
      this.fresh = i;
      const r = ROWS[i];
      if (this.done.every(Boolean)) {
        this.won = true;
        this.draw();
        this.say('The market demand curve slopes down: a lower price, more kg.', 'good');
        finishGame(this);
        return;
      }
      this.row = this.done.findIndex((d) => !d);
      this.draw();
      this.say(`Right: at ${RS}${PRICES[i]}, ${r[0]} + ${r[1]} + ${r[2]} = ${SUM[i]} kg.`, 'good');
      return;
    }
    this.bad[i].add(v);
    this.draw();
    this.say(WHY[kind], 'bad');
  }

  checkObjective() { return this.won ? { ok: true } : null; }

  resetChallenge() {
    super.resetChallenge?.();
    this.reset();
    this.say('');
    this.draw();
  }

  testState() { return { won: this.won, row: this.row, done: this.done.slice(), opts: this.opts.map((o) => o.map(([v, k]) => `${v}:${k}`)) }; }
}
