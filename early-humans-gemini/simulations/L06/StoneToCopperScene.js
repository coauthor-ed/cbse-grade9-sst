/**
 * StoneToCopperScene - blk-l06-s04. Three toolkits on one true-scale rail: stone, then copper with stone, then bronze.
 * Beat 0 copper joins the kit. Beat 1 the name: chalco + lithic. Beat 2 bronze: copper + tin, about 3500 BCE.
 */
import { SvgScene, fill, stroke, shade, cushionRect } from 'simulations/base/kit/SimSvg.js';
import { at, text, COPPER, STONE, WOOD } from '../shared/StoneAgeArt.js';

const MAP = [0, 1, 2].map((idx) => [{ idx, dwellMs: null }]);
const BRONZE = 'color-mix(in srgb, var(--sim-gold) 70%, var(--sim-strata-3))';

const celt = (col) => `<path d="M-14 -40 Q0 -48 14 -40 L24 34 Q0 48 -24 34 Z" ${fill(col, `stroke:${shade(col, 60)};stroke-width:4;stroke-linejoin:round`)}/><path d="M-6 -30 L-10 22" ${stroke('color-mix(in srgb, var(--sim-bg-surface) 55%, transparent)', 4)}/>`;
const blade = (col) => `<path d="M-10 40 L-14 -18 L0 -44 L14 -18 L10 40 Z" ${fill(col, `stroke:${shade(col, 60)};stroke-width:4;stroke-linejoin:round`)}/>`;
const awl = (col) => `<rect x="-5" y="-44" width="10" height="64" rx="3" ${fill(col, `stroke:${shade(col, 60)};stroke-width:3`)}/><path d="M-5 20 L0 44 L5 20 Z" ${fill(col, `stroke:${shade(col, 60)};stroke-width:3`)}/>`;
const dagger = (col) => `<path d="M-13 12 L0 -46 L13 12 Z" ${fill(col, `stroke:${shade(col, 60)};stroke-width:4;stroke-linejoin:round`)}/><path d="M0 -38 V10" ${stroke(shade(col, 72), 3)}/><rect x="-18" y="12" width="36" height="9" rx="3" ${fill(WOOD)}/><rect x="-6" y="21" width="12" height="24" rx="4" ${fill(WOOD)}/>`;
const axe = (col) => `<rect x="-6" y="-46" width="12" height="94" rx="5" ${fill(WOOD, `stroke:${shade(WOOD, 60)};stroke-width:3`)}/><path d="M-30 -34 Q-40 -18 -30 0 L0 -8 V-26 Z" ${fill(col, `stroke:${shade(col, 60)};stroke-width:4;stroke-linejoin:round`)}/>`;

const KITS = [
  { id: 'stone', title: 'Stone', date: 'from 7000 BCE', tools: [() => celt(STONE), () => blade(STONE), () => celt(STONE)] },
  { id: 'chal', title: 'Copper', date: 'copper + stone, by 4000 BCE', tools: [() => celt(STONE), () => awl(COPPER), () => axe(COPPER)] },
  { id: 'bronze', title: 'Bronze', date: 'around 3500 BCE', tools: [() => axe(BRONZE), () => dagger(BRONZE), () => awl(BRONZE)] },
];
const READ = ['A first metal: copper', 'chalco = copper, lithic = stone', 'Bronze: copper mixed with tin'];
const LIT = [1, 1, 2];

export class StoneToCopperScene extends SvgScene {
  static simId = 'stone-to-copper-scene';
  static BEAT_STEP_MAP = MAP;
  static CONTROLS = [];
  static ARIA_LABEL = 'Three toolkits on a true-scale time rail from 7000 BCE. First stone tools. By about 4000 BCE copper tools sit beside stone ones, the Chalcolithic. Around 3500 BCE come bronze tools, copper mixed with tin.';

  constructor(container, config) { super(container, config); this._fresh = true; }

  css() {
    return `
.sc-pop { animation: sc-pop 0.5s var(--look-spring-soft, ease-out) both; animation-delay: var(--d, 0s); transform-box: fill-box; transform-origin: center; }
@keyframes sc-pop { from { opacity: 0; transform: scale(0.5) translateY(14px); } to { opacity: 1; transform: none; } }
`;
  }

  enter() { this._fresh = true; }

  stageHeight(st) { return st.portrait ? 500 : 400; }

  _rail(st, y) {
    const x0 = 20, x1 = st.W - 20, X = (bce) => x0 + ((7000 - bce) / 4000) * (x1 - x0), step = this.stepIndex;
    const dates = [[7000, '7000 BCE', 'start'], [4000, '4000', 'end'], [3500, '3500', 'start']];
    let s = `<rect x="${x0}" y="${y - 4}" width="${x1 - x0}" height="8" rx="4" ${fill('var(--sim-track)')}/>`;
    s += `<rect x="${x0}" y="${y - 4}" width="${X(4000) - x0}" height="8" rx="4" ${fill(STONE)}/><rect x="${X(4000)}" y="${y - 4}" width="${X(3500) - X(4000)}" height="8" ${fill(COPPER)}/>`;
    dates.forEach(([d, t, a], i) => {
      const lit = LIT[step], on = i <= lit;
      s += `<circle cx="${X(d)}" cy="${y}" r="${i === lit ? 10 : 7}" ${fill(on ? 'var(--sim-accent)' : 'var(--sim-track)', 'stroke:var(--sim-bg-surface);stroke-width:3')}/>`;
      s += text(X(d) + (a === 'end' ? 6 : a === 'start' && i ? -6 : 0), y + 28, t, { size: 16, weight: 600, display: true, anchor: a, opacity: on ? 1 : 0.4 });
    });
    return s;
  }

  paint(st) {
    const P = st.portrait, step = this.stepIndex, lit = LIT[step];
    let s = '';
    KITS.forEach((k0, i) => {
      const k = step >= 1 && i === 1 ? { ...k0, title: 'Chalcolithic' } : k0;
      const fresh = this._fresh && i === lit && step !== 1 ? ' class="sc-pop"' : '';
      const op = i > lit ? 0.14 : i === lit ? 1 : 0.42;
      let g = '';
      if (P) {
        const y = 6 + i * 124, h = 116;
        g += cushionRect(4, y, st.W - 8, h, 14, 'var(--sim-panel)');
        if (i === lit) g += `<rect x="4" y="${y}" width="${st.W - 8}" height="${h}" rx="14" ${stroke('var(--sim-accent)', 3)}/>`;
        k.tools.forEach((t, n) => { g += at(st.W - 150 + n * 54, y + h / 2, 0.82, t()); });
        g += text(18, y + 48, k.title, { anchor: 'start', size: 19, weight: 600, display: true });
        g += text(18, y + 74, k.date, { anchor: 'start', size: 15, col: 'var(--sim-label-muted)' });
      } else {
        const w = (st.W - 28) / 3, x = 6 + i * (w + 8), h = 262;
        g += cushionRect(x, 6, w, h, 14, 'var(--sim-panel)');
        if (i === lit) g += `<rect x="${x}" y="6" width="${w}" height="${h}" rx="14" ${stroke('var(--sim-accent)', 3)}/>`;
        k.tools.forEach((t, n) => { g += at(x + w / 2 + (n - 1) * (w / 3.2), 112, 1.05, t()); });
        g += text(x + w / 2, 212, k.title, { size: 21, weight: 600, display: true });
        g += text(x + w / 2, 240, k.date, { size: 14, col: 'var(--sim-label-muted)' });
      }
      s += `<g style="opacity:${op}"${fresh}>${g}</g>`;
    });
    const yr = P ? 392 : 300;
    s += this._rail(st, yr);
    s += text(st.W / 2, st.H - (P ? 26 : 16), READ[step], { size: P ? 21 : 24, weight: 600, display: true, col: 'var(--sim-accent)' });
    this._fresh = false;
    return { svg: s, over: '' };
  }
}
