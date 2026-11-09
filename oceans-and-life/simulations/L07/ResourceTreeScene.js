// ResourceTreeScene - the classification of marine resources, as an outline with its connecting lines. Two mounts by beat
// count: 3 = the living side, 4 = the non-living side. Portrait shows one side large; landscape shows both, with the
// side not being taught dimmed. Every box is in the book's order. Lit nodes follow the beat.
import { SvgScene } from 'simulations/base/kit/SimSvg.js';
import { frame, SEA_CSS, SEA_COLOR_MAP, tx, wrap, svgFish, svgSeagrass, num } from '../L08/SeaDraw.js';

const one = (i) => [{ idx: i, dwellMs: null }];
const LIVING = [
  { id: 'liv', d: 0, t: 'Living Resources' },
  { id: 'fish', d: 1, t: 'Fish' },
  { id: 'coastal', d: 2, t: 'Coastal/Neritic Fish', sub: 'within the shelf, 0-200 m' },
  { id: 'oceanic', d: 2, t: 'Oceanic Fish', sub: 'beyond the shelf, >200 m' },
  { id: 'kinds', d: 2, t: 'Epipelagic, Pelagic, Demersal, Benthopelagic, Benthic Fish', small: true },
  { id: 'bio', d: 1, t: 'Bioactive Natural Products' },
  { id: 'org', d: 1, t: 'Marine Bio-organisms' },
  { id: 'sav', d: 1, t: 'Submerged Aquatic Vegetation (SAV)' },
];
const NONLIV = [
  { id: 'non', d: 0, t: 'Non-Living Resources' },
  { id: 'min', d: 1, t: 'Minerals' },
  { id: 'eng', d: 1, t: 'Energy' },
  { id: 'con', d: 2, t: 'Conventional' },
  { id: 'oil', d: 3, t: 'Oil' },
  { id: 'gas', d: 3, t: 'Natural Gas' },
  { id: 'nc', d: 2, t: 'Non-Conventional' },
  { id: 'bf', d: 3, t: 'Biofuels' },
  { id: 'gh', d: 3, t: 'Gas Hydrates' },
  { id: 'ow', d: 3, t: 'Offshore Wind' },
  { id: 'oe', d: 3, t: 'Ocean Energy' },
  { id: 'mech', d: 4, t: 'Mechanical: Tidal, Wave, Current' },
  { id: 'otec', d: 4, t: 'Ocean Thermal (OTEC)' },
];
const LIT = [
  ['liv', 'fish', 'bio', 'org', 'sav', 'non'],
  ['fish', 'coastal', 'oceanic', 'kinds'],
  ['bio', 'org', 'sav'],
  ['non', 'min', 'eng'],
  ['con', 'oil', 'gas'],
  ['nc', 'bf', 'gh', 'ow', 'oe'],
  ['oe', 'mech', 'otec'],
];

export class ResourceTreeScene extends SvgScene {
  static BEAT_MAPS = { 3: [one(0), one(1), one(2)], 4: [one(3), one(4), one(5), one(6)] };
  static BEAT_STEP_MAP = [one(0), one(1), one(2), one(3), one(4), one(5), one(6)];
  static WIDTH = 720;
  static HEIGHT = 500;
  static PORTRAIT_WIDTH = 360;
  static PORTRAIT_HEIGHT = 620;
  static COLOR_MAP = SEA_COLOR_MAP;
  static ARIA_LABEL = 'The classification of marine resources: living resources (fish, bioactive natural products, marine bio-organisms, submerged aquatic vegetation) and non-living resources (minerals and energy).';
  static CONTROLS = [];
  css() { return SEA_CSS; }
  stageHeight(st) { return st.portrait ? 500 : 490; }
  _list(list, x, y, w, lit, tone, o = {}) {
    // one outline: each row a rimmed box, indented by depth, joined by a spine
    const ind = o.ind ?? 18, gap = o.gap ?? 6, out = [], pos = {};
    let s = '', cy = y;
    list.forEach((n) => {
      const nx = x + n.d * ind, nw = w - n.d * ind, size = o.size ?? 15, lines = wrap(n.t, nw - 18, size), h = (o.h ?? 30) + (lines.length - 1) * 18 + (n.sub ? 18 : 0), on = lit.has(n.id);
      pos[n.id] = { x: nx, y: cy, h, w: nw };
      out.push({ n, nx, nw, h, cy, on, lines, size });
      cy += h + gap;
    });
    // connecting lines first
    const stack = [];
    out.forEach((r) => {
      while (stack.length && stack[stack.length - 1].n.d >= r.n.d) stack.pop();
      const par = stack[stack.length - 1];
      if (par) {
        const sx = par.nx + 8, my = r.cy + r.h / 2;
        s += `<path d="M${sx} ${par.cy + par.h}V${num(my)}H${r.nx}" style="fill:none;stroke:${tone};stroke-width:2.5;opacity:${r.on ? 1 : 0.5}"/>`;
      }
      stack.push(r);
    });
    out.forEach((r) => {
      const { n, nx, nw, h, cy: ry, on, lines, size } = r;
      s += `<g style="opacity:${on ? 1 : 0.68}"><rect x="${nx}" y="${ry + 2}" width="${nw}" height="${h}" rx="8" style="fill:${tone}"/>`
        + `<rect x="${nx}" y="${ry}" width="${nw}" height="${h}" rx="8" style="fill:${on ? `color-mix(in oklab, ${tone} 22%, var(--sim-bg-surface))` : 'var(--sim-bg-surface)'};stroke:${tone};stroke-width:${on ? 3 : 2}"/>`;
      lines.forEach((l, i) => { s += tx(nx + 9, ry + 20 + i * 18, l, { size, anchor: 'start', weight: n.d <= 1 ? 800 : 700 }); });
      if (n.sub) s += tx(nx + 9, ry + 20 + lines.length * 18, n.sub, { size: 15, anchor: 'start', weight: 600, col: 'var(--sim-label-muted)' });
      s += '</g>';
    });
    return { s, pos, bottom: cy };
  }
  paint(st) {
    const W = st.W, P = st.portrait, step = this.stepIndex, lit = new Set(LIT[step]), livCol = 'var(--sim-series-1)', nonCol = 'var(--sim-series-4)', living = step < 3;
    const rw = 190, rx = (W - rw) / 2;
    let s = `<rect x="${rx}" y="4" width="${rw}" height="38" rx="19" style="fill:var(--sim-series-3);stroke:var(--sim-label);stroke-width:2"/>` + tx(W / 2, 29, 'Marine Resources', { size: 17, display: true, weight: 700, col: 'var(--sim-bg-deep)' });
    if (P) {
      const r = this._list(living ? LIVING : NONLIV, 8, 56, W - 16, lit, living ? livCol : nonCol, { ind: 16, h: living ? 34 : 28, gap: living ? 10 : 5 });
      s += `<path d="M${W / 2} 42V56" style="stroke:${living ? livCol : nonCol};stroke-width:3"/>` + r.s;
      if (living) {
        const y = r.bottom + 4;
        s += svgFish(W * 0.3, y + 22, 0.8, { kind: 1 }) + svgSeagrass(W * 0.62, y + 44, 0.8, {}) + svgSeagrass(W * 0.7, y + 44, 0.7, { t: 1 });
      } else if (r.pos.bf) {
        const b = r.pos.bf;
        s += `<path d="M0 ${num(b.y + b.h / 2)}H${b.x}" style="stroke:${livCol};stroke-width:3;stroke-dasharray:7 5"/>`;
        s += tx(b.x + b.w - 8, b.y + 20, 'line from SAV', { size: 15, anchor: 'end', col: livCol });
      }
    } else {
      const cw = (W - 32) / 2;
      const a = this._list(LIVING, 8, 56, cw, living ? lit : new Set(), livCol, { ind: 14, h: 28, gap: 6 });
      const b = this._list(NONLIV, 8 + cw + 16, 56, cw, living ? new Set(['non']) : lit, nonCol, { ind: 14, h: 26, gap: 3 });
      s += `<path d="M${rx + 10} 34H${8 + cw / 2}V56" style="fill:none;stroke:${livCol};stroke-width:3"/><path d="M${rx + rw - 10} 34H${W - 8 - cw / 2}V56" style="fill:none;stroke:${nonCol};stroke-width:3"/>`;
      const sv = a.pos.sav, bf = b.pos.bf;
      s += a.s + b.s + `<path d="M${sv.x + sv.w} ${sv.y + sv.h / 2}H${8 + cw + 6}V${bf.y + bf.h / 2}H${bf.x}" style="fill:none;stroke:${livCol};stroke-width:2.5;stroke-dasharray:7 5"/>`;
    }
    return { svg: frame(st, s) };
  }
}
