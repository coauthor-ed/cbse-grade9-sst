/**
 * IncomePillarsScene - L01 s02 "Five Pillars of Personal Finance" (3 beats). SvgScene, design 560 x 470
 * landscape, 390 x 600 portrait. Cast: shared/FinPeople.js; places from SimCivic (school, shop, bank) and SimIcons
 * (house, scroll, book, pen, clock, check).
 *   b0 Five pillars (book Fig 5.2): a roof beam "personal finance" on five pillars income, budgeting, saving,
 *      investing, protection (one word each, written up the pillar). The pillars rise in turn; income is lit, the
 *      other four dim; "starts here" under income.
 *   b1 Five kinds of income: teacher at a school, shopkeeper at a shop, landlord beside a house, depositor at a
 *      bank, shareholder holding a share paper. Under each a card with the income word: salary, business profit,
 *      rent, interest, dividend. Entry: the cards turn up one by one (0.45 s); rest / cold start: all five.
 *      Tap a person (or card): that column lit, the rest dimmed. Portrait: 3 + 2.
 *   b2 Earn while you learn: Meera beside three cards, each with an icon: skill (book and pen), time (clock),
 *      safe and allowed (check); the three kinds of work as small chips on top.
 * Colours are tokens only. ASCII only.
 */
import { SvgScene, stroke, fill, shade } from 'simulations/base/kit/SimSvg.js';
import { civicSvg } from 'simulations/base/kit/SimCivic.js';
import { iconSvg } from 'simulations/base/kit/SimIcons.js';
import { MONEY_CSS } from '../shared/MoneyKit.js';
import { PEOPLE_CSS, personSlot, paintPeople, castOf } from '../shared/FinPeople.js';

const f1 = (v) => (+v).toFixed(1);
const MAIN = [[{ idx: 0, dwellMs: null }], [{ idx: 1, dwellMs: null }], [{ idx: 2, dwellMs: null }]];
const PILLARS = ['income', 'budgeting', 'saving', 'investing', 'protection'];
const EARNERS = [
  { who: 'teacher', place: 'school', word: ['salary'] },
  { who: 'shopkeeper', place: 'shop', word: ['business', 'profit'] },
  { who: 'landlord', place: 'house', word: ['rent'] },
  { who: 'depositor', place: 'bank', word: ['interest'] },
  { who: 'shareholder', place: 'share', word: ['dividend'] },
];

const CSS = `
.ip-hit { position: absolute; padding: 0; border: 0; background: none; cursor: pointer; border-radius: 14px; }
.ip-hit:hover { background: color-mix(in oklab, var(--sim-accent) 10%, transparent); }
.ip-hit:focus-visible { outline: 3px solid var(--sim-accent); outline-offset: 3px; }
`;

const text = (x, y, t, size, col = 'var(--sim-label)', anchor = 'middle', w = 800) =>
  `<text x="${f1(x)}" y="${f1(y)}" text-anchor="${anchor}" style="fill:${col};font:${w} ${size}px var(--sim-font)">${t}</text>`;

/** A SimIcons icon centred on (cx, cy), size across. */
const icon = (name, cx, cy, size, tone = 1) =>
  iconSvg(name, tone).replace('<svg class="sim-icon" viewBox="0 0 48 48" width="48" height="48"', `<svg class="sim-icon" viewBox="0 0 48 48" x="${f1(cx - size / 2)}" y="${f1(cy - size / 2)}" width="${f1(size)}" height="${f1(size)}"`);

/** A pill chip in SVG, centred on (x, y). */
function pill(x, y, t, size, col = 'var(--sim-bg-surface)', ink = 'var(--sim-label)') {
  const w = t.length * size * 0.56 + size * 1.3, h = size * 1.7;
  return `<rect x="${f1(x - w / 2)}" y="${f1(y - h / 2)}" width="${f1(w)}" height="${f1(h)}" rx="${f1(h / 2)}" ${fill(col, 'stroke:var(--sim-stroke);stroke-width:2')}/>` + text(x, y + size * 0.36, t, size, ink);
}

export class IncomePillarsScene extends SvgScene {
  static WIDTH = 560;
  static PORTRAIT_WIDTH = 390;
  static HEIGHT = 470;
  static PORTRAIT_HEIGHT = 600;
  static CONTINUOUS = false;
  static BEAT_STEP_MAP = MAIN;
  static BEAT_MAPS = { 3: MAIN };
  static CONTROLS = [];
  static ARIA_LABEL = 'Personal finance stands on five pillars: income, budgeting, saving, investing and protection; it starts with income. Five kinds of income: a teacher earns a salary, a shopkeeper earns business profit, a landlord earns rent, money in a bank earns interest, and a shareholder receives a dividend. Students who earn while they learn should think about the skill, the time, and whether the work is safe and allowed.';

  async setup() {
    this.shown = 5;
    this.lit = -1;
    this.anim = false;
    this.pop = -1;
    await super.setup();
    this._onClick = (e) => {
      const b = e.target?.closest?.('[data-act]');
      if (b) this.act(b.dataset.act, Number(b.dataset.val));
    };
    this.root.addEventListener('click', this._onClick);
  }

  destroy() {
    this.root?.removeEventListener('click', this._onClick);
    super.destroy();
  }

  css() { return MONEY_CSS + PEOPLE_CSS + CSS; }

  repaint() { super.repaint(); paintPeople(this); }

  clear() { for (const t of (this._timers ?? []).splice(0)) clearTimeout(t); this.anim = false; this.pop = -1; }

  enter(step) {
    this.clear();
    this.lit = -1;
    this.shown = 5;
    if (step === 1) {
      this.shown = 0;
      this.anim = true;
      for (let i = 0; i < 5; i++) this.after(0.4 + i * 0.45, () => { this.shown = i + 1; this.pop = i; this.repaint(); this.pop = -1; });
      this.after(0.4 + 5 * 0.45, () => { this.anim = false; this.repaint(); });
    }
  }

  act(a, i) {
    if (this.stepIndex === 1 && a === 'earner') { this.clear(); this.shown = 5; this.lit = this.lit === i ? -1 : i; this.pop = i; this.repaint(); this.pop = -1; }
  }

  skip() {
    if (!this.anim) return false;
    this.clear();
    this.shown = 5;
    this.repaint();
    return true;
  }

  busy() { return this.anim; }

  stageHeight(st) { return Math.round((st.portrait ? 600 : 470) * st.W / (st.portrait ? 390 : 560)); }

  paint(st) {
    const P = st.portrait, DW = P ? 390 : 560, DH = P ? 600 : 470, k = (st.W / DW).toFixed(4), v = this.stepIndex;
    const out = v === 1 ? this.paintIncome(P) : v === 2 ? this.paintEarn(P) : this.paintPillars(P);
    return { svg: `<g transform="scale(${k})">${out.svg}</g>`, over: `<div style="position:absolute;left:0;top:0;width:${DW}px;height:${DH}px;transform:scale(${k});transform-origin:0 0">${out.over ?? ''}</div>` };
  }

  // b0: the roof beam on five pillars; income lit.
  paintPillars(P) {
    let svg = '';
    const G = P
      ? { x0: 14, x1: 376, apex: 30, beam: [78, 136], xs: [51, 123, 195, 267, 339], pw: 52, top: 148, bot: 452, fs: 23, base: 482, here: 520, title: 26 }
      : { x0: 22, x1: 538, apex: 24, beam: [62, 118], xs: [80, 180, 280, 380, 480], pw: 66, top: 130, bot: 396, fs: 27, base: 424, here: 452, title: 30 };
    const stone = 'color-mix(in oklab, var(--sim-stroke) 30%, var(--sim-bg-surface))', rim = 'var(--sim-stroke)';
    const lit = 'var(--sim-series-1)';
    svg += `<path d="M${G.x0} ${G.beam[0]}L${(G.x0 + G.x1) / 2} ${G.apex}L${G.x1} ${G.beam[0]}Z" ${fill(stone, `stroke:${rim};stroke-width:3;stroke-linejoin:round`)}/>`;
    svg += `<rect x="${G.x0}" y="${G.beam[0]}" width="${G.x1 - G.x0}" height="${G.beam[1] - G.beam[0]}" rx="6" ${fill('var(--sim-bg-surface)', `stroke:${rim};stroke-width:3`)}/>`;
    svg += text((G.x0 + G.x1) / 2, (G.beam[0] + G.beam[1]) / 2 + G.title * 0.36, 'personal finance', G.title);
    PILLARS.forEach((w, i) => {
      const x = G.xs[i], on = i === 0, col = on ? lit : stone, edge = on ? shade(lit, 64) : rim;
      const h = G.bot - G.top, cap = 14;
      let g = `<rect x="${f1(x - G.pw / 2 - 8)}" y="${G.top}" width="${G.pw + 16}" height="${cap}" rx="4" ${fill(col, `stroke:${edge};stroke-width:2.5`)}/>`
        + `<rect x="${f1(x - G.pw / 2)}" y="${G.top + cap}" width="${G.pw}" height="${h - cap * 2}" ${fill(on ? `color-mix(in oklab, ${lit} 30%, var(--sim-bg-surface))` : 'var(--sim-bg-surface)', `stroke:${edge};stroke-width:2.5`)}/>`
        + `<rect x="${f1(x - G.pw / 2 - 8)}" y="${G.bot - cap}" width="${G.pw + 16}" height="${cap}" rx="4" ${fill(col, `stroke:${edge};stroke-width:2.5`)}/>`;
      const cy = (G.top + G.bot) / 2;
      g += `<text x="${f1(x)}" y="${f1(cy)}" transform="rotate(-90 ${f1(x)} ${f1(cy)})" text-anchor="middle" dominant-baseline="central" style="fill:var(--sim-label);font:800 ${G.fs}px var(--sim-font)">${w}</text>`;
      svg += `<g class="mk-rise" style="--d:${(0.1 + i * 0.15).toFixed(2)}s${on ? '' : ';opacity:0.38'}">${g}</g>`;
    });
    svg += `<rect x="${G.x0}" y="${G.bot}" width="${G.x1 - G.x0}" height="${G.base - G.bot}" rx="6" ${fill(stone, `stroke:${rim};stroke-width:3`)}/>`;
    svg += `<path d="M${G.xs[0]} ${G.base + 6}l-9 13h18z" ${fill('var(--sim-accent)')}/>`;
    svg += text(G.xs[0] - 22, G.here + 6, 'starts here', P ? 21 : 22, 'var(--sim-accent)', 'start');
    return { svg };
  }

  // b1: five earners at their places, each with a card.
  paintIncome(P) {
    let svg = '', over = '';
    const cols = P
      ? [[68, 0], [195, 0], [322, 0], [130, 1], [260, 1]]
      : [[56, 0], [168, 0], [280, 0], [392, 0], [504, 0]];
    const R = P
      ? [{ ground: 108, feet: 240, h: 116, card: 278, cw: 116, ch: 60 }, { ground: 370, feet: 488, h: 110, card: 524, cw: 116, ch: 58 }]
      : [{ ground: 168, feet: 336, h: 136, card: 386, cw: 104, ch: 70 }];
    EARNERS.forEach((e, i) => {
      const [x, r] = cols[i], g = R[r], dim = this.lit >= 0 && this.lit !== i;
      const s = castOf(e.who).series, col = `var(--sim-series-${s})`;
      let a = '';
      a += `<path d="M${f1(x - 50)} ${g.ground}H${f1(x + 50)}" ${stroke('var(--sim-stroke)', 3)}/>`;
      if (e.place === 'house') a += icon('house', x, g.ground - 40, 84, 8);
      else if (e.place !== 'share') a += civicSvg(e.place, x, g.ground, { w: P ? 100 : 106 });
      else a += civicSvg('office', x, g.ground, { w: P ? 88 : 92 });
      svg += `<g${dim ? ' opacity="0.3"' : ''}>${a}</g>`;
      const hold = e.place === 'share';
      const chest = g.feet - g.h * 0.56;
      over += personSlot(e.who, { x, y: g.feet, h: g.h, facing: 0, mood: this.lit === i ? 'happy' : 'smile', dim,
        hands: hold ? [{ x: x + g.h * 0.13, y: chest }, { x: x - g.h * 0.13, y: chest }] : null });
      if (hold) over += `<div style="position:absolute;left:0;top:0${dim ? ';opacity:0.3' : ''}"><svg width="1" height="1" style="overflow:visible;position:absolute;left:0;top:0">${icon('scroll', x, chest - 4, g.h * 0.36, 2)}</svg></div>`;
      if (i < this.shown) {
        const cx = x, cy = g.card, w = g.cw, h = g.ch, on = this.lit === i;
        const pop = this.pop === i ? ' class="mk-pop"' : '';
        let c = `<rect x="${f1(cx - w / 2)}" y="${f1(cy - h / 2 + 3)}" width="${w}" height="${h}" rx="12" ${fill(shade(col, 64))}/>`
          + `<rect x="${f1(cx - w / 2)}" y="${f1(cy - h / 2)}" width="${w}" height="${h}" rx="12" ${fill(`color-mix(in oklab, ${col} ${on ? 45 : 24}%, var(--sim-bg-surface))`, `stroke:${on ? 'var(--sim-accent)' : shade(col, 64)};stroke-width:${on ? 4 : 2.5}`)}/>`;
        const fs = e.word.length > 1 ? (P ? 19 : 20) : (P ? 21 : 22);
        if (e.word.length > 1) c += text(cx, cy - 4, e.word[0], fs) + text(cx, cy + fs, e.word[1], fs);
        else c += text(cx, cy + fs * 0.36, e.word[0], fs);
        svg += `<g${pop}${dim ? ' opacity="0.3"' : ''}>${c}</g>`;
      } else {
        svg += `<rect x="${f1(x - g.cw / 2)}" y="${f1(g.card - g.ch / 2)}" width="${g.cw}" height="${g.ch}" rx="12" ${fill('none', 'stroke:var(--sim-stroke);stroke-width:2;stroke-dasharray:6 6')}/>`;
      }
      over += `<button type="button" class="sv-hit ip-hit" data-act="earner" data-val="${i}" aria-label="${e.who}: ${e.word.join(' ')}" style="left:${f1(x - (P ? 60 : 54))}px;top:${f1(g.feet - g.h - 50)}px;width:${P ? 120 : 108}px;height:${f1(g.card + g.ch / 2 - (g.feet - g.h - 50))}px"></button>`;
    });
    if (!this.anim) svg += text(P ? 195 : 280, P ? 574 : 448, 'tap a person', 19, 'var(--sim-label-muted)', 'middle', 700);
    return { svg, over };
  }

  // b2: Meera between three cards: skill, time, safe and allowed.
  paintEarn(P) {
    let svg = '', over = '';
    const G = P
      ? { chips: [[110, 34, 'part-time work'], [292, 34, 'internship'], [195, 78, 'apprenticeship']], meera: [82, 566, 236],
        cards: [[268, 172], [268, 312], [268, 452]], cw: 206, ch: 118 }
      : { chips: [[100, 40, 'part-time work'], [286, 40, 'internship'], [462, 40, 'apprenticeship']], meera: [96, 440, 236],
        cards: [[252, 260], [380, 260], [508, 260]], cw: 118, ch: 196 };
    G.chips.forEach(([x, y, t]) => { svg += pill(x, y, t, 18); });
    over += personSlot('meera', { x: G.meera[0], y: G.meera[1], h: G.meera[2], pose: 'stand', facing: P ? 0 : 1, mood: 'think' });
    const CARDS = [
      { t: ['skill'], icons: [['book', 3], ['pen', 1]] },
      { t: ['time'], icons: [['clock', 5]] },
      { t: ['safe and', 'allowed'], icons: [['check', 3]] },
    ];
    CARDS.forEach((cd, i) => {
      const [cx, cy] = G.cards[i], w = G.cw, h = G.ch;
      let c = `<rect x="${f1(cx - w / 2)}" y="${f1(cy - h / 2 + 4)}" width="${w}" height="${h}" rx="16" ${fill('var(--sim-stroke)')}/>`
        + `<rect x="${f1(cx - w / 2)}" y="${f1(cy - h / 2)}" width="${w}" height="${h}" rx="16" ${fill('var(--sim-bg-surface)', 'stroke:var(--sim-stroke);stroke-width:2.5')}/>`;
      const n = cd.icons.length, isz = P ? 58 : 66;
      const ix = P ? cx - w / 2 + 50 : cx, iy = P ? cy : cy - h * 0.2;
      cd.icons.forEach(([nm, tn], j) => {
        const off = n > 1 ? (j - 0.5) * isz * 0.62 : 0;
        c += icon(nm, ix + (P ? 0 : off), iy + (P ? off : 0), n > 1 ? isz * 0.78 : isz, tn);
      });
      const fs = P ? 24 : 23;
      const tx = P ? cx - w / 2 + 96 : cx, anchor = P ? 'start' : 'middle';
      const ty = P ? cy - (cd.t.length - 1) * fs * 0.6 + fs * 0.36 : cy + h * 0.2;
      cd.t.forEach((line, j) => { c += text(tx, ty + j * fs * 1.2, line, fs, 'var(--sim-label)', anchor); });
      svg += `<g class="mk-pop" style="--d:${(0.2 + i * 0.3).toFixed(2)}s">${c}</g>`;
    });
    return { svg, over };
  }

  testState() { return { view: this.stepIndex, shown: this.shown, lit: this.lit, anim: this.anim }; }
}
