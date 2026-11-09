// KingEffortScene - L03 s01 (4 beats): the coronation oath as three drawn acts, a king hearing a
// strong and a weak man, a guard on the wall, a well dug. L03 s07 (2 beats): the kingdom map with
// the ground one rider can cover in a day, no invented number, then the wheel line.
import { SimScene } from 'simulations/base/kit/SimScene.js';
import { drawBackdrop, drawVignette, rr, mix, alpha, pill, chipRow } from 'simulations/base/kit/SimLook.js';
import { GEO_COLOR_MAP } from 'simulations/base/kit/GeoLook.js';
import { loadSstMap, sstFullView, drawSstFull } from '../L02/SstMapBase.js';
import { pal, person, crown, hut, tree, wheel, panel, reading, MAN } from '../shared/SstArt.js';

const m = (idx) => [{ idx, dwellMs: null }];
const S_CROWN = 0, S_JUDGE = 1, S_GUARD = 2, S_WELL = 3, S_MAP = 4, S_WHEEL = 5;
const MAP4 = [m(S_CROWN), m(S_JUDGE), m(S_GUARD), m(S_WELL)], MAP2 = [m(S_MAP), m(S_WHEEL)];
const EXT = [[66, 7], [95, 36]];
const SEAT = [85.2, 25.6];

export class KingEffortScene extends SimScene {
  static BEAT_STEP_MAP = MAP4;
  static BEAT_MAPS = { 4: MAP4, 2: MAP2 };
  static COLOR_MAP = GEO_COLOR_MAP;
  static NOTE_STAGE = -1;
  static ARIA_LABEL = 'A coronation oath in three drawn acts: a king hears a strong man and a weak man side by side, a guard watches from a wall, and villagers dig a well. Later, a map of the subcontinent with a small ring for the ground one rider covers in a day, and the line one wheel does not move the carriage.';

  async setup() { this.map = await loadSstMap(); await super.setup(); await sstFullView(this, EXT); this.animateFor?.(400); }

  _chips(ctx, c) {
    const st = this.stage, on = (s) => st === s;
    chipRow(ctx, c, [{ text: 'judge fairly', bg: on(S_JUDGE) ? c.gold : c.bgSurface }, { text: 'protect', bg: on(S_GUARD) ? c.gold : c.bgSurface }, { text: 'do good', bg: on(S_WELL) ? c.gold : c.bgSurface }], 340, 46, { size: 28, display: true, gap: 12, align: 'center' });
  }

  _sky(ctx, c, ground = 380) {
    const p = pal(c);
    drawBackdrop(ctx, c, 'dots');
    rr(ctx, 6, 6, 668, 508, 18); ctx.fillStyle = mix(c.bgSurface, c.gold, 0.1); ctx.fill();
    rr(ctx, 6, ground, 668, 514 - ground, 18); ctx.fillStyle = p.earth; ctx.fill();
  }

  _court(ctx, c) {
    const p = pal(c);
    for (const x of [60, 620]) { rr(ctx, x - 22, 80, 44, 310, 8); ctx.fillStyle = p.stone; ctx.fill(); ctx.fillStyle = p.stoneLight; ctx.fillRect(x - 14, 80, 7, 310); }
    rr(ctx, 30, 74, 620, 24, 6); ctx.fillStyle = p.earthDark; ctx.fill();
  }

  _throne(ctx, c, x, y) {
    const p = pal(c);
    rr(ctx, x - 62, y - 150, 124, 150, 14); ctx.fillStyle = p.wood; ctx.fill();
    rr(ctx, x - 50, y - 138, 100, 90, 10); ctx.fillStyle = c.s6; ctx.fill();
  }

  draw(ctx, c) {
    const st = this.stage, t = this.clock ?? 0;
    if (st === S_MAP || st === S_WHEEL) { this._kingdom(ctx, c); return; }
    this._sky(ctx, c, st === S_WELL ? 310 : 380);
    if (st === S_CROWN) {
      this._court(ctx, c);
      this._throne(ctx, c, 340, 410);
      person(ctx, this, { role: 'adult', x: 340, y: 470, height: 280, i: 3, look: MAN });
      crown(ctx, c, 340, 176, 1.2);
      person(ctx, this, { role: 'elder', x: 150, y: 486, height: 230, pose: 'point', facing: 1, i: 0 });
      person(ctx, this, { role: 'elder', x: 530, y: 486, height: 226, facing: -1, i: 1 });
      pill(ctx, c, 'the oath of coronation', 340, 46, { size: 28, bg: c.gold, display: true });
    }
    if (st === S_JUDGE) {
      this._court(ctx, c);
      this._throne(ctx, c, 340, 400);
      person(ctx, this, { role: 'adult', x: 340, y: 450, height: 250, i: 3, look: MAN });
      crown(ctx, c, 340, 202, 1);
      person(ctx, this, { role: 'adult', x: 130, y: 490, height: 280, pose: 'point', facing: 1, i: 5, look: { ...MAN, girth: 1.4 } });
      person(ctx, this, { role: 'elder', x: 552, y: 494, height: 190, facing: -1, i: 2, look: { ...MAN, hairStyle: 'crop', girth: 0.85 } });
      pill(ctx, c, 'strong', 130, 186, { size: 28, bg: c.s6, display: true });
      pill(ctx, c, 'weak', 552, 276, { size: 28, bg: c.s1, display: true });
      this._chips(ctx, c);
    }
    if (st === S_GUARD) {
      const p = pal(c);
      // wall in stone courses
      rr(ctx, 6, 250, 668, 150, 4); ctx.fillStyle = p.stone; ctx.fill();
      ctx.strokeStyle = p.stoneDark; ctx.lineWidth = 2;
      for (let r = 0; r < 4; r++) for (let k = 0; k < 10; k++) { ctx.strokeRect(6 + k * 68 + (r % 2) * 34 - 34, 250 + r * 37, 68, 37); }
      for (let k = 0; k < 8; k++) { rr(ctx, 16 + k * 96, 214, 58, 40, 4); ctx.fillStyle = p.stone; ctx.fill(); ctx.strokeStyle = p.stoneDark; ctx.stroke(); }
      person(ctx, this, { role: 'adult', x: 260, y: 258, height: 170, pose: 'point', facing: 1, i: 5, look: MAN });
      person(ctx, this, { role: 'adult', x: 470, y: 258, height: 160, facing: 1, i: 6, look: MAN });
      hut(ctx, c, 150, 490, 1.2); hut(ctx, c, 520, 494, 1.2);
      person(ctx, this, { role: 'child', x: 340, y: 498, height: 96, i: 2 });
      this._chips(ctx, c);
    }
    if (st === S_WELL) {
      const p = pal(c);
      tree(ctx, c, 610, 320, 2.5, 4); hut(ctx, c, 110, 318, 2);
      ctx.beginPath(); ctx.ellipse(340, 438, 120, 44, 0, 0, 7); ctx.fillStyle = p.stone; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = p.stoneDark; ctx.stroke();
      ctx.beginPath(); ctx.ellipse(340, 434, 92, 30, 0, 0, 7); ctx.fillStyle = p.water; ctx.fill();
      rr(ctx, 228, 170, 14, 270, 4); ctx.fillStyle = p.wood; ctx.fill(); rr(ctx, 438, 170, 14, 270, 4); ctx.fill(); rr(ctx, 218, 164, 244, 14, 6); ctx.fill();
      ctx.strokeStyle = p.ink; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(340, 176); ctx.lineTo(340, 390); ctx.stroke();
      rr(ctx, 322, 388, 36, 28, 6); ctx.fillStyle = p.wood; ctx.fill();
      person(ctx, this, { role: 'farmer', x: 160, y: 492, height: 240, pose: 'pull', facing: 1, i: 4, look: MAN });
      person(ctx, this, { role: 'adult', x: 520, y: 496, height: 230, facing: -1, i: 1, mood: 'happy' });
      this._chips(ctx, c);
    }
    drawVignette(ctx, c, 0.32);
  }

  _kingdom(ctx, c) {
    if (!drawSstFull(ctx, c, this)) return;
    const v = this.view, q = v.at(SEAT);
    ctx.save(); ctx.beginPath(); v.path.context(ctx)(this.map.land); ctx.clip();
    ctx.fillStyle = alpha(c.gold, 0.2); ctx.fillRect(0, 0, 680, 520); ctx.restore();
    ctx.beginPath(); ctx.arc(q[0], q[1], 17, 0, 7); ctx.fillStyle = alpha(c.bad, 0.42); ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = c.bad; ctx.stroke();
    crown(ctx, c, q[0], q[1] - 30, 0.7);
    pill(ctx, c, 'a day on horseback', q[0] + 16, q[1] + 44, { size: 28, bg: c.bad, display: true });
    if (this.stage === S_WHEEL) {
      panel(ctx, c, 60, 330, 400, 170, { fill: c.bgSurface });
      wheel(ctx, c, 142, 414, 62, 0.3);
      reading(ctx, c, 'one wheel does', 310, 386, 30); reading(ctx, c, 'not move', 310, 424, 30); reading(ctx, c, 'the carriage', 310, 462, 30);
    } else pill(ctx, c, 'the rest of the kingdom', 240, 66, { size: 28, bg: c.gold, display: true });
  }
}
