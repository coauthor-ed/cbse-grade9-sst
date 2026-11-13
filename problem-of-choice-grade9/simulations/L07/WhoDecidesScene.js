/**
 * WhoDecidesScene - L07 s00 "Economic Systems" (1 beat). The three key questions as three cards; under each, who
 * answers it. Three switches inside the figure pick the system:
 *   planned - the planning office (a government building with a plan sheet) answers all three;
 *   market  - private sellers (a shop) and buyers answer all three, through demand and supply;
 *   mixed   - both: the planning office and a shop share each answer.
 * On entry the deciders for "planned" drop in under the cards (0.5 s each). Rest: planned, all three buttons shown.
 * The next slides teach each system; this one only shows that the answer to "who decides" is what differs.
 * Colours are tokens only. ASCII only.
 */
import { SvgScene, fill } from 'simulations/base/kit/SimSvg.js';
import { iconSvg } from 'simulations/base/kit/SimIcons.js';
import { civicSvg } from 'simulations/base/kit/SimCivic.js';

const MAP = [[{ idx: 0, dwellMs: null }]];
const f1 = (v) => (+v).toFixed(1);

const QS = [
  { id: 'what', l1: 'What to', l2: 'produce?', icon: 'crate', tone: 3 },
  { id: 'how', l1: 'How to', l2: 'produce?', icon: 'factory', tone: 6 },
  { id: 'whom', l1: 'For whom to', l2: 'produce?', icon: 'crowd', tone: 1 },
];
const SYS = [
  { id: 'planned', name: 'planned', say: 'Planned economy: the planning office decides.' },
  { id: 'market', name: 'market', say: 'Market economy: buyers and sellers decide.' },
  { id: 'mixed', name: 'mixed', say: 'Mixed economy: both decide together.' },
];

const CSS = `
.wd-row { position: absolute; left: 0; right: 0; transform: translateY(-50%); display: flex; justify-content: center; gap: 10px; }
.wd-btn { min-height: 44px; min-width: 104px; padding: 5px 14px; cursor: pointer; white-space: nowrap;
  border-radius: calc(12px * var(--look-radius, 1)); font: 800 19px/1.1 var(--sim-font); background: var(--sim-bg-surface); color: var(--sim-label);
  border: 2.5px solid var(--sim-stroke); box-shadow: 0 calc(3px * var(--look-lip, 1)) 0 var(--sim-stroke); }
.wd-btn:active { transform: translateY(3px); box-shadow: none; }
.wd-btn[aria-pressed="true"] { background: color-mix(in oklab, var(--sim-accent) 16%, var(--sim-bg-surface)); border-color: var(--sim-accent); box-shadow: 0 calc(3px * var(--look-lip, 1)) 0 var(--sim-accent); }
.wd-btn:focus-visible { outline: 3px solid var(--sim-accent); outline-offset: 3px; }
.wd-p .wd-btn { font-size: 17px; min-width: 96px; padding: 4px 10px; }
.wd-say { position: absolute; left: 10px; right: 10px; transform: translateY(-50%); text-align: center; font: 800 21px/1.25 var(--sim-font); color: var(--sim-label); }
.wd-p .wd-say { font-size: 18px; }
svg .wd-drop { animation: wd-drop 0.5s cubic-bezier(.3,1.4,.5,1) both; animation-delay: var(--d, 0s); }
@keyframes wd-drop { 0% { transform: translateY(-34px); opacity: 0; } 100% { transform: none; opacity: 1; } }
`;

const text = (x, y, t, size, col = 'var(--sim-label)', extra = '') =>
  `<text x="${f1(x)}" y="${f1(y)}"${/text-anchor/.test(extra) ? '' : ' text-anchor="middle"'}${extra} style="fill:${col};font:800 ${size}px var(--sim-font)">${t}</text>`;

function icon(name, cx, cy, size, tone) {
  const inner = (iconSvg(name, tone).match(/<svg[^>]*>([\s\S]*)<\/svg>/) || [])[1] || '';
  return `<g transform="translate(${f1(cx - size / 2)} ${f1(cy - size / 2)}) scale(${(size / 48).toFixed(3)})" style="--i:var(--sim-series-${tone})">${inner}</g>`;
}
const card = (x, y, w, h) => `<rect x="${f1(x)}" y="${f1(y)}" width="${f1(w)}" height="${f1(h)}" rx="16" ${fill('var(--sim-bg-surface)', 'stroke:var(--sim-stroke);stroke-width:2.5')}/>`;

export class WhoDecidesScene extends SvgScene {
  static WIDTH = 560;
  static PORTRAIT_WIDTH = 390;
  static HEIGHT = 504;
  static PORTRAIT_HEIGHT = 624;
  static CONTINUOUS = false;
  static BEAT_STEP_MAP = MAP;
  static BEAT_MAPS = { 1: MAP };
  static CONTROLS = [];
  static ARIA_LABEL = 'Three cards: what to produce, how to produce, for whom to produce. Under each card, who answers it. In a planned economy the planning office answers all three. In a market economy buyers and sellers answer them. In a mixed economy both answer them together. Three buttons switch between the systems.';

  async setup() {
    this.sys = 'planned';
    this.fresh = true;
    await super.setup();
    this._onClick = (e) => {
      const b = e.target?.closest?.('[data-act]');
      if (!b) return;
      if (b.dataset.act === 'sys' && SYS.some((s) => s.id === b.dataset.val)) {
        this.sys = b.dataset.val; this.fresh = true; this.repaint();
        this.after(1.6, () => { this.fresh = false; });
      }
    };
    this.root.addEventListener('click', this._onClick);
  }

  destroy() {
    this.root?.removeEventListener('click', this._onClick);
    super.destroy();
  }

  css() { return CSS; }

  enter() {
    this.sys = 'planned';
    this.fresh = true;
    this.after(2.2, () => { this.fresh = false; });
  }

  stageHeight(st) { return st.portrait ? 600 : 480; }

  decider(kind, cx, gy, w, d) {
    const fr = this.fresh, cls = fr ? ` class="wd-drop" style="--d:${f1(d)}s"` : '';
    if (kind === 'planned') return `<g${cls}>${civicSvg('planOffice', cx, gy, { w })}</g>`;
    if (kind === 'market') {
      return `<g${cls}>${civicSvg('shop', cx - w * 0.12, gy, { w: w * 0.78 })}${icon('crowd', cx + w * 0.36, gy - w * 0.17, w * 0.36, 1)}</g>`;
    }
    return `<g${cls}>${civicSvg('planOffice', cx - w * 0.25, gy, { w: w * 0.5 })}${civicSvg('shop', cx + w * 0.26, gy, { w: w * 0.46 })}</g>`;
  }

  paint(st) {
    const P = st.portrait, W = st.W, s = SYS.find((x) => x.id === this.sys);
    let svg = '', over = '';
    if (!P) {
      const cw = 166, gap = (W - 3 * cw) / 4, top = 18, ch = 132;
      QS.forEach((q, i) => {
        const x = gap + i * (cw + gap), cx = x + cw / 2;
        svg += card(x, top, cw, ch) + icon(q.icon, cx, top + 36, 54, q.tone);
        svg += text(cx, top + 86, q.l1, 21) + text(cx, top + 116, q.l2, 21);
        svg += `<path d="M${f1(cx)} ${top + ch + 6}V${top + ch + 34}" ${fill('none', 'stroke:var(--sim-stroke);stroke-width:3;stroke-dasharray:6 6;stroke-linecap:round')}/>`;
        svg += `<path d="M${f1(cx - 8)} ${top + ch + 28}L${f1(cx)} ${top + ch + 38}L${f1(cx + 8)} ${top + ch + 28}" ${fill('none', 'stroke:var(--sim-stroke);stroke-width:3;stroke-linejoin:round;stroke-linecap:round')}/>`;
        svg += this.decider(this.sys, cx, 318, 150, 0.15 + i * 0.4);
      });
      svg += text(W / 2, 205, 'who answers?', 18, 'var(--sim-label-muted)');
      over += `<div class="wd-say" style="top:356px">${s.say}</div>`;
      over += `<div class="wd-row" style="top:436px">${SYS.map((x) => `<button type="button" class="sv-hit wd-btn" data-act="sys" data-val="${x.id}" aria-pressed="${x.id === this.sys}">${x.name}</button>`).join('')}</div>`;
      return { svg, over: `<div class="wd-l">${over}</div>` };
    }
    const rh = 124, top = 14, cw = 190;
    svg += text(W - 92, top + 6, 'who answers?', 16, 'var(--sim-label-muted)');
    QS.forEach((q, i) => {
      const y = top + 16 + i * rh, cy = y + (rh - 14) / 2;
      svg += card(12, y, cw, rh - 14) + icon(q.icon, 46, cy, 42, q.tone);
      svg += text(76, cy - 7, q.l1, 19, 'var(--sim-label)', ' text-anchor="start"') + text(76, cy + 21, q.l2, 19, 'var(--sim-label)', ' text-anchor="start"');
      svg += `<path d="M${cw + 18} ${f1(cy)}H${cw + 40}" ${fill('none', 'stroke:var(--sim-stroke);stroke-width:3;stroke-dasharray:5 5;stroke-linecap:round')}/>`;
      svg += `<path d="M${cw + 34} ${f1(cy - 7)}L${cw + 43} ${f1(cy)}L${cw + 34} ${f1(cy + 7)}" ${fill('none', 'stroke:var(--sim-stroke);stroke-width:3;stroke-linejoin:round;stroke-linecap:round')}/>`;
      svg += this.decider(this.sys, 292, y + rh - 22, 128, 0.15 + i * 0.4);
    });
    over += `<div class="wd-say" style="top:440px">${s.say}</div>`;
    over += `<div class="wd-row" style="top:520px">${SYS.map((x) => `<button type="button" class="sv-hit wd-btn" data-act="sys" data-val="${x.id}" aria-pressed="${x.id === this.sys}">${x.name}</button>`).join('')}</div>`;
    return { svg, over: `<div class="wd-p">${over}</div>` };
  }

  testState() { return { step: this.stepIndex, sys: this.sys }; }
}
