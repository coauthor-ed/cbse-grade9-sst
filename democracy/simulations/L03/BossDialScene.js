// BossDialScene - L03 s01. b0 five years are up: an office, one team leaving, a new one at the gate.
// b1 four cards. Three candidates, each tapped for why not. The fourth stays a question: the people
// are not named here, and the answer comes later in the lesson.
import { SimScene } from 'simulations/base/kit/SimScene.js';
import { pill, mix, drawBackdrop, font } from 'simulations/base/kit/SimLook.js';
import { figureFor, drawFigure } from 'simulations/base/kit/SimFigure.js';
import { tapLight, tapLightControl } from 'simulations/base/kit/TapLight.js';
import { panel } from '../shared/SstArt.js';
import { drawCivic, dayStage } from '../shared/CivicArt.js';

const m = (idx) => [{ idx, dwellMs: null }];
const CHIPS = [
  { id: 'pm', label: 'Prime Minister', targets: ['pm'], tone: 1 },
  { id: 'police', label: 'Police', targets: ['police'], tone: 2 },
  { id: 'judges', label: 'Judges', targets: ['judges'], tone: 3 },
];
const WHY = { pm: 'Term over, and the party may have lost', police: 'They carry out orders and laws', judges: 'They decide cases under the law' };

export class BossDialScene extends SimScene {
  static HEIGHT = 456;   // on a phone the host caps height: this keeps 28 px labels near 14 px
  static BEAT_STEP_MAP = [m(0), m(1)];
  static NOTE_STAGE = -1;
  static CONTROLS_IN_SIGHT = true;
  static ARIA_LABEL = 'First, five years have ended: one team leaves a government office and a new team waits at the gate. Then four cards: the outgoing Prime Minister, the police, the judges, and a card with a question mark. Each chip shows why that candidate is not the boss.';
  static CONTROLS = [{ ...tapLightControl({ id: 'lit', label: 'Who?', chips: CHIPS }), options: CHIPS.map((x) => ({ value: x.id, label: x.label })) }];   // no None: one row keeps the figure wide
  tl = tapLight({ chips: CHIPS });

  isControlHidden(id) { return id === 'lit' && this.stage !== 1; }
  getControlValue(id) { return id === 'lit' ? this.tl.controlValue() : undefined; }
  onControlChange(id, v) { if (id === 'lit') { this.tl.fromControl(v); this.requestDraw?.(); this.animateFor?.(300); } }
  enter() { this.tl.reset(); }
  busy() { return this.age < 1.2; }

  _fig(ctx, c, o) { const s = figureFor(this, { facing: 0, mood: 'smile', ...o }); return drawFigure(ctx, c, s, s.look); }

  _office(ctx, c) {
    dayStage(ctx, c, { horizon: 350, ground: 'stone' });
    drawCivic(ctx, c, 'office', 340, 360, { h: 300 });
    const k = 1 - (1 - Math.min(1, this.age / 1.1)) ** 2;
    [[250, 'adult'], [190, 'elder']].forEach(([x, role], i) => this._fig(ctx, c, { role, x: x - k * 90, y: 442, height: 170, i: i + 3, facing: -1, pose: k < 1 ? { name: 'walk', phase: k * 2 + i * 0.3 } : 'stand' }));
    [[452, 'adult'], [530, 'teacher'], [606, 'student']].forEach(([x, role], i) => this._fig(ctx, c, { role, x, y: 442, height: 170, i: i + 5, facing: -1 }));
    pill(ctx, c, 'old team leaves', 108, 250, { size: 28, bg: c.bgSurface, ink: c.label, display: true });
    pill(ctx, c, 'new team', 560, 250, { size: 28, bg: c.bgSurface, ink: c.label, display: true });
    pill(ctx, c, '5 years are up', 340, 30, { size: 36, bg: mix(c.gold, c.bgSurface, 0.4), ink: c.label, display: true });
  }

  _cards(ctx, c) {
    drawBackdrop(ctx, c, 'dots');
    const w = 162, xs = [8, 176, 344, 512], tl = this.tl, y = 10, h = 340, gy = y + h - 22;
    [['pm', 'outgoing PM', 's1', { role: 'adult', i: 4 }], ['police', 'police', 's2', { role: 'police', i: 2 }], ['judges', 'judge', 's3', { role: 'elder', i: 1 }]].forEach(([id, name, s, o], i) => {
      const off = tl.off(id), lit = tl.has(id), x = xs[i];
      panel(ctx, c, x, y, w, h, { fill: mix(c[s], c.bgSurface, 0.8), lit, litCol: c[s], off });
      ctx.save(); if (off) ctx.globalAlpha *= 0.34;
      this._fig(ctx, c, { ...o, x: x + w / 2, y: gy, height: 236, pose: 'stand' });
      ctx.restore();
      pill(ctx, c, name, x + w / 2, y + 34, { size: 26, bg: c.bgSurface, ink: c.label, display: true, alpha: off ? 0.5 : 1 });
    });
    panel(ctx, c, xs[3], y, w, h, { fill: mix(c.gold, c.bgSurface, 0.7) });
    ctx.font = font(c, 700, 150, true); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = mix(c.gold, c.label, 0.6); ctx.fillText('?', xs[3] + w / 2, y + h / 2);
    const lit = tl.lit()[0];
    pill(ctx, c, lit ? WHY[lit] : 'Tap a name: why not?', 340, 404, { size: 28, bg: lit ? mix(c.gold, c.bgSurface, 0.45) : c.bgSurface, ink: c.label, display: !!lit });
  }

  draw(ctx, c) { if (this.stage === 0) this._office(ctx, c); else this._cards(ctx, c); }
}
