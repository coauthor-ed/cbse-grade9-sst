// EarthBits - small SVG pieces for the scenes of lessons 4 to 7: words, tags on the ground, a framed
// world, flow arrows, a control row under the figure, and a tween on the frame clock. Not a scene.
// Colours are tokens through EarthArt; the world is daylight in both themes, so ink on it is fixed.
import { fill, stroke, shade } from 'simulations/base/kit/SimSvg.js';
import { lookOf } from 'simulations/base/kit/lookProfile.js';
import { svgEarthSky, svgEarthColour as ec, smooth } from '../shared/EarthArt.js';

export { ec };
export const col = (n) => `var(--sim-series-${n})`;
export const INK = ec('ink');
export const WHITE = ec('snow');
export const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
export const lerp = (a, b, t) => a + (b - a) * t;
export const ease = (t) => t * t * (3 - 2 * t);
export const pts = (p) => p.map((q) => q.map((v) => +v.toFixed(1)));

/** A line of SVG text. o: size, weight, ink, anchor, display, halo, opacity. */
export function words(x, y, s, o = {}) {
  const fam = o.display === false ? 'var(--sim-font)' : 'var(--sim-font-display, var(--sim-font))';
  const st = [`font-family:${fam}`, `font-size:${o.size ?? 15}px`, `font-weight:${o.weight ?? 600}`, `fill:${o.ink ?? INK}`];
  if (o.halo) st.push('paint-order:stroke', `stroke:${o.halo}`, `stroke-width:${o.haloW ?? 4}px`, 'stroke-linejoin:round');
  if (o.opacity != null) st.push(`opacity:${o.opacity}`);
  return `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" text-anchor="${o.anchor ?? 'start'}" style="${st.join(';')}">${s}</text>`;
}

/** Text width in design px, close enough to place a plate. */
export const textW = (s, size = 15) => s.length * size * 0.54;

/** A label plate on the ground, centred on (x, y). o: fill, ink, size, on (lit), pop, dim, anchor ('middle' | 'start' | 'end'). */
export function tag(x, y, s, o = {}) {
  const size = o.size ?? 15, w = textW(s, size) + 18, h = size + 12, L = lookOf();
  const x0 = o.anchor === 'start' ? x : o.anchor === 'end' ? x - w : x - w / 2, y0 = y - h / 2;
  const bg = o.fill ?? INK, ink = o.ink ?? WHITE, r = Math.min(h / 2, 12 * (L.radius ?? 1));
  const cls = o.pop ? ' class="sv-pop"' : '';
  return `<g${cls} style="opacity:${o.dim ? 0.3 : 1}${o.pop ? `;--d:${o.delay ?? 0}s` : ''}"><rect x="${x0.toFixed(1)}" y="${y0.toFixed(1)}" width="${w.toFixed(1)}" height="${h}" rx="${r}" ${fill(bg, `stroke:${o.rim ?? WHITE};stroke-width:${o.on ? 2.5 : 1.5}`)}/>`
    + words(x0 + w / 2, y + size * 0.36, s, { size, ink, anchor: 'middle' }) + '</g>';
}

/** A thin line from a label to the thing it names, ending in a dot. */
export function pointer(x0, y0, x1, y1, o = {}) {
  const c = o.ink ?? INK;
  return `<path d="M${x0.toFixed(1)} ${y0.toFixed(1)}L${x1.toFixed(1)} ${y1.toFixed(1)}" ${stroke(c, o.w ?? 2.5)} style="stroke:${c};stroke-width:${o.w ?? 2.5};fill:none;opacity:${o.dim ? 0.3 : 1}"/><circle cx="${x1.toFixed(1)}" cy="${y1.toFixed(1)}" r="4.5" ${fill(c, `stroke:${WHITE};stroke-width:1.5;opacity:${o.dim ? 0.3 : 1}`)}/>`;
}

/** A chunky arrow along points (smoothed). o: c, w, head, dim, rim. */
export function arrow(p, o = {}) {
  const c = o.c ?? WHITE, w = o.w ?? 7, rim = o.rim ?? INK, n = p.length, [ax, ay] = p[n - 2], [bx, by] = p[n - 1];
  const a = Math.atan2(by - ay, bx - ax), h = o.head ?? w * 2.6;
  const ex = bx - Math.cos(a) * h * 0.7, ey = by - Math.sin(a) * h * 0.7;
  const body = p.slice(0, -1).concat([[ex, ey]]);
  let d = `M${body[0][0].toFixed(1)} ${body[0][1].toFixed(1)}`;
  for (let i = 1; i < body.length - 1; i++) { const mx = (body[i][0] + body[i + 1][0]) / 2, my = (body[i][1] + body[i + 1][1]) / 2; d += `Q${body[i][0].toFixed(1)} ${body[i][1].toFixed(1)} ${mx.toFixed(1)} ${my.toFixed(1)}`; }
  d += `L${ex.toFixed(1)} ${ey.toFixed(1)}`;
  const tip = `M${bx.toFixed(1)} ${by.toFixed(1)}L${(bx - Math.cos(a - 0.5) * h).toFixed(1)} ${(by - Math.sin(a - 0.5) * h).toFixed(1)}L${(bx - Math.cos(a + 0.5) * h).toFixed(1)} ${(by - Math.sin(a + 0.5) * h).toFixed(1)}Z`;
  const op = `opacity:${o.dim ? 0.3 : o.opacity ?? 1}`;
  return `<g style="${op}"><path d="${d}" style="fill:none;stroke:${rim};stroke-width:${w + 3.5};stroke-linecap:round"/><path d="${tip}" style="fill:${rim};stroke:${rim};stroke-width:3.5;stroke-linejoin:round"/><path d="${d}" style="fill:none;stroke:${c};stroke-width:${w};stroke-linecap:round"/><path d="${tip}" style="fill:${c}"/></g>`;
}

/** A plain filled shape from points. o: f (role), s (role), w, closed, opacity, curve. */
export function shape(p, o = {}) {
  const d = o.curve === false ? `M${p.map((q) => `${q[0].toFixed(1)} ${q[1].toFixed(1)}`).join('L')}Z` : smooth(p, true);
  return `<path d="${d}" style="fill:${o.f ? (o.f.startsWith?.('var') || o.f.startsWith?.('color') ? o.f : ec(o.f)) : 'none'};${o.s ? `stroke:${ec(o.s)};stroke-width:${o.w ?? 2.5};stroke-linejoin:round;` : ''}opacity:${o.opacity ?? 1}"/>`;
}
/** A stroked open line through points, smoothed. */
export function strand(p, role, w = 4, o = {}) {
  const d = smooth(p, false);
  return `<path d="${d}" style="fill:none;stroke:${role.startsWith('var') || role.startsWith('color') ? role : ec(role)};stroke-width:${w};stroke-linecap:round;stroke-linejoin:round;opacity:${o.opacity ?? 1}${o.dash ? `;stroke-dasharray:${o.dash}` : ''}"/>`;
}

/** The whole stage as a rounded window. Sky unless o.sky === false; o.ground fills it with a role. */
export function world(st, id, body, o = {}) {
  const r = 18 * (lookOf().radius ?? 1), m = 2;
  const back = o.ground ? `<rect x="0" y="0" width="${st.W}" height="${st.H}" style="fill:${ec(o.ground)}"/>` : `<rect x="0" y="0" width="${st.W}" height="${st.H}" style="fill:url(#${id}-sky)"/>`;
  return `<defs>${svgEarthSky(`${id}-sky`)}<clipPath id="${id}-clip"><rect x="${m}" y="${m}" width="${st.W - 2 * m}" height="${st.H - 2 * m}" rx="${r}"/></clipPath></defs>`
    + `<g clip-path="url(#${id}-clip)">${back}${body}</g>`
    + `<rect x="${m}" y="${m}" width="${st.W - 2 * m}" height="${st.H - 2 * m}" rx="${r}" style="fill:none;stroke:${ec('inkSoft')};stroke-width:3"/>`;
}

/** A rimmed panel on the figure. */
export function plate(x, y, w, h, o = {}) {
  const L = lookOf(), r = (o.r ?? 12) * (L.radius ?? 1), lip = 3 * (L.lip ?? 1), rim = o.rim ?? INK;
  return `<rect x="${x}" y="${y + lip}" width="${w}" height="${h}" rx="${r}" style="fill:${rim}"/><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" style="fill:${o.fill ?? WHITE};stroke:${rim};stroke-width:2.5"/>`;
}

export const BAR_CSS = `
.eb-bar { display: flex; flex-wrap: wrap; justify-content: center; align-items: center; gap: var(--sim-space-2); padding: var(--sim-space-2) 0 0; }
.eb-bar:empty { display: none; }
.eb-btn { appearance: none; min-height: 48px; min-width: 48px; padding: 6px 16px; border: calc(2px * var(--look-rim)) solid var(--sim-stroke); border-radius: var(--look-pill);
  background: var(--sim-bg-surface); color: var(--sim-label); font: 800 var(--sim-text-md)/1.15 var(--sim-font); cursor: pointer; touch-action: manipulation;
  box-shadow: 0 calc(3px * var(--look-lip)) 0 var(--sim-stroke); }
.eb-btn[data-go] { background: var(--primary-color, var(--sim-accent)); border-color: var(--primary-color, var(--sim-accent)); color: var(--sim-ink-on-accent, var(--sim-bg-deep)); box-shadow: 0 calc(3px * var(--look-lip)) 0 color-mix(in oklab, var(--primary-color, var(--sim-accent)) 62%, var(--sim-bg-deep)); }
.eb-btn[aria-pressed="true"] { border-color: var(--primary-color, var(--sim-accent)); background: color-mix(in oklab, var(--primary-color, var(--sim-accent)) 22%, var(--sim-bg-surface)); }
.eb-btn:disabled { opacity: 0.5; cursor: default; box-shadow: none; }
.eb-btn:active:not(:disabled) { transform: translateY(calc(3px * var(--look-lip))); box-shadow: none; }
.eb-range { display: flex; align-items: center; gap: var(--sim-space-2); flex: 1 1 100%; min-height: 46px; max-width: 460px; font: 800 var(--sim-text-md)/1.15 var(--sim-font); color: var(--sim-label); }
.eb-range input { flex: 1; min-width: 0; height: 46px; accent-color: var(--primary-color, var(--sim-accent)); touch-action: pan-y; }
.sim-dom-root--portrait.svs { padding: var(--sim-space-1) 0; }
`;

/**
 * The mixin: this.bar(items) sets the control row under the figure, this.tween(from, to, dur, step, done)
 * runs a number on the frame clock and repaints every frame.
 * items: { id, label, go (filled), on (aria-pressed), off (disabled) } a button, or { id, label, min, max, value } a slider.
 * The scene gets control(id, value). Buttons are rebuilt only when bar() runs, so a slider keeps a drag.
 */
export const withEarth = (Base) => class extends Base {
  async setup() {
    this._barItems = [];
    await super.setup();
    const e = document.createElement('div');
    e.className = 'eb-bar';
    this.root.appendChild(e);
    this._barEl = e;
    this._barClick = (ev) => {
      const b = ev.target?.closest?.('[data-id]');
      if (b && !b.disabled) this.control?.(b.dataset.id, true);
    };
    this._barInput = (ev) => {
      const b = ev.target?.closest?.('[data-id]');
      if (b) this.control?.(b.dataset.id, Number(b.value));
    };
    e.addEventListener('click', this._barClick);
    e.addEventListener('input', this._barInput);
    this._barPaint();
  }
  // A predict block mounts its setup scene with onBeatChange(MAX, MAX), which would land on the last explaining stage
  // and show the answer. hostRole tells the mount: a setup always takes the scene's one-beat map.
  onBeatChange(beat, count) {
    if (this.hostRole === 'setup') { super.onBeatChange(0, 1); return; }
    super.onBeatChange(beat, count);
  }
  bar(items) { this._barItems = items; this._barPaint(); }
  _barPaint() {
    const e = this._barEl;
    if (!e) return;
    e.textContent = '';
    for (const it of this._barItems) {
      if (it.min != null) {
        const l = document.createElement('label'), s = document.createElement('span'), i = document.createElement('input');
        l.className = 'eb-range'; s.textContent = it.label; i.type = 'range'; i.min = it.min; i.max = it.max; i.value = it.value; i.step = it.stepBy ?? 1;
        i.dataset.id = it.id; i.setAttribute('aria-label', it.label);
        l.appendChild(s); l.appendChild(i); e.appendChild(l);
      } else {
        const b = document.createElement('button');
        b.type = 'button'; b.className = 'eb-btn'; b.textContent = it.label; b.dataset.id = it.id;
        if (it.go) b.dataset.go = '1';
        if (it.on != null) b.setAttribute('aria-pressed', it.on ? 'true' : 'false');
        if (it.off) b.disabled = true;
        e.appendChild(b);
      }
    }
    this.relayout?.();
  }
  tween(from, to, dur, step, done) {
    this._tw = { from, to, dur, step, done };
    step(from);
    this.play(dur);
  }
  stopTween() { this._tw = null; }
  animate(st, t) {
    const w = this._tw;
    if (!w) return;
    const k = clamp(t / w.dur);
    w.step(lerp(w.from, w.to, ease(k)));
    if (k >= 1) { this._tw = null; w.done?.(); }
    const o = this.paint(st) ?? {};
    st.render(o.svg ?? '', o.over ?? '', '');
  }
  isBusy() { return !!this._tw; }
  destroy() {
    this._barEl?.removeEventListener('click', this._barClick);
    this._barEl?.removeEventListener('input', this._barInput);
    super.destroy();
  }
};
