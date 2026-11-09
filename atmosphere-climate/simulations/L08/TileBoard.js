// TileBoard - a grid of icon tiles for plain list slides in L08. Helper, not a scene.
//   tilesHtml(items, { cols }) items: { icon, tone, text }   TILE_CSS
import { iconSvg } from 'simulations/base/kit/SimIcons.js';
import { esc } from 'simulations/base/SimUi.js';

export const TILE_CSS = `
.tb-wrap { display: flex; flex-direction: column; gap: var(--sim-space-3); width: 100%; }
.tb-title { font: 600 var(--sim-text-xl)/1.15 var(--sim-font-display, var(--sim-font)); color: var(--sim-label); text-align: center; margin: 0; }
.tb-grid { display: grid; grid-template-columns: repeat(var(--tb-cols, 2), minmax(0, 1fr)); gap: var(--sim-space-2); }
.tb-tile { display: flex; align-items: center; gap: var(--sim-space-2); min-height: 76px; padding: var(--sim-space-2); box-sizing: border-box; border: calc(2.5px * var(--look-rim)) solid var(--sim-stroke); border-radius: var(--sim-radius-lg);
  background: var(--sim-bg-surface); box-shadow: 0 calc(3px * var(--look-lip)) 0 var(--sim-stroke); font: 700 var(--sim-text-md)/1.2 var(--sim-font); color: var(--sim-label); animation: tb-in 0.42s var(--look-spring-soft) both; animation-delay: var(--d, 0s); }
.tb-tile svg { flex: 0 0 44px; width: 44px; height: 44px; }
.tb-num { flex: 0 0 34px; height: 34px; display: grid; place-items: center; border-radius: 50%; background: var(--sim-track); font: 600 var(--sim-text-md)/1 var(--sim-font-display, var(--sim-font)); }
@keyframes tb-in { from { transform: translateY(8px); opacity: 0; } to { transform: none; opacity: 1; } }
.sim-dom-root--portrait .tb-grid[data-narrow="1"] { --tb-cols: 1 !important; }
@media (prefers-reduced-motion: reduce) { .tb-tile { animation: none; } }
`;
export function tilesHtml(items, o = {}) {
  const tile = (t, i) => `<div class="tb-tile" style="--d:${(i * 0.05).toFixed(2)}s">${t.icon ? `<svg viewBox="0 0 48 48" aria-hidden="true">${iconSvg(t.icon, t.tone ?? 1)}</svg>` : t.num ? `<span class="tb-num">${t.num}</span>` : ''}<span>${esc(t.text)}</span></div>`;
  return `<div class="tb-grid" ${o.narrow ? 'data-narrow="1"' : ''} style="--tb-cols:${o.cols ?? 2}">${items.map(tile).join('')}</div>`;
}
