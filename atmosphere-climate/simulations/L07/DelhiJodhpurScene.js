// DelhiJodhpurScene - why Delhi gets more rain than Jodhpur (L07 s03b, 3 beats). A map of northern India.
// (0) the two pins with heights and rain, no arrows. (1) the two arms of the monsoon and the Aravalli running
// along the wind. (2) the stay at each place, read off the two date maps. Survey of India outline; credit shown.
import { SvgScene } from 'simulations/base/kit/SimSvg.js';
import * as SkyArt from '../shared/SkyArt.js';
const { svgSkyColour: sky } = SkyArt;
import { stationOf } from './StationData.js';
import { loadIndia, indiaView, mapSvg, mapEnd, creditSvg, mapText, pinSvg, READ_CSS, readCard } from '../L06/IndiaMapSvg.js';

const DEL = stationOf('delhi'), JOD = stationOf('jodhpur');
const EXTENT = [[66.5, 17], [93, 33.5]];
const BAY = [[88.4, 18.6], [89.6, 22.2], [87, 25.2], [82.5, 26.6], [78.8, 28]];
const ARAB = [[67.5, 19.4], [69.6, 22.4], [71.2, 25], [72.8, 27.4], [74.2, 29.6]];
const ARAVALLI = [[73.0, 24.4], [74.1, 25.6], [75.2, 27.0], [76.2, 28.0]];
const WEEKS = 13;
const STAYS = [{ s: 'Delhi', w: 12.5, tag: 'about 12 to 13 weeks', tone: 1 }, { s: 'Jodhpur', w: 10.6, tag: 'under 11 weeks', tone: 2 }];
const CSS = `
.dj-duo { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--sim-space-2); width: 100%; }
.dj-duo .mf-read { min-height: 70px; padding: var(--sim-space-1) var(--sim-space-2); }
.dj-stay { display: flex; flex-direction: column; gap: 4px; width: 100%; box-sizing: border-box; padding: var(--sim-space-2) var(--sim-space-3); border: calc(2.5px * var(--look-rim)) solid var(--sim-stroke); border-radius: var(--sim-radius-lg); background: var(--sim-bg-surface); box-shadow: 0 calc(3px * var(--look-lip)) 0 var(--sim-stroke); }
.dj-row { display: flex; justify-content: space-between; gap: var(--sim-space-3); font: 600 var(--sim-text-md)/1.2 var(--sim-font-display, var(--sim-font)); color: var(--sim-label); }
.dj-track { height: 16px; border-radius: var(--look-pill); background: var(--sim-track); overflow: hidden; }
.dj-bar { display: block; height: 100%; border-radius: var(--look-pill); }
`;
const arrow = (v, pts, c) => {
  const d = v.line(pts), e = v.at(pts[pts.length - 1]), q = v.at(pts[pts.length - 2]), a = Math.atan2(e[1] - q[1], e[0] - q[0]) * 180 / Math.PI;
  return `<path d="${d}" class="sv-draw" pathLength="1" style="--len:1;--dur:0.9s;fill:none;stroke:${c};stroke-width:10;stroke-linecap:round;opacity:0.9"/><path d="M-4 -14L18 0L-4 14Z" transform="translate(${e[0].toFixed(1)} ${e[1].toFixed(1)}) rotate(${a.toFixed(0)})" style="fill:${c}"/>`;
};

export class DelhiJodhpurScene extends SvgScene {
  static HEIGHT = 450;
  static PORTRAIT_HEIGHT = 540;
  static BEAT_STEP_MAP = [0, 1, 2].map((idx) => [{ idx, dwellMs: null }]);
  static CONTROLS = [];
  static ARIA_LABEL = 'A map of northern India with Delhi and Jodhpur: moist air from the Bay of Bengal turns up the Ganga plain to Delhi, and air from the Arabian Sea crosses Rajasthan along the Aravalli hills.';

  css() { return READ_CSS + CSS; }
  stageHeight(st) { return st.portrait ? Math.round(st.W * 0.82) : 318; }

  async setup() { this._geo = null; await super.setup(); loadIndia().then((g) => { this._geo = g; this.repaint(); }).catch(() => {}); }

  paint(st) {
    if (!this._geo) return { svg: '' };
    const box = { x: 0, y: 0, w: st.W, h: st.H }, v = indiaView(this._geo, box, EXTENT), step = this.stepIndex;
    let svg = mapSvg(v, { dry: false });
    if (step >= 1) {
      const a = ARAVALLI.map((ll) => v.at(ll)), d = `M${a.map((p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join('L')}`;
      svg += `<path d="${d}" style="fill:none;stroke:${sky('rockDark')};stroke-width:13;stroke-linecap:round;stroke-linejoin:round"/><path d="${d}" style="fill:none;stroke:${sky('rock')};stroke-width:7;stroke-dasharray:3 9;stroke-linecap:round"/>`;
      if (step === 1) { const p = v.at([75.6, 25.5]); svg += mapText(p[0] + 4, p[1] + 8, 'Aravalli', { size: 15, anchor: 'start' }); }
      svg += arrow(v, BAY, 'var(--sim-series-5)') + arrow(v, ARAB, 'var(--sim-series-7)');
      const b = v.at([86.5, 19.2]), r = v.at([68.4, 18.4]);
      svg += mapText(b[0], b[1] - 12, 'Bay of Bengal air', { size: 15, anchor: 'end' }) + mapText(r[0] + 2, r[1] + 6, 'Arabian Sea air', { size: 15, anchor: 'start' });
    }
    for (const [id, dy] of [['delhi', -11], ['jodhpur', 22]]) {
      const s = stationOf(id), p = v.at(s.ll);
      svg += pinSvg(p[0], p[1], { r: 7, c: 'var(--sim-series-2)' }) + mapText(p[0], p[1] + dy, s.name, { size: 16 });
    }
    svg += creditSvg(v) + mapEnd(v);
    const head = step === 2
      ? `<div class="dj-stay">${STAYS.map((x) => `<div class="dj-row"><span>${x.s}</span><span>${x.tag}</span></div><div class="dj-track"><span class="dj-bar" style="width:${(100 * x.w / WEEKS).toFixed(1)}%;background:var(--sim-series-${x.tone})"></span></div>`).join('')}</div>`
      : `<div class="dj-duo">${readCard(`${DEL.total.toFixed(1)} cm`, `Delhi, ${DEL.alt} m`)}${readCard(`${JOD.total.toFixed(1)} cm`, `Jodhpur, ${JOD.alt} m`)}</div>`;
    return { svg, head };
  }
}
