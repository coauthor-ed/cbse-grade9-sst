/**
 * TimeDayScene - L02 s08b "Time Is Scarce Too" (2 beats).
 *   b0 day:  Meera's day as one column of 24 hour cells, like a timetable. The groups fill in from the top,
 *            0.45 s each: getting ready and chores 2, travel 1, school 7, homework 2, meals 2, free 2, sleep 8
 *            (= 24). Each group is labelled to the right with its hours. At rest the 2 free hours are lit
 *            (accent, "2 free hours"); the rest of the day is soft. Skip while filling, Replay at rest.
 *   b1 hour: one free hour is given to one use: playing, reading, helping at home or resting. The first free
 *            cell takes the chosen use's colour and icon; the option says "1 hour". The other three options
 *            are dimmed and say "given up". Rest (cold start): playing (the order of the sentence). Any option
 *            can be chosen.
 * One layout in both orientations: landscape puts the options in a column on the right, portrait in a 2 x 2
 * grid under the day. Colours are tokens only. Drawn in stage px (st.W wide). ASCII only.
 */
import { SvgScene, fill, stroke } from 'simulations/base/kit/SimSvg.js';
import { iconSvg } from 'simulations/base/kit/SimIcons.js';

const MAP = [[{ idx: 0, dwellMs: null }], [{ idx: 1, dwellMs: null }]];
const DAY = [
  { id: 'ready', label: 'getting ready, chores', short: 'ready, chores', h: 2, tone: 6 },
  { id: 'travel', label: 'travel', h: 1, tone: 7 },
  { id: 'school', label: 'school', h: 7, tone: 1 },
  { id: 'homework', label: 'homework', h: 2, tone: 2 },
  { id: 'meals', label: 'meals', h: 2, tone: 5 },
  { id: 'free', label: 'free', h: 2, tone: 0 },
  { id: 'sleep', label: 'sleep', h: 8, tone: 8 },
];
const USES = [
  { id: 'play', label: 'playing', icon: 'ball', tone: 3 },
  { id: 'read', label: 'reading', icon: 'book', tone: 2 },
  { id: 'help', label: 'helping at home', icon: 'house', tone: 6 },
  { id: 'rest', label: 'resting', icon: 'cup', tone: 4 },
];
const STEP_S = 0.45;
const FILL_END = STEP_S * (DAY.length - 1) + 0.6;
const f1 = (v) => (+v).toFixed(1);
const ser = (n) => `var(--sim-series-${n})`;
const FREE = 'var(--sim-accent)';

/** A ball on the SimIcons 48 grid (SimIcons has none). */
const BALL = (x, y, s, tone) => `<svg x="${f1(x)}" y="${f1(y)}" width="${f1(s)}" height="${f1(s)}" viewBox="0 0 48 48" aria-hidden="true">`
  + `<circle cx="24" cy="24" r="19" style="fill:${ser(tone)}"/><path d="M24 5a19 19 0 0 1 0 38M9 14c8 5 22 5 30 0M9 34c8-5 22-5 30 0" style="fill:none;stroke:color-mix(in oklab, ${ser(tone)} 45%, white);stroke-width:3.5"/></svg>`;
const useIcon = (u, x, y, s) => (u.icon === 'ball' ? BALL(x, y, s, u.tone)
  : iconSvg(u.icon, u.tone).replace('viewBox="0 0 48 48" width="48" height="48"', `x="${f1(x)}" y="${f1(y)}" width="${f1(s)}" height="${f1(s)}" viewBox="0 0 48 48"`));

const CSS = `
svg .td-fill { transform-box: fill-box; transform-origin: top; animation: td-fill 0.42s ease-out both; animation-delay: var(--d, 0s); }
@keyframes td-fill { from { transform: scaleY(0); opacity: 0.2; } to { transform: none; opacity: 1; } }
svg .td-in { animation: td-in 0.4s ease-out both; animation-delay: var(--d, 0s); }
@keyframes td-in { from { opacity: 0; } to { opacity: 1; } }
svg .td-glow { animation: td-glow 1.6s ease-in-out 3; }
@keyframes td-glow { 50% { opacity: 0.35; } }
.td-row { position: absolute; transform: translate(-50%, -50%); display: flex; gap: 10px; white-space: nowrap; }
.td-btn { min-height: 44px; padding: 4px 16px; cursor: pointer; white-space: nowrap; border-radius: calc(12px * var(--look-radius, 1));
  font: 800 18px/1.1 var(--sim-font); background: var(--sim-bg-surface); color: var(--sim-label);
  border: 2.5px solid var(--sim-stroke); box-shadow: 0 calc(3px * var(--look-lip, 1)) 0 var(--sim-stroke); }
.td-btn:active { transform: translateY(3px); box-shadow: none; }
.td-hit { position: absolute; padding: 0; border: 0; background: none; border-radius: 14px; cursor: pointer; }
.td-hit:hover { background: color-mix(in oklab, var(--sim-accent) 8%, transparent); }
.td-btn:focus-visible, .td-hit:focus-visible { outline: 3px solid var(--sim-accent); outline-offset: 3px; }
`;

export class TimeDayScene extends SvgScene {
  static WIDTH = 560;
  static PORTRAIT_WIDTH = 390;
  static HEIGHT = 470;   // the host budgets the panel from this (about 465 / HEIGHT at 1280x720)
  static PORTRAIT_HEIGHT = 560;
  static CONTINUOUS = false;
  static BEAT_STEP_MAP = MAP;
  static BEAT_MAPS = { 2: MAP };
  static CONTROLS = [];
  static ARIA_LABEL = 'Meera\'s day as 24 hour cells: getting ready and chores 2 hours, travel 1, school 7, homework 2, meals 2, free 2, sleep 8. Two free hours are left. Give one free hour to playing, reading, helping at home or resting: the other three are given up.';

  async setup() {
    this.use = 'play';
    this.fresh = false;
    this.pend = [];
    await super.setup();
    this._onClick = (e) => {
      const b = e.target?.closest?.('[data-act]');
      if (b) this.act(b.dataset.act, b.dataset.val);
    };
    this.root.addEventListener('click', this._onClick);
  }

  destroy() {
    this.root?.removeEventListener('click', this._onClick);
    super.destroy();
  }

  css() { return CSS; }

  cancel() { for (const c of this.pend) c(); this.pend = []; }

  enter(step) {
    this.cancel();
    this.use = 'play';
    this.fresh = true;
    const end = step === 0 ? FILL_END + 0.4 : 0.8;
    this.pend.push(this.after(end, () => { this.fresh = false; this.repaint(); }));
  }

  act(a, v) {
    if (a === 'skip' && this.stepIndex === 0) { this.cancel(); this.fresh = false; }
    else if (a === 'replay' && this.stepIndex === 0) this.enter(0);
    else if (a === 'use' && this.stepIndex === 1 && USES.some((u) => u.id === v) && v !== this.use) {
      this.use = v;
      this.cancel();
      this.fresh = true;
      this.pend.push(this.after(0.8, () => { this.fresh = false; this.repaint(); }));
    } else return;
    this.repaint();
  }

  layout(st) {
    const P = st.portrait, W = st.W;
    const cell = P ? 14 : 15, top = P ? 14 : 18, bx = P ? 26 : 56, bw = P ? 64 : 84;
    const bot = top + 24 * cell;
    const lx = bx + bw + 16;
    const ox = P ? 0 : Math.max(lx + 160, W - 188), ow = P ? (W - 12) / 2 : W - ox - 4;
    return { P, W, cell, top, bx, bw, bot, lx, ox, ow, fs: P ? 16 : 18,
      optY: (i) => (P ? bot + 34 + Math.floor(i / 2) * 60 : top + 66 + i * 70),
      optX: (i) => (P ? 4 + (i % 2) * (ow + 4) : ox) };
  }

  stageHeight(st) {
    const L = this.layout(st);
    return Math.round(L.P ? L.bot + 34 + 60 + 50 + 16 : L.bot + 22);
  }

  paint(st) {
    const L = this.layout(st), step = this.stepIndex, P = L.P;
    const anim = this.fresh && !globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const use = USES.find((u) => u.id === this.use);
    let svg = '', over = '';
    let h0 = 0;
    // The day: one cell per hour, grouped; each group labelled to the right.
    DAY.forEach((g, gi) => {
      const y0 = L.top + h0 * L.cell, gh = g.h * L.cell, free = g.id === 'free';
      const col = free ? FREE : `color-mix(in oklab, ${ser(g.tone)} ${step === 1 ? 32 : 55}%, var(--sim-bg-surface))`;
      const fillCls = anim && step === 0 ? ` class="td-fill" style="--d:${(gi * STEP_S).toFixed(2)}s"` : '';
      let cells = '';
      for (let k = 0; k < g.h; k++) {
        const y = y0 + k * L.cell;
        const given = step === 1 && free && k === 0;
        cells += `<rect x="${L.bx}" y="${f1(y + 0.75)}" width="${L.bw}" height="${f1(L.cell - 1.5)}" rx="3" ${fill(given ? ser(use.tone) : col)}/>`;
      }
      svg += `<g${fillCls}>${cells}</g>`;
      svg += `<rect x="${L.bx - 2}" y="${f1(y0)}" width="${L.bw + 4}" height="${f1(gh)}" rx="5" ${fill('none', `stroke:${free ? FREE : 'var(--sim-label-muted)'};stroke-width:${free ? 3.5 : 2}`)}/>`;
      // Label: a short tick, then the words and hours.
      const cy = y0 + gh / 2;
      // Small neighbours are nudged apart; the leader slants to meet its label.
      const ly = cy + (g.id === 'ready' ? -5 : g.id === 'travel' ? 6 : g.id === 'meals' && step === 1 ? -6 : 0);
      const lab = free
        ? (step === 1 ? '1 free hour left' : '2 free hours')
        : `${g.short ?? g.label}  ${g.h} h`;
      const ink = free ? FREE : step === 1 ? 'var(--sim-label-muted)' : 'var(--sim-label)';
      const tin = anim && step === 0 ? ` class="td-in" style="--d:${(gi * STEP_S + 0.2).toFixed(2)}s"` : '';
      svg += `<g${tin}><line x1="${L.bx + L.bw + 4}" y1="${f1(cy)}" x2="${L.lx - 4}" y2="${f1(free && step === 1 ? y0 + L.cell * 1.5 : ly)}" ${stroke(free ? FREE : 'var(--sim-label-muted)', 2)}/>`
        + `<text x="${L.lx}" y="${f1(free && step === 1 ? y0 + 2 * L.cell + 9 : ly + 6)}" style="fill:${ink};font:800 ${free && step === 0 ? L.fs + 3 : L.fs}px var(--sim-font)">${lab}</text></g>`;
      if (free && step === 0 && !anim) svg += `<rect class="td-glow" x="${L.bx - 7}" y="${f1(y0 - 5)}" width="${L.bw + 14}" height="${f1(gh + 10)}" rx="8" ${fill('none', `stroke:${FREE};stroke-width:3;stroke-dasharray:8 6`)}/>`;
      if (free && step === 1) {
        // The given hour: the use's icon on the first free cell, and its name beside it.
        svg += useIcon(use, L.bx + L.bw / 2 - 12, y0 + L.cell / 2 - 12, 24);
        svg += `<text x="${L.lx}" y="${f1(y0 + L.cell / 2 + 7)}" style="fill:${ser(use.tone)};font:800 ${L.fs}px var(--sim-font)">1 h ${use.label}</text>`;
      }
      h0 += g.h;
    });
    // "24 hours" on the column.
    svg += `<text x="${f1(L.bx + L.bw / 2)}" y="${f1(L.bot + (P ? 20 : 20))}" text-anchor="middle" style="fill:var(--sim-label-muted);font:800 ${P ? 15 : 16}px var(--sim-font)">24 h</text>`;

    if (step === 0) {
      const bx = P ? L.W / 2 + 40 : L.ox + L.ow / 2, by = P ? L.bot + 64 : L.top + 40;
      over += `<div class="td-row" style="left:${f1(bx)}px;top:${f1(by)}px">${anim ? '<button type="button" class="sv-hit td-btn" data-act="skip">Skip</button>' : '<button type="button" class="sv-hit td-btn" data-act="replay">Replay</button>'}</div>`;
    } else {
      // The four uses of one free hour: the chosen one gets the hour, the other three are given up.
      if (!P) svg += `<text x="${f1(L.ox + 4)}" y="${f1(L.top + 20)}" style="fill:var(--sim-label-muted);font:800 ${L.fs}px var(--sim-font)">one free hour for</text>`;
      USES.forEach((u, i) => {
        const x = L.optX(i), y = L.optY(i), w = L.ow, h = P ? 52 : 60, on = u.id === this.use;
        const pop = anim && on ? ' class="td-in"' : '';
        svg += `<g${pop} style="opacity:${on ? 1 : 0.5}">`
          + `<rect x="${f1(x)}" y="${f1(y)}" width="${f1(w)}" height="${h}" rx="12" ${fill(on ? `color-mix(in oklab, ${ser(u.tone)} 16%, var(--sim-bg-surface))` : 'var(--sim-bg-surface)', `stroke:${on ? ser(u.tone) : 'var(--sim-label-muted)'};stroke-width:${on ? 3.5 : 2}${on ? '' : ';stroke-dasharray:7 5'}`)}/>`
          + useIcon(u, x + 8, y + h / 2 - 15, 30)
          + `<text x="${f1(x + 46)}" y="${f1(y + h / 2 - (P ? 3 : 4))}" style="fill:var(--sim-label);font:800 ${P ? 15 : 17}px var(--sim-font)">${u.label}</text>`
          + `<text x="${f1(x + 46)}" y="${f1(y + h / 2 + (P ? 15 : 17))}" style="fill:${on ? 'var(--sim-good)' : 'var(--sim-bad)'};font:800 ${P ? 14 : 16}px var(--sim-font)">${on ? '1 hour' : 'given up'}</text></g>`;
        over += `<button type="button" class="sv-hit td-hit" data-act="use" data-val="${u.id}" aria-pressed="${on}" aria-label="give the free hour to ${u.label}"`
          + ` style="left:${f1(x - 3)}px;top:${f1(y - 3)}px;width:${f1(w + 6)}px;height:${h + 6}px"></button>`;
      });
    }
    return { svg, over };
  }

  testState() { return { step: this.stepIndex, use: this.use, fresh: this.fresh }; }
}
