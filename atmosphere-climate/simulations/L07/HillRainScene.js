// HillRainScene - a section from the Bay of Bengal over flat Bengal to the Meghalaya hills. Mounts:
//   blk-l07-s02 predict, role setup: names and numbers only. No arrows, no cloud, no rain.
//   blk-l07-s03 2 beats: (0) air forced up the slope, cools, cloud, rain on the hills; (1) Kolkata on flat
//   land: the air stays low; June readings from the table. Heights are drawn much steeper than life, and a tag says so.
import { SvgScene } from 'simulations/base/kit/SimSvg.js';
import * as SkyArt from '../shared/SkyArt.js';
const { svgCloud, svgRain, svgSea, svgSkyGradient, svgSkyColour: sky } = SkyArt;
import { stationOf } from './StationData.js';
import { READ_CSS, readCard } from '../L06/IndiaMapSvg.js';

const BEATS = 2;
const KOL = stationOf('kolkata'), SHI = stationOf('shillong');
const AIR = 'var(--sim-series-1)';
const CSS = `
.hr-duo { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--sim-space-2); width: 100%; }
.hr-duo .mf-read { min-height: 70px; padding: var(--sim-space-1) var(--sim-space-2); }
.sim-dom-root--portrait .hr-duo .mf-big { font-size: var(--sim-text-xl); }
`;

export class HillRainScene extends SvgScene {
  static HEIGHT = 456;
  static PORTRAIT_HEIGHT = 540;
  static BEAT_STEP_MAP = [0, 1].map((idx) => [{ idx, dwellMs: null }]);
  static CONTROLS = [];
  static ARIA_LABEL = 'A section of land from the Bay of Bengal over flat Bengal to the Meghalaya hills, with Kolkata on the plain and Shillong on the hills.';

  get _isSetup() { return this._count !== BEATS; }
  onBeatChange(b, c) { this._count = c; super.onBeatChange(b, c); }
  css() { return READ_CSS + CSS; }
  stageHeight(st) { return st.portrait ? 330 : 350; }

  paint(st) {
    const W = st.W, H = st.H, setup = this._isSetup, step = this.stepIndex, ground = H - 60;
    const seaEnd = W * 0.2, plainEnd = W * 0.56, foot = ground, top = 104;
    const hx = (u) => plainEnd + (W - plainEnd) * u;
    const prof = [[0, 0], [0.16, 0.14], [0.34, 0.5], [0.5, 0.9], [0.62, 1], [0.8, 0.86], [1, 0.8]];
    const hy = (v) => foot - (foot - top) * v;
    let hill = `M${plainEnd} ${foot}`;
    for (const [u, v] of prof) hill += `L${hx(u).toFixed(1)} ${hy(v).toFixed(1)}`;
    hill += `L${W} ${H}L${plainEnd} ${H}Z`;
    let svg = `<defs>${svgSkyGradient('hr', 0, 7)}<clipPath id="hrc"><rect width="${W}" height="${H}" rx="16"/></clipPath></defs><g clip-path="url(#hrc)"><rect width="${W}" height="${H}" style="fill:url(#hr)"/>`;
    svg += svgSea(-4, ground + 4, 1, { w: seaEnd + 12, h: 60, t: 0 });
    svg += `<path d="M${seaEnd - 34} ${H}Q${seaEnd - 22} ${ground + 4} ${seaEnd + 12} ${ground}L${plainEnd + 2} ${ground}L${plainEnd + 2} ${H}Z" style="fill:${sky('grass')}"/><path d="M${seaEnd - 22} ${H}Q${seaEnd - 8} ${ground + 18} ${seaEnd + 16} ${ground + 16}L${plainEnd + 2} ${ground + 16}L${plainEnd + 2} ${H}Z" style="fill:${sky('grassDark')}"/>`;
    svg += `<path d="${hill}" style="fill:${sky('grassDark')}"/><path d="${hill}" transform="translate(0 16)" style="fill:${sky('rockDark')};opacity:0.7"/>`;
    const k = [W * 0.38, ground], s = [hx(0.56), hy(0.97)];
    if (!setup) {
      const kk = step === 1;
      const path = kk ? `M${W * 0.05} ${ground - 44}C${W * 0.25} ${ground - 44} ${W * 0.44} ${ground - 44} ${plainEnd - 8} ${ground - 40}`
        : `M${W * 0.05} ${ground - 44}C${W * 0.3} ${ground - 44} ${W * 0.52} ${ground - 40} ${hx(0.16)} ${ground - 80}S${hx(0.34)} ${hy(0.84)} ${hx(0.48)} ${hy(1.12)}`;
      const tip = kk ? [plainEnd + 8, ground - 40, 0] : [hx(0.5), hy(1.16), -60];
      svg += `<path d="${path}" class="sv-draw" pathLength="1" style="--len:1;--dur:1s;fill:none;stroke:${AIR};stroke-width:10;stroke-linecap:round"/>`
        + `<path d="M0 -12L18 0L0 12Z" transform="translate(${tip[0].toFixed(1)} ${tip[1].toFixed(1)}) rotate(${tip[2]})" style="fill:${AIR}"/>`;
      if (!kk) {
        svg += `<g class="sv-pop">${svgCloud(hx(0.4), hy(1.02) - 14, 1.05, { kind: 'rain', seed: 3 })}</g>` + svgRain(hx(0.38), hy(1.02) - 14, 1, { w: 96, h: 62, heavy: true, t: 1 });
      } else {
        svg += `<g opacity="0.75">${svgCloud(hx(0.4), hy(1.02) - 14, 0.8, { kind: 'rain', seed: 3 })}</g>`;
        svg += `<g class="sv-pop">${svgCloud(W * 0.38, ground - 96, 0.62, { seed: 5 })}</g>` + svgRain(W * 0.38, ground - 96, 0.8, { w: 66, h: 42, t: 1 });
      }
    }
    svg += '</g>' + `<rect width="${W}" height="${H}" rx="16" style="fill:none;stroke:var(--sim-stroke);stroke-width:3"/>`;
    const lab = (x, y, a, n, sub) => `<text x="${x}" y="${y}" text-anchor="${a}" style="font:600 16px var(--sim-font-display);fill:${sky('ink')};paint-order:stroke;stroke:${sky('cloud')};stroke-width:3.5">${n}</text>`
      + `<text x="${x}" y="${y + 17}" text-anchor="${a}" style="font:800 14px var(--sim-font);fill:${sky('ink')};paint-order:stroke;stroke:${sky('cloud')};stroke-width:3">${sub}</text>`;
    svg += `<circle cx="${k[0]}" cy="${k[1]}" r="6" style="fill:var(--sim-series-2);stroke:${sky('cloud')};stroke-width:2.5"/><circle cx="${s[0]}" cy="${s[1]}" r="6" style="fill:var(--sim-series-2);stroke:${sky('cloud')};stroke-width:2.5"/>`;
    svg += lab(k[0], ground + 22, 'middle', 'Kolkata', `${KOL.alt} m`) + lab(Math.min(s[0] + 4, W - 8), s[1] + 28, s[0] + 80 > W ? 'end' : 'middle', 'Shillong', `${SHI.alt} m`);
    svg += `<text x="10" y="${ground + 44}" style="font:800 14px var(--sim-font);fill:${sky('cloud')};paint-order:stroke;stroke:${sky('seaDeep')};stroke-width:3">Bay of Bengal</text>`;
    svg += `<text x="${W - 10}" y="${H - 8}" text-anchor="end" style="font:700 14px var(--sim-font);fill:${sky('cloud')};paint-order:stroke;stroke:${sky('ink')};stroke-width:3">height not to scale</text>`;
    const card = !setup && step === 1
      ? `<div class="hr-duo">${readCard(`${SHI.rain[5].toFixed(1)} cm`, 'Shillong in June')}${readCard(`${KOL.rain[5].toFixed(1)} cm`, 'Kolkata in June')}</div>`
      : `<div class="hr-duo">${readCard(`${SHI.total} cm`, 'Shillong, a year')}${readCard(`${KOL.total} cm`, 'Kolkata, a year')}</div>`;
    return { svg, head: card };
  }
}
