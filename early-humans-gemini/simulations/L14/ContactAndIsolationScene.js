// ContactAndIsolationScene - blk-l14-s03, 4 beats. The same four places. Beat 0: a thick line where the book says strong
// contact. Beat 1: dashed lines for little evidence. Beat 2: thin dotted lines for what this chapter does not say.
// Beat 3: all three kinds with the book's claim. Nothing moves at rest. Every line is a claim, so each kind looks different.
import { SimScene } from 'simulations/base/kit/SimScene.js';
import { clamp, inkOn, pill, inOutSine } from 'simulations/base/kit/SimLook.js';
import { GEO_COLOR_MAP } from 'simulations/base/kit/GeoLook.js';
import { loadEraMap, eraView, drawEraBase, eraCredit, eraLabel, eraPin, ERA_EXTENT, ERA_FULL } from '../shared/EraMap.js';
import { traceLine } from '../L12/ChinaDraw.js';

const MAP = [0, 1, 2, 3].map((idx) => [{ idx, dwellMs: null }]);
const P = { H: [70, 28], M: [45, 32], E: [31.2, 27], C: [113, 35] };
const NAMES = { H: 'Harappans', M: 'Mesopotamia', E: 'Egypt', C: 'China' };
const TONE = { H: 's2', M: 's6', E: 's3', C: 's5' };
const KIND = {
  strong: { w: 11, dash: [], tone: 'good' },
  little: { w: 7, dash: [16, 13], tone: 'warning' },
  unsaid: { w: 4, dash: [2, 12], tone: 'labelMuted' },
};
const LINES = [
  { a: 'H', b: 'M', k: 'strong', seen: 0, bend: [58, 21] },
  { a: 'H', b: 'E', k: 'little', seen: 1, bend: [52, 13] },
  { a: 'H', b: 'C', k: 'little', seen: 1, bend: [92, 24] },
  { a: 'E', b: 'M', k: 'unsaid', seen: 2, bend: [38, 33] },
  { a: 'M', b: 'C', k: 'unsaid', seen: 2, bend: [80, 45] },
  { a: 'E', b: 'C', k: 'unsaid', seen: 2, bend: [70, 13] },
];
const READ = ['Strong contact and trade', 'Little evidence', 'This chapter does not say', 'They developed independently'];

export class ContactAndIsolationScene extends SimScene {
  static BEAT_STEP_MAP = MAP;
  static CONTINUOUS = false;
  static IRIS = false;
  static NOTE_STAGE = -1;
  static COLOR_MAP = GEO_COLOR_MAP;
  static ARIA_LABEL = 'A map of four civilisations and the six pairs between them. A thick line joins the Harappans and Mesopotamia: strong contact. Dashed lines join the Harappans to Egypt and to China: little evidence. Thin dotted lines mark the other three pairs: this chapter does not say.';

  async setup() {
    this.map = await loadEraMap();
    await super.setup();
    await eraView(this, ERA_EXTENT.fourRivers, ERA_FULL);
    this.animateFor(500);
  }

  busy() { return this.age < 1.2; }

  draw(ctx, c) {
    const s = this.stage ?? 0, k = inOutSine(clamp(this.age / 0.9, 0, 1));
    if (!drawEraBase(ctx, c, this, { rivers: [] })) return;
    const v = this.view;
    for (const l of LINES) {
      if (l.seen > s) continue;
      const K = KIND[l.k], a = v.at(P[l.a]), b = v.at(P[l.b]), m = v.at(l.bend), pts = [];
      for (let i = 0; i <= 24; i++) { const u = i / 24, n = 1 - u; pts.push([n * n * a[0] + 2 * n * u * m[0] + u * u * b[0], n * n * a[1] + 2 * n * u * m[1] + u * u * b[1]]); }
      const fresh = l.seen === s;
      ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      if (s < 3 && !fresh) ctx.globalAlpha = 0.45;
      if (l.k === 'strong') { traceLine(ctx, pts, fresh ? k : 1); ctx.strokeStyle = c.bgSurface; ctx.lineWidth = K.w + 5; ctx.stroke(); }
      ctx.setLineDash(K.dash); traceLine(ctx, pts, fresh ? k : 1); ctx.strokeStyle = c[K.tone]; ctx.lineWidth = K.w; ctx.stroke();
      ctx.restore();
    }
    for (const id of Object.keys(P)) {
      const q = v.at(P[id]);
      eraPin(ctx, c, q[0], q[1], 'circle', { r: 13, col: c[TONE[id]], lit: true });
      const dy = id === 'C' ? 46 : id === 'H' ? 44 : -42, dx = id === 'E' ? -6 : id === 'M' ? 30 : 0;
      eraLabel(ctx, c, NAMES[id], q[0] + dx, q[1] + dy, { size: 26, bg: c[TONE[id]], ink: inkOn(c, c[TONE[id]]) });
    }
    const col = [c.good, c.warning, c.bgSurface, c.bgSurface][s];
    pill(ctx, c, READ[s], 340, 44, { size: 32, display: true, bg: col, ink: s >= 2 ? c.label : inkOn(c, col) });
    if (s === 1) pill(ctx, c, 'Not the same as none', 340, 96, { size: 26, display: false, bg: c.bgSurface, ink: c.label });
    if (s === 2) { const q = v.at([37, 36]); eraLabel(ctx, c, 'Other sources: these two did meet', Math.max(250, q[0] + 110), 96, { size: 26, display: false }); }
    eraCredit(ctx, c, v);
  }
}
