// ClearSkyQuakeScene - two drawn views side by side (stacked on a phone). 0 a cyclone from above: cloud to
// follow. 1 clear sky over the sea; the sea floor moves far below. 2 instruments added on the sea and floor.
import { SvgScene } from 'simulations/base/kit/SimSvg.js';
import { AIR_CSS, tx, sky, spiralClouds } from '../L04/SeaDraw.js';
import { svgBuoy, svgSeaColumn, svgSun, svgSatellite } from '../shared/SeaArt.js';

const MAP = [[{ idx: 0, dwellMs: null }], [{ idx: 1, dwellMs: null }], [{ idx: 2, dwellMs: null }]];

export class ClearSkyQuakeScene extends SvgScene {
  static BEAT_STEP_MAP = MAP;
  static ARIA_LABEL = 'Two drawings. On one side a cyclone seen from above, with cloud to follow. On the other a clear sky, with the sea floor moving far below the water and nothing to see in the sky.';
  static CONTROLS = [];
  css() { return AIR_CSS + '.sim-dom-root--portrait.svs { padding: var(--sim-space-1) 4px; }'; }
  stageHeight(st) { return st.portrait ? 500 : 400; }
  // Driven by the beat, no button: this is a real day, not a thing to set off and replay.
  async setup() {
    this._j = 0;
    await super.setup();
    this.repaint();
  }
  enter(step) { this._j = step >= 1 ? 1 : 0; }
  paint(st) {
    const W = st.W, H = st.H, port = st.portrait, step = this.stepIndex, g = 10;
    const a = port ? { x: 0, y: 0, w: W, h: H / 2 - g / 2 } : { x: 0, y: 0, w: W / 2 - g / 2, h: H };
    const b = port ? { x: 0, y: H / 2 + g / 2, w: W, h: H / 2 - g / 2 } : { x: W / 2 + g / 2, y: 0, w: W / 2 - g / 2, h: H };
    const clip = (id, r) => `<defs><clipPath id="${id}"><rect x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}" rx="16"/></clipPath></defs>`;
    let s = clip('csA', a) + clip('csB', b);
    // the storm from above
    const R = Math.min(a.w, a.h) * 0.4, cx = a.x + a.w / 2, cy = a.y + a.h / 2 + 8;
    s += `<rect x="${a.x}" y="${a.y}" width="${a.w}" height="${a.h}" rx="16" style="fill:${sky('cloud')}"/><g clip-path="url(#csA)" opacity="${step === 1 ? 0.45 : 1}"><rect x="${a.x}" y="${a.y}" width="${a.w}" height="${a.h}" style="fill:${sky('seaDeep')}"/><g class="air-spin" style="transform-origin:${cx}px ${cy}px">${spiralClouds(cx, cy, R, 1)}</g></g>`;
    s += tx(a.x + 14, a.y + 26, 'A cyclone, from above', { size: 16, anchor: 'start', col: sky('ink'), halo: sky('cloud'), display: true, weight: 700 });
    // clear sky, sea, floor
    const seaY = b.y + b.h * 0.32, base = b.y + b.h - 44;
    const mx = b.x + b.w * 0.55, lift = 26 * this._j;
    s += `<rect x="${b.x}" y="${b.y}" width="${b.w}" height="${b.h}" rx="16" style="fill:${sky('cloud')}"/><g clip-path="url(#csB)" opacity="${step === 0 ? 0.45 : 1}"><rect x="${b.x}" y="${b.y}" width="${b.w}" height="${b.h}" style="fill:${sky('sky')}"/>`;
    s += svgSun(b.x + b.w - 56, b.y + 52, 0.42, {});
    s += svgSeaColumn(b.x, seaY, 1, { w: b.w, h: b.h - (seaY - b.y), wave: 4, len: 80 });
    s += `<path d="M${b.x} ${base + 8}L${mx - 6} ${base}L${mx - 6} ${base + 44}H${b.x}Z" style="fill:${sky('rockDark')};stroke:${sky('ink')};stroke-width:2.5"/>`;
    s += `<path d="M${mx + 6} ${base - lift}L${b.x + b.w} ${base + 8 - lift * 0.4}V${base + 50}H${mx + 6}Z" style="fill:${sky('rockMid')};stroke:${sky('ink')};stroke-width:2.5"/>`;
    if (this._j > 0.5) for (const r of [20, 34]) s += `<path d="M${mx - r} ${base + 10 - lift}A${r} ${r} 0 0 1 ${mx + r} ${base + 10 - lift}" style="fill:none;stroke:${sky('sun')};stroke-width:3"/>`;
    if (step === 2) {
      s += svgBuoy(b.x + b.w * 0.26, seaY + 2, 0.5, {});
      s += `<rect x="${b.x + b.w * 0.26 - 13}" y="${base - 13}" width="26" height="16" rx="4" style="fill:${sky('sun')};stroke:${sky('ink')};stroke-width:2"/>`;
    }
    s += '</g>';
    s += tx(b.x + 14, b.y + 26, 'Clear sky, 26 December 2004', { size: port ? 16 : 15, anchor: 'start', col: sky('ink'), halo: sky('cloud'), display: true, weight: 700 });
    s += tx(b.x + b.w / 2, base + 34, step === 2 ? 'watch the sea and its floor' : 'the sea floor moved', { size: 15, col: sky('cloud'), halo: sky('hullDark') });
    const drawing = tx(a.x + a.w - 12, a.y + 24, 'drawings', { size: 14, anchor: 'end', col: sky('ink'), halo: sky('cloud'), weight: 700 });
    s += drawing;
    return { svg: s };
  }
}
