// WeatheringBenchScene - rock changing where it stands, then one grain that moves.
// Stages: 0 physical, boulder; 1 chemical, carved stone; 2 biological, root in a wall; 3 soil profile;
// 4 predict tiles; 5 the stream carries pebbles; 6 drag a grain from the rock to the stream.
// Claims in the drawing: in stages 0 to 3 nothing leaves the spot; only stage 5 and 6 show travel.
import { SvgScene } from 'simulations/base/kit/SimSvg.js';
import { svgRock, svgSoil, svgWater, svgGrass, svgTree, svgBoulder, svgSand, roughen } from '../shared/EarthArt.js';
import { svgCloud, svgSun } from '../shared/SkyArt.js';
import { withEarth, BAR_CSS, world, tag, pointer, words, ec, strand, arrow, plate, clamp, lerp, WHITE, INK } from './EarthBits.js';

const MAP = [0, 1, 2, 3].map((idx) => [{ idx, dwellMs: null }]);
const MAP1 = [[{ idx: 4, dwellMs: null }]];
const MAP2 = [5, 6].map((idx) => [{ idx, dwellMs: null }]);
const PRESSES = 3;

// boulder, foot centre at 0,0, crack down the middle
const CRACK = [[6, -152], [-8, -120], [10, -88], [-6, -54], [8, -24], [0, 0]];
const LEFT = [[0, 0], [-104, 0], [-146, -26], [-158, -78], [-122, -128], [-54, -156], [6, -152], ...CRACK.slice(1, -1)];
const RIGHT = [[0, 0], ...CRACK.slice(1, -1).reverse(), [6, -152], [66, -150], [120, -116], [146, -66], [128, -20], [96, 0]];

function boulder(g, night) {
  const a = 8 * g, dx = 46 * g;
  const L = svgRock(LEFT, { seed: 3, fill: 'rock', cracks: 3, grain: true, outline: true, lit: true });
  const R = svgRock(RIGHT, { seed: 5, fill: 'rock', cracks: 3, grain: true, outline: true, lit: true });
  const ice = night > 0.05 ? `<path d="M${CRACK.map((p) => p.join(' ')).join('L')}" style="fill:none;stroke:${ec('iceLit')};stroke-width:${5 + 8 * g};stroke-linecap:round;opacity:${night}"/>` : '';
  const dark = strand(CRACK, 'rockDeep', 3 + 4 * g);
  return `<g transform="translate(${-dx} 0) rotate(${-a})">${L}</g><g transform="translate(${dx} 0) rotate(${a})">${R}</g>`
    + (g < 0.98 ? dark : '') + ice;
}

function carving(w, s = 1) {
  const a = 1 - 0.78 * w, sw = 4 + 3 * w;
  const out = [[-104, 0], [-104, -214], [-82, -250], [82, -250], [104, -214], [104, 0]];
  let b = svgRock(out, { seed: 9, fill: 'rock', cracks: 1, outline: true, lit: true, grain: true });
  const cy = -150;
  let pet = '';
  for (let i = 0; i < 8; i++) {
    const t = (i * Math.PI) / 4, x = Math.cos(t) * 38, y = Math.sin(t) * 38;
    pet += `<ellipse cx="${x.toFixed(1)}" cy="${(cy + y).toFixed(1)}" rx="28" ry="12" transform="rotate(${(i * 45).toFixed(0)} ${x.toFixed(1)} ${(cy + y).toFixed(1)})" style="fill:${ec('rockDark')};fill-opacity:${(a * 0.5).toFixed(2)};stroke:${ec('rockDeep')};stroke-width:${sw};stroke-opacity:${a.toFixed(2)}"/>`;
  }
  b += pet + `<circle cx="0" cy="${cy}" r="${16 + 5 * w}" style="fill:${ec('rockDark')};stroke:${ec('rockDeep')};stroke-width:${sw};opacity:${a}"/>`;
  b += `<rect x="-84" y="-232" width="168" height="170" rx="${6 + 26 * w}" style="fill:none;stroke:${ec('rockDeep')};stroke-width:${sw};opacity:${a}"/>`;
  for (let i = 0; i < 7; i++) b += `<path d="M${-72 + i * 24} -44l10 -14l10 14z" style="fill:${ec('rockDeep')};opacity:${a}"/>`;
  for (let i = 0; i < 3; i++) b += `<ellipse cx="${-60 + i * 56}" cy="${-22 + (i % 2) * 8}" rx="${26 * w}" ry="${8 * w}" style="fill:${ec('sandLit')};opacity:${0.75 * w}"/>`;
  return `<g transform="scale(${s})">${b}</g>`;
}

function wall(g, W, gy, sz = 1, rooted = true) {
  const bw = 96 * sz, bh = 50 * sz, rows = 4, cols = Math.ceil(W / bw) + 2, midX = W / 2;
  let out = '';
  for (let r = 0; r < rows; r++) for (let c = -1; c < cols; c++) {
    const x = c * bw + (r % 2 ? bw / 2 : 0) - 10, y = gy - (r + 1) * bh, cx = x + bw / 2, side = cx < midX ? -1 : 1;
    const near = Math.max(0, 1 - Math.abs(cx - midX) / (bw * 1.3));
    const dx = side * 20 * sz * g * near, rot = side * 6 * g * near;
    const q = [[x + 2, y + 2], [x + bw - 2, y + 2], [x + bw - 2, y + bh - 2], [x + 2, y + bh - 2]];
    out += `<g transform="translate(${dx.toFixed(1)} 0) rotate(${rot.toFixed(1)} ${cx.toFixed(1)} ${(y + bh / 2).toFixed(1)})">${svgRock(roughen(q, { seed: r * 7 + c + 11, amp: 2, step: 26 }), { seed: r + c + 2, fill: (r + c) % 2 ? 'rock' : 'rockLit', outline: true })}</g>`;
  }
  const top = gy - rows * bh;
  if (!rooted) return { svg: out, top };
  const root = [[midX, top + 2], [midX + 6, top + bh * 0.9], [midX - 7, top + bh * 1.8], [midX + 5, top + bh * 2.7], [midX - 3, top + bh * (1 + 2.9 * clamp(g + 0.08))]];
  const n = Math.max(2, Math.round(2 + g * 3));
  out += strand(root.slice(0, n), 'barkDark', (7 + 13 * g) * sz) + strand(root.slice(0, n), 'bark', (4 + 11 * g) * sz);
  if (g > 0.4) out += strand([[midX + 4, top + bh], [midX + 36 * sz, top + bh * 1.5], [midX + 60 * sz, top + bh * 1.6]], 'bark', 5 * g * sz);
  out += svgTree(midX, top + 4, (0.42 + 1.05 * g) * sz, { kind: 'round', seed: 4 });
  return { svg: out, top };
}

function hill(st) {
  const W = st.W, H = st.H, y0 = H * 0.3, foot = H * 0.84;
  const land = [[-10, y0], [W * 0.28, y0 - 6], [W * 0.46, H * 0.52], [W * 0.74, foot - 4], [W + 10, foot - 4], [W + 10, H + 10], [-10, H + 10]];
  const path = [[W * 0.2, y0 - 62], [W * 0.31, y0 + 6], [W * 0.46, H * 0.5], [W * 0.62, H * 0.68], [W * 0.74, foot - 6], [W * 0.84, foot + 8], [W * 0.97, foot + 12]];
  return { land, path, y0, foot };
}
const along = (p, u) => {
  const n = p.length - 1, f = clamp(u) * n, i = Math.min(n - 1, Math.floor(f)), k = f - i;
  return [lerp(p[i][0], p[i + 1][0], k), lerp(p[i][1], p[i + 1][1], k)];
};
const LEAVE = 1 / 6;       // the grain has left the rock
const WET = 4 / 6;         // the grain is in the stream

export class WeatheringBenchScene extends withEarth(SvgScene) {
  static BEAT_STEP_MAP = MAP;
  static BEAT_MAPS = { 4: MAP, 1: MAP1, 2: MAP2 };
  static WIDTH = 600;
  static HEIGHT = 470;
  static PORTRAIT_WIDTH = 340;
  static PORTRAIT_HEIGHT = 560;
  static ARIA_LABEL = 'Rock breaking down where it stands: a boulder split by heat, cold and frost, a stone carving softened by rain, a wall pushed apart by a root. Then one grain leaves the rock and is carried by a stream.';
  static CONTROLS = [];

  css() { return BAR_CSS; }
  stageHeight(st) { return st.portrait ? 390 : 340; }

  enter(stage) {
    this._stage = stage; this._n = 0; this._u = 0; this._night = 0; this._day = 0; this._rain = 0; this._g = 0; this._grain = 0; this._found = false; this.stopTween();
    this._fresh = true;
    this._syncBar();
    if (stage === 5) this.after(0.2, () => this._carry());
  }

  _syncBar() {
    const s = this._stage, done = this._n >= PRESSES, busy = !!this._tw;
    const one = (id, label) => (done ? [{ id: 'again', label: 'Start again' }] : [{ id, label, go: true, off: busy }]);
    if (s === 0) this.bar(one('day', 'Day and night'));
    else if (s === 1) this.bar(one('rain', 'Rain'));
    else if (s === 2) this.bar(one('grow', 'Grow'));
    else if (s === 5) this.bar([{ id: 'carry', label: 'Watch again', off: busy }]);
    else if (s === 6) this.bar([{ id: 'nudge', label: 'Move the grain', off: this._grain >= 1 }]);
    else this.bar([]);
  }

  _carry() { this.tween(0, 1, 3.2, (v) => { this._u = v; }, () => this._syncBar()); this._syncBar(); }

  control(id) {
    if (this._tw && id !== 'nudge') return;
    if (id === 'again') { this._n = 0; this._g = 0; this._syncBar(); this.repaint(); return; }
    if (id === 'carry') { this._carry(); return; }
    if (id === 'nudge') { this._setGrain(Math.min(1, this._grain + 0.17)); this._syncBar(); this.repaint(); return; }
    const g0 = this._n / PRESSES, g1 = (this._n + 1) / PRESSES;
    this.tween(0, 1, 1.8, (v) => {
      if (id === 'day') { this._day = v; this._night = clamp((v - 0.42) / 0.2) * (1 - clamp((v - 0.86) / 0.14)); this._g = lerp(g0, g1, clamp((v - 0.55) / 0.3)); }
      else { this._rain = Math.sin(Math.PI * v); this._g = lerp(g0, g1, v); }
    }, () => {
      this._n += 1; this._day = 0; this._rain = 0; this._syncBar();
      if (this._n >= PRESSES) { const st = this.sv; this.after(0.05, () => { this.celebrate(st.W / 2, st.H * 0.55); this.repaint(); }); }
    });
    this._syncBar();
  }

  _setGrain(u) {
    this._grain = u;
    if (u >= 1 && !this._found) { this._found = true; const q = along(hill(this.sv).path, 1); this.celebrate(q[0], q[1]); }
  }

  pointerDown(p) {
    if (this._stage !== 6) return false;
    const q = along(hill(this.sv).path, this._grain);
    if (Math.hypot(p.x - q[0], p.y - q[1]) > 42) return false;
    return true;
  }
  pointerMove(p) {
    const h = hill(this.sv);
    let best = this._grain, d = 1e9;
    for (let i = 0; i <= 60; i++) { const q = along(h.path, i / 60), e = Math.hypot(q[0] - p.x, q[1] - p.y); if (e < d) { d = e; best = i / 60; } }
    this._setGrain(best);
    return true;
  }
  pointerUp() { this._syncBar(); }

  _sky(st, night, day) {
    const W = st.W, t = day * Math.PI;
    let b = `<rect width="${W}" height="${st.H}" style="fill:${ec('seaDeep')};opacity:${0.72 * night}"/>`;
    const sx = lerp(W * 0.14, W * 0.86, day), sy = 66 - Math.sin(t) * 26;
    if (night < 0.5) b += svgSun(sx, sy, 0.5);
    else b += `<circle cx="${W * 0.8}" cy="60" r="22" style="fill:${ec('snow')}"/><circle cx="${W * 0.8 + 9}" cy="54" r="18" style="fill:${ec('seaDeep')};opacity:0.9"/>`;
    return b;
  }

  _physical(st) {
    const W = st.W, H = st.H, gy = H * 0.86, s = st.portrait ? 0.92 : 1, g = this._g, night = this._night;
    let b = this._sky(st, night, this._day || 0.3);
    b += svgSand([[-10, gy], [W + 10, gy - 6], [W + 10, H + 10], [-10, H + 10]], { seed: 3, ripples: true });
    b += `<ellipse cx="${W / 2}" cy="${gy + 8}" rx="${190 * s + 50 * g}" ry="14" style="fill:${ec('sandDark')};opacity:0.7"/>`;
    b += `<g transform="translate(${W / 2} ${gy + 8}) scale(${s})">${boulder(g, night)}</g>`;
    if (g > 0.6) b += `<g style="opacity:${(g - 0.6) * 2.5}">${svgBoulder(W / 2 - 8, gy + 18, 0.5, { seed: 3 })}</g>`;
    const hot = this._tw && night < 0.2 && this._day < 0.45, lit = this._fresh ? { pop: true } : {};
    if (this._tw) b += tag(W / 2, 28, hot ? 'Hot by day: rock swells' : night > 0.4 ? 'Night: water in the crack freezes' : 'Cold rock shrinks', { size: 15 });
    else if (g >= 0.99) b += tag(W / 2, 28, 'Split, and the pieces stay here', { ...lit });
    else b += pointer(W / 2 + 92, 46, W / 2 + 6, gy - 118 * s, {}) + tag(W / 2 + 92, 34, this._n ? 'Crack is wider' : 'A crack', lit);
    this._fresh = false;
    return b;
  }

  _chemical(st) {
    const W = st.W, H = st.H, gy = H * 0.86, s = st.portrait ? 1.05 : 0.98, w = this._g;
    let b = svgCloud(W * 0.2, 56, 0.72, { seed: 4, kind: 'rain' }) + svgCloud(W * 0.8, 44, 0.62, { seed: 7, kind: 'rain' });
    b += svgGrass(0, gy, W, gy, { seed: 2, n: 22, tall: 16 });
    b += svgSoil([[-10, gy], [W + 10, gy], [W + 10, H + 10], [-10, H + 10]], { seed: 5, stones: 4, top: 12 });
    b += `<g transform="translate(${W / 2} ${gy + 6})">${carving(w, s)}</g>`;
    if (this._rain > 0.02) {
      let r = '';
      for (let i = 0; i < 26; i++) { const x = (i * 37) % W, y = 72 + ((i * 53) % (gy - 90)); r += `<path d="M${x} ${y}l-7 22" style="stroke:${ec('sea')};stroke-width:3.5;stroke-linecap:round;fill:none;opacity:${(this._rain * 0.9).toFixed(2)}"/>`; }
      b += r;
    }
    const lit = this._fresh ? { pop: true } : {};
    const txt = w >= 0.99 ? 'Soft and rounded' : w > 0 ? 'Edges rounding off' : 'Sharp carved lines';
    b += tag(W / 2, 24, txt, lit);
    if (w > 0.3) b += pointer(W * (st.portrait ? 0.19 : 0.27), H * 0.76, W / 2 - 70 * s, gy - 24, {}) + tag(W * (st.portrait ? 0.2 : 0.2), H * 0.72, 'New substance', {});
    this._fresh = false;
    return b;
  }

  _bio(st) {
    const W = st.W, H = st.H, gy = H * 0.9, sz = st.portrait ? 0.86 : 1, g = this._g;
    const w = wall(g, W, gy, sz);
    let b = svgSoil([[-10, gy], [W + 10, gy], [W + 10, H + 10], [-10, H + 10]], { seed: 4, stones: 2, top: 8 }) + w.svg;
    b = svgCloud(W * 0.16, 46, 0.6, { seed: 2 }) + b;
    const lit = this._fresh ? { pop: true } : {};
    b += tag(W - 96, 34, g >= 0.99 ? 'Stones pushed apart' : g > 0 ? 'Root thickens' : 'Seed in a crack', lit);
    this._fresh = false;
    return b;
  }

  _soil(st) {
    const W = st.W, H = st.H, y1 = H * 0.3, y2 = H * 0.46, y3 = H * 0.72;
    let b = svgRock([[-10, y3], [W + 10, y3 + 6], [W + 10, H + 10], [-10, H + 10]], { seed: 6, fill: 'rock', cracks: 7, outline: true, grain: true });
    b += svgSoil([[-10, y2], [W + 10, y2], [W + 10, y3 + 8], [-10, y3 + 4]], { seed: 8, stones: 0 });
    for (let i = 0; i < 11; i++) b += svgBoulder(14 + (i * W) / 10.5, y3 + 6 - (i % 3) * 14, 0.62 + (i % 2) * 0.26, { seed: i + 3 });
    b += svgSoil([[-10, y1], [W + 10, y1], [W + 10, y2 + 6], [-10, y2 + 6]], { seed: 3, stones: 7, top: y2 - y1 - 18 });
    b += svgGrass(0, y1, W, y1, { seed: 3, n: 26, tall: 18 }) + svgTree(W * 0.82, y1 + 3, 0.86, { kind: 'round', seed: 3 });
    const x = st.portrait ? W * 0.5 : W * 0.5, p = this._fresh ? { pop: true } : {};
    b += tag(x, y1 + 26, 'Soil: fine grains and rotted plants', p);
    b += tag(x, y3 - 16, 'Broken rock', { ...p, delay: 0.12 });
    b += tag(x, (y3 + H) / 2 + 12, 'Solid rock', { ...p, delay: 0.24 });
    this._fresh = false;
    return b;
  }

  _tiles(st) {
    const W = st.W, H = st.H, g = 8, tw = (W - 3 * g) / 2, th = (H - 3 * g) / 2;
    const list = [['Heat and cold', 0], ['Stream', 1], ['Rain', 2], ['Lichen', 3]];
    let b = `<rect width="${W}" height="${H}" style="fill:${ec('sandLit')}"/>`;
    list.forEach(([name, k], i) => {
      const x = g + (i % 2) * (tw + g), y = g + Math.floor(i / 2) * (th + g), cx = tw / 2, gy = th - 14;
      let a;
      const sc = Math.min(tw / 340, th / 210);
      if (k === 0) a = svgSand([[-4, gy], [tw + 4, gy], [tw + 4, th + 4], [-4, th + 4]], { seed: 4 }) + `<g transform="translate(${cx} ${gy + 3}) scale(${sc})">${boulder(0.06, 0)}</g>`;
      else if (k === 2) { a = wall(0, tw, gy + 14, 0.5, false).svg; for (let n = 0; n < 9; n++) a += `<circle cx="${(tw * (0.14 + (n % 3) * 0.34)).toFixed(1)}" cy="${(gy * (0.56 + Math.floor(n / 3) * 0.14)).toFixed(1)}" r="${3 + (n * 5) % 3}" style="fill:${ec('rockDeep')}"/>`; for (let n = 0; n < 6; n++) { const dx = tw * (0.14 + n * 0.145), dy = th * (0.3 + (n % 3) * 0.09); a += `<path d="M${dx.toFixed(1)} ${dy.toFixed(1)}q-6 10 0 13q6 -3 0 -13z" style="fill:${ec('sea')};stroke:${INK};stroke-width:1.5"/>`; } }
      else if (k === 3) { a = svgSand([[-4, gy], [tw + 4, gy], [tw + 4, th + 4], [-4, th + 4]], { seed: 7 }) + `<g transform="translate(${cx} ${gy + 3}) scale(${sc})">${boulder(0, 0)}</g>`; [[-.34, .5, 22], [-.1, .68, 15], [.2, .55, 25], [.33, .34, 13], [-.2, .28, 14], [.06, .3, 11]].forEach(([u, v, r]) => { a += `<circle cx="${(cx + u * 300 * sc).toFixed(1)}" cy="${(gy - v * 150 * sc).toFixed(1)}" r="${(r * sc).toFixed(1)}" style="fill:${ec('grassLit')};stroke:${ec('grassDark')};stroke-width:2"/>`; }); }
      else {
        a = svgGrass(0, th * 0.42, tw, th * 0.42, { seed: 4, tall: 10 }) + svgSoil([[-4, th * 0.42], [tw + 4, th * 0.42], [tw + 4, th + 4], [-4, th + 4]], { seed: 6, top: 8 });
        a += svgWater([[-4, th * 0.62], [tw + 4, th * 0.54], [tw + 4, th * 0.86], [-4, th * 0.92]], { t: 1, ripples: 3 });
        for (let n = 0; n < 6; n++) a += svgBoulder(tw * (0.12 + n * 0.15), th * (0.74 + (n % 2) * 0.05), 0.28, { seed: n + 2 });
      }
      b += `<g transform="translate(${x} ${y})"><clipPath id="wb-t${i}"><rect width="${tw}" height="${th}" rx="12"/></clipPath><g clip-path="url(#wb-t${i})"><rect width="${tw}" height="${th}" style="fill:url(#wb-sky)"/>${a}</g><rect width="${tw}" height="${th}" rx="12" style="fill:none;stroke:${INK};stroke-width:3"/>${tag(tw / 2, 20, name, { size: 15 })}</g>`;
    });
    return b;
  }

  _hill(st) {
    const W = st.W, H = st.H, h = hill(st), s = this._stage;
    let b = svgCloud(W * 0.68, 52, 0.7, { seed: 3 });
    b += svgSoil(h.land, { seed: 7, stones: 8, top: 12 }) + svgGrass(W * 0.46, H * 0.52 - 2, W * 0.73, h.foot - 8, { seed: 5, n: 14, tall: 12 });
    const r = [[W * 0.03, h.y0 + 8], [W * 0.05, h.y0 - 56], [W * 0.14, h.y0 - 88], [W * 0.26, h.y0 - 76], [W * 0.32, h.y0 - 24], [W * 0.34, h.y0 + 8]];
    b += svgRock(r, { seed: 4, fill: 'rock', cracks: 5, grain: true, outline: true, lit: true });
    b += svgWater([[W * 0.68, h.foot - 3], [W + 10, h.foot - 12], [W + 10, H * 0.98], [W * 0.78, H * 0.98]], { t: 2, ripples: 4 });
    const p = this._fresh ? { pop: true } : {};
    if (s === 5) {
      for (let n = 0; n < 5; n++) {
        const u = this._u, x = lerp(W * (0.68 + n * 0.012), W * (0.8 + n * 0.05), u), y = h.foot + 8 + (n % 3) * 7;
        b += svgBoulder(x, y, 0.3, { seed: n + 1 });
      }
      b += arrow([[W * 0.74, H * 0.8], [W * 0.84, H * 0.82], [W * 0.95, H * 0.8]], { c: WHITE, w: 6 });
      b += tag(W * 0.27, h.y0 + 34, 'Rock breaks and stays', p) + tag(W * 0.74, H * 0.56, 'Pebbles travel', { ...p, delay: 0.14 });
    } else {
      const u = this._grain, q = along(h.path, u), moving = u > LEAVE;
      b += strand(h.path, 'inkSoft', 3, { dash: '3 10', opacity: 0.8 });
      if (u < 0.04) b += `<circle class="sv-breathe" cx="${q[0]}" cy="${q[1]}" r="26" style="fill:none;stroke:${WHITE};stroke-width:3"/>`;
      b += `<circle cx="${q[0]}" cy="${q[1]}" r="16" style="fill:${ec('sandLit')};stroke:${INK};stroke-width:4"/>`;
      b += `<circle class="sv-drag" cx="${q[0]}" cy="${q[1]}" r="30" style="fill:transparent"/>`;
      const say = u >= 1 ? 'In the stream: erosion goes on' : moving ? 'Travelling: this is erosion' : 'On the rock: only weathering';
      b += plate(12, H - 50, 246, 36, {}) + words(135, H - 26, say, { size: 15, anchor: 'middle' });
    }
    this._fresh = false;
    return b;
  }

  paint(st) {
    const s = this._stage;
    const body = s === 0 ? this._physical(st) : s === 1 ? this._chemical(st) : s === 2 ? this._bio(st) : s === 3 ? this._soil(st) : s === 4 ? this._tiles(st) : this._hill(st);
    return { svg: world(st, 'wb', body) };
  }
}
