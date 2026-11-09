// SeaDraw - small SVG helpers for the sea-rules scenes (L07, L08, L09): readable text on sea and sky, rimmed
// cards, arrows, overlay buttons, a control row that stays mounted across repaints. General: no scene names,
// no subject facts. Drawn things come from shared/SeaArt.js. No colour literals.
import { esc } from 'simulations/base/SimUi.js';
import * as Sea from '../shared/SeaArt.js';

export const sea = Sea.svgSeaColour;
export const SEA_COLOR_MAP = Sea.SEA_COLOR_MAP;
// Plain consts: the lint cannot read SeaArt's paired export form.
export const svgSeaColumn = Sea.svgSeaColumn, svgWaveLine = Sea.svgWaveLine, svgStrata = Sea.svgStrata, svgSandBed = Sea.svgSandBed,
  svgCloud = Sea.svgCloud, svgSun = Sea.svgSun, svgMoon = Sea.svgMoon, svgPalm = Sea.svgPalm, svgLighthouse = Sea.svgLighthouse, svgHut = Sea.svgHut,
  svgCountryBoat = Sea.svgCountryBoat, svgTrawler = Sea.svgTrawler, svgCargoShip = Sea.svgCargoShip, svgTanker = Sea.svgTanker,
  svgPatrolShip = Sea.svgPatrolShip, svgBuoy = Sea.svgBuoy, svgSatellite = Sea.svgSatellite, svgOilRig = Sea.svgOilRig, svgEarthDisc = Sea.svgEarthDisc,
  svgFish = Sea.svgFish, svgSeagrass = Sea.svgSeagrass, svgCoral = Sea.svgCoral, svgFoam = Sea.svgFoam, svgCliff = Sea.svgCliff,
  svgSkyGradient = Sea.svgSkyGradient, svgAeroplane = Sea.svgAeroplane, svgLand = Sea.svgLand, svgDhow = Sea.svgDhow;

export const SEA_INK = sea('ink');
export const WHITE = sea('cloud');
export const CARD = 'var(--sim-bg-surface)';
export const LABEL = 'var(--sim-label)';
export const MUTED = 'var(--sim-label-muted)';

export const SEA_CSS = `
.sim-dom-root--portrait.svs { padding: var(--sim-space-1) 0; }
.sd-hit { position: absolute; display: block; padding: 0; margin: 0; border: 0; background: transparent; cursor: pointer; touch-action: manipulation;
  pointer-events: auto; border-radius: var(--sim-radius-md); -webkit-tap-highlight-color: transparent; color: inherit; font: inherit; }
.sd-hit:focus-visible { outline: 3px solid var(--sim-accent); outline-offset: 2px; }
.sd-row { display: flex; flex-wrap: wrap; justify-content: center; align-items: center; gap: var(--sim-space-2); padding: var(--sim-space-2) 0 var(--sim-space-1); }
.sd-row:empty { display: none; }
.sd-btn { min-height: 48px; min-width: 50px; padding: 6px 14px; cursor: pointer; touch-action: manipulation; font: 800 var(--sim-text-md)/1.15 var(--sim-font); color: var(--sim-label);
  background: var(--sim-bg-surface); border: calc(2px * var(--look-rim)) solid var(--sim-stroke); border-radius: var(--look-pill);
  box-shadow: 0 calc(3px * var(--look-lip)) 0 color-mix(in oklab, var(--sim-stroke) 62%, var(--sim-bg-deep)); }
.sd-btn:active { transform: translateY(calc(2px * var(--look-lip))); }
.sd-btn:focus-visible { outline: 3px solid var(--sim-accent); outline-offset: 2px; }
.sd-btn[aria-pressed="true"] { background: color-mix(in oklab, var(--sim-accent) 34%, var(--sim-bg-surface)); box-shadow: inset 0 0 0 2px var(--sim-accent); }
.sd-btn[disabled] { opacity: 0.55; cursor: default; }
.sd-btn--main { color: var(--sim-bg-deep); background: var(--sim-accent); border-color: var(--sim-accent); box-shadow: 0 calc(3px * var(--look-lip)) 0 color-mix(in oklab, var(--sim-accent) 62%, var(--sim-label)); }
.sd-range { display: flex; align-items: center; gap: var(--sim-space-2); box-sizing: border-box; width: 100%; padding: 0 var(--sim-space-2); font: 800 var(--sim-text-md)/1.2 var(--sim-font); color: var(--sim-label); }
.sd-range label { flex: none; }
.sd-range output { flex: none; min-width: 72px; text-align: right; font-family: var(--sim-font-display, var(--sim-font)); font-size: 20px; }
.sd-range input { flex: 1 1 auto; min-width: 0; height: 48px; margin: 0; accent-color: var(--sim-accent); touch-action: pan-y; }
svg .sd-in { transform-box: fill-box; transform-origin: center; animation: sd-in 0.45s var(--look-spring-soft, ease-out) both; animation-delay: var(--d, 0s); }
@keyframes sd-in { from { transform: scale(0.75); opacity: 0; } to { transform: none; opacity: 1; } }
@media (prefers-reduced-motion: reduce) { svg .sd-in { animation: none; } }
`;

const n1 = (v) => Math.round(v * 10) / 10;
export const num = n1;
export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

/** A text element. o: size, anchor, col, weight, display (Fredoka), halo (a colour behind the letters), op, raw. */
export function tx(x, y, s, o = {}) {
  const st = [`fill:${o.col ?? LABEL}`, `font-size:${o.size ?? 16}px`, `font-weight:${o.weight ?? 800}`];
  if (o.display) st.push('font-family:var(--sim-font-display, var(--sim-font))');
  if (o.halo) st.push(`stroke:${o.halo}`, `stroke-width:${o.haloW ?? 4}px`, 'paint-order:stroke', 'stroke-linejoin:round');
  if (o.op != null) st.push(`opacity:${o.op}`);
  return `<text x="${n1(x)}" y="${n1(y)}" text-anchor="${o.anchor ?? 'middle'}" style="${st.join(';')}">${o.raw ? s : esc(s)}</text>`;
}
/** Dark ink with a white halo, for words on sea or sky in either theme. */
export const seaTx = (x, y, s, o = {}) => tx(x, y, s, { col: SEA_INK, halo: WHITE, ...o });
/** White ink with a dark halo, for words on deep water. */
export const deepTx = (x, y, s, o = {}) => tx(x, y, s, { col: WHITE, halo: SEA_INK, ...o });

/** A rimmed panel. o: col, rim, r, lift, op */
export function panel(x, y, w, h, o = {}) {
  const r = o.r ?? 14, rim = o.rim ?? 'var(--sim-stroke)', lift = o.lift ?? 3;
  return `<g${o.op != null ? ` style="opacity:${o.op}"` : ''}><rect x="${n1(x)}" y="${n1(y + lift)}" width="${n1(w)}" height="${n1(h)}" rx="${r}" style="fill:${rim}"/>`
    + `<rect x="${n1(x)}" y="${n1(y)}" width="${n1(w)}" height="${n1(h)}" rx="${r}" style="fill:${o.col ?? CARD};stroke:${rim};stroke-width:2.5"/></g>`;
}
/** The stage as a nested svg: it clips drawn things that reach past the frame (waves, fronds, light shafts). */
export const frame = (st, inner) => `<svg x="0" y="0" width="${st.W}" height="${st.H}" overflow="hidden">${inner}</svg>`;
/** A pill tag: text on a filled pill, in stage px, centred on (x, y). o: col (fill), ink, size, op, h, anchor */
export function tag(x, y, s, o = {}) {
  const size = o.size ?? 16, w = Math.round(s.length * size * 0.54) + 18, h = o.h ?? Math.round(size * 1.65);
  const x0 = o.anchor === 'start' ? x : o.anchor === 'end' ? x - w : x - w / 2;
  return `<g${o.op != null ? ` style="opacity:${o.op}"` : ''}><rect x="${n1(x0)}" y="${n1(y - h / 2)}" width="${w}" height="${h}" rx="${n1(h / 2)}" style="fill:${o.col ?? WHITE};stroke:${o.rim ?? SEA_INK};stroke-width:2"/>`
    + tx(x0 + w / 2, y + size * 0.36, s, { size, col: o.ink ?? SEA_INK }) + '</g>';
}
/** Lines of words that fit width w at font size, from character count. */
export function wrap(s, w, size = 16) {
  const max = Math.max(8, Math.floor(w / (size * 0.53))), out = [];
  let cur = '';
  for (const word of s.split(' ')) { if ((cur + ' ' + word).trim().length > max && cur) { out.push(cur); cur = word; } else cur = (cur + ' ' + word).trim(); }
  if (cur) out.push(cur);
  return out;
}
/** A sky rectangle by height in km. id must be unique in the stage. */
export function skyRect(id, x, y, w, h, km0 = 0, km1 = 8, o = {}) {
  return `<defs>${svgSkyGradient(id, km0, km1)}</defs><rect x="${n1(x)}" y="${n1(y)}" width="${n1(w)}" height="${n1(h)}" rx="${o.r ?? 0}" style="fill:url(#${id})"/>`;
}
/** A straight arrow, one or both heads, in ink with a halo. o: col, w, both, halo */
export function arrow(x0, y0, x1, y1, o = {}) {
  const w = o.w ?? 3.5, col = o.col ?? SEA_INK, a = Math.atan2(y1 - y0, x1 - x0), h = o.head ?? 11;
  const head = (x, y, an) => `M${n1(x)} ${n1(y)}L${n1(x - Math.cos(an - 0.45) * h)} ${n1(y - Math.sin(an - 0.45) * h)}L${n1(x - Math.cos(an + 0.45) * h)} ${n1(y - Math.sin(an + 0.45) * h)}Z`;
  const tips = head(x1, y1, a) + (o.both ? head(x0, y0, a + Math.PI) : '');
  const halo = o.halo === false ? '' : `<path d="M${n1(x0)} ${n1(y0)}L${n1(x1)} ${n1(y1)}" style="fill:none;stroke:${o.haloCol ?? WHITE};stroke-width:${w + 4};stroke-linecap:round"/><path d="${tips}" style="fill:${o.haloCol ?? WHITE};stroke:${o.haloCol ?? WHITE};stroke-width:4;stroke-linejoin:round"/>`;
  return `<g${o.op != null ? ` style="opacity:${o.op}"` : ''}>${halo}<path d="M${n1(x0)} ${n1(y0)}L${n1(x1)} ${n1(y1)}" style="fill:none;stroke:${col};stroke-width:${w};stroke-linecap:round${o.dash ? `;stroke-dasharray:${o.dash}` : ''}"/><path d="${tips}" style="fill:${col}"/></g>`;
}
/** A flag on a mast from (x, y) at the foot. o: h, w, col, col2 (a second band), flip */
export function flag(x, y, o = {}) {
  const h = o.h ?? 90, w = o.w ?? 62, f = o.flip ? -1 : 1, top = y - h, col = o.col ?? 'var(--sim-series-1)', col2 = o.col2 ?? WHITE;
  return `<g><rect x="${n1(x - 2.5)}" y="${n1(top)}" width="5" height="${h}" rx="2" style="fill:${SEA_INK}"/>`
    + `<path d="M${n1(x)} ${n1(top + 3)}q${n1(f * w * 0.5)} -9 ${n1(f * w)} 0v${n1(w * 0.62)}q${n1(-f * w * 0.5)} 9 ${n1(-f * w)} 0Z" style="fill:${col};stroke:${SEA_INK};stroke-width:2.5;stroke-linejoin:round"/>`
    + `<path d="M${n1(x)} ${n1(top + 3 + w * 0.2)}q${n1(f * w * 0.5)} -9 ${n1(f * w)} 0v${n1(w * 0.22)}q${n1(-f * w * 0.5)} 9 ${n1(-f * w)} 0Z" style="fill:${col2}"/></g>`;
}
/** A see-through tap target on the overlay, over something drawn. */
export const hit = (x, y, w, h, act, label, o = {}) => `<button type="button" class="sd-hit" data-act="${esc(act)}" aria-label="${esc(label)}"${o.pressed != null ? ` aria-pressed="${o.pressed}"` : ''} style="left:${n1(x)}px;top:${n1(y)}px;width:${n1(w)}px;height:${n1(h)}px"></button>`;

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
/** A row of real buttons under the figure, written by the scene: mount once, then row.innerHTML = ... */
export function controlRow(scene) {
  const e = document.createElement('div');
  e.className = 'sd-row';
  scene.root.appendChild(e);
  return e;
}
/** Button markup for a control row. o: main, pressed, disabled */
export const rowBtn = (label, act, o = {}) => `<button type="button" class="sd-btn${o.main ? ' sd-btn--main' : ''}" data-act="${esc(act)}"${o.pressed != null ? ` aria-pressed="${o.pressed}"` : ''}${o.disabled ? ' disabled' : ''}>${esc(label)}</button>`;

/**
 * A slider that stays mounted while the figure repaints.
 * rangeControl(scene, { id, label, min, max, step, value, show(v), onInput(v) }) -> { el, value, set(v), hide(b), destroy() }
 */
export function rangeControl(scene, o) {
  const el = document.createElement('div');
  el.className = 'sd-range';
  const id = `sd-r-${o.id ?? 'range'}`;
  const lab = document.createElement('label'), inp = document.createElement('input'), out = document.createElement('output');
  lab.setAttribute('for', id); lab.textContent = o.label;
  inp.id = id; inp.type = 'range'; inp.min = String(o.min); inp.max = String(o.max); inp.step = String(o.step ?? 1); inp.value = String(o.value);
  el.appendChild(lab); el.appendChild(inp); el.appendChild(out);
  scene.root.appendChild(el);
  const show = () => { out.textContent = o.show ? o.show(+inp.value) : String(inp.value); };
  const on = () => { show(); o.onInput?.(+inp.value); };
  inp.addEventListener('input', on);
  show();
  return { el, get value() { return +inp.value; }, set(v) { inp.value = String(v); show(); }, hide(b) { el.hidden = b; el.style.display = b ? 'none' : ''; }, destroy() { inp.removeEventListener('input', on); } };
}
