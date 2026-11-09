/**
 * CuneiformSignScene - blk-l09-s03, mounts at beat 3 of 6 (beats 0 to 2 show drawings). Beat 3: a clay tablet, a reed and a
 * button: the learner presses the four wedges of the sign AN. Beat 4: a tablet of three lines, a number in wedges and what
 * was counted. Beat 5: lists at the bottom of a stack of tablets, with myths, hymns and law codes on top.
 * Base chain: SvgScene. The press button is in the scene.
 */
import { SvgScene, fill, mountEl } from 'simulations/base/kit/SimSvg.js';
import { iconSvg } from 'simulations/base/kit/SimIcons.js';
import { n } from '../L07/HarappanDraw.js';
import { anWedges, wedgeSvg, numberSvg, tabletSvg, reedSvg, cornerSvg } from './ClayDraw.js';

const MAP = [0, 1, 2, 3, 4, 5].map((idx) => [{ idx, dwellMs: null }]);
const ROWS = [[3, 'jars', 'pot', 5], [12, 'sacks', 'grain', 4], [20, 'fish', 'fish', 2]];
const STACK = [['Myths and epics', 2], ['Hymns', 5], ['Law codes', 6], ['Lessons', 3]];

export class CuneiformSignScene extends SvgScene {
  static BEAT_STEP_MAP = MAP;
  static CONTINUOUS = false;
  static ARIA_LABEL = 'A reed presses wedges into a clay tablet. Four wedges make the sign for sky and god. Then a tablet of three lines, each a number and a kind of goods, and a stack of later tablets.';

  _n = 0;
  _found = false;

  async setup() {
    await super.setup();
    this.bar = mountEl(this.root, 'cs-bar');
    this.btn = mountEl(this.bar, 'cs-btn', 'button');
    this.btn.type = 'button';
    this.btn.addEventListener('click', () => this._press());
    this.enter(this.stepIndex);
    this.repaint();
  }

  enter() { this._n = 0; this._just = false; }

  _press() {
    if (this._n >= 4) { this._n = 0; this._just = false; this.repaint(); return; }
    this._n += 1;
    this._just = true;
    this.repaint();
    if (this._n === 4 && !this._found) { this._found = true; this.after(0.35, () => this.celebrate(this.sv.W / 2, this.sv.H * 0.55)); }
  }

  stageHeight(st) { return st.portrait ? 470 : (this.stepIndex === 3 ? 412 : 442); }

  css() {
    return `
.cs-bar { display: flex; justify-content: center; padding-top: var(--sim-space-2); }
.cs-bar[hidden] { display: none; }
.cs-btn { appearance: none; min-height: 54px; min-width: 200px; padding: 8px 24px; cursor: pointer; font: 600 22px/1.1 var(--sim-font-display, var(--sim-font)); color: var(--sim-ink-on-accent, var(--sim-bg-deep)); background: var(--sim-accent); border: none; border-radius: var(--look-pill); box-shadow: 0 calc(4px * var(--look-lip)) 0 color-mix(in oklab, var(--sim-accent) 60%, black); touch-action: manipulation; }
.cs-btn:active { transform: translateY(2px); }
svg .cs-w { font-family: var(--sim-font-display, var(--sim-font)); font-weight: 600; }
svg .cs-b { font-family: var(--sim-font); font-weight: 800; }
svg .cs-new { transform-box: fill-box; transform-origin: center; animation: cs-pop 0.3s var(--look-spring) both; }
@keyframes cs-pop { from { opacity: 0; } to { opacity: 1; } }
svg .cs-dip { animation: cs-dip 0.32s ease-out both; }
@keyframes cs-dip { 0% { translate: 22px -26px; } 55% { translate: 0 0; } 100% { translate: 0 0; } }
@media (prefers-reduced-motion: reduce) { svg .cs-new, svg .cs-dip { animation: none; } }
`;
  }

  paint(st) {
    if (this.bar) { this.bar.hidden = this.stepIndex !== 3; if (this.btn) this.btn.textContent = this._n >= 4 ? 'Press again' : 'Press the reed'; }
    const s = this.stepIndex;
    if (s === 4) return { svg: this._lists(st) };
    if (s === 5) return { svg: this._stack(st) };
    return { svg: this._press3(st) };
  }

  _title(st, t, y = 26, left = false) { return `<text class="cs-w" x="${left ? 14 : st.W / 2}" y="${y}" text-anchor="${left ? 'start' : 'middle'}" font-size="${st.portrait ? 26 : 30}" dominant-baseline="central" ${fill('var(--sim-label)')}>${t}</text>`; }

  _press3(st) {
    const W = st.W, port = st.portrait, tw = Math.min(W - 24, 420), th = port ? 372 : 340, x = (W - tw) / 2, y = 54, cx = W / 2, cy = y + th / 2 + 6, r = Math.min(tw, th) * 0.33;
    const ws = anWedges(cx, cy, r), k = this._n;
    let out = this._title(st, k >= 4 ? 'Sky, or god' : `Press ${k + 1} of 4`, 26, true) + tabletSvg(x, y, tw, th);
    ws.forEach((w, i) => { if (i < k) out += wedgeSvg(w.x, w.y, w.a, w.len, w.h, { cls: i === k - 1 && this._just ? 'cs-new' : '' }); else if (i === k) out += wedgeSvg(w.x, w.y, w.a, w.len, w.h, { ghost: true }); });
    if (k < 4) { const w = ws[k]; out += reedSvg(w.x, w.y, -52, port ? 230 : 250, { cls: this._just ? 'cs-dip' : '' }); }
    return out;
  }

  _lists(st) {
    const W = st.W, port = st.portrait, tw = Math.min(W - 16, 580), x = (W - tw) / 2, y = 58, h = port ? 300 : 306, rh = h / 3;
    let out = this._title(st, 'A number and what it counts') + tabletSvg(x, y, tw, h);
    ROWS.forEach(([v, word, ic, tone], i) => {
      const cy = y + rh * (i + 0.5) + 2, s = port ? 42 : 50;
      out += numberSvg(v, x + 22, cy, s).svg;
      if (i) out += `<rect x="${n(x + 18)}" y="${n(y + rh * i - 1)}" width="${n(tw - 36)}" height="3" rx="1.5" ${fill('var(--sim-strata-6)', 'opacity:0.3')}/>`;
      const ix = x + tw * (port ? 0.58 : 0.56);
      out += `<g transform="translate(${n(ix)} ${n(cy - 26)}) scale(1.08)">${iconSvg(ic, tone).replace('<svg ', '<svg overflow="visible" ')}</g>`;
      out += `<text class="cs-w" x="${n(ix + 64)}" y="${n(cy)}" font-size="${port ? 26 : 30}" dominant-baseline="central" ${fill('var(--sim-strata-6)')}>${v} ${word}</text>`;
    });
    const ky = y + h + 44;
    out += wedgeSvg(W / 2 - (port ? 142 : 160), ky - 20, 90, 42, 14) + `<text class="cs-b" x="${n(W / 2 - (port ? 122 : 138))}" y="${ky}" font-size="21" dominant-baseline="central" ${fill('var(--sim-label)')}>means 1</text>`;
    out += cornerSvg(W / 2 + (port ? 26 : 34), ky, 28) + `<text class="cs-b" x="${n(W / 2 + (port ? 66 : 74))}" y="${ky}" font-size="21" dominant-baseline="central" ${fill('var(--sim-label)')}>means 10</text>`;
    return out;
  }

  _stack(st) {
    const W = st.W, port = st.portrait, tw = Math.min(W - 24, 470), cx = W / 2, top = 58, gap = port ? 72 : 68, bh = port ? 62 : 58;
    let out = this._title(st, 'Lists came first');
    STACK.forEach(([label, tone], i) => {
      const y = top + i * gap, w = tw - (3 - i) * 26;
      out += `<g class="cs-new">${tabletSvg(cx - w / 2, y, w, bh)}<text class="cs-w" x="${cx}" y="${n(y + bh / 2 + 1)}" text-anchor="middle" font-size="${port ? 24 : 26}" dominant-baseline="central" ${fill('var(--sim-strata-6)')}>${label}</text></g>`;
    });
    const y = top + 4 * gap + 6, h = port ? 96 : 92;
    out += tabletSvg(cx - tw / 2 - 8, y, tw + 16, h, { col: 'var(--sim-gold)' });
    out += `<text class="cs-w" x="${cx}" y="${n(y + h / 2 + 1)}" text-anchor="middle" font-size="${port ? 30 : 34}" dominant-baseline="central" ${fill('var(--sim-strata-6)')}>Lists and accounts</text>`;
    return out;
  }
}
