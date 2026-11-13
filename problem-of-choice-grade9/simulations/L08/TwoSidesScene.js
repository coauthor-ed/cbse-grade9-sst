/**
 * TwoSidesScene - L08 s03 "Two Sides" (2 beats). SvgScene; portrait has its own layout. Fig 8.8 drawn as one
 * market place with two sides: the government side (left / top) and the market side (right / bottom), and one
 * shared street (the market) between them (portrait) or below them (landscape).
 *   b0 govt:   the government side lit: the government building (title row) and its five jobs, each a picture
 *              with a short label, appearing one by one (0.5 s): fair rules (scales), protect consumers (a checked
 *              weight), honest information (a report), public goods (street light and road), welfare (a crowd
 *              helped). Tap a job to pulse it. The market side is dim.
 *   b1 market: the market side lit: profit (a shop and a coin), compete (two shops side by side), new ideas (a
 *              bulb), one by one. Then on the shared street a public sector company and a private firm sell side by
 *              side, buyers go to both ("compete"), and a "rules" line runs from the government to the private firm.
 *              Both sides end lit.
 * A skip / replay button sits inside the figure. Colours are tokens only. ASCII only.
 */
import { SvgScene, fill, stroke } from 'simulations/base/kit/SimSvg.js';
import { iconSvg } from 'simulations/base/kit/SimIcons.js';
import { civicSvg } from 'simulations/base/kit/SimCivic.js';

const MAP = [[{ idx: 0, dwellMs: null }], [{ idx: 1, dwellMs: null }]];
const f1 = (v) => (+v).toFixed(1);
const GT = 1;   // government tone
const PT = 6;   // market (private) tone

const GOV = [
  { id: 'rules', l: ['fair', 'rules'], art: 'scales' },
  { id: 'consumer', l: ['protect', 'consumers'], art: 'weight' },
  { id: 'honest', l: ['honest', 'information'], art: 'report' },
  { id: 'goods', l: ['public', 'goods'], art: 'goods' },
  { id: 'welfare', l: ['welfare', ''], art: 'welfare' },
];
const MKT = [
  { id: 'profit', l: 'profit', art: 'profit' },
  { id: 'compete', l: 'compete', art: 'compete' },
  { id: 'ideas', l: 'new ideas', art: 'bulb' },
];

const CSS = `
.ts-tile { position: absolute; background: transparent; border: 0; padding: 0; cursor: pointer; border-radius: 14px; }
.ts-tile:focus-visible { outline: 3px solid var(--sim-accent); outline-offset: 2px; }
.ts-btn { position: absolute; transform: translate(-50%, -50%); min-height: 44px; min-width: 96px; padding: 4px 14px; cursor: pointer; white-space: nowrap;
  border-radius: calc(12px * var(--look-radius, 1)); font: 800 18px/1.1 var(--sim-font); background: var(--sim-bg-surface); color: var(--sim-label);
  border: 2.5px solid var(--sim-stroke); box-shadow: 0 calc(3px * var(--look-lip, 1)) 0 var(--sim-stroke); }
.ts-btn:active { transform: translate(-50%, calc(-50% + 3px)); box-shadow: none; }
.ts-btn:focus-visible { outline: 3px solid var(--sim-accent); outline-offset: 3px; }
.ts-p .ts-btn { font-size: 16px; min-width: 86px; }
svg .ts-pop { transform-box: fill-box; transform-origin: center; animation: ts-pop 0.5s cubic-bezier(.3,1.4,.5,1) both; animation-delay: var(--d, 0s); }
@keyframes ts-pop { 0% { transform: scale(0.4); opacity: 0; } 100% { transform: none; opacity: 1; } }
svg .ts-fade { animation: ts-fade 0.5s ease both; animation-delay: var(--d, 0s); }
@keyframes ts-fade { 0% { opacity: 0; } 100% { opacity: 1; } }
svg .ts-pulse { transform-box: fill-box; transform-origin: center; animation: ts-pulse 0.7s ease both; }
@keyframes ts-pulse { 0% { transform: none; } 40% { transform: scale(1.1); } 100% { transform: none; } }
svg .ts-line { stroke-dasharray: 9 8; animation: ts-march 0.9s linear 4; }
@keyframes ts-march { to { stroke-dashoffset: -17; } }
`;

const text = (x, y, t, size, col = 'var(--sim-label)', anchor = 'middle') =>
  `<text x="${f1(x)}" y="${f1(y)}" text-anchor="${anchor}" style="fill:${col};font:800 ${size}px var(--sim-font)">${t}</text>`;

function icon(name, cx, cy, size, tn) {
  const inner = (iconSvg(name, tn).match(/<svg[^>]*>([\s\S]*)<\/svg>/) || [])[1] || '';
  return `<g transform="translate(${f1(cx - size / 2)} ${f1(cy - size / 2)}) scale(${(size / 48).toFixed(3)})" style="--i:var(--sim-series-${tn})">${inner}</g>`;
}

/** A tag pill in a tone, centred on (x, y). */
function tag(x, y, t, tn, size = 18) {
  const w = t.length * size * 0.56 + 24, h = size + 14;
  return `<rect x="${f1(x - w / 2)}" y="${f1(y - h / 2)}" width="${f1(w)}" height="${h}" rx="${h / 2}" ${fill(`color-mix(in oklab, var(--sim-series-${tn}) 20%, var(--sim-bg-surface))`, `stroke:var(--sim-series-${tn});stroke-width:2.5`)}/>`
    + text(x, y + size * 0.36, t, size);
}

/** The picture for one job, centred on (cx, cy), about s wide. */
function art(kind, cx, cy, s) {
  const k = s / 48, T = `var(--sim-series-${GT})`;
  switch (kind) {
    case 'weight': {
      // a shop scale with a checked weight: the buyer gets the right amount
      return icon('scales', cx - 6 * k, cy, s * 0.92, 4) + `<circle cx="${f1(cx + 15 * k)}" cy="${f1(cy - 14 * k)}" r="${f1(10 * k)}" ${fill('var(--sim-bg-surface)', `stroke:${T};stroke-width:2.5`)}/>`
        + `<path d="M${f1(cx + 10 * k)} ${f1(cy - 14 * k)}l${f1(4 * k)} ${f1(4 * k)}l${f1(7 * k)} ${f1(-8 * k)}" ${stroke(T, 3)}/>`;
    }
    case 'report': return civicSvg('report', cx, cy + s * 0.5, { h: s });
    case 'goods': return icon('road', cx + 9 * k, cy + 4 * k, s * 0.8, 5) + icon('lamp', cx - 13 * k, cy - 4 * k, s * 0.7, 2);
    case 'welfare': return icon('crowd', cx, cy + 3 * k, s * 0.92, 7) + `<path d="M${f1(cx - 22 * k)} ${f1(cy - 20 * k)}h${f1(44 * k)}" ${stroke(T, 4)}/><path d="M${f1(cx)} ${f1(cy - 28 * k)}v${f1(16 * k)}" ${stroke(T, 4)}/>`;
    case 'profit': return icon('shop', cx - 8 * k, cy + 2 * k, s * 0.86, PT) + icon('coin', cx + 15 * k, cy - 12 * k, s * 0.5, 2);
    case 'compete': return icon('shop', cx - 13 * k, cy, s * 0.7, PT) + icon('shop', cx + 13 * k, cy, s * 0.7, 3);
    case 'bulb': return icon('bulb', cx, cy, s * 0.9, 2);
    default: return icon(kind, cx, cy, s * 0.9, GT);
  }
}

export class TwoSidesScene extends SvgScene {
  static WIDTH = 560;
  static PORTRAIT_WIDTH = 390;
  static HEIGHT = 508;
  static PORTRAIT_HEIGHT = 624;
  static CONTINUOUS = false;
  static BEAT_STEP_MAP = MAP;
  static BEAT_MAPS = { 2: MAP };
  static CONTROLS = [];
  static ARIA_LABEL = 'One market place with two sides. Step 1: the government side. The government building and its five jobs: fair rules, protect consumers, honest information, public goods such as roads and street lights, and welfare. The market side is dim. Tap a job to light it. Step 2: the market side. Businesses work for profit, compete with each other, and competition brings new ideas. On one street a public sector company and a private firm sell side by side and both get buyers. A rules line runs from the government to the private firm. Both sides stay lit.';

  async setup() {
    this.fresh = true;
    this.pulse = null;
    await super.setup();
    this._onClick = (e) => {
      const b = e.target?.closest?.('[data-act]');
      if (!b) return;
      if (b.dataset.act === 'tile') { this.pulse = b.dataset.val; this.fresh = false; this.repaint(); }
      else if (b.dataset.act === 'replay') {
        if (this.fresh) { this.fresh = false; this.repaint(); return; }
        this.enter(this.stepIndex); this.repaint();
      }
    };
    this.root.addEventListener('click', this._onClick);
  }

  destroy() {
    this.root?.removeEventListener('click', this._onClick);
    super.destroy();
  }

  css() { return CSS; }

  enter(step) {
    this.fresh = true;
    this.pulse = null;
    this._gen = (this._gen ?? 0) + 1;
    const g = this._gen;
    this.after(step === 1 ? 4.0 : 3.0, () => { if (g === this._gen && this.fresh) { this.fresh = false; this.repaint(); } });
  }

  stageHeight(st) { return st.portrait ? 600 : 484; }

  anim(cls, d) { return this.fresh ? ` class="${cls}" style="--d:${f1(d)}s"` : ''; }

  /** One job tile: box (x, y, w, h), picture on top, label below. lit: false = dim. */
  tile(j, x, y, w, h, lit, d, ts, lines, tn) {
    const cx = x + w / 2, pulse = this.pulse === j.id;
    const op = lit ? '' : ' opacity="0.28"';
    const a = this.fresh && lit && d != null ? ` class="ts-pop" style="--d:${f1(d)}s"` : pulse ? ' class="ts-pulse"' : '';
    let s = `<g${op}><g${a}>`;
    s += `<rect x="${f1(x)}" y="${f1(y)}" width="${f1(w)}" height="${f1(h)}" rx="14" ${fill(`color-mix(in oklab, var(--sim-series-${tn}) ${pulse ? 26 : 9}%, var(--sim-bg-surface))`, `stroke:${pulse ? 'var(--sim-accent)' : `var(--sim-series-${tn})`};stroke-width:${pulse ? 4 : 2.5}`)}/>`;
    const ls = lines.filter(Boolean), lh = ts + 5, base = y + h - 11, top = base - (ls.length - 1) * lh - ts;
    const room = top - y - 8, sz = Math.min(w * 0.66, room * 1.02);
    s += art(j.art, cx, y + 5 + room / 2, sz);
    ls.forEach((t, i) => { s += text(cx, base - (ls.length - 1 - i) * lh, t, ts); });
    return s + '</g></g>';
  }

  /** The shared street (the market): a public sector company and a private firm, buyers between them, rules. */
  street(L, step) {
    const g = L.g, col = `var(--sim-series-${GT})`, on = step === 1, d0 = 1.7;
    const dim = on ? '' : ' opacity="0.28"';
    let svg = `<rect x="0" y="${g}" width="${f1(L.W)}" height="5" rx="2" ${fill('color-mix(in srgb, var(--sim-label) 22%, transparent)')}/>`;
    svg += `<g${dim}>`;
    svg += `<g${on ? this.anim('ts-pop', d0) : ''}>${civicSvg('factory', L.ax, g, { w: L.fw })}${tag(L.ax, g + L.tg, 'public sector', GT, L.ts)}</g>`;
    svg += `<g${on ? this.anim('ts-pop', d0 + 0.5) : ''}>${civicSvg('factory', L.bx, g, { w: L.fw })}${tag(L.bx, g + L.tg, 'private firm', PT, L.ts)}</g>`;
    // buyers in the middle, going to both doors: the two compete for them
    const cx = (L.ax + L.bx) / 2, cy = g - L.cs * 0.5 - 2, ah = 9;
    const xl = L.ax + L.fw * 0.5 + 6, xr = L.bx - L.fw * 0.5 - 6, ay = g - L.cs * 0.42;
    svg += `<g${on ? this.anim('ts-fade', d0 + 1.0) : ''}>${icon('crowd', cx, cy, L.cs, 7)}`
      + `<path d="M${f1(cx - L.cs * 0.55)} ${f1(ay)}H${f1(xl)}M${f1(xl + ah)} ${f1(ay - ah)}L${f1(xl)} ${f1(ay)}L${f1(xl + ah)} ${f1(ay + ah)}" ${stroke('var(--sim-accent)', 4)}/>`
      + `<path d="M${f1(cx + L.cs * 0.55)} ${f1(ay)}H${f1(xr)}M${f1(xr - ah)} ${f1(ay - ah)}L${f1(xr)} ${f1(ay)}L${f1(xr - ah)} ${f1(ay + ah)}" ${stroke('var(--sim-accent)', 4)}/>`
      + text(cx, cy - L.cs * 0.5 - 12, 'compete', L.ts, 'var(--sim-accent)') + '</g>';
    svg += '</g>';
    if (!on) return svg;
    // rules: from the government side down to the private firm
    const r0 = L.r0, r1 = [L.bx - L.fw * 0.12, g - L.fw * 0.69 - 10];
    const qx = r1[0] - 10, qy = r0[1] + 6;
    const ang = Math.atan2(r1[1] - qy, r1[0] - qx), k = 13;
    svg += `<g${this.anim('ts-fade', d0 + 1.5)}><path class="ts-line" d="M${f1(r0[0])} ${f1(r0[1])}Q${f1(qx)} ${f1(qy)} ${f1(r1[0])} ${f1(r1[1])}" style="fill:none;stroke:${col};stroke-width:4;stroke-linecap:round"/>`
      + `<path d="M${f1(r1[0] - k * Math.cos(ang - 0.5))} ${f1(r1[1] - k * Math.sin(ang - 0.5))}L${f1(r1[0])} ${f1(r1[1])}L${f1(r1[0] - k * Math.cos(ang + 0.5))} ${f1(r1[1] - k * Math.sin(ang + 0.5))}" ${stroke(col, 4)}/>`
      + text(L.rl[0], L.rl[1], 'rules', L.ts, col, L.rl[2]) + '</g>';
    return svg;
  }

  paint(st) {
    const P = st.portrait, W = st.W, step = this.stepIndex;
    let svg = '', over = '';
    const hit = (id, x, y, w, h, label) => `<button type="button" class="sv-hit ts-tile" data-act="tile" data-val="${id}" aria-label="${label}" style="left:${f1(x)}px;top:${f1(y)}px;width:${f1(w)}px;height:${f1(h)}px"></button>`;
    const mktLit = step === 1;
    let G, Mk, L, titles, btn;
    if (!P) {
      const gw = W * 0.645, tw = (gw - 8) / 3, th = 100;
      G = GOV.map((j, i) => (i < 3 ? [i * (tw + 4), 44, tw, th] : [gw / 2 - tw - 2 + (i - 3) * (tw + 4), 44 + th + 6, tw, th]));
      const mx = gw + 12, mw = W - mx;
      Mk = MKT.map((j, i) => [mx, 44 + i * 70, mw, 64]);
      titles = [[gw / 2, 24], [mx + mw / 2, 24]];
      L = { W, g: 414, tg: 28, ts: 18, ax: W * 0.2, bx: W * 0.8, fw: 150, cs: 50, r0: [gw / 2 + tw * 0.6, 254], rl: [gw / 2 + tw * 0.6 + 14, 286, 'start'] };
      btn = [W / 2, 466];
    } else {
      const tw = (W - 8) / 3, th = 94;
      G = GOV.map((j, i) => (i < 3 ? [i * (tw + 4), 30, tw, th] : [W / 2 - tw - 2 + (i - 3) * (tw + 4), 30 + th + 6, tw, th]));
      Mk = MKT.map((j, i) => [i * (tw + 4), 468, tw, 82]);
      titles = [[W / 2, 14], [W / 2, 452]];
      L = { W, g: 384, tg: 24, ts: 16, ax: W * 0.2, bx: W * 0.8, fw: 128, cs: 42, r0: [W / 2 + tw * 0.55, 230], rl: [W / 2 + tw * 0.55 - 12, 262, 'end'] };
      btn = [W / 2, 578];
    }
    const ts = P ? 16 : 18, tsMk = P ? 16 : 19, tz = P ? 18 : 20;
    const t0 = 'government side', t1 = 'market side';
    svg += civicSvg('office', titles[0][0] - t0.length * tz * 0.29 - 26, titles[0][1] + 12, { w: 40 }) + text(titles[0][0] + 6, titles[0][1] + 6, t0, tz, `var(--sim-series-${GT})`);
    svg += `<g${mktLit ? '' : ' opacity="0.3"'}>${icon('shop', titles[1][0] - t1.length * tz * 0.29 - 22, titles[1][1], 34, PT)}${text(titles[1][0] + 6, titles[1][1] + 6, t1, tz, `var(--sim-series-${PT})`)}</g>`;
    GOV.forEach((j, i) => {
      const [x, y, w, h] = G[i];
      svg += this.tile(j, x, y, w, h, true, step === 0 ? 0.3 + i * 0.5 : null, ts, j.l, GT);
      over += hit(j.id, x, y, w, h, j.l.join(' ').trim());
    });
    MKT.forEach((j, i) => {
      const [x, y, w, h] = Mk[i];
      if (!P) {
        // a wide row tile: picture left, label right
        const pulse = this.pulse === j.id, a = this.fresh && mktLit ? ` class="ts-pop" style="--d:${f1(0.2 + i * 0.5)}s"` : pulse ? ' class="ts-pulse"' : '';
        svg += `<g${mktLit ? '' : ' opacity="0.28"'}><g${a}><rect x="${f1(x)}" y="${f1(y)}" width="${f1(w)}" height="${f1(h)}" rx="14" ${fill(`color-mix(in oklab, var(--sim-series-${PT}) ${pulse ? 26 : 9}%, var(--sim-bg-surface))`, `stroke:${pulse ? 'var(--sim-accent)' : `var(--sim-series-${PT})`};stroke-width:${pulse ? 4 : 2.5}`)}/>`
          + art(j.art, x + 38, y + h / 2, 54) + text(x + 74, y + h / 2 + 7, j.l, tsMk, 'var(--sim-label)', 'start') + '</g></g>';
      } else {
        svg += this.tile(j, x, y, w, h, mktLit, mktLit ? 0.2 + i * 0.5 : null, tsMk, [j.l], PT);
      }
      if (mktLit) over += hit(j.id, x, y, w, h, j.l);
    });
    svg += this.street(L, step);
    over += `<button type="button" class="sv-hit ts-btn" data-act="replay" style="left:${f1(btn[0])}px;top:${f1(btn[1])}px">${this.fresh ? 'skip' : 'replay'}</button>`;
    return { svg, over: `<div class="${P ? 'ts-p' : 'ts-l'}">${over}</div>` };
  }

  testState() { return { step: this.stepIndex, fresh: this.fresh, pulse: this.pulse }; }
}
