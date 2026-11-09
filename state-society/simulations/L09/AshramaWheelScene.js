// AshramaWheelScene - the four stages of one life, one drawn moment a beat, then all four with the sixteen rites.
// L09 blk-l09-s01 (5 beats) and blk-l09-s08 (1 beat: the first stage again, the student). The file name is older
// than the picture: it is a road of stages, not a wheel, and a game no longer borrows from it.
import { SimScene } from 'simulations/base/kit/SimScene.js';
import { mix, darken, lighten, rr, drawBackdrop, drawVignette, drawCard } from 'simulations/base/kit/SimLook.js';
import { figureMetrics } from 'simulations/base/kit/SimFigure.js';
import { drawAnimal } from 'simulations/base/kit/SimAnimal.js';
import { hut, tree, ground, ease, seg, say, plate, sky, thatch, stone, MAN, WOMAN, person } from './SstWorld.js';

const W = 680, H = 520, GY = 440;
const MAP = [0, 1, 2, 3, 4].map((idx) => [{ idx, dwellMs: null }]);
const STAGES = [
  { name: 'Brahmacharya', gloss: 'the student', tone: 's1' },
  { name: 'G\u1E5Bihastha', gloss: 'the householder', tone: 's8' },
  { name: 'V\u0101naprastha', gloss: 'life in the forest', tone: 's3' },
  { name: 'Sa\u1E41ny\u0101sa', gloss: 'renunciation', tone: 's5' },
];

export class AshramaWheelScene extends SimScene {
  static BEAT_STEP_MAP = MAP;
  static BEAT_MAPS = { 1: [[{ idx: 0, dwellMs: null }]], 5: MAP };
  static CONTINUOUS = false;
  static IRIS = false;
  static NOTE_STAGE = -1;
  static ARIA_LABEL = 'The four stages of a life, one at a time: a pupil learning from a teacher; a couple with children at their home; an older couple walking from their home to the forest; a person alone in the hills who has given up home and belongings. The last view shows all four with a road of sixteen marks for the rites of passage.';
  static CONTROLS = [];

  busy() { return this.age < 1.3; }

  draw(ctx, c) {
    drawBackdrop(ctx, c, 'plain');
    const s = this.stage ?? 0;
    if (s < 4) {
      this._stage(ctx, c, s);
      this._title(ctx, c, s);
    } else this._all(ctx, c);
    drawVignette(ctx, c, 0.4);
  }

  _title(ctx, c, s) {
    const st = STAGES[s];
    plate(ctx, c, `${st.name}: ${st.gloss}`, W / 2, 40, { size: 30 });
    STAGES.forEach((_, i) => {
      const x = W / 2 - 54 + i * 36, on = i === s;
      ctx.fillStyle = on ? c[st.tone] : mix(c.stroke, c.bgSurface, 0.3);
      ctx.beginPath(); ctx.arc(x, 82, on ? 11 : 8, 0, Math.PI * 2); ctx.fill();
    });
  }

  _stage(ctx, c, s, still = false) {
    const k = still ? 1 : ease(this.age / 0.7);
    ctx.fillStyle = sky(c); ctx.fillRect(0, 0, W, GY);
    if (s === 3) this._hills(ctx, c);
    ground(ctx, c, GY);
    if (s === 0) this._student(ctx, c);
    else if (s === 1) this._home(ctx, c, k);
    else if (s === 2) this._forest(ctx, c, k);
    else this._alone(ctx, c, k);
  }

  _student(ctx, c) {
    tree(ctx, c, 90, GY, 380); tree(ctx, c, 640, GY, 320);
    hut(ctx, c, 470, GY - 6, 190);
    const seat = (x, h, build) => { const m = figureMetrics(h, build); const y = GY + 46 - m.seatSit; ctx.fillStyle = darken(stone(c), 0.14); rr(ctx, x - 44, y, 88, GY + 46 - y, 12); ctx.fill(); ctx.fillStyle = stone(c); rr(ctx, x - 44, y, 88, 14, 7); ctx.fill(); return { x, y }; };
    const t = seat(170, 230, 'adult');
    person(this, ctx, c, { role: 'elder', pose: 'sit', seat: t, y: GY + 46, height: 230, facing: 1, i: 0, look: MAN });
    [[380, 2], [486, 3], [592, 6]].forEach(([x, i]) => {
      const p = seat(x, 170, 'teen');
      person(this, ctx, c, { role: 'student', pose: 'sit', seat: p, y: GY + 46, height: 170, facing: -1, i });
    });
    // a palm-leaf book on a low stand between them
    ctx.fillStyle = darken(stone(c), 0.2); rr(ctx, 262, GY + 8, 56, 32, 7); ctx.fill();
    ctx.fillStyle = mix(c.gold, c.bgSurface, 0.35); rr(ctx, 248, GY - 2, 84, 13, 5); ctx.fill();
  }

  _home(ctx, c, k) {
    tree(ctx, c, 620, GY, 300);
    hut(ctx, c, 300, GY - 6, 500);
    ctx.fillStyle = darken(thatch(c), 0.1);
    drawAnimal(ctx, c, { kind: 'cow', x: 590, y: GY + 44, length: 150, facing: -1, pose: 'stand' }, {});
    const P = [['adult', 150, 186, 0, MAN], ['adult', 236, 174, 1, WOMAN], ['student', 322, 132, 6], ['child', 392, 104, 7]];
    P.forEach(([role, x, height, i, look]) => {
      ctx.save(); ctx.globalAlpha *= k;
      person(this, ctx, c, { role, pose: 'stand', x, y: GY + 52, height, facing: 0, i, look });
      ctx.restore();
    });
  }

  _forest(ctx, c, k) {
    hut(ctx, c, 100, GY - 6, 210);
    tree(ctx, c, 500, GY, 320); tree(ctx, c, 620, GY, 400); tree(ctx, c, 400, GY, 240);
    // the path from the house towards the trees
    ctx.fillStyle = lighten(mix(c.s8, c.waste, 0.5), 0.3);
    ctx.beginPath(); ctx.moveTo(90, GY + 12); ctx.quadraticCurveTo(360, GY + 16, 680, GY + 42); ctx.lineTo(680, GY + 70); ctx.quadraticCurveTo(320, GY + 60, 90, GY + 34); ctx.closePath(); ctx.fill();
    const x = 230 + 90 * k;
    person(this, ctx, c, { role: 'elder', pose: { name: 'walk', phase: 0.2 }, x, y: GY + 44, height: 170, facing: 1, i: 0, look: MAN });
    ctx.strokeStyle = darken(mix(c.s8, c.waste, 0.4), 0.2); ctx.lineWidth = 7; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x + 62, GY - 62); ctx.lineTo(x + 70, GY + 46); ctx.stroke();
    person(this, ctx, c, { role: 'elder', pose: { name: 'walk', phase: 0.7 }, x: x - 76, y: GY + 42, height: 160, facing: 1, i: 1, look: WOMAN });
  }

  _hills(ctx, c) {
    const rock = mix(stone(c), c.s5, 0.2);
    const peak = (x, h, w, col) => {
      ctx.fillStyle = col;
      ctx.beginPath(); ctx.moveTo(x - w, GY); ctx.lineTo(x, GY - h); ctx.lineTo(x + w, GY); ctx.closePath(); ctx.fill();
      ctx.fillStyle = lighten(c.bgSurface, 0.3);
      ctx.beginPath(); ctx.moveTo(x - w * 0.22, GY - h * 0.78); ctx.lineTo(x, GY - h); ctx.lineTo(x + w * 0.22, GY - h * 0.78); ctx.lineTo(x + w * 0.06, GY - h * 0.72); ctx.lineTo(x - w * 0.06, GY - h * 0.78); ctx.closePath(); ctx.fill();
    };
    peak(170, 300, 240, darken(rock, 0.08));
    peak(520, 340, 280, rock);
  }

  _alone(ctx, c) {
    const h = 270, m = figureMetrics(h, 'adult'), y = GY + 54 - m.seatSit;
    ctx.fillStyle = darken(stone(c), 0.12); rr(ctx, 230, y, 220, GY + 54 - y, 26); ctx.fill();
    ctx.fillStyle = stone(c); rr(ctx, 238, y, 204, 30, 15); ctx.fill();
    person(this, ctx, c, { role: 'elder', pose: 'sit', seat: { x: 340, y }, y: GY + 54, height: h, facing: 1, i: 0, look: { ...MAN, mood: 'think' } });
    tree(ctx, c, 100, GY, 200); tree(ctx, c, 610, GY, 180);
  }

  _all(ctx, c) {
    const a = this.age, PW = 322, PH = 188;
    STAGES.forEach((st, i) => {
      const x = 12 + (i % 2) * (PW + 12), y = 12 + (i >> 1) * (PH + 12);
      const pop = ease(seg(a, i * 0.1, i * 0.1 + 0.4));
      ctx.save();
      ctx.globalAlpha *= pop;
      ctx.beginPath(); rr(ctx, x, y, PW, PH, 14); ctx.clip();
      ctx.translate(x, y); ctx.scale(PW / W, PH / H);
      this._stage(ctx, c, i, true);
      ctx.restore();
      ctx.save(); ctx.globalAlpha *= pop;
      ctx.lineWidth = 4; ctx.strokeStyle = c[st.tone]; rr(ctx, x, y, PW, PH, 14); ctx.stroke();
      plate(ctx, c, st.name, x + PW / 2, y + 24, { size: 28 });
      ctx.restore();
    });
    // the sixteen rites: marks along one road, under all four stages
    drawCard(ctx, c, 12, 416, 656, 92);
    say(ctx, c, '16 rites of passage', W / 2, 442, { size: 28 });
    const n = 16, x0 = 44, dx = (W - 2 * x0) / (n - 1);
    const shown = Math.round(n * ease(seg(a, 0.5, 1.2)));
    for (let i = 0; i < n; i++) {
      ctx.fillStyle = i < shown ? c.s8 : mix(c.stroke, c.bgSurface, 0.5);
      ctx.beginPath(); ctx.arc(x0 + i * dx, 484, 11, 0, Math.PI * 2); ctx.fill();
    }
  }
}
