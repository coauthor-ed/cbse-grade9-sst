// WeatherClimateScene - blk-l03-s00. One sky over Delhi, three beats.
//   0 a made-up July week: seven days in a strip; tap a day and the sky above changes
//   1 thirty Julys as thirty bars, the average drawn across them: 30.0 C and 19.3 cm, Table 3.3
//   2 a very wet week added to one July: the bar jumps, the average hardly moves (true sum)
// The bars are invented around the book's mean and labelled as an example; they sum to 19.3 x 30.
import { SvgScene } from 'simulations/base/kit/SimSvg.js';
import { AIR_CSS, tx, skyTx, panel, reading, skyRect, hit, btn, bindActs, sky, CARD, svgCloud, svgSun, svgRain, svgLand, svgHills } from './AirDraw.js';

const WEEK = [
  { d: 'Mon', t: 36, k: 'sun', say: 'Bright and hot' },
  { d: 'Tue', t: 34, k: 'cloud', say: 'Cloudy' },
  { d: 'Wed', t: 29, k: 'rain', say: 'Rain all day' },
  { d: 'Thu', t: 28, k: 'rain', say: 'Heavy showers' },
  { d: 'Fri', t: 32, k: 'cloud', say: 'Cloudy and sticky' },
  { d: 'Sat', t: 35, k: 'sun', say: 'Bright, a light breeze' },
  { d: 'Sun', t: 33, k: 'part', say: 'Sun and cloud' },
];
const RAW = [14, 22, 18, 26, 12, 20, 24, 17, 15, 28, 19, 21, 16, 23, 13, 25, 18, 20, 14, 27, 22, 17, 19, 24, 15, 21, 16, 23, 18, 20];
const K = 19.3 * 30 / RAW.reduce((a, b) => a + b, 0);
const YEARS = RAW.map((v) => v * K);       // cm of rain in thirty Julys, mean exactly 19.3
const WET_YEAR = 18, WET_CM = 10;
const MAX_CM = 42;

const MAP = [[{ idx: 0, dwellMs: null }], [{ idx: 1, dwellMs: null }], [{ idx: 2, dwellMs: null }]];

export class WeatherClimateScene extends SvgScene {
  static BEAT_STEP_MAP = MAP;
  static ARIA_LABEL = 'A sky over Delhi. A made-up July week of changing weather, then thirty Julys as bars around an average of 19.3 cm of rain, then one very wet week that hardly moves the average.';
  static CONTROLS = [];
  static PORTRAIT_HEIGHT = 560;

  css() { return AIR_CSS; }
  stageHeight(st) { return st.portrait ? 500 : 440; }

  async setup() {
    this._day = 2; this._wet = false; this._found = false;
    await super.setup();
    this._off = bindActs(this, (a) => this._onAct(a));
  }
  destroy() { this._off?.(); super.destroy(); }

  enter(step) { this._day = 2; this._wet = false; }

  _onAct(a) {
    if (a.startsWith('day')) this._day = Number(a.slice(3));
    if (a === 'wet') {
      this._wet = !this._wet;
      if (this.stepIndex === 2 && this._wet && !this._found) { this._found = true; this.celebrate(); }
    }
  }

  _sky(st, W, H, wet) {
    return skyRect('wcSky', 0, 0, W, H, 0, 9, { r: 18 })
      + (wet ? `<rect width="${W}" height="${H}" rx="18" style="fill:${sky('cloudDark')};opacity:0.55"/>` : '');
  }

  paint(st) {
    const W = st.W, H = st.H, step = this.stepIndex;
    return step === 0 ? this._week(st, W, H) : this._years(st, W, H, step);
  }

  _week(st, W, H) {
    const day = WEEK[this._day], stripH = 104, skyH = H - stripH - 10;
    const wet = day.k === 'rain', g = skyH - 40;
    let s = this._sky(st, W, skyH, wet);
    s += svgHills(0, g + 8, 1, { w: W, h: 56, seed: 3, far: true });
    s += svgLand(0, g, 1, { w: W, h: skyH - g, kind: 'town', seed: 4 });
    const cx = W * 0.5, cy = skyH * 0.32, big = st.portrait ? 1.25 : 1.6;
    let art = '';
    if (day.k === 'sun') art = svgSun(cx, cy, st.portrait ? 1.15 : 1.35, {});
    if (day.k === 'part') art = svgSun(cx + 50, cy - 16, 0.9, {}) + svgCloud(cx - 30, cy + 44, big, { seed: 2 });
    if (day.k === 'cloud') art = svgCloud(cx - 60, cy + 12, big * 0.9, { seed: 3 }) + svgCloud(cx + 80, cy + 44, big, { seed: 5 });
    if (day.k === 'rain') art = svgRain(cx, cy + 50, 1, { w: W * 0.72, h: g - cy - 50, heavy: day.t < 29 }) + svgCloud(cx - 90, cy + 40, big, { seed: 3, kind: 'rain' }) + svgCloud(cx + 80, cy + 50, big * 1.1, { seed: 6, kind: 'rain' });
    s += `<g class="air-in">${art}</g>`;
    s += panel(12, 12, 118, 72) + tx(71, 34, `${day.d}, Delhi`, { size: 15 }) + tx(71, 70, `${day.t} \u00b0C`, { size: 30, display: true, weight: 700 });
    s += skyTx(W / 2, skyH - 14, day.say, { size: 18 }) + skyTx(W - 14, 30, 'made-up week', { size: 15, anchor: 'end' });
    const gap = st.portrait ? 2 : 5, y0 = skyH + 8, tw = (W - 6 * gap) / 7;
    let over = '';
    WEEK.forEach((d, i) => {
      const x = i * (tw + gap), on = i === this._day;
      s += panel(x, y0, tw, stripH - 10, { col: on ? 'color-mix(in oklab, var(--sim-accent) 30%, var(--sim-bg-surface))' : CARD, rim: on ? 'var(--sim-accent)' : undefined, r: 11 });
      s += tx(x + tw / 2, y0 + 19, d.d, { size: 14 });
      const ix = x + tw / 2, iy = y0 + 46;
      if (d.k === 'sun') s += svgSun(ix, iy, 0.28, {});
      if (d.k === 'part') s += svgSun(ix + 7, iy - 4, 0.2, {}) + svgCloud(ix - 3, iy + 10, 0.27, { seed: 2 });
      if (d.k === 'cloud') s += svgCloud(ix, iy + 9, 0.34, { seed: 3 });
      if (d.k === 'rain') s += svgRain(ix, iy + 6, 1, { w: 22, h: 14, heavy: true }) + svgCloud(ix, iy + 6, 0.32, { seed: 3, kind: 'rain' });
      s += tx(x + tw / 2, y0 + 84, `${d.t}\u00b0`, { size: 15, display: true, weight: 700 });
      over += hit(x, y0, tw, stripH - 8, `day${i}`, `${d.d}: ${d.say}, ${d.t} degrees`, { pressed: on });
    });
    return { svg: s, over };
  }

  _years(st, W, H, step) {
    const wet = step === 2 && this._wet;
    const data = YEARS.map((v, i) => (wet && i === WET_YEAR ? v + WET_CM : v));
    const mean = data.reduce((a, b) => a + b, 0) / 30;
    const top = st.portrait ? 150 : 96, foot = H - (step === 2 ? 66 : 44), left = 14, right = W - 14;
    const y = (cm) => foot - (cm / MAX_CM) * (foot - top);
    let s = this._sky(st, W, H, false);
    s += svgLand(0, foot + 4, 1, { w: W, h: H - foot - 4, kind: 'plain', seed: 2 });
    const bw = (right - left) / 30;
    s += `<g>`;
    data.forEach((v, i) => {
      const hot = wet && i === WET_YEAR;
      const col = hot ? 'var(--sim-series-2)' : sky('rain');
      s += `<rect class="sv-grow" x="${(left + i * bw + 1).toFixed(1)}" y="${y(v).toFixed(1)}" width="${(bw - 2.5).toFixed(1)}" height="${(foot - y(v)).toFixed(1)}" rx="2.5" style="fill:${col};stroke:${sky('ink')};stroke-width:1.2;--d:${step === 1 ? (i * 0.018).toFixed(3) : 0}s"/>`;
    });
    s += `</g>`;
    const my = y(mean);
    s += `<path d="M${left - 4} ${my.toFixed(1)}H${right + 4}" style="stroke:${sky('ink')};stroke-width:3;stroke-dasharray:9 6"/>`;
    const cards = st.portrait
      ? reading(12, 10, 'Average July', '30.0 \u00b0C', { w: (W - 34) / 2, h: 70 }) + reading(22 + (W - 34) / 2, 10, 'Average rain', `${mean.toFixed(1)} cm`, { w: (W - 34) / 2, h: 70 })
      : reading(W - 300, 10, 'Average July', '30.0 \u00b0C', { w: 142, h: 72 }) + reading(W - 150, 10, 'Average rain', `${mean.toFixed(1)} cm`, { w: 138, h: 72 });
    s += cards;
    s += skyTx(st.portrait ? W / 2 : 16, st.portrait ? 104 : 34, 'Rain in 30 Julys, example', { size: 15, anchor: st.portrait ? 'middle' : 'start' });
    if (!st.portrait) s += skyTx(16, 58, 'each bar is one year', { size: 15, anchor: 'start', weight: 700 });
    s += skyTx(left + 4, my - 8, 'average', { size: 15, anchor: 'start' });
    if (wet) s += skyTx(left + (WET_YEAR + 0.5) * bw, y(data[WET_YEAR]) - 8, '+10 cm', { size: 16 });
    let over = '';
    if (step === 2) over = btn(W / 2, H - 28, wet ? 'Take the wet week away' : 'Add one very wet week', 'wet');
    return { svg: s, over };
  }
}
