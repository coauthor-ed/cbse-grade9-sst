// CattleFundGame - L06 mini-game (blk-l06-s06): 200 dairy farmers keep a common fund; each pays the same amount
//   every year; the fund pays Rs 25,000 for each cow that dies. Model kept from CattlePoolGameScene.js: deaths per
//   year [4, 9, 3, 12, 6] (made-up), amount Rs 250-1,000 in steps of 25 (start Rs 750); the amount must stay
//   below Rs 1,000. Each year: fund + 200 x amount - deaths x 25,000; the fund runs out when that goes below 0.
//   Checked with node: the fund pays every claim for five years only if the amount is at least Rs 875 (year 4:
//   200 x 4 x a >= 1,00,000 + 2,25,000 + 75,000 + 3,00,000 = 7,00,000). Wins: Rs 875-975.
//   Board: a big amount stepper (-/+ 25) with "200 x amount = in each year"; "Run five years" fills five year
//   cards one at a time (0.6 s each): cows that died, claims, and a fund meter with the fund at the year's end.
//   A year where the fund runs out turns red and the run stops there. Not-yet lines: "In year N the fund ran
//   out: D cows died, Rs X was needed." / "Rs 1,000 is more than a farmer can spare." checkObjective is real
//   (finishGame on a win). The control never shows the answer: deaths are hidden until a run.
// Tokens only. ASCII only.
import { GameBoard, mountGame, finishGame, onTap } from 'simulations/base/kit/GameFrame.js';
import { loadColors } from 'simulations/base/kit/SimLook.js';
import { drawAnimal, animalLook } from 'simulations/base/kit/SimAnimal.js';
import { MONEY_CSS, rs } from '../shared/MoneyKit.js';

const FARMERS = 200, PAY = 25000, DEATHS = [4, 9, 3, 12, 6], YEARS = DEATHS.length;
const A_MIN = 250, A_MAX = 1000, A_STEP = 25, A_START = 750, SPARE = 1000;
const METER_MAX = 250000;   // the meter's full mark (the fund never goes above Rs 2,00,000 in range)

/** The fund at the end of each year for amount a: [{ deaths, claims, fund }], stopping at the first year it runs out. */
function runYears(a) {
  const out = [];
  let fund = 0;
  for (let y = 0; y < YEARS; y++) {
    const claims = DEATHS[y] * PAY;
    fund += FARMERS * a - claims;
    out.push({ deaths: DEATHS[y], claims, fund });
    if (fund < 0) break;
  }
  return out;
}

const CSS = MONEY_CSS + `
.cf { background: var(--sim-bg-deep); border-radius: var(--sim-radius-md, 12px); }
.cf .gm-head { display: flex; align-items: baseline; gap: 16px; max-width: none; }
.cf .gm-head h2 { white-space: nowrap; }
.cf .cf-body { flex: 1 1 auto; min-height: 0; display: grid; grid-template-columns: 300px minmax(0, 1fr); gap: 12px; }
.cf .cf-set { background: var(--sim-bg-surface); border: var(--sim-border); border-radius: var(--sim-radius-lg, 14px); padding: 6px 12px 10px;
  display: flex; flex-direction: column; align-items: center; gap: 6px; }
.cf .cf-art { width: 260px; height: 70px; }
.cf .cf-art canvas { display: block; width: 100%; height: 100%; }
.cf .cf-lab { font: 700 16px/1.2 var(--sim-font); color: var(--sim-label-muted); text-align: center; }
.cf .cf-step { display: flex; align-items: center; gap: 10px; }
.cf .cf-pm { width: 56px; min-height: 56px; font: 800 30px/1 var(--sim-font); padding: 0; }
.cf .cf-amt { min-width: 120px; text-align: center; font: 800 34px/1 var(--sim-font); color: var(--sim-label); font-variant-numeric: tabular-nums; }

.cf .cf-in { font: 800 18px/1.3 var(--sim-font); color: var(--sim-label); text-align: center; }
.cf .cf-in b { color: color-mix(in oklab, var(--sim-series-3) 55%, var(--sim-label)); }
.cf .cf-go { width: 100%; min-height: 52px; font: 800 20px/1 var(--sim-font); background: var(--sim-accent); color: var(--sim-bg-deep);
  border-color: color-mix(in oklab, var(--sim-accent) 70%, black); box-shadow: 0 var(--sim-lift) 0 color-mix(in oklab, var(--sim-accent) 60%, black); }
.cf .cf-go[aria-disabled="true"] { background: var(--sim-bg-surface); color: var(--sim-label-muted); border-color: var(--sim-stroke); box-shadow: 0 var(--sim-lift) 0 var(--sim-stroke); cursor: default; }
.cf .cf-right { display: flex; flex-direction: column; gap: 8px; min-width: 0; }
.cf .cf-years { flex: 1 1 auto; display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 8px; }
.cf .cf-year { background: var(--sim-bg-surface); border: var(--sim-border); border-radius: var(--sim-radius-lg, 14px); padding: 6px 8px;
  display: grid; grid-template-columns: minmax(0, 1fr) 30px; grid-template-rows: auto auto auto 1fr auto; column-gap: 6px; }
.cf .cf-year[data-s="ok"] { border-color: color-mix(in oklab, var(--sim-series-3) 70%, var(--sim-label)); }
.cf .cf-year[data-s="out"] { border-color: var(--sim-bad); background: color-mix(in oklab, var(--sim-bad) 10%, var(--sim-bg-surface)); }
.cf .cf-year[data-s="none"] { opacity: 0.55; }
.cf .cf-yn { grid-column: 1 / 3; font: 800 19px/1.1 var(--sim-font); color: var(--sim-label); }
.cf .cf-cows { grid-column: 1; font: 800 17px/1.2 var(--sim-font); color: var(--sim-label); margin-top: 4px; }
.cf .cf-claim { grid-column: 1; font: 700 15px/1.2 var(--sim-font); color: var(--sim-label-muted); }
.cf .cf-claim b { display: block; font-weight: 800; font-size: 17px; color: var(--sim-bad); }
.cf .cf-meter { grid-column: 2; grid-row: 2 / 5; position: relative; border: 2px solid var(--sim-stroke); border-radius: 8px; overflow: hidden;
  background: color-mix(in oklab, var(--sim-label) 6%, var(--sim-bg-surface)); min-height: 90px; }
.cf .cf-fill { position: absolute; left: 0; right: 0; bottom: 0; background: var(--sim-series-3); transition: height 0.5s ease-out; }
.cf .cf-year[data-s="out"] .cf-fill { background: var(--sim-bad); }
.cf .cf-fund { grid-column: 1 / 3; font: 700 15px/1.2 var(--sim-font); color: var(--sim-label-muted); margin-top: 4px; }
.cf .cf-fund b { display: block; font-size: 19px; font-weight: 800; color: var(--sim-label); }
.cf .cf-year[data-s="out"] .cf-fund b { color: var(--sim-bad); }
.cf .cf-say { margin: 0; min-height: 48px; font: 800 18px/1.3 var(--sim-font); color: var(--sim-label-muted); display: flex; align-items: center; }
.cf .cf-say[data-tone="good"] { color: color-mix(in oklab, var(--sim-series-3) 62%, var(--sim-label)); }
.cf .cf-say[data-tone="bad"] { color: var(--sim-bad); }
.sim-dom-root--portrait .cf .gm-head { flex-wrap: wrap; gap: 4px 10px; }
.sim-dom-root--portrait .cf .gm-head .sub { flex-basis: 100%; }
.sim-dom-root--portrait .cf .cf-body { grid-template-columns: minmax(0, 1fr); }
.sim-dom-root--portrait .cf .cf-art { width: 220px; height: 58px; }
.sim-dom-root--portrait .cf .cf-years { grid-template-columns: minmax(0, 1fr); gap: 6px; }
.sim-dom-root--portrait .cf .cf-year { grid-template-columns: 58px minmax(0, 1fr) minmax(0, 1.15fr); grid-template-rows: auto auto; padding: 4px 8px; align-items: center; column-gap: 8px; }
.sim-dom-root--portrait .cf .cf-yn { grid-column: 1; grid-row: 1 / 3; font-size: 17px; }
.sim-dom-root--portrait .cf .cf-cows { grid-column: 2; grid-row: 1; margin: 0; font-size: 16px; }
.sim-dom-root--portrait .cf .cf-claim { grid-column: 2; grid-row: 2; }
.sim-dom-root--portrait .cf .cf-claim b { display: block; font-size: 15px; }
.sim-dom-root--portrait .cf .cf-meter { grid-column: 3; grid-row: 2; min-height: 14px; height: 14px; }
.sim-dom-root--portrait .cf .cf-fill { top: 0; right: auto; height: 100% !important; width: var(--w, 0%); transition: width 0.5s ease-out; }
.sim-dom-root--portrait .cf .cf-fund { grid-column: 3; grid-row: 1; margin: 0; }
.sim-dom-root--portrait .cf .cf-fund { white-space: nowrap; font-size: 14px; }
.sim-dom-root--portrait .cf .cf-fund b { display: inline; font-size: 15px; }
.sim-dom-root--portrait .cf .cf-say { font-size: 16px; text-align: center; justify-content: center; }
`;

export class CattleFundGame extends GameBoard {
  static CONTINUOUS = false;
  static OBJECTIVE = { prompt: { en: 'Set the yearly amount each farmer pays so the fund pays every claim for five years, and the amount stays below \u20b91,000.' } };
  static ARIA_LABEL = 'The village cattle fund. 200 dairy farmers each pay the same amount every year; the fund pays 25,000 rupees for each cow that dies. Set the yearly amount from 250 to 1,000 rupees in steps of 25, then run five years. Each year shows how many cows died, the claims, and the fund at the end of the year. You win when the fund pays every claim for five years and the amount stays below 1,000 rupees.';

  async setup() {
    this.resetAll();
    await super.setup();
    const years = DEATHS.map((_, i) => `<div class="cf-year" data-i="${i}">
        <span class="cf-yn">Year ${i + 1}</span>
        <span class="cf-cows">?</span>
        <span class="cf-claim"></span>
        <span class="cf-meter" aria-hidden="true"><span class="cf-fill" style="height:0%"></span></span>
        <span class="cf-fund"></span></div>`).join('');
    mountGame(this, {
      css: CSS, check: false,
      html: `<div class="gm cf"><div class="gm-head"><h2>The village cattle fund</h2><p class="sub">200 farmers. ${rs(PAY)} for each cow that dies. Made-up years.</p></div>
        <div class="cf-body">
          <div class="cf-set">
            <div class="cf-art"><canvas width="260" height="70"></canvas></div>
            <span class="cf-lab">each farmer pays, every year</span>
            <div class="cf-step"><button type="button" class="tap btn cf-pm" data-d="-1" aria-label="25 rupees less">-</button>
              <span class="cf-amt" aria-live="polite"></span>
              <button type="button" class="tap btn cf-pm" data-d="1" aria-label="25 rupees more">+</button></div>
            <span class="cf-in"></span>
            <button type="button" class="tap btn cf-go">Run five years</button>
          </div>
          <div class="cf-right"><div class="cf-years">${years}</div><p class="cf-say" aria-live="polite"></p></div>
        </div></div>`,
    });
    // One Quill only: mini-game@1 draws him in its verdict strip, so the frame's corner Quill goes (never on the board).
    this.quill?.destroy?.(); this.quill = null; this._scaleWrap?.classList.remove('gm-quill');
    this.root?.querySelectorAll?.('.cf-pm').forEach((b) => onTap(b, () => this.nudge(Number(b.dataset.d))));
    const go = this.root?.querySelector?.('.cf-go');
    if (go) onTap(go, () => this.go());
    this.paintCows();
    this.draw();
  }

  refreshTheme() { super.refreshTheme?.(); this.paintCows(); }

  /** Three cows in the pen (kit canvas art). */
  paintCows() {
    const el = this.root?.querySelector?.('.cf-art canvas');
    if (!el?.getContext) return;
    let c;
    try { c = loadColors(this.root); } catch (_) { return; }
    const w = 260, h = 70, dpr = Math.min(3, ((typeof window !== 'undefined' && window.devicePixelRatio) || 1) * 1.5);
    el.width = Math.round(w * dpr); el.height = Math.round(h * dpr);
    const ctx = el.getContext('2d');
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    try {
      drawAnimal(ctx, c, { x: 52, y: 64, length: 78, facing: 1, kind: 'cow', pose: 'graze' }, animalLook(c, 'cow', { mark: 'patches' }));
      drawAnimal(ctx, c, { x: 136, y: 64, length: 84, facing: -1, kind: 'cow', pose: 'stand' }, animalLook(c, 'cow', { mark: 'none' }));
      drawAnimal(ctx, c, { x: 214, y: 64, length: 76, facing: 1, kind: 'cow', pose: 'stand' }, animalLook(c, 'cow', { mark: 'patches' }));
    } catch (_) { /* a bad spec draws nothing rather than breaking the board */ }
  }

  resetAll() {
    for (const t of (this._cfTimers ?? []).splice(0)) clearTimeout(t);
    this._cfTimers = [];
    this.amount = A_START;
    this.res = null;        // runYears(amount) after a run
    this.shown = 0;         // year cards filled so far
    this.phase = 'set';     // set | run | done
    this.won = false;
  }

  nudge(d) {
    if (this.phase === 'run') return;
    const a = Math.max(A_MIN, Math.min(A_MAX, this.amount + d * A_STEP));
    if (a === this.amount) return;
    this.amount = a;
    this.res = null; this.shown = 0; this.phase = 'set';
    this.say('');
    this.draw();
  }

  draw() {
    const q = (s) => this.root?.querySelector(s);
    if (!q('.cf-years')) return;
    const lock = this.phase === 'run';
    q('.cf-amt').textContent = rs(this.amount);
    q('.cf-in').innerHTML = `200 x ${rs(this.amount)} =<br><b>${rs(FARMERS * this.amount)}</b> in each year`;
    this.root.querySelectorAll('.cf-pm').forEach((b) => {
      const end = (Number(b.dataset.d) < 0 && this.amount <= A_MIN) || (Number(b.dataset.d) > 0 && this.amount >= A_MAX);
      b.setAttribute('aria-disabled', String(lock || end));
    });
    q('.cf-go').setAttribute('aria-disabled', String(lock));
    DEATHS.forEach((_, i) => {
      const card = q(`.cf-year[data-i="${i}"]`), r = this.res?.[i], on = r && i < this.shown;
      const fill = card.querySelector('.cf-fill');
      if (!on) {
        card.querySelector('.cf-cows').textContent = '?';
        card.querySelector('.cf-claim').innerHTML = '';
        card.querySelector('.cf-fund').innerHTML = '';
        fill.style.height = '0%'; fill.style.setProperty('--w', '0%');
        if (this.phase === 'done' && this.res && i >= this.res.length) card.dataset.s = 'none'; else delete card.dataset.s;
        card.removeAttribute('aria-label');
        return;
      }
      const out = r.fund < 0;
      card.dataset.s = out ? 'out' : 'ok';
      card.querySelector('.cf-cows').textContent = `${r.deaths} cows died`;
      card.querySelector('.cf-claim').innerHTML = `claims <b>${rs(r.claims)}</b>`;
      card.querySelector('.cf-fund').innerHTML = out ? `fund <b>ran out</b>` : `fund <b>${rs(r.fund)}</b>`;
      const pct = out ? 100 : Math.max(2, Math.min(100, (r.fund / METER_MAX) * 100));
      fill.style.height = `${pct.toFixed(1)}%`; fill.style.setProperty('--w', `${pct.toFixed(1)}%`);
      card.setAttribute('aria-label', `Year ${i + 1}: ${r.deaths} cows died, claims ${rs(r.claims)}, ${out ? 'the fund ran out' : `fund ${rs(r.fund)}`}`);
    });
    this.relayout?.();
  }

  say(t, tone) {
    const el = this.root?.querySelector('.cf-say');
    if (!el) return;
    el.textContent = t;
    if (tone) el.dataset.tone = tone; else delete el.dataset.tone;
  }

  go() {
    if (this.phase === 'run') return;
    this.phase = 'run';
    this.res = runYears(this.amount);
    this.shown = 0;
    this.say('');
    const calm = globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (calm) { this.shown = this.res.length; this.judge(); return; }
    for (let y = 1; y <= this.res.length; y++) {
      this._cfTimers.push(setTimeout(() => { this.shown = y; if (y === this.res.length) this.judge(); else this.draw(); }, y * 600));
    }
    this.draw();
  }

  judge() {
    this.phase = 'done';
    const last = this.res[this.res.length - 1];
    if (last.fund < 0) {
      const y = this.res.length;
      this.say(`In year ${y} the fund ran out: ${last.deaths} cows died, ${rs(last.claims)} was needed.`, 'bad');
    } else if (this.amount >= SPARE) {
      this.say(`${rs(SPARE)} is more than a farmer can spare.`, 'bad');
    } else {
      this.won = true;
      this.say(`Every claim paid for five years at ${rs(this.amount)} a year. ${rs(last.fund)} is left in the fund.`, 'good');
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
    for (const t of (this._cfTimers ?? []).splice(0)) clearTimeout(t);
    super.destroy();
  }

  testState() {
    return { amount: this.amount, phase: this.phase, won: this.won, shown: this.shown, res: this.res?.map((r) => ({ ...r })) ?? null };
  }
}
