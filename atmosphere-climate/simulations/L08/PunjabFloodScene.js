// PunjabFloodScene - the book's account of the 2025 floods as a calm section across a river (L08 s04, 3 beats).
// Next is the only control: nothing adds water and nothing can be won. The river, its embankments and a village;
// the water stands higher each beat. (0) a high river, water reaching the fields. (1) natural causes: rain on hills
// and plain. (2) human-made causes: a weak bank, four numbered captions. No people. A diagram, not a map; no depth.
import { SvgScene } from 'simulations/base/kit/SimSvg.js';
import * as SkyArt from '../shared/SkyArt.js';
const { svgCloud, svgRain, svgHills, svgSkyGradient, svgSkyColour: sky } = SkyArt;
import { iconSvg } from 'simulations/base/kit/SimIcons.js';
import { READ_CSS, readCard } from '../L06/IndiaMapSvg.js';

const WATER = 'color-mix(in oklab, var(--sim-sea-shallow) 72%, var(--sim-strata-3))';
const CSS = `
.pf-river { display: flex; flex-wrap: wrap; justify-content: center; gap: 4px; }
`;

export class PunjabFloodScene extends SvgScene {
  static HEIGHT = 456;
  static PORTRAIT_HEIGHT = 560;
  static BEAT_STEP_MAP = [0, 1, 2].map((idx) => [{ idx, dwellMs: null }]);
  static CONTROLS = [];
  static ARIA_LABEL = 'A section across a river plain in Punjab with hills behind. Water from heavy rain has spread over the fields around houses.';

  css() { return READ_CSS + CSS; }
  stageHeight(st) { return st.portrait ? 326 : 340; }

  _house(x, y, s, wall) {
    return `<g transform="translate(${x} ${y}) scale(${s})"><rect x="-22" y="-30" width="44" height="30" style="fill:${wall};stroke:${sky('ink')};stroke-width:2.5"/>`
      + `<path d="M-30 -28L0 -54L30 -28Z" style="fill:${sky('soilDark')};stroke:${sky('ink')};stroke-width:2.5;stroke-linejoin:round"/>`
      + `<rect x="-6" y="-18" width="12" height="18" style="fill:${sky('woodDark')}"/><rect x="11" y="-22" width="8" height="8" style="fill:${sky('sea')}"/></g>`;
  }

  _tree(x, y, s) {
    return `<g transform="translate(${x} ${y}) scale(${s})"><rect x="-4" y="-34" width="8" height="36" style="fill:${sky('wood')}"/><circle cx="0" cy="-52" r="24" style="fill:${sky('grassDark')}"/><circle cx="-14" cy="-42" r="16" style="fill:${sky('grassDark')}"/><circle cx="13" cy="-42" r="17" style="fill:${sky('grass')}"/></g>`;
  }

  /** One embankment in section: a bank of earth with grass along its top. slump lowers the crown and cuts it. */
  _bank(cx, g, h, slump) {
    const top = g - h + slump, w = 18;
    const crown = slump ? `L${cx + w} ${top + 4}L${cx + 2} ${top + 14}L${cx - w} ${top}` : `L${cx + w} ${top}L${cx - w} ${top}`;
    return `<path d="M${cx - 46} ${g + 8}L${cx - w} ${top}${slump ? '' : ''}${crown.replace(`L${cx - w} ${top}`, '')}L${cx + 46} ${g + 8}Z" style="fill:${sky('soilDark')};stroke:${sky('woodDark')};stroke-width:2;stroke-linejoin:round"/>`
      + (slump ? '' : `<path d="M${cx - w} ${top}H${cx + w}" style="stroke:${sky('grass')};stroke-width:6;stroke-linecap:round"/>`);
  }

  paint(st) {
    const W = st.W, H = st.H, step = this.stepIndex, P = st.portrait, g = H - 76, bed = H - 18, rx = W * (P ? 0.2 : 0.22), rw = W * (P ? 0.3 : 0.3), bankH = 42;
    const lb = rx - 22, rb = rx + rw + 22, slump = step === 2 ? 24 : 0;
    const lev = [g - 26, g - 36, g - 36][step], plain = [g - 2, g - 9, g - 17][step];    // river, and water on the fields: rises by beat
    let svg = `<defs>${svgSkyGradient('pf', 0, 8)}<clipPath id="pfc"><rect width="${W}" height="${H}" rx="16"/></clipPath></defs><g clip-path="url(#pfc)"><rect width="${W}" height="${H}" style="fill:url(#pf);filter:saturate(0.6)"/>`;
    svg += svgHills(0, g - 14, 1, { w: W, h: 104, far: true, seed: 4, peaks: 3 });
    if (step >= 1) svg += svgCloud(W * 0.22, 54, 0.9, { kind: 'rain', seed: 4 }) + svgCloud(W * 0.64, 46, 1, { kind: 'rain', seed: 8 }) + svgRain(W * 0.22, 56, 1, { w: 120, h: g - 96, heavy: true, t: 1 }) + svgRain(W * 0.64, 48, 1, { w: 150, h: g - 88, heavy: true, t: 2 });
    // the plain, in section: grass over soil, with the river's channel cut into it
    svg += `<path d="M0 ${g}H${rx}L${rx + 12} ${bed}H${rx + rw - 12}L${rx + rw} ${g}H${W}V${H}H0Z" style="fill:${sky('soil')}"/><path d="M0 ${g}H${rx - 44}M${rb + 44} ${g}H${W}" style="stroke:${sky('grass')};stroke-width:8"/>`;
    let crop = '';
    for (let x = 12; x < lb - 54; x += 16) crop += `<path d="M${x} ${g}v-12M${x} ${g - 6}l-5 -6M${x} ${g - 6}l5 -6" style="fill:none;stroke:${sky('grassDark')};stroke-width:2.5;stroke-linecap:round"/>`;
    for (let x = rb + 56; x < W * 0.62; x += 16) crop += `<path d="M${x} ${g}v-12M${x} ${g - 6}l-5 -6M${x} ${g - 6}l5 -6" style="fill:none;stroke:${sky('grassDark')};stroke-width:2.5;stroke-linecap:round"/>`;
    svg += crop;
    const wall = 'color-mix(in oklab, var(--sim-strata-1) 60%, var(--sim-elev-peak))', s = P ? 0.78 : 0.9;
    svg += this._tree(W * (P ? 0.73 : 0.72), g, 0.72) + this._house(W * (P ? 0.66 : 0.66), g, s, wall) + this._house(W * (P ? 0.82 : 0.8), g, s, wall) + this._house(W * 0.93, g, s, wall);
    // water: the river to its level, then a sheet over the fields
    svg += `<path d="M${lb} ${lev}H${rb}V${bed + 1}H${lb}Z" style="fill:${WATER}"/>`;
    if (plain < g) {
      const x0 = rb + (slump ? 0 : 40);
      let d = `M${x0} ${plain}`;
      for (let x = x0; x < W; x += 28) d += `q7 -3 14 0t14 0`;
      svg += `<path d="${d}V${g + 3}H${x0}Z" style="fill:${WATER};opacity:0.88"/>`;
      if (step) { let e = `M0 ${g - 5}`; for (let x = 0; x < lb - 40; x += 28) e += `q7 -3 14 0t14 0`; svg += `<path d="${e}V${g + 3}H0Z" style="fill:${WATER};opacity:0.88"/>`; }
    }
    svg += `<path d="M${lb + 20} ${lev}h${rb - lb - 40}" style="stroke:${sky('foam')};stroke-width:2.5;stroke-dasharray:18 12;stroke-linecap:round;opacity:0.8"/>`;
    if (step === 2) svg += `<path d="M${rx + 16} ${bed}Q${rx + rw * 0.4} ${bed - 30} ${rx + rw - 16} ${bed}Z" style="fill:${sky('sandDark')}"/>`;
    svg += this._bank(lb, g, bankH, 0) + this._bank(rb, g, bankH, slump);
    if (step === 2) {
      svg += `<path d="M${rb - 22} ${lev}C${rb} ${lev - 3} ${rb + 10} ${lev + 6} ${rb + 40} ${plain}" style="fill:none;stroke:${WATER};stroke-width:9;stroke-linecap:round"/>`;
      // a warning post with a loudspeaker, for the fourth caption
      const mx = W * (P ? 0.56 : 0.56);
      svg += `<path d="M${mx} ${g}V${g - 74}" style="stroke:${sky('metalDark')};stroke-width:5;stroke-linecap:round"/><g transform="translate(${mx - 14} ${g - 104}) scale(0.72)">${iconSvg('megaphone', 2)}</g>`;
      const tag = (n, x, y) => `<circle cx="${x}" cy="${y}" r="14" style="fill:var(--sim-bg-surface);stroke:var(--sim-stroke);stroke-width:3"/><text x="${x}" y="${y + 6}" text-anchor="middle" style="font:600 17px var(--sim-font-display);fill:var(--sim-label)">${n}</text>`;
      svg += tag(1, rb, g - 42) + tag(2, W * (P ? 0.82 : 0.8), g - 62) + tag(3, rx + rw * 0.4, bed - 2 - 28) + tag(4, mx + 30, g - 92);
    }
    svg += `</g><rect width="${W}" height="${H}" rx="16" style="fill:none;stroke:var(--sim-stroke);stroke-width:3"/>`;
    const lab = `<text x="${W - 12}" y="${H - 8}" text-anchor="end" style="font:700 14px var(--sim-font);fill:${sky('cloud')};paint-order:stroke;stroke:${sky('ink')};stroke-width:3">a diagram, not a map</text>`;
    const card = step === 0 ? readCard('Punjab, 2025', 'villages, fields, houses, roads and bridges damaged')
      : step === 1 ? readCard('Satluj, Beas, Ravi, Ghaggar', 'already high before the heavy rains')
        : readCard('Four human-made causes', '1 embankments, 2 close to rivers, 3 silt, 4 late warnings');
    return { svg: svg + lab, head: card };
  }
}
