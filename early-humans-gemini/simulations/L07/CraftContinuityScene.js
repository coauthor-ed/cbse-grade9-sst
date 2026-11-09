/**
 * CraftContinuityScene - blk-l07-s03, mounts at beat 5 of 6 (the five earlier beats show the course's drawings).
 * Five crafts, each drawn twice: what the Early Harappan layers hold, then what the Mature cities hold. No row breaks.
 * Chips light one row. The book's words: forerunners, continuity. Base chain: SvgScene.
 */
import { SvgScene, fill, stroke } from 'simulations/base/kit/SimSvg.js';
import { tapLight } from 'simulations/base/kit/TapLight.js';
import { potSvg, beadsSvg, bangleSvg, axeSvg, sherdSvg, sealSvg, CLAY, SOIL } from './HarappanDraw.js';

const MAP = [0, 1, 2, 3, 4, 5].map((idx) => [{ idx, dwellMs: null }]);
const ROWS = [
  { id: 'pot', label: 'Pottery', a: (x, y, s) => potSvg(x - s * 0.62, y + s * 0.42, s * 0.7, CLAY, { painted: true }) + potSvg(x + s * 0.02, y + s * 0.42, s * 0.82, SOIL) + potSvg(x + s * 0.62, y + s * 0.42, s * 0.62, 'var(--sim-strata-4)', { painted: true }),
    b: (x, y, s) => potSvg(x - s * 0.42, y + s * 0.42, s * 0.82, CLAY, { painted: true }) + potSvg(x + s * 0.42, y + s * 0.42, s * 0.82, CLAY, { painted: true }) },
  { id: 'bead', label: 'Stone beads', a: (x, y, s) => beadsSvg(x, y, s * 1.5, { count: 4 }), b: (x, y, s) => beadsSvg(x, y - s * 0.2, s * 1.7, { count: 7, long: true }) + beadsSvg(x, y + s * 0.2, s * 1.7, { count: 8, long: true }) },
  { id: 'shell', label: 'Shell, copper', a: (x, y, s) => bangleSvg(x - s * 0.45, y, s * 0.36) + axeSvg(x + s * 0.4, y, s * 0.8), b: (x, y, s) => bangleSvg(x - s * 0.62, y - s * 0.12, s * 0.34) + bangleSvg(x - s * 0.62, y + s * 0.16, s * 0.34) + axeSvg(x + s * 0.18, y, s * 0.8) + axeSvg(x + s * 0.72, y, s * 0.8) },
  { id: 'mark', label: 'Marks, script', a: (x, y, s) => sherdSvg(x, y, s * 0.92), b: (x, y, s) => sherdSvg(x, y, s * 0.92, { script: true }) },
  { id: 'seal', label: 'Seals', a: (x, y, s) => sealSvg(x, y, s * 0.72, 'lines'), b: (x, y, s) => sealSvg(x, y, s * 0.72, 'bull') },
];
const SHORT = { pot: 'Pottery', bead: 'Beads', shell: 'Shell', mark: 'Marks', seal: 'Seals' };
const CHIPS = ROWS.map((r) => ({ id: r.id, label: SHORT[r.id], targets: [r.id], tone: 2 }));

export class CraftContinuityScene extends SvgScene {
  static BEAT_STEP_MAP = MAP;
  static CONTINUOUS = false;
  static ARIA_LABEL = 'Five rows of drawn objects: pottery, stone beads, shell and copper, marks and script, seals. Each row shows the Early Harappan object and the later Mature Harappan object, with no break between them.';

  tl = tapLight({ label: 'Crafts', chips: CHIPS, onChange: () => this.repaint() });

  async setup() { await super.setup(); this.tl.mount(this.root, this); this.tl.reset(); }
  enter() { this.tl.reset(); }
  destroy() { this.tl.destroy(); super.destroy(); }
  stageHeight(st) { return st.portrait ? 448 : 420; }

  paint(st) {
    const W = st.W, port = st.portrait, labW = port ? 76 : 150, top = 46, rowH = (st.H - top) / ROWS.length;
    const c1 = labW + (W - labW) * 0.25, c2 = labW + (W - labW) * 0.75, s = Math.min(rowH * 1.02, (W - labW) * 0.23);
    let svg = `<text class="svc-h" x="${c1}" y="22" text-anchor="middle" font-size="${port ? 17 : 21}" dominant-baseline="central" ${fill('var(--sim-label)')}>Early Harappan</text>`
      + `<text class="svc-h" x="${c2}" y="22" text-anchor="middle" font-size="${port ? 17 : 21}" dominant-baseline="central" ${fill('var(--sim-label)')}>Mature cities</text>`;
    ROWS.forEach((r, i) => {
      const y = top + rowH * (i + 0.5), off = this.tl.off(r.id);
      const lines = port ? r.label.split(/,? /) : [r.label];
      const lab = lines.map((l, j) => `<text class="svc-l" x="${port ? 2 : 10}" y="${y + (j - (lines.length - 1) / 2) * 18}" font-size="${port ? 15 : 19}" dominant-baseline="central" ${fill('var(--sim-label)')}>${l}</text>`).join('');
      svg += `<g style="${off ? 'opacity:0.2' : ''}">${i ? `<rect x="0" y="${top + rowH * i - 1}" width="${W}" height="2" ${fill('color-mix(in srgb, var(--sim-stroke) 30%, transparent)')}/>` : ''}${lab}${r.a(c1, y, s)}`
        + `<path d="M${(c1 + c2) / 2 - 12} ${y}h24m-9 -9l9 9l-9 9" ${stroke('var(--sim-series-2)', 4.5)}/>${r.b(c2, y, s)}</g>`;
    });
    return { svg };
  }

  css() { return 'svg .svc-h, svg .svc-l { font-family: var(--sim-font-display, var(--sim-font)); font-weight: 600; }'; }
}
