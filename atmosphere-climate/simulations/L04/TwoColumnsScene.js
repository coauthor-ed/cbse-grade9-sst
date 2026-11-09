// TwoColumnsScene - blk-l04-s10. The lesson's close: the coast again, then the same two surfaces at
// the size of a country, on the true map, with the question left open: no wind arrows on India.
import { SvgScene } from 'simulations/base/kit/SimSvg.js';
import { AIR_CSS, tx, panel, skyTx, skyRect, sky, SKY_INK, windArrow, loadGeo, indiaMap, creditPlate, svgLand, svgSea, svgSun } from '../L03/AirDraw.js';

const MAP = [[{ idx: 0, dwellMs: null }], [{ idx: 1, dwellMs: null }]];
export class TwoColumnsScene extends SvgScene {
  static BEAT_STEP_MAP = MAP;
  static ARIA_LABEL = 'A coast with a sea breeze, then a map of India and the Indian Ocean with a question: will the same thing happen at the size of a country?';
  static CONTROLS = [];
  css() { return AIR_CSS; }
  stageHeight(st) { return st.portrait ? 440 : 420; }
  async setup() { await super.setup(); this._g = await loadGeo(); this.repaint(); }
  paint(st) {
    const W = st.W, H = st.H;
    if (this.stepIndex === 0) {
      const g = H - 96;
      let s = skyRect('tcSky', 0, 0, W, H, 0, 6, { r: 18 }) + svgSun(58, 56, 0.65, {});
      s += svgLand(0, g, 1, { w: W * 0.52, h: H - g, kind: 'sand', seed: 4 }) + svgSea(W * 0.48, g + 8, 1, { w: W * 0.52, h: H - g - 8, t: 0 });
      s += windArrow([[W * 0.9, g - 28], [W * 0.14, g - 28]], { w: 16, col: sky('cloud'), flow: true });
      s += skyTx(W / 2, g - 58, 'one coast, one day', { size: 21 });
      return { svg: s };
    }
    const box = { x: 0, y: 0, w: W, h: H };
    const m = indiaMap(this._g, box, [[56, 0], [100, 37]]);
    let s = `<rect width="${W}" height="${H}" rx="18" style="fill:${sky('sea')}"/>`;
    if (m) s += `<clipPath id="tcC"><rect width="${W}" height="${H}" rx="18"/></clipPath><g clip-path="url(#tcC)"><path d="${m.landD}" style="fill:${sky('sand')};stroke:${sky('sandDark')};stroke-width:1.5"/><path d="${m.indiaD}" style="fill:color-mix(in oklab, ${sky('sand')} 62%, var(--sim-series-2));stroke:${SKY_INK};stroke-width:2"/></g>`;
    const at = m ? m.at : () => [W / 2, H / 2];
    const [a, b] = at([79, 22]), [c, d] = at([74, 6]);
    s += tx(a, b, 'Land', { size: 22, display: true, weight: 700, col: SKY_INK, halo: sky('cloud') });
    s += tx(c, d, 'Indian Ocean', { size: 20, display: true, weight: 700, col: sky('cloud'), halo: sky('seaDeep') });
    s += panel((W - 250) / 2, 10, 250, 40) + tx(W / 2, 37, 'one country, one year?', { size: 20, display: true, weight: 700 });
    s += m ? creditPlate(W, H) : '';
    return { svg: s };
  }
}
