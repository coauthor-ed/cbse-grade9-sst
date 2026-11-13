/**
 * MonthBoardScene - L01 s06 "Meera's Month" (3 beats). SvgScene, design 560 x 494 landscape, 390 x 616 portrait.
 * Cast: shared/MoneyKit.js (TONE, bicycle, rs). Made-up numbers, from STORYBOARD section 0.
 *   b0 One month on the board: "comes in Rs 1,500" over five rows with bars: savings 500 (save colour, first),
 *      bus 300, stationery 200, lunch 300 (need colour + the word "need"), snacks 200 (want colour + "want"). The
 *      rows fill in order, savings first, 0.5 s each; then "total Rs 1,500" with a check. Replay in the figure.
 *   b1 Month 4: bus grows 300 -> 350 and the total turns to Rs 1,550, "Rs 50 over" (warning colour); then snacks
 *      shrink 200 -> 150 and the total is back to Rs 1,500 with the check; savings has a lock and never moves.
 *      Cold start: the rest state (bus 350, snacks 150, balanced) with the old values struck through. Replay.
 *   b2 The racket breaks: a racket and "restring Rs 300"; three cards: cut back / use savings / borrow from
 *      parents. The month-4 board gets a "racket" row. Tap a card: cut back = snacks 0, racket 150, "Rs 150 a
 *      month x 2 months = Rs 300"; use savings = savings 500 -> 200, racket 300, "bicycle later"; borrow =
 *      comes in Rs 1,500 + Rs 300, racket 300, "next month: pay back Rs 300". No card is marked right or wrong.
 *      Cold start: no card chosen (racket row "?").
 * Colours are tokens only. ASCII only.
 */
import { SvgScene, stroke, fill, shade } from 'simulations/base/kit/SimSvg.js';
import { iconSvg } from 'simulations/base/kit/SimIcons.js';
import { MONEY_CSS, TONE, bicycle, rs } from '../shared/MoneyKit.js';

const f1 = (v) => (+v).toFixed(1);
const MAIN = [[{ idx: 0, dwellMs: null }], [{ idx: 1, dwellMs: null }], [{ idx: 2, dwellMs: null }]];
const ROWS = [
  { k: 'savings', t: 'save', w: 'save', m1: 500, m4: 500 },
  { k: 'bus', t: 'need', w: 'need', m1: 300, m4: 350 },
  { k: 'stationery', t: 'need', w: 'need', m1: 200, m4: 200 },
  { k: 'lunch', t: 'need', w: 'need', m1: 300, m4: 300 },
  { k: 'snacks', t: 'want', w: 'want', m1: 200, m4: 150 },
];
const CARDS = [['cut', 'cut back'], ['save', 'use savings'], ['borrow', 'borrow from parents']];

const CSS = `
.mb-ab { position: absolute; transform: translate(-50%, -50%); }
.mb-btn { min-height: 46px; padding: 5px 18px; cursor: pointer; white-space: nowrap;
  border-radius: calc(12px * var(--look-radius, 1)); font: 800 20px/1.1 var(--sim-font); background: var(--sim-bg-surface); color: var(--sim-label);
  border: 2.5px solid var(--sim-stroke); box-shadow: 0 calc(3px * var(--look-lip, 1)) 0 var(--sim-stroke); }
.mb-card { position: absolute; cursor: pointer; padding: 4px 10px; text-align: center;
  border-radius: calc(14px * var(--look-radius, 1)); font: 800 21px/1.12 var(--sim-font); color: var(--sim-label);
  background: var(--sim-bg-surface); border: 2.5px solid var(--sim-stroke); box-shadow: 0 calc(4px * var(--look-lip, 1)) 0 var(--sim-stroke); }
.mb-card[aria-pressed="true"] { border: 4px solid var(--sim-accent); background: color-mix(in oklab, var(--sim-accent) 16%, var(--sim-bg-surface)); }
.mb-btn:active, .mb-card:active { transform: translateY(3px); box-shadow: none; }
.mb-btn:focus-visible, .mb-card:focus-visible { outline: 3px solid var(--sim-accent); outline-offset: 3px; }
svg .mb-in { animation: mb-in 0.3s ease both; animation-delay: var(--d, 0s); }
@keyframes mb-in { from { opacity: 0; } to { opacity: 1; } }
svg .mb-out { animation: mb-out 0.3s ease both; animation-delay: var(--d, 0s); }
@keyframes mb-out { from { opacity: 1; } to { opacity: 0; } }
svg .mb-shrink { transform-box: fill-box; transform-origin: left center; animation: mb-shrink 0.6s ease-in both; animation-delay: var(--d, 0s); }
@keyframes mb-shrink { from { transform: none; } to { transform: scaleX(0); } }
@media (prefers-reduced-motion: reduce) { svg .mb-in, svg .mb-out, svg .mb-shrink { animation-duration: 0.01s; } }
`;

const text = (x, y, t, size, col = 'var(--sim-label)', anchor = 'middle', w = 800) =>
  `<text x="${f1(x)}" y="${f1(y)}" text-anchor="${anchor}" style="fill:${col};font:${w} ${size}px var(--sim-font)">${t}</text>`;
const icon = (name, x, y, s, t) => iconSvg(name, t).replace('width="48" height="48"', `x="${f1(x)}" y="${f1(y)}" width="${s}" height="${s}"`);
const anim = (cls, d, body) => `<g class="${cls}" style="--d:${d.toFixed(2)}s">${body}</g>`;

/** A value struck through (an old amount). */
function struck(x, y, t, size, anchor = 'end') {
  const w = String(t).length * size * 0.56, x0 = anchor === 'end' ? x - w : x;
  return text(x, y, t, size, 'var(--sim-label-muted)', anchor, 700)
    + `<path d="M${f1(x0 - 2)} ${f1(y - size * 0.32)}H${f1(x0 + w + 2)}" ${stroke('var(--sim-bad)', 3)}/>`;
}

/** The need / want / save word in a small chip of its colour (never colour alone). */
function word(x, y, w, t, fs = 20) {
  const col = TONE[t], ww = w.length * fs * 0.6 + 18;
  return `<rect x="${f1(x)}" y="${f1(y)}" width="${f1(ww)}" height="${fs + 9}" rx="${(fs + 9) / 2}" ${fill(`color-mix(in oklab, ${col} 45%, var(--sim-bg-surface))`, `stroke:${shade(col, 64)};stroke-width:2`)}/>`
    + text(x + ww / 2, y + fs * 0.98, w, fs, 'var(--sim-label)', 'middle', 800);
}

function bar(x, y, w, h, t, extra = '') {
  const col = TONE[t], rim = shade(col, 64);
  if (w <= 0) return `<rect x="${f1(x)}" y="${f1(y)}" width="${f1(h * 1.4)}" height="${h}" rx="10" ${fill('none', 'stroke:var(--sim-stroke);stroke-width:2.5;stroke-dasharray:6 6')}/>`;
  return `<rect x="${f1(x)}" y="${f1(y + 3)}" width="${f1(w)}" height="${h}" rx="10" ${fill(rim)}${extra}/>`
    + `<rect x="${f1(x)}" y="${f1(y)}" width="${f1(w)}" height="${h}" rx="10" ${fill(`color-mix(in oklab, ${col} 55%, var(--sim-bg-surface))`, `stroke:${rim};stroke-width:2.5`)}${extra}/>`;
}

function lock(x, y, s = 22) {
  return `<path d="M${f1(x - s * 0.3)} ${f1(y - s * 0.35)}V${f1(y - s * 0.6)}a${f1(s * 0.3)} ${f1(s * 0.3)} 0 0 1 ${f1(s * 0.6)} 0V${f1(y - s * 0.35)}" ${stroke('var(--sim-label)', 3.5)}/>`
    + `<rect x="${f1(x - s * 0.45)}" y="${f1(y - s * 0.4)}" width="${f1(s * 0.9)}" height="${f1(s * 0.75)}" rx="4" ${fill('var(--sim-label)')}/>`;
}

function check(x, y, r = 17) {
  return `<circle cx="${f1(x)}" cy="${f1(y)}" r="${r}" ${fill('var(--sim-good)')}/>`
    + `<path d="M${f1(x - r * 0.45)} ${f1(y)}l${f1(r * 0.32)} ${f1(r * 0.34)}l${f1(r * 0.6)} ${f1(-r * 0.7)}" ${stroke('var(--sim-bg-deep)', 4)}/>`;
}

/** A badminton racket, head up and leaning right; strings broken in the middle. (x, y) = the head's centre. */
function racket(x, y, s, rot = 28) {
  const frame = 'var(--sim-series-6)', rim = shade(frame, 62), rx = s * 0.3, ry = s * 0.38;
  let g = `<g transform="translate(${f1(x)} ${f1(y)}) rotate(${rot})">`
    + `<path d="M0 ${f1(ry)}V${f1(ry + s * 0.62)}" ${stroke(rim, s * 0.07)}/>`
    + `<path d="M0 ${f1(ry + s * 0.42)}V${f1(ry + s * 0.7)}" ${stroke('var(--sim-label)', s * 0.11)}/>`;
  for (let i = -2; i <= 2; i++) {
    const xx = i * rx * 0.36, hh = ry * Math.sqrt(1 - (xx / rx) ** 2) * 0.92;
    g += i === 0 ? `<path d="M${f1(xx)} ${f1(-hh)}V${f1(-hh * 0.15)}M${f1(xx + 4)} ${f1(hh * 0.25)}V${f1(hh)}" ${stroke('var(--sim-bad)', 2.4)}/>`
      : `<path d="M${f1(xx)} ${f1(-hh)}V${f1(hh)}" ${stroke('var(--sim-label-muted)', 1.8)}/>`;
  }
  for (let j = -3; j <= 3; j++) {
    const yy = j * ry * 0.27, ww = rx * Math.sqrt(1 - (yy / ry) ** 2) * 0.92;
    g += j === 0 ? `<path d="M${f1(-ww)} ${f1(yy)}H${f1(-ww * 0.2)}M${f1(ww * 0.3)} ${f1(yy + 3)}H${f1(ww)}" ${stroke('var(--sim-bad)', 2.4)}/>`
      : `<path d="M${f1(-ww)} ${f1(yy)}H${f1(ww)}" ${stroke('var(--sim-label-muted)', 1.8)}/>`;
  }
  g += `<ellipse cx="0" cy="0" rx="${f1(rx)}" ry="${f1(ry)}" ${stroke(rim, s * 0.09)}/><ellipse cx="0" cy="0" rx="${f1(rx)}" ry="${f1(ry)}" ${stroke(frame, s * 0.055)}/></g>`;
  return g;
}

export class MonthBoardScene extends SvgScene {
  static WIDTH = 560;
  static PORTRAIT_WIDTH = 390;
  static HEIGHT = 494;
  static PORTRAIT_HEIGHT = 616;
  static CONTINUOUS = false;
  static BEAT_STEP_MAP = MAIN;
  static BEAT_MAPS = { 3: MAIN };
  static CONTROLS = [];
  static ARIA_LABEL = 'Meera\'s month on a board, made-up numbers: 1,500 rupees come in; savings 500 first, then bus 300, stationery 200 and lunch 300 (needs) and snacks 200 (a want); total 1,500. In month 4 the bus fare rises to 350, the board is 50 over, and snacks drop to 150 while savings stays. When her racket breaks, a restring costs 300: cut back (no snacks for two months), use savings (the bicycle comes later) or borrow from her parents (pay back 300 next month).';

  async setup() {
    this.anim = false;
    this.pick = null;
    await super.setup();
    this.root.addEventListener('click', this._onClick = (e) => {
      const b = e.target?.closest?.('[data-act]');
      if (!b) return;
      if (b.dataset.act === 'replay') this.play();
      else if (b.dataset.act === 'pick') { this.pick = b.dataset.k; this.repaint(); }
    });
  }

  destroy() {
    this.root?.removeEventListener('click', this._onClick);
    super.destroy();
  }

  css() { return MONEY_CSS + CSS; }

  enter(step) {
    this.anim = false;
    this.pick = null;
    if (step === 0) this.play(true);
  }

  play(quiet) {
    if (this.stepIndex > 1) return;
    for (const t of this._timers.splice(0)) clearTimeout(t);
    this.anim = true;
    this.after(this.stepIndex === 0 ? 3.3 : 3.6, () => { this.anim = false; this.repaint(); });
    if (!quiet) this.repaint();
  }

  skip() {
    if (!this.anim) return false;
    for (const t of this._timers.splice(0)) clearTimeout(t);
    this.anim = false;
    this.repaint();
    return true;
  }

  busy() { return this.anim; }

  stageHeight(st) { return Math.round((st.portrait ? 616 : 494) * st.W / (st.portrait ? 390 : 560)); }

  paint(st) {
    const P = st.portrait, DW = P ? 390 : 560, DH = P ? 616 : 494, k = (st.W / DW).toFixed(4), v = this.stepIndex;
    const out = v === 2 ? this.paintRacket(P) : this.paintBoard(P, v === 1);
    return { svg: `<g transform="scale(${k})">${out.svg}</g>`, over: `<div style="position:absolute;left:0;top:0;width:${DW}px;height:${DH}px;transform:scale(${k});transform-origin:0 0">${out.over ?? ''}</div>` };
  }

  // b0 / b1: five rows with bars.
  paintBoard(P, m4) {
    const G = P
      ? { R: 378, bx: 150, sc: 0.27, y0: 100, rh: 70, ls: 23, as: 25, hy: 44, rule: 428, ty: 466, btn: [300, 530], note: [16, 538] }
      : { R: 548, bx: 180, sc: 0.54, y0: 108, rh: 60, ls: 24, as: 27, hy: 46, rule: 398, ty: 436, btn: [482, 468], note: [20, 476] };
    const A = this.anim, d0 = 0.2, gap = 0.5;
    let svg = '', over = '';
    // header: the month and the money that comes in
    svg += `<rect x="${P ? 14 : 20}" y="${G.hy - 26}" width="${P ? 104 : 112}" height="38" rx="19" ${fill('var(--sim-bg-deep)', 'stroke:var(--sim-stroke);stroke-width:2')}/>`
      + text((P ? 14 : 20) + (P ? 52 : 56), G.hy + 1, m4 ? 'month 4' : 'month 1', 21);
    svg += text(G.R - (P ? 96 : 104), G.hy, 'comes in', 21, 'var(--sim-label-muted)', 'end', 700) + text(G.R, G.hy + 2, rs(1500), P ? 27 : 30, 'var(--sim-label)', 'end');
    svg += `<path d="M${P ? 14 : 20} ${G.hy + 20}H${G.R}" ${stroke('var(--sim-label)', 2.5)}/>`;
    ROWS.forEach((r, i) => {
      const cy = G.y0 + i * G.rh, d = d0 + i * gap, bh = P ? 34 : 36;
      const v = m4 ? r.m4 : r.m1, old = m4 && r.m4 !== r.m1 ? r.m1 : null;
      let row = text(P ? 14 : 20, cy - 6, r.k, G.ls, 'var(--sim-label)', 'start') + word(P ? 14 : 20, cy + 3, r.w, r.t);
      if (m4 && A && old != null) {
        // the change, in time: bus grows at 0.6 s; snacks shrink at 2.4 s
        const t = i === 1 ? 0.6 : 2.4, lo = Math.min(v, old), diff = Math.abs(v - old);
        row += bar(G.bx, cy - bh / 2, lo * G.sc, bh, r.t);
        row += i === 1 ? anim('mk-grow', t, bar(G.bx + lo * G.sc, cy - bh / 2, diff * G.sc, bh, r.t))
          : anim('mb-shrink', t, bar(G.bx + lo * G.sc, cy - bh / 2, diff * G.sc, bh, r.t));
        row += anim('mb-out', t, text(G.R, cy + 9, rs(old), G.as, 'var(--sim-label)', 'end'))
          + anim('mb-in', t + 0.3, text(G.R, cy + 9, rs(v), G.as, i === 1 ? 'var(--sim-bad)' : 'var(--sim-label)', 'end'));
      } else {
        row += bar(G.bx, cy - bh / 2, v * G.sc, bh, r.t) + text(G.R, cy + 9, rs(v), G.as, 'var(--sim-label)', 'end');
        if (old != null) row += P ? struck(G.R - 74, cy + 8, rs(old), 20) : struck(G.R - 96, cy + 8, rs(old), 21);
      }
      if (m4 && i === 0) row += lock(G.bx + v * G.sc - 20, cy + 8);
      svg += A && !m4 ? `<g class="mk-pop" style="--d:${d.toFixed(2)}s">${row}</g>` : row;
    });
    svg += `<path d="M${P ? 14 : 20} ${G.rule}H${G.R}" ${stroke('var(--sim-label)', 2.5)}/>`;
    const ok = text(P ? 14 : 20, G.ty, 'total', G.ls + 2, 'var(--sim-label)', 'start') + text(G.R, G.ty + 2, rs(1500), P ? 27 : 30, 'var(--sim-label)', 'end') + check(G.R - (P ? 112 : 124), G.ty - 9);
    if (A && !m4) svg += anim('mk-pop', d0 + 5 * gap + 0.2, ok);
    else if (A && m4) {
      const over50 = text(P ? 14 : 20, G.ty, 'total', G.ls + 2, 'var(--sim-label)', 'start') + text(G.R, G.ty + 2, rs(1550), P ? 27 : 30, 'var(--sim-bad)', 'end')
        + text(P ? 104 : G.bx, G.ty, `${rs(50)} over`, P ? 24 : 26, 'var(--sim-bad)', 'start');
      svg += anim('mb-out', 0, ok) + `<g class="mb-out" style="--d:2.6s">${anim('mb-in', 0.9, over50)}</g>` + anim('mb-in', 2.9, ok);
    } else svg += ok;
    svg += text(G.note[0], G.note[1], 'made-up numbers', 20, 'var(--sim-label-muted)', 'start', 700);
    if (!A) over += `<div class="mb-ab" style="left:${G.btn[0]}px;top:${G.btn[1]}px"><button type="button" class="sv-hit mb-btn" data-act="replay">replay</button></div>`;
    return { svg, over };
  }

  // b2: the racket, the three cards, the month-4 board with a racket row.
  paintRacket(P) {
    const G = P
      ? { L: 14, R: 376, hy: 236, y0: 274, rh: 42, ls: 21, as: 23, chip: 132, oldX: 300, rule: 510, ty: 544,
        rk: [52, 54, 92], tag: [98, 44], cards: { x: [14, 138, 262], y: 112, w: 114, h: 80 }, fx: [195, 572] }
      : { L: 14, R: 366, hy: 44, y0: 92, rh: 50, ls: 22, as: 25, chip: 146, oldX: 292, rule: 380, ty: 416,
        rk: [412, 54, 82], tag: [462, 54], cards: { x: [386, 386, 386], y: [144, 206, 268], w: 162, h: 58 }, fx: [467, 352] };
    const p = this.pick;
    let svg = '', over = '';
    svg += racket(G.rk[0], G.rk[1], G.rk[2], P ? 28 : -28);
    svg += text(G.tag[0], G.tag[1], 'restring', 22, 'var(--sim-label-muted)', 'start', 700) + text(G.tag[0], G.tag[1] + 44, rs(300), 32, 'var(--sim-label)', 'start');
    // the board
    const inc = p === 'borrow' ? `${rs(1500)} + ${rs(300)}` : rs(1500);
    svg += text(G.L, G.hy, 'comes in', 21, 'var(--sim-label-muted)', 'start', 700) + text(G.R, G.hy + 2, inc, 26, p === 'borrow' ? 'var(--sim-accent)' : 'var(--sim-label)', 'end');
    svg += `<path d="M${G.L} ${G.hy + 16}H${G.R}" ${stroke('var(--sim-label)', 2.5)}/>`;
    const vals = ROWS.map((r) => r.m4);
    if (p === 'cut') vals[4] = 0;
    if (p === 'save') vals[0] = 200;
    const rk = p === 'cut' ? 150 : p ? 300 : null;
    ROWS.forEach((r, i) => {
      const cy = G.y0 + i * G.rh, changed = vals[i] !== r.m4;
      svg += text(G.L, cy + 8, r.k, G.ls, 'var(--sim-label)', 'start') + word(G.chip, cy - 14, r.w, r.t);
      if (changed) svg += struck(G.oldX, cy + 8, rs(r.m4), 20) + anim('mk-pop', 0.1, text(G.R, cy + 9, rs(vals[i]), G.as, 'var(--sim-accent)', 'end'));
      else svg += text(G.R, cy + 9, rs(vals[i]), G.as, 'var(--sim-label)', 'end');
    });
    const ry = G.y0 + 5 * G.rh;
    svg += `<rect x="${G.L - 6}" y="${ry - 20}" width="${G.R - G.L + 12}" height="40" rx="12" ${fill(p ? 'color-mix(in oklab, var(--sim-accent) 12%, transparent)' : 'none', `stroke:${p ? 'var(--sim-accent)' : 'var(--sim-stroke)'};stroke-width:2.5${p ? '' : ';stroke-dasharray:7 6'}`)}/>`;
    svg += text(G.L, ry + 8, 'racket', G.ls, 'var(--sim-label)', 'start') + (p ? anim('mk-pop', 0.1, text(G.R, ry + 9, rs(rk), G.as, 'var(--sim-accent)', 'end')) : text(G.R - 6, ry + 9, '?', G.as, 'var(--sim-label-muted)', 'end'));
    svg += `<path d="M${G.L} ${G.rule}H${G.R}" ${stroke('var(--sim-label)', 2.5)}/>`;
    svg += text(G.L, G.ty, 'total', G.ls + 2, 'var(--sim-label)', 'start');
    if (p) svg += text(G.R, G.ty + 2, rs(p === 'borrow' ? 1800 : 1500), 27, 'var(--sim-label)', 'end') + check(G.R - 118, G.ty - 9, 15);
    else svg += text(G.R - 6, G.ty + 2, '?', 27, 'var(--sim-label-muted)', 'end');
    // the cards (none is marked right or wrong)
    const C = G.cards;
    CARDS.forEach(([k, t], j) => {
      const x = C.x[j], y = Array.isArray(C.y) ? C.y[j] : C.y;
      over += `<button type="button" class="sv-hit mb-card" data-act="pick" data-k="${k}" aria-pressed="${p === k}" style="left:${x}px;top:${y}px;width:${C.w}px;height:${C.h}px">${t}</button>`;
    });
    // the cost of the chosen way
    const [fx, fy] = G.fx;
    if (!p) svg += text(fx, fy + (P ? 0 : 30), 'tap a card', P ? 21 : 22, 'var(--sim-label-muted)', 'middle', 700);
    else if (p === 'cut') {
      svg += P ? anim('mk-pop', 0.3, text(fx, fy - 12, 'no snacks for 2 months', 21, 'var(--sim-label-muted)', 'middle', 700) + text(fx, fy + 20, `${rs(150)} x 2 = ${rs(300)}`, 25))
        : anim('mk-pop', 0.3, text(fx, fy, 'no snacks', 21, 'var(--sim-label-muted)', 'middle', 700) + text(fx, fy + 34, `${rs(150)} x 2`, 26) + text(fx, fy + 66, 'months', 22) + text(fx, fy + 102, `= ${rs(300)}`, 28, 'var(--sim-accent)'));
    } else if (p === 'save') {
      svg += P ? anim('mk-pop', 0.3, `<g style="opacity:0.55">${bicycle(118, fy + 8, 84)}</g>` + text(176, fy, 'bicycle later', 24, 'var(--sim-label)', 'start'))
        : anim('mk-pop', 0.3, `<g style="opacity:0.55">${bicycle(fx, fy + 52, 120)}</g>` + text(fx, fy + 92, 'bicycle later', 23));
    } else {
      svg += P ? anim('mk-pop', 0.3, icon('calendar', 40, fy - 34, 48, 4) + text(100, fy - 12, 'next month', 21, 'var(--sim-label-muted)', 'start', 700) + text(100, fy + 18, `pay back ${rs(300)}`, 24, 'var(--sim-label)', 'start'))
        : anim('mk-pop', 0.3, icon('calendar', fx - 24, fy - 6, 48, 4) + text(fx, fy + 66, 'next month', 21, 'var(--sim-label-muted)', 'middle', 700) + text(fx, fy + 96, `pay back ${rs(300)}`, 22));
    }
    svg += P ? '' : text(G.L, 466, 'made-up numbers', 20, 'var(--sim-label-muted)', 'start', 700);
    return { svg, over };
  }

  testState() { return { view: this.stepIndex, anim: this.anim, pick: this.pick }; }
}
