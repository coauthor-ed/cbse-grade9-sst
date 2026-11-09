// AtmosphereLayersScene - the book's Fig 3.3 redrawn as sky. Mounted twice:
//   4 beats, blk-l02-s03: each beat lights the layers its text names, and the temperature line draws up to there
//   1 beat, blk-l02-s13 close: the whole column; a chip lights a layer and gives its job
// The first beat answers the predict: the line turns back above 12 km.
import { SvgScene, fill, stroke } from 'simulations/base/kit/SimSvg.js';
import { tapLight } from 'simulations/base/kit/TapLight.js';
import { SKY_COLOR_MAP, svgSkyColour as sc, svgBalloon } from '../shared/SkyArt.js';
import { words, panel, SKY_WHITE, SKY_INK } from '../L01/AirBits.js';
import { LAYERS, column, lineD, lineX, skyDefs, skyBands, pauseLines, kmTicks, groundBits, plane, meteorMark, satelliteMark, auroraMark } from './AirColumn.js';

const S1 = 0, S2 = 1, S3 = 2, S4 = 3, CLOSE = 4;
const m = (...a) => a.map((idx) => [{ idx, dwellMs: null }]);
const MAP4 = m(S1, S2, S3, S4), MAP1 = m(CLOSE);
const LIT = [['tropo'], ['strato'], ['meso'], ['thermo', 'exo']];
const LINE_TO = [50, 50, 80, 130];
const JOBS = { tropo: 'air to breathe, and weather', strato: 'ozone, and clear air for flying', meso: 'burns up most meteors', thermo: 'reflects radio waves', exo: 'fades into space' };
const CHIPS = LAYERS.map((l) => ({ id: l.id, label: l.name, targets: [l.id], tone: l.tone }));

export class AtmosphereLayersScene extends SvgScene {
  static BEAT_STEP_MAP = MAP4;
  static BEAT_MAPS = { 4: MAP4, 1: MAP1 };
  static WIDTH = 560;
  static HEIGHT = 490;
  static PORTRAIT_WIDTH = 340;
  static PORTRAIT_HEIGHT = 600;
  static COLOR_MAP = SKY_COLOR_MAP;
  static ARIA_LABEL = 'The atmosphere as a column of sky from the ground to space, marked from 0 to 100 kilometres. Five layers are named with boundaries at 12, 50 and 80 kilometres. A white temperature line falls, turns, rises, falls and rises again.';
  static CONTROLS = [];

  tl = tapLight({ label: 'Layers', chips: CHIPS, onChange: () => { this._fresh = false; this.repaint(); } });

  async setup() {
    await super.setup();
    this.tl.mount(this.root, this);
  }

  destroy() { this.tl.destroy(); super.destroy(); }

  css() {
    return `.svs { padding: 6px; }
.al-line { stroke-dasharray: 1600; stroke-dashoffset: 1600; animation: al-line 1.5s ease forwards; }
@keyframes al-line { to { stroke-dashoffset: 0; } }
.tl-chip { padding-left: 8px; padding-right: 8px; }`;
  }

  enter() { this._fresh = true; this.tl.reset(); }

  stageHeight(st) { return st.portrait ? 400 : 330; }

  _off(id) {
    if (this.tl.any()) return this.tl.off(id);
    return this.stepIndex !== CLOSE && !LIT[this.stepIndex].includes(id);
  }

  paint(st) {
    const W = st.W, H = st.H, P = st.portrait, step = this.stepIndex, c = column(2, 2, W - 4, H - 4);
    const ink = SKY_WHITE, close = step === CLOSE;
    let b = `<defs>${skyDefs('al')}<clipPath id="al-clip"><rect x="2" y="2" width="${W - 4}" height="${H - 4}" rx="18"/></clipPath></defs><g clip-path="url(#al-clip)">`;
    b += skyBands(c, 'al', (id) => this._off(id));
    b += groundBits(c);
    b += `<path d="M2 ${c.base + 8}l42 -28l24 14l28 -20l50 34Z" ${fill(sc('rock'))}/><path d="M${2 + 94} ${c.base - 26 + 2}l-10 -0l10 0l14 10l-14 -2Z" ${fill(sc('snow'))}/>`;
    b += pauseLines(c, ink);
    // things in their places, by layer
    const seen = (id) => close || step >= LAYERS.findIndex((l) => l.id === id) || id === 'tropo';
    if (seen('strato')) {
      b += `<rect x="${W * 0.1}" y="${c.yAt(30) - 14}" width="64" height="28" rx="14" ${fill('var(--sim-series-4)')}/>${words(W * 0.1 + 32, c.yAt(30) + 5, 'ozone', { anchor: 'middle', size: 15, ink: 'var(--sim-ink-on-4, var(--sim-bg-deep))' })}`;
      b += plane(W * 0.46, c.yAt(14) - 6, 0.46);
    }
    if (seen('meso')) b += meteorMark(W * 0.78, c.yAt(70), 0.9) + meteorMark(W * 0.2, c.yAt(61), 0.8);
    if (seen('thermo')) b += auroraMark(W * 0.4, c.yAt(99), 74, c.yAt(86) - c.yAt(99)) + satelliteMark(W * 0.24, c.yAt(100), 0.72);
    // the line
    const to = close ? 130 : LINE_TO[step];
    b += `<path d="${lineD(c, 0, to)}" class="${this._fresh ? 'al-line' : ''}" ${stroke(shade2(), 8)}/><path d="${lineD(c, 0, to)}" class="${this._fresh ? 'al-line' : ''}" ${stroke(sc('sun'), 4.5)}/>`;
    b += kmTicks(c, ink, words);
    // layer names, right edge, on their own pill
    for (const l of LAYERS) {
      const y = l.id === 'exo' ? (c.y + c.top) / 2 + 2 : c.yAt((l.a + l.b) / 2) + (l.id === 'tropo' ? 4 : 0);
      if (this._off(l.id)) { b += words(W - 16, y + 5, l.name, { anchor: 'end', size: 15, ink, display: true }); continue; }
      const tw = l.name.length * 9.6 + 22;
      b += `<rect x="${W - 12 - tw}" y="${y - 14}" width="${tw}" height="28" rx="14" ${fill(`var(--sim-series-${l.tone})`)}/>${words(W - 12 - tw / 2, y + 6, l.name, { anchor: 'middle', size: 16, display: true, ink: `var(--sim-ink-on-${l.tone}, var(--sim-bg-deep))` })}`;
    }
    // readings on the line
    if (step === S1) {
      b += this._tag(lineX(c, 0) - 6, c.yAt(4) + 8, '30 \u00B0C', 'end');
      b += this._tag(lineX(c, 12) + 12, c.yAt(10) + 4, 'about -55 \u00B0C', 'start');
      b += `<g transform="translate(${lineX(c, 30)} ${c.yAt(35)}) scale(0.32)">${svgBalloon(0, 0, 1, {})}</g>`;
      b += words(lineX(c, 30) + 20, c.yAt(38), 'balloons', { size: 14, ink });
      b += words(W * 0.12, c.yAt(66), 'rockets and satellites', { size: 15, ink });
    }
    if (step === S3) b += this._tag(lineX(c, 74) + 14, c.yAt(74), 'about -90 \u00B0C', 'start');
    if (step === S4) b += words(W - 16, c.yAt(112), '700 km up', { anchor: 'end', size: 15, ink });
    if (close) {
      const on = this.tl.chip();
      if (on) {
        const pw = W - 28;
        b += panel(14, H - 54, pw, 42, { r: 12 }) + words(W / 2, H - 27, JOBS[on.id], { anchor: 'middle', size: P ? 15 : 17, ink: 'var(--sim-label)' });
      }
    }
    b += `</g><rect x="2" y="2" width="${W - 4}" height="${H - 4}" rx="18" ${stroke(sc('inkSoft'), 3)}/>`;
    this._fresh = false;
    return { svg: b };
  }

  _tag(x, y, s, anchor) {
    return words(x, y, s, { anchor, size: 16, display: true, ink: SKY_INK, halo: SKY_WHITE });
  }
}
const shade2 = () => sc('ink');
