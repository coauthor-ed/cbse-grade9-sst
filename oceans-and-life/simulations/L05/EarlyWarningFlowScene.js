// EarlyWarningFlowScene - one coast and the two hazards, then the alarm in four steps. Tap a step: its part
// lights. 0 cyclone in the sky, earthquake under the sea, a village on the shore. 1 detect, predict, warn, act.
import { SvgScene } from 'simulations/base/kit/SimSvg.js';
import { tapLight } from 'simulations/base/kit/TapLight.js';
import { AIR_CSS, tx, sky, windArrow, spiralClouds } from '../L04/SeaDraw.js';
import { svgSatellite, svgHut } from '../shared/SeaArt.js';
import { layout, coastSvg, shelterSvg } from './CoastSection.js';

const MAP = [[{ idx: 0, dwellMs: null }], [{ idx: 1, dwellMs: null }]];
const CHIPS = [
  { id: 'detect', label: 'Detect', targets: ['detect'], tone: 1 }, { id: 'predict', label: 'Predict', targets: ['predict'], tone: 2 },
  { id: 'warn', label: 'Warn', targets: ['warn'], tone: 6 }, { id: 'act', label: 'Act', targets: ['act'], tone: 3 },
];

export class EarlyWarningFlowScene extends SvgScene {
  static BEAT_STEP_MAP = MAP;
  static ARIA_LABEL = 'A coast with a storm out at sea and an earthquake under it. Four steps: detect the danger, predict its path, warn the coast, and act by moving to a shelter or high ground.';
  static CONTROLS = [];
  tl = tapLight({ label: 'Steps of an early warning', chips: CHIPS, onChange: () => this.repaint() });
  css() { return AIR_CSS + '.sim-dom-root--portrait.svs { padding: var(--sim-space-1) 4px; }'; }
  stageHeight(st) { return st.portrait ? 340 : 400; }
  async setup() { await super.setup(); this.tl.mount(this.root, this); this.enter(this.stepIndex); }
  destroy() { this.tl.destroy(); super.destroy(); }
  enter(step) {
    if (!this.tl) return;
    this.tl.set({ lit: step === 1 ? 'detect' : null, disabled: step === 0 });
    const r = this.root.querySelector?.('.tl-row');
    if (r) r.hidden = step === 0;
    this.relayout?.();
  }
  paint(st) {
    const W = st.W, H = st.H, port = st.portrait, step = this.stepIndex, lit = this.tl.chip()?.id;
    const L = layout(W, H, { seaW: W * 0.5, y0: H * 0.76, base: H - 16, top: H * 0.5 });
    const op = (id) => `opacity:${step === 1 && lit !== id ? 0.25 : 1}`;
    const sx = W * 0.2, sy = H * 0.36, R = port ? 54 : 70;
    let s = coastSvg(L, 0, { palm: 0.8 });
    s += `<g class="air-spin" style="transform-origin:${sx}px ${sy}px">${spiralClouds(sx, sy, R, 1)}</g>`;
    if (step === 0) {
      const qx = W * 0.26, qy = H - 34;
      s += tx(sx, sy + R + 22, 'cyclone', { size: 16, col: sky('ink'), halo: sky('cloud'), display: true, weight: 700 });
      s += `<path d="M${qx - 15} ${qy + 12}l10 -14l-5 -3l13 -13l-4 11l6 2l-11 17Z" style="fill:${sky('sun')};stroke:${sky('ink')};stroke-width:2"/>`;
      for (const r of [28, 44]) s += `<path d="M${qx - r} ${qy + 8}A${r} ${r} 0 0 1 ${qx + r} ${qy + 8}" style="fill:none;stroke:${sky('sun')};stroke-width:3"/>`;
      s += tx(qx + 56, qy + 8, 'earthquake', { size: 16, anchor: 'start', col: sky('cloud'), halo: sky('hullDark') });
    }
    // village low on the shore, shelter high up
    const hx = L.x(0.2), hy = L.y(1.2), ex = L.x(0.84), ey = L.y(4.9);
    s += svgHut(hx, hy, 0.5, {}) + svgHut(hx + 40, L.y(1.6), 0.42, {});
    s += `<g style="${op('act')}">${shelterSvg(ex, ey + 2, 0.8)}</g>`;
    if (step === 1) {
      const fx = W * 0.56, fy = 42;
      s += `<g style="${op('detect')}">${svgSatellite(W * 0.47, 40, 0.42, {})}<path d="M${W * 0.44} 62L${sx + R * 0.7} ${sy - R * 0.5}" style="stroke:${sky('sun')};stroke-width:4;stroke-dasharray:9 7"/></g>`;
      s += `<g style="${op('predict')}"><path d="M${sx + R} ${sy + 8}Q${W * 0.42} ${sy + 34} ${hx - 12} ${hy - 44}" style="fill:none;stroke:${sky('red')};stroke-width:5;stroke-dasharray:12 9;stroke-linecap:round"/>${tx(W * 0.42, sy + 56, 'likely path', { size: 15, col: sky('ink'), halo: sky('cloud') })}</g>`;
      s += `<g style="${op('warn')}"><path d="M${L.x(0.34)} ${L.y(2.2)}v-46" style="stroke:${sky('ink')};stroke-width:5"/><circle cx="${L.x(0.34)}" cy="${L.y(2.2) - 50}" r="7" style="fill:${sky('red')}"/>`;
      for (const r of [16, 28, 40]) s += `<path d="M${L.x(0.34) - r} ${L.y(2.2) - 50 - r * 0.5}A${r} ${r} 0 0 1 ${L.x(0.34) + r} ${L.y(2.2) - 50 - r * 0.5}" style="fill:none;stroke:${sky('red')};stroke-width:3.5"/>`;
      s += '</g>';
      s += `<g style="${op('act')}">${windArrow([[hx + 58, L.y(2.1) - 26], [L.x(0.55), L.y(3.4) - 28], [ex - 30, ey - 28]], { w: 8, col: sky('grassLit'), rim: sky('ink'), curve: true })}${tx(W - 8, ey - 64, 'shelter or high ground', { anchor: 'end', size: 15, col: sky('ink'), halo: sky('cloud') })}</g>`;
    }
    return { svg: s };
  }
}
