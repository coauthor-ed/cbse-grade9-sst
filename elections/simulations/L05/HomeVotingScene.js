// HomeVotingScene - blk-l05-s03. b0 four ways to vote. b1 a polling team at home: a ballot paper, a screen,
// a sealed cover, and no machine. b2 ETPBS for a service voter. b3 pick a voter: which ways are open.
// b4 the two cases in custody. Every voter is made up.
import { SimScene } from 'simulations/base/kit/SimScene.js';
import { drawCivic } from '../shared/CivicArt.js';
import { day, tones, tile, say, folk, tag, pop, tick, wrap, mix, rr, darken, mountain } from '../L04/BoothWorld.js';

const S_FOUR = 0, S_HOME = 1, S_ETPBS = 2, S_PICK = 3, S_CUSTODY = 4;
const MAP = [S_FOUR, S_HOME, S_ETPBS, S_PICK, S_CUSTODY].map((idx) => [{ idx, dwellMs: null }]);
const WAYS = ['At the booth', 'From home', 'ETPBS', 'With a companion'];
const VOTERS = [
  { id: 'v86', label: 'Aged 86', role: 'elder', open: [1, 1, 0, 0], say: 'Above 85' },
  { id: 'v74', label: 'Aged 74', role: 'elder', open: [1, 0, 0, 0], say: 'Not above 85' },
  { id: 'vs', label: 'Service voter', role: 'police', open: [0, 0, 1, 0], say: 'Posted far away' },
  { id: 'vc', label: 'Cannot see', role: 'adult', open: [1, 1, 0, 1], say: 'Disability of 40%' },
];

export class HomeVotingScene extends SimScene {
  static BEAT_STEP_MAP = MAP;
  static HEIGHT = 456;
  static CONTROLS_IN_SIGHT = true;
  static ARIA_LABEL = 'Four ways to vote on four tiles. A polling team at home with a ballot paper, a cardboard screen and a sealed cover. A service voter far from the home constituency casting a postal ballot. Picking a voter shows which ways are open to them. Then two cases in custody.';
  static CONTROLS = [{ type: 'segmented', tall: true, id: 'v', label: 'Tap a voter', value: 'v86', options: VOTERS.map((v) => ({ value: v.id, label: v.label })) }];

  constructor(container, config) { super(container, config); this._v = 'v86'; }
  enter() { this._v = 'v86'; }
  busy() { return this.age < 1.4; }
  isControlHidden(id) { return id === 'v' && this.stage !== S_PICK; }
  getControlValue(id) { return id === 'v' ? this._v : undefined; }
  onControlChange(id, v) { if (id === 'v' && this._guard(id)) { this._v = v; this.requestUiUpdate?.(); } }

  // A folding cardboard screen, plain. (x, y): ground centre.
  _screen(ctx, c, x, y, w = 150, h = 170) {
    const card = mix(c.waste, c.bgSurface, 0.68), dark = mix(c.waste, c.label, 0.2);
    ctx.fillStyle = dark; ctx.beginPath(); ctx.moveTo(x - w * 0.5, y - h * 0.9); ctx.lineTo(x - w * 0.3, y - h); ctx.lineTo(x - w * 0.3, y - 8); ctx.lineTo(x - w * 0.5, y); ctx.fill();
    ctx.beginPath(); ctx.moveTo(x + w * 0.5, y - h * 0.9); ctx.lineTo(x + w * 0.3, y - h); ctx.lineTo(x + w * 0.3, y - 8); ctx.lineTo(x + w * 0.5, y); ctx.fill();
    ctx.fillStyle = card; rr(ctx, x - w * 0.3, y - h, w * 0.6, h - 6, 4); ctx.fill();
    ctx.lineWidth = 3; ctx.strokeStyle = dark; ctx.stroke();
  }

  _envelope(ctx, c, x, y, w = 76) {
    const h = w * 0.66;
    ctx.fillStyle = mix(c.gold, c.bgSurface, 0.55); rr(ctx, x - w / 2, y - h / 2, w, h, 5); ctx.fill();
    ctx.lineWidth = 3; ctx.strokeStyle = darken(c.gold, 0.3); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x - w / 2, y - h / 2); ctx.lineTo(x, y + 2); ctx.lineTo(x + w / 2, y - h / 2); ctx.stroke();
    ctx.fillStyle = c.bad; ctx.beginPath(); ctx.arc(x, y + 2, 7, 0, Math.PI * 2); ctx.fill();
  }

  _room(ctx, c) {
    const wall = mix(c.gold, c.bgSurface, 0.82);
    ctx.fillStyle = wall; ctx.fillRect(0, 0, 680, 330);
    ctx.fillStyle = mix(c.waste, c.bgSurface, 0.6); ctx.fillRect(0, 330, 680, 126);
    ctx.fillStyle = mix(c.water, c.bgSurface, 0.6); rr(ctx, 420, 44, 150, 130, 8); ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = tones(c).wood; ctx.stroke();
  }

  draw(ctx, c) {
    const s = this.stage, a = this.age, t = tones(c);
    if (s === S_FOUR) {
      day(ctx, c, 680, 456, { ground: 400, hills: false, sun: false });
      WAYS.forEach((w, i) => {
        const x = 10 + (i % 2) * 335, y = 8 + (i >> 1) * 222, k = pop(a, 0.05 + i * 0.14), g = y + 160;
        ctx.save(); ctx.globalAlpha *= Math.min(1, k);
        tile(ctx, c, x, y, 325, 212, { fill: c.bgSurface });
        if (i === 0) { folk(ctx, this, { role: 'adult', x: x + 96, y: g, height: 138, facing: 1, i: 3 }); drawCivic(ctx, c, 'booth', x + 214, g, { h: 118 }); }
        if (i === 1) { folk(ctx, this, { role: 'elder', x: x + 96, y: g, height: 134, facing: 1, i: 1 }); this._screen(ctx, c, x + 218, g, 120, 124); }
        if (i === 2) { drawCivic(ctx, c, 'phone', x + 102, g, { h: 128 }); this._envelope(ctx, c, x + 226, g - 64, 104); }
        if (i === 3) { folk(ctx, this, { role: 'adult', x: x + 118, y: g, height: 138, facing: 1, i: 6 }); folk(ctx, this, { role: 'student', x: x + 204, y: g, height: 128, facing: -1, i: 4 }); }
        say(ctx, c, w, x + 162, y + 188, { size: 28 });
        ctx.restore();
      });
    } else if (s === S_HOME) {
      this._room(ctx, c);
      ctx.fillStyle = t.wood; rr(ctx, 22, 256, 220, 110, 16); ctx.fill();
      ctx.fillStyle = mix(c.s8, c.bgSurface, 0.45); rr(ctx, 36, 300, 192, 70, 12); ctx.fill();
      folk(ctx, this, { role: 'elder', x: 122, y: 424, height: 214, pose: 'sit', seat: { x: 122, y: 330 }, facing: 1, i: 1, between: () => { ctx.save(); ctx.translate(176, 300); ctx.rotate(-0.16); ctx.fillStyle = mix(c.bad, c.bgSurface, 0.68); rr(ctx, -24, -18, 48, 36, 3); ctx.fill(); ctx.lineWidth = 2.5; ctx.strokeStyle = c.bad; ctx.stroke(); ctx.restore(); } });
      this._screen(ctx, c, 266, 396, 150, 210);
      folk(ctx, this, { role: 'teacher', x: 470, y: 430, height: 282, facing: -1, i: 2, mood: 'smile' });
      folk(ctx, this, { role: 'adult', x: 586, y: 436, height: 296, facing: -1, i: 3 });
      this._envelope(ctx, c, 374, 372, 86);
      tag(ctx, c, 'Sealed cover', 372, 430, { size: 25, scale: pop(a, 0.65) });
      tag(ctx, c, 'Screen', 266, 160, { size: 26, scale: pop(a, 0.45) });
      tag(ctx, c, 'Ballot paper', 106, 160, { size: 26, bg: c.gold, scale: pop(a, 0.25) });
      tag(ctx, c, 'Polling team', 528, 110, { size: 26, scale: pop(a, 0.8) });
    } else if (s === S_ETPBS) {
      day(ctx, c, 680, 456, { ground: 330, hills: false });
      mountain(ctx, c, 0, 330, 360, 250);
      folk(ctx, this, { role: 'police', x: 112, y: 436, height: 252, facing: 1, i: 5, pose: 'stand', hands: [{ x: 176, y: 300 }, { x: 170, y: 310 }], between: () => drawCivic(ctx, c, 'phone', 176, 332, { h: 66 }) });
      ctx.save(); ctx.strokeStyle = c.label; ctx.lineWidth = 5; ctx.setLineDash([3, 16]); ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(214, 300); ctx.quadraticCurveTo(380, 180, 526, 290); ctx.stroke(); ctx.restore();
      this._envelope(ctx, c, 370, 212, 92);
      drawCivic(ctx, c, 'booth', 580, 402, { h: 138 });
      tag(ctx, c, 'Posted here', 112, 56, { size: 26 });
      tag(ctx, c, 'Home constituency', 548, 212, { size: 26, scale: pop(a, 0.4) });
      tag(ctx, c, 'Postal ballot, sent electronically', 376, 428, { size: 25, scale: pop(a, 0.2) });
    } else if (s === S_PICK) {
      day(ctx, c, 680, 456, { ground: 400, hills: false, sun: false });
      const v = VOTERS.find((d) => d.id === this._v);
      tile(ctx, c, 10, 8, 240, 436, { fill: c.bgSurface });
      if (v.id === 'v74' || v.id === 'v86') folk(ctx, this, { role: 'elder', x: 130, y: 358, height: 300, facing: 0, i: v.id === 'v74' ? 7 : 1 });
      else folk(ctx, this, { role: v.role, x: 130, y: 358, height: 310, facing: 0, i: v.id === 'vs' ? 5 : 6 });
      say(ctx, c, v.label, 130, 386, { size: 30 });
      wrap(ctx, c, v.say, 130, 420, 230, { size: 25, display: false, lh: 26, col: c.labelMuted });
      WAYS.forEach((w, i) => {
        const y = 8 + i * 110, ok = !!v.open[i];
        tile(ctx, c, 262, y, 408, 98, { fill: ok ? mix(c.good, c.bgSurface, 0.78) : c.bgSurface });
        tick(ctx, c, 308, y + 49, 27, ok);
        say(ctx, c, w, 348, y + 50, { size: 30, align: 'left', col: ok ? c.label : c.labelMuted });
      });
    } else {
      day(ctx, c, 680, 456, { ground: 400, hills: false, sun: false });
      [{ t: 'In prison', s: 'Cannot vote', ok: false }, { t: 'Preventive detention', s: 'Postal ballot', ok: true }].forEach((d, i) => {
        const x = i ? 348 : 12, k = pop(a, 0.1 + i * 0.25);
        ctx.save(); ctx.globalAlpha *= Math.min(1, k);
        tile(ctx, c, x, 12, 320, 432, { fill: c.bgSurface });
        wrap(ctx, c, d.t, x + 160, 62, 290, { size: 32, display: true });
        if (d.ok) this._envelope(ctx, c, x + 160, 224, 170); else { ctx.fillStyle = t.grey; rr(ctx, x + 72, 142, 176, 164, 10); ctx.fill(); ctx.fillStyle = t.greyDark; for (let j = 0; j < 4; j++) { rr(ctx, x + 92 + j * 44, 142, 12, 164, 4); ctx.fill(); } }
        tick(ctx, c, x + 58, 372, 25, d.ok);
        say(ctx, c, d.s, x + 92, 373, { size: 30, align: 'left' });
        ctx.restore();
      });
    }
  }
}
