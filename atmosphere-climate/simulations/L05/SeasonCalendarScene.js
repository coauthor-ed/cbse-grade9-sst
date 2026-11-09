// SeasonCalendarScene - blk-l05-s04. A year strip above a true map. Book's months: south-west monsoon
// June to September, north-east monsoon October to February. March to May belongs to neither. Beat
// 1 adds a compass rule: a monsoon is named for where it comes from.
import { SvgScene } from 'simulations/base/kit/SimSvg.js';
import { tapLight } from 'simulations/base/kit/TapLight.js';
import { AIR_CSS, tx, sky, SKY_INK, windArrow, loadGeo, indiaMap, creditPlate, num } from '../L03/AirDraw.js';

const MAP = [[{ idx: 0, dwellMs: null }], [{ idx: 1, dwellMs: null }]];
const MO = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
const CHIPS = [{ id: 'sw', label: 'South-west monsoon', targets: ['sw'], tone: 1 }, { id: 'ne', label: 'North-east monsoon', targets: ['ne'], tone: 2 }];
const SW = 'var(--sim-series-1)', NE = 'var(--sim-series-2)';

export class SeasonCalendarScene extends SvgScene {
  static BEAT_STEP_MAP = MAP;
  static ARIA_LABEL = 'A year strip and a map of India. The south-west monsoon blows from sea to land from June to September. The north-east monsoon blows from land to sea from October to February.';
  static CONTROLS = [];
  tl = tapLight({ label: 'Monsoon', chips: CHIPS, onChange: () => this.repaint() });
  css() { return AIR_CSS; }
  stageHeight(st) { return st.portrait ? 440 : 420; }
  async setup() { await super.setup(); this.tl.mount(this.root, this); this.tl.set({ lit: 'sw' }); this.repaint(); this._g = await loadGeo(); this.repaint(); }
  destroy() { this.tl.destroy(); super.destroy(); }
  enter(step) { if (this.tl?.mount) this.tl.set({ lit: 'sw' }); }
  paint(st) {
    const W = st.W, H = st.H, port = st.portrait, step = this.stepIndex, top = 92, lit = this.tl.chip()?.id ?? 'sw', isSw = lit === 'sw';
    const m = indiaMap(this._g, { x: 0, y: top, w: W, h: H - top }, [[56, 2], [100, 37]]);
    let s = `<defs><clipPath id="scC"><rect y="${top - 8}" width="${W}" height="${H - top + 8}" rx="18"/></clipPath></defs><rect y="${top - 8}" width="${W}" height="${H - top + 8}" rx="18" style="fill:${sky('sea')}"/>`;
    if (m) s += `<g clip-path="url(#scC)"><path d="${m.landD}" style="fill:color-mix(in oklab, ${sky('sand')} 70%, var(--sim-bg-surface));stroke:${sky('sandDark')};stroke-width:1.5"/><path d="${m.indiaD}" style="fill:${sky('grassLit')};stroke:${SKY_INK};stroke-width:2"/></g>`;
    // year strip
    const bw = (W - 8) / 12;
    MO.forEach((t, i) => {
      const inSw = i >= 5 && i <= 8, inNe = i >= 9 || i <= 1, on = isSw ? inSw : inNe;
      const col = inSw ? SW : inNe ? NE : 'var(--sim-track)';
      s += `<rect x="${num(4 + i * bw + 1.5)}" y="4" width="${num(bw - 3)}" height="46" rx="8" style="fill:${on ? col : 'var(--sim-track)'};stroke:var(--sim-stroke);stroke-width:2"/>`;
      s += tx(4 + i * bw + bw / 2, 34, t, { size: 16, col: on ? 'var(--sim-bg-surface)' : 'var(--sim-label)' });
    });
    s += tx(W / 2, 72, isSw ? 'June to September, sea to land' : 'October to February, land to sea', { size: 17 });
    if (m) {
      const a = m.at;
      if (isSw) {
        s += windArrow([[60, 7], [66, 11], [73, 17]].map(a), { w: 13, col: sky('cloud'), curve: true, flow: true });
        s += windArrow([[80, 3], [85, 9], [90, 19]].map(a), { w: 13, col: sky('cloud'), curve: true, flow: true });
      } else {
        s += windArrow([[88, 28], [81, 23], [74, 15], [68, 9]].map(a), { w: 13, col: sky('cloud'), curve: true, flow: true });
        s += windArrow([[92, 24], [86, 15], [81, 8]].map(a), { w: 13, col: sky('cloud'), curve: true, flow: true });
      }
      if (step === 1) {
        const cx = 66, cy = top + 62, R = 44;
        s += `<circle cx="${cx}" cy="${cy}" r="${R}" style="fill:var(--sim-bg-surface);stroke:var(--sim-stroke);stroke-width:3"/>`;
        for (const [t, x, y] of [['N', 0, -1], ['E', 1, 0], ['S', 0, 1], ['W', -1, 0]]) s += tx(cx + x * 31, cy + y * 31 + 6, t, { size: 15 });
        const u = 0.707 * 32, f = isSw ? -1 : 1;
        s += windArrow([[cx + f * u, cy - f * -u * -1 * 1], [cx - f * u, cy + f * u]].map((p, i) => (i === 0 ? [cx + f * u, cy - f * u] : [cx - f * u, cy + f * u])), { w: 6, col: isSw ? SW : NE, rim: SKY_INK, head: 11 });
        s += tx(cx - 30, cy + R + 22, 'comes from', { size: 16, anchor: 'start', col: SKY_INK, halo: sky('cloud') }) + tx(cx - 30, cy + R + 42, isSw ? 'the south-west' : 'the north-east', { size: 16, anchor: 'start', col: SKY_INK, halo: sky('cloud') });
      }
    }
    s += m ? creditPlate(W, H) : '';
    return { svg: s };
  }
}
