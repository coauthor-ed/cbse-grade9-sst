// IrrigationScene - L11 blk-l11-s04, 5 beats. A lake held by a dam, a canal to the fields; the learner breaks and repairs
// the dam; a date strip to scale marks the builder and the two repairs. b3 the Grand Anicut; b4 the same lake, a question.
import { SimScene } from 'simulations/base/kit/SimScene.js';
import { mix, darken, lighten, rr, drawBackdrop, drawVignette } from 'simulations/base/kit/SimLook.js';
import { drawDateStrip } from '../shared/DateStrip.js';
import { ease, plate, sky, stone, riverOf, earth, tree, MAN, person } from '../L09/SstWorld.js';

const W = 680, H = 520, TOPH = 134;
const MAP = [0, 1, 2, 3, 4].map((idx) => [{ idx, dwellMs: null }]);
const STRIP = {
  from: -400, to: 550,
  marks: [
    { id: 'pu', at: -320, when: '4th c. BCE', label: 'Pu\u1E63hyagupta', tone: 2 },
    { id: 'ru', at: 150, when: 'c. 150 CE', label: 'Rudradaman I', tone: 8 },
    { id: 'sk', at: 455, when: '5th c. CE', label: 'Skandagupta', tone: 5 },
  ],
};
const LIT = [['pu'], ['pu', 'ru'], ['pu', 'ru', 'sk'], null, ['pu', 'ru', 'sk']];
const FLOOR = 470, DAM_X = 300;

export class IrrigationScene extends SimScene {
  static BEAT_STEP_MAP = MAP;
  static CONTINUOUS = false;
  static IRIS = false;
  static NOTE_STAGE = -1;
  static CONTROLS_IN_SIGHT = true;
  static ARIA_LABEL = 'A lake behind a stone dam feeds a canal to green fields. Breaking the dam drains the lake and the fields turn dry; repairing it fills them again. A date strip spaced to scale marks the dam, the repair of about 150 CE and the restoration of the 5th century CE. One beat shows the Grand Anicut across a river.';
  static CONTROLS = [
    { type: 'button', id: 'breach', label: 'Breach' },
    { type: 'button', id: 'repair', label: 'Repair' },
  ];

  _broken = false;
  _w = 1;
  _found = false;

  get _dam() { const s = this.stage ?? 0; return s === 1 || s === 2; }
  isControlHidden() { return !this._dam; }
  isControlDisabled(id) { return id === 'breach' ? this._broken : !this._broken; }

  onControlChange(id) {
    if (id === 'breach') this._broken = true;
    if (id === 'repair') {
      if (this._broken && !this._found) { this._found = true; this.celebrate(DAM_X, 380, 14, { key: 'dam-repaired' }); }
      this._broken = false;
    }
    this.animateFor(2000);
    this.requestUiUpdate?.();
  }

  enter() { this._broken = false; this._w = 1; this._found = false; }

  update(d) {
    const to = this._broken ? 0 : 1;
    this._w += Math.sign(to - this._w) * Math.min(Math.abs(to - this._w), d * 0.9);
  }

  busy() { return this._w !== (this._broken ? 0 : 1) || this.age < 1; }

  draw(ctx, c) {
    drawBackdrop(ctx, c, 'plain');
    const s = this.stage ?? 0;
    ctx.fillStyle = sky(c); ctx.fillRect(0, TOPH, W, H - TOPH);
    if (s === 3) this._anicut(ctx, c); else this._lake(ctx, c, s);
    ctx.fillStyle = c.bgSurface; ctx.fillRect(0, 0, W, TOPH);
    ctx.fillStyle = c.stroke; ctx.fillRect(0, TOPH - 3, W, 3);
    if (s === 3) {
      plate(ctx, c, 'Grand Anicut (Kallanai), still in use today', W / 2, 66, { size: 28 });
    } else drawDateStrip(ctx, c, STRIP, { x: 30, y: 18, w: W - 60, size: 28, labelSize: 28, lit: LIT[s] });
    drawVignette(ctx, c, 0.25);
  }

  _lake(ctx, c, s) {
    const so = earth(c), w = this._w, broken = this._broken || w < 0.999;
    // the hills that hold the lake, and the ground
    ctx.fillStyle = mix(stone(c), c.s3, 0.2);
    ctx.beginPath(); ctx.moveTo(0, 210); ctx.quadraticCurveTo(70, 180, 130, 230); ctx.quadraticCurveTo(190, 280, 300, 300); ctx.lineTo(300, H); ctx.lineTo(0, H); ctx.closePath(); ctx.fill();
    ctx.fillStyle = so; ctx.fillRect(DAM_X, 372, W - DAM_X, H);
    ctx.fillStyle = lighten(so, 0.14); ctx.fillRect(DAM_X, 372, W - DAM_X, 6);
    // the lake basin and water
    const lvl = 250 + (FLOOR - 250) * (1 - w), basin = () => { ctx.beginPath(); ctx.moveTo(0, 290); ctx.quadraticCurveTo(120, 470, 300, FLOOR); ctx.lineTo(300, 250); ctx.lineTo(0, 250); ctx.closePath(); };
    ctx.save(); basin(); ctx.fillStyle = darken(so, 0.2); ctx.fill(); ctx.clip();
    ctx.fillStyle = riverOf(c); ctx.fillRect(0, lvl, 300, H - lvl);
    ctx.fillStyle = lighten(riverOf(c), 0.3); ctx.fillRect(0, lvl, 300, 6);
    ctx.restore();
    // the dam: stone courses, with a gap while broken
    const gap = this._broken ? 1 : 1 - Math.min(1, (w - 0) * 1) * 1;
    const dw = 62, top = 232, n = 8, ch = (FLOOR - top) / n;
    for (let r = 0; r < n; r++) {
      for (let i = 0; i < 3; i++) {
        const missing = r < 5 && i === 1 && gap > 0.5;
        if (missing) continue;
        const col = (r + i) % 2 ? stone(c) : darken(stone(c), 0.12);
        ctx.fillStyle = darken(col, 0.2); rr(ctx, DAM_X - 8 + i * (dw / 3), top + r * ch + 2, dw / 3 - 2, ch - 2, 4); ctx.fill();
        ctx.fillStyle = col; rr(ctx, DAM_X - 8 + i * (dw / 3), top + r * ch, dw / 3 - 2, ch - 3, 4); ctx.fill();
      }
    }
    if (broken && this._broken && w > 0.02) {
      ctx.fillStyle = riverOf(c);
      ctx.beginPath(); ctx.moveTo(DAM_X + 8, lvl); ctx.quadraticCurveTo(DAM_X + 60, lvl + 40, DAM_X + 140, 380); ctx.lineTo(DAM_X + 60, 380); ctx.quadraticCurveTo(DAM_X + 36, lvl + 60, DAM_X + 8, lvl + 60); ctx.closePath(); ctx.fill();
    }
    // the canal, full when the lake is
    ctx.fillStyle = darken(so, 0.3); rr(ctx, DAM_X + 50, 376, 330, 18, 6); ctx.fill();
    ctx.fillStyle = mix(darken(so, 0.3), riverOf(c), w); rr(ctx, DAM_X + 50, 379, 330, 12, 5); ctx.fill();
    // fields: green with water, straw without
    for (let i = 0; i < 6; i++) {
      const x = 372 + i * 50, col = mix(mix(c.gold, c.waste, 0.3), mix(c.s3, c.gold, 0.1), w);
      ctx.strokeStyle = col; ctx.lineWidth = 7; ctx.lineCap = 'round';
      const h = 36 + 28 * w;
      for (const dx of [-12, 0, 12]) { ctx.beginPath(); ctx.moveTo(x + dx, 448); ctx.quadraticCurveTo(x + dx, 448 - h * 0.6, x + dx * 2, 448 - h); ctx.stroke(); }
    }
    tree(ctx, c, 636, 372, 180);
    person(this, ctx, c, { role: 'farmer', pose: 'stand', x: 430, y: 410, height: 170, facing: -1, i: 0, look: { ...MAN, mood: this._broken ? 'sad' : 'smile' } });
    if (this._broken) plate(ctx, c, 'breached', DAM_X + 40, 210, { size: 28, ink: c.s6ink });
    else if (s === 0) plate(ctx, c, 'Sudarshana Lake', 130, 210, { size: 28 });
    else if (s === 4) plate(ctx, c, 'Why record it in stone?', 470, 196, { size: 28 });
  }

  _anicut(ctx, c) {
    const so = mix(earth(c), c.s3, 0.3), rv = riverOf(c);
    ctx.fillStyle = so; ctx.fillRect(0, TOPH, W, H);
    // the river comes from the left; the weir of stone lies across it; canals leave on the right
    ctx.fillStyle = rv;
    ctx.beginPath(); ctx.moveTo(0, 210); ctx.quadraticCurveTo(170, 230, 290, 200); ctx.lineTo(320, 470); ctx.quadraticCurveTo(160, 450, 0, 480); ctx.closePath(); ctx.fill();
    ctx.lineCap = 'round'; ctx.strokeStyle = rv;
    const k = ease(this.age / 1.2);
    [[230, 170], [330, 330], [430, 500]].forEach(([y0, y1]) => {
      ctx.lineWidth = 20; ctx.beginPath(); ctx.moveTo(310, y0 + 40); ctx.quadraticCurveTo(440, y0 + 60, 310 + 370 * k, y1); ctx.stroke();
    });
    for (let r = 0; r < 9; r++) {
      const y = 190 + r * 33, x = 280 + r * 3.4;
      ctx.fillStyle = darken(stone(c), 0.22); rr(ctx, x, y + 3, 56, 30, 7); ctx.fill();
      ctx.fillStyle = r % 2 ? stone(c) : lighten(stone(c), 0.1); rr(ctx, x, y, 56, 28, 7); ctx.fill();
    }
    plate(ctx, c, 'stores and shares out water', 200, 170, { size: 28 });
    plate(ctx, c, 'canals to the fields', 510, 280, { size: 28 });
  }
}
