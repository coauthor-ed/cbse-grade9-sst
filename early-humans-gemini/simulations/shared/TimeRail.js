/**
 * TimeRail - a true-scale time rail for SvgScene scenes (L07, L08, L09, L12). Not a scene.
 * Every width is the real duration: 15 years stays a sliver, and that is the point.
 * Strings only: it returns SVG markup and holds no state, so state comes from the beat.
 *
 *   import { timeRail, TIME_RAIL_CSS } from '../shared/TimeRail.js';
 *   css() { return TIME_RAIL_CSS; }                  // once, in the scene
 *   paint(st) {
 *     const r = timeRail({ from: -2600, to: -1400, x: 20, w: st.W - 40, y: 70, lanes: 4 });
 *     const svg = r.bar({ from: -2334, to: -2154, lane: 1, tone: 2, label: 'Akkadian' })
 *       + r.span({ from: -2334, to: -2154, lane: 2, label: '180 years' })
 *       + r.axis([-2500, -2000, -1500]);
 *     return { svg };
 *   }
 *
 * API (stable; years are numbers, negative = BCE, positive = CE):
 *   timeRail({ from, to, x, w, y, lanes = 1, laneH = 36, gap = 12 }) -> rail
 *   rail.at(year)    stage x of a year            rail.laneY(n)   stage y of lane n's top
 *   rail.bottom      y of the axis line           rail.pxPerYear
 *   rail.bar({ from, to, lane = 0, tone = 1, label, dim, ghost, grow, fuzzFrom, fuzzTo, size, side })
 *       A rounded bar. tone: series number 1..8. dim: faded (it stays readable as a shape).
 *       ghost: an empty outline that holds the slot. grow: spring in from the left (give it only on
 *       the beat it arrives). fuzzFrom / fuzzTo: the year the solid part starts / ends, the rest is
 *       dashed, as in the book's charts for a start or end that is not sharp.
 *       The label sits inside when it fits, else beside the bar (side: 'right' | 'left' to force),
 *       else above it. A bar under 3 px is drawn at 3 px, so a sliver can still be seen.
 *   rail.span({ from, to, lane = 0, y = 0, label, tone = 'accent', dim }) a bracket with its duration, drawn
 *       in lane n (leave a lane free for it); y: extra lanes down, -1 for just above lane 0.
 *       label defaults to 'N years'.
 *   rail.mark({ at, lane = 0, toLane, label, tone = 'accent', dim }) a thin upright line at a year
 *       through lanes lane..toLane, with an optional label above it.
 *   rail.axis(ticks, { dim }) the line and ticks. ticks: years or { at, label, hot }. hot: bold.
 *       Ticks that would overlap are dropped, first and last kept, a hot tick before a plain one.
 *   fmtRailYear(year) '2600 BCE', '220 CE' (no comma, as the book writes years).
 * Colours are tokens only. Shape comes from cushionRect, so the plain look stays safe.
 */
import { tone, inkVar, fill, stroke, shade, cushionRect } from 'simulations/base/kit/SimSvg.js';
import { lookOf } from 'simulations/base/kit/lookProfile.js';

export const TIME_RAIL_CSS = `
svg .tr-grow { transform-box: fill-box; transform-origin: left center; animation: tr-grow 0.6s var(--look-spring-soft) both; animation-delay: var(--d, 0s); }
@keyframes tr-grow { from { transform: scaleX(0); } to { transform: none; } }
svg .tr-label { font-family: var(--sim-font-display, var(--sim-font)); font-weight: 600; }
svg .tr-tick { font-family: var(--sim-font); font-weight: 800; }
@media (prefers-reduced-motion: reduce) { svg .tr-grow { animation: none; } }
`;

const textW = (s, size) => String(s).length * size * 0.56;
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export function fmtRailYear(y) { return y < 0 ? `${-y} BCE` : `${y} CE`; }

function txt(x, y, s, size, col, anchor = 'middle', cls = 'tr-label', extra = '') {
  return `<text class="${cls}" x="${x.toFixed(1)}" y="${y.toFixed(1)}" text-anchor="${anchor}" font-size="${size}" dominant-baseline="central" ${fill(col, extra)}>${esc(s)}</text>`;
}

export function timeRail(o) {
  const { from, to, x, w, y, lanes = 1, laneH = 36, gap = 12 } = o;
  const k = w / (to - from);
  const at = (yr) => x + (yr - from) * k;
  const laneY = (n) => y + n * (laneH + gap);
  const bottom = laneY(lanes) - gap + 10;
  const dimStyle = (d) => (d ? 'opacity:0.28' : '');

  function bar(b) {
    const lane = b.lane ?? 0, col = tone(b.tone ?? 1), yy = laneY(lane), size = b.size ?? 17;
    const x1 = at(b.from), x2raw = at(b.to), bw = Math.max(3, x2raw - x1), x2 = x1 + bw;
    const r = Math.min(10, bw / 2);
    let shape = '';
    if (b.ghost) {
      const rim = 2 * lookOf().rim;
      shape = `<rect x="${x1.toFixed(1)}" y="${yy}" width="${bw.toFixed(1)}" height="${laneH}" rx="${r}" ${stroke(`color-mix(in srgb, ${col} 55%, var(--sim-stroke))`, rim, 'stroke-dasharray:6 6')}/>`;
    } else {
      const s1 = b.fuzzFrom != null ? at(b.fuzzFrom) : x1, s2 = b.fuzzTo != null ? at(b.fuzzTo) : x2;
      const dash = (a, c) => {
        let out = '';
        for (let p = a; p < c - 1; p += 10) out += `<rect x="${p.toFixed(1)}" y="${yy}" width="${Math.min(6, c - p).toFixed(1)}" height="${laneH}" rx="2" ${fill(col, 'opacity:0.75')}/>`;
        return out;
      };
      shape = dash(x1, s1) + cushionRect(+s1.toFixed(1), yy, +(s2 - s1).toFixed(1), laneH, r, col) + dash(s2, x2);
    }
    let label = '';
    if (b.label) {
      const tw = textW(b.label, size), cy = yy + laneH / 2, solid = b.fuzzFrom != null || b.fuzzTo != null ? (b.fuzzTo != null ? at(b.fuzzTo) : x2) - (b.fuzzFrom != null ? at(b.fuzzFrom) : x1) : bw;
      if (!b.side && !b.ghost && tw + 12 <= solid) {
        const sx = b.fuzzFrom != null ? at(b.fuzzFrom) : x1;
        label = txt(sx + solid / 2, cy, b.label, size, inkVar(b.tone ?? 1));
      } else if (b.side === 'right' || (!b.side && x2 + 8 + tw <= x + w)) {
        label = txt(x2 + 8, cy, b.label, size, 'var(--sim-label)', 'start');
      } else if (b.side === 'left' || (!b.side && x1 - 8 - tw >= x)) {
        label = txt(x1 - 8, cy, b.label, size, 'var(--sim-label)', 'end');
      } else {
        const cx = Math.max(x + tw / 2, Math.min(x + w - tw / 2, (x1 + x2) / 2));
        label = txt(cx, yy - 10, b.label, size, 'var(--sim-label)');
      }
    }
    const grow = b.grow ? ' class="tr-grow"' : '';
    const st = [dimStyle(b.dim), b.grow && typeof b.grow === 'number' ? `--d:${b.grow}s` : ''].filter(Boolean).join(';');
    return `<g${grow}${st ? ` style="${st}"` : ''}>${shape}${label}</g>`;
  }

  function span(s) {
    const lane = s.lane ?? 0, yy = laneY(lane) + (s.y ?? 0) * (laneH + gap), x1 = at(s.from), x2 = at(s.to), col = typeof s.tone === 'number' ? tone(s.tone) : `var(--sim-${s.tone ?? 'accent'})`;
    const label = s.label ?? `${Math.abs(s.to - s.from)} years`, size = s.size ?? 19, tw = textW(label, size);
    const cy = yy + laneH * 0.3, lip = Math.min(10, laneH * 0.3), W = 3 * lookOf().rim;
    const path = `M${x1.toFixed(1)} ${(cy + lip + 6).toFixed(1)}V${(cy + 6).toFixed(1)}H${x2.toFixed(1)}V${(cy + lip + 6).toFixed(1)}`;
    const cx = Math.max(x + tw / 2, Math.min(x + w - tw / 2, (x1 + x2) / 2));
    return `<g style="${dimStyle(s.dim)}"><path d="${path}" ${stroke(col, W)}/>${txt(cx, cy - 9, label, size, 'var(--sim-label)')}</g>`;
  }

  function mark(m) {
    const xx = at(m.at), top = laneY(m.lane ?? 0) - 4, bot = m.toLane != null ? laneY(m.toLane) + laneH + 4 : bottom;
    const col = typeof m.tone === 'number' ? tone(m.tone) : `var(--sim-${m.tone ?? 'accent'})`;
    const size = m.size ?? 15, tw = m.label ? textW(m.label, size) : 0;
    const cx = Math.max(x + tw / 2, Math.min(x + w - tw / 2, xx));
    return `<g style="${dimStyle(m.dim)}"><path d="M${xx.toFixed(1)} ${top}V${bot}" ${stroke(col, 3 * lookOf().rim, 'stroke-dasharray:2 7')}/>`
      + (m.label ? txt(cx, top - 11, m.label, size, 'var(--sim-label)') : '') + '</g>';
  }

  function axis(ticks, a = {}) {
    const list = ticks.map((t) => (typeof t === 'number' ? { at: t } : t)).map((t) => ({ ...t, text: t.label ?? fmtRailYear(t.at), px: at(t.at) }));
    const size = 15, half = (t) => textW(t.text, size) / 2 + 5;
    const rank = (p) => (p.hot ? 0 : p === list[0] || p === list[list.length - 1] ? 1 : 2);
    const order = [...list].sort((p, q) => rank(p) - rank(q));
    const kept = [];
    for (const t of order) if (!kept.some((u) => Math.abs(u.px - t.px) < half(t) + half(u))) kept.push(t);
    const line = `<rect x="${x}" y="${bottom}" width="${w}" height="${Math.max(3, 5 * lookOf().rim)}" rx="2" ${fill('var(--sim-track)')}/>`
      + `<rect x="${x}" y="${bottom + 4}" width="${w}" height="1.5" ${fill(shade('var(--sim-track)'))}/>`;
    let out = line;
    for (const t of kept) {
      const cx = Math.max(x + textW(t.text, size) / 2, Math.min(x + w - textW(t.text, size) / 2, t.px));
      out += `<rect x="${(t.px - 1.5).toFixed(1)}" y="${bottom - 3}" width="3" height="12" rx="1.5" ${fill(t.hot ? 'var(--sim-label)' : 'var(--sim-label-muted)')}/>`
        + txt(cx, bottom + 23, t.text, t.hot ? size + 1 : size, t.hot ? 'var(--sim-label)' : 'var(--sim-label-muted)', 'middle', 'tr-tick');
    }
    return `<g style="${dimStyle(a.dim)}">${out}</g>`;
  }

  return { at, laneY, bottom, pxPerYear: k, bar, span, mark, axis };
}
