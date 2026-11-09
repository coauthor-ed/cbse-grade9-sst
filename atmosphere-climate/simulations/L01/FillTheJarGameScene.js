// FillTheJarGameScene ("Name the gas") - a clue card, six gases in the jar: tap the gas the clue describes.
// A wrong tap gets a true line about that gas and the clue stays. Eight rounds, then the jar shows the true shares.
// Control names: .gas[data-g]. No timer. Rounds end the game through finishGame.
import { GameBoard, mountGame, onTap, finishGame } from 'simulations/base/kit/GameFrame.js';
import { esc } from 'simulations/base/SimUi.js';

const GAS = [
  { id: 'n', name: 'Nitrogen', tone: 1, fact: 'Nitrogen is the largest share, 78 per cent.' },
  { id: 'o', name: 'Oxygen', tone: 2, fact: 'Oxygen is the gas people and animals breathe in.' },
  { id: 'ar', name: 'Argon', tone: 5, fact: 'Argon is 0.93 per cent of the air.' },
  { id: 'co2', name: 'Carbon dioxide', tone: 6, fact: 'Carbon dioxide is taken in by green plants.' },
  { id: 'w', name: 'Water vapour', tone: 7, fact: 'Water vapour forms clouds and gives rain.' },
  { id: 'oz', name: 'Ozone', tone: 4, fact: 'Ozone filters ultraviolet radiation, high up.' },
];
const CLUES = [
  ['It is the largest share of the air.', 'n'],
  ['People and animals breathe it in to stay alive.', 'o'],
  ['It takes up 0.93 per cent of the air.', 'ar'],
  ['Green plants take it in to make food.', 'co2'],
  ['It forms clouds and gives us rain.', 'w'],
  ['High in the stratosphere, it filters ultraviolet radiation.', 'oz'],
  ['Bacteria in the soil change it into a form plants can use.', 'n'],
  ['Its amount varies from 0.1 to 0.4 per cent, and it stays low.', 'w'],
];
const grid = () => {
  let h = '';
  for (let i = 0; i < 100; i += 1) h += `<i style="background:var(--sim-series-${i < 78 ? 1 : i < 99 ? 2 : 5})"></i>`;
  return h;
};

const CSS = `
.gm.nj { background: var(--sim-bg-deep); border-radius: 14px; padding: 8px 16px; gap: 6px; }
.nj .play { display: grid; grid-template-columns: minmax(0, 1fr) 520px; gap: 16px; align-items: center; min-height: 0; flex: 1; }
.nj .clue { background: var(--sim-bg-surface); border: var(--sim-border); border-radius: var(--sim-radius-lg); padding: 14px 16px; box-shadow: 0 var(--sim-lift) 0 var(--sim-stroke); }
.nj .clue .n { font-size: 15px; font-weight: 800; color: var(--sim-label-muted); }
.nj .clue b { display: block; font: 600 24px/1.25 var(--sim-font-display); margin-top: 4px; min-height: 60px; }
.nj .why { min-height: 42px; margin: 8px 2px 0; font-size: 15px; line-height: 1.3; font-weight: 700; }
.nj .why[data-k="bad"] { color: var(--sim-bad); }
.nj .why[data-k="good"] { color: var(--sim-series-3-ink); }
.nj .jar { position: relative; padding: 12px; border-radius: 26px; background: color-mix(in oklab, var(--sim-ice, var(--sim-glass)) 45%, var(--sim-bg-surface)); border: calc(4px * var(--look-rim)) solid var(--sim-stroke); }
.nj .jar::before { content: ''; position: absolute; left: 30%; right: 30%; top: -13px; height: 12px; border-radius: 6px 6px 0 0; background: var(--sim-stroke); }
.nj .gases { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
.nj .gas { --t: var(--sim-series-1); display: flex; align-items: center; gap: 8px; min-height: 52px; padding: 6px 10px; border: var(--sim-border); border-color: var(--t); border-radius: var(--sim-radius-md); background: var(--sim-bg-surface); font-size: 16px; font-weight: 800; text-align: left; }
.nj .gas i { flex: 0 0 18px; height: 18px; border-radius: 50%; background: var(--t); }
.nj .gas[data-hit="1"] { background: color-mix(in oklab, var(--t) 30%, var(--sim-bg-surface)); }
.nj .gas[data-shake="1"] { animation: nj-shake 0.3s ease; }
@keyframes nj-shake { 25% { transform: translateX(-4px); } 75% { transform: translateX(4px); } }
.nj .win { display: none; grid-template-columns: 220px minmax(0, 1fr); gap: 16px; align-items: center; }
.nj .full { display: grid; grid-template-columns: repeat(10, minmax(0, 1fr)); gap: 2px; }
.nj .full i { aspect-ratio: 1; border-radius: 3px; }
.nj[data-won="1"] .play { display: none; }
.nj[data-won="1"] .win { display: grid; }
.nj .win p { margin: 0; font: 600 20px/1.3 var(--sim-font-display); }
.sim-dom-root--portrait .nj .play { grid-template-columns: minmax(0, 1fr); gap: 16px; }
.sim-dom-root--portrait .nj .win { grid-template-columns: minmax(0, 1fr); }
.sim-dom-root--portrait .nj .jar { margin-top: 10px; }
.sim-dom-root--portrait .nj .gas { font-size: 15px; padding: 6px 8px; }
.sim-dom-root--portrait .nj .gas i { flex-basis: 14px; height: 14px; }
`;

export class FillTheJarGameScene extends GameBoard {
  static ARIA_LABEL = 'A game: read a clue, then tap the gas in the jar that the clue describes. After eight clues the jar shows the true shares of the air.';
  static OBJECTIVE = { prompt: { en: 'Read each clue and tap the gas it describes.' } };
  static HEIGHT = 335;

  constructor(container, config) {
    super(container, config);
    this._i = 0;
  }

  async setup() {
    await super.setup();
    mountGame(this, {
      check: false,
      css: CSS,
      html: `<div class="gm nj">
        <div class="gm-head"><h2>Name the gas</h2></div>
        <div class="play">
          <div><div class="clue"><span class="n" data-n></span><b data-clue></b></div><p class="why" data-why aria-live="polite"></p></div>
          <div class="jar"><div class="gases">${GAS.map((g) => `<div class="gas tap" role="button" tabindex="0" data-g="${g.id}" style="--t:var(--sim-series-${g.tone})"><i></i>${esc(g.name)}</div>`).join('')}</div></div>
        </div>
        <div class="win"><div class="jar"><div class="full">${grid()}</div></div><p>Your jar is full: 78 per cent nitrogen, 21 per cent oxygen, and 1 per cent for all the other gases.</p></div>
      </div>`,
    });
    this.root.querySelectorAll('.gas').forEach((el) => onTap(el, () => this._tap(el)));
    this._show();
  }

  _show() {
    const r = this.root;
    if (!r.querySelector('[data-clue]')) return;
    r.querySelector('[data-n]').textContent = `Clue ${Math.min(this._i + 1, CLUES.length)} of ${CLUES.length}`;
    r.querySelector('[data-clue]').textContent = CLUES[Math.min(this._i, CLUES.length - 1)][0];
    r.querySelectorAll('.gas').forEach((g) => { g.dataset.shake = '0'; });
  }

  _tap(el) {
    if (this.solved || this._i >= CLUES.length) return;
    const why = this.root.querySelector('[data-why]'), key = CLUES[this._i][1], g = GAS.find((x) => x.id === el.dataset.g);
    if (el.dataset.g !== key) {
      el.dataset.shake = '1';
      why.dataset.k = 'bad'; why.textContent = `Not this one. ${g.fact}`;
      return;
    }
    el.dataset.hit = '1';
    why.dataset.k = 'good'; why.textContent = `Yes: ${g.name}.`;
    this._i += 1;
    if (this._i < CLUES.length) { this._show(); return; }
    this.root.querySelector('.nj').dataset.won = '1';
    this.relayout?.();
    finishGame(this);
  }

  checkObjective() {
    if (this._i < CLUES.length) return null;
    this.quill?.perform('hop');
    return { ok: true };
  }
}
