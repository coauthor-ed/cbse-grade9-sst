/**
 * BudgetStepsScene - L01 s05 "A Budget in Four Steps" (3 beats). SvgScene, design 560 x 506 landscape,
 * 390 x 600 portrait. Icons from SimIcons; the bicycle from shared/MoneyKit.js.
 *   b0 Four steps: a ring of four big step cards (1 identify expenses, 2 set a savings goal, 3 track spending,
 *      4 review and adjust), arrows round the ring, "every month" in the middle. "try it" empties the ring and puts
 *      the four cards, shuffled (Math.random), in a tray; tap them in order. A wrong tap shakes the card and shows
 *      one short reason. Cold start: the ring complete with the "try it" button.
 *   b1 A goal you can check: the ring small (left; portrait above), step 2 lit. A goal card with four rows:
 *      what / how much / by when / what steps -> bicycle / Rs 3,000 / 6 months / Rs 500 a month, the bicycle drawn.
 *      Four chips for the other goals: school trip, sports kit, higher studies, emergencies.
 *   b2 Review and adjust: the ring again; the arrow from step 4 back to step 1 lights and draws once (1.5 s) with
 *      "next month's plan"; steps 2 and 3 dimmed. Two crossed-out tags: "eating out", "impulse buy".
 * Colours are tokens only. ASCII only.
 */
import { SvgScene, stroke, fill, shade, tone, inkVar } from 'simulations/base/kit/SimSvg.js';
import { iconSvg } from 'simulations/base/kit/SimIcons.js';
import { MONEY_CSS, TONE, bicycle, rs } from '../shared/MoneyKit.js';

const f1 = (v) => (+v).toFixed(1);
const MAIN = [[{ idx: 0, dwellMs: null }], [{ idx: 1, dwellMs: null }], [{ idx: 2, dwellMs: null }]];
const STEPS = [
  { l: ['identify', 'expenses'], icon: 'scroll', t: 1 },
  { l: ['set a', 'savings goal'], icon: 'coin', t: 3 },
  { l: ['track', 'spending'], icon: 'eye', t: 7 },
  { l: ['review and', 'adjust'], icon: 'calendar', t: 4 },
];
const WHY = [
  'First list what the month must pay for.',
  'Next decide how much to keep aside, before spending.',
  'Now check each payment against the plan.',
  'Last, compare the plan with what happened.',
];
const GOALS = ['school trip', 'sports kit', 'higher studies', 'emergencies'];

function shuffled(a) {
  const r = a.slice();
  for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; }
  return r;
}

const CSS = `
.bst-ab { position: absolute; transform: translate(-50%, -50%); }
.bst-btn { min-height: 48px; padding: 5px 22px; cursor: pointer; white-space: nowrap;
  border-radius: calc(12px * var(--look-radius, 1)); font: 800 21px/1.1 var(--sim-font); background: var(--sim-accent); color: var(--sim-bg-deep);
  border: 2.5px solid color-mix(in oklab, var(--sim-accent) 65%, black); box-shadow: 0 calc(3px * var(--look-lip, 1)) 0 color-mix(in oklab, var(--sim-accent) 60%, black); }
.bst-card { position: absolute; display: flex; align-items: center; gap: 10px; padding: 6px 12px; cursor: pointer; text-align: left;
  border-radius: calc(14px * var(--look-radius, 1)); font: 800 21px/1.15 var(--sim-font); color: var(--sim-label);
  background: var(--sim-bg-surface); border: 2.5px solid var(--sim-stroke); box-shadow: 0 calc(4px * var(--look-lip, 1)) 0 var(--sim-stroke); }
.bst-card .sim-icon { width: 38px; height: 38px; flex: none; }
.bst-btn:active, .bst-card:active { transform: translateY(3px); box-shadow: none; }
.bst-btn:focus-visible, .bst-card:focus-visible { outline: 3px solid var(--sim-accent); outline-offset: 3px; }
.bst-card[data-bad="1"] { border-color: var(--sim-bad); animation: bst-shake 0.45s ease both; }
@keyframes bst-shake { 20% { translate: -9px 0; } 40% { translate: 8px 0; } 60% { translate: -6px 0; } 80% { translate: 4px 0; } }
.bst-why { position: absolute; transform: translateX(-50%); text-align: center; font: 800 21px/1.25 var(--sim-font); color: var(--sim-bad); }
.bst-why[data-ok="1"] { color: var(--sim-good); }
@media (prefers-reduced-motion: reduce) { .bst-card[data-bad="1"] { animation: none; } }
`;

const text = (x, y, t, size, col = 'var(--sim-label)', anchor = 'middle', w = 800) =>
  `<text x="${f1(x)}" y="${f1(y)}" text-anchor="${anchor}" style="fill:${col};font:${w} ${size}px var(--sim-font)">${t}</text>`;
const icon = (name, x, y, s, t) => iconSvg(name, t).replace('width="48" height="48"', `x="${f1(x)}" y="${f1(y)}" width="${s}" height="${s}"`);

/** Geometry of a ring of four cards: slots 0..3 clockwise from the top left. */
function ringGeo(x0, y0, w, h, gx, gy) {
  const slots = [[x0, y0], [x0 + w + gx, y0], [x0 + w + gx, y0 + h + gy], [x0, y0 + h + gy]];
  const cxL = x0 + w / 2, cxR = x0 + w + gx + w / 2, cyT = y0 + h / 2, cyB = y0 + h + gy + h / 2;
  const xm1 = x0 + w, xm2 = x0 + w + gx, ym1 = y0 + h, ym2 = y0 + h + gy;
  // the four links between the cards, as [x1, y1, x2, y2]
  const links = [[xm1 + 3, cyT, xm2 - 3, cyT], [cxR, ym1 + 6, cxR, ym2 - 3], [xm2 - 3, cyB, xm1 + 3, cyB], [cxL, ym2 - 6, cxL, ym1 + 3]];
  return { slots, w, h, links, mid: [(x0 + xm2 + w) / 2, (ym1 + ym2) / 2] };
}

function arrow([x1, y1, x2, y2], col, wd, o = {}) {
  const a = Math.atan2(y2 - y1, x2 - x1), hl = wd * 2.6, hw = wd * 1.9;
  const bx = x2 - Math.cos(a) * hl, by = y2 - Math.sin(a) * hl;
  const nx = -Math.sin(a) * hw, ny = Math.cos(a) * hw, len = Math.hypot(bx - x1, by - y1);
  const line = o.draw
    ? `class="sv-draw" style="fill:none;stroke:${col};stroke-width:${wd};stroke-linecap:round;--len:${f1(len)};--dur:${o.draw}s"`
    : stroke(col, wd);
  return `<g${o.dim ? ' style="opacity:0.3"' : ''}><path d="M${f1(x1)} ${f1(y1)}L${f1(bx)} ${f1(by)}" ${line}/>`
    + `<path d="M${f1(x2)} ${f1(y2)}L${f1(bx + nx)} ${f1(by + ny)}L${f1(bx - nx)} ${f1(by - ny)}Z" ${fill(col)}${o.draw ? ` class="mk-pop" style="--d:${(o.draw - 0.2).toFixed(2)}s"` : ''}/></g>`;
}

/** One step card at (x, y). o: small, dim, lit, empty (a dashed slot with the number), pop, fs. */
function stepCard(i, x, y, w, h, o = {}) {
  const s = STEPS[i], col = tone(s.t), rim = shade(col, 64);
  if (o.empty) {
    return `<rect x="${f1(x)}" y="${f1(y)}" width="${w}" height="${h}" rx="16" ${fill('none', 'stroke:var(--sim-stroke);stroke-width:2.5;stroke-dasharray:8 7')}/>`
      + text(x + w / 2, y + h / 2 + 12, String(i + 1), 34, 'var(--sim-label-muted)');
  }
  const br = o.small ? 15 : 19, bx = x + br + 10, by = o.small ? y + h / 2 : y + br + 9;
  let g = `<rect x="${f1(x)}" y="${f1(y + 4)}" width="${w}" height="${h}" rx="16" ${fill(rim)}/>`
    + `<rect x="${f1(x)}" y="${f1(y)}" width="${w}" height="${h}" rx="16" ${fill(`color-mix(in oklab, ${col} 22%, var(--sim-bg-surface))`, `stroke:${o.lit ? 'var(--sim-accent)' : rim};stroke-width:${o.lit ? 5 : 3}`)}/>`
    + `<circle cx="${f1(bx)}" cy="${f1(by)}" r="${br}" ${fill(col, `stroke:${rim};stroke-width:2.5`)}/>`
    + text(bx, by + br * 0.42, String(i + 1), br * 1.25, inkVar(s.t));
  const is = o.small ? Math.min(h - 18, 36) : 44;
  g += icon(s.icon, o.small ? x + w - is - 8 : x + w - is - 10, o.small ? y + (h - is) / 2 : y + 7, is, s.t);
  if (!o.small) {
    const fs = o.fs ?? 23;
    g += text(x + 14, y + h - 12 - fs * 1.4, s.l[0], fs, 'var(--sim-label)', 'start') + text(x + 14, y + h - 12, s.l[1], fs, 'var(--sim-label)', 'start');
  }
  const cls = o.pop ? ' class="mk-pop"' : '';
  return `<g${cls}${o.dim ? ' style="opacity:0.3"' : ''}>${g}</g>`;
}

export class BudgetStepsScene extends SvgScene {
  static WIDTH = 560;
  static PORTRAIT_WIDTH = 390;
  static HEIGHT = 506;
  static PORTRAIT_HEIGHT = 600;
  static CONTINUOUS = false;
  static BEAT_STEP_MAP = MAIN;
  static BEAT_MAPS = { 3: MAIN };
  static CONTROLS = [];
  static ARIA_LABEL = 'A budget in four steps that go round in a ring every month: 1 identify expenses, 2 set a savings goal, 3 track spending, 4 review and adjust. Meera\'s goal answers four questions: a bicycle, 3,000 rupees, in six months, 500 rupees kept aside every month. The last step leads back to the first: what she learns this month changes next month\'s plan.';

  async setup() {
    this.resetRing();
    await super.setup();
    this.root.addEventListener('click', this._onClick = (e) => {
      const b = e.target?.closest?.('[data-act]');
      if (!b) return;
      if (b.dataset.act === 'try') this.startTry();
      else if (b.dataset.act === 'card') this.tapCard(Number(b.dataset.i));
    });
  }

  destroy() {
    this.root?.removeEventListener('click', this._onClick);
    super.destroy();
  }

  css() { return MONEY_CSS + CSS; }

  resetRing() { this.playing = false; this.placed = 4; this.tray = [0, 1, 2, 3]; this.bad = -1; this.why = ''; this.fresh = -1; }

  enter() { this.resetRing(); }

  startTry() {
    if (this.stepIndex !== 0) return;
    this.playing = true;
    this.placed = 0;
    this.tray = shuffled([0, 1, 2, 3]);
    this.bad = -1;
    this.why = '';
    this.fresh = -1;
    this.repaint();
  }

  tapCard(i) {
    if (!this.playing || i < this.placed) return;
    if (i === this.placed) {
      this.placed++;
      this.fresh = i;
      this.bad = -1;
      this.why = '';
      if (this.placed === 4) {
        this.playing = false;
        this.why = 'The ring is complete.';
        this.repaint();
        const g = this.geo(this.sv.portrait);
        this.celebrate(g.mid[0], g.mid[1]);
      } else this.repaint();
      this.fresh = -1;
      return;
    }
    this.bad = i;
    this.why = WHY[this.placed];
    this.repaint();
    this.bad = -1;
  }

  geo(P) { return P ? ringGeo(14, 12, 170, 106, 22, 56) : ringGeo(24, 12, 236, 112, 40, 70); }

  stageHeight(st) { return Math.round((st.portrait ? 600 : 506) * st.W / (st.portrait ? 390 : 560)); }

  paint(st) {
    const P = st.portrait, DW = P ? 390 : 560, DH = P ? 600 : 506, k = (st.W / DW).toFixed(4), v = this.stepIndex;
    const out = v === 1 ? this.paintGoal(P) : this.paintRing(P, v === 2);
    return { svg: `<g transform="scale(${k})">${out.svg}</g>`, over: `<div style="position:absolute;left:0;top:0;width:${DW}px;height:${DH}px;transform:scale(${k});transform-origin:0 0">${out.over ?? ''}</div>` };
  }

  // b0 and b2: the full ring.
  paintRing(P, review) {
    const g = this.geo(P), fs = P ? 21 : 23;
    let svg = '', over = '';
    const done = review || !this.playing ? 4 : this.placed;
    g.links.forEach((ln, j) => {
      if (review && j === 3) return;
      const on = review ? false : j < done - 1 || (done === 4);
      svg += arrow(ln, on ? 'var(--sim-label)' : 'var(--sim-stroke)', P ? 5 : 6, { dim: review || !on });
    });
    for (let i = 0; i < 4; i++) {
      const [x, y] = g.slots[i];
      if (i >= done) svg += stepCard(i, x, y, g.w, g.h, { empty: true });
      else svg += stepCard(i, x, y, g.w, g.h, { fs, pop: this.fresh === i, dim: review && (i === 1 || i === 2), lit: review && i === 0 });
    }
    const [mx, my] = g.mid;
    if (review) {
      // step 4 -> step 1: the loop that makes next month's plan
      const ln = g.links[3];
      svg += arrow([ln[0], ln[1] + 4, ln[2], ln[3] - 2], 'var(--sim-accent)', P ? 8 : 9, { draw: 1.5 });
      if (P) svg += text(mx, my - 6, 'next month\'s', 21, 'var(--sim-accent)') + text(mx, my + 23, 'plan', 21, 'var(--sim-accent)');
      else svg += text(g.links[3][0] + 26, my + 8, 'next month\'s plan', 23, 'var(--sim-accent)', 'start');
      const ty = P ? 300 : 350;
      svg += text(P ? 195 : 280, ty, 'not in the plan', 20, 'var(--sim-label-muted)', 'middle', 700);
      const tw = P ? 168 : 200, gap = P ? 16 : 40, cx = P ? 195 : 280;
      [['eating out', cx - tw / 2 - gap / 2], ['impulse buy', cx + tw / 2 + gap / 2]].forEach(([t, x], j) => {
        const y = ty + 52;
        svg += `<g class="mk-pop" style="--d:${(1.6 + j * 0.3).toFixed(1)}s"><rect x="${f1(x - tw / 2)}" y="${f1(y - 28 + 4)}" width="${tw}" height="56" rx="14" ${fill(shade(TONE.want, 64))}/>`
          + `<rect x="${f1(x - tw / 2)}" y="${f1(y - 28)}" width="${tw}" height="56" rx="14" ${fill(`color-mix(in oklab, ${TONE.want} 22%, var(--sim-bg-surface))`, `stroke:${shade(TONE.want, 64)};stroke-width:2.5`)}/>`
          + text(x, y + 8, t, P ? 21 : 23, 'var(--sim-label)')
          + `<path d="M${f1(x - tw / 2 + 10)} ${f1(y + 18)}L${f1(x + tw / 2 - 10)} ${f1(y - 18)}" ${stroke('var(--sim-bad)', 5)}/></g>`;
      });
      return { svg };
    }
    if (!this.playing) svg += text(mx, my + 8, 'every month', P ? 20 : 23, 'var(--sim-label-muted)');
    if (this.playing) {
      // the tray: the cards not yet placed, in their shuffled order (positions stay put)
      const tw = P ? 180 : 262, th = P ? 66 : 58, xs = P ? [105, 285] : [151, 409], ys = P ? [296, 372] : [358, 424];
      this.tray.forEach((i, j) => {
        if (i < this.placed) return;
        const s = STEPS[i], x = xs[j % 2], y = ys[Math.floor(j / 2)];
        over += `<button type="button" class="sv-hit bst-card" data-act="card" data-i="${i}"${this.bad === i ? ' data-bad="1"' : ''} style="left:${x - tw / 2}px;top:${y - th / 2}px;width:${tw}px;height:${th}px">${iconSvg(s.icon, s.t)}<span>${s.l.join(' ')}</span></button>`;
      });
    } else {
      over += `<div class="bst-ab" style="left:${P ? 195 : 280}px;top:${P ? 330 : 392}px"><button type="button" class="sv-hit bst-btn" data-act="try">${this.why ? 'try again' : 'try it'}</button></div>`;
    }
    if (this.why) over += `<div class="bst-why"${this.placed === 4 ? ' data-ok="1"' : ''} style="left:${P ? 195 : 280}px;top:${P ? 448 : 456}px;width:${P ? 360 : 540}px">${this.why}</div>`;
    else if (this.playing) over += `<div class="bst-why" style="left:${P ? 195 : 280}px;top:${P ? 448 : 456}px;width:${P ? 360 : 540}px;color:var(--sim-label-muted)">Tap the step that comes ${['first', 'second', 'third', 'last'][this.placed]}.</div>`;
    return { svg, over };
  }

  // b1: the small ring with step 2 lit, Meera's goal card, the other goals.
  paintGoal(P) {
    let svg = '';
    const g = P ? ringGeo(110, 10, 76, 56, 18, 18) : ringGeo(14, 20, 88, 64, 16, 22);
    g.links.forEach((ln) => { svg += arrow(ln, 'var(--sim-stroke)', 4, { dim: true }); });
    for (let i = 0; i < 4; i++) svg += stepCard(i, g.slots[i][0], g.slots[i][1], g.w, g.h, { small: true, dim: i !== 1, lit: i === 1 });
    if (!P) {
      svg += text(14, 214, 'step 2', 20, 'var(--sim-label-muted)', 'start', 700);
      svg += text(14, 244, 'set a', 24, 'var(--sim-label)', 'start') + text(14, 277, 'savings goal', 24, shade(TONE.save, 72), 'start');
    }
    const C = P ? { x: 14, y: 156, w: 362, bike: [195, 268, 136], row0: 304, rh: 40, vs: 24 }
      : { x: 226, y: 16, w: 322, bike: [387, 164, 150], row0: 206, rh: 46, vs: 26 };
    const col = TONE.save, rim = shade(col, 64), ch = C.row0 - C.y + C.rh * 4 - 8;
    svg += `<rect x="${C.x}" y="${C.y + 4}" width="${C.w}" height="${ch}" rx="18" ${fill(rim)}/>`
      + `<rect x="${C.x}" y="${C.y}" width="${C.w}" height="${ch}" rx="18" ${fill('var(--sim-bg-surface)', `stroke:${rim};stroke-width:3`)}/>`
      + `<path d="M${C.x} ${C.y + 44}V${C.y + 18}Q${C.x} ${C.y} ${C.x + 18} ${C.y}H${C.x + C.w - 18}Q${C.x + C.w} ${C.y} ${C.x + C.w} ${C.y + 18}V${C.y + 44}Z" ${fill(`color-mix(in oklab, ${col} 45%, var(--sim-bg-surface))`)}/>`
      + text(C.x + C.w / 2, C.y + 31, 'Meera\'s savings goal', P ? 22 : 23);
    svg += `<g class="mk-pop" style="--d:0.1s">${bicycle(C.bike[0], C.bike[1], C.bike[2])}</g>`;
    const rows = [['what', 'bicycle'], ['how much', rs(3000)], ['by when', '6 months'], ['what steps', `${rs(500)} a month`]];
    rows.forEach(([q, a], j) => {
      const y = C.row0 + j * C.rh;
      if (j) svg += `<path d="M${C.x + 14} ${f1(y - C.rh * 0.62)}H${C.x + C.w - 14}" ${stroke('var(--sim-stroke)', 1.5, 'opacity:0.6')}/>`;
      svg += `<g class="mk-pop" style="--d:${(0.4 + j * 0.45).toFixed(2)}s">${text(C.x + 16, y, q, 20, 'var(--sim-label-muted)', 'start', 700)}${text(C.x + C.w - 16, y, a, C.vs, j === 3 ? shade(col, 72) : 'var(--sim-label)', 'end')}</g>`;
    });
    // other goals: four chips
    const oy = P ? 488 : 410, cw = P ? 176 : 186, cxs = P ? [102, 288] : [253, 455], rws = P ? [522, 568] : [412, 462];
    svg += P ? text(14, oy, 'other goals', 20, 'var(--sim-label-muted)', 'start', 700) : text(14, 444, 'other goals', 22, 'var(--sim-label-muted)', 'start', 700);
    GOALS.forEach((t, j) => {
      const x = cxs[j % 2], y = rws[Math.floor(j / 2)];
      svg += `<g class="mk-pop" style="--d:${(2.4 + j * 0.15).toFixed(2)}s"><rect x="${f1(x - cw / 2)}" y="${y - 20}" width="${cw}" height="40" rx="20" ${fill(`color-mix(in oklab, ${col} 16%, var(--sim-bg-surface))`, `stroke:${rim};stroke-width:2`)}/>`
        + text(x, y + 7, t, 20, 'var(--sim-label)', 'middle', 700) + '</g>';
    });
    return { svg };
  }

  testState() { return { view: this.stepIndex, playing: this.playing, placed: this.placed, tray: this.tray, why: this.why }; }
}
