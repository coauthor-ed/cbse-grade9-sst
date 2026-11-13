// StartAgeGame - L03 mini-game (blk-l03-s05): find the LATEST start age that still reaches the target by 65.
//   Each round: Rs 1,000 at the end of every year at 7%, from the start age to 65 (value after n deposits =
//   1000 x (1.07^n - 1) / 0.07). Targets in a fixed order: Rs 50,000, Rs 1,00,000, Rs 1,50,000.
//   Answers (checked with node): 50,000 -> 42 (Rs 53,436; at 43 Rs 49,006); 1,00,000 -> 34 (Rs 1,02,073; at 35
//   Rs 94,461 = Dhruv's total); 1,50,000 -> 28 (Rs 1,60,337; at 29 Rs 1,48,913).
//   The board: a start-age stepper (-5 -1 +1 +5, ages 20-64; every round starts at 50, which misses all three),
//   "Run the years" draws the growth trace from the start age to 65 on a small graph with the dashed target line;
//   earlier tries stay faint. Verdict: short -> "Rs 49,006 is short of Rs 50,000. Start earlier."; reached but a
//   later age also reaches -> "Reached - can you start later?"; the latest age -> solved, "next round".
//   The stepper never shows whether an age works. checkObjective is real: all three rounds solved.
// One chart look for L03: the trace = series 5 (Bhavisha's colour), the target = accent dashes. Tokens only. ASCII only.
import { GameBoard, mountGame, finishGame, onTap } from 'simulations/base/kit/GameFrame.js';
import { shade, fill, stroke } from 'simulations/base/kit/SimSvg.js';
import { MONEY_CSS, rs, group } from '../shared/MoneyKit.js';

const f1 = (v) => (+v).toFixed(1);
const DEP = 1000, RATE = 0.07, END = 65, MIN_AGE = 20, MAX_AGE = 64, START = 50;
const fv = (n) => (n <= 0 ? 0 : DEP * ((1 + RATE) ** n - 1) / RATE);
const total = (age) => Math.round(fv(END - age));
const TARGETS = [50000, 100000, 150000];
/** The latest start age whose total reaches t. */
const latest = (t) => { let a = MAX_AGE; while (a >= MIN_AGE && total(a) < t) a--; return a; };
const ANSWERS = TARGETS.map(latest);   // 42, 34, 28
const LINE = 'var(--sim-series-5)', ACC = 'var(--sim-accent)', SAVE = 'var(--sim-series-3)', BAD = 'var(--sim-bad)';

const CSS = MONEY_CSS + `
.sa { background: var(--sim-bg-deep); border-radius: var(--sim-radius-md, 12px); }
.sa .gm-head { display: flex; align-items: baseline; gap: 16px; }
.sa .gm-head h2 { white-space: nowrap; }
.sa .sa-dots { display: flex; gap: 6px; margin-left: auto; align-self: center; }
.sa .sa-dot { width: 18px; height: 18px; border-radius: 99px; border: 2.5px solid var(--sim-stroke); background: var(--sim-bg-surface); }
.sa .sa-dot[data-s="won"] { background: ${SAVE}; border-color: color-mix(in oklab, ${SAVE} 60%, black); }
.sa .sa-dot[data-s="now"] { border-color: var(--sim-accent); border-width: 4px; }
.sa .sa-body { flex: 1 1 auto; min-height: 0; display: grid; grid-template-columns: 330px minmax(0, 1fr); gap: 14px; align-items: stretch; }
.sa .sa-panel { background: var(--sim-bg-surface); border: var(--sim-border); border-radius: var(--sim-radius-lg, 14px); padding: 10px 14px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; }
.sa .sa-target { font: 800 19px/1.1 var(--sim-font); color: var(--sim-label-muted); }
.sa .sa-target b { display: block; font-size: 34px; color: var(--sim-label); margin-top: 2px; text-align: center; }
.sa .sa-lab { font: 800 19px/1 var(--sim-font); color: var(--sim-label); }
.sa .sa-age { font: 800 48px/1 var(--sim-font); color: var(--sim-label); min-width: 2.2ch; text-align: center; }
.sa .sa-step { display: flex; align-items: center; gap: 8px; }
.sa .sa-st { min-width: 54px; min-height: 52px; padding: 0 8px; font: 800 22px/1 var(--sim-font); }
.sa .sa-st[aria-disabled="true"] { opacity: 0.4; cursor: default; }
.sa .sa-hint { font: 700 16px/1.2 var(--sim-font); color: var(--sim-label-muted); text-align: center; }
.sa .sa-chart { padding: 4px 6px; }
.sa .sa-chart svg { display: block; width: 100%; height: auto; }
.sa .sa-chart svg.sa-p { display: none; }
.sim-dom-root--portrait .sa .sa-chart svg.sa-l { display: none; }
.sim-dom-root--portrait .sa .sa-chart svg.sa-p { display: block; }
.sa .sa-act { display: flex; align-items: center; gap: 14px; min-height: 54px; }
.sa .sa-say { flex: 1 1 auto; margin: 0; font: 800 19px/1.3 var(--sim-font); color: var(--sim-label-muted); }
.sa .sa-say[data-tone="good"] { color: color-mix(in oklab, ${SAVE} 62%, var(--sim-label)); }
.sa .sa-say[data-tone="bad"] { color: var(--sim-bad); }
.sa .sa-go { flex: none; min-width: 220px; min-height: 52px; font: 800 21px/1 var(--sim-font); background: var(--sim-accent); color: var(--sim-bg-deep);
  border-color: color-mix(in oklab, var(--sim-accent) 70%, black); box-shadow: 0 var(--sim-lift) 0 color-mix(in oklab, var(--sim-accent) 60%, black); }
.sa .sa-go[aria-disabled="true"] { background: var(--sim-bg-surface); color: var(--sim-label-muted); border-color: var(--sim-stroke); box-shadow: 0 var(--sim-lift) 0 var(--sim-stroke); cursor: default; }
.sim-dom-root--portrait .sa .gm-head { flex-wrap: wrap; gap: 4px 10px; }
.sim-dom-root--portrait .sa .gm-head .sub { flex-basis: 100%; order: 3; }
.sim-dom-root--portrait .sa .sa-body { grid-template-columns: minmax(0, 1fr); gap: 8px; }
.sim-dom-root--portrait .sa .sa-panel { padding: 8px 10px; gap: 6px; }
.sim-dom-root--portrait .sa .sa-ctrl { display: grid; grid-template-columns: auto minmax(0, 1fr); align-items: center; column-gap: 10px; }
.sim-dom-root--portrait .sa .sa-target { grid-column: 1 / -1; display: flex; align-items: baseline; justify-content: center; gap: 8px; font-size: 17px; }
.sim-dom-root--portrait .sa .sa-target b { display: inline; font-size: 28px; }
.sim-dom-root--portrait .sa .sa-lab { grid-column: 1 / -1; text-align: center; font-size: 17px; }
.sim-dom-root--portrait .sa .sa-step { grid-column: 1 / -1; justify-content: center; gap: 6px; }
.sim-dom-root--portrait .sa .sa-age { font-size: 40px; }
.sim-dom-root--portrait .sa .sa-st { min-width: 48px; min-height: 48px; font-size: 20px; }
.sim-dom-root--portrait .sa .sa-hint { grid-column: 1 / -1; font-size: 15px; }
.sim-dom-root--portrait .sa .sa-act { flex-direction: column; align-items: stretch; gap: 8px; }
.sim-dom-root--portrait .sa .sa-say { font-size: 16px; text-align: center; min-height: 42px; }
.sim-dom-root--portrait .sa .sa-go { width: 100%; }
`;

const text = (x, y, t, size, col = 'var(--sim-label)', anchor = 'middle', w = 800) =>
  `<text x="${f1(x)}" y="${f1(y)}" text-anchor="${anchor}" style="fill:${col};font:${w} ${size}px var(--sim-font)">${t}</text>`;

export class StartAgeGame extends GameBoard {
  static CONTINUOUS = false;
  static OBJECTIVE = { prompt: { en: 'For \u20b950,000, \u20b91,00,000 and \u20b91,50,000, find the latest age you can start saving \u20b91,000 a year at 7% and still reach the target by 65.' } };
  static ARIA_LABEL = 'Three rounds. Each round has a target for age 65: 50,000, then 1,00,000, then 1,50,000 rupees. Pick a start age, then run the years: 1,000 rupees go in at the end of every year at 7% until 65, and a line grows on the graph towards the target line. Find the latest start age that still reaches the target.';

  async setup() {
    this.resetAll();
    await super.setup();
    mountGame(this, {
      css: CSS, check: false,
      html: `<div class="gm sa"><div class="gm-head"><h2>Start-age game</h2><div class="sa-dots" aria-hidden="true"></div><p class="sub"></p></div>
        <div class="sa-body"><div class="sa-panel sa-ctrl">
          <div class="sa-target"></div>
          <div class="sa-lab">start saving at age</div>
          <div class="sa-step">
            <button type="button" class="tap btn sa-st" data-d="-5" aria-label="5 years earlier">-5</button>
            <button type="button" class="tap btn sa-st" data-d="-1" aria-label="1 year earlier">-1</button>
            <span class="sa-age" aria-live="polite"></span>
            <button type="button" class="tap btn sa-st" data-d="1" aria-label="1 year later">+1</button>
            <button type="button" class="tap btn sa-st" data-d="5" aria-label="5 years later">+5</button>
          </div>
          <div class="sa-hint">${rs(1000)} a year at 7%, until 65</div>
        </div><div class="sa-panel sa-chart"></div></div>
        <div class="sa-act"><p class="sa-say" aria-live="polite"></p><button type="button" class="tap btn sa-go"></button></div></div>`,
    });
    // One Quill only: mini-game@1 draws him in its verdict strip, so the frame's corner Quill goes (never on the board).
    this.quill?.destroy?.(); this.quill = null; this._scaleWrap?.classList.remove('gm-quill');
    this.root?.querySelectorAll?.('.sa-st').forEach((b) => onTap(b, () => this.nudge(Number(b.dataset.d))));
    const go = this.root?.querySelector?.('.sa-go');
    if (go) onTap(go, () => this.go());
    this.draw();
  }

  resetAll() {
    for (const t of (this._saTimers ?? []).splice(0)) clearTimeout(t);
    this._saTimers = [];
    this.round = 0;
    this.won = [false, false, false];
    this.newRound();
  }

  newRound() {
    this.age = START;
    this.tries = [];          // earlier start ages run this round (faint traces)
    this.phase = 'pick';      // pick | run | done
    this.t = 1;               // 0..1 through the run
    this.result = null;       // null | 'short' | 'early' | 'win'
  }

  get target() { return TARGETS[this.round]; }

  nudge(dlt) {
    if (this.phase === 'run' || this.won[this.round]) return;
    const a = Math.max(MIN_AGE, Math.min(MAX_AGE, this.age + dlt));
    if (a === this.age) return;
    this.age = a;
    if (this.phase === 'done') { this.phase = 'pick'; this.result = null; }
    this.say('');
    this.draw();
  }

  /** The graph: age 20-65 on x, rupees 0-3,00,000 on y; the target line; faint earlier traces; the current trace. */
  chartSvg(P) {
    const W = P ? 300 : 720, H = P ? 252 : 232, YM = 2 * this.target;
    const L = P ? 74 : 92, R = W - (P ? 12 : 16), T = 16, Bm = H - (P ? 40 : 44);
    const px = (a) => L + ((a - MIN_AGE) / (END - MIN_AGE)) * (R - L), py = (v) => Bm - (v / YM) * (Bm - T);
    const fs = P ? 15 : 18, clip = `sa-clip-${P ? 'p' : 'l'}`;
    let s = '';
    s += `<defs><clipPath id="${clip}"><rect x="${L}" y="${T - 8}" width="${R - L + 10}" height="${Bm - T + 10}"/></clipPath></defs>`;
    [0, this.target / 2, this.target, 1.5 * this.target, YM].forEach((v) => {
      s += `<path d="M${L} ${f1(py(v))}H${R}" ${stroke('var(--sim-stroke)', 1.5, 'opacity:0.5')}/>`;
      s += text(L - 8, py(v) + 6, group(v), fs, 'var(--sim-label-muted)', 'end', 700);
    });
    [30, 40, 50, 60, 65].forEach((a) => { s += text(px(a), Bm + (P ? 20 : 24), String(a), fs, 'var(--sim-label-muted)', 'middle', 700); });
    s += text((L + R) / 2, H - 4, 'age', fs, 'var(--sim-label)', 'middle', 800);
    s += `<path d="M${L} ${T - 6}V${Bm}H${R}" ${stroke('var(--sim-label)', 3.5)}/>`;
    // the target line
    const yT = py(this.target);
    s += `<path d="M${L} ${f1(yT)}H${R}" ${stroke(ACC, 3, 'stroke-dasharray:9 6')}/>`;
    s += text(L + 8, yT - 8, `target ${rs(this.target)}`, P ? 16 : 19, shade(ACC, 70), 'start', 800);
    const trace = (age, upto, col, w, op) => {
      const pts = [];
      for (let a = age; a <= upto; a++) pts.push(`${f1(px(a))} ${f1(py(fv(a - age)))}`);
      return pts.length > 1 ? `<path clip-path="url(#${clip})" d="M${pts.join('L')}" ${stroke(col, w, `opacity:${op}`)}/>` : '';
    };
    this.tries.forEach((a) => { if (a !== this.age || this.phase === 'pick') s += trace(a, END, LINE, P ? 3 : 4, 0.3); });
    // the current start age, marked on the axis
    s += `<circle cx="${f1(px(this.age))}" cy="${Bm}" r="${P ? 7 : 9}" ${fill(LINE, 'stroke:var(--sim-bg-surface);stroke-width:3')}/>`;
    if (this.phase !== 'pick') {
      const upto = this.age + Math.round((END - this.age) * this.t);
      s += trace(this.age, upto, LINE, P ? 5 : 6, 1);
      const v = fv(upto - this.age);
      if (v <= YM * 1.04) s += `<circle cx="${f1(px(upto))}" cy="${f1(py(v))}" r="${P ? 6 : 8}" ${fill(LINE, 'stroke:var(--sim-bg-surface);stroke-width:3')}/>`;
      if (this.phase === 'done') {
        const ok = this.result !== 'short';
        const yv = Math.max(T, py(v)), below = yv < T + 30 || Math.abs(yv - yT) < 30;
        s += text(R - 4, yv + (below ? 30 : -14), rs(Math.round(v)), P ? 19 : 24, ok ? shade(SAVE, 58) : BAD, 'end', 800);
      }
    }
    return `<svg class="${P ? 'sa-p' : 'sa-l'}" viewBox="0 0 ${W} ${H}" role="img" aria-label="graph of savings from age ${this.age} to 65 against the target ${this.target} rupees">${s}</svg>`;
  }

  draw() {
    const q = (s) => this.root?.querySelector(s);
    if (!q('.sa-chart')) return;
    q('.sa-dots').innerHTML = this.won.map((w, i) => `<span class="sa-dot" data-s="${w ? 'won' : i === this.round ? 'now' : ''}"></span>`).join('');
    q('.sub').textContent = `Round ${this.round + 1} of 3. Find the latest start age that still reaches the target.`;
    q('.sa-target').innerHTML = `target at 65 <b>${rs(this.target)}</b>`;
    q('.sa-age').textContent = String(this.age);
    const lock = this.phase === 'run' || this.won[this.round];
    this.root.querySelectorAll('.sa-st').forEach((b) => {
      const d = Number(b.dataset.d), off = lock || (d < 0 && this.age <= MIN_AGE) || (d > 0 && this.age >= MAX_AGE);
      b.setAttribute('aria-disabled', String(off));
    });
    q('.sa-chart').innerHTML = this.chartSvg(false) + this.chartSvg(true);
    const go = q('.sa-go');
    const allWon = this.won.every(Boolean);
    go.textContent = this.won[this.round] ? (allWon ? 'all three found' : 'next round') : 'Run the years';
    go.setAttribute('aria-disabled', String(this.phase === 'run' || allWon || (this.phase === 'done' && !this.won[this.round])));
    this.relayout?.();
  }

  say(t, tone) {
    const el = this.root?.querySelector('.sa-say');
    if (!el) return;
    el.textContent = t;
    if (tone) el.dataset.tone = tone; else delete el.dataset.tone;
  }

  go() {
    if (this.phase === 'run') return;
    if (this.won[this.round]) {
      if (this.won.every(Boolean)) return;
      this.round += 1;
      this.newRound();
      this.say('');
      this.draw();
      return;
    }
    if (this.phase === 'done') return;   // change the age first
    this.run();
  }

  /** The years: the trace grows to 65 in steps (about 1 s), then the verdict. */
  run() {
    this.phase = 'run';
    this.say('');
    const calm = globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const n = calm ? 1 : 12;
    this.t = 0;
    for (let i = 1; i <= n; i++) {
      this._saTimers.push(setTimeout(() => { this.t = i / n; if (i === n) this.judge(); else this.draw(); }, calm ? 50 : i * 85));
    }
    this.draw();
  }

  judge() {
    const t = this.target, a = this.age, v = total(a), best = ANSWERS[this.round];
    this.phase = 'done';
    if (!this.tries.includes(a)) this.tries.push(a);
    if (v < t) {
      this.result = 'short';
      const dh = this.round === 1 && a === 35 ? ' That is Dhruv\'s total.' : '';
      this.say(`${rs(v)} is short of ${rs(t)}.${dh} Start earlier.`, 'bad');
    } else if (a < best) {
      this.result = 'early';
      this.say(`Reached: ${rs(v)}. Can you start later?`);
    } else {
      this.result = 'win';
      this.won[this.round] = true;
      const last = this.won.every(Boolean);
      this.say(`${rs(v)} reaches ${rs(t)}. At ${a + 1} it is only ${rs(total(a + 1))}, so ${a} is the latest.${last ? ' All three found.' : ''}`, 'good');
      if (last) finishGame(this);
    }
    this.draw();
  }

  checkObjective() { return this.won.every(Boolean) ? { ok: true } : null; }

  resetChallenge() {
    super.resetChallenge?.();
    this.resetAll();
    this.say('');
    this.draw();
  }

  destroy() {
    for (const t of (this._saTimers ?? []).splice(0)) clearTimeout(t);
    super.destroy();
  }

  testState() { return { round: this.round, won: this.won.slice(), age: this.age, phase: this.phase, result: this.result, answers: ANSWERS.slice(), target: this.target }; }
}
