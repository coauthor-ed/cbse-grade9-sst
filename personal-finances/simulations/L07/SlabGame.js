// SlabGame - L07 mini-game (blk-l07-s06): split a taxable income into its slabs, three rounds.
//   Book Table 5.1 (new regime FY 2025-26; no rebate, no cess): nil up to 4,00,000, then 5, 10, 15, 20, 25% for
//   each next 4,00,000, and 30% above 24,00,000. Rounds: 6,00,000 -> 10,000; 9,00,000 -> 30,000;
//   17,50,000 -> 1,50,000 (checked with node).
//   Board: seven slab rows (range, rate, a track that fills with the part, "rate x part = tax"); tap a row to pick it,
//   then -1 lakh / -50,000 / +50,000 / +1 lakh, or "fill this slab" (the slab's full width, or what is left of the
//   income). A part never goes past its slab's width. The tax line adds as the parts change.
//   Check: the parts must fill the slabs from the bottom, then add to the income. Not-yet lines: "The first
//   Rs 4,00,000 goes in the nil slab first." / "Fill the 5% slab (Rs 4,00,000) before the 10% slab." / "Parts add to
//   Rs 8,00,000, but the income is Rs 9,00,000." Exact -> "Next income"; after round 3 the win (finishGame).
//   checkObjective is real. The board never shows the split itself.
// Tokens only. ASCII only.
import { GameBoard, mountGame, finishGame, onTap } from 'simulations/base/kit/GameFrame.js';
import { MONEY_CSS, rs } from '../shared/MoneyKit.js';

const LAKH = 100000, W4 = 4 * LAKH;
const SLABS = [0, 5, 10, 15, 20, 25, 30].map((r, i) => ({ i, lo: i * W4, w: i === 6 ? 6 * LAKH : W4, rate: r }));
const ROUNDS = [600000, 900000, 1750000];
const taxOf = (inc) => SLABS.reduce((t, s) => t + (Math.max(0, Math.min(inc - s.lo, i6(s))) * s.rate) / 100, 0);
function i6(s) { return s.i === 6 ? Infinity : s.w; }
const range = (s) => (s.i === 0 ? 'up to 4 lakh' : s.i === 6 ? 'above 24 lakh' : `${s.lo / LAKH} to ${(s.lo + s.w) / LAKH} lakh`);
const rateTxt = (s) => (s.rate ? `${s.rate}%` : 'nil');
const STEPS = [[-LAKH, '-1 lakh'], [-50000, '-50,000'], [50000, '+50,000'], [LAKH, '+1 lakh']];

const CSS = MONEY_CSS + `
.sg { background: var(--sim-bg-deep); border-radius: var(--sim-radius-md, 12px); }
.sg .gm-head { display: flex; align-items: baseline; gap: 16px; max-width: none; }
.sg .gm-head h2 { white-space: nowrap; }
.sg .sg-body { flex: 1 1 auto; min-height: 0; display: grid; grid-template-columns: minmax(0, 1fr) 400px; gap: 12px; }
.sg .sg-rows { display: grid; grid-template-rows: repeat(7, minmax(0, 1fr)); gap: 5px; }
.sg .sg-row { min-height: 40px; display: grid; grid-template-columns: 118px 52px minmax(0, 1fr) 230px; align-items: center; gap: 8px;
  padding: 2px 10px; text-align: left; font: 700 16px/1.1 var(--sim-font); color: var(--sim-label); }
.sg .sg-row[aria-pressed="true"] { border-color: var(--sim-accent); background: color-mix(in oklab, var(--sim-accent) 12%, var(--sim-bg-surface));
  box-shadow: 0 var(--sim-lift, 3px) 0 var(--sim-accent); }
.sg .sg-rng { color: var(--sim-label-muted); }
.sg .sg-rate { font: 900 20px/1 var(--sim-font); color: color-mix(in oklab, var(--sim-series-1) 60%, var(--sim-label)); }
.sg .sg-track { position: relative; height: 18px; border-radius: 9px; border: 2px solid var(--sim-stroke); background: color-mix(in oklab, var(--sim-label) 5%, var(--sim-bg-surface)); overflow: hidden; }
.sg .sg-fill { position: absolute; left: 0; top: 0; bottom: 0; background: color-mix(in oklab, var(--sim-series-1) 62%, var(--sim-bg-surface)); transition: width 0.3s ease-out; }
.sg .sg-calc { font: 800 16px/1.1 var(--sim-font); text-align: right; white-space: nowrap; font-variant-numeric: tabular-nums; }
.sg .sg-calc b { font-weight: 900; }
.sg .sg-calc[data-z="1"] { color: var(--sim-label-muted); font-weight: 700; }
.sg .sg-side { background: var(--sim-bg-surface); border: var(--sim-border); border-radius: var(--sim-radius-lg, 14px); padding: 8px 12px 10px;
  display: flex; flex-direction: column; gap: 7px; }
.sg .sg-inc { display: flex; justify-content: space-between; align-items: baseline; font: 800 17px/1.1 var(--sim-font); color: var(--sim-label-muted); }
.sg .sg-inc b { font-size: 26px; color: var(--sim-label); font-variant-numeric: tabular-nums; }
.sg .sg-left { font: 700 16px/1.2 var(--sim-font); color: var(--sim-label-muted); font-variant-numeric: tabular-nums; }
.sg .sg-left b { color: var(--sim-label); }
.sg .sg-pick { font: 800 17px/1.2 var(--sim-font); color: var(--sim-label); }
.sg .sg-steps { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 6px; }
.sg .sg-st { min-height: 46px; padding: 0 2px; font: 800 16px/1 var(--sim-font); white-space: nowrap; }
.sg .sg-pair { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 8px; }
.sg .sg-fillb { min-height: 46px; font: 800 17px/1 var(--sim-font); }
.sg .sg-go { min-height: 46px; font: 800 18px/1 var(--sim-font); background: var(--sim-accent); color: var(--sim-bg-deep);
  border-color: color-mix(in oklab, var(--sim-accent) 70%, black); box-shadow: 0 var(--sim-lift) 0 color-mix(in oklab, var(--sim-accent) 60%, black); }
.sg .sg-go[aria-disabled="true"], .sg .sg-st[aria-disabled="true"], .sg .sg-fillb[aria-disabled="true"] { opacity: 0.45; cursor: default; }
.sg .sg-tax { font: 800 17px/1.1 var(--sim-font); color: var(--sim-label-muted); }
.sg .sg-tax b { font-size: 24px; color: var(--sim-label); font-variant-numeric: tabular-nums; }
.sg .sg-say { margin: 0; min-height: 44px; font: 800 17px/1.3 var(--sim-font); color: var(--sim-label-muted); display: flex; align-items: center; }
.sg .sg-say[data-tone="good"] { color: color-mix(in oklab, var(--sim-series-3) 62%, var(--sim-label)); }
.sg .sg-say[data-tone="bad"] { color: var(--sim-bad); }
.sg .sg-dots { display: inline-flex; gap: 6px; margin-left: auto; }
.sg .sg-dot { width: 14px; height: 14px; border-radius: 50%; border: 2px solid var(--sim-stroke); background: var(--sim-bg-surface); }
.sg .sg-dot[data-s="done"] { background: var(--sim-series-3); border-color: color-mix(in oklab, var(--sim-series-3) 60%, var(--sim-label)); }
.sg .sg-dot[data-s="now"] { border-color: var(--sim-accent); border-width: 3px; }
.sim-dom-root--portrait .sg .gm-head { flex-wrap: wrap; gap: 4px 10px; }
.sim-dom-root--portrait .sg .sg-body { grid-template-columns: minmax(0, 1fr); }
.sim-dom-root--portrait .sg .sg-rows { gap: 5px; }
.sim-dom-root--portrait .sg .sg-row { grid-template-columns: 44px minmax(0, 1fr); grid-template-rows: auto auto; row-gap: 3px; column-gap: 8px; padding: 4px 8px; min-height: 52px; }
.sim-dom-root--portrait .sg .sg-rate { grid-row: 1 / 3; font-size: 19px; }
.sim-dom-root--portrait .sg .sg-rng { display: none; }
.sim-dom-root--portrait .sg .sg-track { grid-column: 2; grid-row: 2; height: 12px; }
.sim-dom-root--portrait .sg .sg-calc { grid-column: 2; grid-row: 1; text-align: left; font-size: 15px; }
.sim-dom-root--portrait .sg .sg-st { font-size: 14px; }
.sim-dom-root--portrait .sg .sg-say { font-size: 16px; }
`;

export class SlabGame extends GameBoard {
  static CONTINUOUS = false;
  static OBJECTIVE = { prompt: { en: 'Split each of the three incomes into its slabs until all three tax totals are exact.' } };
  static ARIA_LABEL = 'The slab game. Three taxable incomes, one at a time: 6,00,000, 9,00,000 and 17,50,000 rupees. Seven slab rows: nil up to 4 lakh, then 5, 10, 15, 20 and 25 per cent for each next 4 lakh, and 30 per cent above 24 lakh. Pick a row, then add or take away 50,000 or 1 lakh rupees, or fill the slab. Each row shows its rate times its part and the tax on it. Check: the parts must fill the slabs from the bottom and add up to the income. You win when all three totals are exact.';

  async setup() {
    this.resetAll();
    await super.setup();
    const rows = SLABS.map((s) => `<button type="button" class="tap btn sg-row" data-i="${s.i}" aria-pressed="false">
        <span class="sg-rng">${range(s)}</span><span class="sg-rate">${rateTxt(s)}</span>
        <span class="sg-track" aria-hidden="true"><span class="sg-fill" style="width:0%"></span></span><span class="sg-calc"></span></button>`).join('');
    const steps = STEPS.map(([d, l]) => `<button type="button" class="tap btn sg-st" data-d="${d}">${l}</button>`).join('');
    mountGame(this, {
      css: CSS, check: false,
      html: `<div class="gm sg"><div class="gm-head"><h2>Slab game</h2><p class="sub">Split the income into its slabs, from the bottom.</p></div>
        <div class="sg-body">
          <div class="sg-rows">${rows}</div>
          <div class="sg-side">
            <div class="sg-inc"><span>round <span class="sg-rn"></span> of 3 <span class="sg-dots"><i class="sg-dot"></i><i class="sg-dot"></i><i class="sg-dot"></i></span></span></div>
            <div class="sg-inc"><span>taxable income</span><b class="sg-amt"></b></div>
            <div class="sg-left"></div>
            <div class="sg-pick"></div>
            <div class="sg-steps">${steps}</div>
            <div class="sg-pair"><button type="button" class="tap btn sg-fillb">fill this slab</button><button type="button" class="tap btn sg-go">Check</button></div>
            <div class="sg-tax">tax <b class="sg-total"></b></div>
            <p class="sg-say" aria-live="polite"></p>
          </div>
        </div></div>`,
    });
    // One Quill only: mini-game@1 draws him in its verdict strip, so the frame's corner Quill goes (never on the board).
    this.quill?.destroy?.(); this.quill = null; this._scaleWrap?.classList.remove('gm-quill');
    this.root?.querySelectorAll?.('.sg-row').forEach((b) => onTap(b, () => this.pick(Number(b.dataset.i))));
    this.root?.querySelectorAll?.('.sg-st').forEach((b) => onTap(b, () => this.nudge(Number(b.dataset.d))));
    const fb = this.root?.querySelector?.('.sg-fillb');
    if (fb) onTap(fb, () => this.fillSlab());
    const go = this.root?.querySelector?.('.sg-go');
    if (go) onTap(go, () => this.go());
    this.draw();
  }

  resetAll() {
    for (const t of (this._sgTimers ?? []).splice(0)) clearTimeout(t);
    this._sgTimers = [];
    this.round = 0;
    this.parts = SLABS.map(() => 0);
    this.sel = 0;
    this.phase = 'play';   // play | right | won
    this.won = false;
    this.line = ''; this.tone = '';
  }

  get income() { return ROUNDS[this.round]; }
  sum() { return this.parts.reduce((a, b) => a + b, 0); }
  total() { return SLABS.reduce((t, s) => t + (this.parts[s.i] * s.rate) / 100, 0); }

  pick(i) {
    if (this.phase !== 'play') return;
    this.sel = i;
    this.draw();
  }

  setPart(i, v) {
    const s = SLABS[i];
    this.parts[i] = Math.max(0, Math.min(s.w, v));
    this.line = ''; this.tone = '';
    this.draw();
  }

  nudge(d) {
    if (this.phase !== 'play') return;
    this.setPart(this.sel, this.parts[this.sel] + d);
  }

  /** The slab's full width, or what is left of the income if that is less. */
  fillSlab() {
    if (this.phase !== 'play') return;
    const others = this.sum() - this.parts[this.sel];
    this.setPart(this.sel, Math.min(SLABS[this.sel].w, Math.max(0, this.income - others)));
  }

  /** null when the parts are right, else the not-yet line. */
  judge() {
    const p = this.parts;
    for (let i = 0; i < SLABS.length - 1; i++) {
      if (p[i] < SLABS[i].w && p.slice(i + 1).some((v) => v > 0)) {
        if (i === 0) return `The first ${rs(W4)} goes in the nil slab first.`;
        const j = p.findIndex((v, k) => k > i && v > 0);
        return `Fill the ${rateTxt(SLABS[i])} slab (${rs(SLABS[i].w)}) before the ${rateTxt(SLABS[j])} slab.`;
      }
    }
    if (this.sum() !== this.income) return `Parts add to ${rs(this.sum())}, but the income is ${rs(this.income)}.`;
    return null;
  }

  go() {
    if (this.phase === 'right') { this.next(); return; }
    if (this.phase !== 'play') return;
    const why = this.judge();
    if (why) { this.line = why; this.tone = 'bad'; this.draw(); return; }
    const t = this.total();
    if (this.round < ROUNDS.length - 1) {
      this.phase = 'right';
      this.line = `Exact: tax ${rs(t)} on ${rs(this.income)}.`; this.tone = 'good';
    } else {
      this.phase = 'won'; this.won = true;
      this.line = `All three exact: ${ROUNDS.map((r) => rs(taxOf(r))).join(', ')}.`; this.tone = 'good';
      finishGame(this);
    }
    this.draw();
  }

  next() {
    this.round += 1;
    this.parts = SLABS.map(() => 0);
    this.sel = 0;
    this.phase = 'play';
    this.line = ''; this.tone = '';
    this.draw();
  }

  draw() {
    const q = (s) => this.root?.querySelector(s);
    if (!q('.sg-rows')) return;
    const play = this.phase === 'play';
    this.root.querySelectorAll('.sg-row').forEach((b) => {
      const i = Number(b.dataset.i), s = SLABS[i], part = this.parts[i];
      b.setAttribute('aria-pressed', String(i === this.sel && play));
      b.querySelector('.sg-fill').style.width = `${((100 * part) / s.w).toFixed(1)}%`;
      const c = b.querySelector('.sg-calc');
      c.dataset.z = part ? '0' : '1';
      c.innerHTML = s.rate ? `${s.rate}% x ${rs(part)} = <b>${rs((part * s.rate) / 100)}</b>` : `nil x ${rs(part)} = <b>${rs(0)}</b>`;
      b.setAttribute('aria-label', `${range(s)}, ${rateTxt(s)}: part ${rs(part)}, tax ${rs((part * s.rate) / 100)}`);
    });
    q('.sg-rn').textContent = String(this.round + 1);
    this.root.querySelectorAll('.sg-dot').forEach((d, i) => {
      d.dataset.s = i < this.round || (i === this.round && this.phase !== 'play') ? 'done' : i === this.round ? 'now' : '';
    });
    q('.sg-amt').textContent = rs(this.income);
    const left = this.income - this.sum();
    q('.sg-left').innerHTML = left >= 0 ? `placed <b>${rs(this.sum())}</b>, left <b>${rs(left)}</b>` : `placed <b>${rs(this.sum())}</b>, <b>${rs(-left)}</b> too much`;
    const s = SLABS[this.sel];
    q('.sg-pick').textContent = play ? `picked: the ${rateTxt(s)} slab, ${range(s)}` : '';
    const atMin = this.parts[this.sel] <= 0, atMax = this.parts[this.sel] >= s.w;
    this.root.querySelectorAll('.sg-st').forEach((b) => b.setAttribute('aria-disabled', String(!play || (Number(b.dataset.d) < 0 ? atMin : atMax))));
    q('.sg-fillb').setAttribute('aria-disabled', String(!play));
    const go = q('.sg-go');
    go.textContent = this.phase === 'right' ? 'Next income' : 'Check';
    go.setAttribute('aria-disabled', String(this.phase === 'won'));
    q('.sg-total').textContent = rs(this.total());
    const say = q('.sg-say');
    say.textContent = this.line;
    if (this.tone) say.dataset.tone = this.tone; else delete say.dataset.tone;
    this.relayout?.();
  }

  checkObjective() { return this.won ? { ok: true } : null; }

  resetChallenge() {
    super.resetChallenge?.();
    this.resetAll();
    this.draw();
  }

  destroy() {
    for (const t of (this._sgTimers ?? []).splice(0)) clearTimeout(t);
    super.destroy();
  }

  testState() {
    return { round: this.round, income: this.income, parts: this.parts.slice(), total: this.total(), phase: this.phase, won: this.won, line: this.line, rounds: ROUNDS.map(taxOf) };
  }
}
