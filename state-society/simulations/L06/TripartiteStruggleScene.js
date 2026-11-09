// TripartiteStruggleScene - blk-l06-s05. The map fills the stage. Three coloured reaches meet at
// Kannauj; below the fighting, each realm keeps its villages. No modern border is drawn.
//   b0 Kannauj and the Gurjara-Pratiharas   b1 three powers, tap a name   b2 the villages in all three
import { SimScene } from 'simulations/base/kit/SimScene.js';
import { pill, inkOn, alpha } from 'simulations/base/kit/SimLook.js';
import { GEO_COLOR_MAP } from 'simulations/base/kit/GeoLook.js';
import { tapLight, tapLightControl } from 'simulations/base/kit/TapLight.js';
import { loadSstMap, sstFullView, drawSstFull } from '../L02/SstMapBase.js';
import { hut } from '../shared/SstArt.js';

const KANNAUJ = [79.9, 27.05];
const POWERS = [
  { id: 'gp', name: 'Gurjara-Pratih\u0101ras', key: 's1', ring: [[68.5, 24.5], [70, 29], [73.5, 30.5], [77, 31], [81, 30], [82.3, 27], [81.5, 24.5], [78.5, 23], [74, 22.5], [70.5, 22.6]], tag: [74.0, 26.2], from: [74.5, 26] },
  { id: 'pala', name: 'P\u0101las', key: 's2', ring: [[82.6, 25.2], [83.5, 26.8], [86, 27.3], [88.8, 26.8], [89.6, 25], [89, 22.6], [87, 21.6], [84.6, 22], [83, 23.2]], tag: [86.2, 24.3], from: [85.8, 25] },
  { id: 'rash', name: 'R\u0101\u1E63h\u1E6Drak\u016B\u1E6Das', key: 's3', ring: [[73.3, 20.4], [75, 21.2], [77.5, 21], [80, 20.2], [80.6, 18.5], [80, 16], [79, 14.2], [77.5, 13], [75.5, 13], [74, 15], [73.2, 17.5]], tag: [76.9, 17.3], from: [77, 20] },
];
const CHIPS = POWERS.map((p) => ({ id: p.id, label: p.name, targets: [p.id] }));
const VILLAGES = { gp: [[72, 24], [74.5, 28.8], [77.5, 24.6]], pala: [[84.8, 23.2], [87.8, 26]], rash: [[75.8, 15], [78.8, 19.6], [74.8, 19.6]] };
const one = (i) => [{ idx: i, dwellMs: null }];

export class TripartiteStruggleScene extends SimScene {
  static BEAT_STEP_MAP = [one(0), one(1), one(2)];
  static COLOR_MAP = GEO_COLOR_MAP;
  static IRIS = false;
  static CONTROLS_IN_SIGHT = true;
  static ARIA_LABEL = 'A map of the subcontinent with Kannauj marked. The Gurjara-Pratihara lands lie in the north and west, the Pala lands in the east and the Rashtrakuta lands in the Deccan, and an arrow from each reaches Kannauj. On the last beat small villages appear inside all three.';
  static CONTROLS = [tapLightControl({ id: 'lit', label: 'Power', chips: CHIPS, noneLabel: 'All' })];

  tl = tapLight({ label: 'Powers', chips: CHIPS });

  isControlHidden(id) { return id === 'lit' && this.stage !== 1; }
  getControlValue(id) { return id === 'lit' ? this.tl.controlValue() : undefined; }
  enter() { this.tl.set({ lit: null }); this.requestUiUpdate?.(); }
  onControlChange(id, v) { if (id === 'lit') { this.tl.fromControl(v); this.requestUiUpdate?.(); } }

  async setup() {
    this.map = await loadSstMap();
    await super.setup();
    await sstFullView(this, [[66, 11], [94, 33]]);
    this.animateFor(500);
  }

  draw(ctx, c) {
    if (!this.view && !this.fv) { ctx.fillStyle = c.bgSurface; ctx.fillRect(0, 0, 680, 520); return; }
    drawSstFull(ctx, c, this);
    const v = this.view ?? this.fv;
    const show = this.stage === 0 ? POWERS.slice(0, 1) : POWERS;
    const lit = this.tl.lit()[0];
    const k = v.at(KANNAUJ);
    for (const p of show) {
      const off = lit && lit !== p.id;
      ctx.save();
      ctx.globalAlpha *= off ? 0.25 : 1;
      const pts = p.ring.map((q) => v.at(q)).filter(Boolean);
      ctx.beginPath(); pts.forEach((q, i) => (i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]))); ctx.closePath();
      ctx.fillStyle = alpha(c[p.key], this.stage === 2 ? 0.28 : 0.42); ctx.fill();
      ctx.strokeStyle = c[p.key]; ctx.lineWidth = 4; ctx.stroke();
      const a = v.at(p.from);
      ctx.strokeStyle = c[p.key]; ctx.lineWidth = 9; ctx.lineCap = 'round';
      if (this.stage < 2 && p.id !== 'gp' && a && k) {
        const dx = k[0] - a[0], dy = k[1] - a[1], L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L;
        const ex = k[0] - ux * 34, ey = k[1] - uy * 34;
        ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(ex, ey); ctx.stroke();
        ctx.fillStyle = c[p.key]; ctx.beginPath(); ctx.moveTo(ex + ux * 20, ey + uy * 20);
        ctx.lineTo(ex - uy * 17, ey + ux * 17); ctx.lineTo(ex + uy * 17, ey - ux * 17); ctx.closePath(); ctx.fill();
      }
      ctx.restore();
    }
    if (this.stage === 2) {
      for (const list of Object.values(VILLAGES)) for (const q of list) { const a = v.at(q); if (a) hut(ctx, c, a[0], a[1] + 14, 0.72); }
    }
    for (const p of show) {
      const a = v.at(p.tag);
      if (a && !(lit && lit !== p.id)) pill(ctx, c, p.name, Math.max(120, Math.min(560, a[0])), a[1], { bg: c[p.key], ink: inkOn(c, c[p.key]), size: 28 });
    }
    if (k) {
      ctx.fillStyle = c.bgSurface; ctx.strokeStyle = c.label; ctx.lineWidth = 5;
      ctx.beginPath(); ctx.arc(k[0], k[1], 14, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = c.gold; ctx.beginPath(); ctx.arc(k[0], k[1], 7, 0, Math.PI * 2); ctx.fill();
      pill(ctx, c, 'Kannauj', k[0] + 6, k[1] - 42, { bg: c.gold, ink: inkOn(c, c.gold), size: 32, display: true });
    }
    if (this.stage === 2) pill(ctx, c, 'village: the smallest unit', 340, 486, { bg: c.bgSurface, ink: c.label, size: 28 });
  }

  destroy() { this.tl.destroy(); super.destroy(); }
}
