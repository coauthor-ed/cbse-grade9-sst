// AirDraw - small SVG helpers shared by batch B's air scenes (L03, L04, L05): readable text on a sky,
// rimmed reading cards, fat wind arrows, flowing streaks and tap targets on the overlay. No colour
// literals. Nothing here is a scene.
import { esc } from 'simulations/base/SimUi.js';
import { SimGeo } from 'simulations/base/SimGeo.js';
import * as Sky from '../shared/SkyArt.js';

export const sky = Sky.svgSkyColour;
const svgSkyGradient = Sky.svgSkyGradient;
// The drawn things, re-exported as plain consts (the lint cannot read SkyArt's paired export form).
export const svgCloud = Sky.svgCloud, svgSun = Sky.svgSun, svgRain = Sky.svgRain, svgLand = Sky.svgLand, svgHills = Sky.svgHills,
  svgSea = Sky.svgSea, svgThermometer = Sky.svgThermometer, svgBarometer = Sky.svgBarometer, svgRainGauge = Sky.svgRainGauge,
  svgWindVane = Sky.svgWindVane, svgAeroplane = Sky.svgAeroplane, svgDhow = Sky.svgDhow;
export const drawCloud = Sky.drawCloud, drawLand = Sky.drawLand, drawHills = Sky.drawHills, SKY_COLOR_MAP = Sky.SKY_COLOR_MAP,
  drawSkyColumn = Sky.drawSkyColumn, skyColour = Sky.skyColour;
export const SKY_INK = sky('ink');
export const CARD = 'var(--sim-bg-surface)';
export const LABEL = 'var(--sim-label)';
export const MUTED = 'var(--sim-label-muted)';

export const AIR_CSS = `
.sim-dom-root--portrait.svs { padding: var(--sim-space-1) 0; }
.air-hit { position: absolute; display: block; padding: 0; margin: 0; border: 0; background: transparent; cursor: pointer; touch-action: manipulation;
  pointer-events: auto; border-radius: var(--sim-radius-md); -webkit-tap-highlight-color: transparent; color: inherit; font: inherit; }
.air-hit:focus-visible { outline: 3px solid var(--sim-accent); outline-offset: 2px; }
.air-btn { position: absolute; transform: translate(-50%, -50%); min-height: 54px; padding: 6px 16px; pointer-events: auto; cursor: pointer; touch-action: manipulation;
  font: 800 var(--sim-text-md)/1.15 var(--sim-font); color: var(--sim-bg-deep); background: var(--sim-accent); border: 0; border-radius: var(--look-pill);
  box-shadow: 0 calc(3px * var(--look-lip)) 0 color-mix(in oklab, var(--sim-accent) 62%, var(--sim-label)); white-space: nowrap; }
.air-btn:active { transform: translate(-50%, calc(-50% + 2px)); }
.air-btn:focus-visible { outline: 3px solid var(--sim-accent); outline-offset: 2px; }
.air-btn[disabled] { opacity: 0.55; cursor: default; }
svg .air-flow { stroke-dasharray: 18 26; animation: air-flow 1.5s linear 7; }
svg .air-flow--rev { animation-direction: reverse; }
@keyframes air-flow { to { stroke-dashoffset: -44; } }
svg .air-in { transform-box: fill-box; transform-origin: center; animation: air-in 0.5s var(--look-spring-soft, ease-out) both; animation-delay: var(--d, 0s); }
@keyframes air-in { from { transform: scale(0.7); opacity: 0; } to { transform: none; opacity: 1; } }
@media (prefers-reduced-motion: reduce) { svg .air-flow, svg .air-in { animation: none; } }
`;

const n1 = (v) => Math.round(v * 10) / 10;
export const num = n1;

/** A text element. o: size, anchor, col, weight, display (Fredoka), halo (a colour drawn behind the letters), raw (skip escaping). */
export function tx(x, y, s, o = {}) {
  const st = [`fill:${o.col ?? LABEL}`, `font-size:${o.size ?? 15}px`, `font-weight:${o.weight ?? 800}`];
  if (o.display) st.push('font-family:var(--sim-font-display, var(--sim-font))');
  if (o.halo) st.push(`stroke:${o.halo}`, `stroke-width:${o.haloW ?? 4}px`, 'paint-order:stroke', 'stroke-linejoin:round');
  if (o.op != null) st.push(`opacity:${o.op}`);
  return `<text x="${n1(x)}" y="${n1(y)}" text-anchor="${o.anchor ?? 'middle'}" style="${st.join(';')}">${o.raw ? s : esc(s)}</text>`;
}
/** Dark ink with a white halo, for words on the sky in either theme. */
export const skyTx = (x, y, s, o = {}) => tx(x, y, s, { col: SKY_INK, halo: sky('cloud'), ...o });

/** A rimmed panel. o: col, rim, r, lift, op */
export function panel(x, y, w, h, o = {}) {
  const r = o.r ?? 14, rim = o.rim ?? 'var(--sim-stroke)', lift = o.lift ?? 3;
  return `<g${o.op != null ? ` opacity="${o.op}"` : ''}><rect x="${n1(x)}" y="${n1(y + lift)}" width="${n1(w)}" height="${n1(h)}" rx="${r}" style="fill:${rim}"/>`
    + `<rect x="${n1(x)}" y="${n1(y)}" width="${n1(w)}" height="${n1(h)}" rx="${r}" style="fill:${o.col ?? CARD};stroke:${rim};stroke-width:2.5"/></g>`;
}
/** A reading card: a label above a big value. o: w, h, size, tone (colour of the value), col */
export function reading(x, y, label, value, o = {}) {
  const w = o.w ?? 130, h = o.h ?? 66;
  return panel(x, y, w, h, o) + tx(x + w / 2, y + 22, label, { size: 14, col: MUTED, weight: 700 })
    + tx(x + w / 2, y + h - 13, value, { size: o.size ?? 28, display: true, weight: 700, col: o.tone ?? LABEL });
}

/** The sky rectangle by height. id must be unique in the scene's own stage. */
export function skyRect(id, x, y, w, h, km0 = 0, km1 = 12, o = {}) {
  return `<defs>${svgSkyGradient(id, km0, km1)}</defs><rect x="${n1(x)}" y="${n1(y)}" width="${n1(w)}" height="${n1(h)}" rx="${o.r ?? 0}" style="fill:url(#${id})"/>`;
}

/** The Sun cut off by the left edge of the stage: disc of radius r centred dx left of x = 0, with a glow. */
export function sunEdge(cy, r, dx = 50) {
  const seg = (R, st) => { const h = Math.sqrt(Math.max(0, R * R - dx * dx)); return `<path d="M0 ${n1(cy - h)}A${R} ${R} 0 0 1 0 ${n1(cy + h)}Z" style="${st}"/>`; };
  return `<g>${seg(r * 1.34, `fill:${sky('sun')};opacity:0.4`)}${seg(r, `fill:${sky('sunCore')};stroke:${sky('sun')};stroke-width:6`)}</g>`;
}

/** A fat wind arrow along points (a smooth path through them when o.curve). o: w, col, rim, flow (add moving streaks), head */
export function windArrow(pts, o = {}) {
  const w = o.w ?? 12, col = o.col ?? sky('cloud'), rim = o.rim ?? SKY_INK;
  const a = pts[pts.length - 2], b = pts[pts.length - 1];
  const ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
  const head = o.head ?? w * 1.9;
  const bx = b[0] - Math.cos(ang) * head, by = b[1] - Math.sin(ang) * head;
  const body = [...pts.slice(0, -1), [bx, by]];
  const d = pathThrough(body, o.curve);
  const hw = w * 1.15;
  const tip = `M${n1(b[0])} ${n1(b[1])}L${n1(bx - Math.sin(ang) * hw)} ${n1(by + Math.cos(ang) * hw)}L${n1(bx + Math.sin(ang) * hw)} ${n1(by - Math.cos(ang) * hw)}Z`;
  const stk = (c, sw, extra = '') => `style="fill:none;stroke:${c};stroke-width:${sw};stroke-linecap:round;stroke-linejoin:round${extra}"`;
  return `<g${o.op != null ? ` opacity="${o.op}"` : ''}><path d="${d}" ${stk(rim, w + 5)}/><path d="${tip}" style="fill:${rim};stroke:${rim};stroke-width:5;stroke-linejoin:round"/>`
    + `<path d="${d}" ${stk(col, w)}/><path d="${tip}" style="fill:${col}"/>`
    + (o.flow ? `<path class="air-flow" d="${d}" ${stk(rim, 3, ';opacity:0.55')}/>` : '') + '</g>';
}
export function pathThrough(pts, curve) {
  if (!curve || pts.length < 3) return pts.map((p, i) => `${i ? 'L' : 'M'}${n1(p[0])} ${n1(p[1])}`).join('');
  let d = `M${n1(pts[0][0])} ${n1(pts[0][1])}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] ?? p2;
    d += `C${n1(p1[0] + (p2[0] - p0[0]) / 6)} ${n1(p1[1] + (p2[1] - p0[1]) / 6)} ${n1(p2[0] - (p3[0] - p1[0]) / 6)} ${n1(p2[1] - (p3[1] - p1[1]) / 6)} ${n1(p2[0])} ${n1(p2[1])}`;
  }
  return d;
}

/** A see-through tap target on the overlay, over something drawn. */
export const hit = (x, y, w, h, act, label, o = {}) => `<button type="button" class="air-hit" data-act="${esc(act)}" aria-label="${esc(label)}"${o.pressed != null ? ` aria-pressed="${o.pressed}"` : ''} style="left:${n1(x)}px;top:${n1(y)}px;width:${n1(w)}px;height:${n1(h)}px"></button>`;
/** A real button on the overlay, centred on (x, y). */
export const btn = (x, y, label, act, o = {}) => `<button type="button" class="air-btn" data-act="${esc(act)}"${o.disabled ? ' disabled' : ''} style="left:${n1(x)}px;top:${n1(y)}px">${esc(label)}</button>`;

/** One delegated listener for [data-act] on a scene's root. fn(act). Repaints, then gives focus back. */
export function bindActs(scene, fn) {
  const root = scene.root;
  const onClick = (e) => {
    const b = e.target.closest?.('[data-act]');
    if (!b || !root.contains(b) || b.disabled) return;
    const act = b.dataset.act;
    fn(act);
    scene.repaint();
    const again = [...root.querySelectorAll('[data-act]')].find((x) => x.dataset.act === act);
    again?.focus?.({ preventScroll: true });
  };
  root.addEventListener('click', onClick);
  return () => root.removeEventListener('click', onClick);
}

// -- globes and maps ---------------------------------------------------------------------
// World land outline for sea and land only; India's border only from the Survey of India layer.

export const CREDIT = 'Boundary of India: Survey of India';
/** The credit on a small plate at the foot of a stage of W by H: readable on sea and on land. size is design px:
 *  17.5 is 12 px on screen at the smallest scale any host gives a scene. */
export function creditPlate(W, H, o = {}) {
  const size = o.size ?? 17.5, w = Math.round(CREDIT.length * size * 0.5) + 16, h = Math.round(size * 1.5), x = (o.x ?? W - 6) - w, y = H - h - (o.foot ?? 6);
  return `<g><rect x="${n1(x)}" y="${n1(y)}" width="${w}" height="${h}" rx="8" style="fill:${sky('cloud')};opacity:0.92"/>`
    + `<text x="${n1(x + w / 2)}" y="${n1(y + h * 0.72)}" text-anchor="middle" style="font:700 ${size}px var(--sim-font);fill:${sky('ink')}">${CREDIT}</text></g>`;
}

/** Load d3 and the two layers once. Resolves to null when the data cannot load (the scene draws a plain disc). */
export async function loadGeo() {
  try {
    const [d3, land, india] = await Promise.all([SimGeo.d3(), SimGeo.loadWorld('land'), SimGeo.loadLayer('india')]);
    return { d3, land, india };
  } catch (_) { return null; }
}
/** Orthographic land and India paths for a disc at (cx, cy) radius R. rotate = d3 rotate. */
export function globePaths(g, cx, cy, R, rotate = [-78, 0, 0]) {
  if (!g) return null;
  const proj = g.d3.geoOrthographic().rotate(rotate).translate([cx, cy]).scale(R).clipAngle(90);
  const path = g.d3.geoPath(proj);
  return { land: path(g.land), india: path(g.india), proj };
}
/** The Earth as a drawn ball. o: rotate, shade (true: a soft night edge), id for gradient */
export function globe(g, cx, cy, R, o = {}) {
  const p = globePaths(g, cx, cy, R, o.rotate);
  let s = `<circle cx="${cx}" cy="${cy}" r="${R}" style="fill:${sky('sea')};stroke:${SKY_INK};stroke-width:3"/>`;
  if (p) {
    s += `<path d="${p.land}" style="fill:${sky('grass')};stroke:${sky('grassDark')};stroke-width:1"/>`;
    if (o.india !== false) s += `<path d="${p.india}" style="fill:${sky('grassLit')};stroke:${SKY_INK};stroke-width:1.5"/>`;
  }
  return { svg: s, proj: p?.proj ?? null };
}
/** A flat map of India and the seas in a box: Mercator fitted to extent [[lon0, lat0], [lon1, lat1]]. */
export function indiaMap(g, box, extent = [[60, 4], [100, 38]]) {
  if (!g) return null;
  const [[a, b], [c, d]] = extent;
  const proj = g.d3.geoMercator().fitExtent([[box.x, box.y], [box.x + box.w, box.y + box.h]], { type: 'MultiPoint', coordinates: [[a, b], [c, d], [a, d], [c, b]] });
  const path = g.d3.geoPath(proj);
  const at = (ll) => proj(ll);
  return { proj, at, landD: path(g.land), indiaD: path(g.india) };
}
