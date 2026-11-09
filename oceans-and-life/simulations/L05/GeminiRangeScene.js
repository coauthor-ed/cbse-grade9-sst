// GeminiRangeScene - India's coast off Alappuzha, two fishing boats. Survey of India layer, credit on screen.
//   1 beat (predict setup): boats and distances only, no ring, no limit.
//   3 beats: ring at 50 NM with the far boat to drag in; satellite, device, phone; planned ring at 300 NM.
// 1 NM = 1 minute of latitude; the ring is measured from Alappuzha, a simple stand-in for distance from the shore.
import { SvgScene } from 'simulations/base/kit/SimSvg.js';
import { AIR_CSS, tx, panel, sky, loadSea, seaView, mapOpen, mapEnd, mapName, creditPlate, windArrow } from '../L04/SeaDraw.js';
import { svgCountryBoat, svgSatellite } from '../shared/SeaArt.js';

const ONE = [[{ idx: 0, dwellMs: null }]];
const THREE = [[{ idx: 1, dwellMs: null }], [{ idx: 2, dwellMs: null }], [{ idx: 3, dwellMs: null }]];
const PORT = [76.32, 9.5], NEAR = [[72.9, 7.4], [77.6, 11.6]], FAR = [[67.5, 3.6], [79, 15.4]];
const lonAt = (nm) => PORT[0] - nm / 60 / Math.cos(PORT[1] * Math.PI / 180);

export class GeminiRangeScene extends SvgScene {
  static BEAT_STEP_MAP = THREE;
  // A predict's setup mount is driven with count MAX_SAFE_INTEGER (simulationHost), so it needs its own entry.
  static BEAT_MAPS = { 1: ONE, 3: THREE, [Number.MAX_SAFE_INTEGER]: ONE };
  static ARIA_LABEL = 'A map of the sea off Alappuzha in Keralam with two fishing boats, 30 and 80 nautical miles from the shore.';
  static CONTROLS = [];
  css() { return AIR_CSS + '.sim-dom-root--portrait.svs { padding: var(--sim-space-1) 0; }'; }
  stageHeight(st) { return st.portrait ? 470 : 430; }
  async setup() {
    this._nm = 80; this._found = false;
    await super.setup();
    this._g = await loadSea({ india: true });
    this.repaint();
  }
  enter() { this._nm = 80; }
  pointerDown(p) {
    if (this.stepIndex !== 1 || !this._boat) return false;
    if (Math.hypot(p.x - this._boat[0], p.y - this._boat[1]) > 46) return false;
    return true;
  }
  pointerMove(p) {
    const v = this._v;
    if (!v) return false;
    const per = v.at([lonAt(0), PORT[1]])[0] - v.at([lonAt(1), PORT[1]])[0];
    this._nm = Math.round(Math.max(20, Math.min(100, (v.at(PORT)[0] - p.x) / per)));
    if (this._nm <= 50 && !this._found) { this._found = true; this.celebrate(p.x, p.y); }
    return true;
  }
  paint(st) {
    const W = st.W, H = st.H, port = st.portrait, step = this.stepIndex;
    if (!this._g) return { svg: panel(0, 0, W, H) };
    const top = step === 2 ? 132 : 2;
    const v = seaView(this._g, { x: 2, y: top, w: W - 4, h: H - top - 4 }, step === 3 ? FAR : NEAR);
    this._v = v;
    const a = v.at(PORT), per = a[0] - v.at([lonAt(1), PORT[1]])[0];
    let s = mapOpen(v);
    if (step >= 1) {
      s += `<circle cx="${a[0]}" cy="${a[1]}" r="${50 * per}" style="fill:${sky('sun')};fill-opacity:0.2;stroke:${sky('sun')};stroke-width:4"/>`;
    }
    if (step === 3) s += `<circle cx="${a[0]}" cy="${a[1]}" r="${300 * per}" style="fill:${sky('sun')};fill-opacity:0.1;stroke:${sky('sun')};stroke-width:4;stroke-dasharray:12 10"/>`;
    const nm = step === 0 ? 80 : this._nm;
    const y = a[1], near = [a[0] - 30 * per, y - 34], far = [a[0] - nm * per, y + 40];
    const k = step === 3 ? 0.34 : 0.55;
    s += svgCountryBoat(near[0], near[1], k, {}) + svgCountryBoat(far[0], far[1], k, {});
    this._boat = far;
    s += `<circle cx="${a[0]}" cy="${a[1]}" r="6" style="fill:${sky('red')};stroke:${sky('white')};stroke-width:3"/>`;
    s += mapEnd(v);
    s += mapName(a[0] + 10, a[1] + 5, 'Alappuzha', { size: 15, anchor: 'start' });
    if (step !== 3) {
      s += mapName(near[0], near[1] + 22, '30 NM', { size: 16 });
      s += mapName(far[0], far[1] + 22, `${nm} NM`, { size: 16 });
    }
    if (step === 0) s += mapName(W / 2 - 30, v.box.y + 28, 'Arabian Sea', { size: 17 });
    if (step === 1) {
      const inside = nm <= 50;
      s += panel(10, 12, W - 20, inside ? 50 : 76, { r: 12 });
      s += tx(W / 2, 44, inside ? 'Inside 50 NM: the warning arrives' : 'Outside 50 NM: no message', { size: 17, display: true, weight: 700, col: inside ? 'var(--sim-good)' : 'var(--sim-label)' });
      if (!inside) s += tx(W / 2, 70, 'Fishers check the forecast before they sail', { size: 15, weight: 700 });
      if (!inside) s += `<circle class="air-pulse" cx="${far[0]}" cy="${far[1] - 8}" r="38" style="fill:none;stroke:${sky('white')};stroke-width:3;stroke-dasharray:6 7"/>`;
      s += mapName(a[0] - 8, a[1] + 50 * per + 20, '50 NM limit', { size: 15 });
      if (!port) s += tx(W - 16, 110, 'drag the far boat', { size: 15, anchor: 'end', col: sky('ink'), halo: sky('cloud') });
    }
    if (step === 2) {
      const cx = [W * 0.17, W * 0.5, W * 0.83];
      s += `<rect x="0" y="0" width="${W}" height="126" rx="16" style="fill:${sky('hullDark')}"/>`;
      s += svgSatellite(cx[0], 44, 0.42, {});
      s += `<rect x="${cx[1] - 15}" y="24" width="30" height="46" rx="6" style="fill:${sky('metal')};stroke:${sky('white')};stroke-width:2.5"/><rect x="${cx[1] - 9}" y="31" width="18" height="14" rx="2" style="fill:${sky('panelLit')}"/><path d="M${cx[1] + 9} 24v-13" style="stroke:${sky('white')};stroke-width:3;stroke-linecap:round"/>`;
      s += `<rect x="${cx[2] - 16}" y="16" width="32" height="56" rx="6" style="fill:${sky('white')};stroke:${sky('ink')};stroke-width:2.5"/><rect x="${cx[2] - 11}" y="23" width="22" height="38" rx="2" style="fill:${sky('sea')}"/>`;
      s += windArrow([[cx[0] + 44, 46], [cx[1] - 24, 46]], { w: 5, col: sky('sun'), rim: sky('cloud') }) + windArrow([[cx[1] + 22, 46], [cx[2] - 24, 46]], { w: 5, col: sky('sun'), rim: sky('cloud') });
      const lab = (x, a1, a2) => tx(x, 96, a1, { size: 15, col: sky('cloud') }) + tx(x, 114, a2, { size: 14, col: sky('cloud'), weight: 700 });
      s += lab(cx[0], 'GAGAN', 'satellite') + lab(cx[1], 'GEMINI', 'handheld device') + lab(cx[2], 'Phone app', 'nine languages');
      s += tx((cx[1] + cx[2]) / 2, 30, 'Bluetooth', { size: 14, col: sky('cloud'), weight: 700 });
    }
    if (step === 3) {
      s += mapName(a[0] - 300 * per * 0.5, a[1] - 300 * per * 0.5 - 40, 'planned: 300 NM', { size: 16 });
      s += mapName(a[0] - 50 * per - 4, a[1] + 74, 'today: 50 NM', { size: 15 });
    }
    s += creditPlate(W - 2, H - 2, { size: 14 });
    return { svg: s };
  }
}
