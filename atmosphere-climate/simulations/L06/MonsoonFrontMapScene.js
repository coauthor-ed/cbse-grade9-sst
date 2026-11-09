// MonsoonFrontMapScene - the book's Fig. 3.10, redrawn on Survey of India's outline from the figure's own
// vector lines (shared/MonsoonLines.js). Two mounts:
//   blk-l06-s02 predict, role setup: only the 1 June line and two pins, no other date.
//   blk-l06-s03 3 beats: (0) the lines draw in order, 22 May to 8 July; (1) tap a place, read its date;
//   (2) the first lines at sea, and the two arms of the monsoon.
// State comes from the step alone, so a deep link or Previous lands right.
import { SvgScene } from 'simulations/base/kit/SimSvg.js';
import { tapLight, TAP_LIGHT_CSS } from 'simulations/base/kit/TapLight.js';
import { ADVANCE, PLACES } from '../shared/MonsoonLines.js';
import * as SkyArt from '../shared/SkyArt.js';
const { svgCloud } = SkyArt;
import { loadIndia, indiaView, mapSvg, mapEnd, creditSvg, mapText, pinSvg, dateSpan, READ_CSS, readCard } from './IndiaMapSvg.js';

const EXTENT = [[65.5, 3.4], [100.5, 37.6]];
const BEATS = 3;
const LINE = 'var(--sim-series-6)';
const ARM = 'var(--sim-series-5)';
// Where a date sits: the western end or the northern end of its line, as the book prints them, chosen so
// no two collide. dx, dy nudge it off the line.
const TAGS = {
  '22 May': { end: 0, dx: 0, dy: 14 }, '26 May': { end: 0, dx: 0, dy: 14 }, '1 June': { end: 0, dx: -6, dy: 4, a: 'end' },
  '5 June': { end: 0, dx: -6, dy: 4, a: 'end' }, '10 June': { end: 1, dx: 0, dy: -5 }, '15 June': { end: 0, dx: -6, dy: 2, a: 'end' },
  '20 June': { end: 0, dx: -6, dy: 4, a: 'end' }, '25 June': { end: 1, dx: 0, dy: -5 }, '30 June': { end: 1, dx: -4, dy: -5 },
  '5 July': { end: 0, dx: -6, dy: 8, a: 'end' }, '8 July': { end: 0, dx: -4, dy: -3, a: 'end' },
};
const CHIPS = [
  { id: 'kochi', label: 'Kerala', targets: ['kochi'] }, { id: 'mumbai', label: 'Mumbai', targets: ['mumbai'] },
  { id: 'kolkata', label: 'Kolkata', targets: ['kolkata'] }, { id: 'shillong', label: 'Shillong', targets: ['shillong'] },
  { id: 'delhi', label: 'Delhi', targets: ['delhi'] }, { id: 'jodhpur', label: 'Jodhpur', targets: ['jodhpur'] },
];
const SIDE = { kochi: 'r', mumbai: 'r', kolkata: 'r', shillong: 'b', delhi: 'r', jodhpur: 'r' };
const ARMS = [
  { name: 'Arabian Sea branch', pts: [[67.5, 7.5], [70.5, 12], [71.6, 16.5], [72.6, 21]], tag: 6.2 },
  { name: 'Bay of Bengal branch', pts: [[85, 7.5], [88.6, 12.5], [90.2, 18], [89.2, 23.6], [85.5, 26.2], [81, 27.4], [78.2, 28.4]], tag: 9.6, right: true },
];
const CSS = `
.mf-row { display: flex; flex-direction: column; gap: var(--sim-space-2); }
.mf-side { position: absolute; display: flex; flex-direction: column; gap: var(--sim-space-2); }
.sim-dom-root:not(.sim-dom-root--portrait) .tl-row { position: absolute; right: var(--sim-space-3); top: 136px; width: 196px; justify-content: flex-start; padding: 0; z-index: 2; }
`;

export class MonsoonFrontMapScene extends SvgScene {
  static HEIGHT = 470;
  static PORTRAIT_HEIGHT = 560;
  static BEAT_STEP_MAP = [0, 1, 2].map((idx) => [{ idx, dwellMs: null }]);
  static CONTROLS = [];
  static NOTE_STAGE = 0;
  static ARIA_LABEL = 'A map of India with the normal dates of the advancing monsoon: dated lines from 22 May over the sea to 8 July over far western Rajasthan.';

  tl = tapLight({ label: 'Places', chips: CHIPS, onChange: () => this.repaint() });

  css() { return TAP_LIGHT_CSS + READ_CSS + CSS; }
  stageHeight(st) { return st.portrait ? Math.round(st.W * 1.03) + (this._isSetup ? 78 : 0) : 470; }
  get _isSetup() { return this._count !== BEATS; }

  onBeatChange(beat, count) { this._count = count; super.onBeatChange(beat, count); this._syncChips(); }

  async setup() {
    this._geo = null;
    this._fresh = true;
    await super.setup();
    this.tl.mount(this.root, this);
    this._syncChips();
    loadIndia().then((g) => { this._geo = g; this.repaint(); }).catch(() => {});
  }
  destroy() { this.tl.destroy(); super.destroy(); }
  enter() { this._fresh = true; this.tl.reset(); }

  _syncChips() {
    const row = this.root?.querySelector?.('.tl-row');
    if (row) row.style.display = !this._isSetup && this.stepIndex === 1 ? '' : 'none';
    if (!this._isSetup && this.stepIndex === 1 && !this.tl.any()) { this.tl.set({ lit: 'delhi' }); this.repaint(); }
    this.relayout?.();
  }

  _box(st) {
    if (st.portrait) { const w = st.W, h = Math.round(st.W * 1.03); return { x: 0, y: 0, w, h }; }
    const h = st.H - 4; return { x: 0, y: 2, w: Math.round(h * 0.97), h };
  }

  _lines(v, st) {
    const stepIdx = this.stepIndex, setup = this._isSetup, fresh = this._fresh && stepIdx === 0 && !setup;
    const place = !setup && stepIdx === 1 ? PLACES[this.tl.lit()[0]] : null;
    const lit = new Set(place ? [place.advance.on, place.advance.after, place.advance.by].filter(Boolean) : []);
    let out = '';
    ADVANCE.forEach((l, i) => {
      if (setup && l.date !== '1 June') return;
      const sea = stepIdx === 2 && i < 2;
      const dim = place ? !lit.has(l.date) : stepIdx === 2 && !setup && !sea;
      const w = lit.has(l.date) || sea || setup ? 4.5 : 3;
      const anim = fresh ? ` class="sv-draw" pathLength="1" style="--len:1;--dur:0.5s;--d:${(0.15 + i * 0.26).toFixed(2)}s;` : ' style="';
      out += `<path d="${v.line(l.line)}"${anim}fill:none;stroke:${LINE};stroke-width:${w};stroke-linecap:round;opacity:${dim ? 0.3 : 1}"/>`;
      const t = TAGS[l.date], e = l.line[t.end ? l.line.length - 1 : 0], p = v.at(e);
      if (!setup || l.date === '1 June') {
        const w = l.date.length * 7.4, right = t.a === 'end';
        const x = right ? Math.max(p[0] + t.dx, v.box.x + 5 + w) : p[0] + t.dx;
        out += mapText(x, p[1] + t.dy, l.date, { anchor: t.a ?? 'middle', size: lit.has(l.date) ? 15 : 14, opacity: dim ? 0.5 : 1 });
      }
    });
    return out;
  }

  _arms(v) {
    let out = '';
    ARMS.forEach((a, i) => {
      const d = v.line(a.pts), e = v.at(a.pts[a.pts.length - 1]), q = v.at(a.pts[a.pts.length - 2]);
      const ang = Math.atan2(e[1] - q[1], e[0] - q[0]), s = 13;
      const tip = `M${(e[0] + Math.cos(ang) * s).toFixed(1)} ${(e[1] + Math.sin(ang) * s).toFixed(1)}L${(e[0] + Math.cos(ang + 2.4) * s).toFixed(1)} ${(e[1] + Math.sin(ang + 2.4) * s).toFixed(1)}L${(e[0] + Math.cos(ang - 2.4) * s).toFixed(1)} ${(e[1] + Math.sin(ang - 2.4) * s).toFixed(1)}Z`;
      out += `<path d="${d}" class="sv-draw" pathLength="1" style="--len:1;--dur:0.9s;--d:${0.2 + i * 0.35}s;fill:none;stroke:${ARM};stroke-width:9;stroke-linecap:round;opacity:0.88"/>`
        + `<path d="${tip}" style="fill:${ARM};opacity:0.95"/>`;
    });
    return out;
  }

  paint(st) {
    if (!this._geo) return { svg: '', over: '' };
    const box = this._box(st), v = indiaView(this._geo, box, EXTENT), setup = this._isSetup, step = this.stepIndex;
    let svg = mapSvg(v);
    if (!setup && step === 2) {
      svg += svgCloud(...v.at([70, 16]), 0.42, { kind: 'rain', seed: 2 }) + svgCloud(...v.at([90.5, 15]), 0.42, { kind: 'rain', seed: 5 });
    }
    svg += this._lines(v, st);
    if (!setup && step === 2) svg += this._arms(v);
    let over = '';
    if (setup) {
      const k = v.at(PLACES.kochi.ll), r = v.at(PLACES.jaisalmer.ll);
      svg += pinSvg(k[0], k[1]) + mapText(k[0] + 9, k[1] + 5, 'Kerala', { anchor: 'start', size: 15 })
        + pinSvg(r[0], r[1], { c: 'var(--sim-series-2)' }) + mapText(r[0] + 9, r[1] + 5, 'Far western Rajasthan', { anchor: 'start', size: 15 });
    } else if (step === 1) {
      for (const c of CHIPS) {
        const P = PLACES[c.id], p = v.at(P.ll), on = this.tl.has(c.id), name = c.label;
        if (!on) { svg += pinSvg(p[0], p[1], { r: 4 }); continue; }
        svg += pinSvg(p[0], p[1], { r: 7, c: 'var(--sim-series-2)' });
        const below = SIDE[c.id] === 'b';
        svg += mapText(p[0] + (below ? 0 : 11), p[1] + (below ? 22 : 5), name, { anchor: below ? 'middle' : 'start', size: 16 });
      }
    } else if (step === 2) {
      for (const a of ARMS) { const y = v.at([80, a.tag])[1]; svg += mapText(a.right ? box.x + box.w - 8 : box.x + 8, y, a.name, { size: 14, anchor: a.right ? 'end' : 'start' }); }
      for (const k of ['shillong', 'delhi']) { const p = v.at(PLACES[k].ll); svg += pinSvg(p[0], p[1], { r: 5, c: 'var(--sim-series-2)' }) + mapText(p[0] + (k === 'delhi' ? -9 : 0), p[1] + (k === 'delhi' ? -8 : 20), PLACES[k].name, { size: 14, anchor: k === 'delhi' ? 'end' : 'middle' }); }
    }
    svg += creditSvg(v) + mapEnd(v);
    this._fresh = false;
    const [big, small] = this._reading(setup, step);
    const read = readCard(big, small);
    const x = box.x + box.w + 14;
    over = st.portrait
      ? `<div class="mf-side" style="left:0;right:0;top:${box.h + 8}px">${setup ? read : ''}</div>`
      : `<div class="mf-side" style="left:${x}px;right:0;top:${box.y + 6}px">${read}</div>`;
    return { svg, over, head: st.portrait && !setup ? read : '' };
  }

  _reading(setup, step) {
    if (setup) return ['1 June', 'the monsoon reaches Kerala'];
    if (step === 0) return ['1 June to 8 July', 'about five weeks over the mainland'];
    if (step === 1) { const P = PLACES[this.tl.lit()[0]]; return P ? [dateSpan(P.advance), P.name] : ['Tap a place', 'to read its date']; }
    return ['Two arms', 'one from each sea'];
  }
}
