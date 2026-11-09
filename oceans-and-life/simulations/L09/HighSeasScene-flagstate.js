// HighSeasScene-flagstate - a cargo ship far from any coast. Setup (1 beat): the ship and the distance; no flag on it,
// no country named. Beat 0: the flag goes up and the ship's register is named. Beat 1: whose law applies on board.
// Beat 2: the same ship, small, with its flag state far off: the law applies, enforcing it is harder.
import { SvgScene } from 'simulations/base/kit/SimSvg.js';
import { frame, SEA_COLOR_MAP, SEA_CSS, tx, tag, panel, arrow, svgCargoShip, svgSeaColumn, svgWaveLine, svgCloud, skyRect, num, SEA_INK, WHITE } from '../L08/SeaDraw.js';

const one = (i) => [{ idx: i, dwellMs: null }];
// Panama's flag in quarters: white with a blue star, red, blue, white with a red star.
function flagPanama(x, y, k) {
  const w = 110 * k, h = 72 * k, blue = 'var(--sim-series-1)', red = 'var(--sim-series-6)';
  const star = (cx, cy, r, c) => { const p = []; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, q = i % 2 ? r * 0.42 : r; p.push(`${num(cx + Math.cos(a) * q)} ${num(cy + Math.sin(a) * q)}`); } return `<path d="M${p.join('L')}Z" style="fill:${c}"/>`; };
  return `<g><rect x="${num(x - 3)}" y="${num(y - 6)}" width="6" height="${num(h + 96 * k)}" rx="3" style="fill:${SEA_INK}"/>`
    + `<rect x="${num(x)}" y="${num(y)}" width="${num(w / 2)}" height="${num(h / 2)}" style="fill:${WHITE}"/><rect x="${num(x + w / 2)}" y="${num(y)}" width="${num(w / 2)}" height="${num(h / 2)}" style="fill:${red}"/>`
    + `<rect x="${num(x)}" y="${num(y + h / 2)}" width="${num(w / 2)}" height="${num(h / 2)}" style="fill:${blue}"/><rect x="${num(x + w / 2)}" y="${num(y + h / 2)}" width="${num(w / 2)}" height="${num(h / 2)}" style="fill:${WHITE}"/>`
    + star(x + w / 4, y + h / 4, h * 0.17, blue) + star(x + w * 0.75, y + h * 0.75, h * 0.17, red)
    + `<rect x="${num(x)}" y="${num(y)}" width="${num(w)}" height="${num(h)}" style="fill:none;stroke:${SEA_INK};stroke-width:3"/></g>`;
}
const ROWS = ["Law on board: the flag state's", 'This ship: Panama'];

export class HighSeasScene extends SvgScene {
  static BEAT_MAPS = { [Number.MAX_SAFE_INTEGER]: [one(0)], 1: [one(0)], 3: [one(1), one(2), one(3)] };
  static BEAT_STEP_MAP = [one(0), one(1), one(2), one(3)];
  static WIDTH = 680;
  static HEIGHT = 450;
  static PORTRAIT_WIDTH = 360;
  static PORTRAIT_HEIGHT = 560;
  static COLOR_MAP = SEA_COLOR_MAP;
  static ARIA_LABEL = 'A cargo ship 600 nautical miles from the nearest coast. On the high seas, the laws of the flag state apply: the country in which the ship is registered.';
  static CONTROLS = [];
  css() { return SEA_CSS; }
  stageHeight(st) { return st.portrait ? 470 : 400; }
  paint(st) {
    const W = st.W, H = st.H, P = st.portrait, step = this.stepIndex, sy = H * (step === 2 ? 0.4 : 0.56);
    let s = skyRect(`fs${step}`, 0, 0, W, sy + 4, 0, 6) + svgCloud(W * 0.76, 50, P ? 0.5 : 0.7, { seed: 5 }) + svgSeaColumn(0, sy, 1, { w: W, h: H - sy, bands: 3, wave: 3 }) + svgWaveLine(0, sy, 1, { w: W, amp: 3 });
    if (step === 3) {
      s += svgCargoShip(W * 0.74, sy + 3, P ? 0.34 : 0.42, {});
      s += `<g transform="scale(1)">${flagPanama(W * 0.1, sy - 96, 0.5)}</g>`;
      s += arrow(W * 0.12, sy + 40, W * 0.72, sy + 40, { both: true, w: 3.5, dash: '10 8' }) + tag(W * 0.42, sy + 40, 'very far', { size: 16 });
      s += tag(W / 2, sy + 104, 'The law still applies', { size: 17 });
      s += tag(W / 2, sy + 146, 'Enforcing it is harder', { size: 17 });
      return { svg: frame(st, s) };
    }
    const k = P ? 0.92 : 1.2, x = W * 0.54;
    s += svgCargoShip(x, sy + 3, k, {});
    const stern = x - 140 * k + 4;
    if (step === 0) {
      s += arrow(14, sy + 56, W - 14, sy + 56, { both: true, w: 3.5 }) + tag(W / 2, sy + 56, '600 nautical miles to the nearest coast', { size: P ? 15 : 17 });
      s += tag(W / 2, sy + 116, 'A wallet is missing from a cabin', { size: P ? 15 : 17 });
    }
    if (step === 1) {
      s += `<g class="sd-in">${flagPanama(stern, sy - 150 * (P ? 0.92 : 1.05), P ? 0.72 : 0.9)}</g>`;
      s += tag(W / 2, sy + 62, 'Registered in Panama', { size: 18 });
      s += tag(W / 2, sy + 110, 'Flag state: the country of registration', { size: P ? 15 : 17 });
    }
    if (step === 2) {
      s += flagPanama(stern, sy - 150 * (P ? 0.92 : 0.95), P ? 0.6 : 0.72);
      const cw = Math.min(W - 24, 380), cx = (W - cw) / 2, cy = sy + 28;
      s += panel(cx, cy, cw, 104);
      s += tx(cx + cw / 2, cy + 26, 'Whose law applies?', { size: 18, display: true, weight: 700 });
      ROWS.forEach((t, i) => { s += tx(cx + cw / 2, cy + 54 + i * 28, t, { size: 16, weight: 800 }); });
    }
    return { svg: frame(st, s) };
  }
}
