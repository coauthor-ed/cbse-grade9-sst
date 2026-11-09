// WaterfallScene - side view after the book's waterfall figure: blocky hard rock over sandy soft rock, the river
// flowing left to right. Soft rock wears back and opens a gap, the lip loses support and breaks, so the fall stands
// further LEFT, upstream. Stages: 4 predict (no gap, no pool); 0 answer; 1 gap; 2 pool and Years pass; 3 uses.
import { SvgScene } from 'simulations/base/kit/SimSvg.js';
import { svgRock, svgSand, svgWater, svgTree, svgGrass, svgBoulder } from '../shared/EarthArt.js';
import { svgCloud } from '../shared/SkyArt.js';
import { withEarth, BAR_CSS, world, tag, pointer, ec, strand, arrow, clamp, lerp, INK, WHITE } from '../L04/EarthBits.js';

const MAP = [0, 1, 2, 3].map((idx) => [{ idx, dwellMs: null }]);
const MAP1 = [[{ idx: 4, dwellMs: null }]];
const STEP = 62;     // px the lip retreats each time it breaks

export class WaterfallScene extends withEarth(SvgScene) {
  static BEAT_STEP_MAP = MAP;
  static BEAT_MAPS = { 4: MAP, 1: MAP1 };
  static WIDTH = 620;
  static HEIGHT = 460;
  static PORTRAIT_WIDTH = 340;
  static PORTRAIT_HEIGHT = 500;
  static ARIA_LABEL = 'A waterfall in side view. The river flows over hard rock and falls on softer rock. The soft rock wears back, the hard lip breaks, and the fall moves upstream.';
  static CONTROLS = [];
  css() { return BAR_CSS; }
  stageHeight(st) { return st.portrait ? 370 : 360; }

  enter(stage) {
    this._stage = stage; this.stopTween(); this._fresh = true; this._fall = 0;
    this._n = stage === 0 ? 2 : stage === 3 ? 1 : 0;
    this._gap = stage === 4 ? 0 : stage === 0 || stage === 3 ? .7 : stage === 1 ? 1 : 1;
    this._ctl();
  }
  _ctl() {
    if (this._stage !== 2) { this.bar([]); return; }
    this.bar(this._n >= 2 ? [{ id: 'again', label: 'Start again' }] : [{ id: 'years', label: 'Years pass', go: true, off: !!this._tw }]);
  }
  control(id) {
    if (this._tw) return;
    if (id === 'again') { this._n = 0; this._gap = 1; this._fall = 0; this._ctl(); this.repaint(); return; }
    this.tween(0, 1, 1.6, (v) => { this._fall = v; }, () => {
      this._n += 1; this._fall = 0; this._gap = 1; this._ctl();
      if (this._n >= 2 && !this._cel) { this._cel = true; this.celebrate(); this.repaint(); }
    });
    this._ctl();
  }

  paint(st) {
    const W = st.W, H = st.H, s = this._stage, top = H * .3, hard = H * .15, base = H * .76, x0 = W * .66, lip = x0 - this._n * STEP;
    const gapPx = (34 + 10 * (s === 2 ? 1 : 0)) * this._gap, f = this._fall, soft = lip - gapPx - f * (STEP - 10);
    const pool = lip + 34;
    let b = svgCloud(W * .22, 42, .66, { seed: 5 }) + svgCloud(W * .84, 54, .5, { seed: 2 });
    // ground right of the fall, river below
    const face = s === 4 ? [[lip, top + hard], [lip, base]] : [[soft, top + hard], [soft + 6, top + hard + (base - top - hard) * .5], [soft - 6, base - 18], [soft + 10, base], [pool - 34, base + 4], [pool - 26, base + 34], [pool + 18, base + 42], [pool + 56, base + 18]];
    b += svgSand([[-10, top + hard], ...face, [W + 10, base + 8], [W + 10, H + 10], [-10, H + 10]], { seed: 6 });
    b += svgRock([[-10, H * .9], [W + 10, H * .92], [W + 10, H + 10], [-10, H + 10]], { seed: 3, fill: 'rockDark', cracks: 3 });
    // pool and lower river
    if (s !== 4) b += svgWater([[pool - 32, base + 6], [pool - 24, base + 32], [pool + 18, base + 40], [pool + 56, base + 16], [W + 10, base + 10], [W + 10, base + 2], [pool + 40, base + 4]], { t: 1, ripples: 2, deep: .7 });
    else b += svgWater([[lip, base - 2], [W + 10, base - 4], [W + 10, base + 9], [lip, base + 9]], { t: 1, ripples: 2 });
    // hard rock as stone blocks
    const bw = 70; let blocks = '';
    for (let r = 0; r < 2; r++) for (let i = -1; i * bw < lip + bw; i++) {
      const x = i * bw + (r ? bw / 2 : 0) + ((lip) % bw), y = top + r * hard / 2, xe = Math.min(x + bw - 3, lip);
      if (xe - x < 8 || x > lip) continue;
      const o = xe >= lip - 1 && f > .4 ? 1 : 0;
      if (o) continue;
      blocks += svgRock([[x, y + 1], [xe, y + 1], [xe, y + hard / 2 - 1], [x, y + hard / 2 - 1]], { seed: i + 9 + r, fill: r ? 'slate' : 'slateLit', outline: true });
    }
    b += blocks;
    // falling block
    if (f > .4) { const k = clamp((f - .4) / .6); b += svgBoulder(lerp(lip - 12, pool + 2, k), lerp(top + hard, base + 26, k * k), .75, { seed: 4, fill: 'slate' }); }
    for (let i = 0; i < this._n; i++) b += svgBoulder(pool + 30 + i * 30, base + 16, .38, { seed: i + 3, fill: 'slate' });
    // river on top, fall
    const lipNow = f > .4 ? lip - STEP + 8 : lip;
    b += `<path d="M-10 ${top - 12}H${lipNow - 8}V${top + 1}H-10Z" style="fill:${ec('sea')}"/>`;
    const end = s === 4 ? lip + 36 : pool + 2 - (f > .4 ? 30 : 0);
    const fall = [[lipNow - 12, top - 6], [lipNow + 8, top], [lipNow + 24, top + 34], [lipNow + 32, base * .72], [end, base + 4]];
    b += strand(fall, 'seaDeep', 32) + strand(fall, 'sea', 26) + strand(fall, 'seaFar', 7, { opacity: .8 });
    if (s !== 4) for (let i = 0; i < 5; i++) b += `<circle cx="${pool - 16 + i * 10}" cy="${base + 2 - (i % 2) * 7}" r="6" style="fill:${ec('foam')}"/>`;
    if (s === 0 || s === 2) for (let i = 0; i < 1; i++) b += `<path d="M${x0} ${top - 40}V${base}" style="stroke:${INK};stroke-width:3;stroke-dasharray:8 7;fill:none"/>`;
    if (s === 3) {
      b += `<path d="M${W * .12} ${top - 8}V${base - 8}H${W * .86}" style="fill:none;stroke:${ec('inkSoft')};stroke-width:7;stroke-linejoin:round"/>`;
      b += `<rect x="${W * .78}" y="${base - 42}" width="58" height="40" rx="5" style="fill:${ec('snowShade')};stroke:${INK};stroke-width:2.5"/><circle cx="${W * .78 + 29}" cy="${base - 22}" r="11" style="fill:${ec('sandLit')};stroke:${INK};stroke-width:2.5"/>`;
      b += svgGrass(0, top - 12, lip, top - 12, { seed: 3, n: 14, tall: 12 }) + svgTree(W * .32, top - 11, .5, { kind: 'round', seed: 5 });
    }
    const p = this._fresh ? { pop: true } : {};
    if (s === 4 || s === 1) b += tag(W * .24, top + hard / 2, 'Hard rock', p) + tag(W * .24, (top + hard + base) / 2 + 4, 'Soft rock', { ...p, delay: .1 });
    if (s === 0) b += arrow([[x0 - 8, top - 26], [lip + 2, top - 26]], { c: WHITE, w: 7 }) + tag(W - 8, top - 58, 'The fall stood here', { ...p, anchor: 'end' }) + tag(W * .22, top - 36, 'Upstream', { ...p, delay: .1 });
    if (s === 1) b += pointer(W * .86, H * .56, soft + 16, H * .56, {}) + tag(W * .86, H * .49, 'Gap', p);
    if (s === 2) {
      b += pointer(W - 66, H * .6, pool + 14, base + 22, {}) + tag(W - 8, H * .58, 'Plunge pool', { ...p, anchor: 'end' });
      b += this._n ? tag(W * .24, top - 36, this._n > 1 ? 'Further upstream' : 'Moved upstream', { size: 14 }) : tag(W - 8, top - 58, 'The fall starts here', { ...p, anchor: 'end', size: 14 });
    }
    if (s === 3) b += tag(W * .84, base - 62, 'Hydel power', p) + tag(W * .26, 34, 'Trekking, tourism', { ...p, delay: .1 });
    this._fresh = false;
    return { svg: world(st, 'wf', b) };
  }
}
