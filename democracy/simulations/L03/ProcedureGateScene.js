// ProcedureGateScene - L03 s05. b0 a traffic stop: a big car and an auto-rickshaw at one red signal, one
// fine. b1 two houses, one rule broken, one notice on each door. b2 Article 21 in the book's words, on a card.
import { SimScene } from 'simulations/base/kit/SimScene.js';
import { pill, mix, darken, drawBackdrop, font, rr } from 'simulations/base/kit/SimLook.js';
import { figureFor, drawFigure } from 'simulations/base/kit/SimFigure.js';
import { panel, pal } from '../shared/SstArt.js';
import { dayStage } from '../shared/CivicArt.js';

const m = (idx) => [{ idx, dwellMs: null }];
const ART21 = ['\u201Cno persons shall be', 'deprived of life or', 'personal liberty except', 'according to procedure', 'established by law.\u201D'];

function wheel(ctx, c, x, y, r) { ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fillStyle = darken(c.waste, 0.62); ctx.fill(); ctx.beginPath(); ctx.arc(x, y, r * 0.45, 0, 7); ctx.fillStyle = mix(c.waste, c.bgSurface, 0.4); ctx.fill(); }

function car(ctx, c, x, y) {
  const b = darken(c.s5, 0.2), g = mix(c.s1, c.bgSurface, 0.35), rim = darken(c.s5, 0.55);
  ctx.beginPath(); ctx.moveTo(x, y - 34); ctx.lineTo(x + 30, y - 88); ctx.lineTo(x + 176, y - 88); ctx.lineTo(x + 224, y - 44); ctx.lineTo(x + 274, y - 34); ctx.lineTo(x + 274, y); ctx.lineTo(x, y); ctx.closePath();
  ctx.fillStyle = b; ctx.fill(); ctx.lineWidth = 3.5; ctx.strokeStyle = rim; ctx.stroke();
  rr(ctx, x + 40, y - 80, 70, 36, 6); ctx.fillStyle = g; ctx.fill(); rr(ctx, x + 120, y - 80, 66, 36, 6); ctx.fill();
  wheel(ctx, c, x + 62, y, 26); wheel(ctx, c, x + 214, y, 26);
}

function auto(ctx, c, x, y) {
  const b = mix(c.gold, c.bgSurface, 0.12), d = mix(c.s3, c.label, 0.4), rim = mix(c.gold, c.label, 0.6);
  ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y - 54); ctx.quadraticCurveTo(x + 6, y - 112, x + 64, y - 118); ctx.lineTo(x + 170, y - 118); ctx.lineTo(x + 170, y); ctx.closePath();
  ctx.fillStyle = b; ctx.fill(); ctx.lineWidth = 3.5; ctx.strokeStyle = rim; ctx.stroke();
  rr(ctx, x + 56, y - 124, 124, 14, 6); ctx.fillStyle = d; ctx.fill(); ctx.stroke();
  rr(ctx, x + 14, y - 100, 44, 44, 8); ctx.fillStyle = mix(c.s1, c.bgSurface, 0.35); ctx.fill();
  rr(ctx, x + 72, y - 96, 86, 50, 6); ctx.fillStyle = darken(c.waste, 0.55); ctx.fill();
  wheel(ctx, c, x + 36, y, 18); wheel(ctx, c, x + 136, y, 18);
}

function signal(ctx, c, x, y) {
  ctx.fillStyle = darken(c.waste, 0.4); ctx.fillRect(x - 6, y, 12, 300);
  rr(ctx, x - 30, y - 120, 60, 150, 12); ctx.fillStyle = darken(c.waste, 0.68); ctx.fill();
  [[c.bad, 1], [c.gold, 0.2], [c.s3, 0.2]].forEach(([col, a], i) => { ctx.save(); ctx.globalAlpha = a; ctx.beginPath(); ctx.arc(x, y - 92 + i * 46, 18, 0, 7); ctx.fillStyle = col; ctx.fill(); ctx.restore(); });
}

function house(ctx, c, x, y, w, h, tone) {
  const p = pal(c);
  ctx.fillStyle = mix(c[tone], c.bgSurface, 0.55); ctx.fillRect(x, y - h, w, h); ctx.lineWidth = 3; ctx.strokeStyle = p.stoneDark; ctx.strokeRect(x, y - h, w, h);
  ctx.beginPath(); ctx.moveTo(x - 14, y - h); ctx.lineTo(x + w / 2, y - h - 62); ctx.lineTo(x + w + 14, y - h); ctx.closePath(); ctx.fillStyle = mix(c.s6, c.s8, 0.5); ctx.fill(); ctx.stroke();
  ctx.fillStyle = p.wood; ctx.fillRect(x + w / 2 - 34, y - 130, 68, 130);
  rr(ctx, x + w / 2 - 28, y - 118, 56, 70, 3); ctx.fillStyle = c.bgSurface; ctx.fill(); ctx.stroke();
  ctx.strokeStyle = p.stone; ctx.lineWidth = 3; [0, 1, 2, 3].forEach((i) => { ctx.beginPath(); ctx.moveTo(x + w / 2 - 20, y - 106 + i * 14); ctx.lineTo(x + w / 2 + 20, y - 106 + i * 14); ctx.stroke(); });
}

export class ProcedureGateScene extends SimScene {
  static HEIGHT = 456;   // on a phone the host caps height: this keeps 28 px labels near 14 px
  static BEAT_STEP_MAP = [m(0), m(1), m(2)];
  static NOTE_STAGE = -1;
  static ARIA_LABEL = 'A big car and an auto-rickshaw stopped at one red signal, with one fine for both. Then two neighbouring houses with the same notice on each door. Then Article 21 in the words of the book, on a card.';

  busy() { return this.age < 0.7; }

  _road(ctx, c) {
    dayStage(ctx, c, { horizon: 236, ground: 'stone' });
    ctx.fillStyle = darken(c.waste, 0.5); ctx.fillRect(0, 246, 680, 140);
    ctx.fillStyle = c.bgSurface; for (let x = 10; x < 680; x += 90) ctx.fillRect(x, 314, 50, 7);
    signal(ctx, c, 626, 138);
    car(ctx, c, 20, 306);
    auto(ctx, c, 322, 308);
    ctx.fillStyle = c.bgSurface; ctx.fillRect(540, 246, 14, 140);
    const s = figureFor(this, { role: 'police', x: 540, y: 446, height: 196, i: 2, facing: -1, pose: 'point', mood: 'smile' }); drawFigure(ctx, c, s, s.look);
    pill(ctx, c, 'big car', 140, 186, { size: 28, bg: c.bgSurface, ink: c.label, display: true });
    pill(ctx, c, 'auto-rickshaw', 400, 154, { size: 28, bg: c.bgSurface, ink: c.label, display: true });
    pill(ctx, c, 'same signal, same fine', 260, 36, { size: 32, bg: mix(c.gold, c.bgSurface, 0.3), display: true });
  }

  _houses(ctx, c) {
    dayStage(ctx, c, { horizon: 372, ground: 'earth' });
    house(ctx, c, 60, 400, 230, 214, 's1');
    house(ctx, c, 390, 400, 230, 214, 's3');
    [[52, 'shopkeeper', 3, 1], [630, 'teacher', 6, -1]].forEach(([x, role, i, f]) => { const s = figureFor(this, { role, x, y: 440, height: 176, i, facing: f, mood: 'think' }); drawFigure(ctx, c, s, s.look); });
    pill(ctx, c, 'same rule broken', 340, 30, { size: 28, bg: c.bgSurface, ink: c.label, display: true });
    pill(ctx, c, 'same notice', 340, 428, { size: 32, bg: mix(c.gold, c.bgSurface, 0.3), display: true });
  }

  _art(ctx, c) {
    drawBackdrop(ctx, c, 'dots');
    panel(ctx, c, 30, 12, 620, 366, { fill: mix(c.gold, c.bgSurface, 0.78) });
    pill(ctx, c, 'Article 21', 340, 52, { size: 34, bg: c.bgSurface, ink: c.label, display: true });
    ctx.font = font(c, 700, 34, true); ctx.fillStyle = c.label; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ART21.forEach((l, i) => ctx.fillText(l, 340, 116 + i * 50));
    pill(ctx, c, 'a valid law, strictly followed', 340, 416, { size: 30, bg: mix(c.s3, c.bgSurface, 0.45), ink: c.label, display: true });
  }

  draw(ctx, c) { [this._road, this._houses, this._art][this.stage].call(this, ctx, c); }
}
