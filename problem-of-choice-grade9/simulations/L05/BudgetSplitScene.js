/**
 * BudgetSplitScene - L05 s08 "Think About It" (2 beats). The government budget as 10 equal parts (no money art,
 * no amounts), split between two sides: "health and education" (a school and a hospital) and "defence and space"
 * (a plain shield and an upright rocket; no flags, nothing pointed at anyone).
 *   b0 split: two stacks in dashed bins, at rest 5 / 5. "+1 part" under a side moves one block across from the
 *             other side (it flies, 0.6 s); "10 parts in all" never changes. Under each side "N parts" equals
 *             the blocks in its stack. Named cases: "half and half" 5/5, "more to health and education" 7/3,
 *             "more to defence and space" 3/7.
 *   b1 cost:  the same board; every part a side does not get is a dashed ghost block in its bin with a "given up"
 *             tag: what that side could have done with it. At 5/5 each side gives up 5; a move adds a ghost on
 *             the side that loses the part. Status: "no split is free". Neutral: no side is ever marked right.
 * SvgScene; landscape and portrait have their own layouts. Colours are tokens only. ASCII only.
 */
import { SvgScene, fill, chip } from 'simulations/base/kit/SimSvg.js';
import { iconSvg } from 'simulations/base/kit/SimIcons.js';

const MAP = [[{ idx: 0, dwellMs: null }], [{ idx: 1, dwellMs: null }]];
const TOTAL = 10;
const SIDES = [
  { name: ['health and', 'education'], full: 'health and education', tone: 3, pics: ['school', 'hospital'], more: ['more to health', 'and education'] },
  { name: ['defence and', 'space'], full: 'defence and space', tone: 1, pics: ['shield', 'rocket'], more: ['more to defence', 'and space'] },
];
const CASES = [[5, 5], [7, 3], [3, 7]];
const FLY_S = 0.6;
const f1 = (v) => (+v).toFixed(1);

const CSS = `
.bs-row { position: absolute; left: 0; right: 0; transform: translateY(-50%); display: flex; justify-content: center; align-items: center; gap: 10px; }
.bs-btn { min-height: 44px; padding: 5px 14px; cursor: pointer; white-space: nowrap;
  border-radius: calc(12px * var(--look-radius, 1)); font: 800 17px/1.1 var(--sim-font); background: var(--sim-bg-surface); color: var(--sim-label);
  border: 2.5px solid var(--c, var(--sim-stroke)); box-shadow: 0 calc(3px * var(--look-lip, 1)) 0 var(--c, var(--sim-stroke)); }
.bs-btn:active { transform: translateY(3px); box-shadow: none; }
.bs-btn[aria-pressed="true"] { background: color-mix(in oklab, var(--sim-accent) 16%, var(--sim-bg-surface)); border-color: var(--sim-accent); box-shadow: 0 calc(3px * var(--look-lip, 1)) 0 var(--sim-accent); }
.bs-btn:disabled { opacity: 0.4; cursor: default; }
.bs-btn:focus-visible { outline: 3px solid var(--sim-accent); outline-offset: 3px; }
.bs-abs { position: absolute; transform: translate(-50%, -50%); }
.bs-abs:active { transform: translate(-50%, calc(-50% + 3px)); }
.bs-add { font-size: 19px; padding: 5px 16px; }
.bs-two { white-space: normal; line-height: 1.15; font-size: 15px; padding: 4px 10px; }
.bs-p .bs-two { font-size: 16px; width: 160px; }
.bs-l .bs-two { width: 190px; }
.bs-status { font: 800 19px/1 var(--sim-font); color: var(--sim-label); padding: 8px 14px; border-radius: 999px; background: var(--sim-bg-surface); border: 2.5px dashed var(--sim-label-muted); }
svg .bs-fly { animation: bs-fly ${FLY_S}s cubic-bezier(0.3, 0.7, 0.3, 1) both; }
@keyframes bs-fly { from { transform: translate(var(--dx), var(--dy)); } to { transform: none; } }
svg .bs-in { animation: bs-in 0.5s ease-out both; animation-delay: var(--d, 0s); }
@keyframes bs-in { from { opacity: 0; } to { opacity: 1; } }
`;

/** A side's picture on the 48 grid, centred on (cx, cy), size px across. */
function picSvg(kind, cx, cy, size, n) {
  const tf = `translate(${f1(cx - size / 2)} ${f1(cy - size / 2)}) scale(${(size / 48).toFixed(3)})`;
  const B = 'var(--i)', D = 'color-mix(in oklab, var(--i) 64%, black)', L = 'color-mix(in oklab, var(--i) 45%, white)', G = 'var(--sim-gold)';
  let body;
  if (kind === 'shield') {
    body = `<path d="M24 4L40 10V24C40 34 32 41 24 44C16 41 8 34 8 24V10Z" fill="${D}"/><path d="M24 4L40 10V24C40 33 32 39 24 42C16 39 8 33 8 24V10Z" fill="${B}"/>`
      + `<path d="M24 9L35 13.5V24C35 30.5 30 35 24 37.5Z" fill="${L}"/>`;
  } else if (kind === 'rocket') {
    body = `<path d="M17 25L9 34V41L17 35Z" fill="${D}"/><path d="M31 25L39 34V41L31 35Z" fill="${D}"/>`
      + `<path d="M24 3C31.5 9 33 19 31.5 36H16.5C15 19 16.5 9 24 3Z" fill="${B}"/><path d="M24 3C27.5 6 29 9 30 13H18C19 9 20.5 6 24 3Z" fill="${L}"/>`
      + `<circle cx="24" cy="21" r="4.2" fill="${L}"/><circle cx="24" cy="21" r="2.4" fill="${D}"/><path d="M19 37H29L24 46Z" fill="${G}"/>`;
  } else {
    body = (iconSvg(kind, n).match(/<svg[^>]*>([\s\S]*)<\/svg>/) || [])[1] || '';
  }
  return `<g transform="${tf}" style="--i:var(--sim-series-${n})">${body}</g>`;
}

const text = (x, y, t, size, col = 'var(--sim-label)', extra = '') =>
  `<text x="${f1(x)}" y="${f1(y)}" text-anchor="middle" dominant-baseline="central"${extra} style="fill:${col};font:800 ${size}px var(--sim-font)">${t}</text>`;

export class BudgetSplitScene extends SvgScene {
  static WIDTH = 560;
  static PORTRAIT_WIDTH = 390;
  static HEIGHT = 504;
  static PORTRAIT_HEIGHT = 616;
  static CONTINUOUS = false;
  static BEAT_STEP_MAP = MAP;
  static BEAT_MAPS = { 2: MAP };
  static CONTROLS = [];
  static ARIA_LABEL = 'The government budget as 10 equal parts, split between health and education, and defence and space. At first it is 5 and 5. Tap +1 part under a side to move one part to it from the other side; the total stays 10. Cases: half and half (5 and 5), more to health and education (7 and 3), more to defence and space (3 and 7). Then every part a side does not get is shown as a dashed block, given up: no split is free, and there is no single right answer.';

  async setup() {
    this.counts = [5, 5];
    this.fly = null;
    this.moved = false;
    await super.setup();
    this._onClick = (e) => {
      const b = e.target?.closest?.('[data-act]');
      if (!b || b.disabled) return;
      this.act(b.dataset.act, Number(b.dataset.val));
    };
    this.root.addEventListener('click', this._onClick);
  }

  destroy() {
    this.root?.removeEventListener('click', this._onClick);
    super.destroy();
  }

  css() { return CSS; }

  enter() {
    this.counts = [5, 5];
    this.fly = null;
    this.moved = false;
  }

  act(a, v) {
    if (a === 'add' && (v === 0 || v === 1)) {
      const j = 1 - v;
      if (this.counts[j] <= 0) return;
      this.counts[j] -= 1; this.counts[v] += 1;
      this.fly = { from: j, to: v };
      this.after(FLY_S + 0.35, () => { this.fly = null; this.repaint(); });
    } else if (a === 'case' && CASES[v]) {
      this.counts = CASES[v].slice(); this.fly = null;
    } else return;
    this.moved = true;
    this.repaint();
  }

  layout(st) {
    const P = st.portrait, W = st.W, cx = (i) => W * (1 + 2 * i) / 4;
    return P
      ? { P, W, cx, head: 22, pic: 66, ps: 50, pdx: 30, nm: [110, 132], binTop: 158, step: 20, bh: 15, bw: 116, base: 358, cnt: 392, add: 432, more: 490, half: 548, H: 590, nfs: 20, cfs: 23 }
      : { P, W, cx, head: 22, pic: 68, ps: 56, pdx: 36, nm: [112], binTop: 142, step: 19, bh: 14, bw: 150, base: 332, cnt: 364, add: 404, more: 452, H: 480, nfs: 22, cfs: 24 };
  }

  stageHeight(st) { return this.layout(st).H; }

  slot(L, i, k) { return { x: L.cx(i) - L.bw / 2, y: L.base - (k + 1) * L.step + (L.step - L.bh) }; }

  paint(st) {
    const L = this.layout(st), P = L.P, cost = this.stepIndex === 1;
    let svg = '', over = '';
    SIDES.forEach((sd, i) => {
      const x = L.cx(i), c = this.counts[i], tone = `var(--sim-series-${sd.tone})`;
      svg += picSvg(sd.pics[0], x - L.pdx, L.pic, L.ps, sd.tone) + picSvg(sd.pics[1], x + L.pdx, L.pic, L.ps, sd.tone);
      if (P) sd.name.forEach((ln, k) => { svg += text(x, L.nm[0] - 4 + k * 28, ln, L.nfs); });
      else svg += text(x, L.nm[0], sd.full, L.nfs);
      // The bin has room for all 10 parts.
      svg += `<rect x="${f1(x - L.bw / 2 - 9)}" y="${f1(L.binTop - 8)}" width="${f1(L.bw + 18)}" height="${f1(L.base - L.binTop + 16)}" rx="12" ${fill(`color-mix(in srgb, ${tone} 7%, transparent)`, `stroke:color-mix(in srgb, ${tone} 65%, var(--sim-stroke));stroke-width:2.5;stroke-dasharray:8 6`)}/>`;
      for (let k = 0; k < c; k++) {
        const s = this.slot(L, i, k);
        let extra = '';
        if (this.fly && this.fly.to === i && k === c - 1) {
          const from = this.slot(L, this.fly.from, this.counts[this.fly.from]);
          extra = ` class="bs-fly" style="--dx:${f1(from.x - s.x)}px;--dy:${f1(from.y - s.y)}px"`;
        }
        svg += `<g${extra}><rect x="${f1(s.x)}" y="${f1(s.y)}" width="${f1(L.bw)}" height="${f1(L.bh)}" rx="5" ${fill(`color-mix(in srgb, ${tone} 78%, var(--sim-bg-surface))`, `stroke:color-mix(in srgb, ${tone} 70%, var(--sim-label));stroke-width:2`)}/></g>`;
      }
      if (cost && c < TOTAL) {
        // Every part this side does not get: a dashed ghost, "given up".
        for (let k = c; k < TOTAL; k++) {
          const s = this.slot(L, i, k), fresh = this.fly && this.fly.from === i && k === c;
          svg += `<rect${fresh ? ' class="bs-in" style="--d:0.3s"' : ''} x="${f1(s.x)}" y="${f1(s.y)}" width="${f1(L.bw)}" height="${f1(L.bh)}" rx="5" ${fill('transparent', 'stroke:var(--sim-label-muted);stroke-width:2;stroke-dasharray:6 4')}/>`;
        }
        const top = this.slot(L, i, TOTAL - 1).y, bot = this.slot(L, i, c).y + L.bh, my = (top + bot) / 2;
        const g = TOTAL - c, tw = P ? 108 : 128, th = g >= 2 ? 30 : 26;
        svg += `<rect x="${f1(x - tw / 2)}" y="${f1(my - th / 2)}" width="${f1(tw)}" height="${f1(th)}" rx="${f1(th / 2)}" ${fill('var(--sim-bg-surface)', 'stroke:var(--sim-label-muted);stroke-width:2.5;stroke-dasharray:6 4')}/>`;
        svg += text(x, my + 1, `${g} given up`, P ? 17 : 19, 'var(--sim-label)');
      }
      svg += text(x, L.cnt, `${c} ${c === 1 ? 'part' : 'parts'}`, L.cfs);
      const pulse = !this.moved && !cost;
      over += `<button type="button" class="sv-hit bs-btn bs-abs bs-add tap btn" data-act="add" data-val="${i}"${this.counts[1 - i] === 0 ? ' disabled' : ''}`
        + ` aria-label="one more part for ${sd.full}, taken from the other side" style="--c:${tone};left:${f1(x)}px;top:${f1(L.add)}px${pulse ? ';outline:3px dashed var(--sim-accent);outline-offset:4px' : ''}">+1 part</button>`;
      const ci = i + 1, on = this.counts.join() === CASES[ci].join();
      over += `<button type="button" class="sv-hit bs-btn bs-abs bs-two tap btn" data-act="case" data-val="${ci}" aria-pressed="${on}" aria-label="${sd.more.join(' ')}: ${CASES[ci].join(' and ')}" style="left:${f1(x)}px;top:${f1(L.more)}px">${sd.more[0]}<br>${sd.more[1]}</button>`;
    });
    const half = `<button type="button" class="sv-hit bs-btn tap btn" data-act="case" data-val="0" aria-pressed="${this.counts.join() === '5,5'}">half and half</button>`;
    const total = chip('10 parts in all', 0, 0, { tone: 'plain', static: true });
    const status = cost ? '<span class="bs-status" role="status">no split is free</span>' : '';
    if (P) {
      over += `<div class="bs-row" style="top:${L.head}px">${total}${status}</div>`;
      over += `<div class="bs-row" style="top:${L.half}px">${half}</div>`;
    } else {
      over += `<div class="bs-row" style="top:${L.head}px">${total}${status}${half}</div>`;
    }
    return { svg, over: `<div class="${P ? 'bs-p' : 'bs-l'}">${over}</div>` };
  }

  testState() { return { step: this.stepIndex, counts: this.counts.join(','), total: this.counts[0] + this.counts[1] }; }
}
