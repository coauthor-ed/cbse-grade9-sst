/**
 * IndiaReformScene - L08 s04 "India and 1991" (3 beats). SvgScene; portrait has its own layout.
 * The hero in every beat: one big balance dial between "government" (left) and "market" (right). Where its needle
 * points is the claim of the bold line: India changed the balance, it did not leave one system for another.
 * A short time line runs along the top: after Independence, 1991, after 1991.
 *   b0 start:  needle far to the government side; "after Independence". A factory waits behind a stack of licence
 *              and permit papers (the stack builds up, sheet by sheet). Banking, transport and heavy industry as
 *              three pictures in one box tagged "public sector".
 *   b1 crisis: the 1991 marker on the time line; one plain tag "serious economic difficulties" (no numbers, no
 *              storm, no faces). The needle still on the government side; a faint dashed "reforms" chip appears.
 *   b2 reform: four reform chips land one by one (0.6 s): fewer rules, private firms, trade with the world, more
 *              competition; the permit stack shrinks to two sheets; the needle swings towards market and STOPS
 *              middle-right; "government still important" stays lit under the government end.
 * Skip / replay button inside the figure. Colours are tokens only. ASCII only.
 */
import { SvgScene, fill, stroke } from 'simulations/base/kit/SimSvg.js';
import { civicSvg } from 'simulations/base/kit/SimCivic.js';

const MAP = [[{ idx: 0, dwellMs: null }], [{ idx: 1, dwellMs: null }], [{ idx: 2, dwellMs: null }]];
const f1 = (v) => (+v).toFixed(1);
const GT = 1;   // government tone
const PT = 6;   // market tone
const P0 = 0.13;   // needle before 1991 (0 = government end, 1 = market end)
const P1 = 0.63;   // needle after the reforms: middle-right, not the market end
const SHEETS = 7, LEFT = 2;
const REFORMS = ['fewer rules', 'private firms', 'trade with the world', 'more competition'];

const CSS = `
.ir-btn { position: absolute; transform: translate(-50%, -50%); min-height: 44px; min-width: 96px; padding: 4px 14px; cursor: pointer; white-space: nowrap;
  border-radius: calc(12px * var(--look-radius, 1)); font: 800 18px/1.1 var(--sim-font); background: var(--sim-bg-surface); color: var(--sim-label);
  border: 2.5px solid var(--sim-stroke); box-shadow: 0 calc(3px * var(--look-lip, 1)) 0 var(--sim-stroke); }
.ir-btn:active { transform: translate(-50%, calc(-50% + 3px)); box-shadow: none; }
.ir-btn:focus-visible { outline: 3px solid var(--sim-accent); outline-offset: 3px; }
.ir-p .ir-btn { font-size: 16px; min-width: 86px; }
svg .ir-drop { animation: ir-drop 0.5s cubic-bezier(.3,1.4,.5,1) both; animation-delay: var(--d, 0s); }
@keyframes ir-drop { 0% { transform: translateY(-36px); opacity: 0; } 100% { transform: none; opacity: 1; } }
svg .ir-land { animation: ir-land 0.6s cubic-bezier(.3,1.4,.5,1) both; animation-delay: var(--d, 0s); }
@keyframes ir-land { 0% { transform: translateX(60px); opacity: 0; } 100% { transform: none; opacity: 1; } }
svg .ir-fade { animation: ir-fade 0.5s ease both; animation-delay: var(--d, 0s); }
@keyframes ir-fade { 0% { opacity: 0; } 100% { opacity: 1; } }
svg .ir-gone { animation: ir-gone 0.6s ease both; animation-delay: var(--d, 0s); }
@keyframes ir-gone { 0% { transform: none; opacity: 1; } 100% { transform: translate(-30px, -50px); opacity: 0; } }
svg .ir-swing { animation: ir-swing 1.2s cubic-bezier(.45,0,.3,1) both; animation-delay: var(--d, 0s); }
@keyframes ir-swing { 0% { transform: rotate(var(--a0)); } 100% { transform: rotate(var(--a1)); } }
`;

const text = (x, y, t, size, col = 'var(--sim-label)', anchor = 'middle') =>
  `<text x="${f1(x)}" y="${f1(y)}" text-anchor="${anchor}" style="fill:${col};font:800 ${size}px var(--sim-font)">${t}</text>`;

/** A pill with text, centred on (x, y). dash: a dashed outline (not yet). */
function pill(x, y, t, tn, size, o = {}) {
  const w = o.w ?? t.length * size * 0.56 + 28, h = size + 16;
  const col = `var(--sim-series-${tn})`;
  return `<rect x="${f1(x - w / 2)}" y="${f1(y - h / 2)}" width="${f1(w)}" height="${h}" rx="${h / 2}" ${fill(`color-mix(in oklab, ${col} ${o.dash ? 6 : 20}%, var(--sim-bg-surface))`, `stroke:${col};stroke-width:2.5${o.dash ? ';stroke-dasharray:7 6' : ''}`)}/>`
    + text(x, y + size * 0.36, t, size);
}

/** One licence / permit paper, top-left (x, y), w wide. */
function paper(x, y, w) {
  const h = w * 0.72, col = `var(--sim-series-${GT})`;
  return `<rect x="${f1(x)}" y="${f1(y)}" width="${f1(w)}" height="${f1(h)}" rx="3" ${fill('var(--sim-bg-surface)', 'stroke:var(--sim-stroke);stroke-width:2')}/>`
    + `<rect x="${f1(x + w * 0.12)}" y="${f1(y + h * 0.22)}" width="${f1(w * 0.5)}" height="3" rx="1.5" ${fill('var(--sim-label-muted)')}/>`
    + `<rect x="${f1(x + w * 0.12)}" y="${f1(y + h * 0.45)}" width="${f1(w * 0.4)}" height="3" rx="1.5" ${fill('var(--sim-label-muted)')}/>`
    + `<circle cx="${f1(x + w * 0.78)}" cy="${f1(y + h * 0.66)}" r="${f1(w * 0.11)}" ${fill(`color-mix(in oklab, ${col} 30%, var(--sim-bg-surface))`, `stroke:${col};stroke-width:2`)}/>`;
}

export class IndiaReformScene extends SvgScene {
  static WIDTH = 560;
  static PORTRAIT_WIDTH = 390;
  static HEIGHT = 508;
  static PORTRAIT_HEIGHT = 624;
  static CONTINUOUS = false;
  static BEAT_STEP_MAP = MAP;
  static BEAT_MAPS = { 3: MAP };
  static CONTROLS = [];
  static ARIA_LABEL = 'A balance dial between government on the left and market on the right. Step 1, after Independence: the needle points far to the government side. A factory waits behind a stack of licences and permits. Banking, transport and heavy industry are in the public sector. Step 2, 1991: serious economic difficulties; the needle is still on the government side and reforms begin. Step 3: four reforms land: fewer rules, private firms, trade with the world, more competition. The permit stack shrinks. The needle moves towards market and stops a little right of the middle. The government is still important.';

  async setup() {
    this.fresh = true;
    await super.setup();
    this._onClick = (e) => {
      const b = e.target?.closest?.('[data-act]');
      if (!b || b.dataset.act !== 'replay') return;
      if (this.fresh) { this.fresh = false; this._gen++; this.repaint(); return; }
      this.enter(this.stepIndex); this.repaint();
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
    this._gen = (this._gen ?? 0) + 1;
    const g = this._gen;
    this.after(step === 2 ? 4.4 : 2.4, () => { if (g === this._gen && this.fresh) { this.fresh = false; this.repaint(); } });
  }

  stageHeight(st) { return st.portrait ? 600 : 484; }

  anim(cls, d) { return this.fresh ? ` class="${cls}" style="--d:${f1(d)}s"` : ''; }

  /** The balance dial. D: { cx, cy, r, band, ls }. */
  dial(D, step) {
    const { cx, cy, r, band } = D;
    const pt = (deg, rr) => [cx + rr * Math.cos((deg * Math.PI) / 180), cy - rr * Math.sin((deg * Math.PI) / 180)];
    const arcD = (a0, a1, rr) => { const p = pt(a0, rr), q = pt(a1, rr); return `M${f1(p[0])} ${f1(p[1])}A${rr} ${rr} 0 0 1 ${f1(q[0])} ${f1(q[1])}`; };
    let s = '';
    s += `<path d="${arcD(180, 91.5, r)}" style="fill:none;stroke:color-mix(in oklab, var(--sim-series-${GT}) 70%, var(--sim-bg-surface));stroke-width:${band};stroke-linecap:butt"/>`;
    s += `<path d="${arcD(88.5, 0, r)}" style="fill:none;stroke:color-mix(in oklab, var(--sim-series-${PT}) 70%, var(--sim-bg-surface));stroke-width:${band};stroke-linecap:butt"/>`;
    // the middle mark
    const m0 = pt(90, r + band / 2 + 4), m1 = pt(90, r + band / 2 + 16);
    s += `<path d="M${f1(m0[0])} ${f1(m0[1])}L${f1(m1[0])} ${f1(m1[1])}" ${stroke('var(--sim-label-muted)', 3)}/>`;
    // end labels
    const gl = pt(180, r), ml = pt(0, r);
    s += text(D.gx ?? gl[0], gl[1] + band / 2 + D.ls + 8, 'government', D.ls, `var(--sim-series-${GT})`, D.ga ?? 'middle');
    s += text(D.mx ?? ml[0], ml[1] + band / 2 + D.ls + 8, 'market', D.ls, `var(--sim-series-${PT})`, D.ma ?? 'middle');
    if (step === 2) {
      s += `<g${this.anim('ir-fade', 3.9)}>${text(D.gx ?? gl[0], gl[1] + band / 2 + D.ls * 2 + 14, 'still important', D.ls - 1, `var(--sim-series-${GT})`, D.ga ?? 'middle')}</g>`;
    }
    // the needle: drawn pointing right, turned by CSS
    const len = r - band / 2 - 8;
    const rot = (p) => -(180 - 180 * p);
    const needle = `<path d="M${f1(cx - 14)} ${f1(cy)}L${f1(cx)} ${f1(cy - 9)}L${f1(cx + len)} ${f1(cy)}L${f1(cx)} ${f1(cy + 9)}Z" ${fill('var(--sim-label)')}/>`;
    const base = `transform-box:view-box;transform-origin:${f1(cx)}px ${f1(cy)}px`;
    if (step === 2 && this.fresh) {
      s += `<g class="ir-swing" style="${base};--a0:${rot(P0)}deg;--a1:${rot(P1)}deg;--d:2.6s">${needle}</g>`;
    } else {
      s += `<g style="${base};transform:rotate(${rot(step === 2 ? P1 : P0)}deg)">${needle}</g>`;
    }
    s += `<circle cx="${f1(cx)}" cy="${f1(cy)}" r="15" ${fill('var(--sim-bg-surface)', 'stroke:var(--sim-label);stroke-width:5')}/>`;
    return s;
  }

  /** The time line along the top: T: { y, x0, x1, ls }. */
  timeline(T, step) {
    const { y, x0, x1 } = T, xs = [x0 + 8, x0 + (x1 - x0) * 0.62, x1 - 8];
    const names = ['after Independence', '1991', 'after 1991'];
    let s = `<path d="M${f1(x0)} ${f1(y)}H${f1(x1)}" ${stroke('color-mix(in srgb, var(--sim-label) 30%, transparent)', 4)}/>`;
    names.forEach((n, i) => {
      if (i > step) return;
      const on = i === step, anc = i === 0 ? 'start' : i === 2 ? 'end' : 'middle';
      const col = on ? 'var(--sim-label)' : 'var(--sim-label-muted)';
      s += `<g${on ? this.anim('ir-fade', 0.1) : ''}><circle cx="${f1(xs[i])}" cy="${f1(y)}" r="${on ? 9 : 6}" ${fill(on ? 'var(--sim-accent)' : 'var(--sim-label-muted)')}/>`
        + (step === 2 && i === 1 ? '' : text(i === 0 ? xs[i] - 8 : i === 2 ? xs[i] + 8 : xs[i], y - 16, n, on ? T.ls : T.ls - 2, col, anc)) + '</g>';
    });
    if (step === 2) s += text(xs[1], y - 16, '1991', T.ls - 2, 'var(--sim-label-muted)');
    return s;
  }

  /** The factory behind the permit stack. F: { x, g, fw, pw, sx } (factory centre x, ground, widths, stack left x). */
  permits(F, step) {
    let s = civicSvg('factory', F.x, F.g, { w: F.fw });
    const ph = F.pw * 0.72, n = step === 2 ? SHEETS : SHEETS;
    for (let i = 0; i < n; i++) {
      const y = F.g - ph - 4 - i * (ph * 0.3), x = F.sx + (i % 2 ? 3 : -2);
      let cls = '';
      if (step === 0 && this.fresh) cls = ` class="ir-drop" style="--d:${f1(0.2 + i * 0.12)}s"`;
      if (step === 2 && i >= LEFT) {
        if (!this.fresh) continue;
        cls = ` class="ir-gone" style="--d:${f1(0.5 + (SHEETS - 1 - i) * 0.08)}s"`;
      }
      s += `<g${cls}>${paper(x, y, F.pw)}</g>`;
    }
    return s;
  }

  paint(st) {
    const P = st.portrait, W = st.W, step = this.stepIndex;
    let svg = '', over = '';
    const ls = P ? 17 : 19;
    let D, T, F, btn;
    if (!P) {
      T = { y: 42, x0: 20, x1: W - 20, ls };
      D = { cx: W / 2, cy: 216, r: 136, band: 28, ls };
      F = { x: W * 0.3, g: 438, fw: 150, pw: 52, sx: W * 0.3 - 112 };
      btn = [W - 54, 120];
    } else {
      T = { y: 38, x0: 10, x1: W - 10, ls: 16 };
      D = { cx: W / 2, cy: 200, r: 122, band: 26, ls: 17, gx: 6, ga: 'start', mx: W - 6, ma: 'end' };
      F = { x: W * 0.62, g: 378, fw: 150, pw: 48, sx: W * 0.62 - 128 };
      btn = [W / 2, 576];
    }
    svg += this.timeline(T, step);
    svg += this.dial(D, step);
    if (step === 0) {
      svg += `<g${this.anim('ir-fade', 0.1)}>${this.permits(F, 0)}</g>`;
      svg += `<g${this.anim('ir-fade', 1.0)}>${text((F.sx + F.x) / 2 + 10, F.g + (P ? 24 : 28), 'licences and permits', P ? 16 : 18)}</g>`;
      svg += this.publicBox(P, W);
    } else if (step === 1) {
      svg += `<g opacity="0.25">${this.permits(F, 1)}</g>`;
      const y = P ? 316 : 324;
      svg += `<g${this.anim('ir-drop', 0.5)}>${pill(W / 2, y, 'serious economic difficulties', 3, P ? 18 : 21)}</g>`;
      const ry = P ? 400 : 404, rx = P ? W / 2 : W * 0.66;
      svg += `<g${this.anim('ir-fade', 1.3)} opacity="0.6">${pill(rx, ry, 'reforms', PT, ls, { dash: true })}<path d="M${f1(rx + 56)} ${f1(ry)}h34m-10 -9l10 9l-10 9" ${stroke(`var(--sim-series-${PT})`, 3.5)}/></g>`;
    } else {
      svg += this.permits(F, 2);
      REFORMS.forEach((t, i) => {
        let x, y, w;
        if (!P) { x = W * 0.72; y = 324 + i * 42; w = 222; } else { x = i % 2 ? W * 0.75 : W * 0.25; y = 446 + Math.floor(i / 2) * 54; w = W / 2 - 10; }
        const two = P && t.length > 14;
        const body = two ? this.twoLine(x, y, t, ls, w) : pill(x, y, t, PT, P ? 16 : 18, { w });
        svg += `<g${this.anim('ir-land', 0.3 + i * 0.6)}>${body}</g>`;
      });
    }
    over += `<button type="button" class="sv-hit ir-btn" data-act="replay" style="left:${f1(btn[0])}px;top:${f1(btn[1])}px">${this.fresh ? 'skip' : 'replay'}</button>`;
    return { svg, over: `<div class="${P ? 'ir-p' : 'ir-l'}">${over}</div>` };
  }

  /** A reform chip on two lines (portrait). */
  twoLine(x, y, t, size, w) {
    const words = t.split(' '), cut = Math.ceil(words.length / 2);
    const a = words.slice(0, cut).join(' '), b = words.slice(cut).join(' '), h = 2 * 18 + 12;
    const col = `var(--sim-series-${PT})`;
    return `<rect x="${f1(x - w / 2)}" y="${f1(y - h / 2)}" width="${f1(w)}" height="${h}" rx="14" ${fill(`color-mix(in oklab, ${col} 20%, var(--sim-bg-surface))`, `stroke:${col};stroke-width:2.5`)}/>`
      + text(x, y - 3, a, 16) + text(x, y + 16, b, 16);
  }

  /** Banking, transport, heavy industry in one "public sector" box. */
  publicBox(P, W) {
    const kinds = [['bank', 'banking'], ['truck', 'transport'], ['factory', 'heavy industry']];
    const box = P ? { x: 8, y: 436, w: W - 16, h: 108 } : { x: W * 0.5, y: 300, w: W * 0.5, h: 176 };
    const col = `var(--sim-series-${GT})`;
    let s = `<g${this.anim('ir-fade', 1.0)}><rect x="${f1(box.x)}" y="${f1(box.y)}" width="${f1(box.w)}" height="${f1(box.h)}" rx="16" ${fill(`color-mix(in oklab, ${col} 8%, var(--sim-bg-surface))`, `stroke:${col};stroke-width:2.5`)}/>`;
    s += pill(box.x + box.w / 2, box.y, 'public sector', GT, P ? 16 : 18) + '</g>';
    const cw = box.w / 3, gy = box.y + box.h - (P ? 30 : 48);
    kinds.forEach(([k, name], i) => {
      const cx = box.x + cw * (i + 0.5), w = Math.min(cw - 14, P ? 92 : 82);
      s += `<g${this.anim('ir-drop', 1.3 + i * 0.5)}>${civicSvg(k, cx, gy, { w })}`;
      if (!P && name === 'heavy industry') s += text(cx, gy + 21, 'heavy', 18) + text(cx, gy + 43, 'industry', 18);
      else s += text(cx, gy + 22, name, P ? 15 : 18);
      s += '</g>';
    });
    return s;
  }

  testState() { return { step: this.stepIndex, fresh: this.fresh, needle: this.stepIndex === 2 ? P1 : P0 }; }
}
