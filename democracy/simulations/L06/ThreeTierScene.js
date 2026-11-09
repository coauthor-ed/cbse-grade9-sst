// ThreeTierScene - blk-l06-s05. Beat 0: a local meeting under a tree, the part of democracy between
// elections, with the three ways the book names. Beat 1: Union, State and Local as three buildings
// going down to a village; chips light each one and say what it covers.
import { SimScene } from 'simulations/base/kit/SimScene.js';
import { tapLight, tapLightControl } from 'simulations/base/kit/TapLight.js';
import { drawCivic } from '../shared/CivicArt.js';
import { tones, day, say, folk, tag, pop } from './CivicWorld.js';

const CHIPS = [
  { id: 'union', label: 'Union', targets: ['union', 'The whole country'] },
  { id: 'state', label: 'State', targets: ['state', 'One State'] },
  { id: 'local', label: 'Local', targets: ['local', 'A village or a town'] },
];
const S_BETWEEN = 0, S_TIERS = 1;
const MAP = [S_BETWEEN, S_TIERS].map((idx) => [{ idx, dwellMs: null }]);

export class ThreeTierScene extends SimScene {
  static BEAT_STEP_MAP = MAP;
  static HEIGHT = 456;   // shorter than the 520 default: on a phone the host caps height, so this keeps labels at 14 px
  static CONTROLS_IN_SIGHT = true;
  static ARIA_LABEL = 'Villagers meet under a tree, with labels for local councils, public consultations and community-driven initiatives. Then three buildings going down a hill to a village: Union, State and Local. Chips light each one.';
  static CONTROLS = [{ ...tapLightControl({ id: 'lit', label: 'Tier', chips: CHIPS }), options: CHIPS.map((x) => ({ value: x.id, label: x.label })) }];   // no None: one row keeps the figure wide

  tl = tapLight({ chips: CHIPS });
  getControlValue(id) { return id === 'lit' ? this.tl.controlValue() : undefined; }
  onControlChange(id, v) { if (id === 'lit' && this._guard(id)) this.tl.fromControl(v); }
  isControlHidden(id) { return id === 'lit' && this.stage !== S_TIERS; }
  enter() { this.tl.reset(); }
  busy() { return this.age < 1; }

  draw(ctx, c) {
    const t = tones(c), a = this.age;
    if (this.stage === S_BETWEEN) {
      day(ctx, c, 680, 520, { ground: 270 });
      drawCivic(ctx, c, 'tree', 340, 296, { h: 268 });
      ['Local councils', 'Public consultations', 'Community initiatives'].forEach((text, i) => tag(ctx, c, text, [146, 498, 340][i], [36, 36, 84][i], { scale: pop(a, 0.1 + i * 0.16) }));
      ['elder', 'adult', 'farmer', 'worker', 'adult', 'student', 'shopkeeper'].forEach((role, i) => {
        const ang = Math.PI * (0.96 - i * 0.153);
        folk(ctx, this, { role, x: 340 + 280 * Math.cos(ang), y: 444 - 150 * Math.sin(ang) * 0.4, height: 160, pose: i === 0 ? 'point' : 'stand', facing: i < 3 ? 1 : i > 3 ? -1 : 0, i: i + 1 });
      });
    } else {
      day(ctx, c, 680, 520, { ground: 200 });
      ctx.fillStyle = t.road; ctx.beginPath(); ctx.moveTo(150, 200); ctx.bezierCurveTo(320, 240, 180, 340, 520, 456); ctx.lineTo(640, 456); ctx.bezierCurveTo(300, 330, 420, 240, 220, 200); ctx.fill();
      const lit = this.tl.chip()?.id;
      const part = (id, fn) => { ctx.save(); if (lit && lit !== id) ctx.globalAlpha = 0.36; fn(); ctx.restore(); };
      part('union', () => { drawCivic(ctx, c, 'parliament', 190, 212, { w: 310 }); tag(ctx, c, 'Union', 190, 30, { bg: c.s1 }); });
      part('state', () => { drawCivic(ctx, c, 'office', 510, 306, { h: 176 }); tag(ctx, c, 'State', 510, 104, { bg: c.s5 }); });
      part('local', () => {
        drawCivic(ctx, c, 'tree', 170, 450, { h: 170 });
        ['adult', 'elder', 'farmer'].forEach((role, i) => folk(ctx, this, { role, x: 96 + i * 76, y: 450, height: 108, facing: 0, i: i + 2 }));
        tag(ctx, c, 'Local', 170, 262, { bg: c.s3 });
      });
      const line = this.tl.lit()[1];
      if (line) tag(ctx, c, line, 470, 410, { size: 28 });
    }
  }
}
