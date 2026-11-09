/**
 * GlobalFarmingTimelineScene - blk-l05-s03. The book's chart, Fig 4.14, redrawn truly.
 * Six rows in order of first traces. Axis: 15,000 years ago to today, true scale. Bars and sign positions
 * were measured off the printed page at 200 dpi (progress/notes-L05.md).
 * Beats: 0 rows and bars, 1 how to read one row, 2 the starts compared, 3 each row's own plant,
 * 4 wheat and barley at Mehrgarh, 5 the five signs slide into first, second, third...: the order differs,
 * 6 what is still here today. Chips on beats 1 to 5 light one sign in every row.
 */
import { SvgScene, fill, stroke, shade, cushionCircle, cushionRect } from 'simulations/base/kit/SimSvg.js';
import { tapLight } from 'simulations/base/kit/TapLight.js';
import { at, text, signGlyph, earArt, potArt, hutArt, brickHouseArt, cowArt, pigArt, sheepArt, GRAIN } from '../shared/StoneAgeArt.js';

const MAP = [0, 1, 2, 3, 4, 5, 6].map((idx) => [{ idx, dwellMs: null }]);

const SIGNS = {
  pottery: { label: 'pottery', tone: 8 },
  cultivation: { label: 'cultivation', tone: 3 },
  livestock: { label: 'livestock', tone: 2 },
  sedentism: { label: 'sedentism', tone: 5 },
  landscape: { label: 'farmed land', tone: 1 },
};
const CHIPS = Object.entries(SIGNS).map(([id, s]) => ({ id, label: s.label, targets: [id], tone: s.tone }));
const ORD = ['1st', '2nd', '3rd', '4th', '5th'];

/** k: thousands of years ago. dots, light and dark are the three lines of the chart. */
const ROWS = [
  { id: 'wa', name: 'West Asia', crop: 'wheat, barley', ear: 'wheat', from: '12,500', dots: [12.77, 12.14], light: [12.14, 9.38], dark: [9.38, 7.84],
    at: { sedentism: 13.6, cultivation: 12.0, livestock: 9.9, landscape: 7.9, pottery: 6.05 } },
  { id: 'nc', name: 'North China', crop: 'millets', ear: 'millet', from: '10,500', dots: [10.53, 7.14], dark: [7.14, 5.2],
    at: { pottery: 12.0, cultivation: 10.0, livestock: 8.0, sedentism: 6.85, landscape: 5.0 } },
  { id: 'sc', name: 'South China', crop: 'rice', ear: 'rice', from: '9,500', dots: [9.34, 7.75], light: [7.75, 6.15], dark: [6.15, 4.64],
    at: { pottery: 13.6, cultivation: 9.5, sedentism: 7.5, livestock: 5.5, landscape: 3.5 } },
  { id: 'gp', name: 'Ganga Plains', crop: 'rice', ear: 'rice', from: '7,000', dots: [6.88, 2.38], dark: [2.38, 1.47],
    at: { pottery: 7.6, cultivation: 6.1, sedentism: 2.8, landscape: 1.66, livestock: 0.4 } },
  { id: 'im', name: 'India', crop: 'millets', ear: 'millet', from: '5,000', dots: [5.22, 3.96], light: [3.96, 3.27], dark: [3.27, 1.88],
    at: { pottery: 6.7, cultivation: 5.4, livestock: 4.1, sedentism: 2.6, landscape: 0.8 } },
  { id: 'wf', name: 'West Africa', crop: 'pearl millet', ear: 'millet', from: '4,500', dots: [4.29, 3.33], light: [3.33, 2.84], dark: [2.84, 1.43],
    at: { pottery: 10.0, livestock: 5.0, cultivation: 3.2, sedentism: 2.4, landscape: 1.0 } },
];
for (const r of ROWS) r.order = Object.keys(r.at).sort((a, b) => r.at[b] - r.at[a]);

/** What a chip says over the ordered rows, counted from the data so it cannot drift. */
function readingFor(id) {
  const n = ROWS.filter((r) => r.order[0] === id).length;
  const last = ROWS.filter((r) => r.order[4] === id).length;
  const name = SIGNS[id].label;
  if (n) return `${name}: first in ${n === 1 ? '1 row' : `${n} rows`}`;
  if (last) return `${name}: last in ${last === 1 ? '1 row' : `${last} rows`}`;
  return `${name}: never first, never last`;
}

const READING = [
  'Six rows, six different start times',
  'One row: West Asia',
  'About 8,000 years, first row to last',
  'Each row, its own plant',
  'Wheat and barley: probably from West Asia',
  'Tap a sign: where does it sit in each row?',
  'Still in use today?',
];

const TODAY = [
  { name: 'cattle', art: () => cowArt() }, { name: 'sheep', art: () => sheepArt() }, { name: 'pigs', art: () => pigArt() },
  { name: 'brick house', art: () => brickHouseArt() }, { name: 'thatched hut', art: () => hutArt() }, { name: 'clay pot', art: () => potArt() },
];

export class GlobalFarmingTimelineScene extends SvgScene {
  static simId = 'global-farming-timeline-scene';
  static BEAT_STEP_MAP = MAP;
  static CONTROLS = [];
  static HEIGHT = 560;
  static ARIA_LABEL = 'The chart of the move to farming, redrawn from the textbook. Six rows, for West Asia, north China, south China, the Ganga plains, India and West Africa, on a time axis from 15,000 years ago to today. Each row has a dotted line of early traces, a bar of cultivation and a bar of domesticated crops. Five signs are marked in each row: pottery, cultivation, livestock, sedentism and farmed land. The signs come in a different order in different rows.';

  tl = tapLight({ label: 'Signs of farming', chips: CHIPS, onChange: (lit, chip) => this._onChip(chip) });

  constructor(container, config) {
    super(container, config);
    this._fresh = true;
    this._found = false;
  }

  async setup() {
    await super.setup();
    this.tl.mount(this.root, this);
  }

  destroy() { this.tl.destroy(); super.destroy(); }

  css() {
    return `
.gf-row { animation: gf-in 0.5s var(--look-spring-soft, ease-out) both; animation-delay: var(--d, 0s); }
@keyframes gf-in { from { opacity: 0; transform: translateX(-18px); } to { opacity: 1; transform: none; } }
.gf-move { animation: gf-move 0.7s cubic-bezier(.3,1.2,.4,1) both; animation-delay: var(--d, 0s); }
@keyframes gf-move { from { transform: translate(var(--fx), 0); } to { transform: none; } }
.gf-pop { animation: gf-pop 0.45s var(--look-spring-soft, ease-out) both; animation-delay: var(--d, 0s); transform-box: fill-box; transform-origin: center; }
@keyframes gf-pop { from { opacity: 0; transform: scale(0.6); } to { opacity: 1; transform: none; } }
.svs[data-step="0"] .tl-row, .svs[data-step="6"] .tl-row { visibility: hidden; height: 0; min-height: 0; overflow: hidden; margin: 0; padding: 0; }
`;
  }

  enter(step) {
    this._fresh = true;
    this.tl.set({ lit: null, disabled: step === 0 || step === 6 });
  }

  _onChip(chip) {
    if (this.stepIndex === 5 && chip?.id === 'pottery' && !this._found) {
      this._found = true;
      const st = this.sv;
      this.celebrate(st.W / 2, st.H - 30);
    }
    this.repaint();
  }

  stageHeight(st) { return st.portrait ? 500 : 408; }

  _layout(st) {
    const P = st.portrait;
    const left = P ? 10 : 126, right = st.W - (P ? 14 : 14);
    const top = 40, rowH = P ? 67 : 53;
    const x = (k) => left + ((15 - k) / 15) * (right - left);
    return { P, left, right, top, rowH, x, sign: P ? 13 : 15, cols: (i) => left + (i + 0.5) * ((right - left) / 5) };
  }

  _badge(id, r, opacity) {
    const t = SIGNS[id].tone, col = `var(--sim-series-${t})`, ink = 'var(--sim-bg-surface)';
    return `<g style="opacity:${opacity}">${cushionCircle(0, 0, r, col, { gloss: false })}${at(0, 0, r / 27, signGlyph(id, ink))}</g>`;
  }

  /** A row's signs at their true times; lanes keep neighbours from covering each other. */
  _lanes(row, L) {
    const gap = L.sign * 2 + 2;
    const out = {}; let lastX = -99, lane = 0;
    for (const id of row.order) {
      const px = L.x(row.at[id]);
      lane = px - lastX < gap ? 1 - lane : 0;
      out[id] = { x: px, lane };
      lastX = px;
    }
    return out;
  }

  _rows(st, L) {
    const step = this.stepIndex, fresh = this._fresh, lit = this.tl.any();
    const byOrder = step === 5;
    let s = '';
    ROWS.forEach((row, i) => {
      const y = L.top + i * L.rowH, h = L.rowH;
      const focus = step === 1 || step === 4 ? row.id === 'wa' : true;
      const dim = focus ? 1 : step === 1 ? 0.14 : 0.32;
      const band = i % 2 ? 'color-mix(in srgb, var(--sim-label) 5%, transparent)' : 'transparent';
      let r = `<rect x="0" y="${y}" width="${st.W}" height="${h}" rx="10" ${fill(band)}/>`;
      const barY = y + h - (L.P ? 9 : 10);
      const nameX = L.P ? L.left + 2 : 8, nameY = L.P ? y + 15 : y + h / 2 - 2;
      r += text(nameX, nameY, row.name, { anchor: 'start', size: L.P ? 15 : 16, weight: 600, display: true, opacity: dim });
      r += L.P ? text(nameX + (row.name.length * 8.4) + 6, nameY, row.crop, { anchor: "start", size: 14, col: 'var(--sim-label-muted)', opacity: dim })
        : text(nameX, nameY + 17, row.crop, { anchor: "start", size: 14, col: 'var(--sim-label-muted)', opacity: dim });
      if (!byOrder) {
        const bar = dim * (step === 3 ? 0.45 : 1);
        const dx0 = L.x(row.dots[0]), dx1 = L.x(row.dots[1]);
        r += `<path d="M${dx0} ${barY} H${dx1}" style="fill:none;stroke:var(--sim-series-5);stroke-width:5;stroke-dasharray:6 6;opacity:${bar}"/>`;
        if (row.light) r += `<rect x="${L.x(row.light[0])}" y="${barY - 4}" width="${L.x(row.light[1]) - L.x(row.light[0])}" height="8" rx="3" ${fill('color-mix(in srgb, var(--sim-series-3) 62%, var(--sim-bg-surface))', `opacity:${bar}`)}/>`;
        r += `<rect x="${L.x(row.dark[0])}" y="${barY - 5}" width="${L.x(row.dark[1]) - L.x(row.dark[0])}" height="10" rx="3" ${fill(shade('var(--sim-series-3)', 55), `opacity:${bar}`)}/>`;
      }
      if (step === 2) {
        const sx = L.x(row.dots[0]);
        r += `<circle cx="${sx}" cy="${barY}" r="7" ${fill('var(--sim-accent)', 'stroke:var(--sim-bg-surface);stroke-width:2')}/>`;
        r += text(sx, barY - 13, row.from, { size: L.P ? 15 : 16, weight: 600, display: true, halo: 4 });
      }
      if (step === 3) {
        const cx = (L.x(row.dots[0]) + L.x(row.dark[1])) / 2;
        const cy = y + (L.P ? 36 : h / 2 - 2);
        r += at(Math.min(L.right - 60, Math.max(L.left + 30, cx)) - 44, cy, 0.42, earArt(row.ear, GRAIN));
        r += text(Math.min(L.right - 60, Math.max(L.left + 30, cx)) - 22, cy + 6, row.crop, { anchor: 'start', size: 16, weight: 600, display: true, halo: 4 });
      }
      if (step !== 3 && step <= 5) {
        const pos = this._lanes(row, L);
        row.order.forEach((id, n) => {
          const tx = pos[id].x, ty = y + (L.P ? 34 : h / 2 - 7);
          const shownX = byOrder ? L.cols(n) : tx;
          const laneY = byOrder ? ty : ty + (pos[id].lane ? 7 : -5);
          let op = 1;
          if (lit) op = this.tl.has(id) ? 1 : 0.14;
          else if (step === 1) op = row.id === 'wa' ? 1 : 0;
          else if (step === 0) op = 0.26;
          else if (step === 2 || step === 4) op = 0.3 * dim + 0.05;
          const big = this.tl.has(id) ? 1.14 : 1;
          const move = byOrder && fresh ? ` class="gf-move" style="--fx:${(tx - shownX).toFixed(1)}px;--d:${(i * 0.06).toFixed(2)}s"` : '';
          r += `<g${move}>${at(shownX, laneY, big, this._badge(id, L.sign, op))}</g>`;
        });
      }
      s += `<g${fresh && step === 0 ? ` class="gf-row" style="--d:${(i * 0.09).toFixed(2)}s"` : ''}>${r}</g>`;
    });
    return s;
  }

  _axis(st, L) {
    const step = this.stepIndex;
    if (step === 5) return ORD.map((o, i) => text(L.cols(i), 24, o, { size: 17, weight: 600, display: true })).join('');
    let s = `<rect x="${L.left}" y="27" width="${L.right - L.left}" height="6" rx="3" ${fill('var(--sim-track)')}/>`;
    for (const k of [15, 10, 5, 0]) {
      s += `<rect x="${L.x(k) - 1.5}" y="24" width="3" height="12" ${fill('var(--sim-label-muted)')}/>`;
      const lb = k === 15 ? (L.P ? '15,000' : '15,000 years ago') : k === 0 ? 'today' : k === 5 && L.P ? '5,000 years ago' : `${k},000`;
      s += text(L.x(k), 18, lb, { size: 14, anchor: k === 15 ? 'start' : k === 0 ? 'end' : 'middle', col: 'var(--sim-label-muted)' });
    }
    return s;
  }

  _callouts(st, L) {
    const step = this.stepIndex;
    let s = '';
    const y0 = L.top, h = L.rowH, barY = y0 + h - (L.P ? 9 : 10);
    if (step === 1) {
      const wa = ROWS[0], k = L.P ? 14 : 15;
      const yL = L.top + L.rowH + 26, xs = [L.x(wa.dots[0]), L.x((wa.light[0] + wa.light[1]) / 2), L.x((wa.dark[0] + wa.dark[1]) / 2)];
      const labs = [['early traces', 'about 12,500'], ['cultivation', ''], ['domesticated crops', 'about 9,500']];
      const lx = L.P ? [L.left + 48, L.left + 136, L.left + 252] : [xs[0] - 50, xs[1] + 14, xs[2] + 116];
      labs.forEach(([a, b], i) => {
        s += `<path d="M${xs[i]} ${barY + 6} L${lx[i]} ${yL - 8}" ${stroke('var(--sim-label)', 2.5)}/>`;
        s += text(lx[i], yL + 8, a, { size: k + 1, weight: 600, display: true, halo: 4 });
        if (b) s += text(lx[i], yL + 27, b, { size: k, halo: 4, col: 'var(--sim-label-muted)' });
      });
    }
    if (step === 2) {
      const a = L.x(12.5), b = L.x(4.5), y = L.top + 6 * L.rowH + 8;
      s += `<path d="M${a} ${y - 6} V${y + 6} M${a} ${y} H${b} M${b} ${y - 6} V${y + 6}" ${stroke('var(--sim-accent)', 4)}/>`;
    }
    if (step === 4) {
      const x = L.x(9), y1 = barY + 8, yr = L.top + 3 * L.rowH + 22;
      s += `<path d="M${x} ${y1} V${yr - 34}" style="fill:none;stroke:var(--sim-accent);stroke-width:4;stroke-dasharray:9 7"/>`;
      s += `<path d="M${x - 9} ${yr - 40} L${x} ${yr - 26} L${x + 9} ${yr - 40} Z" ${fill('var(--sim-accent)')}/>`;
      const w = L.P ? 200 : 236, bx = Math.min(st.W - w - 6, Math.max(6, x - 40));
      s += `<g class="${this._fresh ? 'gf-pop' : ''}">${cushionRect(bx, yr - 24, w, 62, 12, 'var(--sim-bg-surface)')}`
        + `<rect x="${bx}" y="${yr - 24}" width="${w}" height="62" rx="12" ${stroke('var(--sim-accent)', 3)}/>`
        + at(bx + 28, yr + 7, 0.5, earArt('wheat', GRAIN))
        + text(bx + 56, yr, 'Mehrgarh', { anchor: 'start', size: 18, weight: 600, display: true })
        + text(bx + 56, yr + 22, 'about 9,000 years ago', { anchor: 'start', size: 14 })
        + '</g>';
    }
    return s;
  }

  _today(st) {
    const cols = st.portrait ? 2 : 3, rows = st.portrait ? 3 : 2;
    const cw = (st.W - 16) / cols, ch = (st.H - 60) / rows, s0 = Math.min(cw, ch) / 118;
    return TODAY.map((t, i) => {
      const x = 8 + (i % cols) * cw + cw / 2, y = 8 + Math.floor(i / cols) * ch + ch / 2 - 12;
      const w = cw - 12, h = ch - 10;
      return `<g class="${this._fresh ? 'gf-pop' : ''}" style="--d:${(i * 0.08).toFixed(2)}s">${cushionRect(x - w / 2, y - h / 2 + 4, w, h, 14, 'var(--sim-panel)')}${at(x, y - 8, s0, t.art())}${text(x, y + h / 2 - 8, t.name, { size: 16, weight: 600, display: true })}</g>`;
    }).join('');
  }

  paint(st) {
    const L = this._layout(st), step = this.stepIndex;
    const on = this.tl.chip();
    const reading = step === 5 && on ? readingFor(on.id) : READING[step];
    const yR = st.H - 8;
    let svg;
    if (step === 6) svg = this._today(st) + text(st.W / 2, yR, reading, { size: 19, weight: 600, display: true });
    else svg = this._axis(st, L) + this._rows(st, L) + this._callouts(st, L) + text(st.W / 2, yR, reading, { size: st.portrait ? 17 : 19, weight: 600, display: true, col: step === 5 && on ? 'var(--sim-accent)' : 'var(--sim-label)' });
    this._fresh = false;
    return { svg, over: '' };
  }
}
