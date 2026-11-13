/**
 * StreetLampScene - L07 s07 "Public Goods" (2 beats). SvgScene, a lane at dusk (light theme: evening; dark: night).
 * The street light is the hero: a tall pole, its head and a cone of light onto a pool on the road. Glow only on
 * what emits light (the lamp head, its cone and its pool).
 *   b0 light: four walkers come into the pool one after another (0.6 s each). Outside the light they are dim;
 *             inside, each is lit, and the pool never gets smaller (chip "never used up"). A ticket booth by the
 *             pool tries to charge: a "?" pops over it (no one can be made to pay). Beside the lane a snack stall
 *             sells one snack to one buyer: a coin goes in, a snack comes out, chip "1 each".
 *             Replay button. Rest: four walkers lit together, "?" over the booth, "1 each" at the stall.
 *   b1 goods: the same lane; the light carries a tag "public good". A government building pays for it with an
 *             arrow "taxes". The book's examples appear as chips with icons (0.3 s apart): park (tree), road,
 *             police, street lights, basic education (school). The snack stall's tag: "private good".
 * Colours are tokens only. ASCII only.
 */
import { SvgScene, fill, stroke, shade } from 'simulations/base/kit/SimSvg.js';
import { iconSvg } from 'simulations/base/kit/SimIcons.js';
import { civicSvg } from 'simulations/base/kit/SimCivic.js';
import { loadColors } from 'simulations/base/kit/SimLook.js';
import { drawFigure, figureFor } from 'simulations/base/kit/SimFigure.js';

const f1 = (v) => (+v).toFixed(1);
const WALKERS = [
  { role: 'student', look: { outfit: 'uniform' } }, { role: 'worker' }, { role: 'elder' }, { role: 'adult' },
];
const GOODS = [
  { name: 'park', icon: 'tree', tn: 3 },
  { name: 'road', icon: 'road', tn: 5 },
  { name: 'police', icon: 'person', tn: 1 },
  { name: 'street lights', icon: 'lamp', tn: 4 },
  { name: 'basic education', icon: 'school', tn: 7 },
];

const CSS = `
.sl-ab { position: absolute; transform: translate(-50%, -50%); }
.sl-btn { min-height: 46px; padding: 5px 16px; cursor: pointer; white-space: nowrap;
  border-radius: calc(12px * var(--look-radius, 1)); font: 800 20px/1.1 var(--sim-font); background: var(--sim-bg-surface); color: var(--sim-label);
  border: 2.5px solid var(--sim-stroke); box-shadow: 0 calc(3px * var(--look-lip, 1)) 0 var(--sim-stroke); }
.sl-btn:active { transform: translateY(3px); box-shadow: none; }
.sl-btn:focus-visible { outline: 3px solid var(--sim-accent); outline-offset: 3px; }
.sl-goods { position: absolute; display: flex; flex-wrap: wrap; justify-content: center; align-content: flex-start; gap: 8px; }
.sl-g { display: inline-flex; align-items: center; gap: 6px; padding: 3px 12px 3px 5px; border-radius: 999px; white-space: nowrap;
  font: 800 19px/1.1 var(--sim-font); color: var(--sim-label); background: var(--sim-bg-surface); border: 2.5px solid var(--sim-stroke);
  box-shadow: 0 calc(3px * var(--look-lip, 1)) 0 var(--sim-stroke); animation: sl-pop 0.45s cubic-bezier(.3,1.5,.5,1) both; animation-delay: var(--d, 0s); }
.sl-g svg { width: 34px; height: 34px; }
.sl-g--hero { border-color: var(--sim-gold); box-shadow: 0 calc(3px * var(--look-lip, 1)) 0 var(--sim-gold); }
.sl-p .sl-g { font-size: 17px; }
.sl-p .sl-g svg { width: 30px; height: 30px; }
@keyframes sl-pop { 0% { transform: scale(0.4); opacity: 0; } 100% { transform: none; opacity: 1; } }
svg .sl-pop { transform-box: fill-box; transform-origin: center; animation: sl-pop 0.45s cubic-bezier(.3,1.5,.5,1) both; animation-delay: var(--d, 0s); }
svg .sl-mv { animation: sl-mv 0.6s cubic-bezier(.4,0,.3,1) both; }
@keyframes sl-mv { 0% { transform: translate(var(--dx), 0); } 100% { transform: none; } }
.sl-fig { position: absolute; pointer-events: none; }
.sl-fig.sl-mv { animation: sl-mv 0.6s cubic-bezier(.4,0,.3,1) both; }
.sl-fig--dim { opacity: 0.45; }
svg .sl-draw { stroke-dasharray: 400; stroke-dashoffset: 400; animation: sl-draw 0.6s ease forwards; animation-delay: var(--d, 0s); }
@keyframes sl-draw { to { stroke-dashoffset: 0; } }
`;

const text = (x, y, t, size, col = 'var(--sim-label)', extra = '') =>
  `<text x="${f1(x)}" y="${f1(y)}"${/text-anchor/.test(extra) ? '' : ' text-anchor="middle"'}${extra} style="fill:${col};font:800 ${size}px var(--sim-font)">${t}</text>`;

const iconInner = (name, tn) => (iconSvg(name, tn).match(/<svg[^>]*>([\s\S]*)<\/svg>/) || [])[1] || '';
function icon(name, cx, cy, size, tn) {
  const col = typeof tn === 'string' ? tn : `var(--sim-series-${tn})`;
  return `<g transform="translate(${f1(cx - size / 2)} ${f1(cy - size / 2)}) scale(${(size / 48).toFixed(3)})" style="--i:${col}">${iconInner(name, tn)}</g>`;
}
const iconTag = (name, tn) => `<svg viewBox="0 0 48 48" aria-hidden="true" style="--i:var(--sim-series-${tn})">${iconInner(name, tn)}</svg>`;

function chipSvg(x, y, label, size, col = 'var(--sim-stroke)', bg = 'var(--sim-bg-surface)') {
  const w = label.length * size * 0.56 + 28, h = size + 18;
  return `<rect x="${f1(x - w / 2)}" y="${f1(y - h / 2 + 3)}" width="${f1(w)}" height="${f1(h)}" rx="${f1(h / 2)}" ${fill(shade(col, 75))}/>`
    + `<rect x="${f1(x - w / 2)}" y="${f1(y - h / 2)}" width="${f1(w)}" height="${f1(h)}" rx="${f1(h / 2)}" ${fill(bg, `stroke:${col};stroke-width:2.5`)}/>`
    + text(x, y + size * 0.36, label, size);
}

export class StreetLampScene extends SvgScene {
  static WIDTH = 560;
  static PORTRAIT_WIDTH = 390;
  static HEIGHT = 504;
  static PORTRAIT_HEIGHT = 624;
  static CONTINUOUS = false;
  static BEAT_STEP_MAP = [[{ idx: 0, dwellMs: null }], [{ idx: 1, dwellMs: null }]];
  static BEAT_MAPS = { 2: [[{ idx: 0, dwellMs: null }], [{ idx: 1, dwellMs: null }]] };
  static CONTROLS = [];
  static ARIA_LABEL = 'A lane at dusk with one tall street light. Four walkers come into its pool of light one after another; each one is lit, and the light is never used up. A ticket booth tries to charge for the light and cannot: a question mark. Beside the lane a snack stall sells one snack to one buyer, who pays: one each. Then the light gets the tag public good. A government building pays for it from taxes. Other public goods: park, road, police, street lights, basic education. The snack stall sells a private good.';

  async setup() {
    this.uid = `sl${Math.floor(Math.random() * 1e6)}`;
    await super.setup();
    this._onClick = (e) => {
      const b = e.target?.closest?.('[data-act]');
      if (b?.dataset.act === 'replay') this.runFrom(0.3);
    };
    this.root.addEventListener('click', this._onClick);
  }

  destroy() {
    this.root?.removeEventListener('click', this._onClick);
    super.destroy();
  }

  css() { return CSS; }

  enter(step) {
    if (step === 0) this.runFrom(0.4, true);
    else { this.ph = 6; this.prevPh = 6; this.fresh = true; this.after(2.4, () => { this.fresh = false; }); }
  }

  /** b0 phases: 0 none in; 1..4 walker i enters the pool; 5 the booth's "?"; 6 "never used up". */
  runFrom(lead, quiet) {
    for (const t of (this._timers ?? []).splice(0)) clearTimeout(t);
    this.ph = 0; this.prevPh = 0;
    if (!quiet) this.repaint();
    for (let p = 1; p <= 6; p++) this.after(lead + (p - 1) * 0.6, () => { this.prevPh = this.ph; this.ph = p; this.repaint(); });
  }

  skip() {
    if (this.stepIndex !== 0 || this.ph >= 6) return false;
    for (const t of (this._timers ?? []).splice(0)) clearTimeout(t);
    this.ph = 6; this.prevPh = 6;
    this.repaint();
    return true;
  }

  busy() { return this.stepIndex === 0 ? this.ph < 6 : !!this.fresh; }

  stageHeight(st) { return Math.round((st.portrait ? 600 : 480) * st.W / (st.portrait ? 390 : 560)); }

  geom(st) {
    if (!st.portrait) {
      return { P: false, W: st.W, H: st.H, road: 352, pole: 168, head: [262, 66], pool: [270, 392, 132, 26], booth: [62, 352], walk: [204, 250, 296, 342], wy: 404, fh: 124, wait: -60,
        stall: [482, 452, 140], buyer: [396, 462], fbh: 112, each: [482, 300], used: [430, 150], btn: [490, 40],
        tag: [176, 160], gov: [56, 352, 104], goods: [314, 12, 240], priv: [482, 300] };
    }
    return { P: true, W: st.W, H: st.H, road: 380, pole: 92, head: [184, 150], pool: [196, 418, 128, 26], booth: [44, 380], walk: [130, 174, 218, 262], wy: 428, fh: 108, wait: -60,
      stall: [296, 574, 136], buyer: [212, 584], fbh: 100, each: [296, 436], used: [292, 236], btn: [320, 40],
      tag: [218, 262], gov: [62, 380, 84], goods: [12, 8, 366], priv: [296, 436] };
  }

  lamp(g) {
    const [hx, hy] = g.head, [px, py, rx, ry] = g.pool, id = this.uid, pole = g.pole;
    let s = `<defs><radialGradient id="${id}p" cx="50%" cy="50%" r="50%"><stop offset="0" style="stop-color:var(--sim-gold);stop-opacity:0.75"/><stop offset="0.6" style="stop-color:var(--sim-gold);stop-opacity:0.35"/><stop offset="1" style="stop-color:var(--sim-gold);stop-opacity:0"/></radialGradient>`
      + `<linearGradient id="${id}c" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--sim-gold);stop-opacity:0.55"/><stop offset="1" style="stop-color:var(--sim-gold);stop-opacity:0.12"/></linearGradient>`
      + `<radialGradient id="${id}h" cx="50%" cy="50%" r="50%"><stop offset="0" style="stop-color:var(--sim-gold);stop-opacity:0.8"/><stop offset="1" style="stop-color:var(--sim-gold);stop-opacity:0"/></radialGradient></defs>`;
    s += `<path d="M${hx - 20} ${hy + 14}L${hx + 20} ${hy + 14}L${px + rx * 0.92} ${py}L${px - rx * 0.92} ${py}Z" style="fill:url(#${id}c)"/>`;
    s += `<ellipse cx="${px}" cy="${py}" rx="${rx * 1.15}" ry="${ry * 1.5}" style="fill:url(#${id}p)"/>`;
    // pole, arm, head
    const metal = 'color-mix(in srgb, var(--sim-waste) 70%, var(--sim-label))';
    s += `<rect x="${pole - 9}" y="${g.road + 22}" width="18" height="10" rx="3" ${fill(shade(metal, 80))}/>`;
    s += `<path d="M${pole} ${g.road + 26}V${hy + 30}Q${pole} ${hy - 6} ${pole + 34} ${hy - 6}H${hx - 6}" ${stroke(metal, 10)}/>`;
    s += `<path d="M${pole - 3} ${g.road + 20}V${hy + 36}" ${stroke('color-mix(in srgb, var(--sim-bg-surface) 45%, transparent)', 2.5)}/>`;
    s += `<circle cx="${hx}" cy="${hy + 12}" r="54" style="fill:url(#${id}h)"/>`;
    s += `<path d="M${hx - 32} ${hy + 12}L${hx - 18} ${hy - 12}H${hx + 18}L${hx + 32} ${hy + 12}Z" ${fill(metal, `stroke:${shade(metal, 65)};stroke-width:2.5;stroke-linejoin:round`)}/>`;
    s += `<ellipse cx="${hx}" cy="${hy + 14}" rx="22" ry="7" ${fill('color-mix(in srgb, var(--sim-gold) 55%, white)')}/>`;
    return s;
  }

  street(g) {
    const { W, H } = g, sky = 'color-mix(in srgb, var(--sim-series-5) 20%, var(--sim-bg-surface))';
    let s = `<rect x="0" y="0" width="${W}" height="${g.road}" rx="14" ${fill(sky)}/>`;
    s += `<path d="M0 ${g.road}V${g.road - 14}L${W * 0.2} ${g.road - 30}L${W * 0.42} ${g.road - 12}L${W * 0.7} ${g.road - 40}L${W} ${g.road - 18}V${g.road}Z" ${fill('color-mix(in srgb, var(--sim-series-5) 12%, var(--sim-bg-deep))', 'opacity:0.55')}/>`;
    s += `<rect x="0" y="${g.road}" width="${W}" height="${H - g.road}" rx="14" ${fill('color-mix(in srgb, var(--sim-waste) 26%, var(--sim-bg-surface))')}/>`;
    s += `<rect x="0" y="${g.road}" width="${W}" height="6" ${fill('color-mix(in srgb, var(--sim-waste) 50%, var(--sim-bg-surface))')}/>`;
    const ly = g.pool[1] + (g.P ? 34 : 44);
    s += `<path d="M10 ${ly}H${W - 10}" ${stroke('color-mix(in srgb, var(--sim-bg-surface) 70%, var(--sim-waste))', 4, 'stroke-dasharray:26 22')}/>`;
    return s;
  }

  booth(g, q) {
    const [x, gy] = g.booth, w = g.P ? 66 : 80, h = w * 1.25, col = 'var(--sim-series-2)';
    let s = `<rect x="${f1(x - w / 2)}" y="${f1(gy - h)}" width="${w}" height="${f1(h)}" rx="6" ${fill(shade(col, 85), `stroke:${shade(col, 55)};stroke-width:2.5`)}/>`
      + `<path d="M${f1(x - w / 2 - 6)} ${f1(gy - h)}H${f1(x + w / 2 + 6)}L${f1(x + w / 2)} ${f1(gy - h - 14)}H${f1(x - w / 2)}Z" ${fill(col, `stroke:${shade(col, 55)};stroke-width:2.5;stroke-linejoin:round`)}/>`
      + `<rect x="${f1(x - w / 2 + 6)}" y="${f1(gy - h + 8)}" width="${w - 12}" height="${f1(h * 0.42)}" rx="4" ${fill('var(--sim-bg-surface)')}/>`
      + text(x, gy - h + 8 + h * 0.21 - 2, 'pay', 15) + text(x, gy - h + 8 + h * 0.21 + 15, 'here', 15)
      + icon('ticket', x, gy - h * 0.24, w * 0.56, 2);
    if (q) {
      const by = gy - h - 46;
      s += `<g class="${this.prevPh !== this.ph && this.ph === 5 ? 'sl-pop' : ''}"><circle cx="${x}" cy="${f1(by + 3)}" r="25" ${fill(shade('var(--sim-stroke)', 80))}/><circle cx="${x}" cy="${f1(by)}" r="25" ${fill('var(--sim-bg-surface)', 'stroke:var(--sim-accent);stroke-width:3')}/>${text(x, by + 11, '?', 32, 'var(--sim-accent)')}</g>`;
    }
    return s;
  }

  snack(g, b1) {
    const [x, gy, w] = g.stall, P = g.P, cartTop = gy - (200 - 116) * (w / 230);
    let s = civicSvg('stall', x, gy, { w });
    if (!b1) {
      const fr = this.prevPh !== this.ph && this.ph === 2;
      if (this.ph >= 2) {
        s += `<g class="${fr ? 'sl-pop' : ''}">${icon('coin', x - w / 2 + 14, cartTop - 26, 28, 'var(--sim-gold)')}${icon('cup', x - w / 2 + 44, cartTop - 14, 30, 8)}</g>`;
        s += `<g class="${fr ? 'sl-pop' : ''}" style="--d:0.2s">${chipSvg(g.each[0], g.each[1], '1 each', P ? 19 : 20)}</g>`;
      }
    } else {
      s += `<g class="${this.fresh ? 'sl-pop' : ''}" style="--d:1.9s">${chipSvg(g.priv[0], g.priv[1], 'private good', P ? 18 : 20)}</g>`;
    }
    return s;
  }

  /** Walkers and the snack buyer: SimFigure people on small canvases in the overlay (drawn after render). */
  people(g, b1) {
    let o = '';
    // The host forces every canvas to width 100%, so each canvas sits in a sized div and fills it.
    const cv = (id, w, h, walk) => `<canvas data-fig="${id}" data-walk="${walk}" data-w="${f1(w)}" data-h="${f1(h)}" width="${Math.round(w)}" height="${Math.round(h)}" style="display:block;width:100%;height:100%"></canvas>`;
    const n = b1 ? 4 : Math.min(4, this.ph);
    for (let i = 0; i < n; i++) {
      const x = g.walk[i], w = g.fh * 0.6, h = g.fh + 10;
      const moved = !b1 && i === this.ph - 1 && this.prevPh !== this.ph;
      o += `<div class="sl-fig${moved ? ' sl-mv' : ''}${b1 ? ' sl-fig--dim' : ''}" style="left:${f1(x - w / 2)}px;top:${f1(g.wy - g.fh - 4)}px;width:${f1(w)}px;height:${f1(h)}px;--dx:${f1(w / 2 + 4 - x)}px">${cv(`w${i}`, w, h, moved ? 1 : 0)}</div>`;
    }
    const [bx, by] = g.buyer, bw = g.fbh * 0.75;
    o += `<div class="sl-fig" style="left:${f1(bx - bw / 2)}px;top:${f1(by - g.fbh - 4)}px;width:${f1(bw)}px;height:${f1(g.fbh + 10)}px">${cv('b', bw, g.fbh + 10, 0)}</div>`;
    return o;
  }

  repaint() {
    super.repaint();
    if (!this.sv) return;
    let c;
    try { c = loadColors(this.root); } catch (_) { return; }
    const P = this.sv.portrait, g = this.geom({ portrait: P, W: P ? 390 : 560, H: P ? 600 : 480 });
    const dpr = Math.min(2, (typeof window !== 'undefined' && window.devicePixelRatio) || 1) * 1.5;
    for (const el of this.sv.wrap.querySelectorAll('canvas[data-fig]')) {
      const w = parseFloat(el.dataset.w), h = parseFloat(el.dataset.h);
      el.width = Math.round(w * dpr); el.height = Math.round(h * dpr);
      const ctx = el.getContext('2d');
      if (!ctx) continue;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const id = el.dataset.fig;
      if (id === 'b') {
        const spec = figureFor(c, { role: 'student', pose: 'stand', x: w / 2, y: h - 6, height: g.fbh, facing: 1, i: 5, mood: 'smile',
          hands: [{ x: w / 2 + g.fbh * 0.24, y: h - 6 - g.fbh * 0.56 }, null], autoReach: false, look: { outfit: 'uniform', hairStyle: 'braid', bottomStyle: 'skirt' } });
        drawFigure(ctx, c, spec, spec.look);
        continue;
      }
      const i = +id.slice(1), wk = WALKERS[i], walking = el.dataset.walk === '1';
      const spec = figureFor(c, { role: wk.role, pose: walking ? { name: 'walk', phase: 0.25 } : 'stand', x: w / 2, y: h - 6, height: g.fh, facing: walking ? 1 : 0, i: 20 + i, mood: 'smile', look: wk.look });
      drawFigure(ctx, c, spec, spec.look);
    }
  }

  /** Drawn in design units (560 x 480 landscape, 390 x 600 portrait), scaled to the measured stage width. */
  paint(st) {
    const P = st.portrait, DW = P ? 390 : 560, DH = P ? 600 : 480, k = (st.W / DW).toFixed(4);
    const out = this.paintD({ portrait: P, W: DW, H: DH });
    return { svg: `<g transform="scale(${k})">${out.svg}</g>`, over: `<div style="position:absolute;left:0;top:0;width:${DW}px;height:${DH}px;transform:scale(${k});transform-origin:0 0">${out.over}</div>` };
  }

  paintD(st) {
    const g = this.geom(st), b1 = this.stepIndex === 1, P = g.P, ph = this.ph ?? 6;
    let svg = this.street(g), over = '';
    if (!b1) svg += this.booth(g, ph >= 5);
    else {
      const [x, gy, w] = g.gov;
      svg += `<g class="${this.fresh ? 'sl-pop' : ''}" style="--d:0.1s">${civicSvg('office', x, gy, { w })}</g>`;
      svg += chipSvg(x, gy + (P ? 54 : 26), 'government', P ? 16 : 18);
    }
    svg += this.lamp(g);
    svg += this.snack(g, b1);
    over += this.people(g, b1);
    if (!b1) {
      if (ph >= 6) svg += `<g class="${this.prevPh !== 6 ? 'sl-pop' : ''}">${chipSvg(g.used[0], g.used[1], 'never used up', P ? 19 : 21, 'var(--sim-gold)')}</g>`;
      over += `<div class="sl-ab" style="left:${g.btn[0]}px;top:${g.btn[1]}px"><button type="button" class="sv-hit sl-btn" data-act="replay">replay</button></div>`;
    } else {
      const [tx, ty] = g.tag, gx = g.gov[0] + (P ? 0 : 20), gtop = g.gov[1] - g.gov[2] * 0.79 - 6, tl = tx - (P ? 70 : 76);
      const d = `M${gx} ${f1(gtop)}Q${gx} ${f1(ty)} ${f1(tl - 6)} ${f1(ty)}`;
      svg += `<path class="${this.fresh ? 'sl-draw' : ''}" d="${d}" ${stroke('var(--sim-accent)', 4.5, '--d:0.5s')}/>`;
      svg += `<path d="M${f1(tl - 16)} ${f1(ty - 9)}L${f1(tl - 5)} ${f1(ty)}L${f1(tl - 16)} ${f1(ty + 9)}" ${stroke('var(--sim-accent)', 4.5)}/>`;
      const cx = P ? 26 : gx + 18, cy = P ? ty - 30 : (gtop + ty) / 2 + 12;
      svg += `<g class="${this.fresh ? 'sl-pop' : ''}" style="--d:0.9s">${icon('coin', cx, cy - 2, P ? 24 : 28, 'var(--sim-gold)')}${text(cx + (P ? 16 : 18), cy + 7, 'taxes', P ? 18 : 20, 'var(--sim-accent)', ' text-anchor="start"')}</g>`;
      svg += `<g class="${this.fresh ? 'sl-pop' : ''}" style="--d:0.2s">${chipSvg(tx, ty, 'public good', P ? 20 : 22, 'var(--sim-gold)', 'color-mix(in srgb, var(--sim-gold) 22%, var(--sim-bg-surface))')}</g>`;
      const [gx0, gy0, gw] = g.goods;
      over += `<div class="sl-goods" style="left:${gx0}px;top:${gy0}px;width:${gw}px">`
        + GOODS.map((q, i) => `<span class="sl-g${q.name === 'street lights' ? ' sl-g--hero' : ''}" style="--d:${this.fresh ? f1(0.9 + i * 0.3) : 0}s">${iconTag(q.icon, q.tn)}${q.name}</span>`).join('') + '</div>';
    }
    return { svg, over: `<div class="${P ? 'sl-p' : 'sl-l'}">${over}</div>` };
  }

  testState() { return { step: this.stepIndex, phase: this.ph, lit: this.stepIndex === 1 ? 4 : Math.min(4, this.ph ?? 0) }; }
}
