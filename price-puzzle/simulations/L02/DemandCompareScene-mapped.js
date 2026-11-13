/**
 * DemandCompareScene-mapped - the L02 closing hook (blk-l02-s09).
 * The buyer's side of the mango market, mapped and closed: one price-quantity
 * plane carrying Srivalli's DD' (A/B/C) and the market's Dm-Dm' (E/F/G), and a
 * stall band under it holding what the buyers' side says they would take.
 * Beats: 0 the mapped plane, the stall counted at one price; 1 the stall greys
 * out and the unmapped sellers' half of the plane is marked with a "?"; 2 the
 * closing question. The learner moves along the three prices of the schedule
 * (control or a tap on a curve point) and asks who fills the stalls.
 * No frame loop: state is `data-step` plus one-shots, so the scene rests.
 */
import { SvgScene, chip, cardHtml, fill, stroke, cushionRect } from 'simulations/base/kit/SimSvg.js';
import { chartFrame, axesSvg, traceSvg, CHART_CSS } from 'simulations/base/kit/SimChart.js';
import { join } from 'simulations/base/kit/SimNumberLine.js';
import { noteLineHtml } from 'simulations/base/kit/SimLookDom.js';

const MAP = [0, 1, 2].map((i) => [{ idx: i, dwellMs: null }]);
const RUPEE = '\u20b9';
const PRICES = [150, 100, 50];
// Table 9.1 rows, the chapter's own schedule: price -> [Srivalli kg, all buyers kg].
const SCHED = { 150: [1, 6], 100: [2, 12], 50: [3, 18] };
const IND = [[1, 150], [2, 100], [3, 50]];   // A, B, C
const MKT = [[6, 150], [12, 100], [18, 50]];  // E, F, G
const LETTER = { ind: ['A', 'B', 'C'], mkt: ['E', 'F', 'G'] };
const KG_PER = 2;                             // one mango glyph counts 2 kg
const ASK_Q = 'What decides how much a seller brings?';

export class DemandCompareSceneMapped extends SvgScene {
  static WIDTH = 660;
  static HEIGHT = 510;
  static PORTRAIT_WIDTH = 380;
  static PORTRAIT_HEIGHT = 680;
  static BEAT_STEP_MAP = MAP;
  static ARIA_LABEL = "The buyers' side of the mango market: one price-quantity plane with Srivalli's steep demand curve through A, B and C and the wider market curve through E, F and G, a stall band under it that greys out, and an unmapped sellers' half marked with a question mark.";
  static CONTROLS = [
    {
      type: 'segmented', id: 'price', label: 'Price', value: '100',
      options: PRICES.map((p) => ({ value: String(p), label: RUPEE + p })),
    },
    { type: 'toggle', id: 'ask', label: 'Who fills the stalls?', value: false },
  ];

  css() {
    return CHART_CSS + `
.svs-head .sl-note-line { flex-basis: 100%; margin: 0; }
`;
  }

  enter(step) {
    this.price = 100;
    this.seen = { 100: true };   // the opening price is already on screen
    this.asks = step >= 2;
    this.freshCurves = true;
    this.freshStall = true;
  }

  isControlHidden(id) { return id === 'ask' ? this.stepIndex === 0 : false; }
  getControlValue(id) { return id === 'price' ? String(this.price) : undefined; }

  onControlChange(id, v) {
    if (this.isControlHidden(id)) return;
    if (id === 'price') { const p = Number(v); if (SCHED[p]) this.setPrice(p); }
    if (id === 'ask') { this.asks = !!v; this.freshStall = true; }
    this.repaint();
    this.requestUiUpdate?.();
  }

  setPrice(p) {
    this.price = p;
    this.freshStall = true;
    const first = !this.seen[p];
    this.seen[p] = true;
    const done = first && PRICES.every((q) => this.seen[q]);
    if (done) this.after(0.35, () => this.celebrate());
  }

  // The plane is sized for the width the host gives it, so the stage height is
  // a fixed landscape/portrait pair, measured by sim-layout.
  stageHeight(st) { return st.portrait ? 506 : 392; }

  // Where each part sits: the plane, the stall band under it, the reading card
  // beside it in landscape and under it in portrait.
  areas(st) {
    const cardW = st.portrait ? 0 : 188;
    const stallH = 106;
    const pw = st.W - cardW - (cardW ? 14 : 0);
    const ph = st.portrait ? st.H - stallH - 158 : st.H - stallH;
    return {
      plot: { x: 0, y: 0, w: pw, h: ph },
      stall: { x: 0, y: ph + 8, w: pw, h: stallH - 8 },
      card: st.portrait ? { x: 0, y: ph + stallH + 6, w: st.W } : { x: pw + 14, y: 0, w: cardW },
    };
  }

  frame(st) {
    const A = this.areas(st);
    return chartFrame({
      rect: A.plot,
      x: { min: 0, max: 20, ticks: [0, 5, 10, 15, 20], label: 'Quantity of mangoes (kg)' },
      y: { min: 0, max: 160, ticks: [50, 100, 150], label: `Price of mangoes (${RUPEE})`, fmt: (v) => (v ? RUPEE + v : '0') },
    });
  }

  pointerDown(p) {
    const f = this.frame(this.sv);
    for (const [kg, price] of [...IND, ...MKT]) {
      if (Math.hypot(p.x - f.px(kg), p.y - f.py(price)) < 30) { this.setPrice(price); return true; }
    }
    const S = this.areas(this.sv).stall;
    if (p.y >= S.y && p.x >= S.x && p.x <= S.x + S.w) { this.asks = true; return true; }
    return false;
  }

  paint(st) {
    const out = join(axesSvg(this.frame(st)), this.traces(st));
    out.svg += this.mappedHalf(st);
    const band = this.stallBand(st);
    out.svg += band.svg;
    out.over += band.over;
    out.over += this.card(st);
    out.head = this.head(st);
    this.freshCurves = false;
    this.freshStall = false;
    return out;
  }

  head(st) {
    const [ind, mkt] = SCHED[this.price];
    const rows = [];
    if (this.stepIndex >= 2) {
      rows.push(chip(ASK_Q, 0, 0, { tone: 'accent', size: 'big', static: true }));
    } else {
      rows.push(chip(RUPEE + this.price, 0, 0, { tone: 2, size: 'big', static: true }));
      rows.push(chip(`Srivalli ${ind} kg`, 0, 0, { tone: 1, static: true }));
      rows.push(chip(`all buyers ${mkt} kg`, 0, 0, { tone: 2, static: true }));
    }
    if (PRICES.every((p) => this.seen[p])) {
      rows.push(chip('buyers\u2019 side mapped', 0, 0, { tone: 'good', static: true }));
    }
    if (this.asks && this.stepIndex < 2) {
      rows.push(chip('who fills the stalls?', 0, 0, { tone: 'plain', static: true }));
    }
    rows.push(noteLineHtml([{ text: 'the buyers\u2019 side is mapped and closed; nothing here decides what arrives at the stalls' }]));
    return rows.join('');
  }

  // Both demand curves, their six labelled points, and the guides from the
  // chosen price row to the two axes.
  traces(st) {
    const f = this.frame(st);
    const out = { svg: '', over: '' };
    const g = (pts, tone) => traceSvg(f, pts.map(([q, r]) => ({ x: q, y: r })), {
      tone, end: false, draw: this.freshCurves, width: 7,
    }).svg;
    // Guides first, so the curves and dots sit on top of them.
    out.svg += this.guides(f, SCHED[this.price][0], 1) + this.guides(f, SCHED[this.price][1], 2);
    out.svg += g(IND, 1) + g(MKT, 2);
    const dots = (pts, letters, tone) => pts.map(([q, r], i) => {
      const x = f.px(q), y = f.py(r), right = x < f.plot.x + f.plot.w - 34;
      return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="9" ${fill('var(--sim-series-' + tone + ')', 'stroke:var(--sim-bg-surface);stroke-width:3')}/>`
        + `<text x="${(x + (right ? 14 : -14)).toFixed(1)}" y="${(y + 5).toFixed(1)}" text-anchor="${right ? 'start' : 'end'}" style="fill:var(--sim-label);font-size:17px">${letters[i]}</text>`;
    }).join('');
    out.svg += dots(IND, LETTER.ind, 1) + dots(MKT, LETTER.mkt, 2);
    return out;
  }

  guides(f, kg, tone) {
    const price = this.price;
    const x = f.px(kg).toFixed(1), y = f.py(price).toFixed(1);
    return `<path d="M${x} ${y}V${f.py(0).toFixed(1)}M${x} ${y}H${f.px(0).toFixed(1)}" ${stroke('var(--sim-series-' + tone + ')', 2, 'stroke-dasharray:6 6;opacity:0.5')}/>`;
  }

  // The half of the plane no one has mapped yet: a dashed "?" card where a
  // sellers' curve would one day sit. Nothing else - an empty half is the point,
  // and drawing a rising line here would read as data the lesson has not taught.
  mappedHalf(st) {
    if (this.stepIndex === 0) return '';
    const f = this.frame(st);
    const cx = (f.px(15.3) + f.px(18.3)) / 2, cy = (f.py(138) + f.py(108)) / 2;
    const w = 66, h = 50;
    return `<rect x="${(cx - w / 2).toFixed(1)}" y="${(cy - h / 2).toFixed(1)}" width="${w}" height="${h}" rx="12" ${fill('var(--sim-bg-surface)', 'stroke:var(--sim-label-muted);stroke-width:2.5;stroke-dasharray:7 6;opacity:0.9')}/>`
      + `<text x="${cx.toFixed(1)}" y="${(cy + 9).toFixed(1)}" text-anchor="middle" style="fill:var(--sim-label);font-size:26px;font-weight:800">?</text>`
      + `<text x="${cx.toFixed(1)}" y="${(cy + h / 2 + 18).toFixed(1)}" text-anchor="middle" style="fill:var(--sim-label-muted);font-size:15px;font-weight:800">not mapped</text>`;
  }

  // The stall band: mangoes counted at the chosen price, hollow from beat 1.
  stallBand(st) {
    const A = this.areas(st), S = A.stall;
    const kg = SCHED[this.price][1], n = Math.round(kg / KG_PER);
    const empty = this.stepIndex >= 1;
    const pad = 26, slabY = S.y + S.h - 20;
    const slot = (S.w - pad * 2) / Math.max(n, 6);
    const r = Math.min(15, slot / 2.4);
    let svg = `<rect x="${S.x}" y="${S.y}" width="${S.w}" height="${S.h}" rx="14" ${fill('var(--sim-bg-surface)', 'stroke:var(--sim-stroke);stroke-width:2.5')}/>`
      + cushionRect(S.x + 14, slabY, S.w - 28, 14, 6, 'var(--sim-series-8)');
    for (let i = 0; i < n; i++) {
      const x = S.x + pad + slot * (i + 0.5), y = slabY - r - 6;
      const leaf = `<path d="M${(x + r * 0.5).toFixed(1)} ${(y - r * 0.75).toFixed(1)} q${(r * 0.4).toFixed(1)} ${(-r * 0.8).toFixed(1)} ${(r * 1.0).toFixed(1)} ${(-r * 0.5).toFixed(1)}" ${empty ? stroke('var(--sim-label-muted)', 2, 'stroke-dasharray:3 3') : stroke('var(--sim-series-3)', 3.5)}/>`;
      const body = `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="${r.toFixed(1)}" ry="${(r * 0.82).toFixed(1)}" transform="rotate(-20 ${x.toFixed(1)} ${y.toFixed(1)})" ${empty ? stroke('var(--sim-label-muted)', 2.5, 'stroke-dasharray:4 4') : fill('var(--sim-series-8)')}/>`
        + (empty ? '' : `<ellipse cx="${(x - r * 0.3).toFixed(1)}" cy="${(y - r * 0.3).toFixed(1)}" rx="${(r * 0.3).toFixed(1)}" ry="${(r * 0.2).toFixed(1)}" transform="rotate(-20 ${x.toFixed(1)} ${y.toFixed(1)})" ${fill('var(--sim-series-2)', 'opacity:0.7')}/>`);
      const pop = this.freshStall && !empty;
      svg += `<g${pop ? ` class="sv-pop" style="--d:${(i * 0.05).toFixed(2)}s"` : ''}>${body}${leaf}</g>`;
    }
    let over = chip('the stalls', S.x + 26, S.y + 20, { tone: 'plain', size: 'sm', align: 'left' })
      + chip(`${n} \u00d7 ${KG_PER} kg`, S.x + S.w - 26, S.y + 20, { tone: empty ? 'plain' : 8, size: 'sm', align: 'right' });
    if (this.asks && this.stepIndex < 2) {
      over += chip('who fills these?', S.x + S.w / 2, S.y + 46, { tone: 'warning' });
    }
    return { svg, over };
  }

  card(st) {
    const A = this.areas(st), C = A.card;
    if (!C.w) return '';
    const [ind, mkt] = SCHED[this.price];
    return cardHtml(C.x, C.y, C.w, 'buyers\u2019 side', [
      { label: 'price', value: RUPEE + this.price },
      { label: 'Srivalli', value: `${ind} kg`, tone: 1 },
      { label: 'market', value: `${mkt} kg`, tone: 2 },
      { label: 'sellers bring', value: '?', tone: 'warning' },
    ], { tone: 2 });
  }
}