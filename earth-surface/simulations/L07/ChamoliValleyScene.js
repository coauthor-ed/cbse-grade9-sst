// ChamoliValleyScene - a drawn valley in side view, with no people. It is a drawing of the sequence, not a map, and says
// so. Stages: 0 before, a high ridge with rock and ice over a valley with a hydel project and a bridge; 1 the mass breaks
// off and falls; 2 ice, rock and water rush down the valley. There is no lake anywhere in the drawing.
import { SvgScene } from 'simulations/base/kit/SimSvg.js';
import { svgRock, svgSnow, svgBoulder, roughen } from '../shared/EarthArt.js';
import { oval } from './IceArt.js';
import { withEarth, BAR_CSS, world, tag, pointer, ec, strand, shape, clamp, lerp, INK } from '../L04/EarthBits.js';

const MAP = [0, 1, 2].map((idx) => [{ idx, dwellMs: null }]);

export class ChamoliValleyScene extends withEarth(SvgScene) {
  static BEAT_STEP_MAP = MAP;
  static WIDTH = 620;
  static HEIGHT = 400;
  static PORTRAIT_WIDTH = 340;
  static PORTRAIT_HEIGHT = 480;
  static ARIA_LABEL = 'A drawing of a mountain valley in side view. A mass of rock and glacier ice breaks off a high ridge and falls. Ice, rock and water then rush down the valley towards a hydel project and a bridge.';
  static CONTROLS = [];
  css() { return BAR_CSS; }
  stageHeight(st) { return st.portrait ? 370 : 340; }
  enter(stage) {
    this._stage = stage; this._f = stage === 2 ? 1 : 0; this._r = 0; this._fresh = true; this.stopTween();
    if (stage === 1) this.after(.2, () => this.tween(0, 1, 1.8, (v) => { this._f = v; }));
    if (stage === 2) this.after(.2, () => this.tween(0, 1, 2.2, (v) => { this._r = v; }));
  }
  paint(st) {
    const W = st.W, H = st.H, s = this._stage, X = (u) => u * W, Y = (v) => v * H, P = (a) => a.map(([u, v]) => [X(u), Y(v)]), f = this._f, r = this._r;
    const slope = [[-.02, .06], [.12, .08], [.2, .2], [.34, .5], [.46, .68], [.62, .76], [.8, .8], [1.02, .84]];
    let b = svgRock([...P(slope), [X(1.02), H + 10], [X(-.02), H + 10]], { seed: 7, fill: 'rock', cracks: 7, grain: true, outline: true, lit: true });
    b += svgSnow(P([[-.02, .06], [.12, .08], [.2, .2], [.1, .2], [-.02, .17]]), { seed: 3 });
    const riv = P([[.42, .66], [.62, .77], [.8, .81], [1.02, .85]]);
    b += strand(riv, 'seaDeep', 11) + strand(riv, 'sea', 7);
    // hydel project and bridge, generic
    const hx = X(.62), hy = Y(.75), bx = X(.84), by = Y(.8);
    b += `<rect x="${hx - 28}" y="${hy - 34}" width="56" height="34" style="fill:${ec('snowShade')};stroke:${INK};stroke-width:2.5"/><rect x="${hx - 34}" y="${hy - 12}" width="68" height="14" style="fill:${ec('slate')};stroke:${INK};stroke-width:2.5"/>`;
    b += `<path d="M${bx - 34} ${by - 16}H${bx + 34}" style="stroke:${INK};stroke-width:6"/><path d="M${bx - 24} ${by - 16}V${by + 6}M${bx + 24} ${by - 16}V${by + 6}" style="stroke:${INK};stroke-width:4"/>`;
    // the mass: on the ridge, then falling down the slope
    const k = f, ax = lerp(.13, .4, k * k), ay = lerp(.14, .62, k * k), sp = 1 - clamp((k - .8) / .2) * .4;
    if (s < 2) {
      const cx = X(ax), cy = Y(ay), rx = X(.08) * sp, ry = Y(.075) * sp;
      b += svgRock(roughen(oval(cx, cy, rx, ry, 12), { seed: 4, amp: 5, step: 18 }), { seed: 5, fill: 'rockLit', cracks: 3, outline: true });
      b += shape(oval(cx - rx * .25, cy - ry * .3, rx * .6, ry * .55, 10), { f: 'iceBody', s: 'iceCrack', w: 2 });
      if (k > .3) for (let i = 0; i < 6; i++) b += svgBoulder(lerp(X(.16), cx, (i + 1) / 7) + (i % 2) * 8, lerp(Y(.2), cy, (i + 1) / 7) + 6, .2, { seed: i + 2 });
    }
    if (f > 0 || s === 2) b += shape(P([[.08, .1], [.2, .11], [.2, .2], [.12, .17]]), { f: 'rockDeep', curve: false });
    if (s === 2) {
      // the flood follows the slope and then the river, deep at the front and ragged on top
      const h = lerp(.3, 1.04, r), line = [[.22, .24], [.34, .52], [.46, .69], [.62, .77], [.8, .81], [1.04, .85]], top = [], low = [];
      for (let i = 0; i <= 26; i++) {
        const u = lerp(.22, h, i / 26);
        let j = 1; while (j < line.length - 1 && line[j][0] < u) j += 1;
        const t = (u - line[j - 1][0]) / (line[j][0] - line[j - 1][0]), y = lerp(line[j - 1][1], line[j][1], t), th = 8 + 26 * Math.sin(Math.min(1, i / 22) * Math.PI / 2);
        top.push([X(u), Y(y) - th - (i % 3) * 3]); low.push([X(u), Y(y) + 7]);
      }
      b += shape([...top, ...low.reverse()], { f: 'soil', s: 'soilDark', w: 3, curve: false });
      for (let i = 3; i < top.length - 1; i += 3) b += svgBoulder(top[i][0], top[i][1] + 16, .26, { seed: i }) + `<circle cx="${top[i][0] + 12}" cy="${top[i][1] + 8}" r="6" style="fill:${ec('iceBody')};stroke:${ec('iceCrack')};stroke-width:1.5"/>`;
    }
    const p = this._fresh ? { pop: true } : {};
    b += tag(W - 8, 22, 'A drawing, not a map', { size: 14, anchor: 'end' });
    if (s === 0) b += pointer(X(.42), Y(.3), X(.15), Y(.15), {}) + tag(X(.52), Y(.3), 'High ridge: rock and ice', { ...p, size: 14 }) + tag(X(.76), Y(.56), 'Hydel project', { ...p, delay: .1, size: 14 }) + tag(X(.82), Y(.94), 'Bridge', { ...p, delay: .2, size: 14 });
    if (s === 1) b += tag(X(.62), Y(.34), 'Rock and ice broke off', p);
    if (s === 2) b += tag(X(.57), Y(.34), 'Ice, rock and water rush down', { ...p, size: 14 }) + tag(X(.72), Y(.45), 'No lake burst', { ...p, delay: .2, size: 14 });
    this._fresh = false;
    return { svg: world(st, 'cv', b) };
  }
}
