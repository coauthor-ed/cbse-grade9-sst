/**
 * ConsequenceChainScene - blk-l05-s05. Historians' chain, drawn as one village growing. Each beat adds what its
 * link names: a sown field, stored pots, a house, people at other work, a bigger village. Beat 5 weighs harder
 * against easier. Beat 6 is the whole village. The chain is marked as an explanation on every beat.
 */
import { SvgScene, fill, stroke, shade, cushionRect, cushionCircle } from 'simulations/base/kit/SimSvg.js';
import { at, text, potArt, hutArt, earArt, personMark, groundStrip, SOIL, GRAIN, CLAY } from '../shared/StoneAgeArt.js';

const MAP = [0, 1, 2, 3, 4, 5, 6].map((idx) => [{ idx, dwellMs: null }]);
const LINKS = ['Control', 'Surplus', 'Staying in one place', 'Other kinds of work', 'A bigger village'];
const HARDER = ['more hours of work', 'one bad harvest hurts all', 'fewer kinds of food'];
const EASIER = ['food stored for lean months', 'a fixed home'];

export class ConsequenceChainScene extends SvgScene {
  static simId = 'consequence-chain-scene';
  static BEAT_STEP_MAP = MAP;
  static CONTROLS = [];
  static ARIA_LABEL = 'A village grows in five steps. A sown field, control of plants. Pots of stored grain, surplus. A house, staying in one place. People at other work. A bigger village. Then a list: harder, more hours of work, one bad harvest hurts all, fewer kinds of food. Easier, stored food and a fixed home.';

  constructor(container, config) { super(container, config); this._fresh = true; }

  css() {
    return `
.cc-pop { animation: cc-pop 0.5s var(--look-spring-soft, ease-out) both; animation-delay: var(--d, 0s); transform-box: fill-box; transform-origin: bottom; }
@keyframes cc-pop { from { opacity: 0; transform: scale(0.5); } to { opacity: 1; transform: none; } }
`;
  }

  enter() { this._fresh = true; }

  stageHeight(st) { return st.portrait ? 440 : 450; }

  _chain(st) {
    const step = this.stepIndex, n = LINKS.length, w = st.W - 40, y = 26;
    let s = `<rect x="24" y="${y - 3}" width="${w - 8}" height="6" rx="3" ${fill('var(--sim-track)')}/>`;
    LINKS.forEach((_, i) => {
      const x = 20 + (i + 0.5) * (w / n), on = i <= step;
      s += cushionCircle(x, y, 17, on ? 'var(--sim-accent)' : 'var(--sim-track)', { gloss: false });
      s += text(x, y + 6, String(i + 1), { size: 17, weight: 700, col: on ? 'var(--sim-bg-surface)' : 'var(--sim-label-muted)' });
    });
    return s;
  }

  _new(item, show) { return this._fresh && show === this.stepIndex ? ' class="cc-pop"' : ''; }

  _village(st, opacity) {
    const P = st.portrait, step = Math.min(this.stepIndex, 4), W = st.W, G = P ? 256 : 270, sc = P ? 0.84 : 1.4;
    const X = (f) => f * W;
    let s = groundStrip(0, W, G, st.H - G, 'color-mix(in srgb, var(--sim-strata-1) 70%, var(--sim-strata-2))');
    // the field: dark furrows with standing grain
    let field = `<path d="M${X(0.02)} ${G + 56} L${X(0.09)} ${G + 6} H${X(0.46)} L${X(0.5)} ${G + 56} Z" ${fill(SOIL, `stroke:${shade(SOIL, 62)};stroke-width:3`)}/>`;
    for (let i = 0; i < 5; i += 1) field += at(X(0.1) + i * (W * 0.075), G + 12, sc * 0.72, earArt('wheat', GRAIN));
    s += `<g${this._new('f', 0)}>${field}</g>`;
    if (this.stepIndex === 0) {
      s += `<g${this._new('s', 0)}>${at(X(0.62), G - 2, P ? 0.95 : 1.3, personMark('var(--sim-series-8)'))}<path d="M${X(0.58)} ${G - 8} Q${X(0.53)} ${G - 16} ${X(0.5)} ${G + 6}" style="fill:none;stroke:var(--sim-gold);stroke-width:5;stroke-dasharray:3 9"/>${text(X(0.62), G + (P ? 44 : 58), 'choosing what to sow', { size: P ? 16 : 19, weight: 600, display: true })}</g>`;
    }
    if (step >= 4) {
      s += `<g${this._new('h', 4)}>${at(X(0.1), G - 52 * sc, 0.7 * sc, hutArt())}</g>`;
      s += `<g${this._new('h', 4)} style="--d:0.1s">${at(X(0.3), G - 62 * sc, 0.7 * sc, hutArt())}</g>`;
      s += `<g${this._new('h', 4)} style="--d:0.2s">${at(X(0.93), G - 44 * sc, 0.9 * sc, hutArt())}</g>`;
    }
    if (step >= 2) s += `<g${this._new('h', 2)}>${at(X(0.77), G - 34 * sc, 1.25 * sc, hutArt())}</g>`;
    if (step >= 1) {
      s += `<g${this._new('p', 1)}>${at(X(0.56), G + 8, 0.82 * sc, potArt())}</g>`;
      s += `<g${this._new('p', 1)} style="--d:0.12s">${at(X(0.64), G + 16, 0.66 * sc, potArt())}</g>`;
    }
    if (step >= 3) {
      const jobs = [[0.5, 'potter', () => at(26, 6, 0.42, potArt())], [0.7, 'weaver', () => `<rect x="14" y="-14" width="36" height="34" rx="3" ${stroke('var(--sim-strata-3)', 4)}/><path d="M24 -14 V20 M34 -14 V20 M14 0 H50" ${stroke('var(--sim-series-5)', 3)}/>`], [0.89, 'smith', () => `<path d="M16 24 H52 L46 8 H22 Z" ${fill(CLAY)}/><path d="M34 6 Q24 -4 34 -18 Q44 -4 34 6 Z" ${fill('var(--sim-flame)')}/>`]];
      jobs.forEach(([f, name, art], i) => {
        s += `<g${this._new('j', 3)} style="--d:${(i * 0.14).toFixed(2)}s">${at(X(f) - 6, G + (P ? 108 : 112), P ? 0.9 : 1.1, personMark(['var(--sim-series-8)', 'var(--sim-series-5)', 'var(--sim-series-6)'][i]) + art())}${text(X(f) + 6, G + (P ? 150 : 158), name, { size: 15, weight: 600, display: true })}</g>`;
      });
    }
    return `<g style="opacity:${opacity}">${s}</g>`;
  }

  _weigh(st) {
    const P = st.portrait, gap = 10, w = P ? st.W - 8 : (st.W - gap) / 2 - 4, rowH = 30;
    const box = (x, y, h, title, items, col) => cushionRect(x, y, w, h, 14, 'var(--sim-bg-surface)')
      + `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="14" ${stroke(col, 3)}/>` + text(x + w / 2, y + 28, title, { size: 21, weight: 600, display: true, col })
      + items.map((t, i) => text(x + w / 2, y + 56 + i * rowH, t, { size: 16 })).join('');
    if (P) return box(4, 106, 140, 'Harder', HARDER, 'var(--sim-bad)') + box(4, 258, 110, 'Easier', EASIER, 'var(--sim-good)');
    return box(4, 108, 170, 'Harder', HARDER, 'var(--sim-bad)') + box(w + gap + 4, 108, 170, 'Easier', EASIER, 'var(--sim-good)');
  }

  paint(st) {
    const step = this.stepIndex, P = st.portrait;
    const title = step <= 4 ? `${step + 1}. ${LINKS[step]}` : step === 5 ? 'Easier or harder?' : 'Not fast, but it changed how people lived';
    let svg = this._chain(st);
    svg += text(st.W / 2, 74, title, { size: P ? (step === 6 ? 18 : 22) : 24, weight: 600, display: true });
    if (step === 5) svg += this._village(st, 0.28) + this._weigh(st);
    else svg += this._village(st, 1);
    svg += text(st.W / 2, 96, 'one explanation by historians', { size: 15, col: 'var(--sim-label-muted)' });
    this._fresh = false;
    return { svg, over: '' };
  }
}
