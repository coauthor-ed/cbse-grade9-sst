/**
 * EmpireSuccessionScene - blk-l09-s07, mounts at beat 2 of 5 (beats 0 and 1 show drawings). The same true-scale rail as L08,
 * zoomed to 2400-1350 BCE. Beat 2: Akkad gives way to Assur. Beat 3: Babylonia, the overlap, Hammurabi at 1792 BCE.
 * Beat 4: the Hittites and the end of Babylonia's lead by 1400 BCE. Base chain: SvgScene. State comes from the beat.
 */
import { SvgScene, fill } from 'simulations/base/kit/SimSvg.js';
import { iconSvg } from 'simulations/base/kit/SimIcons.js';
import { timeRail, TIME_RAIL_CSS } from '../shared/TimeRail.js';

const MAP = [0, 1, 2, 3, 4].map((idx) => [{ idx, dwellMs: null }]);
const READ = { 2: 'Assur: 2154 to about 1700 BCE', 3: 'Hammurabi: 1792 BCE', 4: 'Lead lost by 1400 BCE' };
const WHY = [['Attacks', 'flag', 7], ['Worn-out land', 'field', 4], ['Trouble inside', 'crowd', 5]];

export class EmpireSuccessionScene extends SvgScene {
  static BEAT_STEP_MAP = MAP;
  static CONTINUOUS = false;
  static ARIA_LABEL = 'A true-scale time rail. The Akkadians from 2334 to 2154 BCE, the Assyrians to about 1700 BCE, the Babylonians from 1900 to about 1400 BCE with Hammurabi at 1792 BCE, and the rising Hittites.';

  css() { return TIME_RAIL_CSS + 'svg .es-w { font-family: var(--sim-font-display, var(--sim-font)); font-weight: 600; } svg .es-b { font-family: var(--sim-font); font-weight: 800; }'; }
  stageHeight(st) { return st.portrait ? 470 : 440; }

  paint(st) {
    const s = Math.max(2, this.stepIndex), port = st.portrait, pad = port ? 12 : 22, lh = port ? 46 : 48, gap = port ? 20 : 16;
    const r = timeRail({ from: -2400, to: -1350, x: pad, w: st.W - pad * 2, y: 92, lanes: 4, laneH: lh, gap });
    const size = port ? 17 : 20;
    let svg = `<text class="es-w" x="${st.W / 2}" y="34" text-anchor="middle" font-size="${port ? 23 : 28}" dominant-baseline="central" ${fill('var(--sim-label)')}>${READ[s]}</text>`;
    if (s === 3) {
      const x1 = r.at(-1900), x2 = r.at(-1700), top = r.laneY(1) - 7, h = r.laneY(2) + lh + 7 - top;
      svg += `<rect x="${x1.toFixed(1)}" y="${top}" width="${(x2 - x1).toFixed(1)}" height="${h}" rx="8" ${fill('color-mix(in srgb, var(--sim-gold) 34%, transparent)', 'stroke:var(--sim-gold);stroke-width:3')}/>`;
    }
    svg += r.bar({ from: -2334, to: -2154, lane: 0, tone: 6, label: 'Akkadians', dim: s !== 2, size });
    svg += r.bar({ from: -2154, to: -1700, lane: 1, tone: 1, label: 'Assyrians', dim: s === 4, grow: s === 2, size });
    if (s >= 3) svg += r.bar({ from: -1900, to: -1400, fuzzTo: -1500, lane: 2, tone: 5, label: 'Babylonians', grow: s === 3, size });
    else svg += r.bar({ from: -1900, to: -1400, lane: 2, tone: 5, ghost: true });
    if (s >= 4) svg += r.bar({ from: -1650, to: -1350, fuzzFrom: -1500, lane: 3, tone: 7, label: 'Hittites', grow: true, size, side: 'left' });
    if (s === 3) svg += r.mark({ at: -1792, lane: 3, toLane: 3, tone: 'bad' }) + `<text class="es-w" x="${(r.at(-1792) + 10).toFixed(1)}" y="${r.laneY(3) + lh / 2}" font-size="${port ? 19 : 22}" dominant-baseline="central" ${fill('var(--sim-label)')}>Hammurabi</text>`;
    if (s === 4) svg += r.mark({ at: -1400, lane: 2, toLane: 3, tone: 'bad' });
    const hot = s === 2 ? [-2334, { at: -2154, hot: true }, { at: -1700, hot: true }, -1400] : s === 3 ? [-2334, { at: -1900, hot: true }, { at: -1792, hot: true }, -1400] : [-2334, -1900, { at: -1400, hot: true }];
    svg += r.axis(hot);
    if (s === 4) {
      const y = r.bottom + 44, gapx = (st.W - 2 * pad) / 3;
      WHY.forEach(([t, ic, tn], i) => {
        const cx = pad + gapx * (i + 0.5);
        svg += `<g transform="translate(${(cx - 18).toFixed(1)} ${y - (port ? 0 : 0)}) scale(0.75)">${iconSvg(ic, tn).replace('<svg ', '<svg overflow="visible" ')}</g>`;
        svg += `<text class="es-b" x="${cx.toFixed(1)}" y="${y + 50}" text-anchor="middle" font-size="${port ? 15 : 18}" dominant-baseline="central" ${fill('var(--sim-label)')}>${t}</text>`;
      });
    }
    return { svg };
  }
}
