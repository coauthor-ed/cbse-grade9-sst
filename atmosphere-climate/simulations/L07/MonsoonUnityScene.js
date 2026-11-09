// MonsoonUnityScene - what the ten stations share (L07 s09, 2 beats). Ten bars: the share of each station's
// year falling from June to September, computed from the table. (0) bars, with the wettest month of each.
// (1) the houses and clothes prompt: three drawn prompts under the same bars, nothing keyed.
import { SvgScene } from 'simulations/base/kit/SimSvg.js';
import { iconSvg } from 'simulations/base/kit/SimIcons.js';
import { STATIONS, MONTH_NAMES } from './StationData.js';
import { READ_CSS, readCard } from '../L06/IndiaMapSvg.js';

const SHARE = STATIONS.map((s) => {
  const jj = s.rain[5] + s.rain[6] + s.rain[7] + s.rain[8];
  const max = Math.max(...s.rain);
  return { s, pct: Math.round((100 * jj) / s.total), wet: MONTH_NAMES[s.rain.indexOf(max)] };
}).sort((a, b) => b.pct - a.pct);
const PROMPTS = [['house', 'Roofs'], ['building', 'Walls'], ['person', 'Clothes']];

export class MonsoonUnityScene extends SvgScene {
  static HEIGHT = 450;
  static PORTRAIT_HEIGHT = 530;
  static BEAT_STEP_MAP = [0, 1].map((idx) => [{ idx, dwellMs: null }]);
  static CONTROLS = [];
  static ARIA_LABEL = 'Ten bars showing the share of each station\u2019s yearly rain that falls from June to September. Chennai has the shortest bar: it is the one station whose wettest month falls outside those months.';

  css() { return READ_CSS + '.svs { padding: var(--sim-space-2) var(--sim-space-3); }'; }
  stageHeight(st) { return st.portrait ? 408 : 330; }

  paint(st) {
    const P = st.portrait, step = this.stepIndex, title = step ? 30 : 0, foot = step ? 52 : 0;
    const rows = st.H - title - foot, rh = rows / SHARE.length, nameW = P ? 158 : 300, right = 46, bx = nameW + 8, bw = st.W - bx - right;
    let svg = step ? `<text x="${st.W / 2}" y="20" text-anchor="middle" style="font:600 18px var(--sim-font-display);fill:var(--sim-label)">Rain from June to September</text>` : '';
    SHARE.forEach(({ s, pct, wet }, i) => {
      const y = title + i * rh, out = s.id === 'chennai', c = out ? 'var(--sim-series-2)' : 'var(--sim-series-1)', bh = Math.min(rh - 10, 18), by = y + (rh - bh) / 2;
      if (out) svg += `<rect x="1" y="${(y + 1).toFixed(1)}" width="${st.W - 2}" height="${(rh - 2).toFixed(1)}" rx="9" style="fill:color-mix(in oklab, var(--sim-series-2) 18%, var(--sim-bg-surface));stroke:var(--sim-series-2);stroke-width:2.5"/>`;
      if (P) {
        svg += `<text x="${nameW}" y="${(y + rh * 0.42).toFixed(1)}" text-anchor="end" style="font:800 ${s.name.length > 12 ? 14.5 : 15}px var(--sim-font);fill:var(--sim-label)">${s.name}</text>`;
        svg += `<text x="${nameW}" y="${(y + rh * 0.86).toFixed(1)}" text-anchor="end" style="font:700 14px var(--sim-font);fill:${out ? 'var(--sim-label)' : 'var(--sim-label-muted)'}">wettest: ${wet}</text>`;
      } else {
        svg += `<text x="10" y="${(y + rh * 0.68).toFixed(1)}" style="font:800 17px var(--sim-font);fill:var(--sim-label)">${s.name}</text>`;
        svg += `<text x="${nameW}" y="${(y + rh * 0.68).toFixed(1)}" text-anchor="end" style="font:700 15px var(--sim-font);fill:${out ? 'var(--sim-label)' : 'var(--sim-label-muted)'}">wettest: ${wet}</text>`;
      }
      svg += `<rect x="${bx}" y="${by.toFixed(1)}" width="${bw}" height="${bh.toFixed(1)}" rx="7" style="fill:var(--sim-track);opacity:0.6"/>`;
      svg += `<rect x="${bx}" y="${by.toFixed(1)}" width="${(bw * pct / 100).toFixed(1)}" height="${bh.toFixed(1)}" rx="7" style="fill:${c}"/>`;
      svg += `<text x="${st.W - 6}" y="${(y + rh * 0.68).toFixed(1)}" text-anchor="end" style="font:600 17px var(--sim-font-display);fill:var(--sim-label)">${pct}%</text>`;
    });
    if (step === 1) {
      const y = st.H - foot + 4, cw = st.W / 3;
      PROMPTS.forEach(([ic, name], i) => {
        const x = i * cw + cw / 2;
        svg += `<g transform="translate(${x - 54} ${y}) scale(0.9)">${iconSvg(ic, 3 + i)}</g><text x="${x - 8}" y="${y + 27}" style="font:600 16px var(--sim-font-display);fill:var(--sim-label)">${name}</text>`;
      });
    }
    return { svg, head: step ? '' : readCard('Rain from June to September', 'as a share of the year at each station') };
  }
}
