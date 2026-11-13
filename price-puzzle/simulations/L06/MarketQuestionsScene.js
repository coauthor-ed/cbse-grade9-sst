/**
 * MarketQuestionsScene - L06 s09 "What Drives the Market" (3 beats). SvgScene, design units 560 x 490 landscape,
 * 390 x 640 portrait. Graph look as L05 (MarketParts / ShiftGraph): market demand series-5, market supply series-7.
 *   b0  a heap of onions with a price tag that moves up and down; four question cards around it: "supply
 *       changing?", "demand changing?", "towards equilibrium?", "government helping?". Tap a card: it opens big
 *       with its picture (the supply curve moves, the demand curve moves, the price slides to E, the government
 *       building with "helping" / "hurting"). Tap again for all four. Rest: all four.
 *   b1  two small graphs: DmDm' (a point slides down the curve: "price falls", "more wanted") and SmSm' (a point
 *       slides up: "price rises", "more offered"); mango numbers Rs 50 / Rs 150, 6 / 18 kg.
 *   b2  a graph with no numbers: demand moves right, E moves to a new E ("new equilibrium"); beside it the
 *       government building, "helps" (medicine, a park, one seller kept in check) and "can harm" (a pile of rules).
 * Colours are tokens only. ASCII only.
 */
import { SvgScene, fill, stroke, shade } from 'simulations/base/kit/SimSvg.js';
import { RS } from '../shared/MangoKit.js';
import { MKT, BTN_CSS, txt, frame, axes, line, dot, arrow, pill, btn } from '../shared/MarketParts.js';
import { SUP, SINK } from '../shared/SupplyParts.js';
import { gFrame, gAxes, shiftGraph, ePos } from '../shared/ShiftGraph.js';
import { govBuilding, medBox, icon } from '../shared/GovParts.js';

const f1 = (v) => (+v).toFixed(1);
const MAP = [[{ idx: 0, dwellMs: null }], [{ idx: 1, dwellMs: null }], [{ idx: 2, dwellMs: null }]];
const ACC = 'var(--sim-accent)';
const ACC_INK = 'var(--sim-ink-on-accent, var(--sim-bg-deep))';
const GOOD = { bg: 'var(--sim-good)', ink: 'var(--sim-bg-deep)', edge: 'var(--sim-good)' };
const BAD = { bg: 'var(--sim-bad)', ink: 'var(--sim-bg-deep)', edge: 'var(--sim-bad)' };
const ONION = 'color-mix(in oklab, var(--sim-series-4) 50%, var(--sim-bg-surface))';
const QS = [
  { short: ['supply', 'changing?'], long: ['Is supply', 'changing?'], col: SUP },
  { short: ['demand', 'changing?'], long: ['Is demand', 'changing?'], col: MKT },
  { short: ['towards', 'equilibrium?'], long: ['Is the market moving', 'towards equilibrium?'], col: ACC },
  { short: ['government', 'helping?'], long: ['Is the government', 'helping or hurting?'], col: 'var(--sim-series-4)' },
];

function curveLabel(x, y, letter, col, size, anchor = 'start', prime = false) {
  return `<text x="${f1(x)}" y="${f1(y)}" text-anchor="${anchor}" style="fill:${col};font:800 ${size}px var(--sim-font)">${letter}<tspan style="font-size:${Math.round(size * 0.68)}px" dy="${Math.round(size * 0.2)}">m</tspan>${prime ? `<tspan dy="-${Math.round(size * 0.2)}">'</tspan>` : ''}</text>`;
}

/** A heap of onions, (x, y) bottom centre, about w wide. */
function onions(x, y, w) {
  const r = w / 9;
  let s = `<ellipse cx="${f1(x)}" cy="${f1(y - 4)}" rx="${f1(w / 2 + 6)}" ry="10" ${fill('color-mix(in oklab, var(--sim-series-8) 40%, var(--sim-bg-surface))')}/>`;
  const rows = [[-3, -1.5, 0, 1.5, 3], [-2.25, -0.75, 0.75, 2.25], [-1.5, 0, 1.5], [-0.75, 0.75]];
  rows.forEach((row, j) => {
    for (const k of row) {
      const cx = x + k * r * 1.45, cy = y - r - j * r * 1.45;
      s += `<path d="M${f1(cx)} ${f1(cy - r * 1.35)}Q${f1(cx + r * 1.1)} ${f1(cy - r * 0.2)} ${f1(cx)} ${f1(cy + r)}Q${f1(cx - r * 1.1)} ${f1(cy - r * 0.2)} ${f1(cx)} ${f1(cy - r * 1.35)}Z" ${fill(ONION, `stroke:${shade(ONION, 55)};stroke-width:2`)}/>`;
      s += `<path d="M${f1(cx)} ${f1(cy - r * 1.3)}q${f1(r * 0.2)} ${f1(-r * 0.4)} ${f1(r * 0.4)} ${f1(-r * 0.5)}" ${stroke(shade(ONION, 55), 2)}/>`;
    }
  });
  return s;
}

/** A small picture for a question card, centred on (x, y), about s across. */
function mini(i, x, y, s) {
  const h = s * 0.62, x0 = x - s / 2, y0 = y - h / 2;
  if (i === 3) return govBuilding(x, y + h / 2, s * 0.85, { label: false }).svg;
  let o = `<path d="M${f1(x0)} ${f1(y0)}V${f1(y0 + h)}H${f1(x0 + s)}" ${stroke('var(--sim-label)', 3)}/>`;
  const sup = `M${f1(x0 + s * 0.12)} ${f1(y0 + h * 0.9)}L${f1(x0 + s * 0.75)} ${f1(y0 + h * 0.08)}`;
  const dem = `M${f1(x0 + s * 0.12)} ${f1(y0 + h * 0.08)}L${f1(x0 + s * 0.75)} ${f1(y0 + h * 0.9)}`;
  if (i === 0) {
    o += `<path d="${sup}" ${stroke('var(--sim-label-muted)', 3, 'stroke-dasharray:6 5')}/><path d="${sup}" transform="translate(${f1(s * 0.22)} 0)" ${stroke(SUP, 5)}/>`;
    o += arrow(x0 + s * 0.38, y0 + h * 0.5, x0 + s * 0.6, y0 + h * 0.5, ACC, 3.5);
  } else if (i === 1) {
    o += `<path d="${dem}" ${stroke('var(--sim-label-muted)', 3, 'stroke-dasharray:6 5')}/><path d="${dem}" transform="translate(${f1(s * 0.22)} 0)" ${stroke(MKT, 5)}/>`;
    o += arrow(x0 + s * 0.38, y0 + h * 0.5, x0 + s * 0.6, y0 + h * 0.5, ACC, 3.5);
  } else {
    o += `<path d="${sup}" ${stroke(SUP, 4.5)}/><path d="${dem}" ${stroke(MKT, 4.5)}/>`;
    const ex = x0 + s * 0.435, ey = y0 + h * 0.49;
    o += `<circle cx="${f1(ex)}" cy="${f1(ey)}" r="11" ${fill('none', 'stroke:var(--sim-accent);stroke-width:3.5')}/><circle cx="${f1(ex)}" cy="${f1(ey)}" r="5" ${fill('var(--sim-label)')}/>`;
  }
  return o;
}

export class MarketQuestionsScene extends SvgScene {
  static WIDTH = 560;
  static PORTRAIT_WIDTH = 390;
  static HEIGHT = 490;
  static PORTRAIT_HEIGHT = 640;
  static CONTINUOUS = false;
  static BEAT_STEP_MAP = MAP;
  static BEAT_MAPS = { 3: MAP };
  static CONTROLS = [];
  static ARIA_LABEL = 'A heap of onions with a price tag that goes up and down. Four questions to ask when a price changes: is supply changing, is demand changing, is the market moving towards equilibrium, is the government helping or hurting? Then two graphs: on the market demand curve, when the price falls from 150 to 50 rupees, the quantity demanded rises from 6 to 18 kg; on the market supply curve, when the price rises from 50 to 150 rupees, the quantity supplied rises from 6 to 18 kg. Then demand moves right and the market moves to a new equilibrium, and the government, which helps with essentials, public goods and one-seller markets, but can harm with too many rules.';

  async setup() {
    this.lit = -1;
    this.anim = false;
    this.fresh = false;
    await super.setup();
    this._onClick = (e) => {
      const b = e.target?.closest?.('[data-act]');
      if (!b) return;
      const a = b.dataset.act, s = this.stepIndex;
      if (s === 0 && a === 'card') { const v = Number(b.dataset.val); this.lit = this.lit === v ? -1 : v; this.burst(1.2); }
      else if (a === 'replay') this.burst(1.8);
    };
    this.root.addEventListener('click', this._onClick);
  }

  destroy() {
    this.root?.removeEventListener('click', this._onClick);
    super.destroy();
  }

  css() {
    return BTN_CSS + `
svg .mk-bob { animation: mk-bob 1.8s cubic-bezier(.45,0,.3,1) both; animation-delay: var(--d, 0s); }
@keyframes mk-bob { 0% { transform: none; } 30% { transform: translateY(-34px); } 65% { transform: translateY(26px); } 100% { transform: none; } }
@media (prefers-reduced-motion: reduce) { svg .mk-bob { animation: none; } }`;
  }

  clear() { for (const t of (this._timers ?? []).splice(0)) clearTimeout(t); this.anim = false; this.fresh = false; }

  enter(step) {
    this.clear();
    this.lit = -1;
    this.burst(step === 0 ? 2.2 : 1.8);
  }

  burst(sec) {
    this.clear();
    this.anim = true;
    this.fresh = true;
    this.repaint();
    this.fresh = false;
    this.after(sec, () => { this.anim = false; this.repaint(); });
  }

  skip() {
    if (!this.anim) return false;
    this.clear();
    this.repaint();
    return true;
  }

  busy() { return this.anim; }

  stageHeight(st) { return Math.round((st.portrait ? 640 : 490) * st.W / (st.portrait ? 390 : 560)); }

  pop(d) { return this.fresh ? ` class="mq-pop" style="--d:${d}s"` : ''; }
  fade(d) { return this.fresh ? ` class="mq-fade" style="--d:${d}s"` : ''; }

  paint(st) {
    const P = st.portrait, DW = P ? 390 : 560, DH = P ? 640 : 490, k = (st.W / DW).toFixed(4), s = this.stepIndex;
    const out = s === 0 ? this.paintAsk(P) : s === 1 ? this.paintLaws(P) : this.paintClose(P);
    return { svg: `<g transform="scale(${k})">${out.svg}</g>`, over: `<div style="position:absolute;left:0;top:0;width:${DW}px;height:${DH}px;transform:scale(${k});transform-origin:0 0">${out.over}</div>` };
  }

  card(i, x, y, w, h, P) {
    const q = QS[i], on = this.lit < 0;
    let s = `<g style="opacity:${on ? 1 : 0.25}">`;
    s += `<rect x="${f1(x - w / 2)}" y="${f1(y - h / 2)}" width="${f1(w)}" height="${f1(h)}" rx="18" ${fill('var(--sim-bg-surface)', `stroke:${q.col};stroke-width:4`)}/>`;
    s += mini(i, x, y - h / 2 + (P ? 50 : 56), P ? 92 : 104);
    const fs = P ? 19 : 21;
    let ty = y + h / 2 - (P ? 46 : 50);
    for (const t of q.short) { s += txt(x, ty, t, fs, 'var(--sim-label)'); ty += fs * 1.25; }
    return s + '</g>';
  }

  big(i, cx, cy, w, h, P) {
    const q = QS[i], fs = P ? 24 : 26;
    let s = `<rect x="${f1(cx - w / 2)}" y="${f1(cy - h / 2)}" width="${f1(w)}" height="${f1(h)}" rx="22" ${fill('var(--sim-bg-surface)', `stroke:${q.col};stroke-width:5`)}/>`;
    let ty = cy - h / 2 + fs + 18;
    for (const t of q.long) { s += txt(cx, ty, t, fs, 'var(--sim-label)'); ty += fs * 1.25; }
    const top = ty + 8, bot = cy + h / 2 - 22, L = cx - w / 2 + 60, R = cx + w / 2 - 34;
    if (i === 3) {
      const B = govBuilding(cx, bot - 60, P ? 200 : 220, { label: false });
      s += B.svg + `<path d="M${f1(cx - w / 2 + 20)} ${f1(bot - 58)}H${f1(cx + w / 2 - 20)}" ${stroke('var(--sim-stroke)', 3)}/>`;
      s += pill(cx - (P ? 80 : 100), bot - 22, 'helping', { size: 22, ...GOOD }) + pill(cx + (P ? 80 : 100), bot - 22, 'hurting', { size: 22, ...BAD });
      return s;
    }
    const g = gFrame(L, R, top + 20, bot - 34);
    s += gAxes(g, { title: 20, xTitleY: bot - 4, yTitleX: L - 24 });
    const clip = `mkq${i}`;
    if (i === 0) s += shiftGraph(g, { s: 2, gs: 0, fromS: this.fresh ? 0 : null, ghostE: { d: 0, s: 0 }, guides: false, lab: 20, clip });
    else if (i === 1) s += shiftGraph(g, { d: 2, gd: 0, fromD: this.fresh ? 0 : null, ghostE: { d: 0, s: 0 }, guides: false, lab: 20, clip });
    else {
      s += shiftGraph(g, { guides: true, lab: 20, clip });
      const e = ePos(g), y0 = g.Y(8.6);
      s += `<g${this.fade(0.2)}>${pill(g.L + 64, y0, `${RS} high`, { size: 18, ...BAD })}${arrow(g.L + 18, y0 + 4, g.L + 18, e.y - 8, ACC, 5)}</g>`;
    }
    return s;
  }

  // b0: a price that moves, and four questions to ask
  paintAsk(P) {
    const G = P
      ? { cards: [[100, 128], [290, 128], [100, 512], [290, 512]], cw: 176, ch: 196, tag: [195, 268], heap: [195, 388, 150], big: [195, 320, 366, 560], hint: [195, 628] }
      : { cards: [[100, 128], [460, 128], [100, 362], [460, 362]], cw: 184, ch: 212, tag: [280, 168], heap: [280, 330, 150], big: [280, 245, 470, 450], hint: [280, 482] };
    let svg = '', over = '';
    // the onions and their moving price tag
    svg += onions(G.heap[0], G.heap[1], G.heap[2]);
    const [tx, ty] = G.tag;
    svg += `<path d="M${f1(tx)} ${f1(ty + 24)}V${f1(G.heap[1] - G.heap[2] * 0.62)}" ${stroke('var(--sim-label-muted)', 3, 'stroke-dasharray:6 6')}/>`;
    svg += `<g${this.fresh && this.lit < 0 ? ' class="mk-bob" style="--d:0.3s"' : ''}>${pill(tx, ty, 'price', { size: 26, bg: 'var(--sim-bg-surface)', ink: 'var(--sim-label)', edge: 'var(--sim-label)' })}`;
    svg += arrow(tx + 66, ty + 16, tx + 66, ty - 22, 'var(--sim-bad)', 5) + arrow(tx - 66, ty - 16, tx - 66, ty + 22, 'var(--sim-good)', 5) + '</g>';
    G.cards.forEach(([x, y], i) => {
      svg += `<g${this.lit < 0 ? this.pop(0.3 + i * 0.15) : ''}>${this.card(i, x, y, G.cw, G.ch, P)}</g>`;
      if (this.lit < 0) over += `<button type="button" class="sv-hit tap btn mq-hit" data-act="card" data-val="${i}" aria-pressed="${this.lit === i}" aria-label="${QS[i].long.join(' ')}" style="left:${f1(x - G.cw / 2)}px;top:${f1(y - G.ch / 2)}px;width:${f1(G.cw)}px;height:${f1(G.ch)}px"></button>`;
    });
    if (this.lit >= 0) {
      const [cx, cy, bw, bh] = G.big;
      svg += `<g${this.pop(0)}>${this.big(this.lit, cx, cy, bw, bh, P)}</g>`;
      over += `<button type="button" class="sv-hit tap btn mq-hit" data-act="card" data-val="${this.lit}" aria-pressed="true" aria-label="back to all four questions" style="left:${f1(cx - bw / 2)}px;top:${f1(cy - bh / 2)}px;width:${f1(bw)}px;height:${f1(bh)}px"></button>`;
    }
    if (!this.anim) svg += txt(G.hint[0], G.hint[1], this.lit < 0 ? 'tap a question' : 'tap again for all four', 18, 'var(--sim-label-muted)');
    return { svg, over };
  }

  // b1: the law of demand and the law of supply, on the mango market
  paintLaws(P) {
    const gs = P
      ? [frame(92, 360, 66, 226, 24, 200), frame(92, 360, 340, 500, 24, 200)]
      : [frame(84, 260, 70, 330, 24, 200), frame(360, 536, 70, 330, 24, 200)];
    let svg = '';
    [0, 1].forEach((k) => {
      const g = gs[k], dem = k === 0, col = dem ? MKT : SUP, ink = SINK(dem ? 5 : 7);
      svg += axes(g, { xs: [6, 18], ys: [50, 150], gridX: [6, 18], gridY: [50, 150], tick: 18, title: 18, yTitle: 'price', xTitle: 'kg',
        yTitleX: g.L - 62, xTitleY: g.B + 50 });
      svg += dem ? line(g, 1.5, 187.5, 22.5, 12.5, col, { w: 7 }) : line(g, 1.5, 12.5, 22.5, 187.5, col, { w: 7 });
      svg += dem ? curveLabel(g.X(1.5) + 12, g.Y(187.5) + 4, 'D', ink, 26) + curveLabel(g.X(20) - 16, g.Y(30) + 34, 'D', ink, 26, 'end', true)
        : curveLabel(g.X(1.5) + 14, g.Y(12.5) + 2, 'S', ink, 26) + curveLabel(g.X(19) - 18, g.Y(178), 'S', ink, 26, 'end', true);
      const [q0, p0, q1, p1] = dem ? [6, 150, 18, 50] : [6, 50, 18, 150];
      const x0 = g.X(q0), y0 = g.Y(p0), x1 = g.X(q1), y1 = g.Y(p1);
      svg += `<circle cx="${f1(x0)}" cy="${f1(y0)}" r="10" ${fill('var(--sim-bg-surface)', `stroke:${col};stroke-width:3;stroke-dasharray:4 3`)}/>`;
      const ang = Math.atan2(y1 - y0, x1 - x0), ox = Math.sin(ang) * 22 * (dem ? -1 : 1), oy = -Math.cos(ang) * 22 * (dem ? -1 : 1);
      svg += `<g${this.fade(0.9)}>${arrow(x0 + ox + (x1 - x0) * 0.12, y0 + oy + (y1 - y0) * 0.12, x1 + ox - (x1 - x0) * 0.12, y1 + oy - (y1 - y0) * 0.12, ACC, 5)}</g>`;
      svg += `<g${this.fresh ? ` class="mq-fly" style="--dx:${f1(x0 - x1)}px;--dy:${f1(y0 - y1)}px;--dur:0.8s;--d:0.2s"` : ''}>${dot(x1, y1, '', { col, r: 11 })}</g>`;
      const a = dem ? ['price falls', 'more wanted'] : ['price rises', 'more offered'];
      if (P) svg += `<g${this.pop(1.1)}>${pill((g.L + g.R) / 2 - 20, g.T - 34, `${a[0]}: ${a[1]}`, { size: 19, bg: 'var(--sim-bg-surface)', ink, edge: col })}</g>`;
      else {
        svg += `<g${this.pop(1.1)}>${pill((g.L + g.R) / 2 - 10, g.B + 92, a[0], { size: 20, bg: 'var(--sim-bg-surface)', ink, edge: col })}`;
        svg += `${pill((g.L + g.R) / 2 - 10, g.B + 132, a[1], { size: 20, bg: col, ink: 'var(--sim-bg-deep)', edge: col })}</g>`;
      }
    });
    if (!P) svg += txt(280, 34, 'the mango market', 20, 'var(--sim-label-muted)');
    let over = '';
    if (!this.anim) over += btn('replay', 'replay', P ? 195 : 500, P ? 604 : 34, { size: 17 });
    return { svg, over };
  }

  // b2: a new equilibrium; the government can help or harm
  paintClose(P) {
    const g = P ? gFrame(60, 360, 60, 280) : gFrame(64, 300, 70, 350);
    const G = P
      ? { b: [100, 470, 170], helps: [262, 352], hi: [[230, 406], [290, 406], [350, 406]], harm: [262, 474], rules: [262, 536], rl: [262, 600] }
      : { b: [430, 186, 190], helps: [430, 236], hi: [[370, 292], [430, 292], [490, 292]], harm: [430, 360], rules: [430, 414], rl: [430, 466] };
    let svg = '', over = '';
    svg += gAxes(g, { title: 20, xTitleY: g.B + 30, yTitleX: g.L - 22 });
    svg += shiftGraph(g, { d: 2.4, gd: 0, fromD: this.fresh ? 0 : null, ghostE: { d: 0, s: 0 }, eName: "E'", guides: false, lab: 20, clip: 'mkc' });
    const e = ePos(g, 2.4, 0);
    svg += `<g${this.pop(1.0)}>${pill(92, g.T - 32, 'new equilibrium', { size: 18, bg: ACC, ink: ACC_INK, edge: ACC })}</g>`;
    // the government: helps / can harm
    const B = govBuilding(G.b[0], G.b[1], G.b[2], { size: 18 });
    svg += `<g${this.pop(0.3)}>${B.svg}</g>`;
    svg += `<g${this.pop(0.6)}>${pill(G.helps[0], G.helps[1], 'helps', { size: 22, ...GOOD })}`;
    svg += medBox(G.hi[0][0], G.hi[0][1] + 18, 46) + icon('tree', G.hi[1][0], G.hi[1][1], 50, 'var(--sim-series-3)') + icon('shop', G.hi[2][0], G.hi[2][1], 50, 'var(--sim-series-4)') + '</g>';
    svg += `<g${this.pop(0.9)}>${pill(G.harm[0], G.harm[1], 'can harm', { size: 22, ...BAD })}`;
    for (let k = 0; k < 4; k++) svg += icon('scroll', G.rules[0] - 54 + k * 36, G.rules[1] - (k % 2) * 8, 48, 'var(--sim-label-muted)');
    svg += txt(G.rl[0], G.rl[1], 'too many rules', 19, 'var(--sim-label)') + '</g>';
    if (P) svg += `<path d="M10 ${f1(G.b[1] + 2)}H190" ${stroke('var(--sim-stroke)', 3)}/>`;
    if (!this.anim) over += btn('replay', 'replay', P ? 90 : 160, P ? 600 : 460, { size: 17 });
    return { svg, over };
  }

  testState() {
    return { step: this.stepIndex, lit: this.lit >= 0 ? QS[this.lit].long.join(' ') : null, anim: this.anim,
      demand: { from: [150, 6], to: [50, 18] }, supply: { from: [50, 6], to: [150, 18] } };
  }
}
