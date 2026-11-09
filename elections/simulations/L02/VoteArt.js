// VoteArt.js - bars and cards for the L02 SVG scenes, and the made-up data behind them. A helper, not a scene.
import { esc } from 'simulations/base/SimUi.js';

// A made-up Haritbhumi: 25 constituencies of equal size. [A, B, C] per cent. Sums: 40, 35, 25. Wins: 15, 7, 3.
export const SEATS = [[46, 39, 15], [49, 31, 20], [50, 35, 15], [49, 37, 14], [49, 36, 15], [46, 28, 26], [32, 26, 42], [30, 30, 40], [29, 40, 31], [27, 35, 38], [43, 37, 20], [44, 42, 14], [34, 39, 27], [29, 39, 32], [42, 45, 13], [40, 27, 33], [46, 36, 18], [42, 37, 21], [42, 22, 36], [40, 23, 37], [32, 35, 33], [35, 45, 20], [48, 37, 15], [38, 33, 29], [38, 41, 21]];
export const winner = (r) => r.indexOf(Math.max(...r));
export const PARTY = [{ m: 'A', tone: 1 }, { m: 'B', tone: 2 }, { m: 'C', tone: 3 }];

export const col = (t) => (typeof t === 'number' ? `var(--sim-series-${t})` : t);
export const soft = (t, p = 18) => `color-mix(in srgb,${col(t)} ${p}%,var(--sim-bg-surface))`;

export const VOTE_CSS = `
.va-h { font-family: var(--sim-font-display, var(--sim-font)); font-weight: 700; fill: var(--sim-label); }
.va-t { font-family: var(--sim-font); font-weight: 800; fill: var(--sim-label); }
.va-m { font-family: var(--sim-font); font-weight: 700; fill: var(--sim-label-muted); }
`;

export const text = (cls, x, y, size, s, anchor = 'start') => `<text class="${cls}" x="${x}" y="${y}" font-size="${size}" text-anchor="${anchor}">${esc(s)}</text>`;

/** A rimmed panel with a lip. */
export const panel = (x, y, w, h, t = 'var(--sim-stroke)', fill = 'var(--sim-bg-surface)', sw = 3) =>
  `<rect x="${x}" y="${y + 4}" width="${w}" height="${h}" rx="14" style="fill:${col(t)}"/><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="14" style="fill:${fill};stroke:${col(t)};stroke-width:${sw}"/>`;

/** Horizontal bars. rows: [{ m, tone, v, dim, label, right }]. max: the value at full width. */
export function bars(x, y, w, rows, o = {}) {
  const max = o.max ?? 60, h = o.h ?? 40, gap = o.gap ?? 12, lx = o.lx ?? 34, tw = w - lx - (o.rw ?? 54);
  let s = '';
  rows.forEach((r, i) => {
    const yy = y + i * (h + gap), bw = Math.max(0, (r.v / max) * tw);
    s += `<g opacity="${r.dim ? 0.35 : 1}">${text('va-h', x + lx - 10, yy + h / 2 + 8, o.fs ?? 24, r.m, 'end')}`
      + `<rect x="${x + lx}" y="${yy}" width="${tw}" height="${h}" rx="9" style="fill:var(--sim-track)" opacity="0.5"/>`
      + `<rect x="${x + lx}" y="${yy}" width="${bw}" height="${h}" rx="9" style="fill:${col(r.tone)}"/>`
      + text('va-h', x + lx + tw + 8, yy + h / 2 + 8, o.fs ?? 24, r.right ?? String(r.v)) + '</g>';
  });
  if (o.line != null) {
    const lxx = x + lx + (o.line / max) * tw, bot = y + rows.length * (h + gap) - gap + 4;
    s += `<path d="M${lxx} ${y - 8} V${bot}" style="fill:none;stroke:var(--sim-label);stroke-width:3;stroke-dasharray:7 6"/>`;
    if (o.lineLabel) s += text('va-t', lxx, y - 14, 15, o.lineLabel, o.lineAnchor ?? 'middle');
  }
  return s;
}

/** Wrap text to about `max` characters a line. */
export function lines(s, max) {
  const out = []; let l = '';
  for (const w of s.split(' ')) { if ((l + ' ' + w).trim().length > max) { out.push(l); l = w; } else l = (l + ' ' + w).trim(); }
  if (l) out.push(l);
  return out;
}
export const para = (cls, x, y, size, s, max, lh = size * 1.3, anchor = 'start') => lines(s, max).map((l, i) => text(cls, x, y + i * lh, size, l, anchor)).join('');
