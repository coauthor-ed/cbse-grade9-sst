// HarappanDraw.js - drawn objects for the L07 SVG scenes: clay, brick, copper, bead, shell, stone.
// Strings of SVG markup. Not a scene. Colours are tokens only. All sizes come from (x, y, s).
import { fill, stroke, shade } from 'simulations/base/kit/SimSvg.js';

export const CLAY = 'var(--sim-strata-3)', SOIL = 'var(--sim-strata-2)', SAND = 'var(--sim-strata-1)', STONE = 'var(--sim-strata-5)';
export const COPPER = 'color-mix(in oklab, var(--sim-series-8) 62%, var(--sim-strata-3))', WATER = 'var(--sim-sea-shallow)', INK = 'var(--sim-strata-6)';
export const n = (v) => +v.toFixed(1);

/** Round-bellied pot, foot at (x, y), s tall. painted: bands; plain: none. */
export function potSvg(x, y, s, col = CLAY, o = {}) {
  const w = s * 0.42, t = y - s;
  const body = `M${n(x - w * 0.5)} ${n(t)}H${n(x + w * 0.5)}L${n(x + w * 0.4)} ${n(t + s * 0.16)}C${n(x + w * 1.3)} ${n(t + s * 0.36)} ${n(x + w * 1.1)} ${n(y - s * 0.12)} ${n(x + w * 0.5)} ${n(y)}H${n(x - w * 0.5)}C${n(x - w * 1.1)} ${n(y - s * 0.12)} ${n(x - w * 1.3)} ${n(t + s * 0.36)} ${n(x - w * 0.4)} ${n(t + s * 0.16)}Z`;
  let d = '';
  if (o.painted) {
    const y1 = t + s * 0.34, y2 = t + s * 0.62;
    d = `<path d="M${n(x - w * 1.02)} ${n(y1)}Q${n(x)} ${n(y1 + s * 0.08)} ${n(x + w * 1.02)} ${n(y1)}" ${stroke(INK, s * 0.035)}/>`
      + `<path d="M${n(x - w * 0.98)} ${n(y2)}Q${n(x)} ${n(y2 + s * 0.08)} ${n(x + w * 0.98)} ${n(y2)}" ${stroke(INK, s * 0.035)}/>`;
    for (let i = -2; i <= 2; i++) d += `<path d="M${n(x + i * w * 0.36 - w * 0.13)} ${n(y2 - s * 0.03)}L${n(x + i * w * 0.36)} ${n(y1 + s * 0.09)}L${n(x + i * w * 0.36 + w * 0.13)} ${n(y2 - s * 0.03)}" ${stroke(INK, s * 0.03)}/>`;
  }
  return `<path d="${body}" ${fill(col)}/><path d="M${n(x + w * 0.2)} ${n(t + s * 0.2)}C${n(x + w * 1.1)} ${n(t + s * 0.4)} ${n(x + w * 0.9)} ${n(y - s * 0.12)} ${n(x + w * 0.5)} ${n(y)}H${n(x + w * 0.1)}C${n(x + w * 0.7)} ${n(y - s * 0.2)} ${n(x + w * 0.7)} ${n(t + s * 0.4)} ${n(x + w * 0.2)} ${n(t + s * 0.2)}Z" ${fill(shade(col, 78))}/>`
    + `<rect x="${n(x - w * 0.56)}" y="${n(t - s * 0.03)}" width="${n(w * 1.12)}" height="${n(s * 0.07)}" rx="${n(s * 0.03)}" ${fill(shade(col, 85))}/>` + d;
}

/** A row of beads, centred on (x, y), s across. */
export function beadsSvg(x, y, s, o = {}) {
  const cols = o.cols ?? ['var(--sim-series-6)', 'var(--sim-strata-1)', 'var(--sim-series-8)'], k = o.count ?? 5;
  const gap = s / k, th = Math.max(4, gap * 0.76);
  let out = `<path d="M${n(x - s / 2)} ${n(y)}H${n(x + s / 2)}" ${stroke('var(--sim-label-muted)', Math.max(1.5, s * 0.015))}/>`;
  for (let i = 0; i < k; i++) {
    const cx = x - s / 2 + gap * (i + 0.5), col = cols[i % cols.length], long = o.long && i % 2 === 0;
    const w = long ? gap * 0.94 : gap * 0.7, h = th;
    out += `<rect x="${n(cx - w / 2)}" y="${n(y - h / 2)}" width="${n(w)}" height="${n(h)}" rx="${n(h * 0.42)}" ${fill(col)}/>`
      + `<rect x="${n(cx - w * 0.3)}" y="${n(y - h * 0.34)}" width="${n(w * 0.5)}" height="${n(h * 0.16)}" rx="${n(h * 0.08)}" ${fill('color-mix(in oklab, var(--sim-bg-surface) 55%, transparent)')}/>`;
  }
  return out;
}

/** A shell bangle, centred on (x, y), r outer radius. */
export function bangleSvg(x, y, r, col = 'var(--sim-elev-peak)') {
  return `<ellipse cx="${n(x)}" cy="${n(y + r * 0.1)}" rx="${n(r * 0.8)}" ry="${n(r * 0.54)}" ${stroke(shade(col, 62), r * 0.3)}/>`
    + `<ellipse cx="${n(x)}" cy="${n(y)}" rx="${n(r * 0.8)}" ry="${n(r * 0.54)}" ${stroke(col, r * 0.28)}/>`;
}

/** A flat copper axe on a wooden handle, centred on (x, y), s tall. */
export function axeSvg(x, y, s, col = COPPER) {
  const hx = x - s * 0.12, wood = 'var(--sim-elev-high)';
  const head = `M${n(hx)} ${n(y - s * 0.4)}H${n(hx + s * 0.1)}Q${n(hx + s * 0.2)} ${n(y - s * 0.42)} ${n(hx + s * 0.4)} ${n(y - s * 0.56)}Q${n(hx + s * 0.54)} ${n(y - s * 0.33)} ${n(hx + s * 0.4)} ${n(y - s * 0.1)}Q${n(hx + s * 0.2)} ${n(y - s * 0.24)} ${n(hx + s * 0.1)} ${n(y - s * 0.26)}H${n(hx)}Z`;
  return `<g transform="rotate(32 ${n(x)} ${n(y)})"><rect x="${n(hx - s * 0.06)}" y="${n(y - s * 0.5)}" width="${n(s * 0.12)}" height="${n(s)}" rx="${n(s * 0.05)}" ${fill(wood)}/><path d="${head}" ${fill(shade(col, 72))} transform="translate(0 ${n(s * 0.03)})"/><path d="${head}" ${fill(col)}/></g>`;
}

/** A square seal, centred on (x, y), s wide. kind: 'lines' (early) | 'bull' (later, inscribed). */
export function sealSvg(x, y, s, kind = 'lines') {
  const col = 'var(--sim-strata-1)', ink = INK, l = x - s / 2, t = y - s / 2;
  let d = '';
  if (kind === 'lines') {
    for (let i = 1; i <= 3; i++) d += `<path d="M${n(l + s * 0.2)} ${n(t + s * i / 4)}H${n(l + s * 0.8)}" ${stroke(ink, s * 0.05)}/>`;
    d += `<path d="M${n(l + s * 0.3)} ${n(t + s * 0.2)}V${n(t + s * 0.8)}M${n(l + s * 0.7)} ${n(t + s * 0.2)}V${n(t + s * 0.8)}" ${stroke(ink, s * 0.05)}/>`;
  } else {
    d = `<path d="M${n(l + s * 0.22)} ${n(t + s * 0.6)}Q${n(l + s * 0.3)} ${n(t + s * 0.42)} ${n(l + s * 0.62)} ${n(t + s * 0.46)}L${n(l + s * 0.78)} ${n(t + s * 0.4)}L${n(l + s * 0.76)} ${n(t + s * 0.58)}L${n(l + s * 0.66)} ${n(t + s * 0.62)}V${n(t + s * 0.82)}M${n(l + s * 0.3)} ${n(t + s * 0.62)}V${n(t + s * 0.82)}" ${stroke(ink, s * 0.055)}/>`;
    for (let i = 0; i < 5; i++) d += `<path d="M${n(l + s * (0.2 + i * 0.15))} ${n(t + s * 0.16)}v${n(s * 0.14)}" ${stroke(ink, s * 0.05)}/>`;
  }
  return `<rect x="${n(l)}" y="${n(t + s * 0.05)}" width="${n(s)}" height="${n(s)}" rx="${n(s * 0.12)}" ${fill(shade(col, 70))}/><rect x="${n(l)}" y="${n(t)}" width="${n(s)}" height="${n(s)}" rx="${n(s * 0.12)}" ${fill(col)}/>` + d;
}

/** A broken pot piece with scratched marks, centred on (x, y), s wide. */
export function sherdSvg(x, y, s, o = {}) {
  const l = x - s / 2, t = y - s * 0.42;
  const p = `M${n(l + s * 0.1)} ${n(t + s * 0.12)}L${n(l + s * 0.62)} ${n(t)}L${n(l + s)} ${n(t + s * 0.3)}L${n(l + s * 0.86)} ${n(t + s * 0.8)}L${n(l + s * 0.3)} ${n(t + s * 0.84)}L${n(l)} ${n(t + s * 0.5)}Z`;
  const m = o.script
    ? `M${n(l + s * 0.22)} ${n(t + s * 0.3)}v${n(s * 0.3)}M${n(l + s * 0.36)} ${n(t + s * 0.3)}l${n(s * 0.1)} ${n(s * 0.15)}l${n(-s * 0.1)} ${n(s * 0.15)}M${n(l + s * 0.56)} ${n(t + s * 0.3)}v${n(s * 0.3)}h${n(s * 0.12)}v${n(-s * 0.3)}M${n(l + s * 0.78)} ${n(t + s * 0.3)}v${n(s * 0.3)}`
    : `M${n(l + s * 0.3)} ${n(t + s * 0.3)}l${n(s * 0.18)} ${n(s * 0.26)}M${n(l + s * 0.48)} ${n(t + s * 0.3)}l${n(-s * 0.18)} ${n(s * 0.26)}M${n(l + s * 0.62)} ${n(t + s * 0.56)}l${n(s * 0.12)} ${n(-s * 0.26)}l${n(s * 0.1)} ${n(s * 0.26)}`;
  return `<path d="${p}" ${fill(shade(CLAY, 70))} transform="translate(0 ${n(s * 0.05)})"/><path d="${p}" ${fill(CLAY)}/><path d="${m}" ${stroke(INK, s * 0.05)}/>`;
}

/** A row of chunky mud-brick wall, foot at y, from x, w wide, h tall. */
export function wallSvg(x, y, w, h, col = SOIL, o = {}) {
  const rows = o.rows ?? 3, bw = o.brick ?? w / 6, bh = h / rows;
  let out = `<rect x="${n(x)}" y="${n(y - h)}" width="${n(w)}" height="${n(h)}" rx="3" ${fill(shade(col, 72))}/>`;
  for (let r = 0; r < rows; r++) {
    for (let bx = x - (r % 2 ? bw / 2 : 0); bx < x + w - 2; bx += bw) {
      const a = Math.max(x, bx), b = Math.min(x + w, bx + bw);
      if (b - a < 3) continue;
      out += `<rect x="${n(a + 0.8)}" y="${n(y - h + r * bh + 0.8)}" width="${n(b - a - 1.6)}" height="${n(bh - 1.6)}" rx="1.6" ${fill(col)}/>`;
    }
  }
  return out;
}

/** A small flat-roofed mud house, foot centre (x, y), s wide. */
export function houseSvg(x, y, s, col = SOIL) {
  const h = s * 0.66;
  return `<rect x="${n(x - s / 2)}" y="${n(y - h)}" width="${n(s)}" height="${n(h)}" rx="${n(s * 0.06)}" ${fill(col)}/>`
    + `<rect x="${n(x - s * 0.56)}" y="${n(y - h - s * 0.05)}" width="${n(s * 1.12)}" height="${n(s * 0.12)}" rx="${n(s * 0.05)}" ${fill(shade(col, 74))}/>`
    + `<rect x="${n(x - s * 0.12)}" y="${n(y - h * 0.56)}" width="${n(s * 0.24)}" height="${n(h * 0.56)}" rx="${n(s * 0.05)}" ${fill(shade(col, 52))}/>`;
}

/** A Harappan city plan from above: blocks of houses, straight streets, drains. box (x, y, w, h). */
export function cityPlanSvg(x, y, w, h, o = {}) {
  const cols = o.cols ?? 4, rows = o.rows ?? 3, st = o.street ?? Math.max(8, w * 0.035);
  const bw = (w - st * (cols + 1)) / cols, bh = (h - st * (rows + 1)) / rows;
  let out = `<rect x="${n(x)}" y="${n(y)}" width="${n(w)}" height="${n(h)}" rx="10" ${fill(SAND)}/>`;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const bx = x + st + c * (bw + st), by = y + st + r * (bh + st);
      out += `<rect x="${n(bx)}" y="${n(by + 3)}" width="${n(bw)}" height="${n(bh)}" rx="4" ${fill(shade(SOIL, 62))}/><rect x="${n(bx)}" y="${n(by)}" width="${n(bw)}" height="${n(bh)}" rx="4" ${fill(SOIL)}/>`;
      const inset = Math.min(bw, bh) * 0.2;
      out += `<rect x="${n(bx + inset)}" y="${n(by + inset)}" width="${n(bw * 0.4)}" height="${n(bh - 2 * inset)}" rx="3" ${fill(shade(SOIL, 78))}/>`;
      if ((r + c) % 2 === 0) out += `<rect x="${n(bx + bw * 0.62)}" y="${n(by + inset)}" width="${n(bw * 0.24)}" height="${n(bh * 0.3)}" rx="2" ${fill(shade(SOIL, 78))}/>`;
    }
  }
  if (o.drains !== false) {
    for (let r = 1; r < rows; r++) { const yy = y + st + r * (bh + st) - st / 2; out += `<path d="M${n(x + 4)} ${n(yy)}H${n(x + w - 4)}" ${stroke(WATER, Math.max(3, st * 0.3), 'stroke-dasharray:10 7')}/>`; }
  }
  return out;
}
