// CivicArt.js - drawn things for the democracy scenes. A helper, not a scene: no class here.
// One spec per thing, two renderers, so a canvas scene and an SVG or DOM scene show the same object.
// Things have no faces. Colours are mixed from sim tokens, so both themes and the plain look stay safe.
//
// Kinds (w x h design units; the ground is the bottom edge):
//   booth  ballotBox  voteMachine  parliament  court  office  school  tree  square
//   book  bookOpen  newspaper  phone  mike
//
// Canvas:  drawCivic(ctx, c, 'court', x, y, { w, h, alpha, dim })
//   (x, y) is the ground centre. Give w OR h; default is the kind's own size.
//   Returns { x, y, w, h } of the drawn box, for hit tests and leader lines.
// SVG:     civicSvg('court', x, y, { w, h, dim, cls })   a <g> string for an SVG stage, same anchor.
// DOM:     civicHtml('court', { size, label, dim })      a self-sized <svg class="cv-art"> string;
//   size is its width in px. Add CIVIC_CSS once.
// Parts:   shapes carry a part name (see CIVIC_PARTS). dim: a function part => true dims that part,
//   so a TapLight can light one part: dim: (p) => tl.off(p).  In SVG each part is <g data-part="x">.
// Size:    civicSize('court') -> { w, h }.
//
// Paints: key from the table below. Mix: ['gold', 'bgSurface', 0.6] moves 60% from gold to bgSurface.
import { mix, alpha, pill } from 'simulations/base/kit/SimLook.js';

const VAR = {
  gold: '--sim-gold', water: '--sim-water', waste: '--sim-waste', stroke: '--sim-stroke', label: '--sim-label',
  bgSurface: '--sim-bg-surface', bgDeep: '--sim-bg-deep', accent: '--sim-accent',
  s1: '--sim-series-1', s2: '--sim-series-2', s3: '--sim-series-3', s4: '--sim-series-4',
  s5: '--sim-series-5', s6: '--sim-series-6', s7: '--sim-series-7', s8: '--sim-series-8',
};

// The module's daylight materials. Warm lime-wash and stone; no flag colours and no party colours.
const INK = ['label', 's8', 0.15];
const WASH = ['gold', 'bgSurface', 0.74];
const WASH2 = ['gold', 'bgSurface', 0.56];
const WASH3 = ['gold', 'bgSurface', 0.38];
const STONE = ['waste', 'bgSurface', 0.58];
const STONE2 = ['waste', 'bgSurface', 0.36];
const STONE3 = ['waste', 'bgSurface', 0.8];
const RIM = ['waste', 'label', 0.5];
const WOOD = ['s8', 'label', 0.46];
const WOOD2 = ['s8', 'label', 0.22];
const LEAF = ['s3', 's8', 0.22];
const LEAF2 = ['s3', 'label', 0.3];
const LEAF3 = ['s3', 'bgSurface', 0.3];
const SKYGLASS = ['s1', 'label', 0.28];
const PAPER = ['bgSurface', 'gold', 0.1];
const COVER = ['s5', 'label', 0.42];
const COVER2 = ['s5', 'label', 0.2];
const SHADOW = ['label', 'bgSurface', 0.55];

const rect = (x, y, w, h, r, paint, o = {}) => ({ t: 'r', x, y, w, h, r, paint, ...o });
const path = (d, paint, o = {}) => ({ t: 'p', d, paint, ...o });
const line = (d, paint, lw = 3, o = {}) => ({ t: 'p', d, stroke: paint, lw, ...o });
const circ = (x, y, r, paint, o = {}) => ({ t: 'c', x, y, r, paint, ...o });
const oval = (x, y, rx, ry, paint, o = {}) => ({ t: 'e', x, y, rx, ry, paint, ...o });

const shade = (W, H, a = 0.2) => oval(W / 2, H - 2, W * 0.5, 7, SHADOW, { a, part: 'ground' });

const range = (n, f) => Array.from({ length: n }, (_, i) => f(i));

const ART = {
  // A polling compartment: a folded screen on a table, the machine hidden behind it.
  booth: { w: 200, h: 200, shapes: () => [
    shade(200, 200),
    rect(16, 110, 168, 14, 4, WOOD, { rim: RIM, part: 'table' }),
    rect(28, 124, 12, 74, 3, WOOD2, { rim: RIM, part: 'table' }),
    rect(160, 124, 12, 74, 3, WOOD2, { rim: RIM, part: 'table' }),
    path('M34 12 L62 26 L62 112 L34 112 Z', STONE3, { rim: RIM, part: 'screen' }),
    path('M166 12 L138 26 L138 112 L166 112 Z', STONE3, { rim: RIM, part: 'screen' }),
    path('M62 26 L138 26 L138 112 L62 112 Z', PAPER, { rim: RIM, part: 'screen' }),
    path('M62 26 L138 26 L138 42 L62 42 Z', STONE, { part: 'screen' }),
    rect(78, 66, 44, 44, 4, ['s1', 'label', 0.5], { rim: RIM, part: 'machine' }),
    rect(84, 72, 32, 8, 2, ['s1', 'bgSurface', 0.5], { part: 'machine' }),
    ...range(3, (i) => rect(84, 84 + i * 7, 32, 4, 2, ['s1', 'bgSurface', 0.2], { part: 'machine' })),
  ] },

  // A metal box with a slot; the slip stands half in.
  ballotBox: { w: 170, h: 170, shapes: () => [
    shade(170, 170),
    rect(68, 8, 34, 52, 3, PAPER, { rim: RIM, part: 'slip' }),
    line('M76 20H94M76 30H94M76 40H88', STONE2, 3, { part: 'slip' }),
    path('M16 66 L34 46 L136 46 L154 66 Z', STONE2, { rim: RIM, part: 'box' }),
    rect(58, 52, 54, 7, 3, INK, { part: 'box' }),
    rect(16, 66, 138, 98, 8, STONE, { rim: RIM, part: 'box' }),
    rect(16, 66, 138, 16, 6, STONE3, { a: 0.55, part: 'box' }),
    rect(112, 66, 42, 98, 6, STONE2, { a: 0.55, part: 'box' }),
    rect(70, 96, 30, 26, 4, WASH2, { rim: RIM, part: 'box' }),
    circ(85, 109, 6, INK, { part: 'box' }),
  ] },

  // The balloting unit: a tall panel with rows of blue buttons, a lamp at each row. No names on it.
  voteMachine: { w: 150, h: 230, shapes: () => [
    shade(150, 230),
    rect(12, 6, 126, 220, 12, ['bgSurface', 'waste', 0.2], { rim: RIM, part: 'body' }),
    rect(12, 6, 26, 220, 10, ['bgSurface', 'label', 0.08], { a: 0.8, part: 'body' }),
    rect(28, 18, 94, 10, 4, STONE2, { part: 'body' }),
    ...range(4, (i) => rect(26, 42 + i * 44, 98, 36, 6, PAPER, { rim: STONE, part: `row${i + 1}` })),
    ...range(4, (i) => circ(112, 60 + i * 44, 9, ['s1', 'label', 0.3], { rim: ['s1', 'label', 0.6], part: `row${i + 1}` })),
    ...range(4, (i) => circ(92, 60 + i * 44, 4, ['s6', 'bgSurface', 0.2], { part: `row${i + 1}` })),
  ] },

  // A round chamber behind a ring of columns, a low dome over it. No flag.
  parliament: { w: 360, h: 190, shapes: () => [
    shade(360, 190),
    rect(6, 172, 348, 14, 4, STONE2, { rim: RIM, part: 'base' }),
    rect(22, 160, 316, 14, 3, STONE, { rim: RIM, part: 'base' }),
    path('M118 58 C138 18 222 18 242 58 Z', STONE, { rim: RIM, part: 'dome' }),
    path('M126 58 C144 26 186 24 200 24 C178 30 156 40 148 58 Z', STONE3, { a: 0.7, part: 'dome' }),
    rect(42, 56, 276, 20, 5, WASH, { rim: RIM, part: 'drum' }),
    rect(52, 76, 256, 86, 2, WASH3, { rim: RIM, part: 'drum' }),
    rect(52, 76, 256, 86, 2, ['label', 'bgSurface', 0.62], { a: 0.2, part: 'drum' }),
    ...range(15, (i) => {
      const u = (i - 7) / 7, x = 180 + Math.sin(u * 1.26) * 134, w = 7 + 7 * Math.cos(u * 1.26);
      return rect(x - w / 2, 76, w, 86, 2, WASH, { rim: RIM, rw: 1.2, part: 'columns' });
    }),
    rect(42, 66, 276, 4, 2, RIM, { a: 0.3, part: 'drum' }),
  ] },

  // Court: wide steps, four columns, a plain pediment. The scales are for a scene to add if it needs them.
  court: { w: 300, h: 230, shapes: () => [
    shade(300, 230),
    ...range(3, (i) => rect(26 - i * 11, 188 + i * 13, 248 + i * 22, 14, 3, i === 1 ? STONE3 : STONE, { rim: RIM, part: 'steps' })),
    path('M28 66 L150 8 L272 66 Z', WASH, { rim: RIM, part: 'roof' }),
    path('M64 60 L150 20 L236 60 Z', WASH2, { part: 'roof' }),
    rect(26, 66, 248, 16, 3, WASH, { rim: RIM, part: 'roof' }),
    rect(46, 82, 208, 106, 2, WASH3, { part: 'hall' }),
    rect(126, 112, 48, 76, 4, WOOD, { rim: RIM, part: 'hall' }),
    line('M150 112V188', RIM, 2.5, { part: 'hall' }),
    ...[52, 96, 186, 230].map((x) => rect(x, 82, 18, 106, 3, STONE3, { rim: RIM, part: 'columns' })),
    ...[52, 96, 186, 230].map((x) => rect(x + 12, 84, 6, 104, 2, STONE, { a: 0.7, part: 'columns' })),
  ] },

  // The executive's office block: rows of windows, a porch.
  office: { w: 280, h: 220, shapes: () => [
    shade(280, 220),
    rect(20, 16, 240, 200, 6, WASH2, { rim: RIM, part: 'block' }),
    rect(20, 16, 240, 16, 5, WASH, { rim: RIM, part: 'block' }),
    ...range(3, (r) => range(6, (c) => rect(38 + c * 36, 44 + r * 44, 24, 30, 3, SKYGLASS, { rim: RIM, rw: 1.5, part: 'windows' }))).flat(),
    rect(100, 170, 80, 46, 3, WOOD, { rim: RIM, part: 'porch' }),
    rect(88, 156, 104, 14, 4, WASH, { rim: RIM, part: 'porch' }),
    rect(94, 170, 8, 46, 2, STONE3, { rim: RIM, rw: 1.2, part: 'porch' }),
    rect(178, 170, 8, 46, 2, STONE3, { rim: RIM, rw: 1.2, part: 'porch' }),
  ] },

  // A government school: a long low block, a veranda, a bell, a ground in front.
  school: { w: 320, h: 180, shapes: () => [
    shade(320, 180),
    path('M10 62 L40 28 L280 28 L310 62 Z', ['s6', 's8', 0.45], { rim: RIM, part: 'roof' }),
    rect(22, 62, 276, 112, 3, WASH2, { rim: RIM, part: 'wall' }),
    rect(22, 150, 276, 24, 2, STONE, { rim: RIM, part: 'wall' }),
    ...[44, 106, 214, 256].map((x) => rect(x, 84, 40, 40, 3, SKYGLASS, { rim: RIM, part: 'windows' })),
    ...[44, 106, 214, 256].map((x) => line(`M${x + 20} 84V124M${x} 104H${x + 40}`, RIM, 2, { part: 'windows' })),
    rect(162, 86, 40, 88, 4, WOOD, { rim: RIM, part: 'door' }),
    rect(165, 14, 34, 14, 3, STONE, { rim: RIM, part: 'bell' }),
    circ(182, 8, 7, ['gold', 'label', 0.3], { rim: RIM, part: 'bell' }),
  ] },

  // A wide shade tree.
  tree: { w: 260, h: 240, shapes: () => [
    shade(260, 240),
    path('M116 236 C120 190 112 158 96 130 L126 136 L130 104 L146 138 L170 126 C150 160 146 196 150 236 Z', WOOD, { rim: RIM, part: 'trunk' }),
    line('M72 118V176M196 112V160', WOOD2, 3.5, { part: 'trunk' }),
    circ(62, 92, 52, LEAF2, { rim: LEAF2, part: 'crown' }),
    circ(196, 90, 56, LEAF2, { rim: LEAF2, part: 'crown' }),
    circ(128, 64, 64, LEAF, { rim: LEAF2, part: 'crown' }),
    circ(84, 72, 40, LEAF, { part: 'crown' }),
    circ(176, 68, 44, LEAF, { part: 'crown' }),
    circ(104, 44, 26, LEAF3, { a: 0.75, part: 'crown' }),
    circ(62, 72, 18, LEAF3, { a: 0.6, part: 'crown' }),
    circ(170, 48, 20, LEAF3, { a: 0.6, part: 'crown' }),
  ] },

  // The village square: a raised round platform under the tree. People go on it, drawn by the scene.
  square: { w: 340, h: 250, shapes: () => [
    shade(340, 250),
    path('M152 214 C156 180 148 150 132 124 L160 132 L164 100 L180 134 L204 120 C186 154 182 186 186 214 Z', WOOD, { rim: RIM, part: 'trunk' }),
    circ(96, 90, 56, LEAF2, { rim: LEAF2, part: 'crown' }),
    circ(240, 88, 60, LEAF2, { rim: LEAF2, part: 'crown' }),
    circ(168, 62, 68, LEAF, { rim: LEAF2, part: 'crown' }),
    circ(120, 72, 44, LEAF, { part: 'crown' }),
    circ(222, 66, 46, LEAF, { part: 'crown' }),
    circ(142, 42, 28, LEAF3, { a: 0.75, part: 'crown' }),
    circ(212, 46, 20, LEAF3, { a: 0.6, part: 'crown' }),
    oval(170, 234, 164, 13, STONE2, { part: 'platform' }),
    rect(6, 214, 328, 22, 11, STONE, { rim: RIM, part: 'platform' }),
    oval(170, 214, 164, 12, STONE3, { rim: RIM, part: 'platform' }),
  ] },

  // The Constitution: a thick bound book, plain cover, a gold rule. No emblem, no words: a scene adds a label.
  book: { w: 190, h: 240, shapes: () => [
    shade(190, 240),
    rect(30, 14, 148, 218, 6, PAPER, { rim: RIM, part: 'pages' }),
    line('M172 24V222M166 24V222', STONE, 1.6, { part: 'pages' }),
    rect(12, 8, 152, 224, 10, COVER, { rim: ['label', 's5', 0.2], part: 'cover' }),
    rect(12, 8, 22, 224, 8, COVER2, { part: 'cover' }),
    rect(46, 28, 102, 184, 6, ['gold', 's5', 0.1], { a: 0, rim: ['gold', 'bgSurface', 0.1], rw: 3, part: 'cover' }),
    rect(54, 36, 86, 168, 4, ['gold', 's5', 0.1], { a: 0, rim: ['gold', 'bgSurface', 0.1], rw: 1.5, part: 'cover' }),
  ] },

  // The same book lying open: two ruled pages. A slip or a label is the scene's.
  bookOpen: { w: 300, h: 190, shapes: () => [
    shade(300, 190),
    path('M8 34 C60 18 118 20 150 42 C182 20 240 18 292 34 L292 178 C240 164 182 164 150 186 C118 164 60 164 8 178 Z', COVER, { rim: ['label', 's5', 0.2], part: 'cover' }),
    path('M18 24 C66 10 122 12 150 34 L150 172 C122 152 66 150 18 164 Z', PAPER, { rim: RIM, part: 'left' }),
    path('M282 24 C234 10 178 12 150 34 L150 172 C178 152 234 150 282 164 Z', PAPER, { rim: RIM, part: 'right' }),
    line('M36 46C70 38 110 40 134 54M36 70C70 62 110 64 134 78M36 94C70 86 110 88 134 102M36 118C70 110 110 112 134 126', STONE, 3, { part: 'left' }),
    line('M264 46C230 38 190 40 166 54M264 70C230 62 190 64 166 78M264 94C230 86 190 88 166 102M264 118C230 110 190 112 166 126', STONE, 3, { part: 'right' }),
  ] },

  newspaper: { w: 170, h: 200, shapes: () => [
    shade(170, 200),
    rect(14, 10, 142, 186, 4, PAPER, { rim: RIM, part: 'sheet' }),
    rect(26, 22, 118, 20, 3, INK, { part: 'sheet' }),
    rect(26, 52, 62, 46, 3, STONE, { part: 'photo' }),
    line('M98 56H144M98 68H144M98 80H144M98 92H130', STONE2, 3, { part: 'sheet' }),
    line('M26 112H144M26 124H144M26 136H144M26 148H144M26 160H118M26 172H134', STONE2, 3, { part: 'sheet' }),
  ] },

  phone: { w: 110, h: 200, shapes: () => [
    rect(6, 4, 98, 192, 14, ['label', 'waste', 0.2], { rim: RIM, part: 'body' }),
    rect(13, 16, 84, 166, 6, ['s1', 'bgSurface', 0.82], { part: 'screen' }),
    rect(44, 8, 22, 4, 2, STONE, { part: 'body' }),
  ] },

  mike: { w: 90, h: 200, shapes: () => [
    shade(90, 200),
    rect(16, 186, 58, 10, 5, ['waste', 'label', 0.5], { rim: RIM, part: 'stand' }),
    rect(41, 54, 8, 134, 3, ['waste', 'label', 0.3], { rim: RIM, rw: 1.2, part: 'stand' }),
    rect(29, 6, 32, 56, 15, ['waste', 'label', 0.5], { rim: RIM, part: 'head' }),
    line('M33 20H57M33 30H57M33 40H57', STONE, 2, { part: 'head' }),
  ] },
};

/** Parts by kind, for a scene's dim() or a TapLight's targets. */
export const CIVIC_PARTS = Object.fromEntries(Object.entries(ART).map(([k, a]) => [k, [...new Set(a.shapes().map((s) => s.part).filter((p) => p && p !== 'ground'))]]));

export const civicSize = (kind) => ({ w: ART[kind].w, h: ART[kind].h });

const scaleOf = (a, o) => (o.w ? o.w / a.w : o.h ? o.h / a.h : 1);

function resolve(c, p) {
  if (!p) return null;
  if (typeof p === 'string') return c[p];
  return mix(c[p[0]], c[p[1]], p[2]);
}
function css(p) {
  if (!p) return null;
  if (typeof p === 'string') return `var(${VAR[p]})`;
  const pct = Math.round((1 - p[2]) * 100);
  return `color-mix(in srgb, var(${VAR[p[0]]}) ${pct}%, var(${VAR[p[1]]}))`;
}

function shapesOf(kind) {
  const a = ART[kind];
  if (!a) throw new Error(`CivicArt: no kind ${kind}`);
  a.cache ??= a.shapes();
  return a.cache;
}

/** Canvas. (x, y): ground centre. */
export function drawCivic(ctx, c, kind, x, y, o = {}) {
  const a = ART[kind], k = scaleOf(a, o), list = shapesOf(kind), dim = o.dim;
  if (typeof Path2D === 'undefined' || !Path2D.prototype?.roundRect) return { x: x - (a.w * k) / 2, y: y - a.h * k, w: a.w * k, h: a.h * k };   // a headless harness
  ctx.save();
  if (o.alpha != null) ctx.globalAlpha *= o.alpha;
  ctx.translate(x - (a.w * k) / 2, y - a.h * k);
  ctx.scale(k, k);
  for (const s of list) {
    ctx.save();
    if (s.a != null) ctx.globalAlpha *= s.a;
    if (dim && s.part && dim(s.part)) ctx.globalAlpha *= 0.25;
    const p = shapePath(s);
    if (s.paint) { ctx.fillStyle = resolve(c, s.paint); ctx.fill(p); }
    if (s.rim) { ctx.globalAlpha = dim && s.part && dim(s.part) ? 0.25 : (o.alpha ?? 1); ctx.strokeStyle = resolve(c, s.rim); ctx.lineWidth = s.rw ?? 2.4; ctx.lineJoin = 'round'; ctx.stroke(p); }
    if (s.stroke) { ctx.strokeStyle = resolve(c, s.stroke); ctx.lineWidth = s.lw ?? 3; ctx.lineCap = 'round'; ctx.stroke(p); }
    ctx.restore();
  }
  ctx.restore();
  return { x: x - (a.w * k) / 2, y: y - a.h * k, w: a.w * k, h: a.h * k };
}

function shapePath(s) {
  if (s.t === 'p') return new Path2D(s.d);
  const p = new Path2D();
  if (s.t === 'r') p.roundRect(s.x, s.y, s.w, s.h, s.r ?? 0);
  else if (s.t === 'c') p.arc(s.x, s.y, s.r, 0, Math.PI * 2);
  else p.ellipse(s.x, s.y, s.rx, s.ry, 0, 0, Math.PI * 2);
  return p;
}

function shapeSvg(s) {
  const st = [];
  st.push(`fill:${s.paint ? css(s.paint) : 'none'}`);
  if (s.a != null) st.push(`fill-opacity:${s.a}`);
  if (s.rim) st.push(`stroke:${css(s.rim)};stroke-width:${s.rw ?? 2.4};stroke-linejoin:round`);
  if (s.stroke) st.push(`stroke:${css(s.stroke)};stroke-width:${s.lw ?? 3};stroke-linecap:round`);
  const style = `style="${st.join(';')}"`;
  if (s.t === 'p') return `<path d="${s.d}" ${style}/>`;
  if (s.t === 'r') return `<rect x="${s.x}" y="${s.y}" width="${s.w}" height="${s.h}" rx="${s.r ?? 0}" ${style}/>`;
  if (s.t === 'c') return `<circle cx="${s.x}" cy="${s.y}" r="${s.r}" ${style}/>`;
  return `<ellipse cx="${s.x}" cy="${s.y}" rx="${s.rx}" ry="${s.ry}" ${style}/>`;
}

function inner(kind, dim) {
  let out = '', cur = null, open = false;
  for (const s of shapesOf(kind)) {
    if (s.part !== cur || !open) {
      if (open) out += '</g>';
      cur = s.part;
      const off = dim && cur && dim(cur);
      out += `<g data-part="${cur ?? ''}"${off ? ' opacity="0.25"' : ''}>`;
      open = true;
    }
    out += shapeSvg(s);
  }
  return out + (open ? '</g>' : '');
}

/** SVG stage. (x, y): ground centre. */
export function civicSvg(kind, x, y, o = {}) {
  const a = ART[kind], k = scaleOf(a, o);
  return `<g${o.cls ? ` class="${o.cls}"` : ''} transform="translate(${(x - (a.w * k) / 2).toFixed(1)} ${(y - a.h * k).toFixed(1)}) scale(${k.toFixed(3)})">${inner(kind, o.dim)}</g>`;
}

/** DOM: a self-sized svg. size is the width in px; label makes it role="img". */
export function civicHtml(kind, o = {}) {
  const a = ART[kind], w = o.size ?? a.w, h = Math.round((w * a.h) / a.w);
  const name = o.label ? `role="img" aria-label="${String(o.label).replace(/"/g, '&quot;')}"` : 'aria-hidden="true"';
  return `<svg class="cv-art" viewBox="0 0 ${a.w} ${a.h}" width="${w}" height="${h}" ${name}>${inner(kind, o.dim)}</svg>`;
}

/**
 * A daylight ground for a canvas scene: sky to the horizon, then ground. Same world in both themes:
 * the dark theme's surface makes it dusk. o: { horizon (default 340), ground: 'earth' | 'grass' | 'stone' }.
 */
export function dayStage(ctx, c, o = {}) {
  const H = o.horizon ?? 340, W = 680, B = 520;
  ctx.fillStyle = mix(c.s1, c.bgSurface, 0.66); ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = mix(c.s1, c.bgSurface, 0.8); ctx.fillRect(0, H * 0.55, W, H * 0.45);
  const g = { earth: mix(c.gold, c.bgSurface, 0.5), grass: mix(c.s3, c.bgSurface, 0.55), stone: mix(c.waste, c.bgSurface, 0.66) }[o.ground ?? 'earth'];
  ctx.fillStyle = g; ctx.fillRect(0, H, W, B - H);
  ctx.fillStyle = mix(g, c.label, 0.1); ctx.fillRect(0, H, W, 5);
}

/** A speech bubble: a chip with a tail to (tx, ty). (x, y) is the chip's centre. o as pill. */
export function speech(ctx, c, text, x, y, tx, ty, o = {}) {
  const bg = o.bg ?? c.bgSurface;
  ctx.beginPath(); ctx.moveTo(x - 16, y); ctx.lineTo(tx, ty); ctx.lineTo(x + 16, y); ctx.closePath();
  ctx.fillStyle = bg; ctx.fill(); ctx.lineWidth = 2.4; ctx.strokeStyle = c.stroke; ctx.stroke();
  pill(ctx, c, text, x, y, { size: 26, bg, ink: c.label, ...o });
}

export const CIVIC_CSS = `.cv-art { display: block; max-width: 100%; height: auto; }`;

export { alpha };
