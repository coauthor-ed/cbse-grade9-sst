// SeaBits.js - small DOM and SVG pieces for sea scenes on SvgScene: words, tags on the water, a rounded window
// frame, and an in-picture control row (slider, segmented choice, button) that stays through repaints.
// Not a scene. General: later geography modules can reuse it. Colours are tokens only.
//
//   words(x, y, text, o)     one line of SVG text. o: size, weight, ink, anchor, display, halo, haloW
//   seaLabel(x, y, text, o)  words in dark ink with a pale halo: stays readable on sea, sand and sky in both themes
//   seaWhite(x, y, text, o)  words in cloud white with a dark halo, for deep water
//   leader(x0, y0, x1, y1)   a thin line from a tag to the thing it names
//   frame(st, id, body)      the whole stage as a rounded window; body goes inside. o.bg paints under it
//   skyDefs(id, kmTop)       a <defs> sky gradient id-sky; use with a rect
//   anim(scene, key, html)   fill <g data-anim="key"></g> from animate(); keeps the group inside the frame clip
//   ctlBar(scene, items, onChange)  in setup(), after super.setup(). items:
//       { kind: 'range', id, label, min, max, step, value, read: (v) => text, say: (v) => text }
//       { kind: 'seg', id, label, options: [{ value, label }], value }   one choice, stays chosen
//       { kind: 'btn', id, label }
//     returns { set(id, v), get(id), label(id, text), show(id, on), disable(id, on), destroy() }. set never fires
//     onChange. A row sits under the stage in the scene root, so a repaint keeps it, and it is at least 44 px tall.
// canvasChips(scene, label, options, onPick)   canvas scenes: real buttons laid over the foot of the canvas, inside
//     the figure, in place of a host control strip (which takes a white side column on a wide card). In setup().
//     options: [{ value, label }]. Returns { set(value), show(on), destroy() }. Colours are tokens; 44 px tall.
import { fill, stroke } from 'simulations/base/kit/SimSvg.js';
import { lookOf } from 'simulations/base/kit/lookProfile.js';
import { svgSeaColour as sc, svgSkyGradient } from './SeaArt.js';

export const INK = sc('ink'), WHITE = sc('cloud'), PALE = sc('cloud');

export function words(x, y, s, o = {}) {
  const fam = o.display ? 'var(--sim-font-display)' : 'var(--sim-font)';
  const st = [`font-family:${fam}`, `font-size:${o.size ?? 15}px`, `font-weight:${o.weight ?? (o.display ? 600 : 800)}`, `fill:${o.ink ?? 'var(--sim-label)'}`];
  if (o.halo) st.push('paint-order:stroke', `stroke:${o.halo}`, `stroke-width:${o.haloW ?? 4}px`, 'stroke-linejoin:round');
  return `<text x="${x}" y="${y}" text-anchor="${o.anchor ?? 'middle'}" style="${st.join(';')}">${s}</text>`;
}
export const seaLabel = (x, y, s, o = {}) => words(x, y, s, { ink: INK, halo: PALE, haloW: 5, ...o });
export const seaWhite = (x, y, s, o = {}) => words(x, y, s, { ink: WHITE, halo: sc('seaDeep'), haloW: 5, ...o });
export const leader = (x0, y0, x1, y1, col = INK, w = 2.5) => `<path d="M${x0} ${y0}L${x1} ${y1}" ${stroke(col, w)}/>`;
export const skyDefs = (id, km = 12) => svgSkyGradient(`${id}-sky`, 0, km);

export function frame(st, id, body) {
  const r = 18 * (lookOf().radius ?? 1), m = 2;
  return `<defs><clipPath id="${id}-clip"><rect x="${m}" y="${m}" width="${st.W - 2 * m}" height="${st.H - 2 * m}" rx="${r}"/></clipPath></defs>`
    + `<g clip-path="url(#${id}-clip)">${body}</g>`
    + `<rect x="${m}" y="${m}" width="${st.W - 2 * m}" height="${st.H - 2 * m}" rx="${r}" ${stroke(sc('ink'), 3)}/>`;
}

export function canvasChips(scene, label, options, onPick) {
  const host = scene.container;
  if (getComputedStyle(host).position === 'static') host.style.position = 'relative';
  const row = document.createElement('div');
  row.setAttribute('role', 'group'); row.setAttribute('aria-label', label);
  row.style.cssText = 'position:absolute;right:8px;bottom:8px;display:flex;gap:6px;z-index:2;';
  const paint = (b, on) => {
    b.setAttribute('aria-pressed', String(on));
    b.style.background = on ? 'var(--primary-color)' : 'var(--sim-bg-surface)';
    b.style.color = on ? 'var(--on-primary, var(--sim-bg-deep))' : 'var(--sim-label)';
  };
  const btns = options.map((o) => {
    const b = document.createElement('button');
    b.type = 'button'; b.textContent = o.label;
    b.style.cssText = 'min-height:44px;min-width:44px;padding:4px 12px;margin:0;cursor:pointer;touch-action:manipulation;border:2px solid var(--sim-stroke);border-radius:999px;font:800 15px/1.15 var(--sim-font);';
    b.addEventListener('click', (e) => { e.stopPropagation(); btns.forEach((x) => paint(x, x === b)); onPick(o.value); });
    for (const t of ['pointerdown', 'pointerup', 'touchstart', 'touchend']) b.addEventListener(t, (e) => e.stopPropagation());
    row.appendChild(b); paint(b, false);
    return b;
  });
  host.appendChild(row);
  return {
    set(v) { options.forEach((o, i) => paint(btns[i], o.value === v)); },
    show(on) { row.hidden = !on; row.style.display = on ? 'flex' : 'none'; },
    destroy() { row.remove(); },
  };
}

export const CTL_CSS = `
.ss-ctl { display: flex; flex-wrap: wrap; gap: 6px 8px; justify-content: center; align-items: center; padding: 8px 0 2px; box-sizing: border-box; width: 100%; }
.ss-range { display: flex; align-items: center; gap: 10px; flex: 1 1 100%; min-width: 0; font: 800 var(--sim-text-md)/1.2 var(--sim-font); color: var(--sim-label); }
.ss-range > span:first-child { white-space: nowrap; }
.ss-range input { flex: 1 1 auto; min-width: 0; height: 44px; margin: 0; accent-color: var(--primary-color, var(--sim-accent)); touch-action: pan-y; cursor: pointer; }
.ss-range output { flex: none; min-width: 3.4em; text-align: right; font: 600 var(--sim-text-lg)/1.1 var(--sim-font-display, var(--sim-font)); }
.ss-seg { display: flex; flex-wrap: wrap; gap: 6px; justify-content: center; align-items: center; flex: 1 1 100%; }
.ss-seg > span { font: 800 var(--sim-text-md)/1.2 var(--sim-font); color: var(--sim-label); }
.ss-btn { appearance: none; box-sizing: border-box; min-height: 44px; min-width: 44px; padding: 4px 14px; margin: 0; cursor: pointer; touch-action: pan-y;
  border: calc(2px * var(--look-rim)) solid var(--sim-stroke); border-radius: var(--look-pill); background: var(--sim-bg-surface); color: var(--sim-label);
  font: 800 var(--sim-text-md)/1.2 var(--sim-font); box-shadow: 0 calc(3px * var(--look-lip)) 0 color-mix(in oklab, var(--sim-stroke) 62%, var(--sim-bg-deep));
  transition: background-color 0.12s ease, transform 0.12s var(--look-spring), box-shadow 0.12s ease; -webkit-tap-highlight-color: transparent; }
.ss-btn[aria-pressed="true"] { background: color-mix(in oklab, var(--primary-color, var(--sim-accent)) 34%, var(--sim-bg-surface)); transform: translateY(calc(2px * var(--look-lip)));
  box-shadow: inset 0 0 0 2px var(--primary-color, var(--sim-accent)), 0 calc(1px * var(--look-lip)) 0 var(--sim-stroke); }
.ss-btn--go { background: var(--primary-color, var(--sim-accent)); color: var(--on-primary, var(--sim-ink-on-accent, var(--sim-bg-deep))); border-color: var(--primary-hover, var(--sim-stroke)); }
.ss-btn:active { transform: translateY(calc(2px * var(--look-lip))); }
.ss-btn:focus-visible, .ss-range input:focus-visible { outline: 3px solid var(--sim-accent); outline-offset: 2px; }
.ss-btn[disabled] { opacity: 0.5; cursor: default; }
@media (prefers-reduced-motion: reduce) { .ss-btn { transition: none; } }
`;

/** Replace a marked group inside the stage SVG: <g data-anim="key"></g>. The way a scene moves water in animate(). */
export function anim(scene, key, html) {
  const g = scene.sv?.wrap?.querySelector?.(`[data-anim="${key}"]`);
  if (g) g.innerHTML = html;
}

export function ctlBar(scene, items, onChange) {
  scene.injectStyle?.(CTL_CSS);
  const bar = document.createElement('div');
  bar.className = 'ss-ctl';
  const nodes = new Map(), vals = new Map();
  for (const it of items) {
    if (it.kind === 'range') {
      const row = document.createElement('label');
      row.className = 'ss-range';
      const name = document.createElement('span'), inp = document.createElement('input'), out = document.createElement('output');
      name.textContent = it.label;
      inp.type = 'range'; inp.min = String(it.min); inp.max = String(it.max); inp.step = String(it.step ?? 1); inp.value = String(it.value);
      inp.setAttribute('aria-label', it.label);
      row.append?.(name, inp, out);
      const show = (v) => { out.textContent = it.read ? it.read(v) : String(v); inp.setAttribute('aria-valuetext', it.say ? it.say(v) : out.textContent); };
      inp.addEventListener('input', () => { const v = Number(inp.value); vals.set(it.id, v); show(v); onChange?.(it.id, v); });
      vals.set(it.id, it.value); show(it.value);
      nodes.set(it.id, { row, set: (v) => { inp.value = String(v); vals.set(it.id, v); show(v); }, disable: (on) => { inp.disabled = !!on; } });
      bar.appendChild(row);
    } else if (it.kind === 'seg') {
      const row = document.createElement('div');
      row.className = 'ss-seg';
      row.setAttribute('role', 'group');
      row.setAttribute('aria-label', it.label ?? it.id);
      const btns = it.options.map((o) => {
        const b = document.createElement('button');
        b.type = 'button'; b.className = 'ss-btn'; b.textContent = o.label;
        b.addEventListener('click', () => { if (vals.get(it.id) === o.value && !it.toggle) return; const v = (vals.get(it.id) === o.value) ? null : o.value; press(v); vals.set(it.id, v); onChange?.(it.id, v); });
        row.appendChild(b);
        return { b, o };
      });
      const press = (v) => { for (const { b, o } of btns) b.setAttribute('aria-pressed', String(o.value === v)); };
      vals.set(it.id, it.value ?? null); press(it.value ?? null);
      nodes.set(it.id, { row, set: (v) => { vals.set(it.id, v); press(v); }, disable: (on) => { for (const { b } of btns) b.disabled = !!on; } });
      bar.appendChild(row);
    } else {
      const b = document.createElement('button');
      b.type = 'button'; b.className = `ss-btn${it.go ? ' ss-btn--go' : ''}`; b.textContent = it.label;
      b.addEventListener('click', () => onChange?.(it.id, true));
      nodes.set(it.id, { row: b, set: () => {}, disable: (on) => { b.disabled = !!on; }, label: (t) => { b.textContent = t; } });
      bar.appendChild(b);
    }
  }
  scene.root.appendChild(bar);
  const api = {
    el: bar,
    get: (id) => vals.get(id),
    set(id, v) { nodes.get(id)?.set(v); },
    label(id, t) { nodes.get(id)?.label?.(t); },
    show(id, on) { const n = nodes.get(id); if (n) n.row.style.display = on ? '' : 'none'; const any = [...nodes.values()].some((x) => x.row.style.display !== 'none'); bar.style.display = any ? '' : 'none'; scene.relayout?.(); },
    disable(id, on) { nodes.get(id)?.disable(on); },
    destroy() { bar.remove(); },
  };
  return api;
}
