/**
 * BakeryOperationsScene - L04 s03 "Management and operations" (2 beats). SvgScene, design 560 x 480 landscape,
 * 390 x 600 portrait. Cast: StallKit (breadLoaf, sugarBag), FinPeople (you as the manager, parent as a
 * customer), SimIcons (clock, check). Drawn here (no kit prop): the plan notebook, an oven (as in L03
 * StartupCostsScene), a mixer, a baking tray, a day plan board, a bread rack, a waste bin. Area colour: series 1
 * (management and operations, as in FourAreasBoardScene).
 *   b0 Management: you with the plan notebook, 'goal: more satisfied customers', and its three verbs plan,
 *      organise, guide. Operations: the oven, an arrow to a customer, a loaf travels along it (0.8 s) under a
 *      clock 'on time'.
 *   b1 Operations in the bakery: four stations (equipment: oven and mixer; ingredients: flour and sugar; quality
 *      check: a tray with a tick; day plan: a board with times), and the result on the right: a rack of fresh
 *      bread, 'on time', an empty bin 'no waste'. Each station is a button: tapping it skips that step and the
 *      result shows what goes wrong (equipment: few loaves, late; ingredients: an empty rack, delay; quality
 *      check: two burnt loaves on the rack; day plan: too much baked, loaves in the bin). Tapping it again (or
 *      cold start) brings all four back.
 * No host controls. Colours are tokens only. ASCII only.
 */
import { SvgScene, fill, stroke, shade } from 'simulations/base/kit/SimSvg.js';
import { iconSvg } from 'simulations/base/kit/SimIcons.js';
import { MONEY_CSS } from '../shared/MoneyKit.js';
import { PEOPLE_CSS, personSlot, paintPeople, nameTag, frontSvg } from '../shared/FinPeople.js';
import { STALL_CSS, breadLoaf, sugarBag } from '../shared/StallKit.js';

const f1 = (v) => (+v).toFixed(1);
const MAIN = [[{ idx: 0, dwellMs: null }], [{ idx: 1, dwellMs: null }]];
const AREA = 'var(--sim-series-1)';
const TINT = 'color-mix(in oklab, var(--sim-series-1) 12%, var(--sim-bg-surface))';
const PAPER = 'color-mix(in oklab, var(--sim-series-2) 12%, var(--sim-bg-surface))';

const CSS = `
.bo-ab { position: absolute; }
.bo-st { cursor: pointer; background: transparent; border: 0; padding: 0; border-radius: 14px; }
.bo-st:focus-visible { outline: 3px solid var(--sim-accent); outline-offset: 2px; }
svg .bo-go { animation: bo-go 0.8s cubic-bezier(.4,0,.3,1) both; animation-delay: var(--d, 0s); }
@keyframes bo-go { 0% { transform: translate(var(--gx, 0px), 0); opacity: 0; } 15% { opacity: 1; } 100% { transform: none; opacity: 1; } }
@media (prefers-reduced-motion: reduce) { svg .bo-go { animation: none; } }
`;

const text = (x, y, t, size, col = 'var(--sim-label)', anchor = 'middle', w = 800) =>
  `<text x="${f1(x)}" y="${f1(y)}" text-anchor="${anchor}" style="fill:${col};font:${w} ${size}px var(--sim-font)">${t}</text>`;
const rect = (x, y, w, h, rx, col, extra = '') => `<rect x="${f1(x)}" y="${f1(y)}" width="${f1(w)}" height="${f1(h)}" rx="${f1(rx)}" ${fill(col, extra)}/>`;
const lipRect = (x, y, w, h, rx, col, rim) => rect(x, y + 4, w, h, rx, rim) + rect(x, y, w, h, rx, col, `stroke:${rim};stroke-width:2.5`);
const icon = (name, tone, x, y, s) => `<g transform="translate(${f1(x - s / 2)} ${f1(y - s / 2)}) scale(${(s / 48).toFixed(3)})">${iconSvg(name, tone)}</g>`;

/** An oven (same drawing as L03 StartupCostsScene); (x, y) bottom centre. */
function oven(x, y, w) {
  const h = w * 0.86, x0 = x - w / 2, top = y - h, body = 'color-mix(in oklab, var(--sim-series-7) 30%, var(--sim-bg-surface))', rim = shade(body, 60);
  const glow = 'color-mix(in oklab, var(--sim-series-8) 55%, var(--sim-bg-surface))';
  let s = rect(x0, top + 4, w, h, 8, rim) + rect(x0, top, w, h, 8, body, `stroke:${rim};stroke-width:2.5`)
    + `<path d="M${f1(x0)} ${f1(top + h * 0.22)}H${f1(x0 + w)}" ${stroke(rim, 2.5)}/>`;
  for (const k of [0.2, 0.36]) s += `<circle cx="${f1(x0 + w * k)}" cy="${f1(top + h * 0.11)}" r="${f1(w * 0.05)}" ${fill('var(--sim-bg-surface)', `stroke:${rim};stroke-width:2`)}/>`;
  s += rect(x0 + w * 0.12, top + h * 0.32, w * 0.76, h * 0.56, 6, glow, `stroke:${rim};stroke-width:2.5`);
  s += `<path d="M${f1(x0 + w * 0.22)} ${f1(top + h * 0.3)}H${f1(x0 + w * 0.78)}" ${stroke(rim, 5, 'stroke-linecap:round')}/>`;
  s += `<path d="M${f1(x - w * 0.22)} ${f1(top + h * 0.78)}h${f1(w * 0.44)}" ${stroke(shade(glow, 70), 3)}/>`;
  return s;
}

/** A stand mixer: base, column, head, bowl; (x, y) bottom centre, h tall. */
function mixer(x, y, h) {
  const body = 'color-mix(in oklab, var(--sim-series-4) 45%, var(--sim-bg-surface))', rim = shade(body, 60), bowl = 'color-mix(in oklab, var(--sim-label-muted) 25%, var(--sim-bg-surface))';
  const w = h * 0.8;
  let s = rect(x - w / 2, y - h * 0.12, w, h * 0.12, 5, body, `stroke:${rim};stroke-width:2.5`);
  s += rect(x - w / 2 + 4, y - h, w * 0.24, h * 0.9, 6, body, `stroke:${rim};stroke-width:2.5`);
  s += rect(x - w / 2 + 4, y - h, w * 0.92, h * 0.26, h * 0.12, body, `stroke:${rim};stroke-width:2.5`);
  s += `<path d="M${f1(x + w * 0.2)} ${f1(y - h * 0.74)}v${f1(h * 0.18)}" ${stroke(rim, 4, 'stroke-linecap:round')}/>`;
  s += `<path d="M${f1(x - w * 0.12)} ${f1(y - h * 0.5)}h${f1(w * 0.62)}l-${f1(w * 0.08)} ${f1(h * 0.36)}h-${f1(w * 0.46)}Z" ${fill(bowl, `stroke:${shade(bowl, 60)};stroke-width:2.5;stroke-linejoin:round`)}/>`;
  return s;
}

/** A loaf that went wrong (burnt): the bread shape in a dark crust. */
function burntLoaf(x, y, w) {
  const col = 'color-mix(in oklab, var(--sim-series-8) 30%, var(--sim-label) 70%)', h = w * 0.45;
  return `<path d="M${f1(x - w / 2)} ${f1(y)}V${f1(y - h * 0.45)}Q${f1(x - w / 2)} ${f1(y - h)} ${f1(x - w * 0.2)} ${f1(y - h)}H${f1(x + w * 0.2)}Q${f1(x + w / 2)} ${f1(y - h)} ${f1(x + w / 2)} ${f1(y - h * 0.45)}V${f1(y)}Z" ${fill(col, `stroke:${shade(col, 60)};stroke-width:2;stroke-linejoin:round`)}/>`;
}

/** A baking tray with three loaves; (x, y) bottom centre. */
function tray(x, y, w) {
  const metal = 'color-mix(in oklab, var(--sim-label-muted) 35%, var(--sim-bg-surface))';
  return breadLoaf(x - w * 0.3, y - 8, w * 0.28) + breadLoaf(x, y - 8, w * 0.28) + breadLoaf(x + w * 0.3, y - 8, w * 0.28)
    + rect(x - w / 2, y - 10, w, 12, 4, metal, `stroke:${shade(metal, 60)};stroke-width:2.5`);
}

/** The day plan board: a small board with three timed lines; (x, y) centre. */
function planBoard(x, y, w) {
  const h = w * 0.8;
  let s = rect(x - w / 2, y - h / 2 + 4, w, h, 8, 'var(--sim-stroke)') + rect(x - w / 2, y - h / 2, w, h, 8, PAPER, 'stroke:var(--sim-stroke);stroke-width:2.5');
  for (let i = 0; i < 3; i++) {
    const ly = y - h / 2 + h * (0.28 + i * 0.26);
    s += `<circle cx="${f1(x - w / 2 + 16)}" cy="${f1(ly)}" r="6" ${fill(AREA)}/>`;
    s += `<path d="M${f1(x - w / 2 + 30)} ${f1(ly)}h${f1(w * (i === 1 ? 0.4 : 0.55))}" ${stroke('var(--sim-label-muted)', 4, 'stroke-linecap:round')}/>`;
  }
  return s;
}

/** A waste bin with loaves in it when n > 0; (x, y) bottom centre. */
function bin(x, y, w, n) {
  const body = 'color-mix(in oklab, var(--sim-series-7) 35%, var(--sim-bg-surface))', rim = shade(body, 60), h = w * 1.1;
  let s = `<path d="M${f1(x - w / 2)} ${f1(y - h)}h${f1(w)}l-${f1(w * 0.1)} ${f1(h)}h-${f1(w * 0.8)}Z" ${fill(body, `stroke:${rim};stroke-width:2.5;stroke-linejoin:round`)}/>`;
  for (let i = 1; i < 4; i++) s += `<path d="M${f1(x - w / 2 + i * w / 4)} ${f1(y - h + 10)}l${f1((2 - i) * -w * 0.03)} ${f1(h - 18)}" ${stroke(rim, 2)}/>`;
  // loaves thrown away pile over the open rim; an empty bin keeps its lid
  if (n) for (let i = 0; i < n; i++) s += breadLoaf(x - w * 0.28 + i * w * 0.28, y - h + 8 - (i % 2) * 12, w * 0.5);
  else s += rect(x - w / 2 - 6, y - h - 8, w + 12, 10, 5, body, `stroke:${rim};stroke-width:2.5`);
  return s;
}

/** The bread rack: two shelves; loaves = [['ok'|'burnt'] per slot] (6 slots); (x, y) bottom centre. */
function rack(x, y, w, slots) {
  const wood = 'color-mix(in oklab, var(--sim-series-8) 55%, var(--sim-label) 30%)', h = w * 0.8;
  let s = rect(x - w / 2, y - h, 10, h, 3, wood) + rect(x + w / 2 - 10, y - h, 10, h, 3, wood);
  [0.45, 0.95].forEach((k, r) => {
    const sy = y - h + h * k;
    s += rect(x - w / 2, sy, w, 9, 3, wood, `stroke:${shade(wood, 60)};stroke-width:1.5`);
    for (let i = 0; i < 3; i++) {
      const lx = x - w * 0.3 + i * w * 0.3, kind = slots[r * 3 + i];
      if (kind === 'ok') s += breadLoaf(lx, sy, w * 0.26);
      else if (kind === 'burnt') s += burntLoaf(lx, sy, w * 0.26);
      else s += `<path d="M${f1(lx - w * 0.11)} ${f1(sy - 2)}h${f1(w * 0.22)}" ${stroke('var(--sim-label-muted)', 2.5, 'stroke-dasharray:4 5')}/>`;
    }
  });
  return s;
}

const STATIONS = [
  { key: 'equipment', label: 'equipment' },
  { key: 'ingredients', label: 'ingredients' },
  { key: 'quality', label: 'quality check' },
  { key: 'plan', label: 'day plan' },
];
const FULL = ['ok', 'ok', 'ok', 'ok', 'ok', 'ok'];
const RESULT = {
  none: { slots: FULL, time: true, waste: 0, why: 'fresh, on time' },
  equipment: { slots: ['', '', '', 'ok', 'ok', ''], time: false, waste: 0, why: 'slow: bread late' },
  ingredients: { slots: ['', '', '', '', '', ''], time: false, waste: 0, why: 'no flour: delay' },
  quality: { slots: ['ok', 'burnt', 'ok', 'ok', 'ok', 'burnt'], time: true, waste: 0, why: 'bad loaves sold' },
  plan: { slots: FULL, time: true, waste: 3, why: 'too much: waste' },
};

export class BakeryOperationsScene extends SvgScene {
  static WIDTH = 560;
  static PORTRAIT_WIDTH = 390;
  static HEIGHT = 480;
  static PORTRAIT_HEIGHT = 600;
  static CONTINUOUS = false;
  static BEAT_STEP_MAP = MAIN;
  static BEAT_MAPS = { 2: MAIN };
  static CONTROLS = [];
  static ARIA_LABEL = 'Management: you hold the plan, with the goal more satisfied customers, and you plan, organise and guide. Operations: bread goes from the oven to a customer on time. In the bakery, operations has four steps: the right equipment (an oven and a mixer), the ingredients, a quality check of each tray, and a plan for the day. With all four, the rack is full of fresh bread on time and the bin is empty. Tap a step to skip it and see what goes wrong: without equipment the bread is late, without ingredients there is a delay, without a quality check bad loaves are sold, without a day plan too much is baked and wasted.';

  async setup() {
    this.skip = null;
    await super.setup();
    this._onClick = (e) => {
      const b = e.target?.closest?.('[data-st]');
      if (!b || this.stepIndex !== 1) return;
      const k = b.dataset.st;
      this.skip = this.skip === k ? null : k;
      this.repaint();
    };
    this.root.addEventListener('click', this._onClick);
  }

  destroy() {
    this.root?.removeEventListener('click', this._onClick);
    super.destroy();
  }

  css() { return MONEY_CSS + PEOPLE_CSS + STALL_CSS + CSS; }

  enter() { this.skip = null; }

  repaint() { super.repaint(); paintPeople(this); }

  stageHeight(st) { return Math.round((st.portrait ? 600 : 480) * st.W / (st.portrait ? 390 : 560)); }

  paint(st) {
    const P = st.portrait, DW = P ? 390 : 560, DH = P ? 600 : 480, k = (st.W / DW).toFixed(4);
    const out = this.stepIndex === 1 ? this.paintStations(P, DW, DH) : this.paintIntro(P, DW, DH);
    return { svg: `<g transform="scale(${k})">${out.svg}</g>`, over: `<div style="position:absolute;left:0;top:0;width:${DW}px;height:${DH}px;overflow:hidden;transform:scale(${k});transform-origin:0 0">${out.over ?? ''}</div>` };
  }

  /** A zone panel with a header word. */
  zone(x, y, w, h, title) {
    return lipRect(x, y, w, h, 16, TINT, shade(AREA, 62)) + text(x + 16, y + 34, title, 25, shade(AREA, 70), 'start');
  }

  // b0: management (the plan and its goal) and operations (bread out on time).
  paintIntro(P, DW, DH) {
    const G = P
      ? { z1: [10, 8, 370, 300], z2: [10, 320, 370, 272], you: [70, 290, 190], nb: [150, 56, 214, 236],
        ov: [74, 548, 96], arr: [130, 470, 268], cust: [330, 576, 170], clock: [170, 384], side: true }
      : { z1: [10, 10, 260, 460], z2: [282, 10, 268, 460], you: [70, 452, 196], nb: [130, 62, 130, 250],
        ov: [346, 356, 110], arr: [404, 300, 452], cust: [508, 452, 190], clock: [416, 150] };
    let svg = this.zone(...G.z1, 'management') + this.zone(...G.z2, 'operations');
    // the plan notebook
    const [nx, ny, nw, nh] = G.nb;
    svg += rect(nx - 5, ny - 5, nw + 10, nh + 14, 12, shade(AREA, 60)) + rect(nx - 5, ny - 5, nw + 10, nh + 10, 12, AREA);
    svg += rect(nx, ny, nw, nh, 6, PAPER, 'stroke:var(--sim-stroke);stroke-width:2');
    const lx = nx + 12, fs = 21;
    svg += text(lx, ny + 32, 'goal:', fs, shade(AREA, 70), 'start');
    const goal = P ? ['more satisfied', 'customers'] : ['more', 'satisfied', 'customers'];
    goal.forEach((g, i) => { svg += text(lx, ny + 60 + i * 25, g, fs, 'var(--sim-label)', 'start'); });
    const vy = ny + 60 + goal.length * 25 + 8;
    svg += `<path d="M${f1(nx + 10)} ${f1(vy - 14)}h${f1(nw - 20)}" ${stroke('var(--sim-stroke)', 2, 'stroke-dasharray:5 5')}/>`;
    ['plan', 'organise', 'guide'].forEach((w, i) => {
      svg += `<g class="mk-pop" style="--d:${(0.3 + i * 0.2).toFixed(1)}s">${icon('check', 1, lx + 10, vy + 10 + i * 30, 22)}${text(lx + 28, vy + 18 + i * 30, w, fs, 'var(--sim-label)', 'start')}</g>`;
    });
    let over = personSlot('you', { x: G.you[0], y: G.you[1], h: G.you[2], facing: 1, mood: 'happy' });
    const front = nameTag(G.you[0], G.you[1] - G.you[2] - 30, 'you', 18);
    // operations: oven -> bread -> customer, on time
    const [ox, oy, ow] = G.ov;
    svg += oven(ox, oy, ow);
    const [ax0, ay, ax1] = G.arr;
    svg += `<path d="M${ax0} ${ay}H${ax1 - 14}" ${stroke(AREA, 6, 'stroke-linecap:round')}/><path d="M${ax1 - 16} ${ay - 12}L${ax1} ${ay}L${ax1 - 16} ${ay + 12}Z" ${fill(AREA)}/>`;
    const gx = ax0 - (ax1 - 36);
    svg += `<g class="bo-go" style="--d:0.5s;--gx:${gx}px">${breadLoaf(ax1 - 36, ay - 10, 50)}</g>`;
    svg += icon('clock', 1, G.clock[0], G.clock[1], 54) + (G.side ? text(G.clock[0] + 36, G.clock[1] + 9, 'on time', 23, 'var(--sim-label)', 'start') : text(G.clock[0], G.clock[1] + 54, 'on time', 23, 'var(--sim-label)'));
    over += personSlot('parent', { x: G.cust[0], y: G.cust[1], h: G.cust[2], facing: -1, mood: 'happy' });
    over += frontSvg(DW, DH, front);
    return { svg, over };
  }

  // b1: four stations and the result.
  paintStations(P, DW, DH) {
    const G = P
      ? { cells: [[10, 8], [200, 8], [10, 178], [200, 178]], cw: 180, ch: 160, cap: [195, 368], panel: [10, 384, 370, 208],
        rack: [104, 568, 168], clock: [236, 430], bin: [236, 540, 52], why: [288, 582] }
      : { cells: [[10, 10], [174, 10], [10, 216], [174, 216]], cw: 154, ch: 196, cap: [169, 450], panel: [338, 10, 212, 402],
        rack: [444, 196, 176], clock: [376, 252], bin: [384, 372, 56], why: [444, 450] };
    const res = RESULT[this.skip ?? 'none'];
    let svg = '', over = '';
    STATIONS.forEach((s, i) => {
      const [x, y] = G.cells[i], w = G.cw, h = G.ch, off = this.skip === s.key;
      const cx = x + w / 2, base = y + h - 46;
      let art = '';
      if (s.key === 'equipment') art = oven(cx - w * 0.2, base, w * 0.4) + mixer(cx + w * 0.24, base, w * 0.36);
      else if (s.key === 'ingredients') art = sugarBag(cx - w * 0.14, base, w * 0.56, { label: 'flour' }) + sugarBag(cx + w * 0.28, base, w * 0.36, { label: '' });
      else if (s.key === 'quality') art = tray(cx, base - 6, w * 0.82) + icon('check', 1, cx + w * 0.3, base - w * 0.4, 38);
      else art = planBoard(cx - 14, base - w * 0.26, w * 0.52) + icon('clock', 1, cx + w * 0.3, base - w * 0.3, 36);
      svg += lipRect(x, y, w, h, 14, off ? 'var(--sim-bg-surface)' : TINT, off ? 'var(--sim-stroke)' : shade(AREA, 62));
      svg += `<g style="opacity:${off ? 0.3 : 1}">${art}</g>`;
      svg += text(cx, y + h - 16, off ? 'skipped' : s.label, 21, off ? 'var(--sim-bad)' : 'var(--sim-label)');
      if (off) svg += `<path d="M${f1(x + 16)} ${f1(y + 16)}L${f1(x + w - 16)} ${f1(y + h - 48)}" ${stroke('var(--sim-bad)', 5, 'stroke-linecap:round;opacity:0.7')}/>`;
      over += `<button type="button" class="sv-hit tap btn bo-ab bo-st" data-st="${s.key}" aria-pressed="${off}" aria-label="skip ${s.label}" style="left:${x}px;top:${y}px;width:${w}px;height:${h}px"></button>`;
    });
    svg += text(G.cap[0], G.cap[1], 'tap a step to skip it', 20, 'var(--sim-label-muted)', 'middle', 700);
    // the result
    const [px, py, pw, ph] = G.panel;
    svg += lipRect(px, py, pw, ph, 16, 'var(--sim-bg-surface)', 'var(--sim-stroke)');
    svg += `<g class="mk-pop" style="--d:0.1s">${rack(G.rack[0], G.rack[1], G.rack[2], res.slots)}</g>`;
    const tCol = res.time ? 'var(--sim-good)' : 'var(--sim-bad)';
    svg += icon('clock', res.time ? 3 : 6, G.clock[0], G.clock[1], 48) + text(G.clock[0] + 32, G.clock[1] + 9, res.time ? 'on time' : 'late', 23, shade(tCol, 75), 'start');
    const [bx, by, bw] = G.bin;
    svg += bin(bx, by, bw, res.waste) + text(bx + 40, by - 24, res.waste ? 'waste' : 'no waste', 23, shade(res.waste ? 'var(--sim-bad)' : 'var(--sim-good)', 75), 'start');
    const ok = !this.skip;
    svg += `<g class="mk-pop">${text(G.why[0], G.why[1], res.why, 21, shade(ok ? 'var(--sim-good)' : 'var(--sim-bad)', 75))}</g>`;
    return { svg, over };
  }

  testState() { return { view: this.stepIndex, skip: this.skip, result: this.stepIndex === 1 ? RESULT[this.skip ?? 'none'].why : null }; }
}
