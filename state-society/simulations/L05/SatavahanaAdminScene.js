// SatavahanaAdminScene - blk-l05-s05. Three levels of the Satavahana empire, then three officers
// with three jobs, then the king over all of them. A to-scale date strip shows nearly 500 years.
import { SimScene } from 'simulations/base/kit/SimScene.js';
import { font, pill, inkOn } from 'simulations/base/kit/SimLook.js';
import { tapLight, tapLightControl } from 'simulations/base/kit/TapLight.js';
import { pal, panel, person, crown, hut } from '../shared/SstArt.js';
import { drawDateStrip } from '../shared/DateStrip.js';
import { officerTile, MAN } from './OfficeBits.js';

const CASES = [
  { id: 'case', label: 'A case to judge', targets: ['pradeshika'] },
  { id: 'city', label: 'Trouble in a city', targets: ['city'] },
  { id: 'village', label: 'A village matter', targets: ['gramika'] },
];
const STRIP = { from: -300, to: 400, marks: [
  { id: 'start', at: -180, when: '2nd c. BCE', label: 'begins', tone: 2 },
  { id: 'end', at: 250, when: '3rd c. CE', label: 'ends', tone: 2 },
], spans: [{ from: -180, to: 250, label: 'nearly 500 years', tone: 'accent' }] };
const TILES = [
  { key: 'pradeshika', label: 'prade\u015Bhika', sub: 'judicial, admin', i: 3 },
  { key: 'city', label: 'city governor', sub: 'revenue, order', i: 4, size: 28 },
  { key: 'gramika', label: 'gr\u0101mika', sub: 'leads a village', i: 5, role: 'elder' },
];
const one = (i) => [{ idx: i, dwellMs: null }];

export class SatavahanaAdminScene extends SimScene {
  static BEAT_STEP_MAP = [one(0), one(1), one(2)];
  static VISUAL_PROFILE = 'rich';
  static IRIS = false;
  static CONTROLS_IN_SIGHT = true;
  static ARIA_LABEL = 'The Satavahana empire in three levels: the king, the aharas with their ministers, and villages under a headman, with a date strip of nearly 500 years. Then three officers, each lit by the case that goes to that officer. Then the king above all of them.';
  static CONTROLS = [tapLightControl({ id: 'lit', label: 'Which case?', chips: CASES, noneLabel: 'None' })];

  tl = tapLight({ label: 'Cases', chips: CASES });

  constructor(container, config) { super(container, config); this._seen = new Set(); }

  isControlHidden(id) { return id === 'lit' && this.stage !== 1; }
  getControlValue(id) { return id === 'lit' ? this.tl.controlValue() : undefined; }
  enter() { this.tl.set({ lit: null }); this._seen = new Set(); this.requestUiUpdate?.(); }

  onControlChange(id, v) {
    if (id !== 'lit') return;
    this.tl.fromControl(v);
    const t = this.tl.lit()[0];
    if (t) {
      this._seen.add(t);
      if (this._seen.size === 3 && !this._done) { this._done = true; this.celebrate(340, 280, 18); }
    }
    this.requestUiUpdate?.();
  }

  draw(ctx, c, t) {
    const P = pal(c);
    ctx.fillStyle = P.sand; ctx.fillRect(0, 0, 680, 520);
    ctx.fillStyle = P.grass; ctx.fillRect(0, 430, 680, 90);
    if (this.stage === 0) this._levels(ctx, c, t);
    else if (this.stage === 1) this._jobs(ctx, c, t);
    else this._king(ctx, c, t);
  }

  _levels(ctx, c, t) {
    const P = pal(c);
    const row = (y, title, sub, art) => {
      panel(ctx, c, 24, y, 632, 112, { fill: P.panel });
      art(y);
      ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillStyle = c.label;
      ctx.font = font(c, 700, 34, true); ctx.fillText(title, 190, y + 40);
      ctx.font = font(c, 700, 28); ctx.fillStyle = c.labelMuted; ctx.fillText(sub, 190, y + 80);
    };
    row(12, 'The king', 'supreme authority', (y) => {
      person(ctx, this, { role: 'elder', x: 106, y: y + 106, height: 96, i: 2, t, look: MAN });
      crown(ctx, c, 106, y + 8, 0.7);
    });
    row(132, '\u0101\u1E25\u0101ra', 'division, with am\u0101tyas', (y) => {
      person(ctx, this, { role: 'adult', x: 76, y: y + 106, height: 92, i: 3, t, look: MAN });
      person(ctx, this, { role: 'adult', x: 134, y: y + 106, height: 92, i: 4, t, look: MAN });
    });
    row(252, 'village', 'led by the gr\u0101mika', (y) => {
      hut(ctx, c, 134, y + 100, 0.8);
      person(ctx, this, { role: 'elder', x: 70, y: y + 106, height: 92, i: 5, t, look: MAN });
    });
    drawDateStrip(ctx, c, STRIP, { x: 40, y: 374, w: 600, size: 28, lit: null });
  }

  _jobs(ctx, c, t) {
    const lit = this.tl.lit()[0];
    TILES.forEach((b, i) => {
      officerTile(ctx, this, c, t, { ...b, x: 18 + i * 218, y: 40, w: 208, h: 372, fig: 262, lit: lit === b.key, off: lit && lit !== b.key, subSize: 29, subY: 58 });
    });
    if (!lit) pill(ctx, c, 'Tap a case', 340, 462, { bg: c.gold, ink: inkOn(c, c.gold), size: 30 });
    else pill(ctx, c, CASES.find((k) => k.targets[0] === lit).label, 340, 462, { bg: c.accent, ink: inkOn(c, c.accent), size: 30 });
  }

  _king(ctx, c, t) {
    const P = pal(c);
    panel(ctx, c, 180, 12, 320, 232, { fill: P.panel, lit: true, litCol: c.gold });
    person(ctx, this, { role: 'elder', x: 340, y: 196, height: 150, i: 2, t, look: MAN });
    crown(ctx, c, 340, 38, 0.9);
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = c.label;
    ctx.font = font(c, 700, 28, true); ctx.fillText('supreme authority', 340, 222);
    ctx.strokeStyle = c.stroke; ctx.lineWidth = 6; ctx.lineCap = 'round';
    for (const x of [140, 340, 540]) { ctx.beginPath(); ctx.moveTo(340, 248); ctx.lineTo(x, 288); ctx.stroke(); }
    ctx.lineCap = 'butt';
    TILES.forEach((b, i) => officerTile(ctx, this, c, t, { ...b, sub: '', x: 40 + i * 208, y: 290, w: 192, h: 176, fig: 112, size: 28 }));
    pill(ctx, c, 'daily work of government', 340, 494, { bg: c.gold, ink: inkOn(c, c.gold), size: 28 });
  }

  destroy() { this.tl.destroy(); super.destroy(); }
}
