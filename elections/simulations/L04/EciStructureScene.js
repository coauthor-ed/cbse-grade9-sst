// EciStructureScene - blk-l04-s04. b0 the ECI, an office and three plain words. b1 six elections, six
// tiles. b2 the chain arrives post by post, down to a polling station with a queue. b3 the learner
// rebuilds it from mixed cards. b4 work with other countries, the book's numbers.
import { SimScene } from 'simulations/base/kit/SimScene.js';
import { drawCivic } from '../shared/CivicArt.js';
import { day, tones, tile, say, folk, tag, pop, wrap, rr, clamp01 } from './BoothWorld.js';

const S_BODY = 0, S_SIX = 1, S_CHAIN = 2, S_ORDER = 3, S_ABROAD = 4;
const MAP = [S_BODY, S_SIX, S_CHAIN, S_ORDER, S_ABROAD].map((idx) => [{ idx, dwellMs: null }]);
const WORDS = [{ t: 'Autonomous', s: 'manages its work' }, { t: 'Permanent', s: 'stays between elections' }, { t: 'Constitutional', s: 'Articles 324 to 329' }];
const SIX = [{ t: 'Lok Sabha', a: 'parliament' }, { t: 'Rajya Sabha', a: 'parliament' }, { t: 'Vidhan Sabha', a: 'office' }, { t: 'Vidhan Parishad', a: 'office' }, { t: 'President', a: 'book' }, { t: 'Vice President', a: 'book' }];
const CHAIN = [{ id: 'eci', t: 'Election Commission of India', s: 'the whole country', a: 'office' }, { id: 'ceo', t: 'Chief Electoral Officer', s: 'one State' }, { id: 'off', t: 'Officers on election duty', s: 'District Election Officers and others' }, { id: 'ps', t: 'Polling station', s: 'where you vote' }];
const NAMES = { eci: 'Election Commission', ceo: 'Chief Electoral Officer', off: 'Officers on duty', ps: 'Polling station' };
const MIXED = ['ceo', 'ps', 'eci', 'off']; // this order wraps to two rows beside the text
const ROW = 110, Y0 = 8;

export class EciStructureScene extends SimScene {
  static BEAT_STEP_MAP = MAP;
  static HEIGHT = 456;
  static CONTROLS_IN_SIGHT = true;
  static ARIA_LABEL = 'The Election Commission of India as an office with three plain words, then six elections on six tiles, then a chain from the Commission to a Chief Electoral Officer, to officers on election duty, to a polling station, which the learner puts in order, then its work with election bodies abroad.';
  static CONTROLS = [{ type: 'segmented', tall: true, id: 'next', label: 'Which comes next?', value: '', options: MIXED.map((id) => ({ value: id, label: NAMES[id] })) }];

  constructor(container, config) { super(container, config); this._done = 0; this._miss = ''; this._found = false; }
  enter() { this._done = 0; this._miss = ''; this._found = false; }
  busy() { return this.age < 1.6; }
  isControlHidden(id) { return id === 'next' && this.stage !== S_ORDER; }
  isControlDisabled(id) { return id === 'next' && this._done >= 4; }
  getControlValue() { return ''; }
  onControlChange(id, v) {
    if (id !== 'next' || !this._guard(id) || this._done >= 4) return;
    const want = CHAIN[this._done];
    if (v === want.id) {
      this._done += 1; this._miss = '';
      if (this._done === 4 && !this._found) { this._found = true; this.celebrate(340, 230, 14); }
    } else if (CHAIN.slice(0, this._done).some((d) => d.id === v)) this._miss = NAMES[v] + ' is already in place';
    else { this._miss = 'Not yet: ' + NAMES[v] + ' comes lower'; this.oops(340, 40 + this._done * ROW); }
    this.requestUiUpdate?.();
  }

  // One post of the chain. k: arrival 0 to 1.
  _post(ctx, c, i, k) {
    const d = CHAIN[i], y = Y0 + i * ROW, t = tones(c), X = 196;
    ctx.save(); ctx.globalAlpha *= Math.min(1, k);
    if (i < 3) { ctx.fillStyle = t.wood; rr(ctx, X + 8, y + 92, 12, 26, 4); ctx.fill(); }
    tile(ctx, c, X, y, 470, 96, { fill: c.bgSurface });
    wrap(ctx, c, d.t, X + 18, y + 33, 440, { size: i === 0 ? 29 : 31, align: 'left', display: true });
    say(ctx, c, d.s, X + 18, y + 70, { size: 26, display: false, align: 'left', col: c.labelMuted });
    if (i === 0) drawCivic(ctx, c, 'office', 98, y + 100, { w: 136 });
    if (i === 1) folk(ctx, this, { role: 'adult', x: 98, y: y + 100, height: 104, facing: 1, i: 3 });
    if (i === 2) { folk(ctx, this, { role: 'teacher', x: 62, y: y + 100, height: 100, facing: 1, i: 2 }); folk(ctx, this, { role: 'adult', x: 134, y: y + 100, height: 104, facing: 1, i: 6 }); }
    if (i === 3) drawCivic(ctx, c, 'booth', 98, y + 104, { h: 102 });
    ctx.restore();
  }

  draw(ctx, c) {
    const s = this.stage, a = this.age;
    if (s === S_BODY) {
      day(ctx, c, 680, 456, { ground: 300 });
      drawCivic(ctx, c, 'office', 340, 316, { w: 262 });
      tag(ctx, c, 'Election Commission of India', 340, 30, { size: 30, bg: c.bgSurface });
      tag(ctx, c, 'Set up on 25 January 1950', 340, 74, { size: 26, bg: c.gold });
      WORDS.forEach((w, i) => {
        const k = pop(a, 0.2 + i * 0.2), x = 12 + i * 222;
        ctx.save(); ctx.globalAlpha *= Math.min(1, k);
        tile(ctx, c, x, 330, 212, 108, { fill: c.bgSurface });
        say(ctx, c, w.t, x + 106, 362, { size: 25 });
        wrap(ctx, c, w.s, x + 106, 406, 200, { size: 25, display: false, lh: 27, col: c.labelMuted });
        ctx.restore();
      });
    } else if (s === S_SIX) {
      day(ctx, c, 680, 456, { ground: 360, hills: false, sun: false });
      SIX.forEach((d, i) => {
        const x = 12 + (i % 3) * 222, y = 8 + Math.floor(i / 3) * 186, k = pop(a, 0.05 + i * 0.1);
        ctx.save(); ctx.globalAlpha *= Math.min(1, k);
        tile(ctx, c, x, y, 212, 176, { fill: c.bgSurface });
        if (d.a === 'book') folk(ctx, this, { role: 'adult', x: x + 106, y: y + 118, height: 104, facing: 0, i: i });
        else drawCivic(ctx, c, d.a, x + 106, y + 118, { h: 100 });
        say(ctx, c, d.t, x + 106, y + 146, { size: d.t.length > 13 ? 24 : 26 });
        ctx.restore();
      });
      tag(ctx, c, 'Panchayats: State Election Commissions', 340, 420, { size: 26, bg: c.gold });
    } else if (s === S_CHAIN) {
      day(ctx, c, 680, 456, { ground: 456, hills: false, sun: false });
      CHAIN.forEach((d, i) => this._post(ctx, c, i, pop(a, 0.1 + i * 0.32)));
    } else if (s === S_ORDER) {
      day(ctx, c, 680, 456, { ground: 456, hills: false, sun: false });
      CHAIN.forEach((d, i) => {
        if (i < this._done) { this._post(ctx, c, i, 1); return; }
        const y = Y0 + i * ROW;
        ctx.save(); ctx.strokeStyle = c.stroke; ctx.lineWidth = 3; ctx.setLineDash([12, 10]); rr(ctx, 196, y, 470, 96, 14); ctx.stroke(); ctx.restore();
        say(ctx, c, String(i + 1), 98, y + 50, { size: 54, col: c.labelMuted });
      });
      if (this._miss) tag(ctx, c, this._miss, 340, 228, { size: 26, bg: c.bad });
    } else {
      day(ctx, c, 680, 456, { ground: 330, hills: false });
      drawCivic(ctx, c, 'office', 340, 300, { w: 230 });
      tag(ctx, c, 'ECI', 340, 40, { size: 32, bg: c.bgSurface });
      const big = [{ n: '28', s: 'Election Management Bodies' }, { n: '3', s: 'international organisations' }];
      big.forEach((b, i) => {
        const x = i ? 348 : 12, k = pop(a, 0.2 + i * 0.25);
        ctx.save(); ctx.globalAlpha *= Math.min(1, k);
        tile(ctx, c, x, 312, 320, 128, { fill: c.bgSurface });
        say(ctx, c, b.n, x + 60, 376, { size: 62 });
        wrap(ctx, c, b.s, x + 196, 376, 196, { size: 25, display: false, lh: 30 });
        ctx.restore();
      });
      ['IFES', 'International IDEA', 'United Nations'].forEach((t, i) => tag(ctx, c, t, [120, 150, 556][i], [130, 200, 130][i], { size: 25, scale: clamp01(pop(a, 0.6 + i * 0.15)) }));
    }
  }
}
