// KingsOathScene - blk-l07-s04. Three kinds of evidence, one at a time, tap to open, on a to-scale
// date strip. The literary works are not on the strip: our source gives them no date.
import { SimScene } from 'simulations/base/kit/SimScene.js';
import { pill, inkOn, rr, mix, font, alpha, darken, chipRow } from 'simulations/base/kit/SimLook.js';
import { tapLight, tapLightControl } from 'simulations/base/kit/TapLight.js';
import { pal, panel, boulderPath } from '../shared/SstArt.js';
import { drawDateStrip } from '../shared/DateStrip.js';

const CHIPS = [
  { id: 'asoka', label: 'A\u015Bhoka', targets: ['asoka'] },
  { id: 'utt', label: 'Uttaramerur', targets: ['utt'] },
  { id: 'lit', label: 'Literary works', targets: ['lit'] },
];
const STRIP = { from: -350, to: 1050, marks: [
  { id: 'asoka', at: -250, when: '3rd c. BCE', label: 'A\u015Bhoka', tone: 2 },
  { id: 'utt', at: 950, when: '10th c. CE', label: 'Uttaramerur', tone: 3 },
], spans: [{ from: -250, to: 950, label: 'about 1200 years', tone: 'accent' }] };
const ASOKA = ['moral conduct', 'respect in the family', 'ethical everyday life', 'non-violence', 'compassion'];
const one = (i) => [{ idx: i, dwellMs: null }];
const PRESET = ['asoka', 'utt', 'lit'];

export class KingsOathScene extends SimScene {
  static BEAT_STEP_MAP = [one(0), one(1), one(2)];
  static VISUAL_PROFILE = 'rich';
  static IRIS = false;
  static CONTROLS_IN_SIGHT = true;
  static ARIA_LABEL = 'Three kinds of evidence. A rock with an edict of Ashoka and what it emphasised; a temple wall with the Uttaramerur rule for candidates; two palm-leaf books, the Nitisara and the Kadambari. A date strip shows Ashoka and Uttaramerur to scale.';
  static CONTROLS = [tapLightControl({ id: 'lit', label: 'Open a record', chips: CHIPS, noneLabel: 'None' })];

  tl = tapLight({ label: 'Records', chips: CHIPS });

  getControlValue(id) { return id === 'lit' ? this.tl.controlValue() : undefined; }
  enter(stage) { this.tl.set({ lit: PRESET[stage] }); this.requestUiUpdate?.(); }
  onControlChange(id, v) { if (id === 'lit') { this.tl.fromControl(v); this.requestUiUpdate?.(); } }

  draw(ctx, c) {
    const P = pal(c);
    ctx.fillStyle = P.sand; ctx.fillRect(0, 0, 680, 520);
    const lit = this.tl.lit()[0];
    panel(ctx, c, 14, 10, 652, 346, { fill: P.panel });
    if (lit === 'asoka') this._rock(ctx, c);
    else if (lit === 'utt') this._wall(ctx, c);
    else if (lit === 'lit') this._books(ctx, c);
    else pill(ctx, c, 'Open a record', 340, 180, { bg: c.gold, ink: inkOn(c, c.gold), size: 32, display: true });
    drawDateStrip(ctx, c, STRIP, { x: 40, y: 374, w: 600, size: 28, lit: lit && lit !== 'lit' ? [lit] : null });
  }

  _rock(ctx, c) {
    const P = pal(c), st = mix(P.sand, P.sandDark, 0.55);
    boulderPath(ctx, 174, 200, 142, 142, 9);
    ctx.fillStyle = st; ctx.fill(); ctx.strokeStyle = darken(st, 0.3); ctx.lineWidth = 5; ctx.stroke();
    ctx.strokeStyle = darken(st, 0.4); ctx.lineWidth = 4; ctx.lineCap = 'round';
    for (let r = 0; r < 7; r++) {
      ctx.setLineDash([10, 6, 4, 7]); ctx.lineDashOffset = r * 5;
      ctx.beginPath(); ctx.moveTo(84, 124 + r * 26); ctx.lineTo(264, 124 + r * 26); ctx.stroke();
    }
    ctx.setLineDash([]); ctx.lineCap = 'butt';
    pill(ctx, c, 'dhamma', 174, 44, { bg: c.gold, ink: inkOn(c, c.gold), size: 32, display: true });
    ASOKA.forEach((s, i) => pill(ctx, c, s, 492, 60 + i * 62, { bg: c.bgSurface, ink: c.label, size: 28 }));
  }

  _wall(ctx, c) {
    const P = pal(c), st = mix(P.sand, P.sandDark, 0.4);
    ctx.fillStyle = st; rr(ctx, 34, 28, 612, 310, 12); ctx.fill();
    ctx.strokeStyle = alpha(darken(st, 0.4), 0.45); ctx.lineWidth = 3;
    for (let y = 76; y < 330; y += 52) { ctx.beginPath(); ctx.moveTo(40, y); ctx.lineTo(640, y); ctx.stroke(); }
    for (let r = 0; r < 6; r++) for (let x = 60 + (r % 2) * 50; x < 640; x += 100) { ctx.beginPath(); ctx.moveTo(x, 24 + r * 52); ctx.lineTo(x, 76 + r * 52); ctx.stroke(); }
    pill(ctx, c, 'candidates should have', 340, 72, { bg: c.bgSurface, ink: c.label, size: 28 });
    pill(ctx, c, '"honest earnings"', 340, 158, { bg: c.gold, ink: inkOn(c, c.gold), size: 40, display: true });
    pill(ctx, c, 'and be "pure" of mind', 340, 248, { bg: c.gold, ink: inkOn(c, c.gold), size: 36, display: true });
  }

  _books(ctx, c) {
    const P = pal(c);
    [['N\u012Btis\u0101ra', 'K\u0101mandaka', 110], ['K\u0101dambar\u012B', 'B\u0101\u1E47abha\u1E6D\u1E6Da', 214]].forEach(([a, b, y]) => {
      ctx.fillStyle = P.palmEdge; rr(ctx, 60, y + 3, 560, 86, 16); ctx.fill(); ctx.fillStyle = P.palm; rr(ctx, 60, y, 560, 86, 16); ctx.fill();
      ctx.fillStyle = c.label; ctx.textBaseline = 'middle'; ctx.textAlign = 'center';
      ctx.font = font(c, 700, 36, !/\u012B/.test(a)); ctx.fillText(a, 340, y + 30);
      ctx.font = font(c, 700, 28); ctx.fillStyle = P.ink; ctx.fillText(b, 340, y + 64);
    });
    pill(ctx, c, 'advice on kingship and governance', 340, 58, { bg: c.gold, ink: inkOn(c, c.gold), size: 28 });
    chipRow(ctx, c, [{ text: 'different periods', bg: c.bgSurface, ink: c.label }], 340, 326, { align: 'center', size: 28 });
  }

  destroy() { this.tl.destroy(); super.destroy(); }
}
