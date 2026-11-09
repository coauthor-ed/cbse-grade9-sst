// SeaBasketScene - eight things, one at a time, and two baskets. Beat 0: the learner sorts; each answer is shown with
// its reason, and a wrong basket is corrected at once. Beat 1: the six that count, with reef and tide lit. Beat 2:
// the two that do not. Beats 1 and 2 come from the beat, never from what was pressed.
// Controls: data-act="in" and data-act="out" (the two baskets), data-act="next" after each answer, data-act="again" at the end.
import { SvgScene } from 'simulations/base/kit/SimSvg.js';
import { frame, SEA_COLOR_MAP, SEA_CSS, tx, seaTx, tag, panel, wrap, hit, sea, svgFish, svgCoral, svgSeaColumn, svgWaveLine, svgOilRig, skyRect, controlRow, rowBtn, bindActs, num, SEA_INK, WHITE } from '../L08/SeaDraw.js';

const one = (i) => [{ idx: i, dwellMs: null }];

const barrel = (x, y, k) => `<g transform="translate(${x} ${y}) scale(${k})"><rect x="-26" y="-68" width="52" height="68" rx="7" style="fill:${SEA_INK};stroke:${sea('inkSoft')};stroke-width:3"/><path d="M-26 -46H26M-26 -24H26" style="stroke:${sea('gold')};stroke-width:4"/><ellipse cx="0" cy="-68" rx="26" ry="7" style="fill:${sea('inkSoft')}"/></g>`;
const heap = (x, y, k) => { let s = `<g transform="translate(${x} ${y}) scale(${k})"><path d="M-74 0Q-36 -64 0 -66Q36 -64 74 0Z" style="fill:${sea('sand')};stroke:${sea('sandDark')};stroke-width:3"/>`; for (let i = 0; i < 9; i++) s += `<ellipse cx="${-46 + i * 12}" cy="${-8 - ((i * 7) % 20)}" rx="6" ry="4.5" style="fill:${sea('rockMid')};stroke:${sea('rockDark')};stroke-width:1.5"/>`; return s + '</g>'; };
const shell = (x, y, k) => `<g transform="translate(${x} ${y}) scale(${k})"><ellipse cx="0" cy="-8" rx="60" ry="42" style="fill:${WHITE};stroke:${sea('sandDark')};stroke-width:4"/><ellipse cx="-8" cy="-22" rx="34" ry="12" style="fill:${sea('gold')};opacity:0.4"/><path d="M-46 -2Q0 10 46 -2" style="fill:none;stroke:${SEA_INK};stroke-width:6;stroke-linecap:round"/>${[-30, -18, -6, 6, 18, 30].map((v) => `<path d="M${v} -3V10" style="stroke:${sea('sandDark')};stroke-width:3"/>`).join('')}</g>`;
const box = (x, y, k) => `<g transform="translate(${x} ${y}) scale(${k})"><rect x="-74" y="-70" width="148" height="70" rx="4" style="fill:var(--sim-series-6);stroke:${SEA_INK};stroke-width:3"/>${[-52, -30, -8, 14, 36, 56].map((v) => `<path d="M${v} -62V-8" style="stroke:${SEA_INK};stroke-width:3;opacity:0.35"/>`).join('')}</g>`;
const bottle = (x, y, k) => `<g transform="translate(${x} ${y}) scale(${k})"><path d="M-9 -96H9V-80Q24 -68 24 -48V-6Q24 0 18 0H-18Q-24 0 -24 -6V-48Q-24 -68 -9 -80Z" style="fill:color-mix(in oklab, ${sea('sea')} 50%, ${WHITE});stroke:${SEA_INK};stroke-width:3"/><rect x="-11" y="-104" width="22" height="10" rx="3" style="fill:var(--sim-series-1);stroke:${SEA_INK};stroke-width:2"/><rect x="-24" y="-44" width="48" height="20" style="fill:${WHITE};opacity:0.8"/></g>`;
const tide = (x, y, k) => `<g transform="translate(${x} ${y}) scale(${k})"><path d="M-84 -74Q-70 -82 -56 -74T-28 -74V4H-84Z" style="fill:${sea('seaMid')};stroke:${SEA_INK};stroke-width:3"/><path d="M28 -30Q44 -38 58 -30T86 -30V4H28Z" style="fill:${sea('seaMid')};stroke:${SEA_INK};stroke-width:3"/><path d="M-28 -104H28V4H-28Z" style="fill:${sea('rockMid')};stroke:${SEA_INK};stroke-width:3"/><rect x="-30" y="-44" width="60" height="30" rx="4" style="fill:${sea('seaDeep')};stroke:${SEA_INK};stroke-width:2.5"/><circle cx="0" cy="-29" r="11" style="fill:${sea('gold')};stroke:${SEA_INK};stroke-width:3"/><path d="M0 -40V-18M-11 -29H11" style="stroke:${SEA_INK};stroke-width:3"/></g>`;

const ITEMS = [
  { id: 'fish', name: 'Fish', yes: true, why: 'Fish are living marine resources.', art: (x, y) => svgFish(x, y - 44, 2.3, { kind: 0 }) },
  { id: 'box', name: 'A shipping container', yes: false, why: 'It was made on land and only rides on the sea.', art: (x, y) => box(x, y, 1) },
  { id: 'reef', name: 'A coral reef that visitors see', yes: true, why: 'It stays in place, yet it has real value.', art: (x, y) => svgCoral(x - 44, y, 1.3, { seed: 3 }) + svgCoral(x + 42, y, 1.1, { seed: 6 }) + svgFish(x + 6, y - 74, 0.7, { kind: 2 }) },
  { id: 'oil', name: 'Crude oil', yes: true, why: 'It lies under the sea bed and has economic value.', art: (x, y) => svgOilRig(x + 42, y, 0.62, { legs: 2 }) + barrel(x - 48, y, 1) },
  { id: 'bottle', name: 'A plastic bottle', yes: false, why: 'It was made on land, and in the sea it does harm.', art: (x, y) => bottle(x, y, 1.05) },
  { id: 'tide', name: 'Tidal energy', yes: true, why: 'The moving water can make electricity.', art: (x, y) => tide(x, y, 1) },
  { id: 'sand', name: 'Sand and gravel', yes: true, why: 'They are materials taken from the sea.', art: (x, y) => heap(x, y, 1.1) },
  { id: 'shell', name: 'A cowrie shell', yes: true, why: 'It comes from the sea and has long had value.', art: (x, y) => shell(x, y - 26, 1) },
];

export class SeaBasketScene extends SvgScene {
  static BEAT_STEP_MAP = [one(0), one(1), one(2)];
  static WIDTH = 680;
  static HEIGHT = 470;
  static PORTRAIT_WIDTH = 360;
  static PORTRAIT_HEIGHT = 590;
  static COLOR_MAP = SEA_COLOR_MAP;
  static ARIA_LABEL = 'Eight things to sort into two baskets: marine resource, or not. A marine resource is a material or feature of the ocean with intrinsic or economic value.';
  static CONTROLS = [];
  css() { return SEA_CSS; }
  stageHeight(st) { return st.portrait ? 490 : 400; }
  async setup() {
    this.i = 0; this.answer = null; this.right = 0; this.found = false;
    await super.setup();
    this.row = controlRow(this);
    this._off = bindActs(this, (a) => this.onPick(a));
    this.enter(this.stepIndex);
    this.repaint();
  }
  destroy() { this._off?.(); super.destroy(); }
  onPick(a) {
    if (a === 'in' || a === 'out') {
      if (this.answer || this.i >= ITEMS.length) return;
      const it = ITEMS[this.i], yes = a === 'in';
      this.answer = yes === it.yes ? 'right' : 'wrong';
      if (this.answer === 'right') this.right += 1;
    } else if (a === 'next') {
      this.i += 1; this.answer = null;
      if (this.i >= ITEMS.length) this.onSorted();
    } else if (a === 'again') { this.i = 0; this.answer = null; this.right = 0; }
    this._row();
  }
  onSorted() { if (this.found) return; this.found = true; this.celebrate(); }
  _row() {
    if (!this.row) return;
    const done = this.i >= ITEMS.length;
    this.row.innerHTML = this.stepIndex !== 0 ? '' : done ? rowBtn('Sort them again', 'again') : this.answer ? rowBtn(this.i === ITEMS.length - 1 ? 'Finish' : 'Next', 'next', { main: true }) : '';
    this.relayout?.();
  }
  enter() { this.i = 0; this.answer = null; this.right = 0; this._row(); this.relayout?.(); }
  _beach(st) {
    const W = st.W, H = st.H, sy = 60, g = H - 118;
    let s = skyRect('sbS', 0, 0, W, sy + 4, 0, 4) + svgSeaColumn(0, sy, 1, { w: W, h: g - sy + 12, bands: 2, wave: 3 }) + svgWaveLine(0, sy, 1, { w: W, amp: 3 });
    s += `<path d="M-6 ${g}Q${W * 0.3} ${g - 16} ${W * 0.6} ${g - 4}T${W + 6} ${g - 8}V${H + 6}H-6Z" style="fill:${sea('sand')};stroke:${sea('sandDark')};stroke-width:3"/>`;
    return { s, g };
  }
  _basket(x, y, w, h, label, count, col) {
    let s = `<path d="M${x} ${y}h${w}l-10 ${h}h-${w - 20}z" style="fill:${sea('sandDark')};stroke:${SEA_INK};stroke-width:3;stroke-linejoin:round"/>`;
    for (let i = 1; i < 5; i++) s += `<path d="M${num(x + i * w / 5)} ${y}L${num(x + 10 + i * (w - 20) / 5)} ${y + h}" style="stroke:${SEA_INK};stroke-width:2;opacity:0.4"/>`;
    s += `<rect x="${x - 4}" y="${y - 8}" width="${w + 8}" height="12" rx="6" style="fill:${col};stroke:${SEA_INK};stroke-width:2.5"/>`;
    s += tx(x + w / 2, y + h / 2 + 11, String(count), { size: 26, display: true, weight: 700, col: WHITE, halo: SEA_INK, haloW: 3 });
    s += tag(x + w / 2, y - 26, label, { size: 15 });
    return s;
  }
  _all(st, list, o = {}) {
    // all of a list laid out in a grid
    const W = st.W, cols = o.cols ?? (st.portrait ? 2 : 3), cw = W / cols, ch = o.ch ?? 136, top = o.top ?? 80;
    let s = '';
    list.forEach((it, i) => {
      const cx = cw * (i % cols) + cw / 2, cy = top + ch * Math.floor(i / cols) + ch - 44, k = st.portrait ? 0.62 : 0.6;
      s += `<g transform="translate(${num(cx)} ${num(cy)}) scale(${k})">${it.art(0, 0)}</g>`;
      s += tag(cx, cy + 24, it.name.replace(' that visitors see', '').replace('A ', '').replace('a ', ''), { size: 15, rim: o.lit?.includes(it.id) ? 'var(--sim-series-2)' : SEA_INK });
    });
    return s;
  }
  paint(st) {
    const W = st.W, H = st.H, P = st.portrait, step = this.stepIndex;
    const { s: back, g } = this._beach(st);
    let s = back, over = '';
    if (step === 0) {
      if (this.i >= ITEMS.length) {
        const cw = Math.min(W - 40, 360), ch = 110, cx = (W - cw) / 2, cy = 90;
        s += panel(cx, cy, cw, ch);
        s += tx(W / 2, cy + 42, `${this.right} of ${ITEMS.length} first time`, { size: 24, display: true, weight: 700 });
        s += tx(W / 2, cy + 76, 'Six are in, two are out', { size: 17, weight: 700 });
      } else {
        const it = ITEMS[this.i], base = g - 6;
        s += tag(W - 8, 24, `${this.i + 1} of ${ITEMS.length}`, { anchor: 'end', size: 15 });
        s += `<g class="sd-in">${it.art(W / 2, base)}</g>`;
        s += seaTx(W / 2, 42, it.name, { size: 20, display: true, weight: 700 });
        if (this.answer) {
          const cw = Math.min(W - 16, 460), lines = wrap(it.why, cw - 24, 16), ch = 44 + lines.length * 22, cy = 58, cx = (W - cw) / 2, ok = this.answer === 'right';
          s += panel(cx, cy, cw, ch, { rim: ok ? 'var(--sim-good)' : 'var(--sim-error)' });
          s += tx(W / 2, cy + 26, it.yes ? 'Marine resource' : 'Not a marine resource', { size: 18, display: true, weight: 700, col: ok ? 'var(--sim-good)' : 'var(--sim-error)' });
          lines.forEach((l, k) => { s += tx(W / 2, cy + 50 + k * 22, l, { size: 16, weight: 700 }); });
        }
      }
      const bw = P ? 132 : 170, by = H - 74, inC = ITEMS.slice(0, this.i + (this.answer ? 1 : 0)).filter((x) => x.yes).length, outC = ITEMS.slice(0, this.i + (this.answer ? 1 : 0)).filter((x) => !x.yes).length;
      s += this._basket(W * 0.27 - bw / 2, by, bw, 64, 'Marine resource', inC, 'var(--sim-series-3)');
      s += this._basket(W * 0.73 - bw / 2, by, bw, 64, 'Not a resource', outC, 'var(--sim-series-6)');
      if (!this.answer && this.i < ITEMS.length) {
        over += hit(W * 0.27 - bw / 2 - 6, by - 42, bw + 12, 112, 'in', 'Put it in the marine resource basket');
        over += hit(W * 0.73 - bw / 2 - 6, by - 42, bw + 12, 112, 'out', 'Put it in the not a resource basket');
      }
    } else if (step === 1) {
      s += seaTx(W / 2, 40, 'Marine resources', { size: 20, display: true, weight: 700 });
      s += this._all(st, ITEMS.filter((i) => i.yes), { ch: P ? 138 : 150, top: 56, lit: ['reef', 'tide'] });
    } else {
      s += seaTx(W / 2, 40, 'Not marine resources', { size: 20, display: true, weight: 700 });
      s += this._all(st, ITEMS.filter((i) => !i.yes), { cols: 2, ch: 250, top: 60 });
      s += tag(W / 2, H - 28, 'Made on land', { size: 17 });
    }
    return { svg: frame(st, s), over };
  }
}
