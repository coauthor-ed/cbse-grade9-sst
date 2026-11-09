// AirBits - small SVG pieces shared by the air scenes in L01 and L02: gas colours (one per gas, in
// text and figure), words, rimmed panels, a framed sky, a sealed jar. Not a scene. Colours are tokens.
import { svgSkyColour, svgSkyGradient } from '../shared/SkyArt.js';
import { fill, stroke, shade } from 'simulations/base/kit/SimSvg.js';
import { lookOf } from 'simulations/base/kit/lookProfile.js';

/** One tone per gas, across every air scene. */
export const GASES = [
  { id: 'nitrogen', name: 'Nitrogen', share: 78, tone: 1 },
  { id: 'oxygen', name: 'Oxygen', share: 21, tone: 2 },
  { id: 'argon', name: 'Argon', share: 0.93, tone: 5 },
  { id: 'co2', name: 'Carbon dioxide', share: 0.04, tone: 6 },
  { id: 'others', name: 'Others', share: 0.03, tone: 4 },
];
export const VAPOUR_TONE = 7;
export const OZONE_TONE = 4;
export const col = (n) => `var(--sim-series-${n})`;
export const inkOnTone = (n) => `var(--sim-ink-on-${n}, var(--sim-bg-deep))`;

/** Dark ink for words on the day sky: the sky stays daylight in both themes. */
export const SKY_INK = svgSkyColour('ink');
export const SKY_WHITE = svgSkyColour('cloud');

/** A line of SVG text. o: size, weight, ink, anchor, display (Fredoka), halo (a soft outline for sky text). */
export function words(x, y, s, o = {}) {
  const fam = o.display ? 'var(--sim-font-display)' : 'var(--sim-font)';
  const st = [`font-family:${fam}`, `font-size:${o.size ?? 15}px`, `font-weight:${o.weight ?? (o.display ? 600 : 800)}`, `fill:${o.ink ?? 'var(--sim-label)'}`];
  if (o.halo) st.push(`paint-order:stroke`, `stroke:${o.halo}`, `stroke-width:${o.haloW ?? 4}px`, 'stroke-linejoin:round');
  return `<text x="${x}" y="${y}" text-anchor="${o.anchor ?? 'start'}" style="${st.join(';')}">${s}</text>`;
}

/** A rimmed panel with a flat lip. o: fill, rim, r, lit. */
export function panel(x, y, w, h, o = {}) {
  const L = lookOf(), r = (o.r ?? 16) * (L.radius ?? 1), lip = 4 * (L.lip ?? 1), rim = o.rim ?? 'var(--sim-stroke)';
  return `<rect x="${x}" y="${y + lip}" width="${w}" height="${h}" rx="${r}" ${fill(shade(rim, 70))}/>`
    + `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" ${fill(o.fill ?? 'var(--sim-bg-surface)', `stroke:${rim};stroke-width:${(o.lit ? 3.5 : 2.5) * Math.max(0.5, L.rim ?? 1)}`)}/>`;
}

/** The whole stage as a rounded window on the sky. body goes inside the frame. */
export function skyFrame(st, id, km0, km1, body) {
  const r = 18 * (lookOf().radius ?? 1), m = 2;
  return `<defs>${svgSkyGradient(`${id}-sky`, km0, km1)}<clipPath id="${id}-clip"><rect x="${m}" y="${m}" width="${st.W - 2 * m}" height="${st.H - 2 * m}" rx="${r}"/></clipPath></defs>`
    + `<g clip-path="url(#${id}-clip)"><rect x="0" y="0" width="${st.W}" height="${st.H}" style="fill:url(#${id}-sky)"/>${body}</g>`
    + `<rect x="${m}" y="${m}" width="${st.W - 2 * m}" height="${st.H - 2 * m}" rx="${r}" ${stroke(svgSkyColour('inkSoft'), 3)}/>`;
}

// -- a sealed glass jar ----------------------------------------------------------------------
// (x, y) top left of the body; w by h is the inside of the jar. Neck and lid sit above y.
const jarPath = (x, y, w, h, p = 0) => {
  const r = 26;
  return `M${x - p} ${y + r}Q${x - p} ${y - p} ${x + r} ${y - p}H${x + w - r}Q${x + w + p} ${y - p} ${x + w + p} ${y + r}V${y + h - r}Q${x + w + p} ${y + h + p} ${x + w - r} ${y + h + p}H${x + r}Q${x - p} ${y + h + p} ${x - p} ${y + h - r}Z`;
};
export function jarBack(x, y, w, h) {
  const glass = svgSkyColour('glass'), edge = svgSkyColour('glassEdge');
  return `<ellipse cx="${x + w / 2}" cy="${y + h + 13}" rx="${w * 0.56}" ry="8" ${fill(svgSkyColour('woodDark'), 'opacity:0.4')}/>`
    + `<path d="${jarPath(x, y, w, h, 9)}" ${fill(edge)}/><path d="${jarPath(x, y, w, h, 5)}" ${fill(glass)}/>`;
}
export function jarFront(x, y, w, h, o = {}) {
  const lidW = o.lidW ?? w * 0.66, lx = x + (w - lidW) / 2, metal = svgSkyColour('metal'), dark = svgSkyColour('metalDark'), lit = svgSkyColour('metalLit');
  const hl = svgSkyColour('sunCore');
  return `<rect x="${x + 10}" y="${y + 18}" width="9" height="${h * 0.56}" rx="4.5" ${fill(hl, 'opacity:0.5')}/>`
    + `<rect x="${lx + 12}" y="${y - 24}" width="${lidW - 24}" height="20" ${fill(svgSkyColour('glassEdge'))}/>`
    + `<rect x="${lx}" y="${y - 46}" width="${lidW}" height="28" rx="9" ${fill(dark)}/><rect x="${lx}" y="${y - 46}" width="${lidW}" height="23" rx="9" ${fill(metal)}/><rect x="${lx + 10}" y="${y - 42}" width="${lidW - 20}" height="5" rx="2.5" ${fill(lit)}/>`;
}
/** A wooden plank a jar stands on. */
export function plank(x, y, w, h = 18) {
  return `<rect x="${x}" y="${y + 6}" width="${w}" height="${h}" rx="6" ${fill(svgSkyColour('woodDark'))}/><rect x="${x}" y="${y}" width="${w}" height="${h - 2}" rx="6" ${fill(svgSkyColour('wood'))}/><rect x="${x + 8}" y="${y + 3}" width="${w - 16}" height="4" rx="2" ${fill(svgSkyColour('woodLit'))}/>`;
}
