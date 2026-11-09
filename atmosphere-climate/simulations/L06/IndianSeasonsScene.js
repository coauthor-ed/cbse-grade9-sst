// IndianSeasonsScene - the IMD's four seasons (L06 s05, 3 beats). The same drawn landscape changes with
// the season, a thermometer holds the book's reading, and a year strip shows each season's months,
// overlapping at the edges as the book gives them. Chips light one season. Beat 0: all four. Beat 1: winter
// (then summer by a chip). Beat 2: monsoon (post-monsoon, Himalayan states by a chip).
import { SvgScene } from 'simulations/base/kit/SimSvg.js';
import { tapLight, TAP_LIGHT_CSS } from 'simulations/base/kit/TapLight.js';
import * as SkyArt from '../shared/SkyArt.js';
const { svgSun, svgCloud, svgRain, svgHills, svgLand, svgThermometer, svgSkyGradient } = SkyArt;
import { READ_CSS, readCard } from './IndiaMapSvg.js';
import { MONTHS } from '../L07/StationData.js';

const SEASONS = [
  { id: 'winter', label: 'Winter', tone: 1, bars: [[0, 3.2], [11, 12]], big: '10-15 °C in the north-west', small: 'December to early April; 20-25 °C in the south-east', level: 0.32 },
  { id: 'summer', label: 'Summer', tone: 8, bars: [[3, 6]], soft: [6, 7], big: '32-40 °C inland', small: 'April to June, up to July in the north-west', level: 0.92 },
  { id: 'monsoon', label: 'Monsoon', tone: 3, bars: [[5, 9]], big: 'Humid south-west winds', small: 'June to September', level: 0.64 },
  { id: 'post', label: 'Post-monsoon', tone: 2, bars: [[9, 12]], big: 'Usually cloudless', small: 'October and November in the north-west; season to December', level: 0.54 },
];
const HIM = { id: 'himalaya', label: 'Himalayan states', tone: 5, big: 'Two more seasons', small: 'autumn and spring, in the more temperate Himalayan states', level: 0.3 };
const CHIPS = [...SEASONS, HIM].map((s) => ({ id: s.id, label: s.label, targets: [s.id], tone: s.tone }));
const CSS = `.sim-dom-root--portrait .tl-chip { padding-inline: var(--sim-space-2); }
.is-side { position: absolute; left: 76px; top: 8px; width: 356px; }
.is-side .mf-read { min-height: 0; padding: var(--sim-space-1) var(--sim-space-2); }
.is-side .mf-big { font-size: var(--sim-text-xl); }`;

export class IndianSeasonsScene extends SvgScene {
  static HEIGHT = 520;
  static PORTRAIT_HEIGHT = 580;
  static BEAT_STEP_MAP = [0, 1, 2].map((idx) => [{ idx, dwellMs: null }]);
  static CONTROLS = [];
  static ARIA_LABEL = 'A landscape that changes with the four seasons of India, a thermometer, and a strip of twelve months showing when each season falls.';

  tl = tapLight({ label: 'Seasons', chips: CHIPS, onChange: () => this.repaint() });
  css() { return TAP_LIGHT_CSS + READ_CSS + CSS; }
  stageHeight(st) { return st.portrait ? 322 : 356; }

  async setup() { await super.setup(); this.tl.mount(this.root, this); }
  destroy() { this.tl.destroy(); super.destroy(); }
  enter(step) { this.tl.set({ lit: step === 1 ? 'winter' : step === 2 ? 'monsoon' : null }); }

  _scene(st, s, x, y, w, h) {
    const id = s?.id, night = 'sg';
    let o = `<defs>${svgSkyGradient(night, 0, 10)}<clipPath id="sc"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="16"/></clipPath></defs><g clip-path="url(#sc)">`;
    o += `<rect x="${x}" y="${y}" width="${w}" height="${h}" style="fill:url(#${night})"/>`;
    const dry = id === 'summer' || id === 'post';
    if (id !== 'monsoon') o += `<g class="sv-pop">${svgSun(x + w * 0.74, y + 52, id === 'summer' ? 0.68 : id === 'winter' ? 0.42 : 0.54, { alpha: id === 'winter' ? 0.8 : 1 })}</g>`;
    if (id === 'winter') o += svgCloud(x + w * 0.42, y + 62, 0.5, { kind: 'flat', seed: 3 });
    o += svgHills(x, y + h - 58, 0.9, { w: (w / 0.9), h: 92, far: true, seed: 8, peaks: 4, snow: id === 'himalaya' || id === 'winter' });
    o += svgLand(x, y + h - 56, 1, { w, h: 60, kind: id === 'summer' ? 'sand' : id === 'monsoon' ? 'field' : 'plain', seed: 6 });
    if (id === 'monsoon') {
      o += `<g class="sv-pop">${svgCloud(x + w * 0.36, y + 74, 0.9, { kind: 'rain', seed: 2 })}${svgCloud(x + w * 0.74, y + 66, 0.74, { kind: 'rain', seed: 7 })}</g>`;
      o += svgRain(x + w * 0.36, y + 76, 1, { w: 100, h: h - 120, heavy: true, t: 1 }) + svgRain(x + w * 0.74, y + 68, 1, { w: 84, h: h - 112, heavy: true, t: 2 });
    }
    if (!s) o += svgCloud(x + w * 0.34, y + 58, 0.6, { seed: 3 });
    o += '</g>';
    o += `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="16" style="fill:none;stroke:var(--sim-stroke);stroke-width:3"/>`;
    o += svgThermometer(x + 34, y + h - 24, 0.82, { level: s ? s.level : 0.5 });
    return o;
  }

  _strip(st, sel, x, y, w) {
    const cw = w / 12, rh = 24;
    let o = '';
    MONTHS.forEach((m, i) => { o += `<text x="${(x + (i + 0.5) * cw).toFixed(1)}" y="${y + 13}" text-anchor="middle" style="font:700 14px var(--sim-font);fill:var(--sim-label-muted)">${m}</text>`; });
    SEASONS.forEach((s, r) => {
      const yy = y + 20 + r * rh, on = !sel || sel === s.id;
      o += `<rect x="${x}" y="${yy}" width="${w}" height="${rh - 4}" rx="6" style="fill:var(--sim-track);opacity:0.5"/>`;
      const c = `var(--sim-series-${s.tone})`;
      for (const [a, b] of s.bars) o += `<rect x="${(x + a * cw).toFixed(1)}" y="${yy}" width="${((b - a) * cw).toFixed(1)}" height="${rh - 4}" rx="6" style="fill:color-mix(in oklab, ${c} ${on ? 60 : 24}%, var(--sim-bg-surface))"/>`;
      const [a0, b0] = s.bars[0], tx = s.id === 'post' ? x + 12 * cw - 6 : x + a0 * cw + 7;
      o += `<text x="${tx.toFixed(1)}" y="${yy + 15}" text-anchor="${s.id === 'post' ? 'end' : 'start'}" style="font:700 14px var(--sim-font);fill:var(--sim-label);opacity:${on ? 1 : 0.55}">${s.label}</text>`;
      if (s.soft) o += `<rect x="${(x + s.soft[0] * cw).toFixed(1)}" y="${yy}" width="${(cw).toFixed(1)}" height="${rh - 4}" rx="6" style="fill:${c};opacity:${on ? 0.45 : 0.14}"/>`;
    });
    return o;
  }

  paint(st) {
    const sel = this.tl.lit()[0] ?? null, s = sel === 'himalaya' ? HIM : SEASONS.find((q) => q.id === sel) ?? null;
    const h = st.portrait ? 196 : 232, stripY = h + 8;
    const svg = this._scene(st, s, 0, 0, st.W, h) + this._strip(st, sel === 'himalaya' ? 'none' : sel, 0, stripY, st.W);
    const card = s ? readCard(s.big, s.small) : readCard('Four seasons', 'named by the Indian Meteorological Department');
    if (st.portrait) return { svg, head: card };
    return { svg, over: `<div class="is-side">${card}</div>` };
  }
}
