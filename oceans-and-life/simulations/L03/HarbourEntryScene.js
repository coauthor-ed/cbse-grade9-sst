// HarbourEntryScene - a tanker waits at a shallow bar. A tide slider lifts the water: the sea and the ship rise,
// the bar stays, and two live numbers set the water over the bar against the ship's draught. Numbers are made up:
// water 9 m at low tide, 15 m at high tide; draught 12 m. Hull and water share one scale, so the keel is true. Beats:
//   beat 0  rests at low tide: too shallow, the keel line cuts the bar
//   beat 1  rests at half tide; two range rules: some ports 4 to 5 m, Gulf of Khambhat about 12 m
//   beat 2  rests at high tide: the ship can cross; a tidal current arrow, 5 to 6 knots, about 9 to 11 km/h
import { SvgScene, fill, stroke } from 'simulations/base/kit/SimSvg.js';
import { SEA_COLOR_MAP, svgSeaColumn, svgWaveLine, svgStrata, svgSeaColour as sc, svgSkyGradient, pathLine as line } from '../shared/SeaArt.js';
import { frame, words, seaLabel, seaWhite, ctlBar, INK } from '../shared/SeaBits.js';

const one = (idx) => [{ idx, dwellMs: null }];
const LOW = 9, HIGH = 15, DRAUGHT = 12;
const REST = [0, 50, 100];

export class HarbourEntryScene extends SvgScene {
  static BEAT_STEP_MAP = [one(0), one(1), one(2)];
  static WIDTH = 700;
  static HEIGHT = 470;
  static PORTRAIT_WIDTH = 350;
  static PORTRAIT_HEIGHT = 480;
  static COLOR_MAP = SEA_COLOR_MAP;
  static MIN_SCALE = 0.85;       // on a phone, below this the host gives the figure the full width
  static ARIA_LABEL = 'A large tanker waits at a shallow bar. A tide slider raises the sea. At low tide the water over the bar is 9 metres and the ship needs 12, so it cannot cross. At high tide there is 15 metres, so it can.';
  static CONTROLS = [];

  _tide = 0;

  async setup() {
    await super.setup();
    this.ctl = ctlBar(this, [{ kind: 'range', id: 'tide', label: 'Tide', min: 0, max: 100, step: 1, value: 0, read: (v) => (v < 15 ? 'Low' : v > 85 ? 'High' : 'Middle') }], (id, v) => { this._tide = v; this.repaint(); });
    this.enter(this.stepIndex);
    this.repaint();
  }

  css() { return '.svs { padding: 6px; }'; }

  enter(step) { this._tide = REST[step] ?? 0; this.ctl?.set('tide', this._tide); }

  stageHeight(st) { return st.portrait ? 370 : 390; }

  paint(st) {
    const W = st.W, H = st.H, P = st.portrait, step = this.stepIndex, depth = LOW + (HIGH - LOW) * this._tide / 100;
    const barY = H * 0.77, k = P ? 8.6 : 9, seaY = barY - depth * k, ok = depth > DRAUGHT, keel = seaY + DRAUGHT * k;
    const x0 = W * 0.03, x1 = W * (P ? 0.56 : 0.52);
    let s = `<defs>${svgSkyGradient('he-sky', 0, 10)}</defs><rect width="${W}" height="${seaY + 8}" style="fill:url(#he-sky)"/>`;
    s += svgSeaColumn(0, seaY, 1, { w: W, h: H - seaY, bands: 4, wave: 2, t: 1 });
    // The bar across the way in, with the land beyond it.
    const pts = [[0, H], [0, H * 0.95], [W * 0.56, H * 0.94], [W * 0.66, barY + 4], [W * 0.8, barY], [W * 0.88, barY + 12], [W * 0.95, barY - 24], [W + 6, barY - 80], [W + 6, H]];
    s += `<clipPath id="he-b"><path d="${line(pts)}Z"/></clipPath><g clip-path="url(#he-b)">${svgStrata(0, barY - 84, 1, { w: W + 8, h: H - barY + 86, bands: 4, seed: 4 })}</g><path d="${line(pts.slice(1, 6))}" ${stroke(sc('sand'), 7)}/>`;
    // The ship, cut open by the water line: its hull goes as deep as its draught, on the same scale as the water.
    const deck = seaY - 22, bow = x1 + 26;
    s += `<path d="M${x0} ${deck}H${x1}L${bow} ${deck - 8}Q${bow - 8} ${(deck + keel) / 2} ${x1 - 16} ${keel}H${x0 + 12}Q${x0} ${keel} ${x0} ${keel - 14}Z" ${fill(sc('red'))}/>`;
    s += `<path d="M${x0} ${seaY}H${bow - 6}Q${bow - 8} ${(deck + keel) / 2} ${x1 - 16} ${keel}H${x0 + 12}Q${x0} ${keel} ${x0} ${keel - 14}Z" ${fill(sc('redDark'))}/>`;
    s += `<rect x="${x0}" y="${deck}" width="${x1 - x0 + 12}" height="9" ${fill(sc('hullDark'))}/>`;
    const dx = x0 + 18, dw = (x1 - x0) * 0.26;
    s += `<rect x="${dx}" y="${deck - 46}" width="${dw}" height="46" rx="4" ${fill(sc('white'))}/><rect x="${dx + dw * 0.5}" y="${deck - 46}" width="${dw * 0.5}" height="46" rx="4" ${fill(sc('whiteShade'))}/><rect x="${dx - 5}" y="${deck - 58}" width="${dw + 10}" height="13" rx="3" ${fill(sc('white'))}/><rect x="${dx + 2}" y="${deck - 54}" width="${dw - 4}" height="6" rx="2" ${fill(sc('planeGlass'))}/>`;
    s += `<path d="M${dx + dw + 14} ${deck - 7}H${x1 - 6}" ${stroke(sc('metalDark'), 5)}/>`;
    for (let i = 0; i < 4; i++) { const x = dx + dw + 28 + i * (x1 - dx - dw - 50) / 3; s += `<rect x="${x}" y="${deck - 14}" width="9" height="13" rx="2" ${fill(sc('metal'))}/>`; }
    s += svgWaveLine(0, seaY, 1, { w: W, amp: 2.4, t: 1 });
    // Draught on the hull, and the keel line to the bar: red if it cuts it.
    const hx = (x0 + x1) / 2;
    s += `<path d="M${hx} ${seaY}V${keel}M${hx - 8} ${seaY}h16M${hx - 8} ${keel}h16" ${stroke(sc('cloud'), 4)}/>`;
    const barTop = barY + 2, rx = W * 0.76;
    s += `<path d="M${x1 - 14} ${keel}H${W * 0.84}" ${stroke(ok ? sc('cloud') : sc('sunCore'), 4, 'stroke-dasharray:10 8')}/>`;
    s += `<path d="M${rx} ${seaY}V${barTop}M${rx - 9} ${seaY}h18M${rx - 9} ${barTop}h18" ${stroke(sc('sunCore'), 5)}/>`;
    const rw = P ? 122 : 158, reading = (x, y, t, col) => `<rect x="${x}" y="${y}" width="${rw}" height="32" rx="16" ${fill(sc('cloud'), `stroke:${col};stroke-width:3`)}/>${words(x + rw / 2, y + 22, t, { size: P ? 15 : 17, ink: INK, display: true })}`;
    const rdY = P ? 8 : 10;
    s += reading(8, rdY, `Draught ${DRAUGHT} m`, INK) + reading(W - rw - 8, rdY, `Water ${depth.toFixed(1)} m`, ok ? sc('elevLow') : sc('red'));
    s += seaLabel(14, rdY + 52, 'Numbers made up', { anchor: 'start', size: 15 });
    s += seaWhite(W / 2, H - 10, ok ? 'Deep enough to cross' : depth === DRAUGHT ? 'Just level: still not safe' : 'Too shallow: it must wait', { size: P ? 16 : 18, display: true });
    if (step === 1) {
      const y0 = 118, xa = W - (P ? 128 : 170), xb = W - (P ? 44 : 60);
      const bar = (x, m, t) => `<path d="M${x} ${y0}V${y0 - m * k}M${x - 8} ${y0}h16M${x - 8} ${y0 - m * k}h16" ${stroke(sc('red'), 5)}/>${seaLabel(x, y0 + 20, t, { size: 15 })}`;
      s += `<g transform="translate(0 ${P ? 26 : 30})">${bar(xa, 5, '4 to 5 m')}${bar(xb, 12, 'about 12 m')}${seaLabel(xa, y0 + 42, 'Some ports', { size: 15 })}${seaLabel(xb, y0 + 42, 'Khambhat', { size: 15 })}</g>`;
    }
    if (step === 2) {
      const y = barY - 26, a = W * 0.5, b = W * 0.66;
      s += `<path d="M${a} ${y}H${b}" ${stroke(sc('cloud'), 8)}/><path d="M${b} ${y - 14}l20 14l-20 14Z" ${fill(sc('cloud'))}/>`;
      s += seaWhite((a + b) / 2, y - 16, '5 to 6 knots', { size: P ? 15 : 17, display: true });
    }
    return { svg: frame(st, 'he', s) };
  }
}
