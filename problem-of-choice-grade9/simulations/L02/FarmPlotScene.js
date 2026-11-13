/**
 * FarmPlotScene - L02 s05 "The Farmer's Plot" (2 beats). A made-up example, said once on screen.
 *   b0 plot:     one plot of 4 strips (1 dry, 2 sandy, 3 loam, 4 rich), all wheat; each strip's harvest is a tag
 *                in a clear column at the strip's end (10, 20, 30, 40 kg). Totals: wheat 100 kg, barley 0 kg.
 *   b1 tradeoff: tap a strip to switch it between wheat and barley. Barley gives 25 kg on any strip; a switched
 *                strip shows its barley tag and, under it, the wheat it no longer grows. The readout (barley,
 *                wheat, wheat given up) is always the sum of the strips on screen. Any order is allowed: each
 *                strip loses its own wheat. At rest (cold start) strip 1 is barley: 25, 90, given up 10.
 *                Named cases: "all barley" (100, 0, given up 100) and "Start again".
 * Drawn in stage px (st.W wide), so text stays its written size; the field sits between a number column and the
 * tag column, never under a tag. Colours are tokens only. ASCII only.
 */
import { SvgScene, fill, chip } from 'simulations/base/kit/SimSvg.js';
import { farmSpec, farmSvg, tagSvg, cropTone } from 'simulations/base/kit/SimFarm.js';

const MAP = [[{ idx: 0, dwellMs: null }], [{ idx: 1, dwellMs: null }]];
const WHEAT = [10, 20, 30, 40];
const BARLEY = 25;
const SOILS = ['dry', 'sandy', 'loam', 'rich'];
const GROW_S = 0.9;
const f1 = (v) => (+v).toFixed(1);

const CSS = `
.fp-row { position: absolute; left: 0; right: 0; transform: translateY(-50%); display: flex; justify-content: center; gap: 12px; flex-wrap: wrap; }
.fp-read { display: inline-flex; align-items: center; gap: 8px; padding: 5px 16px; border-radius: var(--look-pill, 999px); white-space: nowrap;
  font: 800 20px/1.25 var(--sim-font); background: var(--sim-bg-surface); color: var(--sim-label);
  border: calc(2.5px * var(--look-rim, 1)) solid var(--c, var(--sim-stroke)); box-shadow: 0 calc(3px * var(--look-lip, 1)) 0 var(--c, var(--sim-stroke)); }
.fp-read i { width: 16px; height: 16px; border-radius: 50%; background: var(--c); display: inline-block; }
.fp-read--cost { font-size: 21px; }
.fp-l .fp-read { font-size: 17px; padding: 4px 12px; gap: 6px; }
.fp-l .fp-row { gap: 8px; flex-wrap: nowrap; align-items: center; }
.fp-l .sv-chip--static { font-size: 15px; }
.fp-l .fp-hbtn { font-size: 16px; min-height: 44px; }
.fp-p .fp-read { font-size: 18px; padding: 4px 12px; gap: 6px; }
.fp-p .fp-row { gap: 8px; flex-wrap: nowrap; }
.fp-read--cost b { color: var(--sim-bad); }
.fp-btn { position: absolute; transform: translate(-50%, -50%); min-height: 44px; padding: 6px 16px; cursor: pointer; white-space: nowrap;
  border-radius: calc(12px * var(--look-radius, 1)); font: 800 18px/1.1 var(--sim-font); background: var(--sim-bg-surface); color: var(--sim-label);
  border: 2.5px solid var(--sim-stroke); box-shadow: 0 calc(3px * var(--look-lip, 1)) 0 var(--sim-stroke); }
.fp-hbtn { position: static; transform: none; min-height: 40px; padding: 4px 14px; }
.fp-btn:active { transform: translate(-50%, calc(-50% + 3px)); box-shadow: none; }
.fp-hbtn:active { transform: translateY(3px); }
.fp-strip { position: absolute; padding: 0; border: 0; background: none; border-radius: 10px; cursor: pointer; }
.fp-strip:hover { background: color-mix(in oklab, var(--sim-accent) 10%, transparent); }
.fp-btn:focus-visible, .fp-strip:focus-visible { outline: 3px solid var(--sim-accent); outline-offset: 3px; }
.fp-hint { font: 800 18px/1.25 var(--sim-font); color: var(--sim-accent); }
svg .fp-pulse { animation: fp-pulse 1.3s ease-in-out infinite; }
@keyframes fp-pulse { 50% { opacity: 0.25; } }
svg .fp-pop { transform-box: fill-box; transform-origin: center; animation: fp-pop 0.4s ease-out both; }
@keyframes fp-pop { 0% { transform: scale(0.5); opacity: 0; } 100% { transform: none; opacity: 1; } }
`;

/** The harvest tag with its rim in the crop's own tone (the readout swatches use the same tone). */
const cropTag = (text, x, y, size, crop) => tagSvg(text, x, y, { size, tone: 'gold' }).replace('stroke:var(--sim-gold)', `stroke:${cropTone(crop)}`);

/** Add the grow class to strip i's plants only (farmSvg writes one sf-plants group per strip, in order). */
function growOnly(svg, i) {
  let n = -1;
  return svg.replace(/class="sf-plants"/g, (m) => { n += 1; return n === i ? 'class="sf-plants sv-grow"' : m; });
}

export class FarmPlotScene extends SvgScene {
  static WIDTH = 560;
  static PORTRAIT_WIDTH = 390;
  static HEIGHT = 440;   // the host budgets the panel from this: scale = about 465 / HEIGHT at 1280x720, so it sits above the content height on purpose
  static PORTRAIT_HEIGHT = 610;
  static CONTINUOUS = false;
  static BEAT_STEP_MAP = MAP;
  static BEAT_MAPS = { 2: MAP };
  static CONTROLS = [];
  static ARIA_LABEL = 'A made-up example: one plot of 4 strips. Strip 1 is dry, strip 2 sandy, strip 3 loam, strip 4 rich. In wheat the strips give 10, 20, 30 and 40 kg, 100 kg in all. Barley gives 25 kg on any strip. Tap a strip to switch it: the farmer gains 25 kg of barley and gives up that strip\'s wheat.';

  async setup() {
    this.crop = ['wheat', 'wheat', 'wheat', 'wheat'];
    this.fresh = null;      // 'all' or a strip index: plants that grow in on this paint
    this.moved = false;
    this.pend = [];
    await super.setup();
    this._onClick = (e) => {
      const b = e.target?.closest?.('[data-act]');
      if (!b || b.disabled) return;
      this.act(b.dataset.act, b.dataset.val);
    };
    this.root.addEventListener('click', this._onClick);
  }

  destroy() {
    this.root?.removeEventListener('click', this._onClick);
    super.destroy();
  }

  css() { return CSS; }

  cancel() { for (const c of this.pend) c(); this.pend = []; }

  /** Grown plants rest after GROW_S; until then a repaint replays the grow. */
  growIn(which) {
    this.cancel();
    this.fresh = which;
    this.pend.push(this.after(GROW_S, () => { this.fresh = null; }));
  }

  enter(step) {
    this.moved = false;
    this.crop = step === 1 ? ['barley', 'wheat', 'wheat', 'wheat'] : ['wheat', 'wheat', 'wheat', 'wheat'];
    this.growIn(step === 1 ? 0 : 'all');
  }

  act(a, v) {
    if (this.stepIndex !== 1) return;
    if (a === 'strip') {
      const i = Number(v);
      if (!(i >= 0 && i < 4)) return;
      this.crop[i] = this.crop[i] === 'wheat' ? 'barley' : 'wheat';
      this.moved = true;
      this.growIn(i);
    } else if (a === 'allbarley') {
      this.crop = ['barley', 'barley', 'barley', 'barley'];
      this.moved = true;
      this.growIn('all');
    } else if (a === 'again') {
      this.enter(1);
    } else return;
    this.repaint();
  }

  /** What the strips on screen add up to. */
  totals() {
    let barley = 0, wheat = 0, lost = 0;
    this.crop.forEach((c, i) => { if (c === 'barley') { barley += BARLEY; lost += WHEAT[i]; } else wheat += WHEAT[i]; });
    return { barley, wheat, lost };
  }

  layout(st) {
    const P = st.portrait, W = st.W;
    const numW = P ? 34 : 44, tagW = P ? 112 : 132, pad = 9;
    const fx = numW + pad + 4, fw = W - fx - pad - 6 - tagW;
    const sh = P ? 74 : 52, gap = 10, fh = 4 * sh + 3 * gap, fy = P ? 64 : 48;
    const low = fy + fh + pad + (P ? 40 : 27);
    return { P, W, numW, tagW, fx, fw, sh, gap, fh, fy, low, tx: W - tagW / 2 - 2, rowY: (i) => fy + i * (sh + gap) + sh / 2 };
  }

  stageHeight(st) {
    const L = this.layout(st);
    return L.P ? L.low + 92 : L.low + 24;
  }

  paint(st) {
    const L = this.layout(st), step = this.stepIndex, T = this.totals();
    const spec = farmSpec({ orient: 'rows', w: L.fw, h: L.fh, gap: L.gap, strips: this.crop.map((crop, i) => ({ crop, soil: SOILS[i] })) });
    let farm = farmSvg(spec, { x: L.fx, y: L.fy, tags: false, animate: this.fresh === 'all' });
    if (typeof this.fresh === 'number') farm = growOnly(farm, this.fresh);
    let headX = '';
    let svg = farm, over = L.P ? '<div class="fp-p">' : '<div class="fp-l">';
    const size = L.P ? 22 : 24;

    for (let i = 0; i < 4; i++) {
      const cy = L.rowY(i), nx = L.numW / 2, barley = this.crop[i] === 'barley';
      // The strip number, in its own column left of the field.
      svg += `<circle cx="${f1(nx)}" cy="${f1(cy)}" r="17" ${fill('var(--sim-bg-surface)', 'stroke:var(--sim-label-muted);stroke-width:2.5')}/>`
        + `<text x="${f1(nx)}" y="${f1(cy + 7)}" text-anchor="middle" style="fill:var(--sim-label);font:800 20px var(--sim-font)">${i + 1}</text>`;
      // The harvest tag, in the clear column at the strip's end; a switched strip also shows the wheat it gave up.
      const pop = this.fresh === i || (this.fresh === 'all' && step === 1);
      if (barley) {
        svg += `<g${pop ? ' class="fp-pop"' : ''}>${cropTag(`${BARLEY} kg`, L.tx, cy - 13, size, 'barley')}`
          + `<text x="${f1(L.tx)}" y="${f1(cy + 27)}" text-anchor="middle" style="fill:var(--sim-bad);font:800 17px var(--sim-font)">\u2212${WHEAT[i]} kg wheat</text></g>`;
      } else {
        svg += `<g${pop ? ' class="fp-pop"' : ''}>${cropTag(`${WHEAT[i]} kg`, L.tx, cy, size, 'wheat')}</g>`;
      }
    }

    // Totals over the field: always the sum of the strips on screen.
    const read = (crop, label, v) => `<span class="fp-read" style="--c:${cropTone(crop)}"><i></i>${label} <b>${v} kg</b></span>`;
    const made = chip('A made-up example', 0, 0, { tone: 'plain', static: true });
    over += `<div class="fp-row" style="top:${L.P ? 28 : 22}px">${L.P ? '' : made}${read('wheat', 'wheat', T.wheat)}${read('barley', 'barley', T.barley)}</div>`;

    if (step === 1) {
      // The hint: a pulsing rim round strip 2 until the first tap.
      if (!this.moved) {
        const y = L.fy + (L.sh + L.gap);
        svg += `<rect class="fp-pulse" x="${f1(L.fx - 4)}" y="${f1(y - 4)}" width="${f1(L.fw + 8)}" height="${f1(L.sh + 8)}" rx="12" ${fill('none', 'stroke:var(--sim-accent);stroke-width:4;stroke-dasharray:10 7')}/>`;
      }
      for (let i = 0; i < 4; i++) {
        const y = L.fy + i * (L.sh + L.gap), c = this.crop[i], to = c === 'wheat' ? 'barley' : 'wheat';
        over += `<button type="button" class="sv-hit fp-strip" data-act="strip" data-val="${i}" aria-label="strip ${i + 1}: ${c}. Tap to switch it to ${to}"`
          + ` style="left:${f1(L.fx - 6)}px;top:${f1(y - 4)}px;width:${f1(L.fw + 12 + L.tagW)}px;height:${f1(L.sh + 8)}px"></button>`;
      }
      const cost = `<span class="fp-read fp-read--cost" style="--c:var(--sim-bad)">wheat given up <b>${T.lost} kg</b></span>`;
      const btn = (act, label, x, y) => `<button type="button" class="sv-hit fp-btn" data-act="${act}" style="left:${f1(x)}px;top:${f1(y)}px">${label}</button>`;
      const allB = T.barley === 100;
      if (L.P) {
        over += `<div class="fp-row" style="top:${f1(L.low)}px">${cost}</div>`;
        const by = L.low + 58;
        over += this.moved
          ? btn('again', 'Start again', L.W * 0.27, by) + (allB ? '' : btn('allbarley', 'all barley', L.W * 0.73, by))
          : `<div class="fp-row" style="top:${f1(by)}px"><span class="fp-hint">Tap a strip</span></div>`;
      } else {
        // Landscape: the buttons (or the hint) ride in the head row, so the figure stays short.
        // Landscape: one row under the field, the readout and the buttons (or the hint) side by side.
        const hb = (act, label) => `<button type="button" class="sv-hit fp-btn fp-hbtn" data-act="${act}">${label}</button>`;
        const side = this.moved ? (allB ? '' : hb('allbarley', 'all barley')) + hb('again', 'Start again') : '<span class="fp-hint">Tap a strip</span>';
        over += `<div class="fp-row" style="top:${f1(L.low)}px">${cost}${side}</div>`;
      }
    }
    over += '</div>';
    return { svg, over, head: L.P ? made + headX : '' };
  }

  testState() { return { step: this.stepIndex, crop: this.crop.join(','), ...this.totals() }; }
}
