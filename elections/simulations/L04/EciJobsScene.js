// EciJobsScene - blk-l04-s09. b0 the book's four jobs on four tiles; tap one for one true example.
// b1 a voter whom all of that has not reached: home on a hill, the booth far along the road.
import { SimScene } from 'simulations/base/kit/SimScene.js';
import { tapLight, tapLightControl } from 'simulations/base/kit/TapLight.js';
import { drawCivic } from '../shared/CivicArt.js';
import { day, tile, folk, tag, pop, wrap, mix, mountain, tones, wheelchair } from './BoothWorld.js';

const S_JOBS = 0, S_REACH = 1;
const MAP = [S_JOBS, S_REACH].map((idx) => [{ idx, dwellMs: null }]);
const JOBS = [
  { id: 'roll', label: 'Roll', t: 'Creates the roll', a: 'bookOpen', eg: 'Enumerators go to every household.' },
  { id: 'date', label: 'Dates', t: 'Decides the dates', a: 'school', eg: 'It plans around weather, farming, exams and festivals.' },
  { id: 'party', label: 'Parties', t: 'Registers parties', a: 'office', eg: 'It allots symbols to national and state parties.' },
  { id: 'fair', label: 'Fairness', t: 'Keeps it free and fair', a: 'ballotBox', eg: 'It uses the Model Code of Conduct, EVMs and VVPAT.' },
];
const CHIPS = JOBS.map((j) => ({ id: j.id, label: j.label, targets: [j.id] }));

export class EciJobsScene extends SimScene {
  static BEAT_STEP_MAP = MAP;
  static HEIGHT = 456;
  static CONTROLS_IN_SIGHT = true;
  static ARIA_LABEL = 'Four tiles for the four jobs of the Election Commission of India. Tapping a tile shows one example. Then an elderly voter on a hill and a voter in a wheelchair, far along a road from the polling booth.';
  static CONTROLS = [{ ...tapLightControl({ id: 'lit', label: 'Job', chips: CHIPS }), options: CHIPS.map((x) => ({ value: x.id, label: x.label })) }];

  tl = tapLight({ chips: CHIPS, onChange: () => this.requestUiUpdate?.() });
  enter() { this.tl.reset(); }
  busy() { return this.age < 1.2; }
  isControlHidden(id) { return id === 'lit' && this.stage !== S_JOBS; }
  getControlValue(id) { return id === 'lit' ? this.tl.controlValue() : undefined; }
  onControlChange(id, v) { if (id === 'lit' && this._guard(id)) this.tl.fromControl(v); }

  draw(ctx, c) {
    const a = this.age;
    if (this.stage === S_JOBS) {
      day(ctx, c, 680, 456, { ground: 400, hills: false, sun: false });
      const lit = this.tl.chip()?.id, on = JOBS.find((j) => j.id === lit);
      JOBS.forEach((j, i) => {
        const x = 10 + (i % 2) * 335, y = 8 + (i >> 1) * 170, k = pop(a, 0.05 + i * 0.12);
        ctx.save(); ctx.globalAlpha *= Math.min(1, k);
        tile(ctx, c, x, y, 325, 158, { fill: c.bgSurface, lit: j.id === lit, dim: !!on && j.id !== lit });
        drawCivic(ctx, c, j.a, x + 66, y + 134, j.a === 'school' ? { w: 118 } : { h: j.a === 'bookOpen' ? 74 : 108 });
        wrap(ctx, c, j.t, x + 224, y + 78, 190, { size: 29, display: true });
        ctx.restore();
      });
      tile(ctx, c, 10, 350, 660, 96, { fill: on ? mix(c.gold, c.bgSurface, 0.78) : c.bgSurface });
      wrap(ctx, c, on ? on.eg : 'Tap a job to see an example', 340, 397, 620, { size: 28 });
    } else {
      const t = tones(c);
      day(ctx, c, 680, 456, { ground: 300, hills: false });
      mountain(ctx, c, 0, 300, 420, 230);
      ctx.fillStyle = t.road; ctx.beginPath(); ctx.moveTo(0, 456); ctx.lineTo(0, 396); ctx.bezierCurveTo(240, 340, 380, 420, 680, 340); ctx.lineTo(680, 456); ctx.fill();
      drawCivic(ctx, c, 'booth', 590, 348, { h: 136 });
      const seat = wheelchair(ctx, c, 106, 444, 1.15);
      folk(ctx, this, { role: 'adult', x: seat.x, y: 444, height: 150, pose: 'sit', seat, facing: 1, i: 7 });
      folk(ctx, this, { role: 'elder', x: 214, y: 438, height: 186, facing: 1, i: 1, mood: 'think' });
      tag(ctx, c, 'How does the vote reach them?', 400, 36, { size: 30, bg: c.bgSurface, scale: pop(a, 0.3) });
    }
  }

  destroy() { this.tl.destroy(); super.destroy(); }
}
