// PolicyBoardScene - L06 s06. No inputs: the book's task as a printed sheet. Beat 0 six areas. Beat 1 one
// worked row for made-up Party A and Party B, labelled made up, tabs switch party. Beat 2 the sheet with
// one row done and five for the learner. No real party, no colour for a party.
import { SimScene } from 'simulations/base/kit/SimScene.js';
import { tapLight, tapLightControl } from 'simulations/base/kit/TapLight.js';
import { tones, folk, pop, label, tile, say, rr, mix, hi } from './PartyWorld.js';

const AREAS = ['Education', 'National security', 'Social welfare', 'Environment', 'Economy', 'Health'];
const PARTIES = [{ id: 'a', label: 'Made-up Party A', targets: ['a'] }, { id: 'b', label: 'Made-up Party B', targets: ['b'] }];
const ROW = {
  a: ['A school in every block', 'Right to Education Act, 2009', 'Party A manifesto, page 4'],
  b: ['Train more teachers first', 'Right to Education Act, 2009', 'Party B manifesto, page 7'],
};
const HEADS = ['Viewpoint', 'Policy or law', 'Source'];
const S_AREAS = 0, S_ROW = 1, S_SHEET = 2;
const MAP = [S_AREAS, S_ROW, S_SHEET].map((idx) => [{ idx, dwellMs: null }]);

export class PolicyBoardScene extends SimScene {
  static BEAT_STEP_MAP = MAP;
  static HEIGHT = 456;
  static CONTROLS_IN_SIGHT = true;
  static ARIA_LABEL = 'Students around a poster with six policy areas. Then one worked row for Education, for two made-up parties. Then the printed sheet with one row done and five empty.';
  static CONTROLS = [{ ...tapLightControl({ id: 'p', label: 'Party', chips: PARTIES }), options: PARTIES.map((x) => ({ value: x.id, label: x.label })) }];

  tl = tapLight({ chips: PARTIES });
  getControlValue(id) { return id === 'p' ? this.tl.controlValue() : undefined; }
  onControlChange(id, v) { if (id === 'p' && this._guard(id)) this.tl.fromControl(v); }
  isControlHidden(id) { return id === 'p' && this.stage !== S_ROW; }
  enter() { this.tl.set({ lit: 'a' }); }
  busy() { return this.age < 1; }

  draw(ctx, c) {
    const s = this.stage, a = this.age, t = tones(c);
    ctx.fillStyle = t.plaster; ctx.fillRect(0, 0, 680, 456);
    ctx.fillStyle = t.wood; ctx.fillRect(0, 416, 680, 40);
    if (s === S_AREAS) {
      tile(ctx, c, 24, 16, 632, 296, { fill: c.bgSurface });
      say(ctx, c, 'Compare two parties', 340, 50, { size: 32 });
      AREAS.forEach((n, i) => {
        const x = 40 + (i % 2) * 306, y = 84 + (i >> 1) * 74, k = pop(a, i * 0.08);
        ctx.save(); ctx.globalAlpha *= Math.min(1, k);
        ctx.fillStyle = mix(c.gold, c.bgSurface, 0.7); rr(ctx, x, y, 294, 62, 10); ctx.fill();
        say(ctx, c, n, x + 147, y + 31, { size: 28 });
        ctx.restore();
      });
      ['student', 'student', 'student', 'student'].forEach((role, i) => folk(ctx, this, { role, x: 130 + i * 140, y: 450, height: 130, pose: i === 1 ? 'point' : 'stand', i: i * 2 + 1, facing: 0 }));
    } else if (s === S_ROW) {
      const r = ROW[this.tl.chip()?.id ?? 'a'];
      tile(ctx, c, 24, 16, 632, 388, { fill: c.bgSurface });
      say(ctx, c, 'Policy area: Education', 340, 58, { size: 32 });
      r.forEach((val, i) => {
        const y = 96 + i * 100;
        ctx.fillStyle = mix(c.gold, c.bgSurface, 0.74); rr(ctx, 44, y, 592, 90, 10); ctx.fill();
        say(ctx, c, HEADS[i], 340, y + 26, { size: 25, display: false, col: c.labelMuted ?? c.label });
        say(ctx, c, val, 340, y + 60, { size: 29 });
      });
      label(ctx, c, 'Made-up example', 340, 430, { size: 26 });
    } else {
      tile(ctx, c, 24, 12, 632, 396, { fill: c.bgSurface });
      say(ctx, c, 'Policy area', 136, 40, { size: 26 }); say(ctx, c, 'Your notes and source', 442, 40, { size: 26 });
      AREAS.forEach((n, i) => {
        const y = 62 + i * 56, k = pop(a, i * 0.07);
        ctx.save(); ctx.globalAlpha *= Math.min(1, k);
        ctx.fillStyle = mix(c.gold, c.bgSurface, 0.74); rr(ctx, 40, y, 246, 50, 8); ctx.fill();
        say(ctx, c, n, 163, y + 25, { size: 26 });
        ctx.strokeStyle = c.stroke; ctx.lineWidth = 3; ctx.setLineDash(i ? [8, 8] : []); rr(ctx, 298, y, 342, 50, 8); ctx.stroke(); ctx.setLineDash([]);
        if (!i) { say(ctx, c, 'Done as a model', 469, y + 25, { size: 26, col: c.label }); }
        ctx.restore();
      });
      label(ctx, c, 'Five rows are yours', 340, 432, { size: 26, bg: hi(c), ink: c.label });
    }
  }
}
