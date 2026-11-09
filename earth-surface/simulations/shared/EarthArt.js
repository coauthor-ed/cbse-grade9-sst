// EarthArt.js - drawn ground for the earth-surface scenes: rock with strata and cracks, water, ice,
// snow, sand, soil, hot rock, boulders, trees, grass, a sky. No faces. No colour literals: every colour
// is a recipe over sim tokens, so canvas and SVG read the same art. Sky things (clouds, Sun, rain) are
// in SkyArt.js beside this file.
//
// Two ways to draw every thing, same arguments after the first two:
//   canvas  drawRock(ctx, c, pts, o)      c = this.colors of a scene with COLOR_MAP = EARTH_COLOR_MAP
//   SVG     svgRock(pts, o)               returns a string, one closed <g>
// Materials take a closed outline pts = [[x, y], ...] in design px and fill it:
//   Rock    o: seed, fill (role), bands [role...] (layered rock, top to bottom), bandH (px), dip (degrees,
//           positive falls to the right), warp (px of bend in each band), cracks (count), grain (true),
//           outline (true), lit (true: pale edge along the top)
//   Water   o: t (seconds, moves ripples), deep (0..1), ripples (count), far (paler)
//   Ice     o: seed, flow (degrees, the way the streaks run), cracks (count)
//   Snow    o: seed, shade (true)
//   Sand    o: seed, ripples (true), dark (true)
//   Soil    o: seed, stones (count), top (px of dark topsoil, at the top of the shape)
//   HotRock o: seed, t (seconds), glow (0..1)
// Single things take an anchor x, y and a scale s:
//   Boulder (middle of the foot; 60 wide): seed
//   Tree    (foot of the trunk; 60 wide, 90 tall): kind 'round' | 'pine' | 'palm' | 'bare', seed, sway
//   Grass   (x0, y0, x1, y1, o): tufts along a line; seed, n, tall (px)
// Sky:
//   drawEarthSky(ctx, c, x, y, w, h, o) a daylight rect; o.dusk (0..1)   svgEarthSky(id, o) a gradient
// Helpers:
//   roughen(pts, o)  a closed outline made rocky: o.seed, o.amp (px), o.step (px); pure, same in = same out
//   smooth(pts, closed) a path string through the middle of each edge
//   earthColour(c, role) / svgEarthColour(role)   a named art colour (see ROLES)
//   drawEarthBlock(ctx, c, box, o)  GeoMap drawStrataBlock with earth defaults (grain, end lines)
//   earthLabelBg(c)  a dark ink for chips on the bright ground
// Rules for callers: the ground and sky are daylight in both themes, so ink on them comes from
// earthColour(c, 'ink') or 'snow', never c.label. Text is the scene's job: nothing here writes a word.
import { mix, darken, mulberry32 } from 'simulations/base/kit/SimLook.js';
import { GEO_COLOR_MAP } from 'simulations/base/kit/GeoLook.js';
import { drawStrataBlock } from 'simulations/base/kit/GeoMap.js';

export const EARTH_COLOR_MAP = GEO_COLOR_MAP;

// -- colours -------------------------------------------------------------------
const TOKEN = {
  skyDay: '--sim-sky-day', skyDusk: '--sim-sky-dusk', seaDeep: '--sim-sea-deep', seaShallow: '--sim-sea-shallow',
  elevLow: '--sim-elev-low', elevMid: '--sim-elev-mid', elevHigh: '--sim-elev-high', elevPeak: '--sim-elev-peak',
  ice: '--sim-ice', strata1: '--sim-strata-1', strata2: '--sim-strata-2', strata3: '--sim-strata-3',
  strata4: '--sim-strata-4', strata5: '--sim-strata-5', strata6: '--sim-strata-6', magma: '--sim-magma',
  gold: '--sim-gold', water: '--sim-water', flame: '--sim-flame',
};
const m = (a, b, t) => ({ a, b, t });
const dk = (a, t) => ({ a, dark: t });
const ROLES = {
  ink: dk('strata6', 0.3), inkSoft: 'strata5', snow: 'elevPeak', snowShade: m('elevPeak', 'strata5', 0.22), snowEdge: m('ice', 'strata5', 0.22),
  rock: 'elevHigh', rockDark: m('elevHigh', 'strata6', 0.5), rockLit: m('elevHigh', 'strata1', 0.5), rockDeep: 'strata6',
  slate: 'strata5', slateDark: m('strata5', 'strata6', 0.6), slateLit: m('strata5', 'elevPeak', 0.34),
  sand: 'strata1', sandLit: m('strata1', 'elevPeak', 0.4), sandDark: m('strata1', 'strata3', 0.42), sandRipple: m('strata1', 'strata3', 0.26),
  soil: 'strata2', soilDark: m('strata3', 'strata6', 0.34), soilTop: m('strata3', 'strata6', 0.58), soilStone: m('strata5', 'elevPeak', 0.2),
  grass: 'elevLow', grassDark: m('elevLow', 'strata6', 0.34), grassLit: m('elevLow', 'gold', 0.34),
  leaf: m('elevLow', 'strata6', 0.14), leafDark: m('elevLow', 'strata6', 0.42), leafLit: m('elevLow', 'gold', 0.28),
  pine: m('elevLow', 'seaDeep', 0.42), pineDark: m('elevLow', 'strata6', 0.62),
  bark: m('strata3', 'strata6', 0.36), barkDark: m('strata3', 'strata6', 0.7),
  sea: 'seaShallow', seaDeep: 'seaDeep', seaMid: m('seaShallow', 'seaDeep', 0.5), seaFar: m('seaShallow', 'elevPeak', 0.3), foam: m('elevPeak', 'seaShallow', 0.14),
  iceBody: m('ice', 'elevPeak', 0.22), iceShade: m('ice', 'seaShallow', 0.32), iceDeep: m('ice', 'seaDeep', 0.34), iceCrack: m('ice', 'seaDeep', 0.62), iceLit: 'elevPeak',
  hot: 'magma', hotDark: m('magma', 'strata6', 0.5), hotDeep: m('magma', 'strata6', 0.72), hotLit: m('magma', 'gold', 0.68), hotCore: m('gold', 'elevPeak', 0.34),
  skyTop: m('skyDay', 'seaDeep', 0.26), skyLow: m('skyDay', 'elevPeak', 0.62), skyMid: m('skyDay', 'elevPeak', 0.2),
};
const FALLBACK = { skyDay: 's1', seaDeep: 's5', seaShallow: 's7', elevLow: 's3', elevMid: 's3', elevHigh: 's8', elevPeak: 'bgSurface', strata1: 's2', strata2: 's8', strata3: 's8', strata4: 's3', strata5: 'stroke', strata6: 'stroke', ice: 'glass', magma: 'bad', skyDusk: 's8' };
function canvasColour(c, r) {
  if (typeof r === 'string') {
    if (ROLES[r] !== undefined && TOKEN[r] === undefined) return canvasColour(c, ROLES[r]);
    return c[r] ?? c[FALLBACK[r]] ?? c.label;
  }
  if (r.dark !== undefined) return darken(canvasColour(c, r.a), r.dark);
  return mix(canvasColour(c, r.a), canvasColour(c, r.b), r.t);
}
function cssColour(r) {
  if (typeof r === 'string') {
    if (ROLES[r] !== undefined && TOKEN[r] === undefined) return cssColour(ROLES[r]);
    return `var(${TOKEN[r] ?? '--sim-label'})`;
  }
  if (r.dark !== undefined) return `color-mix(in oklab, ${cssColour(r.a)} ${Math.round((1 - r.dark) * 100)}%, black)`;
  return `color-mix(in oklab, ${cssColour(r.a)} ${Math.round((1 - r.t) * 100)}%, ${cssColour(r.b)})`;
}
export const earthColour = (c, role) => canvasColour(c, role);
export const svgEarthColour = (role) => cssColour(role);
export const earthLabelBg = (c) => canvasColour(c, 'ink');

// -- shape helpers ------------------------------------------------------------
const n1 = (v) => Math.round(v * 10) / 10;
const line = (pts) => pts.map((p, i) => `${i ? 'L' : 'M'}${n1(p[0])} ${n1(p[1])}`).join('');
const closed = (pts) => line(pts) + 'Z';
const circle = (x, y, r) => `M${n1(x - r)} ${n1(y)}a${n1(r)} ${n1(r)} 0 1 0 ${n1(2 * r)} 0a${n1(r)} ${n1(r)} 0 1 0 ${n1(-2 * r)} 0Z`;
const ell = (x, y, rx, ry) => `M${n1(x - rx)} ${n1(y)}a${n1(rx)} ${n1(ry)} 0 1 0 ${n1(2 * rx)} 0a${n1(rx)} ${n1(ry)} 0 1 0 ${n1(-2 * rx)} 0Z`;

export function smooth(pts, isClosed = true) {
  const n = pts.length;
  if (n < 3) return line(pts);
  const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  if (isClosed) {
    const s = mid(pts[n - 1], pts[0]);
    let d = `M${n1(s[0])} ${n1(s[1])}`;
    for (let i = 0; i < n; i++) { const e = mid(pts[i], pts[(i + 1) % n]); d += `Q${n1(pts[i][0])} ${n1(pts[i][1])} ${n1(e[0])} ${n1(e[1])}`; }
    return d + 'Z';
  }
  let d = `M${n1(pts[0][0])} ${n1(pts[0][1])}`;
  for (let i = 1; i < n - 1; i++) { const e = i === n - 2 ? pts[n - 1] : mid(pts[i], pts[i + 1]); d += `Q${n1(pts[i][0])} ${n1(pts[i][1])} ${n1(e[0])} ${n1(e[1])}`; }
  return d;
}

export function roughen(pts, o = {}) {
  const rand = mulberry32((o.seed ?? 7) * 7919 + 13), amp = o.amp ?? 5, step = o.step ?? 22, out = [];
  const n = pts.length, isClosed = o.closed !== false;
  for (let i = 0; i < (isClosed ? n : n - 1); i++) {
    const a = pts[i], b = pts[(i + 1) % n];
    const dx = b[0] - a[0], dy = b[1] - a[1], len = Math.hypot(dx, dy), k = Math.max(1, Math.round(len / step));
    for (let j = 0; j < k; j++) {
      const u = j / k, off = j ? (rand() - 0.5) * 2 * amp : 0;
      out.push([a[0] + dx * u - dy / (len || 1) * off, a[1] + dy * u + dx / (len || 1) * off]);
    }
  }
  if (!isClosed) out.push(pts[n - 1]);
  return out;
}
const bbox = (pts) => {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const [x, y] of pts) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }
  return { x0, y0, x1, y1, w: x1 - x0, h: y1 - y0 };
};
const crack = (r, x, y, ang, len) => {
  const pts = [[x, y]]; let a = ang, px = x, py = y;
  const k = 4 + Math.floor(r() * 3);
  for (let i = 0; i < k; i++) { a += (r() - 0.5) * 1.1; px += Math.cos(a) * len / k; py += Math.sin(a) * len / k; pts.push([px, py]); }
  return pts;
};

// -- painting -----------------------------------------------------------------
// A thing is a list of { d, f, s, w, a } or { clip: d, kids: [...] }.
function paintList(ctx, c, list) {
  for (const p of list) {
    if (p.kids) {
      ctx.save();
      ctx.clip(new Path2D(p.clip));
      paintList(ctx, c, p.kids);
      ctx.restore();
      continue;
    }
    const path = new Path2D(p.d), base = ctx.globalAlpha;
    if (p.a !== undefined) ctx.globalAlpha = base * p.a;
    if (p.f) { ctx.fillStyle = canvasColour(c, p.f); ctx.fill(path); }
    if (p.s) { ctx.strokeStyle = canvasColour(c, p.s); ctx.lineWidth = p.w ?? 2; ctx.stroke(path); }
    ctx.globalAlpha = base;
  }
}
function paintCanvas(ctx, c, list, o, tr) {
  ctx.save();
  if (tr) { ctx.translate(tr.x, tr.y); ctx.scale(o.flip ? -tr.s : tr.s, tr.s); }
  if (o.alpha !== undefined) ctx.globalAlpha *= o.alpha;
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  paintList(ctx, c, list);
  ctx.restore();
}
function hash(s) { let h = 5381; for (let i = 0; i < s.length; i++) h = (h * 33 + s.charCodeAt(i)) >>> 0; return h.toString(36); }
function svgList(list) {
  return list.map((p) => {
    if (p.kids) {
      const id = 'ea' + hash(p.clip);
      return `<clipPath id="${id}"><path d="${p.clip}"/></clipPath><g clip-path="url(#${id})">${svgList(p.kids)}</g>`;
    }
    const st = [`fill:${p.f ? cssColour(p.f) : 'none'}`];
    if (p.s) st.push(`stroke:${cssColour(p.s)}`, `stroke-width:${p.w ?? 2}`, 'stroke-linecap:round', 'stroke-linejoin:round');
    if (p.a !== undefined) st.push(`opacity:${p.a}`);
    return `<path d="${p.d}" style="${st.join(';')}"/>`;
  }).join('');
}
function paintSvg(list, o, tr) {
  const t = tr ? ` transform="translate(${n1(tr.x)} ${n1(tr.y)}) scale(${o.flip ? -tr.s : tr.s} ${tr.s})"` : '';
  return `<g${t}${o.alpha !== undefined ? ` opacity="${o.alpha}"` : ''}>${svgList(list)}</g>`;
}
const fill = (build) => [
  (ctx, c, pts, o = {}) => paintCanvas(ctx, c, build(pts, o), o),
  (pts, o = {}) => paintSvg(build(pts, o), o),
];
const place = (build) => [
  (ctx, c, x, y, s = 1, o = {}) => paintCanvas(ctx, c, build(o), o, { x, y, s }),
  (x, y, s = 1, o = {}) => paintSvg(build(o), o, { x, y, s }),
];

// -- materials -----------------------------------------------------------------
function rock(pts, o) {
  const r = mulberry32((o.seed ?? 3) * 3571 + 5), b = bbox(pts), d = closed(pts), kids = [];
  const span = Math.max(b.w, b.h) * 1.5, cx = (b.x0 + b.x1) / 2, cy = (b.y0 + b.y1) / 2;
  const dip = (o.dip ?? 0) * Math.PI / 180, warp = o.warp ?? 4;
  const bandAt = (off, phase) => {
    const p = [];
    for (let i = -14; i <= 14; i++) {
      const u = i / 14 * span / 2;
      const w = Math.sin(i * 0.8 + phase) * warp + Math.sin(i * 0.31 + phase * 2) * warp * 1.4;
      p.push([cx + Math.cos(dip) * u - Math.sin(dip) * (off + w), cy + Math.sin(dip) * u + Math.cos(dip) * (off + w)]);
    }
    return p;
  };
  const fillRole = o.fill ?? (o.bands ? o.bands[0] : 'rock');
  if (o.bands?.length) {
    const h = o.bandH ?? 26;
    let off = -span / 2, i = 0;
    while (off < span / 2) {
      const a = bandAt(off, 0.7), bd = bandAt(off + h * 1.06, 0.7);
      const role = o.bands[i % o.bands.length];
      kids.push({ d: closed(a.concat(bd.slice().reverse())), f: role });
      kids.push({ d: line(bandAt(off + h * (0.3 + r() * 0.4), 1.9)), s: { a: role, dark: 0.22 }, w: 1.2, a: 0.42 });
      kids.push({ d: line(a), s: { a: role, dark: 0.42 }, w: 1.6, a: 0.8 });
      off += h; i++;
    }
  }
  const nc = o.cracks ?? 0;
  if (nc) {
    let dd = '', d2 = '';
    for (let i = 0; i < nc; i++) {
      const x = b.x0 + r() * b.w, y = b.y0 + r() * b.h, ang = dip + Math.PI / 2 + (r() - 0.5) * 1.2, len = 24 + r() * 44;
      const p = crack(r, x, y, ang, len);
      dd += line(p);
      if (r() > 0.5) { const q = p[2]; d2 += line(crack(r, q[0], q[1], ang + (r() > 0.5 ? 0.9 : -0.9), len * 0.5)); }
    }
    kids.push({ d: dd, s: 'rockDeep', w: 2.2, a: 0.62 }, { d: d2, s: 'rockDeep', w: 1.4, a: 0.5 });
  }
  if (o.grain !== false) {
    let dd = '';
    const k = Math.min(120, Math.round(b.w * b.h / 2600));
    for (let i = 0; i < k; i++) dd += circle(b.x0 + r() * b.w, b.y0 + r() * b.h, 0.8 + r() * 1.2);
    kids.push({ d: dd, f: 'rockDeep', a: 0.2 });
  }
  const out = [{ d, f: fillRole }, { clip: d, kids }];
  if (o.lit !== false) out.push({ clip: d, kids: [{ d: line(pts.slice(0, Math.ceil(pts.length / 2))), s: 'rockLit', w: 3, a: 0.5 }] });
  if (o.outline !== false) out.push({ d, s: 'rockDeep', w: 2.5, a: 0.8 });
  return out;
}
function water(pts, o) {
  const b = bbox(pts), d = closed(pts), t = o.t ?? 0, deep = o.deep ?? 0.4, n = o.ripples ?? 4, kids = [];
  kids.push({ d: closed([[b.x0, b.y0 + b.h * 0.42], [b.x1, b.y0 + b.h * 0.42], [b.x1, b.y1], [b.x0, b.y1]]), f: 'seaMid', a: deep });
  kids.push({ d: closed([[b.x0, b.y0 + b.h * 0.72], [b.x1, b.y0 + b.h * 0.72], [b.x1, b.y1], [b.x0, b.y1]]), f: 'seaDeep', a: deep });
  let dd = '';
  for (let i = 0; i < n; i++) {
    const y = b.y0 + b.h * (i + 0.5) / n, len = b.w * 0.2, x = b.x0 + ((i * 37.7 + t * 18) % (b.w + len)) - len;
    const seg = [];
    for (let j = 0; j <= 6; j++) seg.push([x + len * j / 6, y + Math.sin(j + i + t) * 1.6]);
    dd += line(seg);
  }
  kids.push({ d: dd, s: 'foam', w: 2, a: 0.55 });
  return [{ d, f: o.far ? 'seaFar' : 'sea' }, { clip: d, kids }];
}
function ice(pts, o) {
  const r = mulberry32((o.seed ?? 5) * 6151 + 3), b = bbox(pts), d = closed(pts), kids = [];
  const flow = (o.flow ?? 0) * Math.PI / 180;
  let st = '';
  for (let i = 0; i < 10; i++) {
    const x = b.x0 + r() * b.w, y = b.y0 + r() * b.h, len = 40 + r() * 80;
    st += line([[x, y], [x + Math.cos(flow) * len * 0.5, y + Math.sin(flow) * len * 0.5 + 2], [x + Math.cos(flow) * len, y + Math.sin(flow) * len]]);
  }
  kids.push({ d: closed([[b.x0, b.y0 + b.h * 0.56], [b.x1, b.y0 + b.h * 0.56], [b.x1, b.y1], [b.x0, b.y1]]), f: 'iceShade', a: 0.55 });
  kids.push({ d: st, s: 'iceLit', w: 2.4, a: 0.7 });
  const nc = o.cracks ?? 0;
  if (nc) {
    let cc = '';
    for (let i = 0; i < nc; i++) cc += line(crack(r, b.x0 + (i + 0.5) / nc * b.w, b.y0 + r() * b.h * 0.2, flow + Math.PI / 2, b.h * (0.3 + r() * 0.3)));
    kids.push({ d: cc, s: 'iceCrack', w: 2.2, a: 0.7 });
  }
  return [{ d, f: 'iceBody' }, { clip: d, kids }, { d, s: 'iceCrack', w: 2, a: 0.7 }];
}
function snow(pts, o) {
  const r = mulberry32((o.seed ?? 2) * 2141 + 9), b = bbox(pts), d = closed(pts), kids = [];
  if (o.shade !== false) {
    const p = [];
    for (let i = 0; i <= 8; i++) p.push([b.x0 + b.w * i / 8, b.y0 + b.h * (0.55 + r() * 0.2)]);
    kids.push({ d: closed(p.concat([[b.x1, b.y1 + 2], [b.x0, b.y1 + 2]])), f: 'snowShade', a: 0.7 });
  }
  return [{ d, f: 'snow' }, { clip: d, kids }, { d, s: 'snowEdge', w: 1.6, a: 0.8 }];
}
function sand(pts, o) {
  const r = mulberry32((o.seed ?? 4) * 1879 + 11), b = bbox(pts), d = closed(pts), kids = [];
  if (o.ripples !== false) {
    let dd = '';
    for (let i = 0; i < 9; i++) {
      const y = b.y0 + b.h * (i + 0.7) / 9, x = b.x0 + r() * b.w * 0.6, len = 40 + r() * 90, seg = [];
      for (let j = 0; j <= 5; j++) seg.push([x + len * j / 5, y + Math.sin(j * 1.2 + i) * 2.6]);
      dd += line(seg);
    }
    kids.push({ d: dd, s: 'sandRipple', w: 1.8, a: 0.7 });
  }
  let sp = '';
  const k = Math.min(160, Math.round(b.w * b.h / 1800));
  for (let i = 0; i < k; i++) sp += circle(b.x0 + r() * b.w, b.y0 + r() * b.h, 0.7 + r() * 0.8);
  kids.push({ d: sp, f: 'sandDark', a: 0.5 });
  return [{ d, f: o.dark ? 'sandDark' : 'sand' }, { clip: d, kids }, { d, s: 'sandDark', w: 1.8, a: 0.8 }];
}
function soil(pts, o) {
  const r = mulberry32((o.seed ?? 8) * 2963 + 7), b = bbox(pts), d = closed(pts), kids = [];
  if (o.top) kids.push({ d: closed([[b.x0, b.y0], [b.x1, b.y0], [b.x1, b.y0 + o.top], [b.x0, b.y0 + o.top]]), f: 'soilTop' });
  let st = '';
  for (let i = 0; i < (o.stones ?? 14); i++) st += ell(b.x0 + r() * b.w, b.y0 + (o.top ?? 0) + r() * (b.h - (o.top ?? 0)), 2 + r() * 4, 1.6 + r() * 2.2);
  kids.push({ d: st, f: 'soilStone', a: 0.7 });
  return [{ d, f: 'soil' }, { clip: d, kids }, { d, s: 'soilDark', w: 1.8, a: 0.8 }];
}
function hotRock(pts, o) {
  const r = mulberry32((o.seed ?? 6) * 4409 + 2), b = bbox(pts), d = closed(pts), t = o.t ?? 0, kids = [];
  const glow = o.glow ?? 0.7;
  let dd = '';
  for (let i = 0; i < 16; i++) {
    const x = b.x0 + r() * b.w, y = b.y0 + r() * b.h, q = 6 + r() * 16;
    dd += ell(x + Math.sin(t * 0.4 + i) * 3, y, q * 1.5, q * 0.7);
  }
  kids.push({ d: dd, f: 'hotLit', a: glow * 0.5 });
  return [{ d, f: 'hot' }, { clip: d, kids }, { d, s: 'hotDark', w: 2, a: 0.8 }];
}

// -- single things --------------------------------------------------------------
function boulder(o) {
  const r = mulberry32((o.seed ?? 1) * 2311 + 17), p = [];
  for (let i = 0; i < 9; i++) {
    const a = Math.PI + i / 8 * Math.PI, q = 1 + (r() - 0.5) * 0.26;
    p.push([Math.cos(a) * 30 * q, Math.sin(a) * 26 * q]);
  }
  const d = closed(p), dark = o.fill === 'slate' ? 'slateDark' : 'rockDark', lit = o.fill === 'slate' ? 'slateLit' : 'rockLit';
  return [
    { d, f: o.fill ?? 'rock' },
    { clip: d, kids: [
      { d: closed([[-4, -30], [34, -24], [34, 2], [6, 2]]), f: dark, a: 0.55 },
      { d: closed([[-28, -8], [-12, -24], [-2, -22], [-14, -4]]), f: lit, a: 0.7 },
      { d: line([[-6, -26], [0, -14], [-5, -2]]), s: dark, w: 2, a: 0.8 },
    ] },
    { d, s: 'rockDeep', w: 2.5, a: 0.8 },
  ];
}
function tree(o) {
  const kind = o.kind ?? 'round', sw = o.sway ?? 0, r = mulberry32((o.seed ?? 1) * 991 + 3);
  const trunk = [[-4, 0], [-3, -34], [3 + sw * 0.4, -34], [5, 0]];
  const out = [{ d: closed(trunk), f: 'bark' }, { d: closed([[1, 0], [1, -34], [3 + sw * 0.4, -34], [5, 0]]), f: 'barkDark', a: 0.6 }];
  if (kind === 'pine') {
    for (let i = 0; i < 3; i++) {
      const y = -24 - i * 19, w = 25 - i * 5;
      out.push({ d: closed([[-w + sw, y], [sw * 1.3, y - 34], [w + sw, y]]), f: i % 2 ? 'pineDark' : 'pine' });
      out.push({ d: closed([[sw, y], [sw * 1.3, y - 34], [w + sw, y]]), f: 'pineDark', a: 0.5 });
    }
    return out;
  }
  if (kind === 'palm') {
    out.length = 0;
    out.push({ d: smooth([[-3, 0], [2, -40], [10 + sw, -86], [14 + sw, -86], [7, -40], [4, 0]]), f: 'bark' });
    for (const [dx, dy] of [[-40, -74], [-32, -100], [38, -106], [48, -78], [8, -116]]) out.push({ d: smooth([[12 + sw, -86], [12 + sw + dx * 0.55, -86 + (dy + 86) * 1.1 - 6], [12 + sw + dx, -86 + (dy + 86)], [12 + sw + dx * 0.5, -84 + (dy + 86) * 0.6 + 6]]), f: dx < 0 ? 'leaf' : 'leafDark' });
    return out;
  }
  if (kind === 'bare') {
    out.push({ d: line([[0, -30], [-16, -56]]) + line([[0, -34], [14, -60]]) + line([[-8, -44], [-2, -62]]) + line([[8, -50], [20, -52]]), s: 'bark', w: 3.6 });
    return out;
  }
  const lumps = [];
  for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; lumps.push([Math.cos(a) * 15 + sw, -56 + Math.sin(a) * 13, 14 + r() * 5]); }
  out.push({ d: lumps.map(([x, y, q]) => circle(x, y, q)).join('') + circle(sw, -56, 19), f: 'leafDark' });
  out.push({ d: lumps.slice(2, 5).map(([x, y, q]) => circle(x + 1, y - 1, q * 0.8)).join('') + circle(sw - 3, -58, 15), f: 'leaf' });
  out.push({ d: circle(sw - 9, -66, 7) + circle(sw + 4, -71, 5), f: 'leafLit', a: 0.8 });
  return out;
}
function grass(x0, y0, x1, y1, o) {
  const r = mulberry32((o.seed ?? 2) * 1229 + 1), n = o.n ?? Math.round(Math.hypot(x1 - x0, y1 - y0) / 16), tall = o.tall ?? 11;
  let a = '', b = '';
  for (let i = 0; i < n; i++) {
    const u = r(), x = x0 + (x1 - x0) * u, y = y0 + (y1 - y0) * u, q = tall * (0.7 + r() * 0.6);
    const blade = line([[x - 3, y], [x - 5, y - q * 0.8]]) + line([[x, y], [x + 1, y - q]]) + line([[x + 3, y], [x + 6, y - q * 0.75]]);
    if (i % 2) a += blade; else b += blade;
  }
  return [{ d: a, s: 'grassDark', w: 2 }, { d: b, s: 'grass', w: 2 }];
}

const rockPair = fill(rock);       export const drawRock = rockPair[0];   export const svgRock = rockPair[1];
const waterPair = fill(water);     export const drawWater = waterPair[0]; export const svgWater = waterPair[1];
const icePair = fill(ice);         export const drawIce = icePair[0];     export const svgIce = icePair[1];
const snowPair = fill(snow);       export const drawSnow = snowPair[0];   export const svgSnow = snowPair[1];
const sandPair = fill(sand);       export const drawSand = sandPair[0];   export const svgSand = sandPair[1];
const soilPair = fill(soil);       export const drawSoil = soilPair[0];   export const svgSoil = soilPair[1];
const hotPair = fill(hotRock);     export const drawHotRock = hotPair[0]; export const svgHotRock = hotPair[1];
const boulderPair = place(boulder); export const drawBoulder = boulderPair[0]; export const svgBoulder = boulderPair[1];
const treePair = place(tree);      export const drawTree = treePair[0];   export const svgTree = treePair[1];
export const drawGrass = (ctx, c, x0, y0, x1, y1, o = {}) => paintCanvas(ctx, c, grass(x0, y0, x1, y1, o), o);
export const svgGrass = (x0, y0, x1, y1, o = {}) => paintSvg(grass(x0, y0, x1, y1, o), o);

// -- sky ------------------------------------------------------------------------
export function drawEarthSky(ctx, c, x, y, w, h, o = {}) {
  const g = ctx.createLinearGradient(0, y, 0, y + h), dusk = o.dusk ?? 0;
  g.addColorStop(0, mix(canvasColour(c, 'skyTop'), canvasColour(c, 'skyDusk'), dusk * 0.5));
  g.addColorStop(0.7, mix(canvasColour(c, 'skyMid'), canvasColour(c, 'skyDusk'), dusk * 0.7));
  g.addColorStop(1, mix(canvasColour(c, 'skyLow'), canvasColour(c, 'skyDusk'), dusk));
  ctx.save();
  ctx.fillStyle = g;
  ctx.fillRect(x, y, w, h);
  ctx.restore();
}
export function svgEarthSky(id) {
  return `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${cssColour('skyTop')}"/><stop offset="0.7" stop-color="${cssColour('skyMid')}"/><stop offset="1" stop-color="${cssColour('skyLow')}"/></linearGradient>`;
}

// -- GeoMap block with earth defaults ----------------------------------------------
export function drawEarthBlock(ctx, c, box, o = {}) {
  drawStrataBlock(ctx, c, box, { grain: 60, endLines: true, ...o });
}

// -- arrows ---------------------------------------------------------------------
/** A chunky arrow with a dark rim, canvas only: drawFlowArrow(ctx, c, x0, y0, x1, y1, { col, w, head, bend }).
 *  bend: px the middle bows to the left of the way it points, for a curved current. */
export function drawFlowArrow(ctx, c, x0, y0, x1, y1, o = {}) {
  const col = o.col ?? c.accent, w = o.w ?? 9, hl = o.head ?? w * 2.1, hw = o.head ? o.head * 0.72 : w * 1.5, bend = o.bend ?? 0;
  const dx = x1 - x0, dy = y1 - y0, len = Math.hypot(dx, dy) || 1, nx = dy / len, ny = -dx / len;
  const qx = (x0 + x1) / 2 + nx * bend * 2, qy = (y0 + y1) / 2 + ny * bend * 2;
  const a = Math.atan2(y1 - qy, x1 - qx), bx = x1 - Math.cos(a) * hl, by = y1 - Math.sin(a) * hl;
  const path = () => { ctx.beginPath(); ctx.moveTo(x0, y0); ctx.quadraticCurveTo(qx, qy, bx, by); };
  const tip = () => { ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(bx - Math.sin(a) * hw, by + Math.cos(a) * hw); ctx.lineTo(bx + Math.sin(a) * hw, by - Math.cos(a) * hw); ctx.closePath(); };
  const rim = canvasColour(c, 'ink');
  ctx.save();
  ctx.globalAlpha *= o.alpha ?? 1;
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.strokeStyle = rim; ctx.fillStyle = rim; ctx.lineWidth = w + 5; path(); ctx.stroke(); ctx.lineWidth = 5; tip(); ctx.stroke(); ctx.fill();
  ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = w; path(); ctx.stroke(); tip(); ctx.fill();
  ctx.restore();
}
