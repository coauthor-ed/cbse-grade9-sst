// BigQuestionsScene - L11 blk-l11-s09, the course's last slide, 5 beats. One date strip from the Vedic period to 1000 CE;
// each beat lights the part of the story its Big Question asks about, with four small drawn emblems from earlier lessons.
import { SimScene } from 'simulations/base/kit/SimScene.js';
import { mix, darken, rr, drawBackdrop, drawVignette } from 'simulations/base/kit/SimLook.js';
import { drawDateStrip } from '../shared/DateStrip.js';
import { ease, seg, plate, sky, hut, tree, stone, ground, MAN, WOMAN, person } from '../L09/SstWorld.js';

const W = 680, H = 520, TOP = 112, GY = 452;
const MAP = [0, 1, 2, 3, 4].map((idx) => [{ idx, dwellMs: null }]);
const STRIP = {
  from: -1500, to: 1000,
  marks: [
    { id: 'jana', at: -1200, when: 'clans', label: '', tone: 2 },
    { id: 'maha', at: -500, when: 'kingdoms', label: '', tone: 3 },
    { id: 'emp', at: 100, when: 'empires', label: '', tone: 5 },
    { id: 'reg', at: 800, when: 'Cholas', label: '', tone: 8 },
  ],
};
const QUESTIONS = ['How did they organise?', 'How did they spread?', 'What made them one idea?', 'How did groups come together?', 'What lasted?'];

export class BigQuestionsScene extends SimScene {
  static BEAT_STEP_MAP = MAP;
  static CONTINUOUS = false;
  static IRIS = false;
  static NOTE_STAGE = -1;
  static ARIA_LABEL = 'A date strip from clans to the Cholas. Under it, a hut growing into a town and a palace; regions lighting on a line from north to south; a wheel for the ruler and a lamp for dharma; a farmer, a weaver and a singer; and last a stone with a lamp that stays lit across the whole strip.';
  static CONTROLS = [];

  busy() { return this.age < 1.5; }

  draw(ctx, c) {
    drawBackdrop(ctx, c, 'plain');
    const s = this.stage ?? 0;
    ctx.fillStyle = sky(c); ctx.fillRect(0, TOP, W, H - TOP);
    ground(ctx, c, GY);
    [this._grow, this._spread, this._idea, this._groups, this._last][s].call(this, ctx, c, ease(this.age / 0.9));
    ctx.fillStyle = c.bgSurface; ctx.fillRect(0, 0, W, TOP);
    ctx.fillStyle = c.stroke; ctx.fillRect(0, TOP - 3, W, 3);
    drawDateStrip(ctx, c, STRIP, { x: 40, y: 20, w: W - 80, size: 28, labelSize: 1, lit: s === 0 ? ['jana', 'maha', 'emp'] : null });
    plate(ctx, c, QUESTIONS[s], W / 2, TOP + 38, { size: 30 });
    drawVignette(ctx, c, 0.25);
  }

  _palace(ctx, c, x, y, s) {
    const st = stone(c);
    ctx.fillStyle = darken(st, 0.16); rr(ctx, x - 120 * s, y - 120 * s, 240 * s, 120 * s, 8); ctx.fill();
    ctx.fillStyle = st; rr(ctx, x - 120 * s, y - 120 * s, 240 * s, 22 * s, 8); ctx.fill();
    for (let i = 0; i < 5; i++) { ctx.fillStyle = darken(st, 0.4); rr(ctx, x - 100 * s + i * 42 * s, y - 80 * s, 26 * s, 80 * s, 10 * s); ctx.fill(); }
    ctx.fillStyle = mix(c.gold, st, 0.3); ctx.beginPath(); ctx.arc(x, y - 120 * s, 44 * s, Math.PI, 0); ctx.fill();
  }

  _grow(ctx, c) {
    const a = this.age;
    hut(ctx, c, 110, GY + 8, 130);
    const k1 = ease(seg(a, 0.3, 0.8)), k2 = ease(seg(a, 0.7, 1.2));
    ctx.save(); ctx.globalAlpha *= k1;
    hut(ctx, c, 270, GY + 8, 150); hut(ctx, c, 342, GY + 16, 120);
    ctx.restore();
    ctx.save(); ctx.globalAlpha *= k2; this._palace(ctx, c, 530, GY + 12, 1); ctx.restore();
    plate(ctx, c, 'jana', 110, 300, { size: 28 });
    plate(ctx, c, 'kingdoms', 310, 300, { size: 28, alpha: k1 });
    plate(ctx, c, 'empires', 530, 236, { size: 28, alpha: k2 });
  }

  _spread(ctx, c, k) {
    const pts = [['Ganga plains', 130, 240], ['Deccan', 300, 310], ['Tamilakam', 470, 390]];
    ctx.strokeStyle = c.s3; ctx.lineWidth = 12; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(130, 240); ctx.quadraticCurveTo(270, 250, 300 + 170 * k, 310 + 80 * k); ctx.stroke();
    pts.forEach(([t, x, y], i) => {
      const a = ease(seg(this.age, 0.2 + i * 0.3, 0.6 + i * 0.3));
      ctx.fillStyle = c.s3; ctx.globalAlpha = a; ctx.beginPath(); ctx.arc(x, y, 18, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;
      plate(ctx, c, t, x, y - 40, { size: 28, alpha: a });
    });
    tree(ctx, c, 620, GY, 180);
  }

  _idea(ctx, c, k) {
    // a chakra for the ruling ideal, a lamp for dharma: emblems, without a face
    const x = 210, y = 310, r = 96;
    ctx.save(); ctx.translate(x, y); ctx.rotate(k * 0.8);
    ctx.strokeStyle = c.s2; ctx.lineWidth = 16; ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.stroke();
    ctx.lineWidth = 8;
    for (let i = 0; i < 8; i++) { const t = i * Math.PI / 4; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(t) * r, Math.sin(t) * r); ctx.stroke(); }
    ctx.restore();
    ctx.fillStyle = c.s2; ctx.beginPath(); ctx.arc(x, y, 18, 0, Math.PI * 2); ctx.fill();
    plate(ctx, c, 'chakravarti samr\u0101\u1E6D', x, 430, { size: 28 });
    const lx = 490, ly = 340;
    ctx.fillStyle = darken(mix(c.s8, c.waste, 0.4), 0.14);
    ctx.beginPath(); ctx.moveTo(lx - 60, ly); ctx.quadraticCurveTo(lx, ly + 76, lx + 60, ly); ctx.closePath(); ctx.fill();
    ctx.fillStyle = mix(c.flame, c.gold, 0.4);
    ctx.beginPath(); ctx.moveTo(lx, ly - 90 * k); ctx.quadraticCurveTo(lx + 32, ly - 20, lx, ly); ctx.quadraticCurveTo(lx - 32, ly - 20, lx, ly - 90 * k); ctx.fill();
    plate(ctx, c, 'dharma', lx, 430, { size: 28 });
  }

  _groups(ctx, c) {
    const items = [['s3', 'farmers', 'farmer', MAN], ['s1', 'weavers', 'worker', WOMAN], ['s5', 'poets', 'adult', WOMAN], ['s8', 'traders', 'shopkeeper', MAN]];
    items.forEach(([tone, t, role, look], i) => {
      const a = ease(seg(this.age, i * 0.15, i * 0.15 + 0.5)), x = 100 + i * 160;
      ctx.save(); ctx.globalAlpha *= a;
      person(this, ctx, c, { role, pose: 'stand', x, y: GY + 40, height: 210, facing: 0, i, look });
      ctx.restore();
      plate(ctx, c, t, x, 212, { size: 28, ink: c[`${tone}ink`], alpha: a });
    });
  }

  _last(ctx, c, k) {
    // a band of light across the whole strip's width: traditions carried through the changes
    ctx.fillStyle = mix(c.gold, sky(c), 0.5);
    rr(ctx, 40, 228, (W - 80) * k, 72, 36); ctx.fill();
    plate(ctx, c, 'a remarkable continuity', W / 2, 264, { size: 34, alpha: ease(seg(this.age, 0.7, 1.2)) });
    hut(ctx, c, 120, GY + 8, 150);
    tree(ctx, c, 320, GY, 170); this._palace(ctx, c, 530, GY + 12, 0.6);
    plate(ctx, c, 'still shaping life today', W / 2, 340, { size: 28, alpha: ease(seg(this.age, 0.9, 1.4)) });
  }
}
