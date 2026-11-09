// SunMoonEarthScene - the Sun, the Earth and the Moon's four positions, seen from above, as in a tide diagram.
// The Sun is off to the left, too far to draw at size. Four named buttons put the Moon at full, first quarter,
// new, third quarter; an inset shows how it looks from Earth. Mounted twice:
//   1 beat, the predict: the four named buttons and the Moon's place, no bulge, no pull arrows, no tide words.
//   3 beats, blk-l03-s03: beat 0 rests at full moon (spring); beat 1 first quarter (neap); beat 2 new moon.
// Pull arrows line up in a spring tide and stand at a right angle in a neap tide. The oval lies along the Moon.
import { SvgScene, fill, stroke } from 'simulations/base/kit/SimSvg.js';
import { SEA_COLOR_MAP, svgEarthDisc, svgMoon, svgSun, svgSunGlow, svgSeaColour as sc, pathRoundRect } from '../shared/SeaArt.js';
import { frame, words, seaWhite, ctlBar, WHITE } from '../shared/SeaBits.js';

const one = (idx) => [{ idx, dwellMs: null }];
const S_SETUP = 0, S_SPRING = 1, S_NEAP = 2, S_WORD = 3;
// angle on screen: full to the right, first quarter below, new to the left, third quarter above
const POS = { full: { a: 0, ph: 0.5, name: 'Full moon', kind: 'spring' }, first: { a: 90, ph: 0.25, name: 'First quarter', kind: 'neap' }, new: { a: 180, ph: 0, name: 'New moon', kind: 'spring' }, third: { a: 270, ph: 0.75, name: 'Third quarter', kind: 'neap' } };
const REST = { [S_SETUP]: 'full', [S_SPRING]: 'full', [S_NEAP]: 'first', [S_WORD]: 'new' };

export class SunMoonEarthScene extends SvgScene {
  static BEAT_STEP_MAP = [one(S_SPRING), one(S_NEAP), one(S_WORD)];
  static BEAT_MAPS = { [Number.MAX_SAFE_INTEGER]: [one(S_SETUP)], 1: [one(S_SETUP)], 3: [one(S_SPRING), one(S_NEAP), one(S_WORD)] };
  // A setup mount on a predict gets onBeatChange(MAX, MAX) from the host, so MAX has its own map.
  static WIDTH = 680;
  static HEIGHT = 500;
  static PORTRAIT_WIDTH = 350;
  static PORTRAIT_HEIGHT = 500;
  static COLOR_MAP = SEA_COLOR_MAP;
  static MIN_SCALE = 0.85;       // on a phone, below this the host gives the figure the full width
  static ARIA_LABEL = 'The Sun to the left, the Earth in the middle and the Moon at four positions round it. At full moon and new moon the three lie in a straight line. At the two quarter moons the Moon stands at a right angle to that line.';
  static CONTROLS = [];

  _at = 'full';

  async setup() {
    await super.setup();
    this.ctl = ctlBar(this, [{ kind: 'seg', id: 'at', label: 'Moon position', options: Object.entries(POS).map(([value, p]) => ({ value, label: p.name })), value: 'full' }], (id, v) => { this._at = v; this.repaint(); });
    this.enter(this.stepIndex);
    this.repaint();
  }

  // On a predict card: the row clears the host's action bar at 1280 and stays 44 px on a phone, where the card scales the scene to about 0.78.
  css() { return '.svs { padding: 6px; } .sim-dom-root--portrait.svs { padding: 4px 0; } .ss-seg .ss-btn { padding: 4px 10px; } .svs.sm-setup:not(.sim-dom-root--portrait) { padding-bottom: 28px; } .sim-dom-root--portrait.sm-setup .ss-seg .ss-btn { min-height: 58px; flex: 1 1 42%; }'; }

  enter(step) { this._at = REST[step]; this.ctl?.set('at', this._at); this.ctl?.el?.closest?.('.svs')?.classList?.toggle('sm-setup', step === S_SETUP); this.relayout?.(); }

  stageHeight(st) { return st.portrait ? 320 : (this.stepIndex === S_SETUP ? 335 : 370); }   // the predict card is shorter

  paint(st) {
    const W = st.W, H = st.H, P = st.portrait, step = this.stepIndex, pos = POS[this._at], setup = step === S_SETUP;
    const cx = W * (P ? 0.58 : 0.55), cy = H * 0.52, R = P ? 40 : 52, orb = Math.min(H * 0.38, P ? 112 : 142), a = pos.a * Math.PI / 180, mx = cx + Math.cos(a) * orb, my = cy + Math.sin(a) * orb;
    let s = `<defs>${svgSunGlow('sm-g')}</defs><rect width="${W}" height="${H}" ${fill(sc('band6'))}/>`;
    for (let i = 0; i < 46; i++) s += `<circle cx="${(i * 89.3) % W}" cy="${(i * 53.1) % H}" r="${1 + (i % 3) * 0.6}" ${fill(WHITE, 'opacity:0.7')}/>`;
    const sx = P ? 18 : 40, sr = P ? 0.86 : 1.2;
    s += `<circle cx="${sx}" cy="${cy}" r="${140 * sr}" style="fill:url(#sm-g)"/>` + svgSun(sx, cy, sr);
    s += `<circle cx="${cx}" cy="${cy}" r="${orb}" ${stroke(WHITE, 2.5, 'stroke-dasharray:7 8;opacity:0.65;fill:none')}/>`;
    if (!setup) {
      // The oval lies along the line to the Moon. In a neap tide it is shorter: the Sun's own bulge is across it.
      const big = pos.kind === 'spring' ? (P ? 26 : 32) : (P ? 13 : 16);
      s += `<ellipse cx="${cx}" cy="${cy}" rx="${R + 6 + big}" ry="${R + 8 - big * 0.1}" transform="rotate(${pos.a} ${cx} ${cy})" ${fill(sc('band2'))}/>`;
    }
    s += svgEarthDisc(cx, cy, R / 100);
    if (!setup) {
      const arrow = (x0, y0, x1, y1, col) => { const L = Math.hypot(x1 - x0, y1 - y0), ux = (x1 - x0) / L, uy = (y1 - y0) / L; return `<path d="M${x0} ${y0}L${x1} ${y1}" ${stroke(col, 6)}/><path d="M${x1 + ux * 13} ${y1 + uy * 13}L${x1 - uy * 10} ${y1 + ux * 10}L${x1 + uy * 10} ${y1 - ux * 10}Z" ${fill(col)}/>`; };
      const ex = R + (P ? 34 : 44);
      s += arrow(cx - ex, cy, cx - ex - 44, cy, sc('sunCore'));
      s += arrow(cx + Math.cos(a) * ex, cy + Math.sin(a) * ex, cx + Math.cos(a) * (ex + (orb - ex) * 0.5), cy + Math.sin(a) * (ex + (orb - ex) * 0.5), sc('cloud'));
    }
    // The Moon from above: its Sun side is lit.
    const mr = P ? 15 : 19;
    s += `<circle cx="${mx}" cy="${my}" r="${mr}" ${fill(sc('moonDark'))}/><path d="M${mx} ${my - mr}A${mr} ${mr} 0 0 0 ${mx} ${my + mr}Z" ${fill(sc('moon'))}/>`;
    if (setup) {
      // The Moon's own label goes inside the path, on the side away from the Sun's glow, so it clears every position.
      const left = this._at !== 'new';
      s += seaWhite(cx, cy + R + 22, 'Earth', { size: 15 }) + seaWhite(mx + (left ? -mr - 8 : mr + 8), my + 5, 'Moon', { size: 15, anchor: left ? 'end' : 'start' }) + seaWhite(14, 24, 'Sun', { anchor: 'start', size: 15 });
      s += seaWhite(W - 12, H - 14, "the Moon's path round the Earth", { anchor: 'end', size: 15 });
      return { svg: frame(st, 'sm', s) };
    }
    // Inset: as seen from Earth.
    const ix = W - (P ? 44 : 56), iy = P ? 44 : 54;
    s += `<path d="${pathRoundRect(ix - (P ? 40 : 50), iy - (P ? 38 : 46), P ? 80 : 100, P ? 92 : 112, 12)}" ${fill(sc('ink'), `stroke:${WHITE};stroke-width:2`)}/>` + svgMoon(ix, iy - 2, P ? 0.72 : 0.9, { phase: pos.ph });
    s += words(ix, iy + (P ? 46 : 58), 'From Earth', { size: 15, ink: WHITE });
    s += seaWhite(14, H - 14, pos.name, { anchor: 'start', size: P ? 20 : 24, display: true });
    if (!setup) s += seaWhite(W - 12, H - 14, pos.kind === 'spring' ? 'Spring tide' : 'Neap tide', { anchor: 'end', size: P ? 20 : 24, display: true });
    s += seaWhite(14, 24, 'Sun', { anchor: 'start', size: 15 });
    return { svg: frame(st, 'sm', s) };
  }
}
