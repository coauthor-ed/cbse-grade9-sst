// CarveTheCoastGameScene - blk-l02-s08. One headland, four steps. At each step three numbered places are marked
// on the rock; the learner picks where the waves should work. A right aim cuts the next stage. A wrong aim gets a
// plain reason and nothing is lost. Crack, cave, arch, then the rock below the arch is cut and gravity brings the
// top down, leaving a stack. Control names: [data-pick="0|1|2"]. No dead end, so no Try again.
import { GameBoard, mountGame, onTap, finishGame } from 'simulations/base/kit/GameFrame.js';
import { fill } from 'simulations/base/kit/SimSvg.js';
import { svgSeaColour as sc } from '../shared/SeaArt.js';
import { words, INK } from '../shared/SeaBits.js';
import { SEA_GAME_CSS, isPortrait } from '../shared/SeaGame.js';
import { svgHeadland } from './HeadlandArt.js';

// spot: [x, y] as parts of W and H.
const STEPS = [
  { stage: 0, ask: 'Where can the waves begin?', opts: [
    { t: 'The grass on top', spot: [0.3, 0.2], why: 'Waves work at sea level. They do not reach the top of the cliff.' },
    { t: 'A small crack at sea level', spot: [0.58, 0.66], ok: true, why: 'Hydraulic action loosens the rock, and a large crack opens.' },
    { t: 'Open water beside the rock', spot: [0.08, 0.84], why: 'There is no rock there for the force of the water to loosen.' },
  ] },
  { stage: 1, ask: 'Now where will the waves do most?', opts: [
    { t: 'Inside the crack', spot: [0.58, 0.56], ok: true, why: 'Hydraulic action and abrasion turn the crack into a sea cave.' },
    { t: 'High on the cliff', spot: [0.8, 0.34], why: 'That rock is above the waves, so they cannot grind it.' },
    { t: 'The lighthouse', spot: [0.16, 0.12], why: 'The lighthouse stands far above the waves.' },
  ] },
  { stage: 2, ask: 'The cave is getting larger. What next?', opts: [
    { t: 'The roof, from above', spot: [0.62, 0.26], why: 'Waves work from the sea, not from the top of the land.' },
    { t: 'Open water beside the rock', spot: [0.1, 0.84], why: 'There is no rock there to wear away.' },
    { t: 'The back of the cave', spot: [0.56, 0.64], ok: true, why: 'The back of the cave wears through, and an arch is formed.' },
  ] },
  { stage: 3, ask: 'The arch stands. What brings it down?', opts: [
    { t: 'The rock at its foot', spot: [0.69, 0.68], ok: true, why: 'Waves cut the rock below. The top falls by gravity and leaves a sea stack.' },
    { t: 'The top of the arch', spot: [0.6, 0.31], why: 'The waves cannot reach the top. They work low down.' },
    { t: 'The sky through the arch', spot: [0.6, 0.54], why: 'Nothing is there to cut. Look at the rock low down.' },
  ] },
];

const CSS = SEA_GAME_CSS + `
.cc .opts { display: flex; flex-direction: column; gap: 8px; }
.cc .opts .btn { min-height: 48px; text-align: left; display: flex; gap: 10px; align-items: center; }
.cc .opts .n { flex: 0 0 28px; height: 28px; border-radius: 50%; display: grid; place-items: center; background: var(--sim-label); color: var(--sim-bg-surface); font-weight: 800; }
`;

export class CarveTheCoastGameScene extends GameBoard {
  static ARIA_LABEL = 'A game on one headland. At each step pick where the waves should work, and cut the rock from a crack to a cave, an arch and a sea stack.';
  static OBJECTIVE = { prompt: { en: 'Cut the headland from a crack to a cave, an arch and a sea stack.' } };

  constructor(container, config) {
    super(container, config);
    this._i = 0; this._msg = ''; this._tone = '';
  }

  async setup() {
    await super.setup();
    mountGame(this, {
      check: false, css: CSS, onResize: () => this._pic(),
      html: `<div class="gm cc"><div class="gm-head"><p class="kicker">Coastal architects</p><h2 data-ask></h2></div>
        <div class="sg-board"><div data-pic></div><div class="sg-side"><div class="opts" data-opts></div><p class="sg-msg" data-msg aria-live="polite"></p></div></div></div>`,
    });
    this._paint();
  }

  _pick(j) {
    const st = STEPS[this._i], o = st.opts[j];
    this._msg = o.why; this._tone = o.ok ? 'good' : 'bad';
    if (o.ok) {
      this._i += 1;
      if (this._i >= STEPS.length) { this._paint(); this.quill?.perform?.('hop'); finishGame(this); return; }
    }
    this._paint();
  }

  _pic() {
    const host = this.root?.querySelector?.('[data-pic]');
    if (!host) return;
    const P = isPortrait(this), W = P ? 312 : 690, H = P ? 230 : 238, done = this._i >= STEPS.length;
    const stage = done ? 4 : STEPS[this._i].stage;
    let s = svgHeadland(W, H, stage, { id: 'cc', t: 1 + this._i });
    if (!done) STEPS[this._i].opts.forEach((o, j) => {
      const x = W * o.spot[0], y = H * o.spot[1];
      s += `<circle cx="${x}" cy="${y}" r="15" ${fill(sc('cloud'), `stroke:${INK};stroke-width:3`)}/>` + words(x, y + 6, String(j + 1), { size: 17, ink: INK, display: true });
    });
    host.innerHTML = `<svg class="sea-pic" viewBox="0 0 ${W} ${H}" role="img" aria-label="A headland with three numbered places">${s}</svg>`;
  }

  _paint() {
    const r = this.root;
    if (!r?.querySelector?.('[data-opts]')) return;
    const done = this._i >= STEPS.length;
    r.querySelector('[data-ask]').textContent = done ? 'A sea stack stands in the water' : STEPS[this._i].ask;
    const box = r.querySelector('[data-opts]');
    box.innerHTML = done ? '' : STEPS[this._i].opts.map((o, j) => `<button class="btn tap" data-pick="${j}"><span class="n">${j + 1}</span><span>${o.t}</span></button>`).join('');
    box.querySelectorAll('[data-pick]').forEach((b) => onTap(b, () => this._pick(Number(b.dataset.pick))));
    const m = r.querySelector('[data-msg]');
    m.textContent = this._msg || 'Pick one of the three places.'; m.dataset.tone = this._tone;
    this._pic();
  }

  checkObjective() { return this._i >= STEPS.length ? { ok: true } : null; }

  resetChallenge() { super.resetChallenge?.(); this._i = 0; this._msg = ''; this._tone = ''; this._paint(); }
}
