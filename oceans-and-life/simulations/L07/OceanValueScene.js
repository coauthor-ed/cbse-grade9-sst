// OceanValueScene - why marine resources matter: five drawn tiles, as the book groups them, and a sixth for the living
// sea. Each beat lights the tiles its words are about; the rest stay in view, dimmed. No note, no made-up figure.
import { SvgScene } from 'simulations/base/kit/SimSvg.js';
import { frame, SEA_CSS, SEA_COLOR_MAP, seaTx, sea, svgCountryBoat, svgOilRig, svgCargoShip, svgPalm, svgFish, svgCoral, svgSeagrass, svgSeaColumn, svgWaveLine, skyRect, num, SEA_INK, WHITE } from '../L08/SeaDraw.js';

const one = (i) => [{ idx: i, dwellMs: null }];
const LIT = [['food'], ['energy', 'minerals'], ['trade'], ['culture', 'life']];
const conch = (x, y, k) => `<g transform="translate(${x} ${y}) scale(${k}) rotate(-14)"><path d="M-72 2L-30 -24C-8 -44 34 -44 52 -22C66 -6 62 16 44 24C14 40 -22 26 -40 12Z" style="fill:${WHITE};stroke:${sea('sandDark')};stroke-width:4;stroke-linejoin:round"/><path d="M-52 -10Q-46 4 -38 12M-34 -22Q-26 -2 -12 22M-12 -36Q-2 -10 14 30" style="fill:none;stroke:${sea('sandDark')};stroke-width:3.5;stroke-linecap:round"/><path d="M10 -8C26 -20 48 -14 52 2C46 14 28 18 16 12Z" style="fill:${sea('sunCore')};stroke:${sea('sandDark')};stroke-width:3"/></g>`;
const cowrie = (x, y, k) => `<g transform="translate(${x} ${y}) scale(${k})"><ellipse cx="0" cy="0" rx="34" ry="24" style="fill:${WHITE};stroke:${sea('sandDark')};stroke-width:3.5"/><path d="M-26 2Q0 10 26 2" style="fill:none;stroke:${SEA_INK};stroke-width:4;stroke-linecap:round"/></g>`;
const heap = (x, y, k) => `<g transform="translate(${x} ${y}) scale(${k})"><path d="M-70 0Q-34 -62 0 -64Q34 -62 70 0Z" style="fill:${sea('sand')};stroke:${sea('sandDark')};stroke-width:3"/>${[0, 1, 2, 3, 4, 5, 6].map((i) => `<ellipse cx="${-36 + i * 12}" cy="${-8 - ((i * 7) % 18)}" rx="6" ry="4.5" style="fill:${sea('rockMid')}"/>`).join('')}</g>`;

const TILES = [
  { id: 'food', head: 'Food and livelihood', art: (x, y, k) => svgCountryBoat(x, y, k * 0.9, { nets: true }) + svgFish(x - 44 * k, y + 34 * k, k * 0.6, { kind: 0 }) + svgFish(x + 40 * k, y + 44 * k, k * 0.6, { kind: 1, flip: true }) },
  { id: 'energy', head: 'Energy', art: (x, y, k) => svgOilRig(x, y, k * 0.7, { legs: 50 * k }) },
  { id: 'minerals', head: 'Minerals and materials', land: true, art: (x, y, k) => heap(x, y + 42 * k, k) },
  { id: 'trade', head: 'Trade and tourism', art: (x, y, k) => svgCargoShip(x - 12 * k, y, k * 0.55, {}) + svgPalm(x + 84 * k, y + 2, k * 0.42, {}), big: '90%', sub: 'of trade by volume' },
  { id: 'culture', head: 'Cultural significance', land: true, art: (x, y, k) => conch(x - 36 * k, y + 16 * k, k * 0.86) + cowrie(x + 52 * k, y + 24 * k, k * 0.86) },
  { id: 'life', head: 'Biodiversity', deep: true, art: (x, y, k) => svgCoral(x - 44 * k, y + 56 * k, k * 0.9, { seed: 3 }) + svgSeagrass(x + 44 * k, y + 56 * k, k, {}) + svgFish(x + 6 * k, y + 8 * k, k * 0.7, { kind: 2 }) },
];

export class OceanValueScene extends SvgScene {
  static BEAT_STEP_MAP = [one(0), one(1), one(2), one(3)];
  static WIDTH = 700;
  static HEIGHT = 440;
  static PORTRAIT_WIDTH = 360;
  static PORTRAIT_HEIGHT = 590;
  static COLOR_MAP = SEA_COLOR_MAP;
  static ARIA_LABEL = 'Six tiles: food and livelihood, energy, minerals and materials, trade and tourism with 90 per cent of trade by volume, cultural significance, and biodiversity.';
  static CONTROLS = [];
  css() { return SEA_CSS; }
  stageHeight(st) { return st.portrait ? 570 : 430; }
  paint(st) {
    const W = st.W, H = st.H, P = st.portrait, cols = P ? 2 : 3, rows = P ? 3 : 2, gap = 8, tw = (W - gap * (cols - 1)) / cols, th = (H - gap * (rows - 1)) / rows, lit = new Set(LIT[this.stepIndex]);
    let s = '';
    TILES.forEach((t, i) => {
      const x = (i % cols) * (tw + gap), y = Math.floor(i / cols) * (th + gap), on = lit.has(t.id), id = `ov${i}`, sy = th * 0.46, k = Math.min(tw / 190, th / 190);
      let b = `<defs><clipPath id="${id}"><rect x="0" y="0" width="${num(tw)}" height="${num(th)}" rx="14"/></clipPath></defs><g clip-path="url(#${id})">`;
      b += t.deep ? svgSeaColumn(0, 0, 1, { w: tw, h: th, bands: 3, wave: 0 }) : skyRect(`${id}s`, 0, 0, tw, sy + 4, 0, 4) + (t.land ? `<rect x="0" y="${num(sy)}" width="${num(tw)}" height="${num(th - sy)}" style="fill:${sea('sand')}"/>` : svgSeaColumn(0, sy, 1, { w: tw, h: th - sy, bands: 2, wave: 2 }) + svgWaveLine(0, sy, 1, { w: tw, amp: 2 }));
      b += t.art(tw / 2, sy + 2, k);
      b += '</g>';
      b += seaTx(tw / 2, 24, t.head, { size: P ? 15 : 16, display: true, weight: 700 });
      if (t.big) { b += seaTx(tw / 2, th - 34, t.big, { size: 26, display: true, weight: 700 }) + seaTx(tw / 2, th - 11, t.sub, { size: 15, weight: 700 }); }
      s += `<g transform="translate(${num(x)} ${num(y)})" style="opacity:${on ? 1 : 0.5}"><rect x="0" y="0" width="${num(tw)}" height="${num(th)}" rx="14" style="fill:none"/>${b}<rect x="0" y="0" width="${num(tw)}" height="${num(th)}" rx="14" style="fill:none;stroke:${on ? 'var(--sim-series-2)' : 'var(--sim-stroke)'};stroke-width:${on ? 4 : 2}"/></g>`;
    });
    return { svg: frame(st, s) };
  }
}
