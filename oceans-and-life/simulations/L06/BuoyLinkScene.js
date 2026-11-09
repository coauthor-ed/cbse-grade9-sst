// BuoyLinkScene - a drawing of how a detection buoy works, labelled a drawing. 0 the buoy on the sea.
// 1 the recorder on the sea floor feels more water above and signals up. 2 buoy to satellite to centre.
// Send plays the hop of the beat; on landing the hop is already drawn.
import { SvgScene } from 'simulations/base/kit/SimSvg.js';
import { AIR_CSS, tx, sky, btn, bindActs, tween } from '../L04/SeaDraw.js';
import { svgBuoy, svgSatellite, svgSeaColumn, svgCloud } from '../shared/SeaArt.js';

const MAP = [[{ idx: 0, dwellMs: null }], [{ idx: 1, dwellMs: null }], [{ idx: 2, dwellMs: null }]];

export class BuoyLinkScene extends SvgScene {
  static BEAT_STEP_MAP = MAP;
  static ARIA_LABEL = 'A drawing of a tsunami detection buoy on the sea, a pressure recorder on the sea floor below it, a satellite above, and a warning centre on land.';
  static CONTROLS = [];
  css() { return AIR_CSS + '.sim-dom-root--portrait.svs { padding: var(--sim-space-1) 4px; }'; }
  stageHeight(st) { return st.portrait ? 490 : 430; }
  async setup() {
    this._p = 1;
    await super.setup();
    this._off = bindActs(this, (a) => { if (a === 'send') { this._halt?.(); this._going = true; this._p = 0; this._halt = tween(1400, (p) => { this._p = p; this.repaint(); }, () => { this._going = false; this.repaint(); }); } });
    this.repaint();
  }
  destroy() { this._halt?.(); this._off?.(); super.destroy(); }
  enter() { this._halt?.(); this._going = false; this._p = 1; }
  _pulse(a, b) { return this._dot(a, b, this._p); }
  _dot(a, b, t) {
    const x = a[0] + (b[0] - a[0]) * t, y = a[1] + (b[1] - a[1]) * t;
    return `<circle cx="${x}" cy="${y}" r="9" style="fill:${sky('sun')};stroke:${sky('ink')};stroke-width:2.5"/>`;
  }
  paint(st) {
    const W = st.W, H = st.H, port = st.portrait, step = this.stepIndex;
    const seaY = H * 0.36, bed = H - 56, bx = port ? W * 0.36 : W * 0.4;
    let s = `<defs><clipPath id="blc"><rect width="${W}" height="${H}" rx="18"/></clipPath></defs><g clip-path="url(#blc)">`;
    s += `<rect width="${W}" height="${seaY + 6}" style="fill:${sky('sky')}"/>` + svgCloud(W * 0.14, 46, 0.42, { seed: 3 });
    s += svgSeaColumn(0, seaY, 1, { w: W, h: H - seaY, wave: 5, len: 80 });
    s += `<path d="M0 ${bed}Q${W * 0.3} ${bed - 14} ${W * 0.6} ${bed + 4}T${W} ${bed - 6}V${H}H0Z" style="fill:${sky('sand')};stroke:${sky('sandDark')};stroke-width:3"/>`;
    // land with the centre at the right
    const lx = W * 0.8;
    s += `<path d="M${lx - 34} ${seaY + 4}Q${lx + 8} ${seaY + 2} ${lx + 30} ${seaY - 12}H${W}V${H}H${lx + 34}Q${lx + 6} ${seaY + 90} ${lx - 34} ${seaY + 4}Z" style="fill:${sky('rockMid')};stroke:${sky('rockDark')};stroke-width:3"/>`;
    s += `<path d="M${lx - 30} ${seaY + 2}Q${lx + 8} ${seaY + 2} ${lx + 30} ${seaY - 12}H${W}" style="fill:none;stroke:${sky('grass')};stroke-width:12;stroke-linecap:round"/>`;
    const cx = W - (port ? 32 : 58), cy = seaY - 8;
    s += `<rect x="${cx - 24}" y="${cy - 42}" width="48" height="42" rx="3" style="fill:${sky('white')};stroke:${sky('ink')};stroke-width:2.5"/><rect x="${cx - 16}" y="${cy - 34}" width="12" height="12" style="fill:${sky('panelLit')}"/><rect x="${cx + 4}" y="${cy - 34}" width="12" height="12" style="fill:${sky('panelLit')}"/>`;
    s += svgBuoy(bx, seaY + 3, port ? 1.2 : 1.4, {});
    const rec = [bx, bed - 22], sat = [W * 0.62, 50], bu = [bx + 4, seaY - (port ? 100 : 116)];
    s += `<rect x="${rec[0] - 24}" y="${rec[1] - 12}" width="48" height="26" rx="6" style="fill:${sky('sun')};stroke:${sky('ink')};stroke-width:2.5"/><path d="M${rec[0] - 16} ${rec[1] + 14}l-7 12M${rec[0] + 16} ${rec[1] + 14}l7 12" style="stroke:${sky('ink')};stroke-width:4"/>`;
    s += svgSatellite(sat[0], sat[1], port ? 0.42 : 0.5, {});
    const label = (x, y, t, a = 'middle') => tx(x, y, t, { size: 16, anchor: a, col: sky('ink'), halo: sky('cloud'), haloW: 5, display: true, weight: 700 });
    const line = (a, b) => `<path d="M${a[0]} ${a[1]}L${b[0]} ${b[1]}" style="stroke:${sky('sun')};stroke-width:4;stroke-dasharray:10 8"/>`;
    if (step === 0) s += label(bx + (port ? 44 : 52), seaY + 28, 'detection buoy', 'start');
    if (step === 1) {
      s += line(rec, [bx, seaY + 8]) + this._pulse(rec, [bx, seaY + 8]);
      s += label(bx + 34, rec[1] + 4, 'pressure recorder', 'start');
      if (!port) s += tx(bx + 14, (seaY + bed) / 2, 'a signal goes up', { size: 15, anchor: 'start', col: sky('cloud'), halo: sky('hullDark') });
    }
    if (step === 2) {
      const c = [cx, cy - 46];
      s += line(bu, sat) + line(sat, c);
      s += this._p < 0.5 ? this._dot(bu, sat, this._p * 2) : this._dot(sat, c, (this._p - 0.5) * 2);
      s += label(sat[0] + 4, sat[1] + 40, 'satellite');
      s += label(W - 8, cy + 24, 'warning centre', 'end');
    }
    s += '</g>';
    s += tx(14, 26, 'a drawing, not a real buoy', { size: 15, anchor: 'start', col: sky('ink'), halo: sky('cloud') });
    const over = step === 0 ? '' : btn(port ? W * 0.7 : W * 0.72, H - 30, 'Send the reading', 'send', { disabled: this._going });
    return { svg: s, over };
  }
}
