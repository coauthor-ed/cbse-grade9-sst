// MonsoonRetreatMapScene - the book's Fig. 3.11 on the Survey of India outline, from the figure's own
// vector lines (shared/MonsoonLines.js). blk-l06-s04, 3 beats: (0) the lines draw from 17 September to
// 15 October; (1) the stay at Jodhpur against Kolkata, read off both maps; (2) what follows: a cloudless
// north-west, and more rain in the south. No line is drawn south of 15 October: the figure has none.
import { SvgScene } from 'simulations/base/kit/SimSvg.js';
import { RETREAT, PLACES } from '../shared/MonsoonLines.js';
import * as SkyArt from '../shared/SkyArt.js';
const { svgCloud, svgSun } = SkyArt;
import { loadIndia, indiaView, mapSvg, mapEnd, creditSvg, mapText, pinSvg, READ_CSS, readCard } from './IndiaMapSvg.js';

const EXTENT = [[65.5, 3.4], [100.5, 37.6]];
const LINE = 'var(--sim-series-5)';
const TAGS = { '17 Sep': [1, -2, -5], '20 Sep': [1, 0, -5], '25 Sep': [1, 0, -5], '30 Sep': [1, 8, -5], '5 Oct': [1, 0, -5], '10 Oct': [1, 0, -5], '15 Oct': [0, -6, 14] };
// The stay, in days from 1 June, read off the two maps: Jodhpur 5 July to 17 Sep; Kolkata mid-June to mid-Oct.
const SPAN = 153;
const STAYS = [
  { name: 'Jodhpur', from: 34, to: 108, weeks: 'about 11 weeks', tone: 2 },
  { name: 'Kolkata', from: 12, to: 134, weeks: 'about 17 weeks', tone: 1 },
];
const MONTHS = ['Jun', 'Jul', 'Aug', 'Sep', 'Oct'];
const CSS = `
.mr-card { position: relative; width: 100%; box-sizing: border-box; display: flex; flex-direction: column; gap: var(--sim-space-1); padding: var(--sim-space-2) var(--sim-space-3); border: calc(2.5px * var(--look-rim)) solid var(--sim-stroke);
  border-radius: var(--sim-radius-lg); background: var(--sim-bg-surface); box-shadow: 0 calc(3px * var(--look-lip)) 0 var(--sim-stroke); }
.mr-row { display: flex; justify-content: space-between; gap: var(--sim-space-3); align-items: baseline; font: 600 var(--sim-text-md)/1.2 var(--sim-font-display, var(--sim-font)); color: var(--sim-label); }
.mr-row b { font: 600 var(--sim-text-lg)/1.2 var(--sim-font-display, var(--sim-font)); }
.mr-track { position: relative; height: 16px; border-radius: var(--look-pill); background: var(--sim-track); }
.mr-bar { position: absolute; top: 0; bottom: 0; border-radius: var(--look-pill); transform-origin: left; animation: mr-grow 0.7s var(--look-spring-soft) both; }
@keyframes mr-grow { from { transform: scaleX(0); } to { transform: none; } }
.mr-months { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); font: 700 var(--sim-text-sm)/1 var(--sim-font); color: var(--sim-label-muted); text-align: center; }
.mf-side { position: absolute; }
@media (prefers-reduced-motion: reduce) { .mr-bar { animation: none; } }
`;

export class MonsoonRetreatMapScene extends SvgScene {
  static HEIGHT = 470;
  static PORTRAIT_HEIGHT = 560;
  static BEAT_STEP_MAP = [0, 1, 2].map((idx) => [{ idx, dwellMs: null }]);
  static CONTROLS = [];
  static ARIA_LABEL = 'A map of India with the normal dates of the retreating monsoon: dated lines from 17 September in the far north-west to 15 October across the south.';

  css() { return READ_CSS + CSS; }
  stageHeight(st) { return st.portrait ? Math.round(st.W * 1.03) : 470; }

  async setup() {
    this._geo = null;
    this._fresh = true;
    await super.setup();
    loadIndia().then((g) => { this._geo = g; this.repaint(); }).catch(() => {});
  }
  enter() { this._fresh = true; }

  _box(st) {
    if (st.portrait) return { x: 0, y: 0, w: st.W, h: Math.round(st.W * 1.03) };
    const h = st.H - 4;
    return { x: 0, y: 2, w: Math.round(h * 0.97), h };
  }

  _stays() {
    const rows = STAYS.map((s) => `<div class="mr-row"><span>${s.name}</span><b>${s.weeks}</b></div><div class="mr-track"><span class="mr-bar" style="left:${(100 * s.from / SPAN).toFixed(1)}%;width:${(100 * (s.to - s.from) / SPAN).toFixed(1)}%;background:var(--sim-series-${s.tone})"></span></div>`).join('');
    return `<div class="mr-card">${rows}<div class="mr-months">${MONTHS.map((m) => `<span>${m}</span>`).join('')}</div></div>`;
  }

  paint(st) {
    if (!this._geo) return { svg: '', over: '' };
    const box = this._box(st), v = indiaView(this._geo, box, EXTENT), step = this.stepIndex, fresh = this._fresh && step === 0;
    let svg = mapSvg(v, { dry: step === 2 });
    RETREAT.forEach((l, i) => {
      const dim = step === 2 || (step === 1 && !['17 Sep', '10 Oct', '15 Oct'].includes(l.date));
      const anim = fresh ? ` class="sv-draw" pathLength="1" style="--len:1;--dur:0.55s;--d:${(0.15 + i * 0.36).toFixed(2)}s;` : ' style="';
      svg += `<path d="${v.line(l.line)}"${anim}fill:none;stroke:${LINE};stroke-width:3.5;stroke-linecap:round;opacity:${dim ? 0.32 : 1}"/>`;
      const [end, dx, dy] = TAGS[l.date], p = v.at(l.line[end ? l.line.length - 1 : 0]);
      svg += mapText(p[0] + dx, p[1] + dy, l.date, { size: 14, opacity: dim ? 0.5 : 1 });
    });
    if (step === 1) {
      for (const k of ['jodhpur', 'kolkata']) { const p = v.at(PLACES[k].ll); svg += pinSvg(p[0], p[1], { r: 7, c: 'var(--sim-series-2)' }) + mapText(p[0], p[1] + 22, PLACES[k].name, { size: 15 }); }
    }
    if (step === 2) {
      const sun = v.at([71.5, 29]), rain = v.at([79.5, 7.6]);
      svg += `<g class="sv-pop">${svgSun(sun[0], sun[1], 0.62)}</g>` + mapText(sun[0], sun[1] + 56, 'Usually cloudless', { size: 15 })
        + `<g class="sv-pop">${svgCloud(rain[0], rain[1], 0.62, { kind: 'rain', seed: 4 })}</g>` + mapText(rain[0] + 74, rain[1] - 16, 'More rain in the south', { size: 15, anchor: 'start' });
    }
    svg += creditSvg(v) + mapEnd(v);
    this._fresh = false;
    const card = step === 1 ? this._stays() : step === 0 ? readCard('17 Sep to 15 Oct', 'about four weeks, north-west first') : readCard('Post-monsoon', 'October to December');
    if (st.portrait) return { svg, over: '', head: card };
    return { svg, over: `<div class="mf-side" style="left:${box.x + box.w + 14}px;right:0;top:${box.y + 6}px">${card}</div>` };
  }
}
