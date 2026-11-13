/**
 * StripOrderScene - L03 s05 "Why the Sacrifices Grow" (2 beats). The farm world: one plot of 4 strips
 * (1 dry, 2 sandy, 3 loam, 4 rich); barley 25 kg on any strip; wheat 10, 20, 30, 40 kg on strips 1-4.
 *   b0 pattern: four step bars, one per extra 25 kg of barley: "wheat given up" 10, 20, 30, 40 kg. Each row starts
 *               with a "+25 kg" barley pill; the bars grow one after another (0.5 s apart). A question tag sits in
 *               the empty corner the staircase leaves: "why more each time?".
 *   b1 why:     the 4 strips, each on the row of its step bar. Strip 1 is captioned "dry", strip 4 "best for
 *               wheat"; wheat grows a little shorter on the poorer strips. The farmer switches strips to barley in
 *               the order 1, 2, 3, 4 (0.8 s each, Skip): the strip regrows as barley, its bar fills from the dashed
 *               outline of the wheat it grew, and on the small PPC below the point steps A, B, C, D, E along the
 *               outward bow. Rest (cold start): all four switched, the point at E, the whole path drawn.
 *               Controls: "Start again" (back to A, all wheat) and "switch next strip", one strip a tap.
 * Drawn in stage px (st.W wide). Colours are tokens only. ASCII only.
 */
import { SvgScene, fill, chip } from 'simulations/base/kit/SimSvg.js';
import { farmSpec, farmSvg, cropTone } from 'simulations/base/kit/SimFarm.js';

const MAP = [[{ idx: 0, dwellMs: null }], [{ idx: 1, dwellMs: null }]];
const WHEAT = [10, 20, 30, 40];
const SOILS = ['dry', 'sandy', 'loam', 'rich'];
const PTS = [['A', 0, 100], ['B', 25, 90], ['C', 50, 70], ['D', 75, 40], ['E', 100, 0]];
const STEP_S = 0.8, FIRST_S = 0.6, GROW_S = 0.9;
const WHEAT_GROW = [0.86, 0.92, 0.97, 1];   // wheat a little shorter on the poorer strips
const wheatAt = (b) => 100 - 0.2 * b - 0.008 * b * b;   // passes through A to E exactly
const f1 = (v) => (+v).toFixed(1);

const CSS = `
.so-btn { position: absolute; transform: translate(-50%, -50%); min-height: 44px; padding: 6px 16px; cursor: pointer; white-space: nowrap;
  border-radius: calc(12px * var(--look-radius, 1)); font: 800 18px/1.1 var(--sim-font); background: var(--sim-bg-surface); color: var(--sim-label);
  border: 2.5px solid var(--sim-stroke); box-shadow: 0 calc(3px * var(--look-lip, 1)) 0 var(--sim-stroke); }
.so-btn--go { background: var(--primary-color, var(--sim-accent)); color: var(--on-primary, var(--sim-ink-on-accent, var(--sim-bg-deep))); border-color: transparent;
  box-shadow: 0 calc(4px * var(--look-lip, 1)) 0 var(--primary-hover, color-mix(in oklab, var(--sim-accent) 55%, var(--sim-stroke))); }
.so-btn:active { transform: translate(-50%, calc(-50% + 3px)); box-shadow: none; }
.so-btn:focus-visible { outline: 3px solid var(--sim-accent); outline-offset: 3px; }
.so-read { position: absolute; transform: translate(-50%, -50%); display: flex; flex-direction: column; align-items: center; white-space: nowrap; font: 800 18px/1.3 var(--sim-font); color: var(--sim-label); }
.so-read b { font-size: 26px; color: var(--sim-accent); line-height: 1.15; margin-bottom: 6px; }
.so-read--row { display: grid; grid-template-columns: auto auto; column-gap: 12px; align-items: center; justify-items: start; }
.so-read--row b { grid-row: 1 / 3; font-size: 34px; margin: 0; }
svg .so-bar { transform-box: fill-box; transform-origin: left center; animation: so-bar 0.5s ease-out both; animation-delay: var(--d, 0s); }
@keyframes so-bar { from { transform: scaleX(0); } to { transform: none; } }
svg .so-pop { transform-box: fill-box; transform-origin: center; animation: so-pop 0.4s ease-out both; animation-delay: var(--d, 0s); }
@keyframes so-pop { 0% { transform: scale(0.4); opacity: 0; } 100% { transform: none; opacity: 1; } }
`;

function growOnly(svg, i) {
  let n = -1;
  return svg.replace(/class="sf-plants"/g, (m) => { n += 1; return n === i ? 'class="sf-plants sv-grow"' : m; });
}

const txt = (x, y, s, size, o = {}) => `<text x="${f1(x)}" y="${f1(y)}" text-anchor="${o.anchor ?? 'start'}" style="fill:${o.col ?? 'var(--sim-label)'};font:${o.w ?? 800} ${size}px var(--sim-font)${o.op != null ? `;opacity:${o.op}` : ''}">${s}</text>`;

export class StripOrderScene extends SvgScene {
  static WIDTH = 560;
  static PORTRAIT_WIDTH = 390;
  static HEIGHT = 480;   // the host budgets the panel from this: scale = about 465 / HEIGHT at 1280x720, so it sits above the content height on purpose
  static PORTRAIT_HEIGHT = 626;
  static CONTINUOUS = false;
  static BEAT_STEP_MAP = MAP;
  static BEAT_MAPS = { 2: MAP };
  static CONTROLS = [];
  static ARIA_LABEL = 'Four step bars: each extra 25 kg of barley costs 10, then 20, then 30, then 40 kg of wheat. Then the made-up reason: the 4 strips differ. Strip 1 is dry and grows only 10 kg of wheat, so the farmer switches it to barley first. Strip 4 is best for wheat (40 kg) and goes last. On the small curve the point moves A, B, C, D, E, and the curve bows outward.';

  async setup() {
    this.k = 4;            // strips switched to barley (in the order 1 to 4)
    this.fresh = null;     // the strip index growing in on this paint
    this.going = false;    // the auto run
    this.pend = [];
    await super.setup();
    this._onClick = (e) => {
      const b = e.target?.closest?.('[data-act]');
      if (!b || b.disabled) return;
      this.act(b.dataset.act);
    };
    this.root.addEventListener('click', this._onClick);
  }

  destroy() {
    this.root?.removeEventListener('click', this._onClick);
    super.destroy();
  }

  css() { return CSS; }

  cancel() { for (const c of this.pend) c(); this.pend = []; }

  busy() { return this.going; }

  enter(step) {
    this.cancel();
    this.fresh = null;
    if (step === 1) {
      this.k = 0;
      this.going = true;
      for (let i = 0; i < 4; i++) this.pend.push(this.after(FIRST_S + i * STEP_S, () => this.switchNext()));
      this.pend.push(this.after(FIRST_S + 3 * STEP_S + 0.1, () => { this.going = false; this.repaint(); }));
    } else {
      this.k = 4;
      this.going = false;
    }
  }

  switchNext() {
    if (this.k >= 4) return;
    this.fresh = this.k;
    this.k += 1;
    this.repaint();
    const f = this.fresh;
    this.pend.push(this.after(GROW_S, () => { if (this.fresh === f) this.fresh = null; }));
  }

  act(a) {
    if (this.stepIndex !== 1) return;
    if (a === 'skip' && this.going) { this.cancel(); this.going = false; this.k = 4; this.fresh = null; }
    else if (a === 'again') { this.cancel(); this.going = false; this.k = 0; this.fresh = null; }
    else if (a === 'next' && !this.going) { this.switchNext(); return; }
    else return;
    this.repaint();
  }

  layout(st) {
    const P = st.portrait, W = st.W, step = this.stepIndex;
    if (step === 0) {
      const pillW = P ? 104 : 124, x0 = pillW + (P ? 14 : 22), room = P ? 66 : 80;
      const top = 54, rh = P ? 70 : 66, gap = 14;
      return { P, W, step, pillW, x0, top, rh, gap, bh: 40, kg: (W - x0 - room) / 40, rowY: (i) => top + i * (rh + gap) + rh / 2, H: top + 4 * rh + 3 * gap + (P ? 84 : 24) };
    }
    const numW = P ? 28 : 34, fx = numW + 13, sw = P ? 124 : 196, x0 = fx + sw + (P ? 22 : 26);
    const valAbove = P, room = valAbove ? 6 : 78;
    const top = P ? 36 : 30, rh = P ? 46 : 38, gap = 10, fh = 4 * rh + 3 * gap;
    const capB = top + fh + (P ? 34 : 30);
    const ppcTop = capB + (P ? 22 : 14), ppcH = P ? 190 : 140, ppcW = P ? W : Math.min(310, W * 0.58);
    return { P, W, step, numW, fx, sw, x0, valAbove, top, rh, gap, fh, capB, bh: P ? 22 : 30,
      kg: (W - x0 - room) / 40, rowY: (i) => top + i * (rh + gap) + rh / 2,
      ppc: { x: 0, y: ppcTop, w: ppcW, h: ppcH }, H: ppcTop + ppcH + (P ? 58 : 6) };
  }

  stageHeight(st) { return this.layout(st).H; }

  /** A wheat bar: solid when given up, a dashed outline of the wheat still growing otherwise. */
  bar(L, i, x, y, solid, o = {}) {
    const len = WHEAT[i] * L.kg, h = L.bh, r = Math.min(10, h / 2);
    if (!solid) return `<rect x="${f1(x)}" y="${f1(y)}" width="${f1(len)}" height="${h}" rx="${r}" ${fill('none', 'stroke:var(--sim-label-muted);stroke-width:2;stroke-dasharray:7 6;opacity:0.7')}/>`;
    const cls = o.anim ? ` class="so-bar" style="--d:${(o.delay ?? 0).toFixed(2)}s"` : '';
    return `<g${cls}><rect x="${f1(x)}" y="${f1(y + 4)}" width="${f1(len)}" height="${h}" rx="${r}" ${fill('color-mix(in srgb, var(--sim-gold) 58%, black)')}/>`
      + `<rect x="${f1(x)}" y="${f1(y)}" width="${f1(len)}" height="${h}" rx="${r}" ${fill('var(--sim-gold)', o.lit ? 'stroke:var(--sim-accent);stroke-width:4' : 'stroke:color-mix(in srgb, var(--sim-gold) 58%, black);stroke-width:2')}/></g>`;
  }

  paint(st) {
    return this.stepIndex === 0 ? this.paintPattern(st) : this.paintWhy(st);
  }

  paintPattern(st) {
    const L = this.layout(st);
    let svg = '';
    svg += txt(L.pillW / 2, 28, 'barley', 20, { anchor: 'middle', col: 'var(--sim-label-muted)' });
    svg += txt(L.x0, 28, 'wheat given up', 20, { col: 'var(--sim-label-muted)' });
    for (let i = 0; i < 4; i++) {
      const cy = L.rowY(i), pw = L.pillW - 8, ph = 40;
      svg += `<rect x="4" y="${f1(cy - ph / 2 + 3)}" width="${pw}" height="${ph}" rx="${ph / 2}" ${fill(`color-mix(in srgb, ${cropTone('barley')} 60%, black)`)}/>`
        + `<rect x="4" y="${f1(cy - ph / 2)}" width="${pw}" height="${ph}" rx="${ph / 2}" ${fill('var(--sim-bg-surface)', `stroke:${cropTone('barley')};stroke-width:3`)}/>`
        + txt(4 + pw / 2, cy + 8, '+25 kg', 22, { anchor: 'middle' });
      svg += `<path d="M${L.pillW - 2} ${f1(cy)}H${f1(L.x0 - 8)}" ${fill('none', 'stroke:var(--sim-label-muted);stroke-width:2.5;stroke-linecap:round')}/>`;
      svg += this.bar(L, i, L.x0, cy - L.bh / 2, true, { anim: true, delay: 0.2 + i * 0.5 });
      svg += `<g class="so-pop" style="--d:${(0.55 + i * 0.5).toFixed(2)}s">${txt(L.x0 + WHEAT[i] * L.kg + 10, cy + 9, `${WHEAT[i]} kg`, 24)}</g>`;
    }
    // The question, in the corner the staircase leaves empty (above-right of the short bars).
    // Portrait: under the rows (the short bars' corner is too narrow at 390).
    const qx = L.P ? L.W / 2 : L.W - 110, qy = L.P ? L.rowY(3) + L.rh / 2 + 40 : L.rowY(0) + 2, qw = L.P ? 236 : 206, qh = 46;
    const q = txt(qx, qy + 7, 'why more each time?', 20, { anchor: 'middle', col: 'var(--sim-ink-on-accent, var(--sim-bg-deep))' });
    svg += `<g class="so-pop" style="--d:2.3s"><rect x="${f1(qx - qw / 2)}" y="${f1(qy - qh / 2)}" width="${qw}" height="${qh}" rx="${qh / 2}" ${fill('var(--sim-accent)')}/>${q}</g>`;
    return { svg, over: '' };
  }

  paintWhy(st) {
    const L = this.layout(st), k = this.k;
    const crops = [0, 1, 2, 3].map((i) => (i < k ? 'barley' : 'wheat'));
    const spec = farmSpec({ orient: 'rows', w: L.sw, h: L.fh, gap: L.gap, strips: crops.map((crop, i) => ({ crop, soil: SOILS[i] })) });
    let farm = farmSvg(spec, { x: L.fx, y: L.top, tags: false, lit: k > 0 ? k - 1 : null, grow: (i) => (crops[i] === 'wheat' ? WHEAT_GROW[i] : 1) });
    if (this.fresh != null) farm = growOnly(farm, this.fresh);
    let svg = farm, over = '';

    // Captions above strip 1 and under strip 4: never on the crop.
    svg += txt(L.fx, L.top - 14, 'dry', 20, { col: 'var(--sim-label-muted)' });
    svg += txt(L.fx, L.capB - 4, 'best for wheat', 20, { col: 'var(--sim-label-muted)' });
    // Landscape: the made-up tag rides on this caption line (no head row: the figure must fit 1280x720).
    const made = chip('A made-up reason', 0, 0, { tone: 'plain', static: true });
    if (!L.P) over += `<div style="position:absolute;right:4px;top:${f1(L.capB - 10)}px;transform:translateY(-50%)">${made}</div>`;
    svg += txt(L.x0, L.top - 14, 'wheat given up', 18, { col: 'var(--sim-label-muted)' });

    for (let i = 0; i < 4; i++) {
      const cy = L.rowY(i), nx = L.numW / 2, given = i < k, fresh = this.fresh === i;
      svg += `<circle cx="${f1(nx)}" cy="${f1(cy)}" r="15" ${fill('var(--sim-bg-surface)', 'stroke:var(--sim-label-muted);stroke-width:2.5')}/>` + txt(nx, cy + 6, i + 1, 18, { anchor: 'middle' });
      const by = L.valAbove ? cy - L.bh / 2 + 10 : cy - L.bh / 2;
      svg += this.bar(L, i, L.x0, by, given, { anim: fresh, lit: given && i === k - 1 });
      if (given) {
        const v = txt(L.valAbove ? L.x0 + 2 : L.x0 + WHEAT[i] * L.kg + 10, L.valAbove ? by - 7 : cy + 8, `${WHEAT[i]} kg`, L.valAbove ? 19 : 22);
        svg += fresh ? `<g class="so-pop" style="--d:0.3s">${v}</g>` : v;
      }
    }

    svg += this.ppcSvg(L);
    const [n, b, w] = PTS[k];
    const pp = L.ppc;
    if (L.P) {
      over += `<span class="so-read" style="left:${f1(pp.x + pp.w - 78)}px;top:${f1(pp.y + 44)}px"><b>${n}</b><span>barley ${b} kg</span><span>wheat ${w} kg</span></span>`;
      const by = pp.y + pp.h + 38;
      over += this.buttons(L.W * 0.27, by, L.W * 0.73, by);
    } else {
      const cx = pp.x + pp.w + (L.W - pp.x - pp.w) / 2;
      over += `<span class="so-read so-read--row" style="left:${f1(cx)}px;top:${f1(pp.y + 22)}px"><b>${n}</b><span>barley ${b} kg</span><span>wheat ${w} kg</span></span>`;
      over += this.buttons(cx, pp.y + 70, cx, pp.y + 120);
    }
    return { svg, over, head: L.P ? made : '' };
  }

  buttons(x1, y1, x2, y2) {
    const btn = (act, label, x, y, go) => `<button type="button" class="sv-hit so-btn${go ? ' so-btn--go' : ''}" data-act="${act}" style="left:${f1(x)}px;top:${f1(y)}px">${label}</button>`;
    if (this.going) return btn('skip', 'Skip', x1, y1);
    let out = this.k > 0 ? btn('again', 'Start again', x1, y1) : '';
    if (this.k < 4) out += btn('next', 'switch next strip', this.k > 0 ? x2 : x1, this.k > 0 ? y2 : y1, true);
    return out;
  }

  /** The small PPC: barley across, wheat up, A to E on the outward bow; the path so far drawn strong. */
  ppcSvg(L) {
    const p = L.ppc, ml = 46, mb = L.P ? 34 : 30, mt = L.P ? 42 : 30, mr = 22;
    const ox = p.x + ml, oy = p.y + p.h - mb, pw = p.w - ml - mr, ph = p.h - mb - mt;
    const X = (b) => ox + (b / 100) * pw, Y = (w) => oy - (w / 100) * ph;
    let s = `<rect x="${f1(p.x + 2)}" y="${f1(p.y)}" width="${f1(p.w - 4)}" height="${f1(p.h)}" rx="14" ${fill('var(--sim-bg-surface)', 'stroke:var(--sim-stroke);stroke-width:2;opacity:0.92')}/>`;
    s += `<path d="M${f1(ox)} ${f1(Y(100) - 6)}V${f1(oy)}H${f1(X(100) + 8)}" ${fill('none', 'stroke:var(--sim-label);stroke-width:2.5;stroke-linecap:round')}/>`;
    for (const v of [0, 50, 100]) {
      if (v !== 50) s += txt(X(v), oy + 22, v, 16, { anchor: 'middle', col: 'var(--sim-label-muted)' });
      else s += `<path d="M${f1(X(v))} ${f1(oy)}v6" ${fill('none', 'stroke:var(--sim-label);stroke-width:2')}/>`;
      if (v) s += txt(ox - 8, Y(v) + 6, v, 16, { anchor: 'end', col: 'var(--sim-label-muted)' });
    }
    s += txt(ox + pw / 2, oy + 22, 'barley (kg)', 16, { anchor: 'middle', col: 'var(--sim-label-muted)', w: 700 });
    s += txt(L.P ? p.x + 14 : ox + 10, L.P ? p.y + 22 : p.y + 20, 'wheat (kg)', 16, { col: 'var(--sim-label-muted)', w: 700 });
    // The whole curve faint; the path walked so far strong.
    const curve = (b1) => { let d = ''; for (let b = 0; b <= b1 + 0.01; b += 2.5) d += `${d ? 'L' : 'M'}${f1(X(b))} ${f1(Y(wheatAt(b)))}`; return d; };
    s += `<path d="${curve(100)}" ${fill('none', 'stroke:var(--sim-accent);stroke-width:3;opacity:0.3;stroke-linecap:round')}/>`;
    if (this.k > 0) s += `<path d="${curve(this.k * 25)}" ${fill('none', 'stroke:var(--sim-accent);stroke-width:5;stroke-linecap:round;stroke-linejoin:round')}/>`;
    PTS.forEach(([n, b, w], i) => {
      const cur = i === this.k, x = X(b), y = Y(w);
      const lx = n === 'E' ? x - 16 : x + 10, ly = n === 'E' ? y - 12 : n === 'A' || (n === 'B' && !L.P) ? y + 20 : y - 9;
      if (cur) {
        const pop = this.fresh != null ? ' class="so-pop"' : '';
        s += `<g${pop}><circle cx="${f1(x)}" cy="${f1(y)}" r="11" ${fill('var(--sim-accent)', 'stroke:var(--sim-bg-surface);stroke-width:3')}/></g>`;
      } else {
        s += `<circle cx="${f1(x)}" cy="${f1(y)}" r="6" ${fill(i < this.k ? 'var(--sim-accent)' : 'var(--sim-label-muted)', 'stroke:var(--sim-bg-surface);stroke-width:2')}/>`;
      }
      s += txt(lx, ly, n, cur ? 20 : 17, { anchor: n === 'E' ? 'end' : 'start', col: cur ? 'var(--sim-accent)' : 'var(--sim-label-muted)' });
    });
    return s;
  }

  testState() { return { step: this.stepIndex, k: this.k, point: PTS[this.k][0], going: this.going }; }
}
