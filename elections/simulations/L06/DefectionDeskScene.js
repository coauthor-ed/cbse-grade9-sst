// DefectionDeskScene - L06 s05. Beat 0 many parties, a person free to move between them. Beat 1 a member
// elected on Party A's ticket: two ways of defecting, by tap. Beat 2 the book's two readings, by tap,
// neither favoured. Beat 3 the law: two actions, then the Speaker or Chairman decides.
import { SimScene } from 'simulations/base/kit/SimScene.js';
import { tapLight, tapLightControl } from 'simulations/base/kit/TapLight.js';
import { drawCivic } from '../shared/CivicArt.js';
import { day, folk, pop, label, tile, say, lines, rr, mix, tones, hi } from './PartyWorld.js';

const WAYS = [
  { id: 'join', label: 'Joins another party', targets: ['join'] },
  { id: 'vote', label: 'Votes against the party', targets: ['vote'] },
];
const READ = [
  { id: 'discipline', label: 'Party discipline', targets: ['discipline'] },
  { id: 'conscience', label: 'Conscience', targets: ['conscience'] },
];
const S_FREE = 0, S_WAYS = 1, S_READ = 2, S_LAW = 3;
const MAP = [S_FREE, S_WAYS, S_READ, S_LAW].map((idx) => [{ idx, dwellMs: null }]);
const G = 300;

export class DefectionDeskScene extends SimScene {
  static BEAT_STEP_MAP = MAP;
  static HEIGHT = 456;
  static CONTROLS_IN_SIGHT = true;
  static ARIA_LABEL = 'Five party groups, and a person who may walk from one to another. Then a member elected on the Party A ticket, who may join another party or vote against the party. Then two readings of that act. Then the 1985 law: the Speaker or Chairman decides.';
  static CONTROLS = [
    { ...tapLightControl({ id: 'way', label: 'Way', chips: WAYS }), options: WAYS.map((x) => ({ value: x.id, label: x.label })) },
    { ...tapLightControl({ id: 'read', label: 'Reading', chips: READ }), options: READ.map((x) => ({ value: x.id, label: x.label })) },
  ];

  way = tapLight({ chips: WAYS });
  read = tapLight({ chips: READ });
  getControlValue(id) { return id === 'way' ? this.way.controlValue() : id === 'read' ? this.read.controlValue() : undefined; }
  onControlChange(id, v) { if (!this._guard(id)) return; if (id === 'way') this.way.fromControl(v); if (id === 'read') this.read.fromControl(v); }
  isControlHidden(id) { return (id === 'way' && this.stage !== S_WAYS) || (id === 'read' && this.stage !== S_READ); }
  enter() { this.way.set({ lit: 'join' }); this.read.set({ lit: 'discipline' }); }
  busy() { return this.age < 1.6; }

  _house(ctx, c) {
    const t = tones(c);
    ctx.fillStyle = mix(t.wood, c.bgSurface, 0.55); ctx.fillRect(0, 0, 680, 456);
    ctx.fillStyle = t.plaster; ctx.fillRect(0, 0, 680, 150);
    ctx.fillStyle = mix(t.ground, c.bgSurface, 0.1); ctx.fillRect(0, 150, 680, 306);
  }

  draw(ctx, c) {
    const s = this.stage, a = this.age, t = tones(c);
    if (s === S_FREE) {
      day(ctx, c, 680, 456, { ground: G });
      ['Party A', 'Party B', 'Party C', 'Party D', 'Party E'].forEach((p, i) => {
        const x = 70 + i * 135, k = pop(a, i * 0.1);
        ctx.save(); ctx.globalAlpha *= Math.min(1, k);
        ['adult', 'elder'].forEach((role, j) => folk(ctx, this, { role, x: x - 22 + j * 44, y: 250 - (i % 2) * 6, height: 112, i: i + j * 3 + 1 }));
        ctx.restore();
        label(ctx, c, p, x, 112 - (i % 2) * 44, { size: 26, scale: k });
      });
      const u = Math.min(1, Math.max(0, (a - 0.5) / 0.9)), x = 200 + u * 160;
      folk(ctx, this, { role: 'student', x, y: 420, height: 150, pose: u > 0 && u < 1 ? 'walk' : 'stand', facing: 1, i: 6, walk: u * 6 });
      ctx.strokeStyle = c.label; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.setLineDash([4, 14]); ctx.beginPath(); ctx.moveTo(200, 436); ctx.lineTo(420, 436); ctx.stroke(); ctx.setLineDash([]);
      label(ctx, c, 'Free to move', 546, 372, { size: 28, bg: hi(c), ink: c.label });
    } else if (s === S_WAYS) {
      this._house(ctx, c);
      const w = this.way.chip()?.id ?? 'join';
      drawCivic(ctx, c, 'parliament', 340, 140, { w: 250 });
      folk(ctx, this, { role: 'adult', x: 180, y: 396, height: 210, pose: w === 'vote' ? 'stand' : 'walk', facing: 1, i: 1 });
      label(ctx, c, 'Elected on the Party A ticket', 340, 432, { size: 26 });
      if (w === 'join') {
        tile(ctx, c, 372, 214, 268, 120, { fill: c.bgSurface, lit: true });
        lines(ctx, c, ['Leaves Party A', 'and joins Party B'], 506, 274, { size: 28 });
      } else {
        tile(ctx, c, 372, 214, 268, 120, { fill: c.bgSurface, lit: true });
        lines(ctx, c, ['Party says: Yes', 'Member votes: No'], 506, 274, { size: 28 });
      }
      label(ctx, c, 'Defection', 506, 382, { size: 34, bg: hi(c), ink: c.label });
    } else if (s === S_READ) {
      this._house(ctx, c);
      folk(ctx, this, { role: 'adult', x: 340, y: 150, height: 130, i: 1, mood: 'think' });
      const r = this.read.chip()?.id ?? 'discipline';
      [
        { id: 'discipline', x: 18, title: 'Seen as', big: 'Political opportunism', sub: 'discipline, stability' },
        { id: 'conscience', x: 346, title: 'Seen as', big: 'Upholding conscience', sub: 'changing expectations' },
      ].forEach((k) => {
        const on = r === k.id;
        ctx.save(); ctx.globalAlpha *= on ? 1 : 0.4;
        tile(ctx, c, k.x, 186, 316, 200, { fill: c.bgSurface, lit: on });
        say(ctx, c, k.title, k.x + 158, 222, { size: 26, display: false });
        lines(ctx, c, k.big.split(' '), k.x + 158, 276, { size: 34 });
        say(ctx, c, k.sub, k.x + 158, 352, { size: 25, display: false });
        ctx.restore();
      });
      label(ctx, c, 'One act, two views', 340, 420, { size: 28 });
    } else {
      this._house(ctx, c);
      tile(ctx, c, 18, 18, 300, 112, { fill: c.bgSurface });
      say(ctx, c, '1985', 168, 58, { size: 48 });
      say(ctx, c, '52nd Amendment', 168, 104, { size: 26, display: false });
      ['Gives up membership', 'Votes against the whip'].forEach((text, i) => label(ctx, c, text, 180, 190 + i * 56, { size: 28, scale: pop(a, 0.2 + i * 0.16) }));
      label(ctx, c, 'Can be disqualified', 180, 340, { size: 28, bg: hi(c), ink: c.label, scale: pop(a, 0.6) });
      ctx.fillStyle = t.wood; rr(ctx, 470, 180, 156, 200, 14); ctx.fill();
      ctx.fillStyle = mix(t.wood, c.bgSurface, 0.3); rr(ctx, 450, 300, 196, 92, 10); ctx.fill();
      folk(ctx, this, { role: 'teacher', x: 540, y: 396, height: 226, pose: 'point', facing: -1, i: 7 });
      label(ctx, c, 'Speaker or Chairman decides', 340, 428, { size: 28, scale: pop(a, 0.8) });
    }
  }
}
