/**
 * EgyptianCalendarWheelScene - blk-l10-s07, 4 beats. A wheel of the year. Beat 0: 365 ticks and Sirius. Beat 1: 12 months of 30
 * days, 5 extra days in gold. Beat 2: three seasons of four months. Beat 3: the true flood marker slips against the calendar;
 * chips run 4, 40 and 120 years, and 120 is where the calendar fails. Base chain: SvgScene. Chips are in the scene (TapLight).
 */
import { SvgScene, tone, fill, stroke, shade } from 'simulations/base/kit/SimSvg.js';
import { tapLight } from 'simulations/base/kit/TapLight.js';
import { n } from '../L07/HarappanDraw.js';

const MAP = [0, 1, 2, 3].map((idx) => [{ idx, dwellMs: null }]);
const CHIPS = [{ id: 'y4', label: '4 years', targets: ['y4'] }, { id: 'y40', label: '40 years', targets: ['y40'] }, { id: 'y120', label: '120 years', targets: ['y120'] }];
const YEARS = { y4: 4, y40: 40, y120: 120 };
const SEASONS = [['Inundation', 'flood', 1], ['Peret', 'growing', 4], ['Shemu', 'harvest', 3]];
const DEG = 360 / 365;
const pol = (cx, cy, r, d) => { const a = ((d - 90) * Math.PI) / 180; return [cx + r * Math.cos(a), cy + r * Math.sin(a)]; };
function sector(cx, cy, r1, r2, d1, d2) {
  const [ax, ay] = pol(cx, cy, r2, d1), [bx, by] = pol(cx, cy, r2, d2), [c1, c2] = pol(cx, cy, r1, d2), [dx, dy] = pol(cx, cy, r1, d1), big = d2 - d1 > 180 ? 1 : 0;
  return `M${n(ax)} ${n(ay)}A${r2} ${r2} 0 ${big} 1 ${n(bx)} ${n(by)}L${n(c1)} ${n(c2)}A${r1} ${r1} 0 ${big} 0 ${n(dx)} ${n(dy)}Z`;
}

export class EgyptianCalendarWheelScene extends SvgScene {
  static BEAT_STEP_MAP = MAP;
  static CONTINUOUS = false;
  static ARIA_LABEL = 'A wheel of the Egyptian year: 12 months of 30 days and 5 extra days, in three seasons. The true flood date slips against the calendar, one day in 4 years, a whole month in 120 years.';

  tl = tapLight({ label: 'Years passed', chips: CHIPS, onChange: () => this._change() });
  _found = false;

  async setup() { await super.setup(); this.tl.mount(this.root, this); this._preset(); this.repaint(); }
  destroy() { this.tl.destroy(); super.destroy(); }
  enter() { this._preset(); }
  _preset() { const on = this.stepIndex === 3; this.tl.set({ lit: on ? 'y4' : null, disabled: !on }); this.root.classList.toggle('cw-off', !on); }
  _change() { this.repaint(); if (this.tl.has('y120') && !this._found) { this._found = true; this.celebrate(this.sv.W / 2, this.sv.H / 2); } }

  stageHeight(st) { return st.portrait ? 470 : (this.stepIndex === 3 ? 372 : 430); }
  css() { return `.cw-off > .tl-row { display: none; }
svg .cw-w { font-family: var(--sim-font-display, var(--sim-font)); font-weight: 600; }
svg .cw-rot { transform-box: view-box; transition: transform 0.7s var(--look-spring-soft); }
svg .cw-pop { transform-box: fill-box; transform-origin: center; animation: cw-pop 0.5s var(--look-spring) both; animation-delay: var(--d, 0s); }
@keyframes cw-pop { from { opacity: 0; transform: scale(0.8); } to { opacity: 1; transform: none; } }
@media (prefers-reduced-motion: reduce) { svg .cw-pop { animation: none; } svg .cw-rot { transition: none; } }`; }

  _t(x, y, s, size, col = 'var(--sim-label)', a = 'middle') { return `<text class="cw-w" x="${n(x)}" y="${n(y)}" text-anchor="${a}" font-size="${size}" dominant-baseline="central" ${fill(col)}>${s}</text>`; }

  paint(st) {
    const s = this.stepIndex, W = st.W, H = st.H, port = st.portrait, R = s === 2 ? (port ? 136 : 150) : port ? 168 : (s === 3 ? 160 : 176), cx = port || s === 1 || s === 2 ? W / 2 : W * 0.36, cy = port ? 192 : H / 2 + 6, r0 = R * 0.62;
    let svg = '';
    if (s === 0) {
      for (let i = 0; i < 365; i++) { const a = i * DEG, [x1, y1] = pol(cx, cy, R - (i % 30 === 0 ? 20 : 11), a), [x2, y2] = pol(cx, cy, R, a); svg += `<path d="M${n(x1)} ${n(y1)}L${n(x2)} ${n(y2)}" ${stroke(i % 30 === 0 ? 'var(--sim-label)' : tone(1), i % 30 === 0 ? 3 : 1.6)}/>`; }
      svg += this._t(cx, cy - 24, '365', 72) + this._t(cx, cy + 44, 'days', 28);
      const [sx, sy] = pol(cx, cy, R + 2, 0);
      svg += this._star(sx, sy - 2, 22);
      if (port) svg += this._t(W / 2, 410, 'Count from flood to flood', 25) + this._t(W / 2, 446, 'Watch for Sirius', 25, 'var(--sim-gold)');
      else svg += this._t(W * 0.68, cy - 44, 'Count from', 28, undefined, 'start') + this._t(W * 0.68, cy - 8, 'flood to flood', 28, undefined, 'start') + this._t(W * 0.68, cy + 50, 'Watch for', 28, 'var(--sim-gold)', 'start') + this._t(W * 0.68, cy + 86, 'Sirius', 28, 'var(--sim-gold)', 'start');
      return { svg };
    }
    if (s === 1) {
      for (let m = 0; m < 12; m++) { const d1 = m * 30 * DEG, d2 = (m + 1) * 30 * DEG, col = m % 2 ? tone(1) : shade(tone(1), 78), [lx, ly] = pol(cx, cy, (R + r0) / 2, d1 + 15 * DEG); svg += `<path class="cw-pop" d="${sector(cx, cy, r0, R, d1 + 0.6, d2 - 0.6)}" ${fill(col, `--d:${(m * 0.04).toFixed(2)}s`)}/>` + this._t(lx, ly, m + 1, 22, 'var(--sim-ink-on-1, var(--sim-bg-deep))'); }
      svg += `<path class="cw-pop" d="${sector(cx, cy, r0, R + 10, 360 * DEG, 365 * DEG)}" ${fill('var(--sim-gold)', '--d:.55s')}/>`;
      svg += this._t(cx - R * 0.62, cy - R * 0.96, '5 extra days', 22);
      svg += this._t(cx, cy - 34, '12 \u00d7 30', 40) + this._t(cx, cy + 12, '+ 5', 40) + this._t(cx, cy + 58, '= 365', 40);
      return { svg };
    }
        // The calendar's months and seasons stay fixed.
    SEASONS.forEach(([name, what, tn], i) => {
      const d1 = i * 120 * DEG, d2 = (i + 1) * 120 * DEG, [lx, ly] = pol(cx, cy, (R + r0) / 2, (d1 + d2) / 2), rim = s === 3 ? 0.45 : 1;
      svg += `<path class="${s === 2 ? 'cw-pop' : ''}" d="${sector(cx, cy, r0, R, d1 + 0.8, d2 - 0.8)}" ${fill(tone(tn), `--d:${(i * 0.12).toFixed(2)}s;opacity:${rim}`)}/>`;
    });
    for (let m = 0; m < 12; m++) { const d = m * 30 * DEG, [x1, y1] = pol(cx, cy, r0, d), [x2, y2] = pol(cx, cy, R, d); svg += `<path d="M${n(x1)} ${n(y1)}L${n(x2)} ${n(y2)}" ${stroke('var(--sim-bg-surface)', 2.5)}/>`; }
    svg += `<path d="${sector(cx, cy, r0, R, 360 * DEG, 365 * DEG)}" ${fill('var(--sim-gold)')}/>`;
    if (s === 2) {
      svg += this._t(cx, cy - 16, '3 seasons', 30) + this._t(cx, cy + 22, '4 months each', 22);
      const pos = [[W - 8, cy - R * (port ? 1.12 : 0.9), 'end'], [cx, cy + R + (port ? 46 : 34), 'middle'], [8, cy - R * (port ? 1.12 : 0.9), 'start']];
      SEASONS.forEach(([name, what, tn], i) => {
        const [x, y, a] = pos[i], line = i === 1 && !port ? `${name}: ${what}` : name;
        svg += this._t(x, y, line, port ? 24 : 27, 'var(--sim-label)', a);
        if (i !== 1 || port) svg += this._t(x, y + 28, what, port ? 20 : 22, 'var(--sim-label-muted)', a);
      });
      return { svg };
    }
    // Beat 3: where the true flood falls on the calendar. It moves back as the years pass.
    const y = YEARS[this.tl.lit()[0]] ?? 4, off = y * 0.25, on = -off * DEG;
        svg += `<path d="M${n(cx)} ${n(cy - R - 2)}V${n(cy - r0 + 2)}" ${stroke('var(--sim-label)', 3, 'stroke-dasharray:3 6')}/>`;
    svg += `<g class="cw-rot" style="transform: rotate(${on.toFixed(2)}deg); transform-origin: ${n(cx)}px ${n(cy)}px"><path d="M${n(cx - 13)} ${n(cy - R - 20)}H${n(cx + 13)}L${n(cx)} ${n(cy - R + 2)}Z" ${fill('var(--sim-sea-shallow)')}/><path d="M${n(cx)} ${n(cy - R - 2)}V${n(cy - r0 + 2)}" ${stroke('var(--sim-sea-shallow)', 6)}/></g>`;
    const bad = y >= 120, col = bad ? 'var(--sim-bad)' : 'var(--sim-label)';
    svg += this._t(cx, cy - 24, `${off}`, 50, col) + this._t(cx, cy + 30, off === 1 ? 'day off' : 'days off', 24, col);
    const lab = bad ? 'A whole month off' : off === 1 ? 'Hardly seen' : 'Farmers notice';
    if (port) svg += this._t(W / 2, 410, lab, 28, col) + this._t(W / 2, 444, 'Blue: when the flood really comes', 19);
    else svg += this._t(W * 0.68, cy - 24, lab.split(' ').slice(0, 2).join(' '), 28, col, 'start') + this._t(W * 0.68, cy + 8, lab.split(' ').slice(2).join(' '), 28, col, 'start') + this._t(W * 0.68, cy + 60, 'Blue: the', 21, undefined, 'start') + this._t(W * 0.68, cy + 86, 'real flood', 21, undefined, 'start');
    return { svg };
  }

  _star(x, y, r) { let d = ''; for (let i = 0; i < 10; i++) { const a = (i * 36 - 90) * Math.PI / 180, q = i % 2 ? r * 0.44 : r; d += `${i ? 'L' : 'M'}${n(x + q * Math.cos(a))} ${n(y + q * Math.sin(a))}`; } return `<path d="${d}Z" ${fill('var(--sim-gold)')}/>`; }
}
