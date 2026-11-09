// BeachSwashScene - a beach in side view, sea at the right. Send a wave: the swash runs up thick and carries sand, part
// of it sinks in, the backwash runs back thin and leaves some sand, so a low ridge of sand builds. The wave count is an
// illustration. Stages: 0 the beach; 1 swash and backwash; 2 why sand stays; 3 uses.
import { SvgScene } from 'simulations/base/kit/SimSvg.js';
import { svgRock, svgSand, svgWater, svgTree, svgBoulder } from '../shared/EarthArt.js';
import { svgCloud } from '../shared/SkyArt.js';
import { withEarth, BAR_CSS, world, tag, ec, arrow, shape, clamp, lerp, INK, WHITE } from '../L04/EarthBits.js';

const MAP = [0, 1, 2, 3].map((idx) => [{ idx, dwellMs: null }]);
const MAX = 4;

export class BeachSwashScene extends withEarth(SvgScene) {
  static BEAT_STEP_MAP = MAP;
  static WIDTH = 620;
  static HEIGHT = 450;
  static PORTRAIT_WIDTH = 340;
  static PORTRAIT_HEIGHT = 480;
  static ARIA_LABEL = 'A sandy beach in side view. A wave runs up the beach as swash and carries sand. Part of the water sinks in, so the backwash is weaker and some sand stays.';
  static CONTROLS = [];
  css() { return BAR_CSS; }
  stageHeight(st) { return st.portrait ? 370 : 350; }

  enter(stage) {
    this._stage = stage; this._n = stage > 1 ? 3 : 0; this._w = 0; this._fresh = true; this.stopTween();
    this._ctl();
  }
  _ctl() {
    const s = this._stage;
    if (s === 1 || s === 2) this.bar(this._n >= MAX ? [{ id: 'reset', label: 'Start again' }] : [{ id: 'wave', label: 'Send a wave', go: true, off: !!this._tw }]);
    else this.bar([]);
  }
  control(id) {
    if (this._tw) return;
    if (id === 'reset') { this._n = 0; this._ctl(); this.repaint(); return; }
    this.tween(0, 1, 2.2, (v) => { this._w = v; }, () => {
      this._w = 0; this._n += 1; this._ctl();
      if (this._n === 3 && this._stage === 1 && !this._cel) { this._cel = true; this.celebrate(this.sv.W * .46, this.sv.H * .56); this.repaint(); }
    });
    this._ctl();
  }

  paint(st) {
    const W = st.W, H = st.H, s = this._stage, a = [W * .2, H * .46], z = [W * .84, H * .78], Y = (x) => lerp(a[1], z[1], (x - a[0]) / (z[0] - a[0])), sea = H * .66;
    const tideX = lerp(a[0], z[0], (sea - a[1]) / (z[1] - a[1]));
    let b = svgCloud(W * .56, 46, .66, { seed: 4 }) + svgCloud(W * .86, 66, .46, { seed: 8 });
    b += svgWater([[W * .4, sea], [W + 10, sea], [W + 10, H + 10], [W * .4, H + 10]], { t: 2, ripples: 6, deep: .6 });
    b += svgRock([[-10, H * .22], [W * .08, H * .2], [W * .17, H * .3], [W * .24, H * .5], [-10, H * .6]], { seed: 6, fill: 'rock', cracks: 4, outline: true, lit: true });
    const berm = this._n / MAX, bx = W * .46;
    const land = [[-10, a[1] + 2], [a[0], a[1]], [bx - 60, Y(bx - 60)], [bx, Y(bx) - 22 * berm], [bx + 60, Y(bx + 60)], [z[0], z[1]], [W + 10, H * .84], [W + 10, H + 10], [-10, H + 10]];
    b += svgSand(land, { seed: 5, ripples: true });
    for (let i = 0; i < 7; i++) b += svgBoulder(W * .1 + i * W * .07, Y(W * .1 + i * W * .07) + 12 + (i % 2) * 8, .16 + (i % 3) * .05, { seed: i + 1 });
    if (s === 3) b += svgTree(W * .1, a[1] + 2, .8, { kind: 'palm', seed: 3 });
    // the wave as a sheet on the sand
    const w = this._w, up = w < .5, k = up ? w / .5 : 1 - (w - .5) / .5, reach = lerp(tideX, W * .32, Math.sin(k * Math.PI / 2));
    if (w > 0) {
      const t = up ? 13 : 5, sheet = [[reach, Y(reach) - 1]];
      for (let x = reach + 20; x <= tideX + 30; x += 20) sheet.push([x, Y(x) - t * clamp((x - reach) / 40)]);
      sheet.push([tideX + 40, Y(tideX + 40)]);
      b += shape(sheet, { f: 'sea', s: 'seaDeep', w: 2 });
      for (let i = 0; i < 5; i++) { const gx = reach + 10 + i * 14; b += `<circle cx="${gx}" cy="${Y(gx) - 4}" r="4" style="fill:${ec('sandDark')}"/>`; }
      if (up) b += arrow([[tideX + 10, Y(tideX + 10) - 26], [reach + 20, Y(reach + 20) - 26]], { w: 7, c: WHITE }) + tag(W * .5, H * .3, 'Swash: thick, carries sand', { size: 15 });
      else {
        b += arrow([[reach + 10, Y(reach + 10) - 18], [tideX, Y(tideX) - 18]], { w: 3, c: WHITE, head: 11 }) + tag(W * .5, H * .3, 'Backwash: thin, leaves sand', { size: 15 });
        for (let i = 0; i < 3; i++) { const x = W * (.36 + i * .08); b += arrow([[x, Y(x) + 6], [x, Y(x) + 30]], { c: ec('sea'), w: 4, rim: ec('seaDeep') }); }
      }
    }
    const p = this._fresh ? { pop: true } : {};
    if (s === 0) b += tag(W * .46, H * .92, 'Beach: sand and pebbles', p) + tag(W * .1 + 26, H * .16, 'Cliff', { ...p, delay: .1 }) + tag(W * .84, H * .6, 'Sea', { ...p, delay: .2 });
    if (s === 1 && !w) b += tag(W / 2, 26, this._n >= 3 ? 'Sand is building up' : this._n ? `${this._n} wave${this._n > 1 ? 's' : ''}, some sand stayed` : 'Press Send a wave', {});
    if (s === 2 && !w) { for (let i = 0; i < 3; i++) { const x = W * (.36 + i * .08); b += arrow([[x, Y(x) + 6], [x, Y(x) + 34]], { c: ec('sea'), w: 4, rim: ec('seaDeep') }); } b += tag(W / 2, 26, 'Water sinks into the sand', p); }
    if (s === 3) {
      b += `<g transform="translate(${W * .68} ${sea - 4})"><path d="M-34 -6h68l-12 14h-44z" style="fill:${ec('bark')};stroke:${INK};stroke-width:2.5"/><path d="M0 -6v-38l24 30z" style="fill:${ec('snow')};stroke:${INK};stroke-width:2"/></g>`;
      b += tag(W * .32, H * .2 - 16, 'Tourism', p) + tag(W * .74, H * .46, 'Fishing', { ...p, delay: .1 }) + tag(W * .4, H * .8, 'Sand and shells', { ...p, delay: .2 }) + tag(W * .5, H * .92, 'Natural barrier to waves', { ...p, delay: .3 });
    }
    this._fresh = false;
    return { svg: world(st, 'bs', b) };
  }
}
