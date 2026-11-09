// RecallChecklistScene - L01 s05. b0 what citizens do: vote, speak, take part. b1 what democracy rests
// on: the book's principles. Each chip lights one drawn case and gives it one line.
import { SimScene } from 'simulations/base/kit/SimScene.js';
import { pill, mix, drawBackdrop } from 'simulations/base/kit/SimLook.js';
import { figureFor, drawFigure } from 'simulations/base/kit/SimFigure.js';
import { tapLight, tapLightControl } from 'simulations/base/kit/TapLight.js';
import { panel } from '../shared/SstArt.js';
import { drawCivic } from '../shared/CivicArt.js';

const m = (idx) => [{ idx, dwellMs: null }];
const DO = [
  { id: 'vote', label: 'Vote', targets: ['vote'], tone: 1 },
  { id: 'speak', label: 'Speak', targets: ['speak'], tone: 2 },
  { id: 'part', label: 'Take part', targets: ['part'], tone: 3 },
];
const RESTS = [
  { id: 'free', label: 'Freedom', targets: ['free'], tone: 1 },
  { id: 'equal', label: 'Equality', targets: ['equal'], tone: 2 },
  { id: 'just', label: 'Justice', targets: ['just'], tone: 3 },
  { id: 'duty', label: 'Rights, duties', targets: ['duty'], tone: 5 },
];
const SAY = {
  vote: 'You choose who will represent you.', speak: 'You say what you think of a decision.', part: 'You join a meeting and help decide.',
  free: 'You may say what you think.', equal: 'Every vote counts the same.', just: 'A court hears both sides.', duty: 'You may vote, and you obey the law.',
};
const TOP = 10, CARD_H = 330;

export class RecallChecklistScene extends SimScene {
  static HEIGHT = 456;   // on a phone the host caps height: this keeps 28 px labels near 14 px
  static BEAT_STEP_MAP = [m(0), m(1)];
  static NOTE_STAGE = -1;
  static CONTROLS_IN_SIGHT = true;
  static ARIA_LABEL = 'Three drawn cases of what citizens do: a voter at a booth, a speaker at a microphone and neighbours meeting under a tree. Then four cards for the principles of democracy: freedom, equality, justice, and rights and duties. Each chip lights one case and gives an example.';
  static CONTROLS = [{ ...tapLightControl({ id: 'do', label: 'Show', chips: DO }), options: DO.map((x) => ({ value: x.id, label: x.label })) }, { ...tapLightControl({ id: 'rests', label: 'Show', chips: RESTS }), options: RESTS.map((x) => ({ value: x.id, label: x.label })) }];   // no None: one row keeps the figure wide
  tlDo = tapLight({ chips: DO });
  tlRests = tapLight({ chips: RESTS });

  _tl() { return this.stage === 0 ? this.tlDo : this.tlRests; }
  isControlHidden(id) { return (id === 'do') !== (this.stage === 0); }
  getControlValue(id) { return id === 'do' ? this.tlDo.controlValue() : this.tlRests.controlValue(); }
  onControlChange(id, v) { (id === 'do' ? this.tlDo : this.tlRests).fromControl(v); this.requestDraw?.(); this.animateFor?.(300); }
  enter() { this.tlDo.reset(); this.tlRests.reset(); }
  busy() { return this.age < 0.7; }

  _say(ctx, c) {
    const lit = this._tl().lit()[0];
    if (lit) pill(ctx, c, SAY[lit], 340, 404, { size: 30, bg: mix(c.gold, c.bgSurface, 0.4), ink: c.label, display: true });
    else pill(ctx, c, 'Tap a chip for an example', 340, 404, { size: 28, bg: c.bgSurface, ink: c.labelMuted });
  }

  _fig(ctx, c, o) { const s = figureFor(this, { facing: 0, mood: 'smile', ...o }); drawFigure(ctx, c, s, s.look); }

  _does(ctx, c) {
    const tl = this.tlDo, w = 212, g = 10, xs = [10, 10 + w + g, 10 + 2 * (w + g)], gy = TOP + CARD_H - 26;
    const card = (i, id, name, tone, fn) => {
      const off = tl.off(id);
      panel(ctx, c, xs[i], TOP, w, CARD_H, { fill: mix(c[tone], c.bgSurface, 0.82), rim: tl.has(id) ? c[tone] : c.stroke, lit: tl.has(id), litCol: c[tone], off });
      ctx.save(); if (off) ctx.globalAlpha *= 0.34;
      fn(xs[i] + w / 2);
      pill(ctx, c, name, xs[i] + w / 2, TOP + 34, { size: 30, bg: c.bgSurface, ink: c.label, display: true });
      ctx.restore();
    };
    card(0, 'vote', 'Vote', 's1', (cx) => {
      drawCivic(ctx, c, 'booth', cx + 34, gy, { h: 150 });
      this._fig(ctx, c, { role: 'voter', x: cx - 58, y: gy + 6, height: 190, i: 2, facing: 1 });
    });
    card(1, 'speak', 'Speak', 's2', (cx) => {
      drawCivic(ctx, c, 'mike', cx + 56, gy, { h: 160 });
      this._fig(ctx, c, { role: 'adult', x: cx - 34, y: gy + 6, height: 206, i: 5, facing: 1, pose: 'point' });
    });
    card(2, 'part', 'Take part', 's3', (cx) => {
      drawCivic(ctx, c, 'tree', cx, gy - 34, { h: 190 });
      [[-70, 'elder', 136], [0, 'farmer', 152], [68, 'adult', 142]].forEach(([dx, role, h], i) => this._fig(ctx, c, { role, x: cx + dx, y: gy + 8, height: h, i: i + 1, pose: i === 1 ? 'reach-up' : 'stand' }));
    });
  }

  _rests(ctx, c) {
    const tl = this.tlRests, w = 326, h = 178, pos = [[10, 8], [344, 8], [10, 192], [344, 192]];
    const card = (i, id, name, tone, fn) => {
      const off = tl.off(id), [x, y] = pos[i];
      panel(ctx, c, x, y, w, h, { fill: mix(c[tone], c.bgSurface, 0.82), lit: tl.has(id), litCol: c[tone], off });
      ctx.save(); if (off) ctx.globalAlpha *= 0.34;
      fn(x, y);
      ctx.restore();
      ctx.save(); if (off) ctx.globalAlpha *= 0.5;
      pill(ctx, c, name, x + 116, y + 34, { size: 30, bg: c.bgSurface, ink: c.label, display: true });
      ctx.restore();
    };
    card(0, 'free', 'Freedom', 's1', (x, y) => {
      this._fig(ctx, c, { role: 'student', x: x + 268, y: y + 172, height: 118, i: 3, pose: 'point', facing: -1 });
      drawCivic(ctx, c, 'mike', x + 170, y + 170, { h: 88 });
    });
    card(1, 'equal', 'Equality', 's2', (x, y) => {
      [['elder', 96], ['worker', 170], ['student', 244]].forEach(([role, dx], i) => this._fig(ctx, c, { role, x: x + dx, y: y + 172, height: 108, i: i + 2 }));
    });
    card(2, 'just', 'Justice', 's3', (x, y) => { drawCivic(ctx, c, 'court', x + 200, y + 170, { h: 112 }); });
    card(3, 'duty', 'Rights and duties', 's5', (x, y) => { drawCivic(ctx, c, 'book', x + 168, y + 172, { h: 110 }); });
  }

  draw(ctx, c) {
    drawBackdrop(ctx, c, 'dots');
    if (this.stage === 0) this._does(ctx, c); else this._rests(ctx, c);
    this._say(ctx, c);
  }
}
