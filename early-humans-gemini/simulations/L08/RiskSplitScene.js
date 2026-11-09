/**
 * RiskSplitScene - blk-l08-s05b, 4 beats. Mountains, a river, a canal and field, and a ziggurat. Beat 0: an ordinary
 * flood goes down the canal. Beat 1: the surge from the mountains overtops the bank. Beat 2: two arrows, plan and
 * prayer, stamped "one reading". Beat 3: the same picture, the temple lit. Base chain: SvgScene.
 */
import { SvgScene, chip, fill, stroke } from 'simulations/base/kit/SimSvg.js';
import { wallSvg, SOIL, n } from '../L07/HarappanDraw.js';

const MAP = [0, 1, 2, 3].map((idx) => [{ idx, dwellMs: null }]);
const RIVER = 'var(--sim-sea-shallow)';

export class RiskSplitScene extends SvgScene {
  static BEAT_STEP_MAP = MAP;
  static CONTINUOUS = false;
  static PORTRAIT_HEIGHT = 720;
  static ARIA_LABEL = 'A river runs from far mountains past a canal and a field to a ziggurat. Ordinary floods go down the canal. A sudden surge from the mountains goes over the bank. One reading: canals answered the first flood and offerings the second.';

  stageHeight(st) { return st.portrait ? 430 : 470; }

  paint(st) {
    const W = st.W, H = st.H, s = this.stepIndex, port = st.portrait;
    const ry = H * 0.42;
    const rw = s === 1 ? 46 : 24;
    let svg = '';
    // Far mountains with snow.
    const m = (x, w, h, y) => `<path d="M${n(x - w / 2)} ${n(y)}L${n(x)} ${n(y - h)}L${n(x + w / 2)} ${n(y)}Z" ${fill('var(--sim-strata-5)')}/><path d="M${n(x - w * 0.16)} ${n(y - h * 0.68)}L${n(x)} ${n(y - h)}L${n(x + w * 0.16)} ${n(y - h * 0.68)}L${n(x + w * 0.05)} ${n(y - h * 0.6)}L${n(x - w * 0.05)} ${n(y - h * 0.68)}Z" ${fill('var(--sim-elev-peak)')}/>`;
    svg += m(W * 0.14, W * 0.27, H * 0.34, ry + 8) + m(W * 0.3, W * 0.22, H * 0.25, ry + 8);
    // The land.
    svg += `<rect x="0" y="${n(ry - 4)}" width="${W}" height="${n(H - ry + 4)}" rx="12" ${fill('var(--sim-strata-1)')}/>`;
    // River across, and the canal down to the field.
    svg += `<path d="M0 ${n(ry + 34)}C${n(W * 0.3)} ${n(ry + 16)} ${n(W * 0.6)} ${n(ry + 60)} ${W} ${n(ry + 40)}" ${stroke(RIVER, rw, 'stroke-linecap:butt')}/>`;
    const cx = W * 0.32;
    svg += `<path d="M${n(cx)} ${n(ry + 32)}V${n(H * 0.76)}" ${stroke(RIVER, 11)}/>`;
    svg += `<rect x="${n(cx - W * 0.16)}" y="${n(H * 0.76)}" width="${n(W * 0.32)}" height="${n(H * 0.18)}" rx="8" ${fill('var(--sim-elev-low)')}/>`;
    for (let i = 1; i < 6; i++) svg += `<path d="M${n(cx - W * 0.16 + i * W * 0.0533)} ${n(H * 0.78)}v${n(H * 0.14)}" ${stroke('color-mix(in oklab, var(--sim-elev-low) 60%, black)', 3)}/>`;
    if (s === 1) svg += `<rect x="${n(cx - W * 0.17)}" y="${n(H * 0.75)}" width="${n(W * 0.34)}" height="${n(H * 0.2)}" rx="8" ${fill('color-mix(in srgb, var(--sim-sea-shallow) 72%, transparent)')}/>`;
    // The ziggurat.
    const zx = W * 0.76, zf = H * 0.94, zw = Math.min(W * 0.34, 210);
    const zt = wallSvg(zx - zw / 2, zf, zw, 44, SOIL, { rows: 3, brick: 22 }) + wallSvg(zx - zw * 0.34, zf - 44, zw * 0.68, 38, 'var(--sim-strata-1)', { rows: 3, brick: 22 }) + wallSvg(zx - zw * 0.18, zf - 82, zw * 0.36, 30, SOIL, { rows: 2, brick: 22 });
    svg += `<g style="${s === 0 ? 'opacity:0.45' : ''}">${zt}</g>`;
    let over = '';
    const big = 'sv-chip--big';
    const lab = (t, x, y, tone) => { over += chip(t, x, y, { tone, cls: `rs-c ${big}` }); };
    if (s === 0) { lab('Ordinary flood', cx + 2, ry - 14, 'plain'); lab('Into the canal', cx + (port ? 8 : 96), H * 0.66, 'good'); }
    if (s === 1) {
      lab('Melting snow', W * 0.22, 18, 'plain');
      lab('Sudden surge', W * 0.6, ry - 14, 'bad');
      svg += `<path d="M${n(W * 0.34)} ${n(ry - 30)}h${n(W * 0.14)}m-12 -12l12 12l-12 12" ${stroke('var(--sim-bad)', 6)}/>`;
    }
    if (s >= 2) {
      lab('Expected: canal', W * 0.3, H * 0.66, 'good');
      lab(s === 3 ? 'No work could stop it' : 'No warning: offering', W * 0.72, H * 0.52, s === 3 ? 'accent' : 'plain');
      svg += `<path d="M${n(zx)} ${n(ry + 60)}V${n(zf - 118)}" ${stroke('var(--sim-accent)', 5)}/>`;
    }
    if (s === 2) over += chip('One reading', W * 0.76, 22, { tone: 'warning', cls: 'rs-c' });
    return { svg, over };
  }

  css() { return '.rs-c { font-size: 19px; }'; }
}
