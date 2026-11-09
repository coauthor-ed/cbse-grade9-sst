/**
 * EgyptianHierarchyScene - blk-l11-s05, 6 beats. The book's four-level pyramid (Fig. 4.32), big, with drawn icons. Chips name a
 * level (TapLight) and light it. Beats 0 to 3 preset one level; beat 4 lights all of it and shows food and labour moving up.
 * Base chain: SvgScene. Chips are in the scene.
 */
import { SvgScene, tone, fill, stroke, shade } from 'simulations/base/kit/SimSvg.js';
import { iconSvg } from 'simulations/base/kit/SimIcons.js';
import { tapLight } from 'simulations/base/kit/TapLight.js';
import { n } from '../L07/HarappanDraw.js';

const MAP = [0, 1, 2, 3, 4, 5].map((idx) => [{ idx, dwellMs: null }]);
const LEVELS = [
  { id: 'l0', label: 'Pharaoh', tone: 6, icons: ['crown'], who: 'One ruler, a god on earth' },
  { id: 'l1', label: 'Officials', tone: 5, icons: ['scroll', 'building'], who: 'Officials, nobles, priests' },
  { id: 'l2', label: 'Free people', tone: 3, icons: ['pot', 'shop', 'hammer'], who: 'Landholders, artisans, merchants' },
  { id: 'l3', label: 'Serfs, slaves', tone: 2, icons: ['grain', 'field', 'crate'], who: 'The largest group: farm work' },
];
const CHIPS = LEVELS.map((l) => ({ id: l.id, label: l.label, targets: [l.id], tone: l.tone }));
const PRESET = ['l0', 'l1', 'l2', 'l3', null, null];

export class EgyptianHierarchyScene extends SvgScene {
  static BEAT_STEP_MAP = MAP;
  static CONTINUOUS = false;
  static ARIA_LABEL = 'A pyramid of four levels: the pharaoh at the top, then officials, nobles and priests, then free landholders, artisans and merchants, and serfs and slaves at the wide base. Food and labour move up.';

  tl = tapLight({ label: 'Levels of society', chips: CHIPS, onChange: () => this.repaint() });

  async setup() { await super.setup(); this.tl.mount(this.root, this); this.tl.reset(); this._preset(); this.repaint(); }
  destroy() { this.tl.destroy(); super.destroy(); }
  enter() { this._preset(); }
  _preset() { this.tl.set({ lit: PRESET[this.stepIndex] ?? null }); }

  stageHeight(st) { return st.portrait ? 420 : 372; }
  css() { return 'svg .eh-w { font-family: var(--sim-font-display, var(--sim-font)); font-weight: 600; } svg .eh-up { animation: eh-up 0.8s var(--look-spring-soft) both; animation-delay: var(--d, 0s); } @keyframes eh-up { from { opacity: 0; translate: 0 26px; } to { opacity: 1; translate: 0 0; } } @media (prefers-reduced-motion: reduce) { svg .eh-up { animation: none; } }'; }

  _t(x, y, s, size, col = 'var(--sim-label)', a = 'middle') { return `<text class="eh-w" x="${n(x)}" y="${n(y)}" text-anchor="${a}" font-size="${size}" dominant-baseline="central" ${fill(col)}>${s}</text>`; }

  paint(st) {
    const W = st.W, H = st.H, port = st.portrait, s = this.stepIndex, cx = W / 2, top = port ? 8 : 6, bot = H - (port ? 62 : 54), h = (bot - top) / 4, bw = Math.min(W - 30, 540);
    const halfAt = (y) => ((y - top) / (bot - top)) * bw / 2;
    let svg = '';
    LEVELS.forEach((l, i) => {
      const y1 = top + i * h, y2 = y1 + h - 5, a = halfAt(y1), b = halfAt(y2), col = tone(l.tone), lit = !this.tl.off(l.id);
      const pts = `${n(cx - a)},${n(y1)} ${n(cx + a)},${n(y1)} ${n(cx + b)},${n(y2)} ${n(cx - b)},${n(y2)}`;
      svg += `<g style="${lit ? '' : 'opacity:0.3'}"><polygon points="${pts}" transform="translate(0 4)" ${fill(shade(col, 62))}/><polygon points="${pts}" ${fill(col)}/>`;
      const u = Math.min(h * 0.72, 54), gap = Math.min(u * 1.5, (2 * b - 30) / Math.max(1, l.icons.length));
      const sx = cx - (l.icons.length - 1) * gap / 2, iy = (y1 + y2) / 2 + (i === 0 ? h * 0.14 : 0);
      l.icons.forEach((ic, j) => { svg += `<g transform="translate(${n(sx + j * gap - u / 2)} ${n(iy - u / 2)}) scale(${(u / 48).toFixed(3)})">${iconSvg(ic, 'var(--sim-bg-surface)').replace('<svg ', '<svg overflow="visible" ')}</g>`; });
      svg += '</g>';
    });
    if (s === 4 && this.tl.lit().length === 0) {
      for (const dx of [-1, 1]) {
        const x = cx + dx * (port ? bw * 0.42 : bw * 0.42), y2 = bot - 8, y1 = top + 64;
        svg += `<g class="eh-up"><path d="M${n(x)} ${n(y2)}V${n(y1 + 12)}" ${stroke('var(--sim-label)', 9)}/><path d="M${n(x - 18)} ${n(y1 + 28)}L${n(x)} ${n(y1)}L${n(x + 18)} ${n(y1 + 28)}" ${stroke('var(--sim-label)', 9)}/></g>`;
      }
      svg += this._t(cx, H - (port ? 30 : 26), 'Food and labour move up', port ? 26 : 30);
    } else if (s === 5 && this.tl.lit().length === 0) {
      svg += this._t(cx, H - (port ? 30 : 26), 'Pick a level: one day there', port ? 24 : 30);
    } else {
      const l = LEVELS.find((v) => this.tl.has(v.id));
      if (l) svg += this._t(cx, H - (port ? 30 : 26), l.who, port ? 21 : 27);
    }
    return { svg };
  }
}
