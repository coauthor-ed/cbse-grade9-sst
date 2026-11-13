/**
 * EntitiesWebScene - L04 s02 "Who Takes Part" (3 beats). The book's four economic entities and the money that
 * moves between them.
 *   b0 nodes:   four players pop in at the corners: consumers (a family), producers (a factory), the government,
 *               financial institutions (a bank). Tap one: the status line says what it does.
 *   b1 flows:   four flows draw one by one, each its own tone with dots running along it: wages (producers to
 *               the families who work for them), prices (consumers to producers), taxes (consumers and producers
 *               to the government), loans (banks to producers). Chips under the board light one flow and say it.
 *   b2 economy: a dashed ring closes round all of it: "the economy". All flows run. Chips still work.
 * Colours are tokens only; the four flows use series tones so they can be told apart. ASCII only.
 */
import { SvgScene, fill } from 'simulations/base/kit/SimSvg.js';
import { iconSvg } from 'simulations/base/kit/SimIcons.js';
import { civicSvg } from 'simulations/base/kit/SimCivic.js';

const MAP = [[{ idx: 0, dwellMs: null }], [{ idx: 1, dwellMs: null }], [{ idx: 2, dwellMs: null }]];
const f1 = (v) => (+v).toFixed(1);

const NODES = [
  { id: 'cons', name: ['consumers'], say: 'Consumers buy goods and services.' },
  { id: 'prod', name: ['producers'], say: 'Producers make goods and sell them.' },
  { id: 'gov', name: ['government'], say: 'The government taxes, spends and sets rules.' },
  { id: 'bank', name: ['financial', 'institutions'], say: 'Banks keep savings and give loans.' },
];
const FLOWS = [
  { id: 'wages', tone: 2, say: 'Producers pay wages to the people who work for them.' },
  { id: 'prices', tone: 3, say: 'Consumers pay prices for the goods they buy.' },
  { id: 'taxes', tone: 5, say: 'People and firms pay taxes to the government.' },
  { id: 'loans', tone: 7, say: 'Banks give loans, for example to producers.' },
];

const CSS = `
.ew-row { position: absolute; left: 0; right: 0; transform: translateY(-50%); display: flex; justify-content: center; gap: 8px; }
.ew-btn { min-height: 44px; padding: 5px 14px; cursor: pointer; white-space: nowrap;
  border-radius: calc(12px * var(--look-radius, 1)); font: 800 18px/1.1 var(--sim-font); background: var(--sim-bg-surface); color: var(--sim-label);
  border: 2.5px solid var(--c, var(--sim-stroke)); box-shadow: 0 calc(3px * var(--look-lip, 1)) 0 var(--c, var(--sim-stroke)); }
.ew-btn:active { transform: translateY(3px); box-shadow: none; }
.ew-btn[aria-pressed="true"] { background: color-mix(in oklab, var(--c, var(--sim-accent)) 22%, var(--sim-bg-surface)); }
.ew-btn:focus-visible { outline: 3px solid var(--sim-accent); outline-offset: 3px; }
.ew-p .ew-btn { font-size: 16px; padding: 4px 10px; }
.ew-node { position: absolute; transform: translate(-50%, -50%); background: transparent; border: 0; padding: 0; cursor: pointer; border-radius: 16px; }
.ew-node:focus-visible { outline: 3px solid var(--sim-accent); outline-offset: 3px; }
.ew-say { position: absolute; left: 12px; right: 12px; transform: translateY(-50%); text-align: center; font: 800 19px/1.25 var(--sim-font); color: var(--sim-label); }
.ew-p .ew-say { font-size: 17px; }
svg .ew-pop { transform-box: fill-box; transform-origin: center; animation: ew-pop 0.45s ease-out both; animation-delay: var(--d, 0s); }
@keyframes ew-pop { 0% { transform: scale(0.5); opacity: 0; } 100% { transform: none; opacity: 1; } }
svg .ew-in { animation: ew-in 0.5s ease-out both; animation-delay: var(--d, 0s); }
@keyframes ew-in { from { opacity: 0; } to { opacity: 1; } }
svg .ew-draw { stroke-dasharray: var(--len); stroke-dashoffset: var(--len); animation: ew-draw 0.55s ease forwards; animation-delay: var(--d, 0s); }
@keyframes ew-draw { to { stroke-dashoffset: 0; } }
`;

const text = (x, y, t, size, col = 'var(--sim-label)', extra = '') =>
  `<text x="${f1(x)}" y="${f1(y)}"${/text-anchor/.test(extra) ? '' : ' text-anchor="middle"'}${extra} style="fill:${col};font:800 ${size}px var(--sim-font)">${t}</text>`;

function icon(name, cx, cy, size, tone) {
  const inner = (iconSvg(name, tone).match(/<svg[^>]*>([\s\S]*)<\/svg>/) || [])[1] || '';
  return `<g transform="translate(${f1(cx - size / 2)} ${f1(cy - size / 2)}) scale(${(size / 48).toFixed(3)})" style="--i:var(--sim-series-${tone})">${inner}</g>`;
}

const reduced = () => { try { return matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (_) { return false; } };

export class EntitiesWebScene extends SvgScene {
  static WIDTH = 560;
  static PORTRAIT_WIDTH = 390;
  static HEIGHT = 514;
  static PORTRAIT_HEIGHT = 544;
  static CONTINUOUS = false;
  static BEAT_STEP_MAP = MAP;
  static BEAT_MAPS = { 3: MAP };
  static CONTROLS = [];
  static ARIA_LABEL = 'Four economic entities: consumers, producers, the government and financial institutions such as banks. Money flows between them: producers pay wages, consumers pay prices, people and firms pay taxes, banks give loans. Together this is the economy. Tap a player or a flow to read about it.';

  async setup() {
    this.node = null;     // the tapped player (b0)
    this.flow = null;     // the lit flow, or null for all
    this.fresh = true;
    await super.setup();
    this._onClick = (e) => {
      const b = e.target?.closest?.('[data-act]');
      if (!b) return;
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
    this.node = null;
    this.flow = null;
    this.fresh = true;
    this.after(2.8, () => { this.fresh = false; });
  }

  act(a, v) {
    if (a === 'node' && NODES.some((n) => n.id === v)) { this.node = this.node === v ? null : v; this.fresh = false; this.repaint(); return; }
    if (a === 'flow' && this.stepIndex >= 1 && FLOWS.some((f) => f.id === v)) { this.flow = this.flow === v ? null : v; this.fresh = false; this.repaint(); }
  }

  layout(st) {
    const P = st.portrait, W = st.W;
    return P
      ? { P, W, cx: [W * 0.25, W * 0.75], cy: [128, 330], S: 74, fs: 19, ffs: 18, say: 446, chips: 492, H: 520 }
      : { P, W, cx: [W * 0.25, W * 0.75], cy: [112, 300], S: 88, fs: 21, ffs: 20, say: 428, chips: 466, H: 490 };
  }

  stageHeight(st) { return this.layout(st).H; }

  /** The flows' paths in stage px: [{ id, segs: [[x1, y1, x2, y2]], lab: [x, y, anchor] }]. */
  paths(L) {
    const [x0, x1] = L.cx, [y0, y1] = L.cy, h = L.S / 2, g = L.P ? 8 : 10;
    const bot0 = y0 + h + (L.P ? 34 : 36), top1 = y1 - h - g;
    return [
      { id: 'wages', segs: [[x1 - h - g, y0 - 14, x0 + h + g, y0 - 14]], lab: [(x0 + x1) / 2, y0 - 26, 'middle'] },
      { id: 'prices', segs: [[x0 + h + g, y0 + 16, x1 - h - g, y0 + 16]], lab: [(x0 + x1) / 2, y0 + 44, 'middle'] },
      { id: 'taxes', segs: [[x0, bot0, x0, top1], [x1 - h, bot0, x0 + h + g, top1]], lab: [x0 + 12, (bot0 + top1) / 2 + 7, 'start'] },
      { id: 'loans', segs: [[x1, top1, x1, bot0]], lab: [x1 + 12, (bot0 + top1) / 2 + 7, 'start'] },
    ];
  }

  paint(st) {
    const L = this.layout(st), P = L.P, W = L.W, step = this.stepIndex, fr = this.fresh;
    const anim = (cls, d) => (fr ? ` class="${cls}" style="--d:${f1(d)}s"` : '');
    let svg = '', over = '';
    // The economy ring (b2), behind everything.
    if (step === 2) {
      const top = L.cy[0] - L.S / 2 - (P ? 34 : 30), bot = L.cy[1] + L.S / 2 + (P ? 64 : 62);
      svg += `<g${anim('ew-in', 0.1)}><rect x="12" y="${f1(top)}" width="${f1(W - 24)}" height="${f1(bot - top)}" rx="34" ${fill('color-mix(in oklab, var(--sim-accent) 6%, transparent)', 'stroke:var(--sim-accent);stroke-width:3.5;stroke-dasharray:12 8')}/></g>`;
      const lw = P ? 150 : 170;
      svg += `<g${anim('ew-pop', 0.4)}><rect x="${f1(W / 2 - lw / 2)}" y="${f1(top - 20)}" width="${lw}" height="40" rx="20" ${fill('var(--sim-accent)')}/>`
        + text(W / 2, top + 8, 'the economy', P ? 21 : 23, 'var(--sim-ink-on-accent, var(--sim-bg-deep))') + '</g>';
    }
    // Flows (b1, b2).
    const kicks = [];
    if (step >= 1) {
      this.paths(L).forEach((f, i) => {
        const F = FLOWS[i], col = `var(--sim-series-${F.tone})`, on = !this.flow || this.flow === f.id;
        const d = step === 1 && fr ? 0.3 + i * 0.55 : 0.05;
        let g = '';
        for (const [ax, ay, bx, by] of f.segs) {
          const len = Math.hypot(bx - ax, by - ay), ang = Math.atan2(by - ay, bx - ax), hl = 13;
          const ex = bx - Math.cos(ang) * hl * 0.7, ey = by - Math.sin(ang) * hl * 0.7;
          const p1 = `${f1(bx - hl * Math.cos(ang - 0.5))} ${f1(by - hl * Math.sin(ang - 0.5))}`, p2 = `${f1(bx - hl * Math.cos(ang + 0.5))} ${f1(by - hl * Math.sin(ang + 0.5))}`;
          g += `<line x1="${f1(ax)}" y1="${f1(ay)}" x2="${f1(ex)}" y2="${f1(ey)}"${fr && step === 1 ? ` class="ew-draw" style="--len:${f1(len)};--d:${f1(d)}s;` : ' style="'}stroke:${col};stroke-width:${on ? 5 : 3.5};stroke-linecap:round"/>`;
          g += `<g${anim('ew-in', d + 0.45)}><path d="M${f1(bx)} ${f1(by)}L${p1}L${p2}Z" ${fill(col)}/></g>`;
          if (on && !reduced()) {
            for (let k = 0; k < 2; k++) {
              g += `<circle r="${P ? 5 : 6}" opacity="0" ${fill(col, 'stroke:var(--sim-bg-surface);stroke-width:2')}>`
                + `<animateMotion path="M${f1(ax)} ${f1(ay)}L${f1(ex)} ${f1(ey)}" dur="1.6s" begin="indefinite" repeatCount="3" data-d="${f1(d + 0.6 + k * 0.8)}"/>`
                + `<animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.12;0.85;1" dur="1.6s" begin="indefinite" repeatCount="3" data-d="${f1(d + 0.6 + k * 0.8)}"/></circle>`;
            }
          }
        }
        const [lx, ly, la] = f.lab;
        g += `<g${anim('ew-in', d + 0.3)}>${text(lx, ly, f.id, L.ffs + 1, `color-mix(in oklab, ${col} 72%, var(--sim-label))`, ` text-anchor="${la}"`)}</g>`;
        svg += `<g style="opacity:${on ? 1 : 0.22}">${g}</g>`;
        if (on) kicks.push(1);
      });
    }
    // The four players.
    const pics = [
      (x, y, s) => icon('family', x, y, s, 1),
      (x, y, s) => civicSvg('factory', x, y + s / 2, { w: s * 1.12 }),
      (x, y, s) => civicSvg('parliament', x, y + s / 2, { w: s * 1.18 }),
      (x, y, s) => civicSvg('bank', x, y + s / 2, { w: s * 1.02 }),
    ];
    NODES.forEach((n, i) => {
      const x = L.cx[i % 2], y = L.cy[Math.floor(i / 2)], lit = !this.node || this.node === n.id;
      let g = pics[i](x, y, L.S);
      n.name.forEach((ln, k) => { g += text(x, y + L.S / 2 + (P ? 24 : 26) + k * (L.fs + 8), ln, L.fs); });
      if (this.node === n.id) g += `<rect x="${f1(x - L.S / 2 - 14)}" y="${f1(y - L.S / 2 - 12)}" width="${f1(L.S + 28)}" height="${f1(L.S + 24 + n.name.length * (L.fs + 8) + 12)}" rx="18" ${fill('none', 'stroke:var(--sim-accent);stroke-width:3')}/>`;
      svg += `<g${anim('ew-pop', 0.05 + i * 0.18)}><g style="opacity:${lit ? 1 : 0.35}">${g}</g></g>`;
      over += `<button type="button" class="ew-node sv-hit" data-act="node" data-val="${n.id}" aria-pressed="${this.node === n.id}" aria-label="${n.name.join(' ')}" style="left:${f1(x)}px;top:${f1(y + 10)}px;width:${f1(L.S + 24)}px;height:${f1(L.S + 40)}px"></button>`;
    });
    // Status line and flow chips.
    let say;
    if (this.node) say = NODES.find((n) => n.id === this.node).say;
    else if (this.flow) say = FLOWS.find((f) => f.id === this.flow).say;
    else say = step === 0 ? 'Tap a player to see what it does.' : step === 1 ? 'Money moves between them all the time.' : 'Together, all of this is the economy.';
    over += `<div class="ew-say" style="top:${L.say}px">${say}</div>`;
    if (step >= 1) {
      over += `<div class="ew-row" style="top:${L.chips}px">` + FLOWS.map((f) => `<button type="button" class="sv-hit ew-btn" data-act="flow" data-val="${f.id}" aria-pressed="${this.flow === f.id}" style="--c:var(--sim-series-${f.tone})">${f.id}</button>`).join('') + '</div>';
    }
    if (kicks.length) this.after(0.03, () => this.kick());
    return { svg, over: `<div class="${P ? 'ew-p' : 'ew-l'}">${over}</div>` };
  }

  /** Start the running dots (SMIL with begin="indefinite", so they start from now, not from page load). */
  kick() {
    this.root?.querySelectorAll?.('animateMotion[data-d], animate[data-d]').forEach((a) => {
      try { a.beginElementAt(Number(a.dataset.d) || 0); } catch (_) { /* no SMIL */ }
    });
  }

  testState() { return { step: this.stepIndex, node: this.node, flow: this.flow }; }
}
