/**
 * BigAnswersScene - L09 s07 "The Big Questions, Answered" (1 beat). The three Big Question cards from the first
 * slide of the chapter, now with answers. Each card starts closed ("answer in your head, then tap"); a tap opens its
 * answer as three pictures with two short words each:
 *   1 economics:  wants (unlimited), resources (limited), choice (opportunity cost)
 *   2 key questions: What? How? For whom? (to produce)
 *   3 systems:    market (demand, supply), planned (government plan), mixed (both)
 * A second tap closes it again. Recall first, then check: the slide text holds the full answers.
 * Colours are tokens only. ASCII only.
 */
import { SvgScene, fill } from 'simulations/base/kit/SimSvg.js';
import { iconSvg } from 'simulations/base/kit/SimIcons.js';

const MAP = [[{ idx: 0, dwellMs: null }]];
const f1 = (v) => (+v).toFixed(1);

const CARDS = [
  { q: 'What does economics deal with?', qp: ['What does economics', 'deal with?'], a: [
    { icons: ['phone', 'cup'], tones: [2, 7], name: 'wants', sub: 'unlimited' },
    { icons: ['coin', 'clock'], tones: [4, 5], name: 'resources', sub: 'limited' },
    { icons: ['scales'], tones: [6], name: 'choice', sub: 'opportunity cost' },
  ] },
  { q: 'What are the key questions?', qp: ['What are the', 'key questions?'], a: [
    { icons: ['crate'], tones: [3], name: 'What?', sub: 'to produce' },
    { icons: ['factory'], tones: [6], name: 'How?', sub: 'to produce' },
    { icons: ['crowd'], tones: [1], name: 'For whom?', sub: 'to produce' },
  ] },
  { q: 'How do economic systems answer them?', qp: ['How do economic', 'systems answer them?'], a: [
    { icons: ['shop'], tones: [2], name: 'market', sub: 'demand, supply' },
    { icons: ['building'], tones: [6], name: 'planned', sub: 'the plan' },
    { icons: ['building', 'shop'], tones: [6, 2], name: 'mixed', sub: 'both' },
  ] },
];

const CSS = `
.ba-hit { position: absolute; padding: 0; margin: 0; border: 0; background: transparent; box-shadow: none; cursor: pointer;
  border-radius: calc(16px * var(--look-radius, 1)); min-height: 44px; }
.ba-hit:active { transform: none; box-shadow: none; }
.ba-hit:focus-visible { outline: 3px solid var(--sim-accent); outline-offset: 2px; }
svg .ba-pop { transform-box: fill-box; transform-origin: center; animation: ba-pop 0.45s cubic-bezier(.3,1.4,.5,1) both; animation-delay: var(--d, 0s); }
@keyframes ba-pop { 0% { transform: scale(0.6); opacity: 0; } 100% { transform: none; opacity: 1; } }
`;

const text = (x, y, t, size, col = 'var(--sim-label)', anchor = 'middle') =>
  `<text x="${f1(x)}" y="${f1(y)}" text-anchor="${anchor}" style="fill:${col};font:800 ${size}px var(--sim-font)">${t}</text>`;

function icon(name, cx, cy, size, tn) {
  const inner = (iconSvg(name, tn).match(/<svg[^>]*>([\s\S]*)<\/svg>/) || [])[1] || '';
  return `<g transform="translate(${f1(cx - size / 2)} ${f1(cy - size / 2)}) scale(${(size / 48).toFixed(3)})" style="--i:var(--sim-series-${tn})">${inner}</g>`;
}

/** One answer group, centred on x: one or two icons side by side over a name and a short sub line. */
function group(g, x, y, P, d) {
  const n = g.icons.length, s = P ? 38 : 31, gap = n > 1 ? s * 0.62 : 0;
  let out = '';
  g.icons.forEach((nm, k) => { out += icon(nm, x + (k - (n - 1) / 2) * gap, y + s / 2, s, g.tones[k]); });
  out += text(x, y + s + (P ? 22 : 19), g.name, P ? 17 : 19) + text(x, y + s + (P ? 42 : 43), g.sub, P ? 14.5 : 16, 'var(--sim-label-muted)');
  return `<g class="ba-pop" style="--d:${f1(d)}s">${out}</g>`;
}

export class BigAnswersScene extends SvgScene {
  static WIDTH = 560;
  static PORTRAIT_WIDTH = 390;
  static HEIGHT = 480;
  static PORTRAIT_HEIGHT = 600;
  static CONTINUOUS = false;
  static BEAT_STEP_MAP = MAP;
  static BEAT_MAPS = { 1: MAP };
  static CONTROLS = [];
  static ARIA_LABEL = 'The three Big Questions of the chapter as three cards. Tap a card to see its answer. One: economics deals with unlimited wants, limited resources and choice, and every choice has an opportunity cost. Two: the key questions are what, how and for whom to produce. Three: a market economy uses demand and supply, a planned economy uses a government plan, and a mixed economy uses both.';

  async setup() {
    this.open = [false, false, false];
    this.fresh = -1;
    await super.setup();
    this._onClick = (e) => {
      const b = e.target?.closest?.('[data-card]');
      if (!b) return;
      const i = Number(b.dataset.card);
      if (!(i >= 0 && i < 3)) return;
      this.open[i] = !this.open[i];
      this.fresh = this.open[i] ? i : -1;
      this.repaint();
      if (this.open.every(Boolean) && !this._cheered) { this._cheered = true; this.celebrate?.(); }
    };
    this.root.addEventListener('click', this._onClick);
  }

  destroy() {
    this.root?.removeEventListener('click', this._onClick);
    super.destroy();
  }

  css() { return CSS; }

  enter() { this.open = [false, false, false]; this.fresh = -1; this._cheered = false; }

  stageHeight(st) { return st.portrait ? 576 : 456; }

  paint(st) {
    const P = st.portrait, W = st.W, x = 12, w = W - 24, h = P ? 176 : 140, step = P ? 192 : 152, top = 6;
    let svg = '', over = '';
    CARDS.forEach((c, i) => {
      const y = top + i * step, on = this.open[i];
      const rim = on ? 'var(--sim-accent)' : 'var(--sim-stroke)';
      svg += `<rect x="${x}" y="${y + 4}" width="${f1(w)}" height="${h}" rx="16" ${fill(`color-mix(in oklab, ${rim} 70%, var(--sim-label))`)}/>`;
      svg += `<rect x="${x}" y="${y}" width="${f1(w)}" height="${h}" rx="16" ${fill('var(--sim-bg-surface)', `stroke:${rim};stroke-width:3`)}/>`;
      const nx = x + 30, ny = y + (P ? 34 : 32);
      svg += `<circle cx="${nx}" cy="${ny}" r="18" ${fill(on ? 'var(--sim-accent)' : 'var(--sim-track)')}/>`;
      svg += text(nx, ny + 7, String(i + 1), 20, on ? 'var(--sim-bg-surface)' : 'var(--sim-label)');
      if (P) svg += text(x + 58, y + 30, c.qp[0], 18, 'var(--sim-label)', 'start') + text(x + 58, y + 54, c.qp[1], 18, 'var(--sim-label)', 'start');
      else svg += text(x + 58, y + 39, c.q, 20, 'var(--sim-label)', 'start');
      const ay = y + (P ? 70 : 58), ah = h - (P ? 80 : 66);
      if (!on) {
        svg += `<rect x="${x + 18}" y="${ay}" width="${f1(w - 36)}" height="${ah}" rx="12" ${fill('none', 'stroke:var(--sim-stroke);stroke-width:2.5;stroke-dasharray:7 7;opacity:0.6')}/>`;
        svg += text(W / 2, ay + ah / 2 + 6, i === 0 && !this.open.some(Boolean) ? 'Answer in your head, then tap' : 'tap to see the answer', P ? 15.5 : 18, 'var(--sim-label-muted)');
      } else {
        const gw = (w - 24) / 3;
        c.a.forEach((g, k) => {
          const d = this.fresh === i ? 0.1 + k * 0.35 : 0;
          svg += group(g, x + 12 + gw * (k + 0.5), ay - (P ? 2 : 4), P, d);
        });
      }
      over += `<button type="button" class="sv-hit ba-hit" data-card="${i}" aria-pressed="${on}" aria-label="Big Question ${i + 1}: ${c.q} ${on ? 'Answer shown. Tap to hide.' : 'Tap to see the answer.'}" style="left:${x}px;top:${y}px;width:${f1(w)}px;height:${h}px"></button>`;
    });
    return { svg, over };
  }

  testState() { return { step: this.stepIndex, open: this.open.slice() }; }
}
