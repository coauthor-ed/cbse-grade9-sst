// SeaArt.js - drawn things for sea, coast and ocean scenes: water by depth, surf, sand, rock with
// strata, cliffs, palms, a lighthouse, a temple on a hillock, boats and ships, a buoy, a satellite, an
// oil rig, the Sun, the Moon by phase, the Earth as a plain disc, fish, seagrass, coral, huts. Grown
// from the same recipe as atmosphere-climate shared/SkyArt.js and carrying all of its things too.
// General: later geography modules can reuse it. No faces. No colour literals: every colour is a
// recipe over sim tokens, so canvas and SVG read the same art. Text is the scene's job.
//
// Two ways to draw every thing, same arguments after the first two:
//   canvas  drawBuoy(ctx, c, x, y, s, o)     c = this.colors of a scene with COLOR_MAP = SEA_COLOR_MAP
//   SVG     svgBuoy(x, y, s, o)              returns a string, one closed <g>
// x, y place the origin given below; s is a scale; every o also takes:
//   rot (degrees), flip (true mirrors left and right), alpha (0..1).
//
// From SkyArt, same arguments: Cloud, Sun, EarthEdge, Sea, Land, Hills, Rain, Thermometer, Barometer,
// RainGauge, WindVane, Balloon, Aeroplane, Dhow, skyAt, drawSkyColumn, svgSkyGradient, sunGlow.
//
// New here (origin; size at s = 1; options):
//   SeaColumn    top-left of the water; o.w by o.h; bands (4), t, wave (surface height, px), len, top
//                (surface colour role). Water by depth: flat bands, sunlit at the top.
//   WaveLine     left end of calm level; o.w; amp, len, t, foam. The surface as one line of foam
//   Strata       top-left; o.w by o.h; bands (4), seed. Rock in layers: brown, never lavender
//   SandBed      top-left; o.w by o.h; seed. Sand with ripples
//   Cliff        foot of the seaward face; 200 by 180, land to the left; seed. flip for land right
//   Palm         foot of the trunk; 120 tall; lean (px), t (moves the fronds)
//   Lighthouse   foot; 44 by 150; lit (true: lamp on)
//   HillTemple   middle of the foot of the hillock; 240 wide, 150 tall. A small white temple with a flag
//   Hut          middle of the foot; 76 by 56
//   CountryBoat  waterline, middle; 110 long; nets (true)
//   Trawler      waterline, middle; 170 long
//   CargoShip    waterline, middle; 280 long, containers
//   Tanker       waterline, middle; 300 long, low deck
//   PatrolShip   waterline, middle; 200 long; o.stripe (true)
//   Buoy         waterline, middle; 56 wide, 90 tall above
//   Satellite    centre; 150 wide across the panels
//   OilRig       waterline, middle; 120 wide, legs to o.legs below, derrick to y = -120
//   Moon         centre; radius 40; phase 0 new, 0.25 first quarter, 0.5 full, 0.75 third quarter (lit as
//                seen from Earth in the north)
//   EarthDisc    centre; radius 100; plain sea and soft cloud bands, never land; shade false when it spins
//   Fish         middle; 60 long, nose right; kind 0..2; plain eye dot, no smile
//   Seagrass     foot; 40 by 60; t
//   Coral        foot; 70 by 54; seed
//   Foam         middle; 60 by 16; seed
//
// Rule for callers: sea and sky are their own daylight in both themes, so ink on them comes from
// seaColour(c, 'ink') or 'cloud', never c.label.
import { mix, darken, alpha as alphaOf } from 'simulations/base/kit/SimLook.js';
import { GEO_COLOR_MAP } from 'simulations/base/kit/GeoLook.js';

export const SEA_COLOR_MAP = GEO_COLOR_MAP;
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
  rock: 'elevHigh', rockDark: m('elevHigh', 'strata3', 0.7), rockLit: m('elevHigh', 'strata1', 0.42), snow: 'elevPeak', snowShade: m('elevPeak', 'strata5', 0.24),
  hillFar: m('strata5', 'skyDay', 0.56), hillFarDark: m('strata5', 'skyDay', 0.34),
  glass: m('elevPeak', 'ice', 0.4), glassEdge: m('ice', 'strata5', 0.3),
  metal: m('strata5', 'elevPeak', 0.5), metalDark: 'strata5', metalLit: m('strata5', 'elevPeak', 0.78),
  brass: m('gold', 'strata3', 0.28), brassDark: m('gold', 'strata3', 0.72), dial: m('elevPeak', 'gold', 0.1),
  liquid: 'magma', liquidDark: m('magma', 'strata6', 0.34),
  wood: 'strata3', woodDark: m('strata3', 'strata6', 0.5), woodLit: m('strata3', 'strata1', 0.5),
  sail: m('elevPeak', 'gold', 0.1), sailShade: m('elevPeak', 'strata2', 0.34), sailRib: m('elevPeak', 'strata2', 0.56),
  balloon: 'elevPeak', balloonShade: m('elevPeak', 'strata5', 0.3),
  planeBody: 'elevPeak', planeShade: m('elevPeak', 'strata5', 0.34), planeTrim: 'seaDeep', planeGlass: m('strata6', 'seaDeep', 0.4),
  // sea additions
  rockDeep: dk(m('elevHigh', 'strata3', 0.6), 0.38), rockMid: m('elevHigh', 'strata3', 0.5), rockSun: m('strata2', 'strata1', 0.3),
  band1: m('seaShallow', 'elevPeak', 0.14), band2: 'seaShallow', band3: m('seaShallow', 'seaDeep', 0.55), band4: 'seaDeep', band5: dk('seaDeep', 0.28), band6: dk('seaDeep', 0.5),
  white: 'elevPeak', whiteShade: m('elevPeak', 'strata5', 0.24), red: m('magma', 'strata3', 0.26), redDark: m('magma', 'strata3', 0.68),
  hullDark: dk(m('seaDeep', 'strata5', 0.4), 0.3), hullLit: m('seaDeep', 'strata5', 0.3), crate1: m('magma', 'gold', 0.5), crate2: m('seaShallow', 'seaDeep', 0.3), crate3: 'elevLow', crate4: 'gold',
  frond: m('elevLow', 'strata6', 0.08), frondDark: m('elevLow', 'strata6', 0.34), trunk: m('strata2', 'strata3', 0.5),
  moon: m('elevPeak', 'gold', 0.16), moonDark: m('strata5', 'seaDeep', 0.5), moonMark: m('elevPeak', 'strata5', 0.34),
  panel: m('seaDeep', 'strata6', 0.3), panelLit: m('seaDeep', 'seaShallow', 0.5), lamp: 'gold',
  fish1: m('gold', 'magma', 0.4), fish2: m('seaShallow', 'elevPeak', 0.45), fish3: m('magma', 'strata3', 0.1), fishDark: 'ink',
  coral1: m('magma', 'elevPeak', 0.28), coral2: m('gold', 'magma', 0.26), coral3: m('magma', 'strata3', 0.3),
  thatch: m('strata2', 'gold', 0.3), thatchDark: 'strata3',
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
export const seaColour = skyColour;
export const svgSkyColour = (role) => cssColour(role);
export const svgSeaColour = svgSkyColour;

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
  const w = o.w ?? 600, h = o.h ?? 200, R = o.R ?? 900;
  const yAt = (x) => R - Math.sqrt(Math.max(0, R * R - x * x));
  const edge = (lift) => { const p = []; for (let x = -w / 2; x <= w / 2; x += 12) p.push([x, yAt(x) - lift]); return p; };
  const out = [];
  if (o.air !== false) for (const [lift, a] of [[34, 0.14], [24, 0.28], [15, 0.46], [7, 0.8]]) out.push({ d: `${line(edge(lift))}L${n1(w / 2)} ${n1(h)}L${n1(-w / 2)} ${n1(h)}Z`, f: 'airRim', a });
  out.push({ d: `${line(edge(0))}L${n1(w / 2)} ${n1(h)}L${n1(-w / 2)} ${n1(h)}Z`, f: 'seaMid' });
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

// -- the sea things ------------------------------------------------------------
const below = (pts, w, h) => `${line(pts)}L${n1(w)} ${n1(h)}L0 ${n1(h)}Z`;
function waveRow(w, y, amp, len, ph, step = 8) { const p = [], at = (x) => [x, y + Math.sin(x / len + ph) * amp + Math.sin(x / (len * 0.43) + ph * 1.7) * amp * 0.24]; for (let x = 0; x < w; x += step) p.push(at(x)); p.push(at(w)); return p; }
function seaColumn(o) {
  const w = o.w ?? 300, h = o.h ?? 200, n = Math.min(6, o.bands ?? 4), t = o.t ?? 0, amp = o.wave ?? 3, len = o.len ?? 34;
  const names = ['band1', 'band2', 'band3', 'band4', 'band5', 'band6'], out = [];
  for (let i = 0; i < n; i++) {
    const y = i === 0 ? 0 : h * (i / n) ** 1.25;
    out.push({ d: below(waveRow(w, y, i === 0 ? amp : 1.6, len * (1 + i * 0.5), t * 1.1 + i * 1.4, 12), w, h), f: names[i] });
  }
  // sunlight, shafts falling from the top-left
  out.push({ d: `M${n1(w * 0.08)} 0L${n1(w * 0.2)} 0L${n1(w * 0.04)} ${n1(h * 0.42)}L${n1(-w * 0.02)} ${n1(h * 0.42)}ZM${n1(w * 0.3)} 0L${n1(w * 0.36)} 0L${n1(w * 0.2)} ${n1(h * 0.34)}L${n1(w * 0.14)} ${n1(h * 0.34)}Z`, f: 'foam', a: 0.09 });
  return out;
}
function waveLine(o) {
  const w = o.w ?? 300, amp = o.amp ?? 4, len = o.len ?? 30, t = o.t ?? 0;
  return [{ d: line(waveRow(w, 0, amp, len, t * 1.1)), s: o.colour ?? 'foam', w: o.width ?? 3.5, a: 0.92 }];
}
function strata(o) {
  const w = o.w ?? 300, h = o.h ?? 100, n = o.bands ?? 4, seed = o.seed ?? 3, r = rnd(seed), out = [{ d: rrect(0, 0, w, h, 0), f: 'rock' }];
  const names = ['rockLit', 'rock', 'rockMid', 'rockDark', 'rockDeep', 'rockDeep'];
  for (let i = 0; i < n; i++) {
    const y0 = h * i / n, ph = r() * 6, pts = [];
    for (let x = 0; x < w; x += 18) pts.push([x, y0 + Math.sin(x / 70 + ph) * 3.5]);
    pts.push([w, y0 + Math.sin(w / 70 + ph) * 3.5]);
    out.push({ d: below(pts, w, h), f: names[Math.min(i, 5)] });
  }
  for (let i = 0; i < Math.floor(w / 42); i++) { const x = r() * w, y = 6 + r() * (h - 12), l = 8 + r() * 16; out.push({ d: line([[x, y], [x + l, y + 1 - r() * 2]]), s: 'rockDeep', w: 2.2, a: 0.4 }); }
  return out;
}
function sandBed(o) {
  const w = o.w ?? 300, h = o.h ?? 40, r = rnd(o.seed ?? 9), out = [{ d: rrect(0, 0, w, h, 0), f: 'sand' }, { d: `M0 ${n1(h * 0.55)}L${n1(w)} ${n1(h * 0.48)}L${n1(w)} ${n1(h)}L0 ${n1(h)}Z`, f: 'sandDark', a: 0.5 }];
  for (let i = 0; i < Math.floor(w / 34); i++) { const x = r() * w, y = 5 + r() * h * 0.42; out.push({ d: `M${n1(x)} ${n1(y)}q7 -4 14 0`, s: 'sandDark', w: 2.4, a: 0.7 }); }
  return out;
}
function cliff(o) {
  const r = rnd(o.seed ?? 4), jag = [[0, 0], [-6, -26], [-2, -48], [-16, -74], [-10, -98], [-26, -128], [-20, -152], [-30, -180]];
  const face = `${line(jag)}L-200 -180L-200 0Z`, out = [{ d: face, f: 'rock' }];
  for (let i = 1; i <= 5; i++) { const y = -i * 30, pts = []; for (let x = -200; x <= 0; x += 18) pts.push([x, y + Math.sin(x / 26 + i * 2) * 3]); out.push({ d: line(pts), s: 'rockDark', w: 3, a: 0.7 }); }
  out.push({ d: `${line(jag)}L${-44} -180L-38 -130L-22 -84L-18 -40L-14 0Z`, f: 'rockDark', a: 0.8 });
  out.push({ d: `M-200 -180L-30 -180Q-32 -188 -46 -190L-200 -192Z`, f: 'grass' });
  for (let i = 0; i < 9; i++) { const x = -190 + r() * 150, y = -170 + r() * 150; out.push({ d: line([[x, y], [x + 8 + r() * 16, y + 1]]), s: 'rockDeep', w: 2.4, a: 0.35 }); }
  return out;
}
function palm(o) {
  const lean = o.lean ?? 16, sway = Math.sin((o.t ?? 0) * 1.4) * 3, tx = lean, ty = -120, out = [];
  out.push({ d: `M-5 0Q${n1(lean * 0.2 - 5)} -60 ${n1(tx - 3)} ${ty}L${n1(tx + 3)} ${ty}Q${n1(lean * 0.2 + 7)} -60 7 0Z`, f: 'trunk' });
  out.push({ d: `M1 -6Q${n1(lean * 0.2 + 2)} -60 ${n1(tx + 1)} ${ty}L${n1(tx + 3)} ${ty}Q${n1(lean * 0.2 + 7)} -60 7 0Z`, f: 'woodDark', a: 0.5 });
  const leaves = [[-58, -4], [-44, 16], [-20, 28], [22, 28], [46, 14], [60, -6]];
  leaves.forEach(([dx, dy], i) => {
    const ex = tx + dx + sway, ey = ty + dy + 8, mx = tx + dx * 0.5 + sway * 0.5, my = ty + dy * 0.1 - 22;
    out.push({ d: `M${n1(tx)} ${ty}Q${n1(mx)} ${n1(my)} ${n1(ex)} ${n1(ey)}Q${n1(mx)} ${n1(my + 12)} ${n1(tx)} ${ty + 3}Z`, f: i % 2 ? 'frondDark' : 'frond' });
  });
  out.push({ d: circle(tx - 4, ty + 6, 5) + circle(tx + 5, ty + 7, 5), f: 'woodDark' });
  return out;
}
function lighthouse(o) {
  const out = [
    { d: 'M-22 0L-13 -120L13 -120L22 0Z', f: 'white' },
    { d: 'M2 0L2 -120L13 -120L22 0Z', f: 'whiteShade', a: 0.8 },
    { d: 'M-20 -30L-18 -52L18 -52L20 -30ZM-16 -74L-15 -96L15 -96L16 -74Z', f: 'red' },
    { d: 'M2 -30L2 -52L18 -52L20 -30ZM2 -74L2 -96L15 -96L16 -74Z', f: 'redDark', a: 0.7 },
    { d: rrect(-20, -124, 40, 6, 2), f: 'metalDark' },
    { d: rrect(-10, -142, 20, 18, 3), f: o.lit ? 'lamp' : 'glass' },
    { d: 'M-13 -142L0 -156L13 -142Z', f: 'red' },
    { d: rrect(-5, -18, 10, 18, 2), f: 'woodDark' },
  ];
  return out;
}
function hillTemple() {
  const out = [
    { d: 'M-120 0Q-92 -20 -66 -58Q-40 -92 0 -92Q40 -92 66 -58Q92 -20 120 0Z', f: 'rock' },
    { d: 'M0 -92Q40 -92 66 -58Q92 -20 120 0L14 0Q40 -46 0 -92Z', f: 'rockDark', a: 0.8 },
    { d: 'M-104 -14Q-30 -34 40 -28M-78 -42Q-30 -58 30 -56', s: 'rockDeep', w: 3, a: 0.45 },
    { d: rrect(-34, -112, 68, 22, 3), f: 'white' },
    { d: 'M-22 -112L-16 -136Q0 -156 16 -136L22 -112Z', f: 'white' },
    { d: 'M0 -150Q12 -140 16 -136L22 -112L4 -112Z', f: 'whiteShade', a: 0.8 },
    { d: rrect(-40, -92, 80, 5, 2), f: 'whiteShade' },
    { d: rrect(-9, -110, 18, 20, 8), f: 'woodDark' },
    { d: line([[0, -148], [0, -176]]), s: 'metalDark', w: 2.5 },
    { d: 'M0 -176L22 -170L0 -163Z', f: 'red' },
  ];
  return out;
}
function hut() {
  return [
    { d: rrect(-30, -30, 60, 30, 3), f: 'sand' }, { d: rrect(0, -30, 30, 30, 3), f: 'sandDark', a: 0.6 },
    { d: 'M-40 -28L0 -58L40 -28Z', f: 'thatch' }, { d: 'M0 -58L40 -28L6 -28Z', f: 'thatchDark', a: 0.6 },
    { d: rrect(-8, -20, 16, 20, 2), f: 'woodDark' },
  ];
}
function countryBoat(o) {
  const out = [
    { d: 'M-55 -12Q-30 -2 0 -2Q30 -2 58 -18Q52 2 34 8Q0 13 -36 8Q-50 2 -55 -12Z', f: 'wood' },
    { d: 'M-55 -12Q-30 -2 0 -2Q30 -2 58 -18L55 -13Q30 3 0 3Q-30 3 -53 -7Z', f: 'woodLit' },
    { d: 'M-40 6Q0 12 38 5L34 8Q0 13 -36 8Z', f: 'woodDark' },
    { d: line([[-6, -2], [-6, -54]]), s: 'woodDark', w: 3.5 },
    { d: 'M-4 -52Q26 -30 28 -8L-4 -8Z', f: 'sail' }, { d: 'M-4 -52Q6 -30 4 -8L-4 -8Z', f: 'sailShade', a: 0.8 },
  ];
  if (o.nets) out.push({ d: 'M-40 -6L-58 12M-46 -6L-66 10M-34 -6L-52 16', s: 'inkSoft', w: 2 });
  return out;
}
function trawler() {
  return [
    { d: 'M-80 -18L82 -26Q76 -6 66 8L-70 8Q-78 -4 -80 -18Z', f: 'red' },
    { d: 'M-72 2L70 2L66 8L-70 8Z', f: 'redDark' },
    { d: 'M-80 -18L82 -26L80 -21L-79 -13Z', f: 'white' },
    { d: rrect(-16, -52, 54, 34, 4), f: 'white' }, { d: rrect(12, -52, 26, 34, 4), f: 'whiteShade', a: 0.8 },
    { d: rrect(-10, -46, 12, 10, 2) + rrect(8, -46, 12, 10, 2) + rrect(24, -46, 10, 10, 2), f: 'planeGlass' },
    { d: rrect(-2, -66, 26, 14, 3), f: 'white' },
    { d: line([[-46, -18], [-46, -82]]) + line([[-46, -80], [-14, -60]]), s: 'metalDark', w: 3.5 },
    { d: line([[-46, -76], [-72, -24]]) + line([[-72, -24], [-72, -14]]), s: 'metalDark', w: 2.4 },
  ];
}
function cargoShip() {
  const crate = [];
  const roles = ['crate1', 'crate2', 'crate3', 'crate4', 'crate2', 'crate1', 'crate4', 'crate3', 'crate2'];
  let k = 0;
  for (let i = 0; i < 7; i++) for (let j = 0; j < (i % 3 === 1 ? 3 : 2); j++) crate.push({ d: rrect(-84 + i * 30, -44 - j * 17, 28, 16, 2), f: roles[k++ % 9] });
  return [
    ...crate,
    { d: 'M-140 -28L140 -32Q146 -20 124 10L-124 10Q-136 -10 -140 -28Z', f: 'hullDark' },
    { d: 'M-132 2L132 0L124 10L-124 10Z', f: 'red' },
    { d: 'M-140 -28L140 -32L138 -27L-138 -23Z', f: 'white' },
    { d: rrect(-132, -74, 40, 46, 4), f: 'white' }, { d: rrect(-112, -74, 20, 46, 4), f: 'whiteShade', a: 0.8 },
    { d: rrect(-136, -86, 50, 12, 3), f: 'white' }, { d: rrect(-130, -83, 38, 6, 2), f: 'planeGlass' },
    { d: rrect(-126, -102, 14, 18, 2), f: 'red' },
  ];
}
function tanker() {
  return [
    { d: 'M-150 -16L150 -20Q156 -8 134 14L-134 14Q-148 -2 -150 -16Z', f: 'red' },
    { d: 'M-142 2L144 -2L134 14L-134 14Z', f: 'redDark' },
    { d: 'M-150 -16L150 -20L148 -14L-148 -10Z', f: 'hullDark' },
    { d: `${line([[-84, -22], [124, -24]])}`, s: 'metalDark', w: 5 },
    { d: rrect(-60, -30, 8, 10, 2) + rrect(-10, -31, 8, 11, 2) + rrect(40, -32, 8, 12, 2) + rrect(90, -33, 8, 13, 2), f: 'metal' },
    { d: rrect(-140, -60, 46, 44, 4), f: 'white' }, { d: rrect(-118, -60, 24, 44, 4), f: 'whiteShade', a: 0.8 },
    { d: rrect(-146, -72, 58, 12, 3), f: 'white' }, { d: rrect(-140, -69, 46, 6, 2), f: 'planeGlass' },
    { d: rrect(-134, -90, 14, 20, 2), f: 'hullDark' },
  ];
}
function patrolShip(o) {
  const out = [
    { d: 'M-96 -18L104 -30Q92 -8 76 10L-84 10Q-94 -4 -96 -18Z', f: 'white' },
    { d: 'M-90 0L88 -4L76 10L-84 10Z', f: 'whiteShade' },
    { d: rrect(-46, -48, 76, 30, 4), f: 'white' }, { d: rrect(0, -48, 30, 30, 4), f: 'whiteShade', a: 0.8 },
    { d: rrect(-40, -42, 12, 9, 2) + rrect(-22, -42, 12, 9, 2) + rrect(-4, -42, 12, 9, 2) + rrect(14, -42, 10, 9, 2), f: 'planeGlass' },
    { d: rrect(-22, -64, 34, 16, 3), f: 'white' },
    { d: line([[-6, -64], [-6, -92]]) + line([[-16, -82], [4, -82]]), s: 'metalDark', w: 3 },
    { d: rrect(58, -36, 12, 8, 2) + line([[64, -32], [86, -36]]), f: 'metalDark', s: 'metalDark', w: 2.4 },
  ];
  if (o.stripe !== false) out.push({ d: 'M34 -22L52 -24L34 8L16 9Z', f: 'red' });
  return out;
}
function buoy() {
  return [
    { d: 'M-28 6Q-28 -10 -16 -14L16 -14Q28 -10 28 6Q0 16 -28 6Z', f: 'gold' },
    { d: 'M0 -14L16 -14Q28 -10 28 6Q14 11 0 12Z', f: 'brass', a: 0.8 },
    { d: 'M-27 0Q0 9 27 0L28 6Q0 16 -28 6Z', f: 'red' },
    { d: 'M-10 -14L-6 -62L6 -62L10 -14Z', f: 'metalLit' },
    { d: 'M0 -14L10 -14L6 -62L0 -62Z', f: 'metal' },
    { d: rrect(-16, -40, 32, 6, 2), f: 'panel' },
    { d: line([[0, -62], [0, -86]]), s: 'metalDark', w: 3 },
    { d: circle(0, -88, 4), f: 'red' },
  ];
}
function satellite() {
  const cells = (x0) => { let d = ''; for (let i = 0; i < 4; i++) d += rrect(x0 + i * 13, -16, 12, 32, 1.5); return d; };
  return [
    { d: rrect(-74, -18, 56, 36, 3), f: 'panel' }, { d: rrect(18, -18, 56, 36, 3), f: 'panel' },
    { d: cells(-73) + cells(19), f: 'panelLit' },
    { d: line([[-18, 0], [-12, 0]]) + line([[12, 0], [18, 0]]), s: 'metalDark', w: 5 },
    { d: rrect(-14, -24, 28, 48, 6), f: 'gold' }, { d: rrect(0, -24, 14, 48, 6), f: 'brass', a: 0.85 },
    { d: 'M-12 30Q0 42 12 30Z', f: 'metalLit' }, { d: line([[0, 24], [0, 34]]), s: 'metalDark', w: 3 },
  ];
}
function oilRig(o) {
  const legs = o.legs ?? 90;
  return [
    { d: line([[-44, -10], [-48, legs]]) + line([[44, -10], [48, legs]]) + line([[-14, -10], [-16, legs]]) + line([[14, -10], [16, legs]]), s: 'metalDark', w: 6 },
    { d: line([[-46, 22], [46, 22]]) + line([[-47, 54], [47, 54]]) + line([[-46, 22], [46, 54]]) + line([[46, 22], [-46, 54]]), s: 'metalDark', w: 3.5 },
    { d: rrect(-58, -22, 116, 14, 3), f: 'gold' }, { d: rrect(-58, -14, 116, 6, 2), f: 'brassDark' },
    { d: rrect(10, -48, 42, 26, 3), f: 'white' }, { d: rrect(30, -48, 22, 26, 3), f: 'whiteShade', a: 0.8 },
    { d: `${line([[-40, -22], [-22, -116], [-4, -22]])}${line([[-34, -52], [-10, -52]])}${line([[-29, -80], [-15, -80]])}${line([[-36, -40], [-10, -66]])}`, s: 'red', w: 4 },
    { d: line([[-22, -116], [-22, -130]]), s: 'metalDark', w: 3 },
  ];
}
function moon(o) {
  const R = 40, ph = ((o.phase ?? 0.5) % 1 + 1) % 1, out = [{ d: circle(0, 0, R), f: 'moonDark' }];
  // The lit shape: a half disc, closed by a half ellipse (the terminator) of half-width |cos(2 pi ph)| R.
  const k = Math.cos(ph * Math.PI * 2), rx = n1(Math.max(0.01, Math.abs(k) * R)), waxing = ph < 0.5;
  const edge = waxing ? 1 : 0, back = waxing ? (k > 0 ? 0 : 1) : (k > 0 ? 1 : 0);
  if (ph > 0.01 && ph < 0.99) out.push({ d: `M0 ${-R}A${R} ${R} 0 0 ${edge} 0 ${R}A${rx} ${R} 0 0 ${back} 0 ${-R}Z`, f: 'moon' });
  const near = Math.abs(ph - 0.5) < 0.2;
  for (const [x, y, q] of [[-12, -14, 8], [12, 8, 10], [-16, 16, 5], [18, -18, 5]]) if (near || (ph > 0.05 && ph < 0.95 && (waxing ? x > 0 : x < 0))) out.push({ d: circle(x, y, q), f: 'moonMark', a: 0.6 });
  return out;
}
function earthDisc(o) {
  const R = 100, out = [{ d: circle(0, 0, R), f: 'seaDeep' }, { d: circle(-12, -14, 80), f: 'seaMid', a: 0.55 }];
  // No land, on purpose: a made-up land shape reads as a map of real continents. Sea and soft cloud bands only.
  const band = (y, x0, x1, bow, thick, a) => out.push({ d: `M${x0} ${y}Q${(x0 + x1) / 2} ${y - bow} ${x1} ${y}Q${(x0 + x1) / 2} ${y - bow + thick} ${x0} ${y}Z`, f: 'cloud', a });
  band(-58, -56, 42, 8, 15, 0.55); band(-26, -82, 12, 10, 17, 0.42); band(-8, 26, 86, 8, 14, 0.5); band(30, -74, 44, 10, 18, 0.55); band(62, -28, 58, 8, 14, 0.42);
  out.push({ d: `${circle(0, 0, R)}`, s: 'airRim', w: 4 });
  if (o.shade !== false) out.push({ d: `M40 ${-R * 0.92}A${R} ${R} 0 0 1 40 ${R * 0.92}Q96 0 40 ${-R * 0.92}Z`, f: 'ink', a: 0.22 });
  return out;
}
function fish(o) {
  const k = o.kind ?? 0, f = ['fish1', 'fish2', 'fish3'][k % 3];
  return [
    { d: 'M-22 0L-34 -11L-30 0L-34 11Z', f },
    { d: 'M26 0Q10 -15 -12 -8Q-24 -3 -26 0Q-24 3 -12 8Q10 15 26 0Z', f },
    { d: 'M-2 -11Q6 -19 12 -10Z', f, a: 0.8 },
    { d: 'M-22 2Q0 12 24 1Q10 13 -12 8Z', f: 'ink', a: 0.14 },
    { d: circle(14, -2, 2.2), f: 'fishDark' },
  ];
}
function seagrass(o) {
  const t = o.t ?? 0, out = [];
  for (const [x, h, p] of [[-12, 46, 0], [0, 62, 1.6], [12, 40, 3]]) {
    const b = Math.sin(t * 1.1 + p) * 6;
    out.push({ d: `M${x - 3} 0Q${n1(x - 8 + b)} ${n1(-h * 0.5)} ${n1(x + b)} ${-h}Q${n1(x + 8 + b * 0.5)} ${n1(-h * 0.5)} ${x + 3} 0Z`, f: p === 1.6 ? 'grassDark' : 'grass' });
  }
  return out;
}
function coral(o) {
  const r = rnd(o.seed ?? 8), out = [];
  const roles = ['coral1', 'coral2', 'coral3'];
  for (let i = 0; i < 3; i++) {
    const x = -22 + i * 22, h = 30 + r() * 24, q = roles[(i + (o.seed ?? 0)) % 3];
    out.push({ d: line([[x, 0], [x, -h]]) + line([[x, -h * 0.5], [x - 11, -h * 0.82]]) + line([[x, -h * 0.34], [x + 11, -h * 0.72]]), s: q, w: 7 });
  }
  return out;
}
function foam(o) {
  const r = rnd(o.seed ?? 2);
  return [{ d: [0, 1, 2, 3].map((i) => ell(-22 + i * 15, r() * 4 - 2, 9 + r() * 5, 5 + r() * 3)).join(''), f: 'foam' }];
}

const seaColumnPair = pair(seaColumn);   export const drawSeaColumn = seaColumnPair[0];   export const svgSeaColumn = seaColumnPair[1];
const waveLinePair = pair(waveLine);     export const drawWaveLine = waveLinePair[0];     export const svgWaveLine = waveLinePair[1];
const strataPair = pair(strata);         export const drawStrata = strataPair[0];         export const svgStrata = strataPair[1];
const sandBedPair = pair(sandBed);       export const drawSandBed = sandBedPair[0];       export const svgSandBed = sandBedPair[1];
const cliffPair = pair(cliff);           export const drawCliff = cliffPair[0];           export const svgCliff = cliffPair[1];
const palmPair = pair(palm);             export const drawPalm = palmPair[0];             export const svgPalm = palmPair[1];
const lighthousePair = pair(lighthouse); export const drawLighthouse = lighthousePair[0]; export const svgLighthouse = lighthousePair[1];
const hillTemplePair = pair(hillTemple); export const drawHillTemple = hillTemplePair[0]; export const svgHillTemple = hillTemplePair[1];
const hutPair = pair(hut);               export const drawHut = hutPair[0];               export const svgHut = hutPair[1];
const countryBoatPair = pair(countryBoat); export const drawCountryBoat = countryBoatPair[0]; export const svgCountryBoat = countryBoatPair[1];
const trawlerPair = pair(trawler);       export const drawTrawler = trawlerPair[0];       export const svgTrawler = trawlerPair[1];
const cargoShipPair = pair(cargoShip);   export const drawCargoShip = cargoShipPair[0];   export const svgCargoShip = cargoShipPair[1];
const tankerPair = pair(tanker);         export const drawTanker = tankerPair[0];         export const svgTanker = tankerPair[1];
const patrolShipPair = pair(patrolShip); export const drawPatrolShip = patrolShipPair[0]; export const svgPatrolShip = patrolShipPair[1];
const buoyPair = pair(buoy);             export const drawBuoy = buoyPair[0];             export const svgBuoy = buoyPair[1];
const satellitePair = pair(satellite);   export const drawSatellite = satellitePair[0];   export const svgSatellite = satellitePair[1];
const oilRigPair = pair(oilRig);         export const drawOilRig = oilRigPair[0];         export const svgOilRig = oilRigPair[1];
const moonPair = pair(moon);             export const drawMoon = moonPair[0];             export const svgMoon = moonPair[1];
const earthDiscPair = pair(earthDisc);   export const drawEarthDisc = earthDiscPair[0];   export const svgEarthDisc = earthDiscPair[1];
const fishPair = pair(fish);             export const drawFish = fishPair[0];             export const svgFish = fishPair[1];
const seagrassPair = pair(seagrass);     export const drawSeagrass = seagrassPair[0];     export const svgSeagrass = seagrassPair[1];
const coralPair = pair(coral);           export const drawCoral = coralPair[0];           export const svgCoral = coralPair[1];
const foamPair = pair(foam);             export const drawFoam = foamPair[0];             export const svgFoam = foamPair[1];

// For a shape made of many paths (a sea-floor section, a world): paint your own primitive list.
export const drawPrims = (ctx, c, prims, x = 0, y = 0, s = 1, o = {}) => paintCanvas(ctx, c, prims, x, y, s, o);
export const svgPrims = (prims, x = 0, y = 0, s = 1, o = {}) => paintSvg(prims, x, y, s, o);
export const pathLine = line;
export const pathCircle = circle;
export const pathEllipse = ell;
export const pathRoundRect = rrect;
export const blend = m;
export const darkenRole = dk;
