// CriteriaBoardScene - L07 s03, Fig 7.12. One beat per class, route cards. Beat 0 the rule line.
// Beat 1 national routes, Route 2 carries Party Q. Beat 2 Party P checked against each route.
// Beat 3 five State routes, chips group them by what they count; Party P passes the 8% route. Beat 4 RUPP.
import { SimScene } from 'simulations/base/kit/SimScene.js';
import { tapLight, tapLightControl } from 'simulations/base/kit/TapLight.js';
import { tones, pop, folk, tile, say, lines, rr, mix, hi, tickOrCross } from '../L06/PartyWorld.js';

const NAT = [
  ['6% of votes in 4+ States,', 'and 4 Lok Sabha seats'],
  ['2% of Lok Sabha seats,', 'from 3+ States'],
  ['A State party', 'in 4+ States'],
];
const P_CHECK = ['It has 1 State', 'It has 3 seats', 'It has 1'];
const ST = [
  { t: '6% Assembly votes + 2 seats', g: 'both' },
  { t: '6% Lok Sabha votes + 1 seat', g: 'both' },
  { t: '3% of Assembly seats, or 3', g: 'seats' },
  { t: '1 Lok Sabha seat per 25', g: 'seats' },
  { t: '8% of valid votes', g: 'votes' },
];
const CHIPS = [
  { id: 'both', label: 'Votes and seats', targets: ['both'] },
  { id: 'seats', label: 'Seats only', targets: ['seats'] },
  { id: 'votes', label: 'Votes only', targets: ['votes'] },
];
const S_RULE = 0, S_NAT = 1, S_P = 2, S_STATE = 3, S_RUPP = 4;
const MAP = [S_RULE, S_NAT, S_P, S_STATE, S_RUPP].map((idx) => [{ idx, dwellMs: null }]);

export class CriteriaBoardScene extends SimScene {
  static BEAT_STEP_MAP = MAP;
  static HEIGHT = 456;
  static CONTROLS_IN_SIGHT = true;
  static ARIA_LABEL = 'The rule: any one condition should be fulfilled. Then three national routes, with Route 2 ticked for Party Q. Then the same routes crossed for Party P. Then five State routes, grouped by what they count, with the 40 per cent of Party P passing the 8 per cent route. Then the two kinds of registered unrecognised party.';
  static CONTROLS = [{ ...tapLightControl({ id: 'g', label: 'Counts', chips: CHIPS }), options: CHIPS.map((x) => ({ value: x.id, label: x.label })) }];

  tl = tapLight({ chips: CHIPS });
  getControlValue(id) { return id === 'g' ? this.tl.controlValue() : undefined; }
  onControlChange(id, v) { if (id === 'g' && this._guard(id)) this.tl.fromControl(v); }
  isControlHidden(id) { return id === 'g' && this.stage !== S_STATE; }
  enter() { this.tl.set({ lit: null }); }
  busy() { return this.age < 1.3; }

  _head(ctx, c, text) {
    ctx.fillStyle = hi(c); rr(ctx, 16, 12, 648, 58, 12); ctx.fill();
    say(ctx, c, text, 340, 41, { size: 32 });
  }

  _routes(ctx, c, mode) {
    const a = this.age;
    NAT.forEach((r, i) => {
      const y = 84 + i * 122, k = pop(a, 0.1 + i * 0.14), dim = mode === 'Q' && i !== 1;
      ctx.save(); ctx.globalAlpha *= Math.min(1, k) * (dim ? 0.4 : 1);
      tile(ctx, c, 16, y, 648, 110, { fill: c.bgSurface, lit: mode === 'Q' && i === 1 });
      ctx.fillStyle = mix(c.water, c.bgSurface, 0.45); ctx.beginPath(); ctx.arc(64, y + 54, 32, 0, 7); ctx.fill();
      say(ctx, c, String(i + 1), 64, y + 56, { size: 38 });
      const cx = mode === 'P' ? 300 : 365;
      lines(ctx, c, r, cx, y + 54, { size: 29, lh: 36 });
      if (mode === 'Q' && i === 1) { tickOrCross(ctx, c, true, 618, y + 54, 20); }
      if (mode === 'P') {
        tickOrCross(ctx, c, false, 626, y + 40, 15);
        say(ctx, c, P_CHECK[i], 640, y + 82, { size: 25, align: 'right', display: false });
      }
      ctx.restore();
    });
  }

  draw(ctx, c) {
    const s = this.stage, a = this.age, t = tones(c);
    ctx.fillStyle = t.plaster; ctx.fillRect(0, 0, 680, 456);
    if (s === S_RULE) {
      ctx.fillStyle = t.wood; ctx.fillRect(0, 410, 680, 46);
      tile(ctx, c, 204, 40, 456, 320, { fill: c.bgSurface });
      lines(ctx, c, ['Any one', 'condition', 'should be', 'fulfilled'], 432, 200, { size: 50, lh: 66 });
      folk(ctx, this, { role: 'adult', x: 100, y: 440, height: 330, pose: 'point', facing: 1, i: 5 });
    } else if (s === S_NAT) { this._head(ctx, c, 'National party: Party Q'); this._routes(ctx, c, 'Q'); }
    else if (s === S_P) { this._head(ctx, c, 'National party: Party P'); this._routes(ctx, c, 'P'); }
    else if (s === S_STATE) {
      this._head(ctx, c, 'State party: any one, in that State');
      ST.forEach((r, i) => {
        const y = 82 + i * 74, on = !this.tl.any() || this.tl.has(r.g), k = pop(a, 0.05 + i * 0.09);
        ctx.save(); ctx.globalAlpha *= Math.min(1, k) * (on ? 1 : 0.34);
        tile(ctx, c, 16, y, 648, 66, { fill: c.bgSurface, lit: this.tl.any() ? on : i === 4, r: 12 });
        say(ctx, c, String(i + 1), 52, y + 34, { size: 32 });
        say(ctx, c, r.t, 90, y + 33, { size: 29, align: 'left', display: false, weight: 800 });
        if (i === 4) { say(ctx, c, 'Party P: 40%', 590, y + 33, { size: 27, align: 'right', display: false }); tickOrCross(ctx, c, true, 626, y + 33, 16); }
        ctx.restore();
      });
    } else {
      this._head(ctx, c, 'Registered unrecognised (RUPP)');
      [['Not enough', 'percentage of votes'], ['Never contested', 'since registering']].forEach((r, i) => {
        const x = 16 + i * 332, k = pop(a, 0.1 + i * 0.16);
        ctx.save(); ctx.globalAlpha *= Math.min(1, k);
        tile(ctx, c, x, 86, 316, 166, { fill: c.bgSurface });
        lines(ctx, c, r, x + 158, 168, { size: 30, lh: 42 });
        ctx.restore();
      });
      tile(ctx, c, 16, 270, 648, 150, { fill: c.bgSurface });
      lines(ctx, c, 'Candidates can still contest', 340, 318, { size: 32 });
      lines(ctx, c, 'No reserved symbol: a free symbol from a list', 340, 372, { size: 26, display: false });
    }
  }
}
