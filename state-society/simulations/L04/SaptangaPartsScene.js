// SaptangaPartsScene - L04 s03. Seven drawn tiles for the seven limbs. Book names, one plain word
// each. One lights per chip. Beats: all, first three, other four, any. No rim, no seats.
import { SimScene } from 'simulations/base/kit/SimScene.js';
import { drawBackdrop, drawVignette, rr, mix, font } from 'simulations/base/kit/SimLook.js';
import { tapLight, tapLightControl } from 'simulations/base/kit/TapLight.js';
import { pal, panel, person, crown, hut, reading, MAN, TAU } from '../shared/SstArt.js';

const m = (idx) => [{ idx, dwellMs: null }];
const LIMBS = [
  { id: 'swami', name: 'sw\u0101mi', tag: 'the king', tone: 's2' },
  { id: 'amatya', name: 'am\u0101tya', tag: 'ministers', tone: 's5' },
  { id: 'janapada', name: 'janapada', tag: 'territory', tone: 's3' },
  { id: 'durga', name: 'durga', tag: 'forts', tone: 's8' },
  { id: 'kosha', name: 'ko\u1E63ha', tag: 'treasury', tone: 's2' },
  { id: 'danda', name: 'da\u1E47\u1E0Da', tag: 'forces', tone: 's6' },
  { id: 'mitra', name: 'mitra', tag: 'allies', tone: 's1' },
];
const CHIPS = LIMBS.map((l, i) => ({ id: l.id, label: l.name, targets: [l.id], tone: [2, 5, 3, 8, 2, 6, 1][i] }));
const POS = LIMBS.map((_, i) => (i < 4 ? { x: 10 + i * 166, y: 12 } : { x: 93 + (i - 4) * 166, y: 266 }));
const TW = 160, TH = 244;
const GROUP = [null, [0, 1, 2], [3, 4, 5, 6], null];

export class SaptangaPartsScene extends SimScene {
  static BEAT_STEP_MAP = [m(0), m(1), m(2), m(3)];
  static NOTE_STAGE = -1;
  static CONTROLS_IN_SIGHT = true;
  static ARIA_LABEL = 'Seven drawn tiles for the seven limbs of the state: swami the king, amatya the ministers, janapada the land and people, durga the forts, kosha the treasury, danda the forces and mitra the allies. A chip lights each one.';
  static CONTROLS = [tapLightControl({ id: 'lit', label: 'Limb', chips: CHIPS })];
  tl = tapLight({ chips: CHIPS });
  isControlHidden(id) { return id === 'lit' && this.stage !== 3; }
  getControlValue(id) { return id === 'lit' ? this.tl.controlValue() : undefined; }
  onControlChange(id, v) { if (id === 'lit') this.tl.fromControl(v); }
  enter() { this.tl.reset(); }

  _art(ctx, c, id, x, y) {
    const p = pal(c);
    if (id === 'swami') { person(ctx, this, { role: 'adult', x, y: y + 62, height: 140, i: 3, look: MAN }); crown(ctx, c, x, y - 78, 0.6); }
    if (id === 'amatya') { person(ctx, this, { role: 'elder', x: x - 30, y: y + 62, height: 128, i: 0, facing: 1, look: { hairStyle: 'crop' } }); person(ctx, this, { role: 'elder', x: x + 34, y: y + 62, height: 122, i: 2, facing: -1, look: { hairStyle: 'crop' } }); }
    if (id === 'janapada') { hut(ctx, c, x - 22, y + 18, 0.82); person(ctx, this, { role: 'farmer', x: x + 40, y: y + 62, height: 104, i: 4, look: MAN }); ctx.fillStyle = p.leaf; for (let k = 0; k < 5; k++) ctx.fillRect(x - 62 + k * 18, y + 44, 8, 18); }
    if (id === 'durga') {
      rr(ctx, x - 62, y - 34, 124, 96, 4); ctx.fillStyle = p.stone; ctx.fill(); ctx.strokeStyle = p.stoneDark; ctx.lineWidth = 2; ctx.stroke();
      for (let k = 0; k < 4; k++) { ctx.fillStyle = p.stone; ctx.fillRect(x - 62 + k * 37, y - 54, 24, 22); }
      rr(ctx, x - 16, y + 10, 32, 52, 14); ctx.fillStyle = p.earthDark; ctx.fill();
    }
    if (id === 'kosha') {
      rr(ctx, x - 58, y - 12, 116, 72, 10); ctx.fillStyle = p.wood; ctx.fill();
      ctx.beginPath(); ctx.moveTo(x - 58, y - 12); ctx.quadraticCurveTo(x, y - 62, x + 58, y - 12); ctx.closePath(); ctx.fillStyle = p.woodLight; ctx.fill();
      for (const [dx, dy] of [[-30, -24], [0, -32], [30, -24]]) { ctx.beginPath(); ctx.arc(x + dx, y + dy, 13, 0, TAU); ctx.fillStyle = c.gold; ctx.fill(); ctx.strokeStyle = p.earthDark; ctx.stroke(); }
      rr(ctx, x - 10, y - 2, 20, 20, 4); ctx.fillStyle = c.gold; ctx.fill();
    }
    if (id === 'danda') {
      [-36, 34].forEach((dx, i) => {
        person(ctx, this, { role: 'adult', x: x + dx, y: y + 62, height: 122, i: 5 + i, look: MAN });
        ctx.strokeStyle = p.wood; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(x + dx + 26, y + 62); ctx.lineTo(x + dx + 26, y - 80); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x + dx + 26, y - 96); ctx.lineTo(x + dx + 19, y - 78); ctx.lineTo(x + dx + 33, y - 78); ctx.closePath(); ctx.fillStyle = p.stoneDark; ctx.fill();
      });
    }
    if (id === 'mitra') { person(ctx, this, { role: 'adult', x: x - 36, y: y + 62, height: 130, pose: 'point', facing: 1, i: 3, look: MAN }); person(ctx, this, { role: 'adult', x: x + 36, y: y + 62, height: 130, pose: 'point', facing: -1, i: 7, look: MAN }); }
  }

  draw(ctx, c) {
    drawBackdrop(ctx, c, 'dots');
    const grp = GROUP[this.stage];
    LIMBS.forEach((L, i) => {
      const P = POS[i], lit = this.tl.has(L.id) || (grp?.includes(i) ?? false);
      const off = this.tl.off(L.id) || (grp && !grp.includes(i));
      panel(ctx, c, P.x, P.y, TW, TH, { fill: mix(c.bgSurface, c[L.tone], 0.14), lit, litCol: c[L.tone], off });
      ctx.save(); if (off) ctx.globalAlpha = 0.34;
      this._art(ctx, c, L.id, P.x + TW / 2, P.y + 96);
      ctx.restore();
      reading(ctx, c, L.name, P.x + TW / 2, P.y + 186, 27, off ? c.labelMuted : c.label);
      ctx.font = font(c, 800, 28); ctx.textAlign = 'center'; ctx.fillStyle = c.labelMuted; ctx.fillText(L.tag, P.x + TW / 2, P.y + 220);
    });
    drawVignette(ctx, c, 0.25);
  }
}
