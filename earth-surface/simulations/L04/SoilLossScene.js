// SoilLossScene - one field in side view. Monsoons take a little topsoil each year; plant cover slows the
// loss. Numbers are not real measurements, so none are printed: the soil band and the crop say it.
// Stages: 0 bare, 1 plant cover on, 2 who is affected (four small pictures).
import { SvgScene } from 'simulations/base/kit/SimSvg.js';
import { svgSoil, svgRock, svgGrass, svgWater, svgTree, svgBoulder } from '../shared/EarthArt.js';
import { svgCloud } from '../shared/SkyArt.js';
import { withEarth, BAR_CSS, world, tag, ec, strand, clamp, arrow, WHITE, INK, lerp } from './EarthBits.js';

const MAP = [0, 1, 2].map((idx) => [{ idx, dwellMs: null }]);
const MAX = 10;
const left = (m, cover) => clamp(1 - m * (cover ? .03 : .092), .08, 1);

export class SoilLossScene extends withEarth(SvgScene) {
  static BEAT_STEP_MAP = MAP;
  static WIDTH = 600;
  static HEIGHT = 490;
  static PORTRAIT_WIDTH = 340;
  static PORTRAIT_HEIGHT = 540;
  static ARIA_LABEL = 'A field in side view. Each monsoon takes a little of the dark topsoil and the crop gets smaller. With plant cover the soil lasts much longer.';
  static CONTROLS = [];

  css() { return BAR_CSS; }
  stageHeight(st) { return st.portrait ? 380 : 340; }

  enter(stage) {
    this._stage = stage; this._m = 0; this._cover = stage === 1; this._fresh = true; this._found = false;
    this._ctl();
  }
  _ctl() {
    if (this._stage === 2) { this.bar([]); return; }
    const items = [{ id: 'm', label: 'Monsoons', min: 0, max: MAX, value: this._m }];
    if (this._stage === 1) items.push({ id: 'cover', label: 'Plant cover', on: this._cover });
    this.bar(items);
  }
  control(id, v) {
    if (id === 'm') {
      this._m = v;
      if (v === MAX && this._cover && this._stage === 1 && !this._found) { this._found = true; this.celebrate(); }
    }
    if (id === 'cover') { this._cover = !this._cover; this._ctl(); }
    this.repaint();
  }

  _field(st) {
    const W = st.W, H = st.H, t = left(this._m, this._cover), top = H * .5, dy = H * .08, full = H * .17, th = full * t;
    const y = (u) => top + dy * u;
    let b = svgCloud(W * .24, 50, .8, { seed: 6, kind: 'rain' }) + svgCloud(W * .72, 40, .7, { seed: 3, kind: 'rain' });
    if (this._m > 0 && this._m < MAX) for (let i = 0; i < 18; i++) { const x = (i * 41) % W; b += `<path d="M${x} ${70 + (i * 19) % 70}l-5 18" style="stroke:${ec('sea')};stroke-width:3;stroke-linecap:round"/>`; }
    b += svgRock([[-10, y(0) + th], [W + 10, y(1) + th], [W + 10, H + 10], [-10, H + 10]], { seed: 5, fill: 'soil', cracks: 2, grain: true });
    b += `<path d="M-10 ${y(0)}L${W + 10} ${y(1)}L${W + 10} ${y(1) + th}L-10 ${y(0) + th}Z" style="fill:${ec('soilTop')}"/>`;
    const n = 9;
    for (let i = 0; i < n; i++) {
      const u = (i + .5) / n, x = W * u, g = y(u), h = 18 + 62 * t;
      b += `<path d="M${x} ${g}V${g - h}" style="stroke:${ec('grassDark')};stroke-width:5;stroke-linecap:round"/>`;
      for (const s of [-1, 1]) b += `<path d="M${x} ${g - h * .55}q${s * 14} ${-h * .2} ${s * 24 * (.6 + t * .5)} ${-h * .05}" style="stroke:${ec('grass')};stroke-width:5;fill:none;stroke-linecap:round"/>`;
      if (t > .5) b += `<circle cx="${x}" cy="${g - h}" r="${5 * t + 2}" style="fill:${ec('sand')}"/>`;
    }
    if (this._cover) b += svgGrass(0, y(0), W, y(1), { seed: 6, n: 40, tall: 15 });
    if (this._m > 0) b += arrow([[W * .55, y(.55) + 16], [W * .96, y(.96) + 18]], { c: ec('soil'), w: this._cover ? 4 : 9, rim: INK });
    const p = this._fresh ? { pop: true } : {};
    b += tag(W * .28, y(.28) + Math.max(th / 2, 10) + (th < 26 ? 24 : 0), 'Topsoil', { ...p, fill: t < .3 ? ec('rockDeep') : INK });
    b += tag(W * .28, H - 34, 'Subsoil', { ...p, delay: .1 });
    b += tag(W / 2, 22, t > .85 ? 'Soil holds, crop tall' : t > .4 ? 'Thinner soil, smaller crop' : 'Almost gone, weak crop', {});
    this._fresh = false;
    return b;
  }

  _who(st) {
    const W = st.W, H = st.H, g = 8, tw = (W - 3 * g) / 2, th = (H - 3 * g) / 2;
    const T = [
      ['Farmers', (w, h) => svgSoil([[-4, h * .58], [w + 4, h * .58], [w + 4, h + 4], [-4, h + 4]], { seed: 3, top: 5 }) + [.2, .4, .6, .8].map((u) => `<path d="M${u * w} ${h * .58}v-16" style="stroke:${ec('grassDark')};stroke-width:4;stroke-linecap:round"/>`).join('')],
      ['Rivers and coasts', (w, h) => svgWater([[-4, h * .66], [w + 4, h * .66], [w + 4, h + 4], [-4, h + 4]], { t: 1, ripples: 3 }) + svgSoil([[-4, h * .5], [w * .46, h * .5], [w * .6, h * .95], [-4, h * .95]], { seed: 4, top: 8 }) + `<rect x="${w * .22}" y="${h * .3}" width="${w * .2}" height="${h * .2}" style="fill:${ec('sandLit')};stroke:${INK};stroke-width:2.5"/><path d="M${w * .19} ${h * .3}L${w * .32} ${h * .17}L${w * .45} ${h * .3}Z" style="fill:${ec('bark')};stroke:${INK};stroke-width:2.5"/>`],
      ['Building, mining', (w, h) => svgRock([[-4, h * .3], [w * .4, h * .36], [w * .58, h * .7], [w + 4, h * .72], [w + 4, h + 4], [-4, h + 4]], { seed: 6, fill: 'rock', cracks: 4, outline: true }) + [0, 1, 2].map((i) => svgBoulder(w * (.5 + i * .1), h * (.68 + i * .01), .3, { seed: i + 1 })).join('')],
      ['Tourism, fishing', (w, h) => svgWater([[-4, h * .54], [w * .62, h * .54], [w * .46, h + 4], [-4, h + 4]], { t: 2, ripples: 3 }) + `<path d="M${w * .1} ${h * .5}h${w * .3}l-${w * .05} ${h * .1}h-${w * .2}z" style="fill:${ec('bark')};stroke:${INK};stroke-width:2.5"/><path d="M${w * .25} ${h * .5}V${h * .3}l${w * .1} ${h * .15}z" style="fill:${ec('snow')};stroke:${INK};stroke-width:2"/>` + svgTree(w * .86, h * .66, .4, { kind: 'palm', seed: 2 })],
    ];
    let b = `<rect width="${W}" height="${H}" style="fill:${ec('sandLit')}"/>`;
    T.forEach(([name, art], i) => {
      const x = g + (i % 2) * (tw + g), y = g + Math.floor(i / 2) * (th + g);
      b += `<g transform="translate(${x} ${y})"><clipPath id="sl-${i}"><rect width="${tw}" height="${th}" rx="12"/></clipPath><g clip-path="url(#sl-${i})"><rect width="${tw}" height="${th}" style="fill:url(#sl-sky)"/>${art(tw, th)}</g><rect width="${tw}" height="${th}" rx="12" style="fill:none;stroke:${INK};stroke-width:3"/>${tag(tw / 2, 20, name, { size: 14 })}</g>`;
    });
    return b;
  }

  paint(st) { return { svg: world(st, 'sl', this._stage === 2 ? this._who(st) : this._field(st)) }; }
}
