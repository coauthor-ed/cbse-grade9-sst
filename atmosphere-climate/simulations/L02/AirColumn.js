// AirColumn - the one sky column every SVG scene in this lesson draws, redrawn from the book's Fig 3.3:
// height 0 to 120 km on a true scale, a break, then the exosphere; the temperature line; the things in the air.
// Not a scene. The line's numbers: 30 C on the ground (an example day), about -55 C at 12 km,
// about -90 C at the mesopause. The thermosphere keeps rising past the top of the drawing.
import { fill, stroke, shade } from 'simulations/base/kit/SimSvg.js';
import { svgSkyColour as sc, svgSkyGradient, svgCloud, svgAeroplane } from '../shared/SkyArt.js';

export const LAYERS = [
  { id: 'tropo', name: 'Troposphere', a: 0, b: 12, tone: 1 },
  { id: 'strato', name: 'Stratosphere', a: 12, b: 50, tone: 7 },
  { id: 'meso', name: 'Mesosphere', a: 50, b: 80, tone: 5 },
  { id: 'thermo', name: 'Thermosphere', a: 80, b: 120, tone: 8 },
  { id: 'exo', name: 'Exosphere', a: 120, b: 138, tone: 4 },
];
export const PAUSES = [{ id: 'tropopause', name: 'Tropopause', km: 12 }, { id: 'stratopause', name: 'Stratopause', km: 50 }, { id: 'mesopause', name: 'Mesopause', km: 80 }];

// km and an x from 0 (cold) to 1 (hot) across the column.
const LINE = [[0, 0.62], [12, 0.18], [20, 0.18], [48, 0.56], [52, 0.56], [80, 0.06], [100, 0.1], [120, 0.42], [130, 0.74]];

/** The drawing box. y(km) maps height; km above 120 runs into the exosphere band. */
export function column(x, y, w, h) {
  const top = y + h * 0.1, base = y + h - 8, per = (base - top) / 120;
  return { x, y, w, h, top, base, per, yAt: (km) => (km <= 120 ? base - km * per : top - (km - 120) * (top - y) / 18) };
}

export function lineX(c, km) {
  for (let i = 1; i < LINE.length; i += 1) {
    if (km <= LINE[i][0]) { const [a, u] = LINE[i - 1], [b, v] = LINE[i]; return c.x + c.w * (u + (v - u) * (km - a) / (b - a)); }
  }
  return c.x + c.w * LINE[LINE.length - 1][1];
}

/** The temperature line up to kmTop, as a path d. */
export function lineD(c, k0, k1) {
  const pts = [k0, ...LINE.map((p) => p[0]).filter((k) => k > k0 && k < k1), k1];
  return pts.map((k, i) => `${i ? 'L' : 'M'}${lineX(c, k).toFixed(1)} ${c.yAt(k).toFixed(1)}`).join('');
}

export function skyDefs(id) { return svgSkyGradient(`${id}-sky`, 0, 84); }

/** Sky and ground for the column; veils dim the layers not lit. off(id) -> true dims that layer. */
export function skyBands(c, id, off = () => false) {
  let out = `<rect x="${c.x}" y="${c.y}" width="${c.w}" height="${c.h}" style="fill:url(#${id}-sky)"/>`;
  out += `<rect x="${c.x}" y="${c.y}" width="${c.w}" height="${c.top - c.y}" ${fill(shade(sc('seaDeep'), 26))}/>`;
  for (const l of LAYERS) {
    if (off(l.id)) {
      const y0 = l.id === 'exo' ? c.y : c.yAt(Math.min(l.b, 120));
      const y1 = l.id === 'exo' ? c.top : c.yAt(l.a);
      out += `<rect x="${c.x}" y="${y0}" width="${c.w}" height="${y1 - y0}" ${fill(shade(sc('seaDeep'), 40), 'opacity:0.55')}/>`;
    }
  }
  return out;
}

/** Dashed boundary lines at 12, 50, 80, and the break at 120. */
export function pauseLines(c, ink) {
  let out = '';
  for (const p of PAUSES) { const y = c.yAt(p.km); out += `<path d="M${c.x} ${y}H${c.x + c.w}" ${stroke(ink, 2.5, 'stroke-dasharray:9 8')}/>`; }
  const y = c.top, s = 7;
  let z = `M${c.x} ${y}`;
  for (let x = c.x + 12, up = 1; x <= c.x + c.w + 12; x += 12, up = -up) z += `L${x} ${y + up * s}`;
  return out + `<path d="${z}" ${stroke(ink, 2.5)}/>`;
}

/** The km scale at the left: 0 to 100 in 20s. */
export function kmTicks(c, ink, words) {
  let out = '';
  for (let k = 20; k <= 100; k += 20) out += `<path d="M${c.x} ${c.yAt(k)}h10" ${stroke(ink, 3)}/>${words(c.x + 14, c.yAt(k) + 5, String(k), { size: 14, ink })}`;
  return out + words(c.x + 14, c.yAt(120) + 21, 'km', { size: 14, ink });
}

/** Meteor streak: head at (x, y), tail up and to the right. */
export function meteorMark(x, y, s = 1) {
  return `<path d="M${x} ${y}l${26 * s} ${-26 * s}" ${stroke(sc('sunRay'), 5 * s)}/><circle cx="${x}" cy="${y}" r="${5 * s}" ${fill(sc('liquid'))}/>`;
}
/** A small satellite, centred. */
export function satelliteMark(x, y, s = 1) {
  return `<g transform="translate(${x} ${y}) scale(${s}) rotate(-18)"><rect x="-34" y="-8" width="24" height="16" rx="2" ${fill(sc('seaDeep'), `stroke:${sc('metalLit')};stroke-width:2`)}/><rect x="10" y="-8" width="24" height="16" rx="2" ${fill(sc('seaDeep'), `stroke:${sc('metalLit')};stroke-width:2`)}/><rect x="-10" y="-11" width="20" height="22" rx="5" ${fill(sc('metalLit'))}/></g>`;
}
/** Aurora curtains: a few soft vertical bands. */
export function auroraMark(x, y, w, h) {
  let out = '';
  for (let i = 0; i < 7; i += 1) {
    const px = x + i * w / 6;
    out += `<path d="M${px} ${y}q${(i % 2 ? 8 : -8)} ${h / 2} 0 ${h}" ${stroke(i % 3 === 2 ? 'var(--sim-series-5)' : 'var(--sim-series-3)', 7, 'opacity:0.75')}/>`;
  }
  return out;
}
export const groundBits = (c) => svgCloud(c.x + c.w * 0.5, c.yAt(4), 0.6, { seed: 4 }) + svgCloud(c.x + c.w * 0.32, c.yAt(6), 0.42, { seed: 9 });
export const plane = (x, y, s = 0.55) => svgAeroplane(x, y, s);
