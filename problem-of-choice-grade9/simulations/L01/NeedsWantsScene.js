/**
 * NeedsWantsScene - L01 s02 "Needs and Wants" (3 beats). Two shelves, stacked: needs on top, wants under it.
 *   b0 needs:   the needs shelf fills, one thing at a time: food, clean water, shelter, clothing. The wants
 *               shelf is an empty, dimmed outline.
 *   b1 wants:   the wants shelf fills: a new phone, a video game, a water-park trip. The needs shelf dims.
 *   b2 context: one bicycle, and its job is a switch inside the figure ("ride to school" / "weekend fun").
 *               The bicycle moves to the needs shelf or the wants shelf when its job changes; its label is
 *               its job. Rest (cold start): ride to school, on the needs shelf; "weekend fun" pulses until
 *               the first tap. Named cases: the two jobs.
 * Drawn in stage px (st.W wide): landscape one row per shelf, portrait three columns. Colours are tokens
 * only. ASCII only.
 */
import { SvgScene, fill } from 'simulations/base/kit/SimSvg.js';
import { iconSvg } from 'simulations/base/kit/SimIcons.js';
import { civicSvg } from 'simulations/base/kit/SimCivic.js';

const MAP = [[{ idx: 0, dwellMs: null }], [{ idx: 1, dwellMs: null }], [{ idx: 2, dwellMs: null }]];
const NEEDS = [
  { id: 'food', name: 'food', art: ['icon', 'pot', 6] },
  { id: 'water', name: 'clean water', art: ['icon', 'glass', 'var(--sim-water)'] },
  { id: 'shelter', name: 'shelter', art: ['icon', 'house', 8] },
  { id: 'clothing', name: 'clothing', art: ['civic', 'uniform'] },
];
const WANTS = [
  { id: 'phone', name: 'new phone', art: ['civic', 'phone'] },
  { id: 'game', name: 'video game', art: ['pad'] },
  { id: 'park', name: 'water park', art: ['icon', 'ticket', 2] },
];
const JOBS = { school: 'ride to school', fun: 'weekend fun' };
const SHELF = { needs: 'var(--sim-series-3)', wants: 'var(--sim-series-5)' };
const MOVE_S = 0.7;
const f1 = (v) => (+v).toFixed(1);

const CSS = `
.nw-btn { position: absolute; transform: translate(-50%, -50%); min-height: 44px; padding: 6px 16px; cursor: pointer; white-space: nowrap;
  border-radius: calc(12px * var(--look-radius, 1)); font: 800 19px/1.1 var(--sim-font); background: var(--sim-bg-surface); color: var(--sim-label);
  border: 2.5px solid var(--sim-stroke); box-shadow: 0 calc(3px * var(--look-lip, 1)) 0 var(--sim-stroke); }
.nw-btn[aria-pressed="true"] { background: var(--c); color: var(--sim-bg-deep); border-color: var(--c); box-shadow: 0 calc(3px * var(--look-lip, 1)) 0 color-mix(in srgb, var(--c) 60%, var(--sim-label)); }
.nw-btn:active { transform: translate(-50%, calc(-50% + 3px)); box-shadow: none; }
.nw-btn:focus-visible { outline: 3px solid var(--sim-accent); outline-offset: 3px; }
.nw-btn.nw-pulse { animation: nw-pulse 1.3s ease-in-out infinite; }
@keyframes nw-pulse { 50% { box-shadow: 0 0 0 6px color-mix(in srgb, var(--sim-accent) 45%, transparent); } }
.nw-ask { position: absolute; transform: translate(-50%, -50%); font: 800 19px/1.2 var(--sim-font); color: var(--sim-label); white-space: nowrap; }
svg .nw-pop { transform-box: fill-box; transform-origin: center bottom; animation: nw-pop 0.45s var(--look-spring-soft, ease-out) both; animation-delay: var(--d, 0s); }
@keyframes nw-pop { 0% { transform: scale(0.3); opacity: 0; } 100% { transform: none; opacity: 1; } }
svg .nw-move { animation: nw-move ${MOVE_S}s ease-in-out both; }
@keyframes nw-move { from { transform: translate(var(--fx), var(--fy)); } to { transform: translate(0px, 0px); } }
svg .nw-dim { opacity: 0.32; transition: opacity 0.4s; }
`;

/** The art for one thing, centred on (cx, cy), about s px tall. */
function artSvg(art, cx, cy, s) {
  const [kind, name, tone] = art;
  if (kind === 'icon') {
    return iconSvg(name, tone).replace('width="48" height="48"', `x="${f1(cx - s / 2)}" y="${f1(cy - s / 2)}" width="${f1(s)}" height="${f1(s)}"`);
  }
  if (kind === 'civic') return civicSvg(name, cx, cy + s / 2, { h: name === 'uniform' ? s * 0.8 : s });
  if (kind === 'pad') {
    // A game pad: a rounded body, a cross on the left, two buttons on the right.
    const w = s * 1.15, h = s * 0.62, x = cx - w / 2, y = cy - h / 2, k = s / 60;
    return `<rect x="${f1(x)}" y="${f1(y)}" width="${f1(w)}" height="${f1(h)}" rx="${f1(h / 2)}" ${fill('var(--sim-series-7)', 'stroke:color-mix(in srgb, var(--sim-series-7) 60%, var(--sim-label));stroke-width:2.5')}/>`
      + `<rect x="${f1(cx - w * 0.3 - 4 * k)}" y="${f1(cy - 12 * k)}" width="${f1(8 * k)}" height="${f1(24 * k)}" rx="2" ${fill('var(--sim-bg-surface)')}/>`
      + `<rect x="${f1(cx - w * 0.3 - 12 * k)}" y="${f1(cy - 4 * k)}" width="${f1(24 * k)}" height="${f1(8 * k)}" rx="2" ${fill('var(--sim-bg-surface)')}/>`
      + `<circle cx="${f1(cx + w * 0.22)}" cy="${f1(cy - 5 * k)}" r="${f1(5.5 * k)}" ${fill('var(--sim-gold)')}/>`
      + `<circle cx="${f1(cx + w * 0.34)}" cy="${f1(cy + 5 * k)}" r="${f1(5.5 * k)}" ${fill('var(--sim-series-1)')}/>`;
  }
  return '';
}

/** A bicycle, side view, centred on (cx, cy), about s px tall. */
function bikeSvg(cx, cy, s) {
  const r = s * 0.3, wy = cy + s * 0.2, bx = cx - s * 0.48, fx = cx + s * 0.48;
  const pedal = { x: cx - s * 0.05, y: wy }, seat = { x: cx - s * 0.17, y: cy - s * 0.3 }, bar = { x: cx + s * 0.33, y: cy - s * 0.36 };
  const frame = 'stroke:var(--sim-series-2);stroke-width:5;stroke-linecap:round;stroke-linejoin:round;fill:none';
  const tyre = 'stroke:var(--sim-label);stroke-width:4.5;fill:none';
  const spoke = 'stroke:var(--sim-label-muted);stroke-width:1.5';
  const wheel = (x) => `<circle cx="${f1(x)}" cy="${f1(wy)}" r="${f1(r)}" style="${tyre}"/>`
    + `<path d="M${f1(x - r)} ${f1(wy)} H${f1(x + r)} M${f1(x)} ${f1(wy - r)} V${f1(wy + r)}" style="${spoke}"/>`
    + `<circle cx="${f1(x)}" cy="${f1(wy)}" r="3.5" ${fill('var(--sim-label)')}/>`;
  return wheel(bx) + wheel(fx)
    + `<path d="M${f1(bx)} ${f1(wy)} L${f1(pedal.x)} ${f1(pedal.y)} L${f1(seat.x)} ${f1(seat.y + 8)} Z M${f1(pedal.x)} ${f1(pedal.y)} L${f1(bar.x - 6)} ${f1(cy - s * 0.2)} L${f1(seat.x)} ${f1(seat.y + 8)} M${f1(bar.x - 6)} ${f1(cy - s * 0.2)} L${f1(fx)} ${f1(wy)} M${f1(bar.x - 6)} ${f1(cy - s * 0.2)} L${f1(bar.x)} ${f1(bar.y)}" style="${frame}"/>`
    + `<path d="M${f1(bar.x - 10)} ${f1(bar.y)} H${f1(bar.x + 9)}" style="stroke:var(--sim-label);stroke-width:5;stroke-linecap:round"/>`
    + `<path d="M${f1(seat.x - 12)} ${f1(seat.y + 2)} Q${f1(seat.x)} ${f1(seat.y - 6)} ${f1(seat.x + 12)} ${f1(seat.y + 2)} Z" ${fill('var(--sim-label)')}/>`
    + `<circle cx="${f1(pedal.x)}" cy="${f1(pedal.y)}" r="6" ${fill('var(--sim-bg-surface)', 'stroke:var(--sim-label);stroke-width:2.5')}/>`;
}

export class NeedsWantsScene extends SvgScene {
  static WIDTH = 560;
  static PORTRAIT_WIDTH = 390;
  static HEIGHT = 480;
  static PORTRAIT_HEIGHT = 610;
  static CONTINUOUS = false;
  static BEAT_STEP_MAP = MAP;
  static BEAT_MAPS = { 3: MAP };
  static CONTROLS = [];
  static ARIA_LABEL = 'Two shelves. The needs shelf holds food, clean water, shelter and clothing: what we must have to live. The wants shelf holds a new phone, a video game and a water-park trip: they make life more comfortable or more fun. Then one bicycle: switch its job between ride to school and weekend fun, and it moves between the needs shelf and the wants shelf.';

  async setup() {
    this.job = 'school';
    this.moved = false;
    this.fresh = 'all';
    this.from = null;
    await super.setup();
    this._onClick = (e) => {
      const b = e.target?.closest?.('[data-act]');
      if (!b || b.disabled) return;
      this.act(b.dataset.act, b.dataset.val);
    };
    this.root.addEventListener('click', this._onClick);
  }

  destroy() {
    this.root?.removeEventListener('click', this._onClick);
    super.destroy();
  }

  css() { return CSS; }

  enter() {
    this.job = 'school';
    this.moved = false;
    this.from = null;
    this.fresh = 'all';
    this.after(1.2, () => { this.fresh = null; });
  }

  act(a, v) {
    if (this.stepIndex !== 2 || a !== 'job' || !JOBS[v]) return;
    if (v !== this.job) {
      const L = this.layout(this.sv);
      this.from = this.bikeAt(L, this.job);
      this.job = v;
      this.after(MOVE_S + 0.1, () => { this.from = null; });
    }
    this.moved = true;
    this.repaint();
  }

  layout(st) {
    const P = st.portrait, W = st.W, pad = 14, cols = P ? 2 : 4, zoneW = P ? 112 : 132;
    const slotW = (W - 2 * pad - zoneW) / cols, art = P ? 46 : 76, rowH = art + (P ? 60 : 64), hd = P ? 36 : 40;
    const shelf = (y, n) => {
      const rows = Math.ceil(n / cols), h = hd + rows * rowH + 4;
      return { y, h, rows, zone: { x: W - pad - zoneW / 2, y: y + hd + (rows * rowH) / 2 - 21 },
        slot: (j) => ({ x: pad + ((j % cols) + 0.5) * slotW, y: y + hd + Math.floor(j / cols) * rowH + art / 2 + 4 }) };
    };
    const needs = shelf(8, 4);
    const wants = shelf(needs.y + needs.h + 14, 3);
    const ctrlY = wants.y + wants.h + (P ? 30 : 34);
    return { P, W, pad, cols, slotW, zoneW, art, rowH, hd, needs, wants, ctrlY };
  }

  stageHeight(st) {
    const L = this.layout(st);
    return L.ctrlY + (L.P ? 28 : 32);
  }

  /** Where the bicycle sits for a job: the zone at the right end of the needs or the wants shelf. */
  bikeAt(L, job) { return job === 'school' ? L.needs.zone : L.wants.zone; }

  /** A label under a thing; two words go on two lines. */
  labelSvg(L, text, x, y) {
    const size = L.P ? 18 : 19, words = text.split(' ');
    const st = `fill:var(--sim-label);font:800 ${size}px var(--sim-font)`;
    if (words.length < 2) return `<text x="${f1(x)}" y="${f1(y)}" text-anchor="middle" style="${st}">${text}</text>`;
    return `<text x="${f1(x)}" y="${f1(y)}" text-anchor="middle" style="${st}">${words[0]}</text>`
      + `<text x="${f1(x)}" y="${f1(y + size + 5)}" text-anchor="middle" style="${st}">${words.slice(1).join(' ')}</text>`;
  }

  shelfSvg(L, key, items, dim, zone) {
    const S = L[key], tone = SHELF[key];
    let s = `<g${dim === true ? ' class="nw-dim"' : ''}>`;
    s += `<rect x="${f1(L.pad - 6)}" y="${f1(S.y)}" width="${f1(L.W - 2 * L.pad + 12)}" height="${f1(S.h)}" rx="16" ${fill(`color-mix(in srgb, ${tone} 9%, var(--sim-bg-surface))`, `stroke:${tone};stroke-width:3`)}/>`;
    for (let r = 0; r < S.rows; r++) {
      const py = S.y + L.hd + r * L.rowH + L.art + 8;
      s += `<rect x="${f1(L.pad + 4)}" y="${f1(py)}" width="${f1(L.W - 2 * L.pad - L.zoneW - 4)}" height="7" rx="3" ${fill(`color-mix(in srgb, ${tone} 45%, var(--sim-bg-surface))`)}/>`;
    }
    s += `<rect x="${f1(L.pad + 6)}" y="${f1(S.y - 2)}" width="92" height="34" rx="10" ${fill(tone)}/>`
      + `<text x="${f1(L.pad + 52)}" y="${f1(S.y + 22)}" text-anchor="middle" style="fill:var(--sim-bg-deep);font:800 22px var(--sim-font)">${key}</text>`;
    if (zone) {
      // The bicycle's place on this shelf: empty until its job puts it here.
      const z = S.zone;
      s += `<rect x="${f1(z.x - L.zoneW / 2 + 6)}" y="${f1(z.y - L.art / 2 - 10)}" width="${f1(L.zoneW - 12)}" height="${f1(L.art + 62)}" rx="12" ${fill('none', `stroke:${tone};stroke-width:2.5;stroke-dasharray:8 6`)}/>`;
    }
    items.forEach((it, j) => {
      const p = S.slot(j), pop = this.fresh === 'all' && !dim;
      s += `<g${pop ? ` class="nw-pop" style="--d:${(0.15 + j * 0.18).toFixed(2)}s"` : dim === 'items' ? ' class="nw-dim"' : ''}>${artSvg(it.art, p.x, p.y, L.art)}`
        + this.labelSvg(L, it.name, p.x, p.y + L.art / 2 + 30) + '</g>';
    });
    return s + '</g>';
  }

  paint(st) {
    const L = this.layout(st), step = this.stepIndex;
    let svg = '', over = '';
    if (step === 0) svg += this.shelfSvg(L, 'needs', NEEDS, false) + this.shelfSvg(L, 'wants', [], true);
    else if (step === 1) svg += this.shelfSvg(L, 'needs', NEEDS, true) + this.shelfSvg(L, 'wants', WANTS, false);
    else {
      svg += this.shelfSvg(L, 'needs', NEEDS, 'items', true) + this.shelfSvg(L, 'wants', WANTS, 'items', true);
      // The bicycle in its job's slot, with its job as its label; it slides over when the job changes.
      const p = this.bikeAt(L, this.job), tone = this.job === 'school' ? SHELF.needs : SHELF.wants;
      const mv = this.from ? ` class="nw-move" style="--fx:${f1(this.from.x - p.x)}px;--fy:${f1(this.from.y - p.y)}px"` : this.fresh ? ' class="nw-pop" style="--d:0.2s"' : '';
      svg += `<g${mv}><rect x="${f1(p.x - L.zoneW / 2 + 6)}" y="${f1(p.y - L.art / 2 - 10)}" width="${f1(L.zoneW - 12)}" height="${f1(L.art + 62)}" rx="12" ${fill(`color-mix(in srgb, ${tone} 18%, var(--sim-bg-surface))`, `stroke:${tone};stroke-width:3.5`)}/>`
        + bikeSvg(p.x, p.y, L.art * (L.P ? 1.0 : 1.05))
        + `<text x="${f1(p.x)}" y="${f1(p.y + L.art / 2 + 34)}" text-anchor="middle" style="fill:var(--sim-label);font:800 ${L.P ? 18 : 19}px var(--sim-font)">bicycle</text></g>`;
      // The job switch, inside the figure under the shelves.
      const btn = (job, x) => `<button type="button" class="sv-hit nw-btn${!this.moved && job !== this.job ? ' nw-pulse' : ''}" data-act="job" data-val="${job}" aria-pressed="${job === this.job}"`
        + ` style="left:${f1(x)}px;top:${f1(L.ctrlY)}px;--c:${job === 'school' ? SHELF.needs : SHELF.wants}">${JOBS[job]}</button>`;
      if (L.P) over += btn('school', L.W * 0.27) + btn('fun', L.W * 0.74);
      else over += `<span class="nw-ask" style="left:${f1(L.W * 0.15)}px;top:${f1(L.ctrlY)}px">its job:</span>` + btn('school', L.W * 0.44) + btn('fun', L.W * 0.78);
    }
    return { svg, over };
  }

  testState() { return { step: this.stepIndex, job: this.job, shelf: this.job === 'school' ? 'needs' : 'wants' }; }
}
