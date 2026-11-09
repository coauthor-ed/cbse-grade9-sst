// MeanderScene - a river across a floodplain seen from above, on a sine-generated line (real bend shape). In every
// bend the fast line hugs the OUTER bank, which is cut steep; the slow INNER bank builds a dotted bar. Years grows the
// bends; at the end the neck is cut, a straight channel opens and the old loop stays as an oxbow lake.
// Stages: 0 speed, 1 banks and growth, 2 neck and oxbow, 3 uses (oxbow already cut).
import { SvgScene } from 'simulations/base/kit/SimSvg.js';
import { svgGrass } from '../shared/EarthArt.js';
import { withEarth, BAR_CSS, world, tag, pointer, ec, strand, arrow, shape, clamp, lerp, INK, WHITE } from '../L04/EarthBits.js';
import { meanderLine, normal, neck, toPath, water, offsetBand, outerSign } from './RiverArt.js';

const MAP = [0, 1, 2, 3].map((idx) => [{ idx, dwellMs: null }]);
const W0 = 1.0, W1 = 2.05;    // bend strength at the start and when the neck nears closing
const CUT = 96;               // Years value at which the neck breaks

export class MeanderScene extends withEarth(SvgScene) {
  static BEAT_STEP_MAP = MAP;
  static WIDTH = 620;
  static HEIGHT = 470;
  static PORTRAIT_WIDTH = 340;
  static PORTRAIT_HEIGHT = 540;
  static ARIA_LABEL = 'A river from above. In each bend the fast water runs along the outer bank and cuts it, and slow water on the inner bank leaves a bar of sediment. The bends grow until the river cuts a neck and leaves an oxbow lake.';
  static CONTROLS = [];
  css() { return BAR_CSS; }
  stageHeight(st) { return st.portrait ? 400 : 370; }

  enter(stage) {
    this._stage = stage; this._fresh = true;
    this._y = stage === 0 ? 40 : stage === 1 ? 30 : stage === 2 ? 80 : 100;
    this.bar(stage === 1 || stage === 2 ? [{ id: 'y', label: 'Years', min: stage === 2 ? 60 : 0, max: stage === 2 ? 100 : 90, value: this._y }] : []);
  }
  control(id, v) {
    this._y = v;
    if (this._stage === 2 && v >= CUT && !this._cel) { this._cel = true; this.celebrate(); }
    this.repaint();
  }

  paint(st) {
    const W = st.W, H = st.H, s = this._stage, y = this._y, P = st.portrait, cut = y >= CUT;
    const w = lerp(W0, W1, clamp(Math.min(y, CUT) / CUT));
    const box = P ? { x: W * .5, y: -14, len: H + 28, cross: W - 74, vertical: true } : { x: -14, y: H * .5, len: W + 28, cross: H - 70, vertical: false };
    const line = meanderLine(box, w, 2);
    let b = '';
    b += svgGrass(0, H * .1, W, H * .1, { seed: 1, n: 16, tall: 10 }) + svgGrass(0, H * .94, W, H * .94, { seed: 4, n: 16, tall: 10 });
    const n = line.length - 1, nk = neck(line), bendsAt = [.25, .5, .75];
    let banks = '', bars = '', fast = '';
    bendsAt.forEach((t, k) => {
      const a = Math.round(n * (t - .1)), z = Math.round(n * (t + .1)), o = outerSign(line, t);
      if (cut && k === 1) return;
      banks += strand(offsetBand(line, a, z, 12, 12, o).slice(0, (z - a) / 3 | 0), 'soilTop', 9);
      bars += shape(offsetBand(line, a, z, 8, 24 + 18 * clamp(y / 90), -o), { f: 'sandLit', s: 'sandDark', w: 1.5 });
      fast += arrow(offsetBand(line, a + 10, z - 10, 6.5, 6.5, o).slice(0, ((z - a - 20) / 3) | 0), { c: WHITE, w: 3.5, rim: ec('seaDeep'), head: 11 });
    });
    let main = toPath(line);
    if (cut) main = [...toPath(line.slice(0, nk.i + 1)), ...toPath(line.slice(nk.j))];
    if (cut) {
      const lake = toPath(line.slice(nk.i + 6, nk.j - 5));
      b += strand(lake, 'soilDark', 20) + strand(lake, 'seaFar', 15);
    }
    b += bars + banks + water(main, 20);
    if (s < 2) b += fast;
    const apex = line[Math.round(n * .75)], nn = normal(apex), so = outerSign(line, .75), ax = nn[0] * so, ay = nn[1] * so, pop = this._fresh ? { pop: true } : {};
    const aOut = [apex[0] + ax * 13, apex[1] + ay * 13], aIn = [apex[0] - ax * 22, apex[1] - ay * 22];
    const apex2 = line[Math.round(n * .5)];
    const clampX = (x) => clamp(x, 70, W - 70), clampY = (v) => clamp(v, 22, H - 22);
    const outTag = P ? [clampX(aOut[0] - 10), clampY(aOut[1] + 62)] : [clampX(aOut[0] + 96), clampY(aOut[1] + (ay > 0 ? 30 : -30))];
    const inTag = P ? [clampX(aIn[0] - ax * 84), aIn[1]] : [aIn[0], clampY(aIn[1] - ay * 70)];
    if (s === 0) {
      b += pointer(outTag[0], outTag[1], aOut[0] - ax * 6, aOut[1] - ay * 6, {}) + tag(outTag[0], outTag[1], 'Fastest water', pop);
      b += pointer(inTag[0], inTag[1], apex[0] - ax * 7, apex[1] - ay * 7, {}) + tag(inTag[0], inTag[1], 'Slow water', { ...pop, delay: .1 });
    }
    if (s === 1) {
      b += pointer(outTag[0], outTag[1], aOut[0], aOut[1], {}) + tag(outTag[0], outTag[1], 'Steep bank', pop);
      b += pointer(inTag[0], inTag[1], aIn[0], aIn[1], {}) + tag(inTag[0], inTag[1], 'Bar', { ...pop, delay: .1 });
    }
    if (s === 2) {
      const q = line[nk.i], r = line[nk.j], mx = (q[0] + r[0]) / 2, my = (q[1] + r[1]) / 2;
      if (cut) { const a = [clampX(apex2[0] + 0), clampY(apex2[1] + 0)]; b += tag(a[0], a[1], 'Oxbow lake', { pop: true }); b += tag(clampX(mx + (P ? 40 : 0)), clampY(my + (P ? 0 : 56)), 'River took the short way', { size: 14 }); }
      else { const lx = P ? clampX(mx + 86) : mx, ly = P ? my : clampY(my + 74); b += pointer(lx, ly, mx, my, {}) + tag(lx, ly, 'Neck', pop); }
    }
    if (s === 3) {
      const x = clampX(inTag[0]), yy = clampY(inTag[1] - 8);
      for (const [dx, dy] of [[-30, -6], [0, 12], [26, -10]]) b += `<g transform="translate(${x + dx} ${yy + dy - 16})"><rect x="-10" y="-14" width="20" height="16" style="fill:${ec('sandLit')};stroke:${INK};stroke-width:2"/><path d="M-13 -14L0 -25L13 -14Z" style="fill:${ec('bark')};stroke:${INK};stroke-width:2"/></g>`;
      b += tag(x, yy + 26, 'Village, fertile fields', pop);
      b += tag(clampX(apex2[0]), clampY(apex2[1]), 'Oxbow lake', { ...pop, delay: .1 });
    }
    this._fresh = false;
    return { svg: world(st, 'mn', b, { ground: 'grass' }) };
  }
}
