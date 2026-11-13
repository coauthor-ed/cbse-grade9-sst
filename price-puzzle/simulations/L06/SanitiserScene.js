/**
 * SanitiserScene - L06 s10 "Sanitisers in 2020" (3 beats). SvgScene, design units 560 x 490 landscape,
 * 390 x 640 portrait. A real case: the only number is the book's cap, Rs 100 for a 200 ml bottle.
 *   b0  a chemist shop: the front shelves empty out and the price tag climbs (arrows, no number); a back room
 *       fills with a hidden stack of cartons ("hoarding"); at a side door the shopkeeper sells a bottle
 *       secretly with a higher tag ("black marketing"). Plays on entry, "replay".
 *   b1  the tag fixed at "Rs 100 / 200 ml" under a lid ("highest price"); a van from the makers drives in,
 *       the shelves fill, a buyer takes a bottle. Step chips "1 price capped", "2 makers make more". Plays on
 *       entry, "replay".
 *   b2  an open question, nothing keyed or judged: a balance with a "sellers" pan (a shop) and a "buyers" pan
 *       (a family), a "?" on the pivot; buttons "emergency" / "for ever?" with a calendar. A tap only lights
 *       that side or that chip (tap again: none). Rest: nothing lit.
 * People are SimFigure people via ../shared/MangoPeople.js. Colours are tokens only. ASCII only.
 */
import { SvgScene, fill, stroke, shade } from 'simulations/base/kit/SimSvg.js';
import { civicSvg } from 'simulations/base/kit/SimCivic.js';
import { RS } from '../shared/MangoKit.js';
import { PEOPLE_CSS, personSlot, paintPeople, frontSvg } from '../shared/MangoPeople.js';
import { BTN_CSS, txt, pill, btn } from '../shared/MarketParts.js';
import { bigArrow } from '../shared/SupplyParts.js';
import { capTag, icon, castFamilies, CAP } from '../shared/GovParts.js';

castFamilies();

const f1 = (v) => (+v).toFixed(1);
const MAP = [[{ idx: 0, dwellMs: null }], [{ idx: 1, dwellMs: null }], [{ idx: 2, dwellMs: null }]];
const ACC = 'var(--sim-accent)';
const ACC_INK = 'var(--sim-ink-on-accent, var(--sim-bg-deep))';
const BAD = { bg: 'var(--sim-bad)', ink: 'var(--sim-bg-deep)', edge: 'var(--sim-bad)' };
const WALL = 'color-mix(in oklab, var(--sim-series-1) 10%, var(--sim-bg-surface))';
const BACK = 'color-mix(in oklab, var(--sim-label) 22%, var(--sim-bg-surface))';
const WOOD = 'color-mix(in oklab, var(--sim-series-8) 50%, var(--sim-bg-surface))';
const CARTON = 'color-mix(in oklab, var(--sim-series-8) 62%, var(--sim-bg-surface))';
const GEL = 'color-mix(in oklab, var(--sim-water) 34%, var(--sim-bg-surface))';

/** A sanitiser bottle with a pump, (x, y) bottom centre, h tall. */
function bottle(x, y, h) {
  const w = h * 0.5, bh = h * 0.66, top = y - bh, rim = shade('var(--sim-water)', 55);
  let s = `<rect x="${f1(x - w / 2)}" y="${f1(top)}" width="${f1(w)}" height="${f1(bh)}" rx="${f1(w * 0.2)}" ${fill(GEL, `stroke:${rim};stroke-width:2`)}/>`;
  s += `<rect x="${f1(x - w / 2)}" y="${f1(top + bh * 0.34)}" width="${f1(w)}" height="${f1(bh * 0.34)}" ${fill('var(--sim-bg-surface)', `stroke:${rim};stroke-width:1.5`)}/>`;
  s += `<path d="M${f1(x - w * 0.18)} ${f1(top + bh * 0.51)}H${f1(x + w * 0.18)}M${f1(x)} ${f1(top + bh * 0.42)}V${f1(top + bh * 0.6)}" ${stroke('var(--sim-series-1)', Math.max(2, h * 0.06))}/>`;
  s += `<rect x="${f1(x - w * 0.16)}" y="${f1(top - h * 0.14)}" width="${f1(w * 0.32)}" height="${f1(h * 0.15)}" ${fill('var(--sim-series-1)', `stroke:${shade('var(--sim-series-1)', 60)};stroke-width:1.5`)}/>`;
  s += `<path d="M${f1(x - w * 0.1)} ${f1(top - h * 0.2)}H${f1(x + w * 0.5)}" ${stroke(shade('var(--sim-series-1)', 70), Math.max(2.5, h * 0.07))}/>`;
  return s;
}

/** A shelf plank with n bottles on it (n may be 0), from x0 to x1 at y. */
function shelf(x0, x1, y, n, h, cls = '') {
  let s = '';
  if (n > 0) {
    const gap = (x1 - x0) / 5;
    let b = '';
    for (let i = 0; i < n; i++) b += bottle(x0 + gap * (i + 0.5), y - 2, h);
    s += cls ? `<g class="${cls}">${b}</g>` : b;
  }
  return s + `<path d="M${f1(x0 - 4)} ${f1(y + 1)}H${f1(x1 + 4)}" ${stroke(shade(WOOD, 60), 6)}/>`;
}

/** A hidden stack of cartons, (x, y) bottom centre, rows x cols of side c. */
function cartons(x, y, rows, cols, c) {
  let s = '';
  for (let r = 0; r < rows; r++) for (let i = 0; i < cols - (r === rows - 1 ? 1 : 0); i++) {
    const off = r === rows - 1 ? c / 2 : 0, bx = x - (cols * c) / 2 + i * c + off, by = y - (r + 1) * c * 0.8;
    s += `<rect x="${f1(bx + 2)}" y="${f1(by)}" width="${f1(c - 4)}" height="${f1(c * 0.8 - 3)}" rx="3" ${fill(CARTON, `stroke:${shade(CARTON, 60)};stroke-width:2`)}/>`;
    s += `<path d="M${f1(bx + c / 2)} ${f1(by)}V${f1(by + c * 0.3)}" ${stroke(shade(CARTON, 60), 2)}/>`;
  }
  return s;
}

export class SanitiserScene extends SvgScene {
  static WIDTH = 560;
  static PORTRAIT_WIDTH = 390;
  static HEIGHT = 490;
  static PORTRAIT_HEIGHT = 640;
  static CONTINUOUS = false;
  static BEAT_STEP_MAP = MAP;
  static BEAT_MAPS = { 3: MAP };
  static CONTROLS = [];
  static ARIA_LABEL = 'Sanitisers in 2020. In a chemist shop the shelves empty out and the price tag climbs. In a back room the shopkeeper keeps a large stock hidden: hoarding. At a side door he sells a bottle secretly at a higher price: black marketing. Then the government fixes a highest price of 100 rupees for a 200 ml bottle; a van brings bottles from the makers, the shelves fill again and a buyer takes a bottle. Then an open question: a balance with sellers on one side and buyers on the other, and a question mark. Was the control for an emergency, or should it continue for ever? Discuss with a partner.';

  async setup() {
    this.phase = 'done';
    this.side = '';
    this.anim = false;
    this.fresh = false;
    await super.setup();
    this._onClick = (e) => {
      const b = e.target?.closest?.('[data-act]');
      if (!b) return;
      const a = b.dataset.act, s = this.stepIndex;
      if (s < 2 && a === 'replay') this.play();
      else if (s === 2 && a === 'side') { this.side = this.side === b.dataset.val ? '' : b.dataset.val; this.repaint(); }
    };
    this.root.addEventListener('click', this._onClick);
  }

  destroy() {
    this.root?.removeEventListener('click', this._onClick);
    super.destroy();
  }

  css() { return PEOPLE_CSS + BTN_CSS; }

  repaint() { super.repaint(); paintPeople(this); }

  clear() { for (const t of (this._timers ?? []).splice(0)) clearTimeout(t); this.anim = false; this.fresh = false; this.phase = 'done'; }

  enter(step) {
    this.clear();
    this.side = '';
    if (step < 2) this.play();
    else {
      this.anim = true;
      this.fresh = true;
      this.repaint();
      this.fresh = false;
      this.after(1.0, () => { this.anim = false; this.repaint(); });
    }
  }

  // b0 / b1: the "before" picture, then the change
  play() {
    this.clear();
    this.anim = true;
    this.phase = 'pre';
    this.fresh = true;
    this.repaint();
    this.fresh = false;
    this.after(0.9, () => { this.phase = 'done'; this.fresh = true; this.repaint(); this.fresh = false; });
    this.after(2.8, () => { this.anim = false; this.repaint(); });
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
    const out = s === 0 ? this.paintHoard(P) : s === 1 ? this.paintCap(P) : this.paintQuestion(P);
    return { svg: `<g transform="scale(${k})">${out.svg}</g>`, over: `<div style="position:absolute;left:0;top:0;width:${DW}px;height:${DH}px;transform:scale(${k});transform-origin:0 0">${out.over}</div>` };
  }

  // the shop box: walls, a sign; returns svg
  shopBox(x0, y0, x1, y1, sign, fs) {
    let s = `<rect x="${f1(x0)}" y="${f1(y0)}" width="${f1(x1 - x0)}" height="${f1(y1 - y0)}" rx="10" ${fill(WALL, 'stroke:var(--sim-stroke);stroke-width:3')}/>`;
    const sw = sign.length * fs * 0.6 + fs * 1.6, cx = (x0 + x1) / 2;
    s += `<rect x="${f1(cx - sw / 2)}" y="${f1(y0 - fs * 0.9)}" width="${f1(sw)}" height="${f1(fs * 1.7)}" rx="9" ${fill('var(--sim-bg-surface)', 'stroke:var(--sim-stroke);stroke-width:2.5')}/>`;
    return s + txt(cx, y0 + fs * 0.32, sign, fs, 'var(--sim-label)');
  }

  paintHoard(P) {
    const done = this.phase === 'done', D = this.fresh && done;
    const G = P
      ? { shop: [14, 66, 376, 352], front: [30, 190], rows: [196, 290], bh: 48, back: [204, 360], tag: [104, 120], hp: [282, 110], gy: 590, door: [350, 300],
        sk: [250, 168], buy: [340, 160], bot: [298, 504], bm: [150, 378], rp: [86, 612] }
      : { shop: [16, 76, 392, 398], front: [32, 226], rows: [214, 312], bh: 56, back: [246, 378], tag: [128, 168], hp: [312, 124], gy: 398, door: [392, 260],
        sk: [430, 176], buy: [516, 168], bot: [474, 286], bm: [466, 112], rp: [470, 452] };
    let svg = '', over = '', front = '';
    const [x0, y0, x1, y1] = G.shop;
    svg += this.shopBox(x0, y0, x1, y1, 'chemist', P ? 22 : 24);
    svg += `<path d="M0 ${f1(G.gy + 2)}H${P ? 390 : 560}" ${stroke('var(--sim-stroke)', 3)}/>`;
    // the front shelves: full, then empty
    const [fx0, fx1] = G.front, out = D ? 'mq-fade' : '';
    for (const ry of G.rows) svg += shelf(fx0, fx1, ry, done ? 0 : 5, G.bh);
    if (done) svg += `<g${this.pop(0.3)}>${pill((fx0 + fx1) / 2, (G.rows[0] + G.rows[1]) / 2 - 4, 'shelves empty', { size: P ? 17 : 19 })}</g>`;
    svg += `<rect x="${f1(fx0 - 8)}" y="${f1(y1 - (P ? 46 : 60))}" width="${f1(fx1 - fx0 + 16)}" height="${P ? 46 : 60}" rx="5" ${fill(WOOD, `stroke:${shade(WOOD, 60)};stroke-width:3`)}/>`;
    // the price tag climbs: no number
    const [tx, ty] = G.tag, climb = D ? ' class="mq-fly" style="--dx:0px;--dy:34px;--dur:0.7s"' : '';
    const tyy = done ? ty - (P ? 14 : 18) : ty + (P ? 20 : 16);
    let tag = pill(tx - 20, tyy, 'price', { size: P ? 20 : 22, ...(done ? BAD : {}) });
    if (done) tag += bigArrow(tx + 34, tyy - 22, tyy + 22, -1, 'var(--sim-bad)', 16) + bigArrow(tx + 70, tyy - 22, tyy + 22, -1, 'var(--sim-bad)', 16);
    svg += `<g${climb}>${tag}</g>`;
    // the back room: a hidden stack
    const [bx0, bx1] = G.back, bTop = y0 + (P ? 26 : 30);
    svg += `<rect x="${f1(bx0)}" y="${f1(bTop)}" width="${f1(bx1 - bx0)}" height="${f1(y1 - bTop - 4)}" rx="6" ${fill(BACK, 'stroke:var(--sim-stroke);stroke-width:2.5')}/>`;
    svg += `<path d="M${f1(bx0)} ${f1(bTop)}q12 40 0 80q12 40 0 80" ${stroke('var(--sim-label-muted)', 3, 'fill:none')}/>`;
    if (done) {
      svg += `<g${this.pop(0.5)}>${cartons((bx0 + bx1) / 2 + 6, y1 - 6, 4, 3, P ? 44 : 40)}</g>`;
      svg += `<g${this.pop(0.8)}>${pill(G.hp[0], G.hp[1], 'hoarding', { size: P ? 20 : 22, ...BAD })}</g>`;
    }
    // the side door and the secret sale
    const [dx, dy] = G.door;
    svg += P ? `<rect x="${f1(dx - 28)}" y="${f1(y1 - 6)}" width="56" height="10" ${fill('var(--sim-bg-deep)')}/>`
      : `<rect x="${f1(dx - 7)}" y="${f1(dy)}" width="14" height="${f1(y1 - dy)}" ${fill('var(--sim-bg-deep)')}/>`;
    over += personSlot('chemist', { x: G.sk[0], y: G.gy, h: G.sk[1], pose: 'stand', facing: 1, mood: 'smile', hands: done ? [{ x: G.bot[0] - 4, y: G.bot[1] - 30 }, null] : null });
    over += personSlot('buyer4', { x: G.buy[0], y: G.gy, h: G.buy[1], pose: 'stand', facing: -1, mood: done ? 'oops' : 'think' });
    if (done) {
      front += `<g${this.pop(1.0)}>${bottle(G.bot[0], G.bot[1], P ? 50 : 54)}${pill(P ? 322 : G.bot[0], P ? 378 : G.bot[1] - 84, 'price \u2191\u2191', { size: P ? 17 : 18, ...BAD })}</g>`;
      front += `<g${this.pop(1.2)}>${pill(G.bm[0], G.bm[1], 'black marketing', { size: P ? 20 : 19, ...BAD })}</g>`;
    }
    over += frontSvg(P ? 390 : 560, P ? 640 : 490, front);
    if (!this.anim) over += btn('replay', 'replay', G.rp[0], G.rp[1], { size: 18 });
    return { svg, over };
  }

  paintCap(P) {
    const done = this.phase === 'done', D = this.fresh && done;
    const G = P
      ? { chips: [[195, 30], [195, 74]], shop: [24, 150, 366, 410], front: [44, 346], rows: [270, 360], bh: 50, tag: [195, 196], gy: 610, truck: [120, 190],
        buy: [320, 160], rp: [80, 452] }
      : { chips: [[146, 34], [404, 34]], shop: [210, 116, 546, 400], front: [232, 524], rows: [258, 344], bh: 56, tag: [378, 166], gy: 400, truck: [104, 200],
        buy: [292, 150], rp: [500, 452] };
    let svg = '', over = '', front = '';
    const [x0, y0, x1, y1] = G.shop;
    svg += `<path d="M0 ${f1(G.gy + 2)}H${P ? 390 : 560}" ${stroke('var(--sim-stroke)', 3)}/>`;
    if (P) svg += `<path d="M0 ${f1(y1 + 2)}H390" ${stroke('var(--sim-stroke)', 3)}/>`;
    svg += this.shopBox(x0, y0, x1, y1, 'chemist', P ? 20 : 22);
    const [fx0, fx1] = G.front;
    for (const ry of G.rows) svg += shelf(fx0, fx1, ry, done ? 5 : 0, G.bh, D ? 'mq-fade' : '');
    // the capped tag: the book's number
    svg += `<g${this.pop(0.1)}>${capTag(G.tag[0], G.tag[1], `${RS}100 / 200 ml`, { size: P ? 21 : 22, bg: 'var(--sim-bg-surface)', ink: 'var(--sim-label)', edge: CAP })}</g>`;
    // step chips
    svg += `<g${this.pop(0.2)}>${pill(G.chips[0][0], G.chips[0][1], '1  price capped', { size: P ? 19 : 20, bg: ACC, ink: ACC_INK, edge: ACC })}</g>`;
    if (done) svg += `<g${this.pop(0.4)}>${pill(G.chips[1][0], G.chips[1][1], '2  makers make more', { size: P ? 19 : 20, bg: ACC, ink: ACC_INK, edge: ACC })}</g>`;
    // the van from the makers
    const [vx, vw] = G.truck, drive = this.fresh && !done ? ' class="mq-fly" style="--dx:-260px;--dy:0px;--dur:0.8s"' : '';
    svg += `<g${drive}>${civicSvg('truck', vx, G.gy, { w: vw })}${icon('factory', vx - vw * 0.12, G.gy - vw * 0.36, vw * 0.3, 'var(--sim-series-4)')}</g>`;
    svg += txt(vx, G.gy + 30, 'makers', P ? 19 : 20, 'var(--sim-label)');
    // a buyer takes a bottle once the shelves are full
    const grip = G.gy - G.buy[1] * 0.5;
    over += personSlot('buyer3', { x: G.buy[0], y: G.gy, h: G.buy[1], pose: 'stand', facing: 0, mood: done ? 'happy' : 'think', hands: done ? [{ x: G.buy[0] + 14, y: grip }, null] : null });
    if (done) front += `<g${this.pop(0.7)}>${bottle(G.buy[0] + 14, grip + 22, 46)}</g>`;
    over += frontSvg(P ? 390 : 560, P ? 640 : 490, front);
    if (!this.anim) over += btn('replay', 'replay', G.rp[0], G.rp[1], { size: 18 });
    return { svg, over };
  }

  paintQuestion(P) {
    const side = this.side;
    const G = P
      ? { cx: 195, beamY: 170, half: 140, panY: 290, panW: 120, baseY: 430, btn: [[96, 530], [294, 530]], cal: [195, 530], hint: [195, 600] }
      : { cx: 280, beamY: 130, half: 180, panY: 250, panW: 150, baseY: 380, btn: [[166, 432], [394, 432]], cal: [280, 432], hint: [280, 482] };
    let svg = '', over = '';
    const col = 'var(--sim-label)';
    // the stand and the level beam
    svg += `<path d="M${f1(G.cx)} ${f1(G.beamY)}V${f1(G.baseY)}" ${stroke(col, 8)}/>`;
    svg += `<rect x="${f1(G.cx - 70)}" y="${f1(G.baseY)}" width="140" height="16" rx="6" ${fill(col)}/>`;
    svg += `<rect x="${f1(G.cx - G.half - 10)}" y="${f1(G.beamY - 6)}" width="${f1(G.half * 2 + 20)}" height="12" rx="6" ${fill(col)}/>`;
    svg += `<g${this.pop(0.2)}>${pill(G.cx, G.beamY - 40, '?', { size: P ? 32 : 36, bg: ACC, ink: ACC_INK, edge: ACC, padX: 32 })}</g>`;
    [['sellers', -1], ['buyers', 1]].forEach(([name, d]) => {
      const x = G.cx + d * G.half, on = side === name, dim = side && !on;
      let s = `<g style="opacity:${dim ? 0.35 : 1}">`;
      s += `<path d="M${f1(x)} ${f1(G.beamY)}L${f1(x - G.panW * 0.42)} ${f1(G.panY)}M${f1(x)} ${f1(G.beamY)}L${f1(x + G.panW * 0.42)} ${f1(G.panY)}" ${stroke('var(--sim-label-muted)', 3)}/>`;
      if (on) s += `<ellipse cx="${f1(x)}" cy="${f1(G.panY - 34)}" rx="${f1(G.panW * 0.62)}" ry="${f1(G.panW * 0.5)}" ${fill('color-mix(in oklab, var(--sim-accent) 16%, transparent)', 'stroke:var(--sim-accent);stroke-width:4;stroke-dasharray:9 6')}/>`;
      s += name === 'sellers' ? civicSvg('shop', x, G.panY - 4, { w: G.panW * 0.62 }) : icon('family', x, G.panY - G.panW * 0.3, G.panW * 0.58, 'var(--sim-series-2)');
      s += `<path d="M${f1(x - G.panW / 2)} ${f1(G.panY)}h${f1(G.panW)}a${f1(G.panW / 2)} ${f1(G.panW * 0.22)} 0 0 1 ${f1(-G.panW)} 0Z" ${fill('var(--sim-gold)', `stroke:${shade('var(--sim-gold)', 60)};stroke-width:2.5`)}/>`;
      s += pill(x, G.panY + G.panW * 0.36, name, { size: P ? 21 : 23, bg: on ? ACC : 'var(--sim-bg-surface)', ink: on ? ACC_INK : 'var(--sim-label)', edge: on ? ACC : 'var(--sim-label)' });
      svg += `<g${this.pop(0.4 + (d + 1) * 0.15)}>${s}</g></g>`;
      const hw = G.panW * 1.15, top = G.panY - G.panW * 0.75, bot = G.panY + G.panW * 0.36 + 20;
      over += `<button type="button" class="sv-hit tap btn mq-hit" data-act="side" data-val="${name}" aria-pressed="${on}" aria-label="think about the ${name}" style="left:${f1(x - hw / 2)}px;top:${f1(top)}px;width:${f1(hw)}px;height:${f1(bot - top)}px"></button>`;
    });
    // emergency or for ever: a calendar and two chips
    svg += icon('calendar', G.cal[0], G.cal[1], P ? 52 : 56, 'var(--sim-series-4)');
    over += btn('side', 'emergency', G.btn[0][0], G.btn[0][1], { val: 'emergency', on: side === 'emergency', aria: 'an emergency', size: 20 });
    over += btn('side', 'for ever?', G.btn[1][0], G.btn[1][1], { val: 'ever', on: side === 'ever', aria: 'for ever?', size: 20 });
    if (!this.anim) svg += txt(G.hint[0], G.hint[1], 'discuss with a partner', P ? 18 : 18, 'var(--sim-label-muted)');
    return { svg, over };
  }

  testState() { return { step: this.stepIndex, phase: this.phase, side: this.side, anim: this.anim, cap: { rupees: 100, ml: 200 }, keyed: false }; }
}
