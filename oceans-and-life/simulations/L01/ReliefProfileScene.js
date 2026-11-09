// ReliefProfileScene - the whole section of the sea floor, coast to coast, with the sea on it. Each name lights
// its part and dims the rest (dim and line width, no glow). Mounted twice:
//   4 beats, blk-l01-s04: shelf, slope, rise, plain, one named on each beat; an oil rig and fish stand on the shelf.
//   3 beats, blk-l01-s07: how the parts formed (volcanic ones lit), deep and shallow (sunlit band), and what people do.
// A beat presets the lit name; a tap changes it. State comes from the step.
import { SvgScene, fill, stroke } from 'simulations/base/kit/SimSvg.js';
import { tapLight } from 'simulations/base/kit/TapLight.js';
import { SEA_COLOR_MAP, svgSeaColumn, svgWaveLine, svgOilRig, svgCountryBoat, svgCargoShip, svgFish, svgCoral, svgSeagrass, svgSeaColour as sc, svgSkyGradient, pathLine as line } from '../shared/SeaArt.js';
import { svgSeaFloor, mapper, floorDepth, FEATURES } from '../shared/SeaFloor.js';
import { frame, seaLabel, seaWhite } from '../shared/SeaBits.js';

const S_SHELF = 0, S_SLOPE = 1, S_RISE = 2, S_PLAIN = 3, S_FORM = 4, S_DEPTH = 5, S_USE = 6;
const one = (idx) => [{ idx, dwellMs: null }];
const MAP4 = [one(S_SHELF), one(S_SLOPE), one(S_RISE), one(S_PLAIN)], MAP3 = [one(S_FORM), one(S_DEPTH), one(S_USE)];
const f = (id) => FEATURES.find((x) => x.id === id);
const CHIPS4 = [{ id: 'shelf', label: 'Shelf', targets: ['shelf'], tone: 2 }, { id: 'slope', label: 'Slope', targets: ['slope'], tone: 1 }, { id: 'rise', label: 'Rise', targets: ['rise'], tone: 4 }, { id: 'plain', label: 'Plain', targets: ['plain'], tone: 5 }];
const CHIPS3 = [{ id: 'ridge', label: 'Ridge', targets: ['ridge', 'rift'], tone: 6 }, { id: 'seamount', label: 'Seamount', targets: ['seamount'], tone: 7 }, { id: 'island', label: 'Island', targets: ['island'], tone: 1 }, { id: 'trench', label: 'Trench', targets: ['trench'], tone: 5 }, { id: 'shelf', label: 'Shelf', targets: ['shelf'], tone: 2 }];
const PRESET = { [S_SHELF]: 'shelf', [S_SLOPE]: 'slope', [S_RISE]: 'rise', [S_PLAIN]: 'plain', [S_FORM]: 'ridge', [S_USE]: 'shelf' };

export class ReliefProfileScene extends SvgScene {
  static BEAT_STEP_MAP = MAP4;
  static BEAT_MAPS = { 4: MAP4, 3: MAP3 };
  static WIDTH = 660;
  static HEIGHT = 480;
  static PORTRAIT_WIDTH = 350;
  static PORTRAIT_HEIGHT = 480;
  static COLOR_MAP = SEA_COLOR_MAP;
  static MIN_SCALE = 0.85;       // on a phone, below this the host gives the figure the full width
  static ARIA_LABEL = 'A side view of the sea floor from one continent to another: the shelf with an oil rig, the slope, the rise, the flat plain, a seamount, a volcanic island, a ridge with a rift valley, and a deep trench. Names light each part.';
  static CONTROLS = [];

  tl = tapLight({ label: 'Parts of the sea floor', chips: CHIPS4, onChange: () => this.repaint() });

  async setup() {
    await super.setup();
    this.tl.mount(this.root, this);
    this.enter(this.stepIndex);
    this.repaint();
  }

  destroy() { this.tl.destroy(); super.destroy(); }

  css() { return '.svs { padding: 6px; }'; }

  enter(step) {
    if (!this.tl?.set) return;
    this.tl.set({ chips: step >= S_FORM ? CHIPS3 : CHIPS4, lit: PRESET[step] ?? null });
    this.relayout?.();
  }

  stageHeight(st) { return st.portrait ? 330 : 380; }

  paint(st) {
    const W = st.W, H = st.H, P = st.portrait, step = this.stepIndex, seaY = H * 0.2, s = P ? 0.5 : 0.72;
    const zoom = step < S_FORM;                  // the four parts near the coast fill the stage
    const box = { x: 0, y: 0, w: zoom ? W * 1000 / (P ? 520 : 600) : W, h: H, seaY }, mp = mapper(box), X = mp.X, Y = (x) => mp.Y(floorDepth(x));
    const lit = this.tl.lit();
    let body = `<defs>${svgSkyGradient('rp-sky', 0, 12)}</defs><rect width="${W}" height="${seaY + 4}" style="fill:url(#rp-sky)"/>`;
    body += svgSeaColumn(0, seaY, 1, { w: W, h: H - seaY, bands: 6, t: 0.6, wave: 2.4 });
    if (step === S_DEPTH) body += `<rect x="0" y="${seaY}" width="${W}" height="${Y(204) - seaY + 6}" ${fill(sc('sunCore'), 'opacity:0.42')}/>`;
    body += svgSeaFloor(box, { step: 5, to: zoom ? (P ? 530 : 610) : 1000 });
    const shelfY = Y(145);
    body += svgSeagrass(X(120), Y(120) + 2, P ? 0.36 : 0.5, { t: 1 }) + svgCoral(X(182), Y(182) + 2, P ? 0.34 : 0.46, { seed: 1 });
    body += svgFish(X(126), seaY + (shelfY - seaY) * 0.5, P ? 0.3 : 0.42) + svgFish(X(190), seaY + (shelfY - seaY) * 0.4, P ? 0.26 : 0.36, { kind: 1, flip: true });
    body += svgOilRig(X(158), seaY + 2, s * 0.8, { legs: (shelfY - seaY) / (s * 0.8) + 4 });
    if (step === S_USE) body += svgCountryBoat(X(70), seaY + 2, s) + svgCargoShip(X(430), seaY + 2, s * 0.8);
    body += svgWaveLine(0, seaY, 1, { w: W, amp: 2.4, t: 0.6 });
    if (lit.length) {
      // Dim all that is not named.
      const parts = FEATURES.filter((q) => lit.includes(q.id)), rs = parts.map((q) => [X(q.from), X(q.to)]).sort((a, b) => a[0] - b[0]);
      let c = 0, dim = '';
      const col = (a, b) => (b > a ? `<rect x="${a}" y="${seaY + 1}" width="${b - a}" height="${H - seaY}" ${fill(sc('ink'), 'opacity:0.42')}/>` : '');
      for (const [a, b] of rs) { dim += col(c, a); c = Math.max(c, b); }
      body += dim + col(c, W);
      for (const q of parts) {
        const seg = []; for (let x = q.from; x <= q.to; x += 3) seg.push([X(x), Y(x)]);
        body += `<path d="${line(seg)}" ${stroke(sc('sunCore'), 6)}/>`;
      }
      if (parts.length <= 2) {
        const q = parts[0], sz = P ? 17 : 19, hw = q.name.length * sz * 0.3 + 10, x = Math.max(hw, Math.min(W - hw, X(q.x))), y = Y(q.x);
        const ly = q.id === 'shelf' ? y + 44 : y - 30;
        body += seaWhite(x, ly, q.name, { size: sz, display: true });
      }
    }
    // Where the plates are thought to go: apart at a ridge, one under the other at a trench.
    const plateArrow = (x0, y0, dx, dy) => { const L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L; return `<path d="M${x0} ${y0}l${dx} ${dy}" ${stroke(sc('cloud'), 5)}/><path d="M${x0 + dx + ux * 12} ${y0 + dy + uy * 12}L${x0 + dx - uy * 9} ${y0 + dy + ux * 9}L${x0 + dx + uy * 9} ${y0 + dy - ux * 9}Z" ${fill(sc('cloud'))}/>`; };
    if (lit.includes('rift')) { const y = H - (P ? 56 : 64), x = X(756); body += plateArrow(x - 12, y, P ? -30 : -46, 0) + plateArrow(x + 12, y, P ? 30 : 46, 0); }
    if (lit.includes('trench')) body += plateArrow(X(960), H - 70, -(P ? 28 : 44), P ? 26 : 34);
    if (step === S_DEPTH) body += seaLabel(X(380), seaY + 26, 'Sunlight reaches this far', { size: P ? 14 : 16 });
    if (step === S_USE && !P) body += seaWhite(X(450), seaY + 62, 'Ships keep to deep water', { size: 15 });
    body += seaWhite(W - 10, H - 12, 'Depths not to scale', { anchor: 'end', size: 15 });
    return { svg: frame(st, 'rp', body) };
  }
}
