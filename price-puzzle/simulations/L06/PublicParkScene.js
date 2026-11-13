/**
 * PublicParkScene - L06 s05 "Goods for Everyone" (3 beats). SvgScene, design units 560 x 490 landscape,
 * 390 x 580 portrait. Only the book's number: Rs 5,000 per family. The 10 families and the Rs 50,000 needed are a
 * made-up example, said on screen.
 *   b0  a street of public goods: a road that crosses a canal on a bridge, streetlights, a park with people in it,
 *       a drain along the road. Rest: names on road, bridge, park, streetlights; chip "for everyone". Tap a thing:
 *       it stays lit, the rest dim, its name lights (the drain is named only when tapped).
 *   b1  an empty plot with a board "park / Rs 5,000 per family"; 10 houses (made-up example); 3 pay (green
 *       "Rs 5,000" tags), 7 have a thought cloud; a meter "collected" fills to Rs 15,000 of Rs 50,000 needed and
 *       stops: "not enough". Tap a house to read its thought ("others will pay" / "I paid"). Plays on entry.
 *   b2  the government building pays: an arrow "Rs 50,000" from it to the plot, which is now a park (trees,
 *       swing, path) with the families in it, rich and poor; chip "paid for by the government".
 * People are SimFigure people via ../shared/MangoPeople.js. Colours are tokens only. ASCII only.
 */
import { SvgScene, fill, stroke, shade } from 'simulations/base/kit/SimSvg.js';
import { civicSvg } from 'simulations/base/kit/SimCivic.js';
import { RS } from '../shared/MangoKit.js';
import { PEOPLE_CSS, personSlot, paintPeople } from '../shared/MangoPeople.js';
import { BTN_CSS, txt, arrow, pill, btn } from '../shared/MarketParts.js';
import { govBuilding, castFamilies } from '../shared/GovParts.js';

castFamilies();

const f1 = (v) => (+v).toFixed(1);
const MAP = [[{ idx: 0, dwellMs: null }], [{ idx: 1, dwellMs: null }], [{ idx: 2, dwellMs: null }]];
const ACC = 'var(--sim-accent)';
const ACC_INK = 'var(--sim-ink-on-accent, var(--sim-bg-deep))';
const GOOD = { bg: 'var(--sim-good)', ink: 'var(--sim-bg-deep)', edge: 'var(--sim-good)' };
const BAD = { bg: 'var(--sim-bad)', ink: 'var(--sim-bg-deep)', edge: 'var(--sim-bad)' };
const ROAD = 'color-mix(in oklab, var(--sim-label) 58%, var(--sim-bg-surface))';
const STONE = 'color-mix(in oklab, var(--sim-waste) 45%, var(--sim-bg-surface))';
const GRASS = 'color-mix(in oklab, var(--sim-series-3) 40%, var(--sim-bg-surface))';
const SOIL = 'color-mix(in oklab, var(--sim-series-8) 35%, var(--sim-bg-surface))';
const WALL = 'color-mix(in oklab, var(--sim-gold) 22%, var(--sim-bg-surface))';
const ROOF = 'color-mix(in oklab, var(--sim-series-8) 70%, var(--sim-label))';
const THINGS = ['road', 'bridge', 'park', 'streetlights', 'drain'];
const PAYS = [1, 5, 8];
const RS5 = `${RS}5,000`;

/** A house, (x, gy) ground centre, w wide (0.85 w tall). */
function house(x, gy, w, o = {}) {
  const h = w * 0.85, wt = gy - h * 0.56, x0 = x - w * 0.4, ww = w * 0.8;
  let s = `<rect x="${f1(x0)}" y="${f1(wt)}" width="${f1(ww)}" height="${f1(gy - wt)}" ${fill(WALL, `stroke:${shade(WALL, 55)};stroke-width:2.5`)}/>`;
  s += `<path d="M${f1(x - w / 2)} ${f1(wt + 2)}L${f1(x)} ${f1(gy - h)}L${f1(x + w / 2)} ${f1(wt + 2)}Z" ${fill(ROOF, `stroke:${shade(ROOF, 70)};stroke-width:2.5;stroke-linejoin:round`)}/>`;
  s += `<rect x="${f1(x - w * 0.1)}" y="${f1(gy - h * 0.34)}" width="${f1(w * 0.2)}" height="${f1(h * 0.34)}" rx="3" ${fill(shade(ROOF, 85))}/>`;
  s += `<rect x="${f1(x + w * 0.16)}" y="${f1(wt + h * 0.1)}" width="${f1(w * 0.16)}" height="${f1(w * 0.14)}" rx="2" ${fill('color-mix(in oklab, var(--sim-water) 50%, var(--sim-bg-surface))', `stroke:${shade(WALL, 55)};stroke-width:2`)}/>`;
  return o.dim ? `<g opacity="0.35">${s}</g>` : s;
}

/** A streetlight: a post up from (x, gy), h tall, the arm reaching dir (1 right, -1 left). */
function lamp(x, gy, h, dir = 1, lit = false) {
  const top = gy - h, ax = x + dir * 30;
  let s = '';
  if (lit) s += `<path d="M${f1(ax - 14)} ${f1(top + 14)}L${f1(ax - 40)} ${f1(gy)}H${f1(ax + 40)}L${f1(ax + 14)} ${f1(top + 14)}Z" ${fill('color-mix(in oklab, var(--sim-gold) 35%, transparent)')}/>`;
  s += `<path d="M${f1(x)} ${f1(gy)}V${f1(top)}Q${f1(x)} ${f1(top - 10)} ${f1(x + dir * 12)} ${f1(top - 10)}H${f1(ax)}" ${stroke('var(--sim-label)', 5)}/>`;
  s += `<rect x="${f1(ax - 15)}" y="${f1(top - 8)}" width="30" height="16" rx="7" ${fill('var(--sim-gold)', 'stroke:var(--sim-label);stroke-width:2.5')}/>`;
  s += `<rect x="${f1(x - 8)}" y="${f1(gy - 8)}" width="16" height="10" rx="2" ${fill('var(--sim-label)')}/>`;
  return s;
}

/** A swing frame with one seat, (x, gy) ground centre, h tall. */
function swing(x, gy, h) {
  const w = h * 0.9, top = gy - h, col = 'var(--sim-series-6)';
  let s = `<path d="M${f1(x - w / 2)} ${f1(gy)}L${f1(x - w * 0.38)} ${f1(top)}H${f1(x + w * 0.38)}L${f1(x + w / 2)} ${f1(gy)}" ${stroke(col, 6)}/>`;
  s += `<path d="M${f1(x - 14)} ${f1(top)}V${f1(gy - h * 0.3)}M${f1(x + 14)} ${f1(top)}V${f1(gy - h * 0.3)}" ${stroke('var(--sim-label-muted)', 2.5)}/>`;
  s += `<rect x="${f1(x - 22)}" y="${f1(gy - h * 0.3)}" width="44" height="9" rx="3" ${fill(shade(ROOF, 90))}/>`;
  return s;
}

/** A thought cloud with words, the tail pointing down-left to (tx, ty); (x, y) the centre. */
function thought(x, y, t, size, tx, ty) {
  const w = String(t).length * size * 0.56 + size * 1.6, h = size * 2;
  let s = `<circle cx="${f1(tx)}" cy="${f1(ty)}" r="4" ${fill('var(--sim-bg-surface)', 'stroke:var(--sim-label);stroke-width:2')}/>`;
  s += `<circle cx="${f1((tx + x) / 2)}" cy="${f1((ty + y + h / 2) / 2)}" r="7" ${fill('var(--sim-bg-surface)', 'stroke:var(--sim-label);stroke-width:2')}/>`;
  s += `<rect x="${f1(x - w / 2)}" y="${f1(y - h / 2)}" width="${f1(w)}" height="${f1(h)}" rx="${f1(h / 2)}" ${fill('var(--sim-bg-surface)', 'stroke:var(--sim-label);stroke-width:2.5')}/>`;
  return s + txt(x, y + size * 0.36, t, size, 'var(--sim-label)');
}

/** A small "thinking" cloud with no words (three dots). */
function puff(x, y) {
  let s = `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="20" ry="13" ${fill('var(--sim-bg-surface)', 'stroke:var(--sim-label-muted);stroke-width:2')}/>`;
  for (const d of [-8, 0, 8]) s += `<circle cx="${f1(x + d)}" cy="${f1(y)}" r="2.6" ${fill('var(--sim-label-muted)')}/>`;
  return s + `<circle cx="${f1(x - 18)}" cy="${f1(y + 16)}" r="4" ${fill('var(--sim-bg-surface)', 'stroke:var(--sim-label-muted);stroke-width:2')}/>`;
}

export class PublicParkScene extends SvgScene {
  static WIDTH = 560;
  static PORTRAIT_WIDTH = 390;
  static HEIGHT = 490;
  static PORTRAIT_HEIGHT = 580;
  static CONTINUOUS = false;
  static BEAT_STEP_MAP = MAP;
  static BEAT_MAPS = { 3: MAP };
  static CONTROLS = [];
  static ARIA_LABEL = 'A street of public goods: a road, a bridge over a canal, streetlights, a park and a drain, used by everyone. Then a made-up example: 10 families and an empty plot for a park, 5,000 rupees per family, 50,000 rupees needed. Three families pay, seven think others will pay, so only 15,000 rupees is collected: not enough. Then the government pays and the plot becomes a park that every family, rich or poor, can use.';

  async setup() {
    this.lit = -1;
    this.pick = 2;
    this.anim = false;
    this.fresh = false;
    await super.setup();
    this._onClick = (e) => {
      const b = e.target?.closest?.('[data-act]');
      if (!b) return;
      const a = b.dataset.act, s = this.stepIndex, v = Number(b.dataset.val);
      if (s === 0 && a === 'thing') { this.lit = this.lit === v ? -1 : v; this.repaint(); }
      else if (s === 1 && a === 'house') { this.pick = v; this.repaint(); }
      else if (a === 'replay') this.burst(s === 1 ? 2.6 : 2.2);
    };
    this.root.addEventListener('click', this._onClick);
  }

  destroy() {
    this.root?.removeEventListener('click', this._onClick);
    super.destroy();
  }

  css() {
    return PEOPLE_CSS + BTN_CSS + `
svg .pk-grow { transform-box: fill-box; transform-origin: left center; animation: pk-grow 1.4s cubic-bezier(.45,0,.3,1) both; animation-delay: var(--d, 0s); }
@keyframes pk-grow { from { transform: scaleX(0); } to { transform: none; } }
@media (prefers-reduced-motion: reduce) { svg .pk-grow { animation: none; } }`;
  }

  repaint() { super.repaint(); paintPeople(this); }

  clear() { for (const t of (this._timers ?? []).splice(0)) clearTimeout(t); this.anim = false; this.fresh = false; }

  enter(step) {
    this.clear();
    this.lit = -1;
    this.pick = 2;
    this.burst(step === 0 ? 1.2 : step === 1 ? 2.6 : 2.2);
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

  stageHeight(st) { return Math.round((st.portrait ? 580 : 490) * st.W / (st.portrait ? 390 : 560)); }

  pop(d) { return this.fresh ? ` class="mq-pop" style="--d:${d}s"` : ''; }
  fade(d) { return this.fresh ? ` class="mq-fade" style="--d:${d}s"` : ''; }

  paint(st) {
    const P = st.portrait, DW = P ? 390 : 560, DH = P ? 580 : 490, k = (st.W / DW).toFixed(4), s = this.stepIndex;
    const out = s === 0 ? this.paintStreet(P) : s === 1 ? this.paintPlot(P) : this.paintPark(P);
    return { svg: `<g transform="scale(${k})">${out.svg}</g>`, over: `<div style="position:absolute;left:0;top:0;width:${DW}px;height:${DH}px;transform:scale(${k});transform-origin:0 0">${out.over}</div>` };
  }

  hit(act, val, x, y, w, h, aria, pressed) {
    return `<button type="button" class="sv-hit tap btn mq-hit" data-act="${act}" data-val="${val}" aria-pressed="${pressed}" aria-label="${aria}" style="left:${f1(x)}px;top:${f1(y)}px;width:${f1(w)}px;height:${f1(h)}px"></button>`;
  }

  // b0: a street of public goods; tap a thing to light it
  paintStreet(P) {
    const DW = P ? 390 : 560;
    const G = P
      ? { gy: 250, rh: 50, br: [212, 390], cd: 70, dr: [0, 200], tree: [92, 140], sw: [318, 84], ppl: [[190, 112], [232, 82]], lamps: [[34, 1], [196, 1], [362, -1]], lh: 108,
        lab: [[96, 276], [300, 396], [92, 54], [300, 118], [100, 338]], chip: [195, 452], hint: [195, 500] }
      : { gy: 330, rh: 56, br: [330, 560], cd: 84, dr: [0, 320], tree: [100, 210], sw: [262, 112], ppl: [[196, 150], [230, 104]], lamps: [[30, 1], [314, 1], [530, -1]], lh: 156,
        lab: [[160, 359], [445, 286], [100, 112], [430, 150], [160, 434]], chip: [190, 462], hint: [470, 30] };
    const on = (i) => this.lit < 0 || this.lit === i;
    const op = (i) => `opacity:${on(i) ? 1 : 0.28}`;
    const ry = G.gy, rb = G.gy + G.rh;
    let svg = '', over = '';
    // park (grass, a tree, a swing; people in the over layer)
    svg += `<g style="${op(2)}">`;
    svg += `<rect x="0" y="${f1(G.gy - 14)}" width="${f1(G.br[0] - 10)}" height="16" rx="4" ${fill(GRASS)}/>`;
    svg += civicSvg('tree', G.tree[0], G.gy - 4, { w: G.tree[1] });
    svg += swing(G.sw[0], G.gy - 4, G.sw[1]);
    svg += '</g>';
    // canal under the bridge, the bridge, then the road on top
    const [b0, b1] = G.br, cb = rb + G.cd;
    svg += `<g style="${op(1)}">`;
    svg += `<rect x="${f1(b0)}" y="${f1(rb)}" width="${f1(b1 - b0)}" height="${f1(G.cd)}" ${fill('color-mix(in oklab, var(--sim-water) 55%, var(--sim-bg-surface))')}/>`;
    svg += `<path d="M${f1(b0)} ${f1(cb - 16)}h${f1(b1 - b0)}" ${stroke('var(--sim-bg-surface)', 3, 'opacity:0.7;stroke-dasharray:18 14')}/>`;
    const spans = 2, sw = (b1 - b0) / spans;
    for (let i = 0; i < spans; i++) {
      const xa = b0 + i * sw, xb = xa + sw, rx = sw / 2 - 12;
      svg += `<path d="M${f1(xa)} ${f1(rb)}H${f1(xb)}V${f1(cb - 6)}H${f1(xb - 10)}A${f1(rx)} ${f1(G.cd * 0.7)} 0 0 0 ${f1(xa + 10)} ${f1(cb - 6)}H${f1(xa)}Z" ${fill(STONE, `stroke:${shade(STONE, 60)};stroke-width:2.5`)}/>`;
    }
    svg += `<path d="M${f1(b0)} ${f1(ry - 2)}H${f1(b1)}" ${stroke(shade(STONE, 60), 8)}/>`;
    for (let x = b0 + 14; x < b1; x += 26) svg += `<path d="M${f1(x)} ${f1(ry - 2)}V${f1(ry - 20)}" ${stroke(shade(STONE, 60), 4)}/>`;
    svg += `<path d="M${f1(b0)} ${f1(ry - 20)}H${f1(b1)}" ${stroke(shade(STONE, 60), 4)}/>`;
    svg += '</g>';
    // the road across the whole street
    svg += `<g style="${op(0)}"><rect x="0" y="${f1(ry)}" width="${DW}" height="${f1(G.rh)}" ${fill(ROAD)}/>`;
    svg += `<path d="M10 ${f1(ry + G.rh / 2)}H${DW}" ${stroke('var(--sim-bg-surface)', 4, 'stroke-dasharray:26 20')}/></g>`;
    // drain along the road edge, left of the canal
    const [d0, d1] = G.dr;
    svg += `<g style="${op(4)}"><rect x="${f1(d0)}" y="${f1(rb)}" width="${f1(d1 - d0)}" height="22" ${fill('color-mix(in oklab, var(--sim-label) 35%, var(--sim-bg-surface))', `stroke:${shade(ROAD, 60)};stroke-width:2`)}/>`;
    for (let x = d0 + 8; x < d1 - 4; x += 14) svg += `<path d="M${f1(x)} ${f1(rb + 4)}V${f1(rb + 18)}" ${stroke('var(--sim-label)', 3)}/>`;
    svg += `<rect x="${f1(d0)}" y="${f1(rb + 22)}" width="${f1(d1 - d0)}" height="8" ${fill(SOIL)}/></g>`;
    // streetlights
    svg += `<g style="${op(3)}">`;
    for (const [x, dir] of G.lamps) svg += lamp(x, G.gy, G.lh, dir, this.lit === 3);
    svg += '</g>';
    // names: four at rest, the lit one in accent; the drain only when lit
    const fs = P ? 19 : 20;
    THINGS.forEach((t, i) => {
      if (i === 4 && this.lit !== 4) return;
      if (this.lit >= 0 && this.lit !== i) return;
      const lit = this.lit === i;
      svg += `<g${this.pop(0.2 + i * 0.12)}>${pill(G.lab[i][0], G.lab[i][1], t, lit ? { size: fs + 2, bg: ACC, ink: ACC_INK, edge: ACC } : { size: fs })}</g>`;
    });
    svg += `<g${this.pop(0.8)}>${pill(G.chip[0], G.chip[1], 'for everyone', { size: P ? 24 : 26, bg: ACC, ink: ACC_INK, edge: ACC })}</g>`;
    if (!this.anim) svg += txt(G.hint[0], G.hint[1], this.lit < 0 ? 'tap a thing' : 'tap again for all', 18, 'var(--sim-label-muted)');
    // people in the park
    const who = ['srivalli', 'poorK'];
    G.ppl.forEach(([x, h], i) => { over += personSlot(who[i], { x, y: G.gy - 4, h, pose: 'stand', facing: 0, mood: 'happy', dim: !on(2) }); });
    // tap targets
    const boxes = P
      ? [[0, ry, 212, G.rh], [212, rb, 178, G.cd], [0, 30, 160, G.gy - 44], [180, G.gy - G.lh - 16, 60, G.lh + 4], [0, rb, 200, 30]]
      : [[0, ry, 330, G.rh], [330, rb, 230, G.cd], [56, 40, 230, G.gy - 54], [490, G.gy - G.lh - 16, 70, G.lh + 4], [0, rb, 320, 30]].map((b, i) => (i === 2 ? [40, 100, 260, G.gy - 110] : b));
    boxes.forEach(([x, y, w, h], i) => { over += this.hit('thing', i, x, y, w, h, THINGS[i], this.lit === i); });
    return { svg, over };
  }

  // b1: 10 houses round an empty plot; 3 pay, 7 think others will pay; not enough is collected
  paintPlot(P) {
    const G = P
      ? { note: [195, 24, 17], hw: 64, xs: [39, 117, 195, 273, 351], rows: [150, 368], plot: [16, 166, 358, 132], meter: [16, 372, 430], lab: [16, 400],
        under: 462, nope: [195, 504], rp: [195, 548] }
      : { note: [262, 22, 18], hw: 80, xs: [64, 172, 280, 388, 496], rows: [176, 392], plot: [36, 192, 488, 118], meter: [130, 420, 436], lab: [20, 436],
        under: 470, nope: [492, 436], rp: [510, 472] };
    let svg = '', over = '';
    svg += pill(G.note[0], G.note[1], 'made-up example: 10 families', { size: G.note[2], bg: 'var(--sim-bg-surface)', ink: 'var(--sim-label-muted)', edge: 'var(--sim-label-muted)' });
    // the empty plot and its board
    const [px, py, pw, ph] = G.plot, bx = px + pw / 2, by = py + ph / 2;
    svg += `<rect x="${f1(px)}" y="${f1(py)}" width="${f1(pw)}" height="${f1(ph)}" rx="10" ${fill(SOIL, 'stroke:var(--sim-label-muted);stroke-width:3;stroke-dasharray:12 9')}/>`;
    svg += `<path d="M${f1(bx - 50)} ${f1(by + 10)}V${f1(by + 52)}M${f1(bx + 50)} ${f1(by + 10)}V${f1(by + 52)}" ${stroke(shade(ROOF, 80), 6)}/>`;
    svg += `<rect x="${f1(bx - 110)}" y="${f1(by - 46)}" width="220" height="74" rx="10" ${fill('var(--sim-bg-surface)', 'stroke:var(--sim-label);stroke-width:3')}/>`;
    svg += txt(bx, by - 18, 'park', 24, 'var(--sim-label)') + txt(bx, by + 14, `${RS5} per family`, 21, 'var(--sim-label)');
    // the houses
    for (let i = 0; i < 10; i++) {
      const r = i < 5 ? 0 : 1, x = G.xs[i % 5], gy = G.rows[r], top = gy - G.hw * 0.85, pays = PAYS.includes(i);
      svg += house(x, gy, G.hw);
      if (pays) svg += `<g${this.pop(0.3 + PAYS.indexOf(i) * 0.4)}>${pill(x, top - 8, RS5, { size: P ? 15 : 17, ...GOOD, padX: 12 })}</g>`;
      else if (i !== this.pick) svg += `<g${this.fade(1.6)}>${puff(x + G.hw * 0.32, top - 4)}</g>`;
    }
    // the picked house's thought
    {
      const i = this.pick, r = i < 5 ? 0 : 1, x = G.xs[i % 5], top = G.rows[r] - G.hw * 0.85;
      const t = PAYS.includes(i) ? 'I paid' : 'others will pay', fs = P ? 18 : 20;
      const tw = t.length * fs * 0.56 + fs * 1.6, cx = Math.max(tw / 2 + 6, Math.min((P ? 390 : 560) - tw / 2 - 6, x + 24));
      svg += `<g${this.pop(1.7)}>${thought(cx, top - 30, t, fs, x + 6, top - 2)}</g>`;
    }
    // the meter: collected against needed
    const [m0, m1, my] = G.meter, fx = m0 + (m1 - m0) * 0.3;
    svg += txt(G.lab[0], G.lab[1] + (P ? 0 : 8), 'collected', P ? 19 : 20, 'var(--sim-label)', 'start');
    svg += `<rect x="${f1(m0)}" y="${f1(my - 14)}" width="${f1(m1 - m0)}" height="28" rx="14" ${fill('var(--sim-bg-surface)', 'stroke:var(--sim-label);stroke-width:2.5')}/>`;
    svg += `<rect x="${f1(m0 + 3)}" y="${f1(my - 11)}" width="${f1(fx - m0 - 3)}" height="22" rx="11"${this.fresh ? ' class="pk-grow" style="--d:0.3s"' : ''} ${fill('var(--sim-good)')}/>`;
    svg += `<path d="M${f1(m1)} ${f1(my - 22)}V${f1(my + 22)}" ${stroke('var(--sim-label)', 4)}/>`;
    svg += `<g${this.fade(1.7)}>${txt(fx, G.under, `${RS}15,000`, 18, 'var(--sim-good)')}</g>`;
    svg += txt(m1, G.under, `needed ${RS}50,000`, 18, 'var(--sim-label)', 'end');
    svg += `<g${this.pop(2.0)}>${pill(G.nope[0], G.nope[1], 'not enough', { size: P ? 22 : 19, ...BAD })}</g>`;
    for (let i = 0; i < 10; i++) {
      const r = i < 5 ? 0 : 1, x = G.xs[i % 5], gy = G.rows[r], h = G.hw * 0.85;
      over += this.hit('house', i, x - G.hw / 2, gy - h, G.hw, h, `family ${i + 1}: ${PAYS.includes(i) ? 'paid' : 'others will pay'}`, this.pick === i);
    }
    if (!this.anim) over += btn('replay', 'replay', G.rp[0], G.rp[1], { size: 17 });
    return { svg, over };
  }

  // b2: the government pays; the plot is a park for every family
  paintPark(P) {
    const G = P
      ? { b: [195, 176, 190], ar: [195, 196, 195, 262], amt: [262, 230], gy: 470, grass: 284, trees: [[70, 130], [322, 120]], sw: [200, 96],
        ppl: [['medA', 56, 132], ['medK', 108, 96], ['poorA', 270, 136], ['poorK', 330, 96]], chip: [195, 532] }
      : { b: [118, 290, 196], ar: [222, 210, 300, 210], amt: [262, 176], gy: 400, grass: 250, trees: [[350, 150], [505, 130]], sw: [428, 100],
        ppl: [['medA', 300, 140], ['medK', 344, 102], ['poorA', 452, 144], ['poorK', 510, 102]], chip: [280, 452] };
    let svg = '', over = '';
    const B = govBuilding(G.b[0], G.b[1], G.b[2], { size: P ? 18 : 19 });
    svg += `<g${this.pop(0.1)}>${B.svg}</g>`;
    svg += `<path d="M0 ${f1(G.b[1] + 2)}H${P ? 390 : 236}" ${stroke('var(--sim-stroke)', 3)}/>`;
    svg += `<g${this.fade(0.4)}>${arrow(G.ar[0], G.ar[1], G.ar[2], G.ar[3], 'var(--sim-good)', 6)}${pill(G.amt[0], G.amt[1], `${RS}50,000`, { size: P ? 19 : 20, ...GOOD })}</g>`;
    // the park: grass, a path, trees, a swing
    const x0 = P ? 0 : 248, x1 = P ? 390 : 560, gy = G.gy;
    svg += `<g${this.fade(0.7)}>`;
    svg += `<rect x="${f1(x0)}" y="${f1(G.grass)}" width="${f1(x1 - x0)}" height="${f1(gy - G.grass + 14)}" rx="14" ${fill(GRASS)}/>`;
    svg += '</g>';
    G.trees.forEach(([x, w], i) => { svg += `<g${this.pop(0.9 + i * 0.15)}>${civicSvg('tree', x, gy - 50, { w })}</g>`; });
    svg += `<g${this.pop(1.2)}>${swing(G.sw[0], gy - 40, G.sw[1])}</g>`;
    G.ppl.forEach(([w, x, h], i) => {
      over += personSlot(w, { x, y: gy, h, pose: 'stand', facing: 0, mood: 'happy', cls: this.fresh ? 'mq-fade' : '', style: this.fresh ? `--d:${1.3 + i * 0.12}s` : '' });
    });
    svg += `<g${this.pop(1.8)}>${pill(G.chip[0], G.chip[1], 'paid for by the government', { size: P ? 21 : 23, bg: ACC, ink: ACC_INK, edge: ACC })}</g>`;
    if (!this.anim) over += btn('replay', 'replay', P ? 340 : 510, P ? 40 : 40, { size: 17 });
    return { svg, over };
  }

  testState() {
    return { step: this.stepIndex, lit: this.lit >= 0 ? THINGS[this.lit] : null, pick: this.pick, anim: this.anim,
      families: 10, paid: PAYS.length, perFamily: 5000, collected: PAYS.length * 5000, needed: 50000 };
  }
}
