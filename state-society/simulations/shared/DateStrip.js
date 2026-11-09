// DateStrip.js - one to-scale date strip for the state-society scenes.
// A helper, not a scene: no class here. The gap between two dates on the bar is true to the
// years between them, so a span reads at a glance. The date is the biggest thing on the strip.
//
// Same spec for every renderer:
//   const STRIP = {
//     from: -300, to: 500,                    // years, negative = BCE (the two ends of the bar)
//     marks: [
//       { id: 'ashoka', at: -250, when: '3rd c. BCE', label: 'Ashoka', tone: 2 },
//       { id: 'rudra',  at: 150,  when: 'c. 150 CE',  label: 'Rudradaman', tone: 3, ghost: true },
//     ],
//     spans: [{ from: -250, to: 455, label: 'about 700 years', tone: 'accent' }],   // optional
//   };
// mark.ghost: shown as a place on the bar with the label held back (nothing named yet).
// mark.hide: not drawn at all, its place kept, so nothing moves when it is revealed.
// tone: series number 1-8, or a token key ('accent', 'gold'). `lit`: ids; others dim. null: all full.
//
// Canvas:  const box = drawDateStrip(ctx, c, STRIP, { x, y, w, size, lit, labelSize, k });
//   y is the bar's top edge. size (default 28): the date's px in design units. A 680 canvas can be
//   as small as 0.43 on a 390 phone, so 28 lands near 12 screen px. Returns { h, marks: { id: { x, y, r } } },
//   h being the full height used, and each mark's box for hit tests (hit area 44 screen px is the
//   scene's to check). k (0..1): grows the bar left to right on entry; marks pop as it passes them.
//   stripHeight(STRIP, size): the height without drawing, for layout before paint.
// SVG:     dateStripSvg(STRIP, { x, y, w, size, lit }) returns an svg string for a viewBox scene.
//   Marks carry data-date="id" so a scene can make them tappable.
// DOM:     dateStripHtml(STRIP, { size, lit, width }) returns a self-sized svg element string.
//
// Colours are tokens. ASCII only: dates with diacritics are passed in by the scene.
import { font, mix, alpha, rr, clamp01 } from 'simulations/base/kit/SimLook.js';
import { esc } from 'simulations/base/SimUi.js';

const BAR_H = 16;
const DOT_R = 11;
const STEM = 12;

const posOf = (s, at) => clamp01((at - s.from) / (s.to - s.from));
const widthOf = (text, px, heavy) => String(text ?? '').length * px * (heavy ? 0.56 : 0.52);

/**
 * Lanes: a mark's two text lines sit centred under its dot, pushed in from the strip ends;
 * a mark that would hit its left neighbour drops a lane. Measured by the caller's measure().
 */
function layout(s, W, size, labelSize, measure) {
  const lineH = size * 1.18 + labelSize * 1.2 + 8;
  const placed = [];
  const out = [];
  for (const m of s.marks ?? []) {
    const cx = posOf(s, m.at) * W;
    const tw = Math.max(measure(m.when, size, true), m.ghost ? 0 : measure(m.label, labelSize, false)) + 12;
    const left = Math.max(0, Math.min(W - tw, cx - tw / 2));
    // Before dropping a lane, slide the marks already placed to the left, if the row has room.
    const row = placed.filter((p) => p.lane === 0);
    const need = row.length ? row[row.length - 1].right + 8 - left : 0;
    let room = need > 0 && row.length ? row[0].left : 0;
    for (let i = 1; i < row.length; i++) room += row[i].left - row[i - 1].right - 8;
    if (need > 0 && room >= need) {
      let push = need;
      for (let i = row.length - 1; i >= 0; i--) {
        const r = row[i];
        r.left -= push; r.right -= push; r.item.tx -= push;
        const gap = i ? r.left - (row[i - 1].right + 8) : 0;
        push = i && gap < 0 ? -gap : 0;
      }
    }
    let lane = 0;
    while (placed.some((p) => p.lane === lane && left < p.right + 8 && left + tw > p.left - 8)) lane += 1;
    const item = { m, cx, tx: left + tw / 2, lane, lineH };
    placed.push({ lane, left, right: left + tw, item });
    out.push(item);
  }
  const lanes = out.reduce((n, a) => Math.max(n, a.lane + 1), 1);
  const spanH = (s.spans ?? []).length ? 34 : 0;
  return { items: out, lanes, lineH, h: BAR_H + STEM + lanes * lineH + spanH };
}

/** Height of the strip at this date size, before anything is drawn. */
export function stripHeight(s, size = 28, labelSize = size) {
  return layout(s, 640, size, labelSize, widthOf).h;
}

const canvasTone = (c, t) => (typeof t === 'number' ? c[`s${((t - 1) % 8) + 1}`] : c[t] ?? c.accent);

/** Paint on a canvas. Returns { h, marks } in design px. See the header. */
export function drawDateStrip(ctx, c, s, o = {}) {
  const { x, y, w } = o;
  const size = o.size ?? 28, labelSize = o.labelSize ?? size;
  const lit = o.lit ?? null, k = o.k ?? 1;
  const measure = (t, px, heavy) => {
    ctx.font = font(c, heavy ? 700 : 800, px, heavy);
    return ctx.measureText(String(t ?? '')).width;
  };
  ctx.save();
  const L = layout(s, w, size, labelSize, measure);
  rr(ctx, x, y + 3, w, BAR_H, BAR_H / 2);
  ctx.fillStyle = mix(c.track, c.bgDeep, 0.25);
  ctx.fill();
  rr(ctx, x, y, w, BAR_H, BAR_H / 2);
  ctx.fillStyle = c.track;
  ctx.fill();
  const barTop = y, barMid = y + BAR_H / 2;

  for (const sp of s.spans ?? []) {
    if (sp.hide) continue;
    const x0 = x + posOf(s, sp.from) * w, x1 = x + posOf(s, sp.to) * w;
    const col = canvasTone(c, sp.tone ?? 'accent');
    const by = y + BAR_H + STEM + L.lanes * L.lineH + 6;
    ctx.strokeStyle = col;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x0, by - 7); ctx.lineTo(x0, by); ctx.lineTo(x1, by); ctx.lineTo(x1, by - 7);
    ctx.stroke();
    if (sp.label) {
      ctx.font = font(c, 800, labelSize);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillStyle = c.label;
      ctx.fillText(sp.label, (x0 + x1) / 2, by + 4);
    }
  }

  const marks = {};
  for (const it of L.items) {
    const { m } = it;
    if (m.hide) continue;
    const px = x + it.cx;
    const u = clamp01((k - posOf(s, m.at) * 0.8) / 0.2);
    if (u <= 0) continue;
    const dim = lit && !lit.includes(m.id);
    const col = canvasTone(c, m.tone ?? 1);
    ctx.globalAlpha = dim ? 0.3 : 1;
    const topY = barTop + BAR_H + STEM + it.lane * L.lineH;
    ctx.strokeStyle = alpha(col, 0.7);
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(px, barMid);
    ctx.lineTo(Math.abs(it.tx + x - px) > 60 ? it.tx + x : px, topY);   // a mark slid along its row leans to its label
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(px, barMid, DOT_R * u, 0, Math.PI * 2);
    ctx.fillStyle = col;
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = c.bgSurface;
    ctx.stroke();
    const tx = x + it.tx;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.font = font(c, 700, size, true);
    ctx.fillStyle = c.label;
    ctx.fillText(m.when ?? '', tx, topY + 2);
    if (!m.ghost && m.label) {
      ctx.font = font(c, 800, labelSize);
      ctx.fillStyle = c.labelMuted;
      ctx.fillText(m.label, tx, topY + 4 + size * 1.18);
    }
    ctx.globalAlpha = 1;
    marks[m.id] = { x: px, y: barMid, r: DOT_R + 10, top: topY, bottom: topY + L.lineH, tx };
  }
  ctx.restore();
  return { h: L.h, marks };
}

const svgTone = (t) => (typeof t === 'number' ? `var(--sim-series-${((t - 1) % 8) + 1})` : `var(--sim-${t})`);

/** An svg fragment for a viewBox scene: the same strip. Text at font sizes in viewBox units. */
export function dateStripSvg(s, o = {}) {
  const { x = 0, y = 0, w } = o;
  const size = o.size ?? 22, labelSize = o.labelSize ?? Math.round(size * 0.8);
  const lit = o.lit ?? null;
  const L = layout(s, w, size, labelSize, widthOf);
  const barMid = y + BAR_H / 2;
  let out = `<rect x="${x}" y="${y + 3}" width="${w}" height="${BAR_H}" rx="${BAR_H / 2}" style="fill:color-mix(in oklab, var(--sim-track) 75%, var(--sim-bg-deep))"/>`
    + `<rect x="${x}" y="${y}" width="${w}" height="${BAR_H}" rx="${BAR_H / 2}" style="fill:var(--sim-track)"/>`;
  for (const sp of s.spans ?? []) {
    if (sp.hide) continue;
    const x0 = x + posOf(s, sp.from) * w, x1 = x + posOf(s, sp.to) * w;
    const by = y + BAR_H + STEM + L.lanes * L.lineH + 6;
    out += `<path d="M${x0} ${by - 7}V${by}H${x1}V${by - 7}" style="fill:none;stroke:${svgTone(sp.tone ?? 'accent')};stroke-width:3;stroke-linecap:round;stroke-linejoin:round"/>`;
    if (sp.label) out += `<text x="${(x0 + x1) / 2}" y="${by + 4 + labelSize}" text-anchor="middle" style="font:800 ${labelSize}px var(--sim-font);fill:var(--sim-label)">${esc(sp.label)}</text>`;
  }
  for (const it of L.items) {
    const { m } = it;
    if (m.hide) continue;
    const px = x + it.cx, tx = x + it.tx;
    const topY = y + BAR_H + STEM + it.lane * L.lineH;
    const dim = lit && !lit.includes(m.id);
    const col = svgTone(m.tone ?? 1);
    out += `<g data-date="${esc(m.id)}" style="opacity:${dim ? 0.3 : 1};transition:opacity .2s">`
      + `<path d="M${px} ${barMid}V${topY}" style="fill:none;stroke:${col};stroke-width:2.5;opacity:.7"/>`
      + `<circle cx="${px}" cy="${barMid}" r="${DOT_R}" style="fill:${col};stroke:var(--sim-bg-surface);stroke-width:3"/>`
      + `<text x="${tx}" y="${topY + size}" text-anchor="middle" style="font:700 ${size}px var(--sim-font-display, var(--sim-font));fill:var(--sim-label)">${esc(m.when ?? '')}</text>`
      + (!m.ghost && m.label ? `<text x="${tx}" y="${topY + size * 1.18 + labelSize + 2}" text-anchor="middle" style="font:800 ${labelSize}px var(--sim-font);fill:var(--sim-label-muted)">${esc(m.label)}</text>` : '')
      + '</g>';
  }
  return out;
}

/** A complete svg element for a DOM scene: scales with its box, width sets the design width. */
export function dateStripHtml(s, o = {}) {
  const w = o.width ?? 640, size = o.size ?? 22;
  const h = stripHeight(s, size, o.labelSize) + 6;
  return `<svg class="date-strip" viewBox="0 0 ${w} ${h}" width="100%" role="img" aria-label="${esc(o.aria ?? 'Date strip, spaced to scale')}" style="display:block;overflow:visible">${dateStripSvg(s, { ...o, w, x: 0, y: 2, size })}</svg>`;
}
