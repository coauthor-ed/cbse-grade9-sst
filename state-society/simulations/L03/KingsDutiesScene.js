// KingsDutiesScene - L03 s04. Two groups read at 390. b0 Protect: from outside, from disorder.
// b1 Judge: four named cases, chips light each. b2 the serious offences, as the book lists them,
// quiet plain tiles with no pictures of harm.
import { SimScene } from 'simulations/base/kit/SimScene.js';
import { drawBackdrop, drawVignette, rr, mix, pill } from 'simulations/base/kit/SimLook.js';
import { tapLight, tapLightControl } from 'simulations/base/kit/TapLight.js';
import { pal, panel, person, crown, reading, hut, MAN } from '../shared/SstArt.js';

const m = (idx) => [{ idx, dwellMs: null }];
const CASES = [{ id: 'abd', label: 'Abduction' }, { id: 'rob', label: 'Robbery' }, { id: 'the', label: 'Theft' }, { id: 'adu', label: 'Adultery' }];
const CHIPS = CASES.map((k, i) => ({ id: k.id, label: k.label, targets: [k.id], tone: [2, 3, 5, 1][i] }));
const TONE = ['s2', 's3', 's5', 's1'];
const SERIOUS = ['killing of a cow', 'acts of treachery', 'consumption of intoxicating liquor'];

export class KingsDutiesScene extends SimScene {
  static BEAT_STEP_MAP = [m(0), m(1), m(2)];
  static NOTE_STAGE = -1;
  static CONTROLS_IN_SIGHT = true;
  static ARIA_LABEL = 'A king\'s duties in two groups. Protect: guards on a wall facing an enemy outside, and people quarrelling inside a town. Administer justice: a king hears four named cases, abduction, robbery, theft and adultery. Then three serious offences listed on plain tiles.';
  static CONTROLS = [tapLightControl({ id: 'lit', label: 'Case', chips: CHIPS })];
  tl = tapLight({ chips: CHIPS });
  isControlHidden(id) { return id === 'lit' && this.stage !== 1; }
  getControlValue(id) { return id === 'lit' ? this.tl.controlValue() : undefined; }
  onControlChange(id, v) { if (id === 'lit') this.tl.fromControl(v); }
  enter() { this.tl.reset(); }

  _protect(ctx, c) {
    const p = pal(c);
    panel(ctx, c, 12, 14, 322, 492, { fill: mix(c.bgSurface, c.s6, 0.12) });
    panel(ctx, c, 346, 14, 322, 492, { fill: mix(c.bgSurface, c.s2, 0.12) });
    reading(ctx, c, 'from outside', 173, 56, 32); reading(ctx, c, 'from disorder', 507, 56, 32);
    rr(ctx, 26, 306, 294, 96, 6); ctx.fillStyle = p.stone; ctx.fill();
    for (let k = 0; k < 5; k++) { rr(ctx, 34 + k * 58, 284, 38, 26, 4); ctx.fillStyle = p.stone; ctx.fill(); }
    person(ctx, this, { role: 'adult', x: 110, y: 296, height: 160, pose: 'point', facing: 1, i: 5, look: MAN });
    person(ctx, this, { role: 'adult', x: 250, y: 492, height: 170, pose: 'walk', facing: -1, i: 7, mood: 'squint', look: MAN });
    person(ctx, this, { role: 'adult', x: 300, y: 494, height: 160, pose: 'walk', facing: -1, i: 8, mood: 'squint', look: MAN });
    hut(ctx, c, 440, 226, 1.3); hut(ctx, c, 590, 240, 1.2);
    person(ctx, this, { role: 'adult', x: 420, y: 490, height: 210, pose: 'point', facing: 1, i: 3, mood: 'oops', look: MAN });
    person(ctx, this, { role: 'adult', x: 590, y: 490, height: 210, pose: 'point', facing: -1, i: 1, mood: 'sad', look: MAN });
  }

  _judge(ctx, c) {
    const p = pal(c);
    rr(ctx, 6, 6, 668, 508, 18); ctx.fillStyle = mix(c.bgSurface, c.gold, 0.1); ctx.fill();
    rr(ctx, 276, 80, 128, 148, 14); ctx.fillStyle = p.wood; ctx.fill();
    person(ctx, this, { role: 'adult', x: 340, y: 232, height: 180, i: 3, look: MAN });
    crown(ctx, c, 340, 54, 0.8);
    CASES.forEach((k, i) => {
      const col = i % 2, row = i >> 1, x = 14 + col * 332, y = 246 + row * 132, on = this.tl.has(k.id), off = this.tl.off(k.id);
      panel(ctx, c, x, y, 320, 120, { fill: mix(c.bgSurface, c[TONE[i]], on ? 0.3 : 0.16), lit: on, litCol: c[TONE[i]], off });
      reading(ctx, c, k.label, x + 160, y + 60, 36, off ? c.labelMuted : c.label);
    });
  }

  _serious(ctx, c) {
    reading(ctx, c, 'Serious offences', 340, 58, 38);
    SERIOUS.forEach((t, i) => {
      const y = 104 + i * 104;
      panel(ctx, c, 40, y, 600, 92, { fill: mix(c.bgSurface, c.stroke, 0.14) });
      reading(ctx, c, t, 340, y + 46, 28);
    });
    pill(ctx, c, 'punishments were severe', 340, 452, { size: 30, bg: c.gold, display: true });
  }

  draw(ctx, c) {
    drawBackdrop(ctx, c, 'dots');
    if (this.stage === 0) this._protect(ctx, c);
    if (this.stage === 1) this._judge(ctx, c);
    if (this.stage === 2) this._serious(ctx, c);
    drawVignette(ctx, c, 0.28);
  }
}
