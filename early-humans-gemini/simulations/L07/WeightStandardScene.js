// WeightStandardScene - blk-l07-s07, 3 beats. A trader at a big pan balance with a load of copper. Three named cases:
// "My town's 10", "Far town's 10" and "Shared 10". The first two come from two towns whose cubes differ, so the same load
// does not balance on both. Only the shared weight settles it. Beat 0 opens on the home weight, beat 1 on the far weight
// (the load tips), beat 2 on the choice with the shared weight still to find. Controls are outside (canvas).
import { SimScene } from 'simulations/base/kit/SimScene.js';
import { clamp, darken, pill, mix } from 'simulations/base/kit/SimLook.js';
import { balanceTilt, drawBalance } from 'simulations/base/kit/SimBalance.js';
import { figureFor, drawFigure } from 'simulations/base/kit/SimFigure.js';

const W = 680, H = 520;
const MAP = [0, 1, 2].map((idx) => [{ idx, dwellMs: null }]);
// One "unit" in each town, against the true weight of the load. The numbers are invented to show the idea.
const CASES = {
  home: { label: "My town's 10", real: 8, tone: 's2', say: 'Seems more than 10', sub: 'A small cube called 10' },
  far: { label: "Far town's 10", real: 12, tone: 's5', say: 'Seems less than 10', sub: 'A big cube called 10' },
  shared: { label: 'Shared 10', real: 10, tone: 's3', say: 'Exactly 10', sub: 'One size in every town' },
};
const tiltFor = (k) => balanceTilt(10, CASES[k].real, { max: 0.2, scale: 2 });

export class WeightStandardScene extends SimScene {
  static BEAT_STEP_MAP = MAP;
  static CONTINUOUS = false;
  static IRIS = false;
  static NOTE_STAGE = -1;
  static CONTROLS_IN_SIGHT = true;
  static ARIA_LABEL = 'A trader weighs a load of copper on a pan balance. Two towns each have a cube called 10 but the cubes differ, so the same load tips the pan. A shared weight balances it.';
  static CONTROLS = [{ type: 'segmented', tall: true, id: 'w', label: 'Weigh with', options: Object.entries(CASES).map(([value, k]) => ({ value, label: k.label })) }];

  _case = 'home';
  _tilt = 0;
  _found = false;

  getControlValue(id) { return id === 'w' ? this._case : undefined; }
  onControlChange(id, v) {
    if (id !== 'w' || !CASES[v]) return;
    this._case = v;
    if (v === 'shared' && !this._found && (this.stage ?? 0) < 2) { this._found = true; this.after(0.7, () => this.celebrate(340, 96, 14)); }
    this.animateFor(1100);
  }

  enter(s) {
    this._case = ['home', 'far', 'shared'][s] ?? 'home';
    this._found = false;
    this._tilt = tiltFor(this._case);
  }

  update(d) {
    const want = tiltFor(this._case);
    this._tilt += (want - this._tilt) * clamp(d * 7, 0, 1);
    if (Math.abs(want - this._tilt) < 0.002) this._tilt = want;
  }

  busy() { return Math.abs(tiltFor(this._case) - this._tilt) > 0.002; }

  draw(ctx, c) {
    ctx.fillStyle = mix(c.bgSurface, c.gold, 0.1); ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = mix(c.gold, c.bgSurface, 0.55); ctx.fillRect(0, 440, W, 80);
    ctx.fillStyle = darken(c.gold, 0.2); ctx.fillRect(0, 438, W, 4);
    const k = CASES[this._case], tone = c[k.tone], side = 56 + (k.real - 8) * 13;
    const spec = figureFor(this, { role: 'shopkeeper', pose: 'point', x: 74, y: 462, height: 210, facing: 1 });
    drawFigure(ctx, c, spec, spec.look);
    ctx.lineCap = 'round'; ctx.strokeStyle = darken(c.gold, 0.45); ctx.lineWidth = 14;
    ctx.beginPath(); ctx.moveTo(390, 150); ctx.lineTo(390, 440); ctx.stroke();
    drawBalance(ctx, c, { x: 390, y: 160, w: 350, tilt: this._tilt, left: [{ kind: 'block', text: 'copper', tone: c.s8, w: 104, h: 74 }], right: [{ kind: 'block', text: '10', tone, w: side, h: side }], tone: darken(c.gold, 0.3) });
    pill(ctx, c, k.say, 340, 44, { size: 34, bg: this._case === 'shared' ? c.good : c.warning, display: true });
    pill(ctx, c, k.sub, 340, 486, { size: 26, bg: c.bgSurface, ink: c.label, display: false });
  }
}
