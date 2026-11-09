/**
 * TempleFunctionsCompareScene - blk-l08-s07, 4 beats. Two buildings side by side, a ziggurat and an Indian temple.
 * Beat 0 the two, beat 1 what both held (land, grain, treasure, work), beat 2 who may enter, beat 3 the town around them.
 * Base chain: SvgScene.
 */
import { SvgScene, fill, stroke, shade, chip } from 'simulations/base/kit/SimSvg.js';
import { wallSvg, houseSvg, SOIL, n } from '../L07/HarappanDraw.js';

const MAP = [0, 1, 2, 3].map((idx) => [{ idx, dwellMs: null }]);
const HELD = ['land', 'grain', 'treasure', 'work'];
const ACCESS = { z: 'Top: high priests only', t: 'Many devotees, some barred' };

function zig(cx, f, w) {
  return wallSvg(cx - w / 2, f, w, 54, SOIL, { rows: 4, brick: 20 }) + wallSvg(cx - w * 0.35, f - 54, w * 0.7, 44, 'var(--sim-strata-1)', { rows: 3, brick: 20 }) + wallSvg(cx - w * 0.2, f - 98, w * 0.4, 34, SOIL, { rows: 2, brick: 20 })
    + `<rect x="${n(cx - 11)}" y="${n(f - 132)}" width="22" height="132" ${fill(shade(SOIL, 66))}/>`
    + `<rect x="${n(cx - w * 0.11)}" y="${n(f - 160)}" width="${n(w * 0.22)}" height="28" rx="4" ${fill('var(--sim-series-1)')}/>`;
}
function temple(cx, f, w) {
  const s = 'var(--sim-strata-5)', a = shade(s, 82);
  const tower = `M${n(cx - w * 0.2)} ${n(f - 74)}C${n(cx - w * 0.19)} ${n(f - 130)} ${n(cx - w * 0.08)} ${n(f - 158)} ${n(cx)} ${n(f - 164)}C${n(cx + w * 0.08)} ${n(f - 158)} ${n(cx + w * 0.19)} ${n(f - 130)} ${n(cx + w * 0.2)} ${n(f - 74)}Z`;
  let rows = '';
  for (let i = 1; i < 6; i++) { const y = f - 74 - i * 14, hw = w * (0.2 - i * 0.021); rows += `<path d="M${n(cx - hw)} ${n(y)}H${n(cx + hw)}" ${stroke(a, 3)}/>`; }
  return `<rect x="${n(cx - w * 0.46)}" y="${n(f - 16)}" width="${n(w * 0.92)}" height="16" rx="3" ${fill(a)}/><rect x="${n(cx - w * 0.38)}" y="${n(f - 76)}" width="${n(w * 0.76)}" height="60" rx="4" ${fill(s)}/>`
    + `<path d="${tower}" ${fill(s)}/>${rows}<circle cx="${n(cx)}" cy="${n(f - 170)}" r="7" ${fill('var(--sim-gold)')}/><path d="M${n(cx - 14)} ${n(f - 16)}v-28q14 -16 28 0v28z" ${fill(shade(s, 50))}/>`;
}

export class TempleFunctionsCompareScene extends SvgScene {
  static BEAT_STEP_MAP = MAP;
  static CONTINUOUS = false;
  static ARIA_LABEL = 'A ziggurat and an Indian temple side by side. Both held land, grain and treasure and gave work. The top of the ziggurat was closed to all but high priests; many Indian temples admitted devotees but many barred people of some castes. Both shaped the town around them.';

  stageHeight(st) { return st.portrait ? 400 : 400; }

  paint(st) {
    const W = st.W, H = st.H, s = this.stepIndex, c1 = W * 0.26, c2 = W * 0.74, k = 1.3, bw = Math.min(W * 0.44, 280) / k, f = H - (s === 0 ? 46 : 136);
    const big = (x, m) => `<g transform="translate(${n(x)} ${n(f)}) scale(${k})">${m}</g>`;
    let svg = big(c1, zig(0, 0, bw)) + big(c2, temple(0, 0, bw)), over = '';
    svg += `<rect x="0" y="${f}" width="${W}" height="6" ${fill('var(--sim-strata-2)')}/>`;
    over += chip('Ziggurat, Sumer', c1, f + 24, { tone: 2, size: 'md' }) + chip('Temple, India', c2, f + 24, { tone: 5, size: 'md' });
    if (s === 1) {
      over += chip('Both held', W / 2, H - 70, { tone: 'good' });
      HELD.forEach((h, i) => { over += chip(h, W * (0.14 + i * 0.24), H - 28, { tone: 'plain', cls: 'tc-c' }); });
    }
    if (s === 2) over += chip(ACCESS.z, c1, H - 46, { tone: 'plain', cls: 'tc-w' }) + chip(ACCESS.t, c2, H - 46, { tone: 'plain', cls: 'tc-w' });
    if (s === 3) {
      const hs = Math.min(W * 0.1, 60);
      for (let i = 0; i < 8; i++) svg += houseSvg(W * (0.07 + i * 0.123), H - 8 - (i % 2) * 6, hs * (i % 3 === 1 ? 0.84 : 1));
      over += chip('Towns grew around both', W / 2, 18, { tone: 'good' });
    }
    return { svg, over };
  }

  css() { return '.tc-c { font-size: 16px; } .tc-w { white-space: normal; width: 44%; box-sizing: border-box; text-align: center; font-size: 15px; line-height: 1.15; }'; }
}
