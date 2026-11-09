// BrailleBallotScene - blk-l05-s02 setup, blk-l05-s01, blk-l05-s08. A big balloting unit, after Fig. 7.7.
// Setup: printed rows only, no Braille and no control naming it. s01 b0 Braille and a close-up.
// b1 control unit, cable, balloting unit. b2 names off, press a row: a finger moves, a lamp lights, a beep.
// b3 the groups the steps focus on. s08 b0 the measures of the lesson. b1 rows of names, the next question.
import { SimScene } from 'simulations/base/kit/SimScene.js';
import { drawCivic } from '../shared/CivicArt.js';
import { day, tones, tile, say, folk, tag, pop, mark, braille, wrap, mix, rr, ellipse, darken, clamp01, wheelchair, TAU } from '../L04/BoothWorld.js';

const S_SETUP = 0, S_BRAILLE = 1, S_PARTS = 2, S_PRESS = 3, S_WHY = 4, S_REACH = 5, S_WHO = 6;
const m = (idx) => [{ idx, dwellMs: null }];
const MAP_SETUP = [m(S_SETUP)];
const MAP_S01 = [m(S_BRAILLE), m(S_PARTS), m(S_PRESS), m(S_WHY)];
const MAP_S08 = [m(S_REACH), m(S_WHO)];
const U = { x: 158, y: 22, w: 382, row: 92, gap: 8 };
const ROWS = [{ n: 1, id: 'circle' }, { n: 2, id: 'triangle' }, { n: 3, id: 'square' }];
const rowY = (i) => U.y + 12 + i * (U.row + U.gap);
const BTN = { dx: 266, w: 62, h: 34 }, DOTS = { dx: 336 };
const GROUPS = ['Persons with Disabilities', 'Senior citizens', 'Transgender persons', 'PVTGs'];
const MEASURES = ['Braille', 'Screen at home', 'ETPBS', 'Companion', 'Wheelchair'];

export class BrailleBallotScene extends SimScene {
  static BEAT_STEP_MAP = MAP_SETUP;
  static BEAT_MAPS = { 0: MAP_SETUP, 2: MAP_S08, 4: MAP_S01 };
  static HEIGHT = 456;
  static CONTROLS_IN_SIGHT = true;
  static ARIA_LABEL = 'A large balloting unit with three rows, each with a number, a candidate, a plain mark and a blue button, and a voter who cannot see standing at it. Raised Braille numbers sit beside the buttons, shown in a close-up. A control unit is joined by a cable. Pressing a row lights its lamp.';
  static CONTROLS = [
    { type: 'segmented', tall: true, id: 'names', label: 'Printed names', value: 'on', options: [{ value: 'on', label: 'Names on' }, { value: 'off', label: 'Names off' }] },
    { type: 'segmented', tall: true, id: 'press', label: 'Press a button', value: '', options: ROWS.map((r) => ({ value: String(r.n - 1), label: 'Row ' + r.n })) },
  ];

  constructor(container, config) { super(container, config); this._off = false; this._lamp = -1; this._to = -1; this._t0 = -9; this._found = false; }
  enter() { this._off = false; this._lamp = -1; this._to = -1; this._t0 = -9; }
  busy() { return this.age < 1 || this.clock - this._t0 < 1; }
  isControlHidden() { return this.stage !== S_PRESS; }
  getControlValue(id) { return id === 'names' ? (this._off ? 'off' : 'on') : id === 'press' ? (this._lamp >= 0 ? String(this._lamp) : '') : undefined; }
  onControlChange(id, v) {
    if (!this._guard(id)) return;
    if (id === 'names') { this._off = v === 'off'; this.requestUiUpdate?.(); }
    if (id === 'press') this._press(+v);
  }
  pointerDown(p) {
    if (this.stage !== S_PRESS || p.x < U.x || p.x > U.x + U.w) return;
    const i = Math.floor((p.y - U.y - 12) / (U.row + U.gap));
    if (ROWS[i]) this._press(i);
  }
  _press(i) {
    this._to = i; this._t0 = this.clock; this._lamp = -1;
    const st = this.stage;
    this.after(0.62, () => {
      if (this.stage !== st) return;
      this._lamp = i;
      this.floatText('Beep', U.x + BTN.dx + 30, rowY(i) + 8, { size: 28 });
      if (this._off && !this._found) { this._found = true; this.celebrate(U.x + BTN.dx + 30, rowY(i) + 46, 12); }
      this.requestUiUpdate?.();
    });
    this.requestUiUpdate?.();
  }

  // The balloting unit. o: dots, off (no printed names), lit (row), ask (question marks).
  _unit(ctx, c, o = {}) {
    const t = tones(c), H = U.row * 3 + U.gap * 2 + 24;
    ctx.fillStyle = darken(t.grey, 0.28); rr(ctx, U.x - 3, U.y + 5, U.w + 6, H + 2 + 26, 18); ctx.fill();
    ctx.fillStyle = t.grey; rr(ctx, U.x, U.y, U.w, H + 26, 16); ctx.fill();
    ROWS.forEach((r, i) => {
      const y = rowY(i), x = U.x + 10, cy = y + U.row / 2;
      ctx.fillStyle = o.off ? mix(t.grey, c.bgSurface, 0.3) : c.bgSurface; rr(ctx, x, y, U.w - 20, U.row, 10); ctx.fill();
      if (!o.off) {
        say(ctx, c, String(r.n), x + 20, cy, { size: 34 });
        say(ctx, c, o.ask ? '?' : (o.big ? 'Name ' : 'Candidate ') + r.n, x + 40, cy - 16, { size: o.big ? 30 : 25, display: false, align: 'left' });
        mark(ctx, c, r.id, x + 62, cy + 20, 15);
      }
      const on = o.lit === i;
      ctx.fillStyle = on ? c.bad : mix(c.bad, t.grey, 0.72); ellipse(ctx, x + 196, cy, 13, 13); ctx.fill();
      if (on) { ctx.strokeStyle = mix(c.bad, c.bgSurface, 0.5); ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(x + 196, cy, 20, 0, TAU); ctx.stroke(); }
      ctx.fillStyle = darken(c.accent, 0.32); rr(ctx, x + BTN.dx - 10 - 40, cy - BTN.h / 2 + 5, BTN.w, BTN.h, 12); ctx.fill();
      ctx.fillStyle = c.accent; rr(ctx, x + BTN.dx - 10 - 40, cy - BTN.h / 2, BTN.w, BTN.h, 12); ctx.fill();
      if (o.dots) braille(ctx, c, r.n, x + DOTS.dx - 58 + 28, cy - 11, 9.5, 3.8);
    });
    ctx.fillStyle = mix(t.grey, c.label, 0.2);
    rr(ctx, U.x + 10, rowY(3) + 2, U.w - 20, 22, 6); ctx.fill();
  }

  // The close-up, as in Fig. 7.7: a round lens on the Braille of row 1 and 2.
  _lens(ctx, c, k) {
    const x = 590, y = 126, r = 84 * Math.min(1, k), t = tones(c);
    if (r < 6) return;
    ctx.save(); ctx.beginPath(); ctx.arc(x, y, r, 0, TAU);
    ctx.fillStyle = mix(c.gold, c.bgSurface, 0.7); ctx.fill(); ctx.clip();
    ctx.fillStyle = c.accent; rr(ctx, x - 112, y - 54, 60, 34, 12); ctx.fill(); rr(ctx, x - 112, y + 26, 60, 34, 12); ctx.fill();
    braille(ctx, c, 1, x - 34, y - 62, 20, 7.6); braille(ctx, c, 2, x - 34, y + 16, 20, 7.6);
    ctx.restore();
    ctx.lineWidth = 7; ctx.strokeStyle = t.wood; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.stroke();
  }

  _voter(ctx) {
    folk(ctx, this, { role: 'adult', x: 72, y: 442, height: 356, facing: 1, i: 6, pose: 'stand', mood: 'smile' });
  }

  draw(ctx, c) {
    const s = this.stage, a = this.age, t = tones(c);
    if (s === S_SETUP || s === S_BRAILLE) {
      day(ctx, c, 680, 456, { ground: 400, hills: false, sun: false });
      this._unit(ctx, c, { dots: s === S_BRAILLE, big: s === S_SETUP });
      this._voter(ctx, c);
      ctx.strokeStyle = c.label; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(122, 288); ctx.lineTo(146, 446); ctx.stroke();
      if (s === S_BRAILLE) { this._lens(ctx, c, pop(a, 0.25)); tag(ctx, c, 'Raised Braille', 572, 240, { size: 26, scale: pop(a, 0.5) }); }
    } else if (s === S_PARTS) {
      day(ctx, c, 680, 456, { ground: 400, hills: false, sun: false });
      this._unit(ctx, c, { dots: true });
      ctx.strokeStyle = t.greyDark; ctx.lineWidth = 7; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(84, 248); ctx.bezierCurveTo(84, 150, 100, 60, U.x + 12, 66); ctx.stroke();
      tile(ctx, c, 12, 250, 134, 170, { fill: t.grey, r: 12 });
      ctx.fillStyle = c.label; rr(ctx, 26, 268, 106, 34, 6); ctx.fill();
      ctx.fillStyle = c.bgSurface; rr(ctx, 26, 316, 50, 26, 6); ctx.fill();
      ctx.fillStyle = c.accent; rr(ctx, 26, 356, 106, 44, 8); ctx.fill();
      tag(ctx, c, 'Control unit', 94, 216, { size: 26, scale: pop(a, 0.2) });
      tag(ctx, c, 'Cable', 66, 104, { size: 26, scale: pop(a, 0.35) });
      tag(ctx, c, 'Kept by the officer', 124, 432, { size: 24, scale: pop(a, 0.7) });
      tag(ctx, c, 'Balloting unit: for the voter', 430, 424, { size: 26, scale: pop(a, 0.5) });
    } else if (s === S_PRESS) {
      day(ctx, c, 680, 456, { ground: 400, hills: false, sun: false });
      this._unit(ctx, c, { dots: true, off: this._off, lit: this._lamp });
      this._voter(ctx, c);
      const k = this._to >= 0 ? clamp01((this.clock - this._t0) / 0.6) : 0, row = this._to >= 0 ? this._to * (k * k * (3 - 2 * k)) : 0;
      const fx = U.x + 10 + DOTS.dx - 12, fy = rowY(0) + row * (U.row + U.gap) + U.row / 2;
      ctx.fillStyle = darken(c.gold, 0.1); rr(ctx, fx - 12, fy + 12, 24, 62, 12); ctx.fill();
      ctx.lineWidth = 3; ctx.strokeStyle = c.label; ctx.stroke();
      ctx.fillStyle = mix(c.gold, c.bgSurface, 0.6); rr(ctx, fx - 7, fy + 15, 14, 12, 5); ctx.fill();
      tag(ctx, c, this._lamp >= 0 ? 'Vote cast: row ' + (this._lamp + 1) : this._off ? 'Only what a finger finds' : 'Printed names on', 610, 426, { size: 25, align: 'right' });
    } else if (s === S_WHY) {
      day(ctx, c, 680, 456, { ground: 400, hills: false, sun: false });
      GROUPS.forEach((g, i) => {
        const x = 10 + (i % 2) * 335, y = 8 + (i >> 1) * 222, k = pop(a, 0.05 + i * 0.14);
        ctx.save(); ctx.globalAlpha *= Math.min(1, k);
        tile(ctx, c, x, y, 325, 212, { fill: c.bgSurface });
        if (i === 0) { const seat = wheelchair(ctx, c, x + 76, y + 196, 0.92); folk(ctx, this, { role: 'adult', x: seat.x, y: y + 196, height: 124, pose: 'sit', seat, facing: 1, i: 7 }); } else folk(ctx, this, { role: ['', 'elder', 'adult', 'farmer'][i], x: x + 72, y: y + 200, height: 178, facing: 0, i: i * 2 + 1 });
        wrap(ctx, c, g, x + 216, y + 106, 186, { size: 28, display: true });
        ctx.restore();
      });
    } else if (s === S_REACH) {
      day(ctx, c, 680, 456, { ground: 350 });
      MEASURES.forEach((w, i) => {
        const x = (i < 3 ? 12 + i * 222 : 124 + (i - 3) * 222), y = i < 3 ? 12 : 232, k = pop(a, 0.05 + i * 0.12);
        ctx.save(); ctx.globalAlpha *= Math.min(1, k);
        tile(ctx, c, x, y, 212, 208, { fill: c.bgSurface });
        const cx = x + 106, g = y + 150;
        if (i === 0) { braille(ctx, c, 3, cx - 58, g - 90, 26, 9); } else if (i === 1) { drawCivic(ctx, c, 'booth', cx, g, { h: 118 }); } else if (i === 2) { drawCivic(ctx, c, 'phone', cx, g, { h: 124 }); } else if (i === 3) { folk(ctx, this, { role: 'adult', x: cx - 34, y: g, height: 128, facing: 1, i: 3 }); folk(ctx, this, { role: 'elder', x: cx + 34, y: g, height: 122, facing: -1, i: 5 }); } else { wheelchair(ctx, c, cx, g, 1); }
        say(ctx, c, w, cx, y + 180, { size: 26 });
        ctx.restore();
      });
    } else {
      day(ctx, c, 680, 456, { ground: 400, hills: false, sun: false });
      this._unit(ctx, c, { dots: true });
      folk(ctx, this, { role: 'student', x: 76, y: 442, height: 340, facing: 1, i: 4, pose: 'point', mood: 'think' });
      tag(ctx, c, 'Who are they?', 290, 424, { size: 26, scale: pop(a, 0.2) });
      tag(ctx, c, 'What will they do?', 526, 424, { size: 26, scale: pop(a, 0.4) });
    }
  }
}
