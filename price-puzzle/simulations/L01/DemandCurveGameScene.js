// DemandCurveGameScene - L01 game (blk-l01-s06): plot Srivalli's demand curve from her schedule.
//   The board: an empty graph, price (Rs per kg) up, quantity (kg) along 0..4, with three price rows (lanes) at
//   Rs 150, Rs 100 and Rs 50, and three kg chips (1 kg, 2 kg, 3 kg) in a random order (Math.random, no crypto).
//   Tap a chip, then tap a price row. Right: the chip lands as a point at its kg on that row, with dashed guides.
//   Wrong: the chip goes back and one short reason shows (it says which way to go, never the whole table).
//   Win (checkObjective, real): all three points right; the game joins them into DD' and says
//   "Her demand curve slopes down." finishGame -> the host's verdict.
// Table 9.1 numbers only: Rs 150 -> 1 kg, Rs 100 -> 2 kg, Rs 50 -> 3 kg. Colours are tokens only. ASCII only.
import { GameBoard, mountGame, finishGame, onTap } from 'simulations/base/kit/GameFrame.js';

const RS = '\u20B9';
const PRICES = [150, 100, 50];
const KG_AT = { 150: 1, 100: 2, 50: 3 };
const NAME_AT = { 150: 'A', 100: 'B', 50: 'C' };
const f1 = (v) => (+v).toFixed(1);
const SER = 'var(--sim-series-1)';

function shuffled(a) {
  const r = a.slice();
  for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; }
  return r;
}

const CSS = `
.dg { background: var(--sim-bg-deep); border-radius: var(--sim-radius-md, 12px); }
.dg .dg-body { flex: 1 1 auto; min-height: 0; display: grid; grid-template-columns: 600px minmax(0, 1fr); gap: 26px; align-items: center; }
.dg .dg-fig { position: relative; width: 100%; }
.dg .dg-fig svg { display: block; width: 100%; height: auto; }
.dg .dg-lane { position: absolute; transform: translateY(-50%); min-height: 44px; padding: 0; border-radius: 22px;
  background: transparent; border: 3px dashed transparent; box-shadow: none; }
.dg .dg-lane:active { transform: translateY(calc(-50% + 2px)); box-shadow: none; }
.dg .dg-fig[data-arm="1"] .dg-lane { border-color: var(--sim-accent); background: color-mix(in oklab, var(--sim-accent) 8%, transparent); }
.dg .dg-lane[data-s="bad"] { border-color: var(--sim-bad); border-style: solid; background: color-mix(in oklab, var(--sim-bad) 12%, transparent); }
.dg .dg-side { display: flex; flex-direction: column; gap: 14px; align-items: stretch; }
.dg .dg-ask { margin: 0; font: 800 21px/1.3 var(--sim-font); color: var(--sim-label); }
.dg .dg-ask b { color: var(--sim-accent); }
.dg .dg-chips { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }
.dg .dg-chip { min-height: 58px; font: 800 24px/1 var(--sim-font-display, var(--sim-font)); color: var(--sim-series-1); }
.dg .dg-chip[data-s="sel"] { border-color: var(--sim-accent); border-width: 3px; background: color-mix(in oklab, var(--sim-accent) 18%, var(--sim-bg-surface)); transform: translateY(-3px); }
.dg .dg-chip[data-s="good"] { border-color: var(--sim-good); background: var(--sim-good); color: var(--sim-ink-on-good, var(--sim-bg-deep)); opacity: 0.55; }
.dg .dg-say { margin: 0; min-height: 52px; font: 700 18px/1.4 var(--sim-font); }
.dg .dg-say[data-tone="good"] { color: var(--sim-good); }
.dg .dg-say[data-tone="bad"] { color: var(--sim-bad); }
.sim-dom-root--portrait .dg .dg-body { display: flex; flex-direction: column; gap: 10px; align-items: stretch; }
.sim-dom-root--portrait .dg .dg-ask { font-size: 18px; text-align: center; }
.sim-dom-root--portrait .dg .dg-chip { min-height: 52px; font-size: 22px; }
.sim-dom-root--portrait .dg .dg-say { font-size: 16px; min-height: 0; text-align: center; }
.sim-dom-root--portrait .dg .dg-side { gap: 10px; }
`;

export class DemandCurveGameScene extends GameBoard {
  static HEIGHT = 330;
  static CONTINUOUS = false;
  static OBJECTIVE = { prompt: { en: 'Put each quantity chip on the price at which Srivalli buys that much. Win when all three points sit on her demand curve.' } };
  static ARIA_LABEL = 'An empty graph: price in rupees per kg up the side, quantity in kg along the bottom, with price rows at 150, 100 and 50 rupees. Put the 1 kg, 2 kg and 3 kg chips on the price at which Srivalli buys that much.';

  async setup() {
    this.reset();
    this.figP = null;
    await super.setup();
    mountGame(this, {
      css: CSS, check: false,
      onResize: () => { if (this.isPortrait() !== this.figP) this.draw(); },
      html: `<div class="gm dg"><div class="gm-head"><h2>Plot Srivalli's demand curve</h2><p class="sub">Tap a kg chip, then the price row where she buys that much.</p></div>
        <div class="dg-body"><div class="dg-fig"></div>
          <div class="dg-side"><p class="dg-ask"></p><div class="dg-chips"></div><p class="dg-say" aria-live="polite"></p></div></div></div>`,
    });
    // One Quill only: mini-game@1 draws him in its verdict strip, so the frame's corner Quill goes (never on the board).
    this.quill?.destroy?.(); this.quill = null; this._scaleWrap?.classList.remove('gm-quill');
    this.draw();
  }

  reset() {
    this.order = shuffled([1, 2, 3]);
    this.placed = new Map();
    this.sel = null;
    this.badLane = null;
    this.won = false;
    this.fresh = -1;
  }

  isPortrait() { return !!(this.root?.closest?.('.sim-dom-root--portrait') || this.root?.classList?.contains('sim-dom-root--portrait')); }

  draw() {
    const q = (s) => this.root?.querySelector(s);
    if (!q('.dg-fig')) return;
    this.figP = this.isPortrait();
    q('.dg-ask').innerHTML = this.won ? 'All three points are right.' : this.sel ? `Now tap the price row for <b>${this.sel} kg</b>.` : 'Tap a kg chip.';
    const fig = q('.dg-fig');
    fig.innerHTML = this.figure(this.figP);
    fig.dataset.arm = this.sel && !this.won ? '1' : '0';
    fig.querySelectorAll('.dg-lane').forEach((b) => onTap(b, () => this.tapLane(Number(b.dataset.p))));
    const chips = q('.dg-chips');
    const done = new Set(this.placed.values());
    chips.innerHTML = this.order.map((kg) => {
      const s = done.has(kg) ? 'good' : this.sel === kg ? 'sel' : '';
      return `<button type="button" class="tap btn dg-chip" data-kg="${kg}"${s ? ` data-s="${s}"` : ''}${s === 'good' || this.won ? ' aria-disabled="true"' : ''} aria-pressed="${s === 'sel'}">${kg} kg</button>`;
    }).join('');
    chips.querySelectorAll('.dg-chip').forEach((b) => onTap(b, () => this.tapChip(Number(b.dataset.kg))));
    this.fresh = -1;
    this.relayout?.();
  }

  /** The graph in its own viewBox (portrait: narrower, so its text stays near 15 px on a phone). */
  figure(P) {
    const W = P ? 312 : 600, H = P ? 286 : 238, L = P ? 80 : 112, R = P ? 300 : 584, T = P ? 14 : 8, B = P ? 236 : 178;
    const X = (kg) => L + (kg / 4) * (R - L), Y = (p) => B - (p / 200) * (B - T);
    const fs = P ? 15 : 18;
    let s = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Srivalli's demand graph">`;
    s += `<rect x="${L}" y="${T}" width="${R - L}" height="${B - T}" style="fill:var(--sim-bg-surface)"/>`;
    for (let k = 1; k <= 4; k++) s += `<line x1="${f1(X(k))}" y1="${T}" x2="${f1(X(k))}" y2="${B}" style="stroke:var(--sim-stroke);stroke-width:1.3;opacity:0.45"/>`;
    // the three price rows: a soft band each, the price at the left
    for (const p of PRICES) {
      const filled = this.placed.has(p);
      s += `<line x1="${L}" y1="${f1(Y(p))}" x2="${R}" y2="${f1(Y(p))}" style="stroke:var(--sim-stroke);stroke-width:${filled ? 1.6 : 2.4};opacity:${filled ? 0.5 : 0.8}"/>`;
      s += `<text x="${L - 8}" y="${f1(Y(p) + 6)}" text-anchor="end" style="fill:var(--sim-label);font:800 ${fs + 2}px var(--sim-font)">${RS}${p}</text>`;
    }
    for (let k = 1; k <= 4; k++) s += `<text x="${f1(X(k))}" y="${B + fs + 4}" text-anchor="middle" style="fill:var(--sim-label-muted);font:800 ${fs}px var(--sim-font)">${k}</text>`;
    s += `<text x="${f1((L + R) / 2)}" y="${H - 6}" text-anchor="middle" style="fill:var(--sim-label);font:800 ${fs + 1}px var(--sim-font)">quantity (kg)</text>`;
    s += `<text transform="translate(${P ? 12 : 18} ${f1((T + B) / 2)}) rotate(-90)" text-anchor="middle" style="fill:var(--sim-label);font:800 ${fs + 1}px var(--sim-font)">price (${RS} per kg)</text>`;
    s += `<path d="M${L} ${T - 4}V${B}H${R + 4}" style="fill:none;stroke:var(--sim-label);stroke-width:3.5;stroke-linecap:round;stroke-linejoin:round"/>`;
    if (this.won) {
      const [x0, y0, x1, y1] = [X(0.5), Y(175), X(3.5), Y(25)];
      const len = Math.hypot(x1 - x0, y1 - y0);
      s += `<path d="M${f1(x0)} ${f1(y0)}L${f1(x1)} ${f1(y1)}" style="fill:none;stroke:${SER};stroke-width:6;stroke-linecap:round;stroke-dasharray:${f1(len)};stroke-dashoffset:${f1(len)};animation:dg-draw 0.7s ease forwards"/>`;
      s += `<style>@keyframes dg-draw { to { stroke-dashoffset: 0; } } @media (prefers-reduced-motion: reduce) { .dg path { animation: none !important; stroke-dashoffset: 0 !important; } }</style>`;
      s += `<text x="${f1(x0 - 8)}" y="${f1(y0 + 4)}" text-anchor="end" style="fill:${SER};font:800 ${fs + 8}px var(--sim-font)">D</text>`;
      s += `<text x="${f1(x1 + 8)}" y="${f1(y1 + 8)}" text-anchor="start" style="fill:${SER};font:800 ${fs + 8}px var(--sim-font)">D'</text>`;
    }
    for (const [p, kg] of this.placed) {
      const x = X(kg), y = Y(p);
      s += `<path d="M${f1(x)} ${f1(y)}V${B}" style="fill:none;stroke:var(--sim-label-muted);stroke-width:2;stroke-dasharray:6 6"/>`;
      const pop = this.fresh === p ? ' style="transform-box:fill-box;transform-origin:center;animation:dg-pop 0.4s cubic-bezier(.3,1.5,.5,1) both"' : '';
      s += `<g${pop}><circle cx="${f1(x)}" cy="${f1(y)}" r="${P ? 9 : 11}" style="fill:${SER};stroke:var(--sim-bg-surface);stroke-width:3"/>`
        + `<text x="${f1(x + 13)}" y="${f1(y - 11)}" style="fill:var(--sim-label);font:800 ${fs + 6}px var(--sim-font)">${NAME_AT[p]}</text></g>`;
    }
    s += '<style>@keyframes dg-pop { 0% { transform: scale(0.4); opacity: 0; } 100% { transform: none; opacity: 1; } }</style>';
    s += '</svg>';
    if (!this.won) {
      for (const p of PRICES) {
        if (this.placed.has(p)) continue;
        s += `<button type="button" class="tap btn dg-lane" data-p="${p}"${this.badLane === p ? ' data-s="bad"' : ''} aria-label="the price row ${p} rupees a kg" style="left:${f1((L + 4) / W * 100)}%;width:${f1((R - L - 8) / W * 100)}%;top:${f1(Y(p) / H * 100)}%"></button>`;
      }
    }
    return s;
  }

  say(text, tone) {
    const el = this.root?.querySelector('.dg-say');
    if (!el) return;
    el.textContent = text;
    if (tone) el.dataset.tone = tone; else delete el.dataset.tone;
  }

  tapChip(kg) {
    if (this.won || [...this.placed.values()].includes(kg)) return;
    this.sel = this.sel === kg ? null : kg;
    this.badLane = null;
    this.draw();
    this.say('');
  }

  tapLane(p) {
    if (this.won || this.placed.has(p)) return;
    if (!this.sel) { this.say('First tap a kg chip.', 'bad'); return; }
    const kg = this.sel, right = KG_AT[p];
    this.sel = null;
    if (kg === right) {
      this.placed.set(p, kg);
      this.badLane = null;
      this.fresh = p;
      if (this.placed.size === 3) {
        this.won = true;
        this.draw();
        this.say('Her demand curve slopes down.', 'good');
        finishGame(this);
        return;
      }
      this.draw();
      this.say(`Right: at ${RS}${p} she buys ${kg} kg.`, 'good');
      return;
    }
    this.badLane = p;
    this.draw();
    this.say(kg > right
      ? `At ${RS}${p} she buys less than ${kg} kg: a higher price, fewer kg.`
      : `At ${RS}${p} she buys more than ${kg} kg: a lower price, more kg.`, 'bad');
  }

  checkObjective() { return this.won ? { ok: true } : null; }

  resetChallenge() {
    super.resetChallenge?.();
    this.reset();
    this.say('');
    this.draw();
  }

  testState() { return { won: this.won, order: this.order, sel: this.sel, placed: Object.fromEntries(this.placed), badLane: this.badLane }; }
}
