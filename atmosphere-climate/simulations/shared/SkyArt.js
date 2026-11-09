// SkyArt.js - drawn things for air and climate scenes: a sky by height, soft clouds, the Sun, the
// Earth's curved edge, sea, land, hills, instruments you could hold, a balloon, an aeroplane, a dhow.
// General: later geography modules can reuse it. No faces. No colour literals: every colour is a
// recipe over sim tokens, so canvas and SVG read the same art.
//
// Two ways to draw every thing, same arguments after the first two:
//   canvas  drawCloud(ctx, c, x, y, s, o)     c = this.colors of a scene with COLOR_MAP = SKY_COLOR_MAP
//   SVG     svgCloud(x, y, s, o)              returns a string, one closed <g>
// x, y place the origin given below; s is a scale; every o also takes:
//   rot (degrees), flip (true mirrors left and right), alpha (0..1).
//
// The things (origin; size at s = 1; options):
//   Cloud        middle of the flat base; 120 wide; seed, kind 'puff' | 'rain' | 'flat'
//   Sun          centre; disc radius 40, rays to 62; rays (true), spin (degrees)
//   EarthEdge    top of the curve; o.w wide, o.h deep; R (curve radius), land (true), air (true)
//   Sea          left end of the waterline; o.w by o.h; t (seconds, moves the waves), far (paler)
//   Land         left end of the surface; o.w by o.h; kind 'plain' | 'sand' | 'field' | 'town', seed
//   Hills        left end of the foot; o.w wide, o.h tall; seed, far (paler), snow (true), peaks
//   Rain         middle of the cloud base; o.w wide, o.h long; t, heavy (true)
//   Thermometer  centre of the bulb; 34 by 200; level 0..1. thermometerTop(s) and thermometerY(y, s, level)
//                give the screen height of the tube for labels
//   Barometer    centre; radius 64; level 0..1 (needle, left to right)
//   RainGauge    middle of the foot; 56 by 150; level 0..1
//   WindVane     foot of the pole; 110 by 150; heading in degrees, 0 the arrow points east on screen
//                and 90 away from the viewer
//   Balloon      centre of the balloon; radius 44, string and box to y = 128; box (true)
//   Aeroplane    centre; 150 long, nose to the right (flip for left)
//   Dhow         waterline, middle of the hull; 160 long, mast to y = -150; belly 0..1 fills the sail
//
// The sky:
//   skyAt(c, km)                    a canvas colour for this height; 0 pale day, 12 blue, 50 deep, 120 near space
//   drawSkyColumn(ctx, c, x, y, w, h, kmBottom, kmTop)     a rect shaded by height. The one soft gradient here:
//                                                          literal light
//   svgSkyGradient(id, kmBottom, kmTop)                    a <linearGradient>, for <defs>
//   drawSunGlow(ctx, c, x, y, r)  and  svgSunGlow(id)      light round the Sun
//   skyColour(c, role) / svgSkyColour(role)                a named art colour (see ROLES)
//
// Rules for callers: the sky is daylight in both themes (a scene's own time of day wins), so ink on
// it comes from skyColour(c, 'ink') or 'cloud', never c.label. Text is the scene's job: nothing here
// writes a word.
import { mix, darken, alpha as alphaOf } from 'simulations/base/kit/SimLook.js';
import { GEO_COLOR_MAP } from 'simulations/base/kit/GeoLook.js';

export const SKY_COLOR_MAP = GEO_COLOR_MAP;

// -- colours -------------------------------------------------------------------
// A colour is a token key, or m(a, b, t) (t = 0 gives a), or dk(a, t) (toward black).
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
  cloud: 'elevPeak', cloudLit: m('elevPeak', 'gold', 0.04), cloudShade: m('elevPeak', 'strata5', 0.2), cloudDark: m('strata5', 'elevPeak', 0.34),
  rain: m('seaShallow', 'seaDeep', 0.35),
  sun: m('magma', 'strata1', 0.66), sunCore: m('strata1', 'elevPeak', 0.66), sunRay: m('magma', 'strata1', 0.42),
  ink: dk('strata6', 0.3), inkSoft: 'strata5',
  sea: 'seaShallow', seaDeep: 'seaDeep', seaMid: m('seaShallow', 'seaDeep', 0.5), foam: m('elevPeak', 'seaShallow', 0.18),
  grass: 'elevLow', grassDark: m('elevLow', 'strata6', 0.26), grassLit: m('elevLow', 'gold', 0.3),
  sand: 'strata1', sandDark: m('strata1', 'strata3', 0.42), soil: 'strata2', soilDark: 'strata3',
  rock: 'elevHigh', rockDark: m('elevHigh', 'strata6', 0.42), rockLit: m('elevHigh', 'strata1', 0.4), snow: 'elevPeak', snowShade: m('elevPeak', 'strata5', 0.24),
  hillFar: m('strata5', 'skyDay', 0.56), hillFarDark: m('strata5', 'skyDay', 0.34),
  glass: m('elevPeak', 'ice', 0.4), glassEdge: m('ice', 'strata5', 0.3),
  metal: m('strata5', 'elevPeak', 0.5), metalDark: 'strata5', metalLit: m('strata5', 'elevPeak', 0.78),
  brass: m('gold', 'strata3', 0.28), brassDark: m('gold', 'strata3', 0.72), dial: m('elevPeak', 'gold', 0.1),
  liquid: 'magma', liquidDark: m('magma', 'strata6', 0.34),
  wood: 'strata3', woodDark: m('strata3', 'strata6', 0.5), woodLit: m('strata3', 'strata1', 0.5),
  sail: m('elevPeak', 'gold', 0.1), sailShade: m('elevPeak', 'strata2', 0.34), sailRib: m('elevPeak', 'strata2', 0.56),
  balloon: 'elevPeak', balloonShade: m('elevPeak', 'strata5', 0.3),
  planeBody: 'elevPeak', planeShade: m('elevPeak', 'strata5', 0.34), planeTrim: 'seaDeep', planeGlass: m('strata6', 'seaDeep', 0.4),
  hazeLow: m('skyDay', 'elevPeak', 0.62), sky: 'skyDay', airRim: m('skyDay', 'elevPeak', 0.34),
};

// Canvas. A map without the earth tokens still draws: sky-side keys fall back on the series.
const FALLBACK = { skyDay: 's1', seaDeep: 's5', seaShallow: 's7', elevLow: 's3', elevMid: 's3', elevHigh: 's8', elevPeak: 'bgSurface', strata1: 's2', strata2: 's8', strata3: 's8', strata4: 's3', strata5: 'stroke', strata6: 'stroke', ice: 'glass', magma: 'bad', skyDusk: 's8' };
function canvasColour(c, r) {
  if (typeof r === 'string') {
    if (ROLES[r] !== undefined && r !== ROLES[r] && TOKEN[r] === undefined) return canvasColour(c, ROLES[r]);
    return c[r] ?? c[FALLBACK[r]] ?? c.label;
  }
  if (r.dark !== undefined) return darken(canvasColour(c, r.a), r.dark);
  return mix(canvasColour(c, r.a), canvasColour(c, r.b), r.t);
}
// SVG. Same recipe, resolved by the cascade.
function cssColour(r) {
  if (typeof r === 'string') {
    if (ROLES[r] !== undefined && r !== ROLES[r] && TOKEN[r] === undefined) return cssColour(ROLES[r]);
    return `var(${TOKEN[r]})`;
  }
  if (r.dark !== undefined) return `color-mix(in oklab, ${cssColour(r.a)} ${Math.round((1 - r.dark) * 100)}%, black)`;
  return `color-mix(in oklab, ${cssColour(r.a)} ${Math.round((1 - r.t) * 100)}%, ${cssColour(r.b)})`;
}
export const skyColour = (c, role) => canvasColour(c, role);
export const svgSkyColour = (role) => cssColour(role);

// -- primitive list ------------------------------------------------------------
// A thing is a list of { d (path), f (fill role), s (stroke role), w (width), a (alpha) }.
const n1 = (v) => Math.round(v * 10) / 10;
const circle = (x, y, r) => `M${n1(x - r)} ${n1(y)}a${n1(r)} ${n1(r)} 0 1 0 ${n1(2 * r)} 0a${n1(r)} ${n1(r)} 0 1 0 ${n1(-2 * r)} 0Z`;
const ell = (x, y, rx, ry) => `M${n1(x - rx)} ${n1(y)}a${n1(rx)} ${n1(ry)} 0 1 0 ${n1(2 * rx)} 0a${n1(rx)} ${n1(ry)} 0 1 0 ${n1(-2 * rx)} 0Z`;
const rrect = (x, y, w, h, r) => { const q = Math.min(r, w / 2, h / 2); return `M${n1(x + q)} ${n1(y)}h${n1(w - 2 * q)}a${n1(q)} ${n1(q)} 0 0 1 ${n1(q)} ${n1(q)}v${n1(h - 2 * q)}a${n1(q)} ${n1(q)} 0 0 1 ${n1(-q)} ${n1(q)}h${n1(-(w - 2 * q))}a${n1(q)} ${n1(q)} 0 0 1 ${n1(-q)} ${n1(-q)}v${n1(-(h - 2 * q))}a${n1(q)} ${n1(q)} 0 0 1 ${n1(q)} ${n1(-q)}Z`; };
const line = (pts) => pts.map((p, i) => `${i ? 'L' : 'M'}${n1(p[0])} ${n1(p[1])}`).join('');
const rnd = (seed) => { let s = (seed * 2654435761 + 1) >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; };

function paintCanvas(ctx, c, prims, x, y, s, o) {
  ctx.save();
  ctx.translate(x, y);
  if (o.rot) ctx.rotate(o.rot * Math.PI / 180);
  ctx.scale(o.flip ? -s : s, s);
  if (o.alpha !== undefined) ctx.globalAlpha *= o.alpha;
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  for (const p of prims) {
    const path = new Path2D(p.d);
    const base = ctx.globalAlpha;
    if (p.a !== undefined) ctx.globalAlpha = base * p.a;
    if (p.f) { ctx.fillStyle = canvasColour(c, p.f); ctx.fill(path); }
    if (p.s) { ctx.strokeStyle = canvasColour(c, p.s); ctx.lineWidth = p.w ?? 2; ctx.stroke(path); }
    ctx.globalAlpha = base;
  }
  ctx.restore();
}
function paintSvg(prims, x, y, s, o) {
  const t = `translate(${n1(x)} ${n1(y)})${o.rot ? ` rotate(${n1(o.rot)})` : ''} scale(${o.flip ? -s : s} ${s})`;
  const body = prims.map((p) => {
    const st = [`fill:${p.f ? cssColour(p.f) : 'none'}`];
    if (p.s) st.push(`stroke:${cssColour(p.s)}`, `stroke-width:${p.w ?? 2}`, 'stroke-linecap:round', 'stroke-linejoin:round');
    if (p.a !== undefined) st.push(`opacity:${p.a}`);
    return `<path d="${p.d}" style="${st.join(';')}"/>`;
  }).join('');
  return `<g transform="${t}"${o.alpha !== undefined ? ` opacity="${o.alpha}"` : ''}>${body}</g>`;
}
const pair = (build) => [
  (ctx, c, x, y, s = 1, o = {}) => paintCanvas(ctx, c, build(o), x, y, s, o),
  (x, y, s = 1, o = {}) => paintSvg(build(o), x, y, s, o),
];

// -- the things ----------------------------------------------------------------
function cloud(o) {
  const r = rnd(o.seed ?? 3), kind = o.kind ?? 'puff';
  const flat = kind === 'flat', n = flat ? 7 : 5, span = flat ? 72 : 48;
  const lump = [];
  for (let i = 0; i < n; i++) {
    const u = n === 1 ? 0 : i / (n - 1) * 2 - 1;
    const top = (1 - u * u * 0.8);
    const rad = (flat ? 11 + 6 * top : 15 + 19 * top) * (0.86 + r() * 0.3);
    lump.push([u * span, -rad - (flat ? 1 : top * 5), rad]);
  }
  const main = (dy) => lump.map(([x, y, q]) => circle(x, y + dy, q)).join('') + rrect(-span - 22, -13 + dy, 2 * span + 44, 13, 6.5) + rrect(-span, -26 + dy, 2 * span, 26, 6);
  const dark = kind === 'rain';
  return [
    { d: main(4), f: dark ? 'cloudDark' : 'cloudShade' },
    { d: main(0), f: dark ? m('strata5', 'elevPeak', 0.56) : 'cloud' },
    { d: lump.slice(1, n - 1).map(([x, y, q]) => circle(x - q * 0.2, y - q * 0.22, q * 0.62)).join(''), f: dark ? m('strata5', 'elevPeak', 0.72) : 'cloudLit' },
  ];
}
function sun(o) {
  const rays = [], k = o.rays === false ? 0 : 12, spin = (o.spin ?? 0) * Math.PI / 180;
  for (let i = 0; i < k; i++) {
    const a = spin + i / k * Math.PI * 2, r0 = 48, r1 = i % 2 ? 58 : 66;
    rays.push(line([[Math.cos(a) * r0, Math.sin(a) * r0], [Math.cos(a) * r1, Math.sin(a) * r1]]));
  }
  const out = [];
  if (k) out.push({ d: rays.join(''), s: 'sunRay', w: 7 });
  out.push({ d: circle(0, 0, 41), f: 'sunRay' }, { d: circle(0, 0, 38), f: 'sun' }, { d: circle(-3, -4, 29), f: 'sunCore', a: 0.55 }, { d: circle(-8, -10, 17), f: 'sunCore', a: 0.9 });
  return out;
}
function earthEdge(o) {
  const w = o.w ?? 600, h = o.h ?? 200, R = o.R ?? 900, r = rnd(o.seed ?? 5);
  const yAt = (x) => R - Math.sqrt(Math.max(0, R * R - x * x));
  const edge = (lift) => { const p = []; for (let x = -w / 2; x <= w / 2; x += 12) p.push([x, yAt(x) - lift]); return p; };
  const out = [];
  if (o.air !== false) for (const [lift, a] of [[34, 0.14], [24, 0.28], [15, 0.46], [7, 0.8]]) out.push({ d: `${line(edge(lift))}L${n1(w / 2)} ${n1(h)}L${n1(-w / 2)} ${n1(h)}Z`, f: 'airRim', a });
  out.push({ d: `${line(edge(0))}L${n1(w / 2)} ${n1(h)}L${n1(-w / 2)} ${n1(h)}Z`, f: 'seaMid' });
  if (o.land !== false) {
    // Land masses seen at a slant: wobbly, flatter towards the far edge.
    const k = Math.max(3, Math.round(w / 150));
    const blob = (cx, cy, rx, ry, q) => { const p = []; for (let i = 0; i < 28; i++) { const a = i / 28 * Math.PI * 2, wob = 1 + 0.2 * Math.sin(a * 3 + q) + 0.12 * Math.sin(a * 7 + q * 2); p.push([cx + Math.cos(a) * rx * wob, cy + Math.sin(a) * ry * wob]); } return `${line(p)}Z`; };
    for (let i = 0; i < k; i++) {
      const u = (i + 0.2 + r() * 0.6) / k, cx = -w / 2 + u * w, dep = 0.22 + (i % 2) * 0.34 + r() * 0.12, cy = yAt(cx) + 22 + dep * h, q = r() * 6;
      const rx = (54 + r() * 56) * (0.7 + dep), ry = (14 + r() * 12) * (0.8 + dep * 1.6);
      out.push({ d: blob(cx, cy, rx, ry, q), f: 'grass' }, { d: blob(cx + rx * 0.14, cy + ry * 0.1, rx * 0.5, ry * 0.46, q + 1), f: 'sand' });
    }
  }
  return out;
}
function sea(o) {
  const w = o.w ?? 300, h = o.h ?? 100, t = o.t ?? 0, step = 10;
  const row = (y, amp, len, ph) => { const p = []; for (let x = 0; x <= w; x += step) p.push([x, y + Math.sin(x / len + ph + t * 1.1) * amp]); return p; };
  const fillBelow = (pts) => `${line(pts)}L${n1(w)} ${n1(h)}L0 ${n1(h)}Z`;
  return [
    { d: fillBelow(row(0, 2.5, 26, 0)), f: o.far ? 'seaShallow' : 'sea' },
    { d: fillBelow(row(h * 0.38, 3, 34, 2)), f: 'seaMid' },
    { d: fillBelow(row(h * 0.74, 3.5, 40, 4)), f: 'seaDeep' },
    { d: line(row(1, 2.5, 26, 0)), s: 'foam', w: 3, a: 0.85 },
  ];
}
function land(o) {
  const w = o.w ?? 300, h = o.h ?? 80, kind = o.kind ?? 'plain', r = rnd(o.seed ?? 7);
  const top = []; for (let x = 0; x <= w; x += 20) top.push([x, Math.sin(x * 0.02 + (o.seed ?? 7)) * 3]);
  const body = `${line(top)}L${n1(w)} ${n1(h)}L0 ${n1(h)}Z`;
  const [a, b] = kind === 'sand' ? ['sand', 'sandDark'] : kind === 'town' ? ['soil', 'soilDark'] : ['grass', 'grassDark'];
  const out = [{ d: body, f: a }, { d: `M0 ${n1(h * 0.55)}L${n1(w)} ${n1(h * 0.5)}L${n1(w)} ${n1(h)}L0 ${n1(h)}Z`, f: b, a: 0.7 }];
  if (kind === 'field') for (let i = 0; i < Math.floor(w / 46); i++) { const x = i * 46 + 12; out.push({ d: line([[x, h * 0.2], [x - 16, h * 0.9]]), s: 'grassLit', w: 5, a: 0.7 }); }
  if (kind === 'plain') for (let i = 0; i < Math.floor(w / 36); i++) { const x = r() * w; out.push({ d: ell(x, 6 + r() * h * 0.36, 9, 3), f: 'grassLit', a: 0.7 }); }
  if (kind === 'sand') for (let i = 0; i < Math.floor(w / 50); i++) { const x = r() * w, y = 10 + r() * h * 0.4; out.push({ d: `M${n1(x)} ${n1(y)}q9 -6 18 0`, s: 'sandDark', w: 3, a: 0.7 }); }
  if (kind === 'town') for (let i = 0; i < Math.floor(w / 44); i++) { const x = 6 + i * 44 + r() * 8, ww = 26 + r() * 12, hh = 14 + r() * 22; out.push({ d: rrect(x, -hh, ww, hh + 2, 3), f: i % 2 ? 'metalLit' : 'sand' }, { d: rrect(x + 6, -hh + 5, 7, 7, 1.5), f: 'planeGlass' }); }
  return out;
}
function hills(o) {
  const w = o.w ?? 300, h = o.h ?? 120, r = rnd(o.seed ?? 11), far = !!o.far, n = o.peaks ?? 3;
  const tops = [];
  for (let i = 0; i < n; i++) tops.push({ x: (i + 0.3 + r() * 0.4) * w / n, y: h * (0.58 + r() * 0.42) });
  const hAt = (x) => { let v = 0; for (const p of tops) { const u = Math.max(0, 1 - Math.abs(x - p.x) / (w / n * 0.86)); v = Math.max(v, p.y * (1 - (1 - u) ** 1.6)); } return v * Math.sin(Math.PI * Math.max(0, Math.min(1, x / w))) ** 0.4; };
  const pts = [[0, 0]]; for (let x = 0; x <= w; x += 8) pts.push([x, -hAt(x) - Math.sin(x * 0.08) * 2.2 * (hAt(x) > 2 ? 1 : 0)]); pts.push([w, 0]);
  const out = [{ d: `${line(pts)}Z`, f: far ? 'hillFar' : 'rock' }];
  // One cushion shade down the far side of each top.
  for (const p of tops) {
    const side = []; const span = w / n * 0.8;
    for (let x = p.x; x <= Math.min(w, p.x + span); x += 8) side.push([x, -hAt(x)]);
    side.push([Math.min(w, p.x + span), 0], [p.x + 8, 0], [p.x + 6, -p.y * 0.45]);
    out.push({ d: `${line(side)}Z`, f: far ? 'hillFarDark' : 'rockDark', a: 0.75 });
  }
  if (o.snow) for (const p of tops) {
    if (p.y < h * 0.7) continue;
    const span = w / n * 0.16, cap = [[p.x - span, -hAt(p.x - span)]];
    for (let x = p.x - span; x <= p.x + span; x += 6) cap.push([x, -hAt(x)]);
    cap.push([p.x + span, -hAt(p.x + span)], [p.x + span * 0.4, -hAt(p.x + span) - 2 + 8], [p.x, -hAt(p.x + span) - 4], [p.x - span * 0.4, -hAt(p.x - span) + 8]);
    out.push({ d: `${line(cap)}Z`, f: 'snow' });
  }
  return out;
}
function rain(o) {
  const w = o.w ?? 120, h = o.h ?? 120, t = o.t ?? 0, heavy = !!o.heavy, n = Math.round(w / (heavy ? 11 : 20)), r = rnd(o.seed ?? 13);
  let d = '';
  for (let i = 0; i < n; i++) {
    const x = -w / 2 + (i + 0.5) * w / n + r() * 4, ph = r();
    const u = (t * 0.9 + ph) % 1, y = u * (h - 16);
    d += line([[x, y], [x - 3, y + (heavy ? 18 : 12)]]);
  }
  return [{ d, s: 'rain', w: heavy ? 4 : 3 }];
}
const TUBE_H = 158, TUBE_TOP = -14 - TUBE_H;
export const thermometerTop = (s = 1) => TUBE_TOP * s;
/** The screen y of a level 0..1 on a thermometer whose bulb centre is at y. */
export const thermometerY = (y, s, level) => y + (-14 - TUBE_H * Math.max(0, Math.min(1, level))) * s;
function thermometer(o) {
  const lv = Math.max(0, Math.min(1, o.level ?? 0.5)), top = -14 - TUBE_H * lv;
  const ticks = []; for (let i = 0; i <= 10; i++) { const y = -14 - TUBE_H * i / 10, big = i % 5 === 0; ticks.push(line([[11, y], [big ? 22 : 17, y]])); }
  return [
    { d: `${rrect(-13, TUBE_TOP - 13, 26, TUBE_H + 30, 13)}${circle(0, 0, 25)}`, f: 'glassEdge' },
    { d: `${rrect(-10, TUBE_TOP - 10, 20, TUBE_H + 24, 10)}${circle(0, 0, 22)}`, f: 'glass' },
    { d: `${rrect(-6, top, 12, -top + 2, Math.min(6, -top / 2))}${circle(0, 0, 18)}`, f: 'liquid' },
    { d: circle(-6, -6, 6), f: 'sunCore', a: 0.7 },
    { d: ticks.join(''), s: 'ink', w: 3 },
  ];
}
function barometer(o) {
  const lv = Math.max(0, Math.min(1, o.level ?? 0.5)), a0 = -225, sweep = 270, ticks = [];
  for (let i = 0; i <= 12; i++) {
    const a = (a0 + sweep * i / 12) * Math.PI / 180, r1 = 46, r0 = i % 3 ? 41 : 37;
    ticks.push(line([[Math.cos(a) * r0, Math.sin(a) * r0], [Math.cos(a) * r1, Math.sin(a) * r1]]));
  }
  const a = (a0 + sweep * lv) * Math.PI / 180, nx = Math.cos(a), ny = Math.sin(a);
  return [
    { d: circle(0, 4, 64), f: 'brassDark' }, { d: circle(0, 0, 64), f: 'brass' }, { d: circle(-3, -4, 58), f: 'gold', a: 0.5 },
    { d: circle(0, 0, 52), f: 'brassDark' }, { d: circle(0, 0, 50), f: 'dial' },
    { d: ticks.join(''), s: 'ink', w: 3 },
    { d: line([[-nx * 10, -ny * 10], [nx * 38, ny * 38]]), s: 'liquid', w: 5 },
    { d: circle(0, 0, 7), f: 'ink' },
  ];
}
function rainGauge(o) {
  const lv = Math.max(0, Math.min(1, o.level ?? 0.3)), H0 = -22, H1 = -128, top = H0 + (H1 - H0) * lv;
  const ticks = []; for (let i = 0; i <= 6; i++) { const y = H0 + (H1 - H0) * i / 6; ticks.push(line([[8, y], [i % 2 ? 15 : 20, y]])); }
  return [
    { d: rrect(-4, -8, 8, 8, 1) + rrect(-24, -14, 48, 8, 3), f: 'woodDark' },
    { d: rrect(-22, -136, 44, 124, 8), f: 'glassEdge' }, { d: rrect(-19, -133, 38, 118, 6), f: 'glass' },
    lv > 0 ? { d: rrect(-16, top, 32, -18 - top, 4), f: 'water' } : { d: '', f: 'water' },
    { d: `M-34 -150L34 -150L14 -128L-14 -128Z`, f: 'metal' }, { d: `M-34 -150L34 -150L30 -146L-30 -146Z`, f: 'metalLit' },
    { d: rrect(-12, -128, 7, 104, 3.5), f: 'sunCore', a: 0.4 },
    { d: ticks.join(''), s: 'ink', w: 3 },
  ];
}
function windVane(o) {
  const a = (o.heading ?? 0) * Math.PI / 180, cx = 0, cy = -118, k = Math.cos(a), q = -Math.sin(a) * 0.34;
  const P = (u, v) => [cx + u * k, cy + u * q + v * (1 - Math.abs(q))];
  return [
    { d: rrect(-3.5, -150, 7, 150, 3), f: 'metalDark' },
    { d: line([[-46, -88], [46, -88]]) + line([[-22, -80], [22, -96]]), s: 'metalDark', w: 5 },
    { d: circle(-46, -88, 5) + circle(46, -88, 5) + circle(-22, -80, 5) + circle(22, -96, 5), f: 'brass' },
    { d: `${line([P(-54, 0), P(36, 0)])}`, s: 'ink', w: 6 },
    { d: `${line([P(58, 0), P(30, -13), P(34, 0), P(30, 13)])}Z`, f: 'liquid', s: 'liquidDark', w: 2 },
    { d: `${line([P(-34, 0), P(-58, -14), P(-46, 0), P(-58, 14)])}Z`, f: 'brass', s: 'brassDark', w: 2 },
    { d: circle(0, -118, 6), f: 'ink' },
  ];
}
function balloon(o) {
  const out = [
    { d: 'M0 44L0 104', s: 'ink', w: 2.5 },
    { d: `M-10 40L0 54L10 40Z`, f: 'balloonShade' },
    { d: ell(0, 2, 44, 46), f: 'balloonShade' }, { d: ell(-2, -1, 42, 43), f: 'balloon' }, { d: ell(-15, -17, 13, 17), f: 'sunCore', a: 0.5 },
  ];
  if (o.box !== false) out.push({ d: rrect(-15, 104, 30, 24, 5), f: 'metal' }, { d: rrect(-15, 104, 30, 8, 4), f: 'liquid' }, { d: circle(0, 120, 4), f: 'ink' });
  return out;
}
function aeroplane() {
  const body = 'M-74 -6Q-60 -11 -30 -11L48 -11Q68 -11 76 0Q68 8 44 8L-30 8Q-60 6 -74 -6Z';
  return [
    { d: 'M-42 -9L-64 -36L-50 -36L-18 -9Z', f: 'planeTrim' },
    { d: 'M-66 -5L-82 -8L-80 -2L-62 0Z', f: 'planeShade' },
    { d: body, f: 'planeBody', s: 'planeShade', w: 2 },
    { d: 'M-72 -4Q-60 3 -30 3L72 3Q60 8 44 8L-30 8Q-60 6 -72 -4Z', f: 'planeShade' },
    { d: 'M58 -8Q66 -6 69 -2L56 -2Z', f: 'planeGlass' },
    { d: [-22, -11, 0, 11, 22, 33].map((x) => circle(x, -3, 2.3)).join(''), f: 'planeGlass' },
    { d: 'M10 2L-22 24L-8 24L32 2Z', f: 'planeShade' },
    { d: rrect(-6, 11, 22, 8, 4), f: 'metalDark' },
  ];
}
function dhow(o) {
  const b = Math.max(0, Math.min(1, o.belly ?? 1)), sag = 14 + 34 * b;
  // Lateen sail: yard from low at the bow to high over the stern, the foot belly set by the wind.
  const sailD = `M64 -36L-40 -152Q${n1(-30 + sag * 0.5)} ${n1(-90 + sag * 0.15)} -32 -30Q${n1(14 + sag * 0.5)} ${n1(-24 - sag * 0.12)} 64 -36Z`;
  const shade = `M64 -36L-30 -30L-32 -30Q${n1(14 + sag * 0.5)} ${n1(-24 - sag * 0.12)} 64 -36Z`;
  return [
    { d: 'M-2 -8L-14 -132', s: 'woodDark', w: 6 },
    { d: 'M70 -30L-46 -156', s: 'woodDark', w: 5 },
    { d: sailD, f: 'sail', s: 'sailRib', w: 2.5 },
    { d: `M-34 -130Q${n1(-22 + sag * 0.5)} ${n1(-76)} -6 -30M-22 -116Q${n1(-4 + sag * 0.5)} ${n1(-66)} 22 -34`, s: 'sailRib', w: 2, a: 0.7 },
    { d: shade, f: 'sailShade', a: 0.7 },
    { d: 'M-80 -18Q-40 -6 0 -8Q50 -8 92 -30Q76 -6 58 8Q0 16 -58 8Q-72 -2 -80 -18Z', f: 'wood' },
    { d: 'M-80 -18Q-40 -6 0 -8Q50 -8 92 -30L88 -24Q50 -2 0 -2Q-40 -1 -76 -11Z', f: 'woodLit' },
    { d: 'M-66 2Q0 10 62 2L58 8Q0 16 -58 8Z', f: 'woodDark' },
  ];
}

const cloudPair = pair(cloud);
export const drawCloud = cloudPair[0];
export const svgCloud = cloudPair[1];
const sunPair = pair(sun);
export const drawSun = sunPair[0];
export const svgSun = sunPair[1];
const earthEdgePair = pair(earthEdge);
export const drawEarthEdge = earthEdgePair[0];
export const svgEarthEdge = earthEdgePair[1];
const seaPair = pair(sea);
export const drawSea = seaPair[0];
export const svgSea = seaPair[1];
const landPair = pair(land);
export const drawLand = landPair[0];
export const svgLand = landPair[1];
const hillsPair = pair(hills);
export const drawHills = hillsPair[0];
export const svgHills = hillsPair[1];
const rainPair = pair(rain);
export const drawRain = rainPair[0];
export const svgRain = rainPair[1];
const thermometerPair = pair(thermometer);
export const drawThermometer = thermometerPair[0];
export const svgThermometer = thermometerPair[1];
const barometerPair = pair(barometer);
export const drawBarometer = barometerPair[0];
export const svgBarometer = barometerPair[1];
const rainGaugePair = pair(rainGauge);
export const drawRainGauge = rainGaugePair[0];
export const svgRainGauge = rainGaugePair[1];
const windVanePair = pair(windVane);
export const drawWindVane = windVanePair[0];
export const svgWindVane = windVanePair[1];
const balloonPair = pair(balloon);
export const drawBalloon = balloonPair[0];
export const svgBalloon = balloonPair[1];
const aeroplanePair = pair(aeroplane);
export const drawAeroplane = aeroplanePair[0];
export const svgAeroplane = aeroplanePair[1];
const dhowPair = pair(dhow);
export const drawDhow = dhowPair[0];
export const svgDhow = dhowPair[1];

// -- the sky by height ---------------------------------------------------------
const SKY_STOPS = [
  [0, m('skyDay', 'elevPeak', 0.62)],
  [4, m('skyDay', 'elevPeak', 0.26)],
  [12, 'skyDay'],
  [28, m('skyDay', 'seaDeep', 0.56)],
  [50, 'seaDeep'],
  [80, dk('seaDeep', 0.5)],
  [120, dk(m('seaDeep', 'strata6', 0.5), 0.72)],
];
const stopsBetween = (k0, k1) => {
  const out = [k0];
  for (const [km] of SKY_STOPS) if (km > k0 && km < k1) out.push(km);
  out.push(k1);
  return out;
};
/** A canvas colour for a height in km. */
export function skyAt(c, km) {
  const k = Math.max(0, Math.min(120, km));
  for (let i = 1; i < SKY_STOPS.length; i++) {
    const [a, ra] = SKY_STOPS[i - 1], [b, rb] = SKY_STOPS[i];
    if (k <= b) return mix(canvasColour(c, ra), canvasColour(c, rb), (k - a) / (b - a));
  }
  return canvasColour(c, SKY_STOPS[SKY_STOPS.length - 1][1]);
}
function cssSkyAt(km) {
  const k = Math.max(0, Math.min(120, km));
  for (let i = 1; i < SKY_STOPS.length; i++) {
    const [a, ra] = SKY_STOPS[i - 1], [b, rb] = SKY_STOPS[i];
    if (k <= b) return cssColour(m(ra, rb, (k - a) / (b - a)));
  }
  return cssColour(SKY_STOPS[SKY_STOPS.length - 1][1]);
}
/** A rect shaded from kmBottom at its foot to kmTop at its head. */
export function drawSkyColumn(ctx, c, x, y, w, h, kmBottom = 0, kmTop = 12) {
  const g = ctx.createLinearGradient(0, y + h, 0, y);
  for (const km of stopsBetween(kmBottom, kmTop)) g.addColorStop((km - kmBottom) / (kmTop - kmBottom), skyAt(c, km));
  ctx.fillStyle = g;
  ctx.fillRect(x, y, w, h);
}
export function svgSkyGradient(id, kmBottom = 0, kmTop = 12) {
  const stops = stopsBetween(kmBottom, kmTop).map((km) => `<stop offset="${n1((km - kmBottom) / (kmTop - kmBottom) * 100)}%" style="stop-color:${cssSkyAt(km)}"/>`);
  return `<linearGradient id="${id}" x1="0" y1="1" x2="0" y2="0">${stops.join('')}</linearGradient>`;
}
/** Soft light round the Sun: literal light, so a gradient is fine here. */
export function drawSunGlow(ctx, c, x, y, r) {
  const g = ctx.createRadialGradient(x, y, r * 0.15, x, y, r), col = canvasColour(c, 'sun');
  g.addColorStop(0, alphaOf(col, 0.6)); g.addColorStop(1, alphaOf(col, 0));
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
}
export function svgSunGlow(id) {
  const col = cssColour('sun');
  return `<radialGradient id="${id}"><stop offset="0%" style="stop-color:${col};stop-opacity:0.8"/><stop offset="100%" style="stop-color:${col};stop-opacity:0"/></radialGradient>`;
}
