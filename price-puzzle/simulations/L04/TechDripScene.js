/**
 * TechDripScene - L04 s05 "Better Technology" (3 beats). SvgScene, design units 560 x 480 landscape, 390 x 600
 * portrait. Book Q3 numbers only: drip irrigation, 40 per cent less water, 30 per cent more crop. The farmer (he)
 * is the course cast 'farmer' (registered as in CropChoiceScene, same look); his field is SimFarm 'pulse' strips.
 *   b0  "by hand" / "drip": by hand, the farmer carries two water buckets to a dry field; drip, thin pipes run
 *       along every strip with drops at each plant and he stands at the tap. Two bars under it: water and crop,
 *       the "by hand" length as a dashed ghost: "40% less" and "30% more". Cold start: by hand, then drip.
 *   b1  "cost of each kg": a 1 kg scale and a tag with a down arrow; then his supply curve SS' slides right (ghost
 *       of the old one, arrows at three prices). No numbers on the graph. Same two buttons. Cold start: drip.
 *   b2  many fields with drip pipes, a truck "kept cool" carrying mangoes to a far market whose heap grows; the
 *       market supply curve SmSm' (series-7) slides right. "again" replays.
 * Colours are tokens only. ASCII only.
 */
import { SvgScene, fill, stroke, shade } from 'simulations/base/kit/SimSvg.js';
import { farmSpec, farmSvg, cropTone } from 'simulations/base/kit/SimFarm.js';
import { civicSvg } from 'simulations/base/kit/SimCivic.js';
import { MANGO_CSS, heap, pan } from '../shared/MangoKit.js';
import { PEOPLE_CSS, paintPeople, personSlot, frontSvg, registerCast } from '../shared/MangoPeople.js';
import { BTN_CSS, txt, frame, axes, line, arrow, pill, btn } from '../shared/MarketParts.js';
import { SUP, INK, stallArt, stallGeo, bigArrow } from '../shared/SupplyParts.js';
import { SHIFT, smGraph } from '../shared/SupplyMoves.js';

registerCast('farmer', { name: 'the farmer', role: 'farmer', i: 0,
  look: { outfit: 'kurta', hairStyle: 'short', top: 'sage', bottom: 'cream', shoeStyle: 'sandal', pattern: 'plain', moustache: true, glasses: false, dupatta: false, girth: 1 } });

const f1 = (v) => (+v).toFixed(1);
const MAP = [[{ idx: 0, dwellMs: null }], [{ idx: 1, dwellMs: null }], [{ idx: 2, dwellMs: null }]];
const WATER = 'var(--sim-water)';
const CROP = cropTone('pulse');
const HIS = 'var(--sim-series-3)';
const MOVE = 'var(--sim-accent)';
const PIPE = 'color-mix(in oklab, var(--sim-label) 70%, var(--sim-bg-surface))';

const CSS = `
svg .td-grow { transform-box: fill-box; transform-origin: 0 50%; animation: td-grow 0.7s cubic-bezier(.45,0,.3,1) both; animation-delay: var(--d, 0s); }
@keyframes td-grow { 0% { transform: scaleX(var(--s0, 1)); } 100% { transform: none; } }
svg .td-pipe { stroke-dasharray: 600; animation: td-pipe 0.8s ease-out both; animation-delay: var(--d, 0s); }
@keyframes td-pipe { 0% { stroke-dashoffset: 600; } 100% { stroke-dashoffset: 0; } }
@media (prefers-reduced-motion: reduce) { svg .td-grow, svg .td-pipe { animation: none; } }
`;

/** A bucket, (x, y) = the handle top, h tall; water inside when full. */
function bucket(x, y, h) {
  const w = h * 0.86, top = y + h * 0.3, rim = 'color-mix(in oklab, var(--sim-label) 55%, var(--sim-bg-surface))';
  return `<path d="M${f1(x - w * 0.46)} ${f1(top)}Q${f1(x)} ${f1(y - h * 0.1)} ${f1(x + w * 0.46)} ${f1(top)}" ${stroke(rim, 3)}/>`
    + `<path d="M${f1(x - w / 2)} ${f1(top)}L${f1(x - w * 0.38)} ${f1(top + h * 0.7)}H${f1(x + w * 0.38)}L${f1(x + w / 2)} ${f1(top)}Z" ${fill('color-mix(in oklab, var(--sim-stroke) 40%, var(--sim-bg-surface))', `stroke:${rim};stroke-width:2.5;stroke-linejoin:round`)}/>`
    + `<ellipse cx="${f1(x)}" cy="${f1(top)}" rx="${f1(w / 2)}" ry="${f1(h * 0.08)}" ${fill(WATER, `stroke:${rim};stroke-width:2.5`)}/>`;
}

/** Drip pipes over a SimFarm field: a feed pipe down the left end, a thin pipe along each strip, a drop per plant. */
function dripPipes(spec, x, y, o = {}) {
  let s = '';
  const strips = spec.strips, lx = x + 10;
  const y0 = y + strips[0].y + strips[0].h * 0.5, y1 = y + strips[strips.length - 1].y + strips[strips.length - 1].h * 0.5;
  const anim = o.anim ? ' class="td-pipe"' : '';
  s += `<path${anim} d="M${f1(lx)} ${f1(y0 - 40)}V${f1(y1)}" ${stroke(PIPE, o.w ? o.w * 1.6 : 8)}/>`;
  strips.forEach((st, i) => {
    const py = y + st.y + st.h * 0.5, n = o.drops ?? 6;
    s += `<path${o.anim ? ` class="td-pipe" style="--d:${(0.2 + i * 0.12).toFixed(2)}s"` : ''} d="M${f1(lx)} ${f1(py)}H${f1(x + st.x + st.w - 8)}" ${stroke(PIPE, o.w ?? 5)}/>`;
    for (let j = 0; j < n; j++) {
      const dx = x + st.x + 34 + (j + 0.5) * ((st.w - 50) / n), dy = py + (o.w ?? 5) * 0.6;
      const r = o.r ?? 4.5;
      s += `<path d="M${f1(dx)} ${f1(dy)}c${f1(-r)} ${f1(r * 1.4)} ${f1(-r)} ${f1(r * 2.4)} 0 ${f1(r * 2.4)}c${f1(r)} 0 ${f1(r)} ${f1(-r)} 0 ${f1(-r * 2.4)}z" ${fill(WATER)}/>`;
    }
  });
  // the tap at the top of the feed pipe
  s += `<rect x="${f1(lx - 12)}" y="${f1(y0 - 52)}" width="24" height="16" rx="4" ${fill('var(--sim-accent)', 'stroke:var(--sim-stroke);stroke-width:2')}/>`;
  return s;
}

export class TechDripScene extends SvgScene {
  static WIDTH = 560;
  static PORTRAIT_WIDTH = 390;
  static HEIGHT = 480;
  static PORTRAIT_HEIGHT = 600;
  static CONTINUOUS = false;
  static BEAT_STEP_MAP = MAP;
  static BEAT_MAPS = { 3: MAP };
  static CONTROLS = [];
  static ARIA_LABEL = 'A farmer used to carry water to his field in buckets. With drip irrigation, thin pipes bring water to each plant: the field uses 40 per cent less water and gives 30 per cent more crop. So each kilogram costs him less to produce, and his supply curve moves to the right. When many farmers use better technology, market supply rises; trucks that keep mangoes cool carry them to distant markets, which get a bigger supply.';

  async setup() {
    this.drip = true;
    this.anim = false;
    this.fresh = false;
    this.changed = false;
    await super.setup();
    this._onClick = (e) => {
      const b = e.target?.closest?.('[data-act]');
      if (b) this.act(b.dataset.act, b.dataset.val);
    };
    this.root.addEventListener('click', this._onClick);
  }

  destroy() {
    this.root?.removeEventListener('click', this._onClick);
    super.destroy();
  }

  css() { return MANGO_CSS + PEOPLE_CSS + BTN_CSS + CSS; }

  repaint() { super.repaint(); paintPeople(this); }

  clear() { for (const t of (this._timers ?? []).splice(0)) clearTimeout(t); this.anim = false; this.fresh = false; this.changed = false; }

  enter(step) {
    this.clear();
    this.drip = true;
    if (step === 2) this.burst(2.2);
    else { this.drip = false; this.setDrip(true); }
  }

  burst(sec) {
    this.anim = true;
    this.fresh = true;
    this.repaint();
    this.fresh = false;
    this.changed = false;
    this.after(sec, () => { this.anim = false; this.repaint(); });
  }

  setDrip(v) {
    const was = this.drip;
    this.clear();
    this.drip = v;
    this.changed = was !== v;
    this.burst(v ? 1.8 : 0.8);
  }

  act(a, v) {
    const s = this.stepIndex;
    if (s < 2 && a === 'drip') this.setDrip(v === '1');
    else if (s === 2 && a === 'again') { this.clear(); this.burst(2.2); }
  }

  skip() {
    if (!this.anim) return false;
    this.clear();
    this.repaint();
    return true;
  }

  busy() { return this.anim; }

  stageHeight(st) { return Math.round((st.portrait ? 600 : 480) * st.W / (st.portrait ? 390 : 560)); }

  paint(st) {
    const P = st.portrait, DW = P ? 390 : 560, DH = P ? 600 : 480, k = (st.W / DW).toFixed(4), s = this.stepIndex;
    const out = s === 0 ? this.paintField(P, DW, DH) : s === 1 ? this.paintCost(P) : this.paintMany(P);
    return { svg: `<g transform="scale(${k})">${out.svg}</g>`, over: `<div style="position:absolute;left:0;top:0;width:${DW}px;height:${DH}px;transform:scale(${k});transform-origin:0 0">${out.over ?? ''}</div>` };
  }

  twoButtons(G) {
    return btn('drip', 'by hand', G.b[0][0], G.b[0][1], { val: '0', on: !this.drip, size: 19 })
      + btn('drip', 'drip', G.b[1][0], G.b[1][1], { val: '1', on: this.drip, size: 19 });
  }

  // b0: by hand or drip; water and crop bars.
  paintField(P, DW, DH) {
    let svg = '', over = '', front = '';
    const G = P
      ? { fx: 120, fy: 92, fw: 256, fh: 236, man: [64, 330, 190], b: [[120, 40], [262, 40]], bars: { lx: 16, x0: 16, k: 2.5, y: [418, 508], h: 34, above: true } }
      : { fx: 214, fy: 74, fw: 330, fh: 240, man: [104, 320, 214], b: [[300, 32], [430, 32]], bars: { lx: 116, x0: 128, k: 2.4, y: [380, 434], h: 36, above: false } };
    const drip = this.drip, fresh = this.fresh && this.changed;
    const spec = farmSpec({ strips: [0, 1, 2].map(() => ({ crop: 'pulse', soil: drip ? 'loam' : 'dry' })), orient: 'rows', w: G.fw, h: G.fh, gap: 8 });
    svg += farmSvg(spec, { x: G.fx, y: G.fy, tags: false, animate: fresh && drip ? true : undefined, lag: 0.15 });
    const [mx, my, mh] = G.man;
    if (drip) {
      svg += dripPipes(spec, G.fx, G.fy, { anim: fresh, drops: P ? 5 : 6 });
      over += personSlot('farmer', { x: mx, y: my, h: mh, pose: 'stand', facing: 0, mood: 'happy' });
    } else {
      const hl = { x: mx - mh * 0.34, y: my - mh * 0.4 }, hr = { x: mx + mh * 0.34, y: my - mh * 0.4 };
      over += personSlot('farmer', { x: mx, y: my, h: mh, pose: 'stand', facing: 0, mood: 'effort', hands: [hl, hr] });
      front += bucket(hl.x, hl.y, mh * 0.24) + bucket(hr.x, hr.y, mh * 0.24);
      over += frontSvg(DW, DH, front);
    }
    over += this.twoButtons(G);
    // the two bars: water and crop, "by hand" = 100
    const B = G.bars;
    [['water', WATER, drip ? 60 : 100, '40% less'], ['crop', CROP, drip ? 130 : 100, '30% more']].forEach(([lab, col, v, tag], i) => {
      const y = B.y[i];
      if (B.above) svg += txt(B.x0, y - B.h / 2 - 10, lab, 21, 'var(--sim-label)', 'start');
      else svg += txt(B.lx, y + 8, lab, 22, 'var(--sim-label)', 'end');
      const grow = fresh ? ` class="td-grow" style="--s0:${(drip ? (i ? 100 / 130 : 100 / 60) : (i ? 130 / 100 : 60 / 100)).toFixed(3)};--d:0.5s"` : '';
      svg += `<g${grow}><rect x="${B.x0}" y="${f1(y - B.h / 2)}" width="${f1(v * B.k)}" height="${B.h}" rx="10" ${fill(col, `stroke:${shade(col, 70)};stroke-width:2.5`)}/></g>`;
      if (drip) {
        svg += `<rect x="${B.x0}" y="${f1(y - B.h / 2 - 4)}" width="${f1(100 * B.k)}" height="${B.h + 8}" rx="12" ${fill('none', 'stroke:var(--sim-label-muted);stroke-width:2.5;stroke-dasharray:8 6')}/>`;
        const tx = B.above ? 374 : B.x0 + Math.max(v, 100) * B.k + 12, ty = B.above ? y - B.h / 2 - 10 : y + 9;
        svg += `<g${fresh ? ' class="mq-pop" style="--d:1.1s"' : ''}>${txt(tx, ty, tag, 24, 'var(--sim-label)', B.above ? 'end' : 'start')}</g>`;
      }
    });
    if (drip) svg += txt(B.x0 + 100 * B.k, B.y[1] + B.h / 2 + 24, 'by hand', 17, 'var(--sim-label-muted)', 'middle');
    return { svg, over };
  }

  // b1: each kg costs less; his supply curve moves right.
  paintCost(P) {
    let svg = '', over = '';
    const G = P
      ? { pan: [140, 236, 150], tag: [140, 36], ar: [296, 90, 190], cap: [140, 270], g: frame(86, 366, 336, 508, 20, 200), yT: 30, xT: 546, b: [[120, 578], [262, 578]] }
      : { pan: [110, 374, 150], tag: [110, 62], ar: [110, 92, 168], cap: [110, 406], g: frame(270, 536, 40, 334, 20, 200), yT: 236, xT: 374, b: [[300, 438], [430, 438]] };
    const drip = this.drip, fresh = this.fresh && this.changed;
    svg += pan(G.pan[0], G.pan[1], 1, { w: G.pan[2] });
    svg += pill(G.tag[0], G.tag[1], 'cost of each kg', { size: P ? 21 : 22, bg: drip ? `color-mix(in oklab, ${MOVE} 16%, var(--sim-bg-surface))` : 'var(--sim-bg-surface)', edge: drip ? MOVE : 'var(--sim-stroke)' });
    if (drip) svg += `<g${fresh ? ' class="mq-pop" style="--d:0.2s"' : ''}>${bigArrow(G.ar[0], G.ar[1], G.ar[2], 1, MOVE, P ? 22 : 26)}</g>`;
    if (drip) svg += `<g${fresh ? ' class="mq-fade" style="--d:0.3s"' : ''}>${txt(G.cap[0], G.cap[1], 'less water and work,', 18, 'var(--sim-label-muted)')}${txt(G.cap[0], G.cap[1] + 24, 'more crop', 18, 'var(--sim-label-muted)')}</g>`;
    const g = G.g;
    svg += axes(g, { xs: [], ys: [], gridX: [5, 10, 15], gridY: [50, 100, 150], yTitleX: G.yT, xTitleY: G.xT, title: P ? 20 : 21 });
    const lab = (x, y, a) => `<text x="${f1(x)}" y="${f1(y)}" text-anchor="${a}" style="fill:${HIS};font:800 28px var(--sim-font)">S'</text>`;
    const seg = [2, 20, 12, 185], d = drip ? 5 : 0;
    if (drip) svg += line(g, seg[0], seg[1], seg[2], seg[3], 'var(--sim-label-muted)', { w: 5, dash: '10 9', opacity: 0.6 });
    const slide = fresh ? ` class="mq-fly" style="--dx:${f1(g.X(0) - g.X(5))}px;--dy:0px;--dur:0.8s;--d:0.6s"` : '';
    svg += `<g${slide}>${line(g, seg[0] + d, seg[1], seg[2] + d, seg[3], HIS, { w: 7 })}${lab(g.X(seg[2] + d) + 4, g.Y(seg[3]) + 6, 'start')}</g>`;
    if (drip) {
      let ar = '';
      for (const p of [150, 100, 50]) {
        const q = seg[0] + (p - seg[1]) / ((seg[3] - seg[1]) / (seg[2] - seg[0]));
        ar += arrow(g.X(q) + 12, g.Y(p), g.X(q + 5) - 14, g.Y(p), 'var(--sim-good)', 4.5);
      }
      svg += `<g${fresh ? ' class="mq-fade" style="--d:1.4s"' : ''}>${ar}</g>`;
    }
    svg += pill(g.R - 70, g.B - 28, drip ? 'moves right' : 'his supply', { size: P ? 18 : 19, bg: `color-mix(in oklab, ${HIS} 18%, var(--sim-bg-surface))`, edge: HIS });
    over += this.twoButtons(G);
    return { svg, over };
  }

  // b2: many farmers, cold storage, a far market; market supply right.
  paintMany(P) {
    let svg = '', over = '';
    const G = P
      ? { fields: [[14, 14], [134, 14], [254, 14]], fw: 120, fh: 96, road: 236, roadW: 390, truck: [[60, 236], [260, 236]], tw: 150, mk: [300, 372], mw: 140, g: frame(70, 262, 410, 528, 26, 200), again: [330, 520], tx: [195, 134], pill: [176, 586] }
      : { fields: [[16, 16], [146, 16], [16, 128], [146, 128]], fw: 122, fh: 100, road: 404, roadW: 560, truck: [[70, 404], [250, 404]], tw: 170, mk: [462, 404], mw: 170, g: frame(352, 536, 24, 168, 26, 200), again: [70, 300], tx: [141, 254], pill: [444, 226] };
    const fresh = this.fresh;
    G.fields.forEach(([x, y], i) => {
      const spec = farmSpec({ strips: [0, 1].map(() => ({ crop: 'pulse', soil: 'loam' })), orient: 'rows', w: G.fw - 4, h: G.fh, gap: 6, border: false });
      svg += farmSvg(spec, { x, y, tags: false });
      svg += dripPipes(spec, x, y, { w: 3.5, r: 3, drops: 3 });
    });
    svg += txt(G.tx[0], G.tx[1], 'many farmers use drip', P ? 19 : 20, 'var(--sim-label)');
    // the road and the truck
    svg += `<rect x="0" y="${f1(G.road + 2)}" width="${G.roadW}" height="14" ${fill('color-mix(in oklab, var(--sim-stroke) 35%, var(--sim-bg-surface))')}/>`;
    const [t0, t1] = G.truck;
    const tr = civicSvg('truck', t1[0], t1[1], { w: G.tw }) + pill(t1[0] - G.tw * 0.08, t1[1] - G.tw * 0.36, 'kept cool', { size: P ? 17 : 18, bg: `color-mix(in oklab, ${'var(--sim-water)'} 30%, var(--sim-bg-surface))`, edge: 'var(--sim-water)' });
    svg += `<g${fresh ? ` class="mq-fly" style="--dx:${f1(t0[0] - t1[0])}px;--dy:0px;--dur:1.0s"` : ''}>${tr}</g>`;
    // the far market: a stall whose heap grows
    const [mx, my] = G.mk, sg = stallGeo(mx, my, G.mw);
    svg += stallArt(mx, my, G.mw);
    svg += `<g${fresh ? ' class="mq-pop" style="--d:1.0s"' : ''}>${heap(mx, sg.counter + 1, 6, { r: 6 })}</g>`;
    svg += pill(mx, my + 22, 'far market', { size: P ? 18 : 20 });
    // the market supply curve moves right
    const g = G.g;
    svg += axes(g, { xs: [], ys: [], gridX: [6, 12, 18, 24], gridY: [50, 100, 150], yTitle: 'price', xTitle: 'kg', yTitleX: g.L - 18, xTitleY: g.B + 26, title: 18 });
    svg += smGraph(g, { d: SHIFT, from: fresh ? 0 : undefined, arrows: !this.anim, pop: false, w: 6, lab: 22 });
    svg += pill(G.pill[0], G.pill[1], 'market supply rises', { size: P ? 18 : 19, bg: SUP, ink: INK(7), edge: SUP });
    if (!this.anim) over += btn('again', 'again', G.again[0], G.again[1], { size: 18 });
    return { svg, over };
  }

  testState() { return { step: this.stepIndex, drip: this.drip, anim: this.anim, water: this.drip ? '40% less' : 'by hand', crop: this.drip ? '30% more' : 'by hand' }; }
}
