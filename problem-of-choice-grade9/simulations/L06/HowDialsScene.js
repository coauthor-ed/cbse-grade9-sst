/**
 * HowDialsScene - L06 s05 "What Decides How" (3 beats). SvgScene, switches inside the figure.
 * The hero is one big gauge: a needle between "more workers" (left, a worker token) and "more machines"
 * (right, a machine token). Each beat shows only its own factors as switch rows under the gauge; earlier
 * beats stay as small dimmed chips at the top. A switch moves the needle in 0.5 s. The needle is a simple
 * weighted sum of the switches on screen (monotone, never an exact value); the side it points to lights.
 *   b0 costs:   machines: costly / affordable; workers: cheap and plentiful / scarce and costly.
 *               Rest: costly + cheap -> well to the workers side. One of each -> the middle.
 *   b1 product: technology: limited / advanced; product: one designer piece (a lehenga) / thousands the same
 *               (a stack of uniforms). Rest: limited + designer piece -> workers side.
 *   b2 laws:    help to buy machines: no / yes (yes -> machines side; no -> the middle), and a plain chip
 *               "labour laws" that moves nothing (the book says only that laws shape the choice). Rest: no.
 * Colours are tokens only: workers series-8, machines series-1 (as FactorsScene and WorkshopScene). ASCII only.
 */
import { SvgScene, fill, stroke, shade } from 'simulations/base/kit/SimSvg.js';
import { iconSvg } from 'simulations/base/kit/SimIcons.js';
import { civicSvg } from 'simulations/base/kit/SimCivic.js';

const MAP = [[{ idx: 0, dwellMs: null }], [{ idx: 1, dwellMs: null }], [{ idx: 2, dwellMs: null }]];
const f1 = (v) => (+v).toFixed(1);
const TAU = Math.PI * 2;
const WT = 8;
const MT = 1;
const SWING = 80;   // degrees at v = 1

// Each switch: two options, a weight each (negative = toward workers). rest = the option index at rest.
const BEATS = [
  [
    { id: 'mach', name: 'machines', opts: ['costly', 'affordable'], v: [-0.45, 0.45], rest: 0 },
    { id: 'work', name: 'workers', opts: ['cheap and plentiful', 'scarce and costly'], v: [-0.45, 0.45], rest: 0 },
  ],
  [
    { id: 'tech', name: 'technology', opts: ['limited', 'advanced'], v: [-0.4, 0.4], rest: 0 },
    { id: 'prod', name: 'product', opts: ['one designer piece', 'thousands the same'], v: [-0.5, 0.5], rest: 0, pics: ['lehenga', 'uniforms'] },
  ],
  [
    { id: 'help', name: 'help to buy machines', opts: ['no', 'yes'], v: [0, 0.55], rest: 0 },
  ],
];
const EARLIER = [[], ['costs'], ['costs', 'technology', 'product']];

const CSS = `
.hd-sw { position: absolute; left: 12px; right: 12px; transform: translateY(-50%); display: flex; align-items: center; gap: 12px; }
.hd-name { flex: 0 0 auto; min-width: 106px; font: 800 21px/1.15 var(--sim-font); color: var(--sim-label); }
.hd-opts { flex: 1 1 auto; display: flex; gap: 10px; }
.hd-btn { flex: 1 1 0; min-height: 48px; padding: 5px 10px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;
  border-radius: calc(12px * var(--look-radius, 1)); font: 800 18px/1.1 var(--sim-font); background: var(--sim-bg-surface); color: var(--sim-label);
  border: 2.5px solid var(--sim-stroke); box-shadow: 0 calc(3px * var(--look-lip, 1)) 0 var(--sim-stroke); }
.hd-btn:active { transform: translateY(3px); box-shadow: none; }
.hd-btn[aria-pressed="true"] { background: color-mix(in oklab, var(--sim-accent) 16%, var(--sim-bg-surface)); border-color: var(--sim-accent); box-shadow: 0 calc(3px * var(--look-lip, 1)) 0 var(--sim-accent); }
.hd-btn:focus-visible { outline: 3px solid var(--sim-accent); outline-offset: 3px; }
.hd-btn svg { flex: 0 0 auto; display: block; }
.hd-p .hd-sw { flex-direction: column; align-items: stretch; gap: 6px; }
.hd-p .hd-name { min-width: 0; font-size: 19px; text-align: center; }
.hd-p .hd-btn { font-size: 17px; padding: 4px 6px; gap: 4px; }
.hd-law { position: absolute; left: 0; right: 0; transform: translateY(-50%); display: flex; justify-content: center; align-items: center; gap: 10px;
  font: 800 19px/1.2 var(--sim-font); color: var(--sim-label-muted); }
.hd-chip { display: inline-flex; align-items: center; gap: 6px; padding: 5px 14px 5px 8px; border-radius: 999px; font: 800 20px/1.1 var(--sim-font);
  color: var(--sim-label); background: var(--sim-bg-surface); border: 2.5px dashed var(--sim-stroke); }
.hd-old { position: absolute; left: 12px; top: 6px; display: flex; gap: 6px; flex-wrap: wrap; opacity: 0.5; }
.hd-old span { font: 800 15px/1 var(--sim-font); color: var(--sim-label-muted); padding: 5px 10px; border-radius: 999px; border: 2px solid var(--sim-stroke); background: var(--sim-bg-surface); }
svg .hd-swing { animation: hd-swing 0.5s ease-in-out both; }
@keyframes hd-swing { from { transform: rotate(var(--a0)); } }
svg .hd-pop { transform-box: fill-box; transform-origin: center; animation: hd-pop 0.45s ease-out both; animation-delay: var(--d, 0s); }
@keyframes hd-pop { 0% { transform: scale(0.4); opacity: 0; } 100% { transform: none; opacity: 1; } }
`;

const text = (x, y, t, size, col = 'var(--sim-label)', extra = '') =>
  `<text x="${f1(x)}" y="${f1(y)}"${/text-anchor/.test(extra) ? '' : ' text-anchor="middle"'}${extra} style="fill:${col};font:800 ${size}px var(--sim-font)">${t}</text>`;

function icon(name, cx, cy, size, tone) {
  const inner = (iconSvg(name, tone).match(/<svg[^>]*>([\s\S]*)<\/svg>/) || [])[1] || '';
  return `<g transform="translate(${f1(cx - size / 2)} ${f1(cy - size / 2)}) scale(${(size / 48).toFixed(3)})" style="--i:var(--sim-series-${tone})">${inner}</g>`;
}

function gearPath(cx, cy, r, n = 8) {
  const ri = r * 0.76, w = TAU / n, pts = [];
  for (let i = 0; i < n; i++) {
    const a0 = i * w - Math.PI / 2;
    for (const [rr, a] of [[ri, a0], [r, a0 + 0.14 * w], [r, a0 + 0.44 * w], [ri, a0 + 0.58 * w]]) pts.push(`${f1(cx + rr * Math.cos(a))} ${f1(cy + rr * Math.sin(a))}`);
  }
  return `M${pts.join('L')}Z`;
}
function token(kind, cx, cy, r) {
  const t = kind === 'w' ? WT : MT, col = `var(--sim-series-${t})`;
  let g = `<circle cx="${f1(cx)}" cy="${f1(cy)}" r="${f1(r)}" ${fill(`color-mix(in oklab, ${col} 20%, var(--sim-bg-surface))`, `stroke:${col};stroke-width:3`)}/>`;
  if (kind === 'w') return g + icon('person', cx, cy + r * 0.04, r * 1.45, t);
  g += `<path d="${gearPath(cx, cy, r * 0.66)}" ${fill(col, `stroke:${shade(col, 60)};stroke-width:2;stroke-linejoin:round`)}/>`;
  return g + `<circle cx="${f1(cx)}" cy="${f1(cy)}" r="${f1(r * 0.2)}" ${fill('var(--sim-bg-surface)', `stroke:${shade(col, 60)};stroke-width:2`)}/>`;
}

/** A small lehenga: a fitted blouse and a wide flared skirt with gold work. Inline svg for a button. */
function lehengaSvg(h) {
  const col = 'var(--sim-series-4)', rim = shade(col, 58), gold = 'var(--sim-gold)';
  let g = `<path d="M22 6 Q30 2 38 6 L40 20 L20 20 Z" style="fill:${col};stroke:${rim};stroke-width:2;stroke-linejoin:round"/>`;
  g += `<path d="M20 20 H40 L56 58 Q30 64 4 58 Z" style="fill:${col};stroke:${rim};stroke-width:2;stroke-linejoin:round"/>`;
  g += `<path d="M7 53 Q30 59 53 53" style="fill:none;stroke:${gold};stroke-width:3.5"/>`;
  for (const [x, y] of [[22, 30], [30, 34], [38, 30], [16, 44], [30, 46], [44, 44], [26, 40], [34, 40]]) g += `<circle cx="${x}" cy="${y}" r="2.2" style="fill:${gold}"/>`;
  g += `<path d="M20 20 H40" style="fill:none;stroke:${gold};stroke-width:3"/>`;
  return `<svg viewBox="0 0 60 64" width="${f1(h * 60 / 64)}" height="${h}" aria-hidden="true">${g}</svg>`;
}
/** A stack of folded uniforms. */
function uniformsSvg(h) {
  let g = '';
  for (let i = 0; i < 3; i++) g += civicSvg('uniform', 34 + (i - 1) * 5, 66 - i * 12, { w: 54 });
  return `<svg viewBox="0 0 68 66" width="${f1(h * 68 / 66)}" height="${h}" aria-hidden="true">${g}</svg>`;
}

export class HowDialsScene extends SvgScene {
  static WIDTH = 560;
  static PORTRAIT_WIDTH = 390;
  static HEIGHT = 496;
  static PORTRAIT_HEIGHT = 624;
  static CONTINUOUS = false;
  static BEAT_STEP_MAP = MAP;
  static BEAT_MAPS = { 3: MAP };
  static CONTROLS = [];
  static ARIA_LABEL = 'A gauge with a needle between more workers on the left and more machines on the right. First, costs: costly machines and cheap, plentiful workers push the needle to the workers side; affordable machines or scarce, costly workers push it to the machines side. Second, limited technology and one designer piece push it to workers; advanced technology and thousands of the same uniform push it to machines. Third, help to buy machines pushes it to machines; labour laws also shape the choice.';

  async setup() {
    this.pick = {};
    this.from = null;
    this.fresh = true;
    await super.setup();
    this._onClick = (e) => {
      const b = e.target?.closest?.('[data-act]');
      if (b) this.act(b.dataset.act, b.dataset.val);
    };
    this.root.addEventListener('click', this._onClick);
  }

  destroy() {
    this.root?.removeEventListener('click', this._onClick);
    super.destroy();
  }

  css() { return CSS; }

  enter(step) {
    this.pick = {};
    for (const s of BEATS[step] ?? []) this.pick[s.id] = s.rest;
    this.from = null;
    this.fresh = true;
    this.after(1.4, () => { this.fresh = false; });
  }

  value() {
    let v = 0;
    for (const s of BEATS[this.stepIndex] ?? []) v += s.v[this.pick[s.id] ?? s.rest];
    return Math.max(-1, Math.min(1, v));
  }

  act(a, val) {
    if (a !== 'sw') return;
    const [id, k] = String(val).split(':');
    const s = (BEATS[this.stepIndex] ?? []).find((x) => x.id === id), i = Number(k);
    if (!s || !(i === 0 || i === 1) || this.pick[id] === i) return;
    this.from = this.value() * SWING;
    this.pick[id] = i;
    this.fresh = false;
    this.repaint();
    this.after(0.6, () => { this.from = null; });
  }

  stageHeight(st) { return st.portrait ? 600 : 472; }

  paint(st) {
    const P = st.portrait, W = st.W, s = this.stepIndex, v = this.value(), ang = v * SWING, fr = this.fresh;
    const cx = W / 2, cy = P ? 212 : 214, R = P ? Math.min(150, W / 2 - 34) : 168, band = P ? 30 : 34;
    let svg = '';
    // The dial band: workers half warm, machines half cool, darker toward each end.
    const seg = (a0, a1, col, k) => {
      const p = (a, r) => [cx + r * Math.sin(a * Math.PI / 180), cy - r * Math.cos(a * Math.PI / 180)];
      const [x0, y0] = p(a0, R), [x1, y1] = p(a1, R), [x2, y2] = p(a1, R - band), [x3, y3] = p(a0, R - band);
      return `<path d="M${f1(x0)} ${f1(y0)} A${R} ${R} 0 0 1 ${f1(x1)} ${f1(y1)} L${f1(x2)} ${f1(y2)} A${R - band} ${R - band} 0 0 0 ${f1(x3)} ${f1(y3)} Z" ${fill(`color-mix(in oklab, ${col} ${k}%, var(--sim-bg-surface))`, 'stroke:var(--sim-bg-surface);stroke-width:2')}/>`;
    };
    const steps = [[-90, -66, 92], [-66, -42, 70], [-42, -18, 50], [-18, -3, 32]];
    for (const [a0, a1, k] of steps) svg += seg(a0, a1, `var(--sim-series-${WT})`, k) + seg(-a1, -a0, `var(--sim-series-${MT})`, k);
    svg += seg(-3, 3, 'var(--sim-label-muted)', 30);
    // Ticks inside the band.
    for (let a = -80; a <= 80; a += 20) {
      const r0 = R - band - 6, r1 = R - band - (a === 0 ? 20 : 14), sn = Math.sin(a * Math.PI / 180), cs = Math.cos(a * Math.PI / 180);
      svg += `<path d="M${f1(cx + r0 * sn)} ${f1(cy - r0 * cs)} L${f1(cx + r1 * sn)} ${f1(cy - r1 * cs)}" ${stroke('var(--sim-stroke)', a === 0 ? 3 : 2)}/>`;
    }
    // The two ends: token and name; the side the needle is on lights.
    const side = v < -0.05 ? 'w' : v > 0.05 ? 'm' : null;
    const ey = cy + (P ? 34 : 36), tr = P ? 25 : 28;
    for (const k of ['w', 'm']) {
      const x = k === 'w' ? cx - R + band / 2 : cx + R - band / 2, on = side === k;
      if (on) svg += `<circle cx="${f1(x)}" cy="${f1(ey)}" r="${tr + 7}" ${fill('none', 'stroke:var(--sim-accent);stroke-width:4')}/>`;
      svg += `<g style="opacity:${side && !on ? 0.45 : 1}">${token(k, x, ey, tr)}`
        + text(x + (k === 'w' ? -4 : 4), ey + tr + (P ? 30 : 32), k === 'w' ? 'more workers' : 'more machines', P ? 19 : 22, on ? 'var(--sim-label)' : 'var(--sim-label-muted)', P ? ` text-anchor="${k === 'w' ? 'start' : 'end'}"` : '')
        .replace(/x="[^"]*"/, `x="${f1(P ? (k === 'w' ? 8 : W - 8) : x)}"`) + '</g>';
    }
    // The needle.
    const L = R - band - 18, from = this.from;
    const needle = `<path d="M-9 0 L0 ${f1(-L)} L9 0 Z" ${fill('var(--sim-label)', 'stroke:var(--sim-label);stroke-width:2;stroke-linejoin:round')}/>`
      + `<circle r="17" ${fill('var(--sim-label)')}/><circle r="7" ${fill('var(--sim-bg-surface)')}/>`;
    const swing = from != null || fr ? ` class="hd-swing" style="transform:rotate(${f1(ang)}deg);--a0:${f1(from != null ? from : 0)}deg${fr ? ';animation-delay:0.35s' : ''}"` : ` style="transform:rotate(${f1(ang)}deg)"`;
    svg += `<g transform="translate(${f1(cx)} ${f1(cy)})"><g${swing}>${needle}</g></g>`;
    // Switches (overlay).
    const sws = BEATS[s] ?? [];
    let over = '';
    if (EARLIER[s].length) over += `<div class="hd-old">${EARLIER[s].map((n) => `<span>${n}</span>`).join('')}</div>`;
    const rowY = P ? [380, 488] : [360, 434];
    const ph = P ? 42 : 46;
    sws.forEach((sw, j) => {
      const opts = sw.opts.map((o, i) => {
        const pic = sw.pics ? (sw.pics[i] === 'lehenga' ? lehengaSvg(ph) : uniformsSvg(ph)) : '';
        return `<button type="button" class="sv-hit hd-btn" data-act="sw" data-val="${sw.id}:${i}" aria-pressed="${this.pick[sw.id] === i}">${pic}<span>${o}</span></button>`;
      }).join('');
      over += `<div class="hd-sw" style="top:${rowY[j]}px"><span class="hd-name">${sw.name}</span><div class="hd-opts">${opts}</div></div>`;
    });
    if (s === 2) {
      over += `<div class="hd-law" style="top:${rowY[1] + (P ? -10 : 0)}px"><span class="hd-chip">${iconSvg('scroll', 4).replace('width="48" height="48"', 'width="30" height="30"')}labour laws</span></div>`;
    }
    return { svg, over: `<div class="${P ? 'hd-p' : 'hd-l'}">${over}</div>` };
  }

  testState() { return { step: this.stepIndex, pick: JSON.stringify(this.pick), v: +this.value().toFixed(2), side: this.value() < -0.05 ? 'workers' : this.value() > 0.05 ? 'machines' : 'middle' }; }
}
