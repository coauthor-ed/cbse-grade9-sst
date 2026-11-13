/**
 * HotelTariffScene - L05 s06 "Hotel Prices Change Every Day" (3 beats). SvgScene, design units 560 x 480
 * landscape, 390 x 660 portrait. Replaces the missing Goa photo: a beach hotel with 100 rooms (10 x 10 room
 * windows, lit = booked), palms, sand and sea, drawn here in SVG; a big tariff tag. Only the book's numbers:
 * Rs 1,500 / 8,000 / 25,000 a night, 40 per cent, Rs 8,000 -> Rs 4,800.
 *   b0  three day buttons: Monday in July (Rs 1,500, few rooms lit), Saturday in December (Rs 8,000, most lit),
 *       New Year's Eve (Rs 25,000, all lit). Cold start: Saturday in December.
 *   b1  "a group tour cancels": three floors of lit windows go dark; the tag drops Rs 8,000 -> Rs 4,800, "40%
 *       less"; next morning the rooms light again. Chip "revenue: all money from sales". Plays on entry, replay.
 *   b2  six factor buttons (rooms booking fast, nearby hotels cheaper, festival in town, rain forecast, last
 *       days, rooms empty, many past bookings); each moves the tag up or down with an arrow (no new numbers).
 *       Cold start: rooms booking fast.
 * Colours are tokens only. ASCII only.
 */
import { SvgScene, fill, stroke, shade } from 'simulations/base/kit/SimSvg.js';
import { iconSvg } from 'simulations/base/kit/SimIcons.js';
import { RS } from '../shared/MangoKit.js';
import { BTN_CSS, txt, pill, btn } from '../shared/MarketParts.js';
import { bigArrow } from '../shared/SupplyParts.js';

const f1 = (v) => (+v).toFixed(1);
const MAP = [[{ idx: 0, dwellMs: null }], [{ idx: 1, dwellMs: null }], [{ idx: 2, dwellMs: null }]];
const ACC = 'var(--sim-accent)';
const ACC_INK = 'var(--sim-ink-on-accent, var(--sim-bg-deep))';
const UP_COL = 'var(--sim-bad)';
const DN_COL = 'var(--sim-good)';
const DAYS = [
  { lab: 'Monday in July', price: 1500, lit: 18, note: 'few rooms booked' },
  { lab: 'Saturday in December', price: 8000, lit: 85, note: 'most rooms booked' },
  { lab: "New Year's Eve", price: 25000, lit: 100, note: 'all rooms booked' },
];
const FACTORS = [
  { lab: 'rooms booking fast', icon: 'clock', tone: 'var(--sim-series-4)', up: true },
  { lab: 'nearby hotels cheaper', icon: 'building', tone: 'var(--sim-series-6)', up: false },
  { lab: 'festival in town', icon: 'lamp', tone: 'var(--sim-gold)', up: true },
  { lab: 'rain forecast', icon: 'rain', tone: 'var(--sim-water)', up: false },
  { lab: 'last days, rooms empty', icon: 'calendar', tone: 'var(--sim-series-4)', up: false },
  { lab: 'many past bookings', icon: 'book', tone: 'var(--sim-series-1)', up: true },
];
// room order in which windows light: a fixed shuffle of 0..99 (no Math.random: same picture every time)
const ORDER = Array.from({ length: 100 }, (_, i) => (i * 37 + 11) % 100);
const GROUP = new Set(Array.from({ length: 30 }, (_, i) => 20 + i)); // floors 3 to 5 from the top: the tour group
const WALL = 'color-mix(in oklab, var(--sim-series-6) 18%, var(--sim-bg-surface))';
const LIT = 'color-mix(in oklab, var(--sim-gold) 72%, var(--sim-bg-surface))';
const DARK = 'color-mix(in oklab, var(--sim-sky-day) 28%, var(--sim-label))';
const SAND = 'var(--sim-set-sand)';
const SEA = 'var(--sim-sea-shallow)';
const PALM = 'color-mix(in oklab, var(--sim-good) 78%, var(--sim-label))';
const TRUNK = 'color-mix(in oklab, var(--sim-series-8) 60%, var(--sim-label))';

const CSS = `
.ht-f .mq-btn { display: flex; align-items: center; gap: 8px; width: var(--bw, 240px); justify-content: flex-start; padding-left: 10px; white-space: normal; text-align: left; line-height: 1.1; }
.ht-f .sim-icon { width: 30px; height: 30px; flex: none; }
.ht-d .mq-btn { width: var(--bw, 240px); }
`;

const money = (n) => { const s = String(n); return s.length > 3 ? `${s.slice(0, -3)},${s.slice(-3)}` : s; };

function palm(x, gy, h) {
  const k = h / 120, top = gy - h;
  let s = `<path d="M${f1(x)} ${f1(gy)}C${f1(x + 4 * k)} ${f1(gy - 50 * k)} ${f1(x + 14 * k)} ${f1(top + 30 * k)} ${f1(x + 18 * k)} ${f1(top + 6 * k)}" ${stroke(TRUNK, 9 * k)}/>`;
  const cx = x + 18 * k, cy = top + 6 * k;
  for (const [dx, dy] of [[-46, 10], [-30, -18], [4, -26], [34, -16], [48, 12]]) {
    const ex = cx + dx * k, ey = cy + dy * k;
    s += `<path d="M${f1(cx)} ${f1(cy)}Q${f1(cx + dx * 0.5 * k)} ${f1(cy + (dy - 26) * k * 0.6)} ${f1(ex)} ${f1(ey)}Q${f1(cx + dx * 0.55 * k)} ${f1(cy + dy * 0.2 * k)} ${f1(cx)} ${f1(cy)}Z" ${fill(PALM, `stroke:${shade(PALM, 70)};stroke-width:1.5`)}/>`;
  }
  return s;
}

/** The hotel: x0..x0 + w, roof at top, ground at gy; lit(i) says whether room i (row-major) is lit. */
function hotel(x0, top, w, gy, lit, o = {}) {
  const pad = w * 0.045, cw = (w - pad * 2) / 10, rows = gy - top - 64, rh = rows / 10;
  let s = `<rect x="${f1(x0 + 3)}" y="${f1(top + 4)}" width="${f1(w)}" height="${f1(gy - top)}" rx="6" ${fill(shade(WALL, 80))}/>`;
  s += `<rect x="${f1(x0)}" y="${f1(top)}" width="${f1(w)}" height="${f1(gy - top)}" rx="6" ${fill(WALL, `stroke:${shade(WALL, 60)};stroke-width:3`)}/>`;
  s += `<rect x="${f1(x0 - 8)}" y="${f1(top - 4)}" width="${f1(w + 16)}" height="18" rx="5" ${fill(shade(WALL, 70), `stroke:${shade(WALL, 55)};stroke-width:2`)}/>`;
  // the name board on the roof
  const bw = w * 0.42;
  s += `<path d="M${f1(x0 + w / 2 - bw * 0.3)} ${f1(top - 4)}V${f1(top - 16)}M${f1(x0 + w / 2 + bw * 0.3)} ${f1(top - 4)}V${f1(top - 16)}" ${stroke(shade(WALL, 55), 3)}/>`;
  s += `<rect x="${f1(x0 + w / 2 - bw / 2)}" y="${f1(top - 50)}" width="${f1(bw)}" height="36" rx="8" ${fill('var(--sim-bg-surface)', `stroke:${shade(WALL, 55)};stroke-width:2.5`)}/>`;
  s += txt(x0 + w / 2, top - 23, 'HOTEL', 24, 'var(--sim-label)');
  for (let r = 0; r < 10; r++) {
    for (let c = 0; c < 10; c++) {
      const i = r * 10 + c, on = lit(i), x = x0 + pad + c * cw + cw * 0.14, y = top + 20 + r * rh;
      s += `<rect x="${f1(x)}" y="${f1(y)}" width="${f1(cw * 0.72)}" height="${f1(rh * 0.68)}" rx="2.5" ${fill(on ? LIT : DARK, `stroke:${shade(WALL, 55)};stroke-width:1.5`)}/>`;
    }
  }
  // lobby: a door and an awning
  const ly = gy - 40, dw = w * 0.2;
  s += `<path d="M${f1(x0 + 6)} ${f1(ly - 6)}H${f1(x0 + w - 6)}" ${stroke(shade(WALL, 60), 3)}/>`;
  s += `<rect x="${f1(x0 + w / 2 - dw / 2)}" y="${f1(ly)}" width="${f1(dw)}" height="${f1(gy - ly)}" rx="4" ${fill(DARK, `stroke:${shade(WALL, 55)};stroke-width:2`)}/>`;
  s += `<path d="M${f1(x0 + w / 2)} ${f1(ly)}V${f1(gy)}" ${stroke(shade(WALL, 55), 2)}/>`;
  s += `<path d="M${f1(x0 + w / 2 - dw / 2 - 14)} ${f1(ly - 2)}H${f1(x0 + w / 2 + dw / 2 + 14)}L${f1(x0 + w / 2 + dw / 2 + 4)} ${f1(ly - 16)}H${f1(x0 + w / 2 - dw / 2 - 4)}Z" ${fill('var(--sim-series-7)', `stroke:${shade('var(--sim-series-7)', 65)};stroke-width:2`)}/>`;
  if (o.groupRing) {
    const y0 = top + 20 + 2 * rh - 5, y1 = top + 20 + 4 * rh + rh * 0.68 + 5;
    s += `<rect x="${f1(x0 + pad - 4)}" y="${f1(y0)}" width="${f1(w - pad * 2 + 8)}" height="${f1(y1 - y0)}" rx="6" ${stroke(ACC, 3.5, 'stroke-dasharray:8 6')}/>`;
  }
  return s;
}

/** The beach under the hotel: sand, then the sea with two wave lines, from x0 to x1. */
function beach(x0, x1, gy, h) {
  let s = `<rect x="${f1(x0)}" y="${f1(gy)}" width="${f1(x1 - x0)}" height="${f1(h * 0.5)}" ${fill(SAND)}/>`;
  s += `<rect x="${f1(x0)}" y="${f1(gy + h * 0.5)}" width="${f1(x1 - x0)}" height="${f1(h * 0.5)}" rx="4" ${fill(SEA)}/>`;
  for (const t of [0.66, 0.84]) {
    let d = `M${f1(x0 + 8)} ${f1(gy + h * t)}`;
    for (let x = x0 + 8; x < x1 - 24; x += 24) d += `q6 -5 12 0t12 0`;
    s += `<path d="${d}" ${stroke('color-mix(in oklab, var(--sim-sea-shallow) 40%, var(--sim-bg-surface))', 2.2)}/>`;
  }
  return s;
}

/** A luggage-style price tag centred on (x, y): the price big, "a night" under it; old: a struck price above. */
function tag(x, y, w, price, o = {}) {
  const h = w * 0.46, x0 = x - w / 2, y0 = y - h / 2, n = h * 0.32;
  const edge = o.lit ? ACC : 'var(--sim-stroke)';
  const d = `M${f1(x0 + n)} ${f1(y0)}H${f1(x0 + w)}V${f1(y0 + h)}H${f1(x0 + n)}L${f1(x0)} ${f1(y)}Z`;
  let s = `<path d="${d}" transform="translate(0 5)" ${fill(shade(edge, 75))}/>`;
  s += `<path d="${d}" ${fill('var(--sim-bg-surface)', `stroke:${edge};stroke-width:3.5;stroke-linejoin:round`)}/>`;
  s += `<circle cx="${f1(x0 + n * 0.9)}" cy="${f1(y)}" r="${f1(h * 0.08)}" ${fill('var(--sim-bg-deep)', `stroke:${edge};stroke-width:2.5`)}/>`;
  const fs = Math.round(h * 0.42), tx = x + n * 0.45;
  s += txt(tx, y + fs * 0.18, `${RS}${money(price)}`, fs, 'var(--sim-label)');
  s += txt(tx, y + fs * 0.18 + h * 0.36, 'a night', Math.round(h * 0.2), 'var(--sim-label-muted)');
  return s;
}

export class HotelTariffScene extends SvgScene {
  static WIDTH = 560;
  static PORTRAIT_WIDTH = 390;
  static HEIGHT = 480;
  static PORTRAIT_HEIGHT = 660;
  static CONTINUOUS = false;
  static BEAT_STEP_MAP = MAP;
  static BEAT_MAPS = { 3: MAP };
  static CONTROLS = [];
  static ARIA_LABEL = 'A hotel on a beach in Goa with 100 rooms; a lit window is a booked room. On a Monday in July few rooms are booked and a room costs 1,500 rupees a night. On a Saturday in December most rooms are booked and it costs 8,000 rupees. On New Year\'s Eve every room is booked and it costs 25,000 rupees. When a group tour cancels, thirty rooms go dark; the hotel cuts the tariff by 40 per cent, from 8,000 to 4,800 rupees, and by morning the rooms fill again. Revenue is all the money from sales. Rooms booking fast, a festival in town or many past bookings push the tariff up; cheaper hotels nearby, a rain forecast or empty rooms in the last days push it down.';

  async setup() {
    this.day = 1;
    this.fac = 0;
    this.phase = 3;
    this.anim = false;
    this.fresh = false;
    await super.setup();
    this._onClick = (e) => {
      const b = e.target?.closest?.('[data-act]');
      if (!b) return;
      const a = b.dataset.act, v = Number(b.dataset.val);
      if (this.stepIndex === 0 && a === 'day') this.pickDay(v);
      else if (this.stepIndex === 1 && a === 'replay') this.cancel();
      else if (this.stepIndex === 2 && a === 'fac') this.pickFac(v);
    };
    this.root.addEventListener('click', this._onClick);
  }

  destroy() {
    this.root?.removeEventListener('click', this._onClick);
    super.destroy();
  }

  css() { return BTN_CSS + CSS; }

  clear() { for (const t of (this._timers ?? []).splice(0)) clearTimeout(t); this.anim = false; this.fresh = false; }

  enter(step) {
    this.clear();
    this.day = 1;
    this.fac = 0;
    this.phase = 3;
    if (step === 0) this.pickDay(1);
    else if (step === 1) this.cancel();
    else this.pickFac(0);
  }

  burst(sec) {
    this.anim = true;
    this.fresh = true;
    this.repaint();
    this.fresh = false;
    this.after(sec, () => { this.anim = false; this.repaint(); });
  }

  pickDay(i) { this.clear(); this.day = i; this.burst(0.8); }

  pickFac(i) { this.clear(); this.fac = i; this.burst(0.8); }

  // b1: 0 booked, 1 the group cancels (rooms dark), 2 the tariff is cut, 3 next morning (rooms lit again)
  cancel() {
    this.clear();
    this.anim = true;
    this.phase = 0;
    this.fresh = true;
    this.repaint();
    this.fresh = false;
    this.after(0.7, () => { this.phase = 1; this.fresh = true; this.repaint(); this.fresh = false; });
    this.after(1.6, () => { this.phase = 2; this.fresh = true; this.repaint(); this.fresh = false; });
    this.after(2.6, () => { this.phase = 3; this.fresh = true; this.repaint(); this.fresh = false; });
    this.after(3.3, () => { this.anim = false; this.repaint(); });
  }

  skip() {
    if (!this.anim) return false;
    this.clear();
    this.phase = 3;
    this.repaint();
    return true;
  }

  busy() { return this.anim; }

  stageHeight(st) { return Math.round((st.portrait ? 660 : 480) * st.W / (st.portrait ? 390 : 560)); }

  paint(st) {
    const P = st.portrait, DW = P ? 390 : 560, DH = P ? 660 : 480, k = (st.W / DW).toFixed(4), s = this.stepIndex, fresh = this.fresh;
    const fade = (d) => (fresh ? ` class="mq-fade" style="--d:${d}s"` : '');
    const pop = (d) => (fresh ? ` class="mq-pop" style="--d:${d}s"` : '');
    // geometry
    const H = P ? { x0: 45, w: 300, top: 182, gy: 416, tag: [195, 62, 210], note: 476, bx: 195 } : { x0: 62, w: 248, top: 92, gy: 368, tag: [430, 84, 230], note: 452, bx: 186 };
    let svg = '', over = '';
    // which rooms are lit
    let nLit = DAYS[this.day].lit, lit;
    if (s === 0) lit = (i) => ORDER.indexOf(i) < nLit;
    else if (s === 1) {
      const base = (i) => ORDER.indexOf(i) < 85;
      lit = (this.phase === 1 || this.phase === 2) ? (i) => base(i) && !GROUP.has(i) : base;
    } else lit = (i) => ORDER.indexOf(i) < 85;
    svg += beach(P ? 0 : 0, P ? 390 : 330, H.gy, 52);
    svg += palm(H.x0 - 24, H.gy + 10, 112) + (P ? palm(H.x0 + H.w + 10, H.gy + 12, 96) : palm(H.x0 - 50, H.gy + 14, 84));
    svg += hotel(H.x0, H.top, H.w, H.gy, lit, { groupRing: s === 1 && (this.phase === 1 || this.phase === 2) });
    const [tx, ty, tw] = H.tag;
    if (s === 0) {
      const d = DAYS[this.day];
      svg += `<g${pop(0.05)}>${tag(tx, ty, tw, d.price, { lit: true })}</g>`;
      svg += `<g${fade(0.2)}>${pill(H.bx, H.note, d.note, { size: P ? 20 : 21, bg: 'var(--sim-bg-surface)', ink: 'var(--sim-label)', edge: 'var(--sim-stroke)' })}</g>`;
      let row = '';
      DAYS.forEach((dd, i) => {
        const [x, y] = P ? [195, 528 + i * 54] : [430, 214 + i * 60];
        row += btn('day', dd.lab, x, y, { val: i, on: i === this.day, size: P ? 19 : 19 });
      });
      over += `<div class="ht-d" style="--bw:${P ? 300 : 240}px">${row}</div>`;
    } else if (s === 1) {
      const ph = this.phase;
      if (ph >= 2) {
        svg += `<g${pop(0)}>${tag(tx, ty, tw, 4800, { lit: true })}</g>`;
        const sx = P ? 66 : tx + 10, sy = P ? 140 : ty + 74;
        svg += `<g${fade(0.2)}>${txt(sx, sy + 8, `${RS}8,000`, 22, 'var(--sim-label-muted)')}<path d="M${f1(sx - 52)} ${f1(sy)}H${f1(sx + 52)}" ${stroke(UP_COL, 3.5)}/></g>`;
        const lx = P ? 326 : tx + 10, ly = P ? 140 : ty + 112;
        svg += `<g${pop(0.4)}>${pill(lx, ly, '40% less', { size: P ? 18 : 22, bg: DN_COL, ink: 'var(--sim-bg-deep)', edge: DN_COL })}</g>`;
      } else svg += tag(tx, ty, tw, 8000, { lit: ph === 0 });
      const phLab = ['Saturday in December', 'a group tour cancels', 'cut the tariff', 'next morning: rooms fill'][ph];
      const py = P ? H.note : 22;
      if (!P || ph > 0) svg += `<g${fade(0)}>${pill(P ? 195 : 186, py, phLab, { size: P ? 18 : 19, bg: ph === 1 ? ACC : 'var(--sim-bg-surface)', ink: ph === 1 ? ACC_INK : 'var(--sim-label)', edge: ph === 1 ? ACC : 'var(--sim-stroke)' })}</g>`;
      if (ph === 3) svg += `<g${fade(0.3)}>${pill(H.bx, P ? 548 : H.note, 'revenue: all money from sales', { size: P ? 18 : 20, bg: 'var(--sim-series-4)', ink: 'var(--sim-ink-on-4, var(--sim-bg-deep))', edge: 'var(--sim-series-4)' })}</g>`;
      if (!this.anim) over += btn('replay', 'replay', P ? 195 : 430, P ? 616 : 300, { size: 18 });
    } else {
      const f = FACTORS[this.fac], col = f.up ? UP_COL : DN_COL;
      svg += tag(P ? tx - 30 : tx - 30, ty, P ? 210 : 196, 8000, { lit: true });
      const ax = P ? tx + 128 : tx + 88;
      svg += `<g${pop(0.1)}>${bigArrow(ax, ty - 38, ty + 38, f.up ? -1 : 1, col, 26)}</g>`;
      svg += `<g${fade(0.3)}>${pill(H.bx, H.note, `tariff goes ${f.up ? 'up' : 'down'}`, { size: P ? 20 : 21, bg: col, ink: 'var(--sim-bg-deep)', edge: col })}</g>`;
      let list = '';
      FACTORS.forEach((ff, i) => {
        const [x, y] = P ? [i % 2 ? 293 : 99, 530 + Math.floor(i / 2) * 58] : [430, 170 + i * 53];
        list += btn('fac', `${iconSvg(ff.icon, ff.tone)}<span>${ff.lab}</span>`, x, y, { val: i, on: i === this.fac, size: P ? 15 : 17, aria: ff.lab });
      });
      over += `<div class="ht-f" style="--bw:${P ? 186 : 246}px">${list}</div>`;
    }
    return { svg: `<g transform="scale(${k})">${svg}</g>`, over: `<div style="position:absolute;left:0;top:0;width:${DW}px;height:${DH}px;transform:scale(${k});transform-origin:0 0">${over}</div>` };
  }

  testState() {
    const s = this.stepIndex;
    return { step: s, day: s === 0 ? DAYS[this.day].lab : null, price: s === 0 ? DAYS[this.day].price : s === 1 ? (this.phase >= 2 ? 4800 : 8000) : 8000, phase: s === 1 ? this.phase : null, factor: s === 2 ? FACTORS[this.fac].lab : null, anim: this.anim };
  }
}
