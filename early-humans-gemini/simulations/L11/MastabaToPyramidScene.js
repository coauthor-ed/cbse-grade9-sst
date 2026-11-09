/**
 * MastabaToPyramidScene - blk-l11-s04, mounts at beat 3 of 5 (earlier beats show drawings). Side view, big. Beat 3: six tiers of
 * stone go up one by one on one mastaba, and the count reads 6. Beat 4: the tiers ghost back to show the shaft and burial
 * chamber deep in the rock, and the robbers' tunnel that reached it. Base chain: SvgScene. State comes from the beat.
 */
import { SvgScene, fill, stroke, shade, tone } from 'simulations/base/kit/SimSvg.js';
import { wallSvg, SAND, STONE, n } from '../L07/HarappanDraw.js';

const MAP = [0, 1, 2, 3, 4].map((idx) => [{ idx, dwellMs: null }]);
const TIERS = 6;

export class MastabaToPyramidScene extends SvgScene {
  static BEAT_STEP_MAP = MAP;
  static CONTINUOUS = false;
  static ARIA_LABEL = 'Six tiers of stone rise one on another, starting from one mastaba, to make the Step Pyramid. Below it, a shaft goes down to a burial chamber in the rock, and a robbers\' tunnel reaches it.';

  stageHeight(st) { return st.portrait ? 500 : 440; }
  css() { return 'svg .mp-w { font-family: var(--sim-font-display, var(--sim-font)); font-weight: 600; } svg .mp-up { transform-box: fill-box; transform-origin: bottom; animation: mp-up 0.45s var(--look-spring) both; animation-delay: var(--d, 0s); } @keyframes mp-up { from { opacity: 0; transform: translateY(-34px); } to { opacity: 1; transform: none; } } @media (prefers-reduced-motion: reduce) { svg .mp-up { animation: none; } }'; }

  _t(x, y, s, size, col = 'var(--sim-label)', a = 'middle') { return `<text class="mp-w" x="${n(x)}" y="${n(y)}" text-anchor="${a}" font-size="${size}" dominant-baseline="central" ${fill(col)}>${s}</text>`; }

  _tag(x, y, s, size) { const w = s.length * size * 0.56 + 24, h = size + 18; return `<rect x="${n(x - w / 2)}" y="${n(y - h / 2)}" width="${n(w)}" height="${h}" rx="${h / 2}" ${fill('var(--sim-bg-surface)')}/>` + this._t(x, y, s, size); }

  paint(st) {
    const s = Math.max(3, this.stepIndex), W = st.W, H = st.H, port = st.portrait, g = port ? 310 : 276, cx = W / 2, base = Math.min(W - 24, 560), th = (port ? 40 : 37);
    let svg = `<rect x="0" y="${g}" width="${W}" height="${H - g}" ${fill(shade(STONE, 92))}/><rect x="0" y="${g - 8}" width="${W}" height="10" ${fill(SAND)}/>`;
    for (let i = 0; i < TIERS; i++) {
      const w = base * (1 - i * 0.145), y = g - i * th;
      svg += `<g class="${s === 3 ? 'mp-up' : ''}" style="--d:${(i * 0.13).toFixed(2)}s;${s === 4 ? 'opacity:0.42' : ''}">${wallSvg(cx - w / 2, y, w, th - 3, i ? 'var(--sim-strata-1)' : 'var(--sim-strata-3)', { rows: 2, brick: 30 })}</g>`;
    }
    const top = g - TIERS * th;
    if (s === 3) {
      svg += this._t(W / 2, 30, 'Six tiers on one mastaba', port ? 26 : 30);
      svg += this._tag(cx, g + 52, 'The first mastaba', port ? 24 : 26);
      svg += this._tag(cx, g + 106, 'Each tier is smaller', port ? 24 : 26);
    } else {
      const sw = 22, sh = H - g - 78, cw = port ? 130 : 160, chH = 56, chY = g + sh, tx = cx + base * 0.5;
      svg += this._t(W / 2, 30, 'Made to protect the body', port ? 26 : 30);
      svg += `<rect x="${n(cx - sw / 2)}" y="${g - th}" width="${sw}" height="${n(sh + th)}" ${fill('var(--sim-strata-6)')}/>`;
      svg += `<rect x="${n(cx - cw / 2)}" y="${n(chY)}" width="${cw}" height="${chH}" rx="8" ${fill('var(--sim-strata-6)')}/><rect x="${n(cx - 42)}" y="${n(chY + 20)}" width="84" height="28" rx="6" ${fill('var(--sim-elev-high)')}/>`;
      svg += `<path d="M${n(tx - 6)} ${g + 6}Q${n(tx - base * 0.16)} ${n(chY - 10)} ${n(cx + cw / 2)} ${n(chY + 26)}" ${stroke(tone(7), 8, 'stroke-dasharray:2 15')}/>`;
      svg += this._tag(cx - (port ? 92 : 170), chY - (port ? 20 : -26), 'Burial chamber', port ? 20 : 25);
      svg += this._tag(cx + (port ? 96 : 150), g + 38, 'Robbers\' tunnel', port ? 20 : 25);
    }
    return { svg };
  }
}
