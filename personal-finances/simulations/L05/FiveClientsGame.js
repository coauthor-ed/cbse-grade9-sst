// FiveClientsGame - L05 mini-game (blk-l05-s05): choose a fixed deposit, a bond, a mutual fund or shares for each of
//   five people, then test the plan on three made-up market paths (A steady, B early dip, C slow).
//   Model kept exactly from AdviseTheSaversGameScene.js (CLIENTS, PLACES, SHORT_FACTORS, LONG_FACTORS, targetOf,
//   endingOf). Checked with node: Aarav, Ritu and the farmer fit only a fixed deposit (a bond sold early gives
//   back 98%: Rs 49,000 / 24,500 / 39,200; mutual fund and shares fall short on path B); the teacher (5 years,
//   target Rs 1,33,823 = Rs 1,00,000 grown 6% a year) fits only a bond (Rs 1,37,009; fixed deposit Rs 1,30,696
//   is short; mutual fund path B Rs 1,28,400; shares path B Rs 1,31,739); the parent (15 years, target
//   Rs 4,79,312) fits a bond, a mutual fund or shares (fixed deposit Rs 4,46,495 is short).
//   The board: five client cards (name, goal, amount, date, what they need on the day) with four place chips each
//   (the order of the four is shuffled once per game, the same on every card); "Test on 3 market paths" fills the
//   A, B, C result cells one path at a time (0.5 s each): a tick or "short". Not-yet lines name the client and the
//   reason. checkObjective is real: 5 of 5 on all three paths (finishGame). The chips never show the result.
// Tokens only. ASCII only.
import { GameBoard, mountGame, finishGame, onTap } from 'simulations/base/kit/GameFrame.js';
import { MONEY_CSS, rs } from '../shared/MoneyKit.js';

const POW = (b, e) => Math.pow(b, e);
const CLIENTS = [
  { id: 'aarav', name: 'Aarav', goal: 'college fee', amount: 50000, due: 'in 3 months', hz: 'm3' },
  { id: 'ritu', name: 'Ritu', goal: 'school fees', amount: 25000, due: 'in 6 months', hz: 'm6' },
  { id: 'farmer', name: 'the farmer', goal: 'emergency cash', amount: 40000, due: 'any week', hz: 'wk' },
  { id: 'teacher', name: 'the teacher', goal: 'house repair', amount: 100000, due: 'in 5 years', hz: 'y5' },
  { id: 'parent', name: 'the parent', goal: "daughter's college", amount: 200000, due: 'in 15 years', hz: 'y15' },
];
const PLACES = [
  { id: 'fd', label: 'fixed deposit' },
  { id: 'bond', label: 'bond' },
  { id: 'mf', label: 'mutual fund' },
  { id: 'shares', label: 'shares' },
];
const SHORT_FACTORS = {
  fd: { m3: [1.014, 1.014, 1.014], m6: [1.028, 1.028, 1.028], wk: [1.001, 1.001, 1.001] },
  bond: { m3: [0.98, 0.98, 0.98], m6: [0.98, 0.98, 0.98], wk: [0.98, 0.98, 0.98] },
  mf: { m3: [1.05, 0.96, 1.02], m6: [1.09, 0.94, 1.03], wk: [1.02, 0.9, 1.0] },
  shares: { m3: [1.08, 0.88, 1.03], m6: [1.12, 0.86, 1.04], wk: [1.03, 0.85, 0.99] },
};
const LONG_FACTORS = {
  fd: { y5: [POW(1.055, 5), POW(1.055, 5), POW(1.055, 5)], y15: [POW(1.055, 15), POW(1.055, 15), POW(1.055, 15)] },
  bond: { y5: [POW(1.065, 5), POW(1.065, 5), POW(1.065, 5)], y15: [POW(1.065, 15), POW(1.065, 15), POW(1.065, 15)] },
  mf: { y5: [POW(1.12, 5), 1.284, POW(1.08, 5)], y15: [POW(1.12, 15), 1.284 * POW(1.12, 10), POW(1.1, 15)] },
  shares: { y5: [POW(1.14, 5), POW(1.14, 4) * 0.78, POW(1.1, 5)], y15: [POW(1.14, 15), POW(1.14, 14) * 0.78, POW(1.1, 15)] },
};
function targetOf(c) {
  if (c.hz === 'y5') return Math.round(c.amount * POW(1.06, 5));
  if (c.hz === 'y15') return Math.round(c.amount * POW(1.06, 15));
  return c.amount;
}
function endingOf(placeId, client, pathIdx) {
  const table = SHORT_FACTORS[placeId][client.hz] || LONG_FACTORS[placeId][client.hz];
  return Math.round(client.amount * table[pathIdx]);
}
const PATHS = ['A', 'B', 'C'];
const PATH_NAME = ['steady', 'early dip', 'slow'];
const LONG = (c) => c.hz === 'y5' || c.hz === 'y15';
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const placeName = (id) => PLACES.find((p) => p.id === id).label;

/** The not-yet reason for one client whose place failed (results = three endings). */
function reasonOf(c, placeId, res) {
  const t = targetOf(c);
  const j = res.findIndex((v) => v < t);
  const who = c.name, poss = `${c.name}'s`;
  if (LONG(c) && placeId === 'fd') return `${cap(poss)} ${rs(res[0])} is short of ${rs(t)}: prices grew faster.`;
  if (!LONG(c) && placeId === 'bond') {
    const when = c.hz === 'wk' ? 'cash any week' : `the money ${c.due}`;
    return `${cap(who)} needs ${when}; a bond sold early gave back ${rs(res[0])}.`;
  }
  return `In path ${PATHS[j]} (${PATH_NAME[j]}), ${poss} ${placeName(placeId)} had ${rs(res[j])}, short of ${rs(t)}.`;
}

const TICK = '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" style="fill:none;stroke:currentColor;stroke-width:3.6;stroke-linecap:round;stroke-linejoin:round"/></svg>';

const CSS = MONEY_CSS + `
.fc { background: var(--sim-bg-deep); border-radius: var(--sim-radius-md, 12px); }
.fc .gm-head { display: flex; align-items: baseline; gap: 16px; max-width: none; }
.fc .gm-head h2 { white-space: nowrap; }
.fc .fc-cards { flex: 1 1 auto; min-height: 0; display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 8px; }
.fc .fc-card { background: var(--sim-bg-surface); border: var(--sim-border); border-radius: var(--sim-radius-lg, 14px); padding: 6px 8px 8px;
  display: flex; flex-direction: column; gap: 4px; position: relative; }
.fc .fc-card[data-ok="1"] { border-color: color-mix(in oklab, var(--sim-series-3) 70%, var(--sim-label)); }
.fc .fc-card[data-ok="0"] { border-color: var(--sim-bad); }
.fc .fc-name { font: 800 19px/1.1 var(--sim-font); color: var(--sim-label); }
.fc .fc-goal { font: 700 15px/1.2 var(--sim-font); color: var(--sim-label-muted); }
.fc .fc-goal b { color: var(--sim-label); font-weight: 800; }
.fc .fc-need { font: 800 15px/1.2 var(--sim-font); color: var(--sim-label); }
.fc .fc-chips { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 5px; margin-top: 2px; }
.fc .fc-chip { min-height: 44px; padding: 2px 4px; font: 800 15px/1.05 var(--sim-font); text-align: center; border-radius: var(--sim-radius-md, 12px); }
.fc .fc-chip[aria-pressed="true"] { background: var(--sim-accent); color: var(--sim-bg-deep); border-color: color-mix(in oklab, var(--sim-accent) 70%, black);
  box-shadow: 0 var(--sim-lift) 0 color-mix(in oklab, var(--sim-accent) 60%, black); }
.fc .fc-chip[aria-disabled="true"] { cursor: default; }
.fc .fc-res { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 4px; margin-top: auto; }
.fc .fc-cell { min-height: 34px; display: flex; align-items: center; justify-content: center; gap: 3px; border-radius: 9px;
  background: color-mix(in oklab, var(--sim-label) 7%, var(--sim-bg-surface)); font: 800 15px/1 var(--sim-font); color: var(--sim-label-muted); }
.fc .fc-cell[data-r="ok"] { background: color-mix(in oklab, var(--sim-series-3) 26%, var(--sim-bg-surface)); color: color-mix(in oklab, var(--sim-series-3) 55%, var(--sim-label)); }
.fc .fc-cell[data-r="short"] { background: color-mix(in oklab, var(--sim-bad) 20%, var(--sim-bg-surface)); color: var(--sim-bad); }
.fc .fc-act { display: flex; align-items: center; gap: 14px; min-height: 54px; }
.fc .fc-say { flex: 1 1 auto; margin: 0; font: 800 18px/1.3 var(--sim-font); color: var(--sim-label-muted); }
.fc .fc-say[data-tone="good"] { color: color-mix(in oklab, var(--sim-series-3) 62%, var(--sim-label)); }
.fc .fc-say[data-tone="bad"] { color: var(--sim-bad); }
.fc .fc-go { flex: none; min-width: 250px; min-height: 52px; font: 800 20px/1 var(--sim-font); background: var(--sim-accent); color: var(--sim-bg-deep);
  border-color: color-mix(in oklab, var(--sim-accent) 70%, black); box-shadow: 0 var(--sim-lift) 0 color-mix(in oklab, var(--sim-accent) 60%, black); }
.fc .fc-go[aria-disabled="true"] { background: var(--sim-bg-surface); color: var(--sim-label-muted); border-color: var(--sim-stroke); box-shadow: 0 var(--sim-lift) 0 var(--sim-stroke); cursor: default; }
.sim-dom-root--portrait .fc .gm-head { flex-wrap: wrap; gap: 4px 10px; }
.sim-dom-root--portrait .fc .gm-head .sub { flex-basis: 100%; }
.sim-dom-root--portrait .fc .fc-cards { grid-template-columns: minmax(0, 1fr); gap: 8px; }
.sim-dom-root--portrait .fc .fc-chips { grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 4px; }
.sim-dom-root--portrait .fc .fc-chip { min-height: 48px; font-size: 15px; padding: 2px; }
.sim-dom-root--portrait .fc .fc-act { flex-direction: column; align-items: stretch; gap: 8px; }
.sim-dom-root--portrait .fc .fc-say { font-size: 16px; text-align: center; min-height: 42px; }
.sim-dom-root--portrait .fc .fc-go { width: 100%; min-width: 0; }
`;

export class FiveClientsGame extends GameBoard {
  static CONTINUOUS = false;
  static OBJECTIVE = { prompt: { en: 'Choose a place for each of the five people so that each has the full amount on their date in all three market paths, and the two long goals grow faster than prices.' } };
  static ARIA_LABEL = 'Five people and the date each needs their money: Aarav, a college fee of 50,000 rupees in 3 months; Ritu, school fees of 25,000 rupees in 6 months; a farmer, 40,000 rupees of emergency cash any week; a teacher, a house repair in 5 years from 1,00,000 rupees; a parent, a daughter\u2019s college in 15 years from 2,00,000 rupees. Choose a fixed deposit, a bond, a mutual fund or shares for each, then test the plan on three made-up market paths: A steady, B an early dip, C slow. You win when everyone has the full amount on their date in every path, and the two long goals grow faster than prices.';

  async setup() {
    this.resetAll();
    await super.setup();
    const order = PLACES.map((p) => p.id);
    for (let i = order.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [order[i], order[j]] = [order[j], order[i]]; }
    this.order = order;
    const cards = CLIENTS.map((c, i) => `<div class="fc-card" data-i="${i}">
        <span class="fc-name">${cap(c.name)}</span>
        <span class="fc-goal">${c.goal}</span>
        <span class="fc-goal"><b>${rs(c.amount)}</b>, ${c.due}</span>
        <span class="fc-need">${LONG(c) ? `needs ${rs(targetOf(c))}` : 'needs all of it'}</span>
        <span class="fc-chips">${order.map((id) => `<button type="button" class="tap btn fc-chip" data-i="${i}" data-p="${id}" aria-pressed="false">${placeName(id)}</button>`).join('')}</span>
        <span class="fc-res">${PATHS.map((p, j) => `<span class="fc-cell" data-i="${i}" data-j="${j}">${p}</span>`).join('')}</span></div>`).join('');
    mountGame(this, {
      css: CSS, check: false,
      html: `<div class="gm fc"><div class="gm-head"><h2>Five people, five dates</h2><p class="sub">One place each. Paths: A steady, B early dip, C slow. Made-up returns; prices grow 6% a year.</p></div>
        <div class="fc-cards">${cards}</div>
        <div class="fc-act"><p class="fc-say" aria-live="polite"></p><button type="button" class="tap btn fc-go">Test on 3 market paths</button></div></div>`,
    });
    // One Quill only: mini-game@1 draws him in its verdict strip, so the frame's corner Quill goes (never on the board).
    this.quill?.destroy?.(); this.quill = null; this._scaleWrap?.classList.remove('gm-quill');
    this.root?.querySelectorAll?.('.fc-chip').forEach((b) => onTap(b, () => this.choose(Number(b.dataset.i), b.dataset.p)));
    const go = this.root?.querySelector?.('.fc-go');
    if (go) onTap(go, () => this.go());
    this.draw();
  }

  resetAll() {
    for (const t of (this._fcTimers ?? []).splice(0)) clearTimeout(t);
    this._fcTimers = [];
    this.pick = CLIENTS.map(() => null);
    this.res = CLIENTS.map(() => null);   // three endings per client, after a test
    this.shown = 0;                        // paths shown in the current test (0..3)
    this.phase = 'pick';                   // pick | run | done
    this.won = false;
  }

  choose(i, id) {
    if (this.phase === 'run' || i < 0 || i >= CLIENTS.length) return;
    this.pick[i] = id;
    this.res[i] = null;
    if (this.phase === 'done') this.phase = 'pick';
    this.say('');
    this.draw();
  }

  okOf(i) {
    const r = this.res[i];
    return r ? r.every((v) => v >= targetOf(CLIENTS[i])) : null;
  }

  draw() {
    const q = (s) => this.root?.querySelector(s);
    if (!q('.fc-cards')) return;
    const lock = this.phase === 'run';
    CLIENTS.forEach((c, i) => {
      const card = q(`.fc-card[data-i="${i}"]`);
      card.querySelectorAll('.fc-chip').forEach((b) => {
        b.setAttribute('aria-pressed', String(this.pick[i] === b.dataset.p));
        b.setAttribute('aria-disabled', String(lock));
      });
      const r = this.res[i], t = targetOf(c);
      card.querySelectorAll('.fc-cell').forEach((cell) => {
        const j = Number(cell.dataset.j), on = r && j < this.shown;
        if (!on) { cell.innerHTML = PATHS[j]; delete cell.dataset.r; cell.removeAttribute('aria-label'); return; }
        const ok = r[j] >= t;
        cell.dataset.r = ok ? 'ok' : 'short';
        cell.innerHTML = ok ? `${PATHS[j]} ${TICK}` : `${PATHS[j]} short`;
        cell.setAttribute('aria-label', `path ${PATHS[j]}: ${rs(r[j])}, ${ok ? 'enough' : 'short'}`);
      });
      const done = this.phase === 'done' && r;
      if (done) card.dataset.ok = this.okOf(i) ? '1' : '0'; else delete card.dataset.ok;
    });
    q('.fc-go').setAttribute('aria-disabled', String(lock));
    this.relayout?.();
  }

  say(t, tone) {
    const el = this.root?.querySelector('.fc-say');
    if (!el) return;
    el.textContent = t;
    if (tone) el.dataset.tone = tone; else delete el.dataset.tone;
  }

  go() {
    if (this.phase === 'run') return;
    const miss = this.pick.findIndex((p) => !p);
    if (miss >= 0) { this.say(`Choose a place for ${CLIENTS[miss].name} first.`, 'bad'); return; }
    this.phase = 'run';
    this.res = CLIENTS.map((c, i) => [0, 1, 2].map((j) => endingOf(this.pick[i], c, j)));
    this.shown = 0;
    this.say('');
    const calm = globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (calm) { this.shown = 3; this.judge(); return; }
    for (let j = 1; j <= 3; j++) {
      this._fcTimers.push(setTimeout(() => { this.shown = j; if (j === 3) this.judge(); else this.draw(); }, j * 500));
    }
    this.draw();
  }

  judge() {
    this.phase = 'done';
    const okN = CLIENTS.filter((_, i) => this.okOf(i)).length;
    if (okN === CLIENTS.length) {
      this.won = true;
      this.say('5 of 5: everyone has the full amount on their date, on every path.', 'good');
      finishGame(this);
    } else {
      const i = CLIENTS.findIndex((_, k) => !this.okOf(k));
      this.say(`${okN} of 5 covered. ${reasonOf(CLIENTS[i], this.pick[i], this.res[i])}`, 'bad');
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
    for (const t of (this._fcTimers ?? []).splice(0)) clearTimeout(t);
    super.destroy();
  }

  testState() {
    return { pick: this.pick.slice(), phase: this.phase, won: this.won, shown: this.shown, res: this.res.map((r) => r?.slice() ?? null), targets: CLIENTS.map(targetOf), order: this.order?.slice() };
  }
}
