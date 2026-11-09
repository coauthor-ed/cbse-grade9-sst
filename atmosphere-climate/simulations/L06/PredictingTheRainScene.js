// PredictingTheRainScene - four ways of knowing the rain (L06 s07, 4 beats). (0) a rain gauge in a field
// and a written record: Kautilya's records of rainfall. (1) the Moon's path as 27 equal parts of the
// sky; a Next night button steps the Moon by one part. (2) Kalidasa: a monsoon cloud over central India.
// (3) forecasts today: a model grid over India and the services the book names. No dates beyond the book's.
import { SvgScene } from 'simulations/base/kit/SimSvg.js';
import * as SkyArt from '../shared/SkyArt.js';
const { svgRainGauge, svgCloud, svgRain, svgHills, svgLand, svgSkyGradient, svgSkyColour: sky } = SkyArt;
import { iconSvg } from 'simulations/base/kit/SimIcons.js';
import { loadIndia, indiaView, mapSvg, mapEnd, creditSvg, mapText, READ_CSS, readCard } from './IndiaMapSvg.js';

const CSS = `
.svs[data-step="1"] { display: grid; grid-template-columns: minmax(0, 1fr) auto; column-gap: var(--sim-space-3); align-items: stretch; align-content: start; }
.svs[data-step="1"] .svs-head { grid-column: 1; grid-row: 1; }
.svs[data-step="1"] .svs-host { grid-column: 1 / -1; grid-row: 2; margin-top: var(--sim-space-2); }
.svs[data-step="1"] .pr-btn { grid-column: 2; grid-row: 1; align-self: center; }
.pr-btn { appearance: none; display: block; min-width: 136px; min-height: 60px; padding: 0 var(--sim-space-4); cursor: pointer; border-radius: var(--look-pill); background: var(--sim-bg-surface); color: var(--sim-label);
  border: calc(2.5px * var(--look-rim)) solid var(--sim-stroke); box-shadow: 0 calc(3px * var(--look-lip)) 0 var(--sim-stroke); font: 600 var(--sim-text-lg)/1 var(--sim-font-display, var(--sim-font)); }
.pr-btn:active { transform: translateY(calc(2px * var(--look-lip))); box-shadow: 0 calc(1px * var(--look-lip)) 0 var(--sim-stroke); }
.pr-btn:focus-visible { outline: 3px solid var(--sim-accent); outline-offset: 2px; }
.pr-btn[hidden] { display: none; }
`;
const USES = [['field', 'Agriculture'], ['megaphone', 'Disaster management'], ['road', 'Rural development']];
const SKY = 'color-mix(in oklab, var(--sim-sea-deep) 62%, black)';

export class PredictingTheRainScene extends SvgScene {
  static HEIGHT = 480;
  static PORTRAIT_HEIGHT = 560;
  static BEAT_STEP_MAP = [0, 1, 2, 3].map((idx) => [{ idx, dwellMs: null }]);
  static CONTROLS = [];
  static ARIA_LABEL = 'Four ways of knowing the rain: a rain gauge and a written record, the sky divided into 27 parts with the Moon moving through them, a monsoon cloud over central India, and forecast models over India.';

  css() { return READ_CSS + CSS; }
  stageHeight(st) { return st.portrait ? 340 : 340; }

  async setup() {
    this._night = 0;
    this._geo = null;
    await super.setup();
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'pr-btn'; b.textContent = 'Next night'; b.hidden = true;
    this._next = () => { this._night = (this._night + 1) % 27; this.repaint(); };
    b.addEventListener('click', this._next);
    this.root.appendChild(b);
    this._btn = b;
    loadIndia().then((g) => { this._geo = g; this.repaint(); }).catch(() => {});
  }
  destroy() { this._btn?.removeEventListener?.('click', this._next); super.destroy(); }
  enter(step) { this._night = 0; if (this._btn) this._btn.hidden = step !== 1; }

  _gauge(st) {
    const W = st.W, H = st.H, id = 'pr0';
    let o = `<defs>${svgSkyGradient(id, 0, 8)}<clipPath id="${id}c"><rect width="${W}" height="${H}" rx="16"/></clipPath></defs><g clip-path="url(#${id}c)"><rect width="${W}" height="${H}" style="fill:url(#${id})"/>`;
    o += svgHills(0, H - 96, 1, { w: W, h: 96, far: true, seed: 5 }) + svgCloud(W * 0.72, 88, 0.95, { kind: 'rain', seed: 3 }) + svgRain(W * 0.72, 90, 1, { w: 120, h: H - 200, heavy: true, t: 1 });
    o += svgLand(0, H - 74, 1, { w: W, h: 76, kind: 'field', seed: 4 }) + '</g>';
    o += svgRainGauge(W * 0.28, H - 34, 1.3, { level: 0.55 });
    o += `<g transform="translate(${W * 0.5 - 8} ${H - 112}) scale(1.3)">${iconSvg('scroll', 2)}</g>`;
    return o + `<rect width="${W}" height="${H}" rx="16" style="fill:none;stroke:var(--sim-stroke);stroke-width:3"/>`;
  }

  _ring(st) {
    const W = st.W, H = st.H, cx = W / 2, cy = H / 2, R = Math.min(cx, cy) - 20, r0 = R * 0.72;
    let o = `<rect width="${W}" height="${H}" rx="16" style="fill:${SKY};stroke:var(--sim-stroke);stroke-width:3"/>`;
    for (let i = 0; i < 40; i++) { const x = (i * 97.3) % W, y = (i * 61.7 + 13) % H; o += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${1 + (i % 3) * 0.5}" style="fill:${sky('cloud')};opacity:0.5"/>`; }
    for (let i = 0; i < 27; i++) {
      const a = -Math.PI / 2 + i * 2 * Math.PI / 27, on = i === this._night, x = Math.cos(a), y = Math.sin(a), a2 = a + 2 * Math.PI / 27, xb = Math.cos(a2), yb = Math.sin(a2);
      o += `<path d="M${(cx + x * r0).toFixed(1)} ${(cy + y * r0).toFixed(1)}L${(cx + x * R).toFixed(1)} ${(cy + y * R).toFixed(1)}A${R} ${R} 0 0 1 ${(cx + xb * R).toFixed(1)} ${(cy + yb * R).toFixed(1)}L${(cx + xb * r0).toFixed(1)} ${(cy + yb * r0).toFixed(1)}A${r0} ${r0} 0 0 0 ${(cx + x * r0).toFixed(1)} ${(cy + y * r0).toFixed(1)}Z" style="fill:${on ? 'var(--sim-gold)' : sky('cloud')};fill-opacity:${on ? 0.8 : (i % 2 ? 0.1 : 0.2)};stroke:${sky('cloud')};stroke-opacity:0.5;stroke-width:1.5"/>`;
    }
    const a = -Math.PI / 2 + (this._night + 0.5) * 2 * Math.PI / 27, mr = (R + r0) / 2, mx = cx + Math.cos(a) * mr, my = cy + Math.sin(a) * mr;
    o += `<circle cx="${mx.toFixed(1)}" cy="${my.toFixed(1)}" r="10" style="fill:${sky('cloud')};stroke:var(--sim-gold);stroke-width:3"/>`;
    o += `<circle cx="${cx}" cy="${cy}" r="${(r0 * 0.46).toFixed(1)}" style="fill:${sky('sea')};stroke:${sky('cloud')};stroke-width:3"/>`;
    o += `<text x="${cx}" y="${cy + 5}" text-anchor="middle" style="font:600 16px var(--sim-font-display);fill:${sky('ink')}">Earth</text>`;
    return o;
  }

  _map(st, step) {
    if (!this._geo) return '';
    const W = st.W, H = st.H, h = Math.min(H, W * 1.03), w = h * 0.97, box = { x: (W - w) / 2, y: 0, w, h: H }, v = indiaView(this._geo, box, [[66, 3.4], [100, 37.6]]);
    let o = mapSvg(v);
    if (step === 2) {
      const c = v.at([78.5, 23]);
      o += `<g class="sv-pop">${svgCloud(c[0], c[1], 0.8, { kind: 'rain', seed: 6 })}${svgRain(c[0], c[1] + 2, 1, { w: 70, h: 52, t: 1 })}</g>` + mapText(c[0], c[1] + 72, 'Central India', { size: 15 });
    } else {
      for (let lon = 68; lon <= 98; lon += 4) { const a = v.at([lon, 5]), b = v.at([lon, 37]); o += `<line x1="${a[0].toFixed(1)}" y1="${a[1].toFixed(1)}" x2="${b[0].toFixed(1)}" y2="${b[1].toFixed(1)}" style="stroke:${sky('cloud')};stroke-width:1.5;opacity:0.55"/>`; }
      for (let lat = 7; lat <= 36; lat += 4) { const a = v.at([66, lat]), b = v.at([100, lat]); o += `<line x1="${a[0].toFixed(1)}" y1="${a[1].toFixed(1)}" x2="${b[0].toFixed(1)}" y2="${b[1].toFixed(1)}" style="stroke:${sky('cloud')};stroke-width:1.5;opacity:0.55"/>`; }
      USES.forEach(([ic, name], i) => { const y = 28 + i * 58; o += `<g transform="translate(${box.x + 8} ${y - 18}) scale(0.8)">${iconSvg(ic, 2 + i)}</g>`; });
    }
    return o + creditSvg(v) + mapEnd(v);
  }

  paint(st) {
    const step = this.stepIndex;
    const svg = step === 0 ? this._gauge(st) : step === 1 ? this._ring(st) : this._map(st, step);
    const head = [
      readCard('Rainfall on record', 'Kauṭilya&#39;s Arthaśhāstra: revenue and relief'),
      readCard(`Part ${this._night + 1} of 27`, 'one nakṣhatra, one night'),
      readCard('Around the 5th century CE', 'Kālidāsa, Meghadūtam'),
      readCard('Weather Ready, Climate Smart', 'Agriculture, disaster management, rural development'),
    ][step];
    return { svg, head };
  }
}
