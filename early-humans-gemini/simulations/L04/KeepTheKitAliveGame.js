/**
 * KeepTheKitAliveGame - mini-game for les-04. Five hunts, one spare handle. A hunt dulls one blade. Swapping the
 * blade keeps the tool. Scrapping the handle spends the only spare, stops the run with the reason, and offers a
 * fresh try: that is the slide's point, replace a part and not the whole tool.
 */
import { GameBoard, mountGame, onTap, finishGame } from 'simulations/base/kit/GameFrame.js';

const HUNTS = 5;
const N = 8;

const CSS = `
.gm.ktk { background: var(--sim-bg-surface); border-radius: 14px; }
.ktk .stats { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
.ktk .stat { background: var(--sim-bg-surface); border: var(--sim-border); border-radius: var(--sim-radius-lg); text-align: center; padding: 4px 6px; }
.ktk .n { display: block; font-family: var(--sim-font-display); font-size: 26px; font-weight: 700; color: var(--sim-accent); line-height: 1.15; }
.ktk .lbl { font-size: 14px; font-weight: 700; color: var(--sim-label-muted); }
.ktk .tool { display: flex; align-items: flex-end; justify-content: center; padding: 26px 6px 10px; }
.ktk .haft { position: relative; flex: 1; max-width: 640px; height: 38px; border-radius: 19px 8px 8px 19px;
  background: color-mix(in srgb, var(--sim-strata-3) 74%, var(--sim-series-8)); border: 3px solid color-mix(in srgb, var(--sim-strata-3) 50%, var(--sim-label)); }
.ktk .edge { position: absolute; left: 34px; right: 10px; top: -26px; display: grid; grid-template-columns: repeat(${N}, 1fr); gap: 2px; align-items: end; height: 32px; }
.ktk .bl { height: 100%; background: var(--sim-strata-6); clip-path: polygon(0 100%, 6% 22%, 45% 0, 96% 16%, 100% 100%); }
.ktk .bl[data-worn="1"] { height: 54%; background: var(--sim-bad); }
.ktk .acts { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; }
.ktk .acts .btn { min-height: 52px; font-size: 16px; line-height: 1.15; }
.ktk .acts .btn[disabled] { opacity: 0.4; }
.ktk .acts .btn[hidden] { display: none; }
.ktk .acts .again { grid-column: 1 / -1; }
.ktk .say { margin: 0; min-height: 44px; font-size: 16px; font-weight: 700; line-height: 1.25; }
.ktk .say[data-ok="0"] { color: var(--sim-bad); }
.sim-dom-root--portrait .ktk .acts { grid-template-columns: minmax(0, 1fr); }
`;

export class KeepTheKitAliveGame extends GameBoard {
  static simId = 'keep-the-kit-alive-game';
  static label = { en: 'Keep the Kit Alive' };
  static category = 'social-science.history';
  static ARIA_LABEL = 'A handle with a row of blades. Run five hunts by choosing to swap the dull blade, or to scrap the handle and make a new one. There is only one spare handle.';
  static OBJECTIVE = { prompt: { en: 'Finish 5 hunts. There is only one spare handle in the kit. Keep it.' } };

  constructor(container, config) {
    super(container, config);
    this.huntsDone = 0;
    this.spareUsed = 0;
    this.dull = -1;
  }

  async setup() {
    await super.setup();
    mountGame(this, {
      css: CSS,
      html: `<div class="gm ktk">
        <div class="gm-head"><p class="kicker">Challenge</p><h2>Five hunts, one spare handle</h2><p class="sub">Each hunt dulls one blade. What do you replace?</p></div>
        <div class="stats">
          <div class="stat"><span class="n" data-hunts>0 / ${HUNTS}</span><span class="lbl">hunts done</span></div>
          <div class="stat"><span class="n" data-wood>1</span><span class="lbl">spare handle</span></div>
        </div>
        <div class="tool"><div class="haft"><div class="edge">${Array.from({ length: N }, (_, i) => `<i class="bl" data-i="${i}"></i>`).join('')}</div></div></div>
        <div class="acts">
          <div class="btn tap" role="button" tabindex="0" data-act="hunt">Go on a hunt</div>
          <div class="btn tap" role="button" tabindex="0" data-act="swap">Swap the blade</div>
          <div class="btn tap" role="button" tabindex="0" data-act="scrap">Scrap the handle</div>
          <div class="btn tap again" role="button" tabindex="0" data-act="again" hidden>Try again</div>
        </div>
        <p class="say" data-say></p>
      </div>`,
      check: false,
    });
    for (const [a, fn] of [['hunt', () => this._hunt()], ['swap', () => this._swap()], ['scrap', () => this._scrap()], ['again', () => this.resetChallenge()]]) { const el = this.root.querySelector(`[data-act="${a}"]`); if (el) onTap(el, fn); }
    this._sync('Go on your first hunt.');
    this.quill.speak('Replace a part, or the whole tool?', 5000);
  }

  _sync(say, ok) {
    const $ = (s) => this.root.querySelector(s);
    if (!$('[data-say]')) return;
    $('[data-hunts]').textContent = `${this.huntsDone} / ${HUNTS}`;
    $('[data-wood]').textContent = String(1 - this.spareUsed);
    this.root.querySelectorAll('.bl').forEach((b, i) => { b.dataset.worn = i === this.dull ? '1' : '0'; });
    const done = this.huntsDone >= HUNTS, dull = this.dull >= 0;
    const live = !this.spent && !this.spareUsed;
    const able = { hunt: !dull && !done && live, swap: dull && live, scrap: dull && live };
    for (const k of Object.keys(able)) { const e = $(`[data-act="${k}"]`); if (able[k]) e.removeAttribute('disabled'); else e.setAttribute('disabled', ''); e.setAttribute('aria-disabled', String(!able[k])); }
    const el = $('[data-say]');
    el.textContent = say;
    if (ok === false) el.dataset.ok = '0'; else delete el.dataset.ok;
    $('[data-act="again"]').hidden = !this.spareUsed;
    for (const k of ['hunt', 'swap', 'scrap']) $(`[data-act="${k}"]`).hidden = !!this.spareUsed;
  }

  _hunt() {
    if (this.dull >= 0 || this.huntsDone >= HUNTS || this.spareUsed) return;
    this.huntsDone += 1;
    this.dull = (this.huntsDone * 3) % N;
    if (this.huntsDone >= HUNTS) { this._sync('Last hunt done. Fix the blade to finish.'); return; }
    this._sync('One blade is dull. What do you replace?');
  }

  _swap() {
    if (this.dull < 0 || this.spareUsed) return;
    this.dull = -1;
    if (this.huntsDone >= HUNTS) { this.spent = true; this._sync('All hunts done with the same handle.'); finishGame(this); return; }
    this._sync('A fresh blade, the same handle. Ready for the next hunt.');
  }

  _scrap() {
    if (this.dull < 0 || this.spareUsed) return;
    this.spareUsed = 1;
    this._sync('The handle was fine and seven blades were still sharp. Replace only the part.', false);
  }

  checkObjective() {
    if (this.spareUsed || this.huntsDone < HUNTS || this.dull >= 0) return null;
    return { ok: true };
  }

  resetChallenge() {
    super.resetChallenge?.();
    Object.assign(this, { huntsDone: 0, spareUsed: 0, dull: -1, spent: false });
    this._sync('Go on your first hunt.');
  }
}
