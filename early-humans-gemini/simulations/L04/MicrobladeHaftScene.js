/**
 * MicrobladeHaftScene - blk-l04-s03. The hero is one handle with a groove, drawn big.
 * Beat 0: bare handle, twelve blades, a lump of gum. Beat 1: the blades drop into the groove one by one,
 * and the edge reads about 24 cm. Beat 2: one blade is dull; the learner swaps it and the tool works again.
 * The drop is a staggered CSS animation, so the end state is right on deep link, resume and Previous.
 */
import { SvgScene, fill, stroke, shade } from 'simulations/base/kit/SimSvg.js';
import { at, text, bladeArt, STONE, WOOD, INK } from '../shared/StoneAgeArt.js';

const MAP = [0, 1, 2].map((idx) => [{ idx, dwellMs: null }]);
const N = 12;
const GUM = 'color-mix(in srgb, var(--sim-strata-5) 60%, var(--sim-series-8))';
const DULL = 'color-mix(in srgb, var(--sim-bad) 55%, var(--sim-strata-6))';

export class MicrobladeHaftScene extends SvgScene {
  static simId = 'microblade-haft-scene';
  static BEAT_STEP_MAP = MAP;
  static CONTROLS = [];
  static ARIA_LABEL = 'A long wooden handle with a groove cut along it. Twelve small stone blades drop into the groove one by one, held by tree gum, and make one cutting edge about 24 centimetres long. One blade goes dull, and swapping that one blade repairs the tool.';

  constructor(container, config) {
    super(container, config);
    this._fresh = true;
    this._swapped = false;
    this._dull = 4;
    this._found = false;
    this._onClick = (e) => { if (e.target?.closest?.('[data-swap]')) this._act(); };
  }

  async setup() {
    await super.setup();
    this.root.addEventListener('click', this._onClick);
  }

  destroy() { this.root?.removeEventListener('click', this._onClick); super.destroy(); }

  css() {
    return `
.mh-drop { animation: mh-drop 0.42s cubic-bezier(.3,1.5,.5,1) both; animation-delay: var(--d, 0s); }
@keyframes mh-drop { from { transform: translateY(-120px); opacity: 0; } 30% { opacity: 1; } to { transform: none; } }
.mh-out { animation: mh-out 0.5s ease-in both; }
@keyframes mh-out { to { transform: translate(14px, -130px) rotate(30deg); opacity: 0; } }
.mh-late { animation: mh-late 0.4s var(--look-spring-soft, ease-out) both; animation-delay: var(--d, 0s); }
@keyframes mh-late { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
.mh-btn { position: absolute; left: 50%; bottom: 8px; transform: translateX(-50%); min-height: 48px; padding: 8px 22px; font: 800 17px var(--sim-font);
  color: var(--sim-bg-surface); background: var(--sim-accent); border: 0; border-radius: calc(14px * var(--look-radius, 1));
  box-shadow: 0 calc(4px * var(--look-lip, 1)) 0 color-mix(in srgb, var(--sim-accent) 62%, var(--sim-label)); cursor: pointer; white-space: nowrap; }
.mh-btn:active { transform: translateX(-50%) translateY(3px); box-shadow: none; }
.sv-over { pointer-events: none; } .mh-btn { pointer-events: auto; }
`;
  }

  enter() { this._fresh = true; this._swapped = false; this._dull = 4; }

  stageHeight(st) { return st.portrait ? 380 : 400; }

  _act() {
    if (this.stepIndex !== 2) return;
    if (this._swapped) { this._swapped = false; this._dull = (this._dull + 5) % N; this._fresh = false; this.repaint(); return; }
    this._swapped = true;
    this._justSwapped = true;
    if (!this._found) {
      this._found = true;
      const g = this._geo(this.sv);
      this.celebrate(g.slot(this._dull), g.top - 30);
    }
    this.repaint();
  }

  _geo(st) {
    const P = st.portrait, x0 = P ? 34 : 54, x1 = st.W - (P ? 14 : 34);
    const butt = P ? 34 : 60, rowX = x0 + butt, rowW = x1 - rowX - 8, w = rowW / N;
    const top = P ? 200 : 216, h = P ? 54 : 64;
    return { P, x0, x1, rowX, rowW, w, top, h, bh: P ? 40 : 52, slot: (i) => rowX + (i + 0.5) * w };
  }

  _handle(g) {
    const body = `<rect x="${g.x0}" y="${g.top}" width="${g.x1 - g.x0}" height="${g.h}" rx="${g.h * 0.42}" ${fill(WOOD, `stroke:${shade(WOOD, 60)};stroke-width:4`)}/>`;
    const grainLines = [0.34, 0.6, 0.8].map((k) => `<path d="M${g.x0 + 18} ${g.top + g.h * k} C${g.x0 + (g.x1 - g.x0) * 0.3} ${g.top + g.h * k - 5} ${g.x0 + (g.x1 - g.x0) * 0.6} ${g.top + g.h * k + 5} ${g.x1 - 16} ${g.top + g.h * k}" ${stroke(shade(WOOD, 72), 2.5)}/>`).join('');
    const gloss = `<rect x="${g.x0 + 14}" y="${g.top + 12}" width="${g.x1 - g.x0 - 30}" height="5" rx="2.5" ${fill('color-mix(in srgb, var(--sim-bg-surface) 28%, transparent)')}/>`;
    const groove = `<rect x="${g.rowX - 3}" y="${g.top - 3}" width="${g.rowW + 6}" height="16" rx="5" ${fill(shade(WOOD, 42))}/>`;
    const wraps = [0, 1, 2, 3].map((i) => `<rect x="${g.x0 + 12 + i * 8}" y="${g.top - 1}" width="6" height="${g.h + 2}" rx="3" ${fill('color-mix(in srgb, var(--sim-strata-5) 70%, var(--sim-label))')}/>`).join('');
    return body + grainLines + gloss + groove + (g.P ? '' : wraps);
  }

  _blades(g, step) {
    let s = '';
    if (step === 0) {
      // twelve loose blades in a shallow heap above the handle, each one on its own
      for (let i = 0; i < N; i += 1) {
        const x = g.rowX + 8 + (i % 6 + 0.5) * (g.rowW * 0.72 / 6), y = (g.P ? 92 : 96) + (i >= 6 ? 50 : 0) + (i % 2) * 6;
        s += at(x, y, 1, `<g transform="rotate(${[-14, 9, -5, 16, -20, 6, 12, -9, 20, -3, 8, -15][i]})">${bladeArt(g.w * 0.9, g.bh * 0.82, STONE, i)}</g>`);
      }
      return s;
    }
    const gum = `<rect x="${g.rowX - 2}" y="${g.top - 7}" width="${g.rowW + 4}" height="11" rx="5" ${fill(GUM)}/>`;
    for (let i = 0; i < N; i += 1) {
      const anim = this._fresh && step === 1 ? ` class="mh-drop" style="--d:${(i * 0.17).toFixed(2)}s"` : '';
      const isDull = step === 2 && i === this._dull;
      if (isDull && this._swapped) {
        s += `<g transform="translate(${g.slot(i)} ${g.top + 4})"><g class="mh-drop" style="--d:0.35s">${bladeArt(g.w - 2, g.bh, STONE, i + 3)}</g></g>`;
        s += `<g transform="translate(${g.slot(i)} ${g.top + 4})"><g class="${this._justSwapped ? 'mh-out' : ''}" style="${this._justSwapped ? '' : 'opacity:0'}">${bladeArt(g.w - 2, g.bh * 0.7, DULL, i)}</g></g>`;
      } else {
        const body = isDull ? bladeArt(g.w - 2, g.bh * 0.68, DULL, i)
          + `<path d="M${-g.w * 0.3} ${-g.bh * 0.6} l5 9 l-6 7 l5 8" ${stroke(INK, 2.5)}/>` : bladeArt(g.w - 2, g.bh, STONE, i);
        s += `<g transform="translate(${g.slot(i)} ${g.top + 4})"><g${anim}>${body}</g></g>`;
      }
    }
    return s + gum;
  }

  paint(st) {
    const g = this._geo(st), step = this.stepIndex;
    let svg = '', over = '';
    const late = this._fresh && step === 1 ? ' class="mh-late" style="--d:2.1s"' : '';
    if (step === 0) {
      svg += this._handle(g) + this._blades(g, step);
      const gx = g.x1 - (g.P ? 40 : 62), gy = g.P ? 112 : 118;
      svg += `<path d="M${gx - 30} ${gy + 10} Q${gx - 34} ${gy - 24} ${gx - 2} ${gy - 26} Q${gx + 34} ${gy - 22} ${gx + 28} ${gy + 10} Q${gx} ${gy + 22} ${gx - 30} ${gy + 10} Z" ${fill(GUM, `stroke:${shade(GUM, 60)};stroke-width:3`)}/>`;
      svg += text(gx, gy + 40, 'gum', { size: 17, weight: 600, display: true });
      svg += text(g.rowX + g.rowW * 0.36, g.P ? 40 : 42, '12 blades, each 2 cm', { size: g.P ? 19 : 22, weight: 600, display: true });
      svg += `<path d="M${g.rowX + 20} ${g.top + g.h + 18} H${g.rowX + g.rowW - 20}" ${stroke(INK, 3)}/>`;
      svg += text((g.x0 + g.x1) / 2, g.top + g.h + 46, 'a handle with a groove', { size: g.P ? 19 : 22, weight: 600, display: true });
    } else {
      svg += this._handle(g) + this._blades(g, step);
      const by = g.top - g.bh - 14;
      if (step === 1) {
        svg += `<g${late}><path d="M${g.rowX} ${by - 8} V${by + 8} M${g.rowX} ${by} H${g.rowX + g.rowW} M${g.rowX + g.rowW} ${by - 8} V${by + 8}" ${stroke('var(--sim-accent)', 4)}/>`;
        svg += text(g.rowX + g.rowW / 2, by - 18, 'one cutting edge', { size: g.P ? 19 : 22, weight: 600, display: true });
        svg += text(g.rowX + g.rowW / 2, g.top + g.h + 50, '12 x 2 cm = about 24 cm', { size: g.P ? 24 : 30, weight: 600, display: true, col: 'var(--sim-accent)' }) + '</g>';
      } else {
        const cx = g.slot(this._dull);
        if (!this._swapped) {
          svg += `<path d="M${cx} ${g.top - g.bh * 0.68 - 34} V${g.top - g.bh * 0.68 - 8}" ${stroke('var(--sim-bad)', 4)}/><path d="M${cx - 8} ${g.top - g.bh * 0.68 - 14} L${cx} ${g.top - g.bh * 0.68 - 2} L${cx + 8} ${g.top - g.bh * 0.68 - 14} Z" ${fill('var(--sim-bad)')}/>`;
          svg += text(Math.max(70, Math.min(st.W - 70, cx)), g.top - g.bh * 0.68 - 44, 'one blade goes dull', { size: g.P ? 19 : 22, weight: 600, display: true });
        } else {
          svg += text(st.W / 2, g.top - g.bh - 34, 'same handle, fresh blade', { size: g.P ? 19 : 22, weight: 600, display: true, col: 'var(--sim-good)' });
        }
        svg += text(st.W / 2, g.top + g.h + 44, this._swapped ? '11 blades kept' : '11 blades still sharp', { size: g.P ? 19 : 22, weight: 600, display: true });
        over = `<button type="button" class="mh-btn" data-swap>${this._swapped ? 'Try another blade' : 'Swap the dull blade'}</button>`;
      }
    }
    this._fresh = false;
    this._justSwapped = false;
    return { svg, over };
  }
}
