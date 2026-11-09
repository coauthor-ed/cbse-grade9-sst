// MajorityGatesGame - L04 coalition game. Three invented election results in a chamber of 543. Tap
// parties to pass 272, form the government, then tap the opposition: the largest group outside it.
// Parties are A to E with series tones: no real party, no real symbol.
// Control names: [data-party=A..E], [data-form], [data-next].
import { GameBoard, mountGame, finishGame, onTap } from 'simulations/base/kit/GameFrame.js';
import { burst, applyToneInks, SIM_LOOK_DOM_CSS } from 'simulations/base/kit/SimLookDom.js';
import { mountParliament } from 'simulations/base/kit/SimPicDom.js';

const NEED = 272;
const IDS = ['A', 'B', 'C', 'D', 'E'];
const TONE = { A: 1, B: 2, C: 3, D: 5, E: 7 };
const ROUNDS = [
  { seats: { A: 270, B: 150, C: 60, D: 40, E: 23 }, note: 'The largest party has 270 seats, which is not more than half.' },
  { seats: { A: 301, B: 120, C: 62, D: 40, E: 20 }, note: 'This time one party has more than half by itself.' },
  { seats: { A: 190, B: 175, C: 88, D: 55, E: 35 }, note: 'No party is close to 272, so partners are needed.' },
];

const CSS = `
.mj .kicker { display: none; }
.gm.mj { background: color-mix(in oklab, var(--sim-bg-surface) 90%, var(--sim-gold)); border-radius: var(--sim-radius-lg); }
.mj .sp-seat { transition-delay: 0ms; transition-duration: 0.2s; }
.mj .mj-board { flex: 1 1 auto; min-height: 0; display: grid; grid-template-columns: 400px minmax(0, 1fr); gap: 16px; align-items: start; }
.mj .sp-parl__svg { max-height: 214px; }
.mj .mj-hall { min-width: 0; }
.mj .mj-side { display: flex; flex-direction: column; gap: 8px; min-width: 0; }
.mj .mj-parties { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 8px; }
.mj .mj-party { --c: var(--sim-series-1); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0; min-height: 76px; padding: 4px 2px; border: calc(3px * var(--look-rim)) solid var(--c); border-radius: var(--sim-radius-md); background: var(--sim-bg-surface); font-family: var(--sim-font); box-shadow: 0 calc(3px * var(--look-lip)) 0 color-mix(in oklab, var(--c) 60%, var(--sim-label)); }
.mj .mj-party b { font: 700 22px/1.1 var(--sim-font-display, var(--sim-font)); }
.mj .mj-party i { font-style: normal; }
.mj .mj-party span { font: 800 15px var(--sim-font); color: var(--sim-label-muted); }
.mj .mj-party[aria-pressed="true"] { background: color-mix(in oklab, var(--c) 38%, var(--sim-bg-surface)); }
.mj .mj-party[data-opp="1"] { outline: 3px solid var(--sim-good); outline-offset: 1px; }
.mj .mj-party[data-bad="1"] { animation: mj-no 0.28s; }
.mj .mj-party[disabled] { cursor: default; }
.mj .mj-total { margin: 0; font: 700 26px/1.15 var(--sim-font-display, var(--sim-font)); }
.mj .mj-why { margin: 0; min-height: 42px; font: 700 15px/1.3 var(--sim-font); }
.mj .mj-why[data-ok="0"] { color: var(--sim-bad); }
.mj .mj-go { min-height: 50px; border: 0; border-radius: var(--sim-radius-md); background: var(--sim-accent); color: var(--sim-bg-deep); font-size: 16px; font-weight: 800; box-shadow: 0 var(--sim-lift) 0 color-mix(in oklab, var(--sim-accent) 65%, var(--sim-label)); }
.mj .mj-go[disabled] { background: var(--sim-track); color: var(--sim-label-muted); box-shadow: none; cursor: default; }
@keyframes mj-no { 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); } }
.sim-dom-root--portrait .mj .mj-board { display: flex; flex-direction: column; gap: 8px; }
.sim-dom-root--portrait .mj .mj-hall { width: 100%; }
.sim-dom-root--portrait .mj .mj-party { min-height: 68px; }
.sim-dom-root--portrait .mj .mj-party b { font-size: 24px; }
.sim-dom-root--portrait .mj .mj-party span { font-size: 17px; }
.sim-dom-root--portrait .mj .mj-party i { display: none; }
.sim-dom-root--portrait .gm.mj { padding: 6px 6px 8px; }
.sim-dom-root--portrait .mj .mj-total { font-size: 23px; }
.sim-dom-root--portrait .mj .sub { padding-right: 56px; }
@media (prefers-reduced-motion: reduce) { .mj .mj-party { animation: none !important; } }
`;

export class MajorityGatesGame extends GameBoard {
  static OBJECTIVE = { prompt: { en: 'Three election results. In each one, tap parties to reach 272 seats, then tap the opposition.' } };
  static ARIA_LABEL = 'A chamber of 543 seats and five parties, A to E. Tap parties to form a group of at least 272 seats, then tap the largest group outside it, which becomes the opposition.';

  async setup() {
    await super.setup();
    this.r = 0; this.join = new Set(); this.phase = 'form'; this.bad = null; this.won = false;
    mountGame(this, { check: false, css: SIM_LOOK_DOM_CSS + CSS, html: `<div class="gm mj"><div class="gm-head"><p class="kicker">Forming a government</p>
      <h2 data-title></h2><p class="sub" data-sub></p></div>
      <div class="mj-board"><div class="mj-hall" data-hall></div><div class="mj-side">
      <div class="mj-parties">${IDS.map((p) => `<button type="button" class="tap mj-party" data-party="${p}" style="--c:var(--sim-series-${TONE[p]})" aria-pressed="false"><b><i>Party </i>${p}</b><span data-n="${p}"></span></button>`).join('')}</div>
      <p class="mj-total" data-total aria-live="polite"></p><p class="mj-why" data-why aria-live="polite"></p>
      <button type="button" class="tap mj-go" data-form>Form the government</button>
      <button type="button" class="tap mj-go" data-next hidden>Next result</button></div></div></div>` });
    const host = this.root.querySelector('[data-hall]');
    if (!host) return;
    this.hall = mountParliament(host, { key: 'below' });
    this.root.querySelectorAll('[data-party]').forEach((b) => onTap(b, () => this.tap(b.dataset.party)));
    onTap(this.root.querySelector('[data-form]'), () => this.form());
    onTap(this.root.querySelector('[data-next]'), () => this.next());
    this.paint();
  }

  sum() { let n = 0; for (const p of this.join) n += ROUNDS[this.r].seats[p]; return n; }

  tap(p) {
    if (this.phase === 'form') {
      if (this.join.has(p)) this.join.delete(p); else this.join.add(p);
      this.why = ''; this.ok = null;
    } else if (this.phase === 'opp') {
      if (this.join.has(p)) return;
      const out = IDS.filter((x) => !this.join.has(x)), S = ROUNDS[this.r].seats, top = out.reduce((a, b) => (S[b] > S[a] ? b : a));
      if (p === top) {
        this.opp = p; this.phase = 'done'; this.bad = null; this.ok = true;
        this.why = `Party ${p} has ${S[p]} seats, the most outside the government, so it is the opposition.`;
        burst(this.root.querySelector(`[data-party="${p}"]`));
      } else {
        this.bad = p; this.ok = false;
        this.why = `Party ${p} has ${S[p]} seats. Look for a larger group outside the government.`;
      }
    }
    this.paint();
  }

  form() {
    if (this.phase !== 'form') return;
    const n = this.sum();
    if (n < NEED) return;
    if (this.join.size === IDS.length) { this.ok = false; this.why = 'With every party inside, nobody is left to oppose. Leave at least one party out.'; this.paint(); return; }
    this.phase = 'opp'; this.ok = null;
    this.why = 'Government formed. Now tap the largest group outside it.';
    this.paint();
  }

  next() {
    if (this.phase !== 'done') return;
    if (this.r >= ROUNDS.length - 1) { this.won = true; finishGame(this); this.paint(); return; }
    this.r += 1; this.join = new Set(); this.phase = 'form'; this.why = ''; this.ok = null; this.bad = null; this.opp = null;
    this.paint();
  }

  checkObjective() { return this.won ? { ok: true } : null; }

  paint() {
    const R = ROUNDS[this.r], S = R.seats, q = (s) => this.root.querySelector(s), n = this.sum();
    q('[data-title]').textContent = `Election result ${this.r + 1} of ${ROUNDS.length}`;
    q('[data-sub]').textContent = R.note;
    const order = [...IDS.filter((p) => this.join.has(p)), ...IDS.filter((p) => !this.join.has(p))];
    this.hall.set({ seats: order.flatMap((p) => Array(S[p]).fill(TONE[p])), need: NEED, total: 543, key: [] });
    IDS.forEach((p) => {
      const b = q(`[data-party="${p}"]`);
      q(`[data-n="${p}"]`).innerHTML = `${S[p]}<i> seats</i>`;
      b.setAttribute('aria-label', `Party ${p}, ${S[p]} seats`);
      b.setAttribute('aria-pressed', this.join.has(p) ? 'true' : 'false');
      b.dataset.opp = this.opp === p ? '1' : '0';
      b.dataset.bad = this.bad === p ? '1' : '0';
      b.disabled = this.phase === 'done' || (this.phase === 'opp' && this.join.has(p));
    });
    q('[data-total]').textContent = n >= NEED ? `${n} of 543 seats: a majority` : `${n} of 543 seats: ${NEED - n} short`;
    const why = q('[data-why]');
    why.textContent = this.why ?? '';
    if (this.ok === false) why.dataset.ok = '0'; else why.removeAttribute('data-ok');
    const form = q('[data-form]'), nx = q('[data-next]');
    form.hidden = this.phase !== 'form'; form.disabled = n < NEED;
    nx.hidden = this.phase !== 'done'; nx.textContent = this.r >= ROUNDS.length - 1 ? 'Finish' : 'Next result';
    applyToneInks(this.root);
    this.relayout?.();
  }
}
