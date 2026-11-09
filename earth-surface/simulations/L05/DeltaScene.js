// DeltaScene - a river reaching the sea, from above. Years builds a fan of land: the river slows, drops its load,
// splits into distributaries round islands and bars. Stages: 0 slows and drops (Years); 1 the finished fan, named;
// 2 uses; 3 the close, sand carried along the coast by waves. Land only grows on screen: the text says when it would not.
import { SvgScene } from 'simulations/base/kit/SimSvg.js';
import { svgWater, svgGrass, svgSand } from '../shared/EarthArt.js';
import { withEarth, BAR_CSS, world, tag, pointer, ec, strand, arrow, shape, clamp, lerp, INK, WHITE } from '../L04/EarthBits.js';

const MAP = [0, 1, 2].map((idx) => [{ idx, dwellMs: null }]);
const MAP1 = [[{ idx: 3, dwellMs: null }]];
// channel ends along the fan, as angles from straight down, and where each splits off
const CH = [{ a: -52, from: .34 }, { a: -27, from: .5 }, { a: -6, from: .22 }, { a: 20, from: .46 }, { a: 48, from: .3 }];

export class DeltaScene extends withEarth(SvgScene) {
  static BEAT_STEP_MAP = MAP;
  static BEAT_MAPS = { 3: MAP, 1: MAP1 };
  static WIDTH = 620;
  static HEIGHT = 440;
  static PORTRAIT_WIDTH = 340;
  static PORTRAIT_HEIGHT = 500;
  static ARIA_LABEL = 'A river reaching the sea, from above. The water slows and drops its sediment, and new land spreads out in a fan, split by smaller channels called distributaries, with islands and bars between them.';
  static CONTROLS = [];
  css() { return BAR_CSS; }
  stageHeight(st) { return st.portrait ? 380 : 350; }

  enter(stage) {
    this._stage = stage; this._fresh = true; this._y = stage === 0 ? 25 : 100;
    this.bar(stage === 0 ? [{ id: 'y', label: 'Years', min: 0, max: 100, value: this._y }] : []);
  }
  control(id, v) {
    this._y = v;
    if (v >= 100 && !this._cel) { this._cel = true; this.celebrate(); }
    this.repaint();
  }

  paint(st) {
    const W = st.W, H = st.H, s = this._stage, u = this._y / 100, ax = W * .5, ay = H * .36, R = Math.min(H * .58, W * .62) * clamp(.1 + .9 * u);
    const P = (d, r) => { const t = (d * Math.PI) / 180; return [ax + Math.sin(t) * r * 1.25, ay + Math.cos(t) * r]; };
    let b = svgWater([[-10, ay - 10], [W + 10, ay - 10], [W + 10, H + 10], [-10, H + 10]], { t: 3, ripples: 8, deep: .5 });
    // sediment plume in the sea
    b += `<ellipse cx="${ax}" cy="${ay + R * .9}" rx="${R * 1.5 + 40}" ry="${R * .62 + 26}" style="fill:${ec('sandLit')};opacity:.45"/>`;
    // old coast
    const coast = [[-10, -10], [W + 10, -10], [W + 10, ay + 10], [W * .7, ay], [ax, ay - 6], [W * .3, ay], [-10, ay + 10]];
    b += shape(coast, { f: 'grass', s: 'grassDark', w: 3 });
    // fan
    const fan = [[ax - W * .22, ay], ...[-72, -60, -46, -30, -14, 0, 14, 30, 46, 60, 72].map((d, i) => P(d, R * (1 + (i % 2) * .05))), [ax + W * .22, ay]];
    if (u > .02) b += shape(fan, { f: 'grassLit', s: 'sandDark', w: 4 });
    b += svgGrass(W * .08, ay - 22, W * .92, ay - 22, { seed: 2, n: 12, tall: 10 });
    // channels
    const main = [[ax, -10], [ax + 8, ay * .5], [ax - 4, ay - 8], [ax, ay + 4]];
    b += strand(main, 'soilDark', 26) + strand(main, 'sea', 20);
    CH.forEach((c) => {
      if (u < c.from) return;
      const k = clamp((u - c.from) / (1 - c.from) * 1.6), mid = P(c.a * .5, R * .45), end = P(c.a, R * (.3 + .72 * k)), pts = [[ax, ay + 2], mid, end];
      b += strand(pts, 'soilDark', 12) + strand(pts, 'sea', 8);
    });
    // bars at the channel mouths
    if (u > .6) [-40, -16, 8, 34].forEach((d) => { const q = P(d, R * .98); b += svgSand([[q[0] - 16, q[1] - 5], [q[0], q[1] - 11], [q[0] + 16, q[1] - 3], [q[0], q[1] + 7]], { seed: 3 }); });
    b += arrow([[ax + 4, 10], [ax + 6, ay * .55]], { c: WHITE, w: u > .5 ? 3.5 : 6, rim: ec('seaDeep') });
    const pop = this._fresh ? { pop: true } : {};
    if (s === 0) b += tag(W * .24, 34, 'River', pop) + tag(W / 2, H - 26, u > .9 ? 'New land, fan-shaped' : u > .05 ? 'Slow water drops sand and mud' : 'River meets the sea', {});
    if (s === 1) {
      const d = P(-27, R * .66), isl = P(-16, R * .7), e = P(30, R * 1.1);
      b += tag(W * .24, 34, 'River', pop);
      b += pointer(W * .17, ay + 52, d[0], d[1], {}) + tag(W * .17, ay + 44, 'Distributary', { ...pop, delay: .1 });
      b += pointer(W * .82, ay + 70, isl[0] + R * .6, isl[1], {}) + tag(W * .82, ay + 62, 'Islands, bars', { ...pop, delay: .2 });
      b += tag(Math.min(e[0], W - 40), H - 22, 'Sea', { ...pop, delay: .3 });
    }
    if (s === 2) {
      const f = P(-34, R * .5), g = P(32, R * .5);
      for (let i = 0; i < 5; i++) b += `<rect x="${f[0] - 42 + i * 18}" y="${f[1] + (i % 2) * 8}" width="15" height="12" rx="3" style="fill:${ec('grassDark')};opacity:.65"/>`;
      b += tag(f[0] - 8, f[1] - 18, 'Rice, jute', pop) + tag(g[0], g[1] - 16, 'Fishing', { ...pop, delay: .1 }) + tag(W * .24, 34, 'Trade by river', { ...pop, delay: .2 }) + tag(W / 2, H - 24, 'Low land: floods can reach it', { ...pop, delay: .3 });
    }
    if (s === 3) { b += arrow([[W * .08, H - 48], [W * .5, H - 58], [W * .92, H - 44]], { c: ec('sandLit'), w: 8 }) + tag(W / 2, H - 22, 'Waves move the sand along the shore', { size: 14 }); }
    this._fresh = false;
    return { svg: world(st, 'dl', b, { ground: 'grass' }) };
  }
}
