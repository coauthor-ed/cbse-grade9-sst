// KulaChainScene (the verse) - blk-l08-s05. The verse in the translation of our source on a big
// leaf. Three historian's questions as chips; each lights what it asks about. No sorting.
import { SimScene } from 'simulations/base/kit/SimScene.js';
import { pill, inkOn, font, rr, alpha } from 'simulations/base/kit/SimLook.js';
import { tapLight, tapLightControl } from 'simulations/base/kit/TapLight.js';
import { pal } from '../shared/SstArt.js';

const VERSE = [['I', 'am', 'a', '*poet;'], ['my', 'father', 'is', 'a', '*physician,'], ['my', 'mother', 'is', 'a', '*grinder', '*of', '*corn;'], ['having', 'various', 'occupation,'], ['desiring', 'riches', 'we', 'remain'], ['(in', 'the', 'world)', 'like', 'cattle'], ['(in', 'the', 'stalls).']];
const CHIPS = [
  { id: 'ev', label: 'Evidence', targets: ['ev'] },
  { id: 'in', label: 'Interpretation', targets: ['in'] },
  { id: 'li', label: 'Limits', targets: ['li'] },
];
const SHOW = {
  ev: ['three occupations, one family'],
  in: ['a son need not follow his father'],
  li: ['how common?', 'how ranked?'],
};
const one = (i) => [{ idx: i, dwellMs: null }];

export class KulaChainScene extends SimScene {
  static BEAT_STEP_MAP = [one(0), one(1), one(2)];
  static VISUAL_PROFILE = 'rich';
  static IRIS = false;
  static CONTROLS_IN_SIGHT = true;
  static ARIA_LABEL = 'A verse of the Rigveda on a large palm leaf, with the three occupations marked. Three chips ask what the verse tells us, what we can understand from it, and what it might not tell us.';
  static CONTROLS = [tapLightControl({ id: 'lit', label: 'A question', chips: CHIPS, noneLabel: 'None' })];

  tl = tapLight({ label: 'Questions', chips: CHIPS });

  getControlValue(id) { return id === 'lit' ? this.tl.controlValue() : undefined; }
  enter(stage) { this.tl.set({ lit: CHIPS[stage].id }); this.requestUiUpdate?.(); }
  onControlChange(id, v) { if (id === 'lit') { this.tl.fromControl(v); this.requestUiUpdate?.(); } }

  draw(ctx, c) {
    const P = pal(c);
    ctx.fillStyle = P.sand; ctx.fillRect(0, 0, 680, 520);
    ctx.fillStyle = P.palmEdge; rr(ctx, 18, 18, 644, 394, 26); ctx.fill();
    ctx.fillStyle = P.palm; rr(ctx, 26, 24, 628, 380, 22); ctx.fill();
    ctx.strokeStyle = alpha(P.palmEdge, 0.4); ctx.lineWidth = 2;
    for (let y = 70; y < 400; y += 52) { ctx.beginPath(); ctx.moveTo(40, y); ctx.lineTo(640, y); ctx.stroke(); }
    ctx.fillStyle = P.palmEdge; ctx.beginPath(); ctx.arc(52, 214, 11, 0, Math.PI * 2); ctx.fill();
    const lit = this.tl.lit()[0];
    ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
    ctx.font = font(c, 800, 36);
    VERSE.forEach((ln, r) => {
      const y = 50 + r * 52;
      const ws = ln.map((w) => ctx.measureText(`${w.replace('*', '')} `).width);
      let x = 340 - ws.reduce((a, b) => a + b, 0) / 2;
      ln.forEach((w, i) => {
        const mark = w.startsWith('*'), t = w.replace('*', '');
        const hot = mark && (lit === 'ev' || lit === 'in');
        if (hot) { ctx.fillStyle = c.gold; rr(ctx, x - 5, y - 23, ws[i] - 4, 46, 9); ctx.fill(); }
        ctx.fillStyle = hot ? inkOn(c, c.gold) : (lit === 'li' && r < 3 ? alpha(c.label, 0.5) : c.label);
        ctx.fillText(t, x, y);
        x += ws[i];
      });
    });
    const list = lit ? SHOW[lit] : [];
    list.forEach((s, i) => {
      const x = list.length > 1 ? 196 + i * 288 : 340;
      pill(ctx, c, s, x, 464, { bg: lit === 'li' ? c.bgSurface : c.accent, ink: lit === 'li' ? c.label : inkOn(c, c.accent), size: 30, display: true });
    });
    if (!lit) pill(ctx, c, '\u1E5Aigveda 9.112.3', 340, 464, { bg: c.gold, ink: inkOn(c, c.gold), size: 30, display: true });
  }

  destroy() { this.tl.destroy(); super.destroy(); }
}
