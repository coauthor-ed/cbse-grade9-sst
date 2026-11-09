/**
 * MesopotamiaTimelineScene - blk-l08-s04, 6 beats. True-scale rail from 3600 to 1400 BCE. Book's Fig. 4.22 and text:
 * dashed ends where the chart dashes. Each beat adds one power; the last lights the overlap, 1900 to about 1700 BCE.
 * Base chain: SvgScene. State comes from the beat.
 */
import { SvgScene, fill } from 'simulations/base/kit/SimSvg.js';
import { timeRail, TIME_RAIL_CSS } from '../shared/TimeRail.js';
import { axeSvg, CLAY, SOIL, n } from '../L07/HarappanDraw.js';

const MAP = [0, 1, 2, 3, 4, 5].map((idx) => [{ idx, dwellMs: null }]);
const POWERS = [
  { id: 'sum', label: 'Sumerians', from: -3500, to: -2100, fuzzFrom: -3270, fuzzTo: -2334, tone: 2, seen: 2 },
  { id: 'akk', label: 'Akkadians', from: -2334, to: -2154, tone: 6, seen: 3 },
  { id: 'ass', label: 'Assyrians', from: -2154, to: -1700, tone: 1, seen: 4 },
  { id: 'bab', label: 'Babylonians', from: -1900, to: -1400, fuzzTo: -1500, tone: 5, seen: 5 },
];
const READ = ['Copper tools: 4500 BCE', '3500 BCE: Bronze Age begins', 'Sumerians: from about 3500 BCE', 'Akkadians: 2334 to 2154 BCE', 'Assyrians: 2154 to about 1700 BCE', 'About 200 years of overlap'];

const T = (...a) => a;
const TICKS = [T(-3500, -2334, -1900, -1400), T({ at: -3500, hot: true }, -2334, -1900, -1400), T({ at: -3500, hot: true }, -2334, -1900, -1400), T(-3500, { at: -2334, hot: true }, { at: -2154, hot: true }, -1400), T(-3500, { at: -2154, hot: true }, { at: -1700, hot: true }), T(-3500, -2334, { at: -1900, hot: true }, -1400)];

// The picture in the empty corner of the rail on the first three beats.
function corner(s, x, y, u) {
  if (s === 0) return axeSvg(x, y, u);
  if (s === 1) return axeSvg(x - u * 0.34, y, u * 0.9, 'var(--sim-gold)') + axeSvg(x + u * 0.42, y, u * 0.9, 'var(--sim-gold)');
  if (s !== 2) return '';
  let t = `<rect x="${n(x - u * 0.7)}" y="${n(y - u * 0.42)}" width="${n(u * 0.72)}" height="${n(u * 0.9)}" rx="${n(u * 0.1)}" ${fill(SOIL)}/>`;
  for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) t += `<path d="M${n(x - u * 0.6 + j * u * 0.2)} ${n(y - u * 0.3 + i * u * 0.19)}l${n(u * 0.11)} ${n(u * 0.04)}l${n(-u * 0.11)} ${n(u * 0.04)}z" ${fill(CLAY)}/>`;
  const wx = x + u * 0.5, r = u * 0.42;
  return t + `<circle cx="${n(wx)}" cy="${n(y)}" r="${n(r)}" ${fill('var(--sim-strata-3)')}/><circle cx="${n(wx)}" cy="${n(y)}" r="${n(r * 0.74)}" ${fill(SOIL)}/><circle cx="${n(wx)}" cy="${n(y)}" r="${n(r * 0.2)}" ${fill('var(--sim-strata-3)')}/>`;
}

export class MesopotamiaTimelineScene extends SvgScene {
  static BEAT_STEP_MAP = MAP;
  static CONTINUOUS = false;
  static ARIA_LABEL = 'A true-scale time rail. Copper tools at 4500 BCE, then the Sumerians from about 3500 BCE, the Akkadians from 2334 to 2154 BCE, the Assyrians to about 1700 BCE and the Babylonians from 1900 BCE. The last two overlap.';

  css() { return TIME_RAIL_CSS; }
  stageHeight(st) { return st.portrait ? 420 : 400; }

  paint(st) {
    const s = this.stepIndex, port = st.portrait, pad = port ? 12 : 24;
    const r = timeRail({ from: -3600, to: -1400, x: pad, w: st.W - pad * 2, y: 86, lanes: 4, laneH: port ? 44 : 50, gap: port ? 22 : 16 });
    let svg = `<text class="tr-label" x="${st.W / 2}" y="30" text-anchor="middle" font-size="${port ? 21 : 27}" dominant-baseline="central" ${fill('var(--sim-label)')}>${READ[s]}</text>`;
    if (s === 5) {
      const x1 = r.at(-1900), x2 = r.at(-1700), top = r.laneY(2) - 8, h = r.laneY(3) + (port ? 44 : 50) + 8 - top;
      svg += `<rect x="${x1}" y="${top}" width="${x2 - x1}" height="${h}" rx="8" ${fill('color-mix(in srgb, var(--sim-gold) 34%, transparent)', 'stroke:var(--sim-gold);stroke-width:3')}/>`;
    }
    POWERS.forEach((b, i) => {
      if (s < b.seen) { svg += r.bar({ ...b, fuzzFrom: undefined, fuzzTo: undefined, lane: i, ghost: true, label: null }); return; }
      const lit = s === b.seen || (s === 5 && i >= 2);
      svg += r.bar({ ...b, lane: i, dim: !lit, grow: s === b.seen, size: port ? 17 : 20, side: i === 1 ? 'left' : undefined });
    });
    if (s === 0) svg += `<text class="tr-tick" x="${st.W / 2}" y="58" text-anchor="middle" font-size="15" dominant-baseline="central" ${fill('var(--sim-label-muted)')}>1,000 years before this rail starts</text>`;
    if (s === 1) svg += r.mark({ at: -3500, lane: 0, tone: 2 });
    svg += corner(s, st.W * (port ? 0.27 : 0.25), r.laneY(2) + 36, port ? 96 : 120);
    svg += r.axis(TICKS[s]);
    return { svg };
  }
}
