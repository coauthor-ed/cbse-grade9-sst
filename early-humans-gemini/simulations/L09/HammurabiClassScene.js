// HammurabiClassScene - blk-l09-s07b, 4 beats. Beat 0: the stele to scale beside a student, 2.25 metres, 282 laws. Beat 1: many
// cities with their own customs, one written law. Beat 2: one injury, three cards, three outcomes. Beat 3: the prologue's words
// over the same three cards. Icons are neutral. Canvas: the student comes from SimFigure.
import { SimScene } from 'simulations/base/kit/SimScene.js';
import { clamp, darken, lighten, mix, pill, rr, wrapText, font, inkOn } from 'simulations/base/kit/SimLook.js';
import { GEO_COLOR_MAP } from 'simulations/base/kit/GeoLook.js';
import { figureFor, drawFigure } from 'simulations/base/kit/SimFigure.js';
import { drawIcon } from 'simulations/base/kit/SimIcons.js';

const W = 680, H = 520, FLOOR = 456;
const MAP = [0, 1, 2, 3].map((idx) => [{ idx, dwellMs: null }]);
const CARDS = [['Free citizen', 'Own eye', 'eye', 's2'], ['Commoner', 'A fine in silver', 'silver', 's5'], ['Slave', 'Half the slave\'s value, paid to the owner', 'money-bag', 's3']];

export class HammurabiClassScene extends SimScene {
  static BEAT_STEP_MAP = MAP;
  static CONTINUOUS = false;
  static IRIS = false;
  static NOTE_STAGE = -1;
  static COLOR_MAP = GEO_COLOR_MAP;
  static ARIA_LABEL = 'The stele of Hammurabi, 2.25 metres tall, beside a student. Many cities and one written law. Then one injury with three outcomes: an eye, a silver fine, and half a slave\'s value paid to the owner.';

  busy() { return this.age < 0.9; }

  draw(ctx, c) {
    const s = this.stage ?? 0, k = clamp(this.age / 0.6, 0, 1);
    ctx.fillStyle = mix(c.bgSurface, c.gold, 0.08); ctx.fillRect(0, 0, W, H);
    if (s <= 1) { ctx.fillStyle = mix(c.gold, c.bgSurface, 0.55); ctx.fillRect(0, FLOOR, W, H - FLOOR); ctx.fillStyle = darken(c.gold, 0.2); ctx.fillRect(0, FLOOR - 2, W, 4); }
    if (s === 0) this._size(ctx, c, k);
    else if (s === 1) this._one(ctx, c, k);
    else this._cards(ctx, c, s, k);
  }

  _stele(ctx, c, x, y, w, h) {
    const col = darken(c.elevHigh, 0.62);
    const shape = (dy) => { ctx.beginPath(); ctx.moveTo(x - w / 2, y + dy); ctx.lineTo(x - w / 2, y - h + w * 0.42 + dy); ctx.quadraticCurveTo(x - w / 2, y - h + dy, x, y - h + dy); ctx.quadraticCurveTo(x + w / 2, y - h + dy, x + w / 2, y - h + w * 0.42 + dy); ctx.lineTo(x + w / 2, y + dy); ctx.closePath(); };
    shape(0); ctx.fillStyle = col; ctx.fill();
    ctx.save(); shape(0); ctx.clip(); ctx.fillStyle = lighten(col, 0.08); ctx.fillRect(x - w / 2, y - h, w * 0.28, h); ctx.restore();
    // The carved scene at the top: a seated god, a standing king.
    const ty = y - h + h * 0.05, u = w * 0.13, relief = lighten(col, 0.3);
    ctx.fillStyle = relief;
    ctx.beginPath(); ctx.arc(x + u * 1.3, ty + u * 1.3, u * 0.72, 0, Math.PI * 2); ctx.fill(); rr(ctx, x + u * 0.5, ty + u * 2.1, u * 1.7, u * 2.4, u * 0.3); ctx.fill();
    ctx.beginPath(); ctx.arc(x - u * 1.4, ty + u * 1.7, u * 0.62, 0, Math.PI * 2); ctx.fill(); rr(ctx, x - u * 2, ty + u * 2.4, u * 1.2, u * 2.1, u * 0.3); ctx.fill();
    ctx.fillStyle = lighten(col, 0.22);
    const top = y - h * 0.6, rows = 12, rh = (h * 0.6 - 12) / rows;
    for (let i = 0; i < rows; i++) { for (let j = 0; j < 9; j++) { const px = x - w * 0.4 + j * w * 0.09 + ((i * 3 + j) % 2) * 3; rr(ctx, px, top + i * rh, w * 0.06, Math.max(3, rh * 0.42), 2); ctx.fill(); } }
  }

  _size(ctx, c, k) {
    const scale = 150, h = 2.25 * scale;   // px per metre, the same for stone and student
    this._stele(ctx, c, 212, FLOOR, 160, h);
    const f = figureFor(this, { role: 'student', pose: 'point', x: 378, y: FLOOR + 6, height: 1.58 * scale, facing: -1, i: 3 });
    drawFigure(ctx, c, f, f.look);
    ctx.strokeStyle = c.label; ctx.lineWidth = 5; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(100, FLOOR - h); ctx.lineTo(100, FLOOR); ctx.moveTo(86, FLOOR - h); ctx.lineTo(114, FLOOR - h); ctx.moveTo(86, FLOOR); ctx.lineTo(114, FLOOR); ctx.stroke();
    pill(ctx, c, '2.25 m', 72, FLOOR - h / 2, { size: 28, bg: c.bgSurface, ink: c.label, display: true });
    pill(ctx, c, '282 laws', 530, 92, { size: 42, bg: c.s2, display: true });
    ['Trade, debt', 'Wages', 'Marriage', 'Injury'].forEach((t, i) => { const g = clamp(k * 3 - i * 0.4, 0, 1); ctx.save(); ctx.globalAlpha *= g; pill(ctx, c, t, 530, 180 + i * 60, { size: 30, bg: c.bgSurface, ink: c.label, display: true }); ctx.restore(); });
  }

  _one(ctx, c, k) {
    const pos = [[86, 150], [190, 110], [86, 270], [190, 240], [86, 390], [190, 370]];
    pos.forEach((p, i) => { const g = clamp(k * 2.6 - i * 0.3, 0, 1); ctx.save(); ctx.globalAlpha *= g; drawIcon(ctx, c, 'building', p[0], p[1], 44, { tone: [c.s1, c.s2, c.s3, c.s5, c.s6, c.s7][i] }); ctx.restore(); });
    pill(ctx, c, 'Many customs', 140, 40, { size: 30, bg: c.bgSurface, ink: c.label, display: true });
    ctx.strokeStyle = c.label; ctx.lineWidth = 10; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath(); ctx.moveTo(280, 262); ctx.lineTo(370, 262); ctx.moveTo(346, 238); ctx.lineTo(372, 262); ctx.lineTo(346, 286); ctx.stroke();
    this._stele(ctx, c, 512, FLOOR, 130, 330);
    pill(ctx, c, 'One written law', 512, 72, { size: 32, bg: c.s2, display: true });
  }

  _cards(ctx, c, s, k) {
    const top = s === 3 ? 164 : 96, h = s === 3 ? 330 : 380, w = 214;
    if (s === 2) pill(ctx, c, 'One injury: an eye destroyed', 340, 44, { size: 32, bg: c.bgSurface, ink: c.label, display: true });
    else { rr(ctx, 24, 18, 632, 124, 22); ctx.fillStyle = c.s5; ctx.fill(); ctx.fillStyle = inkOn(c, c.s5); ctx.font = font(c, 600, 34, true); wrapText(ctx, '"so that the strong might not oppress the weak"', 50, 40, 580, { align: 'center', lineH: 44 }); }
    CARDS.forEach(([who, res, icon, tn], i) => {
      const x = 16 + i * (w + 10), g = clamp(k * 3 - i * 0.5, 0, 1), col = c[tn];
      ctx.save(); ctx.globalAlpha *= g;
      rr(ctx, x, top + 6, w, h, 20); ctx.fillStyle = darken(col, 0.3); ctx.fill();
      rr(ctx, x, top, w, h, 20); ctx.fillStyle = c.bgSurface; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = col; ctx.stroke();
      pill(ctx, c, who, x + w / 2, top + 42, { size: 27, bg: col, display: true });
      const iy = top + (s === 3 ? 124 : 146), ir = s === 3 ? 44 : 56;
      if (icon === 'silver') for (let j = 2; j >= 0; j--) { rr(ctx, x + w / 2 - ir * 0.8, iy + ir * 0.5 - j * ir * 0.42, ir * 1.6, ir * 0.42, ir * 0.2); ctx.fillStyle = darken(c.elevPeak, 0.34 - j * 0.12); ctx.fill(); }
      else drawIcon(ctx, c, icon, x + w / 2, iy, ir, { tone: col });
      ctx.fillStyle = c.label; ctx.font = font(c, 600, 30, true);
      wrapText(ctx, res, x + 13, top + (s === 3 ? 186 : 226), w - 26, { align: 'center', lineH: 36 });
      ctx.restore();
    });
  }
}
