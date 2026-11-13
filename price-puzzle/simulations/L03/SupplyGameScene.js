// SupplyGameScene - L03 game (blk-l03-s07): plot the market supply of a made-up guava market.
//   The board: a 3-row supply schedule (price per kg | Seller 1 | Seller 2 | Seller 3 | market) with "? kg" in
//   every market cell, and a graph beside it (price up: Rs 20, 50, 80; kg along 0..16). The picked row's price
//   line lights on the graph with eight hollow tap points (2, 4, ... 16 kg). Add the row, then tap the point.
//   Right: the market cell fills, a series-7 point stays on the graph. Wrong: that tap point is struck out and
//   one short reason shows (one seller alone / too few / too many); it never gives the total.
//   Win (checkObjective, real): all three points right; the market supply curve SmSm' draws through (4, Rs 20),
//   (8, Rs 50), (12, Rs 80), sloping up. finishGame -> the host's verdict.
// Numbers (STORYBOARD L03 s07, made-up, said on screen): Rs 20: 1, 2, 1 -> 4 kg; Rs 50: 2, 3, 3 -> 8 kg;
// Rs 80: 3, 5, 4 -> 12 kg. Market supply colour series-7. Colours are tokens only. ASCII only.
import { GameBoard, mountGame, finishGame, onTap } from 'simulations/base/kit/GameFrame.js';

const RS = '\u20B9';
const PRICES = [80, 50, 20];
const ROWS = [[3, 5, 4], [2, 3, 3], [1, 2, 1]];
const SUM = ROWS.map((r) => r[0] + r[1] + r[2]);
const TAPS = [2, 4, 6, 8, 10, 12, 14, 16];
const SUP = 'var(--sim-series-7)';
const SUP_INK = 'var(--sim-ink-on-7, var(--sim-bg-deep))';
const f1 = (v) => (+v).toFixed(1);

/** Why a tap of kg on row i is wrong (never names the total). */
function whyWrong(i, kg) {
  const r = ROWS[i], hit = r.map((v, n) => (v === kg ? n : -1)).filter((n) => n >= 0);
  if (hit.length === 1) return `That is Seller ${hit[0] + 1} alone. Add all three sellers.`;
  if (kg < SUM[i]) return `Too few kg. Add what all three sellers offer at ${RS}${PRICES[i]}.`;
  return `Too many kg. Add the three amounts in the ${RS}${PRICES[i]} row again.`;
}

const CSS = `
.sg { background: var(--sim-bg-deep); border-radius: var(--sim-radius-md, 12px); }
.sg .sg-body { flex: 1 1 auto; min-height: 0; display: grid; grid-template-columns: 430px minmax(0, 1fr); gap: 24px; align-items: center; }
.sg .sg-left { display: flex; flex-direction: column; gap: 12px; }
.sg .sg-tab { display: grid; grid-template-columns: minmax(0, 1.05fr) minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1.2fr); gap: 6px; align-items: stretch; }
.sg .sg-h { font: 800 16px/1.15 var(--sim-font); color: var(--sim-label-muted); text-align: center; align-self: end; padding-bottom: 2px; }
.sg .sg-h--m { color: ${SUP_INK}; background: ${SUP}; border-radius: 10px; padding: 6px 2px; }
.sg .sg-c { display: flex; align-items: center; justify-content: center; min-height: 44px; border-radius: 12px;
  font: 800 22px/1 var(--sim-font); color: var(--sim-label); background: var(--sim-bg-surface); border: 2px solid var(--sim-stroke); }
.sg .sg-c--p { background: transparent; border-color: transparent; }
.sg .sg-c--dim { opacity: 0.42; }
.sg .sg-c--on { border-color: var(--sim-accent); }
.sg .sg-slot { min-height: 44px; font: 800 22px/1 var(--sim-font); color: var(--sim-label-muted);
  border: 3px dashed color-mix(in oklab, ${SUP} 70%, var(--sim-stroke)); background: color-mix(in oklab, ${SUP} 10%, var(--sim-bg-surface)); }
.sg .sg-slot[data-s="sel"] { border-style: solid; border-color: var(--sim-accent); color: var(--sim-accent);
  background: color-mix(in oklab, var(--sim-accent) 16%, var(--sim-bg-surface)); }
.sg .sg-slot[data-s="good"] { border-style: solid; border-color: ${SUP}; background: ${SUP}; color: ${SUP_INK}; }
.sg .sg-say { margin: 0; min-height: 44px; font: 700 18px/1.35 var(--sim-font); color: var(--sim-label); }
.sg .sg-say b { color: var(--sim-accent); }
.sg .sg-say[data-tone="good"] { color: var(--sim-good); }
.sg .sg-say[data-tone="bad"] { color: var(--sim-bad); }
.sg .sg-fig { position: relative; width: 100%; }
.sg .sg-fig svg { display: block; width: 100%; height: auto; }
.sg .sg-pt { position: absolute; transform: translate(-50%, -50%); width: 46px; height: 46px; min-height: 0; padding: 0;
  border-radius: 50%; background: transparent; border: 0; box-shadow: none; cursor: pointer; }
.sg .sg-pt:hover { background: color-mix(in oklab, var(--sim-accent) 14%, transparent); }
.sg .sg-pt:active { transform: translate(-50%, calc(-50% + 2px)); box-shadow: none; }
.sg .sg-pt:focus-visible { outline: 3px solid var(--sim-accent); outline-offset: 0; }
.sg .sg-pop { animation: sg-pop 0.4s cubic-bezier(.3,1.5,.5,1) both; }
@keyframes sg-pop { 0% { transform: scale(0.6); opacity: 0; } 100% { transform: none; opacity: 1; } }
@media (prefers-reduced-motion: reduce) { .sg .sg-pop { animation: none; } }
.sim-dom-root--portrait .sg .sg-body { display: flex; flex-direction: column; gap: 8px; align-items: stretch; }
.sim-dom-root--portrait .sg .sg-left { gap: 8px; }
.sim-dom-root--portrait .sg .sg-tab { gap: 4px; }
.sim-dom-root--portrait .sg .sg-h { font-size: 14px; }
.sim-dom-root--portrait .sg .sg-c, .sim-dom-root--portrait .sg .sg-slot { min-height: 44px; font-size: 18px; border-radius: 10px; white-space: nowrap; padding: 0 2px; }
.sim-dom-root--portrait .sg .sg-say { font-size: 15px; min-height: 40px; text-align: center; }
.sg .sg-lane { position: absolute; transform: translateY(-50%); height: 48px; min-height: 0; padding: 0; border-radius: 24px;
  background: transparent; border: 0; box-shadow: none; cursor: pointer; }
.sg .sg-lane:active { transform: translateY(-50%); box-shadow: none; }
.sg .sg-lane:focus-visible { outline: 3px solid var(--sim-accent); outline-offset: 2px; }
`;

export class SupplyGameScene extends GameBoard {
  static HEIGHT = 330;
  static CONTINUOUS = false;
  static OBJECTIVE = { prompt: { en: 'Plot the market supply of guavas at each of the three prices. Win when all three points are right and the market supply curve is drawn.' } };
  static ARIA_LABEL = 'A made-up guava market with three sellers. At 80 rupees a kg they offer 3, 5 and 4 kg; at 50 rupees 2, 3 and 3 kg; at 20 rupees 1, 2 and 1 kg. Add each row and tap that many kg on the graph at that price; when all three points are right, the market supply curve is drawn, sloping up.';

  async setup() {
    this.reset();
    this.figP = null;
    await super.setup();
    mountGame(this, {
      css: CSS, check: false,
      onResize: () => { if (this.isPortrait() !== this.figP) this.draw(); },
      html: `<div class="gm sg"><div class="gm-head"><h2>Plot the market supply</h2><p class="sub">Guavas, a made-up example. Add each row, then tap that point on the graph.</p></div>
        <div class="sg-body"><div class="sg-left"><div class="sg-tab" role="table" aria-label="guava supply schedule"></div><p class="sg-say" aria-live="polite"></p></div><div class="sg-fig"></div></div></div>`,
    });
    // One Quill only: mini-game@1 draws him in its verdict strip, so the frame's corner Quill goes (never on the board).
    this.quill?.destroy?.(); this.quill = null; this._scaleWrap?.classList.remove('gm-quill');
    this.draw();
    this.hint();
  }

  reset() {
    this.done = [false, false, false];
    this.bad = [new Set(), new Set(), new Set()];
    this.row = 0;
    this.cur = 8;
    this.kbd = false;
    this.won = false;
    this.fresh = -1;
  }

  isPortrait() { return !!(this.root?.closest?.('.sim-dom-root--portrait') || this.root?.classList?.contains('sim-dom-root--portrait')); }

  draw() {
    const q = (s) => this.root?.querySelector(s);
    if (!q('.sg-tab')) return;
    this.figP = this.isPortrait();
    const P = this.figP;
    let t = `<div class="sg-h" role="columnheader">price</div>`
      + [1, 2, 3].map((n) => `<div class="sg-h" role="columnheader">Seller ${n}</div>`).join('')
      + '<div class="sg-h sg-h--m" role="columnheader">market</div>';
    ROWS.forEach((r, i) => {
      const on = !this.won && i === this.row;
      const dim = !this.won && !this.done[i] && !on;
      t += `<div class="sg-c sg-c--p${dim ? ' sg-c--dim' : ''}" role="cell">${RS}${PRICES[i]}</div>`;
      t += r.map((kg) => `<div class="sg-c${dim ? ' sg-c--dim' : ''}${on ? ' sg-c--on' : ''}" role="cell">${kg} kg</div>`).join('');
      const s = this.done[i] ? 'good' : on ? 'sel' : '';
      t += `<button type="button" class="tap btn sg-c sg-slot${this.fresh === i ? ' sg-pop' : ''}" data-row="${i}"${s ? ` data-s="${s}"` : ''}${this.done[i] ? ' aria-disabled="true"' : ''} aria-label="market at ${PRICES[i]} rupees: ${this.done[i] ? `${SUM[i]} kg` : 'not plotted yet'}">${this.done[i] ? `${SUM[i]} kg` : '? kg'}</button>`;
    });
    const tab = q('.sg-tab');
    tab.innerHTML = t;
    tab.querySelectorAll('.sg-slot').forEach((b) => onTap(b, () => this.tapRow(Number(b.dataset.row))));
    const fig = q('.sg-fig');
    fig.innerHTML = this.figure(P);
    fig.querySelectorAll('.sg-pt').forEach((b) => onTap(b, () => this.tapPoint(Number(b.dataset.kg))));
    // Phone: the tap points sit about 30 px apart, too close for one button each, so the whole price line is
    // one button; a tap snaps to the nearest point (2, 4, ... 16 kg). Keys: left / right move a ring, Enter plots.
    const lane = fig.querySelector('.sg-lane');
    if (lane) {
      lane.addEventListener('click', (e) => {
        const r = lane.getBoundingClientRect();
        if (!e.clientX && !e.clientY) { this.tapPoint(this.cur); return; }
        const t = Math.min(1, Math.max(0, (e.clientX - r.left) / (r.width || 1)));
        this.tapPoint(this.snap(t));
      });
      lane.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
          e.preventDefault();
          this.cur = Math.min(16, Math.max(2, this.cur + (e.key === 'ArrowRight' ? 2 : -2)));
          this.kbd = true; this.draw(); this.root?.querySelector('.sg-lane')?.focus();
        } else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this.tapPoint(this.cur); }
      });
    }
    this.fresh = -1;
    this.relayout?.();
  }

  /** The graph in its own viewBox: price up (Rs 20, 50, 80), kg along 0..16; the picked price line is the play line. */
  figure(P) {
    const W = P ? 312 : 600, H = P ? 250 : 222, L = P ? 62 : 104, R = W - (P ? 14 : 22), T = P ? 12 : 10, B = H - (P ? 50 : 50);
    const X = (kg) => L + (kg / 16.8) * (R - L), Y = (p) => B - (p / 100) * (B - T);
    const fs = P ? 14 : 18;
    let s = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="market supply graph">`;
    s += `<rect x="${L}" y="${T}" width="${R - L}" height="${B - T}" style="fill:var(--sim-bg-surface)"/>`;
    for (let k = 2; k <= 16; k += 2) s += `<line x1="${f1(X(k))}" y1="${T}" x2="${f1(X(k))}" y2="${B}" style="stroke:var(--sim-stroke);stroke-width:1.2;opacity:${k % 4 ? 0.25 : 0.45}"/>`;
    PRICES.forEach((p, i) => {
      const on = !this.won && i === this.row;
      s += `<line x1="${L}" y1="${f1(Y(p))}" x2="${R}" y2="${f1(Y(p))}" style="stroke:${on ? 'var(--sim-accent)' : 'var(--sim-stroke)'};stroke-width:${on ? 3 : 1.6};opacity:${on ? 0.9 : 0.5}"/>`;
      s += `<text x="${L - 8}" y="${f1(Y(p) + fs * 0.36)}" text-anchor="end" style="fill:${on ? 'var(--sim-accent)' : 'var(--sim-label)'};font:800 ${fs + 2}px var(--sim-font)">${RS}${p}</text>`;
    });
    for (let k = 0; k <= 16; k += 4) s += `<text x="${f1(X(k))}" y="${B + fs + (P ? 4 : 2)}" text-anchor="middle" style="fill:var(--sim-label-muted);font:800 ${P ? fs : fs - 2}px var(--sim-font)">${k}</text>`;
    s += `<text x="${f1((L + R) / 2)}" y="${H - (P ? 6 : 2)}" text-anchor="middle" style="fill:var(--sim-label);font:800 ${P ? fs + 1 : fs - 1}px var(--sim-font)">quantity (kg)</text>`;
    s += `<text transform="translate(${P ? 12 : 22} ${f1((T + B) / 2)}) rotate(-90)" text-anchor="middle" style="fill:var(--sim-label);font:800 ${fs + 1}px var(--sim-font)">price (${RS} per kg)</text>`;
    s += `<path d="M${L} ${T - 4}V${B}H${R + 4}" style="fill:none;stroke:var(--sim-label);stroke-width:3.5;stroke-linecap:round;stroke-linejoin:round"/>`;
    if (this.won) {
      const [x0, y0, x1, y1] = [X(2.4), Y(8), X(13.6), Y(92)];
      const len = Math.hypot(x1 - x0, y1 - y0);
      s += `<path d="M${f1(x0)} ${f1(y0)}L${f1(x1)} ${f1(y1)}" style="fill:none;stroke:${SUP};stroke-width:${P ? 5 : 6};stroke-linecap:round;stroke-dasharray:${f1(len)};stroke-dashoffset:${f1(len)};animation:sg-draw 0.8s ease forwards"/>`;
      s += `<style>@keyframes sg-draw { to { stroke-dashoffset: 0; } } @media (prefers-reduced-motion: reduce) { .sg path { animation: none !important; stroke-dashoffset: 0 !important; } }</style>`;
      const lab = (x, y, a, prime) => `<text x="${f1(x)}" y="${f1(y)}" text-anchor="${a}" style="fill:${SUP};font:800 ${fs + 8}px var(--sim-font)">S<tspan style="font-size:${fs}px" dy="5">m</tspan>${prime ? '<tspan dy="-5">\'</tspan>' : ''}</text>`;
      s += lab(x0 - 8, y0 + 4, 'end', false) + lab(x1 + 8, y1 + 8, 'start', true);
      s += `<text x="${f1(R - 8)}" y="${f1(B - 12)}" text-anchor="end" style="fill:${SUP};font:800 ${fs + 2}px var(--sim-font)">market supply</text>`;
    }
    // the play line: hollow tap points; a struck point stays struck for this row
    this.laneA = X(1); this.laneB = X(17); this.laneX = X;
    if (!this.won) {
      const y = Y(PRICES[this.row]);
      if (this.kbd) s += `<circle cx="${f1(X(this.cur))}" cy="${f1(y)}" r="${P ? 13 : 15}" style="fill:none;stroke:var(--sim-label);stroke-width:2.5"/>`;
      for (const kg of TAPS) {
        const x = X(kg), bad = this.bad[this.row].has(kg);
        s += bad
          ? `<path d="M${f1(x - 7)} ${f1(y - 7)}L${f1(x + 7)} ${f1(y + 7)}M${f1(x + 7)} ${f1(y - 7)}L${f1(x - 7)} ${f1(y + 7)}" style="fill:none;stroke:var(--sim-bad);stroke-width:4;stroke-linecap:round"/>`
          : `<circle cx="${f1(x)}" cy="${f1(y)}" r="${P ? 6.5 : 8}" style="fill:var(--sim-bg-surface);stroke:var(--sim-accent);stroke-width:3"/>`;
      }
    }
    PRICES.forEach((p, i) => {
      if (!this.done[i]) return;
      const x = X(SUM[i]), y = Y(p);
      s += `<path d="M${f1(x)} ${f1(y)}V${B}" style="fill:none;stroke:var(--sim-label-muted);stroke-width:2;stroke-dasharray:5 5"/>`;
      const pop = this.fresh === i ? 'transform-box:fill-box;transform-origin:center;animation:sg-dot 0.4s cubic-bezier(.3,1.5,.5,1) both;' : '';
      s += `<circle cx="${f1(x)}" cy="${f1(y)}" r="${P ? 9 : 11}" style="${pop}fill:${SUP};stroke:var(--sim-bg-surface);stroke-width:3"/>`;
    });
    s += '<style>@keyframes sg-dot { 0% { transform: scale(0.4); opacity: 0; } 100% { transform: none; opacity: 1; } }</style></svg>';
    if (!this.won) {
      const y = Y(PRICES[this.row]);
      if (P) {
        const a = this.laneA, b = this.laneB;
        s += `<button type="button" class="tap btn sg-lane" aria-label="the ${PRICES[this.row]} rupee price line: tap the kg, or use left and right arrows and Enter" style="left:${f1(a / W * 100)}%;width:${f1((b - a) / W * 100)}%;top:${f1(y / H * 100)}%"></button>`;
      }
      for (const kg of P ? [] : TAPS) {
        if (this.bad[this.row].has(kg)) continue;
        s += `<button type="button" class="tap btn sg-pt" data-kg="${kg}" aria-label="${kg} kg at ${PRICES[this.row]} rupees" style="left:${f1(X(kg) / W * 100)}%;top:${f1(y / H * 100)}%"></button>`;
      }
    }
    return s;
  }

  /** Lane fraction 0..1 (X(1) .. X(17)) -> the nearest tap point kg. */
  snap(t) { return Math.min(16, Math.max(2, Math.round((1 + t * 16) / 2) * 2)); }

  say(html, tone) {
    const el = this.root?.querySelector('.sg-say');
    if (!el) return;
    el.innerHTML = html;
    if (tone) el.dataset.tone = tone; else delete el.dataset.tone;
  }

  hint() { if (!this.won) this.say(`Add the <b>${RS}${PRICES[this.row]}</b> row. Tap its point on the graph.`); }

  tapRow(i) {
    if (this.won || this.done[i]) return;
    this.row = i;
    this.draw();
    this.hint();
  }

  tapPoint(kg) {
    if (this.won) return;
    const i = this.row;
    if (this.bad[i].has(kg)) return;
    if (kg === SUM[i]) {
      this.done[i] = true;
      this.fresh = i;
      const r = ROWS[i];
      if (this.done.every(Boolean)) {
        this.won = true;
        this.draw();
        this.say('The market supply curve slopes up: a higher price, more kg.', 'good');
        finishGame(this);
        return;
      }
      this.row = this.done.findIndex((d) => !d);
      this.draw();
      this.say(`Right: at ${RS}${PRICES[i]}, ${r[0]} + ${r[1]} + ${r[2]} = ${SUM[i]} kg. Now the <b>${RS}${PRICES[this.row]}</b> row.`, 'good');
      return;
    }
    this.bad[i].add(kg);
    this.draw();
    this.say(whyWrong(i, kg), 'bad');
  }

  checkObjective() { return this.won ? { ok: true } : null; }

  resetChallenge() {
    super.resetChallenge?.();
    this.reset();
    this.draw();
    this.hint();
  }

  testState() { return { won: this.won, row: this.row, done: this.done.slice(), bad: this.bad.map((b) => [...b]) }; }
}
