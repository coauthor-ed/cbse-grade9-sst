/**
 * ChineseDynastyTimelineScene - blk-l12-s03, 5 beats. True-scale rail from 1700 BCE to 300 CE with four dynasties and the
 * Bronze and Iron Age band on top. Qin is a sliver, on purpose: 15 years against 1,344. Base chain: SvgScene.
 */
import { SvgScene, fill, stroke } from 'simulations/base/kit/SimSvg.js';
import { timeRail, TIME_RAIL_CSS } from '../shared/TimeRail.js';

const MAP = [0, 1, 2, 3, 4].map((idx) => [{ idx, dwellMs: null }]);
const FROM = -1700, TO = 300;
const D = [
  { id: 'shang', label: 'Shang', from: -1600, to: -1046, tone: 2, seen: 1 },
  { id: 'zhou', label: 'Zhou', from: -1046, to: -256, tone: 6, seen: 1 },
  { id: 'qin', label: 'Qin', from: -221, to: -206, tone: 1, seen: 3 },
  { id: 'han', label: 'Han', from: -206, to: 220, tone: 3, seen: 4 },
];
const READ = ['Four dynasties', 'Shang and Zhou: more than 1,300 years', 'By 600 BCE: iron', 'Qin: 15 years, 221 to 206 BCE', 'Han: more than 400 years'];
const LIT = [[], ['shang', 'zhou'], ['zhou'], ['qin'], ['han']];
const TICKS = [
  [-1600, -1046, -256, 220], [{ at: -1600, hot: true }, { at: -1046, hot: true }, { at: -256, hot: true }, 220], [-1600, -1046, { at: -600, hot: true }, -256, 220],
  [-1600, -1046, { at: -221, hot: true }, 220], [-1600, -1046, { at: -206, hot: true }, { at: 220, hot: true }],
];

const PTICKS = [[-1600, -256, 220], [{ at: -1600, hot: true }, { at: -256, hot: true }, 220], [-1600, { at: -600, hot: true }, 220], [-1600, { at: -221, hot: true }], [-1600, { at: -206, hot: true }]];

export class ChineseDynastyTimelineScene extends SvgScene {
  static BEAT_STEP_MAP = MAP;
  static CONTINUOUS = false;
  static ARIA_LABEL = 'A true-scale time rail. Shang 1600 to 1046 BCE, Zhou 1046 to 256 BCE, Qin 221 to 206 BCE as a thin sliver, Han 206 BCE to 220 CE. Iron is in common use from about 600 BCE.';

  css() { return TIME_RAIL_CSS; }
  stageHeight(st) { return st.portrait ? 430 : 400; }

  paint(st) {
    const s = this.stepIndex, P = st.portrait, pad = P ? 12 : 24, H = P ? 40 : 46, gap = P ? 18 : 14;
    const r = timeRail({ from: FROM, to: TO, x: pad, w: st.W - pad * 2, y: 84, lanes: 5, laneH: H, gap });
    let svg = `<text class="tr-label" x="${st.W / 2}" y="32" text-anchor="middle" font-size="${P ? 21 : 28}" dominant-baseline="central" ${fill('var(--sim-label)')}>${READ[s]}</text>`;
    const ages = s >= 2;
    svg += r.bar({ from: -1700, to: -600, lane: 0, tone: 2, label: ages ? 'Bronze Age' : null, ghost: !ages, dim: s > 2, grow: s === 2, size: P ? 16 : 19 });
    svg += r.bar({ from: -600, to: 300, lane: 0, tone: 5, label: ages ? 'Iron Age' : null, ghost: !ages, dim: s > 2, grow: s === 2, size: P ? 16 : 19 });
    D.forEach((d, i) => {
      if (s < d.seen) { svg += r.bar({ ...d, lane: i + 1, ghost: true, label: null }); return; }
      const lit = LIT[s].includes(d.id) || s === 0;
      svg += r.bar({ ...d, label: d.id === 'qin' && s === 3 ? null : d.label, lane: i + 1, dim: !lit, grow: s === d.seen, size: P ? 17 : 20, side: d.id === 'qin' ? 'left' : undefined });
    });
    if (s === 2) svg += r.mark({ at: -600, lane: 0, toLane: 2, tone: 5 });
    if (s === 3) {
      const x = r.at(-213), y = r.laneY(3) + H / 2, R = P ? 30 : 38;
      svg += `<circle cx="${x}" cy="${y}" r="${R}" ${stroke('var(--sim-accent)', 5)}/><path d="M${x + R * 0.72} ${y + R * 0.72}l${R * 0.62} ${R * 0.62}" ${stroke('var(--sim-accent)', 9)}/>`
        + `<text class="tr-label" x="${x - R - 12}" y="${y}" text-anchor="end" font-size="${P ? 22 : 26}" dominant-baseline="central" ${fill('var(--sim-label)')}>Qin</text>`;
    }
    if (s === 4) svg += r.span({ from: -206, to: 220, lane: 4, y: -0.62, label: '426 years', tone: 3, size: P ? 16 : 18 });
    svg += r.axis(P ? PTICKS[s] : TICKS[s]);
    return { svg };
  }
}
