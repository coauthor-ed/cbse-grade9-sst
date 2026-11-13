/**
 * WantsListScene - L01 s05 "Wants Keep Coming" (2 beats).
 *   b0 regenerate: Meera's want list. The open want sits at the bottom with a tick box. Tick it (she gets it)
 *                  and a new want slides in under it: basic phone, smartphone, bigger screen, better camera,
 *                  new earphones, ... and it never runs out. On entry the scene ticks "basic phone" itself
 *                  and "smartphone" slides in. Rest (cold start): 1 got, "smartphone" open, its box pulses.
 *   b1 unlimited:  two lists, stacked. Needs: food, clean water, shelter, clothing; the count stays 4. Wants:
 *                  new lines keep arriving (one every 0.5 s on entry, then "one more want" adds the next);
 *                  only the newest 3 lines show, the rest fold into a "+N more" chip; the count keeps growing.
 *                  Rest (cold start): wants 6, the newest 3 showing, "+3 more".
 * Drawn in stage px (st.W wide); rows are real HTML text on the overlay. Colours are tokens only. ASCII only.
 */
import { SvgScene, fill } from 'simulations/base/kit/SimSvg.js';

const MAP = [[{ idx: 0, dwellMs: null }], [{ idx: 1, dwellMs: null }]];
const WANTS = ['basic phone', 'smartphone', 'bigger screen', 'better camera', 'new earphones', 'new shoes', 'film ticket', 'game top-up', 'newest phone'];
const wantOf = (i) => (i < WANTS.length ? WANTS[i] : `an even newer phone`);
const NEEDS = ['food', 'clean water', 'shelter', 'clothing'];
const SHOW0 = 5;          // beat 0: the newest 5 rows show
const SHOW1 = 3;          // beat 1: the newest 3 wants show
const REST1 = 6;          // beat 1 rest: 6 wants
const ADD_S = 0.5;
const f1 = (v) => (+v).toFixed(1);
const TONE = { needs: 'var(--sim-series-3)', wants: 'var(--sim-series-5)' };

const CSS = `
.wl-row { position: absolute; display: flex; align-items: center; gap: 12px; box-sizing: border-box; padding: 0 12px 0 8px;
  border-radius: calc(12px * var(--look-radius, 1)); background: var(--sim-bg-surface); border: 2.5px solid color-mix(in srgb, var(--c) 55%, var(--sim-bg-surface));
  font: 800 21px/1.15 var(--sim-font); color: var(--sim-label); white-space: nowrap; transition: top 0.4s ease; }
.wl-p .wl-row { font-size: 19px; gap: 8px; }
.wl-row.wl-got { color: var(--sim-label-muted); background: color-mix(in srgb, var(--c) 7%, var(--sim-bg-surface)); }
.wl-row.wl-open { border-color: var(--c); box-shadow: 0 calc(3px * var(--look-lip, 1)) 0 var(--c); }
.wl-row .wl-t { flex: 1; overflow: hidden; text-overflow: ellipsis; }
.wl-row.wl-got .wl-t { text-decoration: line-through; text-decoration-thickness: 2px; }
.wl-mark { flex: 0 0 auto; width: 34px; height: 34px; border-radius: 9px; display: inline-flex; align-items: center; justify-content: center;
  background: var(--c); color: var(--sim-bg-deep); font: 900 22px/1 var(--sim-font); }
.wl-box { flex: 0 0 auto; width: 44px; height: 44px; border-radius: 10px; cursor: pointer; background: var(--sim-bg-surface);
  border: 3px solid var(--c); box-shadow: 0 calc(3px * var(--look-lip, 1)) 0 var(--c); padding: 0; }
.wl-box:active { transform: translateY(3px); box-shadow: none; }
.wl-box:focus-visible, .wl-btn:focus-visible { outline: 3px solid var(--sim-accent); outline-offset: 3px; }
.wl-box.wl-pulse { animation: wl-pulse 1.3s ease-in-out infinite; }
@keyframes wl-pulse { 50% { box-shadow: 0 0 0 7px color-mix(in srgb, var(--sim-accent) 45%, transparent); } }
.wl-tag { flex: 0 0 auto; font-size: 16px; padding: 3px 10px; border-radius: 999px; background: color-mix(in srgb, var(--c) 18%, var(--sim-bg-surface)); color: var(--sim-label); }
.wl-in { animation: wl-in 0.5s ease-out both; animation-delay: var(--d, 0s); }
@keyframes wl-in { from { transform: translateY(-18px); opacity: 0; } to { transform: none; opacity: 1; } }
.wl-head { position: absolute; display: flex; align-items: center; gap: 10px; transform: translateY(-50%); font: 800 22px/1.1 var(--sim-font); color: var(--sim-label); white-space: nowrap; }
.wl-count { min-width: 40px; text-align: center; padding: 3px 12px; border-radius: 999px; background: var(--c); color: var(--sim-bg-deep); font: 900 22px/1.1 var(--sim-font); }
.wl-count.wl-bump { animation: wl-bump 0.4s ease-out; }
@keyframes wl-bump { 40% { transform: scale(1.25); } }
.wl-chips { position: absolute; display: flex; flex-wrap: wrap; justify-content: center; gap: 10px 8px; }
.wl-p .wl-chips { gap: 12px 10px; }
.wl-chip { display: inline-flex; align-items: center; gap: 6px; padding: 5px 12px; border-radius: 999px;
  font: 800 18px/1.15 var(--sim-font); background: var(--sim-bg-surface); color: var(--sim-label); border: 2.5px solid color-mix(in srgb, var(--c) 60%, var(--sim-bg-surface)); white-space: nowrap; }
.wl-chip b { color: var(--c); }
.wl-more { position: absolute; transform: translate(-50%, -50%); font: 800 17px/1.1 var(--sim-font); color: var(--sim-label-muted); white-space: nowrap; }
.wl-btn { position: absolute; transform: translate(-50%, -50%); min-height: 44px; padding: 6px 18px; cursor: pointer; white-space: nowrap;
  border-radius: calc(12px * var(--look-radius, 1)); font: 800 19px/1.1 var(--sim-font); background: var(--sim-bg-surface); color: var(--sim-label);
  border: 2.5px solid var(--c); box-shadow: 0 calc(3px * var(--look-lip, 1)) 0 var(--c); }
.wl-btn:active { transform: translate(-50%, calc(-50% + 3px)); box-shadow: none; }
.wl-hint { position: absolute; transform: translate(-50%, -50%); font: 800 18px/1.2 var(--sim-font); color: var(--sim-accent); white-space: nowrap; }
`;

export class WantsListScene extends SvgScene {
  static WIDTH = 560;
  static PORTRAIT_WIDTH = 390;
  static HEIGHT = 500;
  static PORTRAIT_HEIGHT = 560;
  static CONTINUOUS = false;
  static BEAT_STEP_MAP = MAP;
  static BEAT_MAPS = { 2: MAP };
  static CONTROLS = [];
  static ARIA_LABEL = 'Meera\'s want list. Tick a want when she gets it and a new want appears: basic phone, then smartphone, then a bigger screen, a better camera, new earphones, and more. Then two lists: the needs list stays at 4 (food, clean water, shelter, clothing) while the wants list keeps growing.';

  async setup() {
    this.got = 0;
    this.n = 1;
    this.fresh = -1;
    this.moved = false;
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

  enter(step) {
    this.moved = false;
    if (step === 0) {
      // She gets the basic phone; the smartphone want slides in.
      this.got = 0; this.n = 1; this.fresh = 0;
      this.after(0.8, () => { this.got = 1; this.fresh = -1; this.repaint(); });
      this.after(1.3, () => { this.n = 2; this.fresh = 1; this.repaint(); });
      this.after(2.0, () => { this.fresh = -1; this.repaint(); });
    } else {
      this.n = 0; this.fresh = -1;
      for (let k = 1; k <= REST1; k++) this.after(0.3 + k * ADD_S, () => { this.n = k; this.fresh = k - 1; this.repaint(); });
      this.after(0.3 + REST1 * ADD_S + 0.6, () => { this.fresh = -1; this.repaint(); });
    }
  }

  act(a) {
    if (this.stepIndex === 0 && a === 'tick' && this.got < this.n) {
      this.got = this.n; this.n += 1; this.fresh = this.n - 1; this.moved = true;
      this.after(0.9, () => { this.fresh = -1; this.repaint(); });
    } else if (this.stepIndex === 1 && a === 'more') {
      this.n += 1; this.fresh = this.n - 1; this.moved = true;
      this.after(0.7, () => { this.fresh = -1; this.repaint(); });
    } else return;
    this.repaint();
  }

  layout(st) {
    const P = st.portrait, W = st.W, pad = 12, rowH = P ? 50 : 52, gap = P ? 9 : 10;
    return { P, W, pad, rowH, gap, rx: pad + 10, rw: W - 2 * pad - 20 };
  }

  stageHeight(st) {
    // One height for both beats (the host sizes the panel from it).
    const L = this.layout(st);
    return Math.max(this.needsH(L) + 22 + 56 + SHOW1 * (L.rowH + L.gap) + 70 + 10, 56 + SHOW0 * (L.rowH + L.gap) + 76);
  }

  needsH(L) { return L.P ? 158 : 128; }

  rowHtml(L, i, top, cls, tone, open) {
    const text = wantOf(i), isNew = i === this.fresh;
    const lead = open
      ? `<button type="button" class="sv-hit wl-box${this.moved ? '' : ' wl-pulse'}" data-act="tick" aria-label="tick ${text}: Meera gets it"></button>`
      : '<span class="wl-mark" aria-hidden="true">&#10003;</span>';
    const tag = open ? '' : '<span class="wl-tag">got it</span>';
    return `<div class="wl-row ${cls}${isNew ? ' wl-in' : ''}" style="left:${f1(L.rx)}px;top:${f1(top)}px;width:${f1(L.rw)}px;height:${L.rowH}px;--c:${tone}">${lead}<span class="wl-t">${text}</span>${tag}</div>`;
  }

  paint(st) {
    const L = this.layout(st), step = this.stepIndex;
    let svg = '', over = `<div class="${L.P ? 'wl-p' : 'wl-l'}">`;
    const panel = (y, h, tone) => `<rect x="${L.pad}" y="${f1(y)}" width="${f1(L.W - 2 * L.pad)}" height="${f1(h)}" rx="16" ${fill(`color-mix(in srgb, ${tone} 8%, var(--sim-bg-surface))`, `stroke:${tone};stroke-width:3`)}/>`;
    const head = (y, text, count, tone, bump) => `<div class="wl-head" style="left:${f1(L.pad + 14)}px;top:${f1(y)}px;--c:${tone}">${text}<span class="wl-count${bump ? ' wl-bump' : ''}">${count}</span></div>`;

    if (step === 0) {
      const tone = TONE.wants, top0 = 56;
      const first = Math.max(0, this.n - SHOW0);
      svg += panel(4, top0 + SHOW0 * (L.rowH + L.gap) + 6, tone);
      over += head(30, 'Meera\'s wants', this.n, tone, this.fresh >= 0);
      if (first > 0) over += `<span class="wl-more" style="left:${f1(L.W - 80)}px;top:30px">+${first} got before</span>`;
      for (let i = first; i < this.n; i++) {
        const open = i >= this.got;
        over += this.rowHtml(L, i, top0 + (i - first) * (L.rowH + L.gap), open ? 'wl-open' : 'wl-got', tone, open);
      }
      const hy = top0 + SHOW0 * (L.rowH + L.gap) + 40;
      if (this.got < this.n) over += `<span class="wl-hint" style="left:${f1(L.W / 2)}px;top:${f1(hy)}px">Tick the box when she gets it</span>`;
    } else {
      // Needs: a short list, always 4.
      const nh = this.needsH(L), nt = TONE.needs;
      svg += panel(4, nh, nt);
      over += head(30, 'needs', 4, nt, false)
        + `<span class="wl-more" style="left:${f1(L.W - 76)}px;top:30px">stays at 4</span>`;
      over += `<div class="wl-chips" style="left:${L.pad + 8}px;right:${L.pad + 8}px;top:${L.P ? 56 : 54}px">`
        + NEEDS.map((t) => `<span class="wl-chip" style="--c:${nt}"><b>&#10003;</b>${t}</span>`).join('') + '</div>';
      // Wants: it keeps growing; the newest 4 show.
      const wt = TONE.wants, y0 = nh + 22, top0 = y0 + 56;
      const first = Math.max(0, this.n - SHOW1);
      svg += panel(y0, 56 + SHOW1 * (L.rowH + L.gap) + 6, wt);
      over += head(y0 + 28, 'wants', this.n, wt, this.fresh >= 0);
      if (first > 0) over += `<span class="wl-more" style="left:${f1(L.W - 76)}px;top:${f1(y0 + 28)}px">+${first} more</span>`;
      for (let i = first; i < this.n; i++) {
        const k = i - first;
        over += this.rowHtml(L, i, top0 + k * (L.rowH + L.gap), 'wl-open', wt, false).replace('<span class="wl-mark" aria-hidden="true">&#10003;</span>', '<span class="wl-mark" aria-hidden="true">+</span>').replace('<span class="wl-tag">got it</span>', '');
      }
      const by = top0 + SHOW1 * (L.rowH + L.gap) + 34;
      over += `<button type="button" class="sv-hit wl-btn" data-act="more" style="left:${f1(L.W / 2)}px;top:${f1(by)}px;--c:${wt}">one more want</button>`;
    }
    over += '</div>';
    return { svg, over };
  }

  testState() { return { step: this.stepIndex, got: this.got, n: this.n }; }
}
