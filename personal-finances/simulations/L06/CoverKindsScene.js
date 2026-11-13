/**
 * CoverKindsScene - L06 s03 "Three Kinds of Insurance" (3 beats). SvgScene, design 560 x 490 landscape,
 * 390 x 620 portrait. Three tabs on top (health, life, general); the beat's tab is lit.
 *   b0 health: a hospital card with four cover lines (hospital stay, medicines, tests, treatment) that tick in;
 *      a chip "Ayushman Bharat PM-JAY: for eligible low-income households".
 *   b1 life: the earner (dimmed, "if the earner dies") and the family; "life insurance pays the family";
 *      three uses: daily expenses, school, loans.
 *   b2 general: four tiles, motor (scooter), property (house, shop), crop (field), cattle (cow). Each tile
 *      opens its loss line in turn on entry; tap a tile to close or open it. Rest: all four open.
 * The scooter (SimVehicles) and the cow (SimAnimal) are canvas art, painted into sized canvases in the
 * overlay after each repaint (the same bridge FinPeople uses for people).
 * Tokens only. ASCII only.
 */
import { SvgScene, stroke, fill, shade } from 'simulations/base/kit/SimSvg.js';
import { iconSvg } from 'simulations/base/kit/SimIcons.js';
import { loadColors } from 'simulations/base/kit/SimLook.js';
import { drawScooter } from 'simulations/base/kit/SimVehicles.js';
import { drawAnimal, animalLook } from 'simulations/base/kit/SimAnimal.js';
import { MONEY_CSS } from '../shared/MoneyKit.js';
import { PEOPLE_CSS, personSlot, paintPeople, registerCast } from '../shared/FinPeople.js';

registerCast('l06earner', { name: 'Earner', series: 7, role: 'adult', i: 21,
  look: { outfit: 'shirt', hairStyle: 'short', top: 's7', bottom: 'denim', shoeStyle: 'shoe', shoe: 'brown', pattern: 'plain', moustache: true, dupatta: false, glasses: false, girth: 1.05 } });
registerCast('l06girl', { name: 'Daughter', series: 4, role: 'child', i: 22,
  look: { outfit: 'kurti', hairStyle: 'braid', top: 's4', bottom: 'cream', dupatta: false, trim: 'cream', shoeStyle: 'sandal', shoe: 'brown', pattern: 'plain', moustache: false, glasses: false, girth: 1 } });

const f1 = (v) => (+v).toFixed(1);
const MAIN = [[{ idx: 0, dwellMs: null }], [{ idx: 1, dwellMs: null }], [{ idx: 2, dwellMs: null }]];
const INK = 'var(--sim-label)', MUTED = 'var(--sim-label-muted)', ACC = 'var(--sim-accent)', ACC_INK = shade('var(--sim-accent)', 62);
const GOOD_INK = 'color-mix(in oklab, var(--sim-series-3) 55%, var(--sim-label))';
const TABS = ['health', 'life', 'general'];
const HEALTH = ['hospital stay', 'medicines', 'tests', 'treatment'];
const USES = [['pot', 'daily expenses'], ['school', 'school'], ['coin', 'loans']];
const TILES = [
  { key: 'motor', name: 'motor', L: ['repairs after', 'an accident'], P: ['repairs after', 'an accident'] },
  { key: 'property', name: 'property', L: ['fire, theft,', 'flood, earthquake'], P: ['fire, theft,', 'flood,', 'earthquake'] },
  { key: 'crop', name: 'crop', L: ['disasters, pests,', 'a fall in prices'], P: ['disasters,', 'pests,', 'price fall'] },
  { key: 'cattle', name: 'cattle', L: ['death or', 'disability'], P: ['death or', 'disability'] },
];

const CSS = `
.ck-ab { position: absolute; transform: translate(-50%, -50%); }
.ck-btn { min-height: 46px; padding: 5px 16px; cursor: pointer; white-space: nowrap;
  border-radius: calc(12px * var(--look-radius, 1)); font: 800 19px/1.1 var(--sim-font); background: var(--sim-bg-surface); color: var(--sim-label);
  border: 2.5px solid var(--sim-stroke); box-shadow: 0 calc(3px * var(--look-lip, 1)) 0 var(--sim-stroke); }
.ck-btn:active { transform: translateY(3px); box-shadow: none; }
.ck-btn:focus-visible, .ck-tile:focus-visible { outline: 3px solid var(--sim-accent); outline-offset: 3px; }
.ck-tile { position: absolute; background: transparent; border: 0; padding: 0; margin: 0; cursor: pointer; border-radius: 16px; }
.ck-art { position: absolute; pointer-events: none; }
.ck-art canvas { display: block; width: 100%; height: 100%; }
`;

const text = (x, y, t, size, col = INK, anchor = 'middle', w = 800) =>
  `<text x="${f1(x)}" y="${f1(y)}" text-anchor="${anchor}" style="fill:${col};font:${w} ${size}px var(--sim-font)">${t}</text>`;
const panel = (x, y, w, h, o = {}) => `<rect x="${f1(x)}" y="${f1(y + 4)}" width="${f1(w)}" height="${f1(h)}" rx="14" ${fill('var(--sim-stroke)')}/>`
  + `<rect x="${f1(x)}" y="${f1(y)}" width="${f1(w)}" height="${f1(h)}" rx="14" ${fill(o.bg ?? 'var(--sim-bg-surface)', `stroke:${o.edge ?? 'var(--sim-stroke)'};stroke-width:${o.sw ?? 2.5}`)}/>`;
const icon = (name, x, y, s, tone) => `<g transform="translate(${f1(x - s / 2)} ${f1(y - s / 2)}) scale(${f1(s / 48)})">${iconSvg(name, tone)}</g>`;
const calm = () => !!globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
/** A canvas slot in the overlay for kit canvas art: kind 'scooter' | 'cow'; (x, y) ground centre. */
const artSlot = (kind, x, y, w, h) => `<div class="ck-art" style="left:${f1(x - w / 2)}px;top:${f1(y - h)}px;width:${w}px;height:${h}px">`
  + `<canvas data-ck="${kind}" data-w="${w}" data-h="${h}" width="${w}" height="${h}"></canvas></div>`;

export class CoverKindsScene extends SvgScene {
  static WIDTH = 560;
  static PORTRAIT_WIDTH = 390;
  static HEIGHT = 490;
  static PORTRAIT_HEIGHT = 620;
  static CONTINUOUS = false;
  static BEAT_STEP_MAP = MAIN;
  static BEAT_MAPS = { 3: MAIN };
  static CONTROLS = [];
  static ARIA_LABEL = 'Three kinds of insurance. Health insurance covers hospital stays, medicines, tests and treatment; Ayushman Bharat PM-JAY gives it to eligible low-income households. Life insurance pays the family if the person who earns for it dies, for daily expenses, school and loans. General insurance: motor (repairs after an accident), property (fire, theft, flood, earthquake), crop (disasters, pests, a fall in prices) and cattle (death or disability of farm animals). Tap a tile to open or close its line.';

  async setup() {
    this.fresh = false;
    this.open = new Set(TILES.map((t) => t.key));
    await super.setup();
    this._onClick = (e) => {
      const b = e.target?.closest?.('[data-act]');
      const a = b?.dataset.act;
      if (a === 'replay') this.run();
      else if (a === 'tile') {
        const k = b.dataset.val;
        if (this.open.has(k)) this.open.delete(k); else this.open.add(k);
        this.repaint();
      }
    };
    this.root.addEventListener('click', this._onClick);
  }

  destroy() {
    this.root?.removeEventListener('click', this._onClick);
    super.destroy();
  }

  css() { return MONEY_CSS + PEOPLE_CSS + CSS; }

  clear() { for (const t of (this._timers ?? []).splice(0)) clearTimeout(t); this.fresh = false; }

  enter() { this.clear(); this.open = new Set(TILES.map((t) => t.key)); this.after(0.05, () => this.run()); }

  run() {
    this.clear();
    this.open = new Set(TILES.map((t) => t.key));
    if (calm()) { this.repaint(); return; }
    this.fresh = true;
    if (this.stepIndex === 2) {
      this.open = new Set();
      TILES.forEach((t, i) => this.after(0.5 + i * 0.6, () => { this.open.add(t.key); this.lastOpen = t.key; this.repaint(); }));
      this.after(0.5 + TILES.length * 0.6, () => { this.fresh = false; this.repaint(); });
    } else {
      this.after(2.4, () => { this.fresh = false; this.repaint(); });
    }
    this.repaint();
  }

  skip() {
    if (!this.fresh) return false;
    this.clear();
    this.open = new Set(TILES.map((t) => t.key));
    this.repaint();
    return true;
  }

  busy() { return this.fresh; }

  stageHeight(st) { return Math.round((st.portrait ? 620 : 490) * st.W / (st.portrait ? 390 : 560)); }

  repaint() { super.repaint(); paintPeople(this); this.paintArt(); }

  /** Paint the scooter and cow canvases (kit canvas art) after each render. */
  paintArt() {
    const wrap = this.sv?.wrap;
    if (!wrap) return;
    let c;
    try { c = loadColors(this.root); } catch (_) { return; }
    const dpr = Math.min(3, ((typeof window !== 'undefined' && window.devicePixelRatio) || 1) * 1.5);
    for (const el of wrap.querySelectorAll('canvas[data-ck]')) {
      const w = parseFloat(el.dataset.w), h = parseFloat(el.dataset.h);
      el.width = Math.round(w * dpr); el.height = Math.round(h * dpr);
      const ctx = el.getContext('2d');
      if (!ctx) continue;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      try {
        if (el.dataset.ck === 'scooter') drawScooter(ctx, c, { x: w / 2, y: h - 8, length: w * 0.82, tone: 4 });
        else drawAnimal(ctx, c, { x: w / 2, y: h - 8, length: w * 0.62, facing: 1, kind: 'cow', pose: 'stand' }, animalLook(c, 'cow', { mark: 'patches', mood: 'smile' }));
      } catch (_) { /* a bad spec draws nothing rather than breaking the scene */ }
    }
  }

  anim(cls, d, body, extra = '') { return `<g${this.fresh ? ` class="${cls}" style="--d:${d}s;${extra}"` : ''}>${body}</g>`; }

  paint(st) {
    const P = st.portrait, DW = P ? 390 : 560, DH = P ? 620 : 490, k = (st.W / DW).toFixed(4);
    const v = this.stepIndex;
    let svg = this.tabs(P, v), over = '';
    const out = v === 0 ? this.paintHealth(P) : v === 1 ? this.paintLife(P) : this.paintGeneral(P);
    svg += out.svg; over += out.over ?? '';
    if (!this.fresh && v !== 2) over += `<div class="ck-ab" style="left:${P ? 330 : 510}px;top:${P ? 590 : v === 1 ? 368 : 458}px"><button type="button" class="sv-hit ck-btn" data-act="replay">replay</button></div>`;
    return { svg: `<g transform="scale(${k})">${svg}</g>`, over: `<div style="position:absolute;left:0;top:0;width:${DW}px;height:${DH}px;transform:scale(${k});transform-origin:0 0">${over}</div>` };
  }

  tabs(P, v) {
    let svg = '';
    const w = P ? 112 : 150, gap = P ? 9 : 20, x0 = (P ? 390 : 560) / 2 - (3 * w + 2 * gap) / 2;
    TABS.forEach((t, i) => {
      const x = x0 + i * (w + gap), on = i === v;
      svg += `<rect x="${f1(x)}" y="10" width="${w}" height="42" rx="21" ${fill(on ? ACC : 'var(--sim-bg-surface)', `stroke:${on ? ACC_INK : 'var(--sim-stroke)'};stroke-width:2.5;${on ? '' : 'opacity:0.55'}`)}/>`;
      svg += text(x + w / 2, 38, t, 21, on ? 'var(--sim-bg-deep)' : MUTED, 'middle', 800);
    });
    return svg;
  }

  paintHealth(P) {
    let svg = '';
    const C = P ? { x: 16, y: 66, w: 358, h: 340 } : { x: 24, y: 66, w: 512, h: 300 };
    svg += panel(C.x, C.y, C.w, C.h, { edge: 'var(--sim-bad)', sw: 3 });
    if (P) {
      svg += icon('hospital', 74, 130, 92, 'var(--sim-bad)');
      svg += text(134, 122, 'health', 28, INK, 'start') + text(134, 154, 'insurance', 28, INK, 'start');
    } else {
      svg += icon('hospital', 118, 190, 140, 'var(--sim-bad)');
      svg += text(220, 112, 'health insurance', 30, INK, 'start');
    }
    HEALTH.forEach((h, i) => {
      const x = P ? 44 : 236, y = P ? 214 + i * 46 : 182 + i * 46;
      svg += this.anim('mk-pop', (0.3 + i * 0.4).toFixed(1), icon('check', x, y - 9, 34, 'var(--sim-series-3)') + text(x + 28, y, h, P ? 25 : 26, INK, 'start'));
    });
    if (!P) svg += text(118, 300, 'bills paid', 22, GOOD_INK);
    // PM-JAY chip
    const Y = P ? 424 : 382, W = P ? 358 : 400, X = P ? 16 : 24, H = P ? 128 : 66;
    svg += this.anim('mk-pop', 2.0, `<rect x="${X}" y="${Y}" width="${W}" height="${H}" rx="18" ${fill('color-mix(in oklab, var(--sim-accent) 16%, var(--sim-bg-surface))', 'stroke:var(--sim-accent);stroke-width:3')}/>`
      + icon('family', X + 38, Y + (P ? 40 : 33), 46, 'var(--sim-series-6)')
      + (P ? text(X + 72, Y + 36, 'Ayushman Bharat', 23, INK, 'start') + text(X + 72, Y + 64, 'PM-JAY', 23, ACC_INK, 'start')
        + text(X + 20, Y + 98, 'for eligible low-income', 20, MUTED, 'start', 700) + text(X + 20, Y + 120, 'households', 20, MUTED, 'start', 700)
        : text(X + 72, Y + 28, 'Ayushman Bharat PM-JAY', 22, INK, 'start') + text(X + 72, Y + 54, 'for eligible low-income households', 19, MUTED, 'start', 700)));
    return { svg };
  }

  paintLife(P) {
    let svg = '', over = '';
    const G = P ? { feet: 236, hE: 150, hM: 140, hK: 104, xE: 58, xM: 236, xK1: 296, xK2: 348, bag: [148, 120], lab: 272, pay: 316 }
      : { feet: 292, hE: 190, hM: 176, hK: 132, xE: 80, xM: 360, xK1: 434, xK2: 498, bag: [212, 150], lab: 330, pay: 372 };
    over += personSlot('l06earner', { x: G.xE, y: G.feet, h: G.hE, mood: 'smile', dim: true });
    over += personSlot('mother', { x: G.xM, y: G.feet, h: G.hM, mood: 'think', cls: this.fresh ? 'mpp-pop' : '', style: '--d:0.2s' });
    over += personSlot('l06girl', { x: G.xK1, y: G.feet, h: G.hK, mood: 'think', cls: this.fresh ? 'mpp-pop' : '', style: '--d:0.35s' });
    over += personSlot('brother', { x: G.xK2, y: G.feet, h: G.hK * 0.92, mood: 'think', cls: this.fresh ? 'mpp-pop' : '', style: '--d:0.5s' });
    svg += `<path d="M${G.xE - 36} ${G.feet + 6}H${G.xE + 36}" ${stroke(MUTED, 2.5, 'stroke-dasharray:6 5')}/>`;
    svg += P ? text(G.xE, G.lab, 'the earner', 20, MUTED, 'middle', 700)
      : text(G.xE, G.lab, 'if the earner', 20, MUTED, 'middle', 700) + text(G.xE, G.lab + 24, 'dies', 20, MUTED, 'middle', 700);
    svg += text(P ? 300 : (G.xM + G.xK2) / 2, G.lab, 'the family', 22, INK);
    // the payment: insurance -> family
    const [bx, by] = G.bag;
    svg += this.anim('mk-pop', 0.7, icon('money-bag', bx, by, P ? 70 : 90, 'var(--sim-series-2)'));
    svg += this.anim('mk-pop', 1.0, `<path d="M${bx + (P ? 30 : 40)} ${by + 4}L${G.xM - (P ? 40 : 48)} ${by + 4}M${G.xM - (P ? 52 : 60)} ${by - 6}L${G.xM - (P ? 40 : 48)} ${by + 4}L${G.xM - (P ? 52 : 60)} ${by + 14}" ${stroke(ACC, 4, 'fill:none;stroke-linecap:round;stroke-linejoin:round')}/>`);
    svg += this.anim('mk-pop', 1.1, text(P ? 195 : 272, G.pay, 'life insurance pays the family', P ? 22 : 24, ACC_INK));
    // three uses
    USES.forEach(([ic, label], i) => {
      const d = (1.4 + i * 0.3).toFixed(1);
      if (P) {
        const y = 340 + i * 66;
        svg += this.anim('mk-pop', d, panel(40, y, 310, 54) + icon(ic, 76, y + 27, 40, 6) + text(106, y + 35, label, 23, INK, 'start'));
      } else {
        const x = 24 + i * 174;
        svg += this.anim('mk-pop', d, panel(x, 398, 164, 76) + icon(ic, x + 30, 436, 38, 6) + (label === 'daily expenses'
          ? text(x + 58, 430, 'daily', 22, INK, 'start') + text(x + 58, 456, 'expenses', 22, INK, 'start') : text(x + 58, 444, label, 23, INK, 'start')));
      }
    });
    return { svg, over };
  }

  paintGeneral(P) {
    let svg = '', over = '';
    const W = P ? 173 : 250, H = P ? 258 : 200, xs = P ? [16, 201] : [24, 286], ys = P ? [64, 334] : [64, 278];
    TILES.forEach((t, i) => {
      const x = xs[i % 2], y = ys[Math.floor(i / 2)], open = this.open.has(t.key), cx = x + W / 2;
      svg += panel(x, y, W, H, { edge: open ? ACC : 'var(--sim-stroke)', sw: open ? 3.5 : 2.5 });
      const py = y + (P ? 100 : 96);   // the picture's ground
      if (t.key === 'motor') over += artSlot('scooter', cx, py, P ? 140 : 160, P ? 96 : 92);
      else if (t.key === 'cattle') over += artSlot('cow', cx, py, P ? 150 : 170, P ? 92 : 90);
      else if (t.key === 'property') svg += icon('house', cx - (P ? 34 : 40), py - 38, P ? 70 : 78, 7) + icon('shop', cx + (P ? 36 : 42), py - 38, P ? 70 : 78, 4);
      else svg += icon('field', cx - (P ? 28 : 34), py - 40, P ? 76 : 82, 3) + icon('grain', cx + (P ? 44 : 54), py - 34, P ? 50 : 56, 2);
      svg += text(cx, y + (P ? 136 : 132), t.name, P ? 25 : 26, INK);
      const lines = P ? t.P : t.L;
      if (open) {
        const pop = this.fresh && this.lastOpen === t.key;
        lines.forEach((ln, j) => { const tx = text(cx, y + (P ? 168 : 162) + j * (P ? 26 : 26), ln, P ? 20 : 21, ACC_INK, 'middle', 800); svg += pop ? `<g class="mk-pop">${tx}</g>` : tx; });
      } else {
        svg += text(cx, y + (P ? 176 : 170), 'tap to see', 19, MUTED, 'middle', 700);
      }
      over += `<button type="button" class="sv-hit ck-tile" data-act="tile" data-val="${t.key}" aria-pressed="${open}" aria-label="${t.name} insurance: ${(P ? t.P : t.L).join(' ')}" style="left:${x}px;top:${y}px;width:${W}px;height:${H}px"></button>`;
    });
    return { svg, over };
  }

  testState() {
    return { view: this.stepIndex, fresh: this.fresh, open: [...this.open] };
  }
}
