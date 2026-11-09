/**
 * WaterHarvestChainScene - blk-l07-s06, mounts at beat 3 of 4 (earlier beats show the weights, the tank, the dockyard).
 * Four drawn water works in order, from the small to the large: gabarband, dam and canal, joined tanks, dockyard.
 * Chips light one. Base chain: SvgScene.
 */
import { SvgScene, fill, stroke, shade } from 'simulations/base/kit/SimSvg.js';
import { tapLight } from 'simulations/base/kit/TapLight.js';
import { wallSvg, WATER, SOIL, STONE, SAND, CLAY, n } from './HarappanDraw.js';

const MAP = [0, 1, 2, 3].map((idx) => [{ idx, dwellMs: null }]);
const wave = (x, y, w) => `<path d="M${n(x)} ${n(y)}q${n(w / 8)} -5 ${n(w / 4)} 0t${n(w / 4)} 0t${n(w / 4)} 0t${n(w / 4)} 0" ${stroke('color-mix(in oklab, var(--sim-sea-shallow) 60%, white)', 2.5)}/>`;
const CARDS = [
  { id: 'gab', title: 'Gabarband', sub: 'Early Harappan', draw: (x, y, w, h) => { // a stream behind a small check dam
    const f = y + h;
    return `<path d="M${x} ${f}V${y + h * 0.3}L${n(x + w * 0.42)} ${f - 14}H${n(x + w * 0.6)}L${x + w} ${y + h * 0.22}V${f}Z" ${fill(SAND)}/>`
      + `<path d="M${n(x + w * 0.1)} ${n(y + h * 0.5)}H${n(x + w * 0.52)}V${f - 14}H${n(x + w * 0.42)}Z" ${fill(WATER)}/>` + wave(x + w * 0.16, y + h * 0.56, w * 0.3)
      + rocks(x + w * 0.48, f - 12, h * 0.56); } },
  { id: 'dam', title: 'Dam and canal', sub: 'Dholavira', draw: (x, y, w, h) => {
    const m = y + h * 0.5;
    return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10" ${fill(SAND)}/><path d="M${n(x + w * 0.2)} ${y}V${y + h}" ${stroke(WATER, 20)}/>`
      + `<path d="M${n(x + w * 0.2)} ${m}H${n(x + w * 0.74)}" ${stroke(WATER, 12)}/><rect x="${n(x + w * 0.7)}" y="${n(m - h * 0.3)}" width="${n(w * 0.25)}" height="${n(h * 0.6)}" rx="6" ${fill(WATER)}/><path d="M${n(x + w * 0.04)} ${n(m + 20)}H${n(x + w * 0.36)}" ${stroke(STONE, 13)}/>`; } },
  { id: 'tank', title: 'Joined tanks', sub: 'Dholavira', draw: (x, y, w, h) => {
    const f = y + h, g = w / 3;
    let out = `<rect x="${x}" y="${y + 8}" width="${w}" height="${h - 8}" rx="8" ${fill(shade(STONE, 92))}/>`;
    [0, 1, 2].forEach((i) => { const tx = x + i * g + 6, tw = g - 12, ty = y + 14 + i * 12, th = f - ty - 8 - (2 - i) * 2;
      out += `<rect x="${n(tx)}" y="${n(ty)}" width="${n(tw)}" height="${n(th)}" rx="4" ${fill(shade(STONE, 58))}/><rect x="${n(tx)}" y="${n(ty + 12)}" width="${n(tw)}" height="${n(th - 12)}" rx="4" ${fill(WATER)}/>`
        + (i < 2 ? `<rect x="${n(tx + tw - 2)}" y="${n(ty + 20 + i * 8)}" width="16" height="9" ${fill(WATER)}/>` : ''); });
    return out; } },
  { id: 'dock', title: 'Dockyard', sub: 'Lothal', draw: (x, y, w, h) => {
    const b = 16;
    return wallSvg(x, y + h, w, h, CLAY, { rows: 6, brick: 26 }) + `<rect x="${x + b}" y="${y + b}" width="${w - 2 * b}" height="${h - 2 * b}" rx="6" ${fill(WATER)}/>`
      + wave(x + b + 8, y + h * 0.36, w - 2 * b - 16) + wave(x + b + 8, y + h * 0.66, w - 2 * b - 16)
      + `<path d="M${n(x + w * 0.34)} ${n(y + h * 0.5)}q${n(w * 0.16)} 22 ${n(w * 0.32)} 0l-${n(w * 0.04)} -7h-${n(w * 0.24)}z" ${fill(SOIL)}/><path d="M${n(x + w * 0.5)} ${n(y + h * 0.48)}V${n(y + h * 0.22)}" ${stroke(shade(SOIL), 3.5)}/>`; } },
];
function rocks(x, f, h) {
  let out = '';
  for (let r = 0; r < 4; r++) for (let i = 0; i <= 3 - r; i++) out += `<rect x="${n(x + i * 16 + r * 8)}" y="${n(f - (r + 1) * h / 4)}" width="15" height="${n(h / 4 - 1)}" rx="5" ${fill(i % 2 ? STONE : shade(STONE, 78))}/>`;
  return out;
}
const CHIPS = CARDS.map((k) => ({ id: k.id, label: k.title, targets: [k.id], tone: 1 }));

export class WaterHarvestChainScene extends SvgScene {
  static BEAT_STEP_MAP = MAP;
  static CONTINUOUS = false;
  static ARIA_LABEL = 'Four water works from small to large: a gabarband check dam across a stream, a dam and canal at Dholavira, joined deep tanks at Dholavira and the brick dockyard at Lothal.';

  tl = tapLight({ label: 'Water works', chips: CHIPS, onChange: () => this.repaint() });
  async setup() { await super.setup(); this.tl.mount(this.root, this); this.tl.reset(); }
  enter() { this.tl.reset(); }
  destroy() { this.tl.destroy(); super.destroy(); }
  stageHeight(st) { return st.portrait ? 430 : 400; }

  paint(st) {
    const gap = 16, cw = (st.W - gap) / 2, ch = (st.H - gap) / 2, pad = 8;
    let svg = '';
    CARDS.forEach((k, i) => {
      const x = (i % 2) * (cw + gap), y = Math.floor(i / 2) * (ch + gap), off = this.tl.off(k.id);
      svg += `<g style="${off ? 'opacity:0.2' : ''}"><rect x="${x}" y="${y}" width="${cw}" height="${ch}" rx="14" ${fill('var(--sim-bg-surface)', 'stroke:var(--sim-stroke);stroke-width:2')}/>`
        + `<text class="wh-t" x="${x + cw / 2}" y="${y + 22}" text-anchor="middle" font-size="${st.portrait ? 18 : 21}" dominant-baseline="central" ${fill('var(--sim-label)')}>${k.title}</text>`
        + `<text class="wh-s" x="${x + cw / 2}" y="${y + 44}" text-anchor="middle" font-size="15" dominant-baseline="central" ${fill('var(--sim-label-muted)')}>${k.sub}</text>`
        + k.draw(x + pad + 4, y + 60, cw - 2 * pad - 8, ch - 60 - pad) + '</g>';
    });
    for (const [ax, ay] of [[cw + gap / 2, ch / 2], [cw + gap / 2, ch + gap + ch / 2]]) svg += `<circle cx="${ax}" cy="${ay}" r="15" ${fill('var(--sim-series-2)')}/><path d="M${ax - 6} ${ay}h12m-5 -5l5 5l-5 5" ${stroke('var(--sim-ink-on-2, var(--sim-bg-deep))', 3)}/>`;
    return { svg };
  }

  css() { return 'svg .wh-t { font-family: var(--sim-font-display, var(--sim-font)); font-weight: 600; } svg .wh-s { font-weight: 700; }'; }
}
