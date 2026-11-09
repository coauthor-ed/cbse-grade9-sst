// AccountabilityLoopScene - L04 s05. b0 citizens judge a government: vote, debate, civil society.
// b1 Question Hour with a one-hour clock, and an audit of the accounts. b2 an RTI letter at an
// office window, and the four bodies on chips.
import { SimScene } from 'simulations/base/kit/SimScene.js';
import { drawVignette } from 'simulations/base/kit/SimLook.js';
import { tapLight, tapLightControl } from 'simulations/base/kit/TapLight.js';
import { drawCivic, day, room, who, tag, arrow, sheet, card, pop, rr, mix, darken } from './DayKit.js';

const m = (idx) => [{ idx, dwellMs: null }];
const TAU = Math.PI * 2;
const CHIPS = [
  { id: 'cag', label: 'CAG', targets: ['cag'], tone: 1 },
  { id: 'cic', label: 'CIC', targets: ['cic'], tone: 3 },
  { id: 'lokpal', label: 'Lokpal', targets: ['lokpal'], tone: 5 },
  { id: 'cvc', label: 'CVC', targets: ['cvc'], tone: 6 },
];
const SAY = {
  cag: ['Comptroller and Auditor General', 'Audits the accounts of the government.'],
  cic: ['Central Information Commission', 'Hears complaints about RTI requests.'],
  lokpal: ['Lokpal', 'Looks into complaints of corruption against public officials.'],
  cvc: ['Central Vigilance Commission', 'Watches for corruption in central government offices.'],
};

export class AccountabilityLoopScene extends SimScene {
  static HEIGHT = 453;
  static BEAT_STEP_MAP = [m(0), m(1), m(2)];
  static CONTROLS_IN_SIGHT = true;
  static ARIA_LABEL = 'Citizens at a ballot box, a microphone and a community meeting send arrows up to a government building. Then members ask questions in Parliament under a clock that marks one hour, and an open account book is checked. Then a citizen hands a letter at an office window, with chips for CAG, CIC, Lokpal and CVC.';
  static CONTROLS = [{ ...tapLightControl({ id: 'lit', label: 'Body', chips: CHIPS }), options: CHIPS.map((x) => ({ value: x.id, label: x.label })) }];   // no None: one row keeps the figure wide
  tl = tapLight({ chips: CHIPS });
  isControlHidden(id) { return id === 'lit' && this.stage !== 2; }
  getControlValue(id) { return id === 'lit' ? this.tl.controlValue() : undefined; }
  onControlChange(id, v) { if (id === 'lit') this.tl.fromControl(v); }
  enter() { this.tl.reset(); }
  busy() { return this.age < 1.8; }

  _citizens(ctx, c, a) {
    day(ctx, c, { ground: 206 });
    drawCivic(ctx, c, 'office', 340, 206, { w: 214 });
    const ST = [
      { x: 110, t: 'elections', tone: 's1' }, { x: 340, t: 'public debates', tone: 's3' }, { x: 570, t: 'civil society', tone: 's5' },
    ];
    ST.forEach((s, i) => {
      arrow(ctx, c, s.x, 274, i === 1 ? 340 : s.x + (340 - s.x) * 0.6, 190, { k: (a - 0.3 - i * 0.25) / 0.5, col: c[s.tone], w: 11, bend: i === 1 ? 0 : (i === 0 ? -0.15 : 0.15) });
    });
    drawCivic(ctx, c, 'ballotBox', 148, 384, { w: 92 });
    who(ctx, this, { role: 'voter', x: 74, y: 392, height: 134, i: 1, facing: 1, pose: 'point' });
    drawCivic(ctx, c, 'mike', 378, 388, { h: 106 });
    who(ctx, this, { role: 'teacher', x: 318, y: 392, height: 134, i: 2, facing: 1, pose: 'point' });
    who(ctx, this, { role: 'farmer', x: 530, y: 390, height: 128, i: 3, facing: 1 });
    who(ctx, this, { role: 'shopkeeper', x: 586, y: 392, height: 128, i: 4, facing: -1 });
    who(ctx, this, { role: 'adult', x: 636, y: 390, height: 130, i: 6, facing: -1 });
    ST.forEach((s, i) => tag(ctx, c, s.t, s.x, 420, { k: pop(a, 0.3 + i * 0.25), bg: c[s.tone], size: 28 }));
  }

  _clock(ctx, c, x, y, r, k) {
    ctx.beginPath(); ctx.arc(x, y, r + 8, 0, TAU); ctx.fillStyle = mix(c.s8, c.label, 0.3); ctx.fill();
    ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fillStyle = c.bgSurface; ctx.fill();
    ctx.beginPath(); ctx.moveTo(x, y); ctx.arc(x, y, r - 6, -Math.PI / 2, -Math.PI / 2 + TAU * k); ctx.closePath(); ctx.fillStyle = mix(c.gold, c.bgSurface, 0.2); ctx.fill();
    ctx.strokeStyle = c.label; ctx.lineWidth = 7; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y - r * 0.8); ctx.stroke();
    ctx.lineWidth = 9; ctx.beginPath(); ctx.moveTo(x, y); const b = -Math.PI / 2 + TAU * k * 0.083; ctx.lineTo(x + Math.cos(b) * r * 0.5, y + Math.sin(b) * r * 0.5); ctx.stroke();
  }

  _hour(ctx, c, a) {
    room(ctx, c, { ground: 300, wall: mix(c.bgSurface, c.s3, 0.2), floor: mix(c.bgSurface, c.s3, 0.42) });
    // curved benches
    for (let r = 0; r < 3; r++) { ctx.strokeStyle = darken(mix(c.bgSurface, c.s3, 0.6), 0.05 * r); ctx.lineWidth = 24; ctx.lineCap = 'round'; ctx.beginPath(); ctx.arc(200, 470, 176 + r * 44, Math.PI * 1.12, Math.PI * 1.88); ctx.stroke(); }
    who(ctx, this, { role: 'adult', x: 100, y: 330, height: 180, i: 1, pose: 'reach-up', facing: 1 });
    who(ctx, this, { role: 'elder', x: 298, y: 346, height: 190, i: 3, pose: 'point', facing: -1 });
    this._clock(ctx, c, 208, 84, 60, Math.min(1, a / 1.4));
    tag(ctx, c, 'Question Hour', 200, 380, { k: pop(a, 0.2), bg: c.gold, size: 32 });
    // the audit
    rr(ctx, 396, 16, 268, 372, 18); ctx.fillStyle = mix(c.bgSurface, c.gold, 0.14); ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = c.stroke; ctx.stroke();
    who(ctx, this, { role: 'teacher', x: 530, y: 282, height: 226, i: 5, pose: 'stand', look: { glasses: true } });
    rr(ctx, 410, 256, 240, 22, 8); ctx.fillStyle = mix(c.s8, c.label, 0.34); ctx.fill();
    rr(ctx, 430, 278, 200, 78, 8); ctx.fillStyle = darken(mix(c.s8, c.label, 0.28), 0.1); ctx.fill();
    drawCivic(ctx, c, 'bookOpen', 530, 260, { w: 196 });
    tag(ctx, c, 'audit', 530, 380, { k: pop(a, 0.8), bg: c.s3, size: 32 });
    tag(ctx, c, 'first hour of a session', 340, 426, { k: pop(a, 1.2), size: 28 });
  }

  _rti(ctx, c, a) {
    day(ctx, c, { ground: 252 });
    drawCivic(ctx, c, 'office', 450, 252, { w: 280 });
    who(ctx, this, { role: 'voter', x: 130, y: 296, height: 210, i: 2, pose: 'point', facing: 1 });
    sheet(ctx, c, 262, 172, 116, 92, { title: 'RTI', size: 28, lines: 2, rot: 0.05 });
    arrow(ctx, c, 324, 172, 396, 172, { k: (a - 0.4) / 0.5, col: c.accent, w: 11 });
    const L = this.tl.chip();
    if (L) card(ctx, c, 14, 306, 652, 136, { title: SAY[L.id][0], text: SAY[L.id][1], size: 28, titleSize: 30, rim: c[{ cag: 's1', cic: 's3', lokpal: 's5', cvc: 's6' }[L.id]] });
    else card(ctx, c, 14, 306, 652, 136, { title: 'Right to Information Act, 2005', text: 'Citizens can seek information from government agencies.', size: 28, titleSize: 30 });
  }

  draw(ctx, c) {
    const st = this.stage, a = this.age;
    if (st === 0) this._citizens(ctx, c, a);
    if (st === 1) this._hour(ctx, c, a);
    if (st === 2) this._rti(ctx, c, a);
    drawVignette(ctx, c, 0.16);
  }
}
