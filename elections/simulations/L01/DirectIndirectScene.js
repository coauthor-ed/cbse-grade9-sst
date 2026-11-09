// DirectIndirectScene - L01 s04. Two columns side by side. Left: citizens straight to the office.
// Right: citizens to representatives, then to the office. b0 Direct is lit. b1 both; a chip lights
// one office and its whole path from the voter.
import { SvgScene } from 'simulations/base/kit/SimSvg.js';
import { tapLight } from 'simulations/base/kit/TapLight.js';
import { esc } from 'simulations/base/SimUi.js';
import { peopleArt } from '../shared/MatterRounds.js';

const m = (idx) => [{ idx, dwellMs: null }];
const DIRECT = [['ls', 'Lok Sabha'], ['vs', 'Vidhan Sabha'], ['lb', 'Local bodies']];
const INDIRECT = [['pr', 'President'], ['vp', 'Vice President'], ['rs', 'Rajya Sabha']];
const CHIPS_D = DIRECT.map(([id, label]) => ({ id, label, targets: [id, 'dpath'], tone: 2 }));
const CHIPS_I = INDIRECT.map(([id, label]) => ({ id, label, targets: [id, 'ipath'], tone: 5 }));
const inner = (svg) => svg.replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '');

export class DirectIndirectScene extends SvgScene {
  static BEAT_STEP_MAP = [m(0), m(1)];
  static ARIA_LABEL = 'Two columns. In the direct column, citizens vote straight for members of the Lok Sabha, Vidhan Sabha and local bodies. In the indirect column, citizens vote for representatives, and they choose the President, the Vice President and members of the Rajya Sabha. Chips light each path.';
  static HEIGHT = 530;
  static PORTRAIT_HEIGHT = 626;
  tl = tapLight({ label: 'Offices', chips: CHIPS_D, onChange: () => this.repaint() });

  async setup() { await super.setup(); this.tl.mount(this.root, this); }
  destroy() { this.tl.destroy(); super.destroy(); }
  stageHeight(st) { return st.portrait ? 430 : 352; }
  enter(step) { this.tl.reset(); this.tl.set({ chips: step === 0 ? CHIPS_D : [...CHIPS_D, ...CHIPS_I] }); }
  css() { return `.di-h { font-family: var(--sim-font-display, var(--sim-font)); font-weight: 700; fill: var(--sim-label); }
.di-t { font-family: var(--sim-font); font-weight: 800; fill: var(--sim-label); }`; }

  _column(st, x, w, title, tone, rows, indirect, dim, pathKey) {
    const P = st.portrait, cx = x + w / 2, c = `var(--sim-series-${tone})`, H = st.H;
    const litAny = this.tl.any(), pathOff = litAny && !this.tl.has(pathKey);
    const rowH = P ? 58 : 46, gap = P ? 8 : 6, top = H - 3 * rowH - 2 * gap - 8;
    let s = `<g opacity="${dim ? 0.3 : 1}">`;
    s += `<rect x="${x}" y="4" width="${w}" height="${H - 8}" rx="18" style="fill:color-mix(in srgb,${c} 10%,var(--sim-bg-surface));stroke:${c};stroke-width:3"/>`;
    s += `<text class="di-h" x="${cx}" y="34" font-size="${P ? 20 : 23}" text-anchor="middle">${esc(title)}</text>`;
    const art = inner(peopleArt(5, tone));
    s += `<g transform="translate(${cx - 66} 44) scale(1.2)" opacity="${pathOff ? 0.3 : 1}">${art}</g><text class="di-t" x="${cx}" y="122" font-size="15" text-anchor="middle" opacity="${pathOff ? 0.3 : 1}">citizens vote</text>`;
    const arrow = (y0, y1) => `<path d="M${cx} ${y0} V${y1 - 12}" style="fill:none;stroke:${c};stroke-width:6;stroke-linecap:round" opacity="${pathOff ? 0.25 : 1}"/><path d="M${cx - 12} ${y1 - 14} L${cx} ${y1} L${cx + 12} ${y1 - 14} Z" style="fill:${c}" opacity="${pathOff ? 0.25 : 1}"/>`;
    if (indirect) {
      const mid = 158;
      s += arrow(130, mid - 18);
      s += `<g opacity="${pathOff ? 0.3 : 1}"><rect x="${x + 10}" y="${mid - 16}" width="${w - 20}" height="38" rx="12" style="fill:var(--sim-bg-surface);stroke:${c};stroke-width:3"/><text class="di-t" x="${cx}" y="${mid + 9}" font-size="${P ? 14 : 16}" text-anchor="middle">representatives</text></g>`;
      s += arrow(mid + 24, top - 2);
    } else s += arrow(130, top - 2);
    rows.forEach(([id, name], i) => {
      const y = top + i * (rowH + gap), on = this.tl.has(id), off = this.tl.off(id);
      s += `<g opacity="${off ? 0.3 : 1}"><rect x="${x + 10}" y="${y + 3}" width="${w - 20}" height="${rowH}" rx="12" style="fill:${c}"/><rect x="${x + 10}" y="${y}" width="${w - 20}" height="${rowH}" rx="12" style="fill:${on ? `color-mix(in srgb,${c} 34%,var(--sim-bg-surface))` : 'var(--sim-bg-surface)'};stroke:${c};stroke-width:${on ? 4 : 2.5}"/><text class="di-h" x="${cx}" y="${y + rowH / 2 + 6}" font-size="${P ? 15.5 : 18}" text-anchor="middle">${esc(name)}</text></g>`;
    });
    return s + '</g>';
  }

  paint(st) {
    const W = st.W, gap = 8, w = (W - gap) / 2, b = this.stepIndex;
    return { svg: this._column(st, 0, w, 'Direct', 2, DIRECT, false, false, 'dpath') + this._column(st, w + gap, w, 'Indirect', 5, INDIRECT, true, b === 0, 'ipath') };
  }
}
