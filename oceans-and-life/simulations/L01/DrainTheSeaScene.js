// DrainTheSeaScene - the line from Mumbai south-west across the Arabian Sea, seen from the side. Mounted twice:
//   1 beat, the predict (blk-l01-s02): the sea stands full and opaque, the floor is hidden, nothing is named.
//   3 beats, blk-l01-s03: beat 0 a slider lowers the water (it rests drained); beat 1 lights shelf and slope;
//   beat 2 lights rise, plain and ridge. Depths are not to scale, and the figure says so.
// State comes from the step. The water is a level, so the shallow ground shows first, as it would.
import { SvgScene, fill, stroke } from 'simulations/base/kit/SimSvg.js';
import { SEA_COLOR_MAP, svgSeaColumn, svgLand, svgCloud, svgSeaColour as sc, svgWaveLine, pathLine as line } from '../shared/SeaArt.js';
import { svgSeaFloor, mapper, floorPts, floorDepth, FEATURES } from '../shared/SeaFloor.js';
import { frame, seaLabel, seaWhite, skyDefs, ctlBar } from '../shared/SeaBits.js';

const S_SETUP = 0, S_DRAIN = 1, S_MARGIN = 2, S_DEEP = 3;
const one = (idx) => [{ idx, dwellMs: null }];
const LINE = { island: false, from: 0, to: 800 };
const fx = (id) => FEATURES.find((f) => f.id === id);
const LIT = { [S_MARGIN]: ['shelf', 'slope'], [S_DEEP]: ['rise', 'plain', 'ridge'] };
const NAME = { shelf: 'Shelf', slope: 'Slope', rise: 'Rise', plain: 'Plain', ridge: 'Ridge' };

export class DrainTheSeaScene extends SvgScene {
  static BEAT_STEP_MAP = [one(S_DRAIN), one(S_MARGIN), one(S_DEEP)];
  static BEAT_MAPS = { [Number.MAX_SAFE_INTEGER]: [one(S_SETUP)], 1: [one(S_SETUP)], 3: [one(S_DRAIN), one(S_MARGIN), one(S_DEEP)] };
  // A setup mount on a predict gets onBeatChange(MAX, MAX) from the host, so MAX has its own map.
  static WIDTH = 640;
  static HEIGHT = 482;
  static PORTRAIT_WIDTH = 350;
  static PORTRAIT_HEIGHT = 470;
  static COLOR_MAP = SEA_COLOR_MAP;
  static MIN_SCALE = 0.85;       // on a phone, below this the host gives the figure the full width
  static ARIA_LABEL = 'A side view of the sea from the coast at Mumbai, going south-west. With the water gone the ground runs out as a shallow ledge, drops steeply, lies flat and deep, and rises into a mountain ridge.';
  static CONTROLS = [];

  _drain = 1;

  async setup() {
    await super.setup();
    this.ctl = ctlBar(this, [{ kind: 'range', id: 'drain', label: 'Water gone', min: 0, max: 100, step: 1, value: 100, read: (v) => `${v}%` }], (id, v) => { this._drain = v / 100; this.repaint(); });
    this.enter(this.stepIndex);
    this.repaint();
  }

  css() { return '.svs { padding: 6px; } .sim-dom-root--portrait.svs { padding: 4px 0; }'; }

  enter(step) {
    this._drain = step === S_SETUP ? 0 : 1;
    this.ctl?.set('drain', Math.round(this._drain * 100));
    this.ctl?.show('drain', step === S_DRAIN);
  }

  stageHeight(st) { return st.portrait ? 350 : 400; }

  paint(st) {
    const W = st.W, H = st.H, P = st.portrait, step = this.stepIndex, seaY = H * 0.3;
    const box = { x: 0, y: 0, w: W, h: H, seaY }, k = { ...LINE, step: 6 };
    const mp = mapper({ ...box, w: W * 1000 / 800 }, k);
    const bx = { ...box, w: W * 1000 / 800 };
    const X = mp.X, Y = (x) => mp.Y(floorDepth(x, LINE));
    const low = seaY + (mp.base - seaY) * 0.92 * this._drain;   // the water surface now
    let body = `<defs>${skyDefs('dr', 14)}</defs><rect width="${W}" height="${H}" style="fill:url(#dr-sky)"/>`;
    body += svgCloud(W * 0.86, seaY * 0.32, P ? 0.44 : 0.66, { seed: 5 });
    const pts = floorPts(bx, k);
    if (step === S_SETUP) {
      // The full sea: nothing below the surface shows, not even the shape of the coast under water.
      body += `<path d="M0 ${pts[0][1]}${line(pts.filter(([x, y]) => y < seaY + 2)).replace('M', 'L')}L${X(88)} ${seaY + 6}L0 ${seaY + 6}Z" ${fill(sc('rock'))}/>`;
      body += svgSeaColumn(0, seaY, 1, { w: W, h: H - seaY, bands: 6, t: 0.7, wave: 3 });
      body += svgWaveLine(0, seaY, 1, { w: W, amp: 3, t: 0.7 });
    } else {
      // Water sits on the ground: draw it first over the whole low part, the rock then covers the rest.
      if (this._drain < 0.995) body += svgSeaColumn(0, low, 1, { w: W, h: H - low, bands: 5, t: 0.7, wave: 2 });
      body += svgSeaFloor(bx, k);
      body += `<path d="M0 ${seaY}H${W}" ${stroke(sc('foam'), 3, 'stroke-dasharray:10 9')}/>`;
      body += seaLabel(W - 8, seaY - 8, 'Old sea level', { anchor: 'end', size: 15 });
    }
    // The coast: Mumbai and the way we walk. This much shows in every state.
    body += svgLand(0, pts[1][1] + 6, 1, { w: X(58), h: 10, kind: 'town', seed: 4 });
    body += seaLabel(8, Math.max(22, pts[0][1] - 46), 'Mumbai', { anchor: 'start', size: P ? 15 : 17, display: true });
    const ax = X(P ? 250 : 190), ay = Math.max(18, seaY - (P ? 66 : 76));
    body += `<path d="M${ax} ${ay}H${ax + (P ? 74 : 110)}" ${stroke(sc('ink'), 4)}/><path d="M${ax + (P ? 74 : 110)} ${ay - 7}l11 7l-11 7Z" ${fill(sc('ink'))}/>`;
    body += seaLabel(ax, ay - 10, 'south-west', { anchor: 'start', size: 15 });
    const lit = LIT[step];
    if (lit) {
      const tags = lit.map((id) => fx(id));
      // Dim every column that is not named on this beat.
      const ranges = tags.map((f) => [X(f.from), X(Math.min(f.to, 800))]).sort((a, b) => a[0] - b[0]);
      let dims = '', c = 0;
      for (const [a, b] of ranges) { if (a > c) dims += `<rect x="${c}" y="${seaY + 1}" width="${a - c}" height="${H - seaY}" ${fill(sc('ink'), 'opacity:0.36')}/>`; c = Math.max(c, b); }
      if (c < W) dims += `<rect x="${c}" y="${seaY + 1}" width="${W - c}" height="${H - seaY}" ${fill(sc('ink'), 'opacity:0.36')}/>`;
      body += `<clipPath id="dr-rock"><path d="${line(pts)}L${W} ${H}L0 ${H}Z"/></clipPath><g clip-path="url(#dr-rock)">${dims}</g>`;
      tags.forEach((f, i) => {
        const a = Math.max(0, f.from), b = Math.min(f.to, 800), seg = [];
        for (let x = a; x <= b; x += 6) seg.push([X(x), Y(x)]);
        body += `<path d="${line(seg)}" ${stroke(sc('sunCore'), 7)}/>`;
        const lx = Math.max(38, Math.min(W - 40, X((a + b) / 2))), ty = Math.min(H - 40, Y((a + b) / 2) - 26) - (i === 0 && tags.length === 3 ? 34 : 0);
        body += seaLabel(lx, ty, NAME[f.id], { size: P ? 16 : 18, display: true });
      });
    }
    if (step !== S_SETUP) body += seaWhite(W - 10, H - 12, 'Depths not to scale', { anchor: 'end', size: 15 });
    return { svg: frame(st, 'dr', body) };
  }
}
