// StripsGame - L02 game (blk-l02-game): the farmer's 4 strips (a made-up example). Wheat 10, 20, 30, 40 kg on
// the dry, sandy, loam and rich strips; barley 25 kg on any strip; strips switch to barley dry strip first.
// Each round: 1. predict how much wheat is given up if N strips switch (4 shuffled choices, one pick, locked);
// 2. switch the strips one at a time, in order (the next strip is ringed; a strip out of order gets a short
// reason), each showing the wheat it gave up; 3. the sum line, then: a right prediction moves on, a wrong one
// gets a one-line reason and the same round again (choices shuffled again).
// Rounds: 3 strips (60, the objective), 1 strip (10), 2 strips (30), 4 strips (100). The win is real: all four
// rounds predicted right -> finishGame -> checkObjective { ok: true }. The answer is never printed before the
// pick. Shuffle: Math.random (no crypto). Colours: tokens only (wheat gold, barley series 2). ASCII only.
import { GameBoard, mountGame, finishGame, onTap } from 'simulations/base/kit/GameFrame.js';
import { farmSpec, farmSvg, tagSvg, cropTone } from 'simulations/base/kit/SimFarm.js';

const MINUS = String.fromCharCode(0x2212);
const WHEAT = [10, 20, 30, 40];
const BARLEY = 25;
const SOILS = ['dry', 'sandy', 'loam', 'rich'];
const ROUNDS = [
  { n: 3, choices: [30, 60, 75, 90], why: {
    30: '30 kg is the third strip alone. Add all three: 10 + 20 + 30.',
    75: '75 kg is the barley gained (3 x 25). The question asks for the wheat.',
    90: '90 kg adds the three best strips. The dry strip goes first: 10 + 20 + 30.' } },
  { n: 1, choices: [10, 20, 25, 40], why: {
    20: '20 kg is the sandy strip. The dry strip goes first, and it grows 10 kg.',
    25: '25 kg is the barley gained. The question asks for the wheat.',
    40: '40 kg is the rich strip, which goes last. The dry strip goes first.' } },
  { n: 2, choices: [20, 30, 50, 70], why: {
    20: '20 kg is the sandy strip alone. Add both strips: 10 + 20.',
    50: '50 kg is the barley gained (2 x 25). The question asks for the wheat.',
    70: '70 kg adds the two best strips. Dry and sandy go first: 10 + 20.' } },
  { n: 4, choices: [40, 60, 90, 100], why: {
    40: '40 kg is the rich strip alone. All four strips: 10 + 20 + 30 + 40.',
    60: '60 kg is only the first three strips. The rich strip adds 40 more.',
    90: '90 kg leaves out the dry strip. All four: 10 + 20 + 30 + 40.' } },
];
const answer = (n) => WHEAT.slice(0, n).reduce((a, b) => a + b, 0);
const f1 = (v) => (+v).toFixed(1);

function shuffled(a) {
  const r = a.slice();
  for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; }
  return r;
}

/** The harvest tag with its rim in the crop's own tone. */
const cropTag = (text, x, y, size, crop) => tagSvg(text, x, y, { size, tone: 'gold' }).replace('stroke:var(--sim-gold)', `stroke:${cropTone(crop)}`);

/** Add the grow class to strip i's plants only (farmSvg writes one sf-plants group per strip, in order). */
function growOnly(svg, i) {
  let n = -1;
  return svg.replace(/class="sf-plants"/g, (m) => { n += 1; return n === i ? 'class="sf-plants sv-grow"' : m; });
}

const CSS = `
.sg { background: var(--sim-bg-deep); border-radius: var(--sim-radius-md, 12px); }
.sg .sg-body { flex: 1 1 auto; min-height: 0; display: grid; grid-template-columns: 560px minmax(0, 1fr); gap: 26px; align-items: center; }
.sg .sg-fig { position: relative; width: 100%; }
.sg .sg-fig svg { display: block; width: 100%; height: auto; }
.sg svg .sv-grow { transform-box: fill-box; transform-origin: bottom; animation: sg-grow 0.6s ease-out both; }
@keyframes sg-grow { from { transform: scaleY(0); } to { transform: none; } }
.sg svg .sg-pop { transform-box: fill-box; transform-origin: center; animation: sg-pop 0.4s ease-out both; }
@keyframes sg-pop { 0% { transform: scale(0.5); opacity: 0; } 100% { transform: none; opacity: 1; } }
.sg svg .sg-ring { animation: sg-ring 1.3s ease-in-out infinite; }
@keyframes sg-ring { 50% { opacity: 0.3; } }
.sg .sg-hit { position: absolute; padding: 0; min-height: 0; border: 0; background: none; box-shadow: none; border-radius: 10px; }
.sg .sg-hit:active { transform: none; box-shadow: none; }
.sg .sg-side { display: flex; flex-direction: column; gap: 12px; align-items: stretch; }
.sg .sg-ask { margin: 0; font: 800 20px/1.3 var(--sim-font); color: var(--sim-label); }
.sg .sg-ask b { color: var(--sim-accent); }
.sg .sg-chips { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
.sg .sg-chips:empty { display: none; }
.sg .sg-chip { min-height: 54px; font: 800 23px/1 var(--sim-font-display, var(--sim-font)); }
.sg .sg-read { display: flex; flex-direction: column; gap: 4px; }
.sg .sg-read:empty { display: none; }
.sg .sg-lost { font: 800 24px/1.2 var(--sim-font); color: var(--sim-bad); }
.sg .sg-mine { font: 700 17px/1.3 var(--sim-font); color: var(--sim-label-muted); }
.sg .sg-say { margin: 0; min-height: 24px; font: 700 18px/1.4 var(--sim-font); }
.sg .sg-say:empty { display: none; }
.sg .sg-say[data-tone="good"] { color: var(--sim-good); }
.sg .sg-say[data-tone="bad"] { color: var(--sim-bad); }
.sg .sg-next { min-height: 50px; font-size: 18px; font-weight: 800; border-color: var(--sim-accent); }
.sg .sg-made { display: inline-block; margin-left: 8px; padding: 1px 10px; border-radius: var(--look-pill, 999px); border: 2px solid var(--sim-stroke);
  font: 700 14px/1.4 var(--sim-font); color: var(--sim-label-muted); vertical-align: middle; }
.sim-dom-root--portrait .sg .sg-body { display: flex; flex-direction: column; gap: 10px; align-items: stretch; }
.sim-dom-root--portrait .sg .sg-ask { font-size: 17px; text-align: center; }
.sim-dom-root--portrait .sg .sg-chip { min-height: 50px; font-size: 21px; }
.sim-dom-root--portrait .sg .sg-lost { font-size: 21px; text-align: center; }
.sim-dom-root--portrait .sg .sg-mine { font-size: 15px; text-align: center; }
.sim-dom-root--portrait .sg .sg-say { font-size: 15px; text-align: center; }
.sim-dom-root--portrait .sg .sg-side { gap: 10px; }
`;

export class StripsGame extends GameBoard {
  static HEIGHT = 330;   // the board fits about 350 CSS px at 1280x720
  static CONTINUOUS = false;
  static OBJECTIVE = { prompt: { en: 'A made-up example. If the farmer moves 3 strips to barley, starting with the dry strip, how much wheat is given up? Predict first, then switch the strips and check.' } };
  static ARIA_LABEL = 'A made-up example: the farmer\'s 4 strips. In wheat the dry, sandy, loam and rich strips give 10, 20, 30 and 40 kg; barley gives 25 kg on any strip. Strips switch to barley dry strip first. Predict the wheat given up, then tap the strips in order to switch them.';

  async setup() {
    this.round = 0; this.startRound(false);
    this.won = false; this.figP = null;
    await super.setup();
    mountGame(this, {
      css: CSS, check: false,
      onResize: () => { if (this.isPortrait() !== this.figP) this.draw(); },
      html: `<div class="gm sg"><div class="gm-head"><h2>Strips to barley<span class="sg-made">A made-up example</span></h2><p class="sub sg-sub"></p></div>
        <div class="sg-body"><div class="sg-fig"></div>
          <div class="sg-side"><p class="sg-ask"></p><div class="sg-chips"></div><div class="sg-read" aria-live="polite"></div><p class="sg-say" aria-live="polite"></p><div class="sg-act"></div></div></div></div>`,
    });
    // One Quill only: mini-game@1 draws him in its verdict strip, so the frame's corner Quill goes (never on the board).
    this.quill?.destroy?.(); this.quill = null; this._scaleWrap?.classList.remove('gm-quill');
    this.draw();
  }

  /** A round from its start: all wheat, a fresh shuffle, nothing picked. */
  startRound(redraw = true) {
    this.phase = 'predict'; this.pick = null; this.done = 0; this.fresh = null; this.tone = ''; this.line = '';
    this.order = shuffled(ROUNDS[this.round].choices);
    if (redraw) this.draw();
  }

  isPortrait() { return !!(this.root?.closest?.('.sim-dom-root--portrait') || this.root?.classList?.contains('sim-dom-root--portrait')); }

  draw() {
    const q = (s) => this.root?.querySelector(s);
    if (!q('.sg-fig')) return;
    this.figP = this.isPortrait();
    const R = ROUNDS[this.round], n = R.n, strips = n === 1 ? '1 strip' : `${n} strips`;
    q('.sg-sub').textContent = `Round ${this.round + 1} of ${ROUNDS.length}. Wheat strips switch to barley, dry strip first.`;
    q('.sg-ask').innerHTML = this.phase === 'predict'
      ? `Move ${strips} to barley. How much wheat is given up?`
      : this.phase === 'switch' ? `Now switch them: tap strip <b>${this.done + 1}</b>.` : `${strips} moved to barley.`;
    q('.sg-fig').innerHTML = this.figure(this.figP);
    q('.sg-fig').querySelectorAll('.sg-hit').forEach((b) => onTap(b, () => this.tapStrip(Number(b.dataset.i))));
    const chips = q('.sg-chips');
    if (this.phase !== 'predict') chips.innerHTML = '';
    else {
      chips.innerHTML = this.order.map((v) => `<button type="button" class="tap btn sg-chip" data-v="${v}">${v} kg</button>`).join('');
      chips.querySelectorAll('.sg-chip').forEach((b) => onTap(b, () => this.predict(Number(b.dataset.v))));
    }
    const lost = WHEAT.slice(0, this.done).reduce((a, b) => a + b, 0);
    q('.sg-read').innerHTML = this.phase === 'predict' ? ''
      : `<div class="sg-lost">wheat given up: ${this.phase === 'done' && this.done > 1 ? `${WHEAT.slice(0, this.done).join(' + ')} = ` : ''}${lost} kg</div><div class="sg-mine">Your prediction: ${this.pick} kg</div>`;
    const say = q('.sg-say');
    say.textContent = this.line;
    if (this.tone) say.dataset.tone = this.tone; else delete say.dataset.tone;
    const act = q('.sg-act');
    act.innerHTML = '';
    if (this.phase === 'done' && !this.won) {
      const right = this.pick === answer(n), last = this.round === ROUNDS.length - 1;
      if (!(right && last)) {
        act.innerHTML = `<button type="button" class="tap btn sg-next">${right ? 'Next round' : 'Try this round again'}</button>`;
        onTap(act.firstElementChild, () => this.next());
      }
    }
    this.relayout?.();
  }

  /** The 4 strips as SVG in its own viewBox: number + soil column | field | tag column (no tag over a crop). */
  figure(P) {
    const W = P ? 312 : 560, numW = P ? 46 : 92, tagW = P ? 106 : 150, sh = P ? 58 : 50, gap = 8, fy = 6;
    const fx = numW + 4, fw = W - fx - tagW - 8, fh = 4 * sh + 3 * gap, H = fy + fh + 8;
    const crops = WHEAT.map((_, i) => (i < this.done ? 'barley' : 'wheat'));
    const spec = farmSpec({ orient: 'rows', w: fw, h: fh, gap, strips: crops.map((crop, i) => ({ crop, soil: SOILS[i] })) });
    let farm = farmSvg(spec, { x: fx, y: fy, tags: false });
    if (typeof this.fresh === 'number') farm = growOnly(farm, this.fresh);
    let s = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="The farmer's 4 strips">${farm}`;
    const tx = W - tagW / 2 - 2, size = P ? 22 : 24;
    for (let i = 0; i < 4; i++) {
      const cy = fy + i * (sh + gap) + sh / 2, nx = P ? 17 : 20;
      s += `<circle cx="${nx}" cy="${f1(P ? cy - 9 : cy)}" r="${P ? 14 : 16}" style="fill:var(--sim-bg-surface);stroke:var(--sim-label-muted);stroke-width:2.5"/>`
        + `<text x="${nx}" y="${f1((P ? cy - 9 : cy) + 6.5)}" text-anchor="middle" style="fill:var(--sim-label);font:800 ${P ? 17 : 19}px var(--sim-font)">${i + 1}</text>`
        + (P ? `<text x="${nx + 4}" y="${f1(cy + 22)}" text-anchor="middle" style="fill:var(--sim-label-muted);font:700 14px var(--sim-font)">${SOILS[i]}</text>`
          : `<text x="42" y="${f1(cy + 6)}" style="fill:var(--sim-label-muted);font:700 17px var(--sim-font)">${SOILS[i]}</text>`);
      const pop = this.fresh === i ? ' class="sg-pop"' : '';
      if (crops[i] === 'barley') {
        s += `<g${pop}>${cropTag(`${BARLEY} kg`, tx, cy - 11, size - 2, 'barley')}`
          + `<text x="${f1(tx)}" y="${f1(cy + 22)}" text-anchor="middle" style="fill:var(--sim-bad);font:800 ${P ? 14 : 16}px var(--sim-font)">${MINUS}${WHEAT[i]} kg wheat</text></g>`;
      } else s += cropTag(`${WHEAT[i]} kg`, tx, cy, size, 'wheat');
    }
    if (this.phase === 'switch') {
      const i = this.done, y = fy + i * (sh + gap);
      s += `<rect class="sg-ring" x="${f1(fx - 4)}" y="${f1(y - 3)}" width="${f1(fw + 8)}" height="${f1(sh + 6)}" rx="10" style="fill:none;stroke:var(--sim-accent);stroke-width:4;stroke-dasharray:10 7"/>`;
    }
    s += '</svg>';
    if (this.phase === 'switch') {
      for (let i = 0; i < 4; i++) {
        const y = fy + i * (sh + gap);
        s += `<button type="button" class="tap btn sg-hit" data-i="${i}" aria-label="strip ${i + 1}, ${SOILS[i]}: ${crops[i]}"`
          + ` style="left:${f1((fx - 4) / W * 100)}%;top:${f1((y - 3) / H * 100)}%;width:${f1((fw + tagW + 8) / W * 100)}%;height:${f1((sh + 6) / H * 100)}%"></button>`;
      }
    }
    return s;
  }

  predict(v) {
    if (this.phase !== 'predict') return;
    this.pick = v; this.phase = 'switch'; this.line = ''; this.tone = '';
    this.draw();
  }

  tapStrip(i) {
    if (this.phase !== 'switch') return;
    if (i < this.done) return;
    if (i !== this.done) {
      this.line = this.done === 0 ? 'The dry strip goes first: tap strip 1.' : `Switch them in order: tap strip ${this.done + 1}.`;
      this.tone = 'bad'; this.draw(); return;
    }
    this.done += 1; this.fresh = i; this.line = ''; this.tone = '';
    const n = ROUNDS[this.round].n;
    if (this.done >= n) this.finishRound();
    this.draw();
    this.fresh = null;
  }

  finishRound() {
    const R = ROUNDS[this.round], key = answer(R.n);
    this.phase = 'done';
    if (this.pick === key) {
      this.tone = 'good';
      if (this.round === ROUNDS.length - 1) {
        this.won = true;
        this.line = 'Right. Each strip moved gives up more wheat than the one before: 10, 20, 30, 40.';
        finishGame(this);
      } else this.line = `Right: ${key} kg of wheat given up.`;
    } else {
      this.tone = 'bad';
      this.line = R.why[this.pick] ?? 'Add the wheat of each strip you moved.';
    }
  }

  next() {
    if (this.phase !== 'done') return;
    if (this.pick === answer(ROUNDS[this.round].n)) this.round = Math.min(this.round + 1, ROUNDS.length - 1);
    this.startRound();
  }

  checkObjective() { return this.won ? { ok: true } : null; }

  resetChallenge() {
    super.resetChallenge?.();
    this.round = 0; this.won = false;
    this.startRound();
  }

  testState() { return { round: this.round, phase: this.phase, pick: this.pick, done: this.done, won: this.won, order: this.order }; }
}
