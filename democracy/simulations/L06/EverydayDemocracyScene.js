// EverydayDemocracyScene - blk-l06-s08b. Beat 0: three everyday groups, each deciding by a show of
// hands. Tap to see what each one is. Beat 1: the book's own image: a bridge between citizens and
// the State, with the three ways the book names crossing it.
import { SimScene } from 'simulations/base/kit/SimScene.js';
import { tapLight, tapLightControl } from 'simulations/base/kit/TapLight.js';
import { drawCivic } from '../shared/CivicArt.js';
import { tones, day, tile, say, folk, tag, pop, rr, font } from './CivicWorld.js';
import { wrapText } from 'simulations/base/kit/SimLook.js';

const CHIPS = [
  { id: 'coop', label: 'Cooperative', targets: ['Cooperative', 'Members share profits and responsibilities equally.'] },
  { id: 'union', label: 'Trade union', targets: ['Trade union', 'Workers choose their own leaders by voting.'] },
  { id: 'civil', label: 'Community', targets: ['Community group', 'Neighbours meet and decide together.'] },
];
const S_GROUPS = 0, S_BRIDGE = 1;
const MAP = [S_GROUPS, S_BRIDGE].map((idx) => [{ idx, dwellMs: null }]);
const COLS = [{ id: 'coop', x: 120, roles: ['farmer', 'adult', 'elder'] }, { id: 'union', x: 340, roles: ['worker', 'worker', 'adult'] }, { id: 'civil', x: 560, roles: ['adult', 'student', 'shopkeeper'] }];

export class EverydayDemocracyScene extends SimScene {
  static BEAT_STEP_MAP = MAP;
  static HEIGHT = 456;   // shorter than the 520 default: on a phone the host caps height, so this keeps labels at 14 px
  static CONTROLS_IN_SIGHT = true;
  static ARIA_LABEL = 'Three groups of people, a cooperative, a trade union and a community group, each raising hands to decide. Then a bridge over a river: citizens on one side, a government building on the other, and PIL, campaigns and community organisations crossing it.';
  static CONTROLS = [{ ...tapLightControl({ id: 'lit', label: 'Group', chips: CHIPS }), options: CHIPS.map((x) => ({ value: x.id, label: x.label })) }];   // no None: one row keeps the figure wide

  tl = tapLight({ chips: CHIPS });
  getControlValue(id) { return id === 'lit' ? this.tl.controlValue() : undefined; }
  onControlChange(id, v) { if (id === 'lit' && this._guard(id)) this.tl.fromControl(v); }
  isControlHidden(id) { return id === 'lit' && this.stage !== S_GROUPS; }
  enter(stage) { this.tl.set({ lit: stage === S_GROUPS ? 'coop' : null }); }
  busy() { return this.stage === S_BRIDGE ? this.age < 2.2 : this.age < 0.8; }

  draw(ctx, c) {
    const t = tones(c), a = this.age;
    if (this.stage === S_GROUPS) {
      day(ctx, c, 680, 520, { ground: 190 });
      const lit = this.tl.chip()?.id;
      COLS.forEach((g, n) => {
        ctx.save(); if (lit && lit !== g.id) ctx.globalAlpha = 0.34;
        g.roles.forEach((role, i) => folk(ctx, this, { role, x: g.x - 66 + i * 66, y: 306 + (i % 2) * 8, height: 158, pose: 'reach-up', facing: 0, i: n * 3 + i + 1 }));
        ctx.restore();
      });
      tile(ctx, c, 18, 324, 644, 122, { fill: c.bgSurface });
      const [title, line] = this.tl.lit();
      if (title) {
        say(ctx, c, title, 340, 352, { size: 32 });
        ctx.font = font(c, 700, 28); ctx.fillStyle = c.label;
        wrapText(ctx, line, 36, 374, 608, { lineH: 34, align: 'center', maxLines: 2 });
      } else say(ctx, c, 'Each group decides by voting', 340, 384, { size: 30 });
    } else {
      day(ctx, c, 680, 520, { ground: 216, hills: false });
      ctx.fillStyle = t.water; ctx.fillRect(170, 216, 340, 240);
      ctx.fillStyle = t.waterDark; for (let i = 0; i < 3; i++) { rr(ctx, 220 + i * 86, 346, 34, 120, 8); ctx.fill(); }
      ctx.fillStyle = t.rock; ctx.beginPath(); ctx.moveTo(80, 296); ctx.quadraticCurveTo(340, 256, 600, 296); ctx.lineTo(600, 342); ctx.quadraticCurveTo(340, 302, 80, 342); ctx.fill();
      ctx.strokeStyle = t.rockDark; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(80, 296); ctx.quadraticCurveTo(340, 256, 600, 296); ctx.stroke();
      drawCivic(ctx, c, 'office', 600, 302, { h: 186 });
      tag(ctx, c, 'The State', 590, 92, { bg: c.accent });
      ['adult', 'farmer', 'student'].forEach((role, i) => folk(ctx, this, { role, x: 28 + i * 52, y: 420 - i * 34, height: 140 - i * 8, facing: 1, i: i + 1 }));
      tag(ctx, c, 'Citizens', 90, 216, { bg: c.accent });
      ['Public Interest Litigation', 'Campaigns', 'Community organisations'].forEach((text, i) => tag(ctx, c, text, 300, 32 + i * 46, { scale: pop(a, 0.2 + i * 0.3) }));
      const k = Math.min(1, a / 1.8);
      const x = 120 + k * 320;
      folk(ctx, this, { role: 'adult', x, y: 288 - 12 * Math.sin(k * Math.PI), height: 118, pose: k < 1 ? 'walk' : 'stand', facing: 1, i: 6 });
    }
  }
}
