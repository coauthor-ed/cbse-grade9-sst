// WomenInSocietyScene - one piece of evidence a beat, in true order, on one date strip. L09 blk-l09-s05, 6 beats.
// Vedic (2), post-Maurya, Sangam, Gupta-Vakataka, Chola. People may have faces; stone and copper never do.
import { SimScene } from 'simulations/base/kit/SimScene.js';
import { mix, darken, lighten, rr, drawBackdrop, drawVignette } from 'simulations/base/kit/SimLook.js';
import { figureMetrics } from 'simulations/base/kit/SimFigure.js';
import { drawDateStrip } from '../shared/DateStrip.js';
import { tree, ground, hut, ease, seg, plate, sky, stone, thatch, riverOf, WOMAN, person } from './SstWorld.js';

const W = 680, H = 520, GY = 462, TOP = 118;
const MAP = [0, 1, 2, 3, 4, 5].map((idx) => [{ idx, dwellMs: null }]);
const STRIP = {
  from: -1500, to: 1000,
  marks: [
    { id: 'ved', at: -1100, when: 'Vedic', label: '', tone: 1 },
    { id: 'pm', at: -100, when: 'post-Maurya', label: '', tone: 2 },
    { id: 'san', at: 150, when: 'Sangam', label: '', tone: 3 },
    { id: 'gup', at: 450, when: 'Gupta', label: '', tone: 5 },
    { id: 'cho', at: 900, when: 'Chola', label: '', tone: 8 },
  ],
};
const LIT = ['ved', 'ved', 'pm', 'san', 'gup', 'cho'];

export class WomenInSocietyScene extends SimScene {
  static BEAT_STEP_MAP = MAP;
  static CONTINUOUS = false;
  static IRIS = false;
  static NOTE_STAGE = -1;
  static ARIA_LABEL = 'A date strip runs from the Vedic period to the Chola period. Under it, one piece of evidence at a time: a woman studying beside a sacred fire; four names on palm leaves; a woman giving a gift at an inscribed stone; women planting paddy; a regent holding a copper-plate grant; a royal woman before a temple.';
  static CONTROLS = [];

  busy() { return this.age < 1.2; }

  draw(ctx, c) {
    drawBackdrop(ctx, c, 'plain');
    const s = this.stage ?? 0, k = ease(this.age / 0.7);
    ctx.fillStyle = s === 1 ? mix(sky(c), c.flame, 0.2) : sky(c);
    ctx.fillRect(0, TOP, W, H - TOP);
    ground(ctx, c, GY);
    [this._learn, this._hymns, this._gift, this._paddy, this._regent, this._temple][s].call(this, ctx, c, k);
    ctx.fillStyle = c.bgSurface; ctx.fillRect(0, 0, W, TOP);
    ctx.fillStyle = c.stroke; ctx.fillRect(0, TOP - 3, W, 3);
    drawDateStrip(ctx, c, { ...STRIP, marks: STRIP.marks.map((m) => (m.id === LIT[s] ? m : { ...m, when: '' })) }, { x: 34, y: 18, w: W - 68, size: 28, lit: [LIT[s]], labelSize: 1 });
    drawVignette(ctx, c, 0.3);
  }

  _seat(ctx, c, x, h, build = 'adult') {
    const m = figureMetrics(h, build), y = GY + 40 - m.seatSit;
    ctx.fillStyle = darken(stone(c), 0.14); rr(ctx, x - 50, y, 100, GY + 40 - y, 12); ctx.fill();
    ctx.fillStyle = stone(c); rr(ctx, x - 50, y, 100, 14, 7); ctx.fill();
    return { x, y };
  }

  _learn(ctx, c) {
    tree(ctx, c, 90, GY, 250); tree(ctx, c, 610, GY, 230);
    person(this, ctx, c, { role: 'adult', pose: 'sit', seat: this._seat(ctx, c, 190, 230), y: GY + 40, height: 230, facing: 1, i: 1, look: WOMAN });
    person(this, ctx, c, { role: 'student', pose: 'sit', seat: this._seat(ctx, c, 500, 170, 'teen'), y: GY + 40, height: 170, facing: -1, i: 3, look: WOMAN });
    // the sacred fire between them
    const fx = 345, fy = GY + 30;
    ctx.fillStyle = darken(stone(c), 0.2); rr(ctx, fx - 56, fy - 22, 112, 30, 8); ctx.fill();
    ctx.fillStyle = mix(c.flame, c.gold, 0.2);
    ctx.beginPath(); ctx.moveTo(fx, fy - 112); ctx.quadraticCurveTo(fx + 48, fy - 50, fx + 30, fy - 22); ctx.lineTo(fx - 30, fy - 22); ctx.quadraticCurveTo(fx - 48, fy - 50, fx, fy - 112); ctx.fill();
    ctx.fillStyle = lighten(c.gold, 0.3);
    ctx.beginPath(); ctx.moveTo(fx, fy - 70); ctx.quadraticCurveTo(fx + 22, fy - 40, fx + 12, fy - 22); ctx.lineTo(fx - 12, fy - 22); ctx.quadraticCurveTo(fx - 22, fy - 40, fx, fy - 70); ctx.fill();
    plate(ctx, c, 'scholarly learning, rituals', W / 2, 160, { size: 28 });
  }

  _hymns(ctx, c, k) {
    // dawn behind the hills, for the goddess of dawn; no figure for a goddess
    ctx.fillStyle = mix(c.gold, c.flame, 0.3);
    ctx.beginPath(); ctx.arc(W / 2, GY, 120, Math.PI, 0); ctx.fill();
    ctx.fillStyle = lighten(c.gold, 0.2);
    ctx.beginPath(); ctx.arc(W / 2, GY, 76, Math.PI, 0); ctx.fill();
    const names = ['Ap\u0101l\u0101', 'Vi\u015Bhvav\u0101r\u0101', 'Gho\u1E63h\u0101', 'Lop\u0101mudr\u0101'];
    names.forEach((n, i) => {
      const a = ease(seg(this.age, i * 0.14, i * 0.14 + 0.4));
      const x = 30 + (i % 2) * 320, y = 142 + (i >> 1) * 84;
      ctx.save(); ctx.globalAlpha *= a;
      ctx.fillStyle = darken(mix(c.gold, c.bgSurface, 0.45), 0.14); rr(ctx, x, y + 5, 300, 70, 12); ctx.fill();
      ctx.fillStyle = mix(c.gold, c.bgSurface, 0.45); rr(ctx, x, y, 300, 70, 12); ctx.fill();
      ctx.fillStyle = darken(mix(c.gold, c.bgSurface, 0.45), 0.3);
      ctx.beginPath(); ctx.arc(x + 24, y + 35, 6, 0, Math.PI * 2); ctx.fill();
      ctx.font = `700 34px ${c.fontDisplay}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = c.label;
      ctx.fillText(n, x + 160, y + 36);
      ctx.restore();
    });
    plate(ctx, c, 'Hymns attributed to women sages', W / 2, 330, { size: 28, alpha: k });
    plate(ctx, c, 'U\u1E63ha, dawn', 170, 420, { size: 28, alpha: k });
    plate(ctx, c, 'Aditi, mother of the gods', 490, 420, { size: 28, alpha: k });
  }

  _slab(ctx, c, x, y, w, h) {
    ctx.fillStyle = darken(stone(c), 0.18); rr(ctx, x - 6, y + 6, w + 12, h, 16); ctx.fill();
    ctx.fillStyle = stone(c); rr(ctx, x, y, w, h, 14); ctx.fill();
    ctx.fillStyle = darken(stone(c), 0.34);
    for (let r = 0; r < 5; r++) for (let i = 0; i < 8; i++) {
      if ((r * 7 + i * 3) % 5 === 0) continue;
      rr(ctx, x + 18 + i * ((w - 36) / 8), y + 22 + r * ((h - 40) / 5), (w - 36) / 8 - 8, 9, 3); ctx.fill();
    }
  }

  _gift(ctx, c, k) {
    tree(ctx, c, 60, GY, 240);
    this._slab(ctx, c, 340, 180, 260, 250);
    const hx = 250;
    person(this, ctx, c, { role: 'adult', pose: 'stand', x: hx, y: GY + 42, height: 280, facing: 1, i: 1, look: WOMAN, autoReach: false, hands: [{ x: hx + 64, y: GY - 84 + 12 * (1 - k) }, { x: hx + 56, y: GY - 74 + 12 * (1 - k) }] });
    ctx.fillStyle = mix(c.gold, c.s8, 0.25);
    ctx.beginPath(); ctx.arc(hx + 78, GY - 98 + 12 * (1 - k), 20, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = darken(c.gold, 0.2); rr(ctx, hx + 52, GY - 94 + 12 * (1 - k), 52, 12, 6); ctx.fill();
    plate(ctx, c, 'donors on votive inscriptions', 300, 160, { size: 28 });
  }

  _paddy(ctx, c) {
    const wy = 356;
    ctx.fillStyle = mix(mix(riverOf(c), c.s3, 0.3), c.bgSurface, 0.3); ctx.fillRect(0, wy, W, GY - wy);
    ctx.fillStyle = lighten(mix(mix(riverOf(c), c.s3, 0.3), c.bgSurface, 0.3), 0.14); ctx.fillRect(0, wy, W, 6);
    for (let r = 0; r < 3; r++) for (let i = 0; i < 13; i++) {
      const x = 24 + i * 52 + (r % 2) * 26, y = wy + 28 + r * 34;
      ctx.strokeStyle = mix(c.s3, c.gold, 0.15); ctx.lineWidth = 5; ctx.lineCap = 'round';
      for (const dx of [-8, 0, 8]) { ctx.beginPath(); ctx.moveTo(x, y + 12); ctx.quadraticCurveTo(x + dx * 0.3, y, x + dx, y - 16); ctx.stroke(); }
    }
    const fig = (x, i, h) => person(this, ctx, c, { role: 'farmer', pose: { name: 'reach-up', crouch: 0.3, lean: 26 }, x, y: wy + 112, height: h, facing: 1, i, look: WOMAN, hands: [{ x: x + 62, y: wy + 74 }, { x: x + 52, y: wy + 80 }] });
    fig(160, 1, 230); fig(400, 3, 230);
    plate(ctx, c, 'planting, weeding, winnowing', W / 2, 150, { size: 28 });
    plate(ctx, c, 'Avvaiyar', 200, 202, { size: 28, ink: c.s3ink });
    plate(ctx, c, 'Vennikuyattiyar', 470, 202, { size: 28, ink: c.s3ink });
  }

  _regent(ctx, c, k) {
    hut(ctx, c, 110, GY - 4, 200, { roof: thatch(c) });
    tree(ctx, c, 640, GY, 260);
    const x = 300;
    person(this, ctx, c, { role: 'adult', pose: 'stand', x, y: GY + 42, height: 290, facing: 1, i: 5, look: { ...WOMAN, hairStyle: 'bun', mood: 'smile' }, autoReach: false, hands: [{ x: x + 62, y: GY - 84 }, { x: x + 56, y: GY - 74 }] });
    // the copper-plate grant, held out
    const cu = mix(c.s8, c.gold, 0.35), py = GY - 150 + 24 * (1 - k);
    ctx.fillStyle = darken(cu, 0.24); rr(ctx, x + 66, py + 5, 190, 114, 8); ctx.fill();
    ctx.fillStyle = cu; rr(ctx, x + 66, py, 190, 112, 8); ctx.fill();
    ctx.fillStyle = darken(cu, 0.34);
    for (let r = 0; r < 4; r++) { rr(ctx, x + 82, py + 18 + r * 22, 158 - (r === 3 ? 60 : 0), 8, 3); ctx.fill(); }
    plate(ctx, c, 'Prabh\u0101vat\u012B Gupta, regent', W / 2, 152, { size: 28 });
    plate(ctx, c, 'land grants in her own name', 450, 206, { size: 28, ink: c.s5ink });
  }

  _temple(ctx, c, k) {
    // a stepped stone tower on a plinth
    const tx = 440, base = GY + 8, st = stone(c);
    ctx.fillStyle = darken(st, 0.16); rr(ctx, tx - 170, base - 56, 340, 62, 6); ctx.fill();
    ctx.fillStyle = st; rr(ctx, tx - 170, base - 56, 340, 16, 6); ctx.fill();
    const tiers = 6, grow = ease(this.age / 1);
    for (let i = 0; i < tiers; i++) {
      const w = 230 - i * 32, y = base - 96 - i * 40 * grow;
      ctx.fillStyle = i % 2 ? darken(st, 0.1) : darken(st, 0.04); rr(ctx, tx - w / 2, y, w, 44, 7); ctx.fill();
      ctx.fillStyle = lighten(st, 0.14); rr(ctx, tx - w / 2, y, w, 9, 4); ctx.fill();
    }
    ctx.fillStyle = mix(c.gold, st, 0.3); ctx.beginPath(); ctx.arc(tx, base - 96 - tiers * 40 * grow + 28, 24, Math.PI, 0); ctx.fill();
    ctx.fillStyle = darken(st, 0.5); rr(ctx, tx - 26, base - 54, 52, 60, 22); ctx.fill();
    person(this, ctx, c, { role: 'adult', pose: 'stand', x: 150, y: GY + 42, height: 280, facing: 1, i: 5, look: { ...WOMAN, hairStyle: 'bun' } });
    plate(ctx, c, 'Sembiyan Mah\u0101dev\u012B', 200, 152, { size: 28, alpha: k });
    plate(ctx, c, 'temple building', 150, 204, { size: 28, ink: c.s8ink, alpha: k });
  }
}
