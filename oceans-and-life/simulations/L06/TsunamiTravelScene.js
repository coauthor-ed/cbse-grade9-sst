// TsunamiTravelScene - the eastern Indian Ocean. India from the Survey of India layer, credit on screen.
//   1 beat (predict setup): the place of the earthquake and Simeulue. No ring, no times, no stories.
//   3 beats: Simeulue close to the earthquake; ring reaching Simeulue at once and Chennai far later ("minutes",
//   "about two hours", book-safe words only: the ring shows distance, not a clock); then warning signs on a beach.
import { SvgScene } from 'simulations/base/kit/SimSvg.js';
import { AIR_CSS, tx, panel, sky, btn, bindActs, tween, loadSea, seaView, mapOpen, mapEnd, mapName, creditPlate, windArrow } from '../L04/SeaDraw.js';
import { svgHut, svgPalm, svgSeaColumn, svgCloud } from '../shared/SeaArt.js';

const ONE = [[{ idx: 0, dwellMs: null }]];
const THREE = [[{ idx: 1, dwellMs: null }], [{ idx: 2, dwellMs: null }], [{ idx: 3, dwellMs: null }]];
const QUAKE = [95.0, 3.3], SIMEULUE = [96.0, 2.6], CHENNAI = [80.27, 13.08];
const EXTENT = [[74, -5], [104, 23]];

export class TsunamiTravelScene extends SvgScene {
  static BEAT_STEP_MAP = THREE;
  // A predict's setup mount is driven with count MAX_SAFE_INTEGER (simulationHost), so it needs its own entry.
  static BEAT_MAPS = { 1: ONE, 3: THREE, [Number.MAX_SAFE_INTEGER]: ONE };
  static ARIA_LABEL = 'A map of the eastern Indian Ocean with the place of the 2004 earthquake off Sumatra, the island of Simeulue close to it, and Chennai far across the Bay of Bengal.';
  static CONTROLS = [];
  css() { return AIR_CSS + '.sim-dom-root--portrait.svs { padding: var(--sim-space-1) 0; }'; }
  stageHeight(st) { return st.portrait ? 470 : 430; }
  async setup() {
    this._r = 1;
    await super.setup();
    this._off = bindActs(this, (a) => { if (a === 'ring') { this._halt?.(); this._going = true; this._r = 0; this._halt = tween(3000, (p) => { this._r = p; this.repaint(); }, () => { this._going = false; this.repaint(); }); } });
    this._g = await loadSea({ india: true });
    this.repaint();
  }
  destroy() { this._halt?.(); this._off?.(); super.destroy(); }
  enter() { this._halt?.(); this._going = false; this._r = 1; }
  paint(st) { return this.stepIndex === 3 ? this._signs(st) : this._map(st); }
  _map(st) {
    const W = st.W, H = st.H, port = st.portrait, step = this.stepIndex;
    if (!this._g) return { svg: panel(0, 0, W, H) };
    const v = seaView(this._g, { x: 2, y: 2, w: W - 4, h: H - 6 }, EXTENT), q = v.at(QUAKE), sm = v.at(SIMEULUE), ch = v.at(CHENNAI);
    let s = mapOpen(v);
    if (step === 2) {
      const full = Math.hypot(ch[0] - q[0], ch[1] - q[1]);
      for (const k of [1, 0.66, 0.33]) s += `<circle cx="${q[0]}" cy="${q[1]}" r="${(full * k * this._r).toFixed(1)}" style="fill:none;stroke:${sky('white')};stroke-width:${k === 1 ? 4 : 2.5};opacity:${k === 1 ? 1 : 0.6}"/>`;
    }
    s += mapEnd(v);
    s += `<path d="M${q[0] - 15} ${q[1] + 16}l12 -18l-6 -3l15 -17l-4 14l7 2l-13 22Z" style="fill:${sky('sun')};stroke:${sky('ink')};stroke-width:2.5"/>`;
    s += `<circle cx="${sm[0]}" cy="${sm[1]}" r="7" style="fill:${sky('red')};stroke:${sky('white')};stroke-width:3"/>`;
    s += mapName(q[0] - 22, q[1] - 24, 'earthquake', { size: 16, anchor: 'end' });
    s += mapName(sm[0] - 10, sm[1] + 26, 'Simeulue', { size: 16, anchor: 'end' });
    s += mapName(v.at([90, 15])[0], v.at([90, 15])[1], 'Bay of Bengal', { size: 15 });
    if (step !== 0) {
      s += `<circle cx="${ch[0]}" cy="${ch[1]}" r="7" style="fill:${sky('red')};stroke:${sky('white')};stroke-width:3"/>` + mapName(ch[0] + 12, ch[1] + 6, 'Chennai', { size: 16, anchor: 'start' });
    }
    if (step === 1) s += mapName(v.at([96, 0])[0] - 40, v.at([96, 0])[1] + 34, 'close to the earthquake', { size: 15 });
    let over = '';
    if (step === 2) {
      if (this._r >= 1) {
        s += mapName(sm[0] - 10, sm[1] + 46, 'in minutes', { size: 16, anchor: 'end' });
        s += mapName(ch[0] + 12, ch[1] + 26, 'about two hours', { size: 16, anchor: 'start' });
      }
      over = btn(W * 0.32, H - 72, 'Spread the wave', 'ring', { disabled: this._going });
    }
    s += creditPlate(W - 2, H - 2, { size: 14 });
    return { svg: s, over };
  }
  _signs(st) {
    const W = st.W, H = st.H, port = st.portrait;
    const seaY = H * 0.66, xs = W * 0.28, xh = W * 0.62;
    let s = `<defs><clipPath id="ttc"><rect width="${W}" height="${H}" rx="18"/></clipPath></defs><g clip-path="url(#ttc)"><rect width="${W}" height="${H}" style="fill:${sky('sky')}"/>` + svgCloud(W * 0.2, 44, 0.42, { seed: 2 });
    s += svgSeaColumn(0, seaY + 34, 1, { w: xs, h: H, wave: 4, len: 60 });
    const hill = `M${xh} ${seaY - 18}Q${W * 0.82} ${seaY - 110} ${W} ${H * 0.26}`;
    s += `<path d="M0 ${H}V${seaY + 62}L${xs} ${seaY + 26}Q${xh * 0.8} ${seaY + 8} ${xh} ${seaY - 18}Q${W * 0.82} ${seaY - 110} ${W} ${H * 0.26}V${H}Z" style="fill:${sky('sand')};stroke:${sky('sandDark')};stroke-width:3"/>`;
    s += `<path d="M0 ${H}V${seaY + 62}L${xs} ${seaY + 26}Q${xh * 0.7} ${seaY + 16} ${xh * 0.9} ${seaY}L${xh * 0.8} ${H}Z" style="fill:${sky('sandDark')}"/>`;
    s += `<path d="${hill}" style="fill:none;stroke:${sky('grass')};stroke-width:14;stroke-linecap:round"/>`;
    s += `<path d="M${xs} ${seaY + 26}Q${xh * 0.7} ${seaY + 14} ${xh * 0.9} ${seaY}" style="fill:none;stroke:${sky('seaMid')};stroke-width:6;stroke-dasharray:3 10;stroke-linecap:round"/>`;
    s += svgPalm(xh + 34, seaY - 46, 0.42, { lean: 8 }) + svgHut(W * 0.9, H * 0.32 + 6, 0.5, {});
    s += windArrow([[xh * 0.86, seaY - 22], [W * 0.68, seaY - 92], [W * 0.84, H * 0.3 - 22]], { w: 9, col: sky('grassLit'), rim: sky('ink'), curve: true });
    s += windArrow([[xh * 0.76, seaY + 40], [xs + 10, seaY + 52]], { w: 7, col: sky('seaDeep'), rim: sky('cloud') });
    s += '</g>';
    const lab = (x, y, t, a) => tx(x, y, t, { size: 16, anchor: a, col: sky('ink'), halo: sky('cloud'), haloW: 5, display: true, weight: 700 });
    s += lab(14, 92, 'Strong shaking', 'start') + lab(14, 118, 'A roar from the sea', 'start') + lab(14, seaY - 4, 'The sea pulls far back', 'start') + tx(xh * 0.5, seaY + 92, 'bare sea bed', { size: 15, col: sky('ink'), halo: sky('cloud') });
    s += lab(W - 12, H * 0.12, 'Go to high ground', 'end');
    return { svg: s };
  }
}
