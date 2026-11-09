// SymbolBallotScene - blk-l06-s03. Beat 0: a voter who cannot read wants the triangle. The learner
// presses the button beside it on a drawn voting machine: names are unreadable bars, and the marks
// are three plain shapes made up for this example, because everyday pictures can be real party
// symbols. A wrong press lights that row and says which shape it was. Beat 1: four places with a
// booth, one of them for a single voter.
import { SimScene } from 'simulations/base/kit/SimScene.js';
import { drawCivic } from '../shared/CivicArt.js';
import { tones, day, tile, folk, tag, pop, rr, ellipse, mountain, pine, dunes, sea, mix, darken } from './CivicWorld.js';

const MARKS = [{ id: 'circle', label: 'Circle' }, { id: 'triangle', label: 'Triangle' }, { id: 'square', label: 'Square' }];
const WANT = 'triangle';
const S_VOTE = 0, S_REACH = 1;
const MAP = [S_VOTE, S_REACH].map((idx) => [{ idx, dwellMs: null }]);
const P = { x: 240, y: 8, w: 428, row: 118 };
const HOME = { x: 112, y: 448 };

function mark(ctx, c, id, x, y, s = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.fillStyle = c.label;
  ctx.beginPath();
  if (id === 'circle') ctx.arc(0, 0, 34, 0, Math.PI * 2);
  else if (id === 'triangle') { ctx.moveTo(0, -36); ctx.lineTo(38, 30); ctx.lineTo(-38, 30); ctx.closePath(); }
  else rr(ctx, -31, -31, 62, 62, 4);
  ctx.fill();
  ctx.restore();
}

export class SymbolBallotScene extends SimScene {
  static BEAT_STEP_MAP = MAP;
  static HEIGHT = 456;   // shorter than the 520 default: on a phone the host caps height, so this keeps labels at 14 px
  static CONTROLS_IN_SIGHT = true;
  static ARIA_LABEL = 'A voter thinks of a triangle and stands by a voting machine. Each of three rows has a name she cannot read, a plain shape and a blue button. Pressing the button beside the triangle casts her vote. Then four places with a polling booth: mountain, forest, desert and island.';
  static CONTROLS = [{ type: 'segmented', tall: true, id: 'press', label: 'Press the button beside', value: '', options: MARKS.map((m) => ({ value: m.id, label: m.label })) }];

  constructor(container, config) { super(container, config); this._pressed = null; this._done = false; this._t = -9; }
  enter(stage) { this._pressed = stage === S_REACH ? WANT : null; this._done = stage === S_REACH; this._t = -9; }
  isControlHidden(id) { return id === 'press' && this.stage !== S_VOTE; }
  getControlValue(id) { return id === 'press' ? (this._pressed ?? '') : undefined; }
  onControlChange(id, v) { if (id === 'press' && this._guard(id)) this._press(v); }
  pointerDown(p) {
    if (this.stage !== S_VOTE) return;
    if (p.x < P.x || p.x > P.x + P.w) return;
    const i = Math.floor((p.y - P.y) / P.row);
    if (MARKS[i]) this._press(MARKS[i].id);
  }
  _press(id) {
    if (this._done) return;
    this._pressed = id; this._t = this.clock;
    if (id === WANT) {
      this._done = true;
      const i = MARKS.findIndex((m) => m.id === id);
      this.celebrate(P.x + P.w - 60, P.y + P.row * (i + 0.5), 14);
    } else this.oops(P.x + P.w - 60, P.y + P.row * (MARKS.findIndex((m) => m.id === id) + 0.5));
    this.requestUiUpdate?.();
  }
  busy() { return this.age < 0.9 || this.clock - this._t < 0.8; }

  draw(ctx, c) {
    const t = tones(c);
    if (this.stage === S_VOTE) {
      day(ctx, c, 680, 520, { ground: 330, hills: false, sun: false });
      tile(ctx, c, P.x, P.y, P.w, P.row * 3 + 8, { fill: mix(c.bgSurface, c.waste, 0.14) });
      MARKS.forEach((m, i) => {
        const y = P.y + 4 + i * P.row, on = this._pressed === m.id, cy = y + P.row / 2;
        const lit = on && m.id === WANT;
        if (i) { ctx.fillStyle = c.stroke; ctx.fillRect(P.x + 6, y, P.w - 12, 2); }
        if (on) { ctx.fillStyle = mix(lit ? c.good : c.waste, c.bgSurface, 0.6); rr(ctx, P.x + 6, y + 4, P.w - 12, P.row - 8, 10); ctx.fill(); }
        ctx.fillStyle = mix(c.waste, c.bgSurface, 0.2);
        rr(ctx, P.x + 20, cy - 22, 118, 16, 8); ctx.fill(); rr(ctx, P.x + 20, cy + 8, 84, 16, 8); ctx.fill();
        mark(ctx, c, m.id, P.x + 214, cy, 1);
        ctx.fillStyle = darken(c.accent, 0.3); ellipse(ctx, P.x + P.w - 62, cy + 5, 38, 38); ctx.fill();
        ctx.fillStyle = lit ? c.good : c.accent; ellipse(ctx, P.x + P.w - 62, cy, 38, 38); ctx.fill();
      });
      folk(ctx, this, { role: 'elder', x: HOME.x, y: HOME.y, height: 276, pose: 'point', facing: 1, i: 1, mood: this._done ? 'happy' : 'think' });
      tile(ctx, c, 20, 12, 176, 118, { fill: c.bgSurface });
      mark(ctx, c, WANT, 108, 72, 1);
      if (this._done) tag(ctx, c, 'She has voted on her own', 446, 410, { bg: c.good, size: 30 });
      else if (this._pressed) tag(ctx, c, 'Not the ' + this._pressed + '. Find the triangle.', 446, 410, { bg: c.waste, size: 28 });
    } else {
      day(ctx, c, 680, 520, { ground: 440, hills: false, sun: false });
      const cell = (i, j, fn, label) => {
        const x = 16 + i * 330, y = 10 + j * 222, k = pop(this.age, 0.05 + (i + j * 2) * 0.12), w = 318, h = 212;
        ctx.save(); ctx.globalAlpha *= Math.min(1, k);
        tile(ctx, c, x, y, w, h, { fill: t.skyLow });
        ctx.save(); rr(ctx, x + 3, y + 3, w - 6, h - 6, 14); ctx.clip();
        ctx.fillStyle = t.ground; ctx.fillRect(x, y + 136, w, 90);
        fn(x, y + 150);
        ctx.restore();
        tag(ctx, c, label, x + w / 2, y + 186, { size: 28 });
        ctx.restore();
      };
      cell(0, 0, (x, g) => { mountain(ctx, c, x + 30, g, 250, 136); drawCivic(ctx, c, 'booth', x + 200, g, { h: 92 }); }, 'Mountains');
      cell(1, 0, (x, g) => { for (let i = 0; i < 4; i++) pine(ctx, c, x + 40 + i * 42, g - 10, 1.05); drawCivic(ctx, c, 'booth', x + 240, g, { h: 92 }); }, 'Gir forest: 1 voter');
      cell(0, 1, (x, g) => { dunes(ctx, c, x, g + 12, 318, 90); drawCivic(ctx, c, 'booth', x + 160, g, { h: 92 }); }, 'Deserts');
      cell(1, 1, (x, g) => { sea(ctx, c, x, g + 70, 318, 200); drawCivic(ctx, c, 'booth', x + 160, g - 20, { h: 92 }); }, 'Islands');
    }
  }
}
