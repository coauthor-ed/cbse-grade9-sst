// GramSabhaScene - blk-l06-s07. Beat 0: a Gram Sabha under a tree with its record book. Beat 1: the
// quorum, performed by the learner: 20 members, an example quorum of 10; each press brings one
// person. Below 10 the meeting cannot decide; at 10 it can. Beat 2: who took part, and what followed.
import { SimScene } from 'simulations/base/kit/SimScene.js';
import { drawCivic } from '../shared/CivicArt.js';
import { day, tile, say, folk, tag, pop, ellipse, mix, rr } from './CivicWorld.js';

const S_MEET = 0, S_QUORUM = 1, S_WHO = 2;
const MAP = [S_MEET, S_QUORUM, S_WHO].map((idx) => [{ idx, dwellMs: null }]);
const ALL = 20, NEED = 10;
const ROLE = ['elder', 'adult', 'farmer', 'worker', 'adult', 'shopkeeper', 'adult', 'elder', 'farmer', 'adult'];

export class GramSabhaScene extends SimScene {
  static BEAT_STEP_MAP = MAP;
  static HEIGHT = 456;   // shorter than the 520 default: on a phone the host caps height, so this keeps labels at 14 px
  static CONTROLS_IN_SIGHT = true;
  static ARIA_LABEL = 'A Gram Sabha under a tree with a record book. Then twenty places for members and a quorum of ten, as an example: press to bring people, and at ten the meeting can decide. Then the groups that took part and the work that followed.';
  static CONTROLS = [{ type: 'button', id: 'come', label: 'Bring one villager' }, { type: 'button', id: 'again', label: 'Start again' }];

  constructor(container, config) { super(container, config); this._n = 0; this._found = false; this._t = -9; }
  enter(stage) { this._n = stage === S_QUORUM ? 3 : ALL; this._found = false; this._t = -9; }
  isControlHidden(id) {
    if (this.stage !== S_QUORUM) return true;
    return id === 'come' ? this._n >= ALL : this._n < ALL;
  }
  onControlChange(id) {
    if (!this._guard(id)) return;
    if (id === 'again') { this._n = 3; this._found = false; } else {
      this._n = Math.min(ALL, this._n + 1); this._t = this.clock;
      if (this._n >= NEED && !this._found) { this._found = true; this.celebrate(340, 60, 14); }
    }
    this.requestUiUpdate?.();
  }
  busy() { return this.age < 1 || this.clock - this._t < 0.7; }

  _people(ctx, n) {
    for (let i = 0; i < ALL; i++) {
      const col = i % 10, row = i < 10 ? 1 : 0, x = (row ? 44 : 66) + col * 62, y = row ? 448 : 296;
      const c = this.colors;
      ctx.fillStyle = mix(c.gold, c.bgSurface, 0.5); ellipse(ctx, x, y, 28, 8); ctx.fill();
      if (i < n) { const k = i === n - 1 ? pop(this.clock, this._t, 0.3) : 1; ctx.save(); ctx.globalAlpha *= Math.min(1, Math.max(0.01, k)); folk(ctx, this, { role: ROLE[i % 10], x, y, height: 130, facing: 0, i: i + 1 }); ctx.restore(); }
    }
  }

  draw(ctx, c) {
    const a = this.age;
    if (this.stage === S_MEET) {
      day(ctx, c, 680, 520, { ground: 260 });
      drawCivic(ctx, c, 'tree', 250, 300, { h: 276 });
      drawCivic(ctx, c, 'bookOpen', 510, 376, { w: 220 });
      tag(ctx, c, 'Proper records', 510, 216, { scale: pop(a, 0.2) });
      tag(ctx, c, 'Special Gram Sabhas', 480, 34, { bg: c.accent, scale: pop(a, 0.4) });
      ['elder', 'adult', 'farmer', 'adult'].forEach((role, i) => folk(ctx, this, { role, x: 70 + i * 92, y: 448, height: 156, facing: 0, i: i + 1 }));
    } else if (this.stage === S_QUORUM) {
      day(ctx, c, 680, 520, { ground: 170, sun: false });
      drawCivic(ctx, c, 'tree', 340, 262, { h: 104 });
      const ok = this._n >= NEED;
      tile(ctx, c, 16, 8, 648, 106, { fill: c.bgSurface, lit: ok, litCol: c.good });
      say(ctx, c, this._n + ' of ' + ALL + ' present', 340, 44, { size: 40 });
      say(ctx, c, ok ? 'Quorum reached: the meeting can decide' : 'Quorum ' + NEED + ': the meeting cannot decide yet', 340, 88, { size: 28, display: false });
      for (let i = 0; i < ALL; i++) {                 // the meter: 20 cells, the quorum after the tenth
        ctx.fillStyle = i < this._n ? (ok ? c.good : c.accent) : mix(c.waste, c.bgSurface, 0.5);
        rr(ctx, 40 + i * 30, 128, 24, 22, 5); ctx.fill();
      }
      ctx.fillStyle = c.label; rr(ctx, 40 + 10 * 30 - 6, 122, 5, 34, 2); ctx.fill();
      this._people(ctx, this._n);
    } else {
      day(ctx, c, 680, 520, { ground: 220 });
      ['Scheduled Castes', 'Scheduled Tribes', 'Women'].forEach((text, i) => tag(ctx, c, text, [120, 372, 592][i], 30, { scale: pop(a, 0.05 + i * 0.12) }));
      tag(ctx, c, 'Mahila Sabha', 340, 74, { bg: c.accent, scale: pop(a, 0.42) });
      [0, 1, 2, 3, 4].forEach((i) => folk(ctx, this, { role: i === 2 ? 'elder' : 'adult', x: 150 + i * 96, y: 286, height: 172, facing: 0, i: [1, 9, 3, 13, 5][i], look: { outfit: 'kurti', hairStyle: 'braid', dupatta: true, moustache: false, bottom: 'cream' } }));
      ['Education', 'Sanitation', 'Welfare of women and children'].forEach((text, i) => {
        const y = 296 + i * 50, k = pop(a, 0.6 + i * 0.14);
        ctx.save(); ctx.globalAlpha *= Math.min(1, k);
        tile(ctx, c, 40, y, 600, 44, { fill: c.bgSurface, r: 12 });
        say(ctx, c, text, 340, y + 23, { size: 28 });
        ctx.restore();
      });
    }
  }
}
