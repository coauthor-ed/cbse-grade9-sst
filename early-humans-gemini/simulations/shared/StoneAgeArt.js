/**
 * StoneAgeArt - small SVG drawings for lessons L04 to L06 of early-humans: signs of farming, grain,
 * clay, huts and animals. Each returns markup centred on (0, 0) in a 100-unit box, for use inside at().
 * Colours are tokens. Shape stays readable in the plain look: nothing relies on colour alone.
 */
import { esc } from 'simulations/base/SimUi.js';
import { fill, stroke, shade } from 'simulations/base/kit/SimSvg.js';

export const CLAY = 'color-mix(in srgb, var(--sim-series-8) 70%, var(--sim-strata-3))';
export const STONE = 'color-mix(in srgb, var(--sim-strata-6) 42%, var(--sim-bg-surface))';
export const EARTH = 'var(--sim-strata-3)';
export const SOIL = 'var(--sim-strata-2)';
export const THATCH = 'color-mix(in srgb, var(--sim-gold) 72%, var(--sim-strata-3))';
export const WOOD = 'color-mix(in srgb, var(--sim-strata-3) 74%, var(--sim-series-8))';
export const BONE = 'color-mix(in srgb, var(--sim-bg-surface) 70%, var(--sim-gold))';
export const LEAF = 'var(--sim-series-3)';
export const WATER = 'var(--sim-water)';
export const GRAIN = 'var(--sim-gold)';
export const COPPER = 'var(--sim-series-8)';
export const INK = 'var(--sim-label)';

/** Move and scale a group. */
export const at = (x, y, s, body, extra = '') => `<g transform="translate(${(+x).toFixed(1)} ${(+y).toFixed(1)}) scale(${(+s).toFixed(3)})"${extra ? ` ${extra}` : ''}>${body}</g>`;

/** SVG text. o: size, anchor, weight, display, col, opacity, stroke (a halo in the paper colour for text over art). */
export function text(x, y, t, o = {}) {
  const halo = o.halo ? `paint-order:stroke;stroke:var(--sim-bg-surface);stroke-width:${o.halo}px;stroke-linejoin:round;` : '';
  return `<text x="${(+x).toFixed(1)}" y="${(+y).toFixed(1)}" text-anchor="${o.anchor ?? 'middle'}" style="font-size:${o.size ?? 15}px;font-weight:${o.weight ?? 700};fill:${o.col ?? INK};${o.display ? 'font-family:var(--sim-font-display);' : ''}${o.opacity != null ? `opacity:${o.opacity};` : ''}${halo}">${esc(t)}</text>`;
}

const rim = (col, w = 3) => stroke(shade(col), w);

export function potArt(col = CLAY) {
  return `<path d="M-30 -36 H30 L24 -24 C44 -8 42 26 20 38 H-20 C-42 26 -44 -8 -24 -24 Z" ${fill(col, `stroke:${shade(col)};stroke-width:4;stroke-linejoin:round`)}/>`
    + `<path d="M-24 -24 H24" ${stroke(shade(col), 4)}/>`
    + `<path d="M-30 -2 C-14 8 14 8 30 -2" ${stroke(shade(col), 3)}/>`
    + `<path d="M-26 8 C-24 -4 -20 -12 -14 -16" ${stroke('color-mix(in srgb, var(--sim-bg-surface) 60%, transparent)', 5)}/>`;
}

export function hutArt(wall = EARTH, roof = THATCH) {
  return `<rect x="-30" y="-2" width="60" height="38" rx="5" ${fill(wall, `stroke:${shade(wall)};stroke-width:4`)}/>`
    + `<rect x="-9" y="10" width="18" height="26" rx="4" ${fill(shade(wall, 55))}/>`
    + `<path d="M-44 4 L0 -42 L44 4 Q0 12 -44 4 Z" ${fill(roof, `stroke:${shade(roof)};stroke-width:4;stroke-linejoin:round`)}/>`
    + `<path d="M-20 0 L-6 -26 M0 3 L1 -30 M20 0 L8 -26" ${stroke(shade(roof), 3)}/>`;
}

export function cowArt(col = WOOD) {
  return `<path d="M-34 -14 H16 Q28 -14 30 -2 V8 Q30 14 22 14 H-34 Q-42 14 -42 4 V-6 Q-42 -14 -34 -14 Z" ${fill(col, `stroke:${shade(col)};stroke-width:4`)}/>`
    + `<path d="M-32 12 V36 M-20 12 V36 M12 12 V36 M24 12 V36" ${stroke(shade(col), 8)}/>`
    + `<path d="M22 -12 L44 -24 Q50 -8 42 2 L30 4 Z" ${fill(col, `stroke:${shade(col)};stroke-width:4;stroke-linejoin:round`)}/>`
    + `<path d="M34 -22 Q32 -36 44 -36 M42 -24 Q46 -34 54 -30" ${stroke(shade(col), 4)}/>`;
}

export function pigArt(col = 'color-mix(in srgb, var(--sim-series-4) 40%, var(--sim-strata-3))') {
  return `<ellipse cx="-6" cy="0" rx="36" ry="22" ${fill(col, `stroke:${shade(col)};stroke-width:4`)}/>`
    + `<path d="M26 -12 L48 0 Q50 8 42 10 L24 14 Z" ${fill(col, `stroke:${shade(col)};stroke-width:4;stroke-linejoin:round`)}/>`
    + `<path d="M-26 18 V34 M-12 20 V34 M6 20 V34 M18 18 V34" ${stroke(shade(col), 7)}/>`
    + `<path d="M26 -12 L24 -24 L36 -14" ${fill(shade(col))}/>`
    + `<path d="M-42 -6 Q-52 -14 -46 -22" ${stroke(shade(col), 4)}/>`;
}

export function sheepArt(col = 'var(--sim-bg-surface)') {
  const puffs = [[-30, -2, 15], [-14, -12, 16], [6, -12, 16], [22, -2, 15], [-16, 6, 15], [8, 6, 15]];
  return `<path d="M-22 12 V36 M-8 14 V36 M8 14 V36 M20 12 V36" ${stroke('var(--sim-strata-5)', 6)}/>`
    + puffs.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" ${fill(col, `stroke:${shade(col, 70)};stroke-width:3`)}/>`).join('')
    + `<ellipse cx="38" cy="-8" rx="12" ry="9" ${fill('var(--sim-strata-5)')}/>`;
}

export function brickHouseArt(col = EARTH) {
  let bricks = '';
  for (let r = 0; r < 4; r += 1) bricks += `<path d="M-38 ${-8 + r * 11} H38" ${stroke(shade(col), 2.5)}/>`;
  return `<rect x="-40" y="-20" width="80" height="56" rx="4" ${fill(col, `stroke:${shade(col)};stroke-width:4`)}/>`
    + `<rect x="-46" y="-30" width="92" height="12" rx="4" ${fill(WOOD, `stroke:${shade(WOOD)};stroke-width:3`)}/>` + bricks
    + `<rect x="10" y="4" width="18" height="32" rx="3" ${fill(shade(col, 50))}/>`;
}

/** A grain plant. kind: wheat (a tight ear), rice (a drooping head), millet (a thick round spike). */
export function earArt(kind = 'wheat', col = GRAIN) {
  const stalk = `<path d="M0 44 C2 20 0 0 0 -10" ${stroke('var(--sim-series-3)', 5)}/><path d="M0 26 Q-20 18 -26 2 M2 34 Q22 26 26 12" ${stroke('var(--sim-series-3)', 4)}/>`;
  if (kind === 'millet') return stalk + `<rect x="-9" y="-44" width="18" height="44" rx="9" ${fill(col, `stroke:${shade(col)};stroke-width:3`)}/><path d="M-9 -30 H9 M-9 -20 H9 M-9 -10 H9" ${stroke(shade(col), 2.5)}/>`;
  if (kind === 'rice') {
    let d = '';
    for (let i = 0; i < 6; i += 1) d += `<ellipse cx="${6 + i * 5}" cy="${-22 + i * 6 + (i % 2) * 2}" rx="4.5" ry="7" ${fill(col, `stroke:${shade(col)};stroke-width:2`)} transform="rotate(${-12 + i * 8} ${6 + i * 5} ${-22 + i * 6})"/>`;
    return `<path d="M0 44 C0 10 -2 -20 8 -32 C22 -36 34 -14 34 10" ${stroke('var(--sim-series-3)', 4)}/><path d="M0 28 Q-20 20 -26 4" ${stroke('var(--sim-series-3)', 4)}/>` + d;
  }
  let d = '';
  for (let i = 0; i < 5; i += 1) d += `<ellipse cx="-7" cy="${-40 + i * 9}" rx="6" ry="8" ${fill(col, `stroke:${shade(col)};stroke-width:2`)}/><ellipse cx="7" cy="${-40 + i * 9}" rx="6" ry="8" ${fill(col, `stroke:${shade(col)};stroke-width:2`)}/>`;
  return stalk + d;
}

/** The five signs of the book's chart, as flat glyphs in one ink for a round badge. */
const GLYPH = {
  pottery: (k) => `<path d="M-9 -19 H9 L6 -12 C15 -5 14 11 7 17 H-7 C-14 11 -15 -5 -6 -12 Z" ${fill(k)}/>`,
  cultivation: (k) => `<path d="M-18 -16 L10 16" ${stroke(k, 5)}/><path d="M10 18 L22 8 L24 22 Z" ${fill(k)}/><path d="M-16 18 V6 M-16 8 Q-22 2 -24 -4 M-16 8 Q-10 2 -6 -2" ${stroke(k, 4)}/>`,
  livestock: (k) => `<path d="M-20 -8 H8 L12 -14 L24 -18 Q27 -8 22 -2 L14 0 V6 H12 V20 H6 V8 H-12 V20 H-18 V6 Q-23 4 -23 -3 Q-23 -8 -20 -8 Z" ${fill(k)}/><path d="M16 -18 Q15 -24 21 -25" ${stroke(k, 3)}/>`,
  sedentism: (k) => `<path d="M0 -22 L24 2 H-24 Z" ${fill(k)}/><path d="M-15 5 H15 V20 H4 V9 H-4 V20 H-15 Z" ${fill(k)}/>`,
  landscape: (k) => `<path d="M-14 20 V-6 M0 20 V-14 M14 20 V-6" ${stroke(k, 4)}/><ellipse cx="-14" cy="-11" rx="5" ry="9" ${fill(k)}/><ellipse cx="0" cy="-18" rx="5" ry="9" ${fill(k)}/><ellipse cx="14" cy="-11" rx="5" ry="9" ${fill(k)}/><path d="M-24 20 H24" ${stroke(k, 4)}/>`,
};
export const signGlyph = (id, ink) => GLYPH[id](ink);

/** A wavy strip of ground to stand things on. */
export function groundStrip(x0, x1, y, h, col = EARTH) {
  return `<path d="M${x0} ${y} C${x0 + (x1 - x0) * 0.25} ${y - 6} ${x0 + (x1 - x0) * 0.6} ${y + 6} ${x1} ${y} V${y + h} H${x0} Z" ${fill(col)}/>`;
}

export function fishArt(col = 'var(--sim-series-1)') {
  return `<path d="M-40 0 Q-8 -30 26 -4 L46 -20 V20 L26 4 Q-8 30 -40 0 Z" ${fill(col, `stroke:${shade(col)};stroke-width:4;stroke-linejoin:round`)}/><circle cx="-22" cy="-5" r="4.5" ${fill('var(--sim-bg-surface)')}/><path d="M-6 -12 Q2 0 -6 12" ${stroke(shade(col), 3)}/>`;
}

export function hareArt(col = WOOD) {
  return `<ellipse cx="-6" cy="8" rx="30" ry="20" ${fill(col, `stroke:${shade(col)};stroke-width:4`)}/><circle cx="26" cy="-6" r="14" ${fill(col, `stroke:${shade(col)};stroke-width:4`)}/>`
    + `<path d="M22 -18 Q14 -46 22 -46 Q30 -40 30 -18 Z M32 -16 Q36 -44 42 -40 Q46 -32 38 -14 Z" ${fill(col, `stroke:${shade(col)};stroke-width:3`)}/>`
    + `<path d="M-20 26 H-4 M8 26 H20" ${stroke(shade(col), 7)}/><circle cx="-36" cy="4" r="7" ${fill('var(--sim-bg-surface)', `stroke:${shade(col)};stroke-width:3`)}/><circle cx="32" cy="-8" r="2.5" ${fill(shade(col, 40))}/>`;
}

/** A small flat person (head and body) for counting people; a figure belongs on canvas scenes. */
export function personMark(col = 'var(--sim-label)') {
  return `<circle cx="0" cy="-22" r="11" ${fill(col)}/><path d="M-15 24 V-2 Q-15 -8 -8 -8 H8 Q15 -8 15 -2 V24 Z" ${fill(col)}/>`;
}

/** One microlith: a little stone blade, cutting edge up, base at y 0. w wide, h tall. */
export function bladeArt(w, h, col = STONE, seed = 0) {
  const j = [0.1, -0.08, 0.05, -0.04, 0.09, -0.1, 0.03][seed % 7] * h;
  const hl = 'color-mix(in srgb, var(--sim-bg-surface) 70%, transparent)';
  return `<path d="M${-w / 2} 0 L${-w / 2 + 2} ${-h * 0.75} L${-w * 0.1} ${-h + j} L${w / 2 - 1} ${-h * 0.82} L${w / 2} 0 Z" ${fill(col, `stroke:${shade(col, 62)};stroke-width:2;stroke-linejoin:round`)}/>`
    + `<path d="M${-w / 2 + 2.5} ${-h * 0.72} L${-w * 0.1} ${-h + j + 2} L${w / 2 - 2} ${-h * 0.8}" ${stroke(hl, 2.5)}/>`;
}
