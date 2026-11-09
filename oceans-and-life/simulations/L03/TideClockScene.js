// TideClockScene - one shore at Dwarka-like scale: a small hillock with a temple, and a stone pathway from the
// land that the sea covers and uncovers. An hour slider sets the time; the water level is a true tide of period
// 12 h 25 min. A strip below draws the day's curve with a dot on the hour. Beats:
//   beat 0  low tide, path dry (no slider)   beat 1  slider, rests at high tide with the path under water
//   beat 2  slider, the two high tides and two low tides marked, with 12 h 25 min between the highs.
import { SvgScene, fill, stroke } from 'simulations/base/kit/SimSvg.js';
import { SEA_COLOR_MAP, svgSeaColumn, svgWaveLine, svgHillTemple, svgCloud, svgPalm, svgSeaColour as sc, svgSkyGradient, pathLine as line } from '../shared/SeaArt.js';
import { frame, words, seaLabel, ctlBar, INK } from '../shared/SeaBits.js';

const one = (idx) => [{ idx, dwellMs: null }];
const PERIOD = 12.42, HIGH = 6.21;           // hours; first high tide after midnight in this made-up day
const level = (h) => Math.cos((h - HIGH) / PERIOD * Math.PI * 2);   // +1 high, -1 low
const REST = [0, HIGH, HIGH + PERIOD / 2 - 3.1];
const clock = (h) => { const m = Math.round(h * 60) % 1440; return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`; };
const stateOf = (h) => { const v = level(h), up = Math.sin((h - HIGH) / PERIOD * Math.PI * 2) < 0; return v > 0.92 ? 'High tide' : v < -0.92 ? 'Low tide' : up ? 'Rising' : 'Falling'; };

export class TideClockScene extends SvgScene {
  static BEAT_STEP_MAP = [one(0), one(1), one(2)];
  static WIDTH = 680;
  static HEIGHT = 500;
  static PORTRAIT_WIDTH = 350;
  static PORTRAIT_HEIGHT = 520;
  static COLOR_MAP = SEA_COLOR_MAP;
  static MIN_SCALE = 0.85;       // on a phone, below this the host gives the figure the full width
  static ARIA_LABEL = 'A small temple on a hillock in the sea with a stone pathway from the shore. An hour slider moves the tide: at low tide the path is dry, at high tide it is under water. A curve shows two high tides and two low tides in a day.';
  static CONTROLS = [];

  _h = 0;

  async setup() {
    await super.setup();
    this.ctl = ctlBar(this, [{ kind: 'range', id: 'h', label: 'Clock', min: 0, max: 24, step: 0.25, value: 0, read: (v) => clock(Math.min(23.98, v)) }], (id, v) => { this._h = v; this.repaint(); });
    this.enter(this.stepIndex);
    this.repaint();
  }

  css() { return '.svs { padding: 6px; }'; }

  enter(step) {
    this._h = REST[step] ?? 0;
    this.ctl?.set('h', Math.round(this._h * 4) / 4);
    this.ctl?.show('h', step > 0);
  }

  stageHeight(st) { return st.portrait ? 390 : 410; }

  paint(st) {
    const W = st.W, H = st.H, P = st.portrait, step = this.stepIndex, h = this._h;
    const stripH = 84, sH = H - stripH - 6, base = sH * 0.74, rangePx = P ? 30 : 34, seaY = base - level(h) * rangePx;
    const pathY = base - rangePx * 0.1, hx = W * (P ? 0.72 : 0.7);
    let s = `<defs>${svgSkyGradient('tc-sky', 0, 10)}</defs><rect width="${W}" height="${sH}" style="fill:url(#tc-sky)"/>`;
    s += svgCloud(W * 0.3, sH * 0.18, P ? 0.5 : 0.66, { seed: 3 });
    // Sea bed, then the far water, the hillock, the pathway, and the near water that climbs over them.
    s += svgSeaColumn(0, seaY, 1, { w: W, h: sH - seaY, bands: 3, wave: 2, t: 1 });
    const hs = P ? 0.92 : 1.05;
    s += svgHillTemple(hx, pathY + 22, hs);
    s += `<path d="M-6 ${base - 56}Q${W * 0.14} ${base - 54} ${W * 0.2} ${pathY - 2}L${W * 0.26} ${sH}L-6 ${sH}Z" ${fill(sc('sand'))}/>`;
    s += svgPalm(W * 0.07, base - 54, P ? 0.72 : 0.88, { lean: 12 });
    // Stone pathway on a low causeway; the near water covers it when the sea is above it.
    const x0 = W * 0.2, x1 = hx - 86 * hs, n = Math.round((x1 - x0) / 30);
    const blocks = (o) => { let q = ''; for (let i = 0; i < n; i++) { const x = x0 + i * (x1 - x0) / n; q += `<rect x="${x}" y="${pathY}" width="${(x1 - x0) / n - 3}" height="12" rx="3" ${fill(i % 2 ? sc('metal') : sc('metalLit'), `stroke:${sc('metalDark')};stroke-width:1.5;${o}`)}/>`; } return q; };
    s += `<rect x="${x0 - 4}" y="${pathY + 11}" width="${x1 - x0 + 8}" height="${sH - pathY}" ${fill(sc('rockDark'))}/>` + blocks('');
    s += svgSeaColumn(0, seaY, 1, { w: W, h: sH - seaY, bands: 3, wave: 2.4, t: 1 });
    if (seaY < pathY) s += blocks('opacity:0.4');
    s += svgWaveLine(0, seaY, 1, { w: W, amp: 2.4, t: 1 });
    s += seaLabel(W * 0.46, Math.min(pathY - 12, seaY - 12), seaY < pathY ? 'Path under water' : 'Path dry', { size: P ? 15 : 17 });
    s += seaLabel(W / 2, 28, `${clock(Math.min(23.98, h))}  ${stateOf(h)}`, { size: P ? 21 : 25, display: true });
    // The strip: one day of tide.
    const sy = sH + 6, xOf = (t) => 22 + t / 24 * (W - 44), yOf = (t) => sy + stripH * 0.52 - level(t) * stripH * 0.22;
    s += `<rect x="0" y="${sy - 6}" width="${W}" height="${stripH + 8}" ${fill(sc('cloud'))}/>`;
    const pts = []; for (let t = 0; t <= 24.01; t += 0.25) pts.push([xOf(t), yOf(t)]);
    s += `<path d="M22 ${sy + stripH * 0.52}H${W - 22}" ${stroke(INK, 2, 'stroke-dasharray:6 6;opacity:0.5')}/><path d="${line(pts)}" ${stroke(sc('band3'), 5)}/>`;
    for (const t of [0, 6, 12, 18, 24]) s += words(Math.max(26, Math.min(W - 28, xOf(t))), sy + stripH - 8, `${t} h`, { size: 15, ink: INK });
    if (step === 2) {
      const hi = [HIGH, HIGH + PERIOD], lo = [HIGH + PERIOD / 2, HIGH - PERIOD / 2, HIGH + 1.5 * PERIOD].filter((t) => t >= 0 && t <= 24);
      for (const t of hi) s += `<circle cx="${xOf(t)}" cy="${yOf(t)}" r="7" ${fill(sc('grass'), `stroke:${INK};stroke-width:2`)}/>`;
      for (const t of lo) s += `<circle cx="${xOf(t)}" cy="${yOf(t)}" r="7" ${fill(sc('red'), `stroke:${INK};stroke-width:2`)}/>`;
      const a = xOf(hi[0]), b = xOf(hi[1]), y = sy + 10;
      s += `<path d="M${a} ${y + 4}V${yOf(hi[0])}M${b} ${y + 4}V${yOf(hi[1])}" ${stroke(INK, 2)}/>` + words((a + b) / 2, y + 5, 'about 12 h 25 min', { size: 15, ink: INK, halo: sc('cloud') });
    }
    s += `<circle cx="${xOf(h)}" cy="${yOf(h)}" r="10" ${fill(sc('sunCore'), `stroke:${INK};stroke-width:3`)}/>`;
    return { svg: frame(st, 'tc', s) };
  }
}
