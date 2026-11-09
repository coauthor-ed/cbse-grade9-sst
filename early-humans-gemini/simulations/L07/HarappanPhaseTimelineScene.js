/**
 * HarappanPhaseTimelineScene - blk-l07-s01, 5 beats. A true-scale rail from 7000 BCE to 1000 BCE with the
 * book's stages (Fig. 4.18), and above it the thing each stage left behind. Beat 0: the tidy city, its stage lit.
 * Beats 1-3 light the older stages in order. Beat 4: 4,400 years of run-up against 700 years of cities.
 * Base chain: SvgScene. State comes from the beat.
 */
import { SvgScene, fill, stroke } from 'simulations/base/kit/SimSvg.js';
import { timeRail, TIME_RAIL_CSS } from '../shared/TimeRail.js';
import { potSvg, axeSvg, beadsSvg, wallSvg, houseSvg, cityPlanSvg, sealSvg, SOIL, CLAY } from './HarappanDraw.js';

const MAP = [0, 1, 2, 3, 4].map((idx) => [{ idx, dwellMs: null }]);
// The book's dates (Fig. 4.18). Neolithic and Chalcolithic are stages before Early Harappan.
const STAGES = [
  { id: 'neo', from: -7000, to: -4500, label: 'Neolithic', tone: 3, seen: [1, 2, 3, 4], lit: [1, 4], fresh: 1 },
  { id: 'chal', from: -4500, to: -3300, label: 'Chalcolithic', tone: 8, seen: [1, 2, 3, 4], lit: [1, 4], fresh: 1 },
  { id: 'early', from: -3300, to: -2600, label: 'Early Harappan', tone: 2, seen: [2, 3, 4], lit: [2, 4], fresh: 2 },
  { id: 'mature', from: -2600, to: -1900, label: 'Mature Harappan', tone: 6, seen: [0, 1, 2, 3, 4], lit: [0, 3, 4], fresh: 0 },
  { id: 'late', from: -1900, to: -1300, label: 'Late Harappan', tone: 5, seen: [3, 4], lit: [3], fresh: 3 },
];
const READ = ['2600-1900 BCE: the cities', '7000-3300 BCE: villages, then copper', '3300-2600 BCE: Early Harappan', '2600-1300 BCE: the cities, then after'];
const TICKS = [-7000, { at: -4500 }, { at: -3300 }, { at: -2600, hot: true }, { at: -1900 }, { at: -1300 }];

export class HarappanPhaseTimelineScene extends SvgScene {
  static BEAT_STEP_MAP = MAP;
  static CONTINUOUS = false;
  static PORTRAIT_WIDTH = 380;
  static ARIA_LABEL = 'A true-scale time rail from 7000 BCE to 1300 BCE. Neolithic, Chalcolithic and Early Harappan stages come before the 700 years of the Mature Harappan cities.';

  css() { return TIME_RAIL_CSS; }
  stageHeight(st) { return st.portrait ? 540 : 470; }

  _picture(st, s, top, h) {
    const W = st.W, y = top + h;
    if (s === 0 || s === 4) {
      const w = Math.min(W * 0.72, h * 1.8);
      return cityPlanSvg(W / 2 - w / 2, top, w, h);
    }
    if (s === 1) {
      const u = Math.min(h * 0.62, W * 0.24);
      return houseSvg(W * 0.2, y - 4, u, SOIL) + houseSvg(W * 0.2 + u * 0.98, y - 4, u * 0.8, SOIL) + potSvg(W * 0.64, y - 4, u * 0.9) + axeSvg(W * 0.82, y - h * 0.42, h * 0.74);
    }
    if (s === 2) {
      const w = W * 0.42, l = W * 0.05, hs = Math.min(h * 0.44, w * 0.42);
      return houseSvg(l + w * 0.28, y - 34, hs) + houseSvg(l + w * 0.72, y - 34, hs) + wallSvg(l, y - 2, w, 36, SOIL, { rows: 3, brick: 22 })
        + potSvg(W * 0.64, y - 2, Math.min(h * 0.8, W * 0.3), CLAY, { painted: true }) + beadsSvg(W * 0.86, y - h * 0.68, W * 0.2, { long: true }) + sealSvg(W * 0.86, y - h * 0.26, Math.min(h * 0.36, W * 0.13));
    }
    const w = W * 0.36;
    return cityPlanSvg(W * 0.05, top + h * 0.12, w, h * 0.88, { cols: 3, rows: 2 })
      + `<path d="M${W * 0.47} ${y - h * 0.44}H${W * 0.56}m-11 -11l11 11l-11 11" ${stroke('var(--sim-label-muted)', 5)}/>`
      + houseSvg(W * 0.68, y - 4, Math.min(h * 0.46, W * 0.17)) + houseSvg(W * 0.87, y - 4, Math.min(h * 0.4, W * 0.15));
  }

  paint(st) {
    const s = this.stepIndex, port = st.portrait;
    const pad = port ? 14 : 28, picH = port ? 158 : 150, top = 8, readY = top + picH + 28;
    const laneH = port ? 30 : 32, gap = port ? 18 : 10;
    const r = timeRail({ from: -7000, to: -1000, x: pad, w: st.W - pad * 2, y: top + picH + 56, lanes: 5, laneH, gap });
    const size = port ? 16 : 17;
    let svg = this._picture(st, s, top, picH);
    STAGES.forEach((b, i) => {
      if (!b.seen.includes(s)) { svg += r.bar({ ...b, lane: i, ghost: true, label: null }); return; }
      const lit = b.lit.includes(s), fresh = b.fresh === s;
      const label = s === 4 && b.id === 'mature' ? (port ? 'Cities: 700 years' : 'Mature Harappan: 700 years') : b.label;
      svg += r.bar({ ...b, lane: i, dim: !lit, grow: fresh, size, label });
    });
    if (s === 4) svg += r.span({ from: -7000, to: -2600, lane: 0, label: '4,400 years of run-up', tone: 2, size: port ? 18 : 20, y: -1 });
    else svg += `<text class="tr-label" x="${st.W / 2}" y="${readY}" text-anchor="middle" font-size="${port ? 20 : 22}" dominant-baseline="central" ${fill('var(--sim-label)')}>${READ[s]}</text>`;
    return { svg: svg + r.axis(TICKS) };
  }
}
