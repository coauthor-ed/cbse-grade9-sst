/**
 * ThreeNeedsScene - L05 s04 "Same Money, Three Needs" (3 beats). SvgScene + FinPeople (SimFigure people),
 * design 560 x 490 landscape, 390 x 620 portrait. A student, a parent and a farmer each hold Rs 50,000.
 *   b0 Three people, Rs 50,000 each: a tag over each, the need under the name, and the time horizon big:
 *      "3 months" and "15 years" as bars on one 15-year track, "any day" with a calendar.
 *   b1 Match each one: four place slots (fixed deposit / savings account, bond, mutual fund, shares) as buttons.
 *      Tap a person, then a place: the place shows under the person with a tick (fits) or a cross (does not)
 *      and a two-line reason. Cold start: the solved state (student -> fixed deposit / savings account,
 *      parent -> mutual fund, farmer -> fixed deposit / savings account, read as the savings account).
 *   b2 Is higher risk always best? The parent's Rs 50,000 as one bar: Rs 45,000 in a mutual fund and Rs 5,000
 *      in a savings account "for emergencies" (made-up split); three question chips: what is it for, when is
 *      it needed, can the family bear a loss. The bar grows in on entry; replay.
 * Tokens only. ASCII only.
 */
import { SvgScene, stroke, fill, shade } from 'simulations/base/kit/SimSvg.js';
import { iconSvg } from 'simulations/base/kit/SimIcons.js';
import { MONEY_CSS, TONE, tag, rs } from '../shared/MoneyKit.js';
import { PEOPLE_CSS, personSlot, paintPeople, nameTag, registerCast } from '../shared/FinPeople.js';

registerCast('student', { name: 'Student', series: 4, role: 'student', i: 16,
  look: { outfit: 'shirt', hairStyle: 'short', top: 's4', bottom: 'denim', shoeStyle: 'sneaker', shoe: 'white', pattern: 'plain', moustache: false, dupatta: false, glasses: false, girth: 1 } });
registerCast('parent', { name: 'Parent', series: 7, role: 'adult', i: 17,
  look: { outfit: 'kurti', hairStyle: 'bun', top: 's7', bottom: 'cream', dupatta: true, trim: 'cream', shoeStyle: 'sandal', shoe: 'brown', pattern: 'plain', moustache: false, glasses: false, girth: 1.02 } });
registerCast('farmer', { name: 'Farmer', series: 2, role: 'farmer', i: 18,
  look: { outfit: 'kurta', hairStyle: 'crop', top: 's2', bottom: 'cream', shoeStyle: 'sandal', shoe: 'brown', pattern: 'plain', moustache: true, dupatta: false, glasses: false, girth: 1.05 } });

const f1 = (v) => (+v).toFixed(1);
const MAIN = [[{ idx: 0, dwellMs: null }], [{ idx: 1, dwellMs: null }], [{ idx: 2, dwellMs: null }]];
const EACH = 50000, MF = 45000, SAVE_PART = EACH - MF;      // made-up split: 45,000 + 5,000
const INK = 'var(--sim-label)', MUTED = 'var(--sim-label-muted)', ACC = 'var(--sim-accent)', ACC_INK = shade('var(--sim-accent)', 62);
const GOOD = TONE.save, GOOD_INK = shade(TONE.save, 62), BAD = 'var(--sim-bad)', BAD_INK = shade('var(--sim-bad)', 80);
const PEOPLE = [
  { key: 'student', need: 'fee', hz: '3 months', yrs: 0.25 },
  { key: 'parent', need: "daughter's college", hz: '15 years', yrs: 15 },
  { key: 'farmer', need: 'seeds or medicine', hz: 'any day', yrs: null },
];
const SLOTS = [
  { key: 'safe', l1: 'fixed deposit /', l2: 'savings account', short: 'savings / FD' },
  { key: 'bond', l1: 'bond', short: 'bond' },
  { key: 'mf', l1: 'mutual fund', short: 'mutual fund' },
  { key: 'shares', l1: 'shares', short: 'shares' },
];
// [fits, reason line 1, reason line 2]
const WHY = {
  student: {
    safe: [true, 'Safe, and ready', 'on the fee day.'],
    bond: [false, 'A bond sold early:', "that day's price."],
    mf: [false, 'It may be lower', 'on the fee day.'],
    shares: [false, 'Shares may be below', `${rs(EACH)} on the fee day.`],
  },
  parent: {
    safe: [false, 'Safe, but a low return', 'for fifteen years.'],
    bond: [false, 'Steady, but a lower', 'return over 15 years.'],
    mf: [true, 'Fifteen years to', 'wait out a bad year.'],
    shares: [true, 'Fifteen years to', 'wait out a bad year.'],
  },
  farmer: {
    safe: [true, 'A savings account:', 'cash any morning.'],
    bond: [false, 'A bond must be sold', "first, at that day's price."],
    mf: [false, 'It may be down on', 'the morning he needs cash.'],
    shares: [false, 'Shares may be down on', 'the morning he needs cash.'],
  },
};
const SOLVED = { student: 'safe', parent: 'mf', farmer: 'safe' };

const CSS = `
.tn-ab { position: absolute; transform: translate(-50%, -50%); }
.tn-who { position: absolute; transform: translate(-50%, -100%); background: transparent; border: 3px solid transparent; border-radius: 18px; cursor: pointer; padding: 0; }
.tn-who[aria-pressed="true"] { border-color: var(--sim-accent); background: color-mix(in oklab, var(--sim-accent) 10%, transparent); }
.tn-who:focus-visible { outline: 3px solid var(--sim-accent); outline-offset: 2px; }
.tn-slot { position: absolute; transform: translate(-50%, -50%); display: flex; flex-direction: column; align-items: center; justify-content: center;
  cursor: pointer; padding: 4px 8px; border-radius: calc(14px * var(--look-radius, 1)); font: 800 20px/1.15 var(--sim-font);
  background: var(--sim-bg-surface); color: var(--sim-label); border: 2.5px solid var(--sim-stroke); box-shadow: 0 calc(4px * var(--look-lip, 1)) 0 var(--sim-stroke); }
.tn-slot small { font: 800 18px/1.15 var(--sim-font); }
.tn-slot[aria-disabled="true"] { opacity: 0.8; }
.tn-slot:active { transform: translate(-50%, calc(-50% + 3px)); box-shadow: none; }
.tn-slot:focus-visible { outline: 3px solid var(--sim-accent); outline-offset: 3px; }
.tn-btn { min-height: 48px; padding: 5px 16px; cursor: pointer; white-space: nowrap;
  border-radius: calc(12px * var(--look-radius, 1)); font: 800 19px/1.1 var(--sim-font); background: var(--sim-bg-surface); color: var(--sim-label);
  border: 2.5px solid var(--sim-stroke); box-shadow: 0 calc(3px * var(--look-lip, 1)) 0 var(--sim-stroke); }
.tn-btn:active { transform: translateY(3px); box-shadow: none; }
`;

const text = (x, y, t, size, col = INK, anchor = 'middle', w = 800) =>
  `<text x="${f1(x)}" y="${f1(y)}" text-anchor="${anchor}" style="fill:${col};font:${w} ${size}px var(--sim-font)">${t}</text>`;
const panel = (x, y, w, h, o = {}) => `<rect x="${f1(x)}" y="${f1(y + 4)}" width="${f1(w)}" height="${f1(h)}" rx="14" ${fill('var(--sim-stroke)')}/>`
  + `<rect x="${f1(x)}" y="${f1(y)}" width="${f1(w)}" height="${f1(h)}" rx="14" ${fill(o.bg ?? 'var(--sim-bg-surface)', `stroke:${o.edge ?? 'var(--sim-stroke)'};stroke-width:${o.sw ?? 2.5}`)}/>`;
/** A tick or a cross in a disc, centred on (x, y). */
const mark = (x, y, ok, r = 14) => `<circle cx="${f1(x)}" cy="${f1(y)}" r="${r}" ${fill(ok ? GOOD : BAD, `stroke:${shade(ok ? GOOD : BAD, 62)};stroke-width:2`)}/>`
  + (ok ? `<path d="M${f1(x - r * 0.45)} ${f1(y)}l${f1(r * 0.3)} ${f1(r * 0.35)}l${f1(r * 0.6)} ${f1(-r * 0.7)}" ${stroke('var(--sim-bg-surface)', 3.5, 'fill:none;stroke-linecap:round;stroke-linejoin:round')}/>`
    : `<path d="M${f1(x - r * 0.4)} ${f1(y - r * 0.4)}l${f1(r * 0.8)} ${f1(r * 0.8)}M${f1(x + r * 0.4)} ${f1(y - r * 0.4)}l${f1(-r * 0.8)} ${f1(r * 0.8)}" ${stroke('var(--sim-bg-surface)', 3.5, 'stroke-linecap:round')}/>`);
const icon = (name, x, y, s, tone) => `<g transform="translate(${f1(x - s / 2)} ${f1(y - s / 2)}) scale(${f1(s / 48)})">${iconSvg(name, tone)}</g>`;

export class ThreeNeedsScene extends SvgScene {
  static WIDTH = 560;
  static PORTRAIT_WIDTH = 390;
  static HEIGHT = 490;
  static PORTRAIT_HEIGHT = 620;
  static CONTINUOUS = false;
  static BEAT_STEP_MAP = MAIN;
  static BEAT_MAPS = { 3: MAIN };
  static CONTROLS = [];
  static ARIA_LABEL = 'Three people each hold 50,000 rupees. A student must pay a fee in three months; a parent saves for a daughter\'s college in fifteen years; a farmer may need cash for seeds or medicine any day. Match each to a place: the student fits a fixed deposit or savings account, the parent a mutual fund or shares, the farmer a savings account. Even the parent keeps a small part, made-up 5,000 rupees, in a savings account for emergencies, and 45,000 rupees in a mutual fund.';

  async setup() {
    this.pick = { ...SOLVED };
    this.sel = null;
    this.last = null;
    this.fresh = false;
    await super.setup();
    this._onClick = (e) => {
      const b = e.target?.closest?.('[data-act]');
      if (!b) return;
      const a = b.dataset.act;
      if (a === 'who') { this.sel = this.sel === b.dataset.val ? null : b.dataset.val; this.repaint(); }
      else if (a === 'slot') {
        if (!this.sel) { this.last = { hint: true }; this.repaint(); return; }
        this.pick[this.sel] = b.dataset.val;
        this.last = { who: this.sel, slot: b.dataset.val };
        this.sel = null;
        this.repaint();
      } else if (a === 'replay') this.play();
    };
    this.root.addEventListener('click', this._onClick);
  }

  destroy() {
    this.root?.removeEventListener('click', this._onClick);
    super.destroy();
  }

  css() { return MONEY_CSS + PEOPLE_CSS + CSS; }

  repaint() { super.repaint(); paintPeople(this); }

  clear() { for (const t of (this._timers ?? []).splice(0)) clearTimeout(t); this.fresh = false; }

  enter(step) {
    this.clear();
    this.pick = { ...SOLVED };
    this.sel = null;
    this.last = null;
    if (step === 2) this.after(0.05, () => this.play());
  }

  play() {
    if (this.stepIndex !== 2) return;
    this.clear();
    this.fresh = true;
    this.after(2.0, () => { this.fresh = false; this.repaint(); });
    this.repaint();
  }

  skip() {
    if (!this.fresh) return false;
    this.clear();
    this.repaint();
    return true;
  }

  busy() { return this.fresh; }

  stageHeight(st) { return Math.round((st.portrait ? 620 : 490) * st.W / (st.portrait ? 390 : 560)); }

  paint(st) {
    const P = st.portrait, DW = P ? 390 : 560, DH = P ? 620 : 490, k = (st.W / DW).toFixed(4), v = this.stepIndex;
    const out = v === 1 ? this.paintMatch(P) : v === 2 ? this.paintSplit(P) : this.paintPeople3(P);
    return { svg: `<g transform="scale(${k})">${out.svg}</g>`, over: `<div style="position:absolute;left:0;top:0;width:${DW}px;height:${DH}px;transform:scale(${k});transform-origin:0 0">${out.over ?? ''}</div>` };
  }

  // b0: three people, Rs 50,000 each; their time horizons big.
  paintPeople3(P) {
    let svg = '', over = '';
    const G = P ? { xs: [66, 195, 324], tagY: 52, tagW: 120, feet: 262, h: 140, need: 318, track: [12, 378], tr1: 384, tr2: 450, hzL: 548, cal: 520 }
      : { xs: [96, 280, 464], tagY: 46, tagW: 150, feet: 268, h: 160, need: 326, track: [24, 536], tr1: 372, tr2: 412, hzL: 448, cal: 410 };
    PEOPLE.forEach((p, i) => {
      const x = G.xs[i];
      svg += `<g class="mk-pop" style="--d:${(i * 0.15).toFixed(2)}s">${tag(x, G.tagY, null, EACH, { w: G.tagW, h: G.tagW * 0.4, valueSize: P ? 22 : 26 })}</g>`;
      over += personSlot(p.key, { x, y: G.feet, h: G.h, mood: 'smile', cls: 'mpp-pop', style: `--d:${(i * 0.15).toFixed(2)}s` });
      svg += nameTag(x, G.feet + 4, p.key, P ? 17 : 19);
      if (P) {
        const w = p.need.split(' ');
        const a = w.length > 1 ? w.slice(0, Math.ceil(w.length / 2)).join(' ') : p.need, b = w.length > 1 ? w.slice(Math.ceil(w.length / 2)).join(' ') : '';
        svg += text(x, G.need, a, 17, MUTED, 'middle', 700) + (b ? text(x, G.need + 20, b, 17, MUTED, 'middle', 700) : '');
      } else svg += text(x, G.need, p.need, 19, MUTED, 'middle', 700);
    });
    // horizons: two bars on one 15-year track, and "any day"
    if (P) {
      const [t0, t1] = G.track;
      [[0, G.tr1], [1, G.tr2]].forEach(([i, y]) => {
        const p = PEOPLE[i], col = `var(--sim-series-${i ? 7 : 4})`, w = Math.max(10, (t1 - t0) * p.yrs / 15);
        svg += text(t0, y - 18, `${p.key === 'student' ? 'Student' : 'Parent'}: ${p.hz}`, 24, INK, 'start');
        svg += `<rect x="${t0}" y="${y - 6}" width="${t1 - t0}" height="22" rx="11" ${fill('var(--sim-bg-surface)', 'stroke:var(--sim-stroke);stroke-width:2')}/>`
          + `<rect x="${t0}" y="${y - 6}" width="${f1(w)}" height="22" rx="11" ${fill(col, `stroke:${shade(col, 62)};stroke-width:2`)}/>`;
      });
      svg += icon('calendar', 40, G.cal + 24, 46, 2) + text(74, G.hzL - 6, 'Farmer: any day', 24, INK, 'start');
    } else {
      PEOPLE.forEach((p, i) => {
        const x = G.xs[i], t0 = x - 78, tw = 156, y = G.tr1 + 10, col = `var(--sim-series-${i ? 7 : 4})`;
        if (p.yrs == null) svg += icon('calendar', x, y, 50, 2);
        else {
          svg += `<rect x="${t0}" y="${y - 11}" width="${tw}" height="22" rx="11" ${fill('var(--sim-bg-surface)', 'stroke:var(--sim-stroke);stroke-width:2')}/>`
            + `<rect x="${t0}" y="${y - 11}" width="${f1(Math.max(12, tw * p.yrs / 15))}" height="22" rx="11" ${fill(col, `stroke:${shade(col, 62)};stroke-width:2`)}/>`;
        }
        svg += text(x, G.hzL, p.hz, 30, INK);
      });
      svg += text(280, 482, 'time horizon (bars on one 15-year scale)', 17, MUTED, 'middle', 700);
    }
    return { svg, over };
  }

  // b1: tap a person, then a place; tick or cross with a reason.
  paintMatch(P) {
    let svg = '', over = '';
    const G = P ? { xs: [66, 195, 324], feet: 176, h: 112, chip: 240, slots: [[100, 334, 180], [290, 334, 170], [100, 406, 180], [290, 406, 170]], why: [195, 470], tip: [195, 590] }
      : { xs: [96, 280, 464], feet: 186, h: 130, chip: 244, slots: [[92, 334, 168], [234, 334, 100], [356, 334, 128], [482, 334, 108]], why: [280, 408], tip: [280, 478] };
    PEOPLE.forEach((p, i) => {
      const x = G.xs[i], on = this.sel === p.key, s = this.pick[p.key], w = s ? WHY[p.key][s] : null;
      over += personSlot(p.key, { x, y: G.feet, h: G.h, mood: w && !w[0] ? 'think' : 'smile' });
      svg += nameTag(x, G.feet + 4, p.key, P ? 17 : 19);
      over += `<button type="button" class="sv-hit tn-who" data-act="who" data-val="${p.key}" aria-pressed="${on}" aria-label="${p.key}" style="left:${x}px;top:${G.feet + 30}px;width:${P ? 120 : 150}px;height:${G.h + 40}px"></button>`;
      svg += text(x, G.feet - G.h - 26, p.hz, P ? 18 : 20, MUTED, 'middle', 700);
      if (s) {
        const lab = s === 'safe' ? (p.key === 'farmer' ? 'savings account' : 'fixed deposit') : SLOTS.find((q) => q.key === s).l1;
        if (P) {
          const ws = lab.split(' '), two = ws.length > 1, cw = 124, ch = two ? 52 : 36;
          svg += panel(x - cw / 2, G.chip - 18, cw, ch, { edge: w[0] ? GOOD_INK : BAD, sw: 3 }) + mark(x - cw / 2 + 4, G.chip - 16, w[0], 13);
          svg += two ? text(x + 6, G.chip + 4, ws[0], 17, INK) + text(x + 6, G.chip + 24, ws.slice(1).join(' '), 17, INK) : text(x + 6, G.chip + 7, lab, 17, INK);
        } else {
          const cw = Math.min(176, lab.length * 11 + 48);
          svg += panel(x - cw / 2, G.chip - 18, cw, 36, { edge: w[0] ? GOOD_INK : BAD, sw: 3 })
            + text(x + 12, G.chip + 7, lab, 19, INK) + mark(x - cw / 2 + 4, G.chip, w[0], 13);
        }
      }
    });
    SLOTS.forEach((q, i) => {
      const [x, y, w] = G.slots[i];
      over += `<button type="button" class="sv-hit tn-slot" data-act="slot" data-val="${q.key}" aria-disabled="${!this.sel}" style="left:${x}px;top:${y}px;width:${w}px;min-height:${P ? 62 : 70}px">${q.l2 ? `<small>${q.l1}</small><small>${q.l2}</small>` : q.l1}</button>`;
    });
    // the reason for the last move (or the state at rest)
    const [wx, wy] = G.why;
    if (this.last?.who) {
      const r = WHY[this.last.who][this.last.slot], col = r[0] ? GOOD_INK : BAD_INK;
      svg += mark(P ? 24 : 44, wy + 2, r[0], 16) + text(P ? 48 : 72, wy + 10, r[1], P ? 22 : 24, col, 'start') + text(P ? 48 : 72, wy + 40, r[2], P ? 22 : 24, col, 'start');
    } else if (this.last?.hint) {
      svg += text(wx, wy + 16, 'Tap a person first.', 24, ACC_INK);
    } else {
      const all = PEOPLE.every((p) => this.pick[p.key] && WHY[p.key][this.pick[p.key]][0]);
      svg += text(wx, wy + 16, all ? 'All three fit their dates.' : 'Tap a person, then a place.', P ? 22 : 24, all ? GOOD_INK : INK);
    }
    svg += text(G.tip[0], G.tip[1], this.sel ? `now tap a place for the ${this.sel}` : 'tap a person, then a place', P ? 19 : 19, this.sel ? ACC_INK : MUTED, 'middle', 700);
    return { svg, over };
  }

  // b2: the parent's Rs 50,000: most in a mutual fund, a small part kept for emergencies.
  paintSplit(P) {
    let svg = '', over = '';
    const G = P ? { pp: [70, 206, 150], bar: [20, 260, 350, 74], qs: [[195, 512], [195, 554], [195, 596]], title: [140, 50] }
      : { pp: [86, 300, 180], bar: [176, 120, 370, 84], qs: [[350, 384], [350, 426], [350, 468]], title: [176, 50] };
    over += personSlot('parent', { x: G.pp[0], y: G.pp[1], h: G.pp[2], mood: 'smile', facing: P ? 0 : 1 });
    svg += nameTag(G.pp[0], G.pp[1] + 4, 'parent', 19);
    const [bx, by, bw, bh] = G.bar, wm = bw * MF / EACH, ws = bw - wm;
    svg += text(P ? 360 : G.title[0], P ? 60 : G.title[1], `the parent's ${rs(EACH)}`, P ? 24 : 26, INK, P ? 'end' : 'start');
    svg += text(P ? 360 : G.title[0], P ? 88 : G.title[1] + 30, 'made-up split', 19, MUTED, P ? 'end' : 'start', 700);
    const MFC = 'var(--sim-series-7)', SVC = TONE.save;
    svg += `<rect x="${bx}" y="${by + 4}" width="${bw}" height="${bh}" rx="14" ${fill('var(--sim-stroke)')}/>`;
    svg += `<g${this.fresh ? ' class="mk-grow"' : ''}><rect x="${bx}" y="${by}" width="${f1(wm)}" height="${bh}" rx="14" ${fill(MFC, `stroke:${shade(MFC, 62)};stroke-width:2.5`)}/></g>`;
    svg += `<g${this.fresh ? ' class="mk-pop" style="--d:0.7s"' : ''}><rect x="${f1(bx + wm + 3)}" y="${by}" width="${f1(ws - 3)}" height="${bh}" rx="10" ${fill(SVC, `stroke:${shade(SVC, 62)};stroke-width:2.5`)}/></g>`;
    svg += text(bx + 16, by + bh / 2 - 4, 'mutual fund', 21, 'var(--sim-ink-on-7, var(--sim-bg-deep))', 'start') + text(bx + 16, by + bh / 2 + 26, rs(MF), 28, 'var(--sim-ink-on-7, var(--sim-bg-deep))', 'start');
    // the small part, named below the bar with a leader
    const sx = bx + wm + ws / 2;
    svg += `<g${this.fresh ? ' class="mk-pop" style="--d:1.0s"' : ''}><path d="M${f1(sx)} ${by + bh + 4}V${by + bh + 30}" ${stroke(shade(SVC, 62), 3)}/>`
      + text(bx + bw, by + bh + 62, `${rs(SAVE_PART)} in a savings account`, P ? 21 : 22, INK, 'end')
      + text(bx + bw, by + bh + 92, 'for emergencies', P ? 26 : 28, GOOD_INK, 'end') + '</g>';
    // three questions
    const qs = ['What is it for?', 'When is it needed?', 'Can the family bear a loss?'];
    svg += text(P ? 195 : 350, P ? 474 : 346, 'Ask three questions:', 20, MUTED, 'middle', 700);
    qs.forEach((q, i) => {
      const [x, y] = G.qs[i], w = q.length * 11.2 + 34;
      const cx = P ? x : (i === 1 ? x : x);
      svg += `<g${this.fresh ? ` class="mk-pop" style="--d:${(1.3 + i * 0.15).toFixed(2)}s"` : ''}><rect x="${f1(cx - w / 2)}" y="${y - 19}" width="${f1(w)}" height="38" rx="19" ${fill('color-mix(in oklab, var(--sim-accent) 16%, var(--sim-bg-surface))', 'stroke:var(--sim-accent);stroke-width:2.5')}/>`
        + text(cx, y + 7, q, 20, ACC_INK) + '</g>';
    });
    if (!this.fresh) over += `<div class="tn-ab" style="left:${P ? 320 : 86}px;top:${P ? 200 : 380}px"><button type="button" class="sv-hit tn-btn" data-act="replay">replay</button></div>`;
    return { svg, over };
  }

  testState() { return { view: this.stepIndex, pick: { ...this.pick }, sel: this.sel, last: this.last, fresh: this.fresh }; }
}
