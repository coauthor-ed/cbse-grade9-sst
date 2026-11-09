// PartyFunctionScene - L06 s03, Fig 7.9. Beat 0 party workers at the grassroots: a street, people talking.
// Beat 1 the four jobs in one made-up town: a chip shows that job's case. Beat 2 what the jobs give
// democracy. The made-up case is only a picture of the job: no real party, no party colour.
import { SimScene } from 'simulations/base/kit/SimScene.js';
import { tapLight, tapLightControl } from 'simulations/base/kit/TapLight.js';
import { drawCivic } from '../shared/CivicArt.js';
import { tones, day, folk, pop, label, tile, say, rr, hi } from './PartyWorld.js';

const CHIPS = [
  { id: 'organise', label: 'Organise opinion', targets: ['organise'] },
  { id: 'campaign', label: 'Campaign', targets: ['campaign'] },
  { id: 'choices', label: 'Offer choices', targets: ['choices'] },
  { id: 'inform', label: 'Inform voters', targets: ['inform'] },
];
const S_ROOTS = 0, S_JOBS = 1, S_GIVES = 2;
const MAP = [S_ROOTS, S_JOBS, S_GIVES].map((idx) => [{ idx, dwellMs: null }]);
const G = 250;

export class PartyFunctionScene extends SimScene {
  static BEAT_STEP_MAP = MAP;
  static HEIGHT = 456;
  static CONTROLS_IN_SIGHT = true;
  static ARIA_LABEL = 'A village street where a party worker talks with neighbours. Then four jobs of a party, each shown as a case in one made-up town. Then a Parliament building with the four things parties give democracy.';
  static CONTROLS = [{ ...tapLightControl({ id: 'lit', label: 'Job', chips: CHIPS }), options: CHIPS.map((x) => ({ value: x.id, label: x.label })) }];

  tl = tapLight({ chips: CHIPS });
  getControlValue(id) { return id === 'lit' ? this.tl.controlValue() : undefined; }
  onControlChange(id, v) { if (id === 'lit' && this._guard(id)) this.tl.fromControl(v); }
  isControlHidden(id) { return id === 'lit' && this.stage !== S_JOBS; }
  enter(stage) { this.tl.set({ lit: stage === S_JOBS ? 'organise' : null }); }
  busy() { return this.age < 1.2; }

  _street(ctx, c) {
    const t = tones(c);
    day(ctx, c, 680, 456, { ground: G });
    [[70, 150], [210, 170], [470, 150], [610, 170]].forEach(([x, h], i) => {
      ctx.fillStyle = i % 2 ? t.plaster : t.sand; rr(ctx, x - 66, G - h + 30, 132, h - 30, 6); ctx.fill();
      ctx.fillStyle = t.wood; ctx.beginPath(); ctx.moveTo(x - 80, G - h + 34); ctx.lineTo(x, G - h - 14); ctx.lineTo(x + 80, G - h + 34); ctx.fill();
      ctx.fillStyle = t.greyDark; rr(ctx, x - 16, G - 60, 32, 60, 4); ctx.fill();
    });
  }

  _job(ctx, c, id) {
    if (id === 'organise') {
      ['elder', 'farmer', 'adult', 'student'].forEach((role, i) => folk(ctx, this, { role, x: 280 + i * 84, y: 420, height: 180, facing: -1, i: i + 1 }));
      folk(ctx, this, { role: 'worker', x: 136, y: 420, height: 190, pose: 'point', facing: 1, i: 5 });
      label(ctx, c, 'Fix the water pipe', 340, 186, { size: 30, bg: hi(c), ink: c.label });
    } else if (id === 'campaign') {
      drawCivic(ctx, c, 'mike', 408, 420, { h: 150 });
      folk(ctx, this, { role: 'adult', x: 320, y: 420, height: 196, pose: 'point', facing: 1, i: 5 });
      ['elder', 'adult'].forEach((role, i) => folk(ctx, this, { role, x: 520 + i * 84, y: 424, height: 170, facing: -1, i: i + 2 }));
      label(ctx, c, 'A hospital for the district', 340, 186, { size: 30, bg: hi(c), ink: c.label });
    } else if (id === 'choices') {
      [['Party A', 'More buses'], ['Party B', 'Wider roads']].forEach(([p, plan], i) => {
        const x = 46 + i * 310;
        tile(ctx, c, x, 196, 278, 150, { fill: c.bgSurface });
        say(ctx, c, p, x + 139, 236, { size: 34 });
        say(ctx, c, plan, x + 139, 296, { size: 30, display: false });
      });
      label(ctx, c, 'Which plan does the voter want?', 340, 400, { size: 28 });
    } else {
      folk(ctx, this, { role: 'voter', x: 210, y: 424, height: 200, pose: 'stand', facing: 1, i: 4 });
      drawCivic(ctx, c, 'newspaper', 320, 420, { h: 150 });
      label(ctx, c, 'Promises in print', 500, 300, { size: 28, bg: hi(c), ink: c.label });
      label(ctx, c, 'Read before polling', 500, 356, { size: 28 });
    }
  }

  draw(ctx, c) {
    const s = this.stage, a = this.age;
    if (s === S_ROOTS) {
      this._street(ctx, c);
      ['elder', 'adult', 'shopkeeper'].forEach((role, i) => folk(ctx, this, { role, x: 330 + i * 104, y: 424, height: 206, facing: -1, i: i + 1 }));
      folk(ctx, this, { role: 'worker', x: 170, y: 424, height: 220, pose: 'point', facing: 1, i: 5 });
      label(ctx, c, 'Grassroots: where people live', 340, 34, { size: 28, scale: pop(a, 0.2) });
    } else if (s === S_JOBS) {
      this._street(ctx, c);
      this._job(ctx, c, this.tl.chip()?.id ?? 'organise');
      label(ctx, c, 'One made-up town', 340, 34, { size: 26 });
    } else {
      day(ctx, c, 680, 456, { ground: 236 });
      drawCivic(ctx, c, 'parliament', 340, 246, { w: 400 });
      [['Governance', 'running the government'], ['Accountability', 'answering to the people'], ['Representation', 'speaking for the people'], ['Public engagement', 'drawing people in']].forEach(([n, m], i) => {
        const x = 16 + (i % 2) * 330, y = 262 + (i >> 1) * 94, k = pop(a, 0.1 + i * 0.14);
        ctx.save(); ctx.globalAlpha *= Math.min(1, k);
        tile(ctx, c, x, y, 318, 84, { fill: c.bgSurface });
        say(ctx, c, n, x + 159, y + 28, { size: 30 });
        say(ctx, c, m, x + 159, y + 60, { size: 25, display: false });
        ctx.restore();
      });
    }
  }
}
