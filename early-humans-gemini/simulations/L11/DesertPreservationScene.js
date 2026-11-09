/**
 * DesertPreservationScene - blk-l11-s03b, mounts at beat 1 of 4 (beat 0 shows the drawing). A slice through the ground.
 * Beat 1: a body in a shallow pit, water leaves it into dry sand. Beat 2: the same grave, years later, the body still whole.
 * Beat 3: beside it a coffin in a tomb, the water stays in and the body decays. Marked "One explanation".
 * Base chain: SvgScene. State comes from the beat. The body is a plain shape, with no face.
 */
import { SvgScene, fill, shade } from 'simulations/base/kit/SimSvg.js';
import { SAND, SOIL, WATER, n } from '../L07/HarappanDraw.js';

const MAP = [0, 1, 2, 3].map((idx) => [{ idx, dwellMs: null }]);
const TITLE = ['', 'Dry sand pulls water out', 'Years later, still whole', 'One explanation'];

export class DesertPreservationScene extends SvgScene {
  static BEAT_STEP_MAP = MAP;
  static CONTINUOUS = false;
  static ARIA_LABEL = 'A slice through desert sand. A body in a shallow pit dries as water leaves it, and it stays whole for years. In a coffin in a tomb, the water stays in and the body decays. Historians think this is one explanation for embalming.';

  stageHeight(st) { return st.portrait ? 490 : 420; }
  css() { return 'svg .dp-w { font-family: var(--sim-font-display, var(--sim-font)); font-weight: 600; } svg .dp-out { animation: dp-out 1.1s var(--look-spring-soft) both; animation-delay: var(--d, 0s); } @keyframes dp-out { from { opacity: 0; translate: var(--fx, 0) var(--fy, 0); } to { opacity: 1; translate: 0 0; } } @media (prefers-reduced-motion: reduce) { svg .dp-out { animation: none; } }'; }

  _t(x, y, s, size, col = 'var(--sim-label)') { return `<text class="dp-w" x="${n(x)}" y="${n(y)}" text-anchor="middle" font-size="${size}" dominant-baseline="central" ${fill(col)}>${s}</text>`; }

  /** A body lying on its side, knees drawn up, as in the shallow graves. Centre (x, y), s across. */
  _body(x, y, s, col) {
    return `<ellipse cx="${n(x - s * 0.08)}" cy="${n(y)}" rx="${n(s * 0.32)}" ry="${n(s * 0.2)}" ${fill(col)}/><circle cx="${n(x - s * 0.4)}" cy="${n(y - s * 0.06)}" r="${n(s * 0.12)}" ${fill(col)}/><ellipse cx="${n(x + s * 0.26)}" cy="${n(y - s * 0.03)}" rx="${n(s * 0.2)}" ry="${n(s * 0.1)}" transform="rotate(24 ${n(x + s * 0.26)} ${n(y - s * 0.03)})" ${fill(col)}/><ellipse cx="${n(x + s * 0.14)}" cy="${n(y + s * 0.13)}" rx="${n(s * 0.24)}" ry="${n(s * 0.075)}" transform="rotate(-8 ${n(x + s * 0.14)} ${n(y + s * 0.13)})" ${fill(shade(col, 84))}/>`;
  }

  _drop(x, y, r, o = {}) { const d = `M${n(x)} ${n(y - r * 1.5)}Q${n(x + r * 1.1)} ${n(y)} ${n(x)} ${n(y + r)}Q${n(x - r * 1.1)} ${n(y)} ${n(x)} ${n(y - r * 1.5)}Z`; return `<path class="${o.fx != null ? 'dp-out' : ''}" d="${d}" ${fill(WATER, o.fx != null ? `--fx:${o.fx}px;--fy:${o.fy}px;--d:${o.d ?? 0}s` : '')}/>`; }

  paint(st) {
    const s = Math.max(1, this.stepIndex), W = st.W, H = st.H, port = st.portrait;
    if (s === 3) return { svg: this._two(st) };
    const top = 104, cx = W / 2, by = top + (H - top) * 0.44, u = port ? 260 : 310;
    let svg = this._t(W / 2, 30, TITLE[s], port ? 26 : 31);
    svg += `<rect x="0" y="${top}" width="${W}" height="${H - top}" ${fill(SAND)}/><path d="M0 ${top}Q${W * 0.3} ${top - 16} ${W * 0.55} ${top}T${W} ${top - 6}V${top + 8}H0Z" ${fill(SAND)}/>`;
    for (let i = 0; i < 60; i++) svg += `<circle cx="${n(((i * 83) % 97) / 97 * W)}" cy="${n(top + 8 + ((i * 47) % 89) / 89 * (H - top - 12))}" r="${i % 4 ? 1.6 : 2.6}" ${fill(shade(SAND, 80))}/>`;
    svg += `<ellipse cx="${n(cx)}" cy="${n(by)}" rx="${n(u * 0.66)}" ry="${n(u * 0.36)}" ${fill(shade(SAND, 86))}/>`;
    svg += this._body(cx, by, u, s === 1 ? SOIL : shade(SOIL, 78));
    if (s === 1) {
      const pts = [[-0.72, -0.2], [-0.56, 0.34], [-0.22, 0.46], [0.22, 0.46], [0.58, 0.32], [0.74, -0.14], [0.46, -0.42], [-0.3, -0.42]];
      pts.forEach(([a, b], i) => { const x = cx + a * u, y = by + b * u * 0.8; svg += this._drop(x, y, port ? 9 : 11, { fx: n((cx - x) * 0.7), fy: n((by - y) * 0.7), d: i * 0.06 }); });
    } else svg += `<text class="dp-w" x="${n(cx)}" y="${n(H - 40)}" text-anchor="middle" font-size="${port ? 24 : 28}" dominant-baseline="central" ${fill('var(--sim-strata-6)')}>Skin and hair still there</text>`;
    return { svg };
  }

  _two(st) {
    const W = st.W, H = st.H, port = st.portrait;
    let svg = this._t(W / 2, 30, TITLE[3], port ? 26 : 31);
    const box = (x, y, w, h, kind) => {
      let o = `<rect x="${n(x)}" y="${n(y)}" width="${n(w)}" height="${n(h)}" rx="18" ${fill(kind === 'sand' ? SAND : 'var(--sim-strata-6)')}/>`;
      const cx = x + w / 2, cy = y + h * 0.46, u = Math.min(w, h * 1.5) * 0.62;
      if (kind === 'sand') {
        o += this._body(cx, cy, u, SOIL);
        for (const [a, b] of [[-0.7, -0.3], [-0.6, 0.42], [0.62, 0.4], [0.72, -0.3]]) o += this._drop(cx + a * u, cy + b * u, 8);
      } else {
        const cw = u * 1.26, ch = u * 0.62;
        o += `<rect x="${n(cx - cw / 2)}" y="${n(cy - ch / 2 + 5)}" width="${n(cw)}" height="${n(ch)}" rx="12" ${fill(shade('var(--sim-elev-high)', 56))}/><rect x="${n(cx - cw / 2)}" y="${n(cy - ch / 2)}" width="${n(cw)}" height="${n(ch)}" rx="12" ${fill('var(--sim-elev-high)')}/><rect x="${n(cx - cw / 2 + 10)}" y="${n(cy - ch / 2 + 10)}" width="${n(cw - 20)}" height="${n(ch - 20)}" rx="8" ${fill(shade('var(--sim-elev-high)', 46))}/>`;
        o += this._body(cx, cy, u * 0.68, shade(SOIL, 64));
        for (const [a, b] of [[-0.4, -0.14], [-0.14, 0.17], [0.12, -0.17], [0.42, 0.13]]) o += this._drop(cx + a * u, cy + b * u, 7);
      }
      const lab = kind === 'sand' ? 'In sand: dries' : 'In a coffin: decays', col = kind === 'sand' ? 'var(--sim-strata-6)' : 'var(--sim-bg-surface)';
      return o + `<text class="dp-w" x="${n(cx)}" y="${n(y + h - 28)}" text-anchor="middle" font-size="${port ? 24 : 25}" dominant-baseline="central" ${fill(col)}>${lab}</text>`;
    };
    if (port) svg += box(10, 62, W - 20, 200, 'sand') + box(10, 274, W - 20, 200, 'tomb');
    else svg += box(10, 66, W / 2 - 16, 340, 'sand') + box(W / 2 + 6, 66, W / 2 - 16, 340, 'tomb');
    return svg;
  }
}
