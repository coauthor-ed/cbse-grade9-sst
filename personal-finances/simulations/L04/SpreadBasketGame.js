// SpreadBasketGame - L04 mini-game (blk-l04-s07): split Rs 10,000 across four made-up companies A, B, C, D so the
//   basket never falls more than 10% in any one year and ends above Rs 10,000 after ten years.
//   Yearly returns in % (from the old game, kept exactly): A [6,-33,8,7,9,6,7,8,6,7]; B [7,8,6,-33,8,9,5,7,8,6];
//   C [8,6,7,9,-33,7,8,6,7,9]; D [5,9,8,6,7,8,9,-33,6,8]. The split is kept each year: the basket's return is
//   the weighted average. Checked with node: 375 of 1,771 splits win; no win puts more than 40% in one company;
//   25% each: worst year -3.0%, ends Rs 13,587; 40/20/20/20 worst -8.6%; all in one company falls 33% and fails.
//   The board: four company cards with big -/+ (Rs 500 steps), "not placed" left over (starts: all Rs 10,000 in A,
//   so the first run shows the single-company fall); "Run 10 years" draws the basket year by year (0.35 s a year)
//   on a flat graph (rupees on y, years on x); a year that falls more than 10% is drawn red with its % fall;
//   earlier runs stay faint. Each company's crash year shows on its card only after the first run.
//   checkObjective is real: a run that passes (finishGame). The controls never show the result.
// Tokens only. ASCII only.
import { GameBoard, mountGame, finishGame, onTap } from 'simulations/base/kit/GameFrame.js';
import { shade, fill, stroke } from 'simulations/base/kit/SimSvg.js';
import { linScale } from 'simulations/base/kit/SimPlotSvg.js';
import { MONEY_CSS, rs, group } from '../shared/MoneyKit.js';

const f1 = (v) => (+v).toFixed(1);
const START = 10000, STEP = 500, MAX_FALL = 10, YEARS = 10;
const RETURNS = {
  A: [6, -33, 8, 7, 9, 6, 7, 8, 6, 7],
  B: [7, 8, 6, -33, 8, 9, 5, 7, 8, 6],
  C: [8, 6, 7, 9, -33, 7, 8, 6, 7, 9],
  D: [5, 9, 8, 6, 7, 8, 9, -33, 6, 8],
};
const KEYS = ['A', 'B', 'C', 'D'];
const CRASH = Object.fromEntries(KEYS.map((k) => [k, RETURNS[k].indexOf(-33) + 1]));   // A 2, B 4, C 5, D 8
const COL = { A: 'var(--sim-series-1)', B: 'var(--sim-series-4)', C: 'var(--sim-series-5)', D: 'var(--sim-series-7)' };
const LINE = 'var(--sim-series-3)', BAD = 'var(--sim-bad)', SAVE = 'var(--sim-series-3)';
const Y_MIN = 6000, Y_MAX = 17000, Y_TICKS = [6000, 9000, 12000, 15000];

/** The basket value at the end of each year, 0..10, for a split { A, B, C, D } in rupees. */
function basketPath(w) {
  let v = START;
  const p = [v];
  for (let t = 0; t < YEARS; t++) {
    const r = KEYS.reduce((s, k) => s + w[k] * RETURNS[k][t], 0) / START;
    v *= 1 + r / 100;
    p.push(v);
  }
  return p;
}

/** The change in % for each year 1..10 (index 0 is unused). */
const yearPct = (p) => p.map((v, i) => (i ? (v / p[i - 1] - 1) * 100 : 0));

const CSS = MONEY_CSS + `
.sb { background: var(--sim-bg-deep); border-radius: var(--sim-radius-md, 12px); }
.sb .gm-head { display: flex; align-items: baseline; gap: 16px; }
.sb .gm-head h2 { white-space: nowrap; }
.sb .sb-body { flex: 1 1 auto; min-height: 0; display: grid; grid-template-columns: 570px minmax(0, 1fr); gap: 12px; align-items: stretch; }
.sb .sb-left { display: flex; flex-direction: column; gap: 8px; min-height: 0; }
.sb .sb-left-top { display: flex; align-items: baseline; justify-content: space-between; font: 800 18px/1.1 var(--sim-font); color: var(--sim-label); padding: 0 4px; }
.sb .sb-left-top b { font-size: 22px; }
.sb .sb-left-top[data-left="1"] b { color: var(--sim-bad); }
.sb .sb-cards { flex: 1 1 auto; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); grid-auto-rows: 1fr; gap: 8px; }
.sb .sb-card { background: var(--sim-bg-surface); border: var(--sim-border); border-radius: var(--sim-radius-lg, 14px); padding: 4px 8px 4px 16px; position: relative;
  display: grid; grid-template-columns: minmax(0, 1fr) auto; grid-template-rows: auto auto auto; column-gap: 8px; align-items: center; }
.sb .sb-card::before { content: ''; position: absolute; left: 3px; top: 3px; bottom: 3px; width: 8px; border-radius: 6px; background: var(--c); }
.sb .sb-name { font: 800 17px/1.1 var(--sim-font); color: var(--sim-label); white-space: nowrap; }
.sb .sb-name small { font-size: 15px; color: var(--sim-label-muted); margin-left: 4px; }
.sb .sb-amt { font: 800 28px/1.1 var(--sim-font); color: var(--sim-label); white-space: nowrap; }
.sb .sb-amt[data-zero="1"] { color: var(--sim-label-muted); }
.sb .sb-pm { grid-column: 2; grid-row: 1 / 3; display: flex; gap: 8px; }
.sb .sb-pm { gap: 5px; }
.sb .sb-st { min-width: 48px; min-height: 48px; padding: 0; font: 800 28px/1 var(--sim-font); }
.sb .sb-st[aria-disabled="true"] { opacity: 0.4; cursor: default; }
.sb .sb-crash { grid-column: 1 / -1; font: 800 16px/1.2 var(--sim-font); color: var(--sim-label-muted); min-height: 19px; }
.sb .sb-crash[data-on="1"] { color: var(--sim-bad); }
.sb .sb-chart { background: var(--sim-bg-surface); border: var(--sim-border); border-radius: var(--sim-radius-lg, 14px); padding: 4px 6px; display: flex; align-items: center; }
.sb .sb-chart svg { display: block; width: 100%; height: auto; }
.sb .sb-chart svg.sb-p { display: none; }
.sim-dom-root--portrait .sb .sb-chart svg.sb-l { display: none; }
.sim-dom-root--portrait .sb .sb-chart svg.sb-p { display: block; }
.sb .sb-act { display: flex; align-items: center; gap: 14px; min-height: 54px; }
.sb .sb-say { flex: 1 1 auto; margin: 0; font: 800 18px/1.3 var(--sim-font); color: var(--sim-label-muted); }
.sb .sb-say[data-tone="good"] { color: color-mix(in oklab, ${SAVE} 62%, var(--sim-label)); }
.sb .sb-say[data-tone="bad"] { color: var(--sim-bad); }
.sb .sb-go { flex: none; min-width: 210px; min-height: 52px; font: 800 21px/1 var(--sim-font); background: var(--sim-accent); color: var(--sim-bg-deep);
  border-color: color-mix(in oklab, var(--sim-accent) 70%, black); box-shadow: 0 var(--sim-lift) 0 color-mix(in oklab, var(--sim-accent) 60%, black); }
.sb .sb-go[aria-disabled="true"] { background: var(--sim-bg-surface); color: var(--sim-label-muted); border-color: var(--sim-stroke); box-shadow: 0 var(--sim-lift) 0 var(--sim-stroke); cursor: default; }
.sim-dom-root--portrait .sb .gm-head { flex-wrap: wrap; gap: 4px 10px; }
.sim-dom-root--portrait .sb .gm-head .sub { flex-basis: 100%; order: 3; }
.sim-dom-root--portrait .sb .sb-body { grid-template-columns: minmax(0, 1fr); gap: 8px; }
.sim-dom-root--portrait .sb .sb-left-top { font-size: 16px; }
.sim-dom-root--portrait .sb .sb-left-top b { font-size: 20px; }
.sim-dom-root--portrait .sb .sb-cards { gap: 6px; }
.sim-dom-root--portrait .sb .sb-card { grid-template-columns: minmax(0, 1fr); padding: 6px 6px 6px 14px; row-gap: 2px; }
.sim-dom-root--portrait .sb .sb-name { font-size: 16px; }
.sim-dom-root--portrait .sb .sb-amt { font-size: 24px; }
.sim-dom-root--portrait .sb .sb-name small { font-size: 14px; margin-left: 4px; }
.sim-dom-root--portrait .sb .sb-pm { grid-column: 1; grid-row: auto; justify-content: space-between; }
.sim-dom-root--portrait .sb .sb-st { min-width: 56px; min-height: 44px; font-size: 24px; }
.sim-dom-root--portrait .sb .sb-crash { font-size: 14px; min-height: 17px; }
.sim-dom-root--portrait .sb .sb-act { flex-direction: column; align-items: stretch; gap: 8px; }
.sim-dom-root--portrait .sb .sb-say { font-size: 16px; text-align: center; min-height: 42px; }
.sim-dom-root--portrait .sb .sb-go { width: 100%; }
`;

const text = (x, y, t, size, col = 'var(--sim-label)', anchor = 'middle', w = 800) =>
  `<text x="${f1(x)}" y="${f1(y)}" text-anchor="${anchor}" style="fill:${col};font:${w} ${size}px var(--sim-font)">${t}</text>`;

export class SpreadBasketGame extends GameBoard {
  static CONTINUOUS = false;
  static OBJECTIVE = { prompt: { en: 'Split \u20b910,000 across four companies so the basket never falls more than 10% in any one year, and still ends above \u20b910,000 after ten years.' } };
  static ARIA_LABEL = 'Split 10,000 rupees across four made-up companies, A, B, C and D, in steps of 500 rupees. Then run ten years: the basket grows or falls each year by the companies\u2019 returns, and a line grows on the graph. Each company has one bad year when it falls by a third. You win when the basket never falls more than 10% in one year and ends above 10,000 rupees.';

  async setup() {
    this.resetAll();
    await super.setup();
    const cards = KEYS.map((k) => `<div class="sb-card" style="--c:${COL[k]}" data-k="${k}">
        <span class="sb-name">Company ${k}<small></small></span>
        <span class="sb-pm"><button type="button" class="tap btn sb-st" data-k="${k}" data-d="-1" aria-label="${STEP} rupees less in company ${k}">-</button><button type="button" class="tap btn sb-st" data-k="${k}" data-d="1" aria-label="${STEP} rupees more in company ${k}">+</button></span>
        <span class="sb-amt" aria-live="polite"></span>
        <span class="sb-crash"></span></div>`).join('');
    mountGame(this, {
      css: CSS, check: false,
      html: `<div class="gm sb"><div class="gm-head"><h2>Spread the basket</h2><p class="sub">Split ${rs(START)} in steps of ${rs(STEP)}. Made-up companies and returns.</p></div>
        <div class="sb-body"><div class="sb-left"><div class="sb-left-top"></div><div class="sb-cards">${cards}</div></div><div class="sb-chart"></div></div>
        <div class="sb-act"><p class="sb-say" aria-live="polite"></p><button type="button" class="tap btn sb-go">Run 10 years</button></div></div>`,
    });
    // One Quill only: mini-game@1 draws him in its verdict strip, so the frame's corner Quill goes (never on the board).
    this.quill?.destroy?.(); this.quill = null; this._scaleWrap?.classList.remove('gm-quill');
    this.root?.querySelectorAll?.('.sb-st').forEach((b) => onTap(b, () => this.nudge(b.dataset.k, Number(b.dataset.d))));
    const go = this.root?.querySelector?.('.sb-go');
    if (go) onTap(go, () => this.go());
    this.draw();
  }

  resetAll() {
    for (const t of (this._sbTimers ?? []).splice(0)) clearTimeout(t);
    this._sbTimers = [];
    this.w = { A: START, B: 0, C: 0, D: 0 };
    this.tries = [];        // earlier runs: { path }
    this.ran = false;       // crash years show after the first run
    this.won = false;
    this.phase = 'pick';    // pick | run | done
    this.yr = YEARS;        // years drawn of the current run
    this.path = null;
  }

  get placed() { return KEYS.reduce((s, k) => s + this.w[k], 0); }

  nudge(k, d) {
    if (this.phase === 'run' || !KEYS.includes(k)) return;
    const left = START - this.placed;
    if (d > 0 && left < STEP) { this.say(`All ${rs(START)} is placed. Take ${rs(STEP)} out of another company first.`, 'bad'); return; }
    if (d < 0 && this.w[k] < STEP) return;
    this.w[k] += d * STEP;
    if (this.phase === 'done') { if (this.path) this.tries.push(this.path); this.phase = 'pick'; this.path = null; }
    this.say('');
    this.draw();
  }

  /** The graph: years 0..10 on x, rupees 6,000..17,000 on y; the start at 10,000; years that fall more than 10% in red. */
  chartSvg(P) {
    const W = P ? 300 : 560, H = P ? 240 : 300;
    const L = P ? 58 : 76, R = W - (P ? 14 : 20), T = P ? 34 : 40, B = H - (P ? 46 : 52);
    const px = linScale(0, YEARS, L, R), py = linScale(Y_MIN, Y_MAX, B, T);
    const fs = P ? 14 : 17;
    let s = text(L - (P ? 50 : 66), T - (P ? 16 : 18), 'rupees', fs + 1, 'var(--sim-label)', 'start', 800);
    Y_TICKS.forEach((v) => {
      s += `<path d="M${L} ${f1(py(v))}H${R}" ${stroke('var(--sim-stroke)', 1.5, 'opacity:0.5')}/>`;
      s += text(L - 8, py(v) + 6, group(v), fs, 'var(--sim-label-muted)', 'end', 700);
    });
    [0, 2, 4, 6, 8, 10].forEach((y) => { s += text(px(y), B + (P ? 18 : 22), String(y), fs, 'var(--sim-label-muted)', 'middle', 700); });
    s += text((L + R) / 2, H - 4, 'years', fs, 'var(--sim-label)', 'middle', 800);
    s += `<path d="M${L} ${T - 6}V${B}H${R}" ${stroke('var(--sim-label)', 3)}/>`;
    // the start
    s += `<path d="M${L} ${f1(py(START))}H${R}" ${stroke('var(--sim-label-muted)', 2, 'stroke-dasharray:3 5')}/>`;
    // the worst year's ring (a win or a slow basket) sits near the start line, so the start label moves to the other side
    const wiOf = (c) => { let w = 1; for (let i = 2; i <= YEARS; i++) if (c[i] < c[w]) w = i; return w; };
    const done = this.path && this.phase === 'done', dch = done ? yearPct(this.path) : null, dwi = done ? wiOf(dch) : 0;
    const ring = done && dch[dwi] < 0 && dch[dwi] >= -MAX_FALL, sLeft = ring && dwi >= 5;
    s += text(sLeft ? L + 6 : R - 4, py(START) + (P ? 18 : 22), `start ${rs(START)}`, P ? 14 : 17, 'var(--sim-label-muted)', sLeft ? 'start' : 'end', 800);
    const line = (p, upto, col, w, op) => `<path d="M${p.slice(0, upto + 1).map((v, i) => `${f1(px(i))} ${f1(py(Math.max(Y_MIN, Math.min(Y_MAX, v))))}`).join('L')}" ${stroke(col, w, `opacity:${op};fill:none;stroke-linejoin:round`)}/>`;
    this.tries.slice(-3).forEach((p) => { s += line(p, YEARS, 'var(--sim-label-muted)', P ? 2.5 : 3, 0.45); });
    if (this.path) {
      const p = this.path, n = this.yr, ch = yearPct(p);
      const cy = (v) => py(Math.max(Y_MIN, Math.min(Y_MAX, v)));
      s += line(p, n, LINE, P ? 4.5 : 6, 1);
      // a year that falls more than 10%: its segment and dot in red, with the % fall beside it
      for (let i = 1; i <= n; i++) {
        if (ch[i] >= -MAX_FALL) continue;
        s += `<path d="M${f1(px(i - 1))} ${f1(cy(p[i - 1]))}L${f1(px(i))} ${f1(cy(p[i]))}" ${stroke(BAD, P ? 5.5 : 7, 'fill:none;stroke-linecap:round')}/>`;
        // beside the middle of the red segment: on its left (open space under the earlier line), else its right
        const mx = (px(i - 1) + px(i)) / 2, my = (cy(p[i - 1]) + cy(p[i])) / 2 + 6, lw = P ? 40 : 50, left = mx - 8 - lw > L + 4;
        s += text(left ? mx - 8 : mx + 8, my, `${Math.round(ch[i])}%`, P ? 16 : 20, shade(BAD, 80), left ? 'end' : 'start', 800);
      }
      p.slice(1, n + 1).forEach((v, i) => { s += `<circle cx="${f1(px(i + 1))}" cy="${f1(cy(v))}" r="${P ? 3.5 : 4.5}" ${fill(ch[i + 1] < -MAX_FALL ? BAD : LINE)}/>`; });
      const hv = p[n], hb = n > 0 && ch[n] < -MAX_FALL;
      s += `<circle cx="${f1(px(n))}" cy="${f1(cy(hv))}" r="${P ? 6 : 8}" ${fill(hb ? BAD : LINE, 'stroke:var(--sim-bg-surface);stroke-width:3')}/>`;
      if (this.phase === 'done') {
        // the worst year, ringed (when it is not already a red fall), and the end value
        const wi = dwi;
        if (ring) {
          const lx = px(wi), ly = cy(p[wi]), below = ly + (P ? 26 : 34) < B - 4;
          s += `<circle cx="${f1(lx)}" cy="${f1(ly)}" r="${P ? 10 : 13}" ${fill('none', 'stroke:var(--sim-accent);stroke-width:3')}/>`;
          s += text(lx, below ? ly + (P ? 26 : 34) : ly - (P ? 16 : 20), `${f1(ch[wi])}%`, P ? 15 : 19, 'var(--sim-label)', 'middle', 800);
        }
        s += text(px(YEARS) - 2, cy(hv) - (P ? 12 : 16), rs(Math.round(hv)), P ? 16 : 21, 'var(--sim-label)', 'end', 800);
      }
    }
    return `<svg class="${P ? 'sb-p' : 'sb-l'}" viewBox="0 0 ${W} ${H}" role="img" aria-label="graph of the basket over ten years; a year that falls more than ${MAX_FALL}% is red">${s}</svg>`;
  }

  draw() {
    const q = (s) => this.root?.querySelector(s);
    if (!q('.sb-cards')) return;
    const left = START - this.placed, lock = this.phase === 'run';
    const top = q('.sb-left-top');
    top.dataset.left = left > 0 ? '1' : '0';
    top.innerHTML = `<span>not placed <b>${rs(left)}</b></span><span>basket <b>${rs(this.placed)}</b></span>`;
    KEYS.forEach((k) => {
      const card = q(`.sb-card[data-k="${k}"]`);
      const amt = card.querySelector('.sb-amt'), v = this.w[k];
      amt.textContent = rs(v);
      card.querySelector('.sb-name small').textContent = `${Math.round(v / START * 100)}%`;
      amt.dataset.zero = v ? '0' : '1';
      const cr = card.querySelector('.sb-crash');
      cr.textContent = this.ran ? `fell 33% in year ${CRASH[k]}` : 'one bad year: ?';
      cr.dataset.on = this.ran ? '1' : '0';
      card.querySelectorAll('.sb-st').forEach((b) => {
        const d = Number(b.dataset.d), off = lock || (d < 0 && v < STEP) || (d > 0 && left < STEP);
        b.setAttribute('aria-disabled', String(off));
      });
    });
    q('.sb-chart').innerHTML = this.chartSvg(false) + this.chartSvg(true);
    const go = q('.sb-go');
    go.setAttribute('aria-disabled', String(lock || this.phase === 'done'));
    this.relayout?.();
  }

  say(t, tone) {
    const el = this.root?.querySelector('.sb-say');
    if (!el) return;
    el.textContent = t;
    if (tone) el.dataset.tone = tone; else delete el.dataset.tone;
  }

  go() {
    if (this.phase !== 'pick') { if (this.phase === 'done') this.say('Change the split, then run again.'); return; }
    const left = START - this.placed;
    if (left > 0) { this.say(`Place all ${rs(START)} first: ${rs(left)} is not placed yet.`, 'bad'); return; }
    this.run();
  }

  /** Ten years, one point every 0.35 s, then the verdict. */
  run() {
    this.phase = 'run';
    this.path = basketPath(this.w);
    this.yr = 0;
    this.say('');
    const calm = globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (calm) { this.yr = YEARS; this.judge(); return; }
    for (let i = 1; i <= YEARS; i++) {
      this._sbTimers.push(setTimeout(() => { this.yr = i; if (i === YEARS) this.judge(); else this.draw(); }, i * 350));
    }
    this.draw();
  }

  judge() {
    const p = this.path, end = p[YEARS];
    this.phase = 'done';
    this.ran = true;
    const ch = yearPct(p);
    const first = ch.findIndex((c, i) => i > 0 && c < -MAX_FALL);
    const nm = (ks) => (ks.length === 1 ? `Company ${ks[0]}` : `Companies ${ks.slice(0, -1).join(', ')} and ${ks[ks.length - 1]}`);
    if (first > 0) {
      const hit = KEYS.filter((k) => this.w[k] > 0 && CRASH[k] === first);
      this.say(`In year ${first} the basket fell ${Math.round(-ch[first])}%, from ${rs(Math.round(p[first - 1]))} to ${rs(Math.round(p[first]))}. ${nm(hit)} crashed that year. Put less in one company.`, 'bad');
    } else if (end <= START) {
      this.say(`No year fell more than ${MAX_FALL}%, but after ten years the basket is ${rs(Math.round(end))}, not above ${rs(START)}.`, 'bad');
    } else {
      this.won = true;
      const worst = Math.min(...ch.slice(1));
      const msg = `Worst year ${f1(worst)}%, after ten years ${rs(Math.round(end))}. Each crash hit only part of the basket.`;
      this.say(msg, 'good');
      finishGame(this);
    }
    this.draw();
  }

  checkObjective() { return this.won ? { ok: true } : null; }

  resetChallenge() {
    super.resetChallenge?.();
    this.resetAll();
    this.say('');
    this.draw();
  }

  destroy() {
    for (const t of (this._sbTimers ?? []).splice(0)) clearTimeout(t);
    super.destroy();
  }

  testState() { return { w: { ...this.w }, phase: this.phase, won: this.won, yr: this.yr, path: this.path?.map(Math.round) ?? null, crash: CRASH }; }
}
