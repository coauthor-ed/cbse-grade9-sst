/**
 * SixContributionsScene - L06 s07 "Quality of life, jobs and taxes", "Goods, innovations and social
 * responsibility", "Businesses you have met" (3 beats). SvgScene, design 560 x 480 landscape, 390 x 620 portrait.
 * Fig 6.13: six ways businesses add to society, round a hub 'businesses' (a factory and a shop icon).
 *   b0 Three tiles lit (the other three are dim empty slots): quality of life (medicines, transport, technology:
 *      hospital, truck, phone), jobs and income (people, a coin), taxes (a coin -> road, school, hospital).
 *   b1 The other three lit, the first three dimmed: goods and services (crate, shop), innovations (bulb, check),
 *      social responsibility (book, leaf, hospital = education, environment, healthcare).
 *   b2 Four cases, one row each, an arrow from the case to its contribution: Lijjat (two members, 'over 45,000
 *      women') -> jobs and income; M. S. Oberoi ('hotel management school') -> social responsibility (our
 *      reading: the school supports education); ABC Bakery ('tax Rs 13,000', a made-up bakery, the L05 P&L)
 *      -> taxes; jute bags ('a solution to plastic litter') -> innovations.
 * Cast: lijjat1/lijjat2 (same entries as L02 LijjatMembersScene). Props drawn here: hub, tiles, jute bag and
 * plastic bag (copied from L01 EntrepreneurTasksBoardScene). No logos, no brand marks. Animation is CSS only;
 * Skip / Replay. No host controls. Colours are tokens only. ASCII only (rupee sign from MoneyKit RS).
 */
import { SvgScene, stroke, fill, shade } from 'simulations/base/kit/SimSvg.js';
import { iconSvg } from 'simulations/base/kit/SimIcons.js';
import { rs } from '../shared/MoneyKit.js';
import { PEOPLE_CSS, personSlot, paintPeople, registerCast } from '../shared/FinPeople.js';
import { STALL_CSS, bakery } from '../shared/StallKit.js';

const f1 = (v) => (+v).toFixed(1);
const MAIN = [[{ idx: 0, dwellMs: null }], [{ idx: 1, dwellMs: null }], [{ idx: 2, dwellMs: null }]];
const DUR = [2.2, 2.2, 3.0];
const TAX = 13000;

// Same two Lijjat members as L02 (FinPeople keeps the first entry registered).
const W2 = [{ outfit: 'drape', hairStyle: 'bun' }, { outfit: 'kurti', hairStyle: 'braid', dupatta: true }];
W2.forEach((w, i) => registerCast(`lijjat${i + 1}`, { name: 'Member', series: i + 1, role: 'adult', i: 51 + i,
  look: { top: `s${i + 1}`, bottom: w.outfit === 'drape' ? `s${i + 1}` : 'cream', bottomStyle: 'long-skirt', trim: 'cream', shoeStyle: 'sandal', shoe: 'brown', pattern: 'plain', moustache: false, glasses: false, dupatta: false, girth: 1 + (i % 3) * 0.04, ...w } }));

// The six contributions: key, series colour, icons, label lines.
const SIX = [
  { k: 'life', n: 5, ic: ['hospital', 'truck', 'phone'], t: ['quality of life'] },
  { k: 'jobs', n: 1, ic: ['crowd', 'coin'], t: ['jobs and income'] },
  { k: 'tax', n: 4, ic: ['road', 'school', 'hospital'], t: ['taxes'] },
  { k: 'goods', n: 2, ic: ['crate', 'shop'], t: ['goods and', 'services'] },
  { k: 'innov', n: 6, ic: ['bulb', 'check'], t: ['innovations'] },
  { k: 'csr', n: 3, ic: ['book', 'leaf', 'hospital'], t: ['social', 'responsibility'] },
];
const BY = Object.fromEntries(SIX.map((s) => [s.k, s]));

const CSS = `
.sc-btn { position: absolute; cursor: pointer; padding: 6px 14px; border-radius: calc(12px * var(--look-radius, 1));
  font: 800 18px/1.1 var(--sim-font); color: var(--sim-label); background: var(--sim-bg-surface);
  border: 2.5px solid var(--sim-stroke); box-shadow: 0 calc(3px * var(--look-lip, 1)) 0 var(--sim-stroke); }
.sc-btn:active { transform: translateY(3px); box-shadow: none; }
.sc-btn:focus-visible { outline: 3px solid var(--sim-accent); outline-offset: 3px; }
svg .sc-pop { transform-box: fill-box; transform-origin: center; animation: sc-pop 0.5s cubic-bezier(.3,1.4,.5,1) both; animation-delay: var(--d, 0s); }
@keyframes sc-pop { 0% { opacity: 0; transform: scale(0.5); } 100% { opacity: 1; transform: none; } }
svg .sc-fade { animation: sc-fade 0.45s ease both; animation-delay: var(--d, 0s); }
@keyframes sc-fade { 0% { opacity: 0; } 100% { opacity: 1; } }
svg .sc-in { animation: sc-in 0.6s cubic-bezier(.4,0,.3,1) both; animation-delay: var(--d, 0s); }
@keyframes sc-in { 0% { opacity: 0; transform: translateX(28px); } 100% { opacity: 1; transform: none; } }
.sc-still, .sc-still * { animation: none !important; }
@media (prefers-reduced-motion: reduce) { svg .sc-pop, svg .sc-fade, svg .sc-in { animation: none; } }
`;

const txt = (x, y, t, size, col = 'var(--sim-label)', anchor = 'middle', w = 800) =>
  `<text x="${f1(x)}" y="${f1(y)}" text-anchor="${anchor}" style="fill:${col};font:${w} ${f1(size)}px var(--sim-font)">${t}</text>`;
const icon = (name, x, y, s, tone) => `<g transform="translate(${f1(x - s / 2)} ${f1(y - s / 2)}) scale(${f1(s / 48)})">${iconSvg(name, tone)}</g>`;
const RIM = 'var(--sim-stroke)';
const ACC = 'var(--sim-accent)';
const MUTED = 'var(--sim-label-muted)';
const tint = (n, k = 12) => `color-mix(in oklab, var(--sim-series-${n}) ${k}%, var(--sim-bg-surface))`;
const JUTE = 'color-mix(in oklab, var(--sim-series-8) 42%, var(--sim-bg-surface))';
const PLASTIC = 'color-mix(in oklab, var(--sim-label) 9%, var(--sim-bg-surface))';

function card(r, col = RIM, bg = 'var(--sim-bg-surface)') {
  const [x, y, w, h] = r;
  return `<rect x="${f1(x)}" y="${f1(y + 4)}" width="${f1(w)}" height="${f1(h)}" rx="14" ${fill(shade(col, 70))}/>`
    + `<rect x="${f1(x)}" y="${f1(y)}" width="${f1(w)}" height="${f1(h)}" rx="14" ${fill(bg, `stroke:${col};stroke-width:3`)}/>`;
}

function arrow(x0, y0, x1, y1, col = ACC, w = 5) {
  const a = Math.atan2(y1 - y0, x1 - x0), L = 14;
  const p1 = [x1 - L * Math.cos(a - 0.5), y1 - L * Math.sin(a - 0.5)], p2 = [x1 - L * Math.cos(a + 0.5), y1 - L * Math.sin(a + 0.5)];
  return `<path d="M${f1(x0)} ${f1(y0)}L${f1(x1)} ${f1(y1)}" ${stroke(col, w)}/><path d="M${f1(p1[0])} ${f1(p1[1])}L${f1(x1)} ${f1(y1)}L${f1(p2[0])} ${f1(p2[1])}" ${stroke(col, w)}/>`;
}

/** One contribution tile: icons on top, label under. state 'lit' | 'dim' | 'empty'. */
function tile(r, c, state, d = 0) {
  const [x, y, w, h] = r, col = `var(--sim-series-${c.n})`;
  if (state === 'empty') {
    return `<rect x="${f1(x)}" y="${f1(y)}" width="${f1(w)}" height="${f1(h)}" rx="14" ${fill('color-mix(in oklab, var(--sim-label) 4%, transparent)', `stroke:${MUTED};stroke-width:2.5;stroke-dasharray:9 7;opacity:0.6`)}/>`;
  }
  let s = card(r, col, tint(c.n, state === 'lit' ? 16 : 8));
  const is = 42, gap = 8, n = c.ic.length, x0 = x + w / 2 - ((n - 1) * (is + gap)) / 2;
  c.ic.forEach((ic, i) => { s += icon(ic, x0 + i * (is + gap), y + 34, is, c.n); });
  const ty = c.t.length > 1 ? y + 80 : y + 92;
  c.t.forEach((t, i) => { s += txt(x + w / 2, ty + i * 24, t, 21); });
  const cls = state === 'lit' ? ' class="sc-pop"' : '';
  return `<g${cls} style="--d:${d}s;${state === 'dim' ? 'opacity:0.38;' : ''}">${s}</g>`;
}

/** The hub: a circle with a factory and a shop, the word 'businesses'. */
function hub(x, y, r) {
  return `<circle cx="${f1(x)}" cy="${f1(y + 4)}" r="${f1(r)}" ${fill(shade(ACC, 60))}/>`
    + `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(r)}" ${fill(`color-mix(in oklab, ${ACC} 14%, var(--sim-bg-surface))`, `stroke:${ACC};stroke-width:4`)}/>`
    + icon('factory', x - r * 0.3, y - r * 0.2, r * 0.66, 8) + icon('shop', x + r * 0.32, y - r * 0.2, r * 0.6, 2)
    + txt(x, y + r * 0.5, 'businesses', Math.max(20, r * 0.28));
}

function juteBag(x, y, h) {
  const w = h * 0.86, top = y - h * 0.78, rim = shade(JUTE, 58);
  let s = `<path d="M${f1(x - w * 0.25)} ${f1(top)}C${f1(x - w * 0.25)} ${f1(y - h * 1.08)} ${f1(x + w * 0.25)} ${f1(y - h * 1.08)} ${f1(x + w * 0.25)} ${f1(top)}" ${stroke(rim, Math.max(3, h * 0.05))}/>`;
  s += `<path d="M${f1(x - w * 0.5)} ${f1(top)}H${f1(x + w * 0.5)}L${f1(x + w * 0.45)} ${f1(y)}H${f1(x - w * 0.45)}Z" ${fill(JUTE, `stroke:${rim};stroke-width:2.5;stroke-linejoin:round`)}/>`;
  for (let i = 1; i < 5; i++) s += `<path d="M${f1(x - w * 0.48)} ${f1(top + (y - top) * i / 5)}H${f1(x + w * 0.48)}" ${stroke(`color-mix(in oklab, ${rim} 45%, transparent)`, 1.5)}/>`;
  s += `<path d="M${f1(x - h * 0.12)} ${f1(top + h * 0.42)}Q${f1(x)} ${f1(top + h * 0.12)} ${f1(x + h * 0.14)} ${f1(top + h * 0.3)}Q${f1(x)} ${f1(top + h * 0.5)} ${f1(x - h * 0.12)} ${f1(top + h * 0.42)}Z" ${fill('var(--sim-series-3)')}/>`;
  return s;
}

function plasticBag(x, y, h) {
  const w = h * 0.8, rim = 'color-mix(in oklab, var(--sim-label) 42%, var(--sim-bg-surface))', t = y - h;
  const d = `M${f1(x - w * 0.46)} ${f1(y)}L${f1(x - w * 0.5)} ${f1(y - h * 0.62)}L${f1(x - w * 0.44)} ${f1(t)}H${f1(x - w * 0.2)}L${f1(x - w * 0.16)} ${f1(y - h * 0.7)}Q${f1(x)} ${f1(y - h * 0.6)} ${f1(x + w * 0.16)} ${f1(y - h * 0.7)}L${f1(x + w * 0.2)} ${f1(t)}H${f1(x + w * 0.44)}L${f1(x + w * 0.5)} ${f1(y - h * 0.62)}L${f1(x + w * 0.46)} ${f1(y)}Z`;
  let s = `<g transform="rotate(-10 ${f1(x)} ${f1(y)})"><path d="${d}" ${fill(PLASTIC, `stroke:${rim};stroke-width:2.5;stroke-linejoin:round`)}/></g>`;
  // crossed out
  s += `<path d="M${f1(x - w * 0.55)} ${f1(t)}L${f1(x + w * 0.55)} ${f1(y)}M${f1(x + w * 0.55)} ${f1(t)}L${f1(x - w * 0.55)} ${f1(y)}" ${stroke('var(--sim-series-6)', 4)}/>`;
  return s;
}

export class SixContributionsScene extends SvgScene {
  static WIDTH = 560;
  static PORTRAIT_WIDTH = 390;
  static HEIGHT = 480;
  static PORTRAIT_HEIGHT = 620;
  static CONTINUOUS = false;
  static BEAT_STEP_MAP = MAIN;
  static BEAT_MAPS = { 3: MAIN };
  static CONTROLS = [];
  static ARIA_LABEL = 'Six ways businesses add to society. First three: quality of life (medicines, transport, technology), jobs and income, and taxes that pay for roads, schools and hospitals. Then the other three: goods and services, innovations, and social responsibility (education, environment, healthcare). Last, businesses you have met: Lijjat, over 45,000 women, goes with jobs and income; M. S. Oberoi\'s hotel management school goes with social responsibility; ABC Bakery, a made-up bakery, paid 13,000 rupees of tax, which goes with taxes; jute bags, a solution to plastic litter, go with innovations.';

  async setup() {
    this.still = false;
    this.run = 0;
    await super.setup();
    this._onClick = (e) => {
      const b = e.target?.closest?.('[data-act]');
      if (!b) return;
      if (b.dataset.act === 'skip') this.finish();
      else this.restart();
    };
    this.root.addEventListener('click', this._onClick);
  }

  destroy() {
    this.root?.removeEventListener('click', this._onClick);
    super.destroy();
  }

  css() { return PEOPLE_CSS + STALL_CSS + CSS; }

  enter() { this.restart(true); }

  restart(quiet) {
    this.still = false;
    const run = ++this.run;
    if (this._timers) this.after(DUR[this.stepIndex] ?? 2, () => { if (run === this.run) this.finish(); });
    if (!quiet) this.repaint();
  }

  finish() { this.run++; this.still = true; this.repaint(); }

  repaint() { super.repaint(); paintPeople(this); }

  stageHeight(st) { return Math.round((st.portrait ? 620 : 480) * st.W / (st.portrait ? 390 : 560)); }

  paint(st) {
    const P = st.portrait, DW = P ? 390 : 560, DH = P ? 620 : 480, k = (st.W / DW).toFixed(4), v = this.stepIndex;
    const out = v === 2 ? this.paintCases(P) : this.paintSix(P, v);
    const still = this.still ? ' sc-still' : '';
    const pos = P ? (v === 2 ? 'left:8px;top:116px' : 'right:8px;top:8px') : 'right:8px;bottom:6px';
    const btn = `<button type="button" class="sv-hit tap btn sc-btn" data-act="${this.still ? 'replay' : 'skip'}" style="${pos}">${this.still ? 'Replay' : 'Skip'}</button>`;
    return {
      svg: `<g class="${still}" transform="scale(${k})">${out.svg}</g>`,
      over: `<div class="${still}" style="position:absolute;left:0;top:0;width:${DW}px;height:${DH}px;overflow:hidden;transform:scale(${k});transform-origin:0 0">${out.over ?? ''}${btn}</div>`,
    };
  }

  // b0 / b1: the hub and six tiles; three lit per beat.
  paintSix(P, v) {
    const R = P
      ? [[12, 168, 177, 128], [12, 312, 177, 128], [12, 456, 177, 128], [201, 168, 177, 128], [201, 312, 177, 128], [201, 456, 177, 128]]
      : [[14, 22, 178, 124], [14, 176, 178, 124], [14, 330, 178, 124], [368, 22, 178, 124], [368, 176, 178, 124], [368, 330, 178, 124]];
    const H = P ? [195, 82, 66] : [280, 238, 84];
    let svg = '';
    // connectors (landscape): from the hub to each tile's inner edge
    if (!P) {
      R.forEach(([x, y, w, h], i) => {
        const lit = v === 0 ? i < 3 : i >= 3, ex = i < 3 ? x + w : x, ey = y + h / 2;
        const a = Math.atan2(ey - H[1], ex - H[0]), sx = H[0] + Math.cos(a) * (H[2] + 4), sy = H[1] + Math.sin(a) * (H[2] + 4);
        svg += lit ? `<g class="sc-fade" style="--d:${0.3 + (i % 3) * 0.4}s">${arrow(sx, sy, ex - (i < 3 ? -6 : 6), ey, `var(--sim-series-${SIX[i].n})`, 5)}</g>`
          : `<path d="M${f1(sx)} ${f1(sy)}L${f1(ex)} ${f1(ey)}" ${stroke(MUTED, 3, 'stroke-dasharray:6 7;opacity:0.5')}/>`;
      });
    } else {
      svg += `<path d="M${H[0]} ${H[1] + H[2] + 6}V158" ${stroke(ACC, 5)}/><path d="M100 158H290" ${stroke(ACC, 5)}/>`;
    }
    svg += hub(H[0], H[1], H[2]);
    SIX.forEach((c, i) => {
      const mine = v === 0 ? i < 3 : i >= 3;
      const state = mine ? 'lit' : v === 0 ? 'empty' : 'dim';
      svg += tile(R[i], c, state, 0.4 + (i % 3) * 0.4);
    });
    return { svg, over: '' };
  }

  // b2: four cases -> their contribution.
  paintCases(P) {
    const rows = [
      { to: 'jobs', name: 'Lijjat', lines: ['over 45,000 women'] },
      { to: 'csr', name: 'M. S. Oberoi', lines: ['hotel management', 'school'] },
      { to: 'tax', name: 'ABC Bakery', lines: [`tax ${rs(TAX)}`], note: 'a made-up bakery' },
      { to: 'innov', name: 'jute bags', lines: ['a solution to', 'plastic litter'] },
    ];
    let svg = '', over = '';
    rows.forEach((r, i) => {
      const c = BY[r.to], col = `var(--sim-series-${c.n})`, d = 0.2 + i * 0.6;
      const box = P ? [12, 12 + i * 150, 366, 94] : [12, 16 + i * 112, 300, 98];
      const [bx, by, bw, bh] = box, px = bx + 52, foot = by + bh - 8, tx = bx + 104;
      let g = card(box);
      // the picture
      if (i === 0) {
        over += personSlot('lijjat1', { x: px - 18, y: foot + 2, h: 80, facing: 0, mood: 'happy', cls: 'mpp-pop', style: `--d:${d}s;` });
        over += personSlot('lijjat2', { x: px + 18, y: foot + 2, h: 78, facing: 0, mood: 'smile', cls: 'mpp-pop', style: `--d:${d + 0.1}s;` });
      } else if (i === 1) g += icon('school', px, by + bh / 2, 72, 3);
      else if (i === 2) g += bakery(px, foot, 84, { sign: '' });
      else g += juteBag(px - 14, foot, 64) + plasticBag(px + 28, foot - 2, 40);
      g += txt(tx, by + 32, r.name, 23, 'var(--sim-label)', 'start');
      r.lines.forEach((t, j) => { g += txt(tx, by + 60 + j * 24, t, i === 2 ? 24 : 20, 'var(--sim-label)', 'start', i === 2 ? 800 : 700); });
      if (r.note) g += txt(tx, by + 86, r.note, 18, MUTED, 'start', 700);
      svg += `<g class="sc-in" style="--d:${d}s">${g}</g>`;
      // the contribution it shows
      if (P) {
        const ty = by + bh + 8;
        svg += `<g class="sc-pop" style="--d:${d + 0.35}s">${arrow(110, ty, 140, ty + 22, ACC, 4)}`
          + `<rect x="148" y="${f1(ty + 2)}" width="230" height="38" rx="19" ${fill(tint(c.n, 18), `stroke:${col};stroke-width:3`)}/>`
          + txt(263, ty + 28, c.t.join(' '), 20) + '</g>';
      } else {
        const ty = by + bh / 2, cx = 452, tl = c.k === 'jobs' ? ['jobs and', 'income'] : c.t;
        svg += `<g class="sc-fade" style="--d:${d + 0.3}s">${arrow(bx + bw + 4, ty, 348, ty, ACC, 5)}</g>`;
        svg += `<g class="sc-pop" style="--d:${d + 0.35}s">${card([354, by + 10, 194, bh - 20], col, tint(c.n, 18))}`
          + tl.map((t, j) => txt(cx, ty + 8 + (j - (tl.length - 1) / 2) * 24, t, 21)).join('') + '</g>';
      }
    });
    return { svg, over };
  }

  testState() { return { view: this.stepIndex, still: this.still, tax: TAX }; }
}
