// SocialMobilityScene - blk-l08-s06. One case at a time, tap to open, each marked on a to-scale
// date strip. Only cases from our source. The last beat keeps the plain limit.
import { SimScene } from 'simulations/base/kit/SimScene.js';
import { pill, inkOn, mix, rr, darken, chipRow } from 'simulations/base/kit/SimLook.js';
import { tapLight, tapLightControl } from 'simulations/base/kit/TapLight.js';
import { pal, panel, person } from '../shared/SstArt.js';
import { drawDateStrip } from '../shared/DateStrip.js';
import { copperPlate } from '../L05/OfficeBits.js';

const CHIPS = [
  { id: 'rul', label: 'Rulers', targets: ['rul'] },
  { id: 'man', label: 'Mandsaur', targets: ['man'] },
  { id: 'kar', label: 'Karitalai', targets: ['kar'] },
  { id: 'san', label: 'Sangam texts', targets: ['san'] },
];
const HOUSES = ['Nandas', 'Mauryas', '\u015Ahu\u1E45gas', 'Satav\u0101hanas', 'V\u0101k\u0101\u1E6Dakas', 'Guptas', 'Pu\u1E63hyabh\u016Btis'];
const STRIP = { from: -400, to: 700, marks: [
  { id: 'san', at: 0, when: '300 BCE to 300 CE', label: 'Sangam', tone: 3 },
  { id: 'man', at: 473, when: '473 CE', label: 'Mandsaur', tone: 2 },
  { id: 'kar', at: 490, when: 'late 5th c.', label: 'Karitalai', tone: 4 },
] };
const TRADES = ['merchants', 'salt-makers', 'fishermen', 'artisans', 'agriculturists', 'warriors'];
const TOLK = ['Arasar: kings', 'Vanigar: traders', 'Velar: farmers', 'Antanar: br\u0101hma\u1E47as'];
const MAN = { hairStyle: 'short', dupatta: false };
const one = (i) => [{ idx: i, dwellMs: null }];
const PRESET = ['rul', 'man', 'kar', 'san', null];

export class SocialMobilityScene extends SimScene {
  static BEAT_STEP_MAP = [one(0), one(1), one(2), one(3), one(4)];
  static VISUAL_PROFILE = 'rich';
  static IRIS = false;
  static CONTROLS_IN_SIGHT = true;
  static ARIA_LABEL = 'Cases of social mobility, one at a time, over a date strip: seven ruling houses; a guild of silk weavers who moved and had other skills; a copper plate recording brahmanas as land managers; Sangam texts with groups named by occupation. The last beat states a limit: some moved, which does not show that all could.';
  static CONTROLS = [tapLightControl({ id: 'lit', label: 'Open a case', chips: CHIPS, noneLabel: 'The limit' })];

  tl = tapLight({ label: 'Cases', chips: CHIPS });

  getControlValue(id) { return id === 'lit' ? this.tl.controlValue() : undefined; }
  enter(stage) { this.tl.set({ lit: PRESET[stage] }); this.requestUiUpdate?.(); }
  onControlChange(id, v) { if (id === 'lit') { this.tl.fromControl(v); this.requestUiUpdate?.(); } }

  draw(ctx, c, t) {
    const P = pal(c);
    ctx.fillStyle = P.sand; ctx.fillRect(0, 0, 680, 520);
    const lit = this.tl.lit()[0];
    panel(ctx, c, 14, 10, 652, 346, { fill: P.panel });
    if (lit === 'rul') this._rulers(ctx, c);
    else if (lit === 'man') this._guild(ctx, c, t);
    else if (lit === 'kar') this._plate(ctx, c, t);
    else if (lit === 'san') this._sangam(ctx, c);
    else this._limit(ctx, c, t);
    drawDateStrip(ctx, c, STRIP, { x: 26, y: 368, w: 628, size: 28, labelSize: 28, lit: lit && lit !== 'rul' ? [lit] : null });
  }

  _rulers(ctx, c) {
    pill(ctx, c, 'rulers from diverse backgrounds', 340, 50, { bg: c.gold, ink: inkOn(c, c.gold), size: 28, display: true });
    chipRow(ctx, c, HOUSES.map((h) => ({ text: h, bg: c.bgSurface, ink: c.label })), 340, 130, { align: 'center', size: 28, gap: 14, lineGap: 34, wrapAt: 590 });
  }

  _guild(ctx, c, t) {
    const P = pal(c);
    pill(ctx, c, 'Lata', 110, 52, { bg: c.bgSurface, ink: c.label, size: 28 });
    pill(ctx, c, 'Dashapura', 560, 52, { bg: c.bgSurface, ink: c.label, size: 28 });
    ctx.strokeStyle = P.earthDark; ctx.lineWidth = 6; ctx.setLineDash([14, 11]); ctx.beginPath(); ctx.moveTo(160, 52); ctx.lineTo(466, 52); ctx.stroke(); ctx.setLineDash([]);
    ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(452, 40); ctx.lineTo(470, 52); ctx.lineTo(452, 64); ctx.stroke();
    // a weaver with cloth on a frame
    const cloth = mix(c.s5, P.panel, 0.25);
    ctx.fillStyle = P.wood; rr(ctx, 60, 110, 12, 214, 4); ctx.fill(); rr(ctx, 248, 110, 12, 214, 4); ctx.fill(); rr(ctx, 48, 104, 226, 14, 6); ctx.fill();
    ctx.fillStyle = cloth; ctx.fillRect(74, 118, 172, 130);
    ctx.strokeStyle = darken(cloth, 0.2); ctx.lineWidth = 2;
    for (let x = 84; x < 240; x += 12) { ctx.beginPath(); ctx.moveTo(x, 118); ctx.lineTo(x, 248); ctx.stroke(); }
    person(ctx, this, { role: 'adult', x: 330, y: 348, height: 230, i: 4, t, facing: -1, look: MAN });
    pill(ctx, c, 'silk weaving', 530, 150, { bg: c.gold, ink: inkOn(c, c.gold), size: 30, display: true });
    pill(ctx, c, 'archery', 530, 220, { bg: c.gold, ink: inkOn(c, c.gold), size: 30, display: true });
    pill(ctx, c, 'astrology', 530, 290, { bg: c.gold, ink: inkOn(c, c.gold), size: 30, display: true });
  }

  _plate(ctx, c, t) {
    const P = pal(c);
    ctx.fillStyle = mix(P.leaf, P.grass, 0.4); rr(ctx, 380, 150, 266, 196, 16); ctx.fill();
    ctx.strokeStyle = alpha2(P); ctx.lineWidth = 4;
    for (let x = 410; x < 640; x += 38) { ctx.beginPath(); ctx.moveTo(x, 158); ctx.lineTo(x - 18, 338); ctx.stroke(); }
    copperPlate(ctx, c, 196, 200, 320, 200, -0.04);
    person(ctx, this, { role: 'adult', x: 514, y: 344, height: 200, i: 2, t, facing: -1, look: MAN });
    pill(ctx, c, 'land managers', 510, 62, { bg: c.gold, ink: inkOn(c, c.gold), size: 30, display: true });
  }

  _sangam(ctx, c) {
    pill(ctx, c, 'Tolkappiyam', 340, 44, { bg: c.gold, ink: inkOn(c, c.gold), size: 28, display: true });
    TOLK.forEach((s, i) => pill(ctx, c, s, 180 + (i % 2) * 320, 96 + Math.floor(i / 2) * 52, { bg: c.bgSurface, ink: c.label, size: 28 }));
    pill(ctx, c, 'Pattinappalai', 340, 216, { bg: c.gold, ink: inkOn(c, c.gold), size: 28, display: true });
    TRADES.forEach((s, i) => pill(ctx, c, s, 124 + (i % 3) * 216, 268 + Math.floor(i / 3) * 50, { bg: c.bgSurface, ink: c.label, size: 28 }));
  }

  _limit(ctx, c, t) {
    const n = [[110, 3], [190, 4], [270, 2], [350, 5], [430, 1], [510, 6], [590, 7]];
    n.forEach(([x, i], k) => {
      ctx.save(); if (k > 1) ctx.globalAlpha *= 0.34;
      person(ctx, this, { role: 'adult', x, y: 340, height: 180, i, t, facing: 1 });
      ctx.restore();
    });
    pill(ctx, c, 'some records of movement', 340, 46, { bg: c.gold, ink: inkOn(c, c.gold), size: 28 });
    pill(ctx, c, 'not proof that all could', 340, 104, { bg: c.bgSurface, ink: c.label, size: 28 });
  }

  destroy() { this.tl.destroy(); super.destroy(); }
}
const alpha2 = (P) => P.leafDark;
