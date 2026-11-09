// TsunamiMakeScene - a section of the ocean. Depth and wave height are not to scale, and the drawing says so.
//   0 the sea floor jolts up and lifts the water above it   1 fast and low in the deep, a ship hardly lifted
//   2 slower and higher near the shore, a series of waves. Slider: where the wave is. No people in the water.
// Speed in the deep from the plan's figure, about 700 to 800 km/h; height under about 1 m. Near shore, words only.
import { SvgScene } from 'simulations/base/kit/SimSvg.js';
import { AIR_CSS, tx, panel, sky, btn, bindActs, tween, rangeInput, bindRange, windArrow } from '../L04/SeaDraw.js';
import { svgCargoShip, svgHut, svgPalm, svgCloud } from '../shared/SeaArt.js';

const MAP = [[{ idx: 0, dwellMs: null }], [{ idx: 1, dwellMs: null }], [{ idx: 2, dwellMs: null }]];
const smooth = (u) => { const t = Math.max(0, Math.min(1, u)); return t * t * (3 - 2 * t); };

export class TsunamiMakeScene extends SvgScene {
  static BEAT_STEP_MAP = MAP;
  static ARIA_LABEL = 'A section of the ocean. The sea floor jolts up and lifts the water above it. In the deep the wave is fast and low. Near the shore it slows and grows taller.';
  static CONTROLS = [];
  css() { return AIR_CSS + '.sim-dom-root--portrait.svs { padding: var(--sim-space-1) 4px; }'; }
  stageHeight(st) { return st.portrait ? 440 : 420; }
  async setup() {
    this._j = 1; this._pos = 0.3; this._seen = false;
    await super.setup();
    this._off = bindActs(this, (a) => {
      if (a === 'jolt') { this._halt?.(); this._going = true; this._j = 0; this._halt = tween(1500, (p) => { this._j = p; this.repaint(); }, () => { this._going = false; this.repaint(); if (!this._seen) { this._seen = true; this.celebrate(this.sv.W * 0.28, 120); } }); }
    });
    this._off2 = bindRange(this, (id, v) => { this._pos = v / 100; });
    this.repaint();
  }
  destroy() { this._halt?.(); this._off?.(); this._off2?.(); super.destroy(); }
  enter(step) { this._halt?.(); this._going = false; this._j = step === 0 ? 0 : 1; this._pos = step === 2 ? 0.8 : 0.32; }
  paint(st) {
    const W = st.W, H = st.H, port = st.portrait, step = this.stepIndex, foot = step === 0 ? 0 : (port ? 104 : 84), Hf = H - foot;
    const seaY = Hf * 0.3, deep = Hf - 34, shoreX = W * 0.86;
    // sea bed: deep then rising to the shore
    const bedAt = (x) => { const u = (x / shoreX); return deep - (deep - seaY) * smooth((u - 0.5) / 0.5); };
    const pos = step === 0 ? 0.26 : this._pos, wx = pos * shoreX * 0.98;
    const hump = (x, c, amp, w) => amp * Math.exp(-(((x - c) / w) ** 2));
    const amp = step === 0 ? 5 + 7 * this._j : 7 + 62 * smooth((pos - 0.58) / 0.4), wid = 80 - 44 * smooth((pos - 0.5) / 0.5);
    const crests = step === 2 ? [0, -0.15, -0.3] : [0];
    const surf = (x) => seaY - crests.reduce((a, d, i) => a + hump(x, wx + d * shoreX * 0.98, amp * (1 - i * 0.28) * (wx + d * shoreX < 0 ? 0 : 1), wid), 0);
    let top = '', i = 0;
    for (let x = 0; x <= shoreX + 30; x += 6) { top += `${i ? 'L' : 'M'}${x} ${surf(x).toFixed(1)}`; i += 1; }
    let bed = `M0 ${Hf}`;
    for (let x = 0; x <= shoreX + 2; x += 10) {
      const lift = (step === 0 && x > W * 0.18 && x < W * 0.34) ? 22 * this._j : (step > 0 && x > W * 0.18 && x < W * 0.34 ? 22 : 0);
      bed += `L${x} ${(bedAt(x) - lift).toFixed(1)}`;
    }
    bed += `L${shoreX + 34} ${seaY - 12}L${W} ${seaY - 30}V${Hf}Z`;
    let s = `<defs><clipPath id="tmc"><rect width="${W}" height="${Hf}" rx="18"/></clipPath></defs><g clip-path="url(#tmc)">`;
    s += `<rect width="${W}" height="${Hf}" style="fill:${sky('sky')}"/>` + svgCloud(W * 0.62, 34, 0.4, { seed: 4 });
    s += `<path d="${top}L${shoreX + 40} ${Hf}L0 ${Hf}Z" style="fill:${sky('seaMid')}"/><path d="M0 ${seaY + 90}H${W}V${Hf}H0Z" style="fill:${sky('seaDeep')};opacity:0.55"/>`;
    s += `<path d="${bed}" style="fill:${sky('rockMid')};stroke:${sky('rockDark')};stroke-width:3"/>`;
    s += `<path d="${top}" style="fill:none;stroke:${sky('foam')};stroke-width:4"/>`;
    s += svgPalm(W * 0.93, seaY - 26, 0.42, { lean: 6 }) + svgHut(W * 0.97, seaY - 30, 0.42, {});
    if (step === 0) {
      const a = W * 0.26;
      for (const d of [-44, 0, 44]) s += windArrow([[a + d, deep - 34], [a + d, seaY + 26 + (1 - this._j) * 30]], { w: 5, col: sky('cloud'), rim: sky('hullDark'), op: this._j > 0.15 ? 1 : 0 });
    }
    if (step === 1) { const x = W * 0.55; s += svgCargoShip(x, surf(x), port ? 0.3 : 0.42, { rot: (surf(x + 22) - surf(x - 22)) * 0.5 }); }
    s += '</g>';
    s += tx(14, 24, 'depth and height not to scale', { size: 14, anchor: 'start', col: sky('ink'), halo: sky('cloud') });
    let over = '';
    if (step === 0) {
      s += tx(W * 0.26, Hf - 8, 'sea floor', { size: 15, col: sky('cloud'), halo: sky('hullDark') });
      if (this._j >= 1) s += tx(W * 0.42, seaY + 34, 'all the water above is lifted', { size: 15, anchor: 'start', col: sky('cloud'), halo: sky('hullDark') });
      over = btn(W * 0.72, Hf - 34, this._j >= 1 ? 'Jolt it again' : 'Jolt the sea floor', 'jolt', { disabled: this._going });
    } else {
      const py = H - foot, nearShore = pos > 0.62;
      s += panel(8, py + 6, W - 16, foot - 14, { r: 12 });
      const sp = nearShore ? 'much slower' : 'about 700-800 km/h', ht = nearShore ? 'much taller' : 'under about 1 m';
      if (port) {
        s += tx(20, py + 28, `Speed: ${sp}`, { size: 15, anchor: 'start' }) + tx(20, py + 49, `Height: ${ht}`, { size: 15, anchor: 'start' });
      } else {
        s += tx(20, py + 28, `Speed: ${sp}`, { size: 15, anchor: 'start' }) + tx(W - 20, py + 28, `Height: ${ht}`, { size: 15, anchor: 'end' });
      }
      over = rangeInput(W / 2, py + (port ? 74 : 54), W - 48, 'pos', Math.round(pos * 100), 15, 92, 1, 'Where the wave is, from the deep sea to the shore');
    }
    return { svg: s, over };
  }
}
