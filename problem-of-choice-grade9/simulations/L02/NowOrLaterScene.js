/**
 * NowOrLaterScene - L02 s08 "Now or Later" (2 beats).
 *   b0 envelopes: Meera's Rs 1,000 as a tag at a fork. Two paths draw out to two cards, one above the other:
 *                 football shoes ("now") and a tennis racket ("later"). An "or" sits at the fork.
 *   b1 time:      the learner chooses. "buy the shoes now": the tag runs along the shoes path into the shoes
 *                 (0.8 s); where it stood, a dashed "Rs 0 left". "save for the racket": the tag stays, "kept, still
 *                 Rs 1,000" (no interest, no growth). The card not chosen dims, dashed, "given up" and "opportunity
 *                 cost". Both choices are allowed. Rest (cold start): the shoes, so the racket is the opportunity cost
 *                 (the bold line).
 * Money is a number on a tag only. Colours are tokens only. Drawn in stage px (st.W wide). ASCII only.
 */
import { SvgScene, fill, stroke, shade } from 'simulations/base/kit/SimSvg.js';

const RS = String.fromCharCode(0x20B9);
const MONEY = `${RS}1,000`;
const MAP = [[{ idx: 0, dwellMs: null }], [{ idx: 1, dwellMs: null }]];
const RUN_S = 0.8;
const f1 = (v) => (+v).toFixed(1);
const ser = (n) => `var(--sim-series-${n})`;
const T_SHOE = 3, T_RACKET = 2;

const SH = (k) => (k === 'd' ? 'color-mix(in oklab, var(--i) 64%, black)' : k === 'l' ? 'color-mix(in oklab, var(--i) 45%, white)' : 'var(--i)');
/** Football boot and tennis racket on a 48 grid, in the SimIcons three shades. */
const ART = {
  boot: () => `<path d="M4 25c0-4 3-9 7-9h7l4 6c4 2 12 3 18 4 4 1 5 5 5 8v2H4z" style="fill:${SH('b')}"/>`
    + `<path d="M4 36h41v3a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z" style="fill:${SH('d')}"/>`
    + `<path d="M9 41h5v4H9zM20 41h5v4h-5zM32 41h5v4h-5z" style="fill:${SH('d')}"/>`
    + `<path d="M18 21l3-2M21 24l3-2M24 26l3-2" style="fill:none;stroke:${SH('l')};stroke-width:2.2;stroke-linecap:round"/>`
    + `<path d="M8 21h6v5H8z" style="fill:${SH('l')}"/>`,
  racket: () => `<g transform="rotate(35 24 24)"><rect x="21.5" y="27" width="5" height="18" rx="2" style="fill:${SH('d')}"/>`
    + `<rect x="21" y="36" width="6" height="10" rx="2" style="fill:${SH('b')}"/>`
    + `<ellipse cx="24" cy="15" rx="12" ry="14" style="fill:${SH('b')}"/><ellipse cx="24" cy="15" rx="8.5" ry="10.5" style="fill:${SH('l')}"/>`
    + `<path d="M20 5v20M24 4.5v21M28 5v20M15.5 10h17M15 15h18M15.5 20h17" style="fill:none;stroke:${SH('d')};stroke-width:1.2"/></g>`,
};
const art = (name, tone, x, y, s) => `<svg x="${f1(x)}" y="${f1(y)}" width="${f1(s)}" height="${f1(s)}" viewBox="0 0 48 48" aria-hidden="true" style="--i:${ser(tone)}">${ART[name]()}</svg>`;

/** A price tag (pointed end, a hole), centred on (0, 0) so it can run along a path. */
function tagAt0(text, size, col, o = {}) {
  const h = size * 1.6, n = h * 0.42, w = text.length * size * 0.6 + size * 0.9 + n;
  const x0 = -w / 2, x1 = w / 2, t = -h / 2, b = h / 2;
  const d = (dy) => `M${f1(x0)} ${f1(dy)}L${f1(x0 + n)} ${f1(t + dy)}H${f1(x1 - 6)}Q${f1(x1)} ${f1(t + dy)} ${f1(x1)} ${f1(t + 6 + dy)}V${f1(b - 6 + dy)}Q${f1(x1)} ${f1(b + dy)} ${f1(x1 - 6)} ${f1(b + dy)}H${f1(x0 + n)}Z`;
  if (o.ghost) return `<path d="${d(0)}" ${fill('none', `stroke:var(--sim-label-muted);stroke-width:2.5;stroke-dasharray:7 5`)}/>`
    + `<text x="${f1(n * 0.45)}" y="0" text-anchor="middle" dominant-baseline="central" style="fill:var(--sim-label-muted);font:800 ${size}px var(--sim-font)">${text}</text>`;
  return `<path d="${d(4)}" ${fill(shade(col, 70), 'opacity:0.55')}/>`
    + `<path d="${d(0)}" ${fill('var(--sim-bg-surface)', `stroke:${col};stroke-width:3;stroke-linejoin:round`)}/>`
    + `<circle cx="${f1(x0 + n * 0.8)}" cy="0" r="${f1(size * 0.13)}" ${fill('var(--sim-bg-deep)', `stroke:${col};stroke-width:1.5`)}/>`
    + `<text x="${f1(n * 0.45)}" y="0" text-anchor="middle" dominant-baseline="central" style="fill:var(--sim-label);font:800 ${size}px var(--sim-font)">${text}</text>`;
}

const CSS = `
svg .nl-pop { transform-box: fill-box; transform-origin: center; animation: nl-pop 0.45s var(--look-spring-soft, ease-out) both; animation-delay: var(--d, 0s); }
@keyframes nl-pop { from { transform: scale(0.85); opacity: 0; } to { transform: none; opacity: 1; } }
svg .nl-fade { animation: nl-fade 0.5s ease both; animation-delay: var(--d, 0s); }
@keyframes nl-fade { from { opacity: 0; } to { opacity: 1; } }
svg .nl-dim { animation: nl-dim 0.5s ease both; animation-delay: var(--d, 0s); }
@keyframes nl-dim { from { opacity: 1; } to { opacity: 0.42; } }
.nl-row { position: absolute; transform: translate(-50%, -50%); display: flex; gap: 10px; white-space: nowrap; }
.nl-btn { min-height: 44px; padding: 4px 16px; cursor: pointer; white-space: nowrap; border-radius: calc(12px * var(--look-radius, 1));
  font: 800 18px/1.1 var(--sim-font); background: var(--sim-bg-surface); color: var(--sim-label);
  border: 2.5px solid var(--sim-stroke); box-shadow: 0 calc(3px * var(--look-lip, 1)) 0 var(--sim-stroke); }
.nl-btn:active { transform: translateY(3px); box-shadow: none; }
.nl-btn[aria-pressed="true"] { border-color: var(--sim-accent); background: color-mix(in oklab, var(--sim-accent) 12%, var(--sim-bg-surface));
  box-shadow: 0 calc(3px * var(--look-lip, 1)) 0 var(--sim-accent); }
.nl-btn:focus-visible { outline: 3px solid var(--sim-accent); outline-offset: 3px; }
.nl-p .nl-btn { font-size: 16px; padding: 4px 11px; }
`;

export class NowOrLaterScene extends SvgScene {
  static WIDTH = 560;
  static PORTRAIT_WIDTH = 390;
  static HEIGHT = 470;   // the host budgets the panel from this (about 465 / HEIGHT at 1280x720)
  static PORTRAIT_HEIGHT = 470;
  static CONTINUOUS = false;
  static BEAT_STEP_MAP = MAP;
  static BEAT_MAPS = { 2: MAP };
  static CONTROLS = [];
  static ARIA_LABEL = 'Meera has 1,000 rupees. One path leads to football shoes now, the other to a tennis racket later. Choose one: if she buys the shoes, her money is spent and the racket is given up, so the racket is the opportunity cost of the shoes. If she saves, she still has 1,000 rupees and the shoes are given up.';

  async setup() {
    this.pick = 'shoes';
    this.fresh = true;     // this paint plays its entrance (paths draw, tag runs)
    this.pend = [];
    await super.setup();
    this._onClick = (e) => {
      const b = e.target?.closest?.('[data-act]');
      if (b) this.act(b.dataset.act);
    };
    this.root.addEventListener('click', this._onClick);
  }

  destroy() {
    this.root?.removeEventListener('click', this._onClick);
    super.destroy();
  }

  css() { return CSS; }

  cancel() { for (const c of this.pend) c(); this.pend = []; }

  /** Plays the entrance once; a timed repaint then draws the rest state with no animation. */
  play1() {
    this.cancel();
    this.fresh = true;
    this.pend.push(this.after(RUN_S + 0.9, () => { this.fresh = false; this.repaint(); }));
  }

  enter() {
    this.pick = 'shoes';
    this.play1();
  }

  act(a) {
    if (this.stepIndex !== 1 || (a !== 'shoes' && a !== 'save') || a === this.pick) return;
    this.pick = a;
    this.play1();
    this.repaint();
  }

  layout(st) {
    const P = st.portrait, W = st.W;
    const tagX = P ? 58 : 82, cx = P ? 122 : 178, cw = W - cx - 4;
    const ch = P ? 118 : 132, gap = P ? 34 : 40, top = P ? 12 : 14;
    const shoeY = top, racketY = top + ch + gap, midY = top + ch + gap / 2;
    const btnY = racketY + ch + (P ? 44 : 48);
    return { P, W, tagX, cx, cw, ch, shoeY, racketY, midY, btnY, fs: P ? 20 : 24 };
  }

  stageHeight(st) {
    const L = this.layout(st);
    return Math.round(L.btnY + 34);   // the same in both beats, so the panel does not jump
  }

  /** The path from the fork to a card's left edge. */
  pathTo(L, y) {
    const x0 = L.tagX + (L.P ? 46 : 62), x1 = L.cx - 6, ym = L.midY;
    return `M${f1(x0)} ${f1(ym)}C${f1(x0 + (x1 - x0) * 0.55)} ${f1(ym)} ${f1(x0 + (x1 - x0) * 0.35)} ${f1(y)} ${f1(x1)} ${f1(y)}`;
  }

  card(L, kind, y, state, anim) {
    const P = L.P, x = L.cx, w = L.cw, h = L.ch, tone = kind === 'shoes' ? T_SHOE : T_RACKET;
    const dim = state === 'given';
    const name = kind === 'shoes' ? 'football shoes' : 'tennis racket';
    const is = P ? 74 : 92, ix = x + 12, iy = y + (h - is) / 2;
    const tx = ix + is + (P ? 10 : 16), nf = P ? 18 : 22, sf = P ? 16 : 19;
    let g = `<rect x="${f1(x)}" y="${f1(y + 5)}" width="${f1(w)}" height="${h}" rx="16" ${fill(shade(dim ? 'var(--sim-stroke)' : ser(tone), 72), dim ? 'opacity:0' : 'opacity:0.6')}/>`
      + `<rect x="${f1(x)}" y="${f1(y)}" width="${f1(w)}" height="${h}" rx="16" ${fill('var(--sim-bg-surface)', `stroke:${dim ? 'var(--sim-label-muted)' : ser(tone)};stroke-width:3${dim ? ';stroke-dasharray:9 6' : ''}`)}/>`
      + `<rect x="${f1(ix - 4)}" y="${f1(iy - 4)}" width="${is + 8}" height="${is + 8}" rx="14" ${fill(ser(tone), 'opacity:0.16')}/>`
      + art(kind === 'shoes' ? 'boot' : 'racket', tone, ix, iy, is)
      + `<text x="${f1(tx)}" y="${f1(y + (P ? 36 : 42))}" style="fill:var(--sim-label);font:800 ${nf}px var(--sim-font)">${name}</text>`;
    const line = (t, col, dy) => `<text x="${f1(tx)}" y="${f1(y + dy)}" style="fill:${col};font:800 ${sf}px var(--sim-font)">${t}</text>`;
    if (state === 'now' || state === 'later') {
      const t = state, cw2 = t.length * sf * 0.62 + 22;
      g += `<rect x="${f1(tx)}" y="${f1(y + (P ? 52 : 62))}" width="${f1(cw2)}" height="${sf + 14}" rx="${(sf + 14) / 2}" ${fill('color-mix(in oklab, var(--sim-accent) 14%, var(--sim-bg-surface))', 'stroke:var(--sim-accent);stroke-width:2')}/>`
        + `<text x="${f1(tx + cw2 / 2)}" y="${f1(y + (P ? 52 : 62) + (sf + 14) / 2)}" text-anchor="middle" dominant-baseline="central" style="fill:var(--sim-accent);font:800 ${sf}px var(--sim-font)">${t}</text>`;
    } else if (state === 'bought') {
      g += line('bought now, paid', 'var(--sim-good)', P ? 64 : 74);
    } else if (state === 'saving') {
      g += line('later, with the', 'var(--sim-good)', P ? 66 : 76) + line(`${MONEY} kept`, 'var(--sim-good)', P ? 90 : 104);
    }
    let out = `<g${dim ? ` class="nl-dim" style="--d:${anim ? (RUN_S * 0.6).toFixed(2) : '0'}s${anim ? '' : ';opacity:0.42'}"` : ''}>${g}</g>`;
    if (dim) {
      const a = anim ? ` class="nl-fade" style="--d:${(RUN_S * 0.6).toFixed(2)}s"` : '';
      out += `<g${a}>${line('given up', 'var(--sim-bad)', P ? 66 : 78)}${line('opportunity cost', 'var(--sim-accent)', P ? 92 : 108)}</g>`;
    }
    return out;
  }

  paint(st) {
    const L = this.layout(st), step = this.stepIndex, P = L.P;
    const anim = this.fresh && !globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const yS = L.shoeY + L.ch / 2, yR = L.racketY + L.ch / 2;
    const pS = this.pathTo(L, yS), pR = this.pathTo(L, yR);
    let svg = '', over = `<div class="${P ? 'nl-p' : 'nl-l'}">`;

    // The two paths, each ending in an arrowhead at its card.
    const arrow = (y, col) => `<path d="M${f1(L.cx - 18)} ${f1(y - 8)}L${f1(L.cx - 5)} ${f1(y)}L${f1(L.cx - 18)} ${f1(y + 8)}" ${stroke(col, 4.5)}/>`;
    const pathEl = (d, y, on, k) => {
      const col = on ? 'var(--sim-accent)' : 'var(--sim-label-muted)';
      const draw = anim && step === 0 ? ` class="sv-draw" style="--len:400;--dur:0.6s;--d:${(0.2 + k * 0.35).toFixed(2)}s;fill:none;stroke:${col};stroke-width:5;stroke-linecap:round${on ? '' : ';stroke-dasharray:2 10'}"` : ` ${stroke(col, 5, on ? '' : 'stroke-dasharray:2 10')}`;
      return `<path d="${d}"${draw}/>${arrow(y, col)}`;
    };
    if (step === 0) {
      svg += pathEl(pS, yS, true, 0) + pathEl(pR, yR, true, 1);
    } else {
      svg += pathEl(pS, yS, this.pick === 'shoes', 0) + pathEl(pR, yR, this.pick === 'save', 1);
    }

    // The cards.
    const cardState = (kind) => {
      if (step === 0) return kind === 'shoes' ? 'now' : 'later';
      if (this.pick === 'shoes') return kind === 'shoes' ? 'bought' : 'given';
      return kind === 'shoes' ? 'given' : 'saving';
    };
    const pop = (k) => (anim && step === 0 ? ` class="nl-pop" style="--d:${(0.5 + k * 0.35).toFixed(2)}s"` : '');
    svg += `<g${pop(0)}>${this.card(L, 'shoes', L.shoeY, cardState('shoes'), anim && step === 1)}</g>`;
    svg += `<g${pop(1)}>${this.card(L, 'racket', L.racketY, cardState('racket'), anim && step === 1)}</g>`;

    // "or" at the fork.
    const ox = L.tagX + (P ? 70 : 92);
    if (step === 0) svg += `<text x="${f1(ox)}" y="${f1(L.midY + 7)}" text-anchor="middle" ${anim ? 'class="nl-fade" style="--d:1.1s;' : 'style="'}fill:var(--sim-label-muted);font:800 ${P ? 18 : 21}px var(--sim-font)">or</text>`;

    // The money tag: at the fork, or run into the shoes.
    const tag = tagAt0(MONEY, L.fs, 'var(--sim-accent)');
    const capY = L.midY + (P ? 34 : 40);
    const cap = (t, col, up) => `<text x="${f1(L.tagX)}" y="${f1(up ? L.midY - (P ? 26 : 30) : capY)}" text-anchor="middle" style="fill:${col};font:800 ${P ? 16 : 18}px var(--sim-font)">${t}</text>`;
    if (step === 1 && this.pick === 'shoes') {
      // The tag runs along the shoes path; where it stood, Rs 0 is left.
      const tw = MONEY.length * L.fs * 0.6 + L.fs * 0.9 + L.fs * 1.6 * 0.42;
      const endX = L.cx + 12 + (P ? 74 : 92) + (P ? 10 : 16) + tw / 2, endY = L.shoeY + (P ? 96 : 106);
      const run = `M${f1(L.tagX)} ${f1(L.midY)}C${f1(L.tagX + 60)} ${f1(L.midY)} ${f1(endX - 90)} ${f1(endY + 30)} ${f1(endX)} ${f1(endY)}`;
      svg += `<g transform="translate(${f1(L.tagX)} ${f1(L.midY)})"><g${anim ? ' class="nl-fade" style="--d:0.4s"' : ''}>${tagAt0(`${RS}0`, L.fs, '', { ghost: true })}</g></g>`;
      svg += cap('left', 'var(--sim-label-muted)');
      svg += anim
        ? `<g>${tag}<animateMotion dur="${RUN_S}s" fill="freeze" calcMode="spline" keyTimes="0;1" keySplines="0.4 0 0.2 1" path="${run}"/></g>`
        : `<g transform="translate(${f1(endX)} ${f1(endY)})">${tag}</g>`;
    } else {
      svg += `<g transform="translate(${f1(L.tagX)} ${f1(L.midY)})"><g${anim && step === 0 ? ' class="nl-pop"' : ''}>${tag}</g></g>`;   // the pop's CSS transform must not replace the translate
      if (step === 0) svg += cap('Meera has', 'var(--sim-label-muted)', true);
      else svg += `<g${anim ? ' class="nl-fade" style="--d:0.3s"' : ''}>${cap('kept for later', 'var(--sim-good)')}</g>`;
    }

    if (step === 1) {
      const btn = (act, label) => `<button type="button" class="sv-hit nl-btn" data-act="${act}" aria-pressed="${this.pick === act}">${label}</button>`;
      over += `<div class="nl-row" style="left:${f1(L.W / 2)}px;top:${f1(L.btnY)}px">${btn('shoes', P ? 'buy shoes now' : 'buy the shoes now')}${btn('save', P ? 'save for racket' : 'save for the racket')}</div>`;
    }
    over += '</div>';
    return { svg, over };
  }

  testState() { return { step: this.stepIndex, pick: this.pick, fresh: this.fresh }; }
}
