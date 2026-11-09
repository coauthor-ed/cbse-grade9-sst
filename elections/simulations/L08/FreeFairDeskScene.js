// FreeFairDeskScene - L08 s03. Beat 0 held on time, but is the process fair? Beat 1 the book's three
// situations, each drawn, by tap. Beat 2 what the ECI uses; the VVPAT slip shows behind glass, then
// drops into a sealed box. Beat 3 a voter reporting on cVIGIL.
import { SimScene } from 'simulations/base/kit/SimScene.js';
import { tapLight, tapLightControl } from 'simulations/base/kit/TapLight.js';
import { drawCivic } from '../shared/CivicArt.js';
import { tones, day, folk, pop, label, tile, say, lines, rr, mix, hi, tickOrCross, wheelchair } from '../L06/PartyWorld.js';

const CHIPS = [
  { id: 'favours', label: 'Favours', targets: ['favours'] },
  { id: 'count', label: 'Count', targets: ['count'] },
  { id: 'access', label: 'Access', targets: ['access'] },
];
const TOOLS = [['book', 'RPA 1950, 1951'], ['bookOpen', 'Model Code'], ['voteMachine', 'EVM'], [null, 'VVPAT'], ['mike', 'Awareness'], ['newspaper', 'Other measures']];
const S_HELD = 0, S_CASES = 1, S_TOOLS = 2, S_YOU = 3;
const MAP = [S_HELD, S_CASES, S_TOOLS, S_YOU].map((idx) => [{ idx, dwellMs: null }]);

export class FreeFairDeskScene extends SimScene {
  static BEAT_STEP_MAP = MAP;
  static HEIGHT = 456;
  static CONTROLS_IN_SIGHT = true;
  static ARIA_LABEL = 'A polling station with a tick for an election held, and three questions: impartial, trustworthy, inclusive. Then three drawn situations by tap. Then what the ECI uses, with a VVPAT slip that shows behind glass and drops into a sealed box. Then a voter reporting on the cVIGIL app.';
  static CONTROLS = [{ ...tapLightControl({ id: 'case', label: 'Situation', chips: CHIPS }), options: CHIPS.map((x) => ({ value: x.id, label: x.label })) }];

  tl = tapLight({ chips: CHIPS });
  getControlValue(id) { return id === 'case' ? this.tl.controlValue() : undefined; }
  onControlChange(id, v) { if (id === 'case' && this._guard(id)) this.tl.fromControl(v); }
  isControlHidden(id) { return id === 'case' && this.stage !== S_CASES; }
  enter() { this.tl.set({ lit: 'favours' }); }
  busy() { return this.age < (this.stage === S_TOOLS ? 3 : 1.2); }

  _case(ctx, c, id) {
    const t = tones(c);
    day(ctx, c, 680, 456, { ground: 300, sun: false });
    if (id === 'favours') {
      folk(ctx, this, { role: 'adult', x: 210, y: 410, height: 270, pose: 'stand', facing: 1, i: 5 });
      folk(ctx, this, { role: 'shopkeeper', x: 480, y: 410, height: 260, pose: 'point', facing: -1, i: 0 });
      ctx.fillStyle = t.plaster; rr(ctx, 318, 196, 78, 48, 6); ctx.fill(); ctx.strokeStyle = c.stroke; ctx.lineWidth = 3; ctx.stroke();
      label(ctx, c, 'Candidate', 210, 432, { size: 26 });
      label(ctx, c, 'Personal favours', 340, 40, { size: 30, bg: hi(c), ink: c.label });
    } else if (id === 'count') {
      tile(ctx, c, 150, 74, 380, 300, { fill: c.bgSurface });
      [['Candidate 1', '120'], ['Candidate 2', '95']].forEach(([n, v], i) => { say(ctx, c, n, 184, 130 + i * 62, { size: 30, align: 'left', display: false }); say(ctx, c, v, 496, 130 + i * 62, { size: 36, align: 'right' }); });
      ctx.fillStyle = c.label; ctx.fillRect(184, 222, 312, 4);
      say(ctx, c, 'Total', 184, 268, { size: 30, align: 'left', display: false }); say(ctx, c, '190', 496, 268, { size: 44, align: 'right' });
      tickOrCross(ctx, c, false, 340, 268, 18);
      say(ctx, c, 'Made-up figures', 340, 340, { size: 24, display: false });
      label(ctx, c, 'Not counted accurately', 340, 34, { size: 30, bg: hi(c), ink: c.label });
    } else {
      ctx.fillStyle = t.plaster; rr(ctx, 400, 92, 280, 210, 6); ctx.fill();
      ctx.fillStyle = t.greyDark; rr(ctx, 520, 170, 80, 132, 4); ctx.fill();
      [0, 1, 2, 3].forEach((i) => { ctx.fillStyle = t.grey; rr(ctx, 340 + i * 44, 372 - i * 24, 340 - i * 44, 24, 3); ctx.fill(); });
      folk(ctx, this, { role: 'adult', x: 150, y: 396, height: 210, pose: 'sit', facing: 1, i: 2, seat: { x: 150, y: 330 } });
      wheelchair(ctx, c, 152, 404, 1);
      label(ctx, c, 'Steps, and no ramp', 340, 40, { size: 30, bg: hi(c), ink: c.label });
    }
  }

  _tools(ctx, c) {
    const a = this.age, t = tones(c);
    ctx.fillStyle = t.plaster; ctx.fillRect(0, 0, 680, 456);
    TOOLS.forEach(([art, n], i) => {
      const x = 12 + (i % 3) * 222, y = 12 + (i >> 1 > 0 && i > 2 ? 1 : 0) * 220, k = pop(a, i * 0.07), w = 212, h = 210;
      ctx.save(); ctx.globalAlpha *= Math.min(1, k);
      tile(ctx, c, x, y, w, h, { fill: c.bgSurface, lit: i === 3 });
      if (art) drawCivic(ctx, c, art, x + w / 2, y + 154, { h: 132 });
      else {
        ctx.fillStyle = mix(t.grey, c.bgSurface, 0.3); rr(ctx, x + 36, y + 14, 140, 142, 10); ctx.fill(); ctx.strokeStyle = c.stroke; ctx.lineWidth = 3; ctx.stroke();
        ctx.fillStyle = mix(c.water, c.bgSurface, 0.7); rr(ctx, x + 56, y + 26, 100, 62, 6); ctx.fill(); ctx.stroke();
        ctx.fillStyle = t.greyDark; rr(ctx, x + 46, y + 116, 120, 32, 6); ctx.fill();
        const u = Math.min(1, Math.max(0, (a - 1.6) / 0.7)), sy = y + 34 + u * 84;
        ctx.save(); ctx.beginPath(); ctx.rect(x + 56, y + 26, 100, 122); ctx.clip();
        ctx.fillStyle = c.bgSurface; rr(ctx, x + 76, sy, 60, 48, 3); ctx.fill(); ctx.strokeStyle = c.stroke; ctx.lineWidth = 2; ctx.stroke();
        ctx.restore();
      }
      say(ctx, c, n, x + w / 2, y + 184, { size: 27 });
      ctx.restore();
    });
  }

  draw(ctx, c) {
    const s = this.stage, a = this.age;
    if (s === S_HELD) {
      day(ctx, c, 680, 456, { ground: 300 });
      drawCivic(ctx, c, 'booth', 150, 340, { h: 250 });
      tile(ctx, c, 16, 374, 268, 66, { fill: c.bgSurface }); tickOrCross(ctx, c, true, 52, 406); say(ctx, c, 'Election held', 170, 406, { size: 29 });
      tile(ctx, c, 304, 30, 360, 396, { fill: c.bgSurface });
      lines(ctx, c, ['Was the whole', 'process fair?'], 484, 92, { size: 33, lh: 42 });
      ['Impartial?', 'Trustworthy?', 'Inclusive?'].forEach((n, i) => label(ctx, c, n, 484, 196 + i * 72, { size: 30, bg: hi(c), ink: c.label, scale: pop(a, 0.3 + i * 0.14) }));
    } else if (s === S_CASES) this._case(ctx, c, this.tl.chip()?.id ?? 'favours');
    else if (s === S_TOOLS) this._tools(ctx, c);
    else {
      day(ctx, c, 680, 456, { ground: 300 });
      folk(ctx, this, { role: 'student', x: 170, y: 436, height: 330, pose: 'stand', facing: 1, i: 3 });
      drawCivic(ctx, c, 'phone', 350, 420, { h: 360 });
      lines(ctx, c, ['cVIGIL', 'report'], 350, 190, { size: 34, lh: 42 });
      label(ctx, c, 'Sent', 350, 290, { size: 28, bg: hi(c), ink: c.label, scale: pop(a, 0.5) });
      label(ctx, c, 'Within minutes', 562, 150, { size: 26, bg: hi(c), ink: c.label, scale: pop(a, 0.3) });
      label(ctx, c, 'A flying squad', 562, 240, { size: 26, scale: pop(a, 0.7) });
      label(ctx, c, 'goes to the spot', 562, 294, { size: 26, scale: pop(a, 0.8) });
    }
  }
}
