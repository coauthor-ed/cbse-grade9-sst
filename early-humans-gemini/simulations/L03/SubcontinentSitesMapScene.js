// SubcontinentSitesMapScene - L03 s03. Sites of the book's Fig. 4.8, sorted as the figure's legend sorts them.
// Three kinds by shape as well as colour. Chips light one kind. Attirampakkam and Isampur carry their dates.
import { SimScene } from 'simulations/base/kit/SimScene.js';
import { GEO_COLOR_MAP } from 'simulations/base/kit/GeoLook.js';
import { clamp01, outBack } from 'simulations/base/kit/SimLook.js';
import { tapLight, tapLightControl } from 'simulations/base/kit/TapLight.js';
import { loadEraMap, eraView, drawEraBase, eraPin, eraLabel, eraCredit, ERA_RIVERS } from '../shared/EraMap.js';

const m = (idx) => [{ idx, dwellMs: null }];
const S_TWO = 0, S_PAL = 1, S_MES = 2, S_NEO = 3;
const EXT = [[60, 6], [100, 36.6]];
const CHIPS = [
  { id: 'pal', label: 'Palaeolithic', targets: ['pal'], tone: 3 },
  { id: 'mes', label: 'Mesolithic', targets: ['mes'], tone: 1 },
  { id: 'neo', label: 'Neolithic', targets: ['neo'], tone: 2 },
];
const SHAPE = { pal: 'circle', mes: 'square', neo: 'tri' };
const TONE = { pal: 's3', mes: 's1', neo: 's2' };
// Labelled sites first. dx, dy: where the label sits from the pin.
const SITES = {
  pal: [
    { n: 'Attirampakkam', at: [79.87, 13.23], dx: 98, dy: 12, big: true },
    { n: 'Isampur', at: [76.5, 16.5], dx: -70, dy: 4, big: true },
    { n: 'Hathnora', at: [77.0, 22.9], dx: 82, dy: 0 },
    { n: 'Didwana', at: [74.6, 27.4], dx: -66, dy: -4 },
    { n: 'Chirki-Nevasa', at: [74.9, 19.5], dx: -112, dy: 0 },
    { n: 'Jwalapuram', at: [78.1, 15.3], dx: 96, dy: -10 },
    { n: 'Riwat', at: [73.3, 33.5], dx: -60, dy: 26 },
    { n: 'Sanghao Cave', at: [72.3, 34.4], dx: -96, dy: 0 },
    { at: [73.9, 32.8] }, { at: [77.3, 28.4] }, { at: [69.0, 22.9] }, { at: [70.4, 21.0] }, { at: [75.0, 20.6] }, { at: [76.0, 22.4] },
    { at: [82.3, 24.7] }, { at: [83.0, 25.2] }, { at: [86.2, 23.2] }, { at: [79.5, 13.7] }, { at: [80.2, 12.9] },
  ],
  mes: [
    { n: 'Bagor', at: [74.4, 25.35], dx: -56, dy: -8 },
    { n: 'Loteshwar', at: [71.8, 23.6], dx: -82, dy: 4 },
    { n: 'Bhimbetka', at: [77.6, 23.0], dx: 88, dy: -6 },
    { n: 'Teri sites', at: [78.1, 8.8], dx: -72, dy: 8 },
    { at: [75.1, 20.3] }, { at: [76.3, 22.1] }, { at: [82.2, 24.5] },
  ],
  neo: [
    { n: 'Mehrgarh', at: [67.6, 29.4], dx: -30, dy: -30 },
    { n: 'Burzahom', at: [74.9, 34.2], dx: 80, dy: -8 },
    { n: 'Lahuradewa', at: [82.9, 26.8], dx: 48, dy: -30 },
    { n: 'Daojali Hading', at: [93.1, 25.2], dx: -6, dy: 32 },
    { n: 'Sanganakallu', at: [76.9, 15.2], dx: -100, dy: 22 },
  ],
};

export class SubcontinentSitesMapScene extends SimScene {
  static BEAT_STEP_MAP = [m(0), m(1), m(2), m(3)];
  static COLOR_MAP = GEO_COLOR_MAP;
  static NOTE_STAGE = -1;
  static DRAGGABLE = false;
  static CONTROLS_IN_SIGHT = true;
  static ARIA_LABEL = 'A relief map of the Indian subcontinent. Attirampakkam is dated to 1.5 to 1.7 million years ago and Isampur to 1.2 million years ago. Round pins mark Palaeolithic sites, square pins Mesolithic sites and triangles Neolithic sites. Chips light one kind.';
  static CONTROLS = [tapLightControl({ id: 'lit', label: 'Show', chips: CHIPS })];
  tl = tapLight({ chips: CHIPS });

  getControlValue(id) { return id === 'lit' ? this.tl.controlValue() : undefined; }
  isControlDisabled(id) { return id === 'lit' && this.tl.disabled(); }
  onControlChange(id, v) { if (id === 'lit') { this.tl.fromControl(v); this.animateFor?.(400); } }
  async setup() { this.map = await loadEraMap(); await super.setup(); await eraView(this, EXT); this.animateFor?.(400); }
  enter() { this.tl.set({ lit: null }); this.requestUiUpdate?.(); }
  busy() { return this.age < 1.3; }

  _layer(ctx, c, kind, on, named) {
    const v = this.view;
    SITES[kind].forEach((s, i) => {
      const q = v.at(s.at), k = on && this.stage === (kind === 'pal' ? S_PAL : kind === 'mes' ? S_MES : S_NEO) ? outBack(clamp01((this.age - i * 0.04) / 0.3)) : 1;
      if (k > 0) eraPin(ctx, c, q[0], q[1], SHAPE[kind], { col: c[TONE[kind]], r: (s.n ? 11 : 8) * k, off: !on });
    });
    if (named) SITES[kind].forEach((s) => {
      if (!s.n) return;
      const q = v.at(s.at);
      eraLabel(ctx, c, s.n, q[0] + s.dx, q[1] + s.dy, { size: 25 });
    });
  }

  draw(ctx, c) {
    const st = this.stage;
    if (!drawEraBase(ctx, c, this, { rivers: ERA_RIVERS.india })) return;
    const v = this.view, lit = this.tl.lit()[0];
    if (st === S_TWO && !lit) {
      const a = SITES.pal[0], b = SITES.pal[1], qa = v.at(a.at), qb = v.at(b.at);
      eraPin(ctx, c, qa[0], qa[1], 'circle', { col: c.s3, r: 16, lit: true });
      eraPin(ctx, c, qb[0], qb[1], 'circle', { col: c.s3, r: 16, lit: true });
      eraLabel(ctx, c, 'Attirampakkam', qa[0] + 128, qa[1] - 30, { size: 26 });
      eraLabel(ctx, c, '1.5 to 1.7 million years ago', qa[0] + 172, qa[1] + 18, { size: 25, bg: c.gold });
      eraLabel(ctx, c, 'Isampur', qb[0] - 120, qb[1] - 26, { size: 26 });
      eraLabel(ctx, c, '1.2 million years ago', qb[0] - 134, qb[1] + 18, { size: 25, bg: c.gold });
      eraCredit(ctx, c, v, { twoX: 262 });
      return;
    }
    const show = lit ?? (st === S_NEO ? 'neo' : st === S_MES ? 'mes' : 'pal');
    const order = ['pal', 'mes', 'neo'].filter((k) => lit || k !== 'neo' || st === S_NEO).filter((k) => lit || k !== 'mes' || st >= S_MES);
    order.filter((k) => k !== show).forEach((k) => this._layer(ctx, c, k, false, false));
    this._layer(ctx, c, show, true, true);
    eraCredit(ctx, c, v, { twoX: 262 });
  }
}
