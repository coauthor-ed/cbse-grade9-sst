// WinterMonsoonRainScene - blk-l05-s06. True map. Beat 0: cold dry wind from the land, most of India
// dry. Beat 1: the same wind crosses the Bay of Bengal, picks up moisture and reaches the eastern
// coast; the book's three names. No state layer exists, so names mark the places, no borders drawn.
// Beat 2: Chennai's rainfall by month, Table 3.3.
import { SvgScene } from 'simulations/base/kit/SimSvg.js';
import { AIR_CSS, tx, panel, sky, SKY_INK, windArrow, loadGeo, indiaMap, creditPlate, num, svgCloud, svgRain } from '../L03/AirDraw.js';

const MAP = [0, 1, 2].map((i) => [{ idx: i, dwellMs: null }]);
const CHENNAI = [4.6, 1.3, 1.3, 1.8, 3.8, 4.5, 8.7, 11.3, 11.9, 30.6, 35.0, 13.9];
const MO = 'JFMAMJJASOND';

export class WinterMonsoonRainScene extends SvgScene {
  static BEAT_STEP_MAP = MAP;
  static ARIA_LABEL = 'A map of India in winter. Cold, dry wind blows from the land. Over the Bay of Bengal it picks up moisture and brings rain to the eastern coast, and Chennai has its wettest months in October and November.';
  static CONTROLS = [];
  css() { return AIR_CSS; }
  stageHeight(st) { return st.portrait ? (this.stepIndex === 2 ? 340 : 450) : 430; }
  async setup() { await super.setup(); this._g = await loadGeo(); this.repaint(); }
  paint(st) {
    const W = st.W, H = st.H, port = st.portrait, step = this.stepIndex;
    if (step === 2) return this._bars(st);
    const ext = step === 1 ? [[69, 6], [97, 26]] : [[64, 5], [100, 37]];
    const m = indiaMap(this._g, { x: 0, y: 0, w: W, h: H }, ext);
    let s = `<defs><clipPath id="wmC"><rect width="${W}" height="${H}" rx="18"/></clipPath></defs><rect width="${W}" height="${H}" rx="18" style="fill:${sky('sea')}"/>`;
    if (m) s += `<g clip-path="url(#wmC)"><path d="${m.landD}" style="fill:color-mix(in oklab, ${sky('sand')} 70%, var(--sim-bg-surface));stroke:${sky('sandDark')};stroke-width:1.5"/><path d="${m.indiaD}" style="fill:${sky('sand')};stroke:${SKY_INK};stroke-width:2"/></g>`;
    const a = m ? m.at : (ll) => [(ll[0] - 64) / 36 * W, H - (ll[1] - 5) / 32 * H];
    const lab = (ll, t, o = {}) => { const [x, y] = a(ll); return tx(x, y, t, { size: 16, col: SKY_INK, halo: sky('cloud'), ...o }); };
    if (step === 0) {
      for (const r of [[[88, 28], [82, 25], [76, 22], [70, 18.5]], [[84, 22.5], [80, 19], [75, 15.5], [71, 12]]]) s += windArrow(r.map(a), { w: 12, col: sky('cloud'), curve: true, flow: true });
      s += lab([78.5, 27.5], 'cold, dry wind', { size: 18 }) + lab([78, 11.5], 'little rain', { size: 17 });
    } else {
      s += windArrow([[93, 23], [90, 18], [86, 15], [82.4, 14]].map(a), { w: 14, col: sky('cloud'), curve: true, flow: true });
      s += windArrow([[92, 17], [88, 12.8], [84, 10.8], [80.6, 10.6]].map(a), { w: 14, col: sky('cloud'), curve: true, flow: true });
      const [cx, cy] = a([80.2, 13.4]);
      s += `<g class="air-in">${svgRain(cx, cy, 1, { w: 60, h: 40, heavy: true })}${svgCloud(cx, cy, port ? 0.5 : 0.7, { seed: 3, kind: 'rain' })}</g>`;
      s += lab([91, 11], 'picks up moisture', { size: 16, col: sky('cloud'), halo: sky('seaDeep') });
      s += lab([78.6, 16.8], 'Andhra Pradesh', { size: 16 }) + lab([78, 9.8], 'Tamil Nadu', { size: 16 });
      s += lab([75.9, 14.3], 'parts of', { size: 15 }) + lab([75.9, 12.9], 'Karnataka', { size: 15 });
    }
    s += m ? creditPlate(W, H) : '';
    return { svg: s };
  }
  _bars(st) {
    const W = st.W, H = st.H, L = 12, R = W - 12, T = 58, B = H - 44, bw = (R - L) / 12, y = (v) => B - v / 38 * (B - T);
    let s = panel(2, 2, W - 4, H - 8) + tx(W / 2, 32, 'Rain in Chennai, cm', { size: 18 });
    CHENNAI.forEach((v, i) => {
      const hi = i === 9 || i === 10;
      s += `<rect class="sv-grow" x="${num(L + i * bw + 2)}" y="${num(y(v))}" width="${num(bw - 4)}" height="${num(B - y(v))}" rx="4" style="fill:${hi ? 'var(--sim-series-2)' : 'var(--sim-series-1)'};stroke:var(--sim-stroke);stroke-width:2;--d:${(i * 0.03).toFixed(2)}s"/>`;
      s += tx(L + (i + 0.5) * bw, B + 22, MO[i], { size: 14, weight: 700 });
      if (hi) s += tx(L + (i + 0.5) * bw, y(v) - 7, v.toFixed(1), { size: st.portrait ? 14 : 16, display: true, weight: 700 });
    });
    return { svg: s };
  }
}
