// PartyFlowScene - L06 s04, Fig 7.11, built by beat. Beat 0 citizens, parties, contest. Beat 1 the fork:
// winning party and opposition, three steps each. Beat 2 tap an event: its path lights and a token
// lands on its step. Colours name a path, never a party.
import { SimScene } from 'simulations/base/kit/SimScene.js';
import { tapLight, tapLightControl } from 'simulations/base/kit/TapLight.js';
import { day, folk, pop, label, tile, lines, mix, hi, rr } from './PartyWorld.js';

const CHIPS = [
  { id: 'policy', label: 'A new policy starts', targets: ['win', 'win3'] },
  { id: 'debate', label: 'A debate questions it', targets: ['opp', 'opp3'] },
  { id: 'check', label: 'A committee checks it', targets: ['opp', 'opp3'] },
];
const S_UP = 0, S_FORK = 1, S_EVENT = 2;
const MAP = [S_UP, S_FORK, S_EVENT].map((idx) => [{ idx, dwellMs: null }]);
const PATHS = [
  { id: 'win', x: 24, boxes: [['Winning party'], ['Forms government'], ['Formulates and', 'implements policies']] },
  { id: 'opp', x: 352, boxes: [['Opposition party'], ['Ensures accountability'], ['Debates and', 'committees']] },
];
const STEPS = [
  { t: ['Citizens'], y: 26 },
  { t: ['Political parties', 'organise public opinion'], y: 160 },
  { t: ['Contest elections', 'plan campaigns, prepare manifestos'], y: 294 },
];

export class PartyFlowScene extends SimScene {
  static BEAT_STEP_MAP = MAP;
  static HEIGHT = 456;
  static CONTROLS_IN_SIGHT = true;
  static ARIA_LABEL = 'A flow from citizens to political parties to contesting elections. Then it forks: the winning party forms government and makes policies; the opposition ensures accountability in debates and committees. Tap an event to see its path.';
  static CONTROLS = [{ ...tapLightControl({ id: 'lit', label: 'Event', chips: CHIPS }), options: CHIPS.map((x) => ({ value: x.id, label: x.label })) }];

  tl = tapLight({ chips: CHIPS });
  getControlValue(id) { return id === 'lit' ? this.tl.controlValue() : undefined; }
  onControlChange(id, v) { if (id === 'lit' && this._guard(id)) this.tl.fromControl(v); }
  isControlHidden(id) { return id === 'lit' && this.stage !== S_EVENT; }
  enter(stage) { this.tl.set({ lit: stage === S_EVENT ? 'policy' : null }); }
  busy() { return this.age < 1.3; }

  _up(ctx, c) {
    const a = this.age;
    day(ctx, c, 680, 456, { ground: 112, sun: false });
    STEPS.forEach((st, i) => {
      const k = pop(a, i * 0.18);
      ctx.save(); ctx.globalAlpha *= Math.min(1, k);
      if (i === 0) {
        ['elder', 'farmer', 'adult', 'student', 'worker', 'adult'].forEach((role, j) => folk(ctx, this, { role, x: 196 + j * 88, y: 136, height: 118, facing: 0, i: j + 1 }));
        label(ctx, c, 'Citizens', 84, 70, { size: 32, bg: hi(c), ink: c.label });
      } else {
        tile(ctx, c, 40, st.y, 600, 112, { fill: c.bgSurface });
        lines(ctx, c, st.t[0], 340, st.y + 38, { size: 34 });
        lines(ctx, c, st.t[1], 340, st.y + 80, { size: 26, display: false });
      }
      if (i < 2) { ctx.fillStyle = c.label; ctx.beginPath(); const y = st.y + (i === 0 ? 112 : 114); ctx.moveTo(322, y); ctx.lineTo(358, y); ctx.lineTo(340, y + 18); ctx.fill(); }
      ctx.restore();
    });
  }

  _fork(ctx, c) {
    const a = this.age, s = this.stage;
    day(ctx, c, 680, 456, { ground: 60, sun: false, hills: false });
    tile(ctx, c, 150, 8, 380, 56, { fill: c.bgSurface });
    lines(ctx, c, 'Contest elections', 340, 36, { size: 30 });
    ctx.strokeStyle = c.label; ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath(); ctx.moveTo(340, 66); ctx.lineTo(340, 84); ctx.moveTo(176, 102); ctx.lineTo(176, 84); ctx.lineTo(504, 84); ctx.lineTo(504, 102); ctx.stroke();
    PATHS.forEach((p, i) => {
      const tone = i ? c.water : c.gold;
      p.boxes.forEach((b, j) => {
        const y = 104 + j * 118, h = j === 2 ? 106 : 92, k = pop(a, 0.1 + j * 0.16);
        const lit = s === S_EVENT && this.tl.any() ? this.tl.has(p.id) : true;
        ctx.save(); ctx.globalAlpha *= Math.min(1, k) * (lit ? 1 : 0.32);
        tile(ctx, c, p.x, y, 304, h, { fill: mix(tone, c.bgSurface, j === 0 ? 0.6 : 0.78), rim: mix(tone, c.label, 0.4), lit: s === S_EVENT && j === 2 && lit });
        const word = s === S_EVENT && j === 2 ? this.tl.chip()?.id : null;
        if (word === 'policy' && i === 0) { ctx.fillStyle = hi(c); rr(ctx, p.x + 14, y + 10, 276, h - 20, 8); ctx.fill(); }
        if ((word === 'debate' || word === 'check') && i === 1) { ctx.fillStyle = hi(c); rr(ctx, p.x + (word === 'debate' ? 70 : 54), y + (word === 'debate' ? 14 : 54), word === 'debate' ? 164 : 196, 38, 8); ctx.fill(); }
        lines(ctx, c, b, p.x + 152, y + h / 2 - 2, { size: 28 });
        if (j < 2) { ctx.fillStyle = c.label; ctx.beginPath(); ctx.moveTo(p.x + 138, y + h + 6); ctx.lineTo(p.x + 166, y + h + 6); ctx.lineTo(p.x + 152, y + h + 22); ctx.fill(); }
        ctx.restore();
      });
    });
  }

  draw(ctx, c) { if (this.stage === S_UP) this._up(ctx, c); else this._fork(ctx, c); }
}
