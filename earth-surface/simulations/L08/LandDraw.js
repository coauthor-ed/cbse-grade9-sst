// LandDraw - small SVG helpers for the L08, L09 and L10 scenes: a daylight world in a rounded window,
// readable words on it, tags, flat lipped buttons under the figure, wind arrows, scattered grains.
// Colours only from tokens through EarthArt and SkyArt. Nothing here is a scene.
import { esc } from 'simulations/base/SimUi.js';
import * as Earth from '../shared/EarthArt.js';
import * as Sky from '../shared/SkyArt.js';

export const art = Earth.svgEarthColour;
export const svgRock = Earth.svgRock, svgWater = Earth.svgWater, svgIce = Earth.svgIce, svgSnow = Earth.svgSnow, svgSand = Earth.svgSand,
  svgSoil = Earth.svgSoil, svgBoulder = Earth.svgBoulder, svgTree = Earth.svgTree, svgGrass = Earth.svgGrass, svgEarthSky = Earth.svgEarthSky,
  roughen = Earth.roughen, smooth = Earth.smooth;
export const svgCloud = Sky.svgCloud, svgSun = Sky.svgSun, svgRain = Sky.svgRain, svgHills = Sky.svgHills;
export const INK = art('ink');
export const SNOW = art('snow');
export const n1 = (v) => Math.round(v * 10) / 10;

export const LAND_CSS = `
.sim-dom-root--portrait.svs { padding: var(--sim-space-1) 0; }
.ld-bar { position: absolute; left: 0; right: 0; display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; align-items: center; pointer-events: none; }
.ld-btn { pointer-events: auto; min-height: 48px; min-width: 48px; padding: 6px 15px; cursor: pointer; touch-action: manipulation; -webkit-tap-highlight-color: transparent;
  font: 800 var(--sim-text-md)/1.15 var(--sim-font); color: var(--sim-label); background: var(--sim-bg-surface);
  border: calc(2px * var(--look-rim)) solid var(--sim-stroke); border-radius: var(--look-pill);
  box-shadow: 0 calc(3px * var(--look-lip)) 0 var(--sim-stroke); transition: transform 80ms; }
.ld-btn[data-on="1"] { background: var(--sim-accent); color: var(--sim-bg-deep); border-color: var(--sim-accent);
  box-shadow: 0 calc(3px * var(--look-lip)) 0 color-mix(in oklab, var(--sim-accent) 62%, var(--sim-label)); }
.ld-btn:active { transform: translateY(2px); }
.ld-btn:focus-visible { outline: 3px solid var(--sim-accent); outline-offset: 2px; }
.ld-btn[disabled] { opacity: 0.55; cursor: default; }
/* The host shows a landscape scene at about 0.72: tags grow so labels stay readable; portrait is 1:1. */
.svs:not(.sim-dom-root--portrait) svg .ld-tag { transform-box: fill-box; transform-origin: center; transform: scale(1.28); }
svg .ld-in { transform-box: fill-box; transform-origin: center; animation: ld-in 0.45s var(--look-spring-soft, ease-out) both; animation-delay: var(--d, 0s); }
@keyframes ld-in { from { transform: scale(0.72); opacity: 0; } to { transform: none; opacity: 1; } }
@media (prefers-reduced-motion: reduce) { svg .ld-in { animation: none; } }
`;

/** A text element. o: size, anchor, col, weight, display, halo, op */
export function tx(x, y, s, o = {}) {
  const st = [`fill:${o.col ?? INK}`, `font-size:${o.size ?? 15}px`, `font-weight:${o.weight ?? 800}`];
  if (o.display) st.push('font-family:var(--sim-font-display, var(--sim-font))');
  if (o.halo !== false) st.push(`stroke:${o.halo ?? SNOW}`, `stroke-width:${o.haloW ?? 4}px`, 'paint-order:stroke', 'stroke-linejoin:round');
  if (o.op != null) st.push(`opacity:${o.op}`);
  return `<text x="${n1(x)}" y="${n1(y)}" text-anchor="${o.anchor ?? 'middle'}" style="${st.join(';')}">${esc(s)}</text>`;
}

/** A label plate on the figure: rimmed, opaque, centred on (x, y). o: size, col (fill), ink, rim, op */
export function tag(x, y, s, o = {}) {
  const size = o.size ?? 15, w = Math.round(s.length * size * 0.56) + 18, h = Math.round(size * 1.75);
  const rim = o.rim ?? INK;
  return `<g class="ld-tag"${o.op != null ? ` opacity="${o.op}"` : ''}><rect x="${n1(x - w / 2)}" y="${n1(y - h / 2)}" width="${w}" height="${h}" rx="${h / 2}" style="fill:${o.col ?? SNOW};stroke:${rim};stroke-width:2"/>`
    + `<text x="${n1(x)}" y="${n1(y + size * 0.35)}" text-anchor="middle" style="fill:${o.ink ?? INK};font-size:${size}px;font-weight:800">${esc(s)}</text></g>`;
}
/** A thin leader from a tag to the thing it names. */
export const lead = (x1, y1, x2, y2, o = {}) => `<path d="M${n1(x1)} ${n1(y1)}L${n1(x2)} ${n1(y2)}" style="fill:none;stroke:${o.col ?? INK};stroke-width:${o.w ?? 2.5};stroke-linecap:round;${o.op != null ? `opacity:${o.op}` : ''}"/>`;

/** The world window: a clipped, rimmed rounded stage of W by h, sky above. kids is the markup inside. */
export function world(id, W, h, kids, o = {}) {
  const r = o.r ?? 18;
  return `<defs><clipPath id="${id}c"><rect x="0" y="0" width="${W}" height="${h}" rx="${r}"/></clipPath>${svgEarthSky(id + 's')}</defs>`
    + `<g clip-path="url(#${id}c)"><rect x="0" y="0" width="${W}" height="${h}" style="fill:${o.sky ?? `url(#${id}s)`}"/>${kids}</g>`
    + `<rect x="1.5" y="1.5" width="${W - 3}" height="${h - 3}" rx="${r}" style="fill:none;stroke:var(--sim-stroke);stroke-width:3"/>`;
}

/** Overlay button row at stage y. items: [{ label, act, on, disabled }] */
export function bar(y, items) {
  return `<div class="ld-bar" style="top:${n1(y)}px">${items.map((b) => `<button type="button" class="ld-btn" data-act="${esc(b.act)}" data-on="${b.on ? 1 : 0}" aria-pressed="${b.on ? 'true' : 'false'}"${b.disabled ? ' disabled' : ''}>${esc(b.label)}</button>`).join('')}</div>`;
}

/** One delegated listener for [data-act] on a scene's root. fn(act). Repaints, then gives focus back. */
export function bindActs(scene, fn) {
  const root = scene.root;
  const onClick = (e) => {
    const b = e.target.closest?.('[data-act]');
    if (!b || !root.contains(b) || b.disabled) return;
    const act = b.dataset.act;
    fn(act);
    scene.repaint();
    [...root.querySelectorAll('[data-act]')].find((x) => x.dataset.act === act)?.focus?.({ preventScroll: true });
  };
  root.addEventListener('click', onClick);
  return () => root.removeEventListener('click', onClick);
}

/** A fat flat arrow from (x0, y0) to (x1, y1). o: w, col, rim, op */
export function arrow(x0, y0, x1, y1, o = {}) {
  const w = o.w ?? 10, col = o.col ?? SNOW, rim = o.rim ?? INK, a = Math.atan2(y1 - y0, x1 - x0), hd = w * 1.9, hw = w * 1.2;
  const bx = x1 - Math.cos(a) * hd, by = y1 - Math.sin(a) * hd;
  const tip = `M${n1(x1)} ${n1(y1)}L${n1(bx - Math.sin(a) * hw)} ${n1(by + Math.cos(a) * hw)}L${n1(bx + Math.sin(a) * hw)} ${n1(by - Math.cos(a) * hw)}Z`;
  const ln = (c, sw) => `<path d="M${n1(x0)} ${n1(y0)}L${n1(bx)} ${n1(by)}" style="fill:none;stroke:${c};stroke-width:${sw};stroke-linecap:round"/>`;
  return `<g${o.op != null ? ` opacity="${o.op}"` : ''}>${ln(rim, w + 5)}<path d="${tip}" style="fill:${rim};stroke:${rim};stroke-width:5;stroke-linejoin:round"/>${ln(col, w)}<path d="${tip}" style="fill:${col}"/></g>`;
}

/** A small seeded random stream, same in = same out. */
export function seeded(seed) {
  let a = (seed * 2654435761) >>> 0;
  return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
/** n dots in a box. o: seed, r, r2, col, op */
export function grains(x, y, w, h, n, o = {}) {
  const r = seeded(o.seed ?? 3); let d = '';
  for (let i = 0; i < n; i++) { const q = (o.r ?? 2) + r() * ((o.r2 ?? o.r ?? 2) - (o.r ?? 2)), px = x + r() * w, py = y + r() * h; d += `M${n1(px - q)} ${n1(py)}a${n1(q)} ${n1(q)} 0 1 0 ${n1(q * 2)} 0a${n1(q)} ${n1(q)} 0 1 0 ${n1(-q * 2)} 0`; }
  return `<path d="${d}" style="fill:${o.col ?? art('sandDark')};${o.op != null ? `opacity:${o.op}` : ''}"/>`;
}
/** A closed area under a wavy top line from x0 to x1, down to yBase. fn(x) gives the top. */
export function under(fn, x0, x1, yBase, step = 12) {
  const p = [];
  for (let x = x0; x <= x1 + 0.1; x += step) p.push([x, fn(x)]);
  return [...p, [x1, yBase], [x0, yBase]];
}
/** Open a path string through points as straight joins. */
export const polyD = (pts, close) => pts.map((p, i) => `${i ? 'L' : 'M'}${n1(p[0])} ${n1(p[1])}`).join('') + (close ? 'Z' : '');

/** Run fn(u) with u from 0 to 1 over seconds, about 14 repaints a second, then done(). A step change must call stopTween. */
export function tween(scene, seconds, fn, done) {
  stopTween(scene);
  const calm = globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  if (calm || typeof requestAnimationFrame !== 'function') { fn(1); done?.(); return; }
  const t0 = performance.now(), T = { raf: 0, last: 0 };
  scene._landTween = T;
  const tick = (now) => {
    if (scene._landTween !== T || !scene.sv) return;
    const u = Math.min(1, (now - t0) / (seconds * 1000));
    if (u >= 1 || now - T.last > 70) { T.last = now; fn(u); scene.repaint(); }
    if (u >= 1) { scene._landTween = null; done?.(); scene.repaint(); scene.requestUiUpdate?.(); return; }
    T.raf = requestAnimationFrame(tick);
  };
  T.raf = requestAnimationFrame(tick);
}
export function stopTween(scene) { if (scene._landTween) { cancelAnimationFrame(scene._landTween.raf); scene._landTween = null; } }
export const tweening = (scene) => !!scene._landTween;
export const ease = (u) => (u < 0.5 ? 2 * u * u : 1 - ((-2 * u + 2) ** 2) / 2);
/** A rimmed panel. o: col, rim, r, lift */
export function panel(x, y, w, h, o = {}) {
  const r = o.r ?? 14, rim = o.rim ?? 'var(--sim-stroke)', lift = o.lift ?? 3;
  return `<rect x="${n1(x)}" y="${n1(y + lift)}" width="${n1(w)}" height="${n1(h)}" rx="${r}" style="fill:${rim}"/><rect x="${n1(x)}" y="${n1(y)}" width="${n1(w)}" height="${n1(h)}" rx="${r}" style="fill:${o.col ?? 'var(--sim-bg-surface)'};stroke:${rim};stroke-width:2.5"/>`;
}
