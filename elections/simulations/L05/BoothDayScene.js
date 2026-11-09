// BoothDayScene - blk-l05-s05. Ishani's case in the book's order, six stops on one path.
// b0 the market, the day before. b1 the guarded polling station. b2 wheelchair, volunteers, three people
// inside. b3 forgotten cards, another document. b4 the VVPAT slip behind glass, then into the sealed box.
// b5 how the police vote, and her grandmother at home. No party names, no real symbols.
import { SimScene } from 'simulations/base/kit/SimScene.js';
import { drawCivic } from '../shared/CivicArt.js';
import { day, tones, tile, say, folk, tag, pop, tick, mark, wrap, mix, rr, darken, clamp01, wheelchair } from '../L04/BoothWorld.js';

const STOPS = [0, 1, 2, 3, 4, 5];
const MAP = STOPS.map((idx) => [{ idx, dwellMs: null }]);
// The book's people, drawn on purpose: Ishani 18 and her mother with long hair, kurti, drape; her elder brother; her grandmother.
const ISHANI = { role: 'student', i: 12, look: { outfit: 'kurti', hairStyle: 'long', bottom: 'cream', bottomStyle: 'trousers', dupatta: true, shoeStyle: 'sandal', pattern: 'none', moustache: false, glasses: false } };
const MOTHER = { role: 'adult', i: 13, look: { outfit: 'drape', hairStyle: 'bun', shoeStyle: 'sandal', moustache: false } };
const BROTHER = { outfit: 'shirt', hairStyle: 'short', bottom: 'denim', shoeStyle: 'shoe', pattern: 'none', moustache: false, dupatta: false };
const GRANDMOTHER = { outfit: 'drape', hairStyle: 'bun', shoeStyle: 'sandal', moustache: false };
const SHOW_S = 2.2, DROP_S = 0.7;

export class BoothDayScene extends SimScene {
  static BEAT_STEP_MAP = MAP;
  static HEIGHT = 456;
  static CONTROLS_IN_SIGHT = true;
  static ARIA_LABEL = 'Ishani in a market the day before polling, at a guarded polling station, with a wheelchair for her brother and three officers inside, with another document in place of her forgotten cards, watching a VVPAT slip behind glass drop into a sealed box, and telling her grandmother at home.';
  // One tall chip and not a host button: only segmented controls can be 44 px tall in the host bar.
  static CONTROLS = [{ type: 'segmented', tall: true, id: 'again', label: 'Slip', value: '', options: [{ value: 'go', label: 'Show the slip again' }] }];

  constructor(container, config) { super(container, config); this._replay = 0; }
  enter() { this._replay = 0; }
  busy() { return this.age < 1 || (this.stage === 4 && this.age - this._replay < SHOW_S + DROP_S + 0.3); }
  isControlHidden(id) { return id === 'again' && this.stage !== 4; }
  getControlValue(id) { return id === 'again' ? '' : undefined; }
  onControlChange(id) { if (id === 'again' && this._guard(id)) { this._replay = this.age; this.animateFor?.((SHOW_S + DROP_S + 0.5) * 1000); } }

  // The path along the top: six stops, this one lit.
  _path(ctx, c) {
    const s = this.stage, x0 = 60, dx = 112, y = 28;
    ctx.fillStyle = c.bgSurface; rr(ctx, 12, 6, 656, 44, 22); ctx.fill();
    ctx.fillStyle = c.stroke; ctx.fillRect(x0, y - 2, dx * 5, 5);
    ctx.fillStyle = c.accent; ctx.fillRect(x0, y - 2, dx * s, 5);
    STOPS.forEach((i) => {
      ctx.fillStyle = i <= s ? c.accent : c.bgSurface; ctx.beginPath(); ctx.arc(x0 + i * dx, y, i === s ? 16 : 11, 0, Math.PI * 2); ctx.fill();
      ctx.lineWidth = 3; ctx.strokeStyle = i <= s ? c.accent : c.stroke; ctx.stroke();
    });
    say(ctx, c, String(s + 1), x0 + s * dx, y + 1, { size: 25, col: c.bgSurface });
  }

  _market(ctx, c, a) {
    const t = tones(c);
    day(ctx, c, 680, 456, { ground: 320, hills: false, sun: false });
    ctx.fillStyle = t.plaster; ctx.fillRect(0, 70, 680, 250); ctx.fillStyle = darken(t.plaster, 0.1); ctx.fillRect(0, 312, 680, 8);
    [[30, 100], [170, 84], [470, 96], [590, 84]].forEach(([x, y], i) => {
      tile(ctx, c, x, y, 92, 116, { fill: c.bgSurface, r: 4 });
      mark(ctx, c, ['circle', 'triangle', 'square', 'circle'][i], x + 46, y + 48, 22);
      ctx.fillStyle = mix(c.waste, c.bgSurface, 0.5); rr(ctx, x + 14, y + 88, 64, 10, 4); ctx.fill();
    });
    ctx.fillStyle = mix(c.s7, c.bgSurface, 0.4); rr(ctx, 276, 196, 170, 30, 5); ctx.fill();
    folk(ctx, this, { ...ISHANI, x: 112, y: 434, height: 250, facing: 1, mood: 'think' });
    folk(ctx, this, { ...MOTHER, x: 200, y: 438, height: 272, facing: 1 });
    folk(ctx, this, { role: 'adult', x: 468, y: 436, height: 276, facing: -1, pose: 'stand', i: 3, hands: [{ x: 396, y: 320 }, null] });
    folk(ctx, this, { role: 'shopkeeper', x: 580, y: 430, height: 262, facing: -1, pose: 'wave', i: 8 });
    tile(ctx, c, 352, 286, 52, 66, { fill: c.bgSurface, r: 4 });
    tag(ctx, c, 'Posters, pamphlets, slogans', 330, 424, { size: 25, scale: pop(a, 0.4) });
    tag(ctx, c, 'The day before polling', 340, 78, { size: 26, bg: c.gold, scale: pop(a, 0.15) });
  }

  _station(ctx, c, a) {
    day(ctx, c, 680, 456, { ground: 310, sun: false });
    drawCivic(ctx, c, 'school', 440, 320, { w: 340 });
    [240, 646].forEach((x, i) => folk(ctx, this, { role: 'police', x, y: 432, height: 262, facing: i ? -1 : 1, i: 5 + i }));
    folk(ctx, this, { ...ISHANI, x: 60, y: 436, height: 242, facing: 1, mood: 'happy' });
    folk(ctx, this, { ...MOTHER, x: 140, y: 440, height: 262, facing: 1 });
    tag(ctx, c, 'Registered online', 120, 88, { size: 26, scale: pop(a, 0.2) });
    tag(ctx, c, 'Police on guard', 440, 88, { size: 26, scale: pop(a, 0.4) });
  }

  _help(ctx, c, a) {
    day(ctx, c, 680, 456, { ground: 340, hills: false, sun: false });
    const seat = wheelchair(ctx, c, 150, 438, 1.3);
    folk(ctx, this, { role: 'adult', x: seat.x, y: 438, height: 198, pose: 'sit', seat, facing: 1, i: 9, mood: 'smile', look: BROTHER });
    folk(ctx, this, { role: 'teacher', x: 52, y: 442, height: 266, facing: 1, i: 2, pose: 'stand', hands: [{ x: 108, y: 306 }, null], mood: 'smile' });
    tag(ctx, c, 'Wheelchair, volunteers', 160, 96, { size: 25, scale: pop(a, 0.2) });
    tile(ctx, c, 326, 70, 346, 374, { fill: mix(c.gold, c.bgSurface, 0.8) });
    say(ctx, c, 'Inside the booth', 499, 106, { size: 30 });
    [396, 498, 600].forEach((x, i) => folk(ctx, this, { role: ['adult', 'teacher', 'shopkeeper'][i], x, y: 396, height: 232, facing: 0, i: 15 + i }));
    tag(ctx, c, '3 people, all duties', 499, 416, { size: 26, bg: c.gold, scale: pop(a, 0.5) });
  }

  _card(ctx, c, x, y, text, ok, a) {
    ctx.save(); ctx.globalAlpha *= Math.min(1, pop(a, 0.1 + (ok ? 0.5 : x / 2000)));
    if (!ok) { ctx.save(); ctx.strokeStyle = c.bad; ctx.lineWidth = 4; ctx.setLineDash([10, 8]); rr(ctx, x, y, 188, 110, 10); ctx.stroke(); ctx.restore(); } else tile(ctx, c, x, y, 188, 110, { fill: mix(c.good, c.bgSurface, 0.75) });
    wrap(ctx, c, text, x + 94, y + 44, 170, { size: 26, display: true, lh: 30 });
    tick(ctx, c, x + 164, y + 90, 16, ok);
    ctx.restore();
  }

  _check(ctx, c, a) {
    day(ctx, c, 680, 456, { ground: 330, hills: false, sun: false });
    folk(ctx, this, { ...ISHANI, x: 84, y: 436, height: 260, facing: 1, mood: 'think' });
    this._card(ctx, c, 214, 66, 'Voter ID card', false, a);
    this._card(ctx, c, 432, 66, 'Aadhaar card', false, a);
    this._card(ctx, c, 330, 190, 'Another document', true, a);
    const t = tones(c);
    ctx.fillStyle = t.wood; rr(ctx, 200, 366, 470, 18, 4); ctx.fill(); ctx.fillRect(226, 384, 12, 72); ctx.fillRect(632, 384, 12, 72);
    drawCivic(ctx, c, 'bookOpen', 330, 368, { w: 150 });
    tag(ctx, c, 'Identity verified', 520, 342, { size: 25, bg: c.good, scale: pop(a, 0.8) });
  }

  // The VVPAT, the hero: a box with a glass window, a sealed drop box under it.
  _vvpat(ctx, c) {
    const t = tones(c), e = this.age - this._replay, x = 200, y = 66, w = 280;
    const f = clamp01((e - SHOW_S) / DROP_S), drop = f * f;
    day(ctx, c, 680, 456, { ground: 410, hills: false, sun: false });
    ctx.fillStyle = darken(t.grey, 0.28); rr(ctx, x - 3, y + 5, w + 6, 372, 18); ctx.fill();
    ctx.fillStyle = t.grey; rr(ctx, x, y, w, 368, 16); ctx.fill();
    ctx.fillStyle = mix(c.water, c.bgSurface, 0.62); rr(ctx, x + 34, y + 22, w - 68, 180, 10); ctx.fill();
    ctx.save(); rr(ctx, x + 34, y + 22, w - 68, 340, 10); ctx.clip();
    if (f < 1) {
      const sy = y + 40 + drop * 180;
      ctx.fillStyle = c.bgSurface; rr(ctx, x + 64, sy, w - 128, 140, 4); ctx.fill(); ctx.lineWidth = 2.5; ctx.strokeStyle = c.stroke; ctx.stroke();
      mark(ctx, c, 'triangle', x + w / 2, sy + 50, 26);
      say(ctx, c, 'Candidate 2', x + w / 2, sy + 106, { size: 24, display: false });
    }
    ctx.restore();
    ctx.fillStyle = mix(t.grey, c.bgSurface, 0.45); rr(ctx, x + 22, y + 214, w - 44, 142, 10); ctx.fill();
    ctx.fillStyle = c.bgSurface; rr(ctx, x + 26, y + 196, w - 52, 10, 4); ctx.fill();
    say(ctx, c, 'Sealed box', x + w / 2, y + 284, { size: 30 });
    folk(ctx, this, { ...ISHANI, x: 92, y: 442, height: 302, facing: 1, mood: 'happy', pose: 'point' });
    tag(ctx, c, f < 1 ? 'Behind glass' : 'In the box', 578, 130, { size: 25, bg: f < 1 ? c.bgSurface : c.gold });
    if (f < 1) tag(ctx, c, 'A few seconds', 578, 180, { size: 25 });
  }

  _home(ctx, c) {
    day(ctx, c, 680, 456, { ground: 400, hills: false, sun: false });
    tile(ctx, c, 10, 66, 324, 378, { fill: c.bgSurface });
    folk(ctx, this, { role: 'police', x: 110, y: 374, height: 268, facing: 1, i: 5 });
    drawCivic(ctx, c, 'ballotBox', 240, 374, { h: 92 });
    wrap(ctx, c, 'Police: postal ballot', 172, 408, 300, { size: 27, display: true });
    tile(ctx, c, 346, 66, 324, 378, { fill: mix(c.gold, c.bgSurface, 0.82) });
    folk(ctx, this, { role: 'elder', x: 448, y: 374, height: 244, facing: 1, i: 1, mood: 'happy', look: GRANDMOTHER });
    folk(ctx, this, { ...ISHANI, x: 578, y: 374, height: 228, facing: -1, pose: 'wave', mood: 'happy' });
    wrap(ctx, c, 'Grandmother, 89: from home', 508, 408, 306, { size: 26, display: true });
  }

  draw(ctx, c) {
    const s = this.stage, a = this.age;
    [this._market, this._station, this._help, this._check, this._vvpat, this._home][s].call(this, ctx, c, a);
    this._path(ctx, c);
  }
}
