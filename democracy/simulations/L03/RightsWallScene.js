// RightsWallScene - L03 s06. Six tiles carry the table: each right, its Articles, a small drawn sign.
// b0 a chip lights a tile and gives an example. b1 Remedies is lit, Articles 32 and 226: this is what
// makes the rest enforceable. b2 a band runs round all six: indivisible, inalienable.
import { SvgScene } from 'simulations/base/kit/SimSvg.js';
import { tapLight } from 'simulations/base/kit/TapLight.js';
import { esc } from 'simulations/base/SimUi.js';
import { civicSvg } from '../shared/CivicArt.js';

const m = (idx) => [{ idx, dwellMs: null }];
const RIGHTS = [
  { id: 'eq', name: 'Right to Equality', short: 'Equality', art: 'Articles 14\u201318', ex: 'The law treats you the same, whatever your status.', sign: 'equal', tone: 1 },
  { id: 'fr', name: 'Right to Freedom', short: 'Freedom', art: 'Articles 19\u201322', ex: 'You may speak, meet peacefully and move across India.', sign: 'mike', tone: 2 },
  { id: 'ex', name: 'Right Against Exploitation', short: 'Exploitation', art: 'Articles 23\u201324', ex: 'Human trafficking, forced work and hazardous child labour are banned.', sign: 'chain', tone: 3 },
  { id: 're', name: 'Right to Freedom of Religion', short: 'Religion', art: 'Articles 25\u201328', ex: 'You may profess and practise any faith.', sign: 'bookOpen', tone: 4 },
  { id: 'cu', name: 'Cultural and Educational Rights', short: 'Culture', art: 'Articles 29\u201330', ex: 'Minorities may keep their language and run their own institutions.', sign: 'school', tone: 5 },
  { id: 'cr', name: 'Right to Constitutional Remedies', short: 'Remedies', art: 'Article 32', ex: 'You may go to court when a right is violated.', sign: 'court', tone: 7 },
];
const CHIPS = RIGHTS.map((r) => ({ id: r.id, label: r.short, targets: [r.id], tone: r.tone }));

function words(text, max) {
  const out = []; let l = '';
  for (const w of text.split(' ')) { if ((l + ' ' + w).trim().length > max) { out.push(l); l = w; } else l = (l + ' ' + w).trim(); }
  if (l) out.push(l);
  return out;
}

export class RightsWallScene extends SvgScene {
  static BEAT_STEP_MAP = [m(0), m(1), m(2)];
  static ARIA_LABEL = 'Six tiles, one for each Fundamental Right with its Articles. Chips light a right and give an example. Then the Right to Constitutional Remedies is lit, with Articles 32 and 226. Then a band runs round all six: indivisible and inalienable.';
  static HEIGHT = 420;
  static PORTRAIT_HEIGHT = 540;
  tl = tapLight({ label: 'Fundamental Rights', chips: CHIPS, onChange: () => this.repaint() });

  async setup() { await super.setup(); this.tl.mount(this.root, this); }
  destroy() { this.tl.destroy(); super.destroy(); }
  stageHeight(st) { return st.portrait ? 288 : 296; }
  enter(step) { this.tl.reset(); this.tl.set({ disabled: step !== 0, chips: CHIPS }); if (this.root) this.root.dataset.chips = step === 0 ? '1' : '0'; }
  css() { return `.sim-dom-root[data-chips="0"] .tl-row { visibility: hidden; }
.sim-dom-root:not(.sim-dom-root--portrait) .tl-row { gap: 4px; flex-wrap: nowrap; }
.sim-dom-root:not(.sim-dom-root--portrait) .tl-chip { padding-left: 6px; padding-right: 6px; flex: 1 1 auto; min-width: 0; }
.rw-n { font-family: var(--sim-font-display, var(--sim-font)); font-weight: 700; fill: var(--sim-label); }
.rw-a { font-family: var(--sim-font); font-weight: 800; fill: var(--sim-label-muted); }
.rw-x { font-family: var(--sim-font); font-weight: 800; fill: var(--sim-label); }`; }

  _sign(r, x, y, h) {
    if (r.sign === 'equal') return `<rect x="${x - 20}" y="${y - 34}" width="40" height="9" rx="4" style="fill:var(--sim-series-1)"/><rect x="${x - 20}" y="${y - 18}" width="40" height="9" rx="4" style="fill:var(--sim-series-1)"/>`;
    if (r.sign === 'chain') return `<g style="fill:none;stroke:var(--sim-series-3);stroke-width:6"><rect x="${x - 24}" y="${y - 34}" width="26" height="15" rx="7"/><rect x="${x - 2}" y="${y - 24}" width="26" height="15" rx="7"/></g>`;
    return civicSvg(r.sign, x, y, r.sign === 'mike' ? { h } : { w: h });
  }

  paint(st) {
    const P = st.portrait, W = st.W, cols = P ? 2 : 3, gap = 8, tw = (W - gap * (cols - 1)) / cols, th = P ? 70 : 112;
    const lit = this.stepIndex === 1 ? 'cr' : this.tl.lit()[0], all = this.stepIndex === 2;
    const size = P ? 14.5 : 17, wrap = P ? 23 : 25;
    let s = '';
    RIGHTS.forEach((r, i) => {
      const x = (i % cols) * (tw + gap), y = Math.floor(i / cols) * (th + gap) + 4, off = !all && lit && lit !== r.id, on = lit === r.id;
      s += `<g opacity="${off ? 0.3 : 1}"><rect x="${x}" y="${y + 3}" width="${tw}" height="${th}" rx="14" style="fill:color-mix(in srgb,var(--sim-series-${r.tone}) 40%,var(--sim-label))"/>`
        + `<rect x="${x}" y="${y}" width="${tw}" height="${th}" rx="14" style="fill:color-mix(in srgb,var(--sim-series-${r.tone}) 16%,var(--sim-bg-surface));stroke:var(--sim-series-${r.tone});stroke-width:${on ? 5 : 2.5}"/>`
        + (P ? '' : this._sign(r, x + tw - 44, y + th - 7, 62));
      words(r.name, wrap).forEach((l, k) => { s += `<text class="rw-n" x="${x + 10}" y="${y + (P ? 19 : 24) + k * (size + 3)}" font-size="${size}">${esc(l)}</text>`; });
      s += `<text class="rw-a" x="${x + 10}" y="${y + th - (P ? 7 : 10)}" font-size="15">${esc(r.art)}</text></g>`;
    });
    const rows = Math.ceil(6 / cols), y0 = rows * (th + gap) + 4;
    if (all) {
      s += `<rect x="3" y="1" width="${W - 6}" height="${rows * (th + gap) + 2}" rx="18" style="fill:none;stroke:var(--sim-gold);stroke-width:6"/>`;
      s += `<text class="rw-n" x="${W / 2}" y="${y0 + 22}" font-size="20" text-anchor="middle">indivisible and inalienable</text>`;
    } else if (this.stepIndex === 1) {
      s += `<text class="rw-n" x="${W / 2}" y="${y0 + 22}" font-size="19" text-anchor="middle">Articles 32 and 226: go to court</text>`;
    } else {
      const r = RIGHTS.find((q) => q.id === lit);
      const lines = words(r ? r.ex : 'Tap a name below', P ? 44 : 70);
      lines.forEach((l, k) => { s += `<text class="rw-x" x="${W / 2}" y="${y0 + 16 + k * 19}" font-size="16" text-anchor="middle">${esc(l)}</text>`; });
    }
    return { svg: s };
  }
}
