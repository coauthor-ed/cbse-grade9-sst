// PosterBoardScene - the NDMA landslide poster as a tabbed list. blk-l10-s07, 3 beats. The lines are the poster's own
// words, read from the printed page at 300 dpi; only the list semicolons are dropped. Do not reword them.
import { SvgScene } from 'simulations/base/kit/SimSvg.js';
import { LAND_CSS, bar, bindActs } from '../L08/LandDraw.js';
import { esc } from 'simulations/base/SimUi.js';

const S = (i) => [{ idx: i, dwellMs: null }];
const MAP = [S(0), S(1), S(2)];
const TABS = ['Before', 'During', 'After'];
const LINES = [
  ['Grow More trees that can hold the Soil Together', 'Listen to Radio/ Watch T.V and Newspaper for any alerts', 'Keep drains clean, Keep holes open', 'Watch out for any warning signs such as subsidence of building, cracks on rocks, muddy river water', 'DO NOT Construct near Steep slopes and near drainage path'],
  ['Stay calm, DO NOT panic, ignore rumours', 'Stay together- with your companions', 'if you notice any warning signs such as unusual sounds like trees cracking or boulders knocking together', ['Move away from landslip path or downstream valley quickly', 'Inform nearest Tehsil/ District HQ']],
  ['DO NOT Touch / Walk over loose material and electrical Wires or Poles', 'Move away from landslip path and downstream valley quickly', 'Check for Injured and Trapped Person', 'DO NOT move an Injured person without rendering first aid unless he/she is in immediate danger', 'DO NOT drink contaminated water directly from rivers, springs, wells etc.'],
];
const CSS = `
.pb { position: absolute; inset: 0 0 60px 0; display: flex; flex-direction: column; gap: 6px; padding: 12px 14px; pointer-events: auto; overflow: hidden; box-sizing: border-box;
  background: var(--sim-bg-surface); border: calc(3px * var(--look-rim)) solid var(--sim-stroke); border-radius: var(--sim-radius-lg); box-shadow: 0 var(--sim-lift) 0 var(--sim-stroke); color: var(--sim-label); }
.pb h3 { margin: 0; font: 700 22px/1.15 var(--sim-font-display); }
.pb .s { margin: 0; font-size: 15px; font-weight: 700; color: var(--sim-label-muted); }
.pb ul { margin: 2px 0 0; padding-left: 20px; font-size: 16px; line-height: 1.3; font-weight: 700; flex: 1; min-height: 0; }
.pb li { margin: 0 0 5px; }
.pb ul ul { padding-left: 16px; margin-top: 4px; list-style: none; }
.pb ul ul li { font-weight: 800; }
.pb .cr { margin: 0; font-size: 17px; line-height: 1.25; font-weight: 700; color: var(--sim-label-muted); }
.pb ul { font-size: 20px; }
.pb h3 { font-size: 26px; }
.pb .s { font-size: 18px; }
.sim-dom-root--portrait .pb ul { font-size: 16px; }
.sim-dom-root--portrait .pb h3 { font-size: 22px; }
.sim-dom-root--portrait .pb .s { font-size: 15px; }
.sim-dom-root--portrait .pb .cr { font-size: 14px; }
`;

export class PosterBoardScene extends SvgScene {
  static BEAT_STEP_MAP = MAP;
  static ARIA_LABEL = 'A board with the words of the National Disaster Management Authority landslide poster, under three tabs: Before, During and After.';
  static CONTROLS = [];
  static HEIGHT = 520;
  css() { return LAND_CSS + CSS; }
  stageHeight(st) { return st.portrait ? 520 : 470; }
  async setup() {
    this._tab = 0;
    await super.setup();
    this._off = bindActs(this, (a) => { this._tab = Number(a); });
  }
  destroy() { this._off?.(); super.destroy(); }
  enter(step) { this._tab = step; }
  paint(st) {
    const li = (x) => (Array.isArray(x) ? `<ul>${x.map((l) => `<li>- ${esc(l)}</li>`).join('')}</ul>` : esc(x));
    const list = LINES[this._tab], html = [];
    list.forEach((x, i) => { if (Array.isArray(x)) html[html.length - 1] += li(x); else html.push(esc(x)); });
    const over = `<div class="pb"><h3>Landslide: Ready Now to stay secure</h3><p class="s">${TABS[this._tab]}</p><ul>${html.map((h) => `<li>${h}</li>`).join('')}</ul>`
      + '<p class="cr">Be Smart, Be Prepared. Poster: National Disaster Management Authority. Call: 011-1078</p></div>'
      + bar(st.H - 52, TABS.map((t, i) => ({ label: t, act: String(i), on: this._tab === i })));
    return { svg: '', over };
  }
}
