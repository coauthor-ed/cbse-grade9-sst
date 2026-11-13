/**
 * IdleStripScene - L03 s07 "What the Curve Is For" (2 beats). The farm world (made up): one plot of 4 strips,
 * barley 25 kg on any strip, wheat 10, 20, 30, 40 kg on strips 1-4. The farm is at C: strips 1-2 barley,
 * strips 3-4 wheat (barley 50 kg, wheat 70 kg), a point on the curve.
 *   b0 assumption: the farm at C for 1 s, then strip 4 lies idle (bare soil): barley 50 kg, wheat 30 kg. On the
 *                  small PPC the point drops from C (a hollow ring stays on the curve) to (50, 30), inside the curve.
 *                  Rest (cold start): strip 4 idle, the point inside.
 *   b1 planning:   every strip in use again; the point back on the curve at C. Three short tags on the PPC, each
 *                  in its own region: "on: all used" (by the curve), "inside: waste" (under it), "outside: not
 *                  possible" (the empty corner beyond it). One tap control: "leave a strip idle" toggles strip 4
 *                  idle and back ("use every strip"); the readout and the point follow the strips.
 * Each strip's harvest tag sits in a clear column at the strip's end, never on the crop. Drawn in stage px.
 * Colours are tokens only. ASCII only.
 */
import { SvgScene, fill } from 'simulations/base/kit/SimSvg.js';
import { farmSpec, farmSvg, tagSvg, cropTone } from 'simulations/base/kit/SimFarm.js';

const MAP = [[{ idx: 0, dwellMs: null }], [{ idx: 1, dwellMs: null }]];
const WHEAT = [10, 20, 30, 40];
const BARLEY = 25;
const SOILS = ['dry', 'sandy', 'loam', 'rich'];
const HOLD_S = 1.0, GROW_S = 0.9;
const wheatAt = (b) => 100 - 0.2 * b - 0.008 * b * b;   // passes through A to E exactly
const f1 = (v) => (+v).toFixed(1);

const CSS = `
.is-row { position: absolute; transform: translateY(-50%); display: flex; gap: 10px; flex-wrap: nowrap; }
.is-read { display: inline-flex; align-items: center; gap: 8px; padding: 5px 14px; border-radius: var(--look-pill, 999px); white-space: nowrap;
  font: 800 19px/1.25 var(--sim-font); background: var(--sim-bg-surface); color: var(--sim-label);
  border: calc(2.5px * var(--look-rim, 1)) solid var(--c, var(--sim-stroke)); box-shadow: 0 calc(3px * var(--look-lip, 1)) 0 var(--c, var(--sim-stroke)); }
.is-read i { width: 15px; height: 15px; border-radius: 50%; background: var(--c); display: inline-block; }
.is-l .is-read { font-size: 17px; padding: 4px 12px; gap: 6px; }
.is-p .is-read { font-size: 18px; padding: 4px 12px; gap: 6px; }
.is-btn { position: absolute; transform: translate(-50%, -50%); min-height: 44px; padding: 6px 16px; cursor: pointer; white-space: nowrap;
  border-radius: calc(12px * var(--look-radius, 1)); font: 800 18px/1.1 var(--sim-font); border: 0;
  background: var(--primary-color, var(--sim-accent)); color: var(--on-primary, var(--sim-ink-on-accent, var(--sim-bg-deep)));
  box-shadow: 0 calc(4px * var(--look-lip, 1)) 0 var(--primary-hover, color-mix(in oklab, var(--sim-accent) 55%, var(--sim-stroke))); }
.is-btn--quiet { background: var(--sim-bg-surface); color: var(--sim-label); border: 2.5px solid var(--sim-stroke); box-shadow: 0 calc(3px * var(--look-lip, 1)) 0 var(--sim-stroke); }
.is-btn:active { transform: translate(-50%, calc(-50% + 3px)); box-shadow: none; }
.is-btn:focus-visible { outline: 3px solid var(--sim-accent); outline-offset: 3px; }
svg .is-drop { animation: is-drop 0.6s ease-in both; animation-delay: var(--d, 0s); }
@keyframes is-drop { from { transform: translateY(var(--dy, 0px)); } to { transform: none; } }
svg .is-pop { transform-box: fill-box; transform-origin: center; animation: is-pop 0.4s ease-out both; animation-delay: var(--d, 0s); }
@keyframes is-pop { 0% { transform: scale(0.4); opacity: 0; } 100% { transform: none; opacity: 1; } }
`;

function growOnly(svg, i) {
  let n = -1;
  return svg.replace(/class="sf-plants"/g, (m) => { n += 1; return n === i ? 'class="sf-plants sv-grow"' : m; });
}
const cropTag = (text, x, y, size, crop) => tagSvg(text, x, y, { size, tone: 'gold' }).replace('stroke:var(--sim-gold)', `stroke:${cropTone(crop)}`);
const txt = (x, y, s, size, o = {}) => `<text x="${f1(x)}" y="${f1(y)}" text-anchor="${o.anchor ?? 'start'}" style="fill:${o.col ?? 'var(--sim-label)'};font:${o.w ?? 800} ${size}px var(--sim-font)">${s}</text>`;

export class IdleStripScene extends SvgScene {
  static WIDTH = 560;
  static PORTRAIT_WIDTH = 390;
  static HEIGHT = 510;   // the host budgets the panel from this: scale = about 465 / HEIGHT at 1280x720, so it sits above the content height on purpose
  static PORTRAIT_HEIGHT = 626;
  static CONTINUOUS = false;
  static BEAT_STEP_MAP = MAP;
  static BEAT_MAPS = { 2: MAP };
  static CONTROLS = [];
  static ARIA_LABEL = 'A made-up farm at point C: strips 1 and 2 grow barley, strips 3 and 4 wheat, 50 kg of barley and 70 kg of wheat, a point on the curve. When strip 4 lies idle the farm grows 50 kg of barley and only 30 kg of wheat, and its point drops inside the curve. On the curve: all used. Inside: waste. Outside: not possible.';

  async setup() {
    this.idle = true;
    this.fresh = null;   // 'drop' (strip 4 just went idle) or 'rise' (it just came back)
    this.going = false;
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

  setIdle(v) {
    this.idle = v;
    this.fresh = v ? 'drop' : 'rise';
    const f = this.fresh;
    this.pend.push(this.after(GROW_S, () => { if (this.fresh === f) this.fresh = null; }));
  }

  enter(step) {
    this.cancel();
    this.fresh = null;
    if (step === 0) {
      this.idle = false;
      this.going = true;
      this.pend.push(this.after(HOLD_S, () => { this.going = false; this.setIdle(true); this.repaint(); }));
    } else {
      this.idle = false;
      this.going = false;
    }
  }

  act(a) {
    if (a === 'skip' && this.going) { this.cancel(); this.going = false; this.idle = true; this.fresh = null; }
    else if (a === 'toggle' && this.stepIndex === 1) { this.cancel(); this.setIdle(!this.idle); }
    else return;
    this.repaint();
  }

  crops() { return ['barley', 'barley', 'wheat', this.idle ? 'idle' : 'wheat']; }

  totals() {
    let barley = 0, wheat = 0;
    this.crops().forEach((c, i) => { if (c === 'barley') barley += BARLEY; else if (c === 'wheat') wheat += WHEAT[i]; });
    return { barley, wheat };
  }

  layout(st) {
    const P = st.portrait, W = st.W;
    const numW = P ? 28 : 34, tagW = P ? 104 : 124, fx = numW + 13, fw = W - fx - 15 - tagW;
    const fy = P ? 58 : 48, rh = P ? 46 : 38, gap = 10, fh = 4 * rh + 3 * gap;
    const ppcTop = fy + fh + 9 + (P ? 20 : 14), ppcH = P ? 222 : 150;
    return { P, W, numW, tagW, fx, fw, fy, rh, gap, fh, tx: W - tagW / 2 - 2, rowY: (i) => fy + i * (rh + gap) + rh / 2,
      ppc: { x: 0, y: ppcTop, w: W, h: ppcH }, H: ppcTop + ppcH + (P ? 56 : 6) };
  }

  stageHeight(st) { return this.layout(st).H; }

  paint(st) {
    const L = this.layout(st), step = this.stepIndex, crops = this.crops(), T = this.totals();
    const spec = farmSpec({ orient: 'rows', w: L.fw, h: L.fh, gap: L.gap, strips: crops.map((crop, i) => ({ crop, soil: SOILS[i] })) });
    let farm = farmSvg(spec, { x: L.fx, y: L.fy, tags: false, lit: this.idle ? 3 : null });
    if (this.fresh === 'rise') farm = growOnly(farm, 3);   // strip 4 grows back in
    let svg = farm, over = L.P ? '<div class="is-p">' : '<div class="is-l">';
    const size = L.P ? 21 : 23;

    for (let i = 0; i < 4; i++) {
      const cy = L.rowY(i), nx = L.numW / 2, c = crops[i];
      svg += `<circle cx="${f1(nx)}" cy="${f1(cy)}" r="15" ${fill('var(--sim-bg-surface)', 'stroke:var(--sim-label-muted);stroke-width:2.5')}/>` + txt(nx, cy + 6, i + 1, 18, { anchor: 'middle' });
      if (c === 'idle') {
        const pop = this.fresh === 'drop' ? ' class="is-pop"' : '';
        svg += `<g${pop}>${cropTag('0 kg', L.tx - 26, cy, size, 'idle')}${txt(L.tx + 30, cy + 7, 'idle', 19, { col: 'var(--sim-bad)' })}</g>`;
      } else {
        svg += cropTag(`${c === 'barley' ? BARLEY : WHEAT[i]} kg`, L.tx, cy, size, c);
      }
    }

    // Totals: always the sum of the strips on screen.
    const read = (crop, label, v) => `<span class="is-read" style="--c:${cropTone(crop)}"><i></i>${label} <b>${v} kg</b></span>`;
    const chips = read('barley', 'barley', T.barley) + read('wheat', 'wheat', T.wheat);
    if (L.P) over += `<div class="is-row" style="top:26px;left:0;right:0;justify-content:center">${chips}</div>`;
    else over += `<div class="is-row" style="top:26px;left:${f1(L.fx - 8)}px">${chips}</div>`;

    svg += this.ppcSvg(L, step);

    const btn = (act, label, x, y, quiet) => `<button type="button" class="sv-hit is-btn${quiet ? ' is-btn--quiet' : ''}" data-act="${act}" style="left:${f1(x)}px;top:${f1(y)}px">${label}</button>`;
    const bx = L.P ? L.W / 2 : L.W - 98, by = L.P ? L.ppc.y + L.ppc.h + 30 : 25;
    if (this.going) over += btn('skip', 'Skip', bx, by, true);
    else if (step === 1) over += btn('toggle', this.idle ? 'use every strip' : 'leave a strip idle', bx, by, this.idle);
    over += '</div>';
    return { svg, over };
  }

  /** The small PPC. b0: C on the curve and, when idle, the point dropped inside. b1: the three region tags. */
  ppcSvg(L, step) {
    const p = L.ppc, P = L.P, ml = 46, mb = P ? 34 : 30, mt = P ? 42 : 30, mr = 22;
    const ox = p.x + ml, oy = p.y + p.h - mb, pw = p.w - ml - mr, ph = p.h - mb - mt;
    const X = (b) => ox + (b / 100) * pw, Y = (w) => oy - (w / 100) * ph;
    let s = `<rect x="${f1(p.x + 2)}" y="${f1(p.y)}" width="${f1(p.w - 4)}" height="${f1(p.h)}" rx="14" ${fill('var(--sim-bg-surface)', 'stroke:var(--sim-stroke);stroke-width:2;opacity:0.92')}/>`;
    // The region under the curve, softly filled: what the farm can grow.
    let area = `M${f1(ox)} ${f1(oy)}`;
    for (let b = 0; b <= 100.01; b += 2.5) area += `L${f1(X(b))} ${f1(Y(wheatAt(b)))}`;
    s += `<path d="${area}Z" ${fill('var(--sim-accent)', 'opacity:0.1')}/>`;
    s += `<path d="M${f1(ox)} ${f1(Y(100) - 6)}V${f1(oy)}H${f1(X(100) + 8)}" ${fill('none', 'stroke:var(--sim-label);stroke-width:2.5;stroke-linecap:round')}/>`;
    s += txt(ox, oy + 22, 0, 16, { anchor: 'middle', col: 'var(--sim-label-muted)' }) + txt(X(100), oy + 22, 100, 16, { anchor: 'middle', col: 'var(--sim-label-muted)' });
    s += txt(ox - 8, Y(100) + 6, 100, 16, { anchor: 'end', col: 'var(--sim-label-muted)' });
    s += txt(ox + pw / 2, oy + 22, 'barley (kg)', 16, { anchor: 'middle', col: 'var(--sim-label-muted)', w: 700 });
    s += txt(P ? p.x + 14 : ox + 10, P ? p.y + 22 : p.y + 20, 'wheat (kg)', 16, { col: 'var(--sim-label-muted)', w: 700 });
    let curve = '';
    for (let b = 0; b <= 100.01; b += 2.5) curve += `${curve ? 'L' : 'M'}${f1(X(b))} ${f1(Y(wheatAt(b)))}`;
    s += `<path d="${curve}" ${fill('none', 'stroke:var(--sim-accent);stroke-width:5;stroke-linecap:round')}/>`;

    // b1: the three regions, each tag in its own region.
    if (step === 1) {
      const fs = P ? 15 : 16, cw = fs * 0.56;
      const tag = (text, x, cy, col, anchor) => {
        const w = text.length * cw + 20, h = fs + 12, x0 = anchor === 'end' ? x - w : x;
        return `<rect x="${f1(x0)}" y="${f1(cy - h / 2)}" width="${f1(w)}" height="${h}" rx="${h / 2}" ${fill('var(--sim-bg-surface)', `stroke:${col};stroke-width:2.5`)}/>`
          + txt(x0 + w / 2, cy + fs * 0.36, text, fs, { anchor: 'middle', col });
      };
      const onX = X(P ? 58 : 60), onY = P ? Y(76) : Y(80);
      s += `<path d="M${f1(onX + 4)} ${f1(onY + 8)}L${f1(X(52))} ${f1(Y(wheatAt(52)) - 4)}" ${fill('none', 'stroke:var(--sim-accent);stroke-width:2.5;stroke-linecap:round')}/>`;
      s += tag('on: all used', onX, onY, 'var(--sim-accent)', 'start');
      s += tag('inside: waste', X(3), Y(P ? 14 : 17), 'var(--sim-warning)', 'start');
      s += tag('outside: not possible', ox + pw, Y(100) - (P ? 6 : 14), 'var(--sim-bad)', 'end');
    }

    // The farm's point: C on the curve, or (50, 30) inside with a hollow ring left at C.
    const cx = X(50), cY = Y(70), iY = Y(30);
    if (this.idle) {
      s += `<circle cx="${f1(cx)}" cy="${f1(cY)}" r="9" ${fill('var(--sim-bg-surface)', 'stroke:var(--sim-accent);stroke-width:3')}/>`;
      s += `<path d="M${f1(cx)} ${f1(cY + 12)}V${f1(iY - 16)}" ${fill('none', 'stroke:var(--sim-warning);stroke-width:3;stroke-dasharray:6 5')}/>`
        + `<path d="M${f1(cx - 7)} ${f1(iY - 22)}L${f1(cx)} ${f1(iY - 14)}L${f1(cx + 7)} ${f1(iY - 22)}" ${fill('none', 'stroke:var(--sim-warning);stroke-width:3;stroke-linecap:round;stroke-linejoin:round')}/>`;
      const drop = this.fresh === 'drop' ? ` class="is-drop" style="--dy:${f1(cY - iY)}px"` : '';
      s += `<g${drop}><circle cx="${f1(cx)}" cy="${f1(iY)}" r="12" ${fill('var(--sim-warning)', 'stroke:var(--sim-bg-surface);stroke-width:3')}/>`
        + txt(cx + 18, iY + 7, step === 0 ? 'inside' : '(50, 30)', 19, { col: 'var(--sim-label)' }) + '</g>';
      s += txt(cx - 15, cY - 15, 'C', 20, { anchor: 'end', col: 'var(--sim-accent)' });
    } else {
      const pop = this.fresh === 'rise' ? ' class="is-pop"' : '';
      s += `<g${pop}><circle cx="${f1(cx)}" cy="${f1(cY)}" r="12" ${fill('var(--sim-accent)', 'stroke:var(--sim-bg-surface);stroke-width:3')}/></g>`;
      s += txt(cx - 15, cY - 15, 'C', 20, { anchor: 'end', col: 'var(--sim-accent)' });
    }
    return s;
  }

  testState() { return { step: this.stepIndex, idle: this.idle, going: this.going, ...this.totals() }; }
}
