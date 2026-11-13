/**
 * StartupTriesScene - L06 s05 "What a startup is", "When a startup fails", "Swami Vivekananda's words" (3 beats).
 * SvgScene, design 560 x 480 landscape, 390 x 620 portrait. Cast: two young founders (registered here), FinPeople.
 *   b0 What a startup is: an idea card (a bulb, 'new product or service') -> an arrow -> a small new shop with
 *      the sign 'startup'; the two young founders in front of it. Chips: 'young, early-stage' and
 *      'perseverance' ('keep working hard').
 *   b1 When a startup fails: three small shops side by side. One grows (bars rise), one struggles (flat bars),
 *      one closes (its shutter comes down). A 'lesson' card flies from the closed shop to a new idea card,
 *      'a better idea'.
 *   b2 Vivekananda's words: the quote on a card; under it a staircase to a goal flag (a plain pennant, not a
 *      national flag); a founder climbs it step by step; chip 'perseverance'. No portrait of a real person.
 * No numbers (the text has none). Animation is CSS only; a Skip / Replay button. No host controls.
 * Colours are tokens only. ASCII only.
 */
import { SvgScene, stroke, fill, shade } from 'simulations/base/kit/SimSvg.js';
import { iconSvg } from 'simulations/base/kit/SimIcons.js';
import { PEOPLE_CSS, personSlot, paintPeople, registerCast } from '../shared/FinPeople.js';

const f1 = (v) => (+v).toFixed(1);
const MAIN = [[{ idx: 0, dwellMs: null }], [{ idx: 1, dwellMs: null }], [{ idx: 2, dwellMs: null }]];
const DUR = [2.2, 3.2, 3.2];

// The two young founders of the startup (course-local cast, this scene only).
registerCast('founder1', { name: 'Founder', series: 4, role: 'adult', i: 91,
  look: { outfit: 'shirt', top: 's4', bottom: 'denim', hairStyle: 'long', shoeStyle: 'sneaker', shoe: 'white', pattern: 'plain', moustache: false, glasses: true, dupatta: false, girth: 0.96, sleeves: 'rolled' } });
registerCast('founder2', { name: 'Founder', series: 7, role: 'adult', i: 92,
  look: { outfit: 'tee', top: 's7', bottom: 'stone', hairStyle: 'curly', shoeStyle: 'sneaker', shoe: 'white', pattern: 'plain', moustache: false, glasses: false, dupatta: false, girth: 1 } });

const CSS = `
.su-btn { position: absolute; cursor: pointer; padding: 6px 14px; border-radius: calc(12px * var(--look-radius, 1));
  font: 800 18px/1.1 var(--sim-font); color: var(--sim-label); background: var(--sim-bg-surface);
  border: 2.5px solid var(--sim-stroke); box-shadow: 0 calc(3px * var(--look-lip, 1)) 0 var(--sim-stroke); }
.su-btn:active { transform: translateY(3px); box-shadow: none; }
.su-btn:focus-visible { outline: 3px solid var(--sim-accent); outline-offset: 3px; }
svg .su-pop { transform-box: fill-box; transform-origin: 50% 100%; animation: su-pop 0.5s cubic-bezier(.3,1.4,.5,1) both; animation-delay: var(--d, 0s); }
@keyframes su-pop { 0% { opacity: 0; transform: scale(0.4); } 100% { opacity: 1; transform: none; } }
svg .su-fade { animation: su-fade 0.45s ease both; animation-delay: var(--d, 0s); }
@keyframes su-fade { 0% { opacity: 0; } 100% { opacity: 1; } }
svg .su-bar { transform-box: fill-box; transform-origin: 50% 100%; animation: su-bar 0.6s ease-out both; animation-delay: var(--d, 0s); }
@keyframes su-bar { 0% { transform: scaleY(0); } 100% { transform: none; } }
svg .su-shut { transform-box: fill-box; transform-origin: 50% 0; animation: su-bar2 0.7s ease-in both; animation-delay: var(--d, 0s); }
@keyframes su-bar2 { 0% { transform: scaleY(0); } 100% { transform: none; } }
svg .su-fly { animation: su-fly 0.8s cubic-bezier(.4,0,.3,1) both; animation-delay: var(--d, 0s); }
@keyframes su-fly { 0% { transform: translate(var(--fx, 0px), var(--fy, 0px)); opacity: 0.2; } 100% { transform: none; opacity: 1; } }
.su-climb { animation: su-climb 2.4s steps(4, jump-none) both; animation-delay: var(--d, 0s); }
@keyframes su-climb { 0% { translate: var(--fx, 0px) var(--fy, 0px); } 100% { translate: 0 0; } }
.su-still, .su-still * { animation: none !important; }
@media (prefers-reduced-motion: reduce) { svg .su-pop, svg .su-fade, svg .su-bar, svg .su-shut, svg .su-fly, .su-climb { animation: none; } }
`;

const txt = (x, y, t, size, col = 'var(--sim-label)', anchor = 'middle', w = 800) =>
  `<text x="${f1(x)}" y="${f1(y)}" text-anchor="${anchor}" style="fill:${col};font:${w} ${f1(size)}px var(--sim-font)">${t}</text>`;
const icon = (name, x, y, s, tone) => `<g transform="translate(${f1(x - s / 2)} ${f1(y - s / 2)}) scale(${f1(s / 48)})">${iconSvg(name, tone)}</g>`;
const RIM = 'var(--sim-stroke)';
const WOOD = 'color-mix(in oklab, var(--sim-series-8) 55%, var(--sim-label) 30%)';
const ACC = 'var(--sim-accent)';

/** A pill chip centred at (x, y); acc = accent ring. */
function chip(x, y, t, size = 22, o = {}) {
  const w = t.length * size * 0.56 + 28, h = size * 1.6, col = o.acc ? ACC : RIM;
  return `<g${o.cls ? ` class="${o.cls}"` : ''}${o.style ? ` style="${o.style}"` : ''}>`
    + `<rect x="${f1(x - w / 2)}" y="${f1(y - h / 2)}" width="${f1(w)}" height="${f1(h)}" rx="${f1(h / 2)}" ${fill(o.acc ? `color-mix(in oklab, ${ACC} 14%, var(--sim-bg-surface))` : 'var(--sim-bg-surface)', `stroke:${col};stroke-width:2.5`)}/>`
    + txt(x, y + size * 0.36, t, size) + '</g>';
}

/** A card with a lip; r = [x, y, w, h]. */
function card(r, col = RIM, tint = 'var(--sim-bg-surface)') {
  const [x, y, w, h] = r;
  return `<rect x="${f1(x)}" y="${f1(y + 4)}" width="${f1(w)}" height="${f1(h)}" rx="14" ${fill(shade(col === RIM ? 'var(--sim-stroke)' : col, 70))}/>`
    + `<rect x="${f1(x)}" y="${f1(y)}" width="${f1(w)}" height="${f1(h)}" rx="14" ${fill(tint, `stroke:${col};stroke-width:3`)}/>`;
}

function arrow(x0, y0, x1, y1, o = {}) {
  const a = Math.atan2(y1 - y0, x1 - x0), L = 16, col = o.col ?? ACC;
  const p1 = [x1 - L * Math.cos(a - 0.5), y1 - L * Math.sin(a - 0.5)], p2 = [x1 - L * Math.cos(a + 0.5), y1 - L * Math.sin(a + 0.5)];
  return `<g${o.cls ? ` class="${o.cls}"` : ''}${o.style ? ` style="${o.style}"` : ''}><path d="M${f1(x0)} ${f1(y0)}L${f1(x1)} ${f1(y1)}" ${stroke(col, 6, o.dash ? 'stroke-dasharray:10 8' : '')}/>`
    + `<path d="M${f1(p1[0])} ${f1(p1[1])}L${f1(x1)} ${f1(y1)}L${f1(p2[0])} ${f1(p2[1])}" ${stroke(col, 6)}/></g>`;
}

/** A small shop front: sign band, awning, window, door. (x, y) = ground under the middle; height about 0.9 w. */
function shop(x, y, w, o = {}) {
  const H = w * 0.9, x0 = x - w / 2, top = y - H, tone = o.tone ?? 4, col = `var(--sim-series-${tone})`;
  const wall = `color-mix(in oklab, ${col} 16%, var(--sim-bg-surface))`;
  let s = `<rect x="${f1(x0)}" y="${f1(top)}" width="${f1(w)}" height="${f1(H)}" rx="6" ${fill(wall, `stroke:${RIM};stroke-width:2.5`)}/>`;
  const sh = w * 0.2;
  s += `<rect x="${f1(x0 - w * 0.03)}" y="${f1(top - sh * 0.35)}" width="${f1(w * 1.06)}" height="${f1(sh)}" rx="8" ${fill(col, `stroke:${shade(col, 62)};stroke-width:2.5`)}/>`;
  if (o.sign) s += txt(x, top - sh * 0.35 + sh * 0.68, o.sign, Math.min(sh * 0.62, 26), `var(--sim-ink-on-${tone}, var(--sim-bg-deep))`);
  const ay = top + sh * 0.7, ah = w * 0.09, n = 6, sw = (w * 1.04) / n, ax = x0 - w * 0.02;
  for (let i = 0; i < n; i++) s += `<path d="M${f1(ax + i * sw)} ${f1(ay)}H${f1(ax + (i + 1) * sw)}V${f1(ay + ah)}a${f1(sw / 2)} ${f1(ah * 0.5)} 0 0 1 ${f1(-sw)} 0Z" ${fill(i % 2 ? 'var(--sim-bg-surface)' : col, `stroke:${shade(col, 66)};stroke-width:1.5`)}/>`;
  const wx = x0 + w * 0.1, wy = ay + ah * 1.9, ww = w * 0.46, wh = y - wy - w * 0.1;
  s += `<rect x="${f1(wx)}" y="${f1(wy)}" width="${f1(ww)}" height="${f1(wh)}" rx="5" ${fill('color-mix(in oklab, var(--sim-water) 30%, var(--sim-bg-surface))', `stroke:${RIM};stroke-width:2.5`)}/>`;
  const dx = x0 + w * 0.66, dw = w * 0.24;
  s += `<rect x="${f1(dx)}" y="${f1(wy - ah * 0.4)}" width="${f1(dw)}" height="${f1(y - wy + ah * 0.4)}" rx="4" ${fill(WOOD, `stroke:${shade(WOOD, 66)};stroke-width:2.5`)}/>`;
  if (o.shutter) {
    // the shutter covers window and door, ribbed; a 'closed' board hangs on it
    const sx = x0 + w * 0.06, sy = ay + ah * 1.2, sw2 = w * 0.88, sh2 = y - sy;
    let sh3 = `<rect x="${f1(sx)}" y="${f1(sy)}" width="${f1(sw2)}" height="${f1(sh2)}" rx="3" ${fill('color-mix(in oklab, var(--sim-label) 28%, var(--sim-bg-surface))', `stroke:${RIM};stroke-width:2.5`)}/>`;
    for (let i = 1; i < 7; i++) sh3 += `<path d="M${f1(sx + 4)} ${f1(sy + sh2 * i / 7)}H${f1(sx + sw2 - 4)}" ${stroke('color-mix(in oklab, var(--sim-label) 40%, transparent)', 2)}/>`;
    s += `<g class="su-shut" style="--d:${o.shutDelay ?? 0}s">${sh3}</g>`;
    const bw = w * 0.56, bh = w * 0.2, by = sy + sh2 * 0.32;
    s += `<g class="su-pop" style="--d:${(o.shutDelay ?? 0) + 0.7}s"><rect x="${f1(x - bw / 2)}" y="${f1(by)}" width="${f1(bw)}" height="${f1(bh)}" rx="6" ${fill('var(--sim-bg-surface)', `stroke:${RIM};stroke-width:2.5`)}/>${txt(x, by + bh * 0.7, 'closed', Math.min(bh * 0.66, 20))}</g>`;
  }
  return `<g${o.dim ? ' style="opacity:0.4"' : ''}>${s}</g>`;
}

/** Three sales bars, bottom (x, y), bar width bw, heights hs. */
function bars(x, y, bw, hs, col, d0 = 0) {
  let s = `<path d="M${f1(x - 6)} ${f1(y)}H${f1(x + hs.length * bw * 1.4 + 2)}" ${stroke(RIM, 3)}/>`;
  hs.forEach((h, i) => { s += `<rect class="su-bar" x="${f1(x + i * bw * 1.4)}" y="${f1(y - h)}" width="${f1(bw)}" height="${f1(h)}" rx="4" ${fill(col, `stroke:${shade(col, 62)};stroke-width:2;--d:${f1(d0 + i * 0.35)}s`)}/>`; });
  return s;
}

/** A plain goal pennant (one colour, no emblem); (x, y) = foot of the pole. */
function goalFlag(x, y, h) {
  return `<path d="M${f1(x)} ${f1(y)}V${f1(y - h)}" ${stroke(WOOD, 5)}/>`
    + `<path d="M${f1(x + 2)} ${f1(y - h)}L${f1(x + h * 0.62)} ${f1(y - h * 0.82)}L${f1(x + 2)} ${f1(y - h * 0.62)}Z" ${fill(ACC, `stroke:${shade(ACC, 62)};stroke-width:2.5;stroke-linejoin:round`)}/>`
    + `<circle cx="${f1(x)}" cy="${f1(y - h - 4)}" r="5" ${fill(WOOD)}/>`;
}

/** An idea card: bulb + two lines; r = [x, y, w, h]. */
function ideaCard(r, lines, size = 22, bulb = 70) {
  const [x, y, w, h] = r, bs = Math.min(h * 0.62, bulb), bx = x + bs * 0.62 + 10, cy = y + h / 2;
  let s = card(r, 'var(--sim-series-2)', 'color-mix(in oklab, var(--sim-series-2) 12%, var(--sim-bg-surface))');
  s += `<circle cx="${f1(bx)}" cy="${f1(cy)}" r="${f1(bs * 0.5)}" ${fill('color-mix(in oklab, var(--sim-series-2) 24%, transparent)')}/>` + icon('bulb', bx, cy, bs, 2);
  const tx = (bx + bs * 0.55 + x + w) / 2, n = lines.length;
  lines.forEach((t, i) => { s += txt(tx, cy + size * 0.36 + (i - (n - 1) / 2) * size * 1.2, t, size); });
  return s;
}

export class StartupTriesScene extends SvgScene {
  static WIDTH = 560;
  static PORTRAIT_WIDTH = 390;
  static HEIGHT = 480;
  static PORTRAIT_HEIGHT = 620;
  static CONTINUOUS = false;
  static BEAT_STEP_MAP = MAIN;
  static BEAT_MAPS = { 3: MAIN };
  static CONTROLS = [];
  static ARIA_LABEL = 'A startup. First, an idea for a new product or service becomes a small new shop with the sign startup, and two young founders stand in front of it: young, early-stage; perseverance, keep working hard. Then three small startups: one grows (its bars rise), one struggles (its bars stay flat), one closes (its shutter comes down); a lesson card goes from the closed shop to a better idea. Last, Swami Vivekananda\'s words, Arise, awake and stop not till the goal is reached, over a staircase that a founder climbs step by step to a goal flag.';

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

  css() { return PEOPLE_CSS + CSS; }

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
    const out = v === 1 ? this.paintTries(P) : v === 2 ? this.paintSteps(P) : this.paintIdea(P);
    const still = this.still ? ' su-still' : '';
    const pos = v === 1 ? 'left:10px;bottom:10px' : 'right:10px;bottom:10px';
    const btn = `<button type="button" class="sv-hit tap btn su-btn" data-act="${this.still ? 'replay' : 'skip'}" style="${pos}">${this.still ? 'Replay' : 'Skip'}</button>`;
    return {
      svg: `<g class="${still}" transform="scale(${k})">${out.svg}</g>`,
      over: `<div class="${still}" style="position:absolute;left:0;top:0;width:${DW}px;height:${DH}px;overflow:hidden;transform:scale(${k});transform-origin:0 0">${out.over ?? ''}${btn}</div>`,
    };
  }

  // b0: an idea becomes a young company.
  paintIdea(P) {
    const G = P
      ? { idea: [20, 18, 350, 112], arr: [195, 142, 195, 196], shop: [195, 398, 200], f: [[46, 410], [344, 410]], fh: 150,
        young: [195, 452], pers: [195, 520], hard: [195, 562] }
      : { idea: [18, 40, 240, 132], arr: [270, 106, 326, 106], shop: [440, 236, 196], f: [[396, 462], [484, 462]], fh: 160,
        young: [440, 270], pers: [148, 300], hard: [148, 344] };
    let svg = `<g class="su-pop">${ideaCard(G.idea, ['new product', 'or service'], 24)}</g>`;
    const [ax0, ay0, ax1, ay1] = G.arr;
    svg += arrow(ax0, ay0, ax1, ay1, { cls: 'su-fade', style: '--d:0.4s' });
    const [sx, sy, sw] = G.shop;
    svg += `<g class="su-pop" style="--d:0.7s">${shop(sx, sy, sw, { sign: 'startup', tone: 4 })}</g>`;
    svg += chip(G.young[0], G.young[1], 'young, early-stage', 24, { acc: true, cls: 'su-pop', style: '--d:1.2s' });
    svg += chip(G.pers[0], G.pers[1], 'perseverance', 26, { cls: 'su-pop', style: '--d:1.6s' });
    svg += `<g class="su-fade" style="--d:1.8s">${txt(G.hard[0], G.hard[1], 'keep working hard', 22, 'var(--sim-label-muted)', 'middle', 700)}</g>`;
    let over = '';
    ['founder1', 'founder2'].forEach((who, i) => { over += personSlot(who, { x: G.f[i][0], y: G.f[i][1], h: G.fh, facing: 0, mood: 'happy', cls: 'mpp-pop', style: `--d:${0.9 + i * 0.15}s;` }); });
    return { svg, over };
  }

  // b1: grows, struggles, closes; the closed one leaves a lesson.
  paintTries(P) {
    const G3 = 'var(--sim-series-3)', G7 = 'var(--sim-label-muted)';
    let svg = '';
    if (!P) {
      const xs = [96, 280, 464], gy = 300, w = 150;
      svg += shop(xs[0], gy, w, { sign: '', tone: 3 }) + shop(xs[1], gy, w, { sign: '', tone: 6 }) + shop(xs[2], gy, w, { sign: '', tone: 1, shutter: true, shutDelay: 1.1 });
      svg += bars(xs[0] - 42, 150, 22, [30, 60, 100], G3, 0.2) + arrow(xs[0] - 50, 120, xs[0] + 50, 50, { cls: 'su-fade', style: '--d:1.2s', col: G3 });
      svg += bars(xs[1] - 42, 150, 22, [44, 46, 44], G7, 0.5);
      ['grows', 'struggles', 'closes'].forEach((t, i) => { svg += chip(xs[i], 338, t, 24, { cls: 'su-fade', style: `--d:${0.3 + i * 0.6}s` }); });
      // the lesson: from the closed shop to a better idea
      svg += `<g class="su-fade" style="--d:1.9s">${arrow(464, 360, 420, 392, { dash: true })}</g>`;
      svg += `<g class="su-fly" style="--d:2.0s;--fx:60px;--fy:-130px">${ideaCard([270, 392, 240, 72], ['a lesson for', 'a better idea'], 21)}</g>`;
    } else {
      const ys = [150, 330, 510], x = 108, w = 150;
      svg += shop(x, ys[0], w, { tone: 3 }) + shop(x, ys[1], w, { tone: 6 }) + shop(x, ys[2], w, { tone: 1, shutter: true, shutDelay: 1.1 });
      svg += bars(232, ys[0] - 46, 22, [24, 50, 84], G3, 0.2) + arrow(226, ys[0] - 64, 316, ys[0] - 128, { cls: 'su-fade', style: '--d:1.2s', col: G3 });
      svg += bars(232, ys[1] - 46, 22, [40, 42, 40], G7, 0.5);
      ['grows', 'struggles', 'closes'].forEach((t, i) => { svg += chip(i === 2 ? 108 : 290, i === 2 ? ys[2] + 30 : ys[i] - 14, t, 24, { cls: 'su-fade', style: `--d:${0.3 + i * 0.6}s` }); });
      svg += `<g class="su-fade" style="--d:1.9s">${arrow(176, ys[2] - 120, 236, ys[2] - 86, { dash: true })}</g>`;
      svg += `<g class="su-fly" style="--d:2.0s;--fx:-80px;--fy:-40px">${ideaCard([196, ys[2] - 78, 184, 112], ['a lesson:', 'a better', 'idea'], 21, 46)}</g>`;
    }
    return { svg, over: '' };
  }

  // b2: the quote over a staircase to the goal.
  paintSteps(P) {
    const G = P
      ? { q: [14, 14, 362, 176], qs: 25, lines: ['"Arise, awake and stop', 'not till the goal', 'is reached."'], by: 172,
        x0: 24, g: 606, sw: 82, rise: 62, n: 4, at: 2, fh: 120, pers: [112, 262] }
      : { q: [16, 14, 528, 132], qs: 26, lines: ['"Arise, awake and stop not', 'till the goal is reached."'], by: 132,
        x0: 40, g: 456, sw: 82, rise: 44, n: 5, at: 3, fh: 120, pers: [140, 260] };
    const [qx, qy, qw, qh] = G.q;
    let svg = `<g class="su-pop">${card(G.q, 'var(--sim-series-5)', 'color-mix(in oklab, var(--sim-series-5) 10%, var(--sim-bg-surface))')}`;
    G.lines.forEach((t, i) => { svg += txt(qx + qw / 2, qy + 44 + i * G.qs * 1.3, t, G.qs); });
    svg += txt(qx + qw / 2, G.by - 2, 'Swami Vivekananda', 20, 'var(--sim-label-muted)', 'middle', 700) + '</g>';
    // the staircase: solid blocks down to the ground
    const STEP = 'color-mix(in oklab, var(--sim-series-8) 26%, var(--sim-bg-surface))';
    for (let i = 0; i < G.n; i++) {
      const x = G.x0 + i * G.sw, top = G.g - G.rise * (i + 1);
      svg += `<rect x="${f1(x)}" y="${f1(top)}" width="${f1(G.sw)}" height="${f1(G.g - top)}" ${fill(STEP, `stroke:${shade('var(--sim-series-8)', 70)};stroke-width:2.5`)}/>`;
    }
    const last = G.n - 1, fx = G.x0 + last * G.sw + G.sw * 0.5, ftop = G.g - G.rise * G.n;
    svg += `<g class="su-pop" style="--d:0.4s">${goalFlag(fx - 10, ftop, P ? 74 : 80)}</g>`;
    svg += P ? txt(fx + 6, ftop - 92, 'goal', 24) : txt(fx + 46, ftop - 34, 'goal', 24, 'var(--sim-label)', 'start');
    svg += chip(G.pers[0], G.pers[1], 'perseverance', 26, { acc: true, cls: 'su-pop', style: '--d:0.8s' });
    // the founder climbs from the first step to step 'at' (one step every 0.6 s)
    const cx = G.x0 + G.at * G.sw + G.sw / 2, cy = G.g - G.rise * (G.at + 1);
    const dx = -G.at * G.sw, dy = G.at * G.rise;
    const over = personSlot('founder1', { x: cx, y: cy, h: G.fh, pose: 'walk', facing: 1, mood: 'effort', cls: 'su-climb', style: `--d:0.6s;--fx:${dx}px;--fy:${dy}px;` });
    return { svg, over };
  }

  testState() { return { view: this.stepIndex, still: this.still }; }
}
