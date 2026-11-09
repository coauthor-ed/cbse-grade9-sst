// PrecipitationScene - blk-l03-s05. A side view of the sky.
//   0 a bubble of moist air rises from warm ground, cooling on a height scale; at the saturated
//     height its vapour becomes drops and a cloud forms. Lapse used: about 10 C per km unsaturated.
//   1 five forms of precipitation, tap each
//   2 sea wind, a mountain, a season strip: the book's three factors
import { SvgScene } from 'simulations/base/kit/SimSvg.js';
import { tapLight } from 'simulations/base/kit/TapLight.js';
import { AIR_CSS, tx, skyTx, panel, skyRect, sky, SKY_INK, MUTED, windArrow, btn, bindActs, svgCloud, svgRain, svgLand, svgSea, svgHills, svgSun } from './AirDraw.js';

const MAP = [[{ idx: 0, dwellMs: null }], [{ idx: 1, dwellMs: null }], [{ idx: 2, dwellMs: null }]];
const FORMS = [
  { id: 'drizzle', label: 'Drizzle', say: 'fine, light drops' },
  { id: 'rain', label: 'Rain', say: 'liquid drops, the most common kind' },
  { id: 'snow', label: 'Snow', say: 'ice crystals, in very cold air' },
  { id: 'sleet', label: 'Sleet', say: 'drops and ice mixed' },
  { id: 'hail', label: 'Hail', say: 'hard balls of ice' },
];
const FACTORS = [
  { id: 'winds', label: 'Prevailing winds', targets: ['winds'], tone: 1 },
  { id: 'mountains', label: 'Mountains', targets: ['mountains'], tone: 3 },
  { id: 'seasons', label: 'Seasons', targets: ['seasons'], tone: 2 },
];
const FORM_CHIPS = FORMS.map((f, i) => ({ id: f.id, label: f.label, targets: [f.id], tone: i + 1 }));

export class PrecipitationScene extends SvgScene {
  static BEAT_STEP_MAP = MAP;
  static ARIA_LABEL = 'Moist air rises and cools until vapour condenses into a cloud. Drizzle, rain, snow, sleet and hail fall from clouds. Winds, mountains and seasons decide where.';
  static CONTROLS = [];
  tl = tapLight({ label: 'Choose', chips: FORM_CHIPS, onChange: () => this.repaint() });
  css() { return AIR_CSS + '.sim-dom-root--portrait.svs { padding: var(--sim-space-1) 8px; }'; }
  stageHeight(st) { return st.portrait ? 430 : 400; }
  async setup() {
    this._h = 0;
    await super.setup();
    this.tl.mount(this.root, this);
    this._off = bindActs(this, (a) => { if (a === 'rise') { if (this._h >= 1) this._h = 0; else this._start(); } });
    this.enter(this.stepIndex);
  }
  destroy() { this._stopRise(); this._off?.(); this.tl.destroy(); super.destroy(); }
  enter(step) {
    this._stopRise?.();
    this._h = step === 0 ? 0 : 1;
    if (!this.tl) return;
    this.tl.set({ chips: step === 2 ? FACTORS : FORM_CHIPS, lit: step === 1 ? 'rain' : null, disabled: step === 0 });
    const r = this.root.querySelector?.('.tl-row');
    if (r) r.hidden = step === 0;
  }
  paint(st) { return [this._rise, this._forms, this._where][this.stepIndex].call(this, st); }
  _start() {
    this._stopRise();
    this._going = true; this._h = 0;
    const calm = globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (calm || typeof requestAnimationFrame !== 'function') { this._going = false; this._h = 1; return; }
    const t0 = performance.now();
    const tick = (now) => {
      if (!this._going || !this.sv) return;
      this._h = Math.min(1, (now - t0) / 3000);
      if (this._h >= 1) this._going = false;
      this.repaint();
      if (this._going) this._riseFrame = requestAnimationFrame(tick);
    };
    this._riseFrame = requestAnimationFrame(tick);
  }
  _stopRise() { this._going = false; if (this._riseFrame) cancelAnimationFrame(this._riseFrame); this._riseFrame = 0; }
  _rise(st) {
    const W = st.W, H = st.H, h = this._h, g = H - 44, top = 60, base = g - (g - top) * 0.74;
    const y = g - 40 - h * (g - 40 - base + 6), x = W * 0.54;
    const km = (g - 40 - y) / ((g - top) / 3);     // the stage shows about 3 km
    const temp = Math.round(30 - km * 10);
    let s = skyRect('prSky', 0, 0, W, H, 0, 5, { r: 18 }) + svgSun(58, 56, 0.6, {});
    s += svgLand(0, g, 1, { w: W, h: H - g, kind: 'field', seed: 3 });
    // height scale
    const sx = W - 46;
    s += `<path d="M${sx} ${g}V${top}" style="stroke:${SKY_INK};stroke-width:3"/>`;
    [0, 1, 2, 3].forEach((k) => { const yy = g - k * (g - top) / 3; s += `<path d="M${sx - 6} ${yy}h12" style="stroke:${SKY_INK};stroke-width:3"/>` + skyTx(sx + 12, yy + 5, `${k} km`, { size: 14, anchor: 'start' }); });
    const atBase = h >= 0.985;
    if (atBase) s += `<g class="air-in">${svgCloud(x, base + 6, 1.7, { seed: 4 })}</g>`;
    else {
      s += `<circle cx="${x}" cy="${y}" r="${46 + h * 12}" style="fill:color-mix(in oklab, var(--sim-series-1) 18%, ${sky('cloud')});stroke:${SKY_INK};stroke-width:3"/>`;
      for (let i = 0; i < 9; i++) { const a = i * 2.4, r = (i % 3 + 1) * (13 + h * 3); s += `<circle cx="${(x + Math.cos(a) * r).toFixed(1)}" cy="${(y + Math.sin(a) * r).toFixed(1)}" r="5" style="fill:var(--sim-series-1)"/>`; }
    }
    s += `<path d="M${x - 70} ${base + 8}H${sx - 8}" style="stroke:${SKY_INK};stroke-width:2.5;stroke-dasharray:8 7"/>`;
    s += skyTx(x + (st.portrait ? 16 : 118), base + 28, 'air is full here', { size: 15 });
    s += panel(12, 96, 118, 76) + tx(71, 118, 'Rising air', { size: 15 }) + tx(71, 156, `${temp} \u00b0C`, { size: 30, display: true, weight: 700 });
    return { svg: s, over: btn(st.portrait ? W / 2 - 10 : W / 2 - 20, H - 24, atBase ? 'Start again' : 'Let the air rise', 'rise', { disabled: this._going }) };
  }
  _forms(st) {
    const W = st.W, H = st.H, f = FORMS.find((x) => x.id === this.tl.chip()?.id) ?? FORMS[1], g = H - 46, cold = f.id === 'snow' || f.id === 'hail' || f.id === 'sleet';
    let s = skyRect('prSky2', 0, 0, W, H, 0, 6, { r: 18 });
    if (cold) s += `<rect width="${W}" height="${H}" rx="18" style="fill:${sky('cloudShade')};opacity:0.6"/>`;
    s += svgCloud(W * 0.3, 186, 1.35, { seed: 3, kind: 'rain' }) + svgCloud(W * 0.68, 176, 1.5, { seed: 6, kind: 'rain' });
    s += svgLand(0, g, 1, { w: W, h: H - g, kind: f.id === 'snow' ? 'plain' : 'field', seed: 3 });
    if (f.id === 'snow') s += `<path d="M0 ${g + 2}H${W}V${g + 14}H0Z" style="fill:${sky('snow')}"/>`;
    const shapes = [];
    const n = f.id === 'drizzle' ? 44 : f.id === 'hail' ? 16 : 26;
    let r = 13;
    for (let i = 0; i < n; i++) {
      r = (r * 7 + 13) % 101;
      const x = W * 0.06 + ((i * 37) % 97) / 97 * W * 0.88, y = 196 + (r / 101) * (g - 208);
      if (f.id === 'rain') shapes.push(`<path d="M${x} ${y}q7 12 0 19q-7 -7 0 -19Z" style="fill:${sky('rain')};stroke:${SKY_INK};stroke-width:1.2"/>`);
      if (f.id === 'drizzle') shapes.push(`<circle cx="${x}" cy="${y}" r="2.6" style="fill:${sky('rain')}"/>`);
      if (f.id === 'snow') shapes.push(`<path d="M${x - 7} ${y}h14M${x} ${y - 7}v14M${x - 5} ${y - 5}l10 10M${x + 5} ${y - 5}l-10 10" style="stroke:${sky('snow')};stroke-width:2.6;stroke-linecap:round"/>`);
      if (f.id === 'sleet') shapes.push(i % 2 ? `<path d="M${x} ${y}q6 11 0 17q-6 -6 0 -17Z" style="fill:${sky('rain')};stroke:${SKY_INK};stroke-width:1"/>` : `<rect x="${x - 6}" y="${y - 6}" width="12" height="12" rx="3" transform="rotate(20 ${x} ${y})" style="fill:${sky('snow')};stroke:${SKY_INK};stroke-width:1.2"/>`);
      if (f.id === 'hail') shapes.push(`<circle cx="${x}" cy="${y}" r="9" style="fill:${sky('snow')};stroke:${SKY_INK};stroke-width:2"/><circle cx="${x - 3}" cy="${y - 3}" r="2.5" style="fill:${sky('snowShade')}"/>`);
    }
    s += `<g class="air-in">${shapes.join('')}</g>`;
    const w = Math.min(W - 24, 300);
    s += panel((W - w) / 2, 12, w, 62) + tx(W / 2, 40, f.label, { size: 24, display: true, weight: 700 }) + tx(W / 2, 62, f.say, { size: 15, col: MUTED, weight: 700 });
    return { svg: s };
  }
  _where(st) {
    const W = st.W, H = st.H, lit = this.tl.chip()?.id, g = H - 40, port = st.portrait;
    const dim = (id) => `opacity:${lit && lit !== id ? 0.3 : 1}`;
    let s = skyRect('prSky3', 0, 0, W, H, 0, 6, { r: 18 });
    s += svgSea(0, g, 1, { w: W * 0.46, h: H - g, t: 0 });
    s += svgLand(W * 0.42, g, 1, { w: W * 0.6, h: H - g, kind: 'field', seed: 4 });
    s += `<g style="${dim('mountains')}">${svgHills(W * 0.52, g + 2, 1, { w: W * 0.5, h: port ? 200 : 230, seed: 7, peaks: 2 })}</g>`;
    s += `<g style="${dim('mountains')}">${svgCloud(W * 0.64, g - (port ? 150 : 170), 1.25, { seed: 3, kind: 'rain' })}${svgRain(W * 0.64, g - (port ? 150 : 170), 1, { w: 110, h: port ? 96 : 110, heavy: true })}</g>`;
    s += `<g style="${dim('winds')}">` + windArrow([[16, g - 40], [W * 0.26, g - 46], [W * 0.46, g - 80]], { w: 13, col: 'var(--sim-series-1)', flow: true, curve: true }) + skyTx(port ? 74 : 92, g - 78, 'wet wind', { size: 16 }) + '</g>';
    s += `<g style="${dim('mountains')}">` + windArrow([[W * 0.46, g - 80], [W * 0.56, g - (port ? 124 : 140)]], { w: 11, col: sky('cloud'), curve: false }) + '</g>';
    if (lit === 'mountains') s += skyTx(W * 0.42, g - (port ? 172 : 196), 'air forced up', { size: 16 });
    const mo = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'], wet = [5, 6, 7, 8], bw = Math.min(26, (W - 24) / 12), x0 = 12;
    s += `<g style="${dim('seasons')}">` + panel(x0 - 4, 10, 12 * bw + 8, 58, { r: 10 });
    mo.forEach((m, i) => {
      const on = wet.includes(i);
      s += `<rect x="${x0 + i * bw + 1}" y="16" width="${bw - 2}" height="24" rx="4" style="fill:${on ? sky('rain') : 'var(--sim-track)'}"/>` + tx(x0 + i * bw + bw / 2, 58, m, { size: 14 });
    });
    s += '</g>';
    if (lit === 'seasons') s += skyTx(x0 + 6 * bw, 88, 'wet months come in a season', { size: 15 });
    return { svg: s };
  }
}
