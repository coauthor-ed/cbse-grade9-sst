/**
 * EntrepreneurTasksBoardScene - L01 s06 "Seeing opportunities" (3 beats). SvgScene, design 560 x 490 landscape,
 * 390 x 615 portrait. Cast: FinPeople people (the jute bag maker from StallKit), MoneyKit coins.
 *   b0 Two small worlds side by side: a drone over a road of cars ('drones to watch traffic') and a jute bag
 *      beside a crumpled plastic bag ('jute bags in place of plastic'); in each, a grey 'problem' tag and an
 *      accent 'opportunity' tag. The drone flies in and the jute bag pops in (0.6 s).
 *   b1 Fig 6.2 as the hero: 'An Entrepreneur' (the maker) in the middle, five task cards round her on a faint
 *      ring, no arrows, no numbers: identifies a problem / takes risks / makes key decisions / combines factors
 *      of production / adds to society's welfare.
 *   b2 The same five, now buttons. Tapping one lights it and shows the jute bag maker's action for it in one
 *      short line with a small picture (plastic litter / savings coins / two bag sizes and a price tag / cloth,
 *      a sewing machine and a tailor / a clean street). Rest and cold start: the first task lit.
 * No host controls. Colours are tokens only. ASCII only (the rupee sign from MoneyKit's RS).
 */
import { SvgScene, stroke, fill, shade } from 'simulations/base/kit/SimSvg.js';
import { iconSvg } from 'simulations/base/kit/SimIcons.js';
import { MONEY_CSS, RS, coinPile } from '../shared/MoneyKit.js';
import { PEOPLE_CSS, personSlot, paintPeople } from '../shared/FinPeople.js';
import { STALL_CSS } from '../shared/StallKit.js';

const f1 = (v) => (+v).toFixed(1);
const MAIN = [[{ idx: 0, dwellMs: null }], [{ idx: 1, dwellMs: null }], [{ idx: 2, dwellMs: null }]];

// The five tasks of Fig 6.2 (no order), with the jute bag maker's action for each.
const TASKS = [
  { label: 'identifies a problem', icon: 'question', tone: 7, act: 'Plastic bags thrown on the streets.', pic: 'litter' },
  { label: 'takes risks', icon: 'coin', tone: 8, act: 'She puts in her savings.', pic: 'savings' },
  { label: 'makes key decisions', icon: 'check', tone: 4, act: 'She picks the size and the price.', pic: 'price' },
  { label: 'combines factors of production', icon: 'factory', tone: 6, act: 'Cloth, machines and tailors.', pic: 'factors' },
  { label: "adds to society's welfare", icon: 'family', tone: 3, act: 'Fewer plastic bags as litter.', pic: 'clean' },
];
// Card centres, clockwise from the top: landscape (wide cards) and portrait (narrow side cards).
const CARD_L = { w: [220, 196, 196, 196, 196], pos: [[280, 66], [460, 196], [460, 352], [100, 352], [100, 196]] };
const CARD_P = { w: [210, 142, 142, 142, 142], pos: [[195, 58], [314, 228], [314, 384], [76, 384], [76, 228]] };

const JUTE = 'color-mix(in oklab, var(--sim-series-8) 42%, var(--sim-bg-surface))';
const PLASTIC = 'color-mix(in oklab, var(--sim-label) 9%, var(--sim-bg-surface))';
const ROAD = 'color-mix(in oklab, var(--sim-label) 42%, var(--sim-bg-surface))';
const METAL = 'color-mix(in oklab, var(--sim-label) 55%, var(--sim-bg-surface))';

const CSS = `
.tb-card { position: absolute; transform: translate(-50%, -50%); box-sizing: border-box; display: flex; flex-direction: column; align-items: center;
  gap: 2px; padding: 8px 8px 10px; text-align: center; font: 800 20px/1.15 var(--sim-font); color: var(--sim-label); background: var(--sim-bg-surface);
  border: 2.5px solid var(--sim-stroke); border-radius: calc(16px * var(--look-radius, 1)); box-shadow: 0 calc(3px * var(--look-lip, 1)) 0 var(--sim-stroke); }
.tb-card .sim-icon { width: 40px; height: 40px; }
button.tb-card { cursor: pointer; }
button.tb-card:active { transform: translate(-50%, calc(-50% + 3px)); box-shadow: none; }
button.tb-card:focus-visible { outline: 3px solid var(--sim-accent); outline-offset: 3px; }
.tb-card.on { border-color: var(--sim-accent); border-width: 3.5px; background: color-mix(in oklab, var(--sim-accent) 16%, var(--sim-bg-surface)); box-shadow: 0 calc(4px * var(--look-lip, 1)) 0 var(--sim-accent); }
.tb-card.off { opacity: 0.62; }
.tb-pop { animation: tb-pop 0.45s cubic-bezier(.3,1.5,.5,1) both; animation-delay: var(--d, 0s); }
@keyframes tb-pop { 0% { transform: translate(-50%, -50%) scale(0.4); opacity: 0; } 100% { transform: translate(-50%, -50%); opacity: 1; } }
.tb-chip { position: absolute; transform: translate(-50%, -50%); white-space: nowrap; padding: 4px 14px; border-radius: 999px;
  font: 800 22px/1.2 var(--sim-font); color: var(--sim-label); background: var(--sim-bg-surface); border: 2.5px solid var(--sim-stroke); }
.tb-chip.acc { border-color: var(--sim-accent); background: color-mix(in oklab, var(--sim-accent) 16%, var(--sim-bg-surface)); }
.tb-chip.dash { border-style: dashed; color: var(--sim-label-muted); font-size: 20px; }
.tb-act { position: absolute; box-sizing: border-box; display: flex; align-items: center; justify-content: center; text-align: center;
  font: 800 21px/1.2 var(--sim-font); color: var(--sim-label); }
svg .tb-fly { animation: tb-fly 0.6s cubic-bezier(.3,.9,.4,1) both; animation-delay: var(--d, 0s); }
@keyframes tb-fly { 0% { transform: translate(-90px, -50px); opacity: 0; } 100% { transform: none; opacity: 1; } }
svg .tb-in { transform-box: fill-box; transform-origin: center; animation: tb-in 0.45s cubic-bezier(.3,1.5,.5,1) both; animation-delay: var(--d, 0s); }
@keyframes tb-in { 0% { transform: scale(0.3); opacity: 0; } 100% { transform: none; opacity: 1; } }
@media (prefers-reduced-motion: reduce) { .tb-pop, svg .tb-fly, svg .tb-in { animation: none; } }
`;

const txt = (x, y, t, size, col = 'var(--sim-label)', anchor = 'middle') =>
  `<text x="${f1(x)}" y="${f1(y)}" text-anchor="${anchor}" style="fill:${col};font:800 ${f1(size)}px var(--sim-font)">${t}</text>`;
const rect = (x, y, w, h, rx, col, extra = '') => `<rect x="${f1(x)}" y="${f1(y)}" width="${f1(w)}" height="${f1(h)}" rx="${f1(rx)}" ${fill(col, extra)}/>`;
const icon = (name, x, y, s, tone) => `<g transform="translate(${f1(x - s / 2)} ${f1(y - s / 2)}) scale(${f1(s / 48)})">${iconSvg(name, tone)}</g>`;

// ---- small drawings (all centred on their bottom middle unless said) ----
function car(x, y, w, n) {
  const h = w * 0.36, col = `var(--sim-series-${n})`, rim = shade(col, 62);
  let s = rect(x - w / 2, y - h * 0.62, w, h * 0.5, h * 0.18, col, `stroke:${rim};stroke-width:2`);
  s += `<path d="M${f1(x - w * 0.3)} ${f1(y - h * 0.6)}L${f1(x - w * 0.18)} ${f1(y - h)}H${f1(x + w * 0.2)}L${f1(x + w * 0.32)} ${f1(y - h * 0.6)}Z" ${fill(col, `stroke:${rim};stroke-width:2;stroke-linejoin:round`)}/>`;
  s += `<path d="M${f1(x - w * 0.22)} ${f1(y - h * 0.64)}L${f1(x - w * 0.14)} ${f1(y - h * 0.92)}H${f1(x + w * 0.16)}L${f1(x + w * 0.24)} ${f1(y - h * 0.64)}Z" ${fill('color-mix(in oklab, var(--sim-series-7) 22%, var(--sim-bg-surface))')}/>`;
  for (const dx of [-0.3, 0.3]) s += `<circle cx="${f1(x + dx * w)}" cy="${f1(y - h * 0.12)}" r="${f1(h * 0.18)}" ${fill('var(--sim-label)')}/>`;
  return s;
}

function drone(x, y, w) {
  const col = 'var(--sim-series-1)', rim = shade(col, 60);
  let s = `<path d="M${f1(x - w * 0.42)} ${f1(y)}H${f1(x + w * 0.42)}" ${stroke(METAL, 6, 'stroke-linecap:round')}/>`;
  for (const sx of [-1, 1]) {
    s += `<path d="M${f1(x + sx * w * 0.42)} ${f1(y)}V${f1(y - w * 0.1)}" ${stroke(METAL, 5)}/>`;
    s += `<ellipse cx="${f1(x + sx * w * 0.42)}" cy="${f1(y - w * 0.12)}" rx="${f1(w * 0.2)}" ry="${f1(w * 0.035)}" ${fill('color-mix(in oklab, var(--sim-label) 30%, var(--sim-bg-surface))', `stroke:${METAL};stroke-width:2`)}/>`;
  }
  s += rect(x - w * 0.16, y - w * 0.08, w * 0.32, w * 0.16, w * 0.06, col, `stroke:${rim};stroke-width:2.5`);
  s += `<circle cx="${f1(x)}" cy="${f1(y + w * 0.11)}" r="${f1(w * 0.055)}" ${fill('var(--sim-label)', `stroke:${METAL};stroke-width:2`)}/>`;
  return s;
}

function juteBag(x, y, h, o = {}) {
  const w = h * 0.86, top = y - h * 0.78, rim = shade(JUTE, 58);
  let s = `<path d="M${f1(x - w * 0.25)} ${f1(top)}C${f1(x - w * 0.25)} ${f1(y - h * 1.08)} ${f1(x + w * 0.25)} ${f1(y - h * 1.08)} ${f1(x + w * 0.25)} ${f1(top)}" ${stroke(rim, Math.max(3, h * 0.05))}/>`;
  s += `<path d="M${f1(x - w * 0.5)} ${f1(top)}H${f1(x + w * 0.5)}L${f1(x + w * 0.45)} ${f1(y)}H${f1(x - w * 0.45)}Z" ${fill(JUTE, `stroke:${rim};stroke-width:2.5;stroke-linejoin:round`)}/>`;
  for (let i = 1; i < 5; i++) s += `<path d="M${f1(x - w * 0.48)} ${f1(top + (y - top) * i / 5)}H${f1(x + w * 0.48)}" ${stroke(`color-mix(in oklab, ${rim} 45%, transparent)`, 1.5)}/>`;
  for (let i = 1; i < 6; i++) s += `<path d="M${f1(x - w * 0.5 + w * i / 6)} ${f1(top)}V${f1(y)}" ${stroke(`color-mix(in oklab, ${rim} 35%, transparent)`, 1.5)}/>`;
  if (o.leaf !== false) s += `<path d="M${f1(x - h * 0.12)} ${f1(top + h * 0.42)}Q${f1(x)} ${f1(top + h * 0.12)} ${f1(x + h * 0.14)} ${f1(top + h * 0.3)}Q${f1(x)} ${f1(top + h * 0.5)} ${f1(x - h * 0.12)} ${f1(top + h * 0.42)}Z" ${fill('var(--sim-series-3)')}/>`;
  return s;
}

function plasticBag(x, y, h, o = {}) {
  const w = h * 0.8, rim = 'color-mix(in oklab, var(--sim-label) 42%, var(--sim-bg-surface))', t = y - h;
  const d = `M${f1(x - w * 0.46)} ${f1(y)}L${f1(x - w * 0.5)} ${f1(y - h * 0.62)}L${f1(x - w * 0.44)} ${f1(t)}H${f1(x - w * 0.2)}L${f1(x - w * 0.16)} ${f1(y - h * 0.7)}Q${f1(x)} ${f1(y - h * 0.6)} ${f1(x + w * 0.16)} ${f1(y - h * 0.7)}L${f1(x + w * 0.2)} ${f1(t)}H${f1(x + w * 0.44)}L${f1(x + w * 0.5)} ${f1(y - h * 0.62)}L${f1(x + w * 0.46)} ${f1(y)}Z`;
  let s = `<path d="${d}" ${fill(PLASTIC, `stroke:${rim};stroke-width:2.5;stroke-linejoin:round`)}/>`;
  for (const sx of [-1, 1]) s += `<ellipse cx="${f1(x + sx * w * 0.32)}" cy="${f1(t + h * 0.14)}" rx="${f1(w * 0.07)}" ry="${f1(h * 0.06)}" ${fill('var(--sim-bg-surface)', `stroke:${rim};stroke-width:1.8`)}/>`;
  s += `<path d="M${f1(x - w * 0.3)} ${f1(y - h * 0.08)}q${f1(w * 0.12)} ${f1(-h * 0.2)} ${f1(w * 0.04)} ${f1(-h * 0.4)}M${f1(x + w * 0.04)} ${f1(y - h * 0.06)}q${f1(-w * 0.1)} ${f1(-h * 0.2)} ${f1(w * 0.02)} ${f1(-h * 0.44)}M${f1(x + w * 0.32)} ${f1(y - h * 0.1)}q${f1(-w * 0.1)} ${f1(-h * 0.16)} ${f1(-w * 0.06)} ${f1(-h * 0.36)}" ${stroke(rim, 1.8)}/>`;
  return `<g transform="rotate(${o.tilt ?? -10} ${f1(x)} ${f1(y)})">${s}</g>`;
}

function sewingMachine(x, y, w) {
  const col = 'var(--sim-series-6)', rim = shade(col, 60), h = w * 0.62;
  let s = rect(x - w / 2, y - h * 0.22, w, h * 0.22, 4, METAL, `stroke:${shade(METAL, 60)};stroke-width:2`);
  s += `<path d="M${f1(x - w * 0.42)} ${f1(y - h * 0.22)}V${f1(y - h)}H${f1(x + w * 0.4)}V${f1(y - h * 0.62)}H${f1(x + w * 0.24)}V${f1(y - h * 0.22)}" ${fill('none', `stroke:${col};stroke-width:${f1(w * 0.14)};stroke-linejoin:round`)}/>`;
  s += `<path d="M${f1(x + w * 0.32)} ${f1(y - h * 0.62)}V${f1(y - h * 0.26)}" ${stroke(METAL, 3)}/>`;
  s += `<circle cx="${f1(x - w * 0.42)}" cy="${f1(y - h * 0.62)}" r="${f1(w * 0.12)}" ${fill(rim)}/>`;
  return s;
}

function clothRoll(x, y, h) {
  const w = h * 0.5, rim = shade(JUTE, 58);
  return rect(x - w / 2, y - h, w, h, w * 0.18, JUTE, `stroke:${rim};stroke-width:2.5`)
    + `<ellipse cx="${f1(x)}" cy="${f1(y - h)}" rx="${f1(w / 2)}" ry="${f1(w * 0.16)}" ${fill(shade(JUTE, 85), `stroke:${rim};stroke-width:2`)}/>`
    + `<path d="M${f1(x + w / 2)} ${f1(y - h * 0.3)}l${f1(w * 0.7)} ${f1(h * 0.24)}l${f1(-w * 0.2)} ${f1(h * 0.06)}H${f1(x)}" ${fill(JUTE, `stroke:${rim};stroke-width:2`)}/>`;
}

function priceTag(x, y, s) {
  const col = 'var(--sim-series-8)';
  return `<path d="M${f1(x - s)} ${f1(y - s * 0.5)}H${f1(x + s * 0.6)}L${f1(x + s)} ${f1(y)}L${f1(x + s * 0.6)} ${f1(y + s * 0.5)}H${f1(x - s)}Z" ${fill(`color-mix(in oklab, ${col} 22%, var(--sim-bg-surface))`, `stroke:${shade(col, 62)};stroke-width:2.5;stroke-linejoin:round`)}/>`
    + txt(x - s * 0.15, y + s * 0.2, RS + ' ?', s * 0.55);
}

export class EntrepreneurTasksBoardScene extends SvgScene {
  static WIDTH = 560;
  static PORTRAIT_WIDTH = 390;
  static HEIGHT = 490;
  static PORTRAIT_HEIGHT = 615;
  static CONTINUOUS = false;
  static BEAT_STEP_MAP = MAIN;
  static BEAT_MAPS = { 3: MAIN };
  static CONTROLS = [];
  static ARIA_LABEL = 'Entrepreneurs see opportunities where others see problems: a drone flies over a road full of cars (drones to watch traffic), and a jute bag stands beside a crumpled plastic bag (jute bags in place of plastic). Then the five tasks of an entrepreneur, round her, in no order: identifies a problem, takes risks, makes key decisions, combines factors of production, adds to the welfare of society. Then each task can be tapped to see what the jute bag maker does for it.';

  async setup() {
    this.pick = 0;
    await super.setup();
    this._onClick = (e) => {
      const b = e.target?.closest?.('[data-pick]');
      if (!b || this.stepIndex !== 2) return;
      this.pick = +b.dataset.pick;
      this.repaint();
    };
    this.root.addEventListener('click', this._onClick);
  }

  destroy() {
    this.root?.removeEventListener('click', this._onClick);
    super.destroy();
  }

  css() { return MONEY_CSS + PEOPLE_CSS + STALL_CSS + CSS; }

  enter() { this.pick = 0; }

  repaint() { super.repaint(); paintPeople(this); }

  stageHeight(st) { return Math.round((st.portrait ? 615 : 490) * st.W / (st.portrait ? 390 : 560)); }

  paint(st) {
    const P = st.portrait, DW = P ? 390 : 560, DH = P ? 615 : 490, k = (st.W / DW).toFixed(4), v = this.stepIndex;
    const out = v === 0 ? this.paintWorlds(P) : this.paintTasks(P, v === 2);
    return { svg: `<g transform="scale(${k})">${out.svg}</g>`, over: `<div style="position:absolute;left:0;top:0;width:${DW}px;height:${DH}px;transform:scale(${k});transform-origin:0 0">${out.over ?? ''}</div>` };
  }

  // b0: two small worlds.
  paintWorlds(P) {
    const W = P ? [[15, 10, 360, 285], [15, 315, 360, 285]] : [[10, 20, 265, 410], [285, 20, 265, 410]];
    let svg = '', over = '';
    W.forEach(([x, y, w, h]) => { svg += rect(x, y, w, h, 20, 'color-mix(in oklab, var(--sim-bg-surface) 70%, transparent)', 'stroke:var(--sim-stroke);stroke-width:2.5'); });
    // world 1: the road of cars and the drone
    {
      const [x, y, w, h] = W[0], cx = x + w / 2, dx = P ? x + 118 : cx, road = y + h * (P ? 0.7 : 0.66), rh = P ? 54 : 70;
      svg += rect(x + 2, road - rh / 2, w - 4, rh, 0, ROAD);
      for (let i = 0; i < 6; i++) svg += rect(x + 12 + i * (w / 6), road - 2, w / 14, 4, 2, 'var(--sim-bg-surface)');
      const cw = P ? 70 : 56, cars = P ? [x + 62, x + 160, x + 258] : [x + 44, x + 118, x + 192];
      cars.forEach((c, i) => { svg += car(c, road + rh * 0.38, cw, [2, 4, 6, 7][i]) + car(c + cw * 0.55, road - rh * 0.1, cw * 0.9, [5, 1, 8, 3][i]); });
      const dy = y + (P ? 96 : 104), dw = P ? 110 : 120;
      svg += `<path d="M${f1(dx - 8)} ${f1(dy + dw * 0.16)}L${f1(cx - w * 0.36)} ${f1(road - rh * 0.6)}H${f1(cx + w * 0.36)}L${f1(dx + 8)} ${f1(dy + dw * 0.16)}Z" class="tb-in" ${fill('color-mix(in oklab, var(--sim-accent) 12%, transparent)', 'stroke:var(--sim-accent);stroke-width:2;stroke-dasharray:7 6;--d:0.55s')}/>`;
      svg += `<g class="tb-fly">${drone(dx, dy, dw)}</g>`;
      over += P ? `<div class="tb-chip dash" style="left:${x + 70}px;top:${road + rh / 2 + 24}px">problem</div><div class="tb-chip acc" style="left:${x + w - 82}px;top:${dy - 4}px">opportunity</div>`
        : `<div class="tb-chip dash" style="left:${x + 68}px;top:${road + rh / 2 + 24}px">problem</div><div class="tb-chip acc" style="left:${cx}px;top:${y + 32}px">opportunity</div>`;
      over += P ? `<div class="tb-chip" style="left:${cx}px;top:${y + 28}px">drones to watch traffic</div>`
        : `<div class="tb-act" style="left:${x}px;top:${y + h + 6}px;width:${w}px;height:56px">drones to watch traffic</div>`;
    }
    // world 2: the plastic bag and the jute bag
    {
      const [x, y, w, h] = W[1], g = y + h * (P ? 0.79 : 0.7);
      svg += rect(x + 2, g, w - 4, P ? 10 : 12, 4, 'color-mix(in oklab, var(--sim-series-3) 30%, var(--sim-bg-surface))');
      const px = x + w * (P ? 0.27 : 0.27), jx = x + w * (P ? 0.7 : 0.72), jh = P ? 108 : 140;
      svg += plasticBag(px + (P ? 34 : 30), g + 4, P ? 60 : 64, { tilt: 14 }) + plasticBag(px - 8, g + 2, P ? 104 : 112);
      svg += `<g class="tb-in" style="--d:0.2s">${juteBag(jx, g + 2, jh)}</g>`;
      over += `<div class="tb-chip dash" style="left:${px + 10}px;top:${g + 36}px">problem</div><div class="tb-chip acc" style="left:${jx - (P ? 0 : 10)}px;top:${g - jh - (P ? 16 : 30)}px">opportunity</div>`;
      over += P ? `<div class="tb-chip" style="left:${x + w / 2}px;top:${y + 28}px">jute bags in place of plastic</div>`
        : `<div class="tb-act" style="left:${x}px;top:${y + h + 6}px;width:${w}px;height:56px">jute bags in place of plastic</div>`;
    }
    return { svg, over };
  }

  // b1 / b2: five tasks round the entrepreneur; b2 makes them buttons and shows the maker's action.
  paintTasks(P, act) {
    const C = P ? CARD_P : CARD_L, pick = act ? this.pick : -1;
    const ring = P ? [195, 300, 150, 200] : [280, 250, 190, 170];
    let svg = `<ellipse cx="${ring[0]}" cy="${ring[1]}" rx="${ring[2]}" ry="${ring[3]}" ${fill('color-mix(in oklab, var(--sim-series-5) 7%, transparent)', 'stroke:color-mix(in oklab, var(--sim-series-5) 45%, var(--sim-bg-surface));stroke-width:3;stroke-dasharray:10 8')}/>`;
    let over = '';
    const big = !act || P;
    if (big) {
      const m = P ? { x: 195, y: 448, h: 236, chip: 150 } : { x: 280, y: 408, h: 222, chip: 448 };
      over += personSlot('maker', { x: m.x, y: m.y, h: m.h, facing: 0, mood: 'happy' });
      over += `<div class="tb-chip acc" style="left:${m.x}px;top:${m.chip}px">An Entrepreneur</div>`;
    }
    if (pick >= 0) {
      const t = TASKS[pick], [tx, ty] = C.pos[pick];
      if (P) {
        // the action card under the ring: picture left, line right
        const bx = 12, by = 478, bw = 366, bh = 128;
                svg += rect(bx, by, bw, bh, 18, 'color-mix(in oklab, var(--sim-accent) 10%, var(--sim-bg-surface))', 'stroke:var(--sim-accent);stroke-width:3');
        const pic = this.picture(t.pic, bx + 76, by + bh / 2 + 2, 1.15);
        svg += `<g class="tb-in" style="--d:0.05s">${pic.svg}</g>`;
        over += pic.over;
        over += `<div class="tb-act" style="left:${bx + 146}px;top:${by}px;width:${bw - 156}px;height:${bh}px;font-size:22px">${t.act}</div>`;
      } else {
        // the centre becomes the action card: the maker small, the picture, the line
        const bx = 202, by = 136, bw = 156, bh = 330;
        svg += `<path d="M${tx} ${ty}L${bx + bw / 2} ${by + bh / 2}" ${stroke('var(--sim-accent)', 4, 'stroke-linecap:round')}/>`;
        svg += rect(bx, by, bw, bh, 18, 'color-mix(in oklab, var(--sim-accent) 10%, var(--sim-bg-surface))', 'stroke:var(--sim-accent);stroke-width:3');
        over += personSlot('maker', { x: bx + bw / 2, y: by + 118, h: 104, facing: 0, mood: 'happy' });
        const pic = this.picture(t.pic, bx + bw / 2, by + 196, 0.9);
        svg += `<g class="tb-in" style="--d:0.05s">${pic.svg}</g>`;
        over += pic.over;
        over += `<div class="tb-act" style="left:${bx + 4}px;top:${by + 236}px;width:${bw - 8}px;height:${bh - 240}px;font-size:20px">${t.act}</div>`;
      }
    }
    TASKS.forEach((t, i) => {
      const [x, y] = C.pos[i], on = pick === i, off = pick >= 0 && !on;
      const tag = act ? 'button' : 'div';
      const attrs = act ? ` type="button" data-pick="${i}" aria-pressed="${on}"` : '';
      const cls = `tb-card${act ? ' sv-hit tap btn' : ' tb-pop'}${on ? ' on' : ''}${off ? ' off' : ''}`;
      over += `<${tag}${attrs} class="${cls}" style="left:${x}px;top:${y}px;width:${C.w[i]}px;--d:${0.1 + i * 0.12}s">${iconSvg(t.icon, t.tone)}<span>${t.label}</span></${tag}>`;
    });
    return { svg, over };
  }

  // A small picture for one task, centred on (x, y); s scales it.
  picture(kind, x, y, s) {
    let svg = '', over = '';
    if (kind === 'litter') {
      svg += rect(x - 62 * s, y + 26 * s, 124 * s, 8 * s, 3, ROAD);
      svg += plasticBag(x - 26 * s, y + 28 * s, 56 * s) + plasticBag(x + 26 * s, y + 28 * s, 40 * s) + plasticBag(x + 50 * s, y + 28 * s, 26 * s);
    } else if (kind === 'savings') {
      svg += coinPile(x, y + 34 * s, 1000, { r: 12 * s });
    } else if (kind === 'price') {
      svg += juteBag(x - 32 * s, y + 34 * s, 50 * s, { leaf: false }) + juteBag(x + 18 * s, y + 34 * s, 76 * s, { leaf: false });
      svg += priceTag(x + 44 * s, y - 34 * s, 22 * s);
    } else if (kind === 'factors') {
      svg += clothRoll(x - 48 * s, y + 34 * s, 54 * s) + sewingMachine(x + 6 * s, y + 34 * s, 58 * s);
      over += personSlot('buyer2', { x: x + 56 * s, y: y + 34 * s, h: 92 * s, facing: -1, mood: 'smile' });
    } else {
      svg += rect(x - 64 * s, y + 26 * s, 128 * s, 10 * s, 3, ROAD);
      svg += icon('tree', x - 40 * s, y - 2 * s, 56 * s, 3) + icon('tree', x + 44 * s, y - 2 * s, 56 * s, 3);
      svg += juteBag(x + 2 * s, y + 26 * s, 50 * s);
    }
    return { svg, over };
  }

  testState() { return { view: this.stepIndex, pick: this.stepIndex === 2 ? this.pick : -1 }; }
}
