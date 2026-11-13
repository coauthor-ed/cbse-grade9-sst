/**
 * SurveyLoopScene - L04 s06 "The Economic Survey" (3 beats). One year of measure, plan, spend.
 *   b0 survey:     the Ministry of Finance's Economic Survey (a report), tagged "measure". Beside it, what it looks
 *                  back at in the past year: farming, industry, services, jobs, prices, education, health.
 *   b1 parliament: an arrow "before the Budget" takes the Survey to Parliament, tagged "plan": the Union Budget.
 *                  A second arrow from Parliament: the data explained to citizens.
 *   b2 loop:       the year, tagged "spend", joins the ring: Budget -> the year -> "new data" -> the Survey.
 *                  "Run a year": a dot goes round the ring, each stop lights as it passes, the year count goes up.
 * No real numbers, no years named. Colours are tokens only. ASCII only.
 */
import { SvgScene, fill } from 'simulations/base/kit/SimSvg.js';
import { iconSvg } from 'simulations/base/kit/SimIcons.js';
import { civicSvg } from 'simulations/base/kit/SimCivic.js';

const MAP = [[{ idx: 0, dwellMs: null }], [{ idx: 1, dwellMs: null }], [{ idx: 2, dwellMs: null }]];
const f1 = (v) => (+v).toFixed(1);
const RUN = 4.8;

const TOPICS = [['farming', 'field', 3], ['industry', 'factory', 1], ['services', 'shop', 4], ['jobs', 'hammer', 6],
  ['prices', 'coin', 2], ['education', 'school', 5], ['health', 'hospital', 7]];
const SAY = {
  0: 'Each year the Survey looks back at the whole economy.',
  1: 'Parliament gets the Survey before the Budget.',
  2: 'Measure, plan, spend, then measure again.',
};
const PHASE = ['measure: the Survey', 'plan: the Budget', 'spend: the year', 'measure again'];

const CSS = `
.sl-row { position: absolute; left: 0; right: 0; transform: translateY(-50%); display: flex; justify-content: center; align-items: center; gap: 14px; }
.sl-btn { min-height: 44px; padding: 5px 16px; cursor: pointer; white-space: nowrap;
  border-radius: calc(12px * var(--look-radius, 1)); font: 800 18px/1.1 var(--sim-font); background: var(--sim-bg-surface); color: var(--sim-label);
  border: 2.5px solid var(--sim-accent); box-shadow: 0 calc(3px * var(--look-lip, 1)) 0 var(--sim-accent); }
.sl-btn:active { transform: translateY(3px); box-shadow: none; }
.sl-btn:disabled { opacity: 0.55; cursor: default; }
.sl-btn:focus-visible { outline: 3px solid var(--sim-accent); outline-offset: 3px; }
.sl-year { font: 800 18px/1 var(--sim-font); color: var(--sim-label); padding: 8px 14px; border-radius: 999px;
  background: color-mix(in oklab, var(--sim-accent) 14%, var(--sim-bg-surface)); border: 2px solid var(--sim-accent); }
.sl-say { position: absolute; left: 12px; right: 12px; transform: translateY(-50%); text-align: center; font: 800 19px/1.25 var(--sim-font); color: var(--sim-label); }
.sl-p .sl-say { font-size: 17px; }
.sl-p .sl-btn, .sl-p .sl-year { font-size: 16px; }
svg .sl-pop { transform-box: fill-box; transform-origin: center; animation: sl-pop 0.45s ease-out both; animation-delay: var(--d, 0s); }
@keyframes sl-pop { 0% { transform: scale(0.6); opacity: 0; } 100% { transform: none; opacity: 1; } }
svg .sl-in { animation: sl-in 0.5s ease-out both; animation-delay: var(--d, 0s); }
@keyframes sl-in { from { opacity: 0; } to { opacity: 1; } }
svg .sl-halo { opacity: 0; transition: opacity 0.3s ease; }
svg .sl-halo.on { opacity: 1; }
`;

const text = (x, y, t, size, col = 'var(--sim-label)', extra = '') =>
  `<text x="${f1(x)}" y="${f1(y)}"${/text-anchor/.test(extra) ? '' : ' text-anchor="middle"'}${extra} style="fill:${col};font:800 ${size}px var(--sim-font)">${t}</text>`;

function icon(name, cx, cy, size, tone) {
  const inner = (iconSvg(name, tone).match(/<svg[^>]*>([\s\S]*)<\/svg>/) || [])[1] || '';
  return `<g transform="translate(${f1(cx - size / 2)} ${f1(cy - size / 2)}) scale(${(size / 48).toFixed(3)})" style="--i:var(--sim-series-${tone})">${inner}</g>`;
}

/** A step tag: a filled pill in one tone. */
function tag(x, y, t, tone, fs) {
  const w = t.length * fs * 0.6 + 26;
  return `<rect x="${f1(x - w / 2)}" y="${f1(y - fs * 0.85)}" width="${f1(w)}" height="${f1(fs * 1.7)}" rx="${f1(fs * 0.85)}" ${fill(`var(--sim-series-${tone})`)}/>`
    + text(x, y + fs * 0.36, t, fs, 'var(--sim-bg-surface)');
}

/** A straight arrow, shortened at both ends by `cut`. */
function arrow(ax, ay, bx, by, col, cut = 0, w = 4) {
  const L = Math.hypot(bx - ax, by - ay), ux = (bx - ax) / L, uy = (by - ay) / L;
  const sx = ax + ux * cut, sy = ay + uy * cut, ex = bx - ux * cut, ey = by - uy * cut, hl = 14, a = Math.atan2(uy, ux);
  return `<line x1="${f1(sx)}" y1="${f1(sy)}" x2="${f1(ex - ux * hl * 0.7)}" y2="${f1(ey - uy * hl * 0.7)}" style="stroke:${col};stroke-width:${w};stroke-linecap:round"/>`
    + `<path d="M${f1(ex)} ${f1(ey)}L${f1(ex - hl * Math.cos(a - 0.5))} ${f1(ey - hl * Math.sin(a - 0.5))}L${f1(ex - hl * Math.cos(a + 0.5))} ${f1(ey - hl * Math.sin(a + 0.5))}Z" ${fill(col)}/>`;
}

const reduced = () => { try { return matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (_) { return false; } };

export class SurveyLoopScene extends SvgScene {
  static WIDTH = 560;
  static PORTRAIT_WIDTH = 390;
  static HEIGHT = 592;
  static PORTRAIT_HEIGHT = 664;
  static CONTINUOUS = false;
  static BEAT_STEP_MAP = MAP;
  static BEAT_MAPS = { 3: MAP };
  static CONTROLS = [];
  static ARIA_LABEL = 'Every year the Ministry of Finance prepares the Economic Survey, which looks back at farming, industry, services, jobs, prices, education and health. It goes to Parliament before the Union Budget and explains the data to citizens. The year then runs on the Budget, and what happens becomes new data for the next Survey: measure, plan, spend, then measure again. Run a year to send a dot round the loop.';

  async setup() {
    this.year = 1;
    this.running = false;
    this.fresh = true;
    this._runId = 0;
    await super.setup();
    this._onClick = (e) => {
      const b = e.target?.closest?.('[data-act]');
      if (!b) return;
      this.act(b.dataset.act);
    };
    this.root.addEventListener('click', this._onClick);
  }

  destroy() {
    this.root?.removeEventListener('click', this._onClick);
    super.destroy();
  }

  css() { return CSS; }

  enter() {
    this.year = 1;
    this.running = false;
    this._runId++;
    this.fresh = true;
    this.after(2.6, () => { this.fresh = false; });
  }

  act(a) {
    if (a !== 'run' || this.stepIndex !== 2 || this.running) return;
    this.running = true;
    this.fresh = false;
    const id = ++this._runId;
    this.repaint();
    const R = reduced();
    const phase = (k) => {
      if (id !== this._runId) return;
      this.root?.querySelectorAll?.('.sl-halo').forEach((h) => h.classList.toggle('on', Number(h.dataset.st) === k % 3));
      const s = this.root?.querySelector?.('.sl-say');
      if (s) s.textContent = PHASE[k];
    };
    if (!R) this.after(0.03, () => this.root?.querySelectorAll?.('animateMotion[data-run]').forEach((m) => { try { m.beginElement(); } catch (_) { /* no SMIL */ } }));
    const T = R ? 0.4 : RUN / 3;
    [0, 1, 2, 3].forEach((k) => this.after(0.05 + k * T, () => phase(k)));
    this.after(0.4 + 3 * T, () => {
      if (id !== this._runId) return;
      this.year += 1;
      this.running = false;
      this.repaint();
    });
  }

  layout(st) {
    const P = st.portrait, W = st.W;
    return P
      ? { P, W, S: [95, 180], B: [292, 180], Y: [195, 474], tagY: 50, fs: 19, sfs: 15, H: 640, say: 540, row: 594, rs: 1,
        grid: { x: 24, y: 352, cols: 2, cw: 172, rh: 46, head: 322 } }
      : { P, W, S: [112, 196], B: [438, 196], Y: [279, 440], tagY: 44, fs: 21, sfs: 17, H: 568, say: 494, row: 538, rs: 1.25,
        grid: { x: 236, y: 112, cols: 2, cw: 160, rh: 52, head: 76 } };
  }

  stageHeight(st) { return this.layout(st).H; }

  paint(st) {
    const L = this.layout(st), P = L.P, W = L.W, step = this.stepIndex, fr = this.fresh;
    const anim = (cls, d) => (fr ? ` class="${cls}" style="--d:${f1(d)}s"` : '');
    const muted = 'var(--sim-label-muted)', acc = 'var(--sim-accent)';
    let svg = '', over = '';
    const [sx, sg] = L.S, [bx, bg] = L.B, [yx, yg] = L.Y;
    const halo = (x, y, r, k) => `<circle class="sl-halo" data-st="${k}" cx="${f1(x)}" cy="${f1(y)}" r="${f1(r)}" ${fill('color-mix(in oklab, var(--sim-accent) 18%, transparent)', 'stroke:var(--sim-accent);stroke-width:3')}/>`;
    // Ring arrows (behind the stations).
    const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    const cS = [sx, sg - 50], cB = [bx, bg - 50], cY = [yx, yg - 50];
    if (step >= 1) {
      svg += `<g${anim('sl-in', step === 1 ? 0.2 : 0.05)}>${arrow(cS[0], cS[1], cB[0], cB[1], 'var(--sim-series-1)', P ? 64 : 100)}</g>`;
      const [mx, my] = mid(cS, cB);
      const lab = text(mx, my - 36, 'before the', L.sfs, muted) + text(mx, my - 12, 'Budget', L.sfs, muted);
      svg += `<g${anim('sl-in', step === 1 ? 0.5 : 0.05)}>${lab}</g>`;
    }
    if (step === 1) {
      // The data explained to citizens.
      const cx = P ? bx : bx, cy = P ? yg - 40 : yg - 40;
      svg += `<g${anim('sl-in', 1.1)}>${arrow(bx, bg + 70, cx, cy - 44, 'var(--sim-series-4)', 0)}`
        + text(cx - 14, (bg + 70 + cy - 44) / 2 + 6, 'data explained', L.sfs, muted, ' text-anchor="end"') + '</g>';
      svg += `<g${anim('sl-pop', 1.5)}>${icon('crowd', cx, cy, P ? 64 : 72, 4)}${text(cx, cy + (P ? 52 : 58), 'citizens', L.fs)}</g>`;
    }
    if (step === 2) {
      const b0 = [bx - 30, bg + 70], y1 = [yx + (P ? 60 : 70), yg - 60], y0 = [yx - (P ? 60 : 70), yg - 60], s1 = [sx + 40, sg + 108];
      svg += `<g${anim('sl-in', 0.2)}>${arrow(b0[0], b0[1], y1[0], y1[1], 'var(--sim-series-2)', 0)}</g>`;
      svg += `<g${anim('sl-in', 0.6)}>${arrow(y0[0], y0[1], s1[0], s1[1], 'var(--sim-series-3)', 0)}</g>`;
      const [ax, ay] = mid(y0, s1);
      svg += `<g${anim('sl-in', 0.9)}>${text(ax - 12, ay + 4, 'new', L.sfs, 'color-mix(in oklab, var(--sim-series-3) 70%, var(--sim-label))', ' text-anchor="end"')}`
        + text(ax - 12, ay + 4 + L.sfs + 8, 'data', L.sfs, 'color-mix(in oklab, var(--sim-series-3) 70%, var(--sim-label))', ' text-anchor="end"') + '</g>';
      const [bx2, by2] = mid(b0, y1);
      svg += `<g${anim('sl-in', 0.5)}>${text(bx2 + 12, by2 + 4, 'Budget', L.sfs, 'color-mix(in oklab, var(--sim-series-2) 70%, var(--sim-label))', ' text-anchor="start"')}`
        + text(bx2 + 12, by2 + 4 + L.sfs + 8, 'choices', L.sfs, 'color-mix(in oklab, var(--sim-series-2) 70%, var(--sim-label))', ' text-anchor="start"') + '</g>';
    }
    // Station: the Survey.
    {
      let g = halo(sx, sg - 54, P ? 66 : 82, 0);
      g += civicSvg('report', sx, sg, { w: P ? 76 : 104 });
      g += tag(sx, L.tagY, 'measure', 1, L.sfs);
      g += text(sx, sg + 26, 'Economic', L.fs) + text(sx, sg + 26 + L.fs + 8, 'Survey', L.fs);
      g += text(sx, sg + 32 + 2 * (L.fs + 8), 'Ministry of', L.sfs, muted) + text(sx, sg + 32 + 2 * (L.fs + 8) + L.sfs + 8, 'Finance', L.sfs, muted);
      svg += `<g${step === 0 ? anim('sl-pop', 0.05) : ''}>${g}</g>`;
    }
    // b0: what the Survey looks back at.
    if (step === 0) {
      const G = L.grid;
      svg += `<g${anim('sl-in', 0.4)}>${text(P ? W / 2 : G.x + 8, G.head, 'it looks back at the past year:', L.sfs, muted, P ? '' : ' text-anchor="start"')}</g>`;
      TOPICS.forEach(([t, ic, tone], i) => {
        const c = i % G.cols, r = Math.floor(i / G.cols), x = G.x + c * G.cw, y = G.y + r * G.rh;
        const w = G.cw - 12, col = `var(--sim-series-${tone})`;
        const g = `<rect x="${f1(x)}" y="${f1(y - 20)}" width="${f1(w)}" height="40" rx="20" ${fill(`color-mix(in oklab, ${col} 12%, var(--sim-bg-surface))`, `stroke:${col};stroke-width:2`)}/>`
          + icon(ic, x + 22, y, 28, tone) + text(x + 42, y + 6, t, L.sfs + 1, 'var(--sim-label)', ' text-anchor="start"');
        svg += `<g${anim('sl-pop', 0.6 + i * 0.12)}>${g}</g>`;
      });
    }
    // Station: Parliament and the Budget.
    if (step >= 1) {
      let g = halo(bx, bg - 50, P ? 82 : 104, 1);
      g += civicSvg('parliament', bx, bg, { w: P ? 150 : 200 });
      g += tag(bx, L.tagY, 'plan', 2, L.sfs);
      g += text(bx, bg + 26, 'Parliament', L.fs);
      g += text(bx, bg + 30 + L.fs + 4, 'Union Budget', L.sfs, muted);
      svg += `<g${step === 1 ? anim('sl-pop', 0.7) : ''}>${g}</g>`;
    }
    // Station: the year.
    if (step === 2) {
      let g = halo(yx, yg - 40, P ? 64 : 70, 2);
      g += tag(yx, yg - (P ? 110 : 118), 'spend', 3, L.sfs);
      g += icon('calendar', yx, yg - 58, P ? 56 : 64, 3);
      [['road', 6], ['school', 5], ['hospital', 7]].forEach(([n, t], k) => { g += icon(n, yx + (k - 1) * (P ? 44 : 50), yg - 6, P ? 36 : 40, t); });
      g += text(yx, yg + 30, 'the year', L.fs);
      svg += `<g${anim('sl-pop', 1.1)}>${g}</g>`;
      if (this.running && !reduced()) {
        const ring = `M${f1(cS[0])} ${f1(cS[1])}L${f1(cB[0])} ${f1(cB[1])}L${f1(cY[0])} ${f1(cY[1] - 20)}Z`;
        svg += `<circle r="10" cx="0" cy="0" ${fill(acc, 'stroke:var(--sim-bg-surface);stroke-width:3')}><animateMotion data-run="1" path="${ring}" dur="${RUN}s" begin="indefinite" fill="freeze"/></circle>`;
      }
      over += `<div class="sl-row" style="top:${L.row}px"><button type="button" class="sv-hit sl-btn" data-act="run"${this.running ? ' disabled' : ''}>Run a year</button>`
        + `<span class="sl-year" aria-live="polite">year ${this.year}</span></div>`;
    }
    over += `<div class="sl-say" style="top:${L.say}px">${SAY[step]}</div>`;
    return { svg, over: `<div class="${P ? 'sl-p' : 'sl-l'}">${over}</div>` };
  }

  testState() { return { step: this.stepIndex, year: this.year, running: this.running }; }
}
