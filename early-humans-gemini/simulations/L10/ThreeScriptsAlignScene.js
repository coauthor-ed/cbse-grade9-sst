/**
 * ThreeScriptsAlignScene - blk-l10-s03, 4 beats. Beat 0: the stone, big, three bands of writing, Greek lit. Beat 1: the name:
 * the Greek word and the oval ring of Egyptian signs. Beat 2: seven signs, seven sounds. Beat 3: a true-scale rail: about
 * 1,400 years unread, stone found in 1799, read in 1822. Base chain: SvgScene. State comes from the beat.
 */
import { SvgScene, fill, stroke, shade, tone, cushionRect } from 'simulations/base/kit/SimSvg.js';
import { timeRail, TIME_RAIL_CSS } from '../shared/TimeRail.js';
import { n, INK } from '../L07/HarappanDraw.js';

const MAP = [0, 1, 2, 3].map((idx) => [{ idx, dwellMs: null }]);
const ROCK = 'color-mix(in oklab, var(--sim-strata-6) 82%, var(--sim-strata-5))', CARVE = 'var(--sim-strata-1)';
const GREEK = '\u03a0\u03a4\u039f\u039b\u0395\u039c\u0391\u0399\u039f\u03a3';
const SOUNDS = ['P', 'T', 'O', 'L', 'M', 'Y', 'S'];

/** One sign of the name, centred on (x, y), s tall: the seven real signs, simplified. */
function sign(i, x, y, s, col) {
  const u = s / 2;
  if (i === 0) return `<path d="M${n(x - u * 0.7)} ${n(y - u * 0.5)}H${n(x + u * 0.7)}V${n(y + u * 0.5)}H${n(x + u * 0.42)}V${n(y - u * 0.12)}H${n(x - u * 0.42)}V${n(y + u * 0.5)}H${n(x - u * 0.7)}Z" ${fill(col)}/>`;
  if (i === 1) return `<path d="M${n(x - u * 0.72)} ${n(y + u * 0.4)}A${n(u * 0.72)} ${n(u * 0.72)} 0 0 1 ${n(x + u * 0.72)} ${n(y + u * 0.4)}Z" ${fill(col)}/>`;
  if (i === 2) return `<path d="M${n(x)} ${n(y + u * 0.8)}V${n(y + u * 0.1)}C${n(x - u * 0.9)} ${n(y - u * 0.3)} ${n(x - u * 0.5)} ${n(y - u * 0.85)} ${n(x)} ${n(y - u * 0.85)}C${n(x + u * 0.5)} ${n(y - u * 0.85)} ${n(x + u * 0.9)} ${n(y - u * 0.3)} ${n(x)} ${n(y + u * 0.1)}" ${stroke(col, s * 0.1)}/>`;
  if (i === 3) return `<path d="M${n(x - u * 0.9)} ${n(y + u * 0.5)}Q${n(x - u * 1.02)} ${n(y - u * 0.3)} ${n(x - u * 0.5)} ${n(y - u * 0.2)}H${n(x + u * 0.25)}Q${n(x + u * 0.3)} ${n(y - u * 0.75)} ${n(x + u * 0.68)} ${n(y - u * 0.65)}Q${n(x + u * 1.02)} ${n(y - u * 0.5)} ${n(x + u * 0.85)} ${n(y - u * 0.1)}L${n(x + u * 0.62)} ${n(y + u * 0.1)}V${n(y + u * 0.5)}H${n(x + u * 0.96)}V${n(y + u * 0.68)}H${n(x - u * 0.9)}Z" ${fill(col)}/>`;
  if (i === 4) return `<path d="M${n(x - u * 0.84)} ${n(y + u * 0.22)}Q${n(x)} ${n(y - u * 0.6)} ${n(x + u * 0.84)} ${n(y + u * 0.22)}Q${n(x)} ${n(y + u * 0.02)} ${n(x - u * 0.84)} ${n(y + u * 0.22)}Z" ${fill(col)}/>`;
  if (i === 5) return [-0.34, 0.34].map((d) => `<path d="M${n(x + u * d)} ${n(y + u * 0.8)}V${n(y - u * 0.3)}" ${stroke(col, s * 0.09)}/><path d="M${n(x + u * d)} ${n(y - u * 0.82)}Q${n(x + u * d + u * 0.3)} ${n(y - u * 0.5)} ${n(x + u * d)} ${n(y - u * 0.16)}Q${n(x + u * d - u * 0.14)} ${n(y - u * 0.5)} ${n(x + u * d)} ${n(y - u * 0.82)}Z" ${fill(col)}/>`).join('');
  return `<path d="M${n(x - u * 0.22)} ${n(y + u * 0.82)}V${n(y - u * 0.5)}Q${n(x - u * 0.22)} ${n(y - u * 0.84)} ${n(x + u * 0.28)} ${n(y - u * 0.74)}L${n(x + u * 0.36)} ${n(y - u * 0.36)}H${n(x + u * 0.14)}V${n(y + u * 0.82)}Z" ${fill(col)}/>`;
}

/** A row of the name in an oval ring. x is the centre. */
function ring(cx, cy, w, h, col, s) {
  let out = `<rect x="${n(cx - w / 2)}" y="${n(cy - h / 2)}" width="${n(w)}" height="${n(h)}" rx="${n(h / 2)}" ${stroke(col, Math.max(4, h * 0.06))}/><path d="M${n(cx + w / 2)} ${n(cy - h * 0.34)}V${n(cy + h * 0.34)}" ${stroke(col, Math.max(4, h * 0.06))}/>`;
  const gap = (w - h * 0.5) / 7, sz = Math.min(s, gap * 0.92);
  for (let i = 0; i < 7; i++) out += sign(i, cx - w / 2 + h * 0.28 + gap * (i + 0.5), cy, sz, col);
  return out;
}

export class ThreeScriptsAlignScene extends SvgScene {
  static BEAT_STEP_MAP = MAP;
  static CONTINUOUS = false;
  static ARIA_LABEL = 'The Rosetta Stone with three bands of writing, the last in Greek. The name Ptolemy in Greek, and the same name in Egyptian signs inside an oval ring. Each sign stands for a sound. A rail shows about 1,400 years unread, the stone in 1799 and the reading in 1822.';

  stageHeight(st) { return st.portrait ? [500, 470, 350, 350][this.stepIndex] ?? 500 : 440; }
  css() { return TIME_RAIL_CSS + 'svg .rs-w { font-family: var(--sim-font-display, var(--sim-font)); font-weight: 600; } svg .rs-g { font-family: var(--sim-font); font-weight: 800; letter-spacing: 0.04em; } svg .rs-pop { transform-box: fill-box; transform-origin: center; animation: rs-pop 0.5s var(--look-spring) both; animation-delay: var(--d, 0s); } @keyframes rs-pop { from { opacity: 0; transform: scale(0.6); } to { opacity: 1; transform: none; } } @media (prefers-reduced-motion: reduce) { svg .rs-pop { animation: none; } }'; }

  _t(x, y, s, size, col = 'var(--sim-label)', a = 'middle', cls = 'rs-w') { return `<text class="${cls}" x="${n(x)}" y="${n(y)}" text-anchor="${a}" font-size="${size}" dominant-baseline="central" ${fill(col)}>${s}</text>`; }

  _stone(cx, top, w, h, lit) {
    const l = cx - w / 2, r = cx + w / 2, b = top + h;
    const p = `M${n(l + w * 0.1)} ${n(top + h * 0.12)}L${n(l + w * 0.46)} ${n(top + h * 0.03)}L${n(r - w * 0.2)} ${n(top + h * 0.1)}L${n(r - w * 0.04)} ${n(top + h * 0.05)}L${n(r)} ${n(top + h * 0.6)}L${n(r - w * 0.06)} ${n(b)}H${n(l + w * 0.08)}L${n(l)} ${n(top + h * 0.5)}Z`;
    let out = `<path d="${p}" ${fill(shade(ROCK, 66))} transform="translate(0 7)"/><path d="${p}" ${fill(ROCK)}/>`;
    const op = (k) => (lit == null || lit === k ? 1 : 0.42), rows = (y0, cnt, fn) => { let s = ''; for (let i = 0; i < cnt; i++) s += fn(y0 + i * (h * 0.075), i); return s; };
    out += `<g style="opacity:${op(0)}">` + rows(top + h * 0.2, 2, (y, i) => { let s = ''; for (let j = 0; j < 11; j++) { const x = l + w * 0.16 + j * w * 0.066, k = (i * 3 + j) % 4; s += k === 0 ? `<circle cx="${n(x)}" cy="${n(y)}" r="${n(w * 0.018)}" ${fill(CARVE)}/>` : k === 1 ? `<rect x="${n(x - w * 0.016)}" y="${n(y - w * 0.018)}" width="${n(w * 0.032)}" height="${n(w * 0.036)}" ${fill(CARVE)}/>` : k === 2 ? `<path d="M${n(x - w * 0.02)} ${n(y + w * 0.018)}L${n(x)} ${n(y - w * 0.022)}L${n(x + w * 0.02)} ${n(y + w * 0.018)}Z" ${fill(CARVE)}/>` : `<rect x="${n(x - w * 0.006)}" y="${n(y - w * 0.024)}" width="${n(w * 0.012)}" height="${n(w * 0.048)}" ${fill(CARVE)}/>`; } return s; }) + '</g>';
    out += `<g style="opacity:${op(1)}">` + rows(top + h * 0.45, 2, (y, i) => { let d = `M${n(l + w * 0.12)} ${n(y)}`; for (let j = 0; j < 12; j++) d += `q${n(w * 0.02)} ${n(j % 2 ? w * 0.03 : -w * 0.03)} ${n(w * 0.06)} 0`; return `<path d="${d}" ${stroke(CARVE, Math.max(2.5, w * 0.012))}/>`; }) + '</g>';
    out += `<g style="opacity:${op(2)}">` + rows(top + h * 0.7, 3, (y, i) => this._t(cx + (i % 2) * 3, y, 'THE KING PTOLEMY'.replace(/ /g, '').replace(/[A-Z]/g, () => '').concat(GREEK + ' ' + GREEK.slice(3) + ' ' + GREEK.slice(0, 5)), Math.max(14, w * 0.05), CARVE, 'middle', 'rs-g')) + '</g>';
    return out;
  }

  paint(st) {
    const s = this.stepIndex, W = st.W, H = st.H, port = st.portrait;
    if (s === 0) {
      const w = port ? 300 : 330, h = port ? 350 : 400, cx = port ? W / 2 : W * 0.33;
      let svg = this._stone(cx, port ? 8 : 18, w, h, null);
      if (port) return { svg: svg + [['Old signs', 'var(--sim-label)'], ['Later script', 'var(--sim-label)'], ['Greek: still read', 'var(--sim-good)']].map((a, i) => this._t(W / 2, 394 + i * 34, a[0], 24, a[1])).join('') };
      svg += [['Old signs', 'var(--sim-label)', 0.26], ['Later script', 'var(--sim-label)', 0.5], ['Greek: still read', 'var(--sim-good)', 0.8]].map((a) => this._t(W * 0.65, 18 + h * a[2], a[0], 27, a[1], 'start')).join('');
      return { svg };
    }
    if (s === 1) {
      const y1 = port ? 110 : 96, y2 = port ? 346 : 300, ww = Math.min(W - 24, 560), hh = port ? 96 : 120;
      let svg = this._t(W / 2, y1 - 54, 'In Greek', 26) + `<g class="rs-pop">${cushionRect(W / 2 - ww / 2, y1 - 30, ww, 84, 18, tone(2))}</g>` + this._t(W / 2, y1 + 12, GREEK, port ? 33 : 44, 'var(--sim-ink-on-2, var(--sim-bg-deep))', 'middle', 'rs-g');
      svg += `<path d="M${W / 2} ${y1 + 66}V${y2 - hh / 2 - 44}" ${stroke('var(--sim-label)', 6, 'stroke-dasharray:2 12')}/>`;
      svg += this._t(W / 2, y2 - hh / 2 - 24, 'The same place in Egyptian', 26);
      svg += `<g class="rs-pop" style="--d:.2s">${ring(W / 2, y2 + 10, ww, hh, INK, hh * 0.62)}</g>`;
      return { svg };
    }
    if (s === 2) {
      const ww = Math.min(W - 16, 620), hh = port ? 96 : 130, cy = port ? 150 : 150;
      let svg = this._t(W / 2, 40, 'A name sounds the same', port ? 26 : 30) + ring(W / 2, cy, ww, hh, INK, hh * 0.62);
      const gap = (ww - hh * 0.5) / 7, y = cy + hh / 2 + (port ? 50 : 62);
      SOUNDS.forEach((t, i) => {
        const x = W / 2 - ww / 2 + hh * 0.28 + gap * (i + 0.5);
        svg += `<g class="rs-pop" style="--d:${(0.15 * i).toFixed(2)}s"><path d="M${n(x)} ${n(cy + hh / 2 + 6)}V${n(y - 24)}" ${stroke(tone(2), 4)}/><circle cx="${n(x)}" cy="${n(y)}" r="${port ? 20 : 25}" ${fill(tone(2))}/>${this._t(x, y, t, port ? 24 : 30, 'var(--sim-ink-on-2, var(--sim-bg-deep))')}</g>`;
      });
      svg += this._t(W / 2, y + (port ? 70 : 76), 'P T O L M Y S: Ptolemy', port ? 25 : 28);
      return { svg };
    }
    const pad = port ? 14 : 24, r = timeRail({ from: 300, to: 1900, x: pad, w: W - 2 * pad, y: 120, lanes: 2, laneH: 52, gap: 18 });
    let svg = this._t(W / 2, 46, '1822: read again', port ? 30 : 36);
    svg += r.bar({ from: 450, to: 1822, lane: 0, tone: 5, label: 'About 1,400 years unread', fuzzFrom: 500, size: port ? 17 : 22, grow: true });
    svg += r.mark({ at: 1799, lane: 0, toLane: 1, tone: 'label' }) + r.mark({ at: 1822, lane: 0, toLane: 1, tone: 'good' });
    svg += this._t(r.at(1799) - 12, r.laneY(1) + 26, 'Stone found, 1799', port ? 21 : 24, 'var(--sim-label)', 'end');
    svg += r.axis([{ at: 400, label: '400 CE' }, { at: 1000, label: '1000 CE' }, { at: 1822, label: '1822 CE', hot: true }]);
    return { svg: svg + this._t(W / 2, r.bottom + 84, '23 years from stone to reading', port ? 24 : 28) };
  }
}
