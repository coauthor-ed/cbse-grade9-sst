// TamilakamScene - L02 s07. The peninsula fills the stage. b0 chips name the Satavahanas and the
// four southern polities, tap to find. b1 three big emblems. b2 the early kingdoms held apart
// from the later imperial ones. Emblems are drawn big; the animal is an ordinary animal.
import { SimScene } from 'simulations/base/kit/SimScene.js';
import { pill, mix } from 'simulations/base/kit/SimLook.js';
import { GEO_COLOR_MAP } from 'simulations/base/kit/GeoLook.js';
import { drawAnimal, animalLook } from 'simulations/base/kit/SimAnimal.js';
import { tapLight, tapLightControl } from 'simulations/base/kit/TapLight.js';
import { loadSstMap, sstFullView, drawSstFull } from './SstMapBase.js';
import { panel, reading } from '../shared/SstArt.js';

const m = (idx) => [{ idx, dwellMs: null }];
const EXT = [[70, 7], [92, 22]];
const PLACES = [
  { id: 'sata', label: 'Satav\u0101hanas', at: [76.5, 18.3], tone: 's5', tl: 5 },
  { id: 'chola', label: 'Cholas', at: [79.2, 11.1], tone: 's6', tl: 6 },
  { id: 'pandya', label: 'Pandyas', at: [78.0, 9.5], tone: 's1', tl: 1 },
  { id: 'kerala', label: 'Keralaputras', at: [76.2, 10.4], tone: 's8', tl: 8 },
  { id: 'satiya', label: 'Satiyaputras', at: [79.2, 12.9], tone: 's3', tl: 3 },
];
const CHIPS = PLACES.map((p) => ({ id: p.id, label: p.label, targets: [p.id], tone: p.tl }));
const EMB = [{ id: 'chola', name: 'Cholas', word: 'tiger', tone: 's6', y: 26 }, { id: 'chera', name: 'Cheras', word: 'bow', tone: 's8', y: 182 }, { id: 'pandya', name: 'Pandyas', word: 'fish', tone: 's1', y: 338 }];

export class TamilakamScene extends SimScene {
  static BEAT_STEP_MAP = [m(0), m(1), m(2)];
  static COLOR_MAP = GEO_COLOR_MAP;
  static NOTE_STAGE = -1;
  static CONTROLS_IN_SIGHT = true;
  static ARIA_LABEL = 'A map of the peninsula with the Satavahanas in the Deccan and the Cholas, Pandyas, Keralaputras and Satiyaputras in the south. Then three large emblems: tiger for the Cholas, bow for the Cheras, fish for the Pandyas. Last, the early kingdoms are set apart from the later imperial kingdoms.';
  static CONTROLS = [tapLightControl({ id: 'lit', label: 'Find', chips: CHIPS })];
  tl = tapLight({ chips: CHIPS });
  isControlHidden(id) { return id === 'lit' && this.stage !== 0; }
  getControlValue(id) { return id === 'lit' ? this.tl.controlValue() : undefined; }
  onControlChange(id, v) { if (id === 'lit') this.tl.fromControl(v); }
  async setup() { this.map = await loadSstMap(); await super.setup(); await sstFullView(this, EXT); this.animateFor?.(400); }
  enter() { this.tl.reset(); }

  _emblem(ctx, c, E, x, y, s) {
    if (E.word === 'tiger') { drawAnimal(ctx, c, { kind: 'tiger', x: x - 8, y: y + 44 * s, length: 110 * s, facing: 1, pose: 'stand' }, animalLook(c, 'tiger', {})); return; }
    ctx.lineCap = 'round';
    if (E.word === 'bow') {
      ctx.strokeStyle = mix(c.s8, c.label, 0.4); ctx.lineWidth = 9 * s;
      ctx.beginPath(); ctx.arc(x - 30 * s, y, 60 * s, -1.05, 1.05); ctx.stroke();
      ctx.strokeStyle = c.label; ctx.lineWidth = 2.5 * s; ctx.beginPath(); ctx.moveTo(x - 30 * s + 60 * s * Math.cos(1.05), y - 60 * s * Math.sin(1.05)); ctx.lineTo(x - 30 * s + 60 * s * Math.cos(1.05), y + 60 * s * Math.sin(1.05)); ctx.stroke();
      ctx.strokeStyle = c.gold; ctx.lineWidth = 5 * s; ctx.beginPath(); ctx.moveTo(x - 62 * s, y); ctx.lineTo(x + 56 * s, y); ctx.stroke();
      return;
    }
    ctx.fillStyle = c.s1;
    ctx.beginPath(); ctx.moveTo(x - 66 * s, y); ctx.quadraticCurveTo(x - 10 * s, y - 50 * s, x + 44 * s, y - 2 * s); ctx.lineTo(x + 74 * s, y - 28 * s); ctx.lineTo(x + 70 * s, y + 28 * s); ctx.lineTo(x + 44 * s, y + 2 * s); ctx.quadraticCurveTo(x - 10 * s, y + 50 * s, x - 66 * s, y); ctx.fill();
    ctx.beginPath(); ctx.arc(x - 38 * s, y - 6 * s, 5 * s, 0, 7); ctx.fillStyle = c.bgSurface; ctx.fill();
  }

  draw(ctx, c) {
    if (!drawSstFull(ctx, c, this)) return;
    const v = this.view, st = this.stage;
    if (st === 0) {
      const lit = this.tl.lit()[0];
      for (const P of PLACES) {
        const q = v.at(P.at), off = lit && lit !== P.id, on = lit === P.id;
        ctx.beginPath(); ctx.arc(q[0], q[1], on ? 15 : 10, 0, 7); ctx.fillStyle = c[P.tone]; ctx.globalAlpha = off ? 0.35 : 1; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = c.bgSurface; ctx.stroke(); ctx.globalAlpha = 1;
        if (on) pill(ctx, c, P.label, Math.min(530, q[0] + 96), q[1] - 34, { size: 28, bg: c[P.tone], display: true });
      }
      if (!lit) pill(ctx, c, 'The Deccan and the far south', 470, 70, { size: 28, bg: c.gold, display: true });
      return;
    }
    if (st === 1) {
      EMB.forEach((E) => {
        panel(ctx, c, 390, E.y, 276, 148, { fill: mix(c.bgSurface, c[E.tone], 0.14) });
        this._emblem(ctx, c, E, 470, E.y + 72, 0.76);
        reading(ctx, c, E.name, 592, E.y + 54, 28);
        reading(ctx, c, E.word, 592, E.y + 94, 28, c.labelMuted);
      });
      return;
    }
    panel(ctx, c, 330, 40, 336, 196, { fill: mix(c.bgSurface, c.gold, 0.2), lit: true, litCol: c.gold });
    reading(ctx, c, 'Early kingdoms', 498, 92, 30);
    reading(ctx, c, 'Sangam poems', 498, 138, 28, c.labelMuted);
    reading(ctx, c, '300 BCE to 300 CE', 498, 188, 28);
    panel(ctx, c, 330, 268, 336, 196, { fill: mix(c.bgSurface, c.stroke, 0.2) });
    reading(ctx, c, 'Later imperial', 498, 318, 30);
    reading(ctx, c, 'Chola, Chera, Pandya', 498, 364, 28, c.labelMuted);
    reading(ctx, c, 'many centuries later', 498, 414, 28);
  }
}
