// ThreeCountriesScene - L08 s04, the book's Q9 chart, big. One table. Beat 0 tap a country. Beat 1 votes
// and living lit. Beat 2 parties lit. No ranking, no winner, no judgement.
import { SimScene } from 'simulations/base/kit/SimScene.js';
import { tapLight, tapLightControl } from 'simulations/base/kit/TapLight.js';
import { tones, tile, say, lines, rr, mix, hi } from '../L06/PartyWorld.js';

const ROWS = [
  { n: ['Constitution'], v: [['Written'], ['Written'], ['Written']] },
  { n: ['Elections'], v: [['Periodic'], ['Periodic'], ['Monarchy']] },
  { n: ['Voting rights'], v: [['Yes'], ['Yes'], ['None']], id: 'vote' },
  { n: ['Parties'], v: [['Two or more'], ['One'], ['None']], id: 'party' },
  { n: ['Standard', 'of living'], v: [['Average'], ['Above', 'average'], ['High']], id: 'live' },
];
const CHIPS = ['A', 'B', 'C'].map((x, i) => ({ id: x, label: 'Country ' + x, targets: [i] }));
const MAP = [0, 1, 2].map((idx) => [{ idx, dwellMs: null }]);
const X = [12, 180, 344, 508], W = 160, RH = [62, 62, 62, 62, 76];

export class ThreeCountriesScene extends SimScene {
  static BEAT_STEP_MAP = MAP;
  static HEIGHT = 456;
  static CONTROLS_IN_SIGHT = true;
  static ARIA_LABEL = 'A chart of three countries. All have a written constitution. A has periodic elections, voting rights, two or more parties and an average standard of living. B has periodic elections, voting rights, one party and an above-average standard of living. C has a monarchy, no voting rights, no party and a high standard of living.';
  static CONTROLS = [{ ...tapLightControl({ id: 'land', label: 'Country', chips: CHIPS }), options: CHIPS.map((x) => ({ value: x.id, label: x.label })) }];

  tl = tapLight({ chips: CHIPS });
  getControlValue(id) { return id === 'land' ? this.tl.controlValue() : undefined; }
  onControlChange(id, v) { if (id === 'land' && this._guard(id)) this.tl.fromControl(v); }
  isControlHidden(id) { return id === 'land' && this.stage !== 0; }
  enter() { this.tl.set({ lit: null }); }
  busy() { return this.age < 0.8; }

  draw(ctx, c) {
    const s = this.stage, t = tones(c);
    ctx.fillStyle = t.plaster; ctx.fillRect(0, 0, 680, 456);
    const col = s === 0 && this.tl.any() ? this.tl.lit()[0] : null;
    const rowOn = (r) => (s === 1 ? r.id === 'vote' || r.id === 'live' : s === 2 ? r.id === 'party' : true);
    ['A', 'B', 'C'].forEach((n, i) => {
      ctx.save(); if (col != null && col !== i) ctx.globalAlpha *= 0.34;
      ctx.fillStyle = hi(c); rr(ctx, X[i + 1], 12, W, 60, 12); ctx.fill();
      say(ctx, c, 'Country ' + n, X[i + 1] + W / 2, 42, { size: 28 });
      ctx.restore();
    });
    let y = 82;
    ROWS.forEach((r, j) => {
      const h = RH[j], on = rowOn(r);
      ctx.save(); ctx.globalAlpha *= on ? 1 : 0.4;
      lines(ctx, c, r.n, X[0] + 4, y + h / 2, { size: 25, align: 'left', display: false, weight: 800, lh: 28 });
      r.v.forEach((v, i) => {
        ctx.save(); if (col != null && col !== i) ctx.globalAlpha *= 0.34;
        tile(ctx, c, X[i + 1], y, W, h - 8, { fill: c.bgSurface, r: 10, lit: s > 0 && !!r.id && on });
        lines(ctx, c, v, X[i + 1] + W / 2, y + (h - 8) / 2, { size: v[0].length > 9 ? 25 : 28, lh: 28 });
        ctx.restore();
      });
      ctx.restore();
      y += h;
    });
    void mix;
  }
}
