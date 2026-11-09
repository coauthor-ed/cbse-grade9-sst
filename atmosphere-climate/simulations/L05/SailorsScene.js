// SailorsScene - blk-l05-s00. A sailing dhow between Arabia and India. In June the wind blows towards
// India; in January it blows the other way, and the sail fills the other way. Beat 1: mausim becomes
// monsoon. Beat 2: the word names the turning of the wind, shown as one year with two arrows.
// Schematic sea, not a map: the two coasts are labels.
import { SvgScene } from 'simulations/base/kit/SimSvg.js';
import { tapLight } from 'simulations/base/kit/TapLight.js';
import { AIR_CSS, tx, skyTx, panel, skyRect, sky, SKY_INK, MUTED, windArrow, svgDhow, svgSea, svgLand, svgCloud, svgSun } from '../L03/AirDraw.js';

const MAP = [0, 1, 2].map((i) => [{ idx: i, dwellMs: null }]);
const CHIPS = [{ id: 'jun', label: 'June', targets: ['jun'], tone: 1 }, { id: 'jan', label: 'January', targets: ['jan'], tone: 2 }];

export class SailorsScene extends SvgScene {
  static BEAT_STEP_MAP = MAP;
  static ARIA_LABEL = 'A sailing dhow on the sea between Arabia and India. In June the wind blows towards India, in January it blows the other way. The Arabic word mausim, meaning season, gave us the word monsoon.';
  static CONTROLS = [];
  tl = tapLight({ label: 'Month', chips: CHIPS, onChange: () => this.repaint() });
  css() { return AIR_CSS; }
  stageHeight(st) { return st.portrait ? 430 : 410; }
  async setup() { await super.setup(); this.tl.mount(this.root, this); this.enter(this.stepIndex); }
  destroy() { this.tl.destroy(); super.destroy(); }
  enter(step) {
    if (!this.tl?.mount) return;
    this.tl.set({ lit: 'jun', disabled: step === 1 });
    const r = this.root.querySelector?.('.tl-row');
    if (r) r.hidden = step === 1;
  }
  paint(st) {
    const W = st.W, H = st.H, port = st.portrait, step = this.stepIndex, jun = this.tl.chip()?.id !== 'jan', g = H - 92;
    let s = skyRect('saSky', 0, 0, W, H, 0, 7, { r: 18 }) + (step === 0 ? svgSun(W * 0.5, 44, 0.45, {}) : '');
    s += svgCloud(W * 0.22, 70, 0.8, { seed: 2 }) + svgCloud(W * 0.8, 58, 0.7, { seed: 5 });
    s += svgSea(0, g, 1, { w: W, h: H - g, t: 0 });
    const lw = port ? 54 : 82;
    s += `<g>${svgLand(0, g - 6, 1, { w: lw, h: H - g + 6, kind: 'sand', seed: 2 })}${svgLand(W - lw, g - 6, 1, { w: lw, h: H - g + 6, kind: 'field', seed: 3 })}</g>`;
    s += tx(lw / 2, g + 28, 'Arabia', { size: 15, col: SKY_INK, halo: sky('cloud') }) + tx(W - lw / 2, g + 28, 'India', { size: 15, col: SKY_INK, halo: sky('cloud') });
    const k = port ? 0.95 : 1.15, dx = W / 2 + (jun ? 26 : -26);
    s += `<g class="air-in">${svgDhow(dx, g + 8, k, { belly: 1, flip: !jun })}</g>`;
    if (step !== 1) {
            for (let i = 0; i < 2; i++) {
        const y = g - 150 + i * 62;
        const x0 = jun ? 12 + i * 10 : W - 12 - i * 10, x1 = x0 + (jun ? 1 : -1) * (port ? 62 : 110);
        s += windArrow([[x0, y], [x1, y]], { w: 10, col: sky('cloud'), flow: true });
      }
    }
    if (step === 0) {
      s += skyTx(W / 2, 96, jun ? 'wind blows towards India' : 'wind blows towards Arabia', { size: 18 });
    } else if (step === 1) {
      const w = Math.min(W - 30, 400), x = (W - w) / 2;
      s += panel(x, 34, w, 112);
      s += tx(x + w * 0.24, 80, 'mausim', { size: port ? 25 : 32, display: true, weight: 700, col: 'var(--sim-series-5)' });
      s += tx(x + w * 0.24, 108, 'Arabic: season', { size: 15, weight: 700, col: MUTED });
      s += windArrow([[x + w * 0.46, 80], [x + w * 0.58, 80]], { w: 7, col: 'var(--sim-series-5)', rim: SKY_INK, head: 13 });
      s += tx(x + w * 0.79, 80, 'monsoon', { size: port ? 25 : 32, display: true, weight: 700 });
      s += tx(x + w * 0.79, 108, 'English', { size: 15, weight: 700, col: MUTED });
    } else {
      const w = Math.min(W - 30, 380), x = (W - w) / 2;
      s += panel(x, 34, w, 66) + tx(W / 2, 60, 'Monsoon:', { size: 15, col: MUTED, weight: 700 }) + tx(W / 2, 86, 'the wind turns around each year', { size: port ? 17 : 20, display: true, weight: 700 });
    }
    return { svg: s };
  }
}
