// VedicAssemblyScene - L01 s03. Three assemblies as three drawn groups, small to large: 3 seated
// elites, a ring of a dozen, a crowd. Chips name the three kinds of matter and light the group
// that takes each. Sizes are the idea: smaller, larger, popular. No desk, no doors.
import { SimScene } from 'simulations/base/kit/SimScene.js';
import { drawBackdrop, drawVignette, mix, pill } from 'simulations/base/kit/SimLook.js';
import { drawPersonGlyph } from 'simulations/base/kit/SimFigure.js';
import { tapLight, tapLightControl } from 'simulations/base/kit/TapLight.js';
import { pal, panel, person, reading, fire } from '../shared/SstArt.js';

const CHIPS = [
  { id: 'case', label: 'A case to judge', targets: ['sabha'], tone: 2 },
  { id: 'policy', label: 'A policy decision', targets: ['samiti'], tone: 3 },
  { id: 'war', label: 'A discussion of war', targets: ['vidhata'], tone: 6 },
];
const PANELS = [
  { id: 'sabha', name: 'sabh\u0101', x: 10, w: 186, tag: 'judges', tone: 's2' },
  { id: 'samiti', name: 'samiti', x: 204, w: 216, tag: 'policy', tone: 's3' },
  { id: 'vidhata', name: 'vidhata', x: 428, w: 242, tag: 'war', tone: 's6' },
];
const m = (idx) => [{ idx, dwellMs: null }];
const MAP = [m(0), m(1), m(2), m(3), m(4)];
const PRESET = [null, 'case', 'policy', 'war', null];

export class VedicAssemblyScene extends SimScene {
  static BEAT_STEP_MAP = MAP;
  static NOTE_STAGE = -1;
  static CONTROLS_IN_SIGHT = true;
  static ARIA_LABEL = 'Three assemblies drawn side by side, from small to large: the sabha with three people, the samiti with a larger ring, and the vidhata with a crowd. Chips for a case to judge, a policy decision and a discussion of war light the assembly that took each.';
  static CONTROLS = [tapLightControl({ id: 'lit', label: 'Which matter?', chips: CHIPS })];
  tl = tapLight({ chips: CHIPS });
  getControlValue(id) { return id === 'lit' ? this.tl.controlValue() : undefined; }
  onControlChange(id, v) { if (id === 'lit') this.tl.fromControl(v); }
  isControlDisabled(id) { return id === 'lit' && this.tl.disabled(); }
  enter(stage) { this.tl.set({ lit: PRESET[stage] }); }

  draw(ctx, c) {
    const p = pal(c), t = this.clock ?? 0;
    drawBackdrop(ctx, c, 'dots');
    for (const P of PANELS) {
      const off = this.tl.off(P.id), lit = this.tl.has(P.id);
      panel(ctx, c, P.x, 14, P.w, 492, { fill: mix(c.bgSurface, c[P.tone], 0.14), lit, litCol: c[P.tone], off });
      ctx.save();
      if (off) ctx.globalAlpha = 0.32;
      const cx = P.x + P.w / 2;
      reading(ctx, c, P.name, cx, 56, 34);
      ctx.beginPath(); ctx.ellipse(cx, 318, P.w * 0.45, 120, 0, 0, 7); ctx.fillStyle = mix(p.sand, c.bgSurface, 0.2); ctx.fill();
      if (P.id === 'sabha') {
        person(ctx, this, { role: 'elder', x: cx, y: 296, height: 132, i: 0, t });
        person(ctx, this, { role: 'elder', x: cx - 52, y: 406, height: 150, i: 1, facing: 1, t });
        person(ctx, this, { role: 'elder', x: cx + 52, y: 406, height: 150, i: 2, facing: -1, t });
      } else if (P.id === 'samiti') {
        const n = 11;
        for (let i = 0; i < n; i++) {
          const a = Math.PI * (1.1 + (i / (n - 1)) * 0.8), x = cx + Math.cos(a) * 80, y = 300 + Math.sin(a) * 58;
          drawPersonGlyph(ctx, c, x, y, 58, { col: c[['s1', 's3', 's5', 's8'][i % 4]] });
        }
        fire(ctx, c, cx, 340, 0.7, t);
        person(ctx, this, { role: 'adult', x: cx - 58, y: 448, height: 124, i: 3, facing: 1, t });
        person(ctx, this, { role: 'adult', x: cx + 58, y: 448, height: 124, i: 4, facing: -1, t });
      } else {
        const rows = [[5, 300, 74], [5, 372, 84], [4, 454, 96]];
        let i = 5;
        for (const [n, y, h] of rows) {
          for (let k = 0; k < n; k++) person(ctx, this, { role: 'adult', x: P.x + (P.w * (k + 0.5 + (n === 4 ? 0.5 : 0))) / 5, y, height: h, i: i++ });
        }
      }
      pill(ctx, c, P.tag, cx, P.id === 'vidhata' ? 112 : 472, { size: 28, bg: c[P.tone], display: true });
      ctx.restore();
    }
    drawVignette(ctx, c, 0.4);
  }
}
