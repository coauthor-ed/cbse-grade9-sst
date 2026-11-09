// CholaLadderScene - the Chola empire as land inside land, four levels (same camera as L05).
// Mounts by beat count: 3 = blk-l06-s04, 2 = blk-l06-s07.
//   stages: 0 levels  1 the words one step lower  2 the Ur's assembly at work  3 the candidate  4 the question
import { SimScene } from 'simulations/base/kit/SimScene.js';
import { pill, inkOn, font, mix, drawShadow } from 'simulations/base/kit/SimLook.js';
import { tapLight, tapLightControl } from 'simulations/base/kit/TapLight.js';
import { reducedMotion } from 'simulations/base/kit/SimAnim.js';
import { pal, panel, person, tree } from '../shared/SstArt.js';
import { makeLevel, paintNest } from '../L05/LandNest.js';

const LV = [
  { name: 'man\u1E0Dalam', sub: 'province' },
  { name: 'valan\u0101\u1E0Du', sub: 'district' },
  { name: 'n\u0101\u1E0Du', sub: 'group of villages' },
  { name: 'Ur', sub: 'individual village' },
];
const NEST = [
  { level: makeLevel(3, 2, 61, 4), trees: 3 },
  { level: makeLevel(2, 2, 67, 1), trees: 3, huts: 1, hutScale: 0.4 },
  { level: makeLevel(2, 2, 71, 2), huts: 4, hutScale: 0.7, trees: 1 },
  { village: true },
];
const CHIPS = [1, 2, 3].map((i) => ({ id: `l${i}`, label: LV[i].name, targets: [`l${i}`] }));
const JOBS = [['irrigation', 160, 340], ['revenue', 96, 410], ['land', 96, 470], ['roads', 588, 410], ['records', 588, 470]];
const one = (i) => [{ idx: i, dwellMs: null }];
const ease = (u) => { const k = Math.max(0, Math.min(1, u)); return 0.5 - 0.5 * Math.cos(Math.PI * k); };

export class CholaLadderScene extends SimScene {
  static BEAT_STEP_MAP = [one(0), one(1), one(2)];
  static BEAT_MAPS = { 3: [one(0), one(1), one(2)], 2: [one(3), one(4)] };
  static VISUAL_PROFILE = 'rich';
  static IRIS = false;
  static CONTROLS_IN_SIGHT = true;
  static ARIA_LABEL = 'The Chola empire shown as land inside land: mandalam, valanadu, nadu and Ur, with the view flying down to one village. A table shows how valanadu and nadu are used one step differently. Then the village assembly at work, and the rule for candidates.';
  static CONTROLS = [tapLightControl({ id: 'lit', label: 'Level', chips: CHIPS, noneLabel: LV[0].name })];

  tl = tapLight({ label: 'Levels', chips: CHIPS });

  constructor(container, config) { super(container, config); this._v = 0; this._glide = null; this._seen = false; }

  isControlHidden(id) { return id === 'lit' && this.stage !== 0; }
  getControlValue(id) { return id === 'lit' ? this.tl.controlValue() : undefined; }
  enter(stage) {
    this.tl.set({ lit: null }); this._glide = null;
    this._v = stage >= 2 ? 3 : 0;
    this.requestUiUpdate?.();
  }
  onControlChange(id, v) {
    if (id !== 'lit') return;
    this.tl.fromControl(v);
    const to = Number((this.tl.lit()[0] ?? 'l0').slice(1));
    if (reducedMotion()) this._v = to; else { this._glide = { from: this._v, to, t: 0 }; this.animateFor(1300); }
    if (to === 3 && !this._seen) { this._seen = true; this.after(1, () => this.celebrate(340, 300, 16)); }
    this.requestUiUpdate?.();
  }
  update(d) {
    const g = this._glide;
    if (!g) return;
    g.t += d / 1.0;
    this._v = g.from + (g.to - g.from) * ease(g.t);
    if (g.t >= 1) { this._v = g.to; this._glide = null; }
  }
  busy() { return !!this._glide; }

  draw(ctx, c, t) {
    const P = pal(c);
    if (this.stage === 1) { this._words(ctx, c); return; }
    paintNest(ctx, c, NEST, this._v, { rim: true, villageLit: this.stage === 2 ? ['tank'] : null });
    if (this.stage === 0) {
      const lv = LV[Math.round(this._v)];
      panel(ctx, c, 150, 16, 380, 92, { fill: P.panel });
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = c.label;
      ctx.font = font(c, 700, 36, true); ctx.fillText(lv.name, 340, 44);
      ctx.font = font(c, 700, 28); ctx.fillStyle = c.labelMuted; ctx.fillText(lv.sub, 340, 82);
      return;
    }
    this._assembly(ctx, c, t);
    if (this.stage === 2) {
      pill(ctx, c, 'Ur: the village assembly', 340, 40, { bg: c.gold, ink: inkOn(c, c.gold), size: 30, display: true });
      for (const [s, x, y] of JOBS) pill(ctx, c, s, x, y, { bg: c.bgSurface, ink: c.label, size: 28 });
    }
    if (this.stage === 3) {
      pill(ctx, c, 'honest earnings', 190, 48, { bg: c.gold, ink: inkOn(c, c.gold), size: 32, display: true });
      pill(ctx, c, 'pure of mind', 490, 48, { bg: c.gold, ink: inkOn(c, c.gold), size: 32, display: true });
    }
    if (this.stage === 4) pill(ctx, c, 'Why ask this of a candidate?', 340, 48, { bg: c.accent, ink: inkOn(c, c.accent), size: 30, display: true });
  }

  _assembly(ctx, c, t) {
    tree(ctx, c, 340, 330, 1.7, 5);
    const seat = [[230, 444], [290, 470], [350, 478], [410, 470], [470, 444]];
    drawShadow(ctx, c, 350, 472, 170, 16, 1);
    seat.forEach(([x, y], i) => person(ctx, this, { role: i === 2 ? 'elder' : 'adult', x, y, height: 138, i: i + 2, t, look: { hairStyle: 'short', dupatta: false } }));
  }

  _words(ctx, c) {
    const P = pal(c);
    ctx.fillStyle = P.sand; ctx.fillRect(0, 0, 680, 520);
    panel(ctx, c, 18, 16, 644, 488, { fill: P.panel });
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillStyle = c.label; ctx.font = font(c, 700, 30, true);
    ctx.fillText('300 to 800 CE', 340, 58); ctx.fillText('Cholas', 556, 58);
    const col = (y, w, a, b) => {
      ctx.fillStyle = c.label; ctx.font = font(c, 700, 34, true); ctx.textAlign = 'left'; ctx.fillText(w, 40, y);
      ctx.textAlign = 'center';
      pill(ctx, c, a, 340, y, { bg: mix(P.sand, c.bgSurface, 0.3), ink: c.label, size: 28 });
      pill(ctx, c, b, 548, y, { bg: c.gold, ink: inkOn(c, c.gold), size: 28 });
    };
    col(160, 'valan\u0101\u1E0Du', 'division', 'district');
    col(300, 'n\u0101\u1E0Du', 'district', 'group of villages');
    pill(ctx, c, 'One step lower in the Chola list', 340, 440, { bg: c.accent, ink: inkOn(c, c.accent), size: 28 });
  }

  destroy() { this.tl.destroy(); super.destroy(); }
}
