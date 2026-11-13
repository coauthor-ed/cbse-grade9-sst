/**
 * EconomistWorkScene - L04 s04 "Where Economists Work" (2 beats).
 *   Top strip, both beats: how every economist works: choices -> costs -> what may happen.
 *   b0 policy:   two big place cards: policy-making (Parliament, "for governments") and finance (a bank,
 *                "for people who invest"). Two empty dashed slots wait below: "more places".
 *   b1 research: the two slots fill: research and education (a school, "for students and the public") and
 *                business consulting (an office, "for firms"). Under the cards: where their data comes from,
 *                government reports and company statements.
 *   Tap a card: it lights, the others dim, and the line under the board says the work in one sentence.
 * The cards say who the work is for, not the question's own examples. Colours are tokens only. ASCII only.
 */
import { SvgScene, fill } from 'simulations/base/kit/SimSvg.js';
import { iconSvg } from 'simulations/base/kit/SimIcons.js';
import { civicSvg } from 'simulations/base/kit/SimCivic.js';

const MAP = [[{ idx: 0, dwellMs: null }], [{ idx: 1, dwellMs: null }]];
const f1 = (v) => (+v).toFixed(1);

const CARDS = [
  { id: 'policy', name: ['policy-making'], who: 'for governments', whoP: 'for governments', tone: 1, pic: 'parliament', pw: 1.3,
    say: 'Policy-making: guiding governments on taxes and welfare spending.' },
  { id: 'finance', name: ['finance'], who: 'for people who invest', whoP: 'for investors', tone: 4, pic: 'bank', pw: 0.95,
    say: 'Finance: advising people on where to invest their money.' },
  { id: 'research', name: ['research and', 'education'], who: 'for students and the public', whoP: 'for students', tone: 3, pic: 'school', pw: 1.2,
    say: 'Research and education: studying economic trends and teaching others.' },
  { id: 'consult', name: ['business', 'consulting'], who: 'for firms', whoP: 'for firms', tone: 2, pic: 'office', pw: 0.95,
    say: 'Business consulting: helping firms plan growth or work better.' },
];
const STRIP = [['choices', 'route', 3], ['costs', 'coin', 4], ['what may happen', 'eye', 6]];

const CSS = `
.wk-card { position: absolute; background: transparent; border: 0; padding: 0; cursor: pointer; border-radius: 20px; }
.wk-card:focus-visible { outline: 3px solid var(--sim-accent); outline-offset: 3px; }
.wk-say { position: absolute; left: 12px; right: 12px; transform: translateY(-50%); text-align: center; font: 800 19px/1.25 var(--sim-font); color: var(--sim-label); }
.wk-p .wk-say { font-size: 16px; }
svg .wk-pop { transform-box: fill-box; transform-origin: center; animation: wk-pop 0.45s ease-out both; animation-delay: var(--d, 0s); }
@keyframes wk-pop { 0% { transform: scale(0.6); opacity: 0; } 100% { transform: none; opacity: 1; } }
svg .wk-in { animation: wk-in 0.5s ease-out both; animation-delay: var(--d, 0s); }
@keyframes wk-in { from { opacity: 0; } to { opacity: 1; } }
`;

const text = (x, y, t, size, col = 'var(--sim-label)', extra = '') =>
  `<text x="${f1(x)}" y="${f1(y)}"${/text-anchor/.test(extra) ? '' : ' text-anchor="middle"'}${extra} style="fill:${col};font:800 ${size}px var(--sim-font)">${t}</text>`;

function icon(name, cx, cy, size, tone) {
  const inner = (iconSvg(name, tone).match(/<svg[^>]*>([\s\S]*)<\/svg>/) || [])[1] || '';
  return `<g transform="translate(${f1(cx - size / 2)} ${f1(cy - size / 2)}) scale(${(size / 48).toFixed(3)})" style="--i:var(--sim-series-${tone})">${inner}</g>`;
}

export class EconomistWorkScene extends SvgScene {
  static WIDTH = 560;
  static PORTRAIT_WIDTH = 390;
  static HEIGHT = 584;
  static PORTRAIT_HEIGHT = 624;
  static CONTINUOUS = false;
  static BEAT_STEP_MAP = MAP;
  static BEAT_MAPS = { 2: MAP };
  static CONTROLS = [];
  static ARIA_LABEL = 'Economists compare choices, their costs and what may happen. They work in four kinds of places: policy-making for governments, finance for people who invest, research and education for students and the public, and business consulting for firms. They use data from government reports and company statements. Tap a card to read about the work.';

  async setup() {
    this.pick = null;
    this.fresh = true;
    await super.setup();
    this._onClick = (e) => {
      const b = e.target?.closest?.('[data-act]');
      if (!b) return;
      this.act(b.dataset.act, b.dataset.val);
    };
    this.root.addEventListener('click', this._onClick);
  }

  destroy() {
    this.root?.removeEventListener('click', this._onClick);
    super.destroy();
  }

  css() { return CSS; }

  enter() {
    this.pick = null;
    this.fresh = true;
    this.after(2.4, () => { this.fresh = false; });
  }

  act(a, v) {
    const n = this.stepIndex === 0 ? 2 : 4;
    if (a === 'card' && CARDS.slice(0, n).some((c) => c.id === v)) { this.pick = this.pick === v ? null : v; this.fresh = false; this.repaint(); }
  }

  stageHeight(st) { return st.portrait ? 600 : 560; }

  paint(st) {
    const P = st.portrait, W = st.W, step = this.stepIndex, fr = this.fresh;
    const anim = (cls, d) => (fr ? ` class="${cls}" style="--d:${f1(d)}s"` : '');
    let svg = '', over = '';
    // The strip: how they work.
    const sfs = P ? 16 : 19, sy = P ? 34 : 36, ig = P ? 0 : 30, gap = P ? 20 : 34;
    const ws = STRIP.map(([t]) => (P ? 0 : ig + 8) + t.length * sfs * 0.56 + (P ? 26 : 18));
    let x = (W - ws.reduce((a, b) => a + b, 0) - gap * 2) / 2;
    STRIP.forEach(([t, ic, tone], i) => {
      const w = ws[i];
      let g = `<rect x="${f1(x)}" y="${f1(sy - 20)}" width="${f1(w)}" height="40" rx="20" ${fill(`color-mix(in oklab, var(--sim-series-${tone}) 14%, var(--sim-bg-surface))`, `stroke:var(--sim-series-${tone});stroke-width:2.5`)}/>`;
      if (P) g += text(x + w / 2, sy + sfs * 0.36, t, sfs);
      else g += icon(ic, x + 9 + ig / 2, sy, ig, tone) + text(x + 15 + ig, sy + sfs * 0.36, t, sfs, 'var(--sim-label)', ' text-anchor="start"');
      if (i < 2) {
        const ax = x + w + 5, bx = x + w + gap - 5;
        g += `<line x1="${f1(ax)}" y1="${sy}" x2="${f1(bx - 6)}" y2="${sy}" style="stroke:var(--sim-label-muted);stroke-width:3;stroke-linecap:round"/>`
          + `<path d="M${f1(bx)} ${sy}L${f1(bx - 9)} ${sy - 6}L${f1(bx - 9)} ${sy + 6}Z" ${fill('var(--sim-label-muted)')}/>`;
      }
      svg += `<g${anim('wk-in', 0.05 + i * 0.25)}>${g}</g>`;
      x += w + gap;
    });
    // The cards: 2 x 2.
    const m = P ? 12 : 18, cg = P ? 10 : 16, cw = (W - 2 * m - cg) / 2, ch = 176, y0 = P ? 74 : 78;
    const nfs = P ? 19 : 22, wfs = P ? 15 : 17;
    CARDS.forEach((c, i) => {
      const cx = m + (i % 2) * (cw + cg), cy = y0 + Math.floor(i / 2) * (ch + cg);
      const shown = i < 2 || step >= 1;
      if (!shown) {
        if (i === 2) svg += `<rect x="${f1(cx)}" y="${f1(cy)}" width="${f1(W - 2 * m)}" height="${ch}" rx="20" ${fill('none', 'stroke:var(--sim-stroke);stroke-width:2.5;stroke-dasharray:9 7;opacity:0.7')}/>`
          + text(W / 2, cy + ch / 2 + 8, 'more places', nfs, 'var(--sim-label-muted)');
        return;
      }
      const lit = !this.pick || this.pick === c.id, on = this.pick === c.id, col = `var(--sim-series-${c.tone})`;
      let g = `<rect x="${f1(cx)}" y="${f1(cy)}" width="${f1(cw)}" height="${ch}" rx="20" ${fill(`color-mix(in oklab, ${col} ${on ? 20 : 9}%, var(--sim-bg-surface))`, `stroke:${col};stroke-width:${on ? 4.5 : 2.5}`)}/>`;
      const pw = (P ? 64 : 98) * c.pw, gy = cy + 76;
      g += civicSvg(c.pic, cx + cw / 2, gy, { w: pw });
      c.name.forEach((ln, k) => { g += text(cx + cw / 2, gy + (P ? 26 : 28) + k * (nfs + 7), ln, nfs); });
      g += text(cx + cw / 2, gy + (P ? 26 : 28) + c.name.length * (nfs + 7) - 1, c.whoP, wfs, `color-mix(in oklab, ${col} 70%, var(--sim-label))`);
      const d = i < 2 ? 0.7 + i * 0.25 : 0.3 + (i - 2) * 0.3;
      const pop = fr && (step === 0 || i >= 2);
      svg += `<g${pop ? ` class="wk-pop" style="--d:${f1(d)}s"` : ''}><g style="opacity:${lit ? 1 : 0.35}">${g}</g></g>`;
      over += `<button type="button" class="wk-card sv-hit" data-act="card" data-val="${c.id}" aria-pressed="${on}" aria-label="${c.name.join(' ')}, ${c.who}" style="left:${f1(cx)}px;top:${f1(cy)}px;width:${f1(cw)}px;height:${ch}px"></button>`;
    });
    // b1: where the data comes from.
    const dy = y0 + 2 * ch + cg + (P ? 30 : 32);
    if (step >= 1) {
      let g = text(P ? W / 2 : m + 4, dy + 7, 'their data:', P ? 16 : 18, 'var(--sim-label-muted)', P ? '' : ' text-anchor="start"');
      const items = [['government reports', 3], ['company statements', 2]];
      items.forEach(([t, tone], k) => {
        const ix = P ? W / 2 - 96 : 130 + k * 212, iy = P ? dy + 30 + k * 30 : dy;
        g += civicSvg('report', ix + 12, iy + 18, { w: P ? 26 : 30 });
        g += text(ix + 32, iy + 6, t, 16, 'var(--sim-label)', ' text-anchor="start"');
      });
      svg += `<g${anim('wk-in', 1.0)}>${g}</g>`;
    }
    const say = this.pick ? CARDS.find((c) => c.id === this.pick).say : 'Tap a card to see the work.';
    over += `<div class="wk-say" style="top:${P ? dy + 100 : dy + 50}px">${say}</div>`;
    return { svg, over: `<div class="${P ? 'wk-p' : 'wk-l'}">${over}</div>` };
  }

  testState() { return { step: this.stepIndex, pick: this.pick }; }
}
