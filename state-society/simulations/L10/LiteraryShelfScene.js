// LiteraryShelfScene - five drawn shelves of books; tap a shelf to read its works. L10 blk-l10-s06, 3 beats.
// A beat presets a shelf it names, so the figure matches the sentence on a cold start. No count of works anywhere.
import { SimScene } from 'simulations/base/kit/SimScene.js';
import { mix, darken, lighten, rr, drawBackdrop, drawCard, drawVignette } from 'simulations/base/kit/SimLook.js';
import { tapLight, tapLightControl } from 'simulations/base/kit/TapLight.js';
import { ease, say, plate } from '../L09/SstWorld.js';

const W = 680, H = 520;
const MAP = [0, 1, 2].map((idx) => [{ idx, dwellMs: null }]);
const SHELVES = [
  { id: 'gram', label: 'Grammar', title: 'Sanskrit grammar', tone: 's1', books: 3, works: ['P\u0101\u1E47ini\u2019s A\u1E63h\u1E6D\u0101dhy\u0101y\u012B', 'Pi\u1E45gala\u2019s Chhanda\u015Bh\u0101stra', 'Pata\u00F1jali\u2019s Mah\u0101bh\u0101\u1E63hya'] },
  { id: 'smrt', label: 'Sm\u1E5Biti', title: 'Sm\u1E5Biti: dharma, law, ethics', tone: 's2', books: 4, works: ['Manu-sm\u1E5Biti', 'Y\u0101j\u00F1avalkya Sm\u1E5Biti', 'N\u0101rada Sm\u1E5Biti', 'Vi\u1E63h\u1E47u Sm\u1E5Biti'] },
  { id: 'medi', label: 'Medicine', title: 'Classical works on medicine', tone: 's3', books: 2, works: ['Charakasamhit\u0101', 'Su\u015Bhrutasamhit\u0101'] },
  { id: 'kavy', label: 'K\u0101vya', title: 'Sanskrit poetry and k\u0101vya', tone: 's4', books: 2, works: ['K\u0101lid\u0101sa\u2019s Raghuva\u1E43\u015Bha', 'K\u0101lid\u0101sa\u2019s Kum\u0101rasambhava'] },
  { id: 'taml', label: 'Tamil', title: 'Tamil literature', tone: 's8', books: 7, works: ['Tiruvalluvar\u2019s Tirukkural', 'Silappadik\u0101ram, Ma\u1E47im\u0113kalai', 'Sangam texts: akam and puram'] },
];
const CHIPS = SHELVES.map((s, i) => ({ id: s.id, label: s.label, targets: [s.id], tone: [1, 2, 3, 4, 8][i] }));
const BAY = { y: 22, h: 196, top: 40 };

export class LiteraryShelfScene extends SimScene {
  static BEAT_STEP_MAP = MAP;
  static CONTINUOUS = false;
  static IRIS = false;
  static NOTE_STAGE = -1;
  static CONTROLS_IN_SIGHT = true;
  static ARIA_LABEL = 'A wooden shelf with five bays of palm-leaf books: Sanskrit grammar, smriti, medicine, kavya and Tamil literature. Tap a bay name and its works appear in large type below.';
  static CONTROLS = [tapLightControl({ id: 'lit', label: 'Shelf', chips: CHIPS })];

  tl = tapLight({ chips: CHIPS, onChange: () => { this._at = this.clock; this.animateFor(600); } });
  _at = 0;
  _seen = new Set();

  getControlValue(id) { return id === 'lit' ? this.tl.controlValue() : undefined; }
  onControlChange(id, v) { if (id === 'lit') this.tl.fromControl(v); }

  enter(s) {
    this._at = this.clock;
    this.tl.set({ lit: s === 1 ? 'gram' : s === 2 ? 'kavy' : null });
    if (!s) this.tl.reset();
  }

  busy() { return this.clock - this._at < 0.6; }

  draw(ctx, c) {
    drawBackdrop(ctx, c, 'plain');
    const lit = this.tl.lit()[0] ?? null, k = ease((this.clock - this._at) / 0.4);
    const wood = mix(c.s8, c.waste, 0.5);
    ctx.fillStyle = darken(wood, 0.3); rr(ctx, 10, BAY.y - 10, W - 20, BAY.h + 24, 14); ctx.fill();
    const bw = (W - 44) / 5;
    SHELVES.forEach((s, i) => this._bay(ctx, c, 16 + i * (bw + 3), bw, s, lit === null || lit === s.id, lit === s.id));
    ctx.fillStyle = lighten(wood, 0.12); rr(ctx, 10, BAY.y + BAY.h - 2, W - 20, 16, 7); ctx.fill();
    const y0 = BAY.y + BAY.h + 26;
    drawCard(ctx, c, 12, y0, W - 24, H - y0 - 12);
    const sh = SHELVES.find((s) => s.id === lit);
    if (!sh) {
      say(ctx, c, 'Tap a shelf to open it', W / 2, y0 + 110, { size: 34, col: c.labelMuted });
    } else {
      ctx.save(); ctx.globalAlpha *= k;
      say(ctx, c, sh.title, W / 2, y0 + 38, { size: 32, col: c[`${sh.tone}ink`] });
      sh.works.forEach((w, i) => say(ctx, c, w, W / 2, y0 + 92 + i * 44, { size: 29, weight: 600, display: false }));
      ctx.restore();
    }
    drawVignette(ctx, c, 0.25);
  }

  _bay(ctx, c, x, w, s, on, picked) {
    ctx.fillStyle = mix(c.bgDeep, darken(mix(c.s8, c.waste, 0.5), 0.45), 0.6);
    rr(ctx, x, BAY.y, w, BAY.h, 8); ctx.fill();
    const col = c[s.tone], n = s.books, gap = 5, bw = Math.min(30, (w - 18 - gap * (n - 1)) / n);
    let bx = x + (w - (n * bw + (n - 1) * gap)) / 2;
    for (let i = 0; i < n; i++) {
      const h = 118 + ((i * 37) % 44), y = BAY.y + BAY.h - h - 2;
      ctx.save(); ctx.globalAlpha *= on ? 1 : 0.36;
      ctx.fillStyle = darken(col, 0.24); rr(ctx, bx, y, bw, h, 5); ctx.fill();
      ctx.fillStyle = i % 2 ? col : lighten(col, 0.12); rr(ctx, bx, y, bw - 4, h, 5); ctx.fill();
      ctx.fillStyle = darken(col, 0.3); rr(ctx, bx + 3, y + 16, bw - 10, 5, 2); ctx.fill(); rr(ctx, bx + 3, y + h - 22, bw - 10, 5, 2); ctx.fill();
      ctx.restore();
      bx += bw + gap;
    }
    if (picked) { ctx.lineWidth = 5; ctx.strokeStyle = c[`${s.tone}ink`]; rr(ctx, x + 1, BAY.y + 1, w - 2, BAY.h - 2, 8); ctx.stroke(); }
    plate(ctx, c, s.label, x + w / 2, BAY.y + 22, { size: 28, alpha: on ? 1 : 0.6 });
  }
}
