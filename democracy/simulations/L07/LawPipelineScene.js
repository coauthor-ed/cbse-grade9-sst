// LawPipelineScene - blk-l07-s04. The book's stages of the RTI Act, one per Next. A step strip on
// top carries a sheet of paper from stage to stage; each stage is drawn with its people.
// Beat 0 the concern; beat 1 committees; beat 2 review, debate, consultation, safeguards; beat 3 in force.
import { SimScene } from 'simulations/base/kit/SimScene.js';
import { drawDesk as desk } from 'simulations/base/kit/SimProps.js';
import { drawCivic } from '../shared/CivicArt.js';
import { tones, day, tile, say, folk, tag, pop, rr, clamp01 } from '../L06/CivicWorld.js';

const MAP = [0, 1, 2, 3].map((idx) => [{ idx, dwellMs: null }]);
const STEPS = ['Concern', 'Committees', 'Debate', '2005'];
const X = [80, 266, 452, 610];
const FLOOR = 446;

export class LawPipelineScene extends SimScene {
  static BEAT_STEP_MAP = MAP;
  static HEIGHT = 456;   // shorter than the 520 default: on a phone the host caps height, so this keeps labels at 14 px
  static ARIA_LABEL = 'A sheet of paper moves through four stages of the Right to Information Act: citizens, journalists, civil society groups and elected representatives raise a concern; a parliamentary committee examines it; expert groups, Parliament and stakeholders test the proposal and safeguards are added; in 2005 the Act comes into force and a citizen asks a government office for information.';
  static CONTROLS = [];

  busy() { return this.age < 1.3; }

  _strip(ctx, c) {
    const t = tones(c), s = this.stage, k = clamp01(this.age / 0.8);
    tile(ctx, c, 10, 6, 660, 84, { fill: c.bgSurface, r: 14 });
    ctx.strokeStyle = t.road; ctx.lineWidth = 8; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(X[0], 28); ctx.lineTo(X[3], 28); ctx.stroke();
    X.forEach((x, i) => {
      ctx.fillStyle = i <= s ? c.accent : t.road; ctx.beginPath(); ctx.arc(x, 28, i === s ? 15 : 11, 0, 7); ctx.fill();
      say(ctx, c, STEPS[i], x, 66, { size: 28, col: i === s ? c.label : c.labelMuted });
    });
    const from = X[Math.max(0, s - 1)], x = from + (X[s] - from) * k;
    ctx.save(); ctx.translate(x, 26);
    rr(ctx, -12, -15, 24, 30, 3); ctx.fillStyle = t.plaster; ctx.fill(); ctx.strokeStyle = c.label; ctx.lineWidth = 2.5; ctx.stroke();
    ctx.restore();
  }

  draw(ctx, c) {
    const s = this.stage, a = this.age;
    if (s === 0) {
      day(ctx, c, 680, 520, { ground: 340, sun: false });
      [['Citizens', 'Journalists'], ['Civil society groups', 'Elected representatives']].forEach((r, j) => r.forEach((text, i) => {
        tag(ctx, c, text, i ? 498 : 168, 122 + j * 48, { scale: pop(a, 0.1 + (i + j * 2) * 0.12) });
      }));
      ['adult', 'shopkeeper', 'worker', 'teacher'].forEach((role, i) => folk(ctx, this, { role, x: 110 + i * 152, y: FLOOR, height: 226, pose: i === 1 ? 'point' : 'stand', facing: i === 1 ? 1 : 0, i: i + 1 }));
      drawCivic(ctx, c, 'newspaper', 262 + 66, 416, { h: 92 });
    } else if (s === 1) {
      const wall = tones(c); ctx.fillStyle = wall.plaster; ctx.fillRect(0, 0, 680, 340); ctx.fillStyle = wall.wood; ctx.fillRect(0, 340, 680, 120);
      tag(ctx, c, 'Parliamentary committee', 340, 122);
      ['teacher', 'adult', 'elder', 'adult'].forEach((role, i) => folk(ctx, this, { role, x: 130 + i * 140, y: 412, height: 176, facing: 0, i: i + 4, mood: 'think' }));
      desk(ctx, c, { x0: 56, x1: 624, y: FLOOR, forHeight: 214 });
      tag(ctx, c, 'A law is needed', 340, 172, { bg: c.accent, scale: pop(a, 0.7) });
    } else if (s === 2) {
      day(ctx, c, 680, 520, { ground: 372, hills: false, sun: false });
      this._strip(ctx, c);
      drawCivic(ctx, c, 'parliament', 340, 280, { w: 330 });
      ['Expert groups review', 'Parliament debates', 'Stakeholders are consulted'].forEach((text, i) => tag(ctx, c, text, 340, 304 + i * 42, { scale: pop(a, 0.1 + i * 0.2) }));
      const k = pop(a, 0.8);
      tag(ctx, c, 'Safeguards added', 340, 430, { bg: c.accent, scale: k });
      return;
    } else {
      day(ctx, c, 680, 520, { ground: 372, hills: false, sun: false });
      this._strip(ctx, c);
      drawCivic(ctx, c, 'office', 470, 400, { h: 240 });
      folk(ctx, this, { role: 'student', x: 150, y: 420, height: 196, pose: 'point', facing: 1, i: 2 });
      say(ctx, c, 'RTI Act', 150, 122, { size: 38 });
      tag(ctx, c, 'in force, 2005', 150, 166, { bg: c.accent, scale: pop(a, 0.2) });
      tag(ctx, c, 'Citizens can seek information', 340, 434, { scale: pop(a, 0.5) });
      return;
    }
    this._strip(ctx, c);
  }
}
