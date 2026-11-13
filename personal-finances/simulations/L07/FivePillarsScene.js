/**
 * FivePillarsScene - L07 s07 "Five Pillars" (2 beats). SvgScene, design 560 x 490 landscape, 390 x 640 portrait.
 * Book Fig 5.2: a roof "Personal finance" on five columns (income, budgeting, saving, investing, protection), each
 * with one icon; income tax is the ground line under all of them.
 *   b0 The five pillars: the columns rise in turn; tap a column to lift it and read its line
 *      (Income: salary, business, rent, interest; Budgeting: plan, needs before wants; Saving: keep a part aside
 *      first; Investing: grow faster than prices; Protection: insurance, careful borrowing). Rest: Income lifted.
 *   b1 Before we move on: the same picture, calm, each column with one number from this course (Rs 1,500 a month;
 *      Rs 500 saved first; gullak Rs 3,600; 8% deposit Rs 540; Rs 500 premium). Nothing new to learn.
 * Tokens only. ASCII only.
 */
import { SvgScene, stroke, fill, shade } from 'simulations/base/kit/SimSvg.js';
import { iconSvg } from 'simulations/base/kit/SimIcons.js';
import { MONEY_CSS, rs, gullak } from '../shared/MoneyKit.js';

const f1 = (v) => (+v).toFixed(1);
const MAIN = [[{ idx: 0, dwellMs: null }], [{ idx: 1, dwellMs: null }]];
const PILLARS = [
  { name: 'Income', icon: 'coin', tone: 2, line: 'salary, business, rent, interest', tag: [rs(1500), 'a month', 'a month'] },
  { name: 'Budgeting', icon: 'calendar', tone: 1, line: 'plan, needs before wants', tag: [rs(500), 'saved first', 'first'] },
  { name: 'Saving', icon: 'gullak', tone: 6, line: 'keep a part aside first', tag: [rs(3600), 'gullak', 'gullak'] },
  { name: 'Investing', icon: 'tree', tone: 3, line: 'grow faster than prices', tag: [rs(540), '8% deposit', 'at 8%'] },
  { name: 'Protection', icon: 'shield', tone: 7, line: 'insurance, careful borrowing', tag: [rs(500), 'premium', 'premium'] },
];
const INK = 'var(--sim-label)', MUTED = 'var(--sim-label-muted)', ACC = 'var(--sim-accent)', ACC_INK = shade('var(--sim-accent)', 62);
const STONE = 'color-mix(in oklab, var(--sim-series-4) 14%, var(--sim-bg-surface))', STONE_EDGE = 'color-mix(in oklab, var(--sim-series-4) 45%, var(--sim-label))';
const ROOF = 'color-mix(in oklab, var(--sim-series-8) 70%, var(--sim-bg-surface))', ROOF_INK = 'var(--sim-bg-deep)';
const GROUND = 'color-mix(in oklab, var(--sim-series-2) 30%, var(--sim-bg-surface))', GROUND_INK = 'color-mix(in oklab, var(--sim-series-2) 40%, var(--sim-label))';

const CSS = `
.fp-ab { position: absolute; transform: translate(-50%, -50%); display: flex; gap: 10px; }
.fp-btn { min-height: 46px; padding: 5px 16px; cursor: pointer; white-space: nowrap;
  border-radius: calc(12px * var(--look-radius, 1)); font: 800 19px/1.1 var(--sim-font); background: var(--sim-bg-surface); color: var(--sim-label);
  border: 2.5px solid var(--sim-stroke); box-shadow: 0 calc(3px * var(--look-lip, 1)) 0 var(--sim-stroke); }
.fp-btn:active { transform: translateY(3px); box-shadow: none; }
.fp-btn:focus-visible, .fp-hit:focus-visible { outline: 3px solid var(--sim-accent); outline-offset: 3px; }
.fp-hit { position: absolute; background: transparent; border: 0; padding: 0; cursor: pointer; border-radius: 10px; }
svg .fp-lift { transition: transform 0.35s cubic-bezier(.3,1.4,.5,1); }
@media (prefers-reduced-motion: reduce) { svg .fp-lift { transition: none; } }
`;

const text = (x, y, t, size, col = INK, anchor = 'middle', w = 800, extra = '') =>
  `<text x="${f1(x)}" y="${f1(y)}" text-anchor="${anchor}"${extra} style="fill:${col};font:${w} ${size}px var(--sim-font)">${t}</text>`;
const shield = (x, y, s, tone) => {
  const k = s / 48, c = `var(--sim-series-${tone})`;
  return `<g transform="translate(${f1(x - s / 2)} ${f1(y - s / 2)}) scale(${f1(k)})">`
    + `<path d="M24 4L41 10V22C41 33 33 40 24 44C15 40 7 33 7 22V10Z" ${fill(`color-mix(in oklab, ${c} 64%, black)`)}/>`
    + `<path d="M24 2L41 8V20C41 31 33 38 24 42C15 38 7 31 7 20V8Z" ${fill(c)}/>`
    + `<path d="M24 8L35 12V20C35 28 30 33 24 36Z" ${fill(`color-mix(in oklab, ${c} 45%, white)`)}/></g>`;
};
const icon = (name, x, y, s, tone) => {
  if (name === 'shield') return shield(x, y, s, tone);
  if (name === 'gullak') return gullak(x, y + s * 0.5, { w: s * 0.95 });
  return `<g transform="translate(${f1(x - s / 2)} ${f1(y - s / 2)}) scale(${f1(s / 48)})">${iconSvg(name, tone)}</g>`;
};
const calm = () => !!globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

export class FivePillarsScene extends SvgScene {
  static WIDTH = 560;
  static PORTRAIT_WIDTH = 390;
  static HEIGHT = 490;
  static PORTRAIT_HEIGHT = 640;
  static CONTINUOUS = false;
  static BEAT_STEP_MAP = MAIN;
  static BEAT_MAPS = { 2: MAIN };
  static CONTROLS = [];
  static ARIA_LABEL = 'Five pillars hold up a roof labelled personal finance: income (salary, business, rent, interest), budgeting (plan, needs before wants), saving (keep a part aside first), investing (grow faster than prices) and protection (insurance, careful borrowing). Under all of them, the ground: income tax, a citizen\'s responsibility. In the recap each pillar carries a number from the course: 1,500 rupees a month, 500 rupees saved first, a gullak of 3,600 rupees, an 8 per cent deposit of 540 rupees, and a 500 rupee premium.';

  async setup() {
    this.fresh = false;
    this.sel = 0;
    await super.setup();
    this._onClick = (e) => {
      const b = e.target?.closest?.('[data-act]');
      const a = b?.dataset.act;
      if (a === 'replay') this.run();
      else if (a === 'pillar') { this.clear(); this.sel = Number(b.dataset.val); this.repaint(); }
    };
    this.root.addEventListener('click', this._onClick);
  }

  destroy() {
    this.root?.removeEventListener('click', this._onClick);
    super.destroy();
  }

  css() { return MONEY_CSS + CSS; }

  clear() { for (const t of (this._timers ?? []).splice(0)) clearTimeout(t); this.fresh = false; }

  enter() { this.clear(); this.sel = 0; this.after(0.05, () => this.run()); }

  run() {
    this.clear();
    this.sel = 0;
    if (calm()) { this.repaint(); return; }
    this.fresh = true;
    this.after(this.stepIndex === 0 ? 2.4 : 2.2, () => { this.fresh = false; this.repaint(); });
    this.repaint();
  }

  skip() {
    if (!this.fresh) return false;
    this.clear();
    this.repaint();
    return true;
  }

  busy() { return this.fresh; }

  stageHeight(st) { return Math.round((st.portrait ? 640 : 490) * st.W / (st.portrait ? 390 : 560)); }

  anim(cls, d, body) { return `<g${this.fresh ? ` class="${cls}" style="--d:${d}s"` : ''}>${body}</g>`; }

  paint(st) {
    const P = st.portrait, DW = P ? 390 : 560, DH = P ? 640 : 490, k = (st.W / DW).toFixed(4);
    const recap = this.stepIndex === 1;
    const G = P
      ? { L: 12, R: 378, apex: 18, eave: 92, roofT: 76, roofS: 25, cw: 64, gap: 10, top: 112, bot: 430, ico: 40, name: 23, tagY: 382, tagS: [19, 15], ground: 446, call: 518 }
      : { L: 22, R: 538, apex: 16, eave: 98, roofT: 82, roofS: 28, cw: 90, gap: 13, top: 118, bot: 380, ico: 46, name: 25, tagY: 340, tagS: [21, 17], ground: 392, call: 466 };
    let svg = '', over = '';
    const W = G.R - G.L, x0 = G.L + (W - (5 * G.cw + 4 * G.gap)) / 2;
    // the ground: income tax under everything
    svg += `<rect x="${G.L}" y="${G.ground}" width="${W}" height="${P ? 46 : 40}" rx="10" ${fill(GROUND, `stroke:${GROUND_INK};stroke-width:2`)}/>`;
    svg += text((G.L + G.R) / 2, G.ground + (P ? 30 : 28), 'income tax: a citizen\'s responsibility', P ? 19 : 21, INK, 'middle', 800);
    // base slab
    svg += `<rect x="${f1(x0 - 10)}" y="${G.bot}" width="${f1(5 * G.cw + 4 * G.gap + 20)}" height="${G.ground - G.bot - 4}" rx="4" ${fill(STONE, `stroke:${STONE_EDGE};stroke-width:2.5`)}/>`;
    // the five columns
    PILLARS.forEach((p, i) => {
      const x = x0 + i * (G.cw + G.gap), cx = x + G.cw / 2, up = !recap && this.sel === i, lift = up ? -14 : 0;
      const tone = `var(--sim-series-${p.tone})`;
      let col = '';
      col += `<rect x="${f1(x + 6)}" y="${G.top + 20}" width="${G.cw - 12}" height="${G.bot - G.top - 30}" ${fill(STONE, `stroke:${up ? ACC : STONE_EDGE};stroke-width:${up ? 3.5 : 2.5}`)}/>`;
      for (let f = 1; f < 3; f++) col += `<path d="M${f1(x + 6 + ((G.cw - 12) * f) / 3)} ${G.top + 76}V${G.bot - 18}" ${stroke(STONE_EDGE, 1.5, 'opacity:0.35')}/>`;
      col += `<rect x="${f1(x)}" y="${G.top}" width="${G.cw}" height="22" rx="5" ${fill(`color-mix(in oklab, ${tone} 30%, var(--sim-bg-surface))`, `stroke:${up ? ACC : STONE_EDGE};stroke-width:2.5`)}/>`;
      col += `<rect x="${f1(x + 2)}" y="${G.bot - 12}" width="${G.cw - 4}" height="12" rx="3" ${fill(STONE, `stroke:${STONE_EDGE};stroke-width:2`)}/>`;
      col += icon(p.icon, cx, G.top + 52, G.ico, p.tone);
      const nz = recap && !P ? 21 : G.name, ny = recap ? (G.top + 78 + G.tagY - 30) / 2 : (G.top + 82 + G.bot - 18) / 2;
      col += text(cx, ny + nz * 0.35, p.name, nz, up ? ACC_INK : INK, 'middle', 900, ` transform="rotate(-90 ${f1(cx)} ${f1(ny)})"`);
      if (recap) {
        const tw = G.cw + G.gap - 3, th = G.tagS[0] + G.tagS[1] + 18;
        col += this.anim('mk-pop', (0.4 + i * 0.3).toFixed(2), `<rect x="${f1(cx - tw / 2)}" y="${f1(G.tagY - th / 2)}" width="${f1(tw)}" height="${f1(th)}" rx="10" ${fill(`color-mix(in oklab, ${tone} 18%, var(--sim-bg-surface))`, `stroke:${tone};stroke-width:2.5`)}/>`
          + text(cx, G.tagY - 3, p.tag[0], G.tagS[0], INK, 'middle', 900) + text(cx, G.tagY + G.tagS[1] + 2, P ? p.tag[2] : p.tag[1], G.tagS[1], INK, 'middle', 800));
      }
      svg += this.anim('mk-rise', (0.2 + i * 0.25).toFixed(2), `<g class="fp-lift" style="transform:translateY(${lift}px)">${col}</g>`);
      if (!recap) over += `<button type="button" class="sv-hit fp-hit" data-act="pillar" data-val="${i}" aria-pressed="${up}" aria-label="${p.name}: ${p.line}" style="left:${f1(x - 2)}px;top:${G.top - 4}px;width:${G.cw + 4}px;height:${G.bot - G.top + 8}px"></button>`;
    });
    // the roof
    svg += this.anim('mk-pop', this.stepIndex === 0 ? 1.5 : 0.1, `<path d="M${G.L} ${G.eave}L${(G.L + G.R) / 2} ${G.apex}L${G.R} ${G.eave}Z" ${fill(ROOF, `stroke:${shade('var(--sim-series-8)', 70)};stroke-width:3;stroke-linejoin:round`)}/>`
      + `<rect x="${G.L}" y="${G.eave}" width="${W}" height="${G.top - G.eave - 2}" rx="4" ${fill(shade('var(--sim-series-8)', 75))}/>`
      + text((G.L + G.R) / 2, G.roofT, 'Personal finance', G.roofS, ROOF_INK, 'middle', 900));
    // the line under the ground: the lifted pillar's line, or the recap note
    if (!recap) {
      const p = PILLARS[this.sel];
      if (P) svg += text(195, G.call, `${p.name}:`, 22, ACC_INK, 'middle', 900) + text(195, G.call + 32, p.line, 22, INK, 'middle', 800) + text(195, G.call + 70, 'tap a pillar', 18, MUTED, 'middle', 700);
      else svg += text(280, G.call, `${p.name}: ${p.line}`, 23, INK, 'middle', 800);
      if (!P) svg += text(538, 30, 'tap a pillar', 18, MUTED, 'end', 700);
    } else {
      svg += text(P ? 195 : 280, G.call, 'numbers from this course', P ? 20 : 21, MUTED, 'middle', 800);
    }
    if (!this.fresh) over += `<div class="fp-ab" style="left:${P ? 330 : 500}px;top:${P ? 616 : 466}px">${this.stepIndex === 0 && !P ? '' : '<button type="button" class="sv-hit fp-btn" data-act="replay">replay</button>'}</div>`;
    return { svg: `<g transform="scale(${k})">${svg}</g>`, over: `<div style="position:absolute;left:0;top:0;width:${DW}px;height:${DH}px;transform:scale(${k});transform-origin:0 0">${over}</div>` };
  }

  testState() { return { view: this.stepIndex, fresh: this.fresh, sel: this.sel, pillars: PILLARS.map((p) => [p.name, p.tag.join(' ')]) }; }
}
