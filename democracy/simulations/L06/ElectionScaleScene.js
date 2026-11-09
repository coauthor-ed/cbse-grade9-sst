// ElectionScaleScene - blk-l06-s01. Beat 0: one land from mountains to islands, a polling team on
// the road; tap a kind of place and the team goes there. Beat 1: the four numbers, big. Beat 2: a
// queue of very different people at one booth, with some of the languages named.
import { SimScene } from 'simulations/base/kit/SimScene.js';
import { tapLight, tapLightControl } from 'simulations/base/kit/TapLight.js';
import { drawCivic } from '../shared/CivicArt.js';
import { tones, day, tile, say, folk, tag, pop, mountain, pine, dunes, sea, clamp01 } from './CivicWorld.js';

const LAND = [
  { id: 'mountains', label: 'Mountains', x: 96 }, { id: 'forests', label: 'Forests', x: 268 },
  { id: 'deserts', label: 'Deserts', x: 432 }, { id: 'islands', label: 'Islands', x: 596 },
];
const CHIPS = LAND.map((l) => ({ id: l.id, label: l.label, targets: [l.id] }));
const S_REACH = 0, S_NUMBERS = 1, S_LIVING = 2;
const MAP = [S_REACH, S_NUMBERS, S_LIVING].map((idx) => [{ idx, dwellMs: null }]);
const G = 256, LANG = ['Hindi', 'Tamil', 'Bengali', 'Telugu', 'Marathi', 'Assamese', 'Punjabi', 'Kannada'];
const NUM = [
  { big: '96.8 crore', small: 'registered voters' }, { big: 'over 10 lakh', small: 'polling stations' },
  { big: 'over 2,800', small: 'registered parties' }, { big: '22', small: 'scheduled languages' },
];

export class ElectionScaleScene extends SimScene {
  static BEAT_STEP_MAP = MAP;
  static HEIGHT = 456;   // shorter than the 520 default: on a phone the host caps height, so this keeps labels at 14 px
  static CONTROLS_IN_SIGHT = true;
  static ARIA_LABEL = 'A land running from snowy mountains through forest and desert to islands, each with a small polling booth, and a polling team walking the road. Then four big numbers: 96.8 crore voters, over 10 lakh polling stations, over 2,800 parties, 22 scheduled languages. Then people of many kinds in one queue at a booth.';
  static CONTROLS = [{ ...tapLightControl({ id: 'lit', label: 'Place', chips: CHIPS }), options: CHIPS.map((x) => ({ value: x.id, label: x.label })) }];   // no None: one row keeps the figure wide

  tl = tapLight({ chips: CHIPS, onChange: () => this._go() });
  constructor(container, config) { super(container, config); this._x = 96; this._from = 96; this._to = 96; this._t0 = -9; }
  _go() { const id = this.tl.chip()?.id; const l = LAND.find((d) => d.id === id); if (!l) return; this._from = this._x; this._to = l.x; this._t0 = this.clock; this.animateFor?.(1300); }
  getControlValue(id) { return id === 'lit' ? this.tl.controlValue() : undefined; }
  onControlChange(id, v) { if (id === 'lit' && this._guard(id)) { this.tl.fromControl(v); this._go(); } }
  isControlHidden(id) { return id === 'lit' && this.stage !== S_REACH; }
  enter() { this.tl.reset(); this._x = 96; this._from = 96; this._to = 96; this._t0 = -9; }
  busy() { return this.age < 1 || this.clock - this._t0 < 1.1; }
  update() { const k = clamp01((this.clock - this._t0) / 1); this._x = this._from + (this._to - this._from) * k * k * (3 - 2 * k); }

  _land(ctx, c, on) {
    const t = tones(c);
    day(ctx, c, 680, 520, { ground: G, hills: false });
    const dim = (id) => on && on !== id;
    const part = (id, fn) => { ctx.save(); if (dim(id)) ctx.globalAlpha = 0.34; fn(); ctx.restore(); };
    part('mountains', () => { mountain(ctx, c, 0, G, 200, 186); drawCivic(ctx, c, 'booth', 96, G + 2, { h: 70 }); });
    part('forests', () => { for (let i = 0; i < 6; i++) pine(ctx, c, 200 + i * 28, G - (i % 2) * 8, 1 + (i % 3) * 0.2); drawCivic(ctx, c, 'booth', 268, G + 2, { h: 70 }); });
    part('deserts', () => { dunes(ctx, c, 356, G, 164, 90); drawCivic(ctx, c, 'booth', 432, G + 2, { h: 70 }); });
    part('islands', () => { sea(ctx, c, 520, G + 6, 160, 96); drawCivic(ctx, c, 'booth', 596, G - 30, { h: 70 }); });
    ctx.fillStyle = t.road; ctx.fillRect(0, G + 96, 680, 60); ctx.fillStyle = t.roadEdge; ctx.fillRect(0, G + 96, 680, 4); ctx.fillRect(0, G + 152, 680, 4);
  }

  draw(ctx, c) {
    const s = this.stage, a = this.age;
    if (s === S_REACH) {
      this._land(ctx, c, this.tl.chip()?.id);
      const place = LAND.find((l) => l.id === this.tl.chip()?.id);
      tag(ctx, c, place ? 'Polling team: ' + place.label.toLowerCase() : 'Several weeks, in phases', 400, 32);
      const x = Math.max(70, Math.min(590, this._x));
      const moving = this.clock - this._t0 < 1;
      const face = this._to >= this._from ? 1 : -1;
      [-46, 0, 46].forEach((dx, i) => folk(ctx, this, { role: ['teacher', 'adult', 'police'][i], x: x + dx, y: 432, height: 150, pose: moving ? 'walk' : 'stand', facing: face, i: i + 3 }));
      drawCivic(ctx, c, 'voteMachine', x + (face > 0 ? 88 : -88), 436, { h: 74 });
    } else if (s === S_NUMBERS) {
      day(ctx, c, 680, 520, { ground: 380, hills: false, sun: false });
      NUM.forEach((n, i) => {
        const x = 16 + (i % 2) * 330, y = 10 + (i >> 1) * 222, k = pop(a, 0.05 + i * 0.14);
        ctx.save(); ctx.globalAlpha *= Math.min(1, k);
        tile(ctx, c, x, y, 318, 212, { fill: c.bgSurface });
        say(ctx, c, n.big, x + 159, y + 72, { size: i === 3 ? 76 : 52 });
        say(ctx, c, n.small, x + 159, y + 150, { size: 29, display: false });
        ctx.restore();
      });
    } else {
      day(ctx, c, 680, 520, { ground: 310 });
      drawCivic(ctx, c, 'booth', 584, 340, { h: 190 });
      LANG.forEach((l, i) => tag(ctx, c, l, 76 + (i % 4) * 158, 36 + (i >> 2) * 50, { size: 28, scale: pop(a, 0.05 + i * 0.07) }));
      ['farmer', 'adult', 'elder', 'student', 'shopkeeper', 'worker'].forEach((role, i) => folk(ctx, this, { role, x: 50 + i * 84, y: 438 + (i % 2) * 8, height: 186 - (i % 3) * 8, facing: 1, i: i * 2 + 1 }));
    }
  }
}
