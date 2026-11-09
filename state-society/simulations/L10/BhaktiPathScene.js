// BhaktiPathScene - rite and song. L09 blk-l10-s07 (the block moved to L09; the file stays here), 4 beats.
// Offerings to the fire under the elements; those who left home; two paths; twelve and sixty-three by count.
import { SimScene } from 'simulations/base/kit/SimScene.js';
import { mix, darken, lighten, rr, drawBackdrop, drawVignette } from 'simulations/base/kit/SimLook.js';
import { drawPersonGlyph } from 'simulations/base/kit/SimFigure.js';
import { drawIcon } from 'simulations/base/kit/SimIcons.js';
import { tree, hut, ground, ease, seg, plate, say, sky, stone, MAN, WOMAN, person } from '../L09/SstWorld.js';

const W = 680, H = 520, GY = 440;
const MAP = [0, 1, 2, 3].map((idx) => [{ idx, dwellMs: null }]);

export class BhaktiPathScene extends SimScene {
  static BEAT_STEP_MAP = MAP;
  static CONTINUOUS = false;
  static IRIS = false;
  static NOTE_STAGE = -1;
  static ARIA_LABEL = 'People make offerings to a sacred fire under the sun, rain and dawn. A wanderer with a staff walks away from a house. Then two paths side by side: a large fire rite with many steps, and a singer with men and women around her. Last, twelve Alvars and sixty-three Nayanmars shown as counted people.';
  static CONTROLS = [];

  busy() { return this.age < 1.4; }

  draw(ctx, c) {
    drawBackdrop(ctx, c, 'plain');
    const s = this.stage ?? 0;
    ctx.fillStyle = sky(c); ctx.fillRect(0, 0, W, GY);
    ground(ctx, c, GY);
    [this._fire, this._leave, this._two, this._count][s].call(this, ctx, c, ease(this.age / 0.8));
    drawVignette(ctx, c, 0.35);
  }

  _altar(ctx, c, x, y, s = 1) {
    ctx.fillStyle = darken(stone(c), 0.2); rr(ctx, x - 80 * s, y - 34 * s, 160 * s, 44 * s, 8); ctx.fill();
    ctx.fillStyle = stone(c); rr(ctx, x - 80 * s, y - 34 * s, 160 * s, 12 * s, 6); ctx.fill();
    ctx.fillStyle = mix(c.flame, c.gold, 0.2);
    ctx.beginPath(); ctx.moveTo(x, y - 150 * s); ctx.quadraticCurveTo(x + 60 * s, y - 80 * s, x + 40 * s, y - 34 * s); ctx.lineTo(x - 40 * s, y - 34 * s); ctx.quadraticCurveTo(x - 60 * s, y - 80 * s, x, y - 150 * s); ctx.fill();
    ctx.fillStyle = lighten(c.gold, 0.3);
    ctx.beginPath(); ctx.moveTo(x, y - 96 * s); ctx.quadraticCurveTo(x + 28 * s, y - 60 * s, x + 16 * s, y - 34 * s); ctx.lineTo(x - 16 * s, y - 34 * s); ctx.quadraticCurveTo(x - 28 * s, y - 60 * s, x, y - 96 * s); ctx.fill();
  }

  _fire(ctx, c) {
    [['sun', 'the sun', c.gold], ['rain', 'rain', c.s1], ['flame', 'fire', c.flame]].forEach(([icon, name, col], i) => {
      const x = 130 + i * 210, a = ease(seg(this.age, i * 0.15, i * 0.15 + 0.5));
      ctx.save(); ctx.globalAlpha *= a;
      drawIcon(ctx, c, icon, x, 74, 54, { tone: col });
      ctx.restore();
      plate(ctx, c, name, x, 156, { size: 28, alpha: a });
    });
    this._altar(ctx, c, 340, GY + 30);
    person(this, ctx, c, { role: 'adult', pose: 'stand', x: 160, y: GY + 44, height: 200, facing: 1, i: 0, look: MAN, autoReach: false, hands: [{ x: 204, y: GY - 30 }, { x: 196, y: GY - 22 }] });
    person(this, ctx, c, { role: 'adult', pose: 'stand', x: 520, y: GY + 44, height: 190, facing: -1, i: 1, look: WOMAN, autoReach: false, hands: [{ x: 476, y: GY - 30 }, { x: 484, y: GY - 22 }] });
  }

  _leave(ctx, c, k) {
    hut(ctx, c, 120, GY - 6, 220);
    tree(ctx, c, 610, GY, 300); tree(ctx, c, 520, GY, 220);
    const x = 300 + 70 * k;
    person(this, ctx, c, { role: 'adult', pose: { name: 'walk', phase: 0.25 }, x, y: GY + 44, height: 230, facing: 1, i: 0, look: MAN });
    ctx.strokeStyle = darken(mix(c.s8, c.waste, 0.4), 0.2); ctx.lineWidth = 8; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x + 76, GY - 100); ctx.lineTo(x + 86, GY + 46); ctx.stroke();
    [['parivr\u0101jaka: wanderer', 44], ['bhik\u1E63hu: lives by alms', 96], ['\u015Bhrama\u1E47a: one who strives', 148]].forEach(([t, y], i) => {
      plate(ctx, c, t, W / 2, y, { size: 28, alpha: ease(seg(this.age, 0.1 + i * 0.25, 0.5 + i * 0.25)) });
    });
  }

  _two(ctx, c, k) {
    ctx.fillStyle = c.stroke; ctx.fillRect(W / 2 - 2, 0, 4, H);
    plate(ctx, c, 'elaborate rite', W / 4, 40, { size: 28 });
    plate(ctx, c, 'Bhakti: direct', W * 0.75, 40, { size: 28, ink: c.s5ink });
    this._altar(ctx, c, W / 4, GY + 30, 1);
    [[60, 0], [114, 2]].forEach(([x, i]) => person(this, ctx, c, { role: 'adult', pose: 'stand', x, y: GY + 44, height: 180, facing: 1, i, look: MAN }));
    person(this, ctx, c, { role: 'adult', pose: 'stand', x: 294, y: GY + 44, height: 180, facing: -1, i: 2, look: MAN });
    const sx = 500;
    person(this, ctx, c, { role: 'adult', pose: 'cheer', x: sx, y: GY + 44, height: 220, facing: 0, i: 1, look: { ...WOMAN, mood: 'happy' } });
    [[398, 0, 'adult'], [446, 7, 'child'], [558, 3, 'adult'], [620, 2, 'elder']].forEach(([x, i, role]) => {
      person(this, ctx, c, { role, pose: 'stand', x, y: GY + 54, height: role === 'child' ? 110 : 160, facing: x < sx ? 1 : -1, i });
    });
    // notes of a song, rising
    for (let i = 0; i < 4; i++) {
      const t = seg(this.age, 0.2 + i * 0.15, 1.0 + i * 0.15), x = sx - 50 + i * 34, y = 200 - t * 60;
      ctx.save(); ctx.globalAlpha *= t;
      ctx.fillStyle = c.s5; ctx.beginPath(); ctx.ellipse(x, y, 11, 8, -0.3, 0, Math.PI * 2); ctx.fill();
      ctx.fillRect(x + 8, y - 34, 4, 34);
      ctx.restore();
    }
    void k;
  }

  _count(ctx, c) {
    ctx.fillStyle = mix(c.bgSurface, sky(c), 0.5); ctx.fillRect(0, 0, W, H);
    const group = (x, n, col, cols, name, god, r) => {
      const rows = Math.ceil(n / cols), cell = (W / 2 - 40) / cols, shown = Math.round(n * ease(seg(this.age, 0.1, 1.1)));
      say(ctx, c, String(n), x, 66, { size: 74, col });
      plate(ctx, c, name, x, 136, { size: 28 });
      plate(ctx, c, god, x, 184, { size: 28 });
      const x0 = x - cell * cols / 2 + cell / 2;
      for (let i = 0; i < n; i++) {
        const px = x0 + (i % cols) * cell, py = 240 + Math.floor(i / cols) * (cell + (rows > 6 ? 0 : 6)) + r;
        if (i < shown) drawPersonGlyph(ctx, c, px, py, r * 2.2, { col });
      }
    };
    group(170, 12, c.s1ink, 4, '\u0100\u1E3Bv\u0101rs', 'hymns to Vi\u1E63h\u1E47u', 28);
    group(510, 63, c.s8ink, 9, 'N\u0101yanm\u0101rs', 'hymns to \u015Ahiva', 13);
  }
}
