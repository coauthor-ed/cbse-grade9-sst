/**
 * OneChainScene - L09 s01 "One Chain" (3 beats). A strip of seven numbered links runs along the top: the chapter as
 * one chain. Each beat lights its own links and draws them big underneath.
 *   b0 clash (links 1-2):  wants stack up, one picture at a time (0.4 s each), and keep going; resources stay a
 *                          short stack. A bracket opens between the two tops: scarcity.
 *   b1 choice (links 3-4): Meera's choice: snacks or shoes. Shoes are chosen on entry; tap snacks to swap.
 *                          The chosen card is marked; the other is dimmed and tagged "given up": that is
 *                          the opportunity cost. Tap the other card to swap.
 *   b2 three (links 5-7):  the three key questions drop in (0.5 s each); under them the three systems; mixed is
 *                          lit and tagged "most economies".
 * Every beat rests in its finished state from a cold start. Colours are tokens only. ASCII only.
 */
import { SvgScene, fill } from 'simulations/base/kit/SimSvg.js';
import { iconSvg } from 'simulations/base/kit/SimIcons.js';
import { civicSvg } from 'simulations/base/kit/SimCivic.js';

const MAP = [[{ idx: 0, dwellMs: null }], [{ idx: 1, dwellMs: null }], [{ idx: 2, dwellMs: null }]];
const f1 = (v) => (+v).toFixed(1);
const LINKS = [[0, 1], [2, 3], [4, 5, 6]];
const SAY = ['wants meet limits \u2192 scarcity', 'choice \u2192 opportunity cost', 'three questions \u2192 systems \u2192 mixed'];
const WANTS = [['phone', 2], ['book', 3], ['cup', 7], ['pen', 5], ['ticket', 1], ['plane', 6]];
const RES = [['coin', 4], ['clock', 5]];

const CSS = `
.oc-hit { position: absolute; padding: 0; margin: 0; border: 0; background: transparent; box-shadow: none; cursor: pointer;
  border-radius: calc(16px * var(--look-radius, 1)); }
.oc-hit:active { transform: none; box-shadow: none; }
.oc-hit:focus-visible { outline: 3px solid var(--sim-accent); outline-offset: 3px; }
svg .oc-pop { transform-box: fill-box; transform-origin: center bottom; animation: oc-pop 0.4s cubic-bezier(.3,1.4,.5,1) both; animation-delay: var(--d, 0s); }
@keyframes oc-pop { 0% { transform: scale(0.4); opacity: 0; } 100% { transform: none; opacity: 1; } }
svg .oc-drop { animation: oc-drop 0.5s cubic-bezier(.3,1.4,.5,1) both; animation-delay: var(--d, 0s); }
@keyframes oc-drop { 0% { transform: translateY(-30px); opacity: 0; } 100% { transform: none; opacity: 1; } }
svg .oc-fade { animation: oc-fade 0.5s ease both; animation-delay: var(--d, 0s); }
@keyframes oc-fade { 0% { opacity: 0; } 100% { opacity: 1; } }
`;

const text = (x, y, t, size, col = 'var(--sim-label)', anchor = 'middle') =>
  `<text x="${f1(x)}" y="${f1(y)}" text-anchor="${anchor}" style="fill:${col};font:800 ${size}px var(--sim-font)">${t}</text>`;
function icon(name, cx, cy, size, tn) {
  const inner = (iconSvg(name, tn).match(/<svg[^>]*>([\s\S]*)<\/svg>/) || [])[1] || '';
  return `<g transform="translate(${f1(cx - size / 2)} ${f1(cy - size / 2)}) scale(${(size / 48).toFixed(3)})" style="--i:var(--sim-series-${tn})">${inner}</g>`;
}
const anim = (cls, d, on) => (on ? ` class="${cls}" style="--d:${f1(d)}s"` : '');
const card = (x, y, w, h, rim = 'var(--sim-stroke)', extra = '') =>
  `<rect x="${f1(x)}" y="${f1(y + 4)}" width="${f1(w)}" height="${f1(h)}" rx="16" ${fill(`color-mix(in oklab, ${rim} 70%, var(--sim-label))`)}/>`
  + `<rect x="${f1(x)}" y="${f1(y)}" width="${f1(w)}" height="${f1(h)}" rx="16" ${fill('var(--sim-bg-surface)', `stroke:${rim};stroke-width:3${extra}`)}/>`;

/** A crimped snack packet, centred on (cx, cy), about s wide. */
function packet(cx, cy, s) {
  const w = s * 0.62, h = s * 0.82, x = cx - w / 2, y = cy - h / 2;
  let zig = `M${f1(x)} ${f1(y)}`;
  for (let i = 1; i <= 6; i++) zig += `L${f1(x + (i * w) / 6)} ${f1(y + (i % 2 ? 6 : 0) * (s / 80))}`;
  return `<rect x="${f1(x)}" y="${f1(y)}" width="${f1(w)}" height="${f1(h)}" rx="${f1(s * 0.08)}" ${fill('var(--sim-series-6)', 'stroke:color-mix(in oklab, var(--sim-series-6) 60%, var(--sim-label));stroke-width:2.5')}/>`
    + `<circle cx="${f1(cx)}" cy="${f1(cy + h * 0.08)}" r="${f1(s * 0.15)}" ${fill('var(--sim-gold)')}/>`
    + `<path d="${zig}" ${fill('none', 'stroke:color-mix(in oklab, var(--sim-series-6) 60%, var(--sim-label));stroke-width:2.5;stroke-linejoin:round')}/>`;
}

export class OneChainScene extends SvgScene {
  static WIDTH = 560;
  static PORTRAIT_WIDTH = 390;
  static HEIGHT = 494;
  static PORTRAIT_HEIGHT = 624;
  static CONTINUOUS = false;
  static BEAT_STEP_MAP = MAP;
  static BEAT_MAPS = { 3: MAP };
  static CONTROLS = [];
  static ARIA_LABEL = 'The chapter as a chain of seven links. First, wants keep stacking up while resources stay limited; the gap between them is scarcity. Second, Meera chooses between snacks and shoes; the one she gives up is the opportunity cost. Tap a card to choose. Third, the three key questions, what, how and for whom to produce, are answered by economic systems: market, planned and mixed; most economies are mixed.';

  async setup() {
    this.pick = null;
    this.fresh = true;
    await super.setup();
    this._onClick = (e) => {
      const b = e.target?.closest?.('[data-pick]');
      if (!b || this.stepIndex !== 1) return;
      const v = b.dataset.pick;
      if (v !== 'snacks' && v !== 'shoes') return;
      this.pick = v; this.fresh = false; this.tapped = true; this.repaint();
    };
    this.root.addEventListener('click', this._onClick);
  }

  destroy() {
    this.root?.removeEventListener('click', this._onClick);
    super.destroy();
  }

  css() { return CSS; }

  enter(step) {
    this.fresh = true;
    this.pick = null;
    this.tapped = false;
    const settle = [3.6, 1.6, 3.2][step] ?? 2;
    if (step === 1) this.pick = 'shoes';
    this.after(settle, () => { this.fresh = false; });
  }

  stageHeight(st) { return st.portrait ? 600 : 470; }

  strip(st) {
    const P = st.portrait, W = st.W, n = 7, r = P ? 18 : 20, x0 = P ? 30 : 44, dx = (W - 2 * x0) / (n - 1), y = P ? 28 : 30;
    const now = LINKS[this.stepIndex] ?? [], done = LINKS.slice(0, this.stepIndex).flat();
    let s = `<path d="M${f1(x0)} ${y}H${f1(W - x0)}" ${fill('none', 'stroke:var(--sim-stroke);stroke-width:4;stroke-linecap:round;opacity:0.45')}/>`;
    for (let i = 0; i < n; i++) {
      const cx = x0 + i * dx, on = now.includes(i), was = done.includes(i);
      const bg = on ? 'var(--sim-accent)' : was ? 'color-mix(in oklab, var(--sim-accent) 35%, var(--sim-bg-surface))' : 'var(--sim-bg-surface)';
      s += `<circle cx="${f1(cx)}" cy="${y}" r="${on ? r + 3 : r}" ${fill(bg, `stroke:${on ? 'var(--sim-accent)' : 'var(--sim-stroke)'};stroke-width:2.5${on || was ? '' : ';stroke-dasharray:4 4'}`)}/>`;
      s += text(cx, y + (P ? 6 : 7), String(i + 1), P ? 17 : 19, on ? 'var(--sim-bg-surface)' : 'var(--sim-label)');
    }
    s += text(W / 2, P ? 76 : 82, SAY[this.stepIndex] ?? '', P ? 17 : 20, 'var(--sim-label)');
    return s;
  }

  beatClash(st) {
    const P = st.portrait, fr = this.fresh, base = P ? 516 : 410, sz = P ? 56 : 58, gapY = P ? 50 : 47;
    const wx = P ? 112 : 150, rx = P ? 236 : 320;
    let s = `<path d="M${f1(P ? 40 : 60)} ${base}H${f1(P ? 350 : 500)}" ${fill('none', 'stroke:var(--sim-stroke);stroke-width:3;stroke-linecap:round;opacity:0.5')}/>`;
    RES.forEach(([nm, t], k) => { s += `<g${anim('oc-pop', 0.1 + k * 0.3, fr)}>${icon(nm, rx, base - gapY / 2 - k * gapY, sz, t)}</g>`; });
    WANTS.forEach(([nm, t], k) => { s += `<g${anim('oc-pop', 0.7 + k * 0.4, fr)}>${icon(nm, wx, base - gapY / 2 - k * gapY, sz, t)}</g>`; });
    const topW = base - WANTS.length * gapY, topR = base - RES.length * gapY, d = 0.7 + WANTS.length * 0.4;
    s += `<g${anim('oc-fade', d - 0.3, fr)}>${text(wx, topW - 8, '+ more', P ? 16 : 18, 'var(--sim-label-muted)')}</g>`;
    s += `<path d="M${f1(rx - 34)} ${f1(topR)}H${f1(rx + 34)}" ${fill('none', 'stroke:var(--sim-label);stroke-width:4;stroke-linecap:round')}/>`;
    const bx = rx + (P ? 52 : 62);
    s += `<g${anim('oc-fade', d, fr)}><path d="M${f1(wx + 30)} ${f1(topW + 4)}H${f1(bx)}V${f1(topR)}H${f1(rx + 40)}" ${fill('none', 'stroke:var(--sim-accent);stroke-width:3.5;stroke-dasharray:7 6;stroke-linejoin:round')}/>`
      + text(bx + 10, (topW + topR) / 2 + 8, 'scarcity', P ? 21 : 26, 'var(--sim-accent)', 'start') + '</g>';
    const ly = base + (P ? 30 : 32);
    if (P) {
      s += text(wx, ly, 'wants', 17) + text(wx, ly + 21, 'no end', 15, 'var(--sim-label-muted)');
      s += text(rx, ly, 'resources', 17) + text(rx, ly + 21, 'limited', 15, 'var(--sim-label-muted)');
    } else {
      s += text(wx, ly, 'wants: no end', 19) + text(rx, ly, 'resources: limited', 19);
    }
    return s;
  }

  beatChoice(st) {
    const P = st.portrait, W = st.W, cw = P ? 160 : 180, ch = P ? 200 : 184, y = P ? 146 : 150, gap = P ? 22 : 40;
    const x1 = (W - 2 * cw - gap) / 2, x2 = x1 + cw + gap;
    let s = text(W / 2, y - 34, 'Meera\'s choice', P ? 18 : 20, 'var(--sim-label-muted)'), over = '';
    [['snacks', x1], ['shoes', x2]].forEach(([nm, x]) => {
      const chosen = this.pick === nm, lost = this.pick && !chosen, cx = x + cw / 2;
      const rim = chosen ? 'var(--sim-accent)' : 'var(--sim-stroke)';
      s += `<g style="opacity:${lost ? 0.5 : 1}">${card(x, y, cw, ch, rim, lost ? ';stroke-dasharray:8 7' : '')}`;
      s += nm === 'snacks' ? packet(cx, y + 78, P ? 84 : 92) : civicSvg('shoe', cx, y + 112, { w: P ? 104 : 116 });
      s += text(cx, y + ch - 26, nm, P ? 21 : 23) + '</g>';
      if (chosen) s += `<g${anim('oc-pop', 0, !this.tapped)}><rect x="${f1(cx - 52)}" y="${f1(y - 14)}" width="104" height="30" rx="15" ${fill('var(--sim-accent)')}/>${text(cx, y + 7, 'chosen', 17, 'var(--sim-bg-surface)')}</g>`;
      if (lost) {
        s += `<path d="M${f1(x + 26)} ${f1(y + 26)}L${f1(x + cw - 26)} ${f1(y + ch - 52)}M${f1(x + cw - 26)} ${f1(y + 26)}L${f1(x + 26)} ${f1(y + ch - 52)}" ${fill('none', 'stroke:var(--sim-bad);stroke-width:5;stroke-linecap:round;opacity:0.7')}/>`;
        s += `<rect x="${f1(cx - 56)}" y="${f1(y - 14)}" width="112" height="30" rx="15" ${fill('var(--sim-bg-surface)', 'stroke:var(--sim-bad);stroke-width:2.5')}/>${text(cx, y + 7, 'given up', 17, 'var(--sim-bad)')}`;
      }
      over += `<button type="button" class="sv-hit oc-hit" data-pick="${nm}" aria-pressed="${chosen}" aria-label="Choose ${nm}" style="left:${f1(x)}px;top:${f1(y)}px;width:${cw}px;height:${ch}px"></button>`;
    });
    const ly = y + ch + (P ? 56 : 56);
    if (this.pick) {
      const other = this.pick === 'shoes' ? 'snacks' : 'shoes';
      s += `<g${anim('oc-fade', 0, !this.tapped)}>${text(W / 2, ly, 'opportunity cost:', P ? 18 : 20, 'var(--sim-label-muted)')}${text(W / 2, ly + (P ? 30 : 34), `the ${other}`, P ? 24 : 28, 'var(--sim-bad)')}</g>`;
      s += text(W / 2, ly + (P ? 66 : 72), 'tap the other card to swap', P ? 15 : 17, 'var(--sim-label-muted)');
    } else s += text(W / 2, ly, 'tap one to choose', P ? 18 : 20, 'var(--sim-label-muted)');
    return { s, over };
  }

  beatThree(st) {
    const P = st.portrait, W = st.W, fr = this.fresh;
    const qs = [['crate', 3, 'What?'], ['factory', 6, 'How?'], ['crowd', 1, 'For whom?']];
    const cw = P ? 112 : 150, gap = (W - 3 * cw) / 4, qy = P ? 104 : 108, qh = P ? 96 : 100;
    let s = '';
    qs.forEach(([nm, t, l], i) => {
      const x = gap + i * (cw + gap), cx = x + cw / 2;
      s += `<g${anim('oc-drop', 0.1 + i * 0.5, fr)}>${card(x, qy, cw, qh)}${icon(nm, cx, qy + 34, P ? 38 : 42, t)}${text(cx, qy + qh - 16, l, P ? 17 : 20)}</g>`;
    });
    const ay = qy + qh + 12, sy = P ? 300 : 290, d = 1.7;
    s += `<g${anim('oc-fade', d - 0.2, fr)}><path d="M${f1(W / 2)} ${f1(ay)}V${f1(sy - 40)}" ${fill('none', 'stroke:var(--sim-stroke);stroke-width:3;stroke-dasharray:6 6;stroke-linecap:round')}/>`
      + `<path d="M${f1(W / 2 - 8)} ${f1(sy - 46)}L${f1(W / 2)} ${f1(sy - 36)}L${f1(W / 2 + 8)} ${f1(sy - 46)}" ${fill('none', 'stroke:var(--sim-stroke);stroke-width:3;stroke-linejoin:round;stroke-linecap:round')}/></g>`;
    const sys = [['market', ['shop']], ['planned', ['planOffice']], ['mixed', ['planOffice', 'shop']]];
    const sw = P ? 112 : 150, sgap = (W - 3 * sw) / 4, base = sy + (P ? 92 : 96);
    sys.forEach(([nm, kinds], i) => {
      const x = sgap + i * (sw + sgap), cx = x + sw / 2, mixed = nm === 'mixed';
      const rim = mixed ? 'var(--sim-accent)' : 'var(--sim-stroke)';
      let g = card(x, sy - 22, sw, (P ? 156 : 160), rim);
      if (kinds.length === 1) g += civicSvg(kinds[0], cx, base, { w: P ? 78 : 96 });
      else g += civicSvg(kinds[0], cx - sw * 0.22, base, { w: P ? 50 : 62 }) + civicSvg(kinds[1], cx + sw * 0.2, base, { w: P ? 48 : 58 });
      g += text(cx, base + (P ? 30 : 32), nm, P ? 18 : 21, mixed ? 'var(--sim-accent)' : 'var(--sim-label)');
      s += `<g style="opacity:${mixed ? 1 : 0.62}"><g${anim('oc-drop', d + i * 0.4, fr)}>${g}</g></g>`;
    });
    const mx = sgap + 2 * (sw + sgap) + sw / 2, ty = sy - 22 + (P ? 156 : 160) + (P ? 32 : 34);
    s += `<g${anim('oc-fade', d + 1.3, fr)}>${text(Math.min(mx, W - (P ? 70 : 84)), ty, 'most economies', P ? 17 : 20, 'var(--sim-accent)')}</g>`;
    return s;
  }

  paint(st) {
    let svg = this.strip(st), over = '';
    if (this.stepIndex === 0) svg += this.beatClash(st);
    else if (this.stepIndex === 1) { const o = this.beatChoice(st); svg += o.s; over = o.over; }
    else svg += this.beatThree(st);
    return { svg, over };
  }

  testState() { return { step: this.stepIndex, pick: this.pick }; }
}
