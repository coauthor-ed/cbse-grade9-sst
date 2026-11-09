// SpitGrowScene - a coast from above after the book's beach figure: land at the left, sea at the right, a beach in the
// upper bay, a small headland mid-coast, sand in the lower bay, and a tongue of land ending in a free end, with a river
// behind it. Waves arrive at an angle; swash runs up at that angle, backwash straight down the slope, so a grain zigzags
// along the shore. Stages: 0 bay and headland; 1 Send waves; 2 sand bar and free end.
import { SvgScene } from 'simulations/base/kit/SimSvg.js';
import { svgGrass, svgTree } from '../shared/EarthArt.js';
import { withEarth, BAR_CSS, world, tag, pointer, ec, strand, arrow, shape, plate, words, lerp, INK, WHITE } from '../L04/EarthBits.js';

const MAP = [0, 1, 2].map((idx) => [{ idx, dwellMs: null }]);

export class SpitGrowScene extends withEarth(SvgScene) {
  static BEAT_STEP_MAP = MAP;
  static WIDTH = 560;
  static HEIGHT = 490;
  static PORTRAIT_WIDTH = 340;
  static PORTRAIT_HEIGHT = 500;
  static ARIA_LABEL = 'A coast from above. A headland stands between two bays. Waves reach the shore at an angle and sand zigzags along it. A long tongue of sand ends in a free end, with a river behind it.';
  static CONTROLS = [];
  css() { return BAR_CSS; }
  stageHeight(st) { return st.portrait ? 410 : 390; }

  enter(stage) {
    this._stage = stage; this._g = stage === 2 ? 1 : .3; this._z = 0; this._fresh = true; this.stopTween();
    this.bar(stage === 1 ? [{ id: 'go', label: 'Send waves', go: true }] : []);
  }
  control() {
    if (this._tw) return;
    const g0 = this._g, g1 = Math.min(1, g0 + .35);
    this.tween(0, 1, 3, (v) => { this._z = v; this._g = lerp(g0, g1, v); }, () => {
      this._z = 0;
      if (this._g >= 1) { this.bar([{ id: 'go', label: 'Send waves', off: true }]); if (!this._cel) { this._cel = true; this.celebrate(); this.repaint(); } }
    });
  }

  paint(st) {
    const W = st.W, H = st.H, X = (u) => u * W, Y = (v) => v * H, s = this._stage, g = this._g;
    const tip = [lerp(.3, .64, g), lerp(.74, .86, g)];
    const coast = [[-.02, -.02], [.34, -.02], [.27, .1], [.25, .22], [.31, .33], [.46, .42], [.5, .45], [.42, .49], [.3, .54], [.23, .62], [.22, .7], [.27, .76], [tip[0] - .02, tip[1] - .01], [tip[0], tip[1] + .01], [tip[0] - .05, tip[1] + .03], [.2, .84], [-.02, .84]];
    let b = shape(coast.map(([u, v]) => [X(u), Y(v)]), { f: 'grassLit', s: 'sandDark', w: 3 });
    // beach in the upper bay
    b += strand([[X(.33), Y(.02)], [X(.285), Y(.1)], [X(.265), Y(.22)], [X(.32), Y(.32)]], 'sandLit', 16);
    // sand bar along the lower bay and on along the tongue
    const bar = [[X(.41), Y(.5)], [X(.31), Y(.55)], [X(.245), Y(.62)], [X(.24), Y(.7)], [X(.28), Y(.755)], [X(tip[0] - .03), Y(tip[1] - .002)]];
    b += strand(bar, 'sandDark', 19) + strand(bar, 'sandLit', 15);
    for (let i = 0; i < 12; i++) { const u = i / 11, q = bar[Math.min(4, Math.floor(u * 5))]; b += `<circle cx="${q[0] + (i % 3) * 9 - 8}" cy="${q[1] + (i % 4) * 5 - 6}" r="1.8" style="fill:${ec('soilDark')}"/>`; }
    // land south of the river
    b += shape([[X(-.02), Y(.93)], [X(.3), Y(.93)], [X(.56), Y(.97)], [X(.74), Y(1.02)], [X(-.02), Y(1.02)]], { f: 'grassLit', s: 'sandDark', w: 3 });
    const river = [[X(-.02), Y(.885)], [X(.2), Y(.885)], [X(.42), Y(.92)], [X(.62), Y(.93)], [X(.8), Y(.95)]];
    b += strand(river, 'sea', 26);
    b += svgGrass(X(.02), Y(.44), X(.2), Y(.44), { seed: 3, n: 7 }) + svgTree(X(.1), Y(.3), .7, { kind: 'palm', seed: 3 }) + svgTree(X(.1), Y(.68), .6, { kind: 'round', seed: 4 });
    // waves at an angle
    const ang = [[X(.98), Y(.22)], [X(.72), Y(.5)]];
    b += arrow(ang, { c: WHITE, w: 7, rim: ec('seaDeep') }) + arrow([[X(.98), Y(.04)], [X(.76), Y(.26)]], { c: WHITE, w: 5, rim: ec('seaDeep') });
    if (s > 0) {
      // zigzag down the shore of the lower bay: up at the wave's angle, back straight out
      const zz = [[.45, .48], [.34, .535], [.33, .595], [.255, .64], [.3, .68], [.25, .72], [.34, .75], [.31, .775]].map(([u, v]) => [X(u), Y(v)]);
      b += `<path d="M${zz.map((q) => q.map((c) => c.toFixed(1)).join(' ')).join('L')}" style="fill:none;stroke:${INK};stroke-width:3;stroke-dasharray:5 6;stroke-linejoin:round"/>`;
    }
    if (s === 1) {
      // a close-up of the shore: swash up at the wave's angle, backwash straight out, so the grain steps along
      const w = st.portrait ? 172 : 200, h = 150, ix = W - w - 8, iy = H - h - 8, sx = ix + 44, ox = ix + w - 22, n = 3, dy = (h - 44) / n, q = [];
      b += plate(ix, iy, w, h, { fill: ec('sea') });
      b += `<rect x="${ix + 2}" y="${iy + 2}" width="52" height="${h - 4}" rx="10" style="fill:${ec('sandLit')}"/>`;
      for (let i = 0; i <= n; i++) { const y = iy + 30 + i * dy; q.push([ox, y - dy * .0]); if (i < n) q.push([sx, y + dy]); }
      for (let i = 0; i < q.length - 1; i++) {
        const swash = i % 2 === 0;
        b += arrow([q[i], q[i + 1]], { c: swash ? WHITE : ec('sandLit'), w: swash ? 4 : 3, rim: ec('seaDeep'), head: 10 });
      }
      const f = this._z * (q.length - 1), i = Math.min(q.length - 2, Math.floor(f)), g = [lerp(q[i][0], q[i + 1][0], f - i), lerp(q[i][1], q[i + 1][1], f - i)];
      b += `<circle cx="${g[0]}" cy="${g[1]}" r="8" style="fill:${ec('sandDark')};stroke:${INK};stroke-width:3"/>`;
      b += words(ix + w / 2, iy + 18, 'Swash, then backwash', { size: 14, anchor: 'middle' });
    }
    const p = this._fresh ? { pop: true } : {};
    b += tag(X(.64), Y(.16), 'Sea', { ...p, fill: ec('seaDeep') });
    if (s === 0) {
      b += pointer(X(.64), Y(.42), X(.48), Y(.435), {}) + tag(X(.72), Y(.42), 'Headland', { ...p, delay: .1 }) + tag(X(.42), Y(.16), 'Bay', { ...p, delay: .2, fill: ec('seaDeep') }) + pointer(X(.13), Y(.14), X(.27), Y(.14), {}) + tag(X(.14), Y(.14), 'Beach', { ...p, delay: .3 });
    }
    if (s === 1) b += tag(X(.7), Y(.46), 'Waves at an angle', { ...p, size: 14 });
    if (s === 2) {
      b += pointer(X(.72), Y(.62), X(.33), Y(.55), {}) + tag(X(.76), Y(.62), 'Sand bar', { ...p, delay: .1 });
      b += pointer(X(.8), Y(.77), X(tip[0]), Y(tip[1]), {}) + tag(X(.8), Y(.75), 'Free end', { ...p, delay: .2 });
      b += tag(X(.16), Y(.885), 'River', { ...p, delay: .3, fill: ec('seaDeep') });
    }
    this._fresh = false;
    return { svg: world(st, 'sg', b, { ground: 'sea' }) };
  }
}
