// SirRollScene - blk-l04-s05. The book's wording, shown on a roll of numbered voters, no names.
// b0 the roll under revision. b1 a new voter joins, four entries struck; tap a ground to find it.
// b2 claims or objections settled, then the final roll. State comes from the beat alone.
import { SimScene } from 'simulations/base/kit/SimScene.js';
import { tapLight, tapLightControl } from 'simulations/base/kit/TapLight.js';
import { day, tile, say, folk, tag, pop, tick, wrap, mix, rr, tones } from './BoothWorld.js';

const S_WHAT = 0, S_CHANGE = 1, S_FINAL = 2;
const MAP = [S_WHAT, S_CHANGE, S_FINAL].map((idx) => [{ idx, dwellMs: null }]);
const GROUNDS = [
  { id: 'death', label: 'Death', n: 3, say: 'Voter 3: death of the voter' },
  { id: 'moved', label: 'Moved', n: 6, say: 'Voter 6: change of residence' },
  { id: 'twice', label: 'Duplicate', n: 9, say: 'Voter 9: duplicate enrolment' },
  { id: 'lost', label: 'Untraceable', n: 11, say: 'Voter 11: permanently untraceable' },
];
const CHIPS = GROUNDS.map((g) => ({ id: g.id, label: g.label, targets: [g.id] }));
const STRUCK = GROUNDS.map((g) => g.n);
const WORDS = ['Update', 'Verify', 'Correct'];
const X = 14, Y = 54, CW = 160, CH = 56;

export class SirRollScene extends SimScene {
  static BEAT_STEP_MAP = MAP;
  static HEIGHT = 456;
  static CONTROLS_IN_SIGHT = true;
  static ARIA_LABEL = 'An electoral roll of twelve numbered voters. In the revision one young voter is added and four entries are struck out, one for each ground. Claims and objections are settled, then the final roll is published.';
  static CONTROLS = [{ ...tapLightControl({ id: 'lit', label: 'Ground for deleting', chips: CHIPS }), options: CHIPS.map((x) => ({ value: x.id, label: x.label })) }];

  tl = tapLight({ chips: CHIPS, onChange: () => this.requestUiUpdate?.() });
  enter() { this.tl.reset(); }
  busy() { return this.age < (this.stage === S_FINAL ? 2.2 : 1.4); }
  isControlHidden(id) { return id === 'lit' && this.stage !== S_CHANGE; }
  getControlValue(id) { return id === 'lit' ? this.tl.controlValue() : undefined; }
  onControlChange(id, v) { if (id === 'lit' && this._guard(id)) this.tl.fromControl(v); }

  _sheet(ctx, c, title, col) {
    tile(ctx, c, 4, 4, 672, 268, { fill: mix(c.bgSurface, c.gold, 0.08) });
    ctx.fillStyle = col ?? tones(c).wood; rr(ctx, 4, 4, 672, 44, 14); ctx.fill();
    say(ctx, c, title, 340, 27, { size: 28, col: c.bgSurface });
  }

  _cell(ctx, c, n, o = {}) {
    const i = n - 1, x = X + (i % 4) * (CW + 4), y = Y + Math.floor(i / 4) * (CH + 13);
    ctx.save();
    if (o.dim) ctx.globalAlpha *= 0.3;
    ctx.fillStyle = o.fill ?? mix(c.waste, c.bgSurface, 0.78); rr(ctx, x, y, CW, CH, 8); ctx.fill();
    if (o.rim) { ctx.lineWidth = 4; ctx.strokeStyle = o.rim; rr(ctx, x, y, CW, CH, 8); ctx.stroke(); }
    say(ctx, c, 'Voter ' + n, x + CW / 2, y + CH / 2 + 1, { size: 27, display: false, col: o.struck ? c.labelMuted : c.label });
    if (o.struck) { ctx.strokeStyle = c.bad; ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x + 18, y + CH / 2); ctx.lineTo(x + CW - 18, y + CH / 2); ctx.stroke(); }
    ctx.restore();
    return { x: x + CW / 2, y: y + CH / 2 };
  }

  draw(ctx, c) {
    const s = this.stage, a = this.age;
    day(ctx, c, 680, 456, { ground: 330, hills: s !== S_CHANGE, sun: false });
    if (s === S_WHAT) {
      this._sheet(ctx, c, 'Electoral roll: being revised');
      for (let n = 1; n <= 12; n++) this._cell(ctx, c, n);
      folk(ctx, this, { role: 'teacher', x: 74, y: 444, height: 168, facing: 1, i: 2, pose: 'point' });
      WORDS.forEach((w, i) => tag(ctx, c, w, 248 + i * 150, 372, { size: 30, scale: pop(a, 0.2 + i * 0.2) }));
    } else if (s === S_CHANGE) {
      const lit = this.tl.chip()?.id, g = GROUNDS.find((d) => d.id === lit);
      this._sheet(ctx, c, 'Revised roll');
      for (let n = 1; n <= 12; n++) {
        const st = STRUCK.includes(n), me = g?.n === n;
        this._cell(ctx, c, n, { struck: st, rim: me ? c.bad : null, fill: st ? mix(c.bad, c.bgSurface, 0.84) : null, dim: !!g && !me });
      }
      ctx.save(); ctx.globalAlpha *= g ? 0.45 : 1;
      folk(ctx, this, { role: 'student', x: 66, y: 448, height: 164, facing: 1, i: 4, mood: 'happy' });
      ctx.fillStyle = mix(c.good, c.bgSurface, 0.7); rr(ctx, 120, 300, 186, 62, 10); ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = c.good; ctx.stroke();
      say(ctx, c, 'New voter', 213, 332, { size: 28 });
      ctx.restore();
      wrap(ctx, c, g ? g.say : 'Just turned 18: added', 498, 386, 330, { size: 28, display: true });
      if (!g) tag(ctx, c, '4 entries struck out', 492, 318, { size: 26, bg: c.bad });
    } else {
      const k1 = pop(a, 0.2), k2 = pop(a, 0.8), k3 = pop(a, 1.4), done = a >= 1.4;
      this._sheet(ctx, c, done ? 'Final electoral roll' : 'Revised roll', done ? c.good : null);
      for (let n = 1; n <= 12; n++) {
        const claim = n === 7;
        this._cell(ctx, c, n, { struck: STRUCK.includes(n), fill: STRUCK.includes(n) ? mix(c.bad, c.bgSurface, 0.84) : claim ? mix(c.gold, c.bgSurface, 0.6) : null, rim: claim && !done ? c.gold : null });
      }
      folk(ctx, this, { role: 'adult', x: 70, y: 448, height: 166, facing: 1, i: 6, pose: 'point' });
      tag(ctx, c, 'Claim or objection', 276, 322, { size: 27, bg: c.gold, scale: k1 });
      if (a > 0.8) { tick(ctx, c, 470, 322, 24 * Math.max(0.2, Math.min(1, k2))); say(ctx, c, 'Settled', 502, 323, { size: 30, align: 'left' }); }
      if (a > 1.4) tag(ctx, c, 'Then the final roll is published', 400, 400, { size: 28, bg: c.good, scale: k3 });
    }
  }

  destroy() { this.tl.destroy(); super.destroy(); }
}
