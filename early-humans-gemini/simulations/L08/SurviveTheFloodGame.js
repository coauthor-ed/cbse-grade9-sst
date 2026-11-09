/**
 * SurviveTheFloodGame - mini-game for les-08 (blk-l08-game). Six river events, shuffled. Each turn the learner builds
 * one canal or one dam, then the event comes. A flood needs one dam (a Great Flood two). A dry spell needs one canal (a
 * Long Dry Spell two). Each miss loses a field; three misses start the settlement over. The rule is on the screen.
 * The win: six turns with one field lost at most. The next event is on the screen, and an order is dealt only if building for what is next can win. Base chain: DomSimulation via GameBoard.
 */
import { GameBoard, mountGame, onTap } from 'simulations/base/kit/GameFrame.js';

const ROUNDS = 6, MAX_LOST = 3;
const POOL = [
  { kind: 'flood', need: 1, name: 'Flood' }, { kind: 'flood', need: 1, name: 'Flood' }, { kind: 'flood', need: 2, name: 'Great Flood' },
  { kind: 'dry', need: 1, name: 'Dry spell' }, { kind: 'dry', need: 1, name: 'Dry spell' }, { kind: 'dry', need: 2, name: 'Long dry spell' },
];
const shuffled = () => { const a = [...POOL]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
// Plays an order by building for the event on screen. 12 of the 180 orders lose two fields this way: they are not dealt.
const lostByForecast = (order) => {
  let dam = 0, canal = 0, lost = 0;
  for (const ev of order) {
    const need = (ev.kind === 'flood' ? dam : canal) < ev.need;
    if (need ? ev.kind === 'flood' : dam <= canal) dam += 1; else canal += 1;
    if ((ev.kind === 'flood' ? dam : canal) < ev.need) lost += 1;
  }
  return lost;
};
const dealt = () => { let a = shuffled(); while (lostByForecast(a) > 1) a = shuffled(); return a; };

const CSS = `
.gm.stf { background: var(--sim-bg-deep); border-radius: 14px; }
.stf .stf-board { display: grid; grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr); gap: 16px; flex: 1 1 auto; min-height: 0; }
.stf .stf-river { position: relative; min-height: 120px; border-radius: var(--sim-radius-md); overflow: hidden; background: var(--sim-strata-1); border: calc(2px * var(--look-rim)) solid var(--sim-stroke); }
.stf .stf-water { position: absolute; left: 0; right: 0; bottom: 0; background: var(--sim-sea-shallow); transition: height 0.6s var(--look-spring-soft); }
.stf .stf-event { position: absolute; left: 8px; right: 8px; top: 8px; text-align: center; font: 700 19px/1.2 var(--sim-font-display, var(--sim-font)); color: var(--sim-label); background: var(--sim-bg-surface); border-radius: var(--sim-radius-sm); padding: 4px 8px; }
.stf .stf-side { display: flex; flex-direction: column; gap: 10px; min-width: 0; }
.stf .stf-rule { margin: 0; font-size: 15px; font-weight: 700; line-height: 1.25; color: var(--sim-label); }
.stf .stf-acts { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 10px; }
.stf .stf-act { appearance: none; min-height: 60px; padding: 6px; cursor: pointer; font: 700 18px/1.15 var(--sim-font-display, var(--sim-font)); color: var(--sim-label); background: var(--sim-bg-surface); border: calc(2px * var(--look-rim)) solid var(--sim-stroke); border-radius: var(--sim-radius-md); box-shadow: 0 calc(3px * var(--look-lip)) 0 var(--sim-stroke); }
.stf .stf-act b { display: block; font: 800 15px/1.2 var(--sim-font); color: var(--sim-label-muted); }
.stf .stf-act:disabled { opacity: 0.5; cursor: default; }
.stf .stf-stat { display: flex; justify-content: space-between; gap: 10px; font-size: 16px; font-weight: 800; color: var(--sim-label); }
.stf .stf-next { position: absolute; left: 8px; right: 8px; bottom: 8px; margin: 0; text-align: center; font: 700 19px/1.2 var(--sim-font-display, var(--sim-font)); color: var(--sim-label); background: var(--sim-bg-surface); border-radius: var(--sim-radius-md); padding: 3px 6px; }
.stf .stf-say { margin: 0; min-height: 40px; font-size: 15px; font-weight: 700; line-height: 1.25; color: var(--sim-label); }
.sim-dom-root--portrait .stf .stf-board { display: flex; flex-direction: column; gap: 10px; }
`;

export class SurviveTheFloodGame extends GameBoard {
  static ARIA_LABEL = 'Six river events in a random order. Each turn, build a canal or a dam. A flood needs a dam and a dry spell needs a canal; the big events need two.';
  static OBJECTIVE = { prompt: { en: 'Six river events are coming, in a random order. You can see the next one. Build one canal or one dam each turn, and lose at most one field.' } };

  _reset() { this.ev = dealt(); this.turn = 0; this.lost = 0; this.canal = 0; this.dam = 0; this.last = null; }

  async setup() {
    await super.setup();
    this._reset();
    mountGame(this, { css: CSS, check: { label: 'Check my answer', in: '.stf-foot' }, html: `<div class="gm stf">
      <div class="gm-head"><p class="kicker">A plain with an unreliable river</p><h2>Build ahead of the <b>river</b></h2></div>
      <div class="stf-board">
        <div class="stf-river"><div class="stf-water"></div><div class="stf-event" aria-live="polite"></div><p class="stf-next" aria-live="polite"></p></div>
        <div class="stf-side">
          <p class="stf-rule">A flood needs a dam. A dry spell needs a canal. A big event needs two.</p>
          <div class="stf-acts"><button type="button" class="stf-act" data-a="canal">Build a canal<b data-c="canal">0 built</b></button><button type="button" class="stf-act" data-a="dam">Build a dam<b data-c="dam">0 built</b></button></div>
          <div class="stf-stat"><span class="stf-turn"></span><span class="stf-lost"></span></div>
          <p class="stf-say"></p>
        </div>
      </div><div class="stf-foot"></div></div>` });
    for (const el of this.root.querySelectorAll('.stf-act')) onTap(el, () => { if (!el.disabled) this._build(el.dataset.a); });
    this._show();
  }

  _build(kind) {
    if (this.turn >= ROUNDS) return;
    if (kind === 'canal') this.canal += 1; else this.dam += 1;
    const ev = this.ev[this.turn], have = ev.kind === 'flood' ? this.dam : this.canal, ok = have >= ev.need;
    if (!ok) this.lost += 1;
    this.turn += 1;
    this.last = { ev, ok };
    const over = this.lost >= MAX_LOST;
    if (over) this._reset();
    this.restart = over;
    this._show();
  }

  _show() {
    const q = (s) => this.root.querySelector(s), set = (s, t) => { const e = q(s); if (e) e.textContent = t; };
    const done = this.turn >= ROUNDS, { last } = this;
    set('.stf-turn', `Turn ${Math.min(this.turn + 1, ROUNDS)} of ${ROUNDS}`);
    set('.stf-lost', `Fields lost: ${this.lost}`);
    const nx = this.ev[this.turn];
    set('.stf-next', nx ? `Next: ${nx.name}` : 'No more events');
    set('[data-c="canal"]', `${this.canal} built`);
    set('[data-c="dam"]', `${this.dam} built`);
    for (const b of this.root.querySelectorAll('.stf-act')) b.disabled = done;
    const lvl = !last ? 40 : last.ev.kind === 'flood' ? (last.ev.need > 1 ? 82 : 66) : last.ev.need > 1 ? 8 : 20;
    const w = q('.stf-water'); if (w) w.style.height = `${lvl}%`;
    set('.stf-event', last ? `${last.ev.name}: ${last.ok ? 'held' : 'a field is lost'}` : 'The river is calm');
    let say = 'Water reaches fields through canals. Dams hold water back.';
    if (this.restart) say = 'Three fields lost. The settlement starts again, so get one of each built early.';
    else if (last) say = last.ok ? (last.ev.kind === 'flood' ? 'Your dams held the water back.' : 'Your canals kept the fields wet.') : (last.ev.kind === 'flood' ? 'Not enough dams built yet.' : 'Not enough canals built yet.');
    if (done) say = 'All six turns are over. Press Check.';
    set('.stf-say', say);
  }

  checkObjective() {
    if (this.turn < ROUNDS) return { ok: false, hint: `Finish all ${ROUNDS} turns first.` };
    if (this.lost <= 1 && this.canal > 0 && this.dam > 0) return { ok: true };
    const hint = 'More than one field was lost. Try again: build one of each early, then a second of each.';
    this._reset(); this.restart = false; this._show();
    return { ok: false, hint };
  }
}
